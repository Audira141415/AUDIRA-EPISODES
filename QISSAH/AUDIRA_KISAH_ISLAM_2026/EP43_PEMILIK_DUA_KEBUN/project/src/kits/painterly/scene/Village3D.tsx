// Across the bay: a striated ochre mesa with a cliff village of painted houses and a red-and-white
// lighthouse whose lamp turns; low hazy islands further out. All in the painted shader.

import React, { useMemo } from "react";
import * as THREE from "three";
import { paintMaterial } from "../lib/paint.ts";
import { PAINT } from "../lib/palette.ts";
import { prng } from "../../../core/materials/textures.ts";
import { beamAngle, fbm, LIGHTHOUSE, MESA, mesaTopY, SEA_Y, vnoise } from "../core/motion.ts";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { StrokeCards, type Card } from "./StrokeCards.tsx";

const C = (hex: string) => new THREE.Color(hex);

function mesaGeometry() {
  const H = MESA.top - (SEA_Y - 0.4);
  const g = new THREE.CylinderGeometry(1, 1, 1, 96, 30, false);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const cols = new Float32Array(p.count * 3);
  const rock = C(PAINT.rock), rockD = C(PAINT.rockDeep), grass = C(PAINT.grass), grassD = C(PAINT.grassDeep), sand = C("#D9B98A");
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i) + 0.5, z = p.getZ(i);
    const r = Math.hypot(x, z);
    const a = Math.atan2(z, x);
    const isCap = Math.abs(p.getY(i)) > 0.4999 && r < 0.999;
    let k = 1 + 0.07 * (vnoise(a * 4 + 3, y * 2) - 0.5) * 2;
    k *= 1 - 0.09 * Math.pow(vnoise(a * 9 + 1, y * 3.5 + 2), 3);
    // same factors on the caps and the side rings, so the rim has no crack
    k *= 1 + 0.18 * Math.pow(1 - y, 3); // talus at the foot
    k *= 1 + 0.035 * Math.sin(y * 26 + fbm(a * 2, y) * 4); // strata ledges
    const wx = MESA.x + x * k * MESA.rx;
    const wz = MESA.z + z * k * MESA.rz;
    let wy = SEA_Y - 0.4 + y * H;
    if (isCap || y > 0.999) wy = mesaTopY(wx, wz);
    p.setXYZ(i, wx, wy, wz);
    if (isCap) {
      c.copy(grass).lerp(grassD, vnoise(wx * 0.8, wz * 0.8));
    } else {
      const band = 0.5 + 0.5 * Math.sin(y * 18 + fbm(a * 3, y * 2) * 3);
      c.copy(rock).lerp(rockD, band * 0.75);
      if (y > 0.93) c.lerp(grassD, (y - 0.93) / 0.07);
      if (y < 0.1) c.lerp(sand, (0.1 - y) / 0.1 * 0.6);
    }
    cols.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}

const HOUSES = (() => {
  const rnd = prng(613);
  const spots: [number, number][] = [
    [4.4, -17.9], [5.3, -17.4], [6.3, -17.9], [7.4, -17.6], [4.9, -19.1], [8.3, -18.6], [5.9, -20.2], [7.1, -19.6], [9.0, -19.9], [6.6, -22.0], [8.0, -21.4],
  ];
  const walls = [PAINT.wallCream, PAINT.wallOchre, PAINT.wallRose, PAINT.wallCream, "#F0D6A8"];
  const roofs = [PAINT.roofRed, PAINT.roofBlue, PAINT.roofRed, "#8E4A33"];
  return spots.map(([x, z0], i) => ({
    x, z: z0 - 0.4,
    w: 0.6 + rnd() * 0.35,
    h: 0.5 + rnd() * 0.4 + (i === 3 ? 0.35 : 0),
    d: 0.55 + rnd() * 0.25,
    rot: (rnd() - 0.5) * 0.6,
    wall: walls[Math.floor(rnd() * walls.length)],
    roof: roofs[Math.floor(rnd() * roofs.length)],
  }));
})();

const House: React.FC<{ h: (typeof HOUSES)[number] }> = ({ h }) => {
  const mats = useMemo(
    () => ({
      wall: paintMaterial({ color: h.wall, stroke: 3, bands: 4, rim: 0.5, outline: 0.4, seed: h.x }),
      roof: paintMaterial({ color: h.roof, stroke: 3.5, bands: 4, rim: 0.6, outline: 0.4, seed: h.z }),
      win: paintMaterial({ color: "#3A3442", glow: PAINT.window, glowAmount: 0.9, rim: 0, outline: 0 }),
    }),
    [h],
  );
  const y = mesaTopY(h.x, h.z) - 0.05;
  return (
    <group position={[h.x, y, h.z]} rotation={[0, h.rot, 0]}>
      <mesh position={[0, h.h / 2, 0]} material={mats.wall} castShadow receiveShadow>
        <RoundedBoxGeo args={[h.w, h.h, h.d]} radius={0.03} />
      </mesh>
      <mesh position={[0, h.h + 0.17, 0]} rotation={[0, 0, 0]} scale={[h.w * 0.62, 0.36, h.d * 0.62]} material={mats.roof} castShadow receiveShadow>
        <coneGeometry args={[1.05, 1, 4, 1]} />
      </mesh>
      {[-0.22, 0.18].map((dx, i) => (
        <mesh key={i} position={[dx * h.w, h.h * 0.55, h.d / 2 + 0.005]} material={mats.win}>
          <planeGeometry args={[0.1, 0.13]} />
        </mesh>
      ))}
    </group>
  );
};

