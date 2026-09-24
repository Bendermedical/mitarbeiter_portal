"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoticePostProps {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  isMandatoryAck: boolean;
  hasAcknowledged?: boolean;
  onAcknowledge?: (postId: string) => Promise<void>;
  locale?: "de" | "en";
}

/**
 * NoticeBoardCard Component (REQ-HR-04)
 * Density: Comfortable
 * Includes audit-compliant "Read & Acknowledged" workflow.
 */
export const NoticeBoardCard: React.FC<NoticePostProps> = ({
  id,
  title,
  content,
  publishedAt,
  isMandatoryAck,
  hasAcknowledged = false,
  onAcknowledge,
  locale = "de",
}) => {
  const [acknowledged, setAcknowledged] = useState(hasAcknowledged);
  const [loading, setLoading] = useState(false);

  const handleAck = async () => {
    if (!onAcknowledge || acknowledged) return;
    try {
      setLoading(true);
      await onAcknowledge(id);
      setAcknowledged(true);
    } catch (err) {
      console.error("Failed to acknowledge notice", err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(publishedAt).toLocaleDateString(
    locale === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <article
      className={`p-6 rounded-md border shadow-sm transition-all ${
        isMandatoryAck && !acknowledged
          ? "border-status-pending-border bg-status-pending-bg/40"
          : "border-neutral-200 bg-neutral-0"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
          <h4 className="text-base font-semibold text-neutral-900">{title}</h4>
        </div>
        <span className="text-xs text-neutral-700">{formattedDate}</span>
      </div>

      <div className="text-sm text-neutral-900 leading-relaxed whitespace-pre-line mb-5">
        {content}
      </div>

      {isMandatoryAck && (
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-neutral-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-status-pending shrink-0" aria-hidden="true" />
            <span className="font-medium">
              {locale === "de"
                ? "Verpflichtende Kenntnisnahme (ISO 13485 QMS)"
                : "Mandatory Acknowledgment (ISO 13485 QMS)"}
            </span>
          </div>

          {acknowledged ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-status-success-bg text-status-success-text border border-status-success-border">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
              <span>{locale === "de" ? "Gelesen & Zur Kenntnis genommen" : "Read & Acknowledged"}</span>
            </span>
          ) : (
            <Button
              onClick={handleAck}
              isLoading={loading}
              density="comfortable"
              variant="primary"
              className="bg-brand-500 hover:bg-brand-600"
              leftIcon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />}
            >
              {locale === "de" ? "Gelesen & Bestätigen" : "Read & Acknowledge"}
            </Button>
          )}
        </div>
      )}
    </article>
  );
};
