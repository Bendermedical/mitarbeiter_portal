"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

interface NavbarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  locale?: "de" | "en";
  onLocaleToggle?: () => void;
  userRole?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  locale = "de",
  onLocaleToggle,
  userRole = "Mitarbeiter",
  userName = "Thomas Weber",
}) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/hr/leave", id: "leave", de: "Urlaubsverwaltung", en: "Leave Management" },
    { href: "/hr/availability", id: "manager", de: "Team-Verfügbarkeit", en: "Team Availability" },
    { href: "/hr/notices", id: "notices", de: "Schwarzes Brett", en: "Notice Board" },
    { href: "/hr/directory", id: "directory", de: "Mitarbeiterverzeichnis", en: "Staff Directory" },
  ];

  return (
    <header className="bg-neutral-0 border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
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

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive = onTabChange
                  ? currentTab === item.id
                  : pathname?.startsWith(item.href);

                const content = (
                  <span
                    className={`px-3 py-2 rounded-sm text-sm font-medium transition-colors inline-block ${
                      isActive
                        ? "text-brand-500 bg-brand-50 font-semibold"
                        : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    {locale === "de" ? item.de : item.en}
                  </span>
                );

                if (onTabChange) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className="focus:outline-none"
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link key={item.id} href={item.href}>
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Language Toggle & User Persona */}
          <div className="flex items-center gap-4">
            {onLocaleToggle && (
              <button
                onClick={onLocaleToggle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Toggle Language / Sprache wechseln"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{locale.toUpperCase()}</span>
              </button>
            )}

            {/* User persona badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-sm bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                {userName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-neutral-900 leading-tight">{userName}</div>
                <div className="text-[10px] text-brand-500 font-medium uppercase tracking-wider">
                  {userRole}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
