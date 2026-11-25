// EP05 FILM world: the cover map (world.ts) widened east to 110.5°BT so West Kalimantan and the tip of
// Sarawak are on the paper. The cover keeps using world.ts unchanged. Pure, seeded, cached.
// Map coordinates: lon/lat -> world x/z on a table-top paper map; south toward the camera.
import * as THREE from "three";
import { GEO } from "./geo.ts";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";

export const LON0 = 97.5, LON1 = 110.5, LAT0 = -6.5, LAT1 = 7.5;
export const K = 0.55; // world units per degree
export const LONC = (LON0 + LON1) / 2, LATC = (LAT0 + LAT1) / 2;
export const MAP_W = (LON1 - LON0) * K, MAP_H = (LAT1 - LAT0) * K;
export const wx = (lon: number) => (lon - LONC) * K;
export const wz = (lat: number) => -(lat - LATC) * K;

const TW = 3072, TH = Math.round(3072 * ((LAT1 - LAT0) / (LON1 - LON0)));
const px = (lon: number) => ((lon - LON0) / (LON1 - LON0)) * TW;
const py = (lat: number) => ((LAT1 - lat) / (LAT1 - LAT0)) * TH;

export const PAL = {
  table: "#1a1511",
  sea: "#b7c1b9",
  seaInk: "#5e7a80",
  indo: "#ebe0c4",
  malay: "#d6dab8",
  thai: "#ddd2b4",
  ink: "#2c241d",
  border: "#9b2226",
  fire: "#ff5a1f",
  smoke: "#6f6861",
  cream: "#f4ead2",
};

// Sources and route (lon, lat). BMKG [18]: smoke from Sumsel and Jambi to Pekanbaru; BBC [1]: on to Malaysia/Singapore.
export const SUMSEL: [number, number] = [104.75, -3.05];
export const JAMBI: [number, number] = [103.6, -1.55];
export const PEKANBARU: [number, number] = [101.45, 0.51];
export const KL: [number, number] = [101.69, 3.14];
export const SINGAPORE: [number, number] = [103.82, 1.35];
export const MAIN_ROUTE: [number, number][] = [
  [105.0, -3.35], [104.45, -2.65], [103.85, -1.85], [103.3, -1.1], [102.5, -0.4], [101.85, 0.2], [101.45, 0.7],
  [101.45, 1.35], [101.7, 2.0], [101.95, 2.55], [102.05, 2.9],
];
export const SG_ROUTE: [number, number][] = [
  [101.6, 0.95], [102.3, 0.85], [102.95, 0.95], [103.45, 1.12], [103.7, 1.27],
];
// Approximate sea boundary Indonesia–Malaysia–Singapore (Strait of Malacca, Singapore Strait) and the Johor Strait.
export const BORDER_MAIN: [number, number][] = [
  [98.6, 5.9], [99.1, 5.0], [99.65, 4.15], [100.3, 3.35], [100.85, 2.8], [101.35, 2.4], [101.95, 2.0], [102.55, 1.62],
  [103.15, 1.3], [103.6, 1.17], [103.85, 1.16], [104.05, 1.21], [104.3, 1.3], [104.7, 1.5], [105.2, 1.9],
];
export const BORDER_JOHOR: [number, number][] = [[103.6, 1.4], [103.72, 1.45], [103.85, 1.455], [103.98, 1.42]];

