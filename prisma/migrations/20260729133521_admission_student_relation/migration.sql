/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `Admission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admission" ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admission_studentId_key" ON "Admission"("studentId");

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
