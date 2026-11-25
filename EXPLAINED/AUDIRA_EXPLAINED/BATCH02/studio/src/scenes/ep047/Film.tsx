// EP047 film — "Mengapa Sinyal HP Bisa Hilang di Dalam Gedung?" in CYBERFORGE.
// Same hologram world as the cover: BTS mast, cut-away tower block (glass facade with a low-e half,
// reinforced-concrete partition, steel lift in a shaft, basement), signal shells that weaken per material,
// then the in-building fix (ceiling antennas on a riser cable, small cell, Wi-Fi calling).
// Audio master clock: every shot, beat and caption reads timeline.json. Deterministic: frame-driven only.

import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { MANROPE } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";

// ---------------- timeline ----------------
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
export const FILM_TOTAL: number = TL.total;
const s = (i: number) => CLIPS[i].start;
const e = (i: number) => CLIPS[i].end;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

// ---------------- palette + math ----------------
const C = {
  void: "#04060d",
  cyan: "#00f0ff",
  cyanDim: "#0a6a7a",
  violet: "#8a2be2",
  lime: "#00ff88",
  magenta: "#ff0077",
  red: "#ff2a4a",
  amber: "#ffaa00",
  rebar: "#c98a52",
  hud: "#d0f7ff",
  white: "#f0f8ff",
};
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return v - Math.floor(v);
};
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const io = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const win = (t: number, a: number, b: number, f = 0.35) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

// ---------------- world layout ----------------
const B = { x0: -2.2, x1: 2.2, z0: -2.0, z1: 2.0, top: 9.0, base: -2.4 };
const FLOORS = [0, 1.8, 3.6, 5.4, 7.2, 9.0];
const PART_X = -0.6;
const CORE = { x0: 0.25, x1: 1.45, z0: -1.1, z1: 0.3 };
const MAST = new THREE.Vector3(-14, 0, -12);
const MAST_H = 11.5;
const ANT = new THREE.Vector3(MAST.x, MAST_H - 0.75, MAST.z);
const CAB_H = 1.4;
const CAB_Y_PARK = 3.75;
const cabY = (t: number) => mix(7.35, CAB_Y_PARK, io(ramp(t, s(0) + 0.2, e(0))));
const DAS_SPOTS: [number, number, number][] = [
  [-0.5, -0.06, 1.15],
  [1.85, 1.8 - 0.06, 1.1],
  [-1.3, 3.6 - 0.06, 1.1],
  [1.85, 5.4 - 0.06, 1.1],
  [-1.3, 7.2 - 0.06, 1.1],
  [1.85, 9.0 - 0.06, 1.1],
];
const RISER = { x: 1.62, z: 0.48 };
const RACK = { x0: 1.55, x1: 2.05, z0: -1.8, z1: -1.3, y0: B.base, y1: B.base + 1.3 };
const SMALLCELL = new THREE.Vector3(1.9, 5.4 + 1.25, -1.5);
const ROUTER = new THREE.Vector3(-1.5, 3.6 + 0.55, -1.2);

// ---------------- line batching ----------------
type RGB = [number, number, number];
const rgb = (hex: string, k = 1): RGB => {
  const c = new THREE.Color(hex);
  return [c.r * k, c.g * k, c.b * k];
};
type P3 = THREE.Vector3 | number[];
const arr = (p: P3) => (Array.isArray(p) ? p : [p.x, p.y, p.z]);
class Batch {
  pos: number[] = [];
  col: number[] = [];
  seg(a: P3, b: P3, ca: RGB, cb: RGB = ca) {
    const A = arr(a);
    const Bv = arr(b);
    this.pos.push(A[0], A[1], A[2], Bv[0], Bv[1], Bv[2]);
    this.col.push(...ca, ...cb);
  }
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: RGB) {
    const xs = [x0, x1], zs = [z0, z1];
    for (const y of [y0, y1]) {
      this.seg([x0, y, z0], [x1, y, z0], c); this.seg([x0, y, z1], [x1, y, z1], c);
      this.seg([x0, y, z0], [x0, y, z1], c); this.seg([x1, y, z0], [x1, y, z1], c);
    }
    for (const x of xs) for (const z of zs) this.seg([x, y0, z], [x, y1, z], c);
  }
  circle(c: number[], r: number, axis: "y" | "z", col: RGB, n = 32) {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      const p = (a: number) => (axis === "y" ? [c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)] : [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]]);
      this.seg(p(a0), p(a1), col);
    }
  }
  build(width: number, w: number, h: number) {
    const g = new LineSegmentsGeometry();
    if (this.pos.length === 0) this.seg([0, -999, 0], [0, -999.01, 0], [0, 0, 0]);
    g.setPositions(this.pos);
    g.setColors(this.col);
    const m = new LineMaterial({ color: 0xffffff, linewidth: width, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    m.resolution.set(w, h);
    const l = new LineSegments2(g, m);
    l.frustumCulled = false;
    return l;
  }
}
const disposeLine = (l: LineSegments2) => {
  l.geometry.dispose();
  (l.material as LineMaterial).dispose();
};

// ---------------- signal model (qualitative; no dB anywhere) ----------------
type Ctx = { t: number; cab: number };
const facadeHit = (p: THREE.Vector3) => {
  const tx = (B.x0 - ANT.x) / (p.x - ANT.x);
  return { y: ANT.y + tx * (p.y - ANT.y), z: ANT.z + tx * (p.z - ANT.z) };
};
/** Returns remaining strength 0..1 and whether the ray came through the low-e glass half. */
const attenuation = (p: THREE.Vector3, ctx: Ctx) => {
  let a = 1;
  let lowE = false;
  if (p.y < 0) a *= 0.07; // soil + slabs
  const inZ = p.z > B.z0 && p.z < B.z1;
  if (p.x > B.x0 && inZ && p.y < B.top) {
    const h = facadeHit(p);
    if (h.z > B.z0 && h.z < B.z1 && h.y > 0 && h.y < B.top) {
      if (h.z > 0) { a *= 0.12; lowE = true; } else a *= 0.92; // low-e metal-coated glass vs plain glass
    } else a *= 0.45; // came through the concrete back wall
    if (p.x > PART_X) a *= 0.42; // reinforced concrete partition
    const zc = ANT.z + ((CORE.x0 - ANT.x) / (p.x - ANT.x)) * (p.z - ANT.z);
    const hitsCore = zc > CORE.z0 - 0.1 && zc < CORE.z1 + 0.1;
    if (p.x > CORE.x0 && p.x < CORE.x1 && p.z > CORE.z0 && p.z < CORE.z1) {
      a *= p.y > ctx.cab && p.y < ctx.cab + CAB_H ? 0.0 : 0.3; // inside the steel cabin nothing survives
    } else if (p.x >= CORE.x1 && hitsCore) a *= 0.2;
  }
  return { a, lowE };
};
const waveColor = (a: number, k: number): RGB => {
  const c = new THREE.Color(C.cyan).lerp(new THREE.Color(C.magenta), clamp((0.8 - a) / 0.65));
  const g = k * (0.12 + 0.88 * a);
  return [c.r * g, c.g * g, c.b * g];
};

const WAVE_SPACING = 2.3;
const WAVE_SPEED = 2.6;
const buildWaves = (ctx: Ctx, gain: number, emph: { glass: number; concrete: number; lift: number }) => {
  const strong = new Batch();
  const shards = new Batch();
  if (gain <= 0.001) return { strong, shards };
  const dir = new THREE.Vector3(0, 3.8, 0).sub(ANT).normalize();
  const u = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(u, dir).normalize();
  const shell = (r: number, th: number, ph: number) =>
    ANT.clone().addScaledVector(dir, r * Math.cos(th)).addScaledVector(u, r * Math.sin(th) * Math.cos(ph)).addScaledVector(v, r * Math.sin(th) * Math.sin(ph));
  const N = 11;
  const travel = ctx.t * WAVE_SPEED;
  for (let k = 0; k < N; k++) {
    const r = 1.2 + ((travel + k * WAVE_SPACING) % (N * WAVE_SPACING));
    const id = Math.floor((travel + k * WAVE_SPACING) / (N * WAVE_SPACING)) * N + k;
    const fade = gain * clamp(1 - (r - 4) / 24) * clamp((r - 1.2) / 1.5);
    const thMax = 0.6;
    const rings = [0.14, 0.3, 0.46];
    const segs = 84;
    rings.forEach((th, ri) => {
      for (let i = 0; i < segs; i++) {
        const p0 = shell(r, th, (i / segs) * Math.PI * 2);
        const p1 = shell(r, th, ((i + 1) / segs) * Math.PI * 2);
        const mid = p0.clone().add(p1).multiplyScalar(0.5);
        const { a, lowE } = attenuation(mid, ctx);
        const seed = id * 1000 + ri * 100 + i;
        // low-e glass reflects most of the wave back out: mirror the part that went in
        if (lowE && mid.x - B.x0 < 3.6 && emph.glass > 0.01) {
          const m0 = p0.clone(); m0.x = 2 * B.x0 - m0.x;
          const m1 = p1.clone(); m1.x = 2 * B.x0 - m1.x;
          strong.seg(m0, m1, rgb("#ffffff", fade * 2.6 * emph.glass * clamp(1 - (mid.x - B.x0) / 3.6)));
        }
        if (a < 0.88 && hash(seed) > 0.2 + 0.8 * a) continue;
        const jit = a < 0.5 ? (hash(seed + 7) - 0.5) * 0.3 : 0;
        const col = waveColor(a, fade * (ri === 1 ? 0.85 : 0.6));
        (a > 0.6 ? strong : shards).seg(p0.clone().addScaledVector(dir, jit), p1.clone().addScaledVector(dir, jit), col);
      }
    });
    for (let m = 0; m < 8; m++) {
      const ph = (m / 8) * Math.PI * 2 + 0.2;
      const steps = 8;
      for (let st = 0; st < steps; st++) {
        const p0 = shell(r, (st / steps) * thMax, ph);
        const p1 = shell(r, ((st + 1) / steps) * thMax, ph);
        const { a } = attenuation(p0.clone().add(p1).multiplyScalar(0.5), ctx);
        if (a < 0.88 && hash(id * 777 + m * 31 + st) > 0.2 + 0.8 * a) continue;
        shards.seg(p0, p1, waveColor(a, fade * 0.22));
      }
    }
    // impact traces on each material where the shell meets it
    const walls = [
      { x: B.x0, col: C.cyan, k: 1.0 + 1.4 * emph.glass, z0: B.z0, z1: 0, y0: 0, y1: B.top },
      { x: B.x0, col: C.amber, k: 0.6 + 1.6 * emph.glass, z0: 0, z1: B.z1, y0: 0, y1: B.top },
      { x: PART_X, col: C.magenta, k: 0.6 + 1.6 * emph.concrete, z0: B.z0, z1: B.z1, y0: 0, y1: B.top },
      { x: CORE.x0, col: C.amber, k: 0.5 + 1.6 * emph.lift, z0: CORE.z0, z1: CORE.z1, y0: B.base, y1: B.top },
    ];
    for (const w of walls) {
      const dx = w.x - ANT.x;
      if (r <= Math.abs(dx)) continue;
      const rr = Math.sqrt(r * r - dx * dx);
      const n = 110;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
        const p0 = new THREE.Vector3(w.x, ANT.y + rr * Math.sin(a0), ANT.z + rr * Math.cos(a0));
        const p1 = new THREE.Vector3(w.x, ANT.y + rr * Math.sin(a1), ANT.z + rr * Math.cos(a1));
        const ok = (p: THREE.Vector3) => p.z > w.z0 && p.z < w.z1 && p.y > w.y0 && p.y < w.y1;
        if (!ok(p0) || !ok(p1)) continue;
        const { a } = attenuation(new THREE.Vector3(w.x - 0.01, p0.y, p0.z), ctx);
        strong.seg(p0, p1, rgb(w.col, w.k * fade * (0.3 + 0.7 * a)));
      }
    }
  }
  return { strong, shards };
};

