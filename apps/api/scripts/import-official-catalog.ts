/**
 * Imports the official ministry catalog (prisma/official-catalog-b.json) into
 * TheoryQuestion / TheoryOption:
 *  - sets officialNumber, scope, points
 *  - sets official EN / UK translations (question + ABC options)
 *  - deactivates duplicates and rows whose correct answer disagrees with the
 *    official one (isActive=false; nothing is ever deleted)
 *  - rows without a catalog match are left untouched (still active, no officialNumber)
 * Idempotent: safe to re-run.
 *
 * Usage (from apps/api):
 *   DRY_RUN=1 DATABASE_URL=... npx ts-node scripts/import-official-catalog.ts
 *   DATABASE_URL=... npx ts-node scripts/import-official-catalog.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { buildPlan, OfficialRow } from './lib/official-match';

const prisma = new PrismaClient();
const DRY = process.env.DRY_RUN === '1';

async function main() {
  const catalog: OfficialRow[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'prisma', 'official-catalog-b.json'), 'utf8'),
  );
  const db = await prisma.theoryQuestion.findMany({
    select: {
      id: true,
      textPl: true,
      mediaFileName: true,
      options: { select: { id: true, textPl: true, isCorrect: true } },
    },
  });

  const { patches, stats } = buildPlan(db, catalog);
  const { catalogMissingInDb, ...rest } = stats;
  console.log(JSON.stringify({ ...rest, catalogMissingInDbCount: catalogMissingInDb.length }, null, 2));
  console.log('Official numbers missing in DB (first 60):', catalogMissingInDb.slice(0, 60).join(', '));

  if (DRY) {
    console.log('DRY_RUN=1 - no writes.');
    return;
  }

  const CHUNK = 40;
  for (let i = 0; i < patches.length; i += CHUNK) {
    const ops = patches.slice(i, i + CHUNK).flatMap((p) => [
      prisma.theoryQuestion.update({
        where: { id: p.id },
        data: {
          officialNumber: p.officialNumber,
          scope: p.scope,
          points: p.points,
          isActive: p.isActive,
          ...(p.textEn ? { textEn: p.textEn } : {}),
          ...(p.textUk ? { textUk: p.textUk } : {}),
        },
      }),
      ...p.options.map((o) =>
        prisma.theoryOption.update({
          where: { id: o.id },
          data: { ...(o.textEn ? { textEn: o.textEn } : {}), ...(o.textUk ? { textUk: o.textUk } : {}) },
        }),
      ),
    ]);
    await prisma.$transaction(ops);
    process.stdout.write(`\r${Math.min(i + CHUNK, patches.length)}/${patches.length}`);
  }
  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
