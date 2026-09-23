"use client";

import React, { useState } from "react";

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
    <div
      className={`p-6 rounded-xl border shadow-sm transition-all ${
        isMandatoryAck && !acknowledged
          ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-200"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h4 className="text-base font-semibold text-slate-850">{title}</h4>
        <span className="text-xs text-slate-500">{formattedDate}</span>
      </div>

      <div className="text-sm text-slate-700 whitespace-pre-line mb-4">
        {content}
      </div>

      {isMandatoryAck && (
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span>
              {locale === "de"
                ? "Verpflichtende Kenntnisnahme (ISO 13485 QMS)"
                : "Mandatory Acknowledgment (ISO 13485 QMS)"}
            </span>
          </div>

          {acknowledged ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              ✓ {locale === "de" ? "Gelesen & Zur Kenntnis genommen" : "Read & Acknowledged"}
            </span>
          ) : (
            <button
              onClick={handleAck}
              disabled={loading}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading
                ? (locale === "de" ? "Wird signiert..." : "Signing...")
                : (locale === "de" ? "Gelesen & Bestätigen" : "Read & Acknowledge")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
