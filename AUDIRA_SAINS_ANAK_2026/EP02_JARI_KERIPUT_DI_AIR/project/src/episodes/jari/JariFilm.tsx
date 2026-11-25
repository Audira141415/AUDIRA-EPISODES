// EP02 "Kenapa Jari Keriput Saat Lama di Air" — NANOFORGE (Remotion + R3F), 9:16, 88 s.
// Multi-scene director: 8 VO beats, each with its own subject, all inside a wet microscopic world
// (glass hand in water → skin cells myth → 1935 nerve test → tissue mechanism → time/salt/place →
// tire & marble grip test → same pattern + clinic microscope → warm outro).
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene, type FilmShot } from "../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { NANO_PALETTE as N } from "../../kits/nanoforge/lib/palette";
import words from "../../../public/audio/vo-words.json";
import { CUTS, TOTAL_SECONDS, lerp, seg, sceneAt, prng } from "./timing";
import {
  CYAN,
  NanoEnv,
  NanoLights,
  Water,
  LabSign,
  H2O,
  Ion,
  Fingertip,
  SkinCells,
  NerveFibres,
  TissueSection,
  SkinPatch,
  WetRoad,
  Spray,
  Bowl,
  MatchRing,
} from "./parts";
import { Hud } from "./Hud";

export const JARI_SECONDS = TOTAL_SECONDS;

// GLB orientation (measured from the accessors): rigged left hand, mesh x -0.09..0.08, y 0..0.05 (palm thickness),
// z -0.021 (wrist) .. 0.195 (middle fingertip). AssetModel `size` measures the skinned box wrong, so the hand is
// scaled by hand here: wrist at the origin, fingers up (+z -> +y).
const HAND_LEN = 0.216;
const HAND_ROT: [number, number, number] = [-Math.PI / 2, 0, 0];

/** NANOFORGE hand: hydrated glass membrane (not skin), faint cyan bioluminescence. */
const Hand: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; size?: number; glow?: number; glowColor?: string }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = 3,
  glow = 0,
  glowColor = CYAN,
}) => {
  const k = size / HAND_LEN;
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#9be7ff",
        roughness: 0.08,
        metalness: 0,
        transmission: 0.75,
        ior: 1.33,
        thickness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        emissive: new THREE.Color(glowColor),
        emissiveIntensity: 0.08,
      }),
    [glowColor],
  );
  glass.emissiveIntensity = 0.08 + glow * 0.45;
  return (
    <group position={position} rotation={rotation}>
      <group rotation={HAND_ROT}>
        <AssetModel src={staticFile("models/ep02/base-hand-e3398a.glb")} scale={k} position={[0.004 * k, -0.025 * k, 0.021 * k]} material={glass} smooth />
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
      return pose([lerp(-0.6, 0.6, k), 0.5, lerp(8.9, 8.1, k)], [0, 0.1, 0], 38);
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
    if (t < 49) {
      const k = seg(t, 42.1, 49);
      const a = lerp(-0.45, 0.2, k);
      const r = lerp(5.2, 4.4, k);
      return pose([Math.sin(a) * r, lerp(2.6, 2.2, k), Math.cos(a) * r], [0, 0, 0], 36);
    }
    const k = seg(t, 49, 54.9);
    const a = lerp(-0.25, 0.25, k);
    return pose([Math.sin(a) * 5.4, lerp(3.4, 2.8, k), Math.cos(a) * 5.4], [0, -0.1, 0], 38);
  }
  if (s === 5) {
    if (t < 62.0) {
      const k = seg(t, 54.9, 62.0);
      const a = lerp(-0.95, -0.55, k);
      return pose([Math.sin(a) * 5.2, lerp(1.2, 1.6, k), Math.cos(a) * 5.2], [0, 0.7, 0], 38);
    }
    const k = seg(t, 62.0, 70.8);
    return pose([lerp(-0.9, 0.8, k), lerp(1.4, 1.0, k), lerp(6.0, 5.4, k)], [0, -0.3, 0], 36);
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

/** Water molecules bouncing around a centre (Brownian, deterministic per frame). */
const Molecules: React.FC<{ t: number; n: number; seed: number; spread: [number, number, number]; centre?: [number, number, number]; speed?: number; fall?: boolean; scale?: number }> = ({
  t,
  n,
  seed,
  spread,
  centre = [0, 0, 0],
  speed = 1,
  fall = false,
  scale = 0.12,
}) => {
  const ms = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: n }, () => ({ x: r() - 0.5, y: r(), z: r() - 0.5, ph: r() * 6.28, rx: r() * 6, ry: r() * 6 }));
  }, [n, seed]);
  return (
    <group position={centre}>
      {ms.map((m, i) => {
        const ts = t * speed;
        const y = fall ? lerp(spread[1], -spread[1] * 0.3, (ts * 0.35 + m.y) % 1) : (m.y - 0.5) * spread[1] + Math.sin(ts * 1.7 + m.ph) * 0.12;
        return (
          <H2O
            key={i}
            position={[m.x * spread[0] + Math.sin(ts * 1.3 + m.ph) * 0.15, y, m.z * spread[2] + Math.cos(ts * 1.1 + m.ph) * 0.12]}
            rotation={[m.rx + ts * 0.9, m.ry + ts * 0.7, 0]}
            scale={scale}
          />
        );
      })}
    </group>
  );
};

