// EP09 film (TOYDIORAMA): canvas textures for the props that only the film uses.
// Same rules as coverTextures.ts: seeded only, fonts passed in after they have loaded.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { canvasTex, type Fonts } from "./coverTextures.ts";

function fibre(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, dark = 0.07) {
  const r = prng(seed);
  for (let i = 0; i < 24; i++) {
    const x = r() * w, y = r() * h, rad = 30 + r() * 110;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(90,60,30,${dark * (0.4 + r())})`);
    g.addColorStop(1, "rgba(90,60,30,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 380; i++) {
    ctx.strokeStyle = `rgba(70,45,20,${0.05 + r() * 0.08})`;
    ctx.lineWidth = 1;
    const x = r() * w, y = r() * h, a = r() * Math.PI, l = 4 + r() * 14;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

/** Kraft tag with a mono reference line and 1–2 big display lines. Height grows with the lines. */
export const TAG_W = 720;
export const tagHeight = (lines: number, ref = true) => (ref ? 150 : 50) + lines * 118;
export function tagLinesTexture(key: string, ref: string, lines: string[], fonts: Fonts, seed: number, paper = "#d8b57e"): THREE.Texture {
  const h = tagHeight(lines.length, ref !== "");
  const top = ref ? 0 : -100;
  return canvasTex(`ftag-${key}`, TAG_W, h, (ctx, w) => {
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);
    fibre(ctx, w, h, seed, 0.09);
    ctx.strokeStyle = "rgba(60,36,16,0.35)";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.setLineDash([]);
    if (ref) {
    ctx.fillStyle = "#b8321f";
    ctx.fillRect(44, 52, 24, 74);
    }
    ctx.fillStyle = "#2a1a0e";
    ctx.font = `500 76px ${fonts.mono}`;
    ctx.textBaseline = "middle";
    let rs = 76;
    while (ctx.measureText(ref).width > w - 130 && rs > 50) {
      rs -= 4;
      ctx.font = `500 ${rs}px ${fonts.mono}`;
    }
    if (ref) ctx.fillText(ref, 86, 90);
    lines.forEach((line, i) => {
      let size = 104;
      ctx.font = `400 ${size}px ${fonts.display}`;
      while (ctx.measureText(line).width > w - 88 && size > 50) {
        size -= 4;
        ctx.font = `400 ${size}px ${fonts.display}`;
      }
      ctx.fillStyle = "#1d130b";
      ctx.fillText(line, ref ? 44 : (w - ctx.measureText(line).width) / 2, top + 206 + i * 118);
    });
  });
}

/** Painted cardboard facade of a parliament building (generic, no emblem). */
export function facadeTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("facade", 1024, 620, (ctx, w, h) => {
    ctx.fillStyle = "#efe6d2";
    ctx.fillRect(0, 0, w, h);
    fibre(ctx, w, h, 301, 0.06);
    // stepped base
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? "#d9cdb5" : "#cfc1a6";
      ctx.fillRect(40 - i * 18, h - 40 - i * 26, w - 80 + i * 36, 26);
    }
    // colonnade
    const cols = 11;
    for (let i = 0; i < cols; i++) {
      const x = 90 + (i * (w - 180)) / (cols - 1);
      ctx.fillStyle = "#fbf7ee";
      ctx.fillRect(x - 16, 190, 32, h - 330);
      ctx.fillStyle = "rgba(120,100,70,0.25)";
      ctx.fillRect(x + 8, 190, 8, h - 330);
    }
    // entablature with the name as plain text
    ctx.fillStyle = "#e3d8c0";
    ctx.fillRect(60, 140, w - 120, 56);
    ctx.fillStyle = "#1d130b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 54px ${fonts.display}`;
    ctx.fillText("GEDUNG MPR", w / 2, 171);
    // dark doorway
    ctx.fillStyle = "#5a4630";
    ctx.fillRect(w / 2 - 70, h - 250, 140, 140);
  });
}

/** Closed booklet cover. */
export function bookCoverTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("book-cover", 600, 820, (ctx, w, h) => {
    ctx.fillStyle = "#7a1f24";
    ctx.fillRect(0, 0, w, h);
    fibre(ctx, w, h, 404, 0.1);
    ctx.strokeStyle = "#d9b25a";
    ctx.lineWidth = 8;
    ctx.strokeRect(34, 34, w - 68, h - 68);
    ctx.fillStyle = "#f3d98c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `500 52px ${fonts.mono}`;
    ctx.fillText("UNDANG-UNDANG", w / 2, 250);
    ctx.font = `400 150px ${fonts.display}`;
    ctx.fillText("NO. 7", w / 2, 410);
    ctx.font = `400 110px ${fonts.display}`;
    ctx.fillText("1978", w / 2, 560);
  });
}

