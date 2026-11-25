// EP06 sets — TOYDIORAMA toy stadium for "Usain Bolt 9,58 Detik".
// Scale: 0.55 world units per metre (a 1.95 m runner ≈ 1.07 units = ToyPerson at scale 1).
// The 100 m straight runs along x from START_X to FINISH_X; lanes are spread along z; camera side is +z.
import React from "react";
import { ToyPerson, LEG_LENGTH, SKIN_TONES, type Pose, type Look } from "../../core/polish/Person.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { Model } from "./Model.tsx";

type V3 = [number, number, number];
export const M = 0.55; // units per metre
export const START_X = -27.5;
export const FINISH_X = START_X + 100 * M;
export const LANE_W = 0.8;
/** z of lane i (1..8); lane 1 nearest the camera. */
export const laneZ = (i: number) => 3.2 - (i - 0.5) * LANE_W;
export const xAt = (metres: number) => START_X + metres * M;

export const COL = {
  bolt: "#f2c230",
  boltTrim: "#1f8a4c",
  track: "#b5523b",
  trackLine: "#efe6d6",
  grass: "#4f7f45",
  navy: "#2b3a67",
  red: "#e2442f",
};

// ---------------------------------------------------------------- race model
// Cumulative splits (s) from research/SOURCE_REGISTER.md: Bolt RT 0.146, 20 m 2.89, 60 m 6.31, 80 m 7.92, 100 m 9.58.
// 30 m 3.78 and 50 m are only used to shape the curve (not on screen). Gay: 20 m 2.92, 100 m 9.71.
type Split = [number, number]; // [time, metres]
const BOLT: Split[] = [[0, 0], [0.146, 0], [1.0, 4.2], [2.89, 20], [3.78, 30], [6.31, 60], [7.92, 80], [9.58, 100], [10.6, 108]];
const GAY: Split[] = [[0, 0], [0.144, 0], [1.0, 4.3], [2.92, 20], [3.81, 30], [6.39, 60], [8.02, 80], [9.71, 100], [10.7, 107]];
const scaled = (base: Split[], k: number, rt: number): Split[] => base.map(([t, d], i) => [i === 1 ? rt : i === 0 ? 0 : rt + (t - base[1][0]) * k, d]);

export type Runner = { lane: number; name: string; look: Partial<Look>; splits: Split[]; stride: number };
const look = (top: string, skin: number, height = 1, hairStyle: Look["hairStyle"] = 3): Partial<Look> => ({
  top,
  bottom: top,
  outfit: "onePiece",
  skin: SKIN_TONES[skin],
  hair: "#1b1411",
  hairStyle,
  height,
  build: 0.98,
});
export const RUNNERS: Runner[] = [
  { lane: 1, name: "", look: look("#7b4fd6", 4), splits: scaled(GAY, 1.045, 0.165), stride: 100 / 45 },
  { lane: 2, name: "", look: look("#f4f1ea", 3), splits: scaled(GAY, 1.03, 0.149), stride: 100 / 45 },
  { lane: 3, name: "", look: look("#ff8a00", 5, 0.98, 0), splits: scaled(GAY, 1.02, 0.138), stride: 100 / 45 },
  { lane: 4, name: "BOLT", look: { ...look(COL.bolt, 5, 1.05, 0), bottom: COL.boltTrim }, splits: BOLT, stride: 2.47 },
  { lane: 5, name: "GAY", look: look(COL.navy, 4, 0.97), splits: GAY, stride: 100 / 45 },
  { lane: 6, name: "", look: look(COL.red, 5), splits: scaled(GAY, 1.012, 0.142), stride: 100 / 45 },
  { lane: 7, name: "", look: look("#14b2c4", 3, 0.98, 0), splits: scaled(GAY, 1.035, 0.134), stride: 100 / 45 },
  { lane: 8, name: "", look: look("#262b33", 4), splits: scaled(GAY, 1.05, 0.15), stride: 100 / 45 },
];
export const BOLT_R = RUNNERS[3];

