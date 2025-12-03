-- DropIndex
DROP INDEX "Task_assigneeId_idx";

-- DropIndex
DROP INDEX "Task_productId_idx";

-- DropIndex
DROP INDEX "Task_productId_status_idx";

-- DropIndex
DROP INDEX "Task_teamId_status_idx";

-- DropIndex
DROP INDEX "Task_versionId_idx";

-- DropIndex
DROP INDEX "Task_versionId_status_idx";

-- CreateTable
CREATE TABLE "TeamData" (
    "id" TEXT NOT NULL,
    "dataKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "TeamData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamData_teamId_idx" ON "TeamData"("teamId");

-- CreateIndex
CREATE INDEX "TeamData_dataKey_idx" ON "TeamData"("dataKey");

-- CreateIndex
CREATE UNIQUE INDEX "TeamData_teamId_dataKey_key" ON "TeamData"("teamId", "dataKey");

-- CreateIndex
CREATE INDEX "Task_taskNumber_teamId_idx" ON "Task"("taskNumber", "teamId");

-- AddForeignKey
ALTER TABLE "TeamData" ADD CONSTRAINT "TeamData_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamData" ADD CONSTRAINT "TeamData_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
