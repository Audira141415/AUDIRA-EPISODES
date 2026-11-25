// EP09 film world (TOYDIORAMA): the approved cover stage, re-dressed beat by beat like a real toy
// theatre: wagons roll the set off to the wings, flats fly in from above, props rise through the
// trap, tags drop on washi tape. Every change is keyed to the VO word clock (clock.ts).
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { LEG_LENGTH, ToyPerson, poseAt } from "../../core/polish/Person.tsx";
import { TOYDIORAMA_PALETTE as PAL } from "../../kits/toydiorama/lib/palette.ts";
import {
  Audience,
  BG,
  COVER_CAMERA,
  Car,
  FONTS,
  Foreground,
  GUARD_SCALE,
  KeySpot,
  Pension,
  Phys,
  Podium,
  Stage,
  Tag,
  Washi,
  guardPose,
} from "./Cover.tsx";
import { T, clamp01, lerp, seg, smooth, spring, win } from "./clock.ts";
import {
  TAG_W,
  bookCoverTexture,
  bookLeftTexture,
  bookRightTexture,
  digitTexture,
  facadeTexture,
  letterTexture,
  sahInkTexture,
  signTexture,
  tagHeight,
  tagLinesTexture,
  panLabelTexture,
} from "./filmTextures.ts";

type V3 = [number, number, number];

// ------------------------------------------------------------------ camera path
type Key = { t: number; p: V3; q: V3 };
export const CAM_KEYS: Key[] = [
  { t: 0, p: COVER_CAMERA.position, q: COVER_CAMERA.target },
  { t: 5.2, p: [0.08, 1.72, 7.6], q: [0, 0.98, -0.4] },
  { t: 7.6, p: [-0.1, 1.5, 7.1], q: [0, 0.78, -0.6] },
  { t: 11.0, p: [-0.35, 1.32, 6.3], q: [0.05, 0.7, -0.5] },
  { t: 14.4, p: [0.35, 1.38, 5.5], q: [0.3, 0.82, -0.6] },
  { t: 17.6, p: [0.05, 1.72, 7.7], q: [0, 0.72, -0.2] },
  { t: 20.4, p: [-0.3, 1.25, 4.2], q: [-0.32, 0.3, 0.9] },
  { t: 27.0, p: [-0.05, 1.28, 4.2], q: [-0.02, 0.3, 0.9] },
  { t: 30.4, p: [0.0, 1.3, 4.4], q: [0.0, 0.34, 0.9] },
  { t: 33.6, p: [0.02, 1.36, 4.8], q: [0.0, 0.26, 0.9] },
  { t: 36.6, p: [0.1, 1.45, 4.9], q: [0.1, 0.45, 0.8] },
  { t: 39.6, p: [-0.35, 1.25, 4.2], q: [-0.2, 0.3, 0.95] },
  { t: 44.2, p: [-0.15, 1.3, 4.4], q: [-0.1, 0.32, 0.9] },
  { t: 46.6, p: [0.05, 1.45, 4.3], q: [0, 0.38, -1.0] },
  { t: 49.4, p: [-0.45, 1.6, 5.9], q: [-0.35, 0.62, -0.35] },
  { t: 52.6, p: [0.1, 1.72, 6.3], q: [0.15, 0.82, -0.6] },
  { t: 57.0, p: [0.35, 1.62, 6.5], q: [0.3, 0.72, -0.5] },
  { t: 60.0, p: [0.75, 1.45, 5.3], q: [0.62, 0.72, -0.35] },
  { t: 64.6, p: [0.45, 1.6, 6.0], q: [0.4, 0.82, -0.4] },
  { t: 67.4, p: [0.0, 1.62, 6.0], q: [0, 1.05, -0.2] },
  { t: 71.4, p: [-0.12, 0.98, 5.15], q: [-0.12, 0.5, 1.0] },
  { t: 73.9, p: [-0.12, 1.02, 5.3], q: [-0.12, 0.52, 1.0] },
  { t: 77.2, p: [0, 1.75, 8.4], q: [0, 0.82, 0] },
  { t: 86.5, p: [0, 1.82, 9.1], q: [0, 0.86, 0] },
];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

export function cameraAt(t: number): { p: V3; q: V3 } {
  const K = CAM_KEYS;
  let i = 0;
  while (i < K.length - 2 && t > K[i + 1].t) i++;
  const k0 = K[Math.max(0, i - 1)], k1 = K[i], k2 = K[i + 1], k3 = K[Math.min(K.length - 1, i + 2)];
  // mostly linear (continuous motion), slightly eased so segment speeds blend
  const lu = clamp01((t - k1.t) / (k2.t - k1.t));
  const u = lu * 0.7 + smooth(lu) * 0.3;
  const p = [0, 1, 2].map((a) => cr(k0.p[a], k1.p[a], k2.p[a], k3.p[a], u)) as V3;
  const q = [0, 1, 2].map((a) => cr(k0.q[a], k1.q[a], k2.q[a], k3.q[a], u)) as V3;
  return { p, q };
}

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { p, q } = cameraAt(t);
    camera.position.set(...p);
    camera.lookAt(...q);
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ------------------------------------------------------------------ dropping tag (multi-line)
/** A kraft tag that drops in on washi tape at `a` and flies back up at `b`. */
const DropTag: React.FC<{
  t: number;
  id: string;
  refLine: string;
  lines: string[];
  pos: V3;
  a: number;
  b: number;
  w?: number;
  rotY?: number;
  tilt?: number;
  seed: number;
  paper?: string;
}> = ({ t, id, refLine, lines, pos, a, b, w = 0.8, rotY = 0, tilt = 0, seed, paper }) => {
  if (t < a - 0.05 || t > b + 0.9) return null;
  const tex = tagLinesTexture(id, refLine, lines, FONTS, seed, paper);
  const H = (w * tagHeight(lines.length, refLine !== "")) / TAG_W;
  const inK = spring(t, a, 0.75);
  const outK = seg(t, b, b + 0.85);
  const y = pos[1] + (1 - inK) * 1.8 + outK * 2.4;
  const swing = Math.sin((t - a) * 5) * Math.exp(-(t - a) * 2.2) * 0.12;
  return (
    <group position={[pos[0], y, pos[2]]} rotation={[0, rotY, tilt + swing + outK * 0.3]}>
      {/* hanging thread */}
      <mesh position={[0, H / 2 + 1.0, -0.004]}>
        <cylinderGeometry args={[0.003, 0.003, 2.0, 4]} />
        <meshStandardMaterial color="#d9ccb0" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, H, 0.006]} />
        <meshStandardMaterial color="#cfa970" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.0035]}>
        <planeGeometry args={[w, H]} />
        <meshStandardMaterial map={tex} roughness={0.92} />
      </mesh>
      {w >= 0.5 && <Washi pos={[-w / 2 + Math.min(0.06, w * 0.12), H / 2 - 0.01, 0.006]} rot={0.6} w={Math.min(0.2, w * 0.26)} />}
      {w >= 0.5 && <Washi pos={[w / 2 - Math.min(0.06, w * 0.12), H / 2 - 0.01, 0.006]} rot={-0.55} w={Math.min(0.2, w * 0.26)} color="#9fc9c2" />}
    </group>
  );
};

