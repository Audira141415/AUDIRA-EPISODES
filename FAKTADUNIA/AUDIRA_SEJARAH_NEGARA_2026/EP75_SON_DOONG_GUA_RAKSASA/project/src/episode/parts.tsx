// Shared props for EP75 Son Doong (WORLDFORGE realistic miniature). GLB models from public/models/polyfork,
// procedural PBR detail maps from ./materials.ts. Cave = displaced open cylinder along Z (floor flattened at y = 0).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { FX_LAYER } from "../core/render/Post.tsx";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { ToyPerson, type PoseName, type Outfit } from "../core/polish/Person.tsx";
import { clamp01, easeOutBack, mulberry32 } from "../kits/feltcraft/core/motion";
import { real, rockGeometry, limeGrain, flowGrain, type Kind } from "./materials.ts";
import type { V3 } from "./timeline.ts";

export const C = {
  lime: "#B8AE9C",
  limeDark: "#6E665C",
  calcite: "#E2D6BE",
  soil: "#5A4632",
  jungle: "#4F6B34",
  moss: "#6F8A44",
  river: "#3E7F8C",
  lamp: "#FFE6B0",
  helmet: "#F2B21B",
  red: "#E0402A",
};

export const mat = (color: string, repeat = 2, kind?: Kind) => real(color, repeat, kind);
export const st = (t: number) => Math.floor(t * 12) / 12;

export const SPHERE = new THREE.SphereGeometry(1, 32, 20);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 20);
export const ROCK = [rockGeometry(3), rockGeometry(7), rockGeometry(11)];
export const Shape: React.FC<{ geometry: THREE.BufferGeometry; color: string; position?: V3; rotation?: V3; scale?: number | V3; kind?: Kind; repeat?: number }> = ({ geometry, color, position, rotation, scale, kind, repeat = 1 }) => (
  <mesh geometry={geometry} position={position} rotation={rotation} scale={scale} material={mat(color, repeat, kind)} castShadow receiveShadow />
);

/** Stepped pop-in (stop-motion feel): 0 before `at`, overshoots to 1 over `dur`. */
export const pop = (t: number, at: number, dur = 0.45) => {
  const x = clamp01((st(t) - at) / dur);
  return x <= 0 ? 0 : easeOutBack(x, 1.6);
};
/** 0..1 ramp between a and b (stepped at 12 fps). */
export const ramp = (t: number, a: number, b: number) => clamp01((st(t) - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// ---------- cave geometry ----------
const caveMats = new Map<string, THREE.Material>();
/** Stone material that renders both faces (the camera sits inside the tube). */
export const caveMat = (color: string, repeat = 8) => {
  const key = `${color}-${repeat}`;
  let m = caveMats.get(key);
  if (!m) {
    m = (real(color, repeat, "stone") as THREE.MeshStandardMaterial).clone();
    m.side = THREE.DoubleSide;
    caveMats.set(key, m);
  }
  return m;
};

const texVariants = new Map<string, THREE.CanvasTexture>();
const texVariant = (base: THREE.CanvasTexture, key: string, rx: number, ry: number, rot: number) => {
  let t = texVariants.get(key);
  if (!t) {
    t = base.clone();
    t.needsUpdate = true;
    t.repeat.set(rx, ry);
    t.center.set(0.5, 0.5);
    t.rotation = rot;
    texVariants.set(key, t);
  }
  return t;
};
/** Limestone wall for the cave tube: strata run along the passage (texture turned 90deg), drip stains run down. */
export const caveLime = (color: string, repeat = 8) => {
  const key = `lime-${color}-${repeat}`;
  let m = caveMats.get(key);
  if (!m) {
    const t = texVariant(limeGrain(), key, repeat * 1.4, repeat * 0.6, Math.PI / 2);
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), map: t, bumpMap: t, bumpScale: 3, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
    caveMats.set(key, m);
  }
  return m;
};
/** Flowstone / speleothem: vertical rippled drip channels, slightly wet. */
export const flowStone = (color: string, rx = 2, ry = 1) => {
  const key = `flow-${color}-${rx}-${ry}`;
  let m = caveMats.get(key);
  if (!m) {
    const t = texVariant(flowGrain(), key, rx, ry, 0);
    m = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), map: t, bumpMap: t, bumpScale: 2.4, roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.4, metalness: 0 });
    caveMats.set(key, m);
  }
  return m;
};

