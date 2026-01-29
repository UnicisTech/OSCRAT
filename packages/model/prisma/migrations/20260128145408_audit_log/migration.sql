-- CreateEnum
CREATE TYPE "AuditUserType" AS ENUM ('USER', 'API_KEY', 'SYSTEM');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" "AuditUserType" NOT NULL DEFAULT 'USER',
    "userName" TEXT,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "crud" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetName" TEXT,
    "teamId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "versionId" TEXT,
    "versionName" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_teamId_createdAt_idx" ON "AuditLog"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_teamId_action_idx" ON "AuditLog"("teamId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_teamId_targetType_idx" ON "AuditLog"("teamId", "targetType");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_teamId_productId_idx" ON "AuditLog"("teamId", "productId");

-- CreateIndex
CREATE INDEX "AuditLog_teamId_versionId_idx" ON "AuditLog"("teamId", "versionId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
