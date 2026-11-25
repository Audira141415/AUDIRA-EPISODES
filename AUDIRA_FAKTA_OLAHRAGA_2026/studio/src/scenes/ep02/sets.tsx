// EP02 film sets (VINTAGEFORGE museum diorama). One hero prop per set, catalog GLBs through ep02/Model.tsx.
// Figures are stylised ToyPerson toys (no real faces, no logos). Dust is NOT built here: 3D dust breaks in the
// AO pass, so every dust/heat effect is a 2D overlay in hud.tsx.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Model as Glb } from "./Model.tsx";
import { canvasTex, Ground, Hills, rng, SEPIA, Sky, VP } from "./RoadSet.tsx";
import { LEG_LENGTH, poseAt, ToyPerson as CorePerson, type Pose } from "../../core/polish/Person.tsx";

// ---------------------------------------------------------------- figures: cloth weave + matte skin (EP02 only)
// The core toy reads as bare plastic under the sepia grade. Give fabric a woven bump/roughness map and take
// the clearcoat off skin. Core materials are cached per colour, so this runs once per material.
let weaveTex: THREE.CanvasTexture | null = null;
const weave = () => {
  if (weaveTex) return weaveTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#9a9a9a";
  g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 64; i += 4) {
    g.fillStyle = i % 8 ? "#c8c8c8" : "#6c6c6c";
    g.fillRect(0, i, 64, 2);
    g.fillStyle = i % 8 ? "#5e5e5e" : "#d2d2d2";
    g.fillRect(i, 0, 2, 64);
  }
  weaveTex = new THREE.CanvasTexture(c);
  weaveTex.wrapS = weaveTex.wrapT = THREE.RepeatWrapping;
  weaveTex.repeat.set(6, 10);
  return weaveTex;
};
const clothe = (root: THREE.Object3D) =>
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
    if (!m || !m.isMeshPhysicalMaterial || m.userData.ep02) return;
    m.userData.ep02 = true;
    if (m.sheen >= 0.5) {
      m.bumpMap = weave();
      m.bumpScale = 1.6;
      m.roughnessMap = weave();
      m.roughness = 1;
    } else if (m.sheen > 0 && m.clearcoat > 0) {
      m.clearcoat = 0.04;
      m.roughness = 0.68;
    }
    m.needsUpdate = true;
  });
const ToyPerson: typeof CorePerson = (props) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (ref.current) clothe(ref.current);
  });
  return (
    <group ref={ref}>
      <CorePerson {...props} />
    </group>
  );
};

export type V3 = [number, number, number];
export type Shot = { pos: V3; target: V3; fov: number };
export type Key = Shot & { t: number };

// ---------------------------------------------------------------- camera
const sm = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return x * x * (3 - 2 * x);
};
const l3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** Keyframed camera, smoothstep between keys, plus a slow deterministic drift so it never parks. */
export const camAt = (keys: Key[], t: number, drift = 0.025, seed = 1): Shot => {
  let s: Shot = keys[0];
  if (t >= keys[keys.length - 1].t) s = keys[keys.length - 1];
  else
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t >= a.t && t < b.t) {
        const k = sm((t - a.t) / (b.t - a.t));
        s = { pos: l3(a.pos, b.pos, k), target: l3(a.target, b.target, k), fov: a.fov + (b.fov - a.fov) * k };
        break;
      }
    }
  const d = (f: number, p: number) => Math.sin(t * f + seed * p) * drift;
  return { pos: [s.pos[0] + d(0.53, 1.3), s.pos[1] + d(0.41, 2.1) * 0.6, s.pos[2] + d(0.37, 0.7)], target: s.target, fov: s.fov };
};
/** lift: shift the rendered view up by this fraction of the frame height (keeps feet above the karaoke band). */
export const Cam: React.FC<{ shot: Shot; lift?: number }> = ({ shot, lift = 0 }) => {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...shot.pos);
    c.lookAt(new THREE.Vector3(...shot.target));
    c.fov = shot.fov;
    if (lift) c.setViewOffset(size.width, size.height, 0, size.height * lift, size.width, size.height);
    else c.clearViewOffset();
    c.updateProjectionMatrix();
  });
  return null;
};

