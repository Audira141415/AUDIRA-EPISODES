// BATIKFORGE motifs, drawn once into a data texture for the cloth shader:
//   R = wax order (0 = no wax; the canting reaches a stroke when uWax passes its value)
//   G = dye shade (0 field, 0.2–0.8 mega mendung band, light inside; 1 = border, dyed soga last)
//   B = dye arrival (the indigo climbs from the hem, a little ragged)
// Layout on a portrait kain: parang border, kawung field, three mega mendung clouds and a waxed cap
// plate that leaves AUDIRA in the cloth. Seeded: same texture in every render tab.

import * as THREE from "three";
import { mulberry32 } from "../../../core/film/craft.ts";

export const CLOTH_W = 1.3;
export const CLOTH_H = 2.1;
export const TEX_W = 1024;
export const TEX_H = Math.round((TEX_W * CLOTH_H) / CLOTH_W);

export type Cloud = { u: number; v: number; r: number };
/** Clouds in texture units (u, v in 0..1 from the top left, r as a fraction of width). */
export const CLOUDS: Cloud[] = [
  { u: 0.5, v: 0.5, r: 0.27 },
  { u: 0.28, v: 0.27, r: 0.12 },
  { u: 0.72, v: 0.73, r: 0.13 },
];
export const BANDS = [1, 0.84, 0.68, 0.52, 0.36, 0.2];

/** Mega mendung outline: lobed, wider than tall, flatter underneath. Unit radius, centre at 0. */
export function cloudOutline(scale = 1, n = 180): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const lobes = 1 + 0.17 * Math.pow(Math.abs(Math.sin(2.5 * a)), 0.55);
    const r = scale * lobes;
    const y = Math.sin(a) * r * (Math.sin(a) < 0 ? 0.6 : 0.74);
    pts.push([Math.cos(a) * r, y]);
  }
  return pts;
}

/** Cloth local position (metres, centre origin, y up) of a texture point. */
export const toCloth = (u: number, v: number): [number, number] => [(u - 0.5) * CLOTH_W, (0.5 - v) * CLOTH_H];

/** The first wax line (outer band of the big cloud) in cloth units, for the 3D canting and wax bead. */
export function firstStroke(): [number, number][] {
  const c = CLOUDS[0];
  const r = c.r * TEX_W;
  return cloudOutline(1, 220).map(([x, y]) => toCloth((c.u * TEX_W + x * r) / TEX_W, (c.v * TEX_H - y * r) / TEX_H));
}

type Stroke = (g: CanvasRenderingContext2D) => void;

/** Wax order (0..1) of the last stroke of each group, filled in when the texture is built. */
export const WAX_ORDER = { firstLine: 0, clouds: 0, kawung: 0, border: 0, cap: 1 };

let CACHE: THREE.DataTexture | null = null;

