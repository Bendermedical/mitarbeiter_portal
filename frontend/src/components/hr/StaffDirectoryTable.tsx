import React from "react";

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

export const StaffDirectoryTable: React.FC<StaffDirectoryTableProps> = ({ staff, locale = "de" }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-850">
          {locale === "de" ? "Mitarbeiterverzeichnis" : "Staff Directory"}
        </h3>
        <span className="text-xs text-slate-500">
          {locale === "de" ? "Synchronisiert mit Active Directory" : "Synchronized with Active Directory"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">
                {locale === "de" ? "Name" : "Name"}
              </th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">
                {locale === "de" ? "Abteilung" : "Department"}
              </th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">
                {locale === "de" ? "Position" : "Job Title"}
              </th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">
                {locale === "de" ? "E-Mail" : "Email"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  {locale === "de" ? "Keine Mitarbeiter gefunden." : "No staff members found."}
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {member.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {member.job_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-medical-600 hover:text-medical-700">
                    <a href={`mailto:${member.email}`}>{member.email}</a>
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
