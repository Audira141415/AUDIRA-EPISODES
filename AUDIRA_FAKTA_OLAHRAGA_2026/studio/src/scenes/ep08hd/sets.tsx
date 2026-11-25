// EP08 HD2D dioramas. Eight lit 3D sets; players are pixel-sprite slabs (slab.tsx), props are catalog GLB + polished
// primitives. Each scene exports its set, its camera path and its fog/background so Film.tsx stays a thin director.
//   A    hook       Rio arena from behind Owi (jump smash), Butet at the net, Malaysia far court; AUDIRA boards
//   B    konteks    athletes' room at night: trophy cabinet fills with 5 golds (1992–2008), the 6th slot (London) stays empty
//   C    pengemb.   side court vs China (cool light), rally, China knocked out 2–0
//   C2   pengemb.   morning courtyard in Jakarta: rows of people with bowed heads, the Merah Putih rises
//   D    penjelas.  high over the net vs Malaysia: Butet at the net, Owi attacking from the back
//   E1   payoff     match point from the opposite front corner: Owi's jump smash, both arms up, gold confetti
//   E2   payoff     podium from behind, the flags rise (Indonesia centre and highest)
//   OUT  outro      Jakarta on Independence night: Monas, fireworks, two champions on a stage (1992 + 2016), AUDIRA billboard
// Players are generic sprites: no faces, no crests, no Olympic marks.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import type { Palette, Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import { Model } from "../ep07/Model.tsx";
import { CUT, MATCH_POINT, SMASH, T, TOTAL, clamp, lerp, seg, win, type SceneId } from "../ep08/timing.ts";
import {
  BACK_ANCHOR,
  CHN,
  FRONT,
  FRONT_ANCHOR,
  HERO,
  HERO_ANCHOR,
  INA,
  KIT_1992,
  KIT_2016,
  MAS,
  MAS_FRONT,
  PRAYER_ANCHOR,
  PRAYER_PAL,
  SIDE_ANCHOR,
  SITTER,
  SITTER_ANCHOR,
  backFig,
  carrier,
  cheer,
  prayer,
  sideFig,
} from "./figures.ts";
import { handTop, Slab, type Anchor } from "./slab.tsx";
import { apronTex, courtRoughTex, courtTex, crowdTex, grassTex, netTex, paveTex, signTex, skyTex, windowsTex, woodTex } from "./tex.ts";

export type V3 = [number, number, number];
export type Cam = { p: V3; tg: V3 };
type Key = { t: number; p: V3; tg: V3 };

/** Sprite clock: poses and sprite positions step at 8 fps (the camera stays at 60). */
export const step = (t: number) => Math.floor(t * 8) / 8;

/** Piecewise path through keys (eased only at the ends) plus a slow handheld drift so the camera never parks. */
const path = (t: number, keys: Key[], seed = 1): Cam => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  let k = clamp((t - a.t) / (b.t - a.t));
  if (i === 0) k = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k) * 0.5 - 0.5 + k * 0.5; // soft start
  const L = (x: V3, y: V3): V3 => [lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)];
  const p = L(a.p, b.p);
  const tg = L(a.tg, b.tg);
  p[0] += Math.sin(t * 0.55 + seed) * 0.12;
  p[1] += Math.sin(t * 0.43 + seed * 2) * 0.06;
  tg[0] += Math.sin(t * 0.37 + seed * 3) * 0.04;
  return { p, tg };
};

// ---------------------------------------------------------------- sizes (world units: 1 = 1.525 m, court 4.0 × 8.8)
const SIDE_H = 1.45;
const BACK_H = 1.45;
const FRONT_H = 1.38;
const HERO_HT = 2.1;
const PRAY_H = 1.25;
const FIG = (s: Sprite, pal: Palette, anchor: Anchor, height: number) => ({ s, pal, anchor, height });

// ---------------------------------------------------------------- shared props
const Court: React.FC<{ rot?: boolean; floor?: string }> = ({ rot, floor = "#1A2436" }) => (
  <group rotation={[0, rot ? Math.PI / 2 : 0, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color={floor} roughness={0.7} />
    </mesh>
    {/* Olympic surround mat: the floor around the court is lit material, not empty navy */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
      <planeGeometry args={[10.4, 14.4]} />
      <meshStandardMaterial map={apronTex()} roughness={0.62} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
      <planeGeometry args={[4.0, 8.8]} />
      <meshStandardMaterial map={courtTex()} roughnessMap={courtRoughTex()} roughness={1} />
    </mesh>
    {[-2.08, 2.08].map((x) => (
      <mesh key={x} position={[x, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 1.04, 10]} />
        <meshPhysicalMaterial color="#E9E4DA" {...POLISH.toyPlastic} />
      </mesh>
    ))}
    <mesh position={[0, 0.78, 0]} castShadow>
      <planeGeometry args={[4.16, 0.52]} />
      <meshStandardMaterial map={netTex()} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
  </group>
);

/** LED ad board (emissive canvas text): AUDIRA lives in the arena, not on top of the film. */
const Board: React.FC<{ text: string; position: V3; rotY?: number; w?: number; bg?: string; fg?: string }> = ({ text, position, rotY = 0, w = 2.6, bg = "#0E1428", fg = "#F4D27A" }) => {
  const tex = signTex(text, bg, fg);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.27, -0.04]} castShadow>
        <boxGeometry args={[w + 0.06, 0.6, 0.06]} />
        <meshStandardMaterial color="#0A0A10" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <planeGeometry args={[w, 0.48]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={1.1} roughness={0.4} />
      </mesh>
    </group>
  );
};

/** Raked stand: a sloped crowd plane over a dark wedge. */
const Stand: React.FC<{ position: V3; rotY?: number; w?: number; seed?: number }> = ({ position, rotY = 0, w = 12, seed = 1 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 1.6, -1.6]} rotation={[-0.62, 0, 0]}>
      <planeGeometry args={[w, 4.4]} />
      <meshStandardMaterial map={crowdTex(seed, 14)} emissiveMap={crowdTex(seed, 14)} emissive="#FFFFFF" emissiveIntensity={0.12} roughness={0.95} />
    </mesh>
    <mesh position={[0, 1.2, -2.6]}>
      <boxGeometry args={[w, 2.6, 2.4]} />
      <meshStandardMaterial color="#0C0C14" roughness={1} />
    </mesh>
  </group>
);

