/*
  Warnings:

  - A unique constraint covering the columns `[conformityAssessmentReportId]` on the table `OscratProductVersion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[declarationOfConformityId]` on the table `OscratProductVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "OscratProductVersionStatus" ADD VALUE 'SUPPORTED';

-- AlterTable
ALTER TABLE "OscratProductVersion" ADD COLUMN     "conformityAssessmentReportId" TEXT,
ADD COLUMN     "declarationOfConformityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OscratProductVersion_conformityAssessmentReportId_key" ON "OscratProductVersion"("conformityAssessmentReportId");

-- CreateIndex
CREATE UNIQUE INDEX "OscratProductVersion_declarationOfConformityId_key" ON "OscratProductVersion"("declarationOfConformityId");

-- AddForeignKey
ALTER TABLE "OscratProductVersion" ADD CONSTRAINT "OscratProductVersion_conformityAssessmentReportId_fkey" FOREIGN KEY ("conformityAssessmentReportId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVersion" ADD CONSTRAINT "OscratProductVersion_declarationOfConformityId_fkey" FOREIGN KEY ("declarationOfConformityId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
