// EP05 cover (CIRCUITFORGE): canvas-drawn textures for the SSD board macro shot.
// Seeded only (prng), system/mono fonts only, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw, srgb = true): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

// ---------- board geometry shared with the 3D scene ----------
export const BOARD = { w: 9, d: 14, z0: 3, z1: -11 }; // x in [-4.5, 4.5], z from 3 (near) to -11 (far)
export type P2 = [number, number]; // [x, z]

/** Octilinear data routes (x, z): from the edge connector, past the controller, into the NAND blocks. */
export const ROUTES: P2[][] = [
  [[-0.22, 2.6], [-0.22, -0.9], [0.0, -1.12], [0.0, -1.9]],
  [[0.22, 2.6], [0.22, -0.55], [0.62, -0.95], [0.62, -2.05]],
  [[-0.62, 2.6], [-0.62, -0.5], [-1.05, -0.93], [-1.05, -1.0]],
  [[0.66, 2.6], [0.66, 0.2], [1.3, -0.44], [1.3, -0.95]],
  [[-1.1, 2.6], [-1.1, 0.4], [-2.1, -0.6], [-2.1, -3.3]],
  [[1.1, 2.6], [1.1, 0.7], [2.4, -0.6], [2.4, -3.4]],
  [[0.0, -3.4], [0.0, -4.6], [-0.6, -5.2], [-0.6, -6.2]],
  [[-1.62, 2.6], [-1.62, 1.0], [-3.2, -0.6], [-3.2, -5.0]],
  [[1.62, 2.6], [1.62, 1.2], [3.3, -0.5], [3.3, -5.2]],
];

const PX = 170; // pixels per world unit on the board texture
const toPx = (x: number, z: number): [number, number] => [(x + BOARD.w / 2) * PX, (BOARD.z0 - z) * PX];

/** FR-4 solder mask with copper routing, vias, pads and silkscreen. */
export function boardTexture(): THREE.Texture {
  return canvasTex("board", BOARD.w * PX, BOARD.d * PX, (ctx, w, h) => {
    const r = prng(55);
    // mask base with soft mottling
    ctx.fillStyle = "#0e3a26";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const x = r() * w, y = r() * h, rad = 80 + r() * 260;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(30,90,60,${0.08 + r() * 0.08})`);
      g.addColorStop(1, "rgba(30,90,60,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // background copper mesh: fine octilinear traces (under mask: muted)
    ctx.lineCap = "round";
    ctx.lineJoin = "miter";
    for (let i = 0; i < 260; i++) {
      let x = r() * w, y = r() * h;
      ctx.strokeStyle = `rgba(70,150,100,${0.22 + r() * 0.2})`;
      ctx.lineWidth = 2 + r() * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 3; s++) {
        const dir = Math.floor(r() * 8) * (Math.PI / 4);
        const len = 40 + r() * 220;
        x += Math.cos(dir) * len;
        y += Math.sin(dir) * len;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(212,175,55,0.85)";
      ctx.beginPath();
      ctx.arc(x, y, 4 + r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // main data routes: exposed copper with bevel highlight
    for (const route of ROUTES) {
      for (const [lw, col] of [
        [18, "#3b1e0c"],
        [13, "#c0702e"],
        [5, "#ffc080"],
      ] as const) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        route.forEach(([x, z], i) => {
          const [px, py] = toPx(x, z);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      const [ex, ey] = toPx(...route[route.length - 1]);
      ctx.fillStyle = "#d4af37";
      ctx.beginPath();
      ctx.arc(ex, ey, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    // vias field
    for (let i = 0; i < 900; i++) {
      const x = r() * w, y = r() * h;
      ctx.fillStyle = "#c9a43a";
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a1a12";
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // silkscreen: component outlines + refdes
    ctx.strokeStyle = "rgba(235,240,235,0.75)";
    ctx.fillStyle = "rgba(235,240,235,0.82)";
    ctx.lineWidth = 3;
    ctx.font = "bold 26px 'Courier New', monospace";
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = r() * h;
      ctx.strokeRect(x, y, 30 + r() * 40, 16 + r() * 20);
      ctx.fillText(`${["C", "R", "U", "L"][Math.floor(r() * 4)]}${Math.floor(r() * 90 + 10)}`, x, y - 6);
    }
  });
}

/** Black epoxy top with laser-etched marking. */
export function nandTopTexture(seed: number, label?: string): THREE.Texture {
  return canvasTex(`nand-${seed}-${label ?? ""}`, 256, 256, (ctx, w, h) => {
    const r = prng(seed);
    ctx.fillStyle = "#16181d";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(255,255,255,${r() * 0.035})`;
      ctx.fillRect(r() * w, r() * h, 1, 1);
    }
    ctx.fillStyle = "rgba(190,196,206,0.55)";
    ctx.beginPath();
    ctx.arc(28, 28, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.fillText(label ?? "3D NAND", 28, 120);
    ctx.font = "18px 'Courier New', monospace";
    ctx.fillText(`TLC ${Math.floor(100 + r() * 800)}L`, 28, 152);
    ctx.fillText(`${Math.floor(1000 + r() * 8999)}-${Math.floor(10 + r() * 89)}`, 28, 178);
  });
}