/** Arena shell around a court: boards, stands, scoreboard GLB, roof dark. */
/** `open` drops the camera-side board + stand (local -x side, i.e. +z once rotated) so a side camera sees court, not a black box back. */
const Arena: React.FC<{ rot?: boolean; boards?: string[]; open?: boolean }> = ({ rot, boards = ["AUDIRA", "BULU TANGKIS", "AUDIRA"], open }) => (
  <group rotation={[0, rot ? Math.PI / 2 : 0, 0]}>
    {boards.map((b, i) => (
      <Board key={`n${i}`} text={b} position={[(i - 1) * 2.75, 0, -5.4]} />
    ))}
    {boards.map((b, i) => (
      <Board key={`s${i}`} text={b} position={[(i - 1) * 2.75, 0, 5.4]} rotY={Math.PI} />
    ))}
    {open ? null : <Board text="AUDIRA" position={[-3.3, 0, 0]} rotY={Math.PI / 2} w={3.2} />}
    <Board text="17·08·2016" position={[3.3, 0, 0]} rotY={-Math.PI / 2} w={3.2} />
    <Stand position={[0, 0, -6.2]} seed={3} />
    <Stand position={[0, 0, 6.2]} rotY={Math.PI} seed={5} />
    {open ? null : <Stand position={[-4.4, 0, 0]} rotY={Math.PI / 2} seed={7} w={14} />}
    <Stand position={[4.4, 0, 0]} rotY={-Math.PI / 2} seed={9} w={14} />
    <Model id="match-scoreboard-58f51e" position={[3.6, 2.6, -6.6]} height={1.8} rotation={[0, -0.3, 0]} />
  </group>
);

const ArenaLights: React.FC<{ cool?: boolean; key?: number }> = ({ cool }) => (
  <>
    <ambientLight intensity={0.28} color={cool ? "#9FB4E0" : "#B8A8C8"} />
    <hemisphereLight args={[cool ? "#BFD4FF" : "#FFE2B8", "#141018", 0.35]} />
    <spotLight position={[1.2, 9, 3.5]} intensity={cool ? 110 : 130} angle={0.55} penumbra={0.55} color={cool ? "#E8F0FF" : "#FFE6C2"} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} />
    <spotLight position={[-2.5, 8, -4]} intensity={60} angle={0.6} penumbra={0.7} color={cool ? "#BFD4FF" : "#FFD9A0"} />
    <directionalLight position={[-4, 5, -8]} intensity={1.4} color="#9FB8FF" />
  </>
);

