// EP10 film 3D: one maker's workshop table, several contraptions (one per shot), all beats on
// VO word times (timing.ts). Shot A = the approved cover set, animated forward from frame 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { pegboard, woodGrain } from "../../kits/chainreaction/lib/materials";
import { CHAINREACTION_PALETTE as KP } from "../../kits/chainreaction/lib/palette";
import {
  at, BALL_R, BALL_S, BALL_Y, BG, BLOCK_S, CAM_POS, CAM_TARGET, CAM_YAW, D, Domino, FOV, Football, H, HEADING, MINUTES, Pennant,
  FOCUS, Ramp, RAMP_LIP_S, RAMP_RISE, Scoreboard, T as DT, W as DW, YELLOW,
} from "./Cover.tsx";
import { brazilBlockFace, brazilDomino, cornerFlag, dominoFace, minutePennant, pitchFelt } from "./coverTextures.ts";
import { finalBoardFace, minuteDomino, netTex, plaqueFace, ribbonHalf, signBoard } from "./filmTextures.ts";
import { T, TOTAL, lin, seg } from "./timing.ts";
import { prng } from "../../core/materials/textures.ts";

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const WHITE = "#F2EFE8";
const GER = { top: "#F4F1EA", bottom: "#16161A", hairStyle: 0 as const };
const BRA = { top: YELLOW, bottom: "#2F5FB3", hairStyle: 0 as const };
const ARG = { top: "#8CC8F0", bottom: "#1D2B4F", hairStyle: 0 as const };

// ================= shots & camera =================
type Shot = "A" | "B" | "C" | "D" | "E1" | "E2" | "E3";
export const SHOTS: { id: Shot; a: number; b: number }[] = [
  { id: "A", a: 0, b: 2.5 },
  { id: "B", a: 2.5, b: 12.85 },
  { id: "C", a: 12.85, b: 42.2 },
  { id: "D", a: 42.2, b: 47.15 },
  { id: "E1", a: 47.15, b: 53.8 },
  { id: "E2", a: 53.8, b: 57.2 },
  { id: "E3", a: 57.2, b: TOTAL + 1 },
];
export const shotAt = (t: number) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];

type K = { t: number; p: V3; l: V3; fov?: number };
const blockP = at(BLOCK_S);
const toCam = (() => {
  const v = [CAM_POS[0] - blockP[0], 0, CAM_POS[2] - blockP[2]];
  const l = Math.hypot(v[0], v[2]);
  return [v[0] / l, 0, v[2] / l] as V3;
})();
// set C tracking offset (camera behind-left of the chain, looking down the line)
const OC: V3 = [-1.85, 1.2, 2.55];
const c = (t: number, lx: number, ly = 0.3, lz = 0, off: V3 = OC): K => ({ t, l: [lx, ly, lz], p: add([lx, ly, lz], off) });

const KEYS: Record<Shot, K[]> = {
  A: [
    { t: 0, p: CAM_POS, l: CAM_TARGET },
    { t: 1.3, p: [-4.4, 2.3, 1.2], l: [blockP[0] - 0.4, 0.5, blockP[2] + 0.2] },
    { t: 2.5, p: add(add(blockP, [0, 0.55, 0]), [toCam[0] * 0.42, 0, toCam[2] * 0.42]), l: add(blockP, [0, 0.55, 0]) },
  ],
  B: [
    { t: 2.5, p: [0.0, 4.4, 2.1], l: [0, 0.1, 0.0] },
    { t: 4.4, p: [0.3, 3.1, 2.7], l: [0, 0.15, -0.25] },
    { t: 6.3, p: [0.5, 2.3, 2.9], l: [0, 0.2, -0.2] },
    { t: 7.9, p: [-0.2, 2.2, 2.7], l: [-0.55, 0.1, -0.15] },
    { t: 9.6, p: [-0.5, 1.9, 2.3], l: [-0.65, 0.1, -0.15] },
    { t: 10.7, p: [0.1, 2.5, 3.3], l: [-0.2, 0.1, 0.35] },
    { t: 12.85, p: [0.35, 2.4, 3.4], l: [-0.15, 0.1, 0.4] },
  ],
  C: [
    c(12.85, -0.3, 0.3, 0, [-1.5, 1.1, 2.4]),
    c(14.3, 0.3, 0.3, 0, [-1.8, 1.15, 2.5]),
    c(15.6, 1.6, 0.25),
    c(16.5, 2.85, 0.3, 0, [-1.85, 1.15, 2.5]),
    c(19.6, 3.0, 0.32, -0.1, [-1.55, 1.05, 2.3]),
    c(22.3, 3.3, 0.3, 0, [-1.85, 1.2, 2.5]),
    c(24.3, 3.65, 0.3, -0.1, [-1.7, 1.15, 2.4]),
    c(27.4, 4.6, 0.3, 0, [-1.85, 1.2, 2.55]),
    c(29.4, 5.0, 0.35, 0, [-1.8, 1.2, 2.45]),
    c(31.4, 4.0, 0.4, 0, [-2.4, 2.2, 4.1]),
    c(34.3, 4.3, 0.4, 0, [-2.2, 2.1, 3.9]),
    c(35.7, 6.2, 0.4, 0, [-1.9, 1.3, 2.7]),
    c(37.1, 7.3, 0.3),
    c(38.5, 8.7, 0.3, 0, [-1.8, 1.2, 2.5]),
    { t: 39.9, p: [-2.6, 3.9, 3.6], l: [4.6, 0.1, 0] },
    { t: 41.2, p: [-2.8, 4.1, 3.8], l: [4.7, 0.1, 0] },
    { t: 42.2, p: [-2.95, 4.2, 3.9], l: [4.8, 0.1, 0] },
  ],
  D: [
    { t: 42.2, p: [-1.4, 1.5, 3.7], l: [-1.0, 0.36, 0] },
    { t: 43.0, p: [-1.0, 1.55, 3.85], l: [-0.95, 0.36, 0] },
    { t: 43.9, p: [-0.8, 1.55, 3.85], l: [-0.92, 0.36, 0] },
    { t: 44.6, p: [-0.7, 1.55, 3.8], l: [-0.85, 0.36, 0] },
    { t: 45.5, p: [-0.2, 1.7, 3.1], l: [0.85, 0.2, 0] },
    { t: 46.3, p: [0.1, 1.75, 3.0], l: [1.15, 0.18, 0] },
    { t: 47.15, p: [0.35, 1.6, 2.8], l: [1.3, 0.15, 0] },
  ],
  E1: [
    { t: 47.15, p: [-2.4, 1.25, 2.3], l: [-0.05, 0.62, 0] },
    { t: 48.6, p: [-1.9, 1.1, 2.0], l: [0.0, 0.62, 0] },
    { t: 50.6, p: [-1.9, 1.35, 2.6], l: [0.05, 0.5, 0] },
    { t: 53.8, p: [-1.6, 1.5, 2.9], l: [0.1, 0.5, 0] },
  ],
  E2: [
    { t: 53.8, p: [0.55, 0.9, 2.8], l: [0.0, 0.5, 0.0] },
    { t: 55.6, p: [0.75, 1.0, 3.1], l: [-0.1, 0.55, -0.1] },
    { t: 57.2, p: [0.9, 1.1, 3.3], l: [-0.2, 0.6, -0.2] },
  ],
  E3: [
    { t: 57.2, p: [0.05, 0.8, 1.45], l: [0.35, 0.55, -0.1] },
    { t: 59.7, p: [0.5, 0.88, 1.9], l: [0.6, 0.5, -0.1] },
    { t: 61.5, p: [-1.45, 0.85, 1.95], l: [-0.85, 0.25, 0.45] },
    { t: 63.2, p: [-0.75, 0.8, 1.95], l: [-0.3, 0.22, 0.45] },
    { t: 65.6, p: [-0.3, 1.6, 4.0], l: [0.85, 0.5, -0.4] },
    { t: 70.5, p: [0.05, 1.5, 3.8], l: [0.9, 0.5, -0.45] },
    { t: TOTAL + 1, p: [0.15, 1.45, 3.6], l: [0.9, 0.5, -0.45] },
  ],
};

