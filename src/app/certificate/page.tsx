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
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import {
  getActiveCertificateConfig,
  CertificateConfigType,
} from "@/lib/certificateConfig";
import VisualCoordinateMapper from "@/components/certificate/VisualCoordinateMapper";

interface AttendeeVerification {
  name: string;
  matricNumber: string;
  department: string;
  level?: string;
  institution?: string;
  conferenceTitle?: string;
  date?: string;
  certificateId: string;
  verificationUrl?: string;
}

export default function CertificateLookupPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendee, setAttendee] = useState<AttendeeVerification | null>(null);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [certConfig, setCertConfig] = useState<CertificateConfigType>(() =>
    getActiveCertificateConfig()
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch global config from Database on mount, plus sync active changes
  useEffect(() => {
    let isMounted = true;
    fetch("/api/certificate/config")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.config?.coords?.name) {
          setCertConfig(data.config);
        }
      })
      .catch((err) => console.warn("Using local/default cert config:", err));

    const handleConfigUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CertificateConfigType>;
      if (customEvent.detail) {
        setCertConfig(customEvent.detail);
      } else {
        setCertConfig(getActiveCertificateConfig());
      }
    };

    window.addEventListener("cert-coords-updated", handleConfigUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("cert-coords-updated", handleConfigUpdate);
    };
  }, []);

  // Format helper for dynamic text transforms
  const formatText = (text: string, transform?: "uppercase" | "capitalize" | "none") => {
    if (transform === "uppercase") return text.toUpperCase();
    if (transform === "capitalize") {
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return text;
  };

  // Render certificate onto high-resolution Canvas (2x scale of native 1024x577 = 2048x1154)
  const renderCertificate = useCallback(
    (data: AttendeeVerification, config: CertificateConfigType) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = 2; // 2x high-resolution export
      const width = config.nativeWidth * scale;
      const height = config.nativeHeight * scale;
      canvas.width = width;
      canvas.height = height;

      const templateImg = new Image();
      templateImg.src = config.templateImageUrl;

      const stampFields = () => {
        const { coords } = config;

        // 1. Participant Name: Centered over the long underline
        const nameCfg = coords.name;
        ctx.save();
        ctx.textAlign = nameCfg.align;
        ctx.fillStyle = nameCfg.color;
        ctx.font = `${nameCfg.fontWeight} ${nameCfg.fontSize * scale}px ${nameCfg.fontFamily}`;
        ctx.fillText(
          formatText(data.name, nameCfg.textTransform),
          nameCfg.x * scale,
          nameCfg.y * scale
        );
        ctx.restore();

        // 2. Matric Number
        const matricCfg = coords.matric;
        ctx.save();
        ctx.textAlign = matricCfg.align;
        ctx.fillStyle = matricCfg.color;
        ctx.font = `${matricCfg.fontWeight} ${matricCfg.fontSize * scale}px ${matricCfg.fontFamily}`;
        ctx.fillText(
          formatText(data.matricNumber, matricCfg.textTransform),
          matricCfg.x * scale,
          matricCfg.y * scale
        );
        ctx.restore();

        // 3. Department
        const deptCfg = coords.department;
        ctx.save();
        ctx.textAlign = deptCfg.align;
        ctx.fillStyle = deptCfg.color;
        ctx.font = `${deptCfg.fontWeight} ${deptCfg.fontSize * scale}px ${deptCfg.fontFamily}`;
        ctx.fillText(
          formatText(data.department, deptCfg.textTransform),
          deptCfg.x * scale,
          deptCfg.y * scale
        );
        ctx.restore();

        // 4. Certificate ID
        const idCfg = coords.certId;
        ctx.save();
        ctx.textAlign = idCfg.align;
        ctx.fillStyle = idCfg.color;
        ctx.font = `${idCfg.fontWeight} ${idCfg.fontSize * scale}px ${idCfg.fontFamily}`;
        ctx.fillText(
          formatText(data.certificateId, idCfg.textTransform),
          idCfg.x * scale,
          idCfg.y * scale
        );
        ctx.restore();

        // 5. Institution
        const instCfg = coords.institution;
        ctx.save();
        ctx.textAlign = instCfg.align;
        ctx.fillStyle = instCfg.color;
        ctx.font = `${instCfg.fontWeight} ${instCfg.fontSize * scale}px ${instCfg.fontFamily}`;
        ctx.fillText(
          formatText(data.institution || "University of Ibadan", instCfg.textTransform),
          instCfg.x * scale,
          instCfg.y * scale
        );
        ctx.restore();
      };

      templateImg.onload = () => {
        // Draw official background template graphic
        ctx.drawImage(templateImg, 0, 0, width, height);
        stampFields();
      };

      templateImg.onerror = () => {
        // Fallback drawing if template fails to load
        ctx.fillStyle = "#faf7f0";
        ctx.fillRect(0, 0, width, height);

        // Header & border
        ctx.lineWidth = 10 * scale;
        ctx.strokeStyle = "#040032";
        ctx.strokeRect(30 * scale, 30 * scale, width - 60 * scale, height - 60 * scale);

        ctx.textAlign = "center";
        ctx.fillStyle = "#040032";
        ctx.font = `bold ${32 * scale}px Georgia, serif`;
        ctx.fillText("CERTIFICATE OF PARTICIPATION", width / 2, 100 * scale);

        stampFields();
      };
    },
    []
  );

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

  // Re-draw canvas whenever attendee record or config changes
  useEffect(() => {
    if (attendee) {
      renderCertificate(attendee, certConfig);
    }
  }, [attendee, certConfig, renderCertificate]);

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

        <div className="flex items-center gap-2.5">
          {/* Visual Mapper Studio Trigger */}
          <button
            type="button"
            onClick={() => setIsMapperOpen(!isMapperOpen)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMapperOpen
                ? "bg-[#c6f552] text-[#040032] shadow-[0_0_15px_rgba(198,245,82,0.4)]"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visual Mapper Studio</span>
            <span className="sm:hidden">Mapper</span>
            {isMapperOpen ? (
              <ChevronUpIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-white/70">
            <ShieldCheckIcon className="w-4 h-4 text-[#c6f552]" />
            <span>Cryptographically Verified</span>
          </div>
        </div>
      </header>

      {/* Visual Coordinate Mapper Studio Collapsible Drawer */}
      {isMapperOpen && (
        <section className="bg-[#02001e] border-b-2 border-[#c6f552]/30 px-4 sm:px-8 py-6 shadow-2xl animate-fade-in">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c6f552]">
                <SparklesIcon className="w-4 h-4" />
                <span>Coordinate Studio · Real-time text calibration</span>
              </div>
              <Link
                href="/certificate/mapper"
                className="text-xs font-mono text-white/60 hover:text-white underline"
              >
                Open Fullscreen Studio ↗
              </Link>
            </div>
            <VisualCoordinateMapper onClose={() => setIsMapperOpen(false)} />
          </div>
        </section>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Card */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#040032]/5 border border-[#040032]/10 text-[11px] font-mono font-bold text-[#040032]">
            <SparklesIcon className="w-3.5 h-3.5 text-[#0a3825]" />
            <span>Official Conference Credential</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif-display font-extrabold text-[#040032]">
            Claim Your Certificate
          </h2>

          <p className="text-xs sm:text-sm text-[#040032]/75 leading-relaxed">
            Enter your matriculation number or name to get and download your official certificate.
          </p>
        </div>

        {/* Verification Form */}
        <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-3xl bg-[#02001e] border border-white/20 shadow-xl text-white">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-mono text-[#c6f552] uppercase tracking-wider">
              Matriculation Number or Name
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 218492 or Oluwaseun Adeleke"
                className="w-full pl-4 pr-32 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
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
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>
            )}

            {/* Quick Demo Test Pill */}
            <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px] font-mono text-white/50">
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
                    {attendee.name}
                  </h3>
                  <p className="text-xs text-[#c6f552] font-mono">
                    Matric No: {attendee.matricNumber} · ID: {attendee.certificateId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsMapperOpen(true)}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 text-[#c6f552]" />
                  <span>Adjust Coordinates</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#c6f552] text-[#040032] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#b5e640] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,245,82,0.4)] cursor-pointer"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download Certificate</span>
                </button>
              </div>
            </div>

            {/* Live Certificate Canvas Preview */}
            <div className="rounded-3xl border-2 border-[#040032]/20 overflow-hidden shadow-2xl bg-white p-2 sm:p-4">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-2xl shadow-inner border border-black/5"
                style={{ aspectRatio: "1024 / 577" }}
              />
            </div>

            {/* Coordinate Mapper Callout */}
            <div className="p-4 rounded-2xl bg-[#ece7d8] border border-[#040032]/15 text-xs text-[#040032]/80 font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#040032] mb-0.5">
                  ⚙️ Coordinate Studio:
                </p>
                <p>
                  Need to nudge text positions or adjust font sizes? Use the Visual Coordinate Mapper.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMapperOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl bg-[#040032] text-[#c6f552] font-mono font-bold text-xs uppercase hover:bg-[#02001e] transition-colors cursor-pointer shrink-0"
              >
                Open Studio
              </button>
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
