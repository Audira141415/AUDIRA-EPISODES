// EP11 sets, part 2 (C1 heat road, C2 KM 30, C3 cottage, C3b bed, C3c station, D1 newspaper, D2 track, D3 Hakone,
// E1 stadium 1967 + finish, E2 time board, OUT family + question). Shared helpers live in sets.tsx.
import React, { useMemo } from "react";
import { Color, DoubleSide, MeshStandardMaterial } from "three";
import type { Look } from "./chronicle/Stage.tsx";
import { Figure, POSES, gait, idle, type Costume, type Pose } from "./chronicle/Figure.tsx";
import { DAY, DUSK, GOLDEN, INK, MORNING, ROOM_NIGHT } from "./chronicle/looks.ts";
import { Flag, Ground } from "./chronicle/props.tsx";
import { Birds, Embers } from "./chronicle/fx.tsx";
import { Shafts } from "./chronicle/fxextra.tsx";
import { F_CITE, F_LABEL, F_STAMP } from "./chronicle/fonts.ts";
import { Model } from "./Model.tsx";
import { DARK, EP_POSE, GLOW, Puffs, RUNNER, Roadside, Room, Stands, WHITENIGHT, canvasTex, mixPose, run, signMat, woodMat } from "./sets.tsx";
import { CUT, T, clamp, lerp, pop, seg } from "./timing.ts";

const lazy = <X,>(f: () => X) => { let v: X | null = null; return () => (v ??= f()); };
export const ELDER: Costume = { hat: "none", wear: "coat", scale: 0.98, build: 1.0 };
const OUT = { width: 1, halo: 0.45, gain: 2.2 };

// ---------------------------------------------------------------- C1: heat road
export const HEAT: Look = {
  ...DAY, key: { ...DAY.key, pos: [-8, 26, -40], color: "#fff0c8", intensity: 3.6, shadow: { box: 16, at: [0, 0, -3], far: 120 } },
  hemi: { sky: "#fff0d0", ground: "#8a6a40", intensity: 1.05 }, fog: { color: "#f6dfae", density: 0.02 },
  sky: { ...DAY.sky, zenith: "#e0b876", horizon: "#fff2cc", sunDir: [-0.05, 0.2, -1], sunColor: "#fffbe8", sunSize: 0.6, glow: 0.9 },
  exposure: 1.06, bloom: { strength: 0.1, radius: 0.35, threshold: 0.95 }, grade: { shadow: "#4a2a14", high: "#fff0c0", amount: 0.16, contrast: 0.24, vignette: 0.58, grain: 0.022 }, outline: OUT,
};
const PACK: [number, number][] = [[-1.5, -1.6], [1.5, -2.2], [-0.6, -3.4], [0.9, -4.4], [-1.8, -5.2], [1.9, -5.9], [0.1, -6.6], [-1.1, -7.8], [1.2, -8.6], [-2, -9.8], [0.5, -10.8], [2, -11.6], [-0.7, -13], [1.1, -14.2]];
/** 24.0–30.8: the pack runs toward camera; some topple from T.tumbang. */
export const HeatSet: React.FC<{ t: number }> = ({ t }) => {
  const sp = 4.2;
  return (
    <group>
      <Roadside scroll={t * sp} houses={false} ground="#b0904e" />
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0.07, 0]} pose={run(t, 0, 0.95)} look={RUNNER} t={t} />
      {PACK.map(([x, z], i) => {
        const f = [0, 1, 4, 6].includes(i) ? T.tumbang - 0.75 + i * 0.13 : 99;
        const k = seg(t, f, f + 0.55), back = Math.max(0, t - f - 0.2) * sp;
        return (
          <group key={i} position={[x, 0.07 + 0.12 * k, z - back]} rotation={[1.4 * k, 0, 0.2 * k]}>
            <Figure id={10 + i} outline={i < 2 ? INK.foe : null} gain={1.6 * k} pos={[0, 0, 0]} pose={mixPose(run(t, i * 0.7 + 1, 0.9 + 0.04 * (i % 3)), EP_POSE.fall(), k)} look={{ ...RUNNER, hat: i % 3 === 1 ? "peci" : "none", scale: 1.0 + 0.05 * (i % 3) }} t={t} />
          </group>
        );
      })}
      <Puffs t={t} at={[0, 0.15, -1]} drift={[0.3, 0.8, -2.4]} size={1.3} color="#fff0c8" opacity={0.22} />
      <Puffs t={t} at={[-1, 0.15, -8]} drift={[0.4, 1.2, -2]} size={2.4} color="#fff0c8" seed={4} opacity={0.24} />
      <Embers t={t} count={160} box={[-4, 0.2, -8, 4, 3.5, 3]} rise={0.3} size={0.022} color="#fff6da" />
    </group>
  );
};
export const LazaroLook: Look = { ...HEAT, fog: { color: "#d8b48a", density: 0.024 }, sky: { ...HEAT.sky, zenith: "#8a6a72", horizon: "#e8b890", sunDir: [0.08, 0.1, -1], sunSize: 0.4, glow: 0.55 }, grade: { shadow: "#2c1c38", high: "#f0d0b8", amount: 0.22, contrast: 0.26, vignette: 0.5, grain: 0.024 } };
/** 30.8–34.9: one violet runner slows, drops to the knees, folds. */
export const LazaroSet: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT.c1b, z = lerp(-4.2, 0, seg(t, a - 1.5, T.kolaps + 0.1));
  const slow = seg(t, T.lazaro, T.kolaps);
  const k1 = seg(t, T.kolaps - 0.45, T.kolaps + 0.05), k2 = seg(t, T.kolaps, T.kolaps + 0.5), k3 = seg(t, T.kolaps + 0.45, T.meninggal + 0.15);
  const p: Pose = mixPose(mixPose(mixPose(run(t, 0, 0.9, 1 - 0.5 * slow), EP_POSE.spent(), k1), POSES.kneel(0.2), k2), POSES.kneel(1), k3);
  return (
    <group>
      <Roadside scroll={3} ground="#8a6c44" />
      <group position={[0, 0.07, z]} rotation={[0, 0.25 * k1, 0.32 * k3]}>
        <Figure id={1} outline={INK.grief} gain={2.4} pos={[0, 0, 0]} pose={p} look={{ ...RUNNER, scale: 1.04 }} t={t} />
      </group>
      {[[-1.9, -9], [1.8, -11], [0.6, -14]].map(([x, zz], i) => <Figure key={i} id={20 + i} pos={[x, 0.07, zz + (t - a) * 0.9]} pose={run(t, i + 3, 0.8, 0.7)} look={RUNNER} t={t} />)}
      <Puffs t={t} at={[0, 0.1, z - 0.5]} drift={[0.5, 0.5 + 0.4 * k2, -1]} size={1 + k2} color="#ffe0b8" opacity={0.2 + 0.12 * k2} />
      <Shafts from={[2, 9, -10]} yaw={0.1} tilt={0.5} len={12} width={4} count={4} color="#e8d0ff" opacity={0.04 * k3} t={t} />
      <Embers t={t} count={110} box={[-3, 0.2, -6, 3, 3, 2]} rise={0.18} size={0.02} color="#e0c8ff" />
    </group>
  );
};

