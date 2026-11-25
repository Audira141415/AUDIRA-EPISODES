// Ep02 music bed: an original track synthesized here (no samples, no third-party licence).
// A minor, 100 BPM: Am – F – C – G. Hook (0–8 s) is the busiest part, the body leaves room
// for the voice, the outro is pad only under the end card.
// Writes ep02/video/assets/music/bed.wav (then encode to mp3 with ffmpeg).
// Usage: node scripts/ep02-music.mjs
import { readFileSync, writeFileSync } from "node:fs";

const timing = JSON.parse(readFileSync("ep02/timing.json", "utf8"));
const n8 = timing.lines.at(-1);
const DUR = n8.offset + n8.duration + 6.8 + 0.5;
const SR = 44100;
const N = Math.ceil(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const BPM = 100;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const HOOK_END = timing.lines[1].offset - 0.3; // first seam
const OUTRO = n8.offset + 3.4; // after "air dan listrik"
const END = n8.offset + n8.duration; // end card begins
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
// Chord roots and triads (MIDI) for Am F C G
const CHORDS = [
  { root: 45, notes: [57, 60, 64] },
  { root: 41, notes: [57, 60, 65] },
  { root: 48, notes: [55, 60, 64] },
  { root: 43, notes: [55, 59, 62] },
];
let seed = 1234567;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;

const add = (i, l, r) => {
  if (i >= 0 && i < N) (L[i] += l), (R[i] += r);
};
// Section gains: how much of each layer plays at time t
function mix(t) {
  const hook = t < HOOK_END;
  const outro = t >= OUTRO;
  return {
    kick: hook ? 1 : outro ? 0 : 0.55,
    fourFloor: hook,
    hat: hook ? 1 : outro ? 0 : 0.55,
    bass: outro ? (t >= END ? 0 : 0.6) : hook ? 1 : 0.75,
    pad: hook ? 0.8 : outro ? 1 : 0.65,
    arp: hook ? 1 : t > 41 && t < 66 ? 0.5 : 0,
  };
}

// Kick: pitch-dropping sine
function kick(t0, g) {
  const n = Math.floor(0.32 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const f = 45 + 95 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    const v = Math.sin(ph) * Math.exp(-t * 9) * g * 0.9;
    add(Math.floor(t0 * SR) + k, v, v);
  }
}
// Hat: short high-passed noise
function hat(t0, g, pan) {
  const n = Math.floor(0.06 * SR);
  let prev = 0;
  for (let k = 0; k < n; k++) {
    const x = rnd();
    const hp = x - prev;
    prev = x;
    const v = hp * Math.exp((-k / SR) * 70) * g * 0.08;
    add(Math.floor(t0 * SR) + k, v * (1 - pan), v * (1 + pan));
  }
}
// Bass: sine + a little 2nd harmonic, plucked envelope
function bass(t0, m, len, g) {
  const n = Math.floor(len * SR);
  const f = midi(m);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const env = Math.min(1, t * 200) * Math.exp(-t * 4);
    const v = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * g * 0.32;
    add(Math.floor(t0 * SR) + k, v, v);
  }
}
// Pad: detuned saws through a one-pole low-pass, slow attack/release
function pad(t0, notes, len, g) {
  const n = Math.floor((len + 0.6) * SR);
  const voices = notes.flatMap((m) => [midi(m) * 0.997, midi(m) * 1.003]);
  const ph = voices.map(() => 0);
  let lpL = 0, lpR = 0;
  const a = 0.06;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.5) * (t > len ? Math.exp(-(t - len) * 6) : 1);
    let l = 0, r = 0;
    voices.forEach((f, j) => {
      ph[j] = (ph[j] + f / SR) % 1;
      const s = 2 * ph[j] - 1;
      if (j % 2) r += s;
      else l += s;
    });
    lpL += a * (l - lpL);
    lpR += a * (r - lpR);
    add(Math.floor(t0 * SR) + k, lpL * env * g * 0.05, lpR * env * g * 0.05);
  }
}
// Arp: soft triangle pluck
function pluck(t0, m, g, pan) {
  const n = Math.floor(0.22 * SR);
  const f = midi(m);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const p = (f * t) % 1;
    const tri = 4 * Math.abs(p - 0.5) - 1;
    const v = tri * Math.min(1, t * 400) * Math.exp(-t * 14) * g * 0.07;
    add(Math.floor(t0 * SR) + k, v * (1 - pan), v * (1 + pan));
  }
}

const bars = Math.ceil(DUR / BAR);
for (let b = 0; b < bars; b++) {
  const t0 = b * BAR;
  const c = CHORDS[b % 4];
  const m0 = mix(t0);
  if (m0.pad > 0 && t0 < DUR - 0.5) pad(t0, c.notes, BAR, m0.pad);
  for (let s = 0; s < 16; s++) {
    const t = t0 + (s * BEAT) / 4;
    if (t >= DUR) break;
    const m = mix(t);
    const onBeat = s % 4 === 0;
    if (m.kick && onBeat && (m.fourFloor || s === 0 || s === 8)) kick(t, m.kick);
    if (m.hat && s % 2 === 0) hat(t + (s % 4 === 2 ? 0 : 0), s % 4 === 2 ? m.hat : m.hat * 0.5, s % 8 < 4 ? -0.3 : 0.3);
    if (m.bass && s % 2 === 0) bass(t, c.root + (s % 8 === 6 ? 12 : 0), (BEAT / 2) * 0.9, m.bass);
    if (m.arp) pluck(t, c.notes[s % 3] + 12, m.arp, s % 2 ? 0.35 : -0.35);
  }
}
// Opening hit on frame 0 so the hook starts on a downbeat
kick(0.0, 1.2);

// Fade the tail, normalize to -3 dBFS peak
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = t > DUR - 2.5 ? Math.max(0, (DUR - t) / 2.5) : 1;
  const fin = Math.min(1, t / 0.01);
  L[i] *= fade * fin;
  R[i] *= fade * fin;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.708 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
writeFileSync("ep02/video/assets/music/bed.wav", buf);
console.log(`bed.wav ${DUR.toFixed(2)}s, hook until ${HOOK_END.toFixed(2)}s, outro from ${OUTRO.toFixed(2)}s`);
