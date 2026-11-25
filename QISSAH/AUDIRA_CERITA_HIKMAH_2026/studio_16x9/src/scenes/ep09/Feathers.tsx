// EP09 feathers: thousands of faceted low-poly feathers (and cotton tufts) bursting from the torn
// pillow and carried by the wind across the town. Instanced, and a pure function of `u` = seconds
// since the pillow was torn, so any frame can be rendered alone (Remotion render tabs).

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { PAL } from "./palette.ts";

/** Wind direction over the town: to screen-right and away from the camera, toward river and hill. */
export const WIND = new THREE.Vector3(1, 0, -0.62).normalize();
const PERP = new THREE.Vector3(-WIND.z, 0, WIND.x); // horizontal, across the wind

type Seedling = {
  delay: number; v0: THREE.Vector3; speed: number; lift: number; fall: number; spread: number;
  fl: [number, number, number, number]; rot: [number, number, number, number]; scale: number;
};

const makeSeeds = (n: number, seed: number): Seedling[] => {
  const r = prng(seed);
  return Array.from({ length: n }, () => {
    const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5; // mostly away from the camera (-z)
    const up = 2.2 + r() * 3.4;
    const out = 0.8 + r() * 2.2;
    return {
      // most feathers leave in the first second, a long tail keeps spilling from the pillow
      delay: Math.pow(r(), 1.9) * 7,
      v0: new THREE.Vector3(Math.cos(a) * out, up, Math.sin(a) * out),
      speed: 1.3 + r() * 2.4,
      lift: 1.2 + r() * 4.2,
      fall: 0.05 + r() * 0.14,
      spread: (r() - 0.5) * 2,
      fl: [0.8 + r() * 1.6, r() * 6.28, 0.6 + r() * 1.2, r() * 6.28],
      rot: [0.6 + r() * 2.2, 0.4 + r() * 1.6, r() * 6.28, 0.6 + r() * 1.4],
      scale: 0.42 + r() * 0.4,
    };
  });
};

/** Position of one particle `u` seconds after the tear (null while still inside the pillow). */
const place = (s: Seedling, u0: number, origin: THREE.Vector3, out: THREE.Vector3, gust: number): boolean => {
  const u = u0 - s.delay;
  if (u <= 0) return false;
  const k = 1.7;
  const burst = (1 - Math.exp(-k * u)) / k;
  // wind ramps up to the feather's own speed
  const ramp = u - (1 - Math.exp(-u / 1.1)) * 1.1;
  const w = s.speed * ramp * gust;
  out.copy(origin).addScaledVector(s.v0, burst).addScaledVector(WIND, w);
  // fan out across the wind as the stream travels
  out.addScaledVector(PERP, s.spread * (0.15 + ramp * 0.42));
  // rise on the gust, then sink slowly
  out.y += s.lift * (1 - Math.exp(-u / 2.4)) - s.fall * u;
  // flutter
  out.addScaledVector(PERP, Math.sin(u * s.fl[0] + s.fl[1]) * 0.35);
  out.y += Math.sin(u * s.fl[2] + s.fl[3]) * 0.22;
  out.y = Math.max(out.y, 0.08);
  return true;
};

export const featherGeo = () => {
  // A quill-and-vane feather, 4 triangles with a slight fold so the facets catch the light.
  const B = [0, 0, 0], T = [0.36, 0, 0];
  const L1 = [0.1, 0.06, 0.014], L2 = [0.25, 0.048, 0.012];
  const R1 = [0.1, -0.06, 0.014], R2 = [0.25, -0.048, 0.012];
  const tri = [B, L1, L2, B, L2, T, B, T, R2, B, R2, R1].flat();
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(tri, 3));
  g.translate(-0.16, 0, 0);
  g.computeVertexNormals();
  return g;
};

