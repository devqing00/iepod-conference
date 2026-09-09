import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getPaymentsCollection,
  getCheckinsCollection,
  CONFERENCE_EVENT_ID,
} from "@/lib/mongodb";
import { OFFICIAL_PAID_DIRECTORY } from "@/lib/paidParticipantsDirectory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const paymentsCollection = await getPaymentsCollection();
    const checkinsCollection = await getCheckinsCollection();

    const payment = await paymentsCollection.findOne({
      _id: new ObjectId(CONFERENCE_EVENT_ID),
    });

    const totalPaid = Math.max(payment?.paidBy?.length || 0, OFFICIAL_PAID_DIRECTORY.length);

    const [allEventCheckins, recentCheckins] = await Promise.all([
      checkinsCollection.find({ eventId: CONFERENCE_EVENT_ID }).toArray(),
      checkinsCollection
        .find({ eventId: CONFERENCE_EVENT_ID })
        .sort({ checkedInAt: -1 })
        .limit(10)
        .toArray(),
    ]);

    const checkedInCount = allEventCheckins.length;

    const paidMatricSet = new Set(
      OFFICIAL_PAID_DIRECTORY.map((p) => p.matricNumber.trim().toLowerCase())
    );
    const paidEmailSet = new Set(
      OFFICIAL_PAID_DIRECTORY.map((p) => p.email.trim().toLowerCase())
    );
    const paidDbIds = new Set(
      (payment?.paidBy || []).map((id: any) => id.toString())
    );

    // Count checkins that are paid VIP
    const paidCheckedInCount = allEventCheckins.filter((c) => {
      if (c.tagType === "paid_vip") return true;
      if (c.studentId && paidDbIds.has(c.studentId.toString())) return true;
      if (c.matricNumber && paidMatricSet.has(c.matricNumber.trim().toLowerCase())) return true;
      if (c.email && paidEmailSet.has(c.email.trim().toLowerCase())) return true;
      return false;
    }).length;


    const pendingCount = Math.max(0, totalPaid - paidCheckedInCount);
    const percent = totalPaid > 0 ? Math.round((paidCheckedInCount / totalPaid) * 100) : 0;

    return NextResponse.json(
      {
        totalPaid,
        checkedInCount,
        paidCheckedInCount,
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
