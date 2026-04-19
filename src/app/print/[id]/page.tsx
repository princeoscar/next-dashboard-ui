import ReportCardSheet from "@/components/ReportCardSheet";
import PrintButton from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const ReportPrintPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

 // 1. SECURITY CHECK (The Guard)
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role?.toLowerCase();

  // Inside your Page function
const currentYear = await prisma.academicYear.findFirst({
  where: { isCurrent: true }
});

// If for some reason there's no year in the DB, fallback to a string
const yearLabel = currentYear?.name || "2025/2026";

  // First, fetch the student purely by ID (since ID is a string)
  const student = await prisma.student.findUnique({
    where: { id: id },
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

  if (!student) return notFound();

 // Now, check if the parent is allowed to see this student
  if (role === "parent") {
    // We compare both as strings to be 100% sure
    const isAuthorized = String(student.parentId) === String(userId);

    if (!isAuthorized) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 p-6 text-center">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-rose-100">
            <h1 className="text-rose-600 font-black uppercase tracking-tighter text-2xl mb-2">Access Denied</h1>
            <p className="text-slate-500 text-sm font-medium">
              Verification Failed: This student is not linked to your account.
            </p>
            <div className="mt-4 text-[10px] text-slate-300 font-mono">
              User: {userId} | Student Parent: {student.parentId}
            </div>
          </div>
        </div>
      );
    }
  }
  
  // 3. The Calculation Brain
  const subjectMap: Record<string, { ca: number; exam: number }> = {};

  student.results.forEach((res) => {
    const subjectName = res.exam?.lesson.subject.name || res.assignment?.lesson.subject.name || "General";
    
    if (!subjectMap[subjectName]) {
      subjectMap[subjectName] = { ca: 0, exam: 0 };
    }

    if (res.type === "EXAM") subjectMap[subjectName].exam = res.score;
    if (res.type === "ASSIGNMENT") subjectMap[subjectName].ca = res.score;
  });

  // 4. Format the data for the ReportCardSheet
  const processedData = {
    studentName: `${student.name} ${student.surname}`,
    studentId: student.id,
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
    <div className="bg-slate-100 min-h-screen py-10 print:bg-white print:py-0 overflow-x-hidden">
      <div className="max-w-[210mm] mx-auto px-4 sm:px-0 mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full">
         <ReportCardSheet data={{
           ...processedData,
          academicYear: yearLabel,
          studentName: student.name,
         
          }} />
      </div>
    </div>
  );
};

export default ReportPrintPage;