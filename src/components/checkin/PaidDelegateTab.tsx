"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import QrScannerViewfinder from "./QrScannerViewfinder";
import { AttendanceStats, RosterAttendee } from "./AttendanceDashboard";

interface PaidDelegateTabProps {
  onScanSuccess: (qrData: string) => void;
  onManualCheckin: (data: { matricNumber?: string; email?: string; studentId?: string }) => void;
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
  const [showManualLookup, setShowManualLookup] = useState(false);
  const [searchMatric, setSearchMatric] = useState("");
  const [showRoster, setShowRoster] = useState(false);
  const [roster, setRoster] = useState<RosterAttendee[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterFilter, setRosterFilter] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchMatric.trim();
    if (!clean) return;
    onManualCheckin({ matricNumber: clean });
  };

  const fetchRoster = async () => {
    setShowRoster(true);
    if (roster.length > 0) return;
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
  const totalPaid = stats?.totalPaid ?? 28;
  const percent = totalPaid > 0 ? Math.round((paidCheckedIn / totalPaid) * 100) : 0;

  const filteredRoster = roster.filter((r) => {
    const q = rosterFilter.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.matricNumber.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Title & Minimal Stats Bar */}
      <div className="text-center space-y-2">
        <h3 className="text-lg sm:text-xl font-bold font-serif-display text-white">
          Scan Paid Delegate Ticket
        </h3>
        <p className="text-xs text-white/60">
          Hold QR code in front of camera to verify payment and issue the Special Delegate Tag.
        </p>

        {/* Compact Paid Counter Bar with Diagonal Shimmer */}
        <div className="relative overflow-hidden inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-[#02001e] border border-white/20 text-xs font-mono shadow-sm">
          <div className="shimmer-sweep" />

          <div className="flex items-center gap-1.5 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#c6f552]" />
            <span className="text-white/70">Verified Paid:</span>
            <span className="text-[#c6f552] font-bold">{paidCheckedIn}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">{totalPaid}</span>
          </div>

          <button
            type="button"
            onClick={fetchRoster}
            className="text-[11px] text-[#3fffe8] hover:underline flex items-center gap-1 cursor-pointer pl-2 border-l border-white/15 relative z-10"
          >
            <UsersIcon className="w-3 h-3" />
            <span>Paid List ({totalPaid})</span>
          </button>
        </div>
      </div>

      {/* Primary Scanner Viewfinder (Prioritized Greatly) */}
      <div className="relative">
        <QrScannerViewfinder
          onScanSuccess={onScanSuccess}
          isPaused={isVerifying || hasResult}
        />
        {isVerifying && (
          <div className="absolute inset-0 bg-[#040032]/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-[#c6f552]/40 text-xs font-mono text-white">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#c6f552] border-t-transparent animate-spin" />
              Verifying payment status...
            </span>
          </div>
        )}
      </div>

      {/* Manual Lookup Fallback */}
      <div className="bg-[#02001e]/80 border border-white/10 rounded-2xl p-3 text-white">
        <button
          type="button"
          onClick={() => setShowManualLookup(!showManualLookup)}
          className="w-full flex items-center justify-between text-xs font-mono text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#c6f552]" />
            <span>Search paid attendee by matric number or name</span>
          </div>
          <span className="text-[#c6f552] font-bold">
            {showManualLookup ? "Hide ▲" : "Search ▼"}
          </span>
        </button>

        {showManualLookup && (
          <form onSubmit={handleManualSubmit} className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={searchMatric}
              onChange={(e) => setSearchMatric(e.target.value)}
              placeholder="Enter matric number or name (e.g. 244079 or Umoru)"
              className="flex-1 px-3 py-2 rounded-xl bg-[#040032] border border-white/20 text-white placeholder-white/30 text-xs font-mono focus:outline-none focus:border-[#c6f552]"
            />
            <button
              type="submit"
              disabled={isVerifying || !searchMatric.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#c6f552] text-[#040032] text-xs font-mono font-bold hover:bg-[#b5e640] transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              Verify
            </button>
          </form>
        )}
      </div>

      {/* Paid Participants Modal / Drawer */}
      {showRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#02001e] border-2 border-white/15 rounded-3xl p-5 text-white shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-base text-white">
                  Paid Delegates Roster
                </h4>
                <p className="text-xs text-white/60">
                  {paidCheckedIn} checked in · {totalPaid - paidCheckedIn} pending
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoster(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={rosterFilter}
                onChange={(e) => setRosterFilter(e.target.value)}
                placeholder="Filter by name or matric number..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#040032] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f552]"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/10 space-y-1 pr-1">
              {loadingRoster ? (
                <div className="py-8 text-center text-xs text-white/50">
                  Loading paid roster...
                </div>
              ) : filteredRoster.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/50">
                  No delegates match your search.
                </div>
              ) : (
                filteredRoster.map((r) => (
                  <div
                    key={r.studentId}
                    className="p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{r.name}</div>
                      <div className="text-[11px] font-mono text-white/60">
                        {r.matricNumber} · {r.department}
                      </div>
                    </div>

                    <div>
                      {r.isCheckedIn ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#c6f552]/20 border border-[#c6f552]/40 text-[#c6f552] text-[10px] font-mono whitespace-nowrap">
                          ✓ Checked In
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoster(false);
                            onManualCheckin({ studentId: r.studentId, matricNumber: r.matricNumber });
                          }}
                          className="relative overflow-hidden px-3 py-1 rounded-lg bg-[#c6f552] hover:bg-[#b5e640] text-[#040032] font-mono font-bold text-[10px] uppercase transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                        >
                          <div className="shimmer-sweep" />
                          <span className="relative z-10">Check In</span>
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
