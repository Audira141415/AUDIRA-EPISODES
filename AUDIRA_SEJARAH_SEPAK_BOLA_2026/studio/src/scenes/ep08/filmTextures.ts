// EP08 film textures (FILMNOIR): canvas-drawn, seeded, system fonts only (same pixels in every render tab).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { canvasTex } from "./coverTextures.ts";

const IMPACT = "Impact, 'Arial Black', sans-serif";
const MONO = "700 {S}px 'Courier New', monospace";
const mono = (s: number) => MONO.replace("{S}", String(s));

/** Painted slat with a team name (manual scoreboard row). */
export const rowTexture = (name: string) =>
  canvasTex(`row-${name}`, 1024, 192, (ctx, w, h) => {
    ctx.fillStyle = "#121315";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, y, w, 2);
    }
    ctx.strokeStyle = "#5b5a56";
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = "#EFEBE2";
    ctx.textBaseline = "middle";
    ctx.font = `128px ${IMPACT}`;
    ctx.fillText(name, 48, h / 2 + 6);
  });

/** White enamel number tile. */
export const numTexture = (n: string) =>
  canvasTex(`num-${n}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#EFEBE2";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#8f8c85";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = "#0d0e10";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `210px ${IMPACT}`;
    ctx.fillText(n, w / 2, h / 2 + 10);
  });

/** Header of the standings board. */
export const boardHeadTexture = () =>
  canvasTex("board-head", 1024, 256, (ctx, w, h) => {
    ctx.fillStyle = "#0d0e10";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#EFEBE2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `104px ${IMPACT}`;
    ctx.fillText("GRUP PENENTU 1950", w / 2, 92);
    ctx.font = mono(46);
    ctx.fillStyle = "#bdb9b0";
    ctx.fillText("TIM          POIN", w / 2 + 160, 200);
  });

/** Plain-paper ticket (generic, not a replica). */
export const ticketTexture = () =>
  canvasTex("ticket", 1024, 448, (ctx, w, h) => {
    const r = prng(41);
    ctx.fillStyle = "#d9d3c4";
    ctx.fillRect(0, 0, w, h);
    for (let k = 0; k < 5000; k++) {
      const v = 150 + Math.floor(r() * 80);
      ctx.fillStyle = `rgba(${v},${v - 4},${v - 12},0.12)`;
      ctx.fillRect(r() * w, r() * h, 2, 2);
    }
    ctx.strokeStyle = "#2a2926";
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(760, 24);
    ctx.lineTo(760, h - 24);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#1d1c1a";
    ctx.textBaseline = "middle";
    ctx.font = mono(40);
    ctx.fillText("PIALA DUNIA 1950", 52, 76);
    ctx.font = `120px ${IMPACT}`;
    ctx.fillText("MARACANÃ", 48, 190);
    ctx.font = mono(44);
    ctx.fillText("16 · 07 · 1950", 52, 290);
    ctx.font = mono(40);
    ctx.fillText("BRASIL × URUGUAY", 52, 360);
    ctx.save();
    ctx.translate(880, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.font = `76px ${IMPACT}`;
    ctx.fillText("TRIBUN", 0, 0);
    ctx.restore();
  });

/** 90-minute match dial. */
export const dialTexture = () =>
  canvasTex("dial90", 1024, 1024, (ctx, w, h) => {
    const c = w / 2;
    ctx.fillStyle = "#dcd7cc";
    ctx.beginPath();
    ctx.arc(c, c, c - 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#141416";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(c, c, c - 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#141416";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let m = 0; m < 90; m++) {
      const a = (m / 90) * Math.PI * 2 - Math.PI / 2;
      const long = m % 15 === 0;
      const r0 = c - 40,
        r1 = c - (long ? 110 : m % 5 === 0 ? 80 : 60);
      ctx.lineWidth = long ? 14 : 5;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      ctx.stroke();
      if (long) {
        ctx.font = `92px ${IMPACT}`;
        ctx.fillText(String(m), c + Math.cos(a) * (c - 180), c + Math.sin(a) * (c - 180) + 4);
      }
    }
    // half-time band
    ctx.strokeStyle = "rgba(20,20,22,0.35)";
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(c, c, c - 250, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.font = mono(48);
    ctx.fillText("MENIT", c, c + 190);
  });

/** Team plate for the score row. */
export const teamPlateTexture = (name: string) =>
  canvasTex(`plate-${name}`, 512, 160, (ctx, w, h) => {
    ctx.fillStyle = "#0d0e10";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#EFEBE2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `112px ${IMPACT}`;
    ctx.fillText(name, w / 2, h / 2 + 6);
  });

/** Name plate on a pedestal. */
export const pedestalTexture = (name: string) =>
  canvasTex(`ped-${name}`, 512, 160, (ctx, w, h) => {
    ctx.fillStyle = "#c9c4b9";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#1a1b1e";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#1a1b1e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `92px ${IMPACT}`;
    ctx.fillText(name, w / 2, h / 2 + 6);
  });

/** Plaster wall crossed by venetian-blind light (diagonal bright slats), seeded grain. */
export const blindWallTexture = () =>
  canvasTex("blind-wall", 1024, 1024, (ctx, w, h) => {
    const r = prng(19);
    ctx.fillStyle = "#3a3632";
    ctx.fillRect(0, 0, w, h);
    for (let k = 0; k < 16000; k++) {
      const v = 40 + Math.floor(r() * 40);
      ctx.fillStyle = `rgba(${v},${v - 3},${v - 6},0.25)`;
      ctx.fillRect(r() * w, r() * h, 3, 3);
    }
    // light window through the blinds: a skewed rectangle of slats
    ctx.save();
    ctx.translate(w * 0.56, h * 0.18);
    ctx.transform(1, 0.32, -0.42, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, 640);
    g.addColorStop(0, "rgba(236,228,210,0.82)");
    g.addColorStop(1, "rgba(236,228,210,0.28)");
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = g;
      ctx.fillRect(0, i * 48, 360, 28);
    }
    ctx.restore();
  });

/** Wooden floorboards, dark. */
export const floorTexture = () =>
  canvasTex(
    "room-floor",
    512,
    512,
    (ctx, w, h) => {
      const r = prng(23);
      ctx.fillStyle = "#2a2622";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 64) {
        const v = 34 + Math.floor(r() * 14);
        ctx.fillStyle = `rgb(${v},${v - 4},${v - 8})`;
        ctx.fillRect(0, y, w, 60);
        ctx.fillStyle = "#15130f";
        ctx.fillRect(0, y + 60, w, 4);
        ctx.fillRect(r() * w, y, 3, 60);
      }
      for (let k = 0; k < 4000; k++) {
        ctx.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.15})`;
        ctx.fillRect(r() * w, r() * h, 6 + r() * 30, 1);
      }
    },
    true,
    true,
  );

