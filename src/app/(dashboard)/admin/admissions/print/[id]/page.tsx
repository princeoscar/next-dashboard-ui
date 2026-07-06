import { getAdmissionDetail } from "@/services/admissionService";
import { notFound } from "next/navigation";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintAdmissionSlipPage({ params }: PrintPageProps) {
  const resolvedParams = await params;
  const application = await getAdmissionDetail(resolvedParams.id);

  if (!application || application.status !== "ACCEPTED") {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen p-8 max-w-4xl mx-auto text-gray-800 font-sans print:p-0">
      {/* Print Trigger Control Header Bar (Hidden during printing) */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border mb-8 print:hidden">
        <div>
          <h1 className="text-sm font-bold text-gray-900">Admission Letter Generated</h1>
          <p className="text-xs text-gray-500">Ready for physical processing or digital PDF archival saving.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* Official Institutional Letterhead Header block */}
      <div className="border-b-4 border-blue-900 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-900">EXCELSIOR ACADEMY</h2>
          <p className="text-xs font-medium text-gray-500 mt-1">102 Knowledge Hub Way, Digital Workspace Suite</p>
          <p className="text-xs text-gray-400">Phone: +234 (0) 812 345 6789 | Email: registrar@excelsior.edu.ng</p>
        </div>
        <div className="w-20 h-20 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-2xl">
          EA
        </div>
      </div>

      {/* Document Meta Indicators */}
      <div className="mt-8 flex justify-between items-baseline">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block">Document Ref</span>
          <span className="font-mono text-sm font-bold text-blue-700">{application.applicationNumber}</span>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block">Date of Issue</span>
          <span className="text-sm font-medium">{new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mt-10 space-y-6 text-sm leading-relaxed">
        <p className="font-bold text-gray-900">To the Parent/Guardian of {application.firstName} {application.lastName},</p>
        
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-950 pl-3 uppercase tracking-wide">
          Official Offer of Provisional Admission
        </h3>

        <p>
          Following a thorough review of academic records and submitted enrollment documentation configurations, we are pleased to inform you that <strong>{application.firstName} {application.lastName}</strong> has been offered provisional admission into <strong>{application.applyingLevel?.name || "the requested level stream"}</strong> for the upcoming academic session.
        </p>

        {/* Dynamic Structural Grid Information Fields */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 my-6 grid grid-cols-2 gap-y-3 gap-x-6 print:border-gray-300">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Student Full Name:</span>
            <span className="font-bold text-gray-900">{application.lastName}, {application.firstName}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Assigned Stream Level:</span>
            <span className="font-bold text-gray-900">{application.applyingLevel?.name || "N/A"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Registered Gender:</span>
            <span className="font-medium">{application.gender}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Assigned Registry Code:</span>
            <span className="font-mono font-bold text-blue-800">{application.applicationNumber}</span>
          </div>
        </div>

        <p>
          To finalize this placement registry and clear the newly initialized student roster profile layout, please present a printed physical copy of this clearance letter to the administrative bursary unit alongside proof of institutional acceptance processing fees.
        </p>

        <p className="pt-4">Congratulations once more on your acceptance into our community.</p>
      </div>

      {/* Official Sign-off Validation Blocks */}
      <div className="mt-16 flex justify-between items-end pt-12 border-t border-dashed">
        <div className="text-center w-48">
          <div className="h-12 border-b border-gray-400 font-serif italic text-gray-400 text-sm flex items-end justify-center pb-1">
            Authorized Digital Sign
          </div>
          <span className="text-xs font-bold text-gray-900 block mt-2">Registrar&apos;s Office</span>
          <span className="text-[10px] text-gray-400 block">Excelsior Academy Registry</span>
        </div>

        {/* Security Verification Stamp Box */}
        <div className="w-32 h-32 border-2 border-emerald-600 rounded-full flex flex-col items-center justify-center border-opacity-40 p-2 text-center text-emerald-700 transform rotate-12 font-bold uppercase tracking-wider text-[10px]">
          <div className="border border-emerald-600 rounded-full w-full h-full flex flex-col items-center justify-center border-opacity-20 border-dashed">
            <span>Official</span>
            <span className="text-xs my-0.5">VERIFIED</span>
            <span>Clearance</span>
          </div>
        </div>
      </div>
    </div>
  );
}