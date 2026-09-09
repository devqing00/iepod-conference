"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  QrCodeIcon,
  UserPlusIcon,
  RadioIcon,
  ArrowLeftIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import VerificationCard, { CheckinResult } from "@/components/checkin/VerificationCard";
import AttendeeRegisterTab from "@/components/checkin/AttendeeRegisterTab";
import PaidDelegateTab from "@/components/checkin/PaidDelegateTab";
import LiveStageControlTab from "@/components/checkin/LiveStageControlTab";
import { AttendanceStats } from "@/components/checkin/AttendanceDashboard";
import {
  playSuccessFeedback,
  playDuplicateFeedback,
  playErrorFeedback,
  playInvalidFormatFeedback,
  isAudioMuted,
  setAudioMuted,
} from "@/lib/feedback";

type Mode = "register" | "paid" | "stage";

export default function CheckinTerminalPage() {
  const [mode, setMode] = useState<Mode>("register");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  useEffect(() => {
    setIsMuted(isAudioMuted());
  }, []);


  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

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

  // Process QR code scan for Paid Delegates
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

  // Process Manual Check-in for Paid Delegates
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

  // Reset to continue
  const handleReset = useCallback(() => {
    setResult(null);
    setIsVerifying(false);
  }, []);

  // Keyboard shortcut: Spacebar resets view
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

  // Help Guide Accordion Sections
  const helpSections = [
    {
      id: "desks",
      title: "1. Three-Desk Operational Workflow",
      icon: "🏢",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>The reception is divided into specialized terminals:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-[#3fffe8]">Register Desk:</strong> General attendees & students arriving without pre-paid ticket packages. Issues the <em>Regular Delegate Tag</em>.
            </li>
            <li>
              <strong className="text-[#c6f552]">Paid VIP Desk:</strong> Delegates who purchased conference ticket packages. Issues the <em>Special Paid Delegate Tag (VIP)</em> with package perks.
            </li>
            <li>
              <strong className="text-emerald-400">Live Stage Desk:</strong> MC & coordinator stage sync and attendee Q&A moderation.
            </li>
            <li>
              <strong className="text-white">Live Certificates:</strong> Checking in at either desk activates the attendee&apos;s credentials on the certificate generation portal.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "register-desk",
      title: "2. Attendee Registration (Smart Dropdown)",
      icon: "👤",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Quick lookup and registration for non-ticketed attendees:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">Smart Dropdown:</strong> Start typing a matric number (e.g. <code className="text-[#3fffe8]">2315</code>) or student name in the search box. A list of matching students appears automatically.
            </li>
            <li>
              <strong className="text-white">1-Click Auto-Fill:</strong> Tap any student in the dropdown to instantly fill their name, matriculation number, department, and level.
            </li>
            <li>
              <strong className="text-white">External Attendees:</strong> For guests from other faculties, universities, or industry partners, manually type their details in the fields.
            </li>
            <li>
              Click <strong className="text-[#3fffe8]">Register & Issue Regular Tag</strong>. Duplicate submissions are automatically caught and flagged.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "paid-desk",
      title: "3. Paid VIP Delegates (QR Scan & 48 Roster)",
      icon: "🎟️",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Fast verification of paid attendees:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">Camera QR Scanner (Fastest):</strong> Delegate presents their ticket QR code on mobile. Point ticket at camera for sub-second verification.
            </li>
            <li>
              <strong className="text-white">Official Paid Directory (48 Delegates):</strong> Click the <span className="text-[#3fffe8]">Paid List</span> button to view all 48 paid delegates. Filter by name/matric and tap <span className="text-[#c6f552] font-bold">Check In</span> for 1-tap gate admission.
            </li>
            <li>
              <strong className="text-white">Search Fallback:</strong> Toggle the search drawer to look up paid attendees by matric number or name if camera is unavailable.
            </li>
            <li>
              Issues the <strong className="text-[#c6f552]">Special Paid Delegate Tag (VIP)</strong>.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "stage-desk",
      title: "4. Live Stage Control & Audience Q&A",
      icon: "📺",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Stage synchronization and audience interaction:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">Program Agenda:</strong> Switch between talks, keynotes, and defenses. Click <em>Set Active</em> to broadcast current stage activity to all attendees.
            </li>
            <li>
              <strong className="text-white">Audience Q&A:</strong> Live feed of delegate questions. Approve or feature top questions for panel speakers to answer.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "audio-stats",
      title: "5. Audio Feedback & Top Controls",
      icon: "🔔",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Auditory confirmation and top utility bar:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-[#c6f552]">Success (High Chime):</strong> Delegate checked in and admitted.
            </li>
            <li>
              <strong className="text-amber-400">Duplicate (Double Warning):</strong> Ticket already signed in.
            </li>
            <li>
              <strong className="text-rose-400">Error (Low Buzz):</strong> Unpaid ticket, wrong event, or invalid format.
            </li>
            <li>
              <strong className="text-white">Top Bar:</strong> Shimmering counter shows total attendees on site. Use the speaker icon to mute sounds, refresh icon to sync count, and help icon to reopen this modal.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#040032] text-white flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Ambience Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#3fffe8]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#c6f552]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sleek Minimal Header Bar with Live Incrementing Counter & Help Modal Trigger */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3 mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/15 transition-all hover:bg-white/15"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {/* Minimal Live Counter Pill with Diagonal Shimmer */}
        <div className="flex items-center gap-2">
          <div className="relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#02001e] border border-white/20 text-xs font-mono shadow-sm">
            {/* Diagonal Shimmer Effect (Left to Right) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-diagonal-shimmer" />
            </div>

            <span className="w-2 h-2 rounded-full bg-[#c6f552] relative z-10" />
            <span className="text-white/80 relative z-10">Checked In:</span>
            <span className="text-[#c6f552] font-bold text-sm relative z-10">
              {stats?.checkedInCount ?? 0}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? "Unmute feedback sounds" : "Mute feedback sounds"}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-white/10 text-white/70 border-white/15 hover:text-white"
            }`}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-3.5 h-3.5" />
            ) : (
              <SpeakerWaveIcon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={fetchStats}
            title="Refresh count"
            className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white border border-white/15 transition-all cursor-pointer"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            title="Admin Desk Guide & Operations"
            className="p-1.5 rounded-full bg-white/10 text-[#3fffe8] hover:text-white border border-white/15 hover:border-[#3fffe8]/40 hover:bg-[#3fffe8]/15 transition-all cursor-pointer"
          >
            <QuestionMarkCircleIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Terminal Container */}
      <div className="w-full max-w-2xl mx-auto space-y-4 flex-1 flex flex-col justify-center">
        {/* Mode Segmented Tab Switcher (3 Tabs) */}
        {!result && (
          <div className="w-full max-w-lg mx-auto grid grid-cols-3 p-1 rounded-2xl bg-[#02001e] border border-white/15 shadow-md">
            {/* Tab 1: Attendee Registration (Regular) */}
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`relative overflow-hidden py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#3fffe8] text-[#040032] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {mode === "register" && <div className="shimmer-sweep" />}
              <UserPlusIcon className="w-4 h-4 relative z-10" />
              <span className="truncate relative z-10">Register</span>
            </button>

            {/* Tab 2: Paid Delegates (VIP) */}
            <button
              type="button"
              onClick={() => setMode("paid")}
              className={`relative overflow-hidden py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "paid"
                  ? "bg-[#c6f552] text-[#040032] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {mode === "paid" && <div className="shimmer-sweep" />}
              <QrCodeIcon className="w-4 h-4 relative z-10" />
              <span className="truncate relative z-10">Paid VIP</span>
            </button>

            {/* Tab 3: Live Stage */}
            <button
              type="button"
              onClick={() => setMode("stage")}
              className={`relative overflow-hidden py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "stage"
                  ? "bg-white text-[#040032] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {mode === "stage" && <div className="shimmer-sweep" />}
              <RadioIcon className="w-4 h-4 text-emerald-500 relative z-10" />
              <span className="truncate relative z-10">Live Stage</span>
            </button>
          </div>
        )}

        {/* Viewport: Result Card OR Active Tab View */}
        <div className="w-full flex items-center justify-center">
          {result ? (
            <VerificationCard
              result={result}
              onReset={handleReset}
              autoResetSeconds={4}
            />
          ) : mode === "register" ? (
            <AttendeeRegisterTab
              onRegisterSuccess={(data) => {
                setResult(data);
                triggerResultFeedback(data);
                if (data.status === "SUCCESS") {
                  fetchStats();
                }
              }}
              isLoading={isVerifying}
            />
          ) : mode === "paid" ? (
            <PaidDelegateTab
              onScanSuccess={handleScanSuccess}
              onManualCheckin={handleManualCheckin}
              isVerifying={isVerifying}
              hasResult={!!result}
              stats={stats}
              onRefreshStats={fetchStats}
            />
          ) : (
            <LiveStageControlTab />
          )}
        </div>
      </div>

      {/* Help & Operations Guide Modal (Accordion Style) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#02001e] border-2 border-white/15 rounded-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3fffe8]/20 border border-[#3fffe8]/40 flex items-center justify-center text-[#3fffe8]">
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    Terminal Operations Guide
                  </h4>
                  <p className="text-[11px] text-white/60">
                    IESA Process Day 2026 · Desk Navigation & Procedures
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Accordion Content Area (Scrollable to prevent height overflow) */}
            <div className="mt-3.5 overflow-y-auto pr-1 space-y-2 flex-1">
              {helpSections.map((sec, idx) => {
                const isOpen = openAccordion === idx;
                return (
                  <div
                    key={sec.id}
                    className="border border-white/10 rounded-2xl bg-[#040032]/80 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? null : idx)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer gap-2"
                    >
                      <span className="font-semibold text-xs text-white flex items-center gap-2">
                        <span>{sec.icon}</span>
                        <span>{sec.title}</span>
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-white/60 transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180 text-[#3fffe8]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1.5 border-t border-white/10 text-xs">
                        {sec.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/40 font-mono">
                Click any section above to expand
              </span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-6 text-center text-xs font-mono text-white/40">
        <span>IESA Process Day 2026 · University of Ibadan</span>
      </footer>
    </main>
  );
}
