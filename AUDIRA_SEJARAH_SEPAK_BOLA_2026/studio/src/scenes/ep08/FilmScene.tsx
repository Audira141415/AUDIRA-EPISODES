// EP08 film world (FILMNOIR): the cover stadium (goal, bowl, scoreboard) plus stage props on the pitch
// (standings board, ticket, match clock, three pedestals), a frozen crowd patch, and an interrogation room
// with venetian-blind light. Every motion is a function of the film clock t (seconds, from timeline.json).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { ToyPerson, type Pose, LEG_LENGTH, poseAt } from "../../core/polish/Person.tsx";
import { BALL_POS, BALL_R, Bowl, CAM_POS, CAM_TARGET, Goal, KEEPER_POSE, KEY_POS, Pitch, Scoreboard, matte } from "./Cover.tsx";
import { PAL, ballTexture, glowTexture, hazeTexture, plateTexture } from "./coverTextures.ts";
import {
  beamTexture,
  blindWallTexture,
  boardHeadTexture,
  clothNormalTexture,
  dialTexture,
  floorTexture,
  newspaperTexture,
  numTexture,
  pedestalTexture,
  rowTexture,
  teamPlateTexture,
  ticketTexture,
} from "./filmTextures.ts";
import { CUT, SEC, T, TOTAL, ease, seg } from "./timing.ts";

type V3 = [number, number, number];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------- stage on the pitch: local frame faces the camera (local +x = screen right, +z = toward camera) ----------
const STAGE_Z = 22;
/** Stage-local -> world. */
const S = (x: number, y: number, z: number): V3 => [-x, y, STAGE_Z - z];

export const BRAZIL = { top: "#ECEAE4", bottom: "#E2DFD8" };
export const URUGUAY = { top: "#86C5EA", bottom: "#1b1c1f" };
export const SHIRT_YELLOW = "#F4C430";
export const SHIRT_GREEN = "#1F9A48";

// ---------- camera shots ----------
type Key = { p: V3; l: V3; fov: number };
type Shot = { a: number; b: number; from: Key; to: Key; curve?: (x: number) => number };
const glide = (x: number) => 0.4 * x + 0.6 * (x * x * (3 - 2 * x));
const COVER_KEY: Key = { p: CAM_POS, l: CAM_TARGET, fov: 42 };

const ROOM = {
  chair: [0, 0, 0] as V3,
  shirt: [2.6, 1.62, -3.82] as V3,
  table: [-2.5, 0, -2.2] as V3,
};

export const SHOTS: Shot[] = [
  // HOOK: from the cover pose, crane up over the crossbar to the giant, packed bowl
  { a: 0, b: CUT.board, from: COVER_KEY, to: { p: [9.8, 3.4, -9.8], l: [-5, 6.5, 50], fov: 46 }, curve: (x) => ease(x, 0, 1) * 0.85 + x * 0.15 },
  // KONTEKS: standings board
  { a: CUT.board, b: T.brasil4 - 0.25, from: { p: S(1.6, 1.4, 14.5), l: S(0, 3.25, 0), fov: 42 }, to: { p: S(0.7, 2.2, 12.6), l: S(0, 3.3, 0), fov: 42 } },
  { a: T.brasil4 - 0.25, b: T.menghajar - 0.2, from: { p: S(0.7, 2.2, 12.6), l: S(0, 3.3, 0), fov: 42 }, to: { p: S(-0.5, 3.2, 10.9), l: S(-0.1, 3.55, 0), fov: 42 } },
  { a: T.menghajar - 0.2, b: CUT.ticket, from: { p: S(-0.5, 3.2, 10.9), l: S(-0.1, 3.55, 0), fov: 42 }, to: { p: S(-2.1, 2.1, 12.8), l: S(0, 3.0, 0), fov: 42 } },
  // PENGEMBANGAN: the ticket, then tilt up to the stand
  { a: CUT.ticket, b: T.penonton - 0.2, from: { p: S(1.5, 2.0, 7.2), l: S(0, 2.6, 0), fov: 42 }, to: { p: S(-0.8, 2.6, 6.2), l: S(0, 2.7, 0), fov: 42 } },
  { a: T.penonton - 0.2, b: CUT.clock, from: { p: S(-0.8, 2.6, 6.2), l: S(0, 2.7, 0), fov: 42 }, to: { p: S(0.3, 1.2, 10.5), l: S(0, 12, -70), fov: 46 } },
  // match clock + scorers
  { a: CUT.clock, b: T.friaca - 0.35, from: { p: S(0.8, 2.4, 14.0), l: S(0, 3.4, 0), fov: 42 }, to: { p: S(-1.6, 2.8, 13.8), l: S(-0.5, 3.1, 0), fov: 47 } },
  // scorer shots: camera swings to the scorer's side so parallax stacks the figure in front of the
  // board's own half; the whole score row (both team plates) stays inside the frame
  { a: T.friaca - 0.35, b: T.schiaffino - 0.35, from: { p: S(-1.6, 2.8, 13.8), l: S(-0.5, 3.1, 0), fov: 47 }, to: { p: S(-3.6, 2.7, 13.0), l: S(-0.45, 2.6, 1.2), fov: 48 } },
  { a: T.schiaffino - 0.35, b: T.satuSatu - 0.1, from: { p: S(-3.6, 2.7, 13.0), l: S(-0.45, 2.6, 1.2), fov: 48 }, to: { p: S(3.6, 2.7, 13.0), l: S(0.45, 2.6, 1.2), fov: 48 } },
  { a: T.satuSatu - 0.1, b: CUT.goal, from: { p: S(3.6, 2.7, 13.0), l: S(0.45, 2.6, 1.2), fov: 48 }, to: { p: S(0, 2.4, 13.6), l: S(0, 2.9, 0), fov: 44 } },
  // the 79th minute: tactical overhead, then crane down to the cover angle for "Gol."
  { a: CUT.goal, b: T.menduga + 0.55, from: { p: [3.0, 13, -7.0], l: [5.2, 0, 2.6], fov: 50 }, to: { p: [2.5, 12, -6.6], l: [4.8, 0, 2.4], fov: 50 } },
  { a: T.menduga + 0.55, b: CUT.board2, from: { p: [2.5, 12, -6.6], l: [4.8, 0, 2.4], fov: 50 }, to: { p: [6.4, 0.85, -5.9], l: CAM_TARGET, fov: 42 }, curve: (x) => ease(Math.min(1, x * 1.35), 0, 1) },
  // PENJELASAN: board again (Uruguay 5), frozen crowd, three pedestals
  { a: CUT.board2, b: CUT.silence, from: { p: S(1.8, 2.0, 13.2), l: S(0, 3.3, 0), fov: 42 }, to: { p: S(0.4, 2.8, 11.6), l: S(0, 3.45, 0), fov: 42 } },
  { a: CUT.silence, b: T.ghiggiaQ - 0.05, from: { p: [-38.5, 2.0, 49.0], l: [-63, 6.2, 57.5], fov: 44 }, to: { p: [-42.5, 2.8, 51.0], l: [-63, 6.8, 57.0], fov: 44 } },
  { a: T.ghiggiaQ - 0.05, b: T.sinatra - 0.3, from: { p: S(1.9, 1.75, 4.6), l: S(1.4, 1.55, 0), fov: 42 }, to: { p: S(1.2, 1.9, 5.6), l: S(1.2, 1.5, 0), fov: 42 } },
  { a: T.sinatra - 0.3, b: CUT.room, from: { p: S(1.2, 1.9, 5.6), l: S(1.2, 1.5, 0), fov: 42 }, to: { p: S(0, 1.9, 10.4), l: S(0, 1.2, 0), fov: 47 } },
  // PAYOFF: interrogation room
  { a: CUT.room, b: T.baju - 0.3, from: { p: [0.5, 1.75, 5.6], l: [0, 1.0, 0], fov: 42 }, to: { p: [0.9, 1.4, 3.9], l: [0, 1.05, 0], fov: 42 } },
  { a: T.baju - 0.3, b: T.tahun - 0.25, from: { p: [1.7, 1.75, 0.2], l: [2.6, 1.5, -3.82], fov: 42 }, to: { p: [2.2, 1.65, -0.9], l: [2.6, 1.45, -3.82], fov: 42 } },
  { a: T.tahun - 0.25, b: T.dari - 0.25, from: { p: [-1.3, 2.2, 0.6], l: [-2.5, 0.95, -2.3], fov: 42 }, to: { p: [-2.0, 2.0, 0.2], l: [-2.55, 1.0, -2.3], fov: 42 } },
  { a: T.dari - 0.25, b: SEC.OUTRO[0], from: { p: [2.1, 1.6, -1.0], l: [2.6, 1.5, -3.82], fov: 42 }, to: { p: [2.35, 1.6, -1.6], l: [2.6, 1.52, -3.82], fov: 42 } },
  // OUTRO: slow pull back, the yellow shirt in the light
  { a: SEC.OUTRO[0], b: TOTAL + 0.1, from: { p: [2.35, 1.6, -1.6], l: [2.6, 1.52, -3.82], fov: 42 }, to: { p: [1.9, 1.8, 0.4], l: [2.35, 1.4, -3.4], fov: 42 } },
];

