// EP72 Gempa Lisbon 1755 — MOSAICFORGE shared parts.
// Azulejo = a 3D grid of individual glazed tiles (instanced, per-tile seeded tilt + tone, grey grout #8F806B).
// Every sign is a plain non-emissive plate; only fire is emissive (bloom is for flames only).
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ToyPerson, type Outfit, type PoseName } from "../core/polish/Person.tsx";
import { makeCeramicMaterial, makeFlagstoneTexture, makeGroutTexture } from "../kits/mosaicforge/lib/materials";
import { mulberry32, clamp01, smooth, dropCurve } from "../kits/mosaicforge/core/motion";
import type { V3 } from "./timeline.ts";

export { clamp01, smooth, dropCurve, mulberry32 };

export const C = {
  glaze: "#F3EEE2",
  glazeWarm: "#EFE3C8",
  cobalt: "#1F3C8C",
  cobaltDeep: "#152A66",
  cobaltLight: "#5A7CC6",
  sky: "#A9BEE6",
  ochre: "#D69A3A",
  terra: "#B4532A",
  terraDark: "#7E3519",
  grout: "#8F806B",
  stone: "#B9AC96",
  stoneDark: "#6E5A48",
  wood: "#8A5A34",
  woodDark: "#5A3820",
  soot: "#2B2420",
  mud: "#5C4A36",
  cream: "#EADCC0",
};

const lerpC = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
export const mixC = lerpC;

// ---------------------------------------------------------------- materials
const texCache = new Map<string, THREE.Texture>();
const cached = (key: string, make: () => THREE.Texture) => {
  let t = texCache.get(key);
  if (!t) {
    t = make();
    texCache.set(key, t);
  }
  return t;
};

const woodTexture = () =>
  cached("wood", () => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    const rnd = mulberry32(7201);
    g.fillStyle = "#b08560";
    g.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 46; i++) {
      const x = rnd() * 64;
      g.strokeStyle = `rgba(${rnd() < 0.5 ? "70,40,20" : "230,200,160"},${0.12 + rnd() * 0.2})`;
      g.lineWidth = 0.6 + rnd() * 1.8;
      g.beginPath();
      g.moveTo(x, 0);
      for (let y = 0; y <= 256; y += 16) g.lineTo(x + Math.sin(y * 0.03 + i) * 2.5, y);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

const matCache = new Map<string, THREE.Material>();
export const woodMat = (color = C.wood) => {
  const k = "wood" + color;
  let m = matCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, map: woodTexture(), roughness: 0.78, metalness: 0 });
    matCache.set(k, m);
  }
  return m;
};
export const fabricMat = (color: string) => {
  const k = "fab" + color;
  let m = matCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.96, metalness: 0 });
    matCache.set(k, m);
  }
  return m;
};
export const stoneMat = (color = C.stone, repeat = 3) => {
  const k = "stone" + color + repeat;
  let m = matCache.get(k);
  if (!m) {
    const map = cached("flag" + repeat, () => {
      const t = makeFlagstoneTexture();
      t.repeat.set(repeat, repeat);
      return t;
    });
    m = new THREE.MeshStandardMaterial({ color, map, roughness: 0.9, metalness: 0 });
    matCache.set(k, m);
  }
  return m;
};
export const plainMat = (color: string, roughness = 0.85) => {
  const k = "plain" + color + roughness;
  let m = matCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    matCache.set(k, m);
  }
  return m;
};
const groutMat = () => {
  let m = matCache.get("grout");
  if (!m) {
    const map = makeGroutTexture();
    map.repeat.set(6, 6);
    m = new THREE.MeshStandardMaterial({ color: "#ffffff", map, roughness: 0.95 });
    matCache.set("grout", m);
  }
  return m;
};

export const BOX = new THREE.BoxGeometry(1, 1, 1);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 18);
export const SPH = new THREE.SphereGeometry(1, 24, 16);
export const CONE = new THREE.ConeGeometry(1, 1, 16, 1, true);