// ---------------------------------------------------------------- C2: KM 30 post
export const KM30: Look = { ...GOLDEN, key: { ...GOLDEN.key, pos: [12, 16, -44], color: "#ffdca0", intensity: 3.4, shadow: { box: 10, at: [0, 0, 0], far: 120 } }, fog: { color: "#c8b078", density: 0.026 }, sky: { ...GOLDEN.sky, zenith: "#8a8a6a", horizon: "#f6dca0", sunDir: [0.22, 0.16, -1], sunSize: 0.5 }, grade: { shadow: "#22301c", high: "#ffe0a0", amount: 0.16, contrast: 0.24, vignette: 0.58, grain: 0.022 }, outline: OUT };
const kmMat = lazy(() => (() => { const m = signMat("KM 30", "#f0e2c4", "#16100e", 1024, 512, 330); m.emissiveIntensity = 0.75; return m; })());
export const KmSet: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, CUT.c2 + 0.7, CUT.c2 + 1.5);
  return (
    <group>
      <Roadside scroll={9} houses={false} ground="#5e6a34" />
      {[-3.4, -2.6, 2.9, 3.6].map((x, i) => <Model key={x} id="birch-tree-181b33" height={7 + i} position={[x * 1.5, 0, -4 - i * 2]} />)}
      <Model id="field-rock-5e37c6" height={0.7} position={[1.9, 0, 0.2]} />
      <Model id="field-rock-5e37c6" height={0.45} position={[-1.6, 0, 1.2]} rotation={[0, 1.2, 0]} />
      <group position={[0.82, 0, -1.5]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 1.05, 0]} material={DARK} castShadow><boxGeometry args={[0.12, 2.1, 0.12]} /></mesh>
        <mesh position={[0, 2.1, 0.07]} material={kmMat()} castShadow><boxGeometry args={[1.2, 0.6, 0.06]} /></mesh>
      </group>
      <group position={[lerp(-0.9, -0.25, seg(t, CUT.c2 - 0.5, CUT.c2 + 1.2)), 0.07, lerp(-1.4, 0.2, seg(t, CUT.c2 - 0.5, CUT.c2 + 1.2))]} rotation={[0, 0.2, 0.05 * Math.sin(t * 2.3) * (1 - k)]}>
        <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0, 0]} pose={idle(mixPose(gait(t * 4.5, 0.3, { spine: 0.2 }), EP_POSE.spent(), k), t * 2.2, 1, 2.2)} look={RUNNER} t={t} />
      </group>
      <Shafts from={[4, 9, -8]} yaw={-0.3} tilt={0.5} len={13} width={5} count={5} color="#ffe6b0" opacity={0.11} t={t} />
      <Embers t={t} count={120} box={[-3, 0.2, -5, 3, 3.2, 2.5]} rise={0.2} size={0.02} color="#fff0c8" />
    </group>
  );
};

// ---------------------------------------------------------------- C3: cottage garden, given a drink
export const COTTAGE: Look = { ...DAY, key: { ...DAY.key, pos: [10, 20, -38], color: "#ffe8b8", intensity: 3.0, shadow: { box: 10, at: [0, 0, 0], far: 120 } }, hemi: { sky: "#cfe8e0", ground: "#8a8a5a", intensity: 1.3 }, fill: { pos: [3, 7, 13], color: "#fff0d0", intensity: 1.2 }, fog: { color: "#cfe0c8", density: 0.016 }, sky: { ...DAY.sky, zenith: "#7fb0b8", horizon: "#f2f0cc", sunDir: [0.3, 0.2, -1], sunSize: 0.4 }, grade: { shadow: "#1c3a30", high: "#fff0c0", amount: 0.14, contrast: 0.2, vignette: 0.36, grain: 0.02 }, outline: OUT };
const tableM = lazy(() => woodMat("#a08058", [1, 1])), deckM = lazy(() => woodMat("#8a7250", [3, 3]));
const cupM = lazy(() => new MeshStandardMaterial({ color: "#f0d8a8", emissive: new Color("#e8c080"), emissiveIntensity: 0.45, roughness: 0.4 }));
export const CottageSet: React.FC<{ t: number }> = ({ t }) => {
  const inK = seg(t, CUT.c3 - 0.8, T.rumah + 0.5), give = seg(t, T.minum - 0.7, T.minum - 0.2), dr = seg(t, T.minum - 0.1, T.minum + 0.35);
  const walk = 1 - seg(t, T.rumah + 0.2, T.rumah + 0.6);
  return (
    <group>
      <Ground size={300} color="#5c6238" amp={1} />
      <mesh position={[0, 0.09, -1]} material={deckM()} receiveShadow><boxGeometry args={[7, 0.16, 5]} /></mesh>
      <Model id="crossing-keeper-s-cottage-de49a4" height={6.2} position={[-1.2, 0, -8]} rotation={[0, 0.15, 0]} />
      <Model id="apple-tree-ef0ba0" height={4.6} position={[3.6, 0, -7]} />
      <Model id="birch-tree-181b33" height={8} position={[-5.4, 0, -12]} />
      <Model id="low-garden-wall-run-a34d05" height={0.8} position={[2.6, 0, -4.6]} />
      <Model id="low-garden-wall-run-a34d05" height={0.8} position={[-3.6, 0, -4.2]} />
      <mesh position={[0.1, 0.82, 0.35]} material={tableM()} castShadow receiveShadow><boxGeometry args={[1.0, 0.07, 0.5]} /></mesh>
      {[-0.4, 0.6].map((x) => <mesh key={x} position={[x, 0.45, 0.35]} material={DARK}><boxGeometry args={[0.07, 0.72, 0.4]} /></mesh>)}
      <Model id="milk-steaming-pitcher-4757b5" height={0.32} position={[0.35, 0.855, 0.35]} />
      <mesh visible={dr <= 0.2} position={[-0.08, 0.93, 0.4]} material={cupM()} userData={{ noMask: true }}><cylinderGeometry args={[0.05, 0.04, 0.13, 16]} /></mesh>
      {/* resident offers the cup */}
      <Figure id={2} outline={INK.neutral} gain={1.5} pos={[0.92, 0.17, -0.15]} rotY={-1.25} pose={idle(mixPose(POSES.stand(), POSES.point("R", -0.15), give * (1 - 0.6 * dr)), t, 3)} look={{ body: "f", hat: "bun", wear: "robe", scale: 0.97 }} t={t} />
      <group position={[lerp(-2.2, -0.62, inK), 0.17, -0.1]} rotation={[0, lerp(1.5, 0.75, seg(t, T.rumah + 0.3, T.minum)), 0]}>
        <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0, 0]} pose={idle(mixPose(mixPose(POSES.stand(), gait(t * 5.5, 0.1, { spine: 0.2 }), walk), EP_POSE.drink(dr), dr), t, 1, 1.4)} look={RUNNER} t={t} />
        {dr > 0.2 && <mesh position={[-0.1, 1.37, 0.22]} rotation={[0.5, 0, 0]} material={cupM()} userData={{ noMask: true }}><cylinderGeometry args={[0.036, 0.03, 0.09, 16]} /></mesh>}
      </group>
      <Shafts from={[5, 10, -8]} yaw={-0.35} tilt={0.55} len={13} width={5} count={4} color="#fff0c0" opacity={0.09} t={t} />
      <Embers t={t} count={110} box={[-3, 0.2, -4, 3, 3.4, 2.5]} rise={0.15} size={0.02} color="#f6ffd8" />
    </group>
  );
};

