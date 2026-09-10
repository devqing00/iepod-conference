"use client";

import { SparklesIcon, FireIcon, BoltIcon, StarIcon } from "@heroicons/react/24/solid";

interface MarqueeItem {
  text: string;
  icon?: any;
  color?: string;
}

interface TailoredMarqueeStripProps {
  items: MarqueeItem[];
  rotateClass?: string;
  bgClass?: string;
  borderClass?: string;
  textClass?: string;
}

export default function TailoredMarqueeStrip({
  items,
  rotateClass = "-rotate-[1.85deg]",
  bgClass = "bg-[#040032]",
  borderClass = "border-[#c6f552]",
  textClass = "text-[#faf8f2]",
}: TailoredMarqueeStripProps) {
  const icons = [SparklesIcon, FireIcon, BoltIcon, StarIcon];

  return (
    <div className="w-full relative z-30 overflow-visible pt-[7.4px] md:pt-[13.3px] lg:pt-[17.1px] xl:pt-6 2xl:pt-10.5 pb-2">
      <div className={`w-[112%] -ml-[6%] ${rotateClass} overflow-visible`}>
        <div className={`w-full ${bgClass} ${textClass} py-3.5 border-y-2 ${borderClass} shadow-2xl overflow-hidden`}>
          <div
            className="marquee-track flex items-center gap-8 w-max animate-marquee transform-gpu will-change-transform"
          >
            {[...items, ...items, ...items, ...items, ...items, ...items].map((item, idx) => {
              const IconComponent = item.icon || icons[idx % icons.length];
              return (
                <div key={idx} className="flex items-center gap-3.5 whitespace-nowrap">
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color || "text-[#c6f552]"}`} />
                  <span className="font-mono-meta text-xs sm:text-sm font-extrabold tracking-widest uppercase">
                    {item.text}
                  </span>
                  <span className="opacity-40 text-xs sm:text-sm">✦</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
