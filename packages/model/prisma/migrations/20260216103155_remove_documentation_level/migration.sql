-- DropIndex
DROP INDEX "Documentation_teamId_level_idx";

-- AlterTable
ALTER TABLE "Documentation" DROP COLUMN "level";

-- DropEnum
DROP TYPE "DocumentationLevel";
