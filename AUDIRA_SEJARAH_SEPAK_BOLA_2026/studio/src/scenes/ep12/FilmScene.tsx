import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { InkMountainDiorama } from "../../kits/inkstory/world/InkMountainDiorama.tsx";
import { InkAtmosphere } from "../../kits/inkstory/world/Atmosphere.tsx";
import { INK_PALETTE } from "../../kits/inkstory/lib/palette.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { seg, clamp01, setAt, T, CUT } from "./timing.ts";

type V3 = [number, number, number];

// ---------- Catmull-Rom spline ----------
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const cr3 = (a: V3, b: V3, c: V3, d: V3, u: number): V3 => [cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u), cr(a[2], b[2], c[2], d[2], u)];
type Key = { t: number; pos: V3; target: V3; fov: number };
const path = (keys: Key[], t: number) => {
  const n = keys.length;
  let i = 0;
  for (let k = 0; k < n - 1; k++) if (t >= keys[k].t) i = k;
  const a = keys[Math.max(0, i - 1)], b = keys[i], c = keys[Math.min(n - 1, i + 1)], d = keys[Math.min(n - 1, i + 2)];
  const u = clamp01((t - b.t) / Math.max(0.001, c.t - b.t));
  const su = u * u * (3 - 2 * u);
  return { pos: cr3(a.pos, b.pos, c.pos, d.pos, su), target: cr3(a.target, b.target, c.target, d.target, su), fov: cr(a.fov, b.fov, c.fov, d.fov, su) };
};

// ---------- camera keys per set ----------
const KEYS: Record<string, Key[]> = {
  hook: [
    { t: 0, pos: [-1.8, -0.3, 4.6], target: [-0.8, 0, 0], fov: 36 },
    { t: 3.5, pos: [-0.6, 0, 4.8], target: [0, 0, 0], fov: 35.5 },
    { t: 6.8, pos: [0.2, 0.1, 5.0], target: [0, 0.1, 0], fov: 35 },
  ],
  cruyff73: [
    { t: CUT.konteks, pos: [0.5, 0.2, 5.2], target: [0, 0, 0], fov: 35.5 },
    { t: 12, pos: [-0.3, 0.3, 4.4], target: [-0.2, 0.1, 0], fov: 35 },
    { t: 18, pos: [0.8, 0.5, 5.0], target: [0.2, 0.2, 0], fov: 35 },
    { t: CUT.pengembangan, pos: [0, 0.4, 5.4], target: [0, 0.2, 0], fov: 35 },
  ],
  dreamTeam: [
    { t: CUT.pengembangan, pos: [-0.5, 0.6, 5.0], target: [0, 0.3, 0], fov: 35 },
    { t: 27, pos: [0.6, 0.8, 4.8], target: [0.1, 0.4, 0], fov: 34.5 },
    { t: 32, pos: [-0.2, 1.0, 5.4], target: [0, 0.5, 0], fov: 34.5 },
    { t: CUT.penjelasan, pos: [0.3, 1.2, 5.6], target: [0, 0.6, 0], fov: 34 },
  ],
  pepTiki: [
    { t: CUT.penjelasan, pos: [0, 0.8, 5.8], target: [0, 0.4, 0], fov: 35 },
    { t: 40, pos: [-0.8, 0.5, 4.6], target: [-0.3, 0.2, 0], fov: 35 },
    { t: 48, pos: [0.5, 1.0, 5.2], target: [0.1, 0.5, 0], fov: 34 },
    { t: CUT.payoff, pos: [0, 1.4, 5.8], target: [0, 0.7, 0], fov: 34 },
  ],
  ballonDor: [
    { t: CUT.payoff, pos: [-0.6, 1.2, 5.4], target: [0, 0.6, 0], fov: 34.5 },
    { t: 60, pos: [0.4, 0.8, 4.8], target: [0.1, 0.3, 0], fov: 35 },
    { t: 67, pos: [-0.3, 1.4, 5.6], target: [0, 0.7, 0], fov: 34 },
    { t: CUT.outro, pos: [0, 0.2, 6.6], target: [0, 0, 0], fov: 34 },
  ],
  outro: [
    { t: CUT.outro, pos: [0, 0.2, 6.6], target: [0, 0, 0], fov: 34 },
    { t: 78, pos: [0, 0.3, 6.8], target: [0, 0.1, 0], fov: 34 },
    { t: 82, pos: [0, 0.2, 6.6], target: [0, 0, 0], fov: 34 },
  ],
};