const MARBLES = 5;

const World: React.FC<{ t: number }> = ({ t }) => {
  const s = sceneAt(t);
  if (s === 0) {
    if (t < 3.42) {
      const rise = seg(t, 0, 2.8);
      return (
        <group>
          <NanoEnv t={t} />
          <Water t={t} y={0} />
          <Hand position={[0, lerp(-2.4, -0.2, rise), 0]} size={2.3} glow={0.3} />
          <Molecules t={t} n={10} seed={4} spread={[2.4, 2.2, 1.2]} centre={[0, 1.6, 0.4]} />
        </group>
      );
    }
    const w = seg(t, 3.6, 7.6);
    const nerve = seg(t, 6.0, 7.0);
    return (
      <group>
        <NanoEnv t={t} />
        <group position={[0, -0.4, 0]} rotation={[0.25, 0, 0]}>
          <Fingertip wrinkle={w} nerve={nerve} opacity={nerve > 0 ? 1 - 0.25 * nerve : 1} t={t} />
        </group>
        <Molecules t={t} n={12} seed={8} spread={[2.6, 2.4, 1.4]} centre={[0, 0.2, 0.8]} speed={lerp(1.2, 0.6, w)} />
      </group>
    );
  }
  if (s === 1) {
    const swell = seg(t, 9.6, 13.0) * (1 - seg(t, 13.95, 14.8));
    const reject = seg(t, 13.95, 14.6);
    return (
      <group>
        <NanoEnv t={t} />
        <SkinCells t={t} swell={swell} reject={reject} />
        <Molecules t={t} n={10} seed={11} spread={[5, 1.2, 2]} centre={[0, 1.6, 0]} />
      </group>
    );
  }
  if (s === 2) {
    if (t < 19.5) {
      return (
        <group>
          <NanoEnv t={t} />
          <NerveFibres t={t} on={seg(t, 16.6, 17.4)} cut={seg(t, 17.4, 18.2)} />
        </group>
      );
    }
    const wl = seg(t, 25.0, 28.4);
    const nerve = seg(t, 19.8, 20.8);
    return (
      <group>
        <NanoEnv t={t} />
        <group position={[-0.8, -0.2, 0]}>
          <Fingertip wrinkle={wl} nerve={nerve} opacity={0.82} seed={3} t={t} />
        </group>
        <group position={[0.8, -0.2, 0]}>
          <Fingertip wrinkle={0} nerve={nerve} broken={t >= 22.4} opacity={0.82} seed={5} t={t} />
        </group>
        <LabSign position={[0.75, 1.9, -4]} width={1.5} />
      </group>
    );
  }
  if (s === 3) {
    return (
      <group>
        <NanoEnv t={t} />
        <TissueSection t={t} signal={seg(t, 31.4, 32.2)} narrow={seg(t, 33.6, 35.6)} deflate={seg(t, 36.5, 38.6)} fold={seg(t, 38.5, 41.0)} />
      </group>
    );
  }
  if (s === 4) {
    if (t < 49) {
      const salt = seg(t, 46.3, 46.8);
      const r = prng(12);
      const ions = Array.from({ length: 14 }, (_, i) => ({ x: (r() - 0.5) * 3, y: r(), z: (r() - 0.5) * 1.8, kind: (i % 2 ? "cl" : "na") as "na" | "cl" }));
      return (
        <group>
          <NanoEnv t={t} />
          <group position={[0, -0.5, 0]}>
            <SkinPatch wrinkle={seg(t, 42.6, 46.2) * (1 - 0.4 * salt)} t={t} />
          </group>
          <Molecules t={t} n={16} seed={21} spread={[3.2, 3, 1.8]} centre={[0, 0.6, 0]} fall speed={lerp(1, 0.35, salt)} />
          {salt > 0
            ? ions.map((g, i) => {
                const k = ((t - 46.3) * 0.45 + g.y) % 1;
                return <Ion key={i} position={[g.x, lerp(2.6, -0.3, k), g.z]} kind={g.kind} scale={0.12 * salt} />;
              })
            : null}
        </group>
      );
    }
    const glow = seg(t, 49.6, 50.8);
    return (
      <group>
        <NanoEnv t={t} />
        <group position={[-1.35, -0.5, 0]} scale={0.95}>
          <SkinPatch wrinkle={0} hair t={t} />
        </group>
        <group position={[1.35, -0.5, 0]} scale={0.95}>
          <SkinPatch wrinkle={1} glow={glow} t={t} />
        </group>
      </group>
    );
  }
  if (s === 5) {
    if (t < 62.0) {
      const spin = -t * 7;
      return (
        <group>
          <NanoEnv t={t} vesicles={false} />
          <WetRoad t={t} />
          <group rotation={[0, 0, spin]} position={[0, 0.8, 0]}>
            <group position={[0, -0.8, 0]}>
              <AssetModel src={staticFile("models/ep02/tire-ccf0eb.glb")} size={1.6} ground material={TIRE_MAT} />
            </group>
          </group>
          <Spray t={t} origin={[0.6, 0.05, 0]} />
          <Spray t={t + 0.37} origin={[0.6, 0.05, 0.3]} amount={0.8} />
        </group>
      );
    }
    return (
      <group>
        <NanoEnv t={t} />
        <Bowl position={[-1.0, -1.2, 0]} />
        <Bowl position={[1.0, -1.2, 0]} />
        {Array.from({ length: MARBLES }, (_, i) => {
          const start = 62.4 + i * 1.5;
          const k = seg(t, start, start + 1.1);
          const done = t >= start + 1.1;
          const x = lerp(-1.0, 1.0, k) + (done ? (i - 2) * 0.1 : (i - 2) * 0.08 * (1 - k));
          const y = -0.95 + Math.sin(k * Math.PI) * 1.5;
          return (
            <group key={i} position={[x, y, (i % 2) * 0.15]}>
              <AssetModel src={staticFile("models/ep02/glass-marble-4772bb.glb")} size={0.3} />
            </group>
          );
        })}
        <group position={[0, 0.55, -0.4]} rotation={[0.2, 0, Math.PI / 2 + lerp(-0.12, 0.12, seg(t, 62, 70.8))]} scale={0.38}>
          <Fingertip wrinkle={1} seed={9} t={t} />
        </group>
      </group>
    );
  }
  if (s === 6) {
    if (t < 76.9) {
      const slide = seg(t, 72.4, 74.6);
      return (
        <group>
          <NanoEnv t={t} />
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
        <NanoEnv t={t} />
        <AssetModel src={staticFile("models/ep02/research-microscope-77ce04.glb")} size={2.8} ground position={[-0.2, -2, 0]} material={CHROME_MAT} />
        <group position={[0.35, -0.95, 0.25]} rotation={[Math.PI / 2, 0, 0.4]} scale={0.32}>
          <Fingertip wrinkle={1} seed={7} t={t} />
        </group>
      </group>
    );
  }
  const warm = seg(t, 79.4, 81.0);
  return (
    <group>
      <NanoEnv t={t} warm={warm} />
      <Water t={t} y={-0.6} warm={warm} />
      <Hand position={[0, lerp(-0.9, -0.5, seg(t, 79.4, 84)), 0]} size={2.3} glow={0.5} glowColor={N.adenineGold} />
      <Molecules t={t} n={8} seed={19} spread={[2.4, 1.6, 1.2]} centre={[0, 1.6, 0.4]} speed={0.6} />
    </group>
  );
};

const TIRE_MAT = new THREE.MeshPhysicalMaterial({ color: "#0b0d12", roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.15 });
const CHROME_MAT = new THREE.MeshPhysicalMaterial({ color: N.nanobotChrome, roughness: 0.18, metalness: 0.92 });

export const JariFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const warm = sceneAt(t) === 7 ? seg(t, 79.4, 81) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: N.microscopyVoid }}>
      <FilmScene
        frame={frame}
        shot={cameraAt(t)}
        background={N.microscopyVoid}
        profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
        exposure={1}
        envIntensity={0.55}
        hdri="studio"
        ao
        near={0.05}
        far={120}
        fade={dipAt(t)}
        fadeColor={N.microscopyVoid}
        overlay={() => <Hud t={t} />}
      >
        <NanoLights warm={warm} />
        <World t={t} />
      </FilmScene>
      {t < 84.9 ? <Subtitle words={words} frame={frame} fps={fps} position={1300} maxWords={4} activeColor={N.thymineCyan} baseColor="#FFFFFF" /> : null}
      <Audio src={staticFile("audio/vo.wav")} />
      <AudiraOutro />
      <AudiraSignature seed="sains-anak-ep02-jari-keriput" />
    </AbsoluteFill>
  );
};
