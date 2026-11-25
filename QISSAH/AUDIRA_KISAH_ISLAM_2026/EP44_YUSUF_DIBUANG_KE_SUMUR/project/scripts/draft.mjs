// Stage 8 in one command: key-frame contact sheet + visual audit + camera audit + jury input.
//   npm run draft -- <PreviewCompId> [--frames=auto|1.5s,20s,...|5%,...] [--clip=auto|21-39|off] [--out=<dir>] [--wide] [--flat-style]
//   HyperFrames (2D): node <starter>/scripts/draft.mjs --hyperframes=<project folder> [same options]   (run from the episode or its project)
//     stills come from `hyperframes snapshot --at`, the clip from `hyperframes render --start --end -q draft`; the audits are the same.
//
// Key frames (auto): hook, the middle of each VO part, one transition midpoint, two payoff beats and the outro card,
// from the episode's audio/timeline.json (or public/audio/timeline.json); without a timeline,
// 8 evenly spread shares of the film. Clip (auto): 18 s at 540×960 around the move into the payoff,
// the part most likely to park or jerk; --clip=off skips it (camera score then stays unmeasured).
// Writes to <episode>/draft (or out/draft): DRAFT_SHEET.jpg (±1200 px, the one image to look at),
// compare.jpg (cover on top), look.json, camera.json, jury_input.json, DRAFT_REPORT.json.
// Prints a few lines: ceilings, camera score, PERLU POLES/OK, paths. Exit 1 = some aspect capped ≤ 3.
// Reuses stills.mjs, visual-audit.mjs and camera-audit.mjs; it adds no measuring logic of its own.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { findEpisode } from "./lib/memory.mjs";
import { glMode } from "./gl.mjs";
import { sizeOf } from "./lib/frame-source.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const hf = opt("hyperframes") ? path.resolve(opt("hyperframes")) : null;
if (hf && !fs.existsSync(path.join(hf, "index.html"))) { console.error(`--hyperframes: no index.html in ${hf}`); process.exit(2); }
const comp = args.find((a) => !a.startsWith("--")) ?? (hf ? `hyperframes:${path.basename(path.dirname(hf))}/${path.basename(hf)}` : null);
if (!comp) {
  console.error("usage: npm run draft -- <PreviewCompId> [--frames=auto|1.5s,...] [--clip=auto|21-39|off] [--out=dir] [--wide] [--flat-style]");
  process.exit(2);
}
const wide = args.includes("--wide");
const ep = findEpisode(hf ?? undefined) ?? findEpisode();
const out = path.resolve(opt("out", ep ? path.join(ep.dir, "draft") : "out/draft"));
const stillsDir = path.join(out, "_stills");
fs.mkdirSync(stillsDir, { recursive: true });

const run = (script, argv, env = {}) => {
  const r = spawnSync(process.execPath, [path.join(here, script), ...argv], { encoding: "utf8", env: { ...process.env, ...env }, maxBuffer: 1 << 26 });
  return { code: r.status, out: r.stdout ?? "", err: (r.stderr ?? "").trim() };
};
const fail = (step, r) => {
  console.error(`${step} failed (exit ${r.code}):\n${(r.err || r.out).split("\n").slice(-12).join("\n")}`);
  process.exit(2);
};

// ---- key frames ----
const timelineFile = [ep && path.join(ep.dir, "audio/timeline.json"), "public/audio/timeline.json"].find((f) => f && fs.existsSync(f));
const tl = timelineFile ? JSON.parse(fs.readFileSync(timelineFile, "utf8")) : null;
const part = (id) => tl?.parts?.find((p) => p.id === id);
let frames = opt("frames", "auto");
if (frames === "auto") {
  if (tl?.parts?.length) {
    const at = (p, f) => p && +(p.start + (p.end - p.start) * f).toFixed(2);
    const total = tl.total ?? tl.voEnd ?? 0;
    const t = [at(part("hook"), 0.5) ?? 1.5, at(part("context"), 0.5), at(part("main"), 0.5),
      // a transition midpoint (main -> explanation), where scenes most often break
      part("main") && part("explanation") ? +((part("main").end + part("explanation").start) / 2).toFixed(2) : null,
      at(part("explanation"), 0.5),
      at(part("payoff"), 0.3), at(part("payoff"), 0.8), total ? +(total - 1.5).toFixed(2) : null].filter((x) => x != null);
    frames = t.map((s) => `${s}s`).join(",");
  } else frames = "2%,15%,30%,45%,60%,75%,88%,98.5%";
}