// ---------------------------------------------------------------- C3b: asleep, morning light sweeps in
export const sleepLook = (k: number): Look => ({
  ...WHITENIGHT, key: { ...WHITENIGHT.key, color: k > 0.5 ? "#ffd9a0" : "#b8c8f0", intensity: 2.0 + 1.6 * k }, hemi: { sky: k > 0.5 ? "#d8a878" : "#7a8ab0", ground: "#241a18", intensity: 0.5 + 0.35 * k },
  fog: { color: k > 0.5 ? "#8a6a50" : "#3c4458", density: 0.02 }, grade: { shadow: k > 0.5 ? "#3a2418" : "#161e38", high: k > 0.5 ? "#ffd9a0" : "#d8e2ff", amount: 0.18, contrast: 0.3, vignette: 0.5, grain: 0.024 }, bloom: { strength: 0.15, radius: 0.4, threshold: 0.95 }, outline: OUT,
});
export const SleepSet: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.pagi - 0.5, T.pagi + 0.4), breath = 0.012 * Math.sin(t * 2.4);
  const c = useMemo(() => new Color(), []);
  c.set("#9fb4e8").lerp(new Color("#ffd28a"), k);
  return (
    <Room t={t} wx={0} wy={2.25} color={`#${c.getHexString()}`} glow={0.9 + 0.5 * k} shaft={0.1 + 0.02 * k}>
      <Model id="bed-6e10e8" height={1.05} position={[0, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} />
      <Model id="bedside-table-3f2b80" height={0.6} position={[1.75, 0, -1.9]} />
      <Model id="milk-steaming-pitcher-4757b5" height={0.28} position={[1.75, 0.6, -1.9]} />
      <group position={[0.85, 0.66 + breath, -1.15]} rotation={[0, Math.PI / 2, 0]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0, 0]} pose={{ ...POSES.stand(), armR: { fwd: 0.12, out: 0.12, elbow: 0.25, twist: 0.3 }, legL: { fwd: 0.35, knee: 0.6 }, head: [0.1, 0.3] }} look={RUNNER} t={t} />
        </group>
      </group>
      <spotLight position={[0, 3.4, -2.6]} target-position={[0, 0.5, 0]} angle={0.8} penumbra={0.8} intensity={12 * k} color="#ffc878" distance={9} />
    </Room>
  );
};

// ---------------------------------------------------------------- C3c: station, leaving with the head down
export const STATION: Look = { ...MORNING, key: { ...MORNING.key, pos: [6, 11, -50], color: "#ffd8b0", intensity: 2.8, shadow: { box: 12, at: [0, 0, -2], far: 120 } }, fog: { color: "#b8b4c4", density: 0.032 }, sky: { ...MORNING.sky, zenith: "#7a86a8", horizon: "#f2c8b0", sunDir: [0.1, 0.1, -1], sunSize: 0.55, glow: 1.1 }, grade: { shadow: "#24284a", high: "#ffd8c0", amount: 0.18, contrast: 0.22, vignette: 0.44, grain: 0.022 }, outline: OUT };
const platM = lazy(() => woodMat("#7a6a5c", [3, 12]));
export const StationSet: React.FC<{ t: number }> = ({ t }) => {
  const z = -(t - CUT.c3c) * 1.15;
  return (
    <group>
      <mesh position={[0.9, -0.1, -20]} material={platM()} receiveShadow><boxGeometry args={[5.2, 0.2, 70]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, -20]} receiveShadow><planeGeometry args={[80, 120]} /><meshStandardMaterial color="#5a5048" roughness={1} /></mesh>
      <Model id="passenger-carriage-de9d58" height={4} position={[-3.2, -0.6, -6]} />
      <Model id="passenger-carriage-de9d58" height={4} position={[-3.2, -0.6, -20]} />
      <Model id="tender-steam-locomotive-8e2a82" height={4.6} position={[-3.2, -0.6, -36]} rotation={[0, Math.PI, 0]} />
      {[-2, -9, -16, -23].map((zz) => <Model key={zz} id="brass-post-lamp-984201" height={3.4} position={[2.7, 0, zz]} />)}
      {[-5, -14].map((zz) => <Model key={zz} id="campus-bench-0d6036" height={0.9} position={[2.3, 0, zz]} rotation={[0, -Math.PI / 2, 0]} />)}
      {[[1.9, -12], [0.2, -19], [1.5, -24], [2.1, -17]].map(([x, zz], i) => <Figure key={i} id={10 + i} pos={[x, 0, zz]} rotY={i * 1.3} pose={idle(POSES.stand(), t, i)} look={{ hat: i % 2 ? "peci" : "bun", wear: i % 2 ? "coat" : "robe", body: i % 2 ? "m" : "f" }} t={t} />)}
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[0.45, 0, z]} rotY={Math.PI} pose={gait((t - CUT.c3c) * 5.2, 0, { head: [-0.6, 0], spine: 0.26 })} look={{ ...RUNNER, wear: "coat", load: "back" }} t={t} />
      <Puffs t={t} at={[-1.6, -0.2, -3]} drift={[2, 1.6, 0.4]} size={2.2} color="#fff0e8" opacity={0.3} />
      <Puffs t={t} at={[-1.6, -0.2, -11]} drift={[2.4, 2, 0.6]} size={3.2} color="#fff0e8" opacity={0.32} seed={5} />
      <Shafts from={[3, 9, -14]} yaw={-0.2} tilt={0.5} len={13} width={5} count={4} color="#ffe0c8" opacity={0.1} t={t} />
      <Embers t={t} count={80} box={[-2, 0.2, -8, 3, 3.2, 2]} rise={0.12} size={0.018} color="#fff0e0" />
    </group>
  );
};

