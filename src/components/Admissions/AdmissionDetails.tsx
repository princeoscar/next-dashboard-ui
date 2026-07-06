"use client";

import { AdmissionStatus } from "@prisma/client";
import { updateAdmissionStatus, promoteApplicantToStudent } from "@/lib/actions/admission";
import { useState, useTransition } from "react";
import Link from "next/link"; // 🎯 FIXED: Changed import route from next/navigation to next/link

interface DetailsProps {
  application: any;
  availableClasses?: Array<{ id: number; name: string; capacity?: number }>; // ✨ Added '?' to make it optional
}

export default function AdmissionDetails({ application, availableClasses = [] }: DetailsProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<AdmissionStatus>(application.status);
  const [showApprovalWizard, setShowApprovalWizard] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const handleReject = () => {
    const confirmReject = confirm("Are you sure you want to reject this application?");
    if (!confirmReject) return;

    startTransition(async () => {
      const res = await updateAdmissionStatus(application.id, AdmissionStatus.REJECTED, "Application rejected by administrator.");
      if (res.success) {
        setCurrentStatus(AdmissionStatus.REJECTED);
        setShowApprovalWizard(false);
      } else {
        // 🎯 FIXED: Casted res to access dynamic error property fields safely
        const errorResult = res as { success: false; error: string };
        alert(errorResult.error || "Failed to reject application.");
      }
    });
  };

  const handleFinalEnrollment = () => {
    if (!selectedClassId) {
      alert("Please choose an active classroom assignment before proceeding.");
      return;
    }

    startTransition(async () => {
      const res = await promoteApplicantToStudent({
        admissionId: application.id,
        classId: Number(selectedClassId),
        schoolId: application.schoolId
      });

      if (res.success) {
        setCurrentStatus(AdmissionStatus.ACCEPTED);
        setShowApprovalWizard(false);
        // 🎯 FIXED: Casted res to let compiler read success properties safely
        const successResult = res as { success: true; studentId: string };
        alert(`Success! Generated active student profile with ID: ${successResult.studentId}`);
      } else {
        // 🎯 FIXED: Casted res to access error properties safely
        const errorResult = res as { success: false; error: string };
        alert(errorResult.error || "An error occurred during enrollment processing.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      {/* Top Banner Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <Link href="/admin/admissions" className="text-sm text-gray-500 hover:text-gray-900">&larr; Back to Dashboard</Link>
        <div className="space-x-2 flex items-center">
          <button
            disabled={isPending || currentStatus === AdmissionStatus.REJECTED}
            onClick={handleReject}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 disabled:opacity-50"
          >
            Reject Application
          </button>
          
          {currentStatus !== AdmissionStatus.ACCEPTED && !showApprovalWizard && (
            <button
              disabled={isPending}
              onClick={() => setShowApprovalWizard(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Approve Application...
            </button>
          )}
        </div>
      </div>

      {/* Slide Out Approval Wizard Panel */}
      {showApprovalWizard && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-end justify-between gap-4 transition-all animate-fadeIn">
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-bold text-emerald-900">Final Class Roster Assignment</h4>
            <p className="text-xs text-emerald-700">Assign this applicant to a live class stream section to initialize their official records profile.</p>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="mt-1 block w-full max-w-md p-2 bg-white border border-emerald-300 rounded-lg text-sm focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">-- Choose Class Section --</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.capacity ? `(Capacity: ${cls.capacity})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowApprovalWizard(false)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              onClick={handleFinalEnrollment}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? "Configuring Record..." : "Confirm & Generate Student ID"}
            </button>
          </div>
        </div>
      )}

      {/* Roster Information Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto overflow-hidden border">
              {application.passportPhoto ? (
                <img src={application.passportPhoto} alt="Passport" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Photo</div>
              )}
            </div>
            <h3 className="mt-3 font-bold text-gray-900">{application.firstName} {application.lastName}</h3>
            <p className="text-xs font-mono text-blue-600 mt-1">{application.applicationNumber}</p>
            <div className="mt-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                currentStatus === AdmissionStatus.ACCEPTED ? "bg-green-100 text-green-800" :
                currentStatus === AdmissionStatus.REJECTED ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {currentStatus}
              </span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploaded Documents</h4>
            <div className="flex flex-col gap-2">
              {application.birthCertificate ? (
                <a href={application.birthCertificate} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">📄 Birth Certificate</a>
              ) : <span className="text-sm text-gray-400">Missing Birth Certificate</span>}
              {application.reportCard ? (
                <a href={application.reportCard} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">📄 Academic Result</a>
              ) : <span className="text-sm text-gray-400">Missing Last Result</span>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div><span className="text-gray-400 block">Gender</span><span className="font-medium">{application.gender}</span></div>
              <div><span className="text-gray-400 block">Date of Birth</span><span className="font-medium">{new Date(application.dateOfBirth).toLocaleDateString("en-GB")}</span></div>
              <div><span className="text-gray-400 block">Phone Number</span><span className="font-medium">{application.phone || "N/A"}</span></div>
              <div><span className="text-gray-400 block">Email Address</span><span className="font-medium">{application.email || "N/A"}</span></div>
              <div className="col-span-2"><span className="text-gray-400 block">Residential Address</span><span className="font-medium">{application.address}</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Parent / Guardian Details</h3>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div><span className="text-gray-400 block">Parent Name</span><span className="font-medium">{application.parentName}</span></div>
              <div><span className="text-gray-400 block">Parent Phone</span><span className="font-medium">{application.parentPhone}</span></div>
              <div className="col-span-2"><span className="text-gray-400 block">Parent Email</span><span className="font-medium">{application.parentEmail || "N/A"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}