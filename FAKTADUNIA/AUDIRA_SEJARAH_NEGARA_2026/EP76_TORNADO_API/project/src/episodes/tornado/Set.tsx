// EP76 shared set pieces (from EP04 Gunung): terrain helpers, smoke plume (instanced puffs), sky dome, glow, 3D labels.
// ash plume (instanced puffs), animated sea, gradient sky dome, sun, and 3D label sprites.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeGlow } from "../../kits/disastersim/lib/materials";
import { FX_LAYER } from "../../core/render/Post.tsx";

/** Keep sky, glows, rings and labels off the GTAO/DoF depth passes (they blacked out label and sky regions). */
export const fx = (o: THREE.Object3D | null) => {
  if (o) o.layers.set(FX_LAYER);
};

/** Label texture sized to its text (the kit label is a fixed 512 px canvas and clips long text). */
const makeLabel = (text: string, accent: string) => {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = "bold 44px Arial, sans-serif";
  const w = Math.ceil(probe.measureText(text).width) + 64;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(8,16,22,0.86)";
  g.beginPath();
  g.roundRect(2, 6, w - 4, 84, 14);
  g.fill();
  g.fillStyle = accent;
  g.fillRect(2, 6, 12, 84);
  g.fillStyle = "#F2F8FA";
  g.font = "bold 44px Arial, sans-serif";
  g.textBaseline = "middle";
  g.fillText(text, 32, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: w / 96 };
};
import { clamp, lerp, prng, smooth } from "../../kits/disastersim/core/motion";

// ---------- noise ----------
const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const vnoise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
};
export const fbm = (x: number, y: number, s: number) => vnoise(x, y, s) * 0.55 + vnoise(x * 2.1, y * 2.1, s + 3) * 0.3 + vnoise(x * 4.3, y * 4.3, s + 7) * 0.15;

// ---------- volcano ----------
export type VolcanoKind = "strato" | "shield" | "caldera";

export type VolcanoSpec = {
  radius: number;
  height: number;
  kind?: VolcanoKind;
  seed?: number;
  /** Green (vegetated) lower slopes, as on Indonesian volcanoes. */
  green?: number;
};

const C = {
  forest: new THREE.Color("#3F6B3E"),
  forestLight: new THREE.Color("#6F8E5A"),
  soil: new THREE.Color("#7A6450"),
  rock: new THREE.Color("#5E5853"),
  ash: new THREE.Color("#8C8780"),
  crater: new THREE.Color("#2A2320"),
  basalt: new THREE.Color("#3A3633"),
};

