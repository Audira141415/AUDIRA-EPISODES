// EP08 Petir — procedural storm pieces: lightning channel, rain, cloud tower, charges, sound rings, plates.
import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32 } from "../../kits/abyssforge/core/motion";

export type V3 = [number, number, number];

// ── lightning ──────────────────────────────────────────────────────────────────────────────
export type Seg = { a: THREE.Vector3; b: THREE.Vector3; w: number; f: number };

/** Zig-zag channel from top to bottom with side branches. f = fraction along the main path (0 = top). */
export const makeBolt = (seed: number, top: V3, bottom: V3, steps = 18, jitter = 0.6, branches = 4): Seg[] => {
  const r = mulberry32(seed);
  const A = new THREE.Vector3(...top);
  const B = new THREE.Vector3(...bottom);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const p = A.clone().lerp(B, i / steps);
    if (i > 0 && i < steps) {
      p.x += (r() - 0.5) * 2 * jitter;
      p.z += (r() - 0.5) * 2 * jitter * 0.6;
    }
    pts.push(p);
  }
  const segs: Seg[] = [];
  for (let i = 0; i < steps; i++) segs.push({ a: pts[i], b: pts[i + 1], w: 1, f: (i + 1) / steps });
  const stepLen = A.distanceTo(B) / steps;
  for (let k = 0; k < branches; k++) {
    const i0 = 2 + Math.floor(r() * (steps - 6));
    let p = pts[i0].clone();
    const dir = new THREE.Vector3((r() - 0.5) * 2, -1, (r() - 0.5)).normalize();
    const n = 2 + Math.floor(r() * 4);
    for (let j = 0; j < n; j++) {
      const q = p.clone().addScaledVector(dir, stepLen * (0.8 + r() * 0.5));
      q.x += (r() - 0.5) * jitter;
      segs.push({ a: p, b: q, w: 0.5 - j * 0.06, f: (i0 + j + 1) / steps });
      p = q;
    }
  }
  return segs.sort((x, y) => x.f - y.f);
};

const UP = new THREE.Vector3(0, 1, 0);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true);

/** Lightning channel: white core + coloured additive halo. reveal 0..1 grows it from the top; intensity scales glow. */
export const Bolt: React.FC<{ segs: Seg[]; reveal?: number; intensity?: number; color?: string; width?: number; core?: string }> = ({
  segs,
  reveal = 1,
  intensity = 1,
  color = "#8FB8FF",
  width = 0.05,
  core = "#F4F8FF",
}) => {
  const meshes = useMemo(() => {
    const mk = (opacity: number, additive: boolean) => {
      const m = new THREE.InstancedMesh(
        cylGeo,
        new THREE.MeshBasicMaterial({
          color: "#FFFFFF",
          transparent: true,
          opacity,
          depthWrite: false,
          toneMapped: false,
          fog: false,
          blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        }),
        segs.length,
      );
      m.frustumCulled = false;
      return m;
    };
    const c = mk(1, false);
    const h = mk(0.3, true);
    const h2 = mk(0.12, true);
    const M = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const d = new THREE.Vector3();
    segs.forEach((s, i) => {
      d.subVectors(s.b, s.a);
      const len = d.length();
      q.setFromUnitVectors(UP, d.clone().normalize());
      const mid = s.a.clone().add(s.b).multiplyScalar(0.5);
      M.compose(mid, q, new THREE.Vector3(width * s.w, len * 1.04, width * s.w));
      c.setMatrixAt(i, M);
      M.compose(mid, q, new THREE.Vector3(width * s.w * 4, len * 1.04, width * s.w * 4));
      h.setMatrixAt(i, M);
      M.compose(mid, q, new THREE.Vector3(width * s.w * 8, len * 1.04, width * s.w * 8));
      h2.setMatrixAt(i, M);
    });
    return [c, h, h2];
  }, [segs, width]);
  const n = segs.filter((s) => s.f <= reveal + 1e-6).length;
  const I = Math.max(0, intensity);
  const [c, h, h2] = meshes;
  c.count = n;
  h.count = n;
  h2.count = n;
  (c.material as THREE.MeshBasicMaterial).color.set(core).multiplyScalar(0.6 + 1.6 * Math.min(1.5, I));
  (c.material as THREE.MeshBasicMaterial).opacity = Math.min(1, 0.25 + I);
  (h.material as THREE.MeshBasicMaterial).color.set(color);
  (h.material as THREE.MeshBasicMaterial).opacity = 0.45 * Math.min(1.5, I);
  (h2.material as THREE.MeshBasicMaterial).color.set(color);
  (h2.material as THREE.MeshBasicMaterial).opacity = 0.14 * Math.min(1.5, I);
  if (n === 0 || I <= 0.01) return null;
  return (
    <group>
      <primitive object={h2} />
      <primitive object={h} />
      <primitive object={c} />
    </group>
  );
};

