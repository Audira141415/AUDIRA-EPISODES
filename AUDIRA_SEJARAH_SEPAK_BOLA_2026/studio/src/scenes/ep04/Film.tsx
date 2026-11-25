// EP04 film (MARBLEMUSEUM): "Real Madrid Raja Eropa".
// One continuous camera through the approved cover world: a marble trophy gallery. The 15 silver
// cups now stand in chronological order down the aisle (1956 at the far wall, 2024 = the hero in
// front), with four empty, tarnished plinths for the 32-year drought. Each cup's downlight comes on
// when its year is spoken. Behind the opening camera, a trophy shelf holds the ranking (Real Madrid
// 15, AC Milan 7, ten one-time winners) and a navy/red dais rises for PSG 2025 and 2026.
// Every beat is keyed to the locked VO (timeline.json). No audio in the composition.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { makeFloorTexture, makeGiltMaterial, makeMarbleMaterial, makeBeamTexture } from "../../kits/marblemuseum/lib/materials";
import { Outro } from "../_shared/Outro.tsx";
import { Beam, Column, Cup, Downlight, flutedShaft } from "./Cover.tsx";
import { heroPlaque, yearPlaque } from "./coverTextures.ts";
import { ballTexture, filmBanner, gapPlaque, namePlaque, psgPlaque, tierStrip } from "./filmTextures.ts";
import { makeVeinedMarble } from "./marble.ts";
import TL from "./timeline.json";

const { fontFamily: CINZEL } = loadCinzel("normal", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] });

const BG = "#0E0B12";
const PITCH = "#2BD46A";
const GOLD = "#E2C27A";
const CREAM = "#F6F2EA";
const NAVY = "#0B2A5B";
const PSG_RED = "#DA1A32";