export const camAt = (t: number): Key => {
  const s = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
  const raw = Math.min(1, Math.max(0, (t - s.a) / (s.b - s.a)));
  const k = (s.curve ?? glide)(raw);
  return { p: lerp3(s.from.p, s.to.p, k), l: lerp3(s.from.l, s.to.l, k), fov: lerp(s.from.fov, s.to.fov, k) };
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camAt(t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(c.p[0], c.p[1], c.p[2]);
    cam.fov = c.fov;
    cam.lookAt(c.l[0], c.l[1], c.l[2]);
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ---------- set selection ----------
type SetName = "hook" | "board" | "ticket" | "clock" | "goal" | "silence" | "quote" | "room";
export const setAt = (t: number): SetName => {
  if (t < CUT.board) return "hook";
  if (t < CUT.ticket) return "board";
  if (t < CUT.clock) return "ticket";
  if (t < CUT.goal) return "clock";
  if (t < CUT.board2) return "goal";
  if (t < CUT.silence) return "board";
  if (t < T.ghiggiaQ - 0.05) return "silence";
  if (t < CUT.room) return "quote";
  return "room";
};

const grain = () => surfaceGrain(31, 256, 0.2, 4);
const aim = (p: V3) => (l: THREE.SpotLight) => {
  l.target.position.set(p[0], p[1], p[2]);
  l.target.updateMatrixWorld();
};
const fx = (o: THREE.Object3D) => o.layers.set(FX_LAYER);

/** Camera-facing haze puffs (sprites on the FX layer, so AO/DOF never see them). */
const HazeSprites: React.FC<{ t: number; puffs: [number, number, number, number, number, number][]; tint?: string }> = ({ t, puffs, tint = "#D9D6CF" }) => (
  <group>
    {puffs.map(([x, y, z, w, s, o], k) => (
      <sprite key={k} position={[x + Math.sin(t * 0.13 + k) * 0.8, y + Math.sin(t * 0.09 + k * 2) * 0.3, z]} scale={[w, w * 0.62, 1]} onUpdate={fx}>
        <spriteMaterial map={hazeTexture(s)} transparent opacity={o} depthWrite={false} toneMapped={false} color={tint} />
      </sprite>
    ))}
  </group>
);

const Lamp: React.FC<{ pos: V3; big?: number; small?: number; o?: number }> = ({ pos, big = 30, small = 7, o = 1 }) => (
  <group position={pos}>
    <sprite scale={[big, big, 1]} onUpdate={fx}>
      <spriteMaterial map={glowTexture()} transparent opacity={0.45 * o} depthWrite={false} toneMapped={false} fog={false} color="#FFFDF6" />
    </sprite>
    <sprite scale={[small, small, 1]} onUpdate={fx}>
      <spriteMaterial map={glowTexture()} transparent opacity={o} depthWrite={false} toneMapped={false} fog={false} color="#FFFFFF" />
    </sprite>
  </group>
);

// ---------- stadium base (cover world) ----------
const Stadium: React.FC<{ t: number; wash: number }> = ({ t, wash }) => (
  <>
    <fog attach="fog" args={["#08090b", 60, 260]} />
    <ambientLight intensity={0.05} />
    <hemisphereLight args={["#c9ced6", "#0b0b0c", 0.08]} />
    <directionalLight position={[0, 40, -20]} intensity={0.15 + wash} color="#CFD4DA" />
    <Bowl />
    <Scoreboard />
    <Pitch />
    <Goal />
    <Lamp pos={KEY_POS} />
    <Lamp pos={[58, 13, 70]} big={22} small={5} o={0.75} />
    <HazeSprites
      t={t}
      puffs={[
        [-10, 6, 26, 40, 12, 0.08],
        [-38, 9, 52, 40, 16, 0.12],
        [-56, 11, 62, 26, 21, 0.28],
        [30, 10, 60, 40, 14, 0.1],
        [0, 14, 90, 70, 9, 0.12],
      ]}
    />
  </>
);

// ---------- standings board ----------
const ROWS = [
  { name: "BRASIL", pts: "4" },
  { name: "URUGUAY", pts: "3" },
  { name: "SPANYOL", pts: "1" },
  { name: "SWEDIA", pts: "0" },
];
const ROW_Y = [0.72, 0.1, -0.52, -1.14];

const Tile: React.FC<{ n: string; size?: number; flip?: number; next?: string }> = ({ n, size = 0.5, flip = 0, next }) => {
  // flip: 0 shows n, 1 shows next (rotates around X through edge-on at 0.5)
  const show = flip < 0.5 ? n : next ?? n;
  const rot = flip < 0.5 ? flip * Math.PI : (flip - 1) * Math.PI;
  return (
    <group rotation={[rot, 0, 0]}>
      <mesh position={[0, 0, -0.04]}>
        <RoundedBoxGeo args={[size + 0.06, size + 0.06, 0.06]} radius={0.015} segments={2} />
        <meshStandardMaterial color="#1a1b1e" roughness={0.6} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={numTexture(show)} roughness={0.55} roughnessMap={grain()} />
      </mesh>
    </group>
  );
};

const Board: React.FC<{ t: number; second: boolean }> = ({ t, second }) => {
  const swap = second ? ease(t, T.uruMenang + 0.35, T.uruMenang + 1.25) : 0;
  const uruFlip = second ? seg(t, T.uruMenang + 0.1, T.uruMenang + 0.5) : 0;
  const hl = (i: number) => {
    if (second) return i === 1 ? seg(t, T.uruMenang, T.uruMenang + 0.3) : 0;
    if (i === 0) return seg(t, T.brasil4 - 0.1, T.brasil4 + 0.2) * (1 - seg(t, T.uruguay3 - 0.1, T.uruguay3 + 0.2) * 0.6);
    if (i === 1) return seg(t, T.uruguay3 - 0.1, T.uruguay3 + 0.2);
    return 0;
  };
  return (
    <group position={S(0, 3.3, 0)} rotation={[0, Math.PI, 0]}>
      {/* backing */}
      <mesh position={[0, 0, -0.14]} castShadow receiveShadow>
        <RoundedBoxGeo args={[4.5, 3.75, 0.18]} radius={0.04} segments={3} />
        <meshStandardMaterial color="#26272b" roughness={0.7} roughnessMap={grain()} />
      </mesh>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[4.3, 3.55]} />
        <meshStandardMaterial color="#0f1012" roughness={0.9} />
      </mesh>
      {/* header */}
      <mesh position={[0, 1.38, 0]}>
        <planeGeometry args={[4.1, 0.62]} />
        <meshStandardMaterial map={boardHeadTexture()} roughness={0.7} />
      </mesh>
      {ROWS.map((r, i) => {
        const flipIn = second ? 1 : seg(t, T.grup + i * 0.16, T.grup + 0.45 + i * 0.16);
        let y = ROW_Y[i];
        let z = 0;
        if (i === 0) y = lerp(ROW_Y[0], ROW_Y[1], swap);
        if (i === 1) {
          y = lerp(ROW_Y[1], ROW_Y[0], swap);
          z = Math.sin(swap * Math.PI) * 0.35;
        }
        const h = hl(i);
        return (
          <group key={r.name} position={[0, y, z]} rotation={[(1 - flipIn) * (Math.PI / 2), 0, 0]}>
            <mesh position={[-0.5, 0, 0]}>
              <planeGeometry args={[2.9, 0.52]} />
              <meshStandardMaterial map={rowTexture(r.name)} roughness={0.6} emissive="#ffffff" emissiveMap={rowTexture(r.name)} emissiveIntensity={0.02 + h * 0.1} />
            </mesh>
            {/* active-row lamp: green bar */}
            <mesh position={[-2.03, 0, 0.01]}>
              <planeGeometry args={[0.1, 0.5]} />
              <meshBasicMaterial color={PAL.pitch} transparent opacity={h} toneMapped={false} />
            </mesh>
            <group position={[1.5, 0, 0.02]}>
              <Tile n={r.pts} flip={i === 1 ? uruFlip : 0} next="5" />
            </group>
          </group>
        );
      })}
      {/* AUDIRA maker plate */}
      <mesh position={[0, -1.63, 0.01]}>
        <planeGeometry args={[1.25, 0.31]} />
        <meshStandardMaterial map={plateTexture()} roughness={0.5} />
      </mesh>
      {/* legs */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, -2.6, -0.14]} castShadow>
          <boxGeometry args={[0.16, 1.9, 0.16]} />
          <meshStandardMaterial color="#1c1d20" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- the ticket + paper rain ----------
const TicketRain: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const N = 110;
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    let s = 911;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: N }, () => [r() * 7 - 3.5, r() * 6, r() * 5 - 3.5, r() * 6.28, 0.35 + r() * 0.4, r()]);
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    seeds.forEach(([x, y0, z, ph, sp, k], i) => {
      const y = 6.5 - ((y0 + t * sp) % 6.5);
      d.position.set(x + Math.sin(t * 0.8 + ph) * 0.25, y, z);
      d.rotation.set(Math.sin(t * 1.3 + ph) * 1.2, t * (0.6 + k) + ph, Math.cos(t * 1.1 + ph) * 0.9);
      d.scale.setScalar(0.8 + k * 0.4);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, seeds]);
  return (
    <group position={S(0, 0, 0)} rotation={[0, Math.PI, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
        <planeGeometry args={[0.36, 0.16]} />
        <meshStandardMaterial map={ticketTexture()} side={THREE.DoubleSide} roughness={0.8} transparent opacity={o} />
      </instancedMesh>
    </group>
  );
};

const Ticket: React.FC<{ t: number }> = ({ t }) => {
  const k = t - CUT.ticket;
  const intro = ease(t, CUT.ticket, CUT.ticket + 1.2);
  return (
    <group position={S(0, 2.7, 0)} rotation={[0, Math.PI, 0]}>
      <group rotation={[0.12 + Math.sin(k * 0.5) * 0.05, -0.35 + intro * 0.35 + Math.sin(k * 0.35) * 0.18, -0.08 + Math.sin(k * 0.4) * 0.04]} position={[0, (1 - intro) * -0.6, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[2.5, 1.1, 0.02]} radius={0.008} segments={2} />
          <meshStandardMaterial color="#d6cfbf" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[2.46, 1.07]} />
          <meshStandardMaterial map={ticketTexture()} roughness={0.8} roughnessMap={grain()} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- match clock + score ----------
const minuteAt = (t: number) => {
  let m = 0;
  m = lerp(m, 45, ease(t, T.babak + 0.1, T.nol + 0.3));
  m = lerp(m, 47, ease(t, T.m47, T.m47 + 0.7));
  m = lerp(m, 66, ease(t, T.m66, T.m66 + 0.7));
  m = lerp(m, 79, ease(t, T.lalu - 0.5, T.lalu + 0.2));
  return m;
};
export const MINUTE = minuteAt;

const ClockBoard: React.FC<{ t: number }> = ({ t }) => {
  const m = minuteAt(t);
  const a = -(m / 90) * Math.PI * 2;
  const br = seg(t, T.friaca, T.friaca + 0.4);
  const ur = seg(t, T.schiaffino, T.schiaffino + 0.4);
  return (
    <group position={S(0, 3.4, 0)} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, -0.14]} castShadow receiveShadow>
        <RoundedBoxGeo args={[4.6, 3.9, 0.18]} radius={0.04} segments={3} />
        <meshStandardMaterial color="#26272b" roughness={0.7} roughnessMap={grain()} />
      </mesh>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[4.4, 3.7]} />
        <meshStandardMaterial color="#0f1012" roughness={0.9} />
      </mesh>
      {/* dial */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <circleGeometry args={[1.1, 96]} />
          <meshStandardMaterial map={dialTexture()} roughness={0.55} roughnessMap={grain()} />
        </mesh>
        {/* played arc (green) */}
        <mesh position={[0, 0, 0.005]} rotation={[0, 0, Math.PI / 2 + a]}>
          <ringGeometry args={[0.98, 1.06, 96, 1, 0, Math.max(0.0001, -a)]} />
          <meshBasicMaterial color={PAL.pitch} toneMapped={false} />
        </mesh>
        <group rotation={[0, 0, a]} position={[0, 0, 0.03]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <RoundedBoxGeo args={[0.07, 0.9, 0.03]} radius={0.012} segments={2} />
            <meshStandardMaterial color="#121214" roughness={0.4} metalness={0.4} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 24]} />
          <meshStandardMaterial color="#121214" metalness={0.5} roughness={0.35} />
        </mesh>
      </group>
      {/* score row */}
      <group position={[0, -1.15, 0]}>
        <mesh position={[-1.45, 0, 0]}>
          <planeGeometry args={[1.3, 0.42]} />
          <meshStandardMaterial map={teamPlateTexture("BRASIL")} roughness={0.6} />
        </mesh>
        <group position={[-0.42, 0, 0.02]}>
          <Tile n="0" next="1" flip={br} size={0.56} />
        </group>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.16, 0.05]} />
          <meshStandardMaterial color="#d9d5cc" />
        </mesh>
        <group position={[0.42, 0, 0.02]}>
          <Tile n="0" next="1" flip={ur} size={0.56} />
        </group>
        <mesh position={[1.45, 0, 0]}>
          <planeGeometry args={[1.3, 0.42]} />
          <meshStandardMaterial map={teamPlateTexture("URUGUAY")} roughness={0.6} />
        </mesh>
      </group>
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, -2.55, -0.14]} castShadow>
          <boxGeometry args={[0.16, 1.4, 0.16]} />
          <meshStandardMaterial color="#1c1d20" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

