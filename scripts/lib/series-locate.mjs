// Lokasi seri AUDIRA: seri yang masih dikerjakan ada di <WS>/<SERI>,
// seri yang semua episodenya final ada di <WS>/<KODE_CHANNEL>/<SERI>.
// Folder channel ditandai CHANNEL.json (ditulis scripts/move-finished-series.mjs).
import fs from 'node:fs';
import path from 'node:path';

export function channelDirs(ws) {
  return fs
    .readdirSync(ws, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(ws, e.name, 'CHANNEL.json')))
    .map((e) => e.name);
}

/** Absolute path of a series folder, or null when it is in neither place. */
export function locateSeries(ws, folder) {
  const root = path.join(ws, folder);
  if (fs.existsSync(root)) return root;
  for (const c of channelDirs(ws)) {
    const p = path.join(ws, c, folder);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Series folder name and its absolute dir for any path inside the workspace. */
export function seriesOfPath(ws, p) {
  const rel = path.relative(ws, path.resolve(p));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const segs = rel.split(/[\\/]/);
  if (segs.length > 1 && channelDirs(ws).includes(segs[0])) return { folder: segs[1], dir: path.join(ws, segs[0], segs[1]), channelDir: segs[0] };
  return { folder: segs[0], dir: path.join(ws, segs[0]), channelDir: null };
}

/** All series folders in the workspace: root ones and those inside channel folders. */
export function allSeries(ws) {
  const out = [];
  const chans = new Set(channelDirs(ws));
  for (const e of fs.readdirSync(ws, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (chans.has(e.name)) {
      for (const s of fs.readdirSync(path.join(ws, e.name), { withFileTypes: true })) {
        if (s.isDirectory()) out.push({ folder: s.name, dir: path.join(ws, e.name, s.name), channelDir: e.name });
      }
    } else if (/^[A-Z0-9]+_.*|^karhutla/.test(e.name) && !['CHANNEL_BRAND'].includes(e.name)) {
      out.push({ folder: e.name, dir: path.join(ws, e.name), channelDir: null });
    }
  }
  return out;
}

/** Markdown-friendly relative link from one directory to another. */
export const relLink = (fromDir, toDir) => path.relative(fromDir, toDir).split(path.sep).join('/') || '.';
