// Copy of core/polish/Person.tsx for AE-055: shoes take the outfit colour so noir silhouettes stay fully dark.
// Toy-figure people (tier 1: code only, no downloaded assets).
//
// Why this exists: scenes that needed people used to build them ad hoc from one capsule plus
// four sticks in a single candy colour. That reads as a starfish, not a person. The eye recognises
// a person from (1) a head with a face, (2) shoulders wider than the waist, (3) limbs that bend at
// elbows and knees, and (4) skin that is a different colour from the clothes. ToyPerson has all
// four, in a rounded vinyl-toy style that sits with the POLISH materials.
//
//   <ToyPerson f={f} seed={3} pose="wave" position={[0, 0, 0]} />            // feet on y = 0
//   <ToyPerson f={f} seed={8} pose="swimFreestyle" position={[x, waterY, z]} /> // hips at water line
//   <SwimCrowd f={f} seed={4} count={24} area={{ x: [-4, 4], z: [-6, 2] }} waterY={0} />
//
// Height is about 1.05 units at scale 1. Faces +z. Every value comes from `seed` and the 60 fps
// film clock `f`, so every render tab draws the same pixels.

import React, { useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { POLISH, RoundedBoxGeo, lifeMotion } from "../../core/polish/Polish.tsx";

type V3 = [number, number, number];

/** Skin tones from light to deep (includes the range of Indonesian audiences). */
export const SKIN_TONES = ["#f3cfb3", "#e6b28c", "#d09a6c", "#b47a52", "#91603f", "#6e4730"] as const;
export const HAIR_COLORS = ["#1b1411", "#2a1c14", "#432a1b", "#6e4426", "#b88b55", "#d9c9b3"] as const;
export const OUTFIT_COLORS = [
  "#e8423f", "#2f6fde", "#f2b400", "#1fa67a", "#ff7aa8", "#7b4fd6", "#ff8a00", "#14b2c4", "#262b33", "#f4f1ea",
] as const;

export type Outfit = "trunks" | "onePiece" | "casual";
export type PoseName = "stand" | "walk" | "wave" | "cheer" | "sit" | "swimFreestyle" | "float" | "tread";
const WATER_POSES: PoseName[] = ["swimFreestyle", "float", "tread"];

export type Look = {
  skin: string;
  hair: string;
  /** Swimsuit, or shirt for casual. */
  top: string;
  /** Trunks / bottoms. */
  bottom: string;
  outfit: Outfit;
  /** 0 short hair, 1 long hair (bun), 2 swim cap, 3 bald. */
  hairStyle: 0 | 1 | 2 | 3;
  cap: string;
  /** Body width multiplier for variety (0.9–1.12). */
  build: number;
  /** Height multiplier (0.62 child – 1.05 tall adult). */
  height: number;
};

/** A deterministic, varied look from a seed. Override any field with `look`. */
export function lookFromSeed(seed: number, outfit?: Outfit): Look {
  const r = prng(seed * 7919 + 13);
  for (let i = 0; i < 3; i++) r();
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length) % a.length];
  const o: Outfit = outfit ?? (r() < 0.5 ? "trunks" : "onePiece");
  const top = pick(OUTFIT_COLORS);
  let bottom = pick(OUTFIT_COLORS);
  if (o === "onePiece") bottom = top;
  const hs = r();
  const child = r() < 0.2;
  return {
    skin: pick(SKIN_TONES),
    hair: pick(HAIR_COLORS),
    top,
    bottom,
    outfit: o,
    hairStyle: hs < 0.45 ? 0 : hs < 0.72 ? 1 : hs < 0.94 ? 2 : 3,
    cap: pick(OUTFIT_COLORS),
    build: 0.9 + r() * 0.22,
    height: child ? 0.62 + r() * 0.12 : 0.92 + r() * 0.13,
  };
}

