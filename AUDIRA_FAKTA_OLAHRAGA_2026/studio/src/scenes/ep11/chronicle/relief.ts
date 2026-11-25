// Relief map — a real-coastline 3D terrain of a map region, built in the browser from the baked Natural Earth
// paths (src/data/map-*.json, same format as the PETA kit: Mercator "map px", optional 10 m detail box).
//
// Pipeline (once per region, cached): rasterise land → several blurred copies (coastal shelf, inland distance,
// massif) → height = plateau + ridged noise + listed volcano cones, × vertical exaggeration → one grid mesh with
// vertex colours (lowland olive-grey → rock → pale peaks); plus a painted sea texture (deep → shelf, thin coast).
// World units: 1 unit = 1 map px (≈ 2.6 km at the bundled scale); y up; north = −z.

import { BufferAttribute, BufferGeometry, CanvasTexture, Color, SRGBColorSpace, LinearFilter } from "three";
import MAP from "./data/map-nusantara.json";

export type GeoMap = {
  w: number; h: number; bbox: number[];
  land: string;
  detail?: { rect: number[]; land: string };
};
export const NUSANTARA = MAP as unknown as GeoMap;

const RAD = Math.PI / 180;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
export const projPx = (lon: number, lat: number, map: GeoMap = NUSANTARA): [number, number] => {
  const k = map.w / ((map.bbox[1] - map.bbox[0]) * RAD);
  return [(lon - map.bbox[0]) * RAD * k, (merc(map.bbox[3]) - merc(lat)) * k];
};
/** km per map px at a latitude (Mercator stretch). */
export const kmPerPx = (lat: number, map: GeoMap = NUSANTARA) => ((map.bbox[1] - map.bbox[0]) * 111.32 * Math.cos(lat * RAD)) / map.w;

export type Volcano = { lon: number; lat: number; km: number; r?: number; skip?: boolean };
export type Region = {
  key: string;
  lon0: number; lon1: number; lat0: number; lat1: number;
  /** grid cell in map px (smaller = finer, heavier) */
  cell?: number;
  /** vertical exaggeration */
  vex?: number;
  volcanoes?: Volcano[];
  map?: GeoMap;
};

export type Relief = {
  geo: BufferGeometry;
  sea: CanvasTexture;
  /** world size of the region (x, z) and the sea plane centre */
  size: [number, number];
  toWorld: (lon: number, lat: number) => [number, number];
  /** terrain height (world y) under a lon/lat, sea = 0 */
  heightAt: (lon: number, lat: number) => number;
  /** terrain height (world y, may be < 0 under the sea) at a world x/z */
  heightAtWorld: (x: number, z: number) => number;
  /** world y per km of real height */
  yPerKm: number;
  color: (km: number, slope: number, n: number) => [number, number, number];
};

// ---------------------------------------------------------------- noise (gradient noise, rotated octaves)
const grad = (ix: number, iy: number, x: number, y: number) => {
  const h = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  const a = (h - Math.floor(h)) * Math.PI * 2;
  return Math.cos(a) * (x - ix) + Math.sin(a) * (y - iy);
};
const q = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** Perlin-style gradient noise, roughly −0.7…0.7 → mapped to 0…1. */
const gnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = q(x - xi), v = q(y - yi);
  const a = grad(xi, yi, x, y), b = grad(xi + 1, yi, x, y), c = grad(xi, yi + 1, x, y), d = grad(xi + 1, yi + 1, x, y);
  return 0.5 + 0.75 * (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v);
};
const ROT = [0.8, 0.6];
export const fbm = (x: number, y: number, oct = 5) => {
  let s = 0, a = 0.5, f = 1, px = x, py = y;
  for (let i = 0; i < oct; i++) {
    s += a * gnoise(px * f, py * f);
    const nx = px * ROT[0] - py * ROT[1], ny = px * ROT[1] + py * ROT[0];
    px = nx + 17.3; py = ny - 9.1;
    f *= 2.02; a *= 0.5;
  }
  return s;
};
export const ridged = (x: number, y: number, oct = 5) => {
  let s = 0, a = 0.6, f = 1, px = x, py = y, w = 1;
  for (let i = 0; i < oct; i++) {
    let n = 1 - Math.abs(gnoise(px * f, py * f) * 2 - 1);
    n = n * n * w;
    s += a * n;
    w = Math.min(1, n * 1.6);
    const nx = px * ROT[0] - py * ROT[1], ny = px * ROT[1] + py * ROT[0];
    px = nx + 5.7; py = ny + 3.3;
    f *= 2.15; a *= 0.5;
  }
  return s;
};

