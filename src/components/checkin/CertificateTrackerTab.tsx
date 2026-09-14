"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";

export interface CertificateAttendee {
  id: string;
  studentName: string;
  matricNumber: string;
  department: string;
  institution: string;
  level?: string;
  tagType: "paid_vip" | "regular";
  checkedInAt?: string;
  certificateId: string;
  certificateDownloaded: boolean;
  certificateDownloadedAt?: string | null;
  certificateDownloadCount: number;
  linkedInAdded: boolean;
  linkedInAddedAt?: string | null;
  linkedInAddCount: number;
}

export interface ActivityEvent {
  id: string;
  certificateId: string;
  studentName: string;
  matricNumber: string;
  action: "download" | "linkedin";
  timestamp: string;
}

export interface TrackingSummary {
  totalCheckedIn: number;
  totalDownloaded: number;
  totalLinkedIn: number;
  downloadRate: number;
  linkedInRate: number;
}

type FilterStatus = "all" | "downloaded" | "not_downloaded" | "linkedin" | "pending_linkedin" | "paid_vip" | "regular";

export default function CertificateTrackerTab() {
  const [attendees, setAttendees] = useState<CertificateAttendee[]>([]);
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);

  const fetchTrackingData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/certificate/track", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAttendees(data.attendees || []);
          setSummary(data.summary || null);
          setRecentActivity(data.recentActivity || []);
        }
      }
    } catch (err) {
      console.error("Failed to load certificate tracking data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, [fetchTrackingData]);

  // Filter & Search Logic
  const filteredAttendees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return attendees.filter((a) => {
      // 1. Text search
      const matchesSearch =
        !q ||
        a.studentName.toLowerCase().includes(q) ||
        (a.matricNumber && a.matricNumber.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q)) ||
        (a.certificateId && a.certificateId.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 2. Status filter
      switch (filter) {
        case "downloaded":
          return a.certificateDownloaded;
        case "not_downloaded":
          return !a.certificateDownloaded;
        case "linkedin":
          return a.linkedInAdded;
        case "pending_linkedin":
          return !a.linkedInAdded;
        case "paid_vip":
          return a.tagType === "paid_vip";
        case "regular":
          return a.tagType === "regular";
        case "all":
        default:
          return true;
      }
    });
  }, [attendees, searchQuery, filter]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (attendees.length === 0) return;

    const headers = [
      "Name",
      "Matric / Tag",
      "Tag Type",
      "Department",
      "Certificate ID",
      "Downloaded",
      "Download Count",
      "Last Downloaded At",
      "Added to LinkedIn",
      "LinkedIn Add Count",
      "Last LinkedIn At",
    ];

    const rows = attendees.map((a) => [
      `"${(a.studentName || "").replace(/"/g, '""')}"`,
      `"${(a.matricNumber || "").replace(/"/g, '""')}"`,
      a.tagType === "paid_vip" ? "Paid VIP" : "Regular",
      `"${(a.department || "").replace(/"/g, '""')}"`,
      a.certificateId,
      a.certificateDownloaded ? "YES" : "NO",
      a.certificateDownloadCount || 0,
      a.certificateDownloadedAt ? new Date(a.certificateDownloadedAt).toLocaleString() : "",
      a.linkedInAdded ? "YES" : "NO",
      a.linkedInAddCount || 0,
      a.linkedInAddedAt ? new Date(a.linkedInAddedAt).toLocaleString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IESA_Certificate_LinkedIn_Tracker_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRelativeTime = (timestamp?: string | null) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full space-y-4 animate-fade-in text-white pb-10">
      {/* Top Banner Card: Title & Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#02001e] border border-white/15 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0a3825] border border-[#c6f552]/40 flex items-center justify-center text-[#c6f552] shrink-0 shadow-[0_0_15px_rgba(198,245,82,0.2)]">
            <AcademicCapIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-display font-bold text-base sm:text-lg text-white">
                Certificate &amp; LinkedIn Tracker
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-white/60 font-sans">
              Track delegates who have downloaded their certificate and added it to LinkedIn.
            </p>
          </div>
        </div>

        {/* Action Buttons: Refresh, CSV Export, Live Feed */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchTrackingData}
            disabled={isRefreshing}
            title="Refresh tracker metrics"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#c6f552]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowActivityDrawer(!showActivityDrawer)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showActivityDrawer
                ? "bg-[#3fffe8]/20 border-[#3fffe8] text-[#3fffe8]"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-[#3fffe8]" />
            <span>Feed ({recentActivity.length})</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={attendees.length === 0}
            className="px-4 py-2 rounded-xl bg-[#c6f552] text-[#040032] hover:bg-[#b5e640] text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,245,82,0.3)] cursor-pointer disabled:opacity-50 ml-auto sm:ml-0"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Checked In */}
        <div className="p-4 rounded-2xl bg-[#02001e] border border-white/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/60">
            <span>Checked In</span>
            <ShieldCheckIcon className="w-4 h-4 text-[#3fffe8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-extrabold text-white">
            {summary?.totalCheckedIn ?? attendees.length}
          </div>
          <div className="text-[11px] font-mono text-[#3fffe8]">
            Eligible for Certificate
          </div>
        </div>

        {/* Certificates Downloaded */}
        <div className="p-4 rounded-2xl bg-[#02001e] border border-white/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/60">
            <span>Downloaded</span>
            <ArrowDownTrayIcon className="w-4 h-4 text-[#c6f552]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif-display font-extrabold text-[#c6f552]">
              {summary?.totalDownloaded ?? 0}
            </span>
            <span className="text-xs font-mono text-white/60">
              ({summary?.downloadRate ?? 0}%)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#c6f552] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, summary?.downloadRate ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Added to LinkedIn */}
        <div className="p-4 rounded-2xl bg-[#02001e] border border-white/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/60">
            <span>On LinkedIn</span>
            <svg className="w-4 h-4 fill-[#0077b5]" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif-display font-extrabold text-[#38a9e0]">
              {summary?.totalLinkedIn ?? 0}
            </span>
            <span className="text-xs font-mono text-white/60">
              ({summary?.linkedInRate ?? 0}%)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#0077b5] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, summary?.linkedInRate ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Portal Access Status */}
        <div className="p-4 rounded-2xl bg-[#02001e] border border-white/15 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/60">
            <span>Portal Status</span>
            <SparklesIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-serif-display font-extrabold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active</span>
          </div>
          <div className="text-[11px] font-mono text-white/50">
            <Link href="/certificate" target="_blank" className="hover:text-[#c6f552] underline">
              View Public Claim Page ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Live Recent Activity Stream (Collapsible / Toggleable) */}
      {showActivityDrawer && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#02001e] border border-[#3fffe8]/30 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3fffe8]">
              <SparklesIcon className="w-4 h-4" />
              <span>Real-Time Certificate Activity Stream</span>
            </div>
            <button
              type="button"
              onClick={() => setShowActivityDrawer(false)}
              className="p-1 text-white/60 hover:text-white cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs font-mono text-white/50 py-3 text-center">
              No recent certificate activity recorded yet today.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {act.action === "download" ? (
                      <div className="w-7 h-7 rounded-lg bg-[#c6f552]/20 text-[#c6f552] flex items-center justify-center shrink-0">
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#0077b5]/20 text-[#38a9e0] flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                        </svg>
                      </div>
                    )}
                    <div className="truncate">
                      <span className="font-bold text-white">{act.studentName}</span>
                      <span className="text-white/60 ml-1.5 font-mono text-[11px]">
                        {act.action === "download" ? "downloaded high-res certificate" : "added certificate to LinkedIn"}
                      </span>
                      {act.matricNumber && (
                        <span className="text-white/40 ml-1.5 font-mono text-[10px]">
                          ({act.matricNumber})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 shrink-0">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#02001e] border border-white/15 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, matric, department, or cert ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#3fffe8]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-white/40 flex items-center gap-1 mr-1 text-[11px]">
            <FunnelIcon className="w-3 h-3" />
            Filter:
          </span>

          {[
            { id: "all", label: "All", count: attendees.length },
            { id: "downloaded", label: "Downloaded", count: attendees.filter((a) => a.certificateDownloaded).length },
            { id: "not_downloaded", label: "Pending Download", count: attendees.filter((a) => !a.certificateDownloaded).length },
            { id: "linkedin", label: "On LinkedIn", count: attendees.filter((a) => a.linkedInAdded).length },
            { id: "pending_linkedin", label: "Pending LinkedIn", count: attendees.filter((a) => !a.linkedInAdded).length },
            { id: "paid_vip", label: "Paid VIP", count: attendees.filter((a) => a.tagType === "paid_vip").length },
            { id: "regular", label: "Regular", count: attendees.filter((a) => a.tagType === "regular").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as FilterStatus)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#3fffe8] text-[#040032] border-[#3fffe8] font-bold shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border-white/10"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 opacity-60 text-[10px]">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Attendees Table */}
      <div className="rounded-3xl bg-[#02001e] border border-white/15 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
          <span>
            Showing <strong className="text-white">{filteredAttendees.length}</strong> of {attendees.length} checked-in delegates
          </span>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-[#3fffe8] hover:underline cursor-pointer text-[11px]"
            >
              Reset filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-[#3fffe8] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-white/60">Loading attendance &amp; certificate activity...</p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-white/50 font-mono text-xs">
            <AcademicCapIcon className="w-8 h-8 mx-auto text-white/20" />
            <p>No delegates match the selected search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#040032] text-white/60 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Delegate Name</th>
                  <th className="py-3 px-3">Matric / Tag</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Certificate ID</th>
                  <th className="py-3 px-3 text-center">Download Status</th>
                  <th className="py-3 px-3 text-center">LinkedIn Status</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Name & Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{att.studentName}</div>
                      <div className="text-white/50 text-[11px] truncate max-w-[200px]">
                        {att.department}
                      </div>
                    </td>

                    {/* Matric Number */}
                    <td className="py-3.5 px-3 font-mono text-[#c6f552] text-xs">
                      {att.matricNumber || "—"}
                    </td>

                    {/* Tag Type Badge */}
                    <td className="py-3.5 px-3">
                      {att.tagType === "paid_vip" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                          VIP Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-mono text-[10px]">
                          Regular
                        </span>
                      )}
                    </td>

                    {/* Certificate ID */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-white/60">
                      {att.certificateId}
                    </td>

                    {/* Download Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {att.certificateDownloaded ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px]">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            <span>Downloaded ({att.certificateDownloadCount})</span>
                          </span>
                          {att.certificateDownloadedAt && (
                            <span className="text-[10px] font-mono text-white/40 mt-0.5">
                              {formatRelativeTime(att.certificateDownloadedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono text-[10px]">
                          <ClockIcon className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* LinkedIn Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {att.linkedInAdded ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0077b5]/20 border border-[#0077b5]/50 text-[#38a9e0] font-mono font-bold text-[10px]">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                            </svg>
                            <span>On Profile ({att.linkedInAddCount})</span>
                          </span>
                          {att.linkedInAddedAt && (
                            <span className="text-[10px] font-mono text-white/40 mt-0.5">
                              {formatRelativeTime(att.linkedInAddedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono text-[10px]">
                          <span>Not Added</span>
                        </span>
                      )}
                    </td>

                    {/* View Certificate Link */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/verify/${att.certificateId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#3fffe8] hover:text-white font-mono text-[10px] font-bold transition-all"
                        title="Open verification page for this attendee"
                      >
                        <span>View</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
