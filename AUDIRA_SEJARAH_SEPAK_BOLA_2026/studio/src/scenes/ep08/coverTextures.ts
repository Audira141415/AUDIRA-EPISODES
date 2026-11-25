// EP08 cover textures (FILMNOIR, Maracanazo 1950): canvas-drawn, seeded only (prng), system fonts only,
// so every render tab draws the same pixels. Everything is greyscale (black-and-white film).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

export const PAL = {
  bg: "#060709",
  pitch: "#2BD46A",
  paper: "#EDE9E1",
  ink: "#0B0C0E",
};

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
const cache = new Map<string, THREE.CanvasTexture>();

export function canvasTex(key: string, w: number, h: number, draw: Draw, srgb = true, wrap = false): THREE.Texture {
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
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Silent crowd on concrete terraces: rows of heads and shoulders, seeded. Tiles horizontally. */
export const crowdTexture = (seed = 3) =>
  canvasTex(
    `crowd-${seed}`,
    1024,
    512,
    (ctx, w, h) => {
      const r = prng(seed);
      ctx.fillStyle = "#16171a";
      ctx.fillRect(0, 0, w, h);
      const rows = 16;
      const rh = h / rows;
      for (let i = 0; i < rows; i++) {
        const y0 = i * rh;
        // terrace step edge
        ctx.fillStyle = "#26282c";
        ctx.fillRect(0, y0 + rh - 3, w, 3);
        let x = r() * 8;
        while (x < w + 10) {
          const s = 9 + r() * 5;
          const g = 70 + Math.floor(r() * 120);
          const shirt = r() < 0.55 ? 200 + Math.floor(r() * 40) : 60 + Math.floor(r() * 70); // 1950: white shirts, hats
          ctx.fillStyle = `rgb(${shirt},${shirt},${shirt - 4})`;
          ctx.beginPath();
          ctx.ellipse(x, y0 + rh * 0.86, s * 1.05, rh * 0.38, 0, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = `rgb(${g},${g - 3},${g - 8})`;
          ctx.beginPath();
          ctx.arc(x, y0 + rh * 0.42, s * 0.55, 0, Math.PI * 2);
          ctx.fill();
          if (r() < 0.35) {
            // brimmed hat
            ctx.fillStyle = "#1c1d20";
            ctx.fillRect(x - s * 0.8, y0 + rh * 0.3, s * 1.6, 3);
            ctx.fillRect(x - s * 0.5, y0 + rh * 0.12, s, rh * 0.2);
          }
          x += s * 1.9 + r() * 4;
        }
      }
    },
    true,
    true,
  );

/** Goal net: thin light strings on transparent, square mesh. */
export const netTexture = () =>
  canvasTex(
    "net",
    512,
    512,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(235,233,228,1)";
      ctx.lineWidth = 3;
      const n = 8;
      for (let i = 0; i <= n; i++) {
        const p = (i / n) * w;
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
      }
      // knots
      ctx.fillStyle = "rgba(240,238,232,1)";
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) ctx.fillRect((i / n) * w - 3, (j / n) * h - 3, 6, 6);
    },
    true,
    true,
  );

/** Mown grass in greyscale: stripes + seeded speckle + chalk line handled by geometry. */
export const grassTexture = () =>
  canvasTex(
    "grass",
    1024,
    1024,
    (ctx, w, h) => {
      const r = prng(41);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#3a3b38" : "#46473f";
        ctx.fillRect(0, (i * h) / 8, w, h / 8);
      }
      for (let k = 0; k < 26000; k++) {
        const v = 30 + Math.floor(r() * 70);
        ctx.fillStyle = `rgba(${v},${v},${v - 4},0.55)`;
        ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 2 + r() * 5);
      }
      // worn goalmouth patches
      for (let k = 0; k < 30; k++) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
        g.addColorStop(0, "rgba(90,84,74,0.35)");
        g.addColorStop(1, "rgba(90,84,74,0)");
        ctx.save();
        ctx.translate(r() * w, r() * h);
        ctx.fillStyle = g;
        ctx.fillRect(-80, -80, 160, 160);
        ctx.restore();
      }
    },
    true,
    true,
  );

