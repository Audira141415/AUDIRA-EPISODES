// EP04 pit-stop diorama (TOYDIORAMA): a toy F1 car in a pit box on a walnut stage, toy crew around it.
// Generic livery only (teal + cream, no team logo, no sponsor, no real number). The car is procedural
// (the GLB catalog has no single-seater); props are catalog GLBs (tyre stacks, garage, cone, oil drum).
// Faces +z = car nose. Units: a ToyPerson is ~1.05 tall at scale 1.
import React from "react";
import { Model } from "./Model.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { LEG_LENGTH, ToyPerson, type Pose } from "../../core/polish/Person.tsx";
import { GroundShadow, SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";

type V3 = [number, number, number];

export const LIVERY = {
  body: "#14a3a0", // generic teal
  accent: "#f4efe6", // cream
  dark: "#1d2630",
  rim: "#d7dde3",
  rubber: "#1a1a1c",
  stripe: "#f2c230", // sidewall stripe
  crewTop: "#14a3a0",
  crewBottom: "#1f2b3a",
  helmet: "#f4efe6",
};

// ---------------------------------------------------------------- car
export const Wheel: React.FC<{ position: V3; r?: number; w?: number; spin?: number; off?: number; rim?: number }> = ({ position, r = 0.3, w = 0.3, spin = 0, off = 0, rim = 0.6 }) => (
  <group position={[position[0] + off, position[1], position[2]]} rotation={[spin, 0, Math.PI / 2]}>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[r, r, w, 40]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.82} clearcoat={0.1} color={LIVERY.rubber} />
    </mesh>
    {/* sidewall stripe both sides */}
    {[1, -1].map((s) => (
      <mesh key={s} position={[0, (s * w) / 2 + s * 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 0.74, r * 0.8, 40]} />
        <meshBasicMaterial color={LIVERY.stripe} side={2} />
      </mesh>
    ))}
    {/* rim + wheel nut, outer face */}
    {[1, -1].map((s) => (
      <group key={`r${s}`} position={[0, (s * w) / 2, 0]}>
        <mesh position={[0, s * 0.004, 0]}>
          <cylinderGeometry args={[r * rim, r * rim, 0.02, 32]} />
          <meshPhysicalMaterial color={LIVERY.rim} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, s * 0.03, 0]}>
          <cylinderGeometry args={[r * 0.16, r * 0.16, 0.06, 6]} />
          <meshPhysicalMaterial color="#e2442f" metalness={0.4} roughness={0.35} />
        </mesh>
      </group>
    ))}
  </group>
);

export const WHEELS: { key: string; pos: V3; side: 1 | -1 }[] = [
  { key: "FL", pos: [0.74, 0.3, 1.05], side: 1 },
  { key: "FR", pos: [-0.74, 0.3, 1.05], side: -1 },
  { key: "RL", pos: [0.74, 0.3, -1.02], side: 1 },
  { key: "RR", pos: [-0.74, 0.3, -1.02], side: -1 },
];

