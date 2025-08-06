/*
  Warnings:

  - A unique constraint covering the columns `[versionId]` on the table `OscratRepository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `versionId` to the `OscratProductAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `OscratProductVulnerability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `OscratRepository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `SbomReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OscratProductVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "OscratProductAssessment" DROP CONSTRAINT "OscratProductAssessment_productId_fkey";

-- DropForeignKey
ALTER TABLE "OscratProductIncident" DROP CONSTRAINT "OscratProductIncident_productId_fkey";

-- DropForeignKey
ALTER TABLE "OscratProductVulnerability" DROP CONSTRAINT "OscratProductVulnerability_productId_fkey";

-- DropForeignKey
ALTER TABLE "OscratRepository" DROP CONSTRAINT "OscratRepository_productId_fkey";

-- DropForeignKey
ALTER TABLE "SbomReport" DROP CONSTRAINT "SbomReport_productId_fkey";

-- DropIndex
DROP INDEX "OscratRepository_productId_key";

-- AlterTable
ALTER TABLE "OscratProductAssessment" ADD COLUMN     "versionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OscratProductIncident" ADD COLUMN     "versionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OscratProductVulnerability" ADD COLUMN     "versionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OscratRepository" ADD COLUMN     "versionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SbomReport" ADD COLUMN     "versionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OscratProductVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "OscratProductVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "OscratProductVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OscratProductVersion_productId_idx" ON "OscratProductVersion"("productId");

-- CreateIndex
CREATE INDEX "OscratProductVersion_status_idx" ON "OscratProductVersion"("status");

-- CreateIndex
CREATE INDEX "OscratProductVersion_productId_status_idx" ON "OscratProductVersion"("productId", "status");

-- CreateIndex
CREATE INDEX "OscratProductVersion_productId_createdAt_idx" ON "OscratProductVersion"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "OscratProductAssessment_versionId_idx" ON "OscratProductAssessment"("versionId");

-- CreateIndex
CREATE INDEX "OscratProductAssessment_productId_idx" ON "OscratProductAssessment"("productId");

-- CreateIndex
CREATE INDEX "OscratProductAssessment_versionId_type_idx" ON "OscratProductAssessment"("versionId", "type");

-- CreateIndex
CREATE INDEX "OscratProductIncident_versionId_idx" ON "OscratProductIncident"("versionId");

-- CreateIndex
CREATE INDEX "OscratProductIncident_productId_idx" ON "OscratProductIncident"("productId");

-- CreateIndex
CREATE INDEX "OscratProductIncident_versionId_status_idx" ON "OscratProductIncident"("versionId", "status");

-- CreateIndex
CREATE INDEX "OscratProductIncident_productId_status_idx" ON "OscratProductIncident"("productId", "status");

-- CreateIndex
CREATE INDEX "OscratProductVulnerability_versionId_idx" ON "OscratProductVulnerability"("versionId");

-- CreateIndex
CREATE INDEX "OscratProductVulnerability_productId_idx" ON "OscratProductVulnerability"("productId");

-- CreateIndex
CREATE INDEX "OscratProductVulnerability_versionId_status_idx" ON "OscratProductVulnerability"("versionId", "status");

-- CreateIndex
CREATE INDEX "OscratProductVulnerability_productId_status_idx" ON "OscratProductVulnerability"("productId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OscratRepository_versionId_key" ON "OscratRepository"("versionId");

-- CreateIndex
CREATE INDEX "OscratRepository_organizationId_versionId_idx" ON "OscratRepository"("organizationId", "versionId");

-- CreateIndex
CREATE INDEX "SbomReport_versionId_idx" ON "SbomReport"("versionId");

-- CreateIndex
CREATE INDEX "SbomReport_productId_idx" ON "SbomReport"("productId");

-- CreateIndex
CREATE INDEX "SbomReport_versionId_createdAt_idx" ON "SbomReport"("versionId", "createdAt");

-- CreateIndex
CREATE INDEX "SbomReport_productId_createdAt_idx" ON "SbomReport"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "OscratProductVersion" ADD CONSTRAINT "OscratProductVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVersion" ADD CONSTRAINT "OscratProductVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVersion" ADD CONSTRAINT "OscratProductVersion_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductAssessment" ADD CONSTRAINT "OscratProductAssessment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVulnerability" ADD CONSTRAINT "OscratProductVulnerability_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductIncident" ADD CONSTRAINT "OscratProductIncident_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratRepository" ADD CONSTRAINT "OscratRepository_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SbomReport" ADD CONSTRAINT "SbomReport_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
