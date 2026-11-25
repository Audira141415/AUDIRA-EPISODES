// EP77 Katakombe Paris — set pieces. Bones are an artistic relief (no gore): femur ends as knobs, skulls as
// rounded ivory forms with two dark sockets, everything in one soft bone tone.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { CanvasTexture, Color, InstancedMesh, MeshStandardMaterial, Object3D, RepeatWrapping, SRGBColorSpace } from "three";
import { stone } from "../kits/chronicle/props.tsx";
import { grainMaps, paperFace } from "../kits/paperworld/material/paper.ts";
import { keepPaper } from "./paper.tsx";

export type V3 = [number, number, number];
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lin = (s: number, a: number, b: number) => clamp01((s - a) / (b - a));
export const ease = (x: number) => x * x * (3 - 2 * x);
export const hsh = (n: number) => {
  const x = Math.sin(n * 91.3458 + 47.123) * 43758.5453;
  return x - Math.floor(x);
};

const tex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void, rep: [number, number] = [1, 1]) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  paint(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...rep);
  t.anisotropy = 8;
  return t;
};

// ------------------------------------------------------------------ materials
let _lime: MeshStandardMaterial | null = null;
/** Limestone as stacked cardstock strata (PAPERWORLD): pale cut edge on top of each sheet, soft shadow under it. */
export const limestone = () => {
  if (_lime) return _lime;
  // cream, ochre, sage and blue-grey sheets with torn wavy edges: reads as layered paper rock, not planks
  const tones = ["#efe3cc", "#e8cf95", "#c9d6bf", "#e2d2b4", "#b9c4d4", "#d9c3a0", "#f3ead9"];
  const map = tex(512, 512, (g) => {
    const edges: number[][] = [];
    let y = 0, i = 0;
    while (y < 560) {
      const ph = hsh(i * 3) * 6.28, amp = 4 + hsh(i * 5) * 9, fq = 1 + Math.floor(hsh(i * 11) * 3);
      edges.push(Array.from({ length: 65 }, (_, k) => y + amp * Math.sin((k / 64) * 6.283 * fq + ph) + (hsh(i * 97 + k) - 0.5) * 3));
      y += 30 + hsh(i) * 46; i++;
    }
    for (let e = 0; e < edges.length - 1; e++) {
      const top = edges[e], bot = edges[e + 1];
      g.fillStyle = tones[Math.floor(hsh(e * 7 + 1) * tones.length)];
      g.beginPath();
      top.forEach((v, k) => (k ? g.lineTo((k / 64) * 512, v) : g.moveTo(0, v)));
      for (let k = 64; k >= 0; k--) g.lineTo((k / 64) * 512, bot[k] + 1);
      g.closePath(); g.fill();
      // drop shadow of the sheet above, then its pale cut edge
      g.strokeStyle = "rgba(70,45,25,0.28)"; g.lineWidth = 6;
      g.beginPath(); top.forEach((v, k) => (k ? g.lineTo((k / 64) * 512, v + 3) : g.moveTo(0, v + 3))); g.stroke();
      g.strokeStyle = "rgba(255,250,238,0.85)"; g.lineWidth = 2.5;
      g.beginPath(); top.forEach((v, k) => (k ? g.lineTo((k / 64) * 512, v) : g.moveTo(0, v))); g.stroke();
    }
  }, [2, 2]);
  _lime = keepPaper(new MeshStandardMaterial({ map, bumpMap: grainMaps().bump, bumpScale: 0.9, roughness: 0.93 }));
  return _lime;
};
let _cob: MeshStandardMaterial | null = null;
/** Paper cobbles: cut ovals of warm grey card on a darker board. */
export const cobble = () => {
  if (_cob) return _cob;
  const map = tex(256, 256, (g) => {
    g.fillStyle = "#5a4a40"; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const v = 0.85 + hsh(x * 13 + y * 7) * 0.2;
      g.fillStyle = `rgb(${Math.round(176 * v)},${Math.round(160 * v)},${Math.round(146 * v)})`;
      g.beginPath();
      g.ellipse(x * 32 + 16 + (y % 2) * 8, y * 32 + 16, 13, 12, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,248,235,0.35)";
      g.beginPath();
      g.ellipse(x * 32 + 14 + (y % 2) * 8, y * 32 + 13, 9, 6, 0, 0, Math.PI * 2);
      g.fill();
    }
  }, [12, 12]);
  _cob = keepPaper(new MeshStandardMaterial({ map, bumpMap: grainMaps().bump, bumpScale: 0.8, roughness: 0.93 }));
  return _cob;
};
export const soilMat = new MeshStandardMaterial({ color: "#3b2a1e", roughness: 1 });
export const darkMat = new MeshStandardMaterial({ color: "#07060a", roughness: 1 });
/** Bone: ivory cardstock (PAPERWORLD) — bones read as cut paper, not as plastic or bread. */
export const boneMat = keepPaper(paperFace("ivoryLight", { relief: 1.3 }));
const socketMat = new MeshStandardMaterial({ color: "#1a120c", roughness: 1 });
export const clothMat = new MeshStandardMaterial({ color: "#23222b", roughness: 0.55, metalness: 0.05 });
export const windowMat = new MeshStandardMaterial({ color: "#ffcf7a", emissive: "#ffb24a", emissiveIntensity: 2.2, roughness: 0.6 });

