// EP01 cover textures (SKETCHFORGE): graphite-on-cream canvas drawings.
// Seeded only (prng), system fonts only, cached, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";

type Ctx = CanvasRenderingContext2D;
type Draw = (ctx: Ctx, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw, bg: string | null = P.paper): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

const HAND = "'Segoe Print', 'Comic Sans MS', cursive";
const SANS = "'Arial Black', 'Segoe UI', Arial, sans-serif";
const MONO = "'Courier New', monospace";
const G = (a: number) => `rgba(47,48,52,${a})`;

/** Paper tooth + faint smudges. */
export function tooth(ctx: Ctx, w: number, h: number, seed: number, amount = 1) {
  const r = prng(seed);
  for (let i = 0; i < (w * h) / 70 * amount; i++) {
    ctx.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.22)" : "rgba(120,110,95,0.07)";
    ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  for (let i = 0; i < 4 * amount; i++) {
    const x = r() * w, y = r() * h, rad = 60 + r() * w * 0.15;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(60,60,66,0.07)");
    g.addColorStop(1, "rgba(60,60,66,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

/** Sketchy line: two slightly jittered passes with a small overshoot. */
export function sline(ctx: Ctx, r: () => number, x1: number, y1: number, x2: number, y2: number, a = 0.8, lw = 2.4) {
  for (let k = 0; k < 2; k++) {
    const j = () => (r() - 0.5) * 2.2;
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const o = 4 + r() * 6;
    ctx.strokeStyle = G(a * (k ? 0.55 : 1));
    ctx.lineWidth = lw * (k ? 0.7 : 1);
    ctx.beginPath();
    ctx.moveTo(x1 - (dx / L) * o + j(), y1 - (dy / L) * o + j());
    ctx.quadraticCurveTo((x1 + x2) / 2 + j() * 2, (y1 + y2) / 2 + j() * 2, x2 + (dx / L) * o + j(), y2 + (dy / L) * o + j());
    ctx.stroke();
  }
}

/** Parallel hatching clipped to the current path (call after ctx.beginPath + path). */
export function hatchClip(ctx: Ctx, w: number, h: number, angle: number, gap: number, a: number, lw = 1.6, seed = 1) {
  const r = prng(seed);
  ctx.save();
  ctx.clip();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(angle);
  const D = Math.hypot(w, h);
  ctx.lineWidth = lw;
  for (let x = -D; x < D; x += gap) {
    ctx.strokeStyle = G(a * (0.7 + r() * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + (r() - 0.5) * 2, -D);
    ctx.lineTo(x + (r() - 0.5) * 2, D);
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ sketchbook page
/** Page drawing. World mapping: u = x / PAGE_W + 0.5, v = z / PAGE_D + 0.5 (page centre at origin). */
export const PAGE_W = 5.2;
export const PAGE_D = 6.6;
export const pageTexture = (footprints: { x: number; z: number; w: number; d: number; rot?: number }[]) =>
  canvasTex("page", 1040, 1320, (ctx, w, h) => {
    tooth(ctx, w, h, 63, 1.2);
    const r = prng(11);
    // margin rule + faint grid of construction lines
    ctx.strokeStyle = "rgba(240,83,45,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(70, h);
    ctx.stroke();
    for (let i = 0; i < 9; i++) sline(ctx, r, 90, 110 + i * 140, w - 40, 110 + i * 140 + (r() - 0.5) * 6, 0.07, 1.4);
    // perspective guide lines to a vanishing point above the desk
    const vx = w * 0.53, vy = h * 0.08;
    for (let i = 0; i < 7; i++) sline(ctx, r, vx, vy, 60 + i * 160, h - 30, 0.09, 1.4);
    // plan footprints under the 3D objects (the drawing the objects lifted from)
    for (const fp of footprints) {
      const cx = (fp.x / PAGE_W + 0.5) * w, cy = (fp.z / PAGE_D + 0.5) * h;
      const hw = (fp.w / PAGE_W) * w * 0.5, hd = (fp.d / PAGE_D) * h * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-(fp.rot ?? 0));
      ctx.setLineDash([14, 10]);
      ctx.strokeStyle = G(0.55);
      ctx.lineWidth = 2.6;
      ctx.strokeRect(-hw - 10, -hd - 10, hw * 2 + 20, hd * 2 + 20);
      ctx.setLineDash([]);
      sline(ctx, r, -hw, -hd, hw, -hd, 0.5);
      sline(ctx, r, hw, -hd, hw, hd, 0.5);
      sline(ctx, r, hw, hd, -hw, hd, 0.5);
      sline(ctx, r, -hw, hd, -hw, -hd, 0.5);
      ctx.beginPath();
      ctx.rect(-hw, -hd, hw * 2, hd * 2);
      hatchClip(ctx, hw * 2, hd * 2, 0.8, 11, 0.12, 1.4, 5);
      ctx.restore();
    }
    // pencil notes (only HIGH facts)
    ctx.fillStyle = G(0.62);
    ctx.font = `italic 34px ${HAND}`;
    ctx.save();
    ctx.translate(110, 1215);
    ctx.rotate(-0.02);
    ctx.fillText("Istana — Selasa, 10 Nov 2026", 0, 0);
    ctx.font = `italic 28px ${HAND}`;
    ctx.fillText("pertemuan ±2,5 jam  ·  niat ≠ mundur", 0, 46);
    ctx.restore();
    ctx.font = `italic 26px ${HAND}`;
    ctx.fillStyle = G(0.45);
    ctx.fillText("ruang kerja wapres (studi)", 120, 70);
    // arrows / question marks in the margin
    ctx.font = `italic 64px ${HAND}`;
    ctx.fillStyle = G(0.4);
    ctx.fillText("?", w - 110, 360);
    ctx.fillText("?", w - 150, 470);
  });

// ------------------------------------------------------------------ hatched faces for solids
/** kind: top = clean + smudge, front = single hatch, side = cross hatch (shadow side). */
export const faceTexture = (kind: "top" | "front" | "side", tone: string, seed: number, label?: string) =>
  canvasTex(`face:${kind}:${tone}:${seed}:${label ?? ""}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = tone;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, seed, 1);
    const r = prng(seed + 3);
    if (kind === "front" || kind === "side") {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      hatchClip(ctx, w, h, 0.75, kind === "side" ? 9 : 13, kind === "side" ? 0.26 : 0.16, 1.7, seed);
    }
    if (kind === "side") {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      hatchClip(ctx, w, h, -0.75, 12, 0.18, 1.5, seed + 9);
    }
    if (kind === "top") {
      const g = ctx.createRadialGradient(w * 0.7, h * 0.4, 0, w * 0.7, h * 0.4, w * 0.5);
      g.addColorStop(0, "rgba(60,60,66,0.10)");
      g.addColorStop(1, "rgba(60,60,66,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    // pencil outline near the edges
    const m = 10;
    sline(ctx, r, m, m, w - m, m, 0.85, 3);
    sline(ctx, r, w - m, m, w - m, h - m, 0.85, 3);
    sline(ctx, r, w - m, h - m, m, h - m, 0.85, 3);
    sline(ctx, r, m, h - m, m, m, 0.85, 3);
    if (label) {
      ctx.fillStyle = G(0.9);
      ctx.font = `900 64px ${SANS}`;
      ctx.textAlign = "center";
      ctx.fillText(label, w / 2, h / 2 + 22);
    }
  });

// ------------------------------------------------------------------ MA ruling document
export const documentTexture = () =>
  canvasTex("doc", 760, 1000, (ctx, w, h) => {
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 742, 0.8);
    ctx.fillStyle = G(0.92);
    ctx.textAlign = "center";
    ctx.font = `900 40px ${SANS}`;
    ctx.fillText("MAHKAMAH AGUNG", w / 2, 92);
    ctx.font = `700 30px ${MONO}`;
    ctx.fillText("REPUBLIK INDONESIA", w / 2, 134);
    ctx.fillRect(80, 160, w - 160, 4);
    ctx.font = `900 46px ${SANS}`;
    ctx.fillText("P U T U S A N", w / 2, 236);
    ctx.font = `700 34px ${MONO}`;
    ctx.fillText("Nomor 742 K/TUN/2026", w / 2, 288);
    // body lines (illegible pencil-grey bars)
    const r = prng(42);
    ctx.textAlign = "left";
    for (let i = 0; i < 12; i++) {
      const y = 350 + i * 40;
      const len = (w - 160) * (0.55 + r() * 0.45);
      ctx.fillStyle = G(0.22 + r() * 0.1);
      ctx.fillRect(80, y, len, 9);
    }
    // stamp, vermilion accent, rubber-stamp erosion
    ctx.save();
    ctx.translate(w / 2, 840);
    ctx.rotate(-0.09);
    ctx.strokeStyle = P.accentDeep;
    ctx.fillStyle = P.accentDeep;
    ctx.lineWidth = 9;
    ctx.strokeRect(-320, -96, 640, 192);
    ctx.lineWidth = 3;
    ctx.strokeRect(-302, -78, 604, 156);
    ctx.textAlign = "center";
    ctx.font = `900 58px ${SANS}`;
    ctx.fillText("PUTUSAN MA", 0, -10);
    ctx.font = `900 50px ${SANS}`;
    ctx.fillText("742 K/TUN/2026", 0, 56);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const e = prng(7);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.2 + e() * 0.5})`;
      const s = 1 + e() * 3;
      ctx.fillRect(110 + e() * (w - 220), 730 + e() * 220, s, s);
    }
    ctx.restore();
    // re-lay paper under the erased stamp pixels
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  });

// ------------------------------------------------------------------ sealed envelope
export const envelopeTexture = () =>
  canvasTex("env", 800, 520, (ctx, w, h) => {
    ctx.fillStyle = "#EFE5D2";
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 88, 1);
    const r = prng(5);
    // flap lines
    sline(ctx, r, 14, 14, w / 2, h * 0.56, 0.7, 3);
    sline(ctx, r, w - 14, 14, w / 2, h * 0.56, 0.7, 3);
    sline(ctx, r, 14, h - 14, w * 0.4, h * 0.5, 0.35, 2);
    sline(ctx, r, w - 14, h - 14, w * 0.6, h * 0.5, 0.35, 2);
    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(w / 2, h * 0.56);
    ctx.lineTo(w - 14, 14);
    ctx.closePath();
    hatchClip(ctx, w, h, 0.9, 12, 0.14, 1.5, 3);
    // border
    sline(ctx, r, 10, 10, w - 10, 10, 0.85, 3);
    sline(ctx, r, w - 10, 10, w - 10, h - 10, 0.85, 3);
    sline(ctx, r, w - 10, h - 10, 10, h - 10, 0.85, 3);
    sline(ctx, r, 10, h - 10, 10, 10, 0.85, 3);
    // pencil question mark (undecided), no address: no official letter exists
    ctx.fillStyle = G(0.55);
    ctx.font = `italic 64px ${HAND}`;
    ctx.fillText("?", w * 0.78, h * 0.86);
  });

// ------------------------------------------------------------------ AUDIRA folder tag
export const folderTagTexture = () =>
  canvasTex("tag", 512, 160, (ctx, w, h) => {
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 9, 0.6);
    ctx.fillStyle = P.accent;
    ctx.fillRect(0, 0, 26, h);
    ctx.fillStyle = G(0.95);
    ctx.font = `900 64px ${SANS}`;
    ctx.fillText("AUDIRA", 56, 82);
    ctx.font = `700 28px ${MONO}`;
    ctx.fillStyle = G(0.7);
    ctx.fillText("ARSIP · 10.11.2026", 58, 128);
    ctx.strokeStyle = G(0.8);
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, w - 6, h - 6);
  });

