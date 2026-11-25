// EP01 film: extra canvas textures (info cards, rubber stamps, football). Seeded, cached.
import { prng } from "../../core/materials/textures.ts";
import { canvasTex, DISPLAY, GOLD, GREEN, LABEL } from "./coverTextures.ts";

/** Dark card in the cover's tag language: green stripe, bold title, smaller second line. */
export const infoCard = (key: string, title: string, sub: string, w = 900, h = 300, titleColor = "#F3EEE2") =>
  canvasTex(`ep01-card-${key}`, w, h, (ctx) => {
    ctx.fillStyle = "#0E141B";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = GREEN;
    ctx.fillRect(14, 14, 26, h - 28);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    let size = Math.round(h * 0.36);
    ctx.font = `700 ${size}px "${LABEL}"`;
    while (ctx.measureText(title).width > w - 110 && size > 30) ctx.font = `700 ${(size -= 3)}px "${LABEL}"`;
    ctx.fillStyle = titleColor;
    ctx.fillText(title, 70, h * 0.36);
    size = Math.round(h * 0.2);
    ctx.font = `500 ${size}px "${LABEL}"`;
    while (ctx.measureText(sub).width > w - 110 && size > 22) ctx.font = `500 ${(size -= 2)}px "${LABEL}"`;
    ctx.fillStyle = GOLD;
    ctx.fillText(sub, 70, h * 0.72);
  });

/** Red rubber stamp, transparent background, seeded ink erosion. */
export const stamp = (key: string, text: string, w = 900, h = 300, color = "#E23A26") =>
  canvasTex(`ep01-stamp-${key}`, w, h, (ctx) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 16;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = Math.round(h * 0.56);
    ctx.font = `400 ${size}px "${DISPLAY}"`;
    while (ctx.measureText(text).width > w - 90 && size > 30) ctx.font = `400 ${(size -= 4)}px "${DISPLAY}"`;
    ctx.fillText(text, w / 2, h / 2 + 6);
    const r = prng(text.length * 97 + 13);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.6})`;
      const s = 1 + r() * 4;
      ctx.fillRect(r() * w, r() * h, s, s * (0.5 + r()));
    }
    ctx.restore();
  });

/** Classic black-and-white ball pattern (equirect), generic. */
export const ballTexture = () =>
  canvasTex("ep01-ball", 1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#F4F2EC";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#15171A";
    const spots: [number, number][] = [[0.5, 0.5], [0.1, 0.5], [0.3, 0.2], [0.7, 0.2], [0.9, 0.5], [0.3, 0.8], [0.7, 0.8], [0.5, 0.02], [0.5, 0.98]];
    for (const [u, v] of spots) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        ctx.lineTo(u * w + Math.cos(a) * 62, v * h + Math.sin(a) * 52);
      }
      ctx.closePath();
      ctx.fill();
    }
  });

/** Newspaper wrap: grey columns of fake text lines. */
export const newsTexture = () =>
  canvasTex("ep01-news", 512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#DCD6C8";
    ctx.fillRect(0, 0, w, h);
    const r = prng(5);
    ctx.fillStyle = "rgba(40,36,30,0.55)";
    for (let c = 0; c < 4; c++)
      for (let y = 14; y < h - 10; y += 9) ctx.fillRect(10 + c * 126, y, 100 - r() * 30, 3);
  });