// ------------------------------------------------------------------ simple block helper
export const Block: React.FC<{ a: V3; b: V3; mat: MeshStandardMaterial; sil?: { id: number; color: string | null; gain?: number }; cast?: boolean }> = ({ a, b, mat, sil, cast = true }) => (
  <mesh
    position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]}
    material={mat}
    castShadow={cast}
    receiveShadow
    userData={sil ? { sil } : undefined}
  >
    <boxGeometry args={[Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])]} />
  </mesh>
);

// ------------------------------------------------------------------ tunnel (runs along −z)
/** Limestone corridor: floor, two walls, a barrel vault. `z0` near end, `z1` far end. */
export const Tunnel: React.FC<{ w?: number; h?: number; z0?: number; z1?: number; endWall?: boolean }> = ({ w = 2.6, h = 2.3, z0 = 6, z1 = -16, endWall = true }) => {
  const L = z0 - z1;
  const zc = (z0 + z1) / 2;
  return (
    <group>
      <Block a={[-w / 2 - 0.4, -0.3, z1]} b={[w / 2 + 0.4, 0, z0]} mat={limestone()} />
      <Block a={[-w / 2 - 0.5, 0, z1]} b={[-w / 2, h, z0]} mat={stone()} />
      <Block a={[w / 2, 0, z1]} b={[w / 2 + 0.5, h, z0]} mat={stone()} />
      {/* barrel vault */}
      <mesh position={[0, h, zc]} rotation={[Math.PI / 2, 0, 0]} material={limestone()} receiveShadow>
        <cylinderGeometry args={[w / 2 + 0.02, w / 2 + 0.02, L, 24, 1, true, Math.PI / 2, Math.PI]} />
      </mesh>
      <Block a={[-w / 2 - 0.5, h, z1]} b={[w / 2 + 0.5, h + w / 2 + 0.6, z0]} mat={limestone()} cast={false} />
      {endWall && <Block a={[-w / 2, 0, z1 - 0.4]} b={[w / 2, h + w / 2, z1]} mat={stone()} />}
    </group>
  );
};

// ------------------------------------------------------------------ bone wall (instanced relief)
type Row = { kind: "femur" | "skull"; y: number };
const ROWS = (h: number): Row[] => {
  const rows: Row[] = [];
  let y = 0.05;
  const pattern = ["femur", "femur", "femur", "femur", "skull", "femur", "femur", "femur", "skull", "femur", "femur", "skull", "femur", "femur", "femur"] as const;
  for (const k of pattern) {
    if (y > h) break;
    rows.push({ kind: k, y });
    y += k === "skull" ? 0.2 : 0.085;
  }
  return rows;
};

/**
 * A wall of stacked bones, facing +z (or rotated), from x0 to x1. `progress` 0…1 builds it row by row from the
 * floor up (S6). Femur ends read as knobs; skull rows as ivory domes with two dark sockets.
 */
