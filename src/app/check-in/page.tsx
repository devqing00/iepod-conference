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
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckCircleIcon,
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

  // Confirmatory Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

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

  // Reset all checked-in records in database (with confirmation)
  const handleResetCheckins = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/check-in/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset check-ins");
      }
      playSuccessFeedback();
      setShowResetModal(false);
      setResetNotice(
        `Attendance roster cleared (${data.deletedCount} records deleted). Count is now 0.`
      );
      setTimeout(() => setResetNotice(null), 5000);
      await fetchStats();
    } catch (err: any) {
      playErrorFeedback();
      alert(err?.message || "Failed to reset check-ins.");
    } finally {
      setIsResetting(false);
    }
  };

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showHelpModal || showResetModal) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [showHelpModal, showResetModal]);

  // Help Guide Accordion Sections (Updated Admin Desk Guide)
  const helpSections = [
    {
      id: "desks",
      title: "1. Three-Desk Operational Architecture",
      icon: "🏢",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>The reception and stage management are divided into three synchronized desks:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-[#3fffe8]">Register Desk:</strong> General attendees, departmental students, and university guests arriving without pre-paid tickets. Issues the <em>Regular Delegate Tag</em>.
            </li>
            <li>
              <strong className="text-[#c6f552]">Paid VIP Desk:</strong> Delegates with verified conference ticket packages. Features camera QR scanning, manual matric lookup, and the official 53-delegate VIP Roster. Issues the <em>Special Paid VIP Tag</em> with meal &amp; perks entitlement.
            </li>
            <li>
              <strong className="text-emerald-400">Live Stage &amp; Certificate Desk:</strong> Stage manager controller for the 32 ungrouped program sessions, live Q&amp;A moderation, and the master <em>Certificate Release Switch</em>.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "register-desk",
      title: "2. Attendee Registration (Zero-Discrimination Policy)",
      icon: "👤",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>
            <strong className="text-[#3fffe8]">Open to All:</strong> Regular admission has zero barrier to entry. Every student from any department (Petroleum, Mechanical, Arts, Pharmacy, etc.), external university, alumnus, or corporate guest can be registered immediately.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">Universal Search (188 Form Delegates + Students):</strong> Search by surname, first name, email, or phone number to auto-suggest and 1-click fill attendees from either the official Google Form pre-registration list or the university database.
            </li>
            <li>
              <strong className="text-[#3fffe8]">Regular List Directory Modal:</strong> Tap the <span className="text-[#c6f552] font-bold">Regular List (188)</span> link on the top counter pill to open the full directory of pre-registered attendees. Features instant live search and a <span className="text-[#3fffe8] font-bold">1-Tap Register</span> button to admit delegates on the spot!
            </li>
            <li>
              <strong className="text-white">Matric Number is Optional:</strong> External delegates, visitors, and non-matriculated guests do not need a matric number. The terminal automatically generates a unique conference tag ID (<code className="text-[#3fffe8]">REG-2026-XXXX</code>) so no one is ever blocked.
            </li>
            <li>
              <strong className="text-white">All Departments &amp; Institutions:</strong> Department, Institution, and Category inputs accommodate any school, faculty, or affiliation.
            </li>
            <li>
              Tap <strong className="text-[#3fffe8]">Register &amp; Issue Regular Tag</strong>. Issues the official regular tag and activates conference credentials on the spot.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "paid-desk",
      title: "3. Paid VIP Delegates (QR Scanner & 53-Seat VIP Roster)",
      icon: "🎟️",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>High-speed admission for delegates with confirmed payment packages:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">Camera QR Scanner (Fastest):</strong> Delegate presents digital ticket QR code. Point camera at code for sub-second verification.
            </li>
            <li>
              <strong className="text-white">Official Paid VIP Roster:</strong> Click the <span className="text-[#3fffe8] font-bold">Paid List</span> button to view the full directory of 53 paid VIP delegates. Search by name or matriculation number and tap <span className="text-[#c6f552] font-bold">Check In</span> for 1-tap admission.
            </li>
            <li>
              <strong className="text-white">Manual Lookup Fallback:</strong> Use the search drawer to look up paid attendees by matric number or email if ticket QR cannot be scanned.
            </li>
            <li>
              Issues the <strong className="text-[#c6f552]">Special Paid Delegate Tag (VIP)</strong> granting access to reserved seating, meals, and package benefits.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "stage-desk",
      title: "4. Live Stage Control (32 Ungrouped Sessions)",
      icon: "📺",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Complete control of the conference proceedings and audience experience:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">32 Distinct Sessions:</strong> All 32 program items (from Opening Formalities, Keynote Address, 3 Concurrent Workshop Tracks, Annual Debate, 8 Hackathon Pitches, to Paper Presentations and Closing Protocols) remain individually listed so coordinators know exactly what is on stage.
            </li>
            <li>
              <strong className="text-white">Duration-Only Display:</strong> In accordance with stage protocol, items display designated duration (e.g. 5 mins, 25 mins, 55 mins) rather than rigid clock times to adapt naturally to stage flow.
            </li>
            <li>
              <strong className="text-white">1-Tap Stage Advancement:</strong> Tap the big green <strong className="text-[#c6f552]">Next Session</strong> button to transition the live program. All attendee screens, the navbar live ticker, and the schedule highlight update simultaneously.
            </li>
            <li>
              <strong className="text-white">Manual Override:</strong> Tap any session in the list to immediately set it as the live program.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "cert-release",
      title: "5. Certificate Portal Release & Access Control",
      icon: "🎓",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Strict credential withholding policy until program conclusion:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-amber-300">Locked During Proceedings:</strong> By default, the Certificate Portal (<code className="text-[#3fffe8]">/certificate</code>) is locked. Delegates attempting to access it are informed that credentials will unlock after closing protocols.
            </li>
            <li>
              <strong className="text-white">Stage Coordinator Release:</strong> Under the <em>Live Stage tab</em>, use the <strong>Certificate Portal Release</strong> card. Tap <strong className="text-[#c6f552]">Release Certificates</strong> when the closing remarks conclude.
            </li>
            <li>
              <strong className="text-white">Delegate Issuance:</strong> Once unlocked, delegates input their matric number or ticket reference on <code className="text-[#3fffe8]">/certificate</code> to generate, inspect, and download their high-resolution verified PDF/PNG.
            </li>
            <li>
              <strong className="text-white">Admin Preview:</strong> Coordinators can preview the certificate generator anytime without unlocking it for delegates using the <code className="text-[#c6f552]">?admin=true</code> URL override.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "qa-stream",
      title: "6. Audience Live Q&A Stream & Moderation",
      icon: "💬",
      content: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>Real-time questions submitted by delegates in KAAF Auditorium:</p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-white/70">
            <li>
              <strong className="text-white">Question Feed:</strong> Real-time incoming questions submitted via the audience <em>Ask Stage</em> button, indicating attendee name, affiliation, and target session.
            </li>
            <li>
              <strong className="text-white">Moderation Filters:</strong> Switch between <em>Unanswered</em>, <em>Answered</em>, and <em>All</em> questions.
            </li>
            <li>
              <strong className="text-white">Mark As Handled:</strong> Tap <em>Mark Done</em> when a question is read to the speaker or addressed on stage.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "audio-stats",
      title: "7. Audio Feedback & Top Controls",
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
              <strong className="text-white">Top Bar:</strong> Real-time counter shows total delegates on site. Use the speaker icon to mute sounds, refresh icon to sync count, reset icon (undo arrow) to clear the checked-in list via confirmation modal, and help icon to reopen this modal anytime.
            </li>
            <li>
              <strong className="text-rose-300">Reset Checked-In Count:</strong> The red undo button opens a secure confirmation modal allowing administrators to clear all current check-ins and reset count back to 0 without affecting payment records.
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
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3 mb-3">
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
            title="Sync/refresh count from database"
            className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white border border-white/15 transition-all cursor-pointer"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            title="Reset Checked-In Count (Clear Roster)"
            className="p-1.5 rounded-full bg-white/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-white/15 hover:border-rose-500/40 transition-all cursor-pointer shadow-sm"
          >
            <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
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

      {/* Optional Reset Feedback Banner */}
      {resetNotice && (
        <div className="w-full max-w-2xl mx-auto p-2.5 px-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between gap-2 animate-fade-in shadow-lg mb-3">
          <div className="flex items-center gap-2 truncate">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{resetNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setResetNotice(null)}
            className="p-1 text-white/60 hover:text-white cursor-pointer shrink-0"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-full lg:max-w-lg bg-[#02001e] border-2 border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh]">
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

      {/* Confirmatory Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-full lg:max-w-md bg-[#02001e] border-2 border-rose-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-[0_20px_60px_rgba(244,63,94,0.25)] flex flex-col space-y-4 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Reset Checked-In List?</h4>
                  <p className="text-[11px] text-white/60 font-mono">Clear Conference Attendance Records</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Current Count Callout */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
              <span className="text-xs text-rose-200/90 font-mono">Current Checked-In:</span>
              <span className="text-lg font-mono font-extrabold text-rose-400">
                {stats?.checkedInCount ?? 0} attendees
              </span>
            </div>

            {/* Warnings */}
            <div className="space-y-2 text-xs text-white/80 leading-relaxed">
              <p className="text-rose-300 font-semibold">
                Are you sure you want to clear all checked-in attendees?
              </p>
              <ul className="space-y-1.5 text-white/70 text-[11px] bg-white/5 p-3 rounded-2xl border border-white/10">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>The checked-in counter will immediately reset back to <strong>0</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>All Paid VIP delegates will return to <em>Pending</em> status on the roster.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3fffe8] font-bold">✓</span>
                  <span>Student accounts and payment records in the database remain completely safe.</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetCheckins}
                disabled={isResetting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>Confirm &amp; Reset</span>
                  </>
                )}
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
