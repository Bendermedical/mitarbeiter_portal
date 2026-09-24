"use client";

import React, { useState } from "react";
import { NoticeBoardCard } from "@/components/hr/NoticeBoardCard";
import { Bell, ShieldCheck, Filter, FileText } from "lucide-react";

export default function NoticesPage() {
  const [filter, setFilter] = useState<"all" | "mandatory" | "general">("all");

  const notices = [
    {
      id: "notice-101",
      title: "ISO 13485 QMS Policy Revision: Verfahrensanweisung SOP-042 (Chargenrückverfolgung)",
      content:
        "Sehr geehrte Mitarbeiterinnen und Mitarbeiter,\n\nim Rahmen unseres jährlichen Überwachungsaudits für Medizinprodukte gem. ISO 13485 wurde die Verfahrensanweisung SOP-042 novelliert. Alle Beschäftigten im Bereich Qualitätsmanagement, Wareneingang und Fertigung sind verpflichtet, die aktualisierte Richtlinie im Dokumentenportal einzusehen und diese Kenntnisnahme hier digital zu bestätigen.",
      publishedAt: "2026-09-20",
      isMandatoryAck: true,
      hasAcknowledged: false,
      category: "mandatory",
    },
    {
      id: "notice-102",
      title: "Betriebsratsvereinbarung: Novellierung der Gleitzeit & Kernarbeitszeiten",
      content:
        "Der Betriebsrat und die Geschäftsleitung haben die aktualisierte Betriebsvereinbarung zur flexiblen Arbeitszeitgestaltung ratifiziert. Die Kernarbeitszeit wird ab dem 01. Oktober 2026 zugunsten einer erweiterten Vertrauensarbeitszeit auf 09:30 - 15:00 Uhr angepasst. Der vollständige Vertragstext liegt im Intranet bereit.",
      publishedAt: "2026-09-18",
      isMandatoryAck: false,
      hasAcknowledged: true,
      category: "general",
    },
    {
      id: "notice-103",
      title: "Arbeitssicherheit: Grippeschutzimpfung 2026 durch den Betriebsarzt",
      content:
        "Am 14. und 15. Oktober bietet unser betriebsärztlicher Dienst wieder kostenlose Grippeschutzimpfungen in den Sanitätsräumen (Gebäude B) an. Interessierte Kolleginnen und Kollegen können sich über das interne Buchungstool einen Zeitslot reservieren.",
      publishedAt: "2026-09-15",
      isMandatoryAck: false,
      hasAcknowledged: true,
      category: "general",
    },
  ];

  const filteredNotices =
    filter === "all"
      ? notices
      : notices.filter((n) => (filter === "mandatory" ? n.isMandatoryAck : !n.isMandatoryAck));

  const handleAcknowledge = async (noticeId: string) => {
    // Simulated audit-logged acknowledgment API call (REQ-HR-04)
    await new Promise((r) => setTimeout(r, 600));
    console.log(`Notice ${noticeId} acknowledged and written to ISO 13485 audit trail.`);
  };

  return (
    <main
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6"
      data-density="comfortable"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              Schwarzes Brett & Richtlinien (REQ-HR-04)
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-brand-50 text-brand-700 rounded-sm border border-brand-100 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
              ISO 13485 Audit-Trail
            </span>
          </div>
          <p className="text-xs text-neutral-700 mt-1">
            Offizielle Mitteilungen der Geschäftsleitung, des Qualitätsmanagements und des Betriebsrats.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" aria-hidden="true" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-8 px-2.5 text-xs rounded-sm border border-neutral-300 bg-neutral-0 text-neutral-900 hover:border-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            aria-label="Mitteilungen filtern"
          >
            <option value="all">Alle Mitteilungen</option>
            <option value="mandatory">Nur Verpflichtende (QMS)</option>
            <option value="general">Allgemeine Infos</option>
          </select>
        </div>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <NoticeBoardCard
            key={notice.id}
            id={notice.id}
            title={notice.title}
            content={notice.content}
            publishedAt={notice.publishedAt}
            isMandatoryAck={notice.isMandatoryAck}
            hasAcknowledged={notice.hasAcknowledged}
            onAcknowledge={handleAcknowledge}
            locale="de"
          />
        ))}
      </div>
    </main>
  );
}