const cr = (a: number, b: number, c2: number, d: number, u: number) =>
  0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
const crV = (a: V3, b: V3, c2: V3, d: V3, u: number): V3 => [0, 1, 2].map((i) => cr(a[i], b[i], c2[i], d[i], u)) as V3;
export function camAt(t: number): { p: V3; l: V3; fov: number } {
  const ks = KEYS[shotAt(t).id];
  if (t <= ks[0].t) return { p: ks[0].p, l: ks[0].l, fov: ks[0].fov ?? FOV };
  let i = 0;
  while (i < ks.length - 2 && t > ks[i + 1].t) i++;
  const k0 = ks[Math.max(0, i - 1)], k1 = ks[i], k2 = ks[i + 1], k3 = ks[Math.min(ks.length - 1, i + 2)];
  const u = Math.min(1, Math.max(0, (t - k1.t) / (k2.t - k1.t)));
  return { p: crV(k0.p, k1.p, k2.p, k3.p, u), l: crV(k0.l, k1.l, k2.l, k3.l, u), fov: FOV };
}

const CamRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera, scene } = useThree();
  const k = camAt(t);
  camera.position.set(...k.p);
  camera.lookAt(...k.l);
  (camera as THREE.PerspectiveCamera).fov = k.fov;
  camera.updateProjectionMatrix();
  const d = Math.hypot(k.p[0] - k.l[0], k.p[1] - k.l[1], k.p[2] - k.l[2]);
  if (!(scene.fog instanceof THREE.Fog)) scene.fog = new THREE.Fog(BG, 6.5, 13);
  const fog = scene.fog as THREE.Fog;
  if (shotAt(t).id === "A") {
    fog.near = 6.5;
    fog.far = 13;
  } else {
    fog.near = Math.max(2.2, d * 0.9 + 1.0);
    fog.far = fog.near + Math.max(4.5, d * 1.1);
  }
  return null;
};

// ================= generic parts =================
/** Lean/fall angles for a domino line: tilt[i] <= desired[i], and never through domino i+1. */
function chainTilts(xs: number[], desired: number[], h: number, th: number): number[] {
  const n = xs.length;
  const out = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let tl = desired[i];
    if (i < n - 1 && xs[i + 1] - xs[i] < h + th) {
      const s = xs[i], s2 = xs[i + 1], t2 = out[i + 1];
      const bx = s2 - th * Math.cos(t2), by = th * Math.sin(t2);
      const nx = -Math.cos(t2), ny = Math.sin(t2);
      const dist = (a: number) => (s + h * Math.sin(a) - bx) * nx + (h * Math.cos(a) - by) * ny;
      if (dist(tl) <= 0) {
        let lo = 0, hi = tl;
        for (let k = 0; k < 30; k++) {
          const mid = (lo + hi) / 2;
          if (dist(mid) > 0) lo = mid;
          else hi = mid;
        }
        tl = lo;
      }
    }
    out[i] = Math.max(0, tl);
  }
  return out;
}
/** Fall progress: accelerating topple from t0, lying (1.5 rad) after `dur`. */
const fall = (t: number, t0: number, dur = 0.42) => 1.5 * Math.pow(lin(t, t0, t0 + dur), 2);

/** Domino along +x (dir 1) or -x (dir -1), pivot on its front-bottom edge, painted both faces. */
const DominoX: React.FC<{ x: number; z?: number; tilt: number; face: THREE.Texture; color: string; h?: number; th?: number; w?: number; dir?: 1 | -1; yaw?: number; grow?: number }> = ({
  x, z = 0, tilt, face, color, h = H, th = DT, w = DW, dir = 1, yaw = 0, grow = 1,
}) =>
  grow <= 0.001 ? null : (
    <group position={[x, 0, z]} rotation={[0, (dir === 1 ? 0 : Math.PI) + yaw, 0]} scale={[1, grow, 1]}>
      <group rotation={[0, 0, -tilt]}>
        <mesh position={[-th / 2, h / 2, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[th, h, w]} radius={Math.min(0.016, th * 0.2)} />
          <meshPhysicalMaterial color={color} {...POLISH.toyPlastic} clearcoat={0.7} clearcoatRoughness={0.18} />
        </mesh>
        <mesh position={[-th - 0.0015, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[w - 0.022, h - 0.022]} />
          <meshPhysicalMaterial map={face} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.2} />
        </mesh>
        <mesh position={[0.0015, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[w - 0.022, h - 0.022]} />
          <meshPhysicalMaterial map={face} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.2} />
        </mesh>
      </group>
    </group>
  );

const PennantX: React.FC<{ pos: V3; tex: THREE.Texture; lift?: number; yaw?: number }> = ({ pos, tex, lift = 0, yaw = -0.6 }) => (
  <group position={pos} rotation={[0, yaw, 0]}>
    <mesh position={[0, (0.4 + lift) / 2, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.01, 0.4 + lift, 10]} />
      <meshPhysicalMaterial color="#F4F1EA" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0, 0.405 + lift, 0]}>
      <sphereGeometry args={[0.014, 12, 10]} />
      <meshPhysicalMaterial color="#16161A" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0.135, 0.3 + lift, 0.004]} castShadow>
      <planeGeometry args={[0.26, 0.18]} />
      <meshPhysicalMaterial map={tex} {...POLISH.fabric} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Painted plywood sign on two dowel legs, facing yaw. */
const Sign: React.FC<{ pos: V3; tex: THREE.Texture; w: number; h: number; leg?: number; yaw?: number; tilt?: number }> = ({ pos, tex, w, h, leg = 0.25, yaw = 0, tilt = -0.08 }) => (
  <group position={pos} rotation={[0, yaw, 0]}>
    {[-w * 0.36, w * 0.36].map((x) => (
      <mesh key={x} position={[x, leg / 2, -0.02]} castShadow>
        <cylinderGeometry args={[0.014, 0.016, leg, 10]} />
        <meshStandardMaterial color={KP.bracket} metalness={0.6} roughness={0.4} />
      </mesh>
    ))}
    <group position={[0, leg + h / 2, 0]} rotation={[tilt, 0, 0]}>
      <mesh position={[0, 0, -0.016]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w + 0.03, h + 0.03, 0.03]} radius={0.008} />
        <meshPhysicalMaterial color={KP.plyEdge} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.0005]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial map={tex} roughness={0.6} clearcoat={0.3} />
      </mesh>
    </group>
  </group>
);

