// EP06 film 3D: one tavern-night world, eight sets (one mounted at a time), camera keyed to VO words.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { VINTAGE_PALETTE } from "../../kits/vintageforge/lib/palette";
import { BG, BALL_R, Backdrop, Ball, BookOnCradle, CAM_POS, CAM_TARGET, Candle, Inkwell, Tankard, type V3 } from "./Cover.tsx";
import { canvasTex, glowTexture, oakTexture, tavernPlaque, wallTexture } from "./coverTextures.ts";
import {
  M, PITCH_D, PITCH_W, boardTex, cambridgeTex, cobbleTex, facadeGlow, facadeTex, grassTex, groundParchTex, houseGlow, houseTex, inkText, mapTex,
  pitchModernTex, schoolBookTex, scrollTex, sheetTex, signTex, spineTex,
} from "./filmTextures.ts";
import {
  BrassRule, Gent, GoalMorph, HackingRig, InkArrow, InkReveal, LeatherBall, OpenBook, Quill, SmallCandle, StandingBook, brassMat, carryPose, catchPose,
  darkWoodMat, dribblePose, handLocal, holdUpPose, kickPose, lerp, lerp3, sitCheer, toWorld,
} from "./props.tsx";
import { CUT, T, clamp01, seg, setAt, type SetName } from "./timing.ts";
import { poseAt, type Pose } from "../../core/polish/Person.tsx";

// ---------- camera ----------
type Key = [number, V3, V3];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const cr3 = (a: V3, b: V3, c: V3, d: V3, u: number): V3 => [cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u), cr(a[2], b[2], c[2], d[2], u)];
const path = (keys: Key[], t: number): { pos: V3; tgt: V3 } => {
  if (t <= keys[0][0]) return { pos: keys[0][1], tgt: keys[0][2] };
  const n = keys.length;
  if (t >= keys[n - 1][0]) return { pos: keys[n - 1][1], tgt: keys[n - 1][2] };
  let i = 0;
  while (i < n - 2 && t >= keys[i + 1][0]) i++;
  const u = (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]);
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(n - 1, i + 2)];
  return { pos: cr3(k0[1], k1[1], k2[1], k3[1], u), tgt: cr3(k0[2], k1[2], k2[2], k3[2], u) };
};

const LEGS: V3 = [-1.4, 0, 0.75];
const KEYS: Record<SetName, Key[]> = {
  table: [
    // Even-speed descent CAM_POS -> legs (arrive ~3.6s); equal per-segment travel kills the park-then-dash velocity spike.
    [0, CAM_POS, CAM_TARGET],
    [1.2, [-0.37, 1.66, 3.21], [-0.45, 0.25, -0.03]],
    [2.4, [-0.75, 1.18, 2.79], [-0.9, 0.38, 0.36]],
    [3.6, [-1.08, 0.78, 2.45], [-1.34, 0.52, 0.73]],
    [5.95, [-1.12, 0.7, 2.38], [-1.36, 0.52, 0.75]],
  ],
  schools: [
    [CUT.schools, [-0.45, 0.45, 0.6], [-0.38, 0.28, -0.5]],
    [8.2, [0.4, 0.45, 0.6], [0.3, 0.28, -0.5]],
    [9.7, [0.05, 0.92, 1.35], [0.0, 0.1, 0.4]],
    [11.3, [-0.05, 0.88, 1.3], [0.0, 0.1, 0.4]],
    [12.0, [0.05, 0.85, 0.75], [0.0, 0.03, -0.1]],
    [13.6, [-0.03, 0.8, 0.7], [0.0, 0.03, -0.1]],
    [14.6, [0.0, 1.25, 1.3], [0.0, 0.03, 0.17]],
    [CUT.quill, [0.08, 1.15, 1.15], [0.0, 0.03, 0.17]],
  ],
  quill: [
    [CUT.quill, [-0.12, 0.88, 0.78], [0.0, 0.0, 0.04]],
    [CUT.tavern, [0.1, 0.8, 0.72], [0.0, 0.0, 0.04]],
  ],
  tavern: [
    [CUT.tavern, [0.15, 1.5, 3.4], [0, 0.6, -0.4]],
    [22.8, [0.05, 1.0, 2.2], [0, 0.65, -0.4]],
    [24.3, [0, 0.85, 0.9], [0, 0.78, -0.4]],
    [CUT.room, [0, 0.79, -0.3], [0, 0.78, -0.6]],
  ],
  room: [
    [CUT.room, [0.0, 0.95, 1.55], [0.2, 0.55, -0.5]],
    [26.2, [0.45, 0.66, 0.6], [1.12, 0.45, -0.35]],
    [28.15, [0.58, 0.62, 0.45], [1.15, 0.45, -0.38]],
    [29.0, [0.05, 0.8, 0.75], [0.0, 0.95, -1.1]],
    [30.3, [-0.05, 0.82, 0.68], [0.0, 0.96, -1.1]],
    [31.2, [-0.35, 0.9, 0.85], [-1.12, 0.74, -0.78]],
    [35.2, [-0.45, 0.85, 0.75], [-1.1, 0.72, -0.78]],
    [36.6, [-0.3, 0.92, 0.85], [-0.75, 0.55, -0.6]],
    [37.4, [0.35, 0.7, 0.62], [1.15, 0.5, -0.35]],
    [40.4, [0.48, 0.66, 0.48], [1.17, 0.5, -0.36]],
    [41.0, [-0.62, 0.8, 0.8], [-1.08, 0.6, -0.74]],
    [42.5, [-0.68, 0.78, 0.72], [-1.08, 0.6, -0.74]],
    [43.2, [0.25, 0.72, 0.6], [1.15, 0.45, -1.0]],
    [CUT.fork, [0.88, 0.55, -0.4], [1.25, 0.42, -1.1]],
  ],
  fork: [
    [CUT.fork, [0.0, 0.45, 1.35], [0.0, 0.25, 0.05]],
    [46.0, [0.1, 0.72, 1.5], [0.03, 0.18, 0.0]],
    [CUT.laws, [0.25, 0.98, 1.08], [0.1, 0.05, -0.08]],
  ],
  pitch: [
    [CUT.laws, [-2.1, 1.75, 4.55], [-2.1, 0.0, 3.35]],
    [50.6, [-2.1, 1.55, 4.35], [-2.1, 0.0, 3.4]],
    [51.45, [-1.62, 0.36, 0.3], [-3.45, 0.62, 0.0]],
    [53.9, [-1.55, 0.34, 0.18], [-3.5, 0.72, 0.0]],
    [54.65, [-2.25, 1.35, 1.25], [-2.3, 0.0, 0.05]],
    [56.1, [-2.3, 1.3, 1.15], [-2.35, 0.0, 0.0]],
    [56.65, [-2.4, 0.34, 0.3], [-2.95, 0.2, -0.55]],
    [57.9, [-2.36, 0.33, 0.24], [-2.95, 0.22, -0.55]],
    [58.45, [-2.2, 0.3, 0.12], [-3.45, 0.16, 0.05]],
    [59.6, [-2.25, 0.3, 0.1], [-3.45, 0.16, 0.05]],
    [61.0, [-2.05, 0.8, 1.15], [-3.3, 0.08, 0.0]],
    [62.4, [-2.32, 0.16, 0.05], [-3.5, 0.07, 0.0]],
    [64.9, [-2.42, 0.15, 0.0], [-3.5, 0.07, 0.0]],
    [66.1, [0.25, 1.35, 1.0], [0.3, 0.0, 0.0]],
    [69.2, [0.32, 1.25, 0.9], [0.3, 0.0, 0.0]],
    [71.3, [3.0, 3.0, 2.0], [0.2, 0, 0]],
    [CUT.outro, [4.6, 4.2, 0.6], [0.0, 0.0, 0.0]],
  ],
  outro: [
    [CUT.outro, [-0.3, 0.7, 0.85], [-0.4, 0.2, 0.05]],
    [76.5, [-0.25, 0.95, 1.4], [-0.3, 0.2, -0.1]],
    [83.4, [0.0, 1.9, 3.3], [0.0, 0.12, -0.42]],
  ],
};

