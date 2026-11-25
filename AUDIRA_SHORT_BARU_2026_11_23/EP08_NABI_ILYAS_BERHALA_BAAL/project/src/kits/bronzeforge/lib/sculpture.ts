// The statue: an original stylised rising bird on a rock, written as one signed distance field
// (smooth unions of ellipsoids and round cones), polygonised with marching cubes, then shaded with
// per-vertex data measured from the same field:
//   aCav   0..1  occlusion (crevices between feathers, eye sockets, the joint of wing and body)
//   aConv  0..1  convexity (raised edges and ridges that stay rubbed bright on an old statue)
//   aThick 0..1  local thickness (thin feathers cool first, the body stays hot longest)
// Normals come from the analytic field gradient, so the metal reflections are smooth and the chest
// feather ripples read even where the mesh is coarser than the detail.
//
//   const geo = birdGeometry();   // cached; local origin = centre of the base, y up, faces +z

import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type V3 = [number, number, number];

// --- Field primitives ---------------------------------------------------------------------------
const len3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);
const norm = (v: V3): V3 => {
  const l = len3(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** iq ellipsoid bound (good near the surface). */
function ellipsoid(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
  const k0 = len3(x / rx, y / ry, z / rz);
  const k1 = len3(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return (k0 * (k0 - 1)) / (k1 || 1e-6);
}

/** Oriented ellipsoid: long axis a→b, thickness along n, width across both. */
type Blade = { c: V3; u: V3; v: V3; w: V3; rl: number; rt: number; rw: number };
function blade(a: V3, b: V3, n: V3, width: number, thick: number): Blade {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const L = len3(d[0], d[1], d[2]);
  const u = norm(d);
  const nn = norm(n);
  const k = dot(nn, u);
  const v = norm([nn[0] - u[0] * k, nn[1] - u[1] * k, nn[2] - u[2] * k]);
  const w = cross(u, v);
  return { c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], u, v, w, rl: L / 2, rt: thick, rw: width };
}
function sdBlade(b: Blade, x: number, y: number, z: number) {
  const dx = x - b.c[0], dy = y - b.c[1], dz = z - b.c[2];
  const lu = dx * b.u[0] + dy * b.u[1] + dz * b.u[2];
  const lv = dx * b.v[0] + dy * b.v[1] + dz * b.v[2];
  const lw = dx * b.w[0] + dy * b.w[1] + dz * b.w[2];
  // Taper toward the far end: a feather is wider near its root than at its tip.
  const taper = 1 - 0.35 * Math.max(0, Math.min(1, (lu / b.rl + 1) / 2));
  return ellipsoid(lw, lv, lu, b.rw * taper, b.rt, b.rl);
}

/** iq round cone between a (radius r1) and b (radius r2). */
type Cone = { a: V3; ba: V3; l2: number; rr: number; a2: number; il2: number; r1: number; r2: number };
function cone(a: V3, b: V3, r1: number, r2: number): Cone {
  const ba: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const l2 = dot(ba, ba);
  const rr = r1 - r2;
  return { a, ba, l2, rr, a2: l2 - rr * rr, il2: 1 / l2, r1, r2 };
}
function sdCone(c: Cone, x: number, y: number, z: number) {
  const pa: V3 = [x - c.a[0], y - c.a[1], z - c.a[2]];
  const yy = dot(pa, c.ba);
  const zz = yy - c.l2;
  const xv: V3 = [pa[0] * c.l2 - c.ba[0] * yy, pa[1] * c.l2 - c.ba[1] * yy, pa[2] * c.l2 - c.ba[2] * yy];
  const x2 = dot(xv, xv);
  const y2 = yy * yy * c.l2;
  const z2 = zz * zz * c.l2;
  const k = Math.sign(c.rr) * c.rr * c.rr * x2;
  if (Math.sign(zz) * c.a2 * z2 > k) return Math.sqrt(x2 + z2) * c.il2 - c.r2;
  if (Math.sign(yy) * c.a2 * y2 < k) return Math.sqrt(x2 + y2) * c.il2 - c.r1;
  return (Math.sqrt(x2 * c.a2 * c.il2) + yy * c.rr) * c.il2 - c.r1;
}

// Seeded 3D value noise for the rock base.
const hash3 = (x: number, y: number, z: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
function noise3(x: number, y: number, z: number) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, k: number) => a + (b - a) * k;
  const c = (dx: number, dy: number, dz: number) => hash3(ix + dx, iy + dy, iz + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), ux), l(c(0, 1, 0), c(1, 1, 0), ux), uy),
    l(l(c(0, 0, 1), c(1, 0, 1), ux), l(c(0, 1, 1), c(1, 1, 1), ux), uy),
    uz,
  );
}

// --- The bird -----------------------------------------------------------------------------------
type Part = { blades: Blade[]; cones: Cone[]; bound: V3; radius: number; k: number };

