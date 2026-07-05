const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scratch = 'C:/Users/ggani/AppData/Local/Temp/claude/c--Projects-DriveMaster/a79184a9-5aa1-4ab3-81db-af25f596a732/scratchpad';
const prismaDir = path.join(__dirname, 'prisma');
const batches = [1, 2, 3, 4, 6, 7, 8];

let allNew = [];

for (const n of batches) {
  const candidatesPath = path.join(scratch, `batch${n}_candidates.json`);
  const translationsPath = path.join(scratch, `batch${n}_translations.json`);
  const alreadyImportedPath = path.join(prismaDir, `batch${n}-import.json`);
  const recheckImportedPath = path.join(prismaDir, `batch${n}-recheck.json`);
  const freshOutPath = path.join(prismaDir, `batch${n}-recheck2.json`);

  if (!fs.existsSync(candidatesPath)) continue;

  execSync(`node build_batch_import.js "${candidatesPath}" "${translationsPath}" "${freshOutPath}"`, {
    cwd: __dirname,
    stdio: 'inherit',
  });

  const alreadyKeys = new Set();
  for (const p of [alreadyImportedPath, recheckImportedPath]) {
    if (fs.existsSync(p)) {
      const items = JSON.parse(fs.readFileSync(p, 'utf8'));
      items.forEach((q) => alreadyKeys.add(q.textPl + '|' + q.mediaFileName));
    }
  }

  const fresh = JSON.parse(fs.readFileSync(freshOutPath, 'utf8'));
  const newOnes = fresh.filter((q) => !alreadyKeys.has(q.textPl + '|' + q.mediaFileName));

  fs.writeFileSync(freshOutPath, JSON.stringify(newOnes, null, 2));
  console.log(`Batch ${n}: ${newOnes.length} new question(s) ready (of ${fresh.length} total ready).`);
  allNew = allNew.concat(newOnes);
}

console.log('TOTAL new across all batches:', allNew.length);
