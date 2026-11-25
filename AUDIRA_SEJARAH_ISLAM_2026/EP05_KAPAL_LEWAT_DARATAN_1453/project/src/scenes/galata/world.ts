// EP05 "Kapal lewat daratan" (HISTORYMAP): paper map world of Constantinople, Galata, the Golden Horn
// and the Bosporus in 1453. Pure, seeded, cached. Coordinates are kilometres on the map, origin at the
// mouth of the Golden Horn, x = east, y = north; world X = x, world Z = -y (north away from a south camera).
// Coastlines are simplified by hand from modern Istanbul (approximate, schematic).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";

export type P2 = [number, number];

export const X0 = -6, X1 = 6, Y0 = -5, Y1 = 7;
export const MAP_W = X1 - X0, MAP_H = Y1 - Y0;
export const CX = (X0 + X1) / 2, CY = (Y0 + Y1) / 2;
/** Map km -> world X/Z (map centred at the world origin). */
export const wx = (x: number) => x - CX;
export const wz = (y: number) => -(y - CY);

const TW = 2048, TH = 2048;
const px = (x: number) => ((x - X0) / MAP_W) * TW;
const py = (y: number) => ((Y1 - y) / MAP_H) * TH;

export const PAL = {
  table: "#17130f",
  sea: "#a9b8b4",
  land: "#eadfc2",
  landWarm: "#e2d2ad",
  ink: "#2b231c",
  wall: "#8a3a2c",
  route: "#ffb347",
  cream: "#f4ead2",
  red: "#a3282b",
};

// ---------- water (Marmara + Bosporus as one body, the Golden Horn as a channel) ----------
export const SEA: P2[] = [
  [-7, -7], [-7, -3.45], [-4.7, -2.8], [-3.5, -2.25], [-2.35, -1.78], [-1.1, -1.68], [0.17, -1.58], [0.55, -1.05], [0.8, -0.55],
  [0.62, -0.12], [0.62, 0.22], [-0.15, 0.42], [0.35, 0.95], [1.25, 1.6], [1.85, 2.22], [2.4, 2.58], [2.9, 3.6], [3.25, 5.0], [3.5, 7.5],
  [5.0, 7.5], [4.4, 5.0], [3.85, 3.0], [3.35, 1.6], [3.1, 0.9], [2.45, 0.25], [2.85, -1.45], [3.5, -2.3], [3.9, -3.1], [4.0, -4.2], [7, -5], [7, -7],
];
export const HORN: P2[] = [
  [0.62, -0.12], [-0.5, -0.05], [-1.6, 0.55], [-2.4, 1.15], [-3.0, 1.9], [-3.5, 2.9], [-3.9, 4.2], [-4.1, 5.0],
  [-3.7, 5.05], [-3.4, 4.3], [-3.0, 3.0], [-2.5, 2.1], [-1.9, 1.55], [-1.2, 1.05], [-0.6, 0.72], [-0.15, 0.42], [0.62, 0.22],
];

// Land walls (Yedikule to Blachernae) and sea walls along the Golden Horn and Marmara (schematic).
export const LAND_WALL: P2[] = [[-4.72, -2.72], [-4.55, -1.6], [-4.35, -0.5], [-4.05, 0.6], [-3.7, 1.55], [-3.28, 2.25]];
export const HORN_WALL: P2[] = [[-3.18, 2.22], [-2.85, 1.75], [-2.3, 1.08], [-1.55, 0.48], [-0.5, -0.12], [0.45, -0.18]];
export const SEA_WALL: P2[] = [[0.55, -0.25], [0.68, -0.6], [0.42, -1.05], [0.05, -1.48], [-1.1, -1.58], [-2.35, -1.68], [-3.5, -2.15], [-4.6, -2.68]];

// Story points (schematic positions; register #6, #10, #18, #21).
export const CHAIN_CITY: P2 = [0.42, -0.06]; // tower on the city side (Eugenios)
export const CHAIN_GALATA: P2 = [0.02, 0.5]; // tower on the Galata side (Kastellion)
export const GALATA_TOWER: P2 = [-0.42, 1.0];
export const DOUBLE_COLUMNS: P2 = [1.95, 2.3];
// Land route: Bosporus shore near Double Columns -> valley -> ridge behind Galata (~60 m) -> Valley of the Springs -> Golden Horn.
export const ROUTE: P2[] = [[2.05, 2.2], [1.55, 2.45], [1.0, 2.62], [0.45, 2.62], [-0.15, 2.38], [-0.72, 2.0], [-1.22, 1.62], [-1.62, 1.32]];
export const ROUTE_WATER: P2[] = [[-1.62, 1.32], [-1.85, 1.05], [-1.9, 0.82]];

