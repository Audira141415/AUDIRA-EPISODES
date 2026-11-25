// Stages 9–10 check in one command, after render:final: delivery gate + signature + metadata +
// frame check sheet + social captions. Prints only RED/YELLOW rows and one verdict line.
//   npm run deliver -- <FINAL.mp4> [--wide] [--shotlist=…] [--timing=…] [--words=…] [--offset=…] [--report=…] [--out=dir] [--keywords=a,b] [--no-captions]
//
// Runs qa-gate.mjs (spec, loudness, true peak, black/frozen frames, ownership metadata, channel handle,
// outro room; shotlist/sync when given), verifies the Ed25519 signature (lib/sign.mjs), prints the
// ownership tags, tiles 8 frames of the MP4 into FINAL_CHECK.jpg (±1200 px, look at it once), and,
// inside an episode, validates SOCIAL_CAPTIONS.md with the hub's validator (same as
// audira_validate_social_captions). Exit 1 = something is red.
// (scripts/deliver.mjs is the loudness master that render:final runs; this script only checks.)

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyFile, probeTags } from "./lib/sign.mjs";
import { findEpisode, hubRoot } from "./lib/memory.mjs";
import { probe } from "./lib/av.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file || !fs.existsSync(file)) {
  console.error("usage: npm run deliver -- <FINAL.mp4> [--wide] [--shotlist=…] [--timing=…] [--report=…] [--out=dir] [--no-captions]");
  process.exit(2);
}
let red = 0;
const say = (lvl, area, msg) => { if (lvl === "RED") red++; console.log(`  ${lvl.padEnd(6)} ${area.padEnd(9)} ${msg}`); };

// ---- 1. qa:gate (its stdout already lists only the non-ok rows) ----
const outDir = args.find((a) => a.startsWith("--out="))?.slice(6);
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const gateArgs = [...args.filter((a) => a !== "--no-captions" && a !== file && !a.startsWith("--out=")),
  ...(outDir && !args.some((a) => a.startsWith("--report=")) ? [`--report=${path.join(outDir, "QA_REPORT.md")}`] : [])];
const g = spawnSync(process.execPath, [path.join(here, "qa-gate.mjs"), file, ...gateArgs], { encoding: "utf8", maxBuffer: 1 << 26 });
if (g.status === 2) { console.error((g.stderr || g.stdout).trim()); process.exit(2); }
const gl = (g.stdout ?? "").split("\n");
console.log(gl[0]);
for (const l of gl.slice(1)) if (/^\s+(FAIL|RED|WARN|YELLOW)/i.test(l)) console.log(l);
const gate = (gl.find((l) => l.startsWith("GATE:")) ?? "GATE: ?").trim();
if (g.status === 1) red++;
const report = gl.find((l) => l.startsWith("report:"))?.slice(8).trim();

// ---- 2. signature + ownership tags ----
const sig = await verifyFile(file);
if (sig.status === "VALID") say("ok", "signature", `VALID ${sig.payload?.id ?? ""}`.trim());
else say(sig.status === "UNTRUSTED" ? "YELLOW" : "RED", "signature", `${sig.status}${sig.reason ? `: ${sig.reason}` : ""}${sig.changed ? ` (changed: ${sig.changed.join(", ")})` : ""}`);
const { tags } = await probeTags(file);
const tag = (k) => tags[k];
for (const k of ["title", "artist", "copyright", "comment"]) if (!tag(k)) say("RED", "metadata", `missing ${k}`);
if (tag("comment")) say("ok", "metadata", `${tag("comment")} · ${tag("date") ?? "no date"}`);

// ---- 3. frame check sheet from the MP4 itself ----
const dur = (await probe(file)).duration;
const ep = findEpisode(path.dirname(path.resolve(file))) ?? findEpisode();
const sheet = path.join(outDir ? path.resolve(outDir) : path.dirname(path.resolve(file)), "FINAL_CHECK.jpg");
const shares = [0.01, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 0.985];
const wide = args.includes("--wide");
const tw = wide ? 300 : 150; // 8 × 150 (9:16) or 4 × 300 in 2 rows (16:9): ±1200 px wide
const tmp = fs.mkdtempSync(path.join(path.dirname(sheet), "_fc"));
let frErr = "";
shares.forEach((p, i) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", (dur * p).toFixed(2), "-i", file, "-frames:v", "1", "-vf", `scale=${tw}:-2`, path.join(tmp, `${i}.png`)], { encoding: "utf8" });
  if (r.status !== 0) frErr ||= (r.stderr ?? "").split("\n")[0];
});
const fr = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(tmp, "%d.png"), "-vf", `tile=${wide ? "4x2" : "8x1"}`, "-frames:v", "1", "-q:v", "3", sheet], { encoding: "utf8" });
fs.rmSync(tmp, { recursive: true, force: true });
if (frErr || fr.status !== 0) say("YELLOW", "frames", `check sheet failed: ${frErr || (fr.stderr ?? "").split("\n")[0]}`);

// ---- 4. social captions (episode only) ----
let capLine = "captions skipped";
if (!args.includes("--no-captions") && ep) {
  const hub = hubRoot();
  if (!hub) say("YELLOW", "captions", "hub not found: run audira_validate_social_captions");
  else {
    const { validateSocialCaptions } = await import(pathToFileURL(path.join(hub, "mcp-server/src/social-captions.js")).href);
    // keywords that tie the captions to this video: --keywords=a,b, else the episode title words
    // (EP01_UNIVERSITAS_TERTUA_FATIMAH -> universitas, tertua, fatimah); at least one must appear.
    const kwArg = args.find((a) => a.startsWith("--keywords="))?.slice(11);
    let kw = kwArg ? kwArg.split(",") : path.basename(ep.dir).replace(/^EP\d+_?/i, "").split("_").filter((w) => w.length >= 4 && !/PENDING/i.test(w));
    if (!kwArg) {
      const capFile = ["SOCIAL_CAPTIONS.md", "docs/SOCIAL_CAPTIONS.md"].map((f) => path.join(ep.dir, f)).find((f) => fs.existsSync(f));
      const text = capFile ? fs.readFileSync(capFile, "utf8").toLowerCase() : "";
      const hit = kw.filter((w) => text.includes(w.toLowerCase()));
      if (hit.length) kw = hit;
    }
    const r = await validateSocialCaptions({ episodeDir: ep.dir, expectedKeywords: kw.length ? kw : [path.basename(ep.dir)] });
    if (r.ok) capLine = `captions ok (${path.basename(r.file)})`;
    else { capLine = "captions RED"; for (const e of (r.errors ?? []).slice(0, 8)) say("RED", "captions", e); if ((r.errors ?? []).length > 8) say("RED", "captions", `… ${r.errors.length - 8} more`); }
  }
}

console.log(`${gate} · signature ${sig.status} · ${capLine}`);
console.log(`look at: ${sheet}${report ? `  report: ${report}` : ""}`);
console.log(red ? `DELIVER: RED (${red}) — fix the rows above` : "DELIVER: GREEN — record_score stage=final, then archive");
process.exitCode = red ? 1 : 0;
