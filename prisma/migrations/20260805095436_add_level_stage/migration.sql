-- CreateEnum
CREATE TYPE "EducationStage" AS ENUM ('EARLY_YEARS', 'PRIMARY', 'JUNIOR', 'SENIOR');

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "stage" "EducationStage" NOT NULL DEFAULT 'JUNIOR';