const Lighthouse: React.FC<{ t: number }> = ({ t }) => {
  const base = mesaTopY(LIGHTHOUSE.x, LIGHTHOUSE.z) - 0.05;
  const H = 2.7;
  const m = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.27, 0.4, H, 32, 24);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    const cols = new Float32Array(p.count * 3);
    const red = C(PAINT.lighthouseRed), white = C(PAINT.lighthouseWhite);
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / H + 0.5;
      const isRed = Math.floor(y * 5) % 2 === 1;
      const c = isRed ? red : white;
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return {
      tower: g,
      towerMat: paintMaterial({ vertexColors: true, stroke: 3, bands: 4, breakup: 0.5, rim: 0.7, outline: 0.5 }),
      dark: paintMaterial({ color: "#3A3540", stroke: 9, rim: 0.4, outline: 0.2 }),
      red: paintMaterial({ color: PAINT.lighthouseRed, stroke: 9, rim: 0.6, outline: 0.35 }),
      lamp: paintMaterial({ color: "#FFE9B0", glow: "#FFD27A", glowAmount: 1.1, rim: 0, outline: 0 }),
      beam: new THREE.MeshBasicMaterial({ color: "#FFE2A0", transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    };
  }, []);
  const a = beamAngle(t);
  return (
    <group position={[LIGHTHOUSE.x, base, LIGHTHOUSE.z]}>
      <mesh position={[0, H / 2, 0]} geometry={m.tower} material={m.towerMat} castShadow receiveShadow />
      <mesh position={[0, 0.1, 0]} material={m.dark} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.62, 0.2, 24]} />
      </mesh>
      <mesh position={[0, H + 0.04, 0]} material={m.dark} castShadow>
        <cylinderGeometry args={[0.44, 0.44, 0.08, 24]} />
      </mesh>
      <mesh position={[0, H + 0.27, 0]} material={m.lamp}>
        <cylinderGeometry args={[0.22, 0.22, 0.38, 16]} />
      </mesh>
      <mesh position={[0, H + 0.62, 0]} material={m.red} castShadow>
        <coneGeometry args={[0.32, 0.36, 16]} />
      </mesh>
      {/* a painted lamp beam turning slowly */}
      <group position={[0, H + 0.27, 0]} rotation={[0, a, 0]}>
        <mesh position={[0, 0, 2]} rotation={[-Math.PI / 2, 0, 0]} material={m.beam}>
          <coneGeometry args={[0.32, 4, 16, 1, true]} />
        </mesh>
      </group>
    </group>
  );
};

/** Low hazy islands far out to sea. */
const Islands: React.FC = () => {
  const m = useMemo(() => paintMaterial({ color: "#7E8FA6", stroke: 0.8, bands: 3, rim: 0.3, outline: 0 }), []);
  return (
    <group>
      <mesh position={[-14, SEA_Y - 0.2, -58]} scale={[11, 2.6, 4]} material={m}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[-4, SEA_Y - 0.2, -66]} scale={[6, 1.6, 3]} material={m}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[22, SEA_Y - 0.2, -74]} scale={[14, 4.4, 5]} material={m}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
};

export const Village3D: React.FC<{ t: number }> = ({ t }) => {
  const { geo, mat } = useMemo(() => ({ geo: mesaGeometry(), mat: paintMaterial({ vertexColors: true, stroke: 0.7, bands: 5, breakup: 0.5, rim: 0.5, outline: 0.35 }) }), []);
  const shrubs = useMemo(() => {
    const rnd = prng(31337);
    const cards: Card[] = [];
    const tones = [C(PAINT.leafMid), C(PAINT.grassDeep), C("#6F9A4A")];
    while (cards.length < 420) {
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.92;
      const x = MESA.x + Math.cos(a) * rr * MESA.rx, z = MESA.z + Math.sin(a) * rr * MESA.rz;
      if (HOUSES.some((h) => Math.hypot(h.x - x, h.z - z) < 0.55) || Math.hypot(x - LIGHTHOUSE.x, z - LIGHTHOUSE.z) < 0.6) continue;
      const s = 0.18 + rnd() * 0.22;
      cards.push({ pos: [x, mesaTopY(x, z) + s * 0.3, z], nrm: [Math.cos(a) * 0.4, 0.85, Math.sin(a) * 0.4], size: [s, s * 0.8], rot: rnd() * 6.28, cell: 0, color: tones[Math.floor(rnd() * 3)].clone(), sway: 0.006, seed: rnd() });
    }
    return cards;
  }, []);
  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {HOUSES.map((h, i) => (
        <House key={i} h={h} />
      ))}
      <Lighthouse t={t} />
      <StrokeCards cards={shrubs} t={t} wrap={0.5} hazeMax={0.6} />
      <Islands />
    </group>
  );
};
