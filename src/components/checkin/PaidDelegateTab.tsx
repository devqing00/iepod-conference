"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ArrowPathIcon,
  TicketIcon,
} from "@heroicons/react/24/solid";
import QrScannerViewfinder from "./QrScannerViewfinder";
import { AttendanceStats, RosterAttendee } from "./AttendanceDashboard";

interface PaidDelegateTabProps {
  onScanSuccess: (qrData: string, serviceType?: "admission" | "food") => void;
  onManualCheckin: (
    data: { matricNumber?: string; email?: string; studentId?: string },
    serviceType?: "admission" | "food"
  ) => void;
  isVerifying: boolean;
  hasResult: boolean;
  stats: AttendanceStats | null;
  onRefreshStats: () => Promise<void>;
}

export default function PaidDelegateTab({
  onScanSuccess,
  onManualCheckin,
  isVerifying,
  hasResult,
  stats,
  onRefreshStats,
}: PaidDelegateTabProps) {
  const [subMode, setSubMode] = useState<"admission" | "food">("admission");
  const [showManualLookup, setShowManualLookup] = useState(false);
  const [searchMatric, setSearchMatric] = useState("");
  const [showRoster, setShowRoster] = useState(false);
  const [roster, setRoster] = useState<RosterAttendee[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterFilter, setRosterFilter] = useState("");
  const [rosterMealTab, setRosterMealTab] = useState<"all" | "pending" | "served">("all");

  // Lock background scroll when roster modal is open
  useEffect(() => {
    if (showRoster) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [showRoster]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchMatric.trim();
    if (!clean) return;
    onManualCheckin({ matricNumber: clean }, subMode);
  };

  const fetchRoster = async (force = false) => {
    setShowRoster(true);
    if (roster.length > 0 && !force) return;
    setLoadingRoster(true);
    try {
      const res = await fetch("/api/check-in/roster");
      const data = await res.json();
      if (data.roster) {
        setRoster(data.roster);
      }
    } catch (e) {
      console.error("Error loading paid roster:", e);
    } finally {
      setLoadingRoster(false);
    }
  };

  const paidCheckedIn = (stats as any)?.paidCheckedInCount ?? stats?.checkedInCount ?? 0;
  const totalPaid = stats?.totalPaid ?? 53;
  const foodServedCount = stats?.foodServedCount ?? 0;
  const foodPendingCount = stats?.foodPendingCount ?? Math.max(0, totalPaid - foodServedCount);

  // Filter roster by text search and meal status tab
  const filteredRoster = roster.filter((r) => {
    const q = rosterFilter.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.matricNumber.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.department && r.department.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (rosterMealTab === "pending") return !r.foodServed;
    if (rosterMealTab === "served") return !!r.foodServed;
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Sub-mode Segmented Toggle: Gate Pass vs Food Check-In */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-[#02001e] border border-white/15 w-full max-w-sm mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setSubMode("admission")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subMode === "admission"
              ? "bg-[#c6f552] text-[#040032] shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
        >
          <TicketIcon className="w-3.5 h-3.5" />
          <span>🎟️ Gate Pass</span>
        </button>

        <button
          type="button"
          onClick={() => setSubMode("food")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subMode === "food"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-[#040032] shadow-sm font-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          <span>🍱</span>
          <span>Food Check-In</span>
          {foodPendingCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                subMode === "food"
                  ? "bg-[#040032] text-amber-300"
                  : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
              }`}
            >
              {foodPendingCount} left
            </span>
          )}
        </button>
      </div>

      {/* Title & Dynamic Stats Bar */}
      <div className="text-center space-y-2">
        <h3 className="text-lg sm:text-xl font-bold font-serif-display text-white flex items-center justify-center gap-2">
          {subMode === "food" ? (
            <span className="text-amber-400 flex items-center gap-2">
              <span>🍱</span>
              <span>VIP Meal Package Check-In</span>
            </span>
          ) : (
            <span>Scan Paid Delegate Ticket</span>
          )}
        </h3>

        <p className="text-xs text-white/60 max-w-sm mx-auto">
          {subMode === "food"
            ? "Scan delegate QR or search matric number to issue 1x VIP meal & beverage package. Prevents duplicate claims."
            : "Hold QR code in front of camera to verify payment and issue the Special VIP Delegate Tag."}
        </p>

        {/* Counter Bar with Shimmer */}
        <div
          className={`relative overflow-hidden inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-[#02001e] border text-xs font-mono shadow-sm transition-colors ${
            subMode === "food" ? "border-amber-400/40" : "border-white/20"
          }`}
        >
          <div className="shimmer-sweep" />

          <div className="flex items-center gap-1.5 relative z-10">
            <span
              className={`w-2 h-2 rounded-full ${
                subMode === "food" ? "bg-amber-400 animate-pulse" : "bg-[#c6f552]"
              }`}
            />
            {subMode === "food" ? (
              <>
                <span className="text-white/70">Meals Served:</span>
                <span className="text-amber-300 font-bold">{foodServedCount}</span>
                <span className="text-white/40">/</span>
                <span className="text-white/80">{totalPaid}</span>
                <span className="text-[10px] text-amber-400/80">({foodPendingCount} remaining)</span>
              </>
            ) : (
              <>
                <span className="text-white/70">Verified Paid:</span>
                <span className="text-[#c6f552] font-bold">{paidCheckedIn}</span>
                <span className="text-white/40">/</span>
                <span className="text-white/80">{totalPaid}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchRoster(false)}
            className={`text-[11px] hover:underline flex items-center gap-1 cursor-pointer pl-2 border-l border-white/15 relative z-10 ${
              subMode === "food" ? "text-amber-300" : "text-[#3fffe8]"
            }`}
          >
            <UsersIcon className="w-3 h-3" />
            <span>{subMode === "food" ? `Meal Roster (${totalPaid})` : `Paid List (${totalPaid})`}</span>
          </button>
        </div>
      </div>

      {/* Primary Scanner Viewfinder */}
      <div className="relative">
        <QrScannerViewfinder
          onScanSuccess={(qr) => onScanSuccess(qr, subMode)}
          isPaused={isVerifying || hasResult}
        />
        {isVerifying && (
          <div className="absolute inset-0 bg-[#040032]/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border text-xs font-mono text-white ${
                subMode === "food" ? "border-amber-400/50" : "border-[#c6f552]/40"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin ${
                  subMode === "food" ? "border-amber-400" : "border-[#c6f552]"
                }`}
              />
              {subMode === "food" ? "Verifying meal entitlement..." : "Verifying payment status..."}
            </span>
          </div>
        )}
      </div>

      {/* Manual Lookup Fallback */}
      <div
        className={`bg-[#02001e]/80 border rounded-2xl p-3 text-white transition-colors ${
          subMode === "food" ? "border-amber-400/25" : "border-white/10"
        }`}
      >
        <button
          type="button"
          onClick={() => setShowManualLookup(!showManualLookup)}
          className="w-full flex items-center justify-between text-xs font-mono text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <MagnifyingGlassIcon
              className={`w-3.5 h-3.5 ${subMode === "food" ? "text-amber-400" : "text-[#c6f552]"}`}
            />
            <span>
              {subMode === "food"
                ? "Look up delegate matric or name to serve food"
                : "Search paid attendee by matric number or name"}
            </span>
          </div>
          <span className={`font-bold ${subMode === "food" ? "text-amber-400" : "text-[#c6f552]"}`}>
            {showManualLookup ? "Hide ▲" : "Search ▼"}
          </span>
        </button>

        {showManualLookup && (
          <form
            onSubmit={handleManualSubmit}
            className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={searchMatric}
              onChange={(e) => setSearchMatric(e.target.value)}
              placeholder={
                subMode === "food"
                  ? "Enter matric or name for meal (e.g. 244079 or Umoru)"
                  : "Enter matric number or name (e.g. 244079 or Umoru)"
              }
              className={`flex-1 px-3 py-2 rounded-xl bg-[#040032] border text-white placeholder-white/30 text-xs font-mono focus:outline-none ${
                subMode === "food"
                  ? "border-amber-400/30 focus:border-amber-400"
                  : "border-white/20 focus:border-[#c6f552]"
              }`}
            />
            <button
              type="submit"
              disabled={isVerifying || !searchMatric.trim()}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0 ${
                subMode === "food"
                  ? "bg-amber-400 text-[#040032] hover:bg-amber-300"
                  : "bg-[#c6f552] text-[#040032] hover:bg-[#b5e640]"
              }`}
            >
              {subMode === "food" ? "🍱 Issue Meal" : "Verify Gate"}
            </button>
          </form>
        )}
      </div>

      {/* Paid Participants & Meal Roster Modal */}
      {showRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-full lg:max-w-xl bg-[#02001e] border-2 border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-2xl space-y-3.5 max-h-[82vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <span>Paid VIP Delegates &amp; Meal Roster</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#c6f552]/20 text-[#c6f552] font-mono">
                    53 VIPs
                  </span>
                </h4>
                <div className="text-xs text-white/60 flex items-center gap-3 mt-1 font-mono">
                  <span>🎟️ Admitted: {paidCheckedIn}/{totalPaid}</span>
                  <span>•</span>
                  <span className="text-amber-300">🍱 Meals Served: {foodServedCount}/{totalPaid}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fetchRoster(true)}
                  title="Refresh live status"
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loadingRoster ? "animate-spin text-[#3fffe8]" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoster(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 bg-[#040032] p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setRosterMealTab("all")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                    rosterMealTab === "all"
                      ? "bg-white/20 text-white font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  All ({roster.length || totalPaid})
                </button>
                <button
                  type="button"
                  onClick={() => setRosterMealTab("pending")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    rosterMealTab === "pending"
                      ? "bg-amber-400 text-[#040032] font-bold"
                      : "text-amber-300 hover:text-white"
                  }`}
                >
                  <span>🍱 Need Meal</span>
                  <span className="text-[10px]">({foodPendingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRosterMealTab("served")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    rosterMealTab === "served"
                      ? "bg-[#c6f552] text-[#040032] font-bold"
                      : "text-[#c6f552] hover:text-white"
                  }`}
                >
                  <span>✓ Served</span>
                  <span className="text-[10px]">({foodServedCount})</span>
                </button>
              </div>

              <input
                type="text"
                value={rosterFilter}
                onChange={(e) => setRosterFilter(e.target.value)}
                placeholder="Filter by name, matric number, or department..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#040032] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f552]"
              />
            </div>

            {/* Attendee Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/10 space-y-1.5 pr-1">
              {loadingRoster ? (
                <div className="py-12 text-center text-xs text-white/50 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Loading paid delegates &amp; meal records...</span>
                </div>
              ) : filteredRoster.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/50">
                  No delegates match this filter.
                </div>
              ) : (
                filteredRoster.map((r) => (
                  <div
                    key={r.studentId}
                    className="p-3 rounded-xl hover:bg-white/5 bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{r.name}</span>
                        {r.foodServed && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-mono">
                            🍱 Fed
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-white/60">
                        {r.matricNumber} · {r.department}
                      </div>
                      {r.foodServedAt && (
                        <div className="text-[10px] text-amber-200/70 font-mono mt-0.5">
                          Meal issued at{" "}
                          {new Date(r.foodServedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {r.foodServedBy && ` (${r.foodServedBy})`}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Gate Pass Status/Action */}
                      {r.isCheckedIn ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#c6f552]/15 border border-[#c6f552]/30 text-[#c6f552] text-[10px] font-mono whitespace-nowrap">
                          ✓ Admitted
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoster(false);
                            onManualCheckin(
                              { studentId: r.studentId, matricNumber: r.matricNumber },
                              "admission"
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#c6f552] hover:bg-[#b5e640] text-[#040032] font-mono font-bold text-[10px] uppercase whitespace-nowrap cursor-pointer transition-colors"
                        >
                          Gate In
                        </button>
                      )}

                      {/* Food Status/Action */}
                      {r.foodServed ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-mono whitespace-nowrap">
                          ✓ Meal Claimed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoster(false);
                            onManualCheckin(
                              { studentId: r.studentId, matricNumber: r.matricNumber },
                              "food"
                            );
                          }}
                          className="relative overflow-hidden px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#040032] font-mono font-bold text-[10px] whitespace-nowrap cursor-pointer shadow-sm flex items-center gap-1 transition-all"
                        >
                          <div className="shimmer-sweep" />
                          <span className="relative z-10">🍱 Serve Meal</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
