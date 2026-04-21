/*
  Warnings:

  - A unique constraint covering the columns `[date,studentId,lessonId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerkId]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendance_date_studentId_lessonId_key" ON "Attendance"("date", "studentId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_clerkId_key" ON "Parent"("clerkId");
