// Qolgan (video kutayotgan) partiyalarni qayta tekshirib, endi tayyor bo'lgan
// (lekin hali import qilinmagan) savollarni chiqaradi.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scratch = 'C:/Users/ggani/AppData/Local/Temp/claude/c--Projects-DriveMaster/a79184a9-5aa1-4ab3-81db-af25f596a732/scratchpad';
const prismaDir = path.join(__dirname, 'prisma');
const batches = [1, 2, 3, 4];

for (const n of batches) {
  const candidatesPath = path.join(scratch, `batch${n}_candidates.json`);
  const translationsPath = path.join(scratch, `batch${n}_translations.json`);
  const alreadyImportedPath = path.join(prismaDir, `batch${n}-import.json`);
  const freshOutPath = path.join(prismaDir, `batch${n}-recheck.json`);

  if (!fs.existsSync(candidatesPath) || !fs.existsSync(alreadyImportedPath)) continue;

  execSync(`node build_batch_import.js "${candidatesPath}" "${translationsPath}" "${freshOutPath}"`, {
    cwd: __dirname,
    stdio: 'inherit',
  });

  const alreadyImported = JSON.parse(fs.readFileSync(alreadyImportedPath, 'utf8'));
  const alreadyKeys = new Set(alreadyImported.map((q) => q.textPl + '|' + q.mediaFileName));

  const fresh = JSON.parse(fs.readFileSync(freshOutPath, 'utf8'));
  const newOnes = fresh.filter((q) => !alreadyKeys.has(q.textPl + '|' + q.mediaFileName));

  fs.writeFileSync(freshOutPath, JSON.stringify(newOnes, null, 2));
  console.log(`Batch ${n}: ${newOnes.length} new question(s) ready to import (out of ${fresh.length} total ready).`);
}
