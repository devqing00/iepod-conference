"use client";

import { useState, useEffect, useRef } from "react";
import { CpuChipIcon, ShieldCheckIcon, AcademicCapIcon } from "@heroicons/react/24/solid";

export default function InteractiveProcessTab() {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<boolean[]>([false, false, false]);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isManualRef = useRef(false);

  const tabs = [
    {
      id: "process-ai",
      title: "AI in Engineering",
      icon: CpuChipIcon,
      subItems: ["+DATA ANALYTICS", "+PROCESS AUTOMATION", "+MACHINE LEARNING"],
      headline: "Optimizing Industrial Systems with Artificial Intelligence",
      description: "Learn how artificial intelligence is transforming manufacturing and process optimization.",
      mockupBg: "bg-[#040032]",
      mockupBadge: "AI APPLICATIONS",
      mockupStats: [
        { label: "Throughput Rate", val: "+24.8%" },
        { label: "Cycle Delay", val: "-18.2%" },
      ],
    },
    {
      id: "scada-cybersecurity",
      title: "Industrial Cybersecurity",
      icon: ShieldCheckIcon,
      subItems: ["+SYSTEMS PROTECTION", "+CYBER AWARENESS", "+NETWORK SAFETY"],
      headline: "Defending Automated Manufacturing Infrastructure",
      description: "Facilitated by Emmanuel Tavershima (CEO, Cyvant). Masterclass on protecting industrial control systems, automated SCADA networks, and smart factory hardware.",
      mockupBg: "bg-[#0a3825]",
      mockupBadge: "CYBERSECURITY",
      mockupStats: [
        { label: "SCADA Threat Shield", val: "100% Active" },
        { label: "Network Latency", val: "0.2ms" },
      ],
    },
    {
      id: "academic-leadership",
      title: "Academic & VC Leadership",
      icon: AcademicCapIcon,
      subItems: ["+VC KEYNOTE ADDRESS", "+ALUMNI MENTORSHIP", "+DELEGATE CERTIFICATE"],
      headline: "Building Practical Engineering Leaders",
      description: "Keynote insights from Prof. Kayode Oyebode Adebowale (VC, UI) and career speed-mentoring with prominent UI Industrial Engineering alumni.",
      mockupBg: "bg-[#040032]",
      mockupBadge: "UI VC KEYNOTE PASS",
      mockupStats: [
        { label: "Expected Delegates", val: "500+" },
        { label: "Academic Impact", val: "150+ Papers" },
      ],
    },
  ];

  // 100% Bulletproof RAF Timer (18 seconds total, 6 seconds per tab)
  useEffect(() => {
    if (isManualRef.current) return;

    const TAB_DURATION = 6000; // 6000ms per tab
    const TOTAL_DURATION = TAB_DURATION * 3; // 18000ms total

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= TOTAL_DURATION) {
        // All 3 tabs finished reading to 100%!
        setActiveTab(2);
        setProgress(100);
        setCompletedTabs([true, true, true]);
        return; // Stop animation loop permanently
      }

      // Calculate exact current tab index (0, 1, or 2)
      const currentTabIndex = Math.min(2, Math.floor(elapsed / TAB_DURATION));
      const currentTabElapsed = elapsed % TAB_DURATION;
      const currentProgress = (currentTabElapsed / TAB_DURATION) * 100;

      setActiveTab(currentTabIndex);
      setProgress(currentProgress);

      // Lock completion status based on elapsed thresholds
      setCompletedTabs([
        elapsed >= TAB_DURATION,
        elapsed >= TAB_DURATION * 2,
        elapsed >= TOTAL_DURATION,
      ]);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleTabClick = (idx: number) => {
    isManualRef.current = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setActiveTab(idx);
    setProgress(100);
    // Mark tabs up to idx as completed
    const updated = [false, false, false];
    for (let i = 0; i <= idx; i++) updated[i] = true;
    setCompletedTabs(updated);
  };

  return (
    <div className="w-full bg-[#040032] text-[#faf8f2] rounded-3xl p-6 sm:p-10 border-2 border-[#040032] shadow-2xl my-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Info & 3-Tab Fill Progress Feature */}
        <div className="lg:col-span-6 space-y-6">
          <span className="font-mono-meta text-xs font-bold text-[#3fffe8] uppercase tracking-widest block">
            // TECHNICAL TRACK SPECIFICATION
          </span>

          <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#faf8f2] leading-tight">
            {tabs[activeTab].headline}
          </h3>

          <p className="text-xs sm:text-sm text-[#faf8f2]/80 font-sans leading-relaxed">
            {tabs[activeTab].description}
          </p>

          {/* 3-Tab Fill Progress Container */}
          <div className="pt-4 space-y-4">
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2.5 bg-white/5 p-2 rounded-2xl border border-white/10">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                const isCompleted = completedTabs[idx];

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(idx)}
                    className={`relative overflow-hidden py-3 px-2.5 rounded-xl border text-[11px] sm:text-xs font-mono-meta font-extrabold transition-all text-left ${
                      isCompleted
                        ? "bg-[#c6f552] border-[#c6f552] text-[#040032]"
                        : isActive
                        ? "border-[#c6f552] text-[#040032]"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {/* Progress Fill Bar */}
                    {isActive && !isCompleted && (
                      <div
                        className="absolute inset-0 bg-[#c6f552] transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <span className="relative z-10 block truncate">
                      {tab.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Items List (Less opaque until read to end, then FIXED TO FULL OPACITY) */}
            <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2 px-2.5">
              {tabs.map((tab, idx) => {
                const isCompleted = completedTabs[idx];

                return (
                  <div
                    key={idx}
                    className={`font-mono-meta text-[9px] sm:text-[10px] transition-all duration-300 ${
                      isCompleted
                        ? "opacity-100 text-[#c6f552] font-bold"
                        : "opacity-35 text-white/60"
                    }`}
                  >
                    {tab.subItems.map((sub, sIdx) => (
                      <div key={sIdx}>{sub}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Live Preview Mockup Card */}
        <div className="lg:col-span-6">
          <div className={`p-6 sm:p-8 rounded-2xl border-2 border-[#3fffe8]/40 shadow-2xl transition-colors duration-500 ${tabs[activeTab].mockupBg}`}>
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6 font-mono-meta text-xs">
              <span className="px-3 py-1 bg-[#c6f552] text-[#040032] font-extrabold rounded-full text-[10px] uppercase">
                {tabs[activeTab].mockupBadge}
              </span>
              <span className="text-[#3fffe8] font-bold">IESA UI TRACK</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono-meta text-xs space-y-2">
                <div className="text-white/50 text-[10px] uppercase">KEY FOCUS AREA</div>
                <div className="text-sm font-bold text-[#faf8f2]">{tabs[activeTab].headline}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {tabs[activeTab].mockupStats.map((st, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[10px] font-mono-meta text-white/60 block">{st.label}</span>
                    <span className="font-serif-display text-2xl font-bold text-[#c6f552]">{st.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
