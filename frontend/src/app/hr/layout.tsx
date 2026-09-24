"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Bell, BookUser, Globe, UserCheck } from "lucide-react";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<"de" | "en">("de");
  const [persona, setPersona] = useState<"employee" | "manager" | "hr_admin">("employee");

  const navItems = [
    {
      href: "/hr/leave",
      labelDe: "Urlaubsverwaltung",
      labelEn: "Leave Management",
      icon: Calendar,
    },
    {
      href: "/hr/availability",
      labelDe: "Team-Verfügbarkeit",
      labelEn: "Team Availability",
      icon: Users,
    },
    {
      href: "/hr/notices",
      labelDe: "Schwarzes Brett",
      labelEn: "Notice Board",
      icon: Bell,
    },
    {
      href: "/hr/directory",
      labelDe: "Mitarbeiterverzeichnis",
      labelEn: "Staff Directory",
      icon: BookUser,
    },
  ];

  return (
    <div data-density="comfortable" className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Top Header / App Shell */}
      <header className="bg-neutral-0 border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Pillar Title */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-sm bg-brand-500 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs group-hover:bg-brand-600 transition-colors">
                  BMV
                </div>
                <div>
                  <span className="font-semibold text-neutral-900 text-base leading-none block">
                    Bender Medical
                  </span>
                  <span className="text-xs text-neutral-700">Mitarbeiterportal</span>
                </div>
              </Link>

              <div className="hidden md:block h-6 w-px bg-neutral-200" />

              {/* Subnavigation Tabs */}
              <nav className="hidden md:flex space-x-1" aria-label="HR Pillar Navigation">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                        isActive
                          ? "text-brand-500 bg-brand-50 font-semibold"
                          : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{locale === "de" ? item.labelDe : item.labelEn}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Tools: Locale Toggle & Active User */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocale(locale === "de" ? "en" : "de")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Sprache umschalten / Toggle Language"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{locale.toUpperCase()}</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <div className="w-8 h-8 rounded-sm bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                  {persona === "manager" ? "AS" : persona === "hr_admin" ? "MK" : "TW"}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-neutral-900 leading-tight">
                    {persona === "manager"
                      ? "Anna Schmidt"
                      : persona === "hr_admin"
                      ? "Maria Kraus"
                      : "Thomas Weber"}
                  </div>
                  <div className="text-[10px] text-neutral-700 font-medium">
                    {persona === "manager"
                      ? "Team Lead (QA)"
                      : persona === "hr_admin"
                      ? "HR Administrator"
                      : "Mitarbeiter (QA)"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Simulated Persona Switcher & Regulatory Compliance Bar */}
      <div className="bg-[#161C24] text-neutral-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-300">
            {locale === "de" ? "Test-Rolle:" : "Test Persona:"}
          </span>
          <div className="inline-flex rounded-sm bg-neutral-900 p-0.5 border border-neutral-700">
            <button
              onClick={() => setPersona("employee")}
              className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
                persona === "employee"
                  ? "bg-brand-500 text-white font-medium"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Thomas (Employee)
            </button>
            <button
              onClick={() => setPersona("manager")}
              className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
                persona === "manager"
                  ? "bg-brand-500 text-white font-medium"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Anna (Manager)
            </button>
            <button
              onClick={() => setPersona("hr_admin")}
              className={`px-2 py-0.5 rounded-xs text-[11px] transition-colors ${
                persona === "hr_admin"
                  ? "bg-brand-500 text-white font-medium"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Maria (HR Admin)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-neutral-300 flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
          <span>ISO 13485 QMS • BetrVG §87 • DSGVO / GDPR</span>
        </div>
      </div>

      {/* Subnav for Mobile */}
      <div className="md:hidden bg-neutral-0 border-b border-neutral-200 px-4 py-2 flex overflow-x-auto gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap font-medium ${
                isActive
                  ? "bg-brand-50 text-brand-500 font-semibold"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {locale === "de" ? item.labelDe : item.labelEn}
            </Link>
          );
        })}
      </div>

      {/* Children Container */}
      <div className="flex-1 w-full">{children}</div>

      {/* Footer */}
      <footer className="bg-neutral-0 border-t border-neutral-200 py-6 text-center text-xs text-neutral-700">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Bender Medical Vertriebs GmbH • Mitarbeiterportal (Design System v1.0)</p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Zertifiziert nach ISO 13485:2016 • Datenschutz nach DSGVO & BetrVG §87
          </p>
        </div>
      </footer>
    </div>
  );
}
