"use client";

import React from "react";
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  Laptop,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 leading-tight">
            System-Übersicht & Triage-Zentrale
          </h1>
          <p className="text-xs text-neutral-700 mt-1">
            Kompakt-Modus (Compact Density) für hohe Informationsdichte und parallele Arbeitsabläufe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" density="compact" className="text-xs">
            Exportieren (CSV)
          </Button>
          <Button variant="primary" density="compact" className="text-xs">
            Neue Benachrichtigung
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-neutral-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider">
                Offene Tickets
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">14</div>
              <div className="text-[10px] text-status-warning font-medium mt-0.5">
                3 erfordern Sofort-Triage
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-status-warning/10 text-status-warning flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider">
                Fuhrpark-Auslastung
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">82%</div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                9 von 11 Fahrzeugen im Einsatz
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-brand-50 text-brand-500 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider">
                Zugewiesene IT-Assets
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">128</div>
              <div className="text-[10px] text-status-success font-medium mt-0.5">
                Alle Hardware-Prüfungen aktuell
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-status-success/10 text-status-success flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider">
                QMS-Prüfnachweise
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">100%</div>
              <div className="text-[10px] text-brand-600 font-medium mt-0.5">
                ISO 13485 konform protokolliert
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-brand-50 text-brand-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Triage Table */}
      <Card className="border border-neutral-200 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-neutral-200 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-neutral-900">
            Dringliche Triage-Eingänge (IT & HR)
          </CardTitle>
          <span className="text-[11px] font-mono text-neutral-500">
            Auto-Sync: Active Directory Federation
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-700 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2 px-3">Ticket / Vorgang</th>
                <th className="py-2 px-3">Mitarbeiter</th>
                <th className="py-2 px-3">Kategorie</th>
                <th className="py-2 px-3">Priorität</th>
                <th className="py-2 px-3">Eingegangen</th>
                <th className="py-2 px-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr className="hover:bg-neutral-50">
                <td className="py-2 px-3 font-medium text-neutral-900">
                  #T-1049 VPN-Zertifikat erneuern
                </td>
                <td className="py-2 px-3 text-neutral-700">Thomas Weber (QA)</td>
                <td className="py-2 px-3 text-neutral-700">IT-Infrastruktur</td>
                <td className="py-2 px-3">
                  <span className="inline-flex px-1.5 py-0.5 rounded-2xs font-semibold text-[10px] bg-status-danger/10 text-status-danger">
                    HOCH
                  </span>
                </td>
                <td className="py-2 px-3 text-neutral-700 font-mono text-[11px]">
                  Heute, 08:15
                </td>
                <td className="py-2 px-3 text-right">
                  <Button variant="ghost" density="compact" className="h-6 px-2 text-xs">
                    Zuweisen
                  </Button>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-2 px-3 font-medium text-neutral-900">
                  #T-1048 Pool-Fahrzeug Rückgabe M-BM-2024
                </td>
                <td className="py-2 px-3 text-neutral-700">Anna Schmidt (Lead QA)</td>
                <td className="py-2 px-3 text-neutral-700">Fuhrpark</td>
                <td className="py-2 px-3">
                  <span className="inline-flex px-1.5 py-0.5 rounded-2xs font-semibold text-[10px] bg-status-warning/10 text-status-warning">
                    MITTEL
                  </span>
                </td>
                <td className="py-2 px-3 text-neutral-700 font-mono text-[11px]">
                  Gestern, 17:40
                </td>
                <td className="py-2 px-3 text-right">
                  <Button variant="ghost" density="compact" className="h-6 px-2 text-xs">
                    Prüfen
                  </Button>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-2 px-3 font-medium text-neutral-900">
                  #T-1047 SOP-042 QMS-Schulungsnachweis
                </td>
                <td className="py-2 px-3 text-neutral-700">Maria Kraus (HR)</td>
                <td className="py-2 px-3 text-neutral-700">Compliance & QMS</td>
                <td className="py-2 px-3">
                  <span className="inline-flex px-1.5 py-0.5 rounded-2xs font-semibold text-[10px] bg-status-info/10 text-brand-600">
                    NORMAL
                  </span>
                </td>
                <td className="py-2 px-3 text-neutral-700 font-mono text-[11px]">
                  Gestern, 14:10
                </td>
                <td className="py-2 px-3 text-right">
                  <Button variant="ghost" density="compact" className="h-6 px-2 text-xs">
                    Archivieren
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