// ---------------------------------------------------------------------------------------------
// Skeleton proportions (scale 1). Hip joint origin is the pelvis centre.
const P = {
  hipX: 0.068,
  hipY: -0.035,
  thighR: 0.056,
  thighLen: 0.15, // capsule straight part; segment length = len + 2r
  shinR: 0.047,
  shinLen: 0.155,
  foot: [0.072, 0.045, 0.14] as V3,
  shoulderX: 0.148,
  shoulderY: 0.232,
  upperR: 0.042,
  upperLen: 0.12,
  foreR: 0.037,
  foreLen: 0.11,
  handR: 0.046,
  neckY: 0.27,
  headY: 0.4, // head centre above torso origin
  headR: 0.122,
};
const THIGH = P.thighLen + P.thighR * 2;
const SHIN = P.shinLen + P.shinR * 2;
/** Distance from pelvis centre to the sole when standing straight. */
export const LEG_LENGTH = -P.hipY + (THIGH - P.thighR * 0.9) + (SHIN - P.shinR * 0.6) + (P.foot[1] - 0.008);

// ---------------------------------------------------------------------------------------------
// Poses. Angles in radians, in the figure's own frame (faces +z, head +y, its left is +x).
// Shoulder: x < 0 swings the arm forward, z > 0 lifts the left arm sideways (mirror for right).
// Elbow: negative bends the forearm forward. Hip: x < 0 swings the leg forward. Knee: positive.
export type Pose = {
  body: V3; // whole-figure rotation around the pelvis (XYZ order: z, then roll y, then pitch x)
  lift: number; // pelvis height above the anchor
  spine: V3;
  head: V3;
  ls: V3; le: number; rs: V3; re: number;
  lh: V3; lk: number; rh: V3; rk: number;
};

const Z: V3 = [0, 0, 0];

