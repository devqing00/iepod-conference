"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

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
  const [attendeeName, setAttendeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  if (!isOpen) return null;

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
          sessionId: activeSession?.id || "general",
          sessionTitle: activeSession?.shortTitle || "Live Session",
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#02001e] border border-white/20 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden"
        style={{
          boxShadow:
            "0 0 35px rgba(0, 229, 255, 0.15), 0 0 20px rgba(198, 245, 82, 0.1)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#c6f552]/20 border border-[#c6f552]/40 flex items-center justify-center text-[#c6f552]">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif-display text-white">
              Ask a Question to the Stage
            </h3>
            <p className="text-xs text-white/60">
              Live Q&A stream for moderators & speakers in KAAF Auditorium
            </p>
          </div>
        </div>

        {/* Active Session Ribbon */}
        {activeSession && (
          <div className="my-3.5 p-2.5 rounded-2xl bg-[#0a3825]/90 border border-[#c6f552]/30 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#c6f552] shadow-[0_0_6px_#c6f552] flex-shrink-0" />
            <span className="font-mono font-bold text-[#c6f552] uppercase">
              LIVE SESSION #{activeSession.orderNumber.toString().padStart(2, "0")}:
            </span>
            <span className="truncate text-white font-medium">
              {activeSession.shortTitle}
            </span>
          </div>
        )}

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
    </div>
  );
}
