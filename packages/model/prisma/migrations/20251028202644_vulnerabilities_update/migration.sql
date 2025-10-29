/*
  Warnings:

  - The values [OPEN,ACTIVELY_EXPLOITED,PATCHED,MITIGATED,CLOSED,ACCEPTED_RISK] on the enum `OscratProductVulnerabilityStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `dateOfDiscovery` to the `OscratProductVulnerability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OscratProductVulnerabilityStatus_new" AS ENUM ('PENDING', 'PREPARATION', 'RECEIPT', 'VERIFICATION', 'REMEDIATION_DEVELOPMENT', 'RELEASE', 'POST_RELEASE');
ALTER TABLE "OscratProductVulnerability" ALTER COLUMN "status" TYPE "OscratProductVulnerabilityStatus_new" USING ("status"::text::"OscratProductVulnerabilityStatus_new");
ALTER TYPE "OscratProductVulnerabilityStatus" RENAME TO "OscratProductVulnerabilityStatus_old";
ALTER TYPE "OscratProductVulnerabilityStatus_new" RENAME TO "OscratProductVulnerabilityStatus";
DROP TYPE "OscratProductVulnerabilityStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "vulnerabilityId" TEXT;

-- AlterTable
ALTER TABLE "OscratProductVulnerability" ADD COLUMN     "advisoryId" TEXT,
ADD COLUMN     "affectedMemberStates" TEXT[],
ADD COLUMN     "dateOfDiscovery" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Attachment_vulnerabilityId_idx" ON "Attachment"("vulnerabilityId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_vulnerabilityId_fkey" FOREIGN KEY ("vulnerabilityId") REFERENCES "OscratProductVulnerability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
