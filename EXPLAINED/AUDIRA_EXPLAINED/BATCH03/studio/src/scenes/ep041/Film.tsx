// EP041 film (ISOCRAFT): "Bagaimana Air dan Limbah dari Lantai 50 Bisa Turun?"
// One ThreeCanvas, four worlds switched per shot:
//   tower  - full 50-floor cutaway tower (only floors near the camera are mounted) + basement/STP
//   cover  - the approved cover world (compressed tower) for the wide context and outro shots
//   macro  - a big cut-open soil-stack segment: water ring on the wall, air core, speed limit
//   trap   - a U-trap with its water seal, branch, stack and vent (gas block + pressure balance)
// Every cut, beat and caption is driven by timeline.json (Audio Master Clock). Deterministic:
// everything from useCurrentFrame(); no randomness.

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import {
  PAL, TITLE, MONO, FLOOR_H, W, D, Z0, BASE_Y, STACK_X, STACK_Z, STACK_R, VENT_X, VENT_Z, UP_X, RISER_X, HULL,
  hullMat, InkBox, InkCyl, Floor, Facade, Break, Pipes, Basement, Roof, Ground, LEVELS,
} from "./Cover.tsx";

// ---------------------------------------------------------------- timeline
type Word = { w: string; s: number; e: number };
type Clip = { id: string; words: Word[] };
const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;
const clip = (id: string) => CLIPS.find((c) => c.id === id)!;
const ws = (id: string, i = 0) => clip(id).words[i].s; // word start
const wfind = (id: string, w: string) => clip(id).words.find((x) => x.w.toLowerCase().startsWith(w))!.s;

const OUTRO_AT = SEC.OUTRO[1] + 0.2;
const LEAD = 0.12; // cut a hair before the word lands
type ShotId = "flush" | "dive" | "gravity" | "stack" | "freefall" | "ring" | "speed" | "smell" | "trap" | "vent" | "pressure" | "stp" | "sump" | "outro";
const CUTS: [ShotId, number][] = [
  ["flush", 0],
  ["dive", ws("l02") - LEAD],
  ["gravity", SEC.KONTEKS[0] - LEAD],
  ["stack", ws("l04") - LEAD],
  ["freefall", SEC.MEKANISME[0] - LEAD],
  ["ring", ws("l06") - LEAD],
  ["speed", ws("l07") - LEAD],
  ["smell", SEC.REVEAL[0] - LEAD],
  ["trap", ws("l09") - LEAD],
  ["vent", ws("l10") - LEAD],
  ["pressure", wfind("l10", "menyamakan") - LEAD],
  ["stp", SEC.PAYOFF[0] - LEAD],
  ["sump", ws("l12") - LEAD],
  ["outro", SEC.OUTRO[0] - LEAD],
];
const shotAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < CUTS.length; k++) if (t >= CUTS[k][1]) i = k;
  const t0 = CUTS[i][1];
  const t1 = i + 1 < CUTS.length ? CUTS[i + 1][1] : TOTAL;
  return { id: CUTS[i][0], t0, t1, u: Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) };
};

// beats
const T_FLUSH = wfind("l01", "toilet");
const T_INSTACK = T_FLUSH + 1.1;
const SLUG_V = 6.2; // world units / s, constant: the stack speed limit made visible
const FY = (n: number) => (n - 1) * FLOOR_H; // floor n -> y
const ROOF_T = 50 * FLOOR_H; // tower roof
const ROOF_DY = ROOF_T - (LEVELS[3].y + FLOOR_H); // cover Roof is authored at the cover's ROOF_Y

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => Easing.inOut(Easing.cubic)(clamp01(x));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const fract = (x: number) => ((x % 1) + 1) % 1;

// ---------------------------------------------------------------- cameras
type Cam = { pos: THREE.Vector3; target: THREE.Vector3; fov: number };
const mk = (target: [number, number, number], dir: [number, number, number], dist: number, fov = 20): Cam => {
  const tg = new THREE.Vector3(...target);
  return { target: tg, pos: tg.clone().add(new THREE.Vector3(...dir).normalize().multiplyScalar(dist)), fov };
};
// visible height = 2·d·tan(fov/2) (0.353·d at fov 20); visible width = that · 9/16

const slugY = (t: number) => FY(50) + 0.09 - SLUG_V * Math.max(0, t - T_INSTACK);

const camFor = (t: number): Cam => {
  const s = shotAt(t);
  const u = s.u;
  const drift = Math.sin(t * 0.6) * 0.04;
  switch (s.id) {
    case "flush": {
      // LT 50 bathroom: push in on the toilet, then start to tip down after the slug
      const ty = FY(50) + 0.5 - 0.9 * ease(ramp(t, T_INSTACK - 0.2, s.t1));
      return mk([lerp(-0.1, 0.35, ease(u)), ty, -0.7], [0.55 + drift, 0.09, 1], lerp(15.5, 12.5, ease(u)));
    }
    case "dive": {
      // crane straight down the shaft, riding just below the falling slug
      const ty = slugY(t) - 1.1;
      return mk([0.55, ty, -0.6], [0.5 + drift, 0.2 - 0.12 * u, 1], lerp(13, 19, ease(u)));
    }
    case "gravity":
      return mk([0.05, 2.4, 0], [0.48 + drift, 0.18, 1], lerp(70, 62, ease(u)));
    case "stack": {
      const ty = lerp(FY(26) + 0.4, FY(21) + 0.4, ease(u));
      return mk([0.3, ty, -0.4], [0.62 + drift, 0.2, 1], 25);
    }
    case "freefall":
      return mk([0, 0.2, 0], [0.35 + drift, 0.12, 1], lerp(30, 27, ease(u)));
    case "ring": {
      // side view of the cut pipe, then crane up to look down into the cut: ring + air core
      const k = ease(ramp(t, wfind("l06", "dengan") - 1.6, wfind("l06", "dengan") + 0.2));
      const dir: [number, number, number] = [lerp(0.35, 0.18, k), lerp(0.14, 1.25, k), 1];
      return mk([0, lerp(1.2, 3.6, k), 0], dir, lerp(20, 15, k));
    }
    case "speed":
      return mk([0, lerp(-1.5, -3.0, u), 0], [0.4 + drift, 0.1, 1], 26);
    case "smell":
      return mk([0.1, FY(50) + 0.5, -0.7], [0.55 + drift, 0.09, 1], lerp(13, 11.5, ease(u)));
    case "trap":
      return mk([0.3, 0.6, 0], [0.32 + drift, 0.18, 1], lerp(15.5, 13.5, ease(u)));
    case "vent": {
      const ty = lerp(FY(47), ROOF_T + 0.3, ease(u));
      return mk([0.9, ty, -0.6], [0.6 + drift, 0.22, 1], 21);
    }
    case "pressure":
      return mk([lerp(1.9, 2.2, ease(u)), lerp(1.2, 1.5, ease(u)), 0], [0.3 + drift, 0.15, 1], lerp(25, 30, ease(u)));
    case "stp": {
      const ty = lerp(FY(2) + 0.2, BASE_Y + 0.15, ease(u));
      return mk([lerp(0.2, -0.6, ease(u)), ty, -0.2], [0.5 + drift, 0.22, 1], lerp(19, 22, ease(u)));
    }
    case "sump":
      return mk([1.1, BASE_Y + 0.55, 0.0], [0.7 + drift, 0.22, 1], lerp(11.5, 10, ease(u)));
    case "outro":
    default:
      return mk([0.05, 2.3, 0], [0.48 + drift, 0.18, 1], lerp(52, 58, ease(u)));
  }
};