/** 1953 newspaper page with a shirt-design contest and a pencil sketch (generic paper, no masthead). */
export const newspaperTexture = () =>
  canvasTex("news1953", 768, 1024, (ctx, w, h) => {
    const r = prng(53);
    ctx.fillStyle = "#d8d1c0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1c1b19";
    ctx.textAlign = "center";
    ctx.font = `92px ${IMPACT}`;
    ctx.fillText("LOMBA DESAIN", w / 2, 120);
    ctx.fillText("KAUS TIMNAS", w / 2, 220);
    ctx.font = mono(40);
    ctx.fillText("· 1953 ·", w / 2, 290);
    ctx.fillRect(40, 320, w - 80, 6);
    // columns of grey "text"
    for (let col = 0; col < 2; col++)
      for (let y = 360; y < h - 40; y += 22) {
        const x0 = col === 0 ? 40 : w * 0.56;
        if (col === 1 && y < 760) continue;
        ctx.fillStyle = `rgba(30,30,28,${0.35 + r() * 0.2})`;
        ctx.fillRect(x0, y, (w * 0.4 - 10) * (0.7 + r() * 0.3), 9);
      }
    // pencil sketch of a shirt in the right column
    ctx.save();
    ctx.translate(w * 0.75, 540);
    ctx.strokeStyle = "rgba(25,25,25,0.85)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, -150);
    ctx.lineTo(-150, -100);
    ctx.lineTo(-120, -30);
    ctx.lineTo(-80, -50);
    ctx.lineTo(-80, 160);
    ctx.lineTo(80, 160);
    ctx.lineTo(80, -50);
    ctx.lineTo(120, -30);
    ctx.lineTo(150, -100);
    ctx.lineTo(60, -150);
    ctx.quadraticCurveTo(0, -100, -60, -150);
    ctx.stroke();
    for (let k = 0; k < 40; k++) {
      ctx.strokeStyle = `rgba(25,25,25,${0.08 + r() * 0.12})`;
      ctx.beginPath();
      const y = -40 + r() * 190;
      ctx.moveTo(-76, y);
      ctx.lineTo(76, y + r() * 20 - 10);
      ctx.stroke();
    }
    ctx.restore();
  });

