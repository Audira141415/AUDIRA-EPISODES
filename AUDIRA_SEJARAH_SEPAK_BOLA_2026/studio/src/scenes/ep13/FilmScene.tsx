import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MosaicHall3D } from "../../kits/mosaicforge/scene/MosaicHall3D.tsx";
import { MOSAIC_PALETTE } from "../../kits/mosaicforge/lib/palette.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { seg, clamp01, setAt, T, CUT } from "./timing.ts";

type V3 = [number, number, number];

// Man Utd colors in mosaic palette range
const MAN_RED = "#DA291C";
const GROUT = MOSAIC_PALETTE.grout;
const ROOM = MOSAIC_PALETTE.room;
const LAPIS = MOSAIC_PALETTE.lapisDeep;
const TERRACOTTA = MOSAIC_PALETTE.terracotta;
const CREAM = MOSAIC_PALETTE.cream;
const GOLD = MOSAIC_PALETTE.gold;
const OCHRE = MOSAIC_PALETTE.ochre;

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
    { t: 0, pos: [0.5, 0.6, 6.4], target: [0, 0, 3.6], fov: 52 },
    { t: 4, pos: [0.3, 0.5, 4.8], target: [0, 0, 2.4], fov: 51.5 },
    { t: 9, pos: [-0.2, 0.7, 3.6], target: [0, 0.1, 1.2], fov: 51 },
  ],
  busbyBabes: [
    { t: CUT.konteks, pos: [-0.3, 0.8, 5.2], target: [0, 0.2, 2.0], fov: 51.5 },
    { t: 15, pos: [0.4, 0.6, 4.0], target: [0, 0.1, 1.0], fov: 51 },
    { t: 20, pos: [-0.2, 1.0, 3.2], target: [0, 0.2, 0.5], fov: 51 },
    { t: CUT.pengembangan, pos: [0, 1.2, 4.4], target: [0, 0.3, 1.5], fov: 51 },
  ],
  disaster: [
    { t: CUT.pengembangan, pos: [0, 1.0, 5.0], target: [0, 0.2, 2.0], fov: 51 },
    { t: 30, pos: [-0.4, 0.8, 3.8], target: [0, 0.1, 1.0], fov: 51 },
    { t: 36, pos: [0.3, 1.4, 4.6], target: [0, 0.4, 1.5], fov: 50.5 },
    { t: CUT.penjelasan, pos: [0, 1.6, 5.2], target: [0, 0.5, 2.0], fov: 50.5 },
  ],
  rebuild: [
    { t: CUT.penjelasan, pos: [-0.3, 1.2, 5.4], target: [0, 0.3, 2.0], fov: 51 },
    { t: 46, pos: [0.5, 0.8, 4.0], target: [0, 0.2, 1.0], fov: 51 },
    { t: 52, pos: [-0.2, 2.0, 5.0], target: [0, 0.6, 1.8], fov: 50.5 },
    { t: CUT.payoff, pos: [0, 2.4, 5.6], target: [0, 0.8, 2.0], fov: 50 },
  ],
  treble99: [
    { t: CUT.payoff, pos: [0, 1.5, 5.8], target: [0, 0.4, 2.0], fov: 51 },
    { t: 62, pos: [-0.5, 1.0, 4.2], target: [0, 0.2, 1.0], fov: 51 },
    { t: 70, pos: [0.3, 2.0, 5.0], target: [0, 0.6, 1.5], fov: 50.5 },
    { t: CUT.outro, pos: [0, 4.0, 3.0], target: [0, 0, 0], fov: 50 },
  ],
  outro: [
    { t: CUT.outro, pos: [0, 4.0, 3.0], target: [0, 0, 0], fov: 50 },
    { t: 82, pos: [0, 5.0, 2.8], target: [0, 0, 0], fov: 50 },
    { t: 88, pos: [0, 5.5, 2.5], target: [0, 0, 0], fov: 50 },
  ],
};

// ---------- camera rig ----------
const CameraRig: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const set = setAt(t);
  const keys = KEYS[set] ?? KEYS.hook;
  const { pos, target, fov } = path(keys, t);
  const roll = Math.sin(t * 0.5) * 0.02 * (1 - seg(t, 70, 78));
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(target[0], target[1], target[2]);
  camera.rotation.z += roll;
  camera.fov = fov;
  camera.updateProjectionMatrix();
  return null;
};