// ---------------------------------------------------------------- D1: newspaper desk
export const DESK: Look = { ...ROOM_NIGHT, key: { pos: [-4, 9, -12], color: "#ffcf8a", intensity: 2.0, shadow: { box: 5, at: [0, 0, 0], far: 40, bias: -0.0006 } }, hemi: { sky: "#8a6a48", ground: "#1c120c", intensity: 0.7 }, fog: { color: "#3a2616", density: 0.03 }, exposure: 1.1, grade: { shadow: "#241420", high: "#ffd090", amount: 0.18, contrast: 0.22, vignette: 0.5, grain: 0.026 }, outline: OUT };
const paperMat = lazy(() => {
  const t = canvasTex(1400, 1900, (g) => {
    g.fillStyle = "#e6d6b0"; g.fillRect(0, 0, 1400, 1900);
    for (let i = 0; i < 9000; i++) { g.fillStyle = i % 2 ? "rgba(90,60,20,0.07)" : "rgba(255,250,225,0.09)"; g.fillRect((i * 197.3) % 1400, (i * 313.7) % 1900, 3, 3); }
    g.fillStyle = "#1a120c"; g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.font = `92px "${F_CITE}"`; g.fillText("Harian Rekaan", 700, 130);
    g.fillRect(60, 165, 1280, 5); g.fillRect(60, 222, 1280, 3);
    g.font = `700 38px "${F_LABEL}"`; g.fillText("ILUSTRASI · BUKAN KORAN ASLI · STOCKHOLM", 700, 209);
    g.font = `215px "${F_STAMP}"`; g.fillText("PELARI JEPANG", 700, 455); g.fillStyle = "#a8241c"; g.font = `300px "${F_STAMP}"`; g.fillText("HILANG!", 700, 765);
    // picture: empty road with a question mark silhouette
    g.fillStyle = "#b89a66"; g.fillRect(60, 825, 760, 720);
    const gr = g.createLinearGradient(0, 825, 0, 1545); gr.addColorStop(0, "#f0dcae"); gr.addColorStop(0.5, "#d0b078"); gr.addColorStop(0.5, "#8a6a40"); gr.addColorStop(1, "#5a4226"); g.fillStyle = gr; g.fillRect(60, 825, 760, 720);
    g.fillStyle = "#c8a872"; g.beginPath(); g.moveTo(410, 1185); g.lineTo(470, 1185); g.lineTo(720, 1545); g.lineTo(160, 1545); g.closePath(); g.fill();
    g.fillStyle = "#1a120c"; g.font = `420px "${F_STAMP}"`; g.fillText("?", 440, 1330);
    g.strokeStyle = "#1a120c"; g.lineWidth = 6; g.strokeRect(60, 825, 760, 720);
    g.fillStyle = "rgba(26,18,12,0.72)";
    for (let y = 840; y < 1800; y += 30) { g.fillRect(860, y, 220 - ((y * 7) % 40), 11); g.fillRect(1110, y, 230 - ((y * 11) % 60), 11); }
    for (let y = 1590; y < 1800; y += 30) { g.fillRect(60, y, 360 - ((y * 5) % 50), 11); g.fillRect(450, y, 370 - ((y * 9) % 70), 11); }
  });
  return new MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.4, roughness: 0.92, side: DoubleSide });
});
const deskM = lazy(() => woodMat("#7a4e2c", [2, 2])), bulbM = lazy(() => GLOW("#ffd28a", 2.6));
export const DeskSet: React.FC<{ t: number }> = ({ t }) => {
  const sw = 0.28 * Math.sin((t - CUT.d1) * 2.1 + 0.6);
  return (
    <group>
      <mesh position={[0, -0.1, 0]} material={deskM()} receiveShadow><boxGeometry args={[7, 0.2, 7]} /></mesh>
      {[[-0.95, 0.35, 0.5], [0.9, -0.5, -0.38], [-1.45, -1.7, 0.22]].map(([x, z, r], i) => <mesh key={i} rotation={[-Math.PI / 2, 0, r]} position={[x, 0.004 + i * 0.003, z]} material={paperMat()} receiveShadow><planeGeometry args={[1.05, 1.42]} /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0.06]} position={[0, 0.02, 0]} material={paperMat()} receiveShadow castShadow><planeGeometry args={[1.5, 2.04]} /></mesh>
      <Model id="table-lamp-e25998" height={0.9} position={[-1.15, 0, -1.35]} />
      <group position={[0.1, 2.9, -0.5]} rotation={[0.1, 0, sw]}>
        <mesh position={[0, -0.5, 0]} material={DARK}><cylinderGeometry args={[0.01, 0.01, 1, 6]} /></mesh>
        <mesh position={[0, -1.05, 0]} material={DARK}><coneGeometry args={[0.26, 0.22, 24, 1, true]} /></mesh>
        <mesh position={[0, -1.12, 0]} material={bulbM()} userData={{ noMask: true }}><sphereGeometry args={[0.09, 16, 12]} /></mesh>
        <pointLight position={[0, -1.2, 0.1]} color="#ffd090" intensity={9} distance={6} decay={1.6} />
      </group>
      <Embers t={t} count={70} box={[-1.4, 0.1, -1.4, 1.4, 1.8, 1.2]} rise={0.05} size={0.008} color="#ffe6b8" />
    </group>
  );
};

// ---------------------------------------------------------------- D2: he keeps running, 1920 / 1924
export const TRACK24: Look = { ...DUSK, key: { ...DUSK.key, pos: [14, 13, -46], color: "#ffc890", intensity: 2.6, shadow: { box: 14, at: [0, 0, 0], far: 120 } }, hemi: { sky: "#7a98c0", ground: "#2c2430", intensity: 0.95 }, fill: { pos: [-4, 8, 12], color: "#ffcfa0", intensity: 1.5 }, fog: { color: "#6a7ca0", density: 0.016 }, sky: { ...DUSK.sky, zenith: "#2c4a7a", horizon: "#ffb884", sunDir: [0.3, 0.1, -1], sunSize: 0.45, glow: 1.2, stars: 0.1 }, exposure: 1.08, bloom: { strength: 0.35, radius: 0.5, threshold: 0.8 }, outline: OUT };
const laneM = lazy(() => GLOW("#f4ead8", 0.8)), lampM = lazy(() => GLOW("#fff0d0", 2.2));
export const heroX = (t: number) => (t - (CUT.d2 + CUT.d3) / 2) * 3.4;
export const TrackSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <Stands t={t} cheer={0.5} z={-9} banner={t < T.y1924 - 0.1 ? "OLIMPIADE 1920" : "OLIMPIADE 1924"} />
    {[-1.6, 0.9, 2.6].map((z) => <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, z]} material={laneM()} userData={{ noMask: true }}><planeGeometry args={[60, 0.07]} /></mesh>)}
    {[-15, -7.5, 0, 7.5, 15].map((x, i) => (
      <group key={x}>
        <Model id="floodlight-mast-4482be" height={9} position={[x, 0, -15.5]} />
        <Flag pos={[x + 3.6, 0, -6.6]} t={t + i} h={4.6} w={1.5} color={["#8a3a2c", "#3a4a52", "#5a4636", "#2c5a5a", "#7a5a2c"][i]} />
        <mesh position={[x, 8.6, -15]} material={lampM()} userData={{ noMask: true }}><sphereGeometry args={[0.34, 14, 10]} /></mesh>
      </group>
    ))}
    {[[-3.4, -2.6], [-5.4, -3.2], [2.8, -3.1]].map(([dx, z], i) => <Figure key={i} id={20 + i} pos={[heroX(t) + dx, 0, z]} rotY={Math.PI / 2} pose={run(t, i + 2, 0.95)} look={{ ...RUNNER, scale: 1.04 }} t={t} />)}
    <Figure id={1} outline={INK.hero} gain={1.2} pos={[heroX(t), 0, 0]} rotY={Math.PI / 2} pose={run(t)} look={RUNNER} t={t} />
    <Puffs t={t} at={[heroX(t) - 0.5, 0.1, 0]} drift={[-2.2, 0.5, 0]} size={0.8} color="#ffc890" opacity={0.24} />
    <Embers t={t} count={160} box={[heroX(t) - 4, 0.2, -5, heroX(t) + 4, 4, 2]} rise={0.2} size={0.02} color="#ffe0b8" />
  </group>
);