const worldOf = (id: ShotId) =>
  id === "gravity" || id === "outro" ? "cover" : id === "freefall" || id === "ring" || id === "speed" ? "macro" : id === "trap" || id === "pressure" ? "trap" : "tower";

const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.pos);
    c.fov = cam.fov;
    c.near = 0.5;
    c.far = 400;
    c.lookAt(cam.target);
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

// project a world point to screen px (same math as the live camera)
const projector = new THREE.PerspectiveCamera(20, 9 / 16, 0.5, 400);
const project = (cam: Cam, p: [number, number, number], w: number, h: number) => {
  projector.fov = cam.fov;
  projector.aspect = w / h;
  projector.position.copy(cam.pos);
  projector.lookAt(cam.target);
  projector.updateProjectionMatrix();
  projector.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projector);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
};

// ---------------------------------------------------------------- shared bits
const InkCone: React.FC<{ pos: [number, number, number]; r: number; h: number; color: string; rot?: [number, number, number] }> = ({ pos, r, h, color, rot = [0, 0, 0] }) => {
  const geo = useMemo(() => new THREE.ConeGeometry(r, h, 14), [r, h]);
  const hull = useMemo(() => new THREE.ConeGeometry(r + HULL * 1.5, h + HULL * 3, 14), [r, h]);
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo}>
        <meshToonMaterial color={color} />
      </mesh>
      <mesh geometry={hull} material={hullMat} />
    </group>
  );
};

const Blob: React.FC<{ pos: [number, number, number]; r: number; color: string; sy?: number; opacity?: number }> = ({ pos, r, color, sy = 1, opacity = 1 }) => (
  <group position={pos} scale={[1, sy, 1]}>
    <mesh>
      <sphereGeometry args={[r, 14, 10]} />
      <meshToonMaterial color={color} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} />
    </mesh>
    {opacity >= 1 && (
      <mesh material={hullMat}>
        <sphereGeometry args={[r + HULL, 14, 10]} />
      </mesh>
    )}
  </group>
);

// cut-open pipe: back half wall + optional brown film, ink cut edges
const HalfPipe: React.FC<{ x: number; z: number; y0: number; y1: number; r: number; film?: number; wall?: string }> = ({ x, z, y0, y1, r, film = 0, wall = "#A9B1B9" }) => {
  const len = y1 - y0;
  const wg = useMemo(() => new THREE.CylinderGeometry(r, r, len, 40, 1, true, Math.PI / 2, Math.PI), [r, len]);
  const fg = useMemo(() => (film > 0 ? new THREE.CylinderGeometry(r - film, r - film, len, 40, 1, true, Math.PI / 2, Math.PI) : null), [r, len, film]);
  const t = Math.max(0.03, r * 0.08);
  return (
    <group position={[x, (y0 + y1) / 2, z]}>
      <mesh geometry={wg}>
        <meshToonMaterial color={wall} side={THREE.DoubleSide} />
      </mesh>
      {fg && (
        <mesh geometry={fg}>
          <meshToonMaterial color={PAL.waste} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* cut faces: wall section (ink) + film section (brown) on both sides */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <InkBox size={[t, len, t]} pos={[sd * r, 0, 0]} color={PAL.ink} edges={false} />
          {film > 0 && <InkBox size={[film * 0.9, len, film * 0.9]} pos={[sd * (r - film / 2 - t / 2), 0, 0]} color={PAL.waste} edges={false} />}
        </group>
      ))}
    </group>
  );
};

// falling waste slug inside a cut-open stack (ring of water on the wall, not a solid plug)
const Slug: React.FC<{ x: number; z: number; y: number; r: number; t: number; n?: number }> = ({ x, z, y, r, t, n = 18 }) => {
  const ring = useMemo(() => new THREE.CylinderGeometry(r * 0.9, r * 0.9, r * 3.2, 32, 1, true, Math.PI / 2, Math.PI), [r]);
  const drops: React.ReactElement[] = [];
  for (let k = 0; k < n; k++) {
    const a = Math.PI / 2 + 0.2 + fract(k * 0.618 + t * 0.35) * (Math.PI - 0.4);
    const dy = r * (1.2 + 3.5 * fract(k * 0.37));
    drops.push(<Blob key={k} pos={[x + Math.sin(a) * r * 0.82, y + dy, z + Math.cos(a) * r * 0.82]} r={r * 0.14} sy={2.6} color={PAL.waste} />);
  }
  return (
    <group>
      <mesh geometry={ring} position={[x, y, z]}>
        <meshToonMaterial color={PAL.waste} side={THREE.DoubleSide} />
      </mesh>
      {drops}
    </group>
  );
};

