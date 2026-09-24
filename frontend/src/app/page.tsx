"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { LeaveRequestForm } from "@/components/hr/LeaveRequestForm";
import { LeaveStatusBadge, LeaveStatus } from "@/components/hr/LeaveStatusBadge";
import { TeamAvailabilityBar } from "@/components/hr/TeamAvailabilityBar";
import { NoticeBoardCard } from "@/components/hr/NoticeBoardCard";
import { StaffDirectoryTable, StaffMember } from "@/components/hr/StaffDirectoryTable";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Bell, BookUser, ExternalLink } from "lucide-react";

interface LeaveItem {
  id: string;
  category: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  notes?: string;
}

const INITIAL_LEAVE_REQUESTS: LeaveItem[] = [
  {
    id: "req-1",
    category: "annual_vacation",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    status: "approved",
    notes: "Herbsturlaub",
  },
  {
    id: "req-2",
    category: "annual_vacation",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    status: "pending_manager",
    notes: "Vertretung durch Kollege Weber",
  },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "emp-1",
    first_name: "Anna",
    last_name: "Schmidt",
    department: "Quality Assurance",
    job_title: "Head of QA & Medical Compliance",
    email: "anna.schmidt@bendermedical.de",
  },
  {
    id: "emp-2",
    first_name: "Thomas",
    last_name: "Weber",
    department: "Quality Assurance",
    job_title: "Senior QA Engineer",
    email: "thomas.weber@bendermedical.de",
  },
  {
    id: "emp-3",
    first_name: "Elena",
    last_name: "Becker",
    department: "Quality Assurance",
    job_title: "QA Test Specialist",
    email: "elena.becker@bendermedical.de",
  },
  {
    id: "emp-4",
    first_name: "Maria",
    last_name: "Kraus",
    department: "Human Resources",
    job_title: "HR Director",
    email: "maria.kraus@bendermedical.de",
  },
  {
    id: "emp-5",
    first_name: "Markus",
    last_name: "Fischer",
    department: "IT Operations",
    job_title: "IT Systems Administrator",
    email: "markus.fischer@bendermedical.de",
  },
];

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState("leave");
  const [locale, setLocale] = useState<"de" | "en">("de");
  const [activePersona, setActivePersona] = useState<"employee" | "manager" | "hr_admin">("employee");
  const [leaveRequests, setLeaveRequests] = useState<LeaveItem[]>(INITIAL_LEAVE_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocaleToggle = () => {
    setLocale((prev) => (prev === "de" ? "en" : "de"));
  };

  const handleCreateLeave = async (data: {
    category: string;
    start_date: string;
    end_date: string;
    notes?: string;
    submitImmediately?: boolean;
  }) => {
    const newReq: LeaveItem = {
      id: `req-${Date.now()}`,
      category: data.category,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.submitImmediately ? "pending_manager" : "draft",
      notes: data.notes,
    };
    setLeaveRequests([newReq, ...leaveRequests]);
  };

  const handleTransitionLeave = (id: string, targetStatus: LeaveStatus) => {
    setLeaveRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: targetStatus } : item))
    );
  };

  const filteredStaff = INITIAL_STAFF.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* App Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        locale={locale}
        onLocaleToggle={handleLocaleToggle}
        userRole={
          activePersona === "manager"
            ? "Team Lead (Manager)"
            : activePersona === "hr_admin"
            ? "HR Administrator"
            : "Employee (Mitarbeiter)"
        }
        userName={
          activePersona === "manager"
            ? "Anna Schmidt"
            : activePersona === "hr_admin"
            ? "Maria Kraus"
            : "Thomas Weber"
        }
      />

      {/* Persona Switcher Bar for Review & Testing */}
      <div className="bg-[#161C24] text-neutral-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-300">
            {locale === "de" ? "Aktuelle Test-Rolle (Simuliert):" : "Active Test Persona (Simulated):"}
          </span>
          <div className="inline-flex rounded-sm bg-neutral-900 p-0.5 border border-neutral-700">
            <button
              onClick={() => setActivePersona("employee")}
              className={`px-2.5 py-0.5 rounded-xs text-xs transition-colors ${
                activePersona === "employee" ? "bg-brand-500 text-white font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              Thomas (Employee)
            </button>
            <button
              onClick={() => setActivePersona("manager")}
              className={`px-2.5 py-0.5 rounded-xs text-xs transition-colors ${
                activePersona === "manager" ? "bg-brand-500 text-white font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              Anna (Manager)
            </button>
            <button
              onClick={() => setActivePersona("hr_admin")}
              className={`px-2.5 py-0.5 rounded-xs text-xs transition-colors ${
                activePersona === "hr_admin" ? "bg-brand-500 text-white font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              Maria (HR Admin)
            </button>
          </div>
        </div>

        <div className="text-neutral-300">
          {locale === "de" ? "ISO 13485 QMS • BetrVG §87 • DSGVO Konform" : "ISO 13485 QMS • BetrVG §87 • GDPR Compliant"}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Pillar Direct Route Links Banner */}
        <div className="p-4 bg-brand-50 border border-brand-100 rounded-md flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-900">
            <strong className="font-semibold text-brand-700">Gate 1 Routing-Struktur aktiv:</strong> Direkte Seitenaufrufe mit nativer Dichte-Steuerung (Comfortable vs Compact).
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/hr/leave"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-0 text-brand-500 hover:text-brand-600 font-medium rounded-sm border border-neutral-200 shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>/hr/leave</span>
            </Link>
            <Link
              href="/hr/availability"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-0 text-brand-500 hover:text-brand-600 font-medium rounded-sm border border-neutral-200 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>/hr/availability</span>
            </Link>
            <Link
              href="/hr/notices"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-0 text-brand-500 hover:text-brand-600 font-medium rounded-sm border border-neutral-200 shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>/hr/notices</span>
            </Link>
            <Link
              href="/hr/directory"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-0 text-brand-500 hover:text-brand-600 font-medium rounded-sm border border-neutral-200 shadow-2xs"
            >
              <BookUser className="w-3.5 h-3.5" />
              <span>/hr/directory</span>
            </Link>
          </div>
        </div>

        {/* Tab 1: Leave Requests */}
        {currentTab === "leave" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {locale === "de" ? "Urlaubsverwaltung & Abwesenheiten" : "Leave Management & Absences"}
                </h1>
                <p className="text-sm text-neutral-700 mt-1">
                  {locale === "de"
                    ? "Erstellen und verwalten Sie Ihre Urlaubsanträge gemäß Betriebsvereinbarung (REQ-HR-01 & REQ-HR-06)."
                    : "Create and manage your leave requests per company agreements (REQ-HR-01 & REQ-HR-06)."}
                </p>
              </div>

              <Link href="/hr/leave/new">
                <Button variant="primary" density="comfortable">
                  {locale === "de" ? "Antragsformular öffnen" : "Open Application Form"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form to submit request */}
              <div className="lg:col-span-1">
                <LeaveRequestForm onSubmit={handleCreateLeave} locale={locale} />
              </div>

              {/* My Requests List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-neutral-0 p-6 rounded-md border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {locale === "de" ? "Meine Anträge" : "My Requests"}
                    </h3>
                    <Link
                      href="/hr/leave"
                      className="text-xs text-brand-500 hover:underline flex items-center gap-1"
                    >
                      <span>Vollansicht öffnen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {leaveRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-md border border-neutral-200 hover:border-neutral-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 text-sm">
                              {req.startDate} — {req.endDate}
                            </span>
                            <LeaveStatusBadge status={req.status} locale={locale} />
                          </div>
                          <div className="text-xs text-neutral-700">
                            {req.category === "annual_vacation" ? "Jahresurlaub" : req.category}
                            {req.notes && ` • ${req.notes}`}
                          </div>
                        </div>

                        {/* Action buttons based on status machine */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {req.status === "draft" && (
                            <Button
                              density="compact"
                              variant="primary"
                              onClick={() => handleTransitionLeave(req.id, "pending_manager")}
                            >
                              {locale === "de" ? "Einreichen" : "Submit"}
                            </Button>
                          )}

                          {activePersona === "manager" && req.status === "pending_manager" && (
                            <>
                              <button
                                onClick={() => handleTransitionLeave(req.id, "approved")}
                                className="px-3 py-1 bg-status-success text-white text-xs font-medium rounded-sm shadow-2xs hover:bg-[#175C3E] transition-colors"
                              >
                                {locale === "de" ? "Genehmigen" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleTransitionLeave(req.id, "rejected")}
                                className="px-3 py-1 bg-status-danger text-white text-xs font-medium rounded-sm shadow-2xs hover:bg-[#8C1D17] transition-colors"
                              >
                                {locale === "de" ? "Ablehnen" : "Reject"}
                              </button>
                            </>
                          )}

                          {(req.status === "draft" || req.status === "pending_manager") && (
                            <Button
                              density="compact"
                              variant="secondary"
                              onClick={() => handleTransitionLeave(req.id, "cancelled")}
                            >
                              {locale === "de" ? "Stornieren" : "Cancel"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Team Availability (Manager View) */}
        {currentTab === "manager" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {locale === "de" ? "Team-Verfügbarkeit & Schichtabdeckung" : "Team Availability & Shift Coverage"}
                </h1>
                <p className="text-sm text-neutral-700 mt-1">
                  {locale === "de"
                    ? "Aggregierte Kapazitätsübersicht für Abteilungsleiter (REQ-HR-02). Vollständig anonymisiert gem. BetrVG §87 & DSGVO."
                    : "Aggregated capacity overview for team leads (REQ-HR-02). Strictly aggregated per Works Council & GDPR rules."}
                </p>
              </div>

              <Link href="/hr/availability">
                <Button variant="secondary" density="comfortable">
                  {locale === "de" ? "Vollansicht öffnen" : "Open Full View"}
                </Button>
              </Link>
            </div>

            <TeamAvailabilityBar
              department="Quality Assurance"
              targetDate="2026-10-12"
              totalMembers={5}
              presentCount={4}
              scheduledAbsentCount={1}
              coverageRatio={0.8}
              locale={locale}
            />

            <TeamAvailabilityBar
              department="Production & Logistics"
              targetDate="2026-10-12"
              totalMembers={18}
              presentCount={16}
              scheduledAbsentCount={2}
              coverageRatio={0.89}
              locale={locale}
            />
          </div>
        )}

        {/* Tab 3: Notice Board */}
        {currentTab === "notices" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {locale === "de" ? "Schwarzes Brett & Richtlinien" : "Notice Board & Corporate Policies"}
                </h1>
                <p className="text-sm text-neutral-700 mt-1">
                  {locale === "de"
                    ? "Offizielle Mitteilungen der Geschäftsführung und des Betriebsrats mit revisionssicherer Kenntnisnahme (REQ-HR-04)."
                    : "Official company policies and notices with compliance-grade acknowledgment (REQ-HR-04)."}
                </p>
              </div>

              <Link href="/hr/notices">
                <Button variant="secondary" density="comfortable">
                  {locale === "de" ? "Vollansicht öffnen" : "Open Full View"}
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              <NoticeBoardCard
                id="notice-1"
                title="ISO 13485 QMS Policy Revision v4.2"
                content="Alle Mitarbeiter in der Medizintechnik-Fertigung und Qualitätssicherung werden gebeten, die aktualisierte Verfahrensanweisung SOP-042 (Chargenrückverfolgung) im internen Dokumentensystem zur Kenntnis zu nehmen."
                publishedAt="2026-09-20"
                isMandatoryAck={true}
                hasAcknowledged={false}
                onAcknowledge={async () => {
                  alert(locale === "de" ? "Kenntnisnahme revisionssicher im Audit-Log protokolliert." : "Acknowledgment logged to audit trail.");
                }}
                locale={locale}
              />

              <NoticeBoardCard
                id="notice-2"
                title="Betriebsratsmitteilung: Neue Vereinbarung zur Gleitzeitregelung"
                content="Der Betriebsrat und die Geschäftsleitung haben die novellierte Betriebsvereinbarung zur flexiblen Arbeitszeitgestaltung ratifiziert. Gültig ab 01. Oktober 2026."
                publishedAt="2026-09-18"
                isMandatoryAck={false}
                locale={locale}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Staff Directory */}
        {currentTab === "directory" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {locale === "de" ? "Mitarbeiterverzeichnis" : "Staff Directory"}
                </h1>
                <p className="text-sm text-neutral-700 mt-1">
                  {locale === "de"
                    ? "Vollständig synchronisiert mit dem Unternehmens-Active-Directory (REQ-HR-05)."
                    : "Fully synchronized with corporate Active Directory (REQ-HR-05)."}
                </p>
              </div>

              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === "de" ? "Nach Name oder Abteilung suchen..." : "Search name or department..."}
                  className="w-full h-8 px-3 border border-neutral-300 rounded-sm text-xs bg-neutral-0 text-neutral-900 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <StaffDirectoryTable staff={filteredStaff} locale={locale} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-0 border-t border-neutral-200 py-6 text-center text-xs text-neutral-700">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Bender Medical Vertriebs GmbH • Mitarbeiterportal v1.0.0 (Design System v1.0)</p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Zertifiziert nach ISO 13485:2016 • Datenschutz nach DSGVO & BetrVG §87
          </p>
        </div>
      </footer>
    </div>
  );
}
