// EP047 cover — "Sinyal Hilang di Lift?" in CYBERFORGE.
// A cut-away hologram tower block: signal shells from a BTS mast hit the glass facade, weaken at the
// concrete partition, die inside the steel lift core and underground; a ceiling antenna re-radiates indoors.
// Deterministic: everything derives from useCurrentFrame(); hash() is a seeded pure function.

import React, { useLayoutEffect, useMemo } from "react";
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

const W = 1080;
const H = 1920;

const C = {
  void: "#04060d",
  cyan: "#00f0ff",
  cyanDim: "#0a6a7a",
  violet: "#8a2be2",
  lime: "#00ff88",
  magenta: "#ff0077",
  red: "#ff2a4a",
  amber: "#ffaa00",
  hud: "#d0f7ff",
  muted: "#5f7c99",
};

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- scene layout (world units) ----------
const B = { x0: -2.2, x1: 2.2, z0: -2.0, z1: 2.0, top: 9.0, base: -2.4 };
const FLOORS = [0, 1.8, 3.6, 5.4, 7.2, 9.0];
const PART_X = -0.6; // concrete partition
const CORE = { x0: 0.25, x1: 1.45, z0: -1.1, z1: 0.3 }; // steel lift shaft
const MAST = new THREE.Vector3(-17, 0, -17);
const MAST_H = 11.5;
const ANT = new THREE.Vector3(MAST.x, MAST_H - 0.6, MAST.z);
const DAS = new THREE.Vector3(1.75, 1.8 - 0.06, 1.15); // in-building ceiling antenna, floor 1 right room
const CAM = { pos: new THREE.Vector3(13, 9, 31), target: new THREE.Vector3(-3.4, 0.9, -2), fov: 36 };

