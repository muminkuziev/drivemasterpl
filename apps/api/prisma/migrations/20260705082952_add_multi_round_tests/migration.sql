-- CreateTable
CREATE TABLE "multi_round_tests" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "deviceId" TEXT,
    "testType" TEXT NOT NULL,
    "rounds" JSONB NOT NULL DEFAULT '[]',
    "score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "multi_round_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "multi_round_tests_telegramId_testType_idx" ON "multi_round_tests"("telegramId", "testType");
