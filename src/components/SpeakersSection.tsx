"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import {
  TrophyIcon,
  XMarkIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/solid";

export interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  role:
    | "Keynote Speaker"
    | "Keynote Facilitator"
    | "Robotics & AI Facilitator"
    | "Energy Solutions Facilitator"
    | "Cybersecurity Facilitator"
    | "Tech & IP Law Facilitator"
    | "Robotics Facilitator";
  bio: string;
  image: string;
  topic: string;
  badgeColor: string;
}

interface SpeakersSectionProps {
  onSelectSpeaker?: (speaker: Speaker) => void;
}

export default function SpeakersSection({ onSelectSpeaker }: SpeakersSectionProps) {
  const marqueeItems = [
    { text: "TODAY'S KEYNOTE MINDS & FACILITATORS" },
    { text: "PROF. KAYODE OYEBODE ADEBOWALE (VC UI)" },
    { text: "ENGR. ADEBAYO OTOKITI (CALOR GAS UK)" },
    { text: "DR. OLUSOLA SAYEED AYOOLA (RAIN)" },
    { text: "ITEL ENERGY (ENERGY SOLUTIONS ⚡)" },
    { text: "EMMANUEL TAVERSHIMA (CYVANT)" },
    { text: "OYINDAMOLA FASANMI ESQ (TECH LAW)" },
    { text: "OLUWATOBI ADEMOSU (AURORA ROBOTICS)" },
  ];

  const speakers: Speaker[] = [
    {
      id: "vc-ui",
      name: "Prof. Kayode Oyebode Adebowale",
      title: "Vice-Chancellor",
      organization: "University of Ibadan",
      role: "Keynote Speaker",
      bio: "Professor of Industrial Chemistry and 13th Vice-Chancellor of the University of Ibadan. Leading research excellence and institutional innovation in engineering education.",
      image: "/assets/generated/vice_chancellor.png",
      topic: "Academic Excellence & Institutional Innovation in Engineering Education",
      badgeColor: "bg-[#c6f552] text-[#040032]",
    },
    {
      id: "engr-otokiti",
      name: "Engr. Adebayo Otokiti, CEng, MBA, PMP, MNSE",
      title: "Engineering Programme Manager",
      organization: "Calor Gas Ltd (United Kingdom)",
      role: "Keynote Facilitator",
      bio: "Engineering transformation leader with over 13 years delivering capital projects across UK energy and manufacturing. First-Class UI Industrial Engineering alumnus and Imperial College MBA.",
      image: "/assets/generated/otokiti.png",
      topic: "The Professional You Are Becoming: Why Habits and Commitments Determine Capacity Long Before Opportunity Arrives",
      badgeColor: "bg-[#3fffe8] text-[#040032]",
    },
    {
      id: "dr-ayoola",
      name: "Dr. Olusola Sayeed Ayoola",
      title: "Founder & Chief Executive Officer",
      organization: "Robotics and Artificial Intelligence Nigeria (RAIN)",
      role: "Robotics & AI Facilitator",
      bio: "Founder & CEO of RAIN. University of Manchester PhD and pioneer in African robotics, autonomous systems, and applied physical AI.",
      image: "/assets/generated/ayoola.png",
      topic: "Building What AI Can't Replace: How Process Discipline Creates Impact, Not Just Output",
      badgeColor: "bg-[#c6f552] text-[#040032]",
    },
    {
      id: "itel-energy",
      name: "Itel Energy",
      title: "Energy Solutions & Innovation",
      organization: "Itel Energy",
      role: "Energy Solutions Facilitator",
      bio: "Leading today's Energy Masterclass with practical insights into modern renewable technology and smarter power solutions for industrial growth. ⚡",
      image: "/assets/generated/itel.png",
      topic: "Energy Solutions & Innovation: Smarter Power for the Future ⚡",
      badgeColor: "bg-[#ffdb58] text-[#040032]",
    },
    {
      id: "cyvant-ceo",
      name: "Emmanuel Tavershima",
      title: "Founder & Chief Executive Officer",
      organization: "Cyvant",
      role: "Cybersecurity Facilitator",
      bio: "Cybersecurity strategist leading Cyvant, specializing in SCADA protection, critical industrial control defenses, and system security.",
      image: "/assets/generated/facilitator.png",
      topic: "Securing Modern Industrial Systems & SCADA AI Infrastructure",
      badgeColor: "bg-[#3fffe8] text-[#040032]",
    },
    {
      id: "oyindamola-fasanmi",
      name: "Oyindamola Fasanmi Esq",
      title: "Lawyer & WIPO Scholar",
      organization: "Author, Intellectual Property Uncomplicated",
      role: "Tech & IP Law Facilitator",
      bio: "Legal practitioner, WIPO scholar, and author of 'Intellectual Property Uncomplicated', guiding innovators on tech patents, digital rights, and legal protection.",
      image: "/assets/generated/oyindamola.png",
      topic: "Intellectual Property Uncomplicated: Legal Frameworks, Patents & Rights for Tech Builders",
      badgeColor: "bg-[#c6f552] text-[#040032]",
    },
    {
      id: "oluwatobi-ademosu",
      name: "Oluwatobi Ademosu",
      title: "Head of Operations & Embedded Systems Engineer",
      organization: "Aurora Robotics",
      role: "Robotics Facilitator",
      bio: "Embedded systems engineer and operations lead at Aurora Robotics, developing autonomous hardware controllers and physical AI.",
      image: "/assets/generated/oluwatobi.png",
      topic: "Robotics Workshop: Embedded Systems Architecture & Physical AI in Industrial Operations",
      badgeColor: "bg-[#3fffe8] text-[#040032]",
    },
  ];

  return (
    <section id="speakers" className="pt-0 pb-20 lg:pb-28 bg-[#ece7d8] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="rotate-[1.85deg]"
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
              STAGE SESSIONS // LIVE TODAY AT KAAF AUDITORIUM
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Today&apos;s <span className="font-serif-italic text-[#0a3825]">Stage Lineup</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <ScrollRevealText
              text="Seven leaders, innovators, and workshop facilitators taking the stage today. Click any card to check out their bio and talk topic."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed text-left justify-start"
              align="left"
              highlightWords={["leaders", "innovators", "facilitators", "today", "bio"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Speakers Grid - 7 Speakers & Facilitators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {speakers.map((speaker, index) => (
            <div
              key={speaker.id}
              onClick={() => onSelectSpeaker?.(speaker)}
              className={`liquid-metal-card cursor-pointer group ${
                index === 6 ? "md:col-span-2 md:max-w-xl md:mx-auto w-full" : ""
              }`}
            >
              <div className="h-full bg-[#faf8f2] rounded-[1.4rem] p-7 border border-[#040032]/15 flex flex-col justify-between transition-all duration-300">
                <div className="space-y-6">
                  {/* Speaker Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono-meta font-extrabold uppercase border border-[#040032] ${speaker.badgeColor}`}>
                      {speaker.role}
                    </span>
                    <span className="text-xs font-mono-meta text-[#040032]/50 font-bold">
                      PROFILE // 0{speakers.indexOf(speaker) + 1}
                    </span>
                  </div>

                  {/* Speaker Image & Info */}
                  <div className="flex items-start gap-5">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#040032] flex-shrink-0 bg-[#ece7d8] shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <div className="space-y-1.5 flex-grow">
                      <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#040032] group-hover:text-[#0a3825] transition-colors">
                        {speaker.name}
                      </h3>
                      <p className="text-xs font-mono-meta font-extrabold text-[#0a3825]">
                        {speaker.title}
                      </p>
                      <p className="text-xs text-[#040032]/70 font-sans font-semibold">
                        {speaker.organization}
                      </p>
                    </div>
                  </div>

                  {/* Speaker Topic Box */}
                  <div className="p-4 bg-[#ece7d8]/60 rounded-xl border border-[#040032]/10 space-y-1">
                    <span className="text-[10px] font-mono-meta uppercase font-bold text-[#040032]/60">PRESENTATION TOPIC</span>
                    <p className="text-xs sm:text-sm font-serif-display font-bold text-[#040032]">
                      "{speaker.topic}"
                    </p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="pt-5 mt-6 border-t border-[#040032]/10 flex items-center justify-between">
                  <span className="text-xs font-mono-meta font-extrabold text-[#040032] group-hover:underline">
                    READ FULL BIOGRAPHY
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#040032] text-[#faf8f2] flex items-center justify-center group-hover:bg-[#c6f552] group-hover:text-[#040032] transition-colors">
                    <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