function wing(s: 1 | -1): Part {
  const S: V3 = [s * 0.08, 0.58, -0.03];
  const E: V3 = [s * 0.25, 0.75, -0.07];
  const T: V3 = [s * 0.42, 1.0, -0.14];
  const cones = [cone(S, E, 0.05, 0.034), cone(E, T, 0.034, 0.014)];
  const blades: Blade[] = [];
  const n: V3 = [s * 0.5, 0.12, 1];
  const N = 9;
  for (let i = 0; i < N; i++) {
    const k = 0.12 + (i / (N - 1)) * 0.88;
    // Anchor along the leading edge (S→E for the first 45 %, then E→T).
    const A: V3 = k < 0.45
      ? [S[0] + (E[0] - S[0]) * (k / 0.45), S[1] + (E[1] - S[1]) * (k / 0.45), S[2] + (E[2] - S[2]) * (k / 0.45)]
      : [E[0] + (T[0] - E[0]) * ((k - 0.45) / 0.55), E[1] + (T[1] - E[1]) * ((k - 0.45) / 0.55), E[2] + (T[2] - E[2]) * ((k - 0.45) / 0.55)];
    // Inner feathers hang down and out, outer primaries fan up past the tip.
    const ang = -1.25 + k * 2.35; // radians from straight out, in the wing plane
    const dir = norm([s * Math.cos(ang) * 0.9, Math.sin(ang), -0.32 - k * 0.1]);
    const L = 0.2 + k * 0.13;
    const B: V3 = [A[0] + dir[0] * L, A[1] + dir[1] * L, A[2] + dir[2] * L];
    const A2: V3 = [A[0] - dir[0] * 0.03, A[1] - dir[1] * 0.03, A[2] - dir[2] * 0.03];
    blades.push(blade(A2, B, n, 0.043 + 0.008 * Math.sin(i * 1.7), 0.017));
  }
  return { blades, cones, bound: [s * 0.3, 0.76, -0.12], radius: 0.46, k: 0.007 };
}

function tail(): Part {
  const blades: Blade[] = [];
  const xs = [-0.11, -0.04, 0.04, 0.11];
  xs.forEach((x, i) => {
    const a: V3 = [x * 0.25, 0.37, -0.09];
    const b: V3 = [x, 0.12 + Math.abs(x) * 0.5, -0.36 - (i % 2) * 0.03];
    blades.push(blade(a, b, [0, 0.74, -0.68], 0.042, 0.015));
  });
  return { blades, cones: [], bound: [0, 0.25, -0.24], radius: 0.28, k: 0.008 };
}

function head(): Part {
  const blades: Blade[] = [];
  // Crest: three swept feathers.
  for (let i = 0; i < 3; i++) {
    const a: V3 = [0, 0.88 - i * 0.012, 0.13 - i * 0.03];
    const b: V3 = [0, 0.99 - i * 0.04, 0.02 - i * 0.06];
    blades.push(blade(a, b, [1, 0, 0], 0.026, 0.012));
  }
  const cones = [cone([0, 0.56, 0.05], [0, 0.8, 0.13], 0.078, 0.044), cone([0, 0.84, 0.21], [0, 0.812, 0.335], 0.026, 0.004)];
  return { blades, cones, bound: [0, 0.8, 0.14], radius: 0.3, k: 0.012 };
}

const BODY = blade([0, 0.27, -0.06], [0, 0.66, 0.08], [0, -0.35, 1], 0.13, 0.135);
const CHEST = blade([0, 0.38, 0.05], [0, 0.62, 0.11], [0, -0.2, 1], 0.1, 0.085);
const HEAD = blade([0, 0.82, 0.08], [0, 0.86, 0.23], [0, 1, 0], 0.052, 0.058);
const LEGS = [1, -1].map((s) => cone([s * 0.05, 0.13, 0.03], [s * 0.05, 0.36, -0.005], 0.022, 0.032));
const FEET = [1, -1].map((s) => blade([s * 0.05, 0.14, -0.01], [s * 0.065, 0.14, 0.12], [0, 1, 0], 0.03, 0.02));
const PARTS = [wing(1), wing(-1), tail(), head()];

function partSd(p: Part, x: number, y: number, z: number) {
  const db = len3(x - p.bound[0], y - p.bound[1], z - p.bound[2]) - p.radius;
  if (db > 0.06) return db; // conservative: far from the group
  let d = 1e9;
  for (const c of p.cones) d = Math.min(d, sdCone(c, x, y, z));
  for (const b of p.blades) d = smin(d, sdBlade(b, x, y, z), p.k);
  return d;
}

