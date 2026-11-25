// Pilgrims as small faceless points of light (depiction rule): tawaf flow, sa'i lanes, roof rows.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";

/** Instanced points; `place(i, out)` writes position for point i, returns false to hide it. */
export const Points: React.FC<{ n: number; r?: number; color?: string; k?: number; place: (i: number, out: THREE.Vector3) => boolean }> = ({ n, r = 0.0065, color = "#fff3dc", k = 0.9, place }) => {
  const mesh = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: k, roughness: 0.6 });
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 6, 4), m, n);
    im.layers.set(FX_LAYER);
    return im;
  }, [n, r, color, k]);
  useLayoutEffect(() => {
    const m4 = new THREE.Matrix4();
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      if (place(i, v)) m4.makeTranslation(v.x, v.y, v.z);
      else m4.makeScale(0, 0, 0);
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={mesh} />;
};

const seeds = (n: number, seed: number) => {
  const r = prng(seed);
  return Array.from({ length: n }, () => [r(), r(), r()] as const);
};
const TAWAF = seeds(900, 11);

/** Tawaf: anticlockwise seen from above (angle decreasing in x/z with north = -z). */
export const Tawaf: React.FC<{ t: number; density: number; radius: number; y?: number; rMin?: number }> = ({ t, density, radius, y = 0.05, rMin = 0.26 }) => (
  <Points
    n={900}
    place={(i, o) => {
      const [a, b, c] = TAWAF[i];
      if (a > density) return false;
      const rr = rMin + (radius - rMin) * Math.sqrt(b);
      const w = 0.09 / (0.4 + rr); // inner rings move faster
      const th = c * Math.PI * 2 - t * w;
      o.set(Math.cos(th) * rr, y, Math.sin(th) * rr);
      return rr > rMin;
    }}
  />
);

const RING = seeds(500, 23);
/** People on the temporary ring bridge (2013-2016). */
export const BridgeFlow: React.FC<{ t: number; vis: number; r0: number; r1: number; y: number; gone: number }> = ({ t, vis, r0, r1, y, gone }) => (
  <Points
    n={500}
    place={(i, o) => {
      const [a, b, c] = RING[i];
      if (a > vis * (1 - gone)) return false;
      const rr = r0 + (r1 - r0) * b;
      const th = c * Math.PI * 2 - t * 0.05;
      o.set(Math.cos(th) * rr, y, Math.sin(th) * rr);
      return true;
    }}
  />
);

const SAI = seeds(260, 31);
/** Sa'i walkers between Safa (south) and Marwah (north), two directions. */
export const SaiFlow: React.FC<{ t: number; x: number; z0: number; z1: number; y: number; width: number; vis: number }> = ({ t, x, z0, z1, y, width, vis }) => (
  <Points
    n={260}
    place={(i, o) => {
      const [a, b, c] = SAI[i];
      if (a > vis) return false;
      const dir = i % 2 ? 1 : -1;
      const L = z1 - z0;
      const p = (((c * L + dir * t * 0.11) % L) + L) % L;
      o.set(x + (dir > 0 ? 0.25 : -0.25) * width + (b - 0.5) * width * 0.35, y, z0 + p);
      return true;
    }}
  />
);

const ROOF = seeds(700, 41);
/** Rows of worshippers on a roof rectangle (static, faint breathing of brightness only). */
export const RoofRows: React.FC<{ rects: { x0: number; x1: number; z0: number; z1: number }[]; y: number; vis: number }> = ({ rects, y, vis }) => (
  <Points
    n={700}
    r={0.009}
    place={(i, o) => {
      const [a, b, c] = ROOF[i];
      if (a > vis) return false;
      const R = rects[i % rects.length];
      const rows = Math.max(2, Math.round((R.z1 - R.z0) / 0.05));
      const zr = Math.floor(b * rows) / rows;
      o.set(R.x0 + 0.04 + (R.x1 - R.x0 - 0.08) * c, y, R.z0 + 0.04 + (R.z1 - R.z0 - 0.08) * zr);
      return true;
    }}
  />
);

const ESC = seeds(80, 53);
/** Dots riding an escalator ramp from (x,z) ground to roof height. */
export const EscalatorFlow: React.FC<{ t: number; vis: number; from: [number, number, number]; to: [number, number, number] }> = ({ t, vis, from, to }) => (
  <Points
    n={80}
    place={(i, o) => {
      const [a, , c] = ESC[i];
      if (a > vis) return false;
      const k = (c + t * 0.12) % 1;
      o.set(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k);
      return true;
    }}
  />
);
