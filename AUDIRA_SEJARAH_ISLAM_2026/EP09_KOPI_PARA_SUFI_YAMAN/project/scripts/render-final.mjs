// Final delivery, cross-platform and restartable: bundle once, render the composition muted in
// segments, join them, lay the voice-over in at its offset, then master the audio to -14 LUFS.
// Resume: finished segments are kept and skipped when re-run. They are tied to a fingerprint of
// src/, public/, the composition and the encoder, so after an edit the stale ones are discarded on
// their own: never delete out/seg by hand (render_all.sh did, and a failed 6-minute Wide render
// restarted from zero). --fresh discards them on purpose.
// Preflight: before rendering, small stills at up to 7 segment starts plus the last frame are rendered,
// so a crash, a missing asset or a WebGL failure stops the run in seconds instead of minutes into
// the film. --no-preflight skips it.
//   node scripts/render-final.mjs --comp=<id> --out=out/film.mp4 [--vo=public/audio/vo.mp3 --offset=0.4] [--sfx=public/audio/sfx.wav]
//        [--parts=3, or 3 x jobs] [--concurrency=2] [--jobs=1] [--gl=angle|vulkan] [--crf=17] [--encoder=x264|nvenc] [--cq=19]
//        [--title="<judul>" --slug=<slug> --ep=EP01 [--artist=… --copyright=…]]   ownership metadata + digital
//        signature (Ed25519 + C2PA when c2patool is installed; --no-sign / --no-c2pa), see the end
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
// Switching encoder changes the fingerprint, so segments of the old encoder are discarded on their own.

import "./lib/tmpdir.mjs";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { glMode, isWebGLError, switchToSoftware, tolerateClosedTargets } from "./gl.mjs";
import { context, records, remember } from "./lib/memory.mjs";

tolerateClosedTargets();

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const comp = arg("comp"), out = arg("out"), vo = arg("vo"), sfx = arg("sfx"), offset = Number(arg("offset", "0"));
if (sfx && !process.argv.includes("--worker") && !fs.existsSync(sfx)) { console.error(`--sfx=${sfx}: not found (make it with npm run sfx)`); process.exit(1); }
const jobs = Math.max(1, Number(arg("jobs", "1")));
// Default parts = 3 x jobs: segments differ in weight, and with one segment per process the last heavy
// one ran alone while the CPU sat at ~40% (2026-11-11, EP03 5152 frames: 7 parts 115 s, 18 parts 106 s).
const parts = Math.max(Number(arg("parts", String(jobs > 1 ? jobs * 3 : 3))), jobs), concurrency = Number(arg("concurrency", "2")), crf = Number(arg("crf", "17"));
const encoder = arg("encoder", "x264");
const cq = arg("cq", "19");
const glArg = arg("gl", glMode());
if (!comp || (!out && !process.argv.includes("--worker")) || !["x264", "nvenc"].includes(encoder)) {
  console.error("usage: node scripts/render-final.mjs --comp=<id> --out=<file.mp4> [--vo=<audio> --offset=<s>] [--parts=3] [--concurrency=2] [--jobs=1] [--gl=angle|vulkan] [--encoder=x264|nvenc]");
  process.exit(1);
}
// Encoder arguments for Remotion's "pre-stitcher" pass (the only pass that encodes; "stitcher" copies).
// - Range: frames are piped as MJPEG, which ffmpeg decodes as full-range yuvj, and both libx264 and
//   NVENC kept that: every final came out yuvj420p / color_range pc, which qa-gate rejects and some
//   players show washed out (each Makkah final needed a separate re-encode pass, 2026-11-11).
//   Convert to limited-range yuv420p and tag BT.709 inside the same encode.
// - nvenc: swap libx264 for h264_nvenc (constant-quality VBR, high profile).
const encodeArgs = (enc) => ({ type, args }) => {
  if (type !== "pre-stitcher") return args;
  const a = [...args];
  const out = a.length - 1;
  a.splice(out, 0, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p",
    "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709");
  if (enc === "nvenc") {
    const c = a.indexOf("-crf");
    if (c >= 0) a.splice(c, 2);
    const i = a.indexOf("libx264");
    if (i >= 0) a.splice(i, 1, "h264_nvenc", "-preset", "p5", "-tune", "hq", "-rc", "vbr", "-cq", cq, "-b:v", "0", "-profile:v", "high");
  }
  return a;
};
const isNvencError = (e) => /nvenc|nvcuda|No capable devices|Cannot load|OpenEncodeSessionEx/i.test(String(e?.stack ?? e));

