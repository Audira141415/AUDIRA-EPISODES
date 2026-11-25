// EP06 film: canvas textures for the film sets (seeded, IM Fell English is loaded by Film.tsx first).
// Facts on the textures: SOURCE_REGISTER #1-#5, #7-#17, #21, #26, #42 (RESEARCH_REPORT.md).
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { FELL, INK, RED_INK, canvasTex, hatch, parchment, text } from "./coverTextures.ts";

const spacing = (ctx: CanvasRenderingContext2D, px: number) => ((ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`);

/** Plain aged parchment (no frame), any aspect. */
export const sheetTex = (key: string, w: number, h: number, seed: number) => canvasTex(`ep06-sheet-${key}`, w, h, (ctx) => parchment(ctx, w, h, seed, true));

/** Ink-only text on a transparent canvas (for left-to-right ink reveals). Returns the texture; aspect = w/h. */
export const inkText = (key: string, s: string, w: number, h: number, size: number, opts: { italic?: boolean; color?: string; spacingPx?: number } = {}) =>
  canvasTex(`ep06-ink-${key}`, w, h, (ctx) => {
    ctx.font = `${opts.italic ? "italic " : ""}${size}px ${FELL}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    spacing(ctx, opts.spacingPx ?? 0);
    ctx.fillStyle = "rgba(60,30,10,0.25)";
    ctx.fillText(s, 14, h / 2 + 3);
    ctx.fillStyle = opts.color ?? INK;
    ctx.fillText(s, 12, h / 2);
    spacing(ctx, 0);
  });

/** Leather book spine with a gilt title (vertical text). */
export const spineTex = (name: string, leather: string, seed: number) =>
  canvasTex(`ep06-spine-${name}`, 256, 1024, (ctx, w, h) => {
    ctx.fillStyle = leather;
    ctx.fillRect(0, 0, w, h);
    const r = prng(seed);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "255,230,200" : "0,0,0"},${0.03 + r() * 0.06})`;
      ctx.fillRect(r() * w, r() * h, 2 + r() * 4, 1 + r() * 3);
    }
    // raised bands
    for (const y of [120, 170, 860, 910]) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, y + 6, w, 10);
      ctx.fillStyle = "#C9A55A";
      ctx.fillRect(0, y, w, 6);
    }
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `128px ${FELL}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const size = Math.min(128, 128 * (620 / Math.max(1, ctx.measureText(name).width)));
    ctx.font = `${size}px ${FELL}`;
    spacing(ctx, 6);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillText(name, 3, 4);
    ctx.fillStyle = "#E8C878";
    ctx.fillText(name, 0, 0);
    spacing(ctx, 0);
    ctx.restore();
  });

/** Open school rulebook (both pages on one canvas). */
export const schoolBookTex = (kind: "rugby" | "eton") =>
  canvasTex(`ep06-school-${kind}`, 1400, 1000, (ctx, w, h) => {
    parchment(ctx, w, h, kind === "rugby" ? 1845 : 1847, true);
    // gutter
    const g = ctx.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0);
    g.addColorStop(0, "rgba(90,55,20,0)");
    g.addColorStop(0.5, "rgba(90,55,20,0.45)");
    g.addColorStop(1, "rgba(90,55,20,0)");
    ctx.fillStyle = g;
    ctx.fillRect(w / 2 - 60, 0, 120, h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, w / 2 - 90, h - 80);
    ctx.strokeRect(w / 2 + 50, 40, w / 2 - 90, h - 80);
    const title = kind === "rugby" ? "RUGBY" : "ETON";
    text(ctx, title, w / 4, 190, 150, { spacing: 10 });
    text(ctx, kind === "rugby" ? "School · 1845" : "College · 1847", w / 4, 280, 64, { italic: true });
    ctx.fillStyle = INK;
    ctx.fillRect(w / 4 - 160, 320, 320, 4);
    // rule lines (illegible body copy)
    const r = prng(kind === "rugby" ? 5 : 9);
    for (let y = 400; y < h - 90; y += 52) {
      ctx.fillStyle = "rgba(42,26,14,0.35)";
      ctx.fillRect(110, y, 300 + r() * 200, 9);
    }
    // right page: the defining rule in red ink, big
    text(ctx, kind === "rugby" ? "the ball" : "hands", (w * 3) / 4, 360, 110, { italic: true, color: RED_INK });
    text(ctx, kind === "rugby" ? "may be carried" : "hardly allowed", (w * 3) / 4, 490, 96, { italic: true, color: RED_INK });
    hatch(ctx, w / 2 + 110, 600, w - 110, h - 110, 12, 0.5, 0.25);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 + 110, 600, w / 2 - 220, h - 710);
  });

