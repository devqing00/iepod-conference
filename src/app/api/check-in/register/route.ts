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
      department,
      institution,
      level,
      email = "",
      phone = "",
      operator = "Registration Desk",
      studentId: existingStudentId,
    } = body;

    const cleanName = (name || "").trim();
    const rawMatric = (matricNumber || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();

    // Only Name is mandatory — Regular registration welcomes everyone without barrier
    if (!cleanName) {
      return NextResponse.json(
        {
          status: "INVALID_FORMAT",
          code: "MISSING_NAME",
          title: "Missing Name",
          message: "Attendee Full Name is required.",
        },
        { status: 400 }
      );
    }

    // Check if matricNumber is a genuine matric number or omitted/placeholder
    const isGenericMatric =
      !rawMatric ||
      /^(N\/?A|NONE|NIL|GUEST|DELEGATE|VISITOR|-|0+)$/i.test(rawMatric);

    // If omitted or generic, auto-generate a unique Conference Delegate ID
    const effectiveMatric = isGenericMatric
      ? `REG-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      : rawMatric.toUpperCase();

    const finalDept = (department && department.trim()) || "General Delegate / Interdisciplinary";
    const finalInst = (institution && institution.trim()) || "University of Ibadan";
    const finalLevel = (level && level.trim()) || "General Delegate";

    const checkinsCollection = await getCheckinsCollection();

    // Check duplicate ONLY if a genuine student matric number or email was supplied
    const duplicateConditions: any[] = [];
    if (!isGenericMatric) {
      duplicateConditions.push({
        matricNumber: { $regex: new RegExp(`^${effectiveMatric.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
    }
    if (cleanEmail && cleanEmail.includes("@")) {
      duplicateConditions.push({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
    }

    if (duplicateConditions.length > 0) {
      const existing = await checkinsCollection.findOne({
        eventId: CONFERENCE_EVENT_ID,
        $or: duplicateConditions,
      });

      if (existing) {
        return NextResponse.json(
          {
            status: "ALREADY_CHECKED_IN",
            code: "DUPLICATE_REGISTRATION",
            title: "Already Registered",
            message: `${existing.studentName || cleanName} has already been registered and checked in (Tag: ${existing.matricNumber || effectiveMatric}).`,
            tagType: existing.tagType || "regular",
            existingRecord: {
              checkedInAt: existing.checkedInAt,
              checkedInBy: existing.checkedInBy,
              method: existing.method,
            },
            student: {
              name: existing.studentName || cleanName,
              matricNumber: existing.matricNumber || effectiveMatric,
              department: existing.department || finalDept,
              institution: existing.institution || finalInst,
              level: existing.level || finalLevel,
              email: existing.email || cleanEmail,
            },
          },
          { status: 200 }
        );
      }
    }

    // Determine student ObjectId (use existing or generate a new unique ObjectId)
    let finalStudentId: ObjectId = new ObjectId();
    if (existingStudentId && /^[a-f0-9]{24}$/i.test(existingStudentId)) {
      // Check if this studentId is already checked in for this event to avoid index collision
      const usedId = await checkinsCollection.findOne({
        eventId: CONFERENCE_EVENT_ID,
        studentId: new ObjectId(existingStudentId),
      });
      finalStudentId = usedId ? new ObjectId() : new ObjectId(existingStudentId);
    } else if (!isGenericMatric) {
      // Check if user exists in users table by matric number
      const usersCollection = await getUsersCollection();
      const matchedUser = await usersCollection.findOne({
        matricNumber: { $regex: new RegExp(`^${effectiveMatric.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
      if (matchedUser) {
        const usedId = await checkinsCollection.findOne({
          eventId: CONFERENCE_EVENT_ID,
          studentId: matchedUser._id,
        });
        finalStudentId = usedId ? new ObjectId() : matchedUser._id;
      }
    }

    const now = new Date();
    const newDoc: ConferenceCheckinDoc = {
      eventId: CONFERENCE_EVENT_ID,
      studentId: finalStudentId,
      studentName: cleanName,
      matricNumber: effectiveMatric,
      department: finalDept,
      institution: finalInst,
      level: finalLevel,
      email: cleanEmail,
      tagType: "regular",
      checkedInAt: now,
      checkedInBy: operator.trim(),
      method: "registration",
    };

    try {
      await checkinsCollection.insertOne(newDoc);
    } catch (insertErr: any) {
      if (insertErr.code === 11000) {
        // Fallback with fresh ObjectId if index collided
        newDoc.studentId = new ObjectId();
        await checkinsCollection.insertOne(newDoc);
      } else {
        throw insertErr;
      }
    }

    return NextResponse.json(
      {
        status: "SUCCESS",
        tagType: "regular",
        title: "Registration Complete",
        message: "Regular Delegate Tag issued! Welcome to IESA Process Day 2026.",
        checkIn: {
          checkedInAt: now,
          checkedInBy: operator,
          method: "registration",
        },
        student: {
          name: cleanName,
          matricNumber: effectiveMatric,
          department: finalDept,
          institution: finalInst,
          level: finalLevel,
          email: cleanEmail,
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