const KeyLight: React.FC<{ pos: V3; target: V3; size?: number; intensity?: number; color?: string }> = ({ pos, target, size = 4, intensity = 2.3, color = KP.lamp }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight(color, intensity);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.02;
    return l;
  }, [color, intensity]);
  const cam = light.shadow.camera;
  cam.left = -size;
  cam.right = size;
  cam.top = size;
  cam.bottom = -size;
  cam.near = 0.5;
  cam.far = 30;
  cam.updateProjectionMatrix();
  light.position.set(...pos);
  light.target.position.set(...target);
  light.target.updateMatrixWorld();
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

/** Workshop: oiled bench with pitch felt inlay (top at y=0), pegboard wall, warm practicals, lights. */
const Workshop: React.FC<{ cx: number; cz?: number; lx: number; lz: number; wallZ: number; lightSize?: number }> = ({ cx, cz = 0, lx, lz, wallZ, lightSize = 4 }) => {
  const benchWood = woodGrain(3, [3, 1]);
  const peg = pegboard([Math.round((lx + 6) * 5), 26]);
  const feltGrain = useSurfaceGrain(1010, 0.18, 8);
  const felt = pitchFelt();
  const sheen = useMemo(() => new THREE.Color("#8CE0A4"), []);
  return (
    <>
      <hemisphereLight args={["#FFE9CF", "#1B2A1C", 0.42]} />
      <KeyLight pos={[cx - 3.2, 5.2, cz + 3.6]} target={[cx, 0, cz]} size={lightSize} />
      <directionalLight position={[cx - 3, 3.2, cz - 3.5]} intensity={1.0} color={KP.rim} />
      <pointLight position={[cx + 0.6, 1.9, wallZ + 0.9]} intensity={3.0} distance={4.5} decay={1.6} color="#FFC98A" />
      <pointLight position={[cx - 0.4, 1.8, cz + 1.0]} intensity={1.5} distance={4.5} decay={2} color={KP.lamp} />
      <group position={[cx, 0, cz]}>
        <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
          <RoundedBoxGeo args={[lx + 0.4, 0.12, lz + 0.4]} radius={0.03} />
          <meshPhysicalMaterial color={KP.bench} map={benchWood} roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.35} />
        </mesh>
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
          <planeGeometry args={[lz, lx]} />
          <meshPhysicalMaterial map={felt} color="#C9D8C6" {...POLISH.fabric} roughnessMap={feltGrain} sheenColor={sheen} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <RoundedBoxGeo args={[lx + 0.2, 0.66, lz + 0.2]} radius={0.02} />
          <meshPhysicalMaterial color="#5E3E25" map={benchWood} roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[cx, 1.2, wallZ]} receiveShadow>
        <planeGeometry args={[lx + 10, 6]} />
        <meshStandardMaterial color={KP.pegboard} map={peg} roughness={0.9} />
      </mesh>
      {/* tool shelf on the wall */}
      <mesh position={[cx - 0.6, 1.25, wallZ + 0.12]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.4, 0.05, 0.24]} radius={0.01} />
        <meshPhysicalMaterial color={KP.plywood} map={benchWood} roughness={0.6} />
      </mesh>
      {([[-1.1, 1.4, "#E4572E"], [-0.75, 1.36, "#2A9D8F"], [-0.35, 1.42, "#F3A712"], [0.1, 1.38, "#264653"]] as const).map(([x, y, col], i) => (
        <mesh key={i} position={[cx + x, y, wallZ + 0.12]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.22, 18]} />
          <meshPhysicalMaterial color={col} {...POLISH.toyPlastic} />
        </mesh>
      ))}
      {([[0.9, 1.9, 0.09], [2.2, 1.45, 0.07], [-1.8, 1.25, 0.06], [3.3, 2.1, 0.08], [-3.2, 2.0, 0.07]] as const).map(([x, y, r], i) => (
        <mesh key={`b${i}`} position={[cx + x, y, wallZ + 0.3]} onUpdate={(m) => m.layers.enable(FX_LAYER)}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshBasicMaterial color={KP.lamp} toneMapped={false} />
        </mesh>
      ))}
      <GroundShadow x={cx} z={cz} scale={Math.max(lx, lz) + 1} opacity={0.5} blur={2} far={1.1} />
    </>
  );
};

/** Rolling football between two x positions (smoothstep), spin from distance. */
const rollX = (t: number, x0: number, x1: number, t0: number, t1: number) => x0 + (x1 - x0) * seg(t, t0, t1);

// ================= foreground: spare parts on the near felt (fills the bottom of 9:16) =================
type ClutterKind = "domino" | "ball" | "cone" | "chip";
const CONES: ClutterKind[] = ["cone", "ball", "cone"];
const SPARES: ClutterKind[] = ["domino", "domino", "ball", "domino"];
const BALLS_K: ClutterKind[] = ["ball", "domino", "ball"];
const CHIPS_D: ClutterKind[] = ["chip", "chip", "domino"];
const CHIP: ClutterKind[] = ["chip"];
const YW = [YELLOW, WHITE];
const RIB = [YELLOW, "#118A3E", WHITE];
const SHARDS = [YELLOW, "#E0B800", "#2A3140"];
const CONFETTI = ["#D9A845", WHITE, "#16161A", "#D9A845"];
/** Deterministic spare parts scattered in a rectangle [x0,x1] x [z0,z1] on the felt. */
const Clutter: React.FC<{ seed: number; x0: number; x1: number; z0: number; z1: number; n: number; kinds: ClutterKind[]; colors?: string[] }> = ({
  seed, x0, x1, z0, z1, n, kinds, colors = [WHITE, "#16161A", YELLOW],
}) => {
  const items = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: n }, (_, i) => ({
      k: kinds[i % kinds.length],
      x: x0 + r() * (x1 - x0),
      z: z0 + r() * (z1 - z0),
      yaw: r() * Math.PI * 2,
      col: colors[Math.floor(r() * colors.length) % colors.length],
      s: 0.8 + r() * 0.4,
    }));
  }, [seed, x0, x1, z0, z1, n, kinds, colors]);
  return (
    <>
      {items.map((it, i) =>
        it.k === "domino" ? (
          <mesh key={i} position={[it.x, 0.025, it.z]} rotation={[0, it.yaw, 0]} scale={it.s} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.3, 0.05, 0.19]} radius={0.01} />
            <meshPhysicalMaterial color={it.col} {...POLISH.toyPlastic} clearcoat={0.6} />
          </mesh>
        ) : it.k === "ball" ? (
          <Football key={i} pos={[it.x, 0.055 * it.s, it.z]} r={0.055 * it.s} spin={[it.yaw, it.yaw * 0.5, 0.3]} />
        ) : it.k === "cone" ? (
          <mesh key={i} position={[it.x, 0.06 * it.s, it.z]} scale={it.s} castShadow>
            <coneGeometry args={[0.05, 0.12, 20]} />
            <meshPhysicalMaterial color="#F07A1E" {...POLISH.toyPlastic} />
          </mesh>
        ) : (
          <mesh key={i} position={[it.x, 0.004, it.z]} rotation={[-Math.PI / 2, 0, it.yaw]} scale={it.s}>
            <planeGeometry args={[0.05, 0.03]} />
            <meshPhysicalMaterial color={it.col} roughness={0.5} metalness={it.col === "#D9A845" ? 0.8 : 0} side={THREE.DoubleSide} />
          </mesh>
        ),
      )}
    </>
  );
};
/** Wooden ruler laid along x on the near felt. */
const RulerX: React.FC<{ x0: number; x1: number; z: number }> = ({ x0, x1, z }) => {
  const grain = woodGrain(57, [6, 1]);
  const ticks = Math.floor((x1 - x0) / 0.1);
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, 0.015, z]} castShadow receiveShadow>
        <RoundedBoxGeo args={[x1 - x0, 0.03, 0.16]} radius={0.006} />
        <meshPhysicalMaterial color={KP.plywood} map={grain} roughness={0.55} clearcoat={0.3} />
      </mesh>
      {Array.from({ length: ticks }, (_, i) => (
        <mesh key={i} position={[x0 + 0.05 + i * 0.1, 0.031, z - 0.08 + (i % 5 === 0 ? 0.035 : 0.02)]}>
          <boxGeometry args={[0.008, 0.002, i % 5 === 0 ? 0.07 : 0.04]} />
          <meshBasicMaterial color="#2A1A0E" />
        </mesh>
      ))}
    </group>
  );
};

