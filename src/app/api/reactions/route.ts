import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

interface LiveBurst {
  id: string;
  type: string;
  emoji: string;
  createdAt: number;
}

const EMOJI_MAP: Record<string, string> = {
  applause: "👏",
  insight: "💡",
  fire: "🔥",
  energy: "⚡",
};

// Rolling queue of live bursts broadcast to all active attendees
const recentBursts: LiveBurst[] = [];

// In-memory counters for ultra-fast reaction response & offline fallback
const reactionCounts: Record<string, number> = {
  applause: 142,
  insight: 87,
  fire: 219,
  energy: 104,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const since = Number(searchParams.get("since") || "0");

    // Filter bursts that occurred strictly after `since`
    const newBursts =
      since > 0 ? recentBursts.filter((b) => b.createdAt > since) : [];

    return NextResponse.json({
      success: true,
      counts: reactionCounts,
      total: Object.values(reactionCounts).reduce((a, b) => a + b, 0),
      bursts: newBursts,
      serverTime: Date.now(),
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      counts: reactionCounts,
      total: Object.values(reactionCounts).reduce((a, b) => a + b, 0),
      bursts: [],
      serverTime: Date.now(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, sessionId, burstId } = body;

    const validTypes = ["applause", "insight", "fire", "energy"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    // Increment in-memory counter
    reactionCounts[type] = (reactionCounts[type] || 0) + 1;

    // Add to rolling burst queue for real-time audience broadcast
    const uniqueId =
      burstId || `rb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    recentBursts.push({
      id: uniqueId,
      type,
      emoji: EMOJI_MAP[type] || "👏",
      createdAt: Date.now(),
    });

    // Keep rolling window bounded (last 60 bursts)
    if (recentBursts.length > 60) {
      recentBursts.splice(0, recentBursts.length - 60);
    }

    // Asynchronously log to MongoDB stage_reactions collection
    try {
      const db = await getDatabase();
      const collection = db.collection("stage_reactions");
      await collection.insertOne({
        type,
        sessionId: sessionId || "general",
        createdAt: new Date(),
        ip: req.headers.get("x-forwarded-for") || "anonymous",
      });
    } catch (dbErr) {
      console.warn("Reactions DB write skipped:", dbErr);
    }

    return NextResponse.json({
      success: true,
      type,
      burstId: uniqueId,
      currentCount: reactionCounts[type],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit reaction" },
      { status: 500 }
    );
  }
}
