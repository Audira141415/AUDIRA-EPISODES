// EP01 film world data (same geography as the approved cover): smoke path Merauke -> Timika,
// fire clusters, seeded smoke puffs and hotspots. Copied from Cover.tsx (which must stay unchanged)
// and extended with per-puff path position `t` so the plume can clear and flow in again.
import { prng } from "../../core/materials/textures.ts";
import { heightAt, W } from "./terrain.ts";

export const TIMIKA: [number, number] = [136.89, -4.53];
export const MERAUKE: [number, number] = [140.4, -8.49];

export const PATH: [number, number][] = [
  [140.45, -8.45], [139.75, -7.95], [139.0, -7.25], [138.3, -6.45], [137.75, -5.6], [137.15, -5.0], [136.95, -4.68], [136.75, -4.45],
];
export const pathAt = (t: number): { lon: number; lat: number; nx: number; ny: number } => {
  const s = Math.min(PATH.length - 1.0001, Math.max(0, t * (PATH.length - 1)));
  const i = Math.floor(s), f = s - i;
  const [a, b] = [PATH[i], PATH[i + 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  return { lon: a[0] + dx * f, lat: a[1] + dy * f, nx: -dy / l, ny: dx / l };
};
const gauss = (r: () => number) => (r() + r() + r() - 1.5) / 1.5;

// fire clusters [lon, lat, spread, weight] (Merauke dominant; none near Mimika)
export const CLUSTERS: [number, number, number, number][] = [
  [140.25, -8.2, 0.45, 0.42], [139.45, -7.15, 0.35, 0.2], [140.3, -6.75, 0.35, 0.16], [138.75, -6.35, 0.3, 0.12], [140.8, -7.6, 0.3, 0.1],
];

export type Puff = { lon: number; lat: number; h: number; size: number; rot: number; warm: number; layer: number; speed: number; t: number };
export const makePuffs = (): Puff[] => {
  const r = prng(4242);
  const out: Puff[] = [];
  for (let i = 0; i < 820; i++) {
    const t = Math.pow(r(), 0.8);
    const p = pathAt(t);
    const finger = Math.floor(r() * 3) - 1;
    const width = 0.08 + t * 0.32;
    const off = finger * (0.05 + t * 0.32) + Math.sin(t * 11 + finger * 2.1) * 0.12 * t + gauss(r) * width;
    out.push({
      lon: p.lon + p.nx * off, lat: p.lat + p.ny * off,
      h: 0.04 + r() * 0.12 + t * 0.05, size: 0.18 + t * 0.5 + r() * 0.28, rot: r() * Math.PI * 2,
      warm: Math.max(0, 1 - t * 2.6), layer: Math.floor(r() * 3), speed: 0.6 + r() * 0.8, t,
    });
  }
  for (let i = 0; i < 260; i++) {
    const c = CLUSTERS[1 + Math.floor(r() * 3)];
    const join = pathAt(0.4 + r() * 0.15);
    const s = r();
    out.push({
      lon: c[0] + (join.lon - c[0]) * s + gauss(r) * 0.12, lat: c[1] + (join.lat - c[1]) * s + gauss(r) * 0.12,
      h: 0.05 + r() * 0.12, size: 0.16 + s * 0.3 + r() * 0.2, rot: r() * Math.PI * 2,
      warm: Math.max(0, 0.8 - s), layer: 1 + Math.floor(r() * 2), speed: 0.5 + r() * 0.5, t: 0.25 + s * 0.25,
    });
  }
  for (let i = 0; i < 140; i++) {
    const t = 0.6 + r() * 0.45;
    out.push({
      lon: 137.0 + gauss(r) * 0.75 - (t - 0.6) * 0.8, lat: -4.85 + gauss(r) * 0.4, h: 0.06 + r() * 0.1, size: 0.9 + r() * 1.1,
      rot: r() * Math.PI * 2, warm: 0, layer: 3, speed: 0.3, t: Math.min(1, t + 0.1),
    });
  }
  for (let i = 0; i < 60; i++) {
    const c = CLUSTERS[Math.floor(r() * 2)];
    out.push({
      lon: c[0] + gauss(r) * 0.3, lat: c[1] + gauss(r) * 0.25, h: 0.05 + r() * 0.2, size: 0.22 + r() * 0.3,
      rot: r() * Math.PI * 2, warm: 1, layer: 0, speed: 0.4, t: 0,
    });
  }
  return out;
};

export type Hot = { lon: number; lat: number; s: number; ph: number; rank: number };
/** 260 hotspots; the first 170 are the cover's set, the rest only show when fires flare again. */
export const makeHotspots = (): Hot[] => {
  const r = prng(777);
  const pts: Hot[] = [];
  let guard = 0;
  while (pts.length < 260 && guard++ < 8000) {
    let u = r(), k = 0;
    while (k < CLUSTERS.length - 1 && u > CLUSTERS[k][3]) { u -= CLUSTERS[k][3]; k++; }
    const c = CLUSTERS[k];
    const lon = c[0] + gauss(r) * c[2] * 1.4, lat = c[1] + gauss(r) * c[2];
    if (heightAt(lon, lat) <= 0.004 || heightAt(lon, lat) > 0.12) continue;
    pts.push({ lon, lat, s: 0.6 + r() * 0.9, ph: r() * 6.28, rank: pts.length / 170 });
  }
  return pts;
};

/** Small seeded town around Timika (illustration scale; 1 unit = 1 degree). */
export type House = { x: number; z: number; w: number; d: number; h: number; rot: number; tone: number };
export const makeTown = (): House[] => {
  const r = prng(9091);
  const [cx, cz] = W(TIMIKA[0] - 0.05, TIMIKA[1] - 0.03);
  const out: House[] = [];
  let guard = 0;
  while (out.length < 46 && guard++ < 600) {
    const a = r() * Math.PI * 2, rad = 0.05 + Math.sqrt(r()) * 0.2;
    const x = cx + Math.cos(a) * rad, z = cz + Math.sin(a) * rad * 0.8;
    if (Math.hypot(x - cx - 0.06, z - cz + 0.02) < 0.07) continue; // keep the school yard clear
    out.push({ x, z, w: 0.018 + r() * 0.012, d: 0.016 + r() * 0.01, h: 0.012 + r() * 0.01, rot: r() * 0.6 - 0.3, tone: r() });
  }
  return out;
};
export const SCHOOL = (() => {
  const [cx, cz] = W(TIMIKA[0] - 0.05, TIMIKA[1] - 0.03);
  return { x: cx + 0.06, z: cz - 0.02 };
})();