/** Lowest point reached by a revealed bolt (the leader tip). */
export const tipOf = (segs: Seg[], reveal: number) => {
  const main = segs.filter((s) => s.w === 1 && s.f <= reveal + 1e-6);
  return main.length ? main[main.length - 1].b : segs[0].a;
};

// ── atmosphere ─────────────────────────────────────────────────────────────────────────────
export const StormFog: React.FC<{ color: string; density?: number }> = ({ color, density = 0.02 }) => {
  const { scene } = useThree();
  const hex = new THREE.Color(color).getHex();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(hex, density);
    return () => {
      scene.fog = null;
    };
  }, [scene, hex, density]);
  return null;
};

/** Falling rain streaks in a box around `center`. */
export const Rain: React.FC<{ t: number; center: V3; count?: number; spread?: number; height?: number; opacity?: number }> = ({
  t,
  center,
  count = 700,
  spread = 12,
  height = 14,
  opacity = 0.35,
}) => {
  const { mesh, seeds } = useMemo(() => {
    const r = mulberry32(808);
    const m = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.012, 0.42, 0.012),
      new THREE.MeshBasicMaterial({ color: "#B9CCE6", transparent: true, opacity, depthWrite: false, fog: false }),
      count,
    );
    m.frustumCulled = false;
    const s = Array.from({ length: count }, () => [r(), r(), r(), 0.7 + r() * 0.6]);
    return { mesh: m, seeds: s };
  }, [count, opacity]);
  const M = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.12));
  const one = new THREE.Vector3(1, 1, 1);
  seeds.forEach(([a, b, c, v], i) => {
    const y = height - ((b * height + t * 16 * v) % height);
    M.compose(new THREE.Vector3(center[0] + (a - 0.5) * spread, center[1] + y - height / 2, center[2] + (c - 0.5) * spread), q, one);
    mesh.setMatrixAt(i, M);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

export const Ground: React.FC<{ color?: string; size?: number; y?: number }> = ({ color = "#1D2A21", size = 400, y = 0 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
  </mesh>
);

// ── cloud ──────────────────────────────────────────────────────────────────────────────────
const puffGeo = new THREE.IcosahedronGeometry(1, 2);

type Puff = { p: V3; r: number };
/** Cumulonimbus silhouette: column of puffs + wide flat anvil, unit height ≈ 1 (scale it). */
export const makeTower = (seed: number): Puff[] => {
  const rnd = mulberry32(seed);
  const out: Puff[] = [];
  for (let i = 0; i < 26; i++) {
    const y = 0.08 + (i / 26) * 0.72;
    const w = 0.16 + y * 0.12;
    out.push({ p: [(rnd() - 0.5) * w * 2, y, (rnd() - 0.5) * w], r: 0.09 + rnd() * 0.07 });
  }
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const rr = 0.18 + rnd() * 0.3;
    out.push({ p: [Math.cos(a) * rr * 1.4, 0.86 + rnd() * 0.06, Math.sin(a) * rr * 0.5], r: 0.07 + rnd() * 0.05 });
  }
  for (let i = 0; i < 14; i++) out.push({ p: [(rnd() - 0.5) * 0.7, 0.05 + rnd() * 0.05, (rnd() - 0.5) * 0.3], r: 0.09 + rnd() * 0.05 });
  return out;
};

export const CloudPuffs: React.FC<{ puffs: Puff[]; scale: number; position?: V3; color?: string; glow?: number; glowColor?: string; opacity?: number }> = ({
  puffs,
  scale,
  position = [0, 0, 0],
  color = "#4E5A6B",
  glow = 0,
  glowColor = "#B9C8FF",
  opacity = 1,
}) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, flatShading: true, transparent: opacity < 1 }), [color, opacity]);
  mat.emissive.set(glowColor).multiplyScalar(glow * 0.8);
  mat.opacity = opacity;
  return (
    <group position={position} scale={scale}>
      {puffs.map((f, i) => (
        <mesh key={i} geometry={puffGeo} material={mat} position={f.p} scale={f.r} />
      ))}
    </group>
  );
};

