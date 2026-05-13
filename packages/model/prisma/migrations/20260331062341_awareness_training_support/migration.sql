-- AlterTable: add lastAwarenessTrainingCompletion to TeamMember
ALTER TABLE "TeamMember" ADD COLUMN "lastAwarenessTrainingCompletion" TIMESTAMP(3);

-- AlterTable: add localization ID fields to Task
ALTER TABLE "Task" ADD COLUMN "titleLocId" TEXT,
ADD COLUMN "descriptionLocId" TEXT;