export function poseAt(name: PoseName, f: number, seed = 1): Pose {
  const t = f / 60 + seed * 1.37;
  const { breathe } = lifeMotion(f, seed);
  const b = breathe * 0.02;
  const base: Pose = {
    body: Z, lift: LEG_LENGTH, spine: [b, 0, 0], head: [0, 0, 0],
    ls: [0, 0, 0.12], le: -0.12, rs: [0, 0, -0.12], re: -0.12,
    lh: [0, 0, 0.03], lk: 0, rh: [0, 0, -0.03], rk: 0,
  };
  switch (name) {
    case "stand": {
      const sway = Math.sin(t * 0.9) * 0.025;
      return { ...base, body: [0, 0, sway * 0.4], head: [Math.sin(t * 0.6) * 0.05, Math.sin(t * 0.37) * 0.25, 0] };
    }
    case "walk": {
      const w = t * Math.PI * 2 * 0.9;
      const s = Math.sin(w);
      return {
        ...base,
        lift: LEG_LENGTH - 0.012 + Math.abs(Math.cos(w)) * 0.012,
        spine: [0.04, -s * 0.08, 0],
        ls: [s * 0.45, 0, 0.1], le: -0.25 - Math.max(0, s) * 0.3,
        rs: [-s * 0.45, 0, -0.1], re: -0.25 - Math.max(0, -s) * 0.3,
        lh: [-s * 0.42, 0, 0.02], lk: Math.max(0, s) * 0.55 + 0.05,
        rh: [s * 0.42, 0, -0.02], rk: Math.max(0, -s) * 0.55 + 0.05,
      };
    }
    case "wave": {
      const w = Math.sin(t * Math.PI * 2 * 1.6);
      return { ...base, head: [0, 0.15, 0.06], rs: [-0.15, 0, -2.5], re: -0.35 + w * 0.35 };
    }
    case "cheer": {
      const j = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1));
      return { ...base, lift: LEG_LENGTH + j * 0.08, ls: [0, 0, 2.6 + j * 0.2], le: -0.2, rs: [0, 0, -2.6 - j * 0.2], re: -0.2, lk: j * 0.3, rk: j * 0.3, lh: [-j * 0.15, 0, 0.03], rh: [-j * 0.15, 0, -0.03] };
    }
    case "sit": {
      // Sitting on the pool edge: anchor at the seat, legs hang and kick slowly.
      const k = Math.sin(t * 2.2);
      return { ...base, lift: 0.04, spine: [0.08, 0, 0], ls: [0.25, 0, 0.25], le: -0.3, rs: [0.25, 0, -0.25], re: -0.3, lh: [-1.45, 0, 0.06], lk: 1.35 + k * 0.25, rh: [-1.45, 0, -0.06], rk: 1.35 - k * 0.25 };
    }
    case "swimFreestyle": {
      // Face down along its heading. Arms windmill (a full circle around the shoulder),
      // legs flutter, the body rolls toward the recovering arm, head turns to breathe.
      const ph = t * Math.PI * 2 * 0.55;
      const roll = Math.sin(ph) * 0.38;
      const kick = Math.sin(ph * 3.2);
      return {
        ...base,
        body: [Math.PI / 2 - 0.08, roll, 0],
        lift: -0.045 + Math.sin(ph * 2) * 0.012,
        spine: [0, 0, 0],
        head: [0.25, Math.max(0, Math.sin(ph)) * 0.9, 0],
        ls: [Math.PI + ph, 0, 0.12], le: -0.25 - Math.max(0, Math.sin(ph + Math.PI / 2)) * 0.5,
        rs: [ph, 0, -0.12], re: -0.25 - Math.max(0, Math.sin(ph - Math.PI / 2)) * 0.5,
        lh: [kick * 0.28, 0, 0.03], lk: 0.12 + Math.max(0, kick) * 0.2,
        rh: [-kick * 0.28, 0, -0.03], rk: 0.12 + Math.max(0, -kick) * 0.2,
      };
    }
    case "float": {
      // On the back, starfish-relaxed but with bent elbows and knees, gentle bob.
      const bob = Math.sin(t * 1.3);
      return {
        ...base,
        body: [-Math.PI / 2 + 0.12, 0, 0],
        lift: -0.02 + bob * 0.01,
        head: [-0.25, Math.sin(t * 0.5) * 0.2, 0],
        ls: [0, 0, 1.25 + bob * 0.06], le: -0.4, rs: [0, 0, -1.25 - bob * 0.06], re: -0.4,
        lh: [0, 0, 0.32], lk: 0.25, rh: [0, 0, -0.32], rk: 0.25,
      };
    }
    case "tread": {
      // Upright, head and shoulders out of the water, hands sculling, legs cycling.
      const s = Math.sin(t * 3.4);
      const c = Math.cos(t * 3.4);
      return {
        ...base,
        body: [0.12, 0, 0],
        lift: -0.2 + s * 0.015,
        head: [-0.06, Math.sin(t * 0.7) * 0.4, 0],
        ls: [-0.5 + c * 0.15, s * 0.5, 1.05], le: -0.6, rs: [-0.5 + c * 0.15, -s * 0.5, -1.05], re: -0.6,
        lh: [-0.45 + s * 0.35, 0, 0.12], lk: 0.7 + c * 0.35, rh: [-0.45 - s * 0.35, 0, -0.12], rk: 0.7 - c * 0.35,
      };
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Shared geometry and materials (crowds of 40 reuse one set).
const geoCache = new Map<string, THREE.BufferGeometry>();
const geo = (key: string, make: () => THREE.BufferGeometry) => {
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = make()));
  return g;
};
const capsule = (r: number, len: number) => geo(`cap:${r}:${len}`, () => new THREE.CapsuleGeometry(r, len, 6, 14));
const sphere = (r: number) => geo(`sph:${r}`, () => new THREE.SphereGeometry(r, 24, 18));

/** Torso: shoulders wider than the waist, flattened front to back. */
const torsoGeo = () =>
  geo("torso", () => {
    const pts = [
      [0.0, -0.005], [0.098, 0.0], [0.104, 0.05], [0.115, 0.12], [0.132, 0.19], [0.138, 0.225],
      [0.118, 0.258], [0.068, 0.276], [0.0, 0.282],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 28);
    g.scale(1, 1, 0.66);
    g.computeVertexNormals();
    return g;
  });
const pelvisGeo = () =>
  geo("pelvis", () => {
    const g = new THREE.SphereGeometry(0.108, 24, 16);
    g.scale(1.02, 0.72, 0.7);
    return g;
  });
/** Hair caps: short (crown), swim cap (covers to the ears). */
const capGeo = (thetaLen: number, key: string) =>
  geo(key, () => new THREE.SphereGeometry(P.headR * 1.06, 28, 16, 0, Math.PI * 2, 0, thetaLen));
