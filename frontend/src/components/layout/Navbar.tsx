"use client";

import React from "react";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  locale: "de" | "en";
  onLocaleToggle: () => void;
  userRole?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  locale,
  onLocaleToggle,
  userRole = "manager",
  userName = "Anna Schmidt",
}) => {
  const navItems = [
    { id: "leave", de: "Urlaubsverwaltung", en: "Leave Management" },
    { id: "manager", de: "Team-Verfügbarkeit", en: "Team Availability" },
    { id: "notices", de: "Schwarzes Brett", en: "Notice Board" },
    { id: "directory", de: "Mitarbeiterverzeichnis", en: "Staff Directory" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-medical-500 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
                BMV
              </div>
              <div>
                <span className="font-semibold text-slate-850 text-base leading-none block">
                  Bender Medical
                </span>
                <span className="text-xs text-slate-500">Mitarbeiterportal</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === item.id
                      ? "text-medical-600 bg-medical-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {locale === "de" ? item.de : item.en}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Actions: Language Toggle & User Persona */}
          <div className="flex items-center gap-4">
            {/* Language toggle (REQ-NFR-17) */}
            <button
              onClick={onLocaleToggle}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Toggle Language / Sprache wechseln"
            >
              🌐 {locale.toUpperCase()}
            </button>

            {/* User persona badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                {userName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-850 leading-tight">{userName}</div>
                <div className="text-[10px] text-medical-600 font-medium uppercase tracking-wider">{userRole}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
