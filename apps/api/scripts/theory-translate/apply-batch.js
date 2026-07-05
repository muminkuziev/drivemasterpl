const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const p = new PrismaClient();
const fileArg = process.argv[2] || 'batch-translated.json';

async function main() {
  const filePath = path.join(__dirname, fileArg);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let qUpdated = 0;
  let oUpdated = 0;
  let qMissing = 0;

  for (const q of data) {
    const res = await p.theoryQuestion.updateMany({
      where: { id: q.id },
      data: { textRu: q.textRu, textEn: q.textEn },
    });
    if (res.count === 0) {
      console.log('  QUESTION NOT FOUND:', q.id);
      qMissing++;
    } else {
      qUpdated++;
    }
    for (const o of q.options) {
      const ores = await p.theoryOption.updateMany({
        where: { id: o.id },
        data: { textRu: o.textRu, textEn: o.textEn },
      });
      if (ores.count === 0) {
        console.log('  OPTION NOT FOUND:', o.id);
      } else {
        oUpdated++;
      }
    }
  }

  console.log(`Questions updated: ${qUpdated} (missing: ${qMissing})`);
  console.log(`Options updated: ${oUpdated}`);

  const remaining = await p.theoryQuestion.count({ where: { textRu: null } });
  console.log(`Remaining untranslated questions: ${remaining}`);

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