export const BoneWall: React.FC<{ x0: number; x1: number; z: number; h?: number; progress?: number; rotY?: number; pos?: V3; seed?: number }> = ({
  x0, x1, z, h = 1.6, progress = 1, rotY = 0, pos = [0, 0, 0], seed = 1,
}) => {
  const rows = useMemo(() => ROWS(h), [h]);
  const femurs = useMemo(() => {
    const out: { p: V3; r: number; row: number }[] = [];
    rows.forEach((r, ri) => {
      if (r.kind !== "femur") return;
      for (let x = x0, i = 0; x < x1; x += 0.07, i++) {
        const j = hsh(i * 3.1 + ri * 17 + seed);
        out.push({ p: [x + (j - 0.5) * 0.015, r.y + 0.035 + (hsh(i + ri) - 0.5) * 0.012, z + (j - 0.5) * 0.03], r: 0.03 + j * 0.008, row: ri });
      }
    });
    return out;
  }, [rows, x0, x1, z, seed]);
  const skulls = useMemo(() => {
    const out: { p: V3; r: number; row: number }[] = [];
    rows.forEach((r, ri) => {
      if (r.kind !== "skull") return;
      for (let x = x0 + 0.1, i = 0; x < x1 - 0.05; x += 0.2, i++) {
        const j = hsh(i * 5.7 + ri * 3 + seed);
        out.push({ p: [x, r.y + 0.09, z + 0.03], r: 0.078 + j * 0.01, row: ri });
      }
    });
    return out;
  }, [rows, x0, x1, z, seed]);
  const visRows = Math.floor(progress * rows.length + 1e-6);
  const partial = progress * rows.length - visRows;
  const fRef = useRef<InstancedMesh>(null);
  const sRef = useRef<InstancedMesh>(null);
  const eRef = useRef<InstancedMesh>(null);
  const d = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    const show = (row: number, x: number) => {
      if (row < visRows) return 1;
      if (row > visRows) return 0;
      // the row being laid: bones appear left to right
      return (x - x0) / (x1 - x0) < partial ? ease(clamp01(((partial - (x - x0) / (x1 - x0)) * 6))) : 0;
    };
    const fm = fRef.current;
    if (fm) {
      femurs.forEach((b, i) => {
        const s = show(b.row, b.p[0]);
        d.position.set(b.p[0], b.p[1], b.p[2] + (1 - s) * 0.25);
        d.rotation.set(Math.PI / 2, 0, 0);
        d.scale.set(b.r * s, 0.16 * s + 1e-4, b.r * 1.05 * s);
        d.updateMatrix();
        fm.setMatrixAt(i, d.matrix);
      });
      fm.instanceMatrix.needsUpdate = true;
    }
    const sm = sRef.current, em = eRef.current;
    if (sm && em) {
      skulls.forEach((b, i) => {
        const s = show(b.row, b.p[0]);
        d.rotation.set(0, 0, 0);
        d.position.set(b.p[0], b.p[1], b.p[2] + (1 - s) * 0.3);
        d.scale.set(b.r * 0.86 * s + 1e-4, b.r * 1.05 * s + 1e-4, b.r * 0.9 * s + 1e-4);
        d.updateMatrix();
        sm.setMatrixAt(i, d.matrix);
        for (const side of [-1, 1]) {
          d.position.set(b.p[0] + side * b.r * 0.35, b.p[1] + b.r * 0.1, b.p[2] + b.r * 0.72 + (1 - s) * 0.3);
          d.scale.set(b.r * 0.27 * s + 1e-4, b.r * 0.3 * s + 1e-4, b.r * 0.16 * s + 1e-4);
          d.updateMatrix();
          em.setMatrixAt(i * 3 + (side > 0 ? 1 : 0), d.matrix);
        }
        // nasal cavity: small dark slit under the sockets
        d.position.set(b.p[0], b.p[1] - b.r * 0.2, b.p[2] + b.r * 0.8 + (1 - s) * 0.3);
        d.scale.set(b.r * 0.1 * s + 1e-4, b.r * 0.17 * s + 1e-4, b.r * 0.1 * s + 1e-4);
        d.updateMatrix();
        em.setMatrixAt(i * 3 + 2, d.matrix);
      });
      sm.instanceMatrix.needsUpdate = true;
      em.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* packed earth behind the bones */}
      <Block a={[x0 - 0.05, 0, z - 0.35]} b={[x1 + 0.05, h + 0.1, z - 0.05]} mat={soilMat} cast={false} />
      <instancedMesh ref={fRef} args={[undefined, undefined, femurs.length]} material={boneMat} castShadow receiveShadow>
        <capsuleGeometry args={[1, 1, 4, 8]} />
      </instancedMesh>
      <instancedMesh ref={sRef} args={[undefined, undefined, skulls.length]} material={boneMat} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 12]} />
      </instancedMesh>
      <instancedMesh ref={eRef} args={[undefined, undefined, skulls.length * 3]} material={socketMat}>
        <sphereGeometry args={[1, 8, 6]} />
      </instancedMesh>
    </group>
  );
};

