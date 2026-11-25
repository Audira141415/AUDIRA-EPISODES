// AE-058 BRUTALFORGE building blocks: flat neon toon surfaces with a thick black inverted-hull
// outline (the style's "tepi hitam tebal"), seeded canvas textures for facades, nets and labels.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";

export const PAL = {
  yellow: "#FFE600",
  cyan: "#00F0FF",
  green: "#25F482",
  pink: "#FF3864",
  ink: "#0B0C10",
  white: "#FFFFFF",
  concrete: "#E9E4D6",
  concreteDark: "#B9B2A2",
  asphalt: "#2B2E36",
  orange: "#FF7A1A",
} as const;

export type V3 = [number, number, number];

// Three-step toon ramp with nearest filtering: crisp flat light/shadow bands, no soft gradient.
let ramp: THREE.DataTexture | null = null;
const toonRamp = () => {
  if (ramp) return ramp;
  const d = new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
  ramp = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
};

const toonCache = new Map<string, THREE.MeshToonMaterial>();
export const toon = (color: string) => {
  const hit = toonCache.get(color);
  if (hit) return hit;
  const m = new THREE.MeshToonMaterial({ color, gradientMap: toonRamp() });
  toonCache.set(color, m);
  return m;
};
export const toonMap = (map: THREE.Texture, color = "#ffffff") => new THREE.MeshToonMaterial({ color, map, gradientMap: toonRamp() });

export const INK_MAT = new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide });

/** Rounded block with a black inverted-hull outline of thickness `t`. */
export const Ink: React.FC<{
  size: V3;
  position?: V3;
  rotation?: V3;
  color?: string;
  material?: THREE.Material | THREE.Material[];
  t?: number;
  r?: number;
  shadow?: boolean;
}> = ({ size, position = [0, 0, 0], rotation = [0, 0, 0], color = PAL.white, material, t = 0.07, r, shadow = true }) => {
  const rad = r ?? Math.min(size[0], size[1], size[2]) * 0.1;
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow={shadow} receiveShadow material={material ?? toon(color)}>
        <RoundedBoxGeo args={size} radius={rad} segments={2} />
      </mesh>
      {t > 0 ? (
        <mesh material={INK_MAT}>
          <RoundedBoxGeo args={[size[0] + 2 * t, size[1] + 2 * t, size[2] + 2 * t]} radius={rad + t} segments={2} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Cylinder (pipe, column, rebar) between two points, with optional outline. */
export const Rod: React.FC<{ a: V3; b: V3; r: number; color?: string; t?: number; sides?: number }> = ({ a, b, r, color = PAL.ink, t = 0, sides = 8 }) => {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat, len };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);
  return (
    <group position={pos} quaternion={quat}>
      <mesh castShadow material={toon(color)}>
        <cylinderGeometry args={[r, r, len, sides]} />
      </mesh>
      {t > 0 ? (
        <mesh material={INK_MAT}>
          <cylinderGeometry args={[r + t, r + t, len + t, sides]} />
        </mesh>
      ) : null}
    </group>
  );
};

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
const toTex = (c: HTMLCanvasElement, repeat?: [number, number]) => {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(...repeat);
  }
  return tex;
};

/** Facade: flat base colour, windows with thick black frames, optional dark/lit panes. */
export function facadeTex(base: string, cols: number, rows: number, seed: number, pane: string = PAL.ink, lit: string = PAL.cyan, pxPerCell = 128) {
  const W = cols * pxPerCell, H = rows * pxPerCell;
  const c = canvas(W, H);
  const g = c.getContext("2d")!;
  const rnd = prng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);
  // floor bands
  g.fillStyle = PAL.ink;
  for (let r = 0; r <= rows; r++) g.fillRect(0, r * pxPerCell - 5, W, 10);
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const x = k * pxPerCell + pxPerCell * 0.18, y = r * pxPerCell + pxPerCell * 0.22;
      const w = pxPerCell * 0.64, h = pxPerCell * 0.5;
      g.fillStyle = PAL.ink;
      g.fillRect(x - 9, y - 9, w + 18, h + 18);
      g.fillStyle = rnd() < 0.3 ? lit : pane;
      g.fillRect(x, y, w, h);
      // hard diagonal glint
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.beginPath();
      g.moveTo(x + w * 0.12, y + h);
      g.lineTo(x + w * 0.32, y + h);
      g.lineTo(x + w * 0.62, y);
      g.lineTo(x + w * 0.42, y);
      g.fill();
    }
  }
  return toTex(c);
}

