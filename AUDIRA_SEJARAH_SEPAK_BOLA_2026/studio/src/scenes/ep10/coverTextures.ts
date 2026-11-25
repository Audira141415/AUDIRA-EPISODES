// EP10 cover (CHAINREACTION): canvas textures for the domino faces, the scoreboard, the Brazil
// block, the pitch felt and the AUDIRA plate. Seeded only (no Math.random), system fonts only,
// so every render tab draws identical pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw, repeat?: [number, number]): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  cache.set(key, t);
  return t;
}

const HEAVY = "900 1px 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif";
const font = (px: number) => HEAVY.replace("1px", `${px}px`);

/** Painted speckle so flat paint does not read as CG. */
function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, n: number, dark = 0.05, light = 0.05) {
  const r = prng(seed);
  for (let i = 0; i < n; i++) {
    const up = r() > 0.5;
    ctx.fillStyle = up ? `rgba(255,255,255,${r() * light})` : `rgba(0,0,0,${r() * dark})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

/** Fit a word into maxW by shrinking the heavy font. */
function fitText(ctx: CanvasRenderingContext2D, txt: string, x: number, y: number, maxW: number, px: number) {
  ctx.font = font(px);
  const m = ctx.measureText(txt).width;
  if (m > maxW) ctx.font = font(Math.floor((px * maxW) / m));
  ctx.fillText(txt, x, y);
}

/** Domino face: enamel, trim bands top/bottom, the goal minute as big as the face allows. */
function minuteFace(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, bg: string, ink: string, txt: string) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  speckle(ctx, w, h, seed, 3000);
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, w, 40);
  ctx.fillRect(0, h - 40, w, 40);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fitText(ctx, txt, w / 2 + 8, h * 0.5, w * 0.94, 230);
}

/** Germany domino face: white enamel, black trim, classic pips (the minute sits on its pennant). */
export const dominoFace = (minute: number) =>
  canvasTex(`dom-${minute}`, 368, 560, (ctx, w, h) => {
    ctx.fillStyle = "#F4F1EA";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, minute * 7 + 3, 3000);
    ctx.fillStyle = "#121216";
    ctx.fillRect(0, 0, w, 34);
    ctx.fillRect(0, h - 34, w, 34);
    ctx.fillRect(34, h / 2 - 5, w - 68, 10);
    const pips = (n: number, y0: number) => {
      const lay: Record<number, [number, number][]> = {
        1: [[0.5, 0.5]], 2: [[0.3, 0.3], [0.7, 0.7]], 3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]],
        4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]], 5: [[0.3, 0.3], [0.7, 0.3], [0.5, 0.5], [0.3, 0.7], [0.7, 0.7]],
        6: [[0.3, 0.25], [0.7, 0.25], [0.3, 0.5], [0.7, 0.5], [0.3, 0.75], [0.7, 0.75]],
      };
      for (const [px, py] of lay[n]) {
        ctx.beginPath();
        ctx.arc(px * w, y0 + py * (h / 2 - 34) , 22, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    pips(1 + (minute % 6), 34);
    pips(1 + (Math.floor(minute / 10) % 6), h / 2);
  });

/** Pennant cloth: white with a black hoist stripe, the goal minute in black. */
export const minutePennant = (minute: number) =>
  canvasTex(`pen-${minute}`, 384, 266, (ctx, w, h) => {
    ctx.fillStyle = "#F6F3EC";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, minute * 13, 2200);
    ctx.fillStyle = "#121216";
    ctx.fillRect(0, 0, 34, h);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fitText(ctx, `${minute}'`, w / 2 + 20, h / 2 + 8, w * 0.8, 210);
  });

/** Brazil's lone 90' domino: canary yellow, green number. */
export const brazilDomino = () => canvasTex("dom-90", 368, 560, (ctx, w, h) => minuteFace(ctx, w, h, 90, "#F7D21C", "#0E7A37", "90'"));