// ---------------------------------------------------------------- poses
export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * k;
  const v = (x: V3, y: V3): V3 => [m(x[0], y[0]), m(x[1], y[1]), m(x[2], y[2])];
  return {
    body: v(a.body, b.body), lift: m(a.lift, b.lift), spine: v(a.spine, b.spine), head: v(a.head, b.head),
    ls: v(a.ls, b.ls), le: m(a.le, b.le), rs: v(a.rs, b.rs), re: m(a.re, b.re),
    lh: v(a.lh, b.lh), lk: m(a.lk, b.lk), rh: v(a.rh, b.rh), rk: m(a.rk, b.rk),
  };
};
const BASE = (): Pose => poseAt("stand", 0, 1);
/** Bent over, one hand on the calf (Lorz's cramp). */
export const clutchCalf = (f: number): Pose => ({
  ...BASE(), lift: LEG_LENGTH - 0.08, body: [0.35, 0, 0], spine: [0.45, 0.1, 0], head: [0.1, 0, 0.08 * Math.sin(f / 9)],
  ls: [-0.9, 0, 0.25], le: -0.4, rs: [-1.25, 0, -0.1], re: -0.15, lh: [-0.2, 0, 0.05], lk: 0.5, rh: [0.15, 0, -0.04], rk: 0.25,
});
/** Hand to mouth (eating an apple). */
export const eatPose = (f: number): Pose => {
  const c = Math.max(0, Math.sin(f / 7));
  return { ...BASE(), head: [0.12, 0, 0], rs: [-1.25, 0.4, -0.2], re: -2.0 + c * 0.25, ls: [0.1, 0, 0.2], le: -0.3 };
};
/** Reaching up into the tree. */
export const reachPose = (f: number): Pose => ({ ...BASE(), head: [-0.45, 0, 0], rs: [-0.3, 0, -2.7 + 0.1 * Math.sin(f / 6)], re: -0.25, ls: [0, 0, 0.25] });
/** Doubled over, both hands on the belly (cramp). */
export const bellyPose = (f: number): Pose => ({
  ...BASE(), lift: LEG_LENGTH - 0.06, body: [0.45 + 0.05 * Math.sin(f / 8), 0, 0], spine: [0.35, 0, 0], head: [0.2, 0, 0],
  ls: [-0.9, 0, 0.35], le: -1.5, rs: [-0.9, 0, -0.35], re: -1.5, lk: 0.35, rk: 0.35, lh: [-0.25, 0, 0.04], rh: [-0.25, 0, -0.04],
});
/** Trainer holding the runner up: inner arm round the runner's back, outer arm across. */
export const supportPose = (f: number, side: 1 | -1): Pose => {
  const w = poseAt("walk", f, 3);
  return side === 1
    ? { ...w, spine: [0.12, 0, 0.1], ls: [-0.2, 0, 1.35], le: -0.5, rs: [-1.0, -0.3, -0.2], re: -1.2 }
    : { ...w, spine: [0.12, 0, -0.1], rs: [-0.2, 0, -1.35], re: -0.5, ls: [-1.0, 0.3, 0.2], le: -1.2 };
};
/** Starter, arm straight up holding the pistol. */
export const pistolPose = (kick: number): Pose => ({ ...BASE(), head: [-0.2, 0, 0], rs: [-0.15 - kick * 0.15, 0, -3.0 + kick * 0.2], re: -0.05 });
/** Arms thrown up through the tape. */
export const tapePose = (f: number): Pose => {
  const r = poseAt("cheer", f, 2);
  return { ...r, lift: LEG_LENGTH, lk: 0.2, rk: 0.2 };
};

// Stable tint callbacks (Model memoises on the function identity).
const tintDark = (m: THREE.MeshStandardMaterial) => void m.color.multiplyScalar(0.55);
const tintBottle = (m: THREE.MeshStandardMaterial) => {
  m.color.set("#3f6b3a");
  m.transparent = true;
  m.opacity = 0.88;
  m.roughness = 0.12;
  m.metalness = 0.1;
};
const CORN = new THREE.Color("#c9b07a");
const STAND = new THREE.Color("#7a5634");
const tintStand = (m: THREE.MeshStandardMaterial) => {
  const l = m.color.getHSL({ h: 0, s: 0, l: 0 }).l;
  m.color.copy(STAND).multiplyScalar(0.6 + l * 0.8);
  m.roughness = 0.85;
  m.metalness = 0;
};
const tintCorn = (m: THREE.MeshStandardMaterial) => void m.color.lerp(CORN, 0.55);