// ================= SET A: the cover contraption, played forward =================
const SetA: React.FC<{ t: number }> = ({ t }) => {
  const ply = woodGrain(31, [1.5, 0.3]);
  const benchWood = woodGrain(3, [3, 1]);
  const peg = pegboard([48, 30]);
  const feltGrain = useSurfaceGrain(1010, 0.18, 8);
  const felt = pitchFelt();
  const front = 0.24 + 0.38 * Math.pow(lin(t, 0.0, 0.75), 2);
  const xs = MINUTES.map((_, i) => i * D);
  const tilts = chainTilts(xs, MINUTES.map((_, i) => (i === MINUTES.length - 1 ? front : 1.45)), H, DT);
  // the ball keeps flying into the BRASIL block (impact on "kandang"), then drops back
  const hit = T.kandang;
  const s0 = BALL_S, s1 = BLOCK_S - 0.24 - BALL_R - 0.01;
  const u = lin(t, 0, hit);
  let bs = s0 + (s1 - s0) * u;
  let by = BALL_Y + 0.12 * Math.sin(u * Math.PI) - 0.04 * u;
  if (t > hit) {
    const v = t - hit;
    bs = s1 - 0.22 * v;
    by = Math.max(BALL_R, BALL_Y - 0.04 - 1.8 * v * v);
  }
  const wob = t > hit ? Math.sin((t - hit) * 26) * Math.exp(-(t - hit) * 5) * 0.06 : 0;
  const mid = at(1.9);
  const BLOCK = { w: 0.66, h: 1.05, t: 0.24 };
  const echo = 1 - seg(t, 0, 0.5);
  return (
    <>
      <hemisphereLight args={["#FFE9CF", "#1B2A1C", 0.38]} />
      <KeyLight pos={[-3.2, 5.2, 3.6]} target={[0, 0, 0]} size={4} />
      <directionalLight position={[-3, 3.2, -3.5]} intensity={1.0} color={KP.rim} />
      <pointLight position={at(BLOCK_S + 1.2, 0.6, 1.6)} intensity={3.2} distance={4} decay={1.6} color="#FFC98A" />
      <pointLight position={[0.4, 1.9, 0.6]} intensity={1.6} distance={4.5} decay={2} color={KP.lamp} />
      <pointLight position={[blockP[0] + 0.6, 1.6, blockP[2] + 1.0]} intensity={1.4 + 2.5 * Math.exp(-Math.max(0, t - hit) * 4) * (t > hit ? 1 : 0)} distance={3} decay={2} color="#FFE3A0" />
      <group position={[mid[0], 0, mid[2]]} rotation={[0, HEADING + Math.PI / 2, 0]}>
        <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
          <RoundedBoxGeo args={[4.3, 0.12, 6.6]} radius={0.03} />
          <meshPhysicalMaterial color={KP.bench} map={benchWood} roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.35} />
        </mesh>
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.9, 6.2]} />
          <meshPhysicalMaterial map={felt} color="#C9D8C6" {...POLISH.fabric} roughnessMap={feltGrain} sheenColor={new THREE.Color("#8CE0A4")} envMapIntensity={0.2} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <RoundedBoxGeo args={[4.1, 0.66, 6.4]} radius={0.02} />
          <meshPhysicalMaterial color="#5E3E25" map={benchWood} roughness={0.6} />
        </mesh>
      </group>
      <mesh position={at(BLOCK_S + 1.9, 0, 1.6)} rotation={[0, HEADING + Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color={KP.pegboard} map={peg} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {([[0.9, 1.9, 0.09], [2.2, 1.4, 0.07], [-1.6, 1.2, 0.06], [3.2, 2.1, 0.08]] as const).map(([lat, y, r], i) => (
        <mesh key={i} position={at(BLOCK_S + 1.6, lat, y)} onUpdate={(m) => m.layers.enable(FX_LAYER)}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshBasicMaterial color={KP.lamp} toneMapped={false} />
        </mesh>
      ))}
      {MINUTES.map((m, i) => (
        <React.Fragment key={m}>
          <Domino s={i * D} tilt={tilts[i]} face={dominoFace(m)} color="#F2EFE8" />
          <Pennant pos={at(i * D, i % 2 ? 0.34 : -0.36)} tex={minutePennant(m)} lift={i % 2 ? 0.3 : 0} />
        </React.Fragment>
      ))}
      <Ramp grain={ply} />
      {echo > 0.01 &&
        [0.33, 0.66].map((uu, k) => {
          const lip = at(RAMP_LIP_S, 0, RAMP_RISE + BALL_R);
          const b = at(BALL_S, 0, BALL_Y);
          const p: V3 = [lip[0] + (b[0] - lip[0]) * uu, lip[1] + (b[1] - lip[1]) * Math.sqrt(uu), lip[2] + (b[2] - lip[2]) * uu];
          return (
            <mesh key={k} position={p}>
              <sphereGeometry args={[BALL_R * (0.8 + 0.2 * uu), 24, 16]} />
              <meshBasicMaterial color="#FFF4E6" transparent opacity={(0.12 + 0.14 * uu) * echo} depthWrite={false} />
            </mesh>
          );
        })}
      <Football pos={at(bs, 0, by)} r={BALL_R} spin={[0.4 + t * 2, 0.7 + t * 3, 0.2]} />
      <group position={blockP} rotation={[0, HEADING + (CAM_YAW - HEADING) * 0.55, 0]}>
        <group rotation={[0, 0, wob]}>
          <mesh position={[-BLOCK.t / 2, BLOCK.h / 2, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[BLOCK.t, BLOCK.h, BLOCK.w]} radius={0.03} />
            <meshPhysicalMaterial color={YELLOW} {...POLISH.toyPlastic} clearcoat={0.35} clearcoatRoughness={0.3} />
          </mesh>
          <mesh position={[-BLOCK.t - 0.002, BLOCK.h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[BLOCK.w - 0.04, BLOCK.h - 0.04]} />
            <meshPhysicalMaterial map={brazilBlockFace()} roughness={0.36} clearcoat={0.6} clearcoatRoughness={0.2} />
          </mesh>
        </group>
      </group>
      <Domino s={BLOCK_S - 0.55} lat={0.98} tilt={0} face={brazilDomino()} color={YELLOW} scale={0.8} yaw={CAM_YAW - HEADING} />
      <Scoreboard grain={benchWood} />
      <group position={at(-0.55, 1.05)}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.56, 10]} />
          <meshPhysicalMaterial color="#F4F1EA" {...POLISH.toyPlastic} />
        </mesh>
        <mesh position={[0.09, 0.49, 0]} rotation={[0, -0.6, 0]} castShadow>
          <planeGeometry args={[0.18, 0.13]} />
          <meshPhysicalMaterial map={cornerFlag()} {...POLISH.fabric} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={at(-0.75, -1.0 + k * 0.02, 0.03 + k * 0.05)} rotation={[0, HEADING + 0.5 + k * 0.22, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[H * 0.9, 0.05, DW * 0.9]} radius={0.012} />
          <meshPhysicalMaterial color={k === 1 ? "#16161A" : "#F2EFE8"} {...POLISH.toyPlastic} />
        </mesh>
      ))}
      <GroundShadow x={mid[0]} z={mid[2]} scale={6.5} opacity={0.55} blur={2} far={1.1} />
    </>
  );
};

