// Painted clouds: each cloud is a few round masses built from big puff strokes, lit from the sun
// as one volume (warm tops, mauve-blue undersides) and drifting slowly across the sky.

import React, { useMemo } from "react";
import * as THREE from "three";
import { PAINT } from "../lib/palette.ts";
import { prng } from "../../../core/materials/textures.ts";
import { cloudDrift } from "../core/motion.ts";
import { StrokeCards, type Card } from "./StrokeCards.tsx";

// [x, y, z, scale]
const CLOUDS: [number, number, number, number][] = [
  [-26, 20, -110, 1.25],
  [8, 30, -130, 1.5],
  [34, 17, -105, 1.1],
  [-6, 12, -88, 0.8],
  [-44, 34, -140, 1.4],
  [52, 38, -150, 1.4],
  [18, 52, -120, 1.3],
  [-22, 56, -110, 1.1],
];

export const Clouds3D: React.FC<{ t: number }> = ({ t }) => {
  const cards = useMemo(() => {
    const rnd = prng(2718);
    const out: Card[] = [];
    const base = [new THREE.Color(PAINT.cloudMid), new THREE.Color("#EBD0C2"), new THREE.Color("#DCC0BC")];
    for (const [cx, cy, cz, s] of CLOUDS) {
      const lumps = 5 + Math.floor(rnd() * 4);
      const centre = new THREE.Vector3(cx, cy, cz);
      for (let l = 0; l < lumps; l++) {
        const lx = cx + (rnd() - 0.5) * 22 * s;
        const ly = cy + rnd() * 5 * s - Math.abs(lx - cx) * 0.12;
        const lz = cz + (rnd() - 0.5) * 6 * s;
        const lr = (4 + rnd() * 4) * s * (1 - Math.abs(lx - cx) / (22 * s));
        const n = Math.round(10 + lr * 3);
        for (let k = 0; k < n; k++) {
          const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2;
          const sq = Math.sqrt(1 - u * u);
          const dir = new THREE.Vector3(sq * Math.cos(a), u, sq * Math.sin(a));
          const p = new THREE.Vector3(lx, ly, lz).addScaledVector(dir, lr * (0.55 + rnd() * 0.4));
          if (p.y < cy - 1.2 * s) p.y = cy - 1.2 * s + rnd() * 0.6; // flat painted base
          const nrm = dir.clone().multiplyScalar(0.6).addScaledVector(p.clone().sub(centre).normalize(), 0.4).normalize();
          const size = lr * (0.7 + rnd() * 0.5);
          out.push({ pos: [p.x, p.y, p.z], nrm: [nrm.x, nrm.y, nrm.z], size: [size * 1.25, size], rot: (rnd() - 0.5) * 0.6, cell: 3, color: base[Math.floor(rnd() * 3)].clone(), sway: 0, seed: rnd() });
        }
      }
    }
    return out;
  }, []);
  return <StrokeCards cards={cards} t={t} offset={[cloudDrift(t), 0, 0]} bands={4} breakup={0.3} wrap={0.8} lift={0.05} hazeMax={0.25} cut={0.4} renderOrder={-5} depthWrite={false} soft jitter={0.1} />;
};