// ---------------------------------------------------------------- looks
export const LOOK = {
  lorz: { outfit: "casual" as const, top: "#f1e9d6", bottom: "#2c1d12", hairStyle: 0 as const, hair: "#2a1c14", skin: "#e6b28c", height: 1 },
  hicks: { outfit: "casual" as const, top: "#dcd3bd", bottom: "#4a3322", hairStyle: 0 as const, hair: "#432a1b", skin: "#f3cfb3", height: 1 },
  trainer: { outfit: "casual" as const, top: "#5b4630", bottom: "#2a1d12", hairStyle: 3 as const, skin: "#e6b28c", height: 1.02, build: 1.1 },
  carvajal: { outfit: "casual" as const, top: "#efe6d2", bottom: "#3a2a1c", hairStyle: 0 as const, hair: "#1b1411", skin: "#b47a52", height: 0.86 },
  taunyane: { outfit: "casual" as const, top: "#e8dcc2", bottom: "#3b2818", hairStyle: 3 as const, skin: "#6e4730", height: 1 },
  starter: { outfit: "casual" as const, top: "#2a2018", bottom: "#2a2018", hairStyle: 0 as const, hair: "#d9c9b3", skin: "#f3cfb3", height: 1.03, build: 1.1 },
  alice: { outfit: "casual" as const, top: "#f3ead6", bottom: "#f3ead6", hairStyle: 1 as const, hair: "#6e4426", skin: "#f3cfb3", height: 0.95 },
};
export { ToyPerson };

// ---------------------------------------------------------------- shared pieces
export const SunLights: React.FC<{ fogNear?: number; fogFar?: number; sun?: V3; keyI?: number }> = ({ fogNear = 14, fogFar = 58, sun = [6, 10, 4], keyI = 0.45 }) => (
  <>
    <hemisphereLight args={["#fff1d2", "#6a4e30", 0.2]} />
    <directionalLight position={sun} intensity={keyI} color="#fff0cf" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={1} shadow-camera-far={50} shadow-bias={-0.0004} />
    <directionalLight position={[-5, 4, -8]} intensity={1.4} color="#e0965f" />
    <fog attach="fog" args={["#4f3922", fogNear * 0.55, fogFar * 0.6]} />
  </>
);
export const LampLights: React.FC<{ lamp: V3; flicker: number }> = ({ lamp, flicker }) => (
  <>
    <hemisphereLight args={["#4a3826", "#1e140c", 0.55]} />
    <pointLight position={lamp} intensity={9 * flicker} distance={9} decay={1.6} color="#ffb768" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
    <directionalLight position={[3, 5, 6]} intensity={0.35} color="#ffe2b8" />
    <fog attach="fog" args={["#2a1d12", 6, 22]} />
  </>
);

const woodTex = (seed: number, base = "#7a5634") =>
  canvasTex(256, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    const r = rng(seed);
    g.strokeStyle = "rgba(40,26,14,0.35)";
    for (let y = 4; y < 256; y += 10 + r() * 6) {
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(90, y + r() * 8 - 4, 170, y + r() * 8 - 4, 256, y + 2);
      g.stroke();
    }
  });
export const useWood = (seed: number, base?: string) => useMemo(() => new THREE.MeshStandardMaterial({ map: woodTex(seed, base), roughness: 0.85 }), [seed, base]);
export const useBrass = () => useMemo(() => new THREE.MeshStandardMaterial({ color: VP.agedGold, metalness: 0.9, roughness: 0.3, envMapIntensity: 2.8 }), []);

/** A canvas-texture sign (text painted once per `key`). */
export const Sign: React.FC<{ w: number; h: number; position: V3; rotation?: V3; draw: (g: CanvasRenderingContext2D, W: number, H: number) => void; dep: string; px?: number; emissive?: number }> = ({ w, h, position, rotation = [0, 0, 0], draw, dep, px = 512, emissive = 0 }) => {
  const W = px, H = Math.round((px * h) / w);
  const tex = useMemo(() => canvasTex(W, H, (g) => draw(g, W, H)), [dep, W, H]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.85} emissive="#ffffff" emissiveMap={emissive ? tex : null} emissiveIntensity={emissive} side={THREE.DoubleSide} />
    </mesh>
  );
};