/** Metres covered at race time rt (s). Piecewise, with a smooth drive phase out of the blocks. */
export const distAt = (r: Runner, rt: number) => {
  const s = r.splits;
  if (rt <= s[1][0]) return 0;
  for (let i = 1; i < s.length - 1; i++) {
    const [t0, d0] = s[i], [t1, d1] = s[i + 1];
    if (rt <= t1) {
      const k = (rt - t0) / (t1 - t0);
      return i === 1 ? d0 + (d1 - d0) * k * k : d0 + (d1 - d0) * k;
    }
  }
  const [ta, da] = s[s.length - 2], [tb, db] = s[s.length - 1];
  return Math.min(db, da + ((db - da) * (rt - ta)) / (tb - ta));
};

// ---------------------------------------------------------------- poses
const base = (): Pose => ({ body: [0, 0, 0], lift: LEG_LENGTH, spine: [0, 0, 0], head: [0, 0, 0], ls: [0, 0, 0.1], le: -0.1, rs: [0, 0, -0.1], re: -0.1, lh: [0, 0, 0.03], lk: 0, rh: [0, 0, -0.03], rk: 0 });
/** Sprint cycle at phase w (radians). drive 0..1 = extra forward lean out of the blocks. */
export const sprintPose = (w: number, drive = 0): Pose => {
  const s = Math.sin(w);
  const c = Math.cos(w);
  return {
    ...base(),
    body: [0.16 + drive * 0.45, 0, 0],
    lift: LEG_LENGTH - 0.04 + Math.abs(c) * 0.05,
    spine: [0.08, -s * 0.12, 0],
    head: [-0.1 - drive * 0.3, 0, 0],
    ls: [s * 1.15, 0, 0.12], le: -1.35,
    rs: [-s * 1.15, 0, -0.12], re: -1.35,
    lh: [-s * 0.95 - 0.15, 0, 0.02], lk: 0.35 + Math.max(0, s) * 1.35,
    rh: [s * 0.95 - 0.15, 0, -0.02], rk: 0.35 + Math.max(0, -s) * 1.35,
  };
};
/** "Set" position in the blocks: hips up, hands on the line. */
export const crouchPose = (): Pose => ({
  ...base(),
  body: [1.05, 0, 0],
  lift: 0.42,
  spine: [0.15, 0, 0],
  head: [-0.7, 0, 0],
  ls: [-1.2, 0, 0.12], le: 0,
  rs: [-1.2, 0, -0.12], re: 0,
  lh: [-1.75, 0, 0.04], lk: 1.6,
  rh: [-0.75, 0, -0.04], rk: 1.1,
});
export const finishPose = (f: number): Pose => {
  const j = Math.max(0, Math.sin((f / 60) * Math.PI * 2 * 1.1));
  return { ...base(), lift: LEG_LENGTH + j * 0.06, ls: [0, 0, 2.5 + j * 0.2], le: -0.2, rs: [0, 0, -2.5 - j * 0.2], re: -0.2 };
};

/** One runner at race time rt; heading +x. Crouches before the gun, decelerates after the line. */
export const RaceRunner: React.FC<{ r: Runner; rt: number; f: number; crouchOnly?: boolean }> = ({ r, rt, f, crouchOnly }) => {
  const d = crouchOnly ? 0 : distAt(r, rt);
  const moving = !crouchOnly && rt > r.splits[1][0];
  const w = (d / (2 * r.stride)) * Math.PI * 2;
  const drive = Math.max(0, 1 - d / 12);
  const pose = !moving ? crouchPose() : d >= 104 ? finishPose(f) : sprintPose(w, drive);
  return <ToyPerson f={f} seed={r.lane * 7} look={r.look} poseOverride={pose} position={[xAt(d) - (moving ? 0 : 0.25), 0.02, laneZ(r.lane)]} heading={Math.PI / 2} />;
};

