// EP036 film: shared helpers — VO clock lookups, easing, camera shots, segmented lining rings, train cars.

import React, { useMemo } from "react";
import { DoubleSide, ExtrudeGeometry, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Shot } from "../../../core/render/Post.tsx";
import { annularSector } from "../World.tsx";
import { P } from "../layout.ts";
import timeline from "../timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TL = timeline as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TL.sections;
const WORDS: Word[] = TL.clips.flatMap((c) => c.words);

/** Start second of the first word (after `after` s) whose text starts with `prefix` (case-insensitive). */
export const W = (prefix: string, after = 0): number => {
  const p = prefix.toLowerCase();
  const hit = WORDS.find((w) => w.s >= after - 1e-6 && w.w.toLowerCase().startsWith(p));
  if (!hit) throw new Error(`timeline word not found: ${prefix} after ${after}`);
  return hit.s;
};
export const WE = (prefix: string, after = 0): number => {
  const p = prefix.toLowerCase();
  const hit = WORDS.find((w) => w.s >= after - 1e-6 && w.w.toLowerCase().startsWith(p));
  if (!hit) throw new Error(`timeline word not found: ${prefix}`);
  return hit.e;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** 0..1 progress of t across [a, b], smoothed. */
export const prog = (t: number, a: number, b: number, e: (x: number) => number = smooth) => e(clamp01((t - a) / (b - a)));
export const lerp3 = (a: readonly number[], b: readonly number[], k: number): [number, number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Orbit-style shot description, easier to key than raw positions. */
export type Pose = { target: readonly [number, number, number]; yaw: number; pitch: number; dist: number; fov: number };
export const poseShot = (p: Pose): Shot => {
  const y = (p.yaw * Math.PI) / 180, e = (p.pitch * Math.PI) / 180;
  return {
    pos: [p.target[0] + p.dist * Math.sin(y) * Math.cos(e), p.target[1] + p.dist * Math.sin(e), p.target[2] + p.dist * Math.cos(y) * Math.cos(e)],
    target: [p.target[0], p.target[1], p.target[2]],
    fov: p.fov,
    focus: p.dist,
    aperture: 0,
    maxBlur: 0,
    exposure: 1,
  };
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  target: lerp3(a.target, b.target, k),
  yaw: lerp(a.yaw, b.yaw, k),
  pitch: lerp(a.pitch, b.pitch, k),
  dist: lerp(a.dist, b.dist, k),
  fov: lerp(a.fov, b.fov, k),
});
export const rawShot = (pos: readonly number[], target: readonly number[], fov: number): Shot => ({
  pos: [pos[0], pos[1], pos[2]],
  target: [target[0], target[1], target[2]],
  fov,
  focus: 10,
  aperture: 0,
  maxBlur: 0,
  exposure: 1,
});

// ---------- segmented lining (axis = +z, rings stacked toward -z from z0) ----------
export const Rings: React.FC<{
  R: number;
  r: number;
  len: number;
  n: number;
  z0: number;
  segs?: number;
  /** keep only segments whose mid-angle lies in [a0, a1] (radians), for half-section cutaways */
  arc?: [number, number];
  /** 0..1 extra glow on the gaskets (sealing beat) */
  glow?: number;
  /** number of fully built rings (others hidden), fractional = last ring partly erected */
  built?: number;
}> = ({ R, r, len, n, z0, segs = 6, arc, glow = 0, built }) => {
  const step = (Math.PI * 2) / segs;
  const geos = useMemo(
    () =>
      Array.from({ length: segs }, (_, k) =>
        new ExtrudeGeometry(annularSector(R - 0.02, r, k * step + 0.02, (k + 1) * step - 0.02), {
          depth: len - 0.12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.03,
          bevelSegments: 2,
          curveSegments: 20,
        }),
      ),
    [R, r, len, segs, step],
  );
  const cut = useMemo(() => new MeshStandardMaterial({ color: P.concreteCut, roughness: 0.82 }), []);
  const inner = useMemo(() => new MeshStandardMaterial({ color: P.concreteIn, roughness: 0.85 }), []);
  const midR = (R + r) / 2;
  const out: React.ReactNode[] = [];
  const nb = built ?? n;
  for (let i = 0; i < n; i++) {
    if (i >= Math.ceil(nb)) break;
    const rot = (i % 2) * (step / 2) + 0.21;
    const z = z0 - (i + 1) * len + 0.06;
    const partial = i === Math.floor(nb) ? nb - Math.floor(nb) : 1;
    for (let k = 0; k < segs; k++) {
      const mid = rot + (k + 0.5) * step;
      const m = ((mid % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (arc && !(m >= arc[0] && m <= arc[1]) && !(m + 2 * Math.PI >= arc[0] && m + 2 * Math.PI <= arc[1])) continue;
      // erect segments one by one: segment k appears when partial > k/segs, sliding in radially
      const appear = clamp01((partial - k / segs) * segs);
      if (appear <= 0) continue;
      const slide = (1 - easeOut(appear)) * 0.9;
      out.push(
        <mesh key={`${i}-${k}`} geometry={geos[k]} material={[cut, inner]} position={[-Math.cos(mid) * slide, -Math.sin(mid) * slide, z]} rotation={[0, 0, rot]} castShadow receiveShadow />,
      );
      const ga = rot + k * step;
      out.push(
        <mesh key={`g${i}-${k}`} position={[Math.cos(ga) * midR, Math.sin(ga) * midR, z + len / 2 - 0.06]} rotation={[0, 0, ga]} visible={appear >= 1}>
          <boxGeometry args={[R - r - 0.08, 0.09, len - 0.04]} />
          <meshStandardMaterial color={P.gasket} roughness={0.6} emissive={P.gasket} emissiveIntensity={0.25 + glow * 1.6} />
        </mesh>,
      );
    }
    if (i > 0 && !arc) {
      out.push(
        <mesh key={`c${i}`} position={[0, 0, z + len - 0.03]}>
          <ringGeometry args={[r + 0.04, R - 0.06, 72]} />
          <meshStandardMaterial color={P.gasket} roughness={0.6} side={DoubleSide} emissive={P.gasket} emissiveIntensity={0.25 + glow * 1.6} />
        </mesh>,
      );
    }
  }
  return <group>{out}</group>;
};

// ---------- train (axis = z, front at +z) ----------
const bodyCache = new Map<string, RoundedBoxGeometry>();
const body = (w: number, h: number, l: number) => {
  const k = `${w}|${h}|${l}`;
  if (!bodyCache.has(k)) bodyCache.set(k, new RoundedBoxGeometry(w, h, l, 4, 0.28));
  return bodyCache.get(k)!;
};
/** A generic metro car (no real livery). `front` adds a cab face at +z. */
export const Car: React.FC<{ w?: number; h?: number; l?: number; front?: boolean; rear?: boolean; lit?: number }> = ({ w = 2.2, h = 2.5, l = 6.4, front = false, rear = false, lit = 0.5 }) => (
  <group>
    <mesh geometry={body(w, h, l)} castShadow receiveShadow>
      <meshPhysicalMaterial color="#f2f3f1" roughness={0.3} metalness={0.15} clearcoat={0.6} clearcoatRoughness={0.15} />
    </mesh>
    <mesh position={[0, -h * 0.18, 0]}>
      <boxGeometry args={[w + 0.02, 0.22, l - 0.45]} />
      <meshStandardMaterial color={P.mint} roughness={0.45} />
    </mesh>
    {[-1, 1].map((sx) =>
      Array.from({ length: 3 }, (_, i) => (
        <mesh key={`${sx}${i}`} position={[(sx * w) / 2 + sx * 0.006, h * 0.15, l / 2 - 1.2 - i * 2.0]} rotation={[0, (sx * Math.PI) / 2, 0]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#1b2731" emissive="#ffe8b8" emissiveIntensity={lit} roughness={0.1} />
        </mesh>
      )),
    )}
    {front ? (
      <group position={[0, 0, l / 2 + 0.005]}>
        <mesh position={[0, h * 0.18, 0]}>
          <planeGeometry args={[w * 0.78, h * 0.36]} />
          <meshPhysicalMaterial color="#14202a" roughness={0.06} clearcoat={1} metalness={0.2} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * w * 0.3, -h * 0.3, 0.01]}>
            <circleGeometry args={[0.12, 20]} />
            <meshStandardMaterial color="#fff8e6" emissive="#fff1c9" emissiveIntensity={5} />
          </mesh>
        ))}
      </group>
    ) : null}
    {rear ? (
      <group position={[0, 0, -l / 2 - 0.005]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, h * 0.18, 0]}>
          <planeGeometry args={[w * 0.78, h * 0.36]} />
          <meshPhysicalMaterial color="#14202a" roughness={0.06} clearcoat={1} metalness={0.2} />
        </mesh>
        <mesh position={[0, -h * 0.18, 0.004]}>
          <planeGeometry args={[w - 0.2, 0.22]} />
          <meshStandardMaterial color={P.mint} roughness={0.45} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * w * 0.3, -h * 0.34, 0.01]}>
            <circleGeometry args={[0.1, 20]} />
            <meshStandardMaterial color="#ff5a4a" emissive="#ff3b2e" emissiveIntensity={4} />
          </mesh>
        ))}
        <mesh position={[0, h * 0.42, 0.004]}>
          <planeGeometry args={[w * 0.4, 0.14]} />
          <meshStandardMaterial color="#20262c" emissive={P.amber} emissiveIntensity={0.2} />
        </mesh>
      </group>
    ) : null}
    <mesh position={[0, -h / 2 - 0.08, 0]}>
      <boxGeometry args={[w - 0.4, 0.18, l - 0.8]} />
      <meshStandardMaterial color="#3a3d40" roughness={0.7} />
    </mesh>
  </group>
);