const ring2d = (ctx: CanvasRenderingContext2D, ring: number[][]) => {
  ring.forEach(([lo, la], i) => (i ? ctx.lineTo(px(lo), py(la)) : ctx.moveTo(px(lo), py(la))));
  ctx.closePath();
};
const country = (ctx: CanvasRenderingContext2D, name: string) => {
  ctx.beginPath();
  for (const c of GEO) if (c.name === name) for (const r of c.rings) ring2d(ctx, r as number[][]);
};
const RIVERS: [number, number][][] = [
  [[100.6, 0.6], [101.0, 0.5], [101.45, 0.53], [101.8, 0.75], [102.1, 0.9], [102.5, 1.1]], // Siak
  [[100.6, 0.15], [101.1, 0.3], [101.5, 0.22], [102.0, 0.3], [102.5, 0.25], [102.9, 0.35]], // Kampar
  [[101.0, -0.6], [101.6, -0.5], [102.0, -0.45], [102.5, -0.38], [103.0, -0.32], [103.35, -0.3]], // Indragiri
  [[101.5, -1.2], [102.0, -1.4], [102.6, -1.55], [103.1, -1.6], [103.6, -1.6], [104.0, -1.25], [104.25, -1.05]], // Batanghari
  [[102.6, -3.3], [103.1, -3.15], [103.6, -3.0], [104.2, -3.05], [104.75, -2.98], [104.85, -2.6], [104.9, -2.3]], // Musi
  [[110.5, 0.25], [110.1, 0.05], [109.8, -0.1], [109.5, -0.02], [109.3, -0.03]], // Kapuas
  [[102.0, 3.95], [102.5, 3.7], [103.0, 3.55], [103.42, 3.5]], // Pahang
];
const TOWNS: [string, number, number, number, number][] = [
  ["Medan", 98.67, 3.59, 14, -14], ["Dumai", 101.45, 1.67, -14, -12], ["Padang", 100.35, -0.95, -14, 0], ["Rengat", 102.55, -0.37, 14, 16],
  ["Palembang", 104.76, -2.98, 14, 18], ["Bandar Lampung", 105.26, -5.43, 14, 0], ["Pangkal Pinang", 106.11, -2.13, 14, 0],
  ["Pontianak", 109.33, -0.03, -14, 18], ["Kuching", 110.35, 1.55, -14, 20], ["Melaka", 102.25, 2.19, 14, 8], ["Ipoh", 101.08, 4.6, 14, 0],
  ["Kuantan", 103.33, 3.82, 14, 0], ["Tanjung Pinang", 104.45, 0.92, 14, 14], ["Muaro Jambi", 103.85, -1.45, 14, -14], ["Sibolga", 98.78, 1.74, 14, 0],
];
// Sarawak (Malaysia) is missing from geo.ts: a hand-traced coast; its south edge hides under Kalbar.
export const SARAWAK_COAST: [number, number][] = [
  [109.64, 2.08], [109.9, 1.72], [110.25, 1.7], [110.6, 1.78], [111.0, 1.62], [111.25, 2.05], [111.45, 2.55], [111.8, 2.85], [112.5, 3.05],
];
const sarawak = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ring2d(ctx, [...SARAWAK_COAST, [112.5, 0.6], [109.5, 0.6]]);
};
const sarawakCoast = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  SARAWAK_COAST.forEach(([lo, la], i) => (i ? ctx.lineTo(px(lo), py(la)) : ctx.moveTo(px(lo), py(la))));
};
const allLand = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  for (const c of GEO) for (const r of c.rings) ring2d(ctx, r as number[][]);
};

const blotches = (ctx: CanvasRenderingContext2D, rnd: () => number, n: number, color: string, a: number, rmin: number, rmax: number) => {
  for (let i = 0; i < n; i++) {
    const x = rnd() * TW, y = rnd() * TH, r = rmin + rnd() * (rmax - rmin);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("A", String(a * (0.4 + rnd() * 0.6))));
    g.addColorStop(1, color.replace("A", "0"));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
};

const dashed = (ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, w: number, dash: number[]) => {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  pts.forEach(([lo, la], i) => (i ? ctx.lineTo(px(lo), py(la)) : ctx.moveTo(px(lo), py(la))));
  ctx.stroke();
  ctx.restore();
};

const spaced = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, rot: number, size: number, color: string, spacing: number, weight = 500, italic = false) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  const widths = [...text].map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let cx = -total / 2;
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, cx, 0);
    cx += widths[i];
  });
  ctx.restore();
};

