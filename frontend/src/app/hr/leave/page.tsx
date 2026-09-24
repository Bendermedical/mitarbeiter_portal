"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LeaveStatusBadge, LeaveStatus } from "@/components/hr/LeaveStatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, ChevronRight, Filter } from "lucide-react";

interface LeaveItem {
  id: string;
  category: string;
  categoryLabel: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  notes?: string;
}

const INITIAL_REQUESTS: LeaveItem[] = [
  {
    id: "req-101",
    category: "annual_vacation",
    categoryLabel: "Jahresurlaub",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    days: 5,
    status: "approved",
    notes: "Herbsturlaub mit Familie",
  },
  {
    id: "req-102",
    category: "annual_vacation",
    categoryLabel: "Jahresurlaub",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    days: 5,
    status: "pending_manager",
    notes: "Vertretung durch Kollege Weber abgestimmt",
  },
  {
    id: "req-103",
    category: "special_leave",
    categoryLabel: "Sonderurlaub",
    startDate: "2026-12-23",
    endDate: "2026-12-24",
    days: 2,
    status: "draft",
    notes: "Noch unbestätigte Vertretung",
  },
];

export default function LeaveOverviewPage() {
  const [filter, setFilter] = useState<string>("all");
  const [requests] = useState<LeaveItem[]>(INITIAL_REQUESTS);

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <main
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8"
      data-density="comfortable"
    >
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Urlaubsverwaltung & Abwesenheiten
          </h1>
          <p className="text-sm text-neutral-700 mt-1">
            Erstellen und verwalten Sie Ihre Urlaubsanträge gemäß Betriebsvereinbarung (REQ-HR-01 & REQ-HR-06).
          </p>
        </div>

        <Link href="/hr/leave/new">
          <Button
            variant="primary"
            density="comfortable"
            leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
          >
            Neuer Urlaubsantrag
          </Button>
        </Link>
      </div>

      {/* Leave Balance Overview Cards (Comfortable Density) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-0 p-5 rounded-md border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-500" aria-hidden="true" />
            <span>Jahresanspruch 2026</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">30 Tage</div>
          <p className="text-xs text-neutral-500 mt-1">Gemäß Tarif- / Arbeitsvertrag</p>
        </div>

        <div className="bg-neutral-0 p-5 rounded-md border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-status-pending" aria-hidden="true" />
            <span>Bereits Genehmigt / Geplant</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">12 Tage</div>
          <p className="text-xs text-neutral-500 mt-1">Inkl. 5 Tage beantragt</p>
        </div>

        <div className="bg-neutral-0 p-5 rounded-md border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success" aria-hidden="true" />
            <span>Resturlaub verfügbar</span>
          </div>
          <div className="text-2xl font-bold text-brand-500 mt-2">18 Tage</div>
          <p className="text-xs text-neutral-500 mt-1">Verbleibend für das Kalenderjahr</p>
        </div>
      </div>

      {/* Requests History List */}
      <section className="bg-neutral-0 p-6 rounded-md border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Meine Anträge
          </h2>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-sm border border-neutral-300 bg-neutral-0 text-neutral-900 hover:border-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              aria-label="Anträge nach Status filtern"
            >
              <option value="all">Alle Status</option>
              <option value="draft">Entwurf (Draft)</option>
              <option value="pending_manager">Ausstehend (Pending)</option>
              <option value="approved">Genehmigt (Approved)</option>
              <option value="rejected">Abgelehnt (Rejected)</option>
              <option value="cancelled">Storniert (Cancelled)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Keine Anträge mit diesem Status vorhanden.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <Link
                key={req.id}
                href={`/hr/leave/${req.id}`}
                className="group block p-4 rounded-md border border-neutral-200 hover:border-brand-300 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-neutral-900 text-sm">
                        {req.startDate} bis {req.endDate}
                      </span>
                      <span className="text-xs text-neutral-500">({req.days} Tage)</span>
                      <LeaveStatusBadge status={req.status} locale="de" size="sm" />
                    </div>
                    <div className="text-xs text-neutral-700 flex items-center gap-2">
                      <span className="font-medium">{req.categoryLabel}</span>
                      {req.notes && <span>• {req.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-brand-500 font-medium group-hover:text-brand-600">
                    <span>Details & Aktionen</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