/** Debate board: painted wood, two columns. */
export const boardTex = () =>
  canvasTex("ep06-board", 1400, 1000, (ctx, w, h) => {
    const r = prng(41);
    ctx.fillStyle = "#3B2414";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "120,80,45" : "20,10,4"},${0.08 + r() * 0.12})`;
      ctx.fillRect(0, y, w, 2);
    }
    ctx.strokeStyle = "#C9A55A";
    ctx.lineWidth = 14;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    ctx.fillStyle = "#C9A55A";
    ctx.fillRect(w / 2 - 4, 250, 8, h - 300);
    ctx.font = `150px ${FELL}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    spacing(ctx, 14);
    ctx.fillStyle = "#EADBB8";
    ctx.fillText("DEBAT 1863", w / 2, 140);
    spacing(ctx, 4);
    ctx.font = `120px ${FELL}`;
    ctx.fillStyle = "#E58A6A";
    ctx.fillText("BOLEH", w / 4, 330);
    ctx.fillStyle = "#8FE0A8";
    ctx.fillText("DILARANG", (w * 3) / 4, 330);
    spacing(ctx, 0);
    ctx.font = `italic 64px ${FELL}`;
    ctx.fillStyle = "rgba(234,219,184,0.85)";
    ctx.fillText("menendang kaki", w / 2, 520);
    ctx.fillText("membawa bola", w / 2, 760);
  });

/** Signpost arm. */
export const signTex = (key: string, a: string, b: string) =>
  canvasTex(`ep06-sign-${key}`, 1024, 300, (ctx, w, h) => {
    const r = prng(key.length * 31);
    ctx.fillStyle = "#D9C49A";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = `rgba(110,75,40,${0.06 + r() * 0.12})`;
      ctx.fillRect(0, y, w, 2);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    text(ctx, a, w / 2, 135, 100, { spacing: 6 });
    text(ctx, b, w / 2, 245, 74, { italic: true, color: RED_INK });
  });

/** The XIII laws scroll (abridged, wording of the 1863 laws; #7-#14). */
const LAWS13 = [
  "I. Goal: two posts, 8 yards apart.",
  "II. Kick-off: 10 yards from the ball.",
  "III. Change goals after each goal.",
  "IV. A goal at whatever height.",
  "V. Ball out: thrown in straight.",
  "VI. Ahead of the kicker: out of play.",
  "VII. Behind the goal line: a free kick.",
  "VIII. A fair catch: a free kick.",
  "IX. No player shall carry the ball.",
  "X. No tripping nor hacking.",
  "XI. No throwing or passing by hand.",
  "XII. No picking up the ball by hand.",
  "XIII. No nails or iron plates on boots.",
];
export const scrollTex = () =>
  canvasTex("ep06-scroll", 1100, 1500, (ctx, w, h) => {
    parchment(ctx, w, h, 1300, true);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.strokeRect(40, 40, w - 80, h - 80);
    text(ctx, "THE XIII LAWS", w / 2, 150, 92, { spacing: 8 });
    text(ctx, "The Football Association · 1863", w / 2, 220, 48, { italic: true });
    let y = 320;
    for (const line of LAWS13) {
      const [num, ...rest] = line.split(" ");
      text(ctx, num, 210, y, 52, { align: "right", color: RED_INK });
      text(ctx, rest.join(" "), 230, y, 46, { align: "left" });
      y += 88;
    }
  });

