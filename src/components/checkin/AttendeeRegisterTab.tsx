"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  UsersIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { CheckinResult } from "./VerificationCard";

export interface RegularRosterItem {
  id: string;
  name: string;
  matricNumber?: string;
  email: string;
  phone?: string;
  department: string;
  institution: string;
  level: string;
  isCheckedIn: boolean;
  checkedInAt?: string | Date | null;
  checkedInBy?: string | null;
  tagNumber?: string | null;
  source: "pre_registered_form" | "on_site_registration";
}

interface CandidateStudent {
  id: string;
  name: string;
  matricNumber: string;
  department: string;
  institution: string;
  level: string;
  email: string;
  phone?: string;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string | null;
  tagType?: string;
  source?: "portal_user" | "form_delegate";
}

interface AttendeeRegisterTabProps {
  onRegisterSuccess: (result: CheckinResult) => void;
  isLoading: boolean;
}

export default function AttendeeRegisterTab({
  onRegisterSuccess,
  isLoading,
}: AttendeeRegisterTabProps) {
  // Search & lookup state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<CandidateStudent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  // Form field states
  const [name, setName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("Industrial & Production Engineering");
  const [institution, setInstitution] = useState("University of Ibadan");
  const [level, setLevel] = useState("Delegate");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState<string | undefined>(undefined);

  // Regular Roster Modal State
  const [showRoster, setShowRoster] = useState(false);
  const [roster, setRoster] = useState<RegularRosterItem[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterFilter, setRosterFilter] = useState("");
  const [rosterSummary, setRosterSummary] = useState<{
    totalRegular: number;
    checkedInCount: number;
    pendingCount: number;
  } | null>(null);
  const [registeringItemId, setRegisteringItemId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Lock background scroll when regular roster modal is open
  useEffect(() => {
    if (showRoster) {
      const origBody = document.body.style.overflow;
      const origHtml = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origBody;
        document.documentElement.style.overflow = origHtml;
      };
    }
  }, [showRoster]);

  // Fetch regular roster
  const fetchRegularRoster = useCallback(async (openModal = true) => {
    if (openModal) setShowRoster(true);
    setLoadingRoster(true);
    try {
      const res = await fetch("/api/check-in/regular-roster");
      const data = await res.json();
      if (data.roster) {
        setRoster(data.roster);
        setRosterSummary({
          totalRegular: data.totalRegular,
          checkedInCount: data.checkedInCount,
          pendingCount: data.pendingCount,
        });
      }
    } catch (e) {
      console.error("Error loading regular roster:", e);
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  // Pre-fetch regular roster counts on initial load
  useEffect(() => {
    fetchRegularRoster(false);
  }, [fetchRegularRoster]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for candidate students / form delegates as user types
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setCandidates([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/check-in/lookup-student?query=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data?.students && data.students.length > 0) {
          setCandidates(data.students);
          setShowDropdown(true);
        } else {
          setCandidates([]);
          setShowDropdown(false);
        }
      } catch {
        setCandidates([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting a candidate from the dropdown
  const handleSelectStudent = (student: CandidateStudent) => {
    setName(student.name);
    setMatricNumber(student.matricNumber || "");
    setDepartment(student.department || "General Delegate");
    setInstitution(student.institution || "University of Ibadan");
    setLevel(student.level || "Delegate");
    setEmail(student.email || "");
    setPhone(student.phone || "");
    setStudentId(student.id);
    setShowDropdown(false);
    setSearchQuery("");

    if (student.alreadyCheckedIn) {
      setSelectedNote(`⚠️ ${student.name} is already recorded as checked in.`);
    } else {
      setSelectedNote(`✓ Auto-filled: ${student.name} (${student.department})`);
    }
    setTimeout(() => setSelectedNote(null), 4500);
  };

  // Submit registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/check-in/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          matricNumber: matricNumber.trim(),
          department: department.trim(),
          institution: institution.trim(),
          level: level.trim(),
          email: email.trim(),
          phone: phone.trim(),
          studentId,
          operator: "Registration Desk",
        }),
      });

      const data: CheckinResult = await res.json();
      onRegisterSuccess(data);
      // Re-sync roster counts in background
      fetchRegularRoster(false);
    } catch (err: any) {
      onRegisterSuccess({
        status: "ERROR",
        title: "Registration Error",
        message: err.message || "Could not register attendee. Please try again.",
      });
    }
  };

  // 1-Tap register directly from the Regular Roster Modal
  const handle1TapRegisterFromRoster = async (item: RegularRosterItem) => {
    setRegisteringItemId(item.id);
    try {
      const res = await fetch("/api/check-in/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          matricNumber: item.matricNumber || "",
          department: item.department,
          institution: item.institution,
          level: item.level,
          email: item.email,
          phone: item.phone,
          operator: "Registration Desk",
        }),
      });

      const data: CheckinResult = await res.json();
      setShowRoster(false);
      onRegisterSuccess(data);
      fetchRegularRoster(false);
    } catch (err: any) {
      onRegisterSuccess({
        status: "ERROR",
        title: "Registration Error",
        message: err.message || "Failed to register delegate from roster.",
      });
    } finally {
      setRegisteringItemId(null);
    }
  };

  // Select attendee from the roster into the form for editing/review
  const handleSelectFromRoster = (item: RegularRosterItem) => {
    setName(item.name);
    setMatricNumber(item.matricNumber || "");
    setDepartment(item.department || "General Delegate");
    setInstitution(item.institution || "University of Ibadan");
    setLevel(item.level || "Delegate");
    setEmail(item.email || "");
    setPhone(item.phone || "");
    setShowRoster(false);

    if (item.isCheckedIn) {
      setSelectedNote(`⚠️ ${item.name} is already checked in (Tag: ${item.tagNumber || "Registered"}).`);
    } else {
      setSelectedNote(`✓ Selected from directory: ${item.name} (${item.department})`);
    }
    setTimeout(() => setSelectedNote(null), 4500);
  };

  // Filter regular roster
  const filteredRoster = roster.filter((r) => {
    const q = rosterFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.institution.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone && r.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""))) ||
      r.level.toLowerCase().includes(q) ||
      (r.matricNumber && r.matricNumber.toLowerCase().includes(q))
    );
  });

  const totalRegularCount = rosterSummary?.totalRegular ?? 188;
  const checkedInRegularCount = rosterSummary?.checkedInCount ?? 0;
  const pendingRegularCount = rosterSummary?.pendingCount ?? totalRegularCount;

  return (
    <div className="w-full max-w-lg mx-auto p-5 sm:p-6 rounded-3xl bg-[#02001e]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-white space-y-4">
      {/* Title & Pre-Registered Directory Bar */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3fffe8]/10 border border-[#3fffe8]/30 text-[#3fffe8] text-[11px] font-mono font-medium">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Universal Admission · Open to All Attendees</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold font-serif-display text-white">
          Attendee Registration
        </h3>
        <p className="text-xs text-white/60">
          Open to students from all departments and universities, alumni, and invited guests.
        </p>

        {/* Regular Directory Roster Pill (Matches Paid VIP Style) */}
        <div className="relative overflow-hidden inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-[#040032] border border-white/20 text-xs font-mono shadow-sm">
          <div className="shimmer-sweep" />

          <div className="flex items-center gap-1.5 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#3fffe8]" />
            <span className="text-white/70">Pre-Registered:</span>
            <span className="text-[#3fffe8] font-bold">{checkedInRegularCount}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">{totalRegularCount}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchRegularRoster(true)}
            className="text-[11px] text-[#c6f552] hover:underline flex items-center gap-1.5 cursor-pointer pl-2 border-l border-white/15 relative z-10 font-bold"
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Regular List ({totalRegularCount})</span>
          </button>
        </div>
      </div>

      {/* Lookup with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-[11px] font-mono text-[#3fffe8] uppercase tracking-wider mb-1">
          Search Pre-Registered Attendees &amp; Students
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (candidates.length > 0) setShowDropdown(true);
            }}
            placeholder="Type surname, first name, matric, or email..."
            className="w-full px-4 pr-10 py-2.5 rounded-2xl bg-[#040032] border border-white/20 text-white placeholder-white/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#3fffe8]"
          />
          <div className="absolute right-3">
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-[#3fffe8] border-t-transparent rounded-full animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <MagnifyingGlassIcon className="w-4 h-4 text-white/30 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Dropdown Results Overlay */}
        {showDropdown && candidates.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#02001e] border-2 border-[#3fffe8]/40 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto divide-y divide-white/10 animate-fade-in">
            <div className="p-2 bg-[#040032] text-[10px] font-mono text-white/50 flex items-center justify-between">
              <span>Matching Attendees ({candidates.length}) — Tap to Auto-Fill:</span>
              <button
                type="button"
                onClick={() => setShowDropdown(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>
            {candidates.map((cand) => (
              <button
                key={cand.id || cand.email || cand.name}
                type="button"
                onClick={() => handleSelectStudent(cand)}
                className="w-full text-left p-2.5 sm:p-3 hover:bg-[#3fffe8]/10 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white group-hover:text-[#3fffe8] truncate">
                      {cand.name}
                    </span>
                    {cand.source === "form_delegate" ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#c6f552]/20 border border-[#c6f552]/40 text-[#c6f552] text-[9px] font-mono shrink-0">
                        Form Delegate
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-mono shrink-0">
                        Portal Student
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-white/60 truncate mt-0.5">
                    {cand.matricNumber ? (
                      <>Matric: <span className="text-[#3fffe8]">{cand.matricNumber}</span> · </>
                    ) : null}
                    {cand.department} · {cand.institution}
                  </div>
                </div>

                {cand.alreadyCheckedIn ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono whitespace-nowrap">
                    Already Checked In
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#3fffe8]/20 border border-[#3fffe8]/40 text-[#3fffe8] text-[10px] font-mono whitespace-nowrap">
                    Select ❯
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {selectedNote && (
          <p className="text-xs font-mono pt-1 text-[#3fffe8] animate-fade-in">
            {selectedNote}
          </p>
        )}
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleRegister} className="space-y-3 pt-2 border-t border-white/10">
        <div>
          <label className="block text-[11px] font-mono text-white/70 mb-1">
            Full Name <span className="text-[#c6f552]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Oluwaseun Adeleke"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Matric No / Delegate ID
              <span className="text-white/40 text-[10px] font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              placeholder="e.g. 218492 or leave blank"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#c6f552]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Category / Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white text-sm focus:outline-none focus:border-[#c6f552]"
            >
              <option value="Delegate" className="bg-[#040032]">General Delegate (All Attendees)</option>
              <option value="100L" className="bg-[#040032]">100L Student</option>
              <option value="200L" className="bg-[#040032]">200L Student</option>
              <option value="300L" className="bg-[#040032]">300L Student</option>
              <option value="400L" className="bg-[#040032]">400L Student</option>
              <option value="500L" className="bg-[#040032]">500L Student</option>
              <option value="Postgraduate" className="bg-[#040032]">Postgraduate Student</option>
              <option value="Alumni" className="bg-[#040032]">Recent Graduate / Alumnus</option>
              <option value="Visiting Student" className="bg-[#040032]">Visiting Student (Other School)</option>
              <option value="Faculty/Staff" className="bg-[#040032]">Academic / Faculty / Staff</option>
              <option value="Guest" className="bg-[#040032]">External Guest / Industry Partner</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Department / Faculty
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Industrial Eng., Petroleum, Arts..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Institution / School
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. University of Ibadan, UNILAG..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. attendee@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Phone / WhatsApp (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#c6f552]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="relative overflow-hidden w-full mt-2 py-3 px-4 rounded-2xl bg-[#3fffe8] hover:bg-[#32ebd5] text-[#040032] font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(63,255,232,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {!isLoading && <div className="shimmer-sweep" />}
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[#040032] border-t-transparent rounded-full animate-spin relative z-10" />
          ) : (
            <>
              <span className="relative z-10">Register &amp; Issue Regular Tag</span>
              <ArrowRightIcon className="w-4 h-4 relative z-10" />
            </>
          )}
        </button>
      </form>

      {/* Pre-Registered Regular Delegates Modal */}
      {showRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-full lg:max-w-lg bg-[#02001e] border-2 border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-2xl space-y-3.5 max-h-[76vh] sm:max-h-[78vh] md:max-h-[80vh] lg:max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-white">
                    Regular Attendees Directory
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#3fffe8]/20 border border-[#3fffe8]/40 text-[#3fffe8] text-[10px] font-mono">
                    {totalRegularCount} Delegates
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">
                  <span className="text-[#3fffe8] font-semibold">{checkedInRegularCount}</span> checked in ·{" "}
                  <span className="text-amber-300 font-semibold">{pendingRegularCount}</span> pending
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoster(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <input
                type="text"
                value={rosterFilter}
                onChange={(e) => setRosterFilter(e.target.value)}
                placeholder="Filter by name, department, university, phone..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#040032] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#3fffe8]"
              />
            </div>

            {/* Delegate List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/10 space-y-1.5 pr-1">
              {loadingRoster ? (
                <div className="py-10 text-center text-xs text-white/50 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#3fffe8] border-t-transparent rounded-full animate-spin" />
                  <span>Loading regular delegates directory...</span>
                </div>
              ) : filteredRoster.length === 0 ? (
                <div className="py-10 text-center text-xs text-white/50">
                  No delegates match your search query.
                </div>
              ) : (
                filteredRoster.map((r) => {
                  const isActivelyRegistering = registeringItemId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate text-xs sm:text-sm">
                            {r.name}
                          </span>
                          {r.source === "on_site_registration" ? (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-mono shrink-0">
                              Desk Sign-Up
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-[#3fffe8]/15 border border-[#3fffe8]/30 text-[#3fffe8] text-[9px] font-mono shrink-0">
                              Form Pre-Reg
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-white/60 truncate mt-0.5">
                          {r.department} · {r.institution}
                        </div>
                        <div className="text-[10px] font-mono text-white/40 truncate">
                          {r.email} {r.phone ? `· ${r.phone}` : ""} {r.level ? `· ${r.level}` : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {r.isCheckedIn ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold whitespace-nowrap flex items-center gap-1">
                            <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Checked In</span>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSelectFromRoster(r)}
                              title="Select into form"
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-mono text-[10px] transition-colors cursor-pointer"
                            >
                              Fill Form
                            </button>
                            <button
                              type="button"
                              disabled={isActivelyRegistering}
                              onClick={() => handle1TapRegisterFromRoster(r)}
                              className="relative overflow-hidden px-3 py-1 rounded-lg bg-[#3fffe8] hover:bg-[#32ebd5] text-[#040032] font-mono font-bold text-[10px] uppercase transition-colors whitespace-nowrap cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              {isActivelyRegistering ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-2.5 h-2.5 border border-[#040032] border-t-transparent rounded-full animate-spin" />
                                  <span>Issuing...</span>
                                </span>
                              ) : (
                                <span>1-Tap Register</span>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
              <span>Click &quot;1-Tap Register&quot; to admit immediately, or &quot;Fill Form&quot; to review.</span>
              <button
                type="button"
                onClick={() => setShowRoster(false)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
