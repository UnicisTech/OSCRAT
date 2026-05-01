/*
  Warnings:

  - A unique constraint covering the columns `[configurationScanReportId]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "WorkerJobType" ADD VALUE 'PROCESS_CONFIGURATION_SCAN';

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "configurationScanReportId" TEXT;

-- CreateTable
CREATE TABLE "ConfigurationScanReport" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "scanData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigurationScanReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigurationScanReport_jobId_key" ON "ConfigurationScanReport"("jobId");

-- CreateIndex
CREATE INDEX "ConfigurationScanReport_versionId_idx" ON "ConfigurationScanReport"("versionId");

-- CreateIndex
CREATE INDEX "ConfigurationScanReport_productId_idx" ON "ConfigurationScanReport"("productId");

-- CreateIndex
CREATE INDEX "ConfigurationScanReport_versionId_createdAt_idx" ON "ConfigurationScanReport"("versionId", "createdAt");

-- CreateIndex
CREATE INDEX "ConfigurationScanReport_productId_createdAt_idx" ON "ConfigurationScanReport"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_configurationScanReportId_key" ON "Attachment"("configurationScanReportId");

-- CreateIndex
CREATE INDEX "Attachment_configurationScanReportId_idx" ON "Attachment"("configurationScanReportId");

-- AddForeignKey
ALTER TABLE "ConfigurationScanReport" ADD CONSTRAINT "ConfigurationScanReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "WorkerJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigurationScanReport" ADD CONSTRAINT "ConfigurationScanReport_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_configurationScanReportId_fkey" FOREIGN KEY ("configurationScanReportId") REFERENCES "ConfigurationScanReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
