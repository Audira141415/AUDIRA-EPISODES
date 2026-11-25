// Procedural crochet surfaces. No photo textures; every canvas is seeded and cached.
//
// stitchTextures(): a 4 x 4 tile of single-crochet stitches. Each stitch is a "V" of two plump
// yarn legs with a ply twist, meeting at the bottom, with dark holes between stitches. Returns a
// grey colour map (multiplied by the yarn colour), a normal map and a height map (displacement), so
// stitches read up close in light AND in silhouette. One tile = 4 stitches across, 4 rounds up:
// set texture.repeat = (stitchesPerRound / 4, rounds / 4).
//
// fibreAlpha(): short curly hairs for the fuzz shells. plyTexture(): twisted ply stripes along a
// strand (u = along). laceAlpha(): a round crocheted doily (alpha). woundTexture(): yarn wound on a ball.

import * as THREE from "three";

const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const vx = bx - ax, vy = by - ay;
  const k = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  const dx = px - (ax + vx * k), dy = py - (ay + vy * k);
  return { d: Math.hypot(dx, dy), k, side: (px - ax) * vy - (py - ay) * vx };
};

export type StitchTex = { map: THREE.CanvasTexture; normal: THREE.CanvasTexture; height: THREE.CanvasTexture };
let stitchCache: StitchTex | null = null;

/** Height of one stitch cell at (x, y) in [0,1]^2, canvas y down (the V points down). */
function stitchHeight(x: number, y: number, jx: number, jy: number): { h: number; ply: number } {
  // two legs: a shared bottom point, tops leaning outward
  const bx = 0.5 + jx, by = 0.86 + jy;
  const L = segDist(x, y, bx - 0.035, by, 0.17 + jx, 0.13 + jy);
  const R = segDist(x, y, bx + 0.035, by, 0.83 + jx, 0.13 + jy);
  const rw = 0.2;
  let h = 0, ply = 0;
  for (const s of [L, R]) {
    const taper = rw * (0.82 + 0.18 * Math.sin(s.k * Math.PI));
    const q = s.d / taper;
    if (q < 1) {
      const hh = Math.sqrt(1 - q * q) * (0.85 + 0.15 * Math.sin(s.k * Math.PI));
      if (hh > h) {
        h = hh;
        // ply twist: diagonal stripes across the leg
        ply = Math.sin((s.k * 5.5 + (s.side > 0 ? 1 : -1) * q * 0.9) * Math.PI * 2);
      }
    }
  }
  // the back bar between rounds (lower, peeks through the holes)
  const bar = Math.max(0, 1 - Math.abs(y - 0.02) / 0.09) * 0.38 + Math.max(0, 1 - Math.abs(y - 1.02) / 0.09) * 0.38;
  if (bar > h) {
    h = bar;
    ply = Math.sin(x * Math.PI * 2 * 3.0);
  }
  return { h, ply };
}

export function stitchTextures(size = 512): StitchTex {
  if (stitchCache) return stitchCache;
  const N = 4, cell = size / N;
  const H = new Float32Array(size * size);
  const P = new Float32Array(size * size);
  const V = new Float32Array(N * N);
  for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++) V[cy * N + cx] = hash(cx, cy, 3);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const cx = Math.floor(i / cell), cy = Math.floor(j / cell);
      const jx = (hash(cx, cy, 11) - 0.5) * 0.05, jy = (hash(cx, cy, 17) - 0.5) * 0.04;
      const x = (i % cell) / cell, y = (j % cell) / cell;
      const s = stitchHeight(x, y, jx, jy);
      const fib = hash(i, j, 5) * 0.06; // fibre noise on the yarn
      H[j * size + i] = Math.max(0, s.h * (0.93 + 0.07 * s.ply) + (s.h > 0.05 ? fib : 0));
      P[j * size + i] = s.ply;
    }
  }
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    return c;
  };
  const cMap = mk(), cNor = mk(), cH = mk();
  const gMap = cMap.getContext("2d")!, gNor = cNor.getContext("2d")!, gH = cH.getContext("2d")!;
  const iMap = gMap.createImageData(size, size), iNor = gNor.createImageData(size, size), iH = gH.createImageData(size, size);
  const at = (i: number, j: number) => H[((j + size) % size) * size + ((i + size) % size)];
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const o = (j * size + i) * 4;
      const h = H[j * size + i];
      const cx = Math.floor(i / cell), cy = Math.floor(j / cell);
      const vary = 0.94 + V[cy * N + cx] * 0.1;
      // crowns bright, ply grooves and holes dark (cavity occlusion)
      const k = (0.22 + 0.78 * Math.pow(Math.min(1, h), 0.55)) * (0.9 + 0.1 * P[j * size + i]) * vary;
      const g = Math.max(0, Math.min(255, k * 255));
      iMap.data[o] = iMap.data[o + 1] = iMap.data[o + 2] = g;
      iMap.data[o + 3] = 255;
      const dx = (at(i + 1, j) - at(i - 1, j)) * 3.2;
      const dy = (at(i, j + 1) - at(i, j - 1)) * 3.2;
      const len = Math.hypot(dx, dy, 1);
      iNor.data[o] = ((-dx / len) * 0.5 + 0.5) * 255;
      iNor.data[o + 1] = ((dy / len) * 0.5 + 0.5) * 255; // canvas y is down, uv v is up
      iNor.data[o + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      iNor.data[o + 3] = 255;
      iH.data[o] = iH.data[o + 1] = iH.data[o + 2] = Math.min(255, h * 255);
      iH.data[o + 3] = 255;
    }
  }
  gMap.putImageData(iMap, 0, 0);
  gNor.putImageData(iNor, 0, 0);
  gH.putImageData(iH, 0, 0);
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  };
  stitchCache = { map: tex(cMap, true), normal: tex(cNor, false), height: tex(cH, false) };
  return stitchCache;
}

