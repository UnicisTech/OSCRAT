/*
  Warnings:

  - You are about to drop the column `fileData` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `sbomFileId` on the `SbomReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sbomReportId]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "SbomReport" DROP CONSTRAINT "SbomReport_sbomFileId_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileData",
DROP COLUMN "filename",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "sbomReportId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "versionId" TEXT,
ALTER COLUMN "taskId" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "filename";

-- AlterTable
ALTER TABLE "SbomReport" DROP COLUMN "sbomFileId";

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_fileId_key" ON "Attachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_sbomReportId_key" ON "Attachment"("sbomReportId");

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

-- CreateIndex
CREATE INDEX "Attachment_versionId_idx" ON "Attachment"("versionId");

-- CreateIndex
CREATE INDEX "Attachment_sbomReportId_idx" ON "Attachment"("sbomReportId");

-- CreateIndex
CREATE INDEX "Attachment_name_idx" ON "Attachment"("name");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_sbomReportId_fkey" FOREIGN KEY ("sbomReportId") REFERENCES "SbomReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