/** Open tube along Z between z0 (front, larger) and z1, radius R, noise in world z so segments meet.
 *  gap > 0 removes a roof slice (radians) = doline skylight. Floor flattened to y = 0. */
export const caveGeo = (R: number, z0: number, z1: number, seed: number, gap = 0, rough = 0.16) => {
  const len = z0 - z1;
  const rows = Math.max(8, Math.round(len * 1.6));
  const g = gap > 0 ? new THREE.CylinderGeometry(R, R, len, 80, rows, true, Math.PI + gap / 2, 2 * Math.PI - gap) : new THREE.CylinderGeometry(R, R, len, 80, rows, true);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, (z0 + z1) / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const s = seed * 1.7;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i);
    const z = p.getZ(i);
    const th = Math.atan2(x, -y);
    const n = 0.5 * Math.sin(3 * th + z * 0.35 + s) + 0.3 * Math.sin(7 * th - z * 0.8 + s * 2) + 0.2 * Math.sin(13 * th + z * 1.9 + s * 3) + 0.12 * Math.sin(29 * th + z * 3.1 + s);
    const k = 1 + rough * n;
    x *= k;
    y *= k;
    if (y < -0.55 * R) y = -0.55 * R + 0.025 * R * Math.sin(x * 2.1 + z * 1.3 + s);
    p.setXYZ(i, x, y + 0.55 * R, z);
  }
  g.computeVertexNormals();
  return g;
};
const caveGeoCache = new Map<string, THREE.BufferGeometry>();
const caveGeoMemo = (R: number, z0: number, z1: number, seed: number, gap: number) => {
  const key = [R, z0, z1, seed, gap].join("|");
  let g = caveGeoCache.get(key);
  if (!g) {
    g = caveGeo(R, z0, z1, seed, gap);
    caveGeoCache.set(key, g);
  }
  return g;
};

/** Horizontal limestone strata (cutaway walls). v = 0 bottom, 1 top. */
let STRATA: THREE.CanvasTexture | null = null;
export const strataTexture = () => {
  if (STRATA) return STRATA;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1024;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(75);
  const shades = ["#B9AE9A", "#A89C88", "#C6BCA8", "#9C907E", "#B2A690", "#8E836F"];
  let y = 0;
  // top: dark topsoil + root band
  g.fillStyle = "#4A3A28";
  g.fillRect(0, 0, 512, 70);
  g.fillStyle = "#5E7A3A";
  g.fillRect(0, 0, 512, 16);
  y = 70;
  let i = 0;
  while (y < 1024) {
    const h = 30 + rnd() * 80;
    g.fillStyle = shades[i++ % shades.length];
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 6 + (rnd() - 0.5) * 4);
    g.lineTo(512, y + h + 10);
    g.lineTo(0, y + h + 10);
    g.closePath();
    g.fill();
    y += h;
  }
  for (let k = 0; k < 900; k++) {
    g.fillStyle = `rgba(40,30,20,${0.05 + rnd() * 0.12})`;
    g.fillRect(rnd() * 512, rnd() * 1024, 1 + rnd() * 3, 1 + rnd() * 2);
  }
  STRATA = new THREE.CanvasTexture(c);
  STRATA.colorSpace = THREE.SRGBColorSpace;
  STRATA.wrapS = THREE.RepeatWrapping;
  STRATA.anisotropy = 8;
  return STRATA;
};

