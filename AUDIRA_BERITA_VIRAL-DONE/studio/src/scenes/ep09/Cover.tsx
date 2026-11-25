// EP09 cover (TOYDIORAMA): "MUNDUR, MASIH DAPAT PENSIUN?"
// A theatrical miniature stage holding the retirement package of a former Vice President, with
// nobody playing him: a toy pension house (UU 7/1978 Pasal 8), a dark state sedan with its toy
// driver (Pasal 8), a pension envelope stamped "100%" on a stack of toy notes (Pasal 6), and one
// Paspampres guard (PP 59/2013) standing beside an EMPTY podium signed "MANTAN WAPRES".
// No real person is depicted. Facts: EP09_HAK_PENSIUN_WAPRES_MUNDUR/research/SOURCE_REGISTER.md.
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadLilita } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadMono } from "@remotion/google-fonts/DMMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { LEG_LENGTH, ToyPerson, poseAt, type Pose } from "../../core/polish/Person.tsx";
import { prng } from "../../core/materials/textures.ts";
import { TOYDIORAMA_PALETTE as PAL } from "../../kits/toydiorama/lib/palette.ts";
import {
  backdropTexture,
  bandTexture,
  envelopeTexture,
  noteTexture,
  plaqueTexture,
  podiumSignTexture,
  tagTexture,
  type Fonts,
} from "./coverTextures.ts";

const lilita = loadLilita("normal", { weights: ["400"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500"], subsets: ["latin"] });
export const DISPLAY = lilita.fontFamily;
export const MONO = mono.fontFamily;
export const FONTS: Fonts = { display: DISPLAY, mono: MONO };

export const BG = "#0e141d";
type V3 = [number, number, number];

// ---------- camera (also saved to style/cover.json) ----------
export const COVER_CAMERA = { position: [0, 1.6, 8.3] as V3, target: [0, 0.66, 0] as V3, fov: 30 };
const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...COVER_CAMERA.position);
    camera.lookAt(...COVER_CAMERA.target);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// ---------- shared bits ----------
export const Phys: React.FC<{ kind: keyof typeof POLISH; color: string; map?: THREE.Texture; bump?: THREE.Texture; bumpScale?: number }> = ({
  kind,
  color,
  map,
  bump,
  bumpScale = 0.3,
}) => <meshPhysicalMaterial {...POLISH[kind]} color={color} map={map} bumpMap={bump} bumpScale={bump ? bumpScale : 0} />;

export const Washi: React.FC<{ pos: V3; rot?: number; w?: number; color?: string }> = ({ pos, rot = 0, w = 0.22, color = "#e9c86f" }) => (
  <mesh position={pos} rotation={[0, 0, rot]}>
    <boxGeometry args={[w, 0.075, 0.004]} />
    <meshStandardMaterial color={color} transparent opacity={0.82} roughness={0.75} />
  </mesh>
);

/** Kraft tag on a beech dowel stuck in the stage floor (or pinned high when `stake` is false). */
export const Tag: React.FC<{ id: string; refLine: string; main: string; pos: V3; rotY?: number; tilt?: number; stake?: number; seed: number }> = ({
  id,
  refLine,
  main,
  pos,
  rotY = 0,
  tilt = 0,
  stake = 0,
  seed,
}) => {
  const tex = tagTexture(id, refLine, main, FONTS, seed);
  const W = 0.8, H = W * (360 / 720);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {stake > 0 && (
        <mesh castShadow position={[0, -stake / 2 - H / 2 + 0.04, -0.012]}>
          <cylinderGeometry args={[0.014, 0.014, stake, 10]} />
          <meshStandardMaterial color={PAL.stageDowel} roughness={0.7} />
        </mesh>
      )}
      <group rotation={[0, 0, tilt]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[W, H, 0.006]} />
          <meshStandardMaterial color="#cfa970" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0, 0.0035]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={tex} roughness={0.92} />
        </mesh>
        <Washi pos={[-W / 2 + 0.06, H / 2 - 0.01, 0.006]} rot={0.6} w={0.2} />
        <Washi pos={[W / 2 - 0.06, H / 2 - 0.01, 0.006]} rot={-0.55} w={0.2} color="#9fc9c2" />
      </group>
    </group>
  );
};