type V3 = [number, number, number];
type Clip = { id: string; section: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
const CLIPS = TL.clips as Clip[];
const S = TL.sections as unknown as Record<string, [number, number]>;
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

// ------------------------------------------------------------------ gallery layout
const ROW_X = 1.3;
const ROW_Z0 = -1.9;
const ROW_DZ = 1.75;
const rowZ = (k: number) => ROW_Z0 - k * ROW_DZ;
const BACK_Z = -17.6;
const FRONT_Z = 9.7;

type Slot = { year: number | null; side: -1 | 1; k: number; litAt: number; post81: boolean };
// Chronological zig-zag from the far wall (1956) to the front (2022); 2024 is the hero.
const SLOTS: Slot[] = [
  { year: 1956, side: 1, k: 8, litAt: W("konteks", 8), post81: false },
  { year: 1957, side: -1, k: 8, litAt: W("konteks", 12), post81: false },
  { year: 1958, side: 1, k: 7, litAt: W("konteks", 13), post81: false },
  { year: 1959, side: -1, k: 7, litAt: W("konteks", 14), post81: false },
  { year: 1960, side: 1, k: 6, litAt: W("konteks", 16), post81: false },
  { year: 1966, side: -1, k: 6, litAt: W("pengembangan", 31), post81: false },
  { year: null, side: 1, k: 5, litAt: 999, post81: false },
  { year: null, side: -1, k: 5, litAt: 999, post81: false },
  { year: null, side: 1, k: 4, litAt: 999, post81: false },
  { year: null, side: -1, k: 4, litAt: 999, post81: false },
  { year: 1998, side: 1, k: 3, litAt: W("penjelasan", 1), post81: true },
  { year: 2000, side: -1, k: 3, litAt: W("penjelasan", 6), post81: true },
  { year: 2002, side: 1, k: 2, litAt: W("penjelasan", 7), post81: true },
  { year: 2014, side: -1, k: 2, litAt: W("penjelasan", 9), post81: true },
  { year: 2016, side: 1, k: 1, litAt: W("penjelasan", 14), post81: true },
  { year: 2017, side: -1, k: 1, litAt: W("penjelasan", 15), post81: true },
  { year: 2018, side: 1, k: 0, litAt: W("penjelasan", 16), post81: true },
  { year: 2022, side: -1, k: 0, litAt: W("penjelasan", 22), post81: true },
];
const HERO_LIT = W("penjelasan", 24);
const NINE_AT = W("hook", 11); // "Sembilan final, sembilan trofi"
const NINE_END = W("hook", 14) + 0.4;
const DIM_AT = S.KONTEKS[0];

/** Light level 0..1 of a slot at time t. Frame 0 = cover (all lit). */
const slotLevel = (s: Slot, t: number, order: number) => {
  if (s.year === null) return 0.04 + 0.04 * win(t, 0, DIM_AT + 0.6, 0.01, 0.6);
  const pre = s.post81 ? 1 - seg(t, DIM_AT, DIM_AT + 0.7) : 1 - seg(t, W("hook", 1), W("hook", 1) + 0.9);
  // the nine post-1981 cups pulse in sequence on "sembilan final, sembilan trofi"
  const ninePulse = s.post81 ? win(t, NINE_AT + order * 0.17, NINE_END, 0.15, 0.5) * 0.6 : 0;
  const story = seg(t, s.litAt, s.litAt + 0.45);
  return Math.max(0.08, pre + ninePulse, story);
};
const heroLevel = (t: number) => Math.max(0.22, 1 - seg(t, DIM_AT, DIM_AT + 0.7), seg(t, HERO_LIT, HERO_LIT + 0.5));

// ------------------------------------------------------------------ camera (yaw/pitch keys, monotone Hermite)
type Key = { t: number; v: number[] };
const keys: Key[] = [];
const key = (t: number, p: V3, target: V3, fov: number) => {
  const dx = target[0] - p[0], dy = target[1] - p[1], dz = target[2] - p[2];
  let yaw = Math.atan2(dx, -dz);
  const prev = keys[keys.length - 1];
  if (prev) while (yaw - prev.v[3] > Math.PI) yaw -= 2 * Math.PI;
  if (prev) while (yaw - prev.v[3] < -Math.PI) yaw += 2 * Math.PI;
  const pitch = Math.atan2(dy, Math.hypot(dx, dz));
  keys.push({ t, v: [p[0], p[1], p[2], yaw, pitch, fov] });
};
const forceYaw = (yaw: number) => {
  keys[keys.length - 1].v[3] = yaw;
};

// HOOK: cover framing, push over the hero and down the aisle
key(0, [0, 1.78, 4.4], [0, 1.42, -4], 40);
key(2.6, [0, 1.84, 3.7], [0, 1.44, -4], 40);
key(5.4, [0, 2.8, 1.6], [0, 1.0, -7], 42);
key(S.HOOK[1], [0, 2.75, -1.2], [0, 1.0, -9.5], 46);
// KONTEKS: fly back in time to the far wall; the first five cups light up one by one
key(W("konteks", 5), [0, 2.4, -5.8], [0, 1.0, -15.5], 44);
// truck along the right row: 1956 -> 1958 -> 1960 each framed as the subject when named
key(W("konteks", 8), [-0.45, 1.95, -12.7], [1.3, 1.3, -15.9], 44);
key(W("konteks", 13), [-0.45, 1.9, -11.1], [1.3, 1.3, -14.15], 44);
key(W("konteks", 16), [-0.45, 1.9, -9.4], [1.3, 1.3, -12.4], 44);
key(S.KONTEKS[1] - 0.2, [-0.2, 2.0, -8.8], [0.6, 1.25, -14.5], 44);
// PENGEMBANGAN: five in a row, the two statues, the 1960 final, 1966, the drought
key(23.4, [0, 2.0, -9.6], [0, 1.3, -16.5], 44);
key(W("pengembangan", 10) + 0.4, [0, 1.7, -13.2], [0, 1.35, -18], 42);
key(W("pengembangan", 15), [-0.3, 1.75, -14.3], [1.3, 1.3, -12.2], 42);
key(W("pengembangan", 21) - 0.3, [-0.4, 2.05, -15.3], [0.9, 1.35, -12.5], 44);
key(W("pengembangan", 26) + 0.2, [-0.25, 2.0, -15.1], [0.85, 1.25, -12.5], 43);
key(W("pengembangan", 31) + 0.1, [0.3, 1.75, -14.3], [-1.3, 1.3, -12.4], 42);
key(W("pengembangan", 32), [0.2, 1.9, -14.2], [-1.3, 1.35, -12.4], 44);
key(S.PENGEMBANGAN[1], [0.35, 2.0, -12.9], [-1.3, 0.85, -10.65], 40);
// PENJELASAN: walk forward through time, over the hero, land in front of it
key(43.8, [0, 2.9, -13.4], [0, 0.9, -4.5], 50);
key(48.0, [0, 2.8, -11.6], [0, 0.95, -2.5], 50);
key(54.0, [0, 2.7, -8.4], [0, 1.0, 0], 48);
key(57.2, [0, 3.2, -4.4], [0, 1.3, 0], 46);
key(HERO_LIT + 1.3, [1.9, 2.6, -0.2], [0, 1.4, 0], 44);
key(W("penjelasan", 28) - 0.05, [0.6, 2.1, 2.9], [0, 1.45, 0], 42);
key(W("penjelasan", 31), [0.2, 1.9, 3.8], [0, 1.42, -2], 40);
key(S.PENJELASAN[1], [0, 2.6, 5.2], [0, 1.0, -6], 44);
// PAYOFF: crane up over all fifteen, turn to the trophy shelf, PSG dais, back to the hero
key(W("payoff", 3) - 0.5, [0, 3.9, 5.6], [0, 0.6, -8], 46);
key(W("payoff", 6) - 0.2, [0, 2.6, 3.0], [0, 2.2, 9.5], 52);
forceYaw(Math.PI);
key(W("payoff", 12) - 0.2, [0, 2.55, 3.3], [0, 2.1, 9.5], 52);
key(W("payoff", 19) - 0.3, [0.05, 2.6, 3.6], [0.1, 1.35, 9.5], 52);
key(W("payoff", 25) - 0.1, [0, 2.3, 4.3], [0, 0.62, 9.5], 50);
// match cut: PSG cup -> the hero cup ("sang raja sedang diuji")
const CUT = W("payoff", 26) + 0.55;
key(CUT - 0.02, [0, 2.25, 4.55], [0, 0.6, 9.5], 50);
key(CUT, [0.8, 2.05, 2.85], [0, 1.45, 0], 42);
key(S.PAYOFF[1], [0.6, 2.0, 2.45], [0, 1.45, 0], 41);
// OUTRO: back to the cover framing, then a slow push toward the AUDIRA banner
key(79.4, [0.3, 1.85, 3.9], [0, 1.42, -4], 40);
key(S.OUTRO[1] + 0.2, [0, 1.95, 1.2], [0, 1.5, -10], 44);
key(TL.total + 0.1, [0, 1.98, 0.6], [0, 1.52, -10], 44);

const camAt = (t: number) => {
  const n = keys.length;
  if (t <= keys[0].t) return keys[0].v;
  if (t >= keys[n - 1].t) return keys[n - 1].v;
  let i = 0;
  while (keys[i + 1].t < t) i++;
  const a = keys[i], b = keys[i + 1];
  const h = b.t - a.t;
  const s = (t - a.t) / h;
  const tan = (j: number, c: number) => {
    if (j <= 0 || j >= n - 1) return 0;
    const p = keys[j - 1], q = keys[j], r = keys[j + 1];
    const d0 = (q.v[c] - p.v[c]) / (q.t - p.t);
    const d1 = (r.v[c] - q.v[c]) / (r.t - q.t);
    if (d0 * d1 <= 0) return 0;
    const m = (d0 + d1) / 2;
    const cap = 3 * Math.min(Math.abs(d0), Math.abs(d1));
    return Math.sign(m) * Math.min(Math.abs(m), cap);
  };
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return a.v.map((_, c) => h00 * a.v[c] + h10 * h * tan(i, c) + h01 * b.v[c] + h11 * h * tan(i + 1, c));
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const [x, y, z, yaw, pitch, fov] = camAt(t);
    // gentle hand-held life, zero at frame 0 so the hook equals the cover
    const life = seg(t, 0, 1.5);
    const bx = Math.sin(t * 0.7) * 0.012 * life, by = Math.sin(t * 0.53 + 1.3) * 0.01 * life;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(x + bx, y + by, z);
    const cp = Math.cos(pitch);
    cam.up.set(0, 1, 0);
    cam.lookAt(x + bx + Math.sin(yaw) * cp, y + by + Math.sin(pitch), z - Math.cos(yaw) * cp);
    cam.fov = fov;
    cam.near = 0.05;
    cam.far = 60;
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ------------------------------------------------------------------ props
/** Plinth with gilt band and brass plaques on both faces along the aisle (+z and -z). */
const Plinth: React.FC<{ pos: V3; w: number; h: number; marble: THREE.Material; gilt: THREE.Material; plaque: THREE.Texture; plaqueSize: [number, number]; glow: number; shadow?: boolean; back?: boolean }> = ({
  pos,
  w,
  h,
  marble,
  gilt,
  plaque,
  plaqueSize,
  glow,
  shadow,
  back = true,
}) => (
  <group position={pos}>
    <mesh material={marble} position={[0, 0.06, 0]} castShadow={shadow} receiveShadow>
      <RoundedBoxGeo args={[w * 1.18, 0.12, w * 1.18]} radius={0.03} />
    </mesh>
    <mesh material={marble} position={[0, h / 2, 0]} castShadow={shadow} receiveShadow>
      <RoundedBoxGeo args={[w, h - 0.1, w]} radius={0.03} />
    </mesh>
    <mesh material={gilt} position={[0, h - 0.07, 0]}>
      <RoundedBoxGeo args={[w * 1.04, 0.035, w * 1.04]} radius={0.012} />
    </mesh>
    <mesh material={marble} position={[0, h - 0.02, 0]} castShadow={shadow} receiveShadow>
      <RoundedBoxGeo args={[w * 1.12, 0.06, w * 1.12]} radius={0.025} />
    </mesh>
    {(back ? [1, -1] : [1]).map((f) => (
      <group key={f} position={[0, h * 0.8, (f * w) / 2 + f * 0.008]} rotation={[0, f === 1 ? 0 : Math.PI, 0]}>
        <mesh material={gilt}>
          <RoundedBoxGeo args={[plaqueSize[0] + 0.02, plaqueSize[1] + 0.02, 0.014]} radius={0.005} segments={2} />
        </mesh>
        <mesh position={[0, 0, 0.0085]}>
          <planeGeometry args={plaqueSize} />
          <meshStandardMaterial map={plaque} emissiveMap={plaque} emissive="#FFD58A" emissiveIntensity={glow} metalness={0.75} roughness={0.38} />
        </mesh>
      </group>
    ))}
  </group>
);


const Ball: React.FC<{ pos: V3; r: number; tex: THREE.Texture; s: number }> = ({ pos, r, tex, s }) => (
  <mesh position={[pos[0], pos[1] + r * s, pos[2]]} scale={Math.max(0.001, s)} rotation={[0.4, pos[0] * 7, 0.2]} castShadow>
    <sphereGeometry args={[r, 32, 20]} />
    <meshPhysicalMaterial map={tex} roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.3} />
  </mesh>
);

// ------------------------------------------------------------------ scene
const Scene: React.FC<{ t: number }> = ({ t }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog("#141019", 7, 24);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  const marble = useMemo(() => makeVeinedMarble({ color: "#DAD3C6", scale: 1.5, strength: 0.95, gold: 0.5 }), []);
  const stoneGrain = useSurfaceGrain(311, 0.35, 3);
  const bronze = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#6A5236", metalness: 0.75, roughness: 0.42, clearcoat: 0.2, clearcoatRoughness: 0.5 }), []);
  const patina = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#4F7A68", metalness: 0.3, roughness: 0.7 }), []);
  const wallMarble = useMemo(() => makeMarbleMaterial({ color: "#CFC7B9", scale: 0.6, strength: 0.45, roughness: 0.55 }), []);
  const colMat = useMemo(() => makeMarbleMaterial({ color: "#E0D9CC", scale: 0.8, strength: 0.4, roughness: 0.42 }), []);
  const gilt = useMemo(() => makeGiltMaterial(), []);
  const silver = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#E4E8ED", metalness: 0.86, roughness: 0.17, clearcoat: 0.6, clearcoatRoughness: 0.08, envMapIntensity: 4.2 }), []);
  const psgSilver = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#D6DCE8", metalness: 0.86, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 3.5 }), []);
  const velvetNavy = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: NAVY }), []);
  const shaft = useMemo(() => flutedShaft(0.24, 4.4), []);
  const floorTex = useMemo(() => {
    const tx = makeFloorTexture();
    tx.repeat.set(2.4, 8.2);
    return tx;
  }, []);
  const beamTex = useMemo(() => makeBeamTexture(), []);
  const ball = ballTexture();
  const carpetGrain = useSurfaceGrain(404, 0.3, 10);
  const wallGrain = useSurfaceGrain(59, 0.25, 6);

  const heroL = heroLevel(t);
  const drought = win(t, W("pengembangan", 32) - 0.2, W("penjelasan", 1) + 0.3, 0.6, 0.4);
  const shelfOn = seg(t, S.PENJELASAN[1] - 1.5, S.PENJELASAN[1] + 1);
  const milanN = (i: number) => seg(t, W("payoff", 6) + i * 0.17, W("payoff", 6) + i * 0.17 + 0.3);
  const onceN = (i: number) => seg(t, W("payoff", 12) + i * 0.12, W("payoff", 12) + i * 0.12 + 0.3);
  const psgRise = seg(t, W("payoff", 19), W("payoff", 26) + 0.2);
  const psgLight = seg(t, W("payoff", 25), W("payoff", 26) + 0.4);

  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={0.05} color="#F1E6D6" />
      <hemisphereLight args={["#F3E9DC", "#1A1022", 0.14]} />
      {/* hero key + rim + fills (cover lighting) */}
      <Downlight at={[0, 1.45, 0]} from={[1.3, 4.6, 2.2]} intensity={34 * heroL} angle={0.3} shadow />
      <directionalLight position={[-2.5, 3.5, -3]} intensity={0.9} color="#FFD9A8" />
      <pointLight position={[-1.4, 1.8, 1.6]} intensity={1.6} distance={5} decay={2} color="#CDB8FF" />
      <pointLight position={[0.6, 1.9, 2.6]} intensity={2.2 * Math.max(heroL, 0.5)} distance={4} decay={2} color="#FFF6EA" />
      {/* drought: cold, thin fill over the empty plinths */}
      <pointLight position={[-0.6, 2.8, -9.8]} intensity={10 * drought} distance={7} decay={2} color="#8FA8D0" />
      {/* warm fill over the far end while the first titles are named */}
      <pointLight position={[0.3, 3.0, -13.8]} intensity={5 * win(t, S.KONTEKS[0], S.PENGEMBANGAN[0] + 7.5, 1, 1)} distance={8} decay={2} color="#FFE2C0" />
      {/* PSG takes the throne: navy + red wash on the hero */}
      <pointLight position={[1.6, 2.4, 1.6]} intensity={5 * psgLight * (1 - seg(t, S.OUTRO[0] + 0.5, S.OUTRO[0] + 2))} distance={5} decay={2} color="#3D6BFF" />
      <pointLight position={[-1.6, 2.2, 1.2]} intensity={4 * psgLight * (1 - seg(t, S.OUTRO[0] + 0.5, S.OUTRO[0] + 2))} distance={5} decay={2} color="#FF3048" />

      {SLOTS.map((s, i) => {
        const L = slotLevel(s, t, i - 10);
        return <Downlight key={`dl${i}`} at={[s.side * ROW_X, 1.25, rowZ(s.k)]} intensity={(11 - s.k * 0.25) * L} />;
      })}
      {/* banner light */}
      <Downlight at={[0, 3.05, BACK_Z + 0.4]} from={[0, 4.8, BACK_Z + 3.6]} intensity={30} angle={0.42} color="#FFE6C0" />
      {/* trophy shelf light (behind the opening camera) */}
      <Downlight at={[0, 2.3, FRONT_Z - 0.3]} from={[0, 4.9, FRONT_Z - 3.4]} intensity={36 * shelfOn} angle={0.62} color="#FFEBD0" />
      <Downlight at={[0, 0.9, FRONT_Z - 1.6]} from={[0.3, 4.6, FRONT_Z - 3.2]} intensity={26 * psgLight} angle={0.4} color="#7FA0FF" />

      {/* floor + carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[6, 28]} />
        <meshStandardMaterial map={floorTex} roughness={0.2} metalness={0.05} envMapIntensity={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -4.5]} receiveShadow>
        <planeGeometry args={[1.05, 25]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#3C1F62" roughnessMap={carpetGrain} envMapIntensity={0.15} />
      </mesh>
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, -4.5]}>
          <planeGeometry args={[0.06, 25]} />
          <meshStandardMaterial color="#C99A3E" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}

      {/* walls */}
      {[
        { p: [-3.0, 2.6, -4] as V3, r: Math.PI / 2, w: 28 },
        { p: [3.0, 2.6, -4] as V3, r: -Math.PI / 2, w: 28 },
        { p: [0, 2.6, BACK_Z] as V3, r: 0, w: 6 },
        { p: [0, 2.6, FRONT_Z + 0.1] as V3, r: Math.PI, w: 6 },
      ].map((wl, i) => (
        <group key={i} position={wl.p} rotation={[0, wl.r, 0]}>
          <mesh material={wallMarble} receiveShadow>
            <planeGeometry args={[wl.w, 5.2]} />
          </mesh>
          <mesh position={[0, -2.15, 0.03]}>
            <RoundedBoxGeo args={[wl.w, 0.9, 0.06]} radius={0.02} />
            <meshPhysicalMaterial {...POLISH.stone} color="#2B2230" bumpMap={wallGrain} bumpScale={0.2} />
          </mesh>
          <mesh material={gilt} position={[0, -1.68, 0.07]}>
            <RoundedBoxGeo args={[wl.w, 0.05, 0.08]} radius={0.02} />
          </mesh>
          <mesh material={gilt} position={[0, 2.45, 0.07]}>
            <RoundedBoxGeo args={[wl.w, 0.1, 0.12]} radius={0.03} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 5.2, -4]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 28]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#1E1820" side={THREE.DoubleSide} />
      </mesh>
      {[...Array.from({ length: 10 }, (_, k) => ROW_Z0 + ROW_DZ / 2 - k * ROW_DZ), 1.6, 4.6, 7.8].map((z) => (
        <React.Fragment key={z}>
          <Column pos={[-2.7, 0, z]} mat={colMat} shaft={shaft} gilt={gilt} />
          <Column pos={[2.7, 0, z]} mat={colMat} shaft={shaft} gilt={gilt} />
        </React.Fragment>
      ))}

      {/* back wall banner (KOLEKSI AUDIRA) */}
      <group position={[0, 3.05, BACK_Z + 0.1]}>
        <mesh>
          <planeGeometry args={[1.7, 2.83]} />
          <meshPhysicalMaterial {...POLISH.fabric} map={filmBanner()} color="#FFFFFF" />
        </mesh>
        {[
          [0, 1.48, 1.94, 0.12],
          [0, -1.48, 1.94, 0.12],
          [-0.91, 0, 0.12, 3.08],
          [0.91, 0, 0.12, 3.08],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} material={gilt} position={[x, y, 0.05]}>
            <RoundedBoxGeo args={[w, h, 0.1]} radius={0.03} />
          </mesh>
        ))}
      </group>
      {/* era steles: tall grey stone, engraved brass name plaque, weathered bronze ball with patina (no likeness) */}
      {[
        { x: -0.62, key: "ds", l1: "ALFREDO", l2: "DI STÉFANO", l3: "1956 – 1960" },
        { x: 0.62, key: "pk", l1: "FERENC", l2: "PUSKÁS", l3: "FINAL 1960" },
      ].map((st) => (
        <group key={st.key} position={[st.x, 0, BACK_Z + 0.75]}>
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.56, 0.12, 0.4]} radius={0.02} />
            <meshPhysicalMaterial {...POLISH.stone} color="#7E7A74" roughnessMap={stoneGrain} bumpMap={stoneGrain} bumpScale={0.6} />
          </mesh>
          <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.46, 1.42, 0.32]} radius={0.025} />
            <meshPhysicalMaterial {...POLISH.stone} color="#8E8A84" roughnessMap={stoneGrain} bumpMap={stoneGrain} bumpScale={0.6} />
          </mesh>
          <mesh material={gilt} position={[0, 1.55, 0]}>
            <RoundedBoxGeo args={[0.5, 0.04, 0.36]} radius={0.012} />
          </mesh>
          <mesh position={[0, 0.98, 0.163]}>
            <planeGeometry args={[0.36, 0.45]} />
            <meshStandardMaterial map={namePlaque(st.key, st.l1, st.l2, st.l3)} metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.71, 0]} material={bronze} castShadow>
            <sphereGeometry args={[0.13, 40, 24]} />
          </mesh>
          <mesh position={[0, 1.71, 0]} rotation={[0.3, 0.6, 0]} scale={1.004}>
            <sphereGeometry args={[0.13, 40, 24, 0, 1.2, 0.4, 1.0]} />
            <primitive object={patina} attach="material" />
          </mesh>
        </group>
      ))}
      {/* the fifteen titles (and the empty drought plinths) */}
      {SLOTS.map((s, i) => {
        const L = slotLevel(s, t, i - 10);
        const named = s.year === null ? 0 : win(t, s.litAt - 0.05, s.litAt + 1.4, 0.15, 0.6);
        const p: V3 = [s.side * ROW_X, 0, rowZ(s.k)];
        return (
          <React.Fragment key={`s${i}`}>
            <Plinth pos={p} w={0.5} h={1.0} marble={marble} gilt={gilt} plaque={s.year ? yearPlaque(s.year) : gapPlaque()} plaqueSize={[0.3, 0.1125]} glow={0.05 + 0.25 * L + 0.9 * named} />
            {s.year !== null && <Cup pos={[p[0], 1.0, p[2]]} scale={1.0} rotY={-s.side * 0.25} mat={silver} />}
          </React.Fragment>
        );
      })}

      {/* the 1960 final: 7 footballs on a velvet tray beside the cup (Puskás 4, Di Stéfano 3) */}
      <group position={[0.4, -1.3 * (1 - seg(t, W("pengembangan", 11) - 0.4, W("pengembangan", 11) + 0.9)), -12.75]} rotation={[0, 0.6, 0]}>
        <mesh material={marble} position={[0, 0.6, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.62, 1.2, 0.36]} radius={0.03} />
        </mesh>
        <mesh position={[0, 1.215, 0]} receiveShadow>
          <RoundedBoxGeo args={[0.58, 0.03, 0.32]} radius={0.01} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#4A2675" />
        </mesh>
        {[0, 1, 2, 3].map((j) => (
          <Ball key={`p${j}`} pos={[-0.21 + j * 0.14, 1.23, -0.07]} r={0.055} tex={ball} s={seg(t, W("pengembangan", 22) + j * 0.12, W("pengembangan", 22) + j * 0.12 + 0.25)} />
        ))}
        {[0, 1, 2].map((j) => (
          <Ball key={`d${j}`} pos={[-0.14 + j * 0.14, 1.23, 0.08]} r={0.055} tex={ball} s={seg(t, W("pengembangan", 26) + j * 0.12, W("pengembangan", 26) + j * 0.12 + 0.25)} />
        ))}
      </group>
      {/* one tarnished empty plinth lit cold for the drought */}
      <Downlight at={[-1.3, 1.0, -10.65]} from={[-0.6, 4.2, -11.6]} intensity={14 * drought} angle={0.26} color="#B9CCF0" />
      <Downlight at={[0.4, 1.2, -12.75]} from={[0.0, 3.8, -14.2]} intensity={9 * win(t, W("pengembangan", 21), W("pengembangan", 31), 0.5, 0.8)} angle={0.25} />

      {/* hero: 2024, title 15 */}
      <Plinth pos={[0, 0, 0]} w={0.78} h={1.0} marble={marble} gilt={gilt} plaque={heroPlaque()} plaqueSize={[0.6, 0.27]} glow={0.05 + 0.6 * win(t, HERO_LIT - 0.05, HERO_LIT + 2.5, 0.2, 0.8)} shadow back={false} />
      <mesh position={[0, 0.8, -0.398]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.44, 0.165]} />
        <meshStandardMaterial map={yearPlaque(2024)} emissiveMap={yearPlaque(2024)} emissive="#FFD58A" emissiveIntensity={0.05 + 0.9 * win(t, HERO_LIT - 0.05, HERO_LIT + 1.4, 0.15, 0.6)} metalness={0.75} roughness={0.38} />
      </mesh>
      <Cup pos={[0, 1.0, 0]} scale={1.45} rotY={0.12} mat={silver} shadow />
      <GroundShadow scale={2.4} opacity={0.65} blur={2.2} far={1.2} />
      <Beam pos={[0.35, 2.9, 0.5]} h={4.2} w={1.4} o={0.05 * heroL} tex={beamTex} />
      <Beam pos={[0, 3.6, BACK_Z + 1.1]} h={3.6} w={1.6} o={0.04} tex={beamTex} />

      {/* trophy shelf on the front wall: Real Madrid 15 / AC Milan 7 / ten one-time winners */}
      <group position={[0, 0, FRONT_Z - 0.35]}>
        {[
          { y: 3.25, n: 15, key: "rm", text: "REAL MADRID  ·  15", acc: ["#F4F1EA", "#4A2675"], show: (_: number) => 1 },
          { y: 2.4, n: 7, key: "milan", text: "AC MILAN  ·  7", acc: ["#C8102E", "#1A1A1A"], show: milanN },
          { y: 1.55, n: 10, key: "once", text: "10 KLUB  ·  MASING-MASING 1", acc: ["#8C8C8C"], show: onceN },
        ].map((tier) => (
          <group key={tier.key} position={[0, tier.y, 0]} rotation={[0, Math.PI, 0]}>
            <mesh material={marble} position={[0, -0.05, 0]} receiveShadow castShadow>
              <RoundedBoxGeo args={[3.8, 0.1, 0.42]} radius={0.02} />
            </mesh>
            <mesh position={[0, -0.13, 0.215]}>
              <planeGeometry args={[3.8, 0.17]} />
              <meshStandardMaterial map={tierStrip(tier.key, tier.text, tier.acc)} metalness={0.7} roughness={0.4} />
            </mesh>
            {Array.from({ length: tier.n }, (_, i) => {
              const sc = tier.show(i);
              return sc > 0.001 ? <Cup key={i} pos={[-1.65 + i * 0.235, 0, 0.02]} scale={0.27 * sc} rotY={0.2} mat={silver} /> : null;
            })}
          </group>
        ))}
      </group>
      {/* PSG dais rises: two navy plinths, 2025 and 2026 (generic colours, no crest) */}
      {[2025, 2026].map((y, i) => {
        const x = i === 0 ? 0.42 : -0.42;
        const lift = -1.25 + 1.25 * psgRise;
        return (
          <group key={y} position={[x, lift, FRONT_Z - 1.6]} rotation={[0, Math.PI, 0]}>
            <mesh material={velvetNavy} position={[0, 0.45, 0]} castShadow receiveShadow>
              <RoundedBoxGeo args={[0.44, 0.9, 0.44]} radius={0.03} />
            </mesh>
            <mesh position={[0, 0.45, 0.001]}>
              <RoundedBoxGeo args={[0.1, 0.9, 0.446]} radius={0.01} segments={2} />
              <meshPhysicalMaterial {...POLISH.fabric} color={PSG_RED} />
            </mesh>
            <mesh position={[0, 0.72, 0.232]}>
              <planeGeometry args={[0.3, 0.1125]} />
              <meshStandardMaterial map={psgPlaque(y)} roughness={0.5} />
            </mesh>
            <Cup pos={[0, 0.9, 0]} scale={0.8} rotY={0.2} mat={psgSilver} />
          </group>
        );
      })}

      <Finish frame={Math.round(t * 60)} background={BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.82} envIntensity={0.35} hdri="studio" ao />
    </>
  );
};