/** 1950 leather ball (greyscale): long panels with stitched seams and a laced slit. Equirect map. */
export const ballTexture = () =>
  canvasTex("ball1950", 1024, 512, (ctx, w, h) => {
    const r = prng(77);
    ctx.fillStyle = "#8d857a";
    ctx.fillRect(0, 0, w, h);
    // leather mottling
    for (let k = 0; k < 9000; k++) {
      const v = 100 + Math.floor(r() * 60);
      ctx.fillStyle = `rgba(${v},${v - 6},${v - 14},0.18)`;
      ctx.beginPath();
      ctx.arc(r() * w, r() * h, 2 + r() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    // panel seams: 6 longitudes, panels split across the equator alternately (T-panel ball)
    ctx.strokeStyle = "#2a2622";
    ctx.lineWidth = 6;
    for (let i = 0; i < 6; i++) {
      const x = (i / 6) * w;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.12);
      ctx.lineTo(x, h * 0.88);
      ctx.stroke();
      const y = i % 2 ? h * 0.36 : h * 0.64;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w / 6, y);
      ctx.stroke();
    }
    // stitch dashes along seams
    ctx.strokeStyle = "#cfc6b8";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const x = (i / 6) * w;
      for (let y = h * 0.14; y < h * 0.86; y += 14) {
        ctx.beginPath();
        ctx.moveTo(x - 7, y);
        ctx.lineTo(x + 7, y + 5);
        ctx.stroke();
      }
    }
    // laced slit
    ctx.fillStyle = "#231f1b";
    ctx.fillRect(w * 0.55, h * 0.44, w * 0.07, 10);
    ctx.strokeStyle = "#e4dccd";
    ctx.lineWidth = 4;
    for (let k = 0; k < 7; k++) {
      const x = w * 0.555 + k * 9;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.42);
      ctx.lineTo(x + 6, h * 0.48);
      ctx.stroke();
    }
    // poles darker (scuffed)
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(30,26,22,0.6)");
    g.addColorStop(0.15, "rgba(30,26,22,0)");
    g.addColorStop(0.85, "rgba(30,26,22,0)");
    g.addColorStop(1, "rgba(30,26,22,0.6)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/** Mechanical stadium scoreboard: white painted letters on black slats. */
export const scoreboardTexture = () =>
  canvasTex("scoreboard", 1600, 800, (ctx, w, h) => {
    ctx.fillStyle = "#0d0e10";
    ctx.fillRect(0, 0, w, h);
    // slats
    for (let y = 0; y < h; y += 40) {
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fillRect(0, y, w, 2);
    }
    // frame
    ctx.strokeStyle = "#d9d5cc";
    ctx.lineWidth = 14;
    ctx.strokeRect(22, 22, w - 44, h - 44);
    ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, w - 92, h - 92);
    ctx.fillStyle = "#EFEBE2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // teams + score (score in boxed tiles)
    ctx.font = "140px Impact, 'Arial Black', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("BRASIL", w * 0.385, 300);
    ctx.textAlign = "left";
    ctx.fillText("URUGUAY", w * 0.615, 300);
    const tile = (x: number, s: string) => {
      ctx.fillStyle = "#EFEBE2";
      ctx.fillRect(x - 64, 206, 128, 184);
      ctx.fillStyle = "#0d0e10";
      ctx.textAlign = "center";
      ctx.font = "160px Impact, 'Arial Black', sans-serif";
      ctx.fillText(s, x, 300);
    };
    tile(w * 0.448, "1");
    tile(w * 0.552, "2");
    ctx.fillStyle = "#EFEBE2";
    ctx.fillRect(w / 2 - 14, 290, 28, 14);
    ctx.textAlign = "center";
    ctx.font = "150px Impact, 'Arial Black', sans-serif";
    ctx.fillText("16·07·1950", w / 2, 560);
  });

/** Small enamel maker plate under the scoreboard. */
export const plateTexture = () =>
  canvasTex("plate", 512, 128, (ctx, w, h) => {
    ctx.fillStyle = "#cfcac0";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#1a1b1e";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "#1a1b1e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 68px 'Courier New', monospace";
    ctx.fillText("AUDIRA", w / 2, h / 2 + 2);
  });

/** Soft radial glow. */
export const glowTexture = () =>
  canvasTex("glow", 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,250,240,1)");
    g.addColorStop(0.35, "rgba(255,246,230,0.5)");
    g.addColorStop(1, "rgba(255,240,220,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/** Drifting haze: seeded soft blobs, white on transparent. */
export const hazeTexture = (seed = 9) =>
  canvasTex(`haze-${seed}`, 512, 512, (ctx, w, h) => {
    const r = prng(seed);
    ctx.clearRect(0, 0, w, h);
    for (let k = 0; k < 70; k++) {
      const x = w * (0.1 + r() * 0.8);
      const y = h * (0.2 + r() * 0.6);
      const rad = 40 + r() * 120;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(255,255,255,0.10)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // fade edges
    ctx.globalCompositeOperation = "destination-in";
    const e = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.5);
    e.addColorStop(0, "rgba(0,0,0,1)");
    e.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = e;
    ctx.fillRect(0, 0, w, h);
  });

/** Light shaft: bright core fading along length and across width. Map on a plane (v = along the beam). */
export const shaftTexture = () =>
  canvasTex("shaft", 256, 512, (ctx, w, h) => {
    const r = prng(5);
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const along = 1 - y / h; // 1 at the source
      for (let x = 0; x < w; x++) {
        const u = (x / w) * 2 - 1;
        const across = Math.max(0, 1 - u * u) ** 2;
        const a = across * (0.25 + 0.75 * along) * 255;
        const p = (y * w + x) * 4;
        img.data[p] = img.data[p + 1] = img.data[p + 2] = 255;
        img.data[p + 3] = a;
      }
    }
    // dust streaks
    ctx.putImageData(img, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 22; k++) {
      ctx.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.25})`;
      ctx.fillRect(r() * w, 0, 2 + r() * 10, h);
    }
  });
