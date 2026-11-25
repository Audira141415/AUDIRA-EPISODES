// The lone tree on the crest: a tapered, twisting trunk and boughs in the painted shader, and a
// crown of leaf-dab clumps (stroke cards lit as round painted masses). Invisible spheres cast the
// crown's shadow onto the hill so the light still reads as one sun.

import React, { useMemo } from "react";
import * as THREE from "three";
import { paintMaterial } from "../lib/paint.ts";
import { PAINT } from "../lib/palette.ts";
import { prng } from "../../../core/materials/textures.ts";
import { gust, hillY, TREE } from "../core/motion.ts";
import { StrokeCards, type Card } from "./StrokeCards.tsx";

type V3 = [number, number, number];

/** A tube whose radius tapers from r0 to r1 along the curve. */
export function taperTube(points: V3[], r0: number, r1: number, segs = 24, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const frames = curve.computeFrenetFrames(segs, false);
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs);
    const r = r0 + (r1 - r0) * Math.pow(i / segs, 0.8);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      const v = new THREE.Vector3(p.getX(k), p.getY(k), p.getZ(k)).sub(c);
      v.multiplyScalar(r);
      p.setXYZ(k, c.x + v.x, c.y + v.y, c.z + v.z);
    }
  }
  void frames;
  g.computeVertexNormals();
  return g;
}

// Crown clumps relative to the tree base: [x, y, z, radius]
const CLUMPS: [number, number, number, number][] = [
  [0.05, 2.75, 0.0, 1.0],
  [-0.85, 2.4, 0.2, 0.72],
  [0.85, 2.55, -0.1, 0.78],
  [-0.25, 3.45, -0.1, 0.78],
  [0.5, 3.2, 0.4, 0.62],
  [-0.7, 3.05, -0.5, 0.62],
  [0.25, 2.3, 0.7, 0.55],
  [1.35, 2.2, 0.25, 0.48],
  [-1.35, 2.05, -0.15, 0.45],
];

export const Tree3D: React.FC<{ t: number }> = ({ t }) => {
  const baseY = hillY(TREE.x, TREE.z) - 0.05;
  const { trunk, boughs, bark } = useMemo(() => {
    const trunk = taperTube([[0, -0.2, 0], [0.08, 0.7, 0.02], [-0.06, 1.4, -0.04], [0.05, 2.1, 0.0], [0.0, 2.6, 0.0]], 0.2, 0.08, 28, 12);
    const boughs = [
      taperTube([[0.02, 1.55, 0], [-0.4, 1.95, 0.1], [-0.85, 2.3, 0.2], [-1.3, 2.05, -0.1]], 0.085, 0.025, 16, 8),
      taperTube([[0.03, 1.7, 0], [0.45, 2.05, -0.05], [0.85, 2.45, -0.1], [1.35, 2.2, 0.25]], 0.085, 0.025, 16, 8),
      taperTube([[0.0, 2.1, 0], [-0.2, 2.7, -0.1], [-0.25, 3.3, -0.1]], 0.07, 0.025, 12, 8),
      taperTube([[0.02, 2.2, 0.0], [0.3, 2.6, 0.3], [0.5, 3.1, 0.4]], 0.06, 0.02, 12, 8),
      taperTube([[0.0, 1.9, 0.0], [0.15, 2.15, 0.45], [0.25, 2.3, 0.7]], 0.05, 0.02, 10, 8),
    ];
    const bark = paintMaterial({ color: PAINT.bark, stroke: 4, bands: 4, breakup: 0.38, rim: 0.7, outline: 0.45, seed: 3 });
    return { trunk, boughs, bark };
  }, []);

  const leaves = useMemo(() => {
    const rnd = prng(9091);
    const cards: Card[] = [];
    const tones = [new THREE.Color(PAINT.leafMid), new THREE.Color("#5E9A4A"), new THREE.Color("#3F7A44"), new THREE.Color("#78A24C")];
    const crown = new THREE.Vector3(0, 2.8, 0);
    for (const [cx, cy, cz, r] of CLUMPS) {
      const n = Math.round(r * r * 300);
      for (let k = 0; k < n; k++) {
        // a point on (or just inside) the clump's shell, flattened underneath
        const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        const dir = new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
        const rr = r * (0.72 + 0.28 * Math.sqrt(rnd()));
        const p = new THREE.Vector3(cx, cy, cz).addScaledVector(dir, rr);
        if (dir.y < -0.3) p.y = cy - r * 0.3 - (dir.y + 0.3) * r * 0.25;
        const outward = p.clone().sub(crown).normalize();
        const nrm = dir.clone().multiplyScalar(0.7).addScaledVector(outward, 0.3).normalize();
        const size = 0.22 + rnd() * 0.16;
        cards.push({
          pos: [p.x + TREE.x, p.y + baseY, p.z + TREE.z],
          nrm: [nrm.x, nrm.y, nrm.z],
          size: [size, size * (0.8 + rnd() * 0.3)],
          rot: rnd() * Math.PI * 2,
          cell: 0,
          color: tones[Math.floor(rnd() * tones.length)].clone(),
          sway: 0.012 + rnd() * 0.018,
          seed: rnd(),
        });
      }
    }
    return cards;
  }, [baseY]);

  return (
    <>
    <group position={[TREE.x, baseY, TREE.z]}>
      <mesh geometry={trunk} material={bark} castShadow receiveShadow />
      {boughs.map((g, i) => (
        <mesh key={i} geometry={g} material={bark} castShadow receiveShadow />
      ))}
      {/* the crown's shadow on the hill */}
      {CLUMPS.map(([x, y, z, r], i) => (
        <mesh key={`s${i}`} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r * 0.85, 16, 12]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
      {/* cards are drawn in world space (the card shader ignores the parent transform) */}
      <StrokeCards cards={leaves} t={t} gust={gust(t)} breakup={0.32} wrap={0.5} hazeMax={0.6} />
    </>
  );
};