// ---------------------------------------------------------------- TOWER world
const TowerWorld: React.FC<{ t: number; id: ShotId; cam: Cam }> = ({ t, id, cam }) => {
  const f = t * 60;
  const cy = cam.target.y;
  const lo = Math.max(1, Math.floor((cy - 11) / FLOOR_H) + 1);
  const hi = Math.min(50, Math.ceil((cy + 9) / FLOOR_H) + 1);
  const floors: React.ReactElement[] = [];
  for (let n = lo; n <= hi; n++) {
    floors.push(<Floor key={n} k={n} y={FY(n)} label={`LT ${n}`} lobby={n === 1} top={n === 50} f={f} />);
  }
  const showBase = lo <= 3;
  const showRoof = hi >= 47;
  const sy = slugY(t);
  // per-floor flows into the stack (KONTEKS: "semua limbah masuk ke satu pipa tegak")
  const flows: React.ReactElement[] = [];
  if (id === "stack") {
    for (let n = lo; n <= hi; n++) {
      const st = ws("l04") + (26 - n) * 0.32;
      const p = fract((t - st) / 1.3);
      if (t < st) continue;
      const x = lerp(-1.25, STACK_X - STACK_R, p);
      flows.push(<Blob key={`fl${n}`} pos={[x, FY(n) + 0.13, Z0 + 0.32]} r={0.07} sy={1} color={PAL.waste} />);
    }
  }
  // collars light up floor by floor at "menembus setiap lantai"
  const tPierce = wfind("l04", "menembus");
  const collars: React.ReactElement[] = [];
  if (id === "stack") {
    for (let n = lo; n <= hi; n++) {
      const on = t > tPierce + (hi - n) * 0.12;
      collars.push(<InkCyl key={`c${n}`} r={STACK_R + 0.08} h={0.1} pos={[STACK_X, FY(n) + 0.03, STACK_Z]} color={on ? PAL.yellow : PAL.grey} seg={28} />);
    }
  }
  // drops along the stack (constant speed, on the wall)
  const drops: React.ReactElement[] = [];
  if (id === "stack" || id === "stp" || id === "vent") {
    const y0 = Math.max(BASE_Y + 1.45, cy - 10), y1 = Math.min(ROOF_T, cy + 8);
    const len = y1 - y0;
    const n = Math.round(len * 4);
    for (let k = 0; k < n; k++) {
      const p = fract(t * 0.35 + k / n);
      const a = Math.PI / 2 + 0.3 + fract(k * 0.618) * (Math.PI - 0.6);
      drops.push(<Blob key={`d${k}`} pos={[STACK_X + Math.sin(a) * (STACK_R - 0.05), y1 - p * len, STACK_Z + Math.cos(a) * (STACK_R - 0.05)]} r={0.04} sy={3} color={PAL.waste} />);
    }
  }
  // toilet flush swirl on LT 50
  const swirl = id === "flush" || id === "dive" ? ramp(t, T_FLUSH - 0.1, T_FLUSH + 0.3) * (1 - ramp(t, T_FLUSH + 1.4, T_FLUSH + 1.9)) : 0;
  // slug: bowl -> branch -> stack
  const slugBranch = id === "flush" && t > T_FLUSH + 0.3 && t < T_INSTACK ? ramp(t, T_FLUSH + 0.3, T_INSTACK) : -1;
  // sewer-gas puffs on LT 50 (REVEAL: "kenapa toilet tidak bau?")
  const puffs: React.ReactElement[] = [];
  if (id === "smell") {
    for (let k = 0; k < 7; k++) {
      const p = fract(t * 0.45 + k / 7);
      const x = lerp(STACK_X - 0.2, -1.1, p * 0.85);
      puffs.push(<Blob key={`p${k}`} pos={[x, FY(50) + 0.18 + Math.sin(k * 2 + t * 3) * 0.05 + p * 0.1, Z0 + 0.4]} r={0.09 + 0.05 * p} color="#9BC53D" opacity={0.75 * (1 - p)} />);
    }
  }
  // vent air arrows (up along the vent to the roof)
  const air: React.ReactElement[] = [];
  if (id === "vent") {
    for (let k = 0; k < 8; k++) {
      const p = fract(t * 0.4 + k / 8);
      air.push(<InkCone key={`a${k}`} pos={[VENT_X + 0.24, FY(45) + p * (ROOF_T + 1.2 - FY(45)), VENT_Z + 0.25]} r={0.08} h={0.22} color="#FFFFFF" />);
    }
  }
  // STP / sump extras
  const tSewer = wfind("l11", "saluran");
  const out: React.ReactElement[] = [];
  if (id === "stp" || id === "sump") {
    for (let k = 0; k < 6; k++) {
      const p = fract(t * 0.5 + k / 6);
      out.push(<Blob key={`o${k}`} pos={[lerp(-2.2, -4.2, p), -0.9, -0.35]} r={0.06} color={PAL.blueLight} />);
    }
  }
  const pumpOn = id === "sump" ? 1 : 0;
  const lift: React.ReactElement[] = [];
  if (pumpOn) {
    for (let k = 0; k < 7; k++) {
      const p = fract(t * 0.7 + k / 7);
      const y = lerp(BASE_Y + 0.6, BASE_Y + 1.45, Math.min(1, p * 1.5));
      const x = p < 0.66 ? 1.8 : lerp(1.8, STACK_X + STACK_R, (p - 0.66) / 0.34);
      lift.push(<Blob key={`l${k}`} pos={[x, y, 0.35]} r={0.05} color={PAL.waste} />);
    }
  }
  return (
    <group>
      {showBase && <Ground />}
      {floors}
      {/* right facade (full height, windows only where mounted) */}
      <InkBox size={[0.1, ROOF_T, D]} pos={[W / 2 + 0.05, ROOF_T / 2, 0]} color={PAL.coral} />
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).flatMap((n) =>
        [0, 1].map((k) => <InkBox key={`w${n}-${k}`} size={[0.03, 0.64, 0.8]} pos={[W / 2 + 0.115, FY(n) + 0.6, Z0 + 0.7 + k * 1.2]} color={PAL.blueLight} />),
      )}
      {/* pipes, full height (single meshes) */}
      <HalfPipe x={STACK_X} z={STACK_Z} y0={BASE_Y + 1.45} y1={ROOF_T} r={STACK_R} film={id === "flush" || id === "dive" ? 0 : 0.03} />
      <InkCyl r={0.1} h={ROOF_T + 1.0 - 0.45} pos={[VENT_X, 0.45 + (ROOF_T + 1.0 - 0.45) / 2, VENT_Z]} color={PAL.yellow} seg={14} />
      <InkCyl r={0.17} h={0.12} pos={[VENT_X, ROOF_T + 1.05, VENT_Z]} color={PAL.yellow} seg={14} />
      {[10, 20, 30, 40].map((n) => (
        <InkCyl key={`y${n}`} r={0.065} h={0.62} pos={[(STACK_X + VENT_X) / 2 + 0.05, FY(n) + 0.75, (STACK_Z + VENT_Z) / 2]} rot={[0, 0, Math.PI / 2 + 0.8]} color={PAL.yellow} seg={10} />
      ))}
      <InkCyl r={0.06} h={ROOF_T + 0.5 - 0.58} pos={[UP_X, 0.58 + (ROOF_T + 0.5 - 0.58) / 2, -1.15]} color={PAL.blue} seg={10} />
      <InkCyl r={0.07} h={ROOF_T + 0.3 - 0.75} pos={[RISER_X, 0.75 + (ROOF_T + 0.3 - 0.75) / 2, -0.95]} color={PAL.blue} seg={12} />
      {collars}
      {flows}
      {drops}
      {puffs}
      {air}
      {/* LT 50 flush */}
      {swirl > 0 && (
        <group position={[-0.25, FY(50) + 0.4, Z0 + 0.45]} rotation={[-Math.PI / 2, 0, t * 9]}>
          <mesh>
            <circleGeometry args={[0.17 * swirl, 24]} />
            <meshBasicMaterial color={PAL.blue} />
          </mesh>
          <mesh position={[0.05, 0, 0.002]}>
            <ringGeometry args={[0.05, 0.1, 16, 1, 0, Math.PI * 1.2]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
      {slugBranch >= 0 && <Blob pos={[lerp(-0.25, STACK_X - STACK_R, slugBranch), FY(50) + 0.13, Z0 + 0.32]} r={0.09} color={PAL.waste} />}
      {(id === "flush" || id === "dive") && t >= T_INSTACK && <Slug x={STACK_X} z={STACK_Z} y={sy} r={STACK_R} t={t} />}
      {showRoof && (
        <group position={[0, ROOF_DY, 0]}>
          <Roof sign={id !== "flush" && id !== "smell"} />
        </group>
      )}
      {showBase && (
        <>
          <Basement f={f} />
          {/* base bend into the STP inlet */}
          <mesh position={[STACK_X, BASE_Y + 1.45, STACK_Z]}>
            <sphereGeometry args={[STACK_R, 18, 12]} />
            <meshToonMaterial color={PAL.grey} />
          </mesh>
          <InkCyl r={STACK_R} h={STACK_X + 0.1} pos={[(STACK_X - 0.1) / 2, BASE_Y + 1.45, STACK_Z]} rot={[0, 0, Math.PI / 2]} color={PAL.grey} seg={20} />
          <InkCyl r={0.18} h={0.42} pos={[-0.1, BASE_Y + 1.24, STACK_Z]} color={PAL.grey} seg={16} />
          {/* sump pump discharge joins the gravity line */}
          <InkCyl r={0.045} h={1.8 - STACK_X - STACK_R} pos={[(1.8 + STACK_X + STACK_R) / 2, BASE_Y + 1.45, 0.35]} rot={[0, 0, Math.PI / 2]} color={PAL.grey} seg={8} />
          <InkCyl r={0.045} h={0.35 - STACK_Z} pos={[STACK_X + STACK_R, BASE_Y + 1.45, (0.35 + STACK_Z) / 2]} rot={[Math.PI / 2, 0, 0]} color={PAL.grey} seg={8} />
          {/* treated-water outlet -> city sewer under the street */}
          <InkCyl r={0.07} h={2.6} pos={[-2.2 - 1.3 + 0.4, -0.9, -0.35]} rot={[0, 0, Math.PI / 2]} color={PAL.mint} seg={10} />
          <InkCyl r={0.5} h={D + 1.2} pos={[-3.9, -0.9, -0.6]} rot={[Math.PI / 2, 0, 0]} color="#9C968A" seg={28} />
          <mesh position={[-3.9, -0.9, D / 2 + 0.01]}>
            <circleGeometry args={[0.38, 28]} />
            <meshBasicMaterial color="#5C5245" />
          </mesh>
          {/* sewer level (dashed) - anything below it is pumped up */}
          {(id === "sump" || (id === "stp" && t > tSewer)) &&
            Array.from({ length: 12 }, (_, i) => <InkBox key={`lv${i}`} size={[0.28, 0.03, 0.03]} pos={[-2.5 + i * 0.45, -0.9, D / 2 + 0.05]} color={PAL.ink} edges={false} />)}
          {out}
          {lift}
          {pumpOn > 0 && (
            <group position={[1.8, BASE_Y + 0.65, 0.53]} rotation={[0, 0, t * 12]}>
              <InkBox size={[0.26, 0.05, 0.03]} pos={[0, 0, 0]} color={PAL.yellow} />
              <InkBox size={[0.05, 0.26, 0.03]} pos={[0, 0, 0]} color={PAL.yellow} />
            </group>
          )}
          {/* sump liquid */}
          <InkBox size={[0.6, 0.06, 0.6]} pos={[1.8, BASE_Y + 0.1 + (pumpOn ? 0.03 * Math.sin(t * 4) : 0), 0.35]} color={PAL.waste} edges={false} />
        </>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- COVER world (approved cover)
const CoverWorld: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  return (
    <group>
      <Ground />
      {LEVELS.map((lv, k) => (
        <Floor key={k} k={k} y={lv.y} label={lv.label} lobby={lv.lobby} top={k === LEVELS.length - 1} f={f} />
      ))}
      <Facade />
      <Break />
      <Pipes f={f} />
      <Roof />
      <Basement f={f} />
    </group>
  );
};

// ---------------------------------------------------------------- MACRO world (big stack segment)
const MR = 1.2; // pipe radius
const MFILM = 0.2; // water ring thickness
const MTOP = 5;
const MacroWorld: React.FC<{ t: number; id: ShotId }> = ({ t, id }) => {
  const showRing = id !== "freefall";
  const drops: React.ReactElement[] = [];
  if (showRing) {
    for (let k = 0; k < 90; k++) {
      const p = fract(t * 0.32 + k / 90);
      const a = Math.PI / 2 + 0.15 + fract(k * 0.618 + p * 0.25) * (Math.PI - 0.3);
      const rr = MR - MFILM - 0.04;
      drops.push(<Blob key={k} pos={[Math.sin(a) * rr, MTOP - p * 22, Math.cos(a) * rr]} r={0.08} sy={3.2} color={k % 5 === 0 ? "#A9783F" : PAL.waste} />);
    }
  }
  // air in the core moves down with the water
  const air: React.ReactElement[] = [];
  if (showRing) {
    for (let k = 0; k < 6; k++) {
      const p = fract(t * 0.22 + k / 6);
      air.push(<InkCone key={`a${k}`} pos={[Math.sin(k * 2.1) * 0.25, MTOP - 0.4 - p * 14, Math.cos(k * 2.1) * 0.25 - 0.1]} r={0.16} h={0.4} color="#FFFFFF" rot={[Math.PI, 0, 0]} />);
    }
  }
  // free-fall ghost: accelerating plug down the middle (what does NOT happen)
  const tf = SEC.MEKANISME[0];
  const ghost: React.ReactElement[] = [];
  if (id === "freefall") {
    for (let g = 0; g < 4; g++) {
      const tau = Math.max(0, t - tf - 0.3 - g * 0.06);
      const y = MTOP - 0.8 - 0.5 * 5.5 * tau * tau;
      if (y > -12) ghost.push(<Blob key={g} pos={[0, y, 0]} r={0.55} sy={1.3} color={PAL.waste} opacity={g === 0 ? 0.85 : 0.25} />);
    }
  }
  return (
    <group>
      <HalfPipe x={0} z={0} y0={-16} y1={MTOP} r={MR + 0.12} film={showRing ? MFILM : 0} />
      {/* floor slabs crossing the pipe for scale */}
      {[1.2, -4.8].map((y) => (
        <group key={y}>
          <InkBox size={[3, 0.35, 4]} pos={[-MR - 0.12 - 1.5, y, 0]} color={PAL.floor} />
          <InkBox size={[3, 0.35, 4]} pos={[MR + 0.12 + 1.5, y, 0]} color={PAL.floor} />
          <InkCyl r={MR + 0.3} h={0.45} pos={[0, y, -0.0]} color={PAL.grey} opacity={0.35} seg={40} />
        </group>
      ))}
      {/* back wall of the shaft */}
      <InkBox size={[9, 30, 0.2]} pos={[0, -5, -2.1]} color={PAL.wall} />
      {/* top cut: grey wall ring, brown water ring, empty air core */}
      <group position={[0, MTOP + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[MR - 0.02, MR + 0.12, 64]} />
          <meshBasicMaterial color="#8C949C" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <ringGeometry args={[MR + 0.12, MR + 0.17, 64]} />
          <meshBasicMaterial color={PAL.ink} side={THREE.DoubleSide} />
        </mesh>
        {showRing && (
          <mesh position={[0, 0, 0.003]}>
            <ringGeometry args={[MR - MFILM, MR - 0.02, 64]} />
            <meshBasicMaterial color={PAL.waste} side={THREE.DoubleSide} />
          </mesh>
        )}
        <mesh position={[0, 0, 0.003]}>
          <ringGeometry args={[MR - MFILM - 0.04, MR - MFILM, 64]} />
          <meshBasicMaterial color={PAL.ink} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <circleGeometry args={[MR - MFILM - 0.03, 64]} />
          <meshBasicMaterial color="#EAF4FB" side={THREE.DoubleSide} />
        </mesh>
      </group>
      {drops}
      {air}
      {ghost}
    </group>
  );
};

// ---------------------------------------------------------------- TRAP world (U-trap + branch + stack + vent)
const TR = 0.55; // U radius
const TT = 0.2; // pipe radius
const SX = 3.4; // stack x
const SR = 0.55;
const VX = 4.75; // vent x
const VR = 0.25;
const BY = 0.95; // branch height
const glassMat = new THREE.MeshToonMaterial({ color: "#DCE6EE", transparent: true, opacity: 0.32, depthWrite: false });

const Glass: React.FC<{ geo: THREE.BufferGeometry; pos?: [number, number, number]; rot?: [number, number, number] }> = ({ geo, pos = [0, 0, 0], rot = [0, 0, 0] }) => {
  const eg = useMemo(() => new THREE.EdgesGeometry(geo, 40), [geo]);
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} material={glassMat} />
      <lineSegments geometry={eg}>
        <lineBasicMaterial color={PAL.ink} />
      </lineSegments>
    </group>
  );
};

const TrapWorld: React.FC<{ t: number; id: ShotId }> = ({ t, id }) => {
  const uGeo = useMemo(() => new THREE.TorusGeometry(TR, TT, 14, 40, Math.PI), []);
  const wGeo = useMemo(() => new THREE.TorusGeometry(TR, TT - 0.035, 14, 40, Math.PI), []);
  const legIn = useMemo(() => new THREE.CylinderGeometry(TT, TT, 2.1, 20, 1, true), []);
  const legOut = useMemo(() => new THREE.CylinderGeometry(TT, TT, BY, 20, 1, true), []);
  const branch = useMemo(() => new THREE.CylinderGeometry(TT, TT, SX - SR - TR, 20, 1, true), []);
  // seal level; the slug in the stack (pressure shot) only makes it wobble, never empties it
  const tSlug = wfind("l10", "supaya");
  const wob = id === "pressure" ? -0.07 * Math.exp(-((t - tSlug) ** 2) / 0.25) * (1 + 0.4 * Math.sin(t * 18)) : 0;
  const lvIn = 0.42 - wob * 0.6;
  const lvOut = 0.42 + wob;
  const gas: React.ReactElement[] = [];
  for (let k = 0; k < 9; k++) {
    const p = fract(t * 0.35 + k / 9);
    // gas creeps from the stack side along the branch to the outlet leg, and stops at the water
    const x = lerp(SX - SR - 0.1, TR, Math.min(1, p * 1.3));
    const y = p * 1.3 < 1 ? BY + Math.sin(k + t * 2) * 0.05 : lerp(BY, lvOut + 0.12, (p * 1.3 - 1) / 0.3);
    gas.push(<Blob key={k} pos={[x, y, 0]} r={0.09 + 0.03 * Math.sin(k)} color="#9BC53D" opacity={0.7} />);
  }
  const slugY = 6 - 7 * (t - (tSlug - 0.8));
  const air: React.ReactElement[] = [];
  if (id === "pressure") {
    for (let k = 0; k < 6; k++) {
      const p = fract(t * 0.6 + k / 6);
      // air flows down the vent, through the Y connection, into the stack behind the slug
      const pts: [number, number, number] = p < 0.5 ? [VX, lerp(5.5, 3.6, p / 0.5), 0] : [lerp(VX, SX + 0.2, (p - 0.5) / 0.5), lerp(3.6, 2.7, (p - 0.5) / 0.5), 0];
      air.push(<InkCone key={k} pos={pts} r={0.11} h={0.28} color="#FFFFFF" rot={[0, 0, p < 0.5 ? Math.PI : Math.PI * 0.72]} />);
    }
  }
  return (
    <group>
      {/* wall + floor context */}
      <InkBox size={[10, 9, 0.2]} pos={[1.6, 1.5, -1.0]} color={PAL.wall} />
      <InkBox size={[10, 0.25, 2.2]} pos={[1.6, 3.15, 0]} color={PAL.floor} />
      {/* sink above the trap */}
      <InkBox size={[1.6, 0.7, 1.2]} pos={[-TR, 3.65, 0]} color="#FFFFFF" />
      <InkBox size={[1.7, 0.1, 1.3]} pos={[-TR, 4.04, 0]} color={PAL.steel} />
      {/* U-trap glass + water seal */}
      <Glass geo={uGeo} rot={[0, 0, Math.PI]} />
      <mesh geometry={wGeo} rotation={[0, 0, Math.PI]}>
        <meshToonMaterial color={PAL.blue} />
      </mesh>
      <Glass geo={legIn} pos={[-TR, 1.05, 0]} />
      <Glass geo={legOut} pos={[TR, BY / 2, 0]} />
      <InkCyl r={TT - 0.035} h={lvIn} pos={[-TR, lvIn / 2, 0]} color={PAL.blue} seg={18} />
      <InkCyl r={TT - 0.035} h={lvOut} pos={[TR, lvOut / 2, 0]} color={PAL.blue} seg={18} />
      <Glass geo={branch} pos={[(TR + SX - SR) / 2, BY, 0]} rot={[0, 0, Math.PI / 2]} />
      {gas}
      {/* stack (cut open) + vent + Y connection */}
      <HalfPipe x={SX} z={0} y0={-4} y1={7} r={SR} film={0.07} />
      <InkCyl r={VR} h={11} pos={[VX, 1.5, -0.2]} color={PAL.yellow} seg={18} />
      <InkCyl r={0.16} h={1.6} pos={[(SX + VX) / 2, 3.15, -0.1]} rot={[0, 0, Math.PI / 2 + 0.75]} color={PAL.yellow} seg={14} />
      {id === "pressure" && slugY > -4 && slugY < 7 && <Slug x={SX} z={0} y={slugY} r={SR} t={t} n={14} />}
      {air}
    </group>
  );
};

// ---------------------------------------------------------------- 2D overlay pieces
const Headline: React.FC<{ text: string; t: number; t0: number; k: number; color?: string }> = ({ text, t, t0, k, color = PAL.yellow }) => {
  const a = ramp(t, t0, t0 + 0.3);
  if (a <= 0) return null;
  const pop = 1 + 0.08 * Math.sin(Math.min(1, a) * Math.PI);
  return (
    <div style={{ position: "absolute", left: 60 * k, top: 200 * k, transform: `translateX(${(1 - a) * -40 * k}px) scale(${pop})`, transformOrigin: "left center", opacity: a }}>
      <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 76 * k, lineHeight: 1.02, textTransform: "uppercase", color: PAL.ink, background: color, border: `${5 * k}px solid ${PAL.ink}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${PAL.ink}`, padding: `${4 * k}px ${20 * k}px ${8 * k}px`, maxWidth: 900 * k, whiteSpace: "pre-line" }}>
        {text}
      </div>
    </div>
  );
};

const Callout: React.FC<{ text: string; at: { x: number; y: number }; t: number; t0: number; k: number; dx?: number; dy?: number; bg?: string; fg?: string }> = ({ text, at, t, t0, k, dx = 120, dy = -90, bg = "#FFFFFF", fg = PAL.ink }) => {
  const a = ramp(t, t0, t0 + 0.25);
  if (a <= 0) return null;
  const bx = at.x + dx * k;
  const by = at.y + dy * k;
  const len = Math.hypot(bx - at.x, by - at.y);
  const ang = Math.atan2(by - at.y, bx - at.x);
  return (
    <>
      <div style={{ position: "absolute", left: at.x, top: at.y - 2 * k, width: len * a, height: 4 * k, background: PAL.ink, transform: `rotate(${ang}rad)`, transformOrigin: "0 50%" }} />
      <div style={{ position: "absolute", left: at.x - 9 * k, top: at.y - 9 * k, width: 18 * k, height: 18 * k, borderRadius: "50%", background: PAL.ink, transform: `scale(${a})` }} />
      <div style={{ position: "absolute", left: bx, top: by, transform: `translate(${dx >= 0 ? "0" : "-100%"}, -50%) scale(${0.6 + 0.4 * a})`, transformOrigin: dx >= 0 ? "left center" : "right center", opacity: a, fontFamily: TITLE, fontWeight: 700, fontSize: 44 * k, color: fg, background: bg, border: `${4 * k}px solid ${PAL.ink}`, boxShadow: `${5 * k}px ${5 * k}px 0 ${PAL.ink}`, padding: `${2 * k}px ${14 * k}px ${4 * k}px`, whiteSpace: "nowrap", textTransform: "uppercase" }}>
        {text}
      </div>
    </>
  );
};

// karaoke captions: phrases of 3-6 words from timeline.json, active word in ISOCRAFT yellow with a micro-bounce
type Phrase = { words: Word[]; s: number; e: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const last = i === c.words.length - 1;
      const brk = /[,.?!]$/.test(w.w) && cur.length >= 3;
      if (last || brk || cur.length >= 5) {
        if (!last && c.words.length - 1 - i < 2 && cur.length < 6) return; // avoid 1-word orphan
        out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
        cur = [];
      }
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  let ph: Phrase | null = null;
  for (let i = 0; i < PHRASES.length; i++) {
    const nx = PHRASES[i + 1];
    const end = nx ? Math.min(nx.s, PHRASES[i].e + 0.6) : PHRASES[i].e + 0.6;
    if (t >= PHRASES[i].s - 0.05 && t < end) ph = PHRASES[i];
  }
  if (!ph || t > OUTRO_AT) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 410 * k, display: "flex", justifyContent: "center", padding: `0 ${60 * k}px` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${6 * k}px ${12 * k}px`, background: "#FFFFFF", border: `${5 * k}px solid ${PAL.ink}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${PAL.ink}`, padding: `${10 * k}px ${20 * k}px ${14 * k}px`, maxWidth: 940 * k }}>
        {ph.words.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.08;
          const past = t >= w.e + 0.08;
          const b = on ? 1 + 0.12 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span key={i} style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 58 * k, lineHeight: 1.1, textTransform: "uppercase", color: PAL.ink, background: on ? PAL.yellow : "transparent", opacity: on || past ? 1 : 0.45, padding: `0 ${8 * k}px`, transform: `scale(${b}) translateY(${on ? -3 * k : 0}px)`, display: "inline-block", border: on ? `${3 * k}px solid ${PAL.ink}` : `${3 * k}px solid transparent` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// speed-limit graph (MEKANISME c): speed rises fast, then flattens
const SpeedGraph: React.FC<{ t: number; t0: number; k: number }> = ({ t, t0, k }) => {
  const a = ramp(t, t0, t0 + 0.3);
  if (a <= 0) return null;
  const draw = ramp(t, t0 + 0.2, wfind("l07", "mentok") + 0.3);
  const w = 620, h = 300;
  const pts: string[] = [];
  const N = 60;
  for (let i = 0; i <= Math.round(N * draw); i++) {
    const x = i / N;
    const v = 1 - Math.exp(-x * 9);
    pts.push(`${40 + x * (w - 70)},${h - 40 - v * (h - 110)}`);
  }
  const showCap = t > wfind("l07", "mentok");
  const showUnit = t > wfind("l07", "meter");
  return (
    <div style={{ position: "absolute", left: 60 * k, top: 330 * k, opacity: a, transform: `scale(${k})`, transformOrigin: "0 0" }}>
      <div style={{ width: w, height: h, background: "#FFFFFF", border: `5px solid ${PAL.ink}`, boxShadow: `8px 8px 0 ${PAL.ink}`, position: "relative" }}>
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={40} y1={h - 40} x2={w - 20} y2={h - 40} stroke={PAL.ink} strokeWidth={4} />
          <line x1={40} y1={h - 40} x2={40} y2={20} stroke={PAL.ink} strokeWidth={4} />
          {showCap && <line x1={40} y1={70} x2={w - 20} y2={70} stroke={PAL.coral} strokeWidth={4} strokeDasharray="14 10" />}
          <polyline points={pts.join(" ")} fill="none" stroke={PAL.waste} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 52, top: 22, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: PAL.ink }}>KECEPATAN</div>
        <div style={{ position: "absolute", right: 26, bottom: 2, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: PAL.ink }}>LANTAI TURUN →</div>
        {showCap && (
          <div style={{ position: "absolute", right: 24, top: 82, fontFamily: TITLE, fontWeight: 700, fontSize: 40, color: "#fff", background: PAL.coral, border: `4px solid ${PAL.ink}`, padding: "0 12px 2px" }}>
            {showUnit ? "MENTOK ±4–6 m/s" : "MENTOK"}
          </div>
        )}
      </div>
    </div>
  );
};

// comic panel wipe at each cut
const Wipe: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  let best = 99;
  for (let i = 2; i < CUTS.length; i++) best = Math.min(best, Math.abs(t - CUTS[i][1]) * (t < CUTS[i][1] ? 1 : 1));
  // nearest cut, signed
  let near = CUTS[2][1];
  for (let i = 2; i < CUTS.length; i++) if (Math.abs(t - CUTS[i][1]) < Math.abs(t - near)) near = CUTS[i][1];
  const d = t - near;
  if (Math.abs(d) > 0.2 || best > 0.2) return null;
  const p = (d + 0.2) / 0.4; // 0..1 across the cut
  const x = lerp(-1.4, 1.4, p) * w;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x - w * 0.35, top: -h * 0.2, width: w * 0.7, height: h * 1.4, background: PAL.yellow, borderLeft: `${w * 0.012}px solid ${PAL.ink}`, borderRight: `${w * 0.012}px solid ${PAL.ink}`, transform: "skewX(-14deg)" }} />
    </div>
  );
};

// ---------------------------------------------------------------- Film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const s = shotAt(t);
  const cam = useMemo(() => camFor(t), [t]);
  const world = worldOf(s.id);
  const P = (p: [number, number, number]) => project(cam, p, width, height);

  // overlay per shot
  const hud: React.ReactElement[] = [];
  if (s.id === "flush" || s.id === "dive") {
    const n = s.id === "flush" ? 50 : Math.max(1, Math.min(50, Math.floor((slugY(t) + 0.2) / FLOOR_H) + 1));
    hud.push(
      <div key="alt" style={{ position: "absolute", right: 60 * k, top: 200 * k, fontFamily: TITLE, fontWeight: 700, fontSize: 64 * k, color: "#fff", background: PAL.coral, border: `${5 * k}px solid ${PAL.ink}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${PAL.ink}`, padding: `${0}px ${18 * k}px ${4 * k}px` }}>
        LT {n}
      </div>,
    );
    if (s.id === "dive") hud.push(<Headline key="h" text={"± 200 m\nke bawah"} t={t} t0={ws("l02", 1)} k={k} />);
    if (s.id === "flush") hud.push(<Callout key="c" text="siram!" at={P([-0.25, FY(50) + 0.42, Z0 + 0.45])} t={t} t0={T_FLUSH} k={k} dx={-150} dy={-150} bg={PAL.yellow} />);
  }
  if (s.id === "gravity") {
    hud.push(<Headline key="h" text="gravitasi" t={t} t0={s.t0 + 0.25} k={k} />);
    const a = ramp(t, s.t0 + 0.4, s.t0 + 1.0);
    hud.push(
      <div key="arr" style={{ position: "absolute", left: 950 * k, top: 520 * k, opacity: a, transform: `translateY(${(1 - a) * -40 * k}px)` }}>
        <svg width={90 * k} height={700 * k} viewBox="0 0 90 700">
          <rect x={27} y={0} width={36} height={590} fill={PAL.yellow} stroke={PAL.ink} strokeWidth={6} />
          <polygon points="0,580 90,580 45,695" fill={PAL.yellow} stroke={PAL.ink} strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </div>,
    );
  }
  if (s.id === "stack") {
    hud.push(<Headline key="h" text={"satu pipa tegak\nuntuk semua lantai"} t={t} t0={wfind("l04", "pipa")} k={k} />);
    hud.push(<Callout key="c" text="pipa tegak" at={P([STACK_X + 0.2, cam.target.y + 1.6, STACK_Z + 0.2])} t={t} t0={wfind("l04", "pipa")} k={k} dx={150} dy={-60} />);
  }
  if (s.id === "freefall") {
    hud.push(<Headline key="h" text="terjun bebas?" t={t} t0={wfind("l05", "tidak")} k={k} color="#FFFFFF" />);
    const tx = wfind("l05", "bebas");
    const a = ramp(t, tx, tx + 0.2);
    if (a > 0) {
      const c = P([0, -1.2, 0]);
      hud.push(
        <div key="x" style={{ position: "absolute", left: c.x - 170 * k, top: c.y - 170 * k, width: 340 * k, height: 340 * k, transform: `scale(${1.4 - 0.4 * a}) rotate(${(1 - a) * 20}deg)`, opacity: a }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <line x1={12} y1={12} x2={88} y2={88} stroke={PAL.ink} strokeWidth={22} strokeLinecap="round" />
            <line x1={88} y1={12} x2={12} y2={88} stroke={PAL.ink} strokeWidth={22} strokeLinecap="round" />
            <line x1={12} y1={12} x2={88} y2={88} stroke="#E0453A" strokeWidth={13} strokeLinecap="round" />
            <line x1={88} y1={12} x2={12} y2={88} stroke="#E0453A" strokeWidth={13} strokeLinecap="round" />
          </svg>
        </div>,
      );
    }
  }
  if (s.id === "ring") {
    hud.push(<Headline key="h" text={"cincin air +\ninti udara"} t={t} t0={wfind("l06", "cincin")} k={k} />);
    const tC = wfind("l06", "cincin");
    const tI = wfind("l06", "inti");
    hud.push(<Callout key="c1" text="cincin air" at={P([-(MR - MFILM / 2) * 0.72, MTOP, (MR - MFILM / 2) * 0.69])} t={t} t0={tC} k={k} dx={80} dy={210} bg={PAL.waste} fg="#FFFFFF" />);
    hud.push(<Callout key="c2" text="inti udara" at={P([0.1, MTOP, 0.1])} t={t} t0={tI} k={k} dx={170} dy={-160} />);
    hud.push(<Callout key="c3" text="dinding pipa" at={P([MR + 0.06, MTOP - 2.2, 0])} t={t} t0={wfind("l06", "dinding")} k={k} dx={110} dy={60} bg={PAL.steel} />);
  }
  if (s.id === "speed") {
    hud.push(<Headline key="h" text="kecepatan mentok" t={t} t0={s.t0 + 0.15} k={k} />);
    hud.push(<SpeedGraph key="g" t={t} t0={s.t0 + 0.3} k={k} />);
  }
  if (s.id === "smell") {
    hud.push(<Headline key="h" text="kok tidak bau?" t={t} t0={wfind("l08", "kenapa")} k={k} color="#FFFFFF" />);
    hud.push(<Callout key="c" text="gas selokan?" at={P([0.1, FY(50) + 0.3, Z0 + 0.4])} t={t} t0={wfind("l08", "tidak")} k={k} dx={-80} dy={-200} bg="#C9E58C" />);
  }
  if (s.id === "trap") {
    hud.push(<Headline key="h" text={"leher U berisi air"} t={t} t0={wfind("l09", "leher")} k={k} />);
    hud.push(<Callout key="c1" text="air penutup" at={P([0, -TR + 0.05, 0.2])} t={t} t0={wfind("l09", "air")} k={k} dx={130} dy={190} bg={PAL.blue} fg="#FFFFFF" />);
    hud.push(<Callout key="c2" text="gas tertahan" at={P([TR, 0.75, 0.1])} t={t} t0={wfind("l09", "gas")} k={k} dx={150} dy={-170} bg="#C9E58C" />);
  }
  if (s.id === "vent") {
    hud.push(<Headline key="h" text="pipa ven" t={t} t0={s.t0 + 0.2} k={k} />);
    hud.push(<Callout key="c" text="ven → atap" at={P([VENT_X, cam.target.y + 0.6, VENT_Z])} t={t} t0={s.t0 + 0.6} k={k} dx={150} dy={-80} bg={PAL.yellow} />);
  }
  if (s.id === "pressure") {
    hud.push(<Headline key="h" text={"tekanan disamakan"} t={t} t0={s.t0 + 0.2} k={k} />);
    hud.push(<Callout key="c1" text="udara dari ven" at={P([VX, 4.4, 0])} t={t} t0={wfind("l10", "udara")} k={k} dx={-60} dy={-190} />);
    hud.push(<Callout key="c2" text="✓ tidak tersedot" at={P([TR, 0.4, 0.2])} t={t} t0={wfind("l10", "tidak")} k={k} dx={-120} dy={190} bg={PAL.mint} fg="#FFFFFF" />);
  }
  if (s.id === "stp") {
    hud.push(<Headline key="h" text={"diolah dulu"} t={t} t0={wfind("l11", "diolah")} k={k} />);
    hud.push(<Callout key="c1" text="instalasi pengolahan (STP)" at={P([-0.9, BASE_Y + 1.15, 0.4])} t={t} t0={wfind("l11", "instalasi")} k={k} dx={-30} dy={-230} bg={PAL.mint} fg="#FFFFFF" />);
    hud.push(<Callout key="c2" text="saluran kota" at={P([-3.9, -0.6, D / 2])} t={t} t0={wfind("l11", "saluran")} k={k} dx={60} dy={180} />);
  }
  if (s.id === "sump") {
    hud.push(<Headline key="h" text={"dipompa naik"} t={t} t0={wfind("l12", "dipompa")} k={k} />);
    hud.push(<Callout key="c1" text="pompa sump" at={P([1.8, BASE_Y + 0.4, 0.6])} t={t} t0={s.t0 + 0.3} k={k} dx={-170} dy={150} bg={PAL.shadow} fg="#FFFFFF" />);
    hud.push(<Callout key="c2" text="level saluran kota" at={P([-1.0, -0.9, D / 2 + 0.05])} t={t} t0={wfind("l12", "rendah")} k={k} dx={-40} dy={-170} />);
  }
  if (s.id === "outro") {
    hud.push(<Headline key="h" text={"naik & turun\nyang rapi"} t={t} t0={wfind("l13", "naik")} k={k} />);
    const up = ramp(t, wfind("l13", "naik"), wfind("l13", "naik") + 0.4);
    const dn = ramp(t, wfind("l13", "turun"), wfind("l13", "turun") + 0.4);
    const pu = P([UP_X - 0.6, 3.5, 0]);
    const pd = P([STACK_X + 0.1, 3.5, 1.4]);
    if (up > 0)
      hud.push(
        <div key="up" style={{ position: "absolute", left: pu.x - 40 * k, top: pu.y - 120 * k, opacity: up, transform: `translateY(${(1 - up) * 40 * k}px)`, fontFamily: TITLE, fontWeight: 700, fontSize: 56 * k, color: "#fff", background: PAL.blue, border: `${4 * k}px solid ${PAL.ink}`, padding: `0 ${14 * k}px ${4 * k}px`, boxShadow: `${5 * k}px ${5 * k}px 0 ${PAL.ink}` }}>
          ↑ NAIK
        </div>,
      );
    if (dn > 0)
      hud.push(
        <div key="dn" style={{ position: "absolute", left: pd.x - 40 * k, top: pd.y - 20 * k, opacity: dn, transform: `translateY(${(1 - dn) * -40 * k}px)`, fontFamily: TITLE, fontWeight: 700, fontSize: 56 * k, color: "#fff", background: PAL.waste, border: `${4 * k}px solid ${PAL.ink}`, padding: `0 ${14 * k}px ${4 * k}px`, boxShadow: `${5 * k}px ${5 * k}px 0 ${PAL.ink}` }}>
          ↓ TURUN
        </div>,
      );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.paper }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: true }} camera={{ fov: 20, position: [30, 30, 30] }}>
        <CamRig cam={cam} />
        <ambientLight intensity={1.45} />
        <directionalLight position={[4, 9, 7]} intensity={1.35} />
        {world === "tower" && <TowerWorld t={t} id={s.id} cam={cam} />}
        {world === "cover" && <CoverWorld t={t} />}
        {world === "macro" && <MacroWorld t={t} id={s.id} />}
        {world === "trap" && <TrapWorld t={t} id={s.id} />}
        <Finish frame={frame} background={PAL.paper} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} ao={false} exposure={1.0} envIntensity={0.25} />
      </ThreeCanvas>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${PAL.ink}22 ${1.6 * k}px, transparent ${1.8 * k}px)`, backgroundSize: `${14 * k}px ${14 * k}px`, mixBlendMode: "multiply" }} />
      <AbsoluteFill>{hud}</AbsoluteFill>
      <Captions t={t} k={k} />
      <Wipe t={t} w={width} h={height} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