/** Big yellow-green block face: BRASIL. */
export const brazilBlockFace = () =>
  canvasTex("brasil-block", 512, 896, (ctx, w, h) => {
    ctx.fillStyle = "#F7D21C";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, 55, 9000, 0.06, 0.06);
    ctx.strokeStyle = "#118A3E";
    ctx.lineWidth = 28;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#0E6F31";
    ctx.font = font(98);
    ctx.fillText("BRASIL", w / 2, 190);
    // green diamond, generic (not a flag replica, no crest)
    ctx.fillStyle = "#118A3E";
    ctx.beginPath();
    ctx.moveTo(w / 2, 330);
    ctx.lineTo(w - 90, 530);
    ctx.lineTo(w / 2, 730);
    ctx.lineTo(90, 530);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#F7D21C";
    ctx.font = font(170);
    ctx.fillText("1", w / 2, 540);
  });

/** Scoreboard LED panel: JERMAN 7 – 1 BRASIL. */
export const scoreboardFace = () =>
  canvasTex("scoreboard", 1600, 640, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#15181C");
    g.addColorStop(1, "#0B0D10");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // LED dot grid
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) ctx.fillRect(x, y, 4, 4);
    ctx.textBaseline = "middle";
    // header strip: tournament stage left, AUDIRA (in-scene brand) right
    ctx.fillStyle = "#2BD46A";
    ctx.fillRect(0, 0, w, 168);
    ctx.fillStyle = "#08130C";
    ctx.font = font(112);
    ctx.textAlign = "left";
    ctx.fillText("SEMIFINAL", 56, 90);
    ctx.textAlign = "right";
    ctx.font = font(104);
    ctx.fillText("AUDIRA", w - 56, 90);
    // team rows
    const row = (y: number, team: string, score: string, col: string) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#F4F1EA";
      ctx.font = font(150);
      ctx.fillText(team, 64, y);
      ctx.textAlign = "right";
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 26;
      ctx.font = font(196);
      ctx.fillText(score, w - 64, y);
      ctx.shadowBlur = 0;
    };
    row(300, "JERMAN", "7", "#FFB547");
    row(518, "BRASIL", "1", "#FFB547");
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(56, 406, w - 112, 6);
  });

/** Pitch felt: mowing stripes plus white chalk lines. 1 texture = whole table top (4 × 5 units). */
export const pitchFelt = () =>
  canvasTex("pitch", 1024, 1280, (ctx, w, h) => {
    const stripes = 10;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 ? "#1E8A45" : "#22974C";
      ctx.fillRect(0, (i * h) / stripes, w, h / stripes + 1);
    }
    // felt fibres
    const r = prng(1407);
    for (let i = 0; i < 60000; i++) {
      ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${r() * 0.05})` : `rgba(0,30,10,${r() * 0.09})`;
      ctx.fillRect(r() * w, r() * h, 1, 1 + r() * 3);
    }
    ctx.strokeStyle = "rgba(244,244,236,0.86)";
    ctx.lineWidth = 9;
    // touchline frame
    ctx.strokeRect(60, 60, w - 120, h - 120);
    // halfway line + centre circle
    ctx.beginPath();
    ctx.moveTo(60, h * 0.5);
    ctx.lineTo(w - 60, h * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.5, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(244,244,236,0.9)";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.5, 12, 0, Math.PI * 2);
    ctx.fill();
    // penalty box at the far end
    ctx.strokeRect(w * 0.22, 60, w * 0.56, 230);
    ctx.strokeRect(w * 0.37, 60, w * 0.26, 90);
    ctx.beginPath();
    ctx.arc(w / 2, 290, 110, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  });

/** Small flag cloth for the foreground corner flag. */
export const cornerFlag = () =>
  canvasTex("corner-flag", 256, 192, (ctx, w, h) => {
    ctx.fillStyle = "#F7D21C";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#118A3E";
    for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 32, h);
    speckle(ctx, w, h, 9, 1500);
  });
