-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "note" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedByTelegramId" TEXT,
ADD COLUMN     "senderPhone" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "boundDeviceAt" TIMESTAMP(3),
ADD COLUMN     "boundDeviceId" TEXT;
