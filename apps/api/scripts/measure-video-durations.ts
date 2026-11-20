/**
 * Video savollarning real davomiyligini (mp4 sarlavhasidan) o'lchab TheoryQuestion.mediaDurationMs ga yozadi.
 * Imtihon vaqti shunga moslashadi. Media fayllar bor joyda (prod serverda) ishga tushiring.
 *
 *   DRY_RUN=1 DATABASE_URL=... [MEDIA_ROOT=...] npx ts-node scripts/measure-video-durations.ts
 *   DATABASE_URL=... [MEDIA_ROOT=...] npx ts-node scripts/measure-video-durations.ts
 *
 * Env: FORCE=1 — allaqachon o'lchanganlarni ham qayta o'lchaydi.
 */
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import { join } from 'path';
import { THEORY_MEDIA_DIR } from '../src/content/theory-media-dir.util';
import { readMp4DurationMs } from '../src/content/mp4-duration';

const prisma = new PrismaClient();
const DRY = process.env.DRY_RUN === '1';
const FORCE = process.env.FORCE === '1';

async function main() {
  const rows = await prisma.theoryQuestion.findMany({
    where: { mediaType: 'video', mediaFileName: { not: null }, ...(FORCE ? {} : { mediaDurationMs: null }) },
    select: { id: true, mediaFileName: true },
  });
  console.log(`Media dir: ${THEORY_MEDIA_DIR}  |  to measure: ${rows.length}`);

  const durations: number[] = [];
  let missingFile = 0;
  let unreadable = 0;
  for (const r of rows) {
    const file = join(THEORY_MEDIA_DIR, r.mediaFileName!);
    if (!existsSync(file)) {
      missingFile++;
      continue;
    }
    const ms = readMp4DurationMs(file);
    if (!ms) {
      unreadable++;
      console.log('unreadable:', r.mediaFileName);
      continue;
    }
    durations.push(ms);
    if (!DRY) await prisma.theoryQuestion.update({ where: { id: r.id }, data: { mediaDurationMs: ms } });
  }

  durations.sort((a, b) => a - b);
  const pick = (p: number) => durations[Math.min(durations.length - 1, Math.floor(durations.length * p))];
  console.log(
    JSON.stringify(
      {
        measured: durations.length,
        missingFile,
        unreadable,
        minMs: durations[0],
        medianMs: pick(0.5),
        p90Ms: pick(0.9),
        maxMs: durations[durations.length - 1],
      },
      null,
      2,
    ),
  );
  if (DRY) console.log('DRY_RUN=1 - nothing written.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
