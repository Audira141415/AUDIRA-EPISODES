// EP04 cover — pure, seeded data for a stylised toddler lung model: lobe deform, bronchial tree,
// bronchiole tips, PM2.5 deposits, inhaled-particle paths and the shared camera pose.
import * as THREE from "three";
import { prng } from "../../kits/anatomix/core/motion";

export type V3 = [number, number, number];

/** Lobe ellipsoid (per side): centre and radii. Right lung (screen left, side -1) is a little wider. */
export const lobe = (side: -1 | 1) => ({
  c: new THREE.Vector3(side * 0.56, -0.12, 0),
  r: new THREE.Vector3(side < 0 ? 0.52 : 0.48, 0.86, 0.44),
});

/** Deform a unit-sphere vertex into a lung lobe: narrow apex, flat medial wall, concave diaphragm base. */
export const lungify = (v: THREE.Vector3, side: -1 | 1) => {
  const { c, r } = lobe(side);
  const ny = v.y;
  const taper = 0.42 + 0.58 * Math.pow(Math.max(0, (1 - ny) / 2), 0.38);
  let x = v.x * taper;
  let z = v.z * taper * (0.9 + 0.1 * (1 - ny));
  // medial wall (toward the heart) is flatter
  if (x * side < 0) x *= 0.48;
  let y = ny;
  // concave base resting on the diaphragm
  if (ny < -0.45) y += 0.35 * (1 - (x * x + z * z) * 1.6) * Math.min(1, (-0.45 - ny) * 2.2);
  // lateral bulge
  x += side * 0.08 * Math.max(0, 1 - Math.abs(ny + 0.2) * 1.4) * (x * side > 0 ? 1 : 0);
  return new THREE.Vector3(c.x + x * r.x, c.y + y * r.y, c.z + z * r.z);
};

export type Branch = { a: THREE.Vector3; m: THREE.Vector3; b: THREE.Vector3; r: number; depth: number };
export type Leaf = { p: THREE.Vector3; side: -1 | 1; path: THREE.Vector3[]; dusty: boolean };

const insideLobe = (p: THREE.Vector3, side: -1 | 1, k = 0.8) => {
  const { c, r } = lobe(side);
  const d = new THREE.Vector3((p.x - c.x) / r.x, (p.y - c.y) / r.y, (p.z - c.z) / r.z);
  const l = d.length();
  if (l <= k) return p;
  d.multiplyScalar(k / l);
  return new THREE.Vector3(c.x + d.x * r.x, c.y + d.y * r.y, c.z + d.z * r.z);
};

export const TRACHEA_TOP = new THREE.Vector3(0, 1.22, 0);
export const CARINA = new THREE.Vector3(0, 0.58, 0);
export const MOUTH = new THREE.Vector3(0, 1.85, 0.05);

/** Lung group transform (scale about origin, then lift). */
export const LUNG_SCALE = 0.88;
export const LUNG_Y = 0.1;
export const toWorld = (p: { x: number; y: number; z: number }): V3 => [p.x * LUNG_SCALE, p.y * LUNG_SCALE + LUNG_Y, p.z * LUNG_SCALE];

const build = () => {
  const rnd = prng(4404);
  const branches: Branch[] = [];
  const leaves: Leaf[] = [];
  branches.push({ a: TRACHEA_TOP, m: TRACHEA_TOP.clone().lerp(CARINA, 0.5), b: CARINA, r: 0.075, depth: -1 });

  const grow = (a: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, side: -1 | 1, path: THREE.Vector3[]) => {
    const b0 = a.clone().addScaledVector(dir, len);
    const b = insideLobe(b0, side);
    const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3((rnd() - 0.5) * 0.04, 0, (rnd() - 0.5) * 0.05));
    branches.push({ a, m, b, r, depth });
    const np = [...path, b];
    if (depth >= 5) {
      leaves.push({ p: b, side, path: np, dusty: false });
      return;
    }
    const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
    if (depth === 1) {
      // lobar split: upper (up-lateral), middle (lateral), lower (down)
      const dirs = [new THREE.Vector3(side * 0.55, 0.75, 0.1), new THREE.Vector3(side * 1, -0.25, -0.1), new THREE.Vector3(side * 0.25, -1, 0.05)];
      dirs.forEach((d, i) => grow(b, d.normalize(), [0.36, 0.34, 0.42][i], r * 0.7, depth + 1, side, np));
      return;
    }
    for (const s of [-1, 1]) {
      const spread = 0.55 + rnd() * 0.35;
      const nd = dir
        .clone()
        .addScaledVector(perp, s * spread)
        .add(new THREE.Vector3(0, -0.12, (rnd() - 0.5) * 0.9))
        .normalize();
      grow(b, nd, len * (0.62 + rnd() * 0.08), r * 0.66, depth + 1, side, np);
    }
  };

  for (const side of [-1, 1] as const) {
    const main = new THREE.Vector3(side * 0.36, 0.36, 0.02);
    branches.push({ a: CARINA, m: CARINA.clone().lerp(main, 0.5).add(new THREE.Vector3(0, 0.03, 0)), b: main, r: 0.055, depth: 0 });
    grow(main, new THREE.Vector3(side * 0.7, -1, 0).normalize(), 0.16, 0.046, 1, side, [MOUTH, TRACHEA_TOP, CARINA, main]);
  }
  // deposits: most terminal bronchioles carry PM2.5
  leaves.forEach((l) => (l.dusty = rnd() < 0.72));
  return { branches, leaves };
};

export const TREE = build();

/** Bronchiole the PM2.5 callout points at: a dusty tip on the screen-right lobe, mid height. */
export const CALLOUT_LEAF = (() => {
  const cand = TREE.leaves.filter((l) => l.side > 0 && l.dusty && l.p.y < 0.15 && l.p.y > -0.55);
  cand.sort((a, b) => b.p.x + b.p.z * 0.5 - (a.p.x + a.p.z * 0.5));
  return cand[0] ?? TREE.leaves[TREE.leaves.length - 1];
})();

/** Camera: slow clinical orbit (cover holds frame 15 of 30). */
export const coverCamera = (t: number) => {
  const ang = -0.22 + t * 0.05;
  const r = 7.1;
  return {
    position: [Math.sin(ang) * r, 0.75, Math.cos(ang) * r] as V3,
    target: [0.0, 0.22, 0] as V3,
    fov: 34,
  };
};

export const project = (t: number, p: V3, width: number, height: number) => {
  const pose = coverCamera(t);
  const cam = new THREE.PerspectiveCamera(pose.fov, width / height, 0.1, 100);
  cam.position.set(...pose.position);
  cam.lookAt(...pose.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
};