export const makeVolcanoGeometry = ({ radius: R, height: H, kind = "strato", seed = 1, green = 0.5 }: VolcanoSpec) => {
  const rc = kind === "shield" ? R * 0.16 : kind === "caldera" ? R * 0.3 : R * 0.12;
  const cd = kind === "shield" ? H * 0.06 : kind === "caldera" ? H * 0.28 : H * 0.14;
  const pts: THREE.Vector2[] = [];
  const N = 44;
  for (let i = 0; i <= N; i++) {
    const u = i / N; // 0 base -> 1 rim
    const r = kind === "shield" ? rc + (R - rc) * (1 - Math.pow(u, 0.75)) : rc + (R - rc) * Math.pow(1 - u, 2.3);
    const y = kind === "shield" ? H * (1 - Math.pow(1 - u, 1.6)) : H * u;
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  // crater floor
  pts.push(new THREE.Vector2(rc * 0.75, H - cd * 0.6));
  pts.push(new THREE.Vector2(rc * 0.45, H - cd));
  pts.push(new THREE.Vector2(0.001, H - cd));
  const g = new THREE.LatheGeometry(pts, 128);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const cols: number[] = [];
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const ang = Math.atan2(z, x);
    const u = clamp(y / H);
    const nx = x / R;
    const nz = z / R;
    const n = fbm(nx * 2.4 + 5, nz * 2.4 - 3, seed);
    const gully = Math.sin(ang * 17 + n * 3) * 0.5 + Math.sin(ang * 31 + seed) * 0.25;
    const inCrater = r < rc * 0.95 && y > H - cd * 1.05;
    const flank = inCrater ? 0 : 4 * u * (1 - u);
    const rr = r * (1 + 0.07 * n + 0.035 * gully * flank) ;
    const k = r > 1e-4 ? rr / r : 1;
    x *= k;
    z *= k;
    y += H * (0.035 * fbm(nx * 3.1, nz * 3.1, seed + 11) * (inCrater ? 0.3 : 1)) - (u < 0.02 ? 0.02 * H : 0);
    pos.setXYZ(i, x, y, z);
    // colour by height, gullies, noise
    const vegLine = green * (0.55 + 0.12 * n);
    if (inCrater) col.copy(C.crater).lerp(C.rock, 0.25 + 0.25 * (n + 1) * 0.5);
    else if (u < vegLine) col.copy(C.forest).lerp(C.forestLight, clamp(0.5 + n)).lerp(C.soil, smooth((u - vegLine + 0.08) / 0.08) * 0.8);
    else col.copy(C.soil).lerp(C.rock, smooth((u - vegLine) / 0.3)).lerp(C.ash, clamp(0.35 * gully + 0.25 * n + 0.2));
    if (kind === "shield") col.lerp(C.basalt, 0.45 * u);
    col.multiplyScalar(0.86 + 0.14 * gully);
    cols.push(col.r, col.g, col.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return { geo: g, craterR: rc, craterY: H - cd };
};

export const Volcano: React.FC<
  VolcanoSpec & {
    position?: [number, number, number];
    scale?: number | [number, number, number];
    glow?: number; // crater glow 0..1
    glowColor?: string;
  }
> = ({ position = [0, 0, 0], scale = 1, glow = 0, glowColor = "#FF7A2E", ...spec }) => {
  const v = useMemo(() => makeVolcanoGeometry(spec), [spec.radius, spec.height, spec.kind, spec.seed, spec.green]);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={v.geo} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0} flatShading={false} side={THREE.DoubleSide} />
      </mesh>
      {glow > 0.01 && (
        <>
          <mesh position={[0, v.craterY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[v.craterR * 0.55, 32]} />
            <meshBasicMaterial color={glowColor} toneMapped={false} transparent opacity={0.4 + 0.6 * glow} />
          </mesh>
          <pointLight position={[0, v.craterY + spec.height * 0.15, 0]} color={glowColor} intensity={6 * glow} distance={spec.radius * 2.5} />
        </>
      )}
    </group>
  );
};

// ---------- ash plume ----------
export const AshPlume: React.FC<{
  t: number; // seconds since plume start (negative = hidden)
  origin: [number, number, number];
  height: number;
  spread?: number; // umbrella radius at the top
  count?: number;
  size?: number;
  rise?: number; // seconds to reach full height
  color?: string;
  seed?: number;
  glowBase?: boolean;
}> = ({ t, origin, height, spread = height * 0.5, count = 70, size = height * 0.09, rise = 3, color = "#9C958E", seed = 5, glowBase = true }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: count }, () => [r(), r(), r(), r()]);
  }, [count, seed]);
  const cols = useMemo(() => {
    const out = new Float32Array(count * 3);
    const c = new THREE.Color();
    seeds.forEach(([a, , , d], i) => {
      c.set(color).multiplyScalar(0.75 + 0.45 * d);
      if (glowBase && a < 0.1) c.lerp(new THREE.Color("#C8643A"), 0.45);
      c.toArray(out, i * 3);
    });
    return out;
  }, [seeds, color, glowBase, count]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    seeds.forEach(([a, b, c, d], i) => {
      const life = t - a * rise * 0.6;
      if (life <= 0) {
        o.scale.setScalar(0.0001);
      } else {
        const k = clamp(life / rise);
        const hk = a * smooth(k); // height share
        const top = smooth((hk - 0.7) / 0.3); // umbrella at the top
        const ang = b * Math.PI * 2 + life * 0.15;
        const rad = (0.08 + 0.25 * hk) * height * 0.25 * (0.5 + c) + top * spread * (0.4 + 0.6 * c);
        o.position.set(origin[0] + Math.cos(ang) * rad, origin[1] + hk * height + Math.sin(life * 0.7 + d * 6) * size * 0.2, origin[2] + Math.sin(ang) * rad);
        o.rotation.set(a * 6, b * 6 + life * 0.1, c * 6);
        o.scale.setScalar(size * (0.6 + 0.9 * d) * (0.4 + 0.6 * smooth(life / 0.8)) * (1 + 0.8 * hk));
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, seeds, origin, height, spread, size, rise]);
  if (t <= 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <icosahedronGeometry args={[1, 3]}>
        <instancedBufferAttribute attach="attributes-color" args={[cols, 3]} />
      </icosahedronGeometry>
      <meshStandardMaterial vertexColors roughness={1} />
    </instancedMesh>
  );
};

// ---------- sea ----------
export const Sea: React.FC<{ t: number; size?: number; y?: number; color?: string; deep?: string; seg?: number }> = ({ t, size = 80, y = 0, color = "#2E8FC0", deep = "#14506F", seg = 90 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const cols: number[] = [];
    const a = new THREE.Color(color);
    const b = new THREE.Color(deep);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const d = Math.hypot(pos.getX(i), pos.getZ(i)) / (size / 2);
      c.copy(a).lerp(b, clamp(d * 1.2 + 0.15 * fbm(pos.getX(i) * 0.2, pos.getZ(i) * 0.2, 4)));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }, [size, color, deep, seg]);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, 0.05 * Math.sin(x * 0.9 + t * 1.3) + 0.035 * Math.sin(z * 1.3 - t * 1.1 + x * 0.4));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [t, geo]);
  return (
    <mesh geometry={geo} position={[0, y, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.28} metalness={0.15} />
    </mesh>
  );
};

