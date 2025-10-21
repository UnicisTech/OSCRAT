/*
  Warnings:

  - You are about to drop the column `incidentReference` on the `OscratProductIncident` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OscratProductIncident` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `OscratProductIncident` table. All the data in the column will be lost.
  - Added the required column `attackType` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classification` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfDetection` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporterId` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `OscratProductIncident` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `OscratProductIncident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('PENDING', 'START', 'DECLARED', 'STABLE', 'ACTIVE', 'RESOLVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "IncidentClassification" AS ENUM ('GENERAL', 'CONFIDENTIALITY', 'INTEGRITY', 'AVAILABILITY', 'ACCESS_CONTROL', 'VULNERABILITIES', 'TECHNICAL_FAILURE', 'THEFT_OR_LOSS');

-- CreateEnum
CREATE TYPE "IncidentAttackType" AS ENUM ('DENIAL_OF_SERVICE', 'UNAUTHORISED_ACCESS', 'MALWARE', 'ABUSE', 'OTHERS');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "incidentId" TEXT;

-- AlterTable
ALTER TABLE "OscratProductIncident" DROP COLUMN "incidentReference",
DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "assetDetails" TEXT,
ADD COLUMN     "attackType" "IncidentAttackType" NOT NULL,
ADD COLUMN     "classification" "IncidentClassification" NOT NULL,
ADD COLUMN     "correctiveActions" TEXT,
ADD COLUMN     "crossBorderImpact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "crossBorderImpactDetails" TEXT,
ADD COLUMN     "dateOfDetection" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "handlingDate" TIMESTAMP(3),
ADD COLUMN     "preventiveActions" TEXT,
ADD COLUMN     "reporterId" TEXT NOT NULL,
ADD COLUMN     "rootCause" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "severity" "IncidentSeverity" NOT NULL,
ADD COLUMN     "suspectedUnlawfulAct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamId" TEXT NOT NULL,
ADD COLUMN     "unlawfulActDescription" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "IncidentStatus" NOT NULL;

-- DropEnum
DROP TYPE "OscratProductIncidentStatus";

-- DropEnum
DROP TYPE "OscratProductIncidentType";

-- CreateIndex
CREATE INDEX "Attachment_incidentId_idx" ON "Attachment"("incidentId");

-- CreateIndex
CREATE INDEX "OscratProductIncident_teamId_idx" ON "OscratProductIncident"("teamId");

-- CreateIndex
CREATE INDEX "OscratProductIncident_versionId_status_idx" ON "OscratProductIncident"("versionId", "status");

-- CreateIndex
CREATE INDEX "OscratProductIncident_productId_status_idx" ON "OscratProductIncident"("productId", "status");

-- CreateIndex
CREATE INDEX "OscratProductIncident_teamId_status_idx" ON "OscratProductIncident"("teamId", "status");

-- CreateIndex
CREATE INDEX "OscratProductIncident_teamId_dateOfDetection_idx" ON "OscratProductIncident"("teamId", "dateOfDetection");

-- CreateIndex
CREATE INDEX "OscratProductIncident_dateOfDetection_idx" ON "OscratProductIncident"("dateOfDetection");

-- CreateIndex
CREATE INDEX "OscratProductIncident_severity_idx" ON "OscratProductIncident"("severity");

-- AddForeignKey
ALTER TABLE "OscratProductIncident" ADD CONSTRAINT "OscratProductIncident_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductIncident" ADD CONSTRAINT "OscratProductIncident_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "OscratProductIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
