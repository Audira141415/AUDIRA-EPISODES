// EP10 film textures (COLLAGE): extra printed scraps for the film beats, in the same print language as
// coverTextures.ts (torn paper, one-ink halftone, typewriter + newspaper type). Seeded and cached.

import * as THREE from "three";
import { mulberry32 } from "../../core/film/craft.ts";

type G = CanvasRenderingContext2D;

export const FACE = {
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
  black: "'Arial Black', Arial, sans-serif",
  impact: "Impact, 'Arial Black', sans-serif",
} as const;
export type Face = keyof typeof FACE;

export type Line = { t: string; y: number; size: number; face?: Face; color?: string; italic?: boolean; weight?: number };

const fitText = (g: G, txt: string, x: number, y: number, max: number) => {
  const mw = g.measureText(txt).width;
  g.save();
  g.translate(x, y);
  if (mw > max) g.scale(max / mw, 1);
  g.fillText(txt, 0, 0);
  g.restore();
};

/** Centred lines of type; y and size are fractions of the scrap height. */
export const linesPrint = (lines: Line[], opts: { rule?: string; align?: "center" | "left" } = {}) => (g: G, w: number, h: number) => {
  const left = opts.align === "left";
  g.textAlign = left ? "left" : "center";
  g.textBaseline = "middle";
  if (opts.rule) {
    g.fillStyle = opts.rule;
    g.fillRect(w * 0.07, h * 0.1, w * 0.86, Math.max(5, h * 0.025));
  }
  for (const l of lines) {
    const face = l.face ?? "black";
    const weight = l.weight ?? (face === "impact" ? 400 : face === "mono" ? 700 : 900);
    g.font = `${l.italic ? "italic " : ""}${weight} ${Math.round(h * l.size)}px ${FACE[face]}`;
    g.fillStyle = l.color ?? "#1C1A17";
    fitText(g, l.t, left ? w * 0.08 : w / 2, h * l.y, w * 0.84);
  }
};

/** A typed letter: date, addressee, body copy as bars, signature. */
export const letterPrint = (date: string, to: string, sign: string, ink: string, accent: string) => (g: G, w: number, h: number, rand: () => number) => {
  const m = w * 0.1;
  g.textBaseline = "top";
  g.textAlign = "left";
  g.fillStyle = accent;
  g.font = `700 ${Math.round(w * 0.075)}px ${FACE.mono}`;
  fitText(g, date, m, m * 0.9, w - 2 * m);
  g.fillStyle = ink;
  g.font = `700 ${Math.round(w * 0.06)}px ${FACE.mono}`;
  fitText(g, "Kepada Yth.", m, m * 0.9 + w * 0.13, w - 2 * m);
  g.font = `900 ${Math.round(w * 0.105)}px ${FACE.serif}`;
  fitText(g, to, m, m * 0.9 + w * 0.21, w - 2 * m);
  let y = m * 0.9 + w * 0.38;
  g.fillStyle = "rgba(28,26,23,0.5)";
  while (y < h * 0.74) {
    const len = rand() < 0.15 ? (w - 2 * m) * (0.4 + rand() * 0.3) : (w - 2 * m) * (0.9 + rand() * 0.1);
    g.fillRect(m, y, len, 9);
    y += rand() < 0.1 ? 34 : 22;
  }
  g.fillStyle = ink;
  g.font = `italic 400 ${Math.round(w * 0.1)}px ${FACE.serif}`;
  fitText(g, sign, m + w * 0.3, h * 0.8, w * 0.55);
};

/** A government tax form: header band, boxed grid, a red charge line. */
export const formPrint = (head: string, charge: string, ink: string, red: string) => (g: G, w: number, h: number, rand: () => number) => {
  const m = w * 0.07;
  g.fillStyle = ink;
  g.fillRect(m, m, w - 2 * m, h * 0.16);
  g.fillStyle = "#F3EEE2";
  g.textAlign = "left";
  g.textBaseline = "middle";
  g.font = `700 ${Math.round(h * 0.1)}px ${FACE.mono}`;
  fitText(g, head, m + 16, m + h * 0.08, w - 2 * m - 32);
  // grid of boxes
  g.strokeStyle = "rgba(28,26,23,0.55)";
  g.lineWidth = 3;
  const top = m + h * 0.2, rows = 3, rh = h * 0.1;
  for (let r = 0; r < rows; r++) {
    let x = m;
    while (x < w - m - 10) {
      const bw = 50 + rand() * 120;
      g.strokeRect(x, top + r * rh, Math.min(bw, w - m - x), rh);
      x += bw;
    }
  }
  g.fillStyle = red;
  g.textAlign = "center";
  g.font = `900 ${Math.round(h * 0.17)}px ${FACE.black}`;
  fitText(g, charge, w / 2, h * 0.73, w * 0.84);
};

