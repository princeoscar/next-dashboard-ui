import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    admissionNumber: string;
  }>;
}

export default async function VerifyAdmissionPage({
  params,
}: PageProps) {
  const { admissionNumber } = await params;

  const student = await prisma.student.findUnique({
    where: {
      admissionNumber,
    },
    include: {
      school: true,
      level: true,
      class: true,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="bg-white rounded-xl shadow border p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
            ✓ VERIFIED ADMISSION
          </div>

          <h1 className="text-3xl font-bold mt-4">
            {student.school.name}
          </h1>

          <p className="text-gray-500">
            Admission Verification Portal
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">

          <Item
            label="Student Name"
            value={`${student.name} ${student.surname}`}
          />

          <Item
            label="Admission Number"
            value={student.admissionNumber}
          />

          <Item
            label="Level"
            value={student.level.name}
          />

          <Item
            label="Class"
            value={student.class?.name ?? "Not Assigned"}
          />

          <Item
            label="School"
            value={student.school.name}
          />

          <Item
            label="Status"
            value="ACTIVE"
          />

        </div>

      </div>
    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">
        {label}
      </p>

      <p className="font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}