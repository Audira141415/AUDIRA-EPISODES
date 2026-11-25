// AE-064 film (LIDARFORGE, Remotion + R3F): six scenes on the VO clock (timeline.json).
// HOOK runway + airliner → Kansai island sinking → KONTEKS wet clay block squeezed → MEKANISME PVD rig,
// preload, settlement plate → REVEAL Kansai deep section with sand drains → PAYOFF terminal columns
// jacked + shimmed → OUTRO airliner lands on a flat runway. LiDAR dots/curtains are effect layers only.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { CL, SEC, TOTAL, wordT } from "./timing.ts";
import {
  Airliner, AudiraBoard, BigFlow, C, CompareRig, Drains, FlowArrows, Gauge, WaterSheet, KansaiIsland, Mound, MudFace, PoreWater, PvdRig, Runway, SandDrains,
  ScanCurtain, ScanDots, SettlementPlate, Slab, Strata, TerminalHall, clamp01, ramp, type V3,
} from "./world.tsx";

const MONO = "Consolas, 'Cascadia Mono', 'SF Mono', monospace";
const HEAD = "Bahnschrift, 'Arial Narrow', 'Segoe UI', sans-serif";
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- scene boundaries (VO seconds) ----------------
const T_HB = CL[1].start - 0.2;
const T_K = SEC.KONTEKS[0] - 0.25;
const T_M = SEC.MEKANISME[0] - 0.25;
const T_R = SEC.REVEAL[0] - 0.25;
const T_P = SEC.PAYOFF[0] - 0.25;
const T_O = SEC.OUTRO[0] - 0.25;
export const T_CARD = SEC.OUTRO[1] + 0.2;
const T_CMP0 = CL[10].start - 0.1;
const T_CMP1 = CL[11].start - 0.1;
const CUTS = [T_HB, T_K, T_M, T_R, T_CMP0, T_CMP1, T_P, T_O];

// ---------------- shots: a→b drift per shot, never parked ----------------
type Pose = { pos: V3; target: V3; fov: number };
type Shot = { t0: number; t1: number; a: Pose; b: Pose };
const P = (pos: V3, target: V3, fov = 40): Pose => ({ pos, target, fov });

// mekanisme rig travel
const T_RIG0 = wordT(6, "tanah") - 0.1;
const T_RIG1 = wordT(6, "jalur") - 0.1;
const RIG_X0 = -8.25, RIG_X1 = 3.75;
const rigX = (t: number) => {
  if (t < T_RIG0) return lerp(-14, RIG_X0, ramp(t, SEC.MEKANISME[0] - 0.2, T_RIG0));
  if (t < T_RIG1) return lerp(RIG_X0, RIG_X1, (t - T_RIG0) / (T_RIG1 - T_RIG0));
  return lerp(RIG_X1, 14, ramp(t, T_RIG1 + 1.2, T_RIG1 + 3.6));
};