/** Shuttle: cork + feather skirt, pointed along its flight, with a short pixel trail. */
const Shuttle: React.FC<{ at: V3; dir: V3; trail?: number }> = ({ at, dir, trail = 3 }) => {
  const q = useMemo(() => new THREE.Quaternion(), []);
  const d = new THREE.Vector3(...dir);
  if (d.lengthSq() < 1e-6) d.set(0, -1, 0);
  q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize().negate());
  return (
    <>
      {Array.from({ length: trail + 1 }, (_, i) => {
        const o = i * 0.12;
        const s = 1 - i * 0.18;
        return (
          <group key={i} position={[at[0] - dir[0] * o, at[1] - dir[1] * o, at[2] - dir[2] * o]} quaternion={q} scale={s}>
            <mesh position={[0, -0.04, 0]}>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshStandardMaterial color="#C99A5A" emissive="#C99A5A" emissiveIntensity={i ? 0.2 : 0.4} transparent opacity={1 - i * 0.28} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <coneGeometry args={[0.075, 0.16, 10, 1, true]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={i ? 0.5 : 0.9} side={THREE.DoubleSide} transparent opacity={1 - i * 0.28} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

/** Ping-pong rally between a and b, arc height h, one crossing per `period` s. */
const rally = (t: number, t0: number, period: number, a: V3, b: V3, h = 1.2) => {
  const u = Math.max(0, t - t0) / period;
  const n = Math.floor(u);
  const k = u - n;
  const [s, e] = n % 2 === 0 ? [a, b] : [b, a];
  const at: V3 = [lerp(s[0], e[0], k), lerp(s[1], e[1], k) + 4 * h * k * (1 - k), lerp(s[2], e[2], k)];
  const dir: V3 = [e[0] - s[0], e[1] - s[1] + 4 * h * (1 - 2 * k), e[2] - s[2]];
  return { at, dir, toB: n % 2 === 0, k };
};

/** Waving flag on a pole; `raise` 0..1 hoists it. kind: ina (merah putih), mas (stripes + canton), chn (red + star). */
const flagTexs = new Map<string, THREE.Texture>();
const flagTex = (kind: "ina" | "mas" | "chn") => {
  if (!flagTexs.has(kind)) {
    const c = document.createElement("canvas");
    c.width = 24;
    c.height = 16;
    const g = c.getContext("2d")!;
    if (kind === "ina") {
      g.fillStyle = "#D02A30";
      g.fillRect(0, 0, 24, 8);
      g.fillStyle = "#F5EEDF";
      g.fillRect(0, 8, 24, 8);
    } else if (kind === "mas") {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? "#F5EEDF" : "#C8242E";
        g.fillRect(0, i * 2, 24, 2);
      }
      g.fillStyle = "#1E2E7A";
      g.fillRect(0, 0, 12, 8);
      g.fillStyle = "#F2C230";
      g.fillRect(4, 2, 3, 4);
    } else {
      g.fillStyle = "#C8242E";
      g.fillRect(0, 0, 24, 16);
      g.fillStyle = "#F2C230";
      g.fillRect(3, 3, 4, 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    flagTexs.set(kind, t);
  }
  return flagTexs.get(kind)!;
};
const Flag: React.FC<{ t: number; position: V3; pole: number; raise: number; kind?: "ina" | "mas" | "chn"; w?: number; rotY?: number }> = ({ t, position, pole, raise, kind = "ina", w = 1.3, rotY = 0 }) => {
  const h = w * 0.62;
  const geo = useMemo(() => new THREE.PlaneGeometry(w, h, 12, 2), [w, h]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + w / 2;
    pos.setZ(i, Math.sin(x * 3.2 - t * 5.5) * 0.07 * (x / w));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const y = lerp(1.0, pole - h / 2 - 0.05, raise);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, pole / 2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, pole, 10]} />
        <meshPhysicalMaterial color="#D8D4CC" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, pole + 0.04, 0]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color="#F4D27A" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh geometry={geo} position={[w / 2 + 0.03, y, 0]} castShadow>
        <meshStandardMaterial map={flagTex(kind)} side={THREE.DoubleSide} roughness={0.85} emissiveMap={flagTex(kind)} emissive="#FFFFFF" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
};

/** Gold confetti / sparks falling from `from` seconds. */
const Confetti: React.FC<{ t: number; from: number; center: V3; n?: number; spread?: number }> = ({ t, from, center, n = 60, spread = 3 }) => {
  const u = t - from;
  if (u < 0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = center[0] + (hash(i * 7) - 0.5) * spread * 2;
        const z = center[2] + (hash(i * 13) - 0.5) * spread;
        const y = center[1] + 3.6 - ((u * (0.7 + hash(i * 3) * 0.6) + hash(i * 17) * 3.6) % 3.8);
        return (
          <mesh key={i} position={[x + Math.sin(u * 2 + i) * 0.15, y, z]} rotation={[u * 3 + i, u * 2 + i * 0.5, 0]}>
            <planeGeometry args={[0.07, 0.11]} />
            <meshStandardMaterial color={i % 3 ? "#F4D27A" : i % 2 ? "#D02A30" : "#F5EEDF"} emissive={i % 3 ? "#C89A2A" : "#000000"} emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </>
  );
};

/** Jump arc (0 → h → 0) over [a, b]. */
const jump = (t: number, a: number, b: number, h: number) => {
  const k = clamp((t - a) / (b - a));
  return k > 0 && k < 1 ? 4 * h * k * (1 - k) : 0;
};

type SetProps = { t: number; cam: Cam };
const face = (cam: Cam): [number, number] => [cam.p[0], cam.p[2]];

// ================================================================= A  hook: arena from behind Owi
const SetA: React.FC<SetProps> = ({ t, cam }) => {
  const s = step(t);
  const f = face(cam);
  const owi: V3 = [0.7, 0, 2.9];
  const racket: V3 = [owi[0] + 0.55, 2.0, owi[2]];
  const lift = jump(s, SMASH - 0.5, SMASH + 0.5, 0.42) + (s < SMASH - 0.5 ? Math.abs(Math.sin(s * 3)) * 0.05 : 0);
  let sh: { at: V3; dir: V3 };
  if (t < SMASH) sh = rally(t, 0.2, 1.55, [-0.4, 1.4, -2.3], [racket[0], racket[1] + lift, racket[2]], 1.4);
  else {
    const k = clamp((t - SMASH) / 0.32);
    const a: V3 = [racket[0], racket[1] + 0.4, racket[2]];
    const b: V3 = [-0.9, 0.05, -3.1];
    sh = k < 1 ? { at: [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], dir: [b[0] - a[0], b[1] - a[1], b[2] - a[2]] } : { at: b, dir: [0, -1, 0.3] };
  }
  return (
    <>
      <ArenaLights />
      <Court />
      <Arena />
      <Slab {...FIG(HERO, INA, HERO_ANCHOR, HERO_HT)} position={owi} face={f} lift={lift} />
      <Slab {...FIG(sideFig(s % 1 < 0.5 ? "ready" : "stand", "bun"), INA, SIDE_ANCHOR, SIDE_H)} position={[-0.8, 0, 1.0]} face={f} />
      <Slab {...FIG(FRONT, MAS_FRONT, FRONT_ANCHOR, FRONT_H)} position={[-0.6, 0, -2.6]} face={f} />
      <Slab {...FIG(FRONT, MAS_FRONT, FRONT_ANCHOR, FRONT_H)} position={[0.9, 0, -1.3]} face={f} />
      <Shuttle at={sh.at} dir={sh.dir} trail={t > SMASH && t < SMASH + 0.32 ? 5 : 2} />
    </>
  );
};
const camA = (t: number) =>
  path(t, [
    { t: 0, p: [2.4, 6.8, 13.6], tg: [0.2, 0.7, 0.2] },
    { t: T.indonesia, p: [1.2, 6.3, 12.6], tg: [0.2, 0.8, 0.3] },
    { t: CUT.B, p: [-0.5, 6.0, 11.9], tg: [0.3, 0.9, 0.5] },
  ], 1);

// ================================================================= B  athletes' room at night
const GOLD_AT = [T.sejak + 0.6, T.sejak + 1.1, T.sejak + 1.6, T.sejak + 2.1, T.selalu + 0.4];
const SetB: React.FC<SetProps> = ({ t, cam }) => {
  const s = step(t);
  const f = face(cam);
  const lamp = 1 + 0.04 * Math.sin(t * 7) * Math.sin(t * 2.3);
  const emptyFlash = win(t, T.london, CUT.C, 0.2, 0.3);
  return (
    <>
      <ambientLight intensity={0.3} color="#6070A8" />
      <hemisphereLight args={["#3A4A80", "#120C10", 0.25]} />
      <directionalLight position={[3.5, 5, -6]} intensity={1.3} color="#8FA8FF" />
      <pointLight position={[1.35, 1.05, -2.05]} intensity={9 * lamp} distance={7} decay={1.6} color="#FFB46B" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.002} />
      <spotLight position={[-2.2, 4.2, 1.5]} intensity={30} angle={0.4} penumbra={0.6} color="#FFD9A0" />
      {/* floor + walls (cutaway diorama: no front wall) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6.4]} />
        <meshStandardMaterial map={woodTex()} map-repeat={[4, 3]} roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.1, -3.0]} receiveShadow>
        <planeGeometry args={[8, 4.2]} />
        <meshStandardMaterial color="#2C3A4A" roughness={0.95} />
      </mesh>
      <mesh position={[-4, 2.1, 0.2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6.4, 4.2]} />
        <meshStandardMaterial color="#263240" roughness={0.95} />
      </mesh>
      {/* window with the night sky + moon */}
      <group position={[2.4, 2.3, -2.98]}>
        <mesh>
          <planeGeometry args={[1.6, 1.5]} />
          <meshBasicMaterial map={skyTex("night")} toneMapped={false} />
        </mesh>
        <mesh position={[0.35, 0.35, 0.01]}>
          <circleGeometry args={[0.13, 16]} />
          <meshBasicMaterial color="#FFF3D0" toneMapped={false} />
        </mesh>
        {[[-0.84, 0, 0.08, 1.66], [0.84, 0, 0.08, 1.66], [0, 0.79, 1.76, 0.08], [0, -0.79, 1.76, 0.08], [0, 0, 0.05, 1.5]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.03]}>
            <boxGeometry args={[w, h, 0.06]} />
            <meshStandardMaterial color="#5A3A26" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* AUDIRA training poster */}
      <mesh position={[-0.6, 2.6, -2.97]}>
        <planeGeometry args={[1.3, 0.44]} />
        <meshStandardMaterial map={signTex("AUDIRA", "#1A1220", "#F4D27A", 64, 16, 11)} roughness={0.9} />
      </mesh>
      <Model id="trophy-cabinet-e963ac" position={[-2.7, 0, -2.45]} height={2.1} />
      {/* five golds 1992–2008 pop into the cabinet; the sixth slot (London 2012) stays empty and flashes */}
      {GOLD_AT.map((a, i) => {
        const k = clamp((t - a) / 0.25);
        if (k <= 0) return null;
        return (
          <group key={i} position={[-3.3 + (i % 3) * 0.55, 1.62 - Math.floor(i / 3) * 0.55, -1.9]} scale={k < 0.7 ? k * 1.5 : 1.05 - (k - 0.7) * 0.15}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.17, 0.17, 0.04, 24]} />
              <meshPhysicalMaterial color="#E8B64A" metalness={0.9} roughness={0.25} emissive="#7A5410" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 0.25, -0.01]}>
              <boxGeometry args={[0.08, 0.32, 0.01]} />
              <meshStandardMaterial color="#D02A30" />
            </mesh>
          </group>
        );
      })}
      <mesh position={[-3.3 + 0.55, 1.07, -1.9]}>
        <ringGeometry args={[0.14, 0.18, 24]} />
        <meshBasicMaterial color={emptyFlash > 0 ? "#FF4A4A" : "#3A3A44"} toneMapped={false} transparent opacity={0.4 + 0.6 * emptyFlash * (0.6 + 0.4 * Math.sin(t * 12))} />
      </mesh>
      <Model id="bed-6e10e8" position={[0.2, 0, -1.7]} height={0.75} />
      <Model id="bedside-table-3f2b80" position={[1.35, 0, -2.2]} height={0.5} />
      <Model id="table-lamp-e25998" position={[1.35, 0.5, -2.2]} height={0.45} />
      <Slab {...FIG(SITTER, INA, SITTER_ANCHOR, 1.0)} position={[0.15, 0, -0.75]} face={f} rim="#FFC890" />
      <Slab {...FIG(sideFig(s > T.owi && s < T.gagal + 1 ? "wave" : "stand", "short"), INA, SIDE_ANCHOR, SIDE_H)} position={[2.3, 0, -1.9]} face={f} flip rim="#9FB8FF" />
    </>
  );
};
const camB = (t: number) =>
  path(t, [
    { t: CUT.B, p: [-1.4, 4.4, 8.8], tg: [-2.2, 1.2, -2.0] },
    { t: T.tradisi, p: [-0.6, 4.5, 9.0], tg: [-1.6, 1.1, -1.8] },
    { t: T.owi, p: [1.3, 4.2, 8.8], tg: [1.1, 0.8, -1.4] },
    { t: CUT.C, p: [2.0, 4.0, 8.4], tg: [1.3, 0.8, -1.4] },
  ], 2);

