"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { CheckinResult } from "./VerificationCard";

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

  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    } catch (err: any) {
      onRegisterSuccess({
        status: "ERROR",
        title: "Registration Error",
        message: err.message || "Could not register attendee. Please try again.",
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-5 sm:p-6 rounded-3xl bg-[#02001e]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-white space-y-4">
      {/* Title & Inclusivity Callout */}
      <div className="text-center space-y-1.5">
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
    </div>
  );
}
