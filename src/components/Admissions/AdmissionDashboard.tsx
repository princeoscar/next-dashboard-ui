"use client";

import { AdmissionStatus } from "@prisma/client";
import Link from "next/link";

interface ApplicationRow {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  status: AdmissionStatus;
  applyingLevel: { name: string };
  applyingClass: { name: string } | null;
}

interface DashboardProps {
  applications: ApplicationRow[];
  schoolId: string;
}

export default function AdmissionDashboard({ applications, schoolId }: DashboardProps) {
  
  const getStatusColor = (status: AdmissionStatus) => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNDER_REVIEW": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACCEPTED": return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Online Admissions Portal</h1>
          <p className="text-sm text-gray-500">Manage and process inbound student registration pipelines.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="p-4">Application No.</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Class Applied</th>
              <th className="p-4">Date Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No applications found matching this school environment.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-blue-600">
                    {app.applicationNumber}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {app.firstName} {app.lastName}
                  </td>
                  <td className="p-4">
                    {app.applyingLevel.name} {app.applyingClass ? `(${app.applyingClass.name})` : ""}
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(app.status)}`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/admissions/${app.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}