const HERO = { x: -2.2 * 2 + 1.1, z: 0 }; // column index 1 of a 6-wide grid, dx 2.2
const SHOTS: Shot[] = [
  // HOOK A — airliner over the runway, then crane down the cut face to the soft mud
  { t0: -1, t1: 2.7, a: P([5.5, 2.2, 8], [0, 7.2, -26], 40), b: P([5.0, 2.6, 6], [0, 5.6, -14], 40) },
  { t0: 2.7, t1: T_HB, a: P([12.5, 0.2, -12], [5.6, -2.0, -24], 40), b: P([10.6, -1.6, -17], [5.8, -2.6, -26], 40) },
  // HOOK B — Kansai island from the air
  { t0: T_HB, t1: T_K, a: P([30, 23, 34], [0, 1.5, 0], 34), b: P([21, 12.5, 25], [0, 0.8, 3], 34) },
  // KONTEKS — pores close-up, fill + squeeze, pull back
  { t0: T_K, t1: CL[3].start - 0.1, a: P([1.3, -1.5, 5.6], [0, -1.9, 2.2], 40), b: P([0.5, -1.8, 4.6], [0, -2.0, 2.2], 40) },
  { t0: CL[3].start - 0.1, t1: CL[4].start - 0.1, a: P([7.8, 3.0, 9.0], [0, -1.0, 0], 38), b: P([5.6, 1.8, 9.8], [0, -1.2, 0], 38) },
  { t0: CL[4].start - 0.1, t1: T_M, a: P([5.4, 1.9, 9.6], [0, -1.2, 0], 38), b: P([8.5, 6.5, 13.5], [0, -0.8, 0], 38) },
  // MEKANISME
  { t0: T_M, t1: T_RIG0, a: P([-10.5, 4.6, 13], [-5, 0.8, 0], 40), b: P([-8.2, 3.4, 11.2], [-5.2, 0.4, 0], 40) },
  // wide, slow truck: the rig crosses the frame instead of the camera racing along with it
  { t0: T_RIG0, t1: T_RIG1, a: P([-3.2, 3.4, 15.5], [-3.6, -0.4, 1], 40), b: P([0.6, 2.8, 14.8], [0.4, -0.8, 1.5], 40) },
  { t0: T_RIG1, t1: CL[7].start, a: P([1.05, -1.3, 11.5], [0.62, -2.3, 3], 40), b: P([0.75, -1.7, 10.4], [0.62, -2.5, 3], 40) },
  { t0: CL[7].start, t1: CL[8].start - 0.05, a: P([13, 6.5, 14], [0, 0.4, 0], 38), b: P([10.5, 5.0, 15], [0, 0.6, 0], 38) },
  { t0: CL[8].start - 0.05, t1: wordT(8, "pelat") - 0.2, a: P([-2.7, -1.7, 7.6], [-1.4, -1.8, 3], 40), b: P([-1.7, -0.9, 7.0], [-1.4, -1.4, 3], 40) },
  { t0: wordT(8, "pelat") - 0.2, t1: T_R, a: P([-6.8, 4.6, 9.5], [-2.0, 1.6, 2.4], 40), b: P([-5.2, 3.8, 8.4], [-2.0, 1.4, 2.4], 40) },
  // REVEAL — Kansai deep section
  { t0: T_R, t1: CL[10].start - 0.1, a: P([8.5, 3.0, 14], [0, -2.5, 0], 40), b: P([6.4, -1.8, 11.5], [0, -6.0, 1], 40) },
  { t0: T_CMP0, t1: T_CMP1, a: P([1.2, 1.1, 16.0], [0, -0.45, 0], 40), b: P([0.4, 0.7, 14.6], [0, -0.5, 0], 40) },
  { t0: CL[11].start - 0.1, t1: T_P, a: P([6.5, -8.5, 15], [0, -10, 0], 40), b: P([4.2, -22, 16.5], [0, -21, 0], 40) },
  // PAYOFF — terminal columns
  { t0: T_P, t1: CL[13].start - 0.1, a: P([11.5, 2.0, 9.5], [0, 1.7, -6], 42), b: P([8.8, 3.0, 8.2], [0, 1.6, -6], 42) },
  { t0: CL[13].start - 0.1, t1: wordT(13, "dan") - 0.1, a: P([-13, 9.5, 6], [0, 1.0, -7], 40), b: P([-9.5, 10.5, -2], [0, 1.0, -7.5], 40) },
  { t0: wordT(13, "dan") - 0.1, t1: T_O, a: P([HERO.x + 3.2, 2.0, 6.6], [HERO.x, 1.8, 0], 44), b: P([HERO.x + 2.3, 1.7, 5.8], [HERO.x, 1.7, 0], 44) },
  // OUTRO — landing on a flat runway
  { t0: T_O, t1: TOTAL + 1, a: P([6.8, 1.1, 8.5], [0, 2.8, -16], 42), b: P([5.6, 1.7, 6.2], [0, 1.6, -9], 42) },
];
const poseAt = (t: number): Pose => {
  const s = SHOTS.find((x) => t >= x.t0 && t < x.t1) ?? SHOTS[SHOTS.length - 1];
  const u = clamp01((t - s.t0) / (s.t1 - s.t0));
  // 25% linear + 75% sine ease: the camera never comes to a full stop inside a shot
  const k = 0.25 * u + 0.75 * Easing.inOut(Easing.sin)(u);
  return { pos: lerp3(s.a.pos, s.b.pos, k), target: lerp3(s.a.target, s.b.target, k), fov: lerp(s.a.fov, s.b.fov, k) };
};

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.lookAt(new THREE.Vector3(...pose.target));
    c.fov = pose.fov;
    c.near = 0.1;
    c.far = 600;
    c.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

// ================================================================ scenes
const HookA: React.FC<{ t: number }> = ({ t }) => {
  const scanZ = lerp(8, -62, ramp(t, 0.3, 4.6));
  const k = clamp01(t / T_HB);
  const planeZ = lerp(-36, 2, k);
  const planeY = lerp(8.5, 3.6, k);
  const mud = ramp(t, wordT(0, "tanah") - 0.3, wordT(0, "selembek"));
  return (
    <group>
      <Strata w={12} d={70} top={0} z={-27} layers={[{ h: 0.7, color: C.crust }, { h: 4, color: C.clay, rough: 0.35, clear: 0.6 }, { h: 2.5, color: C.stiff }]} />
      <MudFace w={70} h={3.96} pos={[6.02, -2.7, -27]} rotY={Math.PI / 2} t={t} amp={0.4 + 1.6 * mud} />
      <Runway len={64} w={4} y={0} z={-27} />
      <ScanDots w={11.6} d={70} z0={-27} nx={34} nz={150} y={() => 0} reveal={(x, z) => (z > scanZ && Math.abs(x) > 2.3 ? 1 : 0)} />
      <ScanCurtain pos={[0, 0, scanZ]} w={12.2} h={6} />
      <Airliner pos={[0, planeY, planeZ]} pitch={0.1} size={11} />
    </group>
  );
};

