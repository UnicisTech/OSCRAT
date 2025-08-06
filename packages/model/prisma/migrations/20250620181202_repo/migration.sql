-- CreateEnum
CREATE TYPE "OscratRepositoryProvider" AS ENUM ('GITHUB', 'GITLAB', 'BITBUCKET');

-- CreateEnum
CREATE TYPE "OscratRepositoryAuthType" AS ENUM ('PERSONAL_ACCESS_TOKEN');

-- CreateEnum
CREATE TYPE "WorkerJobType" AS ENUM ('REPO_GENERATE_SBOM');

-- CreateEnum
CREATE TYPE "WorkerJobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "OscratRepository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "OscratRepositoryProvider" NOT NULL,
    "repositoryUrl" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "targetBranch" TEXT,
    "targetTag" TEXT,
    "targetCommit" TEXT,
    "authType" "OscratRepositoryAuthType" NOT NULL DEFAULT 'PERSONAL_ACCESS_TOKEN',
    "accessToken" TEXT,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OscratRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerJob" (
    "id" TEXT NOT NULL,
    "type" "WorkerJobType" NOT NULL,
    "status" "WorkerJobStatus" NOT NULL DEFAULT 'PENDING',
    "triggeredByUserId" TEXT NOT NULL,
    "processStartTime" TIMESTAMP(3),
    "processEndTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "errMessage" TEXT,

    CONSTRAINT "WorkerJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OscratRepository_productId_key" ON "OscratRepository"("productId");

-- CreateIndex
CREATE INDEX "OscratRepository_organizationId_productId_idx" ON "OscratRepository"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "WorkerJob_status_type_idx" ON "WorkerJob"("status", "type");

-- AddForeignKey
ALTER TABLE "OscratRepository" ADD CONSTRAINT "OscratRepository_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "OscratOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratRepository" ADD CONSTRAINT "OscratRepository_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerJob" ADD CONSTRAINT "WorkerJob_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
