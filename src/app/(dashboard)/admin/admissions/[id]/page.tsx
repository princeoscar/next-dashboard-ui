import { getAdmissionDetail } from "@/services/admissionService";
import AdmissionDetails from "@/components/Admissions/AdmissionDetails";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const application = await getAdmissionDetail(resolvedParams.id);
  if (!application) notFound();

  return <AdmissionDetails application={application} />;
}