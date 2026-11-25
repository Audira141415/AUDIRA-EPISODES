// Cuts the one-take narration (ep02/voice-src/full.wav) into one clip per sentence line.
// Each cut sits at the quietest 10 ms of the pause between a line's last word and the next
// line's first word (from Cartesia word timestamps), with a 10 ms fade either side, so no
// breath or word tail is clipped and no two clips can overlap.
// Writes ep02/video/assets/voice/<id>.wav and ep02/voiceover_meta.json (words relative to each clip).
// Usage: node scripts/ep02-split-voice.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const narration = JSON.parse(readFileSync("ep02/narration.json", "utf8"));
const full = JSON.parse(readFileSync("ep02/voiceover_full_meta.json", "utf8")).voices.full;
const wavBuf = readFileSync("ep02/voice-src/full.wav");
const SR = wavBuf.readUInt32LE(24);
const pcm = new Int16Array(wavBuf.buffer, wavBuf.byteOffset + 44, (wavBuf.length - 44) / 2);
const FADE = Math.round(0.01 * SR);
const FRAME = Math.round(0.01 * SR);
const SILENCE = 150; // 10 ms RMS below this (about -47 dBFS) counts as silence

// Map Cartesia words onto narration lines by token count, and check the text matches
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
let k = 0;
const spans = narration.lines.map((l) => {
  const n = l.text.split(/\s+/).length;
  const words = full.words.slice(k, k + n);
  k += n;
  const want = norm(l.text);
  const got = norm(words.map((w) => w.text).join(""));
  if (want !== got) throw new Error(`word mismatch in ${l.id}:\n want ${want}\n got  ${got}`);
  return { id: l.id, text: l.text, words };
});
if (k !== full.words.length) throw new Error(`token count ${k} != ${full.words.length}`);

// Quietest 10 ms frame inside [a, b] seconds → cut sample
function quietest(a, b) {
  let best = Math.round(((a + b) / 2) * SR);
  let bestE = Infinity;
  for (let s = Math.round(a * SR); s + FRAME <= Math.round(b * SR); s += FRAME / 2) {
    let e = 0;
    for (let i = s; i < s + FRAME; i++) e += pcm[i] * pcm[i];
    if (e < bestE) (bestE = e), (best = s + FRAME / 2);
  }
  // Grow the silent run around the quietest frame and cut in its middle
  const rmsAt = (x) => {
    let e = 0;
    for (let i = x; i < x + FRAME; i++) e += pcm[i] * pcm[i];
    return Math.sqrt(e / FRAME);
  };
  let lo = Math.round(best), hi = Math.round(best);
  while (lo > FRAME && rmsAt(lo - FRAME) < SILENCE) lo -= FRAME;
  while (hi + 2 * FRAME < pcm.length && rmsAt(hi) < SILENCE) hi += FRAME;
  return { at: Math.round((lo + hi) / 2), rms: Math.sqrt(bestE / FRAME), run: (hi - lo) / SR };
}

const cuts = [0];
for (let i = 0; i < spans.length - 1; i++) {
  const a = spans[i].words.at(-1).end;
  const b = spans[i + 1].words[0].start;
  const q = quietest(a, b);
  cuts.push(q.at);
  console.log(`cut ${spans[i].id} | ${spans[i + 1].id}: pause ${(b - a).toFixed(3)}s, cut at ${(q.at / SR).toFixed(3)}s, silence ${q.run.toFixed(2)}s`);
}
// Last clip ends 0.35 s after its last word (or at the file end)
cuts.push(Math.min(pcm.length, Math.round((spans.at(-1).words.at(-1).end + 0.35) * SR)));

const header = (bytes) => {
  const h = Buffer.from(wavBuf.subarray(0, 44));
  h.writeUInt32LE(36 + bytes, 4);
  h.writeUInt32LE(bytes, 40);
  return h;
};
mkdirSync("ep02/video/assets/voice", { recursive: true });
const meta = { model: "sonic-3", voice: narration.voice, source: "ep02/voice-src/full.wav", voices: {} };
spans.forEach((s, i) => {
  const a = cuts[i], b = cuts[i + 1];
  const clip = Int16Array.from(pcm.subarray(a, b));
  for (let j = 0; j < FADE && j < clip.length; j++) {
    const g = j / FADE;
    clip[j] = Math.round(clip[j] * g);
    clip[clip.length - 1 - j] = Math.round(clip[clip.length - 1 - j] * g);
  }
  const bytes = Buffer.from(clip.buffer);
  const path = `ep02/video/assets/voice/${s.id}.wav`;
  writeFileSync(path, Buffer.concat([header(bytes.length), bytes]));
  const t0 = a / SR;
  meta.voices[s.id] = {
    path,
    text: s.text,
    duration: +(clip.length / SR).toFixed(3),
    source_in: +t0.toFixed(3),
    words: s.words.map((w) => ({ text: w.text, start: +(w.start - t0).toFixed(3), end: +(w.end - t0).toFixed(3) })),
  };
  console.log(`${s.id}: ${t0.toFixed(2)}–${(b / SR).toFixed(2)}s (${(clip.length / SR).toFixed(2)}s)`);
});
writeFileSync("ep02/voiceover_meta.json", JSON.stringify(meta, null, 2));
