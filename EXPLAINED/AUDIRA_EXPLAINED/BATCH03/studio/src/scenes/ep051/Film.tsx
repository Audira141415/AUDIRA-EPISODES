// AE-051 film: "Bagaimana Kolam Renang Umum Tetap Bersih?" in FLUIDFORGE.
// One persistent 3D world (the cover's cutaway pool + plant room) and one continuous camera path;
// every shot, beat and caption is keyed to timeline.json (Audio Master Clock).
// Deterministic: all motion derives from useCurrentFrame() and seeded PRNGs.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import {
  Backdrop,
  Box,
  C,
  Cap,
  ChlorineOrb,
  Chlorinator,
  deckMat,
  Germ,
  Layer,
  mulberry,
  OPEN,
  P,
  Pipe,
  Pump,
  sectionMat,
  tileMat,
  useLogoTexture,
  ZP,
  type V3,
} from "./Cover.tsx";

type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const SEC = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
const CLIPS = TL.clips as Clip[];
export const FILM_TOTAL = TL.total;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

// word time lookup (first occurrence of a word inside a clip)
const W = (clip: string, word: string, nth = 0) => {
  const c = CLIPS.find((x) => x.id === clip)!;
  const hits = c.words.filter((x) => x.w.toLowerCase().replace(/[.,?!]/g, "") === word.toLowerCase());
  return (hits[nth] ?? c.words[0]).s;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(ramp(t, a - f, a), 1 - ramp(t, b, b + f));

// ---------- camera path (Audio-clock keyed) ----------
type Key = { t: number; pos: V3; tgt: V3; fov: number };
const K = (t: number, pos: V3, tgt: V3, fov = 34): Key => ({ t, pos, tgt, fov });
const S = SEC;
const KEYS: Key[] = [
  // HOOK: close on the crowd, crane up to show the whole packed pool, then dive to the clear surface
  K(0, [0.6, 2.25, 1.9], [0.1, 0.72, 0.0], 36),
  K(W("l02", "kenapa") - 0.2, [0.15, 4.2, 3.3], [0, 0.55, -0.05], 36),
  K(S.HOOK[1], [0.35, 1.0, 1.15], [0.05, 0.72, -0.25], 36),
  K(S.KONTEKS[0], [0.3, 0.98, 1.05], [0.05, 0.72, -0.25], 36),
  // KONTEKS: pull out to the full cutaway (pool + plant room), slow orbit while the loop lights up
  K(S.KONTEKS[0] + 1.1, [0.9, 3.5, 10.8], [0, -0.85, 0.3]),
  K(S.KONTEKS[1] + 0.1, [-0.6, 3.2, 10.6], [0, -0.85, 0.3]),
  // MEKANISME: skimmer -> drain -> pump -> filter -> dosing -> return
  K(S.MEKANISME[0] + 0.35, [0.45, 1.4, 1.7], [-1.0, 0.74, 0.5]),
  K(W("l05", "sisanya") - 0.3, [0.3, 1.32, 1.6], [-1.05, 0.74, 0.55]),
  K(W("l05", "sisanya") + 0.4, [0.45, 1.45, 1.9], [0, 0.15, 0.35]),
  K(W("l06", "pompa") - 0.2, [0.35, 1.35, 1.8], [0, 0.15, 0.35]),
  K(W("l06", "pompa") + 0.45, [-0.35, -1.05, 2.6], [-0.95, -1.6, 0.85]),
  K(W("l06", "filter") + 0.05, [-0.25, -1.0, 2.5], [-0.9, -1.6, 0.85]),
  K(W("l06", "filter") + 0.7, [1.8, -0.7, 2.9], [1.0, -1.3, 0.5]),
  K(W("l06", "lalu") - 0.3, [1.65, -0.72, 2.75], [1.0, -1.3, 0.5]),
  K(W("l06", "lalu") + 0.4, [1.0, 0.25, 2.95], [1.7, -0.2, 1.1]),
  K(W("l06", "sebelum") - 0.3, [0.95, 0.2, 2.8], [1.7, -0.2, 1.1]),
  K(W("l06", "sebelum") + 0.45, [-0.3, 1.25, 1.6], [1.2, 0.55, 0.55]),
  K(S.MEKANISME[1] + 0.2, [-0.2, 1.2, 1.55], [1.2, 0.55, 0.55]),
  // REVEAL: surface level among swimmers (chloramine), then zoom-through into a micro view
  K(S.REVEAL[0] + 0.3, [-0.2, 1.12, 1.75], [0, 0.82, 0.1]),
  K(W("l08", "dan") - 0.5, [0.25, 1.08, 1.65], [0.05, 0.8, 0.05]),
  K(W("l08", "kuman") - 0.1, [0.6, 0.6, 0.92], [0.45, 0.5, 0.45]),
  K(S.REVEAL[1] + 0.1, [0.52, 0.6, 0.92], [0.45, 0.5, 0.45]),
  // PAYOFF: out through the glass, crane up to the test board on the back deck
  K(S.PAYOFF[0] + 0.6, [0.25, 1.85, 3.4], [0, 1.5, -1.1], 36),
  K(S.PAYOFF[1], [-0.15, 1.8, 3.0], [0, 1.5, -1.1], 36),
  // OUTRO: rinse shower on the deck, then pull back to the hero framing (AUDIRA plate)
  K(S.OUTRO[0] + 0.2, [-0.95, 1.35, 0.15], [-1.55, 1.08, -0.95]),
  K(W("l11", "ini") - 0.2, [-0.85, 1.32, 0.1], [-1.55, 1.08, -0.95]),
  K(OUTRO_AT - 0.3, [0.9, 3.6, 10.8], [0, -0.75, 0.3]),
  K(TL.total + 0.1, [0.5, 3.5, 10.6], [0, -0.75, 0.3]),
];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = smooth(clamp01((t - a.t) / Math.max(1e-3, b.t - a.t)));
  const l = (x: V3, y: V3) => x.map((v, j) => v + (y[j] - v) * u) as V3;
  return { pos: l(a.pos, b.pos), tgt: l(a.tgt, b.tgt), fov: a.fov + (b.fov - a.fov) * u };
};

const CamRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const c = camAt(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.pos);
    cam.fov = c.fov;
    cam.near = 0.02;
    cam.far = 80;
    cam.lookAt(...c.tgt);
    cam.updateProjectionMatrix();
  });
  return null;
};

const project = (p: V3, t: number, w: number, h: number) => {
  const c = camAt(t);
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.02, 80);
  cam.position.set(...c.pos);
  cam.lookAt(...c.tgt);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, front: v.z < 1 };
};

