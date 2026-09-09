"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import {
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  BoltSlashIcon,
  VideoCameraSlashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

interface QrScannerViewfinderProps {
  onScanSuccess: (decodedText: string) => void;
  isPaused: boolean;
}

export default function QrScannerViewfinder({
  onScanSuccess,
  isPaused,
}: QrScannerViewfinderProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "iesa-qr-viewfinder";

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Keep latest onScanSuccess in ref so scanner callback doesn't re-trigger
  const onScanSuccessRef = useRef(onScanSuccess);
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
    if (scannerRef.current) {
      try {
        if (isPaused) {
          scannerRef.current.pause(true);
        } else {
          scannerRef.current.resume();
        }
      } catch (e) {
        // Safe fallback if not in running state
      }
    }
  }, [isPaused]);

  // Initialize and start scanner
  const startScanner = useCallback(async (cameraMode: "environment" | "user") => {
    try {
      setIsReady(false);
      setErrorMessage(null);

      // Stop existing instance if running
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
          return { width: Math.max(220, edge), height: Math.max(220, edge) };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: cameraMode },
        config,
        (decodedText) => {
          if (isPausedRef.current) return;
          if (onScanSuccessRef.current) {
            onScanSuccessRef.current(decodedText);
          }
        },
        () => {
          // Ignore frame decode misses
        }
      );

      setHasPermission(true);
      setIsReady(true);

      // Inspect torch support
      try {
        const capabilities = (html5QrCode as any).getRunningTrackCameraCapabilities?.();
        if (capabilities && capabilities.torchFeature?.().isSupported()) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      } catch (e) {
        setTorchSupported(false);
      }
    } catch (err: any) {
      console.error("Camera start error:", err);
      setHasPermission(false);
      setErrorMessage(
        err?.message ||
          "Unable to access camera. Please allow camera permissions in your browser."
      );
    }
  }, []);

  useEffect(() => {
    startScanner(facingMode);

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch (e) {
          // Safe ignore
        }
        scannerRef.current = null;
      }
    };
  }, [facingMode, startScanner]);

  // Flip camera toggle
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Torch toggle
  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const nextState = !torchOn;
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn("Torch not supported on this track", e);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square rounded-3xl overflow-hidden bg-[#02001e] border-2 border-white/15 shadow-2xl">
      {/* HTML5 QR Container */}
      <div id={containerId} className="w-full h-full overflow-hidden" />

      {/* Cybernetic HUD Target Reticle & Scan Line Overlay */}
      {isReady && !isPaused && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Target Reticle Frame */}
          <div className="relative w-[72%] h-[72%] rounded-2xl border-2 border-[#3fffe8]/40 shadow-[0_0_20px_rgba(63,255,232,0.15)] overflow-hidden">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#c6f552] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#c6f552] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#c6f552] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#c6f552] rounded-br-lg" />

            {/* Center Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-6 h-[1px] bg-[#3fffe8]" />
              <div className="h-6 w-[1px] bg-[#3fffe8]" />
            </div>

            {/* Animated Laser Scanning Line */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c6f552] to-transparent shadow-[0_0_12px_#c6f552] animate-[scan_2s_ease-in-out_infinite]" />
          </div>

          <p className="absolute bottom-4 font-mono text-[11px] text-[#faf8f2]/70 bg-[#040032]/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            Align attendee QR code inside box
          </p>
        </div>
      )}

      {/* Viewfinder Controls (Flip, Flashlight) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {torchSupported && (
          <button
            type="button"
            onClick={toggleTorch}
            title={torchOn ? "Turn off Flashlight" : "Turn on Flashlight"}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              torchOn
                ? "bg-[#c6f552] text-[#040032] border-[#c6f552]"
                : "bg-[#040032]/80 text-white/80 border-white/20 hover:text-white"
            }`}
          >
            {torchOn ? <BoltSlashIcon className="w-5 h-5" /> : <BoltIcon className="w-5 h-5" />}
          </button>
        )}

        <button
          type="button"
          onClick={toggleCamera}
          title="Flip Camera (Front/Back)"
          className="p-2.5 rounded-full bg-[#040032]/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <ArrowPathRoundedSquareIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Inactive / Permission Denied State */}
      {hasPermission === false && (
        <div className="absolute inset-0 bg-[#040032] flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
            <VideoCameraSlashIcon className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-lg font-bold font-serif-display">Camera Permission Required</h3>
          <p className="text-xs text-[#ece7d8]/80 max-w-xs leading-relaxed">
            {errorMessage || "Please enable camera access in your browser settings to scan QR tickets."}
          </p>
          <button
            type="button"
            onClick={() => startScanner(facingMode)}
            className="px-4 py-2 rounded-xl bg-[#c6f552] text-[#040032] font-bold text-xs hover:bg-[#b5e83a] transition-all cursor-pointer"
          >
            Retry Camera Access
          </button>
        </div>
      )}

      {/* Camera Loading Spinner */}
      {hasPermission === null && !isReady && (
        <div className="absolute inset-0 bg-[#040032] flex flex-col items-center justify-center text-white space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#c6f552] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-white/70">Initializing camera...</span>
        </div>
      )}
    </div>
  );
}
