/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `theory_questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "theory_questions" DROP COLUMN "imageUrl",
ADD COLUMN     "mediaFileName" TEXT,
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "telegramFileId" TEXT;
