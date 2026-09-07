"use client";

import { useState, useEffect } from "react";
import { SparklesIcon, ArrowPathIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export default function AiProcessSimulator() {
  const [isOrganized, setIsOrganized] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsOrganized((prev) => !prev);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      step: "STEP 01",
      title: "Raw Input Stream",
      tag: "CHAOTIC DATA",
      color: "border-amber-400/40 bg-amber-400/10 text-amber-300",
      // Custom SVG Illustration 1: Unorganized Chaotic Data
      svg: (
        <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16M4 12h10M4 18h14" strokeDasharray="3 3" />
          <circle cx="18" cy="12" r="2" fill="currentColor" />
          <path d="M7 3l3 3-3 3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      step: "STEP 02",
      title: "SCADA Threat Filter",
      tag: "AI SCANNED",
      color: "border-[#3fffe8]/40 bg-[#3fffe8]/10 text-[#3fffe8]",
      // Custom SVG Illustration 2: SCADA Laser Radar Shield
      svg: (
        <svg className="w-8 h-8 text-[#3fffe8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      step: "STEP 03",
      title: "Bottleneck Model",
      tag: "OPTIMIZED",
      color: "border-[#c6f552]/40 bg-[#c6f552]/10 text-[#c6f552]",
      // Custom SVG Illustration 3: Neural Microchip Neural Processor
      svg: (
        <svg className="w-8 h-8 text-[#c6f552]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 1" strokeLinecap="round" />
          <path d="M15 1" strokeLinecap="round" />
          <path d="M9 23" strokeLinecap="round" />
          <path d="M15 23" strokeLinecap="round" />
          <path d="M1 9" strokeLinecap="round" />
          <path d="M1 15" strokeLinecap="round" />
          <path d="M23 9" strokeLinecap="round" />
          <path d="M23 15" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      step: "STEP 04",
      title: "Yield Output",
      tag: "STRUCTURED",
      color: "border-[#c6f552] bg-[#c6f552] text-[#040032]",
      // Custom SVG Illustration 4: High Yield Pipeline Output
      svg: (
        <svg className="w-8 h-8 text-[#c6f552]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full bg-[#02001a] border-2 border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[#faf8f2]">
      {/* Simulator Header Box */}
      <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6 font-mono-meta text-xs">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-serif-display text-base font-bold text-[#faf8f2]">
              Process Engineering AI Lab
            </h4>
            <p className="text-[10px] text-white/60">
              Visualizing how AI machine learning structures chaotic, unorganized factory data into a streamlined, high-yield workflow.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOrganized(!isOrganized)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta font-extrabold text-xs transition-all active:scale-[0.98] whitespace-nowrap shadow-lg"
        >
          <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-[#040032]" />
          <span>{isOrganized ? "UNORGANIZED PROCESS DATA" : "STRUCTURE WITH AI"}</span>
        </button>
      </div>

      {/* 4 Steps Vector Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative min-h-[160px] items-center">
        {steps.map((item, idx) => {
          const scatterRotations = ["-rotate-3 translate-y-2", "rotate-3 -translate-y-2", "-rotate-2 translate-y-3", "rotate-2 -translate-y-1"];

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border-2 transition-all duration-700 ease-out flex flex-col justify-between space-y-4 relative ${
                isOrganized
                  ? "rotate-0 translate-y-0 shadow-xl border-[#c6f552] bg-white/10"
                  : `${scatterRotations[idx % scatterRotations.length]} border-white/15 bg-white/5`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-meta text-[11px] font-bold text-white/50">{item.step}</span>
                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                  {item.svg}
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-serif-display font-bold text-sm text-[#faf8f2]">
                  {item.title}
                </h5>
                <span className={`text-[9px] font-mono-meta font-extrabold px-2.5 py-0.5 rounded-full inline-block uppercase border ${
                  isOrganized ? "border-[#c6f552] text-[#040032] bg-[#c6f552]" : item.color
                }`}>
                  {isOrganized ? "STRUCTURED" : item.tag}
                </span>
              </div>

              {/* Connecting Flow Arrow */}
              {isOrganized && idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-[#040032] p-1 rounded-full border border-[#c6f552]">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-[#c6f552]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-meta">
        <span className="flex items-center gap-2 text-white/70">
          <span className={`w-2.5 h-2.5 rounded-full ${isOrganized ? "bg-[#c6f552] animate-ping" : "bg-amber-400"}`} />
          STATUS: {isOrganized ? "OPTIMIZED HIGH-YIELD WORKFLOW ACTIVE" : "AWAITING AI STRUCTURING..."}
        </span>
        <span className="text-[#3fffe8] font-bold">IESA CORE ENGINE</span>
      </div>
    </div>
  );
}