// ---------------- static structure ----------------
const buildStructure = () => {
  const hi = new Batch();
  const lo = new Batch();
  const frame = rgb(C.cyan, 0.8);
  const conc = rgb(C.violet, 0.75);
  const steel = rgb(C.amber, 0.8);
  for (const y of FLOORS) {
    const t = 0.16;
    hi.seg([B.x0, y, B.z0], [B.x1, y, B.z0], frame);
    hi.seg([B.x0, y, B.z0], [B.x0, y, B.z1], frame);
    hi.seg([B.x0, y, B.z1], [B.x1, y, B.z1], rgb(C.magenta, 0.85));
    hi.seg([B.x0, y - t, B.z1], [B.x1, y - t, B.z1], rgb(C.magenta, 0.5));
    hi.seg([B.x1, y, B.z0], [B.x1, y, B.z1], rgb(C.magenta, 0.85));
    hi.seg([B.x1, y - t, B.z0], [B.x1, y - t, B.z1], rgb(C.magenta, 0.5));
    for (let x = B.x0; x < B.x1; x += 0.22) lo.seg([x, y - t, B.z1], [x + 0.14, y, B.z1], rgb(C.magenta, 0.28));
    for (let x = B.x0 + 0.55; x < B.x1; x += 0.55) lo.seg([x, y, B.z0], [x, y, B.z1], rgb(C.cyanDim, 0.3));
  }
  hi.seg([B.x0, B.base, B.z0], [B.x1, B.base, B.z0], conc);
  hi.seg([B.x0, B.base, B.z0], [B.x0, B.base, B.z1], conc);
  hi.seg([B.x0, B.base, B.z1], [B.x1, B.base, B.z1], rgb(C.magenta, 0.85));
  hi.seg([B.x1, B.base, B.z0], [B.x1, B.base, B.z1], rgb(C.magenta, 0.85));
  for (const [x, z] of [[B.x0, B.z0], [B.x1, B.z0], [B.x0, B.z1], [B.x1, B.z1]]) hi.seg([x, B.base, z], [x, B.top, z], frame);
  hi.box(-1.6, B.top, -1.4, -0.2, B.top + 0.7, 0.2, rgb(C.cyanDim, 0.9));
  // facade: plain glass half (z<0) cyan mullions, low-e half (z>0) with a thin metallic film (amber)
  for (let z = B.z0; z <= B.z1 + 1e-6; z += 0.5) lo.seg([B.x0, 0, z], [B.x0, B.top, z], z > 0.01 ? rgb(C.amber, 0.5) : rgb(C.cyan, 0.42));
  for (const y of FLOORS) if (y + 0.9 < B.top) {
    lo.seg([B.x0, y + 0.9, B.z0], [B.x0, y + 0.9, 0], rgb(C.cyan, 0.42));
    lo.seg([B.x0, y + 0.9, 0], [B.x0, y + 0.9, B.z1], rgb(C.amber, 0.5));
  }
  for (let y = 0.2; y < B.top; y += 0.3) lo.seg([B.x0 + 0.03, y, 0.02], [B.x0 + 0.03, y + 0.15, B.z1 - 0.02], rgb(C.amber, 0.12)); // film sheen
  // back wall concrete hatch
  for (let x = B.x0; x < B.x1; x += 0.35) for (const y of FLOORS.slice(0, -1)) lo.seg([x, y, B.z0], [Math.min(x + 0.5, B.x1), y + 0.6, B.z0], rgb(C.violet, 0.26));
  // reinforced-concrete partition with rebar grid
  for (const y of FLOORS.slice(0, -1)) {
    hi.box(PART_X - 0.12, y, B.z0, PART_X + 0.12, y + 1.64, B.z1 - 0.01, conc);
    for (let zz = B.z0 + 0.25; zz < B.z1; zz += 0.3) lo.seg([PART_X, y + 0.05, zz], [PART_X, y + 1.6, zz], rgb(C.rebar, 0.55));
    for (let yy = y + 0.2; yy < y + 1.6; yy += 0.3) lo.seg([PART_X, yy, B.z0 + 0.05], [PART_X, yy, B.z1 - 0.05], rgb(C.rebar, 0.55));
  }
  // steel lift shaft
  hi.box(CORE.x0, B.base, CORE.z0, CORE.x1, B.top + 0.9, CORE.z1, steel);
  const levels = [B.base, ...FLOORS, B.top + 0.9];
  for (let i = 0; i < levels.length - 1; i++) {
    const y0 = levels[i], y1 = levels[i + 1];
    lo.seg([CORE.x0, y0, CORE.z1], [CORE.x1, y1, CORE.z1], rgb(C.amber, 0.35));
    lo.seg([CORE.x1, y0, CORE.z1], [CORE.x0, y1, CORE.z1], rgb(C.amber, 0.35));
    hi.seg([CORE.x0, y0, CORE.z1], [CORE.x1, y0, CORE.z1], steel);
  }
  // basement cars
  const car = (x: number, z: number) => {
    lo.box(x - 0.75, -2.4, z - 0.35, x + 0.75, -1.95, z + 0.35, rgb(C.cyan, 0.45));
    lo.box(x - 0.42, -1.95, z - 0.32, x + 0.38, -1.65, z + 0.32, rgb(C.cyan, 0.4));
  };
  car(-1.2, 1.0);
  car(-1.2, -1.0);
  // soil section
  for (const [xa, xb] of [[-6, B.x0], [B.x1, 6]]) {
    for (let x = xa; x < xb; x += 0.3) lo.seg([x, B.base - 0.6, B.z1], [Math.min(x + 0.6, xb), 0, B.z1], rgb(C.violet, 0.45));
    hi.seg([xa, 0, B.z1], [xb, 0, B.z1], rgb(C.violet, 0.9));
  }
  hi.seg([-6, B.base - 0.6, B.z1], [6, B.base - 0.6, B.z1], rgb(C.violet, 0.5));
  // BTS lattice mast with three sector panels
  const halfW = (y: number) => mix(1.3, 0.32, y / MAST_H);
  const corner = (y: number, i: number) => {
    const w = halfW(y);
    const sg = [[-1, -1], [1, -1], [1, 1], [-1, 1]][i];
    return [MAST.x + sg[0] * w, y, MAST.z + sg[1] * w];
  };
  for (let i = 0; i < 4; i++) hi.seg(corner(0, i), corner(MAST_H, i), rgb(C.cyan, 0.85));
  for (let sc = 0; sc < 9; sc++) {
    const y0 = (sc / 9) * MAST_H, y1 = ((sc + 1) / 9) * MAST_H;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      lo.seg(corner(y0, i), corner(y1, j), rgb(C.cyan, 0.4));
      lo.seg(corner(y0, j), corner(y1, i), rgb(C.cyan, 0.4));
      lo.seg(corner(y1, i), corner(y1, j), rgb(C.cyan, 0.55));
    }
  }
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    const cx = MAST.x + Math.cos(a) * 0.75, cz = MAST.z + Math.sin(a) * 0.75;
    const tx = -Math.sin(a) * 0.18, tz = Math.cos(a) * 0.18;
    hi.box(Math.min(cx - tx, cx + tx), MAST_H - 1.4, Math.min(cz - tz, cz + tz), Math.max(cx - tx, cx + tx) + 0.05, MAST_H - 0.1, Math.max(cz - tz, cz + tz) + 0.05, rgb(C.white, 1.0));
  }
  hi.circle([MAST.x, MAST_H - 1.5, MAST.z], 0.85, "y", rgb(C.cyan, 0.8), 24);
  hi.seg([MAST.x, MAST_H, MAST.z], [MAST.x, MAST_H + 1.2, MAST.z], rgb(C.cyan, 0.9));
  // background skyline + grid
  const far = new Batch();
  for (let i = 0; i < 16; i++) {
    const x = -34 + i * 4.6 + hash(i) * 2, z = -30 - hash(i + 40) * 10;
    const h = 3 + hash(i + 80) * 11, w = 1.2 + hash(i + 120) * 1.6;
    far.box(x - w, 0, z - w, x + w, h, z + w, rgb(C.violet, 0.3));
  }
  const grid = new Batch();
  const S = 34, step = 1.2;
  const hole = (x: number, z: number) => x > -6 && x < 6 && z > B.z0 - 0.4 && z < B.z1 + 0.01;
  for (let gx = -S; gx < S; gx += step)
    for (let gz = -S; gz < S; gz += step) {
      if (hole(gx + step / 2, gz + step / 2)) continue;
      const c = rgb(C.cyanDim, clamp(1 - Math.hypot(gx, gz) / S) * 0.65);
      if (!hole(gx + step / 2, gz)) grid.seg([gx, 0, gz], [gx + step, 0, gz], c);
      if (!hole(gx, gz + step / 2)) grid.seg([gx, 0, gz], [gx, 0, gz + step], c);
    }
  return { hi, lo, far, grid };
};