// ---------------------------------------------------------------- D3: Hakone Ekiden
export const HAKONE: Look = { ...MORNING, key: { ...MORNING.key, pos: [-8, 12, -50], color: "#ffd0c0", intensity: 2.8, shadow: { box: 12, at: [0, 0, 0], far: 120 } }, hemi: { sky: "#e8dce0", ground: "#4a5244", intensity: 0.95 }, fill: { pos: [3, 8, 14], color: "#ffe8d8", intensity: 0.5 }, fog: { color: "#d8c0c8", density: 0.02 }, sky: { ...MORNING.sky, zenith: "#7a94c8", horizon: "#f6b8a0", sunDir: [-0.2, 0.13, -1], sunSize: 0.5, glow: 1.1 }, grade: { shadow: "#203a44", high: "#ffd8d0", amount: 0.14, contrast: 0.22, vignette: 0.64, grain: 0.02 }, outline: OUT };
const hillM = lazy(() => new MeshStandardMaterial({ color: "#5a6a78", roughness: 1, flatShading: true })), fujiM = lazy(() => new MeshStandardMaterial({ color: "#847eb0", roughness: 1, fog: false })), snowM = lazy(() => new MeshStandardMaterial({ color: "#ffffff", roughness: 1, fog: false, toneMapped: false, emissive: new Color("#fff4ee"), emissiveIntensity: 1.3 }));
const sashM = lazy(() => new MeshStandardMaterial({ color: "#e02a2a", emissive: new Color("#ff3a2a"), emissiveIntensity: 1.1, roughness: 0.7, side: DoubleSide }));
export const HakoneSet: React.FC<{ t: number }> = ({ t }) => {
  const x = lerp(-4.4, -0.62, seg(t, CUT.d3 - 1.2, T.estafet - 0.6)), hand = seg(t, T.hakone + 0.4, T.hakone + 0.9), take = seg(t, T.estafet - 0.35, T.estafet + 0.1);
  const go = Math.max(0, t - T.estafet), bx = 0.62 + 1.6 * go * go;
  return (
    <group>
      <Ground size={300} color="#5a7048" amp={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow><planeGeometry args={[80, 4.2]} /><meshStandardMaterial color="#8a8078" roughness={1} /></mesh>
      <mesh position={[3, 2.2, -110]} material={fujiM()} userData={{ noMask: true }}><coneGeometry args={[42, 26, 64, 1]} /></mesh>
      <mesh position={[3, 9.9, -109.5]} material={snowM()} userData={{ noMask: true }}><coneGeometry args={[17.6, 10.8, 64, 1]} /></mesh>
      {[[-26, -52, 9], [24, -46, 8], [-9, -64, 8], [42, -60, 12]].map(([hx, hz, h], i) => <mesh key={i} position={[hx, h / 2 - 2.5, hz]} material={hillM()}><coneGeometry args={[h * 2.1, h, 9]} /></mesh>)}
      <Model id="torii-gate-402f30" height={6.8} position={[0, 0, -7]} />
      <Model id="twisted-pine-on-a-525dc7" height={5.2} position={[-4.4, 0, -6]} />
      <Model id="tall-pine-tree-ab4108" height={8} position={[5, 0, -9]} />
      <Model id="tall-pine-tree-ab4108" height={9} position={[-7, 0, -13]} />
      {[-2.5, 2.4].map((nx) => <Model key={nx} id="nobori-banner-ae4d88" height={3.2} position={[nx, 0, -3.4]} />)}
      <Figure id={2} outline={INK.ally} gain={2.0} pos={[bx, 0.07, 0]} rotY={Math.PI / 2} pose={mixPose({ ...POSES.stand(), armL: { fwd: -0.9 * hand, out: 0.35, elbow: 0.1 }, armR: { fwd: 0.4, out: 0.1, elbow: 1 }, legL: { fwd: 0.35, knee: 0.3 }, legR: { fwd: -0.3, knee: 0.25 }, spine: 0.15 }, run(t, 2), seg(t, T.estafet, T.estafet + 0.25))} look={RUNNER} t={t} />
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[x, 0.07, 0]} rotY={Math.PI / 2} pose={mixPose(mixPose(run(t), POSES.point("R", -0.2), hand), EP_POSE.spent(), seg(t, T.estafet + 0.1, T.estafet + 0.6))} look={RUNNER} t={t} />
      <mesh position={[lerp(lerp(x + 0.05, -0.02, hand), bx + 0.02, take), 1.2, 0.12]} rotation={[0, 0, lerp(0.9, 0.05, hand) + 0.9 * take]} material={sashM()} userData={{ noMask: true }}><planeGeometry args={[0.78, 0.16]} /></mesh>
      <Birds t={t} start={CUT.d3} origin={[-10, 9, -30]} dir={[1, 0.1, 0]} count={9} speed={5} size={0.5} />
      <Shafts from={[-3, 9, -14]} yaw={0.15} tilt={0.5} len={13} width={5} count={4} color="#ffd8c0" opacity={0.1} t={t} /><Embers t={t} count={150} box={[-4, 0.2, -5, 4, 4, 2.5]} rise={-0.25} size={0.032} color="#ffc8d8" />
    </group>
  );
};

