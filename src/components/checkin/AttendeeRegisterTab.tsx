"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
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
  alreadyCheckedIn?: boolean;
  checkedInAt?: string | null;
  tagType?: string;
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

  // Debounced search for candidate students as user types
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
    setMatricNumber(student.matricNumber);
    setDepartment(student.department || "Industrial & Production Engineering");
    setInstitution(student.institution || "University of Ibadan");
    setLevel(student.level || "400L");
    setEmail(student.email || "");
    setStudentId(student.id);
    setShowDropdown(false);
    setSearchQuery("");

    if (student.alreadyCheckedIn) {
      setSelectedNote(`⚠️ ${student.name} was already checked in.`);
    } else {
      setSelectedNote(`✓ Auto-filled: ${student.name} (${student.matricNumber})`);
    }
    setTimeout(() => setSelectedNote(null), 4000);
  };

  // Submit registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !matricNumber.trim()) return;

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
      {/* Title */}
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-bold font-serif-display text-white">
          Attendee Registration
        </h3>
        <p className="text-xs text-white/60">
          Search by matric or name to select attendee, or fill in details manually.
        </p>
      </div>

      {/* Lookup with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-[11px] font-mono text-[#3fffe8] uppercase tracking-wider mb-1">
          Search Student in Database
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (candidates.length > 0) setShowDropdown(true);
            }}
            placeholder="Type matric number or student name..."
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
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#02001e] border-2 border-[#3fffe8]/40 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y divide-white/10 animate-fade-in">
            <div className="p-2 bg-[#040032] text-[10px] font-mono text-white/50 flex items-center justify-between">
              <span>Matching Students ({candidates.length}) — Click to Select:</span>
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
                key={cand.id || cand.matricNumber}
                type="button"
                onClick={() => handleSelectStudent(cand)}
                className="w-full text-left p-2.5 sm:p-3 hover:bg-[#3fffe8]/10 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#3fffe8] truncate">
                    {cand.name}
                  </div>
                  <div className="text-[11px] font-mono text-white/60 truncate">
                    Matric: <span className="text-[#3fffe8]">{cand.matricNumber}</span> · {cand.level || "Delegate"} · {cand.department}
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
              Matric No / ID <span className="text-[#c6f552]">*</span>
            </label>
            <input
              type="text"
              required
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              placeholder="e.g. 218492"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#c6f552]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Level / Category
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white text-sm focus:outline-none focus:border-[#c6f552]"
            >
              <option value="Delegate" className="bg-[#040032]">General Delegate</option>
              <option value="100L" className="bg-[#040032]">100L</option>
              <option value="200L" className="bg-[#040032]">200L</option>
              <option value="300L" className="bg-[#040032]">300L</option>
              <option value="400L" className="bg-[#040032]">400L</option>
              <option value="500L" className="bg-[#040032]">500L</option>
              <option value="Postgraduate" className="bg-[#040032]">Postgraduate</option>
              <option value="Guest" className="bg-[#040032]">External Guest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Industrial & Production Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-white/70 mb-1">
              Institution
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="University of Ibadan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040032] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c6f552]"
            />
          </div>
        </div>

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

        <button
          type="submit"
          disabled={isLoading || !name.trim() || !matricNumber.trim()}
          className="relative overflow-hidden w-full mt-2 py-3 px-4 rounded-2xl bg-[#3fffe8] hover:bg-[#32ebd5] text-[#040032] font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(63,255,232,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {!isLoading && <div className="shimmer-sweep" />}
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[#040032] border-t-transparent rounded-full animate-spin relative z-10" />
          ) : (
            <>
              <span className="relative z-10">Register & Issue Regular Tag</span>
              <ArrowRightIcon className="w-4 h-4 relative z-10" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