// ------------------------------------------------------------------ dollhouse: the front wall swings down to show the furnishing
const HollowHouse: React.FC<{ t: number; x: number }> = ({ t, x }) => {
  const grain = useSurfaceGrain(52, 0.3, 3);
  const W = 1.34, Hh = 0.74, D = 0.82, th = 0.05;
  const glow = "#ffc46b";
  const lift = seg(t, T.perlengkapan - 0.35, T.perlengkapan + 0.55) * (1 - seg(t, T.pengamanan - 0.2, T.pengamanan + 0.6));
  const wallY = 0.06 + Hh / 2;
  return (
    <group position={[x, 0, -1.05]}>
      <mesh receiveShadow castShadow position={[0, 0.03, 0.1]}>
        <RoundedBoxGeo args={[2.0, 0.06, 1.35]} radius={0.025} segments={3} />
        <Phys kind="fabric" color="#6f9a4d" bump={grain} bumpScale={0.8} />
      </mesh>
      {/* walls: back, sides (the front wall is the hinged panel below) */}
      {(
        [
          [[0, wallY, -D / 2 + th / 2], [W, Hh, th]],
          [[-W / 2 + th / 2, wallY, 0], [th, Hh, D]],
          [[W / 2 - th / 2, wallY, 0], [th, Hh, D]],
        ] as [V3, V3][]
      ).map(([p, s], i) => (
        <mesh key={i} castShadow receiveShadow position={p}>
          <RoundedBoxGeo args={s} radius={0.02} segments={2} />
          <Phys kind="clay" color="#f1e4cb" bump={grain} bumpScale={0.4} />
        </mesh>
      ))}
      {/* interior floor + furnishing ("perlengkapan") */}
      <mesh receiveShadow position={[0, 0.075, 0]}>
        <boxGeometry args={[W - 0.1, 0.02, D - 0.1]} />
        <Phys kind="stone" color="#b98e62" />
      </mesh>
      <group position={[-0.32, 0.085, 0.05]}>
        <mesh castShadow position={[0, 0.06, 0]}>
          <RoundedBoxGeo args={[0.36, 0.11, 0.16]} radius={0.04} segments={3} />
          <Phys kind="fabric" color="#c0883a" />
        </mesh>
        <mesh castShadow position={[0, 0.14, -0.065]}>
          <RoundedBoxGeo args={[0.36, 0.14, 0.05]} radius={0.02} segments={3} />
          <Phys kind="fabric" color="#a8722c" />
        </mesh>
      </group>
      <group position={[0.05, 0.085, 0.12]}>
        <mesh castShadow position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
          <Phys kind="toyPlastic" color="#6b3f24" />
        </mesh>
        <mesh castShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.08, 10]} />
          <Phys kind="toyPlastic" color="#6b3f24" />
        </mesh>
      </group>
      <group position={[0.38, 0.085, -0.12]}>
        <mesh castShadow position={[0, 0.05, 0]}>
          <RoundedBoxGeo args={[0.34, 0.08, 0.42]} radius={0.03} segments={3} />
          <Phys kind="fabric" color="#3e6e78" />
        </mesh>
        <mesh castShadow position={[0, 0.1, -0.15]}>
          <RoundedBoxGeo args={[0.3, 0.05, 0.1]} radius={0.025} segments={3} />
          <Phys kind="fabric" color="#f4efe6" />
        </mesh>
      </group>
      <group position={[0.15, 0.085, -0.28]}>
        <mesh castShadow position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
          <meshStandardMaterial color="#d9b25a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.06, 0.07, 16, 1, true]} />
          <meshStandardMaterial color="#f6e3b8" emissive={glow} emissiveIntensity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight position={[0, 0.5, 0]} color={glow} intensity={0.6 + lift * 0.8} distance={1.4} decay={2} />
      {/* roof */}
      <group position={[0, 0.06 + Hh + 0.2, 0]}>
        <mesh castShadow rotation={[0, Math.PI / 4, 0]} scale={[1.18, 1, 0.74]}>
          <coneGeometry args={[W * 0.78, 0.48, 4, 1]} />
          <Phys kind="toyPlastic" color="#c4552f" bump={grain} bumpScale={0.5} />
        </mesh>
        <mesh position={[0, -0.235, 0]}>
          <RoundedBoxGeo args={[W + 0.16, 0.04, D + 0.14]} radius={0.015} segments={2} />
          <Phys kind="toyPlastic" color="#f6efe2" />
        </mesh>
      </group>
      {/* hinged front wall with windows + door (as on the cover) */}
      <group position={[0, 0.06, D / 2]} rotation={[lift * 1.5, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, Hh / 2, -th / 2]}>
        <RoundedBoxGeo args={[W, Hh, th]} radius={0.02} segments={2} />
        <Phys kind="clay" color="#f1e4cb" bump={grain} bumpScale={0.4} />
      </mesh>
      {[-0.42, 0.42].map((wx) => (
        <group key={wx} position={[wx, Hh * 0.55, 0.004]}>
          <mesh>
            <RoundedBoxGeo args={[0.3, 0.3, 0.02]} radius={0.008} segments={2} />
            <meshStandardMaterial color="#f6efe2" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[0.24, 0.24]} />
            <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[0, 0, 0.014]}>
            <boxGeometry args={[0.018, 0.25, 0.004]} />
            <meshStandardMaterial color="#f6efe2" />
          </mesh>
          <mesh position={[0, 0, 0.014]}>
            <boxGeometry args={[0.25, 0.018, 0.004]} />
            <meshStandardMaterial color="#f6efe2" />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.2, 0, 0.006]}>
              <RoundedBoxGeo args={[0.09, 0.3, 0.016]} radius={0.006} segments={2} />
              <Phys kind="toyPlastic" color="#3e6e78" />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.24, 0.01]}>
        <RoundedBoxGeo args={[0.24, 0.44, 0.03]} radius={0.01} segments={2} />
        <Phys kind="toyPlastic" color="#6b3f24" bump={grain} />
      </mesh>
      </group>
      <mesh castShadow receiveShadow position={[0, 0.085, D / 2 + 0.16]} visible={lift < 0.05}>
        <RoundedBoxGeo args={[0.56, 0.05, 0.3]} radius={0.015} segments={2} />
        <Phys kind="stone" color="#cbbfae" />
      </mesh>
      {[-0.82, 0.82].map((sx, i) => (
        <group key={sx} position={[sx, 0.06, D / 2 + 0.05]}>
          <mesh castShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.045, 0.1, 16]} />
            <Phys kind="clay" color="#b4643e" />
          </mesh>
          <mesh castShadow position={[0, 0.17, 0]}>
            <sphereGeometry args={[0.11 + i * 0.01, 20, 14]} />
            <Phys kind="clay" color="#3f7a45" bump={grain} bumpScale={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ generic toy figures
const SUIT = "#1c2230";
const GuardFig: React.FC<{ t: number; pos: V3; heading: number; walking: boolean }> = ({ t, pos, heading, walking }) => {
  const look = useMemo(
    () => ({ skin: "#b47a52", hair: "#1b1411", top: SUIT, bottom: SUIT, outfit: "casual" as const, hairStyle: 0 as const, build: 1.1, height: 1 }),
    [],
  );
  const pose = walking ? poseAt("walk", t * 60, 4) : guardPose();
  const headY = LEG_LENGTH + 0.4;
  return (
    <group position={pos} rotation={[0, heading, 0]}>
      <ToyPerson f={t * 60} seed={4} look={look} poseOverride={pose} scale={GUARD_SCALE} />
      <group scale={GUARD_SCALE} position={[0, walking ? pose.lift - LEG_LENGTH : 0, 0]}>
        <mesh position={[0, LEG_LENGTH + 0.235, 0.083]} rotation={[-0.12, 0, Math.PI]}>
          <circleGeometry args={[0.045, 3]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.7} />
        </mesh>
        <mesh position={[0, LEG_LENGTH + 0.19, 0.088]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.018, 0.09, 0.006]} />
          <meshStandardMaterial color="#7a1820" roughness={0.6} />
        </mesh>
        <group position={[0, headY, 0]} rotation={[0, walking ? 0 : -0.12, 0]}>
          {/* aviator-style sunglasses: two rounded lenses, a bridge and temple arms; eyebrows stay visible */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.045, 0.006, 0.112]} rotation={[0, sx * 0.32, 0]} scale={[1, 0.82, 0.35]}>
              <sphereGeometry args={[0.03, 20, 14]} />
              <meshPhysicalMaterial color="#14181f" roughness={0.05} clearcoat={1} clearcoatRoughness={0.04} metalness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 0.016, 0.119]}>
            <boxGeometry args={[0.03, 0.005, 0.005]} />
            <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.1, 0.014, 0.06]} rotation={[0, sx * 0.55, 0]}>
              <boxGeometry args={[0.004, 0.005, 0.11]} />
              <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.045, 0.05, 0.111]} rotation={[0, 0, sx * -0.12]}>
              <boxGeometry args={[0.045, 0.009, 0.01]} />
              <meshStandardMaterial color="#1b1411" roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0.124, -0.01, 0.01]}>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color="#d8d8d0" roughness={0.4} />
          </mesh>
          <mesh position={[0.118, -0.075, -0.02]} rotation={[0.25, 0, 0.08]}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.13, 6]} />
            <meshStandardMaterial color="#e8e8e0" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/** Generic toy figure seen from behind carrying the letter (ILUSTRASI; no likeness). */
