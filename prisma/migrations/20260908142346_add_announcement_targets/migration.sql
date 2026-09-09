-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "levelId" INTEGER,
ADD COLUMN     "teacherId" TEXT;

-- CreateTable
CREATE TABLE "AssignmentClass" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "AssignmentClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignmentClass_assignmentId_idx" ON "AssignmentClass"("assignmentId");

-- CreateIndex
CREATE INDEX "AssignmentClass_classId_idx" ON "AssignmentClass"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentClass_assignmentId_classId_key" ON "AssignmentClass"("assignmentId", "classId");

-- CreateIndex
CREATE INDEX "Announcement_levelId_idx" ON "Announcement"("levelId");

-- CreateIndex
CREATE INDEX "Announcement_teacherId_idx" ON "Announcement"("teacherId");

-- AddForeignKey
ALTER TABLE "AssignmentClass" ADD CONSTRAINT "AssignmentClass_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentClass" ADD CONSTRAINT "AssignmentClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