const SINK_T0 = wordT(1, "turun") - 0.3;
const SINK_T1 = wordT(1, "empat");
const HookB: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, SINK_T0, SINK_T1);
  return (
    <group>
      <KansaiIsland sink={k * 2.4} t={t} />
      <Gauge pos={[6.6, 3.2, 9]} h={3} k={k * 0.8} />
    </group>
  );
};

const Konteks: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = ramp(t, wordT(3, "terperas"), wordT(3, "ambles") + 0.6) * 0.42 + ramp(t, CL[4].start, T_M + 0.3) * 0.14;
  const fill = ramp(t, wordT(3, "ditimbun") - 0.1, wordT(3, "ditimbun") + 1.0);
  const squeeze = ramp(t, wordT(3, "air"), wordT(3, "ambles") + 0.5) * 0.8 + ramp(t, CL[4].start, T_M) * 0.2;
  const truckX = lerp(7, 2.3, ramp(t, CL[2].start + 0.2, wordT(3, "ditimbun")));
  return (
    <group>
      <Strata w={6} d={4.5} top={-s} layers={[{ h: 0.3, color: C.crust }, { h: 3.4 - s, color: C.clay, rough: 0.3, clear: 0.7 }, { h: 1.0, color: C.stiff }]} scan={{ cell: 0.12, sweep: lerp(-4, 4, (t * 0.35) % 1) }} />
      <PoreWater w={6} top={-s - 0.3} bot={-3.7} z={2.25} squeeze={squeeze} />
      <WaterSheet w={2.2} d={1.6} pos={[1.6, -s + 0.02, 1.3]} t={t} k={squeeze} />
      <Mound bw={3.8} tw={1.6} h={fill * 1.3} d={4.0} pos={[-0.9, -s, 0]} color={C.fill} />
      <group position={[truckX, -s, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <AssetModel id="articulated-dump-truck-ee50f3" assetType="vehicle" size={2.6} ground tint={C.amber} roughness={0.5} fallback={<Slab size={[1, 1, 2.6]} pos={[0, 0.5, 0]} color={C.amber} />} />
      </group>
      <ScanDots w={6} d={4.5} nx={24} nz={18} y={() => -s} reveal={(x) => (x < lerp(-3.2, 3.2, ramp(t, T_K, T_K + 1.6)) ? 1 : 0)} color={C.coral} size={0.05} />
      {void f}
    </group>
  );
};

const Mekanisme: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s2 = ramp(t, wordT(8, "air"), T_R) * 0.4;
  const rx = rigX(t);
  const installing = t > T_RIG0 && t < T_RIG1 + 0.3;
  const stroke = installing ? 0.5 + 0.5 * Math.sin((t - T_RIG0) * Math.PI * 2 * 2.2) : 0;
  const COLS = 9, DX = 1.25, X0 = -5;
  const grow = (i: number) => {
    const c = i % COLS;
    const x = X0 + c * DX;
    const tc = T_RIG0 + ((x - 1.75 - RIG_X0) / (RIG_X1 - RIG_X0)) * (T_RIG1 - T_RIG0);
    return ramp(t, tc - 0.15, tc + 0.3);
  };
  const preload = ramp(t, wordT(7, "ditimbun") - 0.2, wordT(7, "nanti"));
  const side = ramp(t, wordT(6, "jalur"), wordT(6, "jalur") + 0.4) * (1 - ramp(t, CL[7].start, CL[7].start + 0.4));
  const up = ramp(t, wordT(8, "air") - 0.1, wordT(8, "air") + 0.4);
  const sandGlow = ramp(t, wordT(8, "drain"), wordT(8, "drain") + 0.8);
  const frontX = Array.from({ length: COLS }, (_, c) => X0 + c * DX);
  const dozerX = lerp(-3, 2.5, ramp(t, CL[7].start, CL[8].start + 2));
  return (
    <group>
      <Strata w={12} d={6} top={-s2} layers={[{ h: 0.35, color: C.sand, scan: { dot: C.teal, dotI: 1.3 + sandGlow * 2.2 } }, { h: 4.2 - s2, color: C.clay, rough: 0.32, clear: 0.7 }, { h: 1.4, color: C.stiff }]} scan={{ cell: 0.13 }} />
      <Drains cols={COLS} rows={4} dx={DX} dz={1.3} x0={X0} z0={-0.9} top={-s2} depth={4.5 - s2} grow={grow} />
      <Drains cols={COLS} rows={1} dx={DX} dz={0} x0={X0} z0={3.0} top={-s2} depth={4.5 - s2} grow={grow} glow={up * 0.6} />
      <BigFlow gapX={0.625} drains={[0, 1.25]} ys={[-1.4 - s2, -2.5 - s2, -3.6 - s2]} z={3.1} t={t} on={side} />
      <FlowArrows drainsX={frontX} top={-s2 - 0.35} bot={-4.55} z={3.0} t={t} on={up} up />
      {rx < 13 ? <PvdRig pos={[rx, -s2, 0.6]} stroke={stroke} /> : null}
      {preload > 0.001 ? <Mound bw={11.4} tw={7} h={preload * 2.2} d={5.6} pos={[0, -s2, 0]} scan={{ sweep: lerp(-6, 6, (t * 0.3) % 1) }} /> : null}
      {preload > 0.5 ? (
        <group position={[dozerX, -s2 + preload * 2.2, 0.3]} rotation={[0, Math.PI / 2, 0]}>
          <AssetModel id="crawler-bulldozer-b851fb" assetType="vehicle" size={2.2} ground tint="#f2b13d" roughness={0.45} fallback={<Slab size={[1.4, 1, 1.4]} pos={[0, 0.5, 0]} color={C.amber} />} />
        </group>
      ) : null}
      {t > CL[8].start - 0.2 ? <SettlementPlate pos={[-2.0, -s2, 2.4]} rodH={2.75} /> : null}
      {t < T_RIG0 + 0.5 ? <ToyPerson f={f} seed={64} pose="point" outfit="uniform" position={[-4.2, -s2, 2.2]} heading={-0.4} scale={1.15} /> : null}
      {t > CL[8].start - 0.2 ? <ToyPerson f={f} seed={65} pose="think" outfit="uniform" position={[-3.0, -s2 + 2.2 * preload, 2.0]} heading={0.5} scale={1.15} /> : null}
    </group>
  );
};