export const ToyF1: React.FC<{ position?: V3; heading?: number; lift?: number; wheelOff?: Partial<Record<string, number>>; color?: string; spin?: number }> = ({
  position = [0, 0, 0],
  heading = 0,
  lift = 0,
  wheelOff = {},
  color = LIVERY.body,
  spin = 0,
}) => {
  const grain = useSurfaceGrain(44, 0.18, 3);
  const body = { ...POLISH.toyPlastic, color, bumpMap: grain, bumpScale: 0.12 };
  const cream = { ...POLISH.toyPlastic, color: LIVERY.accent };
  const dark = { ...POLISH.toyPlastic, roughness: 0.6, color: LIVERY.dark };
  return (
    <group position={[position[0], position[1] + lift, position[2]]} rotation={[0, heading, 0]}>
      {/* floor plank */}
      <mesh position={[0, 0.11, -0.05]} castShadow>
        <RoundedBoxGeo args={[1.2, 0.05, 2.6]} />
        <meshPhysicalMaterial {...dark} />
      </mesh>
      {/* monocoque */}
      <mesh position={[0, 0.32, 0.1]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.56, 0.32, 2.1]} radius={0.1} />
        <meshPhysicalMaterial {...body} />
      </mesh>
      {/* nose cone */}
      <mesh position={[0, 0.24, 1.55]} rotation={[Math.PI / 2 + 0.06, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.08, 0.95, 24]} />
        <meshPhysicalMaterial {...body} />
      </mesh>
      {/* front wing */}
      <mesh position={[0, 0.1, 1.98]} castShadow>
        <RoundedBoxGeo args={[1.62, 0.05, 0.36]} radius={0.02} />
        <meshPhysicalMaterial {...cream} />
      </mesh>
      <mesh position={[0, 0.17, 1.9]} castShadow>
        <RoundedBoxGeo args={[1.5, 0.035, 0.2]} radius={0.015} />
        <meshPhysicalMaterial {...body} />
      </mesh>
      {[0.8, -0.8].map((x) => (
        <mesh key={x} position={[x, 0.16, 1.96]} castShadow>
          <RoundedBoxGeo args={[0.04, 0.2, 0.42]} radius={0.015} />
          <meshPhysicalMaterial {...dark} />
        </mesh>
      ))}
      {/* sidepods */}
      <mesh position={[0, 0.3, -0.15]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.08, 0.28, 1.05]} radius={0.12} />
        <meshPhysicalMaterial {...body} />
      </mesh>
      {/* cream sidepod band */}
      <mesh position={[0, 0.36, 0.18]} castShadow>
        <RoundedBoxGeo args={[1.1, 0.08, 0.4]} radius={0.04} />
        <meshPhysicalMaterial {...cream} />
      </mesh>
      {/* engine cover + airbox */}
      <mesh position={[0, 0.5, -0.62]} castShadow>
        <RoundedBoxGeo args={[0.38, 0.36, 1.15]} radius={0.14} />
        <meshPhysicalMaterial {...body} />
      </mesh>
      <mesh position={[0, 0.72, -0.15]} castShadow>
        <RoundedBoxGeo args={[0.26, 0.2, 0.3]} radius={0.08} />
        <meshPhysicalMaterial {...dark} />
      </mesh>
      {/* halo */}
      <mesh position={[0, 0.62, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.22, 0.03, 10, 28, Math.PI]} />
        <meshPhysicalMaterial {...dark} />
      </mesh>
      <mesh position={[0, 0.55, 0.62]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
        <meshPhysicalMaterial {...dark} />
      </mesh>
      {/* driver helmet (generic, dark visor) */}
      <mesh position={[0, 0.6, 0.28]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4d23a" />
      </mesh>
      <mesh position={[0, 0.61, 0.38]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.06, 0.08]} />
        <meshPhysicalMaterial {...POLISH.glossyEye} color="#101418" />
      </mesh>
      {/* rear wing */}
      <mesh position={[0, 0.92, -1.42]} rotation={[-0.15, 0, 0]} castShadow>
        <RoundedBoxGeo args={[1.15, 0.06, 0.3]} radius={0.02} />
        <meshPhysicalMaterial {...cream} />
      </mesh>
      <mesh position={[0, 0.8, -1.42]} castShadow>
        <RoundedBoxGeo args={[1.1, 0.04, 0.2]} radius={0.015} />
        <meshPhysicalMaterial {...body} />
      </mesh>
      {[0.58, -0.58].map((x) => (
        <mesh key={x} position={[x, 0.76, -1.42]} castShadow>
          <RoundedBoxGeo args={[0.04, 0.46, 0.44]} radius={0.015} />
          <meshPhysicalMaterial {...dark} />
        </mesh>
      ))}
      <mesh position={[0, 0.62, -1.3]} castShadow>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshPhysicalMaterial {...dark} />
      </mesh>
      {/* suspension arms */}
      {WHEELS.map((w) => (
        <mesh key={w.key} position={[w.pos[0] / 2, 0.3, w.pos[2]]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, Math.abs(w.pos[0]), 8]} />
          <meshPhysicalMaterial {...dark} />
        </mesh>
      ))}
      {WHEELS.map((w) => (
        <Wheel key={w.key} position={w.pos} spin={spin} off={(wheelOff[w.key] ?? 0) * w.side} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- crew
/** Kneeling gunner: left knee up, right knee down, arms forward at chest height. */
export const kneelPose = (reach = 0): Pose => ({
  body: [0, 0, 0],
  lift: 0.27,
  spine: [0.18, 0, 0],
  head: [-0.05, 0, 0],
  ls: [-1.25 - reach * 0.2, 0, 0.18], le: -0.35,
  rs: [-1.25 - reach * 0.2, 0, -0.18], re: -0.35,
  lh: [-1.55, 0, 0.12], lk: 1.55,
  rh: [0.25, 0, -0.08], rk: 1.8,
});

/** Standing carrier holding a tyre against the chest. */
export const carryPose = (): Pose => ({
  body: [0, 0, 0],
  lift: LEG_LENGTH,
  spine: [0.05, 0, 0],
  head: [0, 0, 0],
  ls: [-0.9, 0, 0.35], le: -1.0,
  rs: [-0.9, 0, -0.35], re: -1.0,
  lh: [-0.1, 0, 0.05], lk: 0.15,
  rh: [0.1, 0, -0.05], rk: 0.05,
});

const crewLook = { top: LIVERY.crewTop, bottom: LIVERY.crewBottom, outfit: "casual" as const, hairStyle: 2 as const, cap: LIVERY.helmet, build: 1.05, height: 1 };

/** Wheel gun held by a kneeling gunner (local to the gunner: in front at chest height). */
const WheelGun: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.045, 0.05, 0.24, 14]} />
      <meshPhysicalMaterial color="#c9ced4" metalness={0.75} roughness={0.28} />
    </mesh>
    <mesh position={[0, -0.07, -0.05]} castShadow>
      <RoundedBoxGeo args={[0.05, 0.12, 0.05]} radius={0.015} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#e2442f" />
    </mesh>
  </group>
);