// ================================================================= C  side court vs China (semifinal)
const SetC: React.FC<SetProps> = ({ t, cam }) => {
  const s = step(t);
  const f = face(cam);
  const done = t > T.disingkirkan;
  const r = rally(t, CUT.C, 1.25, [-2.5, 1.7, 0.5], [2.0, 1.6, 0.3], 1.0);
  const sh = done ? { at: [1.6, 0.05, 0.9] as V3, dir: [0.3, -1, 0] as V3 } : r;
  const owiPose = !done && !r.toB && r.k > 0.75 ? "smash" : "ready";
  return (
    <>
      <ArenaLights cool />
      <Court rot />
      <Arena rot open boards={["AUDIRA", "SEMIFINAL", "AUDIRA"]} />
      <spotLight position={[1.6, 7.5, 6.5]} intensity={70} angle={0.38} penumbra={0.5} color="#DCE8FF" />
      <Slab {...FIG(done ? cheer("short") : sideFig(owiPose, "short"), INA, SIDE_ANCHOR, SIDE_H)} position={[-3.0, 0, 0.6]} face={f} lift={done ? jump(s % 1, 0, 0.5, 0.15) : 0} />
      <Slab {...FIG(done ? cheer("bun") : sideFig(s % 1 < 0.5 ? "ready" : "stand", "bun"), INA, SIDE_ANCHOR, SIDE_H)} position={[-1.1, 0, -0.6]} face={f} />
      <Slab {...FIG(sideFig(done ? "stand" : r.toB && r.k > 0.75 ? "smash" : "ready", "short"), CHN, SIDE_ANCHOR, SIDE_H)} position={[1.4, 0, 0.5]} face={f} flip />
      <Slab {...FIG(sideFig(done ? "stand" : "ready", "bun"), CHN, SIDE_ANCHOR, SIDE_H)} position={[3.2, 0, -0.6]} face={f} flip />
      <Shuttle at={sh.at} dir={sh.dir} />
    </>
  );
};
const camC = (t: number) =>
  path(t, [
    { t: CUT.C, p: [-2.6, 5.6, 10.0], tg: [-1.6, 0.2, 1.6] },
    { t: T.semifinal, p: [-0.6, 5.4, 9.8], tg: [-0.4, 0.2, 1.6] },
    { t: T.zhang, p: [1.6, 5.4, 9.6], tg: [1.6, 0.2, 1.6] },
    { t: CUT.C2, p: [0.0, 5.8, 10.4], tg: [0.0, 0.3, 1.6] },
  ], 3);