// ------------------------------------------------------------------ desk name plate
export const plateTexture = () =>
  canvasTex("plate", 720, 150, (ctx, w, h) => {
    ctx.fillStyle = P.graphite;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#F3EBDD";
    ctx.textAlign = "center";
    ctx.font = `900 54px ${SANS}`;
    ctx.fillText("WAKIL PRESIDEN", w / 2, 96);
    ctx.strokeStyle = "rgba(243,235,221,0.6)";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  });

// ------------------------------------------------------------------ sketched figures (paper cut-outs)
export type FigureSpec = {
  key: string;
  build: number; // shoulder width factor
  jacket: "suit" | "safari";
  jacketTone: string;
  peci: boolean;
  tie: boolean;
  holdPaper?: boolean;
  hands?: "side" | "clasp";
  headTilt?: number;
  /** Seen from behind (film only): no face, hair/peci covers the head, no shirt front. */
  backView?: boolean;
  seed: number;
};

export const FIG_W = 512;
export const FIG_H = 1280;

function drawFigure(ctx: Ctx, s: FigureSpec) {
  const r = prng(s.seed);
  const cx = FIG_W / 2;
  const b = s.build;
  const shY = 238, hipY = 650, footY = 1236;
  const shW = 128 * b, hipW = 104 * b;
  const ink = (a = 0.9, lw = 3) => {
    ctx.strokeStyle = G(a);
    ctx.lineWidth = lw;
  };
  const shape = (pts: [number, number][], fill: string, hatch?: { ang: number; gap: number; a: number }, close = true) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (hatch) {
      ctx.save();
      hatchClip(ctx, FIG_W, FIG_H, hatch.ang, hatch.gap, hatch.a, 1.6, s.seed + pts.length);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      if (close) ctx.closePath();
    }
    for (let k = 0; k < 2; k++) {
      ink(k ? 0.45 : 0.9, k ? 2 : 3.2);
      ctx.save();
      ctx.translate((r() - 0.5) * 2.5, (r() - 0.5) * 2.5);
      ctx.stroke();
      ctx.restore();
    }
  };
  const dark = s.jacketTone;
  const trouser = s.jacket === "safari" ? "#4A4B50" : dark;
  // legs
  const legGap = 10;
  shape([[cx - hipW + 8, hipY - 20], [cx - legGap, hipY - 10], [cx - legGap - 6, footY - 30], [cx - hipW * 0.62, footY - 30]], trouser, { ang: 0.6, gap: 9, a: 0.22 });
  shape([[cx + legGap, hipY - 10], [cx + hipW - 8, hipY - 20], [cx + hipW * 0.62, footY - 30], [cx + legGap + 6, footY - 30]], trouser, { ang: 0.6, gap: 7, a: 0.3 });
  // shoes
  shape([[cx - hipW * 0.66, footY - 34], [cx - legGap - 2, footY - 34], [cx - legGap + 4, footY], [cx - hipW * 0.82, footY], [cx - hipW * 0.8, footY - 18]], "#26262A");
  shape([[cx + legGap + 2, footY - 34], [cx + hipW * 0.66, footY - 34], [cx + hipW * 0.82, footY - 18], [cx + hipW * 0.82, footY], [cx + legGap - 4, footY]], "#26262A");
  // arms (behind torso edges)
  const handY = s.hands === "clasp" ? hipY - 40 : hipY + 30;
  const armOut = s.hands === "clasp" ? -10 : 18;
  shape([[cx - shW + 6, shY + 6], [cx - shW - 30, shY + 40], [cx - shW - armOut - 34, handY - 40], [cx - shW - armOut + 22, handY - 30], [cx - shW + 34, shY + 80]], dark, { ang: 0.7, gap: 10, a: 0.18 });
  shape([[cx + shW - 6, shY + 6], [cx + shW + 30, shY + 40], [cx + shW + armOut + 34, handY - 40], [cx + shW + armOut - 22, handY - 30], [cx + shW - 34, shY + 80]], dark, { ang: 0.7, gap: 7, a: 0.3 });
  // hands
  const skin = "#E6D3B8";
  if (s.hands === "clasp") {
    ctx.beginPath();
    ctx.ellipse(cx, hipY - 34, 46, 30, 0, 0, Math.PI * 2);
    ctx.fillStyle = skin;
    ctx.fill();
    ink(0.85, 3);
    ctx.stroke();
  } else {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + sx * (shW + armOut - 6), handY - 12, 22, 32, sx * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = skin;
      ctx.fill();
      ink(0.85, 3);
      ctx.stroke();
    }
  }
  // torso / jacket
  const torso: [number, number][] = [
    [cx - shW, shY + 4],
    [cx - 40, shY - 14],
    [cx + 40, shY - 14],
    [cx + shW, shY + 4],
    [cx + shW - 8, shY + 90],
    [cx + hipW + 4, hipY + 30],
    [cx - hipW - 4, hipY + 30],
    [cx - shW + 8, shY + 90],
  ];
  shape(torso, s.jacket === "safari" ? "#D8CDB8" : dark, { ang: 0.75, gap: s.jacket === "safari" ? 14 : 9, a: s.jacket === "safari" ? 0.14 : 0.2 });
  // right-side shadow cross hatch on torso
  ctx.beginPath();
  ctx.moveTo(cx + shW * 0.45, shY);
  ctx.lineTo(cx + shW, shY + 4);
  ctx.lineTo(cx + hipW + 4, hipY + 30);
  ctx.lineTo(cx + hipW * 0.4, hipY + 30);
  ctx.closePath();
  hatchClip(ctx, FIG_W, FIG_H, -0.7, 8, 0.2, 1.4, s.seed + 31);
  if (s.backView) {
    const rb = prng(s.seed + 4);
    sline(ctx, rb, cx, shY + 10, cx, hipY + 26, 0.6, 2.4);
  } else if (s.jacket === "suit") {
    // shirt V
    shape([[cx - 38, shY - 12], [cx + 38, shY - 12], [cx + 6, shY + 170], [cx - 6, shY + 170]], "#F7F1E6");
    if (s.tie) shape([[cx - 12, shY - 4], [cx + 12, shY - 4], [cx + 16, shY + 150], [cx, shY + 172], [cx - 16, shY + 150]], "#3A3B40", { ang: 0.3, gap: 6, a: 0.3 });
    // lapels
    shape([[cx - 40, shY - 12], [cx - 76, shY + 40], [cx - 52, shY + 70], [cx - 8, shY + 176]], dark, { ang: -0.6, gap: 6, a: 0.25 }, true);
    shape([[cx + 40, shY - 12], [cx + 76, shY + 40], [cx + 52, shY + 70], [cx + 8, shY + 176]], dark, { ang: -0.6, gap: 6, a: 0.25 }, true);
    // buttons
    for (const y of [shY + 230, shY + 300]) {
      ctx.beginPath();
      ctx.arc(cx + 6, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = G(0.85);
      ctx.fill();
    }
  } else {
    // safari: collar, placket, 4 flap pockets, belt
    shape([[cx - 44, shY - 14], [cx - 84, shY + 30], [cx - 30, shY + 52], [cx, shY + 20]], "#D8CDB8");
    shape([[cx + 44, shY - 14], [cx + 84, shY + 30], [cx + 30, shY + 52], [cx, shY + 20]], "#D8CDB8");
    const rr = prng(s.seed + 2);
    sline(ctx, rr, cx, shY + 30, cx, hipY + 26, 0.8, 2.6);
    for (const [px, py, pw, ph] of [[-96, 90, 70, 74], [26, 90, 70, 74], [-108, 300, 82, 92], [26, 300, 82, 92]] as const) {
      ctx.strokeStyle = G(0.8);
      ctx.lineWidth = 2.6;
      ctx.strokeRect(cx + px, shY + py, pw, ph);
      sline(ctx, rr, cx + px - 3, shY + py + 22, cx + px + pw + 3, shY + py + 22, 0.8, 2.6);
    }
    shape([[cx - hipW - 2, hipY - 30], [cx + hipW + 2, hipY - 30], [cx + hipW + 3, hipY - 6], [cx - hipW - 3, hipY - 6]], "#B9AE98", { ang: 0.4, gap: 6, a: 0.25 });
    for (const y of [shY + 70, shY + 160, shY + 250, shY + 340]) {
      ctx.beginPath();
      ctx.arc(cx + 8, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = G(0.75);
      ctx.fill();
    }
  }
  // paper held in the right hand (announcement sheet)
  if (s.holdPaper) {
    ctx.save();
    ctx.translate(cx + shW + armOut + 2, handY - 60);
    ctx.rotate(0.22);
    ctx.fillStyle = "#FBF7EF";
    ctx.fillRect(-40, -20, 96, 128);
    ctx.strokeStyle = G(0.85);
    ctx.lineWidth = 3;
    ctx.strokeRect(-40, -20, 96, 128);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = G(0.3);
      ctx.fillRect(-28, -2 + i * 20, 68, 5);
    }
    ctx.restore();
  }
  // neck
  shape([[cx - 26, shY - 40], [cx + 26, shY - 40], [cx + 30, shY - 6], [cx - 30, shY - 6]], skin, { ang: -0.7, gap: 7, a: 0.12 });
  // head (editorial sketch: shape + shading only, no portrait likeness)
  ctx.save();
  ctx.translate(cx, 126);
  ctx.rotate(s.headTilt ?? 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 78, 0, 0, Math.PI * 2);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 78, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.rect(14, -90, 70, 180);
  hatchClip(ctx, 200, 200, -0.7, 7, 0.22, 1.4, s.seed + 5);
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 78, 0, 0, Math.PI * 2);
  ink(0.9, 3.2);
  ctx.stroke();
  // ears
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sx * 60, 8, 11, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = skin;
    ctx.fill();
    ink(0.8, 2.6);
    ctx.stroke();
  }
  // a few light construction strokes (brow line, nose, mouth) — no portrait detail
  const rh = prng(s.seed + 77);
  if (!s.backView) {
    sline(ctx, rh, -34, -6, -10, -8, 0.55, 2.4);
    sline(ctx, rh, 10, -8, 34, -6, 0.55, 2.4);
    sline(ctx, rh, 2, -2, -4, 26, 0.4, 2);
    sline(ctx, rh, -14, 44, 14, 44, 0.45, 2.2);
  } else {
    // back of the head: hair down to the nape
    ctx.beginPath();
    ctx.ellipse(0, 0, 60, 78, 0, Math.PI * 1.02, Math.PI * 1.98, false);
    ctx.lineTo(56, 30);
    ctx.quadraticCurveTo(0, 50, -56, 30);
    ctx.closePath();
    ctx.fillStyle = "#2A2B30";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, 60, 78, 0, 0, Math.PI * 2);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#2A2B30";
    ctx.fillRect(-70, -90, 140, 128);
    ctx.restore();
  }
  // hair or peci
  if (s.peci) {
    ctx.beginPath();
    ctx.moveTo(-58, -38);
    ctx.lineTo(-52, -92);
    ctx.quadraticCurveTo(0, -102, 52, -92);
    ctx.lineTo(58, -38);
    ctx.quadraticCurveTo(0, -48, -58, -38);
    ctx.fillStyle = "#1E1F23";
    ctx.fill();
    ink(0.95, 3);
    ctx.stroke();
    ctx.strokeStyle = "rgba(243,235,221,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-40, -86);
    ctx.quadraticCurveTo(0, -94, 40, -86);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-62, -6);
    ctx.quadraticCurveTo(-70, -84, -6, -86);
    ctx.quadraticCurveTo(58, -88, 64, -10);
    ctx.quadraticCurveTo(40, -58, -18, -54);
    ctx.quadraticCurveTo(-46, -44, -62, -6);
    ctx.fillStyle = "#2A2B30";
    ctx.fill();
    ink(0.95, 3);
    ctx.stroke();
  }
  ctx.restore();
}