/** Tavern facade (stucco, three storeys, lit windows) + its emissive mask. */
const facadeDraw = (emissive: boolean) => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const r = prng(1775);
  if (emissive) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = "#B9A486";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "255,240,210" : "60,40,20"},${0.03 + r() * 0.06})`;
      ctx.fillRect(r() * w, r() * h, 3 + r() * 10, 2 + r() * 6);
    }
    // rusticated ground floor
    for (let y = h * 0.62; y < h; y += 34) {
      ctx.fillStyle = "rgba(50,30,15,0.35)";
      ctx.fillRect(0, y, w, 3);
    }
    // cornices
    for (const y of [h * 0.06, h * 0.33, h * 0.6]) {
      ctx.fillStyle = "#D8C6A6";
      ctx.fillRect(0, y, w, 18);
      ctx.fillStyle = "rgba(40,25,10,0.5)";
      ctx.fillRect(0, y + 18, w, 8);
    }
  }
  const win = (x: number, y: number, ww: number, hh: number, lit: number) => {
    if (emissive) {
      const g = ctx.createLinearGradient(0, y, 0, y + hh);
      g.addColorStop(0, `rgba(255,190,110,${lit})`);
      g.addColorStop(1, `rgba(255,150,70,${lit})`);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, ww, hh);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + ww / 2 - 3, y, 6, hh);
      for (let k = 1; k < 3; k++) ctx.fillRect(x, y + (hh * k) / 3 - 3, ww, 6);
    } else {
      ctx.fillStyle = "#3A2614";
      ctx.fillRect(x - 10, y - 10, ww + 20, hh + 20);
      ctx.fillStyle = "#1A100A";
      ctx.fillRect(x, y, ww, hh);
      ctx.fillStyle = "#D8C6A6";
      ctx.fillRect(x - 16, y - 26, ww + 32, 14);
    }
  };
  const cols = [0.12, 0.31, 0.69, 0.88];
  for (const [row, y, hh] of [[0, 0.1, 0.17], [1, 0.38, 0.17]] as const) {
    for (const cx of cols) win(w * cx - 55, h * y, 110, h * hh, row === 1 ? 0.95 : 0.7);
  }
  win(w * 0.5 - 60, h * 0.1, 120, h * 0.17, 0.8);
  win(w * 0.5 - 70, h * 0.38, 140, h * 0.17, 1);
  // ground floor: door + two bay windows
  for (const cx of [0.18, 0.82]) win(w * cx - 90, h * 0.68, 180, h * 0.2, 0.9);
  if (emissive) {
    ctx.fillStyle = "rgba(255,180,100,0.9)";
    ctx.fillRect(w * 0.5 - 80, h * 0.7, 160, h * 0.3);
  } else {
    ctx.fillStyle = "#2A170C";
    ctx.fillRect(w * 0.5 - 100, h * 0.66, 200, h * 0.34);
    for (const x of [w * 0.5 - 130, w * 0.5 + 100]) {
      ctx.fillStyle = "#E3D3B4";
      ctx.fillRect(x, h * 0.64, 30, h * 0.36);
    }
  }
};
export const facadeTex = () => canvasTex("ep06-facade", 1200, 1100, facadeDraw(false));
export const facadeGlow = () => canvasTex("ep06-facade-glow", 1200, 1100, facadeDraw(true));

/** Neighbour terrace house (brick), with its glow mask. */
const houseDraw = (seed: number, emissive: boolean) => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const r = prng(seed);
  ctx.fillStyle = emissive ? "#000" : "#5A3A28";
  ctx.fillRect(0, 0, w, h);
  if (!emissive)
    for (let y = 0; y < h; y += 14) for (let x = (y / 14) % 2 ? 0 : 20; x < w; x += 40) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "150,90,60" : "40,22,14"},${0.25 + r() * 0.3})`;
      ctx.fillRect(x, y, 38, 12);
    }
  const r2 = prng(seed + 7);
  for (let row = 0; row < 3; row++)
    for (let c = 0; c < 3; c++) {
      const x = 50 + c * 170, y = 70 + row * 300, lit = r2() > 0.45 ? 0.55 + r2() * 0.4 : 0;
      if (emissive) {
        ctx.fillStyle = `rgba(255,170,90,${lit})`;
        ctx.fillRect(x, y, 100, 170);
      } else {
        ctx.fillStyle = "#E3D3B4";
        ctx.fillRect(x - 8, y - 14, 116, 10);
        ctx.fillStyle = "#140C08";
        ctx.fillRect(x, y, 100, 170);
      }
    }
};
export const houseTex = (seed: number) => canvasTex(`ep06-house-${seed}`, 600, 1000, houseDraw(seed, false));
export const houseGlow = (seed: number) => canvasTex(`ep06-house-glow-${seed}`, 600, 1000, houseDraw(seed, true));

/** Wet cobbles. */
export const cobbleTex = () =>
  canvasTex("ep06-cobble", 1024, 1024, (ctx, w, h) => {
    const r = prng(77);
    ctx.fillStyle = "#2A1E16";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32)
      for (let x = (y / 32) % 2 ? 0 : 24; x < w; x += 48) {
        const v = 70 + r() * 50;
        ctx.fillStyle = `rgb(${v},${v * 0.82},${v * 0.66})`;
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 15, 21, 13, 0, 0, Math.PI * 2);
        ctx.fill();
      }
  });

