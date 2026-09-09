import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdmissionSlip from "@/components/student/AdmissionSlip";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdmissionSlipPage({
  params,
}: PageProps) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
  where: {
    id,
  },
  include: {
    school: true,
    level: true,
    class: true,
    admission: true,
  },
});

  if (!student) {
    notFound();
  }

  return <AdmissionSlip student={student} />;
}