const paintBoard = (text: string, sub?: string) => (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = "#e9dcbc";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = VP.engravingBrown;
  g.lineWidth = H * 0.06;
  g.strokeRect(H * 0.05, H * 0.05, W - H * 0.1, H - H * 0.1);
  g.fillStyle = VP.engravingBrown;
  g.textAlign = "center";
  g.font = `bold ${Math.round(H * (sub ? 0.46 : 0.6))}px Georgia, serif`;
  g.fillText(text, W / 2, sub ? H * 0.55 : H * 0.7);
  if (sub) {
    g.font = `bold ${Math.round(H * 0.2)}px Georgia, serif`;
    g.fillText(sub, W / 2, H * 0.84);
  }
};

// ================================================================= STADIUM (Francis Field)
/** Cinder track along x at z = 0, wooden grandstand behind (z < 0), AUDIRA hoardings on the rail. */
export const StadiumSet: React.FC<{ t: number; cheer: number }> = ({ t, cheer }) => {
  const track = useMemo(
    () =>
      canvasTex(512, 512, (g) => {
        g.fillStyle = "#a9805a";
        g.fillRect(0, 0, 512, 512);
        const r = rng(21);
        for (let i = 0; i < 2600; i++) {
          g.fillStyle = r() < 0.5 ? "rgba(90,60,36,0.25)" : "rgba(236,210,170,0.2)";
          g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 1 + r() * 2);
        }
        g.strokeStyle = "rgba(243,234,214,0.55)";
        g.lineWidth = 4;
        for (const y of [60, 196, 332, 468]) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(512, y);
          g.stroke();
        }
      }, [10, 1]),
    [],
  );
  const rail = useWood(7, "#5a3d22");
  const crowd = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 26 }, (_, i) => ({ x: -11 + (i % 13) * 1.75 + r() * 0.4, row: Math.floor(i / 13), seed: 40 + i, skin: ["#f3cfb3", "#e6b28c", "#d09a6c"][i % 3], top: ["#3b2818", "#5b4630", "#efe6d2", "#2a2018"][i % 4] }));
  }, []);
  return (
    <group>
      <Sky />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -10]} receiveShadow>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial color="#9c8a55" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 4.4]} />
        <meshStandardMaterial map={track} roughness={0.95} />
      </mesh>
      {[-12, -4, 4, 12].map((x, i) => (
        <Glb key={i} id="grandstand-seating-run-fc9023" position={[x, 0, -6.2]} height={3.2} tint={tintStand} />
      ))}
      <Glb id="stand-roof-run-cfd457" position={[0, 3.1, -6.6]} height={1.2} tint={tintStand} />
      {/* rail + AUDIRA hoardings */}
      {[-14, -7, 0, 7, 14].map((x, i) => (
        <group key={i} position={[x, 0, -2.7]}>
          <mesh position={[0, 0.5, 0]} material={rail} castShadow>
            <boxGeometry args={[7, 0.06, 0.06]} />
          </mesh>
          <Sign w={2.4} h={0.5} position={[0, 0.32, 0.04]} dep="hoard" draw={(g, W, H) => paintBoard("AUDIRA")(g, W, H)} />
        </group>
      ))}
      {/* crowd on the stand, toy figures cheering */}
      {crowd.map((c, i) => (
        <ToyPerson key={i} f={t * 60 + i * 7} seed={c.seed} pose={cheer > 0.5 && i % 2 === 0 ? "cheer" : "stand"} position={[c.x, 0, -3.25 - c.row * 0.7]} heading={0} scale={0.8} look={{ outfit: "casual", skin: c.skin, top: c.top, bottom: "#2a1d12", hairStyle: 0 }} />
      ))}
      {/* pennant line */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-12 + i * 1.4, 4.35 + 0.04 * Math.sin(t * 3 + i), -5.2]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.18, 0.38, 3]} />
          <meshStandardMaterial color={i % 2 ? VP.terracottaWash : VP.parchmentSepia} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

