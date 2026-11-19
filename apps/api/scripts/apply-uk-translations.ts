/**
 * Applies the curated Ukrainian translations (prisma/uk-translations.json)
 * to TheoryQuestion / TheoryOption by matching on trimmed textPl.
 *
 * Usage (from apps/api):
 *   DRY_RUN=1 DATABASE_URL=... npx ts-node scripts/apply-uk-translations.ts
 *   DATABASE_URL=... npx ts-node scripts/apply-uk-translations.ts
 *
 * Env:
 *   DRY_RUN=1  - only report, no writes
 *   FORCE=1    - overwrite existing textUk too (default: only rows with textUk = null)
 *   LIMIT=n    - max rows per table
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const DRY = process.env.DRY_RUN === '1';
const FORCE = process.env.FORCE === '1';
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;

const map: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'prisma', 'uk-translations.json'), 'utf8'),
);

type Row = { id: number | string; textPl: string | null };

async function apply(
  label: string,
  find: () => Promise<Row[]>,
  update: (id: any, textUk: string) => Promise<unknown>,
) {
  const rows = await find();
  let matched = 0;
  let missed = 0;
  const unmatched: string[] = [];
  for (const r of rows) {
    const key = (r.textPl ?? '').trim();
    const uk = map[key];
    if (!uk) {
      missed++;
      if (unmatched.length < 20) unmatched.push(key.slice(0, 80));
      continue;
    }
    matched++;
    if (!DRY) await update(r.id, uk);
  }
  console.log(`${label}: rows=${rows.length} matched=${matched} unmatched=${missed}${DRY ? ' (dry run)' : ''}`);
  if (unmatched.length) console.log('  unmatched sample:\n  - ' + unmatched.join('\n  - '));
}

async function main() {
  const where = FORCE ? {} : { textUk: null };
  await apply(
    'questions',
    () => prisma.theoryQuestion.findMany({ where, select: { id: true, textPl: true }, take: LIMIT }) as any,
    (id, textUk) => prisma.theoryQuestion.update({ where: { id }, data: { textUk } }),
  );
  await apply(
    'options',
    () => prisma.theoryOption.findMany({ where, select: { id: true, textPl: true }, take: LIMIT }) as any,
    (id, textUk) => prisma.theoryOption.update({ where: { id }, data: { textUk } }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