const DEEP_TOP = -9.5;
const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const settle = ramp(t, CL[10].start, CL[10].end) * 0.35 + ramp(t, wordT(11, "masih"), T_P) * 0.08;
  const drainsGlow = ramp(t, wordT(9, "satu"), wordT(9, "satu") + 0.4) * (1.6 - 1.2 * ramp(t, CL[10].start, CL[10].start + 1));
  const deepHL = ramp(t, wordT(11, "lempung"), wordT(11, "dalam") + 0.3);
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const top = 1.5 - settle;
  const holoTop = -4.5 - settle;
  const deep = Array.from({ length: 10 }, (_, i) => ({ h: 2.2, color: i % 2 ? C.sandDeep : C.clayDeep, scan: i % 2 ? {} : { dot: deepHL > 0.05 ? C.coral : C.teal, dotI: 1.2 + deepHL * (1.2 + 1.4 * pulse), rim: C.coral, rimI: 0.4 + deepHL * 0.8 } }));
  if (t >= T_CMP0 && t < T_CMP1) return <CompareRig t={t} t0={wordT(10, "lapisan")} tDone={wordT(10, "satu")} tEnd={CL[10].end + 0.3} />;
  return (
    <group>
      {/* island fill + runway on top, sea on both sides */}
      <Slab size={[6, top - holoTop, 6]} pos={[0, (top + holoTop) / 2, 0]} color={C.fill} rough={0.92} scan={{ cell: 0.16 }} />
      <Runway len={6} w={2.6} y={top} />
      {[-4, 4].map((x) => (
        <Slab key={x} size={[2, 4.5, 6]} pos={[x, -2.25, 0]} color={C.tealDeep} rough={0.08} clear={1} opacity={0.85} scan={{ cell: 0.2, dens: 0.45, dark: 0.2, sweep: -4.5 + ((t * 0.9) % 1) * 5, dir: [0, 1, 0] }} />
      ))}
      <Strata w={10} d={6} top={holoTop} layers={[{ h: 5 - settle * 0.6, color: C.clay, rough: 0.3, clear: 0.6 }]} />
      <SandDrains cols={9} rows={6} dx={0.62} dz={0.95} z0={2.96} top={holoTop} len={5 - settle * 0.6} glow={drainsGlow} />
      <Strata w={10} d={6} top={DEEP_TOP} layers={deep} />
      <pointLight position={[5, -15, 9]} intensity={60 * (0.4 + deepHL)} distance={34} color="#ffd9c8" />
      <pointLight position={[-6, -3, 9]} intensity={25} distance={22} color={C.teal} />
    </group>
  );
};

