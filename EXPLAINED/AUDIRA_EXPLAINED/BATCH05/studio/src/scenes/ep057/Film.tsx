// AE-057 film — "Mengapa Bata Ringan Lebih Ringan dari Bata Merah?" (CLAYWORLD).
// One clay tabletop world; every cut, beat and caption is keyed to timeline.json (Audio Master
// Clock). Camera = keyframed dolly/orbit/crane per shot, continuous across linked shots.
// Audio is NOT in the composition (muxed by the lead). Signature is added by Root.tsx.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import TL from "./timeline.json";
import { CLAY_PALETTE as P } from "../../kits/clayworld/lib/palette";
import { MANROPE } from "../../core/type/fonts.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { ANTON, C, Mould, Scale, SplitBlock, TILT, fracturePoints, makePoreFace, project, rnd, useAnton, type Cam } from "./Cover.tsx";
import {
  AX, AirGauge, Blob, CX, ClayMat, Crystal, CutAutoclave, FX, Factory, HERO_MOULD, HX, HeatWater, KX, Kiln, MIXER, MY, Macro, WALL, XX,
  backOut, clamp01, ramp, smooth, type Ingredient, type V3,
} from "./world.tsx";

// ---------------------------------------------------------------- clock
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
export const TOTAL = TL.total as number;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const clip = (id: string) => CLIPS.find((c) => c.id === id)!;
/** start time of the first word `w` at or after `after` seconds */
const at = (w: string, after = 0): number => {
  for (const c of CLIPS) for (const x of c.words) if (x.s >= after && norm(x.w) === norm(w)) return x.s;
  throw new Error(`word not in timeline: ${w}`);
};

// ---------------------------------------------------------------- beats (all from VO words)
const B = {
  tilt0: 0.15,
  tagAac: at("bata"),
  third: at("sepertiga"),
  tagBrick: at("merah"),
  air1: at("udara", 9),
  clayTag: at("tanah"),
  fired: at("dibakar"),
  factory: at("bata", 15),
  pasir: at("pasir"),
  semen: at("semen"),
  kapur: at("kapur"),
  air: at("air", 20),
  alu: at("aluminium"),
  basa: at("basa"),
  react: at("bereaksi"),
  h2: at("gas", 26),
  rise0: clip("l07").start,
  roti: at("mengembang"),
  keluar: at("gasnya"),
  rongga: at("rongganya"),
  potong: at("dipotong"),
  kawat: at("kawat"),
  lalu: at("lalu", 36),
  uap: at("uap"),
  bukan: at("bukan"),
  kristal: at("membentuk"),
  kuat: at("kekuatan"),
  hasil: clip("l11").start,
  separuh: at("separuh"),
  heat: clip("l12").start,
  hambat: at("menghambat"),
  serap: at("menyerap"),
  plester: at("diplester"),
  batu: at("batu"),
  audira: at("audira"),
};

// ---------------------------------------------------------------- shots
type Key = { t: number; p: V3; g: V3 };
type Flash = { color: string; d: number; a: number };
type Shot = { id: string; start: number; end: number; scene: string; kicker: string; keys: Key[]; light: V3; flash?: Flash };
const st = {
  s1: 0,
  s2: clip("l02").start - 0.1,
  s3: clip("l03").start - 0.12,
  s4: clip("l04").start - 0.1,
  s5: clip("l05").start - 0.12,
  s6: clip("l06").start - 0.1,
  s7: clip("l07").start - 0.1,
  s8: clip("l08").start - 0.1,
  s9: clip("l09").start - 0.12,
  s10: B.lalu - 0.1,
  s11: clip("l10").start - 0.1,
  s12: clip("l11").start - 0.12,
  s13: clip("l12").start - 0.1,
  s14: clip("l13").start - 0.1,
  s15: clip("l14").start - 0.12,
  s16: clip("l15").start - 0.3,
};
const CREAM: Flash = { color: "#FFF3DF", d: 0.14, a: 0.55 };
const DOUGH: Flash = { color: "#CFCBC2", d: 0.22, a: 0.9 };
const STEAM: Flash = { color: "#FBFBF8", d: 0.32, a: 1 };

