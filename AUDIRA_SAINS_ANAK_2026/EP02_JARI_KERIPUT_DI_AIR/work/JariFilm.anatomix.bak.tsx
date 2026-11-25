// EP02 "Kenapa Jari Keriput Saat Lama di Air" — ANATOMIX (Remotion + R3F), 9:16, 88 s.
// Multi-scene director: 8 VO beats, each with its own subject (hand in water → skin myth → 1935 nerve test →
// tissue mechanism → time/place → tire & marble grip test → same-pattern + clinic → golden outro).
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene, type FilmShot } from "../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import words from "../../../public/audio/vo-words.json";
import { CUTS, TOTAL_SECONDS, lerp, seg, sceneAt, prng } from "./timing";
import { SKIN, Lab, Water, Drops, Plinth, LabSign, Fingertip, SkinSlab, TissueSection, WetRoad, Spray, Bowl, MatchRing } from "./parts";
import { Hud } from "./Hud";

export const JARI_SECONDS = TOTAL_SECONDS;

// GLB orientation (measured from the accessors): rigged left hand, mesh x -0.09..0.08, y 0..0.05 (palm thickness),
// z -0.021 (wrist) .. 0.195 (middle fingertip). AssetModel `size` measures the skinned box wrong (hand rendered tiny
// in probe v1), so the hand is scaled by hand here: wrist at the origin, fingers up (+z -> +y).
const HAND_LEN = 0.216;
const HAND_ROT: [number, number, number] = [-Math.PI / 2, 0, 0];
const TIRE_ROT: [number, number, number] = [0, 0, 0];

const Hand: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; size?: number; glow?: number; glowColor?: string }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = 3,
  glow = 0,
  glowColor = P.holo,
}) => {
  const k = size / HAND_LEN;
  // Same skin recipe as the procedural fingertip: no vertex colours (they read as orange plastic), sheen + soft coat.
  const skin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: SKIN,
        roughness: 0.5,
        metalness: 0,
        sheen: 0.8,
        sheenRoughness: 0.45,
        sheenColor: new THREE.Color("#FFD9CB"),
        clearcoat: 0.45,
        clearcoatRoughness: 0.3,
        emissive: new THREE.Color(glowColor),
        emissiveIntensity: 0,
      }),
    [glowColor],
  );
  skin.emissiveIntensity = glow * 0.3;
  return (
    <group position={position} rotation={rotation}>
      <group rotation={HAND_ROT}>
        <AssetModel src={staticFile("models/ep02/base-hand-e3398a.glb")} scale={k} position={[0.004 * k, -0.025 * k, 0.021 * k]} material={skin} smooth />
      </group>
    </group>
  );
};

const pose = (pos: [number, number, number], target: [number, number, number], fov = 34): FilmShot => ({ pos, target, fov });

