
import PublicAdmissionForm from "@/components/Admissions/PublicAdmissionForm";

export default function PublicAdmissionsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Student Admission Application Form
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Please fill out the forms below and upload the necessary credentials to initiate your child&apos;s enrollment.
          </p>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 md:p-10">
          {/* Renders the complete registration form perfectly without property mismatch errors */}
          <PublicAdmissionForm />
        </div>
      </div>
    </div>
  );
}