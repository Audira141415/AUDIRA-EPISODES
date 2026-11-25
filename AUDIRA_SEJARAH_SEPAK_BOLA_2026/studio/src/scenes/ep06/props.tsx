// EP06 film props: carved hacking legs, gents in frock coats, books, ink reveals, quill, goals, rulers.
import React, { useMemo } from "react";
import * as THREE from "three";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, type Pose, type PoseName } from "../../core/polish/Person.tsx";
import { ballGeo, makeFeatherGeo, type V3 } from "./Cover.tsx";
import { ballBump, ballMap, featherTexture, flameTexture, glowTexture } from "./coverTextures.ts";
import { canvasTex, FELL } from "./coverTextures.ts";
import { prng } from "../../core/materials/textures.ts";

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------- shared materials ----------
const matCache = new Map<string, THREE.Material>();
export const pmat = (key: string, make: () => THREE.Material) => {
  let m = matCache.get(key);
  if (!m) matCache.set(key, (m = make()));
  return m;
};
export const brassMat = () => pmat("brass", () => new THREE.MeshPhysicalMaterial({ color: "#C5A059", metalness: 0.9, roughness: 0.3 }));
export const ironMat = () => pmat("iron", () => new THREE.MeshPhysicalMaterial({ color: "#3A3836", metalness: 0.85, roughness: 0.45 }));
export const leatherMat = () => pmat("leather", () => new THREE.MeshPhysicalMaterial({ color: "#3A2416", roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 }));
export const darkWoodMat = () => pmat("darkwood", () => new THREE.MeshPhysicalMaterial({ color: "#4A2C18", roughness: 0.6, clearcoat: 0.2 }));
export const feltMat = () => pmat("felt", () => new THREE.MeshPhysicalMaterial({ color: "#1C1612", ...POLISH.fabric }));