const CameraRig: React.FC<{ t: number; set: SetName }> = ({ t, set }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, tgt } = path(KEYS[set], t);
    let sx = 0, sy = 0;
    for (const h of [T.hit1, T.hit2]) {
      const dt = t - h;
      if (set === "table" && dt >= 0 && dt < 0.5) {
        const a = 0.008 * Math.exp(-dt * 11);
        sx += a * Math.sin(dt * 40);
        sy += a * Math.cos(dt * 32);
      }
    }
    camera.position.set(pos[0] + sx, pos[1] + sy, pos[2]);
    camera.lookAt(tgt[0] + sx * 0.5, tgt[1] + sy * 0.5, tgt[2]);
    camera.updateProjectionMatrix();
  }, [camera, t, set]);
  return null;
};

const FOG: Record<SetName, [string, number, number]> = {
  table: ["#140A05", 3.6, 8],
  schools: ["#140A05", 3.0, 7],
  quill: ["#140A05", 3.0, 7],
  tavern: ["#1A1210", 3.5, 9],
  room: ["#150B06", 3.0, 7.5],
  fork: ["#140A05", 3.0, 7],
  pitch: ["#B89A6C", 6, 22],
  outro: ["#140A05", 3.6, 8],
};
const Fog: React.FC<{ set: SetName }> = ({ set }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    const [c, n, f] = FOG[set];
    scene.fog = new THREE.Fog(c, n, f);
    return () => {
      scene.fog = null;
    };
  }, [scene, set]);
  return null;
};

// ---------- the cover's tavern table (lights, table, wall, candle) ----------
const useTableMats = () => {
  const oakTex = useMemo(() => {
    const t = oakTexture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.2, 1.3);
    return t;
  }, []);
  const oakGrain = useSurfaceGrain(1872, 0.3, 6);
  return useMemo(
    () => ({
      table: new THREE.MeshPhysicalMaterial({ map: oakTex, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4, bumpMap: oakGrain, bumpScale: 0.4 }),
      cradle: new THREE.MeshPhysicalMaterial({ map: oakTex, color: "#C89A6A", roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.35 }),
      pewter: new THREE.MeshPhysicalMaterial({ color: "#A8A49A", metalness: 0.85, roughness: 0.32, envMapIntensity: 1.4 }),
      brass: new THREE.MeshPhysicalMaterial({ color: VINTAGE_PALETTE.agedGold, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.5 }),
    }),
    [oakTex, oakGrain],
  );
};

const TableEnv: React.FC<{ props: boolean }> = ({ props }) => {
  const m = useTableMats();
  return (
    <>
      <ambientLight intensity={0.06} color="#FFE2C0" />
      <hemisphereLight args={["#FFE6C4", "#20100A", 0.22]} />
      <spotLight position={[-1.6, 2.6, 1.6]} angle={0.55} penumbra={0.9} intensity={26} decay={1.5} distance={8} color="#FFDDB0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-radius={6} />
      <spotLight position={[0.2, 2.2, 1.4]} angle={0.42} penumbra={1} intensity={8} decay={1.5} distance={6} color="#FFF0D8" />
      <pointLight position={[-1.3, 1.5, -1.2]} intensity={2.6} distance={2.6} decay={1.4} color="#FFB870" />
      <pointLight position={[1.4, 1.6, -1.25]} intensity={2.0} distance={2.6} decay={1.4} color="#FFC888" />
      <directionalLight position={[2.5, 1.8, -1.2]} intensity={0.55} color="#9FB4D8" />
      <mesh material={m.table} position={[0, -0.04, 0.05]} castShadow receiveShadow>
        <RoundedBoxGeo args={[3.6, 0.08, 3.5]} radius={0.02} />
      </mesh>
      <Candle pos={[0.74, 0, -0.95]} brass={m.brass} />
      <Backdrop pewter={m.pewter} brass={m.brass} />
      {props && (
        <>
          <BookOnCradle oak={m.cradle} brassPlate={m.brass} />
          <Ball pos={[-0.5, BALL_R * 0.98, 0.86]} />
          <Tankard pos={[0.47, 0, 0.7]} pewter={m.pewter} />
          <Inkwell pos={[0.08, 0, 1.0]} brass={m.brass} />
          <GroundShadow scale={3.4} opacity={0.7} blur={2.4} far={0.8} />
        </>
      )}
    </>
  );
};

// ---------- set: hook (cover table + carved hacking legs) ----------
const HookSet: React.FC<{ t: number }> = ({ t }) => (
  <>
    <TableEnv props />
    <HackingRig t={t} position={LEGS} hits={[T.hit1, T.hit2]} />
    {/* warm practical so the legs read against the wall */}
    <pointLight position={[LEGS[0] + 0.5, 1.1, LEGS[2] + 0.6]} intensity={1.6} distance={2.2} decay={1.5} color="#FFD09A" />
  </>
);

