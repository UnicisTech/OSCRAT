/*
  Warnings:

  - Added the required column `teamId` to the `OscratProductVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OscratProductVersion" ADD COLUMN     "teamId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "OscratProductVersion_teamId_id_idx" ON "OscratProductVersion"("teamId", "id");

-- AddForeignKey
ALTER TABLE "OscratProductVersion" ADD CONSTRAINT "OscratProductVersion_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