export function batikData(): THREE.DataTexture {
  if (CACHE) return CACHE;
  const W = TEX_W, H = TEX_H;
  const rand = mulberry32(19);
  const strokes: { s: Stroke; fill?: boolean }[] = [];

  // 1) mega mendung: every band outline, big cloud first (the canting's first line)
  CLOUDS.forEach((c) => {
    BANDS.forEach((b) => {
      const r = c.r * W;
      const pts = cloudOutline(b).map(([x, y]) => [c.u * W + x * r, c.v * H - y * r] as const);
      strokes.push({
        s: (g) => {
          g.lineWidth = 7;
          g.beginPath();
          pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.stroke();
        },
      });
    });
  });

  const nClouds = strokes.length;
  // 2) kawung field: four petals round a point, cells spreading out from the centre
  const m = W * 0.1;
  const cell = 64;
  const cells: { x: number; y: number; d: number }[] = [];
  for (let y = m + cell * 0.9; y < H - m - cell * 0.5; y += cell)
    for (let x = m + cell * 0.6; x < W - m - cell * 0.4; x += cell) {
      const inCloud = CLOUDS.some((c) => Math.hypot((x - c.u * W) / 1, (y - c.v * H) / 0.8) < c.r * W * 1.25);
      const inCap = y < m + 150 && Math.abs(x - W / 2) < 240;
      if (!inCloud && !inCap) cells.push({ x, y, d: Math.hypot(x - W / 2, y - H / 2) });
    }
  cells.sort((a, b) => a.d - b.d);
  cells.forEach(({ x, y }) =>
    strokes.push({
      s: (g) => {
        g.lineWidth = 4.5;
        for (let k = 0; k < 4; k++) {
          const a = Math.PI / 4 + (k * Math.PI) / 2;
          g.beginPath();
          g.ellipse(x + Math.cos(a) * cell * 0.21, y + Math.sin(a) * cell * 0.21, cell * 0.2, cell * 0.11, a, 0, Math.PI * 2);
          g.stroke();
        }
        g.beginPath();
        g.arc(x, y, 3.5, 0, Math.PI * 2);
        g.fill();
      },
    }),
  );

  const nKawung = strokes.length;
  // 3) parang border: diagonal S-blades between two rules, all four sides
  const band = m * 0.78;
  const blade = (x0: number, y0: number, len: number, ang: number) => (g: CanvasRenderingContext2D) => {
    g.save();
    g.translate(x0, y0);
    g.rotate(ang);
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(-len / 2, 0);
    g.bezierCurveTo(-len / 6, -len * 0.18, len / 6, len * 0.18, len / 2, 0);
    g.stroke();
    g.beginPath();
    g.arc(len * 0.36, -len * 0.14, 3.5, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const L = Math.hypot(bx - ax, by - ay), n = Math.floor(L / 30);
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      strokes.push({ s: blade(ax + (bx - ax) * u, ay + (by - ay) * u, band * 1.05, Math.atan2(by - ay, bx - ax) - Math.PI / 4) });
    }
  };
  const e = (m - band) / 2 + band / 2;
  side(e, e, W - e, e);
  side(W - e, e, W - e, H - e);
  side(W - e, H - e, e, H - e);
  side(e, H - e, e, e);
  strokes.push({
    s: (g) => {
      g.lineWidth = 6;
      g.strokeRect(m, m, W - 2 * m, H - 2 * m);
      g.strokeRect(m - band - 4, m - band - 4, W - 2 * (m - band - 4), H - 2 * (m - band - 4));
    },
  });

  const nBorder = strokes.length;
  // 4) cap plate last: a waxed cartouche with the letters left unwaxed, so the dye writes AUDIRA
  strokes.push({
    fill: true,
    s: (g) => {
      const cw = 420, ch = 104, cx = W / 2 - cw / 2, cy = m + 22;
      g.beginPath();
      g.roundRect(cx, cy, cw, ch, 26);
      g.fill();
    },
  });

  // order: gray value per stroke, 3..250
  const ord = (k: number) => (3 + (k / (strokes.length - 1)) * 247) / 255;
  WAX_ORDER.firstLine = ord(0);
  WAX_ORDER.clouds = ord(nClouds - 1);
  WAX_ORDER.kawung = ord(nKawung - 1);
  WAX_ORDER.border = ord(nBorder - 1);
  WAX_ORDER.cap = ord(strokes.length - 1);
  const wax = document.createElement("canvas");
  wax.width = W;
  wax.height = H;
  const g = wax.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.lineCap = "round";
  g.lineJoin = "round";
  strokes.forEach((st, i) => {
    const v = Math.round(3 + (i / (strokes.length - 1)) * 247);
    const c = `rgb(${v},${v},${v})`;
    g.strokeStyle = c;
    g.fillStyle = c;
    st.s(g);
  });
  // letters cut out of the cap plate
  g.globalCompositeOperation = "destination-out";
  g.font = "700 74px Georgia, 'Times New Roman', serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("A U D I R A", W / 2, m + 22 + 56);
  g.globalCompositeOperation = "source-over";
  const waxPx = g.getImageData(0, 0, W, H).data;

  // shade (G): cloud bands graded light inside, border = 1
  const shade = document.createElement("canvas");
  shade.width = W;
  shade.height = H;
  const s = shade.getContext("2d")!;
  s.fillStyle = "#000";
  s.fillRect(0, 0, W, H);
  s.fillStyle = "#fff";
  s.fillRect(0, 0, W, m);
  s.fillRect(0, H - m, W, m);
  s.fillRect(0, 0, m, H);
  s.fillRect(W - m, 0, m, H);
  CLOUDS.forEach((c) =>
    BANDS.forEach((b, i) => {
      const r = c.r * W, v = Math.round(50 + (i / (BANDS.length - 1)) * 155);
      s.fillStyle = `rgb(${v},${v},${v})`;
      s.beginPath();
      cloudOutline(b).forEach(([x, y], k) => (k ? s.lineTo(c.u * W + x * r, c.v * H - y * r) : s.moveTo(c.u * W + x * r, c.v * H - y * r)));
      s.closePath();
      s.fill();
    }),
  );
  const shadePx = s.getImageData(0, 0, W, H).data;

  // dye arrival (B): from the hem up, with a ragged capillary front
  const ph = rand() * 6.28;
  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const up = 1 - y / H;
      const rag = Math.sin(x * 0.021 + ph) * 0.025 + Math.sin(x * 0.067 + ph * 2) * 0.012 + Math.sin((x + y) * 0.13) * 0.006;
      const arrive = Math.min(1, Math.max(0, up * 0.92 + rag + 0.04));
      // texture rows go bottom-up in a DataTexture (flipY false): store row H-1-y
      const o = ((H - 1 - y) * W + x) * 4;
      data[o] = waxPx[i];
      data[o + 1] = shadePx[i];
      data[o + 2] = Math.round(arrive * 255);
      data[o + 3] = 255;
    }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  CACHE = tex;
  return tex;
}

