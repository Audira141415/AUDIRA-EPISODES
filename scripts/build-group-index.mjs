#!/usr/bin/env node
// Gabung seri lewat indeks (tanpa memindah folder, rule 08 §2 dan §7).
// Setiap seri induk punya GROUP.json dengan role "parent" dan daftar "parts".
// Skrip ini membaca semua GROUP.json di workspace, lalu menulis ulang
// GROUP_INDEX.md di seri induk dengan nomor playlist berurutan lintas bagian.
// Status FINAL dibaca langsung dari file, jadi jalankan ulang setiap ada episode baru:
//   node scripts/build-group-index.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allSeries, locateSeries, relLink } from './lib/series-locate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WS = path.resolve(HERE, '..');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

function seriesTitles(sDir) {
  const p = path.join(sDir, 'SERIES.json');
  const out = {};
  if (!exists(p)) return out;
  for (const e of readJson(p).episodes || []) {
    if (e.folder && e.title && !e.title.includes('_')) out[e.folder] = e.title;
  }
  return out;
}

function episodeTitle(epDir, folder, known) {
  if (known[folder]) return known[folder];
  const candidates = ['SCRIPT.md', 'docs/SCRIPT.md'];
  const scriptDir = path.join(epDir, 'script');
  if (exists(scriptDir)) {
    for (const f of fs.readdirSync(scriptDir)) if (f.endsWith('.md')) candidates.push(`script/${f}`);
  }
  for (const rel of candidates) {
    const p = path.join(epDir, rel);
    if (!exists(p)) continue;
    const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith('# '));
    if (!line) continue;
    const t = line
      .replace(/^#\s+/, '')
      .replace(/^(EP\s*\d+\s*:|SCRIPT\s*[—:-]|Script\s*:|Naskah\s*[—:-])\s*/i, '')
      .trim();
    if (t && !/^EP\d+_/.test(t)) return t;
  }
  return folder.replace(/^EP\d+_/, '').replace(/_/g, ' ');
}

function findFinal(epDir) {
  for (const sub of ['', 'render', 'PROJECT', 'project']) {
    const d = path.join(epDir, sub);
    if (!exists(d) || !fs.statSync(d).isDirectory()) continue;
    const f = fs.readdirSync(d).find((n) => /^FINAL.*\.mp4$/i.test(n));
    if (f) return path.posix.join(sub, f);
  }
  return null;
}

const parents = [];
for (const s of allSeries(WS)) {
  const g = path.join(s.dir, 'GROUP.json');
  if (exists(g)) {
    const j = readJson(g);
    if (j.role === 'parent') parents.push({ folder: s.folder, dir: s.dir, ...j });
  }
}

for (const p of parents) {
  let n = 0;
  const rows = [];
  let finals = 0;
  for (const part of p.parts) {
    const sDir = locateSeries(WS, part.folder);
    if (!sDir) {
      console.error(`[${p.group}] folder bagian tidak ada: ${part.folder}`);
      process.exitCode = 1;
      continue;
    }
    const eps = fs.readdirSync(sDir).filter((e) => /^EP\d+_/.test(e)).sort();
    const known = seriesTitles(sDir);
    for (const ep of eps) {
      n += 1;
      const epDir = path.join(sDir, ep);
      const fin = findFinal(epDir);
      if (fin) finals += 1;
      const rel = relLink(p.dir, epDir);
      rows.push(
        `| ${String(n).padStart(2, '0')} | ${part.label} | ${ep.match(/^EP\d+/)[0]} | [${episodeTitle(epDir, ep, known)}](${rel}/) | ${fin ? `[FINAL](${rel}/${fin})` : 'belum'} |`,
      );
    }
  }
  const md = [
    `# ${p.title} (gabungan)`,
    '',
    `${p.description}`,
    '',
    'Seri ini digabung lewat indeks: nama folder tiap bagian tidak diganti, karena nomor EP di folder dan di metadata MP4 sudah terkunci.',
    'Kolom **No** adalah nomor playlist lintas bagian. Kolom **EP** adalah nomor asli di folder dan di metadata MP4.',
    '',
    `Total ${n} episode, ${finals} final. Dibuat ulang oleh \`node scripts/build-group-index.mjs\`; jangan edit tabel ini dengan tangan.`,
    '',
    '| No | Bagian | EP | Judul | Final |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '## Bagian',
    '',
    ...p.parts.map((part) => {
      const d = locateSeries(WS, part.folder);
      const where = d ? path.relative(WS, d).split(path.sep).join('/') : part.folder;
      return `- **${part.label}**: [\`${where}\`](${d ? relLink(p.dir, d) : part.folder}/)`;
    }),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(p.dir, 'GROUP_INDEX.md'), md);
  console.log(`[${p.group}] ${p.folder}/GROUP_INDEX.md: ${n} episode, ${finals} final`);
}
