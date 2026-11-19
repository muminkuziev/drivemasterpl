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

export function computeResult(items: { points: number; isCorrect: boolean | null }[]) {
  const score = items.reduce((s, i) => s + (i.isCorrect ? i.points : 0), 0);
  return { score, maxScore: EXAM_MAX_SCORE, passed: score >= EXAM_PASS_SCORE };
}
