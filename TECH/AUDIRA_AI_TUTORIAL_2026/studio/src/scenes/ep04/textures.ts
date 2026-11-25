// EP04 cover textures: one deterministic landscape drawn for both prints (they must look
// identical), the magnified lens view that reveals the hidden watermark pattern, and the paper
// props (evidence tents, AUDIRA evidence card, DIPERIKSA stamp, forensic scale).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};

const tex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Mountain lake at dawn, drawn in a 1000x720 design space. */
export function drawLandscape(ctx: CanvasRenderingContext2D) {
  const W = 1000, H = 720;
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, "#2b4f6e");
  sky.addColorStop(0.55, "#d98a5a");
  sky.addColorStop(1, "#f6c98a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // sun
  const sun = ctx.createRadialGradient(640, 330, 4, 640, 330, 120);
  sun.addColorStop(0, "rgba(255,244,214,1)");
  sun.addColorStop(0.25, "rgba(255,226,170,0.9)");
  sun.addColorStop(1, "rgba(255,200,140,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(400, 160, 480, 360);
  // mountain layers
  const layers: [string, number, number, number][] = [
    ["#8a6f86", 300, 90, 3],
    ["#5d4e6c", 340, 110, 5],
    ["#33344a", 380, 70, 9],
  ];
  layers.forEach(([col, base, amp, seed]) => {
    const r = prng(seed * 977);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, H);
    let y = base - r() * amp;
    for (let x = 0; x <= W; x += 40) {
      y = Math.max(base - amp, Math.min(base + 20, y + (r() - 0.5) * amp * 0.9));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  });
  // lake with reflection
  const lake = ctx.createLinearGradient(0, 420, 0, H);
  lake.addColorStop(0, "#e2a774");
  lake.addColorStop(0.4, "#5f6f86");
  lake.addColorStop(1, "#1f2b3a");
  ctx.fillStyle = lake;
  ctx.fillRect(0, 420, W, H - 420);
  ctx.fillStyle = "rgba(255,236,200,0.55)";
  for (let i = 0; i < 9; i++) ctx.fillRect(600 - i * 6, 430 + i * 14, 80 + i * 12, 3);
  // pine silhouettes on the shore
  const r = prng(4242);
  ctx.fillStyle = "#141a1f";
  for (let x = -10; x < W; x += 26 + r() * 30) {
    if (x > 380 && x < 760) continue;
    const h = 50 + r() * 90;
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x + 14, 430 - h);
    ctx.lineTo(x + 28, 430);
    ctx.fill();
  }
  ctx.fillRect(0, 424, 380, 10);
  ctx.fillRect(760, 424, 240, 10);
}

