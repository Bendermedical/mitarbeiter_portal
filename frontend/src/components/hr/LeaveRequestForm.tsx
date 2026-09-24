"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileEdit, Send, AlertCircle } from "lucide-react";

interface LeaveRequestFormProps {
  onSubmit: (data: {
    category: string;
    start_date: string;
    end_date: string;
    notes?: string;
    submitImmediately?: boolean;
  }) => Promise<void>;
  initialData?: {
    category?: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
  };
  locale?: "de" | "en";
}

/**
 * LeaveRequestForm Component (REQ-HR-01 & REQ-HR-06)
 * Density: Comfortable (40px inputs, 24px vertical spacing, max-width 768px)
 * Supports: Saving as Draft (editable) or Direct Submission for Manager Approval.
 */
export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  initialData,
  locale = "de",
}) => {
  const [category, setCategory] = useState(initialData?.category || "annual_vacation");
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"draft" | "submit">("draft");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError(
        locale === "de"
          ? "Bitte Start- und Enddatum auswählen."
          : "Please select start and end dates."
      );
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError(
        locale === "de"
          ? "Das Enddatum muss am oder nach dem Startdatum liegen."
          : "End date must be on or after start date."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        category,
        start_date: startDate,
        end_date: endDate,
        notes: notes || undefined,
        submitImmediately: actionType === "submit",
      });
      if (!initialData) {
        setNotes("");
        setStartDate("");
        setEndDate("");
      }
    } catch (err: any) {
      setError(err?.message || "Error submitting leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-0 p-6 rounded-md border border-neutral-200 shadow-sm space-y-6"
      data-density="comfortable"
    >
      <div className="border-b border-neutral-100 pb-3">
        <h3 className="text-lg font-semibold text-neutral-900">
          {locale === "de" ? "Urlaubsantrag erstellen" : "Create Leave Request"}
        </h3>
        <p className="text-xs text-neutral-700 mt-1">
          {locale === "de"
            ? "Antrag als Entwurf speichern (REQ-HR-06) oder direkt zur Prüfung einreichen (REQ-HR-01)."
            : "Save as draft to edit later or submit directly for approval."}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 text-xs text-status-danger-text bg-status-danger-bg border border-status-danger-border rounded-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-status-danger shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-1">
        <label
          htmlFor="leave-category"
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
        >
          {locale === "de" ? "Abwesenheitsart" : "Absence Category"}{" "}
          <span className="text-status-danger" aria-hidden="true">*</span>
        </label>
        <select
          id="leave-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-10 px-3 rounded-sm border border-neutral-300 bg-neutral-0 text-sm text-neutral-900 hover:border-neutral-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors"
        >
          <option value="annual_vacation">{locale === "de" ? "Jahresurlaub (Erholungsurlaub)" : "Annual Vacation"}</option>
          <option value="special_leave">{locale === "de" ? "Sonderurlaub (BUrlG / Tarif)" : "Special Leave"}</option>
          <option value="unpaid_leave">{locale === "de" ? "Unbezahlter Urlaub" : "Unpaid Leave"}</option>
          <option value="sick_leave">{locale === "de" ? "Krankmeldung (Arbeitsunfähigkeit)" : "Sick Leave"}</option>
        </select>
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="leave-start-date"
          type="date"
          label={locale === "de" ? "Erster Urlaubstag" : "Start Date"}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          density="comfortable"
          required
        />

        <Input
          id="leave-end-date"
          type="date"
          label={locale === "de" ? "Letzter Urlaubstag" : "End Date"}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          density="comfortable"
          required
        />
      </div>

      {/* Handover & Notes */}
      <div className="space-y-1">
        <label
          htmlFor="leave-notes"
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
        >
          {locale === "de" ? "Vertretung / Bemerkung (optional)" : "Coverage Handover / Notes"}
        </label>
        <textarea
          id="leave-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={
            locale === "de"
              ? "z.B. Vertretung ist mit Kollege Thomas Weber abgestimmt"
              : "e.g. Handover coordinated with team member"
          }
          className="w-full p-3 rounded-sm border border-neutral-300 bg-neutral-0 text-sm text-neutral-900 hover:border-neutral-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors"
        />
      </div>

      {/* Action Buttons: Save as Draft vs Submit */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <Button
          type="submit"
          onClick={() => setActionType("draft")}
          isLoading={isSubmitting && actionType === "draft"}
          density="comfortable"
          variant="secondary"
          className="w-full sm:w-1/2"
          leftIcon={<FileEdit className="w-4 h-4" aria-hidden="true" />}
        >
          {locale === "de" ? "Als Entwurf speichern" : "Save as Draft"}
        </Button>

        <Button
          type="submit"
          onClick={() => setActionType("submit")}
          isLoading={isSubmitting && actionType === "submit"}
          density="comfortable"
          variant="primary"
          className="w-full sm:w-1/2"
          leftIcon={<Send className="w-4 h-4" aria-hidden="true" />}
        >
          {locale === "de" ? "Zur Prüfung einreichen" : "Submit for Approval"}
        </Button>
      </div>
    </form>
  );
};