// ---------------------------------------------------------------- E1: stadium 1967
export const STADION67: Look = { ...GOLDEN, key: { ...GOLDEN.key, pos: [-9, 15, -44], color: "#ffd49a", intensity: 3.2, shadow: { box: 14, at: [0, 0, -2], far: 120 } }, hemi: { sky: "#f2cfa0", ground: "#4a342a", intensity: 1.0 }, fog: { color: "#eac290", density: 0.018 }, sky: { ...GOLDEN.sky, zenith: "#4f88b0", horizon: "#ffd9a0", sunDir: [-0.1, 0.1, -1], sunSize: 0.35, glow: 0.7 }, grade: { ...GOLDEN.grade, vignette: 0.54 }, bloom: { strength: 0.32, radius: 0.5, threshold: 0.82 }, outline: OUT };
const metalM = lazy(() => new MeshStandardMaterial({ color: "#2c2a2c", roughness: 0.45, metalness: 0.6 })), lensM = lazy(() => new MeshStandardMaterial({ color: "#0a0c12", roughness: 0.1, metalness: 0.9, emissive: new Color("#3a6aff"), emissiveIntensity: 0.5 })), recM = lazy(() => GLOW("#ff3a2a", 2.4));
/** 1960s studio TV camera on a tripod, lens toward +z. */
export const TvCam: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {[0, 2.1, 4.2].map((a) => <mesh key={a} position={[Math.sin(a) * 0.3, 0.6, Math.cos(a) * 0.3]} rotation={[Math.cos(a) * -0.42, 0, Math.sin(a) * 0.42]} material={metalM()} castShadow><cylinderGeometry args={[0.03, 0.04, 1.3, 10]} /></mesh>)}
    <mesh position={[0, 1.22, 0]} material={metalM()}><cylinderGeometry args={[0.1, 0.14, 0.12, 16]} /></mesh>
    <group position={[0, 1.5, 0]} rotation={[0, 0.08 * Math.sin(t * 0.7), 0]}>
      <mesh material={metalM()} castShadow><boxGeometry args={[0.42, 0.46, 0.95]} /></mesh>
      <mesh position={[0, 0.3, -0.2]} material={metalM()} castShadow><boxGeometry args={[0.26, 0.2, 0.4]} /></mesh>
      {[[0, 0.06, 0.12, 0.42], [-0.12, -0.12, 0.07, 0.24], [0.12, -0.12, 0.07, 0.24]].map(([x, y, r, l], i) => <group key={i} position={[x, y, 0.475 + l / 2]} rotation={[Math.PI / 2, 0, 0]}><mesh material={metalM()}><cylinderGeometry args={[r, r * 0.9, l, 20]} /></mesh><mesh position={[0, l / 2 + 0.005, 0]} material={lensM()}><cylinderGeometry args={[r * 0.85, r * 0.85, 0.02, 20]} /></mesh></group>)}
      <mesh position={[0.13, 0.28, 0.4]} material={recM()} visible={Math.sin(t * 6) > -0.4} userData={{ noMask: true }}><sphereGeometry args={[0.035, 12, 10]} /></mesh>
    </group>
  </group>
);
const gateM = lazy(() => signMat("AUDIRA", "#b8322a", "#fff6e6", 1024, 200, 150));
const tapeM = lazy(() => new MeshStandardMaterial({ color: "#fff6e6", emissive: new Color("#fff0d0"), emissiveIntensity: 0.35, roughness: 0.6, side: DoubleSide }));
/** Finish gate; `snap` = seconds since the tape broke (< 0 = intact). */
export const Gate: React.FC<{ t: number; snap: number; w?: number; tape?: boolean }> = ({ t, snap, w = 1.3, tape = true }) => {
  const k = clamp(snap / 0.7);
  return (
    <group>
      {[-w, w].map((x) => <mesh key={x} position={[x, 1.45, 0]} material={DARK} castShadow><cylinderGeometry args={[0.06, 0.07, 2.9, 14]} /></mesh>)}
      <mesh position={[0, 2.72, 0.04]} material={gateM()} castShadow><boxGeometry args={[2 * w + 0.3, 0.5, 0.08]} /></mesh>
      {tape && snap < 0 && <mesh position={[0, 1.18 + 0.015 * Math.sin(t * 5), 0]} material={tapeM()} userData={{ noMask: true }}><planeGeometry args={[2 * w, 0.032]} /></mesh>}
      {tape && snap >= 0 && [-1, 1].map((s) => (
        <group key={s} position={[s * w, 1.18, 0]} rotation={[0.9 * Math.sin(k * 2.4), s * (1.2 * Math.sin(Math.min(1, k * 1.6) * 1.57)), s * (0.35 * k + 1.1 * k * k)]}>
          <mesh position={[-s * w * 0.45, 0, 0]} material={tapeM()} userData={{ noMask: true }}><planeGeometry args={[w * 0.9, 0.05]} /></mesh>
        </group>
      ))}
    </group>
  );
};
/** 58.5–63.3: TV crew frames the old runner who comes back. */
export const InviteSet: React.FC<{ t: number }> = ({ t }) => {
  const z = lerp(-6.4, -3.0, seg(t, CUT.e1 - 0.4, CUT.e1b + 0.6));
  return (
    <group>
      <Stands t={t} cheer={0.35} z={-13} banner="STOCKHOLM 1967" />
      <Model id="clock-tower-752081" height={14} position={[5.4, 0, -20]} />
      {[-4.4, 3.6].map((x, i) => <Flag key={x} pos={[x, 0, -10]} t={t + i} h={6.4} w={1.9} color={["#2c5a8a", "#8a6a1c"][i]} />)}
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[0.35, 0, z]} rotY={-0.08} pose={t < T.kembali ? gait(t * 5, 0.1, { head: [0.1, 0] }) : mixPose(gait(t * 5, 0.1, { head: [0.1, 0] }), POSES.raiseFist(), seg(t, T.kembali, T.kembali + 0.4))} look={ELDER} t={t} />
      <group position={[-0.78, 0, -0.6]} rotation={[0, 2.72, 0]}><TvCam t={t} /></group>
      <Figure id={2} pos={[-1.12, 0, 0.12]} rotY={2.8} pose={idle({ ...POSES.stand(), armL: { fwd: 1.2, out: 0.1, elbow: 0.8 }, armR: { fwd: 1.2, out: 0.1, elbow: 0.8 }, spine: 0.15, head: [-0.1, 0] }, t, 4, 1.4)} look={{ hat: "peci", wear: "coat", scale: 1.04 }} t={t} />
      <Model id="vintage-microphone-stand-c5ba82" height={1.6} position={[1.45, 0, -0.9]} />
      <Shafts from={[-5, 12, -12]} yaw={0.3} tilt={0.5} len={15} width={6} count={4} color="#ffe0a8" opacity={0.09} t={t} />
      <Embers t={t} count={120} box={[-3.5, 0.2, -6, 3.5, 4, 2]} rise={0.15} size={0.022} color="#fff0c8" />
    </group>
  );
};
/** 63.3–67.1: over the line. */
export const finishZ = (t: number) => (t < T.finis ? lerp(-7, -0.12, (t - CUT.e1b) / (T.finis - CUT.e1b)) : -0.12 + 1.3 * (1 - Math.exp(-(t - T.finis) * 1.7)));
export const FinishSet: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.finis - 0.35, T.finis + 0.1);
  return (
    <group>
      <Stands t={t} cheer={0.3 + 0.7 * seg(t, T.melintasi, T.finis)} z={-13} banner="STOCKHOLM 1967" />
      <group position={[0, 0, 0]}><Gate t={t} snap={t - T.finis} w={1.35} /></group>
      {[-1, 1].map((s) => <group key={s}>{[-2.5, -5.5, -8.5].map((z) => <Model key={z} id="split-rail-fence-run-87da39" height={0.9} position={[s * 2.6, 0, z]} rotation={[0, Math.PI / 2, 0]} />)}</group>)}
      {Array.from({ length: 10 }, (_, i) => <Figure key={i} id={30 + i} pos={[(i % 2 ? 1 : -1) * (2.1 + 0.25 * (i % 3)), 0, -1.6 - i * 0.95]} rotY={(i % 2 ? -1 : 1) * 1.2} pose={idle(i % 3 ? POSES.raiseFist() : POSES.talk(t * 3), t * 2, i, 3)} look={{ hat: i % 3 ? "none" : "peci", wear: i % 2 ? "coat" : "pants" }} t={t} />)}
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0, finishZ(t)]} pose={mixPose(run(t, 0, 0.75, 0.55), idle(EP_POSE.victory(), t, 2, 1.6), k)} look={ELDER} t={t} />
      <Embers t={t} count={t > T.finis ? 320 : 110} box={[-2.5, 0.2, -4, 2.5, 4.2, 2.5]} rise={t > T.finis ? -0.7 : 0.15} size={t > T.finis ? 0.05 : 0.022} color="#ffe0a0" />
      <Shafts from={[-4, 12, -12]} yaw={0.25} tilt={0.5} len={15} width={6} count={4} color="#ffe0a8" opacity={0.09} t={t} />
    </group>
  );
};