// ---------- stage ----------
export const Stage: React.FC = () => {
  const grain = useSurfaceGrain(41, 0.35, 6);
  const backdrop = backdropTexture();
  const planks = Array.from({ length: 11 }, (_, i) => i - 5);
  return (
    <group>
      {/* backdrop flat */}
      <mesh position={[0, 2.0, -2.6]}>
        <planeGeometry args={[5.2, 7.8]} />
        <meshStandardMaterial map={backdrop} roughness={0.95} emissive="#ffffff" emissiveMap={backdrop} emissiveIntensity={0.18} />
      </mesh>
      {/* floor planks */}
      {planks.map((i) => (
        <mesh key={i} receiveShadow position={[i * 0.42, -0.06, -0.3]}>
          <RoundedBoxGeo args={[0.41, 0.12, 4.7]} radius={0.015} segments={2} />
          <meshPhysicalMaterial
            color={i % 2 === 0 ? PAL.stageFloor : PAL.stageFloorLight}
            roughness={0.62}
            roughnessMap={grain}
            bumpMap={grain}
            bumpScale={0.4}
            clearcoat={0.2}
            clearcoatRoughness={0.5}
          />
        </mesh>
      ))}
      {/* apron fascia */}
      <mesh position={[0, -0.36, 2.0]} receiveShadow>
        <RoundedBoxGeo args={[4.8, 0.6, 0.1]} radius={0.02} segments={2} />
        <Phys kind="fabric" color="#3b0f16" />
      </mesh>
      <mesh position={[0, -0.09, 2.056]}>
        <boxGeometry args={[4.8, 0.03, 0.01]} />
        <meshStandardMaterial color="#c9a14f" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* footlights */}
      {[-1.65, -1.1, -0.55, 0, 0.55, 1.1, 1.65].map((x) => (
        <group key={x} position={[x, 0, 1.82]}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.06, 16]} />
            <meshStandardMaterial color="#2b1d13" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color={PAL.footlights} emissive={PAL.footlights} emissiveIntensity={2.2} />
          </mesh>
        </group>
      ))}
      {/* velvet curtains with folds */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.7, 0, -0.2]}>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} castShadow receiveShadow position={[side * k * 0.12, 1.9, (k % 2) * 0.05]}>
              <cylinderGeometry args={[0.085, 0.095, 3.9, 18]} />
              <Phys kind="fabric" color={k % 2 ? "#5d1520" : PAL.curtainVelvet} />
            </mesh>
          ))}
        </group>
      ))}
      {/* cardboard hills + clay clouds on dowels */}
      <mesh position={[-0.9, 0.05, -2.2]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.04, 40, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#3d6b52" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, 0.0, -2.0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.0, 40, 0, Math.PI]} />
        <meshStandardMaterial color="#4f7f5c" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {[
        [-0.95, 1.95, -1.9, 1],
        [1.0, 2.25, -2.0, 0.8],
      ].map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 1.8, 6]} />
            <meshStandardMaterial color="#8a8a8a" metalness={0.6} roughness={0.4} />
          </mesh>
          {[
            [0, 0, 0.26],
            [0.26, -0.05, 0.2],
            [-0.24, -0.06, 0.18],
            [0.1, 0.12, 0.17],
          ].map(([cx, cy, r], k) => (
            <mesh key={k} position={[cx, cy, 0]} castShadow>
              <sphereGeometry args={[r, 24, 16]} />
              <Phys kind="clay" color={PAL.flatCloud} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// ---------- pension house ----------
export const House: React.FC<{ pos: V3 }> = ({ pos }) => {
  const grain = useSurfaceGrain(52, 0.3, 3);
  const W = 1.34, Hh = 0.74, D = 0.82;
  const glow = "#ffc46b";
  return (
    <group position={pos}>
      {/* felt lawn base */}
      <mesh receiveShadow castShadow position={[0, 0.03, 0.1]}>
        <RoundedBoxGeo args={[2.0, 0.06, 1.35]} radius={0.025} segments={3} />
        <Phys kind="fabric" color="#6f9a4d" bump={grain} bumpScale={0.8} />
      </mesh>
      {/* walls */}
      <mesh castShadow receiveShadow position={[0, 0.06 + Hh / 2, 0]}>
        <RoundedBoxGeo args={[W, Hh, D]} radius={0.03} segments={3} />
        <Phys kind="clay" color="#f1e4cb" bump={grain} bumpScale={0.4} />
      </mesh>
      {/* plinth stripe */}
      <mesh position={[0, 0.1, 0]}>
        <RoundedBoxGeo args={[W + 0.02, 0.08, D + 0.02]} radius={0.02} segments={2} />
        <Phys kind="clay" color="#8d6e57" />
      </mesh>
      {/* hip roof (terracotta) */}
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
      {/* front windows with warm interior glow */}
      {[-0.42, 0.42].map((x) => (
        <group key={x} position={[x, 0.06 + Hh * 0.55, D / 2 + 0.004]}>
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
          {/* shutters */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.2, 0, 0.006]}>
              <RoundedBoxGeo args={[0.09, 0.3, 0.016]} radius={0.006} segments={2} />
              <Phys kind="toyPlastic" color="#3e6e78" />
            </mesh>
          ))}
        </group>
      ))}
      {/* door + porch */}
      <mesh position={[0, 0.06 + 0.24, D / 2 + 0.01]}>
        <RoundedBoxGeo args={[0.24, 0.44, 0.03]} radius={0.01} segments={2} />
        <Phys kind="toyPlastic" color="#6b3f24" bump={grain} />
      </mesh>
      <mesh position={[0.07, 0.06 + 0.24, D / 2 + 0.03]}>
        <sphereGeometry args={[0.014, 10, 8]} />
        <meshStandardMaterial color="#d9b25a" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.06 + 0.5, D / 2 + 0.012]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.2} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.085, D / 2 + 0.16]}>
        <RoundedBoxGeo args={[0.56, 0.05, 0.3]} radius={0.015} segments={2} />
        <Phys kind="stone" color="#cbbfae" />
      </mesh>
      {/* furnishing hint: tiny sofa + lamp seen on the porch */}
      <group position={[-0.42, 0.11, D / 2 + 0.17]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[0.24, 0.07, 0.1]} radius={0.025} segments={3} />
          <Phys kind="fabric" color="#c0883a" />
        </mesh>
        <mesh castShadow position={[0, 0.06, -0.04]}>
          <RoundedBoxGeo args={[0.24, 0.08, 0.035]} radius={0.015} segments={3} />
          <Phys kind="fabric" color="#c0883a" />
        </mesh>
      </group>
      {/* potted shrubs */}
      {[-0.82, 0.82].map((x, i) => (
        <group key={x} position={[x, 0.06, D / 2 + 0.05]}>
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
      <pointLight position={[0, 0.5, D / 2 + 0.35]} color={glow} intensity={0.6} distance={1.4} decay={2} />
    </group>
  );
};

// ---------- state sedan with toy driver ----------
export const Car: React.FC<{ pos: V3; yaw: number }> = ({ pos, yaw }) => {
  const black = { ...POLISH.toyPlastic, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 };
  const chrome = <meshStandardMaterial color="#d9dde2" metalness={1} roughness={0.18} />;
  const L = 0.98, Wd = 0.44;
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      {/* body */}
      <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
        <RoundedBoxGeo args={[L, 0.19, Wd]} radius={0.07} segments={5} />
        <meshPhysicalMaterial {...black} color="#15181d" />
      </mesh>
      {/* tinted glasshouse with roof */}
      <mesh position={[-0.05, 0.33, 0]}>
        <RoundedBoxGeo args={[0.52, 0.17, Wd - 0.05]} radius={0.06} segments={5} />
        <meshPhysicalMaterial color="#2a3b4c" roughness={0.05} metalness={0.1} clearcoat={1} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <mesh castShadow position={[-0.06, 0.415, 0]}>
        <RoundedBoxGeo args={[0.42, 0.03, Wd - 0.06]} radius={0.014} segments={3} />
        <meshPhysicalMaterial {...black} color="#15181d" />
      </mesh>
      {/* pillars */}
      {[-0.3, 0.2].map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.33, s * (Wd / 2 - 0.035)]} rotation={[0, 0, x > 0 ? 0.55 : -0.4]}>
            <boxGeometry args={[0.025, 0.17, 0.02]} />
            <meshPhysicalMaterial {...black} color="#15181d" />
          </mesh>
        )),
      )}
      {/* toy driver (right-hand seat faces camera) with peci */}
      <group position={[0.06, 0.29, 0.09]}>
        <mesh>
          <RoundedBoxGeo args={[0.1, 0.09, 0.12]} radius={0.03} segments={3} />
          <Phys kind="fabric" color="#f3f0e8" />
        </mesh>
        <mesh position={[0, 0.095, 0]}>
          <sphereGeometry args={[0.052, 20, 14]} />
          <Phys kind="toySkin" color="#d6a27a" />
        </mesh>
        <mesh position={[0, 0.138, 0]}>
          <cylinderGeometry args={[0.044, 0.048, 0.036, 20]} />
          <Phys kind="fabric" color="#111111" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.046, 0.1, s * 0.018]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshPhysicalMaterial {...POLISH.glossyEye} color="#120d0a" />
          </mesh>
        ))}
        {/* steering wheel */}
        <mesh position={[0.1, 0.06, 0]} rotation={[0, Math.PI / 2, 0.0]}>
          <torusGeometry args={[0.035, 0.007, 8, 20]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
      {/* wheels */}
      {[-0.3, 0.3].map((x) =>
        [-1, 1].map((s) => (
          <group key={`${x}${s}`} position={[x, 0.085, s * (Wd / 2 - 0.02)]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.085, 0.085, 0.07, 24]} />
              <meshStandardMaterial color="#1b1b1b" roughness={0.85} />
            </mesh>
            <mesh position={[0, s * -0.037, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.004, 20]} />
              {chrome}
            </mesh>
          </group>
        )),
      )}
      {/* grille, lights */}
      <mesh position={[L / 2 + 0.002, 0.17, 0]}>
        <boxGeometry args={[0.012, 0.06, 0.22]} />
        {chrome}
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[L / 2 - 0.004, 0.2, s * 0.16]}>
            <sphereGeometry args={[0.028, 14, 10]} />
            <meshStandardMaterial color="#fff6dc" emissive="#fff1c8" emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[-L / 2 + 0.004, 0.2, s * 0.16]}>
            <boxGeometry args={[0.012, 0.03, 0.06]} />
            <meshStandardMaterial color="#b3121c" emissive="#b3121c" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      {/* chrome side strip */}
      <mesh position={[0, 0.2, Wd / 2 + 0.002]}>
        <boxGeometry args={[L - 0.18, 0.01, 0.004]} />
        {chrome}
      </mesh>
      {/* red-white pennant on the front fender */}
      <group position={[L / 2 - 0.1, 0.27, 0.15]}>
        <mesh>
          <cylinderGeometry args={[0.004, 0.004, 0.16, 6]} />
          {chrome}
        </mesh>
        <mesh position={[-0.045, 0.06, 0]}>
          <boxGeometry args={[0.08, 0.025, 0.003]} />
          <meshStandardMaterial color="#d32f2f" roughness={0.8} />
        </mesh>
        <mesh position={[-0.045, 0.035, 0]}>
          <boxGeometry args={[0.08, 0.025, 0.003]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- Paspampres guard (generic toy, dark suit, sunglasses, earpiece) ----------
export const GUARD_SCALE = 0.72;
export const guardPose = (): Pose => {
  const p = poseAt("stand", 0, 4);
  return {
    ...p,
    body: [0, 0, 0],
    spine: [0, 0, 0],
    head: [0, -0.12, 0],
    ls: [-0.45, 0, 0.1],
    le: -1.15,
    rs: [-0.45, 0, -0.1],
    re: -1.15,
  };
};
export const Guard: React.FC<{ pos: V3; heading: number }> = ({ pos, heading }) => {
  const suit = "#1c2230";
  const look = useMemo(
    () => ({ skin: "#b47a52", hair: "#1b1411", top: suit, bottom: suit, outfit: "casual" as const, hairStyle: 0 as const, build: 1.1, height: 1 }),
    [],
  );
  const headY = LEG_LENGTH + 0.4;
  return (
    <group position={pos} rotation={[0, heading, 0]}>
      <ToyPerson f={0} seed={4} look={look} poseOverride={guardPose()} scale={GUARD_SCALE} />
      <group scale={GUARD_SCALE}>
        <group position={[0, 0, 0]}>
          {/* white shirt V + dark tie on the chest */}
          <mesh position={[0, LEG_LENGTH + 0.235, 0.083]} rotation={[-0.12, 0, Math.PI]}>
            <circleGeometry args={[0.045, 3]} />
            <meshStandardMaterial color="#f4f1ea" roughness={0.7} />
          </mesh>
          <mesh position={[0, LEG_LENGTH + 0.19, 0.088]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.018, 0.09, 0.006]} />
            <meshStandardMaterial color="#7a1820" roughness={0.6} />
          </mesh>
          {/* sunglasses + earpiece follow the head turn */}
          <group position={[0, headY, 0]} rotation={[0, -0.12, 0]}>
            <mesh position={[0, 0.014, 0.112]}>
              <RoundedBoxGeo args={[0.15, 0.04, 0.02]} radius={0.012} segments={3} />
              <meshPhysicalMaterial color="#0b0d10" roughness={0.08} clearcoat={1} metalness={0.3} />
            </mesh>
            <mesh position={[0.124, -0.01, 0.01]}>
              <sphereGeometry args={[0.014, 10, 8]} />
              <meshStandardMaterial color="#d8d8d0" roughness={0.4} />
            </mesh>
            <mesh position={[0.118, -0.075, -0.02]} rotation={[0.25, 0, 0.08]}>
              <cylinderGeometry args={[0.0035, 0.0035, 0.13, 6]} />
              <meshStandardMaterial color="#e8e8e0" roughness={0.4} />
            </mesh>
          </group>
          {/* black shoes over the default toy sneakers */}
          {[1, -1].map((s) => (
            <mesh key={s} castShadow position={[s * 0.068 * 1.1, 0.024, 0.036]}>
              <RoundedBoxGeo args={[0.082, 0.05, 0.155]} radius={0.02} segments={3} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.25} color="#0d0d0f" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// ---------- empty podium ----------
export const Podium: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => {
  const grain = useSurfaceGrain(77, 0.3, 2);
  const sign = podiumSignTexture(FONTS);
  const plaque = plaqueTexture(FONTS);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <RoundedBoxGeo args={[0.5, 0.06, 0.34]} radius={0.015} segments={2} />
        <Phys kind="toyPlastic" color="#4a2c1a" bump={grain} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.33, 0]}>
        <RoundedBoxGeo args={[0.4, 0.56, 0.26]} radius={0.025} segments={3} />
        <Phys kind="toyPlastic" color="#7a4a2a" bump={grain} />
      </mesh>
      <mesh castShadow position={[0, 0.63, -0.01]} rotation={[0.3, 0, 0]}>
        <RoundedBoxGeo args={[0.46, 0.04, 0.32]} radius={0.012} segments={2} />
        <Phys kind="toyPlastic" color="#5a341d" bump={grain} />
      </mesh>
      {/* paper sign */}
      <mesh position={[0, 0.34, 0.133]}>
        <planeGeometry args={[0.38, 0.2]} />
        <meshStandardMaterial map={sign} roughness={0.9} />
      </mesh>
      <Washi pos={[-0.17, 0.42, 0.139]} rot={0.6} w={0.1} />
      <Washi pos={[0.17, 0.42, 0.139]} rot={-0.6} w={0.1} color="#9fc9c2" />
      {/* brass maker's plate: the one AUDIRA brand mark in the scene */}
      <mesh position={[0, 0.51, 0.131]}>
        <RoundedBoxGeo args={[0.38, 0.1, 0.012]} radius={0.006} segments={2} />
        <meshStandardMaterial color="#b88d3e" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.51, 0.1375]}>
        <planeGeometry args={[0.365, 0.09]} />
        <meshStandardMaterial map={plaque} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* gooseneck mic, nobody behind it */}
      <mesh position={[0.08, 0.72, 0.0]} rotation={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.2, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.08, 0.8, 0.06]}>
        <sphereGeometry args={[0.022, 14, 10]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
};

