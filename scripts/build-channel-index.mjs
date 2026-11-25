#!/usr/bin/env node
// 5 channel YouTube = 5 folder inti di root workspace: <WS>/<KODE>/<SERI>/ berisi seri yang SEMUA
// episodenya sudah final (dipindah oleh scripts/move-finished-series.mjs). Seri yang masih dikerjakan
// tetap di <WS>/<SERI>/ dan diberi shortcut "<SERI> (BELUM FINAL).lnk" di folder channelnya.
// Daftar seri per channel: CHANNEL_BRAND/<KODE>/ACCOUNT.json "series".
// Skrip ini menulis CHANNEL_BRAND/<KODE>/SERIES_INDEX.md dan CHANNEL_BRAND/CHANNELS.md.
//   node scripts/build-channel-index.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allSeries, locateSeries, relLink } from './lib/series-locate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WS = path.resolve(HERE, '..');
const CB = path.join(WS, 'CHANNEL_BRAND');
const LNK = ' (BELUM FINAL).lnk';

const exists = (p) => fs.existsSync(p);
const isDir = (p) => exists(p) && fs.statSync(p).isDirectory();
const slash = (p) => p.split(path.sep).join('/');

function episodeDirs(sDir) {
  const direct = fs.readdirSync(sDir).filter((e) => /^EP/i.test(e) && isDir(path.join(sDir, e)));
  if (direct.length) return direct.map((e) => path.join(sDir, e));
  // AUDIRA_EXPLAINED memakai BATCHxx/<episode>/
  const out = [];
  for (const b of fs.readdirSync(sDir).filter((e) => /^BATCH\d+/i.test(e))) {
    const bDir = path.join(sDir, b);
    for (const e of fs.readdirSync(bDir)) {
      if (/^(EP|E)\d+/i.test(e) && isDir(path.join(bDir, e))) out.push(path.join(bDir, e));
    }
  }
  return out;
}

function hasFinal(dir, depth = 0) {
  if (depth > 3) return false;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'out', 'draft', 'preview', '.tmp'].includes(e.name) || e.isSymbolicLink()) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (hasFinal(p, depth + 1)) return true;
    } else if (/(^|_)FINAL[^/]*\.mp4$/i.test(e.name)) return true;
  }
  return false;
}

const channels = fs
  .readdirSync(CB)
  .filter((d) => exists(path.join(CB, d, 'ACCOUNT.json')))
  .map((d) => ({ dir: d, ...JSON.parse(fs.readFileSync(path.join(CB, d, 'ACCOUNT.json'), 'utf8')) }))
  .filter((c) => Array.isArray(c.series));

