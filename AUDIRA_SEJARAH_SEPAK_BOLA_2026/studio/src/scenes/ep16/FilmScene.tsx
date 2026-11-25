import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { T, seg, pop, type SetName } from "./timing.ts";

/* ── Palette ── */
const P = {
  neoYellow: "#FFE600", cyberCyan: "#00F0FF", acidGreen: "#25F482",
  hotPink: "#FF3864", inkBlack: "#0B0C10", pureWhite: "#FFFFFF",
  bayernRed: "#DC052D",
};

/* ── Toon material (3-step) ── */
const useToon = (color: string) => useMemo(() => {
  const grad = new THREE.DataTexture(new Uint8Array([60, 140, 255]), 3, 1, THREE.RedFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;
  return new THREE.MeshToonMaterial({ color, gradientMap: grad });
}, [color]);

/* ── Outline (inverted hull) ── */
const Outline: React.FC<{ size: [number, number, number]; scale?: number }> = ({ size, scale = 1.06 }) => (
  <mesh scale={[size[0] * scale, size[1] * scale, size[2] * scale]}>
    <boxGeometry />
    <meshBasicMaterial color={P.inkBlack} side={THREE.BackSide} />
  </mesh>
);

/* ── Offset shadow ── */
const Shadow: React.FC<{ size: [number, number, number] }> = ({ size }) => (
  <mesh position={[0.2, -0.2, -0.15]}>
    <boxGeometry args={size} />
    <meshBasicMaterial color={P.inkBlack} />
  </mesh>
);

/* ── Bouncing brutal block ── */
const BrutalBlock: React.FC<{
  size: [number, number, number]; color: string; position: [number, number, number];
  f: number; bounce?: boolean; children?: React.ReactNode;
}> = ({ size, color, position, f, bounce = true, children }) => {
  const mat = useToon(color);
  const by = bounce ? Math.abs(Math.sin(f * 0.08)) * 0.4 : 0;
  const ry = bounce ? Math.sin(f * 0.04) * 0.35 : 0;
  return (
    <group position={position}>
      <group position={[0, by, 0]} rotation={[0, ry, 0]}>
        <Shadow size={size} />
        <Outline size={size} />
        <mesh>
          <boxGeometry args={size} />
          <primitive object={mat} attach="material" />
        </mesh>
        {children}
      </group>
    </group>
  );
};

/* ── Trophy shape ── */
const Trophy: React.FC<{ position: [number, number, number]; color: string; f: number; scale?: number }> = ({ position, color, f, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <BrutalBlock size={[0.4, 0.6, 0.4]} color={color} position={[0, 0.8, 0]} f={f}>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshBasicMaterial color={P.neoYellow} />
      </mesh>
    </BrutalBlock>
    <BrutalBlock size={[0.6, 0.15, 0.6]} color={P.inkBlack} position={[0, 0.2, 0]} f={f} bounce={false} />
  </group>
);

/* ── Stadium block ── */
const Stadium: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <group>
    <BrutalBlock size={[4, 0.3, 3]} color={color} position={[0, -0.5, 0]} f={f} bounce={false} />
    <BrutalBlock size={[4.2, 1.2, 0.3]} color={P.pureWhite} position={[0, 0.3, -1.5]} f={f} bounce={false} />
    <BrutalBlock size={[4.2, 1.2, 0.3]} color={P.pureWhite} position={[0, 0.3, 1.5]} f={f} bounce={false} />
    <BrutalBlock size={[0.3, 1.2, 3]} color={P.pureWhite} position={[-2.1, 0.3, 0]} f={f} bounce={false} />
    <BrutalBlock size={[0.3, 1.2, 3]} color={P.pureWhite} position={[2.1, 0.3, 0]} f={f} bounce={false} />
  </group>
);

/* ── Player block figure ── */
const PlayerBlock: React.FC<{ position: [number, number, number]; color: string; f: number; jerseyColor?: string }> = ({ position, color, f, jerseyColor }) => (
  <group position={position}>
    <BrutalBlock size={[0.4, 0.5, 0.3]} color={jerseyColor || color} position={[0, 0.5, 0]} f={f} />
    <BrutalBlock size={[0.3, 0.3, 0.3]} color={color} position={[0, 1.0, 0]} f={f} />
    <BrutalBlock size={[0.35, 0.4, 0.3]} color={P.pureWhite} position={[0, 0, 0]} f={f} bounce={false} />
  </group>
);

/* ── Camera rig ── */
const CameraRig: React.FC<{ t: number; currentSet: SetName }> = ({ t, currentSet }) => {
  const { camera } = useThree();
  useFrame(() => {
    let pos: [number, number, number];
    let look: [number, number, number] = [0, 0.5, 0];
    switch (currentSet) {
      case "hook":
        pos = [3 + Math.sin(t * 0.4) * 0.5, 4, 5];
        look = [0, 1, 0];
        break;
      case "birth":
        pos = [4 - t * 0.05, 3.5, 5.5];
        look = [0, 0.3, 0];
        break;
      case "dark":
        pos = [3.5, 3, 5];
        look = [0, 0.5, 0];
        break;
      case "golden":
        pos = [4, 4, 5.5 + Math.sin(t * 0.3) * 0.3];
        look = [0, 0.8, 0];
        break;
      case "champ":
        pos = [3.5 + Math.sin(t * 0.2) * 1, 4.5, 6];
        look = [0, 0.5, 0];
        break;
      case "kaiser":
        pos = [4, 3.5, 5];
        look = [0, 0.8, 0];
        break;
      case "domestic":
        pos = [3 + Math.cos(t * 0.15) * 1.5, 4, 6];
        look = [0, 0.3, 0];
        break;
      case "sextuple":
        pos = [3.5, 5, 6 - seg(t, T.sextuple, T.payEnd) * 1];
        look = [0, 0.8, 0];
        break;
      default:
        pos = [3, 3, 5];
        look = [0, 0.5, 0];
    }
    camera.position.set(...pos);
    camera.lookAt(new THREE.Vector3(...look));
    (camera as THREE.PerspectiveCamera).fov = 38;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
};

/* ── Ground ── */
const Ground: React.FC = () => {
  const mat = useToon(P.neoYellow);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
      <planeGeometry args={[30, 30]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};

/* ── Sets ── */

const HookSet: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <Trophy position={[-1.5, 0, 0]} color={P.bayernRed} f={f} scale={1.2 * pop(t, T.tiga, 0.4)} />
    <Trophy position={[0, 0, -0.5]} color={P.bayernRed} f={f + 20} scale={1.2 * pop(t, T.beruntun, 0.4)} />
    <Trophy position={[1.5, 0, 0]} color={P.bayernRed} f={f + 40} scale={1.2 * pop(t, T.klub, 0.4)} />
    <BrutalBlock size={[6, 0.2, 3]} color={P.pureWhite} position={[0, -0.5, 0]} f={f} bounce={false} />
  </group>
);

const BirthSet: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <BrutalBlock size={[2.5, 2, 1.5]} color={P.pureWhite} position={[0, 0.5, 0]} f={f} bounce={false} />
    <BrutalBlock size={[1, 0.5, 0.5]} color={P.bayernRed} position={[0, 1.8, 0]} f={f}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color={P.pureWhite} />
      </mesh>
    </BrutalBlock>
    <BrutalBlock size={[0.8, 1.2, 0.8]} color={P.acidGreen} position={[-2, 0.3, -1]} f={f + 10} />
    <BrutalBlock size={[0.6, 1.8, 0.6]} color={P.cyberCyan} position={[2.2, 0.6, -0.5]} f={f + 20} />
    <BrutalBlock size={[1.2, 0.8, 1]} color={P.hotPink} position={[1.5, 0.1, 1.2]} f={f + 30} bounce={false} />
  </group>
);

const DarkSet: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <BrutalBlock size={[3, 2.5, 2]} color={P.inkBlack} position={[0, 0.8, 0]} f={f} bounce={false} />
    <PlayerBlock position={[-0.5, 0, 1.5]} color={P.pureWhite} f={f + 10} jerseyColor={P.pureWhite} />
    <BrutalBlock size={[0.6, 0.6, 0.1]} color={P.hotPink} position={[1.2, 1.5, 1.1]} f={f + 20}>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshBasicMaterial color={P.pureWhite} />
      </mesh>
    </BrutalBlock>
  </group>
);

const GoldenSet: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <PlayerBlock position={[-1.5, 0, 0]} color={P.bayernRed} f={f} jerseyColor={P.bayernRed} />
    <PlayerBlock position={[0, 0, -0.3]} color={P.bayernRed} f={f + 15} jerseyColor={P.bayernRed} />
    <PlayerBlock position={[1.5, 0, 0]} color={P.bayernRed} f={f + 30} jerseyColor={P.bayernRed} />
    <BrutalBlock size={[6, 0.15, 4]} color={P.acidGreen} position={[0, -0.5, 0]} f={f} bounce={false} />
    <BrutalBlock size={[0.5, 0.5, 0.1]} color={P.neoYellow} position={[-1.5, 1.6, 0.2]} f={f + 5}>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshBasicMaterial color={P.inkBlack} />
      </mesh>
    </BrutalBlock>
    <BrutalBlock size={[0.5, 0.5, 0.1]} color={P.neoYellow} position={[0, 1.6, -0.1]} f={f + 10}>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshBasicMaterial color={P.inkBlack} />
      </mesh>
    </BrutalBlock>
    <BrutalBlock size={[0.5, 0.5, 0.1]} color={P.neoYellow} position={[1.5, 1.6, 0.2]} f={f + 15}>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshBasicMaterial color={P.inkBlack} />
      </mesh>
    </BrutalBlock>
  </group>
);