/** Chaikin corner cutting (closed ring) so the hand-made coast reads as a drawn coastline. */
const smooth = (pts: P2[], n = 3): P2[] => {
  let r = pts;
  for (let k = 0; k < n; k++) {
    const o: P2[] = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    r = o;
  }
  return r;
};
const SEA_S = smooth(SEA), HORN_S = smooth(HORN);
const ring = (ctx: CanvasRenderingContext2D, pts: P2[]) => {
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
  ctx.closePath();
};
const water = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ring(ctx, SEA_S);
  ring(ctx, HORN_S);
};
const line = (ctx: CanvasRenderingContext2D, pts: P2[]) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
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

export const spaced = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, rot: number, size: number, color: string, spacing: number, weight = 500, italic = false) => {
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

// Seeded gaussian hills (memory fix: no periodic sin relief). The Pera/Galata ridge is the hero (~60 m,
// exaggerated x5 on the table); the city's hills and the Asian shore are lower.
type Peak = { x: number; y: number; s: number; a: number };
const RIDGE: P2[] = [[-0.3, 1.45], [0.15, 2.0], [0.5, 2.6], [0.55, 3.3], [0.3, 4.2], [-0.1, 5.2]];
const PEAKS: Peak[] = (() => {
  const rnd = prng(1453);
  const out: Peak[] = [];
  const along = (pts: P2[], n: number, amp: number, s0: number, s1: number, jitter: number) => {
    for (let i = 0; i < n; i++) {
      const t = rnd() * (pts.length - 1);
      const k = Math.floor(t), f = t - k;
      const a = pts[k], b = pts[Math.min(k + 1, pts.length - 1)];
      out.push({
        x: a[0] + (b[0] - a[0]) * f + (rnd() - 0.5) * jitter,
        y: a[1] + (b[1] - a[1]) * f + (rnd() - 0.5) * jitter,
        s: s0 + rnd() * (s1 - s0),
        a: amp * (0.6 + rnd() * 0.4),
      });
    }
  };
  along(RIDGE, 30, 0.3, 0.45, 0.75, 0.5);
  along([[-3.6, -1.5], [-2.0, -0.6], [-0.5, -0.6]], 12, 0.07, 0.35, 0.6, 0.6); // city hills
  along([[4.2, -3.0], [3.9, 0.5], [4.6, 3.5]], 12, 0.08, 0.5, 0.8, 0.6); // Asian shore
  along([[-2.4, 3.2], [-1.2, 4.5], [1.6, 5.0]], 10, 0.07, 0.5, 0.8, 0.8); // further north
  return out;
})();

function paintMap() {
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  const ctx = c.getContext("2d")!;
  const rnd = prng(330);
  // Land everywhere, warm mottling
  ctx.fillStyle = PAL.land;
  ctx.fillRect(0, 0, TW, TH);
  blotches(ctx, rnd, 200, "rgba(160,125,75,A)", 0.12, 40, 180);
  blotches(ctx, rnd, 120, "rgba(255,250,235,A)", 0.14, 40, 160);
  // Contour rings around the Galata ridge (cartographic hachure feel)
  for (let k = 1; k <= 6; k++) {
    ctx.strokeStyle = `rgba(110,80,45,${0.1 + k * 0.025})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const r = (7 - k) * 0.23;
    for (let a = 0; a <= 64; a++) {
      const t = (a / 64) * Math.PI * 2;
      const wob = 1 + Math.sin(t * 3 + k) * 0.08;
      const x = 0.35 + Math.cos(t) * r * 0.75 * wob, y = 2.5 + Math.sin(t) * r * 1.5 * wob;
      a ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y));
    }
    ctx.stroke();
  }
  // Coastal ripple lines (engraved coast), drawn on the water side
  ctx.save();
  water(ctx);
  ctx.clip("evenodd");
  ctx.fillStyle = PAL.sea;
  ctx.fillRect(0, 0, TW, TH);
  blotches(ctx, rnd, 120, "rgba(60,90,96,A)", 0.12, 50, 220);
  blotches(ctx, rnd, 60, "rgba(255,250,235,A)", 0.1, 50, 180);
  for (const [w, a] of [[54, 0.06], [34, 0.09], [20, 0.14], [10, 0.2]] as const) {
    water(ctx);
    ctx.strokeStyle = `rgba(50,80,88,${a})`;
    ctx.lineWidth = w;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  ctx.restore();
  // Graticule (very faint)
  ctx.strokeStyle = "rgba(60,70,70,0.14)";
  ctx.lineWidth = 2;
  for (let x = X0; x <= X1; x += 2) { ctx.beginPath(); ctx.moveTo(px(x), 0); ctx.lineTo(px(x), TH); ctx.stroke(); }
  for (let y = Y0; y <= Y1; y += 2) { ctx.beginPath(); ctx.moveTo(0, py(y)); ctx.lineTo(TW, py(y)); ctx.stroke(); }
  // Coast ink
  water(ctx);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.4;
  ctx.lineJoin = "round";
  ctx.stroke();
  // City inside the walls: warmer wash
  ctx.save();
  ctx.beginPath();
  ring(ctx, [...LAND_WALL, ...HORN_WALL.slice(1), ...SEA_WALL]);
  ctx.clip();
  ctx.fillStyle = "rgba(190,140,90,0.22)";
  ctx.fillRect(0, 0, TW, TH);
  ctx.restore();
  // Painted walls (under the raised 3D walls)
  for (const w of [LAND_WALL, HORN_WALL, SEA_WALL]) {
    line(ctx, w);
    ctx.strokeStyle = "rgba(138,58,44,0.55)";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  // Route underlay (painted dashed path; the glowing 3D route sits above)
  ctx.save();
  ctx.setLineDash([26, 18]);
  line(ctx, [...ROUTE, ...ROUTE_WATER.slice(1)]);
  ctx.strokeStyle = "rgba(163,40,43,0.7)";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();
  // Painted names
  spaced(ctx, "KONSTANTINOPEL", px(-2.1), py(-0.95), -0.38, 58, "rgba(70,40,25,0.72)", 12, 600);
  spaced(ctx, "LAUT MARMARA", px(-1.6), py(-3.4), 0, 54, "rgba(35,65,72,0.75)", 18, 500, true);
  spaced(ctx, "BOSPORUS", px(3.15), py(3.6), -1.32, 46, "rgba(35,65,72,0.8)", 14, 500, true);
  spaced(ctx, "TANDUK EMAS", px(-2.55), py(1.62), -0.86, 34, "rgba(35,65,72,0.85)", 8, 600, true);
  spaced(ctx, "SISI ASIA", px(5.0), py(-0.6), -1.4, 44, "rgba(70,50,30,0.55)", 14, 500);
  // Compass rose (Marmara, south-east)
  ctx.save();
  ctx.translate(px(1.9), py(-3.5));
  ctx.strokeStyle = "rgba(43,35,28,0.7)";
  ctx.fillStyle = "rgba(43,35,28,0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(0, -96); ctx.lineTo(13, 0); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  spaced(ctx, "U", px(1.9), py(-3.5) - 122, 0, 34, "rgba(43,35,28,0.85)", 0, 600);
  // Frame: double ink rule
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, TW - 48, TH - 48);
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, TW - 92, TH - 92);
  // Paper fibre speckle
  const img = ctx.getImageData(0, 0, TW, TH);
  const r2 = prng(77);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r2() - 0.5) * 14;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // Feathered land mask for the relief
  const mw = 400, mh = 400;
  const m = document.createElement("canvas");
  m.width = mw; m.height = mh;
  const mc = m.getContext("2d")!;
  mc.fillStyle = "#fff"; mc.fillRect(0, 0, mw, mh);
  mc.filter = "blur(4px)";
  mc.scale(mw / TW, mh / TH);
  water(mc);
  mc.fillStyle = "#000";
  mc.fill("evenodd");
  const md = mc.getImageData(0, 0, mw, mh).data;
  const mask = new Float32Array(mw * mh);
  for (let i = 0; i < mask.length; i++) mask[i] = md[i * 4] / 255;
  return { tex, mask, mw, mh };
}

let cache: ReturnType<typeof build> | null = null;
function build() {
  const { tex, mask, mw, mh } = paintMap();
  /** 0 = water, 1 = land, at map km. */
  const landAt = (x: number, y: number) => {
    const u = ((x - X0) / MAP_W) * (mw - 1), v = ((Y1 - y) / MAP_H) * (mh - 1);
    const i = Math.max(0, Math.min(mw - 1, Math.round(u))), j = Math.max(0, Math.min(mh - 1, Math.round(v)));
    return mask[j * mw + i];
  };
  /** Relief height at map km. */
  const heightAt = (x: number, y: number) => {
    let h = 0;
    for (const p of PEAKS) {
      const dx = x - p.x, dy = y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 9 * p.s * p.s) h += p.a * Math.exp(-d2 / (2 * p.s * p.s));
    }
    const m = landAt(x, y);
    return Math.min(h, 0.78) * m + 0.008 * m;
  };
  const geo = new THREE.PlaneGeometry(MAP_W, MAP_H, 360, 360);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + CX, y = -pos.getZ(i) + CY;
    pos.setY(i, heightAt(x, y));
  }
  geo.computeVertexNormals();
  return { tex, geo, heightAt, landAt };
}
export const getWorld = () => (cache ??= build());

/** World position of a map point (km), resting on the relief plus `lift`. */
export const v3 = (x: number, y: number, lift = 0) => {
  const { heightAt } = getWorld();
  return new THREE.Vector3(wx(x), heightAt(x, y) + lift, wz(y));
};
/** World position at water level (sea is flat at 0). */
export const w3 = (x: number, y: number, lift = 0) => new THREE.Vector3(wx(x), lift, wz(y));
