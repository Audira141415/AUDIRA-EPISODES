// AE-060 film (BEDAH): "Bagaimana Dermaga Dibangun di Atas Laut?"
// Audio Master Clock: every shot, state change, pin and caption is keyed to timeline.json word times (timing.ts).
// Director: one world state per section (complete jetty → map → depth profile → barge build → section close-up →
// timelapse → deck assembly → floating pontoon → cutaway outro). Deterministic: everything from useCurrentFrame().
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { MANROPE } from "../../core/type/fonts.ts";
import "../../core/type/displayFonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import {
  Barge, Crane, craneTip, DECK_Y, DepthRuler, DrivenPile, Ground, Hammer, HEAD_X0, HeadDeck, jettyPiles, Lights, mats,
  PILE_LEN, PILE_R, PILE_TOP, Piles, PontoonSet, Ring, Rope, Sea, seabedY, Ship, Shore, Signboard, Sky, TrestleDeck, Vibro,
  type PileSpec, type V3,
} from "./World.tsx";
import { CL, SEC, TOTAL, wordT } from "./timing.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => ease(c01((t - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const FONT = `${MANROPE}, sans-serif`;
const ACCENT = "#ffd23f";
const CARD = "rgba(10,22,34,0.84)";

// ------------------------------------------------------------------ clock (VO seconds)
export const T = {
  KONTEKS: SEC.KONTEKS[0] - 0.3,
  PROFILE: CL[3].start - 0.2,
  MEKANISME: SEC.MEKANISME[0] - 0.3,
  CRANE: CL[5].start - 0.1,
  VIBRO: wordT(5, "digetarkan") - 0.3,
  HAMMER: CL[6].start - 0.15,
  REVEAL: SEC.REVEAL[0] - 0.3,
  TIP: CL[9].start - 0.2,
  TIME: CL[10].start - 0.2,
  PAYOFF: SEC.PAYOFF[0] - 0.3,
  PONTOON: CL[12].start - 0.1,
  OUTRO: SEC.OUTRO[0] - 0.3,
  CARD: SEC.OUTRO[1] + 0.2,
};
const TL0 = wordT(5, "mengangkat");
const TL1 = TL0 + 0.8;
const TU1 = wordT(5, "lalu");
const TV0 = wordT(5, "digetarkan");
const TV1 = TV0 + 1.25;
const TH0 = wordT(6, "palu");
const BLOW = 0.6;
const TH_END = wordT(9, "keras");
const NBLOW = Math.floor((TH_END - TH0) / BLOW);
const SEABED_B = seabedY(180); // -17
const MUD_B = SEABED_B - 6;
const FINAL_B = MUD_B - 6.1;

// ------------------------------------------------------------------ the driven pile
type PileState = { bottom: V3; top: V3; rotZ: number; blowPh: number; blows: number };
export const pileAt = (t: number): PileState => {
  const tip = craneTip();
  const L = PILE_LEN;
  let top: V3, rot: number;
  const lie: V3 = [186, 1.4 + PILE_R, -8];
  const flat: V3 = [180, 11, 0];
  const up: V3 = [180, tip[1] - 3.5, 0];
  let bottomY: number | null = null;
  let blows = 0, blowPh = 0;
  if (t < TL0) { top = lie; rot = Math.PI / 2; }
  else if (t < TL1) { const k = ramp(t, TL0, TL1); top = lerp3(lie, flat, k); top[1] += Math.sin(k * Math.PI) * 1.5; rot = Math.PI / 2; }
  else if (t < TU1) { const k = ramp(t, TL1, TU1); top = lerp3(flat, up, k); rot = (Math.PI / 2) * (1 - k); }
  else {
    rot = 0;
    if (t < TV0) bottomY = lerp(up[1] - L, SEABED_B, ramp(t, TU1, TV0));
    else if (t < TH0) bottomY = lerp(SEABED_B, MUD_B, ramp(t, TV0, TV1));
    else {
      const x = (t - TH0) / BLOW;
      blows = Math.min(NBLOW, Math.floor(x));
      blowPh = x - Math.floor(x);
      const step = c01(blowPh / 0.07);
      const dep = (n: number) => (1 - Math.exp(-n / 4.5)) / (1 - Math.exp(-NBLOW / 4.5));
      const d = blows >= NBLOW ? 1 : lerp(dep(Math.max(0, blows - 1)), dep(blows), step);
      bottomY = MUD_B + (FINAL_B - MUD_B) * d;
    }
    top = [180, bottomY + L, 0];
  }
  const ax: V3 = [-Math.sin(rot), Math.cos(rot), 0];
  const bottom: V3 = [top[0] - ax[0] * L, top[1] - ax[1] * L, top[2]];
  return { bottom, top, rotZ: rot, blowPh, blows };
};
/** Penetration per blow (relative), for the HUD bar chart. */
const setOf = (n: number) => Math.exp(-(n - 1) / 4.5) - Math.exp(-n / 4.5);

