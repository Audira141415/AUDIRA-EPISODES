// The sand sculpture as a set of parts (boxes and ellipsoids) baked in world space, with per-vertex
// data cached once so a frame's shape is cheap arithmetic on the CPU:
//   - the sculpting ceiling: vertices above it collapse onto a lumpy lid (formation and crumbling);
//   - erosion: each vertex is pulled toward its part's axis, more at corners, edges and the top,
//     along wind gullies, so crisp carved edges round off and sag.
// The shape is original: a stepped plinth with the name AUDIRA carved in front, a candi-like gate of
// two pillars with stepped crowns and a lintel, and a sea turtle (penyu) resting before the gate.

import * as THREE from "three";
import { fbm3, noise3, noise2, smoothstep, type V3 } from "./noise.ts";

/** Surface finish selects the tool marks in the shader. */
export const SURF = { plain: 0, pillar: 1, shell: 2, skin: 3, plinth: 4 } as const;

export type Part = {
  name: string;
  kind: "box" | "ell";
  c: V3;
  /** Half extents (boxes) or radii (ellipsoids). */
  h: V3;
  rotY?: number;
  surf: number;
  /** How hard erosion bites (1 = normal). */
  soft?: number;
};

const P_HX = 0.85; // pillar x
const GZ = -0.3; // gate z

const crown = (name: string, x: number, base: number, w: number, z: number = GZ): Part[] => {
  const steps: [number, number][] = [[w * 1.22, 0.06], [w * 0.94, 0.07], [w * 0.68, 0.07], [w * 0.42, 0.08]];
  const out: Part[] = [];
  let y = base;
  steps.forEach(([hw, hh], i) => {
    out.push({ name: `${name}-${i}`, kind: "box", c: [x, y + hh, z], h: [hw, hh, hw], surf: SURF.plain, soft: 1.15 });
    y += hh * 2;
  });
  out.push({ name: `${name}-finial`, kind: "ell", c: [x, y + 0.06, z], h: [w * 0.3, 0.1, w * 0.3], surf: SURF.skin, soft: 1.3 });
  return out;
};

export const PARTS: Part[] = [
  { name: "plinth", kind: "box", c: [0, 0.175, 0], h: [1.5, 0.175, 1.2], surf: SURF.plinth, soft: 0.6 },
  { name: "tier", kind: "box", c: [0, 0.5, GZ], h: [1.3, 0.15, 0.62], surf: SURF.plain, soft: 0.75 },
  { name: "base-L", kind: "box", c: [-P_HX, 0.7, GZ], h: [0.34, 0.05, 0.34], surf: SURF.plain },
  { name: "base-R", kind: "box", c: [P_HX, 0.7, GZ], h: [0.34, 0.05, 0.34], surf: SURF.plain },
  { name: "pillar-L", kind: "box", c: [-P_HX, 1.425, GZ], h: [0.28, 0.675, 0.28], surf: SURF.pillar },
  { name: "pillar-R", kind: "box", c: [P_HX, 1.425, GZ], h: [0.28, 0.675, 0.28], surf: SURF.pillar },
  ...crown("crown-L", -P_HX, 2.1, 0.28),
  ...crown("crown-R", P_HX, 2.1, 0.28),
  { name: "lintel", kind: "box", c: [0, 1.94, GZ], h: [0.6, 0.13, 0.22], surf: SURF.plain, soft: 1.1 },
  { name: "lintel-1", kind: "box", c: [0, 2.12, GZ], h: [0.42, 0.05, 0.19], surf: SURF.plain, soft: 1.2 },
  { name: "lintel-2", kind: "box", c: [0, 2.24, GZ], h: [0.26, 0.07, 0.15], surf: SURF.plain, soft: 1.2 },
  { name: "lintel-3", kind: "ell", c: [0, 2.38, GZ], h: [0.12, 0.09, 0.1], surf: SURF.skin, soft: 1.3 },
  // Penyu (sea turtle) on the plinth, swimming toward +x.
  { name: "shell", kind: "ell", c: [0.02, 0.35, 0.78], h: [0.52, 0.25, 0.34], surf: SURF.shell, soft: 0.8 },
  { name: "head", kind: "ell", c: [0.64, 0.43, 0.78], h: [0.17, 0.1, 0.11], surf: SURF.skin, soft: 1.1 },
  { name: "flip-FL", kind: "ell", c: [0.36, 0.38, 1.1], h: [0.27, 0.045, 0.1], rotY: -0.55, surf: SURF.skin },
  { name: "flip-FR", kind: "ell", c: [0.36, 0.38, 0.46], h: [0.27, 0.045, 0.1], rotY: 0.55, surf: SURF.skin },
  { name: "flip-BL", kind: "ell", c: [-0.44, 0.37, 1.02], h: [0.15, 0.04, 0.07], rotY: 0.6, surf: SURF.skin },
  { name: "flip-BR", kind: "ell", c: [-0.44, 0.37, 0.54], h: [0.15, 0.04, 0.07], rotY: -0.6, surf: SURF.skin },
];

