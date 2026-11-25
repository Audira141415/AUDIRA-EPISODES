// The film's main set: the Makkah valley as an engraved copper-plate maquette, honest geography.
// Axes: +z = north (toward the default camera), -z = south, -x = east, +x = west.
// - Wadi Ibrahim runs north -> south through the sanctuary; the Ka'bah sits at the lowest point.
// - Abu Qubais rises just east; Jabal An-Nur (Hira) far north-east; Jabal Tsur far south.
// - Bukit Bulbul (Ajyad fortress) faces the sanctuary from the south. The Abraj Al-Bait clock
//   tower is built on that SAME site after the fortress is removed (chapter 6).
// - Mina, Muzdalifah and Arafah lie east along a side valley (chapter 7: tents, Jamarat, metro).
// Era: 0 = early town, 1 = Ottoman (arcade, old minarets), 2 = modern (expansion, hotels).

import React, { useMemo } from "react";
import * as THREE from "three";
import { engrave, fbm, INK, rng, type EngraveOpts } from "./engraving.ts";
import { EBox, ECyl } from "./MakkahWorld.tsx";
import { clockTexture, skyTexture } from "./textures.ts";
import { clamp01, smooth } from "./tl.ts";

type V3 = [number, number, number];

export const SITE = {
  kabah: [0, 0, 0] as V3,
  ajyad: [0.35, 0, -3.1] as V3, // Bukit Bulbul = later clock tower
  abuQubais: [-3.3, 0, 0.5] as V3,
  hira: [-9.5, 0, 11] as V3,
  tsur: [1.5, 0, -13] as V3,
  babSail: [-0.95, 0, 1.0] as V3, // Bab Bani Syaibah, north-east side, the flood door
  misfalah: [0.9, 0, -6.2] as V3, // lower Makkah, downstream (south)
  syarai: [-1.2, 0, 9] as V3, // upper wadi, north
  mina: [-7.6, 0, -1.2] as V3,
  muzdalifah: [-11.5, 0, -1.6] as V3,
  arafah: [-15.5, 0, -1.0] as V3,
  jabalOmar: [3.3, 0, 0.6] as V3, // west of the sanctuary
};

export const HILL = { r: 1.35, h: 1.15 };
export const PLAQUE: V3 = [1.25, 0, 3.0];

const g = (x: number, z: number, cx: number, cz: number, r: number) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));

/** Valley ground height (without the Ajyad hill, which is its own mesh). */
export function hubHeight(x: number, z: number): number {
  // distance from the wadi axis (gently curving north -> south-west)
  const axis = 0.12 * z + 0.02 * z * z * Math.sign(-z);
  const dx = Math.abs(x - axis);
  let wall = THREE.MathUtils.smoothstep(dx, 2.2, 7.5) * 2.6;
  // side valley to Mina / Arafah, east (-x), along z = -1.3
  const side = x < -3 ? Math.exp(-((z + 1.3) ** 2) / (2 * 1.1 * 1.1)) * THREE.MathUtils.smoothstep(-x, 3, 6) : 0;
  wall *= 1 - 0.85 * side;
  const n = fbm(x * 0.2, z * 0.2, 11, 5);
  const ridge = 1 - Math.abs(fbm(x * 0.11 + 7, z * 0.11, 23, 4) * 2 - 1);
  const far = THREE.MathUtils.smoothstep(Math.hypot(x * 0.8, z), 8, 22);
  let h = wall * (0.55 + 0.9 * n) + far * (1.2 + 3.6 * ridge) * (1 - 0.7 * side);
  // named peaks
  h += 1.45 * g(x, z, SITE.abuQubais[0], SITE.abuQubais[2], 1.1);
  h += 0.85 * g(x, z, SITE.jabalOmar[0], SITE.jabalOmar[2], 0.9);
  h += 4.6 * g(x, z, SITE.hira[0], SITE.hira[2], 1.5);
  h += 5.6 * g(x, z, SITE.tsur[0], SITE.tsur[2], 2.0);
  // flat sanctuary floor
  h *= THREE.MathUtils.smoothstep(Math.hypot(x, z * 0.9), 1.6, 3.2);
  h += (fbm(x * 0.9, z * 0.9, 3, 2) - 0.5) * 0.05;
  h = 6.4 * Math.tanh(Math.max(0, h) / 6.4);
  // beyond the valley the maquette becomes the flat table the side sets stand on
  return h * (1 - THREE.MathUtils.smoothstep(Math.abs(x), 24, 33));
}

