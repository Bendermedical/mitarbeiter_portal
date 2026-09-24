"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Car,
  Laptop,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  ShieldCheck,
  UserCheck,
  ChevronRight as BreadcrumbSeparator,
} from "lucide-react";
import deMessages from "@/locales/de.json";
import enMessages from "@/locales/en.json";

export interface AdminShellProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
    department?: string;
    jobTitle?: string;
    role?: string;
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminShell({ children, user, breadcrumbs }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [locale, setLocale] = useState<"de" | "en">("de");
  const t = locale === "de" ? deMessages : enMessages;

  const navItems = [
    {
      href: "/admin/overview",
      label: t.shells.admin.navOverview,
      icon: LayoutDashboard,
      shortcut: "Alt+1",
    },
    {
      href: "/admin/tickets",
      label: t.shells.admin.navTicketQueue,
      icon: Inbox,
      shortcut: "Alt+2",
    },
    {
      href: "/admin/fleet",
      label: t.shells.admin.navFleetRegistry,
      icon: Car,
      shortcut: "Alt+3",
    },
    {
      href: "/admin/assets",
      label: t.shells.admin.navAssetLifecycle,
      icon: Laptop,
      shortcut: "Alt+4",
    },
    {
      href: "/admin/audit",
      label: t.shells.admin.navAuditLogs,
      icon: FileSpreadsheet,
      shortcut: "Alt+5",
    },
    {
      href: "/admin/settings",
      label: t.shells.admin.navSettings,
      icon: Settings,
      shortcut: "Alt+6",
    },
  ];

  const currentUser = user || {
    name: "Maria Kraus",
    email: "maria.kraus@bmv-medical.de",
    department: "Human Resources",
    jobTitle: "HR & System Administrator",
    role: "hr_admin",
  };

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "MK";

  return (
    <div
      data-density="compact"
      className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 transition-all"
    >
      {/* Top Bar for Admin Shell */}
      <header className="bg-neutral-0 border-b border-neutral-200 h-12 flex items-center justify-between px-4 sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-brand-500 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              BMV
            </div>
            <span className="font-semibold text-neutral-900 text-sm hidden sm:inline">
              {t.common.companyName}
            </span>
            <span className="text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-xs font-mono font-medium">
              {t.shells.admin.title} • {t.shells.admin.densityLabel}
            </span>
          </Link>
        </div>

        {/* Global Tools & Admin Profile */}
        <div className="flex items-center gap-3">
          <span className="hidden xl:inline text-[11px] text-neutral-500 font-mono">
            {t.shells.admin.shortcutHint}
          </span>

          {/* Language Toggle */}
          <button
            onClick={() => setLocale(locale === "de" ? "en" : "de")}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors focus-visible"
            aria-label={t.common.toggleLanguage}
            title={t.common.toggleLanguage}
          >
            <Globe className="w-3 h-3" aria-hidden="true" />
            <span>{locale.toUpperCase()}</span>
          </button>

          <div className="h-4 w-px bg-neutral-200" />

          {/* Admin User Chip */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-sm bg-brand-50 border border-brand-200 flex items-center justify-center text-xs font-bold text-brand-700"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-neutral-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-neutral-700">
                {currentUser.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Collapsible Sidebar + Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar per Design System §6.8 */}
        <aside
          className={`bg-neutral-0 border-r border-neutral-200 transition-all duration-200 flex flex-col shrink-0 ${
            collapsed ? "w-16" : "w-64"
          }`}
          aria-label="Admin Navigation Sidebar"
        >
          {/* Sidebar Header & Collapse Toggle */}
          <div className="h-10 flex items-center justify-between px-3 border-b border-neutral-200 text-xs text-neutral-700 font-medium">
            {!collapsed && (
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-700">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-xs hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 transition-colors ml-auto focus-visible"
              aria-label={collapsed ? t.shells.admin.expandSidebar : t.shells.admin.collapseSidebar}
              title={collapsed ? t.shells.admin.expandSidebar : t.shells.admin.collapseSidebar}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    isActive
                      ? "text-brand-500 bg-brand-50 font-semibold"
                      : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  title={`${item.label} (${item.shortcut})`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      <kbd className="text-[10px] bg-neutral-100 text-neutral-700 px-1 py-0.2 rounded-2xs font-mono ml-1 shrink-0">
                        {item.shortcut}
                      </kbd>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Regulatory Footer */}
          {!collapsed ? (
            <div className="p-3 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-700 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
                <span>QMS-Audit Ready</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-tight">
                ISO 13485:2016 Compliant
              </p>
            </div>
          ) : (
            <div className="p-2 border-t border-neutral-200 flex justify-center text-brand-500">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </aside>

        {/* Workspace Canvas (Compact Density: max-w-1600px, multi-pane tables & queues) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Breadcrumbs Trail for Deep Triage Navigation */}
          <div className="bg-neutral-0 border-b border-neutral-200 px-6 py-2 flex items-center gap-2 text-xs text-neutral-700">
            <Link href="/" className="hover:text-neutral-900 font-medium">
              {t.shells.admin.breadcrumbHome}
            </Link>
            <BreadcrumbSeparator className="w-3 h-3 text-neutral-700" aria-hidden="true" />
            <span className="text-neutral-700 font-medium">{t.shells.admin.title}</span>
            {breadcrumbs?.map((b, idx) => (
              <React.Fragment key={idx}>
                <BreadcrumbSeparator className="w-3 h-3 text-neutral-700" aria-hidden="true" />
                {b.href ? (
                  <Link href={b.href} className="hover:text-neutral-900 font-medium">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-neutral-900 font-semibold">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Main Content Area */}
          <main className="flex-1 p-6 max-w-[1600px] w-full">{children}</main>

          {/* Admin Shell Footer */}
          <footer className="bg-neutral-0 border-t border-neutral-200 py-3 px-6 text-xs text-neutral-700 flex justify-between items-center">
            <span>© 2026 {t.common.companyName}</span>
            <span className="text-[11px] font-mono text-neutral-500">
              {t.common.complianceBadge}
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
