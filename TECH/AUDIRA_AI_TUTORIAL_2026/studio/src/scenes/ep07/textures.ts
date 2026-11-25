// EP07 canvas textures (deterministic, no random). Fonts must be loaded before these run.
import * as THREE from "three";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette.ts";

const make = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

/** Cashier display: item rows, divider, TOTAL. No invented prices: amounts are ink bars. */
export const screenTexture = () =>
  make(640, 420, (c) => {
    c.fillStyle = "#24363A";
    c.fillRect(0, 0, 640, 420);
    // scanline-free flat LCD with a soft top band
    c.fillStyle = "#2E474B";
    c.fillRect(0, 0, 640, 64);
    c.fillStyle = P.accentYellow;
    c.font = "800 38px 'Barlow Condensed'";
    c.fillText("KASIR WARUNG", 28, 46);
    c.fillStyle = "#7FD1B0";
    c.beginPath();
    c.arc(600, 32, 11, 0, Math.PI * 2);
    c.fill();
    const rows = [0.62, 0.44, 0.7];
    rows.forEach((wFrac, i) => {
      const y = 96 + i * 62;
      c.fillStyle = "#7FD1B0";
      rr(c, 28, y, 40, 40, 8);
      c.fill();
      c.fillStyle = "#CFE7DE";
      rr(c, 86, y + 8, 300 * wFrac, 24, 6);
      c.fill();
      c.fillStyle = "#9FC4B8";
      rr(c, 470, y + 8, 140, 24, 6);
      c.fill();
    });
    c.strokeStyle = "#7FD1B0";
    c.lineWidth = 4;
    c.setLineDash([14, 10]);
    c.beginPath();
    c.moveTo(28, 292);
    c.lineTo(612, 292);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = "#FFFFFF";
    c.font = "800 64px 'Barlow Condensed'";
    c.fillText("TOTAL", 28, 378);
    c.fillStyle = P.accentYellow;
    c.fillText("Rp", 330, 378);
    c.fillStyle = P.accentYellow;
    rr(c, 410, 330, 202, 52, 10);
    c.fill();
  });

export const keyTexture = (label: string, bg: string, fg = P.inkBlack) =>
  make(160, 128, (c) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, 160, 128);
    c.fillStyle = fg;
    c.font = "800 92px 'Barlow Condensed'";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(label, 80, 70);
  });

/** Prompt bubble face: the example prompt from the research (aplikasi kalkulator kasir). */
export const bubbleTexture = () =>
  make(1200, 420, (c) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, 1200, 420);
    c.fillStyle = P.accentYellow;
    rr(c, 48, 40, 230, 66, 14);
    c.fill();
    c.strokeStyle = P.inkBlack;
    c.lineWidth = 5;
    c.stroke();
    c.fillStyle = P.inkBlack;
    c.font = "800 46px 'Barlow Condensed'";
    c.fillText("PROMPT", 78, 90);
    c.font = "800 108px 'Barlow Condensed'";
    c.fillText("Buatkan aplikasi", 52, 232);
    c.fillText("kasir untuk warungku", 52, 352);
    c.fillStyle = P.bodyCoral;
    c.fillRect(52 + c.measureText("kasir untuk warungku").width + 14, 270, 14, 96);
  });

export const tileTexture = (word: string, bg: string) =>
  make(320, 140, (c) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, 320, 140);
    c.fillStyle = P.inkBlack;
    c.font = "800 76px 'Barlow Condensed'";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(word, 160, 76);
  });

export const plateTexture = (text: string, bg: string, fg: string, w = 512, h = 128, size = 88) =>
  make(w, h, (c) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    c.fillStyle = fg;
    c.font = `800 ${size}px 'Barlow Condensed'`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, w / 2, h / 2 + 4);
  });

/** Receipt strip: header, item lines, TOTAL, barcode. */
export const receiptTexture = () =>
  make(256, 1024, (c) => {
    c.fillStyle = "#FFFDF6";
    c.fillRect(0, 0, 256, 1024);
    c.fillStyle = P.inkBlack;
    c.textAlign = "center";
    c.font = "800 44px 'Barlow Condensed'";
    c.fillText("AUDIRA", 128, 70);
    c.font = "700 28px 'Barlow Condensed'";
    c.fillText("STRUK BELANJA", 128, 108);
    c.fillStyle = "#3a3d42";
    for (let i = 0; i < 6; i++) {
      const y = 160 + i * 52;
      c.fillRect(26, y, 90 + ((i * 37) % 60), 14);
      c.fillRect(176, y, 54, 14);
    }
    c.fillRect(20, 480, 216, 4);
    c.font = "800 40px 'Barlow Condensed'";
    c.textAlign = "left";
    c.fillStyle = P.inkBlack;
    c.fillText("TOTAL", 26, 540);
    c.fillRect(150, 512, 80, 30);
    for (let i = 0; i < 40; i++) {
      const w = (i * 7) % 3 === 0 ? 6 : 3;
      c.fillRect(30 + i * 5, 600, w, 90);
    }
    c.textAlign = "center";
    c.font = "700 26px 'Barlow Condensed'";
    c.fillText("TERIMA KASIH", 128, 740);
  });

/** Warm paper floor with an isometric dot grid. */
export const floorTexture = () =>
  make(1024, 1024, (c) => {
    c.fillStyle = P.paperWarm;
    c.fillRect(0, 0, 1024, 1024);
    c.fillStyle = "rgba(122,155,184,0.55)";
    for (let y = 0; y < 1024; y += 32) {
      for (let x = 0; x < 1024; x += 32) {
        c.beginPath();
        c.arc(x + 16, y + 16, 2.4, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
