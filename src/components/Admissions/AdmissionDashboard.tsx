"use client";

import { useMemo, useState } from "react";
import { AdmissionStatus } from "@prisma/client";
import Link from "next/link";
import * as XLSX from "xlsx";

interface ApplicationRow {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  status: AdmissionStatus;
  studentId: string | null;
  student?: {
    id: string;
    admissionNumber: string;
  } | null;
  applyingLevel: { name: string };
  applyingClass: { name: string } | null;
}

interface DashboardProps {
  applications: ApplicationRow[];
  schoolId: string;
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    underReview: number;
  };
}

export default function AdmissionDashboard({ applications, schoolId, stats }: DashboardProps) {
  const getStatusColor = (status: AdmissionStatus) => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNDER_REVIEW": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACCEPTED": return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        app.firstName.toLowerCase().includes(keyword) ||
        app.lastName.toLowerCase().includes(keyword) ||
        app.applicationNumber.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ENROLLED"
            ? app.studentId !== null
            : app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const exportToExcel = () => {
    const data = filteredApplications.map((app) => ({
      "Application No": app.applicationNumber,
      "First Name": app.firstName,
      "Last Name": app.lastName,
      Level: app.applyingLevel.name,
      Class: app.applyingClass?.name ?? "-",
      Status: app.studentId ? "ENROLLED" : app.status,
      "Date Submitted": new Date(app.createdAt).toLocaleDateString("en-GB"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Admissions");

    XLSX.writeFile(
      workbook,
      `Admissions-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Online Admissions Portal
          </h1>
          <p className="text-sm text-gray-500">
            Manage and process inbound student registration pipelines.
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Export Excel
        </button>
      </div>

      {/* STATS GRID - 2 COLUMNS ON MOBILE, 3 ON TABLET, 5 ON DESKTOP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {/* Total Applications spans full width on mobile if odd number of items */}
        <div className="col-span-2 sm:col-span-1 bg-white border rounded-xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-500">Total Applications</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">{stats.total}</h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-yellow-700">Pending</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-yellow-800">{stats.pending}</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-blue-700">Under Review</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-blue-800">{stats.underReview}</h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-green-700">Accepted</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-green-800">{stats.accepted}</h2>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-red-700">Rejected</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-red-800">{stats.rejected}</h2>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search by applicant name or application number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {/* HORIZONTAL SCROLLING FILTER PILLS WITH PADDING */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            "ALL",
            "PENDING",
            "UNDER_REVIEW",
            "ACCEPTED",
            "REJECTED",
            "ENROLLED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSIVE DATA DISPLAY */}
      {filteredApplications.length === 0 ? (
        <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">
          No applications found matching this school environment.
        </div>
      ) : (
        <>
          {/* MOBILE CARD VIEW (< md screens) */}
          <div className="space-y-4 md:hidden">
            {filteredApplications.map((app) => (
              <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 block">
                      {app.applicationNumber}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-base mt-0.5">
                      {app.firstName} {app.lastName}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
                      app.studentId
                        ? "bg-green-50 text-green-700 border-green-200"
                        : getStatusColor(app.status)
                    }`}
                  >
                    {app.studentId ? "ENROLLED" : app.status.replace("_", " ")}
                  </span>
                </div>

                <div className="text-xs text-gray-500 flex justify-between pt-2 border-t border-gray-100">
                  <span>Class: <strong className="text-gray-700">{app.applyingLevel.name} {app.applyingClass ? `(${app.applyingClass.name})` : ""}</strong></span>
                  <span>Submitted: <strong className="text-gray-700">{new Date(app.createdAt).toLocaleDateString("en-GB")}</strong></span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/admin/admissions/${app.id}`}
                    className="flex-1 text-center px-3 py-2 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </Link>

                  {app.studentId && (
                    <Link
                      href={`/list/students/${app.studentId}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                    >
                      View Student
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW (md+ screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4 whitespace-nowrap">Application No.</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Class Applied</th>
                  <th className="p-4 whitespace-nowrap">Date Submitted</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-blue-600 whitespace-nowrap">
                      {app.applicationNumber}
                    </td>
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {app.applyingLevel.name} {app.applyingClass ? `(${app.applyingClass.name})` : ""}
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          app.studentId
                            ? "bg-green-50 text-green-700 border-green-200"
                            : getStatusColor(app.status)
                        }`}
                      >
                        {app.studentId ? "ENROLLED" : app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/admissions/${app.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          View Details
                        </Link>

                        {app.studentId && (
                          <Link
                            href={`/list/students/${app.studentId}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                          >
                            View Student
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}