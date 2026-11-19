/**
 * Pure matching logic between our TheoryQuestion rows and the official
 * ministry catalog (prisma/official-catalog-b.json). No DB access here so it
 * can be tested with fake data.
 */

export interface OfficialRow {
  number: number;
  pl: string;
  plOpts: string[];
  correct: 'T' | 'N' | 'A' | 'B' | 'C';
  media: string | null;
  scope: 'basic' | 'specialist';
  points: number;
  en: { q: string; o: string[] };
  uk: { q: string; o: string[] };
}

export interface DbOption {
  id: string;
  textPl: string;
  isCorrect: boolean;
}

export interface DbQuestion {
  id: string;
  textPl: string;
  mediaFileName: string | null;
  options: DbOption[];
}

export interface OptionPatch {
  id: string;
  textEn?: string;
  textUk?: string;
}

export interface QuestionPatch {
  id: string;
  officialNumber: number;
  scope: string;
  points: number;
  isActive: boolean;
  textEn?: string;
  textUk?: string;
  options: OptionPatch[];
}

export interface MatchStats {
  dbTotal: number;
  catalogTotal: number;
  matched: number; // DB rows that found a catalog row
  active: number; // matched rows kept active
  duplicatesDeactivated: number;
  wrongAnswerDeactivated: number; // matched, but no correct-answer agreement
  unmatchedDb: number; // left untouched (stay active, no officialNumber)
  catalogMissingInDb: number[]; // official numbers with no DB row
  ukMissing: number;
}

export const norm = (s: string): string => s.replace(/\s+/g, ' ').trim();
export const stem = (f: string | null | undefined): string =>
  f ? f.replace(/\.[^.]+$/, '').toLowerCase() : '';

export const keyOf = (textPl: string, media: string | null | undefined): string =>
  `${norm(textPl)}||${stem(media)}`;

/** Does the DB question's correct option agree with the official answer? */
export function agreesWithOfficial(q: DbQuestion, row: OfficialRow): boolean {
  const correct = q.options.filter((o) => o.isCorrect);
  if (correct.length !== 1) return false;
  const c = norm(correct[0].textPl);
  if (row.correct === 'T') return c.toLowerCase() === 'tak';
  if (row.correct === 'N') return c.toLowerCase() === 'nie';
  const idx = { A: 0, B: 1, C: 2 }[row.correct];
  const expected = row.plOpts[idx];
  return expected !== undefined && c === norm(expected);
}

function optionPatches(q: DbQuestion, row: OfficialRow): OptionPatch[] {
  if (row.plOpts.length === 0) return []; // Tak/Nie keep their existing translations
  const byText = new Map(row.plOpts.map((t, i) => [norm(t), i]));
  const patches: OptionPatch[] = [];
  for (const o of q.options) {
    const i = byText.get(norm(o.textPl));
    if (i === undefined) continue;
    const textEn = row.en.o[i];
    const textUk = row.uk.o[i];
    if (textEn || textUk) patches.push({ id: o.id, ...(textEn ? { textEn } : {}), ...(textUk ? { textUk } : {}) });
  }
  return patches;
}

export function buildPlan(db: DbQuestion[], catalog: OfficialRow[]): { patches: QuestionPatch[]; stats: MatchStats } {
  const catByKey = new Map<string, OfficialRow>();
  for (const r of catalog) catByKey.set(keyOf(r.pl, r.media), r);

  const groups = new Map<string, DbQuestion[]>();
  let unmatchedDb = 0;
  for (const q of db) {
    const k = keyOf(q.textPl, q.mediaFileName);
    if (!catByKey.has(k)) {
      unmatchedDb++;
      continue;
    }
    const g = groups.get(k);
    if (g) g.push(q);
    else groups.set(k, [q]);
  }

  const patches: QuestionPatch[] = [];
  let active = 0;
  let duplicatesDeactivated = 0;
  let wrongAnswerDeactivated = 0;
  let matched = 0;
  let ukMissing = 0;
  const seen = new Set<string>();

  for (const [k, rows] of groups) {
    const row = catByKey.get(k)!;
    seen.add(k);
    const good = rows.filter((q) => agreesWithOfficial(q, row));
    const winner = good[0];
    for (const q of rows) {
      matched++;
      const isWinner = q === winner;
      if (isWinner) active++;
      else if (good.length > 0) duplicatesDeactivated++;
      else wrongAnswerDeactivated++;
      const patch: QuestionPatch = {
        id: q.id,
        officialNumber: row.number,
        scope: row.scope,
        points: row.points,
        isActive: isWinner,
        options: [],
      };
      if (isWinner) {
        if (row.en.q) patch.textEn = row.en.q;
        if (row.uk.q) patch.textUk = row.uk.q;
        else ukMissing++;
        patch.options = optionPatches(q, row);
      }
      patches.push(patch);
    }
  }

  const catalogMissingInDb = catalog.filter((r) => !seen.has(keyOf(r.pl, r.media))).map((r) => r.number);

  return {
    patches,
    stats: {
      dbTotal: db.length,
      catalogTotal: catalog.length,
      matched,
      active,
      duplicatesDeactivated,
      wrongAnswerDeactivated,
      unmatchedDb,
      catalogMissingInDb,
      ukMissing,
    },
  };
}