// ---------- camera rig ----------
const CameraRig: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const set = setAt(t);
  const keys = KEYS[set] ?? KEYS.hook;
  const { pos, target, fov } = path(keys, t);
  const shake = 0.008 * Math.sin(frame * 0.037) * (1 - seg(t, CUT.outro, CUT.outro + 2));
  camera.position.set(pos[0] + shake, pos[1] + shake * 0.6, pos[2]);
  camera.lookAt(target[0], target[1], target[2]);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  return null;
};

// ---------- ink-wash football props ----------
const InkBall: React.FC<{ pos: V3; scale?: number; o?: number }> = ({ pos, scale = 0.12, o = 1 }) => (
  <mesh position={pos} scale={scale}>
    <sphereGeometry args={[1, 16, 12]} />
    <meshStandardMaterial color={INK_PALETTE.denseInk} roughness={0.88} metalness={0.05} transparent opacity={o} />
  </mesh>
);

const InkFigure: React.FC<{ pos: V3; color?: string; scale?: number; o?: number }> = ({ pos, color = INK_PALETTE.denseInk, scale = 1, o = 1 }) => (
  <group position={pos} scale={scale}>
    {/* body */}
    <mesh position={[0, 0.28, 0]}>
      <RoundedBoxGeo args={[0.18, 0.32, 0.14]} radius={0.04} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} transparent opacity={o} />
    </mesh>
    {/* head */}
    <mesh position={[0, 0.56, 0]}>
      <sphereGeometry args={[0.09, 12, 8]} />
      <meshStandardMaterial color={INK_PALETTE.dilutedWash} roughness={0.9} metalness={0} transparent opacity={o} />
    </mesh>
    {/* legs */}
    {[-0.05, 0.05].map((x, i) => (
      <mesh key={i} position={[x, 0.06, 0]}>
        <RoundedBoxGeo args={[0.06, 0.16, 0.06]} radius={0.02} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} transparent opacity={o} />
      </mesh>
    ))}
  </group>
);

const TrophyCup: React.FC<{ pos: V3; scale?: number; o?: number }> = ({ pos, scale = 0.15, o = 1 }) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.3, 0.5, 0.8, 8]} />
      <meshStandardMaterial color={INK_PALETTE.ancientGold} roughness={0.7} metalness={0.15} transparent opacity={o} />
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.25, 0.2, 0.2, 8]} />
      <meshStandardMaterial color={INK_PALETTE.ancientGold} roughness={0.7} metalness={0.15} transparent opacity={o} />
    </mesh>
  </group>
);

const PassingTriangle: React.FC<{ pos: V3; t: number; o?: number }> = ({ pos, t, o = 1 }) => {
  const angle = t * 0.8;
  const r = 0.4;
  return (
    <group position={pos}>
      {[0, 1, 2].map((i) => {
        const a = angle + (i * Math.PI * 2) / 3;
        return <InkBall key={i} pos={[Math.cos(a) * r, 0.06, Math.sin(a) * r]} scale={0.06} o={o} />;
      })}
    </group>
  );
};

// ---------- sets ----------
const HookSet: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - seg(t, CUT.konteks - 0.3, CUT.konteks + 0.1);
  return (
    <group visible={o > 0.001}>
      {/* Cruyff figure on left */}
      <InkFigure pos={[-1.2, 0, -0.5]} color={INK_PALETTE.denseInk} o={o} />
      {/* Guardiola figure on right */}
      <InkFigure pos={[0.8, 0, -0.3]} color={INK_PALETTE.mountainIndigo} o={o} />
      {/* connecting line: satu garis lurus */}
      <mesh position={[-0.2, 0.28, -0.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.012, 0.012]} />
        <meshStandardMaterial color={INK_PALETTE.vermilionCinnabar} roughness={0.85} transparent opacity={o * seg(t, T.bukan, T.garisLurus)} />
      </mesh>
      <InkBall pos={[0, 0.06, 0]} o={o} />
    </group>
  );
};

