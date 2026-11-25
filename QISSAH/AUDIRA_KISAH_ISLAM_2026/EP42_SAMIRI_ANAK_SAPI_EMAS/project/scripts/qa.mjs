#!/usr/bin/env node
// CHRONICLE automated QA for a final film (run by `make.mjs <id> --final`, or alone):
//   node scripts/qa.mjs <story-id> [file.mp4]
// Checks the MP4 against its plan (out/<id>/plan.json) and writes out/<id>/qa/: report.json, 1 fps contact sheets
// (sheet_01.jpg …) and REVIEW.md — the visual review the director fills in after looking at every sheet.
// Exit code 1 when a check fails.

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { probeStreams } from "./lib/media.mjs";

const [id, fileArg] = process.argv.slice(2);
if (!id) { console.error("usage: node scripts/qa.mjs <story-id> [file.mp4]"); process.exit(2); }
const out = path.resolve("out", id);
const plan = JSON.parse(fs.readFileSync(path.join(out, "plan.json"), "utf8"));
const file = fileArg ?? path.join(out, `${id}_1080x1920_60fps.mp4`);
if (!fs.existsSync(file)) { console.error(`no film at ${file} — run: node scripts/make.mjs ${id} --final`); process.exit(2); }
const wide = /1920x1080|960x540/.test(path.basename(file));
const [EW, EH] = wide ? [1920, 1080] : [1080, 1920];
const qa = path.join(out, wide ? "qa-wide" : "qa");
fs.rmSync(qa, { recursive: true, force: true });
fs.mkdirSync(qa, { recursive: true });

const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });
const probe = await probeStreams(file);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = parseFloat(probe.format.duration);
const [fn, fd] = (v?.r_frame_rate ?? "0/1").split("/").map(Number);
const fps = fn / fd;

check(`video ${EW}×${EH}`, v && v.width === EW && v.height === EH, v ? `${v.width}×${v.height} ${v.codec_name}` : "no video stream");
check("60 fps", Math.abs(fps - 60) < 0.01, `${fps.toFixed(2)} fps`);
check("duration matches the plan", Math.abs(dur - plan.duration) < 0.25, `${dur.toFixed(2)} s (plan ${plan.duration} s)`);
check("audio stream", !!a, a ? `${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch` : "no audio — was the mix made?");

// loudness + true peak
let lufs = NaN, tp = NaN;
if (a) {
  const r = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const sum = r.slice(r.lastIndexOf("Summary:"));
  lufs = parseFloat(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1] ?? "NaN");
  tp = parseFloat(/Peak:\s+(-?[\d.]+) dBFS/.exec(sum)?.[1] ?? "NaN");
}
check("loudness −14 ±1.5 LUFS", Math.abs(lufs + 14) <= 1.5, `${lufs} LUFS`);
check("true peak ≤ −1 dBTP", tp <= -1.0, `${tp} dBTP`);

// per-frame brightness and frame-to-frame change (small scale, one pass each)
const stat = (filter) => {
  // relative, forward slashes: an absolute Windows path ("F:\...") breaks the ffmpeg filter-option parser
  const f = path.relative(process.cwd(), path.join(qa, `_${Math.random().toString(36).slice(2)}.txt`)).split(path.sep).join("/");
  execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `${filter},metadata=print:key=lavfi.signalstats.YAVG:file=${f}`, "-f", "null", "-"]);
  const vals = [...fs.readFileSync(f, "utf8").matchAll(/YAVG=([\d.]+)/g)].map((m) => +m[1]);
  fs.rmSync(f);
  return vals;
};
const Y = stat("scale=216:-2,signalstats");
const D = stat("scale=216:-2,tblend=all_mode=difference,signalstats");
const endA = plan.scenes.find((s) => s.kind === "end")?.a ?? Infinity;
const tOf = (i) => i / fps;
const black = Y.map((y, i) => [i, y]).filter(([i, y]) => y < 10 && tOf(i) < endA - 0.1);
const white = Y.map((y, i) => [i, y]).filter(([, y]) => y > 235);
check("no black frames (before the end card)", black.length === 0, black.length ? `${black.length} frames, first at ${tOf(black[0][0]).toFixed(2)} s` : "0");
check("no white frames", white.length === 0, white.length ? `${white.length} frames, first at ${tOf(white[0][0]).toFixed(2)} s` : "0");
// cuts the plan intends: scene starts and camera beats; a spike anywhere else is a flicker / pop
const cuts = new Set();
for (const s of plan.scenes) { cuts.add(Math.round(s.a * fps)); for (const b of s.place?.beats ?? []) cuts.add(Math.round(b.a * fps)); }
const near = (f) => [...cuts].some((c) => Math.abs(c - f) <= 3);
const spikes = D.map((d, i) => [i + 1, d]).filter(([f, d]) => d > 10 && !near(f) && f < Y.length - 2);
check("no flicker / pops outside planned cuts", spikes.length === 0, spikes.length ? spikes.slice(0, 6).map(([f, d]) => `${tOf(f).toFixed(2)} s (Δ${d.toFixed(0)})`).join(", ") : "0");