export const Feathers: React.FC<{
  /** Seconds since the pillow was torn (negative = not yet). */
  u: number;
  origin: [number, number, number];
  count?: number;
  /** Wind strength multiplier. */
  gust?: number;
  /** Fraction of feathers still visible (1 = all); later scenes thin them out. */
  keep?: number;
}> = ({ u, origin, count = 2200, gust = 1, keep = 1 }) => {
  const fRef = useRef<THREE.InstancedMesh>(null);
  const cRef = useRef<THREE.InstancedMesh>(null);
  const fSeeds = useMemo(() => makeSeeds(count, 9091), [count]);
  const cSeeds = useMemo(() => makeSeeds(Math.round(count * 0.18), 5150), [count]);
  const fGeo = useMemo(featherGeo, []);
  const o = useMemo(() => new THREE.Vector3(...origin), [origin]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const fill = (mesh: THREE.InstancedMesh | null, seeds: Seedling[], cotton: boolean) => {
      if (!mesh) return;
      seeds.forEach((s, i) => {
        const vis = i / seeds.length < keep && place(s, u, o, p, gust);
        if (!vis) {
          mesh.setMatrixAt(i, zero);
          return;
        }
        const t = u - s.delay;
        // tumble while airborne; feathers mostly glide flat-ish with a rocking roll
        e.set(Math.sin(t * s.rot[3] + s.rot[2]) * 0.9, t * s.rot[1] + s.rot[2], Math.sin(t * s.rot[0]) * 0.8 + t * 0.3);
        q.setFromEuler(e);
        // grow out of the pillow over the first 0.25 s
        const g = Math.min(1, t / 0.25) * s.scale * (cotton ? 0.8 : 1);
        sc.set(g, g, g);
        m.compose(p, q, sc);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };
    fill(fRef.current, fSeeds, false);
    fill(cRef.current, cSeeds, true);
  }, [u, o, gust, keep, fSeeds, cSeeds]);

  return (
    <group>
      <instancedMesh ref={fRef} args={[fGeo, undefined, fSeeds.length]} frustumCulled={false}>
        <meshStandardMaterial color={PAL.feather} emissive="#fff3e0" emissiveIntensity={0.22} roughness={0.7} flatShading side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={cRef} args={[undefined, undefined, cSeeds.length]} frustumCulled={false}>
        <icosahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color={PAL.cotton} emissive="#ffffff" emissiveIntensity={0.18} roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// After the storm: feathers caught on roofs, floating down the river, lying on the square.
import { TOWN, riverZ } from "./World.tsx";

type Rest = { p: THREE.Vector3; r: THREE.Euler; s: number; kind: "roof" | "river" | "square" | "air"; pick?: number };

const REST: Rest[] = (() => {
  const r = prng(777);
  const out: Rest[] = [];
  // roofs: on the slope of a random house, in world space
  for (let i = 0; i < 90; i++) {
    const h = TOWN[Math.floor(r() * TOWN.length)];
    const half = (h.w + 0.3) / 2, rh = h.w * 0.42;
    const lz = (r() - 0.5) * 2 * half * 0.85;
    const lx = (r() - 0.5) * (h.d + 0.2);
    const ly = h.h + rh * (1 - Math.abs(lz) / half) + 0.03;
    const v = new THREE.Vector3(lx, ly, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), h.heading);
    out.push({ p: new THREE.Vector3(h.x + v.x, v.y, h.z + v.z), r: new THREE.Euler(-Math.PI / 2 + (r() - 0.5) * 0.6, 0, r() * 6.28), s: 0.8 + r() * 0.3, kind: "roof" });
  }
  // river: floating, drifting downstream
  for (let i = 0; i < 70; i++) {
    const x = -40 + r() * 80;
    out.push({ p: new THREE.Vector3(x, -0.26, (r() - 0.5) * 2.2), r: new THREE.Euler(-Math.PI / 2, 0, r() * 6.28), s: 0.9 + r() * 0.4, kind: "river" });
  }
  // square: a few on the paving, picked up one by one
  const spots: [number, number][] = [[0.9, 1.75], [-0.5, 1.95], [1.9, -0.4], [-2.4, 0.6], [2.6, 1.9], [-1.6, -2.2], [0.3, -2.9], [3.0, -1.6]];
  spots.forEach(([x, z], i) => out.push({ p: new THREE.Vector3(x, 0.1, z), r: new THREE.Euler(-Math.PI / 2, 0, i * 1.7), s: 0.6, kind: "square", pick: i }));
  // air: stragglers still drifting high over the town
  for (let i = 0; i < 70; i++) {
    out.push({ p: new THREE.Vector3(2 + r() * 16, 5 + r() * 9, -24 + r() * 16), r: new THREE.Euler(r() * 6, r() * 6, r() * 6), s: 0.5 + r() * 0.3, kind: "air" });
  }
  return out;
})();

/** Settled feathers. `t` drives the river drift; `picked` hides the first N square feathers. */
export const SettledFeathers: React.FC<{ t: number; picked: number; visible?: number }> = ({ t, picked, visible = 1 }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(featherGeo, []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    REST.forEach((f, i) => {
      p.copy(f.p);
      const e = f.r.clone();
      if (f.kind === "river") {
        p.x = ((f.p.x + t * 0.35 + 40) % 80) - 40;
        p.z = riverZ(p.x) + f.p.z;
        p.y = -0.25 + Math.sin(t * 1.5 + i) * 0.02;
        e.z += Math.sin(t * 0.3 + i) * 0.4;
      }
      if (f.kind === "air") {
        p.addScaledVector(WIND, ((((t * 0.6 + i * 3.7) % 30) + 30) % 30) - 15);
        p.y += Math.sin(t * 0.8 + i) * 0.4;
        e.set(f.r.x + t * 0.7, f.r.y + t * 0.5, f.r.z);
      }
      const hide = (f.pick !== undefined && f.pick < picked) || visible <= 0;
      const s = hide ? 0 : f.s;
      sc.set(s, s, s);
      q.setFromEuler(e);
      m.compose(p, q, sc);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, picked, visible]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, REST.length]} frustumCulled={false}>
      <meshStandardMaterial color={PAL.feather} emissive="#fff3e0" emissiveIntensity={0.35} roughness={0.7} flatShading side={THREE.DoubleSide} />
    </instancedMesh>
  );
};

/** Slow foreground drift for the closing: feathers floating past the camera, wrapping in a box. */
export const DriftFeathers: React.FC<{ t: number; center: [number, number, number]; size?: number; count?: number }> = ({ t, center, size = 14, count = 140 }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(featherGeo, []);
  const seeds = useMemo(() => {
    const r = prng(31337);
    return Array.from({ length: count }, () => [r(), r(), r(), r(), r()]);
  }, [count]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), e = new THREE.Euler();
    seeds.forEach(([a, b, c, d, k], i) => {
      const sp = 0.25 + k * 0.35;
      const wrap = (v: number) => ((v % 1) + 1) % 1 - 0.5;
      p.set(
        center[0] + wrap(a + (t * sp) / size) * size,
        center[1] + wrap(b - (t * 0.04) / size) * size * 0.5 + Math.sin(t * 0.7 + i) * 0.3,
        center[2] + wrap(c - (t * sp * 0.6) / size) * size,
      );
      e.set(Math.sin(t * 0.6 + i) * 0.8, t * (0.3 + d * 0.5) + i, Math.sin(t * 0.9 + d * 6) * 0.6);
      q.setFromEuler(e);
      const s = 0.55 + d * 0.4;
      sc.set(s, s, s);
      m.compose(p, q, sc);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, center, size, seeds]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color={PAL.feather} emissive="#fff3e0" emissiveIntensity={0.5} roughness={0.7} flatShading side={THREE.DoubleSide} />
    </instancedMesh>
  );
};

/** A small bunch of feathers held in a hand (local to the hand). */
export const HandFeathers: React.FC<{ n: number }> = ({ n }) => {
  const geo = useMemo(featherGeo, []);
  return (
    <group position={[0, -0.03, 0.03]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={geo} position={[0, 0.02 * i, 0]} rotation={[0.3 + i * 0.25, i * 0.9, Math.PI / 2 + (i - 2) * 0.22]} scale={0.55}>
          <meshStandardMaterial color={PAL.feather} emissive="#fff3e0" emissiveIntensity={0.35} flatShading side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};
