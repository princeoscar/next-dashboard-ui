"use client";

import { useState } from "react";
// 🎯 Import from your local utility file, NOT @uploadthing/react
import { UploadDropzone } from "@/lib/uploadthing"; 
import { ourFileRouter } from "@/app/api/uploadthing/core";

interface UploadDocumentsProps {
  endpoint: keyof typeof ourFileRouter;
  label: string;
  onUploadSuccess: (url: string) => void;
}

export default function UploadDocuments({ endpoint, label, onUploadSuccess }: UploadDocumentsProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <span className="text-sm font-medium text-gray-700">{label} *</span>
      
      {fileUrl ? (
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <span className="truncate max-w-[250px]">✓ Document uploaded successfully</span>
          <button 
            type="button" 
            onClick={() => { setFileUrl(null); onUploadSuccess(""); }}
            className="text-xs font-semibold text-red-500 hover:underline ml-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <UploadDropzone
  endpoint={endpoint}
 onClientUploadComplete={(res) => {
  if (res && res[0]) {
    // 🎯 Check serverData first, then fallback to appUrl or url safely typed
    const uploadedUrl = res[0].serverData?.url || (res[0] as any).url || (res[0] as any).appUrl;
    
    if (uploadedUrl) {
      setFileUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    }
  }
}}
  // 🎯 Fix: Let TypeScript infer 'error' or explicitly read error.message
 onUploadError={(error: any) => {
    alert(`Upload failed: ${error.message || "An unexpected error occurred"}`);
  }}
  className="ut-button:bg-blue-600 ut-label:text-blue-600 border-none p-4"
/>
      )}
    </div>
  );
}