// EP02 Khawarizmi: canvas textures for the hook codex. Pseudo-script everywhere except the one
// historical Latin incipit "Dixit algorizmi" (Cambridge UL MS Ii.6.5, SOURCE_REGISTER claims 22-23),
// which is lettered here as a reconstruction, not a facsimile.
import * as THREE from "three";
import { drawPseudoLine } from "../../kits/manuscript/lib/materials";
import { mulberry32 } from "../../kits/manuscript/core/motion";
import { leatherGrain } from "./surfaces";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette";

type Ctx = CanvasRenderingContext2D;
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
const toTex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Parchment with stains, fibres and darker edges. */
export const parchment = (g: Ctx, w: number, h: number, seed: number) => {
  const rnd = mulberry32(seed);
  const grd = g.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.85);
  grd.addColorStop(0, "#EEDDB6");
  grd.addColorStop(0.75, "#DCC395");
  grd.addColorStop(1, "#B8945C");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 10 + rnd() * 80;
    const s = g.createRadialGradient(x, y, 0, x, y, r);
    s.addColorStop(0, `rgba(140,100,55,${0.03 + rnd() * 0.07})`);
    s.addColorStop(1, "rgba(140,100,55,0)");
    g.fillStyle = s;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // fibres
  for (let i = 0; i < 900; i++) {
    g.strokeStyle = `rgba(110,75,40,${rnd() * 0.07})`;
    g.lineWidth = 0.6 + rnd();
    const x = rnd() * w;
    const y = rnd() * h;
    const a = rnd() * Math.PI;
    const l = 4 + rnd() * 16;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(80,55,25,${rnd() * 0.09})`;
    g.fillRect(rnd() * w, rnd() * h, 1.2, 1.2);
  }
  // foxing: rust-brown spots with darker cores, and ink bleed halos along the gutter
  for (let i = 0; i < 70; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 2 + rnd() * 9;
    const f = g.createRadialGradient(x, y, 0, x, y, r);
    f.addColorStop(0, `rgba(120,70,30,${0.25 + rnd() * 0.3})`);
    f.addColorStop(1, "rgba(120,70,30,0)");
    g.fillStyle = f;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 1600; i++) {
    g.strokeStyle = `rgba(90,60,30,${0.05 + rnd() * 0.09})`;
    g.lineWidth = 0.6 + rnd();
    const x = rnd() * w;
    const y = rnd() * h;
    const a = rnd() * Math.PI;
    const l = 6 + rnd() * 22;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  // worn, darker edges
  g.strokeStyle = "rgba(110,70,30,0.35)";
  g.lineWidth = Math.max(6, w * 0.012);
  g.strokeRect(0, 0, w, h);
};

export const vine = (g: Ctx, x: number, H: number, seed: number) => {
  const rnd = mulberry32(seed);
  g.lineWidth = 6;
  for (const [color, off] of [
    [P.lapis, 0],
    [P.rubricRed, 12],
  ] as [string, number][]) {
    g.strokeStyle = color;
    g.beginPath();
    for (let y = 60; y < H - 60; y += 4) g.lineTo(x + off + Math.sin(y * 0.04 + off) * 10, y);
    g.stroke();
  }
  for (let y = 90; y < H - 80; y += 62) {
    g.fillStyle = P.verdigris;
    g.beginPath();
    g.ellipse(x + 22 + rnd() * 6, y, 16, 8, 0.6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.goldLeaf;
    g.beginPath();
    g.arc(x - 8, y + 28, 7, 0, Math.PI * 2);
    g.fill();
  }
};

export const PAGE_W = 1240;
export const PAGE_H = 1720;
/** Initial box on the left page, in canvas px. */
export const INITIAL_BOX = { x: 150, y: 150, s: 400 };

/** Left page: lapis initial box (gold D is a raised plate), the incipit in rubric, then pseudo text. */
export const makeIncipitPage = () => {
  const c = canvas(PAGE_W, PAGE_H);
  const g = c.getContext("2d")!;
  parchment(g, PAGE_W, PAGE_H, 21);
  vine(g, 70, PAGE_H, 4);
  const { x, y, s } = INITIAL_BOX;
  // lapis box with white dot diaper and rubric frame
  g.fillStyle = P.lapis;
  g.fillRect(x, y, s, s);
  g.fillStyle = "rgba(240,235,220,0.55)";
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if ((i + j) % 2 === 0) g.fillRect(x + 22 + i * 38, y + 22 + j * 38, 5, 5);
  g.strokeStyle = P.rubricRed;
  g.lineWidth = 16;
  g.strokeRect(x, y, s, s);
  g.strokeStyle = P.goldDeep;
  g.lineWidth = 4;
  g.strokeRect(x + 14, y + 14, s - 28, s - 28);
  // dark ink edge of the D (the gold plate sits on it, slightly smaller)
  g.fillStyle = "#1E120A";
  g.font = `700 ${s * 0.92}px Georgia, 'Times New Roman', serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 14;
  g.strokeStyle = "#1E120A";
  g.strokeText("D", x + s / 2, y + s * 0.53);
  // incipit in rubric red next to the initial
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillStyle = P.rubricRed;
  g.font = `italic 700 118px Georgia, 'Times New Roman', serif`;
  g.fillText("ixit", x + s + 40, y + 170);
  g.font = `italic 700 104px Georgia, 'Times New Roman', serif`;
  g.fillText("algorizmi", x + s + 40, y + 320);
  // pseudo text block
  for (let i = 0; i < 17; i++) {
    const yy = y + s + 110 + i * 62;
    drawPseudoLine(g, 150, yy, 960, 40, 700 + i, i === 7 ? P.rubricRed : P.ironGallInk);
  }
  return toTex(c);
};

