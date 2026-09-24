import React from "react";
import { ShieldAlert, Users, UserCheck, CalendarOff, Activity } from "lucide-react";

interface TeamAvailabilityProps {
  department: string;
  targetDate: string;
  totalMembers: number;
  presentCount: number;
  scheduledAbsentCount: number;
  coverageRatio: number;
  locale?: "de" | "en";
}

/**
 * TeamAvailabilityBar Component (REQ-HR-02 & REQ-NFR-01)
 * Density: Compact (Manager view)
 * Zero Individual Performance Data: Strictly displays aggregate numbers.
 */
export const TeamAvailabilityBar: React.FC<TeamAvailabilityProps> = ({
  department,
  targetDate,
  totalMembers,
  presentCount,
  scheduledAbsentCount,
  coverageRatio,
  locale = "de",
}) => {
  const percentage = Math.round(coverageRatio * 100);

  return (
    <div className="bg-neutral-0 p-5 rounded-md border border-neutral-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            {locale === "de" ? `Team-Verfügbarkeit: ${department}` : `Team Availability: ${department}`}
          </h3>
          <p className="text-xs text-neutral-700 mt-0.5">
            {locale === "de" ? `Stichtag: ${targetDate}` : `Date: ${targetDate}`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-brand-50 text-brand-700 font-medium rounded-sm border border-brand-100">
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          {locale === "de" ? "Betriebsrat-Konform (Aggregiert)" : "Works Council Compliant (Aggregated)"}
        </span>
      </div>

      {/* Aggregate Metric Cards (Compact) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm">
          <div className="text-xs text-neutral-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
            <span>{locale === "de" ? "Gesamtstärke" : "Total Headcount"}</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1">{totalMembers}</div>
        </div>

        <div className="p-3 bg-status-success-bg border border-status-success-border rounded-sm">
          <div className="text-xs text-status-success-text flex items-center gap-1 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
            <span>{locale === "de" ? "Anwesend" : "Present"}</span>
          </div>
          <div className="text-xl font-bold text-status-success-text mt-1">{presentCount}</div>
        </div>

        <div className="p-3 bg-status-pending-bg border border-status-pending-border rounded-sm">
          <div className="text-xs text-status-pending-text flex items-center gap-1 font-medium">
            <CalendarOff className="w-3.5 h-3.5 text-status-pending" aria-hidden="true" />
            <span>{locale === "de" ? "Geplant Abwesend" : "Scheduled Absence"}</span>
          </div>
          <div className="text-xl font-bold text-status-pending-text mt-1">{scheduledAbsentCount}</div>
        </div>

        <div className="p-3 bg-brand-50 border border-brand-100 rounded-sm">
          <div className="text-xs text-brand-700 flex items-center gap-1 font-medium">
            <Activity className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
            <span>{locale === "de" ? "Besetzung" : "Coverage Rate"}</span>
          </div>
          <div className="text-xl font-bold text-brand-700 mt-1">{percentage}%</div>
        </div>
      </div>

      {/* Visual Capacity Bar */}
      <div>
        <div className="flex justify-between text-xs text-neutral-700 mb-1 font-medium">
          <span>{locale === "de" ? "Kapazitätsauslastung" : "Capacity Utilization"}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-sm h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentage >= 80
                ? "bg-status-success"
                : percentage >= 60
                ? "bg-status-pending"
                : "bg-status-danger"
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Statutory Works Council / BetrVG §87 / DSGVO Disclaimer */}
      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm text-xs text-neutral-700">
        <strong className="text-neutral-900">
          {locale === "de" ? "Hinweis gem. BetrVG §87 / DSGVO:" : "Notice per BetrVG §87 / GDPR:"}
        </strong>{" "}
        {locale === "de"
          ? "Diese Ansicht stellt ausschließlich aggregierte Personalkapazitäten dar. Eine individuelle Leistungskontrolle oder Einsicht in individuelle Krankheitsdaten von Mitarbeitern ist systemseitig ausgeschlossen."
          : "This view strictly displays aggregated headcount capacity. Individual performance surveillance or inspection of employee sick-leave history is prohibited by system design."}
      </div>
    </div>
  );
};
