export const getGradeDetails = (score: number) => {
  if (score >= 75) return { grade: "A1", remark: "Excellent", color: "text-emerald-600" };
  if (score >= 70) return { grade: "B2", remark: "Very Good", color: "text-emerald-500" };
  if (score >= 65) return { grade: "B3", remark: "Good", color: "text-emerald-400" };
  if (score >= 60) return { grade: "C4", remark: "Credit", color: "text-amber-600" };
  if (score >= 55) return { grade: "C5", remark: "Credit", color: "text-amber-500" };
  if (score >= 50) return { grade: "C6", remark: "Credit", color: "text-amber-400" };
  if (score >= 45) return { grade: "D7", remark: "Pass", color: "text-orange-400" };
  if (score >= 40) return { grade: "E8", remark: "Pass", color: "text-orange-500" };
  return { grade: "F9", remark: "Fail", color: "text-red-500" };
};