const ChampSet: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <Trophy position={[-2, 0, 0]} color={P.neoYellow} f={f} scale={pop(t, T.y1974, 0.5)} />
    <Trophy position={[0, 0, -0.5]} color={P.neoYellow} f={f + 20} scale={pop(t, T.y1975, 0.5)} />
    <Trophy position={[2, 0, 0]} color={P.neoYellow} f={f + 40} scale={pop(t, T.y1976, 0.5)} />
    <Stadium f={f} color={P.acidGreen} />
    <BrutalBlock size={[0.8, 0.4, 0.1]} color={P.hotPink} position={[-2, 1.8, 0.3]} f={f + 5} />
    <BrutalBlock size={[0.8, 0.4, 0.1]} color={P.cyberCyan} position={[2, 1.8, 0.3]} f={f + 25} />
  </group>
);

const KaiserSet: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <PlayerBlock position={[0, 0, 0]} color={P.bayernRed} f={f} jerseyColor={P.bayernRed} />
    <BrutalBlock size={[1.2, 0.5, 0.1]} color={P.neoYellow} position={[0, 2, 0.4]} f={f + 10} />
    <BrutalBlock size={[5, 0.15, 4]} color={P.acidGreen} position={[0, -0.5, 0]} f={f} bounce={false} />
    {/* Arrow: defense → attack */}
    <BrutalBlock size={[3, 0.1, 0.15]} color={P.hotPink} position={[0, 0.1, 1.5]} f={f} bounce={false} />
    <BrutalBlock size={[0.4, 0.1, 0.4]} color={P.hotPink} position={[1.4, 0.1, 1.3]} f={f} bounce={false} />
    <PlayerBlock position={[-2, 0, -1]} color={P.pureWhite} f={f + 20} jerseyColor={P.pureWhite} />
    <PlayerBlock position={[2, 0, -1]} color={P.pureWhite} f={f + 30} jerseyColor={P.pureWhite} />
  </group>
);

