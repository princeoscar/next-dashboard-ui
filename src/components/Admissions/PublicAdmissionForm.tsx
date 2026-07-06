// src/components/Admissions/PublicAdmissionForm.tsx
"use client";

import { useState } from "react";
import UploadDocuments from "./UploadDocuments"; 
import { submitPublicApplication } from "@/lib/actions/publicApply";

export default function PublicAdmissionForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  // Track the uploaded file string states from UploadDocuments
  const [passportPhoto, setPassportPhoto] = useState("");
  const [birthCertificate, setBirthCertificate] = useState("");
  const [reportCard, setReportCard] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!passportPhoto || !birthCertificate || !reportCard) {
      return alert("Please upload all required credentials before final submission.");
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const submissionData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      middleName: formData.get("middleName") as string,
      email: (formData.get("email") as string) || null,
      phone: formData.get("phone") as string,
      gender: formData.get("gender") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      address: formData.get("address") as string,
      parentName: formData.get("parentName") as string,
      parentPhone: formData.get("parentPhone") as string,
      parentEmail: (formData.get("parentEmail") as string) || null,
      applyingLevelId: Number(formData.get("applyingLevelId")),
      passportPhoto,      
      birthCertificate,   
      reportCard,         
    };

    try {
      const res = await submitPublicApplication(submissionData);
      
      if (res.success && res.applicationNumber) {
        setTrackingNumber(res.applicationNumber);
        setStep(4); // Move directly to victory screen
      } else {
        alert(res.error || "Submission rejected by processing block.");
      }
    } catch (error) {
      alert("Submission error, please verify your fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS OUTCOME COMPONENT VIEW
  if (trackingNumber) {
    return (
      <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-fadeIn">
        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-600 mx-auto text-3xl">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Thank you for applying. We are processing your child&apos;s information and have securely logged your credentials.
          </p>
        </div>

        <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-blue-500 block tracking-wider mb-1">
            Application Reference Code
          </span>
          <span className="font-mono text-xl font-black text-blue-900 tracking-tight">
            {trackingNumber}
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Please keep this tracking code safe. You will need it to view review statuses or output printable clearance slips once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Progress Steps Tracker Indicator */}
      {step <= 3 && (
        <div className="flex items-center justify-center gap-2 pb-6 border-b border-gray-100">
          <span className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`h-0.5 w-16 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"} transition-colors duration-300`} />
          <span className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`h-0.5 w-16 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"} transition-colors duration-300`} />
          <span className={`w-2.5 h-2.5 rounded-full ${step === 3 ? "bg-blue-600" : "bg-gray-200"}`} />
        </div>
      )}

      {/* Main Form Box Wrapper */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: APPLICANT DETAILS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-1">1. Student Applicant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" name="firstName" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" name="lastName" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Middle Name</label>
                  <input type="text" name="middleName" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                  <select name="gender" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Applicant Phone *</label>
                  <input type="text" name="phone" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Applicant Email (Optional)</label>
                  <input type="email" name="email" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-gray-800 transition-all">
              Continue to Guardian Details &rarr;
            </button>
          </div>
        )}

        {/* SECTION 2: FAMILY & PLACEMENT LOGISTICS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-1">2. Parent / Guardian & Stream Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Parent / Guardian Full Name *</label>
                  <input type="text" name="parentName" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Contact Phone *</label>
                  <input type="text" name="parentPhone" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Email</label>
                  <input type="email" name="parentEmail" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target Stream Entry Level ID *</label>
                  <select name="applyingLevelId" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500">
                    <option value="">-- Select Target Class ID Level --</option>
                    <option value="1">Primary Stream Level 1</option>
                    <option value="2">Secondary Stream Level 2</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Permanent Residential Address *</label>
                  <textarea name="address" required rows={2} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-blue-500"></textarea>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Back</button>
              <button type="button" onClick={() => setStep(3)} className="w-2/3 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-gray-800 transition-all">Next Step &rarr;</button>
            </div>
          </div>
        )}

        {/* SECTION 3: FILE UPLOADS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-1">3. Required Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UploadDocuments 
                  endpoint="passportUploader" 
                  label="Passport Photograph" 
                  onUploadSuccess={(url) => setPassportPhoto(url)} 
                />
                <UploadDocuments 
                  endpoint="documentUploader" 
                  label="Birth Certificate" 
                  onUploadSuccess={(url) => setBirthCertificate(url)} 
                />
                <UploadDocuments 
                  endpoint="documentUploader" 
                  label="Latest Academic Report Card" 
                  onUploadSuccess={(url) => setReportCard(url)} 
                />
              </div>
            </div>

            {/* SUBMISSION ACTION CONTAINER */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button type="button" disabled={isSubmitting} onClick={() => setStep(2)} className="w-1/3 py-3 border rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all">
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Enrollment Application"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}