// ================================================================= C2 morning courtyard, Jakarta: prayer + flag
const SetC2: React.FC<SetProps> = ({ t, cam }) => {
  const f = face(cam);
  const raise = seg(t, CUT.C2 + 0.2, CUT.D - 0.3);
  const rows = [1.0, 2.0, 3.0];
  return (
    <>
      <ambientLight intensity={0.5} color="#DCE6F2" />
      <hemisphereLight args={["#CFE2F5", "#6A5A40", 0.6]} />
      <directionalLight position={[-6, 4.5, 5]} intensity={2.6} color="#FFD9A8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={grassTex()} map-repeat={[12, 12]} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.5]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial map={paveTex()} map-repeat={[5, 5]} roughness={0.9} />
      </mesh>
      {/* government building facade */}
      <group position={[0, 0, -7]}>
        <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 4.6, 1.2]} />
          <meshStandardMaterial map={windowsTex(4, false, 24, 9)} roughness={0.85} />
        </mesh>
        <mesh position={[0, 4.75, 0]}>
          <boxGeometry args={[12.6, 0.3, 1.6]} />
          <meshStandardMaterial color="#8A7E6C" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.25, 0.9]}>
          <boxGeometry args={[4, 0.5, 0.8]} />
          <meshStandardMaterial color="#D8CFBC" roughness={0.9} />
        </mesh>
      </group>
      <Flag t={t} position={[0, 0, -3.4]} pole={4.4} raise={raise} />
      {/* flagpole base */}
      <mesh position={[0, 0.12, -3.4]} castShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.24, 16]} />
        <meshStandardMaterial color="#D8CFBC" roughness={0.85} />
      </mesh>
      <Model id="palm-tree-a307da" position={[-3.4, 0, -3.0]} height={3.6} />
      <Model id="palm-tree-a307da" position={[3.6, 0, -3.6]} height={3.2} rotation={[0, 1.3, 0]} />
      <Model id="front-yard-fir-tree-0a278d" position={[-5.2, 0, -5.5]} height={2.6} />
      {/* the ceremony: three rows facing the pole, heads bowed in prayer (back view) */}
      {rows.map((z, r) =>
        Array.from({ length: 7 }, (_, i) => {
          const v = (i * 3 + r * 5) % 5;
          const x = (i - 3) * 0.62 + (r % 2) * 0.2;
          return (
            <Slab
              key={`${r}-${i}`}
              {...FIG(prayer(v), PRAYER_PAL[v], PRAYER_ANCHOR, PRAY_H)}
              position={[x, 0, z + hash(i * 7 + r) * 0.15]}
              face={f}
              rim="#FFE6C0"
              glow={0.2}
            />
          );
        }),
      )}
    </>
  );
};
const camC2 = (t: number) =>
  path(t, [
    { t: CUT.C2, p: [0.8, 5.0, 11.8], tg: [0, 1.6, -1.2] },
    { t: CUT.D, p: [0.1, 5.4, 10.6], tg: [0, 2.4, -2.0] },
  ], 4);

