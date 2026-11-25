// Ep02 timing: word timestamps per narration line + where each line sits in the film.
// Draft mode (no voice yet): estimates word timings from syllables, calibrated on
// Galang's real timestamps from ep01 (voiceover_meta.json).
// Voice mode: `--meta ep02/voiceover_meta.json` uses Cartesia's real timestamps instead.
// Writes ep02/timing.json  { lines: [{ id, offset, duration, words: [{text,start,end}] }], total }
// Usage: node scripts/ep02-timing.mjs [--meta ep02/voiceover_meta.json]
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const metaPath = args.includes("--meta") ? args[args.indexOf("--meta") + 1] : null;

const FIRST_START = 0.2; // hook voice starts almost on frame 0
// Silence added between sentence clips (voice clips already carry half their natural pause)
const LINE_GAP = metaPath ? 0.4 : 0.5;
// Extra breath after lines whose scene ends on a card that needs reading time
const TAIL = { "n2-proyek": 0.3, "n3-air": 0.8, "n5-global": 0.4 };

// Spoken syllables for tokens a vowel count gets wrong
const SPOKEN = {
  "33.000": 7, "rp3,5": 8, "22": 5, "2026": 8, "2026,": 8, "120": 6, "6.000": 4, "240.000": 9,
  "29": 5, "1": 2, menperin: 4, mou: 3, bdx: 3, ai: 2, pdam: 4, dprd: 4, "amdal-nya": 4, telkomgroup: 4, pln: 3,
};
const syllables = (w) => {
  const k = w.toLowerCase().replace(/[.,?!]$/, "");
  if (SPOKEN[k] ?? SPOKEN[w.toLowerCase()]) return SPOKEN[k] ?? SPOKEN[w.toLowerCase()];
  return Math.max(1, (k.match(/[aiueo]+/g) || []).length);
};

// Calibrate seconds per syllable on ep01 (same voice, same model)
function calibrate() {
  const m = JSON.parse(readFileSync("voiceover_meta.json", "utf8"));
  let syl = 0, dur = 0;
  for (const v of Object.values(m.voices)) for (const w of v.words) { syl += syllables(w.text); dur += w.end - w.start; }
  return dur / syl;
}

const narration = JSON.parse(readFileSync("ep02/narration.json", "utf8"));
let lines;
if (metaPath) {
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  lines = narration.lines.map((l) => ({ id: l.id, duration: meta.voices[l.id].duration, words: meta.voices[l.id].words }));
} else {
  const sps = calibrate();
  lines = narration.lines.map((l) => {
    let t = 0.05;
    const words = l.text.split(/\s+/).map((text) => {
      const start = t;
      const end = start + syllables(text) * sps;
      t = end + (/[.?!]$/.test(text) ? 0.42 : /,$/.test(text) ? 0.22 : 0.04);
      return { text, start: +start.toFixed(3), end: +end.toFixed(3) };
    });
    return { id: l.id, duration: +(words.at(-1).end + 0.15).toFixed(3), words, estimated: true };
  });
  console.log(`calibrated ${sps.toFixed(3)} s/syllable`);
}

let t = FIRST_START;
for (const l of lines) {
  l.offset = +t.toFixed(3);
  t += l.duration + LINE_GAP + (TAIL[l.id] ?? 0);
}
const total = +(t - LINE_GAP).toFixed(3);
writeFileSync("ep02/timing.json", JSON.stringify({ mode: metaPath ? "voice" : "estimate", lines, total }, null, 2));
for (const l of lines) console.log(`${l.id.padEnd(12)} at ${l.offset.toFixed(2).padStart(6)}  dur ${l.duration.toFixed(2)}  ends ${(l.offset + l.duration).toFixed(2)}`);
console.log(`voice ends at ${total}s`);