// ---------------- dynamic pieces: cabin, DAS, noise ----------------
const buildDynamic = (t: number, ctx: Ctx) => {
  const b = new Batch();
  // lift cabin + steel doors; flashes amber when a wave front reaches it
  const y0 = ctx.cab, y1 = ctx.cab + CAB_H;
  const dCab = new THREE.Vector3(0.85, y0 + 0.7, -0.4).distanceTo(ANT);
  let flash = 0;
  for (let k = 0; k < 11; k++) {
    const r = 1.2 + ((t * WAVE_SPEED + k * WAVE_SPACING) % (11 * WAVE_SPACING));
    flash += Math.exp(-(((r - dCab) / 0.45) ** 2));
  }
  const liftEmph = win(t, s(6), e(6)) + win(t, 0, e(0));
  const cabCol = rgb(C.red, 0.9 + flash * 1.6 * liftEmph);
  b.box(CORE.x0 + 0.12, y0, CORE.z0 + 0.12, CORE.x1 - 0.12, y1, CORE.z1 - 0.12, cabCol);
  const door = clamp(ramp(t, s(0) + 0.1, s(0) + 0.9)); // doors slide shut in the hook
  const zf = CORE.z1 - 0.12;
  const mid = 0.85, half = (CORE.x1 - CORE.x0 - 0.24) / 2;
  const off = half * (1 - door);
  b.box(mid - half - off, y0 + 0.02, zf, mid - off, y1 - 0.05, zf + 0.02, rgb(C.amber, 0.9));
  b.box(mid + off, y0 + 0.02, zf, mid + half + off, y1 - 0.05, zf + 0.02, rgb(C.amber, 0.9));
  b.seg([0.85, y1, -0.4], [0.85, B.top + 0.9, -0.4], rgb(C.amber, 0.5));
  // in-building system: rack, riser cable, ceiling antennas lighting up in order
  const pRack = ramp(t, s(9) - 0.3, s(9) + 0.6);
  const pRiser = ramp(t, s(9) + 0.3, s(10) + 0.6);
  if (pRack > 0) {
    b.box(RACK.x0, RACK.y0, RACK.z0, RACK.x1, RACK.y1, RACK.z1, rgb(C.lime, 1.3 * pRack));
    for (let yy = RACK.y0 + 0.2; yy < RACK.y1; yy += 0.2) b.seg([RACK.x0, yy, RACK.z1], [RACK.x1, yy, RACK.z1], rgb(C.lime, 0.8 * pRack));
    b.seg([RACK.x0, RACK.y1, RACK.z1], [RISER.x, RACK.y1, RISER.z], rgb(C.lime, 1.2 * pRack));
  }
  if (pRiser > 0) {
    const yTop = mix(RACK.y1, B.top - 0.1, pRiser);
    b.seg([RISER.x, RACK.y1, RISER.z], [RISER.x, yTop, RISER.z], rgb(C.lime, 1.6));
  }
  DAS_SPOTS.forEach((p, i) => {
    const on = ramp(t, s(10) + 0.2 + i * 0.55, s(10) + 0.6 + i * 0.55);
    const visible = pRiser > 0 ? 1 : 0.25 * win(t, s(10) - 2, FILM_TOTAL);
    const col = rgb(on > 0 ? C.lime : C.white, on > 0 ? 0.7 + 1.4 * on : 0.4 * visible);
    if (pRiser > 0 || on > 0) {
      b.circle([p[0], p[1], p[2]], 0.2, "y", col, 20);
      b.seg([p[0], p[1], p[2]], [p[0], p[1] - 0.12, p[2]], col);
      if (pRiser * (B.top - RACK.y1) + RACK.y1 > p[1]) b.seg([p[0], p[1] + 0.03, p[2]], [RISER.x, p[1] + 0.03, RISER.z], rgb(C.lime, 0.5));
    }
    if (on > 0) {
      for (let k = 0; k < 4; k++) {
        const r = 0.3 + (((t * 1.4 + k * 0.5) % 2.0));
        const fade = on * clamp(1 - r / 2.3);
        for (const el of [0.3, 0.7, 1.1]) {
          const rr = r * Math.cos(el), y = p[1] - r * Math.sin(el);
          const n = 40;
          for (let j = 0; j < n; j++) {
            const a0 = (j / n) * Math.PI * 2, a1 = ((j + 1) / n) * Math.PI * 2;
            const q0 = [p[0] + rr * Math.cos(a0), y, p[2] + rr * Math.sin(a0)];
            const q1 = [p[0] + rr * Math.cos(a1), y, p[2] + rr * Math.sin(a1)];
            const floor = i === 0 ? B.base : FLOORS[i - 1];
            const ok = (q: number[]) => q[0] > B.x0 && q[0] < B.x1 + 0.2 && q[2] > B.z0 && q[2] < B.z1 + 0.2 && q[1] > floor + 0.02 && !(q[0] > CORE.x0 && q[0] < CORE.x1 && q[2] > CORE.z0 && q[2] < CORE.z1);
            if (ok(q0) && ok(q1)) b.seg(q0, q1, rgb(C.lime, 1.3 * fade));
          }
        }
      }
    }
  });
  // small cell (router-sized box on internet cable) and Wi-Fi router with arcs
  const pSc = ramp(t, s(11) - 0.2, s(11) + 0.4);
  const pWf = ramp(t, s(11) + 1.2, s(11) + 1.8);
  if (pSc > 0) {
    const c = SMALLCELL;
    b.box(c.x - 0.22, c.y - 0.08, c.z - 0.15, c.x + 0.22, c.y + 0.08, c.z + 0.15, rgb(C.white, 1.4 * pSc));
    b.seg([c.x + 0.22, c.y, c.z], [B.x1, c.y, c.z], rgb(C.white, 0.5 * pSc));
    for (let k = 0; k < 3; k++) {
      const r = 0.3 + ((t * 1.2 + k * 0.45) % 1.35);
      b.circle([c.x, c.y - 0.1, c.z], r, "y", rgb(C.lime, pSc * 1.2 * clamp(1 - r / 1.7)), 36);
    }
  }
  if (pWf > 0) {
    const c = ROUTER;
    b.box(c.x - 0.25, c.y - 0.05, c.z - 0.15, c.x + 0.25, c.y + 0.05, c.z + 0.15, rgb(C.cyan, 1.4 * pWf));
    b.seg([c.x - 0.18, c.y + 0.05, c.z], [c.x - 0.18, c.y + 0.35, c.z], rgb(C.cyan, pWf));
    b.seg([c.x + 0.18, c.y + 0.05, c.z], [c.x + 0.18, c.y + 0.35, c.z], rgb(C.cyan, pWf));
    for (let k = 0; k < 3; k++) {
      const r = 0.25 + ((t * 1.1 + k * 0.4) % 1.2);
      b.circle([c.x, c.y + 0.2, c.z], r, "y", rgb(C.cyan, pWf * 1.2 * clamp(1 - r / 1.5)), 36);
    }
  }
  return b;
};

