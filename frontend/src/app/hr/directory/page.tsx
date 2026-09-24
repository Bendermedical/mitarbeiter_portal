"use client";

import React, { useState, useEffect, useRef } from "react";
import { StaffDirectoryTable, StaffMember } from "@/components/hr/StaffDirectoryTable";
import { Search, Building, RefreshCw } from "lucide-react";

const DIRECTORY_DATA: StaffMember[] = [
  {
    id: "emp-1",
    first_name: "Anna",
    last_name: "Schmidt",
    department: "Quality Assurance & Compliance",
    job_title: "Head of QA & Regulatory Affairs",
    email: "anna.schmidt@bendermedical.de",
  },
  {
    id: "emp-2",
    first_name: "Thomas",
    last_name: "Weber",
    department: "Quality Assurance & Compliance",
    job_title: "Senior Medical QA Specialist",
    email: "thomas.weber@bendermedical.de",
  },
  {
    id: "emp-3",
    first_name: "Elena",
    last_name: "Becker",
    department: "Quality Assurance & Compliance",
    job_title: "Audit & Validation Engineer",
    email: "elena.becker@bendermedical.de",
  },
  {
    id: "emp-4",
    first_name: "Maria",
    last_name: "Kraus",
    department: "Human Resources",
    job_title: "HR Director & People Operations",
    email: "maria.kraus@bendermedical.de",
  },
  {
    id: "emp-5",
    first_name: "Markus",
    last_name: "Fischer",
    department: "IT Operations & Infrastructure",
    job_title: "IT Lead Systems Engineer",
    email: "markus.fischer@bendermedical.de",
  },
  {
    id: "emp-6",
    first_name: "Stefan",
    last_name: "Bender",
    department: "Executive Management",
    job_title: "Managing Director (CEO)",
    email: "stefan.bender@bendermedical.de",
  },
  {
    id: "emp-7",
    first_name: "Katrin",
    last_name: "Vogel",
    department: "MedTech Fertigung & Reinraum",
    job_title: "Production Supervisor",
    email: "katrin.vogel@bendermedical.de",
  },
  {
    id: "emp-8",
    first_name: "Jan",
    last_name: "Richter",
    department: "Logistik & Supply Chain",
    job_title: "Cold Chain Logistics Manager",
    email: "jan.richter@bendermedical.de",
  },
];

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredStaff = DIRECTORY_DATA.filter((member) => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "all" || member.department.toLowerCase().includes(departmentFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      data-density="compact"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Mitarbeiterverzeichnis (REQ-HR-05)
          </h1>
          <p className="text-xs text-neutral-700 mt-1">
            Zentrales Verzeichnis aller BMV-Mitarbeiter mit automatischem LDAP/Active Directory-Abgleich.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-neutral-700 bg-neutral-0 px-3 py-1.5 rounded-sm border border-neutral-200 shadow-2xs">
          <RefreshCw className="w-3.5 h-3.5 text-brand-500 animate-spin-reverse" aria-hidden="true" />
          <span>Synchronisiert: Heute, 06:00 Uhr</span>
        </div>
      </div>

      {/* Search & Filter Toolbar (Compact: 32px height) */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input with '/' shortcut badge */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-500" aria-hidden="true" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, Abteilung, Position suchen..."
            className="w-full h-8 pl-8 pr-8 text-xs rounded-sm border border-neutral-300 bg-neutral-0 text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-colors"
            aria-label="Mitarbeiterverzeichnis durchsuchen"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-xs">
              /
            </kbd>
          </div>
        </div>

        {/* Department Filter */}
        <div className="w-full sm:w-60">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-sm border border-neutral-300 bg-neutral-0 text-neutral-900 hover:border-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-colors"
            aria-label="Nach Abteilung filtern"
          >
            <option value="all">Alle Abteilungen</option>
            <option value="quality">Quality Assurance</option>
            <option value="resources">Human Resources</option>
            <option value="operations">IT Operations</option>
            <option value="fertigung">MedTech Fertigung</option>
            <option value="logistik">Logistik</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500 ml-auto hidden sm:block">
          {filteredStaff.length} {filteredStaff.length === 1 ? "Mitarbeiter" : "Mitarbeiter"} gefunden
        </div>
      </div>

      {/* Directory Data Table */}
      <StaffDirectoryTable staff={filteredStaff} locale="de" />
    </main>
  );
}