// ---- 1. stills + sheet (stills' own audit is off: step 2 runs it with the draft labels) ----
const npx = (argv, cwd) => spawnSync("npx", ["--yes", "hyperframes", ...argv], { cwd, encoding: "utf8", maxBuffer: 1 << 26, shell: process.platform === "win32" });
let meta;
if (hf) meta = hfStills(); else {
  const s = run("stills.mjs", [stillsDir, frames, comp], { AUDIRA_MEMORY: "off" });
  if (s.code !== 0) fail("stills", s);
  meta = JSON.parse(fs.readFileSync(path.join(stillsDir, "_meta.json"), "utf8"));
}

// HyperFrames: same outputs as stills.mjs (f<frame>.png, _meta.json, _sheet.jpg), from `hyperframes snapshot`.
async function hfStills() {
  const html = fs.readFileSync(path.join(hf, "index.html"), "utf8");
  const attr = (k) => Number(html.match(new RegExp(`data-${k}="([0-9.]+)"`))?.[1]);
  const dur = attr("duration"), fps = 30;
  if (!dur) fail("stills", { code: 2, err: `no data-duration on the root composition in ${path.join(hf, "index.html")}` });
  const secs = frames.split(",").map((x) => x.trim()).filter(Boolean)
    .map((x) => x.endsWith("%") ? dur * parseFloat(x) / 100 : parseFloat(x))
    .map((t) => +Math.min(Math.max(0, t), dur - 0.05).toFixed(2));
  for (const f of fs.readdirSync(stillsDir)) fs.rmSync(path.join(stillsDir, f), { recursive: true, force: true });
  const raw = path.join(stillsDir, "_raw");
  const r = npx(["snapshot", "--at", secs.join(","), "--no-end", "--keep", "-o", raw], hf);
  if (r.status !== 0) fail("hyperframes snapshot", { code: r.status, out: r.stdout, err: r.stderr });
  const name = (t) => `at-${String(+t.toFixed(3))}s.png`;
  const files = secs.map((t) => {
    const src = path.join(raw, name(t));
    if (!fs.existsSync(src)) fail("hyperframes snapshot", { code: 2, err: `missing ${src}` });
    const dst = path.join(stillsDir, `f${String(Math.round(t * fps)).padStart(4, "0")}.png`);
    fs.copyFileSync(src, dst);
    return dst;
  });
  fs.rmSync(raw, { recursive: true, force: true });
  const { width, height } = await sizeOf(files[0]);
  const m = { id: comp, fps, durationInFrames: Math.round(dur * fps), width, height, frames: secs.map((t) => Math.round(t * fps)) };
  fs.writeFileSync(path.join(stillsDir, "_meta.json"), JSON.stringify(m));
  const cols = Math.min(4, files.length), rows = Math.ceil(files.length / cols), n = cols * rows;
  const w = Math.round(width / 2), h = Math.round(height / 2);
  const pads = Array.from({ length: n - files.length }, () => ["-f", "lavfi", "-i", `color=c=black:s=${w}x${h}`]).flat();
  const filter = Array.from({ length: n }, (_, i) => `[${i}:v]scale=${w}:${h},setsar=1[v${i}]`).join(";") + ";" +
    Array.from({ length: n }, (_, i) => `[v${i}]`).join("") + `xstack=inputs=${n}:layout=` +
    Array.from({ length: n }, (_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|");
  if (n > 1) spawnSync("ffmpeg", ["-v", "error", "-y", ...files.flatMap((f) => ["-i", f]), ...pads, "-filter_complex", filter, "-frames:v", "1", path.join(stillsDir, "_sheet.jpg")]);
  return m;
}
const sheet = path.join(out, "DRAFT_SHEET.jpg");
if (fs.existsSync(path.join(stillsDir, "_sheet.jpg")))
  spawnSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(stillsDir, "_sheet.jpg"), "-vf", "scale='min(1200,iw)':-2", "-q:v", "3", sheet]);

// ---- 2. visual audit (records the measured run in motion memory) ----
const lookJson = path.join(out, "look.json");
const v = run("visual-audit.mjs", [stillsDir, `--comp=${comp}`, "--stage=draft", "--source=draft", `--json=${lookJson}`, `--sheet=${path.join(out, "compare.jpg")}`,
  ...(wide ? ["--wide"] : []), ...(args.includes("--flat-style") ? ["--flat-style"] : [])]);
if (v.code !== 0 && v.code !== 1) fail("audit:visual", v);
const look = JSON.parse(fs.readFileSync(lookJson, "utf8"));

