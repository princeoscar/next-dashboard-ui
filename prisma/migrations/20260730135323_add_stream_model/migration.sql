/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,code]` on the table `Stream` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Stream_schoolId_code_key" ON "Stream"("schoolId", "code");
