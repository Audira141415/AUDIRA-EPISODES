// The foreground hill: a height-field painted with vertex colours (meadow greens, a worn dirt path,
// ochre rock where it falls to the sea), covered in wind-blown grass tufts and wildflower dabs.

import React, { useMemo } from "react";
import * as THREE from "three";
import { paintMaterial } from "../lib/paint.ts";
import { PAINT } from "../lib/palette.ts";
import { prng } from "../../../core/materials/textures.ts";
import { CREST, fbm, gust, hillY, pathDistance, SEA_Y, TREE } from "../core/motion.ts";
import { StrokeCards, type Card } from "./StrokeCards.tsx";

const C = (hex: string) => new THREE.Color(hex);

function hillNormal(x: number, z: number): [number, number, number] {
  const e = 0.08;
  const hx = (hillY(x + e, z) - hillY(x - e, z)) / (2 * e);
  const hz = (hillY(x, z + e) - hillY(x, z - e)) / (2 * e);
  const l = Math.hypot(hx, 1, hz);
  return [-hx / l, 1 / l, -hz / l];
}

export const Hill3D: React.FC<{ t: number }> = ({ t }) => {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, 26, 190, 170);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -3.5);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    const cols = new Float32Array(p.count * 3);
    const grass = C(PAINT.grass), deep = C(PAINT.grassDeep), warm = C(PAINT.grassWarm), dirt = C(PAINT.dirt), rock = C(PAINT.rock), rockD = C(PAINT.rockDeep);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const y = hillY(x, z);
      p.setY(i, y);
      const n = fbm(x * 0.5 + 7, z * 0.5 + 2);
      c.copy(grass).lerp(deep, Math.min(1, Math.max(0, (n - 0.45) * 2.4)));
      c.lerp(warm, Math.max(0, (fbm(x * 0.9, z * 0.9) - 0.55) * 2.2));
      // the path: a worn dirt line with ragged edges
      const pd = pathDistance(x, z) + (fbm(x * 3, z * 3) - 0.5) * 0.12;
      if (z > -4.5 && z < 2) c.lerp(dirt, Math.max(0, Math.min(1, (0.2 - pd) / 0.08)));
      // rock where the hill falls steeply to the sea
      const [, ny] = hillNormal(x, z);
      const steep = Math.max(0, Math.min(1, (0.78 - ny) / 0.2));
      const band = 0.5 + 0.5 * Math.sin(y * 9 + fbm(x, z) * 5);
      c.lerp(rock.clone().lerp(rockD, band * 0.7), steep);
      if (y < SEA_Y + 0.25) c.lerp(rockD, 0.6);
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    const m = paintMaterial({ vertexColors: true, stroke: 0.75, bands: 4, breakup: 0.2, rim: 0, outline: 0.15 });
    return { geo: g, mat: m };
  }, []);

  const grass = useMemo(() => {
    const rnd = prng(4242);
    const cards: Card[] = [];
    const tones = [C(PAINT.grass), C(PAINT.grassDeep), C(PAINT.grassWarm), C("#93AE52"), C("#6C9446")];
    let tries = 0;
    while (cards.length < 4200 && tries < 40000) {
      tries++;
      const x = -5 + rnd() * 10.5;
      const z = -7 + rnd() * 9.6;
      if (z < CREST.z - 1.6 && rnd() < 0.7) continue;
      const pd = pathDistance(x, z);
      if (pd < 0.17) continue;
      // denser near the path edges and in the foreground
      if (rnd() > 0.35 + Math.min(0.65, 0.35 / (pd + 0.2)) * 0.6 + (z > -1 ? 0.25 : 0)) continue;
      const y = hillY(x, z);
      if (y < SEA_Y + 0.6) continue;
      const near = Math.max(0, Math.min(1, (z + 2) / 4));
      const h = (0.2 + rnd() * 0.22) * (0.8 + near * 0.6) * (pd < 0.35 ? 0.75 : 1);
      const n = hillNormal(x, z);
      const tone = tones[Math.floor(rnd() * tones.length)].clone();
      cards.push({
        pos: [x, y - 0.03, z],
        nrm: [n[0] * 0.6 + 0.0, n[1] * 0.6 + 0.4, n[2] * 0.6],
        size: [h * 1.1, h],
        cell: 2,
        color: tone,
        sway: 0.22 + rnd() * 0.2,
        seed: rnd(),
      });
    }
    // tufts at the foot of the tree
    for (let k = 0; k < 160; k++) {
      const a = rnd() * Math.PI * 2, r = 0.25 + rnd() * 1.1;
      const x = TREE.x + Math.cos(a) * r, z = TREE.z + Math.sin(a) * r;
      const y = hillY(x, z);
      const h = 0.16 + rnd() * 0.18;
      cards.push({ pos: [x, y - 0.02, z], nrm: [0, 1, 0], size: [h * 1.1, h], cell: 2, color: tones[Math.floor(rnd() * 3)].clone(), sway: 0.3, seed: rnd() });
    }
    return cards;
  }, []);

  const flowers = useMemo(() => {
    const rnd = prng(777);
    const cards: Card[] = [];
    const tones = [C("#F4EBD8"), C("#F2C94C"), C("#E07A5F"), C("#B79CE0")];
    while (cards.length < 420) {
      const x = -4 + rnd() * 8.5, z = -5.8 + rnd() * 7.5;
      const pd = pathDistance(x, z);
      if (pd < 0.25) continue;
      const y = hillY(x, z);
      if (y < SEA_Y + 1) continue;
      const near = Math.max(0, Math.min(1, (z + 2) / 4));
      const s = (0.045 + rnd() * 0.035) * (0.8 + near * 0.7);
      cards.push({ pos: [x, y + 0.1 + rnd() * 0.16 * (0.7 + near), z], nrm: [0.2, 0.9, 0.3], size: [s, s], rot: rnd() * 6.28, cell: 0, color: tones[Math.floor(rnd() * tones.length)].clone(), sway: 0.012, seed: rnd() });
    }
    return cards;
  }, []);

  const g = gust(t);
  return (
    <group>
      <mesh geometry={geo} material={mat} receiveShadow castShadow />
      <StrokeCards cards={grass} mode="grass" t={t} gust={g} breakup={0.28} lift={0.04} cut={0.42} hazeMax={0.6} />
      <StrokeCards cards={flowers} t={t} gust={g} lift={0.25} bands={3} hazeMax={0.6} />
    </group>
  );
};

export { hillNormal };
