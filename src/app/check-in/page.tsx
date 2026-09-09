"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  QrCodeIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import QrScannerViewfinder from "@/components/checkin/QrScannerViewfinder";
import VerificationCard, { CheckinResult } from "@/components/checkin/VerificationCard";
import ManualLookupTab from "@/components/checkin/ManualLookupTab";
import AttendanceDashboard, {
  AttendanceStats,
} from "@/components/checkin/AttendanceDashboard";
import {
  playSuccessFeedback,
  playDuplicateFeedback,
  playErrorFeedback,
  playInvalidFormatFeedback,
} from "@/lib/feedback";

type Mode = "scan" | "lookup";

export default function CheckinTerminalPage() {
  const [mode, setMode] = useState<Mode>("scan");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  // Fetch live stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/check-in/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch check-in stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 15000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  // Dispatch audio and haptic feedback based on result
  const triggerResultFeedback = (res: CheckinResult) => {
    switch (res.status) {
      case "SUCCESS":
        playSuccessFeedback();
        break;
      case "ALREADY_CHECKED_IN":
        playDuplicateFeedback();
        break;
      case "UNPAID":
      case "UNAUTHORIZED":
      case "NOT_FOUND":
        playErrorFeedback();
        break;
      case "INVALID_FORMAT":
      case "ERROR":
      default:
        playInvalidFormatFeedback();
        break;
    }
  };

  // Process QR code scan
  const handleScanSuccess = async (qrPayload: string) => {
    if (isVerifying || result) return;
    setIsVerifying(true);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData: qrPayload,
          operator: "Gate Coordinator",
        }),
      });

      const data: CheckinResult = await res.json();
      setResult(data);
      triggerResultFeedback(data);

      if (data.status === "SUCCESS") {
        fetchStats();
      }
    } catch (err: any) {
      const errorResult: CheckinResult = {
        status: "ERROR",
        title: "Connection Error",
        message: err?.message || "Check network connection and try again.",
      };
      setResult(errorResult);
      playErrorFeedback();
    } finally {
      setIsVerifying(false);
    }
  };

  // Process Manual Check-in Submit
  const handleManualCheckin = async (lookupData: {
    matricNumber?: string;
    email?: string;
    studentId?: string;
  }) => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lookupData,
          operator: "Gate Coordinator",
        }),
      });

      const data: CheckinResult = await res.json();
      setResult(data);
      triggerResultFeedback(data);

      if (data.status === "SUCCESS") {
        fetchStats();
      }
    } catch (err: any) {
      const errorResult: CheckinResult = {
        status: "ERROR",
        title: "Connection Error",
        message: err?.message || "Check network connection and try again.",
      };
      setResult(errorResult);
      playErrorFeedback();
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset to continue scanning
  const handleReset = useCallback(() => {
    setResult(null);
    setIsVerifying(false);
  }, []);

  // Keyboard shortcut: Spacebar resets scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && result) {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result, handleReset]);

  return (
    <main className="min-h-screen bg-[#040032] text-[#faf8f2] flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-x-hidden selection:bg-[#c6f552] selection:text-[#040032]">
      {/* Background Ambience Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#3fffe8]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#c6f552]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/70 hover:text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/15 transition-all hover:bg-white/15"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        <span className="text-xs text-[#c6f552] font-mono font-medium">
          KAAF Auditorium
        </span>
      </header>

      {/* Main Terminal Container */}
      <div className="w-full max-w-2xl mx-auto space-y-4 flex-1 flex flex-col justify-center">
        {/* Live Attendance Stats Header Banner */}
        <AttendanceDashboard
          stats={stats}
          onRefreshStats={fetchStats}
          onManualCheckinFromRoster={async (studentId) => {
            await handleManualCheckin({ studentId });
          }}
        />

        {/* Mode Segmented Tab Switcher */}
        {!result && (
          <div className="w-full max-w-md mx-auto grid grid-cols-2 p-1 rounded-2xl bg-[#02001e] border border-white/15 shadow-md">
            <button
              type="button"
              onClick={() => setMode("scan")}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === "scan"
                  ? "bg-[#c6f552] text-[#040032] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("lookup")}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === "lookup"
                  ? "bg-[#3fffe8] text-[#040032] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Manual Search</span>
            </button>
          </div>
        )}

        {/* Viewport: Verification Result OR Scanner / Lookup Tab */}
        <div className="w-full flex items-center justify-center">
          {result ? (
            <VerificationCard
              result={result}
              onReset={handleReset}
              autoResetSeconds={3}
            />
          ) : mode === "scan" ? (
            <div className="w-full space-y-3">
              <QrScannerViewfinder
                onScanSuccess={handleScanSuccess}
                isPaused={isVerifying || !!result}
              />
              {isVerifying && (
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#c6f552] border-t-transparent animate-spin" />
                    Checking ticket...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <ManualLookupTab
              onCheckinSubmit={handleManualCheckin}
              isLoading={isVerifying}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-6 text-center text-xs font-mono text-white/40">
        <span>IESA Process Day 2026</span>
      </footer>
    </main>
  );
}