/** Finish tape between two posts at x; `broken` 0..1 swings the two halves away. */
export const FinishTape: React.FC<{ x: number; broken: number; z?: number }> = ({ x, broken, z = 0 }) => {
  const post = useWood(3, "#5a3d22");
  const a = broken * 1.2;
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0.6, s * 1.9]} material={post} castShadow>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
          </mesh>
          <group position={[0, 1.05, s * 1.9]} rotation={[0, s * a, -broken * 0.6]}>
            <mesh position={[0, 0, -s * 0.95]}>
              <boxGeometry args={[0.02, 0.05, 1.9]} />
              <meshStandardMaterial color="#f3ead6" roughness={0.7} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

/** 1904 bellows box camera on a tripod (prop only). */
export const BoxCamera: React.FC<{ position: V3; rotation?: number }> = ({ position, rotation = 0 }) => {
  const wood = useWood(9, "#6b4426");
  const brass = useBrass();
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0, 2.1, 4.2].map((r, i) => (
        <mesh key={i} position={[Math.sin(r) * 0.18, 0.55, Math.cos(r) * 0.18]} rotation={[Math.cos(r) * 0.3, 0, -Math.sin(r) * 0.3]} material={wood}>
          <cylinderGeometry args={[0.015, 0.02, 1.15, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 1.18, 0]} material={wood} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.34]} />
      </mesh>
      <mesh position={[0, 1.18, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.16, 12]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.18, 0.33]} rotation={[Math.PI / 2, 0, 0]} material={brass}>
        <torusGeometry args={[0.07, 0.015, 8, 20]} />
      </mesh>
    </group>
  );
};

/** Wide-brimmed hat to sit on a ToyPerson head (Alice, generic). */
export const Hat: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
      <meshStandardMaterial color="#efe6d2" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.07, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.14, 0.13, 18]} />
      <meshStandardMaterial color="#efe6d2" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.03, 0]}>
      <cylinderGeometry args={[0.145, 0.145, 0.04, 18]} />
      <meshStandardMaterial color={VP.terracottaWash} roughness={0.8} />
    </mesh>
  </group>
);

// ================================================================= HILL ROAD (pump, finish gate)
/** Seven layered ridges toward the horizon. */
export const SevenHills: React.FC = () => (
  <group>
    {Array.from({ length: 7 }, (_, i) => {
      const z = -10 - i * 5.5;
      const x = (i % 2 ? 1 : -1) * (3 + i * 1.6);
      const c = new THREE.Color("#a99766").lerp(new THREE.Color("#d9c29a"), i / 7);
      return (
        <mesh key={i} position={[x, -0.3, z]} scale={[1.6, 0.32 + (i % 3) * 0.06, 0.55]}>
          <sphereGeometry args={[6 + i * 1.3, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={c} roughness={1} />
        </mesh>
      );
    })}
  </group>
);
export const PumpSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <Sky />
    <Ground />
    <SevenHills />
    <Glb id="hand-water-pump-448037" position={[0.9, 0, 0.2]} rotation={[0, -0.5, 0]} height={1.25} />
    <Glb id="whiskey-barrel-7bb83f" position={[0.35, 0, 0.55]} height={0.42} />
    <Glb id="sagebrush-700b03" position={[1.8, 0, 1.4]} height={0.45} />
    <Glb id="sagebrush-700b03" position={[-1.9, 0, 0.8]} height={0.4} />
    <Glb id="split-rail-fence-run-87da39" position={[2.4, 0, -2]} rotation={[0, Math.PI / 2, 0]} height={0.7} />
    <Glb id="split-rail-fence-run-87da39" position={[2.4, 0, -8]} rotation={[0, Math.PI / 2, 0]} height={0.7} />
    <Glb id="telegraph-pole-line-95e382" position={[3.3, 0, -6]} rotation={[0, Math.PI / 2, 0]} height={3.6} />
  </group>
);
/** Local copy of the running stride (RoadSet.runPose) to keep sets.tsx self-contained. */
export function runPoseLite(f: number, seed = 1, tired = 0): Pose {
  const w = (f / 60) * Math.PI * 2 * 1.3 + seed;
  const s = Math.sin(w);
  return {
    body: [0.16 + tired * 0.1, 0, Math.sin(w) * 0.03], lift: LEG_LENGTH - 0.02 + Math.abs(Math.cos(w)) * 0.05,
    spine: [0.1 + tired * 0.12, -s * 0.12, 0], head: [tired * 0.35 - 0.12, s * 0.05, 0],
    ls: [s * (0.95 - tired * 0.4), 0, 0.14 + tired * 0.1], le: -1.35 + tired * 0.5,
    rs: [-s * (0.95 - tired * 0.4), 0, -0.14 - tired * 0.1], re: -1.35 + tired * 0.5,
    lh: [-s * 0.85, 0, 0.03], lk: Math.max(0, s) * 1.25 + 0.15, rh: [s * 0.85, 0, -0.03], rk: Math.max(0, -s) * 1.25 + 0.15,
  };
}

/** Wooden finish gate over the road with a FINISH board. */
export const FinishGate: React.FC<{ z: number }> = ({ z }) => {
  const wood = useWood(13, "#5a3d22");
  return (
    <group position={[0, 0, z]}>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]} material={wood} castShadow>
          <boxGeometry args={[0.14, 3.2, 0.14]} />
        </mesh>
      ))}
      <mesh position={[0, 3.05, 0]} material={wood} castShadow>
        <boxGeometry args={[4.1, 0.12, 0.14]} />
      </mesh>
      <Sign w={2.6} h={0.6} position={[0, 2.62, 0.08]} dep="finish" draw={paintBoard("FINISH", "ST. LOUIS · 1904")} />
    </group>
  );
};
export const HillRoadSet: React.FC = () => (
  <group>
    <Sky />
    <Ground />
    <SevenHills />
    {[-1, -7, -13].map((z, i) => (
      <Glb key={i} id="split-rail-fence-run-87da39" position={[-2.3, 0, z]} rotation={[0, Math.PI / 2, 0]} height={0.7} />
    ))}
    <Glb id="dead-cottonwood-edbde8" position={[4.5, 0, -9]} height={4.6} tint={tintDark} />
    <Glb id="sagebrush-700b03" position={[2.4, 0, 1.0]} height={0.45} />
  </group>
);

