// EP03 cover textures: seeded canvas drawings in the VINTAGEFORGE engraving look.
// Everything is cached per key and drawn from prng(seed), so every render tab gets the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

export const INK = "#1E1B18";
export const BROWN = "#3B2818";
export const PARCH = "#F3EAD6";
export const GOLD = "#C5A059";
export const TERRA = "#B85A3F";
export const VERD = "#52796F";
export const COPPER = "#B06A3B";

const cache = new Map<string, THREE.CanvasTexture>();
const make = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, r: () => number) => void, seed = 3) => {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.CanvasTexture(undefined as unknown as HTMLCanvasElement);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, prng(seed));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

/** Hatch a region with parallel ink lines at an angle (clip first). */
const hatch = (ctx: CanvasRenderingContext2D, w: number, h: number, angle: number, gap: number, color: string, width: number, r: () => number) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  const d = Math.hypot(w, h);
  ctx.translate(w / 2, h / 2);
  ctx.rotate(angle);
  for (let x = -d; x < d; x += gap) {
    ctx.beginPath();
    const j = (r() - 0.5) * gap * 0.25;
    ctx.moveTo(x + j, -d);
    ctx.lineTo(x - j, d);
    ctx.stroke();
  }
  ctx.restore();
};

const stains = (ctx: CanvasRenderingContext2D, w: number, h: number, r: () => number, n: number, color: string, alpha: number) => {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rad = (0.04 + r() * 0.18) * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, color.replace("A", String(alpha * (0.4 + r() * 0.6))));
    g.addColorStop(1, color.replace("A", "0"));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
};

const gearPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, teeth: number) => {
  ctx.beginPath();
  for (let i = 0; i <= teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const k = i % 4;
    const rr = k === 1 || k === 2 ? R : R * 0.84;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
};

/** Back wall: Da Vinci style manuscript sheet with gear studies, figure studies and mirror script. */
export const manuscriptTex = () =>
  make("manuscript", 1024, 1536, (ctx, r) => {
    const w = 1024, h = 1536;
    ctx.fillStyle = "#EADBB8";
    ctx.fillRect(0, 0, w, h);
    stains(ctx, w, h, r, 26, "rgba(150,105,55,A)", 0.22);
    stains(ctx, w, h, r, 10, "rgba(255,248,225,A)", 0.35);
    ctx.lineCap = "round";
    // mirror-script lines (scribble words)
    ctx.strokeStyle = "rgba(59,40,24,0.55)";
    ctx.lineWidth = 1.6;
    const block = (x0: number, y0: number, lines: number, width: number) => {
      for (let l = 0; l < lines; l++) {
        let x = x0;
        const y = y0 + l * 30;
        while (x < x0 + width * (0.75 + r() * 0.25)) {
          const ww = 20 + r() * 50;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let s = 0; s < ww; s += 4) ctx.lineTo(x + s, y + Math.sin(s * 0.9 + r() * 3) * 5 - (r() < 0.1 ? 10 : 0));
          ctx.stroke();
          x += ww + 10;
        }
      }
    };
    block(80, 120, 7, 380);
    block(560, 980, 9, 380);
    block(90, 1220, 6, 420);
    // gear studies
    ctx.strokeStyle = "rgba(59,40,24,0.7)";
    ctx.lineWidth = 2.2;
    const gears: [number, number, number, number][] = [[740, 300, 150, 20], [560, 470, 85, 12], [870, 520, 60, 10]];
    for (const [cx, cy, R, t] of gears) {
      gearPath(ctx, cx, cy, R, t);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R * 0.12, cy + Math.sin(a) * R * 0.12);
        ctx.lineTo(cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55);
        ctx.stroke();
      }
      // shade lower half with hatching
      ctx.save();
      gearPath(ctx, cx, cy, R, t);
      ctx.clip();
      ctx.globalAlpha = 0.35;
      ctx.translate(cx - R, cy);
      hatch(ctx, R * 2, R, 0.8, 7, BROWN, 1.1, r);
      ctx.restore();
    }
    // construction lines + compass arcs
    ctx.strokeStyle = "rgba(59,40,24,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(420, 300);
    ctx.lineTo(1000, 300);
    ctx.moveTo(740, 80);
    ctx.lineTo(740, 700);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(300, 640, 220, -0.4, 1.4);
    ctx.stroke();
    // figure study: walking-man sequence (motion study, Muybridge-like), small
    ctx.strokeStyle = "rgba(30,27,24,0.6)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const x = 110 + i * 85, y = 820, s = Math.sin(i * 1.2);
      ctx.beginPath();
      ctx.arc(x, y - 92, 11, 0, Math.PI * 2);
      ctx.moveTo(x, y - 80);
      ctx.lineTo(x + 4, y - 35);
      ctx.lineTo(x + 4 + s * 22, y);
      ctx.moveTo(x + 4, y - 35);
      ctx.lineTo(x + 4 - s * 22, y);
      ctx.moveTo(x + 1, y - 70);
      ctx.lineTo(x + 1 - s * 18, y - 45);
      ctx.moveTo(x + 1, y - 70);
      ctx.lineTo(x + 1 + s * 18, y - 45);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 700, 450, 150);
    // red chalk wash accents
    stains(ctx, w, h, r, 4, "rgba(184,90,63,A)", 0.1);
  }, 11);

