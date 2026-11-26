// Final delivery, cross-platform and restartable: bundle once, render the composition muted in
// segments (finished segments are kept and skipped when re-run — delete out/seg after a source
// edit), join them, lay the voice-over in at its offset, then master the audio to -14 LUFS.
//   node scripts/render-final.mjs --comp=<id> --out=out/film.mp4 [--vo=public/audio/vo.mp3 --offset=0.4]
//        [--parts=3] [--concurrency=2] [--jobs=1] [--gl=angle|vulkan] [--crf=17] [--encoder=x264|nvenc] [--cq=19]
// Bounded concurrency + segments: one-pass high-concurrency 1080p renders have filled disks via swap.
//
// --jobs=N renders N segments at the same time, each in its own Node process (one Node process feeds its
// browser tabs from a single thread, so one process cannot fill a strong PC; several can). The film is cut
// into at least N segments. Keep jobs x concurrency at about 12: above that, renders slow down sharply.
// Measured 2026-11-10 (Ryzen 7 5700X, RTX 3060, 1920x1080 scene): 1 process c=8 angle 15.5 fps;
// --gl=vulkan 22.5 fps; --gl=vulkan --jobs=6 --concurrency=2 about 50-55 fps.
// --gl picks the headless Chrome WebGL backend (default: GL env var, .gl-mode, then "angle"). "vulkan" is
// faster on NVIDIA; if it cannot create a WebGL context the segment is retried on "angle", then software.
// --encoder=nvenc moves H.264 encoding to an NVIDIA GPU (Remotion's bundled ffmpeg has h264_nvenc), larger
// files at the same look (--cq, lower = better). Falls back to x264 when no NVENC device is found.
// Delete out/seg before switching encoder mid-render.

import "./lib/tmpdir.mjs";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { glMode, isWebGLError, switchToSoftware, tolerateClosedTargets } from "./gl.mjs";
import { context, records, remember } from "./lib/memory.mjs";
import { withRenderPort } from "./lib/render-port.mjs";
// --parallel-safe (or AUDIRA_PARALLEL=5): up to 5 renders at the same time on one PC. Forces --jobs=1
// --concurrency=2, so 5 renders x 2 tabs = 10 tabs, under the ~12 tab limit (rule 07 §4).
if (!process.argv.includes("--worker") && (process.argv.includes("--parallel-safe") || Number(process.env.AUDIRA_PARALLEL) > 1)) {
  process.argv = process.argv.filter((a) => !/^--(jobs|concurrency)=/.test(a)).concat("--jobs=1", "--concurrency=2");
  console.log("parallel-safe: --jobs=1 --concurrency=2");
}

tolerateClosedTargets();

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const comp = arg("comp"), out = arg("out"), vo = arg("vo"), offset = Number(arg("offset", "0"));
const jobs = Math.max(1, Number(arg("jobs", "1")));
const parts = Math.max(Number(arg("parts", "3")), jobs), concurrency = Number(arg("concurrency", "2")), crf = Number(arg("crf", "17"));
const encoder = arg("encoder", "x264");
const cq = arg("cq", "19");
const glArg = arg("gl", glMode());
if (!comp || (!out && !process.argv.includes("--worker")) || !["x264", "nvenc"].includes(encoder)) {
  console.error("usage: node scripts/render-final.mjs --comp=<id> --out=<file.mp4> [--vo=<audio> --offset=<s>] [--parts=3] [--concurrency=2] [--jobs=1] [--gl=angle|vulkan] [--encoder=x264|nvenc]");
  process.exit(1);
}
// Swap Remotion's libx264 arguments for NVENC (constant-quality VBR, high profile).
const nvencArgs = ({ args }) => {
  const a = [...args];
  const c = a.indexOf("-crf");
  if (c >= 0) a.splice(c, 2);
  const i = a.indexOf("libx264");
  if (i >= 0) a.splice(i, 1, "h264_nvenc", "-preset", "p5", "-tune", "hq", "-rc", "vbr", "-cq", cq, "-b:v", "0", "-profile:v", "high");
  return a;
};
const isNvencError = (e) => /nvenc|nvcuda|No capable devices|Cannot load|OpenEncodeSessionEx/i.test(String(e?.stack ?? e));