/** Hole outline = cave cross-section: circle (cy, r) cut flat at floorY. */
const holePath = (cy: number, r: number, floorY: number) => {
  const path = new THREE.Path();
  const k = Math.max(-0.99, Math.min(0.99, (floorY - cy) / r));
  const a0 = Math.asin(k);
  const a1 = Math.PI - a0;
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const a = a0 + ((a1 - a0) * i) / N;
    const x = Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return path;
};

/** Vertical rock face in the XY plane (at z), with a cave-shaped hole. Strata texture when `strata`. */
export const RockWall: React.FC<{ z: number; w: number; y0: number; y1: number; hole?: { cy: number; r: number; floorY?: number }; strata?: boolean; color?: string }> = ({ z, w, y0, y1, hole, strata, color = C.lime }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, y0);
    s.lineTo(w / 2, y0);
    s.lineTo(w / 2, y1);
    s.lineTo(-w / 2, y1);
    s.closePath();
    if (hole) s.holes.push(holePath(hole.cy, hole.r, hole.floorY ?? 0.15));
    const g = new THREE.ShapeGeometry(s, 24);
    // uv: v = 0..1 over the wall height, u = metres / 12
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      uv[i * 2] = p.getX(i) / 12;
      uv[i * 2 + 1] = (p.getY(i) - y0) / (y1 - y0);
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }, [w, y0, y1, hole?.cy, hole?.r, hole?.floorY]);
  const m = useMemo(() => {
    if (strata) return new THREE.MeshStandardMaterial({ map: strataTexture(), roughness: 0.93, side: THREE.DoubleSide });
    return caveMat(color, 3);
  }, [strata, color]);
  return <mesh geometry={geo} material={m} position={[0, 0, z]} receiveShadow castShadow />;
};

/** Flat ground at y with optional round holes [x, z, r] (doline openings seen from above). */
export const Surface: React.FC<{ y: number; x0: number; x1: number; z0: number; z1: number; holes?: [number, number, number][]; color?: string; repeat?: number }> = ({ y, x0, x1, z0, z1, holes = [], color = C.jungle, repeat = 10 }) => {
  const geo = useMemo(() => {
    // Shape in (x, -z) so that after rotateX(-PI/2) it lands at world z.
    const s = new THREE.Shape();
    s.moveTo(x0, -z0);
    s.lineTo(x1, -z0);
    s.lineTo(x1, -z1);
    s.lineTo(x0, -z1);
    s.closePath();
    for (const [hx, hz, hr] of holes) {
      const p = new THREE.Path();
      p.absarc(hx, -hz, hr, 0, Math.PI * 2, true);
      s.holes.push(p);
    }
    const g = new THREE.ShapeGeometry(s, 32);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      uv[i * 2] = p.getX(i) / 20;
      uv[i * 2 + 1] = p.getZ(i) / 20;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }, [x0, x1, z0, z1, JSON.stringify(holes)]);
  return <mesh geometry={geo} position={[0, y, 0]} material={caveMat(color, repeat)} receiveShadow />;
};

