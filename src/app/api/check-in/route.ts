import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getPaymentsCollection,
  getUsersCollection,
  getCheckinsCollection,
  CONFERENCE_EVENT_ID,
  ConferenceCheckinDoc,
} from "@/lib/mongodb";
import { findPaidParticipant } from "@/lib/paidParticipantsDirectory";

const QR_REGEX = /^IESA_EVENT:([a-f0-9]{24})\|STUDENT:([a-f0-9]{24})$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrData, matricNumber, email, studentId: rawStudentId, operator } = body;

    let targetStudentId = "";
    let checkinMethod: "qr_scan" | "manual_lookup" = "manual_lookup";

    const usersCollection = await getUsersCollection();
    const paymentsCollection = await getPaymentsCollection();
    const checkinsCollection = await getCheckinsCollection();

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

    // Check if query matches the Official Paid Directory (51 Participants)
    const queryForDirectory = (targetStudentId || rawStudentId || matricNumber || email || "").trim();
    const officialPaid = findPaidParticipant(queryForDirectory);

    let studentObjectId: ObjectId;
    let studentName = "";
    let studentMatric = "";
    let studentEmail = "";
    let studentLevel = "Delegate";
    let studentDept = "Industrial & Production Engineering";
    let isPaid = false;

    if (officialPaid) {
      // Official Paid Delegate recognized!
      isPaid = true;
      studentName = officialPaid.fullName;
      studentMatric = officialPaid.matricNumber;
      studentEmail = officialPaid.email;
      studentDept = officialPaid.department;

      // Try to resolve student ObjectId from usersCollection
      const safeMatric = officialPaid.matricNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const safeEmail = officialPaid.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const matchedUser = await usersCollection.findOne({
        $or: [
          { matricNumber: { $regex: new RegExp(`^${safeMatric}$`, "i") } },
          ...(officialPaid.email ? [{ email: { $regex: new RegExp(`^${safeEmail}$`, "i") } }] : []),
        ],
      });

      if (matchedUser) {
        studentObjectId = matchedUser._id;
        studentLevel = matchedUser.currentLevel || matchedUser.level || "Delegate";
      } else if (rawStudentId && /^[a-f0-9]{24}$/i.test(rawStudentId)) {
        studentObjectId = new ObjectId(rawStudentId);
      } else {
        // Check if previously checked in to reuse the same ObjectId
        const prevCheckin = await checkinsCollection.findOne({
          $or: [
            { matricNumber: { $regex: new RegExp(`^${safeMatric}$`, "i") } },
            ...(officialPaid.email ? [{ email: { $regex: new RegExp(`^${safeEmail}$`, "i") } }] : []),
          ],
        });
        studentObjectId = prevCheckin?.studentId || new ObjectId();
      }
      targetStudentId = studentObjectId.toString();
    } else {
      // Flow for Non-Official Directory (Regular DB lookup or QR Scan)
      if (rawStudentId && typeof rawStudentId === "string") {
        targetStudentId = rawStudentId.trim();
        checkinMethod = "manual_lookup";
      } else if (matricNumber || email) {
        checkinMethod = "manual_lookup";
        const orConditions: any[] = [];
        if (matricNumber && typeof matricNumber === "string" && matricNumber.trim()) {
          const cleanMatric = matricNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          orConditions.push({ matricNumber: { $regex: new RegExp(`^${cleanMatric}$`, "i") } });
        }
        if (email && typeof email === "string" && email.trim()) {
          const cleanEmail = email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          orConditions.push({ email: { $regex: new RegExp(`^${cleanEmail}$`, "i") } });
          orConditions.push({ institutionalEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") } });
          orConditions.push({ secondaryEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") } });
        }

        const user = await usersCollection.findOne({ $or: orConditions });
        if (!user) {
          return NextResponse.json(
            {
              status: "NOT_FOUND",
              code: "STUDENT_NOT_FOUND",
              title: "Attendee Record Not Found",
              message: "No record matches this matric number or email.",
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

      studentObjectId = new ObjectId(targetStudentId);
      const student = await usersCollection.findOne({ _id: studentObjectId });

      studentName = student
        ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.name || "Attendee"
        : "Unknown Attendee";
      studentMatric = student?.matricNumber || "N/A";
      studentEmail = student?.email || student?.institutionalEmail || student?.secondaryEmail || "N/A";
      studentLevel = student?.currentLevel || student?.level || "Delegate";
      studentDept = student?.department || "Industrial & Production Engineering";

      // Check against official directory using fetched student details
      const matchedFromStudent = findPaidParticipant(studentMatric || studentEmail || studentName);
      if (matchedFromStudent) {
        isPaid = true;
        studentName = matchedFromStudent.fullName;
        studentDept = matchedFromStudent.department;
      } else {
        const payment = await paymentsCollection.findOne({
          _id: new ObjectId(CONFERENCE_EVENT_ID),
        });
        const paidIds = (payment?.paidBy || []).map((id: any) => id.toString());
        isPaid = paidIds.includes(targetStudentId);
      }
    }

    if (!isPaid) {
      return NextResponse.json(
        {
          status: "UNPAID",
          code: "UNPAID_ATTENDEE",
          tagType: "regular",
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
    const checkinOrConditions: any[] = [{ studentId: studentObjectId }];
    if (studentMatric && studentMatric !== "N/A") {
      const safeMatric = studentMatric.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      checkinOrConditions.push({ matricNumber: { $regex: new RegExp(`^${safeMatric}$`, "i") } });
    }
    if (studentEmail && studentEmail !== "N/A") {
      const safeEmail = studentEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      checkinOrConditions.push({ email: { $regex: new RegExp(`^${safeEmail}$`, "i") } });
    }

    const existingCheckin = await checkinsCollection.findOne({
      eventId: CONFERENCE_EVENT_ID,
      $or: checkinOrConditions,
    });

    if (existingCheckin) {
      return NextResponse.json(
        {
          status: "ALREADY_CHECKED_IN",
          code: "DUPLICATE_CHECKIN",
          title: "Already Checked In!",
          message: "Ticket has already been verified and signed in.",
          tagType: existingCheckin.tagType || "paid_vip",
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
      institution: "University of Ibadan",
      tagType: "paid_vip",
      checkedInAt: now,
      checkedInBy: (operator && typeof operator === "string" && operator.trim()) || "Gate Coordinator",
      method: checkinMethod,
    };

    try {
      await checkinsCollection.insertOne(newCheckin);
    } catch (insertErr: any) {
      if (insertErr.code === 11000) {
        return NextResponse.json(
          {
            status: "ALREADY_CHECKED_IN",
            code: "DUPLICATE_CHECKIN",
            title: "Already Checked In",
            message: "Ticket has already been verified and signed in.",
            tagType: "paid_vip",
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
        tagType: "paid_vip",
        title: "Verified Paid Delegate",
        message: "Paid status confirmed! Issue Special Paid Delegate Tag.",
        checkIn: {
          checkedInAt: now,
          checkedInBy: newCheckin.checkedInBy,
          method: newCheckin.method,
        },
        student: {
          id: targetStudentId,
          name: studentName,
          ticketName: officialPaid?.ticketName || studentName,
          matricNumber: studentMatric,
          email: studentEmail,
          phone: officialPaid?.phone || "",
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