// ------------------------------------------------------------------ shots
type Pose = { pos: V3; target: V3; fov: number; up?: V3 };
type World = "complete" | "map" | "profile" | "build" | "deck" | "pontoon" | "outro";
type Shot = { t0: number; t1: number; a: Pose; b: Pose; world: World; cut: boolean; fog: number };
const P = (pos: V3, target: V3, fov = 40, up?: V3): Pose => ({ pos, target, fov, up });
export const SHOTS: Shot[] = [
  { t0: 0, t1: CL[1].start - 0.1, world: "complete", cut: false, fog: 0.0022, a: P([-75, 58, 74], [130, 0, -15], 40), b: P([-45, 40, 56], [150, 2, -12], 40) },
  { t0: CL[1].start - 0.1, t1: T.KONTEKS, world: "complete", cut: true, fog: 0.002, a: P([112, 5, 62], [88, -9, -4], 44), b: P([104, -2, 66], [86, -14, -4], 44) },
  { t0: T.KONTEKS, t1: T.PROFILE, world: "map", cut: false, fog: 0.00095, a: P([-600, 330, 60], [60, -40, -10], 30), b: P([-560, 310, 56], [70, -40, -10], 30) },
  { t0: T.PROFILE, t1: T.MEKANISME, world: "profile", cut: true, fog: 0.0016, a: P([160, 3, 100], [255, -7, -18], 40), b: P([190, 2, 96], [272, -6, -20], 40) },
  { t0: T.MEKANISME, t1: T.CRANE, world: "build", cut: false, fog: 0.002, a: P([248, 28, 66], [196, 6, -14], 40), b: P([234, 22, 58], [192, 7, -12], 40) },
  { t0: T.CRANE, t1: T.VIBRO, world: "build", cut: false, fog: 0.002, a: P([146, 12, 44], [180, 14, -4], 42), b: P([156, 18, 34], [180, 18, -2], 40) },
  { t0: T.VIBRO, t1: T.HAMMER, world: "build", cut: true, fog: 0.0016, a: P([196, -6, 36], [180, -12, -2], 42), b: P([191, -10, 31], [180, -16, -2], 42) },
  { t0: T.HAMMER, t1: T.REVEAL, world: "build", cut: false, fog: 0.002, a: P([202, 11, 24], [180, 11, 0], 40), b: P([196, 15, 28], [180, 11.5, 0], 40) },
  { t0: T.REVEAL, t1: T.TIP, world: "build", cut: false, fog: 0.002, a: P([198, 8, 30], [180, 4.5, 0], 38), b: P([194, 7, 26], [180, 4, 0], 38) },
  { t0: T.TIP, t1: T.TIME, world: "build", cut: true, fog: 0.0016, a: P([187, -24, 17], [180, -27, 0], 40), b: P([175, -26, 14], [180, -28.5, 0], 40) },
  { t0: T.TIME, t1: T.PAYOFF, world: "build", cut: false, fog: 0.0018, a: P([252, 58, 88], [186, 2, -15], 40), b: P([236, 66, 78], [186, 2, -15], 40) },
  { t0: T.PAYOFF, t1: T.PONTOON, world: "deck", cut: false, fog: 0.002, a: P([116, 14, 34], [160, 4, -4], 42), b: P([126, 24, 27], [165, 5, -5], 42) },
  { t0: T.PONTOON, t1: T.OUTRO, world: "pontoon", cut: true, fog: 0.002, a: P([18, 6, 50], [0, -2.5, -5], 42), b: P([4, 7, 46], [-1, -3, -5], 42) },
  { t0: T.OUTRO, t1: TOTAL + 1, world: "outro", cut: true, fog: 0.0015, a: P([62, 26, 112], [165, -9, -10], 38), b: P([40, 36, 132], [165, -7, -10], 38) },
];
export const shotAt = (t: number) => {
  const i = Math.max(0, SHOTS.findIndex((s) => t >= s.t0 && t < s.t1));
  const s = SHOTS[i];
  const k = Easing.inOut(Easing.sin)(c01((t - s.t0) / (s.t1 - s.t0)));
  return { i, s, pose: { pos: lerp3(s.a.pos, s.b.pos, k), target: lerp3(s.a.target, s.b.target, k), fov: lerp(s.a.fov, s.b.fov, k), up: s.a.up } as Pose };
};

export const makeCam = (pose: Pose, W: number, H: number) => {
  const c = new THREE.PerspectiveCamera(pose.fov, W / H, 0.5, 4000);
  c.position.set(...pose.pos);
  if (pose.up) c.up.set(...pose.up);
  c.lookAt(new THREE.Vector3(...pose.target));
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
  return c;
};
const project = (cam: THREE.PerspectiveCamera, p: V3, W: number, H: number): [number, number, boolean] => {
  const v = new THREE.Vector3(...p).project(cam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H, v.z < 1];
};

