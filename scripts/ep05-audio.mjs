// EP05 "Beyond Tomorrow": original score and scene SFX, synthesized here (no samples, no licences).
// Score in D minor: atmospheric pad per scene, blue arps (agents), mechanical pulse (robots),
// glass bells (bio), crystalline clusters then a driving pulse (quantum/autonomy), a crescendo
// into orbit and a D-major resolution under the closing card. The bed ducks under every word.
// Usage (repo root): node scripts/ep05-audio.mjs ai-future-ep05
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const EP = process.argv[2] ?? "ai-future-ep05";
const SR = 44100;
const meta = JSON.parse(readFileSync(join(EP, "video/assets/audio/vo-meta.json"), "utf8"));
const cfg = JSON.parse(readFileSync(join(EP, "voice-lock.json"), "utf8"));
const OFF = cfg.off ?? 0.15;
const TAIL = cfg.tail ?? 0.45;
const HOLD = cfg.hold ?? 1.8;
const ids = Object.keys(meta.voices);
const SC = [];
let t0 = 0;
ids.forEach((id, i) => {
  const dur = +(OFF + meta.voices[id].duration_s + TAIL + (i === ids.length - 1 ? HOLD : 0)).toFixed(2);
  SC.push({ id, start: +t0.toFixed(2), dur });
  t0 += dur;
});
const TOTAL = +t0.toFixed(2);
const words = ids.flatMap((id, i) => meta.voices[id].words.map((w) => ({ s: SC[i].start + OFF + w.start, e: SC[i].start + OFF + w.end })));

let seed = 20261031;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const TAU = Math.PI * 2;

function buf(sec) {
  const n = Math.ceil(sec * SR);
  return { L: new Float32Array(n), R: new Float32Array(n), n };
}
function add(b, i, l, r = l) {
  if (i >= 0 && i < b.n) {
    b.L[i] += l;
    b.R[i] += r;
  }
}
function writeWav(path, b, gain = 1) {
  const pcm = Buffer.alloc(b.n * 4);
  for (let i = 0; i < b.n; i++) {
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.L[i] * gain)) * 32767), i * 4);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.R[i] * gain)) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  writeFileSync(path, Buffer.concat([h, pcm]));
}
function peakNorm(b, target = 0.9) {
  let p = 0;
  for (let i = 0; i < b.n; i++) p = Math.max(p, Math.abs(b.L[i]), Math.abs(b.R[i]));
  const k = p > 0 ? target / p : 1;
  for (let i = 0; i < b.n; i++) (b.L[i] *= k), (b.R[i] *= k);
  return b;
}
// One-pole lowpass state helper
function lp(cut) {
  let y = 0;
  return (x, c = cut) => {
    const a = 1 - Math.exp((-TAU * c) / SR);
    y += a * (x - y);
    return y;
  };
}
// Schroeder reverb: 4 combs + 2 allpasses per side
function reverb(b, mix = 0.3, size = 1) {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round(d * size));
  const aps = [225, 556];
  for (const [ch, spread] of [[b.L, 0], [b.R, 23]]) {
    const out = new Float32Array(b.n);
    for (const d0 of combs) {
      const d = d0 + spread;
      const line = new Float32Array(d);
      let k = 0;
      let f = 0;
      for (let i = 0; i < b.n; i++) {
        const y = line[k];
        f = y * 0.7 + f * 0.3;
        line[k] = ch[i] + f * 0.84;
        out[i] += y * 0.25;
        k = (k + 1) % d;
      }
    }
    for (const d0 of aps) {
      const d = d0 + spread;
      const line = new Float32Array(d);
      let k = 0;
      for (let i = 0; i < b.n; i++) {
        const x = out[i];
        const y = line[k] - 0.5 * x;
        line[k] = x + 0.5 * y;
        out[i] = y;
        k = (k + 1) % d;
      }
    }
    for (let i = 0; i < b.n; i++) ch[i] = ch[i] * (1 - mix) + out[i] * mix;
  }
  return b;
}

