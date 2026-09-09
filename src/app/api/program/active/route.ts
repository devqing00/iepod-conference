import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { OFFICIAL_PROGRAM_SESSIONS } from "@/lib/programSessions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory fallback in case of MongoDB transient network issues
let memoryActiveId = "session-01";
let memoryUpdatedAt = new Date().toISOString();

export async function GET() {
  try {
    const db = await getDatabase();
    const stateCollection = db.collection("conference_state");

    const state = await stateCollection.findOne({ _id: "active_program" as any });

    const activeId = state?.activeSessionId || memoryActiveId || "session-01";
    const foundSession =
      OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === activeId) ||
      OFFICIAL_PROGRAM_SESSIONS[0];

    return NextResponse.json(
      {
        activeSessionId: foundSession.id,
        activeSessionTitle: foundSession.shortTitle,
        activeSession: foundSession,
        updatedAt: state?.updatedAt || memoryUpdatedAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.warn("Falling back to memory active session:", error.message);
    const foundSession =
      OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === memoryActiveId) ||
      OFFICIAL_PROGRAM_SESSIONS[0];

    return NextResponse.json(
      {
        activeSessionId: foundSession.id,
        activeSessionTitle: foundSession.shortTitle,
        activeSession: foundSession,
        updatedAt: memoryUpdatedAt,
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activeSessionId, activeSessionTitle } = body;

    if (!activeSessionId) {
      return NextResponse.json(
        { error: "Missing activeSessionId" },
        { status: 400 }
      );
    }

    memoryActiveId = activeSessionId;
    memoryUpdatedAt = new Date().toISOString();

    const foundSession =
      OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === activeSessionId) || {
        id: activeSessionId,
        orderNumber: 1,
        title: activeSessionTitle || "Live Session",
        shortTitle: activeSessionTitle || "Live Session",
        category: "Live Stage",
        duration: "Active",
        location: "KAAF Auditorium",
      };

    try {
      const db = await getDatabase();
      const stateCollection = db.collection("conference_state");

      const now = new Date();
      await stateCollection.updateOne(
        { _id: "active_program" as any },
        {
          $set: {
            activeSessionId,
            activeSessionTitle: foundSession.shortTitle,
            updatedAt: now,
          },
        },
        { upsert: true }
      );
    } catch (dbErr) {
      console.warn("MongoDB update active program note:", dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        activeSessionId: foundSession.id,
        activeSessionTitle: foundSession.shortTitle,
        activeSession: foundSession,
        updatedAt: memoryUpdatedAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to update active program status:", error);
    return NextResponse.json(
      { error: "Failed to update active program status", details: error.message },
      { status: 500 }
    );
  }
}
