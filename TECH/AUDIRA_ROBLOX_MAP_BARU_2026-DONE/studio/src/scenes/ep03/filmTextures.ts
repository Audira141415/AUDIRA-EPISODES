// EP03 film textures (ISOCRAFT comic print): callout boards, the creator document, the game card,
// the long menu, the "?" box, the thumbnail card. Drawn once per key and cached; no randomness.
import * as THREE from "three";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette";

const cache = new Map<string, THREE.CanvasTexture>();
const FONT = "'Arial Black', Impact, 'Segoe UI', sans-serif";
export const RED = "#D8432E";

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

function fit(g: CanvasRenderingContext2D, text: string, size: number, maxW: number, italic = true) {
  let s = size;
  for (;;) {
    g.font = `${italic ? "italic " : ""}900 ${s}px ${FONT}`;
    if (g.measureText(text).width <= maxW || s < 20) return s;
    s -= 4;
  }
}

function inkText(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, fill: string, maxW: number, stroke = P.inkBlack) {
  const s = fit(g, text, size, maxW);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineJoin = "round";
  g.lineWidth = s * 0.16;
  g.strokeStyle = stroke;
  g.strokeText(text, x, y);
  g.fillStyle = fill;
  g.fillText(text, x, y);
}

function dots(g: CanvasRenderingContext2D, w: number, h: number, color: string, step = 18, r = 3) {
  g.fillStyle = color;
  for (let y = step / 2; y < h; y += step) for (let x = (y / step) % 2 ? step : step / 2; x < w; x += step) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
}

export type BoardSpec = { tag?: string; title: string; sub?: string; bg?: string; titleColor?: string; subColor?: string };

/** Two-line split for long titles (balanced at the space nearest the middle). */
export function titleRows(title: string): string[] {
  if (title.length <= 14 || !title.includes(" ")) return [title];
  const mid = title.length / 2;
  let best = -1;
  for (let i = 0; i < title.length; i++) if (title[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [title.slice(0, best), title.slice(best + 1)];
}
/** Board texture height for a 1024-wide canvas (Film uses it for the plane aspect). */
export const boardHeight = (b: BoardSpec) => {
  const two = titleRows(b.title).length === 2;
  return b.sub ? (two ? 480 : 384) : two ? 360 : 256;
};

/** Comic callout board: optional number tag, big title (1–2 rows), optional sub line. */
export const boardTexture = (b: BoardSpec) => {
  const h = boardHeight(b);
  const rows = titleRows(b.title);
  return make(`board|${b.tag}|${b.title}|${b.sub}|${b.bg}`, 1024, h, (g) => {
    g.fillStyle = b.bg ?? P.paperWarm;
    g.fillRect(0, 0, 1024, h);
    dots(g, 1024, h, "rgba(28,30,33,0.07)");
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 20;
    g.strokeRect(10, 10, 1004, h - 20);
    const titleH = (b.sub ? h - 130 : h) ;
    const rowH = rows.length === 2 ? 108 : 0;
    const ty = titleH / 2 + (b.sub ? 8 : 0);
    let x0 = 50;
    if (b.tag) {
      g.fillStyle = P.inkBlack;
      g.beginPath();
      g.arc(92, ty, 56, 0, Math.PI * 2);
      g.fill();
      inkText(g, b.tag, 92, ty + 4, 80, P.accentYellow, 90, P.inkBlack);
      x0 = 160;
    }
    const cx = (x0 + 984) / 2;
    rows.forEach((r, i) => inkText(g, r, cx, ty + (i - (rows.length - 1) / 2) * rowH, 118, b.titleColor ?? "#FFFFFF", 984 - x0));
    if (b.sub) inkText(g, b.sub, 512, h - 78, 78, b.subColor ?? P.accentYellow, 940);
  });
};

/** The creator document (generic, no logo): title, lines, a little bar chart. */
export const docTexture = () =>
  make("doc", 768, 960, (g) => {
    g.fillStyle = "#FFFFFF";
    g.fillRect(0, 0, 768, 960);
    g.fillStyle = P.shadowBlue;
    g.fillRect(0, 0, 768, 210);
    dots(g, 768, 210, "rgba(255,255,255,0.15)");
    inkText(g, "DOKUMEN RESMI", 384, 82, 84, "#FFFFFF", 700);
    inkText(g, "UNTUK KREATOR", 384, 160, 56, P.accentYellow, 700);
    g.fillStyle = "rgba(28,30,33,0.55)";
    for (let i = 0; i < 6; i++) g.fillRect(60, 260 + i * 52, i % 3 === 2 ? 420 : 640, 20);
    // chart
    const bars = [0.35, 0.55, 0.8, 0.62, 0.95];
    bars.forEach((v, i) => {
      g.fillStyle = i === 4 ? P.bodyMint : P.bodyCoral;
      g.fillRect(90 + i * 125, 900 - v * 330, 80, v * 330);
      g.strokeStyle = P.inkBlack;
      g.lineWidth = 6;
      g.strokeRect(90 + i * 125, 900 - v * 330, 80, v * 330);
    });
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 22;
    g.strokeRect(11, 11, 746, 938);
  });

/** Generic game card ("GAME BARU") with a blocky landscape. */
export const gameCardTexture = () =>
  make("gamecard", 768, 512, (g) => {
    const sky = g.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, "#7EC8F0");
    sky.addColorStop(1, "#D9F1FF");
    g.fillStyle = sky;
    g.fillRect(0, 0, 768, 512);
    g.fillStyle = "#7DBB6A";
    g.fillRect(0, 330, 768, 182);
    const blocks = [[80, 250, 90], [200, 210, 120], [520, 230, 110], [640, 270, 70]];
    blocks.forEach(([x, y, s], i) => {
      g.fillStyle = [P.bodyCoral, P.accentYellow, P.bodyMint, "#8E6BD8"][i];
      g.fillRect(x, y, s, 330 - y);
      g.strokeStyle = P.inkBlack;
      g.lineWidth = 8;
      g.strokeRect(x, y, s, 330 - y);
    });
    g.fillStyle = "rgba(28,30,33,0.82)";
    g.fillRect(0, 400, 768, 112);
    inkText(g, "GAME BARU", 384, 456, 78, "#FFFFFF", 700);
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 20;
    g.strokeRect(10, 10, 748, 492);
  });

/** Long menu panel (the thing NOT to send new players to). */
export const menuTexture = () =>
  make("menu", 512, 896, (g) => {
    g.fillStyle = "#E7E3DA";
    g.fillRect(0, 0, 512, 896);
    g.fillStyle = P.inkBlack;
    g.fillRect(0, 0, 512, 150);
    inkText(g, "MENU", 256, 78, 96, P.paperWarm, 440);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = i % 2 ? "#CFCAC0" : "#DAD5CB";
      g.fillRect(36, 180 + i * 76, 440, 58);
      g.fillStyle = "rgba(28,30,33,0.45)";
      g.fillRect(60, 200 + i * 76, 180 + ((i * 53) % 160), 18);
    }
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 18;
    g.strokeRect(9, 9, 494, 878);
  });

