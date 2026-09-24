"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Ticket, Car, Bell, BookUser, Globe, UserCheck, LogOut, ShieldCheck } from "lucide-react";
import deMessages from "@/locales/de.json";
import enMessages from "@/locales/en.json";

export interface EmployeeShellProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
    department?: string;
    jobTitle?: string;
    role?: string;
  };
}

export function EmployeeShell({ children, user }: EmployeeShellProps) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<"de" | "en">("de");
  const t = locale === "de" ? deMessages : enMessages;

  const navItems = [
    {
      href: "/hr/leave",
      label: t.shells.employee.navLeave,
      icon: Calendar,
    },
    {
      href: "/it/tickets",
      label: t.shells.employee.navTickets,
      icon: Ticket,
    },
    {
      href: "/assets",
      label: t.shells.employee.navFleetAssets,
      icon: Car,
    },
    {
      href: "/hr/notices",
      label: t.shells.employee.navNotices,
      icon: Bell,
    },
    {
      href: "/hr/directory",
      label: t.shells.employee.navDirectory,
      icon: BookUser,
    },
  ];

  const currentUser = user || {
    name: "Thomas Weber",
    email: "thomas.weber@bmv-medical.de",
    department: "Qualitätssicherung",
    jobTitle: "QA Engineer (Medical Devices)",
    role: "employee",
  };

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "TW";

  return (
    <div
      data-density="comfortable"
      className="min-h-screen bg-neutral-50 flex flex-col font-sans transition-all"
    >
      {/* Top Header / Comfortable Density Shell per Design System §6.8 */}
      <header className="bg-neutral-0 border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Portal Identity */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs group-hover:bg-brand-600 transition-colors">
                  BMV
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 text-base leading-tight block">
                    {t.common.companyName}
                  </span>
                  <span className="text-xs text-neutral-700 font-medium">
                    {t.shells.employee.title} • {t.shells.employee.densityLabel}
                  </span>
                </div>
              </Link>

              <div className="hidden lg:block h-6 w-px bg-neutral-200" />

              {/* Top Navigation Bar - Comfortable Touch Targets (Design System §4) */}
              <nav className="hidden lg:flex items-center space-x-1" aria-label="Employee Navigation">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "text-brand-500 bg-brand-50 font-semibold shadow-xs"
                          : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Tools: Locale Toggle, Regulatory Notice & User Status */}
            <div className="flex items-center gap-4">
              {/* Language Toggle with Accessible Label (REQ-NFR-17) */}
              <button
                onClick={() => setLocale(locale === "de" ? "en" : "de")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible"
                aria-label={t.common.toggleLanguage}
                title={t.common.toggleLanguage}
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{locale.toUpperCase()}</span>
              </button>

              {/* Authenticated Staff Member Pill */}
              <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
                <div
                  className="w-9 h-9 rounded-md bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shadow-xs"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-neutral-900 text-xs leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-neutral-700 font-medium">
                    {currentUser.jobTitle} • {currentUser.department}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ISO 13485 & Regulatory Assurance Banner */}
      <aside
        className="bg-[#161C24] text-neutral-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner"
        aria-label="Compliance Status"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-300" aria-hidden="true" />
          <span className="font-medium text-neutral-300 text-[11px]">
            {t.auth.noLocalPasswords}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
          <UserCheck className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
          <span>{t.common.complianceBadge}</span>
        </div>
      </aside>

      {/* Mobile Top Navigation Sub-bar */}
      <div className="lg:hidden bg-neutral-0 border-b border-neutral-200 px-4 py-2 flex overflow-x-auto gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-500 font-semibold"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content Area (Comfortable Density: max-w-768px for forms, responsive) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-0 border-t border-neutral-200 py-6 text-center text-xs text-neutral-700">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 {t.common.companyName} • {t.common.appName}</p>
          <p className="mt-1 text-[11px] text-neutral-500">
            {t.common.complianceBadge}
          </p>
        </div>
      </footer>
    </div>
  );
}