/** The 1863 ground drawn in ink on a big parchment (16 x 12 units; pitch 7 x 4.53 in the middle). */
export const PITCH_W = 7; // 105 m
export const PITCH_D = 4.533; // 68 m
export const M = PITCH_W / 105; // units per metre
export const groundParchTex = () =>
  canvasTex("ep06-ground-1863", 2048, 1536, (ctx, w, h) => {
    parchment(ctx, w, h, 1863, true);
    const s = w / 16; // px per unit
    const cx = w / 2, cy = h / 2;
    const x0 = cx - (PITCH_W / 2) * s, x1 = cx + (PITCH_W / 2) * s, y0 = cy - (PITCH_D / 2) * s, y1 = cy + (PITCH_D / 2) * s;
    hatch(ctx, 0, 0, w, y0 - 40, 16, 0.6, 0.12);
    hatch(ctx, 0, y1 + 40, w, h, 16, 0.6, 0.12);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.setLineDash([24, 18]);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.setLineDash([]);
    // corner flags
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
      ctx.fillStyle = RED_INK;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 34, y - 14);
      ctx.lineTo(x, y - 28);
      ctx.fill();
    }
    text(ctx, "THE GROUND · 1863", cx, y0 - 70, 64, { spacing: 8 });
    text(ctx, "no lines marked · flags at the boundary", cx, y1 + 100, 44, { italic: true });
  });

/** Modern pitch (105 x 68 m), mown stripes + white lines. */
export const pitchModernTex = () =>
  canvasTex("ep06-pitch-modern", 2100, 1360, (ctx, w, h) => {
    const k = w / 105; // px per metre
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 ? "#3F8A3C" : "#4A9A45";
      ctx.fillRect((i * w) / 18, 0, w / 18 + 1, h);
    }
    const r = prng(5);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "120,190,100" : "20,60,20"},${0.05 + r() * 0.08})`;
      ctx.fillRect(r() * w, r() * h, 2, 4);
    }
    ctx.strokeStyle = "#F4F1E6";
    ctx.lineWidth = 0.12 * k * 1.4;
    const m = (x: number) => x * k;
    const pad = ctx.lineWidth / 2;
    ctx.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, m(9.15), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#F4F1E6";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, m(0.3), 0, Math.PI * 2);
    ctx.fill();
    for (const side of [0, 1]) {
      const gx = side ? w : 0, dir = side ? -1 : 1;
      ctx.strokeRect(side ? w - m(16.5) : 0, h / 2 - m(20.16), m(16.5), m(40.32));
      ctx.strokeRect(side ? w - m(5.5) : 0, h / 2 - m(9.16), m(5.5), m(18.32));
      ctx.beginPath();
      ctx.arc(gx + dir * m(11), h / 2, m(0.25), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      const a = Math.acos(5.5 / 9.15);
      if (side) ctx.arc(gx - m(11), h / 2, m(9.15), Math.PI - a, Math.PI + a);
      else ctx.arc(m(11), h / 2, m(9.15), -a, a);
      ctx.stroke();
    }
  });

/** Grass surround (tileable). */
export const grassTex = () =>
  canvasTex("ep06-grass", 512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#3A7D37";
    ctx.fillRect(0, 0, w, h);
    const r = prng(19);
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? "110,180,90" : "20,55,20"},${0.06 + r() * 0.1})`;
      ctx.fillRect(r() * w, r() * h, 2, 4);
    }
  });

/** Cambridge Rules scroll label. */
export const cambridgeTex = () =>
  canvasTex("ep06-cambridge", 900, 1100, (ctx, w, h) => {
    parchment(ctx, w, h, 1856, true);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    text(ctx, "CAMBRIDGE", w / 2, 170, 110, { spacing: 6 });
    text(ctx, "RULES · 1863", w / 2, 280, 78, { spacing: 4 });
    ctx.fillStyle = INK;
    ctx.fillRect(w / 2 - 200, 320, 400, 4);
    text(ctx, "no hacking", w / 2, 480, 92, { italic: true, color: RED_INK });
    text(ctx, "no carrying", w / 2, 610, 92, { italic: true, color: RED_INK });
    const r = prng(3);
    for (let y = 720; y < h - 80; y += 50) {
      ctx.fillStyle = "rgba(42,26,14,0.35)";
      ctx.fillRect(90, y, 420 + r() * 240, 9);
    }
  });

/** Parchment map for the road fork. */
export const mapTex = () =>
  canvasTex("ep06-map", 1600, 1200, (ctx, w, h) => {
    parchment(ctx, w, h, 1871, true);
    hatch(ctx, 0, 0, w, h, 22, 0.7, 0.08);
    // compass rose
    ctx.save();
    ctx.translate(w - 200, 200);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = INK;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -120);
      ctx.lineTo(18, 0);
      ctx.lineTo(-18, 0);
      ctx.fill();
    }
    ctx.restore();
    text(ctx, "1863 → 1871", 260, 130, 64, { italic: true });
  });

export const WOOD_SEED = 12;
export const makeLinear = (t: THREE.Texture) => {
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
};