let fibreCache: THREE.CanvasTexture | null = null;
/** Short curly fibres (white on black) for alpha-tested fuzz shells. */
export function fibreAlpha(size = 512) {
  if (fibreCache) return fibreCache;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, size, size);
  const r = mulberry32(7501);
  for (let i = 0; i < 2600; i++) {
    const x = r() * size, y = r() * size, a = r() * Math.PI * 2, l = 5 + r() * 12;
    g.strokeStyle = `rgba(255,255,255,${0.7 + r() * 0.3})`;
    g.lineWidth = 0.8 + r() * 0.7;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.9) * l * 0.6, y + Math.sin(a + 0.9) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  fibreCache = t;
  return t;
}

let plyCache: { map: THREE.CanvasTexture; normal: THREE.CanvasTexture } | null = null;
/** Twisted ply along a strand: u runs along the yarn, v around it. */
export function plyTexture(size = 256) {
  if (plyCache) return plyCache;
  const c = document.createElement("canvas"), n = document.createElement("canvas");
  c.width = c.height = n.width = n.height = size;
  const g = c.getContext("2d")!, gn = n.getContext("2d")!;
  const im = g.createImageData(size, size), inn = gn.createImageData(size, size);
  const plies = 3;
  const hAt = (i: number, j: number) => {
    const u = i / size, v = j / size;
    const ph = (((u * 4 + v * plies) % 1) + 1) % 1; // 4 twists per tile along, plies around
    return Math.pow(Math.sin(ph * Math.PI), 0.7);
  };
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const o = (j * size + i) * 4;
      const h = hAt(i, j);
      const k = (0.45 + 0.55 * h) * (0.95 + hash(i, j, 9) * 0.1);
      im.data[o] = im.data[o + 1] = im.data[o + 2] = k * 255;
      im.data[o + 3] = 255;
      const dx = (hAt(i + 1, j) - hAt(i - 1, j)) * 2.5, dy = (hAt(i, j + 1) - hAt(i, j - 1)) * 2.5;
      const len = Math.hypot(dx, dy, 1);
      inn.data[o] = ((-dx / len) * 0.5 + 0.5) * 255;
      inn.data[o + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      inn.data[o + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      inn.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  gn.putImageData(inn, 0, 0);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const normal = new THREE.CanvasTexture(n);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  plyCache = { map, normal };
  return plyCache;
}

let laceCache: THREE.CanvasTexture | null = null;
/** A round crocheted doily: rings of chain-space holes and a scalloped edge (white = yarn). */
export function laceAlpha(size = 1024) {
  if (laceCache) return laceCache;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const im = g.createImageData(size, size);
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const x = (i / size) * 2 - 1, y = (j / size) * 2 - 1;
      const r = Math.hypot(x, y), th = Math.atan2(y, x);
      const ring = Math.floor(r * 14);
      const fr = r * 14 - ring;
      const n = 6 + ring * 6;
      const fa = ((((th / (Math.PI * 2)) * n) % 1) + 1) % 1;
      // odd rings: chain-space holes; even rings: solid treble bands with thin slits
      let yarn = 1;
      if (ring % 2 === 1) {
        const dx = (fa - 0.5) * 2, dy = (fr - 0.5) * 2;
        if (dx * dx * 0.7 + dy * dy < 0.62) yarn = 0;
      } else if (ring > 0) {
        if (Math.abs(fa - 0.5) < 0.09 && fr > 0.2 && fr < 0.8) yarn = 0;
      }
      if (r < 0.06) yarn = 0;
      const edge = 0.94 + 0.04 * Math.abs(Math.cos(th * 18));
      if (r > edge) yarn = 0;
      const o = (j * size + i) * 4;
      im.data[o] = im.data[o + 1] = im.data[o + 2] = yarn * 255;
      im.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  laceCache = new THREE.CanvasTexture(c);
  return laceCache;
}

let woundCache: THREE.CanvasTexture | null = null;
/** Yarn wound round a ball: bands of parallel strands at a few crossing angles. */
export function woundTexture(size = 512) {
  if (woundCache) return woundCache;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#6e6e6e";
  g.fillRect(0, 0, size, size);
  const r = mulberry32(911);
  for (let b = 0; b < 14; b++) {
    const a = (r() - 0.5) * 1.6, cx = r() * size, cy = r() * size, w = 40 + r() * 70;
    g.save();
    g.translate(cx, cy);
    g.rotate(a);
    for (let s = -w; s < w; s += 7) {
      const v = 150 + r() * 80;
      g.strokeStyle = `rgb(${v},${v},${v})`;
      g.lineWidth = 5.5;
      g.beginPath();
      g.moveTo(-size, s);
      g.lineTo(size, s);
      g.stroke();
      g.strokeStyle = "rgba(40,40,40,0.5)";
      g.lineWidth = 1;
      for (let k = -size; k < size; k += 9) {
        g.beginPath();
        g.moveTo(k, s - 2.5);
        g.lineTo(k + 4, s + 2.5);
        g.stroke();
      }
    }
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  woundCache = t;
  return t;
}
