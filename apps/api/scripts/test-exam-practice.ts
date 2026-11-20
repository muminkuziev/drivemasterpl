/**
 * Mashq / imtihon rejimi servis testi (bazasiz: xotiradagi soxta Prisma).
 * Ishga tushirish: npx ts-node scripts/test-exam-practice.ts
 */
import { ExamService } from '../src/exam/exam.service';

let failed = 0;
function ok(cond: unknown, msg: string) {
  if (!cond) {
    failed++;
    console.error('FAIL:', msg);
  }
}
async function rejects(p: Promise<unknown>, code: string, msg: string) {
  try {
    await p;
    ok(false, `${msg}: xato kutilgandi`);
  } catch (e: any) {
    const c = e?.response?.code ?? e?.message;
    ok(c === code, `${msg}: kutilgan ${code}, keldi ${c}`);
  }
}

// ---- soxta ma'lumotlar ----
const questions = new Map<string, any>();
const mk = (scope: 'basic' | 'specialist', points: number, i: number) => {
  const id = `q-${scope}-${points}-${i}`;
  const names = scope === 'basic' ? ['Tak', 'Nie'] : ['A', 'B', 'C'];
  const correct = i % names.length;
  questions.set(id, {
    id,
    textPl: id,
    textUz: id,
    textRu: null,
    textEn: null,
    textUk: null,
    mediaType: null,
    mediaFileName: null,
    mediaDurationMs: null,
    options: names.map((n, k) => ({ id: `${id}-o${k}`, textPl: n, textUz: n, textRu: null, textEn: null, textUk: null, isCorrect: k === correct })),
  });
  return { id, scope, points };
};
const pool: any[] = [];
for (const sc of ['basic', 'specialist'] as const) for (const p of [1, 2, 3]) for (let i = 0; i < 15; i++) pool.push(mk(sc, p, i));

const attempts = new Map<string, any>();
const aqs = new Map<string, any>();
let seq = 0;
const load = (id: string) => {
  const a = attempts.get(id);
  if (!a) return null;
  const list = [...aqs.values()].filter((x) => x.attemptId === id).sort((x, y) => x.position - y.position);
  return { ...a, questions: list.map((x) => ({ ...x, question: questions.get(x.questionId) })) };
};
const prisma: any = {
  theoryQuestion: {
    findMany: async (args: any) => (args.where?.isActive ? pool.map((p) => ({ id: p.id, scope: p.scope, points: p.points })) : []),
    update: async () => ({}),
  },
  examAttempt: {
    findFirst: async (args: any) => {
      const w = args.where;
      const found = [...attempts.values()].filter((a) => a.userId === w.userId && (w.finishedAt === null ? !a.finishedAt : true) && (!w.mode || a.mode === w.mode));
      return found[0] ?? null;
    },
    findUnique: async (args: any) => load(args.where.id),
    findMany: async () => [],
    create: async (args: any) => {
      const id = `att-${++seq}`;
      const d = args.data;
      attempts.set(id, { id, userId: d.userId, mode: d.mode ?? 'exam', startedAt: new Date(), expiresAt: d.expiresAt, finishedAt: null, score: null, maxScore: 74, passed: null, currentPosition: d.currentPosition, questionStartedAt: d.questionStartedAt });
      for (const s of d.questions.create) {
        const aid = `aq-${++seq}`;
        aqs.set(aid, { id: aid, attemptId: id, questionId: s.questionId, position: s.position, scope: s.scope, points: s.points, selectedOptionId: null, isCorrect: null, answeredAt: null, lockedAt: null });
      }
      return attempts.get(id);
    },
    update: async (args: any) => Object.assign(attempts.get(args.where.id), args.data),
    updateMany: async (args: any) => {
      const a = attempts.get(args.where.id);
      if (a && !a.finishedAt) Object.assign(a, args.data);
      return { count: 1 };
    },
  },
  examAttemptQuestion: {
    update: async (args: any) => Object.assign(aqs.get(args.where.id), args.data),
    findMany: async (args: any) => [...aqs.values()].filter((x) => x.attemptId === args.where.attemptId),
  },
};
const users: any = { findOrCreateByTelegramId: async (t: string) => ({ id: `u-${t}`, isPremium: true }) };

