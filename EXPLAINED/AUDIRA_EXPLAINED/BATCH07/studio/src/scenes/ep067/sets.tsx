// AE-067 sets. Each set is one place the film visits; all are drawn at the origin (only one at a time).
//  CitySet      HOOK   New York on an earth cut-away, the aqueduct running under it from the far north.
//  ReservoirSet KONTEKS mountain valley, lake, concrete dam, intake tower (AUDIRA plate).
//  ProfileSet   MEKANISME + OUTRO  long section: high reservoir → tunnel dipping under a valley → lower city.
//  LiningSet    MEKANISME/REVEAL  tunnel bore in rock, concrete lining; cracks + leak jets on cue.
//  TapSet       REVEAL kitchen sink, water from the tap, city outside the window.
//  HudsonSet    REVEAL river section: old leaking tunnel + deeper bypass with two shafts.
//  SodetanSet   PAYOFF Jakarta street section: two pipes carry brown flood water to the canal.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { mulberry32 } from "../../kits/worldforge/noise.ts";
import {
  basinPoly,
  Dam,
  distToPath,
  HoleFace,
  Lake,
  pineSpots,
  Pipe,
  SectionEnd,
  SectionFace,
  SectionTop,
  ShaftBand,
  smoothPath,
  STRATA,
  STRATA_CITY,
  TunnelCut,
  Valley,
  WaterBody,
  yAt,
  DAM_Z,
  type P2,
  type Strata,
  type V3,
} from "./world.tsx";

const Pine: React.FC<{ p: V3; s?: number; i: number }> = ({ p, s = 9, i }) => (
  <AssetModel id="tall-pine-tree-ab4108" size={s * (0.8 + 0.4 * ((i * 37) % 10) / 10)} ground position={p} rotation={[0, i * 1.3, 0]} polish="stone" />
);

// ── HOOK: city on the cut-away ─────────────────────────────────────────────────────────
export const CITY = {
  ground: [[-320, 0], [90, 0]] as P2[],
  bottom: -170,
  depth: 80,
  tunnel: smoothPath([[-320, -20], [-60, -20], [12, -19], [29, -15], [36.5, -9], [38, -4]], 220),
  r: 3.2,
  R: 4.2,
  shaftX: 38,
};
const citySkip = (x: number, y: number) => distToPath(CITY.tunnel, x, y) < CITY.R;
export const CitySet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <SectionFace ground={CITY.ground} bottom={CITY.bottom} x0={-320} x1={90} nx={300} ny={130} strata={STRATA_CITY} skip={citySkip} />
    <SectionTop ground={CITY.ground} x0={-320} x1={-20} depth={CITY.depth} color="#6d8a48" color2="#8b9a5a" nx={120} />
    <SectionTop ground={CITY.ground} x0={-20} x1={90} depth={CITY.depth} color="#77746e" color2="#8a867d" nx={60} seed={7} />
    <SectionEnd ground={CITY.ground} x={90} bottom={CITY.bottom} depth={CITY.depth} strata={STRATA_CITY} />
    <TunnelCut path={CITY.tunnel} r={CITY.r} R={CITY.R} t={t} flow={9} glow={0.25} />
    <ShaftBand x={CITY.shaftX} y0={-5} y1={0.2} w={5.6} />
    {/* AUDIRA plate on the cut face beside the shaft (in-world brand) */}
    <group position={[16, -6, 0.75]}>
      <mesh>
        <RoundedBoxGeo args={[14, 3.6, 0.4]} radius={0.12} />
        <meshStandardMaterial color="#173a2e" roughness={0.5} metalness={0.2} />
      </mesh>
      <SceneText position={[0, 0.02, 0.24]} fontSize={2.3} color="#f2e8d6" anchorX="center" anchorY="middle" letterSpacing={0.12}>
        AUDIRA
      </SceneText>
    </group>
    {/* Manhattan-like block: towers (GLB) */}
    <AssetModel id="art-deco-setback-tower-b3a788" size={70} ground position={[44, 0, -40]} polish="stone" />
    <AssetModel id="office-tower-1538cc" size={52} ground position={[22, 0, -24]} polish="stone" />
    <AssetModel id="office-tower-1538cc" size={44} ground position={[66, 0, -22]} rotation={[0, 0.6, 0]} polish="stone" />
    <AssetModel id="prewar-apartment-house-1081a6" size={26} ground position={[4, 0, -12]} polish="stone" />
    <AssetModel id="brick-tenement-7d2014" size={20} ground position={[58, 0, -6]} rotation={[0, -0.3, 0]} polish="stone" />
    <AssetModel id="postwar-apartment-slab-cee5f9" size={30} ground position={[-10, 0, -44]} polish="stone" />
    <AssetModel id="art-deco-setback-tower-b3a788" size={54} ground position={[78, 0, -58]} rotation={[0, 0.4, 0]} polish="stone" />
    <AssetModel id="prewar-apartment-house-1081a6" size={22} ground position={[-16, 0, -14]} rotation={[0, 0.5, 0]} polish="stone" />
    {[-60, -90, -130, -170, -220].map((x, i) => (
      <Pine key={x} p={[x, 0, -10 - (i % 3) * 18]} i={i} s={12} />
    ))}
  </group>
);