export type Doline = { z: number; len: number; gap: number };
/** Cave passage: tube from z0 to z1 (z0 > z1). Optional doline skylight with a shaft up to `surfaceY`. */
export const Cave: React.FC<{ R: number; z0: number; z1: number; seed: number; color?: string; doline?: Doline; surfaceY?: number; repeat?: number }> = ({ R, z0, z1, seed, color = C.lime, doline, surfaceY, repeat = 8 }) => {
  const m = caveLime(color, repeat);
  const segs: [number, number, number][] = doline
    ? [
        [z0, doline.z + doline.len / 2, 0],
        [doline.z + doline.len / 2, doline.z - doline.len / 2, doline.gap],
        [doline.z - doline.len / 2, z1, 0],
      ]
    : [[z0, z1, 0]];
  const top = 0.55 * R + R * Math.cos(doline ? doline.gap / 2 : 0) * 0.92;
  const shaftR = doline ? R * Math.sin(doline.gap / 2) * 1.05 : 0;
  const shaft = useMemo(() => {
    if (!doline || surfaceY === undefined) return null;
    const h = surfaceY - top + 0.6;
    const g = new THREE.CylinderGeometry(shaftR * 1.15, shaftR, h, 48, 6, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
      const th = Math.atan2(x, z);
      const k = 1 + 0.12 * Math.sin(5 * th + y * 0.9 + seed) + 0.06 * Math.sin(11 * th - y * 1.7);
      p.setXYZ(i, x * k, y, z * k * (doline.len / (2 * shaftR)));
    }
    g.computeVertexNormals();
    return { g, y: top - 0.3 + h / 2 };
  }, [R, doline?.z, doline?.len, doline?.gap, surfaceY, seed]);
  return (
    <group>
      {segs.map(([a, b, gp], i) => (
        <mesh key={i} geometry={caveGeoMemo(R, a, b, seed, gp)} material={m} receiveShadow castShadow />
      ))}
      {shaft && doline ? <mesh geometry={shaft.g} material={m} position={[0, shaft.y, doline.z]} receiveShadow /> : null}
    </group>
  );
};
/** Hole radius of the shaft at the surface (x, z half sizes). */
export const dolineOpening = (R: number, d: Doline): [number, number] => {
  const r = R * Math.sin(d.gap / 2) * 1.05 * 1.15;
  return [r, (d.len / 2) * 1.15];
};

/** Stalagmite / stalactite: tapered displaced cone. */
const STAL = (() => {
  const g = new THREE.ConeGeometry(1, 1, 14, 8);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.18 * Math.sin(y * 9 + Math.atan2(x, z) * 3);
    p.setXYZ(i, x * k, y, z * k);
  }
  g.translate(0, 0.5, 0);
  g.computeVertexNormals();
  return g;
})();
export const Stalagmites: React.FC<{ seed: number; n: number; x: [number, number]; z: [number, number]; h?: [number, number]; ceiling?: number; color?: string; avoid?: number }> = ({ seed, n, x, z, h = [0.4, 1.6], ceiling, color = C.calcite, avoid = 0 }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: { p: V3; s: V3; down: boolean }[] = [];
    while (out.length < n) {
      const px = x[0] + rnd() * (x[1] - x[0]);
      if (Math.abs(px) < avoid) continue;
      const hh = h[0] + rnd() * (h[1] - h[0]);
      const down = ceiling !== undefined && rnd() < 0.4;
      out.push({ p: [px, down ? ceiling! : 0, z[0] + rnd() * (z[1] - z[0])], s: [hh * 0.18, down ? -hh * 0.7 : hh, hh * 0.18], down });
    }
    return out;
  }, [seed, n, x[0], x[1], z[0], z[1], ceiling, avoid]);
  const m = flowStone(color, 2, 1);
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} geometry={STAL} material={m} position={it.p} scale={it.s} castShadow receiveShadow />
      ))}
    </>
  );
};

export const Boulders: React.FC<{ seed: number; n: number; x: [number, number]; z: [number, number]; size?: [number, number]; avoid?: number; y?: number }> = ({ seed, n, x, z, size = [0.6, 1.6], avoid = 0, y = 0 }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    const ids = ["landscape-boulder-526f7f", "large-coastal-boulder-a2cab1"];
    const out: { p: V3; s: number; r: number; id: string }[] = [];
    while (out.length < n) {
      const px = x[0] + rnd() * (x[1] - x[0]);
      if (Math.abs(px) < avoid) continue;
      out.push({ p: [px, y, z[0] + rnd() * (z[1] - z[0])], s: size[0] + rnd() * (size[1] - size[0]), r: rnd() * 6.28, id: ids[Math.floor(rnd() * 2)] });
    }
    return out;
  }, [seed, n, x[0], x[1], z[0], z[1], avoid]);
  return (
    <>
      {items.map((b, i) => (
        <AssetModel key={i} grain="stone" grainTiles={3} id={b.id} assetType="prop" size={b.s} ground position={b.p} rotation={[0, b.r, 0]} tint="#9A9182" roughness={0.95} />
      ))}
    </>
  );
};