// ------------------------------------------------------------------ HTML layers
const LABELS: { a: number; b: number; title: string; sub?: string; color?: string }[] = [
  { a: 2.75, b: W("hook", 11) - 0.1, title: "SEJAK 1981", sub: "TAK PERNAH KALAH DI FINAL" },
  { a: W("hook", 11), b: S.HOOK[1] + 0.2, title: "9 FINAL · 9 TROFI" },
  { a: W("konteks", 4), b: W("konteks", 6), title: "1956", sub: "EDISI PERTAMA" },
  { a: W("pengembangan", 0), b: W("pengembangan", 6) - 0.1, title: "5 GELAR BERUNTUN", sub: "1956 – 1960" },
  { a: W("pengembangan", 11), b: W("pengembangan", 27) - 0.1, title: "FINAL 1960 · GLASGOW", sub: "REAL MADRID 7–3 EINTRACHT FRANKFURT" },
  { a: W("pengembangan", 27), b: W("pengembangan", 32) - 0.1, title: "GELAR KE-6", sub: "1966" },
  { a: W("penjelasan", 10), b: W("penjelasan", 22) - 0.1, title: "3 GELAR BERUNTUN", sub: "2016 – 2018" },
  { a: W("penjelasan", 24), b: W("penjelasan", 31) - 0.1, title: "FINAL 2024 · WEMBLEY", sub: "REAL MADRID 2–0 DORTMUND" },
  { a: W("penjelasan", 31), b: S.PENJELASAN[1] + 0.1, title: "18 FINAL · 15 MENANG" },
  { a: S.PAYOFF[0], b: W("payoff", 3) - 0.1, title: "15 TROFI" },
  { a: W("payoff", 3), b: W("payoff", 12) - 0.1, title: "AC MILAN: 7", sub: "BELUM SETENGAH DARI 15" },
  { a: W("payoff", 12), b: W("payoff", 19) - 0.1, title: "10 KLUB", sub: "CUMA SEKALI JUARA" },
  { a: W("payoff", 19), b: W("payoff", 26) + 0.55, title: "PSG: 2025 · 2026", sub: "TAKHTA DIREBUT" },
  { a: W("payoff", 27), b: S.PAYOFF[1] + 0.1, title: "SANG RAJA DIUJI" },
  { a: S.OUTRO[0], b: W("outro", 5) - 0.1, title: "AUDIRA", sub: "SEJARAH SEPAK BOLA" },
  { a: W("outro", 5), b: S.OUTRO[1] + 0.3, title: "BERIKUTNYA", sub: "KLUB PALING SERING JUARA LIGA" },
];