const Cruyff73Set: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.konteks, CUT.konteks + 0.5);
  const leave = 1 - seg(t, CUT.pengembangan - 0.3, CUT.pengembangan + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* Cruyff figure prominent */}
      <InkFigure pos={[-0.4, 0, -0.6]} scale={1.1} color={INK_PALETTE.denseInk} o={o} />
      {/* ball at his feet */}
      <InkBall pos={[-0.25, 0.06, -0.3]} o={o} />
      {/* opposing figures (Real Madrid) fading back */}
      {[-1.5, -1.2, -0.9].map((x, i) => (
        <InkFigure key={i} pos={[x, 0, -1.8 - i * 0.3]} scale={0.7} color={INK_PALETTE.mistPaleWash} o={o * 0.5} />
      ))}
      {/* 5-0 score stone */}
      <mesh position={[0.8, 0.2, -0.8]} rotation={[0, -0.2, 0]}>
        <RoundedBoxGeo args={[0.5, 0.3, 0.04]} radius={0.02} />
        <meshStandardMaterial color={INK_PALETTE.agedXuanPaper} roughness={0.95} transparent opacity={o * seg(t, T.limaNol1, T.limaNol1 + 0.5)} />
      </mesh>
      {/* trophy silhouette for "gelar liga" */}
      <TrophyCup pos={[1.2, 0, -0.5]} scale={0.12} o={o * seg(t, T.gelarLiga, T.dinanti)} />
      {/* "kuasai bola, kuasai ruang" tiki-taka triangles */}
      <PassingTriangle pos={[0, 0.06, 0.3]} t={t} o={o * seg(t, T.kuasaiBola, T.ruangEnd)} />
    </group>
  );
};

const DreamTeamSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.pengembangan, CUT.pengembangan + 0.5);
  const leave = 1 - seg(t, CUT.penjelasan - 0.3, CUT.penjelasan + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* Cruyff as coach (seated/standing taller) */}
      <InkFigure pos={[-0.6, 0, -0.3]} scale={1.15} color={INK_PALETTE.denseInk} o={o} />
      {/* 4 La Liga trophies in a row */}
      {[0, 1, 2, 3].map((i) => (
        <TrophyCup key={i} pos={[-0.3 + i * 0.35, 0, 0.4]} scale={0.1} o={o * seg(t, T.empatGelar + i * 0.25, T.beruntun)} />
      ))}
      {/* European Cup (larger, gold) */}
      <TrophyCup pos={[0.8, 0, -0.8]} scale={0.18} o={o * seg(t, T.trofiPiala, T.wembley)} />
      {/* Koeman figure for the free kick */}
      <InkFigure pos={[0.3, 0, -1.2]} color={INK_PALETTE.mountainIndigo} o={o * seg(t, T.koeman, T.koemanEnd)} />
      <InkBall pos={[0.45, 0.06, -1.0]} o={o * seg(t, T.tendanganBebas, T.koemanEnd)} />
      {/* La Masia building silhouette */}
      <mesh position={[-1.0, 0.35, -1.5]} visible={o * seg(t, T.akademi, T.laMasia1End) > 0.001}>
        <RoundedBoxGeo args={[0.8, 0.7, 0.3]} radius={0.05} />
        <meshStandardMaterial color={INK_PALETTE.mountainIndigo} roughness={0.9} transparent opacity={o * 0.6 * seg(t, T.akademi, T.laMasia1End)} />
      </mesh>
    </group>
  );
};

const PepTikiSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.penjelasan, CUT.penjelasan + 0.5);
  const leave = 1 - seg(t, CUT.payoff - 0.3, CUT.payoff + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* Guardiola as coach */}
      <InkFigure pos={[-0.8, 0, 0]} scale={1.15} color={INK_PALETTE.denseInk} o={o} />
      {/* tiki-taka triangles: passing network */}
      <PassingTriangle pos={[0.2, 0.06, -0.4]} t={t} o={o * seg(t, T.tikiTaka, T.tikiTakaEnd + 2)} />
      <PassingTriangle pos={[-0.3, 0.06, -1.0]} t={t * 1.2} o={o * seg(t, T.tikiTaka + 0.5, T.trebleEnd)} />
      {/* treble: 3 trophies */}
      {[0, 1, 2].map((i) => (
        <TrophyCup key={i} pos={[0.5 + i * 0.4, 0, 0.3]} scale={0.13} o={o * seg(t, T.treble1 + i * 0.4, T.trebleEnd + 1)} />
      ))}
      {/* sextuple: 6 trophies in arc */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = -0.5 + i * 0.2;
        return (
          <TrophyCup key={`six-${i}`} pos={[Math.sin(angle) * 1.2, 0, -1.2 + Math.cos(angle) * 0.3]} scale={0.1}
            o={o * seg(t, T.enamTrofi + i * 0.15, T.kalender + 1)} />
        );
      })}
      {/* "belum pernah" emphasis — vermilion seal dot */}
      <mesh position={[0, 0.5, -0.6]} visible={seg(t, T.belumPernah, T.melakukannya) > 0.01}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color={INK_PALETTE.vermilionCinnabar} roughness={0.7} transparent opacity={o * seg(t, T.belumPernah, T.melakukannya)} />
      </mesh>
    </group>
  );
};

const BallonDorSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.payoff, CUT.payoff + 0.5);
  const leave = 1 - seg(t, CUT.outro - 0.3, CUT.outro + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* 3 La Masia finalists: Messi, Iniesta, Xavi */}
      <InkFigure pos={[-0.5, 0, -0.3]} scale={1.0} color={INK_PALETTE.denseInk} o={o * seg(t, T.messi - 0.2, T.xaviEnd + 2)} />
      <InkFigure pos={[0, 0, -0.5]} scale={0.95} color={INK_PALETTE.mountainIndigo} o={o * seg(t, T.iniesta - 0.2, T.xaviEnd + 2)} />
      <InkFigure pos={[0.5, 0, -0.3]} scale={0.95} color={INK_PALETTE.dilutedWash} o={o * seg(t, T.xavi - 0.2, T.xaviEnd + 2)} />
      {/* Ballon d'Or (golden sphere) */}
      <mesh position={[0, 0.7, -0.4]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color={INK_PALETTE.ancientGold} roughness={0.65} metalness={0.2} transparent opacity={o * seg(t, T.ballonDor, T.xaviEnd + 1)} />
      </mesh>
      {/* 5-0 again stone */}
      <mesh position={[1.0, 0.2, -0.6]} rotation={[0, -0.15, 0]}>
        <RoundedBoxGeo args={[0.5, 0.3, 0.04]} radius={0.02} />
        <meshStandardMaterial color={INK_PALETTE.agedXuanPaper} roughness={0.95} transparent opacity={o * seg(t, T.limaNol2, T.limaNol2End + 0.5)} />
      </mesh>
      {/* "filosofi yang sama" — connecting line echoing hook */}
      <mesh position={[-0.2, 0.28, -0.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.012, 0.012]} />
        <meshStandardMaterial color={INK_PALETTE.vermilionCinnabar} roughness={0.85} transparent opacity={o * seg(t, T.filosofi, T.filosofiEnd)} />
      </mesh>
    </group>
  );
};

const OutroSet: React.FC<{ t: number }> = ({ t }) => {
  const o = seg(t, CUT.outro, CUT.outro + 0.5);
  return (
    <group visible={o > 0.001}>
      {/* full painting reveal — all elements at rest */}
      <InkBall pos={[0, 0.06, 0]} scale={0.15} o={o} />
      {/* vermilion seal for AUDIRA branding */}
      <mesh position={[0.8, 0.15, 0.5]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color={INK_PALETTE.vermilionCinnabar} roughness={0.7} metalness={0.1} transparent opacity={o} />
      </mesh>
    </group>
  );
};

// ---------- main scene ----------
export const FilmScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const set = setAt(t);
  const BG = INK_PALETTE.agedXuanPaper;
  return (
    <>
      <CameraRig t={t} frame={frame} />
      <InkAtmosphere />
      <InkMountainDiorama f={frame} />
      {set === "hook" && <HookSet t={t} />}
      {set === "cruyff73" && <Cruyff73Set t={t} />}
      {set === "dreamTeam" && <DreamTeamSet t={t} />}
      {set === "pepTiki" && <PepTikiSet t={t} />}
      {set === "ballonDor" && <BallonDorSet t={t} />}
      {set === "outro" && <OutroSet t={t} />}
      <Finish frame={frame} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} ao />
    </>
  );
};