const buildNoise = (t: number, frameKey: number, gain: number) => {
  const pts: number[] = [];
  if (gain > 0) {
    for (let i = 0; i < 420; i++) {
      const h = (n: number) => hash(i * 13.1 + frameKey * 7.7 + n);
      pts.push(mix(B.x0, B.x1, h(1)), mix(B.base + 0.05, -0.1, h(2)), mix(B.z0, B.z1, h(3)));
    }
  }
  void t;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts.length ? pts : [0, -999, 0], 3));
  return g;
};

// ---------------- camera ----------------
type Pose = { pos: [number, number, number]; tgt: [number, number, number]; fov: number };
type Shot = { t0: number; t1: number; a: Pose; b: Pose };
const P = (pos: [number, number, number], tgt: [number, number, number], fov = 40): Pose => ({ pos, tgt, fov });
const mid4 = (s(4) + e(4)) / 2;
const SHOTS: Shot[] = [
  { t0: 0, t1: e(0), a: P([2.1, 8.4, 4.6], [0.85, 7.6, -0.4], 44), b: P([2.5, 5.1, 5.4], [0.85, 4.4, -0.4], 42) },
  { t0: s(1), t1: e(1), a: P([3.6, 5.6, 8.5], [0.4, 4.6, -0.4], 42), b: P([10, 9, 24], [-6.2, 5, -5], 42) },
  { t0: s(2), t1: e(2), a: P([-7.6, 11.6, -3.4], [-14, 10.4, -12], 40), b: P([-6.6, 11.0, -1.6], [-12.5, 9.8, -10], 40) },
  { t0: s(3), t1: e(3), a: P([-6.5, 6.5, 14], [-3.2, 4.6, -1], 42), b: P([-0.6, 5.2, 16], [-0.6, 4.4, 0], 42) },
  { t0: s(4), t1: mid4, a: P([-1.6, 5.4, 6.4], [-0.6, 4.4, 0], 40), b: P([0.2, 4.6, 6.0], [-0.6, 4.0, 0], 40) },
  { t0: mid4, t1: e(4), a: P([-0.4, 6.4, 9.5], [-0.6, 3.6, 0], 40), b: P([0.4, 6.2, 9.0], [-0.6, 3.6, 0], 40) },
  { t0: s(5), t1: e(5), a: P([-5.6, 6.8, 8.6], [-3.4, 5.0, 0.4], 42), b: P([-4.2, 6.0, 9.4], [-3.2, 4.8, 0.4], 42) },
  { t0: s(6), t1: e(6), a: P([2.9, 5.4, 5.6], [0.85, 4.45, -0.4], 40), b: P([2.3, 4.9, 4.5], [0.85, 4.45, -0.4], 40) },
  { t0: s(7), t1: e(7), a: P([2.2, 1.6, 9.0], [0, -2.2, 0], 42), b: P([1.0, -0.2, 7.4], [-0.3, -2.9, 0], 44) },
  { t0: s(8), t1: e(8), a: P([10, 8, 23], [-4.2, 3, -3], 42), b: P([8.6, 7.4, 21], [-4.2, 3, -3], 42) },
  { t0: s(9), t1: e(9), a: P([4.2, 0.6, 7.5], [1.6, -1.2, -0.6], 42), b: P([4.0, 2.6, 8.5], [1.4, 1.2, -0.4], 42) },
  { t0: s(10), t1: e(10), a: P([6.2, 4.5, 13], [0.2, 2.8, 0], 42), b: P([5.6, 7.6, 12.5], [0.2, 5.0, 0], 42) },
  { t0: s(11), t1: e(11), a: P([0.8, 6.6, 8.6], [0.2, 4.9, 0], 42), b: P([0.2, 6.0, 7.4], [0.2, 4.8, 0], 42) },
  { t0: s(12), t1: FILM_TOTAL, a: P([7.5, 7.5, 20], [-3.6, 3.4, -2], 42), b: P([12, 10, 31], [-3.6, 2.6, -2], 40) },
];
const zoomOut = (p: Pose, m: number): Pose => ({ ...p, pos: [p.tgt[0] + (p.pos[0] - p.tgt[0]) * m, p.tgt[1] + (p.pos[1] - p.tgt[1]) * m, p.tgt[2] + (p.pos[2] - p.tgt[2]) * m] });
// dolly distance per shot (close shots were authored tight; 9:16 needs more room)
const DOLLY = [1.75, 1.3, 1.6, 1.3, 1.75, 1.5, 1.6, 1.75, 1.6, 1.25, 1.6, 1.4, 1.75, 1.2];
SHOTS.forEach((sh, i) => { sh.a = zoomOut(sh.a, DOLLY[i]); sh.b = zoomOut(sh.b, DOLLY[i]); });
const lerpPose = (a: Pose, b: Pose, u: number): Pose => ({
  pos: [mix(a.pos[0], b.pos[0], u), mix(a.pos[1], b.pos[1], u), mix(a.pos[2], b.pos[2], u)],
  tgt: [mix(a.tgt[0], b.tgt[0], u), mix(a.tgt[1], b.tgt[1], u), mix(a.tgt[2], b.tgt[2], u)],
  fov: mix(a.fov, b.fov, u),
});
const TR = 0.4; // half-length of each transition move
// the mast -> building move crosses the whole set: give it a longer, readable ease (~1.5 s)
const TR_IN: Record<number, number> = { 3: 0.75 };
const TR_OUT: Record<number, number> = { 2: 0.75 };
const poseAt = (t: number): Pose => {
  const n = SHOTS.length;
  const d0 = (i: number) => (i === 0 ? SHOTS[0].t0 : SHOTS[i].t0 + (TR_IN[i] ?? TR));
  const d1 = (i: number) => (i === n - 1 ? SHOTS[i].t1 : SHOTS[i].t1 - (TR_OUT[i] ?? TR * 0.5));
  if (t <= d0(0)) return SHOTS[0].a;
  for (let i = 0; i < n; i++) {
    if (t <= d1(i)) {
      const u = clamp((t - d0(i)) / (d1(i) - d0(i)));
      return lerpPose(SHOTS[i].a, SHOTS[i].b, i === 0 ? u * 0.7 + io(u) * 0.3 : u * 0.85 + io(u) * 0.15);
    }
    if (i < n - 1 && t < d0(i + 1)) return lerpPose(SHOTS[i].b, SHOTS[i + 1].a, io((t - d1(i)) / (d0(i + 1) - d1(i))));
  }
  return SHOTS[n - 1].b;
};

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(...pose.tgt);
    cam.fov = pose.fov;
    cam.near = 0.1;
    cam.far = 220;
    cam.updateProjectionMatrix();
    gl.toneMapping = THREE.NoToneMapping;
  }, [camera, gl, pose]);
  return null;
};

