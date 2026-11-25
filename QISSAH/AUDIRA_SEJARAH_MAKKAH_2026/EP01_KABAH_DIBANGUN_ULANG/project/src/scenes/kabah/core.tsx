// Shared core for the EP01 film: voice clock anchors, palette, textures, parts and the
// parametric Ka'bah model (draped kiswah / stone courses / glass study model).
// Depiction rules: no prophet, no figure; the Ka'bah of today is never shown damaged. Historical
// rebuilding is shown on separate study models (stone courses that rise or are laid out on plan).

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT, fontReady } from "../../core/type/fonts.ts";
import TLJ from "./timeline.json";

// ---------------------------------------------------------------- voice clock
export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; chapter: string; display: string; start: number; end: number; words: Word[] };
export type Chapter = { id: string; title: string; start: number; end: number };
export const TL = TLJ as unknown as { lead: number; voEnd: number; total: number; endScreen: number; chapters: Chapter[]; clips: Clip[] };

const norm = (s: string) => s.toLowerCase().replace(/[.,:;?!]/g, "");
/** Chapter by short id ("c02"). */
export const CH = (id: string): Chapter => {
  const c = TL.chapters.find((x) => x.id.startsWith(id));
  if (!c) throw new Error(`chapter ${id}`);
  return c;
};
/** Start time (s, vo.wav clock) of the nth occurrence of `word` in chapter `ch`. Throws when missing. */
export const W = (ch: string, word: string, nth = 0): number => {
  let k = 0;
  for (const c of TL.clips)
    if (c.chapter.startsWith(ch))
      for (const x of c.words)
        if (norm(x.w) === norm(word)) {
          if (k === nth) return x.s;
          k++;
        }
  throw new Error(`anchor ${ch}:${word}#${nth}`);
};

// ---------------------------------------------------------------- easing
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** Eased 0..1 progress of t between a and b. */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / Math.max(1e-6, b - a));
/** 0 → 1 between a and a+fi, holds, 1 → 0 between b-fo and b. */
export const window01 = (t: number, a: number, b: number, fi = 0.6, fo = 0.6) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- palette
export const C = {
  bg: "#ece3d4",
  fog: "#e8dfcf",
  floor: "#d9ccb7",
  marble: "#f1eee8",
  travertine: "#d6c6ab",
  pearl: "#f4efe6",
  brass: "#b8903f",
  gold: "#c9a046",
  goldDeep: "#8c6a26",
  ink: "#1d1a16",
  inkSoft: "#6b6257",
  accent: "#3fb8c9",
  warmGlow: "#ffcf86",
  wood: "#8b5a33",
  sand: "#d6c19a",
  stone: "#a8927a",
  granite: "#8f8b86",
  steel: "#b9bcc0",
  silver: "#d9dcdf",
  green: "#0B3D2E",
};

// ---------------------------------------------------------------- textures (seeded)
export const canvasTex = (size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, repeat: [number, number] = [1, 1], srgb = true) => {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
};

const lattice = (g: CanvasRenderingContext2D, s: number, stroke: string, lw: number, dot?: string) => {
  const n = 4;
  g.strokeStyle = stroke;
  g.lineWidth = lw;
  for (let i = -n; i <= n * 2; i++) {
    g.beginPath(); g.moveTo((i * s) / n, 0); g.lineTo((i * s) / n + s, s); g.stroke();
    g.beginPath(); g.moveTo((i * s) / n, s); g.lineTo((i * s) / n + s, 0); g.stroke();
  }
  if (dot) {
    g.fillStyle = dot;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        g.beginPath();
        g.arc(((x + 0.5) * s) / n, ((y + 0.5) * s) / n, s / n / 7, 0, Math.PI * 2);
        g.fill();
      }
  }
};

const cache = new Map<string, THREE.Texture>();
const once = (k: string, f: () => THREE.Texture) => {
  if (!cache.has(k)) cache.set(k, f());
  return cache.get(k)!;
};

