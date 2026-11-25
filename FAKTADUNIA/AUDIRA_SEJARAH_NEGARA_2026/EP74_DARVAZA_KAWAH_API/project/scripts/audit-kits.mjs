// Measure every style kit the same way and compare with the last baseline, so each polish round
// proves (or disproves) that a kit got better. Run inside the skill repo.
//   npm run audit:kits                         all <Kit>Preview compositions
//   npm run audit:kits -- Filmnoir,Hd2d        only these (composition id without "Preview")
//   npm run audit:kits -- --write-baseline     store this run as ../qa/kit-baseline.json
//   npm run audit:kits -- --docs               only the KIT.md contract check (no render)
// Every run first checks each kits/<kit>/KIT.md against references/kit-md-template.md and prints
// missing or empty mandatory sections in red (exit 1).
// Per kit: 4 stills (20/45/70/92 % of the preview) at half scale in out/aud/<kit>/, then
// visual-audit against the quality-bar cover. Each kit is recorded in motion memory
// (source "audit:kits", episode "kit-audit-<date>"). Bundles once, one browser for all kits.

import "./lib/tmpdir.mjs";
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { glMode, tolerateClosedTargets } from "./gl.mjs";
import { auditKitDocs, reportKitDocs } from "./lib/kit-docs.mjs";

tolerateClosedTargets();
const args = process.argv.slice(2);
const writeBaseline = args.includes("--write-baseline");
const BASE = path.resolve("../qa/kit-baseline.json");
if (!fs.existsSync("../kits")) { console.log("audit:kits runs in the skill repo only (starter/ next to kits/)."); process.exit(0); }

const pick = args.find((a) => !a.startsWith("--"));

// ---- KIT.md contract (cheap, always first). --docs = only this check, no render. ----
const docOnly = pick ? pick.split(",").map((s) => s.replace(/Preview$/, "").toLowerCase()) : null;
const docRed = reportKitDocs(auditKitDocs(path.resolve("../kits"), docOnly));
if (args.includes("--docs")) process.exit(docRed ? 1 : 0);

const root = fs.readFileSync("src/Root.tsx", "utf8");
let ids = [...root.matchAll(/id="([A-Za-z0-9]+)Preview"/g)].map((m) => m[1]).filter((n) => !/Wide$|^Showcase$|^PeopleDemo$/.test(n));
if (pick) { const want = pick.split(",").map((s) => s.replace(/Preview$/, "").toLowerCase()); ids = ids.filter((i) => want.includes(i.toLowerCase())); }
const kitDirs = new Set(fs.readdirSync("../kits"));
const date = new Date().toISOString().slice(0, 10);
const audit = path.join(path.dirname(fileURLToPath(import.meta.url)), "visual-audit.mjs");

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
process.on("exit", () => fs.rmSync(serveUrl, { recursive: true, force: true }));
const gl = glMode();
const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
const results = {};
for (const id of ids) {
  const kit = id.toLowerCase();
  if (!kitDirs.has(kit)) continue;
  const dir = path.join("out/aud", kit);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  try {
    const composition = await selectComposition({ serveUrl, id: id + "Preview", puppeteerInstance: browser });
    for (const p of [0.2, 0.45, 0.7, 0.92]) {
      const frame = Math.min(composition.durationInFrames - 1, Math.round(composition.durationInFrames * p));
      await renderStill({ composition, serveUrl, output: path.join(dir, `f${String(frame).padStart(4, "0")}.png`), frame, scale: 0.5, chromiumOptions: { gl }, timeoutInMilliseconds: 180000, puppeteerInstance: browser });
    }
    spawnSync(process.execPath, [audit, dir, `--style=${kit.toUpperCase()}`, `--comp=${id}Preview`, "--source=audit:kits", "--stage=kit-polish",
      `--label=kit-audit-${date}`, `--json=${dir}/look.json`, `--sheet=${dir}/compare.jpg`], { encoding: "utf8" });
    const j = JSON.parse(fs.readFileSync(path.join(dir, "look.json"), "utf8"));
    const c = j.ceilings;
    results[kit] = { lighting: c.lighting, material: c.material, depth: c.depth, composition: c.composition, diversity: j.diversity, cover: !!j.cover };
  } catch (e) {
    results[kit] = { error: String(e.message).split("\n")[0] };
  }
}
await browser.close({ silent: true }).catch(() => {});

// ---- report vs baseline ----
const base = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, "utf8")) : null;
const sum = (r) => (r && !r.error ? r.lighting + r.material + r.depth + r.composition : null);
const rows = Object.entries(results).map(([kit, r]) => ({ kit, r, now: sum(r), was: sum(base?.kits?.[kit]) })).sort((a, b) => (a.now ?? -1) - (b.now ?? -1));
console.log(`kit`.padEnd(20) + "L M D C".padEnd(10) + "sum".padStart(5) + "  was  diversity");
for (const { kit, r, now: n, was } of rows) {
  if (r.error) { console.log(`${kit.padEnd(20)}ERROR ${r.error}`); continue; }
  const d = was === null ? "" : n > was ? ` +${n - was}` : n < was ? ` ${n - was}` : " =";
  console.log(`${kit.padEnd(20)}${[r.lighting, r.material, r.depth, r.composition].join(" ").padEnd(10)}${String(n).padStart(5)}${(was === null ? "  —" : `  ${was}`).padEnd(5)}${d.padEnd(4)} ${r.diversity}${r.cover ? "" : "  (no cover)"}`);
}
const better = rows.filter((x) => x.was !== null && x.now > x.was).length, worse = rows.filter((x) => x.was !== null && x.now < x.was).length;
if (base) console.log(`\nvs baseline ${base.date}: ${better} better, ${worse} worse, ${rows.length - better - worse} unchanged`);
if (writeBaseline) {
  const next = { date, note: "npm run audit:kits; ceilings of 4 stills per <Kit>Preview vs references/quality-bar", kits: { ...(base?.kits ?? {}), ...results } };
  fs.writeFileSync(BASE, JSON.stringify(next, null, 2) + "\n");
  console.log(`baseline written: ${BASE}`);
}
process.exitCode = worse || docRed ? 1 : 0;
process.exit();