/** Walnut desk with engraved grain. */
export const deskTex = () =>
  make("desk", 1024, 1024, (ctx, r) => {
    const w = 1024, h = 1024;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#4a2f1b");
    g.addColorStop(0.5, "#5c3a21");
    g.addColorStop(1, "#47301d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      const x0 = r() * w;
      ctx.strokeStyle = `rgba(${r() < 0.5 ? "30,18,10" : "120,80,45"},${0.15 + r() * 0.3})`;
      ctx.lineWidth = 0.6 + r() * 2.2;
      ctx.beginPath();
      const amp = 4 + r() * 14, fr = 0.004 + r() * 0.01, ph = r() * 6;
      for (let y = 0; y <= h; y += 8) ctx.lineTo(x0 + Math.sin(y * fr + ph) * amp, y);
      ctx.stroke();
    }
    stains(ctx, w, h, r, 8, "rgba(20,10,4,A)", 0.25);
  }, 5);

/** Loose parchment sheet lying on the desk. */
export const sheetTex = () =>
  make("sheet", 768, 1024, (ctx, r) => {
    ctx.fillStyle = PARCH;
    ctx.fillRect(0, 0, 768, 1024);
    stains(ctx, 768, 1024, r, 14, "rgba(160,110,60,A)", 0.25);
    ctx.strokeStyle = "rgba(59,40,24,0.5)";
    ctx.lineWidth = 2;
    for (let l = 0; l < 18; l++) {
      ctx.beginPath();
      const y = 90 + l * 48;
      ctx.moveTo(70, y);
      for (let x = 70; x < 690 - (l % 4) * 60; x += 6) ctx.lineTo(x, y + Math.sin(x * 0.7 + l) * 4);
      ctx.stroke();
    }
  }, 9);

/** Human silhouette path used inside the photo (outline the figure left behind). */
const figurePath = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.beginPath();
  ctx.arc(x, y - 1.55 * s, 0.17 * s, 0, Math.PI * 2);
  ctx.moveTo(x - 0.28 * s, y - 1.3 * s);
  ctx.lineTo(x + 0.28 * s, y - 1.3 * s);
  ctx.lineTo(x + 0.36 * s, y - 0.7 * s);
  ctx.lineTo(x + 0.22 * s, y - 0.7 * s);
  ctx.lineTo(x + 0.2 * s, y);
  ctx.lineTo(x + 0.04 * s, y);
  ctx.lineTo(x, y - 0.55 * s);
  ctx.lineTo(x - 0.04 * s, y);
  ctx.lineTo(x - 0.2 * s, y);
  ctx.lineTo(x - 0.22 * s, y - 0.7 * s);
  ctx.lineTo(x - 0.36 * s, y - 0.7 * s);
  ctx.closePath();
};

/** The old sepia photograph: engraved garden scene, with an empty dashed outline where the figure stood. */
export const photoTex = () =>
  make("photo", 800, 1000, (ctx, r) => {
    const w = 800, h = 1000;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#d9c39a");
    sky.addColorStop(0.55, "#c9ab7a");
    sky.addColorStop(1, "#8a6a44");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // sky hatching
    ctx.globalAlpha = 0.25;
    hatch(ctx, w, h * 0.55, 0.05, 9, BROWN, 1, r);
    ctx.globalAlpha = 1;
    // far hills
    ctx.fillStyle = "#a4875e";
    ctx.beginPath();
    ctx.moveTo(0, 560);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, 520 - Math.sin(x * 0.008) * 50 - Math.sin(x * 0.021) * 18);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.4;
    hatch(ctx, w, h, -0.6, 7, BROWN, 1.2, r);
    ctx.restore();
    // ground
    ctx.fillStyle = "#7a5a37";
    ctx.beginPath();
    ctx.moveTo(0, 700);
    ctx.quadraticCurveTo(400, 660, 800, 710);
    ctx.lineTo(800, h);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.5;
    hatch(ctx, w, h, 0.5, 6, INK, 1.3, r);
    hatch(ctx, w, h, -0.5, 9, INK, 1, r);
    ctx.restore();
    // tree on the right
    ctx.fillStyle = "#4a321e";
    ctx.fillRect(612, 330, 26, 390);
    ctx.beginPath();
    ctx.ellipse(625, 300, 150, 170, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.6;
    hatch(ctx, w, h, 0.9, 5, INK, 1.4, r);
    ctx.restore();
    // garden bench on the left
    ctx.fillStyle = "#3b2818";
    ctx.fillRect(70, 640, 200, 16);
    ctx.fillRect(80, 656, 12, 60);
    ctx.fillRect(250, 656, 12, 60);
    ctx.fillRect(70, 590, 200, 12);
    // empty outline where the figure stood (it has stepped out)
    ctx.save();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = "rgba(243,234,214,0.85)";
    ctx.lineWidth = 4;
    figurePath(ctx, 430, 760, 190);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    figurePath(ctx, 430, 760, 190);
    ctx.clip();
    ctx.fillStyle = "rgba(243,234,214,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    // emulsion: vignette, scratches, foxing
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.72);
    v.addColorStop(0, "rgba(40,24,10,0)");
    v.addColorStop(1, "rgba(40,24,10,0.75)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(250,240,215,0.35)";
    for (let i = 0; i < 14; i++) {
      ctx.lineWidth = 0.6 + r();
      ctx.beginPath();
      const x = r() * w;
      ctx.moveTo(x, r() * h);
      ctx.lineTo(x + (r() - 0.5) * 40, r() * h);
      ctx.stroke();
    }
    stains(ctx, w, h, r, 10, "rgba(120,70,30,A)", 0.25);
  }, 21);