/** Signed distance to the statue (local units; negative inside). */
export function statueSd(x: number, y: number, z: number): number {
  // Rock base, flat underneath.
  let base = ellipsoid(x, y - 0.06, z, 0.27, 0.11, 0.23);
  if (base < 0.06) base += (noise3(x * 13 + 3, y * 13, z * 13) - 0.5) * 0.034 + (noise3(x * 34, y * 34 + 5, z * 34) - 0.5) * 0.012;
  base = Math.max(base, -y);
  // Body + chest with feather ripples (chevrons) on the breast.
  let body = smin(sdBlade(BODY, x, y, z), sdBlade(CHEST, x, y, z), 0.05);
  if (body < 0.03 && y > 0.3 && y < 0.72) {
    const rip = Math.abs(Math.sin(y * 85 - Math.abs(x) * 60 + Math.max(0, z) * 20));
    body += 0.0032 * rip * Math.min(1, Math.max(0, z * 12 + 0.6));
  }
  let d = body;
  d = smin(d, sdBlade(HEAD, x, y, z), 0.03);
  for (const c of LEGS) d = smin(d, sdCone(c, x, y, z), 0.03);
  for (const f of FEET) d = smin(d, sdBlade(f, x, y, z), 0.015);
  d = smin(d, base, 0.03);
  d = smin(d, partSd(PARTS[3], x, y, z), 0.03);
  d = smin(d, partSd(PARTS[0], x, y, z), 0.028);
  d = smin(d, partSd(PARTS[1], x, y, z), 0.028);
  d = smin(d, partSd(PARTS[2], x, y, z), 0.025);
  // Eye sockets.
  for (const s of [1, -1]) d = Math.max(d, -(len3(x - s * 0.046, y - 0.855, z - 0.19) - 0.013));
  return d;
}

// --- Polygonise + measure -----------------------------------------------------------------------
const BOX = { c: [0, 0.6, 0] as V3, half: 0.67 };
let cached: THREE.BufferGeometry | null = null;

export function birdGeometry(res = 132): THREE.BufferGeometry {
  if (cached) return cached;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 400000);
  mc.isolation = 0;
  const { c, half } = BOX;
  const field = mc.field as Float32Array;
  for (let k = 0; k < res; k++) {
    const z = c[2] + ((k - res / 2) / (res / 2)) * half;
    for (let j = 0; j < res; j++) {
      const y = c[1] + ((j - res / 2) / (res / 2)) * half;
      for (let i = 0; i < res; i++) {
        const x = c[0] + ((i - res / 2) / (res / 2)) * half;
        field[i + j * res + k * res * res] = -statueSd(x, y, z);
      }
    }
  }
  mc.update();
  const n = mc.count;
  const pos = new Float32Array(n * 3);
  const src = mc.positionArray as Float32Array;
  for (let i = 0; i < n; i++) {
    pos[i * 3] = c[0] + src[i * 3] * half;
    pos[i * 3 + 1] = c[1] + src[i * 3 + 1] * half;
    pos[i * 3 + 2] = c[2] + src[i * 3 + 2] * half;
  }
  mc.geometry.dispose();
  let geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo = mergeVertices(geo, 1e-5);
  const P = geo.getAttribute("position") as THREE.BufferAttribute;
  const V = P.count;
  const nor = new Float32Array(V * 3), cav = new Float32Array(V), conv = new Float32Array(V), thick = new Float32Array(V);
  const e = 0.0015;
  for (let i = 0; i < V; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    const d0 = statueSd(x, y, z);
    let nx = statueSd(x + e, y, z) - statueSd(x - e, y, z);
    let ny = statueSd(x, y + e, z) - statueSd(x, y - e, z);
    let nz = statueSd(x, y, z + e) - statueSd(x, y, z - e);
    const l = len3(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    nor[i * 3] = nx; nor[i * 3 + 1] = ny; nor[i * 3 + 2] = nz;
    // Occlusion: how much closer the surface is than the distance stepped out along the normal.
    let occ = 0, w = 1;
    for (let s = 1; s <= 5; s++) {
      const h = 0.011 * s;
      occ += w * Math.max(0, h - statueSd(x + nx * h, y + ny * h, z + nz * h)) / h;
      w *= 0.75;
    }
    cav[i] = Math.min(1, occ * 0.55);
    // Convexity from the field Laplacian at a small scale (sphere of radius r gives 2/r).
    const q = 0.012;
    const lap = (statueSd(x + q, y, z) + statueSd(x - q, y, z) + statueSd(x, y + q, z) + statueSd(x, y - q, z) + statueSd(x, y, z + q) + statueSd(x, y, z - q) - 6 * d0) / (q * q);
    conv[i] = Math.min(1, Math.max(0, (lap - 12) / 40));
    // Thickness: is the point 4 cm inside still inside?
    thick[i] = Math.min(1, Math.max(0, -statueSd(x - nx * 0.04, y - ny * 0.04, z - nz * 0.04) / 0.035));
  }
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("aCav", new THREE.BufferAttribute(cav, 1));
  geo.setAttribute("aConv", new THREE.BufferAttribute(conv, 1));
  geo.setAttribute("aThick", new THREE.BufferAttribute(thick, 1));
  geo.computeBoundingSphere();
  cached = geo;
  return geo;
}
