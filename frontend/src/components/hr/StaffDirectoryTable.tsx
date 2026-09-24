import React from "react";
import { Mail, Building, Briefcase, User } from "lucide-react";

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  job_title: string;
  email: string;
}

interface StaffDirectoryTableProps {
  staff: StaffMember[];
  locale?: "de" | "en";
}

/**
 * StaffDirectoryTable Component (REQ-HR-05)
 * Density: Compact (36px row height, keyboard-navigable rows)
 */
export const StaffDirectoryTable: React.FC<StaffDirectoryTableProps> = ({
  staff,
  locale = "de",
}) => {
  return (
    <div className="bg-neutral-0 rounded-md border border-neutral-200 shadow-sm overflow-hidden" data-density="compact">
      <div className="p-3 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900">
          {locale === "de" ? "Mitarbeiterverzeichnis" : "Staff Directory"}
        </h3>
        <span className="text-xs text-neutral-700">
          {locale === "de" ? "Synchronisiert mit Active Directory (LDAP/SCIM)" : "Synchronized with Active Directory"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-xs">
          <thead className="bg-neutral-50 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
                {locale === "de" ? "Name" : "Name"}
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
                {locale === "de" ? "Abteilung" : "Department"}
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
                {locale === "de" ? "Position" : "Job Title"}
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
                {locale === "de" ? "E-Mail" : "Email"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-neutral-0 divide-y divide-neutral-200">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  {locale === "de" ? "Keine Mitarbeiter gefunden." : "No staff members found."}
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr
                  key={member.id}
                  tabIndex={0}
                  className="h-9 hover:bg-neutral-50 focus-visible:bg-brand-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 transition-colors"
                >
                  <td className="px-4 py-1.5 whitespace-nowrap font-medium text-neutral-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" aria-hidden="true" />
                    <span>{member.first_name} {member.last_name}</span>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-neutral-700">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                      <Building className="w-3 h-3 text-neutral-500" aria-hidden="true" />
                      {member.department}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-neutral-700">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-neutral-500" aria-hidden="true" />
                      <span>{member.job_title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-brand-500 hover:text-brand-600">
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded-xs"
                    >
                      <Mail className="w-3 h-3 text-brand-500" aria-hidden="true" />
                      <span>{member.email}</span>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
