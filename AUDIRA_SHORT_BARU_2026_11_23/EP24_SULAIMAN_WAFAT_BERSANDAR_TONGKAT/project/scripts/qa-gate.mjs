// Delivery gate (stage 9): red = do not deliver. Measures the MP4 itself, never trusts the render log.
//   node scripts/qa-gate.mjs out/FINAL_tagged.mp4 [--preview] [--shotlist=SHOTLIST.md] [--timing=public/audio/vo.timing.json]
//        [--words=vo-words.json] [--offset=0] [--report=QA_REPORT.md]
// Checks: spec (1080×1920 @ 60 h264 yuv420p, AAC 48 kHz), −14 LUFS ±0.5, true peak < −1 dBFS, black frames,
// frozen stretches ≥ 2 s (Anti-PPT), ownership metadata (AUDIRA), signature handle = channel, outro room after the VO, plus
// shotlist-lint and sync-check when a shot list / VO timing is given.
// --preview  check a 540×960 draft instead (30/60 fps, −16 LUFS ±1, no metadata check)
// --wide     16:9 long-form: 1920×1080 @ 30 or 60 (with --preview: 960×540)
// Writes a Markdown report (default: QA_REPORT.md next to the video). Exit 0 = green/yellow, 1 = red, 2 = unreadable.

import fs from "node:fs";
import path from "node:path";
import { probe, loudness, blackAndFreeze } from "./lib/av.mjs";
import { parseShotlist, lintShotlist } from "./lib/shotlist.mjs";
import { loadVoTiming } from "./lib/vo-timing.mjs";
import { syncCheck } from "./lib/sync.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const preview = args.includes("--preview");
// --wide: 16:9 long-form (1920 × 1080 @ 30 or 60; preview 960 × 540).
const wide = args.includes("--wide");
if (!file || !fs.existsSync(file)) {
  console.error("usage: node scripts/qa-gate.mjs <video.mp4> [--preview] [--shotlist=SHOTLIST.md] [--timing=vo.timing.json] [--words=words.json] [--offset=0] [--report=QA_REPORT.md] [--wide]");
  process.exit(2);
}

const rows = []; // { level: 'ok'|'warn'|'fail', area, msg }
const add = (level, area, msg) => rows.push({ level, area, msg });

let p;
try { p = await probe(file); } catch (e) { console.error(`${file}: not a readable video (${String(e.message).split("\n")[0]})`); process.exit(2); }
const v = p.video, a = p.audio;
const want = wide
  ? preview ? { w: 960, h: 540, fps: [30, 60], I: -16, tolI: 1 } : { w: 1920, h: 1080, fps: [30, 60], I: -14, tolI: 0.5 }
  : preview ? { w: 540, h: 960, fps: [30, 60], I: -16, tolI: 1 } : { w: 1080, h: 1920, fps: [60], I: -14, tolI: 0.5 };

// spec
if (!v) add("fail", "spec", "no video stream");
else {
  const res = `${v.width}×${v.height}`;
  add(v.width === want.w && v.height === want.h ? "ok" : "fail", "spec", `resolution ${res} (want ${want.w}×${want.h})`);
  add(want.fps.some((f) => Math.abs(p.fps - f) < 0.01) ? "ok" : "fail", "spec", `frame rate ${p.fps.toFixed(2)} (want ${want.fps.join(" or ")})`);
  add(v.codec_name === "h264" ? "ok" : "fail", "spec", `video codec ${v.codec_name} (want h264)`);
  add(v.pix_fmt === "yuv420p" ? "ok" : "fail", "spec", `pixel format ${v.pix_fmt} (want yuv420p)`);
}
if (!a) add("fail", "audio", "no audio stream");
else {
  add(a.codec_name === "aac" ? "ok" : "fail", "audio", `audio codec ${a.codec_name} (want aac)`);
  if (!preview) add(Number(a.sample_rate) === 48000 ? "ok" : "warn", "audio", `sample rate ${a.sample_rate} Hz (want 48000)`);
  const L = loudness(file), dI = Math.abs(L.I - want.I);
  add(dI <= want.tolI ? "ok" : dI <= want.tolI + 1 ? "warn" : "fail", "audio", `integrated ${L.I} LUFS (want ${want.I} ±${want.tolI}; fix: node scripts/deliver.mjs)`);
  add(L.peak < -1 ? "ok" : "fail", "audio", `true peak ${L.peak} dBFS (want < −1)`);
}

