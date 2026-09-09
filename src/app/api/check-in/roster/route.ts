import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getPaymentsCollection,
  getUsersCollection,
  getCheckinsCollection,
  CONFERENCE_EVENT_ID,
} from "@/lib/mongodb";
import { OFFICIAL_PAID_DIRECTORY } from "@/lib/paidParticipantsDirectory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const paymentsCollection = await getPaymentsCollection();
    const usersCollection = await getUsersCollection();
    const checkinsCollection = await getCheckinsCollection();

    const [payment, allCheckins] = await Promise.all([
      paymentsCollection.findOne({ _id: new ObjectId(CONFERENCE_EVENT_ID) }),
      checkinsCollection.find({ eventId: CONFERENCE_EVENT_ID }).toArray(),
    ]);

    // Build fast lookup maps for existing check-ins
    const checkinByMatric = new Map<string, any>();
    const checkinByEmail = new Map<string, any>();
    const checkinById = new Map<string, any>();
    const checkinByName = new Map<string, any>();

    allCheckins.forEach((c) => {
      if (c.studentId) checkinById.set(c.studentId.toString(), c);
      if (c.matricNumber) checkinByMatric.set(c.matricNumber.trim().toLowerCase(), c);
      if (c.email) checkinByEmail.set(c.email.trim().toLowerCase(), c);
      if (c.studentName) checkinByName.set(c.studentName.trim().toLowerCase(), c);
    });

    // Build fast lookup maps for users
    const allUsers = await usersCollection.find({}).toArray();
    const userByMatric = new Map<string, any>();
    const userByEmail = new Map<string, any>();
    const userById = new Map<string, any>();

    allUsers.forEach((u) => {
      userById.set(u._id.toString(), u);
      if (u.matricNumber) userByMatric.set(u.matricNumber.trim().toLowerCase(), u);
      if (u.email) userByEmail.set(u.email.trim().toLowerCase(), u);
      if (u.institutionalEmail) userByEmail.set(u.institutionalEmail.trim().toLowerCase(), u);
      if (u.secondaryEmail) userByEmail.set(u.secondaryEmail.trim().toLowerCase(), u);
    });

    // Track matched participant matric / emails to avoid duplicate entries
    const seenKeys = new Set<string>();

    // 1. Build roster from the 48 official paid participants
    const roster = OFFICIAL_PAID_DIRECTORY.map((p) => {
      const cleanMatric = p.matricNumber.trim().toLowerCase();
      const cleanEmail = p.email.trim().toLowerCase();
      const cleanName = p.fullName.trim().toLowerCase();
      const cleanTicketName = p.ticketName.trim().toLowerCase();

      seenKeys.add(cleanMatric);
      if (cleanEmail) seenKeys.add(cleanEmail);

      // Match checkin
      const checkin =
        checkinByMatric.get(cleanMatric) ||
        (cleanEmail ? checkinByEmail.get(cleanEmail) : null) ||
        checkinByName.get(cleanName) ||
        checkinByName.get(cleanTicketName) ||
        checkinById.get(p.id);

      // Match user
      const user =
        userByMatric.get(cleanMatric) ||
        (cleanEmail ? userByEmail.get(cleanEmail) : null);

      const studentId = user?._id?.toString() || (checkin?.studentId ? checkin.studentId.toString() : p.id);

      return {
        studentId,
        orderNumber: p.orderNumber,
        name: p.fullName,
        ticketName: p.ticketName,
        matricNumber: p.matricNumber,
        email: p.email,
        phone: p.phone || "",
        department: p.department,
        level: user?.currentLevel || user?.level || "Delegate",
        isCheckedIn: !!checkin,
        checkedInAt: checkin?.checkedInAt || null,
        checkedInBy: checkin?.checkedInBy || null,
        method: checkin?.method || null,
        tagType: checkin?.tagType || "paid_vip",
      };
    });

    // 2. Also append any extra users from payment.paidBy not covered in official directory
    const paidIds: string[] = (payment?.paidBy || []).map((id: any) => id.toString());
    paidIds.forEach((id) => {
      const u = userById.get(id);
      const matricKey = (u?.matricNumber || "").trim().toLowerCase();
      const emailKey = (u?.email || "").trim().toLowerCase();

      if ((matricKey && seenKeys.has(matricKey)) || (emailKey && seenKeys.has(emailKey))) {
        return; // Already in roster
      }

      const checkin = checkinById.get(id);
      const name = u
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "Paid Attendee"
        : "Paid Attendee";

      roster.push({
        studentId: id,
        orderNumber: roster.length + 1,
        name,
        ticketName: name,
        matricNumber: u?.matricNumber || "N/A",
        email: u?.email || "N/A",
        phone: u?.phoneNumber || u?.phone || "",
        department: u?.department || "Industrial & Production Engineering",
        level: u?.currentLevel || u?.level || "Delegate",
        isCheckedIn: !!checkin,
        checkedInAt: checkin?.checkedInAt || null,
        checkedInBy: checkin?.checkedInBy || null,
        method: checkin?.method || null,
        tagType: checkin?.tagType || "paid_vip",
      });
    });

    // Sort: Pending check-ins first, then checked-in; secondary sort by orderNumber
    roster.sort((a, b) => {
      if (a.isCheckedIn === b.isCheckedIn) {
        return (a.orderNumber || 999) - (b.orderNumber || 999);
      }
      return a.isCheckedIn ? 1 : -1;
    });

    return NextResponse.json(
      {
        totalPaid: roster.length,
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

