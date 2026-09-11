import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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

function generateSecurityHash(name: string, certId: string, department: string): string {
  const secretKey = process.env.CERT_SECRET_KEY || "iesa-process-day-2026-global-auth-sig";
  return crypto
    .createHmac("sha256", secretKey)
    .update(`${name.trim().toLowerCase()}|${certId}|${department.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();
}

async function resolveAttendeeRecord(query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  const isCertIdQuery =
    /^IESA-2026-CERT-/i.test(cleanQuery) ||
    /^[A-Z0-9]{8}$/i.test(cleanQuery);

  const targetCertHash = cleanQuery.replace(/^IESA-2026-CERT-/i, "").trim().toUpperCase();

  try {
    const db = await getDatabase();
    const checkinsCol = db.collection("conference_checkins");

    // 1. If query is a Certificate ID or 8-character certificate hash
    if (isCertIdQuery) {
      // Direct lookup if certificateId field exists in document
      const directCheckin = await checkinsCol.findOne({
        $or: [
          { certificateId: { $regex: new RegExp(`^${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { certificateId: `IESA-2026-CERT-${targetCertHash}` },
        ],
      });

      if (directCheckin) {
        return {
          name: directCheckin.studentName,
          matricNumber: directCheckin.matricNumber,
          department: directCheckin.department || "Industrial & Production Engineering",
          institution: directCheckin.institution || "University of Ibadan",
          level: directCheckin.level || "Delegate",
          tagType: directCheckin.tagType || "regular",
          checkedInAt: directCheckin.checkedInAt || new Date("2026-09-10T10:00:00Z"),
          source: directCheckin.tagType === "paid_vip" ? "paid_checkin" : "regular_checkin",
        };
      }

      // Match deterministic certificate ID against all checked-in attendees
      const allCheckins = await checkinsCol.find({}).toArray();
      for (const c of allCheckins) {
        const certId = generateCertificateId(c.matricNumber || c.studentName, c.studentName);
        const certHash = certId.replace(/^IESA-2026-CERT-/i, "").toUpperCase();
        if (certHash === targetCertHash || certId.toUpperCase() === cleanQuery.toUpperCase()) {
          return {
            name: c.studentName,
            matricNumber: c.matricNumber,
            department: c.department || "Industrial & Production Engineering",
            institution: c.institution || "University of Ibadan",
            level: c.level || "Delegate",
            tagType: c.tagType || "regular",
            checkedInAt: c.checkedInAt || new Date("2026-09-10T10:00:00Z"),
            source: c.tagType === "paid_vip" ? "paid_checkin" : "regular_checkin",
          };
        }
      }

      // If certificate code does not belong to any checked-in attendee, fail authentication
      return null;
    }

    // 2. Search strictly within checked-in attendees (regular or paid)
    const safeQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exactRegex = new RegExp(`^${safeQuery}$`, "i");

    // Exact search on matric number or email in check-in database
    let checkin = await checkinsCol.findOne({
      $or: [
        { matricNumber: exactRegex },
        { email: exactRegex },
      ],
    });

    // Exact search on student name
    if (!checkin && cleanQuery.length >= 3) {
      checkin = await checkinsCol.findOne({
        studentName: exactRegex,
      });
    }

    // Word permutation matching for names (e.g. "Taiwo Alade" vs "Alade Taiwo")
    if (!checkin && cleanQuery.includes(" ")) {
      const words = cleanQuery.split(/\s+/).filter((w) => w.length >= 2);
      if (words.length >= 2) {
        const allWordsPattern = words
          .map((w) => `(?=.*${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)
          .join("");
        checkin = await checkinsCol.findOne({
          studentName: { $regex: new RegExp(allWordsPattern, "i") },
        });
      }
    }

    // Partial search on student name if query has 4+ characters
    if (!checkin && cleanQuery.length >= 4) {
      const partialRegex = new RegExp(safeQuery, "i");
      checkin = await checkinsCol.findOne({
        studentName: partialRegex,
      });
    }

    if (checkin) {
      return {
        name: checkin.studentName,
        matricNumber: checkin.matricNumber,
        department: checkin.department || "Industrial & Production Engineering",
        institution: checkin.institution || "University of Ibadan",
        level: checkin.level || "Delegate",
        tagType: checkin.tagType || "regular",
        checkedInAt: checkin.checkedInAt || new Date("2026-09-10T10:00:00Z"),
        source: checkin.tagType === "paid_vip" ? "paid_checkin" : "regular_checkin",
      };
    }
  } catch (dbErr) {
    console.warn("MongoDB query warning for certificate lookup:", dbErr);
  }

  // Strictly enforce: ONLY delegates who checked in can receive a certificate.
  // No synthetic generation or un-checked-in directory fallbacks.
  return null;
}

function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-|\/|\()\S/g, (c) => c.toUpperCase());
}

function buildVerificationResponse(attendeeRecord: any) {
  const certificateId = generateCertificateId(
    attendeeRecord.matricNumber || attendeeRecord.name,
    attendeeRecord.name
  );

  const securityHash = generateSecurityHash(
    attendeeRecord.name,
    certificateId,
    attendeeRecord.department
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://iepod.vercel.app");

  const verificationUrl = `${baseUrl}/verify/${certificateId}`;

  // Formatted 1-click LinkedIn Add to Profile URL
  const certName = encodeURIComponent("IESA Process Day 2026 - Certificate of Participation");
  const orgName = encodeURIComponent("Industrial Engineering Students Association, UI");
  const certUrlEncoded = encodeURIComponent(verificationUrl);
  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=2026&issueMonth=9&certUrl=${certUrlEncoded}&certId=${certificateId}`;

  return {
    success: true,
    verified: true,
    status: "VALID_OFFICIAL_CREDENTIAL",
    attendee: {
      name: (attendeeRecord.name || "").toUpperCase(),
      matricNumber: attendeeRecord.matricNumber,
      department: toTitleCase(attendeeRecord.department || "Industrial & Production Engineering"),
      institution: toTitleCase(attendeeRecord.institution || "University of Ibadan"),
      level: attendeeRecord.level,
      conferenceTitle: "6th Annual Industrial Engineering Conference (IESA Process Day 2026)",
      date: "September 10, 2026",
      certificateId,
      verificationUrl,
      securityHash,
      linkedInUrl,
      issuedBy: "Department of Industrial & Production Engineering, University of Ibadan",
      issuerSignatories: [
        { name: "Success Udoka", title: "Conference Lead" },
        { name: "Adeoye Okhaioisevai", title: "IESA President" },
      ],
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query =
      searchParams.get("id") ||
      searchParams.get("code") ||
      searchParams.get("query") ||
      searchParams.get("matric") ||
      "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Missing credential identifier (certificate ID, matric number, or name)." },
        { status: 400 }
      );
    }

    const attendeeRecord = await resolveAttendeeRecord(query);
    if (!attendeeRecord) {
      return NextResponse.json(
        {
          error: "Only attendees who checked in at the conference (regular or paid) are eligible to claim an official certificate.",
          searchedQuery: query,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(buildVerificationResponse(attendeeRecord), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to verify certificate credential." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || body.id || body.code || "").toString().trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Please enter your certificate number, matric number, or name." },
        { status: 400 }
      );
    }

    const attendeeRecord = await resolveAttendeeRecord(query);
    if (!attendeeRecord) {
      return NextResponse.json(
        {
          error:
            "Only attendees who checked in at the conference (regular or paid) are eligible to claim an official certificate.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(buildVerificationResponse(attendeeRecord), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process certificate verification." },
      { status: 500 }
    );
  }
}
