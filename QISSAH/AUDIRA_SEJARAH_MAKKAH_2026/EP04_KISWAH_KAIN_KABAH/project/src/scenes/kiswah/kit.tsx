// Shared SULAMFORGE pieces for the Kiswah film: textures, materials, embroidered tags, the dignified
// Ka'bah maquette with interchangeable cloth shells, felt camels, the mahmal, laid stitches.
import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "../../kits/sulamforge/core/motion.ts";
import { type Seg, unitCyl } from "./KiswahCover.tsx";
import { clamp, pop } from "./tl.ts";
import { useFormat } from "../../core/film/format.ts";

export type V3 = [number, number, number];
export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const PAL = {
  bg: "#0A0708",
  gold: "#E3A93E",
  goldDeep: "#B98A33",
  cotton: "#E2D29A",
  chalk: "#EDE7DA",
  linen: "#D9CBB0",
  linenDark: "#8C7C66",
  beech: "#C9A274",
  cream: "#F6EAD6",
  sand: "#C79A62",
  sandDeep: "#9C7346",
  stone: "#6E6862",
  white: "#EEE6D6",
  red: "#A8242E",
  green: "#2E6E47",
  black: "#151314",
  nile: "#2F6FA8",
  sea: "#1F4E7A",
  brass: "#C9A04A",
  felt: "#7A5232",
  wool: "#1B1918",
};

// ---------- canvas helpers ----------
const mk = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
export const toTex = (c: HTMLCanvasElement, rep: [number, number] = [1, 1], srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 8;
  return t;
};

/** Plain-weave cloth of any colour (also its own bump map). */
export const weaveTex = (base: string, seed = 3, rep: [number, number] = [8, 8], cell = 8) => {
  const S = 256;
  const c = mk(S, S);
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  const r = mulberry32(seed);
  for (let y = 0; y < S; y += cell)
    for (let x = 0; x < S; x += cell) {
      const over = ((x + y) / cell) % 2 === 0;
      const a = 0.08 + r() * 0.1;
      g.fillStyle = over ? `rgba(255,250,240,${a})` : `rgba(0,0,0,${a + 0.08})`;
      if (over) g.fillRect(x + 1, y + 2, cell - 2, cell - 4);
      else g.fillRect(x + 2, y + 1, cell - 4, cell - 2);
    }
  for (let i = 0; i < 24; i++) {
    g.fillStyle = `rgba(0,0,0,${0.06 + r() * 0.08})`;
    g.fillRect(0, r() * S, S, 1 + r() * 2);
  }
  return { map: toTex(c, rep), bump: toTex(c, rep, false) };
};