/** Figure drawing with a cream paper margin around the silhouette (cut-out look). Transparent elsewhere. */
export const figureTexture = (s: FigureSpec) => {
  const t = canvasTex(
    `fig:${s.key}`,
    FIG_W,
    FIG_H,
    (ctx) => {
      const tmp = document.createElement("canvas");
      tmp.width = FIG_W;
      tmp.height = FIG_H;
      const tc = tmp.getContext("2d")!;
      tc.translate(0, 20);
      tc.scale(1, 0.97);
      drawFigure(tc, s);
      // silhouette in paper colour
      const sil = document.createElement("canvas");
      sil.width = FIG_W;
      sil.height = FIG_H;
      const sc = sil.getContext("2d")!;
      sc.drawImage(tmp, 0, 0);
      sc.globalCompositeOperation = "source-in";
      sc.fillStyle = "#F6EFE2";
      sc.fillRect(0, 0, FIG_W, FIG_H);
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        ctx.drawImage(sil, Math.cos(a) * 12, Math.sin(a) * 12);
      }
      ctx.drawImage(tmp, 0, 0);
    },
    null,
  );
  return t;
};

/** Plain back of the cut-out (cream silhouette with a pencil scribble). */
export const figureBackTexture = (s: FigureSpec) =>
  canvasTex(
    `figback:${s.key}`,
    FIG_W,
    FIG_H,
    (ctx) => {
      const front = figureTexture(s) as THREE.CanvasTexture;
      const img = front.image as HTMLCanvasElement;
      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = "#EDE3D0";
      ctx.fillRect(0, 0, FIG_W, FIG_H);
    },
    null,
  );
