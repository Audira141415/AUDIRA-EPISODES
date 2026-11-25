// EP02 film: extra canvas textures (hook exhibits, ladder risers, guest book). Seeded only.
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

/** Speed bump: yellow/black chevrons with rubber grit. */
export const bumpTexture = () =>
  canvasTex("bump", 512, 128, (g, w, h) => {
    const r = mulberry32(77);
    g.fillStyle = "#1C1A17";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#E3B21F";
    for (let x = -h; x < w + h; x += 96) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 48, 0);
      g.lineTo(x + 48 + h * 0.5, h);
      g.lineTo(x + h * 0.5, h);
      g.fill();
    }
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.15})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
  });

/** Small cream museum label (exhibit tag). */
export const exhibitLabel = (font: string, no: string, title: string) =>
  canvasTex(`ex-${title}`, 640, 220, (g, w, h) => {
    g.fillStyle = "#F3EDE1";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(60,40,20,0.35)";
    g.lineWidth = 4;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#8C1D18";
    g.font = `900 64px ${font}`;
    g.textAlign = "left";
    g.fillText(no, 40, 132);
    g.fillStyle = "#1D1A17";
    g.font = `700 54px ${font}`;
    g.fillText(title, 130, 132);
  });

/** Engraved riser label for the nomination ladder (transparent). */
export const stepLabel = (font: string, n: number, text: string) =>
  canvasTex(`step-${n}`, 1024, 160, (g, w) => {
    g.textAlign = "center";
    const fit = (px: number) => {
      g.font = `700 ${px}px ${font}`;
      return g.measureText(`${n} · ${text}`).width;
    };
    let px = 92;
    while (fit(px) > w - 60 && px > 30) px -= 2;
    g.font = `700 ${px}px ${font}`;
    engrave(g, `${n} · ${text}`, w / 2, 112, px);
  });

/** Open guest book: "BUKU MUTASI" ledger. Columns: tamu | jam datang | jam pulang. */
export const BOOK_COLS = { name: [0.08, 0.47], in: [0.47, 0.71], out: [0.71, 0.94] } as const;
export const guestBookPage = (font: string, side: "L" | "R") =>
  canvasTex(`book-${side}`, 700, 900, (g, w, h) => {
    const r = mulberry32(side === "L" ? 1968 : 1971);
    g.fillStyle = "#EFE6CF";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) {
      const x = r() * w, y = r() * h, rad = 40 + r() * 160;
      const rg = g.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, `rgba(150,110,60,${0.04 + r() * 0.05})`);
      rg.addColorStop(1, "rgba(150,110,60,0)");
      g.fillStyle = rg;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // gutter shade
    const gx = side === "L" ? w : 0;
    const gs = g.createLinearGradient(gx, 0, side === "L" ? w - 90 : 90, 0);
    gs.addColorStop(0, "rgba(60,40,20,0.35)");
    gs.addColorStop(1, "rgba(60,40,20,0)");
    g.fillStyle = gs;
    g.fillRect(0, 0, w, h);
    g.textAlign = "center";
    g.fillStyle = "#2A2118";
    g.font = `900 70px ${font}`;
    g.fillText("BUKU MUTASI", w / 2, 110);
    g.fillRect(w * 0.2, 132, w * 0.6, 3);
    const top = 210;
    g.font = `700 30px ${font}`;
    const cx = (a: number, b: number) => ((a + b) / 2) * w;
    g.fillText("TAMU", cx(BOOK_COLS.name[0], BOOK_COLS.name[1]), top - 20);
    g.fillText("DATANG", cx(BOOK_COLS.in[0], BOOK_COLS.in[1]), top - 20);
    g.fillText("PULANG", cx(BOOK_COLS.out[0], BOOK_COLS.out[1]), top - 20);
    g.strokeStyle = "rgba(42,33,24,0.55)";
    g.lineWidth = 2;
    for (const x of [BOOK_COLS.in[0], BOOK_COLS.out[0]]) {
      g.beginPath();
      g.moveTo(x * w, top - 60);
      g.lineTo(x * w, h - 50);
      g.stroke();
    }
    for (let row = 0; row < 11; row++) {
      const y = top + row * 60;
      g.strokeStyle = "rgba(42,33,24,0.3)";
      g.beginPath();
      g.moveTo(40, y + 14);
      g.lineTo(w - 40, y + 14);
      g.stroke();
      if (row > 8) continue;
      // handwritten scribble for a name (unreadable on purpose)
      g.strokeStyle = "rgba(28,40,92,0.85)";
      g.lineWidth = 3;
      g.beginPath();
      let x = BOOK_COLS.name[0] * w + 6;
      const end = x + (0.22 + r() * 0.14) * w;
      g.moveTo(x, y);
      while (x < end) {
        const nx = x + 8 + r() * 10;
        g.quadraticCurveTo(x + 4, y - 12 - r() * 10, nx, y - r() * 4);
        x = nx;
      }
      g.stroke();
      const hIn = 8 + Math.floor(r() * 4);
      const mIn = Math.floor(r() * 6) * 10;
      const hOut = hIn + 1 + Math.floor(r() * 2);
      g.fillStyle = "rgba(28,40,92,0.9)";
      g.font = `italic 600 34px Georgia, serif`;
      g.fillText(`${String(hIn).padStart(2, "0")}.${String(mIn).padStart(2, "0")}`, cx(BOOK_COLS.in[0], BOOK_COLS.in[1]), y);
      g.fillText(`${String(hOut).padStart(2, "0")}.${String((mIn + 20) % 60).padStart(2, "0")}`, cx(BOOK_COLS.out[0], BOOK_COLS.out[1]), y);
    }
  });
