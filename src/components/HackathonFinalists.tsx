"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import {
  SparklesIcon,
  CpuChipIcon,
  CommandLineIcon,
  TrophyIcon,
  ArrowUpRightIcon,
  BoltIcon,
  UsersIcon,
  XMarkIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";

export interface HackathonTeam {
  id: string;
  rank: string;
  name: string;
  project: string;
  subtitle: string;
  track: string;
  stack: string[];
  members: string;
  institution: string;
  summary: string;
  problem: string;
  solution: string;
  keyInnovation: string;
  status: string;
  badgeColor: string;
  demoUrl?: string;
  repoUrl?: string;
}

export default function HackathonFinalists() {
  const [selectedTeam, setSelectedTeam] = useState<HackathonTeam | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scrolling when hackathon modal is open
  useEffect(() => {
    if (selectedTeam) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [selectedTeam]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTeam(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const marqueeItems = [
    { text: "IEPOD PROCESS DAY HACKATHON" },
    { text: "8 FINALIST BUILDER TEAMS" },
    { text: "FORGE THE FUTURE GRAND FINALS" },
    { text: "LIVE STAGE DEMOS & HARDWARE NODES" },
    { text: "AFRICAN INDUSTRIAL & AI INNOVATION" },
    { text: "KAAF AUDITORIUM GRAND FINALE" },
  ];

  const teams: HackathonTeam[] = [
    {
      id: "team-devions",
      rank: "FINALIST // 01",
      name: "Team DEVIONS",
      project: "IntelliCT",
      subtitle: "Intelligent Transportation & Computer Vision Access Platform",
      track: "AI & Transportation Systems",
      stack: ["YOLOv8", "ByteTrack", "EasyOCR", "FastAPI", "React / Next.js", "SQLAlchemy"],
      members: "Gabriel Akoleaje · Treasure Olajide · Ifeanyi Agada · Abdulrafiu Mubarak · Abiodun Oreoluwa",
      institution: "University of Ibadan",
      summary:
        "An end-to-end ANPR and vehicle perception system tuned specifically for Nigerian roads—robust against oblique camera angles, extreme lighting, dusty/bent plates, and non-standard vehicle formats.",
      problem:
        "Most commercial Automatic Number Plate Recognition (ANPR) systems were trained on Western highway data. Deployed across Nigerian industrial parks, university gates, and checkpoints, they fail due to dusty plates, camera angle skew, and harsh tropical lighting.",
      solution:
        "A full plate-to-decision pipeline combining YOLO detection, ByteTrack multi-object tracking across frames, custom EasyOCR localized for Nigerian plates, live registry verification, and a real-time FastAPI operations console.",
      keyInnovation:
        "Tuned OCR confidence scoring with automated watchlist alerts and edge evidence crops for physical campus and checkpoint security.",
      status: "Live Stage Pitch",
      badgeColor: "bg-[#c6f552] text-[#040032]",
      repoUrl: "https://github.com/devions-forever/IntelliCT",
    },
    {
      id: "team-neural-flux",
      rank: "FINALIST // 02",
      name: "Team Neural Flux",
      project: "VeckTor",
      subtitle: "Non-Invasive IoT Telemetry Node & Fleet Diagnostics",
      track: "IoT & Fleet Telematics",
      stack: ["ESP32", "SIM808 2G/GPRS", "C++", "FastAPI", "MQTT", "Tailwind CSS"],
      members: "Iyanda Daniel Olawale (Embedded) · Wuraola Moses Eri (Software) · Chimezie Somtochukwu Boris (Operations)",
      institution: "University of Ibadan",
      summary:
        "A non-invasive retrofit IoT diagnostics node that extracts real-time alternator electrical current and engine vibration telemetry from legacy agricultural and commercial transport fleets without cutting fuel lines.",
      problem:
        "Fuel accounts for up to 65% of operating expenditure for Nigerian transport fleets, with diesel at ₦1,200+/L. Fleets cannot afford modern electric vehicles, and cutting into fuel lines for mechanical flow meters voids warranties and creates fire hazards.",
      solution:
        "External sensing (alternator current + engine vibration) processed on an ESP32 node with 3-stage network fallback (SPIFFS flash buffer to 2G GPRS MQTT), converting detected mechanical drag and idle waste directly into Naira losses on a live fleet manager dashboard.",
      keyInnovation:
        "Direct Naira-denominated fuel-waste reporting (₦30,000+ saved per anomaly) using affordable ₦61,500 prototype hardware.",
      status: "Hardware & Live Dashboard",
      badgeColor: "bg-[#3fffe8] text-[#040032]",
      demoUrl: "https://leinad321.github.io/VeckTor/",
    },
    {
      id: "team-primax",
      rank: "FINALIST // 03",
      name: "Team PRIMAX",
      project: "TacPulse",
      subtitle: "Decoupled Off-Grid Tactical Biometric & Spatial Telemetry System",
      track: "Embedded Systems & Defense Tech",
      stack: ["ESP32-C3", "ESP32-S3", "MAX30102", "MPU6050", "u-blox NEO-6M", "Long-Range RF"],
      members: "Shonubi Temiloluwa (Embedded Systems Engineer) · Udoka Success (Project Manager)",
      institution: "University of Ibadan (500L)",
      summary:
        "A decentralized two-node wearable safety telemetry system engineered for firefighters, frontline defense personnel, and deep-earth miners operating off-grid without cellular networks.",
      problem:
        "Commercial smart wearables depend entirely on cellular towers or Bluetooth pairing to smartphones. In subterranean mining shafts, active disaster zones, or remote wilderness, these networks collapse, leaving command centers blind to fallen or heat-exhausted personnel.",
      solution:
        "Decoupled telemetry architecture: a lightweight ESP32-C3 wrist node monitors heart rate, blood oxygen (SpO2), skin temperature, and sudden impacts, transmitting locally to an ESP32-S3 helmet hub equipped with GPS and long-range off-grid RF broadcast back to base camp.",
      keyInnovation:
        "Dual-frequency decoupled node topology with hardware reset pulsing and RC low-pass filtering to maintain telemetry integrity in high-interference off-grid zones.",
      status: "Hardware Node Demo",
      badgeColor: "bg-[#ffdb58] text-[#040032]",
    },
    {
      id: "team-shieldid",
      rank: "FINALIST // 04",
      name: "Team Shield ID",
      project: "ShieldID",
      subtitle: "Context-Aware Behavioral Security Architecture for African Fintech",
      track: "AI, Cybersecurity & Fintech",
      stack: ["Behavioral AI", "Computer Vision", "Python", "Mobile SDK", "REST APIs"],
      members: "Marvellous Ennis Samuel (Team Lead) · Ayeni Joshua Onimisi",
      institution: "University of Ibadan",
      summary:
        "An invisible, context-aware mobile security layer for digital payments that replaces static OTPs and friction-heavy PIN lockdowns with continuous behavioral profiling and deepfake-resistant liveness challenges.",
      problem:
        "Nigerian payment rails process hundreds of trillions of Naira quarterly, but face rising threats from AI deepfake liveness spoofing, social engineering, and SIM-swap account takeovers, while crude SMS OTPs cause high transaction drop-off.",
      solution:
        "ShieldID monitors passive behavioral signals (swipe micro-dynamics, device grip angle, typing cadence) in the background. It interrupts only when risk scores cross critical thresholds, prompting gamified, deepfake-resistant micro-challenges instead of blunt lockouts.",
      keyInnovation:
        "Frictionless zero-interruption baseline with dynamic risk scoring that halts unauthorized SIM-swapped withdrawals before funds leave the account.",
      status: "Fintech Security Defense",
      badgeColor: "bg-[#bbf2f6] text-[#040032]",
    },
    {
      id: "team-quantum-forge",
      rank: "FINALIST // 05",
      name: "Team Quantum Forge",
      project: "Inclusive Lecture Theatres",
      subtitle: "Re-Engineering University Lecture Spaces with Contextual AI",
      track: "Educational Infrastructure & AI",
      stack: ["Acoustic Engineering", "Live Speech-to-Text", "Asset Refurbishment", "Contextual AI"],
      members: "Olasunkanmi Joseph (Team Lead) · Adebiyi Philip · Mutmaina Adedokun",
      institution: "University of Ibadan",
      summary:
        "A practical, cost-conscious engineering model that restores and repurposes neglected audio/display infrastructure in large tertiary lecture halls while layering real-time AI transcription for rear-row and hearing-impaired students.",
      problem:
        "In university lecture halls seating 500 to 2,000 students, over 78% of attendees suffer from severe acoustic echo, board reflection occlusion, and passive exclusion, while millions in existing audio and interactive board assets sit broken or unused.",
      solution:
        "A three-tier upgrade methodology: inspect and recover existing hardware assets (saving up to 70% of procurement costs), install targeted supplementary displays, and deploy a live speech-to-text pipeline that streams live captions and synchronized AI notes directly to students' mobile screens.",
      keyInnovation:
        "Reuse-first physical asset restoration combined with an accessible on-device mobile AI study companion that closes the 'rear-seat acoustic handicap.'",
      status: "Accessibility Model Demo",
      badgeColor: "bg-[#c6f552] text-[#040032]",
    },
    {
      id: "team-verifi",
      rank: "FINALIST // 06",
      name: "Team Verifi",
      project: "Verifi SIWES Engine",
      subtitle: "Engineering Competency Validation & SIWES Industrial Placement",
      track: "Workforce Readiness & Systems",
      stack: ["Competency Mapping", "Python", "Process Engineering", "Next.js", "PostgreSQL"],
      members: "Promise Oluseyi Fagoroye · Oyerinde Muyiwa Levi",
      institution: "University of Ibadan",
      summary:
        "An evidence-driven competency framework and placement matching engine that replaces unverifiable paper CVs with checkpointed technical assessments to secure high-value SIWES industrial internships for engineering students.",
      problem:
        "Nigerian engineering undergraduates learn critical software and technical skills outside university curricula, but have no credible way to prove them. Industrial employers struggle with noisy applications and revert to hiring through personal connections rather than merit.",
      solution:
        "A multi-phase evaluation engine that breaks industrial job descriptions into verifiable technical milestones, allowing students to demonstrate hands-on CAD, coding, and analytical proficiencies through structured checkpoint projects.",
      keyInnovation:
        "Objective, rubric-grounded competency indices that give engineering firms high-confidence matching signals for industrial training placement.",
      status: "Process Pitch & Prototype",
      badgeColor: "bg-[#ffdb58] text-[#040032]",
    },
    {
      id: "team-optima-plus",
      rank: "FINALIST // 07",
      name: "Team Optima+",
      project: "Optima+ Primary Care",
      subtitle: "Stochastic Online Appointment Scheduling for Healthcare Systems",
      track: "Operations Research & Healthcare",
      stack: ["Operations Research", "Stochastic Modeling", "Queueing Theory", "Python Optimization"],
      members: "Onwe Somto Miracle · Uthman Suarau",
      institution: "University of Ibadan",
      summary:
        "A mathematical optimization and stochastic queueing model designed to resolve outpatient congestion, doctor idling, and long patient wait times across primary healthcare centers.",
      problem:
        "Traditional First-Come-First-Serve (FCFS) and rigid appointment slots in primary clinics lead to extreme patient waiting times, overcrowded waiting wards, and erratic doctor workloads, deteriorating patient health outcomes and escalating operational costs.",
      solution:
        "A stochastic scheduling algorithm incorporating variable patient consultation times, walk-in emergency probabilities, and doctor availability parameters to determine optimal arrival intervals and resource allocation.",
      keyInnovation:
        "Patient-centric multi-objective optimization that balances clinic overtime costs with patient wait dissatisfaction in resource-constrained public hospitals.",
      status: "Algorithmic Model Defense",
      badgeColor: "bg-[#3fffe8] text-[#040032]",
    },
    {
      id: "team-efficiency",
      rank: "FINALIST // 08",
      name: "Team Efficiency",
      project: "Educore AI",
      subtitle: "Offline On-Device AI Academic Assistant for University Students",
      track: "Offline EdTech & Mobile Systems",
      stack: ["Flutter", "Dart", "On-Device AI Models", "Local State Management"],
      members: "Anointed Durojaye & Engineering Team",
      institution: "University of Ibadan",
      summary:
        "A completely offline, on-device mobile AI learning application that provides university students with instant concept explanations, document summaries, and interactive quizzes without internet access or cellular data costs.",
      problem:
        "Higher education increasingly relies on digital and AI tools, yet university students in developing regions face unstable campus Wi-Fi, frequent power outages, and prohibitive mobile data costs, creating severe educational inequalities.",
      solution:
        "A standalone Flutter mobile application executing lightweight local language models directly on student smartphones, enabling interactive concept breakdown, syllabus-aligned quiz generation, and chat assistance without transmitting a single byte over the web.",
      keyInnovation:
        "Zero-bandwidth on-device AI architecture with interactive multi-screen state management for uninterrupted independent learning.",
      status: "Mobile App Prototype",
      badgeColor: "bg-[#bbf2f6] text-[#040032]",
    },
  ];

  return (
    <section id="hackathon" className="pt-0 pb-20 lg:pb-28 bg-[#faf8f2] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="-rotate-[1.85deg]"
          bgClass="bg-[#040032]"
          borderClass="border-[#3fffe8]"
          textClass="text-[#3fffe8]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block mb-2">
              FORGE THE FUTURE // KAAF MAIN STAGE GRAND FINALS
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Hackathon <span className="font-serif-italic text-[#0a3825]">Finalists</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <ScrollRevealText
              text="Eight student engineering teams pitching working hardware nodes, computer vision pipelines, and optimization algorithms on the Kaaf Main Stage. Vying for grand prize honors and industrial incubation."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed text-left justify-start"
              align="left"
              highlightWords={["Eight", "hardware", "computer", "algorithms", "honors", "incubation"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Bento Grid: 2 Top Featured + 6 Column Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`liquid-metal-card group cursor-pointer ${
                idx === 0
                  ? "lg:col-span-2"
                  : idx === 1
                  ? "lg:col-span-1"
                  : "col-span-1"
              }`}
            >
              <div className="h-full bg-[#ece7d8]/65 rounded-[1.4rem] p-6 sm:p-7 border border-[#040032]/15 flex flex-col justify-between transition-all duration-300 hover:border-[#0a3825] hover:shadow-lg space-y-5">
                <div className="space-y-4">
                  {/* Top Meta Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-meta font-extrabold uppercase border border-[#040032] ${team.badgeColor}`}
                    >
                      {team.track}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono-meta text-[#0a3825] font-extrabold">
                      {team.rank}
                    </span>
                  </div>

                  {/* Team Title & Project Name */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#040032] group-hover:text-[#0a3825] transition-colors">
                        {team.name}
                      </h3>
                      <ArrowUpRightIcon className="w-4 h-4 text-[#040032]/40 group-hover:text-[#0a3825] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="text-xs sm:text-sm font-mono-meta font-bold text-[#0a3825]">
                      {team.project} — <span className="font-normal opacity-90">{team.subtitle}</span>
                    </p>
                  </div>

                  {/* Project Summary */}
                  <p className="text-xs sm:text-sm text-[#040032]/85 font-sans leading-relaxed line-clamp-3">
                    {team.summary}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {team.stack.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-0.5 rounded-md bg-[#faf8f2] border border-[#040032]/10 text-[10px] font-mono-meta font-bold text-[#040032]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Members & Pitch Status */}
                <div className="pt-4 border-t border-[#040032]/10 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono-meta text-[#040032]/70 truncate max-w-[65%]">
                    <UsersIcon className="w-3.5 h-3.5 text-[#0a3825] flex-shrink-0" />
                    <span className="truncate">{team.members}</span>
                  </div>

                  <span className="relative overflow-hidden px-2.5 py-1 rounded-full bg-[#040032] text-[#c6f552] text-[10px] font-mono-meta font-extrabold whitespace-nowrap shadow-sm">
                    <div className="shimmer-sweep-lime" />
                    <span className="relative z-10">{team.status}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Team Deep-Dive Modal (Rendered via portal to cover entire screen outside section clip-paths) */}
      {selectedTeam && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="bg-[#faf8f2] border-2 border-[#040032] text-[#040032] rounded-2xl sm:rounded-3xl w-[94vw] sm:w-[92vw] md:w-[88vw] lg:w-full lg:max-w-2xl max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh] overflow-y-auto p-4 sm:p-6 lg:p-7 shadow-2xl space-y-4 sm:space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-full bg-[#040032]/5 hover:bg-[#040032]/10 text-[#040032] transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-meta font-extrabold uppercase border border-[#040032] ${selectedTeam.badgeColor}`}
                >
                  {selectedTeam.track}
                </span>
                <span className="text-[11px] sm:text-xs font-mono-meta text-[#0a3825] font-bold">
                  {selectedTeam.rank} · {selectedTeam.institution}
                </span>
              </div>
              <h3 className="font-serif-display text-lg sm:text-xl lg:text-2xl font-bold text-[#040032]">
                {selectedTeam.name}
              </h3>
              <p className="text-xs sm:text-sm font-mono-meta font-bold text-[#0a3825]">
                {selectedTeam.project} — {selectedTeam.subtitle}
              </p>
            </div>

            {/* Team Members List */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ece7d8]/60 border border-[#040032]/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#0a3825] uppercase tracking-wider">
                <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Builder Team</span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-[#040032]/90 leading-relaxed">
                {selectedTeam.members}
              </p>
            </div>

            {/* Problem & Solution Breakdown */}
            <div className="space-y-3 sm:space-y-3.5">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#040032]/10 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#c93b2b] uppercase tracking-wider">
                  <LightBulbIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>The Real-World Pain Point</span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#040032]/85 leading-relaxed">
                  {selectedTeam.problem}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0a3825]/5 border border-[#0a3825]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#0a3825] uppercase tracking-wider">
                  <WrenchScrewdriverIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Engineered Solution & Process</span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#040032]/85 leading-relaxed">
                  {selectedTeam.solution}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#040032]/5 border border-[#040032]/15 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#040032] uppercase tracking-wider">
                  <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0a3825]" />
                  <span>Key Innovation</span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#040032]/90 leading-relaxed font-medium">
                  {selectedTeam.keyInnovation}
                </p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <span className="text-[11px] sm:text-xs font-mono-meta font-bold text-[#040032]/70 uppercase tracking-wider block">
                Technical Stack & Architecture
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedTeam.stack.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-0.5 rounded-lg bg-[#040032] text-[#c6f552] text-[10px] sm:text-xs font-mono-meta font-bold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3.5 border-t border-[#040032]/15 flex flex-wrap items-center justify-between gap-3">
              <span className="relative overflow-hidden px-3 py-1 rounded-full bg-[#040032] text-[#c6f552] text-[10px] sm:text-xs font-mono-meta font-extrabold shadow-sm">
                <div className="shimmer-sweep-lime" />
                <span className="relative z-10">Stage Status: {selectedTeam.status}</span>
              </span>

              <div className="flex items-center gap-2">
                {selectedTeam.repoUrl && (
                  <a
                    href={selectedTeam.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#040032] hover:bg-[#0a3825] text-[#faf8f2] text-xs font-mono-meta font-bold transition-all active:scale-[0.98]"
                  >
                    <CommandLineIcon className="w-3.5 h-3.5 text-[#3fffe8]" />
                    <span>View Repository</span>
                    <ArrowUpRightIcon className="w-3 h-3" />
                  </a>
                )}
                {selectedTeam.demoUrl && (
                  <a
                    href={selectedTeam.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] text-xs font-mono-meta font-extrabold transition-all active:scale-[0.98]"
                  >
                    <GlobeAltIcon className="w-3.5 h-3.5 text-[#040032]" />
                    <span>Live Dashboard</span>
                    <ArrowUpRightIcon className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="px-3.5 py-1.5 rounded-full border border-[#040032]/20 hover:bg-[#040032]/5 text-xs font-mono-meta font-bold text-[#040032] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