/** A short train: `cars` cars stacked toward -z behind the cab, cab front at local z = 0. */
export const Train: React.FC<{ cars?: number; w?: number; h?: number; l?: number; lit?: number }> = ({ cars = 3, w, h, l = 6.4, lit }) => (
  <group>
    {Array.from({ length: cars }, (_, i) => (
      <group key={i} position={[0, 0, -l / 2 - i * (l + 0.25)]}>
        <Car w={w} h={h} l={l} front={i === 0} rear={i === cars - 1} lit={lit} />
      </group>
    ))}
  </group>
);

/** Stylised worker (no face): helmet + vest capsule figure. */
export const Worker: React.FC<{ lift?: number }> = ({ lift = 0 }) => (
  <group>
    <mesh position={[0, 0.45, 0]} castShadow>
      <capsuleGeometry args={[0.16, 0.5, 6, 12]} />
      <meshStandardMaterial color="#2f3d4a" roughness={0.7} />
    </mesh>
    <mesh position={[0, 1.05, 0]} castShadow>
      <capsuleGeometry args={[0.22, 0.4, 6, 12]} />
      <meshStandardMaterial color="#f08a3e" roughness={0.6} />
    </mesh>
    <mesh position={[0, 1.55, 0]} castShadow>
      <sphereGeometry args={[0.17, 20, 16]} />
      <meshStandardMaterial color="#e9dccb" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.66, 0]} castShadow>
      <sphereGeometry args={[0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#f4b33f" roughness={0.4} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.27, 1.05 + lift * 0.25, 0.18]} rotation={[-0.9 - lift * 0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
        <meshStandardMaterial color="#f08a3e" roughness={0.6} />
      </mesh>
    ))}
  </group>
);
