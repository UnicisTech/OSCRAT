-- AlterTable
ALTER TABLE "SbomReport" ALTER COLUMN "sbomData" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VulnerabilityScanReport" ADD COLUMN     "sourceSbomReportId" TEXT,
ALTER COLUMN "scanData" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "VulnerabilityScanReport_sourceSbomReportId_idx" ON "VulnerabilityScanReport"("sourceSbomReportId");

-- AddForeignKey
ALTER TABLE "VulnerabilityScanReport" ADD CONSTRAINT "VulnerabilityScanReport_sourceSbomReportId_fkey" FOREIGN KEY ("sourceSbomReportId") REFERENCES "SbomReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
