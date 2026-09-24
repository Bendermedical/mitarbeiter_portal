"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeaveRequestForm } from "@/components/hr/LeaveRequestForm";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateLeave = async (data: {
    category: string;
    start_date: string;
    end_date: string;
    notes?: string;
    submitImmediately?: boolean;
  }) => {
    // Simulate API call to POST /api/v1/hr/leave
    await new Promise((resolve) => setTimeout(resolve, 600));

    const statusMsg = data.submitImmediately
      ? "Urlaubsantrag erfolgreich zur Prüfung eingereicht (REQ-HR-01)."
      : "Urlaubsantrag als Entwurf gespeichert (REQ-HR-06). Sie können ihn jederzeit bearbeiten.";

    setSuccessMessage(statusMsg);
    setTimeout(() => {
      router.push("/hr/leave");
    }, 1500);
  };

  return (
    <main
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6"
      data-density="comfortable"
    >
      {/* Back button */}
      <div>
        <Link
          href="/hr/leave"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Zurück zur Urlaubsübersicht</span>
        </Link>
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-4 bg-status-success-bg border border-status-success-border rounded-md text-xs text-status-success-text flex items-center gap-2.5 font-medium animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" aria-hidden="true" />
          <span>{successMessage} Weiterleitung erfolgt...</span>
        </div>
      )}

      {/* Embedded Application Form */}
      <LeaveRequestForm onSubmit={handleCreateLeave} locale="de" />
    </main>
  );
}