/** A player figure rising onto the light (scorer), stage-local x. */
const Scorer: React.FC<{ t: number; at: number; x: number; kit: { top: string; bottom: string }; seed: number; skin: string }> = ({ t, at, x, kit, seed, skin }) => {
  const k = ease(t, at - 0.15, at + 0.45);
  if (k <= 0.001) return null;
  const f = t * 60;
  const p = S(x, 0, 3.6);
  return (
    <group>
      <ToyPerson
        f={f}
        seed={seed}
        pose={t > at + 0.5 ? "cheer" : "stand"}
        position={[p[0], (k - 1) * 1.2, p[2]]}
        heading={Math.PI + (x > 0 ? -0.35 : 0.35)}
        scale={2.0}
        look={{ skin, hair: "#141210", hairStyle: 0, top: kit.top, bottom: kit.bottom, outfit: "casual", build: 1.04, height: 1 }}
      />
      <GroundShadow x={p[0]} z={p[2]} y={0.004} scale={2.2} opacity={0.55 * k} blur={2} far={2} />
      <spotLight position={S(x * 0.6, 6.5, 6.5)} onUpdate={aim(S(x, 1.0, 3.6))} intensity={420 * k} angle={0.28} penumbra={0.6} decay={2} color="#FFF4E2" />
    </group>
  );
};