const W13 = CL[13].words;
const T_TURUN = W13[9].s, T_DONGKRAK = W13[10].s, T_GANJAL = W13[12].s, T_PELAT = W13[13].s;
const Payoff: React.FC<{ t: number }> = ({ t }) => {
  const scanZ = lerp(2.5, -17, ramp(t, T_P + 0.3, wordT(13, "otomatis") + 0.3));
  const allOn = ramp(t, wordT(13, "diukur"), wordT(13, "diukur") + 0.5);
  const drop = ramp(t, T_TURUN - 0.3, T_TURUN + 0.5) * 0.24;
  const lift = ramp(t, T_DONGKRAK, T_DONGKRAK + 0.7) * 0.24;
  const shim = ramp(t, T_GANJAL - 0.1, T_PELAT + 0.5);
  return (
    <TerminalHall
      cols={6}
      rows={7}
      dx={2.2}
      dz={2.4}
      scanZ={scanZ}
      measured={(i) => {
        const z = -Math.floor(i / 6) * 2.4;
        const on = z > scanZ ? 1 : 0;
        return Math.max(on, allOn) * (0.8 + 0.2 * Math.sin(t * 6 + i));
      }}
      heroDrop={drop}
      heroLift={lift}
      shim={shim}
      skip={1}
    />
  );
};

const T_TD = wordT(14, "dikendalikan");
const OutroScene: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, T_O - 0.4, T_TD);
  const lin = clamp01((t - (T_O - 0.4)) / (T_TD - T_O + 0.4));
  const z = t < T_TD ? lerp(-64, -9, lin) : lerp(-9, -2.5, Easing.out(Easing.cubic)(clamp01((t - T_TD) / 3)));
  const y = t < T_TD ? lerp(11, 1.15, Math.pow(lin, 0.8)) : 1.15;
  const pitch = t < T_TD ? 0.1 : 0.1 * (1 - clamp01((t - T_TD) / 0.8));
  const scanZ = lerp(6, -70, ramp(t, T_O, T_O + 3.2));
  void k;
  return (
    <group>
      <Slab size={[60, 0.4, 120]} pos={[0, -0.2, -40]} color="#2c2418" rough={0.95} grain={9} />
      <Runway len={90} w={4.5} y={0} z={-36} />
      <ScanDots w={4.2} d={90} z0={-36} nx={12} nz={160} y={() => 0.2} reveal={(_, zz) => (zz > scanZ ? 1 : 0)} color={C.teal} size={0.06} />
      <ScanCurtain pos={[0, 0, scanZ]} w={5} h={4} />
      <AudiraBoard pos={[3.9, 0, -3]} rotY={0.2} scale={0.8} />
      <mesh position={[-30, 14, -160]}>
        <sphereGeometry args={[9, 32, 20]} />
        <meshBasicMaterial color="#ffb36b" toneMapped={false} />
      </mesh>
      <Airliner pos={[0, y, z]} pitch={pitch} size={11} />
    </group>
  );
};

