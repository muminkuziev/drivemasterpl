const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const p = new PrismaClient();
const LIMIT = parseInt(process.argv[2] || '150', 10);

async function main() {
  const questions = await p.theoryQuestion.findMany({
    where: { textRu: null },
    include: { options: true },
    take: LIMIT,
    orderBy: { id: 'asc' },
  });

  if (questions.length === 0) {
    console.log('No more untranslated questions. All done!');
    await p.$disconnect();
    return;
  }

  const exportData = questions.map((q) => ({
    id: q.id,
    textPl: q.textPl,
    textUz: q.textUz,
    category: q.category,
    options: q.options.map((o) => ({ id: o.id, textPl: o.textPl, textUz: o.textUz })),
  }));

  const outPath = path.join(__dirname, 'batch-current.json');
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2));

  const remaining = await p.theoryQuestion.count({ where: { textRu: null } });
  console.log(`Exported ${questions.length} questions to ${outPath}`);
  console.log(`Remaining untranslated (including this batch): ${remaining}`);

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
