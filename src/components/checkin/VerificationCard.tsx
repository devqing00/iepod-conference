"use client";

import { useEffect, useState, useRef } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

export interface CheckinResult {
  status:
    | "SUCCESS"
    | "ALREADY_CHECKED_IN"
    | "UNPAID"
    | "INVALID_FORMAT"
    | "NOT_FOUND"
    | "UNAUTHORIZED"
    | "ERROR";
  tagType?: "paid_vip" | "regular";
  code?: string;
  title?: string;
  message?: string;
  raw?: string;
  existingRecord?: {
    checkedInAt: string | Date;
    checkedInBy?: string;
    method?: string;
  };
  checkIn?: {
    checkedInAt: string | Date;
    checkedInBy?: string;
    method?: string;
  };
  student?: {
    id?: string;
    name: string;
    matricNumber: string;
    email: string;
    level?: string;
    department?: string;
    institution?: string;
  };
}

interface VerificationCardProps {
  result: CheckinResult;
  onReset: () => void;
  autoResetSeconds?: number;
}

export default function VerificationCard({
  result,
  onReset,
  autoResetSeconds = 3,
}: VerificationCardProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(autoResetSeconds);
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  // Safe auto-resume countdown: timer runs completely outside state updater
  useEffect(() => {
    setSecondsRemaining(autoResetSeconds);

    const timer = setTimeout(() => {
      onResetRef.current();
    }, autoResetSeconds * 1000);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [result, autoResetSeconds]);

  const isSuccess = result.status === "SUCCESS";
  const isDuplicate = result.status === "ALREADY_CHECKED_IN";
  const isUnpaid =
    result.status === "UNPAID" ||
    result.status === "UNAUTHORIZED" ||
    result.status === "NOT_FOUND";
  const isInvalidFormat =
    result.status === "INVALID_FORMAT" || result.status === "ERROR";

  const student = result.student;
  const isPaidVip = result.tagType === "paid_vip";

  const formatTimestamp = (dateVal?: string | Date) => {
    if (!dateVal) return "Just now";
    try {
      const d = new Date(dateVal);
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-[#02001e]/95 backdrop-blur-xl border border-white/15 shadow-2xl text-white">
      {/* 1. SUCCESS / VERIFIED ATTENDEE */}
      {isSuccess && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
            isPaidVip
              ? "bg-[#c6f552]/15 border-[#c6f552]"
              : "bg-[#3fffe8]/15 border-[#3fffe8]"
          }`}>
            <CheckCircleIcon className={`w-10 h-10 ${isPaidVip ? "text-[#c6f552]" : "text-[#3fffe8]"}`} />
          </div>

          <div>
            {isPaidVip ? (
              <span className="relative overflow-hidden inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#c6f552]/20 border border-[#c6f552] text-[#c6f552] text-[11px] font-mono font-bold mb-2 shadow-sm">
                <div className="shimmer-sweep" />
                <span className="relative z-10">⭐ SPECIAL PAID DELEGATE TAG (VIP)</span>
              </span>
            ) : (
              <span className="relative overflow-hidden inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#3fffe8]/20 border border-[#3fffe8] text-[#3fffe8] text-[11px] font-mono font-bold mb-2 shadow-sm">
                <div className="shimmer-sweep" />
                <span className="relative z-10">🏷️ REGULAR DELEGATE TAG (STANDARD)</span>
              </span>
            )}
            <h2 className="text-2xl font-bold font-serif-display text-white">
              {student?.name || "Attendee"}
            </h2>
          </div>

          <div className="w-full bg-[#040032] border border-white/10 rounded-2xl p-4 text-left space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Matric Number</span>
              <span className="font-mono font-bold text-white">
                {student?.matricNumber || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Department</span>
              <span className="text-white/90 text-xs truncate max-w-[200px]">
                {student?.department || "Industrial & Production Engineering"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Credential</span>
              <span className="text-xs text-[#c6f552] font-mono font-medium">
                ✓ Ready for Certificate
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <span className="text-white/60 text-xs">Time</span>
              <span className="font-mono text-xs text-white/80">
                {formatTimestamp(result.checkIn?.checkedInAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className={`relative overflow-hidden w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-sm ${
              isPaidVip
                ? "bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032]"
                : "bg-[#3fffe8] hover:bg-[#32ebd5] text-[#040032]"
            }`}
          >
            <div className="shimmer-sweep" />
            <span className="relative z-10">Next Attendee in {secondsRemaining}s ❯</span>
          </button>
        </div>
      )}

      {/* 2. DUPLICATE / ALREADY CHECKED IN */}
      {isDuplicate && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-400 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-amber-400" />
          </div>

          <div>
            <span className="text-xs font-mono font-medium text-amber-300 tracking-wide block mb-1">
              Duplicate Ticket
            </span>
            <h2 className="text-2xl font-bold font-serif-display text-white">
              Already Checked In
            </h2>
          </div>

          <div className="w-full bg-[#040032] border border-amber-500/30 rounded-2xl p-4 text-left space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Attendee</span>
              <span className="font-medium text-white">{student?.name || "Attendee"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Matric Number</span>
              <span className="font-mono text-white">{student?.matricNumber || "—"}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <span className="text-white/60 text-xs">First Signed In</span>
              <span className="font-mono text-xs text-amber-300 font-semibold">
                {formatTimestamp(result.existingRecord?.checkedInAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#040032] font-bold text-sm transition-all active:scale-98 cursor-pointer"
          >
            <span>Continue ({secondsRemaining}s)</span>
          </button>
        </div>
      )}

      {/* 3. UNPAID / NOT FOUND */}
      {isUnpaid && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500 flex items-center justify-center">
            <XCircleIcon className="w-10 h-10 text-red-400" />
          </div>

          <div>
            <span className="text-xs font-mono font-medium text-red-400 tracking-wide block mb-1">
              Payment Not Verified
            </span>
            <h2 className="text-2xl font-bold font-serif-display text-white">
              Ticket Not Cleared
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-xs">
              {result.message || "This attendee is not on the verified list."}
            </p>
          </div>

          {student && student.name && (
            <div className="w-full bg-[#040032] border border-white/10 rounded-2xl p-3 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-white/60">Name:</span>
                <span className="text-white font-medium">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Matric:</span>
                <span className="font-mono text-white">{student.matricNumber}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all active:scale-98 cursor-pointer"
          >
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 4. INVALID FORMAT */}
      {isInvalidFormat && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-10 h-10 text-slate-400" />
          </div>

          <div>
            <span className="text-xs font-mono font-medium text-slate-400 tracking-wide block mb-1">
              Invalid Code
            </span>
            <h2 className="text-2xl font-bold font-serif-display text-white">
              Unrecognized Ticket
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-xs">
              This QR code does not match an IESA Process Day ticket.
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all active:scale-98 cursor-pointer"
          >
            <span>Scan Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