const Label: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <>
    {LABELS.map((l, i) => {
      const o = win(t, l.a, l.b, 0.25, 0.25);
      if (o <= 0) return null;
      const rise = (1 - seg(t, l.a, l.a + 0.4)) * 18;
      return (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 360 * k, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, transform: `translateY(${rise * k}px)` }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: (l.title.length > 14 ? 74 : 104) * k, color: l.color ?? GOLD, letterSpacing: 1 * k, lineHeight: 1.0, textShadow: `0 ${5 * k}px ${22 * k}px rgba(0,0,0,0.8)`, textAlign: "center", padding: `0 ${50 * k}px` }}>
            {l.title}
          </div>
          {l.sub && (
            <div style={{ marginTop: 16 * k, fontFamily: OSWALD, fontWeight: 600, fontSize: 34 * k, letterSpacing: 4 * k, color: CREAM, background: "rgba(14,11,18,0.72)", border: `${2 * k}px solid ${PITCH}`, padding: `${6 * k}px ${22 * k}px` }}>
              {l.sub}
            </div>
          )}
        </div>
      );
    })}
  </>
);

/** Small persistent ticker, top-left: the latest title lit (GELAR KE-n · year). */
const ORDER = SLOTS.filter((s) => s.year !== null)
  .map((s) => ({ year: s.year as number, at: s.litAt }))
  .concat([{ year: 2024, at: HERO_LIT }])
  .sort((a, b) => a.at - b.at);
