// EP03 cover textures (DATAPHYSICAL): canvas-drawn, seeded only (prng), system fonts only,
// so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

export const PAL = {
  bg: "#16171A",
  walnut: "#2A1B14",
  alu: "#C8CCD1",
  teal: "#9FD3D6",
  brass: "#D2B07A",
  orange: "#D4521C",
  pitch: "#2BD46A",
  felt: "#1E5A33",
  ink: "#15161A",
};

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

/** Brushed-metal roughness streaks (horizontal), seeded. Linear data, not colour. */
export const brushedTexture = (seed = 5) =>
  canvasTex(
    `brushed-${seed}`,
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "rgb(92,92,92)";
      ctx.fillRect(0, 0, w, h);
      const r = prng(seed);
      for (let i = 0; i < 1400; i++) {
        const y = r() * h;
        const v = 60 + r() * 80;
        ctx.strokeStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`;
        ctx.lineWidth = 0.5 + r() * 1.4;
        const x = r() * w;
        const len = 80 + r() * 380;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y + (r() - 0.5) * 1.2);
        ctx.stroke();
      }
    },
    false,
  );

/** Walnut grain (horizontal), seeded. */
export const walnutTexture = () =>
  canvasTex("walnut", 1024, 256, (ctx, w, h) => {
    ctx.fillStyle = PAL.walnut;
    ctx.fillRect(0, 0, w, h);
    const r = prng(41);
    for (let i = 0; i < 260; i++) {
      const y0 = r() * h;
      const amp = 2 + r() * 9;
      const ph = r() * 10;
      const fr = 0.004 + r() * 0.01;
      ctx.strokeStyle = r() > 0.5 ? `rgba(92,60,38,${0.18 + r() * 0.3})` : `rgba(12,7,4,${0.2 + r() * 0.35})`;
      ctx.lineWidth = 0.6 + r() * 2.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = y0 + Math.sin(x * fr + ph) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

/** Green felt pitch with white markings for the plinth top (w along x, h along z). */
export const pitchTexture = () =>
  canvasTex("pitch", 1536, 560, (ctx, w, h) => {
    // mown stripes
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? "#1C5531" : "#215F37";
      ctx.fillRect((i * w) / 12, 0, w / 12 + 1, h);
    }
    // felt fibre
    const r = prng(77);
    for (let i = 0; i < 26000; i++) {
      ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${0.02 + r() * 0.04})` : `rgba(0,0,0,${0.04 + r() * 0.06})`;
      ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1);
    }
    ctx.strokeStyle = "rgba(240,244,236,0.85)";
    ctx.lineWidth = 7;
    const m = 28;
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);
    ctx.beginPath();
    ctx.moveTo(w / 2, m);
    ctx.lineTo(w / 2, h - m);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(240,244,236,0.9)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    // penalty boxes
    const bw = 210, bh = 330;
    ctx.strokeRect(m, (h - bh) / 2, bw, bh);
    ctx.strokeRect(w - m - bw, (h - bh) / 2, bw, bh);
  });

/** Name plate on a pedestal front (square): name, country + shirt number, two big stat digits with colour chips. */
export const plateTexture = (name: string, nat: string, num: string, wc: number, bdo: number) =>
  canvasTex(`plate-${name}`, 512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#26282D");
    g.addColorStop(1, "#17181B");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(210,176,122,0.95)";
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    const F = "'Arial Black', 'Segoe UI', Arial, sans-serif";
    // name, auto-fit
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#F2EFE8";
    let size = 92;
    ctx.font = `900 ${size}px ${F}`;
    while (ctx.measureText(name).width > w - 64 && size > 50) {
      size -= 2;
      ctx.font = `900 ${size}px ${F}`;
    }
    ctx.fillText(name, w / 2, 122);
    // country + shirt number
    ctx.font = "700 50px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "rgba(242,239,232,0.72)";
    const natW = ctx.measureText(nat + "  ").width;
    ctx.font = `900 64px ${F}`;
    const numW = ctx.measureText("#" + num).width;
    const x0 = (w - natW - numW) / 2;
    ctx.textAlign = "left";
    ctx.font = "700 50px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(nat, x0, 204);
    ctx.font = `900 64px ${F}`;
    ctx.fillStyle = PAL.pitch;
    ctx.fillText("#" + num, x0 + natW, 206);
    // divider
    ctx.fillStyle = "rgba(210,176,122,0.6)";
    ctx.fillRect(36, 244, w - 72, 4);
    // two stats: chip + big digit
    const stat = (cx: number, color: string, n: number) => {
      ctx.fillStyle = color;
      ctx.fillRect(cx - 50, 274, 100, 26);
      ctx.fillStyle = "#F7F4EE";
      ctx.font = `900 180px ${F}`;
      ctx.textAlign = "center";
      ctx.fillText(String(n), cx, 470);
    };
    stat(w * 0.27, PAL.brass, wc);
    stat(w * 0.73, PAL.orange, bdo);
    ctx.fillStyle = "rgba(210,176,122,0.35)";
    ctx.fillRect(w / 2 - 2, 276, 4, 196);
  });