const Envoy: React.FC<{ t: number }> = ({ t }) => {
  const look = useMemo(
    () => ({ skin: "#d9a57c", hair: "#1b1411", top: "#f2efe8", bottom: "#1c2230", outfit: "casual" as const, hairStyle: 0 as const, build: 1, height: 1 }),
    [],
  );
  const a = T.gibran - 0.3, b = T.menyerahkan - 0.1;
  const c = T.lalu - 0.2, d = T.lalu + 1.6;
  if (t < a - 0.1 || t > d) return null;
  const from: V3 = [1.0, 0, 1.3], stop: V3 = [0.12, 0, -0.4], exit: V3 = [2.8, 0, 0.3];
  let pos: V3 = from, heading = Math.atan2(stop[0] - from[0], stop[2] - from[2]), walking = true;
  if (t < b) {
    const k = clamp01((t - a) / (b - a));
    pos = [lerp(from[0], stop[0], k), 0, lerp(from[2], stop[2], k)];
  } else if (t < c) {
    pos = stop;
    walking = false;
    heading = Math.PI;
  } else {
    const k = clamp01((t - c) / (d - c));
    pos = [lerp(stop[0], exit[0], k), 0, lerp(stop[2], exit[2], k)];
    heading = Math.atan2(exit[0] - stop[0], exit[2] - stop[2]);
  }
  return <ToyPerson f={t * 60} seed={9} look={look} pose={walking ? "walk" : "stand"} position={pos} heading={heading} scale={GUARD_SCALE} />;
};