// ---------- set: schools (rulebooks of the public schools) ----------
const SPINES: [string, string, number, number][] = [
  ["RUGBY", "#5A1A14", 0.2, 0.52],
  ["ETON", "#1F3A2A", 0.18, 0.56],
  ["HARROW", "#1E2A44", 0.19, 0.5],
  ["WINCHESTER", "#4A2E1A", 0.2, 0.54],
  ["CHARTERHOUSE", "#2A2420", 0.21, 0.5],
];
const SchoolsSet: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const meet = seg(t, T.begitu, T.bertemu + 0.1);
  const bump = t > T.bertemu + 0.1 ? Math.exp(-(t - T.bertemu - 0.1) * 6) * Math.sin((t - T.bertemu - 0.1) * 30) * 0.01 : 0;
  const rz = lerp(0.42, 0.35, meet) + bump;
  const ez = lerp(-0.08, -0.01, meet) - bump;
  // Rugby runner: carries the ball across the page
  const run = seg(t, T.rugby + 0.2, T.eton - 0.2);
  const rx = lerp(-0.17, 0.12, run);
  const running = t > T.rugby + 0.2 && t < T.eton - 0.2;
  const turn = seg(t, T.begitu, T.bertemu);
  const rHead = lerp(Math.PI / 2, Math.PI, turn);
  const rPose: Pose = running ? carryPose(f, 3) : { ...poseAt("stand", f, 3), ls: [-0.75, 0.25, 0.32], le: -1.75, rs: [-0.75, -0.25, -0.32], re: -1.75 };
  const rPos: V3 = [rx, 0.037, rz + 0.03];
  const RS = 0.26;
  const hl = handLocal(rPose, 1), hr = handLocal(rPose, -1);
  const ballL: V3 = [(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 + 0.02, (hl[2] + hr[2]) / 2 + 0.05];
  const rBall = toWorld(ballL, rPos, rHead, RS);
  // Eton dribbler: hands back, ball at the feet
  const dr = seg(t, T.eton + 0.1, T.begitu - 0.1);
  const ex = lerp(0.15, -0.12, dr);
  const dribbling = t > T.eton + 0.1 && t < T.begitu - 0.1;
  const eHead = lerp(-Math.PI / 2, 0, turn);
  const ePose: Pose = dribbling ? dribblePose(f, 5) : { ...poseAt("stand", f, 5), ls: [0.45, 0, 0.18], le: -0.15, rs: [0.45, 0, -0.18], re: -0.15 };
  const ePos: V3 = [ex, 0.037, ez + 0.02];
  const eBall: V3 = [ex - 0.075 * Math.cos(turn * Math.PI / 2), 0.037 + 0.028, ez + 0.02 + 0.075 * Math.sin(turn * Math.PI / 2)];
  return (
    <>
      <TableEnv props={false} />
      {SPINES.map(([name, col, w, h], i) => (
        <StandingBook key={name} position={[-0.44 + i * 0.22, 0, -0.5]} size={[w, h, 0.34]} spine={spineTex(name, col, i + 3)} leather={col} tilt={i === 4 ? -0.04 : 0} />
      ))}
      <OpenBook position={[0, 0, rz]} w={0.5} d={0.36} tex={schoolBookTex("rugby")} leather="#5A1A14" />
      <OpenBook position={[0, 0, ez]} w={0.5} d={0.36} tex={schoolBookTex("eton")} leather="#1F3A2A" />
      <Gent f={f} seed={3} poseOverride={rPose} position={rPos} heading={rHead} scale={RS * seg(t, T.rugby - 0.6, T.rugby - 0.2)} hat={false} coat="#7A2A22" />
      <LeatherBall position={rBall} r={0.03 * seg(t, T.rugby - 0.6, T.rugby - 0.2)} oval spin={t * 2} />
      <Gent f={f} seed={5} poseOverride={ePose} position={ePos} heading={eHead} scale={RS * seg(t, T.eton - 0.7, T.eton - 0.3)} hat={false} coat="#22324F" />
      <LeatherBall position={eBall} r={0.026 * seg(t, T.eton - 0.7, T.eton - 0.3)} spin={-ex * 40} />
      <GroundShadow scale={2.4} opacity={0.6} blur={2} far={0.6} />
      <pointLight position={[0.2, 0.9, 0.9]} intensity={1.2} distance={2.5} decay={1.5} color="#FFE2B8" />
    </>
  );
};

// ---------- set: the date in ink ----------
const QuillSet: React.FC<{ t: number }> = ({ t }) => {
  const m = useTableMats();
  const p1 = seg(t, T.dua26 - 0.05, T.y1863b - 0.02);
  const p2 = seg(t, T.y1863b - 0.02, T.y1863b + 0.7);
  const p3 = seg(t, T.y1863b + 0.75, T.wakil - 0.25);
  return (
    <>
      <TableEnv props={false} />
      <group rotation={[0, -0.05, 0]} position={[0, 0, 0.05]}>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.64, 0.52]} />
          <meshPhysicalMaterial map={sheetTex("date", 1024, 832, 2610)} roughness={0.92} />
        </mesh>
        <InkReveal tex={inkText("okt", "26 Oktober", 1024, 200, 150, { italic: true })} w={0.52} h={0.1} p={p1} position={[0.02, 0.004, -0.13]} quill={t < T.y1863b} t={t} />
        <InkReveal tex={inkText("y1863", "1863", 512, 200, 180, { spacingPx: 6 })} w={0.3} h={0.117} p={p2} position={[0.0, 0.004, 0.0]} quill={p2 > 0 && p2 < 1} t={t} />
        <InkReveal tex={inkText("fmt", "Freemasons' Tavern", 1024, 150, 92, { italic: true })} w={0.5} h={0.073} p={p3} position={[0.02, 0.004, 0.13]} quill={p3 > 0} t={t} />
      </group>
      <Inkwell pos={[0.42, 0, -0.3]} brass={m.brass} />
      {t < T.dua26 - 0.05 && (
        <group position={[-0.24, 0.004, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <Quill nib={[0, 0, 0]} />
        </group>
      )}
      <GroundShadow scale={2} opacity={0.5} blur={2} far={0.5} />
    </>
  );
};

