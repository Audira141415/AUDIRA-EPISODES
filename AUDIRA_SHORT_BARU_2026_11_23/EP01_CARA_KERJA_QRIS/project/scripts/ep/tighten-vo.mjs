// Tighten long VO pauses: any gap > MAX is cut to KEEP (cut taken from the middle). Shifts word timings.
import fs from "node:fs"; import { execFileSync } from "node:child_process";
const [inWav, inWords, outWav, outWords] = process.argv.slice(2);
const MAX = 0.6, KEEP = 0.45;
const w = JSON.parse(fs.readFileSync(inWords, "utf8"));
const cuts = [];
for (let i = 1; i < w.length; i++) { const g = w[i].start - w[i - 1].end; if (g > MAX) { const mid = (w[i - 1].end + w[i].start) / 2; cuts.push([mid - (g - KEEP) / 2, mid + (g - KEEP) / 2]); } }
const keep = []; let t = 0; for (const [a, b] of cuts) { keep.push([t, a]); t = b; } keep.push([t, null]);
const parts = keep.map(([a, b], i) => `[0:a]atrim=start=${a.toFixed(3)}${b != null ? `:end=${b.toFixed(3)}` : ""},asetpts=PTS-STARTPTS[s${i}]`);
const fc = parts.join(";") + ";" + keep.map((_, i) => `[s${i}]`).join("") + `concat=n=${keep.length}:v=0:a=1[o]`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", inWav, "-filter_complex", fc, "-map", "[o]", "-ar", "44100", outWav]);
const shift = (x) => { let s = 0; for (const [a, b] of cuts) if (x >= b) s += b - a; return +(x - s).toFixed(3); };
fs.writeFileSync(outWords, JSON.stringify(w.map((o) => ({ ...o, start: shift(o.start), end: shift(o.end) })), null, 1));
console.log(`cuts ${cuts.length}, removed ${cuts.reduce((s, [a, b]) => s + b - a, 0).toFixed(2)} s`);