/** Gold "D" alpha for the raised gold-leaf plate (white = gold). */
export const makeInitialD = () => {
  const c = canvas(512, 512);
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.font = `700 ${512 * 0.88}px Georgia, 'Times New Roman', serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("D", 256, 256 * 1.06);
  return toTex(c, false);
};

/** Right page: pseudo-script column and a gold-ruled square diagram (completing the square, claim 18). */
export const makeDiagramPage = () => {
  const c = canvas(PAGE_W, PAGE_H);
  const g = c.getContext("2d")!;
  parchment(g, PAGE_W, PAGE_H, 22);
  vine(g, PAGE_W - 100, PAGE_H, 9);
  for (let i = 0; i < 6; i++) drawPseudoLine(g, 120, 190 + i * 62, 920, 40, 900 + i, i === 0 ? P.rubricRed : P.ironGallInk);
  // diagram: a square with four side strips and corner squares
  const cx = 590;
  const cy = 900;
  const a = 250;
  const b = 80;
  g.fillStyle = "rgba(36,65,140,0.18)";
  g.fillRect(cx - a / 2, cy - a / 2, a, a);
  g.strokeStyle = P.ironGallInk;
  g.lineWidth = 6;
  g.strokeRect(cx - a / 2, cy - a / 2, a, a);
  g.fillStyle = "rgba(176,48,30,0.18)";
  for (const [dx, dy, w, h] of [
    [-a / 2, -a / 2 - b, a, b],
    [-a / 2, a / 2, a, b],
    [-a / 2 - b, -a / 2, b, a],
    [a / 2, -a / 2, b, a],
  ]) {
    g.fillRect(cx + dx, cy + dy, w, h);
    g.strokeRect(cx + dx, cy + dy, w, h);
  }
  g.fillStyle = P.goldLeaf;
  for (const [dx, dy] of [
    [-a / 2 - b, -a / 2 - b],
    [a / 2, -a / 2 - b],
    [-a / 2 - b, a / 2],
    [a / 2, a / 2],
  ]) {
    g.fillRect(cx + dx, cy + dy, b, b);
    g.strokeRect(cx + dx, cy + dy, b, b);
  }
  for (let i = 0; i < 6; i++) drawPseudoLine(g, 120, 1300 + i * 62, 920, 40, 950 + i, P.ironGallInk);
  return toTex(c);
};

/** Leather spine with gold bands and a pseudo-script title block. */
export const makeSpineTexture = (seed: number, base: string) => {
  const c = canvas(64, 256);
  const g = c.getContext("2d")!;
  const rnd = mulberry32(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 300; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`;
    g.fillRect(rnd() * 64, rnd() * 256, 2, 2);
  }
  leatherGrain(g, 64, 256, seed + 3);
  // raised bands
  for (const y of [52, 110, 168]) {
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillRect(0, y + 4, 64, 4);
    g.fillStyle = "rgba(255,220,170,0.18)";
    g.fillRect(0, y, 64, 4);
  }
  g.fillStyle = "#C9973A";
  for (const y of [22, 30, 226, 234]) g.fillRect(4, y, 56, 3);
  // gold-tooled ornaments between the bands: small lozenges and dotted rules
  g.fillStyle = "rgba(214,166,70,0.9)";
  for (const y of [80, 138, 196]) {
    g.beginPath();
    g.moveTo(32, y - 9);
    g.lineTo(41, y);
    g.lineTo(32, y + 9);
    g.lineTo(23, y);
    g.closePath();
    g.fill();
    for (let x = 8; x < 60; x += 6) g.fillRect(x, y - 16, 2, 2);
  }
  g.fillStyle = "rgba(201,151,58,0.8)";
  const n = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) g.fillRect(16 + rnd() * 8, 70 + i * 26, 22 + rnd() * 10, 6);
  return toTex(c);
};

