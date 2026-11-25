// EP01 hook world (BRICKCRAFT): a glowing AI prompt screen on a desk fires a spiral stream of
// interlocking bricks that snap into a tower of stacked mini game maps (lava obby, tycoon house,
// race track, castle, tree island), with a "city" of more mini-map towers behind it.
// The blocky avatar surfs the brick stream on an orange plate, cheering.
// Driven by `f` (60 fps base: t = f / 60). Deterministic: no Math.random, seeded prng only.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { BlockAvatar } from "../_shared/BlockAvatar.tsx";
import { audiraTexture, glowTexture, promptTexture, woodTexture } from "./textures.ts";

type V3 = [number, number, number];

export const BG = "#1e2124";

/** Camera start pose of the film = cover framing. */
export const COVER_CAMERA = {
  position: [-1.5, 18, 70] as V3,
  target: [1, 11.2, 0] as V3,
  fov: 34,
};

// ---------- camera ----------
export const HookCamera: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    const c = camera as THREE.PerspectiveCamera;
    const [px, py, pz] = COVER_CAMERA.position;
    const [tx, ty, tz] = COVER_CAMERA.target;
    // slow push-in + slight orbit; at t = 0.3 s this is ~the cover pose
    c.position.set(px + t * 0.12, py - t * 0.05, pz - t * 0.5);
    c.fov = COVER_CAMERA.fov;
    c.lookAt(tx, ty + t * 0.03, tz);
    c.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- bricks ----------