const S1_END: Key = { t: st.s2, p: [1.0, 6.0, 21.0], g: [0.1, 2.4, 0.8] };
const S3_END: Key = { t: st.s4, p: [KX + 1.2, 3.0, 12.2], g: [KX + 0.5, 1.35, 0] };
const S9_END: Key = { t: st.s10, p: [CX + 3.2, 3.4, 7.0], g: [CX, 0.9, 0] };
const S13_END: Key = { t: st.s14, p: [HX + 0.7, 6.6, 10.0], g: [HX, 1.0, 0.3] };
const S15_END: Key = { t: st.s16, p: [-2.4, 2.9, 13.0], g: [0.15, 0.6, 6.4] };
const hook: V3 = [0, 0, 2];

const RAW: Omit<Shot, "end">[] = [
  { id: "S01", start: st.s1, scene: "hook", kicker: "SAMA UKURAN", light: hook, keys: [{ t: 0, p: [-3.0, 5.2, 20.8], g: [0, 2.2, 0] }, S1_END] },
  { id: "S02", start: st.s2, scene: "hook", kicker: "DI DALAMNYA", light: hook, keys: [S1_END, { t: B.air1, p: [0.15, 1.25, 9.2], g: [0.15, 0.5, 6.5] }, { t: st.s3, p: [0.15, 1.1, 8.85], g: [0.15, 0.5, 6.5] }] },
  { id: "S03", start: st.s3, scene: "kiln", kicker: "BATA MERAH", light: [KX, 0, 0], flash: CREAM, keys: [{ t: st.s3, p: [KX - 2.8, 2.4, 11.6], g: [KX, 1.3, 0] }, S3_END] },
  { id: "S04", start: st.s4, scene: "kiln", kicker: "BATA RINGAN", light: [FX - 1, 0, 0], keys: [S3_END, { t: st.s4 + 1.6, p: [FX - 1.0, 5.6, 17.5], g: [FX - 1.2, 1.5, 0] }, { t: st.s5, p: [FX - 2.0, 5.8, 15.6], g: [FX - 1.6, 1.7, -0.3] }] },
  { id: "S05", start: st.s5, scene: "factory", kicker: "BAHAN", light: MIXER, flash: CREAM, keys: [{ t: st.s5, p: [FX - 2.0, 7.2, 5.2], g: [FX - 3.1, 2.9, -1.0] }, { t: st.s6 - 0.55, p: [FX - 3.6, 6.4, 4.1], g: [FX - 3.1, 2.8, -1.0] }, { t: st.s6, p: [FX - 3.1, 3.7, -0.5], g: [FX - 3.1, 2.4, -1.0] }] },
  { id: "S06", start: st.s6, scene: "macro", kicker: "REAKSI", light: [0, MY, 0], flash: DOUGH, keys: [{ t: st.s6, p: [-1.0, MY + 0.6, 8.2], g: [0, MY, 0] }, { t: st.s7, p: [0.5, MY + 0.1, 6.7], g: [0.1, MY + 0.1, 0] }] },
  { id: "S07", start: st.s7, scene: "factory", kicker: "CETAKAN BAJA", light: HERO_MOULD, flash: DOUGH, keys: [{ t: st.s7, p: [FX + 1.9, 2.5, 3.0], g: [FX + 0.6, 1.2, 0.4] }, { t: st.s8, p: [FX + 4.2, 4.4, 9.6], g: [FX + 0.6, 1.3, 0.4] }] },
  { id: "S08", start: st.s8, scene: "macro", kicker: "GAS KELUAR", light: [0, MY, 0], flash: DOUGH, keys: [{ t: st.s8, p: [0.5, MY + 0.3, 8.4], g: [0, MY + 0.2, 0] }, { t: st.s9, p: [-0.4, MY + 1.4, 9.3], g: [0, MY + 0.8, 0] }] },
  { id: "S09", start: st.s9, scene: "cut", kicker: "DIPOTONG", light: [CX, 0, -3], flash: CREAM, keys: [{ t: st.s9, p: [CX + 4.4, 4.0, 8.4], g: [CX, 0.8, 0] }, S9_END] },
  { id: "S10", start: st.s10, scene: "cut", kicker: "AUTOKLAF", light: [CX, 0, -3], keys: [S9_END, { t: st.s10 + 1.4, p: [CX + 6.0, 5.2, 8.5], g: [CX, 1.8, -5.5] }, { t: st.s11, p: [CX + 2.2, 3.0, 0.2], g: [CX, 2.0, -4.7] }] },
  { id: "S11", start: st.s11, scene: "crystal", kicker: "KRISTAL", light: [XX, MY, 0], flash: STEAM, keys: [{ t: st.s11, p: [XX + 1.4, MY + 0.9, 6.6], g: [XX, MY, -1] }, { t: st.s12, p: [XX - 0.5, MY + 0.3, 4.2], g: [XX, MY, -1.2] }] },
  { id: "S12", start: st.s12, scene: "air", kicker: "HASILNYA", light: [AX + 1, 0, 2], flash: CREAM, keys: [{ t: st.s12, p: [AX - 0.4, 3.2, 11.8], g: [AX + 0.9, 1.2, 2] }, { t: st.s13, p: [AX + 1.9, 2.6, 10.6], g: [AX + 0.9, 1.2, 2] }] },
  { id: "S13", start: st.s13, scene: "heat", kicker: "PANAS", light: [HX, 0, 0], flash: CREAM, keys: [{ t: st.s13, p: [HX - 1.6, 7.6, 10.8], g: [HX, 0.9, 0.2] }, S13_END] },
  { id: "S14", start: st.s14, scene: "heat", kicker: "AIR", light: [HX + 1, 0, 0], keys: [S13_END, { t: st.s14 + 1.0, p: [HX + WALL.gap + 2.4, 2.1, 6.0], g: [HX + WALL.gap, 1.3, 0.2] }, { t: st.s15, p: [HX + WALL.gap + 1.4, 1.9, 5.5], g: [HX + WALL.gap, 1.25, 0.2] }] },
  { id: "S15", start: st.s15, scene: "hook", kicker: "", light: hook, flash: CREAM, keys: [{ t: st.s15, p: [2.8, 2.6, 13.2], g: [0.15, 0.6, 6.4] }, S15_END] },
  { id: "S16", start: st.s16, scene: "hook", kicker: "", light: hook, keys: [S15_END, { t: OUTRO_AT, p: [0.2, 2.1, 5.0], g: [0, 0.85, 0.6] }, { t: TOTAL, p: [0.25, 2.0, 4.7], g: [0, 0.85, 0.6] }] },
];
export const SHOTS: Shot[] = RAW.map((s, i) => ({ ...s, end: i + 1 < RAW.length ? RAW[i + 1].start : TOTAL }));
const shotAt = (t: number) => {
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].start) i++;
  return SHOTS[i];
};
const ease = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(u));
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const camFor = (sh: Shot, t: number): Cam => {
  const k = sh.keys;
  let j = 0;
  while (j + 1 < k.length - 1 && t >= k[j + 1].t) j++;
  const a = k[j], b = k[Math.min(j + 1, k.length - 1)];
  const u = b.t > a.t ? ease((t - a.t) / (b.t - a.t)) : 1;
  const p = lerp3(a.p, b.p, u);
  // tiny hand-held breathing so holds never freeze
  p[0] += Math.sin(t * 0.9) * 0.03;
  p[1] += Math.sin(t * 0.7 + 1) * 0.02;
  return { pos: p, target: lerp3(a.g, b.g, u), fov: 34 };
};

