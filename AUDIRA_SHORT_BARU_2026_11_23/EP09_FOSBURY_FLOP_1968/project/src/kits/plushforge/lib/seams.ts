// PLUSHFORGE geometry: stuffed panels and sewn seams.
// - seamSphere(): a sphere sewn from `gores` panels (like a plush head or limb). Each panel bulges
//   with stuffing and every seam is pinched inward, so the silhouette shows the seams too. Matches
//   plushMaps() with the same gores/phase/equator (seams drawn at u = k/gores + phase).
// - pillowGeometry(): one stuffed half of a pillow (front or back), corners pinched, waist drawn in.
// - heartPoint(): the felt heart patch outline (classic heart curve), bent onto a body.
// - quiltHeight(): the quilted blanket surface: puffy squares, valleys on the quilting lines.

import * as THREE from "three";

const cache = new Map<string, THREE.BufferGeometry>();

/** Panel phase that puts the middle of a panel at the front (+z), so the face sits on one panel. */
export const frontPanel = (gores: number) => 0.25 + 0.5 / gores;
/** Panel phase that puts a seam down the front centre (+z). */
export const frontSeam = () => 0.25;

export function seamSphere(r: number, gores = 6, phase = 0, equator = false, pinch = 0.05, bulge = 0.03, ws = 72, hs = 44): THREE.BufferGeometry {
  const key = `${r}:${gores}:${phase}:${equator}:${pinch}:${bulge}:${ws}:${hs}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const g = new THREE.SphereGeometry(r, ws, hs);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const w = 0.075 * r;
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    const theta = (1 - v) * Math.PI;
    const s = Math.sin(theta);
    let seam = 0, panel = 1;
    if (gores > 0) {
      const q = ((((u - phase) * gores) % 1) + 1) % 1;
      const d = (Math.min(q, 1 - q) / gores) * Math.PI * 2 * r * s;
      seam = Math.exp(-((d / w) ** 2)) * Math.min(1, s * 4);
      panel = Math.sin(Math.PI * q);
    }
    if (equator) {
      const dE = Math.abs(theta - Math.PI / 2) * r;
      seam = Math.max(seam, Math.exp(-((dE / w) ** 2)));
      panel *= Math.abs(Math.sin(theta * 2));
    }
    const k = 1 - pinch * seam + bulge * panel * s;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
  }
  g.computeVertexNormals();
  cache.set(key, g);
  return g;
}

/** A point on a unit-ish sphere of radius r: yaw from +z toward +x, pitch up (radians). */
export const onSphere = (r: number, yaw: number, pitch: number): [number, number, number] => [
  r * Math.sin(yaw) * Math.cos(pitch),
  r * Math.sin(pitch),
  r * Math.cos(yaw) * Math.cos(pitch),
];

/** Quaternion turning +z to the given direction (for buttons, patches and stitches on a surface). */
export const faceAlong = (d: [number, number, number]) =>
  new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...d).normalize());

/**
 * One stuffed half of a pillow, width w (x) by height h (y), puffing out to `puff` along +z
 * (side = 1 front, -1 back). uv: u left→right, v top→bottom (use textures with flipY off).
 */
export function pillowGeometry(w: number, h: number, puff: number, side: 1 | -1, nx = 64, ny = 40): THREE.BufferGeometry {
  const key = `pillow:${w}:${h}:${puff}:${side}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const pos: number[] = [], uvs: number[] = [], idx: number[] = [];
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const u = i / nx, v = j / ny;
      const a = u * 2 - 1, b = v * 2 - 1;
      // Waist drawn in at mid-edges (corners poke out like a real stuffed pillow).
      const x = a * (w / 2) * (1 - 0.05 * (1 - b * b));
      const y = -b * (h / 2) * (1 - 0.07 * (1 - a * a));
      const z = puff * Math.sqrt(Math.max(0, 1 - a ** 8)) * Math.sqrt(Math.max(0, 1 - b ** 8)) * (1 - 0.25 * a * a * b * b) * side;
      // A few soft dimples where the stuffing settled.
      const dim = 1 - 0.06 * Math.exp(-((a - 0.35) ** 2 + (b + 0.2) ** 2) * 18) - 0.05 * Math.exp(-((a + 0.5) ** 2 + (b - 0.3) ** 2) * 14);
      pos.push(x, y, z * dim);
      uvs.push(u, v);
    }
  }
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const p = j * (nx + 1) + i;
      if (side === 1) idx.push(p, p + nx + 1, p + 1, p + 1, p + nx + 1, p + nx + 2);
      else idx.push(p, p + 1, p + nx + 1, p + 1, p + nx + 2, p + nx + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  cache.set(key, g);
  return g;
}