// ---------------------------------------------------------------- stadium
const Plank: React.FC<{ z: number; i: number; len: number; x: number }> = ({ z, i, len, x }) => (
  <mesh position={[x, -0.09, z]} receiveShadow>
    <boxGeometry args={[len, 0.15, 0.6]} />
    <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
  </mesh>
);
export const WalnutStage: React.FC<{ len?: number; x?: number; z0?: number; z1?: number }> = ({ len = 66, x = 0, z0 = -12, z1 = 7 }) => (
  <group>
    {Array.from({ length: Math.round((z1 - z0) / 0.62) }, (_, i) => (
      <Plank key={i} i={i} z={z0 + i * 0.62} len={len} x={x} />
    ))}
  </group>
);

/** In-world marker plaque on the infield edge, e.g. "60 M". */
export const MeterPlaque: React.FC<{ m: number; glow?: number }> = ({ m, glow = 0 }) => (
  <group position={[xAt(m), 0, laneZ(8) - 0.75]}>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
      <meshStandardMaterial color={TP.stageDowel} />
    </mesh>
    <mesh position={[0, 0.66, 0]} castShadow>
      <RoundedBoxGeo args={[0.78, 0.36, 0.05]} radius={0.03} />
      <meshPhysicalMaterial {...POLISH.paper} color={glow > 0.5 ? COL.bolt : TP.paperCard} emissive={COL.bolt} emissiveIntensity={glow * 0.25} />
    </mesh>
    <SceneText position={[0, 0.66, 0.035]} fontSize={0.22} color="#181a1b" anchorX="center" anchorY="middle">
      {`${m} M`}
    </SceneText>
  </group>
);

const BOARD_XS = [-23, -5, 11, 23]; // clear of the 20/30/60/80 m plaques
/** Advertising boards along the front of the stands; every board carries AUDIRA (in-world brand). */
const Hoardings: React.FC = () => (
  <group>
    {BOARD_XS.map((x) => (
      <group key={x} position={[x, 0, laneZ(8) - 1.6]}>
        <group scale={[8, 1, 1]}>
          <Model id="advertising-hoarding-run-efe4bc" height={0.55} />
        </group>
        <mesh position={[0, 0.3, 0.17]}>
          <boxGeometry args={[3.2, 0.36, 0.01]} />
          <meshStandardMaterial color="#0e141d" emissive="#0e141d" />
        </mesh>
        <SceneText position={[0, 0.3, 0.185]} fontSize={0.26} color={COL.bolt} anchorX="center" anchorY="middle">
          AUDIRA · SPORT FACTS
        </SceneText>
      </group>
    ))}
  </group>
);

const SPECTATOR_COLS = ["#e8423f", "#2f6fde", "#f2b400", "#1fa67a", "#f4f1ea", "#7b4fd6"];
const Crowd: React.FC<{ x0: number; x1: number; z: number }> = ({ x0, x1, z }) => {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (let x = x0; x <= x1; x += 2.2) {
    for (let row = 0; row < 2; row++) {
      const c = SPECTATOR_COLS[(i * 7 + row * 3) % SPECTATOR_COLS.length];
      out.push(
        <Model key={`${x}-${row}`} id="spectator-d086fe" height={0.8} position={[x + row * 1.1, 0.75 + row * 0.75, z - 0.6 - row * 0.95]}
          tint={(m) => m.name.toLowerCase().includes("skin") ? undefined : m.color.set(c)} />,
      );
      i++;
    }
  }
  return <>{out}</>;
};

/** Stands, floodlights, boards. `xs` limits the crowd to the part of the straight the camera sees. */
export const Stands: React.FC<{ crowd?: [number, number]; lights?: number }> = ({ crowd = [-30, 30], lights = 1 }) => (
  <group>
    <group position={[0, 0, laneZ(8) - 4.2]}>
      <group scale={[66, 1, 1]}>
        <Model id="bleacher-stand-run-1627c2" height={2.4} />
      </group>
    </group>
    <group position={[0, 0, laneZ(8) - 8.6]}>
      <group scale={[66, 1, 1]}>
        <Model id="grandstand-seating-run-fc9023" height={4.6} />
      </group>
    </group>
    <Crowd x0={crowd[0]} x1={crowd[1]} z={laneZ(8) - 3.0} />
    {[-26, -13, 0, 13, 26].map((x) => (
      <group key={x}>
        <Model id="floodlight-mast-4482be" height={9} position={[x, 0, laneZ(8) - 11]} />
        {lights > 0 && <spotLight position={[x, 8.6, laneZ(8) - 10]} target-position={[x, 0, 0]} intensity={60 * lights} angle={0.55} penumbra={0.8} color="#eef3ff" distance={26} />}
      </group>
    ))}
    <Hoardings />
  </group>
);