// ------------------------------------------------------------------ KONTEKS: MPR facade flat, letter, stamp
const FacadeFlat: React.FC<{ t: number }> = ({ t }) => {
  const down = seg(t, T.kamis + 0.4, T.kamis + 1.7) * (1 - seg(t, T.lalu, T.lalu + 1.2));
  if (down <= 0.001) return null;
  const tex = facadeTexture(FONTS);
  const ink = sahInkTexture(FONTS);
  const y = (1 - down) * 3.6;
  const Wf = 2.1, Hf = (Wf * 620) / 1024;
  const sahOn = seg(t, T.sah, T.sah + 0.06);
  return (
    <group position={[0, y, -0.95]}>
      {/* fly ropes */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, Hf + 1.8, -0.02]}>
          <cylinderGeometry args={[0.005, 0.005, 3.6, 4]} />
          <meshStandardMaterial color="#d9ccb0" />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, Hf / 2, 0]}>
        <boxGeometry args={[Wf, Hf, 0.03]} />
        <meshStandardMaterial color="#cdbf9f" roughness={0.95} />
      </mesh>
      <mesh position={[0, Hf / 2, 0.016]}>
        <planeGeometry args={[Wf, Hf]} />
        <meshStandardMaterial map={tex} roughness={0.92} />
      </mesh>
      {/* split green shell roof (clay) */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.3, Hf - 0.02, -0.05]} rotation={[0, 0, s * -0.25]} scale={[0.5, 0.42, 0.32]}>
          <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Phys kind="clay" color="#4f8f6a" />
        </mesh>
      ))}
      {/* SAH tag pinned on the flat */}
      <group position={[0.3, 0.22, 0.03]}>
        <DropTag t={t} id="sah" refLine="MENURUT PAKAR" lines={["SAH SETELAH DIBACAKAN", "DI SIDANG MPR"]} pos={[0, 0.72, 0]} a={T.pakar} b={T.lalu - 0.2} w={0.86} tilt={-0.04} seed={31} />
        {t > T.sah && t < T.lalu + 0.3 && (
          <mesh position={[0.36, 0.44, 0.02]} rotation={[0, 0, -0.2]} scale={0.7 + 0.1 * sahOn}>
            <planeGeometry args={[0.28, 0.28]} />
            <meshBasicMaterial map={ink} transparent opacity={sahOn} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/** Toy rubber stamp that thumps the SAH tag. */
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const a = T.sah - 0.45, b = T.sah + 0.9;
  if (t < a || t > b) return null;
  const inK = seg(t, a, T.sah);
  const outK = seg(t, T.sah + 0.2, b);
  const z = lerp(0.4, -0.86, inK) + outK * 1.2;
  return (
    <group position={[0.66, 0.66, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow position={[0, -0.02, 0]}>
        <RoundedBoxGeo args={[0.2, 0.04, 0.2]} radius={0.01} segments={2} />
        <meshStandardMaterial color="#7a1f24" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.16, 16]} />
        <Phys kind="toyPlastic" color="#b98a52" />
      </mesh>
      <mesh castShadow position={[0, -0.23, 0]}>
        <sphereGeometry args={[0.06, 20, 14]} />
        <Phys kind="toyPlastic" color="#b98a52" />
      </mesh>
    </group>
  );
};

const Letter: React.FC<{ t: number }> = ({ t }) => {
  const tex = letterTexture(FONTS);
  const a = T.gibran - 0.3, fly0 = T.menyerahkan, fly1 = T.menyerahkan + 1.0;
  if (t < a || t > fly1 + 0.05) return null;
  // follows the envoy's walk in his right hand, then arcs into the doorway
  const b = T.menyerahkan - 0.1;
  const k = clamp01((t - a) / (b - a));
  const hand: V3 = [lerp(1.0, 0.12, k) + 0.11, 0.34, lerp(1.3, -0.4, k) + 0.04];
  const door: V3 = [0, 0.28, -0.92];
  const f = seg(t, fly0, fly1);
  const p: V3 = [lerp(hand[0], door[0], f), lerp(hand[1], door[1], f) + Math.sin(f * Math.PI) * 0.45, lerp(hand[2], door[2], f)];
  const s = 1 - f * 0.6;
  return (
    <group position={p} rotation={[0, 0, Math.sin(t * 6) * 0.05]} scale={s}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.15, 0.006]} />
        <meshStandardMaterial color="#f2ece0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[0.24, 0.15]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ PENGEMBANGAN: UU booklet, salary blocks
const Book: React.FC<{ t: number }> = ({ t }) => {
  const up = spring(t, T.aturan - 0.25, 0.9) * (1 - seg(t, T.gaji - 0.9, T.gaji - 0.1));
  if (up <= 0.001) return null;
  const cover = bookCoverTexture(FONTS);
  const left = bookLeftTexture(FONTS);
  const right = bookRightTexture(FONTS);
  const open = seg(t, T.uu + 0.25, T.uu + 1.25);
  const hl = seg(t, T.hormat - 0.15, T.hormat + 0.45);
  const Wp = 0.38, Hp = (Wp * 820) / 600;
  return (
    <group position={[-0.36, -0.9 + up * 0.9, 0.95]}>
      {/* wooden easel */}
      <mesh castShadow receiveShadow position={[0, 0.03, 0.05]}>
        <RoundedBoxGeo args={[0.9, 0.06, 0.26]} radius={0.015} segments={2} />
        <Phys kind="toyPlastic" color="#6b3f24" />
      </mesh>
      <group position={[0, 0.07, 0]} rotation={[-0.32, 0, 0]}>
        {/* back board + right page block */}
        <mesh castShadow receiveShadow position={[0, Hp / 2, -0.012]}>
          <RoundedBoxGeo args={[Wp * 2 + 0.04, Hp + 0.03, 0.02]} radius={0.008} segments={2} />
          <meshStandardMaterial color="#5e171b" roughness={0.75} />
        </mesh>
        <mesh position={[Wp / 2, Hp / 2, 0.004]}>
          <planeGeometry args={[Wp, Hp]} />
          <meshStandardMaterial map={right} roughness={0.9} />
        </mesh>
        {/* highlighter on "DENGAN HORMAT" */}
        {hl > 0 && (
          <mesh position={[Wp * (44 / 600) + (Wp * 0.84 * hl) / 2, Hp * (1 - 665 / 820), 0.006]}>
            <planeGeometry args={[Wp * 0.84 * hl, Hp * 0.1]} />
            <meshBasicMaterial color="#ffd54a" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        )}
        {/* left page under the cover */}
        <mesh position={[-Wp / 2, Hp / 2, 0.002]}>
          <planeGeometry args={[Wp, Hp]} />
          <meshStandardMaterial color="#efe6d2" roughness={0.9} />
        </mesh>
        {/* cover board swinging on the spine */}
        <group position={[0, 0, 0.012]} rotation={[0, -open * Math.PI * 0.98, 0]}>
          <mesh position={[Wp / 2, Hp / 2, 0]}>
            <boxGeometry args={[Wp + 0.01, Hp + 0.01, 0.008]} />
            <meshStandardMaterial color="#5e171b" roughness={0.75} />
          </mesh>
          <mesh position={[Wp / 2, Hp / 2, 0.0045]}>
            <planeGeometry args={[Wp, Hp]} />
            <meshStandardMaterial map={cover} roughness={0.7} />
          </mesh>
          <mesh position={[Wp / 2, Hp / 2, -0.0045]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[Wp, Hp]} />
            <meshStandardMaterial map={left} roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const Block: React.FC<{ pos: V3; color: string; label?: THREE.Texture; s?: number; gold?: boolean }> = ({ pos, color, label, s = 0.17, gold }) => (
  <group position={pos}>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={[s, s, s]} radius={0.02} segments={3} />
      {gold ? (
        <meshPhysicalMaterial color="#d6a23c" metalness={0.85} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.2} />
      ) : (
        <Phys kind="toyPlastic" color={color} />
      )}
    </mesh>
    {gold && (
      <>
        {/* embossed top panel + paper band: a toy gold bar */}
        <mesh castShadow position={[0, s / 2 + 0.006, 0]}>
          <RoundedBoxGeo args={[s * 0.72, 0.014, s * 0.72]} radius={0.005} segments={2} />
          <meshPhysicalMaterial color="#e8bc55" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[-s * 0.32, 0, 0]}>
          <boxGeometry args={[0.03, s + 0.004, s + 0.004]} />
          <meshStandardMaterial color="#f4ecdc" roughness={0.9} />
        </mesh>
      </>
    )}
    {label && (
      <mesh position={[0, 0, s / 2 + 0.002]}>
        <planeGeometry args={[s * 0.9, s * 0.9]} />
        <meshBasicMaterial map={label} transparent depthWrite={false} />
      </mesh>
    )}
  </group>
);

const SalaryBlocks: React.FC<{ t: number }> = ({ t }) => {
  const sink = seg(t, T.pasal7 - 0.5, T.pasal7 + 0.3);
  if (t < T.gaji - 0.1 || sink >= 1) return null;
  const s = 0.17;
  const one = digitTexture("×1", FONTS, "#f6efe2");
  const four = digitTexture("×4", FONTS, "#3b2708");
  const refK = spring(t, T.gaji, 0.6);
  const drops = [0, 1, 2, 3].map((i) => spring(t, T.empat + i * 0.2, 0.55));
  const y0 = -sink * 0.9;
  return (
    <group position={[0, y0, 0]}>
      <Block pos={[-0.14, s / 2 + (1 - refK) * 1.2, 1.0]} color="#3e6e78" label={one} />
      {drops.map((k, i) =>
        k > 0 ? <Block key={i} pos={[0.14, s / 2 + i * s + (1 - k) * 1.4, 1.0]} color="#e5a93c" gold label={i === 3 ? four : undefined} /> : null,
      )}
    </group>
  );
};

// ------------------------------------------------------------------ PENJELASAN: Pasal 7 props
const PopProp: React.FC<{ t: number; at: number; out: number; pos: V3; children: React.ReactNode }> = ({ t, at, out, pos, children }) => {
  const k = spring(t, at, 0.55) * (1 - seg(t, out, out + 0.5));
  if (k <= 0.001) return null;
  return (
    <group position={[pos[0], pos[1] + Math.sin((t - at) * 2.2) * 0.012, pos[2]]} scale={Math.max(0.001, k)} rotation={[0, Math.sin(t * 0.8 + pos[0] * 3) * 0.25, 0]}>
      {children}
    </group>
  );
};

const Pasal7Props: React.FC<{ t: number }> = ({ t }) => {
  const out = T.pasal8 + 0.2;
  return (
    <>
      {/* first-aid kit with a green cross (not the protected red cross) */}
      <PopProp t={t} at={T.kesehatan - 0.2} out={out} pos={[-0.58, 0, 1.0]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <RoundedBoxGeo args={[0.3, 0.2, 0.16]} radius={0.03} segments={3} />
          <Phys kind="toyPlastic" color="#f4f1ea" />
        </mesh>
        <mesh position={[0, 0.1, 0.082]}>
          <boxGeometry args={[0.1, 0.03, 0.005]} />
          <meshStandardMaterial color="#2e9a5a" />
        </mesh>
        <mesh position={[0, 0.1, 0.082]}>
          <boxGeometry args={[0.03, 0.1, 0.005]} />
          <meshStandardMaterial color="#2e9a5a" />
        </mesh>
        <mesh castShadow position={[0, 0.215, 0]}>
          <torusGeometry args={[0.05, 0.012, 8, 20, Math.PI]} />
          <Phys kind="toyPlastic" color="#2e9a5a" />
        </mesh>
      </PopProp>
      {/* water drop */}
      <PopProp t={t} at={T.air - 0.15} out={out} pos={[-0.22, 0, 1.05]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 24, 16]} />
          <meshPhysicalMaterial color="#4aa3df" roughness={0.1} clearcoat={1} transmission={0} />
        </mesh>
        <mesh castShadow position={[0, 0.2, 0]}>
          <coneGeometry args={[0.07, 0.13, 24]} />
          <meshPhysicalMaterial color="#4aa3df" roughness={0.1} clearcoat={1} />
        </mesh>
      </PopProp>
      {/* light bulb */}
      <PopProp t={t} at={T.listrik - 0.15} out={out} pos={[0.06, 0, 1.05]}>
        <mesh position={[0, 0.17, 0]}>
          <sphereGeometry args={[0.085, 24, 16]} />
          <meshStandardMaterial color="#fff2c0" emissive="#ffcf5a" emissiveIntensity={1.6} />
        </mesh>
        <mesh castShadow position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.09, 16]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.3} />
        </mesh>
      </PopProp>
      {/* toy telephone */}
      <PopProp t={t} at={T.telepon - 0.15} out={out} pos={[0.36, 0, 1.0]}>
        <mesh castShadow position={[0, 0.06, 0]}>
          <RoundedBoxGeo args={[0.24, 0.12, 0.18]} radius={0.04} segments={3} />
          <Phys kind="toyPlastic" color="#d95d39" />
        </mesh>
        <mesh castShadow position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.03, 0.18, 6, 12]} />
          <Phys kind="toyPlastic" color="#b8432a" />
        </mesh>
        <mesh position={[0, 0.121, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.025, 0.045, 20]} />
          <meshStandardMaterial color="#f4f1ea" side={THREE.DoubleSide} />
        </mesh>
      </PopProp>
    </>
  );
};