/** Felt: soft mottled fibres. */
export const feltTex = (base: string, seed = 5, rep: [number, number] = [4, 4]) => {
  const S = 256;
  const c = mk(S, S);
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  const r = mulberry32(seed);
  for (let i = 0; i < 2600; i++) {
    const x = r() * S;
    const y = r() * S;
    const a = r() * Math.PI;
    const l = 2 + r() * 6;
    g.strokeStyle = r() > 0.5 ? `rgba(255,240,220,${0.05 + r() * 0.08})` : `rgba(0,0,0,${0.06 + r() * 0.1})`;
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return { map: toTex(c, rep), bump: toTex(c, rep, false) };
};

/** Khasaf: coarse plaited palm-leaf matting. */
export const palmTex = () => {
  const S = 256;
  const c = mk(S, S);
  const g = c.getContext("2d")!;
  g.fillStyle = "#8A6A3E";
  g.fillRect(0, 0, S, S);
  const r = mulberry32(11);
  const w = 32;
  for (let y = 0; y < S; y += w)
    for (let x = 0; x < S; x += w) {
      const over = ((x + y) / w) % 2 === 0;
      const v = 150 + r() * 40;
      g.fillStyle = `rgb(${v},${v * 0.78},${v * 0.48})`;
      if (over) g.fillRect(x + 2, y + 6, w - 4, w - 12);
      else g.fillRect(x + 6, y + 2, w - 12, w - 4);
      g.strokeStyle = "rgba(60,40,20,0.5)";
      g.lineWidth = 1;
      for (let k = 4; k < w - 4; k += 5) {
        g.beginPath();
        if (over) {
          g.moveTo(x + 2, y + k);
          g.lineTo(x + w - 2, y + k);
        } else {
          g.moveTo(x + k, y + 2);
          g.lineTo(x + k, y + w - 2);
        }
        g.stroke();
      }
    }
  return { map: toTex(c, [3, 3]), bump: toTex(c, [3, 3], false) };
};

/** Striped Yemeni cloth (mula' / wasa'il): woven bands. */
export const stripeTex = (cols = ["#7A2A1E", "#C99A4A", "#2F3F6E", "#E5D6B4", "#7A2A1E", "#3B2418"]) => {
  const S = 256;
  const c = mk(S, S);
  const g = c.getContext("2d")!;
  let y = 0;
  let i = 0;
  const r = mulberry32(9);
  while (y < S) {
    const h = 8 + Math.floor(r() * 22);
    g.fillStyle = cols[i % cols.length];
    g.fillRect(0, y, S, h);
    y += h;
    i++;
  }
  for (let yy = 0; yy < S; yy += 2) {
    g.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.06})`;
    g.fillRect(0, yy, S, 1);
  }
  return { map: toTex(c, [1, 2]), bump: toTex(c, [1, 2], false) };
};

/** Brocade (dibaj): colour silk with a tone-on-tone lozenge lattice. */
export const brocadeTex = (base: string, line: string) => {
  const S = 256;
  const c = mk(S, S);
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  g.strokeStyle = line;
  g.lineWidth = 3;
  for (let i = -2; i <= 4; i++) {
    g.beginPath();
    g.moveTo(i * 64, 0);
    g.lineTo(i * 64 + S, S);
    g.moveTo(i * 64, S);
    g.lineTo(i * 64 + S, 0);
    g.stroke();
  }
  for (let yy = 0; yy < S; yy += 2) {
    g.fillStyle = "rgba(0,0,0,0.08)";
    g.fillRect(0, yy, S, 1);
  }
  return { map: toTex(c, [2, 2]), bump: toTex(c, [2, 2], false) };
};

/** Black kiswah shell: black silk with a gold geometric hizam band two-thirds up (no letters). */
export const kiswahTex = () => {
  const W = 1024;
  const H = 512;
  const c = mk(W, H);
  const g = c.getContext("2d")!;
  g.fillStyle = "#0F0D0F";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(70,62,70,0.6)";
  g.lineWidth = 3;
  for (let i = -8; i <= 16; i++) {
    g.beginPath();
    g.moveTo(i * 64, 0);
    g.lineTo(i * 64 + H, H);
    g.moveTo(i * 64, H);
    g.lineTo(i * 64 + H, 0);
    g.stroke();
  }
  // panel seams
  for (let x = 0; x < W; x += W / 8) {
    g.fillStyle = "rgba(0,0,0,0.9)";
    g.fillRect(x, 0, 3, H);
  }
  // hizam
  const y0 = H * 0.2;
  const bh = H * 0.11;
  g.fillStyle = "#0B0A0B";
  g.fillRect(0, y0, W, bh);
  g.fillStyle = PAL.gold;
  g.fillRect(0, y0, W, 5);
  g.fillRect(0, y0 + bh - 5, W, 5);
  g.strokeStyle = PAL.gold;
  g.lineWidth = 4;
  for (let x = 32; x < W; x += 64) {
    const cy = y0 + bh / 2;
    const s = bh * 0.3;
    g.strokeRect(x - s, cy - s, s * 2, s * 2);
    g.beginPath();
    g.moveTo(x, cy - s * 1.41);
    g.lineTo(x + s * 1.41, cy);
    g.lineTo(x, cy + s * 1.41);
    g.lineTo(x - s * 1.41, cy);
    g.closePath();
    g.stroke();
  }
  const map = toTex(c, [1, 1]);
  map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
  return map;
};

// ---------- materials ----------
export const silkMat = (color: string, tex?: { map: THREE.Texture; bump?: THREE.Texture }) =>
  new THREE.MeshPhysicalMaterial({
    color: tex ? "#ffffff" : color,
    map: tex?.map ?? null,
    bumpMap: tex?.bump ?? null,
    bumpScale: 0.6,
    roughness: 0.5,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.4),
    transparent: true,
  });
export const feltMat = (color: string, seed = 5) => {
  const t = feltTex(color, seed);
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 0.8, roughness: 1 });
};
export const goldMat = () => new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.18 });
export const silverMat = () => new THREE.MeshStandardMaterial({ color: "#D6D8DC", metalness: 1, roughness: 0.2 });
export const cottonMat = () => new THREE.MeshStandardMaterial({ color: PAL.cotton, roughness: 0.95 });

// ---------- laid stitches (InstancedMesh whose count grows over time) ----------
/** Segments sorted by `key`; shows those whose key < `upto`. */
export const Laid: React.FC<{ segs: (Seg & { key: number })[]; material: THREE.Material; upto: number; cast?: boolean }> = ({ segs, material, upto, cast = true }) => {
  const sorted = useMemo(() => [...segs].sort((a, b) => a.key - b.key), [segs]);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(unitCyl, material, Math.max(1, sorted.length));
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0);
    sorted.forEach((sg, i) => {
      const d = sg.b.clone().sub(sg.a);
      const len = d.length();
      q.setFromUnitVectors(Y, d.normalize());
      s.set(sg.r, len, sg.r);
      mat.compose(sg.a.clone().add(sg.b).multiplyScalar(0.5), q, s);
      m.setMatrixAt(i, mat);
    });
    m.castShadow = cast;
    m.receiveShadow = true;
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    return m;
  }, [sorted, material, cast]);
  let n = 0;
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid].key < upto) lo = mid + 1;
    else hi = mid;
  }
  n = lo;
  mesh.count = n;
  return <primitive object={mesh} visible={n > 0} />;
};

// ---------- embroidered tag (linen patch, stitched border, text from the script) ----------
const tagCache = new Map<string, THREE.Texture>();
const tagTexture = (lines: string[], accent: boolean, wpx: number, hpx: number) => {
  const key = lines.join("|") + accent + wpx + "x" + hpx;
  const hit = tagCache.get(key);
  if (hit) return hit;
  const c = mk(wpx, hpx);
  const g = c.getContext("2d")!;
  g.fillStyle = accent ? "#1A1012" : "#EDE3CF";
  g.fillRect(0, 0, wpx, hpx);
  const r = mulberry32(lines.join("").length + 3);
  for (let y = 0; y < hpx; y += 4) {
    g.fillStyle = accent ? `rgba(255,255,255,${0.02 + r() * 0.03})` : `rgba(0,0,0,${0.03 + r() * 0.04})`;
    g.fillRect(0, y, wpx, 1);
  }
  g.strokeStyle = accent ? PAL.gold : "#8A5A2B";
  g.lineWidth = 6;
  g.setLineDash([18, 10]);
  g.strokeRect(14, 14, wpx - 28, hpx - 28);
  g.setLineDash([]);
  const n = lines.length;
  const fs = Math.min(hpx * (n === 1 ? 0.42 : 0.3), 96);
  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((ln, i) => {
    let size = i === 0 ? fs : fs * 0.72;
    g.font = `${i === 0 ? "bold " : ""}${size}px Georgia, serif`;
    while (g.measureText(ln).width > wpx - 70 && size > 12) {
      size -= 2;
      g.font = `${i === 0 ? "bold " : ""}${size}px Georgia, serif`;
    }
    g.fillStyle = accent ? (i === 0 ? PAL.gold : PAL.cream) : i === 0 ? "#2A1A12" : "#6A4A2E";
    const y = hpx / 2 + (i - (n - 1) / 2) * fs * 1.05;
    g.fillText(ln, wpx / 2, y);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  tagCache.set(key, t);
  return t;
};

export const Tag: React.FC<{
  pos: V3;
  lines: string[];
  t: number;
  at: number;
  until?: number;
  w?: number;
  h?: number;
  tilt?: number;
  rotY?: number;
  accent?: boolean;
  /** stand the label up on a brass pin, set back from the front edge (keeps it clear of captions) */
  stand?: boolean;
  /** optional position used only in 9:16, for tags the narrow frame would cut or hide */
  shortPos?: V3;
}> = ({ pos: posIn, shortPos, lines, t, at, until = Infinity, w: wIn = 1.1, h, tilt: tiltIn, rotY = 0, accent = false, stand = true }) => {
  // labels are kept small: 72% of the authored width; in 9:16 they shrink a little more
  // (the shorts camera also pulls back, see Film.tsx) so the narrow frame never cuts them
  const short = useFormat().kind === "short";
  const pos = short && shortPos ? shortPos : posIn;
  const w = wIn * (stand ? 0.72 : 1) * (short ? 0.88 : 1);
  const hh = h ?? w * (lines.length > 1 ? 0.42 : 0.3);
  const tex = useMemo(() => tagTexture(lines, accent, 768, Math.round((768 * hh) / w)), [lines, accent, hh, w]);
  const k = pop(t, at, 0.45) * (1 - clamp((t - until) / 0.4));
  if (k <= 0.001) return null;
  const tilt = tiltIn ?? (stand ? -0.38 : -0.95);
  const lift = stand ? hh * 0.5 + 0.12 : 0;
  const p: V3 = stand ? [pos[0], pos[1] + lift, pos[2] - 0.7] : pos;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      {stand && (
        <mesh position={[0, -lift / 2, 0]} scale={[1, k, 1]}>
          <cylinderGeometry args={[0.008, 0.012, lift, 8]} />
          <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.3} />
        </mesh>
      )}
      <group rotation={[tilt, 0, 0]} scale={[k, k, 1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, hh, 0.012]} />
          <meshStandardMaterial attach="material-0" color={accent ? "#1A1012" : "#E6DCC6"} roughness={0.9} />
          <meshStandardMaterial attach="material-1" color={accent ? "#1A1012" : "#E6DCC6"} roughness={0.9} />
          <meshStandardMaterial attach="material-2" color={accent ? "#1A1012" : "#E6DCC6"} roughness={0.9} />
          <meshStandardMaterial attach="material-3" color={accent ? "#1A1012" : "#E6DCC6"} roughness={0.9} />
          <meshStandardMaterial attach="material-4" map={tex} roughness={0.85} />
          <meshStandardMaterial attach="material-5" color={accent ? "#1A1012" : "#E6DCC6"} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- the Ka'bah maquette: plain dignified cube, cloth shells on top ----------
export const KAABA = { w: 1.0, d: 0.86, h: 1.1 };
export type Shell = { mat: THREE.Material; cover: number; lift?: number; inflate?: number; bottom?: number };

export const Kaaba: React.FC<{ pos: V3; rotY?: number; shells: Shell[]; door?: number; corner?: boolean; stone?: string }> = ({
  pos,
  rotY = 0,
  shells,
  door = 0,
  corner = true,
  stone = PAL.stone,
}) => {
  const { w, d, h } = KAABA;
  const stoneT = useMemo(() => feltTex(stone, 21, [2, 2]), [stone]);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* plinth */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.1, 0.04, d + 0.1]} />
        <meshStandardMaterial color="#8E8780" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.04 + h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={stoneT.map} bumpMap={stoneT.bump} bumpScale={1} roughness={0.95} />
      </mesh>
      {shells.map((s, i) => {
        const inf = s.inflate ?? 0.012 * (i + 1);
        const bottom = s.bottom ?? 0;
        const full = h - bottom;
        const hh = Math.max(0.001, full * clamp(s.cover));
        const lift = s.lift ?? 0;
        if (s.cover <= 0.001) return null;
        return (
          <mesh key={i} position={[0, 0.04 + h - hh / 2 + lift * 1.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[w + inf * 2, hh + 0.004, d + inf * 2]} />
            <primitive object={s.mat} attach="material" />
          </mesh>
        );
      })}
      {/* door: raised gold panel on the front face */}
      {door > 0 && (
        <mesh position={[-w * 0.18, 0.04 + h * 0.48, d / 2 + 0.03 + 0.012 * shells.length]} castShadow>
          <boxGeometry args={[0.2 * door, 0.36, 0.012]} />
          <meshStandardMaterial color={PAL.gold} metalness={1} roughness={0.22} />
        </mesh>
      )}
      {/* Hajar Aswad corner: small silver-framed dark mark, low on the corner */}
      {corner && (
        <mesh position={[-w / 2 - 0.02, 0.04 + h * 0.14, d / 2 + 0.02]} rotation={[0, -Math.PI / 4, 0]}>
          <torusGeometry args={[0.04, 0.012, 10, 24]} />
          <meshStandardMaterial color="#D6D8DC" metalness={1} roughness={0.25} />
        </mesh>
      )}
    </group>
  );
};

// ---------- felt camel (faceless, no rider) and the mahmal ----------
export const Camel: React.FC<{ pos: V3; rotY?: number; t: number; walk?: number; scale?: number; mahmal?: boolean; color?: string }> = ({
  pos,
  rotY = 0,
  t,
  walk = 0,
  scale = 1,
  mahmal = false,
  color = PAL.sand,
}) => {
  const m = useMemo(() => feltMat(color, 31), [color]);
  const ph = t * 6;
  const legs: [number, number][] = [
    [0.13, 0.06],
    [0.13, -0.06],
    [-0.13, 0.06],
    [-0.13, -0.06],
  ];
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <mesh position={[0, 0.34 + Math.sin(ph * 2) * 0.006 * walk, 0]} scale={[0.22, 0.1, 0.1]} castShadow>
        <sphereGeometry args={[1, 18, 12]} />
        <primitive object={m} attach="material" />
      </mesh>
      <mesh position={[0.0, 0.43, 0]} scale={[0.09, 0.08, 0.07]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <primitive object={m} attach="material" />
      </mesh>
      <mesh position={[0.25, 0.44, 0]} rotation={[0, 0, -0.75]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.22, 10]} />
        <primitive object={m} attach="material" />
      </mesh>
      <mesh position={[0.33, 0.53, 0]} scale={[0.07, 0.035, 0.035]} castShadow>
        <sphereGeometry args={[1, 12, 8]} />
        <primitive object={m} attach="material" />
      </mesh>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z]} rotation={[0, 0, Math.sin(ph + i * Math.PI * 0.5 + (i > 1 ? Math.PI : 0)) * 0.35 * walk]} castShadow>
          <cylinderGeometry args={[0.018, 0.014, 0.3, 8]} />
          <primitive object={m} attach="material" />
        </mesh>
      ))}
      {mahmal && <Mahmal pos={[0, 0.5, 0]} scale={0.55} />}
    </group>
  );
};

export const Mahmal: React.FC<{ pos: V3; scale?: number; rotY?: number }> = ({ pos, scale = 1, rotY = 0 }) => {
  const cloth = useMemo(() => silkMat("#1F4A35", brocadeTex("#1F4A35", "rgba(226,176,74,0.65)")), []);
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <boxGeometry args={[0.24, 0.26, 0.24]} />
        <primitive object={cloth} attach="material" />
      </mesh>
      <mesh position={[0, 0.34, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.18, 0.18, 4]} />
        <primitive object={cloth} attach="material" />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <sphereGeometry args={[0.025, 12, 10]} />
        <meshStandardMaterial color={PAL.gold} metalness={1} roughness={0.2} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.125, 0.0, sz * 0.125]}>
            <cylinderGeometry args={[0.008, 0.003, 0.08, 6]} />
            <meshStandardMaterial color={PAL.gold} metalness={1} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.265, 0]}>
        <boxGeometry args={[0.255, 0.02, 0.255]} />
        <meshStandardMaterial color={PAL.gold} metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
};

// ---------- thread tube along points ----------
export const ThreadPath: React.FC<{ pts: V3[]; r?: number; material: THREE.Material; grow?: number }> = ({ pts, r = 0.006, material, grow = 1 }) => {
  const key = JSON.stringify(pts);
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3((JSON.parse(key) as V3[]).map((p) => v3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(24, pts.length * 24), r, 6, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  const total = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, Math.floor((total * clamp(grow)) / 6) * 6);
  if (grow <= 0.001) return null;
  return <mesh geometry={geo} material={material} castShadow />;
};

// ---------- a spool and a loose loop: set dressing that keeps wide frames full ----------
export const Spool: React.FC<{ pos: V3; color: string; rotY?: number; lying?: boolean }> = ({ pos, color, rotY = 0, lying = false }) => {
  const m = useMemo(() => silkMat(color, weaveTex(color, 7, [1, 6], 4)), [color]);
  return (
    <group position={pos} rotation={[lying ? Math.PI / 2 : 0, rotY, 0]}>
      <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 28]} />
        <primitive object={m} attach="material" />
      </mesh>
      {[0.015, 0.245].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 28]} />
          <meshStandardMaterial color={PAL.beech} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
};

/** Ref helper for imperative per-frame updates. */
export const useObj = <T,>(make: () => T) => {
  const r = useRef<T | null>(null);
  if (!r.current) r.current = make();
  return r.current;
};

export const LayoutNoop: React.FC = () => {
  useLayoutEffect(() => {}, []);
  return null;
};
