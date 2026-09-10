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

export const dynamic = "force-dynamic";

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
            serviceType: "food",
            code: "INVALID_FORMAT",
            title: "Invalid Ticket QR",
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
            serviceType: "food",
            code: "EVENT_MISMATCH",
            title: "Wrong Event Ticket",
            message: "This ticket is not for IESA Process Day 2026.",
          },
          { status: 403 }
        );
      }
    }

    // Check if query matches the Official Paid Directory (53 Participants)
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
      isPaid = true;
      studentName = officialPaid.fullName;
      studentMatric = officialPaid.matricNumber;
      studentEmail = officialPaid.email;
      studentDept = officialPaid.department;

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
          const prevCheckin = await checkinsCollection.findOne({
            eventId: CONFERENCE_EVENT_ID,
            $or: orConditions,
          });

          if (!prevCheckin) {
            return NextResponse.json(
              {
                status: "NOT_FOUND",
                serviceType: "food",
                code: "STUDENT_NOT_FOUND",
                title: "Attendee Record Not Found",
                message: "No record matches this matric number or email.",
              },
              { status: 404 }
            );
          }

          // Found in conference checkins
          studentObjectId = prevCheckin.studentId || prevCheckin._id;
          targetStudentId = studentObjectId.toString();
          studentName = prevCheckin.studentName || "Attendee";
          studentMatric = prevCheckin.matricNumber || matricNumber || "N/A";
          studentEmail = prevCheckin.email || email || "N/A";
          studentDept = prevCheckin.department || "Delegate";
          studentLevel = prevCheckin.level || "Delegate";

          if (prevCheckin.tagType === "paid_vip") {
            isPaid = true;
          }
        } else {
          targetStudentId = user._id.toString();
        }
      } else {
        return NextResponse.json(
          {
            status: "INVALID_FORMAT",
            serviceType: "food",
            code: "MISSING_INPUT",
            title: "Missing Information",
            message: "Please provide a ticket QR scan, matric number, or email.",
          },
          { status: 400 }
        );
      }

      if (!/^[a-f0-9]{24}$/i.test(targetStudentId)) {
        return NextResponse.json(
          {
            status: "INVALID_FORMAT",
            serviceType: "food",
            code: "INVALID_STUDENT_ID",
            title: "Invalid Student ID",
            message: "Student ID in ticket payload is invalid.",
          },
          { status: 400 }
        );
      }

      studentObjectId = new ObjectId(targetStudentId);
      const student = await usersCollection.findOne({ _id: studentObjectId });

      if (!studentName || studentName === "Unknown Attendee") {
        studentName = student
          ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.name || "Attendee"
          : "Unknown Attendee";
      }
      if (!studentMatric || studentMatric === "N/A") {
        studentMatric = student?.matricNumber || "N/A";
      }
      if (!studentEmail || studentEmail === "N/A") {
        studentEmail = student?.email || student?.institutionalEmail || student?.secondaryEmail || "N/A";
      }
      if (!studentLevel || studentLevel === "Delegate") {
        studentLevel = student?.currentLevel || student?.level || "Delegate";
      }
      if (!studentDept || studentDept === "Industrial & Production Engineering") {
        studentDept = student?.department || "Industrial & Production Engineering";
      }

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

    // If NOT PAID VIP, they are not entitled to VIP food packages
    if (!isPaid) {
      return NextResponse.json(
        {
          status: "UNPAID",
          serviceType: "food",
          code: "NOT_ENTITLED",
          tagType: "regular",
          title: "No VIP Meal Entitlement",
          message: "Conference meal packages are reserved exclusively for Paid VIP Delegates.",
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

    // Check existing check-in in conference_checkins
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

    const now = new Date();
    const cateringOperator = (operator && typeof operator === "string" && operator.trim()) || "Catering Desk";

    // If already checked in and already food-served
    if (existingCheckin && (existingCheckin as any).foodServed) {
      return NextResponse.json(
        {
          status: "ALREADY_CHECKED_IN",
          serviceType: "food",
          code: "MEAL_ALREADY_SERVED",
          title: "Meal Already Collected!",
          message: `${studentName} has already collected their food package.`,
          tagType: "paid_vip",
          foodServedAt: (existingCheckin as any).foodServedAt || existingCheckin.checkedInAt,
          foodServedBy: (existingCheckin as any).foodServedBy || cateringOperator,
          existingRecord: {
            checkedInAt: (existingCheckin as any).foodServedAt || existingCheckin.checkedInAt,
            checkedInBy: (existingCheckin as any).foodServedBy || cateringOperator,
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

    // If checkin document already exists, mark foodServed = true
    if (existingCheckin) {
      await checkinsCollection.updateOne(
        { _id: existingCheckin._id },
        {
          $set: {
            foodServed: true,
            foodServedAt: now,
            foodServedBy: cateringOperator,
          },
        }
      );

      return NextResponse.json(
        {
          status: "SUCCESS",
          serviceType: "food",
          code: "MEAL_SERVED",
          tagType: "paid_vip",
          title: "Meal Package Cleared!",
          message: "1x Full Conference Meal & Refreshment package issued.",
          foodServedAt: now,
          checkIn: {
            checkedInAt: now,
            checkedInBy: cateringOperator,
            method: checkinMethod,
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
    }

    // If checkin document does NOT exist yet (walked straight to catering)
    const newDoc: any = {
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
      checkedInBy: cateringOperator,
      method: checkinMethod,
      foodServed: true,
      foodServedAt: now,
      foodServedBy: cateringOperator,
    };

    try {
      await checkinsCollection.insertOne(newDoc);
    } catch (err: any) {
      if (err.code === 11000) {
        newDoc.studentId = new ObjectId();
        await checkinsCollection.insertOne(newDoc);
      } else {
        throw err;
      }
    }

    return NextResponse.json(
      {
        status: "SUCCESS",
        serviceType: "food",
        code: "MEAL_SERVED",
        tagType: "paid_vip",
        title: "Meal Package Cleared!",
        message: "1x Full Conference Meal & Refreshment package issued (Admitted & Food Checked).",
        foodServedAt: now,
        checkIn: {
          checkedInAt: now,
          checkedInBy: cateringOperator,
          method: checkinMethod,
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
    console.error("Food check-in error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        serviceType: "food",
        code: "SERVER_ERROR",
        title: "Food Check-In Error",
        message: error?.message || "Failed to process food check-in. Try again.",
      },
      { status: 500 }
    );
  }
}