// ------------------------------------------------------------------ PAYOFF: question mark, balance scale
const QuestionMark: React.FC<{ t: number }> = ({ t }) => (
  <PopProp t={t} at={T.uuTidak} out={T.tapi - 0.2} pos={[0.82, 1.0, 0.3]}>
    <mesh castShadow position={[0, 0.2, 0]}>
      <torusGeometry args={[0.1, 0.035, 12, 28, Math.PI * 1.4]} />
      <Phys kind="clay" color="#ffc84a" />
    </mesh>
    <mesh castShadow position={[0.0, 0.05, 0]}>
      <capsuleGeometry args={[0.033, 0.06, 6, 12]} />
      <Phys kind="clay" color="#ffc84a" />
    </mesh>
    <mesh castShadow position={[0, -0.07, 0]}>
      <sphereGeometry args={[0.038, 16, 12]} />
      <Phys kind="clay" color="#ffc84a" />
    </mesh>
  </PopProp>
);

/** Flat label standing in a pan, facing the camera (no swing, no tape). */
const PanLabel: React.FC<{ text: string; k: number }> = ({ text, k }) => {
  const tex = panLabelTexture(text, FONTS);
  if (k <= 0.001) return null;
  const w = 0.42, h = (w * 200) / 720;
  return (
    <group position={[0, -0.225 + h / 2 + 0.012, 0.03]} scale={k}>
      <mesh castShadow>
        <boxGeometry args={[w + 0.014, h + 0.014, 0.008]} />
        <meshStandardMaterial color="#8a1f23" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.0045]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Balance: React.FC<{ t: number }> = ({ t }) => {
  const up = spring(t, T.tapi - 0.3, 0.9) * (1 - seg(t, T.menurutmu - 0.5, T.menurutmu + 0.2));
  if (up <= 0.001) return null;
  const level = seg(t, T.sama - 0.35, T.sama + 0.35);
  const wobble = Math.sin((t - T.tapi) * 3.1) * 0.04 * (1 - level);
  const beam = 0.2 * (1 - level) + wobble;
  const brass = <meshStandardMaterial color="#c9a14f" metalness={0.85} roughness={0.3} />;
  const L = 0.27;
  return (
    <group position={[-0.12, -1.1 + up * 1.1, 1.0]}>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.14, 0.17, 0.06, 28]} />
        <Phys kind="toyPlastic" color="#6b3f24" />
      </mesh>
      <mesh castShadow position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.56, 12]} />
        {brass}
      </mesh>
      <group position={[0, 0.6, 0]} rotation={[0, 0, beam]}>
        <mesh castShadow>
          <boxGeometry args={[L * 2 + 0.04, 0.025, 0.025]} />
          {brass}
        </mesh>
        {([-1, 1] as const).map((sd) => (
          <group key={sd} position={[sd * L, 0, 0]} rotation={[0, 0, -beam]}>
            {[-1, 1].map((k) => (
              <mesh key={k} position={[k * 0.06, -0.12, -0.04]} rotation={[0, 0, k * 0.4]}>
                <cylinderGeometry args={[0.003, 0.003, 0.26, 4]} />
                <meshStandardMaterial color="#d9ccb0" />
              </mesh>
            ))}
            <mesh castShadow position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.13, 0.1, 0.03, 28]} />
              {brass}
            </mesh>
            <PanLabel text={sd < 0 ? "MUNDUR" : "DIMAKZULKAN"} k={spring(t, sd < 0 ? T.tapi + 0.6 : W_DIMAK, 0.5)} />
          </group>
        ))}
      </group>
    </group>
  );
};
const W_DIMAK = T.mahfud + 1.6;

