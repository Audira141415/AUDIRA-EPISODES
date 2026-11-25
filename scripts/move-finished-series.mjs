#!/usr/bin/env node
// Pindahkan seri yang SEMUA episodenya sudah punya MP4 final ke folder channelnya:
//   <WS>/<SERI>  ->  <WS>/<KODE_CHANNEL>/<SERI>
// Seri yang belum selesai tetap di root workspace (masih dikerjakan).
// Channel tiap seri diambil dari CHANNEL_BRAND/<KODE>/ACCOUNT.json ("series").
//
//   node scripts/move-finished-series.mjs            -> dry run: tampilkan rencana
//   node scripts/move-finished-series.mjs --apply    -> jalankan
//   node scripts/move-finished-series.mjs --apply AUDIRA_X_2026 AUDIRA_Y_2026   -> hanya seri ini (harus selesai)
//
// Yang dikerjakan saat --apply:
//   1. backup semua file teks yang akan diubah ke _ARSIP_PROYEK_LAMA/_MOVE_BACKUP/<ts>.tar.gz
//   2. rename folder seri (gagal satu = semua dikembalikan)
//   3. ganti path absolut lama -> baru di file teks workspace, motion-memory hub, dan memori Claude
//   4. buat ulang junction (node_modules dll.) yang targetnya ikut pindah
//   5. tulis <KODE>/MOVE_LOG.tsv dan <KODE>/CHANNEL.json
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WS = path.resolve(HERE, '..');
const CB = path.join(WS, 'CHANNEL_BRAND');
const EXTRA_ROOTS = [
  'F:/AUDIRA-ALL-SKILL/motion-memory',
  path.join(os.homedir(), '.claude/projects/F--AUDIRA-VIDEO-MOTION/memory'),
].filter((p) => fs.existsSync(p));

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const only = args.filter((a) => !a.startsWith('--'));

const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};