// ---------- mosaic figure (rounded head-cloth + shoulders, per memory) ----------
const MosaicFigure: React.FC<{ pos: V3; color?: string; scale?: number; o?: number }> = ({
  pos, color = TERRACOTTA, scale = 1, o = 1,
}) => (
  <group position={pos} scale={scale}>
    {/* head-cloth */}
    <mesh position={[0, 0.52, 0]}>
      <sphereGeometry args={[0.1, 12, 8]} />
      <meshPhysicalMaterial color={CREAM} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.18} transparent opacity={o} />
    </mesh>
    {/* shoulders */}
    <mesh position={[0, 0.34, 0]}>
      <RoundedBoxGeo args={[0.24, 0.22, 0.14]} radius={0.04} />
      <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.18} transparent opacity={o} />
    </mesh>
    {/* body */}
    <mesh position={[0, 0.14, 0]}>
      <RoundedBoxGeo args={[0.16, 0.2, 0.12]} radius={0.03} />
      <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.18} transparent opacity={o} />
    </mesh>
  </group>
);

// golden trophy in mosaic style
const MosaicTrophy: React.FC<{ pos: V3; scale?: number; o?: number }> = ({ pos, scale = 0.15, o = 1 }) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.25, 0.4, 0.7, 8]} />
      <meshStandardMaterial color={GOLD} roughness={0.32} metalness={1.0} transparent opacity={o} />
    </mesh>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.2, 0.15, 0.2, 8]} />
      <meshStandardMaterial color={GOLD} roughness={0.32} metalness={1.0} transparent opacity={o} />
    </mesh>
  </group>
);

// memorial stone slab
const MemorialSlab: React.FC<{ pos: V3; o?: number }> = ({ pos, o = 1 }) => (
  <mesh position={pos}>
    <RoundedBoxGeo args={[0.6, 0.8, 0.06]} radius={0.03} />
    <meshPhysicalMaterial color={LAPIS} roughness={0.42} clearcoat={0.7} transparent opacity={o} />
  </mesh>
);

// football in mosaic style
const MosaicBall: React.FC<{ pos: V3; scale?: number; o?: number }> = ({ pos, scale = 0.1, o = 1 }) => (
  <mesh position={pos} scale={scale}>
    <sphereGeometry args={[1, 12, 8]} />
    <meshPhysicalMaterial color={CREAM} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.18} transparent opacity={o} />
  </mesh>
);

// ---------- sets ----------
const HookSet: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - seg(t, CUT.konteks - 0.3, CUT.konteks + 0.1);
  return (
    <group visible={o > 0.001}>
      {/* 8 young player figures in formation, slowly dimming */}
      {[[-0.8, 0, -1], [-0.4, 0, -1.2], [0, 0, -1], [0.4, 0, -1.2],
        [-0.6, 0, -0.4], [-0.2, 0, -0.6], [0.2, 0, -0.4], [0.6, 0, -0.6]].map((p, i) => (
        <MosaicFigure key={i} pos={p as V3} color={MAN_RED} scale={0.8} o={o * (1 - seg(t, T.delapanPemain + i * 0.08, T.delapanPemain + 1.5))} />
      ))}
      <MosaicBall pos={[0, 0.06, -0.8]} o={o} />
    </group>
  );
};

const BusbyBabesSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.konteks, CUT.konteks + 0.5);
  const leave = 1 - seg(t, CUT.pengembangan - 0.3, CUT.pengembangan + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* Matt Busby figure */}
      <MosaicFigure pos={[-0.6, 0, -0.5]} scale={1.1} color={LAPIS} o={o * seg(t, T.mattBusby1, T.busby1End + 2)} />
      {/* young team figures */}
      {[0, 1, 2, 3, 4].map((i) => (
        <MosaicFigure key={i} pos={[-0.3 + i * 0.3, 0, -1.0]} scale={0.75} color={MAN_RED} o={o * seg(t, T.timBelia + i * 0.1, T.busby1End + 1)} />
      ))}
      {/* plane silhouette (slab) */}
      <mesh position={[0.5, 0.5, -2.0]} rotation={[0, 0, 0.1]}>
        <RoundedBoxGeo args={[1.2, 0.15, 0.06]} radius={0.04} />
        <meshPhysicalMaterial color={GROUT} roughness={0.42} clearcoat={0.7} transparent opacity={o * seg(t, T.perjalanan, T.munichEnd2)} />
      </mesh>
    </group>
  );
};

const DisasterSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.pengembangan, CUT.pengembangan + 0.5);
  const leave = 1 - seg(t, CUT.penjelasan - 0.3, CUT.penjelasan + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* memorial slab — respectful, no graphic crash depiction */}
      <MemorialSlab pos={[0, 0.4, -0.8]} o={o} />
      {/* 8 dimmed figures for the 8 players lost */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = -0.9 + (i % 4) * 0.5;
        const z = i < 4 ? -1.6 : -2.2;
        return <MosaicFigure key={i} pos={[x, 0, z]} scale={0.6} color={GROUT} o={o * 0.5 * seg(t, T.delapanPemain2, T.pemainEnd + 1)} />;
      })}
      {/* Duncan Edwards figure, then fades */}
      <MosaicFigure pos={[0.7, 0, -0.5]} scale={0.9} color={MAN_RED}
        o={o * seg(t, T.duncanEdwards, T.edwardsEnd + 0.5) * (1 - seg(t, T.wafat, T.kemudian))} />
      {/* Matt Busby figure — survives */}
      <MosaicFigure pos={[-0.7, 0, -0.5]} scale={1.0} color={LAPIS}
        o={o * seg(t, T.mattBusby2, T.bertahanEnd)} />
    </group>
  );
};

const RebuildSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.penjelasan, CUT.penjelasan + 0.5);
  const leave = 1 - seg(t, CUT.payoff - 0.3, CUT.payoff + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* Busby rebuilding — figure rises */}
      <MosaicFigure pos={[-0.6, 0, -0.3]} scale={1.1} color={LAPIS} o={o} />
      {/* new generation players */}
      {[0, 1, 2, 3].map((i) => (
        <MosaicFigure key={i} pos={[-0.2 + i * 0.35, 0, -1.0]} scale={0.8} color={MAN_RED}
          o={o * seg(t, T.membangunKembali + i * 0.3, T.puing + 3)} />
      ))}
      {/* European Cup 1968 trophy */}
      <MosaicTrophy pos={[0.8, 0, 0.2]} scale={0.18} o={o * seg(t, T.empatSatu, T.juaraEropaEnd + 1)} />
      {/* Bobby Charlton figure */}
      <MosaicFigure pos={[0.3, 0, -0.4]} scale={1.0} color={MAN_RED}
        o={o * seg(t, T.bobbyCharlton, T.malamItu)} />
      <MosaicBall pos={[0.45, 0.06, -0.2]} o={o * seg(t, T.duaGol, T.malamItu)} />
    </group>
  );
};

const Treble99Set: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.payoff, CUT.payoff + 0.5);
  const leave = 1 - seg(t, CUT.outro - 0.3, CUT.outro + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      {/* Ferguson figure */}
      <MosaicFigure pos={[-0.8, 0, 0]} scale={1.15} color={LAPIS} o={o * seg(t, T.alexFerguson, T.fergusonEnd + 5)} />
      {/* treble trophies: Liga, FA Cup, Champions League */}
      {[0, 1, 2].map((i) => (
        <MosaicTrophy key={i} pos={[-0.2 + i * 0.5, 0, 0.4]} scale={0.15}
          o={o * seg(t, T.liga + i * 1.5, T.satuMusim + 1)} />
      ))}
      {/* Camp Nou match — two groups of figures */}
      <group visible={seg(t, T.finalnya, T.segalanya) > 0.01}>
        {/* Man Utd players */}
        {[0, 1, 2].map((i) => (
          <MosaicFigure key={`mu-${i}`} pos={[-0.3 + i * 0.3, 0, -1.2]} scale={0.7} color={MAN_RED} o={o} />
        ))}
        {/* Bayern players */}
        {[0, 1, 2].map((i) => (
          <MosaicFigure key={`bay-${i}`} pos={[0.6 + i * 0.3, 0, -1.4]} scale={0.7} color={OCHRE} o={o} />
        ))}
      </group>
      {/* Sheringham and Solskjaer */}
      <MosaicFigure pos={[0.2, 0, -0.6]} scale={0.9} color={MAN_RED}
        o={o * seg(t, T.sheringham, T.sheringhamEnd + 1)} />
      <MosaicFigure pos={[0.6, 0, -0.5]} scale={0.9} color={MAN_RED}
        o={o * seg(t, T.solskjaer, T.segalanya)} />
      {/* golden ball for winning goals */}
      <MosaicBall pos={[0.4, 0.06, -0.55]} scale={0.12}
        o={o * seg(t, T.duaGol2, T.segalanya)} />
    </group>
  );
};

const OutroSet: React.FC<{ t: number }> = ({ t }) => {
  const o = seg(t, CUT.outro, CUT.outro + 0.5);
  return (
    <group visible={o > 0.001}>
      {/* overhead reveal — ball + 3 trophies */}
      <MosaicBall pos={[0, 0.06, 0]} scale={0.15} o={o} />
      {[0, 1, 2].map((i) => (
        <MosaicTrophy key={i} pos={[-0.4 + i * 0.4, 0, -0.5]} scale={0.12} o={o} />
      ))}
    </group>
  );
};

// ---------- main scene ----------
export const FilmScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const set = setAt(t);
  return (
    <>
      <CameraRig t={t} frame={frame} />
      <MosaicHall3D t={t} />
      {set === "hook" && <HookSet t={t} />}
      {set === "busbyBabes" && <BusbyBabesSet t={t} />}
      {set === "disaster" && <DisasterSet t={t} />}
      {set === "rebuild" && <RebuildSet t={t} />}
      {set === "treble99" && <Treble99Set t={t} />}
      {set === "outro" && <OutroSet t={t} />}
      <Finish frame={frame} background={ROOM} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.84} envIntensity={0.4} ao />
    </>
  );
};