export const Gunner: React.FC<{ f: number; seed: number; position: V3; heading: number }> = ({ f, seed, position, heading }) => (
  <group position={position} rotation={[0, heading, 0]}>
    <ToyPerson f={f} seed={seed} poseOverride={kneelPose()} look={crewLook} position={[0, 0, 0]} scale={1} />
    <WheelGun position={[0, 0.42, 0.3]} />
  </group>
);

export const Carrier: React.FC<{ f: number; seed: number; position: V3; heading: number }> = ({ f, seed, position, heading }) => (
  <group position={position} rotation={[0, heading, 0]}>
    <ToyPerson f={f} seed={seed} poseOverride={carryPose()} look={crewLook} position={[0, 0, 0]} />
    <Wheel position={[0, 0.62, 0.3]} r={0.26} w={0.26} />
  </group>
);

/** Front jack: long bar with a T handle; operator stands in front of the nose. */
export const FrontJack: React.FC<{ f: number; seed: number; position: V3 }> = ({ f, seed, position }) => (
  <group position={position}>
    <ToyPerson f={f} seed={seed} poseOverride={{ ...carryPose(), ls: [-0.6, 0, 0.2], rs: [-0.6, 0, -0.2], le: -0.5, re: -0.5, spine: [0.12, 0, 0] }} look={crewLook} heading={Math.PI} />
    <mesh position={[0, 0.3, -0.5]} rotation={[Math.PI / 2 - 0.45, 0, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.95, 10]} />
      <meshPhysicalMaterial color="#d8dde2" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.48, -0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.4, 10]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#e2442f" />
    </mesh>
  </group>
);