const terrainMat = engrave({ color: INK.paperDeep, freq: 5, contour: 0.45, keep: 0.35, ink: 0.6, toneGain: 2.2, refDist: 14 });

const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const gg = new THREE.PlaneGeometry(120, 80, 360, 240);
    gg.rotateX(-Math.PI / 2);
    gg.translate(-8, 0, -14);
    const p = gg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, hubHeight(p.getX(i), p.getZ(i)));
    gg.computeVertexNormals();
    return gg;
  }, []);
  return <mesh geometry={geo} material={terrainMat} receiveShadow castShadow />;
};

export const Sky: React.FC<{ x?: number }> = ({ x = 0 }) => {
  const map = useMemo(() => skyTexture(), []);
  return (
    <mesh position={[x, 18, -52]}>
      <planeGeometry args={[240, 72]} />
      <meshBasicMaterial map={map} fog={false} toneMapped={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- the Ka'bah (whole, never damaged)
export const KABAH = { W: 0.34, H: 0.4, D: 0.3, scale: 1.35, rot: -Math.PI / 4 };
/** World point on the Ka'bah from local coords (x along the door face, z out of the door face). */
export function kabahPoint(lx: number, ly: number, lz: number): V3 {
  const s = KABAH.scale, c = Math.cos(KABAH.rot), sn = Math.sin(KABAH.rot);
  return [(lx * c + lz * sn) * s, ly * s, (-lx * sn + lz * c) * s];
}

export const Kabah: React.FC = () => {
  const black = useMemo(() => new THREE.MeshStandardMaterial({ color: "#121010", roughness: 0.62, metalness: 0.05 }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: INK.gold, roughness: 0.32, metalness: 0.9 }), []);
  const { W, H, D } = KABAH;
  return (
    <group rotation={[0, KABAH.rot, 0]} scale={KABAH.scale}>
      <mesh material={black} position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
      </mesh>
      <mesh material={gold} position={[0, H * 0.74, 0]}>
        <boxGeometry args={[W + 0.006, H * 0.09, D + 0.006]} />
      </mesh>
      {/* door on the north-east face, toward the east corner */}
      <mesh material={gold} position={[-W * 0.2, H * 0.42, D / 2 + 0.004]}>
        <boxGeometry args={[W * 0.2, H * 0.34, 0.006]} />
      </mesh>
      {/* Hajar Aswad, east corner */}
      <mesh position={[-W / 2 - 0.002, H * 0.3, D / 2 + 0.002]} rotation={[0, -Math.PI / 4, 0]}>
        <torusGeometry args={[0.016, 0.005, 8, 20]} />
        <meshStandardMaterial color="#cfcac0" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Hijr Ismail: low semicircular wall on the north-west face */}
      <mesh position={[W / 2, 0.02, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} material={engrave({ color: "#efe3c6", freq: 60, keep: 0.5 })} castShadow>
        <torusGeometry args={[0.17, 0.018, 6, 28, Math.PI]} />
      </mesh>
    </group>
  );
};

/** Maqam Ibrahim as an object in its case (no figure): small stone under a gold-framed cover. */
export const Maqam: React.FC<{ at: V3; tilt?: number }> = ({ at, tilt = 0 }) => (
  <group position={at} rotation={[tilt * 0.6, tilt, tilt * 0.3]}>
    <mesh position={[0, 0.03, 0]} castShadow material={engrave({ color: "#b9a37a", freq: 70 })}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
    </mesh>
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[0.035, 0.045, 0.1, 8, 1, true]} />
      <meshStandardMaterial color={INK.gold} metalness={0.9} roughness={0.25} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.125, 0]} castShadow>
      <sphereGeometry args={[0.036, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={INK.gold} metalness={0.9} roughness={0.25} />
    </mesh>
  </group>
);
export const MAQAM_HOME = kabahPoint(-0.03, 0, 0.36);
export const ZAMZAM = [-0.85, 0, 0.05] as V3;
export const RUKUN = kabahPoint(-KABAH.W / 2, 0, KABAH.D / 2);
export const HIJR = kabahPoint(KABAH.W / 2 + 0.17, 0, 0);

// ---------------------------------------------------------------- sanctuary by era
const ringPts = (rx: number, rz: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    // rounded rectangle (superellipse)
    const c = Math.cos(a), s = Math.sin(a);
    return [Math.sign(c) * Math.abs(c) ** 0.45 * rx, Math.sign(s) * Math.abs(s) ** 0.45 * rz] as [number, number];
  });