/** Camera for second t: every beat keeps moving (no parked frames). */
const cameraAt = (t: number): FilmShot => {
  const s = sceneAt(t);
  if (s === 0) {
    if (t < 3.42) {
      const k = seg(t, 0, 3.42);
      return pose([lerp(1.4, 0.5, k), lerp(0.5, 1.4, k), lerp(6.2, 4.6, k)], [0, lerp(0.9, 1.6, k), 0], 36);
    }
    const k = seg(t, 3.42, 9.2);
    const a = lerp(-0.5, 0.35, k);
    const r = lerp(5.8, 4.8, k);
    return pose([Math.sin(a) * r, lerp(0.9, 0.55, k), Math.cos(a) * r], [0, 0.45, 0], 34);
  }
  if (s === 1) {
    const k = seg(t, 9.2, 16.4);
    return pose([lerp(-3.4, 3.0, k), lerp(2.6, 2.0, k), lerp(4.8, 4.4, k)], [0, -0.4, 0], 36);
  }
  if (s === 2) {
    if (t < 19.5) {
      const k = seg(t, 16.4, 19.5);
      return pose([lerp(-0.8, 0.8, k), lerp(3.0, 2.6, k), lerp(9.2, 8.4, k)], [0, 0.5, 0], 36);
    }
    const k = seg(t, 19.5, 31.3);
    const a = lerp(-0.4, 0.4, k);
    const r = lerp(9.2, 8.4, k);
    return pose([Math.sin(a) * r, lerp(1.6, 1.2, k), Math.cos(a) * r], [0, 0.2, 0], 36);
  }
  if (s === 3) {
    const k = seg(t, 31.3, 42.1);
    const a = lerp(-0.55, 0.35, k);
    const r = lerp(9.6, 8.6, k);
    return pose([Math.sin(a) * r, lerp(3.4, 2.6, k), Math.cos(a) * r], [0, -0.45, 0], 36);
  }
  if (s === 4) {
    const k = seg(t, 42.1, 54.9);
    const a = lerp(-0.45, 0.45, k);
    const r = lerp(6.6, 5.6, k);
    return pose([Math.sin(a) * r, lerp(0.6, 1.6, k), Math.cos(a) * r], [0, lerp(1.0, 1.3, k), 0], 36);
  }
  if (s === 5) {
    if (t < 62.0) {
      const k = seg(t, 54.9, 62.0);
      const a = lerp(-0.95, -0.55, k);
      return pose([Math.sin(a) * 5.2, lerp(1.2, 1.6, k), Math.cos(a) * 5.2], [0, 0.7, 0], 38);
    }
    const k = seg(t, 62.0, 70.8);
    return pose([lerp(-1.2, 1.0, k), lerp(1.6, 1.2, k), lerp(7.4, 6.6, k)], [0, 0.1, 0], 36);
  }
  if (s === 6) {
    if (t < 76.9) {
      const k = seg(t, 70.8, 76.9);
      return pose([lerp(-0.6, 0.5, k), lerp(0.7, 0.4, k), lerp(7.0, 6.0, k)], [0, 0.45, 0], 34);
    }
    const k = seg(t, 76.9, 79.4);
    const a = lerp(0.7, 0.2, k);
    return pose([Math.sin(a) * 6.6, lerp(1.6, 1.2, k), Math.cos(a) * 6.6], [0, -0.2, 0], 36);
  }
  const k = seg(t, 79.4, TOTAL_SECONDS);
  const a = lerp(-0.25, 0.25, k);
  const r = lerp(5.4, 7.6, k);
  return pose([Math.sin(a) * r, lerp(0.8, 2.6, k), Math.cos(a) * r], [0, lerp(1.2, 0.9, k), 0], 36);
};

/** Short dip to the void at every cut so a cut never reads as a glitch. */
const SUBCUTS = [3.42, 19.5, 62.0, 76.9];
const dipAt = (t: number) => {
  let d = 0;
  for (const c of [...CUTS.slice(1), ...SUBCUTS]) d = Math.max(d, 1 - Math.min(1, Math.abs(t - c) / 0.16));
  return d * 0.85;
};

const MARBLES = 5;

