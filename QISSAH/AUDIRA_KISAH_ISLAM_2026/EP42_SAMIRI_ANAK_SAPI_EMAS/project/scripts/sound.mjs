#!/usr/bin/env node
// CHRONICLE sound department — an ORIGINAL score + SFX synthesised from scratch (no samples), shaped by the plan.
//   node scripts/sound.mjs out/<id>/plan.json public/stories/<id>/mix.wav [vo file]
//
// Music: string-like pads (additive, slow swells), low drone, a gamelan-flavoured metallophone (inharmonic bars,
// pelog-like scale), frame drums / low hits, gong. One "cue" per scene picked from its kind / set / mood, with
// cross-fades, punctuation on cuts, dates, names and counters. The bed ducks under the voice.
// SFX: per-set ambiences (wind, sea, fire crackle + roar, forest birds, room tone, volcanic rumble) and events
// (sound-ring booms, route ticks, counter ticks, whooshes on cuts).
// Mix: VO + music + SFX → loudness-normalised (−14 LUFS, −1.5 dBTP) 48 kHz stereo WAV.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const [planFile, outFile, voFile] = process.argv.slice(2);
if (!planFile || !outFile) { console.error("usage: node scripts/sound.mjs <plan.json> <out.wav> [vo]"); process.exit(2); }
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
const SR = 48000;
const DUR = plan.duration + 0.5;
const N = Math.ceil(DUR * SR);

// ---------------------------------------------------------------- buffers & helpers
const music = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const TAB = 8192;
const SIN = new Float32Array(TAB + 1);
for (let i = 0; i <= TAB; i++) SIN[i] = Math.sin((i / TAB) * Math.PI * 2);
const sinp = (ph) => { const x = (ph - Math.floor(ph)) * TAB; const i = x | 0; return SIN[i] + (SIN[i + 1] - SIN[i]) * (x - i); };
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smooth = (x) => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k); };

