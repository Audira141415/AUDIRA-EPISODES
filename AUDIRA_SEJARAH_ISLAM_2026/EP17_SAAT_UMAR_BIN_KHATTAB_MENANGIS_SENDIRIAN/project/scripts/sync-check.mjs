// Does the cut land with the sound? Run on a draft clip or the final MP4 (stages 8–9).
//   node scripts/sync-check.mjs out/final.mp4 [--shotlist=SHOTLIST.md | --cues=out/cues.json]
//        [--timing=public/audio/vo.timing.json] [--words=vo-words.json] [--offset=0] [--beat] [--tol=100] [--json=out/sync.json]
// Per cut:
//   VO      where the cut lands in the narration (pause = ok, between words = yellow, inside a word = red)
//   jump    loudness jump into the cut; > 6 dB = STARTLE (red)
//   beat    with --beat (music-led films): offset to the nearest strong onset; > --tol ms = OFF-BEAT (yellow)
// Also, with --timing: VO drift = measured pauses in the MP4 vs. the timing file + offset (> 80 ms = red).
// No shot list or cues: cuts are detected from the picture (dips and hard cuts), which misses soft whips.
// Exit 0 = no red, 1 = red, 2 = unreadable input.

import fs from "node:fs";
import { syncCheck } from "./lib/sync.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const flag = (k) => args.includes(`--${k}`);
if (!file || !fs.existsSync(file)) {
  console.error("usage: node scripts/sync-check.mjs <video.mp4> [--shotlist=SHOTLIST.md|--cues=cues.json] [--timing=vo.timing.json] [--words=words.json] [--offset=0] [--beat] [--tol=100] [--json=out.json]");
  process.exit(2);
}

let r;
try {
  r = await syncCheck(file, {
    shotlist: opt("shotlist"), cues: opt("cues"), timing: opt("timing"), words: opt("words"),
    offset: opt("offset") !== undefined ? Number(opt("offset")) : undefined, beat: flag("beat"), tol: opt("tol") ? Number(opt("tol")) : undefined,
  });
} catch (e) {
  console.error(`${file}: not a readable video (${String(e.message).split("\n")[0]})`);
  process.exit(2);
}
if (r.error) { console.error(r.error); process.exit(2); }

console.log(`${file}: ${r.duration.toFixed(2)} s @ ${r.fps.toFixed(0)} fps · ${r.rows.length} cuts (${r.source}) · VO offset ${r.offset} s\n`);
console.log(`   cut      VO              jump${flag("beat") ? "    beat" : ""}   verdict`);
let red = 0, yellow = 0;
for (const row of r.rows) {
  const f = row.issues.some((i) => i.level === "fail"), w = row.issues.some((i) => i.level === "warn");
  if (f) red++; else if (w) yellow++;
  console.log(`${row.t.toFixed(2).padStart(7)} s  ${(row.vo ?? "-").padEnd(14)} ${((row.jump >= 0 ? "+" : "") + row.jump).padStart(6)} dB${flag("beat") ? `  ${String(row.beat ?? "-").padStart(5)} ms` : ""}   ${f ? "RED" : w ? "YELLOW" : "ok"}`);
  for (const i of row.issues) console.log(`            ${i.level === "fail" ? "RED   " : "YELLOW"} ${i.msg}`);
}
if (r.drift) {
  if (r.drift.median === null) console.log(`\nVO drift: not measurable (${r.drift.matched}/${r.drift.of} pauses found; music may fill the pauses). Spot-check by ear.`);
  else {
    const bad = Math.abs(r.drift.median) > 80;
    if (bad) red++;
    console.log(`\nVO drift: ${r.drift.median >= 0 ? "+" : ""}${r.drift.median} ms median over ${r.drift.matched}/${r.drift.of} pauses ${bad ? "RED: VO is late/early, check --offset in render:final" : "ok"}`);
  }
}
console.log(`\n${red ? "RED" : "OK"}: ${red} red, ${yellow} yellow of ${r.rows.length} cuts.`);
if (opt("json")) fs.writeFileSync(opt("json"), JSON.stringify(r, null, 2));
process.exitCode = red ? 1 : 0;