// ---------- pension envelope on toy notes ----------
export const Pension: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => {
  const env = envelopeTexture(FONTS);
  const note = noteTexture(FONTS);
  const band = bandTexture(FONTS);
  const r = prng(901);
  const bundles: { p: V3; ry: number }[] = [
    { p: [-0.02, 0, 0], ry: 0.05 },
    { p: [0.03, 0.09, 0.01], ry: -0.08 },
    { p: [0.27, 0, 0.06], ry: 0.25 },
  ];
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {bundles.map((b, i) => (
        <group key={i} position={[b.p[0], b.p[1] + 0.045, b.p[2]]} rotation={[0, b.ry + (r() - 0.5) * 0.05, 0]}>
          <mesh castShadow receiveShadow>
            <RoundedBoxGeo args={[0.3, 0.09, 0.15]} radius={0.01} segments={2} />
            <meshStandardMaterial color="#d8606a" roughness={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0455, 0]}>
            <planeGeometry args={[0.29, 0.14]} />
            <meshStandardMaterial map={note} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.07, 0.094, 0.154]} />
            <meshStandardMaterial map={band} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* envelope leaning on the stack */}
      <group position={[0.02, 0.2, 0.13]} rotation={[-0.22, 0, 0.04]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.333, 0.008]} />
          <meshStandardMaterial color="#e7d8b8" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.0045]}>
          <planeGeometry args={[0.5, 0.333]} />
          <meshStandardMaterial map={env} roughness={0.88} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- blurred foreground props below the apron ----------