// ================= SET B: Brazil line-up tray, two empty slots =================
const SLOTS: { x: number; z: number; empty?: "neymar" | "thiago" }[] = [
  { x: 0, z: 1.25 },
  { x: -0.9, z: 0.65 }, { x: -0.3, z: 0.7, empty: "thiago" }, { x: 0.3, z: 0.7 }, { x: 0.9, z: 0.65 },
  { x: -0.35, z: 0.15 }, { x: 0.35, z: 0.15 },
  { x: -0.8, z: -0.35, empty: "neymar" }, { x: 0, z: -0.4 }, { x: 0.8, z: -0.35 },
  { x: 0, z: -0.95 },
];
const SetB: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const sign = signBoard("belo", [["SEMIFINAL · 8 JULI 2014", "#17110D"], ["BELO HORIZONTE", "#0E5F2C"]], 1024, 384);
  return (
    <>
      <Workshop cx={0} cz={0.1} lx={3.6} lz={3.4} wallZ={-2.2} lightSize={3} />
      <Sign pos={[0.1, 0, -1.25]} tex={sign} w={0.8} h={0.28} leg={0.3} tilt={-0.2} />
      {/* tray rim + training cones + spare balls in front of the line-up */}
      <mesh position={[0, 0.03, 1.62]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.9, 0.06, 0.07]} radius={0.01} />
        <meshPhysicalMaterial color={KP.plyEdge} roughness={0.55} clearcoat={0.3} />
      </mesh>
      <Clutter seed={301} x0={-1.3} x1={0.7} z0={1.72} z1={2.05} n={9} kinds={CONES} />
      {SLOTS.map((s, i) => {
        const on = s.empty === "neymar" ? seg(t, T.neymar - 0.1, T.neymar + 0.3) : s.empty === "thiago" ? seg(t, T.thiago - 0.1, T.thiago + 0.3) : 0;
        const col = s.empty === "neymar" ? "#E4572E" : "#F3A712";
        return (
          <group key={i} position={[s.x, 0, s.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
              <ringGeometry args={[0.13, 0.15, 40]} />
              <meshBasicMaterial color={s.empty ? (on > 0 ? col : "#F4F4EC") : "#F4F4EC"} transparent opacity={0.85} />
            </mesh>
            {s.empty ? (
              <>
                <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.13, 40]} />
                  <meshBasicMaterial color={col} transparent opacity={0.18 + 0.32 * on} />
                </mesh>
                <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + 0.15 * on * (0.5 + 0.5 * Math.sin(t * 6))}>
                  <torusGeometry args={[0.15, 0.012 + 0.008 * on, 10, 48]} />
                  <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3 + 1.6 * on} />
                </mesh>
                {s.empty === "neymar" && on > 0.01 && (
                  <group position={[0, 0.32 + 0.03 * Math.sin(t * 2), 0]} rotation={[0, Math.sin(t * 1.3) * 0.4, 0]} scale={on}>
                    <mesh castShadow>
                      <RoundedBoxGeo args={[0.16, 0.05, 0.05]} radius={0.01} />
                      <meshPhysicalMaterial color="#E4572E" {...POLISH.toyPlastic} />
                    </mesh>
                    <mesh castShadow>
                      <RoundedBoxGeo args={[0.05, 0.16, 0.05]} radius={0.01} />
                      <meshPhysicalMaterial color="#E4572E" {...POLISH.toyPlastic} />
                    </mesh>
                  </group>
                )}
                {s.empty === "thiago" && on > 0.01 && (
                  <group position={[0, 0.3 + 0.03 * Math.sin(t * 2.2), 0]} scale={on}>
                    {[-1, 1].map((k) => (
                      <mesh key={k} position={[k * 0.045, 0, k * 0.01]} rotation={[0.15, Math.sin(t * 1.2) * 0.3, k * 0.22]} castShadow>
                        <RoundedBoxGeo args={[0.085, 0.12, 0.008]} radius={0.003} />
                        <meshStandardMaterial color="#FFD21C" emissive="#FFC400" emissiveIntensity={0.35} roughness={0.4} />
                      </mesh>
                    ))}
                  </group>
                )}
              </>
            ) : (
              <ToyPerson f={f} seed={40 + i} pose="stand" outfit="casual" look={BRA} position={[0, 0, 0]} heading={0} scale={0.42} />
            )}
          </group>
        );
      })}
    </>
  );
};

