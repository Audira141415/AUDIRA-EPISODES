// EP02 cover: canvas textures (engraved plaque lettering, Keppres sheet, gallery tag, ribbon).
// Seeded only, drawn after the Cinzel web font has loaded, so every render tab draws the same pixels.
import * as THREE from "three";
import { mulberry32 } from "../../kits/marblemuseum/core/motion";

const cache = new Map<string, THREE.CanvasTexture>();
type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

const canvasTex = (key: string, w: number, h: number, draw: Draw): THREE.Texture => {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

/** Engraved dark-gold text: inset shadow (upper-left lip), gold fill, faint lower-right catch light. */
const engrave = (g: CanvasRenderingContext2D, text: string, x: number, y: number, px: number) => {
  const o = Math.max(1.5, px * 0.045);
  g.fillStyle = "rgba(18,12,6,0.92)";
  g.fillText(text, x - o, y - o);
  g.fillStyle = "rgba(255,236,190,0.35)";
  g.fillText(text, x + o * 0.6, y + o * 0.6);
  const grad = g.createLinearGradient(0, y - px, 0, y + px * 0.2);
  grad.addColorStop(0, "#5A3F14");
  grad.addColorStop(0.55, "#8C6422");
  grad.addColorStop(1, "#6B4A18");
  g.fillStyle = grad;
  g.fillText(text, x, y);
};

/** Fit words into at most `maxLines` lines at the largest size <= px that fits width. */
const fitLines = (g: CanvasRenderingContext2D, text: string, font: (px: number) => string, px: number, maxW: number, maxLines: number) => {
  const words = text.split(" ");
  for (let size = px; size > 10; size -= 2) {
    g.font = font(size);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (g.measureText(test).width <= maxW) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    if (lines.length <= maxLines && lines.every((l) => g.measureText(l).width <= maxW)) return { lines, size };
  }
  return { lines: [text], size: 12 };
};

const rule = (g: CanvasRenderingContext2D, w: number, y: number, half: number) => {
  g.fillStyle = "rgba(18,12,6,0.85)";
  g.fillRect(w / 2 - half - 1, y - 1, half * 2, 3);
  g.fillStyle = "#7A5820";
  g.fillRect(w / 2 - half, y, half * 2, 2);
  // small lozenge in the middle
  g.save();
  g.translate(w / 2, y + 1);
  g.rotate(Math.PI / 4);
  g.fillStyle = "#7A5820";
  g.fillRect(-6, -6, 12, 12);
  g.restore();
};

/** Row plaque lettering (transparent; sits on the marble face). Aspect 0.9 : 1.25. */
export const plaqueText = (font: string, name: string, province: string, line: string) =>
  canvasTex(`p-${name}`, 720, 1000, (g, w) => {
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = `700 34px ${font}`;
    engrave(g, "PAHLAWAN NASIONAL", w / 2, 150, 34);
    rule(g, w, 190, 170);
    const fit = fitLines(g, name, (px) => `700 ${px}px ${font}`, 92, w - 110, 3);
    g.font = `700 ${fit.size}px ${font}`;
    const lh = fit.size * 1.12;
    const top = 470 - ((fit.lines.length - 1) * lh) / 2;
    fit.lines.forEach((l, i) => engrave(g, l, w / 2, top + i * lh, fit.size));
    rule(g, w, 690, 120);
    g.font = `700 42px ${font}`;
    engrave(g, province, w / 2, 780, 42);
    const fl = fitLines(g, line, (px) => `400 ${px}px ${font}`, 32, w - 130, 2);
    g.font = `400 ${fl.size}px ${font}`;
    fl.lines.forEach((l, i) => engrave(g, l, w / 2, 860 + i * fl.size * 1.2, fl.size));
  });

/** Hero plaque (Hoegeng). Aspect 1.25 : 0.82. */
export const heroText = (font: string) =>
  canvasTex("hero", 1250, 820, (g, w) => {
    g.textAlign = "center";
    g.font = `700 40px ${font}`;
    engrave(g, "PAHLAWAN NASIONAL · 2026", w / 2, 112, 40);
    rule(g, w, 150, 260);
    g.font = `700 70px ${font}`;
    engrave(g, "JENDERAL POL.", w / 2, 280, 70);
    const fit = fitLines(g, "HOEGENG IMAN SANTOSO", (px) => `900 ${px}px ${font}`, 104, w - 110, 1);
    g.font = `900 ${fit.size}px ${font}`;
    engrave(g, fit.lines[0], w / 2, 410, fit.size);
    rule(g, w, 470, 200);
    g.font = `700 74px ${font}`;
    engrave(g, "KAPOLRI 1968–1971", w / 2, 600, 74);
    g.font = `400 38px ${font}`;
    engrave(g, "DKI JAKARTA · KEPPRES 93/TK/2026", w / 2, 700, 38);
  });

/** Keppres sheet: header + seeded grey body lines (no seal, no signature). Aspect 0.5 : 0.68. */
export const keppresTexture = (font: string) =>
  canvasTex("keppres", 600, 816, (g, w, h) => {
    const r = mulberry32(2026);
    g.fillStyle = "#EDE6D4";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) {
      const x = r() * w, y = r() * h, rad = 30 + r() * 120;
      const rg = g.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, `rgba(150,120,70,${0.03 + r() * 0.04})`);
      rg.addColorStop(1, "rgba(150,120,70,0)");
      g.fillStyle = rg;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.strokeStyle = "rgba(90,60,20,0.5)";
    g.lineWidth = 3;
    g.strokeRect(22, 22, w - 44, h - 44);
    g.textAlign = "center";
    g.fillStyle = "#1E1A15";
    g.font = `700 30px ${font}`;
    g.fillText("KEPUTUSAN PRESIDEN", w / 2, 108);
    g.fillText("REPUBLIK INDONESIA", w / 2, 146);
    g.fillStyle = "#8E1B17";
    g.font = `900 54px ${font}`;
    g.fillText("KEPPRES", w / 2, 236);
    g.font = `900 48px ${font}`;
    g.fillText("93/TK/2026", w / 2, 296);
    g.fillStyle = "#1E1A15";
    g.font = `700 26px ${font}`;
    g.fillText("GELAR PAHLAWAN NASIONAL", w / 2, 352);
    g.fillRect(w / 2 - 120, 372, 240, 2);
    for (let y = 410; y < 700; y += 24) {
      const len = 0.55 + r() * 0.38;
      g.fillStyle = `rgba(40,34,28,${0.25 + r() * 0.15})`;
      g.fillRect(60, y, (w - 120) * len, 7);
    }
    g.font = `700 24px ${font}`;
    g.fillStyle = "#1E1A15";
    g.fillText("10 NOVEMBER 2026", w / 2, 750);
  });

/** Small brass gallery tag (AUDIRA brand inside the scene). Aspect 0.62 : 0.12. */
export const galleryTag = (font: string) =>
  canvasTex("tag", 1240, 240, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#B88D3E");
    grad.addColorStop(0.5, "#8A6526");
    grad.addColorStop(1, "#6D4E1C");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(40,26,8,0.8)";
    g.lineWidth = 8;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.textAlign = "center";
    g.fillStyle = "#24170A";
    g.font = `900 92px ${font}`;
    g.fillText("GALERI AUDIRA", w / 2, 132);
    g.font = `700 40px ${font}`;
    g.fillText("RUANG PAHLAWAN NASIONAL", w / 2, 196);
  });

/** Red-and-white grosgrain ribbon (Merah Putih), vertical. */
export const ribbonTexture = () =>
  canvasTex("ribbon", 128, 256, (g, w, h) => {
    g.fillStyle = "#B3161B";
    g.fillRect(0, 0, w / 2, h);
    g.fillStyle = "#F2EEE6";
    g.fillRect(w / 2, 0, w / 2, h);
    for (let y = 0; y < h; y += 3) {
      g.fillStyle = "rgba(0,0,0,0.08)";
      g.fillRect(0, y, w, 1);
    }
  });