const smileGeo = () => geo("smile", () => new THREE.TorusGeometry(0.03, 0.0065, 6, 16, Math.PI * 0.8));

const matCache = new Map<string, THREE.Material>();
const mat = (kind: keyof typeof POLISH | "wetSuit", color: string) => {
  const key = `${kind}:${color}`;
  let m = matCache.get(key);
  if (!m) {
    const recipe = kind === "wetSuit" ? { ...POLISH.toyPlastic, roughness: 0.28, clearcoat: 0.7 } : POLISH[kind];
    m = new THREE.MeshPhysicalMaterial({ ...recipe, color: new THREE.Color(color) });
    matCache.set(key, m);
  }
  return m;
};

// ---------------------------------------------------------------------------------------------
const Limb: React.FC<{
  r1: number; len1: number; r2: number; len2: number;
  root: V3; bend: number; m1: THREE.Material; m2: THREE.Material; end: React.ReactNode;
  shadows: boolean;
}> = ({ r1, len1, r2, len2, root, bend, m1, m2, end, shadows }) => {
  const s1 = len1 + r1 * 2;
  const s2 = len2 + r2 * 2;
  return (
    <group rotation={root}>
      <mesh geometry={capsule(r1, len1)} material={m1} position={[0, -s1 / 2, 0]} castShadow={shadows} />
      <group position={[0, -s1 + r1 * 0.9, 0]} rotation={[bend, 0, 0]}>
        <mesh geometry={capsule(r2, len2)} material={m2} position={[0, -s2 / 2, 0]} castShadow={shadows} />
        <group position={[0, -s2 + r2 * 0.6, 0]}>{end}</group>
      </group>
    </group>
  );
};