// ---------- small canvas textures ----------
export const plateTex = (key: string, s: string, sub?: string) =>
  canvasTex(`ep06-plate-${key}`, 1024, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#9C7638");
    g.addColorStop(0.5, "#D9B76A");
    g.addColorStop(1, "#8E6A30");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(50,32,8,0.85)";
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${sub ? 96 : 120}px ${FELL}`;
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
    ctx.fillStyle = "#2A1A08";
    ctx.fillText(s, w / 2, sub ? h * 0.4 : h / 2);
    if (sub) {
      ctx.font = `italic 56px ${FELL}`;
      (ctx as unknown as { letterSpacing: string }).letterSpacing = "2px";
      ctx.fillText(sub, w / 2, h * 0.76);
    }
  });

export const netTex = () =>
  canvasTex("ep06-net", 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(245,245,240,0.9)";
    ctx.lineWidth = 3;
    for (let i = 0; i <= w; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
  });

// ---------- leather balls ----------
/** The cover's lace-up leather ball, any radius. */
export const LeatherBall: React.FC<{ position: V3; r: number; spin?: number; oval?: boolean }> = ({ position, r, spin = 0, oval = false }) => {
  const geo = useMemo(ballGeo, []);
  const k = r / 0.19;
  return (
    <group position={position} rotation={[-0.55 + spin, 0.35, 0.15]} scale={oval ? [k * 0.78, k * 1.25, k * 0.78] : k}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial map={ballMap()} bumpMap={ballBump()} bumpScale={1.4} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.45} />
      </mesh>
    </group>
  );
};

// ---------- people ----------
const COATS = ["#2B2622", "#1F2430", "#3A2A20", "#2A2E26", "#3B1F1C"];
const TROUSERS = ["#4A4038", "#2E2A26", "#5A4A3A"];
const SKINS = ["#f3cfb3", "#e6b28c", "#d09a6c", "#f0c8a8"];
const HAIRS = ["#2a1c14", "#432a1b", "#6e4426", "#1b1411", "#b88b55"];

/** Hand position (figure-local, before heading/scale) for a pose. side 1 = left, -1 = right. */
const _v = new THREE.Vector3();
const _e = new THREE.Euler();
export const handLocal = (p: Pose, side: 1 | -1, build = 1): V3 => {
  const root = side === 1 ? p.ls : p.rs;
  const bend = side === 1 ? p.le : p.re;
  _v.set(0, -0.162, 0).applyEuler(_e.set(bend, 0, 0));
  _v.add(new THREE.Vector3(0, -0.166, 0)).applyEuler(_e.set(...root));
  _v.add(new THREE.Vector3(side * 0.148 * build, 0.232, 0)).applyEuler(_e.set(...p.spine));
  _v.applyEuler(_e.set(...p.body));
  _v.y += p.lift;
  return [_v.x, _v.y, _v.z];
};
/** Figure-local point to world (heading about y, uniform scale, then position). */
export const toWorld = (local: V3, position: V3, heading: number, scale: number): V3 => {
  const c = Math.cos(heading), s = Math.sin(heading);
  const x = local[0] * scale, y = local[1] * scale, z = local[2] * scale;
  return [position[0] + x * c + z * s, position[1] + y, position[2] - x * s + z * c];
};

export const Gent: React.FC<{
  f: number;
  seed: number;
  pose?: PoseName;
  poseOverride?: Pose;
  position: V3;
  heading?: number;
  scale: number;
  hat?: boolean;
  coat?: string;
}> = ({ f, seed, pose = "stand", poseOverride, position, heading = 0, scale, hat = true, coat }) => {
  const look = useMemo(
    () => ({
      outfit: "casual" as const,
      top: coat ?? COATS[seed % COATS.length],
      bottom: TROUSERS[seed % TROUSERS.length],
      skin: SKINS[seed % SKINS.length],
      hair: HAIRS[(seed * 3) % HAIRS.length],
      hairStyle: 0 as const,
      height: 1,
      build: 1.02,
    }),
    [seed, coat],
  );
  const p = poseOverride ?? poseAt(pose, f, seed);
  const hatY = p.lift + 0.4 + 0.085;
  return (
    <group>
      <ToyPerson f={f} seed={seed} pose={pose} poseOverride={poseOverride} look={look} position={position} heading={heading} scale={scale} />
      {hat && (
        <group position={position} rotation={[0, heading, 0]} scale={scale}>
          <group position={[0, hatY, -0.01]} rotation={[-0.08 + p.head[0], p.head[1], 0]}>
            <mesh material={feltMat()} position={[0, 0.075, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.092, 0.15, 24]} />
            </mesh>
            <mesh material={feltMat()} castShadow>
              <cylinderGeometry args={[0.155, 0.155, 0.012, 32]} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.094, 0.094, 0.025, 24]} />
              <meshStandardMaterial color="#5A1E18" roughness={0.6} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

/** Fast run (walk cycle sped up) with both arms wrapped round a ball at the chest. */
export const carryPose = (f: number, seed: number): Pose => {
  const w = poseAt("walk", f * 1.7, seed);
  return { ...w, body: [0.12, 0, 0], ls: [-0.75, 0.25, 0.32], le: -1.75, rs: [-0.75, -0.25, -0.32], re: -1.75 };
};
/** Dribble: walk with the arms held back (hands off the ball). */
export const dribblePose = (f: number, seed: number): Pose => {
  const w = poseAt("walk", f * 1.5, seed);
  return { ...w, ls: [0.45, 0, 0.18], le: -0.15, rs: [0.45, 0, -0.18], re: -0.15 };
};
/** Seated with both arms up (a camp cheering). */
export const sitCheer = (f: number, seed: number, k: number): Pose => {
  const s = poseAt("sit", f, seed);
  const j = Math.max(0, Math.sin(f / 60 * 7 + seed)) * 0.15;
  return { ...s, ls: [lerp(0.25, -0.3, k), 0, lerp(0.25, 2.5 + j, k)], le: lerp(-0.3, -0.2, k), rs: [lerp(0.25, -0.3, k), 0, lerp(-0.25, -2.5 - j, k)], re: lerp(-0.3, -0.2, k) };
};
/** Holding a document up in front with both hands. */
export const holdUpPose = (f: number, seed: number, k: number): Pose => {
  const s = poseAt("stand", f, seed);
  return { ...s, ls: [lerp(0, -1.9, k), 0, lerp(0.12, 0.25, k)], le: lerp(-0.12, -0.55, k), rs: [lerp(0, -1.9, k), 0, lerp(-0.12, -0.25, k)], re: lerp(-0.12, -0.55, k) };
};
/** Kick: right leg swings back then through (k 0 = back lift, 1 = follow-through). */
export const kickPose = (f: number, seed: number, k: number): Pose => {
  const s = poseAt("stand", f, seed);
  const swing = lerp(0.9, -1.25, k);
  return { ...s, body: [0.06, 0, 0], spine: [0.1, 0, 0], ls: [-0.4, 0, 0.7], le: -0.3, rs: [0.4, 0, -0.7], re: -0.3, rh: [swing, 0, -0.05], rk: Math.max(0, 0.9 - k * 1.2) };
};
/** Catch: both arms up in front, a little hop. */
export const catchPose = (f: number, seed: number, k: number, hop: number): Pose => {
  const s = poseAt("stand", f, seed);
  return { ...s, lift: s.lift + hop, ls: [lerp(0, -2.75, k), 0, 0.22], le: lerp(-0.12, -0.35, k), rs: [lerp(0, -2.75, k), 0, -0.22], re: lerp(-0.12, -0.35, k), lk: hop * 3, rk: hop * 3 };
};

// ---------- the hacking rig (carved legs on a brass gallows) ----------
const shinProfile = (): THREE.LatheGeometry => {
  const pts: [number, number][] = [
    [0.0, 0.0], [0.036, 0.0], [0.034, 0.05], [0.04, 0.16], [0.05, 0.3], [0.054, 0.38], [0.05, 0.45], [0.044, 0.48], [0, 0.48],
  ];
  const g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40);
  g.computeVertexNormals();
  return g;
};

const Boot: React.FC<{ toward: 1 | -1; iron: boolean }> = ({ toward, iron }) => {
  // origin at the ankle; the toe points along x * toward
  const studs = useMemo(() => Array.from({ length: 6 }, (_, i) => [toward * (-0.05 + i * 0.03), -0.082, (i % 2 ? 1 : -1) * 0.022] as V3), [toward]);
  return (
    <group>
      <mesh material={leatherMat()} position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.062, 0.16, 28]} />
      </mesh>
      <mesh material={leatherMat()} position={[toward * 0.055, -0.035, 0]} castShadow>
        <RoundedBoxGeo args={[0.2, 0.075, 0.09]} radius={0.03} />
      </mesh>
      <mesh material={darkWoodMat()} position={[toward * 0.055, -0.078, 0]} castShadow>
        <RoundedBoxGeo args={[0.212, 0.016, 0.096]} radius={0.006} />
      </mesh>
      {/* laces */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[toward * 0.02, 0.0 + i * 0.04, 0.058]}>
          <boxGeometry args={[0.04, 0.006, 0.004]} />
          <meshStandardMaterial color="#D8C6A0" roughness={0.8} />
        </mesh>
      ))}
      {iron &&
        studs.map((p, i) => (
          <mesh key={i} material={ironMat()} position={p}>
            <cylinderGeometry args={[0.009, 0.011, 0.016, 10]} />
          </mesh>
        ))}
    </group>
  );
};

/** Kicker angle (radians about z at the knee): rest, wind-up, strike at hit times. */
const kickAngle = (t: number, hits: number[]) => {
  let a = 0.35;
  for (const h of hits) {
    if (t < h - 0.55) continue;
    if (t < h - 0.2) a = lerp(0.35, 0.95, (t - (h - 0.55)) / 0.35);
    else if (t < h) a = lerp(0.95, -0.2, Math.pow((t - (h - 0.2)) / 0.2, 1.6));
    else a = lerp(-0.2, 0.35, 1 - Math.exp(-(t - h) * 5));
  }
  return a;
};

export const HackingRig: React.FC<{ t: number; position: V3; hits: number[] }> = ({ t, position, hits }) => {
  const shin = useMemo(shinProfile, []);
  const grain = useSurfaceGrain(1864, 0.35, 4);
  const wood = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#C08A58", roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35, bumpMap: grain, bumpScale: 0.5 }), [grain]);
  const base = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5A3418", roughness: 0.5, clearcoat: 0.3 }), []);
  const a = kickAngle(t, hits);
  // victim recoil after each hit (damped wobble)
  let wob = 0;
  for (const h of hits) if (t >= h) wob += -0.16 * Math.exp(-(t - h) * 3.2) * Math.cos((t - h) * 14);
  const BAR = 0.98;
  return (
    <group position={position}>
      {/* plinth + brass plate */}
      <mesh material={base} position={[0, 0.03, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.74, 0.06, 0.3]} radius={0.012} />
      </mesh>
      <mesh position={[0, 0.03, 0.151]}>
        <planeGeometry args={[0.22, 0.055]} />
        <meshStandardMaterial map={plateTex("hack", "HACKING · 1863")} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* brass gallows */}
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} material={brassMat()} position={[x, BAR / 2 + 0.03, -0.08]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, BAR, 16]} />
        </mesh>
      ))}
      <mesh material={brassMat()} position={[0, BAR + 0.03, -0.08]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.7, 16]} />
      </mesh>
      {/* victim leg: hangs from the bar, faces +x (front of the shin toward the kicker) */}
      <group position={[-0.08, BAR + 0.03, -0.02]} rotation={[0, 0, wob]}>
        <mesh material={brassMat()} position={[0, -0.03, -0.03]}>
          <boxGeometry args={[0.03, 0.06, 0.06]} />
        </mesh>
        <mesh material={wood} position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.3, 28]} />
        </mesh>
        <mesh material={wood} position={[0, -0.34, 0]} castShadow>
          <sphereGeometry args={[0.06, 24, 18]} />
        </mesh>
        <mesh geometry={shin} material={wood} position={[0, -0.86, 0]} castShadow />
        {/* carved bare foot */}
        <mesh material={wood} position={[0.045, -0.89, 0]} castShadow>
          <RoundedBoxGeo args={[0.15, 0.05, 0.075]} radius={0.022} />
        </mesh>
      </group>
      {/* kicker: thigh fixed, shin + studded boot swing at the knee */}
      <group position={[0.18, BAR + 0.03, -0.02]}>
        <mesh material={brassMat()} position={[0, -0.03, -0.03]}>
          <boxGeometry args={[0.03, 0.06, 0.06]} />
        </mesh>
        <mesh material={wood} position={[0, -0.16, 0]} rotation={[0, 0, -0.12]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.28, 28]} />
        </mesh>
        <group position={[0.02, -0.32, 0]} rotation={[0, 0, a]}>
          <mesh material={wood} castShadow>
            <sphereGeometry args={[0.058, 24, 18]} />
          </mesh>
          <mesh geometry={shin} material={wood} position={[0, -0.48, 0]} castShadow />
          <group position={[0, -0.44, 0]}>
            <Boot toward={-1} iron />
          </group>
        </group>
      </group>
      <ImpactBurst t={t} hits={hits} at={[-0.04, 0.28, 0.05]} />
    </group>
  );
};

/** Wood chips + a gold flash at each hit (no blood). */
const ImpactBurst: React.FC<{ t: number; hits: number[]; at: V3 }> = ({ t, hits, at }) => {
  const chips = useMemo(() => {
    const r = prng(606);
    return Array.from({ length: 16 }, () => ({ v: [-(0.4 + r() * 0.8), 0.2 + r() * 0.9, (r() - 0.5) * 0.9] as V3, s: 0.006 + r() * 0.008, spin: r() * 6 }));
  }, []);
  const h = [...hits].reverse().find((x) => t >= x);
  if (h === undefined || t - h > 0.9) return null;
  const dt = t - h;
  const flash = Math.exp(-dt * 9);
  return (
    <group position={at}>
      <sprite scale={[0.5 * (0.6 + dt), 0.5 * (0.6 + dt), 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={glowTexture()} color="#FFD58A" transparent opacity={flash * 0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      {chips.map((c, i) => (
        <mesh key={i} position={[c.v[0] * dt * 0.45, c.v[1] * dt * 0.45 - 1.6 * dt * dt * 0.45, c.v[2] * dt * 0.45]} rotation={[c.spin * dt * 3, c.spin, 0]} scale={1 - dt}>
          <boxGeometry args={[c.s, c.s * 0.5, c.s * 1.4]} />
          <meshStandardMaterial color="#D7A86E" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- books ----------
export const StandingBook: React.FC<{ position: V3; size: V3; spine: THREE.Texture; leather: string; tilt?: number }> = ({ position, size, spine, leather, tilt = 0 }) => {
  const [w, h, d] = size;
  return (
    <group position={[position[0], position[1] + h / 2, position[2]]} rotation={[0, 0, tilt]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.008} />
        <meshPhysicalMaterial color={leather} roughness={0.6} clearcoat={0.2} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.0015]}>
        <planeGeometry args={[w * 0.96, h * 0.98]} />
        <meshPhysicalMaterial map={spine} roughness={0.55} clearcoat={0.25} />
      </mesh>
    </group>
  );
};

export const OpenBook: React.FC<{ position: V3; w: number; d: number; tex: THREE.Texture; leather: string; rotY?: number }> = ({ position, w, d, tex, leather, rotY = 0 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[w + 0.03, 0.016, d + 0.03]} radius={0.006} />
      <meshPhysicalMaterial color={leather} roughness={0.6} clearcoat={0.2} />
    </mesh>
    <mesh position={[0, 0.026, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, 0.02, d]} />
      <meshStandardMaterial color="#D9C9A2" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.0365, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshPhysicalMaterial {...POLISH.paper} map={tex} />
    </mesh>
  </group>
);

// ---------- ink reveal (text written left to right) ----------
export const InkReveal: React.FC<{ tex: THREE.Texture; w: number; h: number; p: number; position: V3; rotation?: V3; quill?: boolean; t?: number }> = ({ tex, w, h, p, position, rotation = [-Math.PI / 2, 0, 0], quill = false, t = 0 }) => {
  const map = useMemo(() => {
    const m = tex.clone();
    m.needsUpdate = true;
    return m;
  }, [tex]);
  const k = Math.max(0.0005, Math.min(1, p));
  map.repeat.set(k, 1);
  map.offset.set(0, 0);
  const writing = quill && p > 0 && p < 1;
  return (
    <group position={position} rotation={rotation}>
      {p > 0 && (
        <mesh position={[-w / 2 + (w * k) / 2, 0, 0.001]} scale={[k, 1, 1]} renderOrder={2}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={map} transparent depthWrite={false} roughness={0.35} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      )}
      {writing && <Quill nib={[-w / 2 + w * k, Math.sin(t * 40) * h * 0.22, 0]} />}
    </group>
  );
};

/** Quill with the nib at `nib` (in the parent's plane space: x right, y up the page, z out). */
export const Quill: React.FC<{ nib: V3; scale?: number }> = ({ nib, scale = 1 }) => {
  const featherGeo = useMemo(makeFeatherGeo, []);
  return (
    <group position={nib} scale={scale}>
      <group rotation={[0.9, -0.5, 0.35]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.004, 0.0015, 0.2, 8]} />
          <meshStandardMaterial color="#EDE2C8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.27, 0]} rotation={[0, -0.25, 0]}>
          <primitive object={featherGeo} attach="geometry" />
          <meshStandardMaterial map={featherTexture()} transparent alphaTest={0.25} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- small candle (no shadow light) ----------
export const SmallCandle: React.FC<{ position: V3; t: number; light?: number; scale?: number }> = ({ position, t, light = 0.9, scale = 1 }) => {
  const fl = 1 + Math.sin(t * 13 + position[0] * 7) * 0.06 + Math.sin(t * 29 + position[2] * 3) * 0.04;
  return (
    <group position={position} scale={scale}>
      <mesh material={brassMat()} position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.02, 24]} />
      </mesh>
      <mesh material={brassMat()} position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.02, 0.1, 16]} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.019, 0.1, 20]} />
        <meshPhysicalMaterial color="#F0E2C2" roughness={0.45} emissive="#5A2A08" emissiveIntensity={0.3} />
      </mesh>
      <sprite position={[0, 0.235, 0]} scale={[0.035 * fl, 0.08 * fl, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={flameTexture()} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite position={[0, 0.23, 0]} scale={[0.3, 0.3, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={glowTexture()} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      {light > 0 && <pointLight position={[0, 0.25, 0]} intensity={light * fl} distance={1.8} decay={1.6} color="#FFB868" />}
    </group>
  );
};

// ---------- goal: 1863 posts (m = 0) morph to a modern goal (m = 1) ----------
export const GoalMorph: React.FC<{ position: V3; halfW: number; m: number; vintageH: number; modernH: number; depth: number; facing: 1 | -1 }> = ({ position, halfW, m, vintageH, modernH, depth, facing }) => {
  const h = lerp(vintageH, modernH, m);
  const r = lerp(0.014, 0.01, m);
  const postMat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.5, clearcoat: 0.3 }), []);
  postMat.color.set("#9A6A3C").lerp(new THREE.Color("#F2F2EC"), m);
  const bar = Math.max(0, (m - 0.35) / 0.65);
  const net = Math.max(0, (m - 0.6) / 0.4);
  const nt = netTex();
  return (
    <group position={position}>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * halfW]}>
          <mesh material={postMat} position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[r, r, h, 16]} />
          </mesh>
          {m < 0.5 && (
            <mesh position={[facing * 0.035, h - 0.02, 0]} scale={1 - m * 2}>
              <boxGeometry args={[0.07, 0.04, 0.002]} />
              <meshStandardMaterial color="#8A2E1C" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}
      {bar > 0 && (
        <mesh material={postMat} position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, bar, 1]} castShadow>
          <cylinderGeometry args={[r, r, halfW * 2, 16]} />
        </mesh>
      )}
      {net > 0 && (
        <group>
          {/* back, roof, sides */}
          <mesh position={[-facing * depth, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[halfW * 2, h]} />
            <meshStandardMaterial map={nt} transparent opacity={net * 0.8} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[-facing * depth / 2, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[depth, halfW * 2]} />
            <meshStandardMaterial map={nt} transparent opacity={net * 0.8} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[-facing * depth / 2, h / 2, s * halfW]}>
              <planeGeometry args={[depth, h]} />
              <meshStandardMaterial map={nt} transparent opacity={net * 0.8} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/** Brass measuring rule from a to b along one axis with ticks, revealed by p. */
export const BrassRule: React.FC<{ from: V3; to: V3; p: number; ticks: number; y?: number; thick?: number }> = ({ from, to, p, ticks, thick = 0.012 }) => {
  if (p <= 0.001) return null;
  const dx = to[0] - from[0], dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(-dz, dx);
  return (
    <group position={from} rotation={[0, ang, 0]}>
      <mesh material={brassMat()} position={[(len * p) / 2, thick / 2, 0]} castShadow>
        <boxGeometry args={[len * p, thick, thick * 2.2]} />
      </mesh>
      {Array.from({ length: ticks + 1 }, (_, i) => (i / ticks <= p + 1e-6 ? (
        <mesh key={i} material={brassMat()} position={[(len * i) / ticks, thick * 1.6, 0]}>
          <boxGeometry args={[thick * 0.35, thick * (i === 0 || i === ticks ? 2.6 : 1.4), thick * 2.2]} />
        </mesh>
      ) : null))}
    </group>
  );
};

/** Flat ink arrow on the ground along a quadratic arc, drawn up to p. */
export const InkArrow: React.FC<{ a: V3; c: V3; b: V3; p: number; color?: string; width?: number }> = ({ a, c, b, p, color = "#8A2E1C", width = 0.03 }) => {
  const geo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a), new THREE.Vector3(...c), new THREE.Vector3(...b));
    return new THREE.TubeGeometry(curve, 48, width / 2, 6, false);
  }, [a, c, b, width]);
  const head = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a), new THREE.Vector3(...c), new THREE.Vector3(...b));
    return { pos: curve.getPoint(1), dir: curve.getTangent(1) };
  }, [a, c, b]);
  if (p <= 0.001) return null;
  const idx = geo.index!.count;
  geo.setDrawRange(0, Math.floor((idx * Math.min(1, p)) / 6) * 6);
  const ang = Math.atan2(head.dir.x, head.dir.z);
  return (
    <group>
      <mesh geometry={geo} scale={[1, 0.3, 1]}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {p >= 0.98 && (
        <group position={[head.pos.x, 0.005, head.pos.z]} rotation={[0, ang, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.3]}>
            <coneGeometry args={[width * 1.6, width * 3.2, 3]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};
