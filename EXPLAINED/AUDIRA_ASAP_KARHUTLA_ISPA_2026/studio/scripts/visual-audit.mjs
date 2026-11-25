// Visual audit for the draft gate (stage 8): measure the key frames, compare them with the
// style's quality-bar cover, and print the highest score each aspect can honestly get.
// The judge (you) still scores by eye with qa/scoring-rubric.md, but never above these ceilings.
//
//   npm run audit:visual -- out/qa                     (folder of stills from `npm run stills`)
//   npm run audit:visual -- out/qa/_sheet.jpg [--grid=4x2]
//   npm run audit:visual -- --video=out/clip.mp4 --at=1,4.5,9,14
//   options: --style=FILMNOIR | --cover=path/to/cover.png   --sheet=out/qa/compare.jpg   --json=out/qa/look.json
//            --flat-style   (deliberately flat look: RISOFORGE, UKIYOFORGE, COMICFORGE … skips the flat-plane rule)
//
// Cover lookup for --style: $AUDIRA_MOTION_DIR/references/quality-bar, ../../references/quality-bar
// (inside the skill), then F:/AUDIRA-SKILL-MOTION/references/quality-bar.
// Exit 0 = every ceiling is 5 or 4 (may pass), 1 = some aspect is capped at 3 or lower, 2 = bad input.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadFrames, videoFrames, measure, thumb, thumbDiff, motionProfile, W, H } from "./lib/look.mjs";
import { probe } from "./lib/av.mjs";

const STILL = Number(process.env.AUDIRA_STILL_THRESHOLD ?? 0.6); // mean luma change per 0.25 s below this = still
import { ceilings, ASPECTS } from "./lib/ceilings.mjs";

const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const inputs = args.filter((a) => !a.startsWith("--"));
const video = opt("video");
const die = (m) => { console.error(m); process.exit(2); };
if (!inputs.length && !video) die("usage: npm run audit:visual -- <stills dir | sheet.jpg | frames...> [--video=clip.mp4 --at=1,4,9] [--style=NAME|--cover=file] [--sheet=compare.jpg] [--json=look.json] [--grid=CxR] [--flat-style]");

// ---- frames under test ----
let frames = [];
try {
  for (const inp of inputs) {
    if (!fs.existsSync(inp)) die(`${inp}: not found`);
    if (fs.statSync(inp).isDirectory()) {
      const files = fs.readdirSync(inp).filter((f) => /\.(png|jpe?g)$/i.test(f) && !f.startsWith("_") && !/compare/i.test(f)).sort();
      for (const f of files) frames.push(...loadFrames(path.join(inp, f)));
    } else frames.push(...loadFrames(inp, opt("grid")));
  }
  if (video) {
    if (!fs.existsSync(video)) die(`${video}: not found`);
    const dur = probe(video).duration;
    const at = opt("at") ? opt("at").split(",").map(Number) : Array.from({ length: 8 }, (_, i) => +(dur * (i + 0.5) / 8).toFixed(2));
    frames.push(...videoFrames(video, at));
  }
} catch (e) { die(String(e.message)); }
if (!frames.length) die("no frames found");

// ---- reference cover ----
const here = path.dirname(fileURLToPath(import.meta.url));
let coverFile = opt("cover");
if (!coverFile && opt("style")) {
  const name = opt("style").toLowerCase();
  const dirs = [process.env.AUDIRA_MOTION_DIR && path.join(process.env.AUDIRA_MOTION_DIR, "references/quality-bar"), path.resolve(here, "../../references/quality-bar"), "F:/AUDIRA-SKILL-MOTION/references/quality-bar"].filter(Boolean);
  for (const d of dirs) for (const ext of ["png", "jpg"]) { const f = path.join(d, `${name}.${ext}`); if (!coverFile && fs.existsSync(f)) coverFile = f; }
  if (!coverFile) console.log(`(no quality-bar cover for ${opt("style")}: only absolute checks run)`);
}
const cover = coverFile ? loadFrames(coverFile) : [];

// ---- measure ----
const fm = frames.map((f) => ({ label: f.label, ...measure(f.rgb) }));
const cm = cover.map((f) => measure(f.rgb));
const thumbs = frames.map((f) => thumb(f.rgb));
let diffSum = 0, pairs = 0;
for (let i = 0; i < thumbs.length; i++) for (let j = i + 1; j < thumbs.length; j++) { diffSum += thumbDiff(thumbs[i], thumbs[j]); pairs++; }
const diversity = pairs ? +(diffSum / pairs).toFixed(1) : null;

