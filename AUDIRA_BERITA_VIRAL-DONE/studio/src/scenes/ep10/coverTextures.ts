// EP10 cover textures (COLLAGE): torn, one-ink halftone paper scraps drawn on canvas.
// Same print language as kits/collage/lib/paper.ts (torn outline + fibre rim + 15° halftone),
// with episode-specific subjects: two newspaper headlines, a colonnade, the US Capitol dome,
// a peci with round spectacles, a gavel, name tags, a year strip and a brand tape.
// Seeded (mulberry32) and cached: identical pixels in every render tab.

import * as THREE from "three";
import { mulberry32 } from "../../core/film/craft.ts";

type G = CanvasRenderingContext2D;
type Torn = [boolean, boolean, boolean, boolean];

const RES = 1024;

function tornOutline(w: number, h: number, inset: number, amp: number, rand: () => number, torn: Torn) {
  const pts: [number, number][] = [];
  const side = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number, rough: boolean) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / 6));
    const ph = rand() * 6.28, f = 2 + rand() * 3;
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const off = rough ? (rand() - 0.5) * amp + Math.sin(u * f * Math.PI + ph) * amp * 0.9 : (rand() - 0.5) * 0.6;
      pts.push([x0 + (x1 - x0) * u + nx * off, y0 + (y1 - y0) * u + ny * off]);
    }
  };
  side(inset, inset, w - inset, inset, 0, 1, torn[0]);
  side(w - inset, inset, w - inset, h - inset, -1, 0, torn[1]);
  side(w - inset, h - inset, inset, h - inset, 0, -1, torn[2]);
  side(inset, h - inset, inset, inset, 1, 0, torn[3]);
  return pts;
}

const pathOf = (ctx: G, pts: [number, number][]) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
};