/** Constitutional document page: serif title, sub, body bars and a red note. */
export const docPrint = (title: string, sub: string, note: string, ink: string, red: string) => (g: G, w: number, h: number, rand: () => number) => {
  const m = w * 0.08;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = ink;
  g.font = `900 ${Math.round(h * 0.2)}px ${FACE.serif}`;
  fitText(g, title, w / 2, h * 0.2, w * 0.84);
  g.font = `700 ${Math.round(h * 0.13)}px ${FACE.mono}`;
  fitText(g, sub, w / 2, h * 0.38, w * 0.84);
  g.fillStyle = "rgba(28,26,23,0.45)";
  let y = h * 0.48;
  while (y < h * 0.66) {
    g.fillRect(m, y, (w - 2 * m) * (0.85 + rand() * 0.15), 8);
    y += 20;
  }
  g.fillStyle = red;
  g.font = `900 ${Math.round(h * 0.13)}px ${FACE.black}`;
  fitText(g, note, w / 2, h * 0.82, w * 0.84);
};

/** Envelope: flap lines + address block. */
export const envelopePrint = (line1: string, line2: string, ink: string, accent: string) => (g: G, w: number, h: number) => {
  g.strokeStyle = "rgba(28,26,23,0.35)";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(w * 0.04, h * 0.06);
  g.lineTo(w * 0.5, h * 0.48);
  g.lineTo(w * 0.96, h * 0.06);
  g.stroke();
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = ink;
  g.font = `900 ${Math.round(h * 0.17)}px ${FACE.black}`;
  fitText(g, line1, w / 2, h * 0.64, w * 0.84);
  g.fillStyle = accent;
  g.font = `700 ${Math.round(h * 0.17)}px ${FACE.mono}`;
  fitText(g, line2, w / 2, h * 0.84, w * 0.84);
};

/** Empty wooden chair under a spotlight (grey photo, halftoned later). */
export const chairPhoto = (g: G, w: number, h: number) => {
  g.fillStyle = "#5a5a5a";
  g.fillRect(0, 0, w, h);
  const spot = g.createRadialGradient(w * 0.5, h * 0.62, 10, w * 0.5, h * 0.62, w * 0.6);
  spot.addColorStop(0, "#f2f2f2");
  spot.addColorStop(1, "#4a4a4a");
  g.fillStyle = spot;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#b8b8b8";
  g.fillRect(0, h * 0.8, w, h * 0.2);
  const ink = "#141414";
  g.fillStyle = ink;
  // back legs + back rest
  g.fillRect(w * 0.33, h * 0.16, w * 0.045, h * 0.62);
  g.fillRect(w * 0.62, h * 0.16, w * 0.045, h * 0.62);
  g.fillRect(w * 0.33, h * 0.16, w * 0.335, h * 0.06);
  g.fillRect(w * 0.33, h * 0.3, w * 0.335, h * 0.035);
  for (let i = 0; i < 3; i++) g.fillRect(w * (0.4 + i * 0.075), h * 0.22, w * 0.025, h * 0.25);
  // seat (in perspective) + front legs
  g.beginPath();
  g.moveTo(w * 0.33, h * 0.5);
  g.lineTo(w * 0.665, h * 0.5);
  g.lineTo(w * 0.74, h * 0.58);
  g.lineTo(w * 0.25, h * 0.58);
  g.closePath();
  g.fill();
  g.fillRect(w * 0.25, h * 0.58, w * 0.05, h * 0.26);
  g.fillRect(w * 0.69, h * 0.58, w * 0.05, h * 0.26);
  // shadow
  g.globalAlpha = 0.35;
  g.beginPath();
  g.ellipse(w * 0.52, h * 0.85, w * 0.3, h * 0.03, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
};

const STAMPS = new Map<string, THREE.CanvasTexture>();

/** Rubber stamp: inked frame and words with worn gaps, on a transparent canvas. */
export function stampTexture(key: string, lines: { t: string; size: number }[], color: string, aspect: number, seed: number) {
  const hit = STAMPS.get(key);
  if (hit) return hit;
  const rand = mulberry32(seed);
  const w = 1024, h = Math.round(1024 / aspect);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = h * 0.07;
  g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
  g.textAlign = "center";
  g.textBaseline = "middle";
  const n = lines.length;
  lines.forEach((l, i) => {
    g.font = `900 ${Math.round(h * l.size)}px ${FACE.black}`;
    fitText(g, l.t, w / 2, h * ((i + 1) / (n + 1)) + (n === 1 ? h * 0.02 : 0), w * 0.82);
  });
  // worn rubber: knock out specks
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 900; i++) {
    g.globalAlpha = 0.3 + rand() * 0.7;
    g.beginPath();
    g.arc(rand() * w, rand() * h, 1 + rand() * 4, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  STAMPS.set(key, tex);
  return tex;
}

/** Film name tag: heavy name and a heavy role line (both readable on a phone). */
export const tagPrint2 = (name: string, role: string, ink: string, roleInk: string) => (g: G, w: number, h: number) => {
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = ink;
  g.font = `900 ${Math.round(h * 0.38)}px ${FACE.black}`;
  fitText(g, name, w / 2, h * 0.36, w * 0.86);
  g.fillStyle = roleInk;
  g.font = `900 ${Math.round(h * 0.27)}px ${FACE.black}`;
  fitText(g, role, w / 2, h * 0.74, w * 0.8);
};
