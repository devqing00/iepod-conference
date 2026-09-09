import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getPaymentsCollection,
  getUsersCollection,
  getCheckinsCollection,
  CONFERENCE_EVENT_ID,
} from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const paymentsCollection = await getPaymentsCollection();
    const usersCollection = await getUsersCollection();
    const checkinsCollection = await getCheckinsCollection();

    const payment = await paymentsCollection.findOne({
      _id: new ObjectId(CONFERENCE_EVENT_ID),
    });

    const paidIds = (payment?.paidBy || []).map((id: any) => id.toString());

    // Fetch user details for all paidIds
    const objectIds = paidIds
      .filter((id: string) => /^[a-f0-9]{24}$/i.test(id))
      .map((id: string) => new ObjectId(id));

    const [users, checkins] = await Promise.all([
      usersCollection.find({ _id: { $in: objectIds } }).toArray(),
      checkinsCollection.find({ eventId: CONFERENCE_EVENT_ID }).toArray(),
    ]);

    const checkinMap = new Map<string, any>();
    checkins.forEach((c) => {
      checkinMap.set(c.studentId.toString(), c);
    });

    const userMap = new Map<string, any>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), u);
    });

    const roster = paidIds.map((id: string) => {
      const u = userMap.get(id);
      const checkin = checkinMap.get(id);

      const name = u
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "Attendee"
        : "Paid Attendee";
      const matricNumber = u?.matricNumber || "N/A";
      const email =
        u?.email || u?.institutionalEmail || u?.secondaryEmail || "N/A";
      const level = u?.currentLevel || u?.level || "N/A";
      const department = u?.department || "Industrial Engineering";

      return {
        studentId: id,
        name,
        matricNumber,
        email,
        level,
        department,
        isCheckedIn: !!checkin,
        checkedInAt: checkin?.checkedInAt || null,
        checkedInBy: checkin?.checkedInBy || null,
        method: checkin?.method || null,
      };
    });

    // Sort: Pending first, then by name
    roster.sort((a, b) => {
      if (a.isCheckedIn === b.isCheckedIn) {
        return a.name.localeCompare(b.name);
      }
      return a.isCheckedIn ? 1 : -1;
    });

    return NextResponse.json(
      {
        totalPaid: paidIds.length,
        roster,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Roster API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendee roster", details: error.message },
      { status: 500 }
    );
  }
}
