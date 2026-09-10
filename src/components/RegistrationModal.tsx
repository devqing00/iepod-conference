"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, ArrowUpRightIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#040032]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#faf8f2] text-[#040032] border-2 border-[#040032] rounded-2xl sm:rounded-3xl w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-full lg:max-w-lg max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-full bg-[#ece7d8] border border-[#040032]/20 text-[#040032] hover:bg-[#040032] hover:text-[#faf8f2] transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <span className="px-2.5 py-0.5 bg-[#c6f552] text-[#040032] rounded-full text-[10px] sm:text-xs font-mono-meta font-extrabold uppercase border border-[#040032]">
            FREE DELEGATE PASS // 2026 EDITION
          </span>
          <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#040032] pt-1">
            Secure Your Seat
          </h3>
          <p className="text-xs sm:text-sm text-[#040032]/75 font-sans leading-relaxed">
            The Annual IESA Conference: <i>"The future is not simply what we wait for, it is what we choose to build."</i>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Main Google Form Register Link */}
          <a
            href="https://forms.gle/fKxtUgFzoEJQz3iP6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-extrabold text-xs sm:text-sm p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-[#040032] transition-all active:scale-[0.98] group shadow-md"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <CheckCircleIcon className="w-5 h-5 text-[#040032] flex-shrink-0" />
              <div className="text-left">
                <div className="font-mono-meta uppercase tracking-wider text-[10px] sm:text-xs">OFFICIAL DELEGATE FORM</div>
                <div className="font-serif-display text-sm sm:text-base">Complete Registration Form</div>
              </div>
            </div>
            <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
          </a>

          {/* Official WhatsApp Community Link */}
          <a
            href="https://chat.whatsapp.com/G2p8sAbGUxWIas4caTZWdY?s=cl&p=a&ilr=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#0a3825] hover:bg-[#082e1e] text-[#faf8f2] font-extrabold text-xs sm:text-sm p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-[#0a3825] transition-all active:scale-[0.98] group shadow-md"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#c6f552] flex-shrink-0" />
              <div className="text-left">
                <div className="font-mono-meta uppercase tracking-wider text-[10px] sm:text-xs text-[#c6f552]">OFFICIAL NETWORK</div>
                <div className="font-serif-display text-sm sm:text-base text-[#faf8f2]">Join WhatsApp Community</div>
              </div>
            </div>
            <ArrowUpRightIcon className="w-4 h-4 text-[#c6f552] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
          </a>
        </div>

        {/* Footer info */}
        <div className="pt-1 text-center text-[10px] font-mono-meta text-[#040032]/60">
          KAAF AUDITORIUM, UNIVERSITY OF IBADAN · 10TH SEP 2026
        </div>
      </div>
    </div>,
    document.body
  );
}