// ================================================================= TRAINER TABLE (close-up)
export const TrainerTable: React.FC<{ t: number; pour: number; crack: number }> = ({ t, pour, crack }) => {
  const top = useWood(17, "#6b4426");
  const label = useMemo(
    () =>
      canvasTex(256, 320, (g) => {
        g.fillStyle = "#efe2c2";
        g.fillRect(0, 0, 256, 320);
        g.strokeStyle = VP.engravingBrown;
        g.lineWidth = 8;
        g.strokeRect(10, 10, 236, 300);
        g.fillStyle = VP.engravingBrown;
        g.textAlign = "center";
        g.font = "bold 40px Georgia, serif";
        g.fillText("STRYCH-", 128, 120);
        g.fillText("NINE", 128, 168);
        g.font = "26px Georgia, serif";
        g.fillText("— POISON —", 128, 240);
      }),
    [],
  );
  const shell = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f1e6cf", roughness: 0.55 }), []);
  return (
    <group>
      {/* table top + crate legs */}
      <mesh position={[0, 0.72, 0]} material={top} receiveShadow castShadow>
        <boxGeometry args={[1.6, 0.06, 0.9]} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.35, 0]} material={top}>
          <boxGeometry args={[0.08, 0.7, 0.8]} />
        </mesh>
      ))}
      {/* green poison bottle, tilting to pour */}
      <group position={[-0.2, 0.75, 0.1]} rotation={[0, 0, -pour * 0.75]}>
        <Glb id="potion-bottle-b28245" height={0.34} tint={tintBottle} />
        <mesh position={[0, 0.12, 0.072]}>
          <planeGeometry args={[0.1, 0.125]} />
          <meshStandardMaterial map={label} roughness={0.9} />
        </mesh>
      </group>
      {/* tin cup with the egg white */}
      <mesh position={[0.02, 0.81, 0.12]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.13, 20, 1, true]} />
        <meshStandardMaterial color="#8b8478" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* egg: whole, then cracked into halves */}
      {crack < 0.5 ? (
        <mesh position={[0.17, 0.81, 0.16]} scale={[1, 1.3, 1]} material={shell} castShadow>
          <sphereGeometry args={[0.055, 20, 14]} />
        </mesh>
      ) : (
        [-1, 1].map((s) => (
          <mesh key={s} position={[0.17 + s * 0.06, 0.78, 0.18]} rotation={[0, 0, s * 1.2]} material={shell} castShadow>
            <sphereGeometry args={[0.055, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        ))
      )}
      {/* brandy */}
      <Glb id="whiskey-bottle-and-glass-fa24b4" position={[0.36, 0.75, -0.02]} rotation={[0, -0.4, 0]} height={0.32} />
      {/* drip from the bottle while pouring */}
      {pour > 0.6 && <mesh position={[-0.04, 0.95 - ((t * 1.6) % 1) * 0.08, 0.12]}><sphereGeometry args={[0.008, 8, 6]} /><meshStandardMaterial color="#6f9a5c" /></mesh>}
    </group>
  );
};

