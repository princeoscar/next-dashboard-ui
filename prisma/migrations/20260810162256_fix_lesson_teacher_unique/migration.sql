/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,day,startTime,academicYearId,term,classId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Lesson_teacherId_day_startTime_academicYearId_term_key";

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_teacherId_day_startTime_academicYearId_term_classId_key" ON "Lesson"("teacherId", "day", "startTime", "academicYearId", "term", "classId");
