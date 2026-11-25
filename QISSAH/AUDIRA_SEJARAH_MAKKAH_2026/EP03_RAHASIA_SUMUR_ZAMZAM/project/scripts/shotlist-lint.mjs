// Lint SHOTLIST.md before writing scene code (pipeline stage 7). Red = fix the shot list first.
//   node scripts/shotlist-lint.mjs SHOTLIST.md [--timing=public/audio/vo.timing.json] [--words=vo-words.json]
//        [--offset=0] [--script=script/NASKAH.md] [--cues=out/cues.json]
// --timing/--words  check every cut against the real VO (in-word = red, mid-phrase = yellow)
// --offset          VO start in film seconds (default: `Offset:` line in the shot list, else 0)
// --script          every number in the on-screen text must also be in the script
// --cues            write cut times (film seconds) for `npm run qa:sync -- <mp4> --cues=...`
// Exit: 0 = no red, 1 = red, 2 = file or table unreadable. Format: see scripts/lib/shotlist.mjs.

import fs from "node:fs";
import path from "node:path";
import { parseShotlist, lintShotlist, cutsOf } from "./lib/shotlist.mjs";
import { loadVoTiming } from "./lib/vo-timing.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
if (!file || !fs.existsSync(file)) {
  console.error("usage: node scripts/shotlist-lint.mjs SHOTLIST.md [--timing=vo.timing.json] [--words=words.json] [--offset=0] [--script=NASKAH.md] [--cues=cues.json]");
  process.exit(2);
}
const sl = parseShotlist(fs.readFileSync(file, "utf8"));
if (!sl.found) { console.error(`${file}: no table with time, object and action columns`); process.exit(2); }

const vo = opt("timing") || opt("words") ? loadVoTiming(opt("timing"), opt("words")) : null;
const offset = Number(opt("offset") ?? sl.header.offset ?? 0) || 0;
const script = opt("script") ? fs.readFileSync(opt("script"), "utf8") : undefined;
const issues = lintShotlist(sl, { vo, offset, script });

const fails = issues.filter((i) => i.level === "fail"), warns = issues.filter((i) => i.level === "warn");
const end = sl.shots.at(-1)?.to;
console.log(`${path.basename(file)}: ${sl.shots.length} shots, ${Number.isFinite(end) ? end.toFixed(1) : "?"} s · style ${sl.header.style ?? "?"}${vo ? ` · VO ${vo.duration.toFixed(1)} s, offset ${offset}` : ""}`);
for (const i of [...fails, ...warns]) console.log(`  ${i.level === "fail" ? "RED   " : "YELLOW"} ${i.shot ? `#${String(i.shot).padEnd(3)}` : "    "} ${i.code.padEnd(9)} ${i.msg}`);
console.log(fails.length ? `RED: ${fails.length} red, ${warns.length} yellow. Fix the shot list before writing scenes.` : `OK: 0 red, ${warns.length} yellow.`);

if (opt("cues")) {
  fs.mkdirSync(path.dirname(path.resolve(opt("cues"))), { recursive: true });
  fs.writeFileSync(opt("cues"), JSON.stringify({ source: file, offset, cuts: cutsOf(sl) }, null, 2));
  console.log(`cues: ${opt("cues")}`);
}
process.exitCode = fails.length ? 1 : 0;