// ---- 3. camera clip + audit ----
let camera = null, clipFile = null;
// HyperFrames: the clip is off unless asked for (`hyperframes render --start/--end` captured a 6 s clip in >9 min on
// the AUDIRA PC, 2026-11-15); 2D motion is reviewed with motion-doctrine and `hyperframes snapshot --review` instead.
const clipArg = opt("clip", hf ? "off" : "auto");
if (clipArg !== "off") {
  const dur = meta.durationInFrames / meta.fps;
  let a, b;
  if (clipArg === "auto") {
    const len = Math.min(18, dur);
    const pivot = part("payoff")?.start ?? dur * 0.6;
    a = Math.max(0, Math.min(dur - len, pivot - 6)); b = a + len;
  } else [a, b] = clipArg.split("-").map(Number);
  const f0 = Math.round(a * meta.fps), f1 = Math.min(meta.durationInFrames - 1, Math.round(b * meta.fps));
  clipFile = path.join(out, `CHECK_${Math.round(a)}-${Math.round(b)}s.mp4`);
  if (hf) {
    const r = npx(["render", "--start", String(+(f0 / meta.fps).toFixed(2)), "--end", String(+(f1 / meta.fps).toFixed(2)), "-q", "draft", "-f", String(meta.fps), "--quiet", "-o", clipFile], hf);
    if (r.status !== 0 || !fs.existsSync(clipFile)) fail("clip render (hyperframes)", { code: r.status, out: r.stdout, err: r.stderr });
  }
  // the project's own Remotion CLI, run by node directly (no shell: paths may hold spaces)
  const cli = hf ? null : path.resolve("node_modules/@remotion/cli/remotion-cli.js");
  if (!hf && !fs.existsSync(cli)) fail("clip render", { code: 2, err: `${cli} not found: run from the project folder (npm install / node_modules junction)` });
  if (!hf) {
    const r = spawnSync(process.execPath, [cli, "render", "src/index.ts", comp, clipFile, `--frames=${f0}-${f1}`, "--log=error", `--gl=${glMode()}`,
      // motion-only check: the preview comp (540x960) with the light Finish tier (no AO)
      `--props=${JSON.stringify({ audiraQuality: "light" })}`],
      { encoding: "utf8", maxBuffer: 1 << 26 });
    if (r.status !== 0) fail("clip render", { code: r.status, out: r.stdout, err: r.stderr });
  }
  const camJson = path.join(out, "camera.json");
  const c = run("camera-audit.mjs", [clipFile, `--json=${camJson}`]);
  if (c.code !== 0) fail("audit:camera", c);
  const cam = JSON.parse(fs.readFileSync(camJson, "utf8"));
  camera = { score: cam.score, why: cam.why, seconds: cam.seconds, cuts: cam.cuts, parkedPct: cam.deadPct, longestHold: cam.longestHold, jerksPer10s: cam.jerksPer10s, fastPct: cam.fastPct };
}

// ---- 4. jury input + report ----
const jury = { ceilings: look.ceilings, reasons: look.reasons, ...(camera ? { camera } : {}) };
fs.writeFileSync(path.join(out, "jury_input.json"), JSON.stringify(jury, null, 1));
const capped = Object.entries(look.ceilings).filter(([, c]) => c !== null && c <= 3).map(([k, c]) => `${k}≤${c}`);
const report = { comp, frames: meta.frames.map((f) => +(f / meta.fps).toFixed(2)), sheet, compare: path.join(out, "compare.jpg"), clip: clipFile,
  ceilings: look.ceilings, diversity: look.diversity, camera, capped, at: new Date().toISOString() };
fs.writeFileSync(path.join(out, "DRAFT_REPORT.json"), JSON.stringify(report, null, 1));

const fmt = (o) => Object.entries(o).map(([k, c]) => `${k} ${c ?? "—"}`).join(" · ");
console.log(`draft ${comp} · ${meta.frames.length} frames at ${report.frames.join(", ")} s`);
console.log(`ceilings: ${fmt(look.ceilings)}${look.diversity != null ? ` · diversity ${look.diversity}` : ""}`);
for (const [k, why] of Object.entries(look.reasons ?? {})) if (look.ceilings[k] !== null && look.ceilings[k] <= 3) console.log(`  ${k}: ${why.join("; ")}`);
if (camera) console.log(`camera: motion ${camera.score}/5 (${camera.why.join("; ")})`);
console.log(capped.length ? `PERLU POLES: ${capped.join(", ")}` : "OK: no aspect capped below 4");
console.log(`look at: ${sheet}  (cover compare: ${report.compare})`);
if (hf && !camera) console.log(`2D motion: run \`npx hyperframes snapshot --review\` in ${hf} for cut/seam strips (camera score stays unmeasured)`);
console.log(`next: record_score stage=draft (ceilings + camera from ${path.join(out, "DRAFT_REPORT.json")}), then blind jury with qa/jury.md + jury_input.json`);
process.exitCode = capped.length ? 1 : 0;