const Finish: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType, samples: 4 });
    const c = new EffectComposer(gl, rt);
    c.setPixelRatio(1);
    c.setSize(size.width, size.height);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.5, 0.45, 0.22));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, size.width, size.height]);
  useFrame(() => composer.render(), 1);
  return null;
};

// ---------------- signal bar badges ----------------
const Bars: React.FC<{ at: [number, number, number]; level: number; color: string; scale: number; cam: [number, number, number] }> = ({ at, level, color, scale, cam }) => {
  if (scale <= 0.001) return null;
  const m = new THREE.Matrix4().lookAt(new THREE.Vector3(...cam), new THREE.Vector3(...at), new THREE.Vector3(0, 1, 0));
  const quat = new THREE.Quaternion().setFromRotationMatrix(m);
  const bars = [0.2, 0.36, 0.52, 0.68];
  return (
    <group position={at} quaternion={quat} scale={scale}>
      <mesh position={[0, 0.3, -0.02]}>
        <planeGeometry args={[1.25, 0.95]} />
        <meshBasicMaterial color="#020409" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      {bars.map((h, i) => (
        <mesh key={i} position={[-0.39 + i * 0.22, -0.05 + h / 2, 0]}>
          <planeGeometry args={[0.14, h]} />
          <meshBasicMaterial color={color} transparent opacity={i < level ? 1 : 0.16} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
      {level === 0 &&
        [Math.PI / 4, -Math.PI / 4].map((r) => (
          <mesh key={r} position={[0.4, 0.62, 0.01]} rotation={[0, 0, r]}>
            <planeGeometry args={[0.07, 0.34]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
    </group>
  );
};

type Badge = { at: [number, number, number]; level: number; color: string; scale: number };
const badgesAt = (t: number, cab: number): Badge[] => {
  const pay = ramp(t, s(10) + 1.0, s(10) + 2.4);
  const hookDrop = Math.round(mix(4, 0, ramp(t, s(0) + 0.5, e(0) - 0.2)));
  const pathWide = win(t, s(8), e(8)) + win(t, s(12), FILM_TOTAL);
  const L: Badge[] = [
    { at: [0.85, cab + 0.25, CORE.z1 + 0.55], level: t < e(0) + 0.3 ? hookDrop : 0, color: hookDrop > 1 && t < e(0) ? C.lime : C.red, scale: 0.75 * (win(t, 0, e(0) + 0.6) + win(t, s(6), e(6)) + pathWide) * (1 - pay) },
    { at: [B.x0 + 0.75, 5.4 + 0.5, -1.2], level: 4, color: C.lime, scale: 0.75 * (win(t, s(3) + 1.2, e(3)) + win(t, s(5), s(5) + 2.6) + pathWide) },
    { at: [B.x0 + 0.75, 5.4 + 0.5, 1.2], level: 1, color: C.amber, scale: 0.75 * win(t, s(5) + 2.4, e(5)) },
    { at: [-0.15, 5.4 + 0.5, 1.0], level: 2, color: C.amber, scale: 0.75 * (win(t, s(3) + 2.2, e(3)) + win(t, s(4), e(4)) + pathWide) * (1 - pay) },
    { at: [0.3, -1.75, 1.35], level: 0, color: C.red, scale: 0.8 * (win(t, s(7) + 0.6, e(7)) + pathWide) * (1 - pay) },
  ];
  if (pay > 0) {
    DAS_SPOTS.slice(0, 5).forEach((p, i) => {
      L.push({ at: [p[0] + (p[0] > 0 ? -0.1 : 0.4), p[1] - 1.15, 1.45], level: 4, color: C.lime, scale: 0.65 * pay * win(t, s(10), FILM_TOTAL) * (i === 0 ? 1 : 1) });
    });
  }
  return L;
};


// In-world brand: a hologram rooftop sign on the building's front edge (part of the set, not a screen overlay).
const RoofSign: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    g.clearRect(0, 0, 1024, 256);
    g.strokeStyle = C.cyan;
    g.lineWidth = 6;
    g.strokeRect(8, 8, 1008, 240);
    g.font = "600 150px Manrope";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = C.cyan;
    g.shadowBlur = 24;
    g.fillStyle = "#dffcff";
    g.fillText("AUDIRA", 512, 112);
    g.shadowBlur = 0;
    g.font = "600 34px Manrope";
    g.fillStyle = C.lime;
    g.fillText("E X P L A I N E D", 512, 212);
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }, []);
  const flick = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
  return (
    <group position={[0, B.top + 1.0, B.z1 - 0.05]}>
      <mesh>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={tex} transparent opacity={flick} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, -0.5, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshBasicMaterial color={C.cyan} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------- 3D world ----------------
const World: React.FC<{ t: number; frame: number; pose: Pose; w: number; h: number; k: number }> = ({ t, frame, pose, w, h, k }) => {
  const st = useMemo(() => {
    const b = buildStructure();
    return { hi: b.hi.build(2.2 * k, w, h), lo: b.lo.build(1.25 * k, w, h), far: b.far.build(1.1 * k, w, h), grid: b.grid.build(1.0 * k, w, h) };
  }, [w, h, k]);
  const cab = cabY(t);
  const ctx: Ctx = { t, cab };
  const emph = {
    glass: win(t, s(5), e(5)),
    concrete: win(t, s(4), e(4)) + 0.5 * win(t, s(3), e(3)),
    lift: win(t, s(6), e(6)) + win(t, 0, e(0)),
  };
  // waves fade out in the basement close-up (so the noise reads) and calm down once the fix is shown
  const gain = 1 - 0.3 * win(t, s(7) + 0.8, e(7)) - 0.35 * ramp(t, s(10), s(10) + 1.5) * (1 - win(t, s(12), FILM_TOTAL));
  const dyn = useMemo(() => {
    const wv = buildWaves(ctx, gain, emph);
    return { strong: wv.strong.build(2.4 * k, w, h), shards: wv.shards.build(1.5 * k, w, h), extra: buildDynamic(t, ctx).build(2.2 * k, w, h) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, w, h, k]);
  useEffect(() => () => { disposeLine(dyn.strong); disposeLine(dyn.shards); disposeLine(dyn.extra); }, [dyn]);
  const noiseGain = win(t, s(7) + 1.0, e(7) + 0.4);
  const noise = useMemo(() => buildNoise(t, Math.floor(frame / 2), noiseGain), [frame, noiseGain, t]);
  useEffect(() => () => noise.dispose(), [noise]);
  const stars = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < 600; i++) p.push((hash(i) - 0.5) * 140, 4 + hash(i + 900) * 60, -45 - hash(i + 1800) * 30);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  const badges = badgesAt(t, cab);
  return (
    <>
      <Rig pose={pose} />
      <points geometry={stars}>
        <pointsMaterial color={C.cyan} size={1.6 * k} sizeAttenuation={false} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <primitive object={st.far} />
      {(() => {
        // close shots: thin out the detail lines and floor grid, thicken the hero edges; brighten the basement shot
        const dist = Math.hypot(pose.pos[0] - pose.tgt[0], pose.pos[1] - pose.tgt[1], pose.pos[2] - pose.tgt[2]);
        const close = clamp((15 - dist) / 6);
        const bl = win(t, s(7), e(7));
        (st.lo.material as LineMaterial).opacity = Math.min(1, 1 - 0.5 * close + 0.6 * bl);
        (st.grid.material as LineMaterial).opacity = 1 - 0.7 * close;
        (st.far.material as LineMaterial).opacity = 1 - 0.6 * close;
        (st.hi.material as LineMaterial).linewidth = (2.2 + 0.9 * close + 0.6 * bl) * k;
        return null;
      })()}
      <primitive object={st.grid} />
      <primitive object={st.lo} />
      <primitive object={st.hi} />
      <primitive object={dyn.shards} />
      <primitive object={dyn.strong} />
      <primitive object={dyn.extra} />
      <points geometry={noise}>
        <pointsMaterial color={C.magenta} size={3 * k} sizeAttenuation={false} transparent opacity={0.55 * noiseGain} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh position={[B.x0, B.top / 2, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2, B.top]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.04 + 0.05 * emph.glass} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[B.x0, B.top / 2, 1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2, B.top]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.05 + 0.1 * emph.glass} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[PART_X, B.top / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[B.z1 - B.z0, B.top]} />
        <meshBasicMaterial color={C.violet} transparent opacity={0.04 + 0.1 * emph.concrete} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[(CORE.x0 + CORE.x1) / 2, (B.base + B.top + 0.9) / 2, (CORE.z0 + CORE.z1) / 2]}>
        <boxGeometry args={[CORE.x1 - CORE.x0, B.top + 0.9 - B.base, CORE.z1 - CORE.z0]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.035 + 0.06 * emph.lift} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, (B.base - 0.6) / 2, B.z1 - 0.02]}>
        <planeGeometry args={[12, -(B.base - 0.6)]} />
        <meshBasicMaterial color={C.violet} transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, B.base + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[B.x1 - B.x0, B.z1 - B.z0]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.09 * win(t, s(7) - 0.3, e(7) + 0.3)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, B.base / 2, B.z0 + 0.01]}>
        <planeGeometry args={[B.x1 - B.x0, -B.base]} />
        <meshBasicMaterial color={C.violet} transparent opacity={0.12 * win(t, s(7) - 0.3, e(7) + 0.3)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[MAST.x, MAST_H + 1.25, MAST.z]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={C.red} toneMapped={false} />
      </mesh>
      {badges.map((b, i) => (
        <Bars key={i} at={b.at} level={b.level} color={b.color} scale={Math.min(b.scale, 0.8) * 0.8} cam={pose.pos} />
      ))}
      <RoofSign t={t} />
      <Finish />
    </>
  );
};

// ---------------- HUD overlay ----------------
const project = (pose: Pose, p: [number, number, number], w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(pose.fov, w / h, 0.1, 220);
  cam.position.set(...pose.pos);
  cam.lookAt(...pose.tgt);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, front: v.z < 1 };
};

