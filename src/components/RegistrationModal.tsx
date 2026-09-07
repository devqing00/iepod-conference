"use client";

import { useEffect } from "react";
import { XMarkIcon, ArrowUpRightIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen z-[9999] flex items-center justify-center p-4 bg-[#040032]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#faf8f2] text-[#040032] border-2 border-[#040032] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#ece7d8] border border-[#040032]/20 text-[#040032] hover:bg-[#040032] hover:text-[#faf8f2] transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <span className="px-3 py-1 bg-[#c6f552] text-[#040032] rounded-full text-xs font-mono-meta font-extrabold uppercase border border-[#040032]">
            FREE DELEGATE PASS // 2026 EDITION
          </span>
          <h3 className="font-serif-display text-3xl font-bold text-[#040032] pt-2">
            Secure Your Seat
          </h3>
          <p className="text-xs sm:text-sm text-[#040032]/75 font-sans leading-relaxed">
            The 6th Annual IESA Process Day: <i>"The future is not simply what we wait for, it is what we choose to build."</i>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-2">
          {/* Main Google Form Register Link */}
          <a
            href="https://forms.gle/fKxtUgFzoEJQz3iP6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-extrabold text-sm px-6 py-4 rounded-2xl border-2 border-[#040032] transition-all active:scale-[0.98] group shadow-md"
          >
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-[#040032]" />
              <div className="text-left">
                <div className="font-mono-meta uppercase tracking-wider text-xs">OFFICIAL DELEGATE FORM</div>
                <div className="font-serif-display text-base">Complete Registration Form</div>
              </div>
            </div>
            <ArrowUpRightIcon className="w-5 h-5 text-[#040032] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>

          {/* Official WhatsApp Community Link */}
          <a
            href="https://chat.whatsapp.com/G2p8sAbGUxWIas4caTZWdY?s=cl&p=a&ilr=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#0a3825] hover:bg-[#082e1e] text-[#faf8f2] font-extrabold text-sm px-6 py-4 rounded-2xl border-2 border-[#0a3825] transition-all active:scale-[0.98] group shadow-md"
          >
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#c6f552]" />
              <div className="text-left">
                <div className="font-mono-meta uppercase tracking-wider text-xs text-[#c6f552]">OFFICIAL NETWORK</div>
                <div className="font-serif-display text-base text-[#faf8f2]">Join WhatsApp Community</div>
              </div>
            </div>
            <ArrowUpRightIcon className="w-5 h-5 text-[#c6f552] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] font-mono-meta text-[#040032]/60">
          KAAF AUDITORIUM, UNIVERSITY OF IBADAN · 10TH SEP 2026
        </div>
      </div>
    </div>
  );
}
