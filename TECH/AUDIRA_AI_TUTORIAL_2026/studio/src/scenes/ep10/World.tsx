// EP10 film world: the cover's noir detective office (Cover.tsx) driven by VO seconds.
// Cards leave the open drawer and arc into the HAPUS bin on the spoken delete beats; the wall clock
// spins through "72 JAM"; the camera follows camera.ts. Deterministic: everything comes from t.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { FILMNOIR_PALETTE as NP } from "../../kits/filmnoir/lib/palette.ts";
import {
  BG, BIN, CAB, CAB_Z, CARDS, CLOCK, DRAWER_H, FLOOR_LIGHT, FLOOR_TARGET, FRONT_Z, LAMP_HEAD, OPEN, WIN_LIGHT, WIN_TARGET,
  Blinds, Card, Clerk, DrawerFront, Fedora, Foreground, Lamp, LampBeam, Room, SpotAt, brass, clockTex, plateTex, stampTex, steel,
  type V3,
} from "./Cover.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { camAt } from "./camera.ts";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// ---------------------------------------------------------------- delete beats (VO seconds)
// single item (hook "bersihkan", "Delete activity item"), one day, a range, then "Turn off and delete activity"
const FLY_DUR = 0.95;
export const FLY: { i: number; t: number }[] = (() => {
  const out = [
    { i: 9, t: 8.7 },
    { i: 5, t: 35.15 },
    { i: 3, t: 40.9 },
    { i: 7, t: 43.85 },
  ];
  const rest = [0, 1, 2, 4, 6, 8, 10, 11];
  rest.forEach((i, j) => out.push({ i, t: 53.95 + j * 0.24 }));
  return out; // card 12 stays: the "72 JAM" copy
})();

const TOP_Y = CAB.h - DRAWER_H / 2 - 0.03;
const OPEN_Z = FRONT_Z + OPEN;
const cardHome = (i: number): { p: V3; r: V3 } => {
  const c = CARDS[i];
  return { p: [CAB.x + c.dx, TOP_Y - 0.02 + c.up, OPEN_Z - 0.08 + (c.dz - 0.336) * 0.98], r: [c.tilt, 0, c.dx * 2] };
};

const DrawerCards: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CARDS.map((c, i) => {
      const ev = FLY.find((e) => e.i === i);
      const home = cardHome(i);
      if (!ev || t < ev.t) {
        // a card about to leave lifts a little first
        const lift = ev ? sm((t - (ev.t - 0.5)) / 0.5) * 0.12 : 0;
        return <Card key={i} v={c.v} position={[home.p[0], home.p[1] + lift, home.p[2]]} rotation={home.r} />;
      }
      const k = (t - ev.t) / FLY_DUR;
      if (k >= 1) return null;
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const jx = ((i * 37) % 7) / 7 - 0.5;
      const end: V3 = [BIN[0] + jx * 0.12, 0.42, BIN[2] + jx * 0.06];
      const p: V3 = [
        home.p[0] + (end[0] - home.p[0]) * e,
        home.p[1] + 0.12 + (end[1] - home.p[1] - 0.12) * e + Math.sin(Math.PI * k) * 0.45,
        home.p[2] + (end[2] - home.p[2]) * e,
      ];
      const r: V3 = [home.r[0] - k * 2.2, k * 1.4 * (jx > 0 ? 1 : -1), home.r[2] + k * 1.1];
      return <Card key={i} v={c.v} position={p} rotation={r} scale={1 - 0.35 * e} />;
    })}
  </>
);

const FilmCabinet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh position={[CAB.x, CAB.h / 2, CAB_Z]} castShadow receiveShadow>
      <RoundedBoxGeo args={[CAB.w, CAB.h, CAB.d]} radius={0.02} />
      <meshPhysicalMaterial {...steel} />
    </mesh>
    <mesh position={[CAB.x, TOP_Y, FRONT_Z + 0.001]}>
      <planeGeometry args={[CAB.w - 0.06, DRAWER_H - 0.03]} />
      <meshStandardMaterial color="#030303" roughness={1} />
    </mesh>
    <DrawerFront y={CAB.h - DRAWER_H * 1.5 - 0.05} z={FRONT_Z + 0.018} label="ARSIP" labelKey="arsip" />
    <DrawerFront y={CAB.h - DRAWER_H * 2.5 - 0.07} z={FRONT_Z + 0.018} label="2026" labelKey="y2026" />
    <DrawerFront y={TOP_Y} z={OPEN_Z + 0.018} label="AUDIRA" labelKey="audira" />
    {[-1, 1].map((s) => (
      <mesh key={s} position={[CAB.x + s * (CAB.w / 2 - 0.07), TOP_Y - 0.07, OPEN_Z - 0.38]} castShadow receiveShadow>
        <boxGeometry args={[0.02, 0.28, 0.76]} />
        <meshPhysicalMaterial {...steel} color="#3A3F39" />
      </mesh>
    ))}
    <mesh position={[CAB.x, TOP_Y - 0.2, OPEN_Z - 0.38]} receiveShadow>
      <boxGeometry args={[CAB.w - 0.14, 0.02, 0.76]} />
      <meshPhysicalMaterial {...steel} />
    </mesh>
    <DrawerCards t={t} />
    <Card v={2} position={[CAB.x + 0.12, CAB.h + 0.003, CAB_Z + 0.18]} rotation={[-Math.PI / 2, 0, 0.35]} scale={0.9} />
    <Card v={1} position={[CAB.x + 0.18, CAB.h + 0.008, CAB_Z + 0.24]} rotation={[-Math.PI / 2, 0, -0.18]} scale={0.9} />
  </group>
);

