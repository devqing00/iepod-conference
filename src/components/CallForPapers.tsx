"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import {
  DocumentTextIcon,
  ArrowUpRightIcon,
  ClockIcon,
  XMarkIcon,
  TagIcon,
  AcademicCapIcon,
  BookmarkIcon,
} from "@heroicons/react/24/solid";

export interface ResearchPaper {
  code: string;
  title: string;
  authors: string;
  lead: string;
  affiliation: string;
  track: string;
  category: "energy" | "ai" | "manufacturing" | "operations" | "sanitation";
  abstract: string;
  keywords: string[];
}

export default function CallForPapers() {
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scrolling when paper modal is open
  useEffect(() => {
    if (selectedPaper) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [selectedPaper]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPaper(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const marqueeItems = [
    { text: "PRESENTED RESEARCH PAPERS" },
    { text: "12 PEER-REVIEWED PROCEEDINGS" },
    { text: "5 TECHNICAL FACULTY TRACKS" },
    { text: "LIVE ORAL DEFENSES & AWARDS" },
    { text: "ACADEMIC STAGE // KAAF AUDITORIUM" },
    { text: "FACULTY EVALUATION & BEST PAPER HONORS" },
  ];

  const presentedPapers: ResearchPaper[] = [
    {
      code: "PAPER #01",
      title:
        "Zero-Water, PCM-Buffered Zeotropic Organic Rankine Cycle (ORC) for Industrial Waste Heat Recovery",
      authors: "Stephanie Obiajulum & Engineering Research Team",
      lead: "S. Obiajulum & Team",
      affiliation: "Energy & Process Systems Engineering",
      track: "Energy, Sustainability & Climate Solutions",
      category: "energy",
      abstract:
        "Industrial manufacturing globally vents 25% to 40% of total energy input as low-to-medium grade thermal exhaust (100°C–300°C). This study develops a Zero-Water, Phase Change Material (PCM)-Buffered Zeotropic Organic Rankine Cycle (ORC). By utilizing non-azeotropic refrigerant mixtures and latent heat storage, the framework transforms variable thermal exhaust into reliable on-site electrical power with zero evaporative water consumption in arid industrial corridors.",
      keywords: ["Organic Rankine Cycle (ORC)", "Waste Heat Recovery", "Phase Change Material", "Zeotropic Blends"],
    },
    {
      code: "PAPER #02",
      title:
        "Design, Fabrication, and Empirical Evaluation of an IoT-Based LPG Monitoring Framework Using Low-Power Edge Computing",
      authors: "Alausa AbdulGafar Aremu & Olaniyan Johnson Gbolahan",
      lead: "A. A. Aremu & J. G. Olaniyan (UI IPE)",
      affiliation: "Department of Industrial & Production Engineering, University of Ibadan",
      track: "Engineering, Manufacturing & Industrial Systems",
      category: "manufacturing",
      abstract:
        "Domestic and industrial Liquefied Petroleum Gas (LPG) usage in sub-Saharan Africa suffers from opaque depletion tracking and undetected gas leaks. This paper presents an edge-computing monitoring platform combining precision strain-gauge load cells, MQ-6 hydrocarbon gas sniffing, and an ESP32 microcontroller. The framework delivers real-time cylinder tare tracking, predictive run-out date forecasting, and automated hazardous concentration shut-off warnings via MQTT.",
      keywords: ["IoT Edge Computing", "LPG Monitoring", "Load Cells", "MQ-6 Hydrocarbon Sensor", "ESP32"],
    },
    {
      code: "PAPER #03",
      title:
        "Enhancing Genomic Sequence Analysis Using Deep Learning: Replication and Performance Evaluation of the DeepSeqDenoise Framework",
      authors:
        "Oni Ruth Olamide, Eribake Folarin Favour, Azeez Olumide Oluwarotimi, Fawole Bolaji Daniel, Coker John O., Ojo Patricia E.",
      lead: "R. O. Oni, F. F. Eribake et al. (UNILAG)",
      affiliation: "Department of Biomedical Engineering, College of Medicine, University of Lagos",
      track: "AI & Healthcare / Biomedical Engineering",
      category: "ai",
      abstract:
        "High-throughput next-generation genomic sequencing often produces sequence noise that complicates disease-causing variant identification. This research replicates and evaluates DeepSeqDenoise, a deep convolutional autoencoder architecture. The model successfully filters sequencing noise, boosting downstream pathogenicity prediction accuracy to 94.2% while reducing false-positive mutation calls in inherited genetic disorders.",
      keywords: ["Genomic Sequencing", "Deep Learning", "Convolutional Autoencoders", "Noise Reduction", "Disease Prediction"],
    },
    {
      code: "PAPER #04",
      title:
        "Development of a Stochastic Economic Order Quantity Model under Exchange Rate Volatility using Mean-Variance Approach",
      authors: "Adelaja, F.O. and Onwe, S.M.",
      lead: "F. O. Adelaja & S. M. Onwe (UI IPE)",
      affiliation: "Department of Industrial and Production Engineering, University of Ibadan",
      track: "Operations Research & Supply Chain Systems",
      category: "operations",
      abstract:
        "Emerging manufacturing firms reliant on imported raw materials face severe financial risk from currency devaluation shocks. This paper formulates a stochastic Economic Order Quantity (EOQ) model integrating exchange rate fluctuations through a mean-variance trade-off approach. The model optimizes replenishment lot sizes and buffer safety stocks, reducing total inventory holding and procurement risk variance by over 27%.",
      keywords: ["Stochastic EOQ", "Exchange Rate Volatility", "Mean-Variance Approach", "Inventory Optimization"],
    },
    {
      code: "PAPER #05",
      title:
        "Design and Development of an AI-Powered Autonomous Robotic System for Real-Time Corrosion Detection in Metal Pipelines (Ratty Robot)",
      authors: "Nwakudu Goodness & Mechatronics Engineering Team",
      lead: "G. Nwakudu & Team",
      affiliation: "Mechanical & Mechatronics Engineering",
      track: "AI, Automation & Robotics",
      category: "ai",
      abstract:
        "Industrial pipeline networks in oil and gas and municipal distribution suffer from catastrophic internal wall loss and chemical pitting. This project presents 'Ratty Robot', an autonomous crawling in-line inspection robot equipped with edge computer vision and high-frequency ultrasonic thickness transducers. The robot autonomously maps internal pipeline geometry, detects micro-corrosion clusters in real time, and logs precise spatial coordinates without pipeline shutdown.",
      keywords: ["Pipeline Inspection", "Autonomous Robotics", "Non-Destructive Testing", "Ultrasonic Gauging", "Computer Vision"],
    },
    {
      code: "PAPER #06",
      title:
        "Design and Development of an Autonomous Lecture Assistant with Multimodal Biometric Attendance Verification and AI-Powered Study Support",
      authors: "Ndubuisi Daniel & Engineering Team",
      lead: "D. Ndubuisi & Team",
      affiliation: "Systems & Computer Engineering",
      track: "AI, Automation & Systems Engineering",
      category: "ai",
      abstract:
        "University lecture halls experience high administrative friction in capturing attendance and ensuring post-class concept retention. This paper demonstrates an autonomous classroom appliance integrating facial recognition biometric verification with edge speech transcription. The device verifies student attendance at the door while continuously converting lecturer audio into structured semantic lecture summaries, flashcards, and revision quizzes.",
      keywords: ["Multimodal Biometrics", "Facial Verification", "Speech-to-Text", "Classroom Automation", "Edge AI"],
    },
    {
      code: "PAPER #07",
      title:
        "Development of a Modified Cam Mechanism for Six-Stroke Operation of the TOPEX R175A Single-Cylinder CI Diesel Engine",
      authors: "Taofeeq Abdulselim & Automotive Engineering Team",
      lead: "T. Abdulselim & Team",
      affiliation: "Mechanical & Production Systems Engineering",
      track: "Engineering, Manufacturing & Industrial Systems",
      category: "manufacturing",
      abstract:
        "Conventional four-stroke compression-ignition diesel engines vent considerable exhaust heat without complete energy recovery. This paper details the physical redesign and kinematics of a modified cam mechanism that converts a standard TOPEX R175A single-cylinder diesel engine into a six-stroke cycle. By introducing a secondary water-injection power and scavenging stroke using a half-speed camshaft, thermal efficiency increases by 14% with significant particulate reduction.",
      keywords: ["Cam Mechanism", "Six-Stroke Diesel Engine", "TOPEX R175A", "Thermal Efficiency", "Valve Timing"],
    },
    {
      code: "PAPER #08",
      title:
        "Intelligent Solar Tracking System for Improving Solar Energy Utilisation",
      authors: "Ogbonnaya Joseph Daberechukwu & Olayinka Joshua Abimbola",
      lead: "J. D. Ogbonnaya & J. A. Olayinka (FUTA IPE)",
      affiliation: "Department of Industrial and Production Engineering, Federal University of Technology Akure",
      track: "Energy, Sustainability & Climate Solutions",
      category: "energy",
      abstract:
        "Fixed photovoltaic solar panel installations exhibit suboptimal power collection curves during morning and late afternoon hours. This study designs, builds, and evaluates an automated dual-axis solar tracking system driven by light-dependent resistor (LDR) differential sensing and closed-loop servo actuation. Experimental outdoor testing demonstrated a 34.2% boost in cumulative daily watt-hour output compared to co-located static solar arrays.",
      keywords: ["Dual-Axis Solar Tracking", "LDR Sensors", "Microcontroller", "Photovoltaic Efficiency", "Renewable Energy"],
    },
    {
      code: "PAPER #09",
      title:
        "Reducing Lead-Time Variance and Delivery Defects in Humanitarian Health-Commodity Supply Chain: A Six Sigma and Simulation Approach",
      authors: "Olaoluwa Osho, Olabisi Praise Oluwaferanmi, Alatise Abiola Olayiwola",
      lead: "O. Osho, P. O. Olabisi & A. O. Alatise (FUTA 500L)",
      affiliation: "Department of Industrial and Production Engineering, Federal University of Technology Akure",
      track: "Operations Research & Supply Chain Systems",
      category: "operations",
      abstract:
        "Supply chains delivering essential medicines and vaccines to rural clinics frequently fail due to unpredictable road transit delays and stockout spikes. Using the Six Sigma DMAIC framework coupled with discrete-event Monte Carlo simulation, this study analyzes empirical logistics data across primary healthcare routes. The proposed stochastic dispatching protocol cuts lead-time variance by 41% and virtually eliminates temperature-sensitive delivery spoilages.",
      keywords: ["Humanitarian Supply Chain", "Six Sigma DMAIC", "Monte Carlo Simulation", "Healthcare Logistics", "Lead-Time"],
    },
    {
      code: "PAPER #10",
      title:
        "Generative Synthesis of Carbon-Constrained Industrial Microgrids via Conditional Variational Autoencoders",
      authors: "Ekop Samuel Uko, Benjamin Emmanuel, Shonubi Temiloluwa",
      lead: "S. U. Ekop, E. Benjamin & T. Shonubi",
      affiliation: "Electrical & Energy Systems Engineering",
      track: "Energy, Sustainability & Climate Solutions",
      category: "energy",
      abstract:
        "Designing decentralized renewable microgrids for heavy manufacturing under strict carbon caps requires exploring immense multi-dimensional configuration spaces. This paper applies Conditional Variational Autoencoders (CVAEs) to synthesize Pareto-optimal microgrid generation portfolios (solar PV, battery storage, and biomass). The deep generative model produces feasible microgrid topologies 120× faster than traditional MILP solvers while strictly honoring carbon threshold bounds.",
      keywords: ["Industrial Microgrids", "Conditional VAE", "Deep Generative Models", "Carbon Accounting", "Renewable Dispatch"],
    },
    {
      code: "PAPER #11",
      title:
        "Bridging Energy Access and Affordability: An Intelligent Solar Financing Model for Rural Communities in Nigeria",
      authors: "Abayomi Akinsola, Ajayi Akiolade Victor, Lawal Kehinde Habibat, Odugbemi Heritage Inioluwa",
      lead: "A. Akinsola, A. V. Ajayi et al.",
      affiliation: "Energy Economics & Industrial Systems",
      track: "Energy, Sustainability & Climate Solutions",
      category: "energy",
      abstract:
        "Over 85 million Nigerians lack reliable grid electricity, but upfront capital costs hinder solar adoption in rural agricultural communities. This study proposes an intelligent risk-scoring solar financing model that ties pay-as-you-go (PAYG) repayment schedules to seasonal crop harvest cash flows. The algorithmic credit assessment reduces micro-utility default rates by 23% while accelerating off-grid rural solar electrification.",
      keywords: ["Rural Electrification", "Pay-As-You-Go Solar", "Microfinance Credit Scoring", "Agricultural Cash Flows"],
    },
    {
      code: "PAPER #12",
      title:
        "Design and Fabrication of a Power-Independent, Foot-Pedal Actuated Pneumatic Water Dispenser for Contact-Free Access",
      authors: "Olayinka Joshua Abimbola, Ogbonnaya Joseph Daberechukwu, Taiwo Temitope, Awopetu Toluwanimi, Ojo Victor",
      lead: "J. A. Olayinka, J. D. Ogbonnaya et al. (FUTA)",
      affiliation: "Department of Industrial and Production Engineering, Federal University of Technology Akure",
      track: "Mechanical Systems, Sanitation & Public Health",
      category: "sanitation",
      abstract:
        "High-density public institutions, universities, and rural health clinics require touchless water and sanitizer dispensing to prevent infectious cross-contamination, yet electronic sensor taps fail during persistent blackouts. This paper develops a purely mechanical, foot-pedal actuated pneumatic dispenser. The linkage balances human foot force with pneumatic piston valving, delivering dependable contact-free water dispensing with zero electrical dependence.",
      keywords: ["Pneumatic Actuation", "Contact-Free Sanitation", "Mechanical Linkages", "Zero-Power Design", "Public Health"],
    },
  ];

  const filterOptions = [
    { id: "all", label: "All Papers (12)" },
    { id: "energy", label: "Energy & Climate" },
    { id: "ai", label: "AI & Robotics" },
    { id: "manufacturing", label: "Manufacturing" },
    { id: "operations", label: "Operations & Supply Chain" },
    { id: "sanitation", label: "Sanitation & Public Health" },
  ];

  const filteredPapers =
    activeFilter === "all"
      ? presentedPapers
      : presentedPapers.filter((p) => p.category === activeFilter);

  return (
    <section id="call-for-papers" className="pt-0 pb-20 lg:pb-28 bg-[#ece7d8] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header - Flushed to top edge */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="rotate-[1.85deg]"
          bgClass="bg-[#040032]"
          borderClass="border-[#c6f552]"
          textClass="text-[#faf8f2]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-[#0a3825]" />
              <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block">
                PEER-REVIEWED UNDERGRADUATE & POSTGRADUATE RESEARCH
              </span>
            </div>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Research <span className="font-serif-italic text-[#0a3825]">Proceedings</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <ScrollRevealText
              text="Explore the 12 selected research papers being presented live today before our distinguished faculty judging panel on the Academic Stage. Spanning AI, renewable microgrids, and industrial systems."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed text-left justify-start"
              align="left"
              highlightWords={["12", "research", "presented", "faculty", "Academic", "microgrids"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Presented Papers Showcase Container */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#040032] text-[#faf8f2] p-6 sm:p-10 rounded-3xl border-2 border-[#040032] shadow-2xl space-y-8">
            <div className="space-y-6">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3.5 py-1 bg-[#c6f552] text-[#040032] rounded-full text-xs font-mono-meta font-extrabold uppercase shadow-sm">
                  12 ACCEPTED DEFENSE PAPERS
                </span>
                <span className="text-xs font-mono-meta text-[#3fffe8] font-bold tracking-wide">
                  ACADEMIC STAGE · KAAF AUDITORIUM
                </span>
              </div>

              {/* Title & Track Filter Chips */}
              <div className="space-y-4">
                <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#faf8f2]">
                  Selected Research Proceedings
                </h3>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setActiveFilter(opt.id)}
                      className={`px-3 py-1 rounded-full text-xs font-mono-meta font-bold transition-all ${
                        activeFilter === opt.id
                          ? "bg-[#c6f552] text-[#040032] shadow-md"
                          : "bg-white/10 hover:bg-white/15 text-white/80 border border-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Papers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPapers.map((paper, idx) => (
                  <div
                    key={paper.code}
                    onClick={() => setSelectedPaper(paper)}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c6f552] flex flex-col justify-between gap-4 transition-all duration-300 group cursor-pointer hover:bg-white/[0.08]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono-meta text-[#3fffe8] font-bold">
                          {paper.code}
                        </span>
                        <span className="text-[11px] font-mono-meta font-bold text-[#c6f552]/90 uppercase">
                          {paper.track}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-serif-display font-bold text-[#faf8f2] leading-snug group-hover:text-[#c6f552] transition-colors line-clamp-2">
                        {paper.title}
                      </h4>

                      <p className="text-xs text-white/70 line-clamp-2 font-sans leading-relaxed">
                        {paper.abstract}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono-meta text-white/80">
                      <span className="truncate max-w-[80%] text-white/90">
                        {paper.lead}
                      </span>
                      <span className="text-[#3fffe8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px] font-bold">
                        Read <ArrowUpRightIcon className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Schedule Strip */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono-meta text-white/70">
                <ClockIcon className="w-4 h-4 text-[#c6f552]" />
                <span>Live Session: <strong>Academic Stage Defenses (Session 13)</strong></span>
              </div>

              <a
                href="#schedule"
                className="inline-flex items-center gap-2 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta font-extrabold text-xs px-6 py-3 rounded-full transition-all active:scale-[0.98] group cursor-pointer shadow-md"
              >
                <span>VIEW COMPLETE TIMETABLE</span>
                <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Paper Detail Modal (Rendered via portal to cover entire screen outside section clip-paths) */}
      {selectedPaper && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPaper(null)}
        >
          <div
            className="bg-[#faf8f2] border-2 border-[#040032] text-[#040032] rounded-2xl sm:rounded-3xl w-[94vw] sm:w-[92vw] md:w-[88vw] lg:w-full lg:max-w-2xl max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh] overflow-y-auto p-4 sm:p-6 lg:p-7 shadow-2xl space-y-4 sm:space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPaper(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-full bg-[#040032]/5 hover:bg-[#040032]/10 text-[#040032] transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-meta font-extrabold uppercase bg-[#040032] text-[#c6f552]">
                  {selectedPaper.code}
                </span>
                <span className="text-[11px] sm:text-xs font-mono-meta text-[#0a3825] font-bold">
                  {selectedPaper.track}
                </span>
              </div>
              <h3 className="font-serif-display text-lg sm:text-xl lg:text-2xl font-bold text-[#040032] leading-snug">
                {selectedPaper.title}
              </h3>
            </div>

            {/* Authors & Institutional Affiliation */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ece7d8]/60 border border-[#040032]/10 space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#0a3825] uppercase tracking-wider">
                <AcademicCapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Authors & Affiliation</span>
              </div>
              <p className="text-xs sm:text-sm font-sans font-bold text-[#040032]">
                {selectedPaper.authors}
              </p>
              <p className="text-[11px] sm:text-xs font-mono-meta text-[#040032]/80">
                {selectedPaper.affiliation}
              </p>
            </div>

            {/* Abstract Section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#040032] uppercase tracking-wider">
                <DocumentTextIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0a3825]" />
                <span>Executive Abstract & Methodology</span>
              </div>
              <p className="text-xs sm:text-sm text-[#040032]/90 font-sans leading-relaxed p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#040032]/10 shadow-sm">
                {selectedPaper.abstract}
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta font-bold text-[#040032]/70 uppercase tracking-wider">
                <TagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0a3825]" />
                <span>Keywords & Domain Focus</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedPaper.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-0.5 rounded-lg bg-[#040032] text-[#faf8f2] text-[10px] sm:text-xs font-mono-meta font-medium border border-[#040032]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3.5 border-t border-[#040032]/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono-meta text-[#0a3825] font-bold">
                <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Live Oral Defense · Academic Stage</span>
              </div>

              <button
                onClick={() => setSelectedPaper(null)}
                className="px-4 py-1.5 rounded-full bg-[#040032] text-[#c6f552] text-xs font-mono-meta font-bold hover:bg-[#0a3825] transition-colors"
              >
                Close Abstract
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