/** Where the carved name sits on the plinth front face (world x/y range). */
export const NAME_RECT = { x0: -1.02, x1: 0.98, y0: 0.05, y1: 0.3, z: 1.2 };

export type PartMesh = {
  part: Part;
  geo: THREE.BufferGeometry;
  orig: Float32Array;
  /** Per vertex: erosion bite (metres at erode 1), ceiling noise (-1..1), lid lump (-1..1). */
  bite: Float32Array;
  ceilN: Float32Array;
  lump: Float32Array;
  bottom: number;
  top: number;
  maxCeilN: number;
  minCeilN: number;
};

/** Ceiling noise depends on xz only, so a sinking ceiling bites whole columns irregularly. */
export const ceilNoise = (x: number, z: number) => (noise2(x * 1.9, z * 1.9, 5) - 0.5) * 2.2 + (noise2(x * 6, z * 6, 6) - 0.5) * 0.5;

const DENS = 34; // segments per metre on boxes

export function buildPart(part: Part): PartMesh {
  let geo: THREE.BufferGeometry;
  const [hx, hy, hz] = part.h;
  if (part.kind === "box") {
    const s = (v: number) => Math.max(2, Math.round(v * 2 * DENS));
    geo = new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2, s(hx), s(hy), s(hz));
  } else {
    const big = Math.max(hx, hz);
    geo = new THREE.SphereGeometry(1, big > 0.3 ? 128 : 64, big > 0.3 ? 64 : 32);
    geo.scale(hx, hy, hz);
    if (part.rotY) geo.rotateY(part.rotY);
  }
  geo.translate(...part.c);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const n = pos.count;
  const orig = new Float32Array(pos.array as Float32Array);
  const bite = new Float32Array(n), ceilN = new Float32Array(n), lump = new Float32Array(n);
  const [cx, cy, cz] = part.c;
  const hmin = Math.min(hx, hz);
  const soft = part.soft ?? 1;
  let maxC = -9, minC = 9;
  for (let i = 0; i < n; i++) {
    const x = orig[i * 3], y = orig[i * 3 + 1], z = orig[i * 3 + 2];
    const rx = (x - cx) / hx, ry = (y - cy) / hy, rz = (z - cz) / hz;
    const nA = fbm3(x * 3.1, y * 3.1, z * 3.1, 2, 3);
    const gully = noise3(x * 6, y * 1.6, z * 6, 8);
    const top = smoothstep(-1, 1, ry);
    let corner = 0;
    if (part.kind === "box") {
      const ex = smoothstep(0.5, 1, Math.abs(rx)), ez = smoothstep(0.5, 1, Math.abs(rz)), ey = smoothstep(0.55, 1, ry);
      corner = ex * ez + 0.7 * ey * Math.max(ex, ez);
    }
    let b = ((0.018 + 0.08 * nA) * (0.3 + 0.95 * top) + 0.1 * corner + 0.025 * smoothstep(0.55, 0.9, gully)) * soft;
    b = Math.min(b, hmin * 0.55);
    bite[i] = b;
    const c = ceilNoise(x, z);
    ceilN[i] = c;
    maxC = Math.max(maxC, c);
    minC = Math.min(minC, c);
    lump[i] = (fbm3(x * 16, 0.5, z * 16, 9, 3) - 0.5) * 2;
  }
  return {
    part, geo, orig, bite, ceilN, lump,
    bottom: part.kind === "box" ? cy - hy : cy - hy * 0.2,
    top: cy + hy, maxCeilN: maxC, minCeilN: minC,
  };
}