const FilmBin: React.FC = () => {
  const stamp = useMemo(stampTex, []);
  return (
    <group position={BIN}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 48, 1, true]} />
        <meshPhysicalMaterial color="#1D2124" roughness={0.35} metalness={0.7} clearcoat={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.25, 0.012, 12, 64]} />
        <meshStandardMaterial {...brass} color="#8E8A80" />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 40]} />
        <meshStandardMaterial color="#0B0C0D" />
      </mesh>
      <mesh position={[0.04, 0.27, 0.228]} rotation={[0.08, 0.17, 0]}>
        <planeGeometry args={[0.3, 0.14]} />
        <meshStandardMaterial map={stamp} roughness={0.8} />
      </mesh>
      <Card v={3} position={[-0.06, 0.48, -0.05]} rotation={[-0.35, 0.4, 0.3]} scale={0.62} />
      <Card v={0} position={[0.07, 0.46, 0.03]} rotation={[-0.2, -0.5, -0.38]} scale={0.62} />
      <Card v={1} position={[0.0, 0.42, -0.1]} rotation={[0.3, 0.1, 0.12]} scale={0.62} />
    </group>
  );
};

/** Wall clock: hands creep, then race through three days while the VO says "72 jam". */
const FilmClock: React.FC<{ t: number }> = ({ t }) => {
  const face = useMemo(clockTex, []);
  const plate = useMemo(() => plateTex("72jam", "72 JAM", 512, 160, 96), []);
  const race = sm((t - 58.0) / 4.6); // 0..1 over the 72 JAM line
  const hours = 10.2 + t * 0.004 + race * 72;
  const hourA = -(hours / 12) * Math.PI * 2;
  const minA = -(hours % 1) * Math.PI * 2;
  return (
    <group position={CLOCK}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 64]} />
        <meshStandardMaterial {...brass} color="#6B5532" />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <circleGeometry args={[0.195, 64]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <torusGeometry args={[0.205, 0.016, 12, 64]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      <group rotation={[0, 0, hourA]} position={[0, 0, 0.032]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.014, 0.11, 0.004]} />
          <meshStandardMaterial color="#121010" />
        </mesh>
      </group>
      <group rotation={[0, 0, minA]} position={[0, 0, 0.036]}>
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.008, 0.15, 0.004]} />
          <meshStandardMaterial color="#121010" />
        </mesh>
      </group>
      <group rotation={[0, 0, -t * 0.105]} position={[0, 0, 0.04]}>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.003, 0.17, 0.002]} />
          <meshStandardMaterial color="#B0202C" />
        </mesh>
      </group>
      <mesh position={[0, -0.32, 0]}>
        <boxGeometry args={[0.34, 0.106, 0.012]} />
        <meshStandardMaterial attach="material-0" {...brass} />
        <meshStandardMaterial attach="material-1" {...brass} />
        <meshStandardMaterial attach="material-2" {...brass} />
        <meshStandardMaterial attach="material-3" {...brass} />
        <meshStandardMaterial attach="material-4" map={plate} roughness={0.32} metalness={0.75} />
        <meshStandardMaterial attach="material-5" {...brass} />
      </mesh>
    </group>
  );
};

const FilmCamera: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const s = camAt(t);
    c.position.set(...s.pos);
    c.lookAt(...s.target);
    c.fov = s.fov;
    c.near = 0.05;
    c.far = 60;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }, [camera, t]);
  return null;
};

export const WorldScene: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  // the 72 JAM plate gets its own picture light only while the clock shot is on
  const clockLight = sm((t - 56.3) / 0.4) * (1 - sm((t - 63.1) / 0.3));
  return (
    <>
      <color attach="background" args={[BG]} />
      <FilmCamera t={t} />
      <ambientLight intensity={0.05} color="#4A5568" />
      <hemisphereLight args={["#3A4656", "#120E0A", 0.12]} />
      <SpotAt position={WIN_LIGHT} target={WIN_TARGET} intensity={340} color={NP.rimLightCool} angle={0.42} penumbra={0.35} shadow />
      <Blinds />
      <SpotAt position={FLOOR_LIGHT} target={FLOOR_TARGET} intensity={300} color={NP.rimLightCool} angle={0.4} penumbra={0.3} shadow />
      <Blinds light={FLOOR_LIGHT} target={FLOOR_TARGET} />
      <Foreground />
      <SpotAt position={LAMP_HEAD} target={[CAB.x, CAB.h - 0.1, FRONT_Z + OPEN - 0.2]} intensity={9} color={NP.streetLightTungsten} angle={0.75} penumbra={0.6} shadow mapSize={1024} />
      <pointLight position={[LAMP_HEAD[0], LAMP_HEAD[1] - 0.05, LAMP_HEAD[2] + 0.05]} intensity={0.35} color="#FFD98A" distance={2.5} />
      <SpotAt position={[2.6, 3.0, 3.2]} target={[0.6, 0.7, 0.6]} intensity={95} color="#FFD9A0" angle={0.33} penumbra={0.8} shadow mapSize={1024} />
      <directionalLight position={[3, 3.5, -3]} intensity={1.1} color={NP.rimLightCool} />
      <SpotAt position={[-0.2, 1.75, 3.0]} target={[CAB.x, CAB.h - DRAWER_H / 2 + 0.08, FRONT_Z + OPEN]} intensity={45} color="#FFE3A0" angle={0.12} penumbra={0.7} />
      <SpotAt position={[0.4, 1.2, 1.6]} target={[CLOCK[0], CLOCK[1] - 0.12, CLOCK[2]]} intensity={16 + 30 * clockLight} color="#FFE3A0" angle={0.2} penumbra={0.8} />
      <Room />
      <FilmCabinet t={t} />
      <Lamp />
      <LampBeam />
      <FilmBin />
      <FilmClock t={t} />
      <Clerk f={f} />
      <Fedora />
    </>
  );
};
