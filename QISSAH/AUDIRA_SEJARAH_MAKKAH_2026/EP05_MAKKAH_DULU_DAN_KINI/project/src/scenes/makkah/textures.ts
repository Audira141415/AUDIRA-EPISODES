// Canvas textures for the EP05 engraved plate: the engraved sky and the gold clock face.
import * as THREE from "three";
import { INK, rng } from "./engraving.ts";

const tex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
};

/**
 * Engraved sky: parchment with horizontal burin lines that thicken toward the top, cloud banks left
 * as bare paper with ink outlines, and a low sun with radiating rays on the "dulu" (left) side.
 */
export function skyTexture(w = 4096, h = 2048, seed = 41): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const r = rng(seed);
  // paper
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#e6d3ab");
  grad.addColorStop(1, INK.paper);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // foxing stains
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h, rad = 20 + r() * 160;
    const s = g.createRadialGradient(x, y, 0, x, y, rad);
    s.addColorStop(0, `rgba(140,96,40,${0.05 + r() * 0.07})`);
    s.addColorStop(1, "rgba(140,96,40,0)");
    g.fillStyle = s;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // cloud banks (ellipse clusters), kept as paper
  type Cloud = { x: number; y: number; rx: number; ry: number };
  const clouds: Cloud[] = [];
  const bank = (cx: number, cy: number, n: number, spread: number) => {
    for (let i = 0; i < n; i++) clouds.push({ x: cx + (r() - 0.5) * spread, y: cy + (r() - 0.5) * spread * 0.18, rx: 90 + r() * 170, ry: 40 + r() * 60 });
  };
  bank(w * 0.18, h * 0.32, 9, 900);
  bank(w * 0.55, h * 0.22, 8, 800);
  bank(w * 0.86, h * 0.36, 9, 900);
  bank(w * 0.36, h * 0.5, 6, 600);
  const inCloud = (x: number, y: number) => clouds.some((k) => ((x - k.x) / k.rx) ** 2 + ((y - k.y) / k.ry) ** 2 < 1);
  // sun
  const sun = { x: w * 0.47, y: h * 0.66 };
  // horizontal burin lines
  g.strokeStyle = INK.sepia;
  for (let y = 6; y < h * 0.82; y += 9) {
    const k = 1 - y / (h * 0.82);
    const lw = 0.6 + k * 3.2;
    g.lineWidth = lw;
    g.globalAlpha = 0.55 + k * 0.35;
    g.beginPath();
    let pen = false;
    for (let x = 0; x <= w; x += 6) {
      const yy = y + Math.sin(x * 0.004 + y * 0.03) * 1.4;
      const dSun = Math.hypot(x - sun.x, yy - sun.y);
      const off = inCloud(x, yy) || dSun < 150;
      if (off) {
        pen = false;
        continue;
      }
      if (!pen) {
        g.moveTo(x, yy);
        pen = true;
      } else g.lineTo(x, yy);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  // cloud outlines + inner shading strokes
  g.lineWidth = 2.2;
  g.strokeStyle = INK.sepia;
  for (const k of clouds) {
    g.beginPath();
    g.ellipse(k.x, k.y, k.rx, k.ry, 0, Math.PI * 1.05, Math.PI * 1.95);
    g.stroke();
  }
  // sun rays
  g.lineWidth = 1.4;
  g.globalAlpha = 0.38;
  for (let i = 0; i < 0; i++) {
    const a = Math.PI + (i / 63) * Math.PI;
    const r0 = 170, r1 = 240 + (i % 2 ? 90 : 200);
    g.beginPath();
    g.moveTo(sun.x + Math.cos(a) * r0, sun.y + Math.sin(a) * r0);
    g.lineTo(sun.x + Math.cos(a) * r1, sun.y + Math.sin(a) * r1);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.strokeStyle = INK.goldDeep;
  g.lineWidth = 2;
  g.globalAlpha = 0.6;
  g.beginPath();
  g.arc(sun.x, sun.y, 120, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
  // bottom haze band: bare paper where the mountains meet the sky
  const haze = g.createLinearGradient(0, h * 0.7, 0, h);
  haze.addColorStop(0, "rgba(239,226,196,0)");
  haze.addColorStop(1, "rgba(239,226,196,1)");
  g.fillStyle = haze;
  g.fillRect(0, h * 0.7, w, h * 0.3);
  return tex(c);
}

/** Gold clock face: engraved rings, twelve batons, two hands. No text. */
export function clockTexture(size = 512): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  g.fillStyle = "#d9c08a";
  g.fillRect(0, 0, size, size);
  g.strokeStyle = INK.copper;
  g.lineWidth = size * 0.018;
  g.strokeRect(size * 0.03, size * 0.03, size * 0.94, size * 0.94);
  g.beginPath();
  g.arc(m, m, size * 0.42, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = size * 0.006;
  g.beginPath();
  g.arc(m, m, size * 0.36, 0, Math.PI * 2);
  g.stroke();
  // fine radial guilloche
  g.globalAlpha = 0.45;
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    g.beginPath();
    g.moveTo(m + Math.cos(a) * size * 0.08, m + Math.sin(a) * size * 0.08);
    g.lineTo(m + Math.cos(a) * size * 0.34, m + Math.sin(a) * size * 0.34);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.lineWidth = size * 0.03;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 0.3 : 0.34;
    g.beginPath();
    g.moveTo(m + Math.cos(a) * size * r0, m + Math.sin(a) * size * r0);
    g.lineTo(m + Math.cos(a) * size * 0.41, m + Math.sin(a) * size * 0.41);
    g.stroke();
  }
  g.lineCap = "round";
  g.lineWidth = size * 0.028;
  g.beginPath();
  g.moveTo(m, m);
  g.lineTo(m + size * 0.16, m - size * 0.12);
  g.stroke();
  g.lineWidth = size * 0.018;
  g.beginPath();
  g.moveTo(m, m);
  g.lineTo(m - size * 0.03, m - size * 0.3);
  g.stroke();
  return tex(c);
}