// ---------------------------------------------------------------- E2: time board
export const BOARD: Look = { ...DUSK, key: { ...DUSK.key, pos: [-10, 14, -40], color: "#ffb884", intensity: 2.2, shadow: { box: 12, at: [0, 0, 0], far: 120 } }, hemi: { sky: "#6a80b8", ground: "#241c28", intensity: 0.85 }, fog: { color: "#4a5688", density: 0.02 }, sky: { ...DUSK.sky, zenith: "#1c2c5c", horizon: "#f09a6a", sunDir: [-0.25, 0.06, -1], glow: 1.2, stars: 0.35 }, exposure: 1.06, bloom: { strength: 0.1, radius: 0.35, threshold: 0.95 }, outline: OUT };
const ROWS: [number, string, string][] = [[T.w54, "54", "TAHUN"], [T.w8, "8", "BULAN"], [T.w6, "6", "HARI"], [T.w5, "5", "JAM"], [T.w32, "32", "MENIT"], [T.w20, "20,3", "DETIK"]];
const boardTex = (n: number) => canvasTex(1400, 1760, (g) => {
  g.fillStyle = "#0e0c10"; g.fillRect(0, 0, 1400, 1760); g.strokeStyle = "#b8322a"; g.lineWidth = 22; g.strokeRect(16, 16, 1368, 1728);
  g.textBaseline = "middle"; g.textAlign = "center"; g.fillStyle = "#f4ead8"; g.font = `800 92px "${F_LABEL}"`; g.fillText("WAKTU FINIS · AUDIRA", 700, 110);
  ROWS.forEach(([, v, u], i) => {
    const y = 300 + i * 254, on = i < n, hot = i === n - 1;
    g.fillStyle = hot ? "rgba(255,181,71,0.16)" : "rgba(244,234,216,0.05)"; g.fillRect(60, y - 112, 1280, 224);
    g.textAlign = "right"; g.font = `230px "${F_STAMP}"`; g.fillStyle = on ? (hot ? "#ffb547" : "#f4ead8") : "rgba(244,234,216,0.1)"; g.fillText(on ? v : "--", 700, y + 8);
    g.textAlign = "left"; g.font = `800 140px "${F_LABEL}"`; g.fillText(u, 760, y + 8);
  });
});
const boards: (MeshStandardMaterial | null)[] = [];
const boardMat = (n: number) => (boards[n] ??= (() => { const t = boardTex(n); return new MeshStandardMaterial({ map: t, roughness: 0.8, emissive: new Color("#ffffff"), emissiveMap: t, emissiveIntensity: 0.85 }); })());
export const boardCount = (t: number) => ROWS.filter(([a]) => t >= a).length;
export const BoardSet: React.FC<{ t: number }> = ({ t }) => {
  const n = boardCount(t), last = n ? t - ROWS[n - 1][0] : 9;
  return (
    <group>
      <Stands t={t} cheer={1} z={-12} banner="STOCKHOLM 1967" />
      {[-7, 7].map((x) => <group key={x}><Model id="floodlight-mast-4482be" height={11} position={[x, 0, -14]} /><mesh position={[x, 10.4, -13.6]} material={lampM()} userData={{ noMask: true }}><sphereGeometry args={[0.5, 14, 10]} /></mesh></group>)}
      <group position={[0, 0, -2.2]}>
        {[-1.35, 1.35].map((x) => <mesh key={x} position={[x, 1.2, -0.3]} material={DARK} castShadow><cylinderGeometry args={[0.08, 0.09, 2.6, 14]} /></mesh>)}
        <group position={[0, 3.95, 0]} scale={1 + 0.03 * Math.max(0, 1 - last / 0.3)}>
          <mesh material={boardMat(n)} userData={{ noMask: true }}><planeGeometry args={[3.2, 4.02]} /></mesh>
          <mesh position={[0, 0, -0.12]} material={DARK} castShadow><boxGeometry args={[3.34, 4.16, 0.2]} /></mesh>
        </group>
        <pointLight position={[0, 3.6, 1.6]} color="#ffc880" intensity={10} distance={8} decay={1.6} />
      </group>
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0, -1.1]} rotY={Math.PI - 0.25} pose={idle({ ...POSES.lookUp(), armL: { fwd: 0.1, out: 0.25, elbow: 0.2 }, armR: { fwd: -0.2, out: 0.62, elbow: 1.9, twist: 1.2 } }, t, 1, 1.6)} look={ELDER} t={t} />
      {[[-2.1, 0.5], [2.05, 0.3], [-2.4, -1], [2.4, -1.2]].map(([x, z], i) => <Figure key={i} id={40 + i} pos={[x, 0, z]} rotY={Math.PI + x * -0.2} pose={idle(i % 2 ? POSES.raiseFist() : POSES.point("R", 0.4), t * 1.6, i, 2)} look={{ hat: i % 2 ? "peci" : "none", wear: "coat" }} t={t} />)}
      <Embers t={t} count={240} box={[-2.5, 0.2, -3, 2.5, 6, 2.5]} rise={-0.5} size={0.04} color="#ffd890" />
    </group>
  );
};