// ---------------------------------------------------------------- set
/** Pit lane on a walnut toy stage: asphalt slab, painted box, tyre stacks, garage, AUDIRA board. */
export const PitLane: React.FC<{ f: number }> = () => {
  const asphalt = useSurfaceGrain(9, 0.35, 6);
  const planks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  return (
    <group>
      {/* backdrop void */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color={TP.stageBackdrop} roughness={0.95} />
      </mesh>
      {/* walnut planks under the slab */}
      {planks.map((i) => (
        <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 9.6]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      <mesh position={[0, -0.35, 4.82]}>
        <boxGeometry args={[5.8, 0.55, 0.08]} />
        <meshStandardMaterial color={TP.stageTrim} roughness={0.75} />
      </mesh>
      {/* asphalt slab (clay) */}
      <mesh position={[0, 0.0, -0.4]} receiveShadow>
        <boxGeometry args={[4.6, 0.04, 8.8]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#4a4d52" bumpMap={asphalt} bumpScale={0.6} />
      </mesh>
      {/* pit box lines: white rectangle + yellow fast-lane line */}
      {[
        { p: [1.35, 0.023, 0] as V3, s: [0.06, 0.004, 4.6] as V3, c: "#efece4" },
        { p: [-1.35, 0.023, 0] as V3, s: [0.06, 0.004, 4.6] as V3, c: "#efece4" },
        { p: [0, 0.023, 2.3] as V3, s: [2.76, 0.004, 0.06] as V3, c: "#efece4" },
        { p: [0, 0.023, -2.3] as V3, s: [2.76, 0.004, 0.06] as V3, c: "#efece4" },
        { p: [-2.0, 0.023, -0.4] as V3, s: [0.08, 0.004, 7.6] as V3, c: "#f2c230" },
      ].map((l, i) => (
        <mesh key={i} position={l.p}>
          <boxGeometry args={l.s} />
          <meshStandardMaterial color={l.c} roughness={0.7} />
        </mesh>
      ))}
      {/* wheel-stop marks under the four wheels */}
      {WHEELS.map((w) => (
        <mesh key={w.key} position={[w.pos[0], 0.024, w.pos[2]]}>
          <boxGeometry args={[0.36, 0.004, 0.08]} />
          <meshStandardMaterial color="#efece4" />
        </mesh>
      ))}
      {/* garage behind the box */}
      <Model id="service-bay-garage-aaf8e0" position={[0, 0.02, -4.4]} height={2.6} />
      {/* AUDIRA header board on the garage (in-world brand) */}
      <group position={[0, 2.45, -3.0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[2.6, 0.5, 0.08]} radius={0.04} />
          <meshPhysicalMaterial {...POLISH.paper} color={TP.paperCard} />
        </mesh>
        <SceneText position={[0, 0, 0.05]} fontSize={0.3} color="#181a1b" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          AUDIRA · PIT 04
        </SceneText>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, -0.75, -0.02]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
            <meshStandardMaterial color={TP.stageDowel} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* spare-tyre stacks lying flat behind the box */}
      {[
        [1.95, -2.0],
        [-1.8, -2.7],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2].map((k) => (
            <group key={k} position={[0, 0.17 + k * 0.3, 0]} rotation={[0, k * 0.4, -Math.PI / 2]}>
              <Wheel position={[0, 0, 0]} r={0.28} w={0.28} />
            </group>
          ))}
        </group>
      ))}
      <Model id="oil-drum-386c30" position={[2.0, 0.02, -3.0]} height={0.55} />
      <Model id="traffic-cone-c421e4" position={[-1.75, 0.02, 2.6]} height={0.32} />
      {/* foreground: two catalog tyres standing by the apron (lower third) */}
      <Model id="tire-ccf0eb" position={[1.7, 0.02, 3.7]} rotation={[0, 0.5, 0]} height={0.36} />
      <Model id="tire-ccf0eb" position={[2.3, 0.02, 3.25]} rotation={[0, 0.9, 0]} height={0.36} />
      <GroundShadow y={0.03} scale={7} opacity={0.55} blur={2.2} far={1.6} />
    </group>
  );
};

/** The whole pit box at one instant: car on the jacks, eleven crew around it. */
export const PitBox: React.FC<{ f: number; lift?: number; wheelOff?: Partial<Record<string, number>> }> = ({ f, lift = 0.06, wheelOff }) => (
  <group>
    <ToyF1 lift={lift} wheelOff={wheelOff} />
    {/* gunners kneel at each wheel, facing the hub */}
    <Gunner f={f} seed={11} position={[1.32, 0.02, 1.05]} heading={-Math.PI / 2} />
    <Gunner f={f} seed={12} position={[-1.32, 0.02, 1.05]} heading={Math.PI / 2} />
    <Gunner f={f} seed={13} position={[1.32, 0.02, -1.02]} heading={-Math.PI / 2} />
    <Gunner f={f} seed={14} position={[-1.32, 0.02, -1.02]} heading={Math.PI / 2} />
    {/* fresh-tyre carriers wait just outboard */}
    <Carrier f={f} seed={21} position={[1.62, 0.02, 0.0]} heading={-Math.PI / 2} />
    <Carrier f={f} seed={22} position={[-1.62, 0.02, 0.0]} heading={Math.PI / 2} />
    <Carrier f={f} seed={23} position={[1.62, 0.02, -1.6]} heading={-Math.PI / 2} />
    <Carrier f={f} seed={24} position={[-1.62, 0.02, -1.6]} heading={Math.PI / 2} />
    <FrontJack f={f} seed={31} position={[0, 0.02, 2.75]} />
  </group>
);
