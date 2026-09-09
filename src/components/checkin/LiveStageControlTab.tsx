"use client";

import { useEffect, useState } from "react";
import {
  OFFICIAL_PROGRAM_SESSIONS,
  ProgramSessionItem,
} from "@/lib/programSessions";
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  RadioIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { playSuccessFeedback } from "@/lib/feedback";

export default function LiveStageControlTab() {
  const [activeSessionId, setActiveSessionId] = useState<string>("session-01");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuestions, setShowQuestions] = useState<boolean>(false);

  // Fetch current live session from API
  const fetchActiveSession = async () => {
    try {
      const res = await fetch("/api/program/active");
      if (res.ok) {
        const data = await res.json();
        if (data.activeSessionId) {
          setActiveSessionId(data.activeSessionId);
        }
      }
    } catch (e) {
      console.error("Failed to load active stage program:", e);
    }
  };

  // Fetch audience questions from API
  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions?sessionId=all");
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      }
    } catch (e) {
      console.error("Failed to load audience questions:", e);
    }
  };

  useEffect(() => {
    fetchActiveSession();
    fetchQuestions();
    const interval = setInterval(() => {
      fetchActiveSession();
      fetchQuestions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSetActive = async (session: ProgramSessionItem) => {
    if (activeSessionId === session.id) return;

    setIsUpdating(session.id);
    try {
      const res = await fetch("/api/program/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeSessionId: session.id,
          activeSessionTitle: session.shortTitle,
        }),
      });

      if (res.ok) {
        setActiveSessionId(session.id);
        if (typeof window !== "undefined") {
          localStorage.setItem("iesa_active_session", session.id);
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: "iesa_active_session",
              newValue: session.id,
            })
          );
        }
        playSuccessFeedback();
        setSavedNote(`Now Live on Stage: ${session.shortTitle}`);
        setTimeout(() => setSavedNote(null), 3500);
      }
    } catch (e) {
      console.error("Failed to update active stage session:", e);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleAnswered = async (questionId: string) => {
    try {
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId ? { ...q, answered: !q.answered } : q
        )
      );
      await fetch("/api/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action: "toggleAnswered" }),
      });
    } catch (e) {
      console.error("Failed to update question status:", e);
    }
  };

  // Calculate current, next, and previous sessions
  const currentIndex = OFFICIAL_PROGRAM_SESSIONS.findIndex(
    (s) => s.id === activeSessionId
  );
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentSession = OFFICIAL_PROGRAM_SESSIONS[safeIndex];
  const nextSession =
    safeIndex < OFFICIAL_PROGRAM_SESSIONS.length - 1
      ? OFFICIAL_PROGRAM_SESSIONS[safeIndex + 1]
      : null;
  const prevSession = safeIndex > 0 ? OFFICIAL_PROGRAM_SESSIONS[safeIndex - 1] : null;

  return (
    <div className="w-full max-w-xl mx-auto p-5 sm:p-6 rounded-3xl bg-[#02001e]/90 border border-white/15 backdrop-blur-xl shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <RadioIcon className="w-4 h-4 text-[#c6f552]" />
            <h3 className="text-base sm:text-lg font-bold font-serif-display text-white">
              Live Stage Program Controller
            </h3>
          </div>
          <p className="text-xs text-white/60">
            Control what is displayed on stage and in the public navbar in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchActiveSession();
            fetchQuestions();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white/80 transition-colors cursor-pointer"
          title="Refresh stage status"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      {savedNote && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#c6f552]/20 border border-[#c6f552]/40 text-[#c6f552] text-xs font-mono font-medium flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-[#c6f552]" />
          <span>{savedNote}</span>
        </div>
      )}

      {/* 1-Tap "Advance to Next Session" Stage Manager Banner */}
      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#040032] via-[#0a3825] to-[#040032] border-2 border-[#c6f552]/40 shadow-[0_0_20px_rgba(198,245,82,0.15)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c6f552] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c6f552] shadow-[0_0_8px_#c6f552]" />
            ON STAGE NOW (KAAF AUDITORIUM)
          </span>
          <span className="text-[11px] font-mono text-white/60">
            #{currentSession.orderNumber.toString().padStart(2, "0")} of {OFFICIAL_PROGRAM_SESSIONS.length}
          </span>
        </div>

        <h4 className="text-base sm:text-lg font-bold text-white truncate">
          {currentSession.shortTitle}
        </h4>
        <p className="text-xs text-white/70 mb-3 truncate">
          {currentSession.speaker ? `${currentSession.speaker} · ` : ""}
          {currentSession.duration} ({currentSession.category})
        </p>

        {/* 1-Tap Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          {prevSession && (
            <button
              type="button"
              disabled={isUpdating !== null}
              onClick={() => handleSetActive(prevSession)}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              title={`Previous: #${prevSession.orderNumber} ${prevSession.shortTitle}`}
            >
              ❮ Prev
            </button>
          )}

          {nextSession ? (
            <button
              type="button"
              disabled={isUpdating !== null}
              onClick={() => handleSetActive(nextSession)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(198,245,82,0.35)] disabled:opacity-50 cursor-pointer"
            >
              {isUpdating === nextSession.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#040032] border-t-transparent rounded-full animate-spin" />
                  <span>Advancing Stage...</span>
                </>
              ) : (
                <>
                  <span>Advance to Next Session ❯</span>
                  <span className="text-[11px] font-normal opacity-85 truncate max-w-[130px] sm:max-w-[180px] hidden xs:inline">
                    (#{nextSession.orderNumber} {nextSession.shortTitle})
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/50 font-mono">
              Final Session Concluded
            </div>
          )}
        </div>
      </div>

      {/* Audience Live Q&A Drawer */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowQuestions(!showQuestions)}
          className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-mono font-bold transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-white">
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-[#c6f552]" />
            <span>Audience Live Questions ({questions.length})</span>
          </div>
          <span className="text-[#c6f552] text-[11px]">
            {showQuestions ? "Hide Questions ▲" : "View Questions ▼"}
          </span>
        </button>

        {showQuestions && (
          <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1 p-2 rounded-xl bg-[#040032] border border-white/10">
            {questions.length === 0 ? (
              <p className="text-xs text-white/50 text-center py-4">
                No audience questions submitted yet.
              </p>
            ) : (
              questions.map((q) => (
                <div
                  key={q._id?.toString() || Math.random()}
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    q.answered
                      ? "bg-white/5 border-white/10 opacity-50"
                      : "bg-[#0a3825]/70 border-[#c6f552]/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                    <span className="font-bold text-[#c6f552]">
                      {q.attendeeName} ({q.department})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswered(q._id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      {q.answered ? "Mark Unanswered" : "✓ Mark Answered"}
                    </button>
                  </div>
                  <p className="text-white font-medium">{q.question}</p>
                  <div className="mt-1 text-[9px] font-mono text-white/40">
                    Target: {q.sessionTitle}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Manual Full Session Selector List */}
      <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
        {OFFICIAL_PROGRAM_SESSIONS.map((session) => {
          const isLive = activeSessionId === session.id;
          const loadingThis = isUpdating === session.id;

          return (
            <div
              key={session.id}
              onClick={() => handleSetActive(session)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isLive
                  ? "bg-[#c6f552]/15 border-[#c6f552] text-white shadow-[0_0_15px_rgba(198,245,82,0.2)]"
                  : "bg-[#040032] border-white/10 hover:border-white/25 hover:bg-white/5"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      isLive
                        ? "bg-[#c6f552] text-[#040032]"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    #{session.orderNumber.toString().padStart(2, "0")}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm truncate text-white">
                    {session.shortTitle}
                  </h4>
                </div>

                <div className="text-[11px] text-white/50 truncate mt-0.5">
                  {session.speaker ? `${session.speaker} · ` : ""}
                  {session.duration}
                </div>
              </div>

              <div>
                {loadingThis ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#c6f552] border-t-transparent animate-spin" />
                ) : isLive ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#c6f552] text-[#040032] flex items-center gap-1 shadow-sm whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#040032]" />
                    Live
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-white/60 bg-white/5 border border-white/10 hover:bg-white/15 transition-colors whitespace-nowrap">
                    Set Live
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
