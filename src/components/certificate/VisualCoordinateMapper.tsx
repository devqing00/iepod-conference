"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  DEFAULT_CERT_CONFIG,
  CERT_STORAGE_KEY,
  CertificateConfigType,
  FieldCoordConfig,
} from "@/lib/certificateConfig";
import {
  SparklesIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/solid";

type FieldKey = "name" | "department" | "certId" | "institution" | "qrCode";

interface FieldMeta {
  key: FieldKey;
  label: string;
  icon: string;
  defaultSample: string;
  badge: string;
}

const FIELDS: FieldMeta[] = [
  {
    key: "name",
    label: "Participant Name",
    icon: "👤",
    defaultSample: "OLUWASEUN BOLUWATIFE ADELEKE",
    badge: "bg-[#c6f552] text-[#040032]",
  },
  {
    key: "department",
    label: "Department",
    icon: "🏛️",
    defaultSample: "Industrial & Production Engineering",
    badge: "bg-[#ffdb58] text-[#040032]",
  },
  {
    key: "certId",
    label: "Certificate ID",
    icon: "🔑",
    defaultSample: "IESA-2026-CERT-B829FA1",
    badge: "bg-[#bbf2f6] text-[#040032]",
  },
  {
    key: "institution",
    label: "Institution",
    icon: "🏫",
    defaultSample: "University of Ibadan",
    badge: "bg-[#ece7d8] text-[#040032]",
  },
  {
    key: "qrCode",
    label: "QR Code (Verify)",
    icon: "📱",
    defaultSample: "https://iepod.vercel.app/verify/IESA-2026-CERT-B829FA1",
    badge: "bg-[#3fffe8] text-[#040032]",
  },
];

export default function VisualCoordinateMapper({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [config, setConfig] = useState<CertificateConfigType>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CERT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_CERT_CONFIG,
            ...parsed,
            coords: { ...DEFAULT_CERT_CONFIG.coords, ...parsed.coords },
          };
        }
      } catch {
        // Fall back
      }
    }
    return DEFAULT_CERT_CONFIG;
  });

  const [activeField, setActiveField] = useState<FieldKey>("name");
  const [sampleValues, setSampleValues] = useState<Record<FieldKey, string>>({
    name: "OLUWASEUN BOLUWATIFE ADELEKE",
    department: "Industrial & Production Engineering",
    certId: "IESA-2026-CERT-B829FA1",
    institution: "University of Ibadan",
    qrCode: "https://iepod.vercel.app/verify/IESA-2026-CERT-B829FA1",
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<"fetching" | "synced_db" | "synced_default" | "offline">("fetching");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [scaleFactor, setScaleFactor] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);

  // Fetch latest global config from Database on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/certificate/config")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.config?.coords?.name) {
          setConfig(data.config);
          setDbStatus(data.source === "database" ? "synced_db" : "synced_default");
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote cert config:", err);
        setDbStatus("offline");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load template image once
  useEffect(() => {
    const img = new Image();
    img.src = config.templateImageUrl;
    img.onload = () => {
      templateImgRef.current = img;
      redraw();
    };
  }, [config.templateImageUrl]);

  // Main Canvas Redraw Function
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = config.nativeWidth;
    const height = config.nativeHeight;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Template Image Background
    if (templateImgRef.current) {
      ctx.drawImage(templateImgRef.current, 0, 0, width, height);
    } else {
      ctx.fillStyle = "#faf7f0";
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Dynamic Text Fields
    FIELDS.filter((f) => f.key !== "qrCode").forEach((f) => {
      const fieldConf = config.coords[f.key as keyof typeof config.coords];
      if (!fieldConf) return;
      const isSelected = f.key === activeField;
      const rawText = sampleValues[f.key] || f.defaultSample;

      let displayText = rawText;
      if (fieldConf.textTransform === "uppercase" || f.key === "name") {
        displayText = rawText.toUpperCase();
      } else if (fieldConf.textTransform === "capitalize" || f.key === "department" || f.key === "institution") {
        displayText = rawText
          .toLowerCase()
          .replace(/(?:^|\s|-|\/|\()\S/g, (l) => l.toUpperCase());
      }

      ctx.save();
      ctx.textAlign = fieldConf.align;
      ctx.font = `${fieldConf.fontWeight} ${fieldConf.fontSize}px ${fieldConf.fontFamily}`;
      ctx.fillStyle = fieldConf.color;

      // Measure text for bounding box
      const metrics = ctx.measureText(displayText);
      const textWidth = metrics.width;
      const textHeight = fieldConf.fontSize;
      const maxFieldWidth = f.key === "name"
        ? (fieldConf.align === "left" ? config.nativeWidth - fieldConf.x - 45 : config.nativeWidth - 120)
        : undefined;

      // Draw the actual text
      if (maxFieldWidth) {
        ctx.fillText(displayText, fieldConf.x, fieldConf.y, maxFieldWidth);
      } else {
        ctx.fillText(displayText, fieldConf.x, fieldConf.y);
      }

      // Draw interactive bounding box & pin indicator if selected or hovered
      if (isSelected) {
        let boxX = fieldConf.x;
        if (fieldConf.align === "center") boxX = fieldConf.x - textWidth / 2;
        if (fieldConf.align === "right") boxX = fieldConf.x - textWidth;

        const boxY = fieldConf.y - textHeight + 2;
        const pad = 4;

        ctx.strokeStyle = "#c6f552";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(boxX - pad, boxY - pad, textWidth + pad * 2, textHeight + pad * 2);
        ctx.setLineDash([]);

        ctx.fillStyle = "#040032";
        ctx.fillRect(boxX - pad - 2, boxY - pad - 2, 6, 6);
        ctx.fillRect(boxX + textWidth + pad - 4, boxY - pad - 2, 6, 6);

        if (showCrosshair) {
          ctx.fillStyle = "#040032";
          ctx.fillRect(fieldConf.x - 35, fieldConf.y + 8, 70, 18);
          ctx.fillStyle = "#c6f552";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`X:${Math.round(fieldConf.x)} Y:${Math.round(fieldConf.y)}`, fieldConf.x, fieldConf.y + 21);
        }
      }

      ctx.restore();
    });

    // 3. Draw QR Code Element
    const qr = config.qrCode || DEFAULT_CERT_CONFIG.qrCode!;
    if (qr.enabled !== false) {
      const isQrSelected = activeField === "qrCode";
      const qx = qr.x;
      const qy = qr.y;
      const qSize = qr.size;

      ctx.save();

      // Background if set
      if (qr.bgColor && qr.bgColor !== "transparent") {
        ctx.fillStyle = qr.bgColor;
        ctx.fillRect(qx, qy, qSize, qSize);
      }

      // Draw high-contrast white matrix & finder patterns
      ctx.fillStyle = qr.color || "#ffffff";
      const mod = qSize / 21;

      const drawFinder = (fx: number, fy: number) => {
        ctx.fillRect(fx, fy, mod * 7, mod * 7);
        ctx.clearRect(fx + mod, fy + mod, mod * 5, mod * 5);
        ctx.fillRect(fx + mod * 2, fy + mod * 2, mod * 3, mod * 3);
      };

      drawFinder(qx, qy);
      drawFinder(qx + mod * 14, qy);
      drawFinder(qx, qy + mod * 14);

      // Deterministic decorative modules
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
          if (r === 6 || c === 6) {
            if ((r + c) % 2 === 0) ctx.fillRect(qx + c * mod, qy + r * mod, mod, mod);
            continue;
          }
          if ((r * 11 + c * 17 + (r ^ c)) % 3 === 0) {
            ctx.fillRect(qx + c * mod, qy + r * mod, mod, mod);
          }
        }
      }

      // Small label below QR code
      ctx.fillStyle = "#c6f552";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SCAN TO VERIFY", qx + qSize / 2, qy + qSize + 11);

      // Draw selection outline & coordinates
      if (isQrSelected) {
        const pad = 4;
        ctx.strokeStyle = "#c6f552";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(qx - pad, qy - pad, qSize + pad * 2, qSize + pad * 2 + 16);
        ctx.setLineDash([]);

        ctx.fillStyle = "#040032";
        ctx.fillRect(qx - pad - 2, qy - pad - 2, 6, 6);
        ctx.fillRect(qx + qSize + pad - 4, qy - pad - 2, 6, 6);
        ctx.fillRect(qx - pad - 2, qy + qSize + pad + 12, 6, 6);
        ctx.fillRect(qx + qSize + pad - 4, qy + qSize + pad + 12, 6, 6);

        if (showCrosshair) {
          ctx.fillStyle = "#040032";
          ctx.fillRect(qx + qSize / 2 - 45, qy - 24, 90, 18);
          ctx.fillStyle = "#c6f552";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`X:${Math.round(qx)} Y:${Math.round(qy)} S:${Math.round(qSize)}`, qx + qSize / 2, qy - 11);
        }
      }

      ctx.restore();
    }
  }, [config, activeField, sampleValues, showCrosshair]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Handle Dragging Text or QR Code directly on the canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = config.nativeWidth / rect.width;
    const scaleY = config.nativeHeight / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // 1. Check if clicked near QR code
    const qrConf = config.qrCode || DEFAULT_CERT_CONFIG.qrCode!;
    if (
      qrConf.enabled !== false &&
      x >= qrConf.x - 15 &&
      x <= qrConf.x + qrConf.size + 15 &&
      y >= qrConf.y - 15 &&
      y <= qrConf.y + qrConf.size + 25
    ) {
      setActiveField("qrCode");
      setIsDragging(true);
      return;
    }

    // 2. Check if clicked close to any text field to select it
    for (const f of FIELDS) {
      if (f.key === "qrCode") continue;
      const conf = config.coords[f.key as keyof typeof config.coords];
      if (!conf) continue;
      const dist = Math.hypot(conf.x - x, conf.y - y);
      if (dist < 60) {
        setActiveField(f.key);
        break;
      }
    }

    setIsDragging(true);
    updateActiveFieldCoord(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const { x, y } = getCanvasCoords(e);
    updateActiveFieldCoord(x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateActiveFieldCoord = (x: number, y: number) => {
    if (activeField === "qrCode") {
      setConfig((prev) => {
        const cur = prev.qrCode || DEFAULT_CERT_CONFIG.qrCode!;
        return {
          ...prev,
          qrCode: {
            ...cur,
            x: Math.max(0, Math.min(x, config.nativeWidth - cur.size)),
            y: Math.max(0, Math.min(y, config.nativeHeight - cur.size)),
          },
        };
      });
      return;
    }

    setConfig((prev) => ({
      ...prev,
      coords: {
        ...prev.coords,
        [activeField]: {
          ...prev.coords[activeField as keyof typeof prev.coords],
          x: Math.max(0, Math.min(x, config.nativeWidth)),
          y: Math.max(0, Math.min(y, config.nativeHeight)),
        },
      },
    }));
  };

  const updateActiveFieldProperty = <K extends keyof FieldCoordConfig>(
    prop: K,
    val: FieldCoordConfig[K]
  ) => {
    if (activeField === "qrCode") return;
    setConfig((prev) => ({
      ...prev,
      coords: {
        ...prev.coords,
        [activeField]: {
          ...prev.coords[activeField as keyof typeof prev.coords],
          [prop]: val,
        },
      },
    }));
  };

  const updateQrCodeProperty = (prop: keyof import("@/lib/certificateConfig").QRCodeCoordConfig, val: any) => {
    setConfig((prev) => ({
      ...prev,
      qrCode: {
        ...(prev.qrCode || DEFAULT_CERT_CONFIG.qrCode!),
        [prop]: val,
      },
    }));
  };

  // Save globally to database (and update local storage / event bus)
  const handleSaveCoordinates = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/certificate/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save configuration to database");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(config));
        window.dispatchEvent(
          new CustomEvent("cert-coords-updated", { detail: config })
        );
      }
      setDbStatus("synced_db");
      setSavedNote("Saved globally to database! All attendees will see this layout.");
      setTimeout(() => setSavedNote(null), 4000);
    } catch (err: any) {
      // Graceful fallback to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(config));
        window.dispatchEvent(
          new CustomEvent("cert-coords-updated", { detail: config })
        );
      }
      setSavedNote(`Saved to local session (${err.message || "DB sync pending"})`);
      setTimeout(() => setSavedNote(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Clean Config Code to Clipboard
  const handleCopyCode = () => {
    const codeSnippet = `export const CERT_CONFIG = ${JSON.stringify(config, null, 2)};`;
    navigator.clipboard.writeText(codeSnippet);
    setSavedNote("Config code copied to clipboard!");
    setTimeout(() => setSavedNote(null), 3000);
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    setIsSaving(true);
    setConfig(DEFAULT_CERT_CONFIG);
    try {
      await fetch("/api/certificate/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: DEFAULT_CERT_CONFIG }),
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem(CERT_STORAGE_KEY);
        window.dispatchEvent(
          new CustomEvent("cert-coords-updated", { detail: DEFAULT_CERT_CONFIG })
        );
      }
      setDbStatus("synced_db");
      setSavedNote("Reset to template default coordinates & updated database.");
      setTimeout(() => setSavedNote(null), 3500);
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem(CERT_STORAGE_KEY);
        window.dispatchEvent(
          new CustomEvent("cert-coords-updated", { detail: DEFAULT_CERT_CONFIG })
        );
      }
      setSavedNote("Reset to template default coordinates.");
      setTimeout(() => setSavedNote(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Download High-Res Preview PNG
  const handleDownloadPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `IESA_Certificate_Test_Preview.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const isQrActive = activeField === "qrCode";
  const qrConf = config.qrCode || DEFAULT_CERT_CONFIG.qrCode!;
  const textConf = !isQrActive ? config.coords[activeField as keyof typeof config.coords] : null;
  const activeCoord = isQrActive ? { x: qrConf.x, y: qrConf.y } : { x: textConf?.x || 0, y: textConf?.y || 0 };

  return (
    <div className="w-full bg-[#02001e] border-2 border-white/15 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-[#c6f552]" />
            <h3 className="font-serif-display font-bold text-lg sm:text-xl text-white">
              Visual Coordinate Mapper Studio
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#c6f552] text-[#040032] text-[10px] font-mono font-bold">
              1024 × 577 NATIVE
            </span>
            {dbStatus === "synced_db" && (
              <span className="px-2 py-0.5 rounded-full bg-[#3fffe8]/20 border border-[#3fffe8]/40 text-[#3fffe8] text-[10px] font-mono">
                ● Database Synced
              </span>
            )}
            {dbStatus === "fetching" && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-mono animate-pulse">
                Fetching DB...
              </span>
            )}
          </div>
          <p className="text-xs text-white/60 mt-1">
            Click & drag any field or the QR code directly on the certificate, or use the sliders to fine-tune exact positioning.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors cursor-pointer"
            >
              Exit Studio
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-mono text-white/80 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Revert to original template coordinates"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-mono text-[#3fffe8] transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy TypeScript configuration code"
          >
            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
            <span>Copy Code</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveCoordinates}
            className="px-4 py-1.5 rounded-full bg-[#c6f552] text-[#040032] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#b5e640] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,245,82,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#040032] border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Save to Database</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedNote && (
        <div className="p-3 rounded-2xl bg-[#c6f552]/20 border border-[#c6f552]/40 text-[#c6f552] text-xs font-mono flex items-center gap-2 animate-fade-in">
          <SparklesIcon className="w-4 h-4 text-[#c6f552]" />
          <span>{savedNote}</span>
        </div>
      )}

      {/* Field Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {FIELDS.map((f) => {
          const isSelected = f.key === activeField;
          const conf = f.key === "qrCode"
            ? (config.qrCode || DEFAULT_CERT_CONFIG.qrCode!)
            : config.coords[f.key as keyof typeof config.coords];
          if (!conf) return null;
          return (
            <button
              key={f.key}
              onClick={() => setActiveField(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? "bg-[#c6f552] text-[#040032] border-[#c6f552] font-bold shadow-md"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-[#040032] text-[#c6f552]" : "bg-white/10 text-white/50"
                }`}
              >
                X:{Math.round(conf.x)} Y:{Math.round(conf.y)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Canvas Workspace & Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Interactive Canvas Viewport */}
        <div
          ref={containerRef}
          className="lg:col-span-8 bg-[#040032] rounded-3xl p-3 sm:p-4 border border-white/20 shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <CursorArrowRaysIcon className="w-3.5 h-3.5 text-[#c6f552]" />
              <span>Interactive Dragging Active: Click & move elements directly</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCrosshair(!showCrosshair)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {showCrosshair ? "Hide Coordinates Overlay" : "Show Coordinates Overlay"}
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-auto cursor-crosshair select-none block"
              style={{ aspectRatio: "1024 / 577" }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>Template: /assets/certificate_template.png (1024 × 577)</span>
            <button
              type="button"
              onClick={handleDownloadPreview}
              className="text-[#3fffe8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-3 h-3" />
              <span>Download Test PNG</span>
            </button>
          </div>
        </div>

        {/* Right: Fine-Tuning Inspector Deck */}
        <div className="lg:col-span-4 bg-white/5 border border-white/15 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {FIELDS.find((f) => f.key === activeField)?.icon}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {FIELDS.find((f) => f.key === activeField)?.label}
                </h4>
                <span className="text-[10px] font-mono text-[#c6f552]">
                  {isQrActive ? "Fast-Scan QR Matrix" : "Active Field Inspector"}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-[#040032] px-2 py-1 rounded-xl border border-white/15 text-[#c6f552]">
              X: {Math.round(activeCoord.x)} · Y: {Math.round(activeCoord.y)}
            </span>
          </div>

          {/* X and Y Coordinate Adjustments */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/70 mb-1">
                <span>X Coordinate (Horizontal)</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveFieldCoord(activeCoord.x - 1, activeCoord.y)
                    }
                    className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-[#c6f552] font-bold">
                    {Math.round(activeCoord.x)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveFieldCoord(activeCoord.x + 1, activeCoord.y)
                    }
                    className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1024}
                value={activeCoord.x}
                onChange={(e) =>
                  updateActiveFieldCoord(Number(e.target.value), activeCoord.y)
                }
                className="w-full accent-[#c6f552] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/70 mb-1">
                <span>Y Coordinate (Vertical)</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveFieldCoord(activeCoord.x, activeCoord.y - 1)
                    }
                    className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-[#c6f552] font-bold">
                    {Math.round(activeCoord.y)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveFieldCoord(activeCoord.x, activeCoord.y + 1)
                    }
                    className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={577}
                value={activeCoord.y}
                onChange={(e) =>
                  updateActiveFieldCoord(activeCoord.x, Number(e.target.value))
                }
                className="w-full accent-[#c6f552] cursor-pointer"
              />
            </div>
          </div>

          {/* Conditional Controls: QR Code vs Typography */}
          {isQrActive ? (
            <div className="space-y-4 pt-2 border-t border-white/10">
              {/* QR Size Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-white/70 mb-1">
                  <span>QR Code Size ({Math.round(qrConf.size)}px)</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQrCodeProperty("size", Math.max(40, qrConf.size - 2))}
                      className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-[#c6f552] font-bold">
                      {Math.round(qrConf.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQrCodeProperty("size", Math.min(220, qrConf.size + 2))}
                      className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={40}
                  max={220}
                  value={qrConf.size}
                  onChange={(e) => updateQrCodeProperty("size", Number(e.target.value))}
                  className="w-full accent-[#c6f552] cursor-pointer"
                />
              </div>

              {/* Fast Scanning Information Card */}
              <div className="p-3.5 rounded-2xl bg-[#040032] border border-[#c6f552]/40 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#c6f552] font-bold">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Option A · Fast Scan Matrix</span>
                </div>
                <p className="text-[11px] text-white/75 leading-relaxed font-sans">
                  Rendered in crisp white over the dark sidebar with Error Correction Level M. Provides sub-second camera scanning from mobile devices and printed sheets.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#3fffe8]/20 text-[#3fffe8] font-bold">
                    Target: /verify/[certId]
                  </span>
                </div>
              </div>

              {/* Sample Target URL */}
              <div>
                <label className="block text-[10px] font-mono text-white/60 mb-1">
                  Target Verification URL (Dynamic per delegate)
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://iepod.vercel.app/verify/IESA-2026-CERT-B829FA1"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white/60 font-mono select-all"
                />
              </div>
            </div>
          ) : textConf ? (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-white/70 mb-1">
                  <span>Font Size ({textConf.fontSize}px)</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={42}
                  value={textConf.fontSize}
                  onChange={(e) =>
                    updateActiveFieldProperty("fontSize", Number(e.target.value))
                  }
                  className="w-full accent-[#c6f552] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-white/60 mb-1">
                    Font Weight
                  </label>
                  <select
                    value={textConf.fontWeight}
                    onChange={(e) =>
                      updateActiveFieldProperty(
                        "fontWeight",
                        e.target.value as any
                      )
                    }
                    className="w-full px-2 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none"
                  >
                    <option value="normal" className="bg-[#040032]">Normal</option>
                    <option value="600" className="bg-[#040032]">Semi-Bold (600)</option>
                    <option value="bold" className="bg-[#040032]">Bold</option>
                    <option value="800" className="bg-[#040032]">Extra Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/60 mb-1">
                    Alignment
                  </label>
                  <select
                    value={textConf.align}
                    onChange={(e) =>
                      updateActiveFieldProperty(
                        "align",
                        e.target.value as CanvasTextAlign
                      )
                    }
                    className="w-full px-2 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none"
                  >
                    <option value="left" className="bg-[#040032]">Left</option>
                    <option value="center" className="bg-[#040032]">Center</option>
                    <option value="right" className="bg-[#040032]">Right</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/60 mb-1">
                  Font Family
                </label>
                <select
                  value={textConf.fontFamily}
                  onChange={(e) =>
                    updateActiveFieldProperty("fontFamily", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none"
                >
                  <option value="'Space Mono', monospace" className="bg-[#040032]">
                    Space Mono (Techno Monospace)
                  </option>
                  <option value="'Courier New', monospace" className="bg-[#040032]">
                    Courier New (Monospace)
                  </option>
                  <option value="'Playfair Display', Georgia, serif" className="bg-[#040032]">
                    Playfair Display (Serif)
                  </option>
                  <option value="system-ui, -apple-system, sans-serif" className="bg-[#040032]">
                    Modern Sans-Serif
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/60 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textConf.color}
                    onChange={(e) =>
                      updateActiveFieldProperty("color", e.target.value)
                    }
                    className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textConf.color}
                    onChange={(e) =>
                      updateActiveFieldProperty("color", e.target.value)
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Test Sample Value Input */}
              <div>
                <label className="block text-[10px] font-mono text-white/60 mb-1">
                  Preview Sample Text
                </label>
                <input
                  type="text"
                  value={sampleValues[activeField]}
                  onChange={(e) =>
                    setSampleValues((prev) => ({
                      ...prev,
                      [activeField]: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c6f552]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
