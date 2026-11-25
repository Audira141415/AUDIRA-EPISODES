// EP06 cover: canvas textures (1863 rulebook pages, leather ball, oak table, tavern wall, plaques).
// Seeded only (prng), so every render tab draws the same pixels. Page text uses IM Fell English,
// which Cover.tsx loads (and waits for) before any texture here is built.
// Law lines follow the 1863 FA text (SOURCE_REGISTER #8-#10, #14, #42; all HIGH).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

export const FELL = "'IM Fell English', Georgia, 'Times New Roman', serif";

export const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw, color = true): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  cache.set(key, t);
  return t;
}

export const INK = "#2A1A0E";
export const RED_INK = "#8A2E1C";

/** Aged laid paper: warm base, foxing spots, chain lines, darker deckle edge. */
export function parchment(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, gutterRight: boolean) {
  ctx.fillStyle = "#E9DCBC";
  ctx.fillRect(0, 0, w, h);
  const r = prng(seed);
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = r() * h, rad = 20 + r() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(150,105,50,${0.04 + r() * 0.07})`);
    g.addColorStop(1, "rgba(150,105,50,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(110,70,30,${0.08 + r() * 0.2})`;
    const s = 1 + r() * 3;
    ctx.fillRect(r() * w, r() * h, s, s);
  }
  ctx.strokeStyle = "rgba(120,90,50,0.05)";
  ctx.lineWidth = 2;
  for (let x = 30; x < w; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  // gutter shadow + outer edge tone
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  if (gutterRight) {
    gx.addColorStop(0, "rgba(120,80,35,0.28)");
    gx.addColorStop(0.08, "rgba(120,80,35,0)");
    gx.addColorStop(0.86, "rgba(60,35,15,0)");
    gx.addColorStop(1, "rgba(60,35,15,0.5)");
  } else {
    gx.addColorStop(0, "rgba(60,35,15,0.5)");
    gx.addColorStop(0.14, "rgba(60,35,15,0)");
    gx.addColorStop(0.92, "rgba(120,80,35,0)");
    gx.addColorStop(1, "rgba(120,80,35,0.28)");
  }
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgba(120,80,35,0.22)");
  gy.addColorStop(0.07, "rgba(120,80,35,0)");
  gy.addColorStop(0.93, "rgba(120,80,35,0)");
  gy.addColorStop(1, "rgba(120,80,35,0.22)");
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);
}

export function frameRule(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(54, 54, w - 108, h - 108);
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 70, w - 140, h - 140);
}