// ---------------------------------------------------------------- azulejo panel
export type TileInfo = { i: number; j: number; u: number; v: number; x: number; y: number; seed: number; tilt: [number, number]; tone: number; base: THREE.Color };
export type TileFx = { dx?: number; dy?: number; dz?: number; rx?: number; ry?: number; rz?: number; s?: number; white?: number; dark?: number } | null;
const tmp = new THREE.Object3D();
const tmpC = new THREE.Color();
const WHITE = new THREE.Color("#F8F6F0");
const DARK = new THREE.Color("#1C1714");

/**
 * Glazed tile grid in the local XY plane, tiles facing +z. `floor` lays it flat (local +y -> world -z).
 * `fx(tile, t)` moves / tints each tile per frame (null = seated). Returning s <= 0 hides the tile.
 */
export const Azulejo: React.FC<{
  cols: number;
  rows: number;
  pitch: number;
  paint: (u: number, v: number, i: number, j: number) => string;
  t: number;
  fx?: (tile: TileInfo, t: number) => TileFx;
  dynamicColor?: boolean;
  floor?: boolean;
  center?: boolean;
  grout?: boolean;
  depth?: number;
  seed?: number;
  position?: V3;
  rotation?: V3;
}> = ({ cols, rows, pitch, paint, t, fx, dynamicColor = false, floor = false, center = floor, grout = true, depth = 0.03, seed = 1, position = [0, 0, 0], rotation }) => {
  const tiles = useMemo(() => {
    const rnd = mulberry32(seed * 7919 + cols * 31 + rows);
    const out: TileInfo[] = [];
    const y0 = center ? -(rows * pitch) / 2 : 0;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const u = (i + 0.5) / cols;
        const v = (j + 0.5) / rows;
        const s = rnd();
        const tone = 0.9 + rnd() * 0.14;
        const base = new THREE.Color(paint(u, v, i, j)).multiplyScalar(tone);
        out.push({ i, j, u, v, x: (i + 0.5) * pitch - (cols * pitch) / 2, y: y0 + (j + 0.5) * pitch, seed: s, tilt: [(rnd() - 0.5) * 0.07, (rnd() - 0.5) * 0.07], tone, base });
      }
    return out;
    // paint is a stable module-level function per panel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows, pitch, seed, center]);

  const mesh = useMemo(() => {
    const geo = new RoundedBoxGeometry(pitch * 0.93, pitch * 0.93, depth, 2, Math.min(0.012, pitch * 0.12));
    const m = new THREE.InstancedMesh(geo, makeCeramicMaterial(), tiles.length);
    tiles.forEach((tl, n) => m.setColorAt(n, tl.base));
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, [tiles, pitch, depth]);

  useLayoutEffect(() => {
    tiles.forEach((tl, n) => {
      const e = fx ? fx(tl, t) : null;
      const s = e?.s ?? 1;
      if (s <= 0.001) {
        tmp.position.set(0, -80, 0);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.setScalar(0.0001);
      } else {
        tmp.position.set(tl.x + (e?.dx ?? 0), tl.y + (e?.dy ?? 0), depth / 2 + (e?.dz ?? 0));
        tmp.rotation.set(tl.tilt[0] + (e?.rx ?? 0), tl.tilt[1] + (e?.ry ?? 0), e?.rz ?? 0);
        tmp.scale.set(s, s, 1);
      }
      tmp.updateMatrix();
      mesh.setMatrixAt(n, tmp.matrix);
      if (dynamicColor) {
        tmpC.copy(tl.base);
        if (e?.white) tmpC.lerp(WHITE, clamp01(e.white));
        if (e?.dark) tmpC.lerp(DARK, clamp01(e.dark));
        mesh.setColorAt(n, tmpC);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (dynamicColor && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const w = cols * pitch;
  const h = rows * pitch;
  return (
    <group position={position} rotation={rotation ?? (floor ? [-Math.PI / 2, 0, 0] : [0, 0, 0])}>
      <primitive object={mesh} />
      {grout ? (
        <mesh position={[0, center ? 0 : h / 2, 0.002]} material={groutMat()} receiveShadow>
          <planeGeometry args={[w, h]} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- paintings (u, v in 0..1, v up)
const border = (i: number, j: number, cols: number, rows: number) => {
  if (i === 0 || j === 0 || i === cols - 1 || j === rows - 1) return C.cobalt;
  if (i === 1 || j === 1 || i === cols - 2 || j === rows - 2) return (i + j) % 2 ? C.ochre : C.glaze;
  return null;
};

export const paintHouse = (cols: number, rows: number) => (u: number, v: number, i: number, j: number) => {
  const b = border(i, j, cols, rows);
  if (b) return b;
  const inRoof = v > 0.6 && v < 0.8 && Math.abs(u - 0.5) < (0.8 - v) * 1.6;
  if (inRoof) return v > 0.77 || Math.abs(Math.abs(u - 0.5) - (0.8 - v) * 1.6) < 0.06 ? C.cobaltDeep : C.cobaltLight;
  const body = v > 0.24 && v <= 0.6 && Math.abs(u - 0.5) < 0.27;
  if (body) {
    if (Math.abs(u - 0.5) > 0.235 || v < 0.27 || v > 0.57) return C.cobaltDeep;
    if (Math.abs(u - 0.5) < 0.06 && v < 0.4) return C.cobalt; // door
    if ((Math.abs(u - 0.36) < 0.05 || Math.abs(u - 0.64) < 0.05) && v > 0.45 && v < 0.53) return C.cobalt; // windows
    return C.glaze;
  }
  if (v <= 0.24) return (i + j) % 3 === 0 ? C.cobaltLight : C.cobalt;
  if ((u - 0.8) ** 2 + (v - 0.86) ** 2 < 0.004) return C.ochre;
  return C.glaze;
};

export const paintWave = (cols: number, rows: number) => (u: number, v: number, i: number, j: number) => {
  const b = border(i, j, cols, rows);
  if (b) return b;
  const d = Math.hypot((u - 0.58) * 1.0, (v - 0.56) * 0.75);
  if (d < 0.24 && d > 0.15 && !(u > 0.58 && v < 0.56)) return C.cobaltDeep;
  if (d <= 0.15 && v > 0.5 && u < 0.62) return C.glaze;
  const sea = 0.38 + 0.05 * Math.sin(u * 14);
  if (v < sea) return Math.floor(v * 18) % 2 ? C.cobalt : C.cobaltLight;
  if (v < sea + 0.04) return C.glaze; // foam line
  return v > 0.8 ? C.sky : C.glaze;
};

const flameIn = (u: number, v: number, cx: number, base: number, w: number, h: number) => {
  const dy = (v - base) / h;
  if (dy < 0 || dy > 1) return 0;
  const half = w * 1.4 * Math.sqrt(dy) * Math.pow(1 - dy, 0.9);
  const dx = Math.abs(u - cx - Math.sin(dy * 5) * w * 0.15);
  if (dx > half) return 0;
  return dx < half * 0.45 && dy < 0.6 ? 2 : 1;
};
export const paintFlame = (cols: number, rows: number) => (u: number, v: number, i: number, j: number) => {
  const b = border(i, j, cols, rows);
  if (b) return b;
  const f = Math.max(flameIn(u, v, 0.5, 0.22, 0.2, 0.62), flameIn(u, v, 0.27, 0.22, 0.11, 0.38), flameIn(u, v, 0.74, 0.22, 0.12, 0.42));
  if (f === 2) return C.ochre;
  if (f === 1) return C.terra;
  if (v < 0.22) return v < 0.12 ? C.cobaltDeep : C.cobalt; // roofs line
  return C.glaze;
};

/** Floor pattern: classic Portuguese 4-tile motif (quarter circles + diamond). */
export const paintFloor = (u: number, v: number, i: number, j: number) => {
  const a = i % 4;
  const b = j % 4;
  const cx = a < 2 ? a - 1.5 : a - 1.5;
  const q = Math.hypot(cx, b - 1.5);
  if (q < 0.8) return C.cobalt;
  if ((a + b) % 4 === 0) return C.cobaltLight;
  return C.glazeWarm;
};

// ---------------------------------------------------------------- maps
export type LL = [number, number];
export const inPoly = (x: number, y: number, poly: LL[]) => {
  let inside = false;
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const [xi, yi] = poly[a];
    const [xj, yj] = poly[b];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
export const IBERIA: LL[] = [
  [-9.3, 43.2], [-8.0, 43.7], [-5.5, 43.5], [-1.8, 43.4], [0.5, 43.2], [0.5, 38.0], [-0.8, 37.6], [-2.2, 36.7], [-4.4, 36.7], [-5.6, 36.0],
  [-6.3, 36.8], [-7.4, 37.2], [-8.0, 37.0], [-8.9, 37.0], [-8.8, 38.2], [-9.2, 38.5], [-9.5, 38.7], [-9.4, 39.4], [-8.9, 40.2], [-8.7, 41.5], [-8.9, 42.1], [-9.3, 42.9],
];
export const AFRICA: LL[] = [[-6.0, 35.8], [-5.3, 35.9], [-2.0, 35.1], [0.5, 35.4], [0.5, 33.0], [-7.2, 33.0], [-6.8, 34.3]];
export const PORTUGAL: LL[] = [
  [-8.9, 42.1], [-8.2, 42.1], [-6.2, 41.9], [-6.9, 41.0], [-6.8, 40.3], [-7.0, 39.6], [-7.4, 39.4], [-7.0, 38.9], [-7.3, 38.4], [-7.0, 38.0], [-7.5, 37.5], [-7.4, 37.2],
  [-8.0, 37.0], [-8.9, 37.0], [-8.8, 38.2], [-9.2, 38.5], [-9.5, 38.7], [-9.4, 39.4], [-8.9, 40.2], [-8.7, 41.5],
];
export const LISBON: LL = [-9.14, 38.72];
export const EPICENTER: LL = [-10.6, 36.4];

/** Iberia map extent (lon -14..-1, lat 35..44.5) on a 5 × 4.75 floor. */
export const IB = { lon0: -14, lon1: -1, lat0: 35, lat1: 44.5, w: 5, h: 4.75 };
export const ibXZ = ([lon, lat]: LL): [number, number] => [((lon - IB.lon0) / (IB.lon1 - IB.lon0) - 0.5) * IB.w, -((lat - IB.lat0) / (IB.lat1 - IB.lat0) - 0.5) * IB.h];
export const paintIberia = (u: number, v: number) => {
  const lon = IB.lon0 + u * (IB.lon1 - IB.lon0);
  const lat = IB.lat0 + v * (IB.lat1 - IB.lat0);
  if (inPoly(lon, lat, PORTUGAL)) return C.ochre;
  if (inPoly(lon, lat, IBERIA) || inPoly(lon, lat, AFRICA)) return C.cream;
  const deep = (Math.floor(lon * 2) + Math.floor(lat * 2)) % 2 === 0;
  return deep ? C.cobalt : C.cobaltDeep;
};

/** Portugal map (lon -10.6..-5.6, lat 36.6..42.4) on a 3.84 × 5.8 floor. */
export const PT = { lon0: -10.6, lon1: -5.6, lat0: 36.6, lat1: 42.4, w: 3.84, h: 5.8 };
export const ptXZ = ([lon, lat]: LL): [number, number] => [((lon - PT.lon0) / (PT.lon1 - PT.lon0) - 0.5) * PT.w, -((lat - PT.lat0) / (PT.lat1 - PT.lat0) - 0.5) * PT.h];
export const paintPortugal = (u: number, v: number, i: number, j: number) => {
  const lon = PT.lon0 + u * (PT.lon1 - PT.lon0);
  const lat = PT.lat0 + v * (PT.lat1 - PT.lat0);
  if (inPoly(lon, lat, PORTUGAL)) return (i + j) % 2 ? C.glazeWarm : C.cream;
  if (inPoly(lon, lat, IBERIA)) return C.stone;
  return (i + j) % 2 ? C.cobalt : C.cobaltDeep;
};
/** Parishes that answered (approximate towns): Porto, Coimbra, Leiria, Lisbon, Setúbal, Évora, Faro, Lagos, Braga, Viseu, Guarda, Beja. */
export const PARISHES: LL[] = [[-8.61, 41.15], [-8.43, 40.2], [-8.8, 39.74], [-9.14, 38.72], [-8.89, 38.52], [-7.91, 38.57], [-7.93, 37.02], [-8.67, 37.1], [-8.42, 41.55], [-7.91, 40.66], [-7.27, 40.54], [-7.86, 38.01]];

// ---------------------------------------------------------------- plaque (non-emissive sign)
const plaqueCache = new Map<string, THREE.Material>();
export const Plaque: React.FC<{ text: string; sub?: string; w: number; h: number; position?: V3; rotation?: V3; bg?: string; ink?: string }> = ({ text, sub, w, h, position, rotation, bg = "#13306F", ink = "#FFFFFF" }) => {
  const key = `${text}|${sub}|${w}|${h}|${bg}|${ink}`;
  let m = plaqueCache.get(key);
  if (!m) {
    const W = 512;
    const H = Math.round((W * h) / w);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = C.ochre;
    g.lineWidth = Math.max(6, H * 0.06);
    g.strokeRect(g.lineWidth, g.lineWidth, W - g.lineWidth * 2, H - g.lineWidth * 2);
    g.fillStyle = ink;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const fs = Math.min(H * (sub ? 0.46 : 0.6), (W * 0.82) / (text.length * 0.62));
    g.font = `900 ${fs}px 'Segoe UI', Arial, sans-serif`;
    g.fillText(text, W / 2, sub ? H * 0.42 : H / 2);
    if (sub) {
      g.font = `700 ${H * 0.2}px 'Segoe UI', Arial, sans-serif`;
      g.fillStyle = C.ochre;
      g.fillText(sub, W / 2, H * 0.76);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0 });
    plaqueCache.set(key, m);
  }
  return (
    <group position={position} rotation={rotation}>
      <mesh material={m} position={[0, 0, 0.011]}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={plainMat(C.cobaltDeep, 0.5)} castShadow>
        <boxGeometry args={[w * 1.04, h * 1.06, 0.02]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- faceless figure
/** ToyPerson with a rounded head-cloth that covers the head (no face), fabric robe. */
export const Figure: React.FC<{ f: number; seed?: number; pose?: PoseName; position?: V3; heading?: number; scale?: number; cloth?: string; robe?: string; outfit?: Outfit; rightHand?: React.ReactNode }> = ({
  f,
  seed = 1,
  pose = "stand",
  position,
  heading = 0,
  scale = 1,
  cloth,
  robe,
  outfit = "traditional",
  rightHand,
}) => {
  const rnd = mulberry32(seed * 131);
  const robes = ["#6B4A3A", "#3F4E6E", "#7A6A52", "#5C3B2E", "#4C5A44", "#8A6E50"];
  const top = robe ?? robes[Math.floor(rnd() * robes.length)];
  const head = cloth ?? ["#E8DCC6", "#D9C7A8", "#C9B48E", "#EFE6D6"][Math.floor(rnd() * 4)];
  return (
    <ToyPerson
      f={f}
      seed={seed}
      pose={pose}
      position={position}
      heading={heading}
      scale={scale}
      outfit={outfit}
      look={{ top, bottom: top, skin: "#C9A27E", hairStyle: 3 }}
      rightHand={rightHand}
      headwear={
        <group>
          <mesh geometry={SPH} material={fabricMat(head)} scale={[0.15, 0.152, 0.15]} castShadow />
          <mesh geometry={SPH} material={fabricMat(head)} position={[0, -0.09, -0.03]} scale={[0.17, 0.12, 0.15]} castShadow />
        </group>
      }
    />
  );
};

// ---------------------------------------------------------------- fire / smoke / candle / haze
const fireMat = (color: string, k: number) => {
  const key = "fire" + color + k;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 1, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide });
    matCache.set(key, m);
  }
  return m;
};
export const Flame: React.FC<{ t: number; position?: V3; size?: number; seed?: number; s?: number }> = ({ t, position, size = 0.5, seed = 1, s = 1 }) => {
  if (s <= 0.01) return null;
  const fl = (k: number) => 1 + 0.18 * Math.sin(t * (9 + k * 3) + seed * 7 + k) + 0.08 * Math.sin(t * 23 + seed * 3);
  return (
    <group position={position} scale={size * s}>
      <mesh geometry={CONE} material={fireMat("#FF5A1A", 2.2)} position={[0, 0.5 * fl(0), 0]} scale={[0.32, fl(0), 0.32]} />
      <mesh geometry={CONE} material={fireMat("#FFA533", 2.6)} position={[0.08, 0.36 * fl(1), 0.05]} scale={[0.2, 0.72 * fl(1), 0.2]} />
      <mesh geometry={CONE} material={fireMat("#FFD27A", 2.8)} position={[-0.06, 0.26 * fl(2), -0.03]} scale={[0.12, 0.5 * fl(2), 0.12]} />
    </group>
  );
};

export const Smoke: React.FC<{ t: number; origin: V3; seed?: number; size?: number; rise?: number; from?: number; color?: string }> = ({ t, origin, seed = 1, size = 0.3, rise = 2.2, from = -99, color = "#3A3330" }) => {
  const rnd = mulberry32(seed * 17);
  const puffs = Array.from({ length: 6 }, (_, n) => ({ ph: n / 6 + rnd() * 0.08, dx: (rnd() - 0.5) * 0.6 }));
  if (t < from) return null;
  return (
    <group position={origin}>
      {puffs.map((p, n) => {
        const k = (((t - from) * 0.28 + p.ph) % 1 + 1) % 1;
        const sc = size * (0.5 + k * 1.4);
        return (
          <mesh key={n} geometry={SPH} position={[p.dx * k + k * 0.4, k * rise, p.dx * 0.3]} scale={sc}>
            <meshStandardMaterial color={color} roughness={1} transparent opacity={0.55 * (1 - k)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Candle: React.FC<{ t: number; position?: V3; h?: number; r?: number; seed?: number; lit?: boolean }> = ({ t, position, h = 0.3, r = 0.04, seed = 1, lit = true }) => (
  <group position={position}>
    <mesh geometry={CYL} material={plainMat("#F1E6CF", 0.6)} position={[0, h / 2, 0]} scale={[r, h, r]} castShadow />
    {lit ? <Flame t={t} position={[0, h, 0]} size={r * 2.6} seed={seed} /> : null}
  </group>
);

let hazeTex: THREE.Texture | null = null;
const hazeTexture = () => {
  if (!hazeTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(0.55, "rgba(255,255,255,0.9)");
    grd.addColorStop(1, "rgba(255,255,255,0.4)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    hazeTex = new THREE.CanvasTexture(c);
  }
  return hazeTex;
};
/** Soft haze sheets behind the subject (separates it from the background, keeps the tile detail). */
export const Haze: React.FC<{ color: string; z?: number; x?: number; width?: number; height?: number; opacity?: number; rotY?: number }> = ({ color, z = -6, x = 0, width = 30, height = 5, opacity = 0.4, rotY = 0 }) => (
  <group rotation={[0, rotY, 0]}>
    {[0, 1, 2].map((n) => (
      <mesh key={n} position={[x, height / 2 - 0.4, z - n * 2.2]} renderOrder={-1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={hazeTexture()} color={color} transparent opacity={opacity * (0.55 + n * 0.25)} depthWrite={false} fog={false} />
      </mesh>
    ))}
  </group>
);

/** Stone ground (worn flags) under a scene. */
export const Ground: React.FC<{ size?: number; y?: number; color?: string; repeat?: number }> = ({ size = 40, y = -0.002, color = C.stone, repeat = 8 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={stoneMat(color, repeat)} receiveShadow>
    <planeGeometry args={[size, size]} />
  </mesh>
);

/** Wooden beam between two points (square section). */
export const Beam: React.FC<{ a: V3; b: V3; w?: number; color?: string; k?: number }> = ({ a, b, w = 0.07, color = C.wood, k = 1 }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const end = va.clone().lerp(vb, clamp01(k));
  const len = va.distanceTo(end);
  if (len < 0.001) return null;
  const mid = va.clone().add(end).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(va).normalize());
  return <mesh geometry={BOX} material={woodMat(color)} position={mid.toArray() as V3} quaternion={q} scale={[w, len, w]} castShadow receiveShadow />;
};