// ------------------------------------------------------------------ AUDIRA sign (flies in at "Ini AUDIRA")
const AudiraSign: React.FC<{ t: number }> = ({ t }) => {
  // hangs over the hook and KONTEKS, flies out for the close-ups, returns for the outro
  const k = t < T.jadi ? spring(t, T.ini - 0.1, 0.8) * (1 - seg(t, T.aturan - 0.4, T.aturan + 0.6)) : spring(t, T.jadi, 0.9);
  if (k <= 0.001) return null;
  const tex = signTexture(FONTS);
  const y = 1.96 + (1 - k) * 2.2 + Math.sin(t * 0.9) * 0.01;
  const pulse = 1 + 0.6 * Math.max(0, Math.sin((t - T.ikuti) * 6)) * (t > T.ikuti ? 1 : 0);
  return (
    <group position={[0.64, y + 0.06, -0.55]} rotation={[0, 0, Math.sin(t * 0.7) * 0.015]} scale={0.68}>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 2.2, 4]} />
          <meshStandardMaterial color="#d9ccb0" />
        </mesh>
      ))}
      <mesh castShadow>
        <RoundedBoxGeo args={[0.98, 0.28, 0.04]} radius={0.02} segments={2} />
        <meshStandardMaterial color="#3e2716" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[0.94, 0.25]} />
        <meshStandardMaterial map={tex} roughness={0.6} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.08 * pulse} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.44 + i * 0.11, -0.16, 0.03]}>
          <sphereGeometry args={[0.014, 10, 8]} />
          <meshStandardMaterial color={PAL.footlights} emissive={PAL.footlights} emissiveIntensity={1.6 * pulse} />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ hook: the cover tags peel away