// ---------------------------------------------------------------- palette
const LAND_LOW = new Color("#626c5c"), LAND_MID = new Color("#7b7e70"), LAND_HIGH = new Color("#9c978a"), LAND_PEAK = new Color("#cbc4b5");
const ROCK = new Color("#66645c");
export const reliefColor = (km: number, slope: number, n: number): [number, number, number] => {
  const c = new Color();
  if (km < 0.6) c.copy(LAND_LOW).lerp(LAND_MID, km / 0.6);
  else if (km < 1.8) c.copy(LAND_MID).lerp(LAND_HIGH, (km - 0.6) / 1.2);
  else c.copy(LAND_HIGH).lerp(LAND_PEAK, Math.min(1, (km - 1.8) / 1.8));
  c.lerp(ROCK, Math.min(0.55, Math.max(0, slope - 0.35) * 0.9));
  c.multiplyScalar(0.88 + 0.24 * n);
  return [c.r, c.g, c.b];
};

// ---------------------------------------------------------------- raster helpers
type Raster = { w: number; h: number; d: Float32Array };
const readRed = (g: CanvasRenderingContext2D, w: number, h: number): Raster => {
  const img = g.getImageData(0, 0, w, h).data;
  const d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = img[i * 4] / 255;
  return { w, h, d };
};
const bilinear = (r: Raster, x: number, y: number) => {
  const fx = Math.max(0, Math.min(r.w - 1.001, x)), fy = Math.max(0, Math.min(r.h - 1.001, y));
  const xi = Math.floor(fx), yi = Math.floor(fy), u = fx - xi, v = fy - yi;
  const i = yi * r.w + xi;
  return r.d[i] * (1 - u) * (1 - v) + r.d[i + 1] * u * (1 - v) + r.d[i + r.w] * (1 - u) * v + r.d[i + r.w + 1] * u * v;
};

const cache = new Map<string, Relief>();