const Ticker: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, ORDER[0].at, S.PENJELASAN[1], 0.3, 0.4);
  if (o <= 0) return null;
  let n = 0;
  ORDER.forEach((e, i) => {
    if (t >= e.at) n = i + 1;
  });
  if (n === 0) return null;
  const e = ORDER[n - 1];
  const pop = 1 + 0.04 * (1 - seg(t, e.at, e.at + 0.3));
  // drought counter: 1966 -> 1998 while "kemarau panjang tiga puluh dua tahun"
  const dA = W("pengembangan", 32), dB = W("penjelasan", 1);
  const inDrought = t >= dA && t < dB;
  const dYear = Math.round(1966 + 32 * seg(t, dA, W("pengembangan", 38) + 0.1));
  if (inDrought) {
    // one subject: the big drought counter over the single lit empty plinth
    const od = win(t, dA, dB, 0.3, 0.3);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: 330 * k, opacity: od, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 34 * k, letterSpacing: 6 * k, color: "#9FB6DA" }}>KEMARAU</div>
        <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: 132 * k, color: CREAM, lineHeight: 1.0, textShadow: `0 ${6 * k}px ${24 * k}px rgba(0,0,0,0.8)` }}>{dYear - 1966} TAHUN</div>
        <div style={{ marginTop: 14 * k, fontFamily: OSWALD, fontWeight: 600, fontSize: 36 * k, letterSpacing: 4 * k, color: CREAM, background: "rgba(14,11,18,0.78)", border: `${2 * k}px solid #7F9CC8`, padding: `${6 * k}px ${22 * k}px` }}>1966 → {dYear} · TANPA GELAR</div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 60 * k, top: 268 * k, opacity: o, display: "flex", alignItems: "center", gap: 16 * k, transform: `scale(${pop})`, transformOrigin: "left center" }}>
      <div style={{ width: 10 * k, height: 54 * k, background: inDrought ? "#7F9CC8" : PITCH }} />
      <div>
        <div style={{ fontFamily: OSWALD, fontWeight: 500, fontSize: 32 * k, letterSpacing: 4 * k, color: inDrought ? "#9FB6DA" : PITCH }}>{inDrought ? "KEMARAU" : `GELAR KE-${n}`}</div>
        <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: 46 * k, color: CREAM, lineHeight: 1.0 }}>{inDrought ? `${dYear} · ${dYear - 1966} TAHUN` : e.year}</div>
      </div>
    </div>
  );
};

