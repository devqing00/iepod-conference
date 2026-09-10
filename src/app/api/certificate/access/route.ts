import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory fallback if MongoDB has transient network issues
// By default, locked until after the program as requested
let memoryCertificateUnlocked = false;
let memoryUpdatedAt = new Date().toISOString();

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection("conference_state");

    const record = await collection.findOne({ _id: "certificate_access" as any });

    if (record) {
      return NextResponse.json(
        {
          success: true,
          isUnlocked: Boolean(record.isUnlocked),
          updatedAt: record.updatedAt || memoryUpdatedAt,
          source: "database",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isUnlocked: memoryCertificateUnlocked,
        updatedAt: memoryUpdatedAt,
        source: "default",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.warn("Falling back to memory certificate access state:", error?.message);
    return NextResponse.json(
      {
        success: true,
        isUnlocked: memoryCertificateUnlocked,
        updatedAt: memoryUpdatedAt,
        source: "memory_fallback",
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { isUnlocked } = body;

    if (typeof isUnlocked !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request: isUnlocked must be a boolean" },
        { status: 400 }
      );
    }

    memoryCertificateUnlocked = isUnlocked;
    memoryUpdatedAt = new Date().toISOString();

    try {
      const db = await getDatabase();
      const collection = db.collection("conference_state");

      await collection.updateOne(
        { _id: "certificate_access" as any },
        {
          $set: {
            isUnlocked,
            updatedAt: memoryUpdatedAt,
            updatedBy: "AdminStageCoordinator",
          },
        },
        { upsert: true }
      );

      return NextResponse.json(
        {
          success: true,
          isUnlocked,
          message: isUnlocked
            ? "Certificate portal unlocked for delegates!"
            : "Certificate portal locked until after the conference.",
          updatedAt: memoryUpdatedAt,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.warn("Failed to persist certificate access to MongoDB:", dbError?.message);
      return NextResponse.json(
        {
          success: true,
          isUnlocked: memoryCertificateUnlocked,
          message: "Updated in server memory (database fallback mode).",
          updatedAt: memoryUpdatedAt,
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update certificate access state" },
      { status: 500 }
    );
  }
}