type TagDef = { t0: number; t1: number; at: [number, number, number]; ex: number; ey: number; len: number; color: string; label: string; sub?: string };
const TAGS: TagDef[] = [
  { t0: s(1) + 1.6, t1: e(1) + 0.2, at: [MAST.x, MAST_H - 0.7, MAST.z], ex: 300, ey: 330, len: 260, color: C.cyan, label: "BTS", sub: "TETAP MEMANCAR" },
  { t0: s(2), t1: e(2), at: [MAST.x + 0.6, MAST_H - 0.8, MAST.z + 0.4], ex: 640, ey: 520, len: 300, color: C.white, label: "ANTENA SEKTORAL", sub: "3 ARAH" },
  { t0: s(3) + 0.4, t1: e(3), at: [B.x0, 7.6, 0], ex: 280, ey: 330, len: -220, color: C.cyan, label: "LAPIS 1", sub: "KACA" },
  { t0: s(3) + 1.4, t1: e(3), at: [PART_X, 7.6, 1.8], ex: 560, ey: 330, len: 220, color: C.magenta, label: "LAPIS 2", sub: "BETON" },
  { t0: s(3) + 2.4, t1: e(3), at: [CORE.x1, 8.4, CORE.z1], ex: 840, ey: 470, len: 200, color: C.amber, label: "LAPIS 3", sub: "LOGAM" },
  { t0: s(4) + 0.3, t1: mid4, at: [PART_X, 4.2, 1.9], ex: 260, ey: 360, len: -200, color: C.magenta, label: "BETON", sub: "BERTULANG" },
  { t0: s(4) + 1.0, t1: mid4, at: [PART_X, 5.0, 1.0], ex: 820, ey: 360, len: 220, color: C.rebar, label: "BESI TULANGAN", sub: "JARING BAJA" },
  { t0: s(5) + 0.2, t1: s(5) + 3.0, at: [B.x0, 6.4, -1.1], ex: 300, ey: 360, len: -230, color: C.cyan, label: "KACA BIASA", sub: "HAMPIR TEMBUS" },
  { t0: s(5) + 2.9, t1: e(5), at: [B.x0 - 1.3, 5.6, 1.0], ex: 300, ey: 640, len: -230, color: "#e8fbff", label: "DIPANTULKAN", sub: "BALIK KE LUAR" },
  { t0: s(5) + 2.4, t1: e(5), at: [B.x0, 6.0, 1.1], ex: 760, ey: 380, len: 260, color: C.amber, label: "KACA LOW-E", sub: "LAPIS LOGAM · MEMANTUL" },
  { t0: s(6) + 0.2, t1: e(6), at: [CORE.x1 - 0.12, CAB_Y_PARK + 1.2, CORE.z1 - 0.12], ex: 820, ey: 330, len: 220, color: C.amber, label: "KABIN BAJA", sub: "KOTAK LOGAM" },
  { t0: s(7) + 0.8, t1: e(7), at: [-1.2, -1.7, 1.0], ex: 300, ey: 360, len: -200, color: C.magenta, label: "BASEMEN", sub: "DI BAWAH TANAH" },
  { t0: s(9) + 0.2, t1: e(9) + 0.2, at: [RACK.x1, RACK.y1, RACK.z1], ex: 300, ey: 360, len: -240, color: C.lime, label: "RUANG PERANGKAT", sub: "TERSAMBUNG OPERATOR" },
  { t0: s(10) + 0.6, t1: e(10), at: [1.85, 7.2 - 0.06, 1.1], ex: 820, ey: 330, len: 230, color: C.lime, label: "ANTENA PLAFON", sub: "IN-BUILDING SYSTEM" },
  { t0: s(11) + 0.1, t1: e(11), at: [SMALLCELL.x, SMALLCELL.y, SMALLCELL.z], ex: 820, ey: 330, len: 220, color: C.white, label: "SMALL CELL", sub: "KABEL INTERNET" },
  { t0: s(11) + 1.3, t1: e(11), at: [ROUTER.x, ROUTER.y, ROUTER.z], ex: 260, ey: 500, len: -200, color: C.cyan, label: "WI-FI", sub: "PANGGILAN LEWAT INTERNET" },
];

