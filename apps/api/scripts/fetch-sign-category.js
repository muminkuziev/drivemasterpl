const category = process.argv[2];
const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + category)}&cmlimit=200&format=json`;

fetch(url, {
  headers: { 'User-Agent': 'DriveMasterBot/1.0 (contact: drivemaster-dev@example.com) node-fetch' },
})
  .then((r) => r.text())
  .then((text) => {
    let d;
    try {
      d = JSON.parse(text);
    } catch {
      console.error('NON-JSON RESPONSE:', text.slice(0, 200));
      process.exit(1);
    }
    const files = (d.query?.categorymembers ?? []).filter((m) => m.ns === 6 || m.ns === 14);
    files.forEach((f) => console.log((f.ns === 14 ? '[CAT] ' : '') + f.title));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