// ---------- the 79th minute ----------
const runPose = (f: number, seed: number, amp = 1): Pose => {
  const p = poseAt("walk", f * 1.7, seed);
  const s = (v: [number, number, number]): [number, number, number] => [v[0] * 1.5 * amp, v[1], v[2]];
  return { ...p, body: [0.18 * amp, 0, 0], ls: s(p.ls), rs: s(p.rs), lh: s(p.lh), rh: s(p.rh), lk: p.lk * 1.4, rk: p.rk * 1.4 };
};
const KICK: Pose = {
  body: [0.12, 0, 0.1],
  lift: LEG_LENGTH - 0.02,
  spine: [0.15, -0.3, 0],
  head: [0.35, 0, 0],
  ls: [-0.6, 0, 0.7],
  le: -0.4,
  rs: [0.5, 0, -0.6],
  re: -0.3,
  lh: [0.15, 0, 0.04],
  lk: 0.25,
  rh: [-0.95, 0, -0.04],
  rk: 0.15,
};
const DIVE: Pose = {
  body: [0.1, 0, -1.25],
  lift: 0.32,
  spine: [0, 0, 0],
  head: [0, 0, 0.2],
  ls: [-0.2, 0, 2.6],
  le: -0.1,
  rs: [-0.2, 0, -2.6],
  re: -0.1,
  lh: [0, 0, 0.2],
  lk: 0.3,
  rh: [0, 0, -0.1],
  rk: 0.2,
};
const READY: Pose = {
  ...KEEPER_POSE,
  lift: LEG_LENGTH - 0.05,
  spine: [0.3, 0, 0],
  head: [-0.15, 0, 0],
  ls: [-0.3, 0, 0.6],
  le: -0.5,
  rs: [-0.3, 0, -0.6],
  re: -0.5,
  lh: [-0.1, 0, 0.18],
  lk: 0.3,
  rh: [-0.1, 0, -0.18],
  rk: 0.3,
};
const SHOT_FROM: V3 = [8.15, BALL_R, 3.35];
const SHOT_MID: V3 = [3.5, 0.22, -0.08];

export const goalState = (t: number) => {
  // Ghiggia: run in, shoot, wheel away
  const run = ease(t, CUT.goal - 0.3, T.menembak - 0.05);
  const gPos = lerp3([12.6, 0, 13.4], [8.55, 0, 3.75], run);
  const after = ease(t, T.menembak + 0.5, T.menembak + 2.5);
  const g2 = lerp3(gPos, [9.6, 0, 6.8], after);
  // ball
  const flight = seg(t, T.menembak + 0.05, T.tiang + 0.15);
  const roll = seg(t, T.tiang + 0.15, T.tiang + 0.65);
  let ball: V3;
  if (t < T.menembak + 0.05) ball = [gPos[0] - 0.32, BALL_R, gPos[2] - 0.22];
  else if (flight < 1) ball = lerp3(SHOT_FROM, SHOT_MID, flight);
  else ball = lerp3(SHOT_MID, BALL_POS, roll);
  // keeper: guards the near post, shifts toward the middle expecting a cross, dives late
  const shift = ease(t, T.menembak - 0.9, T.menembak - 0.05);
  const dive = ease(t, T.menembak + 0.25, T.menembak + 0.75);
  const kPos = lerp3(lerp3([2.75, 0, 0.75], [1.25, 0, 1.55], shift), [2.15, 0, 1.0], dive);
  return { gPos: g2, gRun: run < 1, ball, kPos, dive, shift, flight };
};

