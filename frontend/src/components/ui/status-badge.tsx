import React from "react";
import { FileEdit, Clock, CheckCircle2, XCircle, Ban, AlertTriangle, Info, LucideIcon } from "lucide-react";

export type StatusCategory = "neutral" | "pending" | "success" | "danger" | "info";

interface StatusBadgeProps {
  category: StatusCategory;
  label: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
  className?: string;
  testId?: string;
}

const CATEGORY_STYLES: Record<
  StatusCategory,
  { bg: string; text: string; border: string; defaultIcon: LucideIcon }
> = {
  neutral: {
    bg: "bg-status-neutral-bg",
    text: "text-status-neutral-text",
    border: "border-status-neutral-border",
    defaultIcon: FileEdit,
  },
  pending: {
    bg: "bg-status-pending-bg",
    text: "text-status-pending-text",
    border: "border-status-pending-border",
    defaultIcon: Clock,
  },
  success: {
    bg: "bg-status-success-bg",
    text: "text-status-success-text",
    border: "border-status-success-border",
    defaultIcon: CheckCircle2,
  },
  danger: {
    bg: "bg-status-danger-bg",
    text: "text-status-danger-text",
    border: "border-status-danger-border",
    defaultIcon: XCircle,
  },
  info: {
    bg: "bg-status-info-bg",
    text: "text-status-info-text",
    border: "border-status-info-border",
    defaultIcon: Info,
  },
};

/**
 * StatusBadge Component (Design System v1.0 §6.3 & §7.4)
 * Strict Requirement: Always pairs Icon + Label Text + Color Pair.
 * Never relies on color alone to convey meaning (WCAG 2.2 AA SC 1.4.1).
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  category,
  label,
  icon,
  size = "md",
  className = "",
  testId,
}) => {
  const config = CATEGORY_STYLES[category] || CATEGORY_STYLES.neutral;
  const IconComponent = icon || config.defaultIcon;

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5 font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-sm border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      data-testid={testId || `status-badge-${category}`}
    >
      <IconComponent className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