// ================================================================= D  high over the net vs Malaysia (final)
const SetD: React.FC<SetProps> = ({ t, cam }) => {
  const s = step(t);
  const f = face(cam);
  const r = rally(t, CUT.D, 1.1, [-2.9, 1.8, -0.3], [2.6, 1.5, 0.4], 0.9);
  const owiHit = !r.toB && r.k > 0.72;
  return (
    <>
      <ArenaLights />
      <Court rot />
      <Arena rot open boards={["AUDIRA", "FINAL", "AUDIRA"]} />
      {/* directional rally key: raking spot from the camera side throws long figure shadows across the court */}
      <spotLight position={[-5.5, 6.5, 5.5]} intensity={95} angle={0.42} penumbra={0.45} color="#FFE0B0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0002} />
      <Slab {...FIG(sideFig(owiHit ? "smash" : "ready", "short"), INA, SIDE_ANCHOR, SIDE_H)} position={[-3.2, 0, -0.4]} face={f} lift={owiHit ? 0.18 : 0} />
      <Slab {...FIG(sideFig(s % 0.75 < 0.375 ? "ready" : "stand", "bun"), INA, SIDE_ANCHOR, SIDE_H)} position={[-0.75, 0, 0.35]} face={f} />
      <Slab {...FIG(sideFig(r.toB && r.k > 0.75 ? "smash" : "ready", "short"), MAS, SIDE_ANCHOR, SIDE_H)} position={[1.0, 0, -0.35]} face={f} flip />
      <Slab {...FIG(sideFig("ready", "bun"), MAS, SIDE_ANCHOR, SIDE_H)} position={[3.0, 0, 0.5]} face={f} flip />
      <Shuttle at={r.at} dir={r.dir} />
    </>
  );
};
const camD = (t: number) =>
  path(t, [
    { t: CUT.D, p: [3.0, 6.6, 8.6], tg: [0.8, 0.2, 1.4] },
    { t: T.butet, p: [-0.4, 6.2, 8.4], tg: [-0.8, 0.3, 1.5] },
    { t: T.owiBelakang + 0.5, p: [-2.6, 6.3, 8.6], tg: [-2.5, 0.4, 1.3] },
    { t: T.gim1, p: [-1.7, 7.0, 9.6], tg: [-1.3, 0.2, 1.4] },
    { t: CUT.E1, p: [1.4, 7.2, 9.8], tg: [0.6, 0.2, 1.4] },
  ], 5);

// ================================================================= E1 match point, opposite front corner
const SetE1: React.FC<SetProps> = ({ t, cam }) => {
  const s = step(t);
  const f = face(cam);
  const won = t > MATCH_POINT;
  const owi: V3 = [0.7, 0, 2.6];
  const lift = jump(s, MATCH_POINT - 0.5, MATCH_POINT + 0.4, 0.5) + (won ? jump(s % 0.75, 0, 0.375, 0.12) : 0);
  let sh: { at: V3; dir: V3 };
  if (t < MATCH_POINT - 0.05) sh = rally(t, CUT.E1, 1.05, [-0.5, 1.5, -2.4], [owi[0] - 0.4, 2.0, owi[2]], 1.2);
  else {
    const k = clamp((t - MATCH_POINT + 0.05) / 0.3);
    const a: V3 = [owi[0] - 0.4, 2.5, owi[2]];
    const b: V3 = [0.4, 0.05, -2.9];
    sh = k < 1 ? { at: [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], dir: [b[0] - a[0], b[1] - a[1], b[2] - a[2]] } : { at: b, dir: [0, -1, 0.3] };
  }
  const owiFig = won ? cheer("short") : s > MATCH_POINT - 0.5 ? sideFig("smash", "short") : sideFig("ready", "short");
  return (
    <>
      <ArenaLights />
      <Court />
      <Arena boards={["AUDIRA", "21 - 12", "AUDIRA"]} />
      <spotLight position={[4.5, 7, 6]} intensity={80} angle={0.4} penumbra={0.5} color="#FFE0B0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0002} />
      <Slab {...FIG(owiFig, INA, SIDE_ANCHOR, SIDE_H)} position={owi} face={f} lift={lift} flip />
      <Slab {...FIG(won ? cheer("bun") : sideFig("ready", "bun"), INA, SIDE_ANCHOR, SIDE_H)} position={[-0.8, 0, 1.0]} face={f} flip lift={won ? jump((s + 0.3) % 0.75, 0, 0.375, 0.1) : 0} />
      <Slab {...FIG(sideFig(won ? "stand" : "ready", "short"), MAS, SIDE_ANCHOR, SIDE_H)} position={[-0.5, 0, -1.6]} face={f} />
      <Slab {...FIG(sideFig(won ? "stand" : "ready", "bun"), MAS, SIDE_ANCHOR, SIDE_H)} position={[0.9, 0, -3.0]} face={f} />
      <Shuttle at={sh.at} dir={sh.dir} trail={t > MATCH_POINT - 0.05 && t < MATCH_POINT + 0.3 ? 5 : 2} />
      <Confetti t={t} from={MATCH_POINT + 0.1} center={[0, 0, 1.5]} />
      {won ? <pointLight position={[0.3, 2.6, 2.2]} intensity={6 * (0.6 + 0.4 * win(t, MATCH_POINT, MATCH_POINT + 1.2, 0.05, 1))} distance={6} decay={1.6} color="#FFD27A" /> : null}
    </>
  );
};
const camE1 = (t: number) =>
  path(t, [
    { t: CUT.E1, p: [-8.8, 6.0, 8.4], tg: [0.0, 0.9, 1.0] },
    { t: MATCH_POINT, p: [-7.6, 5.4, 7.2], tg: [0.3, 1.2, 1.6] },
    { t: CUT.E2, p: [-6.6, 5.8, 6.4], tg: [0.4, 1.1, 1.8] },
  ], 6);