export const Rig: React.FC<{ pose: Pose; fog: number }> = ({ pose, fog }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.up.set(...(pose.up ?? [0, 1, 0]));
    c.lookAt(new THREE.Vector3(...pose.target));
    c.fov = pose.fov;
    c.near = 0.5;
    c.far = 4000;
    c.updateProjectionMatrix();
    scene.fog = new THREE.FogExp2("#a9c8ee", fog);
  }, [camera, scene, pose, fog]);
  return null;
};

// ------------------------------------------------------------------ worlds
const BUILD_PILES: PileSpec[] = [140, 150, 160, 170].flatMap((x) => [0, -8].map((z) => ({ x, z, bot: seabedY(x) - 12.2, top: PILE_TOP })));
const DECK_PILES: PileSpec[] = [...BUILD_PILES, ...[0, -8].map((z) => ({ x: 180, z, bot: seabedY(180) - 12.2, top: PILE_TOP }))];
const BAYS = [135, 145, 155, 165, 175];
const TG = wordT(11, "balok");
const TP = wordT(11, "pelat");
const TJ = wordT(11, "membentuk");

const Bx: React.FC<{ size: V3; pos: V3; mat: THREE.Material }> = ({ size, pos, mat }) => (
  <mesh position={pos} material={mat} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={Math.min(...size) * 0.08} segments={2} />
  </mesh>
);

/** Crane hook rig: hoist rope from above the frame to a hook block, slings to the lift points. After the load
 *  lands the slings release and the hook rises away, so no element ever floats down on its own. */
const HookRig: React.FC<{ t: number; land: number; hook: V3; points: V3[] }> = ({ t, land, hook, points }) => {
  if (t > land + 0.8) return null;
  const up = ramp(t, land + 0.35, land + 0.8) * 14;
  const h: V3 = [hook[0], hook[1] + up, hook[2]];
  return (
    <group>
      <Rope a={[h[0], 90, h[2]]} b={[h[0], h[1] + 0.6, h[2]]} r={0.09} />
      <Bx size={[0.9, 1.1, 0.9]} pos={[h[0], h[1] + 0.2, h[2]]} mat={mats.yellow()} />
      {t < land + 0.35 && points.map((p, i) => <Rope key={i} a={[h[0], h[1] - 0.3, h[2]]} b={p} r={0.05} />)}
    </group>
  );
};

const DeckBuild: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {BAYS.map((x0, i) => {
      const gA = TG + i * 0.22, gB = gA + 0.55;
      const pA = TP + i * 0.3, pB = pA + 0.9;
      const g = ramp(t, gA, gB);
      const p = ramp(t, pA, pB);
      const cx = x0 + 5;
      const gy = PILE_TOP + 0.5 + (1 - g) * 9;
      const py = (1 - p) * 7;
      const slabTop = DECK_Y + py;
      return (
        <group key={x0}>
          {g > 0 && [0, -8].map((z) => <Bx key={z} size={[10, 1, 1.2]} pos={[cx, gy, z]} mat={mats.girder()} />)}
          {g > 0 &&
            [0, -8].map((z) => (
              <HookRig key={z} t={t} land={gB} hook={[cx, gy + 4, z]} points={[[cx - 3.5, gy + 0.5, z], [cx + 3.5, gy + 0.5, z]]} />
            ))}
          {p > 0 && (
            <group position={[0, py, 0]}>
              <Bx size={[9.9, 0.5, 9.4]} pos={[cx, DECK_Y - 0.25, -4]} mat={mats.concrete()} />
              <Bx size={[9.9, 0.06, 6.4]} pos={[cx, DECK_Y + 0.02, -4]} mat={mats.asphalt()} />
            </group>
          )}
          {p > 0 && (
            <HookRig
              t={t}
              land={pB}
              hook={[cx, slabTop + 5, -4]}
              points={[[cx - 4.2, slabTop + 0.05, 0.3], [cx + 4.2, slabTop + 0.05, 0.3], [cx - 4.2, slabTop + 0.05, -8.3], [cx + 4.2, slabTop + 0.05, -8.3]]}
            />
          )}
        </group>
      );
    })}
  </group>
);

