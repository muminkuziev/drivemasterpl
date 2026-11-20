-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "score" INTEGER,
    "maxScore" INTEGER NOT NULL DEFAULT 74,
    "passed" BOOLEAN,
    "currentPosition" INTEGER NOT NULL DEFAULT 1,
    "questionStartedAt" TIMESTAMP(3),

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempt_questions" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "exam_attempt_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_attempts_userId_startedAt_idx" ON "exam_attempts"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_questions_attemptId_position_key" ON "exam_attempt_questions"("attemptId", "position");

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_questions" ADD CONSTRAINT "exam_attempt_questions_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_questions" ADD CONSTRAINT "exam_attempt_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "theory_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
