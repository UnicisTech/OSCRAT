/*
  Warnings:

  - The values [MICROENTERPRISE,LARGE_ENTERPRISE,STARTUP] on the enum `OscratOrganizationSize` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `OscratProductAssessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "OscratAssessmentType" ADD VALUE 'COMPLIANCE';

-- AlterEnum
BEGIN;
CREATE TYPE "OscratOrganizationSize_new" AS ENUM ('MICRO_ENTERPRISE', 'SMALL_ENTERPRISE', 'MEDIUM_ENTERPRISE', 'OTHER');
ALTER TABLE "Team" ALTER COLUMN "size" DROP DEFAULT;
ALTER TABLE "Team" ALTER COLUMN "size" TYPE "OscratOrganizationSize_new" USING ("size"::text::"OscratOrganizationSize_new");
ALTER TYPE "OscratOrganizationSize" RENAME TO "OscratOrganizationSize_old";
ALTER TYPE "OscratOrganizationSize_new" RENAME TO "OscratOrganizationSize";
DROP TYPE "OscratOrganizationSize_old";
ALTER TABLE "Team" ALTER COLUMN "size" SET DEFAULT 'SMALL_ENTERPRISE';
COMMIT;

-- DropForeignKey
ALTER TABLE "OscratProductAssessment" DROP CONSTRAINT "OscratProductAssessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "OscratProductAssessment" DROP CONSTRAINT "OscratProductAssessment_versionId_fkey";

-- AlterTable
ALTER TABLE "OscratProductVersion" ADD COLUMN     "supportEndDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "size" SET DEFAULT 'SMALL_ENTERPRISE';

-- DropTable
DROP TABLE "OscratProductAssessment";

-- CreateTable
CREATE TABLE "OscratAssessment" (
    "id" TEXT NOT NULL,
    "type" "OscratAssessmentType" NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "teamId" TEXT NOT NULL,
    "productId" TEXT,
    "versionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "OscratAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OscratAssessment_teamId_idx" ON "OscratAssessment"("teamId");

-- CreateIndex
CREATE INDEX "OscratAssessment_productId_idx" ON "OscratAssessment"("productId");

-- CreateIndex
CREATE INDEX "OscratAssessment_versionId_idx" ON "OscratAssessment"("versionId");

-- CreateIndex
CREATE INDEX "OscratAssessment_teamId_type_idx" ON "OscratAssessment"("teamId", "type");

-- CreateIndex
CREATE INDEX "OscratAssessment_versionId_type_idx" ON "OscratAssessment"("versionId", "type");

-- AddForeignKey
ALTER TABLE "OscratAssessment" ADD CONSTRAINT "OscratAssessment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratAssessment" ADD CONSTRAINT "OscratAssessment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratAssessment" ADD CONSTRAINT "OscratAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
