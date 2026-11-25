// Procedural, seeded canvas textures for the manuscript pages: parchment, abstract calligraphy-like
// strokes (never real text, never Qur'anic text) and ink drawings of surgical instruments.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { PAL } from "./world.ts";

export const TEX_W = 1024;
export const TEX_H = 1428; // PAGE_D / PAGE_W ratio

type Ctx = CanvasRenderingContext2D;

const parchment = (c: Ctx, seed: number) => {
  const r = prng(seed);
  c.fillStyle = PAL.parchment;
  c.fillRect(0, 0, TEX_W, TEX_H);
  for (let i = 0; i < 260; i++) {
    const x = r() * TEX_W, y = r() * TEX_H, s = 20 + r() * 140;
    const g = c.createRadialGradient(x, y, 0, x, y, s);
    const a = 0.025 + r() * 0.05;
    g.addColorStop(0, r() > 0.5 ? `rgba(150,110,60,${a})` : `rgba(255,248,230,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(x - s, y - s, s * 2, s * 2);
  }
  // fibres
  c.strokeStyle = "rgba(120,90,50,0.08)";
  c.lineWidth = 1;
  for (let i = 0; i < 500; i++) {
    const x = r() * TEX_W, y = r() * TEX_H, l = 6 + r() * 22, a = r() * Math.PI;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    c.stroke();
  }
  // aged edges
  const e = c.createRadialGradient(TEX_W / 2, TEX_H / 2, TEX_W * 0.45, TEX_W / 2, TEX_H / 2, TEX_H * 0.78);
  e.addColorStop(0, "rgba(0,0,0,0)");
  e.addColorStop(1, "rgba(110,72,30,0.38)");
  c.fillStyle = e;
  c.fillRect(0, 0, TEX_W, TEX_H);
};

/** Flat-nib stamp along a polyline: thick/thin strokes like a reed pen (abstract, not real letters). */
const nib = (c: Ctx, pts: [number, number][], w: number) => {
  const ang = -Math.PI / 4.2;
  const dx = Math.cos(ang) * w * 0.5, dy = Math.sin(ang) * w * 0.5;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    c.beginPath();
    c.moveTo(x0 - dx, y0 - dy);
    c.lineTo(x0 + dx, y0 + dy);
    c.lineTo(x1 + dx, y1 + dy);
    c.lineTo(x1 - dx, y1 - dy);
    c.closePath();
    c.fill();
  }
};

/** One line of abstract right-to-left script: connected baseline words with teeth, tall strokes,
 *  bowls below the line and dots. Never real text. */
const scriptLine = (c: Ctx, r: () => number, xR: number, xL: number, y: number, color: string, size = 1) => {
  c.fillStyle = color;
  const w = 6.5 * size;
  let x = xR;
  while (x > xL + 30 * size) {
    const pts: [number, number][] = [];
    const len = (40 + r() * 90) * size;
    const end = Math.max(xL, x - len);
    let cx = x;
    pts.push([cx, y]);
    while (cx > end) {
      const k = r();
      const step = (9 + r() * 12) * size;
      if (k < 0.25) {
        // tooth
        pts.push([cx - step * 0.3, y - 9 * size], [cx - step * 0.5, y - 9 * size], [cx - step * 0.7, y]);
      } else if (k < 0.38) {
        // tall stroke
        nib(c, [[cx - step * 0.4, y - (30 + r() * 12) * size], [cx - step * 0.5, y]], w * 0.9);
      }
      cx -= step;
      pts.push([cx, y + Math.sin(cx * 0.05) * 1.2 * size]);
    }
    // final bowl dipping under the line
    if (r() < 0.6) {
      const bw = (16 + r() * 14) * size;
      for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        pts.push([cx - bw * t, y + Math.sin(t * Math.PI) * 14 * size - t * 6 * size]);
      }
    }
    nib(c, pts, w);
    const dots = Math.floor(r() * 3);
    for (let i = 0; i < dots; i++) {
      c.beginPath();
      c.ellipse(x - r() * len, y + (r() < 0.5 ? -18 : 16) * size, 3.2 * size, 2.2 * size, -0.6, 0, Math.PI * 2);
      c.fill();
    }
    x = end - (10 + r() * 14) * size;
  }
};

const textBlock = (c: Ctx, r: () => number, x0: number, x1: number, y0: number, y1: number, gap = 46) => {
  for (let y = y0; y < y1; y += gap) scriptLine(c, r, x1, x0 + r() * 30, y, PAL.ink, 0.85);
};

// ---------- instrument drawings (ink outline + light wash) ----------
type Draw = (c: Ctx, s: number) => void;

const outline = (c: Ctx, path: () => void, wash = "rgba(120,80,40,0.12)") => {
  c.fillStyle = wash;
  c.beginPath();
  path();
  c.fill();
  c.strokeStyle = PAL.ink;
  c.lineWidth = 3.2;
  c.lineJoin = "round";
  c.beginPath();
  path();
  c.stroke();
};

/** Scalpel along +x, blade to the right; length ~ s. */
export const drawScalpel: Draw = (c, s) => {
  const h = s / 4.7;
  outline(c, () => {
    c.moveTo(s * 0.6, -h * 0.25);
    c.lineTo(s * 0.86, -h * 0.28);
    c.quadraticCurveTo(s * 0.97, -h * 0.26, s, -h * 0.02);
    c.quadraticCurveTo(s * 0.9, h * 0.38, s * 0.72, h * 0.34);
    c.lineTo(s * 0.6, h * 0.18);
    c.closePath();
  }, "rgba(160,170,180,0.18)");
  outline(c, () => {
    c.moveTo(0, 0);
    c.quadraticCurveTo(s * 0.02, -h * 0.32, s * 0.06, -h * 0.3);
    c.lineTo(s * 0.6, -h * 0.17);
    c.lineTo(s * 0.6, h * 0.15);
    c.lineTo(s * 0.06, h * 0.3);
    c.quadraticCurveTo(s * 0.02, h * 0.32, 0, 0);
  });
  c.lineWidth = 2;
  for (const u of [0.12, 0.16, 0.44, 0.48]) {
    c.beginPath();
    c.moveTo(s * u, -h * 0.26);
    c.lineTo(s * u, h * 0.26);
    c.stroke();
  }
};

const drawHook: Draw = (c, s) => {
  c.strokeStyle = PAL.ink;
  c.lineWidth = 5;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(s * 0.78, 0);
  c.bezierCurveTo(s * 0.98, 0, s * 1.0, s * 0.16, s * 0.88, s * 0.16);
  c.stroke();
  outline(c, () => {
    c.ellipse(s * 0.12, 0, s * 0.14, s * 0.035, 0, 0, Math.PI * 2);
  });
};

const drawScissors: Draw = (c, s) => {
  for (const sgn of [1, -1]) {
    outline(c, () => {
      c.moveTo(s * 0.3, 0);
      c.lineTo(s, sgn * s * 0.05);
      c.lineTo(s * 0.98, sgn * s * 0.09);
      c.lineTo(s * 0.32, sgn * s * 0.08);
      c.closePath();
    }, "rgba(160,170,180,0.18)");
    c.strokeStyle = PAL.ink;
    c.lineWidth = 3.2;
    c.beginPath();
    c.ellipse(s * 0.12, sgn * s * 0.12, s * 0.11, s * 0.07, 0, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(s * 0.22, sgn * s * 0.1);
    c.lineTo(s * 0.34, sgn * s * 0.04);
    c.stroke();
  }
  c.beginPath();
  c.arc(s * 0.34, 0, 5, 0, Math.PI * 2);
  c.fillStyle = PAL.ink;
  c.fill();
};

const drawForceps: Draw = (c, s) => {
  c.strokeStyle = PAL.ink;
  c.lineWidth = 5;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(s * 0.5, -s * 0.1, s, -s * 0.015);
  c.moveTo(0, 0);
  c.quadraticCurveTo(s * 0.5, s * 0.1, s, s * 0.015);
  c.stroke();
};

const drawSaw: Draw = (c, s) => {
  outline(c, () => {
    c.moveTo(s * 0.28, -s * 0.06);
    c.lineTo(s, -s * 0.06);
    for (let i = 0; i <= 14; i++) {
      const x = s - i * (s * 0.72) / 14;
      c.lineTo(x, i % 2 ? s * 0.06 : s * 0.1);
    }
    c.closePath();
  }, "rgba(160,170,180,0.18)");
  outline(c, () => {
    c.roundRect(0, -s * 0.07, s * 0.28, s * 0.14, s * 0.05);
  });
};

const drawCautery: Draw = (c, s) => {
  c.strokeStyle = PAL.ink;
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(s * 0.25, 0);
  c.lineTo(s * 0.86, 0);
  c.stroke();
  outline(c, () => c.ellipse(s * 0.92, 0, s * 0.08, s * 0.05, 0, 0, Math.PI * 2), "rgba(160,170,180,0.2)");
  outline(c, () => c.roundRect(0, -s * 0.05, s * 0.26, s * 0.1, s * 0.04));
};

const figure = (c: Ctx, draw: Draw, x: number, y: number, s: number, a: number) => {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  draw(c, s);
  c.restore();
};

/** Rubric heading: a red-brown abstract stroke line inside a thin ruled frame. */
const rubric = (c: Ctx, r: () => number, y: number) => {
  c.strokeStyle = "rgba(42,27,16,0.6)";
  c.lineWidth = 2;
  c.strokeRect(80, y - 34, TEX_W - 160, 62);
  scriptLine(c, r, TEX_W - 120, 340, y + 4, PAL.rubric, 1.3);
};

const finish = (cv: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
};

const canvas = () => {
  const cv = document.createElement("canvas");
  cv.width = TEX_W;
  cv.height = TEX_H;
  return cv;
};

let rightCache: THREE.CanvasTexture | null = null;

/** Instrument figures on the left page (canvas px): draw order = draw-on order in the film. */
export const FIGS = [
  { id: "pisau", draw: drawScalpel, x: 150, y: 760, s: 700, a: -0.62 },
  { id: "kait", draw: drawHook, x: 110, y: 330, s: 380, a: 0 },
  { id: "gunting", draw: drawScissors, x: 600, y: 1000, s: 330, a: -0.1 },
  { id: "pinset", draw: drawForceps, x: 120, y: 1060, s: 360, a: 0.05 },
  { id: "gergaji", draw: drawSaw, x: 130, y: 1220, s: 330, a: 0 },
  { id: "kauter", draw: drawCautery, x: 560, y: 1250, s: 340, a: 0 },
] as const;

let leftBase: HTMLCanvasElement | null = null;
const leftBaseCanvas = () => {
  if (leftBase) return leftBase;
  const cv = canvas();
  const c = cv.getContext("2d")!;
  const r = prng(808);
  parchment(c, 41);
  rubric(c, r, 120);
  textBlock(c, r, 560, 940, 330, 470, 42);
  textBlock(c, r, 100, 940, 1330, 1400, 40);
  leftBase = cv;
  return cv;
};

let leftLive: { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; key: string } | null = null;

/**
 * Left page: instrument plate. Canvas x = page outer edge (left) → gutter (right); y = far → near.
 * `reveal[i]` (0..1) wipes figure i on along its own axis, like a pen drawing it; default all drawn.
 * One live texture, redrawn only when the quantised reveal state changes (pure function of the frame).
 */
export const leftPageTexture = (reveal: number[] = FIGS.map(() => 1)) => {
  const q = reveal.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 40));
  const key = q.join(",");
  if (!leftLive) {
    const cv = canvas();
    leftLive = { cv, tex: finish(cv), key: "" };
  }
  if (leftLive.key !== key) {
    const c = leftLive.cv.getContext("2d")!;
    c.drawImage(leftBaseCanvas(), 0, 0);
    FIGS.forEach((g, i) => {
      const p = q[i] / 40;
      if (p <= 0) return;
      c.save();
      c.translate(g.x, g.y);
      c.rotate(g.a);
      if (p < 1) {
        c.beginPath();
        c.rect(-40, -g.s, 40 + g.s * 1.08 * p, g.s * 2);
        c.clip();
      }
      g.draw(c, g.s);
      c.restore();
    });
    leftLive.key = key;
    leftLive.tex.needsUpdate = true;
  }
  return leftLive.tex;
};

/** Right page: running text with one small figure and rubrics. */
export const rightPageTexture = () => {
  if (rightCache) return rightCache;
  const cv = canvas();
  const c = cv.getContext("2d")!;
  const r = prng(909);
  parchment(c, 52);
  rubric(c, r, 120);
  textBlock(c, r, 110, 930, 230, 700, 42);
  figure(c, drawScissors, 170, 790, 420, 0.05);
  textBlock(c, r, 110, 930, 900, 1240, 42);
  rubric(c, r, 1300);
  textBlock(c, r, 110, 930, 1380, 1410, 42);
  rightCache = finish(cv);
  return rightCache;
};

/** Dark satin studio table with a soft light pool baked in (falloff to the frame edges). */
let tableCache: THREE.CanvasTexture | null = null;
export const tableTexture = () => {
  if (tableCache) return tableCache;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1024;
  const c = cv.getContext("2d")!;
  const r = prng(77);
  c.fillStyle = "#1b1a19";
  c.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 3000; i++) {
    c.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${0.02 + r() * 0.03})`;
    c.fillRect(r() * 1024, r() * 1024, 2, 2);
  }
  const g = c.createRadialGradient(512, 512, 60, 512, 512, 520);
  g.addColorStop(0, "rgba(52,46,40,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0.75)");
  c.fillStyle = g;
  c.fillRect(0, 0, 1024, 1024);
  tableCache = finish(cv);
  return tableCache;
};