// ================================================================ HUD
type Callout = { t0: number; t1: number; title: string; sub?: string; accent: string; slot: 0 | 1; count?: { to: number; fmt: (v: number) => string; dur: number } };
const id = (v: number) => v.toLocaleString("id-ID");
const CALLOUTS: Callout[] = [
  { t0: wordT(0, "landasan"), t1: T_HB - 0.1, title: "LANDASAN PACU", sub: "harus rata", accent: C.amber, slot: 0 },
  { t0: wordT(0, "selembek"), t1: T_HB - 0.1, title: "TANAH SELEMBEK BUBUR", sub: "lempung lunak di bawahnya", accent: C.teal, slot: 1 },
  { t0: wordT(1, "kansai"), t1: T_K - 0.1, title: "BANDARA KANSAI · JEPANG", sub: "pulau buatan di laut", accent: C.amber, slot: 0 },
  { t0: wordT(1, "turun"), t1: T_K - 0.1, title: "TURUN 13,72 m", sub: "sejak awal konstruksi (data Des 2025)", accent: C.coral, slot: 1, count: { to: 1372, fmt: (v) => `TURUN ${(v / 100).toFixed(2).replace(".", ",")} m`, dur: 0.55 } },
  { t0: wordT(2, "lempung"), t1: CL[3].start + 1.2, title: "LEMPUNG LUNAK", sub: "pori-porinya penuh air", accent: C.teal, slot: 0 },
  { t0: wordT(3, "ditimbun"), t1: CL[4].start - 0.1, title: "DITIMBUN → AIR TERPERAS", sub: "pelan-pelan keluar dari pori", accent: C.amber, slot: 0 },
  { t0: wordT(3, "ambles"), t1: CL[4].start - 0.1, title: "TANAH AMBLES ↓", accent: C.coral, slot: 1 },
  { t0: wordT(4, "puluhan"), t1: T_M - 0.1, title: "SECARA ALAMI: PULUHAN TAHUN", accent: C.coral, slot: 0 },
  { t0: wordT(5, "insinyur"), t1: T_RIG1 - 0.6, title: "DIPERCEPAT", sub: "rig crawler + mandrel baja", accent: C.amber, slot: 0 },
  { t0: wordT(6, "ribuan"), t1: T_RIG1 - 0.1, title: "RIBUAN DRAIN VERTIKAL", sub: "pita plastik berlapis geotekstil", accent: C.teal, slot: 1 },
  { t0: wordT(6, "jalur"), t1: CL[7].start - 0.1, title: "JALUR AIR PENDEK", sub: "ke samping, lalu naik lewat drain", accent: C.teal, slot: 0 },
  { t0: wordT(7, "ditimbun"), t1: CL[8].start - 0.1, title: "TIMBUNAN PRA-BEBAN", sub: "lebih berat dari beban bandara", accent: C.amber, slot: 0 },
  { t0: wordT(8, "terdorong"), t1: wordT(8, "pelat") - 0.1, title: "AIR KELUAR LEWAT DRAIN", sub: "ditampung lapisan pasir", accent: C.teal, slot: 0 },
  { t0: wordT(8, "pelat"), t1: T_R - 0.1, title: "PELAT UKUR PENURUNAN", sub: "setiap sentimeter dicatat", accent: C.coral, slot: 0 },
  { t0: wordT(9, "kansai"), t1: CL[10].start - 0.1, title: "KANSAI · PULAU 1", accent: C.amber, slot: 0 },
  { t0: wordT(9, "satu") - 0.6, t1: CL[10].start - 0.1, title: "1.000.000 TIANG PASIR", sub: "panjang 20 m · jarak 2,5 m", accent: C.coral, slot: 1, count: { to: 1000000, fmt: (v) => `${id(Math.round(v))} TIANG PASIR`, dur: 0.55 } },
  { t0: wordT(10, "penurunan"), t1: CL[11].start - 0.1, title: "LAPISAN LEMPUNG ATAS", sub: "puluhan tahun → ± 1 tahun", accent: C.teal, slot: 0 },
  { t0: wordT(11, "lempung"), t1: T_P - 0.1, title: "LEMPUNG JAUH LEBIH DALAM", sub: "tidak bisa diperbaiki", accent: C.coral, slot: 0 },
  { t0: wordT(11, "kurang"), t1: T_P - 0.1, title: "< 10 cm / TAHUN", sub: "laju penurunan kini (pulau 1)", accent: C.amber, slot: 1 },
  { t0: wordT(12, "pemantauan"), t1: CL[13].start - 0.1, title: "PEMANTAUAN TANPA HENTI", accent: C.teal, slot: 0 },
  { t0: wordT(13, "sembilan") - 0.6, t1: wordT(13, "dan") - 0.1, title: "900 KOLOM TERMINAL", sub: "diukur otomatis", accent: C.amber, slot: 1, count: { to: 900, fmt: (v) => `${Math.round(v)} KOLOM TERMINAL`, dur: 0.55 } },
  { t0: wordT(13, "didongkrak"), t1: T_O - 0.1, title: "DIDONGKRAK", sub: "kolom diangkat kembali", accent: C.coral, slot: 0 },
  { t0: wordT(13, "diganjal"), t1: T_O - 0.1, title: "DIGANJAL PELAT BAJA", accent: C.steel, slot: 1 },
  { t0: wordT(14, "dikendalikan"), t1: T_CARD - 0.1, title: "BUKAN DIAM — DIKENDALIKAN", accent: C.teal, slot: 0 },
];