// ---------------- SFX ----------------
const SFX = {};
function sfx(name, sec, fn, verb = 0.25) {
  const b = buf(sec);
  fn(b, sec);
  if (verb) reverb(b, verb, 0.8);
  peakNorm(b, 0.85);
  // fade the tail so nothing clicks at the clip end
  const f = Math.floor(0.03 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    b.L[b.n - 1 - i] *= k;
    b.R[b.n - 1 - i] *= k;
  }
  SFX[name] = { b, sec };
}
sfx("whoosh", 0.7, (b, sec) => {
  const f = lp(400);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const u = t / sec;
    const env = Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 2;
    const c = 300 + 5200 * Math.sin(Math.PI * u);
    const x = f(rnd(), c) - f(0, c) * 0;
    const pan = -0.8 + 1.6 * u;
    add(b, i, x * env * (1 - pan) * 0.6, x * env * (1 + pan) * 0.6);
  }
}, 0.15);
sfx("boom", 2.2, (b) => {
  let ph = 0;
  const f = lp(900);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    ph += (TAU * (32 + 60 * Math.exp(-t * 7))) / SR;
    const v = Math.sin(ph) * Math.exp(-t * 2.2) + f(rnd()) * Math.exp(-t * 18) * 0.6;
    add(b, i, v);
  }
}, 0.35);
sfx("shimmer", 1.6, (b, sec) => {
  const notes = [86, 89, 93, 96, 98];
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.4) * Math.exp(-t * 1.6);
    let v = 0;
    notes.forEach((m, k) => (v += Math.sin(TAU * midi(m) * t + k) * (0.5 + 0.5 * Math.sin(TAU * (6 + k) * t))));
    add(b, i, v * env * 0.2, v * env * 0.2 * (0.8 + 0.2 * Math.sin(t * 9)));
  }
}, 0.4);
sfx("data", 0.9, (b) => {
  const steps = 14;
  for (let s = 0; s < steps; s++) {
    const f0 = 900 + Math.abs(rnd()) * 2400;
    const at = s * 0.055;
    for (let k = 0; k < 0.04 * SR; k++) {
      const t = k / SR;
      const v = Math.sign(Math.sin(TAU * f0 * t)) * Math.exp(-t * 60) * 0.35;
      add(b, Math.floor(at * SR) + k, v * (s % 2 ? 0.7 : 1), v * (s % 2 ? 1 : 0.7));
    }
  }
}, 0.2);
sfx("servo", 0.8, (b, sec) => {
  let ph = 0;
  const f = lp(1800);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const u = t / sec;
    const fr = 160 + 220 * Math.sin(Math.PI * u * 0.9) + Math.sin(TAU * 34 * t) * 6;
    ph += fr / SR;
    const saw = 2 * (ph % 1) - 1;
    const whine = Math.sin(TAU * fr * 4.02 * t) * 0.25;
    const env = Math.sin(Math.PI * u) ** 0.6;
    add(b, i, (f(saw) + whine) * env * 0.5);
  }
}, 0.12);
sfx("scan", 1.6, (b, sec) => {
  let ph = 0;
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const u = t / sec;
    ph += (700 + 2200 * u) / SR;
    const gate = 0.5 + 0.5 * Math.sign(Math.sin(TAU * 14 * t));
    const env = Math.min(1, t / 0.05) * (1 - u);
    const v = Math.sin(TAU * ph) * gate * env * 0.4;
    add(b, i, v * (1 - u), v * u + v * 0.3);
  }
}, 0.3);
sfx("clank", 1.2, (b) => {
  const parts = [[220, 1], [583, 0.6], [1077, 0.45], [1630, 0.3], [2410, 0.2]];
  const f = lp(3000);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    let v = 0;
    parts.forEach(([fr, a], k) => (v += Math.sin(TAU * fr * t) * a * Math.exp(-t * (5 + k * 3))));
    v += f(rnd()) * Math.exp(-t * 40) * 1.2;
    add(b, i, v * 0.4);
  }
}, 0.3);
sfx("bubble", 1.1, (b) => {
  for (let s = 0; s < 7; s++) {
    const at = s * 0.13 + Math.abs(rnd()) * 0.05;
    const f0 = 380 + Math.abs(rnd()) * 600;
    let ph = 0;
    for (let k = 0; k < 0.12 * SR; k++) {
      const t = k / SR;
      ph += (f0 * (1 + t * 9)) / SR;
      const v = Math.sin(TAU * ph) * Math.sin((Math.PI * t) / 0.12) * 0.4;
      add(b, Math.floor(at * SR) + k, v * (s % 2 ? 0.6 : 1), v * (s % 2 ? 1 : 0.6));
    }
  }
}, 0.35);
sfx("blip", 0.35, (b) => {
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    add(b, i, (Math.sin(TAU * 1320 * t) + 0.4 * Math.sin(TAU * 1980 * t)) * Math.exp(-t * 18) * 0.5);
  }
}, 0.25);
sfx("qubit", 2.0, (b) => {
  [74, 81, 86, 93].forEach((m, k) => {
    const fr = midi(m);
    for (let i = 0; i < b.n; i++) {
      const t = i / SR - k * 0.09;
      if (t < 0) continue;
      const mod = Math.sin(TAU * fr * 3.5 * t) * 2.2 * Math.exp(-t * 3);
      const v = Math.sin(TAU * fr * t + mod) * Math.exp(-t * 2.2) * 0.3;
      add(b, i, v * (k % 2 ? 0.6 : 1), v * (k % 2 ? 1 : 0.6));
    }
  });
}, 0.45);
sfx("passby", 1.6, (b, sec) => {
  const f = lp(500);
  let ph = 0;
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const u = t / sec;
    const env = Math.exp(-((u - 0.45) ** 2) / 0.03);
    ph += (110 * (u < 0.45 ? 1.08 : 0.92)) / SR;
    const v = f(rnd(), 700 + 1500 * env) * 1.4 + Math.sin(TAU * ph) * 0.3;
    const pan = -1 + 2 * u;
    add(b, i, v * env * (1 - pan) * 0.5, v * env * (1 + pan) * 0.5);
  }
}, 0.15);
sfx("riser", 3.2, (b, sec) => {
  let ph = 0;
  const f = lp(500);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const u = t / sec;
    ph += (110 + 660 * u * u) / SR;
    const saw = 2 * (ph % 1) - 1;
    const v = f(saw * 0.5 + rnd() * 0.5, 300 + 6000 * u * u) * u ** 1.6;
    add(b, i, v, v);
  }
}, 0.35);
sfx("chime", 3.4, (b) => {
  [62, 66, 69, 74, 78].forEach((m, k) => {
    const fr = midi(m);
    for (let i = 0; i < b.n; i++) {
      const t = i / SR - k * 0.06;
      if (t < 0) continue;
      const v = (Math.sin(TAU * fr * t) + 0.3 * Math.sin(TAU * fr * 2.76 * t) * Math.exp(-t * 4)) * Math.exp(-t * 1.2) * 0.25;
      add(b, i, v * (k % 2 ? 0.7 : 1), v * (k % 2 ? 1 : 0.7));
    }
  });
}, 0.5);
// Scene ambiences: warehouse machinery and a lab room tone
sfx("amb-warehouse", SC[2].dur, (b, sec) => {
  const f = lp(250);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.6) * Math.min(1, (sec - t) / 0.6);
    const hum = Math.sin(TAU * 60 * t) * 0.3 + Math.sin(TAU * 120 * t) * 0.12;
    const clatter = Math.max(0, Math.sin(TAU * 1.7 * t)) ** 40 * f(rnd(), 2500) * 2;
    add(b, i, (hum + f(rnd()) * 0.8 + clatter) * env * 0.5);
  }
}, 0.4);
sfx("amb-lab", SC[3].dur, (b, sec) => {
  const f = lp(180);
  for (let i = 0; i < b.n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.6) * Math.min(1, (sec - t) / 0.6);
    const beep = (t % 1.6) < 0.08 ? Math.sin(TAU * 1760 * t) * 0.12 : 0;
    add(b, i, (Math.sin(TAU * 50 * t) * 0.15 + f(rnd()) * 0.7 + beep) * env * 0.5);
  }
}, 0.5);