// ================================================================= E2 podium from behind, flags rise
const Block: React.FC<{ x: number; h: number; n: string }> = ({ x, h, n }) => (
  <group position={[x, h / 2, 0]}>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={[1.15, h, 0.95]} radius={0.04} />
      <meshPhysicalMaterial color="#F1ECE2" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0, 0, 0.48]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshStandardMaterial map={signTex(n, "#F1ECE2", "#B8862A", 16, 16, 14)} />
    </mesh>
  </group>
);
const SetE2: React.FC<SetProps> = ({ t, cam }) => {
  const f = face(cam);
  const raise = seg(t, CUT.E2 + 0.3, T.ketujuh);
  return (
    <>
      <ambientLight intensity={0.2} color="#A8A0C0" />
      <hemisphereLight args={["#FFE2B8", "#141018", 0.3]} />
      <spotLight position={[0, 8, 3]} intensity={120} angle={0.42} penumbra={0.6} color="#FFE2B8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} />
      <spotLight position={[0, 7, -2]} intensity={70} angle={0.5} penumbra={0.7} color="#FFD9A0" />
      <directionalLight position={[3, 4, -8]} intensity={1.2} color="#9FB8FF" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1A2436" roughness={0.7} />
      </mesh>
      <Block x={0} h={0.9} n="1" />
      <Block x={-1.25} h={0.6} n="2" />
      <Block x={1.25} h={0.42} n="3" />
      <Slab {...FIG(backFig(false), INA, BACK_ANCHOR, BACK_H)} position={[-0.25, 0.9, 0.05]} face={f} />
      <Slab {...FIG(backFig(true), INA, BACK_ANCHOR, BACK_H)} position={[0.27, 0.9, 0.05]} face={f} />
      <Slab {...FIG(backFig(false), MAS, BACK_ANCHOR, BACK_H)} position={[-1.5, 0.6, 0.05]} face={f} />
      <Slab {...FIG(backFig(true), MAS, BACK_ANCHOR, BACK_H)} position={[-1.0, 0.6, 0.05]} face={f} />
      <Slab {...FIG(backFig(false), CHN, BACK_ANCHOR, BACK_H)} position={[1.0, 0.42, 0.05]} face={f} />
      <Slab {...FIG(backFig(true), CHN, BACK_ANCHOR, BACK_H)} position={[1.5, 0.42, 0.05]} face={f} />
      <Flag t={t} position={[-1.7, 0, -3.2]} pole={2.9} raise={raise * 0.9} kind="mas" w={1.0} />
      <Flag t={t + 0.4} position={[-0.6, 0, -3.2]} pole={3.3} raise={raise} kind="ina" w={1.2} />
      <Flag t={t + 0.8} position={[1.1, 0, -3.2]} pole={2.8} raise={raise * 0.9} kind="chn" w={1.0} />
      <Stand position={[0, 0, -5.4]} seed={11} w={14} />
      <Board text="AUDIRA" position={[-2.0, 0, -4.9]} w={2.4} />
      <Board text="AUDIRA" position={[2.2, 0, -4.9]} w={2.4} />
      <Confetti t={t} from={CUT.E2} center={[0, 0.5, -0.5]} n={50} spread={2.6} />
    </>
  );
};
const camE2 = (t: number) =>
  path(t, [
    { t: CUT.E2, p: [0.9, 4.6, 10.4], tg: [0, 1.2, -1.0] },
    { t: T.kata, p: [0.4, 4.9, 10.0], tg: [0, 1.5, -1.6] },
    { t: CUT.OUT, p: [0.1, 5.1, 9.8], tg: [0, 1.7, -2.0] },
  ], 7);

