// Shared props for EP68 Bank Keju (FOODFORGE). GLB models from public/models/polyfork, procedural PBR detail maps from ./materials.ts.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { FX_LAYER } from "../core/render/Post.tsx";
import { clamp01, easeOutBack, mulberry32 } from "../kits/feltcraft/core/motion";
import { real, rockGeometry, type Kind } from "./materials.ts";
import type { V3 } from "./timeline.ts";

export const C = {
  cheese: "#D9A441",
  caramel: "#A8692A",
  paste: "#F1D78A",
  woodHoney: "#B9814E",
  woodDark: "#6E4426",
  steel: "#3A3F44",
  brick: "#B5523B",
  cream: "#F3E6CC",
  cypress: "#3F5E3A",
  copper: "#B8733D",
  concrete: "#B7AA98",
  cobble: "#9C8E7E",
  grass: "#86AE5E",
  soil: "#6B4A33",
  night: "#3E4470",
  glow: "#FFB25A",
  steam: "#FBF6EE",
  ink: "#3B2414",
};

/** Realistic surface picked from the colour (wood / stone / snow / paint). */
export const mat = (color: string, repeat = 2, kind?: Kind) => real(color, repeat, kind);

// Simple shapes (replace the FELTCRAFT fur shells): smooth mesh with a realistic material.
export const SPHERE = new THREE.SphereGeometry(1, 32, 20);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 20);
export const CONE = new THREE.ConeGeometry(1, 1, 20);
export const ROCK = [rockGeometry(3), rockGeometry(7), rockGeometry(11)];
export const Shape: React.FC<{ geometry: THREE.BufferGeometry; color: string; position?: V3; scale?: number | V3; kind?: Kind; repeat?: number }> = ({ geometry, color, position, scale, kind, repeat = 1 }) => (
  <mesh geometry={geometry} position={position} scale={scale} material={mat(color, repeat, kind)} castShadow receiveShadow />
);

/** Stepped pop-in (stop-motion feel): 0 before `at`, overshoots to 1 over `dur`. */
export const pop = (t: number, at: number, dur = 0.45) => {
  const x = clamp01((Math.floor(t * 12) / 12 - at) / dur);
  return x <= 0 ? 0 : easeOutBack(x, 1.6);
};

// ---------- ground / water ----------
export const Ground: React.FC<{ color: string; size?: number; y?: number; hole?: number }> = ({ color, size = 40, y = 0, hole }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow material={mat(color, 18)}>
    {hole ? <ringGeometry args={[hole, size, 48, 1]} /> : <circleGeometry args={[size, 64]} />}
  </mesh>
);

// ---------- sauna cabin ----------
/** Soft radial-gradient sprite texture (shared by steam/smoke and haze puffs). */
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
/** Steam / smoke: camera-facing soft sprites (no hard-edged spheres). */
export const Smoke: React.FC<{ t: number; origin: V3; color?: string; n?: number; rise?: number; spread?: number; seed?: number; size?: number; opacity?: number }> = ({ t, origin, color = "#EDE7DF", n = 5, rise = 1.4, spread = 0.25, seed = 1, size = 0.16, opacity = 0.5 }) => {
  const st = Math.floor(t * 12) / 12;
  const puffs = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n * 2 }, () => ({ ph: rnd(), dx: (rnd() - 0.5) * spread, dz: (rnd() - 0.5) * spread, rot: rnd() * 6.28 }));
  }, [n, spread, seed]);
  return (
    <>
      {puffs.map((p, i) => {
        const life = (st * 0.32 + p.ph) % 1;
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
/** Layered atmospheric haze: soft vertical gradient cards behind the action, tinted to the sky. */
let HAZE: THREE.CanvasTexture | null = null;
const hazeTexture = () => {
  if (HAZE) return HAZE;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createLinearGradient(0, 0, 0, 128);
  r.addColorStop(0, "rgba(255,255,255,0)");
  r.addColorStop(0.55, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0.9)");
  g.fillStyle = r;
  g.fillRect(0, 0, 4, 128);
  HAZE = new THREE.CanvasTexture(c);
  HAZE.colorSpace = THREE.SRGBColorSpace;
  return HAZE;
};
export const Haze: React.FC<{ color: string; x?: number; layers?: [number, number][]; width?: number; height?: number }> = ({ color, x = 0, layers = [[-7.5, 0.22], [-10, 0.38], [-13, 0.55]], width = 44, height = 4.5 }) => (
  <>
    {layers.map(([z, o], i) => (
      <mesh key={i} layers={FX_LAYER} position={[x, height / 2 - 0.3, z]} renderOrder={-1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={hazeTexture()} color={color} transparent opacity={o} depthWrite={false} fog={false} />
      </mesh>
    ))}
  </>
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
  // wood grain streaks
  const rnd = mulberry32(text.length * 31 + w);
  for (let i = 0; i < 90; i++) {
    const y = rnd() * h;
    g.strokeStyle = `rgba(90,52,24,${0.12 + rnd() * 0.18})`;
    g.lineWidth = 1 + rnd() * 2;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(w * 0.3, y + (rnd() - 0.5) * 8, w * 0.7, y + (rnd() - 0.5) * 8, w, y + (rnd() - 0.5) * 6);
    g.stroke();
  }
  // routed border groove
  g.strokeStyle = border;
  g.lineWidth = Math.max(4, w / 110);
  g.strokeRect(w * 0.05, h * 0.08, w * 0.9, h * 0.84);
  g.fillStyle = fg;
  g.font = font;
  // shrink the font until the text fits inside the stitched border
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
export const SignBoard: React.FC<{ text: string; position: V3; rotation?: number; w?: number; sub?: string; swing?: number }> = ({ text, position, rotation = 0, w = 1.3, swing = 0 }) => {
  const tex = textTexture(text, { w: 768, h: 256, font: "bold 140px Georgia, serif" });
  const h = w / 3;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * w * 0.42, 0.45, -0.03]} material={mat(C.woodDark, 1, "wood")} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.9, 10]} />
        </mesh>
      ))}
      <group position={[0, 0.78, 0]} rotation={[swing, 0, 0]}>
        <mesh castShadow material={mat(C.woodDark, 1, "wood")}>
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

