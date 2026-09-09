"use client";

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
} from "@heroicons/react/24/solid";

export interface HackathonTeam {
  id: string;
  rank: string;
  name: string;
  project: string;
  track: string;
  stack: string[];
  members: string;
  summary: string;
  status: string;
  badgeColor: string;
}

export default function HackathonFinalists() {
  const marqueeItems = [
    { text: "IEPOD PROCESS DAY HACKATHON" },
    { text: "5 FINALIST BUILDER TEAMS" },
    { text: "LIVE STAGE DEMOS & PROTOTYPES" },
    { text: "HARDWARE & SOFTWARE INNOVATION" },
    { text: "KAAF MAIN STAGE GRAND FINALE" },
  ];

  const teams: HackathonTeam[] = [
    {
      id: "team-01",
      rank: "FINALIST // 01",
      name: "Team OptiFlow AI",
      project: "Autonomous Assembly Line Bottleneck Forecaster",
      track: "AI & Process Systems",
      stack: ["Python", "OpenCV", "PyTorch", "MQTT"],
      members: "T. Adeleke · K. Alabi · O. Daniels",
      summary:
        "Real-time industrial vision system that predicts assembly line choke points before delays compound, boosting throughput by up to 28%.",
      status: "Live Stage Pitch",
      badgeColor: "bg-[#c6f552] text-[#040032]",
    },
    {
      id: "team-02",
      rank: "FINALIST // 02",
      name: "Team RoboSort Dynamics",
      project: "Automated Conveyor Vision Sorting Cell",
      track: "Robotics & Automation",
      stack: ["ROS2", "MicroPython", "Jetson Nano", "SolidWorks"],
      members: "A. Oladimeji · S. Bello · E. Chinedu",
      summary:
        "A compact robotic pick-and-place delta arm combining embedded optical inference with rapid mechanical sorting for defective parts.",
      status: "Hardware Demo Unit",
      badgeColor: "bg-[#3fffe8] text-[#040032]",
    },
    {
      id: "team-03",
      rank: "FINALIST // 03",
      name: "Team EcoWatt Grid",
      project: "Distributed Microgrid Peak-Load Balancer",
      track: "Energy Solutions",
      stack: ["ESP32", "Next.js", "Modbus", "LoRaWAN"],
      members: "E. Okon · B. Afolabi · C. Eze",
      summary:
        "Smart industrial power gateway that automatically schedules heavy manufacturing loads during peak solar generation to curb grid spikes.",
      status: "Live Prototype Demo",
      badgeColor: "bg-[#ffdb58] text-[#040032]",
    },
    {
      id: "team-04",
      rank: "FINALIST // 04",
      name: "Team SecureSCADA",
      project: "Zero-Trust Edge Guardian for Industrial IoT",
      track: "Cybersecurity & SCADA",
      stack: ["Rust", "Linux Kernel", "WireGuard", "SQLite"],
      members: "M. Balogun · T. Olaniyi · N. David",
      summary:
        "Low-latency hardware firewall that intercepts anomalous packet injection and unauthorized firmware calls on factory floor PLCs.",
      status: "Security Showcase",
      badgeColor: "bg-[#bbf2f6] text-[#040032]",
    },
    {
      id: "team-05",
      rank: "FINALIST // 05",
      name: "Team ErgoMotion",
      project: "Computer-Vision Ergonomic Risk Monitor",
      track: "Human Systems & Safety",
      stack: ["MediaPipe", "TensorFlow Lite", "WebSockets"],
      members: "F. Ibrahim · R. Adelekan · U. Peter",
      summary:
        "Non-intrusive skeletal posture tracker flagging high-risk repetitive manual bending and spine strain on production workers in real time.",
      status: "Live Stage Pitch",
      badgeColor: "bg-[#c6f552] text-[#040032]",
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block mb-2">
              GRAND FINALS // KAAF MAIN STAGE SHOWCASE
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Hackathon <span className="font-serif-italic text-[#0a3825]">Finalists</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <ScrollRevealText
              text="Five multidisciplinary builder teams pitching working hardware and software prototypes on stage today. Vying for grand prize honors and industrial incubation grants."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed text-left justify-start"
              align="left"
              highlightWords={["builder", "prototypes", "stage", "honors", "grants"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Bento Grid: 2 Featured + 3 Compact Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className={`liquid-metal-card group ${
                idx === 0
                  ? "lg:col-span-2"
                  : idx === 1
                  ? "lg:col-span-1"
                  : "col-span-1"
              }`}
            >
              <div className="h-full bg-[#ece7d8]/65 rounded-[1.4rem] p-6 sm:p-7 border border-[#040032]/15 flex flex-col justify-between transition-all duration-300 hover:border-[#0a3825] space-y-6">
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
                    <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#040032] group-hover:text-[#0a3825] transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono-meta font-bold text-[#0a3825]">
                      "{team.project}"
                    </p>
                  </div>

                  {/* Project Summary */}
                  <p className="text-xs sm:text-sm text-[#040032]/80 font-sans leading-relaxed">
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
                  <div className="flex items-center gap-1.5 text-[11px] font-mono-meta text-[#040032]/70 truncate">
                    <UsersIcon className="w-3.5 h-3.5 text-[#0a3825] flex-shrink-0" />
                    <span className="truncate">{team.members}</span>
                  </div>

                  <span className="relative overflow-hidden px-2.5 py-1 rounded-full bg-[#040032] text-[#c6f552] text-[10px] font-mono-meta font-extrabold whitespace-nowrap">
                    <div className="shimmer-sweep-lime" />
                    <span className="relative z-10">{team.status}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