export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, opts: { italic?: boolean; align?: CanvasTextAlign; color?: string; spacing?: number } = {}) {
  ctx.font = `${opts.italic ? "italic " : ""}${size}px ${FELL}`;
  ctx.textAlign = opts.align ?? "center";
  ctx.textBaseline = "alphabetic";
  // letterSpacing is supported by Chromium canvas
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${opts.spacing ?? 0}px`;
  // a faint pressed halo, then the ink: reads as printed/engraved into the page
  ctx.fillStyle = "rgba(90,55,20,0.18)";
  ctx.fillText(s, x + 1.5, y + 2);
  ctx.fillStyle = opts.color ?? INK;
  ctx.fillText(s, x, y);
  (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
}

/** Copperplate hatching inside a path-clipped region. */
export function hatch(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, step: number, angle: number, alpha: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, x1 - x0, y1 - y0);
  ctx.clip();
  ctx.strokeStyle = `rgba(42,26,14,${alpha})`;
  ctx.lineWidth = 1.6;
  const d = Math.hypot(x1 - x0, y1 - y0);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  for (let t = -d; t < d; t += step) {
    ctx.beginPath();
    ctx.moveTo(cx + ca * t - sa * d, cy + sa * t + ca * d);
    ctx.lineTo(cx + ca * t + sa * d, cy + sa * t - ca * d);
    ctx.stroke();
  }
  ctx.restore();
}

/** Left page: title + engraved plate of the 1863 goal (two posts, 8 yards, no bar). */
export const leftPage = () =>
  canvasTex("ep06-left", 1024, 1380, (ctx, w, h) => {
    parchment(ctx, w, h, 1863, true);
    frameRule(ctx, w, h);
    text(ctx, "LAWS", w / 2, 230, 150, { spacing: 10 });
    text(ctx, "OF THE GAME", w / 2, 330, 86, { spacing: 6 });
    // ornament rule
    ctx.fillStyle = INK;
    ctx.fillRect(w * 0.24, 372, w * 0.52, 4);
    ctx.beginPath();
    ctx.arc(w / 2, 374, 12, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, "1863", w / 2, 488, 120, { spacing: 12 });

    // engraved plate
    const px0 = 130, py0 = 540, px1 = w - 130, py1 = 1050;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
    // sky hatching (light) and ground hatching (dense)
    hatch(ctx, px0, py0, px1, py1 - 150, 14, 0.12, 0.22);
    hatch(ctx, px0, py1 - 150, px1, py1, 7, -0.08, 0.5);
    hatch(ctx, px0, py1 - 150, px1, py1, 9, 0.9, 0.25);
    // horizon
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px0, py1 - 150);
    ctx.lineTo(px1, py1 - 150);
    ctx.stroke();
    // two posts, no tape, no bar
    const postL = 300, postR = w - 300, top = 640, base = py1 - 120;
    for (const x of [postL, postR]) {
      ctx.fillStyle = "#F1E6CA";
      ctx.fillRect(x - 13, top, 26, base - top);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 13, top, 26, base - top);
      hatch(ctx, x + 1, top, x + 13, base, 4, 0, 0.75);
      // little flag
      ctx.fillStyle = RED_INK;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + (x < w / 2 ? -46 : 46), top + 18);
      ctx.lineTo(x, top + 36);
      ctx.fill();
    }
    // dimension line: 8 yards
    const dy = base + 52;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(postL, dy);
    ctx.lineTo(postR, dy);
    ctx.moveTo(postL, dy - 16);
    ctx.lineTo(postL, dy + 16);
    ctx.moveTo(postR, dy - 16);
    ctx.lineTo(postR, dy + 16);
    ctx.stroke();
    ctx.fillStyle = "#EADDBE";
    ctx.fillRect(w / 2 - 150, dy - 34, 300, 60);
    text(ctx, "8 yards", w / 2, dy + 16, 54, { italic: true });
    // a ball's dotted flight soaring high between the posts: "at whatever height"
    ctx.strokeStyle = RED_INK;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(w / 2 - 40, base - 10);
    ctx.quadraticCurveTo(w / 2 - 10, 520, w / 2 + 30, 600);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#F1E6CA";
    ctx.beginPath();
    ctx.arc(w / 2 + 30, 606, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    hatch(ctx, w / 2 + 30, 584, w / 2 + 52, 628, 4, 0.7, 0.6);
    text(ctx, "no tape, no bar", w / 2, 830, 46, { italic: true, color: RED_INK });

    // imprint + ex-libris stamp (AUDIRA brand inside the scene)
    text(ctx, "The Football Association", w / 2, 1150, 58, { italic: true });
    ctx.save();
    ctx.translate(w / 2, 1252);
    ctx.rotate(-0.05);
    ctx.strokeStyle = "rgba(138,46,28,0.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 268, 62, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 252, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, "EX LIBRIS · AUDIRA", 0, 14, 42, { color: "rgba(138,46,28,0.9)", spacing: 3 });
    ctx.restore();
  });

const LAWS: [string, string, string][] = [
  ["I.", "Goal: two upright posts,", "8 yards apart, no tape or bar."],
  ["II.", "At kick-off the other side", "stands 10 yards from the ball."],
  ["III.", "After each goal won,", "the two sides change goals."],
  ["IV.", "A goal is won at", "whatever height."],
  ["IX.", "No player shall", "carry the ball."],
  ["X.", "Neither tripping nor", "hacking shall be allowed."],
];

/** Right page: the numbered laws, legible engraved lines. */
export const rightPage = () =>
  canvasTex("ep06-right", 1024, 1380, (ctx, w, h) => {
    parchment(ctx, w, h, 1886, false);
    frameRule(ctx, w, h);
    text(ctx, "THE XIII LAWS", w / 2, 186, 74, { spacing: 6 });
    ctx.fillStyle = INK;
    ctx.fillRect(w * 0.3, 214, w * 0.4, 3);
    let y = 310;
    for (const [n, a, b] of LAWS) {
      text(ctx, n, 178, y, 62, { align: "right", color: RED_INK });
      text(ctx, a, 204, y, 56, { align: "left" });
      text(ctx, b, 204, y + 64, 56, { align: "left" });
      y += 160;
    }
    text(ctx, "· · ·  XIII.", w / 2, y + 6, 54, { italic: true });
  });

/** Leather ball: 6 tan panels meeting at the poles, seams, lace slit at u = 0.25 (faces +z). */
const ballDraw = (bump: boolean): Draw => (ctx, w, h) => {
  const r = prng(71);
  if (bump) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#8A5228");
    g.addColorStop(0.5, "#9C6230");
    g.addColorStop(1, "#7A4520");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = r() * w, y = r() * h, rad = 10 + r() * 70;
      const s = ctx.createRadialGradient(x, y, 0, x, y, rad);
      s.addColorStop(0, `rgba(${r() > 0.5 ? "45,22,8" : "190,140,80"},${0.08 + r() * 0.14})`);
      s.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = s;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }
  // pores / scuffs
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = bump ? `rgba(0,0,0,${0.12 + r() * 0.2})` : `rgba(40,18,6,${0.08 + r() * 0.14})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  // seams
  for (let k = 0; k <= 6; k++) {
    const x = (k / 6) * w;
    ctx.fillStyle = bump ? "#000" : "#2A1206";
    ctx.fillRect(x - 5, 0, 10, h);
    // stitches
    ctx.fillStyle = bump ? "#3A3A3A" : "#3A1E0C";
    for (let y = 8; y < h; y += 16) ctx.fillRect(x - 11, y, 22, 4);
  }
  // lace slit + crossed leather lace
  const cx = 0.25 * w;
  ctx.fillStyle = bump ? "#000" : "#1A0A03";
  ctx.fillRect(cx - 7, h * 0.36, 14, h * 0.28);
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const y = h * 0.37 + i * (h * 0.26) / 8;
    ctx.strokeStyle = bump ? "#FFFFFF" : "#D2A86C";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(cx - 24, y - 6);
    ctx.lineTo(cx + 24, y + 6);
    ctx.stroke();
    if (!bump) {
      ctx.strokeStyle = "rgba(60,30,10,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 22, y - 2);
      ctx.lineTo(cx + 22, y + 9);
      ctx.stroke();
    }
  }
};
export const ballMap = () => canvasTex("ep06-ball", 1536, 768, ballDraw(false));
export const ballBump = () => canvasTex("ep06-ball-bump", 1536, 768, ballDraw(true), false);