/** Left page (back of the cover once the book is open): big dark display type only. */
export function bookLeftTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("book-left2", 600, 820, (ctx, w, h) => {
    ctx.fillStyle = "#f6efdf";
    ctx.fillRect(0, 0, w, h);
    fibre(ctx, w, h, 405, 0.05);
    ctx.fillStyle = "#1d130b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 92px ${fonts.display}`;
    ctx.fillText("UU NO. 7", w / 2, 200);
    ctx.fillText("TAHUN", w / 2, 320);
    ctx.fillText("1978", w / 2, 430);
    ctx.fillStyle = "#8a1f23";
    ctx.font = `400 70px ${fonts.display}`;
    ctx.fillText("PRESIDEN &", w / 2, 620);
    ctx.fillText("WAPRES", w / 2, 700);
  });
}

/** Right page: Pasal 6. The key condition "DENGAN HORMAT" is a main line on row y=665 (highlighter). */
export function bookRightTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("book-right2", 600, 820, (ctx, w, h) => {
    ctx.fillStyle = "#f8f2e4";
    ctx.fillRect(0, 0, w, h);
    fibre(ctx, w, h, 406, 0.05);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8a1f23";
    ctx.font = `400 124px ${fonts.display}`;
    ctx.fillText("PASAL 6", 44, 130);
    ctx.fillStyle = "#1d130b";
    ctx.font = `400 78px ${fonts.display}`;
    ctx.fillText("PENSIUN 100%", 44, 280);
    ctx.fillText("GAJI POKOK", 44, 365);
    ctx.fillText("TERAKHIR", 44, 450);
    ctx.fillStyle = "rgba(29,19,11,0.35)";
    ctx.fillRect(44, 515, w - 88, 5);
    ctx.fillStyle = "#1d130b";
    ctx.font = `400 64px ${fonts.display}`;
    ctx.fillText("BERHENTI", 44, 585);
    ctx.fillText("DENGAN HORMAT", 44, 665);
    void h;
  });
}

/** Big digit for the salary blocks. */
export function digitTexture(text: string, fonts: Fonts, ink: string): THREE.Texture {
  return canvasTex(`digit-${text}-${ink}`, 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 170px ${fonts.display}`;
    ctx.fillText(text, w / 2, h / 2 + 8);
  });
}

/** Red rubber-stamp ink "SAH" (transparent background). */
export function sahInkTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("sah-ink", 360, 360, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(198,40,40,0.92)";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 124, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(198,40,40,0.92)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 120px ${fonts.display}`;
    ctx.fillText("SAH", w / 2, h / 2 + 6);
    // dry-brush gaps
    const r = prng(77);
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.3 + r() * 0.5})`;
      ctx.fillRect(r() * w, r() * h, 3 + r() * 10, 2 + r() * 4);
    }
    ctx.globalCompositeOperation = "source-over";
  });
}

/** Letter envelope "SURAT PENGUNDURAN DIRI". */
export function letterTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("letter", 512, 320, (ctx, w, h) => {
    ctx.fillStyle = "#fbf8f0";
    ctx.fillRect(0, 0, w, h);
    fibre(ctx, w, h, 511, 0.04);
    ctx.strokeStyle = "rgba(90,60,30,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w / 2, h * 0.45);
    ctx.lineTo(w, 0);
    ctx.stroke();
    ctx.fillStyle = "#2a1a0e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 60px ${fonts.display}`;
    ctx.fillText("SURAT", w / 2, 190);
    ctx.font = `500 34px ${fonts.mono}`;
    ctx.fillText("PENGUNDURAN DIRI", w / 2, 250);
  });
}

/** Hanging wooden sign "AUDIRA" above the stage. */
export function signTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("audira-sign", 900, 240, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#5a3a22");
    g.addColorStop(1, "#3e2716");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = prng(9);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(20,10,4,${0.12 + r() * 0.15})`;
      ctx.lineWidth = 1 + r() * 2;
      const y = r() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 20, w * 0.6, y + (r() - 0.5) * 20, w, y + (r() - 0.5) * 10);
      ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 168px ${fonts.display}`;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillText("AUDIRA", w / 2 + 5, h / 2 + 14);
    ctx.fillStyle = "#f3d98c";
    ctx.fillText("AUDIRA", w / 2, h / 2 + 8);
  });
}

/** Flat pan label for the balance: one big dark word on a cream card. */
export function panLabelTexture(text: string, fonts: Fonts): THREE.Texture {
  return canvasTex(`pan-${text}`, 720, 200, (ctx, w, h) => {
    ctx.fillStyle = "#fbf3e2";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1d130b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 150;
    ctx.font = `400 ${size}px ${fonts.display}`;
    while (ctx.measureText(text).width > w - 50 && size > 60) {
      size -= 4;
      ctx.font = `400 ${size}px ${fonts.display}`;
    }
    ctx.fillText(text, w / 2, h / 2 + 8);
  });
}