/** The 100 m straight: brick clay, 9 lane lines, start blocks, finish line, grass infield behind. */
export const Track: React.FC<{ markers?: number[]; glowMarker?: number; tape?: number }> = ({ markers = [], glowMarker, tape = 0 }) => (
  <group>
    <mesh position={[0, 0, 0]} receiveShadow>
      <boxGeometry args={[66, 0.04, 8 * LANE_W + 0.6]} />
      <meshPhysicalMaterial {...POLISH.clay} color={COL.track} />
    </mesh>
    <mesh position={[0, 0.005, laneZ(8) - 2.2]} receiveShadow>
      <boxGeometry args={[66, 0.04, 2.8]} />
      <meshPhysicalMaterial {...POLISH.clay} color={COL.grass} />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[0, 0.023, 3.2 - i * LANE_W]}>
        <boxGeometry args={[66, 0.006, 0.045]} />
        <meshStandardMaterial color={COL.trackLine} />
      </mesh>
    ))}
    {[START_X, FINISH_X].map((x) => (
      <mesh key={x} position={[x, 0.024, 0]}>
        <boxGeometry args={[0.1, 0.006, 8 * LANE_W]} />
        <meshStandardMaterial color={COL.trackLine} />
      </mesh>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <group key={i} position={[START_X - 0.35, 0.02, laneZ(i + 1)]}>
        <mesh position={[0, 0.06, 0.1]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.16, 0.12, 0.1]} />
          <meshStandardMaterial color="#3a3f46" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.25, 0.06, -0.1]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.16, 0.12, 0.1]} />
          <meshStandardMaterial color="#3a3f46" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    ))}
    {markers.map((m) => (
      <MeterPlaque key={m} m={m} glow={glowMarker === m ? 1 : 0} />
    ))}
    {/* finish posts + tape */}
    {[3.4, laneZ(8) - 0.4].map((z) => (
      <mesh key={z} position={[FINISH_X, 0.55, z]}>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 8]} />
        <meshStandardMaterial color={COL.trackLine} />
      </mesh>
    ))}
    {tape > 0 && (
      <mesh position={[FINISH_X, 0.95, 0]}>
        <boxGeometry args={[0.02, 0.05, 6.8]} />
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.2} />
      </mesh>
    )}
  </group>
);

/** Paper board on beech dowels with in-world text lines. */
export const Board: React.FC<{ position: V3; w: number; h: number; lines: { text: string; size: number; color?: string; y: number }[]; color?: string; rotation?: V3 }> = ({ position, w, h, lines, color = TP.paperCard, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {[-w / 2 + 0.1, w / 2 - 0.1].map((x) => (
      <mesh key={x} position={[x, (-position[1] - h / 2) / 2, -0.03]}>
        <cylinderGeometry args={[0.035, 0.035, Math.max(0.01, position[1] - h / 2), 8]} />
        <meshStandardMaterial color={TP.stageDowel} />
      </mesh>
    ))}
    <mesh castShadow>
      <RoundedBoxGeo args={[w, h, 0.06]} radius={0.04} />
      <meshPhysicalMaterial {...POLISH.paper} color={color} />
    </mesh>
    {lines.map((l, i) => (
      <SceneText key={i} position={[0, l.y, 0.04]} fontSize={l.size} color={l.color ?? "#181a1b"} anchorX="center" anchorY="middle">
        {l.text}
      </SceneText>
    ))}
  </group>
);

export { ToyPerson };
