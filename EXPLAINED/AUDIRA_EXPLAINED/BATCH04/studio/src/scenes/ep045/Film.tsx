// AE-045 film (POLYVERSE): "GPS tetap bisa menunjukkan lokasi meski tanpa internet?"
// One continuous pastel low-poly world (valley + phone monument from the cover), an orbit diorama and
// a floating-island trilateration board. Every beat is keyed to word times in timeline.json
// (Audio Master Clock); all motion derives from useCurrentFrame(). Signals only ever travel DOWN.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import TL from "./timeline.json";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { LowPolyTree } from "../../kits/polyverse/nature/LowPolyTree.tsx";
import { hash } from "../../kits/polyverse/core/noise.ts";
import { Outro } from "../_shared/Outro.tsx";
import {
  C,
  TITLE,
  Terrain,
  Road,
  ROAD_CURVE,
  RoundTree,
  TREES,
  ROUND_COLORS,
  Rock,
  Cloud,
  Mountains,
  SkyDome,
  useFontGate,
  drawScreen,
  drawSign,
  drawPanel,
  PHONE,
  PHONE_POS,
  PHONE_ROT,
  SIGNAL_TARGET,
  PhoneStand,
  SATS,
  Signpost,
  terrainH,
} from "./Cover.tsx";

export const TOTAL_SECONDS: number = TL.total;
const FILM_FPS = 60;

// ---------------------------------------------------------------- timeline helpers
type Word = { w: string; s: number; e: number };
const WORDS: Word[] = TL.clips.flatMap((c) => c.words as Word[]);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** Start (s) of the n-th occurrence of a spoken word. Throws if the script changed. */
const at = (w: string, n = 0): number => {
  let k = 0;
  for (const x of WORDS) {
    if (norm(x.w) === norm(w)) {
      if (k === n) return x.s;
      k++;
    }
  }
  throw new Error(`ep045: word "${w}"#${n} not in timeline`);
};
const SEC = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const glide = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const backOut = (x: number) => {
  const t = clamp01(x);
  const c1 = 1.7;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const ramp = (t: number, a: number, d = 0.45) => clamp01((t - a) / d);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerpV = (a: THREE.Vector3, b: THREE.Vector3, u: number) => a.clone().lerp(b, u);
/** Point in the phone's local frame (x right, y up, z out of the screen). */
const PL = (x: number, y: number, z: number) => V(x, y, z).applyEuler(PHONE_ROT).add(PHONE_POS);

// ---------------------------------------------------------------- shots
type Scene = "valley" | "orbit" | "board";
type Cam = { pos: THREE.Vector3; target: THREE.Vector3; fov?: number };
type Shot = { id: string; start: number; scene: Scene; cam: (u: number, t: number) => Cam };

const SAT_A = SATS[0].pos;
const T = {
  s2: SEC.KONTEKS[0] - 0.2,
  s3: at("Satelit") - 0.25,
  s4: at("HP-mu") - 0.3,
  s5: SEC.MEKANISME[0] - 0.2,
  s6: at("dari") - 0.15,
  s7: at("HP") - 0.2,
  s8: at("Dengan") - 0.2,
  s9: at("Tiga") - 0.2,
  s10: SEC.REVEAL[0] - 0.2,
  s11: at("Untuk", 2) - 0.25,
  s12: SEC.PAYOFF[0] - 0.2,
  s13: at("Titik", 2) - 0.25,
  s14: SEC.OUTRO[0] - 0.2,
};

// orbit diorama geometry (Earth radius 2.2; GPS orbit ≈ 4.17 Earth radii from the centre)
const EARTH_R = 2.2;
const ORBIT_R = EARTH_R * 4.17;
const INCL = (55 * Math.PI) / 180;
const orbitPos = (plane: number, phase: number, t: number) => {
  const a = phase + t * 0.12;
  const p = V(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R);
  p.applyAxisAngle(V(1, 0, 0), INCL);
  p.applyAxisAngle(V(0, 1, 0), (plane * 2 * Math.PI) / 3 + 0.4);
  return p;
};
const ORBIT_SATS = [0, 1, 2].flatMap((pl) => [0, 1, 2].map((k) => ({ pl, ph: k * 2.1 + pl * 0.7 })));
const HERO_ORBIT = ORBIT_SATS[1];

// trilateration board (floating island)
const P_FIX = V(0.6, 0.06, 0.8);
const BOARD_SATS = [V(-3.5, 7.6, -2.5), V(4.0, 8.4, -2.8), V(-2.6, 8.0, 4.2), V(3.8, 7.2, 3.5)];

const SHOTS: Shot[] = [
  {
    id: "S1 hook: dead data, live dot",
    start: 0,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(PL(-0.2, 0.85, 10.0), PL(0.9, 1.0, 13.5), glide(u)), target: lerpV(PL(-0.2, 0.85, 0), PL(0, 0.7, 0), glide(u)) }),
  },
  {
    id: "S2 GPS ≠ internet, tilt to sky",
    start: T.s2,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(PL(1.6, 0.6, 11.5), PL(0.8, -1.8, 8.0), glide(u)), target: lerpV(PL(0, 1.6, 0), V(-0.4, 10.2, -7), glide(u)) }),
  },
  {
    id: "S3 ride up the signal to the satellite (lighthouse)",
    start: T.s3,
    scene: "valley",
    cam: (u) => {
      const k = glide(clamp01(u * 1.6));
      const a = 0.4 + u * 0.7;
      const orbit = SAT_A.clone().add(V(Math.sin(a) * 7.6, -1.6, Math.cos(a) * 7.6));
      return { pos: lerpV(SIGNAL_TARGET.clone().add(V(1.4, -0.4, 3.2)), orbit, k), target: lerpV(SIGNAL_TARGET.clone().lerp(SAT_A, 0.5), SAT_A.clone().add(V(0, -0.9, 0)), k) };
    },
  },
  {
    id: "S4 ride a pulse down: phone only listens",
    start: T.s4,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(SAT_A.clone().add(V(3.4, 0.6, 7.0)), PL(2.6, 2.2, 10.5), smooth(u)), target: lerpV(SAT_A.clone().lerp(SIGNAL_TARGET, 0.5), PL(0, 1.6, 0), smooth(clamp01(u * 1.4))) }),
  },
  {
    id: "S5 atomic clock, time + position packet",
    start: T.s5,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(SAT_A.clone().add(V(-5.0, 0.4, 5.2)), SAT_A.clone().add(V(-2.2, -0.6, 7.4)), glide(u)), target: lerpV(SAT_A.clone().add(V(0, 0.1, 0)), SAT_A.clone().add(V(0.3, -0.9, 0)), glide(u)) }),
  },
  {
    id: "S6 crane out to orbit: ~20,200 km, tilted paths",
    start: T.s6,
    scene: "orbit",
    cam: (u, t) => {
      const sat = orbitPos(HERO_ORBIT.pl, HERO_ORBIT.ph, t);
      const near = sat.clone().add(sat.clone().normalize().multiplyScalar(3.2)).add(V(1.6, 1.0, 1.4));
      const far = V(3, 9, 30);
      const k = glide(u);
      return { pos: lerpV(near, far, k), target: lerpV(sat, V(0, 3.2, 0), k), fov: 36 };
    },
  },
  {
    id: "S7 travel time -> distance",
    start: T.s7,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(V(9.5, 7.2, 13.0), V(8.2, 8.6, 11.0), glide(u)), target: lerpV(V(-1.4, 8.6, -3.6), V(-1.8, 9.0, -4.2), glide(u)) }),
  },
  {
    id: "S8 distance rings on the floating island",
    start: T.s8,
    scene: "board",
    cam: (u) => ({ pos: lerpV(V(-3, 13, 27), V(1, 19, 24), glide(u)), target: lerpV(V(0, 3.2, 0), V(0.4, 2.4, 0.6), glide(u)) }),
  },
  {
    id: "S9 three for the point, fourth fixes the clock",
    start: T.s9,
    scene: "board",
    cam: (u) => ({ pos: lerpV(V(1, 19, 24), V(2.0, 27, 13), glide(u)), target: lerpV(V(0.4, 2.4, 0.6), P_FIX.clone().add(V(0, 1.6, -1.2)), glide(u)) }),
  },
  {
    id: "S10 so what is internet for?",
    start: T.s10,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(PL(-1.8, 1.8, 12.5), PL(-0.6, 1.6, 10.5), glide(u)), target: lerpV(PL(0, 1.9, 0), PL(0, 1.7, 0), glide(u)) }),
  },
  {
    id: "S11 map, traffic, faster first fix",
    start: T.s11,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(PL(-0.6, 0.8, 18.0), PL(0.9, 0.6, 16.8), glide(u)), target: lerpV(PL(0, 0.6, 0), PL(0, 0.5, 0), glide(u)) }),
  },
  {
    id: "S12 download offline map",
    start: T.s12,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(PL(0.6, 0.2, 9.4), PL(0.1, 0.1, 7.6), glide(u)), target: lerpV(PL(0, 0.15, 0), PL(0, 0.1, 0), glide(u)) }),
  },
  {
    id: "S13 car keeps being guided, traffic info gone",
    start: T.s13,
    scene: "valley",
    cam: (u) => {
      const c = carPose(u);
      const back = c.tan.clone().multiplyScalar(-5.0);
      const pos = c.pos.clone().add(back).add(V(1.0, 3.1, 0));
      const target = c.pos.clone().add(c.tan.clone().multiplyScalar(1.6)).add(V(0, 0.2, 0));
      return { pos, target };
    },
  },
  {
    id: "S14 outro: GPS listens to the sky",
    start: T.s14,
    scene: "valley",
    cam: (u) => ({ pos: lerpV(V(1.4, 6.0, 19.5), V(0.4, 7.6, 21.5), glide(u)), target: lerpV(V(0, 5.6, 0), V(0, 4.9, 0), glide(u)) }),
  },
];
const shotAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].start) i = k;
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].start : TL.total;
  return { shot: SHOTS[i], idx: i, u: clamp01((t - SHOTS[i].start) / (end - SHOTS[i].start)), local: t - SHOTS[i].start };
};

