import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection, getCheckinsCollection, CONFERENCE_EVENT_ID } from "@/lib/mongodb";

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

    // Search up to 8 matching students in users collection
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

    // Fetch existing checkins to flag already checked-in attendees
    const checkinDocs = await checkinsCollection
      .find({ eventId: CONFERENCE_EVENT_ID })
      .toArray();

    const checkinMap = new Map<string, any>();
    checkinDocs.forEach((c) => {
      if (c.matricNumber) checkinMap.set(c.matricNumber.toLowerCase(), c);
      if (c.studentId) checkinMap.set(c.studentId.toString(), c);
    });

    const students = matchingUsers.map((u) => {
      const matric = u.matricNumber || "";
      const existing =
        checkinMap.get(matric.toLowerCase()) ||
        checkinMap.get(u._id.toString());

      return {
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
      };
    });

    return NextResponse.json({
      found: students.length > 0,
      students,
    });
  } catch (error: any) {
    console.error("Student lookup API error:", error);
    return NextResponse.json(
      { found: false, students: [], error: error.message || "Lookup error" },
      { status: 500 }
    );
  }
}
