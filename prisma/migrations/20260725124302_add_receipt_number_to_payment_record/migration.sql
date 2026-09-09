/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,name]` on the table `FeeCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiptNumber]` on the table `PaymentRecord` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolId` to the `FeeAllocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `FeeCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `PaymentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `StudentBalance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeAllocation" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeeCategory" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentRecord" ADD COLUMN     "receiptNumber" TEXT,
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentBalance" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "FeeAllocation_schoolId_idx" ON "FeeAllocation"("schoolId");

-- CreateIndex
CREATE INDEX "FeeCategory_schoolId_idx" ON "FeeCategory"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeCategory_schoolId_name_key" ON "FeeCategory"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_receiptNumber_key" ON "PaymentRecord"("receiptNumber");

-- CreateIndex
CREATE INDEX "PaymentRecord_schoolId_idx" ON "PaymentRecord"("schoolId");

-- CreateIndex
CREATE INDEX "StudentBalance_schoolId_idx" ON "StudentBalance"("schoolId");

-- AddForeignKey
ALTER TABLE "FeeAllocation" ADD CONSTRAINT "FeeAllocation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCategory" ADD CONSTRAINT "FeeCategory_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBalance" ADD CONSTRAINT "StudentBalance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
