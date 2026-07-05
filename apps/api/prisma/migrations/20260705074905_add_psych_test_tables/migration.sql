-- CreateTable
CREATE TABLE "coordination_tests" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "deviceId" TEXT,
    "pathId" INTEGER NOT NULL,
    "moves" INTEGER NOT NULL DEFAULT 0,
    "outOfLineTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coordinationScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "coordination_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attention_tests" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "deviceId" TEXT,
    "dotPatternId" INTEGER NOT NULL,
    "correctClicks" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "accuracyPercent" DOUBLE PRECISION,
    "mistakes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "attention_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_tests" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "deviceId" TEXT,
    "randomDelayMs" INTEGER NOT NULL,
    "reactionTimeMs" INTEGER,
    "score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "reaction_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coordination_tests_telegramId_idx" ON "coordination_tests"("telegramId");

-- CreateIndex
CREATE INDEX "attention_tests_telegramId_idx" ON "attention_tests"("telegramId");

-- CreateIndex
CREATE INDEX "reaction_tests_telegramId_idx" ON "reaction_tests"("telegramId");
