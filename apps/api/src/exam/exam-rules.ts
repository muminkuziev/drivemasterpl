/**
 * Rasmiy B toifa nazariy imtihon qoidalari (pure funksiyalar, DB'siz).
 * 20 asosiy (10x3, 6x2, 4x1) + 12 ixtisoslashgan (6x3, 4x2, 2x1) = 32 savol, 74 ball.
 */
export type ExamScope = 'basic' | 'specialist';

export const EXAM_DURATION_MS = 25 * 60 * 1000;
export const EXAM_GRACE_MS = 5 * 1000; // tarmoq kechikishi uchun
export const EXAM_MAX_SCORE = 74;
export const EXAM_PASS_SCORE = 68;

export const EXAM_PLAN: Record<ExamScope, Record<number, number>> = {
  basic: { 3: 10, 2: 6, 1: 4 },
  specialist: { 3: 6, 2: 4, 1: 2 },
};

export interface PoolItem {
  id: string;
  scope: string | null;
  points: number | null;
}

export interface SelectedItem {
  questionId: string;
  scope: ExamScope;
  points: number;
  position: number;
}

/**
 * Savol boshiga vaqt (rasmiy): asosiy qism — 20 s o'qish, (video bo'lsa ~10 s, bir marta), keyin 15 s javob;
 * ixtisoslashgan qism — o'qish va javob uchun jami 50 s.
 */
export const BASIC_READ_MS = 20_000;
export const BASIC_ANSWER_MS = 15_000;
export const VIDEO_MS = 10_000;
export const SPECIALIST_MS = 50_000;

export interface QuestionTiming {
  readMs: number; // shu vaqtgacha variant tanlab bo'lmaydi (asosiy qism)
  videoMs: number; // video bir marta ko'rsatiladigan oyna
  answerMs: number; // javob oynasi
  totalMs: number;
}

export function questionTiming(scope: string, mediaType: string | null): QuestionTiming {
  if (scope === 'specialist') {
    return { readMs: 0, videoMs: 0, answerMs: SPECIALIST_MS, totalMs: SPECIALIST_MS };
  }
  const videoMs = mediaType === 'video' ? VIDEO_MS : 0;
  return {
    readMs: BASIC_READ_MS,
    videoMs,
    answerMs: BASIC_ANSWER_MS,
    totalMs: BASIC_READ_MS + videoMs + BASIC_ANSWER_MS,
  };
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Havzadan rasmiy tarkibda 32 savol tanlaydi. Yetarli savol bo'lmasa xato tashlaydi. */
export function selectExamQuestions(pool: PoolItem[], rng: () => number = Math.random): SelectedItem[] {
  const out: SelectedItem[] = [];
  let position = 1;
  for (const scope of ['basic', 'specialist'] as ExamScope[]) {
    const picked: Omit<SelectedItem, 'position'>[] = [];
    for (const pts of [3, 2, 1]) {
      const need = EXAM_PLAN[scope][pts];
      const bucket = shuffle(
        pool.filter((p) => p.scope === scope && p.points === pts),
        rng,
      );
      if (bucket.length < need) {
        throw new Error(`Yetarli savol yo'q: ${scope} ${pts} ball (${bucket.length}/${need})`);
      }
      for (const p of bucket.slice(0, need)) picked.push({ questionId: p.id, scope, points: pts });
    }
    for (const p of shuffle(picked, rng)) out.push({ ...p, position: position++ });
  }
  return out;
}

export interface AdvancePlan {
  locks: { position: number; lockedAtMs: number }[];
  position: number; // yangi joriy savol (total+1 bo'lsa — hammasi tugagan)
  startedAtMs: number;
  done: boolean;
}

/**
 * Vaqti o'tib ketgan savollarni ketma-ket yopadi (foydalanuvchi ilovani tark etgan bo'lsa ham).
 * Har bir savolning oynasi tugagach (+grace) u qulflanadi va keyingisi shu paytdan boshlanadi.
 */
export function planAdvance(
  nowMs: number,
  position: number,
  startedAtMs: number,
  windowsMs: number[],
  graceMs: number = EXAM_GRACE_MS,
): AdvancePlan {
  const locks: AdvancePlan['locks'] = [];
  let pos = position;
  let start = startedAtMs;
  while (pos <= windowsMs.length) {
    const end = start + windowsMs[pos - 1];
    if (nowMs <= end + graceMs) break;
    locks.push({ position: pos, lockedAtMs: end });
    pos++;
    start = end;
  }
  return { locks, position: pos, startedAtMs: start, done: pos > windowsMs.length };
}

export function computeResult(items: { points: number; isCorrect: boolean | null }[]) {
  const score = items.reduce((s, i) => s + (i.isCorrect ? i.points : 0), 0);
  return { score, maxScore: EXAM_MAX_SCORE, passed: score >= EXAM_PASS_SCORE };
}