export function landscapeTexture() {
  const [c, ctx] = canvas(1000, 720);
  drawLandscape(ctx);
  // faint print grain
  const r = prng(77);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},255,0.035)`;
    ctx.fillRect(r() * 1000, r() * 720, 2, 2);
  }
  return tex(c);
}

/** Magnified view inside the lens: the same landscape, zoomed, with the glowing hidden pattern. */
export function lensTexture(cx: number, cy: number, zoom: number) {
  const S = 1024;
  const [c, ctx] = canvas(S, S);
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(S / 2, S / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);
  drawLandscape(ctx);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.clip();
  // darken slightly so the pattern reads
  ctx.fillStyle = "rgba(6,20,26,0.38)";
  ctx.fillRect(0, 0, S, S);
  // hidden watermark: diagonal lattice of dots and fine lines
  ctx.translate(S / 2, S / 2);
  ctx.rotate(-0.42);
  const r = prng(2026);
  ctx.strokeStyle = "rgba(110,255,214,0.32)";
  ctx.lineWidth = 2;
  for (let k = -12; k <= 12; k++) {
    ctx.beginPath();
    ctx.moveTo(-800, k * 46);
    ctx.lineTo(800, k * 46);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(110,255,214,0.16)";
  for (let k = -12; k <= 12; k++) {
    ctx.beginPath();
    ctx.moveTo(k * 46, -800);
    ctx.lineTo(k * 46, 800);
    ctx.stroke();
  }
  ctx.shadowColor = "rgba(120,255,220,1)";
  for (let i = -12; i <= 12; i++) {
    for (let j = -12; j <= 12; j++) {
      const v = r();
      if (v < 0.35) continue;
      const big = v > 0.82;
      ctx.shadowBlur = big ? 22 : 10;
      ctx.fillStyle = big ? "rgba(214,255,244,1)" : "rgba(120,255,214,0.9)";
      ctx.beginPath();
      ctx.arc(i * 46, j * 46, big ? 7 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  // glass edge falloff + highlight crescent
  const edge = ctx.createRadialGradient(S / 2, S / 2, S * 0.36, S / 2, S / 2, S / 2);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(0,8,12,0.65)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.43, Math.PI * 1.08, Math.PI * 1.42);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.4, Math.PI * 1.5, Math.PI * 1.58);
  ctx.stroke();
  // mono read-out
  ctx.font = "600 34px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillStyle = "rgba(170,255,228,0.95)";
  ctx.textAlign = "center";
  ctx.fillText("POLA TERSEMBUNYI", S / 2, S * 0.83);
  return tex(c);
}

/** Folded evidence tent face: amber card with a big black letter. */
export function tentTexture(letter: string) {
  const [c, ctx] = canvas(256, 200);
  ctx.fillStyle = "#F2B33D";
  ctx.fillRect(0, 0, 256, 200);
  ctx.fillStyle = "#1D1D1B";
  ctx.fillRect(0, 0, 256, 34);
  ctx.font = "700 22px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillStyle = "#F2B33D";
  ctx.textAlign = "center";
  ctx.fillText("BUKTI", 128, 25);
  ctx.font = "400 150px 'Anton', 'Impact', sans-serif";
  ctx.fillStyle = "#1D1D1B";
  ctx.fillText(letter, 128, 188);
  return tex(c);
}

/** Evidence card with the AUDIRA name. */
export function cardTexture() {
  const [c, ctx] = canvas(600, 380);
  ctx.fillStyle = "#E4E0D4";
  ctx.fillRect(0, 0, 600, 380);
  const r = prng(31);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(90,70,40,${0.03 + r() * 0.03})`;
    ctx.fillRect(r() * 600, r() * 380, 2, 2);
  }
  ctx.fillStyle = "#FF4A2E";
  ctx.fillRect(0, 0, 600, 64);
  ctx.font = "700 30px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillStyle = "#FFF6EE";
  ctx.fillText("BARANG BUKTI", 26, 43);
  ctx.textAlign = "right";
  ctx.fillText("EP04", 574, 43);
  ctx.textAlign = "left";
  ctx.font = "400 132px 'Anton', 'Impact', sans-serif";
  ctx.fillStyle = "#1D1D1B";
  ctx.fillText("AUDIRA", 24, 220);
  ctx.strokeStyle = "#1D1D1B";
  ctx.lineWidth = 2;
  [262, 312].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(26, y);
    ctx.lineTo(574, y);
    ctx.stroke();
  });
  ctx.font = "500 24px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillText("ITEM: FOTO A / FOTO B", 26, 252);
  ctx.fillText("CEK: WATERMARK + RIWAYAT FILE", 26, 302);
  ctx.fillText("AI TUTORIAL 2026", 26, 352);
  return tex(c);
}

/** Red rubber-stamp impression (transparent background). */
export function stampTexture() {
  const [c, ctx] = canvas(640, 220);
  ctx.strokeStyle = "rgba(214,40,28,0.92)";
  ctx.lineWidth = 12;
  ctx.strokeRect(12, 12, 616, 196);
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 580, 160);
  ctx.font = "400 128px 'Anton', 'Impact', sans-serif";
  ctx.fillStyle = "rgba(214,40,28,0.92)";
  ctx.textAlign = "center";
  ctx.fillText("DIPERIKSA", 320, 166);
  // worn ink: knock out speckles
  ctx.globalCompositeOperation = "destination-out";
  const r = prng(909);
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.3 + r() * 0.7})`;
    ctx.beginPath();
    ctx.arc(r() * 640, r() * 220, 0.8 + r() * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = tex(c);
  return t;
}

/** Forensic photo scale: black/white cm blocks with tick marks. */
export function scaleTexture() {
  const [c, ctx] = canvas(1024, 128);
  ctx.fillStyle = "#EDEAE0";
  ctx.fillRect(0, 0, 1024, 128);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#EDEAE0" : "#1D1D1B";
    ctx.fillRect(40 + i * 94, 18, 94, 30);
  }
  ctx.strokeStyle = "#1D1D1B";
  ctx.lineWidth = 2;
  for (let i = 0; i <= 100; i++) {
    const x = 40 + i * 9.4;
    ctx.beginPath();
    ctx.moveTo(x, 54);
    ctx.lineTo(x, i % 10 === 0 ? 92 : i % 5 === 0 ? 78 : 68);
    ctx.stroke();
  }
  ctx.font = "600 22px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillStyle = "#1D1D1B";
  for (let i = 0; i <= 10; i++) ctx.fillText(String(i), 34 + i * 94, 118);
  return tex(c);
}
