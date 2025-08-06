/*
  Warnings:

  - You are about to drop the column `defaultBranch` on the `OscratRepository` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `OscratRepository` table. All the data in the column will be lost.
  - Added the required column `user` to the `OscratRepository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OscratRepository" DROP COLUMN "defaultBranch",
DROP COLUMN "owner",
ADD COLUMN     "user" TEXT NOT NULL;