// ---------- 1. seri selesai
function episodeDirs(sDir) {
  const direct = fs.readdirSync(sDir).filter((e) => /^EP/i.test(e) && isDir(path.join(sDir, e)));
  if (direct.length) return direct.map((e) => path.join(sDir, e));
  const out = [];
  for (const b of fs.readdirSync(sDir).filter((e) => /^BATCH\d+/i.test(e))) {
    for (const e of fs.readdirSync(path.join(sDir, b))) {
      if (/^(EP|E)\d+/i.test(e) && isDir(path.join(sDir, b, e))) out.push(path.join(sDir, b, e));
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
function isFinished(sDir) {
  const eps = episodeDirs(sDir);
  if (eps.length) return { done: eps.every((e) => hasFinal(e)), eps: eps.length, finals: eps.filter((e) => hasFinal(e)).length };
  // seri tanpa folder episode (mis. showcase): selesai bila deliver/video berisi mp4
  const dv = path.join(sDir, 'deliver', 'video');
  const n = isDir(dv) ? fs.readdirSync(dv).filter((f) => f.endsWith('.mp4')).length : 0;
  return { done: n > 0, eps: n, finals: n };
}

const channels = fs
  .readdirSync(CB)
  .filter((d) => fs.existsSync(path.join(CB, d, 'ACCOUNT.json')))
  .map((d) => JSON.parse(fs.readFileSync(path.join(CB, d, 'ACCOUNT.json'), 'utf8')))
  .filter((c) => Array.isArray(c.series));

const moves = [];
const stay = [];
for (const c of channels) {
  for (const s of c.series) {
    const from = path.join(WS, s.folder);
    if (!isDir(from)) continue; // sudah dipindah / tidak ada
    if (only.length && !only.includes(s.folder)) continue;
    const st = isFinished(from);
    if (st.done) moves.push({ series: s.folder, code: c.code, name: c.name, from, to: path.join(WS, c.code, s.folder), ...st });
    else stay.push({ series: s.folder, code: c.code, ...st });
  }
}

console.log(`Dipindah (${moves.length}):`);
for (const m of moves) console.log(`  ${m.series}  ->  ${m.code}/${m.series}   (${m.finals}/${m.eps} final)`);
console.log(`Tetap di root karena belum selesai (${stay.length}):`);
for (const s of stay) console.log(`  ${s.series}   (${s.finals}/${s.eps} final)`);
if (!moves.length) process.exit(0);
for (const m of moves) {
  if (fs.existsSync(m.to)) {
    console.error(`Tujuan sudah ada: ${m.to}`);
    process.exit(1);
  }
}

// ---------- 2. file teks yang menyebut path lama
const TEXT_EXT = new Set(['.sh', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.ps1', '.bat', '.cmd', '.json', '.html', '.css', '.md', '.txt', '.tsv', '.csv', '.yaml', '.yml', '.toml', '.env', '.srt', '.vtt', '.ass', '.xml', '.svg', '.ini', '.cfg']);
const SKIP = new Set(['node_modules', '.git', 'out', '_cache', '.cache', '__pycache__', '.tmp', 'dist', 'build', '_MOVE_BACKUP']);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rules = moves.map((m) => ({
  m,
  re: new RegExp(`(AUDIRA-VIDEO-MOTION)((?:\\\\|/)+)(${esc(m.series)})(?![A-Za-z0-9_-])`, 'gi'),
}));
const quick = new RegExp(moves.map((m) => esc(m.series)).join('|'), 'i');

const textFiles = [];
const links = [];
function walk(dir, depth = 0) {
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) {
      try {
        links.push({ at: p, target: path.resolve(path.dirname(p), fs.readlinkSync(p)) });
      } catch {
        /* unreadable */
      }
      continue;
    }
    if (e.isDirectory()) {
      if (!SKIP.has(e.name) && depth < 14) walk(p, depth + 1);
    } else if (TEXT_EXT.has(path.extname(e.name).toLowerCase()) || e.name === 'MEMORY.md') {
      let st;
      try {
        st = fs.statSync(p);
      } catch {
        continue;
      }
      if (st.size < 8_000_000) textFiles.push(p);
    }
  }
}
walk(WS);
for (const r of EXTRA_ROOTS) walk(r);

const edits = [];
for (const f of textFiles) {
  let txt;
  try {
    txt = fs.readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  if (!quick.test(txt)) continue;
  let next = txt;
  let n = 0;
  for (const { m, re } of rules) {
    re.lastIndex = 0;
    next = next.replace(re, (_all, a, sep, s) => {
      n += 1;
      return `${a}${sep}${m.code}${sep}${s}`;
    });
  }
  if (n) edits.push({ file: f, next, n });
}

const relocate = (p) => {
  for (const m of moves) {
    const rel = path.relative(m.from, p);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) return path.join(m.to, rel);
  }
  return p;
};
const linkFixes = links
  .map((l) => ({ ...l, newAt: relocate(l.at), newTarget: relocate(l.target) }))
  .filter((l) => l.newTarget !== l.target);

console.log(`\nFile teks yang diubah: ${edits.length} (${edits.reduce((s, e) => s + e.n, 0)} path)`);
console.log(`Junction yang dibuat ulang: ${linkFixes.length}`);
if (!APPLY) {
  console.log('\nDry run. Jalankan lagi dengan --apply untuk memindah.');
  process.exit(0);
}

// ---------- 3. backup
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const bdir = path.join(WS, '_ARSIP_PROYEK_LAMA', '_MOVE_BACKUP');
fs.mkdirSync(bdir, { recursive: true });
const listFile = path.join(os.tmpdir(), `audira-move-${ts}.txt`);
fs.writeFileSync(listFile, edits.map((e) => e.file).join('\n'));
const tarPath = path.join(bdir, `${ts}_text-before-move.tar.gz`);
// tar bawaan Windows (bsdtar); tar Git membaca "F:\..." sebagai host remote
const TAR = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:/Windows', 'System32', 'tar.exe') : 'tar';
execFileSync(TAR, ['-czf', tarPath, '-P', '-T', listFile], { stdio: 'inherit' });
fs.writeFileSync(path.join(bdir, `${ts}_links-before-move.txt`), JSON.stringify(links, null, 2));
console.log(`Backup: ${path.relative(WS, tarPath)}`);

// ---------- 4. rename
const done = [];
try {
  for (const m of moves) {
    fs.mkdirSync(path.dirname(m.to), { recursive: true });
    fs.renameSync(m.from, m.to);
    done.push(m);
  }
} catch (err) {
  console.error(`Gagal memindah: ${err.message}. Mengembalikan ${done.length} seri.`);
  for (const m of done.reverse()) fs.renameSync(m.to, m.from);
  process.exit(1);
}

// ---------- 5. tulis ulang path
for (const e of edits) fs.writeFileSync(relocate(e.file), e.next);

// ---------- 6. junction
const linkErrors = [];
for (const l of linkFixes) {
  try {
    execFileSync('cmd', ['/c', 'rmdir', l.newAt]);
    fs.symlinkSync(l.newTarget, l.newAt, 'junction');
  } catch (err) {
    linkErrors.push(`${l.newAt}: ${err.message}`);
  }
}

// ---------- 7. log + penanda channel
const today = new Date().toISOString().slice(0, 10);
for (const code of new Set(moves.map((m) => m.code))) {
  const cdir = path.join(WS, code);
  const c = channels.find((x) => x.code === code);
  const marker = path.join(cdir, 'CHANNEL.json');
  if (!fs.existsSync(marker)) {
    fs.writeFileSync(
      marker,
      JSON.stringify({ code, name: c.name, handle: c.handle, account: `CHANNEL_BRAND/${code}/ACCOUNT.json`, note: 'Folder channel: berisi seri yang semua episodenya sudah final. Seri yang masih dikerjakan tetap di root workspace.' }, null, 2) + '\n',
    );
  }
  const log = path.join(cdir, 'MOVE_LOG.tsv');
  const rows = moves.filter((m) => m.code === code).map((m) => `${today}\t${m.series}\t${code}/${m.series}\t${m.finals}/${m.eps} final`);
  fs.appendFileSync(log, (fs.existsSync(log) ? '' : 'tanggal\tasal\ttujuan\tstatus\n') + rows.join('\n') + '\n');
}

console.log(`\nSelesai: ${moves.length} seri dipindah, ${edits.length} file diperbarui, ${linkFixes.length - linkErrors.length} junction dibuat ulang.`);
if (linkErrors.length) {
  console.error('Junction gagal:\n  ' + linkErrors.join('\n  '));
  process.exitCode = 1;
}
