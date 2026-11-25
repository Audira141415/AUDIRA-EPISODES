// AE-067 world parts (WORLDFORGE): earth cut-away sections, tunnels carved into them, water,
// a mountain reservoir heightfield and a gradient sky. Pure functions of their props + time t.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useSurfaceGrain, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { fbm, ridged, mulberry32, hash2 } from "../../kits/worldforge/noise.ts";

export type V3 = [number, number, number];
export type P2 = [number, number];

// ── 2D helpers ──────────────────────────────────────────────────────────────────
/** Smooth x-ordered control points into a dense polyline. */
export const smoothPath = (pts: P2[], n = 240): P2[] => {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, "centripetal");
  return c.getSpacedPoints(n).map((v) => [v.x, v.y] as P2);
};
/** y of an x-monotone polyline at x (clamped at the ends). */
export const yAt = (line: P2[], x: number) => {
  if (x <= line[0][0]) return line[0][1];
  for (let i = 1; i < line.length; i++) {
    if (line[i][0] >= x) {
      const [x0, y0] = line[i - 1], [x1, y1] = line[i];
      return y0 + ((y1 - y0) * (x - x0)) / Math.max(1e-6, x1 - x0);
    }
  }
  return line[line.length - 1][1];
};
export type Fr = { p: P2; n: P2; s: number }[];
export const frames = (path: P2[]): Fr => {
  let s = 0;
  return path.map((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    if (i > 0) s += Math.hypot(p[0] - path[i - 1][0], p[1] - path[i - 1][1]);
    return { p, n: [-ty / l, tx / l] as P2, s };
  });
};
export const pathLen = (f: Fr) => f[f.length - 1].s;
/** Point at arc length s along a framed path. */
export const pointAt = (f: Fr, s: number): P2 => {
  if (s <= 0) return f[0].p;
  for (let i = 1; i < f.length; i++) {
    if (f[i].s >= s) {
      const u = (s - f[i - 1].s) / Math.max(1e-6, f[i].s - f[i - 1].s);
      return [f[i - 1].p[0] + (f[i].p[0] - f[i - 1].p[0]) * u, f[i - 1].p[1] + (f[i].p[1] - f[i - 1].p[1]) * u];
    }
  }
  return f[f.length - 1].p;
};
const segDist = (x: number, y: number, a: P2, b: P2) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
  return Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy);
};
export const distToPath = (path: P2[], x: number, y: number) => {
  let d = Infinity;
  for (let i = 1; i < path.length; i++) d = Math.min(d, segDist(x, y, path[i - 1], path[i]));
  return d;
};

// ── strata colours ──────────────────────────────────────────────────────────────
export type Strata = { top: string; soil: string; clay: string; sand: string; rock: string; deep: string };
export const STRATA: Strata = { top: "#5f9a3a", soil: "#7a4624", clay: "#bb7438", sand: "#d6a75e", rock: "#a07e5c", deep: "#8a6a4a" };
export const STRATA_CITY: Strata = { top: "#5c5a57", soil: "#6e4426", clay: "#b06e3a", sand: "#cc9f62", rock: "#9a7d60", deep: "#836a50" };
const C = (s: string) => new THREE.Color(s);
const strataColor = (st: Strata, x: number, y: number, depth: number, out: THREE.Color) => {
  const d = depth + 1.8 * Math.sin(x * 0.06 + y * 0.02) + 2.4 * fbm(x * 0.05, y * 0.05, 4);
  const cs = [C(st.top), C(st.soil), C(st.clay), C(st.sand), C(st.rock), C(st.deep)];
  const stops = [0.7, 4, 10, 16, 30];
  let i = 0;
  while (i < stops.length && d > stops[i]) i++;
  out.copy(cs[i]);
  if (i > 0 && i < cs.length) {
    // soft blend into the next band
    const a = stops[i - 1], b = stops[i] ?? a + 10;
    const u = Math.max(0, Math.min(1, (d - a) / (b - a)));
    out.lerp(cs[Math.min(cs.length - 1, i + 1)], 0.25 * u * u);
  }
  // pebbles / fine variation
  const v = 0.78 + 0.3 * hash2(Math.floor(x * 2.3), Math.floor(y * 2.3), 11) + 0.18 * fbm(x * 0.4, y * 0.4, 2);
  out.multiplyScalar(v);
  return out;
};

