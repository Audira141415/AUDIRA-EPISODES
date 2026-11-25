// Two YouTube thumbnails for the long-form video (rule 09: Test & Compare), taken from the film itself.
//   Remotion:     npm run thumbs -- <WideComp> --episode=<folder> --text="TEKS A|TEKS B" [--at=12s,95s] [--side=left|right] [--color=#FFD23F]
//   HyperFrames:  node <starter>/scripts/thumbs.mjs --hyperframes=<wide project> --episode=<folder> --text="A|B" [--at=12,95]
//   Any MP4:      node <starter>/scripts/thumbs.mjs --from-video=<FINAL_LONG.mp4> --episode=<folder> --text="A|B" [--at=12,95]
//
// For each variant: takes the 16:9 frame at that time, scales it to 1280×720, sets the 3–5 word text big
// and high-contrast (Anton, dark outline and shadow) on the chosen side, and writes
// <episode>/thumbnails/thumb-a.jpg and thumb-b.jpg under 2 MB. Pick times where the main face or object
// is large; the default is the approved cover moment (style/cover.json) and the middle of the film.
// YOUTUBE_LONG.md is checked against these files by audira_validate_social_captions.

import "./lib/tmpdir.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { durationOf, frameFromHyperframes, frameFromVideo, sizeOf } from "./lib/frame-source.mjs";

const opt = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const comp = process.argv.slice(2).find((a) => !a.startsWith("--"));
const video = opt("from-video"), hf = opt("hyperframes");
const episode = opt("episode");
const texts = opt("text").split("|").map((s) => s.trim()).filter(Boolean);
if ((!comp && !video && !hf) || !episode || texts.length !== 2) {
  console.error('usage: npm run thumbs -- <WideComp> | --hyperframes=<project> | --from-video=<mp4>  --episode=<folder> --text="TEKS A|TEKS B" [--at=…] [--side=left|right] [--color=#FFD23F]');
  process.exit(2);
}
for (const t of texts) {
  const n = t.split(/\s+/).length;
  if (n < 3 || n > 5) { console.error(`"${t}": ${n} kata; teks thumbnail harus 3–5 kata`); process.exit(2); }
}
const root = path.resolve(episode);
const outDir = path.join(root, "thumbnails");
fs.mkdirSync(outDir, { recursive: true });
const coverJson = path.join(root, "style", "cover.json");
const coverSec = fs.existsSync(coverJson) ? JSON.parse(fs.readFileSync(coverJson, "utf8")).seconds : null;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "thumbs-"));

// stills[i] = PNG of variant i
const stills = [];
if (comp) {
  const { bundle } = await import("@remotion/bundler");
  const { openBrowser, renderStill, selectComposition } = await import("@remotion/renderer");
  const { glMode } = await import("./gl.mjs");
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const composition = await selectComposition({ serveUrl, id: comp });
  if (composition.width <= composition.height) { console.error(`${comp} is not 16:9 (${composition.width}x${composition.height}); use the <Nama>WideFinal composition`); process.exit(2); }
  const times = opt("at") ? opt("at").split(",") : [`${coverSec ?? 0.3}s`, `${((composition.durationInFrames / composition.fps) * 0.5).toFixed(1)}s`];
  const frameAt = (t) => Math.min(composition.durationInFrames - 1, t.endsWith("s") ? Math.round(parseFloat(t) * composition.fps) : parseInt(t, 10));
  const gl = glMode();
  const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
  for (let i = 0; i < 2; i++) {
    const still = path.join(tmp, `t${i}.png`);
    await renderStill({ composition, serveUrl, output: still, frame: frameAt(times[i] ?? times[0]), puppeteerInstance: browser, chromiumOptions: { gl }, timeoutInMilliseconds: 180000 });
    stills.push({ file: still, at: times[i] ?? times[0] });
  }
  await browser.close({ silent: true });
  fs.rmSync(serveUrl, { recursive: true, force: true });
} else {
  const dur = video ? await durationOf(path.resolve(video)) : null;
  const times = opt("at") ? opt("at").split(",").map((s) => parseFloat(s)) : [coverSec ?? 0.3, dur ? +(dur * 0.5).toFixed(1) : 10];
  for (let i = 0; i < 2; i++) {
    const still = path.join(tmp, `t${i}.png`);
    const t = times[i] ?? times[0];
    if (hf) frameFromHyperframes(path.resolve(hf), t, still); else frameFromVideo(path.resolve(video), t, still);
    const { width, height } = await sizeOf(still);
    if (width <= height) { console.error(`frame at ${t}s is ${width}x${height}, not 16:9: use the long-form (wide) film or project`); process.exit(2); }
    stills.push({ file: still, at: `${t}s` });
  }
}

const font = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "fonts", "Anton-Regular.ttf").replace(/\\/g, "/").replace(/:/g, "\\:");
const side = opt("side", "left"), color = opt("color", "#FFD23F");
for (let i = 0; i < 2; i++) {
  // text in up to 2 lines, big enough to read at 160 px wide
  const words = texts[i].toUpperCase().split(/\s+/);
  const lines = words.length <= 2 ? [words.join(" ")] : [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")];
  const x = side === "right" ? "w-tw-60" : "60";
  const draw = lines.map((l, j) => `drawtext=fontfile='${font}':text='${l.replace(/'/g, "’").replace(/:/g, "\\:")}':fontsize=132:fontcolor=${j === lines.length - 1 ? color : "white"}:borderw=10:bordercolor=black@0.9:shadowx=6:shadowy=6:shadowcolor=black@0.6:x=${x}:y=h-${(lines.length - j) * 150 + 40}`).join(",");
  const vf = `scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=contrast=1.08:saturation=1.12,${draw}`;
  const out = path.join(outDir, `thumb-${"ab"[i]}.jpg`);
  let q = 2, r;
  do {
    r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", stills[i].file, "-vf", vf, "-q:v", String(q), out], { encoding: "utf8" });
    if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
    q++;
  } while (fs.statSync(out).size >= 2 * 1024 * 1024 && q < 10);
  console.log(`${out}  (${stills[i].at}, "${texts[i]}", ${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
}
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(0);
