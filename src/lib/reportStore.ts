import { prisma } from "./prisma";

export const getStudentReportData = async (studentId: string) => {
  // 1. Get the student and their class info
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });

  if (!student) {
    console.error("❌ DATABASE ERROR: No student found with ID:", studentId);
    return null;
  }

  // 2. Get ALL students in that same class to calculate ranking
  const allClassStudents = await prisma.student.findMany({
    where: { 
      classId: student.classId 
    },
    include: {
      results: {
        // 🎯 FIX: Changed 'score' to 'totalScore'
        select: { totalScore: true },
      },
    },
  });

  // 3. Map students to their total scores and sort them
  const rankings = allClassStudents
    .map((s) => ({
      id: s.id,
      // 🎯 FIX: Changed 'r.score' to 'r.totalScore'
      total: s.results.reduce((sum, r) => sum + (r.totalScore || 0), 0),
    }))
    .sort((a, b) => b.total - a.total);

  // 4. Find our target student's position & stats
  const position = rankings.findIndex((r) => r.id === studentId) + 1;
  const totalStudents = rankings.length;
  const studentRankEntry = rankings.find((r) => r.id === studentId);
  const totalScore = studentRankEntry ? studentRankEntry.total : 0;

  // 5. Get detailed results (Removing the 'lesson' middleman)
  const results = await prisma.result.findMany({
    where: { studentId },
    include: {
      exam: { 
        // 🎯 FIX: Direct link to subject
        include: { subject: true } 
      },
      assignment: { 
        // 🎯 FIX: Direct link to subject
        include: { subject: true } 
      },
    },
  });

  return {
    student,
    results,
    position,
    totalStudents,
    totalScore,
  };
};