/** Brass plaque engraved "AUDIRA". */
export const plaqueTex = () =>
  make("plaque", 512, 128, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#e2c27a");
    g.addColorStop(0.5, "#c5a059");
    g.addColorStop(1, "#8f6e33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "#5b4220";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 108);
    ctx.font = "700 72px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,240,200,0.6)";
    ctx.fillText("A U D I R A", 257, 68);
    ctx.fillStyle = "#3b2818";
    ctx.fillText("A U D I R A", 256, 66);
    for (const x of [30, 482]) {
      ctx.beginPath();
      ctx.arc(x, 64, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#6b4f26";
      ctx.fill();
    }
  });

/** Copper film strip with sprocket holes; each cell holds one pose of the walking figure. */
export const filmTex = () =>
  make("film", 2048, 256, (ctx, r) => {
    const w = 2048, h = 256;
    ctx.fillStyle = "#2a170c";
    ctx.fillRect(0, 0, w, h);
    const cells = 8;
    const cw = w / cells;
    for (let i = 0; i < cells; i++) {
      const x = i * cw;
      // sprockets
      ctx.fillStyle = "#d9b98a";
      for (let s = 0; s < 4; s++) {
        ctx.fillRect(x + 14 + s * (cw / 4), 12, 22, 22);
        ctx.fillRect(x + 14 + s * (cw / 4), h - 34, 22, 22);
      }
      // frame image
      const fx = x + 16, fy = 48, fw = cw - 32, fh = h - 96;
      const g = ctx.createLinearGradient(0, fy, 0, fy + fh);
      g.addColorStop(0, "#d9c39a");
      g.addColorStop(1, "#8a6a44");
      ctx.fillStyle = g;
      ctx.fillRect(fx, fy, fw, fh);
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();
      ctx.globalAlpha = 0.35;
      ctx.translate(fx, fy);
      hatch(ctx, fw, fh, 0.6, 6, BROWN, 1, r);
      ctx.restore();
      // walking stick figure, phase advancing per cell
      const s = Math.sin(i * 0.9);
      const cx = fx + fw * (0.3 + i * 0.05), by = fy + fh - 14;
      ctx.strokeStyle = INK;
      ctx.fillStyle = INK;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, by - 108, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, by - 94);
      ctx.lineTo(cx + 3, by - 48);
      ctx.lineTo(cx + 3 + s * 20, by);
      ctx.moveTo(cx + 3, by - 48);
      ctx.lineTo(cx + 3 - s * 20, by);
      ctx.moveTo(cx + 1, by - 84);
      ctx.lineTo(cx + 1 - s * 18, by - 56);
      ctx.moveTo(cx + 1, by - 84);
      ctx.lineTo(cx + 1 + s * 18, by - 56);
      ctx.stroke();
    }
    stains(ctx, w, h, r, 10, "rgba(176,106,59,A)", 0.3);
  }, 31);

/** Engraved speed lines (alpha) trailing the figure as it leaves the photo. */
export const speedTex = () =>
  make("speed", 1024, 512, (ctx, r) => {
    ctx.clearRect(0, 0, 1024, 512);
    ctx.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      const y = 40 + r() * 430;
      const x0 = 40 + r() * 300;
      const len = 260 + r() * 600;
      const gr = ctx.createLinearGradient(x0, 0, x0 + len, 0);
      gr.addColorStop(0, "rgba(59,40,24,0)");
      gr.addColorStop(0.7, "rgba(59,40,24,0.75)");
      gr.addColorStop(1, "rgba(59,40,24,0)");
      ctx.strokeStyle = gr;
      ctx.lineWidth = 2 + r() * 4;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + len, y + (r() - 0.5) * 8);
      ctx.stroke();
    }
  }, 41);
