/**
 * Teoriya savollari va variantlarini ukrain tiliga tarjima qiladi (polyakcha asl matndan).
 * Faqat textUk bo'sh bo'lganlarini to'ldiradi — to'xtatib qayta ishga tushirish xavfsiz.
 *
 * Ishga tushirish (apps/api ichida):
 *   DATABASE_URL=... OPENAI_API_KEY=... npx ts-node scripts/translate-uk.ts
 * Sinash uchun:  LIMIT=20 npx ts-node scripts/translate-uk.ts
 * Faqat ko'rish (bazaga yozmasdan):  DRY_RUN=1 ...
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MODEL = process.env.UK_MODEL || 'gpt-4o-mini';
const BATCH = 25;
const LIMIT = Number(process.env.LIMIT) || Infinity;
const DRY = process.env.DRY_RUN === '1';

const SYSTEM =
  "You translate Polish driving-licence theory exam texts (WORD / prawo jazdy) into natural Ukrainian. " +
  "Keep road-law terminology precise (e.g. skrzyżowanie → перехрестя, pierwszeństwo przejazdu → право проїзду, " +
  "znak → знак, pas ruchu → смуга руху, pojazd → транспортний засіб, kierujący → водій). " +
  "Keep numbers, units, road-sign codes (A-7, B-33 ...) and Latin letters unchanged. " +
  "Return ONLY JSON: {\"items\":[{\"id\":\"...\",\"uk\":\"...\"}]} with the same ids, no commentary.";

async function translate(items: { id: string; pl: string }[]): Promise<Map<string, string>> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY yo\'q');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: JSON.stringify({ items }) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(data.choices[0].message.content) as { items: { id: string; uk: string }[] };
  const out = new Map<string, string>();
  for (const it of parsed.items) if (it.id && it.uk?.trim()) out.set(it.id, it.uk.trim());
  return out;
}

async function run(kind: 'question' | 'option') {
  const where = { textUk: null };
  const rows: { id: string; textPl: string }[] =
    kind === 'question'
      ? await prisma.theoryQuestion.findMany({ where, select: { id: true, textPl: true } })
      : await prisma.theoryOption.findMany({ where, select: { id: true, textPl: true } });
  const todo = rows.slice(0, LIMIT);
  console.log(`${kind}: ${todo.length} ta tarjima qilinadi (jami bo'sh: ${rows.length})`);
  let done = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH).map((r) => ({ id: r.id, pl: r.textPl }));
    let result: Map<string, string>;
    try {
      result = await translate(chunk);
    } catch (e) {
      console.warn('batch xato, qayta urinaman:', (e as Error).message);
      await new Promise((r) => setTimeout(r, 3000));
      result = await translate(chunk);
    }
    for (const [id, uk] of result) {
      if (DRY) {
        console.log(id, '→', uk);
        continue;
      }
      if (kind === 'question') await prisma.theoryQuestion.update({ where: { id }, data: { textUk: uk } });
      else await prisma.theoryOption.update({ where: { id }, data: { textUk: uk } });
    }
    done += result.size;
    console.log(`  ${Math.min(i + BATCH, todo.length)}/${todo.length} (saqlandi: ${done})`);
  }
}

(async () => {
  await run('question');
  await run('option');
  console.log('Tayyor.');
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