const sfxDir = join(EP, "video/assets/sfx");
mkdirSync(sfxDir, { recursive: true });
const sfxMeta = {};
for (const [name, { b, sec }] of Object.entries(SFX)) {
  writeWav(join(sfxDir, `${name}.wav`), b);
  sfxMeta[name] = +sec.toFixed(2);
}

// ---------------- SCORE ----------------
const S = buf(TOTAL + 0.5);
const at = (id) => SC.find((s) => s.id === id);
const s2 = at("s2-agents").start;
const s3 = at("s3-robot").start;
const s4 = at("s4-bio").start;
const s5 = at("s5-quantum").start;
const s6 = at("s6-human").start;
const orbit = s6 + 14.0;
const close = s6 + 20.9;

// Chord map: [time, root midi, intervals]
const CH = [
  [0, 50, [0, 3, 7, 14]], // Dm(add9)
  [s1Mid(), 46, [0, 4, 7, 14]], // Bb
  [s2, 50, [0, 3, 7, 10]], // Dm7
  [s3, 43, [0, 3, 7, 10]], // Gm7
  [s4, 46, [0, 4, 7, 11]], // Bbmaj7
  [s5, 50, [0, 3, 7, 14]], // Dm9
  [s5 + 9, 48, [0, 4, 7, 14]], // C(add9)
  [s6, 46, [0, 4, 7, 14]], // Bb
  [s6 + 6.6, 41, [0, 4, 7, 12]], // F
  [s6 + 10.6, 43, [0, 3, 7, 10]], // Gm7
  [orbit, 45, [0, 4, 7, 10]], // A7 (lift)
  [close - 0.5, 50, [0, 4, 7, 11, 14]], // Dmaj9 resolution
];
function s1Mid() {
  return 7.4;
}
const chordAt = (t) => {
  let c = CH[0];
  for (const k of CH) if (t >= k[0]) c = k;
  return c;
};

