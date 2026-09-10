import { NextResponse } from "next/server";
import { getCheckinsCollection, CONFERENCE_EVENT_ID } from "@/lib/mongodb";
import registeredAttendeesData from "@/lib/registeredAttendees.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface RegularRosterItem {
  id: string;
  name: string;
  matricNumber?: string;
  email: string;
  phone?: string;
  department: string;
  institution: string;
  level: string;
  isCheckedIn: boolean;
  checkedInAt?: string | Date | null;
  checkedInBy?: string | null;
  tagNumber?: string | null;
  source: "pre_registered_form" | "on_site_registration";
}

export async function GET() {
  try {
    const checkinsCollection = await getCheckinsCollection();

    // Fetch all check-ins for the conference
    const allCheckins = await checkinsCollection
      .find({ eventId: CONFERENCE_EVENT_ID })
      .toArray();

    // Build lookup maps for existing check-ins
    const checkinByEmail = new Map<string, any>();
    const checkinByName = new Map<string, any>();
    const checkinByPhone = new Map<string, any>();
    const checkinById = new Map<string, any>();
    const checkinByMatric = new Map<string, any>();

    allCheckins.forEach((c) => {
      if (c.email) checkinByEmail.set(c.email.trim().toLowerCase(), c);
      if (c.studentName) checkinByName.set(c.studentName.trim().toLowerCase(), c);
      if ((c as any).phone) checkinByPhone.set(String((c as any).phone).replace(/\s+/g, ""), c);
      if (c.matricNumber) checkinByMatric.set(c.matricNumber.trim().toUpperCase(), c);
      if (c.studentId) checkinById.set(c.studentId.toString(), c);
    });

    const seenKeys = new Set<string>();
    const roster: RegularRosterItem[] = [];

    // 1. Process 188 pre-registered form attendees
    for (const item of registeredAttendeesData as any[]) {
      const cleanEmail = (item.email || "").trim().toLowerCase();
      const cleanName = (item.name || "").trim().toLowerCase();
      const cleanPhone = (item.phone || "").replace(/\s+/g, "");

      if (cleanEmail) seenKeys.add(cleanEmail);
      if (cleanName) seenKeys.add(cleanName);

      // Match checkin by email, name, or phone
      const checkin =
        (cleanEmail ? checkinByEmail.get(cleanEmail) : null) ||
        (cleanPhone ? checkinByPhone.get(cleanPhone) : null) ||
        checkinByName.get(cleanName) ||
        checkinById.get(item.id);

      roster.push({
        id: item.id,
        name: item.name,
        matricNumber: checkin?.matricNumber || "",
        email: item.email || "",
        phone: item.phone || "",
        department: item.department || "General Delegate",
        institution: item.institution || "University of Ibadan",
        level: item.level || "Delegate",
        isCheckedIn: !!checkin,
        checkedInAt: checkin?.checkedInAt || null,
        checkedInBy: checkin?.checkedInBy || null,
        tagNumber: checkin?.matricNumber || null,
        source: "pre_registered_form",
      });
    }

    // 2. Append any on-the-spot regular check-ins not in the 188 pre-registered list
    for (const c of allCheckins) {
      if (c.tagType !== "regular" && c.method !== "registration") continue;

      const emailKey = (c.email || "").trim().toLowerCase();
      const nameKey = (c.studentName || "").trim().toLowerCase();

      if ((emailKey && seenKeys.has(emailKey)) || (nameKey && seenKeys.has(nameKey))) {
        continue; // already in roster
      }

      if (emailKey) seenKeys.add(emailKey);
      if (nameKey) seenKeys.add(nameKey);

      roster.push({
        id: c.studentId ? c.studentId.toString() : `REG-${roster.length + 1}`,
        name: c.studentName || "Regular Delegate",
        matricNumber: c.matricNumber || "",
        email: c.email || "",
        phone: (c as any).phone || "",
        department: c.department || "General Delegate",
        institution: c.institution || "University of Ibadan",
        level: c.level || "General Delegate",
        isCheckedIn: true,
        checkedInAt: c.checkedInAt || null,
        checkedInBy: c.checkedInBy || null,
        tagNumber: c.matricNumber || null,
        source: "on_site_registration",
      });
    }

    // Sort: Pending attendees first, then checked in; then alphabetical
    roster.sort((a, b) => {
      if (a.isCheckedIn === b.isCheckedIn) {
        return a.name.localeCompare(b.name);
      }
      return a.isCheckedIn ? 1 : -1;
    });

    const checkedInCount = roster.filter((r) => r.isCheckedIn).length;
    const pendingCount = roster.length - checkedInCount;

    return NextResponse.json(
      {
        totalRegular: roster.length,
        checkedInCount,
        pendingCount,
        roster,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Regular roster API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch regular attendee roster", details: error.message },
      { status: 500 }
    );
  }
}