// ---------- line batching ----------
type RGB = [number, number, number];
const rgb = (hex: string, k = 1): RGB => {
  const c = new THREE.Color(hex);
  return [c.r * k, c.g * k, c.b * k];
};
class Batch {
  pos: number[] = [];
  col: number[] = [];
  seg(a: THREE.Vector3 | number[], b: THREE.Vector3 | number[], ca: RGB, cb: RGB = ca) {
    const A = Array.isArray(a) ? a : [a.x, a.y, a.z];
    const Bv = Array.isArray(b) ? b : [b.x, b.y, b.z];
    this.pos.push(A[0], A[1], A[2], Bv[0], Bv[1], Bv[2]);
    this.col.push(...ca, ...cb);
  }
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: RGB, skip: string[] = []) {
    const e: [number[], number[], string][] = [
      [[x0, y0, z0], [x1, y0, z0], "b-z0"], [[x0, y0, z1], [x1, y0, z1], "b-z1"],
      [[x0, y0, z0], [x0, y0, z1], "b-x0"], [[x1, y0, z0], [x1, y0, z1], "b-x1"],
      [[x0, y1, z0], [x1, y1, z0], "t-z0"], [[x0, y1, z1], [x1, y1, z1], "t-z1"],
      [[x0, y1, z0], [x0, y1, z1], "t-x0"], [[x1, y1, z0], [x1, y1, z1], "t-x1"],
      [[x0, y0, z0], [x0, y1, z0], "v00"], [[x1, y0, z0], [x1, y1, z0], "v10"],
      [[x0, y0, z1], [x0, y1, z1], "v01"], [[x1, y0, z1], [x1, y1, z1], "v11"],
    ];
    for (const [a, b, k] of e) if (!skip.includes(k)) this.seg(a, b, c);
  }
  build(width: number, opacity = 1) {
    const g = new LineSegmentsGeometry();
    g.setPositions(this.pos);
    g.setColors(this.col);
    const m = new LineMaterial({
      color: 0xffffff,
      linewidth: width,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    m.resolution.set(W, H);
    const l = new LineSegments2(g, m);
    l.computeLineDistances();
    l.frustumCulled = false;
    return l;
  }
}

// ---------- signal attenuation model (visual, qualitative) ----------
const inFootprint = (p: THREE.Vector3) => p.z > B.z0 && p.z < B.z1 && p.y < B.top && p.y > B.base;
const attenuation = (p: THREE.Vector3) => {
  let a = 1;
  if (p.y < 0) a *= 0.1; // soil + basement retaining wall
  if (inFootprint(p) || (p.x > B.x1 && p.z > B.z0 && p.z < B.z1 && p.y < B.top)) {
    if (p.x > B.x0) a *= 0.72; // glass facade: small loss
    if (p.x > PART_X) a *= 0.42; // concrete partition: big loss
    const inCoreZ = p.z > CORE.z0 && p.z < CORE.z1;
    if (inCoreZ && p.x > CORE.x0 && p.x < CORE.x1) a *= 0.08; // inside steel lift shaft
    if (inCoreZ && p.x >= CORE.x1) a *= 0.18; // shadow behind the shaft
  }
  return a;
};
const waveColor = (a: number, k: number): RGB => {
  const cy = new THREE.Color(C.cyan);
  const mg = new THREE.Color(C.magenta);
  const t = clamp((0.75 - a) / 0.6);
  const c = cy.lerp(mg, t);
  const s = k * (0.15 + 0.85 * a);
  return [c.r * s, c.g * s, c.b * s];
};

const buildWaves = (phase: number) => {
  const strong = new Batch();
  const shards = new Batch();
  const dir = new THREE.Vector3(0, 3.6, 0).sub(ANT).normalize();
  const u = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(u, dir).normalize();
  const shell = (r: number, th: number, ph: number) =>
    ANT.clone()
      .addScaledVector(dir, r * Math.cos(th))
      .addScaledVector(u, r * Math.sin(th) * Math.cos(ph))
      .addScaledVector(v, r * Math.sin(th) * Math.sin(ph));
  const N = 8;
  for (let k = 0; k < N; k++) {
    const r = 4.2 + k * 2.35 + phase * 2.35;
    const fade = clamp(1 - (r - 4) / 26) * clamp((r - 3.5) / 2);
    const thMax = 0.62;
    const rings = [0.2, 0.44];
    const segs = 72;
    // constant-theta rings (the visible "cincin")
    rings.forEach((th, ri) => {
      if (th > thMax) return;
      for (let i = 0; i < segs; i++) {
        const p0 = shell(r, th, (i / segs) * Math.PI * 2);
        const p1 = shell(r, th, ((i + 1) / segs) * Math.PI * 2);
        const mid = p0.clone().add(p1).multiplyScalar(0.5);
        const a = attenuation(mid);
        const seed = k * 1000 + ri * 100 + i;
        if (a < 0.9 && hash(seed) > 0.25 + 0.75 * a) continue; // broken wave
        const jit = a < 0.5 ? (hash(seed + 7) - 0.5) * 0.35 : 0;
        const q0 = p0.clone().addScaledVector(dir, jit);
        const q1 = p1.clone().addScaledVector(dir, jit);
        const col = waveColor(a, fade * (ri === 1 ? 0.75 : 0.55));
        (a > 0.6 ? strong : shards).seg(q0, q1, col);
      }
    });
    // sparse meridians give the shell volume
    for (let m = 0; m < 6; m++) {
      const ph = (m / 6) * Math.PI * 2;
      const steps = 10;
      for (let s = 0; s < steps; s++) {
        const t0 = (s / steps) * thMax;
        const t1 = ((s + 1) / steps) * thMax;
        const p0 = shell(r, t0, ph);
        const p1 = shell(r, t1, ph);
        const a = attenuation(p0.clone().add(p1).multiplyScalar(0.5));
        if (a < 0.9 && hash(k * 777 + m * 31 + s) > 0.2 + 0.8 * a) continue;
        shards.seg(p0, p1, waveColor(a, fade * 0.22));
      }
    }
    // impact traces where the shell meets each wall (glass, concrete, steel)
    const walls: { x: number; col: string; k: number; z0: number; z1: number; y0: number; y1: number }[] = [
      { x: B.x0, col: C.cyan, k: 1.6, z0: B.z0, z1: B.z1, y0: 0, y1: B.top },
      { x: PART_X, col: C.magenta, k: 0.9, z0: B.z0, z1: B.z1, y0: 0, y1: B.top },
      { x: CORE.x0, col: C.amber, k: 0.8, z0: CORE.z0, z1: CORE.z1, y0: B.base, y1: B.top },
    ];
    for (const w of walls) {
      const dx = w.x - ANT.x;
      if (r <= Math.abs(dx)) continue;
      const rr = Math.sqrt(r * r - dx * dx);
      const n = 96;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        const p0 = new THREE.Vector3(w.x, ANT.y + rr * Math.sin(a0), ANT.z + rr * Math.cos(a0));
        const p1 = new THREE.Vector3(w.x, ANT.y + rr * Math.sin(a1), ANT.z + rr * Math.cos(a1));
        const inside = (p: THREE.Vector3) => p.z > w.z0 && p.z < w.z1 && p.y > w.y0 && p.y < w.y1;
        if (!inside(p0) || !inside(p1)) continue;
        const a = attenuation(new THREE.Vector3(w.x - 0.01, p0.y, p0.z));
        strong.seg(p0, p1, rgb(w.col, w.k * fade * (0.35 + 0.65 * a)));
      }
    }
  }
  return { strong: strong.build(2.2), shards: shards.build(1.4) };
};

