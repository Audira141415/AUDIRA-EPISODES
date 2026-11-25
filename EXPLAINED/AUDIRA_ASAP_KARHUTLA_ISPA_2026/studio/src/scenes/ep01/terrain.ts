// EP01 cover: procedural "satellite tile" of southern New Guinea built from real coastline rings.
// Everything is seeded and computed once, so every render tab produces identical pixels.
import * as THREE from "three";
import { PAPUA_RINGS } from "./papuaGeo.ts";

// Map extent in degrees. World units: 1 unit = 1 degree, x = east, -z = north.
export const LON0 = 130, LON1 = 146, LAT0 = -12.5, LAT1 = 2.5;
export const CLON = 138.4, CLAT = -6.4;
export const W = (lon: number, lat: number): [number, number] => [lon - CLON, -(lat - CLAT)];

const PPD = 60; // mask pixels per degree
const MW = (LON1 - LON0) * PPD, MH = (LAT1 - LAT0) * PPD;
export const HEIGHT_SCALE = 0.42;

// Central cordillera (approx.), shifted slightly north so Timika sits on the lowland.
const RIDGE: [number, number][] = [
  [134.0, -3.3], [135.0, -3.45], [136.2, -3.75], [137.2, -3.95], [138.2, -4.05], [139.1, -4.15],
  [140.0, -4.45], [141.0, -4.95], [142.0, -5.4], [143.0, -5.7], [144.3, -5.9], [145.5, -6.5],
];

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x: number, y: number, oct = 4) => {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; }
  return s;
};
const distSeg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const ridgeDist = (lon: number, lat: number) => {
  let d = 1e9;
  for (let i = 0; i < RIDGE.length - 1; i++) d = Math.min(d, distSeg(lon, lat, ...RIDGE[i], ...RIDGE[i + 1]));
  return d;
};

const drawMask = (blur: number) => {
  const c = document.createElement("canvas");
  c.width = MW; c.height = MH;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, MW, MH);
  g.filter = blur > 0 ? `blur(${blur}px)` : "none";
  g.fillStyle = "#fff";
  for (const { ring } of PAPUA_RINGS) {
    if (ring.length <= 6) continue; // degenerate rings in the source data
    g.beginPath();
    ring.forEach(([lon, lat], i) => {
      const x = (lon - LON0) * PPD, y = (LAT1 - lat) * PPD;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    });
    g.closePath();
    g.fill();
  }
  const d = g.getImageData(0, 0, MW, MH).data;
  const out = new Float32Array(MW * MH);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
  return out;
};

type Field = { mask: Float32Array; soft: Float32Array; shelf: Float32Array };
let field: Field | null = null;
const getField = (): Field => {
  if (!field) field = { mask: drawMask(0), soft: drawMask(2.5), shelf: drawMask(22) };
  return field;
};
const sample = (arr: Float32Array, lon: number, lat: number) => {
  const x = Math.max(0, Math.min(MW - 1, Math.round((lon - LON0) * PPD)));
  const y = Math.max(0, Math.min(MH - 1, Math.round((LAT1 - lat) * PPD)));
  return arr[y * MW + x];
};

/** Burn-scar weighting: lowlands around Merauke / southern coast. */
export const scarWeight = (lon: number, lat: number) => {
  const d = Math.hypot((lon - 139.9) / 1.6, (lat + 7.8) / 1.1);
  return Math.max(0, 1 - d);
};

/** Terrain height (world units) at lon/lat. */
export const heightAt = (lon: number, lat: number) => {
  const { soft } = getField();
  const land = sample(soft, lon, lat);
  if (land <= 0.001) return -0.004;
  const r = ridgeDist(lon, lat);
  const ridge = Math.exp(-((r / 0.42) ** 2));
  const foot = Math.exp(-((r / 1.1) ** 2));
  const n = fbm(lon * 2.2, lat * 2.2, 5);
  const crag = Math.abs(fbm(lon * 6 + 9, lat * 6 + 3, 3) - 0.5) * 2;
  const h = 0.02 + foot * 0.12 * n + ridge * (0.55 + 0.45 * n) * (0.75 + 0.25 * crag);
  return land * h * HEIGHT_SCALE * 2.2;
};