/** Render frames a..b to tmp, falling back NVENC -> x264 and vulkan -> angle -> software. */
async function renderRange(serveUrl, composition, a, b, tmp, onProgress) {
  let gl = glArg, enc = encoder;
  for (;;) {
    try {
      await renderMedia({
        composition, serveUrl, codec: "h264", crf: enc === "nvenc" ? undefined : crf, pixelFormat: "yuv420p", muted: true,
        frameRange: [a, b], outputLocation: tmp, concurrency, imageFormat: "jpeg", jpegQuality: 95, chromiumOptions: { gl },
        timeoutInMilliseconds: 300000, ffmpegOverride: encodeArgs(enc), onProgress,
      });
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
  const composition = await selectComposition({ serveUrl, id: comp });
  await renderRange(serveUrl, composition, a, b, tmp, ({ progress }) => process.stdout.write(`${Math.round(progress * 100)}\n`));
  process.exit(0);
}

// Determinism gate: an unseeded random number or a clock read draws a different picture in each render
// tab, and segments rendered in different tabs then flicker or jump at the joins. --skip-det="<reason>"
// overrides it (for a scene that is known to be safe).
if (!arg("skip-det") && fs.existsSync(path.join("scripts", "determinism-check.mjs"))) {
  const det = spawnSync("node", [path.join("scripts", "determinism-check.mjs"), "--from=src/index.ts"], { encoding: "utf8" });
  if (det.status === 1) {
    console.error(det.stdout.trim() + `
Gate: fix these before the final render, or override with --skip-det="<reason>".`);
    process.exit(1);
  }
}

// Memory gate: inside an episode, a final needs a passing draft score in motion memory first
// (pipeline stage 8). --skip-memory-gate="<reason>" overrides it; the reason is recorded with the final.
const mctx = context({ comp });
const skipGate = arg("skip-memory-gate");
if (mctx.episode && mctx.style && !skipGate && process.env.AUDIRA_MEMORY !== "off") {
  const rec = await records(mctx.style, mctx.label);
  if (rec && !rec.scores.some((s) => s.stage === "draft" && s.pass && s.judge === "jury")) {
    console.error(`Gate: no passing draft score from the blind jury for ${mctx.style} / ${mctx.label} in motion memory.\n` +
      `  Run npm run audit:visual on the draft sheet, score it (audira_style_memory record_score, stage "draft", episode "${mctx.label}"),\n` +
      `  then have a blind jury subagent score it (qa/jury.md) and record that with judge "jury".\n` +
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
// Channel for <AudiraSignature> and <AudiraOutro> (rule 08): written into src/brand/channel.json before the
// bundle; a missing outro card or a typed handle/name that does not match the series' channel stops the final here.
{
  const { writeChannel, checkBrandMarks } = await import("./lib/channel.mjs");
  const ch = writeChannel();
  const bad = ch.problem ? [{ msg: ch.problem }] : checkBrandMarks().filter((r) => r.level === "fail");
  if (bad.length && !arg("skip-channel")) {
    console.error(`Channel gate (signature handle, outro card):\n${bad.map((r) => `  ${r.msg}`).join("\n")}\n  Fix it, or override with --skip-channel="<reason>".`);
    process.exit(1);
  }
  if (!ch.problem) console.log(`channel: ${ch.handle}${ch.written ? " (wrote src/brand/channel.json)" : ""}`);
}
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp });
const N = composition.durationInFrames;
// parseInt, not Number: ffprobe prints "20," (trailing comma), and Number("20,") is NaN, which made every
// finished segment look incomplete, so resume never skipped anything (found 2026-11-11).
const count = (f) => parseInt(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout, 10) || 0;

// Segments belong to one state of the source: path + size + mtime of every file under src/ and
// public/, plus the composition and encoder settings. A different state discards them.
const sourceState = () => {
  const h = crypto.createHash("sha1");
  h.update(JSON.stringify({ comp, w: composition.width, h: composition.height, fps: composition.fps, N, encoder, cq, crf }));
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries.sort((x, y) => x.name.localeCompare(y.name))) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(p); }
      else { const s = fs.statSync(p); h.update(`${p}|${s.size}|${Math.round(s.mtimeMs)}\n`); }
    }
  };
  walk("src");
  walk("public");
  return h.digest("hex").slice(0, 16);
};
const fpFile = path.join(segDir, "fingerprint.txt");
const fp = sourceState();