let motion = null;
if (video) {
  const secs = motionProfile(video);
  const stillAt = secs.map((v, i) => (v < STILL ? i : -1)).filter((i) => i >= 0);
  motion = { seconds: secs.length, stillSeconds: stillAt.length, stillPct: +(stillAt.length / secs.length * 100).toFixed(0), meanMotion: +(secs.reduce((a, b) => a + b, 0) / secs.length).toFixed(2), stillAt, perSecond: secs };
}

const result = ceilings({ frames: fm, cover: cm, diversity, motion, flatStyle: args.includes("--flat-style") });

// ---- report ----
const avg = (list, k) => (list.length ? +(list.reduce((a, m) => a + m[k], 0) / list.length).toFixed(2) : null);
const keys = ["range", "clipHi", "crushLo", "detail", "flat", "sepLum", "sepDetail", "saturation", "bottomBusy"];
console.log(`${frames.length} frames${coverFile ? ` vs cover ${path.basename(coverFile)} (${cover.length} tile${cover.length > 1 ? "s" : ""})` : ""}${diversity !== null ? ` · keyframe diversity ${diversity}` : ""}${motion ? ` · still ${motion.stillSeconds}/${motion.seconds} s` : ""}\n`);
console.log("frame".padEnd(26) + keys.map((k) => k.slice(0, 9).padStart(10)).join(""));
for (const m of fm) console.log(m.label.slice(-25).padEnd(26) + keys.map((k) => String(m[k]).padStart(10)).join(""));
console.log("AVERAGE".padEnd(26) + keys.map((k) => String(avg(fm, k)).padStart(10)).join(""));
if (cm.length) console.log("COVER".padEnd(26) + keys.map((k) => String(avg(cm, k)).padStart(10)).join(""));
console.log("\nceiling per aspect (score may not exceed this):");
for (const a of ASPECTS) {
  const c = result.ceil[a];
  console.log(`  ${a.padEnd(12)} ${c === null ? "—  (not measurable here: judge by eye)" : c}`);
  for (const why of result.why[a]) console.log(`               - ${why}`);
}
for (const w of result.notes) console.log(`  note: ${w}`);
const capped = ASPECTS.filter((a) => result.ceil[a] !== null && result.ceil[a] <= 3);
console.log(capped.length ? `\nPERLU POLES: ${capped.join(", ")} capped at 3 or lower. Fix these before scoring.` : "\nNo aspect capped below 4. Score by eye with qa/scoring-rubric.md against the compare sheet.");

// ---- compare sheet: cover tiles on top, frames below (one image, ±1200 px wide) ----
if (opt("sheet")) {
  const tw = 150, th = Math.round(tw * H / W), cols = 8;
  const rowsCover = cover.length ? Math.ceil(Math.min(cover.length, cols) / cols) : 0, rowsFrames = Math.ceil(frames.length / cols);
  const gap = 12, SW = cols * tw, SH = (rowsCover + rowsFrames) * th + (rowsCover ? gap : 0);
  const buf = Buffer.alloc(SW * SH * 3, 24);
  const blit = (rgb, x0, y0) => {
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const sx = Math.floor(x * W / tw), sy = Math.floor(y * H / th), si = (sy * W + sx) * 3, di = ((y0 + y) * SW + x0 + x) * 3;
      buf[di] = rgb[si]; buf[di + 1] = rgb[si + 1]; buf[di + 2] = rgb[si + 2];
    }
  };
  cover.slice(0, cols).forEach((f, i) => blit(f.rgb, i * tw, 0));
  frames.forEach((f, i) => blit(f.rgb, (i % cols) * tw, rowsCover * th + (rowsCover ? gap : 0) + Math.floor(i / cols) * th));
  fs.mkdirSync(path.dirname(path.resolve(opt("sheet"))), { recursive: true });
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${SW}x${SH}`, "-i", "-", "-frames:v", "1", "-q:v", "3", opt("sheet")], { input: buf });
  if (r.status === 0) console.log(`compare sheet: ${opt("sheet")} (top: cover, bottom: your frames)`);
}
if (opt("json")) {
  fs.writeFileSync(opt("json"), JSON.stringify({ cover: coverFile ?? null, diversity, motion, frames: fm, coverMetrics: cm, ceilings: result.ceil, reasons: result.why, notes: result.notes }, null, 2));
  console.log(`json: ${opt("json")} (pass it to audira_style_memory record_score as \`ceilings\`)`);
}
process.exitCode = capped.length ? 1 : 0;
