// EP03 cover: canvas-drawn paper textures (map, dossier, formula card, stamp, note, tag, desk).
// Seeded only (prng), system fonts only, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

export const INK = "#1D1D1B";
export const RED = "#D8311C";
export const PAPER = "#E9E3D2";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw, transparent = false): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  if (!transparent) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
  }
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Paper fibre + soft stains, seeded. */
function paperGrain(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, tint = "rgba(120,96,60,") {
  const r = prng(seed);
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = r() * h, rad = 40 + r() * w * 0.18;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, tint + (0.025 + r() * 0.035) + ")");
    g.addColorStop(1, tint + "0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < (w * h) / 900; i++) {
    ctx.fillStyle = `rgba(60,50,35,${0.03 + r() * 0.05})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1);
  }
}

/** Ink erosion for stamps: punch seeded holes so the ink reads as rubber-stamped. */
function erode(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, amount = 1) {
  const r = prng(seed);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 2600 * amount; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.6})`;
    const s = 1 + r() * 4;
    ctx.fillRect(r() * w, r() * h, s, s * (0.5 + r()));
  }
  for (let i = 0; i < 14 * amount; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(r() * w, r() * h, 20 + r() * 60, 6 + r() * 16, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- Desk: dark walnut with seeded grain ----------
export const deskTexture = () =>
  canvasTex("ep03-desk", 1024, 2048, (ctx, w, h) => {
    ctx.fillStyle = "#1a1512";
    ctx.fillRect(0, 0, w, h);
    const r = prng(31);
    for (let i = 0; i < 420; i++) {
      const x = r() * w;
      const amp = 4 + r() * 18;
      const ph = r() * 10;
      ctx.strokeStyle = r() > 0.5 ? `rgba(70,48,32,${0.15 + r() * 0.3})` : `rgba(8,6,5,${0.2 + r() * 0.35})`;
      ctx.lineWidth = 0.6 + r() * 2.6;
      ctx.beginPath();
      for (let y = 0; y <= h; y += 16) {
        const xx = x + Math.sin(y / (120 + ph * 30) + ph) * amp;
        if (y === 0) ctx.moveTo(xx, y);
        else ctx.lineTo(xx, y);
      }
      ctx.stroke();
    }
  });

// ---------- Map of Tanah Papua ----------
// Simplified western New Guinea coastline (lon, lat). Recognisable silhouette, not survey-accurate.
const COAST: [number, number][] = [
  [131.25, -0.88], [131.8, -0.72], [132.5, -0.38], [133.2, -0.7], [134.07, -0.86], [134.2, -1.4], [134.15, -2.0],
  [134.45, -2.55], [134.7, -3.05], [135.2, -3.38], [135.6, -3.35], [136.0, -3.0], [136.35, -2.55], [136.9, -2.2],
  [137.4, -1.7], [137.85, -1.45], [138.4, -1.65], [138.75, -1.86], [139.3, -2.05], [139.9, -2.35], [140.7, -2.53],
  [141.0, -2.6], [141.0, -6.3], [140.9, -6.9], [141.0, -9.1], [140.4, -8.5], [139.5, -8.15], [138.9, -8.35],
  [138.0, -8.4], [137.65, -7.9], [138.1, -7.2], [138.5, -6.6], [138.2, -5.6], [137.5, -5.1], [136.9, -4.8],
  [136.0, -4.5], [134.9, -4.1], [134.2, -3.9], [133.7, -3.65], [133.0, -4.1], [132.75, -3.75], [132.3, -2.92],
  [132.7, -2.65], [133.4, -2.45], [133.1, -2.15], [132.0, -2.25], [131.6, -1.5], [130.95, -1.4],
];
// Papua Tengah (approximate outline: Nabire coast to Mimika coast, highlands to ~138E).
const TENGAH: [number, number][] = [
  [134.7, -3.05], [135.2, -3.38], [135.6, -3.35], [136.0, -3.0], [136.35, -2.55], [136.9, -2.75], [137.5, -3.0],
  [138.05, -3.45], [138.15, -4.1], [137.8, -4.75], [137.5, -5.1], [136.9, -4.8], [136.0, -4.5], [134.9, -4.1],
  [134.6, -3.75],
];
// Faint internal borders of the other provinces (approximate).
const BORDERS: [number, number][][] = [
  [[134.6, -3.75], [134.15, -3.2], [133.6, -2.6]],
  [[138.05, -3.45], [138.9, -3.2], [139.8, -3.35], [141.0, -3.5]],
  [[138.15, -4.1], [139.2, -4.55], [140.3, -5.05], [141.0, -5.2]],
  [[137.5, -5.1], [138.2, -5.6]],
];

export const MAP_W = 2048;
export const MAP_H = 1536;
const LON0 = 130.4, LON1 = 141.9, LAT0 = 0.15, LAT1 = -9.35;
const MX0 = 120, MX1 = MAP_W - 120, MY0 = 190, MY1 = MAP_H - 150;
export const proj = (lon: number, lat: number): [number, number] => {
  // keep lon/lat aspect ~1:1 near the equator
  const sx = (MX1 - MX0) / (LON1 - LON0);
  const sy = (MY1 - MY0) / (LAT0 - LAT1);
  const s = Math.min(sx, sy);
  const ox = MX0 + ((MX1 - MX0) - s * (LON1 - LON0)) / 2;
  const oy = MY0 + ((MY1 - MY0) - s * (LAT0 - LAT1)) / 2;
  return [ox + (lon - LON0) * s, oy + (LAT0 - lat) * s];
};
/** UV (0..1) of a lon/lat point on the map sheet. */
export const mapUV = (lon: number, lat: number): [number, number] => {
  const [x, y] = proj(lon, lat);
  return [x / MAP_W, y / MAP_H];
};

const poly = (ctx: CanvasRenderingContext2D, pts: [number, number][]) => {
  ctx.beginPath();
  pts.forEach(([lo, la], i) => {
    const [x, y] = proj(lo, la);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
};

export const mapTexture = () =>
  canvasTex("ep03-map", MAP_W, MAP_H, (ctx, w, h) => {
    // sea tint + graticule
    ctx.fillStyle = "#DCD8C8";
    ctx.fillRect(0, 0, w, h);
    paperGrain(ctx, w, h, 11);
    ctx.strokeStyle = "rgba(60,70,80,0.18)";
    ctx.lineWidth = 2;
    for (let lo = 131; lo <= 141; lo++) {
      const [x] = proj(lo, 0);
      ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, h - 110); ctx.stroke();
    }
    for (let la = 0; la >= -9; la--) {
      const [, y] = proj(131, la);
      ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(w - 80, y); ctx.stroke();
    }
    ctx.fillStyle = "rgba(40,50,60,0.55)";
    ctx.font = "600 24px 'Courier New', monospace";
    for (let lo = 132; lo <= 141; lo += 2) {
      const [x] = proj(lo, 0);
      ctx.fillText(`${lo}°BT`, x + 6, 178);
    }
    for (let la = -2; la >= -8; la -= 2) {
      const [, y] = proj(131, la);
      ctx.fillText(`${-la}°LS`, 88, y - 8);
    }
    // land
    ctx.save();
    ctx.shadowColor = "rgba(40,30,20,0.35)";
    ctx.shadowBlur = 18;
    poly(ctx, COAST);
    ctx.fillStyle = "#EFE9D8";
    ctx.fill();
    ctx.restore();
    // land hachure (contour-like)
    ctx.save();
    poly(ctx, COAST);
    ctx.clip();
    const r = prng(5);
    ctx.strokeStyle = "rgba(110,90,60,0.12)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      const cx = proj(134 + r() * 6.5, -3.3 - r() * 2.2);
      ctx.beginPath();
      ctx.ellipse(cx[0], cx[1], 30 + r() * 110, 12 + r() * 40, -0.25, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // Papua Tengah: red hatch
    ctx.save();
    poly(ctx, TENGAH);
    ctx.fillStyle = "rgba(216,49,28,0.28)";
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = "rgba(190,36,20,0.55)";
    ctx.lineWidth = 4;
    for (let i = -h; i < w; i += 22) {
      ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + h, 0); ctx.stroke();
    }
    ctx.restore();
    // borders
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = "rgba(60,55,45,0.55)";
    ctx.lineWidth = 3;
    BORDERS.forEach((b) => {
      ctx.beginPath();
      b.forEach(([lo, la], i) => {
        const [x, y] = proj(lo, la);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.setLineDash([]);
    poly(ctx, TENGAH);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 7;
    ctx.stroke();
    poly(ctx, COAST);
    ctx.strokeStyle = "#2A2621";
    ctx.lineWidth = 4;
    ctx.stroke();
    // labels
    const label = (t: string, lo: number, la: number, size: number, color = INK, weight = 700, ls = 4) => {
      const [x, y] = proj(lo, la);
      ctx.font = `${weight} ${size}px Arial, sans-serif`;
      ctx.fillStyle = color;
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
      ctx.textAlign = "center";
      ctx.fillText(t, x, y);
      (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    };
    // big two-line label with a paper halo so it reads on a phone
    ctx.save();
    ctx.lineJoin = "round";
    for (const [txt, la] of [["PAPUA", -3.35], ["TENGAH", -4.1]] as [string, number][]) {
      const [x, y] = proj(136.35, la);
      ctx.font = "900 92px 'Arial Black', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(244,239,226,0.92)";
      ctx.lineWidth = 16;
      ctx.strokeText(txt, x, y);
      ctx.fillStyle = "#9E1C0E";
      ctx.fillText(txt, x, y);
    }
    ctx.restore();
    label("PAPUA PEGUNUNGAN", 139.7, -4.15, 30, "rgba(30,30,28,0.75)");
    label("PAPUA SELATAN", 139.6, -6.9, 34, "rgba(30,30,28,0.75)");
    label("PAPUA", 139.6, -2.85, 30, "rgba(30,30,28,0.75)");
    label("PAPUA BARAT", 133.0, -1.25, 26, "rgba(30,30,28,0.7)");
    label("TELUK CENDERAWASIH", 135.9, -1.75, 26, "rgba(40,60,80,0.6)", 600, 6);
    label("LAUT ARAFURA", 135.0, -7.4, 34, "rgba(40,60,80,0.55)", 600, 10);
    // cities
    const city = (t: string, lo: number, la: number, dx: number, dy: number) => {
      const [x, y] = proj(lo, la);
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#F4EFE2";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "700 28px 'Courier New', monospace";
      ctx.fillStyle = INK;
      ctx.textAlign = dx < 0 ? "right" : "left";
      ctx.fillText(t, x + dx, y + dy);
    };
    city("NABIRE", 135.5, -3.37, -18, -14);
    city("TIMIKA", 136.88, -4.75, 18, 34);
    city("MERAUKE", 140.4, -8.47, -18, -14);
    city("WAMENA", 138.95, -4.1, 18, -14);
    // header strip
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 120);
    ctx.font = "900 52px Arial, sans-serif";
    ctx.fillStyle = "#F4EFE2";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
    ctx.fillText("PETA KERJA // TANAH PAPUA", 60, 80);
    ctx.textAlign = "right";
    ctx.font = "700 34px 'Courier New', monospace";
    ctx.fillStyle = "#FF6A4D";
    ctx.fillText("AUDIRA FORENSIK · EXH-03", w - 60, 76);
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    ctx.textAlign = "left";
    ctx.font = "600 26px 'Courier New', monospace";
    ctx.fillStyle = "rgba(30,30,28,0.7)";
    ctx.fillText("Batas provinsi disederhanakan. Arsiran merah = provinsi teratas di model.", 70, h - 50);
  });

// ---------- Stamp ----------
export const stampTexture = () =>
  canvasTex(
    "ep03-stamp",
    1100,
    520,
    (ctx, w, h) => {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 16;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.lineWidth = 5;
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.fillStyle = RED;
      ctx.textAlign = "center";
      ctx.font = "900 210px 'Arial Black', Arial, sans-serif";
      ctx.fillText("463.219", w / 2, 270);
      ctx.font = "900 112px 'Arial Black', Arial, sans-serif";
      (ctx as unknown as { letterSpacing: string }).letterSpacing = "14px";
      ctx.fillText("BERPOTENSI", w / 2, 430);
      erode(ctx, w, h, 77, 1);
    },
    true,
  );

// ---------- Red note (handwritten) ----------
export const noteTexture = () =>
  canvasTex("ep03-note", 900, 560, (ctx, w, h) => {
    ctx.fillStyle = "#F1E7B8";
    ctx.fillRect(0, 0, w, h);
    paperGrain(ctx, w, h, 23, "rgba(140,110,40,");
    ctx.fillStyle = "rgba(216,49,28,0.9)";
    ctx.font = "700 44px 'Courier New', monospace";
    ctx.fillText("CATATAN:", 50, 90);
    ctx.fillStyle = "#B81E10";
    ctx.font = "700 104px 'Segoe Print', 'Ink Free', cursive";
    ctx.fillText("BUKAN KASUS", 40, 250);
    ctx.font = "700 82px 'Segoe Print', 'Ink Free', cursive";
    ctx.fillText("TERKONFIRMASI", 40, 390);
    ctx.strokeStyle = "#B81E10";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(48, 440);
    ctx.bezierCurveTo(260, 462, 560, 420, 820, 452);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(70, 478);
    ctx.bezierCurveTo(300, 494, 560, 470, 780, 488);
    ctx.stroke();
  });

// ---------- Formula index card ----------
export const formulaTexture = () =>
  canvasTex("ep03-formula", 1400, 820, (ctx, w, h) => {
    ctx.fillStyle = "#F6F3EA";
    ctx.fillRect(0, 0, w, h);
    paperGrain(ctx, w, h, 41);
    ctx.strokeStyle = "rgba(70,120,190,0.35)";
    ctx.lineWidth = 3;
    for (let y = 230; y < h; y += 92) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(216,49,28,0.6)";
    ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(w, 160); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = "700 54px 'Courier New', monospace";
    ctx.fillText("RUMUS MODEL (TABEL 6)", 60, 110);
    ctx.fillStyle = "#1B2A4A";
    ctx.font = "700 98px 'Segoe Print', 'Ink Free', cursive";
    ctx.fillText("penduduk ×", 60, 350);
    ctx.fillText("prevalensi ×", 60, 520);
    ctx.fillStyle = "#B81E10";
    ctx.font = "700 150px 'Segoe Print', 'Ink Free', cursive";
    ctx.fillText("1,78", 830, 560);
    ctx.strokeStyle = "#B81E10";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(1010, 490, 230, 120, -0.06, 0.2, Math.PI * 2.05);
    ctx.stroke();
    ctx.fillStyle = "rgba(29,29,27,0.8)";
    ctx.font = "700 40px 'Courier New', monospace";
    ctx.fillText("1,78 = asumsi kenaikan 78% (Kalteng)", 60, 720);
  });

// ---------- Dossier report page ----------
export const reportTexture = () =>
  canvasTex("ep03-report", 1100, 1400, (ctx, w, h) => {
    paperGrain(ctx, w, h, 57);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 150);
    ctx.fillStyle = "#F4EFE2";
    ctx.font = "900 62px Arial, sans-serif";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "4px";
    ctx.fillText("MODEL CELIOS", 60, 98);
    ctx.fillStyle = "#FF6A4D";
    ctx.font = "700 46px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("2 NOV 2026", w - 50, 96);
    ctx.textAlign = "left";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    ctx.fillStyle = INK;
    ctx.font = "700 44px 'Courier New', monospace";
    ctx.fillText("ESTIMASI POTENSI ISPA", 60, 240);
    ctx.font = "600 34px 'Courier New', monospace";
    ctx.fillStyle = "rgba(29,29,27,0.75)";
    ctx.fillText("3.579.330 berpotensi · 32 provinsi", 60, 300);
    // table rows
    const rows: [string, string][] = [
      ["Papua Tengah", "463.219"],
      ["Jawa Timur", "377.768"],
      ["Lampung", "304.645"],
      ["NTB", "293.563"],
      ["Papua Pegunungan", "282.083"],
    ];
    rows.forEach(([n, v], i) => {
      const y = 420 + i * 110;
      ctx.fillStyle = i === 0 ? "rgba(216,49,28,0.22)" : "rgba(0,0,0,0)";
      ctx.fillRect(40, y - 62, w - 80, 92);
      ctx.fillStyle = INK;
      ctx.font = "700 46px 'Courier New', monospace";
      ctx.fillText(n, 60, y);
      ctx.textAlign = "right";
      ctx.fillText(v, w - 60, y);
      ctx.textAlign = "left";
      ctx.strokeStyle = "rgba(29,29,27,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(40, y + 30); ctx.lineTo(w - 40, y + 30); ctx.stroke();
    });
    ctx.fillStyle = "rgba(29,29,27,0.35)";
    for (let i = 0; i < 6; i++) ctx.fillRect(60, 1000 + i * 58, (i % 3 === 2 ? 0.55 : 0.88) * (w - 120), 20);
  });

// ---------- Evidence tent ----------
export const tentTexture = () =>
  canvasTex("ep03-tent", 1000, 420, (ctx, w, h) => {
    ctx.fillStyle = "#F2C230";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 24);
    ctx.fillRect(0, h - 24, w, 24);
    ctx.textAlign = "center";
    ctx.font = "900 150px 'Arial Black', Arial, sans-serif";
    ctx.fillText("03", w / 2, 200);
    ctx.font = "900 70px Arial, sans-serif";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
    ctx.fillText("AUDIRA FORENSIK", w / 2, 330);
  });

// ---------- Smoke puff (soft layered blobs, alpha only) ----------
export const smokeTexture = (seed: number) =>
  canvasTex(
    `ep03-smoke-${seed}`,
    512,
    512,
    (ctx, w, h) => {
      const r = prng(seed);
      for (let i = 0; i < 60; i++) {
        const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * w * 0.3;
        const x = w / 2 + Math.cos(a) * d * 1.3, y = h / 2 + Math.sin(a) * d * 0.7;
        const rad = 40 + r() * 110;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(235,226,210,${0.05 + r() * 0.07})`);
        g.addColorStop(1, "rgba(235,226,210,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
    },
    true,
  );