const Minaret: React.FC<{ x: number; z: number; h: number; modern?: boolean; k: number }> = ({ x, z, h, modern, k }) => {
  if (k <= 0.001) return null;
  const m: EngraveOpts = modern ? { color: "#ebdfc0", freq: 30, keep: 0.3 } : { color: INK.paperDeep, freq: 34 };
  const r = modern ? 0.075 : 0.045;
  return (
    <group position={[x, 0, z]} scale={[1, k, 1]}>
      <ECyl r={[r, r * 1.15]} h={h} position={[0, h / 2, 0]} seg={12} mat={m} />
      <ECyl r={[r * 1.7, r * 1.4]} h={0.04} position={[0, h * 0.72, 0]} seg={12} mat={m} />
      {modern ? <ECyl r={[r * 0.85, r]} h={h * 0.18} position={[0, h * 1.09, 0]} seg={12} mat={m} /> : null}
      <mesh position={[0, h * (modern ? 1.18 : 1) + 0.09, 0]} castShadow material={engrave({ color: INK.gold, metalness: 0.8, roughness: 0.35, keep: 0.8, ink: 0.5, freq: 30 })}>
        <coneGeometry args={[r * 1.05, 0.18, 12]} />
      </mesh>
    </group>
  );
};

const Sanctuary: React.FC<{ era: number; cam?: { pos: V3; tgt: V3 } }> = ({ era, cam }) => {
  const blocks = (x: number, z: number) => {
    if (!cam) return false;
    const [cx, , cz] = cam.pos, [tx, , tz] = cam.tgt;
    const dx = tx - cx, dz = tz - cz, L2 = dx * dx + dz * dz;
    if (L2 > 40) return false; // only close shots
    const u = ((x - cx) * dx + (z - cz) * dz) / L2;
    if (u < 0 || u > 1) return false;
    return Math.hypot(cx + u * dx - x, cz + u * dz - z) < 0.45;
  };
  const early = 1 - smooth((era - 0.4) / 0.5);
  const arcade = smooth((era - 0.4) / 0.6);
  const modern = smooth((era - 1.35) / 0.6);
  const domes = useMemo(() => ringPts(1.35, 1.2, 40), []);
  const wall = useMemo(() => ringPts(1.25, 1.1, 64), []);
  const oldMin: [number, number][] = [[-1.32, 0.75], [-1.3, -0.8], [1.3, 0.8], [1.32, -0.75], [0.0, -1.26]];
  const newMin: [number, number][] = [[-2.1, 1.7], [2.1, 1.7], [-2.25, -0.6], [2.25, -0.6], [-0.7, 2.35], [0.7, 2.35]];
  return (
    <group>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={engrave({ color: "#f2e7cc", freq: 22, keep: 0.4, toneGain: 1.6 })}>
        <circleGeometry args={[1.15, 64]} />
      </mesh>
      {/* early low enclosure wall */}
      {early > 0.01
        ? wall.map(([x, z], i) => <EBox key={i} args={[0.13, 0.07 * early, 0.05]} position={[x, 0.035 * early, z]} rotation={[0, -Math.atan2(z, x) + Math.PI / 2, 0]} mat={{ color: INK.paperDeep, freq: 40 }} edges={false} />)
        : null}
      {/* Ottoman arcade of small domes */}
      {arcade > 0.01
        ? domes.map(([x, z], i) => (
            <group key={i} position={[x, 0, z]} scale={[1, arcade, 1]}>
              <EBox args={[0.16, 0.12, 0.16]} position={[0, 0.06, 0]} mat={{ color: INK.paperDeep, freq: 30 }} />
              <mesh position={[0, 0.12, 0]} castShadow material={engrave({ color: INK.paperDeep, freq: 34 })}>
                <sphereGeometry args={[0.075, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
            </group>
          ))
        : null}
      {oldMin.map(([x, z], i) => (blocks(x, z) ? null : <Minaret key={i} x={x} z={z} h={0.85} k={arcade} />))}
      {/* modern expansion: tiered colonnade masses around the old arcade, open to the south (tower side) */}
      {modern > 0.01 ? (
        <group scale={[1, modern, 1]}>
          {[
            [0, 2.05, 3.4, 0.6], [-1.95, 0.55, 0.7, 2.6], [1.95, 0.55, 0.7, 2.6], [-1.55, -1.45, 1.3, 0.6], [1.55, -1.45, 1.3, 0.6],
          ].map(([x, z, w, d], i) => (
            <group key={i}>
              <EBox args={[w, 0.36, d]} position={[x, 0.18, z]} mat={{ color: "#ece0c2", freq: 24, keep: 0.3 }} />
              <EBox args={[w * 0.85, 0.16, d * 0.8]} position={[x, 0.44, z]} mat={{ color: "#ece0c2", freq: 24, keep: 0.3 }} />
            </group>
          ))}
        </group>
      ) : null}
      {newMin.map(([x, z], i) => (blocks(x, z) ? null : <Minaret key={i} x={x} z={z} h={1.7} modern k={modern} />))}
      <Kabah />
    </group>
  );
};

// ---------------------------------------------------------------- town: old houses (detailed) and modern blocks
type House = { p: V3; s: V3; ry: number; kind: number; seed: number };

/** Old Makkah house: stone base, tower-house storeys, wooden roshan bays and a roof parapet. */
const OldHouse: React.FC<{ h: House; k: number }> = ({ h, k }) => {
  const [w, hh, d] = h.s;
  const stone: EngraveOpts = { color: "#e0cca2", freq: 34, keep: 0.24 };
  const wood: EngraveOpts = { color: "#8a6a44", freq: 60, keep: 0.55, ink: 0.6 };
  const y0 = h.p[1] - hh / 2;
  return (
    <group position={[h.p[0], y0 - (1 - k) * (hh + 0.05), h.p[2]]} rotation={[0, h.ry, 0]}>
      <EBox args={[w, hh, d]} position={[0, hh / 2, 0]} mat={stone} />
      {/* parapet */}
      <EBox args={[w + 0.01, 0.025, d + 0.01]} position={[0, hh + 0.012, 0]} mat={{ ...stone, color: "#d2bb8e" }} edges={false} />
      {/* roshan: projecting wooden bay on the front, upper storey */}
      {hh > 0.18 ? <EBox args={[w * 0.45, hh * 0.32, 0.03]} position={[(h.seed % 2 ? 0.18 : -0.18) * w, hh * 0.62, d / 2 + 0.015]} mat={wood} edges /> : null}
      {/* window slots */}
      <EBox args={[w * 0.12, hh * 0.14, 0.004]} position={[w * 0.28, hh * 0.3, d / 2 + 0.002]} mat={{ color: INK.sepia, freq: 80, keep: 0.9 }} edges={false} shadow={false} />
      <EBox args={[w * 0.12, hh * 0.14, 0.004]} position={[-w * 0.28, hh * 0.3, d / 2 + 0.002]} mat={{ color: INK.sepia, freq: 80, keep: 0.9 }} edges={false} shadow={false} />
      {h.kind === 2 ? <EBox args={[w * 0.5, hh * 0.35, d * 0.5]} position={[w * 0.2, hh + hh * 0.17, -d * 0.18]} mat={stone} /> : null}
    </group>
  );
};

export const Town: React.FC<{ era: number }> = ({ era }) => {
  const houses = useMemo(() => {
    const r = rng(1777);
    const out: House[] = [];
    let tries = 0;
    while (out.length < 230 && tries < 5000) {
      tries++;
      const x = (r() * 2 - 1) * 6.5;
      const z = -6 + r() * 14;
      if (Math.hypot(x, z * 1.05) < 1.75) continue;
      if (Math.hypot(x - SITE.ajyad[0], z - SITE.ajyad[2]) < HILL.r * 1.05) continue;
      if (Math.hypot(x - PLAQUE[0], z - PLAQUE[2]) < 0.7) continue;
      if (Math.abs(z - 4.3) < 0.45 && Math.abs(x) < 2.3) continue; // line of the Umar dam
      const gy = hubHeight(x, z);
      if (gy > 1.25) continue;
      const w = 0.17 + r() * 0.2, d = 0.16 + r() * 0.18, h = 0.14 + r() * 0.3;
      out.push({ p: [x, gy + h / 2 - 0.02, z], s: [w, h, d], ry: Math.atan2(-x, -z) * 0.25 + (r() - 0.5) * 0.25, kind: Math.floor(r() * 3), seed: Math.floor(r() * 100) });
    }
    return out;
  }, []);
  const blocks = useMemo(() => {
    const r = rng(2012);
    const out: { p: V3; s: V3; delay: number }[] = [];
    let tries = 0;
    while (out.length < 120 && tries < 5000) {
      tries++;
      const x = (r() * 2 - 1) * 6.5;
      const z = -6.5 + r() * 14;
      const rr = Math.hypot(x, z);
      if (Math.hypot(x, z * 1.05) < 2.9) continue;
      if (Math.hypot(x - SITE.ajyad[0], z - SITE.ajyad[2]) < 2.3) continue;
      if (Math.hypot(x - PLAQUE[0], z - PLAQUE[2]) < 0.9) continue;
      if (Math.abs(x) < 2.8 && z > 2.3 && z < 9.6) continue; // open northern plaza
      if (x > -3.2 && x < 1.0 && z > 3.4 && z < 5.4) continue; // display stand of chapter 7
      const gy = hubHeight(x, z);
      if (gy > 1.5) continue;
      const w = 0.35 + r() * 0.42, d = 0.32 + r() * 0.4;
      const h = (0.5 + r() * (rr < 4.5 ? 1.7 : 0.9)) * (z > 3.5 ? 0.55 : 1);
      out.push({ p: [x, gy - 0.02, z], s: [w, h, d], delay: r() });
    }
    // Jabal Omar towers, west of the sanctuary
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9;
      out.push({ p: [SITE.jabalOmar[0] + Math.cos(a) * 0.7, 0, SITE.jabalOmar[2] + Math.sin(a) * 0.55], s: [0.45, 1.6 + (i % 3) * 0.45, 0.45], delay: 0.3 + i * 0.05 });
    }
    return out;
  }, []);
  const old = 1 - smooth((era - 1.25) / 0.6);
  const mod = smooth((era - 1.4) / 0.55);
  return (
    <group>
      {old > 0.01 ? houses.map((h, i) => <OldHouse key={i} h={h} k={old} />) : null}
      {mod > 0.01
        ? blocks.map((b, i) => {
            const k = clamp01((mod - b.delay * 0.4) / 0.6);
            if (k <= 0.01) return null;
            const hh = b.s[1] * smooth(k);
            return <EBox key={i} args={[b.s[0], hh, b.s[2]]} position={[b.p[0], b.p[1] + hh / 2, b.p[2]]} mat={{ color: "#e7d8b6", freq: 20, keep: 0.26 }} />;
          })
        : null}
    </group>
  );
};

// ---------------------------------------------------------------- Bukit Bulbul, Ajyad fortress, Abraj Al-Bait
const hillMat = engrave({ color: INK.paperDeep, freq: 9, contour: 0.18, keep: 0.3, ink: 0.75, toneGain: 1.55 });

export const AjyadHill: React.FC<{ h: number }> = ({ h }) => {
  const geo = useMemo(() => {
    const gg = new THREE.CircleGeometry(HILL.r * 1.6, 72, 0, Math.PI * 2);
    gg.rotateX(-Math.PI / 2);
    const p = gg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const d = Math.hypot(x, z) / HILL.r;
      const y = Math.max(0, Math.cos(Math.min(1, d / 1.45) * Math.PI) * 0.5 + 0.5) * (0.92 + 0.16 * fbm(x * 3, z * 3, 5, 2));
      p.setY(i, y);
    }
    gg.computeVertexNormals();
    return gg;
  }, []);
  if (h <= 0.01) return null;
  return <mesh geometry={geo} material={hillMat} position={[SITE.ajyad[0], -0.01, SITE.ajyad[2]]} scale={[1, h, 1]} receiveShadow castShadow />;
};