/** Name cards for the two statues (Di Stéfano left, Puskás right). */
const NameCards: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const cards = [
    { name: "ALFREDO DI STÉFANO", role: "REAL MADRID · 1956–1960", at: W("pengembangan", 7), x: 70 },
    { name: "FERENC PUSKÁS", role: "REAL MADRID · FINAL 1960", at: W("pengembangan", 10), x: 560 },
  ];
  return (
    <>
      {cards.map((c) => {
        const o = win(t, c.at - 0.1, W("pengembangan", 11) + 0.6, 0.3, 0.3);
        if (o <= 0) return null;
        return (
          <div key={c.name} style={{ position: "absolute", left: c.x * k, top: 1050 * k, width: 450 * k, opacity: o, background: "rgba(250,247,240,0.94)", padding: `${14 * k}px ${18 * k}px`, borderLeft: `${8 * k}px solid ${PITCH}`, boxShadow: `0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.45)` }}>
            <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: 32 * k, color: "#1D1A17", lineHeight: 1.05 }}>{c.name}</div>
            <div style={{ fontFamily: OSWALD, fontWeight: 500, fontSize: 24 * k, letterSpacing: 2 * k, color: "#5A4A33", marginTop: 6 * k }}>{c.role}</div>
          </div>
        );
      })}
      {/* goals chips on the 1960 final */}
      {[
        { txt: "PUSKÁS · 4 GOL", at: W("pengembangan", 21) },
        { txt: "DI STÉFANO · 3 GOL", at: W("pengembangan", 24) },
      ].map((g, i) => {
        const o = win(t, g.at, W("pengembangan", 27) - 0.1, 0.25, 0.25);
        if (o <= 0) return null;
        return (
          <div key={g.txt} style={{ position: "absolute", left: 70 * k, top: (1020 + i * 86) * k, opacity: o, fontFamily: OSWALD, fontWeight: 600, fontSize: 38 * k, letterSpacing: 3 * k, color: CREAM, background: "rgba(74,38,117,0.88)", border: `${2 * k}px solid ${GOLD}`, padding: `${6 * k}px ${20 * k}px` }}>
            {g.txt}
          </div>
        );
      })}
    </>
  );
};

