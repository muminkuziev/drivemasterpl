-- CreateTable
CREATE TABLE "road_signs" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT NOT NULL,
    "namePl" TEXT,
    "nameUz" TEXT NOT NULL,
    "descriptionUz" TEXT,
    "imageFileName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "road_signs_pkey" PRIMARY KEY ("id")
);
