import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isTheoryFreeForAll } from './theory-free-for-all.util';

export type TheoryLessonType = 'text' | 'photo' | 'video';

const LESSON_TYPE_WHERE: Record<TheoryLessonType, Prisma.TheoryQuestionWhereInput> = {
  text: { mediaFileName: null },
  photo: { mediaType: 'photo' },
  video: { mediaType: 'video' },
};

@Injectable()
export class TheoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getRandomQuestionByType(type: TheoryLessonType, category: string | undefined, isPremiumUser: boolean) {
    const unlocked = isPremiumUser || isTheoryFreeForAll();
    const where: Prisma.TheoryQuestionWhereInput = {
      ...LESSON_TYPE_WHERE[type],
      ...(category ? { category } : {}),
      ...(unlocked ? {} : { isPremium: false }),
    };
    const count = await this.prisma.theoryQuestion.count({ where });
    if (count === 0) return null;
    const [question] = await this.prisma.theoryQuestion.findMany({
      where,
      include: { options: true },
      take: 1,
      skip: Math.floor(Math.random() * count),
    });
    return question;
  }

  async listCategoriesForType(type: TheoryLessonType) {
    const rows = await this.prisma.theoryQuestion.groupBy({
      by: ['category'],
      where: LESSON_TYPE_WHERE[type],
      _count: true,
    });
    return rows
      .map((r) => ({ category: r.category, count: r._count }))
      .sort((a, b) => b.count - a.count);
  }

  async getQuestionWithOptions(id: string) {
    return this.prisma.theoryQuestion.findUnique({
      where: { id },
      include: { options: true },
    });
  }

  async cacheTelegramFileId(id: string, telegramFileId: string) {
    await this.prisma.theoryQuestion.update({
      where: { id },
      data: { telegramFileId },
    });
  }
}