// ================================================================= OUT Jakarta, Independence night
const BURSTS = Array.from({ length: 18 }, (_, i) => ({
  at: CUT.OUT + i * 0.75 + hash(i * 7) * 0.4,
  c: new THREE.Vector3(-4 + hash(i * 11) * 8, 5.2 + hash(i * 19) * 3, -10 - hash(i * 23) * 3),
  col: ["#F25A54", "#F4D27A", "#F3E6CC", "#7FD0FF"][i % 4],
}));
export const fireworks = (t: number) => BURSTS.reduce((a, b) => a + win(t, b.at, b.at + 1.5, 0.05, 1.2), 0);
const Fireworks: React.FC<{ t: number }> = ({ t }) => (
  <>
    {BURSTS.map((b, i) => {
      const k = clamp((t - b.at) / 1.6);
      if (k <= 0 || k >= 1) return null;
      const r = 0.4 + Math.sqrt(k) * 2.2;
      return (
        <group key={i} position={b.c}>
          {Array.from({ length: 22 }, (_, j) => {
            const a = (j / 22) * Math.PI * 2;
            const e = (hash(i * 31 + j) - 0.5) * 1.2;
            return (
              <mesh key={j} position={[Math.cos(a) * r * Math.cos(e), Math.sin(a) * r * Math.cos(e) - k * k * 1.2, Math.sin(e) * r]}>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                <meshBasicMaterial color={b.col} toneMapped={false} transparent opacity={1 - k * 0.8} />
              </mesh>
            );
          })}
        </group>
      );
    })}
  </>
);
const Monas: React.FC<{ glow: number }> = ({ glow }) => (
  <group position={[0, 0, -9.5]}>
    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
      <boxGeometry args={[4.2, 0.7, 4.2]} />
      <meshStandardMaterial color="#C9C2B0" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <cylinderGeometry args={[1.7, 1.1, 0.5, 4]} />
      <meshStandardMaterial color="#D8D1C0" roughness={0.8} />
    </mesh>
    <mesh position={[0, 4.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <cylinderGeometry args={[0.24, 0.5, 6.8, 4]} />
      <meshStandardMaterial color="#E4DDCC" roughness={0.75} />
    </mesh>
    <mesh position={[0, 8.1, 0]}>
      <cylinderGeometry args={[0.36, 0.2, 0.25, 12]} />
      <meshStandardMaterial color="#B8862A" metalness={0.7} roughness={0.35} />
    </mesh>
    <mesh position={[0, 8.55, 0]}>
      <coneGeometry args={[0.28, 0.7, 12]} />
      <meshStandardMaterial color="#F4C24A" emissive="#F4A82A" emissiveIntensity={1.6 + glow} metalness={0.6} roughness={0.3} />
    </mesh>
    <pointLight position={[0, 8.6, 0.6]} intensity={10 + glow * 6} distance={8} decay={1.5} color="#FFC870" />
    {/* uplights on the obelisk */}
    <spotLight position={[0, 0.8, 3]} intensity={60} angle={0.25} penumbra={0.5} color="#FFE2B8" />
  </group>
);
const City: React.FC = () => (
  <>
    {Array.from({ length: 12 }, (_, i) => {
      const x = -11 + i * 2 + hash(i * 3) * 0.6;
      if (Math.abs(x) < 1.5) return null;
      const h = 3.5 + hash(i * 17) * 6;
      return (
        <mesh key={i} position={[x, h / 2, -15 - hash(i * 5) * 3]}>
          <boxGeometry args={[1.8, h, 1.8]} />
          <meshStandardMaterial map={windowsTex(i, true, 6, Math.round(h * 2))} emissiveMap={windowsTex(i, true, 6, Math.round(h * 2))} emissive="#FFFFFF" emissiveIntensity={0.55} roughness={0.9} />
        </mesh>
      );
    })}
    {/* AUDIRA billboard on the skyline */}
    <group position={[-4.6, 6.2, -13.6]}>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.3, 1.2, 0.1]} />
        <meshStandardMaterial color="#0A0A10" />
      </mesh>
      <mesh>
        <planeGeometry args={[3.1, 1.0]} />
        <meshBasicMaterial map={signTex("AUDIRA", "#120A1A", "#F4D27A", 64, 20, 15)} toneMapped={false} />
      </mesh>
    </group>
  </>
);
const SetOUT: React.FC<SetProps> = ({ t, cam }) => {
  const s = step(t);
  const f = face(cam);
  const fw = fireworks(t);
  const susy = carrier("bun");
  const torch = handTop(susy, SIDE_ANCHOR, SIDE_H);
  const flick = 1 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3);
  const butetLift = t > T.susy ? jump(s % 0.75, 0, 0.375, 0.1) : 0;
  return (
    <>
      <ambientLight intensity={0.16} color="#5A68A8" />
      <hemisphereLight args={["#2A3870", "#100C14", 0.35]} />
      <directionalLight position={[2, 6, 8]} intensity={0.5 + 0.25 * fw} color="#C8D4FF" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <pointLight position={[0, 9, -11]} intensity={20 * fw} distance={18} decay={1.4} color="#FFC8A0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={paveTex(true)} map-repeat={[16, 16]} roughness={0.8} />
      </mesh>
      <mesh position={[0, 12, -22]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial map={skyTex("night")} toneMapped={false} />
      </mesh>
      <Monas glow={fw} />
      <City />
      <Fireworks t={t} />
      {/* stage with red-white bunting */}
      <group position={[0, 0, 2.2]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[4.6, 1.4, 2.0]} radius={0.03} />
          <meshPhysicalMaterial color="#3A2A22" {...POLISH.stone} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-2.07 + i * 0.46, 1.2, 1.01]}>
            <planeGeometry args={[0.44, 0.28]} />
            <meshStandardMaterial color={i % 2 ? "#F5EEDF" : "#D02A30"} emissive={i % 2 ? "#3A3630" : "#4A0A0E"} roughness={0.9} />
          </mesh>
        ))}
      </group>
      <Model id="brass-post-lamp-984201" position={[-2.7, 0, 2.6]} height={3.2} />
      <Model id="brass-post-lamp-984201" position={[2.7, 0, 2.6]} height={3.2} />
      <pointLight position={[-2.7, 3.1, 2.8]} intensity={7} distance={5} decay={1.6} color="#FFB46B" />
      <pointLight position={[2.7, 3.1, 2.8]} intensity={7} distance={5} decay={1.6} color="#FFB46B" />
      {/* two champions: 1992 (torch raised) and 2016 (both arms up) */}
      <Slab {...FIG(susy, KIT_1992, SIDE_ANCHOR, SIDE_H)} position={[-0.75, 1.4, 2.3]} face={f} rim="#FFD0A0">
        <group position={torch}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 0.3, 8]} />
            <meshStandardMaterial color="#B8862A" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.1, 0]} scale={[1, flick, 1]}>
            <coneGeometry args={[0.07, 0.24, 10]} />
            <meshBasicMaterial color="#FFB040" toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.15, 0.1]} intensity={3.5 * flick} distance={3.5} decay={1.6} color="#FF9A40" />
        </group>
      </Slab>
      <Slab {...FIG(t > T.susy ? cheer("bun") : sideFig("wave", "bun"), KIT_2016, SIDE_ANCHOR, SIDE_H)} position={[0.75, 1.4, 2.3]} face={f} flip lift={butetLift} rim="#FFD0A0" />
    </>
  );
};
const camOUT = (t: number) =>
  path(t, [
    { t: CUT.OUT, p: [0.6, 3.9, 9.8], tg: [0, 1.05, -2.0] },
    { t: T.berikutnya, p: [0.1, 4.0, 9.4], tg: [0, 1.25, -2.0] },
    { t: TOTAL, p: [-0.5, 5.4, 11.0], tg: [0, 3.8, -3.0] },
  ], 8);

// ================================================================= table
export const SCENES: Record<SceneId, { Set: React.FC<SetProps>; cam: (t: number) => Cam; bg: string; fog: [number, number] }> = {
  A: { Set: SetA, cam: camA, bg: "#0A0D14", fog: [14, 32] },
  B: { Set: SetB, cam: camB, bg: "#0B0E18", fog: [11, 24] },
  C: { Set: SetC, cam: camC, bg: "#0A0E16", fog: [14, 32] },
  C2: { Set: SetC2, cam: camC2, bg: "#BCD2E6", fog: [16, 34] },
  D: { Set: SetD, cam: camD, bg: "#0A0D14", fog: [14, 32] },
  E1: { Set: SetE1, cam: camE1, bg: "#0A0D14", fog: [14, 32] },
  E2: { Set: SetE2, cam: camE2, bg: "#0A0D14", fog: [14, 30] },
  OUT: { Set: SetOUT, cam: camOUT, bg: "#070A18", fog: [18, 40] },
};
