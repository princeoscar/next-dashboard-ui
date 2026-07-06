import { getAdmissionApplications } from "@/services/admissionService";
import AdmissionDashboard from "@/components/Admissions/AdmissionDashboard";

interface PageProps {
  searchParams: Promise<{ schoolId?: string }>;
}

export default async function AdmissionsAdminPage({ searchParams }: PageProps) {
  // Defaulting to school1 to seamlessly align with your database seed parameters
  const resolvedParams = await searchParams;
  const school1 = resolvedParams.schoolId || "school1";
  
  const applications = await getAdmissionApplications(school1);

  return (
    <div className="container mx-auto py-8">
      <AdmissionDashboard applications={applications} schoolId={school1} />
    </div>
  );
}