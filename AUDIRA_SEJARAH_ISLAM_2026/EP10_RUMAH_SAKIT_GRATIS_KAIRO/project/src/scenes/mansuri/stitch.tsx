import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { feltMaterial, fuzzAlphaTexture } from "../../kits/feltcraft/lib/materials";

// Felt building blocks for the Bimaristan diorama: running stitches along any path, extruded
// felt shapes with a soft bevel, and the pointed (Mamluk) arch outline.

type V3 = [number, number, number];

/** Running stitch: dashes of thread laid along a polyline (length-sampled). */
export const RunningStitch: React.FC<{ pts: V3[]; color: string; dash?: number; gap?: number; r?: number; linear?: boolean }> = ({ pts, color, dash = 0.07, gap = 0.045, r = 0.011, linear = false }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { mats, n } = useMemo(() => {
    const vs = pts.map((p) => new THREE.Vector3(...p));
    let curve: THREE.Curve<THREE.Vector3>;
    if (linear) {
      const cp = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 1; i < vs.length; i++) cp.add(new THREE.LineCurve3(vs[i - 1], vs[i]));
      curve = cp;
    } else curve = new THREE.CatmullRomCurve3(vs, false, "centripetal");
    const L = curve.getLength();
    const step = dash + gap;
    const count = Math.max(1, Math.floor(L / step));
    const out: THREE.Matrix4[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const u = (i * step + dash / 2) / L;
      const p = curve.getPointAt(Math.min(1, u));
      const tng = curve.getTangentAt(Math.min(1, u)).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(up, tng);
      out.push(new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1)));
    }
    return { mats: out, n: count };
  }, [pts, dash, gap, linear]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    mats.forEach((mx, i) => m.setMatrixAt(i, mx));
    m.instanceMatrix.needsUpdate = true;
  }, [mats]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} castShadow>
      <capsuleGeometry args={[r, dash, 3, 6]} />
      <meshStandardMaterial color={color} roughness={1} />
    </instancedMesh>
  );
};

/** Pointed arch outline from the springing line up to the apex (x from -w/2 to w/2). */
export const archPoints = (w: number, spring: number, k = 0.85, n = 24): [number, number][] => {
  const R = w * k;
  const cx = -w / 2 + R;
  const thEnd = Math.acos(Math.max(-1, Math.min(1, -cx / R))); // angle where x = 0 on the left arc
  const left: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const th = Math.PI - (Math.PI - thEnd) * (i / n);
    left.push([cx + R * Math.cos(th), spring + R * Math.sin(th)]);
  }
  const right = left.slice(0, -1).reverse().map(([x, y]) => [-x, y] as [number, number]);
  return [[-w / 2, 0], ...left, ...right, [w / 2, 0]];
};

const matCache = new Map<string, THREE.Material>();
export const felt = (color: string, repeat = 1.2) => {
  const key = `${color}-${repeat}`;
  let m = matCache.get(key);
  if (!m) {
    m = feltMaterial(color, repeat);
    matCache.set(key, m);
  }
  return m;
};

/** Fuzz shell for large felt surfaces: alpha-tested fibre speckle at a density set by `rep`. */
const shellCache = new Map<string, THREE.Material>();
export const fuzzShell = (color: string, level: number, rep: number) => {
  const key = `${color}-${level}-${rep.toFixed(1)}`;
  let m = shellCache.get(key);
  if (!m) {
    const a = fuzzAlphaTexture().clone();
    a.repeat.set(rep, rep);
    a.needsUpdate = true;
    m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.1 + level * 0.06),
      alphaMap: a,
      alphaTest: 0.42 + level * 0.14,
      roughness: 1,
      side: THREE.DoubleSide,
    });
    shellCache.set(key, m);
  }
  return m;
};

/** Felt box: matte fibre base + two fuzz shells (constant ~6 mm offset) so walls read as wool, not card. */
export const FeltBox: React.FC<{ args: V3; color: string; position?: V3; rotation?: V3; scale?: V3; cast?: boolean }> = ({ args, color, position, rotation, scale, cast = true }) => {
  const big = Math.max(...args);
  const rep = Math.max(1.5, big * 2.6);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={felt(color, rep)} castShadow={cast} receiveShadow>
        <boxGeometry args={args} />
      </mesh>
      {[0, 1].map((k) => (
        <mesh key={k} material={fuzzShell(color, k, big * 14)} scale={args.map((d) => 1 + (2 * 0.006 * (k + 1)) / Math.max(0.02, d)) as V3}>
          <boxGeometry args={args} />
        </mesh>
      ))}
    </group>
  );
};

/** Extruded felt shape (outline + optional holes) with a puffy bevel. */
export const FeltShape: React.FC<{
  outline: [number, number][];
  holes?: [number, number][][];
  depth?: number;
  bevel?: number;
  color: string;
  repeat?: number;
  position?: V3;
  rotation?: V3;
}> = ({ outline, holes = [], depth = 0.12, bevel = 0.04, color, repeat = 2.6, position, rotation }) => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
    return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 4, curveSegments: 12 });
  }, [outline, holes, depth, bevel]);
  // fuzz shells pushed a few mm off the front face (shape UVs are in world units)
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={felt(color, repeat)} castShadow receiveShadow />
      {[0, 1].map((k) => (
        <mesh key={k} geometry={geo} material={fuzzShell(color, k, 6)} position={[0, 0, 0.006 * (k + 1)]} />
      ))}
    </group>
  );
};

export const rect = (x0: number, y0: number, x1: number, y1: number): [number, number][] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