const DomesticSet: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const count = Math.min(11, Math.floor(seg(t, T.sebelas, T.y2023) * 11) + 1);
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <BrutalBlock
          key={i}
          size={[0.35, 0.6 + i * 0.08, 0.35]}
          color={i % 2 === 0 ? P.bayernRed : P.pureWhite}
          position={[-2.75 + i * 0.5, 0, 0]}
          f={f + i * 5}
          bounce={false}
        />
      ))}
      <BrutalBlock size={[6, 0.15, 3]} color={P.neoYellow} position={[0, -0.5, 0]} f={f} bounce={false} />
      {t > T.terputus && (
        <BrutalBlock size={[0.35, 0.3, 0.35]} color={P.inkBlack} position={[2.75, 0, 0]} f={f + 60} bounce={false} />
      )}
    </group>
  );
};

const SextupleSet: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const trophyColors = [P.bayernRed, P.neoYellow, P.acidGreen, P.cyberCyan, P.hotPink, P.pureWhite];
  return (
    <group>
      {trophyColors.map((c, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 2;
        return (
          <Trophy
            key={i}
            position={[Math.sin(angle) * r, 0, Math.cos(angle) * r]}
            color={c}
            f={f + i * 12}
            scale={pop(t, T.enam + i * 0.25, 0.4)}
          />
        );
      })}
      <BrutalBlock size={[1, 0.3, 1]} color={P.bayernRed} position={[0, 0, 0]} f={f} bounce={false} />
    </group>
  );
};

const OutroSet: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <BrutalBlock size={[3, 0.5, 2]} color={P.bayernRed} position={[0, 0, 0]} f={f} bounce={false} />
    <BrutalBlock size={[0.8, 0.4, 0.1]} color={P.neoYellow} position={[0, 0.6, 1.1]} f={f + 10} />
  </group>
);

/* ── Main scene ── */
export const FilmScene: React.FC<{ t: number; frame: number; fps: number; currentSet: SetName }> = ({ t, frame, fps, currentSet }) => {
  const f = (frame / fps) * 60;

  return (
    <>
      <CameraRig t={t} currentSet={currentSet} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} />
      <fog attach="fog" args={[P.neoYellow, 8, 25]} />
      <Ground />

      {currentSet === "hook" && <HookSet f={f} t={t} />}
      {currentSet === "birth" && <BirthSet f={f} t={t} />}
      {currentSet === "dark" && <DarkSet f={f} t={t} />}
      {currentSet === "golden" && <GoldenSet f={f} t={t} />}
      {currentSet === "champ" && <ChampSet f={f} t={t} />}
      {currentSet === "kaiser" && <KaiserSet f={f} t={t} />}
      {currentSet === "domestic" && <DomesticSet f={f} t={t} />}
      {currentSet === "sextuple" && <SextupleSet f={f} t={t} />}
      {currentSet === "outro" && <OutroSet f={f} />}

      <Finish frame={frame} background={P.neoYellow} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao />
    </>
  );
};
