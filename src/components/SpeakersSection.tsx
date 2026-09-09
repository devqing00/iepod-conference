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
      bio: `Prof. Kayode Oyebode Adebowale is a distinguished Professor of Industrial Chemistry and the Vice-Chancellor of the University of Ibadan, a position he has held since November 2021. A proud alumnus of the University of Ibadan, he holds BSc, MSc and PhD degrees in Chemistry and Industrial Chemistry from the University.

With over 150 peer-reviewed publications, two patents, and extensive experience in research, teaching and university administration, Prof. Adebowale has made significant contributions to Chemical Sciences, particularly in industrial chemistry, sustainable materials, biomass utilisation and environmental research. He has also supervised numerous postgraduate students, many of whom have become academics and researchers.

He is a Fellow of several prestigious professional bodies, including the Nigerian Academy of Science, Royal Society of Chemistry (UK), African Academy of Science and Alexander von Humboldt Foundation. His contributions to science have earned him several notable honours, including the African Union Kwame Nkrumah Continental Scientific Award for Science, Technology and Innovation.

As the Vice-Chancellor of the University of Ibadan, Prof. Adebowale continues to champion academic excellence, innovation, research and sustainable development, making him a fitting personality to inspire the next generation of students and young innovators at IESA Process Day 2026 – Forge the Future.`,
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
      bio: `Engr. Adebayo Otokiti is a business transformation leader with more than thirteen years of experience delivering capital projects, operational excellence and performance improvement across the energy, utilities and manufacturing sectors. He currently leads a significant capital investment portfolio as Engineering Programme Manager for Calor Gas Ltd in the United Kingdom, where he provides strategic leadership for engineering programmes spanning more than thirty operational sites.

Before joining Calor Gas, Adebayo held senior engineering leadership positions at Nigeria LNG, where he led multidisciplinary teams responsible for asset performance, engineering assurance, reliability improvement and major operational initiatives supporting one of the world's leading liquefied natural gas facilities. Earlier in his career at Nestlé Nigeria, as Production Planning and Detailed Scheduling Manager, he successfully led supply chain optimisation, Lean Six Sigma transformation and continuous improvement programmes that delivered measurable business value.

Adebayo holds a Master of Business Administration (MBA) degree from Imperial College Business School and a First-Class degree in Industrial and Production Engineering from the University of Ibadan. He is a Chartered Engineer with the Institution of Engineering and Technology UK, a COREN registered engineer and a member of the Nigerian Society of Engineers (NSE). He holds professional certifications in Project Management, Lean Six Sigma, Safety leadership and Programme Management.

He is passionate about developing future engineering leaders and advancing the role of Industrial and Production Engineering in driving innovation, operational excellence and sustainable economic development. Through his work, Adebayo continues to demonstrate how engineering leadership, strategic thinking and continuous improvement can create lasting value for organisations and society.`,
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
      bio: `Dr. Olusola Sayeed Ayoola is the Founder & CEO of Robotics and Artificial Intelligence Nigeria (RAIN), is a leading voice in African robotics and AI. He holds a First Class degree in Electrical/Electronic Engineering from the University of Ibadan, and a Master's (Distinction) and PhD from the University of Manchester, UK, on government scholarships. From 2014–2019, he researched ground and underwater robotics for the UK's Nuclear Decommissioning programme.

Since founding RAIN in Nigeria in 2019, he has built West Africa's foremost robotics and AI hub, launching YardCode (an indigenous digital addressing solution) and securing RAIN's appointment as Meta's pioneer West African partner for its AI Developer Academy.

Internationally, Dr. Ayoola serves on UNDP's Nigeria AI for Development Reference Group, co-chaired the 2024 Nigeria AI Strategy Workshop, and represented Nigeria at the 2025 Global AI Action Summit in Paris, alongside recognition from the U.S. State Department's IVLP and ICAR Abu Dhabi.`,
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
                    <span className={`relative overflow-hidden px-3 py-1 rounded-full text-xs font-mono-meta font-extrabold uppercase border border-[#040032] ${speaker.badgeColor}`}>
                      <div className="shimmer-sweep" />
                      <span className="relative z-10">{speaker.role}</span>
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
