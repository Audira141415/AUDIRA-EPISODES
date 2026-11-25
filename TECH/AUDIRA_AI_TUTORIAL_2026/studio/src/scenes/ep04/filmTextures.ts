// EP04 film textures (static, drawn once): walnut desk, the hidden-watermark lattice laid out in
// photo space (only ever shown through the lens), the lens glass overlay, Content Credentials
// passport pages, stamps and case notes. Seeded, so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};
export const tex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const MONO = "'IBM Plex Mono', 'Courier New', monospace";
const ANTON = "'Anton', 'Impact', sans-serif";

/** Dark walnut desk with plank seams and long grain; returns [colour, roughness]. */
export function deskTextures() {
  const S = 1024;
  const [c, ctx] = canvas(S, S);
  const [rc, rctx] = canvas(S, S);
  const r = prng(5150);
  ctx.fillStyle = "#1a120d";
  ctx.fillRect(0, 0, S, S);
  rctx.fillStyle = "#b0b0b0";
  rctx.fillRect(0, 0, S, S);
  const planks = 4;
  for (let p = 0; p < planks; p++) {
    const x0 = (p * S) / planks;
    const tone = 14 + r() * 10;
    ctx.fillStyle = `rgb(${tone + 12},${tone + 2},${tone - 4})`;
    ctx.fillRect(x0, 0, S / planks, S);
    for (let g = 0; g < 70; g++) {
      const x = x0 + r() * (S / planks);
      const a = 0.04 + r() * 0.1;
      ctx.strokeStyle = r() > 0.5 ? `rgba(70,44,28,${a})` : `rgba(5,3,2,${a + 0.05})`;
      ctx.lineWidth = 0.6 + r() * 2.2;
      ctx.beginPath();
      const amp = 2 + r() * 8, ph = r() * 6;
      for (let y = 0; y <= S; y += 16) ctx.lineTo(x + Math.sin(y / 90 + ph) * amp, y);
      ctx.stroke();
      rctx.strokeStyle = `rgba(230,230,230,${a * 2})`;
      rctx.lineWidth = ctx.lineWidth;
      rctx.beginPath();
      for (let y = 0; y <= S; y += 16) rctx.lineTo(x + Math.sin(y / 90 + ph) * amp, y);
      rctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(x0, 0, 3, S);
  }
  // worn varnish patches
  for (let i = 0; i < 40; i++) {
    const x = r() * S, y = r() * S, rad = 30 + r() * 120;
    const g = rctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(90,90,90,0.25)");
    g.addColorStop(1, "rgba(90,90,90,0)");
    rctx.fillStyle = g;
    rctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const col = tex(c);
  const rough = tex(rc, false);
  for (const t of [col, rough]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
  }
  return [col, rough] as const;
}

// Lens source space: the print (paper border + photo) on the dark desk, so the lens never smears
// at the photo edge. The photo (1000x720 design units) sits at LENS_SRC.ox/oy inside the canvas.
export const LENS_SRC = { w: 1600, h: 1300, ox: 300, oy: 290 };

/** What the lens magnifies: desk, white print border, photo. */
export function lensSourceTexture(draw: (ctx: CanvasRenderingContext2D) => void) {
  const { w, h, ox, oy } = LENS_SRC;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = "#1a120d";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#3a3127";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#E4E0D4";
  ctx.fillRect(ox - 48, oy - 40, 1097, 822);
  ctx.save();
  ctx.translate(ox, oy);
  draw(ctx);
  ctx.restore();
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Hidden watermark lattice clipped to the photo, in lens source space (transparent). */
export function latticeTexture() {
  const { w, h, ox, oy } = LENS_SRC;
  const [c, ctx] = canvas(w, h);
  ctx.beginPath();
  ctx.rect(ox, oy, 1000, 720);
  ctx.clip();
  ctx.translate(ox + 500, oy + 360);
  ctx.rotate(-0.42);
  const r = prng(2026);
  const step = 24;
  ctx.strokeStyle = "rgba(110,255,214,0.42)";
  ctx.lineWidth = 1.2;
  for (let k = -40; k <= 40; k++) {
    ctx.beginPath();
    ctx.moveTo(-900, k * step);
    ctx.lineTo(900, k * step);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(110,255,214,0.2)";
  for (let k = -40; k <= 40; k++) {
    ctx.beginPath();
    ctx.moveTo(k * step, -900);
    ctx.lineTo(k * step, 900);
    ctx.stroke();
  }
  ctx.shadowColor = "rgba(120,255,220,1)";
  for (let i = -40; i <= 40; i++) {
    for (let j = -40; j <= 40; j++) {
      const v = r();
      if (v < 0.4) continue;
      const big = v > 0.85;
      ctx.shadowBlur = big ? 10 : 5;
      ctx.fillStyle = big ? "rgba(220,255,246,1)" : "rgba(120,255,214,0.95)";
      ctx.beginPath();
      ctx.arc(i * step, j * step, big ? 3.6 : 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Green tick (transparent) for the passport check boxes. */
export function tickTexture(color = "#0E9F6E") {
  const [c, ctx] = canvas(256, 256);
  ctx.strokeStyle = color;
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.lineTo(105, 205);
  ctx.lineTo(225, 50);
  ctx.stroke();
  return tex(c);
}

/** Glass overlay for the lens disc: edge falloff and two highlight crescents (transparent). */
export function lensGlassTexture() {
  const S = 1024;
  const [c, ctx] = canvas(S, S);
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.clip();
  const edge = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S / 2);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(0.8, "rgba(0,10,14,0.18)");
  edge.addColorStop(1, "rgba(0,8,12,0.7)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.44, Math.PI * 1.08, Math.PI * 1.42);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.41, Math.PI * 1.5, Math.PI * 1.6);
  ctx.stroke();
  // chromatic fringe ring (refraction at the rim)
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255,120,80,0.22)";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.485, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(90,200,255,0.22)";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.475, 0, Math.PI * 2);
  ctx.stroke();
  return tex(c);
}

/** Generic rubber stamp (transparent), red by default. */
export function stampTex(text: string, w = 900, color = "rgba(214,40,28,0.95)", fontPx = 120) {
  const h = Math.round(fontPx * 1.75);
  const [c, ctx] = canvas(w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.font = `400 ${fontPx}px ${ANTON}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 6, w - 90);
  ctx.globalCompositeOperation = "destination-out";
  const r = prng(text.length * 97 + 11);
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.3 + r() * 0.7})`;
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, 0.8 + r() * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  return [tex(c), w / h] as const;
}

const paperBase = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, col = "#E7E2D3") => {
  ctx.fillStyle = col;
  ctx.fillRect(0, 0, w, h);
  const r = prng(seed);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(90,70,40,${0.025 + r() * 0.03})`;
    ctx.fillRect(r() * w, r() * h, 2, 2);
  }
};

/** Passport cover (navy, gold foil). */
export function passportCoverTexture() {
  const [c, ctx] = canvas(760, 1000);
  ctx.fillStyle = "#16243a";
  ctx.fillRect(0, 0, 760, 1000);
  const r = prng(88);
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${r() * 0.025})`;
    ctx.fillRect(r() * 760, r() * 1000, 2, 2);
  }
  ctx.strokeStyle = "#d8b56a";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 680, 920);
  ctx.fillStyle = "#e3c27a";
  ctx.textAlign = "center";
  ctx.font = `400 92px ${ANTON}`;
  ctx.fillText("PASPOR", 380, 250);
  ctx.fillText("DIGITAL", 380, 350);
  // emblem: concentric rings + check
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(380, 560, 110, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(380, 560, 84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(330, 562);
  ctx.lineTo(368, 600);
  ctx.lineTo(440, 520);
  ctx.stroke();
  ctx.font = `600 38px ${MONO}`;
  ctx.fillText("CONTENT", 380, 790);
  ctx.fillText("CREDENTIALS", 380, 840);
  return tex(c);
}

/** Left page: what the passport records (origin y 170-400, edit history y 450-950). */
export function passportLeftTexture() {
  const [c, ctx] = canvas(760, 1000);
  paperBase(ctx, 760, 1000, 301);
  ctx.fillStyle = "#16243a";
  ctx.fillRect(0, 0, 760, 120);
  ctx.fillStyle = "#e3c27a";
  ctx.font = `400 72px ${ANTON}`;
  ctx.fillText("PASPOR DIGITAL", 36, 92);
  ctx.fillStyle = "#1D1D1B";
  ctx.font = `400 92px ${ANTON}`;
  ctx.fillText("ASAL-USUL", 40, 270);
  ctx.font = `600 38px ${MONO}`;
  ctx.fillStyle = "#3a3a36";
  ctx.fillText("dari mana file ini", 44, 340);
  ctx.strokeStyle = "rgba(29,29,27,0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, 420);
  ctx.lineTo(720, 420);
  ctx.stroke();
  ctx.fillStyle = "#1D1D1B";
  ctx.font = `400 92px ${ANTON}`;
  ctx.fillText("RIWAYAT EDIT", 40, 540);
  const steps = ["dibuat", "diedit", "disimpan"];
  steps.forEach((s, i) => {
    const y = 650 + i * 110;
    ctx.fillStyle = "#16243a";
    ctx.beginPath();
    ctx.arc(80, y - 16, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e3c27a";
    ctx.font = `400 44px ${ANTON}`;
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), 80, y);
    ctx.textAlign = "left";
    ctx.fillStyle = "#1D1D1B";
    ctx.font = `700 50px ${MONO}`;
    ctx.fillText(s, 140, y);
    if (i < 2) {
      ctx.fillStyle = "#16243a";
      ctx.fillRect(77, y + 16, 6, 46);
    }
  });
  return tex(c);
}

/** Right page: what you can read from it. Check boxes x 40-136, rows y 220/450/680 (box 96px). */
export function passportRightTexture() {
  const [c, ctx] = canvas(760, 1000);
  paperBase(ctx, 760, 1000, 302);
  ctx.fillStyle = "#16243a";
  ctx.fillRect(0, 0, 760, 120);
  ctx.fillStyle = "#e3c27a";
  ctx.font = `400 72px ${ANTON}`;
  ctx.fillText("YANG TERBACA", 36, 92);
  const rows = ["RINGKASAN", "isi media", "RIWAYAT", "edit", "ALAT AI", "dipakai?"];
  for (let i = 0; i < 3; i++) {
    const y = 220 + i * 230;
    ctx.strokeStyle = "#1D1D1B";
    ctx.lineWidth = 7;
    ctx.strokeRect(40, y, 96, 96);
    ctx.fillStyle = "#1D1D1B";
    ctx.font = `400 92px ${ANTON}`;
    ctx.fillText(rows[i * 2], 168, y + 84);
    ctx.font = `700 48px ${MONO}`;
    ctx.fillStyle = "#3a3a36";
    ctx.fillText(rows[i * 2 + 1], 172, y + 150);
  }
  return tex(c);
}

/** Handwritten-ish case notes sheet. */
export function notesTexture(seed: number, title: string) {
  const [c, ctx] = canvas(512, 680);
  paperBase(ctx, 512, 680, seed, "#d9d3c2");
  ctx.strokeStyle = "rgba(60,90,140,0.35)";
  ctx.lineWidth = 2;
  for (let y = 120; y < 680; y += 44) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(482, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#1D1D1B";
  ctx.font = `700 34px ${MONO}`;
  ctx.fillText(title, 30, 80);
  const r = prng(seed + 5);
  ctx.strokeStyle = "rgba(29,29,27,0.7)";
  ctx.lineWidth = 3;
  for (let y = 112; y < 640; y += 44) {
    let x = 34;
    const end = 200 + r() * 260;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    while (x < end) {
      x += 6 + r() * 10;
      ctx.lineTo(x, y - 8 - r() * 14);
      x += 4;
      ctx.lineTo(x, y - 6);
    }
    ctx.stroke();
  }
  return tex(c);
}
