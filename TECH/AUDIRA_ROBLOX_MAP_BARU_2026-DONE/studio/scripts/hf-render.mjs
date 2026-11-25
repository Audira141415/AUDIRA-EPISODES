// Final render for a HyperFrames project with the same guarantees as render:final (engine-neutral: node +
// ffmpeg + npx hyperframes, no Remotion needed). Used by audira_render_batch for engine "hyperframes".
//   node <starter>/scripts/hf-render.mjs --project=<hyperframes folder> --out=<FINAL.mp4>
//        [--fps=30] [--workers=6] [--quality=standard] [--title="…" --slug=… --ep=EP01] [--no-master] [--force]
//
// 1. Up-to-date guard: the key covers every file of the project (except .hyperframes/, renders/,
//    node_modules/), the fps/quality and the metadata flags. If <out> exists with the same key in
//    <out>.render.json, nothing is rendered ("up to date"). --force renders anyway.
// 2. npx hyperframes render -o <raw> -f <fps> -q <quality> -w <workers>, with temp files on RENDER_TMPDIR.
// 3. Master to -14 LUFS / true peak (deliver.mjs) unless --no-master (the series masters it itself).
// 4. Ownership metadata (title, artist, copyright, comment, date) when --title/--slug is given.
// Build steps a series runs before rendering (build-video.mjs, mix.py) stay in the series' own scripts.

import "./lib/tmpdir.mjs";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const project = arg("project"), out = arg("out");
if (!project || !out) {
  console.error('usage: node hf-render.mjs --project=<hyperframes folder> --out=<FINAL.mp4> [--fps=30] [--workers=6] [--quality=standard] [--title="…" --slug=… --ep=EP01] [--no-master] [--force]');
  process.exit(2);
}
const proj = path.resolve(project), outAbs = path.resolve(out);
if (!fs.existsSync(path.join(proj, "index.html"))) { console.error(`${proj}: no index.html (not a HyperFrames project)`); process.exit(2); }
const fps = arg("fps", "30"), workers = arg("workers", "6"), quality = arg("quality", "standard");
const here = path.dirname(fileURLToPath(import.meta.url));

// 1. up-to-date guard
const h = crypto.createHash("sha1");
h.update(JSON.stringify({ fps, quality, title: arg("title"), slug: arg("slug"), ep: arg("ep"), master: !process.argv.includes("--no-master") }));
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".hyperframes", "renders", "node_modules", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else { const s = fs.statSync(p); h.update(`${path.relative(proj, p)}|${s.size}|${Math.round(s.mtimeMs)}\n`); }
  }
};
walk(proj);
const key = h.digest("hex").slice(0, 16);
const stamp = `${outAbs}.render.json`;
if (fs.existsSync(outAbs) && fs.existsSync(stamp) && !process.argv.includes("--force")) {
  const prev = JSON.parse(fs.readFileSync(stamp, "utf8"));
  if (prev.key === key) { console.log(`up to date: ${out} was rendered ${prev.at} from the same project and metadata; nothing to do (--force renders it again)`); process.exit(0); }
  console.log(`${out} is out of date (project or metadata changed since ${prev.at}); rendering`);
}

// 2. render
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
const raw = outAbs.replace(/\.mp4$/i, "") + ".raw.mp4";
const t0 = Date.now();
const r = spawnSync("npx", ["hyperframes", "render", "-o", raw, "-f", fps, "-q", quality, "-w", workers], { cwd: proj, stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0 || !fs.existsSync(raw)) { console.error(`hyperframes render failed (exit ${r.status})`); process.exit(r.status || 1); }
console.log(`rendered ${raw} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);

// 3. master
const hasAudio = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", raw], { encoding: "utf8" }).stdout.trim() !== "";
if (hasAudio && !process.argv.includes("--no-master")) {
  const m = spawnSync(process.execPath, [path.join(here, "deliver.mjs"), raw, outAbs], { stdio: "inherit" });
  if (m.status !== 0) process.exit(m.status ?? 1);
  fs.rmSync(raw, { force: true });
} else {
  fs.renameSync(raw, outAbs);
  if (!hasAudio) console.log("(no audio stream: not mastered)");
}

// 4. metadata
if (arg("title") || arg("slug")) {
  const year = new Date().getFullYear(), date = new Date().toISOString().slice(0, 10);
  const comment = `AUDIRA-${arg("slug", path.basename(path.dirname(proj)))}${arg("ep") ? `-${arg("ep")}` : ""} | audira.my.id`;
  const tagged = outAbs.replace(/\.mp4$/i, "") + ".tagged.tmp.mp4";
  const t = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", outAbs, "-map", "0", "-c", "copy", "-map_metadata", "-1",
    "-metadata", `title=${arg("title", path.basename(outAbs))}`, "-metadata", `artist=${arg("artist", "AUDIRA (Agus Dwi R.)")}`,
    "-metadata", `copyright=${arg("copyright", `© ${year} AUDIRA - Agus Dwi R. All rights reserved.`)}`,
    "-metadata", `comment=${comment}`, "-metadata", `date=${date}`, "-movflags", "+faststart+use_metadata_tags", tagged], { encoding: "utf8" });
  if (t.status !== 0) { console.error(t.stderr); process.exit(1); }
  fs.renameSync(tagged, outAbs);
  console.log(`metadata: written (${comment})`);
}

// Digital signature (brand contract, anti-reupload): Ed25519 over the stream hashes, written into the MP4
// and <final>.sig.json; then C2PA Content Credentials when c2patool is installed. --no-sign / --no-c2pa skip.
if ((arg("title") || arg("slug")) && !process.argv.includes("--no-sign")) {
  try {
    const { signFile, embedSignature, verifyFile } = await import("./lib/sign.mjs");
    const signed = signFile(outAbs);
    embedSignature(outAbs, signed);
    let note = "";
    if (!process.argv.includes("--no-c2pa")) {
      const { embedC2pa } = await import("./lib/c2pa.mjs");
      const c = embedC2pa(outAbs, signed.payload);
      note = c.ok ? ", C2PA embedded" : ` (C2PA skipped: ${c.message})`;
    }
    console.log(`signature: Ed25519 key ${signed.payload.keyId}, ${verifyFile(outAbs, { sidecar: false }).status}${note}`);
  } catch (e) {
    console.error(`signature failed: ${e.message} (sign later with npm run sign -- <final.mp4>)`);
  }
}
fs.writeFileSync(stamp, JSON.stringify({ key, at: new Date().toISOString(), engine: "hyperframes", project: proj }, null, 2) + "\n");
console.log(`final: ${out}`);
