"use client";

import { useEffect } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Speaker } from "./SpeakersSection";

interface SpeakerModalProps {
  speaker: Speaker | null;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, onClose }: SpeakerModalProps) {
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

  if (!speaker) return null;

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen z-[9999] flex items-center justify-center p-4 bg-[#040032]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#faf8f2] text-[#040032] border-2 border-[#040032] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#ece7d8] border border-[#040032]/20 text-[#040032] hover:bg-[#040032] hover:text-[#faf8f2] transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#040032] flex-shrink-0 bg-[#ece7d8]">
            <Image
              src={speaker.image}
              alt={speaker.name}
              fill
              className="object-cover object-top"
            />
          </div>

          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-meta font-extrabold uppercase border border-[#040032] ${speaker.badgeColor}`}>
              {speaker.role}
            </span>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#040032] mt-1">
              {speaker.name}
            </h3>
            <p className="text-xs font-mono-meta font-extrabold text-[#0a3825]">
              {speaker.title} · {speaker.organization}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#ece7d8]/60 rounded-xl border border-[#040032]/10 space-y-1">
          <span className="text-[10px] font-mono-meta uppercase font-bold text-[#040032]/60">SESSION / TOPIC</span>
          <p className="text-xs sm:text-sm font-serif-display font-bold text-[#040032]">
            "{speaker.topic}"
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono-meta font-bold text-[#0a3825] uppercase tracking-wider block">
            BIOGRAPHY & CREDENTIALS
          </span>
          <p className="text-xs sm:text-sm text-[#040032]/80 font-sans leading-relaxed">
            {speaker.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