// ---------- pool (animated caustics + rippled surface) ----------
const CAUSTIC_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
void main() {
  vec2 uv = vUv * vec2(2.2, 1.4);
  float TAU = 6.28318;
  vec2 p = mod(uv * TAU, TAU) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float t = uTime * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  float v = clamp(pow(abs(c), 8.0), 0.0, 1.0);
  vec3 base = vec3(0.03, 0.30, 0.62);
  gl_FragColor = vec4(base + v * vec3(0.85, 0.72, 0.42), 1.0);
}`;
const CAUSTIC_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const CausticFloor: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: CAUSTIC_VERT, fragmentShader: CAUSTIC_FRAG, uniforms: { uTime: { value: 0 } } }), []);
  mat.uniforms.uTime.value = t * 0.6 + 3.1;
  return (
    <mesh position={[0, P.y0 - 0.005, (P.z0 + P.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <planeGeometry args={[P.x1 - P.x0, P.z1 - P.z0]} />
    </mesh>
  );
};

const WaterSurface: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(P.x1 - P.x0, P.z1 - P.z0, 90, 60);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y =
      Math.sin(x * 5.2 + t * 1.7) * 0.012 +
      Math.sin(z * 7.1 - t * 1.3 + x * 1.8) * 0.01 +
      Math.sin(Math.hypot(x - 0.9, z - 0.2) * 14 - t * 4) * 0.008 * Math.exp(-Math.hypot(x - 0.9, z - 0.2) * 1.4);
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[(P.x0 + P.x1) / 2, P.water, (P.z0 + P.z1) / 2]} layers={FX_LAYER}>
      <meshPhysicalMaterial color="#7fd8ff" transparent opacity={0.42} roughness={0.02} metalness={0.25} clearcoat={1} envMapIntensity={1.6} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Pool: React.FC<{ t: number }> = ({ t }) => {
  const zf = P.z1;
  return (
    <group>
      <Box a={[-1.75, -0.3, -1.15]} b={[P.x0 - 0.02, P.y1, zf]}>{sectionMat}</Box>
      <Box a={[P.x1 + 0.02, -0.3, -1.15]} b={[1.75, P.y1, zf]}>{sectionMat}</Box>
      <Box a={[P.x0, -0.3, -1.15]} b={[P.x1, P.y1, P.z0 - 0.02]}>{sectionMat}</Box>
      <Box a={[P.x0, -0.3, P.z0]} b={[P.x1, P.y0 - 0.02, zf]}>{sectionMat}</Box>
      <Box a={[-1.78, P.y1, -1.18]} b={[P.x0 - 0.02, P.y1 + 0.05, zf]}>{deckMat}</Box>
      <Box a={[P.x1 + 0.02, P.y1, -1.18]} b={[1.78, P.y1 + 0.05, zf]}>{deckMat}</Box>
      <Box a={[P.x0 - 0.02, P.y1, -1.18]} b={[P.x1 + 0.02, P.y1 + 0.05, P.z0 - 0.02]}>{deckMat}</Box>
      <Box a={[P.x0 - 0.02, P.y0, P.z0]} b={[P.x0, P.y1, zf]}>{tileMat}</Box>
      <Box a={[P.x1, P.y0, P.z0]} b={[P.x1 + 0.02, P.y1, zf]}>{tileMat}</Box>
      <Box a={[P.x0, P.y0, P.z0 - 0.02]} b={[P.x1, P.y1, P.z0]}>{tileMat}</Box>
      <CausticFloor t={t} />
      {[-0.45, 0.1, 0.65].map((z) => (
        <Box key={z} a={[-1.0, P.y0, z - 0.035]} b={[1.0, P.y0 + 0.004, z + 0.035]}>
          <meshStandardMaterial color="#0d3d63" roughness={0.3} />
        </Box>
      ))}
      <mesh position={[0, (P.y0 + P.water) / 2, (P.z0 + zf) / 2]} layers={FX_LAYER}>
        <boxGeometry args={[P.x1 - P.x0 - 0.01, P.water - P.y0, zf - P.z0 - 0.01]} />
        <meshPhysicalMaterial color={C.water} transparent opacity={0.3} roughness={0.05} depthWrite={false} />
      </mesh>
      <mesh position={[0, (P.y0 + P.water) / 2, zf + 0.004]} layers={FX_LAYER}>
        <planeGeometry args={[P.x1 - P.x0, P.water - P.y0]} />
        <meshBasicMaterial color="#0aa6ff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <WaterSurface t={t} />
      {[
        [[P.x0 - 0.03, -0.3, zf], [P.x0 - 0.01, P.y1 + 0.05, zf + 0.012]],
        [[P.x1 + 0.01, -0.3, zf], [P.x1 + 0.03, P.y1 + 0.05, zf + 0.012]],
        [[P.x0 - 0.03, P.y0 - 0.03, zf], [P.x1 + 0.03, P.y0 - 0.01, zf + 0.012]],
        [[-1.78, P.y1 + 0.05, zf], [P.x0 - 0.01, P.y1 + 0.065, zf + 0.012]],
        [[P.x1 + 0.01, P.y1 + 0.05, zf], [1.78, P.y1 + 0.065, zf + 0.012]],
      ].map(([a, b], i) => (
        <Box key={i} a={a as V3} b={b as V3}>
          <meshBasicMaterial color={C.cyan} toneMapped={false} />
        </Box>
      ))}
      {/* skimmer mouth at the waterline, main drain grate at the deepest point, return inlet */}
      <Box a={[P.x0 - 0.02, P.water - 0.08, 0.5]} b={[P.x0 + 0.03, P.water + 0.04, 0.78]}>
        <meshStandardMaterial color="#1c2733" metalness={0.9} roughness={0.2} />
      </Box>
      <mesh position={[0, P.y0 + 0.006, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 40]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.12} />
      </mesh>
      {[-0.09, -0.045, 0, 0.045, 0.09].map((dx) => (
        <Box key={dx} a={[dx - 0.008, P.y0 + 0.007, 0.25]} b={[dx + 0.008, P.y0 + 0.012, 0.45]}>
          <meshStandardMaterial color="#132231" />
        </Box>
      ))}
      <mesh position={[P.x1 - 0.02, 0.55, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.07, 0.07, 28]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.08} />
      </mesh>
      {[-0.95, -0.7].map((x) => (
        <mesh key={x} position={[x, P.y1 + 0.2, P.z0 + 0.05]}>
          <torusGeometry args={[0.16, 0.018, 12, 40, Math.PI]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- swimmers (instanced, faceless toy figures) ----------
const N_SWIM = 150;
const swimCount = (t: number) => {
  if (t < S.HOOK[1] - 1.2) return N_SWIM;
  if (t < S.KONTEKS[0] + 0.6) return N_SWIM * (1 - ramp(t, S.HOOK[1] - 1.2, S.KONTEKS[0] + 0.6)) + 18 * ramp(t, S.HOOK[1] - 1.2, S.KONTEKS[0] + 0.6);
  if (t < S.MEKANISME[0]) return 18;
  if (t < S.REVEAL[0] - 0.6) return 8;
  if (t < S.PAYOFF[0]) return 8 + 37 * ramp(t, S.REVEAL[0] - 0.6, S.REVEAL[0]);
  return 30;
};
const SUIT = ["#ff5f8f", "#ffd166", "#5ff4ff", "#9b7bff", "#ff8a3d", "#7dffb0", "#ffffff", "#3d8bff"];
const swimmers = (() => {
  const rnd = mulberry(5151);
  return Array.from({ length: N_SWIM }, (_, i) => ({
    lane: P.z0 + 0.12 + rnd() * (P.z1 - P.z0 - 0.24),
    ph: rnd(),
    sp: 0.02 + rnd() * 0.035,
    col: SUIT[i % SUIT.length],
    cap: rnd() > 0.5 ? "#1b2a3a" : SUIT[(i * 3 + 1) % SUIT.length],
    bob: rnd() * 6,
    // a few people stand/float vertically (heads + shoulders only)
    upright: rnd() < 0.3,
  }));
})();
export const swimmerPos = (i: number, t: number) => {
  const s = swimmers[i];
  const span = P.x1 - P.x0 - 0.24;
  const u = (s.ph + t * s.sp) % 2;
  const tri = u < 1 ? u : 2 - u;
  const dir = s.upright ? 0 : u < 1 ? 1 : -1;
  const x = P.x0 + 0.12 + tri * span;
  return { x, z: s.lane, dir };
};

const Swimmers: React.FC<{ t: number }> = ({ t }) => {
  const body = useMemo(() => new THREE.CapsuleGeometry(0.022, 0.085, 6, 12), []);
  const head = useMemo(() => new THREE.SphereGeometry(0.02, 16, 12), []);
  const arm = useMemo(() => new THREE.CapsuleGeometry(0.008, 0.06, 4, 8), []);
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 }),
      head: new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.2 }),
      arm: new THREE.MeshStandardMaterial({ color: "#f1c9a5", roughness: 0.5 }),
    }),
    [],
  );
  const meshes = useMemo(() => {
    const b = new THREE.InstancedMesh(body, mats.body, N_SWIM);
    const h = new THREE.InstancedMesh(head, mats.head, N_SWIM);
    const a = new THREE.InstancedMesh(arm, mats.arm, N_SWIM * 2);
    swimmers.forEach((s, i) => {
      b.setColorAt(i, new THREE.Color(s.col));
      h.setColorAt(i, new THREE.Color(s.cap));
    });
    return { b, h, a };
  }, [body, head, arm, mats]);
  const n = swimCount(t);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (let i = 0; i < N_SWIM; i++) {
    const s = swimmers[i];
    const vis = clamp01(n - i);
    const sc = vis * 1;
    const { x, z, dir } = swimmerPos(i, t);
    const y = P.water - 0.004 + Math.sin(t * 2.2 + s.bob) * 0.004;
    if (s.upright) {
      e.set(0, 0, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y - 0.04, z), q, new THREE.Vector3(sc, sc, sc));
      meshes.b.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, y + 0.035, z), q, new THREE.Vector3(sc, sc, sc));
      meshes.h.setMatrixAt(i, m);
      for (let k = 0; k < 2; k++) {
        e.set(0, 0, (k ? 1 : -1) * (1.2 + Math.sin(t * 2 + s.bob) * 0.3));
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(x + (k ? 0.04 : -0.04), y + 0.005, z), q, new THREE.Vector3(sc, sc, sc));
        meshes.a.setMatrixAt(i * 2 + k, m);
      }
    } else {
      e.set(0, 0, (Math.PI / 2) * dir);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sc, sc, sc));
      meshes.b.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x + dir * 0.075, y + 0.008, z), q, new THREE.Vector3(sc, sc, sc));
      meshes.h.setMatrixAt(i, m);
      for (let k = 0; k < 2; k++) {
        const stroke = t * 5 * (0.8 + s.sp * 10) + s.bob + k * Math.PI;
        e.set(Math.sin(stroke) * 0.9, 0, (Math.PI / 2) * dir + Math.cos(stroke) * 0.6);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(x + dir * 0.05, y + 0.006, z + (k ? 0.03 : -0.03)), q, new THREE.Vector3(sc, sc, sc));
        meshes.a.setMatrixAt(i * 2 + k, m);
      }
    }
  }
  meshes.b.instanceMatrix.needsUpdate = true;
  meshes.h.instanceMatrix.needsUpdate = true;
  meshes.a.instanceMatrix.needsUpdate = true;
  return (
    <group>
      <primitive object={meshes.b} />
      <primitive object={meshes.h} />
      <primitive object={meshes.a} />
    </group>
  );
};

// ---------- circulation (film routing: top-mount multiport valve on the filter) ----------
const FILM_PIPES: { pts: V3[]; color: string; glow: number; speed: number }[] = [
  { pts: [[-1.3, 0.76, 0.64], [-1.55, 0.74, 0.9], [-1.6, 0.6, ZP], [-1.6, -0.6, ZP], [-1.45, -1.25, ZP], [-1.15, -1.55, 0.95]], color: "#3bd6c6", glow: 0.9, speed: 0.06 },
  { pts: [[0, 0.1, 0.35], [0, -0.12, 0.6], [-0.35, -0.28, ZP], [-1.0, -0.4, ZP], [-1.6, -0.55, ZP]], color: "#3bd6c6", glow: 0.9, speed: 0.06 },
  { pts: [[-0.6, -1.62, 0.95], [-0.1, -1.68, ZP], [0.45, -1.35, ZP], [0.75, -0.6, 0.85], [0.95, -0.48, 0.62]], color: "#58e8ff", glow: 1.1, speed: 0.07 },
  { pts: [[1.15, -0.48, 0.5], [1.3, -0.4, 0.85], [1.6, -0.15, ZP], [1.62, 0.35, ZP], [1.55, 0.6, 0.9], [1.3, 0.55, 0.6]], color: "#8ff9ff", glow: 1.6, speed: 0.07 },
];
const pipeOn = (i: number, t: number) => ramp(t, W("l04", "diputar") + i * 0.35, W("l04", "diputar") + i * 0.35 + 0.4);

const PumpFilm: React.FC<{ t: number; spin: number }> = ({ t, spin }) => (
  <group>
    <Pump />
    {/* impeller seen through a window on the housing */}
    <group position={[-0.95, -1.62, 1.06]} rotation={[0, 0, -t * (2 + spin * 10)]}>
      <mesh layers={FX_LAYER}>
        <circleGeometry args={[0.17, 40]} />
        <meshPhysicalMaterial color="#bfefff" transparent opacity={0.25} roughness={0.02} metalness={0.3} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <mesh key={k} rotation={[0, 0, (k * Math.PI) / 3]} position={[0, 0, -0.01]}>
          <boxGeometry args={[0.025, 0.14, 0.01]} />
          <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={0.5 + spin} metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
    </group>
  </group>
);

const SandFilterFilm: React.FC<{ t: number }> = ({ t }) => {
  const R = 0.44;
  const fill = ramp(t, W("l06", "filter"), W("l06", "lalu")); // dirt accumulates while VO talks about the filter
  const dirt = useMemo(() => {
    const rnd = mulberry(851);
    return Array.from({ length: 90 }, () => {
      const a = OPEN / 2 + 0.25 + rnd() * (Math.PI * 2 - OPEN - 0.5);
      const rr = 0.06 + rnd() * 0.3;
      return { x: Math.sin(a) * rr, z: Math.cos(a) * rr, y0: 0.5, y1: 0.09 + rnd() * 0.05, s: 0.01 + rnd() * 0.016, d: rnd(), germ: rnd() < 0.3 };
    });
  }, []);
  return (
    <group position={[1.05, -1.55, 0.5]} rotation={[0, -0.2, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[R, R, 1.0, 64, 1, true, OPEN / 2, Math.PI * 2 - OPEN]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[R, 64, 32, OPEN / 2 + Math.PI / 2, Math.PI * 2 - OPEN, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[R * 0.92, R * 0.7, 0.14, 48]} />
        <meshStandardMaterial color="#1a2836" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* multiport valve + pressure gauge on top */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.1, 40]} />
        <meshStandardMaterial color="#9fb3c4" metalness={1} roughness={0.15} />
      </mesh>
      <mesh position={[0, 1.1, 0]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.04]} />
        <meshStandardMaterial color="#1a2836" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.09, 1.08, 0.08]} rotation={[-0.6, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.015, 24]} />
        <meshStandardMaterial color="#e8f6ff" emissive="#5ff4ff" emissiveIntensity={0.3} />
      </mesh>
      {/* internal standpipe to the laterals at the bottom */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.4, 16]} />
        <meshStandardMaterial color="#cfe3f0" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[0, -0.37, 0]} rotation={[0, (k * Math.PI) / 4, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 10]} />
          <meshStandardMaterial color="#cfe3f0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <Layer r={R - 0.02} y0={-0.42} y1={-0.27} color={C.gravel} />
      <Cap r={R - 0.02} y0={-0.42} y1={-0.27} color="#6f7b88" />
      <Layer r={R - 0.02} y0={-0.27} y1={0.12} color={C.sand} />
      <Cap r={R - 0.02} y0={-0.27} y1={0.12} color="#d9bd7c" />
      <mesh position={[0, 0.33, 0]} layers={FX_LAYER}>
        <cylinderGeometry args={[R - 0.02, R - 0.02, 0.42, 48, 1, false, OPEN / 2, Math.PI * 2 - OPEN]} />
        <meshPhysicalMaterial color={C.water} transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* dirt sinks onto the sand and stays there */}
      {dirt.map((g, i) => {
        const vis = fill * dirt.length > i ? 1 : 0;
        const fall = ramp(fill * dirt.length - i, 0, 6);
        const y = g.y0 + (g.y1 - g.y0) * smooth(fall);
        return vis ? (
          <mesh key={i} position={[g.x, y, g.z]}>
            <icosahedronGeometry args={[g.s, 0]} />
            <meshStandardMaterial color={g.germ ? C.germ : "#6b4e33"} emissive={g.germ ? C.germ : "#000"} emissiveIntensity={g.germ ? 0.6 : 0} roughness={0.7} />
          </mesh>
        ) : null;
      })}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2.2) * 0.18, 0.45 - ((t * 0.25 + i / 3) % 1) * 0.28, 0.22]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.04, 0.09, 16]} />
          <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
};

// pH doser: small tank + dosing line into the return riser
const PhDoser: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, W("l06", "penyeimbang") - 0.2, W("l06", "penyeimbang") + 0.3);
  const line = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(1.88, -0.32, 1.2), new THREE.Vector3(1.8, -0.18, 1.2), new THREE.Vector3(1.66, -0.1, ZP + 0.02)]), []);
  return (
    <group>
      <group position={[1.88, -0.5, 1.2]}>
        <mesh>
          <cylinderGeometry args={[0.085, 0.085, 0.26, 32]} />
          <meshPhysicalMaterial color="#e9e3ff" transparent opacity={0.35} roughness={0.03} clearcoat={1} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.072, 0.072, 0.17, 32]} />
          <meshStandardMaterial color="#9b7bff" emissive="#9b7bff" emissiveIntensity={0.35} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.04, 32]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} />
        </mesh>
      </group>
      <mesh>
        <tubeGeometry args={[line, 30, 0.012, 8, false]} />
        <meshStandardMaterial color="#cbbcff" emissive="#9b7bff" emissiveIntensity={0.4 + a} />
      </mesh>
      {a > 0 &&
        [0, 1, 2].map((k) => {
          const u = (t * 0.7 + k / 3) % 1;
          return (
            <mesh key={k} position={line.getPointAt(u)}>
              <sphereGeometry args={[0.018, 14, 10]} />
              <meshStandardMaterial color="#ffffff" emissive="#b9a6ff" emissiveIntensity={2} />
            </mesh>
          );
        })}
    </group>
  );
};

// in-pool flow: big arrow from the surface to the skimmer, thin arrow to the drain, return jet
const ArrowFlow: React.FC<{ pts: V3[]; t: number; a: number; r: number; color: string; n?: number; speed?: number }> = ({ pts, t, a, r, color, n = 7, speed = 0.35 }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts]);
  if (a <= 0.01) return null;
  return (
    <group>
      <mesh layers={FX_LAYER}>
        <tubeGeometry args={[curve, 80, r * a, 12, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.45 * a} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const u = (i / n + t * speed) % 1;
        const p = curve.getPointAt(u);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(u));
        return (
          <mesh key={i} position={p} quaternion={q} scale={a}>
            <coneGeometry args={[r * 1.6, r * 4, 14]} />
            <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={1.6} />
          </mesh>
        );
      })}
    </group>
  );
};

const SKIM: V3 = [-1.28, 0.78, 0.64];
const Debris: React.FC<{ t: number }> = ({ t }) => {
  const items = useMemo(() => {
    const rnd = mulberry(4051);
    return Array.from({ length: 36 }, (_, i) => ({
      p: [-0.9 + rnd() * 1.9, P.water + 0.004, -0.6 + rnd() * 1.4] as V3,
      kind: i % 3,
      rot: rnd() * 6,
      d: rnd() * 0.9,
    }));
  }, []);
  const bottom = useMemo(() => {
    const rnd = mulberry(4052);
    return Array.from({ length: 12 }, () => ({ p: [-0.7 + rnd() * 1.4, P.y0 + 0.02, -0.5 + rnd() * 1.2] as V3, d: rnd() * 0.6 }));
  }, []);
  const t0 = W("l05", "permukaan") - 0.4;
  const b0 = W("l05", "saluran") - 0.3;
  return (
    <group>
      {items.map((it, i) => {
        const u = smooth(ramp(t, t0 + it.d, t0 + it.d + 2.2));
        if (t < S.MEKANISME[0] - 0.5 || u >= 1 || t > S.MEKANISME[1]) return null;
        const p: V3 = [it.p[0] + (SKIM[0] - it.p[0]) * u, it.p[2] === 0 ? 0 : P.water + 0.004, it.p[2] + (SKIM[2] - it.p[2]) * u];
        return (
          <mesh key={i} position={p} rotation={[0, it.rot + u * 3, 0]}>
            {it.kind === 0 ? <boxGeometry args={[0.07, 0.004, 0.004]} /> : it.kind === 1 ? <circleGeometry args={[0.022, 12]} /> : <sphereGeometry args={[0.009, 10, 8]} />}
            <meshStandardMaterial color={it.kind === 0 ? "#2a1d14" : it.kind === 1 ? "#7a8a3a" : "#c9b48a"} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {bottom.map((b, i) => {
        const u = smooth(ramp(t, b0 + b.d, b0 + b.d + 1.6));
        if (t < S.MEKANISME[0] || u >= 1 || t > S.MEKANISME[1]) return null;
        return (
          <mesh key={i} position={[b.p[0] * (1 - u), P.y0 + 0.02, b.p[2] + (0.35 - b.p[2]) * u]}>
            <icosahedronGeometry args={[0.012, 0]} />
            <meshStandardMaterial color="#6b4e33" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- REVEAL: chloramine + chlorine-tolerant germ ----------
const mistTexture = () => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
};

const Chloramine: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => mistTexture(), []);
  const pairs = useMemo(() => {
    const rnd = mulberry(2626);
    return Array.from({ length: 14 }, () => {
      const a: V3 = [-0.7 + rnd() * 1.3, P.water - 0.05 - rnd() * 0.12, -0.35 + rnd() * 0.9];
      const b: V3 = [a[0] + (rnd() - 0.5) * 0.35, a[1] - 0.05 - rnd() * 0.1, a[2] + (rnd() - 0.5) * 0.3];
      return { a, b, d: rnd() * 0.9 };
    });
  }, []);
  const mists = useMemo(() => {
    const rnd = mulberry(2727);
    return Array.from({ length: 10 }, () => ({ p: [-0.8 + rnd() * 1.4, P.water + 0.03 + rnd() * 0.06, -0.5 + rnd() * 1.1] as V3, s: 0.35 + rnd() * 0.4, ph: rnd() * 6 }));
  }, []);
  if (t < S.REVEAL[0] - 0.3 || t > S.REVEAL[1] + 0.6) return null;
  const sweat = ramp(t, W("l07", "keringat") - 0.6, W("l07", "keringat"));
  const react = W("l07", "bereaksi");
  const mist = ramp(t, W("l07", "membentuk") - 0.3, W("l07", "kloramin") + 0.4) * (1 - ramp(t, S.REVEAL[1], S.REVEAL[1] + 0.6));
  return (
    <group>
      {pairs.map((p, i) => {
        const u = smooth(ramp(t, react + p.d * 0.6, react + p.d * 0.6 + 1.2));
        const rise = smooth(ramp(t, W("l07", "membentuk") + p.d * 0.4, W("l07", "membentuk") + p.d * 0.4 + 1.2));
        const orb: V3 = [p.b[0] + (p.a[0] - p.b[0]) * u, p.b[1] + (p.a[1] - p.b[1]) * u + rise * 0.1, p.b[2] + (p.a[2] - p.b[2]) * u];
        const blob: V3 = [p.a[0], p.a[1] + rise * 0.1, p.a[2]];
        return (
          <group key={i}>
            {sweat > 0 && (
              <mesh position={blob} scale={sweat}>
                <icosahedronGeometry args={[0.022, 2]} />
                <meshStandardMaterial color={u > 0.95 ? "#e8f07a" : "#ffb43d"} emissive={u > 0.95 ? "#d9ff6a" : "#ff9a1f"} emissiveIntensity={0.7} roughness={0.3} />
              </mesh>
            )}
            <ChlorineOrb p={orb} r={0.016} />
          </group>
        );
      })}
      {mists.map((m, i) => (
        <mesh key={i} position={[m.p[0] + Math.sin(t * 0.3 + m.ph) * 0.05, m.p[1], m.p[2]]} rotation={[-Math.PI / 2, 0, m.ph]} layers={FX_LAYER}>
          <planeGeometry args={[m.s, m.s]} />
          <meshBasicMaterial map={tex} color="#f4ffd0" transparent opacity={0.45 * mist} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

const MICRO: V3 = [0.45, 0.5, 0.45];
const Micro: React.FC<{ t: number }> = ({ t }) => {
  const a = win(t, W("l08", "dan") - 0.3, S.REVEAL[1] + 0.3, 0.4);
  if (a <= 0.01) return null;
  const kill = ramp(t, W("l08", "kuman") + 0.2, W("l08", "berhari-hari") + 0.6);
  const orbs = Array.from({ length: 12 }, (_, i) => {
    const ang = i * 2.39 + t * 0.9;
    const r = 0.045 + Math.abs(Math.sin(t * 2.4 + i)) * 0.012; // bounce off the thick wall
    return [Math.cos(ang) * r, Math.sin(i * 1.3 + t) * 0.03, Math.sin(ang) * r] as V3;
  });
  return (
    <group position={MICRO} scale={a}>
      {/* thick-walled oocyst (Cryptosporidium-like): survives */}
      <mesh>
        <sphereGeometry args={[0.022, 40, 30]} />
        <meshStandardMaterial color="#ff8a3d" emissive="#ff6a1f" emissiveIntensity={0.55} roughness={0.35} />
      </mesh>
      <mesh layers={FX_LAYER}>
        <sphereGeometry args={[0.032, 40, 30]} />
        <meshPhysicalMaterial color="#ffd8b0" transparent opacity={0.4} roughness={0.1} clearcoat={1} depthWrite={false} />
      </mesh>
      {/* ordinary germs break apart */}
      {([[-0.06, 0.03, 0.02], [0.065, -0.02, 0.0], [0.0, 0.055, -0.03]] as V3[]).map((g, i) => (
        <Germ key={i} p={g} r={0.012} broken={kill} seed={900 + i} color={i % 2 ? C.germ2 : C.germ} />
      ))}
      {orbs.map((o, i) => (
        <ChlorineOrb key={i} p={o} r={0.006} />
      ))}
      <mesh layers={FX_LAYER}>
        <sphereGeometry args={[0.1, 48, 32]} />
        <meshPhysicalMaterial color="#c9f6ff" transparent opacity={0.1} roughness={0} metalness={0.5} clearcoat={1} envMapIntensity={2.4} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2 - 0.3, 0, t * 0.2]}>
        <torusGeometry args={[0.102, 0.0016, 8, 120]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- PAYOFF: test board on the back deck ----------
const BOARD = { x: 0, y: 1.55, z: -1.05, w: 1.3, h: 0.9 };
const TUBE_A = { x: -0.5, y0: 1.2, y1: 1.85 };
const TUBE_B = { x: 0.15, y0: 1.2, y1: 1.85 };
const Gauge: React.FC<{ x: number; band: [number, number]; fill: number; color: string }> = ({ x, band, fill, color }) => {
  const h = TUBE_A.y1 - TUBE_A.y0;
  return (
    <group position={[x, TUBE_A.y0, BOARD.z + 0.07]}>
      <mesh position={[0, h / 2, 0]} layers={FX_LAYER}>
        <cylinderGeometry args={[0.05, 0.05, h, 32, 1, true]} />
        <meshPhysicalMaterial color="#d8fbff" transparent opacity={0.25} roughness={0.02} metalness={0.3} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {fill > 0.005 && (
        <mesh position={[0, (h * fill) / 2, 0]}>
          <cylinderGeometry args={[0.038, 0.038, h * fill, 32]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      )}
      {fill > 0.005 && (
        <mesh position={[0, h * fill, 0]}>
          <sphereGeometry args={[0.038, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
        </mesh>
      )}
      {/* target band */}
      <mesh position={[0, h * ((band[0] + band[1]) / 2), 0]} layers={FX_LAYER}>
        <cylinderGeometry args={[0.062, 0.062, h * (band[1] - band[0]), 32, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {band.map((b) => (
        <mesh key={b} position={[0, h * b, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.064, 0.004, 8, 40]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

const TestBoard: React.FC<{ t: number }> = ({ t }) => {
  const up = smooth(ramp(t, S.PAYOFF[0] - 0.2, S.PAYOFF[0] + 0.9));
  if (up <= 0) return null;
  const klor = smooth(ramp(t, W("l09", "satu"), W("l09", "liter") + 0.2)) * 0.625;
  const ph = smooth(ramp(t, W("l09", "ph"), W("l09", "delapan") + 0.3)) * 0.45;
  return (
    <group position={[0, (up - 1) * 1.2, 0]}>
      <mesh position={[BOARD.x, BOARD.y, BOARD.z]}>
        <boxGeometry args={[BOARD.w, BOARD.h, 0.04]} />
        <meshPhysicalMaterial color="#0a1824" roughness={0.12} metalness={0.4} clearcoat={1} />
      </mesh>
      {[
        [[-BOARD.w / 2 - 0.02, BOARD.y - BOARD.h / 2 - 0.02, BOARD.z - 0.03], [BOARD.w / 2 + 0.02, BOARD.y - BOARD.h / 2, BOARD.z + 0.03]],
        [[-BOARD.w / 2 - 0.02, BOARD.y + BOARD.h / 2, BOARD.z - 0.03], [BOARD.w / 2 + 0.02, BOARD.y + BOARD.h / 2 + 0.02, BOARD.z + 0.03]],
      ].map(([a, b], i) => (
        <Box key={i} a={a as V3} b={b as V3}>
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} />
        </Box>
      ))}
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, (P.y1 + BOARD.y - BOARD.h / 2) / 2, BOARD.z]}>
          <cylinderGeometry args={[0.02, 0.02, BOARD.y - BOARD.h / 2 - P.y1, 16]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} />
        </mesh>
      ))}
      <Gauge x={TUBE_A.x} band={[0.5, 0.75]} fill={klor} color="#5ff4ff" />
      <Gauge x={TUBE_B.x} band={[0.25, 0.65]} fill={ph} color="#b9a6ff" />
    </group>
  );
};

// ---------- OUTRO: rinse shower ----------
const SHOWER: V3 = [-1.55, P.y1 + 0.05, -0.95];
const Shower: React.FC<{ t: number }> = ({ t }) => {
  const on = ramp(t, S.OUTRO[0] - 0.3, S.OUTRO[0] + 0.2);
  const [x, y, z] = SHOWER;
  return (
    <group>
      <mesh position={[x - 0.1, y + 0.2, z]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 16]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
      </mesh>
      <mesh position={[x - 0.05, y + 0.4, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.009, 0.009, 0.1, 12]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
      </mesh>
      <mesh position={[x, y + 0.39, z]}>
        <cylinderGeometry args={[0.035, 0.02, 0.02, 24]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
      </mesh>
      {/* person (faceless toy figure) */}
      <mesh position={[x, y + 0.09, z + 0.01]}>
        <capsuleGeometry args={[0.024, 0.1, 6, 12]} />
        <meshStandardMaterial color="#ff5f8f" roughness={0.35} />
      </mesh>
      <mesh position={[x, y + 0.2, z + 0.01]}>
        <sphereGeometry args={[0.022, 20, 14]} />
        <meshStandardMaterial color="#1b2a3a" roughness={0.3} metalness={0.2} />
      </mesh>
      {on > 0 &&
        Array.from({ length: 22 }, (_, i) => {
          const u = (t * 1.6 + i / 22) % 1;
          const ang = i * 2.4;
          return (
            <mesh key={i} position={[x + Math.cos(ang) * 0.025 * (1 + u), y + 0.37 - u * 0.36, z + Math.sin(ang) * 0.025 * (1 + u)]} scale={[on, on * 2.2, on]}>
              <sphereGeometry args={[0.004, 8, 6]} />
              <meshStandardMaterial color="#ffffff" emissive="#9ff3ff" emissiveIntensity={1.4} />
            </mesh>
          );
        })}
    </group>
  );
};

// ---------- scene ----------
const Scene: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const logo = useLogoTexture();
  const intakeA = win(t, W("l05", "permukaan") - 0.3, W("l05", "sisanya") + 0.6);
  const drainA = win(t, W("l05", "saluran") - 0.3, W("l06", "pompa") + 0.3);
  const returnA = win(t, W("l06", "kembali") - 0.4, S.REVEAL[0]);
  const loopA = win(t, W("l04", "diputar"), S.KONTEKS[1] + 0.4);
  const pumpSpin = win(t, W("l06", "pompa") - 0.2, W("l06", "filter") + 0.4);
  return (
    <>
      <CamRig t={t} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3.5, 7, 5]} intensity={1.8} color="#fff6e8" />
      <directionalLight position={[-5, 3, -4]} intensity={0.9} color="#7fd0ff" />
      <pointLight position={[0, 0.5, 0.4]} intensity={6} distance={4} color="#5fd8ff" />
      <pointLight position={[0.3, -1.2, 2]} intensity={5} distance={4} color="#9ff3ff" />
      <pointLight position={[0, 2.2, 0.4]} intensity={0.8} distance={4} color="#e8fbff" />
      <Backdrop t={t} />
      <Pool t={t} />
      <Swimmers t={t} />
      {FILM_PIPES.map((p, i) => (
        <Pipe key={i} {...p} t={t} seed={i} on={pipeOn(i, t)} />
      ))}
      <PumpFilm t={t} spin={pumpSpin} />
      <SandFilterFilm t={t} />
      <Chlorinator t={t} />
      <PhDoser t={t} />
      <ArrowFlow pts={[[0.6, P.water - 0.02, 0.1], [-0.2, P.water - 0.03, 0.35], [-0.9, P.water - 0.03, 0.55], SKIM]} t={t} a={intakeA + loopA * 0.6} r={0.03} color={C.cyan} />
      <ArrowFlow pts={[[0.7, 0.35, -0.2], [0.35, 0.18, 0.1], [0.0, 0.13, 0.33]]} t={t} a={drainA + loopA * 0.6} r={0.012} color="#3bd6c6" n={5} />
      <ArrowFlow pts={[[1.27, 0.55, 0.6], [0.8, 0.5, 0.45], [0.2, 0.52, 0.3], [-0.4, 0.6, 0.35]]} t={t} a={returnA + loopA * 0.6} r={0.022} color="#8ff9ff" />
      <Debris t={t} />
      <Chloramine t={t} />
      <Micro t={t} />
      <TestBoard t={t} />
      <Shower t={t} />
      <mesh position={[0.6, -0.1, P.z1 + 0.02]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>
      <Finish frame={frame} background={C.void} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao />
    </>
  );
};

// ---------- overlay: kicker, callouts, HUD, captions ----------
const CYAN = "#5ff4ff";
const KICKERS: { at: number; to: number; n: string; text: string }[] = [
  { at: S.HOOK[0], to: S.HOOK[1] + 0.3, n: "01", text: "SATU KOLAM, RATUSAN ORANG" },
  { at: S.KONTEKS[0], to: S.KONTEKS[1] + 0.3, n: "02", text: "TIDAK DIKURAS, TAPI DIPUTAR" },
  { at: S.MEKANISME[0], to: S.MEKANISME[1] + 0.3, n: "03", text: "JALUR AIR KOLAM" },
  { at: S.REVEAL[0], to: S.REVEAL[1] + 0.3, n: "04", text: "YANG JARANG DISADARI" },
  { at: S.PAYOFF[0], to: S.PAYOFF[1] + 0.3, n: "05", text: "STANDAR DI INDONESIA" },
  { at: S.OUTRO[0], to: OUTRO_AT, n: "06", text: "SEBELUM BERENANG" },
];

type Lab = { at: V3; text: string; a: number; b: number; dx: number; dy: number; align?: "left" | "right"; warn?: boolean };
const LABELS: Lab[] = [
  { at: SKIM, text: "Skimmer (permukaan)", a: W("l05", "skimmer") - 0.2, b: W("l05", "sisanya") + 0.4, dx: 30, dy: -230 },
  { at: [0, P.y0 + 0.01, 0.35], text: "Saluran dasar", a: W("l05", "saluran") - 0.1, b: W("l06", "pompa"), dx: -40, dy: 230, align: "right" },
  { at: [-0.95, -1.4, 0.95], text: "Pompa", a: W("l06", "pompa") + 0.2, b: W("l06", "filter") + 0.2, dx: 40, dy: -260 },
  { at: [1.05, -1.0, 0.75], text: "Filter pasir", a: W("l06", "filter") + 0.3, b: W("l06", "lalu"), dx: -60, dy: -300, align: "right" },
  { at: [1.1, -1.43, 0.72], text: "Kotoran tertahan", a: W("l06", "kotoran") - 0.1, b: W("l06", "lalu"), dx: -60, dy: 220, align: "right", warn: true },
  { at: [1.62, 0.15, ZP + 0.12], text: "Klor", a: W("l06", "klor") - 0.1, b: W("l06", "sebelum"), dx: -60, dy: -220, align: "right" },
  { at: [1.88, -0.45, 1.28], text: "Penyeimbang pH", a: W("l06", "penyeimbang") - 0.1, b: W("l06", "sebelum"), dx: -60, dy: 200, align: "right" },
  { at: [1.27, 0.55, 0.6], text: "Kembali ke kolam", a: W("l06", "kembali") - 0.1, b: S.MEKANISME[1] + 0.3, dx: -80, dy: -240, align: "right" },
  { at: [-0.2, P.water - 0.05, 0.2], text: "Keringat + urine", a: W("l07", "keringat") - 0.1, b: W("l07", "membentuk"), dx: -30, dy: 230, warn: true },
  { at: [0.0, P.water + 0.07, 0.1], text: "Kloramin = bau “kaporit”", a: W("l07", "kloramin") - 0.2, b: S.REVEAL[0] + 6.3, dx: 0, dy: -250, warn: true },
  { at: [MICRO[0], MICRO[1] + 0.03, MICRO[2]], text: "Kuman tahan klor", a: W("l08", "kuman") + 0.2, b: S.REVEAL[1] + 0.2, dx: 0, dy: -330, warn: true },
];

const Callout: React.FC<{ lab: Lab; t: number; w: number; h: number; k: number }> = ({ lab, t, w, h, k }) => {
  const o = win(t, lab.a, lab.b, 0.25);
  if (o <= 0.01) return null;
  const a = project(lab.at, t, w, h);
  if (!a.front) return null;
  const grow = smooth(ramp(t, lab.a - 0.25, lab.a + 0.15));
  const bx = a.x + lab.dx * k * grow, by = a.y + lab.dy * k * grow;
  const col = lab.warn ? "#ffb43d" : CYAN;
  const top = Math.min(Math.max(by, 290 * k), h - 620 * k);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <line x1={a.x} y1={a.y} x2={bx} y2={top} stroke={col} strokeWidth={3 * k} />
        <circle cx={a.x} cy={a.y} r={9 * k} fill={col} />
        <circle cx={a.x} cy={a.y} r={(16 + 8 * Math.sin(t * 5)) * k} fill="none" stroke={col} strokeWidth={2 * k} opacity={0.6} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: top - 30 * k,
          left: lab.align === "right" ? undefined : Math.min(bx, w - 60 * k),
          right: lab.align === "right" ? Math.max(w - bx, 60 * k) : undefined,
          padding: `${10 * k}px ${22 * k}px`,
          borderRadius: 999,
          background: "rgba(4,16,26,0.85)",
          border: `${2.5 * k}px solid ${col}`,
          color: "#eafcff",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 38 * k,
          whiteSpace: "nowrap",
          transform: `scale(${0.85 + 0.15 * grow})`,
          transformOrigin: lab.align === "right" ? "right center" : "left center",
        }}
      >
        {lab.text}
      </div>
    </div>
  );
};

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const KontekHud: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, S.KONTEKS[0] + 0.3, W("l04", "airnya") + 0.2, 0.3);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: 300 * k, opacity: o, fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 12 * k, justifyContent: "center" }}>
        {DAYS.map((d, i) => {
          const on = ramp(t, S.KONTEKS[0] + 0.3 + i * 0.22, S.KONTEKS[0] + 0.5 + i * 0.22);
          return (
            <div key={d} style={{ width: 118 * k, padding: `${14 * k}px 0`, borderRadius: 20 * k, border: `${2 * k}px solid rgba(95,244,255,${0.25 + on * 0.6})`, background: "rgba(4,16,26,0.75)", textAlign: "center" }}>
              <div style={{ color: "#eafcff", fontSize: 30 * k, fontWeight: 600 }}>{d}</div>
              <div style={{ margin: `${10 * k}px auto 0`, width: 70 * k, height: 40 * k, borderRadius: 8 * k, border: `${2 * k}px solid rgba(191,239,255,0.5)`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${80 * on}%`, background: CYAN, opacity: 0.85 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 22 * k, textAlign: "center", color: "#bfefff", fontSize: 34 * k, fontWeight: 500 }}>air yang sama, tidak dikuras</div>
    </div>
  );
};

