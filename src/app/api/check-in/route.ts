import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getPaymentsCollection,
  getUsersCollection,
  getCheckinsCollection,
  CONFERENCE_EVENT_ID,
  ConferenceCheckinDoc,
} from "@/lib/mongodb";

const QR_REGEX = /^IESA_EVENT:([a-f0-9]{24})\|STUDENT:([a-f0-9]{24})$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrData, matricNumber, email, studentId: rawStudentId, operator } = body;

    let targetStudentId = "";
    let checkinMethod: "qr_scan" | "manual_lookup" = "manual_lookup";

    // 1. QR Code Payload Flow
    if (qrData && typeof qrData === "string") {
      checkinMethod = "qr_scan";
      const match = qrData.trim().match(QR_REGEX);

      if (!match) {
        return NextResponse.json(
          {
            status: "INVALID_FORMAT",
            code: "INVALID_FORMAT",
            title: "Invalid QR Format",
            message: "Not a valid IESA Conference ticket",
            raw: qrData.slice(0, 100),
          },
          { status: 400 }
        );
      }

      const scannedEventId = match[1];
      targetStudentId = match[2];

      if (scannedEventId !== CONFERENCE_EVENT_ID) {
        return NextResponse.json(
          {
            status: "UNAUTHORIZED",
            code: "EVENT_MISMATCH",
            title: "Wrong Event Ticket",
            message: "This ticket is not for IESA Process Day 2026.",
          },
          { status: 403 }
        );
      }
    }
    // 2. Direct Student ID Flow
    else if (rawStudentId && typeof rawStudentId === "string") {
      targetStudentId = rawStudentId.trim();
      checkinMethod = "manual_lookup";
    }
    // 3. Manual Lookup by Matric Number or Email
    else if (matricNumber || email) {
      checkinMethod = "manual_lookup";
      const usersCollection = await getUsersCollection();

      const orConditions: any[] = [];
      if (matricNumber && typeof matricNumber === "string" && matricNumber.trim()) {
        const cleanMatric = matricNumber.trim();
        orConditions.push({ matricNumber: cleanMatric });
        // Also support regex for matric with/without leading zeros/case
        orConditions.push({
          matricNumber: { $regex: new RegExp(`^${cleanMatric}$`, "i") },
        });
      }
      if (email && typeof email === "string" && email.trim()) {
        const cleanEmail = email.trim();
        orConditions.push({
          email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
        });
        orConditions.push({
          institutionalEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
        });
        orConditions.push({
          secondaryEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
        });
      }

      const user = await usersCollection.findOne({ $or: orConditions });

      if (!user) {
        return NextResponse.json(
          {
            status: "NOT_FOUND",
            code: "STUDENT_NOT_FOUND",
            title: "Attendee Record Not Found",
            message: "No student record matches this matric number or email.",
          },
          { status: 404 }
        );
      }

      targetStudentId = user._id.toString();
    } else {
      return NextResponse.json(
        {
          status: "INVALID_FORMAT",
          code: "MISSING_INPUT",
          title: "Missing Information",
          message: "Please provide a QR scan, matric number, or email.",
        },
        { status: 400 }
      );
    }

    // Verify studentId format (24 hex characters)
    if (!/^[a-f0-9]{24}$/i.test(targetStudentId)) {
      return NextResponse.json(
        {
          status: "INVALID_FORMAT",
          code: "INVALID_STUDENT_ID",
          title: "Invalid Student ID",
          message: "Student ID in ticket payload is invalid.",
        },
        { status: 400 }
      );
    }

    const studentObjectId = new ObjectId(targetStudentId);

    // Fetch student profile
    const usersCollection = await getUsersCollection();
    const student = await usersCollection.findOne({ _id: studentObjectId });

    const studentName = student
      ? `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        student.name ||
        "Attendee"
      : "Unknown Attendee";
    const studentMatric = student?.matricNumber || "N/A";
    const studentEmail =
      student?.email ||
      student?.institutionalEmail ||
      student?.secondaryEmail ||
      "N/A";
    const studentLevel = student?.currentLevel || student?.level || "N/A";
    const studentDept = student?.department || "Industrial Engineering";

    // Fetch payment and check if student is in paidBy
    const paymentsCollection = await getPaymentsCollection();
    const payment = await paymentsCollection.findOne({
      _id: new ObjectId(CONFERENCE_EVENT_ID),
    });

    if (!payment) {
      return NextResponse.json(
        {
          status: "ERROR",
          code: "EVENT_NOT_FOUND",
          title: "Conference Event Record Missing",
          message: "Unable to find conference event payment document in database.",
        },
        { status: 500 }
      );
    }

    const paidIds = (payment.paidBy || []).map((id: any) => id.toString());
    const isPaid = paidIds.includes(targetStudentId);

    if (!isPaid) {
      return NextResponse.json(
        {
          status: "UNPAID",
          code: "UNPAID_ATTENDEE",
          title: "Unauthorized — Unpaid Attendee",
          message: "Attendee has not paid for the conference package.",
          student: {
            id: targetStudentId,
            name: studentName,
            matricNumber: studentMatric,
            email: studentEmail,
            level: studentLevel,
            department: studentDept,
          },
        },
        { status: 403 }
      );
    }

    // Check if attendee is already checked in
    const checkinsCollection = await getCheckinsCollection();
    const existingCheckin = await checkinsCollection.findOne({
      eventId: CONFERENCE_EVENT_ID,
      studentId: studentObjectId,
    });

    if (existingCheckin) {
      return NextResponse.json(
        {
          status: "ALREADY_CHECKED_IN",
          code: "DUPLICATE_CHECKIN",
          title: "Already Checked In!",
          message: "Ticket has already been verified and signed in.",
          existingRecord: {
            checkedInAt: existingCheckin.checkedInAt,
            checkedInBy: existingCheckin.checkedInBy,
            method: existingCheckin.method,
          },
          student: {
            id: targetStudentId,
            name: existingCheckin.studentName || studentName,
            matricNumber: existingCheckin.matricNumber || studentMatric,
            email: existingCheckin.email || studentEmail,
            level: existingCheckin.level || studentLevel,
            department: existingCheckin.department || studentDept,
          },
        },
        { status: 409 }
      );
    }

    // Insert new check-in document
    const now = new Date();
    const newCheckin: ConferenceCheckinDoc = {
      eventId: CONFERENCE_EVENT_ID,
      studentId: studentObjectId,
      studentName,
      matricNumber: studentMatric,
      email: studentEmail,
      level: studentLevel,
      department: studentDept,
      checkedInAt: now,
      checkedInBy: (operator && typeof operator === "string" && operator.trim()) || "Gate Coordinator",
      method: checkinMethod,
    };

    try {
      await checkinsCollection.insertOne(newCheckin);
    } catch (insertErr: any) {
      // Catch potential concurrent race condition unique constraint violation
      if (insertErr.code === 11000) {
        const raceExisting = await checkinsCollection.findOne({
          eventId: CONFERENCE_EVENT_ID,
          studentId: studentObjectId,
        });
        return NextResponse.json(
          {
            status: "ALREADY_CHECKED_IN",
            code: "DUPLICATE_CHECKIN",
            title: "Already Checked In!",
            message: "Ticket has already been verified and signed in.",
            existingRecord: raceExisting
              ? {
                  checkedInAt: raceExisting.checkedInAt,
                  checkedInBy: raceExisting.checkedInBy,
                  method: raceExisting.method,
                }
              : null,
            student: {
              id: targetStudentId,
              name: studentName,
              matricNumber: studentMatric,
              email: studentEmail,
              level: studentLevel,
              department: studentDept,
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
        code: "CHECKED_IN",
        title: "Verified Paid Attendee",
        message: "Check-in successful! Welcome to IESA Process Day 2026.",
        checkIn: {
          checkedInAt: now,
          checkedInBy: newCheckin.checkedInBy,
          method: newCheckin.method,
        },
        student: {
          id: targetStudentId,
          name: studentName,
          matricNumber: studentMatric,
          email: studentEmail,
          level: studentLevel,
          department: studentDept,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        code: "SERVER_ERROR",
        title: "Server Error",
        message: error.message || "An unexpected error occurred during check-in.",
      },
      { status: 500 }
    );
  }
}