const World: React.FC<{ t: number }> = ({ t }) => {
  const s = sceneAt(t);
  if (s === 0) {
    if (t < 3.42) {
      const rise = seg(t, 0, 2.8);
      return (
        <group>
          <Lab t={t} floorY={-1.4} />
          <Water t={t} y={0} />
          <Hand position={[0, lerp(-2.4, -0.2, rise), 0]} size={2.3} />
          <Drops t={t} from={[[-0.3, 2.6, 0.2], [0, 2.9, 0.2], [0.3, 2.7, 0.2], [0.55, 2.3, 0.2]]} floorY={0} seed={4} />
        </group>
      );
    }
    const w = seg(t, 3.6, 7.6);
    const nerve = seg(t, 6.0, 7.0);
    return (
      <group>
        <Lab t={t} floorY={-2} />
        <group position={[0, -0.4, 0]} rotation={[0.25, 0, 0]}>
          <Fingertip wrinkle={w} nerve={nerve} opacity={nerve > 0 ? 1 - 0.25 * nerve : 1} t={t} />
        </group>
        <Drops t={t} from={[[0.1, 0.7, 0.55], [-0.2, 0.4, 0.5]]} floorY={-2} seed={8} />
      </group>
    );
  }
  if (s === 1) {
    const swell = seg(t, 9.6, 13.0) * (1 - seg(t, 13.95, 14.8));
    const reject = seg(t, 13.95, 14.6);
    return (
      <group>
        <Lab t={t} floorY={-2} />
        <SkinSlab t={t} swell={swell} reject={reject} />
      </group>
    );
  }
  if (s === 2) {
    if (t < 19.5) {
      // Lewis & Pickering 1935: both hands soaked in the same basin; the bandaged one has a cut nerve.
      const dip = seg(t, 16.4, 17.6);
      const wristY = lerp(1.9, 1.2, dip);
      const nerveOn = seg(t, 17.4, 18.2);
      return (
        <group>
          <Lab t={t} floorY={-1.2} />
          <Water t={t} y={0} radius={2.5} />
          <Hand position={[-0.95, wristY, 0]} rotation={[0.08, 0, Math.PI - 0.08]} size={1.7} glow={nerveOn} glowColor="#FFB23F" />
          <Hand position={[0.95, wristY, 0]} rotation={[0.08, 0, Math.PI + 0.08]} size={1.7} />
          {/* bandage + cut-nerve marker on the right wrist */}
          <group position={[0.95, wristY + 0.12, 0.02]}>
            <mesh scale={[1, 1, 0.55]}>
              <cylinderGeometry args={[0.36, 0.36, 0.3, 40, 1, true]} />
              <meshPhysicalMaterial color="#F4F1EA" roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 0.21]} scale={0.09}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color="#FF4A4A" toneMapped={false} transparent opacity={nerveOn * (0.6 + 0.4 * Math.sin(t * 9))} />
            </mesh>
          </group>
        </group>
      );
    }
    const wl = seg(t, 25.0, 28.4);
    const nerve = seg(t, 19.8, 20.8);
    return (
      <group>
        <Lab t={t} floorY={-2} />
        <group position={[-0.8, -0.2, 0]}>
          <Fingertip wrinkle={wl} nerve={nerve} opacity={0.78} seed={3} t={t} />
        </group>
        <group position={[0.8, -0.2, 0]}>
          <Fingertip wrinkle={0} nerve={nerve} broken={t >= 22.4} opacity={0.78} seed={5} t={t} />
        </group>
        <LabSign position={[0.55, 1.6, -4]} width={1.7} />
      </group>
    );
  }
  if (s === 3) {
    return (
      <group>
        <Lab t={t} floorY={-2.2} />
        <TissueSection t={t} signal={seg(t, 31.4, 32.2)} narrow={seg(t, 33.6, 35.6)} deflate={seg(t, 36.5, 38.6)} fold={seg(t, 38.5, 41.0)} />
      </group>
    );
  }
  if (s === 4) {
    const salt = seg(t, 46.3, 46.6);
    const r = prng(12);
    const grains = Array.from({ length: 18 }, () => [(r() - 0.5) * 2.4, r(), (r() - 0.5) * 1.6] as const);
    return (
      <group>
        <Lab t={t} floorY={-1.6} />
        <Water t={t} y={-0.6} />
        <Hand position={[0, -0.9, 0]} rotation={[0, lerp(-0.3, 0.3, seg(t, 42.1, 54.9)), 0]} size={2.3} glow={seg(t, 48.8, 50.2)} />
        <Plinth position={[-2.6, -1.6, -1.2]} scale={0.7} />
        {salt > 0
          ? grains.map((g, i) => {
              const k = ((t - 46.3) * 0.6 + g[1]) % 1;
              return (
                <mesh key={i} position={[g[0], lerp(3, -0.6, k), g[2]]} rotation={[k * 6, k * 4, 0]} scale={0.05}>
                  <octahedronGeometry args={[1, 0]} />
                  <meshPhysicalMaterial color="#F4FBFF" roughness={0.1} transmission={0.3} />
                </mesh>
              );
            })
          : null}
      </group>
    );
  }
  if (s === 5) {
    if (t < 62.0) {
      const spin = -t * 7;
      return (
        <group>
          <Lab t={t} floor={false} />
          <WetRoad t={t} />
          <group position={[0, 0, 0]} rotation={TIRE_ROT}>
            <group rotation={[0, 0, spin]} position={[0, 0.8, 0]}>
              <group position={[0, -0.8, 0]}>
                <AssetModel src={staticFile("models/ep02/tire-ccf0eb.glb")} size={1.6} ground />
              </group>
            </group>
          </group>
          <Spray t={t} origin={[0.6, 0.05, 0]} />
          <Spray t={t + 0.37} origin={[0.6, 0.05, 0.3]} amount={0.8} />
        </group>
      );
    }
    return (
      <group>
        <Lab t={t} floorY={-1.2} />
        <Bowl position={[-1.4, -1.2, 0]} />
        <Bowl position={[1.4, -1.2, 0]} />
        {Array.from({ length: MARBLES }, (_, i) => {
          const start = 62.4 + i * 1.5;
          const k = seg(t, start, start + 1.1);
          const done = t >= start + 1.1;
          const x = lerp(-1.4, 1.4, k) + (done ? (i - 2) * 0.12 : (i - 2) * 0.1 * (1 - k));
          const y = -0.95 + Math.sin(k * Math.PI) * 1.5 + (done ? 0 : 0);
          return (
            <group key={i} position={[x, y, (i % 2) * 0.15]}>
              <AssetModel src={staticFile("models/ep02/glass-marble-4772bb.glb")} size={0.3} />
            </group>
          );
        })}
        <Hand position={[0, 1.55, -0.3]} rotation={[Math.PI - 0.35, 0, lerp(-0.25, 0.25, seg(t, 62, 70.8))]} size={1.6} />
      </group>
    );
  }
  if (s === 6) {
    if (t < 76.9) {
      const slide = seg(t, 72.4, 74.6);
      return (
        <group>
          <Lab t={t} floorY={-2} />
          <group position={[0, -0.3, 0]} rotation={[0.15, 0, 0]}>
            <Fingertip wrinkle={1} seed={7} t={t} />
          </group>
          <group position={[lerp(1.9, 0, slide), -0.3 + 0.002, 0.01]} rotation={[0.15, 0, 0]}>
            <Fingertip wrinkle={1} seed={7} ghost t={t} />
          </group>
          <MatchRing k={seg(t, 74.6, 75.9)} y={0.4} />
        </group>
      );
    }
    return (
      <group>
        <Lab t={t} floorY={-2} />
        <AssetModel src={staticFile("models/ep02/research-microscope-77ce04.glb")} size={2.8} ground position={[-0.2, -2, 0]} />
        <group position={[0.35, -0.95, 0.25]} rotation={[Math.PI / 2, 0, 0.4]} scale={0.32}>
          <Fingertip wrinkle={1} seed={7} t={t} />
        </group>
      </group>
    );
  }
  const warm = seg(t, 79.4, 81.0);
  return (
    <group>
      <Lab t={t} floorY={-1.6} warm={warm} />
      <Water t={t} y={-0.6} warm={warm} />
      <Hand position={[0, lerp(-0.9, -0.5, seg(t, 79.4, 84)), 0]} size={2.3} glow={0.4} />
      <Plinth position={[0, -1.6, 2.2]} scale={0.75} />
      <Drops t={t} from={[[-0.3, 2.2, 0.2], [0.1, 2.5, 0.2], [0.4, 2.3, 0.2]]} floorY={-0.6} seed={19} color="#FFE2B0" />
    </group>
  );
};

