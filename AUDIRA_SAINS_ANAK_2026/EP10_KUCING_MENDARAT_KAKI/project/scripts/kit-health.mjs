// Kit health dashboard: one-line-per-kit overview of score, quality-bar, gold, and gaps.
//   npm run kit:health                   full table
//   npm run kit:health -- --json         machine-readable
//   npm run kit:health -- --tier=near    only near-gold (4.0–4.49)
//   npm run kit:health -- --sort=weakest sort by weakest aspect
//   npm run kit:health -- innerworks     single kit

import fs from "node:fs";
import path from "node:path";

const MEMORY = "F:/AUDIRA-ALL-SKILL/motion-memory/styles";
const KITS = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1")), "../../kits");
const QBAR = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1")), "../../references/quality-bar");

const args = process.argv.slice(2);
const json = args.includes("--json");
const tierFilter = args.find(a => a.startsWith("--tier="))?.split("=")[1];
const sortBy = args.find(a => a.startsWith("--sort="))?.split("=")[1];
const only = args.filter(a => !a.startsWith("--")).map(s => s.toUpperCase());

const ASPECTS = ["lighting", "material", "depth", "composition", "motion", "readability"];

function readMemory(style) {
  const f = path.join(MEMORY, `${style}.json`);
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
}

function hasQBar(style) {
  const lo = style.toLowerCase();
  return ["png", "jpg", "jpeg"].some(ext => fs.existsSync(path.join(QBAR, `${lo}.${ext}`)));
}

function hasGold(style) {
  const goldDir = path.join(KITS, style.toLowerCase(), "gold");
  if (!fs.existsSync(goldDir)) return { has: false, count: 0 };
  const entries = fs.readdirSync(goldDir).filter(e => fs.statSync(path.join(goldDir, e)).isDirectory());
  return { has: entries.length > 0, count: entries.length };
}

function kitHasFinishDefaults(style) {
  const kitMd = path.join(KITS, style.toLowerCase(), "KIT.md");
  if (!fs.existsSync(kitMd)) return false;
  const text = fs.readFileSync(kitMd, "utf8");
  return /finish\s*default|finishProfile|finishDefaults/i.test(text);
}

function kitHasDepthRecipe(style) {
  const kitMd = path.join(KITS, style.toLowerCase(), "KIT.md");
  if (!fs.existsSync(kitMd)) return false;
  const text = fs.readFileSync(kitMd, "utf8");
  return /depth\s*recipe|FG.*MG.*BG|foreground.*midground.*background/i.test(text);
}

function analyzeKit(style) {
  const mem = readMemory(style);
  const scores = mem?.scores || [];
  const qbar = hasQBar(style);
  const gold = hasGold(style);
  const hasFinish = kitHasFinishDefaults(style);
  const hasDepth = kitHasDepthRecipe(style);

  let avg = null, count = scores.length, weakest = null, weakestVal = 6;
  const aspectAvgs = {};
  if (count > 0) {
    for (const a of ASPECTS) {
      const vals = scores.map(s => s[a]).filter(v => typeof v === "number");
      aspectAvgs[a] = vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null;
      if (aspectAvgs[a] !== null && aspectAvgs[a] < weakestVal) {
        weakestVal = aspectAvgs[a];
        weakest = a;
      }
    }
    const allAvgs = Object.values(aspectAvgs).filter(v => v !== null);
    avg = allAvgs.length ? +(allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length).toFixed(2) : null;
  }

  const juryScores = scores.filter(s => s.judge === "jury");
  const juryAvg = juryScores.length
    ? +(juryScores.reduce((s, sc) => s + sc.average, 0) / juryScores.length).toFixed(2)
    : null;
  const juryPassed = juryScores.some(s => s.pass);

  const bestScore = scores.length
    ? Math.max(...scores.map(s => s.average).filter(v => typeof v === "number"))
    : null;

  const lessons = mem?.lessons || [];
  const failedCount = lessons.filter(l => typeof l === "string" ? l.startsWith("failed") : l.type === "failed").length;

  let tier = "unscored";
  if (avg !== null) {
    if (avg >= 4.5) tier = "gold";
    else if (avg >= 4.0) tier = "near-gold";
    else if (avg >= 3.0) tier = "mid";
    else tier = "low";
  }

  return {
    style, avg, juryAvg, bestScore, count, tier,
    qbar, gold: gold.has, goldCount: gold.count,
    hasFinish, hasDepth, weakest, weakestVal: weakest ? weakestVal : null,
    juryPassed, failedCount, aspectAvgs,
    gaps: [
      !qbar && "no-qbar",
      !gold.has && "no-gold",
      !hasFinish && "no-finish",
      !hasDepth && "no-depth",
    ].filter(Boolean),
  };
}