// ---------------------------------------------------------------- 3D
const Rig: React.FC<{ cam: Cam; light: V3 }> = ({ cam, light }) => {
  const { camera, gl } = useThree();
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  useLayoutEffect(() => {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(...cam.pos);
    p.lookAt(...cam.target);
    p.fov = cam.fov;
    p.near = 0.1;
    p.far = 260;
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap; // crisp contact shadows (cover weakness: too soft)
    if (key.current) {
      key.current.position.set(light[0] - 7, light[1] + 13, light[2] + 7);
      key.current.target.position.set(...light);
      key.current.target.updateMatrixWorld();
    }
    if (fill.current) fill.current.position.set(light[0] + 7, light[1] + 4, light[2] + 6);
  }, [cam, camera, gl, light]);
  return (
    <>
      <directionalLight
        ref={key}
        intensity={4.4}
        color="#ffe8c8"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={9}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
        shadow-radius={1}
      />
      <pointLight ref={fill} intensity={8} color="#ffd6b0" distance={30} />
    </>
  );
};

const HookSet: React.FC<{ t: number; grain: THREE.Texture; fineGrain: THREE.Texture }> = ({ t, grain, fineGrain }) => {
  // the brick lands and the beam swings, settling with a damped wobble
  const u = Math.max(0, t - B.tilt0);
  const tilt = t < B.tilt0 ? 0 : TILT * (1 - Math.exp(-2.6 * u) * Math.cos(7.0 * u));
  return (
    <group>
      <Mould grain={grain} rise={0.05 + Math.sin(t * 0.5) * 0.02} />
      <Blob p={[0, 0, -5.2]} w={7.6} d={3.4} o={0.5} />
      <Scale tilt={tilt} grain={grain} poreGrain={fineGrain} />
      <Blob p={[0, 0, 0]} w={3.0} d={1.9} o={0.6} />
      <SplitBlock grain={fineGrain} />
      <Blob p={[0.15, 0, 6.3]} w={3.4} d={2.0} o={0.55} />
      {[[3.4, 3.2, 0.2, P.terracotta], [-1.9, 2.4, 0.14, P.mustard], [3.7, 1.0, 0.16, P.coral], [-3.9, 1.4, 0.18, P.olive], [2.3, 5.6, 0.13, P.mustard]].map(([x, z, r, c], i) => (
        <mesh key={i} position={[x as number, (r as number) * 0.6, z as number]} scale={[1.2, 0.7, 1]} castShadow>
          <sphereGeometry args={[r as number, 18, 12]} />
          <ClayMat color={c as string} grain={grain} />
        </mesh>
      ))}
    </group>
  );
};

