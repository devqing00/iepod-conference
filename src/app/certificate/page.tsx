"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { CERT_CONFIG } from "@/lib/certificateConfig";

interface AttendeeVerification {
  name: string;
  matricNumber: string;
  department: string;
  level: string;
  conferenceTitle: string;
  date: string;
  certificateId: string;
  verificationUrl: string;
}

export default function CertificateLookupPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendee, setAttendee] = useState<AttendeeVerification | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render certificate onto high-resolution Canvas
  const renderCertificate = useCallback((data: AttendeeVerification) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = CERT_CONFIG.canvasWidth;
    const height = CERT_CONFIG.canvasHeight;
    canvas.width = width;
    canvas.height = height;

    const templateImg = new Image();
    templateImg.src = CERT_CONFIG.templateImageUrl;

    const stampText = () => {
      const { coords } = CERT_CONFIG;

      // 1. Participant Name
      ctx.textAlign = coords.name.align;
      ctx.fillStyle = coords.name.color;
      ctx.font = coords.name.font;
      ctx.fillText(data.name.toUpperCase(), coords.name.x, coords.name.y);

      // Underline accent for participant name
      const textWidth = ctx.measureText(data.name.toUpperCase()).width;
      ctx.fillStyle = "#c6f552";
      ctx.fillRect(coords.name.x - textWidth / 2, coords.name.y + 16, textWidth, 5);

      // 2. Matric & Affiliation
      ctx.textAlign = coords.matric.align;
      ctx.fillStyle = coords.matric.color;
      ctx.font = coords.matric.font;
      ctx.fillText(
        `MATRIC NO: ${data.matricNumber}  ·  ${data.department}`,
        coords.matric.x,
        coords.matric.y
      );

      // 3. Citation
      ctx.textAlign = coords.citation.align;
      ctx.fillStyle = coords.citation.color;
      ctx.font = coords.citation.font;
      ctx.fillText(
        "has actively participated and contributed to the technical symposium, masterclasses,",
        coords.citation.x,
        coords.citation.y
      );
      ctx.fillText(
        "and engineering exhibitions at IESA Process Day 2026, held at KAAF Auditorium, University of Ibadan.",
        coords.citation.x,
        coords.citation.y + 40
      );

      // 4. Date
      ctx.textAlign = coords.date.align;
      ctx.fillStyle = coords.date.color;
      ctx.font = coords.date.font;
      ctx.fillText(data.date, coords.date.x, coords.date.y);

      // 5. Certificate Unique ID
      ctx.textAlign = coords.certId.align;
      ctx.fillStyle = coords.certId.color;
      ctx.font = coords.certId.font;
      ctx.fillText(data.certificateId, coords.certId.x, coords.certId.y);
    };

    templateImg.onload = () => {
      // Draw uploaded custom template graphic as base
      ctx.drawImage(templateImg, 0, 0, width, height);
      stampText();
    };

    templateImg.onerror = () => {
      // Stand-in royal certificate design if custom template is not uploaded yet
      // 1. Parchment Base
      ctx.fillStyle = "#faf7f0";
      ctx.fillRect(0, 0, width, height);

      // Subtle textured vignette
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        300,
        width / 2,
        height / 2,
        1100
      );
      grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      grad.addColorStop(1, "rgba(236, 231, 216, 0.8)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Navy & Gold Royal Borders
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#040032";
      ctx.strokeRect(50, 50, width - 100, height - 100);

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#c6f552";
      ctx.strokeRect(74, 74, width - 148, height - 148);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0a3825";
      ctx.strokeRect(86, 86, width - 172, height - 172);

      // Corner Brackets
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = "#040032";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.lineTo(40, 8);
        ctx.lineTo(8, 8);
        ctx.lineTo(8, 40);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      drawCorner(96, 96, 0);
      drawCorner(width - 96, 96, Math.PI / 2);
      drawCorner(width - 96, height - 96, Math.PI);
      drawCorner(96, height - 96, -Math.PI / 2);

      // 3. Institution Header
      ctx.textAlign = "center";
      ctx.fillStyle = "#0a3825";
      ctx.font = "bold 26px 'Courier New', monospace";
      ctx.fillText(
        "UNIVERSITY OF IBADAN · FACULTY OF TECHNOLOGY",
        width / 2,
        180
      );

      ctx.fillStyle = "#040032";
      ctx.font = "bold 34px 'Playfair Display', Georgia, serif";
      ctx.fillText(
        "DEPARTMENT OF INDUSTRIAL & PRODUCTION ENGINEERING",
        width / 2,
        230
      );

      ctx.fillStyle = "#4a5568";
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.fillText(
        "INDUSTRIAL ENGINEERING STUDENTS ASSOCIATION (IESA)",
        width / 2,
        270
      );

      // Decorative divider
      ctx.fillStyle = "#0a3825";
      ctx.fillRect(width / 2 - 180, 295, 360, 3);
      ctx.fillStyle = "#c6f552";
      ctx.beginPath();
      ctx.arc(width / 2, 296, 7, 0, Math.PI * 2);
      ctx.fill();

      // Title
      ctx.fillStyle = "#040032";
      ctx.font = "bold 68px 'Playfair Display', Georgia, serif";
      ctx.fillText("CERTIFICATE OF PARTICIPATION", width / 2, 420);

      ctx.fillStyle = "#4a5568";
      ctx.font = "italic 28px 'Playfair Display', Georgia, serif";
      ctx.fillText("This is officially presented to acknowledge that", width / 2, 510);

      // Signature lines
      const drawSig = (x: number, y: number, title: string, subtitle: string) => {
        ctx.strokeStyle = "#040032";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 180, y);
        ctx.lineTo(x + 180, y);
        ctx.stroke();

        ctx.fillStyle = "#040032";
        ctx.font = "bold 20px 'Playfair Display', Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(title, x, y + 30);

        ctx.fillStyle = "#4a5568";
        ctx.font = "16px 'Courier New', monospace";
        ctx.fillText(subtitle, x, y + 54);
      };

      drawSig(520, 1200, "Prof. A. A. Adebiyi", "Staff Adviser / HOD");
      drawSig(1480, 1200, "IESA President", "Conference Convener");

      // Official Seal Medallion in center bottom
      ctx.save();
      ctx.translate(width / 2, 1180);
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.fillStyle = "#040032";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#c6f552";
      ctx.stroke();

      ctx.fillStyle = "#c6f552";
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("OFFICIAL SEAL", 0, -10);
      ctx.fillText("IESA · 2026", 0, 10);
      ctx.fillText("VERIFIED", 0, 30);
      ctx.restore();

      // Stamp attendee details
      stampText();
    };
  }, []);

  // Trigger verify on form submission
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setError("Please enter your matric number or ticket code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/certificate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Attendance verification failed.");
      }

      setAttendee(data.attendee);
    } catch (err: any) {
      setError(err.message || "Failed to verify certificate.");
      setAttendee(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-draw canvas whenever attendee record changes
  useEffect(() => {
    if (attendee) {
      renderCertificate(attendee);
    }
  }, [attendee, renderCertificate]);

  // Download high-resolution PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !attendee) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const safeName = attendee.name.replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `IESA_Process_Day_2026_Certificate_${safeName}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#040032] flex flex-col selection:bg-[#c6f552] selection:text-[#040032]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#040032]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-xs sm:text-sm font-bold font-serif-display text-[#c6f552] truncate">
            Digital Certificate Portal · IESA Process Day 2026
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-white/70">
          <ShieldCheckIcon className="w-4 h-4 text-[#c6f552]" />
          <span className="hidden sm:inline">Cryptographically Verified</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Card */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a3825] text-[#c6f552] border border-[#c6f552]/30 text-xs font-mono font-bold uppercase">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Official Attendance Verification</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif-display font-extrabold text-[#040032]">
            Claim Your Digital Certificate
          </h2>

          <p className="text-xs sm:text-sm text-[#040032]/75 leading-relaxed">
            Enter your University of Ibadan matriculation number, conference ticket code,
            or registered name to verify your attendance and download your certified credential.
          </p>
        </div>

        {/* Verification Form */}
        <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-3xl bg-[#02001e] border border-white/20 shadow-xl text-white">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-mono text-[#c6f552] uppercase tracking-wider">
              Enter Matric Number or Ticket Code
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 218492 or IESA-CONF-2026 or Your Name"
                className="w-full pl-4 pr-28 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 px-4 py-2 rounded-xl bg-[#c6f552] text-[#040032] text-xs font-mono font-bold uppercase hover:bg-[#b5e640] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#040032] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>
            )}

            {/* Quick Demo Test Pills */}
            <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px] font-mono text-white/50">
              <span>Quick Test:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("218492");
                  setTimeout(() => handleVerify(), 50);
                }}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[#c6f552] transition-colors cursor-pointer"
              >
                Matric: 218492
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("IESA-CONF-2026");
                  setTimeout(() => handleVerify(), 50);
                }}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[#c6f552] transition-colors cursor-pointer"
              >
                Ticket: IESA-CONF-2026
              </button>
            </div>
          </form>
        </div>

        {/* Certificate Display & Download Section */}
        {attendee && (
          <div className="space-y-6 pt-4 animate-fade-in">
            {/* Status Summary Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a3825] border border-[#c6f552]/40 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c6f552]/20 border border-[#c6f552] flex items-center justify-center text-[#c6f552] flex-shrink-0">
                  <CheckBadgeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-display font-bold text-base sm:text-lg text-white">
                    Verified Delegate: {attendee.name}
                  </h3>
                  <p className="text-xs text-[#c6f552] font-mono">
                    Matric No: {attendee.matricNumber} · ID: {attendee.certificateId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#c6f552] text-[#040032] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#b5e640] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,245,82,0.4)] cursor-pointer"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Download Official PNG (High-Res)</span>
              </button>
            </div>

            {/* Live Certificate Canvas Preview */}
            <div className="rounded-3xl border-2 border-[#040032]/20 overflow-hidden shadow-2xl bg-white p-2 sm:p-4">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-2xl shadow-inner border border-black/5"
                style={{ aspectRatio: "2000 / 1414" }}
              />
            </div>

            {/* Template Coordinates Note for Coordinator */}
            <div className="p-4 rounded-2xl bg-[#ece7d8] border border-[#040032]/15 text-xs text-[#040032]/80 font-mono">
              <p className="font-bold text-[#040032] mb-1">
                ⚙️ Certificate Template Coordinates:
              </p>
              <p>
                When your final graphical template is ready, simply drop it in{" "}
                <code className="bg-[#040032]/10 px-1.5 py-0.5 rounded text-[#040032]">
                  public/assets/certificate_template.png
                </code>
                . You can adjust the text X/Y coordinate constants at the top of{" "}
                <code className="bg-[#040032]/10 px-1.5 py-0.5 rounded text-[#040032]">
                  src/app/certificate/page.tsx
                </code>{" "}
                to match your design seamlessly.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 px-4 border-t border-[#040032]/10 text-center text-xs font-mono text-[#040032]/60">
        © 2026 Industrial Engineering Students Association (IESA) · University of Ibadan
      </footer>
    </div>
  );
}
