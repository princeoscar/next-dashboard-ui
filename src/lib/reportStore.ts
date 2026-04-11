import { prisma } from "./prisma";

export const getStudentReportData = async (studentId: string) => {
  // 1. Get the student and their class info
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });

  // If student doesn't exist, stop here
  if (!student) {
    console.error("❌ DATABASE ERROR: No student found with ID:", studentId);
    return null;
  }

  // 2. Get ALL students in that same class to calculate ranking
  // Note: We use student.classId which we just fetched above
  const allClassStudents = await prisma.student.findMany({
    where: { classId: student.classId },
    include: {
      results: {
        select: { score: true },
      },
    },
  });

  // 3. Map students to their total scores and sort them
  const rankings = allClassStudents
    .map((s) => ({
      id: s.id,
      total: s.results.reduce((sum, r) => sum + r.score, 0),
    }))
    .sort((a, b) => b.total - a.total);

  // 4. Find our target student's position & stats
  const position = rankings.findIndex((r) => r.id === studentId) + 1;
  const totalStudents = rankings.length;
  const studentRankEntry = rankings.find((r) => r.id === studentId);
  const totalScore = studentRankEntry ? studentRankEntry.total : 0;

  // 5. Get the actual detailed results for the report card table
  const results = await prisma.result.findMany({
    where: { studentId },
    include: {
      exam: { 
        include: { 
          lesson: { include: { subject: true } } 
        } 
      },
      assignment: { 
        include: { 
          lesson: { include: { subject: true } } 
        } 
      },
    },
  });

  // 6. Return everything in one object
  return {
    student,
    results,
    position,
    totalStudents,
    totalScore,
  };
};