"use client";

import Link from "next/link";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

interface VerifyActionButtonsProps {
  linkedInUrl?: string;
  certificateId: string;
  name: string;
  matricNumber?: string;
}

export default function VerifyActionButtons({
  linkedInUrl,
  certificateId,
  name,
  matricNumber,
}: VerifyActionButtonsProps) {
  const handleLinkedInClick = () => {
    fetch("/api/certificate/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        certificateId,
        action: "linkedin",
        studentName: name,
        matricNumber,
      }),
    }).catch((err) => console.warn("Track linkedin error:", err));
  };

  return (
    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-white/10 w-full">
      {linkedInUrl && (
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkedInClick}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0077b5] hover:bg-[#006097] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
          </svg>
          <span>Add Credential to LinkedIn</span>
        </a>
      )}

      <Link
        href={`/certificate?id=${certificateId}`}
        className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(198,245,82,0.3)] cursor-pointer active:scale-95"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        <span>View &amp; Download High-Res Certificate</span>
      </Link>
    </div>
  );
}