// ---------------------------------------------------------------- car on the road
const CAR_U0 = 0.06;
const CAR_U1 = 0.8;
function carPose(u: number) {
  const s = CAR_U0 + (CAR_U1 - CAR_U0) * smooth(u * 0.95 + 0.02);
  const p = ROAD_CURVE.getPointAt(s);
  const tan = ROAD_CURVE.getTangentAt(s).setY(0).normalize();
  const y = terrainH(p.x, p.z) + 0.09;
  const ahead = ROAD_CURVE.getPointAt(Math.min(1, s + 0.02));
  const pitch = Math.atan2(terrainH(ahead.x, ahead.z) - terrainH(p.x, p.z), Math.hypot(ahead.x - p.x, ahead.z - p.z));
  return { s, pos: V(p.x, y, p.z), tan, yaw: Math.atan2(tan.x, tan.z), pitch };
}

const Car: React.FC<{ u: number }> = ({ u }) => {
  const c = carPose(u);
  return (
    <group position={c.pos} rotation={[0, c.yaw, 0]}>
      <group rotation={[-c.pitch, 0, 0]} scale={0.95}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <RoundedBoxGeo args={[0.56, 0.26, 1.04]} radius={0.08} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#ff8b7b" />
        </mesh>
        <mesh position={[0, 0.48, -0.06]} castShadow>
          <RoundedBoxGeo args={[0.46, 0.22, 0.56]} radius={0.07} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#fff4ea" />
        </mesh>
        <mesh position={[0, 0.49, 0.235]}>
          <planeGeometry args={[0.38, 0.15]} />
          <meshStandardMaterial color="#9fd0f5" roughness={0.2} />
        </mesh>
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 0.28, 0.12, sz * 0.32]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
              <meshStandardMaterial color="#323a52" flatShading roughness={0.7} />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.27, 0.53]}>
          <boxGeometry args={[0.4, 0.06, 0.02]} />
          <meshBasicMaterial color="#fff6c8" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/** Blue guidance ribbon on the road, from the car to the phone hill. */
