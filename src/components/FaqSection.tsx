"use client";

import { useState } from "react";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const marqueeItems = [
    { text: "FREQUENTLY ASKED QUESTIONS" },
    { text: "EVENT INQUIRIES & DELEGATE INFO" },
    { text: "KAAF AUDITORIUM UI" },
    { text: "EVERYTHING YOU NEED TO KNOW" },
  ];

  const faqs = [
    {
      q: "Where is the hall and what time do sessions start?",
      a: "Sessions kick off at 10:00 AM sharp inside KAAF Auditorium (Human Nutrition & Dietetics precinct, UI). The hall is air-conditioned, with priority seating for early arrivals.",
    },
    {
      q: "Can I still join if I didn't register beforehand?",
      a: "Yes! Walk-in students, alumni, and tech enthusiasts are warmly welcomed into KAAF Auditorium while seats remain available.",
    },
    {
      q: "How do I participate in the breakout workshops (Robotics, Tech Law, Cyber, Energy)?",
      a: "Workshops run concurrently from 1:00 PM to 1:30 PM. Just walk into your track of choice — Aurora Robotics, Tech Law, Cyvant SCADA Cyber, or Itel Energy Solutions ⚡!",
    },
    {
      q: "Will digital certificates and speaker slides be shared?",
      a: "Yes! Official slides, hackathon code repositories, and digital attendance certificates will be dispatched through the live WhatsApp community after closing protocols.",
    },
    {
      q: "Who can I talk to on the ground for assistance?",
      a: "Look for any IESA committee member in the auditorium concourse, or reach out directly to executives Vai (08127543064) or Success (09152882594).",
    },
  ];

  return (
    <section id="faq" className="pt-0 pb-28 lg:pb-40 min-h-[60vh] bg-[#ece7d8] relative flex flex-col justify-between">
      <div>
        {/* Tailored Marquee Strip Entrance Header - Flushed to top edge */}
        <div className="mt-0 mb-6 overflow-visible">
          <TailoredMarqueeStrip
            items={marqueeItems}
            rotateClass="rotate-[1.85deg]"
            bgClass="bg-[#040032]"
            borderClass="border-[#c6f552]"
            textClass="text-[#c6f552]"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif-display text-4xl sm:text-5xl font-bold text-[#040032]">
              Got questions? We've got answers.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#faf8f2] border border-[#040032]/15 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#040032]/40"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-mono-meta font-bold text-sm sm:text-base text-[#040032]"
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-[#0a3825] flex-shrink-0 transition-transform duration-300 ${
                      openIndex === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === idx && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[#040032]/80 font-sans leading-relaxed border-t border-[#040032]/10 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