const Line: React.FC<{ a: V3; b: V3; w?: number; color: string; o: number; dashed?: boolean; grow?: number }> = ({ a, b, w = 0.14, color, o, dashed, grow = 1 }) => {
  if (o <= 0.001) return null;
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dz) * grow;
  const ang = Math.atan2(dx, dz);
  const n = dashed ? Math.max(1, Math.floor(len / 0.6)) : 1;
  return (
    <group position={[a[0], 0.03, a[2]]} rotation={[0, ang, 0]}>
      {Array.from({ length: n }, (_, i) => {
        const segLen = dashed ? 0.34 : len;
        const z = dashed ? i * 0.6 + 0.17 : len / 2;
        return (
          <mesh key={i} position={[0, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w, segLen]} />
            <meshBasicMaterial color={color} transparent opacity={o} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
      {/* arrow head */}
      <mesh position={[0, 0, len]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[w * 2.2, 3, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={o} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};

const GoalPlay: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const s = goalState(t);
  const gHeading = s.gRun ? Math.atan2(8.55 - 12.6, 3.75 - 13.4) : t < T.menembak + 0.5 ? Math.atan2(SHOT_MID[0] - 8.55, SHOT_MID[2] - 3.75) : 0.6;
  const gPose: Pose = s.gRun ? runPose(f, 3) : t < T.menembak + 0.55 ? KICK : poseAt("cheer", f, 3);
  const kHeading = 0.25 + s.shift * -0.2;
  const kPose: Pose = s.dive > 0.05 ? { ...READY, ...DIVE, body: [0.1, 0, -1.25 * s.dive], lift: lerp(READY.lift, 0.32, s.dive) } : READY;
  // a teammate in the middle (the expected cross) and two Brazil defenders
  const mate = lerp3([2.6, 0, 11.2], [1.5, 0, 7.6], ease(t, CUT.goal, T.menembak));
  const def1 = lerp3([3.6, 0, 9.6], [2.5, 0, 6.6], ease(t, CUT.goal, T.menembak));
  const def2 = lerp3([11.0, 0, 9.0], [9.5, 0, 5.0], ease(t, CUT.goal, T.menembak + 0.4));
  const ballRot = (t - T.menembak) * 18;
  const cross = seg(t, T.kiper - 0.1, T.kiper + 0.5);
  const lineOut = 1 - seg(t, T.menduga + 0.6, T.menduga + 1.0);
  return (
    <group>
      <ToyPerson f={f} seed={3} poseOverride={gPose} position={s.gPos} heading={gHeading} scale={2.0} look={{ skin: "#c8956b", hair: "#1a1410", hairStyle: 0, top: URUGUAY.top, bottom: URUGUAY.bottom, outfit: "casual", build: 1.0, height: 1 }} />
      <ToyPerson f={f} seed={8} poseOverride={kPose} position={s.kPos} heading={kHeading} scale={2.05} look={{ skin: "#8a5e3f", hair: "#121214", hairStyle: 0, top: "#D9D5CD", bottom: "#B3AFA8", outfit: "casual", build: 1.06, height: 1 }} />
      <ToyPerson f={f} seed={11} poseOverride={runPose(f, 11, 0.6)} position={mate} heading={Math.PI + 0.2} scale={2.0} look={{ skin: "#d8a77c", hair: "#2a1c14", hairStyle: 0, top: URUGUAY.top, bottom: URUGUAY.bottom, outfit: "casual", build: 1.0, height: 1 }} />
      <ToyPerson f={f} seed={12} poseOverride={runPose(f, 12, 0.6)} position={def1} heading={Math.PI - 0.3} scale={2.0} look={{ skin: "#9b6b48", hair: "#141210", hairStyle: 0, top: BRAZIL.top, bottom: BRAZIL.bottom, outfit: "casual", build: 1.05, height: 1 }} />
      <ToyPerson f={f} seed={14} poseOverride={runPose(f, 14, 0.8)} position={def2} heading={Math.PI + 0.4} scale={2.0} look={{ skin: "#c48a60", hair: "#141210", hairStyle: 0, top: BRAZIL.top, bottom: BRAZIL.bottom, outfit: "casual", build: 1.02, height: 1 }} />
      <mesh castShadow position={s.ball} rotation={[ballRot, ballRot * 0.3, 0]}>
        <sphereGeometry args={[BALL_R, 64, 48]} />
        <meshPhysicalMaterial map={ballTexture()} roughness={0.55} roughnessMap={grain()} clearcoat={0.25} clearcoatRoughness={0.5} />
      </mesh>
      {[s.gPos, s.kPos, mate, def1, def2].map((p, i) => (
        <GroundShadow key={i} x={p[0]} z={p[2]} y={0.005} scale={2.2} opacity={0.55} blur={2} far={2} />
      ))}
      {/* diagram on the turf: actual shot (green), expected cross (grey dashed), keeper's shift (white) */}
      <Line a={SHOT_FROM} b={SHOT_MID} color={PAL.pitch} w={0.16} o={seg(t, T.menembak + 0.05, T.menembak + 0.3) * lineOut} grow={seg(t, T.menembak, T.tiang + 0.1)} />
      <Line a={SHOT_FROM} b={[1.6, 0, 7.4]} color="#E8E4DA" w={0.13} dashed o={cross * 0.9 * lineOut} grow={cross} />
      <Line a={[2.75, 0, 0.75]} b={[1.4, 0, 1.45]} color="#E8E4DA" w={0.1} o={seg(t, T.kiper, T.kiper + 0.4) * lineOut} />
      {/* overhead key so the play reads */}
      <spotLight position={[5, 16, 4]} onUpdate={aim([4.6, 0, 5.2])} intensity={2600} angle={0.62} penumbra={0.8} decay={2} color="#F6F1E6" />
    </group>
  );
};

// ---------- frozen crowd patch (close to camera in the silence shot) ----------
const CrowdPatch: React.FC = () => {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const hats = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => {
    let s = 4242;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const out: { p: V3; ry: number; shirt: number; hat: boolean; sc: number }[] = [];
    for (let row = 0; row < 11; row++) {
      const y = 0.6 + (row + 0.5) * 1.04;
      const rad = 60 + (row + 0.5) * 1.09;
      const step = 0.62 / rad;
      for (let th = -Math.PI / 2 - 0.42; th < -Math.PI / 2 + 0.42; th += step) {
        const a = th + (r() - 0.5) * step * 0.4;
        out.push({ p: [Math.sin(a) * rad, y, 56 + Math.cos(a) * rad], ry: a, shirt: r(), hat: r() < 0.45, sc: 0.92 + r() * 0.16 });
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    spots.forEach((sp, i) => {
      const toC = Math.atan2(-sp.p[0], 56 - sp.p[2]);
      d.rotation.set(0, toC, 0);
      d.scale.setScalar(sp.sc);
      d.position.set(sp.p[0], sp.p[1] + 0.42 * sp.sc, sp.p[2]);
      d.updateMatrix();
      bodies.current?.setMatrixAt(i, d.matrix);
      const v = sp.shirt < 0.4 ? 0.62 + sp.shirt * 0.4 : 0.08 + sp.shirt * 0.16;
      bodies.current?.setColorAt(i, c.setRGB(v, v, v * 0.97));
      d.position.set(sp.p[0], sp.p[1] + 0.9 * sp.sc, sp.p[2]);
      d.updateMatrix();
      heads.current?.setMatrixAt(i, d.matrix);
      d.position.set(sp.p[0], sp.p[1] + (sp.hat ? 1.02 : -5) * sp.sc, sp.p[2]);
      d.updateMatrix();
      hats.current?.setMatrixAt(i, d.matrix);
    });
    [bodies, heads, hats].forEach((m) => {
      if (!m.current) return;
      m.current.instanceMatrix.needsUpdate = true;
      if (m.current.instanceColor) m.current.instanceColor.needsUpdate = true;
    });
  }, [spots]);
  const n = spots.length;
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, n]} frustumCulled={false}>
        <capsuleGeometry args={[0.22, 0.42, 4, 10]} />
        <meshLambertMaterial color="#ffffff" />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, n]} frustumCulled={false}>
        <sphereGeometry args={[0.13, 14, 10]} />
        <meshLambertMaterial color="#6d655d" />
      </instancedMesh>
      <instancedMesh ref={hats} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        <meshLambertMaterial color="#1b1c1f" />
      </instancedMesh>
    </group>
  );
};

// ---------- three pedestals (Sinatra, the Pope, Ghiggia) ----------
const Pedestal: React.FC<{ x: number; name: string; lit: number; children?: React.ReactNode }> = ({ x, name, lit, children }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.95, 0.9, 0.95]} radius={0.03} segments={3} />
      <meshStandardMaterial color="#4a4743" roughness={0.75} roughnessMap={grain()} />
    </mesh>
    <mesh position={[0, 0.5, 0.48]}>
      <planeGeometry args={[0.8, 0.25]} />
      <meshStandardMaterial map={pedestalTexture(name)} roughness={0.5} emissive="#ffffff" emissiveMap={pedestalTexture(name)} emissiveIntensity={0.04 + lit * 0.12} />
    </mesh>
    <group position={[0, 0.9, 0]}>{children}</group>
    {/* beam cone from above */}
    <sprite position={[0, 2.6, 0.1]} scale={[1.5, 3.6, 1]} onUpdate={fx}>
      <spriteMaterial map={beamTexture()} transparent opacity={0.22 * lit} depthWrite={false} toneMapped={false} color="#F4EEE2" />
    </sprite>
  </group>
);

