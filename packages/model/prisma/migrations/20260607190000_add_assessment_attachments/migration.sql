-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "assessmentId" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_assessmentId_idx" ON "Attachment"("assessmentId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "OscratAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