// ---------- jungle ----------
const PLANTS: { id: string; type: string; s: [number, number]; tint: string }[] = [
  { id: "palm-tree-a307da", type: "prop", s: [2.6, 4.2], tint: "#6E8F45" },
  { id: "tree-fern-78320e", type: "prop", s: [1.8, 3.4], tint: "#5E8A3C" },
  { id: "banana-plant-978d7f", type: "prop", s: [1.2, 2.2], tint: "#7FA048" },
  { id: "bamboo-grove-clump-7c747d", type: "prop", s: [2.2, 3.6], tint: "#7E9A4A" },
  { id: "tropical-fern-bush-c70147", type: "prop", s: [0.7, 1.3], tint: "#4F7E36" },
];
export const Plant: React.FC<{ kind: number; position: V3; size: number; rot?: number; s?: number }> = ({ kind, position, size, rot = 0, s = 1 }) => {
  if (s <= 0.001) return null;
  const P = PLANTS[kind % PLANTS.length];
  return (
    <group position={position} scale={s} rotation={[0, rot, 0]}>
      <AssetModel id={P.id} assetType={P.type} size={size} ground tint={P.tint} roughness={0.85} />
    </group>
  );
};
/** Seeded jungle scatter in a box; `avoid(x, z)` true = keep clear. `scale` multiplies plant size. */
export const Jungle: React.FC<{ seed: number; n: number; x: [number, number]; z: [number, number]; y?: number; scale?: number; kinds?: number[]; avoid?: (x: number, z: number) => boolean; grow?: number }> = ({ seed, n, x, z, y = 0, scale = 1, kinds = [0, 1, 2, 3, 4], avoid, grow = 1 }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: { p: V3; k: number; size: number; r: number }[] = [];
    let guard = 0;
    while (out.length < n && guard++ < n * 40) {
      const px = x[0] + rnd() * (x[1] - x[0]);
      const pz = z[0] + rnd() * (z[1] - z[0]);
      const k = kinds[Math.floor(rnd() * kinds.length)];
      const P = PLANTS[k];
      const size = (P.s[0] + rnd() * (P.s[1] - P.s[0])) * scale;
      const r = rnd() * 6.28;
      if (avoid && avoid(px, pz)) continue;
      out.push({ p: [px, y, pz], k, size, r });
    }
    return out;
  }, [seed, n, x[0], x[1], z[0], z[1], y, scale, kinds.join(",")]);
  return (
    <>
      {items.map((it, i) => (
        <Plant key={i} kind={it.k} position={it.p} size={it.size} rot={it.r} s={grow} />
      ))}
      <AssetModel id="club-moss-mat-edcb1b" assetType="prop" size={(x[1] - x[0]) * 0.35} ground position={[(x[0] + x[1]) / 2, y, (z[0] + z[1]) / 2]} tint={C.moss} roughness={0.95} />
    </>
  );
};

