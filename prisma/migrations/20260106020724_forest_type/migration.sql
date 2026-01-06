-- CreateEnum
CREATE TYPE "ForestType" AS ENUM ('natural', 'artificial');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "forestType" "ForestType" NOT NULL DEFAULT 'natural';
