// audit:layout on its own: composition + readability faults measured from the DOM of the stills.
//   npm run audit:layout -- <stillsDir> [--wide] [--json=layout.json]
// The stills come from `npm run stills` (or `npm run draft`, which runs this inside audit:visual).
// Exit 0 = nothing capped at 3 or lower, 1 = composition or readability capped, 2 = bad input.
import fs from "node:fs";
import { auditLayout, layoutLines } from "./lib/layout.mjs";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const json = args.find((a) => a.startsWith("--json="))?.slice(7);
if (!dir) { console.error("usage: npm run audit:layout -- <stillsDir> [--wide] [--json=layout.json]"); process.exit(2); }
const res = auditLayout(dir, args.includes("--wide") ? "wide" : undefined);
if (!res) { console.error(`${dir}: no _layout.json (render the stills with npm run stills / npm run draft first)`); process.exit(2); }
console.log(`${res.frames.length} frame(s), ${res.summary.framesWithText} with text, ${res.summary.issues} issue(s)`);
for (const l of layoutLines(res)) console.log(l);
for (const a of ["composition", "readability"]) {
  console.log(`  ${a.padEnd(12)} ${res.ceil[a] ?? "—"}`);
  for (const w of res.why[a]) console.log(`               - ${w}`);
}
if (json) fs.writeFileSync(json, JSON.stringify(res, null, 1));
process.exitCode = ["composition", "readability"].some((a) => res.ceil[a] !== null && res.ceil[a] <= 3) ? 1 : 0;
