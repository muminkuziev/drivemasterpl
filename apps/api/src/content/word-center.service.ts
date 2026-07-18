import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WordCenterService {
  constructor(private readonly prisma: PrismaService) {}

  async countByVoivodeship() {
    const rows = await this.prisma.wordCenter.groupBy({
      by: ['voivodeship'],
      _count: true,
    });
    return new Map(rows.map((r) => [r.voivodeship, r._count]));
  }

  async listByVoivodeship(voivodeship: string) {
    return this.prisma.wordCenter.findMany({
      where: { voivodeship },
      orderBy: { order: 'asc' },
    });
  }
}