const Microphone: React.FC = () => (
  <group>
    <mesh position={[0, 0.03, 0]}>
      <cylinderGeometry args={[0.16, 0.18, 0.05, 32]} />
      <meshStandardMaterial color="#1b1c1f" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.65, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 1.25, 12]} />
      <meshStandardMaterial color="#c9c6bf" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.36, 0]} rotation={[0.3, 0, 0]}>
      <capsuleGeometry args={[0.07, 0.13, 6, 16]} />
      <meshStandardMaterial color="#d8d5ce" metalness={0.85} roughness={0.25} />
    </mesh>
  </group>
);

const Quote: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const lg = seg(t, T.ghiggiaQ - 0.2, T.ghiggiaQ + 0.3);
  const ls = seg(t, T.sinatra - 0.1, T.sinatra + 0.25);
  const lp = seg(t, T.paus - 0.1, T.paus + 0.25);
  const lg2 = seg(t, T.dirinya - 0.1, T.dirinya + 0.3);
  const lights: [number, number][] = [
    [-1.35, ls],
    [0, lp],
    [1.35, Math.max(lg * (1 - ls * 0.5), lg2)],
  ];
  return (
    <group>
      <group position={S(0, 0, 0)} rotation={[0, Math.PI, 0]}>
        <Pedestal x={-1.35} name="SINATRA" lit={ls}>
          <Microphone />
        </Pedestal>
        <Pedestal x={0} name="PAUS" lit={lp}>
          <ToyPerson f={f} seed={21} pose="stand" scale={1.7} look={{ skin: "#d9b08c", hair: "#d9c9b3", hairStyle: 3, top: "#EDEBE6", bottom: "#EDEBE6", outfit: "casual", build: 1.1, height: 1 }} />
        </Pedestal>
        <Pedestal x={1.35} name="GHIGGIA" lit={lights[2][1]}>
          <ToyPerson f={f} seed={3} pose="stand" scale={1.7} look={{ skin: "#c8956b", hair: "#1a1410", hairStyle: 0, top: URUGUAY.top, bottom: URUGUAY.bottom, outfit: "casual", build: 1.0, height: 1 }} />
        </Pedestal>
      </group>
      {lights.map(([x, k], i) => (
        <spotLight key={i} position={S(x * 0.8, 6.2, 2.8)} onUpdate={aim(S(x, 1.4, 0))} intensity={40 + 620 * k} angle={0.2} penumbra={0.55} decay={2} color="#FFF3DF" castShadow={i === 2} />
      ))}
    </group>
  );
};

// ---------- interrogation room ----------
const Shirt: React.FC<{ k: number }> = ({ k }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.11, 0.3);
    s.lineTo(-0.3, 0.24);
    s.lineTo(-0.44, 0.06);
    s.lineTo(-0.34, -0.03);
    s.lineTo(-0.24, 0.06);
    // soft, uneven hem: cloth sags between folds instead of a ruler-straight edge
    s.lineTo(-0.25, -0.43);
    s.quadraticCurveTo(-0.16, -0.405, -0.08, -0.435);
    s.quadraticCurveTo(0.0, -0.45, 0.07, -0.425);
    s.quadraticCurveTo(0.16, -0.41, 0.25, -0.435);
    s.lineTo(0.235, 0.06);
    s.lineTo(0.34, -0.03);
    s.lineTo(0.44, 0.06);
    s.lineTo(0.3, 0.24);
    s.lineTo(0.11, 0.3);
    s.quadraticCurveTo(0, 0.2, -0.11, 0.3);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 12 });
    g.translate(0, 0, -0.015);
    // hang the cloth: the body bows forward around an imagined torso (smooth in x only, so the
    // large cap triangles stay seamless)
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, p.getZ(i) + 0.09 * (1 - (x / 0.44) ** 2));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const body = new THREE.Color("#E6E3DC").lerp(new THREE.Color(SHIRT_YELLOW), k);
  const collar = new THREE.Color("#2E4A7A").lerp(new THREE.Color(SHIRT_GREEN), k);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={body}
          roughness={0.9}
          roughnessMap={grain()}
          normalMap={clothNormalTexture()}
          normalScale={new THREE.Vector2(1.4, 1.4)}
          sheen={0.5}
          sheenRoughness={0.6}
          sheenColor={new THREE.Color(body).lerp(new THREE.Color("#ffffff"), 0.15)}
          emissive={SHIRT_YELLOW}
          emissiveIntensity={k * 0.06}
        />
      </mesh>
      <mesh position={[0, 0.27, 0.125]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.115, 0.022, 10, 32, Math.PI]} />
        <meshStandardMaterial color={collar} roughness={0.7} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.39, 0.015, 0.06]} rotation={[0, 0, sx * -0.75]}>
          <boxGeometry args={[0.15, 0.035, 0.012]} />
          <meshStandardMaterial color={collar} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

