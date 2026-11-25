// Writes the series' channel (handle, name) to src/brand/channel.json for <AudiraSignature> and
// <AudiraOutro>, and checks both in src/ against it (rule 08). Also runs in check-env and render-final.
//   node scripts/channel.mjs            write + check, exit 1 on a mismatch or a missing handle
//   node scripts/channel.mjs --check    check only

import { writeChannel, resolveChannel, checkBrandMarks } from "./lib/channel.mjs";

const ch = process.argv.includes("--check") ? resolveChannel() : writeChannel();
if (ch.problem) { console.error(`channel: ${ch.problem}`); process.exit(1); }
console.log(`channel: ${ch.name} ${ch.handle} (${ch.code}) from ${ch.sources.map((s) => s.from).join(", ")}${ch.written ? "; wrote src/brand/channel.json" : ""}`);
const rows = checkBrandMarks();
for (const r of rows) console.log(`${r.level === "ok" ? "  ok " : r.level === "warn" ? "  !  " : "  ✗  "}${r.msg}`);
process.exit(rows.some((r) => r.level === "fail") ? 1 : 0);
