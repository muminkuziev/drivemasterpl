const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const p = new PrismaClient();

const CATEGORIES = [
  'warning',
  'prohibition',
  'mandatory',
  'information',
  'additional',
  'direction',
  'traffic_light',
  'road_markings',
  'traffic_controller',
  'dashboard',
];

async function main() {
  let totalUpdated = 0;
  let totalMissing = 0;

  for (const category of CATEGORIES) {
    const filePath = path.join(__dirname, 'translations', `ru-signs-${category}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (no file): ${category}`);
      continue;
    }
    const entries = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = 0;
    let missing = 0;
    for (const { code, nameRu, actionRu } of entries) {
      const result = await p.roadSign.updateMany({
        where: { category, code },
        data: { nameRu, actionRu },
      });
      if (result.count === 0) {
        console.log(`  NOT FOUND: ${category}/${code}`);
        missing++;
      } else {
        updated += result.count;
      }
    }
    console.log(`${category}: ${updated} updated, ${missing} not found (of ${entries.length} entries)`);
    totalUpdated += updated;
    totalMissing += missing;
  }

  console.log(`\nTOTAL: ${totalUpdated} signs updated, ${totalMissing} not found`);

  const stillEmpty = await p.roadSign.count({ where: { nameRu: null } });
  console.log(`Remaining signs with no nameRu: ${stillEmpty}`);

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