// ---------- sky dome ----------
export const SkyDome: React.FC<{ top: string; horizon: string; bottom?: string; radius?: number }> = ({ top, horizon, bottom, radius = 120 }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(radius, 48, 24);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const cols: number[] = [];
    const ct = new THREE.Color(top);
    const ch = new THREE.Color(horizon);
    const cb = new THREE.Color(bottom ?? horizon);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / radius;
      if (h >= 0) c.copy(ch).lerp(ct, Math.pow(h, 0.6));
      else c.copy(ch).lerp(cb, Math.min(1, -h * 4));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }, [top, horizon, bottom, radius]);
  return (
    <mesh geometry={geo} ref={fx}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} toneMapped={false} fog={false} depthWrite={false} />
    </mesh>
  );
};

// ---------- sun / glow ----------
export const Glow: React.FC<{ position: [number, number, number]; size: number; color: string; opacity?: number }> = ({ position, size, color, opacity = 1 }) => {
  const tex = useMemo(() => makeGlow(), []);
  return (
    <sprite ref={fx} position={position} scale={[size, size, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />
    </sprite>
  );
};

// ---------- 3D label (always faces the lens) ----------
export const Label3D: React.FC<{ text: string; accent: string; position: [number, number, number]; h?: number; o?: number; depthTest?: boolean }> = ({ text, accent, position, h = 0.3, o = 1, depthTest = false }) => {
  const l = useMemo(() => makeLabel(text, accent), [text, accent]);
  if (o <= 0.01) return null;
  return (
    <sprite ref={fx} position={position} scale={[h * l.aspect, h, 1]} center={new THREE.Vector2(0, 0.5)} renderOrder={10}>
      <spriteMaterial map={l.tex} transparent opacity={o} depthTest={depthTest} depthWrite={false} toneMapped={false} fog={false} />
    </sprite>
  );
};

/** Expanding ring on a horizontal plane (sound / pressure wave). */
export const Ring: React.FC<{ r: number; o: number; y?: number; color: string; width?: number; center?: [number, number] }> = ({ r, o, y = 0.06, color, width = 0.04, center = [0, 0] }) =>
  o <= 0.01 ? null : (
    <mesh ref={fx} position={[center[0], y, center[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={r}>
      <ringGeometry args={[1 - width, 1, 128]} />
      <meshBasicMaterial color={color} transparent opacity={o} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