/** The pillow's piped edge seam as a closed curve (same outline as pillowGeometry at z = 0). */
export function pillowEdge(w: number, h: number, n = 160): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k < n; k++) {
    const t = (k / n) * Math.PI * 2;
    // Superellipse outline with the same waist.
    const ca = Math.cos(t), sa = Math.sin(t);
    const a = Math.sign(ca) * Math.pow(Math.abs(ca), 0.25), b = Math.sign(sa) * Math.pow(Math.abs(sa), 0.25);
    pts.push(new THREE.Vector3(a * (w / 2) * (1 - 0.05 * (1 - b * b)), -b * (h / 2) * (1 - 0.07 * (1 - a * a)), 0));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

/**
 * Felt heart patch outline at curve parameter s (0 = top notch, π = bottom tip, increasing clockwise
 * through the right lobe). `size` = width; `inset` moves the point toward the centre; the patch is
 * bent onto a body of radius `bend` (z drops with distance from the centre).
 */
export function heartPoint(s: number, size: number, inset = 0, bend = 0.15, lift = 0.004): [number, number, number] {
  const k = size / 32;
  let x = 16 * Math.pow(Math.sin(s), 3) * k;
  let y = (13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s)) * k + 2 * k;
  if (inset) {
    const l = Math.hypot(x, y) || 1;
    x -= (x / l) * inset;
    y -= (y / l) * inset;
  }
  return [x, y, lift - (x * x + y * y) / (2 * bend)];
}

/** Heart patch as a flat ShapeGeometry bent onto the body (same outline as heartPoint). */
export function heartGeometry(size: number, bend = 0.15): THREE.BufferGeometry {
  const key = `heart:${size}:${bend}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const shape = new THREE.Shape();
  for (let i = 0; i < 96; i++) {
    const [x, y] = heartPoint((i / 96) * Math.PI * 2, size, 0, bend);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 4 });
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) - (x * x + y * y) / (2 * bend));
  }
  // Planar uv from x/y so a felt texture tiles across it.
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) * 8, pos.getY(i) * 8);
  g.computeVertexNormals();
  // The front cap is a few large triangles: give it the exact normals of the bend so it shades smoothly.
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  const n = new THREE.Vector3();
  for (let i = 0; i < nrm.count; i++) {
    if (nrm.getZ(i) < 0.6) continue;
    n.set(pos.getX(i) / bend, pos.getY(i) / bend, 1).normalize();
    nrm.setXYZ(i, n.x, n.y, n.z);
  }
  cache.set(key, g);
  return g;
}

// --- Quilted blanket ---------------------------------------------------------------------------
export const QUILT = { x0: -1.5, x1: 1.5, z0: -1.35, z1: 1.05, cell: 0.3, edgeX: 1.22, edgeZ: 0.98 };
export type Dent = { x: number; z: number; r: number; d: number };

/** Blanket surface height and drape at (x, z); dents are soft hollows where toys sit. */
export function quiltPoint(x: number, z: number, dents: Dent[]): [number, number, number] {
  const fx = (x - QUILT.x0) / QUILT.cell, fz = (z - QUILT.z0) / QUILT.cell;
  const a = fx - Math.floor(fx), b = fz - Math.floor(fz);
  const puff = 0.026 * Math.pow(Math.sin(Math.PI * a), 0.55) * Math.pow(Math.sin(Math.PI * b), 0.55);
  const wrinkle = 0.012 * Math.sin(1.7 * x + 2.3 * z + 0.5) + 0.007 * Math.sin(3.1 * x - 1.2 * z + 1.3);
  let y = puff + wrinkle;
  for (const d of dents) y -= d.d * Math.exp(-((x - d.x) ** 2 + (z - d.z) ** 2) / (d.r * d.r));
  // Drape over the mattress edge: fold down at the sides and the foot.
  const ox = Math.max(0, Math.abs(x) - QUILT.edgeX), oz = Math.max(0, z - QUILT.edgeZ);
  let px = x, pz = z;
  if (ox > 0) {
    px = Math.sign(x) * (QUILT.edgeX + 0.07 * Math.sin(Math.min(1, ox / 0.11) * Math.PI / 2));
    y -= Math.max(0, ox - 0.05) * 1.05 + ox * 0.25;
  }
  if (oz > 0) {
    pz = QUILT.edgeZ + 0.07 * Math.sin(Math.min(1, oz / 0.11) * Math.PI / 2);
    y -= Math.max(0, oz - 0.05) * 1.05 + oz * 0.25;
  }
  return [px, y, pz];
}