export const buildRelief = (R: Region): Relief => {
  const hit = cache.get(R.key);
  if (hit) return hit;
  const map = R.map ?? NUSANTARA;
  const [x0, y0] = projPx(R.lon0, R.lat1, map);
  const [x1, y1] = projPx(R.lon1, R.lat0, map);
  const W = x1 - x0, H = y1 - y0;
  const cx = x0 + W / 2, cy = y0 + H / 2;
  const S = 4; // raster px per map px
  const rw = Math.ceil(W * S), rh = Math.ceil(H * S);
  const cvs = document.createElement("canvas");
  cvs.width = rw;
  cvs.height = rh;
  const g = cvs.getContext("2d", { willReadFrequently: true })!;
  const drawLand = (ctx: CanvasRenderingContext2D, color: string) => {
    ctx.save();
    ctx.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    ctx.fillStyle = color;
    ctx.fill(new Path2D(map.land));
    if (map.detail) {
      const [dx0, dy0, dx1, dy1] = map.detail.rect;
      ctx.save();
      ctx.beginPath();
      ctx.rect(dx0, dy0, dx1 - dx0, dy1 - dy0);
      ctx.clip();
      ctx.fillStyle = "#000";
      ctx.fillRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
      ctx.fillStyle = color;
      ctx.fill(new Path2D(map.detail.land));
      ctx.restore();
    }
    ctx.restore();
  };
  g.fillStyle = "#000";
  g.fillRect(0, 0, rw, rh);
  drawLand(g, "#fff");
  const mask = readRed(g, rw, rh);
  const blurOf = (px: number) => {
    const c2 = document.createElement("canvas");
    c2.width = rw;
    c2.height = rh;
    const g2 = c2.getContext("2d", { willReadFrequently: true })!;
    g2.fillStyle = "#000";
    g2.fillRect(0, 0, rw, rh);
    g2.filter = `blur(${px * S}px)`;
    g2.drawImage(cvs, 0, 0);
    return readRed(g2, rw, rh);
  };
  const b1 = blurOf(1.2), b2 = blurOf(5), b3 = blurOf(14);

  // land sinks into the sea along the region's border, so a cut coastline never shows as a straight edge: the
  // sinking line wobbles (low-frequency noise), so a cut island ends in a ragged coast, not a ruler line
  const mn = Math.min(W, H);
  const edgeE = (px: number, pz: number) => {
    const wob = (fbm((px / mn) * 7 + 3.1, (pz / mn) * 7 + 7.7, 3) - 0.44) * 0.16 * mn;
    const t = (Math.min(px, W - px, pz, H - pz) - 0.02 * mn + wob) / (0.1 * mn);
    return t >= 1 ? 1 : t <= 0 ? 0 : t * t * (3 - 2 * t);
  };

  // ---- sea texture (deep → shelf glow → thin pale coastline)
  const sea = document.createElement("canvas");
  const SW = 2048, SH = Math.round((2048 * H) / W);
  sea.width = SW;
  sea.height = SH;
  const sg = sea.getContext("2d")!;
  sg.fillStyle = "#183c48";
  sg.fillRect(0, 0, SW, SH);
  const k = SW / W;
  const shelf = (blur: number, col: string, alpha: number) => {
    sg.save();
    sg.globalAlpha = alpha;
    sg.filter = `blur(${blur * k}px)`;
    sg.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    sg.fillStyle = col;
    sg.fill(new Path2D(map.land));
    if (map.detail) sg.fill(new Path2D(map.detail.land));
    sg.restore();
  };
  shelf(10, "#23525f", 0.8);
  shelf(3, "#2f6570", 0.65);
  sg.save();
  sg.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
  sg.strokeStyle = "rgba(196, 220, 212, 0.75)";
  sg.lineWidth = 0.32;
  sg.stroke(new Path2D(map.land));
  sg.restore();
  // the shelf glow and coastline of sunk land fade out with it (else they draw the region's border as a box)
  {
    const fw = 256, fh = Math.max(2, Math.round((256 * H) / W));
    const fc = document.createElement("canvas");
    fc.width = fw;
    fc.height = fh;
    const fg = fc.getContext("2d")!;
    const im = fg.createImageData(fw, fh);
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
      const e = edgeE(((x + 0.5) / fw) * W, ((y + 0.5) / fh) * H);
      const al = Math.min(1, Math.max(0, (0.92 - e) / 0.5));
      const o = (y * fw + x) * 4;
      im.data[o] = 0x18; im.data[o + 1] = 0x3c; im.data[o + 2] = 0x48; im.data[o + 3] = Math.round(al * 255);
    }
    fg.putImageData(im, 0, 0);
    sg.imageSmoothingEnabled = true;
    sg.drawImage(fc, 0, 0, SW, SH);
  }
  // faint graticule every 2°
  sg.save();
  sg.strokeStyle = "rgba(170, 205, 205, 0.07)";
  sg.lineWidth = 1;
  for (let lon = Math.ceil(R.lon0 / 2) * 2; lon <= R.lon1; lon += 2) { const [px] = projPx(lon, 0, map); sg.beginPath(); sg.moveTo((px - x0) * k, 0); sg.lineTo((px - x0) * k, SH); sg.stroke(); }
  for (let lat = Math.ceil(R.lat0 / 2) * 2; lat <= R.lat1; lat += 2) { const [, py] = projPx(0, lat, map); sg.beginPath(); sg.moveTo(0, (py - y0) * k); sg.lineTo(SW, (py - y0) * k); sg.stroke(); }
  sg.restore();
  const seaTex = new CanvasTexture(sea);
  seaTex.colorSpace = SRGBColorSpace;
  seaTex.minFilter = LinearFilter;
  seaTex.anisotropy = 8;

  // ---- heights
  const vex = R.vex ?? 5;
  const yPerKm = (vex / kmPerPx((R.lat0 + R.lat1) / 2, map));
  const vols = (R.volcanoes ?? []).map((v) => {
    const [px, py] = projPx(v.lon, v.lat, map);
    return { x: (px - x0) * S, y: (py - y0) * S, km: v.km, r: (v.r ?? 7) * S * 1.8, skip: v.skip };
  });
  const kmAtRaster = (rx: number, ry: number) => {
    const m = bilinear(mask, rx, ry);
    const c1 = bilinear(b1, rx, ry), c2 = bilinear(b2, rx, ry), c3 = bilinear(b3, rx, ry);
    const land = Math.min(1, Math.max(0, (c1 - 0.3) / 0.4));
    const mx = (rx / S + x0) * 0.06, my = (ry / S + y0) * 0.06;
    let km = 0.02 + 0.12 * c2 + 0.45 * Math.pow(c3, 1.6);
    const inland = Math.min(1, Math.max(0, (c2 - 0.5) / 0.4));
    const hills = Math.min(1, Math.max(0, (fbm(mx * 0.22 + 3.1, my * 0.22 - 1.7, 3) - 0.42) / 0.22));
    km += (0.08 + 0.9 * Math.pow(c2, 1.2)) * ridged(mx * 0.8, my * 0.8, 6) * inland * inland * hills;
    km += 0.06 * (fbm(mx * 5, my * 5, 3) - 0.5) * c1;
    for (const v of vols) {
      if (v.skip) continue;
      const dx = rx - v.x, dy = ry - v.y;
      const u = Math.sqrt(dx * dx + dy * dy) / v.r;
      if (u > 3) continue;
      const ang = Math.atan2(dy, dx);
      const gull = 1 - 0.07 * Math.pow(Math.abs(Math.sin(ang * 9 + fbm(u * 3, ang, 2) * 3)), 3) * Math.min(1, u * 2);
      const prof = Math.exp(-Math.pow(u * 1.7, 1.5));
      km = Math.max(km, v.km * prof * gull + km * 0.4);
    }
    const seaDepth = -0.9 * (1 - c1) - 0.1;
    return land > 0 ? km * land + seaDepth * (1 - land) * (m < 0.5 ? 1 : 0) : seaDepth;
  };

  const cell = R.cell ?? 0.65;
  const nx = Math.ceil(W / cell) + 1, nz = Math.ceil(H / cell) + 1;
  const pos = new Float32Array(nx * nz * 3);
  const col = new Float32Array(nx * nz * 3);
  const kmGrid = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const px = Math.min(W, i * cell), pz = Math.min(H, j * cell);
      const e = edgeE(px, pz);
      const km = kmAtRaster(px * S, pz * S) * e - 0.6 * (1 - e);
      const id = j * nx + i;
      kmGrid[id] = km;
      pos[id * 3] = px - W / 2;
      pos[id * 3 + 1] = km * yPerKm;
      pos[id * 3 + 2] = pz - H / 2;
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const id = j * nx + i;
      const kx = kmGrid[j * nx + Math.min(nx - 1, i + 1)] - kmGrid[j * nx + Math.max(0, i - 1)];
      const kz = kmGrid[Math.min(nz - 1, j + 1) * nx + i] - kmGrid[Math.max(0, j - 1) * nx + i];
      const slope = (Math.sqrt(kx * kx + kz * kz) * yPerKm) / (2 * cell);
      const n = fbm(i * 0.21, j * 0.21, 3);
      const [r, gg, b] = kmGrid[id] <= 0 ? [0.06, 0.15, 0.17] : reliefColor(kmGrid[id], slope, n);
      col[id * 3] = r; col[id * 3 + 1] = gg; col[id * 3 + 2] = b;
    }
  }
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  let p = 0;
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("color", new BufferAttribute(col, 3));
  geo.setIndex(new BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const toWorld = (lon: number, lat: number): [number, number] => {
    const [px, py] = projPx(lon, lat, map);
    return [px - cx, py - cy];
  };
  const heightAt = (lon: number, lat: number) => {
    const [px, py] = projPx(lon, lat, map);
    return Math.max(0, kmAtRaster((px - x0) * S, (py - y0) * S)) * yPerKm;
  };
  const heightAtWorld = (x: number, z: number) => kmAtRaster((x + W / 2) * S, (z + H / 2) * S) * yPerKm;
  const out: Relief = { geo, sea: seaTex, size: [W, H], toWorld, heightAt, heightAtWorld, yPerKm, color: reliefColor };
  cache.set(R.key, out);
  return out;
};
