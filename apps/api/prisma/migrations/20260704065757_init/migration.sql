-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "languageCode" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumSince" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "difficultyScore" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psych_centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "isWarning" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "psych_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "isWarning" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psych_questions" (
    "id" TEXT NOT NULL,
    "textPl" TEXT NOT NULL,
    "textUz" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "psych_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psych_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textPl" TEXT NOT NULL,
    "textUz" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "psych_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theory_questions" (
    "id" TEXT NOT NULL,
    "textPl" TEXT NOT NULL,
    "textUz" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "theory_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theory_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textPl" TEXT NOT NULL,
    "textUz" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "theory_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theory_videos" (
    "id" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "theory_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "status" TEXT NOT NULL,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerRef_key" ON "payments"("providerRef");

-- AddForeignKey
ALTER TABLE "psych_centers" ADD CONSTRAINT "psych_centers_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psych_options" ADD CONSTRAINT "psych_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "psych_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theory_options" ADD CONSTRAINT "theory_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "theory_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