// ================================================================= ORCHARD / FIELD
export const OrchardSet: React.FC = () => (
  <group>
    <Sky />
    <Ground />
    <Hills />
    <Glb id="orchard-apple-tree-b21f85" position={[0, 0, -0.6]} height={3.0} />
    <Glb id="apple-tree-ef0ba0" position={[-4.2, 0, -5]} height={2.6} />
    <Glb id="split-rail-fence-run-87da39" position={[-1.6, 0, 1.4]} height={0.7} />
    <Glb id="split-rail-fence-run-87da39" position={[2.6, 0, 1.4]} height={0.7} />
    {[[0.5, 0.25], [-0.6, 0.7], [0.9, -0.2]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.05, z]} castShadow>
        <sphereGeometry args={[0.05, 14, 10]} />
        <meshStandardMaterial color="#b0302a" roughness={0.45} />
      </mesh>
    ))}
  </group>
);
export const Apple: React.FC<{ position: V3; bitten?: boolean }> = ({ position, bitten }) => (
  <group position={position}>
    <mesh castShadow>
      <sphereGeometry args={[0.055, 16, 12, 0, bitten ? Math.PI * 1.6 : Math.PI * 2]} />
      <meshStandardMaterial color="#c0342c" roughness={0.4} side={THREE.DoubleSide} />
    </mesh>
  </group>
);
export const CornField: React.FC = () => {
  const spots = useMemo(() => {
    const r = rng(33);
    const out: V3[] = [];
    for (let row = 0; row < 5; row++) for (let i = 0; i < 7; i++) out.push([-6 + i * 1.9 + r() * 0.4, 0, -2.5 - row * 1.7 + r() * 0.3]);
    return out;
  }, []);
  return (
    <group>
      <Sky />
      <Ground />
      <Hills />
      {spots.map((p, i) => (
        <Glb key={i} id="corn-crop-b71f2f" position={p} rotation={[0, (i * 1.7) % 6.28, 0]} height={1.7} tint={tintCorn} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.005, 0]} receiveShadow>
        <planeGeometry args={[2.6, 40]} />
        <meshStandardMaterial color={SEPIA.road} roughness={0.95} />
      </mesh>
    </group>
  );
};

// ================================================================= CHALKBOARD (32 → 14)
export const ChalkBoard: React.FC<{ crossed: number; showFinish: boolean }> = ({ crossed, showFinish }) => {
  const brass = useBrass();
  const wood = useWood(29, "#5a3d22");
  const draw = (g: CanvasRenderingContext2D, W: number, H: number) => {
    g.fillStyle = "#23271f";
    g.fillRect(0, 0, W, H);
    const r = rng(4);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(230,225,205,${0.02 + r() * 0.04})`;
      g.fillRect(r() * W, r() * H, 2 + r() * 10, 1);
    }
    g.fillStyle = "#efe9d8";
    g.textAlign = "left";
    g.font = `bold ${H * 0.1}px Georgia, serif`;
    g.fillText("MARATON 1904", W * 0.07, H * 0.15);
    g.font = `bold ${H * 0.085}px Georgia, serif`;
    g.fillText("START", W * 0.07, H * 0.3);
    g.fillText("FINIS", W * 0.62, H * 0.3);
    // 32 tally marks in 4 rows of 8, crossed one by one
    for (let i = 0; i < 32; i++) {
      const x = W * 0.07 + (i % 8) * W * 0.058, y = H * 0.38 + Math.floor(i / 8) * H * 0.13;
      g.strokeStyle = "#efe9d8";
      g.lineWidth = W * 0.008;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + W * 0.006, y + H * 0.1);
      g.stroke();
      if (i >= 32 - crossed) {
        g.strokeStyle = "#d36a4f";
        g.beginPath();
        g.moveTo(x - W * 0.018, y + H * 0.08);
        g.lineTo(x + W * 0.03, y + H * 0.02);
        g.stroke();
      }
    }
    g.font = `bold ${H * 0.24}px Georgia, serif`;
    g.fillStyle = "#efe9d8";
    g.fillText("32", W * 0.07, H * 0.97);
    if (showFinish) {
      g.fillStyle = "#e7c98a";
      g.fillText("14", W * 0.62, H * 0.97);
    }
  };
  return (
    <group>
      <mesh position={[0, 1.15, -0.03]} material={brass} castShadow>
        <boxGeometry args={[2.36, 1.56, 0.05]} />
      </mesh>
      <Sign w={2.2} h={1.4} position={[0, 1.15, 0.0]} dep={`${crossed}-${showFinish}`} draw={draw} px={1024} />
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.3, -0.15]} rotation={[0.2, 0, 0]} material={wood}>
          <boxGeometry args={[0.07, 1.0, 0.07]} />
        </mesh>
      ))}
    </group>
  );
};

// ================================================================= PRESS ROOM (outro)
export const PressRoom: React.FC = () => {
  const wall = useWood(41, "#4a3220");
  const desk = useWood(43, "#6b4426");
  const cases = useMemo(() => {
    const r = rng(8);
    return Array.from({ length: 24 }, (_, i) => ({ x: -2.4 + (i % 8) * 0.68, y: 1.0 + Math.floor(i / 8) * 0.5, d: 0.1 + r() * 0.08 }));
  }, []);
  return (
    <group>
      <mesh position={[0, 2, -1.6]} material={wall} receiveShadow>
        <boxGeometry args={[8, 4, 0.1]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#3a2818" roughness={0.95} />
      </mesh>
      {/* type cases on the back wall */}
      {cases.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, -1.5]} material={desk} castShadow>
          <boxGeometry args={[0.62, 0.42, c.d]} />
        </mesh>
      ))}
      <mesh position={[0, 0.78, 0]} material={desk} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.07, 1.2]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.0, 0.38, 0]} material={desk}>
          <boxGeometry args={[0.08, 0.76, 1.1]} />
        </mesh>
      ))}
      <Glb id="street-oil-lamp-d246ea" position={[0.82, 0.81, -0.3]} height={0.62} />
      {/* stack of papers */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.72, 0.83 + i * 0.012, -0.2]} rotation={[0, i * 0.08, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.01, 0.7]} />
          <meshStandardMaterial color="#e6d8b6" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
export const paintPaper = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = "#eee2c4";
  g.fillRect(0, 0, W, H);
  g.fillStyle = VP.engravingBrown;
  g.textAlign = "center";
  g.font = `bold ${W * 0.078}px Georgia, serif`;
  g.fillText("THE AUDIRA GAZETTE", W / 2, H * 0.1);
  g.fillRect(W * 0.05, H * 0.125, W * 0.9, H * 0.006);
  g.font = `${W * 0.032}px Georgia, serif`;
  g.fillText("BOSTON · APRIL 1905", W / 2, H * 0.16);
  g.fillRect(W * 0.05, H * 0.175, W * 0.9, H * 0.003);
  g.font = `bold ${W * 0.12}px Georgia, serif`;
  g.fillText("LORZ JUARA", W / 2, H * 0.3);
  g.font = `bold ${W * 0.088}px Georgia, serif`;
  g.fillText("BOSTON MARATHON", W / 2, H * 0.39);
  g.font = `italic ${W * 0.042}px Georgia, serif`;
  g.fillText("setahun setelah dihukum di St. Louis", W / 2, H * 0.45);
  // columns of grey "text"
  const r = rng(55);
  for (let c = 0; c < 3; c++)
    for (let l = 0; l < 26; l++) {
      g.fillStyle = "rgba(59,40,24,0.35)";
      g.fillRect(W * (0.06 + c * 0.305), H * (0.5 + l * 0.018), W * (0.24 + r() * 0.04), H * 0.007);
    }
};