export const Foreground: React.FC = () => (
  <group>
    {/* theatre spot can, bottom left */}
    <group position={[-0.95, 0.12, 2.75]} rotation={[0.5, 0.5, 0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.42, 24]} />
        <meshStandardMaterial color="#1f1f22" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.215, 0]}>
        <circleGeometry args={[0.15, 24]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffc85a" emissiveIntensity={1.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
    {/* rope coil, bottom right */}
    <group position={[1.05, 0.02, 2.6]} rotation={[-1.35, 0, 0]}>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, 0, k * 0.035]}>
          <torusGeometry args={[0.2 - k * 0.025, 0.03, 10, 40]} />
          <Phys kind="fabric" color="#c8a46a" />
        </mesh>
      ))}
    </group>
  </group>
);

// ---------- key light with a target that lives in the scene ----------
export const KeySpot: React.FC = () => {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.4, -0.3);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={[-2.6, 4.6, 4.2]}
        target={target}
        angle={0.55}
        penumbra={0.6}
        intensity={60}
        decay={2}
        color={PAL.keyLight}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
      />
    </>
  );
};

// ---------- toy audience seen from behind (blurred foreground, below the apron) ----------
export const AUDIENCE: { x: number; z: number; seed: number; skin: string; hair: string; top: string }[] = [
  { x: -1.25, z: 3.3, seed: 21, skin: "#d09a6c", hair: "#1b1411", top: "#2c4d55" },
  { x: -0.55, z: 3.5, seed: 22, skin: "#e6b28c", hair: "#432a1b", top: "#7a2a22" },
  { x: 0.62, z: 3.45, seed: 23, skin: "#91603f", hair: "#1b1411", top: "#8a6a2c" },
  { x: 1.35, z: 3.25, seed: 24, skin: "#b47a52", hair: "#2a1c14", top: "#33553d" },
];
export const Audience: React.FC = () => (
  <group position={[0, -1.12, 0]}>
    {AUDIENCE.map((a) => (
      <ToyPerson
        key={a.seed}
        f={0}
        seed={a.seed}
        pose="stand"
        position={[a.x, 0, a.z]}
        heading={Math.PI}
        scale={1.05}
        look={{ skin: a.skin, hair: a.hair, top: a.top, bottom: "#2b2b30", outfit: "casual", hairStyle: a.seed % 2 ? 1 : 0, height: 1, build: 1 }}
      />
    ))}
  </group>
);

