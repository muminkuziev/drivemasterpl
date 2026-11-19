-- AlterTable
ALTER TABLE "theory_questions" ADD COLUMN "officialNumber" INTEGER,
ADD COLUMN "scope" TEXT,
ADD COLUMN "points" INTEGER,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "theory_questions_officialNumber_idx" ON "theory_questions"("officialNumber");