// ------------------------------------------------------------------ plaque (canvas text)
const plaqueCache = new Map<string, MeshStandardMaterial>();
export const plaqueMat = (lines: string[], o: { w?: number; h?: number; bg?: string; fg?: string; font?: string; glow?: number } = {}) => {
  const key = JSON.stringify([lines, o]);
  const hit = plaqueCache.get(key);
  if (hit) return hit;
  const W = o.w ?? 1024, H = o.h ?? 256;
  const map = tex(W, H, (g) => {
    g.fillStyle = o.bg ?? "#1b1612";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(232,214,180,0.55)";
    g.lineWidth = Math.max(4, H * 0.03);
    g.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
    g.fillStyle = o.fg ?? "#efe2c6";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const fs = Math.min((H * 0.62) / lines.length, (W * 1.6) / Math.max(...lines.map((l) => l.length)));
    g.font = `700 ${fs}px ${o.font ?? "Georgia, 'Times New Roman', serif"}`;
    lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.15));
  });
  const m = new MeshStandardMaterial({ map, roughness: 0.8, emissive: new Color("#ffffff"), emissiveMap: map, emissiveIntensity: o.glow ?? 0.18 });
  plaqueCache.set(key, m);
  return m;
};

export const Plaque: React.FC<{ lines: string[]; pos: V3; w: number; h: number; rotY?: number; glow?: number; bg?: string; fg?: string }> = ({ lines, pos, w, h, rotY = 0, glow, bg, fg }) => {
  const mat = plaqueMat(lines, { w: 1024, h: Math.round((1024 * h) / w), glow, bg, fg });
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh material={stone()} position={[0, 0, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.1]} />
      </mesh>
      <mesh material={mat} position={[0, 0, 0.0]}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ cross-section earth block
/**
 * The ground cut open at z = 0 (camera on +z): a street on top (y = 0), and a chamber dug into the rock
 * (x0…x1, y0…y1, back wall at zBack). Returns only the rock; the set adds what lives inside.
 */
export const CutEarth: React.FC<{ chamber: [number, number, number, number]; zBack?: number; w?: number; depth?: number; top?: MeshStandardMaterial }> = ({
  chamber, zBack = -4.5, w = 16, depth = 13, top,
}) => {
  const [x0, x1, y0, y1] = chamber;
  const D = -16;
  return (
    <group>
      <Block a={[-w, y1, D]} b={[w, -0.05, 0]} mat={limestone()} />
      <Block a={[-w, -0.05, D]} b={[w, 0, 0]} mat={top ?? cobble()} cast={false} />
      <Block a={[-w, -depth, D]} b={[x0, y1, 0]} mat={limestone()} />
      <Block a={[x1, -depth, D]} b={[w, y1, 0]} mat={limestone()} />
      <Block a={[x0, -depth, D]} b={[x1, y0, 0]} mat={limestone()} />
      <Block a={[x0, y0, D]} b={[x1, y1, zBack]} mat={limestone()} />
      {/* dark rim line on the cut face reads as the section edge */}
      <Block a={[-w, -0.12, 0]} b={[w, -0.05, 0.04]} mat={darkMat} cast={false} />
      {/* soft warm fill on the cut face so the section reads as strata, not a black void */}
      <pointLight position={[0, (y0 + y1) / 2 - 1.5, 7]} color="#c98a50" intensity={60} distance={30} decay={1.2} />
      <pointLight position={[-w * 0.6, y0 - 2.5, 5]} color="#d9a066" intensity={35} distance={22} decay={1.3} />
      <pointLight position={[w * 0.6, y0 - 2.5, 5]} color="#d9a066" intensity={35} distance={22} decay={1.3} />
    </group>
  );
};