// ================= SET C: the goal machine =================
type Goal = { m: number; x: number; t: number; who: number; dir?: 1 | -1; yellow?: boolean };
export const GOALS: Goal[] = [
  { m: 11, x: 0, t: T.m11 + 0.1, who: 0.25 },
  { m: 23, x: 3.0, t: T.m23, who: 2.82 },
  { m: 24, x: 3.25, t: T.m24, who: 3.55 },
  { m: 26, x: 3.75, t: T.m26, who: -1 },
  { m: 29, x: 5.0, t: T.m29, who: 5.2 },
  { m: 69, x: 6.6, t: T.schurrle, who: 6.85 },
  { m: 79, x: 7.8, t: T.duaGol, who: -1 },
];
const OSCAR = { m: 90, x: 9.0, t: T.oscar + 0.05 };
const BALLS = [
  { x0: 0.62, x1: 2.83, t0: T.m11 + 0.45, t1: T.m23 },
  { x0: 4.37, x1: 4.83, t0: T.m26 + 0.45, t1: T.m29 },
  { x0: 7.22, x1: 7.63, t0: T.schurrle + 0.4, t1: T.duaGol },
];
const ARCH_X = 5.85;
const SetC: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const xs = GOALS.map((g) => g.x);
  const tilts = chainTilts(xs, GOALS.map((g) => fall(t, g.t)), H, DT);
  const oscarTilt = fall(t, OSCAR.t, 0.5);
  const br = seg(t, T.empatGol, T.empatGol + 0.45);
  const arch = signBoard("babak2", [["BABAK 2", "#17110D"]], 768, 256);
  const yaw = -0.6;
  return (
    <>
      <Workshop cx={4.4} cz={0.1} lx={12.6} lz={3.6} wallZ={-2.2} lightSize={7} />
      <RulerX x0={-1.4} x1={10.2} z={0.95} />
      <Clutter seed={302} x0={-1.3} x1={9.8} z0={1.15} z1={1.85} n={34} kinds={SPARES} />
      {GOALS.map((g, i) => (
        <React.Fragment key={g.m}>
          <DominoX x={g.x} tilt={tilts[i]} face={dominoFace(g.m)} color={WHITE} />
          <PennantX pos={[g.x - 0.12, 0, 0.34]} tex={minutePennant(g.m)} lift={i % 2 ? 0.22 : 0} yaw={yaw} />
          {g.who > 0 && (
            <ToyPerson f={f} seed={11 + i} pose={t > g.t + 0.35 ? "cheer" : "stand"} outfit="casual" look={GER} position={[g.who, 0, -0.55]} heading={-0.55} scale={0.6} />
          )}
        </React.Fragment>
      ))}
      {/* Oscar's 90': lone yellow domino, falls back toward Germany */}
      <DominoX x={OSCAR.x} tilt={oscarTilt} face={minuteDomino("90'", YELLOW, "#0E7A37", 90)} color={YELLOW} dir={-1} />
      <ToyPerson f={f} seed={70} pose={t > OSCAR.t + 0.4 ? "cheer" : "stand"} outfit="casual" look={BRA} position={[9.3, 0, -0.5]} heading={-0.55} scale={0.6} />
      {/* Brazil defenders, a step behind the play */}
      <ToyPerson f={f} seed={71} pose="stand" outfit="casual" look={BRA} position={[1.4, 0, -0.85]} heading={-0.3} scale={0.6} />
      <ToyPerson f={f} seed={72} pose="stand" outfit="casual" look={BRA} position={[4.3, 0, -0.95]} heading={-0.4} scale={0.6} />
      {BALLS.map((b, i) => {
        const x = rollX(t, b.x0, b.x1, b.t0, b.t1);
        return <Football key={i} pos={[x, 0.07, 0]} r={0.07} spin={[0, 0, -(x - b.x0) / 0.07]} />;
      })}
      {/* rail: plywood guide strip under the line, minute ticks every 5' */}
      <mesh position={[4.5, 0.006, 0.2]} receiveShadow>
        <boxGeometry args={[10.2, 0.012, 0.04]} />
        <meshPhysicalMaterial color={KP.plywood} roughness={0.6} />
      </mesh>
      {/* half-time gate */}
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[ARCH_X, 0.45, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.024, 0.9, 12]} />
          <meshStandardMaterial color={KP.bracket} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <group position={[ARCH_X, 0.98, 0]} rotation={[0, -Math.PI / 2 + 0.35, 0]}>
        <mesh position={[0, 0, -0.016]} castShadow>
          <RoundedBoxGeo args={[1.2, 0.36, 0.03]} radius={0.01} />
          <meshPhysicalMaterial color={KP.plyEdge} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[1.16, 0.32]} />
          <meshPhysicalMaterial map={arch} roughness={0.6} />
        </mesh>
      </group>
      {/* brass bracket: 23' .. 29' = 6 minutes */}
      {br > 0.001 && (
        <group>
          <mesh position={[(2.9 + 5.05) / 2, 0.92, 0]} scale={[br, 1, 1]} castShadow>
            <boxGeometry args={[2.15, 0.035, 0.035]} />
            <meshStandardMaterial color={KP.brass} metalness={0.9} roughness={0.25} emissive="#5A3A08" emissiveIntensity={0.4} />
          </mesh>
          {[2.9, 5.05].map((x) => (
            <mesh key={x} position={[x, 0.92 - 0.11 * br, 0]} castShadow>
              <boxGeometry args={[0.035, 0.22 * br, 0.035]} />
              <meshStandardMaterial color={KP.brass} metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
};

// ================= SET D: the statistics irony =================
const SetD: React.FC<{ t: number }> = ({ t }) => {
  const tip = -0.075 * seg(t, T.menguasai, T.p52 + 0.5);
  const yl = Array.from({ length: 18 }, (_, i) => 0.3 + i * 0.11);
  const wh = Array.from({ length: 14 }, (_, i) => 0.3 + i * 0.11);
  const yTilt = chainTilts(yl, yl.map((_, i) => fall(t, 46.75 + i * 0.075, 0.3)), 0.3, 0.055);
  const s52 = signBoard("p52", [["BRASIL", "#0E5F2C"], ["52%", "#17110D"]], 512, 384, YELLOW, "#118A3E");
  const s48 = signBoard("p48", [["JERMAN", "#17110D"], ["48%", "#17110D"]], 512, 384, "#F4F1EA", "#16161A");
  const r18 = signBoard("r18", [["BRASIL · 18 TEMBAKAN", "#0E5F2C"]], 1024, 200, YELLOW, "#118A3E");
  const r14 = signBoard("r14", [["JERMAN · 14 TEMBAKAN", "#17110D"]], 1024, 200, "#F4F1EA", "#16161A");
  const yFace = minuteDomino("", YELLOW, "#0E7A37", 5);
  const wFace = minuteDomino("", "#F4F1EA", "#16161A", 6);
  return (
    <>
      <Workshop cx={0.3} cz={0.1} lx={4.4} lz={3.2} wallZ={-2.0} lightSize={3.2} />
      <RulerX x0={-1.9} x1={2.3} z={0.95} />
      <Clutter seed={303} x0={-1.9} x1={2.2} z0={1.15} z1={1.7} n={16} kinds={BALLS_K} colors={YW} />
      {/* balance: fulcrum + plank + two pans */}
      <mesh position={[-1.0, 0.17, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.24, 3]} />
        <meshPhysicalMaterial color={KP.plyEdge} roughness={0.55} clearcoat={0.3} />
      </mesh>
      <group position={[-1.0, 0.36, 0]} rotation={[0, 0, -tip]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[1.15, 0.04, 0.2]} radius={0.01} />
          <meshPhysicalMaterial color={KP.plywood} roughness={0.6} />
        </mesh>
        {([[-0.48, s52, YELLOW], [0.48, s48, "#F4F1EA"]] as const).map(([x, tex, col], i) => (
          <group key={i} position={[x, 0.02, 0]} rotation={[0, 0, tip]}>
            <mesh position={[0, 0.03, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.16, 0.06, 32]} />
              <meshStandardMaterial color={KP.brass} metalness={0.85} roughness={0.3} />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} position={[-0.07 + (k % 2) * 0.14, 0.1 + Math.floor(k / 2) * 0.1, (k % 2) * 0.02]} castShadow>
                <sphereGeometry args={[0.05, 24, 16]} />
                <meshPhysicalMaterial color={col} {...POLISH.toyPlastic} />
              </mesh>
            ))}
            <group position={[0, 0.25, 0.12]} rotation={[-0.1, 0.25, 0]}>
              <mesh>
                <planeGeometry args={[0.36, 0.27]} />
                <meshPhysicalMaterial map={tex} roughness={0.6} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
      {/* shots: 18 yellow vs 14 white, popping up one by one */}
      {yl.map((x, i) => (
        <DominoX key={`y${i}`} x={x} z={-0.25} tilt={yTilt[i]} face={yFace} color={YELLOW} h={0.3} th={0.055} w={0.2} grow={seg(t, T.menembak + 0.05 + i * 0.065, T.menembak + 0.2 + i * 0.065)} />
      ))}
      {wh.map((x, i) => (
        <DominoX key={`w${i}`} x={x} z={0.25} tilt={0} face={wFace} color={WHITE} h={0.3} th={0.055} w={0.2} grow={seg(t, T.s14 - 0.75 + i * 0.05, T.s14 - 0.62 + i * 0.05)} />
      ))}
      <Sign pos={[0.95, 0, -0.62]} tex={r18} w={1.0} h={0.2} leg={0.32} yaw={-0.15} />
      <Sign pos={[0.85, 0, 0.62]} tex={r14} w={1.0} h={0.2} leg={0.05} yaw={-0.15} tilt={-0.5} />
    </>
  );
};

// ================= SET E1: the 62-match ribbon snaps =================
const SetE1: React.FC<{ t: number }> = ({ t }) => {
  const snap = T.memutus;
  const v = Math.max(0, t - snap);
  const droop = t < snap ? 0.012 * Math.sin(t * 40) * seg(t, snap - 1.2, snap) : 1.35 * (1 - Math.exp(-3.2 * v) * Math.cos(6.5 * v));
  const ballU = lin(t, snap - 0.35, snap + 0.35);
  const ball: V3 = [0.05, 0.45 + 0.4 * ballU, 1.6 - 3.2 * ballU];
  const p1975 = signBoard("y1975", [["1975", "#17110D"]], 512, 256, "#F4F1EA", "#118A3E");
  const p2014 = signBoard("y2014", [["2014", "#F4F1EA"]], 512, 256, "#B5482B", "#16161A");
  return (
    <>
      <Workshop cx={0} cz={0.1} lx={4.2} lz={3.4} wallZ={-2.1} lightSize={3} />
      {/* ribbon spool + offcuts near the camera */}
      <mesh position={[-0.95, 0.08, 0.95]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 32]} />
        <meshPhysicalMaterial color={YELLOW} {...POLISH.fabric} />
      </mesh>
      <Clutter seed={304} x0={-1.3} x1={0.2} z0={0.55} z1={1.4} n={14} kinds={CHIPS_D} colors={RIB} />
      {([[-0.78, p1975], [0.78, p2014]] as const).map(([x, tex]) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 0.96, 14]} />
            <meshStandardMaterial color={KP.bracket} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.13, 0.04, 24]} />
            <meshStandardMaterial color={KP.bracket} metalness={0.6} roughness={0.35} />
          </mesh>
          <group position={[0, 1.1, 0]} rotation={[0, 0.45, 0]}>
            <mesh position={[0, 0, -0.016]} castShadow>
              <RoundedBoxGeo args={[0.42, 0.22, 0.03]} radius={0.01} />
              <meshPhysicalMaterial color={KP.plyEdge} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={[0.4, 0.2]} />
              <meshPhysicalMaterial map={tex} roughness={0.6} />
            </mesh>
          </group>
        </group>
      ))}
      <group position={[-0.78, 0.84, 0]} rotation={[0, 0, -droop]}>
        <mesh position={[0.39, 0, 0]} castShadow>
          <planeGeometry args={[0.78, 0.155]} />
          <meshPhysicalMaterial map={ribbonHalf("62 LAGA KANDANG", 0)} {...POLISH.fabric} side={THREE.DoubleSide} transparent alphaTest={0.4} />
        </mesh>
      </group>
      <group position={[0.78, 0.84, 0]} rotation={[0, 0, droop]}>
        <mesh position={[-0.39, 0, 0]} castShadow>
          <planeGeometry args={[0.78, 0.155]} />
          <meshPhysicalMaterial map={ribbonHalf("RESMI TANPA KALAH", 1)} {...POLISH.fabric} side={THREE.DoubleSide} transparent alphaTest={0.4} />
        </mesh>
      </group>
      {ballU > 0 && ballU < 1 && <Football pos={ball} r={0.09} spin={[t * 8, 0, 0]} />}
      {/* a fallen white domino on the felt: the 7–1 that cut it */}
      <DominoX x={-0.45} z={0.6} tilt={1.5} face={dominoFace(79)} color={WHITE} yaw={0.4} />
    </>
  );
};