// picture
const shotlist = opt("shotlist") ? parseShotlist(fs.readFileSync(opt("shotlist"), "utf8")) : null;
const cutTimes = shotlist ? shotlist.shots.slice(1).map((s) => s.from).filter(Number.isFinite) : [];
if (v) {
  const { black, freeze } = blackAndFreeze(file);
  for (const b of black) {
    const nearEnd = b.end >= p.duration - 1;
    // a short dip to black on a planned cut is a transition, not a dropout
    const dip = b.end - b.start <= 0.5 && cutTimes.some((t) => t >= b.start - 0.3 && t <= b.end + 0.3);
    const why = b.start < 0.05 ? " (first frame black: bad thumbnail)" : nearEnd ? " (closing fade?)" : dip ? " (dip on a shot cut: confirm it is intended)" : shotlist ? "" : " (planned dip? pass --shotlist so the gate knows the cuts)";
    add(b.start < 0.05 ? "fail" : nearEnd || dip ? "warn" : "fail", "picture", `black ${b.start.toFixed(2)}–${b.end.toFixed(2)} s${why}`);
  }
  if (!black.length) add("ok", "picture", "no black frames");
  for (const f of freeze) add("warn", "picture", `frozen ${f.start.toFixed(2)}–${Number.isFinite(f.end) ? f.end.toFixed(2) : "end"} s (no motion ≥ 2 s: Anti-PPT)`);
  if (!freeze.length) add("ok", "picture", "no frozen stretch ≥ 2 s");
}

// ownership metadata (brand contract, final only)
if (!preview) {
  const t = Object.fromEntries(Object.entries(p.tags).map(([k, val]) => [k.toLowerCase(), String(val)]));
  add(/AUDIRA/.test(t.artist ?? "") ? "ok" : "fail", "brand", `artist "${t.artist ?? ""}" (want AUDIRA (Agus Dwi R.))`);
  add(/AUDIRA/.test(t.copyright ?? "") ? "ok" : "fail", "brand", `copyright "${t.copyright ?? ""}"`);
  add(/^AUDIRA-/.test(t.comment ?? "") ? "ok" : "fail", "brand", `comment "${t.comment ?? ""}" (want AUDIRA-<slug>-<EP> | audira.my.id)`);
  add(t.title ? "ok" : "warn", "brand", `title "${t.title ?? ""}"`);
  // digital signature: Ed25519 must verify against a trusted AUDIRA key; C2PA is reported when readable
  try {
    const { verifyFile } = await import("./lib/sign.mjs");
    const v = await verifyFile(file);
    const why = { UNSIGNED: "no signature (npm run sign -- <final.mp4>)", TAMPERED: `picture or sound changed after signing (${(v.changed || []).join(", ")})`, INVALID: v.reason, UNTRUSTED: `key ${v.payload?.keyId} is not a trusted AUDIRA key` }[v.status];
    add(v.status === "VALID" ? "ok" : v.status === "UNTRUSTED" ? "warn" : "fail", "brand", `signature ${v.status}${why ? `: ${why}` : ` (key ${v.payload.keyId}, ${v.from})`}`);
    const { readC2pa } = await import("./lib/c2pa.mjs");
    const c = readC2pa(file);
    if (c) add(c.present ? "ok" : "warn", "brand", c.present ? `C2PA Content Credentials present (${c.state ?? "read"})` : "no C2PA Content Credentials (npm run sign -- <final.mp4> --c2pa)");
  } catch (e) {
    add("warn", "brand", `signature not checked: ${e.message}`);
  }
}

// signature handle + outro card = the series' channel (rule 08); checked in the project the gate runs in
try {
  const { checkBrandMarks } = await import("./lib/channel.mjs");
  for (const r of checkBrandMarks()) add(r.level, "brand", `channel: ${r.msg}`);
} catch (e) {
  add("warn", "brand", `channel marks not checked: ${e.message}`);
}

