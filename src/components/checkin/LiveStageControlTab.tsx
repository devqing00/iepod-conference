"use client";

import { useEffect, useState } from "react";
import {
  OFFICIAL_PROGRAM_SESSIONS,
  ProgramSessionItem,
} from "@/lib/programSessions";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  RadioIcon,
  ChatBubbleBottomCenterTextIcon,
  PlayCircleIcon,
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { playSuccessFeedback } from "@/lib/feedback";

type StageSubTab = "controller" | "questions";

export default function LiveStageControlTab() {
  const [subTab, setSubTab] = useState<StageSubTab>("controller");
  const [activeSessionId, setActiveSessionId] = useState<string>("session-01");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionFilter, setQuestionFilter] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Certificate Portal Release Control State (Admin toggle)
  const [isCertUnlocked, setIsCertUnlocked] = useState<boolean>(false);
  const [isTogglingCert, setIsTogglingCert] = useState<boolean>(false);

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

  // Fetch certificate access status from API
  const fetchCertificateAccess = async () => {
    try {
      const res = await fetch("/api/certificate/access", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsCertUnlocked(Boolean(data.isUnlocked));
      }
    } catch (e) {
      console.error("Failed to load certificate access state:", e);
    }
  };

  // Toggle certificate release status (unlock after program)
  const handleToggleCertificateAccess = async () => {
    setIsTogglingCert(true);
    try {
      const nextState = !isCertUnlocked;
      const res = await fetch("/api/certificate/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUnlocked: nextState }),
      });
      if (res.ok) {
        setIsCertUnlocked(nextState);
        playSuccessFeedback();
        setSavedNote(
          nextState
            ? "Certificate Portal is now UNLOCKED for delegates!"
            : "Certificate Portal is now LOCKED until program concludes."
        );
        setTimeout(() => setSavedNote(null), 3500);
      }
    } catch (e) {
      console.error("Failed to update certificate access:", e);
    } finally {
      setIsTogglingCert(false);
    }
  };

  // Fetch audience questions from API
  const fetchQuestions = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/questions?sessionId=all");
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      }
    } catch (e) {
      console.error("Failed to load audience questions:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
    fetchQuestions();
    fetchCertificateAccess();
    const interval = setInterval(() => {
      fetchActiveSession();
      fetchQuestions();
      fetchCertificateAccess();
    }, 8000);
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
        setTimeout(() => setSavedNote(null), 3000);
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

  const unansweredCount = questions.filter((q) => !q.answered).length;

  const filteredQuestions = questions.filter((q) => {
    if (questionFilter === "unanswered") return !q.answered;
    if (questionFilter === "answered") return q.answered;
    return true;
  });

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 rounded-3xl bg-[#02001e]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-white space-y-4">
      {/* Sub-Tab Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#040032] border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => setSubTab("controller")}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === "controller"
              ? "bg-[#c6f552] text-[#040032] shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          <RadioIcon className="w-4 h-4" />
          <span>Stage Program</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("questions")}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === "questions"
              ? "bg-[#3fffe8] text-[#040032] shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
          <span>Live Q&amp;A</span>
          {unansweredCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              subTab === "questions" ? "bg-[#040032] text-[#3fffe8]" : "bg-[#3fffe8] text-[#040032]"
            }`}>
              {unansweredCount}
            </span>
          )}
        </button>
      </div>

      {savedNote && (
        <div className="p-2.5 rounded-xl bg-[#c6f552]/20 border border-[#c6f552]/40 text-[#c6f552] text-xs font-mono font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircleIcon className="w-4 h-4 text-[#c6f552] shrink-0" />
          <span>{savedNote}</span>
        </div>
      )}

      {/* SUB-TAB 1: LIVE STAGE PROGRAM CONTROLLER */}
      {subTab === "controller" && (
        <div className="space-y-4 animate-fade-in">
          {/* Admin Certificate Access & Release Control Card */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
              isCertUnlocked
                ? "bg-gradient-to-r from-[#040032] via-[#0b3820] to-[#040032] border-[#c6f552]/60 shadow-[0_0_20px_rgba(198,245,82,0.2)]"
                : "bg-[#040032] border-white/15"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCertUnlocked
                      ? "bg-[#c6f552]/20 text-[#c6f552]"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  <AcademicCapIcon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>Certificate Portal Access</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isCertUnlocked
                          ? "bg-[#c6f552] text-[#040032]"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {isCertUnlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </h5>
                </div>
              </div>

              <button
                type="button"
                disabled={isTogglingCert}
                onClick={handleToggleCertificateAccess}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                  isCertUnlocked
                    ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40"
                    : "bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] shadow-[0_0_12px_rgba(198,245,82,0.3)]"
                }`}
              >
                {isTogglingCert ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : isCertUnlocked ? (
                  <>
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    <span>Lock Portal</span>
                  </>
                ) : (
                  <>
                    <LockOpenIcon className="w-3.5 h-3.5" />
                    <span>Release Certificates</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              {isCertUnlocked ? (
                <span className="text-[#c6f552]">
                  ✦ Portal is UNLOCKED. All delegates can now look up matric numbers / ticket codes and download official certificates.
                </span>
              ) : (
                <span>
                  Certificates remain withheld from delegates until after the program. Unlock here when closing protocols conclude.
                </span>
              )}
            </p>
          </div>

          {/* 1-Tap "Advance to Next Session" Stage Manager Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#040032] via-[#0a3825] to-[#040032] border-2 border-[#c6f552]/40 shadow-[0_0_20px_rgba(198,245,82,0.15)]">
            <div className="flex items-center justify-between mb-2">
              <span className="relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c6f552]/20 border border-[#c6f552]/50 text-[10px] font-mono font-bold uppercase tracking-wider text-[#c6f552]">
                <div className="shimmer-sweep" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#c6f552] shadow-[0_0_6px_#c6f552] relative z-10" />
                <span className="relative z-10">ON STAGE NOW</span>
              </span>
              <span className="text-[11px] font-mono text-white/60">
                #{currentSession.orderNumber.toString().padStart(2, "0")} of {OFFICIAL_PROGRAM_SESSIONS.length}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white truncate">
              {currentSession.shortTitle}
            </h4>
            <p className="text-xs text-white/70 mb-3 truncate flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-[#3fffe8]" />
              <span className="text-[#3fffe8] font-mono mr-1">{currentSession.duration}</span>
              {currentSession.speaker ? (
                <>
                  <span>·</span>
                  <span className="truncate">{currentSession.speaker}</span>
                </>
              ) : (
                <>
                  <span>·</span>
                  <span className="text-white/60">{currentSession.category}</span>
                </>
              )}
            </p>

            {/* 1-Tap Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              {prevSession && (
                <button
                  type="button"
                  disabled={isUpdating !== null}
                  onClick={() => handleSetActive(prevSession)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  ❮ Prev
                </button>
              )}

              {nextSession ? (
                <button
                  type="button"
                  disabled={isUpdating !== null}
                  onClick={() => handleSetActive(nextSession)}
                  className="relative overflow-hidden flex-1 px-4 py-2.5 rounded-xl bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(198,245,82,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  <div className="shimmer-sweep" />
                  {isUpdating === nextSession.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#040032] border-t-transparent rounded-full animate-spin relative z-10" />
                      <span className="relative z-10">Advancing...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircleIcon className="w-4 h-4 text-[#040032] relative z-10" />
                      <span className="relative z-10">Next: {nextSession.shortTitle}</span>
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

          {/* Full Session Selector List */}
          <div className="space-y-1.5 max-h-[42vh] overflow-y-auto pr-1">
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

                    <div className="text-[11px] text-white/50 truncate mt-0.5 flex items-center gap-1.5">
                      <ClockIcon className="w-3 h-3 text-[#3fffe8]" />
                      <span className="text-[#3fffe8] font-mono">{session.duration}</span>
                      {session.speaker ? (
                        <>
                          <span>·</span>
                          <span className="truncate">{session.speaker}</span>
                        </>
                      ) : (
                        <>
                          <span>·</span>
                          <span className="text-white/40">{session.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {loadingThis ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#c6f552] border-t-transparent animate-spin" />
                    ) : isLive ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#c6f552] text-[#040032] flex items-center gap-1 shadow-sm whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#040032]" />
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-[10px] font-mono text-white/60 bg-white/5 border border-white/10 hover:bg-white/15 transition-colors whitespace-nowrap">
                        Set Live
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIENCE LIVE QUESTIONS */}
      {subTab === "questions" && (
        <div className="space-y-3 animate-fade-in">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-[#040032] p-1 rounded-xl border border-white/10 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setQuestionFilter("unanswered")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  questionFilter === "unanswered"
                    ? "bg-[#3fffe8] text-[#040032] font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Unanswered ({unansweredCount})
              </button>
              <button
                type="button"
                onClick={() => setQuestionFilter("answered")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  questionFilter === "answered"
                    ? "bg-[#3fffe8] text-[#040032] font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Answered ({questions.length - unansweredCount})
              </button>
              <button
                type="button"
                onClick={() => setQuestionFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  questionFilter === "all"
                    ? "bg-[#3fffe8] text-[#040032] font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                All ({questions.length})
              </button>
            </div>

            <button
              type="button"
              onClick={fetchQuestions}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Questions"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-10 bg-[#040032]/60 rounded-2xl border border-white/5">
                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/50 font-mono">
                  {questionFilter === "unanswered"
                    ? "No pending questions from the audience."
                    : "No questions match this filter."}
                </p>
              </div>
            ) : (
              filteredQuestions.map((q) => (
                <div
                  key={q._id?.toString() || Math.random()}
                  className={`p-3 rounded-2xl border text-xs transition-all space-y-2 ${
                    q.answered
                      ? "bg-white/5 border-white/10 opacity-60"
                      : "bg-[#040032] border-[#3fffe8]/30 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#3fffe8] truncate">
                      {q.attendeeName} · <span className="text-white/60 font-normal">{q.department || "Delegate"}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleAnswered(q._id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        q.answered
                          ? "bg-white/10 hover:bg-white/20 text-white/70"
                          : "bg-[#c6f552] text-[#040032] hover:bg-[#b5e640]"
                      }`}
                    >
                      <CheckIcon className="w-3 h-3" />
                      <span>{q.answered ? "Answered" : "Mark Done"}</span>
                    </button>
                  </div>

                  <p className="text-white text-sm leading-relaxed font-medium">
                    &ldquo;{q.question}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
                    <span>Target: {q.sessionTitle || "General"}</span>
                    <span>{new Date(q.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
