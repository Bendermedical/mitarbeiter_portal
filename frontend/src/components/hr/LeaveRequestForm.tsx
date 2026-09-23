"use client";

import React, { useState } from "react";

interface LeaveRequestFormProps {
  onSubmit: (data: {
    category: string;
    start_date: string;
    end_date: string;
    notes?: string;
  }) => Promise<void>;
  locale?: "de" | "en";
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSubmit, locale = "de" }) => {
  const [category, setCategory] = useState("annual_vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!startDate || !endDate) {
      setError(locale === "de" ? "Bitte Start- und Enddatum wählen." : "Please select start and end dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError(locale === "de" ? "Enddatum muss nach dem Startdatum liegen." : "End date must be on or after start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        category,
        start_date: startDate,
        end_date: endDate,
        notes: notes || undefined,
      });
      setNotes("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      setError(err?.message || "Error submitting leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-slate-850">
        {locale === "de" ? "Neuen Urlaubsantrag erstellen" : "Create New Leave Request"}
      </h3>

      {error && (
        <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {locale === "de" ? "Antragsart" : "Category"}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:outline-none"
        >
          <option value="annual_vacation">{locale === "de" ? "Jahresurlaub" : "Annual Vacation"}</option>
          <option value="sick_leave">{locale === "de" ? "Krankmeldung" : "Sick Leave"}</option>
          <option value="special_leave">{locale === "de" ? "Sonderurlaub" : "Special Leave"}</option>
          <option value="unpaid_leave">{locale === "de" ? "Unbezahlter Urlaub" : "Unpaid Leave"}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {locale === "de" ? "Startdatum" : "Start Date"}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {locale === "de" ? "Enddatum" : "End Date"}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {locale === "de" ? "Hinweise / Vertretung (optional)" : "Notes / Handover (optional)"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:outline-none"
          placeholder={locale === "de" ? "z.B. Vertretung übernimmt Kollege Weber" : "e.g. Coverage handled by colleague"}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-medical-500 hover:bg-medical-600 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 disabled:opacity-50"
      >
        {isSubmitting
          ? (locale === "de" ? "Wird gespeichert..." : "Submitting...")
          : (locale === "de" ? "Als Entwurf anlegen" : "Save as Draft")}
      </button>
    </form>
  );
};
