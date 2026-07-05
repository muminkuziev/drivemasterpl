// Vaqtinchalik yordamchi skript: media-savol partiyasini import JSON formatiga o'giradi
const fs = require('fs');
const path = require('path');

const MEDIA_DIR = path.join(__dirname, 'media', 'theory');

const [, , candidatesPath, translationsPath, outPath] = process.argv;

const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

if (candidates.length !== translations.length) {
  throw new Error(`Mismatch: ${candidates.length} candidates vs ${translations.length} translations`);
}

function guessCategory(textPl) {
  const t = textPl.toLowerCase();
  if (t.includes('pierwszeństw')) return 'Ustuvorlik qoidalari';
  if (t.includes('wyprzedz')) return "O'zib o'tish";
  if (t.includes('zatrzym') || t.includes('parking') || t.includes('postó') || t.includes('zaparkow')) return "To'xtash va parking";
  if (t.includes('światł') || t.includes('sygnał świetln') || t.includes('sygnalizator')) return 'Svetofor va yorug\'lik';
  if (t.includes('pas ruchu') || t.includes('skręc') || t.includes('zawróc') || t.includes('zjecha')) return 'Yo\'lak va manevrlar';
  if (t.includes('ostrzegany') || t.includes('znak')) return "Yo'l belgilari";
  return 'Umumiy qoidalar';
}

function buildOptions(candidate, translation) {
  const isYesNo = !candidate.a && !candidate.b && !candidate.c;
  if (isYesNo) {
    return [
      { textPl: 'Tak', textUz: 'Ha', isCorrect: candidate.correct === 'T' },
      { textPl: 'Nie', textUz: "Yo'q", isCorrect: candidate.correct === 'N' },
    ];
  }
  const opts = [
    { textPl: candidate.a.trim(), textUz: translation.aUz, isCorrect: candidate.correct === 'A' },
    { textPl: candidate.b.trim(), textUz: translation.bUz, isCorrect: candidate.correct === 'B' },
    { textPl: candidate.c.trim(), textUz: translation.cUz, isCorrect: candidate.correct === 'C' },
  ];
  return opts;
}

const ready = [];
const notReady = [];

candidates.forEach((c, i) => {
  const t = translations[i];
  const textUz = typeof t === 'string' ? t : t.textUz;
  const category = typeof t === 'object' && t.category ? t.category : guessCategory(c.textPl);
  const options = buildOptions(c, typeof t === 'object' ? t : {});
  const correctCount = options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) {
    throw new Error(`Row ${i} (${c.media}) has ${correctCount} correct options`);
  }
  const isVideo = c.media.toLowerCase().endsWith('.wmv');
  const mediaFileName = isVideo ? c.media.replace(/\.wmv$/i, '.mp4') : c.media;
  const question = {
    textPl: c.textPl,
    textUz,
    category,
    isPremium: true,
    mediaFileName,
    mediaType: isVideo ? 'video' : 'photo',
    options,
  };
  if (fs.existsSync(path.join(MEDIA_DIR, mediaFileName))) {
    ready.push(question);
  } else {
    notReady.push({ ...c, translationIndex: i });
  }
});

fs.writeFileSync(outPath, JSON.stringify(ready, null, 2));
console.log(`Wrote ${ready.length} ready questions to ${outPath}`);
if (notReady.length) {
  const pendingPath = outPath.replace(/\.json$/, '.pending.json');
  fs.writeFileSync(pendingPath, JSON.stringify(notReady, null, 2));
  console.log(`${notReady.length} video(s) not yet converted -> saved to ${pendingPath}`);
}
