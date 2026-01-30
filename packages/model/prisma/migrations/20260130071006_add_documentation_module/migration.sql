-- CreateEnum
CREATE TYPE "DocumentationLevel" AS ENUM ('ORGANIZATION', 'PRODUCT');

-- CreateEnum
CREATE TYPE "DocumentationVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "DocumentationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "documentationId" TEXT;

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "level" "DocumentationLevel" NOT NULL,
    "visibility" "DocumentationVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "DocumentationStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "teamId" TEXT NOT NULL,
    "productId" TEXT,
    "versionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationTask" (
    "id" TEXT NOT NULL,
    "documentationId" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentationTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Documentation_teamId_idx" ON "Documentation"("teamId");

-- CreateIndex
CREATE INDEX "Documentation_teamId_level_idx" ON "Documentation"("teamId", "level");

-- CreateIndex
CREATE INDEX "Documentation_teamId_status_idx" ON "Documentation"("teamId", "status");

-- CreateIndex
CREATE INDEX "Documentation_productId_idx" ON "Documentation"("productId");

-- CreateIndex
CREATE INDEX "Documentation_versionId_idx" ON "Documentation"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "Documentation_teamId_slug_key" ON "Documentation"("teamId", "slug");

-- CreateIndex
CREATE INDEX "DocumentationTask_documentationId_idx" ON "DocumentationTask"("documentationId");

-- CreateIndex
CREATE INDEX "DocumentationTask_taskId_idx" ON "DocumentationTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationTask_documentationId_taskId_key" ON "DocumentationTask"("documentationId", "taskId");

-- CreateIndex
CREATE INDEX "Attachment_documentationId_idx" ON "Attachment"("documentationId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "OscratProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentationTask" ADD CONSTRAINT "DocumentationTask_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentationTask" ADD CONSTRAINT "DocumentationTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
