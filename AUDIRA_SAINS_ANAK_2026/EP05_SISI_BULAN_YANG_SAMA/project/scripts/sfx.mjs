// Sound effects for a film: build a timeline from SHOTLIST.md (+ VO timing), then render a cue
// sheet with the procedural engine in sfx/ (Python 3 stdlib) to one mastered stem.
//   npm run sfx                                  SHOTLIST.md -> out/sfx-timeline.json -> public/audio/sfx.wav
//   npm run sfx -- --timing=public/audio/vo.timing.json --offset=0.3
//   npm run sfx -- --cues=sfx/cues/my-episode.py --out=public/audio/sfx.wav --style=FILMNOIR
//   npm run sfx -- --list                        generators and what each is for
//   options: --shotlist=SHOTLIST.md  --duration=<s>  --no-pad  --timeline-only
// Then: npm run render:final -- ... --vo=public/audio/vo.mp3 --sfx=public/audio/sfx.wav
// SHOTLIST.md is looked for here, then in the episode folder (.., ../docs). Times are film seconds;
// VO times are shifted by the shot list's "Offset:" (or --offset) so both share one clock.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseShotlist } from "./lib/shotlist.mjs";
import { loadVoTiming } from "./lib/vo-timing.mjs";
import { context } from "./lib/memory.mjs";

const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (k) => args.includes(`--${k}`);

function python() {
  const tries = [process.env.PYTHON && [process.env.PYTHON], ["python"], ["python3"], ["py", "-3"]].filter(Boolean);
  for (const t of tries) {
    const r = spawnSync(t[0], [...t.slice(1), "-c", "import sys; print(sys.version_info[0])"], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim() === "3") return t;
  }
  console.error("Python 3 not found: install it or set PYTHON=<path to python.exe>.");
  process.exit(2);
}
const py = (pyArgs) => { const p = python(); return spawnSync(p[0], [...p.slice(1), ...pyArgs], { stdio: "inherit" }).status ?? 1; };

if (has("list")) process.exit(py(["-m", "sfx", "--list"]));

const find = (name) => [name, path.join("..", name), path.join("..", "docs", name)].find((f) => fs.existsSync(f));
const shotFile = opt("shotlist") ?? find("SHOTLIST.md");
if (!shotFile) { console.error("No SHOTLIST.md here or in the episode folder: pass --shotlist=<file>."); process.exit(2); }
const sl = parseShotlist(fs.readFileSync(shotFile, "utf8"));
const shots = sl.shots.filter((s) => Number.isFinite(s.from));
if (!shots.length) { console.error(`${shotFile}: no shot rows with times.`); process.exit(2); }

const offset = Number(opt("offset") ?? sl.header.offset ?? 0) || 0;
const timingFile = opt("timing") ?? ["public/audio/vo.timing.json", "public/vo.timing.json"].find((f) => fs.existsSync(f));
const vo = timingFile ? loadVoTiming(timingFile) : null;
const shift = (x) => ({ start: +(x.start + offset).toFixed(3), end: +(x.end + offset).toFixed(3) });

const lastShotEnd = Math.max(...shots.map((s) => (Number.isFinite(s.to) ? s.to : s.from)));
const duration = Number(opt("duration")) || +Math.max(lastShotEnd, vo ? vo.duration + offset : 0).toFixed(3);
const firstWith = (re) => shots.find((s) => re.test(`${s.beat} ${s.object}`))?.from ?? null;
const style = (opt("style") ?? (sl.header.style || "").match(/[A-Z][A-Z0-9]{3,}/)?.[0] ?? context({}).style ?? "").toUpperCase();

const tl = {
  schema: "audira-sfx-timeline/1",
  source: path.resolve(shotFile).replace(/\\/g, "/"),
  style,
  duration,
  offset,
  pad: !has("no-pad"),
  shots: shots.map((s) => ({ n: s.n, start: s.from, end: Number.isFinite(s.to) ? s.to : null, beat: s.beat, camera: s.camera, object: s.object, action: s.action, text: s.text })),
  cuts: shots.slice(1).map((s) => s.from),
  beats: {
    hook: firstWith(/hook/i) ?? shots[0].from,
    payoff: firstWith(/payoff|klimaks|puncak|reveal|climax/i),
    outro: firstWith(/outro|penutup|credit|closing/i),
  },
  vo: vo ? { start: +(vo.firstSpeech + offset).toFixed(3), end: +(vo.lastSpeech + offset).toFixed(3), pauses: vo.pauses.map(shift), phrases: vo.phrases.map(shift) } : null,
};
fs.mkdirSync("out", { recursive: true });
const tlFile = path.join("out", "sfx-timeline.json");
fs.writeFileSync(tlFile, JSON.stringify(tl, null, 2));
console.log(`timeline: ${tlFile} (${shots.length} shots, ${tl.cuts.length} cuts, ${duration}s${vo ? `, VO ${timingFile} +${offset}s` : ", no VO timing"}${style ? `, ${style}` : ""})`);
if (has("timeline-only")) process.exit(0);

const cues = opt("cues") ?? "sfx/cues/auto.py";
const out = opt("out") ?? "public/audio/sfx.wav";
const t0 = Date.now();
const code = py(["-m", "sfx", cues, "--timeline", tlFile, "--out", out]);
if (code === 0) console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s) next: render:final ... --sfx=${out}`);
process.exit(code);