const STUD_GEO = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 18);
const mats = new Map<string, THREE.MeshPhysicalMaterial>();
function absMat(color: string, emissive?: string, ei = 0, trans = false): THREE.MeshPhysicalMaterial {
  const key = `${color}|${emissive}|${ei}|${trans}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({
      ...POLISH.brickABS,
      color: new THREE.Color(color),
      emissive: new THREE.Color(emissive ?? "#000000"),
      emissiveIntensity: ei,
      transparent: trans,
      opacity: trans ? 0.62 : 1,
      roughness: trans ? 0.08 : POLISH.brickABS.roughness,
    });
    mats.set(key, m);
  }
  return m;
}

/** Stud brick. w = studs on x, l = studs on z, h = height in plates (3 = full brick). Origin at the bottom centre. */
export const Brick: React.FC<{
  w?: number;
  l?: number;
  h?: number;
  color: string;
  p?: V3;
  r?: V3;
  s?: number;
  studs?: boolean;
  emissive?: string;
  ei?: number;
  trans?: boolean;
}> = ({ w = 2, l = 2, h = 3, color, p = [0, 0, 0], r = [0, 0, 0], s = 1, studs = true, emissive, ei = 0, trans = false }) => {
  const H = h * 0.4;
  const m = absMat(color, emissive, ei, trans);
  const inst = useRef<THREE.InstancedMesh>(null);
  const n = studs ? w * l : 0;
  useLayoutEffect(() => {
    if (!inst.current) return;
    const o = new THREE.Object3D();
    let k = 0;
    for (let x = 0; x < w; x++)
      for (let z = 0; z < l; z++) {
        o.position.set(x - (w - 1) / 2, H + 0.09, z - (l - 1) / 2);
        o.updateMatrix();
        inst.current.setMatrixAt(k++, o.matrix);
      }
    inst.current.instanceMatrix.needsUpdate = true;
  }, [w, l, H]);
  return (
    <group position={p} rotation={r} scale={s}>
      <mesh material={m} castShadow receiveShadow position={[0, H / 2, 0]}>
        <RoundedBoxGeo args={[w - 0.04, H, l - 0.04]} radius={0.055} segments={3} />
      </mesh>
      {n > 0 && <instancedMesh ref={inst} args={[STUD_GEO, m, n]} castShadow receiveShadow />}
    </group>
  );
};

export const C = {
  red: "#d11a2a",
  blue: "#0b5ed7",
  yellow: "#ffca2c",
  green: "#198754",
  lime: "#7cc242",
  orange: "#fd7e14",
  white: "#f2f2ee",
  black: "#25282c",
  lgrey: "#a9b0b8",
  dgrey: "#4a5058",
  tan: "#d9bb7b",
  brown: "#6b4022",
  lava: "#ff5a12",
  water: "#3aa7ff",
  purple: "#7b3fc4",
};

// ---------- mini game maps (one per tower level, plate 10x10, local top at y = 0.4) ----------
const LavaObby: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  return (
    <>
      <Brick w={10} l={10} h={1} color={C.dgrey} />
      <Brick w={6} l={6} h={1} color={C.lava} p={[0.5, 0.4, 0.5]} studs={false} emissive="#ff3a00" ei={2.6 + Math.sin(t * 3) * 0.2} />
      <Brick w={2} l={2} color={C.white} p={[-1.5, 0.4, 2.5]} />
      <Brick w={2} l={2} color={C.blue} p={[0.5, 0.8, 0.5]} />
      <Brick w={2} l={2} color={C.yellow} p={[2.5, 1.2, -1.5]} />
      <Brick w={2} l={2} color={C.green} p={[-1.5, 1.6, -1.5]} />
      <Brick w={2} l={2} h={3} color={C.lgrey} p={[-3, 0.4, -3]} />
      <Brick w={1} l={1} h={5} color={C.black} p={[-3, 1.6, -3]} studs={false} />
      <Brick w={1} l={2} h={2} color={C.lime} p={[-2.4, 2.8, -3]} studs={false} />
    </>
  );
};

const Tycoon: React.FC = () => (
  <>
    <Brick w={10} l={10} h={1} color={C.tan} />
    {/* house walls */}
    {[0, 1].map((k) => (
      <React.Fragment key={k}>
        <Brick w={4} l={1} color={k % 2 ? C.white : C.red} p={[-1, 0.4 + k * 1.2, -2.5]} />
        <Brick w={1} l={4} color={k % 2 ? C.red : C.white} p={[-3.5, 0.4 + k * 1.2, -0.5]} />
        <Brick w={1} l={3} color={k % 2 ? C.white : C.red} p={[1.5, 0.4 + k * 1.2, -1]} />
      </React.Fragment>
    ))}
    <Brick w={6} l={5} h={1} color={C.blue} p={[-1, 2.8, -1]} />
    <Brick w={4} l={3} h={1} color={C.blue} p={[-1, 3.2, -1]} />
    {/* conveyor with ore */}
    <Brick w={2} l={8} h={1} color={C.black} p={[3.5, 0.4, 0]} studs={false} />
    {[-3, -1, 1, 3].map((z) => (
      <Brick key={z} w={1} l={1} h={2} color={C.yellow} p={[3.5, 0.8, z]} emissive="#ffb400" ei={0.25} />
    ))}
  </>
);

const RaceTrack: React.FC = () => (
  <>
    <Brick w={10} l={10} h={1} color={C.green} />
    <Brick w={8} l={8} h={1} color={C.black} p={[0, 0.4, 0]} studs={false} />
    <Brick w={4} l={4} h={1} color={C.green} p={[0, 0.8, 0]} />
    {[-3, -1, 1, 3].map((x) => (
      <Brick key={x} w={1} l={1} h={1} color={x % 4 === 1 || x % 4 === -3 ? C.white : C.black} p={[x * 0.5 + 0.25, 0.8, 3.5]} studs={false} />
    ))}
    {/* car */}
    <group position={[-3, 0.8, 1]}>
      <Brick w={2} l={4} h={2} color={C.red} />
      <Brick w={2} l={2} h={2} color={C.white} p={[0, 0.8, -0.3]} trans />
      {[
        [-1.05, 0.3, 1.2],
        [1.05, 0.3, 1.2],
        [-1.05, 0.3, -1.2],
        [1.05, 0.3, -1.2],
      ].map((q, i) => (
        <mesh key={i} position={q as V3} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.3, 20]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#18191b" />
        </mesh>
      ))}
    </group>
    <Brick w={2} l={4} h={2} color={C.blue} p={[3, 0.8, -2]} />
  </>
);

export const Castle: React.FC = () => (
  <>
    <Brick w={10} l={10} h={1} color={C.lgrey} />
    {[
      [-3.5, -3.5],
      [3.5, -3.5],
      [-3.5, 3.5],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0.4, z]}>
        {[0, 1].map((k) => (
          <Brick key={k} w={2} l={2} color={k % 2 ? "#8d949c" : C.lgrey} p={[0, k * 1.2, 0]} />
        ))}
        <Brick w={2} l={2} h={1} color={C.red} p={[0, 2.4, 0]} studs={false} />
        <mesh position={[0, 3.25, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.35, 0.9, 4]} />
          <meshPhysicalMaterial {...POLISH.brickABS} color={C.red} />
        </mesh>
      </group>
    ))}
    <Brick w={6} l={1} color={"#8d949c"} p={[0, 0.4, -3.5]} />
    <Brick w={1} l={6} color={"#8d949c"} p={[-3.5, 0.4, 0]} />
    <Brick w={2} l={2} h={2} color={C.purple} p={[1.5, 0.4, 1.5]} emissive="#9b5cff" ei={0.6} />
  </>
);

const Island: React.FC = () => (
  <>
    <Brick w={10} l={10} h={1} color={C.water} trans emissive="#0a5aa0" ei={0.25} />
    <Brick w={7} l={7} h={1} color={C.tan} p={[-0.5, 0.4, -0.5]} />
    <Brick w={6} l={5} h={1} color={C.lime} p={[-1, 0.8, -1]} />
    {[
      [-2.5, -2.5, 1.0],
      [0.5, -2.0, 0.8],
    ].map(([x, z, s], i) => (
      <group key={i} position={[x, 1.2, z]} scale={s}>
        <Brick w={1} l={1} h={6} color={C.brown} studs={false} />
        <Brick w={3} l={3} color={C.green} p={[0, 2.4, 0]} />
        <Brick w={2} l={2} color={C.green} p={[0, 3.6, 0]} />
      </group>
    ))}
    {/* checkered finish flag */}
    <Brick w={1} l={1} h={14} color={C.white} p={[2, 1.2, 1.5]} studs={false} />
    <group position={[2.9, 6, 1.5]}>
      {[0, 1, 2, 3].map((k) => (
        <Brick key={k} w={0.9} l={0.2} h={1.5} color={k % 2 ? C.black : C.white} p={[(k % 2) * 0.9 - 0.45, Math.floor(k / 2) * -0.6, 0]} studs={false} />
      ))}
    </group>
  </>
);

// ---------- tower ----------
export const TOWER = { x: 2.5, z: -4, rotY: 0.55, step: 4.4 };
const Pillars: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[
      [-4.5, 4.5],
      [4.5, 4.5],
      [4.5, -4.5],
      [-4.5, -4.5],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0.4, z]}>
        {[0, 1, 2].map((k) => (
          <Brick key={k} w={1} l={1} color={k === 1 ? color : C.lgrey} p={[0, k * 1.2, 0]} />
        ))}
        <Brick w={1} l={1} h={1} color={C.lgrey} p={[0, 3.6, 0]} studs={false} />
      </group>
    ))}
  </>
);

const Tower: React.FC<{ f: number }> = ({ f }) => {
  const levels = [<LavaObby key="a" f={f} />, <Tycoon key="b" />, <RaceTrack key="c" />, <Island key="e" />];
  const pillarCols = [C.yellow, C.blue, C.red, C.lime];
  return (
    <group position={[TOWER.x, 0.2, TOWER.z]} rotation={[0, TOWER.rotY, 0]}>
      {levels.map((lv, k) => (
        <group key={k} position={[0, k * TOWER.step, 0]}>
          {lv}
          {k < levels.length - 1 && <Pillars color={pillarCols[k]} />}
        </group>
      ))}
    </group>
  );
};

// ---------- background city of mini-map towers ----------
const BG_TOWERS = (() => {
  const r = prng(77);
  const pal = [C.red, C.blue, C.yellow, C.green, C.orange, C.white, C.purple, C.lime];
  const out: { x: number; z: number; levels: number; rot: number; cols: string[] }[] = [];
  const spots: [number, number][] = [
    [-14, -18],
    [-7, -24],
    [10, -20],
    [17, -26],
    [-20, -30],
    [3, -34],
    [-11, -38],
    [22, -36],
    [-26, -22],
    [14, -44],
  ];
  for (const [x, z] of spots) {
    const levels = 2 + Math.floor(r() * 4);
    out.push({ x, z, levels, rot: r() * 1.5, cols: Array.from({ length: 12 }, () => pal[Math.floor(r() * pal.length)]) });
  }
  return out;
})();

const CityTower: React.FC<{ d: (typeof BG_TOWERS)[number] }> = ({ d }) => (
  <group position={[d.x, 0.2, d.z]} rotation={[0, d.rot, 0]}>
    {Array.from({ length: d.levels }, (_, k) => (
      <group key={k} position={[0, k * 4, 0]}>
        <Brick w={8} l={8} h={1} color={d.cols[k]} />
        <Brick w={3} l={2} color={d.cols[k + 4]} p={[-1.5, 0.4, -1.5]} studs={false} />
        <Brick w={2} l={2} h={6} color={d.cols[k + 6]} p={[2, 0.4, 1]} studs={false} />
        {k < d.levels - 1 &&
          [
            [-3.5, -3.5],
            [3.5, 3.5],
            [3.5, -3.5],
            [-3.5, 3.5],
          ].map(([x, z], i) => <Brick key={i} w={1} l={1} h={9} color={C.lgrey} p={[x, 0.4, z]} studs={false} />)}
      </group>
    ))}
  </group>
);

// ---------- brick stream (helix from the prompt screen up around the tower) ----------
const HELIX = { cx: TOWER.x, cz: TOWER.z, a0: 1.95, turns: 1.35, r0: 13, r1: 7.5, y0: 6.5, y1: 20.5 };
export function helix(s: number): THREE.Vector3 {
  const a = HELIX.a0 - s * HELIX.turns * Math.PI * 2;
  const rad = HELIX.r0 + (HELIX.r1 - HELIX.r0) * Math.min(1, s * 1.6);
  const y = HELIX.y0 + (HELIX.y1 - HELIX.y0) * Math.pow(s, 0.9) + Math.sin(s * 9) * 0.35;
  return new THREE.Vector3(HELIX.cx + Math.cos(a) * rad, y, HELIX.cz + Math.sin(a) * rad);
}

const STREAM = (() => {
  const r = prng(311);
  const pal = [C.red, C.blue, C.yellow, C.green, C.orange, C.white, C.lime, C.purple];
  const sizes: [number, number, number][] = [
    [2, 4, 3],
    [2, 2, 3],
    [1, 4, 3],
    [2, 3, 1],
    [1, 2, 3],
    [2, 6, 1],
  ];
  return Array.from({ length: 58 }, (_, i) => ({
    s0: Math.pow(i / 58, 1.3) + r() * 0.01,
    col: pal[Math.floor(r() * pal.length)],
    size: sizes[Math.floor(r() * sizes.length)],
    rot: [r() * 6.28, r() * 6.28, r() * 6.28] as V3,
    spin: 0.6 + r() * 1.4,
    off: [(r() - 0.5) * 1.6, (r() - 0.5) * 1.2, (r() - 0.5) * 1.6] as V3,
  }));
})();

const AVATAR_S = 0.07; // where the avatar surfs on the stream

const Stream: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => {
  const t = f / 60;
  const tube = useMemo(() => {
    const pts = Array.from({ length: 120 }, (_, i) => helix(i / 119));
    const curve = new THREE.CatmullRomCurve3(pts);
    return {
      outer: new THREE.TubeGeometry(curve, 400, 0.9, 16, false),
      inner: new THREE.TubeGeometry(curve, 400, 0.2, 10, false),
    };
  }, []);
  const glow = glowTexture();
  const sparks = useMemo(() => {
    const r = prng(97);
    return Array.from({ length: 90 }, () => ({ s0: r(), off: [(r() - 0.5) * 2.2, (r() - 0.5) * 1.8, (r() - 0.5) * 2.2] as V3, sz: 0.25 + r() * 0.5, warm: r() < 0.4 }));
  }, []);
  return (
    <group>
      <mesh geometry={tube.outer}>
        <meshBasicMaterial color={new THREE.Color(0.25, 0.75, 1.0)} transparent opacity={0.24 * k} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh geometry={tube.inner}>
        <meshBasicMaterial color={new THREE.Color(2.2, 3.8, 4.6)} transparent opacity={0.9 * k} depthWrite={false} toneMapped={false} />
      </mesh>
      {STREAM.map((b, i) => {
        const s = (b.s0 + t * 0.035) % 1;
        // keep the avatar's surf spot clear
        if (Math.abs(s - AVATAR_S) < 0.02 || s < 0.015) return null;
        if (s > 0.94) return null;
        const p = helix(s);
        const grow = Math.min(1, 0.25 + s / 0.03);
        const settle = s > 0.68 ? Math.max(0, 1 - (s - 0.68) / 0.26) : 1;
        return (
          <Brick
            key={i}
            w={b.size[0]}
            l={b.size[1]}
            h={b.size[2]}
            color={b.col}
            p={[p.x + b.off[0], p.y + b.off[1], p.z + b.off[2]]}
            r={[b.rot[0] + t * b.spin, b.rot[1] + t * b.spin * 0.7, b.rot[2]]}
            s={Math.max(0.001, (0.95 - s * 0.4) * grow * settle * k)}
          />
        );
      })}
      {sparks.map((q, i) => {
        const s = (q.s0 + t * 0.05) % 1;
        const p = helix(s);
        return (
          <sprite key={i} position={[p.x + q.off[0], p.y + q.off[1], p.z + q.off[2]]} scale={[q.sz * k + 0.001, q.sz * k + 0.001, q.sz * k + 0.001]}>
            <spriteMaterial map={glow} color={q.warm ? new THREE.Color(3.2, 2.4, 0.9) : new THREE.Color(1.4, 2.8, 3.6)} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        );
      })}
    </group>
  );
};

// ---------- prompt screen on a brick stand (with the AUDIRA brick) ----------
export const PROMPT_POS: V3 = [-3.5, 0, 9];
const PromptStation: React.FC<{ f: number; screen?: THREE.Texture; screenMix?: number }> = ({ f, screen, screenMix = 0 }) => {
  const t = f / 60;
  const scr = promptTexture();
  const glow = glowTexture();
  const pulse = 1 + Math.sin(t * 4) * 0.06;
  return (
    <group position={PROMPT_POS} rotation={[0, 0.42, 0]}>
      {/* stand */}
      <Brick w={8} l={4} h={3} color={C.yellow} />
      <Brick w={8} l={4} h={3} color={C.red} p={[0, 1.2, 0]} />
      <Brick w={6} l={2} h={3} color={C.blue} p={[0, 2.4, -1]} />
      {/* AUDIRA print brick on the front of the stand */}
      <Brick w={6} l={1} h={3} color={C.white} p={[0, 2.4, 1.5]} />
      <mesh position={[0, 3.0, 2.003]}>
        <planeGeometry args={[5.4, 1.06]} />
        <meshPhysicalMaterial {...POLISH.brickABS} map={audiraTexture()} />
      </mesh>
      {/* tablet */}
      <group position={[0, 3.6, -1]} rotation={[-0.16, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 2.35, 0]}>
          <RoundedBoxGeo args={[8.2, 5.2, 0.5]} radius={0.22} segments={4} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#22262c" />
        </mesh>
        <mesh position={[0, 2.35, 0.26]}>
          <planeGeometry args={[7.7, 4.84]} />
          <meshStandardMaterial map={scr} emissiveMap={scr} emissive="#ffffff" emissiveIntensity={1.15} roughness={0.25} />
        </mesh>
        {screen && screenMix > 0 && (
          <mesh position={[0, 2.35, 0.27]}>
            <planeGeometry args={[7.7, 4.84]} />
            <meshStandardMaterial map={screen} emissiveMap={screen} emissive="#ffffff" emissiveIntensity={1.15} roughness={0.25} transparent opacity={screenMix} />
          </mesh>
        )}
        {/* screen halo */}
        <mesh position={[0, 2.35, -0.4]}>
          <planeGeometry args={[13, 10]} />
          <meshBasicMaterial map={glow} color={new THREE.Color(0.2, 0.7, 1.0)} transparent opacity={0.55 * pulse} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 7, 3]} intensity={60} distance={16} decay={2} color="#6fd8ff" />
    </group>
  );
};

// ---------- desk + baseplate ----------
const Desk: React.FC = () => {
  const tex = useMemo(() => {
    const t0 = woodTexture().clone();
    t0.wrapS = t0.wrapT = THREE.RepeatWrapping;
    t0.repeat.set(3, 3);
    t0.needsUpdate = true;
    return t0;
  }, []);
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]}>
        <planeGeometry args={[220, 200]} />
        <meshPhysicalMaterial map={tex} roughness={0.55} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      <group position={[TOWER.x, 0, TOWER.z]} rotation={[0, TOWER.rotY, 0]}>
        <Brick w={16} l={16} h={0.5} color="#2d6a4f" />
      </group>
    </>
  );
};

// ---------- whole hook world ----------
/** Where the surf board is at frame f (the avatar rides it in the hook). */
export function boardPose(f: number) {
  const t = f / 60;
  const ap = helix(AVATAR_S + Math.sin(t * 0.8) * 0.004);
  const ahead = helix(AVATAR_S + 0.02);
  const yaw = Math.atan2(ahead.x - ap.x, ahead.z - ap.z);
  return { pos: [ap.x, ap.y + Math.sin(t * 2.4) * 0.15, ap.z] as V3, yaw, rot: [0.05, 0, -0.08] as V3 };
}

export const HookWorld: React.FC<{
  f: number;
  withCamera?: boolean;
  /** false: the film draws the avatar itself (the board keeps riding). */
  showAvatar?: boolean;
  /** 1 = cover light; lower = darker world (film payoff). */
  light?: number;
  /** World point the key light's shadow box follows (film travels far from the tower). */
  shadowCenter?: V3;
  screen?: THREE.Texture;
  screenMix?: number;
  /** 1 = background city of towers up; 0 = sunk away (film declutters close beats). */
  city?: number;
  /** 1 = full brick stream; 0 = hidden. */
  stream?: number;
}> = ({ f, withCamera = true, showAvatar = true, light = 1, shadowCenter = [0, 0, 0], screen, screenMix = 0, city = 1, stream = 1 }) => {
  const bp = boardPose(f);
  const yaw = bp.yaw;
  const keyTarget = useMemo(() => new THREE.Object3D(), []);
  const [sx, sy, sz] = shadowCenter;
  return (
    <>
      {withCamera && <HookCamera f={f} />}
      <fog attach="fog" args={[BG, 75, 150]} />
      <ambientLight intensity={0.18 * light} color="#fff4e6" />
      <hemisphereLight args={["#ffe9cc", "#1a120c", 0.45 * light]} />
      <primitive object={keyTarget} position={[sx, sy, sz]} />
      <directionalLight
        position={[sx - 18, sy + 34, sz + 26]}
        target={keyTarget}
        intensity={2.6 * light}
        color="#fff1dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={34}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[22, 18, -30]} intensity={1.4 * (0.5 + 0.5 * light)} color="#9cc8ff" />
      <pointLight position={[TOWER.x, 2.5, TOWER.z + 2]} intensity={40} distance={14} decay={2} color="#ff6a1a" />

      <Desk />
      <Tower f={f} />
      {city > 0.01 &&
        BG_TOWERS.map((d, i) => (
          <group key={i} scale={[1, city, 1]}>
            <CityTower d={d} />
          </group>
      ))}
      {stream > 0.01 && <Stream f={f} k={stream} />}
      <PromptStation f={f} screen={screen} screenMix={screenMix} />

      {/* avatar surfing the stream on an orange plate */}
      <group position={bp.pos} rotation={bp.rot}>
        <Brick w={4} l={6} h={1} color={C.orange} p={[0, -0.4, 0]} r={[0, yaw, 0]} s={1.2} />
        {showAvatar && <BlockAvatar f={f} pose="cheer" seed={3} rotation={[0, -0.12, 0]} scale={1.25} />}
      </group>
    </>
  );
};