// ---------- set: Freemasons' Tavern at night ----------
const skyTex = () =>
  canvasTex("ep06-sky", 256, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0C0B16");
    g.addColorStop(0.55, "#2A1E24");
    g.addColorStop(1, "#5A3A22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
const HOUSES: [number, number, number, number, number][] = [
  [-1.38, -0.62, 1.15, 1.75, 11],
  [1.36, -0.62, 1.1, 1.6, 23],
  [-2.5, -0.95, 1.1, 1.95, 37],
  [2.48, -0.95, 1.05, 1.7, 41],
];
const DOOR: V3 = [0, 0, -0.33];
const TavernSet: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const cob = useMemo(() => {
    const c = cobbleTex();
    c.wrapS = c.wrapT = THREE.RepeatWrapping;
    c.repeat.set(5, 5);
    return c;
  }, []);
  const gents = useMemo(() => {
    const out: { s: V3; t0: number; seed: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (0.25 + ((i * 37) % 10) / 10 * 1.0);
      const z = 0.35 + ((i * 53) % 10) / 10 * 1.3;
      out.push({ s: [x, 0, z], t0: T.wakil + 0.1 + (i % 6) * 0.22, seed: 20 + i });
    }
    return out;
  }, []);
  return (
    <>
      <ambientLight intensity={0.08} color="#C8B8D8" />
      <hemisphereLight args={["#5A5A80", "#2A1A10", 0.35]} />
      <directionalLight position={[-3, 4, 2]} intensity={0.5} color="#A8B8E0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <spotLight position={[0.0, 1.6, 2.2]} angle={0.6} penumbra={1} intensity={6} decay={1.5} distance={6} color="#FFD7A0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshPhysicalMaterial map={cob} roughness={0.32} metalness={0.15} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[0, 2.6, -4.2]}>
        <planeGeometry args={[16, 7]} />
        <meshBasicMaterial map={skyTex()} fog={false} toneMapped={false} />
      </mesh>
      {/* the tavern */}
      <mesh position={[0, 0.725, -0.65]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.45, 0.5]} />
        <meshStandardMaterial color="#8A7458" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.725, -0.399]}>
        <planeGeometry args={[1.6, 1.45]} />
        <meshStandardMaterial map={facadeTex()} emissiveMap={facadeGlow()} emissive="#FFFFFF" emissiveIntensity={1.4} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.47, -0.62]}>
        <boxGeometry args={[1.7, 0.06, 0.6]} />
        <meshStandardMaterial color="#6A5A44" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.555, -0.37]}>
        <planeGeometry args={[0.72, 0.14]} />
        <meshStandardMaterial map={tavernPlaque()} metalness={0.6} roughness={0.35} emissive="#3A2A10" emissiveIntensity={0.3} />
      </mesh>
      <pointLight position={[0, 0.3, -0.15]} intensity={1.6} distance={1.6} decay={1.5} color="#FFB060" />
      {HOUSES.map(([x, z, w, h, seed]) => (
        <group key={seed}>
          <mesh position={[x, h / 2, z - 0.25]} castShadow receiveShadow>
            <boxGeometry args={[w, h, 0.5]} />
            <meshStandardMaterial color="#4A3020" roughness={0.9} />
          </mesh>
          <mesh position={[x, h / 2, z + 0.001]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial map={houseTex(seed)} emissiveMap={houseGlow(seed)} emissive="#FFFFFF" emissiveIntensity={1.1} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* gas lamps */}
      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[x, 0, 0.05]}>
          <mesh material={darkWoodMat()} position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.02, 0.84, 12]} />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <boxGeometry args={[0.07, 0.09, 0.07]} />
            <meshStandardMaterial color="#FFD9A0" emissive="#FFB060" emissiveIntensity={2.5} />
          </mesh>
          <sprite position={[0, 0.88, 0]} scale={[0.6, 0.6, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
            <spriteMaterial map={glowTexture()} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </sprite>
          <pointLight position={[0, 0.88, 0.05]} intensity={1.6} distance={2.4} decay={1.5} color="#FFB868" />
        </group>
      ))}
      {gents.map((g, i) => {
        const dur = 3.0 + (i % 4) * 0.3;
        const k = clamp01((t - g.t0) / dur);
        const pos = lerp3(g.s, DOOR, k);
        const inside = seg(k, 0.88, 1);
        if (inside >= 1) return null;
        const head = Math.atan2(DOOR[0] - g.s[0], DOOR[2] - g.s[2]);
        return <Gent key={i} f={f + i * 17} seed={g.seed} pose={k > 0 && k < 1 ? "walk" : "stand"} position={pos} heading={head} scale={0.32 * (1 - inside)} />;
      })}
    </>
  );
};

