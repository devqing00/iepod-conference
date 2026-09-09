"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingParticle {
  id: string;
  emoji: string;
  xOffset: number;
  rotation: number;
  scale: number;
}

const REACTIONS = [
  { id: "applause", emoji: "👏", label: "Applause", title: "Applaud speaker" },
  { id: "insight", emoji: "💡", label: "Insight", title: "Key insight!" },
  { id: "fire", emoji: "🔥", label: "Fire", title: "Great point!" },
  { id: "energy", emoji: "⚡", label: "Energy", title: "Electric talk!" },
];

export default function LiveReactionOverlay() {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    applause: 142,
    insight: 87,
    fire: 219,
    energy: 104,
  });
  const [lastTapped, setLastTapped] = useState<string | null>(null);
  const particleIdRef = useRef(0);
  const lastSyncTimeRef = useRef<number>(Date.now());
  const localBurstIdsRef = useRef<Set<string>>(new Set());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const spawnParticle = useCallback((emoji: string) => {
    const newId = `p-${Date.now()}-${particleIdRef.current++}`;
    const xOffset = (Math.random() - 0.5) * 70; // random drift -35px to +35px
    const rotation = (Math.random() - 0.5) * 45; // slight tilt
    const scale = 0.9 + Math.random() * 0.45;

    setParticles((prev) => [
      ...prev.slice(-24), // keep max 24 active particles for 60fps performance
      { id: newId, emoji, xOffset, rotation, scale },
    ]);

    // Clean up particle after animation finishes
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 1400);
  }, []);

  // Multi-tab instant sync on the same device using BroadcastChannel (0ms latency)
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("iesa_live_reactions");
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { id, emoji } = event.data || {};
        if (id && emoji && !localBurstIdsRef.current.has(id)) {
          spawnParticle(emoji);
        }
      };

      return () => {
        bc.close();
      };
    }
  }, [spawnParticle]);

  // Real-time synchronization across all audience devices in KAAF Auditorium (every 2.5s)
  useEffect(() => {
    let isMounted = true;

    const syncAudienceReactions = async () => {
      try {
        const since = lastSyncTimeRef.current;
        const res = await fetch(`/api/reactions?since=${since}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();

        if (isMounted) {
          if (data.serverTime) {
            lastSyncTimeRef.current = data.serverTime;
          }
          if (data.counts) {
            setCounts(data.counts);
          }

          // If other participants in the hall reacted, float their emojis across our screen!
          if (
            data.bursts &&
            Array.isArray(data.bursts) &&
            data.bursts.length > 0
          ) {
            data.bursts.forEach((burst: any, index: number) => {
              if (!localBurstIdsRef.current.has(burst.id)) {
                // Stagger incoming audience reactions slightly for a smooth, natural flow
                setTimeout(() => {
                  if (isMounted) {
                    spawnParticle(burst.emoji);
                  }
                }, Math.min(index * 90, 800));
              }
            });
          }
        }
      } catch {
        // Silently retain local counts
      }
    };

    syncAudienceReactions();
    const interval = setInterval(syncAudienceReactions, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [spawnParticle]);

  const handleSendReaction = async (reactionId: string, emoji: string) => {
    const burstId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    localBurstIdsRef.current.add(burstId);

    setLastTapped(reactionId);
    setTimeout(() => setLastTapped(null), 300);

    // Optimistically spawn local particle
    spawnParticle(emoji);
    if (Math.random() > 0.4) {
      setTimeout(() => spawnParticle(emoji), 110);
    }

    // Broadcast immediately to any other tabs open on this device
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        id: burstId,
        emoji,
        type: reactionId,
      });
    }

    // Increment local counter
    setCounts((prev) => ({
      ...prev,
      [reactionId]: (prev[reactionId] || 0) + 1,
    }));

    // Transmit to server so all other participants in KAAF Auditorium see it
    try {
      fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reactionId, burstId }),
      }).catch(() => {});
    } catch {
      // Ignored
    }
  };

  return (
    <>
      {/* Floating Particles Canvas (pointer-events-none so attendee can click through) */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-[9995] pointer-events-none flex flex-col items-center justify-end h-64 w-36 overflow-visible">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 0,
                y: 10,
                x: particle.xOffset * 0.3,
                scale: 0.6,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -180,
                x: particle.xOffset,
                scale: [0.6, particle.scale * 1.1, particle.scale, 0.7],
                rotate: particle.rotation,
              }}
              transition={{
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute select-none text-2xl sm:text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            >
              {particle.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Glass Reaction Dock */}
      <div className="fixed bottom-4 right-3 sm:right-6 z-[9990] flex items-center">
        <div
          className="relative flex items-center p-1 rounded-full bg-[#040032]/85 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-all duration-300"
          style={{
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(198, 245, 82, 0.12)",
          }}
        >
          {/* Reaction Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-1 py-0.5">
            {REACTIONS.map((item) => {
              const isPressed = lastTapped === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSendReaction(item.id, item.emoji)}
                  title={item.title}
                  className={`relative group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all transform-gpu select-none cursor-pointer ${
                    isPressed
                      ? "scale-125 bg-[#c6f552]/30"
                      : "hover:scale-110 active:scale-95 hover:bg-white/10"
                  }`}
                  aria-label={item.label}
                >
                  <span className="text-base sm:text-lg transform-gpu transition-transform group-hover:scale-115">
                    {item.emoji}
                  </span>

                  {/* Micro Tooltip / Count on Hover */}
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#040032] border border-white/20 text-[#c6f552] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap pointer-events-none shadow-md">
                    {counts[item.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Minimal live hall indicator */}
          <div className="pr-2 pl-2 hidden sm:flex items-center gap-1.5 border-l border-white/10 text-[10px] font-mono text-white/60">
            <span>Live</span>
          </div>
        </div>
      </div>
    </>
  );
}