export const JariFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const warm = sceneAt(t) === 7 ? seg(t, 79.4, 81) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: P.void }}>
      <FilmScene
        frame={frame}
        shot={cameraAt(t)}
        background={P.void}
        profile={COLOR_PROFILES.CYBER_NEON_VOID}
        ao={false}
        near={0.05}
        far={120}
        fade={dipAt(t)}
        fadeColor={P.void}
        overlay={() => <Hud t={t} />}
      >
        <KeyLight extent={4} keyPos={[3, 6, 5]} keyColor={warm > 0 ? "#FFE3C4" : "#FFF3EE"} keyIntensity={2.6} fill={0.3} rim={P.holo} rimIntensity={1.2} />
        <ambientLight intensity={0.3} color="#CFF7F2" />
        <directionalLight position={[-4, 2, -3]} intensity={1.9} color={P.holo} />
        <pointLight position={[0, 3, 2]} intensity={warm * 6} distance={10} color="#FFB45A" />
        <World t={t} />
      </FilmScene>
      {t < 84.9 ? <Subtitle words={words} frame={frame} fps={fps} position={1300} maxWords={4} activeColor={P.holo} baseColor="#FFFFFF" /> : null}
      <Audio src={staticFile("audio/vo.wav")} />
      <AudiraOutro />
      <AudiraSignature seed="sains-anak-ep02-jari-keriput" />
    </AbsoluteFill>
  );
};