export const ToyPerson: React.FC<{
  /** 60 fps film clock. */
  f: number;
  seed?: number;
  pose?: PoseName;
  /** Override the pose entirely (for hand-keyed shots). */
  poseOverride?: Pose;
  look?: Partial<Look>;
  outfit?: Outfit;
  /** Feet on this point for land poses; pelvis at this point for water poses and "sit". */
  position?: V3;
  /** Heading in radians (0 faces +z). */
  heading?: number;
  scale?: number;
  shadows?: boolean;
}> = ({ f, seed = 1, pose = "stand", poseOverride, look, outfit, position = [0, 0, 0], heading = 0, scale = 1, shadows = true }) => {
  const L = useMemo(() => ({ ...lookFromSeed(seed, outfit), ...look }), [seed, outfit, look]);
  const p = poseOverride ?? poseAt(pose, f, seed);
  const { blink } = lifeMotion(f, seed + 3);
  const water = WATER_POSES.includes(pose);
  const s = scale * L.height;
  const bw = L.build;

  const skin = mat("toySkin", L.skin);
  const top = mat(water ? "wetSuit" : L.outfit === "casual" ? "fabric" : "toyPlastic", L.top);
  const bottom = mat(water ? "wetSuit" : L.outfit === "casual" ? "fabric" : "toyPlastic", L.bottom);
  const hair = mat("toyPlastic", L.hair);
  const cap = mat("wetSuit", L.cap);
  const eye = mat("glossyEye", "#15100d");
  const mouth = mat("toySkin", "#7a2f2a");
  const shoe = mat("toyPlastic", L.bottom);

  const torsoMat = L.outfit === "trunks" ? skin : top;
  const thighMat = L.outfit === "casual" ? bottom : skin;
  const shinMat = L.outfit === "casual" ? bottom : skin;
  const upperMat = L.outfit === "casual" ? top : skin;

  const hand = <mesh geometry={sphere(P.handR)} material={skin} scale={[0.82, 1, 0.62]} castShadow={shadows} />;
  const foot = (
    <mesh position={[0, -P.foot[1] / 2 + 0.008, 0.032]} material={L.outfit === "casual" && !water ? shoe : skin} castShadow={shadows}>
      <RoundedBoxGeo args={P.foot} radius={0.02} />
    </mesh>
  );

  return (
    <group position={position} rotation={[0, heading, 0]} scale={s}>
      <group position={[0, p.lift, 0]} rotation={p.body}>
        {/* Pelvis and legs */}
        <mesh geometry={pelvisGeo()} material={bottom} scale={[bw, 1, 1]} castShadow={shadows} />
        {([1, -1] as const).map((side) => (
          <group key={side} position={[side * P.hipX * bw, P.hipY, 0]}>
            <Limb
              r1={P.thighR} len1={P.thighLen} r2={P.shinR} len2={P.shinLen}
              root={side === 1 ? p.lh : p.rh} bend={side === 1 ? p.lk : p.rk}
              m1={thighMat} m2={shinMat} end={foot} shadows={shadows}
            />
          </group>
        ))}
        {/* Swim trunks cover the top of the thighs */}
        {L.outfit !== "onePiece" && (
          <mesh geometry={sphere(0.11)} material={bottom} position={[0, -0.03, 0]} scale={[1.02 * bw, 0.62, 0.72]} />
        )}

        {/* Torso, arms, head */}
        <group rotation={p.spine}>
          <mesh geometry={torsoGeo()} material={torsoMat} scale={[bw, 1, 1]} castShadow={shadows} />
          {([1, -1] as const).map((side) => (
            <group key={side} position={[side * P.shoulderX * bw, P.shoulderY, 0]}>
              <mesh geometry={sphere(P.upperR * 1.12)} material={L.outfit === "trunks" ? skin : top} />
              <Limb
                r1={P.upperR} len1={P.upperLen} r2={P.foreR} len2={P.foreLen}
                root={side === 1 ? p.ls : p.rs} bend={side === 1 ? p.le : p.re}
                m1={upperMat} m2={skin} end={hand} shadows={shadows}
              />
            </group>
          ))}
          <mesh geometry={capsule(0.042, 0.05)} material={skin} position={[0, P.neckY + 0.02, 0]} />
          <group position={[0, P.headY, 0]} rotation={p.head}>
            <mesh geometry={sphere(P.headR)} material={skin} scale={[1, 1.03, 0.96]} castShadow={shadows} />
            {/* Ears */}
            <mesh geometry={sphere(0.028)} material={skin} position={[P.headR * 0.97, -0.005, 0]} scale={[0.5, 1, 0.8]} />
            <mesh geometry={sphere(0.028)} material={skin} position={[-P.headR * 0.97, -0.005, 0]} scale={[0.5, 1, 0.8]} />
            {/* Face: eyes with blink, nose, smile */}
            {[1, -1].map((side) => (
              <mesh key={side} geometry={sphere(0.021)} material={eye} position={[side * 0.044, 0.012, P.headR * 0.9]} scale={[1, blink * 1.15, 0.6]} />
            ))}
            <mesh geometry={sphere(0.016)} material={skin} position={[0, -0.018, P.headR * 0.97]} />
            <mesh geometry={smileGeo()} material={mouth} position={[0, -0.04, P.headR * 0.9]} rotation={[0.25, 0, Math.PI + Math.PI * 0.1]} />
            {/* Hair */}
            {L.hairStyle === 0 && (
              <mesh geometry={capGeo(1.22, "hairShort")} material={hair} rotation={[-0.38, 0, 0]} position={[0, 0.006, -0.004]} />
            )}
            {L.hairStyle === 1 && (
              <>
                <mesh geometry={capGeo(1.4, "hairLong")} material={hair} rotation={[-0.5, 0, 0]} position={[0, 0.004, -0.006]} />
                <mesh geometry={sphere(0.058)} material={hair} position={[0, 0.07, -0.12]} />
              </>
            )}
            {L.hairStyle === 2 && (
              <mesh geometry={capGeo(1.55, "swimCap")} material={cap} rotation={[-0.42, 0, 0]} position={[0, 0.004, -0.004]} />
            )}
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
/**
 * Swimmers spread over a water area with a minimum gap, each with a ripple ring at the water
 * line. Freestyle swimmers travel along their heading, and their paths are chosen to stay inside
 * the area for `duration` seconds. Put the water surface (slightly transparent) at `waterY` so the
 * submerged half of each body is tinted by the water.
 */
export const SwimCrowd: React.FC<{
  f: number;
  seed?: number;
  count?: number;
  area: { x: [number, number]; z: [number, number] };
  waterY?: number;
  /** Minimum distance between swimmers (units). */
  gap?: number;
  /** Relative weights of swimFreestyle, float, tread. */
  mix?: [number, number, number];
  /** Freestyle swimmers swim along ±x (lanes) when true, otherwise in any direction. */
  lanes?: boolean;
  speed?: number;
  duration?: number;
  scale?: number;
  ripples?: boolean;
  /** z positions of lane ropes (or anything along x) that swimmers must keep clear of. */
  avoidZ?: number[];
  /** Clearance from each avoidZ line (units, before scale). */
  clearance?: number;
}> = ({ f, seed = 1, count = 20, area, waterY = 0, gap = 0.9, mix = [0.5, 0.2, 0.3], lanes = true, speed = 0.32, duration = 12, scale = 1, ripples = true, avoidZ = [], clearance = 0.42 }) => {
  const swimmers = useMemo(() => {
    const r = prng(seed * 104729 + 7);
    const out: { x: number; z: number; heading: number; pose: PoseName; seed: number; v: number }[] = [];
    const total = mix[0] + mix[1] + mix[2];
    for (let tries = 0; out.length < count && tries < count * 60; tries++) {
      const u = r() * total;
      const pose: PoseName = u < mix[0] ? "swimFreestyle" : u < mix[0] + mix[1] ? "float" : "tread";
      const heading = pose === "swimFreestyle" && lanes ? (r() < 0.5 ? Math.PI / 2 : -Math.PI / 2) : r() * Math.PI * 2;
      const v = pose === "swimFreestyle" ? speed * (0.8 + r() * 0.4) : 0;
      const x = area.x[0] + r() * (area.x[1] - area.x[0]);
      const z = area.z[0] + r() * (area.z[1] - area.z[0]);
      const ex = x + Math.sin(heading) * v * duration;
      const ez = z + Math.cos(heading) * v * duration;
      const inside = (px: number, pz: number) => px > area.x[0] && px < area.x[1] && pz > area.z[0] && pz < area.z[1];
      if (!inside(ex, ez)) continue;
      // Floaters spread their arms, so they need more room than a body width.
      const need = clearance * scale * (pose === "float" ? 1.35 : 1);
      if (avoidZ.some((lz) => Math.abs(z - lz) < need || Math.abs(ez - lz) < need)) continue;
      // Gap check against both ends of every path (cheap, good enough for lane swimming).
      const ok = out.every((o) => {
        const oex = o.x + Math.sin(o.heading) * o.v * duration;
        const oez = o.z + Math.cos(o.heading) * o.v * duration;
        return Math.hypot(o.x - x, o.z - z) > gap && Math.hypot(oex - ex, oez - ez) > gap;
      });
      if (ok) out.push({ x, z, heading, pose, seed: Math.floor(r() * 1e6) + 1, v });
    }
    return out;
  }, [seed, count, area.x[0], area.x[1], area.z[0], area.z[1], gap, mix[0], mix[1], mix[2], lanes, speed, duration, scale, avoidZ.join(","), clearance]);

  const t = f / 60;
  return (
    <group>
      {swimmers.map((s, i) => {
        const x = s.x + Math.sin(s.heading) * s.v * t;
        const z = s.z + Math.cos(s.heading) * s.v * t;
        return (
          <group key={i}>
            <ToyPerson f={f} seed={s.seed} pose={s.pose} position={[x, waterY, z]} heading={s.heading} scale={scale} shadows={false} />
            {ripples && <Ripples t={t + s.seed * 0.01} x={x} z={z} y={waterY + 0.004} size={s.pose === "swimFreestyle" ? 0.55 : 0.4} scale={scale} />}
          </group>
        );
      })}
    </group>
  );
};

const rippleGeo = () => geo("ripple", () => new THREE.RingGeometry(0.8, 1, 40));
const rippleMats = Array.from({ length: 12 }, (_, i) =>
  new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: (1 - i / 12) * 0.85, depthWrite: false }),
);
/** Two expanding foam rings at the water line. */
export const Ripples: React.FC<{ t: number; x: number; z: number; y: number; size?: number; scale?: number }> = ({ t, x, z, y, size = 0.45, scale = 1 }) => (
  <group position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
    {[0, 0.5].map((o) => {
      const k = (t * 0.8 + o) % 1;
      const r = (0.35 + k * 1.1) * size * scale;
      return <mesh key={o} geometry={rippleGeo()} material={rippleMats[Math.min(11, Math.floor(k * 12))]} scale={[r, r, 1]} />;
    })}
  </group>
);

