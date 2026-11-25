import React, { useMemo } from "react";
import * as THREE from "three";
import { KINTSUGI_PALETTE as C } from "../lib/palette";
import { createGlazeMaterial, createLiquidGoldMaterial } from "../lib/materials";
import { prng } from "../../../core/materials/textures.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/** Outer profile (radius, height) of a vessel; the lathe also builds a thin inner wall from it. */
export type VesselProfile = [number, number][];

/** Chawan tea bowl: foot ring, flared wall, soft rim. */
export const CHAWAN: VesselProfile = [
  [0.0, 0.0], [0.42, 0.0], [0.44, 0.04], [0.4, 0.12], [0.52, 0.16], [0.78, 0.32], [0.95, 0.56], [1.02, 0.8], [1.04, 0.92],
];
/** Tall vase. */
export const VASE: VesselProfile = [
  [0.0, -1.0], [0.6, -1.0], [0.88, -0.6], [0.9, -0.1], [0.72, 0.45], [0.48, 0.8], [0.5, 0.98], [0.58, 1.02],
];

const radiusAt = (p: VesselProfile, y: number) => {
  for (let i = 1; i < p.length; i++) {
    if (y <= p[i][1]) {
      const t = (y - p[i - 1][1]) / Math.max(1e-6, p[i][1] - p[i - 1][1]);
      return p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t;
    }
  }
  return p[p.length - 1][0];
};

function lathePoints(p: VesselProfile, wall = 0.05): THREE.Vector2[] {
  const y0 = p[0][1];
  const [rimR, rimY] = p[p.length - 1];
  const outer = p.map(([r, y]) => new THREE.Vector2(r, y));
  const inner = p
    .slice(1)
    .reverse()
    .map(([r, y]) => new THREE.Vector2(Math.max(0, r - wall), Math.max(y0 + wall, y)));
  return [...outer, new THREE.Vector2(rimR - wall * 0.5, rimY + 0.012), ...inner, new THREE.Vector2(0, y0 + wall)];
}

/** One crack wandering up the outer wall: jagged θ steps, slightly proud of the glaze. */
function seamCurve(p: VesselProfile, seed: number, theta0: number): THREE.CatmullRomCurve3 {
  const r = prng(seed * 977 + 13);
  r(); r(); r();
  const y0 = p[0][1] + (p[p.length - 1][1] - p[0][1]) * 0.18;
  const y1 = p[p.length - 1][1];
  const n = 14;
  let th = theta0;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    th += (r() - 0.5) * 0.2;
    const rad = radiusAt(p, y) + 0.008;
    pts.push(new THREE.Vector3(Math.sin(th) * rad, y, Math.cos(th) * rad));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1);
}

/** Lathe vessel with gold-filled cracks that flow in from `fillStart` over `fillDur` film frames. */
export const KintsugiVessel: React.FC<{
  f: number;
  profile?: VesselProfile;
  glaze?: string;
  seams?: number;
  seed?: number;
  fillStart?: number;
  fillDur?: number;
}> = ({ f, profile = CHAWAN, glaze = C.obsidianCeramic, seams = 4, seed = 7, fillStart = 20, fillDur = 150 }) => {
  const body = useMemo(() => new THREE.LatheGeometry(lathePoints(profile), 96), [profile]);
  const glazeMat = useMemo(() => createGlazeMaterial(glaze), [glaze]);
  const gold = useMemo(createLiquidGoldMaterial, []);
  const tubes = useMemo(
    () => Array.from({ length: seams }, (_, i) => new THREE.TubeGeometry(seamCurve(profile, seed + i * 31, (i / seams) * Math.PI * 2 + 0.4), 80, 0.016, 6, false)),
    [profile, seams, seed],
  );
  gold.emissiveIntensity = 0.35 + 0.25 * (Math.sin(f * 0.04) * 0.5 + 0.5);
  return (
    <group>
      <mesh geometry={body} material={glazeMat} castShadow receiveShadow />
      {tubes.map((g, i) => {
        const t = Math.min(1, Math.max(0, (f - fillStart - i * 18) / fillDur));
        const eased = 1 - Math.pow(1 - t, 2);
        const n = g.index ? g.index.count : 0;
        const shown = Math.floor(n * eased);
        g.setDrawRange(0, shown - (shown % 3));
        return <mesh key={i} geometry={g} material={gold} castShadow />;
      })}
    </group>
  );
};

/** Back-compat hero: the tall vase, slowly turning. */
export const KintsugiVase: React.FC<{ f: number }> = ({ f }) => (
  <group position={[0, -0.2, 0]} rotation={[0, f * 0.01, 0]}>
    <KintsugiVessel f={f} profile={VASE} glaze={C.porcelainMatte} seams={3} seed={3} />
  </group>
);

/** Tea-ceremony stage: tatami floor, low wooden plinth, the chawan, a clay storage pot behind. */
export const KintsugiStage: React.FC<{ f: number }> = ({ f }) => {
  const grain = useSurfaceGrain(5, 0.18, 6);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={C.tatamiBeige} roughnessMap={grain} bumpMap={grain} bumpScale={0.4} />
      </mesh>
      {/* Tatami border strips */}
      {[-2.2, 2.2].map((z) => (
        <mesh key={z} position={[0, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 0.14]} />
          <meshStandardMaterial color="#2f3a2c" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.9, 0.18, 2.2]} radius={0.05} />
        <meshPhysicalMaterial {...POLISH.stone} color="#4a3426" roughness={0.6} clearcoat={0.4} />
      </mesh>
      <group position={[0, 0.18, 0]} rotation={[0, f * 0.006, 0]}>
        <KintsugiVessel f={f} profile={CHAWAN} glaze={C.obsidianCeramic} seams={5} />
      </group>
      <AssetModel id="clay-storage-pot-626452" size={1.5} ground polish="clay" tint="#9a7b62" position={[-1.9, 0, -2.4]} rotation={[0, 0.6, 0]} />
      <mesh position={[2.2, 0.35, -2.0]} castShadow>
        <sphereGeometry args={[0.35, 32, 24]} />
        <meshPhysicalMaterial {...POLISH.clay} color={C.porcelainMatte} />
      </mesh>
    </group>
  );
};