/** Hook title = the approved cover text, then it lifts away. */
const HookTitle: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = 1 - seg(t, 2.2, 2.8);
  if (o <= 0) return null;
  const dim = 1 - seg(t, 2.2, 3.2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, opacity: dim, background: "linear-gradient(180deg, rgba(14,11,18,0.9) 0%, rgba(14,11,18,0.72) 22%, rgba(14,11,18,0.0) 36%, rgba(14,11,18,0) 80%, rgba(14,11,18,0.5) 100%)" }} />
      <div style={{ opacity: o, transform: `translateY(${-30 * seg(t, 2.2, 2.8) * k}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 196 * k, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 32 * k, letterSpacing: 7 * k, color: PITCH }}>SEJARAH SEPAK BOLA #04</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 240 * k, textAlign: "center", fontFamily: CINZEL, fontWeight: 900, lineHeight: 1.0, textShadow: `0 ${6 * k}px ${26 * k}px rgba(0,0,0,0.7)` }}>
          <div style={{ fontSize: 150 * k, color: GOLD, letterSpacing: -2 * k }}>15 KALI</div>
          <div style={{ fontSize: 90 * k, color: CREAM, marginTop: 4 * k, letterSpacing: 1 * k }}>RAJA EROPA</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 500 * k, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: OSWALD, fontWeight: 500, fontSize: 28 * k, letterSpacing: 4 * k, color: CREAM, background: "rgba(74,38,117,0.85)", border: `${2 * k}px solid ${GOLD}`, padding: `${6 * k}px ${22 * k}px` }}>18 FINAL · 15 GELAR · 1956–2024</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ karaoke captions
type Group = { words: { w: string; s: number; e: number }[]; a: number; b: number };
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const c of CLIPS) {
    const gs: { w: string; s: number; e: number }[][] = [];
    let cur: { w: string; s: number; e: number }[] = [];
    c.words.forEach((w) => {
      cur.push(w);
      const end = /[.?!:]$/.test(w.w);
      const comma = /,$/.test(w.w);
      if ((end && cur.length >= 2) || cur.length >= 6 || (comma && cur.length >= 4)) {
        gs.push(cur);
        cur = [];
      }
    });
    if (cur.length) gs.push(cur);
    for (let i = gs.length - 1; i > 0; i--) {
      if (gs[i].length === 1) {
        gs[i - 1].push(...gs[i]);
        gs.splice(i, 1);
      }
    }
    if (gs.length > 1 && gs[0].length === 1) {
      gs[1].unshift(...gs[0]);
      gs.shift();
    }
    gs.forEach((g, i) => {
      const next = gs[i + 1];
      out.push({ words: g, a: g[0].s - 0.08, b: next ? next[0].s - 0.08 : Math.min(g[g.length - 1].e + 0.5, c.end + 0.3) });
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= S.OUTRO[1] + 0.2) return null;
  const g = GROUPS.find((x) => t >= x.a && t < x.b);
  if (!g) return null;
  const n = g.words.length;
  const lines = n > 4 ? [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))] : [g.words];
  const o = win(t, g.a, g.b, 0.08, 0.08);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k, opacity: o }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 24 * k, background: "rgba(14,11,18,0.74)", padding: `${8 * k}px ${22 * k}px`, borderRadius: 6 * k }}>
          {ln.map((w, wi) => {
            const active = t >= w.s - 0.03 && t < w.e + 0.05;
            const said = t >= w.s;
            const pop = active ? 1 + 0.04 * (1 - seg(t, w.s, w.s + 0.18)) : 1;
            return (
              <span key={wi} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 52 * k, color: active ? GOLD : said ? CREAM : "rgba(246,242,234,0.8)", transform: `scale(${pop})`, display: "inline-block", textShadow: `0 ${3 * k}px ${12 * k}px rgba(0,0,0,0.75)` }}>
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0, 1.78, 4.4], fov: 40, near: 0.05, far: 60 }}>
        <Scene t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {/* museum vignette: darker gallery edges, the lit subject stands out (subject separation) */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 52% at 50% 50%, rgba(8,6,10,0) 45%, rgba(8,6,10,0.5) 80%, rgba(8,6,10,0.72) 100%)", opacity: seg(t, 2.3, 3.0) }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,6,10,0.62) 0%, rgba(8,6,10,0.38) 17%, rgba(8,6,10,0) 27%, rgba(8,6,10,0) 73%, rgba(8,6,10,0.38) 83%, rgba(8,6,10,0.62) 100%)", opacity: seg(t, 2.3, 3.0) }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,11,18,0.78) 0%, rgba(14,11,18,0.6) 24%, rgba(14,11,18,0.0) 38%, rgba(14,11,18,0) 62%, rgba(14,11,18,0.45) 100%)", opacity: seg(t, 2.2, 3.2) }} />
        <HookTitle t={t} k={k} />
        <Ticker t={t} k={k} />
        <Label t={t} k={k} />
        <NameCards t={t} k={k} />
        <Captions t={t} k={k} />
      </AbsoluteFill>
      <Outro start={S.OUTRO[1] + 0.2} />
    </AbsoluteFill>
  );
};