/** Ajyad fortress on the hill top. build: 0..1 appears, demo: 0..1 stones laid down into the hill (abstract). */
export const Ajyad: React.FC<{ build: number; demo: number; hillH: number }> = ({ build, demo, hillH }) => {
  const k = build * (1 - demo);
  const L = 1.05, Wd = 0.72, H = 0.26, T = 0.07;
  const stone: EngraveOpts = { color: "#dcc79b", freq: 34, keep: 0.25 };
  const crenels = useMemo(() => {
    const out: V3[] = [];
    for (let i = 0; i < 9; i++) {
      const t = -L / 2 + (i + 0.5) * (L / 9);
      out.push([t, H + 0.03, Wd / 2], [t, H + 0.03, -Wd / 2]);
    }
    for (let i = 0; i < 6; i++) {
      const t = -Wd / 2 + (i + 0.5) * (Wd / 6);
      out.push([L / 2, H + 0.03, t], [-L / 2, H + 0.03, t]);
    }
    return out;
  }, []);
  if (k <= 0.01) return null;
  const corners: [number, number][] = [[L / 2, Wd / 2], [-L / 2, Wd / 2], [L / 2, -Wd / 2], [-L / 2, -Wd / 2]];
  const top = HILL.h * hillH - 0.05;
  return (
    <group position={[SITE.ajyad[0], top, SITE.ajyad[2]]} rotation={[0, 0.2, 0]} scale={[1, k, 1]}>
      <EBox args={[L, H, T]} position={[0, H / 2, Wd / 2]} mat={stone} />
      <EBox args={[L, H, T]} position={[0, H / 2, -Wd / 2]} mat={stone} />
      <EBox args={[T, H, Wd]} position={[L / 2, H / 2, 0]} mat={stone} />
      <EBox args={[T, H, Wd]} position={[-L / 2, H / 2, 0]} mat={stone} />
      {crenels.map((p, i) => <EBox key={i} args={[0.045, 0.06, 0.075]} position={p} mat={stone} edges={false} />)}
      {corners.map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <ECyl r={[0.13, 0.15]} h={0.38} position={[0, 0.19, 0]} seg={18} mat={stone} edges />
          {Array.from({ length: 8 }).map((_, j) => {
            const a = (j / 8) * Math.PI * 2;
            return <EBox key={j} args={[0.045, 0.06, 0.045]} position={[Math.cos(a) * 0.12, 0.41, Math.sin(a) * 0.12]} mat={stone} edges={false} />;
          })}
        </group>
      ))}
      <EBox args={[0.34, 0.36, 0.28]} position={[-0.12, 0.18, -0.05]} mat={stone} />
      <EBox args={[0.08, 0.12, 0.01]} position={[0, 0.06, Wd / 2 + 0.04]} mat={{ color: INK.sepia, freq: 40, keep: 0.9 }} edges={false} />
      {/* Ramadan cannon on the north wall, aimed at the sanctuary */}
      <mesh position={[0.2, H + 0.06, Wd / 2 + 0.03]} rotation={[Math.PI / 2.3, 0, 0]} castShadow material={engrave({ color: "#6b5a44", metalness: 0.6, roughness: 0.45, freq: 50 })}>
        <cylinderGeometry args={[0.014, 0.02, 0.16, 10]} />
      </mesh>
    </group>
  );
};

