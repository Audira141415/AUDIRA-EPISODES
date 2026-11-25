// Join per-chapter voice-overs into one master VO for a long-form video (rule 09, stage 6).
//   npm run vo:join -- <ch1.wav> <ch2.wav> … --out=public/audio/full.wav [--gap=0.5] [--titles="Hook|Intro|Bab 1|…"]
//
// Make each chapter with audira_generate_voiceover (lang "id"); its word timestamps (<name>-words.json or
// <name>.words.json next to the audio) are picked up automatically. Writes:
//   <out>                   all chapters in order with --gap seconds of silence between them (48 kHz)
//   <out base>-words.json   every word re-timed onto the joined VO (subtitles, karaoke, lint)
//   <out base>.chapters.json  [{ title, file, start, end }] in seconds
// and prints the YouTube chapter list (00:00 …) for YOUTUBE_LONG.md. Then run npm run vo -- <out> as usual:
// the joined VO is the master clock for the whole film.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const opt = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const out = opt("out");
if (files.length < 2 || !out) {
  console.error('usage: npm run vo:join -- <ch1.wav> <ch2.wav> … --out=public/audio/full.wav [--gap=0.5] [--titles="Hook|Intro|…"]');
  process.exit(2);
}
const gap = Number(opt("gap", "0.5"));
const titles = opt("titles") ? opt("titles").split("|") : [];

const duration = (f) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  const d = Number(r.stdout.trim());
  if (!(d > 0)) { console.error(`cannot read duration of ${f}`); process.exit(1); }
  return d;
};
const wordsOf = (f) => {
  const p = path.parse(f);
  for (const c of [path.join(p.dir, `${p.name}-words.json`), path.join(p.dir, `${p.name}.words.json`)]) {
    if (fs.existsSync(c)) return JSON.parse(fs.readFileSync(c, "utf8"));
  }
  return null;
};

let t = 0;
const chapters = [], words = [];
files.forEach((f, i) => {
  if (!fs.existsSync(f)) { console.error(`not found: ${f}`); process.exit(1); }
  const d = duration(f);
  chapters.push({ title: titles[i] ?? path.parse(f).name, file: f.replace(/\\/g, "/"), start: +t.toFixed(3), end: +(t + d).toFixed(3) });
  const w = wordsOf(f);
  if (w) for (const x of w) words.push({ ...x, start: +(x.start + t).toFixed(3), end: +(x.end + t).toFixed(3) });
  else console.warn(`(no word timestamps next to ${f}; subtitles for this chapter need npm run vo)`);
  t += d + (i < files.length - 1 ? gap : 0);
});

// each chapter resampled to 48 kHz mono and padded with the gap, then concatenated
const inputs = files.flatMap((f) => ["-i", f]);
const pads = files.map((_, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=mono${i < files.length - 1 ? `,apad=pad_dur=${gap}` : ""}[a${i}]`).join(";");
const graph = `${pads};${files.map((_, i) => `[a${i}]`).join("")}concat=n=${files.length}:v=0:a=1[out]`;
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", graph, "-map", "[out]", "-c:a", "pcm_s16le", out], { encoding: "utf8" });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }

const base = path.join(path.dirname(out), path.parse(out).name);
if (words.length) fs.writeFileSync(`${base}-words.json`, JSON.stringify(words, null, 1));
fs.writeFileSync(`${base}.chapters.json`, JSON.stringify(chapters, null, 2));
const ts = (s) => { const m = Math.floor(s / 60), h = Math.floor(m / 60); return h ? `${h}:${String(m % 60).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };
console.log(`vo: ${out} (${files.length} chapters, ${ts(t)})`);
console.log(`words: ${words.length ? `${base}-words.json (${words.length} words)` : "none"}; chapters: ${base}.chapters.json`);
console.log("YouTube chapters (add the VO offset of the film if it does not start at 0):");
for (const c of chapters) console.log(`${ts(c.start)} ${c.title}`);
