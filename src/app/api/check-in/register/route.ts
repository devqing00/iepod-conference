import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCheckinsCollection, getUsersCollection, CONFERENCE_EVENT_ID, ConferenceCheckinDoc } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      matricNumber,
      department = "Industrial & Production Engineering",
      institution = "University of Ibadan",
      level = "Delegate",
      email = "",
      operator = "Registration Desk",
      studentId: existingStudentId,
    } = body;

    const cleanName = (name || "").trim();
    const cleanMatric = (matricNumber || "").trim().toUpperCase();

    if (!cleanName || !cleanMatric) {
      return NextResponse.json(
        {
          status: "INVALID_FORMAT",
          code: "MISSING_FIELDS",
          title: "Missing Information",
          message: "Full Name and Matric Number are required.",
        },
        { status: 400 }
      );
    }

    const checkinsCollection = await getCheckinsCollection();

    // Check if attendee is already checked in / registered
    const existing = await checkinsCollection.findOne({
      eventId: CONFERENCE_EVENT_ID,
      matricNumber: { $regex: new RegExp(`^${cleanMatric.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        {
          status: "ALREADY_CHECKED_IN",
          code: "DUPLICATE_REGISTRATION",
          title: "Already Registered",
          message: "Attendee already registered and checked in.",
          tagType: existing.tagType || "regular",
          existingRecord: {
            checkedInAt: existing.checkedInAt,
            checkedInBy: existing.checkedInBy,
            method: existing.method,
          },
          student: {
            name: existing.studentName || cleanName,
            matricNumber: existing.matricNumber || cleanMatric,
            department: existing.department || department,
            institution: existing.institution || institution,
            level: existing.level || level,
            email: existing.email || email,
          },
        },
        { status: 409 }
      );
    }

    // Determine student ObjectId (use existing or generate a new unique ObjectId)
    let finalStudentId: ObjectId;
    if (existingStudentId && /^[a-f0-9]{24}$/i.test(existingStudentId)) {
      finalStudentId = new ObjectId(existingStudentId);
    } else {
      // Check if user exists in users table by matric number
      const usersCollection = await getUsersCollection();
      const matchedUser = await usersCollection.findOne({
        matricNumber: { $regex: new RegExp(`^${cleanMatric.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
      finalStudentId = matchedUser ? matchedUser._id : new ObjectId();
    }

    const now = new Date();
    const newDoc: ConferenceCheckinDoc = {
      eventId: CONFERENCE_EVENT_ID,
      studentId: finalStudentId,
      studentName: cleanName,
      matricNumber: cleanMatric,
      department: department.trim(),
      institution: institution.trim(),
      level: level.trim(),
      email: email.trim(),
      tagType: "regular",
      checkedInAt: now,
      checkedInBy: operator.trim(),
      method: "registration",
    };

    try {
      await checkinsCollection.insertOne(newDoc);
    } catch (insertErr: any) {
      if (insertErr.code === 11000) {
        return NextResponse.json(
          {
            status: "ALREADY_CHECKED_IN",
            code: "DUPLICATE_REGISTRATION",
            title: "Already Registered",
            message: "Attendee has already been registered.",
            tagType: "regular",
            student: {
              name: cleanName,
              matricNumber: cleanMatric,
              department,
              institution,
              level,
              email,
            },
          },
          { status: 409 }
        );
      }
      throw insertErr;
    }

    return NextResponse.json(
      {
        status: "SUCCESS",
        tagType: "regular",
        title: "Registration Complete",
        message: "Regular Delegate Tag issued! Certificate credential activated.",
        checkIn: {
          checkedInAt: now,
          checkedInBy: operator,
          method: "registration",
        },
        student: {
          name: cleanName,
          matricNumber: cleanMatric,
          department: department.trim(),
          institution: institution.trim(),
          level: level.trim(),
          email: email.trim(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Attendee registration error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        code: "SERVER_ERROR",
        title: "Registration Error",
        message: error.message || "Failed to register attendee. Try again.",
      },
      { status: 500 }
    );
  }
}
