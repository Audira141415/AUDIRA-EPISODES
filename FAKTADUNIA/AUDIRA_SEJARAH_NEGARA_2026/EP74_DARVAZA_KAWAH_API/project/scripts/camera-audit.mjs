// Camera audit: measure how the camera moves in a rendered clip and give the "motion" score (1–5)
// with the evidence, for audira_style_memory record_score. A still cannot show motion: covers are
// scored without motion (null), drafts and finals get this measured score.
//   npm run audit:camera -- <clip.mp4> [more.mp4 ...] [--from=s] [--dur=s] [--json=out.json]
// Draft clips are short (15–20 s, 540×960); for a final, measure the whole film or a long part.

import fs from "node:fs";
import path from "node:path";
import { measureCamera, cameraScore } from "./lib/camera-metrics.mjs";

const opt = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? "").split("=").slice(1).join("=");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!files.length) {
  console.error("usage: npm run audit:camera -- <clip.mp4> [more.mp4 ...] [--from=s] [--dur=s] [--json=out.json]");
  process.exit(2);
}
const results = [];
for (const f of files) {
  const m = measureCamera(f, { from: Number(opt("from") || 0), dur: Number(opt("dur") || 0) });
  const { score, why } = cameraScore(m);
  results.push({ file: f, score, why, ...m });
  const strip = m.perSecond.map((x) => (x === null ? "|" : x < 0.008 ? "." : x < 0.05 ? "-" : x < 0.25 ? "=" : x < 0.6 ? "#" : "!")).join("");
  console.log(`${path.basename(f)}: motion ${score}/5  (${why.join("; ")})`);
  console.log(`  ${m.seconds} s, ${m.cuts} cuts, parked ${m.deadPct}%, longest hold ${m.longestHold} s, jerks ${m.jerksPer10s}/10 s, too fast ${m.fastPct}%, median speed ${m.medianSpeed}`);
  console.log(`  per second  ${strip}`);
  console.log(`  legend      . parked  - slow  = moving  # fast  ! too fast  | cut/unreadable`);
  if (m.jerks.length) console.log(`  jerks at    ${m.jerks.map((j) => `${j.t}s`).join(", ")}`);
}
if (opt("json")) fs.writeFileSync(opt("json"), JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