/** Safety net fabric: knitted diamond mesh with open holes over an uneven, blotchy see-through
 * scrim (seeded), so the concrete behind shows faintly. */
export function netTex(repeat: [number, number], seed = 9) {
  const S = 256;
  const c = canvas(S, S);
  const g = c.getContext("2d")!;
  const rnd = prng(seed);
  g.clearRect(0, 0, S, S);
  // uneven scrim: soft blotches of different density
  for (let i = 0; i < 40; i++) {
    const x = rnd() * S, y = rnd() * S, r = 30 + rnd() * 70;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.04 + rnd() * 0.2;
    grd.addColorStop(0, `rgba(30,200,110,${a})`);
    grd.addColorStop(1, "rgba(30,200,110,0)");
    g.fillStyle = grd;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { g.save(); g.translate(ox, oy); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
  }
  g.fillStyle = "rgba(37,244,130,0.07)";
  g.fillRect(0, 0, S, S);
  // knitted diamond twine
  g.lineCap = "round";
  const step = 32;
  for (const [col, w] of [["rgba(20,150,80,0.95)", 7], ["rgba(60,255,150,0.95)", 3.5]] as const) {
    g.strokeStyle = col;
    g.lineWidth = w;
    for (let k = -S; k <= S * 2; k += step) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k + S, S); g.stroke();
      g.beginPath(); g.moveTo(k, S); g.lineTo(k + S, 0); g.stroke();
    }
  }
  // knots
  g.fillStyle = "rgba(11,12,16,0.75)";
  for (let y = 0; y < S; y += step) for (let x = 0; x < S; x += step) {
    g.beginPath(); g.arc(x + ((y / step) % 2 ? step / 2 : 0), y, 3, 0, Math.PI * 2); g.fill();
  }
  return toTex(c, repeat);
}

/** Diagonal hazard hatch (exclusion zone). */
export function hatchTex(a: string, b: string, repeat: [number, number]) {
  const S = 128;
  const c = canvas(S, S);
  const g = c.getContext("2d")!;
  g.fillStyle = a;
  g.fillRect(0, 0, S, S);
  g.fillStyle = b;
  for (let i = -2; i < 4; i++) {
    g.beginPath();
    g.moveTo(i * 64, 0);
    g.lineTo(i * 64 + 32, 0);
    g.lineTo(i * 64 + 32 + S, S);
    g.lineTo(i * 64 + S, S);
    g.fill();
  }
  return toTex(c, repeat);
}

/** Flat label board: coloured plate, black border, bold text (Anton must be loaded first). */
export function labelTex(lines: { text: string; color: string; size: number }[], bg: string, w = 1024, h = 256, border = 18) {
  const c = canvas(w, h);
  const g = c.getContext("2d")!;
  g.fillStyle = PAL.ink;
  g.fillRect(0, 0, w, h);
  g.fillStyle = bg;
  g.fillRect(border, border, w - border * 2, h - border * 2);
  const total = lines.reduce((s, l) => s + l.size * 1.05, 0);
  let y = (h - total) / 2;
  g.textAlign = "center";
  g.textBaseline = "top";
  for (const l of lines) {
    g.font = `${l.size}px Anton, "Arial Black", sans-serif`;
    g.fillStyle = l.color;
    g.fillText(l.text, w / 2, y + l.size * 0.04);
    y += l.size * 1.05;
  }
  return toTex(c);
}