function paintMap(): { tex: THREE.CanvasTexture; mask: Float32Array; mw: number; mh: number } {
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  const ctx = c.getContext("2d")!;
  const rnd = prng(505);
  // Sea wash + mottling
  ctx.fillStyle = PAL.sea;
  ctx.fillRect(0, 0, TW, TH);
  blotches(ctx, rnd, 140, "rgba(70,95,100,A)", 0.12, 60, 260);
  blotches(ctx, rnd, 90, "rgba(255,250,235,A)", 0.12, 50, 200);
  // Graticule
  ctx.strokeStyle = "rgba(60,80,85,0.34)";
  ctx.lineWidth = 2.5;
  for (let lo = 98; lo <= 110; lo++) { ctx.beginPath(); ctx.moveTo(px(lo), 0); ctx.lineTo(px(lo), TH); ctx.stroke(); }
  for (let la = -6; la <= 7; la++) { ctx.beginPath(); ctx.moveTo(0, py(la)); ctx.lineTo(TW, py(la)); ctx.stroke(); }
  // Coastal ripple lines (classic engraved coast)
  for (const [w, a] of [[46, 0.07], [30, 0.1], [18, 0.16], [9, 0.22]] as const) {
    allLand(ctx);
    ctx.strokeStyle = `rgba(55,85,92,${a})`;
    ctx.lineWidth = w;
    ctx.lineJoin = "round";
    ctx.stroke();
    sarawakCoast(ctx);
    ctx.stroke();
  }
  // Land fills
  sarawak(ctx);
  ctx.fillStyle = PAL.malay;
  ctx.fill();
  for (const [name, col] of [["Thailand", PAL.thai], ["Malaysia", PAL.malay], ["Singapore", PAL.malay], ["Indonesia", PAL.indo]] as const) {
    country(ctx, name);
    ctx.fillStyle = col;
    ctx.fill("evenodd");
  }
  // Land mottling + scorched peat around the sources, clipped to land
  ctx.save();
  allLand(ctx);
  ctx.clip("evenodd");
  blotches(ctx, rnd, 220, "rgba(150,115,70,A)", 0.14, 30, 160);
  blotches(ctx, rnd, 120, "rgba(255,248,230,A)", 0.16, 30, 140);
  const scorch = (lon: number, lat: number, n: number, s: number) => {
    for (let i = 0; i < n; i++) {
      const x = px(lon + (rnd() - 0.5) * s), y = py(lat + (rnd() - 0.5) * s * 0.8), r = 24 + rnd() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(70,30,15,${0.3 + rnd() * 0.25})`);
      g.addColorStop(1, "rgba(70,30,15,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  };
  scorch(SUMSEL[0], SUMSEL[1], 40, 1.3);
  scorch(JAMBI[0], JAMBI[1], 26, 0.9);
  scorch(109.9, -0.4, 14, 0.8);
  // hill shading along the Bukit Barisan and Titiwangsa ranges (painted relief under the 3D bumps)
  const hr = prng(312);
  for (const [line, n] of [[SPINE, 260], [TITI, 70]] as const) {
    for (let i = 0; i < n; i++) {
      const tt = hr() * (line.length - 1), k0 = Math.floor(tt), f = tt - k0;
      const a = line[k0], b = line[Math.min(k0 + 1, line.length - 1)];
      const lon = a[0] + (b[0] - a[0]) * f + (hr() - 0.5) * 0.7, lat = a[1] + (b[1] - a[1]) * f + (hr() - 0.5) * 0.7;
      const x = px(lon), y = py(lat), r = 18 + hr() * 46;
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      g.addColorStop(0, `rgba(255,250,232,${0.12 + hr() * 0.1})`);
      g.addColorStop(0.55, `rgba(150,120,80,${0.1 + hr() * 0.08})`);
      g.addColorStop(1, "rgba(120,95,60,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }
  // rivers (approximate courses, engraved style)
  for (const r of RIVERS) {
    ctx.strokeStyle = "rgba(70,105,115,0.7)";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    r.forEach(([lo, la], i) => (i ? ctx.lineTo(px(lo), py(la)) : ctx.moveTo(px(lo), py(la))));
    ctx.stroke();
  }
  ctx.restore();
  // Coast ink
  allLand(ctx);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.2;
  ctx.lineJoin = "round";
  ctx.stroke();
  sarawakCoast(ctx);
  ctx.stroke();
  // Painted borders under the raised 3D dashes
  dashed(ctx, BORDER_MAIN, "rgba(155,34,38,0.55)", 7, [22, 16]);
  dashed(ctx, BORDER_JOHOR, "rgba(155,34,38,0.55)", 5, [12, 10]);
  // Painted region and sea names (not covered by 3D objects)
  spaced(ctx, "S U M A T R A", px(100.0), py(-1.2), -0.98, 60, "rgba(60,45,30,0.55)", 16, 600);
  spaced(ctx, "SELAT MALAKA", px(99.9), py(3.05), -0.72, 44, "rgba(40,70,78,0.8)", 12, 500, true);
  spaced(ctx, "SEMENANJUNG MALAYSIA", px(102.7), py(4.6), -1.1, 34, "rgba(60,60,35,0.6)", 9, 600);
  spaced(ctx, "LAUT NATUNA", px(106.2), py(3.2), -0.2, 36, "rgba(40,70,78,0.7)", 10, 500, true);
  spaced(ctx, "SAMUDRA HINDIA", px(98.9), py(-1.6), -0.95, 40, "rgba(40,70,78,0.7)", 12, 500, true);
  spaced(ctx, "LAUT CINA SELATAN", px(105.2), py(6.3), -0.1, 40, "rgba(40,70,78,0.75)", 11, 500, true);
  spaced(ctx, "SELAT KARIMATA", px(108.2), py(-1.9), -1.2, 34, "rgba(40,70,78,0.7)", 9, 500, true);
  spaced(ctx, "LAUT JAWA", px(108.6), py(-5.2), -0.1, 36, "rgba(40,70,78,0.7)", 10, 500, true);
  spaced(ctx, "SELAT MALAKA", px(101.3), py(1.95), -0.62, 30, "rgba(40,70,78,0.7)", 8, 500, true);
  spaced(ctx, "SELAT BERHALA", px(104.0), py(-0.6), -0.9, 26, "rgba(40,70,78,0.6)", 6, 500, true);
  // small towns: ink dot + name (kept off the 3D tag anchors)
  for (const [name, lo, la, dx, dy] of TOWNS) {
    ctx.fillStyle = PAL.ink;
    ctx.beginPath(); ctx.arc(px(lo), py(la), 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f4ead2";
    ctx.beginPath(); ctx.arc(px(lo), py(la), 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = `600 27px ${FONT}`;
    ctx.fillStyle = "rgba(44,36,29,0.85)";
    ctx.textBaseline = "middle";
    ctx.textAlign = dx < 0 ? "right" : "left";
    ctx.fillText(name, px(lo) + dx, py(la) + dy);
    ctx.textAlign = "left";
  }
  // latitude labels on the graticule
  ctx.font = `500 24px ${FONT}`;
  ctx.fillStyle = "rgba(44,36,29,0.7)";
  for (let la = -6; la <= 7; la++) if (la !== 0) ctx.fillText(`${Math.abs(la)}°${la < 0 ? "LS" : "LU"}`, 62, py(la) - 14);
  ctx.fillText("KHATULISTIWA 0°", 62, py(0) - 14);
  spaced(ctx, "K A L I M A N T A N", px(109.95), py(-1.4), -1.45, 54, "rgba(60,45,30,0.55)", 14, 600);
  spaced(ctx, "SARAWAK", px(110.15), py(2.05), -0.15, 26, "rgba(60,60,35,0.6)", 6, 600);
  spaced(ctx, "BATAS NEGARA", px(100.6), py(2.35), -0.68, 26, "rgba(155,34,38,0.9)", 6, 600);
  // Compass rose (sea, south-east)
  ctx.save();
  ctx.translate(px(106.6), py(-4.7));
  ctx.strokeStyle = "rgba(44,36,29,0.7)";
  ctx.fillStyle = "rgba(44,36,29,0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 78, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(16, 0); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  spaced(ctx, "U", px(106.6), py(-4.7) - 150, 0, 38, "rgba(44,36,29,0.85)", 0, 600);
  // Frame: double ink rule + degree ticks
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 10;
  ctx.strokeRect(26, 26, TW - 52, TH - 52);
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, TW - 96, TH - 96);
  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = "rgba(44,36,29,0.8)";
  for (let lo = 98; lo <= 110; lo++) ctx.fillText(`${lo}°BT`, px(lo) + 6, TH - 60);
  // Paper fibre speckle over everything
  const img = ctx.getImageData(0, 0, TW, TH);
  const r2 = prng(77);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r2() - 0.5) * 16;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // Feathered land mask for the relief
  const mw = 400, mh = Math.round(400 * (TH / TW));
  const m = document.createElement("canvas");
  m.width = mw; m.height = mh;
  const mc = m.getContext("2d")!;
  mc.fillStyle = "#000"; mc.fillRect(0, 0, mw, mh);
  mc.filter = "blur(3px)";
  mc.scale(mw / TW, mh / TH);
  allLand(mc);
  mc.fillStyle = "#fff";
  mc.fill("evenodd");
  const md = mc.getImageData(0, 0, mw, mh).data;
  const mask = new Float32Array(mw * mh);
  for (let i = 0; i < mask.length; i++) mask[i] = md[i * 4] / 255;
  return { tex, mask, mw, mh };
}

// Seeded gaussian peaks along Bukit Barisan and the Titiwangsa range (memory fix: no periodic sin relief).
const SPINE: [number, number][] = [
  [97.9, 4.0], [98.6, 3.0], [99.4, 1.5], [100.1, 0.4], [100.6, -0.6], [101.3, -1.7], [102.2, -3.0], [103.2, -4.0], [104.0, -4.9], [104.6, -5.5],
];
const TITI: [number, number][] = [[101.4, 6.0], [101.6, 5.0], [101.8, 4.0], [102.1, 3.1]];
type Peak = { x: number; z: number; s: number; a: number };
const PEAKS: Peak[] = (() => {
  const rnd = prng(905);
  const out: Peak[] = [];
  const along = (line: [number, number][], n: number, amp: number) => {
    for (let i = 0; i < n; i++) {
      const t = rnd() * (line.length - 1);
      const k = Math.floor(t), f = t - k;
      const a = line[k], b = line[Math.min(k + 1, line.length - 1)];
      const lon = a[0] + (b[0] - a[0]) * f + (rnd() - 0.5) * 0.5;
      const lat = a[1] + (b[1] - a[1]) * f + (rnd() - 0.5) * 0.5;
      out.push({ x: wx(lon), z: wz(lat), s: (0.08 + rnd() * 0.16) * K, a: amp * (0.4 + rnd() * 0.6) });
    }
  };
  along(SPINE, 140, 0.11);
  along(TITI, 30, 0.05);
  return out;
})();

let cache: ReturnType<typeof build> | null = null;
function build() {
  const { tex, mask, mw, mh } = paintMap();
  const maskAt = (x: number, z: number) => {
    const u = (x / MAP_W + 0.5) * (mw - 1), v = (z / MAP_H + 0.5) * (mh - 1);
    const i = Math.max(0, Math.min(mw - 1, Math.round(u))), j = Math.max(0, Math.min(mh - 1, Math.round(v)));
    return mask[j * mw + i];
  };
  const heightAt = (x: number, z: number) => {
    let h = 0;
    for (const p of PEAKS) {
      const dx = x - p.x, dz = z - p.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 9 * p.s * p.s) h += p.a * Math.exp(-d2 / (2 * p.s * p.s));
    }
    const m = maskAt(x, z);
    return Math.min(h, 0.14) * m + 0.006 * m;
  };
  const geo = new THREE.PlaneGeometry(MAP_W, MAP_H, 300, 420);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  return { tex, geo, heightAt };
}
export const getWorld = () => (cache ??= build());

export const v3 = (lon: number, lat: number, lift: number) => {
  const { heightAt } = getWorld();
  const x = wx(lon), z = wz(lat);
  return new THREE.Vector3(x, heightAt(x, z) + lift, z);
};
