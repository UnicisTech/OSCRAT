/*
  Warnings:

  - Added the required column `contextTeamId` to the `WorkerJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkerJob" ADD COLUMN     "contextProductId" TEXT,
ADD COLUMN     "contextTeamId" TEXT NOT NULL,
ADD COLUMN     "contextVersionId" TEXT;

-- CreateIndex
CREATE INDEX "WorkerJob_contextVersionId_type_idx" ON "WorkerJob"("contextVersionId", "type");

-- CreateIndex
CREATE INDEX "WorkerJob_contextProductId_type_idx" ON "WorkerJob"("contextProductId", "type");

-- CreateIndex
CREATE INDEX "WorkerJob_contextTeamId_type_idx" ON "WorkerJob"("contextTeamId", "type");

-- AddForeignKey
ALTER TABLE "WorkerJob" ADD CONSTRAINT "WorkerJob_contextTeamId_fkey" FOREIGN KEY ("contextTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerJob" ADD CONSTRAINT "WorkerJob_contextProductId_fkey" FOREIGN KEY ("contextProductId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerJob" ADD CONSTRAINT "WorkerJob_contextVersionId_fkey" FOREIGN KEY ("contextVersionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