// Pad: 3 detuned saws per voice through a moving lowpass; intensity curve shapes the film
const intensity = (t) => {
  if (t < s2) return 0.55 + 0.25 * Math.min(1, t / 6);
  if (t < s6) return 0.7;
  if (t < orbit) return 0.7 + 0.3 * ((t - s6) / (orbit - s6));
  if (t < close) return 1.0;
  return Math.max(0, 1 - (t - close) / 3.9) * 0.9 + 0.1;
};
const padF = [lp(800), lp(800)];
const phases = new Float64Array(5 * 3);
for (let i = 0; i < S.n; i++) {
  const t = i / SR;
  const [, root, iv] = chordAt(t);
  let l = 0;
  let r = 0;
  iv.forEach((x, v) => {
    for (let d = 0; d < 3; d++) {
      const k = v * 3 + d;
      phases[k] += (midi(root + x + 12) * (1 + (d - 1) * 0.004)) / SR;
      const saw = 2 * (phases[k] % 1) - 1;
      if (d === 0) l += saw;
      else if (d === 1) r += saw;
      else (l += saw * 0.5), (r += saw * 0.5);
    }
  });
  const I = intensity(t);
  const cut = 350 + 2200 * I * I + 300 * Math.sin(t * 0.21);
  add(S, i, padF[0](l, cut) * 0.05 * I, padF[1](r, cut) * 0.05 * I);
  // Sub drone on the chord root
  const sub = Math.sin(TAU * midi(root - 12) * t) * 0.11 * (0.6 + 0.4 * I);
  add(S, i, sub, sub);
}
// Blue arps for the agents scene: 16ths at 120 BPM, D minor pentatonic
{
  const pent = [62, 65, 67, 69, 72, 74, 77, 79];
  const step = 0.125;
  for (let t = s2 + 0.2; t < s3 - 0.3; t += step) {
    const n = pent[Math.floor(Math.abs(rnd()) * pent.length)];
    const fr = midi(n);
    const pan = rnd() * 0.7;
    for (let k = 0; k < 0.18 * SR; k++) {
      const u = k / SR;
      const v = Math.sin(TAU * fr * u) * Math.exp(-u * 22) * 0.07;
      add(S, Math.floor(t * SR) + k, v * (1 - pan), v * (1 + pan));
    }
  }
}
// Mechanical pulse for the robots: filtered ticks on 8ths, low thump on beats
{
  const f = lp(5000);
  for (let b = 0, t = s3; t < s4 - 0.3; b++, t += 0.25) {
    for (let k = 0; k < 0.05 * SR; k++) {
      const u = k / SR;
      const v = f(rnd()) * Math.exp(-u * 70) * (b % 2 ? 0.08 : 0.13);
      add(S, Math.floor(t * SR) + k, v, v);
    }
    if (b % 2 === 0) {
      let ph = 0;
      for (let k = 0; k < 0.25 * SR; k++) {
        const u = k / SR;
        ph += (48 + 70 * Math.exp(-u * 30)) / SR;
        const v = Math.sin(TAU * ph) * Math.exp(-u * 12) * 0.22;
        add(S, Math.floor(t * SR) + k, v, v);
      }
    }
  }
}
// Glass bells for biotech
{
  const notes = [74, 77, 81, 82, 86, 89];
  for (let t = s4 + 0.4; t < s5 - 0.4; t += 0.75) {
    const fr = midi(notes[Math.floor(Math.abs(rnd()) * notes.length)]);
    const pan = rnd() * 0.8;
    for (let k = 0; k < 1.4 * SR; k++) {
      const u = k / SR;
      const v = Math.sin(TAU * fr * u + Math.sin(TAU * fr * 2 * u) * 1.5 * Math.exp(-u * 4)) * Math.exp(-u * 2.6) * 0.06;
      add(S, Math.floor(t * SR) + k, v * (1 - pan), v * (1 + pan));
    }
  }
}
// Quantum: crystalline clusters; autonomy: driving 8th-note bass pulse
{
  for (let t = s5 + 0.2; t < s5 + 8.9; t += 0.5) {
    const fr = midi(86 + [0, 3, 7, 10, 14][Math.floor(Math.abs(rnd()) * 5)]);
    for (let k = 0; k < 0.6 * SR; k++) {
      const u = k / SR;
      const v = Math.sin(TAU * fr * u) * Math.sin(TAU * 7 * u) * Math.exp(-u * 5) * 0.05;
      add(S, Math.floor(t * SR) + k, v, -v);
    }
  }
  for (let b = 0, t = s5 + 9.05; t < s6 - 0.3; b++, t += 0.25) {
    const fr = midi(36 + (b % 8 < 6 ? 0 : 3));
    let ph = 0;
    const f = lp(600);
    for (let k = 0; k < 0.22 * SR; k++) {
      const u = k / SR;
      ph += fr / SR;
      const v = f(2 * (ph % 1) - 1) * Math.exp(-u * 9) * 0.2;
      add(S, Math.floor(t * SR) + k, v, v);
    }
  }
}
// Closing: emotional melody over the resolution, then a long tail
{
  const mel = [[close - 0.4, 74, 1.2], [close + 0.9, 78, 1.0], [close + 1.9, 81, 2.6]];
  mel.forEach(([t, m, d]) => {
    const fr = midi(m);
    for (let k = 0; k < (d + 1.5) * SR; k++) {
      const u = k / SR;
      const env = Math.min(1, u / 0.08) * Math.exp(-u * 0.9);
      const v = (Math.sin(TAU * fr * u) + 0.25 * Math.sin(TAU * fr * 2 * u)) * env * 0.09;
      add(S, Math.floor(t * SR) + k, v, v);
    }
  });
}
reverb(S, 0.32, 1.25);