const HookTags: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.hilang, T.hilang + 0.9);
  if (k >= 1) return null;
  // the lower tag sits in the caption band: it peels off before the first caption settles
  const lowK = seg(t, 0.02, 0.6);
  const up = (d: number) => k * (2.6 + d);
  return (
    <>
      <group position={[0, up(0), 0]} rotation={[0, 0, k * 0.4]}>
        <Tag id="p8" refLine="PASAL 8" main="RUMAH + MOBIL" pos={[-0.78, 1.0, -0.12]} rotY={0.12} tilt={0.05} seed={11} />
      </group>
      <group position={[0, up(0.3), 0]} rotation={[0, 0, -k * 0.3]}>
        <Tag id="pp59" refLine="PP 59/2013" main="DIKAWAL" pos={[0.74, 1.08, -0.6]} rotY={-0.14} tilt={-0.05} seed={12} />
      </group>
      <group position={[0, lowK * 2.8, 0]} rotation={[0, 0, lowK * 0.25]}>
        <Tag id="p6" refLine="PASAL 6" main="PENSIUN 100%" pos={[0.6, 0.22, 1.32]} rotY={-0.16} tilt={0.03} stake={0.04} seed={13} />
      </group>
    </>
  );
};

// ------------------------------------------------------------------ warm spot pool on a hero prop
const PoolSpot: React.FC<{ at: V3; k: number }> = ({ at, k }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(...at);
  if (k <= 0.001) return null;
  return (
    <>
      <primitive object={target} />
      <spotLight position={[at[0] - 0.6, 3.2, at[2] + 1.6]} target={target} angle={0.28} penumbra={0.75} intensity={22 * k} decay={2} color="#ffc98a" />
    </>
  );
};

