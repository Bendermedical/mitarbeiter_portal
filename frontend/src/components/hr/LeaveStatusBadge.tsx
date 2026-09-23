import React from "react";

export type LeaveStatus = "draft" | "pending_manager" | "approved" | "rejected" | "cancelled";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  locale?: "de" | "en";
}

const statusLabels: Record<string, { de: string; en: string; style: string }> = {
  draft: {
    de: "Entwurf",
    en: "Draft",
    style: "bg-slate-100 text-slate-700 border-slate-300",
  },
  pending_manager: {
    de: "Ausstehend (Vorgesetzter)",
    en: "Pending Manager",
    style: "bg-amber-50 text-amber-700 border-amber-300",
  },
  approved: {
    de: "Genehmigt",
    en: "Approved",
    style: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  rejected: {
    de: "Abgelehnt",
    en: "Rejected",
    style: "bg-rose-50 text-rose-700 border-rose-300",
  },
  cancelled: {
    de: "Storniert",
    en: "Cancelled",
    style: "bg-slate-100 text-slate-500 border-slate-200 line-through",
  },
};

export const LeaveStatusBadge: React.FC<LeaveStatusBadgeProps> = ({ status, locale = "de" }) => {
  const config = statusLabels[status] || statusLabels.draft;
  const label = locale === "de" ? config.de : config.en;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.style}`}
      data-testid={`status-badge-${status}`}
    >
      {label}
    </span>
  );
};