const WorldView: React.FC<{ t: number; world: World; cut: boolean }> = ({ t, world, cut }) => {
  if (world === "pontoon") {
    const level = 1.4 * Math.sin(ramp(t, wordT(12, "naik") - 0.2, TOTAL) * Math.PI * 2.4);
    return <PontoonSet t={t} level={level} />;
  }
  const complete = world === "complete" || world === "map" || world === "profile" || world === "outro";
  const shipX = world === "profile" ? lerp(400, 290, ramp(t, wordT(3, "cukup") - 0.3, T.MEKANISME + 0.2)) : 290;
  const ps = pileAt(t);
  const tip = craneTip();
  const showVibro = t >= TU1 + 0.2 && t < T.HAMMER + 0.2;
  const hammerOn = t >= T.HAMMER + 0.15;
  const drop = ramp(t, T.HAMMER + 0.15, T.HAMMER + 0.55);
  const lift = ps.blowPh < 0.75 ? ease(ps.blowPh / 0.75) : 1 - c01((ps.blowPh - 0.75) / 0.1);
  const shake = t >= TV0 && t < TV1 ? Math.sin(t * 160) * 0.06 : 0;
  return (
    <group>
      <Ground cut={cut} />
      <Sea t={t} cut={cut} />
      <Shore />
      {complete && (
        <>
          <Piles list={jettyPiles(250, true)} />
          <TrestleDeck xa={-38} xb={HEAD_X0} />
          <HeadDeck />
          <Signboard pos={[298, DECK_Y, -1.6]} />
          <Signboard pos={[152, DECK_Y, -8.9]} w={7} />
          {(world === "profile" ? t > wordT(3, "cukup") - 0.3 : world === "outro") && <Ship pos={[shipX, 0, -48]} />}
          {world !== "map" && <AssetModel id="small-fishing-boat-4ac0e3" size={10} ground position={[60, -1.3, -40]} rotation={[0, 0.5, 0]} />}
        </>
      )}
      {world === "build" && (
        <>
          <Piles list={[...jettyPiles(130, false), ...BUILD_PILES]} />
          <TrestleDeck xa={-38} xb={135} />
          <Barge />
          <Crane />
          <DrivenPile bottom={ps.bottom} rotZ={ps.rotZ} marks={t > T.HAMMER} />
          {t < T.HAMMER + 0.15 && <Rope a={tip} b={[ps.top[0], ps.top[1] + (showVibro ? 3.2 : 0.3), ps.top[2]]} />}
          {t < T.HAMMER + 0.15 && !showVibro && (
            <mesh position={[ps.top[0], ps.top[1] + 0.5, ps.top[2]]} material={mats.yellow()}>
              <boxGeometry args={[0.7, 1.0, 0.7]} />
            </mesh>
          )}
          {showVibro && <Vibro top={ps.top} shake={shake} />}
          {hammerOn && (
            <>
              <Hammer top={[ps.top[0], ps.top[1] + (1 - drop) * 6, ps.top[2]]} lift={ps.blows > 0 || ps.blowPh > 0 ? lift : 0} />
              <Rope a={tip} b={[ps.top[0], ps.top[1] + 8.6 + (1 - drop) * 6, ps.top[2]]} />
              <Ring pos={[ps.top[0], ps.top[1] + 0.2, 0]} k={ps.blows > 0 ? ps.blowPh / 0.45 : 0} size={2.2} />
              <Ring pos={[180, 0.05, 0]} k={ps.blows > 0 ? ps.blowPh / 0.8 : 0} size={5} />
            </>
          )}
        </>
      )}
      {world === "deck" && (
        <>
          <Piles list={[...jettyPiles(130, false), ...DECK_PILES]} />
          <TrestleDeck xa={-38} xb={135} />
          <DeckBuild t={t} />
          <AssetModel id="flatbed-delivery-lorry-571458" size={9} ground position={[lerp(70, 168, ramp(t, TJ - 1.2, T.PONTOON + 0.3)), DECK_Y + 0.05, -2.2]} rotation={[0, Math.PI / 2, 0]} />
        </>
      )}
      {world === "profile" && <DepthRuler x={255} k={ramp(t, wordT(3, "sedalam"), wordT(3, "meter") + 0.2)} />}
    </group>
  );
};

