/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'PLANNED', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskOriginType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "originType" "TaskOriginType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "versionId" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "assigneeId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- CreateIndex
CREATE INDEX "Task_versionId_idx" ON "Task"("versionId");

-- CreateIndex
CREATE INDEX "Task_teamId_status_idx" ON "Task"("teamId", "status");

-- CreateIndex
CREATE INDEX "Task_versionId_status_idx" ON "Task"("versionId", "status");

-- CreateIndex
CREATE INDEX "Task_productId_idx" ON "Task"("productId");

-- CreateIndex
CREATE INDEX "Task_productId_status_idx" ON "Task"("productId", "status");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
