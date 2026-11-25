// EP03 canvas textures (ISOCRAFT comic print): timer dial face, REKOMENDASI sign, SERU flag,
// BOUNCE tag and the machine's front plate (AUDIRA nameplate + play-days lamps).
// All drawn once and cached; no randomness.
import * as THREE from "three";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette";

const cache = new Map<string, THREE.CanvasTexture>();
const FONT = "'Arial Black', Impact, 'Segoe UI', sans-serif";

function make(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.CanvasTexture(undefined as unknown as HTMLCanvasElement);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

function inkText(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, fill: string, stroke = P.inkBlack, lw = size * 0.14, italic = true) {
  g.font = `${italic ? "italic " : ""}900 ${size}px ${FONT}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineJoin = "round";
  g.lineWidth = lw;
  g.strokeStyle = stroke;
  g.strokeText(text, x, y);
  g.fillStyle = fill;
  g.fillText(text, x, y);
}

function halftone(g: CanvasRenderingContext2D, w: number, h: number, color: string, step = 14, r = 2.6) {
  g.fillStyle = color;
  for (let y = step / 2; y < h; y += step) {
    for (let x = (y / step) % 2 ? step : step / 2; x < w; x += step) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** Timer dial face: paper face, 60 ticks, "60" + "DETIK". The elapsed wedge and needle are 3D. */
export const dialTexture = () =>
  make("dial", 1024, 1024, (g) => {
    const c = 512;
    g.fillStyle = P.paperWarm;
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const big = i % 5 === 0;
      const r0 = big ? 400 : 432;
      g.strokeStyle = P.inkBlack;
      g.lineWidth = big ? 16 : 7;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      g.lineTo(c + Math.cos(a) * 470, c + Math.sin(a) * 470);
      g.stroke();
    }
    g.lineWidth = 18;
    g.beginPath();
    g.arc(c, c, 492, 0, Math.PI * 2);
    g.stroke();
    inkText(g, "60", c, c - 190, 230, P.inkBlack, P.inkBlack, 4, true);
    inkText(g, "DETIK", c, c + 215, 104, P.bodyCoral, P.inkBlack, 12, true);
  });

/** "REKOMENDASI" sign with an up arrow and stars. */
export const recoTexture = () =>
  make("reco", 1024, 384, (g) => {
    g.fillStyle = P.bodyMint;
    g.fillRect(0, 0, 1024, 384);
    halftone(g, 1024, 384, "rgba(255,255,255,0.12)", 22, 4);
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 22;
    g.strokeRect(11, 11, 1002, 362);
    inkText(g, "REKOMENDASI", 512, 168, 108, "#FFFFFF", P.inkBlack, 20);
    inkText(g, "★ UNTUKMU ★", 512, 300, 64, P.accentYellow, P.inkBlack, 12);
  });

/** "SERU!" pennant on the fun zone. */
export const seruTexture = () =>
  make("seru", 512, 256, (g) => {
    g.fillStyle = P.accentYellow;
    g.fillRect(0, 0, 512, 256);
    halftone(g, 512, 256, "rgba(224,109,83,0.22)", 18, 4);
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 16;
    g.strokeRect(8, 8, 496, 240);
    inkText(g, "SERU!", 256, 132, 150, "#FFFFFF", P.inkBlack, 20);
  });

/** Red BOUNCE tag over the trapdoor. */
export const bounceTexture = () =>
  make("bounce", 512, 288, (g) => {
    g.fillStyle = "#D8432E";
    g.fillRect(0, 0, 512, 288);
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 16;
    g.strokeRect(8, 8, 496, 272);
    inkText(g, "KELUAR", 256, 100, 110, "#FFFFFF", P.inkBlack, 16);
    inkText(g, "< 60 DTK", 256, 214, 86, P.accentYellow, P.inkBlack, 14);
  });

/** Front plate of the machine: AUDIRA nameplate + play-days lamps D1 / D2–7 / D8–28. */
export const plateTexture = () =>
  make("plate", 2048, 288, (g) => {
    g.fillStyle = P.metalSteel;
    g.fillRect(0, 0, 2048, 288);
    halftone(g, 2048, 288, "rgba(28,30,33,0.07)", 16, 3);
    // nameplate
    g.fillStyle = P.inkBlack;
    g.beginPath();
    g.roundRect(48, 52, 820, 184, 26);
    g.fill();
    inkText(g, "AUDIRA", 330, 146, 104, P.accentYellow, P.inkBlack, 2);
    g.font = `900 40px ${FONT}`;
    g.fillStyle = P.paperWarm;
    g.textAlign = "left";
    g.fillText("MESIN", 560, 118);
    g.fillText("DISCOVERY", 560, 172);
    // play-day lamps
    const lamps = ["D1", "D2–7", "D8–28"];
    lamps.forEach((l, i) => {
      const x = 1100 + i * 310;
      g.fillStyle = P.inkBlack;
      g.beginPath();
      g.arc(x, 144, 62, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = i === 0 ? "#7CF0B0" : i === 1 ? "#5FD69B" : "#3FAF7C";
      g.beginPath();
      g.arc(x, 144, 50, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.55)";
      g.beginPath();
      g.arc(x - 16, 126, 14, 0, Math.PI * 2);
      g.fill();
      inkText(g, l, x + 130, 144, 56, P.inkBlack, P.inkBlack, 1, false);
    });
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 12;
    g.strokeRect(6, 6, 2036, 276);
  });

/** Grass tile top for the mini game map (stud grid). */
export const grassTexture = () =>
  make("grass", 512, 512, (g) => {
    g.fillStyle = "#7DBB6A";
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(28,30,33,0.18)";
    g.lineWidth = 3;
    for (let i = 0; i <= 8; i++) {
      g.beginPath();
      g.moveTo(i * 64, 0);
      g.lineTo(i * 64, 512);
      g.moveTo(0, i * 64);
      g.lineTo(512, i * 64);
      g.stroke();
    }
    halftone(g, 512, 512, "rgba(40,90,50,0.16)", 16, 3);
  });

/** Paper floor with a faint halftone (comic print). */
export const floorTexture = () => {
  const t = make("floor", 512, 512, (g) => {
    g.fillStyle = P.paperWarm;
    g.fillRect(0, 0, 512, 512);
    halftone(g, 512, 512, "rgba(122,155,184,0.20)", 16, 2.6);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
};
