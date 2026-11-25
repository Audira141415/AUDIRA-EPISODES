#!/usr/bin/env node
// Tentukan channel YouTube (kode, nama, handle tanda tangan) untuk sebuah seri AUDIRA.
//
//   node scripts/channel-of.mjs <folder seri / episode / file di dalamnya>   -> channel seri itu
//   node scripts/channel-of.mjs <path> --check                               -> cek handle di SERIES.json dan <AudiraSignature handle="…">
//   node scripts/channel-of.mjs --guess "<judul atau topik seri baru>"       -> tebak channel dari judul
//   tambah --json untuk keluaran mesin
//
// Urutan penentuan seri yang sudah ada:
//   1. daftar `series` di CHANNEL_BRAND/<KODE>/ACCOUNT.json
//   2. awalan nama folder seri = kode channel (QISSAH_…, SPORTFACTS_…)
//   3. SERIES.json account.code bila sama dengan kode channel (bukan AUDIRA)
// Tebakan judul memakai `keywords` di ACCOUNT.json. Hasil "ragu" = tanyakan ke pengguna.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { locateSeries, seriesOfPath } from './lib/series-locate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WS = path.resolve(HERE, '..');
const CB = path.join(WS, 'CHANNEL_BRAND');

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const positional = args.filter((a) => !a.startsWith('--'));
const asJson = flag('--json');

const channels = fs
  .readdirSync(CB)
  .filter((d) => fs.existsSync(path.join(CB, d, 'ACCOUNT.json')))
  .map((d) => JSON.parse(fs.readFileSync(path.join(CB, d, 'ACCOUNT.json'), 'utf8')))
  .filter((c) => Array.isArray(c.series));

const pick = (c) => ({ code: c.code, name: c.name, handle: c.handle });
const out = (obj, text) => {
  console.log(asJson ? JSON.stringify(obj, null, 2) : text);
};

if (flag('--guess')) {
  const title = positional.join(' ').toLowerCase();
  if (!title) {
    console.error('pakai: --guess "<judul seri>"');
    process.exit(2);
  }
  const scored = channels
    .map((c) => {
      const hits = (c.keywords || []).filter((k) => new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(title));
      return { ...pick(c), score: hits.reduce((s, k) => s + k.split(' ').length, 0), hits };
    })
    .sort((a, b) => b.score - a.score);
  const [best, second] = scored;
  const sure = best.score > 0 && best.score > (second?.score ?? 0);
  out(
    { sure, best, ranking: scored },
    sure
      ? `${best.code} (${best.name}, ${best.handle}) — kata kunci: ${best.hits.join(', ')}`
      : `RAGU — tanyakan ke pengguna. Kandidat: ${scored.filter((s) => s.score > 0).map((s) => `${s.code} [${s.hits.join(', ')}]`).join(' / ') || 'tidak ada kata kunci cocok'}`,
  );
  process.exit(sure ? 0 : 3);
}

if (flag('--all')) {
  // cek semua seri yang terdaftar di channel mana pun
  const { execFileSync } = await import('node:child_process');
  let bad = 0;
  for (const c of channels) {
    for (const s of c.series) {
      try {
        const dir = locateSeries(WS, s.folder);
        if (!dir) throw Object.assign(new Error(), { stdout: `${s.folder}: folder tidak ada\n` });
        process.stdout.write(execFileSync(process.execPath, [fileURLToPath(import.meta.url), dir, '--check'], { encoding: 'utf8' }));
      } catch (e) {
        bad += 1;
        process.stdout.write(e.stdout || String(e));
      }
    }
  }
  console.log(bad ? `\n${bad} seri perlu diperbaiki` : '\nSemua seri OK');
  process.exit(bad ? 1 : 0);
}

if (!positional[0]) {
  console.error('pakai: node scripts/channel-of.mjs <folder seri> [--check] [--json]  |  --guess "<judul>"');
  process.exit(2);
}

// terima path apa pun di dalam seri, atau nama folder seri saja
const arg = positional[0];
const hit = fs.existsSync(path.resolve(arg)) ? seriesOfPath(WS, arg) : null;
const seriesFolder = hit?.folder ?? (locateSeries(WS, arg) ? arg : null);
const seriesDir = hit?.dir ?? (seriesFolder ? locateSeries(WS, seriesFolder) : null);
if (!seriesFolder || !seriesDir || !fs.existsSync(seriesDir)) {
  console.error(`bukan folder seri di workspace: ${arg}`);
  process.exit(2);
}

let ch = channels.find((c) => c.series.some((s) => s.folder === seriesFolder));
let via = 'ACCOUNT.json series';
if (!ch) {
  ch = channels.find((c) => seriesFolder.startsWith(`${c.code}_`));
  via = 'awalan folder';
}
const seriesJsonPath = path.join(seriesDir, 'SERIES.json');
const seriesJson = fs.existsSync(seriesJsonPath) ? JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8')) : null;
if (!ch && seriesJson?.account?.code) {
  ch = channels.find((c) => c.code === seriesJson.account.code);
  via = 'SERIES.json account.code';
}
if (!ch) {
  out(
    { series: seriesFolder, channel: null },
    `${seriesFolder}: belum punya channel. Tambahkan ke "series" di CHANNEL_BRAND/<KODE>/ACCOUNT.json, lalu jalankan node scripts/build-channel-index.mjs`,
  );
  process.exit(3);
}

if (!flag('--check')) {
  out({ series: seriesFolder, via, ...pick(ch) }, `${seriesFolder}: ${ch.code} (${ch.name}) handle ${ch.handle} [via ${via}]`);
  process.exit(0);
}

// --check: cari handle yang tidak cocok
const problems = [];
if (seriesJson && seriesJson.account?.handle !== ch.handle) {
  problems.push(`SERIES.json account.handle = "${seriesJson.account?.handle ?? ''}"`);
}
const SKIP = new Set(['node_modules', 'out', '.git', '_cache']);
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isSymbolicLink() || SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|jsx|ts|js|html)$/.test(e.name) && !/AudiraSignature\.tsx$/.test(e.name)) {
      const src = fs.readFileSync(p, 'utf8');
      for (const m of src.matchAll(/<AudiraSignature\b[^>]*?handle=["'{`]+([^"'}`]+)/g)) {
        if (m[1] !== ch.handle) problems.push(`${path.relative(WS, p)}: handle="${m[1]}"`);
      }
    }
  }
};
walk(seriesDir);
out(
  { series: seriesFolder, ...pick(ch), ok: problems.length === 0, problems },
  problems.length
    ? `${seriesFolder} harus ${ch.handle} (${ch.code}), tapi:\n  - ${problems.join('\n  - ')}`
    : `${seriesFolder}: semua handle = ${ch.handle} (${ch.code}) OK`,
);
process.exit(problems.length ? 1 : 0);
