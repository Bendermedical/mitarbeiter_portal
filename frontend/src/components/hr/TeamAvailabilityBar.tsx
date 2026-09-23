import React from "react";

interface TeamAvailabilityProps {
  department: string;
  targetDate: string;
  totalMembers: number;
  presentCount: number;
  scheduledAbsentCount: number;
  coverageRatio: number;
  locale?: "de" | "en";
}

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
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-850">
            {locale === "de" ? `Team-Verfügbarkeit: ${department}` : `Team Availability: ${department}`}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "de" ? `Stichtag: ${targetDate}` : `Date: ${targetDate}`}
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-medical-50 text-medical-700 font-medium rounded-full border border-medical-200">
          {locale === "de" ? "Betriebsrat-Konform (Anonymisiert)" : "Works Council Compliant (Aggregated)"}
        </span>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500">{locale === "de" ? "Gesamtstärke" : "Total Headcount"}</div>
          <div className="text-2xl font-bold text-slate-800">{totalMembers}</div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg">
          <div className="text-xs text-emerald-700">{locale === "de" ? "Anwesend" : "Present"}</div>
          <div className="text-2xl font-bold text-emerald-800">{presentCount}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg">
          <div className="text-xs text-amber-700">{locale === "de" ? "Geplant Abwesend" : "Scheduled Absence"}</div>
          <div className="text-2xl font-bold text-amber-800">{scheduledAbsentCount}</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-700">{locale === "de" ? "Besetzung" : "Coverage Rate"}</div>
          <div className="text-2xl font-bold text-blue-800">{percentage}%</div>
        </div>
      </div>

      {/* Visual Capacity Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
          <span>{locale === "de" ? "Kapazitätsauslastung" : "Capacity Utilization"}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Works Council / DSGVO Statutory Disclaimer */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
        <strong className="text-slate-700">
          {locale === "de" ? "Hinweis gem. BetrVG §87 / DSGVO:" : "Notice per BetrVG §87 / GDPR:"}
        </strong>{" "}
        {locale === "de"
          ? "Diese Ansicht stellt ausschließlich aggregierte Personalkapazitäten dar. Eine individuelle Leistungskontrolle oder Einsicht in individuelle Krankheitsdaten von Mitarbeitern ist systemseitig ausgeschlossen."
          : "This view strictly displays aggregated headcount capacity. Individual performance surveillance or inspection of employee sick-leave history is prohibited by system design."}
      </div>
    </div>
  );
};