const assigned = new Map();
const summary = [];
for (const c of channels) {
  let eps = 0;
  let fin = 0;
  const rows = [];
  for (const s of c.series) {
    if (assigned.has(s.folder)) console.error(`[${c.code}] ${s.folder} juga ada di ${assigned.get(s.folder)}`);
    assigned.set(s.folder, c.code);
    const sDir = locateSeries(WS, s.folder);
    if (!sDir) {
      rows.push(`| \`${s.folder}\` | - | - | folder tidak ada |`);
      process.exitCode = 1;
      continue;
    }
    const e = episodeDirs(sDir);
    const f = e.filter((x) => hasFinal(x)).length;
    eps += e.length;
    fin += f;
    const link = relLink(path.join(CB, c.dir), sDir);
    const where = slash(path.relative(WS, sDir));
    const status = where.includes('/') ? 'selesai (folder channel)' : 'dikerjakan (root)';
    const group = exists(path.join(sDir, 'GROUP_INDEX.md')) ? ` · [indeks gabungan](${link}/GROUP_INDEX.md)` : '';
    rows.push(`| [\`${where}\`](${link}/) | ${e.length} | ${f} | ${status}${group} |`);
  }
  const md = [
    `# ${c.name}`,
    '',
    `- Kode akun: \`${c.code}\``,
    `- Folder channel: [\`${c.code}/\`](../../${c.code}/)`,
    `- YouTube: ${c.platforms?.youtube ?? '-'} (handle \`${c.handle || '-'}\`)`,
    `- Niche: ${c.niche ?? '-'}`,
    c.brandKit ? `- Kit brand: [\`${c.brandKit}\`](../${c.brandKit}/)` : '- Kit brand: belum ada',
    c.profile ? `- Profil channel: [\`${c.profile}\`](../${c.profile})` : '- Profil channel: belum ada',
    '',
    `Seri yang semua episodenya final ada di \`${c.code}/\`. Seri yang masih dikerjakan ada di root workspace dan punya shortcut \`(BELUM FINAL)\` di \`${c.code}/\`. Ubah daftar lewat \`series\` di \`ACCOUNT.json\`, lalu jalankan \`node scripts/build-channel-index.mjs\`.`,
    '',
    `Total ${c.series.length} seri, ${eps} episode, ${fin} final.`,
    '',
    '| Seri | Episode | Final | Status |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(CB, c.dir, 'SERIES_INDEX.md'), md);
  summary.push(`| [${c.name}](${c.dir}/SERIES_INDEX.md) | [\`${c.code}/\`](../${c.code}/) | ${c.handle || '-'} | ${c.series.length} | ${eps} | ${fin} |`);
  console.log(`[${c.code}] ${c.series.length} seri, ${eps} episode, ${fin} final`);
}

const unassigned = allSeries(WS)
  .map((x) => x.folder)
  .filter((d) => !assigned.has(d));
fs.writeFileSync(
  path.join(CB, 'CHANNELS.md'),
  [
    '# Channel AUDIRA',
    '',
    '5 folder inti di root workspace (`EXPLAINED/`, `FAKTADUNIA/`, `QISSAH/`, `SPORTFACTS/`, `TECH/`) berisi seri yang sudah selesai.',
    'Seri yang masih dikerjakan ada di root dan punya shortcut `(BELUM FINAL)` di folder channelnya; pindahkan dengan `node scripts/move-finished-series.mjs --apply` setelah semua episodenya final.',
    'Data akun: `CHANNEL_BRAND/<KODE>/ACCOUNT.json`. Dibuat ulang oleh `node scripts/build-channel-index.mjs`.',
    '',
    '| Channel | Folder | Handle | Seri | Episode | Final |',
    '| --- | --- | --- | --- | --- | --- |',
    ...summary,
    '',
    unassigned.length ? `Seri yang belum masuk channel mana pun: ${unassigned.map((d) => `\`${d}\``).join(', ')}` : 'Semua seri sudah masuk satu channel.',
    '',
  ].join('\n'),
);
if (unassigned.length) console.log('belum masuk channel:', unassigned.join(', '));

// Folder inti per channel + shortcut untuk seri yang masih dikerjakan di root.
// Shortcut (.lnk), bukan junction: junction membuat `audira_project_layout check` memberi warning per link,
// dan hapus rekursif lewat junction bisa ikut menghapus seri aslinya.
const ps = [];
const q = (s) => s.replace(/'/g, "''");
for (const c of channels) {
  const chDir = path.join(WS, c.code);
  fs.mkdirSync(chDir, { recursive: true });
  const marker = path.join(chDir, 'CHANNEL.json');
  if (!exists(marker)) {
    const info = { code: c.code, name: c.name, handle: c.handle, account: `CHANNEL_BRAND/${c.code}/ACCOUNT.json`, note: 'Folder channel: berisi seri yang semua episodenya sudah final. Seri yang masih dikerjakan tetap di root workspace.' };
    fs.writeFileSync(marker, JSON.stringify(info, null, 2) + '\n');
  }
  const want = new Set();
  for (const s of c.series) {
    const d = locateSeries(WS, s.folder);
    if (d && path.dirname(d) === WS) want.add(s.folder + LNK);
  }
  for (const f of fs.readdirSync(chDir)) {
    if (f.endsWith(LNK) && !want.has(f)) fs.unlinkSync(path.join(chDir, f));
  }
  for (const f of want) {
    const target = path.join(WS, f.slice(0, -LNK.length));
    ps.push(`$l=$sh.CreateShortcut('${q(path.join(chDir, f))}');$l.TargetPath='${q(target)}';$l.Save()`);
  }
  // sisa lama: CHANNEL_BRAND/<KODE>/SERI/*.lnk
  const old = path.join(CB, c.dir, 'SERI');
  if (isDir(old)) {
    for (const f of fs.readdirSync(old)) if (f.endsWith('.lnk')) fs.unlinkSync(path.join(old, f));
    if (!fs.readdirSync(old).length) fs.rmdirSync(old);
  }
}
if (ps.length && process.platform === 'win32') {
  const { execFileSync } = await import('node:child_process');
  execFileSync('powershell', ['-NoProfile', '-Command', `$sh=New-Object -ComObject WScript.Shell;${ps.join(';')}`], { stdio: 'inherit' });
}
console.log(`shortcut seri yang masih dikerjakan: ${ps.length}`);