/**
 * Normal map for the raised gold "D": the blurred letter is a height field, so the plate's edges
 * catch the candle like a bevelled, burnished gold-leaf relief instead of flat paint.
 */
export const makeInitialDNormal = () => {
  const S = 512;
  const a = canvas(S, S);
  const ga = a.getContext("2d")!;
  ga.fillStyle = "#000";
  ga.fillRect(0, 0, S, S);
  ga.fillStyle = "#fff";
  ga.font = `700 ${S * 0.88}px Georgia, 'Times New Roman', serif`;
  ga.textAlign = "center";
  ga.textBaseline = "middle";
  ga.fillText("D", S / 2, (S / 2) * 1.06);
  const b = canvas(S, S);
  const gb = b.getContext("2d")!;
  gb.filter = "blur(9px)";
  gb.drawImage(a, 0, 0);
  const h = gb.getImageData(0, 0, S, S).data;
  // fine hammered-leaf noise on top of the bevel
  const rnd = mulberry32(17);
  const noise = new Float32Array(S * S);
  for (let i = 0; i < noise.length; i++) noise[i] = rnd();
  const H = (x: number, y: number) => {
    const xx = Math.max(0, Math.min(S - 1, x));
    const yy = Math.max(0, Math.min(S - 1, y));
    const i = yy * S + xx;
    return h[i * 4] / 255 + noise[i] * 0.025;
  };
  const out = canvas(S, S);
  const go = out.getContext("2d")!;
  const img = go.createImageData(S, S);
  const k = 6;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * k;
      const dy = (H(x, y + 1) - H(x, y - 1)) * k;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  go.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(out);
  t.colorSpace = THREE.NoColorSpace;
  return t;
};

/** Green leather spine with the AUDIRA name gold-stamped (the brand inside the 3D world). */
export const makeAudiraSpine = () => {
  const c = canvas(128, 576);
  const g = c.getContext("2d")!;
  const rnd = mulberry32(2026);
  g.fillStyle = "#0B3D2E";
  g.fillRect(0, 0, 128, 576);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd() * 0.18})`;
    g.fillRect(rnd() * 128, rnd() * 576, 2, 2);
  }
  g.fillStyle = "#D9A436";
  for (const y of [34, 46, 530, 542]) g.fillRect(8, y, 112, 5);
  g.save();
  g.translate(64, 288);
  g.rotate(-Math.PI / 2);
  g.font = "700 64px Georgia, 'Times New Roman', serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  (g as unknown as { letterSpacing: string }).letterSpacing = "10px";
  g.fillText("AUDIRA", 0, 4);
  g.restore();
  return toTex(c);
};