/** Render frames a..b to tmp, falling back NVENC -> x264 and vulkan -> angle -> software. */
async function renderRange(serveUrl, composition, a, b, tmp, onProgress) {
  let gl = glArg, enc = encoder;
  for (;;) {
    try {
      await withRenderPort((port) => renderMedia({ port, composition, serveUrl, codec: "h264", crf: enc === "nvenc" ? undefined : crf, pixelFormat: "yuv420p", muted: true,
        frameRange: [a, b], outputLocation: tmp, concurrency, imageFormat: "jpeg", jpegQuality: 95, chromiumOptions: { gl },
        timeoutInMilliseconds: 300000, ffmpegOverride: enc === "nvenc" ? nvencArgs : undefined, onProgress,
      }));
      return;
    } catch (e) {
      if (enc === "nvenc" && isNvencError(e)) {
        console.error("\n! NVENC not available on this computer: falling back to x264.");
        enc = "x264";
      } else if (isWebGLError(e) && gl === "vulkan") {
        console.error("\n! Vulkan WebGL failed: falling back to angle.");
        gl = "angle";
      } else if (isWebGLError(e) && gl !== "swangle") {
        gl = switchToSoftware();
      } else throw e;
    }
  }
}

// Worker mode: render one segment from an existing bundle, then exit. Started by the parent below.
if (process.argv.includes("--worker")) {
  const serveUrl = arg("serve"), a = Number(arg("from")), b = Number(arg("to")), tmp = arg("tmp");
  const composition = await withRenderPort((port) => selectComposition({ port, serveUrl, id: comp }));
  await renderRange(serveUrl, composition, a, b, tmp, ({ progress }) => process.stdout.write(`${Math.round(progress * 100)}\n`));
  process.exit(0);
}

// Memory gate: inside an episode, a final needs a passing draft score in motion memory first
// (pipeline stage 8). --skip-memory-gate="<reason>" overrides it; the reason is recorded with the final.
const mctx = context({ comp });
const skipGate = arg("skip-memory-gate");
if (mctx.episode && mctx.style && !skipGate && process.env.AUDIRA_MEMORY !== "off") {
  const rec = await records(mctx.style, mctx.label);
  if (rec && !rec.scores.some((s) => s.stage === "draft" && s.pass)) {
    console.error(`Gate: no passing draft score for ${mctx.style} / ${mctx.label} in motion memory.\n` +
      `  Run npm run audit:visual on the draft sheet, then audira_style_memory record_score (stage "draft", episode "${mctx.label}").\n` +
      `  Override only with a reason: --skip-memory-gate="<reason>"`);
    process.exit(1);
  }
} else if (mctx.episode && !mctx.style) {
  console.error(`(motion memory: no style found for ${mctx.episode.dir}; set data.style in STATUS.json so this final is recorded)`);
}

const ff = (a) => {
  const r = spawnSync("ffmpeg", a, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr);
};
// One folder per composition + output, so several renders can run at once in the same project.
const segDir = path.join("out", "seg", `${comp}-${path.parse(out).name}`);
fs.mkdirSync(segDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await withRenderPort((port) => selectComposition({ port, serveUrl, id: comp }));
const N = composition.durationInFrames;
const count = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim() || 0);
const list = [];
const todo = [];
for (let i = 0; i < parts; i++) {
  const a = Math.floor((N * i) / parts), b = Math.floor((N * (i + 1)) / parts) - 1;
  const part = path.join(segDir, `part${i}.mp4`);
  list.push(`file 'part${i}.mp4'`);
  if (fs.existsSync(part) && count(part) === b - a + 1) console.log(`part ${i} (${a}-${b}) done, skipping`);
  else todo.push({ i, a, b, part, tmp: path.join(segDir, `part${i}.tmp.mp4`) });
}
console.log(`${N} frames, ${parts} parts, ${todo.length} to render: ${Math.min(jobs, todo.length || 1)} at a time, concurrency ${concurrency}, gl ${glArg}, ${encoder}`);
const t0 = Date.now();