// biquad (RBJ) for noise shaping
const biquad = (type, f, q = 0.707) => {
  const w = (2 * Math.PI * f) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
  else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
  else { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; } // band-pass
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => { const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
};
const add = (buf, i, l, r) => { if (i >= 0 && i < N) { buf[0][i] += l; buf[1][i] += r; } };

// ---------------------------------------------------------------- instruments
/** Pad: additive "strings" chord over [t0, t1] with swells; detuned voices per side. */
const pad = (t0, t1, notes, gain, bright = 0.5, fadeIn = 1.2, fadeOut = 1.4) => {
  const i0 = Math.max(0, Math.floor(t0 * SR)), i1 = Math.min(N, Math.floor((t1 + fadeOut) * SR));
  const partials = 9;
  for (const m of notes) {
    for (const det of [-0.08, 0.07]) {
      const f = hz(m + det * 0.1) * (1 + det * 0.004);
      let ph = rnd();
      const side = det < 0 ? 0 : 1;
      for (let i = i0; i < i1; i++) {
        const t = i / SR;
        const env = smooth((t - t0) / fadeIn) * (t > t1 ? 1 - smooth((t - t1) / fadeOut) : 1) * (0.85 + 0.15 * Math.sin(t * 0.7 + m));
        const vib = 1 + 0.0025 * Math.sin(t * 5.1 + m);
        ph += (f * vib) / SR;
        let v = 0;
        for (let k = 1; k <= partials; k++) v += sinp(ph * k) * (1 / k) * Math.exp(-(k - 1) * (1.15 - bright));
        const s = v * env * gain * 0.06;
        if (side === 0) music[0][i] += s * 0.9, music[1][i] += s * 0.45;
        else music[1][i] += s * 0.9, music[0][i] += s * 0.45;
      }
    }
  }
};
/** Low drone with slow breathing. */
const drone = (t0, t1, m, gain) => {
  const i0 = Math.max(0, Math.floor(t0 * SR)), i1 = Math.min(N, Math.floor((t1 + 1.5) * SR));
  const f = hz(m);
  let p1 = 0, p2 = 0;
  for (let i = i0; i < i1; i++) {
    const t = i / SR;
    const env = smooth((t - t0) / 1.5) * (t > t1 ? 1 - smooth((t - t1) / 1.5) : 1) * (0.75 + 0.25 * Math.sin(t * 0.45));
    p1 += f / SR; p2 += (f * 2.003) / SR;
    const s = (sinp(p1) * 0.8 + sinp(p2) * 0.25 + sinp(p1 * 0.5) * 0.35) * env * gain * 0.12;
    music[0][i] += s; music[1][i] += s;
  }
};
/** Metallophone bar (saron / bonang-like): inharmonic partials, fast attack, ringing decay. */
const bar = (t, m, gain, pan = 0, decay = 1.6) => {
  const i0 = Math.floor(t * SR), len = Math.floor(decay * 3 * SR);
  const f = hz(m);
  const P = [[1, 1], [2.76, 0.42], [5.4, 0.2], [8.93, 0.09], [1.006, 0.5]];
  const ph = P.map(() => rnd());
  for (let j = 0; j < len; j++) {
    const tt = j / SR;
    let v = 0;
    for (let k = 0; k < P.length; k++) v += sinp(ph[k] + f * P[k][0] * tt) * P[k][1] * Math.exp(-tt * (k === 0 || k === 4 ? 1 / decay : 3 / decay * (k + 1)));
    const a = Math.min(1, tt / 0.003);
    const s = v * a * gain * 0.09;
    add(music, i0 + j, s * (1 - pan) * 0.8, s * (1 + pan) * 0.8);
  }
};
/** Gong: very low inharmonic hum with slow beating. */
const gong = (t, gain, m = 38) => {
  const i0 = Math.floor(t * SR), len = Math.floor(7 * SR);
  const f = hz(m);
  const P = [[1, 1], [1.5, 0.35], [2.0, 0.3], [2.98, 0.12], [1.012, 0.6]];
  for (let j = 0; j < len; j++) {
    const tt = j / SR;
    let v = 0;
    for (const [r, a] of P) v += sinp(f * r * tt) * a;
    const env = Math.min(1, tt / 0.02) * Math.exp(-tt / 2.2);
    const s = v * env * gain * 0.13;
    add(music, i0 + j, s, s);
  }
};
/** Frame drum / low tom hit: pitch drop + filtered noise skin. */
const drum = (t, gain, low = 52, pan = 0) => {
  const i0 = Math.floor(t * SR), len = Math.floor(0.9 * SR);
  const bp = biquad("bp", 180, 1.2);
  let ph = 0;
  for (let j = 0; j < len; j++) {
    const tt = j / SR;
    const f = low + 70 * Math.exp(-tt * 28);
    ph += f / SR;
    const body = sinp(ph) * Math.exp(-tt * 6.5);
    const skin = bp(rnd() * 2 - 1) * Math.exp(-tt * 30) * 0.6;
    const s = (body + skin) * gain * 0.32;
    add(music, i0 + j, s * (1 - pan * 0.5), s * (1 + pan * 0.5));
  }
};
/** Big low impact (cuts, booms). */
const impact = (t, gain, buf = music) => {
  const i0 = Math.floor(t * SR), len = Math.floor(3 * SR);
  const lp = biquad("lp", 220, 0.8);
  let ph = 0;
  for (let j = 0; j < len; j++) {
    const tt = j / SR;
    ph += (38 + 60 * Math.exp(-tt * 9)) / SR;
    const s = (sinp(ph) * Math.exp(-tt * 2.2) + lp(rnd() * 2 - 1) * Math.exp(-tt * 3.5) * 0.8) * gain * 0.42;
    add(buf, i0 + j, s, s);
  }
};
/** Noise whoosh / riser into time t. */
const whoosh = (t, gain, len = 0.9, buf = sfx) => {
  const i1 = Math.floor(t * SR), i0 = i1 - Math.floor(len * SR);
  const bpL = biquad("bp", 900, 0.9), bpR = biquad("bp", 1100, 0.9);
  for (let i = i0; i < i1 + Math.floor(0.25 * SR); i++) {
    const k = (i - i0) / (i1 - i0);
    const env = k < 1 ? Math.pow(k, 2.2) : Math.exp(-(i - i1) / SR * 14);
    add(buf, i, bpL(rnd() * 2 - 1) * env * gain * 0.5, bpR(rnd() * 2 - 1) * env * gain * 0.5);
  }
};

// ---------------------------------------------------------------- ambiences
const amb = (t0, t1, kind, gain = 1) => {
  const i0 = Math.max(0, Math.floor((t0 - 0.3) * SR)), i1 = Math.min(N, Math.floor((t1 + 0.4) * SR));
  const env = (i) => { const t = i / SR; return smooth((t - t0 + 0.3) / 0.6) * (1 - smooth((t - t1) / 0.4)); };
  const L1 = biquad("lp", 400), R1 = biquad("lp", 400), L2 = biquad("bp", 1800, 0.6), R2 = biquad("bp", 2100, 0.6);
  const H = biquad("hp", 3000), lowL = biquad("lp", 90), lowR = biquad("lp", 90);
  for (let i = i0; i < i1; i++) {
    const t = i / SR, e = env(i) * gain;
    const nl = rnd() * 2 - 1, nr = rnd() * 2 - 1;
    let l = 0, r = 0;
    if (kind === "wind" || kind === "sea" || kind === "forest" || kind === "makam") {
      const g = 0.5 + 0.5 * Math.sin(t * 0.37) * Math.sin(t * 0.21 + 1);
      l += L1(nl) * 0.5 * (0.4 + g); r += R1(nr) * 0.5 * (0.4 + g * 0.8);
    }
    if (kind === "sea") {
      const wave = Math.pow(0.5 + 0.5 * Math.sin(t * 0.9), 3);
      l += L2(nl) * 0.22 * wave; r += R2(nr) * 0.22 * (0.5 + 0.5 * Math.sin(t * 0.9 + 0.8)) ** 3;
    }
    if (kind === "fire") {
      l += L1(nl) * 0.6 * (0.7 + 0.3 * Math.sin(t * 3.1)); r += R1(nr) * 0.6 * (0.7 + 0.3 * Math.sin(t * 2.7));
      if (rnd() < 0.0009) { const c = (rnd() * 2 - 1) * 0.9; l += c; r += c * 0.6; }
      l += H(nl) * 0.05;
    }
    if (kind === "rumble" || kind === "fire") { const rr = lowL(nl) * 2.2, rl = lowR(nr) * 2.2; l += rr; r += rl; }
    if (kind === "room") { l += L1(nl) * 0.12; r += R1(nr) * 0.12; }
    add(sfx, i, l * e * 0.5, r * e * 0.5);
  }
  if (kind === "forest" || kind === "makam") {
    // birds: short frequency-swept chirps
    for (let t = t0 + 0.5; t < t1; t += 0.7 + rnd() * 1.8) {
      const f0 = 2600 + rnd() * 1800, i = Math.floor(t * SR), len = Math.floor((0.06 + rnd() * 0.08) * SR), pan = rnd() * 2 - 1;
      const n = 1 + Math.floor(rnd() * 3);
      for (let c = 0; c < n; c++) {
        let ph = 0;
        for (let j = 0; j < len; j++) {
          const k = j / len; ph += (f0 * (1 + 0.35 * Math.sin(k * Math.PI)) + c * 120) / SR;
          const s = sinp(ph) * Math.sin(k * Math.PI) * 0.03 * Math.min(gain, 1.6);
          add(sfx, i + j + c * Math.floor(0.11 * SR), s * (1 - pan) * 0.7, s * (1 + pan) * 0.7);
        }
      }
    }
  }
};

// ---------------------------------------------------------------- the score
const ROOT = 50; // D3
const PELOG = [0, 1, 3, 7, 8]; // D Eb F A Bb — a pelog-like five-note colour
const scale = (deg, oct = 0) => ROOT + 12 + PELOG[((deg % 5) + 5) % 5] + 12 * (Math.floor(deg / 5) + oct);
const PROG = {
  reflective: [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [43, 50, 55, 58, 62], [45, 52, 57, 61, 64]],
  tense: [[50, 51, 57, 62], [49, 50, 56, 62], [50, 51, 57, 63], [46, 50, 57, 62]],
  curious: [[50, 57, 62, 64, 69], [48, 55, 60, 64, 67], [46, 53, 58, 62, 65], [45, 52, 57, 60, 64]],
  determined: [[50, 57, 62, 65], [48, 55, 60, 63], [46, 53, 58, 62], [48, 55, 60, 64]],
  somber: [[50, 57, 60, 65], [46, 53, 58, 61], [43, 50, 55, 58], [45, 52, 57, 60]],
};
const cueOf = (sc) => {
  if (sc.kind === "end") return { prog: "reflective", pad: 0.9, drone: 0.6, drums: 0, metal: 0.35, bright: 0.45 };
  if (sc.kind === "map") return sc.map?.route ? { prog: "determined", pad: 0.7, drone: 0.7, drums: 0.5, bpm: 92, metal: 0.6, bright: 0.5 }
    : sc.map?.rings || sc.map?.erupt ? { prog: "tense", pad: 0.8, drone: 1.0, drums: 0.35, bpm: 70, metal: 0.25, bright: 0.4 }
    : { prog: "curious", pad: 0.75, drone: 0.6, drums: 0, metal: 0.55, bright: 0.55 };
  const p = sc.place;
  if (p.fire || p.volcano || p.mood === "api") return { prog: "tense", pad: 0.9, drone: 1.1, drums: 0.9, bpm: 104, metal: 0.3, bright: 0.55 };
  if (p.set === "kamar" || p.set === "makam") return { prog: p.set === "kamar" ? "somber" : "reflective", pad: 0.85, drone: 0.5, drums: 0, metal: 0.4, bright: 0.35 };
  if (p.set === "balai") return { prog: "tense", pad: 0.7, drone: 0.8, drums: 0.25, bpm: 64, metal: 0.25, bright: 0.35 };
  if (p.set === "hutan" || p.set === "medan") return { prog: "determined", pad: 0.85, drone: 0.8, drums: 0.6, bpm: 84, metal: 0.4, bright: 0.45 };
  return { prog: "curious", pad: 0.8, drone: 0.6, drums: 0.2, bpm: 80, metal: 0.45, bright: 0.5 };
};
const ambOf = (sc) => {
  if (sc.kind !== "place") return sc.kind === "map" && (sc.map?.rings || sc.map?.erupt) ? ["rumble", 0.9] : ["wind", 0.8];
  const p = sc.place;
  if (p.fire) return ["fire", 1.0];
  if (p.volcano) return ["rumble", 1.0];
  if (p.set === "balai" || p.set === "kamar") return ["room", 2.2];
  if (p.set === "pelabuhan" || p.set === "dek" || p.set === "pantai") return ["sea", 2.4];
  if (p.set === "hutan") return ["forest", 2.4];
  if (p.set === "makam") return ["makam", 2.2];
  return ["wind", 2.2];
};

plan.scenes.forEach((sc, si) => {
  const a = sc.a, b = sc.b, d = b - a;
  const cue = cueOf(sc);
  const prog = PROG[cue.prog];
  const barLen = Math.max(2.4, Math.min(4.2, d / 2));
  // pads: one chord per bar, overlapping tails
  for (let k = 0, t = a; t < b; k++, t += barLen) pad(Math.max(0, t - 0.3), Math.min(b, t + barLen), prog[(k + si) % prog.length], cue.pad, cue.bright, k === 0 ? 0.9 : 1.6, 1.6);
  if (cue.drone) drone(Math.max(0, a - 0.2), b, prog[si % prog.length][0] - 12, cue.drone);
  // drums: a low pulse (frame drum on beats 1 and 3½, soft taps between)
  if (cue.drums) {
    const beat = 60 / cue.bpm;
    let k = 0;
    for (let t = a + 0.05; t < b - 0.1; t += beat / 2, k++) {
      const pos = k % 8;
      if (pos === 0) drum(t, cue.drums, 48);
      else if (pos === 5) drum(t, cue.drums * 0.7, 54, 0.3);
      else if (pos === 3 || pos === 7) drum(t, cue.drums * 0.25, 70, -0.4);
    }
  }
  // metallophone: a sparse pelog motif, denser when the cue is lively
  if (cue.metal) {
    const step = cue.drums ? 60 / (cue.bpm || 80) : 0.75;
    const motif = [0, 2, 3, 1, 4, 3, 2, 0, 1, 3];
    let k = 0;
    for (let t = a + 0.4; t < b - 0.3; t += step, k++) {
      if (rnd() > cue.metal + 0.15) continue;
      const deg = motif[(k + si * 3) % motif.length];
      bar(t, scale(deg, deg > 3 ? 0 : 0), cue.metal * (k % 4 === 0 ? 1 : 0.6), (rnd() - 0.5) * 0.8, cue.drums ? 1.0 : 1.9);
    }
  }
  // ambience + transitions
  const [kind, g] = ambOf(sc);
  amb(a, b, kind, g);
  if (si > 0) whoosh(a, 0.5, 0.7);
  // map events
  if (sc.kind === "map") {
    if (sc.map.rings) [0.6, 1.05, 1.5].forEach((t0, i) => impact(a + t0, 0.9 - i * 0.2, sfx));
    if (sc.map.erupt) impact(a + 0.2, 0.8, sfx);
    if (sc.map.route) {
      const n = Math.max(1, sc.map.points.length - 1);
      for (let i = 1; i <= n; i++) bar(a + 0.15 * d + (0.7 * d * i) / n, scale(4, 1), 0.5, 0.2, 0.8);
    }
  }
});

// punctuation on overlays
for (const sc of plan.scenes) for (const o of sc.overlays) {
  if (o.kind === "date") { drum(o.a + 0.05, 0.8, 44); gong(o.a + 0.05, 0.5); }
  if (o.kind === "name") bar(o.a + 0.1, scale(0, 1), 0.6, 0, 1.4);
  if (o.kind === "count") {
    for (let t = o.roll[0]; t < o.roll[1]; t += 0.07) bar(t, scale(4, 2), 0.12 * (1 - (t - o.roll[0]) / (o.roll[1] - o.roll[0])), (rnd() - 0.5), 0.15);
    impact(o.roll[1], 0.6);
  }
  if (o.kind === "end") gong(o.a, 0.9, 38);
}
gong(0.05, 0.6, 38);

// ---------------------------------------------------------------- voice + ducking + mix
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "chron-snd-"));
let vo = [new Float32Array(N), new Float32Array(N)];
if (voFile) {
  const raw = path.join(tmp, "vo.f32");
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", voFile, "-f", "f32le", "-ac", "2", "-ar", String(SR), raw]);
  const b = fs.readFileSync(raw);
  const f = new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
  for (let i = 0; i < Math.min(N, f.length / 2); i++) { vo[0][i] = f[i * 2]; vo[1][i] = f[i * 2 + 1]; }
}
// voice envelope → duck the music 9 dB under speech (fast attack, slow release)
const envV = new Float32Array(N);
{
  let e = 0;
  const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.45 * SR));
  for (let i = 0; i < N; i++) { const x = Math.abs(vo[0][i]) + Math.abs(vo[1][i]); e = x > e ? att * e + (1 - att) * x : rel * e + (1 - rel) * x; envV[i] = e; }
  let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, envV[i]);
  for (let i = 0; i < N; i++) envV[i] = clamp(envV[i] / (mx * 0.25 + 1e-9), 0, 1);
}
// EP42 (kisah nabi): no score, SFX + VO only (adab QISSAH)
const MUSIC = 0, SFX = 0.22; // G18c: un-ducked SFX stem >= 12 LU under the VO
const out = Buffer.alloc(N * 2 * 4);
for (let i = 0; i < N; i++) {
  const duck = 1 - 0.65 * envV[i];
  const t = i / SR;
  const tail = t > DUR - 0.6 ? 1 - smooth((t - (DUR - 0.6)) / 0.6) : 1;
  for (let c = 0; c < 2; c++) {
    const v = (vo[c][i] + music[c][i] * MUSIC * duck + sfx[c][i] * SFX * (0.6 + 0.4 * duck)) * tail;
    out.writeFloatLE(v, (i * 2 + c) * 4);
  }
}
const rawOut = path.join(tmp, "mix.f32");
fs.writeFileSync(rawOut, out);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "f32le", "-ar", String(SR), "-ac", "2", "-i", rawOut, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", String(SR), "-c:a", "pcm_s16le", outFile]);
// stems for checking
const stem = (bufs, name, g) => {
  const o = Buffer.alloc(N * 2 * 4);
  for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) o.writeFloatLE(bufs[c][i] * g, (i * 2 + c) * 4);
  const f = path.join(tmp, name + ".f32");
  fs.writeFileSync(f, o);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "f32le", "-ar", String(SR), "-ac", "2", "-i", f, "-c:a", "pcm_s16le", path.join(path.dirname(planFile), name + ".wav")]);
};
stem(music, "music_stem", MUSIC);
stem(sfx, "sfx_stem", SFX);
fs.rmSync(tmp, { recursive: true, force: true });
console.log("mix →", outFile);