const Tag: React.FC<{ d: TagDef; t: number; pose: Pose; w: number; h: number; k: number }> = ({ d, t, pose, w, h, k }) => {
  const o = win(t, d.t0, d.t1, 0.25);
  if (o <= 0.01) return null;
  const a = project(pose, d.at, w, h);
  if (!a.front) return null;
  const ex = d.ex * k, ey = d.ey * k, len = d.len * k * ramp(t, d.t0, d.t0 + 0.3);
  const x0 = Math.min(ex, ex + d.len * k);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={`${a.x},${a.y} ${ex},${ey} ${ex + len},${ey}`} fill="none" stroke={d.color} strokeWidth={2 * k} />
        <circle cx={a.x} cy={a.y} r={7 * k} fill="none" stroke={d.color} strokeWidth={2.5 * k} />
        <circle cx={a.x} cy={a.y} r={2.5 * k} fill={d.color} />
      </svg>
      <div style={{ position: "absolute", left: x0, width: Math.abs(d.len * k), bottom: h - ey + 6 * k, textAlign: d.len < 0 ? "right" : "left", fontFamily: "Manrope" }}>
        <span style={{ padding: `${2 * k}px ${8 * k}px`, background: "rgba(4,6,13,0.75)", fontSize: 28 * k, fontWeight: 600, letterSpacing: 3 * k, color: d.color, textShadow: `0 0 ${12 * k}px ${d.color}` }}>{d.label}</span>
      </div>
      {d.sub && (
        <div style={{ position: "absolute", left: x0, width: Math.abs(d.len * k), top: ey + 8 * k, textAlign: d.len < 0 ? "right" : "left", fontFamily: "Manrope", fontSize: 19 * k, fontWeight: 500, letterSpacing: 2 * k, color: C.hud }}>
          <span style={{ padding: `${2 * k}px ${8 * k}px`, background: "rgba(4,6,13,0.75)" }}>{d.sub}</span>
        </div>
      )}
    </div>
  );
};

/** HUD panel frame used by the 2D insets. */
const Panel: React.FC<{ x: number; y: number; w: number; h: number; k: number; o: number; title: string; color: string; children: React.ReactNode }> = ({ x, y, w, h, k, o, title, color, children }) => (
  <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k, opacity: o, background: "rgba(4,8,18,0.82)", border: `${1.5 * k}px solid ${color}55`, boxShadow: `0 0 ${24 * k}px ${color}22` }}>
    <div style={{ position: "absolute", left: 14 * k, top: 8 * k, fontFamily: "Manrope", fontSize: 18 * k, fontWeight: 600, letterSpacing: 4 * k, color }}>{title}</div>
    <svg width={w * k} height={h * k} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
  </div>
);

const sinePath = (x0: number, x1: number, yc: number, amp: (x: number) => number, wl: number, ph: number) => {
  let d = "";
  for (let x = x0; x <= x1; x += 3) d += `${x === x0 ? "M" : "L"}${x.toFixed(1)},${(yc + amp(x) * Math.sin((x / wl) * Math.PI * 2 - ph)).toFixed(1)} `;
  return d;
};

const Insets: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const out: React.ReactNode[] = [];
  // KONTEKS: each layer takes a share — bars drop LUAR > KACA > BETON > LOGAM (qualitative)
  const oL = win(t, s(3) + 0.3, e(3) + 0.2);
  if (oL > 0.01) {
    const stages = [["LUAR", 4, C.lime], ["KACA", 3, C.cyan], ["BETON", 2, C.magenta], ["LOGAM", 0, C.red]] as const;
    out.push(
      <Panel key="layers" x={90} y={1090} w={900} h={150} k={k} o={oL} title="TIAP LAPISAN MENGAMBIL BAGIAN" color={C.cyan}>
        {stages.map(([n, lv, col], i) => {
          const on = ramp(t, s(3) + 0.5 + i * 0.8, s(3) + 0.8 + i * 0.8);
          const x = 40 + i * 215;
          return (
            <g key={n} opacity={0.25 + 0.75 * on}>
              {[0, 1, 2, 3].map((b) => (
                <rect key={b} x={x + b * 22} y={118 - (b + 1) * 16} width={14} height={(b + 1) * 16} fill={b < lv ? col : "none"} stroke={col} strokeWidth={1.5} opacity={b < lv ? 1 : 0.5} />
              ))}
              <text x={x + 100} y={112} fill={col} fontFamily="Manrope" fontWeight={600} fontSize={22} letterSpacing={2}>{n}</text>
              {i < 3 && <text x={x + 178} y={88} fill={C.hud} fontSize={22} opacity={0.6}>›</text>}
            </g>
          );
        })}
      </Panel>,
    );
  }
  // MEKANISME beton: low vs high frequency through the same wall
  const oF = win(t, mid4 - 0.2, e(4) + 0.2);
  if (oF > 0.01) {
    const ph = t * 6;
    out.push(
      <Panel key="freq" x={90} y={1040} w={900} h={210} k={k} o={oF} title="SAMA-SAMA LEWAT BETON" color={C.magenta}>
        <rect x={430} y={36} width={40} height={168} fill={`${C.violet}55`} stroke={C.violet} />
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={430} y1={50 + i * 28} x2={470} y2={64 + i * 28} stroke={C.rebar} strokeWidth={1.5} />)}
        <path d={sinePath(30, 428, 80, () => 22, 130, ph)} stroke={C.cyan} strokeWidth={3} fill="none" />
        <path d={sinePath(472, 870, 80, () => 13, 130, ph)} stroke={C.cyan} strokeWidth={3} fill="none" />
        <path d={sinePath(30, 428, 160, () => 22, 44, ph * 1.6)} stroke={C.magenta} strokeWidth={3} fill="none" />
        <path d={sinePath(472, 870, 160, () => 5, 44, ph * 1.6)} stroke={C.magenta} strokeWidth={3} fill="none" opacity={0.8} />
        <text x={30} y={50} fill={C.cyan} fontFamily="Manrope" fontWeight={600} fontSize={20} letterSpacing={2}>FREKUENSI RENDAH</text>
        <text x={30} y={132} fill={C.magenta} fontFamily="Manrope" fontWeight={600} fontSize={20} letterSpacing={2}>FREKUENSI TINGGI</text>
        <text x={870} y={132} textAnchor="end" fill={C.hud} fontFamily="Manrope" fontWeight={500} fontSize={18} letterSpacing={2}>LEBIH LEMAH</text>
      </Panel>,
    );
  }
  // REVEAL basement: signal level sinks into the noise band (no numbers)
  const oN = win(t, s(7) + 0.4, e(7) + 0.2);
  if (oN > 0.01) {
    const p = ramp(t, s(7) + 0.6, e(7) - 0.6);
    const xs = 40 + p * 820;
    let noise = "";
    for (let x = 40; x <= 860; x += 6) noise += `${x === 40 ? "M" : "L"}${x},${168 - hash(x + Math.floor(t * 15) * 31) * 26} `;
    let sig = "";
    for (let x = 40; x <= xs; x += 6) {
      const u = (x - 40) / 820;
      sig += `${x === 40 ? "M" : "L"}${x},${(56 + 100 * io(u) + (u > 0.8 ? (hash(x * 3.1 + Math.floor(t * 15)) - 0.5) * 18 : 0)).toFixed(1)} `;
    }
    out.push(
      <Panel key="noise" x={90} y={1060} w={900} h={210} k={k} o={oN} title="KUAT SINYAL MENUJU BASEMEN" color={C.magenta}>
        <path d={noise} stroke={C.magenta} strokeWidth={2} fill="none" opacity={0.7} />
        <text x={860} y={202} textAnchor="end" fill={C.magenta} fontFamily="Manrope" fontWeight={600} fontSize={18} letterSpacing={3}>DERAU</text>
        <path d={sig} stroke={C.cyan} strokeWidth={3.5} fill="none" />
        <circle cx={xs} cy={56 + 100 * io(p)} r={6} fill={C.cyan} />
        <text x={40} y={46} fill={C.cyan} fontFamily="Manrope" fontWeight={600} fontSize={18} letterSpacing={3}>SINYAL</text>
      </Panel>,
    );
  }
  // REVEAL 2: the phone is fine
  const oP = win(t, s(8) + 0.2, e(8));
  if (oP > 0.01) {
    out.push(
      <Panel key="phone" x={250} y={1080} w={580} h={140} k={k} o={oP} title="DIAGNOSIS" color={C.lime}>
        <text x={30} y={78} fill={C.lime} fontFamily="Manrope" fontWeight={600} fontSize={30} letterSpacing={2}>HP: NORMAL ✓</text>
        <text x={30} y={118} fill={C.magenta} fontFamily="Manrope" fontWeight={600} fontSize={24} letterSpacing={2} opacity={ramp(t, s(8) + 1.6, s(8) + 2.0)}>SINYAL: HABIS DI JALAN</text>
      </Panel>,
    );
  }
  // PAYOFF 3: phone status bar switches to Wi-Fi calling
  const oW = win(t, s(11) + 1.6, e(11) + 0.2);
  if (oW > 0.01) {
    const on = ramp(t, s(11) + 2.0, s(11) + 2.4);
    out.push(
      <Panel key="wifi" x={250} y={1080} w={580} h={140} k={k} o={oW} title="STATUS HP" color={C.cyan}>
        {[0, 1, 2, 3].map((b) => <rect key={b} x={30 + b * 20} y={110 - (b + 1) * 14} width={12} height={(b + 1) * 14} fill={b < 1 ? C.red : "none"} stroke={C.hud} strokeWidth={1.2} opacity={0.6} />)}
        <text x={140} y={108} fill={C.cyan} fontFamily="Manrope" fontWeight={600} fontSize={32} letterSpacing={2} opacity={on}>Wi-Fi</text>
        <text x={250} y={108} fill={C.hud} fontFamily="Manrope" fontWeight={500} fontSize={22} letterSpacing={2} opacity={on}>PANGGILAN AKTIF</text>
      </Panel>,
    );
  }
  return <>{out}</>;
};

