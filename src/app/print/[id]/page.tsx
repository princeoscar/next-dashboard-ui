import ReportCardSheet from "@/components/ReportCardSheet";
import PrintButton from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const ReportPrintPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role?.toLowerCase();

  // 1. Get Current Academic Year
  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  const yearLabel = currentYear?.name || "2025/2026";
  const academicYearId = currentYear?.id || 1; 

  // 2. Fetch Student with Attendance and Results
  const student = await prisma.student.findUnique({
    where: { id: id },
    include: {
      class: {
        include: {
          _count: { select: { subjects: true } },
          supervisor: true,
        }
      },
      // 🎯 Fix: Ensure this matches your schema (attendance or attendances)
      attendances: {
        where: { academicYearId: academicYearId }
      },
      results: {
        include: {
          subject: { select: { name: true } },
          exam: { include: { subject: true } },
          assignment: { include: { subject: true } },
        },
        orderBy: { id: 'desc' }
      },
    },
  });

  if (!student) return notFound();

  // 3. Parent Security Check
  if (role === "parent" && String(student.parentId) !== String(userId)) {
    return <div className="p-10 text-center font-bold text-red-600">Access Denied</div>;
  }

  // 4. Attendance Aggregation Logic
  
  const attendanceRecords = student.attendances || [];
  const uniqueDates = Array.from(new Set(attendanceRecords.map((a) => a.date.toISOString().split("T")[0])));
  const daysPresent = uniqueDates.filter((date) =>
    attendanceRecords.some((a) => a.date.toISOString().split("T")[0] === date && a.present)
  ).length;

  // 5. Ranking & Subject Mapping Logic
  const subjectMap: Record<string, any> = {};
  student.results.forEach((res) => {
    const name = res.subject?.name || res.exam?.subject?.name || "Unknown";
    if (!subjectMap[name]) {
      subjectMap[name] = {
        ca: (res.testScore ?? 0) + (res.assignmentScore ?? 0),
        exam: res.examScore ?? 0,
        total: res.totalScore ?? 0,
        grade: res.grade ?? "F"
      };
    }
  });

  const totalPoints = student.results.reduce((acc, curr) => acc + (curr.totalScore ?? 0), 0);
  const studentAverage = student.results.length > 0 ? totalPoints / student.results.length : 0;
  const className = student.class?.name ?? "";

  // 6. Principal Remarks Logic
  const getPrincipalComment = (avg: number) => {
    if (avg >= 80) return "Exceptional performance! Keep it up.";
    if (avg >= 60) return "Good performance. Room for more growth.";
    return "Standard below average. See Principal.";
  };

  // 7. FINAL DATA MERGE
  const finalData = {
    studentName: `${student.name} ${student.surname}`,
    studentId: student.id,
    className: className,
    academicYear: yearLabel,
    principalComment: getPrincipalComment(studentAverage),
    attendance: {
      present: daysPresent,
      total: uniqueDates.length
    },
    subjects: Object.entries(subjectMap).map(([name, scores]) => ({
      name,
      ca: scores.ca,
      exam: scores.exam,
      total: scores.total.toString(),
      level: className.toLowerCase().includes("sss") ? scores.grade : ""
    }))
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto px-4 mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none">
        {/* 🎯 ONLY ONE CALL TO THE COMPONENT */}
        <ReportCardSheet data={finalData} />
      </div>
    </div>
  );
};

export default ReportPrintPage;