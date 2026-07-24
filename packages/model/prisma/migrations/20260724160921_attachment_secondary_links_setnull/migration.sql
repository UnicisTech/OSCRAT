-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_incidentId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_vulnerabilityId_fkey";

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "OscratProductIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_vulnerabilityId_fkey" FOREIGN KEY ("vulnerabilityId") REFERENCES "OscratProductVulnerability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