export const TEX = {
  kiswah: () => once("kiswah", () => canvasTex(512, (g, s) => { g.fillStyle = "#211f1d"; g.fillRect(0, 0, s, s); lattice(g, s, "#2d2a27", 5, "#2a2724"); }, [4, 5])),
  kiswahBump: () => once("kiswahBump", () => canvasTex(512, (g, s) => { g.fillStyle = "#808080"; g.fillRect(0, 0, s, s); lattice(g, s, "rgba(255,255,255,0.55)", 3); }, [4, 5], false)),
  band: () =>
    once("band", () =>
      canvasTex(1024, (g, s) => {
        g.fillStyle = "#ddb75e";
        g.fillRect(0, 0, s, s);
        const panels = 4;
        for (let i = 0; i < panels; i++) {
          const x0 = (i * s) / panels, pw = s / panels;
          g.strokeStyle = "#6f5219"; g.lineWidth = 14; g.strokeRect(x0 + 26, 70, pw - 52, s - 140);
          g.strokeStyle = "#f0d58c"; g.lineWidth = 5; g.strokeRect(x0 + 44, 92, pw - 88, s - 184);
          g.fillStyle = "#7c5c1e"; g.beginPath(); g.arc(x0 + pw / 2, s / 2, 70, 0, Math.PI * 2); g.fill();
          g.fillStyle = "#e6c777";
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            g.beginPath(); g.arc(x0 + pw / 2 + Math.cos(a) * 42, s / 2 + Math.sin(a) * 42, 16, 0, Math.PI * 2); g.fill();
          }
          // stitched scroll lines either side of the rosette (ornament, not script)
          g.strokeStyle = "#8a6a26"; g.lineWidth = 6;
          for (const sd of [-1, 1]) {
            g.beginPath();
            for (let x = 0; x <= 60; x++) {
              const px = x0 + pw / 2 + sd * (100 + x * 1.2), py = s / 2 + Math.sin(x * 0.35) * 60;
              if (x === 0) g.moveTo(px, py); else g.lineTo(px, py);
            }
            g.stroke();
          }
        }
        g.fillStyle = "#6f5219"; g.fillRect(0, 0, s, 30); g.fillRect(0, s - 30, s, 30);
      }),
    ),
  mataf: () =>
    once("mataf", () =>
      canvasTex(2048, (g, s) => {
        g.fillStyle = "#f2efe9"; g.fillRect(0, 0, s, s);
        const rnd = prng(41);
        g.strokeStyle = "rgba(160,150,135,0.10)";
        for (let i = 0; i < 90; i++) {
          g.lineWidth = 1 + rnd() * 2;
          g.beginPath();
          let x = rnd() * s, y = rnd() * s;
          g.moveTo(x, y);
          for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * 260; y += (rnd() - 0.5) * 260; g.lineTo(x, y); }
          g.stroke();
        }
        g.strokeStyle = "rgba(150,135,110,0.22)";
        for (let r = 0.12; r < 0.5; r += 0.045) { g.lineWidth = 3; g.beginPath(); g.arc(s / 2, s / 2, r * s, 0, Math.PI * 2); g.stroke(); }
      }),
    ),
  sand: () =>
    once("sand", () =>
      canvasTex(512, (g, s) => {
        g.fillStyle = "#d8c39c"; g.fillRect(0, 0, s, s);
        const rnd = prng(88);
        for (let i = 0; i < 9000; i++) { const v = 180 + Math.round(rnd() * 50); g.fillStyle = `rgba(${v},${v - 18},${v - 50},0.35)`; g.fillRect(rnd() * s, rnd() * s, 2, 2); }
        g.strokeStyle = "rgba(150,120,80,0.18)"; g.lineWidth = 3;
        for (let y = 0; y < s; y += 22) { g.beginPath(); for (let x = 0; x <= s; x += 8) g.lineTo(x, y + Math.sin(x * 0.03 + y) * 6); g.stroke(); }
      }, [4, 4]),
    ),
  parchment: () =>
    once("parchment", () =>
      canvasTex(1024, (g, s) => {
        const grd = g.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.75);
        grd.addColorStop(0, "#efe3c8"); grd.addColorStop(1, "#d6c29a");
        g.fillStyle = grd; g.fillRect(0, 0, s, s);
        const rnd = prng(12);
        for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,90,50,${rnd() * 0.06})`; g.fillRect(rnd() * s, rnd() * s, 3, 3); }
      }),
    ),
};

// ---------------------------------------------------------------- text on a canvas, after Manrope loads
export const useFontReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("kabah: canvas text font"));
  useLayoutEffect(() => {
    let live = true;
    fontReady().then(() => {
      if (live) setReady(true);
      continueRender(handle);
    });
    return () => {
      live = false;
    };
  }, [handle]);
  return ready;
};

/** Engraved text plate texture (brass or stone), drawn once the font is ready. */
export const useTextTex = (lines: string[], opts: { w?: number; h?: number; bg?: string; ink?: string; size?: number; spacing?: number } = {}) => {
  const ready = useFontReady();
  const { w = 1024, h = 256, bg = "#b8903f", ink = "#3b2a0c", size = 96, spacing = 10 } = opts;
  return useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach((l, i) => {
      const fs = i === 0 ? size : size * 0.55;
      g.font = `600 ${fs}px ${ready ? FONT : "sans-serif"}`;
      (g as unknown as { letterSpacing: string }).letterSpacing = `${i === 0 ? spacing : spacing / 2}px`;
      g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 0.95);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [ready, lines.join("|"), w, h, bg, ink, size, spacing]);
};

// ---------------------------------------------------------------- parts
export type V3 = [number, number, number];
export const Box: React.FC<{ s: V3; p?: V3; r?: V3; c: string; rough?: number; metal?: number; radius?: number; emissive?: string; ei?: number; cast?: boolean; op?: number; mat?: Record<string, unknown> }> = ({
  s, p = [0, 0, 0], r = [0, 0, 0], c, rough = 0.7, metal = 0, radius, emissive, ei = 0, cast = true, op = 1, mat,
}) => (
  <mesh position={p} rotation={r} castShadow={cast} receiveShadow>
    <RoundedBoxGeo args={s} radius={radius ?? Math.min(...s) * 0.12} segments={3} />
    <meshPhysicalMaterial color={c} roughness={rough} metalness={metal} emissive={emissive ?? "#000000"} emissiveIntensity={ei} transparent={op < 1} opacity={op} depthWrite={op >= 1} {...mat} />
  </mesh>
);

export const Glow: React.FC<{ s: V3; p: V3; r?: V3; c?: string; op?: number }> = ({ s, p, r = [0, 0, 0], c = C.warmGlow, op = 1 }) =>
  op <= 0.001 ? null : (
    <mesh position={p} rotation={r}>
      <boxGeometry args={s} />
      <meshBasicMaterial color={c} toneMapped={false} transparent opacity={op} depthWrite={false} />
    </mesh>
  );

/** Glowing rectangle outline on the ground (w along x, d along z). */
export const GroundOutline: React.FC<{ w: number; d: number; x?: number; z?: number; y?: number; c?: string; op?: number; t?: number }> = ({ w, d, x = 0, z = 0, y = 0.012, c = C.warmGlow, op = 1, t = 0.04 }) => (
  <group position={[x, y, z]}>
    <Glow s={[w, 0.01, t]} p={[0, 0, -d / 2]} c={c} op={op} />
    <Glow s={[w, 0.01, t]} p={[0, 0, d / 2]} c={c} op={op} />
    <Glow s={[t, 0.01, d]} p={[-w / 2, 0, 0]} c={c} op={op} />
    <Glow s={[t, 0.01, d]} p={[w / 2, 0, 0]} c={c} op={op} />
  </group>
);

/** Round display plinth used by every station. */
export const Plinth: React.FC<{ r?: number; h?: number; c?: string }> = ({ r = 7, h = 0.5, c = C.travertine }) => {
  const grain = useSurfaceGrain(9, 0.2, 6);
  return (
    <group>
      <mesh position={[0, -h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r + 0.12, h, 128]} />
        <meshPhysicalMaterial color={c} roughness={0.8} roughnessMap={grain} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[r - 0.18, 0.04, 10, 200]} />
        <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** Brass museum plaque with engraved text, leaning back on a small stand. */
export const Plaque: React.FC<{ lines: string[]; p: V3; ry?: number; w?: number }> = ({ lines, p, ry = 0, w = 1.6 }) => {
  const tex = useTextTex(lines, { w: 1024, h: 320, size: 104 });
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <mesh position={[0, w * 0.16, 0]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[w, w * 0.31, 0.04]} />
        <meshPhysicalMaterial attach="material-4" map={tex} metalness={0.85} roughness={0.32} />
        <meshPhysicalMaterial attach="material-0" color={C.brass} metalness={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-1" color={C.brass} metalness={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-2" color={C.brass} metalness={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-3" color={C.brass} metalness={1} roughness={0.3} />
        <meshPhysicalMaterial attach="material-5" color={C.brass} metalness={1} roughness={0.3} />
      </mesh>
      <Box s={[w * 0.9, 0.06, 0.4]} p={[0, 0.03, 0.05]} c="#6f5a3a" rough={0.6} radius={0.02} />
    </group>
  );
};

// ---------------------------------------------------------------- kiswah drape geometry
/**
 * A side of the kiswah: a plane whose vertices fold like heavy cloth hanging from the roof edge.
 * Folds deepen toward the hem, vanish at the vertical edges (so faces meet at the corners) and are
 * flattened by the band, where the cloth is sewn tight.
 */
export const drapeGeo = (width: number, height: number, seed: number, bandV = 0.69) => {
  const g = new THREE.PlaneGeometry(width, height, Math.round(width * 34), 40);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = x / width + 0.5, v = y / height + 0.5;
    const edge = smooth(u / 0.035) * smooth((1 - u) / 0.035);
    const fold = Math.sin(x * 7.3 + seed) * 0.55 + Math.sin(x * 16.1 + seed * 2.3) * 0.3 + Math.sin(x * 3.1 + seed * 0.7) * 0.15;
    const below = Math.max(0, bandV - v) / bandV; // 0 at the band, 1 at the hem
    const above = Math.max(0, v - bandV) / (1 - bandV);
    const amp = 0.006 + 0.038 * below * below + 0.008 * above * (1 - above) * 4;
    const tightBand = 1 - Math.exp(-Math.pow((v - bandV) / 0.06, 2));
    pos.setZ(i, fold * amp * edge * tightBand + 0.012 * edge);
  }
  g.computeVertexNormals();
  return g;
};

// ---------------------------------------------------------------- stone courses
type Opening = { face: 0 | 1 | 2 | 3; u0: number; u1: number; y0: number; y1: number };
/**
 * Dry-stone walls as instanced blocks, course by course. `rise` (0..1) shows the courses up to that
 * height (building up or taking down). Faces: 0 = +z (east, door side), 1 = +x, 2 = -z, 3 = -x.
 */
export const StoneWalls: React.FC<{ w: number; d: number; h: number; x0?: number; rise?: number; faceRise?: [number, number, number, number]; thick?: number; openings?: Opening[]; seed?: number; palette?: string[]; tint?: number }> = ({
  w, d, h, x0 = 0, rise = 1, faceRise = [1, 1, 1, 1], thick = 0.28, openings = [], seed = 3, palette = ["#b8a68c", "#a99a84", "#c2b49c", "#9f907b", "#b0a48f"], tint = 0,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new RoundedBoxGeometryLite(), []);
  const blocks = useMemo(() => {
    const rnd = prng(seed);
    const out: { m: THREE.Matrix4; y: number; c: THREE.Color; f: number }[] = [];
    const courseH = 0.19;
    const faces: { len: number; place: (u: number) => [number, number, number] }[] = [
      { len: w, place: (u) => [x0 - w / 2 + u, d / 2 - thick / 2, 0] },
      { len: d, place: (u) => [x0 + w / 2 - thick / 2, d / 2 - u, Math.PI / 2] },
      { len: w, place: (u) => [x0 + w / 2 - u, -d / 2 + thick / 2, 0] },
      { len: d, place: (u) => [x0 - w / 2 + thick / 2, -d / 2 + u, Math.PI / 2] },
    ];
    const rows = Math.ceil(h / courseH);
    faces.forEach((f, fi) => {
      for (let r = 0; r < rows; r++) {
        const y = r * courseH + courseH / 2;
        let u = r % 2 ? 0.17 : 0;
        while (u < f.len) {
          const L = Math.min(f.len - u, 0.28 + rnd() * 0.16);
          const uc = u + L / 2;
          const hole = openings.some((o) => o.face === fi && uc > o.u0 * f.len && uc < o.u1 * f.len && y > o.y0 && y < o.y1);
          if (!hole && L > 0.05) {
            const [px, pz, ry] = f.place(uc);
            const m = new THREE.Matrix4().compose(
              new THREE.Vector3(fi % 2 ? px : px, y, fi % 2 ? pz : pz),
              new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry + (rnd() - 0.5) * 0.03, 0)),
              new THREE.Vector3(L - 0.025 - rnd() * 0.02, courseH - 0.02 - rnd() * 0.02, thick * (0.9 + rnd() * 0.14)),
            );
            out.push({ m, y, f: fi, c: new THREE.Color(palette[Math.floor(rnd() * palette.length)]).multiplyScalar(0.86 + rnd() * 0.24) });
          }
          u += L;
        }
      }
    });
    return out;
  }, [w, d, h, x0, thick, seed, JSON.stringify(openings), palette.join()]);
  useLayoutEffect(() => {
    const im = ref.current!;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const soot = new THREE.Color("#3a332c");
    blocks.forEach((b, i) => {
      im.setMatrixAt(i, b.y < rise * faceRise[b.f] * h + 0.001 ? b.m : zero);
      im.setColorAt(i, tint > 0 ? b.c.clone().lerp(soot, tint * (0.6 + 0.4 * Math.sin(i * 12.9898) ** 2)) : b.c);
    });
    im.count = blocks.length;
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, Math.max(1, blocks.length)]} castShadow receiveShadow>
      <meshPhysicalMaterial roughness={0.86} />
    </instancedMesh>
  );
};

/** Unit rounded box for instancing (bevelled stones). */
class RoundedBoxGeometryLite extends THREE.BoxGeometry {
  constructor() {
    super(1, 1, 1, 2, 2, 2);
    const p = this.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
      const k = 0.92 + 0.08 * (1 - Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)) * 2);
      p.setXYZ(i, v.x * (Math.abs(v.x) > 0.49 ? 1 : k), v.y * (Math.abs(v.y) > 0.49 ? 1 : k), v.z * (Math.abs(v.z) > 0.49 ? 1 : k));
    }
    this.computeVertexNormals();
  }
}

/** Stones laid out in rows on the ground: how the film shows a wall that came down. */
export const PlanStones: React.FC<{ n: number; p: V3; cols?: number; k?: number; seed?: number; c?: string }> = ({ n, p, cols = 8, k = 1, seed = 5, c = "#a8927a" }) => {
  const stones = useMemo(() => {
    const rnd = prng(seed);
    return Array.from({ length: n }, (_, i) => ({ x: (i % cols) * 0.36, z: Math.floor(i / cols) * 0.3, r: (rnd() - 0.5) * 0.25, l: 0.26 + rnd() * 0.06, tone: 0.9 + rnd() * 0.15 }));
  }, [n, cols, seed]);
  const shown = Math.round(n * clamp01(k));
  return (
    <group position={p}>
      {stones.slice(0, shown).map((s, i) => (
        <Box key={i} s={[s.l, 0.16, 0.24]} p={[s.x, 0.08, s.z]} r={[0, s.r, 0]} c={new THREE.Color(c).multiplyScalar(s.tone).getStyle()} rough={0.88} radius={0.02} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- Hijr wall
export const HijrWall: React.FC<{ rx?: number; rz?: number; h?: number; p?: V3; c?: string; op?: number; glow?: number }> = ({ rx = 2.45, rz = 1.55, h = 0.4, p = [0, 0, 0], c = C.marble, op = 1, glow = 0 }) => {
  const geo = useMemo(() => {
    const t = 0.15, a0 = -Math.PI * 0.44, a1 = Math.PI * 0.44, N = 48;
    const sh = new THREE.Shape();
    for (let i = 0; i <= N; i++) {
      const a = a0 + ((a1 - a0) * i) / N;
      if (i === 0) sh.moveTo(Math.cos(a) * rx, Math.sin(a) * rz);
      else sh.lineTo(Math.cos(a) * rx, Math.sin(a) * rz);
    }
    for (let i = N; i >= 0; i--) {
      const a = a0 + ((a1 - a0) * i) / N;
      sh.lineTo(Math.cos(a) * (rx - t), Math.sin(a) * (rz - t));
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 4 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [rx, rz, h]);
  const floor = useMemo(() => {
    const sh = new THREE.Shape();
    const a0 = -Math.PI * 0.5, a1 = Math.PI * 0.5;
    sh.moveTo(0, -rz);
    for (let i = 0; i <= 48; i++) { const a = a0 + ((a1 - a0) * i) / 48; sh.lineTo(Math.cos(a) * rx, Math.sin(a) * rz); }
    sh.lineTo(0, rz);
    const g = new THREE.ShapeGeometry(sh);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [rx, rz]);
  return (
    <group position={p}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color={c} roughness={0.3} clearcoat={0.2} transparent={op < 1} opacity={op} />
      </mesh>
      {glow > 0.001 ? (
        <mesh geometry={floor} position={[0, 0.015, 0]}>
          <meshBasicMaterial color={C.warmGlow} transparent opacity={0.55 * glow} toneMapped={false} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- the parametric Ka'bah
export type KabahProps = {
  /** door side length (x), side (z), height */
  w?: number; d?: number; h?: number;
  /** extension along +x (Hijr area included, Ibn Zubair / Ibrahim footprint) */
  ext?: number;
  dress?: "kiswah" | "stone" | "glass";
  roof?: boolean;
  /** east door: "raised" (Quraysh and today) or "ground" */
  door?: "raised" | "ground";
  /** west door at ground on the -z face: 0 none, 1 open; walled 0..1 fills it with bricks */
  west?: number; walled?: number;
  doorRaise?: number;
  rise?: number;
  hijr?: boolean;
  hajar?: "stone" | "frame" | "empty" | "none";
  doorGlow?: number;
  tint?: number;
  belts?: number;
  seed?: number;
  faceRise?: [number, number, number, number];
  palette?: string[];
};

export const KabahModel: React.FC<KabahProps> = ({
  w = 3.6, d = 3.0, h = 4.5, ext = 0, dress = "kiswah", roof = true, door = "raised", west = 0, walled = 0, doorRaise = 1, rise = 1, hijr = true, hajar = "frame", doorGlow = 0, tint = 0, belts = 0, seed = 3, faceRise, palette,
}) => {
  const base = 0.13;
  const W = w + ext, cx = ext / 2;
  const doorW = 0.56, doorX = -0.62;
  const raisedY = base + Math.min(0.68, h * 0.15);
  const doorY = door === "ground" ? base : mix(base, raisedY, doorRaise);
  const doorH = Math.min(h * 0.215, 1.0);
  const kis = TEX.kiswah(), kisBump = TEX.kiswahBump(), band = TEX.band();
  const drape = useMemo(
    () => ({
      front: drapeGeo(W, h, seed),
      side: drapeGeo(d, h, seed + 1.7),
    }),
    [W, d, h, seed],
  );
  const bandY = base + h * 0.69;
  const hajarY = base + h * 0.1 + 0.02;

  const doorMesh = (z: number, ry: number, ground: boolean, glow: number) => (
    <group position={[doorX, 0, z]} rotation={[0, ry, 0]}>
      {dress === "kiswah" ? (
        <>
          <Box s={[doorW + 0.14, doorH + 0.12, 0.05]} p={[0, doorY + doorH / 2, 0.02]} c={C.goldDeep} metal={0.9} rough={0.4} radius={0.012} />
          {[-1, 1].map((sd) => (
            <Box key={sd} s={[doorW / 2 - 0.012, doorH, 0.05]} p={[(sd * doorW) / 4, doorY + doorH / 2, 0.04]} c="#e4bf68" metal={0.75} rough={0.26} radius={0.01} mat={{ emissive: "#3a2a08", emissiveIntensity: 0.4, clearcoat: 0.5 }} />
          ))}
          {[0.25, 0.5, 0.75].map((k) => (
            <Box key={k} s={[doorW - 0.04, 0.012, 0.02]} p={[0, doorY + doorH * k, 0.068]} c={C.goldDeep} metal={1} rough={0.3} radius={0.004} cast={false} />
          ))}
        </>
      ) : (
        <Box s={[doorW, ground ? Math.min(doorH, h * 0.5) : doorH, 0.06]} p={[0, doorY + (ground ? Math.min(doorH, h * 0.5) : doorH) / 2, 0.01]} c="#6b4527" rough={0.7} radius={0.01} emissive={C.warmGlow} ei={glow * 2.4} />
      )}
    </group>
  );

  const openings: Opening[] = [
    { face: 0, u0: (doorX - doorW / 2 + W / 2 - cx) / W, u1: (doorX + doorW / 2 + W / 2 - cx) / W, y0: doorY - 0.05, y1: doorY + (door === "ground" ? Math.min(doorH, h * 0.5) : doorH) },
  ];
  if (west > 0) openings.push({ face: 2, u0: 1 - (doorX + doorW / 2 + W / 2 - cx) / W, u1: 1 - (doorX - doorW / 2 + W / 2 - cx) / W, y0: base - 0.05, y1: base + Math.min(doorH, h * 0.5) });

  return (
    <group>
      {/* shadharwan */}
      <Box s={[W + 0.26, base, d + 0.26]} p={[cx, base / 2, 0]} c={dress === "stone" ? "#b9a88d" : C.marble} rough={dress === "stone" ? 0.85 : 0.55} radius={0.04} />
      {dress === "kiswah" ? (
        <group>
          {/* core volume so the drape never shows a gap */}
          <mesh position={[cx, base + h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[W - 0.01, h - 0.01, d - 0.01]} />
            <meshStandardMaterial color="#151413" roughness={0.9} />
          </mesh>
          {[
            { g: drape.front, p: [cx, base + h / 2, d / 2] as V3, r: 0 },
            { g: drape.front, p: [cx, base + h / 2, -d / 2] as V3, r: Math.PI },
            { g: drape.side, p: [cx + W / 2, base + h / 2, 0] as V3, r: Math.PI / 2 },
            { g: drape.side, p: [cx - W / 2, base + h / 2, 0] as V3, r: -Math.PI / 2 },
          ].map((f, i) => (
            <mesh key={i} geometry={f.g} position={f.p} rotation={[0, f.r, 0]} castShadow receiveShadow>
              <meshPhysicalMaterial map={kis} bumpMap={kisBump} bumpScale={1.4} color="#ffffff" roughness={0.8} sheen={0.55} sheenRoughness={0.45} sheenColor={new THREE.Color("#57534d")} />
            </mesh>
          ))}
          <mesh position={[cx, base + h + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[W + 0.02, d + 0.02]} />
            <meshPhysicalMaterial map={kis} color="#d8d8d8" roughness={0.85} sheen={0.4} sheenColor={new THREE.Color("#4a4844")} />
          </mesh>
          <mesh position={[cx, bandY, 0]} castShadow>
            <RoundedBoxGeo args={[W + 0.06, h * 0.075, d + 0.06]} radius={0.012} segments={2} />
            <meshPhysicalMaterial map={band} bumpMap={band} bumpScale={1.5} color="#ffffff" metalness={0.85} roughness={0.22} clearcoat={0.6} clearcoatRoughness={0.15} emissive="#3a2a08" emissiveIntensity={0.3} />
          </mesh>
          {/* hem tied down to brass rings on the shadharwan */}
          {Array.from({ length: Math.round((W + d) * 2 / 0.42) }, (_, i) => {
            const per = (W + d) * 2, u = (i + 0.5) * (per / Math.round(per / 0.42));
            let x = 0, z = 0;
            if (u < W) { x = cx - W / 2 + u; z = d / 2 + 0.06; } else if (u < W + d) { x = cx + W / 2 + 0.06; z = d / 2 - (u - W); } else if (u < 2 * W + d) { x = cx + W / 2 - (u - W - d); z = -d / 2 - 0.06; } else { x = cx - W / 2 - 0.06; z = -d / 2 + (u - 2 * W - d); }
            return <Box key={i} s={[0.05, 0.05, 0.05]} p={[x, base + 0.035, z]} c={C.brass} metal={1} rough={0.3} radius={0.015} cast={false} />;
          })}
        </group>
      ) : dress === "stone" ? (
        <group position={[0, base, 0]}>
          <StoneWalls w={W} d={d} h={h} x0={cx} rise={rise} faceRise={faceRise} palette={palette} openings={openings} seed={seed} tint={tint} />
          {roof && rise > 0.98 && (!faceRise || Math.min(...faceRise) > 0.98) ? (
            <group position={[cx, h + 0.04, 0]}>
              {Array.from({ length: Math.round(W / 0.2) }, (_, i) => (
                <Box key={i} s={[0.18, 0.07, d + 0.1]} p={[-W / 2 + 0.1 + i * 0.2, 0, 0]} c={i % 2 ? "#8b5a33" : "#7a4c2b"} rough={0.72} radius={0.01} />
              ))}
            </group>
          ) : null}
          {walled > 0.001 && west > 0
            ? Array.from({ length: 12 }, (_, i) => {
                const row = Math.floor(i / 3), k = i % 3;
                const show = i < Math.round(walled * 12);
                return show ? <Box key={i} s={[0.17, 0.15, 0.24]} p={[doorX - 0.18 + k * 0.18 + (row % 2 ? 0.04 : -0.02), 0.08 + row * 0.16, -d / 2 + 0.14]} c="#c2a986" rough={0.9} radius={0.015} /> : null;
              })
            : null}
          {belts > 0.001
            ? [0.35, 0.7].map((k, i) => (
                <mesh key={i} position={[cx, h * k, 0]} scale={[1, clamp01(belts * 2 - i * 0.6), 1]}>
                  <RoundedBoxGeo args={[W + 0.05, 0.09, d + 0.05]} radius={0.01} segments={2} />
                  <meshPhysicalMaterial color="#d0a74e" metalness={1} roughness={0.25} />
                </mesh>
              ))
            : null}
        </group>
      ) : (
        <GlassBody W={W} d={d} h={h} cx={cx} base={base} />
      )}
      {doorMesh(d / 2 + (dress === "kiswah" ? 0.02 : 0), 0, door === "ground", doorGlow)}
      {west > 0 && walled < 0.999 ? doorMesh(-d / 2 - 0.02, Math.PI, true, doorGlow) : null}
      {/* Hajar Aswad corner (east) */}
      {hajar !== "none" ? (
        <group position={[cx - W / 2 - 0.02, hajarY, d / 2 + 0.02]} rotation={[0, -Math.PI / 4, 0]}>
          {hajar !== "stone" ? (
            <mesh castShadow>
              <torusGeometry args={[0.1, 0.03, 16, 40]} />
              <meshPhysicalMaterial color={C.silver} metalness={1} roughness={0.22} />
            </mesh>
          ) : null}
          {hajar !== "empty" ? (
            <mesh scale={[0.085, 0.085, 0.04]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshPhysicalMaterial color="#1a1614" roughness={0.25} clearcoat={0.6} />
            </mesh>
          ) : (
            <mesh scale={[0.075, 0.075, 0.01]} position={[0, 0, -0.01]}>
              <circleGeometry args={[1, 24]} />
              <meshBasicMaterial color="#0c0a09" />
            </mesh>
          )}
        </group>
      ) : null}
      {hijr && ext < 0.01 ? <HijrWall p={[w / 2 + 0.05, 0, 0]} /> : null}
    </group>
  );
};

/** Glass study model: translucent shell with gold edges (for the interior chapter). */
const GlassBody: React.FC<{ W: number; d: number; h: number; cx: number; base: number }> = ({ W, d, h, cx, base }) => {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(W, h, d)), [W, h, d]);
  return (
    <group position={[cx, base + h / 2, 0]}>
      <mesh renderOrder={2}>
        <boxGeometry args={[W, h, d]} />
        <meshPhysicalMaterial color="#e9f3f4" roughness={0.08} metalness={0} transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={C.gold} />
      </lineSegments>
    </group>
  );
};
