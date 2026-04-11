import ReportCardSheet from "@/components/ReportCardSheet";
import PrintButton from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const ReportPrintPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // 1. SECURITY CHECK (The Guard)
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role;

  if (role === "parent") {
    const parent = await prisma.parent.findFirst({
      where: { clerkId: userId as string },
      include: { students: true }
    });
    
    // Check if the student ID in the URL is one of the parent's children
    const isTheirChild = parent?.students.some((s) => s.id === id);
    
    if (!isTheirChild) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-rose-50">
          <p className="text-rose-600 font-black uppercase tracking-tight">
            Access Denied: You can only view reports for your own children.
          </p>
        </div>
      );
    }
  }

  // 1. Fetch the student and their results from Prisma
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      results: {
        include: {
          exam: { include: { lesson: { include: { subject: true } } } },
          assignment: { include: { lesson: { include: { subject: true } } } },
        },
      },
    },
  });

  if (!student || !student.class) return notFound();

  // 2. The Calculation Brain
  const subjectMap: Record<string, { ca: number; exam: number }> = {};

  student.results.forEach((res) => {
    const subjectName = res.exam?.lesson.subject.name || res.assignment?.lesson.subject.name || "General";
    
    if (!subjectMap[subjectName]) {
      subjectMap[subjectName] = { ca: 0, exam: 0 };
    }

    if (res.type === "EXAM") subjectMap[subjectName].exam = res.score;
    if (res.type === "ASSIGNMENT") subjectMap[subjectName].ca = res.score;
  });

  // 3. Format the data for the ReportCardSheet
  const processedData = {
    studentName: `${student.name} ${student.surname}`,
    studentId: student.id,
    // Use ?. and ?? to handle the potential null value
    className: student.class?.name ?? "No Class Assigned", 
    subjects: Object.entries(subjectMap).map(([name, scores]) => {
      const total = (scores.ca * 0.4) + (scores.exam * 0.6);
      return {
        name,
        ca: scores.ca,
        exam: scores.exam,
        total: total.toFixed(1),
        grade: total >= 80 ? "A" : total >= 60 ? "B" : total >= 50 ? "C" : "F"
      };
    })
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      {/* Pass the calculated data to your component */}
      <ReportCardSheet data={processedData} />
    </div>
  );
};

export default ReportPrintPage;