// ------------------------------------------------------------------ HUD
type Pin = { t0: number; t1: number; text: string; at: (t: number) => V3; dx: number; dy: number };
const PINS: Pin[] = [
  { t0: wordT(1, "barisan"), t1: T.KONTEKS - 0.1, text: "barisan tiang", at: () => [90, -4, 0.7], dx: -260, dy: -330 },
  { t0: wordT(1, "dasar"), t1: T.KONTEKS - 0.1, text: "dasar laut", at: () => [84, seabedY(84) + 0.3, 0.6], dx: 150, dy: 260 },
  { t0: wordT(2, "kijing"), t1: T.PROFILE - 0.1, text: "dermaga", at: () => [292, 6, -15], dx: -230, dy: 330 },
  { t0: wordT(2, "kalimantan"), t1: T.PROFILE - 0.1, text: "darat", at: () => [-62, 8, -14], dx: -150, dy: -110 },
  { t0: wordT(3, "kapal"), t1: T.MEKANISME - 0.1, text: "kapal besar", at: () => [292, 14, -48], dx: -280, dy: -220 },
  { t0: wordT(4, "tongkang"), t1: T.CRANE - 0.1, text: "tongkang kerja", at: () => [206, 1.4, -3], dx: -240, dy: 260 },
  { t0: CL[5].start, t1: T.VIBRO - 0.1, text: "crane", at: () => [180.5, 16, -8], dx: -120, dy: -330 },
  { t0: wordT(5, "menegakkannya"), t1: T.VIBRO - 0.1, text: "tiang baja", at: (t) => { const p = pileAt(t); return [lerp(p.top[0], p.bottom[0], 0.12), lerp(p.top[1], p.bottom[1], 0.12), 0.7]; }, dx: 210, dy: -40 },
  { t0: wordT(5, "lumpur"), t1: T.HAMMER - 0.1, text: "lumpur", at: () => [186, SEABED_B - 3, 0.5], dx: 160, dy: -260 },
  { t0: wordT(6, "palu"), t1: T.REVEAL - 0.1, text: "palu (hammer)", at: (t) => { const p = pileAt(t); return [181, p.top[1] + 4, 0.5]; }, dx: -330, dy: -200 },
  { t0: wordT(8, "pukulan"), t1: T.TIP - 0.1, text: "tanda per meter", at: (t) => { const p = pileAt(t); return [180.5, p.top[1] - 3, 0.66]; }, dx: -260, dy: -120 },
  { t0: CL[9].start + 0.1, t1: T.TIME - 0.1, text: "lumpur", at: () => [173, MUD_B + 2.5, 0.5], dx: -60, dy: -300 },
  { t0: wordT(9, "ujungnya"), t1: T.TIME - 0.1, text: "ujung tiang", at: (t) => [180.6, pileAt(t).bottom[1] + 0.4, 0.7], dx: 200, dy: -170 },
  { t0: wordT(9, "tanah"), t1: T.TIME - 0.1, text: "tanah keras", at: () => [183, FINAL_B - 2.4, 0.5], dx: 80, dy: 240 },
  { t0: TG, t1: T.PONTOON - 0.1, text: "balok", at: () => [150, PILE_TOP + 0.5, 0.65], dx: -150, dy: 260 },
  { t0: TP, t1: T.PONTOON - 0.1, text: "pelat beton", at: () => [168, DECK_Y, -1], dx: 60, dy: -300 },
  { t0: wordT(12, "dikunci"), t1: T.OUTRO - 0.1, text: "dikunci tiang", at: (t) => [7, 1.4 * Math.sin(ramp(t, wordT(12, "naik") - 0.2, TOTAL) * Math.PI * 2.4) + 0.3, -7.6], dx: 60, dy: -330 },
];

const Pins: React.FC<{ t: number; cam: THREE.PerspectiveCamera; k: number; W: number; H: number }> = ({ t, cam, k, W, H }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {PINS.filter((n) => t >= n.t0 && t < n.t1).map((n, i) => {
      const [x, y, vis] = project(cam, n.at(t), W, H);
      // a leader may never cross the caption band (y ≈ 1180–1380 at 1920): skip pins anchored in or below it
      if (!vis || y > 1160 * k) return null;
      const draw = c01((t - n.t0) / 0.4);
      const fade = 1 - c01((t - (n.t1 - 0.25)) / 0.25);
      const fs = 40 * k;
      const tw = n.text.length * fs * 0.56 + 36 * k;
      let lx = x + n.dx * k;
      const ly = Math.max(650 * k, Math.min(H - 780 * k, y + n.dy * k));
      lx = Math.max(40 * k + tw / 2, Math.min(W - 40 * k - tw / 2, lx));
      const len = Math.hypot(lx - x, ly - y);
      return (
        <g key={i} opacity={fade}>
          <circle cx={x} cy={y} r={10 * k} fill="#fff" stroke="rgba(0,0,0,0.5)" strokeWidth={3 * k} />
          <line x1={x} y1={y} x2={lx} y2={ly} stroke="#fff" strokeWidth={6 * k} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.45))" }} />
          <g opacity={c01((draw - 0.5) / 0.5)} transform={`translate(${lx} ${ly})`}>
            <rect x={-tw / 2} y={-fs * 0.95} width={tw} height={fs * 1.7} rx={12 * k} fill={CARD} />
            <text x={0} y={fs * 0.32} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={fs} fill="#fff">{n.text}</text>
          </g>
        </g>
      );
    })}
  </svg>
);

