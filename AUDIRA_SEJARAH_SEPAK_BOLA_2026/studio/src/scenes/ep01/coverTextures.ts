// EP01 cover: canvas textures (war-room world map, nation tags, brass plaque, table wood).
// Seeded only (prng). Fonts (Anton, Space Grotesk) are loaded by Cover.tsx before any texture is drawn.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { LAND, CHAMP } from "./worldData.ts";
import { MAP_LAT, MAP_LON, MAP_W, MAP_D, uv } from "./geo.ts";

export const GOLD = "#E8B54A";
export const GREEN = "#2BD46A";
export const OCEAN = "#0F1620";
export const DISPLAY = "Anton";
export const LABEL = "Space Grotesk";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

const ring = (ctx: CanvasRenderingContext2D, r: [number, number][], w: number, h: number) => {
  r.forEach(([lon, lat], i) => {
    const [u, v] = uv(lon, lat);
    if (i) ctx.lineTo(u * w, v * h);
    else ctx.moveTo(u * w, v * h);
  });
  ctx.closePath();
};

// ---------- the world map sheet ----------
const TEX_W = 4096;
const TEX_H = Math.round((TEX_W * MAP_D) / MAP_W);
export const mapTexture = () =>
  canvasTex("ep01-map", TEX_W, TEX_H, (ctx, w, h) => {
    const r = prng(7);
    // ocean: deep slate with a soft warm pool where the lamp falls (Atlantic)
    ctx.fillStyle = OCEAN;
    ctx.fillRect(0, 0, w, h);
    const [pu, pv] = uv(-28, 18);
    const pool = ctx.createRadialGradient(pu * w, pv * h, 0, pu * w, pv * h, w * 0.42);
    pool.addColorStop(0, "rgba(60,74,92,0.55)");
    pool.addColorStop(1, "rgba(60,74,92,0)");
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, w, h);
    // paper mottling
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = r() * h, rad = 80 + r() * 380;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const a = 0.02 + r() * 0.04;
      g.addColorStop(0, r() > 0.5 ? `rgba(120,140,160,${a})` : `rgba(0,0,0,${a * 1.4})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // graticule every 15°
    ctx.strokeStyle = "rgba(150,170,190,0.16)";
    ctx.lineWidth = 2;
    for (let lon = -120; lon <= 75; lon += 15) {
      const [u] = uv(lon, 0);
      ctx.beginPath();
      ctx.moveTo(u * w, 0);
      ctx.lineTo(u * w, h);
      ctx.stroke();
    }
    for (let lat = -60; lat <= 75; lat += 15) {
      const [, v] = uv(0, lat);
      ctx.beginPath();
      ctx.moveTo(0, v * h);
      ctx.lineTo(w, v * h);
      ctx.stroke();
    }
    // equator, dashed gold
    ctx.setLineDash([26, 18]);
    ctx.strokeStyle = "rgba(232,181,74,0.32)";
    ctx.lineWidth = 3;
    const [, ve] = uv(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, ve * h);
    ctx.lineTo(w, ve * h);
    ctx.stroke();
    ctx.setLineDash([]);

    // warm under-glow around the champion nations (the slabs sit on top of it)
    ctx.save();
    ctx.shadowColor = "rgba(255,190,80,0.85)";
    ctx.shadowBlur = 70;
    ctx.fillStyle = "rgba(255,190,80,0.6)";
    for (const rings of Object.values(CHAMP)) for (const rr of rings) {
      ctx.beginPath();
      ring(ctx, rr, w, h);
      ctx.fill();
    }
    ctx.restore();

    // land: dim slate fill, darker inner borders, pale coastline
    ctx.fillStyle = "#28313C";
    for (const rr of LAND) {
      ctx.beginPath();
      ring(ctx, rr, w, h);
      ctx.fill();
    }
    // subtle relief speckle on land (clipped)
    ctx.save();
    ctx.beginPath();
    for (const rr of LAND) ring(ctx, rr, w, h);
    ctx.clip();
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = r() > 0.5 ? `rgba(90,104,120,${0.05 + r() * 0.08})` : `rgba(10,14,20,${0.06 + r() * 0.1})`;
      ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 3);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(14,19,26,0.9)";
    ctx.lineWidth = 2;
    for (const rr of LAND) {
      ctx.beginPath();
      ring(ctx, rr, w, h);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(140,158,178,0.35)";
    ctx.lineWidth = 1.4;
    for (const rr of LAND) {
      ctx.beginPath();
      ring(ctx, rr, w, h);
      ctx.stroke();
    }

    // ocean / continent labels (spaced caps)
    const label = (text: string, lon: number, lat: number, size: number, color: string, spacing = 0.35, font = LABEL, weight = 600) => {
      const [u, v] = uv(lon, lat);
      ctx.save();
      ctx.font = `${weight} ${size}px "${font}"`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${size * spacing}px`;
      ctx.fillText(text, u * w, v * h);
      ctx.restore();
    };
    label("SAMUDRA ATLANTIK", -36, 30, 46, "rgba(150,170,190,0.42)", 0.5);
    label("SAMUDRA PASIFIK", -108, -12, 46, "rgba(150,170,190,0.35)", 0.5);
    label("EROPA", 22, 66, 64, "rgba(232,181,74,0.55)", 0.45);
    label("AMERIKA SELATAN", -58, -52, 56, "rgba(232,181,74,0.55)", 0.4);
    // graticule numbers along the bottom and left edge
    for (let lon = -120; lon <= 75; lon += 30) {
      const [u] = uv(lon, 0);
      ctx.font = `500 30px "${LABEL}"`;
      ctx.fillStyle = "rgba(150,170,190,0.4)";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.abs(lon)}°${lon < 0 ? "B" : lon > 0 ? "T" : ""}`, u * w, h - 26);
    }
    // sheet border: double gold rule
    ctx.strokeStyle = "rgba(232,181,74,0.75)";
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, w - 80, h - 80);
    void MAP_LAT;
    void MAP_LON;
  });

// ---------- nation tag: dark card, green series stripe, name + gold title count ----------
export const tagTexture = (name: string, titles: number) =>
  canvasTex(`ep01-tag-${name}`, 640, 200, (ctx, w, h) => {
    ctx.fillStyle = "#0E141B";
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = GREEN;
    ctx.fillRect(10, 10, 22, h - 20);
    ctx.fillStyle = "#F3EEE2";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    let size = 92;
    ctx.font = `700 ${size}px "${LABEL}"`;
    while (ctx.measureText(name).width > 360 && size > 40) ctx.font = `700 ${(size -= 4)}px "${LABEL}"`;
    ctx.fillText(name, 56, h / 2 + 4);
    ctx.fillStyle = GOLD;
    ctx.textAlign = "right";
    ctx.font = `400 150px "${DISPLAY}"`;
    ctx.fillText(String(titles), w - 108, h / 2 + 8);
    star2d(ctx, w - 56, h / 2, 36, GOLD);
  });

const star2d = (ctx: CanvasRenderingContext2D, x: number, y: number, R: number, c: string) => {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? R * 0.45 : R;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
};

// ---------- brass plaque on the table rim ----------
export const plaqueTexture = () =>
  canvasTex("ep01-plaque", 1024, 200, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#C9A055");
    g.addColorStop(0.5, "#E6C47A");
    g.addColorStop(1, "#A9813C");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(60,40,10,0.7)";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = "rgba(48,30,6,0.92)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 74px "${LABEL}"`;
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "14px";
    ctx.fillText("AUDIRA", w / 2, h / 2 - 22);
    ctx.font = `600 34px "${LABEL}"`;
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
    ctx.fillText("RUANG PETA · PIALA DUNIA", w / 2, h / 2 + 44);
  });

// ---------- dark walnut table ----------
export const woodTexture = () =>
  canvasTex("ep01-wood", 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#1B130E";
    ctx.fillRect(0, 0, w, h);
    const r = prng(31);
    for (let i = 0; i < 380; i++) {
      const y = r() * h;
      const amp = 3 + r() * 14;
      const ph = r() * 10;
      ctx.strokeStyle = r() > 0.5 ? `rgba(84,56,34,${0.15 + r() * 0.3})` : `rgba(6,4,3,${0.2 + r() * 0.35})`;
      ctx.lineWidth = 0.6 + r() * 2.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x / 140 + ph) * amp);
      ctx.stroke();
    }
  });
