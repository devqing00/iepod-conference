"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/solid";
import { OFFICIAL_PROGRAM_SESSIONS } from "@/lib/programSessions";

interface AskStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSession: {
    id: string;
    orderNumber: number;
    shortTitle: string;
  } | null;
}

export default function AskStageModal({
  isOpen,
  onClose,
  activeSession,
}: AskStageModalProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    activeSession?.id || "session-02"
  );
  const [attendeeName, setAttendeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Sync selected session when activeSession changes or modal opens
  useEffect(() => {
    if (activeSession?.id) {
      setSelectedSessionId(activeSession.id);
    }
  }, [activeSession?.id, isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const targetSession =
    OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === selectedSessionId) ||
    OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === activeSession?.id) ||
    OFFICIAL_PROGRAM_SESSIONS[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || question.trim().length < 4) {
      setErrorMsg("Please enter a question with at least 4 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: targetSession.id,
          sessionTitle: targetSession.shortTitle,
          attendeeName: attendeeName.trim() || "Audience Member",
          department: department.trim() || "KAAF Auditorium",
          question: question.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit question");
      }

      setIsSuccess(true);
      setQuestion("");
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-full lg:max-w-lg max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#02001e] border border-white/20 p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white"
        style={{
          boxShadow:
            "0 0 35px rgba(0, 229, 255, 0.15), 0 0 20px rgba(198, 245, 82, 0.1)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2 pr-8">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#c6f552]/20 border border-[#c6f552]/40 flex items-center justify-center text-[#c6f552] flex-shrink-0">
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif-display text-white">
              Ask a Question to the Stage
            </h3>
            <p className="text-[11px] sm:text-xs text-white/60">
              Live Q&A stream for moderators & speakers in KAAF Auditorium
            </p>
          </div>
        </div>

        {/* Target Session Selector (No pulsing dot, attendee selectable) */}
        <div className="my-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="target-session-picker"
              className="text-[11px] font-mono font-bold text-[#c6f552] uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Target Program Session</span>
            </label>
            {activeSession && selectedSessionId === activeSession.id && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0a3825] border border-[#c6f552]/40 text-[#c6f552] font-bold">
                Live Now on Stage
              </span>
            )}
          </div>
          <div className="relative">
            <select
              id="target-session-picker"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-2xl bg-[#0a3825]/90 border border-[#c6f552]/40 text-white text-xs font-sans focus:outline-none focus:border-[#c6f552] focus:ring-1 focus:ring-[#c6f552] cursor-pointer"
            >
              {OFFICIAL_PROGRAM_SESSIONS.map((session) => {
                const isLive = activeSession && session.id === activeSession.id;
                return (
                  <option
                    key={session.id}
                    value={session.id}
                    className="bg-[#02001e] text-white py-1"
                  >
                    #{session.orderNumber.toString().padStart(2, "0")} · {session.shortTitle} · {session.duration}
                    {session.speaker ? ` (${session.speaker.split("(")[0].trim()})` : ""}
                    {isLive ? " ★ [LIVE NOW]" : ""}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#c6f552]">
              <ChevronUpDownIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-white/50 font-sans">
            Select the session or speaker you want to address your question to.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#c6f552]/20 border border-[#c6f552] flex items-center justify-center text-[#c6f552] shadow-[0_0_20px_rgba(198,245,82,0.3)]">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#c6f552]">
              Question Transmitted to Stage!
            </h4>
            <p className="text-xs text-white/70 max-w-xs">
              Your question has been sent directly to the stage coordinator and moderator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Bolu Adeleke"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#c6f552]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                  Affiliation / Level (Optional)
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. IPE 400L / Guest"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#c6f552]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-white/70 uppercase tracking-wider">
                  Your Question <span className="text-[#c6f552]">*</span>
                </label>
                <span className="text-[10px] font-mono text-white/40">
                  {question.length}/300
                </span>
              </div>
              <textarea
                value={question}
                maxLength={300}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Ask the speaker or panellists anything regarding their presentation..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#c6f552] resize-none"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-mono">{errorMsg}</p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white/10 text-xs font-medium text-white/80 hover:bg-white/15 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full bg-[#c6f552] text-[#040032] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#b5e640] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,245,82,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#040032] border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-3.5 h-3.5" />
                    <span>Send to Stage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