/** Worn oak table planks (runs along x). */
export const oakTexture = () =>
  canvasTex("ep06-oak", 2048, 1024, (ctx, w, h) => {
    const r = prng(1863);
    ctx.fillStyle = "#4A2C17";
    ctx.fillRect(0, 0, w, h);
    const planks = 5;
    for (let p = 0; p < planks; p++) {
      const y0 = (p / planks) * h, ph = h / planks;
      const tone = 0.85 + r() * 0.3;
      ctx.fillStyle = `rgb(${Math.round(84 * tone)},${Math.round(52 * tone)},${Math.round(28 * tone)})`;
      ctx.fillRect(0, y0, w, ph);
      for (let i = 0; i < 70; i++) {
        const yy = y0 + r() * ph;
        const amp = 2 + r() * 8, freq = 0.002 + r() * 0.006, ph0 = r() * 10;
        ctx.strokeStyle = `rgba(${r() > 0.6 ? "130,90,50" : "30,16,6"},${0.15 + r() * 0.25})`;
        ctx.lineWidth = 1 + r() * 2.5;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 16) {
          const yv = yy + Math.sin(x * freq + ph0) * amp;
          if (x === 0) ctx.moveTo(x, yv);
          else ctx.lineTo(x, yv);
        }
        ctx.stroke();
      }
      // knots
      for (let k = 0; k < 2; k++) {
        const kx = r() * w, ky = y0 + ph * (0.3 + r() * 0.4);
        for (let ring = 0; ring < 6; ring++) {
          ctx.strokeStyle = `rgba(30,15,5,${0.35 - ring * 0.04})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(kx, ky, 8 + ring * 9, 4 + ring * 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(15,7,2,0.85)";
      ctx.fillRect(0, y0, w, 5);
      // ring stains from tankards
    }
    for (let i = 0; i < 4; i++) {
      const x = r() * w, y = r() * h, rad = 40 + r() * 30;
      ctx.strokeStyle = "rgba(25,12,4,0.25)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y, rad, r() * 2, r() * 2 + 4.5);
      ctx.stroke();
    }
  });

/** Dark wainscot panelling for the tavern wall. */
export const wallTexture = () =>
  canvasTex("ep06-wall", 2048, 1024, (ctx, w, h) => {
    const r = prng(26);
    ctx.fillStyle = "#2B170C";
    ctx.fillRect(0, 0, w, h);
    const cols = 6;
    for (let c = 0; c < cols; c++) {
      const x0 = (c / cols) * w + 26, pw = w / cols - 52;
      for (const [y0, ph] of [[60, h * 0.5], [h * 0.5 + 110, h * 0.5 - 170]] as [number, number][]) {
        ctx.fillStyle = "#3A2111";
        ctx.fillRect(x0, y0, pw, ph);
        ctx.strokeStyle = "rgba(10,4,0,0.8)";
        ctx.lineWidth = 8;
        ctx.strokeRect(x0, y0, pw, ph);
        ctx.strokeStyle = "rgba(150,100,55,0.25)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x0 + 14, y0 + 14, pw - 28, ph - 28);
        for (let i = 0; i < 30; i++) {
          ctx.strokeStyle = `rgba(${r() > 0.5 ? "110,70,35" : "15,7,2"},${0.12 + r() * 0.2})`;
          ctx.lineWidth = 1 + r() * 2;
          const xx = x0 + r() * pw;
          ctx.beginPath();
          ctx.moveTo(xx, y0);
          ctx.lineTo(xx + (r() - 0.5) * 20, y0 + ph);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "#1A0C05";
    ctx.fillRect(0, h * 0.5 + 66, w, 26);
  });

/** Brass plaque: tavern name (fact #1, HIGH). */
export const tavernPlaque = () =>
  canvasTex("ep06-tavern", 1536, 300, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#9C7638");
    g.addColorStop(0.5, "#D2AE62");
    g.addColorStop(1, "#8E6A30");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = prng(9);
    for (let i = 0; i < h * 1.5; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "255,240,200" : "80,55,20"},${0.04 + r() * 0.06})`;
      ctx.fillRect(0, r() * h, w, 1);
    }
    ctx.strokeStyle = "rgba(50,32,8,0.85)";
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.font = `110px ${FELL}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
    ctx.fillStyle = "rgba(255,236,180,0.5)";
    ctx.fillText("FREEMASONS' TAVERN", w / 2, h * 0.42 + 3);
    ctx.fillStyle = "#2A1A08";
    ctx.fillText("FREEMASONS' TAVERN", w / 2, h * 0.42);
    ctx.font = `italic 58px ${FELL}`;
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "2px";
    ctx.fillText("Great Queen Street · London", w / 2, h * 0.78);
  });

/** Feather vane (alpha in the same map). */
export const featherTexture = () =>
  canvasTex("ep06-feather", 256, 1024, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const r = prng(5);
    const cx = w / 2;
    for (let y = 40; y < h - 160; y += 3) {
      const t = (y - 40) / (h - 200);
      const half = Math.sin(Math.min(1, t * 1.15) * Math.PI) * (w * 0.46) * (0.75 + 0.25 * (1 - t));
      const gapL = r() > 0.94, gapR = r() > 0.95;
      ctx.strokeStyle = `rgba(${236 - t * 40},${226 - t * 50},${205 - t * 70},${0.85 + r() * 0.15})`;
      ctx.lineWidth = 2.4;
      if (!gapL) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.quadraticCurveTo(cx - half * 0.5, y - 8, cx - half, y - 30);
        ctx.stroke();
      }
      if (!gapR) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.quadraticCurveTo(cx + half * 0.5, y - 8, cx + half, y - 30);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "#F4ECDA";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, h);
    ctx.stroke();
  });

/** Soft flame sprite (additive). */
export const flameTexture = () =>
  canvasTex("ep06-flame", 128, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.68, 2, w / 2, h * 0.6, h * 0.5);
    g.addColorStop(0, "rgba(255,250,220,1)");
    g.addColorStop(0.25, "rgba(255,200,90,0.95)");
    g.addColorStop(0.6, "rgba(230,110,30,0.45)");
    g.addColorStop(1, "rgba(200,60,10,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.bezierCurveTo(w * 0.95, h * 0.55, w * 0.85, h * 0.98, w / 2, h * 0.98);
    ctx.bezierCurveTo(w * 0.15, h * 0.98, w * 0.05, h * 0.55, w / 2, 4);
    ctx.fill();
  });

/** Round glow sprite. */
export const glowTexture = () =>
  canvasTex("ep06-glow", 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,210,140,0.9)");
    g.addColorStop(0.3, "rgba(255,170,80,0.35)");
    g.addColorStop(1, "rgba(255,140,60,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