/** Engraved year on a World Cup block (transparent, dark ink). */
export const yearTexture = (year: string) =>
  canvasTex(`year-${year}`, 512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(48,28,6,0.97)";
    ctx.font = "800 112px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(year, w / 2, h / 2 + 4);
    
  });

/** Brass plaque on the plinth front with the AUDIRA lab mark. */
export const plaqueTexture = () =>
  canvasTex("plaque", 1024, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#B9945C");
    g.addColorStop(0.5, "#E2C590");
    g.addColorStop(1, "#B48F57");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(60,38,10,0.7)";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "rgba(48,30,8,0.92)";
    ctx.font = "800 54px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUDIRA DATA LAB  ·  GOAT INDEX", w / 2, h / 2 + 3);
  });

/** Measuring scale engraved into the back acrylic panel (transparent). */
export const scaleTexture = () =>
  canvasTex("scale", 256, 1024, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i <= 40; i++) {
      const y = h - 20 - (i * (h - 40)) / 40;
      const major = i % 5 === 0;
      ctx.fillStyle = major ? "rgba(159,211,214,0.9)" : "rgba(159,211,214,0.5)";
      ctx.fillRect(w - (major ? 120 : 60), y, major ? 120 : 60, major ? 4 : 2);
    }
  });

/** Classic 32-panel ball: equirect map from the Voronoi cells of 12 pentagon + 20 hexagon centres. */
export const ballTexture = () =>
  canvasTex("ball", 1024, 512, (ctx, w, h) => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const ico: number[][] = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ].map((v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; });
    const faces: number[][] = [];
    for (let a = 0; a < 12; a++)
      for (let b = a + 1; b < 12; b++)
        for (let c = b + 1; c < 12; c++) {
          const d = (i: number, j: number) => ico[i][0] * ico[j][0] + ico[i][1] * ico[j][1] + ico[i][2] * ico[j][2];
          if (d(a, b) > 0.4 && d(b, c) > 0.4 && d(a, c) > 0.4) {
            const s = [0, 1, 2].map((k) => ico[a][k] + ico[b][k] + ico[c][k]);
            const l = Math.hypot(s[0], s[1], s[2]);
            faces.push([s[0] / l, s[1] / l, s[2] / l]);
          }
        }
    const centres = [...ico.map((v) => ({ v, pent: true })), ...faces.map((v) => ({ v, pent: false }))];
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const th = ((y + 0.5) / h) * Math.PI;
      for (let x = 0; x < w; x++) {
        const ph = ((x + 0.5) / w) * Math.PI * 2;
        const dx = -Math.cos(ph) * Math.sin(th), dy = Math.cos(th), dz = Math.sin(ph) * Math.sin(th);
        let b1 = -9, b2 = -9, pent = false;
        for (const c of centres) {
          // pentagon cells slightly smaller than hexagon cells (angular bias)
          const dd = c.v[0] * dx + c.v[1] * dy + c.v[2] * dz - (c.pent ? 0.012 : 0);
          if (dd > b1) { b2 = b1; b1 = dd; pent = c.pent; } else if (dd > b2) b2 = dd;
        }
        const edge = b1 - b2;
        let v = pent ? 26 : 236;
        const pillow = 0.9 + Math.min(1, edge * 18) * 0.1;
        v *= pillow;
        if (edge < 0.006) v = 70; // seam
        const p = (y * w + x) * 4;
        img.data[p] = v;
        img.data[p + 1] = v;
        img.data[p + 2] = v * (pent ? 1 : 0.985);
        img.data[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });

/** Soft round glow for distant floodlight bokeh. */
export const glowTexture = () =>
  canvasTex("glow", 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,246,226,1)");
    g.addColorStop(0.35, "rgba(255,236,200,0.55)");
    g.addColorStop(1, "rgba(255,230,190,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/** Film name plate (square): name, country, shirt number; no stats (stats live in the scale tags). */
export const namePlateTexture = (name: string, nat: string, num: string) =>
  canvasTex(`nameplate-${name}-${nat}`, 512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#26282D");
    g.addColorStop(1, "#17181B");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(210,176,122,0.95)";
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    const F = "'Arial Black', 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = PAL.pitch;
    // no country line (nat = ""): bigger number + name only, readable at phone size
    const bare = nat === "";
    ctx.font = `900 ${bare ? 250 : 210}px ${F}`;
    ctx.fillText(num, w / 2, bare ? 270 : 236);
    ctx.fillStyle = "#F2EFE8";
    let size = bare ? 110 : 96;
    ctx.font = `900 ${size}px ${F}`;
    while (ctx.measureText(name).width > w - 56 && size > 50) {
      size -= 2;
      ctx.font = `900 ${size}px ${F}`;
    }
    ctx.fillText(name, w / 2, bare ? 430 : 368);
    if (!bare) {
      ctx.font = "700 54px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "rgba(242,239,232,0.75)";
      ctx.fillText(nat, w / 2, 448);
    }
  });