/** "?" mystery face. */
export const mysteryTexture = () =>
  make("mystery", 256, 256, (g) => {
    g.fillStyle = P.accentYellow;
    g.fillRect(0, 0, 256, 256);
    dots(g, 256, 256, "rgba(224,109,83,0.25)", 16, 3);
    inkText(g, "?", 128, 136, 200, "#FFFFFF", 220);
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 16;
    g.strokeRect(8, 8, 240, 240);
  });

/** Thumbnail card that sinks (teaser for EP04): a bright invented game thumbnail with a blocky avatar. */
export const thumbTexture = () =>
  make("thumb2", 960, 540, (g) => {
    const sky = g.createLinearGradient(0, 0, 0, 540);
    sky.addColorStop(0, "#3FB8F0");
    sky.addColorStop(1, "#BFF0FF");
    g.fillStyle = sky;
    g.fillRect(0, 0, 960, 540);
    // sun burst
    g.fillStyle = "rgba(244,196,48,0.55)";
    for (let i = 0; i < 12; i++) {
      g.beginPath();
      g.moveTo(760, 120);
      const a = (i / 12) * Math.PI * 2;
      g.lineTo(760 + Math.cos(a) * 520, 120 + Math.sin(a) * 520);
      g.lineTo(760 + Math.cos(a + 0.18) * 520, 120 + Math.sin(a + 0.18) * 520);
      g.fill();
    }
    g.fillStyle = "#6CC24A";
    g.fillRect(0, 400, 960, 140);
    const ink = (x: number, y: number, w: number, h: number, c: string) => {
      g.fillStyle = c;
      g.fillRect(x, y, w, h);
      g.strokeStyle = P.inkBlack;
      g.lineWidth = 8;
      g.strokeRect(x, y, w, h);
    };
    ink(560, 250, 110, 150, P.bodyCoral);
    ink(680, 200, 120, 200, P.accentYellow);
    ink(810, 290, 110, 110, "#8E6BD8");
    // blocky avatar
    ink(170, 110, 100, 100, "#F5CD30"); // head
    g.fillStyle = P.inkBlack;
    g.fillRect(195, 145, 14, 22);
    g.fillRect(232, 145, 14, 22);
    g.beginPath();
    g.arc(220, 178, 18, 0.15 * Math.PI, 0.85 * Math.PI);
    g.lineWidth = 6;
    g.stroke();
    ink(135, 212, 170, 150, "#0D69AC"); // torso
    ink(60, 140, 72, 150, "#F5CD30"); // raised arm
    ink(308, 212, 72, 150, "#F5CD30"); // arm
    ink(140, 364, 78, 110, "#A4BD47");
    ink(222, 364, 78, 110, "#A4BD47");
    inkText(g, "MAP BARU!", 640, 96, 120, "#FFFFFF", 560);
    g.strokeStyle = P.inkBlack;
    g.lineWidth = 22;
    g.strokeRect(11, 11, 938, 518);
  });