/** Soft vertical light cone (for lamp beams): bright at the top, transparent at the bottom and edges. */
export const beamTexture = () =>
  canvasTex("beam", 256, 512, (ctx, w, h) => {
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const along = 1 - y / h;
      for (let x = 0; x < w; x++) {
        const u = (x / w) * 2 - 1;
        const across = Math.max(0, 1 - u * u) ** 1.5;
        const p = (y * w + x) * 4;
        img.data[p] = img.data[p + 1] = img.data[p + 2] = 255;
        img.data[p + 3] = across * (0.15 + 0.85 * along) * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });

/** Tangent-space normal map for a hanging cotton shirt: vertical drape folds that deepen toward
 *  the hem, plus a fine knit. UV = shape units (1 unit = one tile), periodic so it can repeat. */
export const clothNormalTexture = () => {
  const tex = canvasTex("cloth-normal", 512, 512, (ctx, w, h) => {
    const img = ctx.createImageData(w, h);
    const rnd = prng(808);
    const ph = Array.from({ length: 4 }, () => rnd() * Math.PI * 2);
    const height = (u: number, v: number) => {
      // v: 0 = top (shoulders), 1 = bottom (hem); folds grow downward
      const drape = 0.25 + 0.75 * v;
      const wob = 0.18 * Math.sin(2 * Math.PI * (v * 2) + ph[0]);
      const folds =
        Math.sin(2 * Math.PI * (u * 6 + wob) + ph[1]) * 0.6 +
        Math.sin(2 * Math.PI * (u * 11 - wob * 0.5) + ph[2]) * 0.25 +
        Math.sin(2 * Math.PI * (u * 3) + ph[3]) * 0.35;
      return folds * drape;
    };
    const eps = 1 / w;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const dx = (height(u + eps, v) - height(u - eps, v)) / (2 * eps);
        const dy = (height(u, v + eps) - height(u, v - eps)) / (2 * eps);
        // knit: tiny alternating ribs
        const knit = ((x >> 1) + (y >> 2)) % 2 === 0 ? 0.6 : -0.6;
        let nx = -dx * 0.03 + knit * 0.04;
        let ny = dy * 0.03;
        const nz = 1;
        const len = Math.hypot(nx, ny, nz);
        nx /= len;
        ny /= len;
        const i = (y * w + x) * 4;
        img.data[i] = Math.round((nx * 0.5 + 0.5) * 255);
        img.data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        img.data[i + 2] = Math.round((nz / len) * 0.5 * 255 + 127.5);
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, false, true);
  return tex;
};

export const noTex = new THREE.Texture();