// ---------------- karaoke captions ----------------
type Chunk = { words: Word[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const all: Chunk[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.:?!]$/.test(w.w);
      if ((punct && cur.length >= 2) || cur.length >= 5 || i === c.words.length - 1) {
        all.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
        cur = [];
      }
    });
  }
  return all;
})();

const Captions: React.FC<{ t: number; k: number; h: number }> = ({ t, k, h }) => {
  if (t > OUTRO_AT) return null;
  const idx = CHUNKS.findIndex((c, i) => t >= c.s - 0.08 && t < (CHUNKS[i + 1] ? Math.min(CHUNKS[i + 1].s - 0.08, c.e + 0.6) : c.e + 0.6));
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, bottom: 400 * k, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", padding: `${14 * k}px ${26 * k}px`, background: "rgba(4,6,13,0.78)", borderLeft: `${3 * k}px solid ${C.cyan}`, maxWidth: 900 * k }}>
        <div style={{ position: "absolute", right: -2 * k, top: -2 * k, width: 18 * k, height: 18 * k, borderTop: `${2 * k}px solid ${C.cyan}`, borderRight: `${2 * k}px solid ${C.cyan}` }} />
        <div style={{ fontFamily: "Manrope", fontWeight: 600, fontSize: 50 * k, lineHeight: 1.2, color: C.white, textAlign: "center" }}>
          {ch.words.map((w, i) => {
            const active = t >= w.s && t < w.e + 0.05;
            const done = t >= w.e;
            const b = clamp((t - w.s) / 0.14);
            const bounce = active ? 1 + 0.06 * Math.sin(b * Math.PI) : 1;
            return (
              <React.Fragment key={i}>
                <span style={{ display: "inline-block", padding: `0 ${4 * k}px`, transform: `translateY(${active ? -4 * k * Math.sin(b * Math.PI) : 0}px) scale(${bounce})`, color: active ? C.cyan : done ? C.white : "rgba(240,248,255,0.45)", textShadow: active ? `0 0 ${18 * k}px ${C.cyan}` : "none" }}>
                  {w.w}
                </span>{" "}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {void h}
    </div>
  );
};

const SectionTag: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const names: Record<string, string> = { HOOK: "SCAN // LIFT", KONTEKS: "01 // GELOMBANG RADIO", MEKANISME: "02 // MATERIAL", REVEAL: "03 // BASEMEN", PAYOFF: "04 // SOLUSI", OUTRO: "05 // KESIMPULAN" };
  const cur = Object.entries(SEC).find(([, [a, b]]) => t >= a - 0.3 && t < b + 0.6);
  if (!cur || t > OUTRO_AT) return null;
  const o = win(t, cur[1][0] - 0.3, cur[1][1] + 0.4, 0.3);
  return (
    <div style={{ position: "absolute", left: 72 * k, top: 196 * k, opacity: o, fontFamily: "Manrope", fontSize: 22 * k, fontWeight: 600, letterSpacing: 5 * k, color: C.lime }}>
      {names[cur[0]]}
    </div>
  );
};

// ---------------- film ----------------
export const Ep047Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const k = w / 1080;
  const t = frame / fps;
  const pose = poseAt(t);
  // hook glitch flash when the bars hit zero, and the closing question card
  const glitch = win(t, e(0) - 0.35, e(0) + 0.05, 0.08);
  const qO = win(t, s(12) + 0.2, OUTRO_AT, 0.3);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 35%, #0a1428 0%, ${C.void} 65%)`, fontFamily: MANROPE }}>
      <ThreeCanvas width={w} height={h} dpr={1} gl={{ antialias: true, alpha: true }} camera={{ fov: 42, near: 0.1, far: 220, position: [0, 5, 20] }}>
        <World t={t} frame={frame} pose={pose} w={w} h={h} k={k} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, transparent 54%, rgba(4,6,13,0.82) 72%, rgba(4,6,13,0.95) 100%)" }} />
      <AbsoluteFill style={{ background: C.red, opacity: 0.18 * glitch, mixBlendMode: "screen" }} />
      {TAGS.map((d, i) => <Tag key={i} d={d} t={t} pose={pose} w={w} h={h} k={k} />)}
      <Insets t={t} k={k} />
      <SectionTag t={t} k={k} />
      {t < e(0) + 0.6 && (
        <div style={{ position: "absolute", right: 72 * k, top: 196 * k, opacity: win(t, s(0) + 0.3, e(0) + 0.4, 0.2), fontFamily: "Manrope", fontWeight: 600, fontSize: 30 * k, letterSpacing: 4 * k, color: t > e(0) - 0.4 ? C.red : C.lime, textShadow: `0 0 ${16 * k}px currentColor` }}>
          {t > e(0) - 0.4 ? "TIDAK ADA LAYANAN" : "SINYAL TURUN…"}
        </div>
      )}
      {qO > 0.01 && (
        <div style={{ position: "absolute", left: 72 * k, right: 72 * k, top: 1000 * k, opacity: qO, fontFamily: "Manrope", fontWeight: 600, fontSize: 64 * k, lineHeight: 1.1, color: C.white, textShadow: `0 0 ${24 * k}px rgba(0,240,255,0.35)` }}>
          Sinyal tidak hilang,
          <br />
          <span style={{ color: C.magenta }}>ia tertahan dinding.</span>
        </div>
      )}
      <Captions t={t} k={k} h={h} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
