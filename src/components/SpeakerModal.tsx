"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Speaker } from "./SpeakersSection";

interface SpeakerModalProps {
  speaker: Speaker | null;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, onClose }: SpeakerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (speaker) {
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
  }, [speaker]);

  if (!speaker || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#040032]/80 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-[94vw] sm:w-[92vw] md:w-[88vw] lg:w-full lg:max-w-2xl bg-[#faf8f2] text-[#040032] border-2 border-[#040032] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh]"
      >
        {/* Sticky Modal Top Bar for Mobile & Desktop */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3.5 bg-[#ece7d8] border-b border-[#040032]/15 flex-shrink-0">
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono-meta font-extrabold text-[#0a3825] uppercase tracking-wider">
            {speaker.workshopTrack ? "FACILITATOR PROFILE & WORKSHOP" : "SPEAKER BIOGRAPHY & TALK"}
          </span>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full bg-[#faf8f2] border border-[#040032]/20 text-[#040032] hover:bg-[#040032] hover:text-[#faf8f2] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 overscroll-contain">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#040032] flex-shrink-0 bg-[#ece7d8]">
              <Image
                src={speaker.image}
                alt={speaker.name}
                fill
                className="object-cover object-top"
              />
            </div>

            <div className="min-w-0">
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono-meta font-extrabold uppercase border border-[#040032] inline-block mb-1 ${speaker.badgeColor}`}>
                {speaker.role}
              </span>
              <h3 className="font-serif-display text-base sm:text-lg lg:text-xl font-bold text-[#040032] leading-tight">
                {speaker.name}
              </h3>
              <p className="text-[11px] sm:text-xs font-mono-meta font-extrabold text-[#0a3825] truncate">
                {speaker.title} · {speaker.organization}
              </p>
            </div>
          </div>

          {speaker.topic ? (
            <div className="p-3 sm:p-3.5 bg-[#ece7d8]/60 rounded-xl border border-[#040032]/10 space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-mono-meta uppercase font-bold text-[#040032]/60">KEYNOTE TOPIC</span>
              <p className="text-xs sm:text-sm font-serif-display font-bold text-[#040032]">
                "{speaker.topic}"
              </p>
            </div>
          ) : speaker.workshopTrack ? (
            <div className="p-3 sm:p-3.5 bg-[#ece7d8]/60 rounded-xl border border-[#0a3825]/20 space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-mono-meta uppercase font-bold text-[#0a3825]">HANDS-ON WORKSHOP TRACK</span>
              <p className="text-xs sm:text-sm font-serif-display font-bold text-[#040032]">
                {speaker.workshopTrack}
              </p>
            </div>
          ) : null}

          <div className="space-y-2 sm:space-y-2.5">
            <span className="text-[11px] sm:text-xs font-mono-meta font-bold text-[#0a3825] uppercase tracking-wider block">
              {speaker.topic ? "BIOGRAPHY & CREDENTIALS" : "FACILITATOR PROFILE & BACKGROUND"}
            </span>
            <div className="text-xs sm:text-sm text-[#040032]/85 font-sans leading-relaxed space-y-2.5 sm:space-y-3">
              {speaker.bio.split("\n\n").map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
