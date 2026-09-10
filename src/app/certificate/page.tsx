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
  LockClosedIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import {
  getActiveCertificateConfig,
  CertificateConfigType,
} from "@/lib/certificateConfig";

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
  const [certConfig, setCertConfig] = useState<CertificateConfigType>(() =>
    getActiveCertificateConfig()
  );

  // Certificate Access Policy (Locked until after program, unless admin mode)
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRefreshingAccess, setIsRefreshingAccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check access state from backend API
  const checkAccess = useCallback(async () => {
    try {
      setIsRefreshingAccess(true);
      const res = await fetch("/api/certificate/access", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsUnlocked(Boolean(data.isUnlocked));
      }
    } catch (e) {
      console.warn("Failed to check certificate access:", e);
    } finally {
      setIsAccessChecked(true);
      setIsRefreshingAccess(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (
        searchParams.get("admin") === "true" ||
        searchParams.get("preview") === "true"
      ) {
        setIsAdminMode(true);
      }
    }
    checkAccess();
  }, [checkAccess]);

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

  // 1. Loading State
  if (!isAccessChecked) {
    return (
      <div className="min-h-screen bg-[#040032] text-white flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#c6f552] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-mono text-white/60">Verifying credential portal access...</p>
      </div>
    );
  }

  // 2. Locked State (When withheld until program concludes, unless admin override)
  if (!isUnlocked && !isAdminMode) {
    return (
      <div className="min-h-screen bg-[#040032] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none">
        {/* Background Ambient Glows */}
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#3fffe8]/10 via-[#c6f552]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Minimal Top Header */}
        <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors text-white"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Conference Home</span>
          </Link>

          <span className="text-xs font-mono text-[#c6f552] font-bold">
            IESA PROCESS DAY 2026
          </span>
        </header>

        {/* Center Locked Notice Card */}
        <main className="w-full max-w-xl mx-auto my-auto py-8">
          <div className="p-6 sm:p-10 rounded-3xl bg-[#02001e]/95 border-2 border-white/15 backdrop-blur-xl shadow-2xl text-center space-y-6">
            {/* Glowing Padlock Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#0a3825] border-2 border-[#c6f552]/50 flex items-center justify-center text-[#c6f552] shadow-[0_0_30px_rgba(198,245,82,0.25)]">
              <LockClosedIcon className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <ClockIcon className="w-3 h-3" />
                <span>Withheld During Program</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif-display font-extrabold text-white">
                Certificates Unlock After Today&apos;s Program
              </h2>

              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Official certificates of participation and completion will become accessible immediately following the conclusion of today&apos;s IESA Process Day closing protocols.
              </p>
            </div>

            {/* Checklist Box */}
            <div className="p-4 rounded-2xl bg-[#040032] border border-white/10 text-left space-y-2.5 text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <span className="text-[#c6f552] font-bold">✓</span>
                <span>All physical and online attendee check-ins are logged into the conference roster.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#c6f552] font-bold">✓</span>
                <span>The portal will be unlocked by the stage coordinators once the final sessions wrap up.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#c6f552] font-bold">✓</span>
                <span>Upon release, enter your matric number or name to download your verified certificate.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/#schedule"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(198,245,82,0.3)] text-center cursor-pointer"
              >
                Return to Live Stage Program
              </Link>

              <button
                type="button"
                onClick={checkAccess}
                disabled={isRefreshingAccess}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRefreshingAccess ? "animate-spin" : ""}`} />
                <span>Check If Unlocked</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-4xl mx-auto py-2 text-center text-xs font-mono text-white/40">
          IESA Process Day 2026 · Department of Industrial &amp; Production Engineering, UI
        </footer>
      </div>
    );
  }

  // 3. Unlocked Portal (or Admin Preview)
  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#040032] flex flex-col selection:bg-[#c6f552] selection:text-[#040032]">
      {/* Admin Preview Mode Alert Banner */}
      {isAdminMode && !isUnlocked && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-mono font-bold flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4 text-amber-400" />
            <span>ADMIN PREVIEW: The certificate portal is currently LOCKED for public delegates. You are viewing in coordinator test mode.</span>
          </div>
          <a
            href="/check-in"
            className="px-2.5 py-1 rounded-lg bg-amber-400 text-[#040032] text-[10px] uppercase font-bold hover:bg-amber-300"
          >
            Manage Lock in Admin
          </a>
        </div>
      )}

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
          <span>Cryptographically Verified</span>
        </div>
      </header>

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
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#c6f552] text-[#040032] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#b5e640] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,245,82,0.4)] cursor-pointer active:scale-95"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download High-Res Certificate</span>
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

            {/* High-Resolution Issuance Verification Badge */}
            <div className="p-4 rounded-2xl bg-[#040032]/5 border border-[#040032]/10 text-xs text-[#040032]/80 font-sans flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-[#0a3825] shrink-0" />
                <p>
                  Official credential rendered at 2048×1154 print resolution. Verified under IESA Chapter Protocols.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#0a3825] font-bold px-2.5 py-1 rounded-full bg-[#c6f552]/40 border border-[#0a3825]/20 shrink-0">
                VERIFIED
              </span>
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
