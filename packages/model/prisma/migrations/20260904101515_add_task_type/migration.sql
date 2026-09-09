-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GENERIC', 'TRAINING', 'VULNERABILITY', 'INCIDENT', 'SBOM', 'DOCUMENTATION', 'RISK', 'CONFIGURATION_MANAGEMENT', 'REQUIREMENTS');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "taskType" "TaskType" NOT NULL DEFAULT 'GENERIC';

-- Backfill from the legacy JSON-property markers
UPDATE "Task" SET "taskType" = 'TRAINING' WHERE "properties"->>'task_type' = 'TRAINING';
UPDATE "Task" SET "taskType" = 'CONFIGURATION_MANAGEMENT' WHERE "properties"->>'configuration_rule_id' IS NOT NULL;
UPDATE "Task" SET "taskType" = 'RISK' WHERE "properties"->>'enableRiskAssessment' = 'true' AND "taskType" = 'GENERIC';

-- Both markers are superseded: task_type by the taskType column, and
-- enableRiskAssessment because the risk section is now driven by taskType = RISK.
UPDATE "Task" SET "properties" = "properties" - 'task_type' - 'enableRiskAssessment'
WHERE "properties" ? 'task_type' OR "properties" ? 'enableRiskAssessment';