// ---------- soft sprites ----------
let SOFT: THREE.CanvasTexture | null = null;
export const softTexture = () => {
  if (SOFT) return SOFT;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,0.55)");
  r.addColorStop(0.7, "rgba(255,255,255,0.16)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  SOFT = new THREE.CanvasTexture(c);
  SOFT.colorSpace = THREE.SRGBColorSpace;
  return SOFT;
};
/** Rising smoke (campfire). */
export const Smoke: React.FC<{ t: number; origin: V3; color?: string; n?: number; rise?: number; spread?: number; seed?: number; size?: number; opacity?: number }> = ({ t, origin, color = "#EDE7DF", n = 5, rise = 1.4, spread = 0.25, seed = 1, size = 0.16, opacity = 0.5 }) => {
  const s0 = st(t);
  const puffs = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n * 2 }, () => ({ ph: rnd(), dx: (rnd() - 0.5) * spread, dz: (rnd() - 0.5) * spread, rot: rnd() * 6.28 }));
  }, [n, spread, seed]);
  return (
    <>
      {puffs.map((p, i) => {
        const life = (s0 * 0.32 + p.ph) % 1;
        const s = size * 2.6 * (0.7 + life * 2.4);
        const a = opacity * Math.sin(Math.PI * Math.min(1, life * 1.1)) * (1 - life * 0.5);
        if (a <= 0.01) return null;
        return (
          <Billboard key={i} position={[origin[0] + p.dx * (1 + life * 2), origin[1] + life * rise, origin[2] + p.dz * (1 + life * 2)]}>
            <mesh layers={FX_LAYER} scale={[s, s, s]} rotation={[0, 0, p.rot + life * 0.6]} renderOrder={2}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={softTexture()} color={color} transparent opacity={a} depthWrite={false} />
            </mesh>
          </Billboard>
        );
      })}
    </>
  );
};
/** Mist drifting along a direction (cave breath / cloud inside the doline). */
export const Mist: React.FC<{ t: number; origin: V3; dir: V3; n?: number; dist?: number; spread?: V3; size?: number; opacity?: number; color?: string; seed?: number; speed?: number; strength?: number }> = ({ t, origin, dir, n = 10, dist = 6, spread = [1, 0.6, 1], size = 1, opacity = 0.4, color = "#F2EFE8", seed = 3, speed = 0.25, strength = 1 }) => {
  const s0 = st(t);
  const puffs = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n }, () => ({ ph: rnd(), o: [(rnd() - 0.5) * spread[0], (rnd() - 0.5) * spread[1], (rnd() - 0.5) * spread[2]] as V3, rot: rnd() * 6.28, sz: 0.7 + rnd() * 0.6 }));
  }, [n, seed, spread[0], spread[1], spread[2]]);
  if (strength <= 0.01) return null;
  return (
    <>
      {puffs.map((p, i) => {
        const life = (s0 * speed + p.ph) % 1;
        const d = life * dist;
        const s = size * p.sz * (0.6 + life * 1.6);
        const a = strength * opacity * Math.sin(Math.PI * life);
        if (a <= 0.01) return null;
        return (
          <Billboard key={i} position={[origin[0] + p.o[0] * (1 + life) + dir[0] * d, origin[1] + p.o[1] + dir[1] * d, origin[2] + p.o[2] * (1 + life) + dir[2] * d]}>
            <mesh layers={FX_LAYER} scale={[s, s, s]} rotation={[0, 0, p.rot + life]} renderOrder={2}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={softTexture()} color={color} transparent opacity={a} depthWrite={false} fog={false} />
            </mesh>
          </Billboard>
        );
      })}
    </>
  );
};

