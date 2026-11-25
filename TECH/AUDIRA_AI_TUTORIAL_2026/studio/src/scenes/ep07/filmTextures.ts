// EP07 film-only canvas textures (deterministic). Fonts must be loaded before these run.
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
const BC = "'Barlow Condensed'";

/** Empty display before the app is assembled: dashed frame and a question mark. */
export const emptyScreenTexture = () =>
  make(640, 420, (c) => {
    c.fillStyle = "#2E3B3E";
    c.fillRect(0, 0, 640, 420);
    c.strokeStyle = "#7A9BB8";
    c.lineWidth = 6;
    c.setLineDash([20, 14]);
    rr(c, 30, 30, 580, 360, 18);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = "#7A9BB8";
    c.font = `800 220px ${BC}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("?", 320, 220);
  });

/** Canvas workshop board: title, subtitle, one prompt line. */
export const boardTexture = () =>
  make(1024, 640, (c) => {
    c.fillStyle = "#FFFDF6";
    c.fillRect(0, 0, 1024, 640);
    c.fillStyle = P.accentYellow;
    rr(c, 56, 52, 420, 150, 18);
    c.fill();
    c.strokeStyle = P.inkBlack;
    c.lineWidth = 8;
    c.stroke();
    c.fillStyle = P.inkBlack;
    c.font = `800 132px ${BC}`;
    c.fillText("CANVAS", 84, 178);
    c.font = `800 74px ${BC}`;
    c.fillText("ruang kerja", 520, 160);
    // prompt line
    c.fillStyle = "#EFE8D8";
    rr(c, 56, 290, 912, 120, 22);
    c.fill();
    c.stroke();
    c.fillStyle = P.bodyCoral;
    c.beginPath();
    c.moveTo(96, 318);
    c.lineTo(146, 350);
    c.lineTo(96, 382);
    c.closePath();
    c.fill();
    c.fillStyle = P.inkBlack;
    c.font = `800 80px ${BC}`;
    c.fillText("satu perintah", 176, 378);
    // arrow down to outputs
    c.fillStyle = P.inkBlack;
    for (let i = 0; i < 5; i++) c.fillRect(500, 440 + i * 30, 24, 16);
    c.beginPath();
    c.moveTo(470, 590);
    c.lineTo(554, 590);
    c.lineTo(512, 632);
    c.closePath();
    c.fill();
  });

export const labelTexture = (text: string, bg: string = P.inkBlack, fg = "#FFFFFF") =>
  make(512, 128, (c) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = fg;
    c.font = `800 84px ${BC}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 70);
  });

/** Document page: title bar + text lines. */
export const docTexture = () =>
  make(320, 420, (c) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, 320, 420);
    c.fillStyle = P.inkBlack;
    c.fillRect(30, 34, 200, 26);
    c.fillStyle = "#8E959C";
    for (let i = 0; i < 9; i++) c.fillRect(30, 96 + i * 32, 260 - ((i * 53) % 90), 12);
  });

/** Slide: header + bar chart. */
export const slideTexture = () =>
  make(440, 280, (c) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, 440, 280);
    c.fillStyle = P.bodyCoral;
    c.fillRect(0, 0, 440, 54);
    c.fillStyle = "#FFFFFF";
    c.fillRect(24, 18, 180, 18);
    [[60, 90, P.bodyMint], [140, 140, P.accentYellow], [220, 60, P.bodyCoral], [300, 170, P.bodyMint]].forEach(([x, h, col]) => {
      c.fillStyle = col as string;
      c.fillRect(x as number, 250 - (h as number), 56, h as number);
    });
    c.fillStyle = P.inkBlack;
    c.fillRect(40, 250, 360, 5);
  });

/** Quiz card: question mark + A/B/C options. */
export const quizTexture = () =>
  make(320, 360, (c) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, 320, 360);
    c.fillStyle = P.inkBlack;
    c.font = `800 120px ${BC}`;
    c.textAlign = "center";
    c.fillText("?", 160, 120);
    ["A", "B", "C"].forEach((l, i) => {
      const y = 160 + i * 64;
      c.fillStyle = i === 1 ? P.bodyMint : "#EFE8D8";
      rr(c, 30, y, 260, 48, 10);
      c.fill();
      c.fillStyle = P.inkBlack;
      c.font = `800 38px ${BC}`;
      c.textAlign = "left";
      c.fillText(l, 46, y + 38);
      c.fillStyle = "#8E959C";
      c.fillRect(90, y + 18, 150 - i * 20, 12);
    });
  });

/** Web page: browser bar + hero block + text. */
export const webTexture = () =>
  make(440, 320, (c) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, 440, 320);
    c.fillStyle = "#D1D8E0";
    c.fillRect(0, 0, 440, 46);
    [P.bodyCoral, P.accentYellow, P.bodyMint].forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(26 + i * 26, 23, 9, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = "#FFFFFF";
    rr(c, 110, 12, 300, 22, 11);
    c.fill();
    c.fillStyle = "#7FC4D8";
    c.fillRect(24, 66, 392, 120);
    c.fillStyle = P.inkBlack;
    c.fillRect(24, 206, 220, 20);
    c.fillStyle = "#8E959C";
    for (let i = 0; i < 3; i++) c.fillRect(24, 244 + i * 22, 360 - i * 60, 10);
  });

/** Film prompt bubble: the prompt read in the VO (shortened, first words). */
export const filmBubbleTexture = () =>
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
    c.font = `800 46px ${BC}`;
    c.fillText("PROMPT", 78, 90);
    c.font = `800 104px ${BC}`;
    c.fillText("buat aplikasi kasir", 52, 232);
    c.fillText("sederhana, ada…", 52, 352);
  });

/** Customer-data box label. */
export const dataBoxTexture = () =>
  make(512, 300, (c) => {
    c.fillStyle = "#C98F5A";
    c.fillRect(0, 0, 512, 300);
    c.fillStyle = "#FFFDF6";
    rr(c, 40, 50, 432, 200, 18);
    c.fill();
    c.strokeStyle = P.inkBlack;
    c.lineWidth = 8;
    c.stroke();
    c.fillStyle = P.inkBlack;
    c.font = `800 84px ${BC}`;
    c.textAlign = "center";
    c.fillText("DATA", 256, 140);
    c.fillText("PELANGGAN", 256, 222);
  });