// ---------- static structure ----------
const buildStructure = () => {
  const hi = new Batch(); // key edges
  const lo = new Batch(); // detail
  const frame = rgb(C.cyan, 0.85);
  const dim = rgb(C.cyanDim, 0.9);
  const glass = rgb(C.cyan, 0.42);
  const conc = rgb(C.violet, 0.75);
  const steel = rgb(C.amber, 0.85);

  // floor slabs (cut open at the front z1 and right x1 faces -> magenta cut edges)
  for (const y of FLOORS) {
    const t = 0.16;
    hi.seg([B.x0, y, B.z0], [B.x1, y, B.z0], frame);
    hi.seg([B.x0, y, B.z0], [B.x0, y, B.z1], frame);
    hi.seg([B.x0, y, B.z1], [B.x1, y, B.z1], rgb(C.magenta, 0.9));
    hi.seg([B.x0, y - t, B.z1], [B.x1, y - t, B.z1], rgb(C.magenta, 0.55));
    hi.seg([B.x1, y, B.z0], [B.x1, y, B.z1], rgb(C.magenta, 0.9));
    hi.seg([B.x1, y - t, B.z0], [B.x1, y - t, B.z1], rgb(C.magenta, 0.55));
    // slab hatch on the cut
    for (let x = B.x0; x < B.x1; x += 0.22) lo.seg([x, y - t, B.z1], [x + 0.14, y, B.z1], rgb(C.magenta, 0.3));
    // ceiling grid dim
    for (let x = B.x0 + 0.55; x < B.x1; x += 0.55) lo.seg([x, y, B.z0], [x, y, B.z1], rgb(C.cyanDim, 0.35));
  }
  // basement slab + walls
  hi.seg([B.x0, B.base, B.z0], [B.x1, B.base, B.z0], conc);
  hi.seg([B.x0, B.base, B.z0], [B.x0, B.base, B.z1], conc);
  hi.seg([B.x0, B.base, B.z1], [B.x1, B.base, B.z1], rgb(C.magenta, 0.9));
  hi.seg([B.x1, B.base, B.z0], [B.x1, B.base, B.z1], rgb(C.magenta, 0.9));
  // columns
  for (const [x, z] of [[B.x0, B.z0], [B.x1, B.z0], [B.x0, B.z1], [B.x1, B.z1]]) hi.seg([x, B.base, z], [x, B.top, z], frame);
  // roof parapet + rooftop plant
  hi.box(-1.6, B.top, -1.4, -0.2, B.top + 0.7, 0.2, dim);
  hi.seg([B.x0, B.top + 0.35, B.z0], [B.x1, B.top + 0.35, B.z0], dim);

  // glass curtain wall facing the mast (x0): mullions
  for (let z = B.z0; z <= B.z1 + 1e-6; z += 0.5) lo.seg([B.x0, 0, z], [B.x0, B.top, z], glass);
  for (const y of FLOORS) for (const dy of [0.9]) if (y + dy < B.top) lo.seg([B.x0, y + dy, B.z0], [B.x0, y + dy, B.z1], glass);
  // back wall (z0) concrete hatch
  for (let x = B.x0; x < B.x1; x += 0.35)
    for (const y of FLOORS.slice(0, -1)) lo.seg([x, y, B.z0], [Math.min(x + 0.5, B.x1), y + 0.6, B.z0], rgb(C.violet, 0.28));

  // concrete partition at PART_X, full height, hatched
  for (const y of FLOORS.slice(0, -1)) {
    hi.box(PART_X - 0.12, y, B.z0, PART_X + 0.12, y + 1.8 - 0.16, B.z1 - 0.01, conc, ["b-z0", "t-z0", "v00", "v10"]);
    for (let s = 0; s < 9; s++) {
      const y0 = y + s * 0.2;
      if (y0 + 0.2 > y + 1.64) break;
      lo.seg([PART_X + 0.12, y0, B.z1 - 0.01], [PART_X - 0.12, y0 + 0.2, B.z1 - 0.01], rgb(C.violet, 0.6));
    }
    // doorway gap marker
  }

  // steel lift shaft (basement to roof) with X bracing
  hi.box(CORE.x0, B.base, CORE.z0, CORE.x1, B.top + 0.9, CORE.z1, steel);
  const levels = [B.base, ...FLOORS, B.top + 0.9];
  for (let i = 0; i < levels.length - 1; i++) {
    const y0 = levels[i];
    const y1 = levels[i + 1];
    lo.seg([CORE.x0, y0, CORE.z1], [CORE.x1, y1, CORE.z1], rgb(C.amber, 0.45));
    lo.seg([CORE.x1, y0, CORE.z1], [CORE.x0, y1, CORE.z1], rgb(C.amber, 0.45));
    lo.seg([CORE.x1, y0, CORE.z0], [CORE.x1, y1, CORE.z1], rgb(C.amber, 0.35));
    lo.seg([CORE.x1, y1, CORE.z0], [CORE.x1, y0, CORE.z1], rgb(C.amber, 0.35));
    hi.seg([CORE.x0, y0, CORE.z1], [CORE.x1, y0, CORE.z1], steel);
  }
  // lift cabin inside shaft at floor 3 + cables
  const cab = { y0: 3.75, y1: 5.15 };
  hi.box(CORE.x0 + 0.12, cab.y0, CORE.z0 + 0.12, CORE.x1 - 0.12, cab.y1, CORE.z1 - 0.12, rgb(C.red, 1.1));
  hi.seg([0.85, cab.y1, -0.4], [0.85, B.top + 0.9, -0.4], rgb(C.amber, 0.6));
  hi.seg([0.7, cab.y1, -0.4], [0.7, B.top + 0.9, -0.4], rgb(C.amber, 0.4));

  // basement car (simple wireframe silhouette)
  const car = (x: number, z: number) => {
    lo.box(x - 0.75, -2.4, z - 0.35, x + 0.75, -1.95, z + 0.35, rgb(C.cyan, 0.5));
    lo.box(x - 0.42, -1.95, z - 0.32, x + 0.38, -1.65, z + 0.32, rgb(C.cyan, 0.45));
  };
  car(-1.2, 1.0);
  car(-1.2, -1.0);

  // ceiling antenna (DAS) disc
  const n = 24;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    hi.seg([DAS.x + 0.22 * Math.cos(a0), DAS.y, DAS.z + 0.22 * Math.sin(a0)], [DAS.x + 0.22 * Math.cos(a1), DAS.y, DAS.z + 0.22 * Math.sin(a1)], rgb(C.lime, 2));
  }
  hi.seg([DAS.x, DAS.y, DAS.z], [DAS.x, DAS.y - 0.14, DAS.z], rgb(C.lime, 2));

  // soil section on the front cut plane around the basement
  const soil = rgb(C.violet, 0.5);
  for (const [xa, xb] of [[-5.2, B.x0], [B.x1, 5.2]]) {
    for (let x = xa; x < xb; x += 0.3) lo.seg([x, B.base - 0.6, B.z1], [Math.min(x + 0.6, xb), 0, B.z1], soil);
    hi.seg([xa, 0, B.z1], [xb, 0, B.z1], rgb(C.violet, 0.9));
    hi.seg([xa, B.base - 0.6, B.z1], [xb, B.base - 0.6, B.z1], rgb(C.violet, 0.55));
  }
  hi.seg([B.x0, B.base - 0.6, B.z1], [B.x1, B.base - 0.6, B.z1], rgb(C.violet, 0.55));

  // BTS lattice mast
  const legs = 4;
  const sec = 9;
  const halfW = (y: number) => mix(1.3, 0.32, y / MAST_H);
  const corner = (y: number, i: number) => {
    const w = halfW(y);
    const s = [[-1, -1], [1, -1], [1, 1], [-1, 1]][i];
    return [MAST.x + s[0] * w, y, MAST.z + s[1] * w];
  };
  for (let i = 0; i < legs; i++) hi.seg(corner(0, i), corner(MAST_H, i), rgb(C.cyan, 0.9));
  for (let s = 0; s < sec; s++) {
    const y0 = (s / sec) * MAST_H;
    const y1 = ((s + 1) / sec) * MAST_H;
    for (let i = 0; i < legs; i++) {
      const j = (i + 1) % legs;
      lo.seg(corner(y0, i), corner(y1, j), rgb(C.cyan, 0.45));
      lo.seg(corner(y0, j), corner(y1, i), rgb(C.cyan, 0.45));
      lo.seg(corner(y1, i), corner(y1, j), rgb(C.cyan, 0.6));
    }
  }
  // sector panel antennas (3 sectors) + platform
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    const cx = MAST.x + Math.cos(a) * 0.75;
    const cz = MAST.z + Math.sin(a) * 0.75;
    const tx = -Math.sin(a) * 0.18;
    const tz = Math.cos(a) * 0.18;
    hi.box(Math.min(cx - tx, cx + tx), MAST_H - 1.4, Math.min(cz - tz, cz + tz), Math.max(cx - tx, cx + tx) + 0.05, MAST_H - 0.1, Math.max(cz - tz, cz + tz) + 0.05, rgb(C.cyan, 1.6));
  }
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2;
    const a1 = ((i + 1) / 24) * Math.PI * 2;
    hi.seg([MAST.x + Math.cos(a0) * 0.85, MAST_H - 1.5, MAST.z + Math.sin(a0) * 0.85], [MAST.x + Math.cos(a1) * 0.85, MAST_H - 1.5, MAST.z + Math.sin(a1) * 0.85], rgb(C.cyan, 0.8));
  }
  hi.seg([MAST.x, MAST_H, MAST.z], [MAST.x, MAST_H + 1.2, MAST.z], rgb(C.cyan, 0.9));

  // distant skyline (background plane)
  const far = new Batch();
  for (let i = 0; i < 16; i++) {
    const x = -34 + i * 4.6 + hash(i) * 2;
    const z = -30 - hash(i + 40) * 10;
    const h = 3 + hash(i + 80) * 11;
    const w = 1.2 + hash(i + 120) * 1.6;
    far.box(x - w, 0, z - w, x + w, h, z + w, rgb(C.violet, 0.32));
    for (let y = 1; y < h; y += 1.1) far.seg([x - w, y, z + w], [x + w, y, z + w], rgb(C.violet, 0.14));
  }

  // ground grid with a hole for the building + fade with distance
  const grid = new Batch();
  const S = 34;
  const step = 1.2;
  const hole = (x: number, z: number) => x > -5.2 && x < 5.2 && z > B.z0 - 0.4 && z < B.z1 + 0.01;
  for (let gx = -S; gx < S; gx += step)
    for (let gz = -S; gz < S; gz += step) {
      if (hole(gx + step / 2, gz + step / 2)) continue;
      const d = Math.hypot(gx, gz);
      const k = clamp(1 - d / S) * 0.7;
      const c = rgb(C.cyanDim, k);
      if (!hole(gx + step / 2, gz)) grid.seg([gx, 0, gz], [gx + step, 0, gz], c);
      if (!hole(gx, gz + step / 2)) grid.seg([gx, 0, gz], [gx, 0, gz + step], c);
    }

  return { hi: hi.build(2.2), lo: lo.build(1.2), far: far.build(1.1), grid: grid.build(1.0) };
};

