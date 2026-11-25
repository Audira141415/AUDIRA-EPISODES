// Relief data for carved panels, as one RGBA data texture:
//   R = height of the motif (1 = original surface that stays, 0 = background that is cut away),
//       soft-edged so the carving has rounded, hand-cut shoulders
//   G = carve order (0..1): the chisel reaches a texel when the reveal passes G
// Motifs are original (no copied ornament): a Jepara-style floral scroll (stem, volutes, leaves,
// buds) and raised letters for toy blocks.

import * as THREE from "three";
import { fbm, noise2 } from "./wood.ts";

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/** A teardrop leaf from `base` pointing along `ang`, with a carved vein. */
function leaf(g: Ctx, base: Pt, ang: number, len: number, wid: number, curl: number) {
  const [x, y] = base;
  const tip: Pt = [x + Math.cos(ang) * len, y + Math.sin(ang) * len];
  const n: Pt = [-Math.sin(ang), Math.cos(ang)];
  const c1: Pt = [x + Math.cos(ang) * len * 0.45 + n[0] * wid, y + Math.sin(ang) * len * 0.45 + n[1] * wid];
  const c2: Pt = [x + Math.cos(ang) * len * 0.45 - n[0] * wid * 0.7, y + Math.sin(ang) * len * 0.45 - n[1] * wid * 0.7];
  const tipC: Pt = [tip[0] + n[0] * curl, tip[1] + n[1] * curl];
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(c1[0], c1[1], tipC[0], tipC[1]);
  g.quadraticCurveTo(c2[0], c2[1], x, y);
  g.fill();
  // Vein: a thin cut down the middle of the leaf.
  g.strokeStyle = "#000";
  g.lineWidth = Math.max(1.2, wid * 0.12);
  g.beginPath();
  g.moveTo(x + Math.cos(ang) * len * 0.12, y + Math.sin(ang) * len * 0.12);
  g.quadraticCurveTo(x + Math.cos(ang) * len * 0.55 + n[0] * wid * 0.15, y + Math.sin(ang) * len * 0.55 + n[1] * wid * 0.15, tipC[0] * 0.85 + x * 0.15, tipC[1] * 0.85 + y * 0.15);
  g.stroke();
}

/** Spiral volute (the curl at the end of a stem). */
function volute(g: Ctx, c: Pt, r: number, turns: number, dir: 1 | -1, start: number, w: number) {
  g.strokeStyle = "#fff";
  g.lineWidth = w;
  g.lineCap = "round";
  g.beginPath();
  const n = 80;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = start + dir * k * turns * Math.PI * 2;
    const rr = r * (1 - k * 0.82);
    const p: Pt = [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr];
    if (i === 0) g.moveTo(...p);
    else g.lineTo(...p);
  }
  g.stroke();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(c[0] + Math.cos(start + dir * turns * Math.PI * 2) * r * 0.18, c[1] + Math.sin(start + dir * turns * Math.PI * 2) * r * 0.18, w * 0.9, 0, Math.PI * 2);
  g.fill();
}

/** Half of the floral scroll (drawn twice, mirrored, for a symmetric panel). */
function scrollHalf(g: Ctx, W: number, H: number, r: () => number) {
  const cx = W / 2;
  // Main stem: from the centre bottom, sweeping out and up into a big volute.
  const stem: Pt[] = [[cx, H * 0.86], [cx + W * 0.08, H * 0.62], [cx + W * 0.26, H * 0.7], [cx + W * 0.34, H * 0.46]];
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  g.lineWidth = H * 0.048;
  g.beginPath();
  g.moveTo(...stem[0]);
  g.bezierCurveTo(...stem[1], ...stem[2], ...stem[3]);
  g.stroke();
  volute(g, [cx + W * 0.3, H * 0.4], H * 0.14, 1.15, -1, 0.2, H * 0.03);
  // Secondary stem curling down to a small volute.
  g.lineWidth = H * 0.022;
  g.beginPath();
  g.moveTo(cx + W * 0.11, H * 0.64);
  g.bezierCurveTo(cx + W * 0.14, H * 0.42, cx + W * 0.06, H * 0.3, cx + W * 0.13, H * 0.2);
  g.stroke();
  volute(g, [cx + W * 0.16, H * 0.22], H * 0.07, 1.0, 1, Math.PI, H * 0.018);
  // Leaves along the stems.
  const leaves: [number, number, number, number, number][] = [
    [0.04, 0.78, -2.2, 0.17, 0.05], [0.12, 0.6, -0.4, 0.2, 0.06], [0.2, 0.69, 0.5, 0.17, 0.05],
    [0.27, 0.62, -1.2, 0.16, 0.05], [0.38, 0.52, 0.2, 0.15, 0.045], [0.1, 0.45, 2.6, 0.15, 0.045],
    [0.08, 0.3, -2.3, 0.13, 0.04], [0.42, 0.3, -0.9, 0.16, 0.05], [0.22, 0.86, 0.15, 0.2, 0.055],
  ];
  for (const [x, y, a, l, w] of leaves) leaf(g, [cx + W * x, H * y], a + (r() - 0.5) * 0.15, H * l * 2.0, H * w * 1.7, H * 0.04 * (r() - 0.3));
  // Small curling tendrils and a second ring of little leaves fill the ground (Jepara carving is dense).
  for (let i = 0; i < 14; i++) {
    const x = cx + W * (0.03 + r() * 0.42), y = H * (0.14 + r() * 0.74);
    if (r() < 0.5) volute(g, [x, y], H * (0.025 + r() * 0.03), 0.9, r() < 0.5 ? 1 : -1, r() * 6, H * 0.012);
    else leaf(g, [x, y], r() * Math.PI * 2, H * (0.07 + r() * 0.06), H * (0.025 + r() * 0.02), H * 0.02 * (r() - 0.5));
  }
  // Buds (round berries) in clusters.
  g.fillStyle = "#fff";
  for (const [x, y] of [[0.24, 0.32], [0.46, 0.66], [0.04, 0.5]] as Pt[]) {
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.arc(cx + W * x + Math.cos(i * 2.1) * H * 0.025, H * y + Math.sin(i * 2.1) * H * 0.025, H * 0.018, 0, Math.PI * 2);
      g.fill();
    }
  }
}