const Card: React.FC<{ t: number; t0: number; t1: number; k: number; top: number; title: string; big?: string; sub?: string; subT?: number; accent?: string }> = ({ t, t0, t1, k, top, title, big, sub, subT, accent = ACCENT }) => {
  if (t < t0 || t > t1) return null;
  const a = Easing.out(Easing.back(1.5))(c01((t - t0) / 0.45));
  const out = 1 - c01((t - (t1 - 0.25)) / 0.25);
  return (
    <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: top * k, display: "flex", justifyContent: "center", opacity: Math.min(c01((t - t0) / 0.2), out) }}>
      <div style={{ background: CARD, borderRadius: 26 * k, padding: `${20 * k}px ${40 * k}px`, borderLeft: `${10 * k}px solid ${accent}`, transform: `translateY(${(1 - a) * 50 * k}px) scale(${0.9 + 0.1 * a})`, textAlign: "center", boxShadow: `0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.35)` }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38 * k, color: "#dfe8ef", letterSpacing: 1 * k }}>{title}</div>
        {big && <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 120 * k, lineHeight: 1.08, color: accent, letterSpacing: 2 * k }}>{big}</div>}
        {sub && <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40 * k, color: "#fff", opacity: subT ? c01((t - subT) / 0.3) : 1 }}>{sub}</div>}
      </div>
    </div>
  );
};

const fmtCount = (v: number) => Math.round(v).toLocaleString("id-ID");

/** Distance ruler drawn along the trestle on the map, with the 3.374 m counter (research [4]). */
const MapRuler: React.FC<{ t: number; cam: THREE.PerspectiveCamera; k: number; W: number; H: number }> = ({ t, cam, k, W, H }) => {
  // counter lands on 3.374 exactly when VO starts the number ("tiga ribu ..."), ramp 0.6 s before it
  const t0 = wordT(2, "tiga");
  if (t < t0 - 0.65 || t >= T.PROFILE) return null;
  const a = project(cam, [-38, 6, 14], W, H), b = project(cam, [320, 6, 14], W, H);
  const d = ramp(t, t0 - 0.6, t0);
  const x = lerp(a[0], b[0], d), y = lerp(a[1], b[1], d);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={ACCENT} strokeWidth={8 * k} strokeLinecap="round" />
      <circle cx={a[0]} cy={a[1]} r={12 * k} fill={ACCENT} />
      <circle cx={x} cy={y} r={12 * k} fill={ACCENT} />
      <g transform={`translate(${Math.min(W - 230 * k, x + 30 * k)} ${Math.max(330 * k, y + 120 * k)})`}>
        <rect x={-10 * k} y={-60 * k} width={300 * k} height={84 * k} rx={14 * k} fill={CARD} />
        <text x={140 * k} y={2 * k} textAnchor="middle" fontFamily={'"Anton", sans-serif'} fontSize={62 * k} fill={ACCENT}>{fmtCount(3374 * d)} m</text>
      </g>
    </svg>
  );
};

/** Set-per-blow bar chart (REVEAL): bars shrink blow after blow. */
const BlowChart: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const t0 = wordT(8, "setiap");
  if (t < t0 || t >= T.TIME) return null;
  const ps = pileAt(t);
  const n = Math.max(1, Math.min(NBLOW, ps.blows));
  const a = c01((t - t0) / 0.35);
  const mm = t >= wordT(9, "satu") - 0.05;
  const bars = Array.from({ length: n }, (_, i) => setOf(i + 1) / setOf(1));
  return (
    <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 280 * k, opacity: a * (1 - c01((t - (T.TIME - 0.25)) / 0.25)) }}>
      <div style={{ background: CARD, borderRadius: 24 * k, padding: `${18 * k}px ${30 * k}px`, borderLeft: `${10 * k}px solid ${ACCENT}` }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38 * k, color: "#fff" }}>tiang turun per pukulan</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 * k, height: 150 * k, marginTop: 12 * k }}>
          {bars.map((h, i) => (
            <div key={i} style={{ width: 26 * k, height: Math.max(4, h * 140) * k, background: i === n - 1 ? ACCENT : "#7fc8e8", borderRadius: 4 * k }} />
          ))}
        </div>
        {mm && (
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40 * k, color: ACCENT, marginTop: 10 * k, transform: `scale(${1 + 0.06 * (1 - c01((t - wordT(9, "satu")) / 0.3))})`, transformOrigin: "left" }}>
            berhenti di ±1 mm / pukulan <span style={{ color: "#cfd8e0", fontSize: 32 * k }}>(contoh satu proyek)</span>
          </div>
        )}
      </div>
    </div>
  );
};