export const buildTerrainGeometry = () => {
  const SX = 480, SZ = 450;
  const geo = new THREE.PlaneGeometry(LON1 - LON0, LAT1 - LAT0, SX, SZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const ox = (LON0 + LON1) / 2 - CLON, oz = -((LAT0 + LAT1) / 2 - CLAT);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + ox, z = pos.getZ(i) + oz;
    const lon = x + CLON, lat = -z + CLAT;
    pos.setXYZ(i, x, heightAt(lon, lat), z);
  }
  geo.computeVertexNormals();
  return geo;
};

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Desaturated satellite colour map with a faint degree grid baked in. */
export const buildColorTexture = () => {
  const { mask, shelf } = getField();
  const c = document.createElement("canvas");
  c.width = MW; c.height = MH;
  const g = c.getContext("2d")!;
  const img = g.createImageData(MW, MH);
  const deep = hex("#08182a"), shelfC = hex("#173b52"), swamp = hex("#33412f"), swamp2 = hex("#46523a");
  const hill = hex("#5d5c50"), peak = hex("#8a877b"), scar = hex("#3b2c22"), grid = hex("#2E70CE");
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const i = y * MW + x;
      const lon = LON0 + x / PPD, lat = LAT1 - y / PPD;
      const m = mask[i];
      let col: number[];
      const n = fbm(lon * 3.1, lat * 3.1, 4);
      if (m < 0.5) {
        const s = Math.min(1, shelf[i] * 1.6);
        col = mix(deep, shelfC, s * (0.75 + 0.25 * n));
      } else {
        const r = ridgeDist(lon, lat);
        const ridge = Math.exp(-((r / 0.55) ** 2));
        col = mix(swamp, swamp2, Math.min(1, n * 1.4));
        col = mix(col, hill, Math.min(1, ridge * 1.3));
        col = mix(col, peak, Math.max(0, ridge - 0.55) * 1.6 * fbm(lon * 9, lat * 9, 2));
        const sw = scarWeight(lon, lat) * Math.max(0, fbm(lon * 5 + 4, lat * 5 + 2, 3) - 0.38) * 3;
        col = mix(col, scar, Math.min(0.85, sw));
        // rivers: thin dark meanders on the lowland
        const rv = Math.abs(fbm(lon * 4 + 20, lat * 4 + 11, 3) - 0.5);
        if (rv < 0.012 && ridge < 0.3) col = mix(col, shelfC, 0.7);
      }
      // 1-degree graticule
      const gx = Math.abs(lon - Math.round(lon)) * PPD, gy = Math.abs(lat - Math.round(lat)) * PPD;
      if (gx < 0.9 || gy < 0.9) col = mix(col, grid, m < 0.5 ? 0.55 : 0.32);
      img.data[i * 4] = col[0]; img.data[i * 4 + 1] = col[1]; img.data[i * 4 + 2] = col[2]; img.data[i * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Soft wispy smoke puff (seeded noise inside a radial falloff). */
export const buildSmokeTexture = (seed: number) => {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S - 0.5, v = y / S - 0.5;
    const r = Math.hypot(u, v) * 2;
    const n = fbm(x / 22 + seed * 7.3, y / 22 + seed * 3.1, 5);
    const a = Math.max(0, 1 - r * (0.75 + n * 0.6)) ** 1.6 * (0.45 + n * 0.9);
    const i = (y * S + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
    img.data[i + 3] = Math.min(255, a * 255);
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const buildGlowTexture = () => {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(255,255,255,0.45)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
};

/** In-world AUDIRA plate (lies on the Arafura Sea like a tile stamp). */
export const buildPlateTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(7,11,14,0.78)"; g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = "#FFBE55"; g.lineWidth = 8; g.strokeRect(6, 6, 1012, 244);
  g.fillStyle = "#FFBE55";
  g.font = "800 92px 'Segoe UI', Manrope, sans-serif";
  g.fillText("AUDIRA OSINT", 44, 120);
  g.fillStyle = "rgba(242,245,246,0.85)";
  g.font = "600 46px Consolas, 'Courier New', monospace";
  g.fillText("TILE PAPUA-S // LAUT ARAFURA", 46, 200);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
