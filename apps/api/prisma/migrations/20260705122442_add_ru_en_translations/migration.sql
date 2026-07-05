-- AlterTable
ALTER TABLE "road_signs" ADD COLUMN     "actionEn" TEXT,
ADD COLUMN     "actionRu" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "nameRu" TEXT;

-- AlterTable
ALTER TABLE "theory_options" ADD COLUMN     "textEn" TEXT,
ADD COLUMN     "textRu" TEXT;

-- AlterTable
ALTER TABLE "theory_questions" ADD COLUMN     "textEn" TEXT,
ADD COLUMN     "textRu" TEXT;
