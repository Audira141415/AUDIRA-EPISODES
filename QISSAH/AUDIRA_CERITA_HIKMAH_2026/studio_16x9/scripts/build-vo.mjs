// Assemble the 3-voice dialogue into one VO track with authored gaps.
// In:  voiceover.json + public/audio/vo-meta.json (Cartesia clips + word timestamps)
// Out: public/audio/vo.wav (-16 LUFS), src/scenes/barber/timeline.json (clip + word starts in VO seconds)
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

import { readdirSync } from "node:fs";
// Usage: node scripts/build-vo.mjs ep02   (after scripts/tts-cartesia.mjs --request ../EP02_*/voiceover.json)
const ep = process.argv[2];
const dir = readdirSync("..").find((d) => d.toUpperCase().startsWith(ep.toUpperCase() + "_"));
const req = JSON.parse(readFileSync(`../${dir}/voiceover.json`, "utf8"));
const meta = JSON.parse(readFileSync(`public/audio/${ep}/vo-meta.json`, "utf8"));
const A = `public/audio/${ep}`;

const LEAD = req.lead ?? 0.8;
const GAP = Object.fromEntries(req.lines.map((l) => [l.id, l.gap ?? 0.6]));
const TAIL = req.tail ?? 8.0;

let t = LEAD;
const clips = [];
for (const line of req.lines) {
  const v = meta.voices[line.id];
  clips.push({
    id: line.id, who: line.who, text: line.text, start: +t.toFixed(3), end: +(t + v.duration_s).toFixed(3),
    words: v.words.map((w) => ({ w: w.text, s: +(t + w.start).toFixed(3), e: +(t + w.end).toFixed(3) })),
  });
  t += v.duration_s + (GAP[line.id] ?? 0.6);
}
const voEnd = clips.at(-1).end;
const total = +(voEnd + TAIL).toFixed(3);

// ffmpeg: delay every clip to its start, mix, pad to total, then loudness-normalise.
const inputs = clips.flatMap((c) => ["-i", `${A}/clips/${c.id}.wav`]);
const chains = clips.map((c, i) => `[${i}:a]adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`).join(";");
const mix = clips.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${clips.length}:normalize=0,apad=whole_dur=${total}[m]`;
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${chains};${mix}`, "-map", "[m]", "-ar", "48000", "-ac", "1", `${A}/vo-raw.wav`]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${A}/vo-raw.wav`, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", `${A}/vo.wav`]);

writeFileSync(`src/scenes/${ep}/timeline.json`, JSON.stringify({ lead: LEAD, voEnd, total, clips }, null, 1));
console.log(`clips ${clips.length}, VO ends ${voEnd.toFixed(2)} s, film ${total.toFixed(2)} s`);
for (const c of clips) console.log(c.id.padEnd(4), c.who.padEnd(9), c.start.toFixed(2), "-", c.end.toFixed(2));