const Room: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const swing = Math.sin(t * 1.05) * 0.07;
  const colourK = ease(t, T.dari - 0.05, T.kuning + 0.25);
  const lampOn = 1;
  const shirtKey = 0.6 + seg(t, T.baju - 0.3, T.baju + 0.3) * 0.6 + colourK * 0.5;
  const floor = useMemo(() => {
    const tx = floorTexture().clone();
    tx.needsUpdate = true;
    tx.repeat.set(4, 4);
    return tx;
  }, []);
  return (
    <>
      <fog attach="fog" args={["#0a0909", 9, 26]} />
      <hemisphereLight args={["#d7d2c8", "#1a1612", 0.55]} />
      <ambientLight intensity={0.05} />
      {/* warm wall fill from above the camera */}
      <spotLight position={[0, 4.2, 6]} onUpdate={aim([0, 1.2, -3.5])} intensity={60} angle={0.75} penumbra={1} decay={2} color="#EBDCC4" />
      {/* the interrogation lamp, swinging */}
      <group position={[0, 2.85, 0.1]} rotation={[0, 0, swing]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 1.0, 6]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.32, 0.26, 32, 1, true]} />
          <meshStandardMaterial color="#2b2d30" metalness={0.6} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <sprite position={[0, -0.12, 0]} scale={[0.8, 0.8, 1]} onUpdate={fx}>
          <spriteMaterial map={glowTexture()} transparent opacity={0.95 * lampOn} depthWrite={false} toneMapped={false} color="#FFF6E2" />
        </sprite>
        <sprite position={[0, -1.25, 0]} scale={[1.9, 2.4, 1]} onUpdate={fx}>
          <spriteMaterial map={beamTexture()} transparent opacity={0.16} depthWrite={false} toneMapped={false} color="#F6EEDC" />
        </sprite>
      </group>
      <spotLight
        position={[Math.sin(swing) * -2.7, 2.72, 0.1]}
        onUpdate={aim([0, 0.6, 0.15])}
        intensity={46}
        angle={0.55}
        penumbra={0.5}
        decay={2}
        color="#FFF2DA"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
      {/* cold rim behind the chair */}
      <spotLight position={[-2.2, 2.6, -2.6]} onUpdate={aim([0, 1.1, 0])} intensity={22} angle={0.45} penumbra={0.8} decay={2} color="#A9C2DC" />
      {/* key on the shirt and on the drawing table */}
      <spotLight position={[1.4, 3.2, -0.8]} onUpdate={aim(ROOM.shirt)} intensity={14 * shirtKey} angle={0.42} penumbra={0.7} decay={2} color={colourK > 0.3 ? "#FFF1D0" : "#F3ECE0"} castShadow />
      <spotLight position={[-1.6, 2.6, -0.6]} onUpdate={aim([-2.5, 0.95, -2.3])} intensity={20} angle={0.5} penumbra={0.7} decay={2} color="#FFEBCB" />
      {/* walls + floor */}
      <mesh position={[0, 2.2, -4]} receiveShadow>
        <planeGeometry args={[11, 4.4]} />
        <meshLambertMaterial map={blindWallTexture()} emissive="#ffffff" emissiveMap={blindWallTexture()} emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[-5, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4.4]} />
        <meshLambertMaterial color="#3d3935" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshLambertMaterial map={floor} />
      </mesh>
      {/* chair */}
      <group position={ROOM.chair}>
        <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.5, 0.05, 0.48]} radius={0.01} segments={2} />
          <meshStandardMaterial color="#3a2f26" roughness={0.6} roughnessMap={grain()} />
        </mesh>
        <mesh position={[0, 0.85, -0.23]} castShadow>
          <RoundedBoxGeo args={[0.5, 0.7, 0.04]} radius={0.01} segments={2} />
          <meshStandardMaterial color="#3a2f26" roughness={0.6} />
        </mesh>
        {[-0.22, 0.22].flatMap((x) =>
          [-0.21, 0.21].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.23, z]} castShadow>
              <boxGeometry args={[0.04, 0.46, 0.04]} />
              <meshStandardMaterial color="#2a221c" />
            </mesh>
          )),
        )}
      </group>
      {/* the keeper, head down (generic figure, Brazil 1950 white) */}
      <ToyPerson
        f={f}
        seed={8}
        poseOverride={{ ...poseAt("sit", 0, 8), spine: [0.32, 0, 0], head: [0.55, 0.1, 0], ls: [0.1, 0, 0.12], le: -1.2, rs: [0.1, 0, -0.12], re: -1.2, lk: 1.45, rk: 1.45 }}
        position={[0, 0.5, 0.02]}
        heading={0}
        scale={2.0}
        look={{ skin: "#8a5e3f", hair: "#121214", hairStyle: 0, top: "#D9D5CD", bottom: "#B3AFA8", outfit: "casual", build: 1.06, height: 1 }}
      />
      {/* the 1950 ball on the floor in the lamp pool */}
      <mesh castShadow position={[0.62, 0.12, 0.55]} rotation={[0.3, 1.2, 0.1]}>
        <sphereGeometry args={[0.12, 64, 48]} />
        <meshPhysicalMaterial map={ballTexture()} roughness={0.55} roughnessMap={grain()} clearcoat={0.25} />
      </mesh>
      <GroundShadow x={0} z={0} y={0.004} scale={1.6} opacity={0.6} blur={2} far={1.5} />
      {/* shirt on a hanger, AUDIRA plate below */}
      <group position={ROOM.shirt}>
        <mesh position={[0, 0.42, 0.02]}>
          <torusGeometry args={[0.04, 0.008, 8, 20, Math.PI * 1.4]} />
          <meshStandardMaterial color="#b7b3ab" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.3, 0.03]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.78, 0.018, 0.018]} />
          <meshStandardMaterial color="#5a4636" roughness={0.6} />
        </mesh>
        <group position={[0, 0.02, 0.05]}>
          <Shirt k={colourK} />
        </group>
        <mesh position={[0, -0.6, 0.01]}>
          <planeGeometry args={[0.5, 0.125]} />
          <meshStandardMaterial map={plateTexture()} roughness={0.5} />
        </mesh>
      </group>
      {/* drawing table with the 1953 newspaper and the teenage designer */}
      <group position={ROOM.table}>
        <mesh position={[0, 0.76, 0]} rotation={[0.42, 0, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.3, 0.04, 0.85]} radius={0.01} segments={2} />
          <meshStandardMaterial color="#4a3a2c" roughness={0.6} roughnessMap={grain()} />
        </mesh>
        <mesh position={[0, 0.79, 0.01]} rotation={[0.42 - Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial map={newspaperTexture()} roughness={0.85} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.36, 0]} castShadow>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
            <meshStandardMaterial color="#2a221c" />
          </mesh>
        ))}
        <mesh position={[0.4, 0.86, 0.12]} rotation={[0.42, 0.6, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
          <meshStandardMaterial color="#c9a94a" />
        </mesh>
        <ToyPerson
          f={f}
          seed={31}
          pose="sit"
          position={[0, 0.48, -0.78]}
          heading={0}
          scale={1.85}
          look={{ skin: "#e0b48c", hair: "#2a1c14", hairStyle: 0, top: "#9a958d", bottom: "#3a3835", outfit: "casual", build: 0.95, height: 0.97 }}
        />
        <mesh position={[0, 0.25, -0.78]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 20]} />
          <meshStandardMaterial color="#2a221c" />
        </mesh>
      </group>
      <HazeSprites t={t} puffs={[[0, 2.2, -1.5, 6, 12, 0.07], [2.5, 1.8, -2.5, 4, 16, 0.06], [-2.5, 2.0, -2.0, 5, 21, 0.06]]} />
    </>
  );
};