/** Re-print a grey canvas as one-ink halftone dots. */
function halftone(ctx: G, src: HTMLCanvasElement, w: number, h: number, ink: string, cell = 10) {
  const data = src.getContext("2d")!.getImageData(0, 0, w, h).data;
  ctx.fillStyle = ink;
  const a = (15 * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const R = Math.hypot(w, h);
  for (let v = -R; v < R; v += cell) {
    for (let u = -R; u < R; u += cell) {
      const x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const dark = 1 - data[(Math.floor(y) * w + Math.floor(x)) * 4] / 255;
      if (dark < 0.04) continue;
      ctx.beginPath();
      ctx.arc(x, y, Math.sqrt(dark) * cell * 0.64, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export type ScrapSpec = {
  key: string;
  seed: number;
  aspect: number;
  stock: string;
  torn?: Torn;
  /** grey "photo" re-printed as halftone in `ink` */
  photo?: (g: G, w: number, h: number, rand: () => number) => void;
  ink?: string;
  cell?: number;
  /** flat print drawn on top (text, solid shapes) */
  print?: (g: G, w: number, h: number, rand: () => number) => void;
  tape?: boolean;
};

const CACHE = new Map<string, THREE.CanvasTexture>();

export function scrapTexture(s: ScrapSpec): THREE.CanvasTexture {
  const hit = CACHE.get(s.key);
  if (hit) return hit;
  const rand = mulberry32(s.seed);
  const w = s.aspect >= 1 ? RES : Math.round(RES * s.aspect);
  const h = s.aspect >= 1 ? Math.round(RES / s.aspect) : RES;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const torn = s.torn ?? [true, true, true, true];
  const amp = s.tape ? 9 : 15;
  const outer = tornOutline(w, h, amp, amp, rand, torn);
  pathOf(ctx, outer);
  ctx.fillStyle = s.tape ? s.stock : "#FBF8F1";
  ctx.fill();
  ctx.save();
  if (s.tape) {
    pathOf(ctx, outer);
    ctx.clip();
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.08})`;
      ctx.fillRect(0, rand() * h, w, 1 + rand() * 2);
    }
  } else {
    pathOf(ctx, tornOutline(w, h, amp + 7, amp * 0.8, rand, torn));
    ctx.clip();
    ctx.fillStyle = s.stock;
    ctx.fillRect(0, 0, w, h);
    if (s.photo) {
      const src = document.createElement("canvas");
      src.width = w;
      src.height = h;
      const g = src.getContext("2d")!;
      g.fillStyle = "#fff";
      g.fillRect(0, 0, w, h);
      s.photo(g, w, h, rand);
      halftone(ctx, src, w, h, s.ink ?? "#1C1A17", s.cell ?? 10);
    }
  }
  s.print?.(ctx, w, h, rand);
  if (!s.tape) {
    for (let i = 0; i < (w * h) / 900; i++) {
      ctx.fillStyle = rand() < 0.5 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      ctx.fillRect(rand() * w, rand() * h, 2, 2);
    }
  }
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  CACHE.set(s.key, tex);
  return tex;
}

// ---------- prints ----------

/** Newspaper scrap: rule, date line, big serif headline, body copy as grey bars. */
export const newsPrint = (date: string, headline: string[], ink: string, accent: string) => (g: G, w: number, h: number, rand: () => number) => {
  const m = w * 0.075;
  g.fillStyle = ink;
  g.fillRect(m, m, w - 2 * m, 9);
  g.fillRect(m, m + 15, w - 2 * m, 3);
  g.textBaseline = "top";
  g.font = `700 ${Math.round(w * 0.098)}px 'Courier New', monospace`;
  g.fillStyle = accent;
  g.fillText(date, m, m + 34);
  let y = m + 34 + w * 0.13;
  g.fillStyle = ink;
  const size = Math.round(w * 0.15);
  g.font = `900 ${size}px Georgia, 'Times New Roman', serif`;
  for (const line of headline) {
    // squeeze to fit the column like a compositor would
    const mw = g.measureText(line).width, max = w - 2 * m;
    g.save();
    g.translate(m, y);
    if (mw > max) g.scale(max / mw, 1);
    g.fillText(line, 0, 0);
    g.restore();
    y += size * 1.02;
  }
  y += 14;
  g.fillRect(m, y, w - 2 * m, 4);
  y += 22;
  const colW = (w - 2 * m - 28) / 2;
  g.fillStyle = "rgba(28,26,23,0.5)";
  for (let c = 0; c < 2; c++) {
    let yy = y;
    while (yy < h - m) {
      const len = rand() < 0.12 ? colW * (0.3 + rand() * 0.4) : colW * (0.92 + rand() * 0.08);
      g.fillRect(m + c * (colW + 28), yy, len, 8);
      yy += rand() < 0.08 ? 30 : 17;
    }
  }
};

/** Name tag: name in heavy sans, role under it in typewriter. */
export const tagPrint = (name: string, role: string, ink: string, roleInk: string) => (g: G, w: number, h: number) => {
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillStyle = ink;
  const nameSize = Math.round(h * 0.37);
  g.font = `900 ${nameSize}px 'Arial Black', Arial, sans-serif`;
  const mw = g.measureText(name).width, max = w * 0.86;
  g.save();
  g.translate(w / 2, h * 0.37);
  if (mw > max) g.scale(max / mw, 1);
  g.fillText(name, 0, 0);
  g.restore();
  g.fillStyle = roleInk;
  g.font = `700 ${Math.round(h * 0.28)}px 'Courier New', monospace`;
  g.fillText(role, w / 2, h * 0.74);
};

/** Vertical year strip: 1956 / VS / 1973. */
export const stripPrint = (a: string, b: string, inkA: string, inkB: string, ink: string) => (g: G, w: number, h: number) => {
  g.textAlign = "center";
  g.textBaseline = "middle";
  const fit = (txt: string, size: number, y: number, col: string, face: string) => {
    g.font = `${size}px ${face}`;
    g.fillStyle = col;
    const mw = g.measureText(txt).width, max = w * 0.82;
    g.save();
    g.translate(w / 2, y);
    if (mw > max) g.scale(max / mw, 1);
    g.fillText(txt, 0, 0);
    g.restore();
  };
  fit(a, Math.round(w * 0.5), h * 0.17, inkA, "Impact, 'Arial Black', sans-serif");
  g.fillStyle = ink;
  g.fillRect(w * 0.2, h * 0.31, w * 0.6, 6);
  fit("VS", Math.round(w * 0.62), h * 0.5, ink, "Impact, 'Arial Black', sans-serif");
  g.fillRect(w * 0.2, h * 0.69, w * 0.6, 6);
  fit(b, Math.round(w * 0.5), h * 0.83, inkB, "Impact, 'Arial Black', sans-serif");
};

/** Brand tape: AUDIRA stamped along a strip of paper tape. */
export const tapeBrandPrint = (ink: string) => (g: G, w: number, h: number) => {
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = ink;
  g.font = `900 ${Math.round(h * 0.58)}px 'Arial Black', Arial, sans-serif`;
  g.fillText("AUDIRA", w / 2, h * 0.53);
};

// ---------- grey "photos" (halftoned afterwards) ----------

/** 1950s colonnaded government building with palms (no landmark claimed). */
export const colonnadePhoto = (g: G, w: number, h: number, rand: () => number) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#9a9a9a");
  sky.addColorStop(0.6, "#e2e2e2");
  sky.addColorStop(1, "#f4f4f4");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  // soft clouds
  g.filter = "blur(14px)";
  g.fillStyle = "#f7f7f7";
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.ellipse(rand() * w, h * (0.08 + rand() * 0.2), w * (0.08 + rand() * 0.08), h * 0.05, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.filter = "none";
  const x0 = w * 0.12, x1 = w * 0.88, top = h * 0.3, base = h * 0.8;
  // roof slab + attic band
  g.fillStyle = "#5a5a5a";
  g.fillRect(x0 - 18, top - 26, x1 - x0 + 36, 26);
  g.fillStyle = "#c4c4c4";
  g.fillRect(x0, top, x1 - x0, h * 0.09);
  g.fillStyle = "#8a8a8a";
  g.fillRect(x0, top + h * 0.09, x1 - x0, 8);
  // deep shadowed loggia behind the columns
  const lt = top + h * 0.09 + 8;
  g.fillStyle = "#3a3a3a";
  g.fillRect(x0 + 10, lt, x1 - x0 - 20, base - lt);
  // windows/doors in the loggia
  g.fillStyle = "#1c1c1c";
  const n = 9;
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) g.fillRect(x0 + step * (i + 0.3), lt + (base - lt) * 0.3, step * 0.4, (base - lt) * 0.7);
  // columns, lit from the left
  for (let i = 0; i <= n; i++) {
    const cx = x0 + step * i;
    const cg = g.createLinearGradient(cx - 14, 0, cx + 14, 0);
    cg.addColorStop(0, "#ffffff");
    cg.addColorStop(0.6, "#dcdcdc");
    cg.addColorStop(1, "#8c8c8c");
    g.fillStyle = cg;
    g.fillRect(cx - 14, lt, 28, base - lt);
    g.fillStyle = "#e6e6e6";
    g.fillRect(cx - 20, lt, 40, 10);
    g.fillRect(cx - 20, base - 10, 40, 10);
  }
  // steps
  for (let s = 0; s < 4; s++) {
    g.fillStyle = s % 2 ? "#cfcfcf" : "#b0b0b0";
    g.fillRect(x0 - 20 - s * 14, base + s * 12, x1 - x0 + 40 + s * 28, 12);
  }
  // ground
  g.fillStyle = "#9c9c9c";
  g.fillRect(0, base + 48, w, h - base - 48);
  // palms framing the building
  const palm = (px: number, ph: number, lean: number) => {
    g.strokeStyle = "#202020";
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(px, h);
    g.quadraticCurveTo(px + lean * 0.5, h - ph * 0.5, px + lean, h - ph);
    g.stroke();
    const tx = px + lean, ty = h - ph;
    g.fillStyle = "#1a1a1a";
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k - 4.5) * 0.36;
      g.save();
      g.translate(tx, ty);
      g.rotate(a);
      g.beginPath();
      g.ellipse(58, 6, 70, 8, 0.25, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  };
  palm(w * 0.06, h * 0.75, 30);
  palm(w * 0.95, h * 0.68, -34);
};

/** US Capitol: wings, drum with columns, ribbed dome, lantern, statue. */
export const capitolPhoto = (g: G, w: number, h: number, rand: () => number) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#5c5c5c");
  sky.addColorStop(0.75, "#b4b4b4");
  sky.addColorStop(1, "#f2f2f2");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.filter = "blur(16px)";
  g.fillStyle = "#f5f5f5";
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.ellipse(rand() * w, h * (0.1 + rand() * 0.25), w * 0.1, h * 0.05, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.filter = "none";
  const cx = w * 0.5, ground = h * 0.86;
  // wings
  g.fillStyle = "#cfcfcf";
  g.fillRect(w * 0.02, ground - h * 0.17, w * 0.96, h * 0.17);
  g.fillStyle = "#6a6a6a";
  for (let x = w * 0.04; x < w * 0.96; x += 26) g.fillRect(x, ground - h * 0.14, 9, h * 0.12);
  g.fillStyle = "#9a9a9a";
  g.fillRect(w * 0.02, ground - h * 0.19, w * 0.96, h * 0.025);
  // central portico pediment
  g.fillStyle = "#e4e4e4";
  g.beginPath();
  g.moveTo(cx - w * 0.16, ground - h * 0.19);
  g.lineTo(cx, ground - h * 0.26);
  g.lineTo(cx + w * 0.16, ground - h * 0.19);
  g.closePath();
  g.fill();
  // drum (two tiers) with columns
  const dw = w * 0.36, dTop = ground - h * 0.42, dBot = ground - h * 0.25;
  const dg = g.createLinearGradient(cx - dw / 2, 0, cx + dw / 2, 0);
  dg.addColorStop(0, "#f4f4f4");
  dg.addColorStop(0.55, "#cfcfcf");
  dg.addColorStop(1, "#7a7a7a");
  g.fillStyle = dg;
  g.fillRect(cx - dw / 2, dTop, dw, dBot - dTop);
  g.fillStyle = "#555";
  for (let i = 0; i < 13; i++) {
    const x = cx - dw / 2 + 10 + i * ((dw - 20) / 12);
    g.fillRect(x - 3, dTop + 14, 6, dBot - dTop - 18);
  }
  g.fillStyle = "#9a9a9a";
  g.fillRect(cx - dw / 2 - 8, dTop, dw + 16, 12);
  // dome
  const r = dw * 0.44, domeBase = dTop;
  const gg = g.createLinearGradient(cx - r, 0, cx + r, 0);
  gg.addColorStop(0, "#ffffff");
  gg.addColorStop(0.5, "#d6d6d6");
  gg.addColorStop(1, "#6e6e6e");
  g.fillStyle = gg;
  g.beginPath();
  g.ellipse(cx, domeBase, r, r * 1.05, 0, Math.PI, 0);
  g.fill();
  g.strokeStyle = "#5a5a5a";
  g.lineWidth = 5;
  for (let i = 1; i < 8; i++) {
    const k = (i / 8) * 2 - 1;
    g.beginPath();
    g.ellipse(cx, domeBase, Math.abs(k) * r, r * 1.05, 0, Math.PI, 0);
    g.stroke();
  }
  // windows ring on dome
  g.fillStyle = "#4a4a4a";
  for (let i = 0; i < 9; i++) g.fillRect(cx - r * 0.8 + i * (r * 1.6 / 8) - 4, domeBase - r * 0.22, 8, 16);
  // lantern + statue
  const lt = domeBase - r * 1.05;
  g.fillStyle = "#e0e0e0";
  g.fillRect(cx - 18, lt - 46, 36, 48);
  g.fillStyle = "#555";
  for (let i = 0; i < 4; i++) g.fillRect(cx - 14 + i * 9, lt - 40, 4, 36);
  g.fillStyle = "#2a2a2a";
  g.beginPath();
  g.ellipse(cx, lt - 46, 20, 14, 0, Math.PI, 0);
  g.fill();
  g.fillRect(cx - 5, lt - 92, 10, 34);
  g.beginPath();
  g.arc(cx, lt - 96, 7, 0, Math.PI * 2);
  g.fill();
  // lawn + trees
  g.fillStyle = "#8a8a8a";
  g.fillRect(0, ground, w, h - ground);
  g.fillStyle = "#262626";
  for (const [tx, tr] of [[w * 0.2, 34], [w * 0.84, 40], [w * 0.93, 46]] as const) {
    g.beginPath();
    g.arc(tx, ground - tr * 0.4, tr, 0, Math.PI * 2);
    g.fill();
  }
};

/** Still life: black peci (songkok) with round wire spectacles in front, on a table. */
export const peciPhoto = (g: G, w: number, h: number) => {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#e9e9e9");
  bg.addColorStop(1, "#bdbdbd");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // table edge
  g.fillStyle = "#a5a5a5";
  g.fillRect(0, h * 0.72, w, h * 0.28);
  // shadow
  g.filter = "blur(16px)";
  g.fillStyle = "#555";
  g.beginPath();
  g.ellipse(w * 0.52, h * 0.62, w * 0.36, h * 0.07, 0, 0, Math.PI * 2);
  g.fill();
  g.filter = "none";
  // peci: oval cap, flat top, slightly wider at the base
  const cx = w * 0.5, bot = h * 0.6, topY = h * 0.22, bw = w * 0.34, tw = w * 0.3;
  const pg = g.createLinearGradient(cx - bw, 0, cx + bw, 0);
  pg.addColorStop(0, "#3a3a3a");
  pg.addColorStop(0.3, "#151515");
  pg.addColorStop(1, "#050505");
  g.fillStyle = pg;
  g.beginPath();
  g.moveTo(cx - bw, bot);
  g.lineTo(cx - tw, topY + 20);
  g.quadraticCurveTo(cx, topY - 4, cx + tw, topY + 20);
  g.lineTo(cx + bw, bot);
  g.ellipse(cx, bot, bw, h * 0.05, 0, 0, Math.PI);
  g.closePath();
  g.fill();
  // top ellipse (velvet sheen)
  g.fillStyle = "#3c3c3c";
  g.beginPath();
  g.ellipse(cx, topY + 20, tw, h * 0.045, 0, 0, Math.PI * 2);
  g.fill();
  // round spectacles lying in front
  const gy = h * 0.78, rr = w * 0.115;
  g.strokeStyle = "#111";
  g.lineWidth = 14;
  for (const ox of [-1, 1]) {
    g.beginPath();
    g.ellipse(cx + ox * rr * 1.25, gy, rr, rr * 0.82, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(cx - rr * 0.25, gy - rr * 0.2);
  g.quadraticCurveTo(cx, gy - rr * 0.5, cx + rr * 0.25, gy - rr * 0.2);
  g.stroke();
  g.lineWidth = 9;
  g.beginPath();
  g.moveTo(cx - rr * 2.25, gy - rr * 0.1);
  g.lineTo(cx - rr * 3.2, gy - rr * 0.55);
  g.moveTo(cx + rr * 2.25, gy - rr * 0.1);
  g.lineTo(cx + rr * 3.2, gy - rr * 0.55);
  g.stroke();
};

/** Judge's gavel on its sound block. */
export const gavelPhoto = (g: G, w: number, h: number) => {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#ececec");
  bg.addColorStop(1, "#c4c4c4");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.filter = "blur(14px)";
  g.fillStyle = "#666";
  g.beginPath();
  g.ellipse(w * 0.5, h * 0.8, w * 0.38, h * 0.06, 0, 0, Math.PI * 2);
  g.fill();
  g.filter = "none";
  // sound block
  const bgx = g.createLinearGradient(0, h * 0.68, 0, h * 0.82);
  bgx.addColorStop(0, "#5a5a5a");
  bgx.addColorStop(1, "#1e1e1e");
  g.fillStyle = bgx;
  g.beginPath();
  g.ellipse(w * 0.36, h * 0.75, w * 0.22, h * 0.05, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(w * 0.14, h * 0.7, w * 0.44, h * 0.05);
  g.fillStyle = "#777";
  g.beginPath();
  g.ellipse(w * 0.36, h * 0.7, w * 0.22, h * 0.05, 0, 0, Math.PI * 2);
  g.fill();
  // gavel: head + handle, tilted
  g.save();
  g.translate(w * 0.5, h * 0.42);
  g.rotate(-0.5);
  const hg = g.createLinearGradient(0, -60, 0, 60);
  hg.addColorStop(0, "#6a6a6a");
  hg.addColorStop(0.4, "#2a2a2a");
  hg.addColorStop(1, "#0a0a0a");
  g.fillStyle = hg;
  g.fillRect(-w * 0.2, -h * 0.1, w * 0.4, h * 0.2);
  g.fillStyle = "#cfcfcf";
  g.fillRect(-w * 0.2, -h * 0.1, 16, h * 0.2);
  g.fillRect(w * 0.2 - 16, -h * 0.1, 16, h * 0.2);
  g.fillStyle = "#1a1a1a";
  g.fillRect(-10, h * 0.1, 20, h * 0.42);
  g.restore();
};
