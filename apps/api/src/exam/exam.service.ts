import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { join } from 'path';
import { isTheoryFreeForAll } from '../content/theory-free-for-all.util';
import { THEORY_MEDIA_DIR } from '../content/theory-media-dir.util';
import { readMp4DurationMs } from '../content/mp4-duration';
import {
  EXAM_DURATION_MS,
  EXAM_MAX_SCORE,
  EXAM_PASS_SCORE,
  computeResult,
  planAdvance,
  questionTiming,
  selectExamQuestions,
} from './exam-rules';

const OPTION_ORDER = (a: { textPl: string }, b: { textPl: string }) => {
  const rank = (t: string) => (t === 'Tak' ? 0 : t === 'Nie' ? 1 : 2);
  return rank(a.textPl) - rank(b.textPl);
};

const PRACTICE_SESSION_MS = 12 * 60 * 60 * 1000;

type LoadedAttempt = NonNullable<Awaited<ReturnType<ExamService['loadAttempt']>>>;

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async loadAttempt(id: string) {
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

  /**
   * Vaqt bo'yicha holatni yangilaydi: umumiy 25 daqiqa tugagan bo'lsa yakunlaydi,
   * aks holda vaqti o'tgan savollarni qulflab, keyingisiga o'tkazadi.
   */
  private async advance(attemptId: string): Promise<LoadedAttempt> {
    let attempt = (await this.loadAttempt(attemptId))!;
    if (attempt.finishedAt) return attempt;
    if (attempt.mode === 'practice') return attempt; // mashq rejimida vaqt bo'yicha qulflash yo'q
    const now = Date.now();
    if (now > attempt.expiresAt.getTime()) {
      await this.finalize(attemptId);
      return (await this.loadAttempt(attemptId))!;
    }
    const startedMs = (attempt.questionStartedAt ?? attempt.startedAt).getTime();
    const windows = attempt.questions.map((q) => questionTiming(q.scope, q.question.mediaType, q.question.mediaDurationMs).totalMs);
    const plan = planAdvance(now, attempt.currentPosition, startedMs, windows);
    if (plan.locks.length === 0) return attempt;

    for (const l of plan.locks) {
      const aq = attempt.questions.find((q) => q.position === l.position)!;
      await this.prisma.examAttemptQuestion.update({
        where: { id: aq.id },
        data: { lockedAt: new Date(l.lockedAtMs) },
      });
    }
    if (plan.done) {
      await this.finalize(attemptId);
    } else {
      await this.prisma.examAttempt.update({
        where: { id: attemptId },
        data: { currentPosition: plan.position, questionStartedAt: new Date(plan.startedAtMs) },
      });
    }
    attempt = (await this.loadAttempt(attemptId))!;
    return attempt;
  }

  async start(telegramId: string, mode: 'exam' | 'practice' = 'exam') {
    const user = await this.users.findOrCreateByTelegramId(telegramId);
    if (!user.isPremium && !isTheoryFreeForAll()) {
      throw new ForbiddenException({ code: 'premium_required', message: 'Imtihon rejimi Premium uchun' });
    }

    const open = await this.prisma.examAttempt.findFirst({
      where: { userId: user.id, finishedAt: null, mode },
      orderBy: { startedAt: 'desc' },
    });
    if (open) {
      const updated = await this.advance(open.id);
      if (!updated.finishedAt) return this.state(updated);
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

    await this.ensureDurations(selected.map((s) => s.questionId));

    const now = new Date();
    const attempt = await this.prisma.examAttempt.create({
      data: {
        userId: user.id,
        mode,
        expiresAt: new Date(now.getTime() + (mode === 'practice' ? PRACTICE_SESSION_MS : EXAM_DURATION_MS)),
        currentPosition: 1,
        questionStartedAt: now,
        questions: { create: selected },
      },
    });
    return this.state((await this.loadAttempt(attempt.id))!);
  }

  /** Tanlangan video savollarning o'lchanmagan davomiyligini fayldan o'qib DB'ga keshlaydi (xato bo'lsa — standart 10 s). */
  private async ensureDurations(questionIds: string[]) {
    const missing = await this.prisma.theoryQuestion.findMany({
      where: { id: { in: questionIds }, mediaType: 'video', mediaDurationMs: null, mediaFileName: { not: null } },
      select: { id: true, mediaFileName: true },
    });
    for (const q of missing) {
      const ms = readMp4DurationMs(join(THEORY_MEDIA_DIR, q.mediaFileName!));
      if (ms) await this.prisma.theoryQuestion.update({ where: { id: q.id }, data: { mediaDurationMs: ms } });
    }
  }

  private mapOptions(options: LoadedAttempt['questions'][number]['question']['options'], withCorrect: boolean) {
    return options
      .slice()
      .sort(OPTION_ORDER)
      .map((o) => ({
        id: o.id,
        textPl: o.textPl,
        textUz: o.textUz,
        textRu: o.textRu,
        textEn: o.textEn,
        textUk: o.textUk,
        ...(withCorrect ? { isCorrect: o.isCorrect } : {}),
      }));
  }

  private mapQuestion(aq: LoadedAttempt['questions'][number], withCorrect: boolean) {
    const q = aq.question;
    return {
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
      options: this.mapOptions(q.options, withCorrect),
      ...(withCorrect ? { isCorrect: aq.isCorrect } : {}),
    };
  }

  /**
   * Imtihon davomida faqat JORIY savol qaytariladi (to'g'ri javobsiz). Tugagach — hamma savollar tahlil bilan.
   */
  state(attempt: LoadedAttempt) {
    const finished = !!attempt.finishedAt;
    const practice = attempt.mode === 'practice';
    const common = {
      id: attempt.id,
      mode: attempt.mode,
      finished,
      total: attempt.questions.length,
      expiresAt: attempt.expiresAt.toISOString(),
      remainingMs: finished || practice ? 0 : Math.max(0, attempt.expiresAt.getTime() - Date.now()),
      maxScore: EXAM_MAX_SCORE,
      passScore: EXAM_PASS_SCORE,
      result: finished ? { score: attempt.score, passed: attempt.passed, maxScore: EXAM_MAX_SCORE } : null,
    };
    if (finished) {
      return { ...common, current: null, questions: attempt.questions.map((aq) => this.mapQuestion(aq, true)) };
    }
    const cur = attempt.questions.find((q) => q.position === attempt.currentPosition)!;
    const startedMs = (attempt.questionStartedAt ?? attempt.startedAt).getTime();
    return {
      ...common,
      current: {
        ...this.mapQuestion(cur, false),
        // Mashq rejimi: javob berilgach to'g'ri variant va natija ko'rsatiladi
        ...(practice && cur.selectedOptionId
          ? {
              correctOptionId: cur.question.options.find((o) => o.isCorrect)?.id ?? null,
              isCorrect: cur.isCorrect,
            }
          : {}),
        timing: questionTiming(cur.scope, cur.question.mediaType, cur.question.mediaDurationMs),
        elapsedMs: Math.max(0, Date.now() - startedMs),
      },
      questions: null,
    };
  }

  async getForUser(telegramId: string, attemptId: string) {
    await this.ownedAttempt(telegramId, attemptId);
    return this.state(await this.advance(attemptId));
  }

  /** Joriy savolga variant tanlash (tasdiqlanmaguncha o'zgartirish mumkin). */
  async answer(telegramId: string, attemptId: string, questionId: string, optionId: string) {
    await this.ownedAttempt(telegramId, attemptId);
    const attempt = await this.advance(attemptId);
    if (attempt.finishedAt) throw new BadRequestException({ code: 'finished', message: 'Imtihon tugagan' });
    const aq = attempt.questions.find((x) => x.position === attempt.currentPosition)!;
    if (aq.questionId !== questionId) {
      throw new BadRequestException({ code: 'expired', message: 'Bu savolning vaqti tugagan' });
    }
    const option = aq.question.options.find((o) => o.id === optionId);
    if (!option) throw new BadRequestException('Variant bu savolga tegishli emas');
    if (attempt.mode === 'practice') {
      // Birinchi javob qulflanadi, natija darhol qaytariladi
      const correctOptionId = aq.question.options.find((o) => o.isCorrect)?.id ?? null;
      if (aq.selectedOptionId) {
        return { ok: true, isCorrect: aq.isCorrect, correctOptionId, selectedOptionId: aq.selectedOptionId };
      }
      await this.prisma.examAttemptQuestion.update({
        where: { id: aq.id },
        data: { selectedOptionId: optionId, isCorrect: option.isCorrect, answeredAt: new Date() },
      });
      return { ok: true, isCorrect: option.isCorrect, correctOptionId, selectedOptionId: optionId };
    }
    const timing = questionTiming(aq.scope, aq.question.mediaType, aq.question.mediaDurationMs);
    const elapsed = Date.now() - (attempt.questionStartedAt ?? attempt.startedAt).getTime();
    if (elapsed < timing.readMs + timing.videoMs - 1000) {
      throw new BadRequestException({ code: 'too_early', message: "Hali o'qish vaqti" });
    }
    await this.prisma.examAttemptQuestion.update({
      where: { id: aq.id },
      data: { selectedOptionId: optionId, isCorrect: option.isCorrect, answeredAt: new Date() },
    });
    return { ok: true };
  }

  /** Joriy savolni tasdiqlab keyingisiga o'tadi (orqaga qaytish yo'q). Idempotent. */
  async confirm(telegramId: string, attemptId: string, questionId: string) {
    await this.ownedAttempt(telegramId, attemptId);
    const attempt = await this.advance(attemptId);
    if (attempt.finishedAt) return this.state(attempt);
    const aq = attempt.questions.find((x) => x.position === attempt.currentPosition)!;
    if (aq.questionId !== questionId) return this.state(attempt); // allaqachon o'tilgan
    await this.prisma.examAttemptQuestion.update({ where: { id: aq.id }, data: { lockedAt: new Date() } });
    if (aq.position >= attempt.questions.length) {
      await this.finalize(attemptId);
    } else {
      await this.prisma.examAttempt.update({
        where: { id: attemptId },
        data: { currentPosition: aq.position + 1, questionStartedAt: new Date() },
      });
    }
    return this.state((await this.loadAttempt(attemptId))!);
  }

  /** Imtihonni muddatidan oldin yakunlash (qolgan savollar 0 ball). */
  async finish(telegramId: string, attemptId: string) {
    await this.ownedAttempt(telegramId, attemptId);
    const attempt = await this.advance(attemptId);
    if (!attempt.finishedAt) await this.finalize(attemptId);
    return this.state((await this.loadAttempt(attemptId))!);
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
      select: { id: true, startedAt: true, score: true, passed: true, maxScore: true, mode: true },
    });
    return rows.map((r) => ({ ...r, startedAt: r.startedAt.toISOString() }));
  }
}
