import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection, getCheckinsCollection, CONFERENCE_EVENT_ID } from "@/lib/mongodb";
import { searchPreRegisteredAttendees } from "@/lib/registeredAttendeesDirectory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { found: false, students: [], message: "Query too short" },
        { status: 200 }
      );
    }

    const usersCollection = await getUsersCollection();
    const checkinsCollection = await getCheckinsCollection();

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    // 1. Search matching users in MongoDB users collection
    const matchingUsers = await usersCollection
      .find({
        $or: [
          { matricNumber: { $regex: regex } },
          { email: { $regex: regex } },
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { name: { $regex: regex } },
        ],
      })
      .limit(8)
      .toArray();

    // 2. Search pre-registered delegates from the conference registration form (188 attendees)
    const matchingPreRegistered = searchPreRegisteredAttendees(query).slice(0, 8);

    // 3. Fetch existing checkins to flag already checked-in attendees
    const checkinDocs = await checkinsCollection
      .find({ eventId: CONFERENCE_EVENT_ID })
      .toArray();

    const checkinMap = new Map<string, any>();
    checkinDocs.forEach((c) => {
      if (c.matricNumber) checkinMap.set(c.matricNumber.toLowerCase(), c);
      if (c.email) checkinMap.set(c.email.toLowerCase(), c);
      if (c.studentId) checkinMap.set(c.studentId.toString(), c);
    });

    const seenKeys = new Set<string>();
    const students: any[] = [];

    // Map MongoDB users
    for (const u of matchingUsers) {
      const matric = u.matricNumber || "";
      const email = (u.email || u.institutionalEmail || "").toLowerCase();
      const existing =
        (matric && checkinMap.get(matric.toLowerCase())) ||
        (email && checkinMap.get(email)) ||
        checkinMap.get(u._id.toString());

      const key = matric ? matric.toLowerCase() : email || u._id.toString();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        students.push({
          id: u._id.toString(),
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "Student",
          matricNumber: matric,
          department: u.department || "Industrial & Production Engineering",
          institution: "University of Ibadan",
          level: u.currentLevel || u.level || "400L",
          email: u.email || u.institutionalEmail || "",
          alreadyCheckedIn: !!existing,
          checkedInAt: existing?.checkedInAt || null,
          tagType: existing?.tagType || "regular",
          source: "portal_user",
        });
      }
    }

    // Map pre-registered Google Form delegates (inclusive across all faculties & universities)
    for (const pre of matchingPreRegistered) {
      const email = (pre.email || "").toLowerCase();
      const existing =
        (email && checkinMap.get(email)) ||
        checkinMap.get(pre.id.toLowerCase());

      const key = email || pre.name.toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        students.push({
          id: pre.id,
          name: pre.name,
          matricNumber: "",
          department: pre.department,
          institution: pre.institution,
          level: pre.level,
          email: pre.email,
          phone: pre.phone,
          alreadyCheckedIn: !!existing,
          checkedInAt: existing?.checkedInAt || null,
          tagType: existing?.tagType || "regular",
          source: "form_delegate",
        });
      }
    }

    return NextResponse.json({
      found: students.length > 0,
      students: students.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Student lookup API error:", error);
    return NextResponse.json(
      { found: false, students: [], error: error.message || "Lookup error" },
      { status: 500 }
    );
  }
}

