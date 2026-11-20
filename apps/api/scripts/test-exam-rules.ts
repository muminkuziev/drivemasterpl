/**
 * Imtihon tanlash/ball mantig'ini rasmiy katalog bilan sinaydi:
 *   npx ts-node scripts/test-exam-rules.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  computeResult,
  EXAM_MAX_SCORE,
  EXAM_PASS_SCORE,
  planAdvance,
  questionTiming,
  selectExamQuestions,
} from '../src/exam/exam-rules';

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'prisma', 'official-catalog-b.json'), 'utf8'),
) as { number: number; scope: string; points: number }[];
const pool = catalog.map((c) => ({ id: String(c.number), scope: c.scope, points: c.points }));

let failures = 0;
const check = (name: string, ok: boolean) => {
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
};

for (let run = 0; run < 200; run++) {
  const sel = selectExamQuestions(pool);
  const ids = new Set(sel.map((s) => s.questionId));
  const basic = sel.filter((s) => s.scope === 'basic');
  const spec = sel.filter((s) => s.scope === 'specialist');
  const sum = sel.reduce((s, i) => s + i.points, 0);
  const ordered = sel.every((s, i) => s.position === i + 1) && sel.slice(0, 20).every((s) => s.scope === 'basic');
  const cnt = (arr: typeof sel, p: number) => arr.filter((s) => s.points === p).length;
  if (
    sel.length !== 32 || ids.size !== 32 || basic.length !== 20 || spec.length !== 12 || sum !== EXAM_MAX_SCORE ||
    !ordered || cnt(basic, 3) !== 10 || cnt(basic, 2) !== 6 || cnt(basic, 1) !== 4 ||
    cnt(spec, 3) !== 6 || cnt(spec, 2) !== 4 || cnt(spec, 1) !== 2
  ) {
    check(`run ${run} composition`, false);
    break;
  }
}
check('200 random exams: 32 q, 20+12, 74 pts, correct point mix, unique, basic first', failures === 0);

const sel = selectExamQuestions(pool);
const all = sel.map((s) => ({ points: s.points, isCorrect: true as boolean | null }));
check('all correct = 74 pass', computeResult(all).score === 74 && computeResult(all).passed);
// bitta 3 ballik xato => 71 => o'tadi; 3 ta 3 ballik xato => 65 => yiqiladi
const threes = all.map((x, i) => ({ ...x, i })).filter((x) => x.points === 3);
const one = all.map((x) => ({ ...x }));
one[threes[0].i].isCorrect = false;
check('one 3-pt miss = 71 pass', computeResult(one).score === 71 && computeResult(one).passed);
const two = one.map((x) => ({ ...x }));
two[threes[1].i].isCorrect = false;
check('two 3-pt misses = 68 pass (boundary)', computeResult(two).score === EXAM_PASS_SCORE && computeResult(two).passed);
const three = two.map((x) => ({ ...x }));
three[threes[2].i].isCorrect = false;
check('three 3-pt misses = 65 fail', computeResult(three).score === 65 && !computeResult(three).passed);
check('unanswered (null) = 0', computeResult(all.map((x) => ({ ...x, isCorrect: null }))).score === 0);

let threw = false;
try {
  selectExamQuestions(pool.filter((p) => p.scope !== 'specialist'));
} catch {
  threw = true;
}
check('insufficient pool throws', threw);

// ---- savol-ma'-savol vaqt ----
const tb = questionTiming('basic', null);
const tv = questionTiming('basic', 'video');
const ts = questionTiming('specialist', null);
check('basic text: 20s read + 15s answer', tb.readMs === 20000 && tb.answerMs === 15000 && tb.totalMs === 35000);
check('basic video: +10s film once', tv.videoMs === 10000 && tv.totalMs === 45000);
check('specialist: 50s total, no read lock', ts.readMs === 0 && ts.totalMs === 50000);

const W = [35000, 35000, 50000];
const T0 = 1_000_000;
let p = planAdvance(T0 + 10_000, 1, T0, W);
check('mid-window: nothing locked', p.locks.length === 0 && p.position === 1 && !p.done);
p = planAdvance(T0 + 35_000 + 4_000, 1, T0, W);
check('within grace: still current', p.locks.length === 0 && p.position === 1);
p = planAdvance(T0 + 35_000 + 6_000, 1, T0, W);
check('past grace: q1 locked, q2 starts at q1 end', p.locks.length === 1 && p.position === 2 && p.startedAtMs === T0 + 35_000);
p = planAdvance(T0 + 200_000, 1, T0, W);
check('away long: all locked, done', p.locks.length === 3 && p.done && p.position === 4);
check('total of max windows fits 25 min', 20 * 45_000 + 12 * 50_000 <= 25 * 60_000 + 60_000);

console.log(failures === 0 ? 'ALL OK' : `${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
