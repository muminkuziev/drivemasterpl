/**
 * Offline test of the matching logic: uses prisma/*-import.json as a fake DB.
 *   npx ts-node scripts/test-official-match.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { buildPlan, DbQuestion, OfficialRow } from './lib/official-match';

const dir = path.join(__dirname, '..', 'prisma');
const catalog: OfficialRow[] = JSON.parse(fs.readFileSync(path.join(dir, 'official-catalog-b.json'), 'utf8'));
const db: DbQuestion[] = [];
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => /^(batch|abc_chunk|pilot-theory|pilot-media)/.test(x) && x.endsWith('.json'))) {
  for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) {
    if (!q || typeof q.textPl !== 'string' || !Array.isArray(q.options)) continue;
    db.push({
      id: `q${n++}`,
      textPl: q.textPl,
      mediaFileName: q.mediaFileName ?? null,
      options: q.options.map((o: any, i: number) => ({ id: `o${n}_${i}`, textPl: o.textPl, isCorrect: !!o.isCorrect })),
    });
  }
}
const { patches, stats } = buildPlan(db, catalog);
const { catalogMissingInDb, ...rest } = stats;
console.log(JSON.stringify({ ...rest, catalogMissingInDbCount: catalogMissingInDb.length }, null, 2));
const activeNumbers = new Set(patches.filter((p) => p.isActive).map((p) => p.officialNumber));
console.log('distinct active official numbers:', activeNumbers.size, 'of active rows:', stats.active);
console.log('option patches:', patches.reduce((s, p) => s + p.options.length, 0));
if (activeNumbers.size !== stats.active) {
  console.error('FAIL: an official number is active more than once');
  process.exit(1);
}
console.log('OK');
