import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { THEORY_MEDIA_DIR } from '../content/theory-media-dir.util';
import { ROAD_SIGN_MEDIA_DIR } from '../content/road-sign-media-dir.util';
import { isRoadSignCategoryKey } from '../content/road-sign-categories';

interface OptionInput {
  textPl: string;
  textUz: string;
  isCorrect?: boolean;
}

interface CityInput {
  name: string;
  difficultyScore?: number;
  notes?: string;
}

interface PsychCenterInput {
  name: string;
  cityName: string;
  rating?: number;
  notes?: string;
  isWarning?: boolean;
}

interface InstructorInput {
  name: string;
  cityName: string;
  isWarning?: boolean;
  notes?: string;
}

interface TheoryQuestionInput {
  textPl: string;
  textUz: string;
  category: string;
  isPremium?: boolean;
  mediaFileName?: string;
  mediaType?: 'photo' | 'video';
  options: OptionInput[];
}

interface PsychQuestionInput {
  textPl: string;
  textUz: string;
  order?: number;
  options: OptionInput[];
}

interface TheoryVideoInput {
  titleUz: string;
  videoUrl: string;
  category: string;
  order?: number;
}

interface RoadSignInput {
  code?: string;
  category: string;
  namePl?: string;
  nameUz: string;
  descriptionUz?: string;
  imageFileName?: string;
  order?: number;
}

function assertArray<T>(value: unknown, label: string): T[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestException(`${label} — bo'sh bo'lmagan massiv bo'lishi kerak`);
  }
  return value as T[];
}

@Injectable()
export class ContentImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importCities(items: unknown) {
    const cities = assertArray<CityInput>(items, 'cities');
    let count = 0;
    for (const city of cities) {
      await this.prisma.city.upsert({
        where: { name: city.name },
        update: {
          difficultyScore: city.difficultyScore ?? undefined,
          notes: city.notes,
        },
        create: {
          name: city.name,
          difficultyScore: city.difficultyScore ?? 3,
          notes: city.notes,
        },
      });
      count++;
    }
    return { imported: count };
  }

  async importPsychCenters(items: unknown) {
    const centers = assertArray<PsychCenterInput>(items, 'psychCenters');
    let count = 0;
    for (const center of centers) {
      const city = await this.prisma.city.findUnique({
        where: { name: center.cityName },
      });
      if (!city) {
        throw new BadRequestException(
          `Shahar topilmadi: "${center.cityName}" — avval shaharni import qiling`,
        );
      }
      await this.prisma.psychCenter.create({
        data: {
          name: center.name,
          cityId: city.id,
          rating: center.rating ?? 3,
          notes: center.notes,
          isWarning: center.isWarning ?? false,
        },
      });
      count++;
    }
    return { imported: count };
  }

  async importInstructors(items: unknown) {
    const instructors = assertArray<InstructorInput>(items, 'instructors');
    let count = 0;
    for (const instructor of instructors) {
      const city = await this.prisma.city.findUnique({
        where: { name: instructor.cityName },
      });
      if (!city) {
        throw new BadRequestException(
          `Shahar topilmadi: "${instructor.cityName}" — avval shaharni import qiling`,
        );
      }
      await this.prisma.instructor.create({
        data: {
          name: instructor.name,
          cityId: city.id,
          isWarning: instructor.isWarning ?? false,
          notes: instructor.notes,
        },
      });
      count++;
    }
    return { imported: count };
  }

  async importTheoryQuestions(items: unknown) {
    const questions = assertArray<TheoryQuestionInput>(items, 'theoryQuestions');
    let count = 0;
    for (const q of questions) {
      if (!q.options?.length) {
        throw new BadRequestException(
          `Savolda kamida 1 ta variant (options) bo'lishi kerak: "${q.textUz}"`,
        );
      }
      if (q.mediaFileName && !existsSync(join(THEORY_MEDIA_DIR, q.mediaFileName))) {
        throw new BadRequestException(
          `Media fayl topilmadi: "${q.mediaFileName}" (media/theory papkasida yo'q)`,
        );
      }
      await this.prisma.theoryQuestion.create({
        data: {
          textPl: q.textPl,
          textUz: q.textUz,
          category: q.category,
          isPremium: q.isPremium ?? true,
          mediaFileName: q.mediaFileName,
          mediaType: q.mediaType,
          options: { create: q.options },
        },
      });
      count++;
    }
    return { imported: count };
  }

  async importPsychQuestions(items: unknown) {
    const questions = assertArray<PsychQuestionInput>(items, 'psychQuestions');
    let count = 0;
    for (const q of questions) {
      if (!q.options?.length) {
        throw new BadRequestException(
          `Savolda kamida 1 ta variant (options) bo'lishi kerak: "${q.textUz}"`,
        );
      }
      await this.prisma.psychQuestion.create({
        data: {
          textPl: q.textPl,
          textUz: q.textUz,
          order: q.order ?? 0,
          options: { create: q.options },
        },
      });
      count++;
    }
    return { imported: count };
  }

  async importTheoryVideos(items: unknown) {
    const videos = assertArray<TheoryVideoInput>(items, 'theoryVideos');
    let count = 0;
    for (const v of videos) {
      await this.prisma.theoryVideo.create({
        data: {
          titleUz: v.titleUz,
          videoUrl: v.videoUrl,
          category: v.category,
          order: v.order ?? 0,
        },
      });
      count++;
    }
    return { imported: count };
  }

  async importRoadSigns(items: unknown) {
    const signs = assertArray<RoadSignInput>(items, 'roadSigns');
    let count = 0;
    for (const s of signs) {
      if (!isRoadSignCategoryKey(s.category)) {
        throw new BadRequestException(`Noma'lum toifa: "${s.category}"`);
      }
      if (s.imageFileName && !existsSync(join(ROAD_SIGN_MEDIA_DIR, s.imageFileName))) {
        throw new BadRequestException(
          `Media fayl topilmadi: "${s.imageFileName}" (media/signs papkasida yo'q)`,
        );
      }
      await this.prisma.roadSign.create({
        data: {
          code: s.code,
          category: s.category,
          namePl: s.namePl,
          nameUz: s.nameUz,
          descriptionUz: s.descriptionUz,
          imageFileName: s.imageFileName,
          order: s.order ?? 0,
        },
      });
      count++;
    }
    return { imported: count };
  }
}
