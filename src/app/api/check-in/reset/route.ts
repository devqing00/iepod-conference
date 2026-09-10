import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCheckinsCollection, CONFERENCE_EVENT_ID } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    const checkinsCollection = await getCheckinsCollection();

    // Target all check-ins for the active conference event
    const filter = {
      $or: [
        { eventId: CONFERENCE_EVENT_ID },
        { eventId: new ObjectId(CONFERENCE_EVENT_ID) as any },
      ],
    };

    const countBefore = await checkinsCollection.countDocuments(filter);
    const deleteResult = await checkinsCollection.deleteMany(filter);

    return NextResponse.json(
      {
        success: true,
        deletedCount: deleteResult.deletedCount,
        countBefore,
        message: `Successfully cleared ${deleteResult.deletedCount} check-in record(s). Checked-in count has been reset to 0.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset check-ins API error:", error);
    return NextResponse.json(
      {
        error: "Failed to reset check-in attendance records",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
