"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { submitAdmissionApplication, AdmissionInput } from "../../../lib/actions/admission";
import { UserSex } from "@prisma/client";
// 🎯 Import your UploadDocuments component built in Phase 1
import UploadDocuments from "@/components/Admissions/UploadDocuments"; 

export default function PublicAdmissionForm() {
  const params = useParams();
  
  // Clean fallback if schoolId parameter is missing from route
  const schoolId = (params?.schoolId as string) || "school1";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🎯 State buckets to track the live URLs returned by UploadThing
  const [passportPhoto, setPassportPhoto] = useState<string>("");
  const [birthCertificate, setBirthCertificate] = useState<string>("");
  const [reportCard, setReportCard] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    const data: AdmissionInput = {
      schoolId: schoolId,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      middleName: (formData.get("middleName") as string) || undefined,
      gender: formData.get("gender") as UserSex,
      dateOfBirth: formData.get("dateOfBirth") as string,
      email: (formData.get("email") as string) || undefined,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      state: formData.get("state") as string,
      lga: formData.get("lga") as string,
      parentName: formData.get("parentName") as string,
      parentPhone: formData.get("parentPhone") as string,
      parentEmail: (formData.get("parentEmail") as string) || undefined,
      parentOccupation: (formData.get("parentOccupation") as string) || undefined,
      applyingLevelId: 1, 
      applyingClassId: 1,
      // 🎯 Appending the live asset strings to the Server Action payload
      passportPhoto: passportPhoto || undefined,
      birthCertificate: birthCertificate || undefined,
      reportCard: reportCard || undefined,
    };

    const result = await submitAdmissionApplication(data);

    if (result.success) {
      setMessage({
        type: "success",
        text: `Application submitted successfully! Your tracking reference number is: ${result.applicationNumber}`,
      });
      (e.target as HTMLFormElement).reset();
      
      // Clear file states on success
      setPassportPhoto("");
      setBirthCertificate("");
      setReportCard("");
    } else {
      setMessage({
        type: "error",
        text: result.error || "An error occurred.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-md rounded-lg border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Online Admission Application Form</h1>
      <p className="text-gray-500 text-sm text-center mb-8">Please fill in all requested fields carefully.</p>

      {message && (
        <div className={`p-4 mb-6 rounded text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} method="POST" className="space-y-6">
        

        {/* SECTION 2: CONTACT & ADDRESS */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">2. Address & Geography</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Residential Address *</label>
              <input type="text" name="address" required className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State of Residence *</label>
              <input type="text" name="state" required className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">L.G.A *</label>
              <input type="text" name="lga" required className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Applicant Email</label>
              <input type="email" name="email" className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
          </div>
        </div>

        {/* SECTION 3: PARENT / GUARDIAN */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">3. Parent / Guardian Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Full Name *</label>
              <input type="text" name="parentName" required className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Phone *</label>
              <input type="text" name="parentPhone" required className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Email</label>
              <input type="email" name="parentEmail" className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Occupation</label>
              <input type="text" name="parentOccupation" className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-blue-500" />
            </div>
          </div>
        </div>

        {/* 🎯 SECTION 4: INTEGRATED FILE UPLOADS */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">4. Required Credentials Upload</h3>
          <p className="text-xs text-gray-400 mb-4">Upload clean digital scans or photo proofs (.jpg, .png, .pdf under 4MB).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UploadDocuments 
              endpoint="passportUploader" 
              label="Passport Photograph" 
              onUploadSuccess={(url) => setPassportPhoto(url)} 
            />
            <UploadDocuments 
              endpoint="documentUploader" 
              label="Birth Certificate Scan" 
              onUploadSuccess={(url) => setBirthCertificate(url)} 
            />
            <UploadDocuments 
              endpoint="documentUploader" 
              label="Last Term Academic Result" 
              onUploadSuccess={(url) => setReportCard(url)} 
            />
          </div>

          {/* Visual confirmation blocks to let users know files loaded */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium">
            {passportPhoto && <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded border border-green-200">✓ Passport Uploaded</span>}
            {birthCertificate && <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded border border-green-200">✓ Birth Cert Uploaded</span>}
            {reportCard && <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded border border-green-200">✓ Academic Result Uploaded</span>}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition disabled:bg-blue-400">
            {loading ? "Submitting Application..." : "Submit Application Form"}
          </button>
        </div>
      </form>
    </div>
  );
}