// ---------- light shaft ----------
let BEAM: THREE.CanvasTexture | null = null;
const beamTexture = () => {
  if (BEAM) return BEAM;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createLinearGradient(0, 0, 0, 256);
  r.addColorStop(0, "rgba(255,255,255,0.9)");
  r.addColorStop(0.6, "rgba(255,255,255,0.45)");
  r.addColorStop(1, "rgba(255,255,255,0.08)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 256);
  BEAM = new THREE.CanvasTexture(c);
  BEAM.colorSpace = THREE.SRGBColorSpace;
  return BEAM;
};
/** Sun shaft through a doline: additive cone + real spot light onto the floor. */
export const SunShaft: React.FC<{ top: V3; floor: V3; rTop: number; rBottom: number; color?: string; opacity?: number; intensity?: number }> = ({ top, floor, rTop, rBottom, color = "#FFF0CC", opacity = 0.16, intensity = 900 }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  const h = top[1] - floor[1];
  const tilt = Math.atan2(top[2] - floor[2], h);
  const tiltX = Math.atan2(top[0] - floor[0], h);
  return (
    <group>
      <primitive object={target} position={floor} />
      <spotLight position={top} target={target} angle={Math.atan2(rBottom, h) * 1.15} penumbra={0.7} intensity={intensity} distance={h * 2.2} decay={1.3} color={color} />
      <mesh layers={FX_LAYER} position={[(top[0] + floor[0]) / 2, (top[1] + floor[1]) / 2, (top[2] + floor[2]) / 2]} rotation={[tilt, 0, -tiltX]} renderOrder={3}>
        <cylinderGeometry args={[rTop, rBottom, Math.hypot(h, top[2] - floor[2]), 40, 1, true]} />
        <meshBasicMaterial map={beamTexture()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
    </group>
  );
};

// ---------- people ----------
/** Caving helmet with an emissive head lamp. */
export const Helmet: React.FC<{ lamp?: boolean; color?: string }> = ({ lamp = true, color = C.helmet }) => (
  <group>
    <mesh position={[0, 0.03, 0]} scale={[1.1, 0.9, 1.12]} castShadow>
      <sphereGeometry args={[0.13, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.7} clearcoatRoughness={0.2} />
    </mesh>
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.145, 0.012, 8, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    {lamp ? (
      <mesh position={[0, 0.085, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.03, 16]} />
        <meshStandardMaterial color="#FFF8E0" emissive={C.lamp} emissiveIntensity={9} />
      </mesh>
    ) : null}
  </group>
);
/** Backpack on the torso. */
const Pack: React.FC<{ color: string }> = ({ color }) => (
  <mesh position={[0, 0.1, -0.13]} scale={[0.11, 0.15, 0.07]} castShadow>
    <sphereGeometry args={[1, 16, 12]} />
    <meshStandardMaterial color={color} roughness={0.8} />
  </mesh>
);
export const Caver: React.FC<{ f: number; seed: number; pose?: PoseName; position: V3; heading?: number; scale?: number; light?: number; outfit?: Outfit; pack?: string; helmet?: boolean }> = ({ f, seed, pose = "walk", position, heading = 0, scale = 0.6, light = 0, outfit = "sport", pack = "#B5452B", helmet = true }) => (
  <group>
    <ToyPerson f={Math.floor(f / 5) * 5} seed={seed} pose={pose} outfit={outfit} expression="neutral" position={position} heading={heading} scale={scale} headwear={helmet ? <Helmet /> : undefined} torso={pack ? <Pack color={pack} /> : undefined} />
    {light > 0 ? <pointLight position={[position[0] + Math.sin(heading) * 0.4 * scale, position[1] + 1.5 * scale, position[2] + Math.cos(heading) * 0.4 * scale]} intensity={light} distance={7} decay={1.5} color={C.lamp} /> : null}
  </group>
);

// ---------- text textures ----------
const texCache = new Map<string, THREE.CanvasTexture>();
export const textTexture = (text: string, opts: { w?: number; h?: number; bg?: string; fg?: string; font?: string; border?: string } = {}) => {
  const { w = 512, h = 256, bg = "#C99A62", fg = "#2A170B", font = "bold 150px Georgia, serif", border = "#6E4426" } = opts;
  const key = `${text}|${w}|${h}|${bg}|${fg}|${font}|${border}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const rnd = mulberry32(text.length * 31 + w);
  for (let i = 0; i < 90; i++) {
    const y = rnd() * h;
    g.strokeStyle = `rgba(60,40,20,${0.08 + rnd() * 0.14})`;
    g.lineWidth = 1 + rnd() * 2;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(w * 0.3, y + (rnd() - 0.5) * 8, w * 0.7, y + (rnd() - 0.5) * 8, w, y + (rnd() - 0.5) * 6);
    g.stroke();
  }
  g.strokeStyle = border;
  g.lineWidth = Math.max(4, w / 110);
  g.strokeRect(w * 0.05, h * 0.08, w * 0.9, h * 0.84);
  g.fillStyle = fg;
  g.font = font;
  const m = font.match(/(\d+)px/);
  let px = m ? Number(m[1]) : 100;
  while (px > 20 && g.measureText(text).width > w * 0.82) {
    px -= 6;
    g.font = font.replace(/\d+px/, `${px}px`);
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + h * 0.03);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
};

/** Wooden sign board on two posts with a burned-in label. */
export const SignBoard: React.FC<{ text: string; position: V3; rotation?: number; w?: number }> = ({ text, position, rotation = 0, w = 1.3 }) => {
  const tex = textTexture(text, { w: 1024, h: 256, font: "bold 120px Georgia, serif" });
  const h = w / 4;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * w * 0.42, 0.45, -0.03]} material={mat("#6E4426", 1, "wood")} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.9, 10]} />
        </mesh>
      ))}
      <group position={[0, 0.78, 0]}>
        <mesh castShadow material={mat("#6E4426", 1, "wood")}>
          <boxGeometry args={[w, h, 0.05]} />
        </mesh>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[w * 0.94, h * 0.88]} />
          <meshStandardMaterial map={tex} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

/** Expedition crate with stencilled label on two faces. */
export const Crate: React.FC<{ text: string; position: V3; rotation?: number; size?: number }> = ({ text, position, rotation = 0, size = 0.6 }) => {
  const tex = textTexture(text, { w: 768, h: 384, bg: "#5E6B3C", fg: "#F3E9C8", border: "#2F3820", font: "bold 110px 'Arial Black', Arial, sans-serif" });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow material={mat("#4E5A30", 1, "paint")}>
        <boxGeometry args={[size, size * 0.6, size * 0.6]} />
      </mesh>
      <mesh position={[0, size * 0.3, size * 0.301]}>
        <planeGeometry args={[size * 0.96, size * 0.56]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <mesh position={[size * 0.501, size * 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[size * 0.56, size * 0.56 * 0.5]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  );
};

/** Glowing measure bar between two points (kinetic survey line), grows with u 0..1. */
export const MeasureBar: React.FC<{ a: V3; b: V3; u: number; color?: string; r?: number }> = ({ a, b, u, color = "#FFB25A", r = 0.05 }) => {
  if (u <= 0.001) return null;
  const e: V3 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const dir = new THREE.Vector3(e[0] - a[0], e[1] - a[1], e[2] - a[2]);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const eu = new THREE.Euler().setFromQuaternion(q);
  return (
    <group>
      <mesh position={[(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2]} rotation={[eu.x, eu.y, eu.z]}>
        <cylinderGeometry args={[r, r, len, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      {[a, e].map((p, i) => (
        <mesh key={i} position={p} scale={r * 2.6}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#FFFFFF" emissive={color} emissiveIntensity={4} />
        </mesh>
      ))}
    </group>
  );
};

/** Leaf sprite flung by the cave wind. */
export const Leaves: React.FC<{ t: number; origin: V3; dir: V3; n?: number; seed?: number; strength?: number }> = ({ t, origin, dir, n = 14, seed = 9, strength = 1 }) => {
  const s0 = st(t);
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n }, () => ({ ph: rnd(), o: [(rnd() - 0.5) * 1.4, rnd() * 1.2, (rnd() - 0.5) * 0.6] as V3, spin: rnd() * 6, c: ["#5E8A3C", "#8BA24A", "#A88B3C", "#4F7E36"][Math.floor(rnd() * 4)] }));
  }, [n, seed]);
  if (strength <= 0.01) return null;
  return (
    <>
      {items.map((l, i) => {
        const life = (s0 * 0.45 + l.ph) % 1;
        const d = life * 5 * strength;
        return (
          <mesh key={i} position={[origin[0] + l.o[0] + dir[0] * d, origin[1] + l.o[1] + dir[1] * d + Math.sin(life * 9 + i) * 0.15, origin[2] + l.o[2] + dir[2] * d]} rotation={[l.spin + life * 8, l.spin * 2 + life * 5, 0]} scale={[0.09, 0.045, 1]} castShadow>
            <circleGeometry args={[1, 10]} />
            <meshStandardMaterial color={l.c} side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
        );
      })}
    </>
  );
};
export { sm };
