"use client";

import React from "react";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
      breadcrumbs={[{ label: "Triage & Verwaltung" }]}
      user={{
        name: "Maria Kraus",
        email: "maria.kraus@bmv-medical.de",
        department: "Human Resources",
        jobTitle: "HR & System Administrator",
        role: "hr_admin",
      }}
    >
      {children}
    </AdminShell>
  );
}