// ── cut face: a deformed grid (x columns, each from `bottom` up to the ground line) ─────
export const SectionFace: React.FC<{
  ground: P2[];
  bottom: number;
  x0: number;
  x1: number;
  nx?: number;
  ny?: number;
  strata?: Strata;
  /** triangles whose centroid satisfies this are dropped (tunnel openings) */
  skip?: (x: number, y: number) => boolean;
  z?: number;
}> = ({ ground, bottom, x0, x1, nx = 220, ny = 70, strata = STRATA, skip, z = 0 }) => {
  const grain = useSurfaceGrain(23, 0.42, 1);
  const geo = useMemo(() => {
    const pos: number[] = [], col: number[] = [], uv: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i <= nx; i++) {
      const x = x0 + ((x1 - x0) * i) / nx;
      const gy = yAt(ground, x);
      for (let j = 0; j <= ny; j++) {
        const y = bottom + ((gy - bottom) * j) / ny;
        pos.push(x, y, z);
        strataColor(strata, x, y, gy - y, c);
        col.push(c.r, c.g, c.b);
        uv.push(x / 9, y / 9);
      }
    }
    const idx: number[] = [];
    const P = (i: number, j: number) => i * (ny + 1) + j;
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const a = P(i, j), b = P(i + 1, j), cc = P(i + 1, j + 1), d = P(i, j + 1);
        for (const tri of [[a, b, cc], [a, cc, d]]) {
          if (skip) {
            const cx = (pos[tri[0] * 3] + pos[tri[1] * 3] + pos[tri[2] * 3]) / 3;
            const cy = (pos[tri[0] * 3 + 1] + pos[tri[1] * 3 + 1] + pos[tri[2] * 3 + 1]) / 3;
            if (skip(cx, cy)) continue;
          }
          idx.push(...tri);
        }
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [ground, bottom, x0, x1, nx, ny, strata, skip, z]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.9} roughnessMap={grain} bumpMap={grain} bumpScale={3} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Ground top surface following the ground line, from z=0 back to z=-depth. */
export const SectionTop: React.FC<{ ground: P2[]; x0: number; x1: number; depth: number; color?: string; color2?: string; nx?: number; seed?: number }> = ({
  ground,
  x0,
  x1,
  depth,
  color = "#6f8f45",
  color2 = "#8a9a55",
  nx = 220,
  seed = 3,
}) => {
  const grain = useSurfaceGrain(31, 0.32, 1);
  const geo = useMemo(() => {
    const nz = 24;
    const pos: number[] = [], col: number[] = [], uv: number[] = [];
    const a = C(color), b = C(color2), c = new THREE.Color();
    for (let i = 0; i <= nx; i++) {
      const x = x0 + ((x1 - x0) * i) / nx;
      const gy = yAt(ground, x);
      for (let k = 0; k <= nz; k++) {
        const z = (-depth * k) / nz;
        pos.push(x, gy, z);
        const n = 0.5 + 0.5 * fbm(x * 0.04 + seed, z * 0.04, 3);
        c.copy(a).lerp(b, n).multiplyScalar(0.9 + 0.2 * hash2(Math.floor(x * 1.7), Math.floor(z * 1.7), seed));
        col.push(c.r, c.g, c.b);
        uv.push(x / 7, z / 7);
      }
    }
    const idx: number[] = [];
    const P = (i: number, k: number) => i * (nz + 1) + k;
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) idx.push(P(i, k), P(i, k + 1), P(i + 1, k + 1), P(i, k), P(i + 1, k + 1), P(i + 1, k));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [ground, x0, x1, depth, color, color2, nx, seed]);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.92} roughnessMap={grain} bumpMap={grain} bumpScale={3} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Side cap of a section at x = const (z from 0 to -depth). */
export const SectionEnd: React.FC<{ ground: P2[]; x: number; bottom: number; depth: number; strata?: Strata }> = ({ ground, x, bottom, depth, strata = STRATA }) => {
  const grain = useSurfaceGrain(23, 0.42, 1);
  const geo = useMemo(() => {
    const nz = 30, ny = 50;
    const gy = yAt(ground, x);
    const pos: number[] = [], col: number[] = [], uv: number[] = [];
    const c = new THREE.Color();
    for (let k = 0; k <= nz; k++)
      for (let j = 0; j <= ny; j++) {
        const z = (-depth * k) / nz, y = bottom + ((gy - bottom) * j) / ny;
        pos.push(x, y, z);
        strataColor(strata, z + x, y, gy - y, c);
        col.push(c.r, c.g, c.b);
        uv.push(z / 9, y / 9);
      }
    const idx: number[] = [];
    const P = (k: number, j: number) => k * (ny + 1) + j;
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) idx.push(P(k, j), P(k + 1, j), P(k + 1, j + 1), P(k, j), P(k + 1, j + 1), P(k, j + 1));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [ground, x, bottom, depth, strata]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.9} roughnessMap={grain} bumpMap={grain} bumpScale={3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ── ribbons swept along a path in the XY plane (profile = [offset along normal, z]) ─────
const ribbon = (fr: Fr, prof: P2[], uScale: number) => {
  const pos: number[] = [], uv: number[] = [];
  const m = prof.length;
  fr.forEach((f) => {
    prof.forEach(([u, z], k) => {
      pos.push(f.p[0] + f.n[0] * u, f.p[1] + f.n[1] * u, z);
      uv.push(f.s / uScale, k / (m - 1));
    });
  });
  const idx: number[] = [];
  for (let i = 0; i < fr.length - 1; i++)
    for (let k = 0; k < m - 1; k++) {
      const a = i * m + k, b = (i + 1) * m + k;
      idx.push(a, b, b + 1, a, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** Streaky water texture (seeded). One per component instance, its offset animates the flow. */
export const useFlowTexture = (seed: number, base: string, streak: string, repeatX: number) =>
  useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 128;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 128);
    const r = mulberry32(seed);
    for (let i = 0; i < 140; i++) {
      const x = r() * 512, y = r() * 128, w = 20 + r() * 90, h = 1 + r() * 3.5;
      ctx.globalAlpha = 0.12 + r() * 0.4;
      ctx.fillStyle = streak;
      ctx.fillRect(x, y, w, h);
      ctx.fillRect(x - 512, y, w, h);
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [seed, base, streak, repeatX]);

/**
 * Tunnel carved along `path` and cut open at the z=0 plane: concave concrete lining (radius r)
 * behind the cut, the lining's cut faces as raised bands (r..R), and the water section filling it.
 */
export const TunnelCut: React.FC<{
  path: P2[];
  r: number;
  R: number;
  t: number;
  flow?: number; // m/s of the streak texture, 0 = still
  water?: number; // 0..1 opacity of the water face (0 = empty)
  waterColor?: string;
  streak?: string;
  lining?: string;
  glow?: number;
  seed?: number;
}> = ({ path, r, R, t, flow = 6, water = 0.9, waterColor = "#2f86a8", streak = "#bfe9ff", lining = "#cdc8bd", glow = 0, seed = 5 }) => {
  const fr = useMemo(() => frames(path), [path]);
  const len = pathLen(fr);
  const grain = useSurfaceGrain(41, 0.26, 1);
  const shell = useMemo(() => {
    const prof: P2[] = [];
    for (let k = 0; k <= 16; k++) {
      const a = (Math.PI * k) / 16;
      prof.push([r * Math.cos(a), -r * Math.sin(a)]);
    }
    return ribbon(fr, prof, 6);
  }, [fr, r]);
  const bandA = useMemo(() => ribbon(fr, [[r, 0.35], [R + 0.7, 0.35]], 6), [fr, r, R]);
  const bandB = useMemo(() => ribbon(fr, [[-R - 0.7, 0.35], [-r, 0.35]], 6), [fr, r, R]);
  const lipA = useMemo(() => ribbon(fr, [[r, -0.2], [r, 0.35]], 6), [fr, r]);
  const lipB = useMemo(() => ribbon(fr, [[-r, 0.35], [-r, -0.2]], 6), [fr, r]);
  const face = useMemo(() => ribbon(fr, [[-r, -0.15], [r, -0.15]], len), [fr, r, len]);
  const tex = useFlowTexture(seed, waterColor, streak, Math.max(1, len / 14));
  tex.offset.x = -(t * flow) / 14;
  return (
    <group>
      <mesh geometry={shell} receiveShadow>
        <meshStandardMaterial color={lining} roughness={0.85} bumpMap={grain} bumpScale={0.8} side={THREE.DoubleSide} />
      </mesh>
      {[bandA, bandB, lipA, lipB].map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial color={lining} roughness={0.8} bumpMap={grain} bumpScale={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {water > 0.01 && (
        <mesh geometry={face}>
          <meshStandardMaterial map={tex} transparent opacity={water} roughness={0.12} metalness={0} emissive={waterColor} emissiveIntensity={0.35 + glow} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

/** Flat raised concrete band (vertical shaft or portal seen on the cut). */
export const ShaftBand: React.FC<{ x: number; y0: number; y1: number; w: number; color?: string }> = ({ x, y0, y1, w, color = "#b9b4aa" }) => {
  const grain = useSurfaceGrain(41, 0.26, 1);
  return (
    <mesh position={[x, (y0 + y1) / 2, 0.2]} castShadow receiveShadow>
      <RoundedBoxGeo args={[w, Math.abs(y1 - y0), 0.8]} radius={0.15} />
      <meshStandardMaterial color={color} roughness={0.82} bumpMap={grain} bumpScale={0.6} />
    </mesh>
  );
};

/** Water body cut at z=0 (extruded polygon, front face at z=0 going back to -depth). */
export const WaterBody: React.FC<{ poly: P2[]; depth: number; color: string; streak: string; t: number; flow?: number; opacity?: number; seed?: number }> = ({
  poly,
  depth,
  color,
  streak,
  t,
  flow = 0.6,
  opacity = 0.88,
  seed = 9,
}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, -depth);
    // planar uv for the streak texture
    const p = g.attributes.position;
    const uv: number[] = [];
    for (let i = 0; i < p.count; i++) uv.push(p.getX(i) / 30 + p.getZ(i) / 30, p.getY(i) / 6);
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    return g;
  }, [poly, depth]);
  const tex = useFlowTexture(seed, color, streak, 1);
  tex.offset.x = -t * flow * 0.05;
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={tex} transparent opacity={opacity} roughness={0.1} metalness={0.05} emissive={color} emissiveIntensity={0.18} />
    </mesh>
  );
};

/** Water polygon of a basin in an x-monotone ground line, below level `top`, between xa..xb. */
export const basinPoly = (ground: P2[], xa: number, xb: number, top: number): P2[] => {
  const out: P2[] = [[xa, top]];
  for (const [x, y] of ground) if (x > xa && x < xb) out.push([x, Math.min(y, top)]);
  out.push([xb, top]);
  return out;
};

// ── face with circular openings (pipes running into -z) ─────────────────────────────────
export const HoleFace: React.FC<{ x0: number; x1: number; y0: number; top: number; holes: { x: number; y: number; R: number }[]; strata?: Strata; n?: number }> = ({
  x0,
  x1,
  y0,
  top,
  holes,
  strata = STRATA_CITY,
  n = 160,
}) => {
  const ground = useMemo<P2[]>(() => [[x0, top], [x1, top]], [x0, x1, top]);
  const skip = useMemo(() => (x: number, y: number) => holes.some((h) => Math.hypot(x - h.x, y - h.y) < h.R), [holes]);
  return <SectionFace ground={ground} bottom={y0} x0={x0} x1={x1} nx={n} ny={Math.round(n * ((top - y0) / (x1 - x0)) * 1.6)} strata={strata} skip={skip} />;
};

/** Pipe running from the z=0 cut back to -length: concrete inner wall, front ring, water core. */
export const Pipe: React.FC<{
  x: number;
  y: number;
  r: number;
  R: number;
  length: number;
  t: number;
  fill?: number; // 0..1 of the bore
  waterColor?: string;
  streak?: string;
  flow?: number;
  lining?: string;
  seed?: number;
}> = ({ x, y, r, R, length, t, fill = 1, waterColor = "#2f86a8", streak = "#bfe9ff", flow = 4, lining = "#bdb8ae", seed = 3 }) => {
  const grain = useSurfaceGrain(41, 0.26, 1);
  const tex = useFlowTexture(seed, waterColor, streak, 2);
  tex.offset.y = (t * flow) / 16;
  const wr = r * 0.985;
  return (
    <group position={[x, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -length / 2]} receiveShadow>
        <cylinderGeometry args={[r, r, length, 48, 1, true]} />
        <meshStandardMaterial color={lining} roughness={0.85} bumpMap={grain} bumpScale={0.6} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 0, 0.05]} castShadow receiveShadow>
        <ringGeometry args={[r, R + 0.6, 64]} />
        <meshStandardMaterial color={lining} roughness={0.8} bumpMap={grain} bumpScale={0.6} side={THREE.DoubleSide} />
      </mesh>
      {fill > 0.01 && (
        <group>
          {/* water column along the bore (streaks ripple along the pipe) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -(1 - fill) * wr, -length / 2]}>
            <cylinderGeometry args={[wr * Math.min(1, 0.3 + fill), wr * Math.min(1, 0.3 + fill), length, 40, 1, false]} />
            <meshStandardMaterial map={tex} transparent opacity={0.82} roughness={0.12} emissive={waterColor} emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ── mountain reservoir heightfield ──────────────────────────────────────────────────────
export const DAM_Z = 34;
/** Valley running north (−z) to south (+z); lake upstream of the dam at y = 0. */
export const valleyH = (x: number, z: number) => {
  const w = 30 + 8 * Math.sin(z * 0.012) + 6 * Math.min(1, Math.max(0, (DAM_Z - z) / 120));
  const floor = z < DAM_Z ? -9 : -9 - (z - DAM_Z) * 0.16;
  const wall = Math.pow(Math.abs(x) / w, 1.8) * 20;
  const mount = Math.max(0, Math.abs(x) - w * 0.7) * 0.35 * (0.7 + 0.6 * ridged(x * 0.012 + 3, z * 0.012, 4));
  const n = fbm(x * 0.02, z * 0.02, 4) * 6;
  return floor + wall + mount + n * Math.min(1, Math.abs(x) / 25);
};

export const Valley: React.FC<{ size?: number; seg?: number }> = ({ size = 900, seg = 220 }) => {
  const grain = useSurfaceGrain(17, 0.34, 1);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -size * 0.25);
    const p = g.attributes.position;
    const col: number[] = [];
    const uv: number[] = [];
    const grass = C("#5f8a3c"), grass2 = C("#86a050"), rock = C("#8a8479"), snow = C("#e8ebee"), shore = C("#b9a47a"), forest = C("#3f6630");
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const h = valleyH(x, z);
      p.setY(i, h);
      const e = 1.5;
      const slope = Math.hypot(valleyH(x + e, z) - valleyH(x - e, z), valleyH(x, z + e) - valleyH(x, z - e)) / (2 * e);
      const n = 0.5 + 0.5 * fbm(x * 0.03, z * 0.03, 3);
      c.copy(grass).lerp(grass2, n);
      if (n > 0.55 && h > 3 && h < 45) c.lerp(forest, 0.6);
      if (h > -1.5 && h < 1.6 && z < DAM_Z) c.copy(shore);
      if (slope > 0.9) c.lerp(rock, Math.min(1, (slope - 0.9) * 1.4));
      if (h > 70) c.lerp(snow, Math.min(1, (h - 70) / 20));
      c.multiplyScalar(0.9 + 0.2 * hash2(Math.floor(x), Math.floor(z), 5));
      col.push(c.r, c.g, c.b);
      uv.push(x / 8, z / 8);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  }, [size, seg]);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.96} bumpMap={grain} bumpScale={2} />
    </mesh>
  );
};

/** Concrete gravity dam across the valley at DAM_Z (vertical upstream face, sloped downstream). */
export const Dam: React.FC = () => {
  const grain = useSurfaceGrain(43, 0.3, 4);
  const geo = useMemo(() => {
    const s = new THREE.Shape([new THREE.Vector2(0, -14), new THREE.Vector2(0, 4), new THREE.Vector2(5, 4), new THREE.Vector2(20, -14)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: 96, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 2 });
    // shape x = downstream (+z), shape y = height; extrude along world x
    g.rotateY(-Math.PI / 2);
    g.translate(48, 0, DAM_Z);
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#c9c3b6" roughness={0.8} bumpMap={grain} bumpScale={1} />
      </mesh>
      {/* crest road + parapet */}
      <mesh position={[0, 4.6, DAM_Z + 0.4]} castShadow>
        <RoundedBoxGeo args={[96, 1.2, 0.5]} radius={0.15} />
        <meshStandardMaterial color="#d8d2c6" roughness={0.7} />
      </mesh>
    </group>
  );
};

/** Lake surface with slow ripples in the streak texture. */
export const Lake: React.FC<{ t: number }> = ({ t }) => {
  const tex = useFlowTexture(21, "#2c6b70", "#9fd3d0", 6);
  tex.offset.x = t * 0.004;
  tex.offset.y = t * 0.002;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, DAM_Z - 260]} receiveShadow>
      <planeGeometry args={[500, 520]} />
      <meshPhysicalMaterial map={tex} roughness={0.06} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} transparent opacity={0.93} />
    </mesh>
  );
};

/** Seeded scatter positions on the valley slopes (for GLB pines). */
export const pineSpots = (n: number, seed: number, box: [number, number, number, number]): V3[] => {
  const r = mulberry32(seed);
  const out: V3[] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 40) {
    const x = box[0] + r() * (box[1] - box[0]), z = box[2] + r() * (box[3] - box[2]);
    const h = valleyH(x, z);
    if (h < 2.5 || h > 40) continue;
    out.push([x, h - 0.3, z]);
  }
  return out;
};

// ── sky ─────────────────────────────────────────────────────────────────────────────────
export const SkyGrad: React.FC<{ top: string; horizon: string; bottom?: string }> = ({ top, horizon, bottom = horizon }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { cTop: { value: new THREE.Color(top) }, cHor: { value: new THREE.Color(horizon) }, cBot: { value: new THREE.Color(bottom) } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 cTop; uniform vec3 cHor; uniform vec3 cBot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(cHor, cTop, pow(clamp(h,0.0,1.0), 0.55)) : mix(cHor, cBot, clamp(-h*4.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }",
      }),
    [top, horizon, bottom],
  );
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[3000, 32, 16]} />
    </mesh>
  );
};
