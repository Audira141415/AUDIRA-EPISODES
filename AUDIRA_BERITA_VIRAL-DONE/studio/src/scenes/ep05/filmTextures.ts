// EP05 film: extra canvas textures (date chips, price tag, game case insert, empty PC footprint,
// AUDIRA silkscreen). Seeded noise only; system fonts only, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { canvasTex } from "./coverTextures.ts";

const speckle = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, a = 0.035) => {
  const r = prng(seed);
  for (let i = 0; i < (w * h) / 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${r() * a})`;
    ctx.fillRect(r() * w, r() * h, 1, 1);
  }
};

/** Epoxy chip top printed with a calendar day. */
export function dayTexture(day: number, weekday: string, accent: string): THREE.Texture {
  return canvasTex(`day-${day}-${accent}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#16181d";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, day);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, 40);
    ctx.fillStyle = "#0b0d10";
    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${weekday} · NOV`, w / 2, 29);
    ctx.fillStyle = "#f3efe6";
    ctx.font = "bold 150px 'Arial Black', Arial, sans-serif";
    ctx.fillText(String(day), w / 2, 205);
    ctx.fillStyle = "rgba(190,196,206,0.6)";
    ctx.beginPath();
    ctx.arc(22, 62, 8, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Price tag face: Rp1,19 juta. */
export function priceTexture(): THREE.Texture {
  return canvasTex("price", 768, 432, (ctx, w, h) => {
    ctx.fillStyle = "#f2ede2";
    ctx.fillRect(0, 0, w, h);
    const r = prng(12);
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `rgba(80,60,40,${r() * 0.05})`;
      ctx.fillRect(r() * w, r() * h, 1.5, 1);
    }
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(0, 0, w, 74);
    ctx.fillStyle = "#ffb703";
    ctx.font = "bold 34px 'Courier New', monospace";
    ctx.fillText("EDISI STANDAR · DIGITAL PS5", 34, 50);
    ctx.fillStyle = "#14161b";
    ctx.font = "bold 138px 'Arial Black', Arial, sans-serif";
    ctx.fillText("Rp1,19", 34, 250);
    const pw = ctx.measureText("Rp1,19").width;
    ctx.font = "bold 70px 'Arial Black', Arial, sans-serif";
    ctx.fillText("juta", 34 + pw + 18, 250);
    ctx.fillStyle = "#3a3f4a";
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.fillText("PlayStation Store Indonesia", 36, 330);
    ctx.fillStyle = "#c2410c";
    ctx.fillRect(34, 360, w - 68, 6);
    // hole for the string
    ctx.fillStyle = "#0b0d10";
    ctx.beginPath();
    ctx.arc(w - 50, 38, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Game case insert, left half: empty disc hub. */
export function caseLeftTexture(): THREE.Texture {
  return canvasTex("case-left", 512, 640, (ctx, w, h) => {
    ctx.fillStyle = "#20242c";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, 41, 0.05);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 6;
    ctx.setLineDash([22, 16]);
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.46, 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#2c313a";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.46, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff4f9a";
    ctx.font = "bold 46px 'Arial Black', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TANPA CAKRAM", w / 2, h * 0.9);
  });
}

/** Game case insert, right half: download code card. */
export function codeCardTexture(): THREE.Texture {
  return canvasTex("code-card", 512, 640, (ctx, w, h) => {
    ctx.fillStyle = "#f2ede2";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(0, 0, w, 110);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 52px 'Arial Black', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("KODE UNDUH", w / 2, 76);
    ctx.fillStyle = "#14161b";
    ctx.font = "bold 40px 'Courier New', monospace";
    ctx.fillText("XXXX-XXXX-XXXX", w / 2, 250);
    ctx.fillStyle = "#9aa0aa";
    ctx.fillRect(60, 300, w - 120, 64);
    ctx.fillStyle = "#3a3f4a";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText("gosok untuk melihat", w / 2, 343);
    // download arrow
    ctx.strokeStyle = "#14161b";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(w / 2, 420);
    ctx.lineTo(w / 2, 540);
    ctx.moveTo(w / 2 - 50, 490);
    ctx.lineTo(w / 2, 545);
    ctx.lineTo(w / 2 + 50, 490);
    ctx.stroke();
    ctx.fillRect(w / 2 - 90, 580, 180, 14);
  });
}

/** Unpopulated chip footprint: silkscreen outline + empty pads (transparent background). */
export function footprintTexture(): THREE.Texture {
  return canvasTex("footprint", 640, 640, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(240,244,240,0.9)";
    ctx.lineWidth = 8;
    ctx.setLineDash([30, 18]);
    ctx.strokeRect(70, 70, w - 140, h - 140);
    ctx.setLineDash([]);
    // corner pin-1 mark
    ctx.fillStyle = "rgba(240,244,240,0.9)";
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(110, 40);
    ctx.lineTo(40, 110);
    ctx.fill();
    // empty pads ring
    ctx.fillStyle = "#c9a43a";
    for (let i = 0; i < 12; i++) {
      const p = 120 + i * 33;
      ctx.fillRect(p, 92, 16, 26);
      ctx.fillRect(p, h - 118, 16, 26);
      ctx.fillRect(92, p, 26, 16);
      ctx.fillRect(w - 118, p, 26, 16);
    }
    ctx.fillStyle = "rgba(240,244,240,0.95)";
    ctx.textAlign = "center";
    ctx.font = "bold 150px 'Arial Black', Arial, sans-serif";
    ctx.fillText("PC ?", w / 2, h / 2 + 50);
    ctx.font = "bold 34px 'Courier New', monospace";
    ctx.fillText("U-PC  ·  NOT POPULATED", w / 2, h / 2 + 120);
  }, true);
}

/** AUDIRA silkscreen block (transparent background). */
export function audiraSilkTexture(): THREE.Texture {
  return canvasTex("audira-silk", 768, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(240,244,240,0.92)";
    ctx.lineWidth = 7;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = "rgba(240,244,240,0.95)";
    ctx.textAlign = "center";
    ctx.font = "bold 128px 'Courier New', monospace";
    ctx.fillText("AUDIRA", w / 2, 150);
    ctx.font = "bold 40px 'Courier New', monospace";
    ctx.fillText("NVMe · REV 1.0 · 212 GB", w / 2, 212);
  }, true);
}

/** Tower plaque (PlayStation / Xbox share) printed on the tower cap front. */
export function shareTexture(name: string, pct: string, accent: string): THREE.Texture {
  return canvasTex(`share-${name}`, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#121419";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, name.length * 7);
    ctx.fillStyle = accent;
    ctx.textAlign = "center";
    ctx.font = "bold 130px 'Arial Black', Arial, sans-serif";
    ctx.fillText(pct, w / 2, 150);
    ctx.fillStyle = "#e8e4dc";
    ctx.font = "bold 44px 'Courier New', monospace";
    ctx.fillText(name, w / 2, 218);
  });
}
