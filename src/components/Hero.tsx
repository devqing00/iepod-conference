"use client";

import Image from "next/image";
import ScrollRevealText from "@/components/ScrollRevealText";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  ArrowUpRightIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#faf8f2] text-[#040032] pt-20 pb-12 lg:pt-24 lg:pb-16">
      {/* Dynamic Technical Blueprint Grid Pattern with Radial Edge Blur */}
      <div className="absolute inset-0 bg-component-grid opacity-60 pointer-events-none mask-radial-fade" />

      {/* Floating 3D Isometric Technological Artifacts (Pointer Events None) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* 01. Top Left: 3D Gear / AI Engine Component */}
        <div className="absolute -top-16 -left-10 sm:-top-32 sm:-left-20 md:-top-64 md:-left-36 lg:-top-72 lg:-left-44 w-40 sm:w-64 md:w-[32rem] lg:w-[40rem] pointer-events-none animate-float-slow-1 transform-gpu will-change-transform">
          <Image
            src="/assets/generated/iso_gear_ai.png"
            alt="AI Industrial Gear"
            width={600}
            height={600}
            className="w-full h-auto drop-shadow-2xl contrast-125 brightness-110 opacity-25"
            priority
          />
        </div>

        {/* 02. Top Right: 3D Isometric Ticket Badge */}
        <div className="absolute -top-16 -right-10 sm:-top-32 sm:-right-20 md:-top-64 md:-right-36 lg:-top-72 lg:-right-44 w-40 sm:w-64 md:w-[32rem] lg:w-[40rem] pointer-events-none animate-float-slow-2 transform-gpu will-change-transform">
          <Image
            src="/assets/generated/iso_ticket_badge.png"
            alt="Delegate Conference Pass"
            width={600}
            height={600}
            className="w-full h-auto drop-shadow-2xl contrast-125 brightness-110 opacity-25"
            priority
          />
        </div>

        {/* 03. Bottom Left: 3D Isometric Precision Robotic Arm Module */}
        <div className="absolute -bottom-8 -left-10 sm:-bottom-16 sm:-left-16 md:-bottom-44 md:-left-30 lg:-bottom-50 lg:-left-36 w-36 sm:w-56 md:w-[30rem] lg:w-[38rem] pointer-events-none animate-float-slow-3 transform-gpu will-change-transform">
          <Image
            src="/assets/generated/iso_robotic_arm.png"
            alt="Precision Industrial Robotic Arm"
            width={550}
            height={550}
            className="w-full h-auto drop-shadow-2xl contrast-125 brightness-110 opacity-25"
          />
        </div>

        {/* 04. Bottom Right: 3D Isometric Analytics Card */}
        <div className="absolute -bottom-8 -right-10 sm:-bottom-16 sm:-right-16 md:-bottom-44 md:-right-30 lg:-bottom-50 lg:-right-36 w-36 sm:w-56 md:w-[30rem] lg:w-[38rem] pointer-events-none animate-float-slow-4 transform-gpu will-change-transform">
          <Image
            src="/assets/generated/iso_analytics_card.png"
            alt="Process Data Card"
            width={550}
            height={550}
            className="w-full h-auto drop-shadow-2xl contrast-125 brightness-110 opacity-25"
          />
        </div>
      </div>

      {/* Hero Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex-grow flex flex-col justify-center my-auto">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Main Headline */}
          <h1 className="font-serif-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#040032] leading-[1.02]">
            FORGE THE{" "}
            <span className="font-serif-italic text-[#0a3825]">Future</span>
          </h1>

          {/* Subtitle - Text Centered */}
          <div className="w-full flex justify-center text-center">
            <ScrollRevealText
              text="Welcome to the 6th Annual IESA Conference — live today at KAAF Auditorium, University of Ibadan. Bringing together visionary engineering minds, innovators, and students."
              className="text-sm sm:text-base text-[#040032]/80 max-w-2xl text-center items-center justify-center leading-relaxed font-sans mx-auto"
              wordClassName="justify-center"
              highlightWords={[
                "live",
                "KAAF Auditorium",
                "engineering",
                "innovators",
              ]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>

          {/* Primary Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="liquid-metal-border-pill">
              <a
                href="#schedule"
                className="relative overflow-hidden flex items-center gap-3 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-extrabold text-xs sm:text-sm px-7 py-3 rounded-full border-2 border-[#040032] transition-all active:scale-[0.98] group cursor-pointer shadow-sm"
              >
                <div className="shimmer-sweep" />
                <span className="relative z-10">EXPLORE PROGRAM</span>
                <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform pointer-events-none relative z-10" />
              </a>
            </div>


            <a
              href="https://chat.whatsapp.com/G2p8sAbGUxWIas4caTZWdY?s=cl&p=a&ilr=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0a3825] hover:bg-[#082e1e] text-[#faf8f2] font-bold text-xs sm:text-sm px-6 py-3 rounded-full border border-[#0a3825] transition-all active:scale-[0.98] group shadow-sm cursor-pointer"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#c6f552] pointer-events-none" />
              <span>JOIN WHATSAPP COMMUNITY</span>
            </a>
          </div>

          {/* Minimal Single Line Metadata Rail */}
          <div className="pt-3 text-center">
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono-meta font-semibold text-[#040032]/70 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <CalendarDaysIcon className="w-3 h-3 text-[#0a3825] pointer-events-none" />
                <span>Live Today · Starts 10:00 AM</span>
              </div>

              <span className="text-[#040032]/30">·</span>

              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3 text-[#0a3825] pointer-events-none" />
                <span>Order of Program Live</span>
              </div>

              <span className="text-[#040032]/30">·</span>

              <div className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-[#0a3825] pointer-events-none" />
                <span>KAAF Auditorium, UI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