/** Clock + day counter for the timelapse beat. */
const TimeCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const t0 = wordT(10, "lima") - 0.1;
  if (t < CL[10].start || t >= T.PAYOFF) return null;
  const h = 5 * ramp(t, CL[10].start, t0 + 0.2);
  const day = t >= wordT(10, "crane");
  const out = 1 - c01((t - (T.PAYOFF - 0.25)) / 0.25);
  const ang = h * 30;
  return (
    <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 280 * k, display: "flex", justifyContent: "center", opacity: c01((t - CL[10].start) / 0.3) * out }}>
      <div style={{ background: CARD, borderRadius: 26 * k, padding: `${20 * k}px ${36 * k}px`, display: "flex", alignItems: "center", gap: 30 * k, borderLeft: `${10 * k}px solid ${ACCENT}` }}>
        <svg width={130 * k} height={130 * k} viewBox="-65 -65 130 130">
          <circle r={58} fill="none" stroke="#fff" strokeWidth={6} />
          <path d={`M0 0 L0 -58 A58 58 0 ${ang > 180 ? 1 : 0} 1 ${58 * Math.sin((ang * Math.PI) / 180)} ${-58 * Math.cos((ang * Math.PI) / 180)} Z`} fill={ACCENT} opacity={0.85} />
          <line x1={0} y1={0} x2={40 * Math.sin((ang * Math.PI) / 180)} y2={-40 * Math.cos((ang * Math.PI) / 180)} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
        </svg>
        <div>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 92 * k, color: ACCENT, lineHeight: 1 }}>± {Math.max(1, Math.ceil(h - 0.01))} jam</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38 * k, color: "#fff" }}>untuk satu tiang besar</div>
          {day && <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40 * k, color: ACCENT, marginTop: 8 * k }}>1 crane ≈ 1 tiang / hari</div>}
        </div>
      </div>
    </div>
  );
};

const Stamp: React.FC<{ t: number; t0: number; t1: number; k: number; text: string; top: number }> = ({ t, t0, t1, k, text, top }) => {
  if (t < t0 || t > t1) return null;
  const a = c01((t - t0) / 0.22);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: top * k, display: "flex", justifyContent: "center", opacity: a * (1 - c01((t - (t1 - 0.2)) / 0.2)) }}>
      <div style={{ transform: `rotate(-6deg) scale(${1.5 - 0.5 * a})`, border: `${7 * k}px solid #ff5a36`, color: "#fff", background: "rgba(200,40,20,0.86)", padding: `${8 * k}px ${30 * k}px`, borderRadius: 14 * k, fontFamily: '"Anton", sans-serif', fontSize: 84 * k, letterSpacing: 3 * k }}>{text}</div>
    </div>
  );
};

/** Up/down tide arrows beside the pontoon (PAYOFF). */
const TideArrows: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const t0 = wordT(12, "naik");
  if (t < t0 || t >= T.OUTRO) return null;
  const a = c01((t - t0) / 0.3) * (1 - c01((t - (T.OUTRO - 0.2)) / 0.2));
  const dir = Math.cos(ramp(t, t0 - 0.2, TOTAL) * Math.PI * 2.4) >= 0 ? -1 : 1;
  return (
    <div style={{ position: "absolute", right: 80 * k, top: 640 * k, opacity: a, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * k }}>
      <div style={{ fontSize: 110 * k, lineHeight: 0.9, color: dir < 0 ? ACCENT : "rgba(255,255,255,0.35)", fontFamily: FONT, fontWeight: 600, textShadow: "0 3px 8px rgba(0,0,0,0.5)" }}>▲</div>
      <div style={{ fontSize: 110 * k, lineHeight: 0.9, color: dir > 0 ? ACCENT : "rgba(255,255,255,0.35)", fontFamily: FONT, fontWeight: 600, textShadow: "0 3px 8px rgba(0,0,0,0.5)" }}>▼</div>
    </div>
  );
};