// Up-to-date guard (no repeated renders after a resumed session): a finished final records the source
// fingerprint plus its audio and metadata inputs next to itself. If nothing changed, do not render it
// again. --force renders anyway.
const fileKey = (f) => { try { const s = fs.statSync(f); return `${f}|${s.size}|${Math.round(s.mtimeMs)}`; } catch { return f ? `${f}|missing` : ""; } };
const finalKey = crypto.createHash("sha1").update(JSON.stringify({ fp, vo: fileKey(vo), sfx: fileKey(sfx), offset,
  title: arg("title"), slug: arg("slug"), ep: arg("ep") })).digest("hex").slice(0, 16);
const finalStamp = `${out}.render.json`;
if (fs.existsSync(out) && fs.existsSync(finalStamp) && !process.argv.includes("--force")) {
  const prev = JSON.parse(fs.readFileSync(finalStamp, "utf8"));
  if (prev.key === finalKey) {
    console.log(`up to date: ${out} was rendered ${prev.at} from the same source, VO and metadata; nothing to do (--force renders it again)`);
    fs.rmSync(serveUrl, { recursive: true, force: true });
    process.exit(0);
  }
  console.log(`${out} is out of date (source, VO or metadata changed since ${prev.at}); rendering`);
}
const oldFp = fs.existsSync(fpFile) ? fs.readFileSync(fpFile, "utf8").trim() : null;
const stale = fs.readdirSync(segDir).filter((f) => f.endsWith(".mp4"));
if (stale.length && (process.argv.includes("--fresh") || (oldFp && oldFp !== fp) || !oldFp)) {
  console.log(`${stale.length} old segment(s) discarded (${process.argv.includes("--fresh") ? "--fresh" : oldFp ? "source changed since they were rendered" : "no fingerprint"})`);
  for (const f of stale) fs.rmSync(path.join(segDir, f), { force: true });
}
fs.writeFileSync(fpFile, fp + "\n");

// Segments are named by frame range, so a run with a different --jobs/--parts still reuses the
// ranges that match.
const list = [];
const todo = [];
for (let i = 0; i < parts; i++) {
  const a = Math.floor((N * i) / parts), b = Math.floor((N * (i + 1)) / parts) - 1;
  const name = `seg_${a}_${b}.mp4`;
  const part = path.join(segDir, name);
  list.push(`file '${name}'`);
  if (fs.existsSync(part) && count(part) === b - a + 1) console.log(`part ${i} (${a}-${b}) done, skipping`);
  else todo.push({ i, a, b, part, tmp: path.join(segDir, `seg_${a}_${b}.tmp.mp4`) });
}