const RouteRibbon: React.FC<{ from: number; show: number }> = ({ from, show }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  useLayoutEffect(() => {
    const N = 48;
    const v: number[] = [];
    const to = from + (0.985 - from) * show;
    const P = (s: number, side: number) => {
      const p = ROAD_CURVE.getPointAt(s);
      const t = ROAD_CURVE.getTangentAt(s);
      const n = V(-t.z, 0, t.x).normalize().multiplyScalar(side * 0.16);
      const x = p.x + n.x, z = p.z + n.z;
      return [x, terrainH(x, z) + 0.13, z];
    };
    for (let i = 0; i < N; i++) {
      const a = from + ((to - from) * i) / N, b = from + ((to - from) * (i + 1)) / N;
      const p0 = P(a, -1), p1 = P(a, 1), p2 = P(b, -1), p3 = P(b, 1);
      v.push(...p0, ...p2, ...p1, ...p1, ...p2, ...p3);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    geo.computeVertexNormals();
  }, [geo, from, show]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={C.blue} transparent opacity={0.85} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- satellites (brighter gold than the cover)
const GOLD = "#f4c55a";
const SatelliteBody: React.FC<{ panelTex: THREE.Texture | null; spin: number; brand?: THREE.Texture | null }> = ({ panelTex, spin, brand }) => (
  <group rotation={[0, spin, 0]}>
    {brand
      ? [0, 1, 2, 3].map((i) => (
          <mesh key={`b${i}`} rotation={[0, (i * Math.PI) / 2, 0]} position={[Math.sin((i * Math.PI) / 2) * 0.356, 0.1, Math.cos((i * Math.PI) / 2) * 0.356]}>
            <planeGeometry args={[0.66, 0.26]} />
            <meshBasicMaterial map={brand} transparent toneMapped={false} />
          </mesh>
        ))
      : null}
    <mesh castShadow>
      <RoundedBoxGeo args={[0.7, 0.9, 0.7]} radius={0.06} segments={2} />
      <meshPhysicalMaterial color={GOLD} metalness={0.45} roughness={0.3} clearcoat={0.5} clearcoatRoughness={0.2} emissive="#6b4a08" emissiveIntensity={0.25} flatShading />
    </mesh>
    {[-1, 1].map((side) => (
      <group key={side}>
        <mesh position={[side * 0.62, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.55, 6]} />
          <meshStandardMaterial color="#e3e6ef" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[side * 1.5, 0.05, 0]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[1.3, 0.04, 0.62]} />
          {panelTex ? <meshStandardMaterial map={panelTex} metalness={0.3} roughness={0.35} emissive="#1b3a7a" emissiveIntensity={0.25} /> : <meshStandardMaterial color={C.panel} />}
        </mesh>
      </group>
    ))}
    {[-0.2, 0, 0.2].flatMap((x) =>
      [-0.2, 0.2].map((z) => (
        <mesh key={`${x}${z}`} position={[x, -0.55, z]}>
          <cylinderGeometry args={[0.05, 0.07, 0.22, 6]} />
          <meshStandardMaterial color="#f2f3f8" metalness={0.4} roughness={0.35} flatShading />
        </mesh>
      )),
    )}
    <mesh position={[0, 0.55, 0]}>
      <coneGeometry args={[0.16, 0.25, 6]} />
      <meshStandardMaterial color="#f2f3f8" metalness={0.4} roughness={0.35} flatShading />
    </mesh>
  </group>
);

/** Satellite whose antenna array (local -Y) faces `aim`. */
const Satellite: React.FC<{ pos: THREE.Vector3; aim: THREE.Vector3; s: number; f: number; seed: number; panelTex: THREE.Texture | null; brand?: THREE.Texture | null }> = ({ pos, aim, s, f, seed, panelTex, brand }) => {
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), aim.clone().sub(pos).normalize());
  return (
    <group position={pos} quaternion={q} scale={s}>
      <SatelliteBody panelTex={panelTex} brand={brand} spin={seed * 0.7 + Math.sin(f * 0.01 + seed) * 0.08} />
    </group>
  );
};