// ---------------------------------------------------------------------------------------------
// AE-055 NoirFigure: a slim, real-proportioned 1940s silhouette (about 1.65 m at scale 1) for the
// FILMNOIR film. No face at all: near-black fabric that only catches a rim of window light.
// Women wear an A-line skirt, padded shoulders and rolled hair; men wear trousers and short hair.
export type NoirPose = {
  ls: V3; le: number; rs: V3; re: number; // shoulders (x<0 swings forward, z lifts sideways) and elbows
  head: V3;
  lean: number; // forward lean of the upper body
  step: number; // stride: positive = left foot forward
};
export const NOIR_STAND: NoirPose = { ls: [0.05, 0, 0.08], le: -0.15, rs: [0.05, 0, -0.08], re: -0.15, head: [0, 0, 0], lean: 0, step: 0 };

const skirtGeo = () =>
  geo("noirSkirt", () => {
    const pts = [[0.118, 0.0], [0.13, -0.06], [0.16, -0.2], [0.19, -0.36], [0.205, -0.44], [0.0, -0.44]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts.reverse(), 32);
    g.scale(1, 1, 0.78);
    g.computeVertexNormals();
    return g;
  });
const noirTorsoGeo = () =>
  geo("noirTorso", () => {
    const pts = [[0.0, 0.0], [0.115, 0.0], [0.112, 0.08], [0.14, 0.2], [0.165, 0.3], [0.178, 0.36], [0.15, 0.405], [0.07, 0.42], [0.0, 0.425]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 32);
    g.scale(1, 1, 0.62);
    g.computeVertexNormals();
    return g;
  });

