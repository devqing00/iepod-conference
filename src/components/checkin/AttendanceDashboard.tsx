"use client";

import { useEffect, useState } from "react";
import {
  UsersIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import { isAudioMuted, setAudioMuted } from "@/lib/feedback";

export interface AttendanceStats {
  totalPaid: number;
  checkedInCount: number;
  pendingCount: number;
  percent: number;
  recentCheckins: Array<{
    id: string;
    studentId: string;
    studentName: string;
    matricNumber: string;
    email: string;
    level?: string;
    department?: string;
    checkedInAt: string;
    checkedInBy?: string;
    method?: string;
  }>;
}

export interface RosterAttendee {
  studentId: string;
  name: string;
  matricNumber: string;
  email: string;
  level?: string;
  department?: string;
  isCheckedIn: boolean;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
  method?: string | null;
}

interface AttendanceDashboardProps {
  stats: AttendanceStats | null;
  onRefreshStats: () => Promise<void>;
  onManualCheckinFromRoster?: (studentId: string) => Promise<void>;
}

export default function AttendanceDashboard({
  stats,
  onRefreshStats,
  onManualCheckinFromRoster,
}: AttendanceDashboardProps) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [roster, setRoster] = useState<RosterAttendee[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterFilter, setRosterFilter] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsMuted(isAudioMuted());
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStats();
    setIsRefreshing(false);
  };

  const fetchRoster = async () => {
    setShowRosterModal(true);
    setLoadingRoster(true);
    try {
      const res = await fetch("/api/check-in/roster");
      const data = await res.json();
      if (data.roster) {
        setRoster(data.roster);
      }
    } catch (e) {
      console.error("Error loading roster:", e);
    } finally {
      setLoadingRoster(false);
    }
  };

  const checkedIn = stats?.checkedInCount ?? 0;
  const total = stats?.totalPaid ?? 28;
  const percent = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const filteredRoster = roster.filter((r) => {
    const q = rosterFilter.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.matricNumber.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* Top Banner Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#040032] border border-white/15 shadow-xl text-white">
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c6f552]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold font-serif-display leading-tight">
                Attendee Check-In
              </h2>
              <span className="text-[11px] text-white/60 font-sans block">
                IESA Process Day 2026
              </span>
            </div>
          </div>

          {/* Controls: Mute & Refresh */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSound}
              title={isMuted ? "Unmute sound" : "Mute sound"}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isMuted
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-white/10 text-white/80 border-white/15 hover:text-white"
              }`}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-4 h-4" />
              ) : (
                <SpeakerWaveIcon className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh stats"
              disabled={isRefreshing}
              className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white border border-white/15 transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#c6f552]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Counter & Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-white/60 block">Attendance</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#c6f552]">
                  {checkedIn}
                </span>
                <span className="text-sm font-mono text-white/40">/</span>
                <span className="text-sm font-mono text-white/70">
                  {total} Expected
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm sm:text-base font-bold text-[#3fffe8]">
                {percent}%
              </span>
              <span className="text-[10px] text-white/40 block">
                {stats?.pendingCount ?? total} remaining
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#02001e] overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3fffe8] to-[#c6f552] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Sub-Actions: Recent Activity & Full Roster */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white font-sans transition-colors cursor-pointer"
          >
            <ClockIcon className="w-4 h-4 text-[#3fffe8]" />
            <span>Recent ({stats?.recentCheckins?.length || 0})</span>
            {showDrawer ? (
              <ChevronUpIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={fetchRoster}
            className="flex items-center gap-1.5 text-[#c6f552] hover:text-[#b5e83a] font-medium transition-colors cursor-pointer"
          >
            <UsersIcon className="w-4 h-4" />
            <span>Attendee List</span>
          </button>
        </div>

        {/* Recent Activity Drawer */}
        {showDrawer && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            {stats?.recentCheckins && stats.recentCheckins.length > 0 ? (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {stats.recentCheckins.map((c) => (
                  <div
                    key={c.id || c.studentId}
                    className="p-2 rounded-xl bg-[#02001e] border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-[#c6f552] flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white leading-tight">
                          {c.studentName}
                        </p>
                        <span className="text-[10px] text-white/50 font-mono">
                          {c.matricNumber}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/60">
                      {new Date(c.checkedInAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-2 text-xs text-white/50">
                No check-ins yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Full 28-Attendee Roster Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-[#040032] border border-white/20 shadow-2xl flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#02001e]">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-[#c6f552]" />
                <div>
                  <h3 className="font-serif-display text-base font-bold">
                    Attendee List
                  </h3>
                  <p className="text-xs text-white/60">
                    28 Registered Attendees
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Input */}
            <div className="p-3 border-b border-white/10 bg-[#040032]">
              <input
                type="text"
                value={rosterFilter}
                onChange={(e) => setRosterFilter(e.target.value)}
                placeholder="Search name, matric, or email..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#02001e] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c6f552]"
              />
            </div>

            {/* Attendee List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loadingRoster ? (
                <div className="py-8 text-center text-white/60 space-y-2">
                  <div className="w-5 h-5 border-2 border-[#c6f552] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono">Loading list...</p>
                </div>
              ) : filteredRoster.length === 0 ? (
                <p className="py-6 text-center text-xs text-white/50">
                  No matching attendee.
                </p>
              ) : (
                filteredRoster.map((attendee) => (
                  <div
                    key={attendee.studentId}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      attendee.isCheckedIn
                        ? "bg-emerald-950/20 border-emerald-500/30 text-white"
                        : "bg-[#02001e] border-white/10"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            attendee.isCheckedIn ? "bg-emerald-400" : "bg-white/30"
                          }`}
                        />
                        <h4 className="font-semibold text-xs truncate text-white">
                          {attendee.name}
                        </h4>
                      </div>
                      <div className="text-[11px] text-white/50 font-mono mt-0.5">
                        {attendee.matricNumber}
                        {attendee.level ? ` · ${attendee.level}` : ""}
                      </div>
                    </div>

                    {attendee.isCheckedIn ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                        Checked In
                      </span>
                    ) : (
                      onManualCheckinFromRoster && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onManualCheckinFromRoster(attendee.studentId);
                            setShowRosterModal(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                        >
                          <UserPlusIcon className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </button>
                      )
                    )}
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