function drawFrame(g: Ctx, W: number, H: number, inset: number, band: number) {
  g.strokeStyle = "#fff";
  g.lineWidth = band;
  g.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  // Beaded inner moulding.
  g.fillStyle = "#fff";
  const step = band * 1.1;
  const x0 = inset + band * 1.4, x1 = W - inset - band * 1.4;
  const y0 = inset + band * 1.4, y1 = H - inset - band * 1.4;
  for (let x = x0; x <= x1; x += step) for (const y of [y0, y1]) { g.beginPath(); g.arc(x, y, band * 0.28, 0, Math.PI * 2); g.fill(); }
  for (let y = y0; y <= y1; y += step) for (const x of [x0, x1]) { g.beginPath(); g.arc(x, y, band * 0.28, 0, Math.PI * 2); g.fill(); }
}

export type Relief = { tex: THREE.DataTexture; w: number; h: number };
const cache = new Map<string, Relief>();

/** Build the data texture from a drawing function; `order` maps a texel to its carve time. */
function build(key: string, w: number, h: number, draw: (g: Ctx) => void, order: (x: number, y: number) => number, soften = 3): Relief {
  const hit = cache.get(key);
  if (hit) return hit;
  const a = document.createElement("canvas");
  a.width = w;
  a.height = h;
  const ga = a.getContext("2d")!;
  ga.fillStyle = "#000";
  ga.fillRect(0, 0, w, h);
  draw(ga);
  // Blur for rounded shoulders, then re-sharpen the plateau with a smoothstep.
  const bl = document.createElement("canvas");
  bl.width = w;
  bl.height = h;
  const gb = bl.getContext("2d")!;
  gb.filter = `blur(${soften}px)`;
  gb.drawImage(a, 0, 0);
  const px = gb.getImageData(0, 0, w, h).data;
  const data = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const s = px[(j * w + i) * 4] / 255;
      const v = Math.min(1, Math.max(0, (s - 0.18) / 0.55));
      const hgt = v * v * (3 - 2 * v);
      // Data textures are bottom-up: flip so canvas top = uv v 1.
      const o = ((h - 1 - j) * w + i) * 4;
      data[o] = Math.round(hgt * 255);
      data[o + 1] = Math.round(Math.min(1, Math.max(0, order(i / w, j / h))) * 255);
      data[o + 2] = Math.round(fbmTool(i, j) * 255);
      data[o + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  const out = { tex, w, h };
  cache.set(key, out);
  return out;
}
/** B channel: chisel-facet noise, gouge strokes running across the carve direction. */
const fbmTool = (i: number, j: number) => 0.5 + (noise2(i * 0.22 + noise2(i * 0.02, j * 0.02) * 6, j * 0.05) - 0.5) * 0.7;

/** The floral panel. Carving sweeps from the left edge to the right with a ragged front. */
export function floralPanel(seed = 3, w = 768, h = 480): Relief {
  return build(
    `floral:${seed}:${w}`,
    w,
    h,
    (g) => {
      const r = rng(seed * 997 + 1);
      drawFrame(g, w, h, h * 0.035, h * 0.04);
      scrollHalf(g, w, h, r);
      g.save();
      g.translate(w, 0);
      g.scale(-1, 1);
      scrollHalf(g, w, h, rng(seed * 997 + 1));
      g.restore();
      // Central flower (the panel's focus): petals around a raised boss.
      g.fillStyle = "#fff";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        leaf(g, [w / 2 + Math.cos(a) * h * 0.03, h * 0.5 + Math.sin(a) * h * 0.03], a, h * 0.13, h * 0.045, 0);
      }
      g.beginPath();
      g.arc(w / 2, h * 0.5, h * 0.05, 0, Math.PI * 2);
      g.fill();
    },
    (x, y) => 0.03 + 0.92 * Math.min(1, Math.max(0, x + (fbm(x * 4, y * 4, seed) - 0.5) * 0.18 + Math.abs(y - 0.5) * 0.06)),
    3.4,
  );
}

/** A raised letter in a beaded frame (toy block face). Fully carved: order 0 everywhere. */
export function letterRelief(ch: string, size = 256): Relief {
  return build(
    `letter:${ch}:${size}`,
    size,
    size,
    (g) => {
      g.strokeStyle = "#fff";
      g.lineWidth = size * 0.06;
      g.strokeRect(size * 0.07, size * 0.07, size * 0.86, size * 0.86);
      g.fillStyle = "#fff";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `900 ${size * 0.62}px Georgia, 'Times New Roman', serif`;
      g.fillText(ch, size / 2, size * 0.54);
    },
    () => 0,
    2,
  );
}