// Gather all kits
const kitDirs = fs.readdirSync(KITS).filter(k => fs.statSync(path.join(KITS, k)).isDirectory()).sort();
let results = kitDirs
  .map(k => analyzeKit(k.toUpperCase()))
  .filter(r => !only.length || only.includes(r.style));

if (tierFilter) results = results.filter(r => r.tier === tierFilter);

if (sortBy === "weakest") results.sort((a, b) => (a.weakestVal ?? 6) - (b.weakestVal ?? 6));
else if (sortBy === "avg") results.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
else if (sortBy === "gaps") results.sort((a, b) => b.gaps.length - a.gaps.length);
else results.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

if (json) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

// Summary
const tiers = { gold: 0, "near-gold": 0, mid: 0, low: 0, unscored: 0 };
for (const r of results) tiers[r.tier]++;
const withGold = results.filter(r => r.gold).length;
const withQBar = results.filter(r => r.qbar).length;
const withFinish = results.filter(r => r.hasFinish).length;
const withDepth = results.filter(r => r.hasDepth).length;

console.log(`\n  KIT HEALTH DASHBOARD  (${results.length} kits)\n`);
console.log(`  Tiers:  gold ${tiers.gold}  |  near-gold ${tiers["near-gold"]}  |  mid ${tiers.mid}  |  low ${tiers.low}  |  unscored ${tiers.unscored}`);
console.log(`  Gold archives: ${withGold}/${results.length}  |  Quality-bar: ${withQBar}/${results.length}  |  Finish defaults: ${withFinish}/${results.length}  |  Depth recipe: ${withDepth}/${results.length}\n`);

// Table header
const pad = (s, n) => String(s).slice(0, n).padEnd(n);
const rpad = (s, n) => String(s).slice(0, n).padStart(n);
console.log(`  ${pad("KIT", 22)} ${rpad("AVG", 5)} ${rpad("JURY", 5)} ${rpad("BEST", 5)} ${rpad("#SC", 4)} ${pad("TIER", 10)} ${pad("QBAR", 5)} ${pad("GOLD", 5)} ${pad("FIN", 4)} ${pad("DEP", 4)} ${pad("WEAKEST", 14)} ${pad("GAPS", 30)}`);
console.log("  " + "-".repeat(120));

for (const r of results) {
  const avgStr = r.avg !== null ? r.avg.toFixed(2) : "  -  ";
  const juryStr = r.juryAvg !== null ? r.juryAvg.toFixed(2) : "  -  ";
  const bestStr = r.bestScore !== null ? r.bestScore.toFixed(2) : "  -  ";
  const weakStr = r.weakest ? `${r.weakest}(${r.weakestVal.toFixed(1)})` : "-";
  const mark = (v) => v ? " yes" : "  - ";
  console.log(`  ${pad(r.style, 22)} ${rpad(avgStr, 5)} ${rpad(juryStr, 5)} ${rpad(bestStr, 5)} ${rpad(r.count, 4)} ${pad(r.tier, 10)} ${pad(mark(r.qbar), 5)} ${pad(mark(r.gold), 5)} ${pad(mark(r.hasFinish), 4)} ${pad(mark(r.hasDepth), 4)} ${pad(weakStr, 14)} ${r.gaps.join(", ")}`);
}

// Weakest-aspect histogram
const aspectHist = {};
for (const r of results) if (r.weakest) aspectHist[r.weakest] = (aspectHist[r.weakest] || 0) + 1;
console.log(`\n  Weakest-aspect distribution:`);
for (const [a, c] of Object.entries(aspectHist).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${pad(a, 14)} ${"█".repeat(c)} ${c}`);
}

// Action items
console.log(`\n  Priority actions:`);
if (tiers.gold > withGold) console.log(`  - Archive gold: ${tiers.gold - withGold} kit(s) score ≥4.5 but have no gold/ directory`);
if (results.length - withQBar > 0) console.log(`  - Add quality-bar refs: ${results.length - withQBar} kit(s) missing (audit caps score at 4)`);
if (results.length - withFinish > 0) console.log(`  - Add Finish defaults: ${results.length - withFinish} kit(s) missing recommended Finish profile`);
if (results.length - withDepth > 0) console.log(`  - Add depth recipes: ${results.length - withDepth} kit(s) missing FG/MG/BG layer recipe`);
const nearGoldKits = results.filter(r => r.tier === "near-gold").sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)).slice(0, 5);
if (nearGoldKits.length) {
  console.log(`  - Near-gold (top 5, fix weakest aspect for fastest gold):`);
  for (const r of nearGoldKits) console.log(`      ${pad(r.style, 20)} avg ${r.avg}  weakest: ${r.weakest}(${r.weakestVal})`);
}
console.log();
