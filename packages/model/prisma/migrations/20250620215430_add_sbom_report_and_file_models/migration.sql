-- CreateTable
CREATE TABLE "SbomReport" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sbomData" JSONB NOT NULL,
    "sbomFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SbomReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SbomReport_jobId_key" ON "SbomReport"("jobId");

-- AddForeignKey
ALTER TABLE "SbomReport" ADD CONSTRAINT "SbomReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "WorkerJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SbomReport" ADD CONSTRAINT "SbomReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SbomReport" ADD CONSTRAINT "SbomReport_sbomFileId_fkey" FOREIGN KEY ("sbomFileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