const PayoffHud: React.FC<{ t: number; w: number; h: number; k: number }> = ({ t, w, h, k }) => {
  const o = win(t, S.PAYOFF[0] + 0.6, S.PAYOFF[1] + 0.3, 0.3);
  if (o <= 0.01) return null;
  const A = project([TUBE_A.x + 0.09, 1.72, BOARD.z + 0.05], t, w, h);
  const B = project([TUBE_B.x + 0.09, 1.72, BOARD.z + 0.05], t, w, h);
  const top = project([0, BOARD.y + BOARD.h / 2 + 0.06, BOARD.z], t, w, h);
  const a1 = smooth(ramp(t, W("l09", "satu") - 0.1, W("l09", "satu") + 0.3));
  const a2 = smooth(ramp(t, W("l09", "ph") - 0.1, W("l09", "ph") + 0.3));
  const big = { fontFamily: FONT, fontWeight: 600, color: "#f2fbff", lineHeight: 1.0, letterSpacing: -1 * k } as const;
  const small = { fontFamily: FONT, fontWeight: 500, color: "#bfefff", fontSize: 26 * k, letterSpacing: 1 * k } as const;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: Math.max(200 * k, top.y - 120 * k), textAlign: "center", fontFamily: FONT }}>
        <div style={{ display: "inline-block", padding: `${10 * k}px ${26 * k}px`, borderRadius: 999, border: `${2 * k}px solid ${CYAN}`, background: "rgba(4,16,26,0.8)", color: "#eafcff", fontSize: 32 * k, fontWeight: 600 }}>
          Papan hasil uji kolam
        </div>
      </div>
      <div style={{ position: "absolute", left: A.x, top: A.y - 10 * k, opacity: a1, transform: `translateY(${(1 - a1) * 20 * k}px)` }}>
        <div style={small}>SISA KLOR BEBAS</div>
        <div style={{ ...big, fontSize: 64 * k, color: CYAN }}>1–1,5</div>
        <div style={{ ...small, fontSize: 30 * k, color: "#eafcff" }}>mg/l</div>
      </div>
      <div style={{ position: "absolute", left: B.x, top: B.y - 10 * k, opacity: a2, transform: `translateY(${(1 - a2) * 20 * k}px)` }}>
        <div style={small}>pH AIR</div>
        <div style={{ ...big, fontSize: 64 * k, color: "#c9b8ff" }}>7–7,8</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300 * k, textAlign: "center", ...small, fontSize: 28 * k, opacity: Math.max(a1, a2) }}>
        Permenkes 2/2023 · kolam renang
      </div>
    </div>
  );
};