// ---------- set: the meeting room ----------
const BOARD: V3 = [-1.18, 0.78, -0.78];
const BOARD_ROT = 0.5;
const SEATS: [number, number, number, number][] = [
  // x, z, heading, seed
  [-0.75, -0.8, 0, 31],
  [-0.25, -0.8, 0, 32],
  [0.25, -0.8, 0, 33],
  [0.75, -0.8, 0, 34], // Blackheath
  [-0.55, 0.02, Math.PI, 35],
  [0.35, 0.02, Math.PI, 36],
  [-1.15, -0.4, Math.PI / 2, 37],
];
const MORLEY: V3 = [1.2, 0, -0.35];
const Pointer: React.FC<{ v: number; y: number; glow: number }> = ({ v, y, glow }) => (
  <group position={[v * 0.175, y, 0.012]}>
    <mesh material={brassMat()} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.028, 0.028, 0.012, 24]} />
    </mesh>
    {glow > 0 && (
      <sprite scale={[0.16, 0.16, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={glowTexture()} color="#8FE0A8" transparent opacity={glow * 0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    )}
  </group>
);
const RoomSet: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const m = useTableMats();
  const wall = useMemo(() => wallTexture(), []);
  // debate pointers (-1 = BOLEH, +1 = DILARANG)
  const lead = seg(t, T.kubu, T.kubu + 0.6);
  const back = seg(t, T.cambridge, T.melarang + 0.4);
  const wob1 = t > T.bolehkah1 && t < T.kubu ? Math.sin((t - T.bolehkah1) * 6) * 0.35 : 0;
  const wob2 = t > T.bolehkah2 && t < T.kubu ? Math.sin((t - T.bolehkah2) * 5 + 1) * 0.35 : 0;
  const v1 = lerp(lerp(wob1, -1, lead), 1, back);
  const v2 = lerp(lerp(wob2, -0.85, lead), 1, back);
  const glow = seg(t, T.resmi, T.dilarangP + 0.2);
  // door + Blackheath
  const door = seg(t, T.blackheath - 0.3, T.blackheath + 0.4);
  const bhStand = t > T.blackheath - 0.2;
  const bhWalk = seg(t, T.blackheath, T.rapat + 0.5);
  const bhPos: V3 = bhStand ? lerp3([0.75, 0, -0.62], [1.25, 0, -1.02], bhWalk) : [0.75, 0.235, -0.8];
  const bhGone = seg(t, T.rapat + 0.45, CUT.fork);
  // Morley + Cambridge rules
  const hold = seg(t, T.morley2 - 0.1, T.morley2 + 0.5) * (1 - seg(t, T.akhirnya, T.akhirnya + 0.4));
  const mHead = lerp(-Math.PI / 2, -0.85, seg(t, T.penggagas, T.penggagas + 0.8));
  const mPose = holdUpPose(f, 9, hold);
  const MS = 0.5;
  const hl = handLocal(mPose, 1), hr = handLocal(mPose, -1);
  const scrollW = toWorld([(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 + 0.12, (hl[2] + hr[2]) / 2 + 0.03], MORLEY, mHead, MS);
  const cheer = seg(t, T.kubu, T.kubu + 0.4) * (1 - seg(t, T.morley2, T.morley2 + 0.5));
  const banner1 = seg(t, T.the - 0.05, T.association);
  const banner2 = seg(t, T.association, T.association + 0.55);
  return (
    <>
      <ambientLight intensity={0.07} color="#FFE2C0" />
      <hemisphereLight args={["#FFE6C4", "#20100A", 0.25]} />
      <pointLight position={[0, 1.4, -0.35]} intensity={4.2} distance={4.5} decay={1.5} color="#FFC890" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.002} />
      <spotLight position={[0.6, 1.8, 1.4]} angle={0.7} penumbra={1} intensity={9} decay={1.5} distance={6} color="#FFE0B8" />
      <directionalLight position={[-2, 1.5, 1.5]} intensity={0.35} color="#9FB4D8" />
      {/* floor, walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={m.table}>
        <planeGeometry args={[3.6, 2.6]} />
      </mesh>
      <mesh position={[0, 0.95, -1.1]} receiveShadow>
        <planeGeometry args={[3.6, 1.9]} />
        <meshStandardMaterial map={wall} roughness={0.75} />
      </mesh>
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.95, -0.2]} rotation={[0, -Math.sign(x) * Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[1.9, 1.9]} />
          <meshStandardMaterial map={wall} roughness={0.75} />
        </mesh>
      ))}
      {/* ceiling beams */}
      {[-0.8, 0.2, 1.2].map((z) => (
        <mesh key={z} material={darkWoodMat()} position={[0, 1.75, z - 0.6]}>
          <boxGeometry args={[3.6, 0.08, 0.1]} />
        </mesh>
      ))}
      {/* banner: the FA is born */}
      <mesh position={[0, 1.0, -1.094]}>
        <planeGeometry args={[0.8, 0.56]} />
        <meshPhysicalMaterial map={sheetTex("banner", 1024, 716, 1863)} roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={brassMat()} position={[0, 1.0 + s * 0.29, -1.085]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.86, 12]} />
        </mesh>
      ))}
      <InkReveal tex={inkText("tf", "The Football", 1024, 200, 140, { italic: true })} w={0.62} h={0.12} p={banner1} position={[0.03, 1.1, -1.09]} rotation={[0, 0, 0]} />
      <InkReveal tex={inkText("assoc", "Association", 1024, 200, 140, { italic: true })} w={0.62} h={0.12} p={banner2} position={[0.03, 0.97, -1.09]} rotation={[0, 0, 0]} />
      <InkReveal tex={inkText("date2", "26 · X · 1863", 1024, 160, 90, { color: "#8A2E1C", spacingPx: 4 })} w={0.42} h={0.066} p={seg(t, T.association + 0.5, T.association + 0.9)} position={[0.08, 0.84, -1.09]} rotation={[0, 0, 0]} />
      {/* door to the street (Blackheath walks out into the light) */}
      <mesh position={[1.25, 0.41, -1.097]}>
        <planeGeometry args={[0.42, 0.8]} />
        <meshBasicMaterial color="#FFF2D8" toneMapped={false} />
      </mesh>
      <group position={[1.46, 0.41, -1.09]} rotation={[0, -door * 1.35, 0]}>
        <mesh material={darkWoodMat()} position={[-0.21, 0, 0.012]} castShadow>
          <boxGeometry args={[0.42, 0.8, 0.02]} />
        </mesh>
      </group>
      {door > 0 && <spotLight position={[1.25, 0.6, -1.15]} angle={0.8} penumbra={1} intensity={10 * door} distance={3} decay={1.4} color="#FFF0D0" />}
      {/* table, chairs, candles, papers */}
      <mesh material={m.cradle} position={[0, 0.38, -0.4]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.0, 0.04, 0.55]} radius={0.01} />
      </mesh>
      {[-0.9, 0.9].flatMap((x) => [-0.62, -0.18].map((z) => (
        <mesh key={`${x}${z}`} material={darkWoodMat()} position={[x, 0.18, z]} castShadow>
          <cylinderGeometry args={[0.022, 0.018, 0.36, 10]} />
        </mesh>
      )))}
      {SEATS.map(([x, z, h, seed], i) => (
        <group key={seed} position={[x, 0, z]} rotation={[0, h, 0]}>
          <mesh material={darkWoodMat()} position={[0, 0.215, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.19, 0.025, 0.17]} radius={0.006} />
          </mesh>
          <mesh material={darkWoodMat()} position={[0, 0.36, -0.085]} castShadow>
            <RoundedBoxGeo args={[0.19, 0.28, 0.02]} radius={0.006} />
          </mesh>
          {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}${i}`} material={darkWoodMat()} position={[sx * 0.08, 0.1, sz * 0.07]}>
              <cylinderGeometry args={[0.01, 0.01, 0.2, 6]} />
            </mesh>
          )))}
        </group>
      ))}
      {SEATS.map(([x, z, h, seed], i) => {
        if (i === 3 && bhStand) return null;
        // front pair (backs to camera) crops the close board shots from kubu onward: fade them out as the camera closes in
        const nearCrop = i === 4 || i === 5 ? seg(t, T.kubu - 0.4, T.kubu) : 0;
        if (nearCrop > 0.98) return null;
        const camp = i <= 1 || i === 6 ? cheer : 0;
        const pose = camp > 0 ? sitCheer(f, seed, camp) : poseAt("sit", f, seed);
        return <Gent key={seed} f={f} seed={seed} poseOverride={pose} position={[x, 0.235, z + (h === 0 ? 0.02 : h === Math.PI ? -0.02 : 0)]} heading={h} scale={0.5 * (1 - nearCrop)} hat={false} />;
      })}
      {bhStand && bhGone < 1 && (
        <Gent f={f} seed={34} pose={bhWalk > 0 && bhWalk < 1 ? "walk" : "stand"} position={bhPos} heading={Math.atan2(0.5, -0.4)} scale={0.5 * (1 - bhGone * 0.6)} coat="#1F2430" />
      )}
      {/* Morley sits far-right; the KUBU/RESMI board shots look hard-left and clip his head at the frame edge. Hide him outside his own framed window (penggagas..akhirnya). */}
      {(() => {
        const mHide = Math.max(
          seg(t, T.kubu - 0.2, T.kubu + 0.1) * (1 - seg(t, T.penggagas - 0.4, T.penggagas - 0.1)),
          seg(t, T.akhirnya + 0.1, T.akhirnya + 0.4),
        );
        return mHide > 0.98 ? null : <Gent f={f} seed={9} poseOverride={mPose} position={MORLEY} heading={mHead} scale={MS * (1 - mHide)} coat="#2B2622" />;
      })()}
      {hold > 0.02 && (
        <group position={scrollW} rotation={[0, mHead, 0]} scale={hold * 0.6}>
          <mesh>
            <planeGeometry args={[0.16, 0.2]} />
            <meshPhysicalMaterial map={cambridgeTex()} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} material={darkWoodMat()} position={[0, s * 0.102, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.19, 8]} />
            </mesh>
          ))}
        </group>
      )}
      {[-0.6, 0, 0.6].map((x) => (
        <SmallCandle key={x} position={[x, 0.4, -0.42]} t={t} light={0.7} scale={0.9} />
      ))}
      {[[-0.3, -0.35, 0.2], [0.35, -0.48, -0.3], [0.8, -0.3, 0.5]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.401, z]} rotation={[-Math.PI / 2, 0, r]}>
          <planeGeometry args={[0.13, 0.17]} />
          <meshPhysicalMaterial map={sheetTex(`p${i}`, 256, 320, 40 + i)} roughness={0.9} />
        </mesh>
      ))}
      {/* debate board on an easel */}
      <group position={BOARD} rotation={[0, BOARD_ROT, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.74, 0.54, 0.02]} />
          <meshStandardMaterial color="#2A170C" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.0105]}>
          <planeGeometry args={[0.7, 0.5]} />
          <meshStandardMaterial map={boardTex()} roughness={0.7} />
        </mesh>
        {[-0.045, -0.165].map((y) => (
          <mesh key={y} position={[0, y, 0.0115]}>
            <planeGeometry args={[0.4, 0.008]} />
            <meshBasicMaterial color="#C9A55A" />
          </mesh>
        ))}
        <Pointer v={v1} y={-0.045} glow={glow} />
        <Pointer v={v2} y={-0.165} glow={glow} />
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} material={darkWoodMat()} position={[x, -0.4, 0.03]} rotation={[0.08, 0, x > 0 ? -0.1 : 0.1]} castShadow>
            <cylinderGeometry args={[0.012, 0.014, 0.82, 8]} />
          </mesh>
        ))}
      </group>
    </>
  );
};

// ---------- set: the road splits (1871) ----------
const Road: React.FC<{ a: [number, number]; b: [number, number]; w?: number }> = ({ a, b, w = 0.09 }) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  return (
    <mesh position={[(a[0] + b[0]) / 2, 0.006, (a[1] + b[1]) / 2]} rotation={[0, ang, 0]} receiveShadow>
      <boxGeometry args={[len + w * 0.6, 0.008, w]} />
      <meshStandardMaterial color="#9A7044" roughness={0.95} />
    </mesh>
  );
};
const ForkSet: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const walk = seg(t, T.kubuRugby - 0.2, CUT.laws);
  const rPos = lerp3([0.06, 0.012, 0.1], [0.34, 0.012, -0.24], walk);
  const rHead = Math.atan2(0.28, -0.34);
  const rPose = walk > 0 && walk < 1 ? carryPose(f, 41) : { ...poseAt("stand", f, 41), ls: [-0.75, 0.25, 0.32] as V3, le: -1.75, rs: [-0.75, -0.25, -0.32] as V3, re: -1.75 };
  const hl = handLocal(rPose, 1), hr = handLocal(rPose, -1);
  const RS = 0.2;
  const ball = toWorld([(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 + 0.02, (hl[2] + hr[2]) / 2 + 0.05], rPos, rHead, RS);
  const wave = Math.sin(t * 5);
  return (
    <>
      <TableEnv props={false} />
      <mesh position={[0, 0.002, 0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1.05]} />
        <meshPhysicalMaterial map={mapTex()} roughness={0.92} />
      </mesh>
      <Road a={[0, 0.55]} b={[0, 0.15]} />
      <Road a={[0, 0.15]} b={[-0.42, -0.32]} />
      <Road a={[0, 0.15]} b={[0.42, -0.32]} />
      {/* signpost */}
      <group position={[0, 0, 0.12]}>
        <mesh material={darkWoodMat()} position={[0, 0.23, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.46, 10]} />
        </mesh>
        {([[signTex("fa", "SEPAK BOLA", "FA · 1863"), -1, 0.4], [signTex("rfu", "RUGBY", "RFU · 1871"), 1, 0.29]] as const).map(([tex, s, y]) => (
          <group key={s} position={[s * 0.14, y, 0.01]} rotation={[0, 0, s * 0.06]}>
            <mesh material={darkWoodMat()} castShadow>
              <boxGeometry args={[0.3, 0.09, 0.012]} />
            </mesh>
            <mesh position={[0, 0, 0.0065]}>
              <planeGeometry args={[0.29, 0.085]} />
              <meshStandardMaterial map={tex} roughness={0.8} />
            </mesh>
            <mesh material={darkWoodMat()} position={[s * 0.16, 0, 0]} rotation={[0, 0, s * -Math.PI / 2]}>
              <coneGeometry args={[0.045, 0.04, 3]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* flags at the two road ends */}
      {([[-0.42, -0.32, "#3E8A5A"], [0.42, -0.32, "#7A2A22"]] as const).map(([x, z, c]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh material={brassMat()} position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
          </mesh>
          <mesh position={[0.045, 0.26, 0]} rotation={[0, wave * 0.2, wave * 0.05]}>
            <planeGeometry args={[0.09, 0.06]} />
            <meshStandardMaterial color={c} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <Gent f={f} seed={41} poseOverride={rPose} position={rPos} heading={rHead} scale={RS} hat={false} coat="#7A2A22" />
      <LeatherBall position={ball} r={0.024} oval />
      <Gent f={f} seed={42} pose="stand" position={[-0.24, 0.012, -0.08]} heading={0.5} scale={RS} hat={false} coat="#22324F" />
      <LeatherBall position={[-0.19, 0.035, -0.02]} r={0.02} />
      <GroundShadow scale={2} opacity={0.55} blur={2} far={0.6} />
      <pointLight position={[0.3, 0.9, 0.8]} intensity={1.0} distance={2.4} decay={1.5} color="#FFE2B8" />
    </>
  );
};

// ---------- set: the laws, the 1863 ground, and the same pitch today ----------
const pitchSky = () =>
  canvasTex("ep06-pitch-sky", 64, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#3A2414");
    g.addColorStop(0.38, "#8A6640");
    g.addColorStop(0.5, "#D8BE8C");
    g.addColorStop(1, "#C9B086");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
const GOAL_X = -PITCH_W / 2;
const HALF_GOAL = (7.32 * M) / 2;
const SCROLL: V3 = [-2.1, 0, 3.4];
const quad = (a: V3, c: V3, b: V3, u: number): V3 => {
  const k = 1 - u;
  return [k * k * a[0] + 2 * k * u * c[0] + u * u * b[0], k * k * a[1] + 2 * k * u * c[1] + u * u * b[1], k * k * a[2] + 2 * k * u * c[2] + u * u * b[2]];
};
const KICK_FROM: V3 = [-2.43, 0.035, 0.1];
const APEX: V3 = [-3.3, 1.3, 0.02];
const KICK_TO: V3 = [-3.95, 0.4, 0.0];
const KICK_C: V3 = [2 * APEX[0] - (KICK_FROM[0] + KICK_TO[0]) / 2, 2 * APEX[1] - (KICK_FROM[1] + KICK_TO[1]) / 2, 2 * APEX[2] - (KICK_FROM[2] + KICK_TO[2]) / 2];
const SWAP: { a: V3; b: V3; bulge: number; coat: string; seed: number }[] = [
  { a: [-2.62, 0, 0.32], b: [-1.92, 0, 0.32], bulge: 0.32, coat: "#7A2A22", seed: 51 },
  { a: [-2.62, 0, -0.3], b: [-1.92, 0, -0.3], bulge: 0.3, coat: "#7A2A22", seed: 52 },
  { a: [-1.92, 0, 0.32], b: [-2.62, 0, 0.32], bulge: -0.16, coat: "#22324F", seed: 53 },
  { a: [-1.92, 0, -0.3], b: [-2.62, 0, -0.3], bulge: -0.14, coat: "#22324F", seed: 54 },
];
const CATCHER: V3 = [-2.95, 0, -0.55];
const PLAYERS: [number, number, string][] = [
  [1.2, 0.8, "#C8D4E8"], [1.6, -0.6, "#C8D4E8"], [2.2, 0.2, "#C8D4E8"], [2.9, -1.0, "#C8D4E8"], [3.2, 0.4, "#C8D4E8"],
  [-0.9, 0.5, "#B23A2E"], [-1.4, -0.9, "#B23A2E"], [-2.1, 0.1, "#B23A2E"], [0.9, -1.4, "#B23A2E"], [2.6, 1.3, "#B23A2E"],
];
const PitchSet: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const mod = seg(t, T.tapi - 0.1, T.hidup - 0.2);
  const grass = useMemo(() => {
    const g = grassTex();
    g.wrapS = g.wrapT = THREE.RepeatWrapping;
    g.repeat.set(10, 7);
    return g;
  }, []);
  // scroll unrolls
  const unroll = seg(t, CUT.laws + 0.05, T.tigaBelas + 0.4);
  const SD = 1.02 * Math.max(0.02, unroll);
  const scrollMap = scrollTex();
  scrollMap.repeat.set(1, Math.max(0.02, unroll));
  scrollMap.offset.set(0, 1 - Math.max(0.02, unroll));
  // kick + flight
  const kk = seg(t, T.setinggi - 0.5, T.setinggi - 0.1);
  const fl = clamp01((t - (T.setinggi - 0.12)) / (T.gol1 - (T.setinggi - 0.12)));
  const after = clamp01((t - T.gol1) / 0.5);
  let ballP: V3 = KICK_FROM;
  if (t >= T.setinggi - 0.12) ballP = fl < 1 ? quad(KICK_FROM, KICK_C, KICK_TO, fl) : lerp3(KICK_TO, [-4.15, 0.035, -0.02], after);
  const showFlightBall = t < T.tim;
  const trail = Array.from({ length: 14 }, (_, i) => (i + 1) / 15).filter((u) => u < fl - 0.04);
  const noBar = seg(t, T.mistar - 0.1, T.mistar + 0.3) * (1 - seg(t, T.tim - 0.3, T.tim));
  // illustrations vanish before the "no keeper, no referee" beat
  const illus = 1 - seg(t, T.tidak - 0.1, T.tidak + 0.15);
  const swap = seg(t, T.tim + 0.15, T.gol2 + 0.2);
  const arrows = seg(t, T.tim + 0.05, T.tim + 0.75);
  // catch
  const ck = seg(t, T.bolaTangkap, T.bolaTangkap + 0.5);
  const hop = Math.max(0, Math.sin(clamp01((t - (T.ditangkap - 0.25)) / 0.5) * Math.PI)) * 0.06;
  const cHead = 0.59;
  const cPose = catchPose(f, 61, ck, hop);
  const hl = handLocal(cPose, 1), hr = handLocal(cPose, -1);
  const handBall = toWorld([(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 + 0.05, (hl[2] + hr[2]) / 2 + 0.02], CATCHER, cHead, 0.15);
  const fall = clamp01((t - (T.bolaTangkap + 0.2)) / (T.ditangkap - (T.bolaTangkap + 0.2)));
  const cBall: V3 = fall < 1 ? lerp3([CATCHER[0] + 0.05, 1.1, CATCHER[2] + 0.1], handBall, fall * fall) : handBall;
  // keeper + referee (shown, then crossed out by the HUD and gone)
  const kr = seg(t, T.tidak - 0.05, T.tidak + 0.25) * (1 - seg(t, T.wasit + 0.15, T.jelasEnd + 0.1));
  const kPose: Pose = { ...poseAt("stand", f, 71), ls: [0, 0, 1.25], le: -0.2, rs: [0, 0, -1.25], re: -0.2 };
  // payoff rulers
  const r8 = seg(t, T.delapan - 0.05, T.tujuhKoma - 0.1);
  const ring = seg(t, T.sepuluh - 0.1, T.sepuluh + 0.5);
  const r10 = seg(t, T.sepuluh, T.sembilan - 0.1);
  const players = seg(t, T.jarak - 0.3, T.jarak + 0.4);
  return (
    <>
      <ambientLight intensity={0.1} color="#FFE2C0" />
      <hemisphereLight args={["#FFE6C4", "#2A180C", 0.45]} />
      <directionalLight position={[-6, 6, 4]} intensity={2.3} color="#FFD8A8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0005} />
      <directionalLight position={[4, 3, -3]} intensity={0.5} color="#A8B8E0" />
      {/* 1863 parchment ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshPhysicalMaterial map={groundParchTex()} roughness={0.92} />
      </mesh>
      {/* parchment underlay to the horizon + a warm manuscript sky (no dark void behind the goal) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={new THREE.Color("#C9B086").lerp(new THREE.Color("#3E7A3A"), mod)} roughness={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[30, 32, 16]} />
        <meshBasicMaterial map={pitchSky()} side={THREE.BackSide} fog={false} toneMapped={false} color={new THREE.Color("#FFFFFF").lerp(new THREE.Color("#B8C4D8"), mod * 0.5)} />
      </mesh>
      {mod > 0 && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
            <planeGeometry args={[10, 7.2]} />
            <meshStandardMaterial map={grass} transparent opacity={mod} roughness={0.9} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
            <planeGeometry args={[PITCH_W, PITCH_D]} />
            <meshStandardMaterial map={pitchModernTex()} transparent opacity={mod} roughness={0.85} depthWrite={false} />
          </mesh>
        </>
      )}
      {/* the scroll of XIII laws */}
      <group position={SCROLL}>
        <mesh position={[0, 0.006, -0.51 + SD / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.75, SD]} />
          <meshPhysicalMaterial map={scrollMap} roughness={0.9} />
        </mesh>
        {[-0.51, -0.51 + SD].map((z, i) => (
          <mesh key={i} material={darkWoodMat()} position={[0, 0.025, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.84, 16]} />
          </mesh>
        ))}
      </group>
      {/* goal: 1863 posts that become today's goal */}
      <GoalMorph position={[GOAL_X, 0, 0]} halfW={HALF_GOAL} m={mod} vintageH={0.42} modernH={2.44 * M} depth={2 * M} facing={1} />
      {noBar > 0 &&
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[GOAL_X, 0.42, -HALF_GOAL + (i + 0.5) * ((HALF_GOAL * 2) / 7)]} scale={[1, 1, noBar]}>
            <boxGeometry args={[0.008, 0.008, (HALF_GOAL * 2) / 14]} />
            <meshBasicMaterial color="#C0392B" toneMapped={false} />
          </mesh>
        ))}
      {/* the kick */}
      {illus > 0 && t < T.tim + 0.2 && (
        <Gent f={f} seed={50} poseOverride={kickPose(f, 50, kk)} position={[-2.35, 0, 0.14]} heading={-Math.PI / 2 - 0.1} scale={0.15} hat={false} coat="#7A2A22" />
      )}
      {showFlightBall && <LeatherBall position={ballP} r={0.035} spin={fl * 9} />}
      {showFlightBall &&
        trail.map((u) => {
          const p = quad(KICK_FROM, KICK_C, KICK_TO, u);
          return (
            <mesh key={u} position={p}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color="#8A2E1C" />
            </mesh>
          );
        })}
      {/* change ends after each goal */}
      {illus > 0 && t >= T.tim - 0.4 &&
        SWAP.map((s) => {
          const pos = quad(s.a, [(s.a[0] + s.b[0]) / 2, 0, s.a[2] + s.bulge], s.b, swap);
          const dir = swap > 0 && swap < 1 ? Math.atan2(s.b[0] - s.a[0], s.bulge * (1 - 2 * swap)) : s.coat === "#7A2A22" ? Math.PI / 2 : -Math.PI / 2;
          return <Gent key={s.seed} f={f} seed={s.seed} pose={swap > 0 && swap < 1 ? "walk" : "stand"} position={pos} heading={dir} scale={0.15 * illus} hat={false} coat={s.coat} />;
        })}
      {illus > 0 && t >= T.tim - 0.4 && (
        <>
          <InkArrow a={[-2.55, 0.003, 0.42]} c={[-2.27, 0.003, 0.8]} b={[-1.98, 0.003, 0.42]} p={arrows} />
          <InkArrow a={[-1.98, 0.003, -0.4]} c={[-2.27, 0.003, -0.75]} b={[-2.55, 0.003, -0.4]} p={arrows} color="#22324F" />
        </>
      )}
      {/* the catch */}
      {illus > 0 && t >= T.tim && (
        <>
          <Gent f={f} seed={61} poseOverride={cPose} position={CATCHER} heading={cHead} scale={0.15 * illus} hat={false} coat="#22324F" />
          {t >= T.bolaTangkap && <LeatherBall position={cBall} r={0.03 * illus} />}
        </>
      )}
      {/* keeper (ghost) + referee: the laws had neither */}
      {kr > 0.01 && (
        <>
          <Gent f={f} seed={71} poseOverride={kPose} position={[GOAL_X + 0.06, 0, 0]} heading={Math.PI / 2} scale={0.16 * kr} hat={false} coat="#5A6A4A" />
          <Gent f={f} seed={72} pose="stand" position={[GOAL_X + 0.38, 0, 0.17]} heading={1.4} scale={0.16 * kr} hat coat="#141414" />
        </>
      )}
      {/* payoff: 8 yards between the posts, 10 yards round the centre spot */}
      <BrassRule from={[GOAL_X + 0.02, 0, -HALF_GOAL]} to={[GOAL_X + 0.02, 0, HALF_GOAL]} p={r8} ticks={8} thick={0.01} />
      {ring > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
          <ringGeometry args={[9.15 * M - 0.012, 9.15 * M + 0.012, 96, 1, 0, Math.PI * 2 * ring]} />
          <meshBasicMaterial color="#F2C46A" toneMapped={false} transparent opacity={0.95} />
        </mesh>
      )}
      <BrassRule from={[0, 0, 0]} to={[9.15 * M, 0, 0]} p={r10} ticks={10} thick={0.012} />
      {t >= T.lebar && <LeatherBall position={[0, 0.03, 0]} r={0.03} />}
      {t >= T.jarak - 0.3 && (
        <>
          <Gent f={f} seed={81} pose="stand" position={[-0.07, 0, 0.02]} heading={Math.PI / 2} scale={0.15} hat={false} coat="#B23A2E" />
          {([[0.74, 0.18], [0.72, -0.32], [0.25, 0.74], [0.5, -0.66]] as const).map(([x, z], i) => (
            <Gent key={i} f={f + i * 23} seed={82 + i} pose="stand" position={[x, 0, z]} heading={Math.atan2(-x, -z)} scale={0.15 * players} hat={false} coat="#C8D4E8" />
          ))}
        </>
      )}
      {t >= T.tigaBaris - 0.5 &&
        PLAYERS.map(([x, z, c], i) => (
          <Gent key={i} f={f + i * 31} seed={90 + i} pose={i % 3 === 0 ? "walk" : "stand"} position={[x, 0, z]} heading={i * 1.3} scale={0.15 * seg(t, T.tigaBaris - 0.5 + i * 0.05, T.tigaBaris + i * 0.05)} hat={false} coat={c} />
        ))}
    </>
  );
};

// ---------- set: outro (back at the table, the book and its AUDIRA ex libris) ----------
const OutroSet: React.FC = () => <TableEnv props />;

export const FilmScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const set = setAt(t);
  const profile = useMemo(() => ({ ...COLOR_PROFILES.VINTAGE_SEPIA_FILM, chromaticAberration: 0.0012 }), []);
  return (
    <>
      <CameraRig t={t} set={set} />
      <Fog set={set} />
      {set === "table" && <HookSet t={t} />}
      {set === "schools" && <SchoolsSet t={t} />}
      {set === "quill" && <QuillSet t={t} />}
      {set === "tavern" && <TavernSet t={t} />}
      {set === "room" && <RoomSet t={t} />}
      {set === "fork" && <ForkSet t={t} />}
      {set === "pitch" && <PitchSet t={t} />}
      {set === "outro" && <OutroSet />}
      <Finish frame={frame} background={BG} profile={profile} exposure={0.82} envIntensity={0.25} hdri="warmStudio" ao />
    </>
  );
};