// ================= SET E2: Mineirazo beside the shadow of Maracanazo =================
const SetE2: React.FC<{ t: number }> = ({ t }) => {
  const ghost = 0.12 + 0.16 * seg(t, T.maracanazo - 0.4, T.maracanazo + 0.3);
  const ghostEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.72, 1.1, 0.2)), []);
  return (
    <>
      <Workshop cx={0} cz={0.1} lx={3.8} lz={3.4} wallZ={-2.1} lightSize={3} />
      <Clutter seed={305} x0={-0.4} x1={0.9} z0={0.75} z1={1.45} n={18} kinds={CHIPS_D} colors={SHARDS} />
      <directionalLight position={[-1.5, 2.2, -3]} intensity={1.6} color="#9BC7FF" />
      <group position={[0.32, 0, 0.35]} rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0.375, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.5, 0.75, 0.18]} radius={0.025} />
          <meshPhysicalMaterial color={YELLOW} {...POLISH.toyPlastic} />
        </mesh>
        <mesh position={[0, 0.375, 0.091]}>
          <planeGeometry args={[0.47, 0.71]} />
          <meshPhysicalMaterial map={plaqueFace("MINEIRAZO", "2014", YELLOW, "#0E5F2C", true)} roughness={0.4} clearcoat={0.5} />
        </mesh>
      </group>
      <group position={[-0.62, 0, -0.55]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.55, 0]}>
          <RoundedBoxGeo args={[0.72, 1.1, 0.2]} radius={0.03} />
          <meshPhysicalMaterial color="#2A3140" roughness={0.7} transparent opacity={ghost} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.55, 0.102]}>
          <planeGeometry args={[0.68, 1.05]} />
          <meshBasicMaterial map={plaqueFace("MARACANAZO", "1950", "#3A4250", "#C9D3E0", false)} transparent opacity={ghost + 0.32} depthWrite={false} />
        </mesh>
        {/* double image: the old wound, slightly out of register */}
        <mesh position={[0.025, 0.565, 0.104]}>
          <planeGeometry args={[0.68, 1.05]} />
          <meshBasicMaterial map={plaqueFace("MARACANAZO", "1950", "#3A4250", "#C9D3E0", false)} transparent opacity={0.16} depthWrite={false} />
        </mesh>
        <lineSegments position={[0, 0.55, 0]} geometry={ghostEdges} onUpdate={(l) => l.computeLineDistances()}>
          <lineDashedMaterial color="#9BC7FF" dashSize={0.045} gapSize={0.035} transparent opacity={0.85} />
        </lineSegments>
      </group>
      {/* the long shadow the old block throws */}
      <mesh position={[-0.2, 0.004, -0.1]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[0.8, 1.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </>
  );
};