/** Thin one-way line with pulses travelling satellite -> receiver only. */
const SignalLine: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; f: number; seed: number; opacity?: number; speed?: number; eye?: THREE.Vector3 }> = ({ from, to, f, seed, opacity = 0.9, speed = 0.006, eye }) => {
  const d = to.clone().sub(from);
  const len = d.length();
  const dir = d.clone().normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
  const mid = from.clone().add(to).multiplyScalar(0.5);
  if (opacity <= 0.01) return null;
  return (
    <group>
      <mesh position={mid} quaternion={q}>
        <cylinderGeometry args={[0.03, 0.03, len, 6]} />
        <meshBasicMaterial color={C.signal} transparent opacity={opacity} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((k) => {
        const t = (f * speed + k / 3 + seed * 0.13) % 1;
        const p = from.clone().addScaledVector(dir, len * (0.06 + t * 0.88));
        // pulses that pass right in front of the lens would read as big pale blobs: fade + shrink them
        const near = eye ? smooth((p.distanceTo(eye) - 2.0) / 3.0) : 1;
        if (near <= 0.02) return null;
        return (
          <mesh key={k} position={p} quaternion={q} scale={[near, 2.6 * near, near]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color="#fff6c8" transparent opacity={opacity * near} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Lighthouse broadcast: open cone shells spreading DOWN from the satellite. */
const Broadcast: React.FC<{ from: THREE.Vector3; aim: THREE.Vector3; f: number; amount: number }> = ({ from, aim, f, amount }) => {
  if (amount <= 0.01) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), aim.clone().sub(from).normalize());
  return (
    <group position={from} quaternion={q}>
      {[0, 1, 2].map((k) => {
        const p = (f * 0.008 + k / 3) % 1;
        const L = 0.6 + p * 9;
        return (
          <mesh key={k} position={[0, -L / 2 - 0.5, 0]}>
            <coneGeometry args={[L * 0.42, L, 18, 1, true]} />
            <meshBasicMaterial color="#cdf3ff" transparent opacity={0.28 * (1 - p) * amount} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- phone (film version)
const SW = PHONE.w - 0.22;
const SH = PHONE.h - 0.42;
const canvasToLocal = (px: number, py: number) => [(px / 620 - 0.5) * SW, (0.5 - py / 1140) * SH] as const;

const RedCross: React.FC<{ p: readonly [number, number]; k: number }> = ({ p, k }) => {
  if (k <= 0.001) return null;
  return (
    <group position={[p[0], p[1], PHONE.d / 2 + 0.03]} scale={k}>
      <mesh>
        <circleGeometry args={[0.085, 24]} />
        <meshBasicMaterial color="#ff5a5f" toneMapped={false} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, 0.004]} rotation={[0, 0, (s * Math.PI) / 4]}>
          <planeGeometry args={[0.11, 0.025]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

type ScreenTex = { map: THREE.Texture; grid: THREE.Texture; mapReveal: THREE.Texture };
const FilmPhone: React.FC<{ f: number; t: number; tex: ScreenTex | null; crosses: number; reveal: number; progress: number; receive: number; fixPop: number }> = ({ f, t, tex, crosses, reveal, progress, receive, fixPop }) => {
  const pulse = (f * 0.012) % 1;
  if (tex) {
    // map layer "downloads" from the top: show the top `reveal` fraction of the map texture
    tex.mapReveal.repeat.set(1, Math.max(0.0001, reveal));
    tex.mapReveal.offset.set(0, 1 - Math.max(0.0001, reveal));
  }
  const crossA = canvasToLocal(122, 34);
  const crossB = canvasToLocal(254, 34);
  return (
    <group position={PHONE_POS} rotation={PHONE_ROT}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[PHONE.w, PHONE.h, PHONE.d]} radius={0.16} segments={5} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.phoneBody} />
      </mesh>
      <mesh position={[0, 0, PHONE.d / 2 + 0.006]}>
        <planeGeometry args={[SW, SH]} />
        {tex ? (
          <meshStandardMaterial map={reveal >= 1 || progress <= 0 ? tex.map : tex.grid} emissiveMap={reveal >= 1 || progress <= 0 ? tex.map : tex.grid} emissive="#ffffff" emissiveIntensity={0.95} roughness={0.4} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={C.phoneScreen} />
        )}
      </mesh>
      {tex && progress > 0 && reveal > 0 && reveal < 1 ? (
        <mesh position={[0, SH / 2 - (SH * reveal) / 2, PHONE.d / 2 + 0.009]}>
          <planeGeometry args={[SW, SH * reveal]} />
          <meshBasicMaterial map={tex.mapReveal} toneMapped={false} />
        </mesh>
      ) : null}
      {/* download progress bar */}
      {progress > 0 && progress < 1.05 ? (
        <group position={[0, 1.25, PHONE.d / 2 + 0.03]} scale={Math.min(1, (1.05 - progress) * 8)}>
          <mesh>
            <planeGeometry args={[2.1, 0.5]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.06, 0.003]}>
            <planeGeometry args={[1.8, 0.09]} />
            <meshBasicMaterial color="#dfe5f0" toneMapped={false} />
          </mesh>
          <mesh position={[-0.9 + (1.8 * clamp01(progress)) / 2, -0.06, 0.006]}>
            <planeGeometry args={[Math.max(0.001, 1.8 * clamp01(progress)), 0.09]} />
            <meshBasicMaterial color={C.blue} toneMapped={false} />
          </mesh>
          {/* download glyph: arrow pointing down into the tray */}
          <mesh position={[0, 0.12, 0.004]} rotation={[0, 0, Math.PI]}>
            <circleGeometry args={[0.08, 3]} />
            <meshBasicMaterial color={C.blue} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
      <RedCross p={crossA} k={crosses * 1} />
      <RedCross p={crossB} k={clamp01(crosses * 1.4 - 0.4)} />
      <mesh position={[0, PHONE.h / 2 - 0.12, PHONE.d / 2 + 0.01]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#1b2033" />
      </mesh>
      {/* blue location dot */}
      <group position={[0.05, -0.15, PHONE.d / 2 + 0.03]} scale={1 + fixPop * 0.35}>
        <mesh>
          <circleGeometry args={[0.62 + pulse * 0.25, 40]} />
          <meshBasicMaterial color={C.blue} transparent opacity={0.22 * (1 - pulse * 0.6)} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.24, 40]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.17, 40]} />
          <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.42, 0.005]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.36, 24, -0.55 + Math.PI / 2 + Math.PI, 1.1]} />
          <meshBasicMaterial color={C.blue} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
      {/* receiving antenna glow on the top edge (incoming only) */}
      {receive > 0.01 ? (
        <group position={[0, PHONE.h / 2 + 0.02, 0]}>
          {[0, 1, 2].map((k) => {
            const p = (t * 0.9 + k / 3) % 1;
            return (
              <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} scale={1.4 - p}>
                <ringGeometry args={[0.55, 0.62, 32]} />
                <meshBasicMaterial color="#bff2ff" transparent opacity={receive * p * 0.8} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      ) : null}
      <mesh position={[PHONE.w / 2 + 0.02, 1.4, 0]}>
        <RoundedBoxGeo args={[0.06, 0.7, 0.14]} radius={0.025} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2f3752" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- canvas cards (font-gated)
const card = (draw: (g: CanvasRenderingContext2D, W: number, H: number) => void, W = 512, H = 336) => {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fffaf3";
  g.beginPath();
  g.roundRect(0, 0, W, H, 40);
  g.fill();
  draw(g, W, H);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
const label = (g: CanvasRenderingContext2D, text: string, y: number, size = 46) => {
  g.fillStyle = "#26304a";
  g.font = `600 ${size}px ${FONT}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, y);
};
const drawCards = () => ({
  map: card((g) => {
    g.fillStyle = "#d3ebc9";
    g.fillRect(70, 50, 372, 170);
    g.strokeStyle = "#ffffff";
    g.lineWidth = 16;
    g.beginPath();
    g.moveTo(70, 180);
    g.bezierCurveTo(200, 120, 300, 200, 442, 90);
    g.stroke();
    g.fillStyle = "#c4e4f2";
    g.fillRect(70, 60, 120, 60);
    label(g, "Gambar peta", 280);
  }),
  traffic: card((g) => {
    g.lineCap = "round";
    g.lineWidth = 26;
    const seg = (x0: number, x1: number, c: string) => {
      g.strokeStyle = c;
      g.beginPath();
      g.moveTo(x0, 140);
      g.lineTo(x1, 140);
      g.stroke();
    };
    seg(80, 200, "#5cc285");
    seg(220, 330, "#ffc94d");
    seg(350, 432, "#ff6b6b");
    label(g, "Info macet", 280);
  }),
  fix: card((g) => {
    g.strokeStyle = C.blue;
    g.lineWidth = 12;
    g.beginPath();
    g.arc(256, 128, 70, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = C.blue;
    g.beginPath();
    g.arc(256, 128, 22, 0, Math.PI * 2);
    g.fill();
    // speed lines
    g.lineWidth = 10;
    g.lineCap = "round";
    [[100, 100, 150], [80, 130, 140], [100, 160, 150]].forEach(([x0, y, x1]) => {
      g.beginPath();
      g.moveTo(x0 - 20, y);
      g.lineTo(x1, y);
      g.stroke();
    });
    label(g, "Kunci posisi cepat", 280, 42);
  }),
  internet: card((g) => {
    g.fillStyle = "#26304a";
    g.font = `600 64px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("internet", 256, 130);
    g.fillStyle = C.blue;
    g.font = `600 110px ${FONT}`;
    g.fillText("?", 256, 250);
  }),
  clock: card(
    (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = "#fffaf3";
      g.beginPath();
      g.arc(W / 2, H / 2, W / 2 - 6, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = GOLD;
      g.lineWidth = 14;
      g.stroke();
      g.fillStyle = "#26304a";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.beginPath();
        g.arc(W / 2 + Math.sin(a) * 96, H / 2 - Math.cos(a) * 96, i % 3 ? 5 : 9, 0, Math.PI * 2);
        g.fill();
      }
    },
    256,
    256,
  ),
  packet: card(
    (g) => {
      g.fillStyle = C.blue;
      g.font = `600 52px ${FONT}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("waktu + posisi", 256, 72);
    },
    512,
    144,
  ),
});
type Cards = ReturnType<typeof drawCards>;

const Card3D: React.FC<{ tex: THREE.Texture | null; pos: THREE.Vector3; k: number; w?: number; h?: number; rotY?: number }> = ({ tex, pos, k, w = 1.6, h = 1.05, rotY = -0.16 }) => {
  if (k <= 0.001 || !tex) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={k}>
      <mesh castShadow>
        <RoundedBoxGeo args={[w + 0.08, h + 0.08, 0.08]} radius={0.04} segments={2} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Atomic clock badge: dial + sweeping hands + three electron orbits. */
const AtomClock: React.FC<{ pos: THREE.Vector3; k: number; t: number; tex: THREE.Texture | null }> = ({ pos, k, t, tex }) => {
  if (k <= 0.001) return null;
  return (
    <group position={pos} scale={k * 0.4}>
      <mesh>
        <circleGeometry args={[0.9, 40]} />
        <meshBasicMaterial color="#fffaf3" transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.98, 40]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`k${i}`} position={[Math.sin((i / 12) * Math.PI * 2) * 0.72, Math.cos((i / 12) * Math.PI * 2) * 0.72, 0.01]}>
          <circleGeometry args={[i % 3 ? 0.035 : 0.06, 8]} />
          <meshBasicMaterial color="#26304a" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.02]} rotation={[0, 0, -t * 6]}>
        <planeGeometry args={[0.05, 0.7]} />
        <meshBasicMaterial color="#ff6b6b" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]} rotation={[0, 0, -t * 0.5]}>
        <planeGeometry args={[0.08, 0.45]} />
        <meshBasicMaterial color="#26304a" toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[1.2, (i * Math.PI) / 3 + t * 0.4, 0]}>
          <torusGeometry args={[1.2, 0.025, 6, 48]} />
          <meshBasicMaterial color="#8fdcff" toneMapped={false} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const a = t * 3 + (i * 2 * Math.PI) / 3;
        const p = V(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0).applyEuler(new THREE.Euler(1.2, (i * Math.PI) / 3 + t * 0.4, 0));
        return (
          <mesh key={`e${i}`} position={p}>
            <icosahedronGeometry args={[0.09, 0]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- scenes
const Lights: React.FC<{ space?: boolean }> = ({ space }) => (
  <>
    <hemisphereLight args={[space ? "#dfe4ff" : "#fde9da", space ? "#3a3f73" : "#6fae86", space ? 0.7 : 1.1]} />
    <directionalLight
      position={[9, 15, 11]}
      color={C.sun}
      intensity={3.0}
      castShadow={!space}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={1}
      shadow-camera-far={60}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-8, 6, -10]} color="#ffb3a0" intensity={0.9} />
  </>
);

const TRAFFIC_PINS = [0.42, 0.6, 0.72].map((s, i) => {
  const p = ROAD_CURVE.getPointAt(s);
  return { p: V(p.x, terrainH(p.x, p.z) + 1.7, p.z), c: ["#ff6b6b", "#ffc94d", "#ff6b6b"][i] };
});

const Valley: React.FC<{ f: number; t: number; sh: ReturnType<typeof shotAt>; tex: ScreenTex | null; cards: Cards | null; sign: THREE.Texture | null; panel: THREE.Texture | null; eye: THREE.Vector3 }> = ({ f, t, sh, tex, cards, sign, panel, eye }) => {
  const id = sh.idx; // 0-based shot index
  // hook: the two dead-data crosses pop on "habis"
  const crosses = backOut(ramp(t, at("habis") , 0.35));
  // payoff: download progress & map reveal
  const progress = t >= T.s12 && t < T.s13 ? clamp01((t - at("unduh")) / (at("berangkat") + 0.3 - at("unduh"))) : t >= T.s13 ? 1 : 0;
  const reveal = t >= T.s12 && t < T.s13 ? progress : 1;
  const receive = id === 3 ? smooth(ramp(t, at("mendengarkan"), 0.4)) : id === 0 ? 0.6 : 0;
  // lighthouse broadcast cones during S3 + S4
  const bcast = id === 2 ? smooth(ramp(t, at("menyiarkan"), 0.5)) : id === 3 ? 1 - smooth(ramp(t, T.s4 + 1.5, 1.0)) : id === 4 ? 0.7 : 0;
  // S7: one timed pulse from satellite A to the phone, then a distance ruler
  const flight = id === 6 ? clamp01((t - at("HP")) / (at("tiba") - at("HP"))) : 0;
  const ruler = id === 6 ? smooth(ramp(t, at("mengubahnya"), 1.0)) : 0;
  // S11 cards
  const cMap = id === 10 ? backOut(ramp(t, at("gambar"), 0.45)) : 0;
  const cTraffic = id === 10 ? backOut(ramp(t, at("macet"), 0.45)) : 0;
  const cFix = id === 10 ? backOut(ramp(t, at("mempercepat"), 0.45)) : 0;
  const cloudQ = id === 9 ? backOut(ramp(t, at("internet", 1), 0.5)) : id === 1 ? backOut(ramp(t, at("internet", 0), 0.4)) : 0;
  const pinsK = id === 12 ? 1 - smooth(ramp(t, at("tanpa"), 0.6)) : id === 10 ? smooth(ramp(t, at("macet"), 0.5)) : 0;
  // S5 atomic clock + packet
  const clockK = id === 4 ? backOut(ramp(t, at("jam"), 0.45)) : 0;
  const packetU = id === 4 ? clamp01((t - at("waktu")) / 1.6) : -1;
  const lineDim = id === 6 ? 0.35 : 0.9;

  return (
    <>
      <fog attach="fog" args={["#f3dfd8", 40, 140]} />
      <SkyDome />
      <Lights />
      <Mountains />
      <Terrain />
      <Road />
      <PhoneStand />
      <FilmPhone f={f} t={t} tex={tex} crosses={crosses} reveal={reveal} progress={progress} receive={receive} fixPop={0} />
      <Signpost tex={sign} />
      {TREES.map((tr) => {
        const y = terrainH(tr.x, tr.z);
        return tr.kind === 0 ? (
          <LowPolyTree key={tr.seed} position={[tr.x, y, tr.z]} scale={tr.s} f={f} seed={tr.seed} />
        ) : (
          <RoundTree key={tr.seed} p={[tr.x, y, tr.z]} s={tr.s * 1.1} f={f} seed={tr.seed} color={ROUND_COLORS[tr.seed % ROUND_COLORS.length]} />
        );
      })}
      <RoundTree p={[-2.75, terrainH(-2.75, 5.6), 5.6]} s={0.95} f={f} seed={91} color="#f2b8a2" />
      <LowPolyTree position={[3.15, terrainH(3.15, 5.9), 5.9]} scale={0.8} f={f} seed={92} />
      <RoundTree p={[2.6, terrainH(2.6, 6.6), 6.6]} s={0.7} f={f} seed={93} color="#b7dc8f" />
      {[
        [-2.9, 3.2, 0.5, 0.4],
        [3.1, 1.6, 0.4, 1.1],
        [-4.2, 6.5, 0.6, 2.2],
        [1.7, -1.8, 0.45, 0.7],
      ].map(([x, z, s, r], i) => (
        <Rock key={i} p={[x, terrainH(x, z) + 0.1, z]} s={s} r={r} />
      ))}
      <Cloud p={[-9.5, 6.6, -30]} s={2.6} f={f} />
      <Cloud p={[10, 7.2, -32]} s={3.0} f={f} />
      <Cloud p={[1.5, 9.4, -40]} s={2.4} f={f} />
      <Cloud p={[-2, 15.5, -36]} s={2.0} f={f} />
      {SATS.map((s, i) => (
        <SignalLine key={`l${i}`} from={s.pos} to={SIGNAL_TARGET} f={f} seed={i} opacity={i === 0 ? 0.9 : lineDim} eye={eye} />
      ))}
      {SATS.map((s, i) => (
        <Satellite key={`s${i}`} pos={s.pos} aim={SIGNAL_TARGET} s={s.s} f={f} seed={i} panelTex={panel} brand={i === 0 ? sign : null} />
      ))}
      <Broadcast from={SAT_A} aim={SIGNAL_TARGET} f={f} amount={bcast} />
      {/* S2 / S10: floating internet cloud (crossed in S2, question in S10) */}
      {cloudQ > 0.001 ? (
        <group position={PL(id === 1 ? 0.6 : 0, id === 1 ? 3.5 : 4.2, id === 1 ? 1.6 : 0.6).add(V(0, Math.sin(t * 2) * 0.08, 0))} scale={cloudQ}>
          <Cloud p={[0, 0, -0.3]} s={1.1} f={0} />
          {id === 9 ? <Card3D tex={cards?.internet ?? null} pos={V(0, -0.1, 0.75)} k={1} w={1.3} h={0.85} rotY={0} /> : null}
          {id === 1 ? (
            <group position={[0, 0, 0.9]}>
              <mesh>
                <circleGeometry args={[0.42, 32]} />
                <meshBasicMaterial color="#ff5a5f" toneMapped={false} />
              </mesh>
              {[1, -1].map((s) => (
                <mesh key={s} position={[0, 0, 0.01]} rotation={[0, 0, (s * Math.PI) / 4]}>
                  <planeGeometry args={[0.56, 0.11]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
              ))}
            </group>
          ) : null}
        </group>
      ) : null}
      {/* S5: atomic clock beside satellite A + "time + position" packet riding the signal down */}
      <AtomClock pos={SAT_A.clone().add(V(-0.75, 0.38, 0.2))} k={clockK} t={t} tex={cards?.clock ?? null} />
      {packetU >= 0 ? (
        <Card3D tex={cards?.packet ?? null} pos={SAT_A.clone().lerp(SIGNAL_TARGET, 0.08 + packetU * 0.5).add(V(-0.9, 0, 0.9))} k={backOut(ramp(packetU, 0, 0.25)) * 0.62} w={1.5} h={0.42} rotY={0.5} />
      ) : null}
      {/* S7: the measured pulse and the distance ruler */}
      {id === 6 ? (
        <group>
          {flight > 0 && flight < 1 ? (
            <mesh position={SAT_A.clone().lerp(SIGNAL_TARGET, flight)}>
              <icosahedronGeometry args={[0.22, 0]} />
              <meshBasicMaterial color="#fff6c8" toneMapped={false} />
            </mesh>
          ) : null}
          {Array.from({ length: 13 }, (_, i) => {
            const u = i / 12;
            if (u > ruler) return null;
            const p = SAT_A.clone().lerp(SIGNAL_TARGET, 0.04 + u * 0.92).add(V(0.35, 0, 0.35));
            return (
              <mesh key={i} position={p}>
                <boxGeometry args={[0.55, 0.09, 0.09]} />
                <meshBasicMaterial color={i % 3 === 0 ? "#ff8b7b" : "#ffffff"} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      ) : null}
      {/* S11: what internet is for */}
      <Card3D tex={cards?.map ?? null} pos={PL(-1.45, 2.2, 1.6)} k={cMap} w={1.75} h={1.15} />
      <Card3D tex={cards?.traffic ?? null} pos={PL(1.5, 0.8, 1.9)} k={cTraffic} w={1.75} h={1.15} />
      <Card3D tex={cards?.fix ?? null} pos={PL(-1.4, -0.6, 2.1)} k={cFix} w={1.75} h={1.15} />
      {/* traffic pins on the road (shown with the traffic card, gone in the offline drive) */}
      {pinsK > 0.01
        ? TRAFFIC_PINS.map((p, i) => (
            <group key={i} position={p.p.clone().add(V(0, Math.sin(t * 2 + i) * 0.06, 0))} scale={pinsK * 0.7}>
              <mesh>
                <octahedronGeometry args={[0.28, 0]} />
                <meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.4} flatShading />
              </mesh>
            </group>
          ))
        : null}
      {/* S13: car + blue route */}
      {id === 12 ? (
        <>
          <Car u={sh.u} />
          <RouteRibbon from={carPose(sh.u).s + 0.01} show={smooth(ramp(t, T.s13 + 0.2, 0.8))} />
        </>
      ) : null}
    </>
  );
};

const OrbitSky: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(160, 32, 20);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const a = new THREE.Color("#31336b"), b = new THREE.Color("#6a5f9e"), tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      tmp.copy(a).lerp(b, clamp01(0.5 - pos.getY(i) / 320));
      col.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v: number[] = [];
    for (let i = 0; i < 500; i++) {
      const u = hash(i * 1.37) * 2 - 1, th = hash(i * 7.11) * Math.PI * 2, r = 120;
      const s = Math.sqrt(1 - u * u);
      v.push(Math.cos(th) * s * r, u * r, Math.sin(th) * s * r);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial vertexColors side={THREE.BackSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial color="#fff3e6" size={0.6} sizeAttenuation transparent opacity={0.8} toneMapped={false} />
      </points>
    </>
  );
};

const LowPolyEarth: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(EARTH_R, 5);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const sea = new THREE.Color("#7cc6ec"), sea2 = new THREE.Color("#5fb0e0"), land = new THREE.Color("#8fd19e"), sand = new THREE.Color("#f0d9a6"), ice = new THREE.Color("#f6fbff");
    const tmp = new THREE.Color();
    for (let t = 0; t < pos.count; t += 3) {
      const cx = (pos.getX(t) + pos.getX(t + 1) + pos.getX(t + 2)) / 3 / EARTH_R;
      const cy = (pos.getY(t) + pos.getY(t + 1) + pos.getY(t + 2)) / 3 / EARTH_R;
      const cz = (pos.getZ(t) + pos.getZ(t + 1) + pos.getZ(t + 2)) / 3 / EARTH_R;
      const n = Math.sin(cx * 3.1 + 1.2) * Math.cos(cz * 2.7) + 0.6 * Math.sin(cy * 4.3 + cx * 2.1) + 0.3 * Math.sin(cz * 7 + cy * 3);
      if (Math.abs(cy) > 0.86) tmp.copy(ice);
      else if (n > 0.55) tmp.copy(land);
      else if (n > 0.42) tmp.copy(sand);
      else tmp.copy(hash(t * 0.31) > 0.5 ? sea : sea2);
      for (let k = 0; k < 3; k++) col.set([tmp.r, tmp.g, tmp.b], (t + k) * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[0.3, 0, 0.2]}>
      <meshStandardMaterial vertexColors flatShading roughness={0.8} />
    </mesh>
  );
};

const Orbit: React.FC<{ f: number; t: number; panel: THREE.Texture | null }> = ({ f, t, panel }) => {
  const hero = orbitPos(HERO_ORBIT.pl, HERO_ORBIT.ph, t);
  const surf = hero.clone().normalize().multiplyScalar(EARTH_R + 0.02);
  const alt = smooth(ramp(t, at("ketinggian"), 0.9));
  return (
    <>
      <OrbitSky />
      <Lights space />
      <LowPolyEarth />
      {[0, 1, 2].map((pl) => (
        <group key={pl} rotation={[0, (pl * 2 * Math.PI) / 3 + 0.4, 0]}>
          <group rotation={[INCL, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[ORBIT_R, 0.05, 6, 160]} />
              <meshBasicMaterial color="#dfe5ff" transparent opacity={0.75} toneMapped={false} />
            </mesh>
          </group>
        </group>
      ))}
      {ORBIT_SATS.map((s, i) => {
        const p = orbitPos(s.pl, s.ph, t);
        return <Satellite key={i} pos={p} aim={V(0, 0, 0)} s={s === HERO_ORBIT ? 1.0 : 0.75} f={f} seed={i} panelTex={panel} />;
      })}
      {/* altitude: dashed radial line from "you" on the surface up to the hero satellite */}
      {alt > 0
        ? Array.from({ length: 22 }, (_, i) => {
            const u = i / 21;
            if (u > alt) return null;
            return (
              <mesh key={i} position={surf.clone().lerp(hero, 0.04 + u * 0.9)}>
                <sphereGeometry args={[0.05, 6, 4]} />
                <meshBasicMaterial color="#fff3c4" toneMapped={false} />
              </mesh>
            );
          })
        : null}
      <mesh position={surf}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshBasicMaterial color={C.blue} toneMapped={false} />
      </mesh>
    </>
  );
};

/** Floating low-poly island used as the trilateration board. */
const Board: React.FC<{ f: number; t: number; panel: THREE.Texture | null; ready: boolean }> = ({ f, t, panel, ready }) => {
  const sign = useMemo(() => (ready ? drawSign() : null), [ready]);
  const ringT = [at("jarak", 1), at("ke"), at("satelit", 2), at("satu")];
  const err = 0.09 * (1 - smooth(ramp(t, at("membetulkan"), 0.9)));
  const fourth = backOut(ramp(t, at("satu"), 0.6));
  const dotPop = backOut(ramp(t, at("membetulkan") + 0.7, 0.4));
  const fuzzy = smooth(ramp(t, at("dihitung"), 0.4)) * (1 - dotPop);
  const islandTop = useMemo(() => {
    const g = new THREE.CylinderGeometry(6.6, 6.2, 0.6, 11, 1).toNonIndexed();
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <>
      <fog attach="fog" args={["#f3dfd8", 40, 140]} />
      <SkyDome />
      <Lights />
      <group position={[0, -0.3, 0]}>
        <mesh geometry={islandTop} receiveShadow castShadow>
          <meshStandardMaterial color={C.grassA} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, -3.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[6.2, 5.6, 11, 2]} />
          <meshStandardMaterial color="#9a90b8" flatShading roughness={0.95} />
        </mesh>
      </group>
      {/* map sheet on the island */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.9, 48]} />
        <meshBasicMaterial color="#f3ecdc" transparent opacity={0.98} toneMapped={false} />
      </mesh>
      {/* AUDIRA signboard on the island (brand inside the world) */}
      <group position={[-1.9, 0, 3.7]} rotation={[0, 0.25, 0]} scale={1.45}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 1.2, 5]} />
          <meshStandardMaterial color={C.wood} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.3, 0.05]} castShadow>
          <RoundedBoxGeo args={[1.9, 0.76, 0.1]} radius={0.03} segments={2} />
          <meshStandardMaterial color="#c79a6a" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.3, 0.14]}>
          <planeGeometry args={[1.76, 0.64]} />
          {sign ? <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.6} roughness={0.8} /> : <meshStandardMaterial color="#fbf1df" />}
        </mesh>
      </group>
      {[[-5.2, 3.6], [5.0, -3.9], [5.6, 2.4], [-4.6, -4.4]].map(([x, z], i) => (
        <LowPolyTree key={i} position={[x, 0, z]} scale={0.7} f={f} seed={40 + i} />
      ))}
      <Cloud p={[-9, -2, -10]} s={2.6} f={f} />
      <Cloud p={[9, -3, -6]} s={2.2} f={f} />
      {BOARD_SATS.map((q, i) => {
        const shown = i < 3 ? backOut(ramp(t, ringT[i] - 0.15, 0.4)) : Math.max(fourth, 0.35 * smooth(ramp(t, ringT[2], 0.4)));
        const g = V(q.x, 0.05, q.z);
        const r0 = Math.hypot(q.x - P_FIX.x, q.z - P_FIX.z);
        const r = r0 * (1 + (i < 3 ? (i === 1 ? -err : err) : 0));
        const grow = i < 3 ? smooth(ramp(t, ringT[i], 0.6)) : smooth(ramp(t, ringT[3] + 0.1, 0.6));
        const col = i < 3 ? ["#2f7dff", "#7a5cff", "#16a39a"][i] : "#ff7a6b";
        return (
          <group key={i}>
            <group scale={Math.max(0.001, shown)} position={q}>
              <Satellite pos={V(0, 0, 0)} aim={P_FIX.clone().sub(q)} s={0.75} f={f} seed={i} panelTex={panel} />
            </group>
            <SignalLine from={q} to={P_FIX} f={f} seed={i} opacity={0.75 * Math.min(1, shown)} />
            {grow > 0.001 ? (
              <>
                <mesh position={g} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[Math.max(0.001, r * grow - 0.06), r * grow + 0.06, 96]} />
                  <meshBasicMaterial color={col} transparent opacity={0.95} toneMapped={false} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={g.clone().setY(0.04)} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.12, 16]} />
                  <meshBasicMaterial color={col} toneMapped={false} />
                </mesh>
              </>
            ) : null}
          </group>
        );
      })}
      {/* uncertain area before the clock fix, crisp dot after */}
      {fuzzy > 0.01 ? (
        <mesh position={P_FIX.clone().setY(0.08)} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.75, 32]} />
          <meshBasicMaterial color="#ffb24a" transparent opacity={0.45 * fuzzy} toneMapped={false} depthWrite={false} />
        </mesh>
      ) : null}
      {dotPop > 0.01 ? (
        <group position={P_FIX.clone().setY(0.12)} rotation={[-Math.PI / 2, 0, 0]} scale={dotPop}>
          <mesh>
            <circleGeometry args={[0.36, 32]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.26, 32]} />
            <meshBasicMaterial color={C.blue} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- camera
const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.pos);
    c.lookAt(cam.target);
    c.fov = cam.fov ?? 36;
    c.near = 0.1;
    c.far = 400;
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

const World: React.FC<{ f: number; t: number; frame: number }> = ({ f, t, frame }) => {
  const ready = useFontGate();
  const tex = useMemo<ScreenTex | null>(() => {
    if (!ready) return null;
    const mapReveal = drawScreen({ crosses: false, pill: false });
    return { map: drawScreen({ crosses: false, pill: true }), grid: drawScreen({ crosses: false, pill: false, map: false }), mapReveal };
  }, [ready]);
  const cards = useMemo(() => (ready ? drawCards() : null), [ready]);
  const sign = useMemo(() => (ready ? drawSign() : null), [ready]);
  const panel = useMemo(() => (typeof document !== "undefined" ? drawPanel() : null), []);
  const sh = shotAt(t);
  const cam = sh.shot.cam(sh.u, t);
  return (
    <>
      <CameraRig cam={cam} />
      {sh.shot.scene === "valley" ? <Valley f={f} t={t} sh={sh} tex={tex} cards={cards} sign={sign} panel={panel} eye={cam.pos} /> : null}
      {sh.shot.scene === "orbit" ? <Orbit f={f} t={t} panel={panel} /> : null}
      {sh.shot.scene === "board" ? <Board f={f} t={t} panel={panel} ready={ready} /> : null}
      <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} hdri="sky" ao />
    </>
  );
};

// ---------------------------------------------------------------- 2D layers: HUD labels, captions, cut flash
const HUD: { text: string; from: number; to: number; tone?: "blue" | "red" | "ink" }[] = [
  { text: "KUOTA HABIS", from: at("habis"), to: T.s2, tone: "red" },
  { text: "GPS ≠ INTERNET", from: at("GPS"), to: T.s3, tone: "ink" },
  { text: "SATELIT GPS = MERCUSUAR", from: at("mercusuar"), to: T.s4, tone: "blue" },
  { text: "HP HANYA MENERIMA", from: at("mendengarkan"), to: T.s5, tone: "blue" },
  { text: "JAM ATOM", from: at("jam"), to: at("waktu") - 0.05, tone: "ink" },
  { text: "WAKTU + POSISI", from: at("waktu"), to: T.s6, tone: "blue" },
  { text: "±20.200 km DI ATAS BUMI", from: at("ketinggian"), to: T.s7, tone: "ink" },
  { text: "WAKTU TEMPUH → JARAK", from: at("mengukur"), to: T.s8, tone: "blue" },
  { text: "MINIMAL 4 SATELIT", from: at("empat"), to: T.s9, tone: "ink" },
  { text: "3 = TITIK", from: at("Tiga"), to: at("satu") - 0.05, tone: "blue" },
  { text: "+1 = KOREKSI JAM HP", from: at("satu"), to: T.s10, tone: "red" },
  { text: "INTERNET UNTUK…", from: at("Untuk", 2), to: T.s12, tone: "ink" },
  { text: "PETA OFFLINE", from: at("unduh"), to: T.s13, tone: "blue" },
  { text: "RUTE TETAP DIPANDU", from: at("rute"), to: at("tanpa") - 0.05, tone: "blue" },
  { text: "TANPA INFO LALU LINTAS", from: at("tanpa"), to: T.s14, tone: "red" },
];
const TONE = { blue: C.blue, red: "#ff5a5f", ink: "#26304a" };

const Hud: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const item = HUD.find((h) => t >= h.from && t < h.to);
  if (!item) return null;
  const a = backOut(ramp(t, item.from, 0.35));
  const out = 1 - smooth(ramp(t, item.to - 0.2, 0.2));
  return (
    <div style={{ position: "absolute", top: 210 * k, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: out }}>
      <div
        style={{
          transform: `translateY(${(1 - a) * -18 * k}px) scale(${0.85 + a * 0.15})`,
          background: "rgba(255,250,243,0.92)",
          borderRadius: 999,
          padding: `${14 * k}px ${30 * k}px`,
          fontFamily: TITLE,
          fontWeight: 700,
          fontSize: 40 * k,
          letterSpacing: 2 * k,
          color: "#26304a",
          boxShadow: `0 ${8 * k}px ${26 * k}px rgba(40,50,90,0.22)`,
          display: "flex",
          alignItems: "center",
          gap: 14 * k,
        }}
      >
        <span style={{ width: 16 * k, height: 16 * k, borderRadius: 999, background: TONE[item.tone ?? "ink"] }} />
        {item.text}
      </div>
    </div>
  );
};

// karaoke phrases: each clip split into balanced chunks of at most 5 words
type Phrase = { words: Word[]; from: number; to: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  TL.clips.forEach((c, ci) => {
    const ws = c.words as Word[];
    const n = Math.ceil(ws.length / 4);
    for (let j = 0; j < n; j++) {
      const a = Math.round((j * ws.length) / n), b = Math.round(((j + 1) * ws.length) / n);
      out.push({ words: ws.slice(a, b), from: ws[a].s - 0.08, to: 0 });
    }
    void ci;
  });
  out.forEach((p, i) => (p.to = i + 1 < out.length ? Math.min(out[i + 1].from, p.words[p.words.length - 1].e + 0.9) : p.words[p.words.length - 1].e + 0.6));
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= OUTRO_AT) return null;
  const ph = PHRASES.find((p) => t >= p.from && t < p.to);
  if (!ph) return null;
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, bottom: 410 * k, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(38,48,74,0.78)",
          borderRadius: 28 * k,
          padding: `${16 * k}px ${28 * k}px`,
          fontFamily: TITLE,
          fontWeight: 700,
          fontSize: 54 * k,
          lineHeight: 1.18,
          color: "#ffffff",
          textAlign: "center",
          maxWidth: 860 * k,
          textWrap: "balance",
        }}
      >
        {ph.words.map((w, i) => {
          const active = t >= w.s && t < w.e + 0.06;
          const said = t >= w.s;
          const b = active ? Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 0;
          return (
            <span key={i} style={{ display: "inline-block", marginRight: i < ph.words.length - 1 ? 14 * k : 0, color: active ? "#ffeaa7" : said ? "#ffffff" : "rgba(255,255,255,0.6)", transform: `translateY(${-b * 6 * k}px) scale(${1 + b * 0.08})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const CutFlash: React.FC<{ t: number }> = ({ t }) => {
  let o = 0;
  for (const s of SHOTS.slice(1)) {
    const d = t - s.start;
    if (d >= 0 && d < 0.1) o = Math.max(o, 0.3 * (1 - d / 0.1));
  }
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "#fff6ee", opacity: o, pointerEvents: "none" }} />;
};

export const Ep045Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * FILM_FPS;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: C.skyHorizon }}>
      <AbsoluteFill style={{ filter: "contrast(1.07) saturate(1.12)" }}>
        <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 36, near: 0.1, far: 400, position: [0, 7.4, 21] }}>
          <World f={f} t={t} frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>
      <CutFlash t={t} />
      <Hud t={t} k={k} />
      <Captions t={t} k={k} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};

export const SHOT_LIST = SHOTS.map((s, i) => ({ id: s.id, start: s.start, end: i + 1 < SHOTS.length ? SHOTS[i + 1].start : TL.total }));
