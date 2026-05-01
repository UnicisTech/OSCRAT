DELETE FROM "WorkerJob" WHERE "type" = 'PROCESS_CONFIGURATION_SCAN';

CREATE TYPE "ConfigurationScanFormat" AS ENUM ('ARF', 'XCCDF', 'OVAL');

ALTER TABLE "ConfigurationScanReport"
  ADD COLUMN "format" "ConfigurationScanFormat" NOT NULL,
  ADD COLUMN "formatVersion" TEXT NOT NULL;
