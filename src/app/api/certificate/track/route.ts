import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function generateCertificateId(identifier: string, name: string): string {
  const rawHash = Buffer.from(`${identifier}-${name}`)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase();
  return `IESA-2026-CERT-${rawHash}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      certificateId,
      action,
      studentName = "",
      matricNumber = "",
    } = body;

    if (!certificateId || !action || !["download", "linkedin"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid tracking payload. Required: certificateId and action ('download' | 'linkedin')." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const checkinsCol = db.collection("conference_checkins");
    const activityCol = db.collection("certificate_activity");

    const now = new Date();

    // Find the attendee's checkin document
    const cleanCertId = certificateId.trim();
    const targetCertHash = cleanCertId.replace(/^IESA-2026-CERT-/i, "").trim().toUpperCase();

    let checkin = null;

    // Direct lookup if matricNumber or certId matches
    if (matricNumber && matricNumber.trim()) {
      checkin = await checkinsCol.findOne({
        matricNumber: { $regex: new RegExp(`^${matricNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
    }

    if (!checkin) {
      checkin = await checkinsCol.findOne({
        $or: [
          { certificateId: { $regex: new RegExp(`^${cleanCertId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { certificateId: `IESA-2026-CERT-${targetCertHash}` },
        ],
      });
    }

    if (!checkin && studentName && studentName.trim()) {
      checkin = await checkinsCol.findOne({
        studentName: { $regex: new RegExp(`^${studentName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
    }

    // Fallback: match deterministic certificate ID across all checkins
    if (!checkin) {
      const allCheckins = await checkinsCol.find({}).toArray();
      for (const c of allCheckins) {
        const computedId = generateCertificateId(c.matricNumber || c.studentName, c.studentName);
        const computedHash = computedId.replace(/^IESA-2026-CERT-/i, "").toUpperCase();
        if (computedHash === targetCertHash || computedId.toUpperCase() === cleanCertId.toUpperCase()) {
          checkin = c;
          break;
        }
      }
    }

    const resolvedName = checkin?.studentName || studentName.trim() || "Conference Delegate";
    const resolvedMatric = checkin?.matricNumber || matricNumber.trim() || "";

    // 1. Update attendee checkin document with download/LinkedIn status
    if (checkin) {
      const updateDoc: any = {};
      if (action === "download") {
        updateDoc.$set = {
          certificateDownloaded: true,
          certificateDownloadedAt: now,
        };
        updateDoc.$inc = {
          certificateDownloadCount: 1,
        };
      } else if (action === "linkedin") {
        updateDoc.$set = {
          linkedInAdded: true,
          linkedInAddedAt: now,
        };
        updateDoc.$inc = {
          linkedInAddCount: 1,
        };
      }

      await checkinsCol.updateOne({ _id: checkin._id }, updateDoc);
    }

    // 2. Append event to certificate_activity collection
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const userAgent = req.headers.get("user-agent") || "";

    await activityCol.insertOne({
      certificateId: cleanCertId,
      studentName: resolvedName,
      matricNumber: resolvedMatric,
      action,
      timestamp: now,
      ip,
      userAgent: userAgent.slice(0, 150),
    });

    return NextResponse.json({
      success: true,
      action,
      certificateId: cleanCertId,
      attendeeName: resolvedName,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Certificate action tracking error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to record certificate activity." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const checkinsCol = db.collection("conference_checkins");
    const activityCol = db.collection("certificate_activity");

    // Fetch all check-ins for the conference
    const allCheckins = await checkinsCol.find({}).sort({ studentName: 1 }).toArray();

    const totalCheckedIn = allCheckins.length;
    let totalDownloaded = 0;
    let totalLinkedIn = 0;

    const attendees = allCheckins.map((c) => {
      const certId = generateCertificateId(c.matricNumber || c.studentName, c.studentName);
      const isDownloaded = Boolean(c.certificateDownloaded);
      const isLinkedIn = Boolean(c.linkedInAdded);

      if (isDownloaded) totalDownloaded++;
      if (isLinkedIn) totalLinkedIn++;

      return {
        id: c._id.toString(),
        studentName: c.studentName,
        matricNumber: c.matricNumber,
        department: c.department || "Industrial & Production Engineering",
        institution: c.institution || "University of Ibadan",
        level: c.level || "Delegate",
        tagType: c.tagType || "regular",
        checkedInAt: c.checkedInAt,
        certificateId: certId,
        certificateDownloaded: isDownloaded,
        certificateDownloadedAt: c.certificateDownloadedAt || null,
        certificateDownloadCount: c.certificateDownloadCount || 0,
        linkedInAdded: isLinkedIn,
        linkedInAddedAt: c.linkedInAddedAt || null,
        linkedInAddCount: c.linkedInAddCount || 0,
      };
    });

    const downloadRate = totalCheckedIn > 0 ? Math.round((totalDownloaded / totalCheckedIn) * 100) : 0;
    const linkedInRate = totalCheckedIn > 0 ? Math.round((totalLinkedIn / totalCheckedIn) * 100) : 0;

    // Fetch latest 30 actions
    const recentActivity = await activityCol
      .find({})
      .sort({ timestamp: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({
      success: true,
      summary: {
        totalCheckedIn,
        totalDownloaded,
        totalLinkedIn,
        downloadRate,
        linkedInRate,
      },
      attendees,
      recentActivity: recentActivity.map((a) => ({
        id: a._id.toString(),
        certificateId: a.certificateId,
        studentName: a.studentName,
        matricNumber: a.matricNumber,
        action: a.action,
        timestamp: a.timestamp,
      })),
    });
  } catch (err: any) {
    console.error("Failed to load certificate tracking data:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load tracking data." },
      { status: 500 }
    );
  }
}
