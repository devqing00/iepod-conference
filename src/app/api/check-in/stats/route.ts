import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getPaymentsCollection,
  getCheckinsCollection,
  CONFERENCE_EVENT_ID,
} from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const paymentsCollection = await getPaymentsCollection();
    const checkinsCollection = await getCheckinsCollection();

    const payment = await paymentsCollection.findOne({
      _id: new ObjectId(CONFERENCE_EVENT_ID),
    });

    const totalPaid = payment?.paidBy?.length || 28;

    const [checkedInCount, recentCheckins] = await Promise.all([
      checkinsCollection.countDocuments({ eventId: CONFERENCE_EVENT_ID }),
      checkinsCollection
        .find({ eventId: CONFERENCE_EVENT_ID })
        .sort({ checkedInAt: -1 })
        .limit(10)
        .toArray(),
    ]);

    const pendingCount = Math.max(0, totalPaid - checkedInCount);
    const percent = totalPaid > 0 ? Math.round((checkedInCount / totalPaid) * 100) : 0;

    return NextResponse.json(
      {
        totalPaid,
        checkedInCount,
        pendingCount,
        percent,
        recentCheckins: recentCheckins.map((item) => ({
          id: item._id?.toString(),
          studentId: item.studentId?.toString(),
          studentName: item.studentName,
          matricNumber: item.matricNumber,
          email: item.email,
          level: item.level,
          department: item.department,
          checkedInAt: item.checkedInAt,
          checkedInBy: item.checkedInBy,
          method: item.method,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance stats", details: error.message },
      { status: 500 }
    );
  }
}
