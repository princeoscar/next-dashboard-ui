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
  }, [applications, search]);


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

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Admissions"
  );

  XLSX.writeFile(
    workbook,
    `Admissions-${new Date().toISOString().split("T")[0]}.xlsx`
  );
};




  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">

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
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
  >
    Export Excel
  </button>

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Applications</p>
          <h2 className="text-3xl font-bold mt-2">
            {stats.total}
          </h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-yellow-700">Pending</p>
          <h2 className="text-3xl font-bold mt-2 text-yellow-800">
            {stats.pending}
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-blue-700">Under Review</p>
          <h2 className="text-3xl font-bold mt-2 text-blue-800">
            {stats.underReview}
          </h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-green-700">Accepted</p>
          <h2 className="text-3xl font-bold mt-2 text-green-800">
            {stats.accepted}
          </h2>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-red-700">Rejected</p>
          <h2 className="text-3xl font-bold mt-2 text-red-800">
            {stats.rejected}
          </h2>
        </div>

      </div>


      <div className="overflow-x-auto">
        {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by applicant name or application number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
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
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No applications found matching this school environment.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
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
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${app.studentId
                        ? "bg-green-50 text-green-700 border-green-200"
                        : getStatusColor(app.status)
                        }`}
                    >
                      {app.studentId ? "ENROLLED" : app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}