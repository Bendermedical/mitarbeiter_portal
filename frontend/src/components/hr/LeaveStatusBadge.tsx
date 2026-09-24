import React from "react";
import { StatusBadge, StatusCategory } from "@/components/ui/status-badge";
import { FileEdit, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";

export type LeaveStatus = "draft" | "pending_manager" | "approved" | "rejected" | "cancelled";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  locale?: "de" | "en";
  size?: "sm" | "md";
}

const LEAVE_STATUS_CONFIG: Record<
  LeaveStatus,
  { category: StatusCategory; de: string; en: string; icon: any }
> = {
  draft: {
    category: "neutral",
    de: "Entwurf",
    en: "Draft",
    icon: FileEdit,
  },
  pending_manager: {
    category: "pending",
    de: "Wartet auf Genehmigung",
    en: "Pending Manager",
    icon: Clock,
  },
  approved: {
    category: "success",
    de: "Genehmigt",
    en: "Approved",
    icon: CheckCircle2,
  },
  rejected: {
    category: "danger",
    de: "Abgelehnt",
    en: "Rejected",
    icon: XCircle,
  },
  cancelled: {
    category: "info",
    de: "Storniert",
    en: "Cancelled",
    icon: Ban,
  },
};

/**
 * Reconciled LeaveStatusBadge (Design System v1.0 §6.3)
 * Pairs Icon + Text Label + Color Tokens strictly. Never color alone.
 */
export const LeaveStatusBadge: React.FC<LeaveStatusBadgeProps> = ({
  status,
  locale = "de",
  size = "md",
}) => {
  const config = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG.draft;
  const label = locale === "de" ? config.de : config.en;

  return (
    <StatusBadge
      category={config.category}
      label={label}
      icon={config.icon}
      size={size}
      testId={`status-badge-${status}`}
    />
  );
};