// Duck under the voice: -7 dB while speaking, smoothed
const duck = new Float32Array(S.n);
for (const w of words) for (let i = Math.floor((w.s - 0.08) * SR); i < Math.floor((w.e + 0.12) * SR) && i < S.n; i++) if (i >= 0) duck[i] = 1;
let g = 1;
for (let i = 0; i < S.n; i++) {
  const target = duck[i] ? 0.45 : 1;
  const k = target < g ? 1 - Math.exp(-1 / (0.06 * SR)) : 1 - Math.exp(-1 / (0.45 * SR));
  g += (target - g) * k;
  S.L[i] *= g;
  S.R[i] *= g;
}
// Fades
for (let i = 0; i < S.n; i++) {
  const t = i / SR;
  const f = Math.min(1, t / 0.4) * Math.min(1, Math.max(0, (TOTAL - t) / 2.5));
  S.L[i] *= f;
  S.R[i] *= f;
}
peakNorm(S, 0.8);
mkdirSync(join(EP, "video/assets/bgm"), { recursive: true });
writeWav(join(EP, "video/assets/bgm/track.wav"), S);
writeFileSync(join(EP, "video/assets/sfx/sfx-meta.json"), JSON.stringify(sfxMeta, null, 1));
console.log(`score ${TOTAL}s, ${Object.keys(SFX).length} sfx`, sfxMeta);
console.log(SC.map((s) => `${s.id} ${s.start} +${s.dur}`).join("\n"));
