import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoadSignCategoryKey } from './road-sign-categories';

@Injectable()
export class RoadSignService {
  constructor(private readonly prisma: PrismaService) {}

  async countByCategory() {
    const rows = await this.prisma.roadSign.groupBy({
      by: ['category'],
      _count: true,
    });
    return new Map(rows.map((r) => [r.category, r._count]));
  }

  async listByCategory(category: RoadSignCategoryKey) {
    return this.prisma.roadSign.findMany({
      where: { category },
      orderBy: [{ order: 'asc' }, { code: 'asc' }],
    });
  }

  async getById(id: string) {
    return this.prisma.roadSign.findUnique({ where: { id } });
  }

  async cacheTelegramFileId(id: string, telegramFileId: string) {
    await this.prisma.roadSign.update({ where: { id }, data: { telegramFileId } });
  }
}
