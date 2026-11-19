import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { isTheoryFreeForAll } from '../content/theory-free-for-all.util';
import {
  EXAM_DURATION_MS,
  EXAM_GRACE_MS,
  EXAM_MAX_SCORE,
  EXAM_PASS_SCORE,
  computeResult,
  selectExamQuestions,
} from './exam-rules';

const OPTION_ORDER = (a: { textPl: string }, b: { textPl: string }) => {
  const rank = (t: string) => (t === 'Tak' ? 0 : t === 'Nie' ? 1 : 2);
  return rank(a.textPl) - rank(b.textPl);
};

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  private async loadAttempt(id: string) {
    return this.prisma.examAttempt.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: { question: { include: { options: true } } },
        },
      },
    });
  }

  private async ownedAttempt(telegramId: string, attemptId: string) {
    const user = await this.users.findOrCreateByTelegramId(telegramId);
    const attempt = await this.loadAttempt(attemptId);
    if (!attempt || attempt.userId !== user.id) throw new NotFoundException('Imtihon topilmadi');
    return attempt;
  }

  /** Muddati o'tgan tugallanmagan urinishni yopadi. */
  private async finalizeIfExpired<T extends { id: string; finishedAt: Date | null; expiresAt: Date }>(a: T): Promise<boolean> {
    if (a.finishedAt || Date.now() <= a.expiresAt.getTime()) return false;
    await this.finalize(a.id);
    return true;
  }

  async start(telegramId: string) {
    const user = await this.users.findOrCreateByTelegramId(telegramId);
    if (!user.isPremium && !isTheoryFreeForAll()) {
      throw new ForbiddenException({ code: 'premium_required', message: 'Imtihon rejimi Premium uchun' });
    }

    const open = await this.prisma.examAttempt.findFirst({
      where: { userId: user.id, finishedAt: null },
      orderBy: { startedAt: 'desc' },
    });
    if (open) {
      if (await this.finalizeIfExpired(open)) {
        // eski urinish yopildi — pastda yangisi boshlanadi
      } else {
        return this.state(open.id);
      }
    }

    const pool = await this.prisma.theoryQuestion.findMany({
      where: { isActive: true, officialNumber: { not: null }, scope: { not: null }, points: { not: null } },
      select: { id: true, scope: true, points: true },
    });
    let selected;
    try {
      selected = selectExamQuestions(pool);
    } catch (e) {
      throw new BadRequestException({ code: 'not_enough_questions', message: (e as Error).message });
    }

    const attempt = await this.prisma.examAttempt.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + EXAM_DURATION_MS),
        questions: { create: selected },
      },
    });
    return this.state(attempt.id);
  }

  /** Imtihon davomida to'g'ri javoblarni YASHIRADI. Yakunlangan bo'lsa natija bilan qaytaradi. */
  async state(attemptId: string) {
    const attempt = await this.loadAttempt(attemptId);
    if (!attempt) throw new NotFoundException('Imtihon topilmadi');
    const finished = !!attempt.finishedAt;
    return {
      id: attempt.id,
      finished,
      expiresAt: attempt.expiresAt.toISOString(),
      remainingMs: finished ? 0 : Math.max(0, attempt.expiresAt.getTime() - Date.now()),
      maxScore: EXAM_MAX_SCORE,
      passScore: EXAM_PASS_SCORE,
      result: finished ? { score: attempt.score, passed: attempt.passed, maxScore: EXAM_MAX_SCORE } : null,
      questions: attempt.questions.map((aq) => {
        const q = aq.question;
        const base = {
          id: q.id,
          position: aq.position,
          scope: aq.scope,
          points: aq.points,
          selectedOptionId: aq.selectedOptionId,
          textPl: q.textPl,
          textUz: q.textUz,
          textRu: q.textRu,
          textEn: q.textEn,
          textUk: q.textUk,
          mediaType: q.mediaType,
          imageUrl: q.mediaFileName ? `/api/media/theory/${q.id}` : null,
        };
        const options = q.options
          .slice()
          .sort(OPTION_ORDER)
          .map((o) => ({
            id: o.id,
            textPl: o.textPl,
            textUz: o.textUz,
            textRu: o.textRu,
            textEn: o.textEn,
            textUk: o.textUk,
            ...(finished ? { isCorrect: o.isCorrect } : {}),
          }));
        return finished ? { ...base, isCorrect: aq.isCorrect, options } : { ...base, options };
      }),
    };
  }

  async getForUser(telegramId: string, attemptId: string) {
    const attempt = await this.ownedAttempt(telegramId, attemptId);
    await this.finalizeIfExpired(attempt);
    return this.state(attemptId);
  }

  async answer(telegramId: string, attemptId: string, questionId: string, optionId: string) {
    const attempt = await this.ownedAttempt(telegramId, attemptId);
    if (attempt.finishedAt) throw new BadRequestException({ code: 'finished', message: 'Imtihon tugagan' });
    if (Date.now() > attempt.expiresAt.getTime() + EXAM_GRACE_MS) {
      await this.finalize(attemptId);
      throw new BadRequestException({ code: 'expired', message: 'Vaqt tugadi' });
    }
    const aq = attempt.questions.find((x) => x.questionId === questionId);
    if (!aq) throw new NotFoundException('Savol bu imtihonda yo\'q');
    const option = aq.question.options.find((o) => o.id === optionId);
    if (!option) throw new BadRequestException('Variant bu savolga tegishli emas');
    await this.prisma.examAttemptQuestion.update({
      where: { id: aq.id },
      data: { selectedOptionId: optionId, isCorrect: option.isCorrect, answeredAt: new Date() },
    });
    return { ok: true };
  }

  async finish(telegramId: string, attemptId: string) {
    const attempt = await this.ownedAttempt(telegramId, attemptId);
    if (!attempt.finishedAt) await this.finalize(attemptId);
    return this.state(attemptId);
  }

  private async finalize(attemptId: string) {
    const items = await this.prisma.examAttemptQuestion.findMany({ where: { attemptId } });
    const { score, passed } = computeResult(items);
    await this.prisma.examAttempt.updateMany({
      where: { id: attemptId, finishedAt: null },
      data: { finishedAt: new Date(), score, passed },
    });
  }

  async history(telegramId: string) {
    const user = await this.users.findOrCreateByTelegramId(telegramId);
    const rows = await this.prisma.examAttempt.findMany({
      where: { userId: user.id, finishedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      take: 10,
      select: { id: true, startedAt: true, score: true, passed: true, maxScore: true },
    });
    return rows.map((r) => ({ ...r, startedAt: r.startedAt.toISOString() }));
  }
}
