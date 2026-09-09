-- CreateTable
CREATE TABLE "LessonClass" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "LessonClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonClass_lessonId_idx" ON "LessonClass"("lessonId");

-- CreateIndex
CREATE INDEX "LessonClass_classId_idx" ON "LessonClass"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonClass_lessonId_classId_key" ON "LessonClass"("lessonId", "classId");

-- AddForeignKey
ALTER TABLE "LessonClass" ADD CONSTRAINT "LessonClass_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonClass" ADD CONSTRAINT "LessonClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