// Preflight: a small still at segment starts and at the last frame, before minutes of rendering.
if (todo.length && !process.argv.includes("--no-preflight")) {
  // At most 8 stills (about 3 s each): with 3 x jobs segments, one per start would triple the wait.
  const starts = todo.map((p) => p.a);
  const pick = starts.length <= 7 ? starts : Array.from({ length: 7 }, (_, k) => starts[Math.round((k * (starts.length - 1)) / 6)]);
  const frames = [...new Set([...pick, N - 1])].sort((x, y) => x - y);
  const t = Date.now();
  const browser = await openBrowser("chrome", { chromiumOptions: { gl: glArg } });
  const pre = path.join(segDir, "preflight");
  fs.mkdirSync(pre, { recursive: true });
  try {
    for (const f of frames) {
      try {
        await renderStill({ composition, serveUrl, frame: f, output: path.join(pre, `f${f}.jpg`), imageFormat: "jpeg", scale: 0.25,
          puppeteerInstance: browser, chromiumOptions: { gl: glArg }, timeoutInMilliseconds: 120000 });
      } catch (e) {
        console.error(`Preflight failed at frame ${f} (${(f / composition.fps).toFixed(1)} s): ${String(e?.message ?? e).split("\n")[0]}\n` +
          `  Nothing was rendered. Fix the scene, or skip this check with --no-preflight.`);
        await browser.close({ silent: true }).catch(() => {});
        fs.rmSync(serveUrl, { recursive: true, force: true });
        process.exit(1);
      }
    }
  } finally {
    await browser.close({ silent: true }).catch(() => {});
    fs.rmSync(pre, { recursive: true, force: true });
  }
  console.log(`preflight: ${frames.length} stills ok in ${((Date.now() - t) / 1000).toFixed(1)} s`);
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
if (vo || sfx) {
  // VO at its offset; the sfx stem (npm run sfx) is ducked under the voice by a sidechain, then both are
  // mixed and the delivery master sets the loudness of the whole film
  const delay = `adelay=${Math.round(offset * 1000)}:all=1,apad,aresample=48000`;
  const inputs = ["-i", path.join(segDir, "list.txt"), ...(vo ? ["-i", vo] : []), ...(sfx ? ["-i", sfx] : [])];
  // amix takes the first input's layout: a mono VO would fold the stereo sfx (pans) to mono
  const stereo = "aformat=channel_layouts=stereo";
  const graph = vo && sfx
    ? `[1:a]${delay},${stereo},asplit=2[vo][key];[2:a]aresample=48000,${stereo},apad[fx];` +
      `[fx][key]sidechaincompress=threshold=0.1:ratio=2.5:attack=15:release=350[duck];[vo][duck]amix=inputs=2:normalize=0:duration=first[a]`
    : vo ? `[1:a]${delay}[a]` : `[1:a]aresample=48000,apad[a]`;
  ff(["-v", "error", "-y", "-f", "concat", "-safe", "0", ...inputs, "-filter_complex", graph, "-map", "0:v", "-map", "[a]", "-c:v", "copy",
    "-t", dur, "-c:a", "aac", "-b:a", "320k", "-ar", "48000", joined]);
  const r = spawnSync("node", [path.join("scripts", "deliver.mjs"), joined, out], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
} else {
  ff(["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(segDir, "list.txt"), "-c", "copy", "-movflags", "+faststart", out]);
}
fs.rmSync(segDir, { recursive: true, force: true });
console.log(`final: ${out} (${N} frames, ${composition.width}×${composition.height} @ ${composition.fps} fps)`);

// Ownership metadata (anti-reupload, checked by qa:gate): --title and/or --slug write title, artist,
// copyright, comment and date into the MP4 without re-encoding. --artist / --copyright override the
// AUDIRA defaults; --ep adds the episode to the comment.
if (arg("title") || arg("slug")) {
  const year = new Date().getFullYear(), date = new Date().toISOString().slice(0, 10);
  const artist = arg("artist", "AUDIRA (Agus Dwi R.)");
  const copyright = arg("copyright", `© ${year} AUDIRA - Agus Dwi R. All rights reserved.`);
  const comment = `AUDIRA-${arg("slug", comp)}${arg("ep") ? `-${arg("ep")}` : ""} | audira.my.id`;
  const tagged = path.join(path.dirname(out), `${path.parse(out).name}.tagged.tmp.mp4`);
  ff(["-v", "error", "-y", "-i", out, "-map", "0", "-c", "copy", "-map_metadata", "-1",
    "-metadata", `title=${arg("title", comp)}`, "-metadata", `artist=${artist}`, "-metadata", `copyright=${copyright}`,
    "-metadata", `comment=${comment}`, "-metadata", `date=${date}`, "-movflags", "+faststart+use_metadata_tags", tagged]);
  fs.renameSync(tagged, out);
  console.log(`metadata: title, artist, copyright, comment (${comment}), date written`);
}

// Digital signature (brand contract, anti-reupload): Ed25519 over the stream hashes, written into the MP4
// and <final>.sig.json; then C2PA Content Credentials when c2patool is installed. --no-sign / --no-c2pa skip.
if ((arg("title") || arg("slug")) && !process.argv.includes("--no-sign")) {
  try {
    const { signFile, embedSignature, verifyFile } = await import("./lib/sign.mjs");
    const signed = signFile(out);
    embedSignature(out, signed);
    let note = "";
    if (!process.argv.includes("--no-c2pa")) {
      const { embedC2pa } = await import("./lib/c2pa.mjs");
      const c = embedC2pa(out, signed.payload);
      note = c.ok ? ", C2PA embedded" : ` (C2PA skipped: ${c.message})`;
    }
    console.log(`signature: Ed25519 key ${signed.payload.keyId}, ${verifyFile(out, { sidecar: false }).status}${note}`);
  } catch (e) {
    console.error(`signature failed: ${e.message} (sign later with npm run sign -- <final.mp4>)`);
  }
}
// stamp for the up-to-date guard above
fs.writeFileSync(finalStamp, JSON.stringify({ key: finalKey, at: new Date().toISOString(), comp, frames: N }, null, 2) + "\n");

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
