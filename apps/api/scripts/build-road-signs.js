// Wikimedia Commonsdan rasmiy Polsha yo'l belgilari (PD Polish Symbol litsenziyasi) rasmlarini yuklab,
// import uchun tayyor JSON quradi.
const fs = require('fs');
const path = require('path');

const [, , categoryKey, dataFile] = process.argv;
if (!categoryKey || !dataFile) {
  console.error('Usage: node build-road-signs.js <categoryKey> <dataFile.json>');
  process.exit(1);
}

const MEDIA_DIR = path.join(__dirname, '..', 'media', 'signs');
const UA = 'DriveMasterBot/1.0 (contact: drivemaster-dev@example.com)';

async function fetchThumbUrls(titles) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    titles.map((t) => 'File:' + t).join('|'),
  )}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json`;
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': UA } });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Non-JSON response: ' + text.slice(0, 200));
  }
  const pages = json.query?.pages ?? {};
  const map = new Map();
  for (const page of Object.values(pages)) {
    const title = page.title.replace(/^File:/, '');
    const info = page.imageinfo?.[0];
    if (info) map.set(title, info.thumburl || info.url);
  }
  return map;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function download(url, destPath, attempt = 1) {
  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (e) {
    if (attempt <= 4) {
      console.log(`  timeout/error on attempt ${attempt}, retrying: ${e.message}`);
      await sleep(8000);
      return download(url, destPath, attempt + 1);
    }
    throw e;
  }
  if (res.status === 429 && attempt <= 4) {
    await sleep(15000);
    return download(url, destPath, attempt + 1);
  }
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

async function main() {
  const items = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const chunks = [];
  for (let i = 0; i < items.length; i += 40) chunks.push(items.slice(i, i + 40));

  const thumbMap = new Map();
  for (const chunk of chunks) {
    const m = await fetchThumbUrls(chunk.map((i) => i.file));
    for (const [k, v] of m) thumbMap.set(k, v);
    await sleep(1500);
  }

  const importItems = [];
  for (const item of items) {
    const thumbUrl = thumbMap.get(item.file);
    if (!thumbUrl) {
      console.error('MISSING thumb for', item.file);
      continue;
    }
    const ext = path.extname(new URL(thumbUrl).pathname) || '.png';
    const imageFileName = `${categoryKey}-${item.code}${ext}`;
    const destPath = path.join(MEDIA_DIR, imageFileName);
    if (!fs.existsSync(destPath)) {
      await download(thumbUrl, destPath);
      console.log(`downloaded ${imageFileName}`);
      await sleep(4000);
    }
    importItems.push({
      code: item.code,
      category: categoryKey,
      namePl: item.namePl,
      nameUz: item.nameUz,
      descriptionUz: item.descriptionUz,
      imageFileName,
    });
  }

  const outPath = path.join(__dirname, '..', 'prisma', `road-signs-${categoryKey}.json`);
  fs.writeFileSync(outPath, JSON.stringify(importItems, null, 2));
  console.log(`Done: ${importItems.length}/${items.length} signs -> ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
