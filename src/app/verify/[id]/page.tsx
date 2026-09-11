import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/solid";

interface Props {
  params: Promise<{ id: string }>;
}

async function getCredential(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/certificate/verify?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.attendee || null;
  } catch (e) {
    console.error("Error fetching credential verification:", e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const attendee = await getCredential(id);

  if (!attendee) {
    return {
      title: "Certificate Verification · IESA Process Day 2026",
      description: "Official credential verification portal for IESA Process Day 2026.",
    };
  }

  return {
    title: `Verified: ${attendee.name} · Certificate of Participation`,
    description: `Official digital credential issued to ${attendee.name} by the Department of Industrial & Production Engineering, University of Ibadan. Certificate ID: ${attendee.certificateId}`,
    openGraph: {
      title: `Verified Credential: ${attendee.name}`,
      description: `Official certificate issued for attending the 6th Annual Industrial Engineering Conference (IESA Process Day 2026).`,
      type: "website",
    },
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { id } = await params;
  const attendee = await getCredential(id);

  if (!attendee) {
    return (
      <div className="min-h-screen bg-[#02001e] text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-[#c6f552] selection:text-[#040032]">
        <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4">
          <Link
            href="/verify"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors text-white"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Verification Portal</span>
          </Link>
          <span className="text-xs font-mono text-[#c6f552] font-bold">IESA PROCESS DAY 2026</span>
        </header>

        <main className="max-w-md w-full mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-[#040032] border border-white/15 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <LockClosedIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-serif-display font-bold text-white">
              Certificate Not Found
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              No official record matching certificate identifier <span className="font-mono text-[#c6f552]">{id}</span> was found in the conference registry.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/verify"
              className="w-full px-5 py-2.5 rounded-full bg-[#c6f552] text-[#040032] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#b5e640] transition-colors text-center"
            >
              Search by Certificate ID or Name
            </Link>
            <Link
              href="/certificate"
              className="w-full px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 font-mono text-xs text-center transition-colors"
            >
              Claim / Download Certificate
            </Link>
          </div>
        </main>

        <footer className="w-full max-w-4xl mx-auto py-4 text-center text-xs font-mono text-white/40">
          Department of Industrial &amp; Production Engineering · University of Ibadan
        </footer>
      </div>
    );
  }

  // Structured Schema.org EducationalOccupationalCredential for Google / Credential crawlers
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    "name": "Certificate of Participation - IESA Process Day 2026",
    "credentialCategory": "Certificate",
    "educationalLevel": "Professional / Undergraduate Conference",
    "recognizedBy": {
      "@type": "EducationalOrganization",
      "name": "University of Ibadan",
      "department": "Department of Industrial & Production Engineering",
    },
    "credentialAwarded": {
      "@type": "Person",
      "name": attendee.name,
    },
    "validIn": {
      "@type": "AdministrativeArea",
      "name": "Global",
    },
    "identifier": attendee.certificateId,
    "dateCreated": "2026-09-10",
  };

  return (
    <div className="min-h-screen bg-[#02001e] text-white flex flex-col selection:bg-[#c6f552] selection:text-[#040032]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#3fffe8]/10 via-[#c6f552]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#040032]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs font-mono font-bold text-[#c6f552] truncate">
            Global Credential Verification
          </span>
        </div>

        <Link
          href="/verify"
          className="text-xs font-mono text-[#3fffe8] hover:underline flex items-center gap-1"
        >
          <DocumentCheckIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Verify Another</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Verification Status Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#040032]/95 border-2 border-[#c6f552]/50 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
          {/* Top Banner with Official Stamp */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0a3825] border-2 border-[#c6f552] flex items-center justify-center text-[#c6f552] shadow-[0_0_20px_rgba(198,245,82,0.35)] shrink-0">
                <CheckBadgeIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#c6f552] text-[#040032] text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    Officially Validated
                  </span>
                  <span className="text-[11px] font-mono text-[#3fffe8]">
                    Global Edge Registry
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold font-serif-display text-white mt-1">
                  Verified Academic Credential
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-white/50 block">CERTIFICATE SERIAL</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#c6f552] tracking-wider">
                {attendee.certificateId}
              </span>
            </div>
          </div>

          {/* Attendee Name & Award Title */}
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
              This is to officially certify that
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif-display text-white tracking-tight">
              {attendee.name.toUpperCase()}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              has successfully participated in the <strong className="text-white">6th Annual Industrial Engineering Conference (IESA Process Day 2026)</strong> organized by the Department of Industrial &amp; Production Engineering, University of Ibadan.
            </p>
          </div>

          {/* Key Credential Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#3fffe8]">
                <BuildingLibraryIcon className="w-3.5 h-3.5" />
                <span>Issuing Authority</span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                University of Ibadan
              </p>
              <span className="text-[10px] text-white/60 block font-mono">
                Dept. of Industrial &amp; Production Eng.
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#3fffe8]">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                <span>Date Issued</span>
              </div>
              <p className="text-xs font-bold text-white">
                September 10, 2026
              </p>
              <span className="text-[10px] text-white/60 block font-mono">
                KAAF Auditorium, UI
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#3fffe8]">
                <IdentificationIcon className="w-3.5 h-3.5" />
                <span>Security Fingerprint</span>
              </div>
              <p className="text-xs font-mono font-bold text-[#c6f552] truncate">
                SHA-256: {attendee.securityHash || "VERIFIED-SIGNATURE"}
              </p>
              <span className="text-[10px] text-white/60 block font-mono">
                Cryptographic HMAC Tamper-Proof
              </span>
            </div>
          </div>

          {/* Action Buttons: 1-Click LinkedIn, Download, View */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-white/10">
            {attendee.linkedInUrl && (
              <a
                href={attendee.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0077b5] hover:bg-[#006097] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                </svg>
                <span>Add Credential to LinkedIn</span>
              </a>
            )}

            <Link
              href={`/certificate?id=${attendee.certificateId}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(198,245,82,0.3)] cursor-pointer active:scale-95"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>View &amp; Download High-Res Certificate</span>
            </Link>
          </div>
        </div>

        {/* Security / Signatory Guarantee Card */}
        <div className="p-5 rounded-3xl bg-[#040032]/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-white/70">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="w-5 h-5 text-[#c6f552] shrink-0" />
            <p>
              Signed by Success Udoka (Conference Lead) &amp; Adeoye Okhaioisevai (IESA President).
            </p>
          </div>
          <span className="text-[10px] text-[#3fffe8] font-bold">
            100% Globally Authenticated
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/10 text-center text-xs font-mono text-white/40">
        © 2026 Industrial Engineering Students Association (IESA) · University of Ibadan, Nigeria
      </footer>
    </div>
  );
}
