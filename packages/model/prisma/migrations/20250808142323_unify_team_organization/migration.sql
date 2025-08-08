/*
  Warnings:

  - You are about to drop the column `organizationId` on the `OscratProduct` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `OscratReportingOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `OscratRepository` table. All the data in the column will be lost.
  - You are about to drop the `OscratOrganization` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teamId` to the `OscratProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `OscratReportingOrganization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `OscratRepository` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OscratOrganization" DROP CONSTRAINT "OscratOrganization_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "OscratOrganization" DROP CONSTRAINT "OscratOrganization_teamId_fkey";

-- DropForeignKey
ALTER TABLE "OscratOrganization" DROP CONSTRAINT "OscratOrganization_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "OscratProduct" DROP CONSTRAINT "OscratProduct_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OscratReportingOrganization" DROP CONSTRAINT "OscratReportingOrganization_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OscratRepository" DROP CONSTRAINT "OscratRepository_organizationId_fkey";

-- DropIndex
DROP INDEX "OscratRepository_organizationId_productId_idx";

-- DropIndex
DROP INDEX "OscratRepository_organizationId_versionId_idx";

-- AlterTable
ALTER TABLE "OscratProduct" DROP COLUMN "organizationId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OscratReportingOrganization" DROP COLUMN "organizationId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OscratRepository" DROP COLUMN "organizationId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "orgRoles" "OscratOrganizationRole"[] DEFAULT ARRAY['MANUFACTURER']::"OscratOrganizationRole"[],
ADD COLUMN     "size" "OscratOrganizationSize" NOT NULL DEFAULT 'STARTUP',
ADD COLUMN     "type" "OscratOrganizationType" NOT NULL DEFAULT 'OTHER';

-- DropTable
DROP TABLE "OscratOrganization";

-- CreateIndex
CREATE INDEX "OscratRepository_teamId_versionId_idx" ON "OscratRepository"("teamId", "versionId");

-- CreateIndex
CREATE INDEX "OscratRepository_teamId_productId_idx" ON "OscratRepository"("teamId", "productId");

-- AddForeignKey
ALTER TABLE "OscratProduct" ADD CONSTRAINT "OscratProduct_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratReportingOrganization" ADD CONSTRAINT "OscratReportingOrganization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratRepository" ADD CONSTRAINT "OscratRepository_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