const INGREDIENTS = (): Ingredient[] => [
  { key: "pasir", t0: B.pasir, color: "#D9BE8C", n: 22, r: 0.05, kind: "grain", from: [-0.35, 0.15] },
  { key: "semen", t0: B.semen, color: "#8E9090", n: 18, r: 0.055, kind: "grain", from: [0.35, -0.2] },
  { key: "kapur", t0: B.kapur, color: "#F3EFE6", n: 9, r: 0.09, kind: "lump", from: [0.0, 0.35] },
  { key: "air", t0: B.air, color: "#7FC4E8", n: 22, r: 0.045, kind: "water", from: [-0.15, -0.3] },
  { key: "alu", t0: B.alu - 0.15, color: "#D7DEE6", n: 7, r: 0.04, kind: "metal", from: [0.25, 0.1] },
];

const World: React.FC<{ t: number; frame: number; sh: Shot; cam: Cam }> = ({ t, frame, sh, cam }) => {
  const grain = useSurfaceGrain(17, 0.45, 3);
  const fineGrain = useSurfaceGrain(23, 0.3, 6);
  const doughTex = useMemo(() => makePoreFace(41, 2048, 512, 6, C.dough, 0.5).map, []);
  const ings = useMemo(INGREDIENTS, []);
  const sc = sh.scene;
  const fill = 0.5 + 0.95 * smooth(ramp(t, B.rise0, 3.0));
  return (
    <>
      <color attach="background" args={[C.bg]} />
      <Rig cam={cam} light={sh.light} />
      <hemisphereLight args={["#fff4e6", "#4f625d", 0.32]} />
      <directionalLight position={[3, 8, -12]} intensity={2.0} color="#cfe8ff" />
      <directionalLight position={[-5, 5, -10]} intensity={1.0} color="#d8ecff" />
      {/* paper sweep + modeller's table (one long table through every set) */}
      <mesh position={[-10, 10, -14]} receiveShadow>
        <planeGeometry args={[220, 60]} />
        <meshStandardMaterial color={C.sweep} roughness={0.95} />
      </mesh>
      <mesh position={[-10, 0, 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 48]} />
        <meshPhysicalMaterial {...POLISH.clay} color={C.table} bumpMap={fineGrain} bumpScale={1.5} />
      </mesh>
      {sc === "hook" ? <HookSet t={t} grain={grain} fineGrain={fineGrain} /> : null}
      {sc === "kiln" ? <Kiln t={t} grain={grain} /> : null}
      {sc === "kiln" || sc === "factory" ? <Factory t={t} grain={grain} doughTex={doughTex} mouldFill={fill} bubbles={sc === "factory" && t > B.rise0 ? 14 : 0} ingredients={ings} spoonAt={B.alu} /> : null}
      {sc === "macro" ? <Macro t={t} grain={grain} g0={B.basa} g1={st.s7 + 0.2} l0={B.keluar - 0.2} l1={st.s9} /> : null}
      {sc === "cut" ? <CutAutoclave t={t} grain={grain} vCut={[B.potong - 0.15, B.potong + 0.55]} hCut={[B.kawat + 0.1, B.kawat + 0.75]} roll={[B.lalu + 0.1, B.lalu + 1.15]} door={[B.uap + 0.5, B.uap + 0.95]} steam0={B.uap + 0.75} /> : null}
      {sc === "crystal" ? <Crystal t={t} grain={grain} g0={st.s11 + 0.1} g1={st.s12} /> : null}
      {sc === "air" ? <AirGauge t={t} grain={grain} fineGrain={fineGrain} air={0.66 * smooth(ramp(t, B.hasil + 0.4, B.separuh + 0.5 - B.hasil - 0.4))} /> : null}
      {sc === "heat" ? <HeatWater t={t} grain={grain} heat0={B.heat} heat1={st.s14 + 0.6} wet0={B.serap - 0.1} plaster0={B.plester - 0.5} /> : null}
      <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao />
    </>
  );
};

