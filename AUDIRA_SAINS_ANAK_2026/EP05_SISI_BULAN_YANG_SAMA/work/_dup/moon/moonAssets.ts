// EP05 Sisi Bulan — procedural Moon + star textures (CanvasTexture, seeded, deterministic).
// Near side (local +z, u = 0.25 on SphereGeometry) carries the dark maria we see every night;
// the far side is brighter and densely cratered with almost no maria (true to the real Moon).
import * as THREE from "three";
import { prng } from "../../kits/scaleforge/core/motion";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};

let moonCache: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;

export const makeMoonTextures = () => {
  if (moonCache) return moonCache;
  const W = 2048;
  const H = 1024;
  const [c, g] = canvas(W, H);
  const [bc, bg] = canvas(W, H);
  const r = prng(505);
  g.fillStyle = "#A7A59F";
  g.fillRect(0, 0, W, H);
  bg.fillStyle = "#808080";
  bg.fillRect(0, 0, W, H);
  // fine regolith grain
  for (let i = 0; i < 60000; i++) {
    const v = r();
    g.fillStyle = v > 0.5 ? `rgba(200,198,190,${0.05 + r() * 0.08})` : `rgba(70,68,64,${0.05 + r() * 0.08})`;
    g.fillRect(r() * W, r() * H, 2 + r() * 3, 2 + r() * 3);
  }
  // maria: dark basalt plains clustered on the near side (u 0.13 .. 0.37)
  const maria = [
    [0.21, 0.36, 150, 110], [0.27, 0.42, 120, 90], [0.3, 0.33, 90, 70], [0.24, 0.55, 140, 120],
    [0.18, 0.47, 110, 80], [0.31, 0.58, 80, 70], [0.2, 0.62, 70, 60], [0.33, 0.47, 70, 90],
    [0.15, 0.4, 60, 70], [0.78, 0.4, 40, 30],
  ];
  for (const [u, v, rx, ry] of maria) {
    for (let k = 0; k < 14; k++) {
      g.fillStyle = `rgba(62,62,66,${0.12 + r() * 0.1})`;
      g.beginPath();
      g.ellipse(u * W + (r() - 0.5) * rx, v * H + (r() - 0.5) * ry, rx * (0.45 + r() * 0.5), ry * (0.45 + r() * 0.5), r() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }
  // craters: more on the far side
  const crater = (x: number, y: number, rad: number) => {
    const grd = g.createRadialGradient(x - rad * 0.2, y - rad * 0.2, rad * 0.1, x, y, rad);
    grd.addColorStop(0, "rgba(80,78,74,0.55)");
    grd.addColorStop(0.75, "rgba(110,108,102,0.35)");
    grd.addColorStop(0.9, "rgba(225,222,214,0.55)");
    grd.addColorStop(1, "rgba(225,222,214,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
    const bgr = bg.createRadialGradient(x, y, 0, x, y, rad);
    bgr.addColorStop(0, "rgba(40,40,40,1)");
    bgr.addColorStop(0.8, "rgba(90,90,90,1)");
    bgr.addColorStop(0.92, "rgba(200,200,200,1)");
    bgr.addColorStop(1, "rgba(128,128,128,0)");
    bg.fillStyle = bgr;
    bg.beginPath();
    bg.arc(x, y, rad, 0, Math.PI * 2);
    bg.fill();
  };
  for (let i = 0; i < 900; i++) {
    const u = r();
    const far = u > 0.5 && u < 1.0;
    if (!far && r() < 0.45) continue;
    const rad = (r() < 0.06 ? 22 + r() * 30 : 3 + r() * 11) * (far ? 1.1 : 1);
    crater(u * W, 60 + r() * (H - 120), rad);
  }
  // Tycho-like bright ray crater on the near side
  g.strokeStyle = "rgba(235,232,225,0.22)";
  g.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    const a = r() * Math.PI * 2;
    g.beginPath();
    g.moveTo(0.25 * W, 0.78 * H);
    g.lineTo(0.25 * W + Math.cos(a) * (120 + r() * 160), 0.78 * H + Math.sin(a) * (80 + r() * 120));
    g.stroke();
  }
  crater(0.25 * W, 0.78 * H, 18);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(bc);
  moonCache = { map, bump };
  return moonCache;
};

let starCache: THREE.CanvasTexture | null = null;
/** Star field painted on an inward-facing sky sphere (background only). */
export const makeStarTexture = () => {
  if (starCache) return starCache;
  const [c, g] = canvas(2048, 1024);
  g.fillStyle = "#03050B";
  g.fillRect(0, 0, 2048, 1024);
  const r = prng(77);
  for (let i = 0; i < 2600; i++) {
    const b = r();
    g.fillStyle = `rgba(${210 + r() * 45},${215 + r() * 40},255,${0.25 + b * 0.7})`;
    const s = b > 0.97 ? 2.6 : b > 0.85 ? 1.7 : 1.1;
    g.fillRect(r() * 2048, r() * 1024, s, s);
  }
  // faint milky band
  for (let i = 0; i < 400; i++) {
    const x = r() * 2048;
    const y = 520 + Math.sin(x / 300) * 80 + (r() - 0.5) * 120;
    g.fillStyle = `rgba(150,170,220,${0.02 + r() * 0.03})`;
    g.beginPath();
    g.arc(x, y, 20 + r() * 40, 0, Math.PI * 2);
    g.fill();
  }
  starCache = new THREE.CanvasTexture(c);
  starCache.colorSpace = THREE.SRGBColorSpace;
  return starCache;
};