// ── KONTEKS: mountain reservoir ─────────────────────────────────────────────────────────
export const TOWER: V3 = [-14, 0, -6];
export const ReservoirSet: React.FC<{ t: number }> = ({ t }) => {
  const pines = useMemo(() => pineSpots(26, 67, [-95, 95, -140, 90]), []);
  const grain = useSurfaceGrain(43, 0.3, 2);
  return (
    <group>
      <Valley />
      <Lake t={t} />
      <Dam />
      {pines.map((p, i) => (
        <Pine key={i} p={p} i={i} s={10} />
      ))}
      {/* intake tower: concrete shaft from the lake bed, gatehouse on top, footbridge to the west bank */}
      <mesh position={[TOWER[0], 0, TOWER[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 22, 40]} />
        <meshStandardMaterial color="#c8c1b4" roughness={0.8} bumpMap={grain} bumpScale={0.8} />
      </mesh>
      <mesh position={[TOWER[0], 13.5, TOWER[2]]} castShadow receiveShadow>
        <RoundedBoxGeo args={[10, 5, 10]} radius={0.4} />
        <meshStandardMaterial color="#d9d2c4" roughness={0.75} bumpMap={grain} bumpScale={0.6} />
      </mesh>
      <mesh position={[TOWER[0], 16.6, TOWER[2]]} castShadow>
        <RoundedBoxGeo args={[11.4, 1.2, 11.4]} radius={0.3} />
        <meshStandardMaterial color="#7a3e2c" roughness={0.6} />
      </mesh>
      <mesh position={[TOWER[0] - 16, 10.4, TOWER[2]]} castShadow receiveShadow>
        <RoundedBoxGeo args={[24, 0.9, 2.6]} radius={0.2} />
        <meshStandardMaterial color="#b8b1a4" roughness={0.8} />
      </mesh>
      {/* AUDIRA plate on the gatehouse (in-world brand) */}
      <group position={[TOWER[0] + 0.4, 13.6, TOWER[2] + 5.06]}>
        <mesh>
          <RoundedBoxGeo args={[7.4, 2.4, 0.25]} radius={0.08} />
          <meshStandardMaterial color="#173a2e" roughness={0.5} metalness={0.2} />
        </mesh>
        <SceneText position={[0, 0.02, 0.16]} fontSize={1.45} color="#f2e8d6" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          AUDIRA
        </SceneText>
      </group>
    </group>
  );
};

// ── MEKANISME: long section (also the OUTRO wide) ─────────────────────────────────────
export const PROFILE = {
  ground: smoothPath(
    [
      [-100, 44], [-84, 45], [-77, 36], [-71, 22], [-60, 19.5], [-50, 20], [-45, 22], [-40, 34], [-35, 34.5], [-28, 27], [-16, 12], [-6, 3.4], [0, 1.6], [6, 3.4], [14, 7.5], [24, 10.6], [34, 11], [100, 11],
    ],
    320,
  ),
  bottom: -170,
  depth: 56,
  level: 34,
  tunnel: smoothPath([[-62, 14], [-50, 12], [-36, 6], [-20, -5], [0, -12], [16, -6], [30, 2], [42, 5]], 240),
  r: 2.5,
  R: 3.3,
  cityY: 11,
};
const profSkip = (x: number, y: number) => distToPath(PROFILE.tunnel, x, y) < PROFILE.R;
const DAM_POLY: P2[] = [[-44, 20], [-44, 37.2], [-41.2, 37.2], [-36, 27], [-36, 20]];
export const ProfileSet: React.FC<{ t: number; flow?: number }> = ({ t, flow = 7 }) => {
  const g = PROFILE.ground;
  const water = useMemo(() => basinPoly(g, -76.2, -44, PROFILE.level), [g]);
  const river = useMemo(() => basinPoly(g, -4.6, 4.6, 2.7), [g]);
  const damGeo = useMemo(() => {
    const s = new THREE.Shape(DAM_POLY.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(s, { depth: PROFILE.depth, bevelEnabled: false });
    geo.translate(0, 0, -PROFILE.depth + 0.06);
    return geo;
  }, []);
  const grain = useSurfaceGrain(43, 0.3, 4);
  return (
    <group>
      <SectionFace ground={g} bottom={PROFILE.bottom} x0={-100} x1={100} nx={340} ny={170} skip={profSkip} />
      <SectionTop ground={g} x0={-100} x1={34} depth={PROFILE.depth} nx={200} />
      <SectionTop ground={g} x0={34} x1={100} depth={PROFILE.depth} color="#77746e" color2="#8a867d" nx={60} seed={7} />
      <SectionEnd ground={g} x={100} bottom={PROFILE.bottom} depth={PROFILE.depth} />
      <SectionEnd ground={g} x={-100} bottom={PROFILE.bottom} depth={PROFILE.depth} />
      <WaterBody poly={water} depth={PROFILE.depth} color="#2b7a86" streak="#a7e0dc" t={t} />
      <WaterBody poly={river} depth={PROFILE.depth} color="#4f7d80" streak="#bfe3dd" t={t} flow={2} />
      <mesh geometry={damGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#cbc5b8" roughness={0.78} bumpMap={grain} bumpScale={0.8} />
      </mesh>
      <TunnelCut path={PROFILE.tunnel} r={PROFILE.r} R={PROFILE.R} t={t} flow={flow} glow={0.2} />
      <ShaftBand x={-62} y0={13} y1={20} w={4.4} />
      <ShaftBand x={44} y0={4} y1={11.2} w={4.4} />
      {[
        [-92, -14], [-86, -34], [-80, -8], [-30, -16], [-24, -38], [-20, -9], [12, -30], [-60, -50], [-96, -46],
      ].map(([x, z], i) => (
        <Pine key={i} p={[x, yAt(g, x) - 0.2, z]} i={i} s={8} />
      ))}
      <AssetModel id="office-tower-1538cc" size={30} ground position={[62, PROFILE.cityY, -26]} polish="stone" />
      <AssetModel id="art-deco-setback-tower-b3a788" size={40} ground position={[80, PROFILE.cityY, -38]} polish="stone" />
      <AssetModel id="brick-tenement-7d2014" size={13} ground position={[52, PROFILE.cityY, -10]} polish="stone" />
      <AssetModel id="prewar-apartment-house-1081a6" size={16} ground position={[72, PROFILE.cityY, -10]} rotation={[0, 0.4, 0]} polish="stone" />
      <AssetModel id="postwar-apartment-slab-cee5f9" size={18} ground position={[90, PROFILE.cityY, -20]} polish="stone" />
    </group>
  );
};

// ── tunnel bore close-up (lining; cracks + leak) ───────────────────────────────────────
const ROCK: Strata = { top: "#6d665c", soil: "#6d665c", clay: "#77706a", sand: "#827a70", rock: "#6e6963", deep: "#5d5954" };
export const BORE = { r: 5, R: 6.4 };
const CRACKS: [number, number, number, number][] = [
  // x, y, length, angle (on the ring face, lower right)
  [4.1, -3.6, 2.2, -0.9],
  [5.0, -2.2, 1.4, -0.3],
  [3.0, -4.9, 1.6, -1.3],
  [5.4, -3.9, 1.0, 0.4],
];
export const LEAK_AT: V3 = [4.4, -3.8, 0.3];
const N_DROPS = 90;
export const LiningSet: React.FC<{ t: number; crack: number; leak: number }> = ({ t, crack, leak }) => {
  const holes = useMemo(() => [{ x: 0, y: 0, R: BORE.R }], []);
  const drops = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshStandardMaterial({ color: "#cfefff", roughness: 0.05, emissive: "#6fc6ff", emissiveIntensity: 0.4 }), N_DROPS);
    m.frustumCulled = false;
    const o = new THREE.Object3D();
    for (let i = 0; i < N_DROPS; i++) {
      o.scale.setScalar(0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);
  // leak jets: drops leave the crack, arc out toward the camera and fall (pure function of t)
  const rnd = mulberry32(77);
  const o = new THREE.Object3D();
  for (let i = 0; i < N_DROPS; i++) {
    const ph = rnd(), sp = 0.7 + rnd() * 0.6, ang = -0.4 - rnd() * 1.4, src = Math.floor(rnd() * CRACKS.length);
    const life = 0.62;
    const age = ((t * sp + ph * life) % life) / life;
    const c = CRACKS[src];
    const v0 = 6 + rnd() * 4;
    const tt = age * life;
    o.position.set(c[0] + Math.cos(ang) * v0 * 0.5 * tt, c[1] + Math.sin(ang) * v0 * 0.25 * tt - 4.9 * tt * tt, 0.3 + v0 * 0.6 * tt);
    o.scale.setScalar(leak * (0.6 + 0.8 * (1 - age)));
    o.updateMatrix();
    drops.setMatrixAt(i, o.matrix);
  }
  drops.instanceMatrix.needsUpdate = true;
  return (
    <group>
      <HoleFace x0={-46} x1={46} y0={-46} top={46} holes={holes} strata={ROCK} n={150} />
      <Pipe x={0} y={0} r={BORE.r} R={BORE.R} length={160} t={t} flow={5} />
      {/* cracks in the concrete ring */}
      {CRACKS.map(([x, y, l, a], i) => (
        <mesh key={i} position={[x, y, 0.14]} rotation={[0, 0, a]} scale={[crack * l, 1, 1]}>
          <RoundedBoxGeo args={[1, 0.12, 0.1]} radius={0.04} />
          <meshStandardMaterial color="#1b1612" roughness={0.9} />
        </mesh>
      ))}
      {/* wet stain spreading on the rock below the crack */}
      <mesh position={[6.4, -7.5, 0.06]} scale={[leak * 1.3, leak, 1]}>
        <circleGeometry args={[5, 40]} />
        <meshStandardMaterial color="#2a2622" transparent opacity={0.55 * leak} roughness={0.25} />
      </mesh>
      <primitive object={drops} />
    </group>
  );
};

// ── REVEAL: kitchen tap ────────────────────────────────────────────────────────────────
export const TAP_SPOUT: V3 = [-0.53, 2.24, -0.13];
export const TapSet: React.FC<{ t: number }> = ({ t }) => {
  const grain = useSurfaceGrain(51, 0.25, 2);
  const tex = useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 256;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#cfefff";
    ctx.fillRect(0, 0, 64, 256);
    const r = mulberry32(5);
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = r() > 0.5 ? "#ffffff" : "#8fd0f0";
      ctx.globalAlpha = 0.3 + r() * 0.5;
      ctx.fillRect(r() * 64, r() * 256, 2 + r() * 6, 10 + r() * 40);
    }
    const x = new THREE.CanvasTexture(cv);
    x.wrapS = x.wrapT = THREE.RepeatWrapping;
    x.colorSpace = THREE.SRGBColorSpace;
    return x;
  }, []);
  tex.offset.y = t * 2.2;
  return (
    <group>
      {/* counter + backsplash + wall with a window onto the city */}
      <mesh position={[0, 0.5, -0.2]} castShadow receiveShadow>
        <RoundedBoxGeo args={[7, 1.0, 2.2]} radius={0.05} />
        <meshStandardMaterial color="#d8d0c2" roughness={0.45} bumpMap={grain} bumpScale={0.3} />
      </mesh>
      <mesh position={[0, -1.6, -0.1]} receiveShadow>
        <RoundedBoxGeo args={[6.8, 3.2, 2.0]} radius={0.05} />
        <meshStandardMaterial color="#3e5a52" roughness={0.6} />
      </mesh>
      <AssetModel id="kitchen-sink-7ea438" size={2.4} ground position={[0, 1.0, -0.2]} polish="stone" />
      {/* water stream */}
      <mesh position={[TAP_SPOUT[0], 1.68, TAP_SPOUT[2]]}>
        <cylinderGeometry args={[0.045, 0.06, 1.1, 20, 1, true]} />
        <meshStandardMaterial map={tex} transparent opacity={0.85} roughness={0.05} emissive="#9fdcff" emissiveIntensity={0.25} />
      </mesh>
      {/* wall around the window opening (x −3..3, y 1.65..3.55) */}
      {[
        [-5.5, 3, 5, 10],
        [5.5, 3, 5, 10],
        [0, 5.8, 6, 4.5],
        [0, 0.3, 6, 2.7],
      ].map(([x, y, w, h], i) => (
        <mesh key={`w${i}`} position={[x, y, -1.4]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color="#e9e1d3" roughness={0.9} map={grain} />
        </mesh>
      ))}
      {[
        [0, 3.55, 6.2, 0.16],
        [0, 1.65, 6.2, 0.16],
        [-3.05, 2.6, 0.16, 2.06],
        [3.05, 2.6, 0.16, 2.06],
        [0, 2.6, 0.12, 2.0],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -1.3]} castShadow>
          <RoundedBoxGeo args={[w, h, 0.18]} radius={0.03} />
          <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
/** Window cut-out: the wall plane above has a hole drawn by this city seen through it. */
export const TapCity: React.FC = () => (
  <group position={[0, -30, -90]}>
    <AssetModel id="art-deco-setback-tower-b3a788" size={80} ground position={[-12, 0, -20]} polish="stone" />
    <AssetModel id="office-tower-1538cc" size={60} ground position={[16, 0, 0]} polish="stone" />
    <AssetModel id="office-tower-1538cc" size={50} ground position={[-34, 0, 10]} rotation={[0, 0.5, 0]} polish="stone" />
    <AssetModel id="prewar-apartment-house-1081a6" size={34} ground position={[34, 0, 20]} polish="stone" />
    <AssetModel id="rooftop-water-tower-b38362" size={7} ground position={[34, 34 * 0.8, 20]} polish="stone" />
  </group>
);

// ── REVEAL: Hudson bypass ─────────────────────────────────────────────────────────────
export const HUDSON = {
  ground: smoothPath([[-110, 10], [-36, 10], [-26, 6], [-18, -4], [0, -6], [18, -4], [26, 6], [36, 10], [110, 10]], 260),
  bottom: -170,
  depth: 60,
  old: smoothPath([[-110, -22], [-40, -22], [0, -22], [40, -22], [110, -22]], 160),
  bypass: smoothPath([[-42, -22], [-42, -30], [-36, -40], [0, -44], [36, -40], [42, -30], [42, -22]], 220),
  r: 2.6,
  R: 3.4,
};
const hudSkip = (x: number, y: number) => distToPath(HUDSON.old, x, y) < HUDSON.R || distToPath(HUDSON.bypass, x, y) < HUDSON.R;
export const HudsonSet: React.FC<{ t: number; bypass: number; oldFlow: number }> = ({ t, bypass, oldFlow }) => {
  const river = useMemo(() => basinPoly(HUDSON.ground, -33, 33, 4), []);
  return (
    <group>
      <SectionFace ground={HUDSON.ground} bottom={HUDSON.bottom} x0={-110} x1={110} nx={300} ny={150} skip={hudSkip} />
      <SectionTop ground={HUDSON.ground} x0={-110} x1={110} depth={HUDSON.depth} nx={220} />
      <SectionEnd ground={HUDSON.ground} x={110} bottom={HUDSON.bottom} depth={HUDSON.depth} />
      <WaterBody poly={river} depth={HUDSON.depth} color="#3d6f7c" streak="#b5dde0" t={t} flow={3} />
      <TunnelCut path={HUDSON.old} r={HUDSON.r} R={HUDSON.R} t={t} flow={6 * oldFlow} water={0.5 + 0.4 * oldFlow} waterColor={oldFlow > 0.5 ? "#2f86a8" : "#5d7480"} seed={8} />
      <TunnelCut path={HUDSON.bypass} r={HUDSON.r} R={HUDSON.R} t={t} flow={8} water={0.92 * bypass} glow={0.35 * bypass} seed={12} />
      <ShaftBand x={-46.5} y0={-22} y1={10.2} w={4} />
      <ShaftBand x={46.5} y0={-22} y1={10.2} w={4} />
      {[-90, -70, -55, 60, 80, 96].map((x, i) => (
        <Pine key={x} p={[x, 9.8, -8 - (i % 3) * 14]} i={i} s={9} />
      ))}
    </group>
  );
};

// ── PAYOFF: Sodetan Ciliwung (Jakarta) ────────────────────────────────────────────────
export const SOD = { pipes: [{ x: -5.2, y: -11, R: 2.6 }, { x: 5.2, y: -11, R: 2.6 }], r: 1.95, top: 0, bottom: -120, len: 90 };
export const SodetanSet: React.FC<{ t: number; flood: number }> = ({ t, flood }) => {
  const grain = useSurfaceGrain(61, 0.3, 3);
  const spout = useMemo(() => {
    // brown water tongue leaving each pipe mouth and falling into the canal
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, -0.2), new THREE.Vector3(0, 0.4, 5.5), new THREE.Vector3(0, -14, 9));
    return new THREE.TubeGeometry(c, 30, SOD.r * 0.9, 24, false);
  }, []);
  const tex = useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const cv = document.createElement("canvas");
    cv.width = 128;
    cv.height = 256;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#7a5a37";
    ctx.fillRect(0, 0, 128, 256);
    const r = mulberry32(9);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = r() > 0.5 ? "#a8875e" : "#5c4126";
      ctx.globalAlpha = 0.3 + r() * 0.5;
      ctx.fillRect(r() * 128, r() * 256, 30 + r() * 40, 2 + r() * 4);
    }
    const x = new THREE.CanvasTexture(cv);
    x.wrapS = x.wrapT = THREE.RepeatWrapping;
    x.colorSpace = THREE.SRGBColorSpace;
    return x;
  }, []);
  tex.offset.x = -t * 0.9;
  // white-water foam layer (seeded blobs) scrolling faster than the body of the water
  const foam = useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const cv = document.createElement("canvas");
    cv.width = 128;
    cv.height = 256;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, 128, 256);
    const r = mulberry32(23);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = r() > 0.4 ? "#f3e6cf" : "#d9c19a";
      ctx.globalAlpha = 0.25 + r() * 0.6;
      ctx.beginPath();
      ctx.ellipse(r() * 128, r() * 256, 2 + r() * 9, 1 + r() * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const x = new THREE.CanvasTexture(cv);
    x.wrapS = x.wrapT = THREE.RepeatWrapping;
    x.colorSpace = THREE.SRGBColorSpace;
    return x;
  }, []);
  foam.offset.x = -t * 1.7;
  const riverY = -1.0 + 1.3 * flood;
  return (
    <group>
      <HoleFace x0={-60} x1={60} y0={SOD.bottom} top={SOD.top} holes={SOD.pipes} n={170} />
      <SectionTop ground={[[-60, 0], [60, 0]]} x0={-60} x1={60} depth={SOD.len} color="#5e5b56" color2="#6e6a63" nx={80} seed={9} />
      <SectionEnd ground={[[-60, 0], [60, 0]]} x={60} bottom={SOD.bottom} depth={SOD.len} strata={STRATA_CITY} />
      {/* road with lane marks */}
      <mesh position={[0, 0.06, -18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 12]} />
        <meshStandardMaterial color="#3d3c3b" roughness={0.9} map={grain} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-55 + i * 10, 0.1, -18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 0.4]} />
          <meshStandardMaterial color="#e9e3d2" roughness={0.7} />
        </mesh>
      ))}
      {SOD.pipes.map((p, i) => (
        <group key={i}>
          <Pipe x={p.x} y={p.y} r={SOD.r} R={p.R} length={SOD.len} t={t} flow={6} waterColor="#7a5a37" streak="#b6936a" seed={14 + i} />
          <mesh geometry={spout} position={[p.x, p.y - SOD.r * 0.25, 0]} scale={[1.05, 0.55, flood]}>
            <meshStandardMaterial map={tex} roughness={0.05} transparent opacity={0.6} depthWrite={false} emissive="#8a6a44" emissiveIntensity={0.25} />
          </mesh>
          <mesh geometry={spout} position={[p.x, p.y - SOD.r * 0.2, 0.05]} scale={[1.25, 0.66, flood]}>
            <meshStandardMaterial map={foam} alphaMap={foam} transparent opacity={0.85} depthWrite={false} roughness={0.6} color="#fff6e6" />
          </mesh>
          {/* churn where the jet hits the canal */}
          <mesh position={[p.x, -20.85, 9 * flood]} rotation={[-Math.PI / 2, 0, t * 0.6]} scale={[flood, flood, 1]}>
            <circleGeometry args={[3.6, 40]} />
            <meshStandardMaterial map={foam} alphaMap={foam} transparent opacity={0.9} depthWrite={false} color="#fff3df" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* canal in front of the cut: concrete walls + brown water */}
      <mesh position={[0, -21, 16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 32]} />
        <meshStandardMaterial map={tex} roughness={0.15} emissive="#5c4126" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, -27, 33]} receiveShadow>
        <RoundedBoxGeo args={[120, 14, 2]} radius={0.2} />
        <meshStandardMaterial color="#a9a399" roughness={0.85} map={grain} />
      </mesh>
      {/* the river behind the street (Ciliwung), rising with the flood */}
      <mesh position={[0, riverY, -SOD.len - 17]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 34]} />
        <meshStandardMaterial map={tex} roughness={0.15} emissive="#5c4126" emissiveIntensity={0.12} />
      </mesh>
      {/* houses + palms along the street */}
      {[-48, -34, -20, 20, 34, 48].map((x, i) => (
        <AssetModel key={x} id="two-story-house-40f6dc" size={10} ground position={[x, 0, -34 - (i % 2) * 6]} rotation={[0, (i % 2) * Math.PI, 0]} polish="stone" />
      ))}
      {[-42, -27, 27, 42, -8, 8].map((x, i) => (
        <AssetModel key={x} id="palm-tree-a307da" size={9} ground position={[x, 0, -8 - (i % 2) * 3]} rotation={[0, i, 0]} />
      ))}
      <AssetModel id="tracked-excavator-8ebd3c" size={9} ground position={[-30, 0, -70]} rotation={[0, 0.8, 0]} />
    </group>
  );
};

export { STRATA, DAM_Z };
