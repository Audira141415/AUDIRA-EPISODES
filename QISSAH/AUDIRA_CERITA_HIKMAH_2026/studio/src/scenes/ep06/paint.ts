// Watercolour materials: one seeded "wash" texture (pigment blooms, granulation, soft back-runs)
// multiplied into every flat colour, so each surface reads as a hand-laid wash on cold-press paper.
import * as THREE from "three";

const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

let washTex: THREE.Texture | null = null;
export const wash = () => {
  if (washTex) return washTex;
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const r = prng(4471);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, S, S);
  // soft pigment blooms (darker pools) and lifted areas (lighter), drawn tiled so the texture wraps
  for (let i = 0; i < 70; i++) {
    const x = r() * S, y = r() * S, rad = 30 + r() * 120;
    const dark = r() < 0.62;
    const a = 0.05 + r() * 0.09;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      const gr = g.createRadialGradient(x + ox, y + oy, rad * 0.2, x + ox, y + oy, rad);
      gr.addColorStop(0, dark ? `rgba(40,30,40,${a * 0.6})` : `rgba(255,255,255,${a})`);
      gr.addColorStop(0.82, dark ? `rgba(40,30,40,${a})` : `rgba(255,255,255,0)`);
      gr.addColorStop(1, "rgba(40,30,40,0)");
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x + ox, y + oy, rad, 0, Math.PI * 2);
      g.fill();
    }
  }
  // granulation: fine pigment specks settling in the paper tooth
  const img = g.getImageData(0, 0, S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 22 + (r() < 0.04 ? -26 : 0);
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  washTex = t;
  return t;
};

const cache = new Map<string, THREE.Material>();
/** Matte watercolour wash material for a colour (cached). */
export const paint = (color: string, opts: { opacity?: number; side?: THREE.Side } = {}) => {
  const key = `${color}|${opts.opacity ?? 1}|${opts.side ?? 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      map: wash(),
      roughness: 1,
      metalness: 0,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
      side: opts.side ?? THREE.FrontSide,
    });
    cache.set(key, m);
  }
  return m;
};

/** Graphite pencil line material. */
export const PENCIL = "#3C3733";
let pencilMat: THREE.LineBasicMaterial | null = null;
export const pencil = () => (pencilMat ??= new THREE.LineBasicMaterial({ color: PENCIL, transparent: true, opacity: 0.7 }));

/** Ink hull: a slightly enlarged back-face shell drawn in graphite = a hand-drawn contour. */
let hullMat: THREE.MeshBasicMaterial | null = null;
export const hull = () => (hullMat ??= new THREE.MeshBasicMaterial({ color: "#2f2a27", side: THREE.BackSide }));

export const PAL = {
  paper: "#FAF6EF",
  paperEdge: "#ECE4D6",
  cobalt: "#4E7B9C",
  indigo: "#2E3B5E",
  sage: "#6F9779",
  pine: "#3F6449",
  rose: "#D7837C",
  ochre: "#E8AB48",
  umber: "#7B5943",
  slate: "#5D6B78",
  skin: "#F2D2BC",
  skinShade: "#E2B49B",
};