// ── charges ────────────────────────────────────────────────────────────────────────────────
export const POS = "#E5533D";
export const NEG = "#4FC3D9";

/** A charge marker: round + / − badge that always faces the camera.
 * Real geometry (disc + bars) instead of a sprite: sprites turn into black squares under the AO pass. */
export const Charge: React.FC<{ sign: "+" | "-"; position: V3; size?: number; opacity?: number }> = ({ sign, position, size = 0.35, opacity = 1 }) => {
  const ref = React.useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    if (ref.current) ref.current.quaternion.copy(camera.quaternion);
  });
  if (opacity <= 0.01) return null;
  const r = size / 2;
  const tr = opacity < 0.99;
  return (
    <group ref={ref} position={position}>
      <mesh>
        <circleGeometry args={[r, 32]} />
        <meshBasicMaterial color={sign === "+" ? POS : NEG} toneMapped={false} fog={false} transparent={tr} opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[r * 1.12, r * 0.25]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} fog={false} transparent={tr} opacity={opacity} />
      </mesh>
      {sign === "+" && (
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[r * 0.25, r * 1.12]} />
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} fog={false} transparent={tr} opacity={opacity} />
        </mesh>
      )}
    </group>
  );
};

// ── sound / brand ──────────────────────────────────────────────────────────────────────────
export const Ring: React.FC<{ radius: number; opacity: number; position?: V3; rotation?: V3; color?: string; tube?: number }> = ({
  radius,
  opacity,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#9FE3FF",
  tube = 0.04,
}) =>
  opacity <= 0.01 ? null : (
    <mesh position={position} rotation={rotation}>
      <torusGeometry args={[radius, tube, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} fog={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );

/** Flat in-world label plate (canvas texture). Used for the AUDIRA weather-station plate. */
export const LabelPlate: React.FC<{ text: string; sub?: string; width?: number; position?: V3; rotation?: V3; accent?: string; opacity?: number }> = ({
  text,
  sub,
  width = 2,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  accent = "#9FE3FF",
  opacity = 1,
}) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "rgba(8,14,22,0.9)";
    g.beginPath();
    g.roundRect(6, 6, 756, 244, 28);
    g.fill();
    g.fillStyle = accent;
    g.fillRect(6, 6, 16, 244);
    g.fillStyle = "#F4F6FB";
    g.font = "bold 92px Arial, sans-serif";
    g.textBaseline = "middle";
    g.fillText(text, 52, sub ? 98 : 128);
    if (sub) {
      g.font = "bold 50px Arial, sans-serif";
      g.fillStyle = accent;
      g.fillText(sub, 54, 190);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, sub, accent]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / 3]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} fog={false} />
    </mesh>
  );
};

/** Soft additive glow sphere (sun, window light, hot channel). */
export const GlowBall: React.FC<{ color: string; r: number; position?: V3; intensity?: number }> = ({ color, r, position = [0, 0, 0], intensity = 1 }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[r, 32, 16]} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(1.2 * intensity)} toneMapped={false} fog={false} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.2, 32, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.18 * intensity} depthWrite={false} toneMapped={false} fog={false} blending={THREE.AdditiveBlending} />
    </mesh>
  </group>
);