/**
 * Write this frame's shape into the geometry. Returns false when the part is entirely above the
 * ceiling (not yet formed, or crumbled away): hide the mesh.
 */
export function shapePart(pm: PartMesh, ceil: { y: number; amp: number }, erode: number): boolean {
  const { part, orig, bite, ceilN, lump } = pm;
  if (ceil.y + pm.maxCeilN * ceil.amp < pm.bottom + 0.004) return false;
  const pos = pm.geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const [cx, , cz] = part.c;
  const [hx, , hz] = part.h;
  const hmin = Math.min(hx, hz);
  const n = pos.count;
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const x0 = orig[o], y0 = orig[o + 1], z0 = orig[o + 2];
    const f = 1 - (erode * bite[i]) / hmin;
    arr[o] = cx + (x0 - cx) * f;
    arr[o + 2] = cz + (z0 - cz) * f;
    const ch = ceil.y + ceilN[i] * ceil.amp;
    arr[o + 1] = y0 > ch ? Math.max(pm.bottom, Math.min(y0, ch + lump[i] * 0.018)) : y0;
  }
  pos.needsUpdate = true;
  pm.geo.computeBoundingSphere();
  return true;
}

/** Highest solid surface under (x, z) below height `below` among the flat tops (ledges catch grains). */
export function ledgeAt(x: number, z: number, below: number): number {
  let best = -1;
  for (const p of PARTS) {
    if (p.kind !== "box") continue;
    const top = p.c[1] + p.h[1];
    if (top > below) continue;
    if (Math.abs(x - p.c[0]) < p.h[0] * 0.92 && Math.abs(z - p.c[2]) < p.h[2] * 0.92) best = Math.max(best, top);
  }
  return best;
}

// --- Carved name -------------------------------------------------------------------------------
let nameTex: THREE.CanvasTexture | null = null;
/** Mask for the engraved name (white = cut in), slightly blurred for a rounded chisel profile. */
export function nameTexture(): THREE.CanvasTexture {
  if (nameTex) return nameTex;
  const W = 1024, H = 128;
  const a = document.createElement("canvas");
  a.width = W;
  a.height = H;
  const g = a.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 ${H * 0.78}px Georgia, 'Times New Roman', serif`;
  const word = "AUDIRA";
  const spacing = W * 0.135;
  for (let i = 0; i < word.length; i++) g.fillText(word[i], W / 2 + (i - (word.length - 1) / 2) * spacing, H * 0.55);
  // Two carved rules above and below the letters.
  g.fillRect(W * 0.04, H * 0.04, W * 0.92, H * 0.035);
  g.fillRect(W * 0.04, H * 0.925, W * 0.92, H * 0.035);
  const b = document.createElement("canvas");
  b.width = W;
  b.height = H;
  const gb = b.getContext("2d")!;
  gb.filter = "blur(2px)";
  gb.drawImage(a, 0, 0);
  nameTex = new THREE.CanvasTexture(b);
  nameTex.minFilter = THREE.LinearMipmapLinearFilter;
  nameTex.anisotropy = 8;
  nameTex.needsUpdate = true;
  return nameTex;
}