// ------------------------------------------------------------------ karaoke captions (BEDAH: plain white bold, dark outline)
type Chunk = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CL.forEach((c) => {
    const ws = c.words;
    const n = Math.ceil(ws.length / 7);
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
  if (!ch || t >= T.CARD) return null;
  const n = ch.words.length;
  const lines = n > 4 ? [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))] : [ch.words];
  const appear = Easing.out(Easing.cubic)(c01((t - ch.s) / 0.18));
  const longest = Math.max(...lines.map((ln) => ln.reduce((a, w) => a + w.w.length, 0) * 0.58 * 62 + (ln.length - 1) * 24));
  const fs = 62 * Math.min(1, 900 / longest);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1230 * k, display: "flex", flexDirection: "column", alignItems: "center", opacity: appear, transform: `translateY(${(1 - appear) * 14 * k}px)` }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: 24 * k, lineHeight: 1.22, whiteSpace: "nowrap" }}>
          {ln.map((w, wi) => {
            const on = t >= w.s - 0.03 && t < w.e + 0.05;
            const pop = on ? 1 + 0.04 * Math.sin(c01((t - w.s) / 0.18) * Math.PI) : 1;
            return (
              <span key={wi} style={{ fontFamily: FONT, fontWeight: 600, fontSize: fs * k, color: on ? ACCENT : "#ffffff", transform: `scale(${pop})`, display: "inline-block", WebkitTextStroke: `${7 * k}px rgba(8,16,24,0.9)`, paintOrder: "stroke fill", textShadow: `0 ${4 * k}px ${10 * k}px rgba(0,0,0,0.45)` }}>
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ sun per shot
const sunAt = (t: number): { dir: V3; warm: number } => {
  if (t >= T.TIME && t < T.PAYOFF) {
    const a = lerp(0.35, 2.75, ramp(t, T.TIME, T.PAYOFF - 0.3));
    return { dir: [Math.cos(a) * 0.75, Math.max(0.18, Math.sin(a)), 0.45], warm: 1 - Math.sin(a) };
  }
  // lower, warmer key (late-morning tropical sun from the camera side) so piles and slabs read with volume
  return { dir: [-0.62, 0.46, 0.64], warm: 0.32 };
};

export const Scene3D: React.FC<{ t: number; frame: number; pose: Pose; world: World; cut: boolean; fog: number }> = ({ t, frame, pose, world, cut, fog }) => {
  const sun = sunAt(t);
  return (
    <>
      <Rig pose={pose} fog={fog} />
      <Sky t={t} sun={sun.dir} />
      <Lights sun={sun.dir} target={pose.target} warm={sun.warm} box={world === "map" ? 200 : 75} />
      <WorldView t={t} world={world} cut={cut} />
      <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} hdri="sky" ao />
    </>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const k = W / 1080;
  const { s, pose } = shotAt(t);
  const cam = useMemo(() => makeCam(pose, W, H), [pose, W, H]);
  const cuts = [T.KONTEKS, T.PROFILE, T.MEKANISME, T.VIBRO, T.TIP, T.PAYOFF, T.PONTOON, T.OUTRO];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.12)) * 0.6;
  return (
    <AbsoluteFill style={{ backgroundColor: "#8cc0ee" }}>
      <ThreeCanvas width={W} height={H} dpr={1} shadows camera={{ fov: pose.fov, position: pose.pos }}>
        <Scene3D t={t} frame={frame} pose={pose} world={s.world} cut={s.cut} fog={s.fog} />
      </ThreeCanvas>
      <Pins t={t} cam={cam} k={k} W={W} H={H} />
      <MapRuler t={t} cam={cam} k={k} W={W} H={H} />
      <Card t={t} t0={wordT(0, "lebih")} t1={CL[1].start - 0.15} k={k} top={300} title="panjang dermaga" big="> 3 KM" />
      <Stamp t={t} t0={wordT(0, "tidak")} t1={CL[1].start - 0.15} k={k} top={640} text="TIDAK MENGAPUNG" />
      <Card t={t} t0={wordT(2, "terminal")} t1={wordT(2, "tiga") - 0.6} k={k} top={290} title="contoh nyata" big="TERMINAL KIJING" sub="Kalimantan Barat" subT={wordT(2, "kalimantan")} />
      <Card t={t} t0={wordT(3, "tujuh")} t1={T.MEKANISME - 0.1} k={k} top={290} title="kedalaman laut di ujung dermaga" big="17 M" sub="cukup untuk kapal besar" subT={wordT(3, "cukup")} />
      <Card t={t} t0={wordT(5, "digetarkan")} t1={T.HAMMER - 0.1} k={k} top={290} title="langkah 1" big="DIGETARKAN" sub="masuk ke lumpur" subT={wordT(5, "masuk")} />
      <Card t={t} t0={wordT(6, "berulang")} t1={T.REVEAL - 0.1} k={k} top={290} title="langkah 2" big="DIPUKUL" sub="berulang kali" />
      <Card t={t} t0={CL[7].start} t1={wordT(8, "setiap") - 0.05} k={k} top={300} title="pertanyaannya" big="KAPAN BERHENTI?" accent="#ff7a4a" />
      <BlowChart t={t} k={k} />
      <TimeCard t={t} k={k} />
      <Card t={t} t0={wordT(11, "jalan")} t1={T.PONTOON - 0.1} k={k} top={290} title="tiang + balok + pelat" big="JALAN DI ATAS LAUT" />
      <Card t={t} t0={wordT(12, "dermaga")} t1={T.OUTRO - 0.1} k={k} top={290} title="bahkan" big="DERMAGA APUNG" sub="naik turun mengikuti pasang surut" subT={wordT(12, "naik")} />
      <TideArrows t={t} k={k} />
      <Card t={t} t0={wordT(13, "hutan")} t1={T.CARD} k={k} top={300} title="dermaga adalah" big="HUTAN TIANG" sub="yang tersembunyi di bawah air" subT={wordT(13, "tersembunyi")} />
      <Captions t={t} k={k} />
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Outro start={T.CARD} />
    </AbsoluteFill>
  );
};