// ---------- scene ----------
const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig />
    <ambientLight intensity={0.35} color="#ffe6cc" />
    <hemisphereLight args={["#bcd2ff", "#3a2414", 0.45]} />
    {/* warm key spot from front-left */}
    <KeySpot />
    {/* cool rim from behind right */}
    <directionalLight position={[3, 3.5, -4]} intensity={1.4} color={PAL.rimLight} />
    {/* fill + footlight wash */}
    <pointLight position={[2.2, 1.8, 2.2]} intensity={2.0} color="#ffd9b0" distance={8} decay={2} />
    <pointLight position={[0, 0.25, 1.8]} intensity={2.4} color={PAL.footlights} distance={3.2} decay={2} />
    <Stage />
    <House pos={[0.0, 0, -1.05]} />
    <Car pos={[-0.74, 0, -0.12]} yaw={-0.42} />
    <Guard pos={[0.4, 0, -0.22]} heading={-0.15} />
    <Podium pos={[0.88, 0, -0.42]} rotY={-0.35} />
    <group scale={1.1} position={[-0.2, 0, 0.62]}>
      <Pension pos={[0, 0, 0]} rotY={0.1} />
    </group>
    <Tag id="p8" refLine="PASAL 8" main="RUMAH + MOBIL" pos={[-0.78, 1.0, -0.12]} rotY={0.12} tilt={0.05} seed={11} />
    <Tag id="pp59" refLine="PP 59/2013" main="DIKAWAL" pos={[0.74, 1.08, -0.6]} rotY={-0.14} tilt={-0.05} seed={12} />
    <Tag id="p6" refLine="PASAL 6" main="PENSIUN 100%" pos={[0.6, 0.22, 1.32]} rotY={-0.16} tilt={0.03} stake={0.04} seed={13} />
    <Audience />
    <Foreground />
    <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao focus={8.3} aperture={0.004} maxBlur={0.012} />
  </>
);

// ---------- HTML overlay ----------
export const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(10,12,20,0.88) 0%, rgba(10,12,20,0.72) 20%, rgba(10,12,20,0.25) 33%, rgba(10,12,20,0) 40%, rgba(10,12,20,0) 82%, rgba(10,8,6,0.45) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: 34,
          letterSpacing: 4,
          color: "#1d130b",
          background: "#e9c86f",
          padding: "8px 22px",
          transform: "rotate(-1.5deg)",
        }}
      >
        UU NO. 7 TAHUN 1978
      </div>
      <div style={{ fontFamily: DISPLAY, color: "#fbf3e4", lineHeight: 0.92, marginTop: 22, textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.6)" }}>
        <div style={{ fontSize: 150 }}>MUNDUR,</div>
        <div style={{ fontSize: 112 }}>MASIH DAPAT</div>
        <div style={{ fontSize: 150, color: "#ffc84a" }}>PENSIUN?</div>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  // canvas textures need the web fonts first
  const [handle] = useState(() => delayRender("EP09 cover fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([lilita.waitUntilDone(), mono.waitUntilDone()]).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 60 }}>
          <Scene f={f} />
        </ThreeCanvas>
      )}
      <Overlay />
    </AbsoluteFill>
  );
};