const NoirLimb: React.FC<{ len1: number; r1: number; len2: number; r2: number; root: V3; bend: number; m: THREE.Material; end?: React.ReactNode }> = ({ len1, r1, len2, r2, root, bend, m, end }) => (
  <group rotation={root}>
    <mesh geometry={capsule(r1, len1)} material={m} position={[0, -len1 / 2 - r1, 0]} castShadow />
    <group position={[0, -len1 - r1 * 1.4, 0]} rotation={[bend, 0, 0]}>
      <mesh geometry={capsule(r2, len2)} material={m} position={[0, -len2 / 2 - r2, 0]} castShadow />
      <group position={[0, -len2 - r2 * 2, 0]}>{end}</group>
    </group>
  </group>
);

export const NoirFigure: React.FC<{
  position: V3;
  heading?: number;
  pose?: Partial<NoirPose>;
  woman?: boolean;
  scale?: number;
  tone?: string;
}> = ({ position, heading = 0, pose, woman = true, scale = 1, tone = "#070708" }) => {
  const p = { ...NOIR_STAND, ...pose };
  const cloth = mat("fabric", tone);
  const hairM = mat("fabric", "#050506");
  const shoeM = mat("toyPlastic", "#060607");
  const hipY = 0.86;
  const hand = <mesh geometry={sphere(0.04)} material={cloth} scale={[0.8, 1.15, 0.55]} castShadow />;
  const foot = (
    <mesh position={[0, -0.02, 0.04]} material={shoeM} castShadow>
      <RoundedBoxGeo args={[0.075, 0.05, woman ? 0.2 : 0.26]} radius={0.02} />
    </mesh>
  );
  return (
    <group position={position} rotation={[0, heading, 0]} scale={scale}>
      {/* legs */}
      {([1, -1] as const).map((side) => (
        <group key={side} position={[side * 0.075, hipY, 0]}>
          <NoirLimb len1={0.34} r1={woman ? 0.05 : 0.065} len2={0.34} r2={woman ? 0.04 : 0.058} root={[-side * p.step * 0.35, 0, 0]} bend={Math.abs(p.step) * 0.25} m={woman ? cloth : cloth} end={foot} />
        </group>
      ))}
      {woman ? (
        <mesh geometry={skirtGeo()} material={cloth} position={[0, hipY + 0.14, 0]} castShadow />
      ) : (
        <mesh geometry={sphere(0.13)} material={cloth} position={[0, hipY + 0.02, 0]} scale={[1.05, 0.7, 0.75]} castShadow />
      )}
      {/* upper body */}
      <group position={[0, hipY + 0.12, 0]} rotation={[p.lean, 0, 0]}>
        <mesh geometry={noirTorsoGeo()} material={cloth} scale={[woman ? 0.92 : 1.05, 1, 1]} castShadow />
        {([1, -1] as const).map((side) => (
          <group key={side} position={[side * (woman ? 0.17 : 0.19), 0.37, 0]}>
            <mesh geometry={sphere(0.058)} material={cloth} scale={[1.1, 0.8, 0.9]} castShadow />
            <NoirLimb len1={0.24} r1={0.036} len2={0.22} r2={0.03} root={side === 1 ? p.ls : p.rs} bend={side === 1 ? p.le : p.re} m={cloth} end={hand} />
          </group>
        ))}
        <mesh geometry={capsule(0.035, 0.06)} material={cloth} position={[0, 0.46, 0]} />
        <group position={[0, 0.58, 0]} rotation={p.head}>
          <mesh geometry={sphere(0.092)} material={cloth} scale={[0.86, 1.08, 0.98]} castShadow />
          {woman ? (
            <>
              {/* 1940s victory rolls and a low bun */}
              <mesh position={[0.045, 0.075, 0.01]} rotation={[0, Math.PI / 2, 0]} material={hairM}>
                <torusGeometry args={[0.03, 0.022, 10, 20]} />
              </mesh>
              <mesh position={[-0.045, 0.075, 0.01]} rotation={[0, Math.PI / 2, 0]} material={hairM}>
                <torusGeometry args={[0.03, 0.022, 10, 20]} />
              </mesh>
              <mesh geometry={sphere(0.094)} material={hairM} position={[0, 0.02, -0.015]} scale={[0.92, 0.95, 0.95]} />
              <mesh geometry={sphere(0.05)} material={hairM} position={[0, -0.04, -0.09]} scale={[1.3, 0.8, 0.8]} />
            </>
          ) : (
            <mesh geometry={sphere(0.094)} material={hairM} position={[0, 0.02, -0.012]} scale={[0.9, 0.9, 0.96]} />
          )}
        </group>
      </group>
    </group>
  );
};