const CalloutCard: React.FC<{ c: Callout; t: number; k: number }> = ({ c, t, k }) => {
  const a = Easing.out(Easing.back(1.5))(clamp01((t - c.t0) / 0.4));
  const fade = Math.min(clamp01((t - c.t0) / 0.15), 1 - clamp01((t - (c.t1 - 0.2)) / 0.2));
  const title = c.count ? c.count.fmt(c.count.to * Easing.out(Easing.cubic)(clamp01((t - c.t0) / c.count.dur))) : c.title;
  const top = c.slot === 0 ? 340 : 560;
  const sweep = clamp01((t - c.t0) / 0.35);
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 64 * k, top: top * k, display: "flex", justifyContent: "center", opacity: fade, transform: `translateY(${(1 - a) * 30 * k}px) scale(${0.94 + 0.06 * a})` }}>
      <div style={{ position: "relative", background: "rgba(5,9,12,0.84)", borderLeft: `${10 * k}px solid ${c.accent}`, borderRadius: 6 * k, padding: `${18 * k}px ${30 * k}px ${20 * k}px`, boxShadow: `0 0 ${28 * k}px ${c.accent}44`, overflow: "hidden", maxWidth: 950 * k }}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 62 * k, letterSpacing: 1.5 * k, color: "#f4f7f8", lineHeight: 1.05, whiteSpace: "nowrap" }}>{title}</div>
        {c.sub ? <div style={{ fontFamily: MONO, fontSize: 36 * k, color: c.accent, marginTop: 8 * k }}>{c.sub}</div> : null}
        <div style={{ position: "absolute", left: 0, bottom: 0, height: 4 * k, width: `${sweep * 100}%`, background: c.accent, boxShadow: `0 0 ${10 * k}px ${c.accent}` }} />
      </div>
    </div>
  );
};

/** Settlement-vs-time plot drawn in sync with the plate reading (mekanisme). */
const SettleGraph: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const t0 = wordT(8, "pelat");
  if (t < t0 + 0.2 || t > T_R - 0.1) return null;
  const p = clamp01((t - t0 - 0.2) / (T_R - t0 - 0.6));
  const pts = Array.from({ length: 41 }, (_, i) => {
    const u = (i / 40) * p;
    return `${40 + u * 520},${40 + (1 - Math.exp(-u * 3.2)) * 200}`;
  }).join(" ");
  return (
    <div style={{ position: "absolute", left: 220 * k, top: 760 * k, opacity: clamp01((t - t0 - 0.2) / 0.3) }}>
      <svg width={640 * k} height={330 * k} viewBox="0 0 640 330">
        <rect x={0} y={0} width={640} height={330} rx={8} fill="rgba(5,9,12,0.84)" />
        <line x1={40} y1={40} x2={600} y2={40} stroke="#7d8a90" strokeWidth={2} />
        <line x1={40} y1={40} x2={40} y2={270} stroke="#7d8a90" strokeWidth={2} />
        <polyline points={pts} fill="none" stroke={C.coral} strokeWidth={6} strokeLinecap="round" />
        <text x={330} y={305} fill="#e6ecef" fontFamily={MONO} fontSize={34} textAnchor="middle">waktu →</text>
        <text x={58} y={258} fill={C.teal} fontFamily={MONO} fontSize={34}>penurunan ↓</text>
      </svg>
    </div>
  );
};

const KICK: { t0: number; label: string }[] = [
  { t0: 0, label: "01 LANDASAN DI TANAH LUNAK" },
  { t0: T_HB, label: "01 KANSAI · OSAKA, JEPANG" },
  { t0: T_K, label: "02 PENAMPANG LEMPUNG" },
  { t0: T_M, label: "03 DRAIN + PRA-BEBAN" },
  { t0: T_R, label: "04 PENAMPANG KANSAI" },
  { t0: T_CMP0, label: "04 DRAIN PASIR vs TANPA DRAIN" },
  { t0: T_CMP1, label: "04 PENAMPANG KANSAI" },
  { t0: T_P, label: "05 KOLOM TERMINAL 1" },
  { t0: T_O, label: "06 LANDASAN TERKENDALI" },
];
const Kicker: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const cur = [...KICK].reverse().find((x) => t >= x.t0) ?? KICK[0];
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 64 * k, top: 262 * k, display: "flex", alignItems: "center", gap: 14 * k, opacity: clamp01((t - cur.t0) / 0.3) }}>
      <div style={{ width: 18 * k, height: 18 * k, borderRadius: 9 * k, background: C.coral, opacity: blink ? 1 : 0.35, boxShadow: `0 0 ${12 * k}px ${C.coral}` }} />
      <span style={{ fontFamily: MONO, fontSize: 34 * k, color: "#eef3f5", background: "rgba(5,9,12,0.7)", padding: `${2 * k}px ${12 * k}px`, letterSpacing: 1 * k, whiteSpace: "nowrap" }}>SCAN // {cur.label}</span>
      <div style={{ flex: 1, height: 2 * k, background: C.coral, opacity: 0.6 }} />
    </div>
  );
};

