"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LeaveStatusBadge, LeaveStatus } from "@/components/hr/LeaveStatusBadge";
import { Button } from "@/components/ui/button";
import { LeaveRequestForm } from "@/components/hr/LeaveRequestForm";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileEdit,
  Send,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface RequestDetail {
  id: string;
  category: string;
  categoryLabel: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  notes?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export default function LeaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  // Mock initial request matching id
  const [request, setRequest] = useState<RequestDetail>({
    id: requestId,
    category: "annual_vacation",
    categoryLabel: "Jahresurlaub",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    days: 5,
    status: requestId === "req-103" ? "draft" : "pending_manager",
    notes: "Vertretung durch Kollege Weber abgestimmt",
    submittedAt: "2026-09-22 09:15",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // REQ-HR-06: Edit while Draft
  const handleUpdateDraft = async (data: {
    category: string;
    start_date: string;
    end_date: string;
    notes?: string;
    submitImmediately?: boolean;
  }) => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setRequest((prev) => ({
      ...prev,
      category: data.category,
      categoryLabel:
        data.category === "annual_vacation"
          ? "Jahresurlaub"
          : data.category === "special_leave"
          ? "Sonderurlaub"
          : "Abwesenheit",
      startDate: data.start_date,
      endDate: data.end_date,
      notes: data.notes,
      status: data.submitImmediately ? "pending_manager" : "draft",
      submittedAt: data.submitImmediately ? "2026-09-23 10:45" : undefined,
    }));
    setIsEditing(false);
    setActionLoading(false);
    setMessage({
      text: data.submitImmediately
        ? "Entwurf aktualisiert und zur Prüfung eingereicht (REQ-HR-01)."
        : "Entwurf erfolgreich aktualisiert (REQ-HR-06).",
      type: "success",
    });
  };

  // Submit Draft
  const handleSubmitDraft = async () => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setRequest((prev) => ({
      ...prev,
      status: "pending_manager",
      submittedAt: "2026-09-23 10:45",
    }));
    setActionLoading(false);
    setMessage({
      text: "Urlaubsantrag erfolgreich zur Prüfung eingereicht (REQ-HR-01).",
      type: "success",
    });
  };

  // Cancel Request (Irreversible destructive action)
  const handleConfirmCancel = async () => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setRequest((prev) => ({
      ...prev,
      status: "cancelled",
    }));
    setShowCancelModal(false);
    setActionLoading(false);
    setMessage({
      text: "Urlaubsantrag wurde erfolgreich storniert.",
      type: "info",
    });
  };

  return (
    <main
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6"
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

      {message && (
        <div
          role="status"
          className={`p-4 rounded-md text-xs font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-status-success-bg border border-status-success-border text-status-success-text"
              : "bg-status-info-bg border border-status-info-border text-status-info-text"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Detail Card or Edit View */}
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">Entwurf bearbeiten (REQ-HR-06)</h2>
            <Button
              variant="secondary"
              density="compact"
              onClick={() => setIsEditing(false)}
            >
              Abbrechen
            </Button>
          </div>
          <LeaveRequestForm
            initialData={{
              category: request.category,
              start_date: request.startDate,
              end_date: request.endDate,
              notes: request.notes,
            }}
            onSubmit={handleUpdateDraft}
            locale="de"
          />
        </div>
      ) : (
        <div className="bg-neutral-0 p-6 rounded-md border border-neutral-200 shadow-sm space-y-6">
          {/* Top Title & Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  Antrag #{request.id}
                </h1>
                <LeaveStatusBadge status={request.status} locale="de" />
              </div>
              <p className="text-xs text-neutral-700 mt-1">
                Kategorie: <strong className="text-neutral-900">{request.categoryLabel}</strong>
              </p>
            </div>

            {/* Quick Context Actions */}
            <div className="flex items-center gap-2">
              {request.status === "draft" && (
                <>
                  <Button
                    variant="secondary"
                    density="comfortable"
                    leftIcon={<FileEdit className="w-4 h-4" aria-hidden="true" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="primary"
                    density="comfortable"
                    leftIcon={<Send className="w-4 h-4" aria-hidden="true" />}
                    onClick={handleSubmitDraft}
                    isLoading={actionLoading}
                  >
                    Einreichen
                  </Button>
                </>
              )}

              {(request.status === "draft" || request.status === "pending_manager") && (
                <Button
                  variant="destructive"
                  density="comfortable"
                  leftIcon={<Trash2 className="w-4 h-4" aria-hidden="true" />}
                  onClick={() => setShowCancelModal(true)}
                >
                  Stornieren
                </Button>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-200 space-y-1">
              <span className="text-neutral-700 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                Zeitraum
              </span>
              <div className="text-sm font-semibold text-neutral-900">
                {request.startDate} bis {request.endDate}
              </div>
              <p className="text-neutral-500">Dauer: {request.days} Werktage</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-200 space-y-1">
              <span className="text-neutral-700 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                Vertretung & Hinweise
              </span>
              <div className="text-sm text-neutral-900">
                {request.notes || "Keine besonderen Anmerkungen"}
              </div>
            </div>
          </div>

          {/* Workflow State Machine Audit Log */}
          <div className="border-t border-neutral-100 pt-4">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">
              Genehmigungsverlauf & Audit-Trail
            </h3>
            <ol className="relative border-l border-neutral-200 ml-3 space-y-4 text-xs">
              <li className="ml-4">
                <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-neutral-0" />
                <div className="font-semibold text-neutral-900">Entwurf erstellt (REQ-HR-06)</div>
                <div className="text-neutral-500 text-[11px]">System • Durch Mitarbeiter angelegt</div>
              </li>

              {request.status !== "draft" && (
                <li className="ml-4">
                  <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-status-pending ring-4 ring-neutral-0" />
                  <div className="font-semibold text-neutral-900">Zur Genehmigung eingereicht (REQ-HR-01)</div>
                  <div className="text-neutral-500 text-[11px]">{request.submittedAt || "Gestern"} • Wartet auf Teamleitung</div>
                </li>
              )}

              {request.status === "approved" && (
                <li className="ml-4">
                  <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-status-success ring-4 ring-neutral-0" />
                  <div className="font-semibold text-neutral-900">Genehmigt durch Vorgesetzten</div>
                  <div className="text-neutral-500 text-[11px]">Anna Schmidt (QA Lead) • Abgestimmt mit Kapazitätsgrenzen</div>
                </li>
              )}

              {request.status === "cancelled" && (
                <li className="ml-4">
                  <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-neutral-0" />
                  <div className="font-semibold text-neutral-900">Antrag storniert</div>
                  <div className="text-neutral-500 text-[11px]">Durch Antragsteller zurückgezogen</div>
                </li>
              )}
            </ol>
          </div>
        </div>
      )}

      {/* Irreversible Cancel Confirmation Dialog (§6.7 & §6.1) */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="bg-neutral-0 rounded-lg p-6 max-w-md w-full shadow-md space-y-4">
            <div className="flex items-center gap-3 text-status-danger">
              <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />
              <h3 id="cancel-dialog-title" className="text-lg font-bold text-neutral-900">
                Urlaubsantrag wirklich stornieren?
              </h3>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">
              Möchten Sie diesen Urlaubsantrag ({request.startDate} bis {request.endDate}) wirklich unwiderruflich stornieren? Der Antrag wird im System als storniert markiert und Ihr Urlaubskontingent freigegeben.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                density="comfortable"
                onClick={() => setShowCancelModal(false)}
              >
                Abbrechen
              </Button>

              <Button
                variant="destructive"
                density="comfortable"
                isLoading={actionLoading}
                onClick={handleConfirmCancel}
              >
                Ja, stornieren
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
