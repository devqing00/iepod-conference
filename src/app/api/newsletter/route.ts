import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address format." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("iesa_db");
    const subscribersCollection = db.collection("newsletter_subscribers");

    await subscribersCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          source: "footer_newsletter",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully! Lecture slides and resources will be delivered to your inbox.",
    });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Unable to process subscription at this time. Please try again later." },
      { status: 500 }
    );
  }
}
