"use client";

import { useState } from "react";
import UploadDocuments from "./UploadDocuments"; // Adjust path if needed

export default function AdmissionForm() {
  //  FIX: Placed safely inside the functional component body
  const [passportPhoto, setPassportPhoto] = useState<string>("");
  const [birthCertificate, setBirthCertificate] = useState<string>("");
  const [reportCard, setReportCard] = useState<string>("");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">3. Required Documents</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
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
          label="Last Academic Result" 
          onUploadSuccess={(url) => setReportCard(url)} 
        />
      </div>
    </div>
  );
}