// ================= SET E3: the final, Götze 113', trophy + outro =================
const Trophy: React.FC<{ glow: number }> = ({ glow }) => {
  const geo = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.14, 0.0], [0.14, 0.04], [0.07, 0.07], [0.035, 0.12], [0.03, 0.24], [0.06, 0.29], [0.14, 0.34], [0.18, 0.44], [0.19, 0.53], [0.18, 0.535], [0.165, 0.45], [0.12, 0.37], [0.0, 0.33],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#D9A845" metalness={1} roughness={0.22} clearcoat={0.4} emissive="#6B4A10" emissiveIntensity={0.15 + 0.5 * glow} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.2, 0.42, 0]} rotation={[0, 0, k * 0.2]} castShadow>
          <torusGeometry args={[0.07, 0.014, 12, 32, Math.PI * 1.25]} />
          <meshPhysicalMaterial color="#D9A845" metalness={1} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.145, 0.145, 0.03, 48]} />
        <meshPhysicalMaterial color="#1E6B3C" roughness={0.4} clearcoat={0.6} />
      </mesh>
    </group>
  );
};
const GoalNet: React.FC = () => {
  const net = netTex();
  return (
    <group>
      {[-0.22, 0.22].map((z) => (
        <mesh key={z} position={[0, 0.13, z]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.26, 10]} />
          <meshPhysicalMaterial color="#FAFAF5" {...POLISH.toyPlastic} />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.45, 10]} />
        <meshPhysicalMaterial color="#FAFAF5" {...POLISH.toyPlastic} />
      </mesh>
      <mesh position={[0.2, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.44, 0.26]} />
        <meshBasicMaterial map={net} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.1, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 0.44]} />
        <meshBasicMaterial map={net} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[-0.22, 0.22].map((z) => (
        <mesh key={`s${z}`} position={[0.1, 0.13, z]}>
          <planeGeometry args={[0.2, 0.26]} />
          <meshBasicMaterial map={net} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};
const SetE3: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const dt = fall(t, T.gotze + 0.1);
  const bx = rollX(t, -0.78, -0.2, T.gotze + 0.5, T.m113 + 0.4);
  const glow = seg(t, T.m113 + 0.3, T.m113 + 1.0);
  const board = finalBoardFace();
  const benchWood = woodGrain(3, [3, 1]);
  return (
    <>
      <Workshop cx={0.1} cz={0.1} lx={4.0} lz={3.4} wallZ={-2.0} lightSize={3} />
      <Clutter seed={307} x0={-1.25} x1={-0.1} z0={0.85} z1={1.35} n={6} kinds={BALLS_K} />
      <Clutter seed={306} x0={-0.9} x1={1.4} z0={0.85} z1={1.85} n={60} kinds={CHIP} colors={CONFETTI} />
      <pointLight position={[0.35, 1.0, 0.4]} intensity={0.6 + 2.4 * glow} distance={2.2} decay={2} color="#FFD58A" />
      {/* trophy on a turned pedestal */}
      <group position={[0.35, 0, -0.1]} rotation={[0, t * 0.15, 0]}>
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.23, 0.22, 48]} />
          <meshPhysicalMaterial color="#3B2A1E" map={benchWood} roughness={0.45} clearcoat={0.5} />
        </mesh>
        <group position={[0, 0.22, 0]}>
          <Trophy glow={glow} />
        </group>
      </group>
      {/* Götze's 113': one white domino, ball, net */}
      <DominoX x={-1.4} z={0.45} tilt={dt} face={minuteDomino("113'", "#F4F1EA", "#16161A", 113)} color={WHITE} />
      <PennantX pos={[-1.55, 0, 0.75]} tex={minutePennant(113)} yaw={-0.4} />
      <Football pos={[bx, 0.07, 0.45]} r={0.07} spin={[0, 0, -(bx + 0.78) / 0.07]} />
      <group position={[-0.32, 0, 0.45]}>
        <GoalNet />
      </group>
      <ToyPerson f={f} seed={21} pose={t > T.satuNol ? "cheer" : "stand"} outfit="casual" look={GER} position={[1.0, 0, 0.3]} heading={-0.35} scale={0.6} />
      <ToyPerson f={f} seed={22} pose="stand" outfit="casual" look={ARG} position={[1.55, 0, 0.5]} heading={-0.6} scale={0.6} />
      {/* final scoreboard with AUDIRA header */}
      <group position={[1.38, 0, -0.85]} rotation={[0, -0.2, 0]}>
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.024, 0.3, 12]} />
            <meshStandardMaterial color={KP.bracket} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.3 + 0.24, -0.03]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.22, 0.52, 0.06]} radius={0.02} />
          <meshPhysicalMaterial color="#3B2A1E" map={benchWood} roughness={0.5} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, 0.54, 0.002]}>
          <planeGeometry args={[1.14, 0.456]} />
          <meshStandardMaterial map={board} emissive="#FFFFFF" emissiveMap={board} emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
      </group>
    </>
  );
};

// ================= root =================
export const FilmScene: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const id = shotAt(t).id;
  const k = camAt(t);
  const focus = Math.hypot(k.p[0] - k.l[0], k.p[1] - k.l[1], k.p[2] - k.l[2]);
  return (
    <>
      <CamRig t={t} />
      {id === "A" && <SetA t={t} />}
      {id === "B" && <SetB t={t} f={f} />}
      {id === "C" && <SetC t={t} f={f} />}
      {id === "D" && <SetD t={t} />}
      {id === "E1" && <SetE1 t={t} />}
      {id === "E2" && <SetE2 t={t} />}
      {id === "E3" && <SetE3 t={t} f={f} />}
      <Finish
        frame={Math.round(f)}
        background={BG}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        exposure={0.95}
        hdri="warmStudio"
        envIntensity={0.45}
        focus={id === "A" ? FOCUS + (focus - FOCUS) * seg(t, 0.05, 0.8) : focus}
        aperture={0.0012}
        maxBlur={0.005}
      />
    </>
  );
};