if (jobs === 1) {
  for (const p of todo) {
    console.log(`part ${p.i}: frames ${p.a}-${p.b}`);
    await renderRange(serveUrl, composition, p.a, p.b, p.tmp, ({ progress }) => process.stdout.write(`\r  ${(progress * 100).toFixed(0)}%`));
    process.stdout.write("\n");
    fs.renameSync(p.tmp, p.part);
  }
} else {
  // Several Node processes share the one bundle; each renders a segment and reports its progress.
  const self = fileURLToPath(import.meta.url);
  const done = new Map();
  const show = () => {
    const f = todo.reduce((s, p) => s + ((done.get(p.i) ?? 0) / 100) * (p.b - p.a + 1), 0);
    process.stdout.write(`\r  ${Math.round((f / todo.reduce((s, p) => s + p.b - p.a + 1, 0)) * 100)}%  (${(f / ((Date.now() - t0) / 1000)).toFixed(1)} fps)   `);
  };
  const runWorker = (p) => new Promise((resolve, reject) => {
    const w = spawn(process.execPath, [self, "--worker", `--comp=${comp}`, `--serve=${serveUrl}`, `--from=${p.a}`, `--to=${p.b}`, `--tmp=${p.tmp}`,
      `--concurrency=${concurrency}`, `--gl=${glArg}`, `--encoder=${encoder}`, `--cq=${cq}`, `--crf=${crf}`], { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    w.stdout.on("data", (d) => { const v = String(d).trim().split(/\s+/).pop(); if (/^\d+$/.test(v)) { done.set(p.i, Number(v)); show(); } });
    w.stderr.on("data", (d) => { err += d; if (/^\n?!/.test(String(d))) process.stderr.write(d); });
    w.on("close", (code) => {
      if (code !== 0) return reject(new Error(`part ${p.i} failed (exit ${code}):\n${err.slice(-2000)}`));
      fs.renameSync(p.tmp, p.part);
      done.set(p.i, 100);
      show();
      resolve();
    });
  });
  const queue = [...todo];
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
    while (queue.length) await runWorker(queue.shift());
  }));
  process.stdout.write("\n");
}
if (todo.length) console.log(`rendered ${todo.reduce((s, p) => s + p.b - p.a + 1, 0)} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

fs.rmSync(serveUrl, { recursive: true, force: true });
fs.writeFileSync(path.join(segDir, "list.txt"), list.join("\n") + "\n");
fs.mkdirSync(path.dirname(out), { recursive: true });
const dur = (N / composition.fps).toFixed(4);
const joined = path.join(segDir, "joined.mp4");
if (vo) {
  ff(["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(segDir, "list.txt"), "-i", vo, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
    "-af", `adelay=${Math.round(offset * 1000)}:all=1,apad`, "-t", dur, "-c:a", "aac", "-b:a", "320k", "-ar", "48000", joined]);
  const r = spawnSync("node", [path.join("scripts", "deliver.mjs"), joined, out], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
} else {
  ff(["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(segDir, "list.txt"), "-c", "copy", "-movflags", "+faststart", out]);
}
fs.rmSync(segDir, { recursive: true, force: true });
console.log(`final: ${out} (${N} frames, ${composition.width}×${composition.height} @ ${composition.fps} fps)`);

// motion memory: measure the delivered MP4 (8 frames + motion) and record it as this episode's final run
if (mctx.style && process.env.AUDIRA_MEMORY !== "off") {
  const look = path.join(path.dirname(out), `${path.parse(out).name}.look.json`);
  const a = [path.join(path.dirname(fileURLToPath(import.meta.url)), "visual-audit.mjs"), `--video=${out}`, `--comp=${comp}`,
    "--source=render:final", "--stage=final", `--json=${look}`];
  if (composition.width > composition.height) a.push("--wide");
  const r = spawnSync(process.execPath, a, { encoding: "utf8" });
  const capped = (r.stdout?.match(/PERLU POLES:[^\n]*/) || [])[0];
  if (r.status === 0 || r.status === 1) console.log(`audit: ${mctx.style} / ${mctx.label}: ${capped ?? "no aspect capped below 4"} (${look})`);
  else console.error(`(audit of the final skipped: ${String(r.stderr || r.error?.message || "").trim().split("\n")[0]})`);
  if (skipGate) await remember({ action: "append_lesson", style: mctx.style, episode: mctx.label, kind: "failed", text: `Final dirender tanpa skor draft yang lolos: ${skipGate}` }, mctx);
}
// a part that failed on the GPU path leaves its timeout timer behind; do not wait for it
process.exit(0);