// ------------------------------------------------------------------ the whole world
export const FilmWorld: React.FC<{ t: number }> = ({ t }) => {
  // wagon: the home set rolls off to the right wing for KONTEKS and back for the rest
  const wagon = seg(t, T.kamis - 0.1, T.kamis + 1.3) * (1 - seg(t, T.lalu, T.lalu + 1.4));
  const wx = wagon * 3.8;
  const { p, q } = cameraAt(t);
  const focus = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const wide = seg(p[2], 6.6, 7.6);
  const dim = seg(t, T.kata - 0.2, T.kata + 0.6) * (1 - seg(t, T.tapi - 0.3, T.tapi + 0.4));

  // car: on the wagon until it leaves, then drives in from the left wing at "kendaraan"
  const carIn = seg(t, T.kendaraan - 0.45, T.pengemudi + 0.15);
  const carOn = t < T.kamis + 1.4 || t >= T.kendaraan - 0.45;
  const carPos: V3 = t < T.kamis + 1.4 ? [-0.74 + wx, 0, -0.12] : [lerp(-3.4, -0.74, carIn), 0, lerp(0.35, -0.12, carIn)];
  const carYaw = t < T.kamis + 1.4 ? -0.42 : lerp(-0.1, -0.42, carIn);

  // guard: on the wagon at the start; walks back in from the right wing at "Pengamanan"
  const gA = T.pengamanan - 0.1, gB = T.pengamanan + 1.9;
  let guard: { pos: V3; heading: number; walking: boolean } | null = null;
  if (t < T.kamis + 1.4) guard = { pos: [0.4 + wx, 0, -0.22], heading: -0.15, walking: false };
  else if (t >= gA) {
    const k = clamp01((t - gA) / (gB - gA));
    const turn = seg(t, gB - 0.1, gB + 0.5);
    guard = { pos: [lerp(2.7, 0.4, k), 0, lerp(0.05, -0.22, k)], heading: lerp(-Math.PI / 2, -0.15, turn), walking: k < 1 };
  }

  const pool1 = win(t, T.aturan, T.gaji - 0.6, 0.6, 0.5);
  const pool2 = win(t, T.pasal8, T.perpres, 0.6, 0.6);
  const pools = Math.max(pool1, pool2);
  const offK = 1 - seg(t, T.tapi - 0.9, T.tapi - 0.3);
  const podK = offK * (1 - seg(t, T.gaji - 1.2, T.gaji - 0.6) * (1 - seg(t, T.pasal7 + 0.3, T.pasal7 + 0.9)));
  // pension envelope: on the wagon at the start; pops back at "besarnya" on the front right
  const penK = spring(t, T.besarnya, 0.6) * (1 - seg(t, T.pasal7 - 0.5, T.pasal7 + 0.2));
  const penSlide = seg(t, T.gaji - 0.5, T.gaji + 0.4);
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={0.35 * (1 - 0.55 * dim) * (1 - 0.4 * pools)} color="#ffe6cc" />
      <hemisphereLight args={["#bcd2ff", "#3a2414", 0.45 * (1 - 0.55 * dim)]} />
      <KeySpot />
      <PoolSpot at={[-0.36, 0.35, 0.95]} k={pool1} />
      <PoolSpot at={[0, 0.3, -1.0]} k={pool2} />
      <directionalLight position={[3, 3.5, -4]} intensity={1.4} color={PAL.rimLight} />
      <pointLight position={[2.2, 1.8, 2.2]} intensity={2.0 * (1 - 0.5 * dim)} color="#ffd9b0" distance={8} decay={2} />
      <pointLight position={[0, 0.25, 1.8]} intensity={2.4} color={PAL.footlights} distance={3.2} decay={2} />
      {dim > 0 && <pointLight position={[0, 2.2, 1.6]} intensity={5 * dim} color="#fff1d6" distance={4} decay={2} />}

      <Stage />
      {wide > 0.01 && (
        <group visible={wide > 0.01}>
          <Audience />
          <Foreground />
        </group>
      )}

      <HollowHouse t={t} x={wx} />
      {podK > 0.001 && (
        <group scale={podK} position={[0.88 + wx, 0, -0.42]}>
          <Podium pos={[0, 0, 0]} rotY={-0.35} />
        </group>
      )}
      {carOn && offK > 0.001 && (
        <group scale={offK} position={carPos}>
          <Car pos={[0, 0, 0]} yaw={carYaw} />
        </group>
      )}
      {guard && offK > 0.001 && (
        <group scale={offK} position={guard.pos}>
          <GuardFig t={t} pos={[0, 0, 0]} heading={guard.heading} walking={guard.walking} />
        </group>
      )}
      {t < 0.62 && (
        <group scale={1.1} position={[-0.2 + wx, seg(t, 0.02, 0.6) * 2.6, 0.62]} rotation={[0, 0, seg(t, 0.02, 0.6) * -0.3]}>
          <Pension pos={[0, 0, 0]} rotY={0.1} />
        </group>
      )}
      {t >= T.besarnya && penK > 0.001 && (
        <group scale={penK} position={[lerp(0.3, 1.25, penSlide), 0, lerp(1.08, 0.8, penSlide)]}>
          <Pension pos={[0, 0, 0]} rotY={-0.35} />
        </group>
      )}

      <HookTags t={t} />
      <AudiraSign t={t} />

      {/* KONTEKS */}
      <FacadeFlat t={t} />
      <Envoy t={t} />
      <Letter t={t} />
      <Stamp t={t} />

      {/* PENGEMBANGAN */}
      <Book t={t} />
      <SalaryBlocks t={t} />
      <DropTag t={t} id="p10" refLine="PASAL 10" lines={["DIBAYAR", "SAMPAI WAFAT"]} pos={[0.3, 0.8, 0.72]} a={T.pensiunIni} b={T.pasal7 - 0.3} w={0.7} tilt={0.03} seed={21} />

      {/* PENJELASAN */}
      <Pasal7Props t={t} />
      <DropTag t={t} id="p7" refLine="PASAL 7" lines={["KESEHATAN +", "AIR, LISTRIK, TELEPON"]} pos={[-0.12, 0.74, 0.72]} a={T.pasal7 + 0.25} b={T.pasal8 + 0.1} w={0.8} tilt={-0.03} seed={22} />
      <DropTag t={t} id="p8f" refLine="PASAL 8" lines={["RUMAH + PERLENGKAPAN", "MOBIL + PENGEMUDI"]} pos={[-0.36, 1.05, 0.1]} a={T.pasal8 + 0.2} b={T.pengamanan - 0.2} w={0.8} rotY={0.12} tilt={0.04} seed={23} />
      <DropTag t={t} id="pr1" refLine="PERPRES 52/2014" lines={["RUMAH", "HANYA 1 KALI"]} pos={[0.8, 1.12, -0.55]} a={T.perpres} b={T.pajak - 0.45} w={0.74} rotY={-0.14} tilt={-0.04} seed={24} />
      <DropTag t={t} id="pr2" refLine="PERPRES 52/2014" lines={["PAJAK", "DITANGGUNG NEGARA"]} pos={[0.8, 1.12, -0.55]} a={T.pajak - 0.2} b={T.pengamanan - 0.2} w={0.74} rotY={-0.14} tilt={0.03} seed={25} />

      {/* PAYOFF */}
      <DropTag t={t} id="pp59f" refLine="PP 59/2013" lines={["KAWALAN", "SEUMUR HIDUP"]} pos={[0.82, 1.12, -0.55]} a={T.pp} b={T.kata - 0.2} w={0.74} rotY={-0.14} tilt={-0.04} seed={26} />
      <DropTag t={t} id="hormat" refLine="KATA KUNCI" lines={["BERHENTI", "DENGAN HORMAT"]} pos={[0, 1.2, 0.3]} a={T.kata + 0.1} b={T.tapi - 0.1} w={1.0} seed={27} paper="#f0d79a" />
      <QuestionMark t={t} />
      <Balance t={t} />

      {/* OUTRO */}
      <DropTag t={t} id="adil" refLine="MENURUTMU?" lines={["ADIL ATAU", "TERLALU MAHAL?"]} pos={[0, 1.18, 0.95]} a={T.menurutmu} b={99} w={1.3} tilt={-0.025} seed={28} />

      <Finish frame={Math.round(t * 60)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao focus={focus} aperture={0.004 * (0.5 + 0.5 * wide)} maxBlur={0.012} />
    </>
  );
};