// ---------------- karaoke captions ----------------
type Chunk = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CL.forEach((c) => {
    const ws = c.words;
    const n = Math.ceil(ws.length / 6);
    const size = Math.ceil(ws.length / n);
    for (let i = 0; i < ws.length; i += size) {
      let part = ws.slice(i, i + size);
      const rest = ws.length - (i + size);
      if (rest === 1) part = ws.slice(i, i + size + 1);
      out.push({ words: part, s: part[0].s - 0.08, e: 0 });
      if (rest === 1) break;
    }
  });
  out.forEach((ch, i) => (ch.e = i + 1 < out.length ? Math.min(out[i + 1].s, ch.words[ch.words.length - 1].e + 0.6) : ch.words[ch.words.length - 1].e + 0.6));
  return out;
})();
const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch || t >= T_CARD) return null;
  const n = ch.words.length;
  const lines = n > 4 ? [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))] : [ch.words];
  const appear = Easing.out(Easing.cubic)(clamp01((t - ch.s) / 0.18));
  const longest = Math.max(...lines.map((ln) => ln.reduce((a, w) => a + w.w.length, 0) * 0.56 * 54 + (ln.length - 1) * 24));
  const fs = 54 * Math.min(1, 880 / longest);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (lines.length > 1 ? 1300 : 1340) * k, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(5,9,12,0.82)", borderLeft: `${6 * k}px solid ${C.teal}`, padding: `${14 * k}px ${30 * k}px`, opacity: appear, transform: `translateY(${(1 - appear) * 14 * k}px)`, maxWidth: 960 * k }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: 24 * k, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            {ln.map((w, wi) => {
              const on = t >= w.s - 0.03 && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const pop = on ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span key={wi} style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs * k, color: on ? C.coral : done ? "#f2f6f7" : "rgba(242,246,247,0.5)", transform: `scale(${pop})`, display: "inline-block" }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Laser wipe at each scene change: a coral scan line sweeps the frame while it dims. */
const Wipe: React.FC<{ t: number; k: number; H: number }> = ({ t, k, H }) => {
  const c = CUTS.find((x) => Math.abs(t - x) < 0.25);
  if (c === undefined) return null;
  const u = clamp01((t - (c - 0.25)) / 0.5);
  const dim = 1 - Math.abs(u - 0.5) * 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#020406", opacity: dim * 0.55 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: u * H - 3 * k, height: 6 * k, background: C.coral, boxShadow: `0 0 ${30 * k}px ${10 * k}px ${C.coral}88` }} />
    </AbsoluteFill>
  );
};

// ================================================================ film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = W / 1080;
  const pose = poseAt(t);
  const warm = t >= T_O;
  const deep = t >= T_R && t < T_P;
  return (
    <AbsoluteFill style={{ backgroundColor: C.void }}>
      <ThreeCanvas width={W} height={H} dpr={1} shadows camera={{ fov: pose.fov, position: pose.pos, near: 0.1, far: 600 }}>
        <Rig pose={pose} />
        <fog attach="fog" args={[warm ? "#1a120c" : C.void, deep ? 30 : 18, deep ? 70 : 75]} />
        <hemisphereLight args={[warm ? "#ffd6a8" : "#9fb7c4", "#1a120a", warm ? 0.7 : 0.5]} />
        <directionalLight position={warm ? [-18, 9, -30] : [-12, 20, 12]} intensity={warm ? 3.0 : 2.9} color={warm ? "#ffc58a" : "#fff1dc"} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-camera-near={1} shadow-camera-far={120} shadow-bias={-0.0004} />
        <directionalLight position={[10, 6, -14]} intensity={1.8} color={C.teal} />
        <directionalLight position={[-14, 3, -10]} intensity={1.1} color={C.coral} />
        {!(t >= T_HB && t < T_K) && <pointLight position={[6, 4, 10]} intensity={18} distance={30} color="#ffd2a0" />}
        {t < T_HB && <HookA t={t} />}
        {t >= T_HB && t < T_K && <HookB t={t} />}
        {t >= T_K && t < T_M && <Konteks t={t} f={f} />}
        {t >= T_M && t < T_R && <Mekanisme t={t} f={f} />}
        {deep && <Reveal t={t} />}
        {t >= T_P && t < T_O && <Payoff t={t} />}
        {t >= T_O && <OutroScene t={t} />}
        <Finish frame={frame} background={warm ? "#120d09" : C.void} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={t >= T_P && t < T_O ? 0.92 : 1} envIntensity={0.55} hdri="studio" ao={false} />
      </ThreeCanvas>
      <Kicker t={t} k={k} />
      {CALLOUTS.filter((c) => t >= c.t0 && t < c.t1).map((c, i) => (
        <CalloutCard key={i} c={c} t={t} k={k} />
      ))}
      <SettleGraph t={t} k={k} />
      <Captions t={t} k={k} />
      <Wipe t={t} k={k} H={H} />
      <Outro start={T_CARD} />
    </AbsoluteFill>
  );
};