// captions: every word timed, in order, inside the film
const W = plan.words ?? [];
const bad = W.filter((w, i) => !Number.isFinite(w.t) || w.t < 0 || w.t > plan.duration || (i && w.t < W[i - 1].t - 1e-6));
check("every caption word timed in order", W.length > 0 && bad.length === 0, `${W.length} words, ${bad.length} bad`);
check("plan has no warnings", (plan.warnings ?? []).length === 0, (plan.warnings ?? []).join(" | ") || "none");

// contact sheets: 1 frame per second, 6 × 4 per page (cell n of page p = second (p−1)·24 + n−1; no text burn-in,
// because many ffmpeg builds lack drawtext)
const per = 24;
const pages = Math.ceil(dur / per);
for (let p = 0; p < pages; p++) {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(p * per), "-t", String(per), "-i", file, "-vf",
    wide ? "fps=1,scale=480:-2,tile=4x6:padding=4:color=black" : "fps=1,scale=240:-2,tile=6x4:padding=4:color=black", "-frames:v", "1",
    path.join(qa, `sheet_${String(p + 1).padStart(2, "0")}.jpg`)]);
}

const report = { id, file, duration: dur, lufs, truePeak: tp, checks, passed: checks.filter((c) => c.ok).length, total: checks.length };
fs.writeFileSync(path.join(qa, "report.json"), JSON.stringify(report, null, 2));

// review template: one row per scene, filled by the director after looking
const rows = plan.scenes.map((s, i) => {
  const what = s.kind === "map" ? `peta ${s.map.mode}: ${s.map.points.map((p) => p.name).join(" → ")}` : s.kind === "end" ? "kartu penutup + sumber" : `${s.place.set}/${s.place.mood}: ${s.place.groups.map((g) => `${g.count}× ${g.name} (${g.action})`).join(", ")}`;
  return `| ${i + 1} | ${s.a.toFixed(1)}–${s.b.toFixed(1)} | ${what} |  |  |`;
});
fs.writeFileSync(path.join(qa, "REVIEW.md"), `# REVIEW — ${plan.title || id}

STATUS: PENDING

Look at every contact sheet (sheet_*.jpg: one frame per second, 24 per page, read left→right, top→bottom; cell n of
page p = second (p−1)·24 + n−1) and at the film around every scene cut before setting STATUS to PASS.
Per scene check: the people read as black silhouettes against light (none lost in a dark wall), contours only on
the named roles, nobody cut by the frame edge in the key shot, no figure through a wall / prop, map pins + labels
legible and inside the frame, text never over a face, captions match the voice, nothing flickers.

| # | waktu (s) | adegan | OK? | catatan |
|---|---|---|---|---|
${rows.join("\n")}

Automated: ${report.passed}/${report.total} checks passed (report.json).
`);

for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}: ${c.detail}`);
console.log(`QA ${report.passed}/${report.total} → ${qa}`);
process.exit(report.passed === report.total ? 0 : 1);
