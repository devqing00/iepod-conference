"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/solid";
import { Compass } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Official Coordinates for KAAF Auditorium, Department of Human Nutrition & Dietetics, UI
const KAAF_COORDINATES = {
  lng: 3.8947055,
  lat: 7.4478715,
};

// UI Main Gate for route overview
const UI_GATE_COORDINATES = {
  lng: 3.8988,
  lat: 7.4402,
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type ViewMode = "mapbox" | "streetview" | "split";

export default function VenueMapTerminal() {
  const [viewMode, setViewMode] = useState<ViewMode>("mapbox");
  const [mapPitch3D, setMapPitch3D] = useState(true);
  const [activePreset, setActivePreset] = useState<"kaaf" | "gate">("kaaf");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      setViewMode("streetview");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [KAAF_COORDINATES.lng, KAAF_COORDINATES.lat],
        zoom: 16.6,
        pitch: 45,
        bearing: -15,
        attributionControl: false,
        cooperativeGestures: true,
      });

      // Add zoom and rotation controls to the map
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        }),
        "top-right"
      );

      // Add scale indicator
      map.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: "metric",
        }),
        "bottom-left"
      );

      map.on("load", () => {
        // Clean, elegant, static marker element (no blinking or pulsing)
        const el = document.createElement("div");
        el.className = "custom-kaaf-marker cursor-pointer group";
        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            <!-- Solid Pin with Glow Accent -->
            <div class="w-9 h-9 rounded-full bg-[#040032] border-2 border-[#c6f552] shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#c6f552" class="w-5 h-5">
                <path fill-rule="evenodd" d="M11.54 22.351A24.25 24.25 0 0 0 18 10.5C18 6.91 15.09 4 11.5 4S5 6.91 5 10.5c0 4.67 2.87 8.78 6.54 11.851Zm1.96-11.851a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <!-- Clean Venue Label Pill -->
            <div class="mt-1 bg-[#040032] text-[#faf8f2] text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-md border border-[#c6f552]/40 shadow whitespace-nowrap">
              KAAF Auditorium
            </div>
          </div>
        `;

        // Popup with friendly information
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: "custom-mapbox-popup",
        }).setHTML(`
          <div style="background: #040032; color: #faf8f2; padding: 14px 16px; border-radius: 14px; border: 1.5px solid #c6f552; font-family: sans-serif; font-size: 12px; max-width: 230px; box-shadow: 0 12px 28px rgba(0,0,0,0.45);">
            <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">
              KAAF Auditorium
            </div>
            <div style="color: #ece7d8; opacity: 0.9; margin-bottom: 10px; font-size: 11.5px; line-height: 1.4;">
              Department of Human Nutrition & Dietetics, University of Ibadan
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=7.4478715,3.8947055" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #c6f552; color: #040032; font-weight: bold; font-size: 11px; padding: 5px 12px; border-radius: 9999px; text-decoration: none;">
              Get Directions →
            </a>
          </div>
        `);

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([KAAF_COORDINATES.lng, KAAF_COORDINATES.lat])
          .setPopup(popup)
          .addTo(map);

        markerRef.current = marker;
      });

      mapRef.current = map;
    } catch (err) {
      console.error("Mapbox initialization error:", err);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Trigger resize when switching view modes to prevent grey tiles
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.resize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  // Recenter on KAAF Auditorium with 3D animation
  const flyToKaaf = useCallback(() => {
    setActivePreset("kaaf");
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [KAAF_COORDINATES.lng, KAAF_COORDINATES.lat],
      zoom: 16.8,
      pitch: 45,
      bearing: -15,
      essential: true,
      duration: 1800,
    });
  }, []);

  // Fly to UI Main Gate Overview
  const flyToGate = useCallback(() => {
    setActivePreset("gate");
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [
        (KAAF_COORDINATES.lng + UI_GATE_COORDINATES.lng) / 2,
        (KAAF_COORDINATES.lat + UI_GATE_COORDINATES.lat) / 2,
      ],
      zoom: 14.5,
      pitch: 30,
      bearing: 0,
      essential: true,
      duration: 2000,
    });
  }, []);

  // Toggle 3D Perspective vs Flat 2D Plan
  const toggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const nextPitch = mapPitch3D ? 0 : 50;
    setMapPitch3D(!mapPitch3D);
    mapRef.current.easeTo({
      pitch: nextPitch,
      duration: 700,
    });
  }, [mapPitch3D]);

  return (
    <div className="mt-10 rounded-3xl overflow-hidden border-2 border-[#040032] shadow-xl bg-[#040032] text-[#faf8f2] relative">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-[#040032] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Friendly Title & Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c6f552]" />
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#faf8f2]">
              Find Your Way to KAAF Auditorium
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#ece7d8]/80 font-sans">
            Department of Human Nutrition & Dietetics, University of Ibadan
          </p>
        </div>

        {/* Mode Selector Tabs & Directions Button */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="p-1 rounded-full bg-white/10 border border-white/15 flex items-center gap-1">
            {/* Map Button */}
            <button
              type="button"
              onClick={() => setViewMode("mapbox")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "mapbox"
                  ? "bg-[#c6f552] text-[#040032] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Campus Map</span>
            </button>

            {/* Street View Button */}
            <button
              type="button"
              onClick={() => setViewMode("streetview")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "streetview"
                  ? "bg-[#3fffe8] text-[#040032] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Street View</span>
            </button>

            {/* Split View Button (Desktop only) */}
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden lg:flex px-3.5 py-1.5 rounded-full text-xs font-sans font-bold items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-white text-[#040032] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <ViewColumnsIcon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Split View</span>
            </button>
          </div>

          {/* Direct Google Maps Navigation Link */}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=7.4478715,3.8947055"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-sans font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all active:scale-[0.98] group cursor-pointer whitespace-nowrap"
          >
            <span>Get Directions</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Main Interactive Map & Street View Viewports */}
      <div className="relative w-full h-[340px] sm:h-[440px] lg:h-[500px] bg-[#02001e] overflow-hidden">
        {/* VIEW 1: MAPBOX CANVAS CONTAINER */}
        <div
          className={`absolute inset-0 transition-all duration-300 isolate transform-gpu ${
            viewMode === "mapbox"
              ? "opacity-100 z-20 pointer-events-auto"
              : viewMode === "split"
              ? "opacity-100 z-20 w-full lg:w-1/2 pointer-events-auto border-r border-white/15"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Mapbox Canvas Mount Point */}
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Camera View Buttons */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-30 flex flex-col gap-1.5">
            <div className="p-1 rounded-xl bg-[#040032]/90 backdrop-blur-md border border-white/15 shadow-lg flex flex-col gap-1">
              <button
                type="button"
                onClick={flyToKaaf}
                title="Center on KAAF Auditorium"
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-sans font-semibold flex items-center gap-1.5 transition-all text-left cursor-pointer ${
                  activePreset === "kaaf"
                    ? "bg-[#c6f552] text-[#040032]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#040032]" />
                <span>KAAF Center</span>
              </button>

              <button
                type="button"
                onClick={flyToGate}
                title="View route from UI Main Gate"
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-sans font-semibold flex items-center gap-1.5 transition-all text-left cursor-pointer ${
                  activePreset === "gate"
                    ? "bg-[#3fffe8] text-[#040032]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>From UI Gate</span>
              </button>

              <button
                type="button"
                onClick={toggle3D}
                title="Toggle 3D View"
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-sans font-semibold flex items-center gap-1.5 transition-all text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                <span>{mapPitch3D ? "3D Angle" : "Flat 2D"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 2: 360° GOOGLE STREET VIEW EMBED */}
        <div
          className={`absolute inset-0 transition-all duration-300 isolate transform-gpu ${
            viewMode === "streetview"
              ? "opacity-100 z-20 pointer-events-auto"
              : viewMode === "split"
              ? "opacity-100 z-20 left-auto right-0 w-full lg:w-1/2 pointer-events-auto"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!4v1788820488214!6m8!1m7!1sC2toPoVuBxlaAqasCPR6mA!2m2!1d7.447871554799016!2d3.894705500215708!3f308.8721432503974!4f-25.185923918800142!5f1.1924812503605782"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full block"
            title="Front Entrance of KAAF Auditorium"
          />

          {/* Clean Static Location Badge */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-30 bg-[#040032]/90 backdrop-blur-md text-[#faf8f2] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/15 shadow-md flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#3fffe8]" />
            <span className="text-[11px] sm:text-xs font-sans font-medium text-white">
              Front Entrance & Approach · KAAF Auditorium
            </span>
          </div>
        </div>
      </div>

      {/* Transit Tip Footer Bar */}
      <div className="p-4 sm:p-5 bg-[#040032] border-t border-white/10 flex items-center gap-3 text-xs sm:text-sm text-white/90">
        <SparklesIcon className="w-5 h-5 text-[#c6f552] flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-[#c6f552]">Quick Transit Tip:</strong> From UI Main Gate, take a direct cab or bike drop straight to the <strong>Department of Human Nutrition and Dietetics</strong>. It saves you the walk and drops you right at KAAF Auditorium!
        </p>
      </div>
    </div>
  );
}