(async () => {
  const svc = new ExamService(prisma, users);

  // ===== MASHQ rejimi =====
  const p0 = await svc.start('t1', 'practice');
  ok(p0.mode === 'practice', 'practice: mode');
  ok(p0.total === 32, 'practice: 32 savol');
  ok(p0.remainingMs === 0, 'practice: umumiy vaqt yo\'q');
  const cur0: any = p0.current;
  ok(cur0 && cur0.position === 1, 'practice: 1-savol');
  ok(cur0.options.every((o: any) => o.isCorrect === undefined), 'practice: javobdan oldin isCorrect yashirin');
  ok(cur0.correctOptionId === undefined, 'practice: javobdan oldin correctOptionId yo\'q');

  // vaqt bosimisiz: darhol javob berish mumkin (too_early yo'q), orqaga surilgan vaqt bilan ham o'tib ketmaydi
  attempts.get(p0.id).questionStartedAt = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const again: any = await svc.getForUser('t1', p0.id);
  ok(again.current.position === 1, 'practice: 3 soatdan keyin ham 1-savolda (qulflanmaydi)');

  const q1 = questions.get(cur0.id);
  const wrong = q1.options.find((o: any) => !o.isCorrect);
  const right = q1.options.find((o: any) => o.isCorrect);
  const r1: any = await svc.answer('t1', p0.id, cur0.id, wrong.id);
  ok(r1.ok && r1.isCorrect === false, 'practice: xato javob isCorrect=false');
  ok(r1.correctOptionId === right.id, 'practice: to\'g\'ri variant qaytdi');
  const r1b: any = await svc.answer('t1', p0.id, cur0.id, right.id);
  ok(r1b.selectedOptionId === wrong.id && r1b.isCorrect === false, 'practice: birinchi javob qulflangan');

  const st: any = await svc.getForUser('t1', p0.id);
  ok(st.current.correctOptionId === right.id, 'practice: qayta ochilganda feedback saqlanadi');
  ok(st.current.selectedOptionId === wrong.id, 'practice: tanlangan javob saqlanadi');

  // hammasini o'tish: 1-savol xato, qolganlari to'g'ri
  let s: any = await svc.confirm('t1', p0.id, cur0.id);
  let n = 1;
  while (!s.finished) {
    const c = s.current;
    const qq = questions.get(c.id);
    await svc.answer('t1', p0.id, c.id, qq.options.find((o: any) => o.isCorrect).id);
    s = await svc.confirm('t1', p0.id, c.id);
    n++;
    if (n > 40) break;
  }
  ok(n === 32, `practice: 32 savol o'tildi (${n})`);
  ok(s.finished && s.questions.length === 32, 'practice: tugagach tahlil');
  const total = [...aqs.values()].filter((x) => x.attemptId === p0.id).reduce((a, x) => a + x.points, 0);
  const firstPts = [...aqs.values()].find((x) => x.attemptId === p0.id && x.position === 1).points;
  ok(s.result.score === total - firstPts, `practice: ball = ${total - firstPts}, keldi ${s.result.score}`);

  // ===== IMTIHON rejimi o'zgarmagan =====
  const e0: any = await svc.start('t2', 'exam');
  ok(e0.mode === 'exam', 'exam: mode');
  ok(e0.remainingMs > 24 * 60 * 1000, 'exam: 25 daqiqalik umumiy vaqt');
  ok(e0.current.options.every((o: any) => o.isCorrect === undefined), 'exam: isCorrect yashirin');
  await rejects(svc.answer('t2', e0.id, e0.current.id, e0.current.options[0].id), 'too_early', 'exam: o\'qish vaqtida javob');
  const eAns = (await svc.getForUser('t2', e0.id)) as any;
  ok(eAns.current.correctOptionId === undefined, 'exam: correctOptionId hech qachon chiqmaydi');

  // exam va practice bir-birini aralashtirmaydi
  const pBoth: any = await svc.start('t2', 'practice');
  ok(pBoth.mode === 'practice' && pBoth.id !== e0.id, 'bitta foydalanuvchida ochiq exam bo\'lsa ham practice alohida');
  const eResume: any = await svc.start('t2', 'exam');
  ok(eResume.id === e0.id, 'exam qayta start qilinsa — ochiq imtihon davom etadi');

  if (failed) {
    console.error(`\n${failed} ta xato`);
    process.exit(1);
  }
  console.log('OK: exam practice tests');
})();
