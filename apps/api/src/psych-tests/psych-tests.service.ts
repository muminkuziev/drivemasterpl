import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PsychTestsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Koordinatsiya testi ----------

  async coordinationStart(telegramId: string, deviceId?: string) {
    const pathId = 1 + Math.floor(Math.random() * 5);
    const record = await this.prisma.coordinationTest.create({
      data: { telegramId, deviceId, pathId, status: 'running' },
    });
    return { status: 'ok', pathId, testId: record.id };
  }

  async coordinationMove(telegramId: string, outOfLine: boolean) {
    const record = await this.getLastRunning(this.prisma.coordinationTest, telegramId);
    const outOfLineTime = record.outOfLineTime + (outOfLine ? 0.1 : 0);
    const updated = await this.prisma.coordinationTest.update({
      where: { id: record.id },
      data: { moves: record.moves + 1, outOfLineTime },
    });
    return { status: 'ok', moves: updated.moves, outOfLineTime: updated.outOfLineTime };
  }

  async coordinationFinish(telegramId: string) {
    const record = await this.getLastRunning(this.prisma.coordinationTest, telegramId);
    const coordinationScore = Math.max(0, 100 - record.outOfLineTime * 5);
    const updated = await this.prisma.coordinationTest.update({
      where: { id: record.id },
      data: { coordinationScore, status: 'completed', finishedAt: new Date() },
    });
    return {
      status: 'completed',
      coordinationScore: updated.coordinationScore,
      outOfLineTime: updated.outOfLineTime,
    };
  }

  async coordinationLast(telegramId: string) {
    const record = await this.prisma.coordinationTest.findFirst({
      where: { telegramId },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new NotFoundException("Koordinatsiya testi topilmadi");
    return {
      status: record.status,
      pathId: record.pathId,
      moves: record.moves,
      outOfLineTime: record.outOfLineTime,
      coordinationScore: record.coordinationScore,
      date: record.finishedAt ?? record.createdAt,
      deviceId: record.deviceId,
    };
  }

  // ---------- Diqqat testi ----------

  async attentionStart(telegramId: string, deviceId?: string) {
    const dotPatternId = 1 + Math.floor(Math.random() * 10);
    const record = await this.prisma.attentionTest.create({
      data: { telegramId, deviceId, dotPatternId, status: 'running' },
    });
    return { status: 'ok', patternId: dotPatternId, testId: record.id };
  }

  async attentionClick(telegramId: string, isCorrect: boolean) {
    const record = await this.getLastRunning(this.prisma.attentionTest, telegramId);
    const updated = await this.prisma.attentionTest.update({
      where: { id: record.id },
      data: {
        totalClicks: record.totalClicks + 1,
        correctClicks: record.correctClicks + (isCorrect ? 1 : 0),
      },
    });
    return {
      status: 'ok',
      totalClicks: updated.totalClicks,
      correctClicks: updated.correctClicks,
    };
  }

  async attentionFinish(telegramId: string) {
    const record = await this.getLastRunning(this.prisma.attentionTest, telegramId);
    const accuracyPercent =
      record.totalClicks === 0 ? 0 : (record.correctClicks / record.totalClicks) * 100;
    const mistakes = record.totalClicks - record.correctClicks;
    const updated = await this.prisma.attentionTest.update({
      where: { id: record.id },
      data: { accuracyPercent, mistakes, status: 'completed', finishedAt: new Date() },
    });
    return {
      status: 'completed',
      accuracyPercent: updated.accuracyPercent,
      mistakes: updated.mistakes,
    };
  }

  async attentionLast(telegramId: string) {
    const record = await this.prisma.attentionTest.findFirst({
      where: { telegramId },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new NotFoundException('Diqqat testi topilmadi');
    return {
      status: record.status,
      patternId: record.dotPatternId,
      accuracyPercent: record.accuracyPercent,
      mistakes: record.mistakes,
      totalClicks: record.totalClicks,
      correctClicks: record.correctClicks,
      date: record.finishedAt ?? record.createdAt,
      deviceId: record.deviceId,
    };
  }

  // ---------- Reaksiya testi ----------

  async reactionStart(telegramId: string, deviceId?: string) {
    const randomDelayMs = 500 + Math.floor(Math.random() * 2500);
    const record = await this.prisma.reactionTest.create({
      data: { telegramId, deviceId, randomDelayMs, status: 'waiting' },
    });
    return { status: 'ok', delay: randomDelayMs, testId: record.id };
  }

  async reactionResult(telegramId: string, reactionTimeMs: number, deviceId?: string) {
    const record = await this.prisma.reactionTest.findFirst({
      where: { telegramId, status: 'waiting' },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('Faol reaksiya testi topilmadi');
    const score = Math.max(0, 100 - reactionTimeMs / 10);
    const updated = await this.prisma.reactionTest.update({
      where: { id: record.id },
      data: {
        reactionTimeMs,
        score,
        status: 'completed',
        finishedAt: new Date(),
        deviceId: deviceId ?? record.deviceId,
      },
    });
    return {
      status: 'completed',
      reactionTimeMs: updated.reactionTimeMs,
      score: updated.score,
    };
  }

  async reactionLast(telegramId: string) {
    const record = await this.prisma.reactionTest.findFirst({
      where: { telegramId },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new NotFoundException('Reaksiya testi topilmadi');
    return {
      status: record.status,
      reactionTimeMs: record.reactionTimeMs,
      score: record.score,
      delay: record.randomDelayMs,
      date: record.finishedAt ?? record.createdAt,
      deviceId: record.deviceId,
    };
  }

  // ---------- Yordamchi ----------

  private async getLastRunning<T extends { findFirst: (...args: any[]) => Promise<any> }>(
    model: T,
    telegramId: string,
  ): Promise<any> {
    const record = await model.findFirst({
      where: { telegramId, status: 'running' },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new BadRequestException('Faol test topilmadi — avval /start chaqiring');
    }
    return record;
  }
}