const OutroHud: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, W("l10", "mandi") - 0.2, W("l11", "ini"), 0.3);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330 * k, textAlign: "center", opacity: o, fontFamily: FONT }}>
      <div style={{ fontSize: 96 * k, fontWeight: 600, color: "#f2fbff", letterSpacing: -2 * k, transform: `scale(${0.94 + 0.06 * o})` }}>
        Mandi <span style={{ color: CYAN }}>dulu</span>
      </div>
      <div style={{ marginTop: 10 * k, fontSize: 36 * k, color: "#bfefff", fontWeight: 500 }}>sebelum masuk kolam</div>
    </div>
  );
};

// karaoke caption: phrases of <= 5 words, broken at punctuation
type Phrase = { words: Word[]; s: number; e: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const last = i === c.words.length - 1;
      if (last || cur.length >= 5 || (/[,.?!]$/.test(w.w) && cur.length >= 2)) {
        out.push({ words: cur, s: cur[0].s, e: last ? c.end : c.words[i + 1].s });
        cur = [];
      }
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= OUTRO_AT) return null;
  const ph = PHRASES.find((p, i) => t >= p.s - 0.05 && t < (PHRASES[i + 1]?.s ?? p.e + 0.4) - 0.05 && t < p.e + 0.45);
  if (!ph) return null;
  const inA = smooth(ramp(t, ph.s - 0.05, ph.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, bottom: 400 * k, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: `${16 * k}px ${30 * k}px`,
          borderRadius: 34 * k,
          background: "rgba(3,12,20,0.66)",
          border: `${2 * k}px solid rgba(95,244,255,0.35)`,
          boxShadow: `0 ${10 * k}px ${40 * k}px rgba(0,0,0,0.35)`,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 54 * k,
          lineHeight: 1.18,
          color: "#f2fbff",
          opacity: inA,
          transform: `translateY(${(1 - inA) * 14 * k}px)`,
          maxWidth: 940 * k,
        }}
      >
        {ph.words.map((w, i) => {
          const active = t >= w.s && t < w.e + 0.08;
          const said = t >= w.e;
          const b = active ? 1 + 0.08 * Math.max(0, 1 - (t - w.s) / 0.16) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: `0 ${12 * k}px`,
                color: active ? CYAN : said ? "#f2fbff" : "rgba(242,251,255,0.55)",
                transform: `scale(${b}) translateY(${active ? -3 * k : 0}px)`,
                textShadow: active ? `0 0 ${18 * k}px rgba(95,244,255,0.75)` : "none",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Kicker: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const kk = KICKERS.find((x) => t >= x.at - 0.1 && t < x.to);
  if (!kk || t >= OUTRO_AT) return null;
  const o = win(t, kk.at, kk.to - 0.3, 0.25);
  return (
    <div style={{ position: "absolute", left: 64 * k, top: 196 * k, opacity: o, fontFamily: FONT, display: "flex", alignItems: "center", gap: 16 * k }}>
      <div style={{ color: "#03131d", background: CYAN, fontWeight: 600, fontSize: 26 * k, padding: `${4 * k}px ${12 * k}px`, borderRadius: 8 * k }}>{kk.n}</div>
      <div style={{ color: CYAN, fontWeight: 600, fontSize: 28 * k, letterSpacing: 5 * k }}>{kk.text}</div>
    </div>
  );
};

export const Ep051Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const c0 = camAt(0);
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <ThreeCanvas width={width} height={height} camera={{ position: c0.pos, fov: c0.fov, near: 0.02, far: 80 }}>
        <Scene frame={frame} t={t} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420 * k, background: "linear-gradient(180deg, rgba(3,10,18,0.7), rgba(3,10,18,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 700 * k, background: "linear-gradient(0deg, rgba(3,10,18,0.75), rgba(3,10,18,0))" }} />
      <Kicker t={t} k={k} />
      {LABELS.map((l, i) => (
        <Callout key={i} lab={l} t={t} w={width} h={height} k={k} />
      ))}
      <KontekHud t={t} k={k} />
      <PayoffHud t={t} w={width} h={height} k={k} />
      <OutroHud t={t} k={k} />
      <Captions t={t} k={k} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