// ---------------------------------------------------------------- 2D layers
type TagDef = { shot: string[]; from: number; to?: number; p: V3; title: string; sub?: string; tone?: "light" | "brick" | "ink"; dx?: number; dy?: number; icon?: "noflame" };
const BEAM_Y = 3.35, HANG = 1.55, ARM_INFO = 2.35; // same as Cover.tsx scale
const lx = -ARM_INFO * Math.cos(TILT), rx = ARM_INFO * Math.cos(TILT);
const TAGS: TagDef[] = [
  { shot: ["S01"], from: B.tagAac, p: [rx, BEAM_Y + ARM_INFO * Math.sin(TILT) - HANG - 0.55, 0.6], title: "bata ringan", sub: "±575 kg/m³", dy: 52 },
  { shot: ["S01"], from: B.tagBrick, p: [lx, BEAM_Y - ARM_INFO * Math.sin(TILT) - HANG - 0.55, 0.6], title: "bata merah", sub: "±1.564 kg/m³", tone: "brick", dy: 52 },
  { shot: ["S03"], from: B.clayTag, p: [KX, 2.6, 0.6], title: "tanah liat padat", tone: "brick", dy: -40 },
  { shot: ["S03"], from: B.fired, p: [KX, 0.3, 1.3], title: "dibakar di tungku", tone: "ink", dy: 90 },
  { shot: ["S04"], from: B.factory, p: [FX + 0.6, 1.6, 0.4], title: "pabrik bata ringan", dy: -70 },
  { shot: ["S06"], from: B.basa, p: [0, MY + 1.9, 0], title: "adonan basa", tone: "ink", dy: -20 },
  { shot: ["S06"], from: B.react, p: [0.4, MY - 0.6, 0], title: "aluminium → gas H₂", sub: "tak berwarna, tanpa api", dy: 230 },
  { shot: ["S07"], from: B.roti, p: [FX + 0.6, 2.0, 0.4], title: "mengembang seperti roti", dy: -110 },
  { shot: ["S08"], from: B.keluar, to: B.rongga - 0.1, p: [0, MY + 2.2, 0], title: "gas H₂ keluar", tone: "ink", dy: -20 },
  { shot: ["S08"], from: B.rongga, p: [0, MY - 0.4, 0], title: "rongga terisi udara", dy: 250 },
  { shot: ["S09"], from: B.kawat, p: [CX, 1.6, 0.0], title: "kawat baja tegang", tone: "ink", dy: -150 },
  { shot: ["S10"], from: B.uap, p: [CX, 4.6, -4.7], title: "uap ±190 °C · 8–12 bar", dy: -80 },
  { shot: ["S10"], from: B.bukan, p: [CX, 0.6, -4.7], title: "dimasak, bukan dibakar", tone: "brick", icon: "noflame", dy: 120 },
  { shot: ["S11"], from: B.kristal, p: [XX, MY + 1.6, -0.5], title: "pasir + kapur → kristal", tone: "ink", dy: -30 },
  { shot: ["S11"], from: B.kuat, p: [XX, MY - 1.4, -0.5], title: "memberi kekuatan", dy: 60 },
  { shot: ["S12"], from: B.separuh, p: [AX + 2.05, 2.8, 2.2], title: "udara > ½ isi", sub: "riset: 60–85% volume", dy: -70 },
  { shot: ["S13"], from: B.heat + 0.2, p: [HX - WALL.gap, 2.6, 0], title: "bata merah", tone: "brick", dy: -40 },
  { shot: ["S13"], from: B.heat + 0.4, p: [HX + WALL.gap, 2.6, 0], title: "bata ringan", dy: -40 },
  { shot: ["S13"], from: B.hambat, p: [HX, 0.2, 2.6], title: "±2,4× lebih menahan panas", sub: "dinding 10 cm, uji Kementerian PU", tone: "ink", dy: 70 },
  { shot: ["S14"], from: B.serap, to: B.plester - 0.45, p: [HX + WALL.gap, 2.55, 0.3], title: "menyerap air", tone: "ink", dy: -40 },
  { shot: ["S14"], from: B.plester - 0.4, p: [HX + WALL.gap, 2.55, 0.3], title: "dinding luar diplester", dy: -40 },
];
const shotIdx = (id: string) => SHOTS.findIndex((s) => s.id === id);

