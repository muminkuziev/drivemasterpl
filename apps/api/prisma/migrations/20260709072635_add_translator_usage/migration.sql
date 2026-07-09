-- AlterTable
ALTER TABLE "users" ADD COLUMN     "translatorDailyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "translatorDailyDate" TEXT,
ADD COLUMN     "translatorFreeUsed" INTEGER NOT NULL DEFAULT 0;