// ---------------------------------------------------------------- OUT 1: family at dusk
export const FAMILY: Look = { ...GOLDEN, key: { ...GOLDEN.key, pos: [10, 10, -50], color: "#ffb88a", intensity: 2.8, shadow: { box: 14, at: [0, 0, 0], far: 120 } }, hemi: { sky: "#e0a8a0", ground: "#3c3434", intensity: 0.9 }, fog: { color: "#e0a090", density: 0.014 }, sky: { ...GOLDEN.sky, zenith: "#5a5a94", horizon: "#ffb890", sunDir: [0.02, 0.05, -1], sunColor: "#ffe0b0", sunSize: 0.7, glow: 0.95 }, grade: { shadow: "#2c2248", high: "#ffc8a0", amount: 0.18, contrast: 0.2, vignette: 0.38, grain: 0.02 }, outline: OUT };
const duskHill = lazy(() => new MeshStandardMaterial({ color: "#6a4a5a", roughness: 1, flatShading: true }));
export const FamilySet: React.FC<{ t: number }> = ({ t }) => {
  const grow = (a: number) => pop(t, a);
  return (
    <group>
      <Ground size={300} color="#7a6a44" amp={1.2} />
      {[[-18, -55, 11], [16, -60, 13], [0, -75, 12], [34, -50, 10], [-38, -52, 12]].map(([x, z, h], i) => <mesh key={i} position={[x, h / 2 - 3, z]} material={duskHill()}><coneGeometry args={[h * 2.2, h, 10]} /></mesh>)}
      <Model id="twisted-pine-on-a-525dc7" height={5.4} position={[-3.4, 0, -5]} />
      <Model id="tall-pine-tree-ab4108" height={8.5} position={[4.6, 0, -9]} />
      <Model id="gabled-farmhouse-c7534f" height={4.4} position={[7, 0, -20]} rotation={[0, -0.6, 0]} />
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[0.3 * seg(t, T.menikah - 0.5, T.menikah), 0, 0]} rotY={0.1} pose={idle(POSES.akimbo(), t, 1)} look={ELDER} t={t} />
      {t > T.menikah - 0.2 && <group position={[lerp(-1.6, -0.5, seg(t, T.menikah - 0.2, T.menikah + 0.5)), 0, -0.05]}><Figure id={2} outline={INK.neutral} gain={1.8} pos={[0, 0, 0]} rotY={0.2} pose={idle(POSES.stand(), t, 3)} look={{ body: "f", hat: "bun", wear: "kain", scale: 0.93 }} t={t} /></group>}
      {Array.from({ length: 6 }, (_, i) => { const k = grow(T.enam - 0.1 + i * 0.13); return k > 0 && <group key={i} position={[(i - 2.5) * 0.56, 0, -1.25]} scale={k}><Figure id={10 + i} outline={INK.ally} gain={1.4} pos={[0, 0, 0]} pose={idle(i % 2 ? POSES.stand() : POSES.akimbo(), t, i)} look={{ body: i % 2 ? "f" : "m", hat: i % 2 ? "bun" : "none", wear: i % 2 ? "kain" : "pants", scale: 1.04 + 0.03 * (i % 3) }} t={t} /></group>; })}
      {Array.from({ length: 10 }, (_, i) => { const k = grow(T.sepuluh - 0.1 + i * 0.1); return k > 0 && <group key={i} position={[(i - 4.5) * 0.34, 0, 0.75 + 0.18 * (i % 2)]} scale={k}><Figure id={30 + i} outline={INK.ally} gain={1.2} pos={[0, 0, 0]} pose={idle(i % 3 === 1 ? POSES.raiseFist() : POSES.stand(), t * 1.6, i, 2)} look={{ body: i % 2 ? "m" : "f", hat: i % 2 ? "none" : "bun", wear: i % 2 ? "pants" : "robe", scale: 0.5 + 0.05 * (i % 4), headScale: 1.2 }} t={t} /></group>; })}
      <Birds t={t} start={CUT.out} origin={[-12, 8, -34]} dir={[1, 0.08, 0]} count={11} speed={4} size={0.5} />
      <Embers t={t} count={150} box={[-3.5, 0.2, -5, 3.5, 4, 2.5]} rise={0.2} size={0.024} color="#ffe0b8" />
    </group>
  );
};
// ---------------------------------------------------------------- OUT 2: the road to the gate, fast or back?
export const ROADEND: Look = { ...FAMILY, sky: { ...FAMILY.sky, zenith: "#3c4a86", horizon: "#ffa878", sunDir: [0, 0.04, -1], sunSize: 0.55 }, fog: { color: "#c88a88", density: 0.02 } };
export const RoadEndSet: React.FC<{ t: number }> = ({ t }) => {
  const z = -0.9 * (t - CUT.out2) * 0.9, fz = 4 - (t - T.cepat + 0.35) * 7.5, fx = 0.95 + Math.min(1, Math.max(0, (fz - 0.5) / 3.5)); // fast runner enters from behind the camera, no pop-in
  return (
    <group>
      <Roadside scroll={2.2} houses={false} ground="#6a5840" />
      <group position={[0, 0, -8.6]} scale={1.6}><Gate t={t} snap={-1} w={1.5} /></group>
      <Figure id={1} outline={INK.hero} gain={1.2} pos={[-0.3, 0.07, z]} rotY={Math.PI} pose={gait((t - CUT.out2) * 4.6, 0, { head: [0.1, 0] })} look={ELDER} t={t} />
      {t > T.cepat - 0.65 && fz > -40 && <Figure id={2} outline={INK.neutral} gain={1.6} pos={[fx, 0.07, fz]} rotY={Math.PI} pose={run(t, 1, 1.3)} look={RUNNER} t={t} />}
      <Puffs t={t} at={[fx, 0.1, Math.max(-12, fz)]} drift={[0.2, 0.6, 1.4]} size={1} color="#ffc8a0" opacity={t > T.cepat - 0.65 ? 0.26 * seg(t, T.cepat - 0.2, T.cepat + 0.3) : 0} />
      <Birds t={t} start={CUT.out2} origin={[8, 9, -40]} dir={[-1, 0.1, 0]} count={9} speed={4} size={0.5} />
      <Shafts from={[0, 8, -13]} tilt={0.35} len={14} width={5} count={4} color="#ffd0a0" opacity={0.08} t={t} />
      <Embers t={t} count={150} box={[-3, 0.2, -8, 3, 3.5, 3]} rise={0.25} size={0.024} color="#ffe0b8" />
    </group>
  );
};