// ---------- the hook / goal world: keeper + ball from the cover ----------
const CoverFigures: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (ref.current) matte(ref.current);
  });
  const f = t * 60;
  return (
    <group>
      <mesh castShadow receiveShadow position={BALL_POS} rotation={[0.4, 2.2, 0.15]}>
        <sphereGeometry args={[BALL_R, 96, 64]} />
        <meshPhysicalMaterial map={ballTexture()} roughness={0.55} roughnessMap={grain()} bumpMap={grain()} bumpScale={0.6} clearcoat={0.25} clearcoatRoughness={0.5} />
      </mesh>
      <group ref={ref}>
        <ToyPerson f={f} seed={8} poseOverride={KEEPER_POSE} position={[0, 0, 1.4]} heading={-0.32} scale={2.05} look={{ skin: "#7b746c", hair: "#121214", hairStyle: 0, top: "#D9D5CD", bottom: "#B3AFA8", outfit: "casual", build: 1.06, height: 1 }} />
      </group>
      <GroundShadow x={BALL_POS[0]} z={BALL_POS[2]} y={0.004} scale={1.2} opacity={0.75} blur={1.6} far={0.6} />
      <GroundShadow x={0} z={1.4} y={0.004} scale={2.6} opacity={0.6} blur={2} far={2} />
    </group>
  );
};

/** The cover's light rig (key from the far stand + rims on the goalmouth). */
const CoverLights: React.FC = () => (
  <>
    <spotLight
      position={KEY_POS}
      onUpdate={aim([3, 0, -2.6])}
      intensity={60000}
      angle={0.17}
      penumbra={0.35}
      decay={2}
      color="#FFF6E6"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0003}
      shadow-camera-near={40}
      shadow-camera-far={110}
    />
    <spotLight position={[-3.5, 3.2, 6.4]} onUpdate={aim([0, 1.1, 1.4])} intensity={900} angle={0.3} penumbra={0.5} decay={2} color="#FFF6E8" />
    <spotLight position={[3.2, 2.6, 5.9]} onUpdate={aim([0, 1.2, 1.4])} intensity={300} angle={0.3} penumbra={0.5} decay={2} color="#ECEAE6" />
    <directionalLight position={[-8, 3, -6]} intensity={0.12} color="#A3BFDB" />
    <spotLight position={[6, 4.5, -5]} onUpdate={aim(BALL_POS)} intensity={22} angle={0.35} penumbra={1} decay={2} color="#F2EEE6" />
    <spotLight position={[5, 3, -5]} onUpdate={aim([0, 1.1, 1.4])} intensity={6} angle={0.2} penumbra={1} decay={2} color="#DCE3EC" />
  </>
);

/** Key + cold rim on the stage props. */
const StageLights: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <>
    <spotLight position={S(2.6, 8.5, 8.0)} onUpdate={aim(S(0, 2.8, 0))} intensity={620 * k} angle={0.36} penumbra={0.7} decay={2} color="#FFF3DE" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004} />
    <spotLight position={S(-3.2, 5.5, -4.5)} onUpdate={aim(S(0, 2.5, 0))} intensity={260 * k} angle={0.45} penumbra={0.8} decay={2} color="#A3BFDB" />
    <spotLight position={S(-4, 2.2, 8)} onUpdate={aim(S(0, 2.5, 0))} intensity={70 * k} angle={0.5} penumbra={1} decay={2} color="#DCE3EC" />
  </>
);

export const FilmScene: React.FC<{ t: number }> = ({ t }) => {
  const set = setAt(t);
  const c = camAt(t);
  const focus = Math.hypot(c.p[0] - c.l[0], c.p[1] - c.l[1], c.p[2] - c.l[2]);
  const hookFocus = Math.hypot(CAM_POS[0] - BALL_POS[0], CAM_POS[1] - BALL_POS[1], CAM_POS[2] - BALL_POS[2]) + 1.2;
  const fFocus = set === "hook" ? lerp(hookFocus, 40, seg(t, 0.6, 4)) : set === "goal" && t > T.menduga + 0.55 ? lerp(focus, hookFocus, seg(t, T.menduga + 0.55, T.gol)) : focus;
  const hookWash = set === "hook" ? seg(t, 0.8, 3.5) * 0.35 : 0;
  // the stadium dims when it falls silent
  const hush = set === "board" && t > CUT.board2 ? seg(t, T.juara2, CUT.silence) * 0.35 : 0;
  return (
    <>
      <CameraRig t={t} />
      {set !== "room" ? <Stadium t={t} wash={hookWash + (set === "silence" ? 0.15 : 0)} /> : <Room t={t} />}
      {(set === "hook" || set === "goal") && <CoverLights />}
      {(set === "hook" || set === "silence") && (
        <spotLight position={[0, 70, 10]} onUpdate={aim([-10, 14, 100])} intensity={set === "hook" ? 5 * seg(t, 0.6, 3.2) : 0.3} angle={0.95} penumbra={0.6} decay={0} color="#E6E3DC" />
      )}
      {set === "hook" && (
        <>
          <CoverFigures t={t} />
          <HazeSprites t={0} puffs={[[-2, 3.5, 9, 22, 9, 0.05], [2, 2.2, 4, 12, 13, 0.05]]} />
        </>
      )}
      {set === "goal" && <GoalPlay t={t} />}
      {set === "board" && (
        <>
          <Board t={t} second={t > CUT.board2} />
          <StageLights k={1 - hush} />
        </>
      )}
      {set === "ticket" && (
        <>
          <Ticket t={t} />
          <TicketRain t={t} o={seg(t, CUT.ticket, CUT.ticket + 0.8)} />
          <StageLights />
        </>
      )}
      {set === "clock" && (
        <>
          <ClockBoard t={t} />
          <Scorer t={t} at={T.friaca} x={-2.35} kit={BRAZIL} seed={41} skin="#9b6b48" />
          <Scorer t={t} at={T.schiaffino} x={2.35} kit={URUGUAY} seed={42} skin="#d8a77c" />
          <StageLights />
        </>
      )}
      {set === "silence" && (
        <>
          <CrowdPatch />
          <spotLight position={[-40, 22, 50]} onUpdate={aim([-63, 6, 57])} intensity={9000} angle={0.42} penumbra={0.9} decay={2} color="#E9E6DF" />
          <HazeSprites t={t} puffs={[[-50, 4, 54, 16, 12, 0.18], [-56, 7, 60, 20, 16, 0.16], [-46, 3, 50, 10, 21, 0.12]]} />
        </>
      )}
      {set === "quote" && (
        <>
          <Quote t={t} />
          <StageLights k={0.12} />
        </>
      )}
      <Finish
        frame={Math.round(t * 60)}
        background={PAL.bg}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={0.72}
        envIntensity={0.1}
        ao
        focus={fFocus}
        aperture={0.0009}
        maxBlur={0.006}
      />
    </>
  );
};