const NoFlame: React.FC = () => (
  <svg width={44} height={44} viewBox="0 0 44 44" style={{ marginRight: 12 }}>
    <path d="M22 6c4 7 10 11 10 19a10 10 0 0 1-20 0c0-5 3-8 5-11 1 3 2 4 4 5 0-5-1-9 1-13z" fill="#FFB05A" stroke="#FFF1E2" strokeWidth={2} />
    <line x1={6} y1={38} x2={38} y2={6} stroke="#FFF1E2" strokeWidth={5} strokeLinecap="round" />
  </svg>
);

const Tag: React.FC<{ x: number; y: number; d: TagDef; a: number }> = ({ x, y, d, a }) => {
  const tone = d.tone ?? "light";
  const bg = tone === "brick" ? "#B9482A" : tone === "ink" ? "#2E4A48" : "rgba(246,239,227,0.96)";
  const fg = tone === "light" ? "#2E4A48" : "#FFF1E2";
  const sh = tone === "brick" ? "#7A2C17" : tone === "ink" ? "#16302E" : "rgba(48,80,77,0.55)";
  const cx = Math.max(200, Math.min(880, x + (d.dx ?? 0)));
  const cy = Math.max(350, Math.min(1440, y + (d.dy ?? 0)));
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * backOut(a)})`, opacity: clamp01(a * 2.5), textAlign: "center", fontFamily: MANROPE, background: bg, color: fg, padding: "10px 26px 12px", borderRadius: 28, boxShadow: `0 6px 0 ${sh}, 0 14px 26px rgba(20,40,38,0.25)`, whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
      {d.icon === "noflame" ? <NoFlame /> : null}
      <div>
        <div style={{ fontWeight: 700, fontSize: 40, lineHeight: 1.1 }}>{d.title}</div>
        {d.sub ? <div style={{ fontWeight: 500, fontSize: 27, lineHeight: 1.2, opacity: 0.88 }}>{d.sub}</div> : null}
      </div>
    </div>
  );
};

const Tags: React.FC<{ t: number; sh: Shot; cam: Cam }> = ({ t, sh, cam }) => (
  <>
    {TAGS.filter((d) => d.shot.includes(sh.id) && t >= d.from && t < (d.to ?? sh.end)).map((d, i) => {
      const end = d.to ?? sh.end;
      const a = ramp(t, d.from, 0.35) * (1 - ramp(t, end - 0.15, 0.15));
      const q = project(cam, d.p);
      return <Tag key={`${sh.id}${i}${d.title}`} x={q.x} y={q.y} d={d} a={a} />;
    })}
  </>
);

/** S02: leader lines from "udara" to the two fracture faces (same language as the cover) */
const PoreLeader: React.FC<{ t: number; sh: Shot; cam: Cam }> = ({ t, sh, cam }) => {
  if (sh.id !== "S02" || t < B.air1 - 0.2) return null;
  const a = ramp(t, B.air1 - 0.2, 0.4);
  const pts = fracturePoints().map((p) => project(cam, p));
  const anchor = { x: (pts[0].x + pts[1].x) / 2, y: Math.max(330, Math.min(pts[0].y, pts[1].y) - 330) };
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
        {pts.map((p, i) => (
          <g key={i}>
            <line x1={anchor.x + (i ? 50 : -50)} y1={anchor.y + 40} x2={p.x} y2={p.y} stroke="#FFF3DF" strokeWidth={10} strokeLinecap="round" />
            <line x1={anchor.x + (i ? 50 : -50)} y1={anchor.y + 40} x2={p.x} y2={p.y} stroke="#2E4A48" strokeWidth={4} strokeLinecap="round" />
            <circle cx={p.x} cy={p.y} r={12} fill="#FFF3DF" stroke="#2E4A48" strokeWidth={4} />
          </g>
        ))}
      </svg>
      <Tag x={anchor.x} y={anchor.y} d={{ shot: [], from: 0, p: [0, 0, 0], title: "kebanyakan udara", sub: "pori kecil, hampir seragam" }} a={a} />
    </>
  );
};

/** S01 "≈ 1/3" stamp over the light pan */
const Third: React.FC<{ t: number; sh: Shot; cam: Cam }> = ({ t, sh, cam }) => {
  if (sh.id !== "S01" || t < B.third) return null;
  const a = backOut(ramp(t, B.third, 0.4));
  const q = project(cam, [rx, BEAM_Y + 0.9, 0]);
  return (
    <div style={{ position: "absolute", left: Math.min(860, q.x), top: Math.max(320, q.y - 120), transform: `translate(-50%,-50%) scale(${a}) rotate(-6deg)`, fontFamily: `'${ANTON}'`, fontSize: 120, lineHeight: 1, color: C.yellow, textShadow: "0 7px 0 #A8431F, 0 14px 24px rgba(70,30,10,0.35)", whiteSpace: "nowrap" }}>
      ≈ ⅓ <span style={{ fontSize: 64 }}>BERAT</span>
    </div>
  );
};

/** S05 recipe card: ingredients tick in as they fall into the mixer */
const Recipe: React.FC<{ t: number; sh: Shot }> = ({ t, sh }) => {
  if (sh.id !== "S05") return null;
  const rows: [string, number, string][] = [
    ["pasir halus", B.pasir, "#D9BE8C"],
    ["semen", B.semen, "#8E9090"],
    ["kapur", B.kapur, "#F3EFE6"],
    ["air", B.air, "#7FC4E8"],
    ["bubuk aluminium  <1%", B.alu, "#D7DEE6"],
  ];
  const out = 1 - ramp(t, sh.end - 0.45, 0.3);
  return (
    <div style={{ position: "absolute", left: 64, top: 330, opacity: out, fontFamily: MANROPE, background: "rgba(246,239,227,0.95)", borderRadius: 30, padding: "22px 30px 18px", boxShadow: "0 6px 0 rgba(48,80,77,0.55), 0 14px 26px rgba(20,40,38,0.22)", color: "#2E4A48" }}>
      {rows.map(([name, at0, col], i) => {
        const a = ramp(t, at0 - 0.05, 0.3);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: i === 4 ? 800 : 600, lineHeight: 1.5, opacity: 0.25 + 0.75 * a, transform: `translateX(${(1 - backOut(a)) * -20}px)` }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: col, border: "3px solid #2E4A48", transform: `scale(${0.6 + 0.4 * backOut(a)})` }} />
            {name}
          </div>
        );
      })}
    </div>
  );
};

const Kicker: React.FC<{ t: number; sh: Shot }> = ({ t, sh }) => {
  if (!sh.kicker || t >= OUTRO_AT) return null;
  const a = ramp(t, sh.start + 0.05, 0.3) * (1 - ramp(t, sh.end - 0.12, 0.12));
  const n = SHOTS.indexOf(sh) + 1;
  return (
    <div style={{ position: "absolute", left: 64, top: 268, opacity: a, transform: `translateX(${(1 - smooth(a)) * -24}px)`, display: "flex", alignItems: "center", gap: 14, fontFamily: MANROPE, fontWeight: 700, fontSize: 28, letterSpacing: "0.16em", color: "#FFF3DF" }}>
      <span style={{ background: "#2E4A48", borderRadius: 999, padding: "6px 16px", boxShadow: "0 4px 0 #16302E" }}>{String(n).padStart(2, "0")}</span>
      <span style={{ background: "rgba(246,239,227,0.95)", color: "#2E4A48", borderRadius: 999, padding: "6px 18px", boxShadow: "0 4px 0 rgba(48,80,77,0.55)" }}>{sh.kicker}</span>
    </div>
  );
};

const OutroTitle: React.FC<{ t: number }> = ({ t }) => {
  if (t < B.batu - 0.25 || t >= st.s16 + 0.6) return null;
  const a = backOut(ramp(t, B.batu - 0.25, 0.45)) * (1 - ramp(t, st.s16 + 0.2, 0.4));
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", transform: `scale(${0.8 + 0.2 * a})`, opacity: clamp01(a * 2) }}>
      <div style={{ fontFamily: `'${ANTON}'`, fontSize: 104, lineHeight: 1.0, color: C.title, textShadow: "0 6px 0 #2F5F5B, 0 12px 22px rgba(10,40,38,0.35)" }}>BATU</div>
      <div style={{ fontFamily: `'${ANTON}'`, fontSize: 140, lineHeight: 1.0, color: C.yellow, textShadow: "0 7px 0 #A8431F, 0 14px 24px rgba(70,30,10,0.35)" }}>BERISI UDARA</div>
    </div>
  );
};

// karaoke captions: phrases of 3–6 words; ≤4 words one line, else two balanced lines
type Phrase = { lines: Word[][]; from: number; to: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    const ws = c.words;
    const n = Math.ceil(ws.length / 6);
    for (let j = 0; j < n; j++) {
      const a = Math.round((j * ws.length) / n), b = Math.round(((j + 1) * ws.length) / n);
      const chunk = ws.slice(a, b);
      const lines = chunk.length <= 4 ? [chunk] : [chunk.slice(0, Math.ceil(chunk.length / 2)), chunk.slice(Math.ceil(chunk.length / 2))];
      out.push({ lines, from: chunk[0].s - 0.08, to: 0 });
    }
  }
  out.forEach((p, i) => {
    const last = p.lines[p.lines.length - 1];
    const e = last[last.length - 1].e;
    p.to = i + 1 < out.length ? Math.min(out[i + 1].from, e + 0.8) : e + 0.5;
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ph = PHRASES.find((p) => t >= p.from && t < p.to);
  if (!ph) return null;
  const pop = backOut(ramp(t, ph.from, 0.22));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 410, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${0.9 + 0.1 * pop})`, background: "rgba(246,239,227,0.96)", borderRadius: 34, padding: "16px 34px 18px", boxShadow: "0 7px 0 rgba(48,80,77,0.6), 0 16px 30px rgba(20,40,38,0.25)", fontFamily: MANROPE, fontWeight: 800, fontSize: 56, lineHeight: 1.18, color: "#2E4A48", textAlign: "center" }}>
        {ph.lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap" }}>
            {ln.map((w, i) => {
              const active = t >= w.s && t < w.e + 0.06;
              const said = t >= w.s;
              const b = active ? Math.sin(clamp01((t - w.s) / 0.2) * Math.PI) : 0;
              return (
                <span key={i} style={{ display: "inline-block", marginRight: i < ln.length - 1 ? 16 : 0, color: active ? "#C2502E" : said ? "#2E4A48" : "rgba(46,74,72,0.45)", transform: `translateY(${-b * 7}px) scale(${1 + b * 0.09})` }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const CutFlash: React.FC<{ t: number }> = ({ t }) => {
  let o = 0, col = "#fff";
  for (const s of SHOTS) {
    if (!s.flash) continue;
    const d = Math.abs(t - s.start);
    if (d < s.flash.d) {
      const v = s.flash.a * (1 - d / s.flash.d);
      if (v > o) {
        o = v;
        col = s.flash.color;
      }
    }
  }
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: col, opacity: o, pointerEvents: "none" }} />;
};

export const Film: React.FC = () => {
  useAnton();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const sh = shotAt(t);
  const cam = useMemo(() => camFor(sh, t), [sh, t]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 34, near: 0.1, far: 260, position: cam.pos }}>
        <World t={t} frame={frame} sh={sh} cam={cam} />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "0 0", width: 1080, height: 1920 }}>
        <Tags t={t} sh={sh} cam={cam} />
        <PoreLeader t={t} sh={sh} cam={cam} />
        <Third t={t} sh={sh} cam={cam} />
        <Recipe t={t} sh={sh} />
        <OutroTitle t={t} />
        <Kicker t={t} sh={sh} />
        <Captions t={t} />
      </AbsoluteFill>
      <CutFlash t={t} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};

export const SHOT_LIST = SHOTS.map((s) => ({ id: s.id, start: s.start, end: s.end, scene: s.scene, kicker: s.kicker }));
void rnd;
void shotIdx;