/** Stones of the fortress laid out flat on a plan, as the abstract sign of its removal. */
export const AjyadPlan: React.FC<{ o: number }> = ({ o }) => {
  const stones = useMemo(() => {
    const r = rng(2002);
    return Array.from({ length: 60 }, (_, i) => [((i % 12) - 5.5) * 0.11 + (r() - 0.5) * 0.02, Math.floor(i / 12) * 0.11 - 0.22 + (r() - 0.5) * 0.02] as [number, number]);
  }, []);
  if (o <= 0.01) return null;
  return (
    <group position={[SITE.ajyad[0] + 1.6, 0.02, SITE.ajyad[2] + 0.6]} scale={[1, o, 1]}>
      {stones.map(([x, z], i) => <EBox key={i} args={[0.09, 0.03, 0.09]} position={[x, 0.015, z]} mat={{ color: "#dcc79b", freq: 50 }} />)}
    </group>
  );
};

const goldMat: EngraveOpts = { color: INK.gold, metalness: 0.85, roughness: 0.32, keep: 0.85, ink: 0.55, freq: 22, toneGain: 1.0 };

/** Abraj Al-Bait on the former Ajyad site. rise 0..1 builds it stage by stage from the ground. */
export const ClockTowers: React.FC<{ rise: number; glow?: number }> = ({ rise, glow = 0 }) => {
  const face = useMemo(() => clockTexture(), []);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ map: face, metalness: 0.55, roughness: 0.38, emissive: new THREE.Color("#f2c46a"), emissiveIntensity: 0.2 }), [face]);
  if (rise <= 0.005) return null;
  faceMat.emissiveIntensity = 0.2 + glow * 0.9;
  const st = (a: number, b: number) => smooth((rise - a) / (b - a));
  const facade: EngraveOpts = { color: "#e6d6b2", freq: 16, keep: 0.28 };
  const [X, , Z] = SITE.ajyad;
  const yClock = 4.6;
  const side = [
    [-1.35, 0.5, 0.62, 3.0], [1.35, 0.5, 0.62, 3.0], [-1.15, -0.75, 0.58, 3.4], [1.15, -0.75, 0.58, 3.4], [-2.0, -0.2, 0.55, 2.4], [2.0, -0.2, 0.55, 2.4],
  ];
  const sPod = st(0, 0.18), sShaft = st(0.12, 0.55), sClock = st(0.5, 0.72), sCrown = st(0.68, 0.9), sSpire = st(0.86, 1);
  return (
    <group position={[X, 0, Z]}>
      <group scale={[1, Math.max(0.001, sPod), 1]}>
        <EBox args={[3.2, 0.7, 2.2]} position={[0, 0.35, 0]} mat={facade} />
        <EBox args={[2.4, 0.35, 1.7]} position={[0, 0.88, 0]} mat={facade} />
      </group>
      {side.map(([x, z, w, h], i) => {
        const k = st(0.15 + i * 0.04, 0.6 + i * 0.04);
        if (k <= 0.01) return null;
        const hh = h * k;
        return (
          <group key={i}>
            <EBox args={[w, hh, w]} position={[x, hh / 2 + 0.3, z]} mat={{ color: "#e3d2ac", freq: 18, keep: 0.28 }} />
            {k > 0.98 ? (
              <>
                <EBox args={[w * 0.7, 0.25, w * 0.7]} position={[x, h + 0.42, z]} mat={goldMat} />
                <mesh position={[x, h + 0.62, z]} castShadow material={engrave(goldMat)}>
                  <coneGeometry args={[w * 0.25, 0.3, 8]} />
                </mesh>
              </>
            ) : null}
          </group>
        );
      })}
      {sShaft > 0.01 ? (
        <group position={[0, 1.05, 0]} scale={[1, sShaft, 1]}>
          <EBox args={[1.05, 2.4, 1.05]} position={[0, 1.2, 0]} mat={facade} />
          <EBox args={[1.15, 0.12, 1.15]} position={[0, 2.45, 0]} mat={facade} />
          <EBox args={[0.98, 0.5, 0.98]} position={[0, 2.75, 0]} mat={facade} />
          {[-0.36, -0.12, 0.12, 0.36].map((x, i) => <EBox key={i} args={[0.05, 2.3, 0.04]} position={[x, 1.2, 0.54]} mat={facade} edges={false} />)}
        </group>
      ) : null}
      {sClock > 0.01 ? (
        <group position={[0, yClock - 0.55, 0]} scale={[1, sClock, 1]}>
          <EBox args={[1, 1.05, 1]} position={[0, 0.55, 0]} mat={{ ...facade, color: "#d8c49a" }} />
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} material={faceMat} position={[Math.sin((k * Math.PI) / 2) * 0.506, 0.55, Math.cos((k * Math.PI) / 2) * 0.506]} rotation={[0, (k * Math.PI) / 2, 0]}>
              <planeGeometry args={[0.86, 0.86]} />
            </mesh>
          ))}
        </group>
      ) : null}
      {sCrown > 0.01 ? (
        <group position={[0, yClock + 0.53, 0]} scale={[1, sCrown, 1]}>
          <ECyl r={[0.42, 0.52]} h={0.3} position={[0, 0.15, 0]} seg={8} mat={goldMat} edges />
          <ECyl r={[0.3, 0.38]} h={0.42} position={[0, 0.5, 0]} seg={8} mat={goldMat} edges />
          <mesh position={[0, 0.85, 0]} castShadow material={engrave(goldMat)}>
            <sphereGeometry args={[0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
      ) : null}
      {sSpire > 0.01 ? (
        <group position={[0, yClock + 1.5, 0]} scale={[1, sSpire, 1]}>
          <ECyl r={[0.05, 0.12]} h={0.9} position={[0, 0.45, 0]} seg={10} mat={goldMat} />
          <ECyl r={[0.012, 0.04]} h={0.5} position={[0, 1.1, 0]} seg={8} mat={goldMat} />
          <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI * 0.5]} material={engrave(goldMat)}>
            <torusGeometry args={[0.11, 0.022, 10, 32, Math.PI * 1.45]} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
export const TOWER_TOP = 4.6 + 3.0;

/** The museum tag on the maquette: the one place AUDIRA appears inside the 3D world. */
export const Plaque: React.FC<{ at: V3; ry?: number }> = ({ at, ry = 0 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 384;
    const gg = c.getContext("2d")!;
    gg.fillStyle = "#c9a862";
    gg.fillRect(0, 0, 1024, 384);
    gg.strokeStyle = INK.copper;
    gg.lineWidth = 10;
    gg.strokeRect(16, 16, 992, 352);
    gg.lineWidth = 3;
    gg.strokeRect(36, 36, 952, 312);
    gg.fillStyle = INK.iron;
    gg.textAlign = "center";
    gg.font = "700 120px Georgia, serif";
    gg.fillText("AUDIRA", 512, 170);
    gg.font = "italic 400 52px Georgia, serif";
    gg.fillText("Maket Lembah Makkah · Pelat V", 512, 270);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group position={at} rotation={[0, ry, 0]}>
      <group position={[0, 0.16, 0]} rotation={[-0.5, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.3, 0.02]} />
          <meshStandardMaterial color={INK.gold} metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.0105]}>
          <planeGeometry args={[0.78, 0.29]} />
          <meshStandardMaterial map={tex} metalness={0.5} roughness={0.45} />
        </mesh>
      </group>
      <mesh position={[0, 0.06, -0.06]} castShadow>
        <boxGeometry args={[0.06, 0.12, 0.06]} />
        <meshStandardMaterial color={INK.copper} metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
};

export type HubProps = { era: number; fort: number; fortDemo: number; hill: number; tower: number; towerGlow?: number; plan?: number; cam?: { pos: V3; tgt: V3 } };

export const Hub: React.FC<HubProps> = ({ era, fort, fortDemo, hill, tower, towerGlow = 0, plan = 0, cam }) => (
  <group>
    <Terrain />
    <AjyadHill h={hill} />
    <Sanctuary era={era} cam={cam} />
    <Town era={era} />
    <Ajyad build={fort} demo={fortDemo} hillH={hill} />
    <AjyadPlan o={plan} />
    <ClockTowers rise={tower} glow={towerGlow} />
    <Plaque at={[PLAQUE[0], hubHeight(PLAQUE[0], PLAQUE[2]), PLAQUE[2]]} ry={-0.35} />
  </group>
);