// VO + shot list
const vo = opt("timing") || opt("words") ? loadVoTiming(opt("timing"), opt("words")) : null;
let offset = opt("offset") !== undefined ? Number(opt("offset")) : undefined;
if (shotlist) {
  const sl = shotlist;
  offset ??= Number(sl.header.offset ?? 0) || 0;
  // cut-vs-VO is reported once, by the sync check on the real MP4 below
  const issues = lintShotlist(sl, { vo, offset }).filter((i) => i.code !== "vo-cut");
  for (const i of issues) add(i.level, "shotlist", `${i.shot ? `#${i.shot} ` : ""}${i.msg}`);
  if (!issues.length) add("ok", "shotlist", `${sl.shots.length} shots lint clean`);
  const end = sl.shots.at(-1)?.to;
  if (Number.isFinite(end) && Math.abs(end - p.duration) > 0.5) add("warn", "shotlist", `shot list ends at ${end} s, video is ${p.duration.toFixed(2)} s`);
}
offset ??= 0;
if (vo) {
  const room = p.duration - (vo.lastSpeech + offset);
  add(room >= 2 && room <= 4.5 ? "ok" : room < 1 ? "fail" : "warn", "vo", `${room.toFixed(2)} s after the last word for the outro card (want 2–3 s)`);
}
if (a && (opt("shotlist") || vo)) {
  const s = await syncCheck(file, { shotlist: opt("shotlist"), timing: opt("timing"), words: opt("words"), offset });
  if (!s.error) {
    for (const r of s.rows) for (const i of r.issues) add(i.level, "sync", `cut ${r.t.toFixed(2)} s: ${i.msg}`);
    if (s.rows.every((r) => !r.issues.length)) add("ok", "sync", `${s.rows.length} cuts land clean (${s.source})`);
    if (s.drift?.median != null) add(Math.abs(s.drift.median) > 80 ? "fail" : "ok", "sync", `VO drift ${s.drift.median} ms over ${s.drift.matched} pauses`);
    else if (s.drift) add("warn", "sync", `VO drift not measurable (${s.drift.matched}/${s.drift.of} pauses found)`);
  }
}

// report
const red = rows.filter((r) => r.level === "fail"), yellow = rows.filter((r) => r.level === "warn");
const verdict = red.length ? "RED — do not deliver" : yellow.length ? "YELLOW — deliver only with a written reason for each yellow" : "GREEN";
const mark = { ok: "ok", warn: "YELLOW", fail: "RED" };
console.log(`${path.basename(file)} · ${p.duration.toFixed(2)} s · ${preview ? "preview" : "final"} gate`);
for (const r of rows) if (r.level !== "ok") console.log(`  ${mark[r.level].padEnd(6)} ${r.area.padEnd(8)} ${r.msg}`);
console.log(`  ${rows.filter((r) => r.level === "ok").length} checks ok`);
console.log(`GATE: ${verdict}`);

const report = opt("report") ?? path.join(path.dirname(path.resolve(file)), "QA_REPORT.md");
fs.writeFileSync(report, [
  `# QA Gate: ${path.basename(file)}`, "",
  `- Date: ${new Date().toISOString().slice(0, 10)}`,
  `- Mode: ${wide ? (preview ? "wide preview (960×540)" : "wide final (1920×1080)") : preview ? "preview (540×960)" : "final (1080×1920 @ 60)"}`,
  `- Duration: ${p.duration.toFixed(2)} s · VO offset ${offset} s`,
  `- Verdict: **${verdict}**`, "",
  "| Result | Area | Check |", "|---|---|---|",
  ...rows.map((r) => `| ${mark[r.level]} | ${r.area} | ${r.msg.replace(/\|/g, "\\|")} |`), "",
  yellow.length && !red.length ? "## Reasons for each yellow\n\n- (write one line per yellow before delivering)\n" : "",
].join("\n"));
console.log(`report: ${report}`);
process.exitCode = red.length ? 1 : 0;
