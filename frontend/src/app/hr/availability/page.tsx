"use client";

import React, { useState } from "react";
import { TeamAvailabilityBar } from "@/components/hr/TeamAvailabilityBar";
import { ShieldCheck, Calendar, Filter, AlertCircle } from "lucide-react";

export default function AvailabilityPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-10-12");

  const departmentData = [
    {
      id: "qa",
      department: "Quality Assurance & Regulatory Affairs",
      targetDate: selectedDate,
      totalMembers: 12,
      presentCount: 10,
      scheduledAbsentCount: 2,
      coverageRatio: 0.83,
    },
    {
      id: "prod",
      department: "MedTech Fertigung & Reinraum",
      targetDate: selectedDate,
      totalMembers: 24,
      presentCount: 20,
      scheduledAbsentCount: 4,
      coverageRatio: 0.83,
    },
    {
      id: "logistics",
      department: "Logistik & Distribution (Kühlkette)",
      targetDate: selectedDate,
      totalMembers: 15,
      presentCount: 11,
      scheduledAbsentCount: 4,
      coverageRatio: 0.73,
    },
    {
      id: "it",
      department: "IT & Information Security",
      targetDate: selectedDate,
      totalMembers: 8,
      presentCount: 7,
      scheduledAbsentCount: 1,
      coverageRatio: 0.88,
    },
  ];

  const filteredData =
    selectedDepartment === "all"
      ? departmentData
      : departmentData.filter((d) => d.id === selectedDepartment);

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      data-density="compact"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">
              Team-Verfügbarkeit & Schichtabdeckung (REQ-HR-02)
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-status-success-bg text-status-success-text rounded-sm border border-status-success-border font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
              BetrVG §87 Konform
            </span>
          </div>
          <p className="text-xs text-neutral-700 mt-1">
            Aggregierte Kapazitätsübersicht zur Sicherstellung der Mindestbesetzung ohne Personenbezug oder Krankheitsdaten (REQ-NFR-01).
          </p>
        </div>

        {/* Filter Controls (Compact Density: 32px height) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 px-2 text-xs rounded-sm border border-neutral-300 bg-neutral-0 text-neutral-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              aria-label="Stichtag auswählen"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-8 px-2 text-xs rounded-sm border border-neutral-300 bg-neutral-0 text-neutral-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              aria-label="Abteilung filtern"
            >
              <option value="all">Alle Abteilungen</option>
              <option value="qa">Quality Assurance</option>
              <option value="prod">Fertigung & Reinraum</option>
              <option value="logistics">Logistik</option>
              <option value="it">IT & Security</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compliance Information Card */}
      <div className="p-3.5 bg-brand-50 border border-brand-100 rounded-sm text-xs text-neutral-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <strong className="font-semibold text-brand-700">Architektonische Datenschutz-Garantie:</strong>
          <p className="text-neutral-700 leading-normal">
            Die Schnittstelle liefert ausschließlich mathematische Summenwerte (<code className="text-[11px] bg-neutral-0 px-1 py-0.5 rounded-xs border border-neutral-200">total_headcount</code>, <code className="text-[11px] bg-neutral-0 px-1 py-0.5 rounded-xs border border-neutral-200">present_count</code>, <code className="text-[11px] bg-neutral-0 px-1 py-0.5 rounded-xs border border-neutral-200">coverage_rate</code>). Keine Mitarbeiter-IDs oder Krankheitsgründe werden übertragen.
          </p>
        </div>
      </div>

      {/* Department Aggregate Availability Bars */}
      <div className="space-y-4">
        {filteredData.map((data) => (
          <TeamAvailabilityBar
            key={data.id}
            department={data.department}
            targetDate={data.targetDate}
            totalMembers={data.totalMembers}
            presentCount={data.presentCount}
            scheduledAbsentCount={data.scheduledAbsentCount}
            coverageRatio={data.coverageRatio}
            locale="de"
          />
        ))}
      </div>
    </main>
  );
}
