// EP01 film-only textures (SKETCHFORGE): clock face, equivalence letter, DIBATALKAN stamp,
// MK sheet, DPR folder label, Hatta 1956 letter. Seeded, system fonts, cached.
import { prng } from "../../core/materials/textures.ts";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";
import { canvasTex, sline, tooth } from "./coverTextures.ts";

const HAND = "'Segoe Print', 'Comic Sans MS', cursive";
const SANS = "'Arial Black', 'Segoe UI', Arial, sans-serif";
const MONO = "'Courier New', monospace";
const G = (a: number) => `rgba(47,48,52,${a})`;

const bars = (ctx: CanvasRenderingContext2D, seed: number, x: number, y0: number, w: number, n: number, gap = 38, a = 0.24) => {
  const r = prng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = G(a + r() * 0.08);
    ctx.fillRect(x, y0 + i * gap, w * (0.55 + r() * 0.45), 9);
  }
};

const border = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
  const r = prng(seed);
  sline(ctx, r, 10, 10, w - 10, 10, 0.8, 3);
  sline(ctx, r, w - 10, 10, w - 10, h - 10, 0.8, 3);
  sline(ctx, r, w - 10, h - 10, 10, h - 10, 0.8, 3);
  sline(ctx, r, 10, h - 10, 10, 10, 0.8, 3);
};

export const clockFaceTexture = () =>
  canvasTex("clock", 512, 512, (ctx, w, h) => {
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 12, 0.8);
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = G(0.85);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 236, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const big = i % 5 === 0;
      const r1 = big ? 196 : 214, r2 = 228;
      ctx.strokeStyle = G(big ? 0.85 : 0.4);
      ctx.lineWidth = big ? 6 : 2;
      ctx.beginPath();
      ctx.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1);
      ctx.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2);
      ctx.stroke();
    }
  });

export const letterTexture = () =>
  canvasTex("letter", 760, 1000, (ctx, w, h) => {
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 31, 0.8);
    ctx.fillStyle = G(0.9);
    ctx.textAlign = "center";
    ctx.font = `900 40px ${SANS}`;
    ctx.fillText("SURAT KETERANGAN", w / 2, 110);
    ctx.fillText("PENYETARAAN", w / 2, 160);
    ctx.font = `700 34px ${MONO}`;
    ctx.fillText("ijazah setara SMA", w / 2, 214);
    ctx.fillRect(80, 240, w - 160, 4);
    ctx.textAlign = "left";
    bars(ctx, 77, 80, 300, w - 160, 11);
    ctx.font = `italic 34px ${HAND}`;
    ctx.fillStyle = G(0.55);
    ctx.fillText("untuk Pilpres 2024", 90, 790);
    border(ctx, w, h, 8);
  });

/** Transparent rubber stamp "DIBATALKAN". */
export const batalStampTexture = () =>
  canvasTex(
    "batal",
    800,
    300,
    (ctx, w, h) => {
      ctx.strokeStyle = P.accentDeep;
      ctx.fillStyle = P.accentDeep;
      ctx.lineWidth = 12;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, w - 72, h - 72);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 112px ${SANS}`;
      ctx.fillText("DIBATALKAN", w / 2, h / 2 + 6);
      ctx.globalCompositeOperation = "destination-out";
      const e = prng(19);
      for (let i = 0; i < 2200; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.25 + e() * 0.6})`;
        const s = 1 + e() * 4;
        ctx.fillRect(e() * w, e() * h, s, s);
      }
    },
    null,
  );

export const mkTexture = () =>
  canvasTex("mk", 760, 1000, (ctx, w, h) => {
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 55, 0.8);
    ctx.fillStyle = G(0.92);
    ctx.textAlign = "center";
    ctx.font = `900 40px ${SANS}`;
    ctx.fillText("MAHKAMAH", w / 2, 96);
    ctx.fillText("KONSTITUSI", w / 2, 146);
    ctx.fillRect(80, 172, w - 160, 4);
    ctx.font = `900 44px ${SANS}`;
    ctx.fillText("P U T U S A N", w / 2, 246);
    ctx.font = `700 28px ${MONO}`;
    ctx.fillText("01/PHPU.PRES-XXIV/2026", w / 2, 294);
    ctx.textAlign = "left";
    bars(ctx, 91, 80, 350, w - 160, 14);
    border(ctx, w, h, 9);
  });

export const dprLabelTexture = () =>
  canvasTex("dpr", 600, 300, (ctx, w, h) => {
    ctx.fillStyle = P.paperWhite;
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 66, 0.6);
    ctx.fillStyle = P.accent;
    ctx.fillRect(0, 0, w, 54);
    ctx.fillStyle = "#FBF7EF";
    ctx.font = `900 40px ${SANS}`;
    ctx.fillText("DPR", 24, 42);
    ctx.fillStyle = G(0.95);
    ctx.font = `900 46px ${SANS}`;
    ctx.fillText("USUL HAK", 24, 128);
    ctx.fillText("MENYATAKAN", 24, 182);
    ctx.fillText("PENDAPAT", 24, 236);
    border(ctx, w, h, 3);
  });

/** Hatta 1956 letter: aged paper, illegible lines, big pencilled year. */
export const hattaLetterTexture = () =>
  canvasTex("hatta", 760, 1000, (ctx, w, h) => {
    ctx.fillStyle = "#E9DCC0";
    ctx.fillRect(0, 0, w, h);
    tooth(ctx, w, h, 1956, 1.4);
    const r = prng(56);
    for (let i = 0; i < 8; i++) {
      const x = r() * w, y = r() * h, rad = 80 + r() * 160;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(140,100,50,0.12)");
      g.addColorStop(1, "rgba(140,100,50,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // handwritten-looking lines (illegible)
    ctx.strokeStyle = "rgba(60,48,34,0.55)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 13; i++) {
      const y = 300 + i * 44;
      ctx.beginPath();
      let x = 80;
      ctx.moveTo(x, y);
      const end = 80 + (w - 160) * (0.6 + r() * 0.4);
      while (x < end) {
        x += 10 + r() * 14;
        ctx.lineTo(x, y + (r() - 0.5) * 10);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(40,32,24,0.85)";
    ctx.font = `italic 120px ${HAND}`;
    ctx.textAlign = "center";
    ctx.fillText("1956", w / 2, 210);
    border(ctx, w, h, 11);
  });
