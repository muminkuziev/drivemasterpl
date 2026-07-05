-- CreateTable
CREATE TABLE "word_centers" (
    "id" TEXT NOT NULL,
    "voivodeship" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "website" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "word_centers_pkey" PRIMARY KEY ("id")
);