// DAS re-radiation: downward hemispherical rings in lime, contained in the room
const buildDas = (phase: number) => {
  const b = new Batch();
  for (let k = 0; k < 4; k++) {
    const r = 0.35 + (k + phase) * 0.42;
    const fade = clamp(1 - r / 2.1);
    for (const el of [0.25, 0.6, 1.0]) {
      const n = 48;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        const rr = r * Math.cos(el * 0.9);
        const y = DAS.y - r * Math.sin(el * 0.9);
        const p0 = [DAS.x + rr * Math.cos(a0), y, DAS.z + rr * Math.sin(a0)];
        const p1 = [DAS.x + rr * Math.cos(a1), y, DAS.z + rr * Math.sin(a1)];
        const ok = (p: number[]) => p[0] > CORE.x1 - 0.05 && p[0] < B.x1 + 0.3 && p[1] > 0.02 && p[2] > B.z0 && p[2] < B.z1 + 0.3;
        if (!ok(p0) || !ok(p1)) continue;
        b.seg(p0, p1, rgb(C.lime, 1.6 * fade));
      }
    }
  }
  return b.build(2.2);
};

// ---------- signal bar badges (billboarded toward the camera) ----------
const Bars: React.FC<{ at: [number, number, number]; level: number; color: string; scale?: number }> = ({ at, level, color, scale = 1 }) => {
  const quat = useMemo(() => {
    const m = new THREE.Matrix4().lookAt(CAM.pos, new THREE.Vector3(...at), new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, [at]);
  const bars = [0.2, 0.36, 0.52, 0.68];
  return (
    <group position={at} quaternion={quat} scale={scale}>
      <mesh position={[0, 0.3, -0.02]}>
        <planeGeometry args={[1.25, 0.95]} />
        <meshBasicMaterial color="#020409" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <lineSegments position={[0, 0.3, -0.01]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.25, 0.95)]} />
        <lineBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
      </lineSegments>
      {bars.map((h, i) => {
        const on = i < level;
        const x = -0.39 + i * 0.22;
        return (
          <group key={i} position={[x, -0.05 + h / 2, 0]}>
            <mesh>
              <planeGeometry args={[0.14, h]} />
              <meshBasicMaterial color={color} transparent opacity={on ? 1 : 0.12} toneMapped={false} depthWrite={false} />
            </mesh>
            {!on && (
              <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(0.14, h)]} />
                <lineBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
              </lineSegments>
            )}
          </group>
        );
      })}
      {level === 0 && (
        <mesh position={[0.4, 0.62, 0.01]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.07, 0.34]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      )}
      {level === 0 && (
        <mesh position={[0.4, 0.62, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
          <planeGeometry args={[0.07, 0.34]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

// ---------- camera + finishing ----------
const Rig: React.FC<{ f: number }> = ({ f }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const drift = Math.sin(f * 0.01) * 0.15;
    cam.position.set(CAM.pos.x + drift, CAM.pos.y, CAM.pos.z);
    cam.lookAt(CAM.target);
    cam.fov = CAM.fov;
    cam.near = 0.1;
    cam.far = 200;
    cam.updateProjectionMatrix();
    gl.toneMapping = THREE.NoToneMapping;
  }, [camera, gl, f]);
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

const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < 600; i++) p.push((hash(i) - 0.5) * 120, 4 + hash(i + 900) * 60, -45 - hash(i + 1800) * 30);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color={C.cyan} size={1.6} sizeAttenuation={false} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const s = useMemo(buildStructure, []);
  const phase = (f / 60) * 0.5 % 1;
  const waves = useMemo(() => buildWaves(phase), [phase]);
  const das = useMemo(() => buildDas(phase), [phase]);
  return (
    <>
      <Rig f={f} />
      <Stars />
      <primitive object={s.far} />
      <primitive object={s.grid} />
      <primitive object={s.lo} />
      <primitive object={s.hi} />
      <primitive object={waves.shards} />
      <primitive object={waves.strong} />
      <primitive object={das} />
      {/* glass facade faint fill */}
      <mesh position={[B.x0, B.top / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[B.z1 - B.z0, B.top]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      {/* steel core faint fill */}
      <mesh position={[(CORE.x0 + CORE.x1) / 2, (B.base + B.top + 0.9) / 2, (CORE.z0 + CORE.z1) / 2]}>
        <boxGeometry args={[CORE.x1 - CORE.x0, B.top + 0.9 - B.base, CORE.z1 - CORE.z0]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.04} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      {/* basement soil darkness */}
      <mesh position={[0, (B.base - 0.6) / 2, B.z1 - 0.02]}>
        <planeGeometry args={[10.4, -(B.base - 0.6)]} />
        <meshBasicMaterial color={C.violet} transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* mast beacon + DAS glow */}
      <mesh position={[MAST.x, MAST_H + 1.25, MAST.z]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={C.red} toneMapped={false} />
      </mesh>
      <mesh position={[DAS.x, DAS.y - 0.08, DAS.z]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={C.lime} toneMapped={false} />
      </mesh>
      {/* status badges */}
      <Bars at={[B.x0 + 0.75, 7.2 + 0.55, 1.35]} level={4} color={C.lime} scale={0.9} />
      <Bars at={[0.85, 3.85, CORE.z1 + 0.6]} level={0} color={C.red} scale={0.9} />
      <Bars at={[0.55, -1.75, 1.35]} level={0} color={C.red} scale={0.9} />
      <Bars at={[1.75, 0.3, 1.45]} level={4} color={C.lime} scale={0.7} />
      <Finish />
    </>
  );
};

// ---------- screen-space overlay ----------
const project = (p: [number, number, number]) => {
  const cam = new THREE.PerspectiveCamera(CAM.fov, W / H, 0.1, 200);
  cam.position.copy(CAM.pos);
  cam.lookAt(CAM.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
};

// Callout: anchor dot -> elbow (ex, ey) -> horizontal rule of length len (sign = direction); text sits on the rule.
const Tag: React.FC<{ at: [number, number, number]; ex: number; ey: number; len: number; color: string; label: string; sub: string }> = ({ at, ex, ey, len, color, label, sub }) => {
  const a = project(at);
  const x0 = Math.min(ex, ex + len);
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={`${a.x},${a.y} ${ex},${ey} ${ex + len},${ey}`} fill="none" stroke={color} strokeWidth={2} opacity={0.9} />
        <circle cx={a.x} cy={a.y} r={7} fill="none" stroke={color} strokeWidth={2.5} />
        <circle cx={a.x} cy={a.y} r={2.5} fill={color} />
      </svg>
      <div style={{ position: "absolute", left: x0, width: Math.abs(len), bottom: H - ey + 6, textAlign: len < 0 ? "right" : "left", fontFamily: "Manrope" }}>
        <div style={{ display: "inline-block", padding: "2px 8px", background: "rgba(4,6,13,0.72)", fontSize: 28, fontWeight: 600, letterSpacing: 3, color, textShadow: `0 0 14px ${color}` }}>{label}</div>
      </div>
      <div style={{ position: "absolute", left: x0, width: Math.abs(len), top: ey + 8, textAlign: len < 0 ? "right" : "left", fontFamily: "Manrope", fontSize: 19, fontWeight: 500, letterSpacing: 2, color: C.hud, opacity: 0.9 }}>
        <span style={{ padding: "2px 8px", background: "rgba(4,6,13,0.72)" }}>{sub}</span>
      </div>
    </>
  );
};

const Corner: React.FC<{ x: number; y: number; sx: number; sy: number }> = ({ x, y, sx, sy }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 44, height: 44, borderLeft: sx > 0 ? `3px solid ${C.cyan}` : undefined, borderRight: sx < 0 ? `3px solid ${C.cyan}` : undefined, borderTop: sy > 0 ? `3px solid ${C.cyan}` : undefined, borderBottom: sy < 0 ? `3px solid ${C.cyan}` : undefined, opacity: 0.8 }} />
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", fontFamily: MANROPE }}>
    <Corner x={48} y={150} sx={1} sy={1} />
    <Corner x={W - 92} y={150} sx={-1} sy={1} />
    <div style={{ position: "absolute", right: 72, top: 196, textAlign: "right", fontFamily: "Manrope", fontSize: 24, fontWeight: 600, letterSpacing: 5, color: C.lime }}>
      
    </div>
    <Tag at={[B.x0 + 0.75, 7.75, 1.35]} ex={400} ey={610} len={-340} color={C.cyan} label="JENDELA" sub="SINYAL MASIH KUAT" />
    <Tag at={[PART_X, 2.4, 1.7]} ex={400} ey={880} len={-340} color={C.magenta} label="BETON" sub="GELOMBANG PECAH" />
    <Tag at={[CORE.x1, 8.2, CORE.z1]} ex={1000} ey={300} len={-280} color={C.amber} label="LIFT BAJA" sub="SINYAL MATI" />
    <Tag at={[DAS.x + 0.1, DAS.y - 0.1, DAS.z]} ex={420} ey={1190} len={-360} color={C.lime} label="ANTENA PLAFON" sub="SOLUSI DI DALAM" />
    {/* title block (inside the 380 px bottom safe area) */}
    <div style={{ position: "absolute", left: 72, right: 72, top: 1300, fontFamily: "Manrope" }}>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 8, color: C.cyan }}>AUDIRA EXPLAINED</div>
      <div style={{ fontSize: 118, fontWeight: 600, lineHeight: 1.0, letterSpacing: -2, color: "#f0f8ff", marginTop: 14, textShadow: "0 0 30px rgba(0,240,255,0.35)" }}>
        Sinyal Hilang
        <br />
        di <span style={{ color: C.magenta, textShadow: `0 0 30px ${C.magenta}` }}>Lift?</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep047Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 35%, #0a1428 0%, ${C.void} 65%)` }}>
      <ThreeCanvas width={W} height={H} dpr={1} gl={{ antialias: true, alpha: true }} camera={{ fov: CAM.fov, near: 0.1, far: 200, position: [CAM.pos.x, CAM.pos.y, CAM.pos.z] }}>
        <World f={f} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, transparent 62%, rgba(4,6,13,0.85) 74%, rgba(4,6,13,0.95) 100%)" }} />
      <Overlay />
    </AbsoluteFill>
  );
};
