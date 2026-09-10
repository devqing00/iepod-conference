"use client";

import { UserGroupIcon, AcademicCapIcon, TrophyIcon, CpuChipIcon } from "@heroicons/react/24/outline";

export default function StatsGrid() {
  const stats = [
    {
      value: "500+",
      label: "Expected Delegates & Alumni",
      badge: "Full Capacity",
      icon: UserGroupIcon,
      accentColor: "border-[#c6f552]",
      badgeBg: "bg-[#c6f552] text-[#040032]",
    },
    {
      value: "150+",
      label: "VC Research Publications",
      badge: "Academic Impact",
      icon: AcademicCapIcon,
      accentColor: "border-[#040032]",
      badgeBg: "bg-[#040032] text-[#3fffe8]",
    },
    {
      value: "2026",
      label: "Annual IESA Edition",
      badge: "Flagship Event",
      icon: TrophyIcon,
      accentColor: "border-[#00e5ff]",
      badgeBg: "bg-[#040032] text-[#c6f552]",
    },
    {
      value: "04",
      label: "Technical & AI Tracks",
      badge: "Single Day",
      icon: CpuChipIcon,
      accentColor: "border-[#3fffe8]",
      badgeBg: "bg-[#3fffe8] text-[#040032]",
    },
  ];

  return (
    <section className="py-12 bg-[#faf8f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-[#ece7d8] border-2 ${stat.accentColor} rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#040032] text-[#c6f552] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono-meta font-extrabold px-2.5 py-0.5 rounded-full uppercase ${stat.badgeBg}`}>
                    {stat.badge}
                  </span>
                </div>

                <div>
                  <div className="font-serif-display text-4xl sm:text-5xl font-bold text-[#040032] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#040032]/80">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
