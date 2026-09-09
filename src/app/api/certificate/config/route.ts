import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { DEFAULT_CERT_CONFIG, CertificateConfigType } from "@/lib/certificateConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory fallback if MongoDB has transient network issues
let memoryCertConfig: CertificateConfigType = DEFAULT_CERT_CONFIG;
let memoryUpdatedAt = new Date().toISOString();

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection("conference_state");

    const record = await collection.findOne({ _id: "certificate_coords_config" as any });

    if (record && record.config && record.config.coords?.name) {
      return NextResponse.json(
        {
          success: true,
          config: record.config,
          source: "database",
          updatedAt: record.updatedAt,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        config: memoryCertConfig,
        source: "default",
        updatedAt: memoryUpdatedAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.warn("Falling back to memory/default certificate config:", error?.message);
    return NextResponse.json(
      {
        success: true,
        config: memoryCertConfig,
        source: "memory_fallback",
        updatedAt: memoryUpdatedAt,
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = body.config as CertificateConfigType;

    if (!config || !config.coords || !config.coords.name) {
      return NextResponse.json(
        { error: "Invalid certificate configuration payload" },
        { status: 400 }
      );
    }

    // Update in-memory fallback immediately
    memoryCertConfig = config;
    memoryUpdatedAt = new Date().toISOString();

    // Persist to MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection("conference_state");

      await collection.updateOne(
        { _id: "certificate_coords_config" as any },
        {
          $set: {
            config,
            updatedAt: memoryUpdatedAt,
            updatedBy: "VisualCoordinateMapperStudio",
          },
        },
        { upsert: true }
      );

      return NextResponse.json(
        {
          success: true,
          message: "Certificate configuration saved globally to database.",
          config,
          source: "database",
          updatedAt: memoryUpdatedAt,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.warn("Failed to persist certificate config to MongoDB, saved to memory:", dbError?.message);
      return NextResponse.json(
        {
          success: true,
          message: "Saved to active server memory (DB fallback mode).",
          config: memoryCertConfig,
          source: "memory_fallback",
          updatedAt: memoryUpdatedAt,
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save certificate configuration" },
      { status: 500 }
    );
  }
}
