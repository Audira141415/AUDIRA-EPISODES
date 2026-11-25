// Find finished episodes whose final never reached motion memory, measure the final MP4 and record it.
//   npm run memory:backfill -- --dry            list what would be recorded
//   npm run memory:backfill                     measure + record every missing final
//   npm run memory:backfill -- --ws=F:/AUDIRA-VIDEO-MOTION --limit=5
// An episode counts as recorded when motion memory has any score, lesson or run with its label
// (<series>-EP<NN>) or with a file inside its folder. The audit writes <episode>/docs/look-final.json
// and records a run with source "backfill", stage "final". Scores are not invented: judge them later
// with record_score if the episode is worth it.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { findEpisode, hubRoot } from "./lib/memory.mjs";
import { probe } from "./lib/av.mjs";

const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const WS = opt("ws") ?? process.env.AUDIRA_WS ?? "F:/AUDIRA-VIDEO-MOTION";
const dry = args.includes("--dry"), limit = Number(opt("limit") ?? Infinity);
const hub = hubRoot();
if (!hub) { console.error("motion memory hub not found (set AUDIRA_HUB)"); process.exit(2); }

const SKIP = new Set(["node_modules", "out", "public", "seg", ".git"]);
const walk = (d, depth = 0) => depth > 6 || !fs.existsSync(d) ? [] : fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  if (SKIP.has(e.name) || e.name.startsWith(".")) return [];
  const p = path.join(d, e.name).replace(/\\/g, "/");
  return e.isDirectory() ? (e.name.startsWith("_") ? [] : walk(p, depth + 1)) : [p];
});
const files = walk(WS);
const epDirs = [...new Set(files.filter((f) => /\/(STATUS\.json|style\/STYLE_DECISION\.md)$/.test(f)).map((f) => path.dirname(f).replace(/\/style$/, "")))].sort();

const memCache = {};
const mem = (style) => (memCache[style] ??= (() => {
  const f = path.join(hub, "motion-memory/styles", `${style}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { scores: [], lessons: [], runs: [] };
})());
const recorded = (style, label, dir) => {
  const m = mem(style), d = dir.toLowerCase();
  return [...(m.scores || []), ...(m.lessons || []), ...(m.runs || [])].some((r) =>
    String(r.episode || "").toLowerCase() === label.toLowerCase() ||
    String(r.still || r.file || "").replace(/\\/g, "/").toLowerCase().startsWith(d + "/"));
};
// the delivered film: a FINAL mp4 outside project/, newest first (tagged copies win over raw ones)
const finalOf = (dir) => files.filter((f) => f.startsWith(dir + "/") && /\.mp4$/i.test(f) && /final/i.test(path.basename(f)) && !/\/project\//.test(f))
  .sort((a, b) => (/tagged/i.test(b) - /tagged/i.test(a)) || fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

const todo = [];
let noStyle = 0, noFinal = 0, done = 0;
for (const dir of epDirs) {
  const ep = findEpisode(dir);
  if (!ep?.style) { noStyle++; continue; }
  const film = finalOf(dir);
  if (!film) { noFinal++; continue; }
  if (recorded(ep.style, ep.label, dir)) { done++; continue; }
  todo.push({ dir, film, ...ep });
}
console.log(`${epDirs.length} episodes: ${done} already in memory, ${todo.length} finals missing, ${noFinal} without a final, ${noStyle} without a known style`);
const audit = path.join(path.dirname(fileURLToPath(import.meta.url)), "visual-audit.mjs");
let n = 0;
for (const t of todo.slice(0, limit)) {
  const rel = t.dir.slice(WS.length + 1);
  if (dry) { console.log(`  ${t.style.padEnd(18)} ${t.label.padEnd(30)} ${rel}/${path.basename(t.film)}`); continue; }
  const json = path.join(t.dir, "docs", "look-final.json");
  fs.mkdirSync(path.dirname(json), { recursive: true });
  const a = [audit, `--video=${t.film}`, `--episode-dir=${t.dir}`, "--source=backfill", "--stage=final", `--json=${json}`];
  try { const v = probe(t.film).video; if (v.width > v.height) a.push("--wide"); } catch {}
  const r = spawnSync(process.execPath, a, { encoding: "utf8" });
  const ok = /motion memory: run recorded/.test(r.stdout);
  const capped = (r.stdout.match(/PERLU POLES:[^\n]*/) || [])[0];
  console.log(`  ${ok ? "recorded" : "FAILED  "} ${t.style.padEnd(18)} ${t.label.padEnd(30)} ${capped ?? "no aspect capped below 4"}${ok ? "" : ` ${String(r.stderr).trim().split("\n")[0]}`}`);
  if (ok) n++;
}
if (!dry) console.log(`\n${n} final(s) recorded in motion memory`);