/** A dark sleeve + gloved hand reaching from `from` to `to` (world units), for patch-cable close-ups. */
export const NoirArm: React.FC<{ from: V3; to: V3; grip?: number }> = ({ from, to, grip = 0 }) => {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const d = b.clone().sub(a);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const cloth = mat("fabric", "#0c0c0e");
  const skin = mat("fabric", "#141416");
  return (
    <group position={a} quaternion={q}>
      <mesh geometry={capsule(0.045, Math.max(0.01, len - 0.16))} material={cloth} position={[0, (len - 0.16) / 2, 0]} castShadow />
      <group position={[0, len - 0.05, 0]}>
        <mesh material={skin} castShadow>
          <RoundedBoxGeo args={[0.085, 0.1, 0.04]} radius={0.018} />
        </mesh>
        {/* fingers curl around the plug */}
        <mesh material={skin} position={[0, 0.06, 0.012 + grip * 0.01]} rotation={[0.4 + grip * 0.6, 0, 0]} castShadow>
          <RoundedBoxGeo args={[0.08, 0.05, 0.03]} radius={0.012} />
        </mesh>
        <mesh geometry={capsule(0.012, 0.035)} material={skin} position={[0.05, 0.02, 0.02]} rotation={[0, 0, -0.7]} />
      </group>
    </group>
  );
};