/** Front plaque of the hero stack: etched "212 GB". */
export function heroLabelTexture(): THREE.Texture {
  return canvasTex("hero-label", 640, 200, (ctx, w, h) => {
    ctx.fillStyle = "#121419";
    ctx.fillRect(0, 0, w, h);
    const r = prng(7);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${r() * 0.03})`;
      ctx.fillRect(r() * w, r() * h, 1, 1);
    }
    ctx.fillStyle = "#f3efe6";
    ctx.textAlign = "center";
    ctx.font = "bold 128px 'Arial Black', Arial, sans-serif";
    ctx.fillText("212 GB", w / 2, 140);
    ctx.fillStyle = "rgba(220,224,230,0.7)";
    ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillText("AUDIRA  ·  3D NAND STACK", w / 2, 184);
    ctx.fillStyle = "rgba(255,183,3,0.9)";
    ctx.beginPath();
    ctx.arc(28, 28, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Sunset sky with a far, generic beach-city silhouette (palms + low towers). No game assets. */
export function skyTexture(): THREE.Texture {
  return canvasTex("sky", 2048, 1024, (ctx, w, h) => {
    const horizon = h * 0.62;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#120a24");
    g.addColorStop(0.3, "#3a1452");
    g.addColorStop(0.47, "#a8256e");
    g.addColorStop(0.56, "#ff4f7a");
    g.addColorStop(0.62, "#ffb057");
    g.addColorStop(0.68, "#ff7a45");
    g.addColorStop(0.8, "#4a1640");
    g.addColorStop(1, "#1a0c22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // sun disc with soft bands
    const sx = w * 0.53, sy = horizon - 14;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 220);
    sg.addColorStop(0, "rgba(255,236,190,0.95)");
    sg.addColorStop(0.25, "rgba(255,190,110,0.6)");
    sg.addColorStop(1, "rgba(255,120,90,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(sx - 220, sy - 220, 440, 440);
    // skyline silhouette
    const r = prng(91);
    ctx.fillStyle = "#4a163f";
    let x = 0;
    while (x < w) {
      const bw = 6 + r() * 16;
      const bh = 3 + r() * (r() < 0.12 ? 34 : 12);
      ctx.fillRect(x, horizon - bh, bw, bh + 4);
      x += bw + r() * 10;
    }
    ctx.fillRect(0, horizon, w, h - horizon);
    // palms
    const palm = (px: number, ph: number, lean: number) => {
      ctx.strokeStyle = "#4a163f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, horizon);
      ctx.quadraticCurveTo(px + lean * 0.5, horizon - ph * 0.6, px + lean, horizon - ph);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      const tx = px + lean, ty = horizon - ph;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI + (i / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(tx + Math.cos(a) * 14, ty + Math.sin(a) * 10 - 4, tx + Math.cos(a) * 24, ty + Math.sin(a) * 7 + 8);
        ctx.stroke();
      }
    };
    palm(w * 0.12, 54, 7);
    palm(w * 0.17, 43, -6);
    palm(w * 0.82, 58, -8);
    palm(w * 0.88, 47, 5);
    palm(w * 0.44, 40, 4);
  });
}
