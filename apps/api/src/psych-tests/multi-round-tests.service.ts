import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type MultiRoundTestType = 'piorkowski' | 'krzyzowy' | 'signal';

interface RoundEntry {
  isCorrect: boolean;
  reactionTimeMs: number;
  [key: string]: unknown;
}

function scoreForType(testType: MultiRoundTestType, rounds: RoundEntry[]): number {
  if (rounds.length === 0) return 0;
  if (testType === 'krzyzowy') {
    const correct = rounds.filter((r) => r.isCorrect).length;
    const accuracy = (correct / rounds.length) * 100;
    const avgMs = rounds.reduce((sum, r) => sum + r.reactionTimeMs, 0) / rounds.length;
    return Math.max(0, accuracy - avgMs / 50);
  }
  // piorkowski va signal: har bir tur uchun ball, keyin o'rtacha
  const perRound = rounds.map((r) => (r.isCorrect ? Math.max(0, 100 - r.reactionTimeMs / 8) : 0));
  return perRound.reduce((sum, s) => sum + s, 0) / perRound.length;
}

@Injectable()
export class MultiRoundTestsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(telegramId: string, testType: MultiRoundTestType, deviceId?: string) {
    const record = await this.prisma.multiRoundTest.create({
      data: { telegramId, testType, deviceId, rounds: [], status: 'running' },
    });
    return { status: 'ok', testId: record.id };
  }

  async addRound(telegramId: string, testType: MultiRoundTestType, round: RoundEntry) {
    const record = await this.prisma.multiRoundTest.findFirst({
      where: { telegramId, testType, status: 'running' },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new BadRequestException('Faol test topilmadi — avval /start chaqiring');
    }
    const rounds = [...(record.rounds as unknown as RoundEntry[]), round];
    await this.prisma.multiRoundTest.update({
      where: { id: record.id },
      data: { rounds: rounds as unknown as Prisma.InputJsonValue },
    });
    return { status: 'ok', roundNumber: rounds.length };
  }

  async finish(telegramId: string, testType: MultiRoundTestType) {
    const record = await this.prisma.multiRoundTest.findFirst({
      where: { telegramId, testType, status: 'running' },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new BadRequestException('Faol test topilmadi');
    }
    const rounds = record.rounds as unknown as RoundEntry[];
    const score = scoreForType(testType, rounds);
    const updated = await this.prisma.multiRoundTest.update({
      where: { id: record.id },
      data: { score, status: 'completed', finishedAt: new Date() },
    });
    return {
      status: 'completed',
      score: updated.score,
      rounds: rounds.length,
      correctRounds: rounds.filter((r) => r.isCorrect).length,
    };
  }

  async last(telegramId: string, testType: MultiRoundTestType) {
    const record = await this.prisma.multiRoundTest.findFirst({
      where: { telegramId, testType },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new NotFoundException('Test topilmadi');
    const rounds = record.rounds as unknown as RoundEntry[];
    return {
      status: record.status,
      score: record.score,
      rounds: rounds.length,
      correctRounds: rounds.filter((r) => r.isCorrect).length,
      date: record.finishedAt ?? record.createdAt,
      deviceId: record.deviceId,
    };
  }
}
