// Shared props for EP59 (WORLDFORGE realistic miniature). GLB models from public/models/polyfork, procedural PBR detail maps from ./materials.ts.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { FX_LAYER } from "../core/render/Post.tsx";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { ToyPerson } from "../core/polish/Person.tsx";
import { clamp01, easeOutBack, mulberry32 } from "../kits/feltcraft/core/motion";
import { real, rockGeometry, type Kind } from "./materials.ts";
import type { V3 } from "./timeline.ts";

export const C = {
  snow: "#F3EEE6",
  snowShade: "#E2DCD2",
  pine: "#3F6B4A",
  woodHoney: "#B9814E",
  woodDark: "#6E4426",
  lake: "#6C9DB8",
  lakeDusk: "#C98E7A",
  glow: "#FFB25A",
  steam: "#FBF6EE",
  finBlue: "#1F4FA0",
  stone: "#8C8580",
  soot: "#4A3A34",
  grass: "#86AE5E",
  ink: "#4A2E1E",
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

export const Lake: React.FC<{ color: string; r?: number; position?: V3; scaleZ?: number }> = ({ color, r = 3, position = [0, 0.012, 0], scaleZ = 0.6 }) => (
  <group position={position} scale={[1, 1, scaleZ]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[r, 64]} />
      <meshPhysicalMaterial color={color} roughness={0.08} metalness={0.05} clearcoat={1} clearcoatRoughness={0.06} />
    </mesh>
    {/* snow bank rim where the ice meets the shore */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={mat(C.snow, 4, "snow")}>
      <torusGeometry args={[r, 0.09, 10, 96]} />
    </mesh>
  </group>
);

/** Snow drifts scattered around a ring. */
export const SnowMounds: React.FC<{ seed?: number; n?: number; r0?: number; r1?: number; color?: string }> = ({ seed = 3, n = 10, r0 = 3.4, r1 = 7, color = C.snow }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n }, () => {
      const a = rnd() * Math.PI * 2;
      const r = r0 + rnd() * (r1 - r0);
      const s = 0.5 + rnd() * 0.9;
      return { p: [Math.cos(a) * r, -0.05, Math.sin(a) * r] as V3, s };
    });
  }, [seed, n, r0, r1]);
  return (
    <>
      {items.map((m, i) => (
        <Shape key={i} geometry={SPHERE} color={color} kind="snow" repeat={2} position={m.p} scale={[m.s * 1.3, m.s * 0.45, m.s]} />
      ))}
    </>
  );
};

// ---------- trees ----------
export const Pine: React.FC<{ position: V3; size?: number; tint?: string; snowCap?: boolean }> = ({ position, size = 2.2, tint = C.pine, snowCap = true }) => (
  <group position={position}>
    <AssetModel id="tall-pine-tree-ab4108" assetType="prop" size={size} ground tint={tint} roughness={0.9} />
    {snowCap ? <Shape geometry={SPHERE} color={C.snow} kind="snow" position={[0, size * 0.93, 0]} scale={[size * 0.08, size * 0.05, size * 0.08]} /> : null}
  </group>
);

export const PineRing: React.FC<{ seed?: number; n?: number; r0?: number; r1?: number; arc?: [number, number]; tint?: string; snowCap?: boolean }> = ({ seed = 7, n = 14, r0 = 5, r1 = 9, arc = [Math.PI * 1.05, Math.PI * 1.95], tint, snowCap }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n }, (_, i) => {
      const a = arc[0] + ((i + rnd() * 0.6) / n) * (arc[1] - arc[0]);
      const r = r0 + rnd() * (r1 - r0);
      return { p: [Math.cos(a) * r, 0, Math.sin(a) * r] as V3, s: 1.8 + rnd() * 1.6 };
    });
  }, [seed, n, r0, r1, arc]);
  return (
    <>
      {items.map((m, i) => (
        <Pine key={i} position={m.p} size={m.s} tint={tint} snowCap={snowCap} />
      ))}
    </>
  );
};

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

/** GLB log cabin (wood grain) + stone chimney + warm window light. `glow` 0..1 dims the light. */
export const SaunaCabin: React.FC<{ t: number; position?: V3; rotation?: number; size?: number; s?: number; glow?: number; chimney?: boolean; tint?: string; smoke?: boolean; seed?: number }> = ({ t, position = [0, 0, 0], rotation = 0, size = 2.2, s = 1, glow = 1, chimney = true, tint = C.woodHoney, smoke = true, seed = 1 }) => {
  if (s <= 0.001) return null;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={s}>
      <AssetModel grain="wood" id="log-cabin-4fac3b" assetType="building" size={size} ground tint={tint} />
      {chimney ? (
        <>
          <Shape geometry={CYL} color="#8A8580" kind="stone" position={[size * 0.22, size * 0.62, -size * 0.1]} scale={[size * 0.07, size * 0.3, size * 0.07]} />
          {smoke ? <Smoke t={t} origin={[size * 0.22, size * 0.8, -size * 0.1]} seed={seed} size={size * 0.07} rise={size * 0.6} /> : null}
        </>
      ) : null}
      {glow > 0 ? <pointLight position={[0, size * 0.22, size * 0.62]} intensity={3.2 * glow} distance={size * 2} decay={1.6} color={C.glow} /> : null}
    </group>
  );
};

// ---------- people ----------
/** Cotton towel wrapped around the torso (modest for all platforms). */
const Towel: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.09, 0]} scale={[0.135, 0.2, 0.115]} castShadow>
      <meshPhysicalMaterial color={color} roughness={0.95} sheen={0.8} sheenRoughness={0.6} sheenColor="#ffffff" />
      <cylinderGeometry args={[1, 1.06, 1, 20]} />
    </mesh>
    <mesh position={[0, 0.2, 0]} scale={[0.14, 0.012, 0.12]} material={mat("#FFFFFF", 1, "paint")}>
      <cylinderGeometry args={[1, 1, 1, 20]} />
    </mesh>
  </group>
);

export const TowelPerson: React.FC<{ f: number; seed: number; pose?: "sit" | "stand" | "walk" | "wave"; position: V3; heading?: number; scale?: number; towel?: string }> = ({ f, seed, pose = "stand", position, heading = 0, scale = 1, towel = "#F7F1E6" }) => (
  <ToyPerson f={Math.floor(f / 5) * 5} seed={seed} pose={pose} outfit="trunks" expression="happy" position={position} heading={heading} scale={scale} torso={<Towel color={towel} />} />
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

/** Finnish flag: white cloth with a blue Nordic cross (drawn, not a logo). */
const flagTexture = () => {
  const key = "flag-fi";
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 360;
  cv.height = 220;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#FAF7F0";
  g.fillRect(0, 0, 360, 220);
  g.fillStyle = C.finBlue;
  g.fillRect(100, 0, 60, 220);
  g.fillRect(0, 80, 360, 60);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
};

export const FinnFlag: React.FC<{ t: number; position: V3; h?: number }> = ({ t, position, h = 3.2 }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(1.1, 0.67, 16, 4), []);
  const st = Math.floor(t * 12) / 12;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = (i % 17) / 16;
    pos.setZ(i, Math.sin(x * 5 - st * 4) * 0.08 * x);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <group position={position}>
      <AssetModel id="flagpole-7b7806" assetType="prop" size={h} ground tint="#D8D2C8" metalness={0.6} roughness={0.4} />
      <mesh geometry={geo} position={[0.58, h * 0.83, 0]} castShadow>
        <meshPhysicalMaterial map={flagTexture()} roughness={0.9} sheen={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ---------- kiuas (sauna stove) ----------
export const Kiuas: React.FC<{ t: number; position: V3; ember?: number; seed?: number }> = ({ t, position, ember = 1, seed = 5 }) => {
  const stones = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: 16 }, (_, i) => {
      const a = rnd() * Math.PI * 2;
      const r = rnd() * 0.2;
      return { p: [Math.cos(a) * r, 0.62 + (i % 3) * 0.06 + rnd() * 0.04, Math.sin(a) * r] as V3, s: 0.06 + rnd() * 0.04, c: ["#8C8580", "#6F6964", "#A39B93", "#5E5752"][i % 4] };
    });
  }, [seed]);
  const pulse = 0.8 + 0.2 * Math.sin(Math.floor(t * 12) * 0.9);
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow material={mat("#2E2C2B", 1, "metal")}>
        <cylinderGeometry args={[0.28, 0.3, 0.56, 8]} />
      </mesh>
      {/* stone basket rim */}
      <mesh position={[0, 0.58, 0]} material={mat("#1E1C1B", 1, "metal")}>
        <torusGeometry args={[0.28, 0.025, 8, 32]} />
      </mesh>
      {/* ember door */}
      <mesh position={[0, 0.2, 0.285]}>
        <planeGeometry args={[0.2, 0.14]} />
        <meshStandardMaterial color="#FF8A3A" emissive="#FF6A1A" emissiveIntensity={2.2 * ember * pulse} />
      </mesh>
      {stones.map((s, i) => (
        <Shape key={i} geometry={ROCK[i % 3]} color={s.c} kind="stone" position={s.p} scale={s.s} />
      ))}
      <pointLight position={[0, 0.3, 0.6]} intensity={2.4 * ember * pulse} distance={3.5} decay={1.6} color="#FF9A4A" />
    </group>
  );
};

/** Parliament House (granite): stepped base, 14 columns, entablature and flat roof. */
export const Parliament: React.FC<{ position: V3; scale?: number }> = ({ position, scale = 1 }) => {
  const granite = "#CFC6B8";
  return (
    <group position={position} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.06 + i * 0.12, 0.55 - i * 0.12]} receiveShadow castShadow material={mat(granite, 2)}>
          <boxGeometry args={[4.2 - i * 0.12, 0.12, 1.4 - i * 0.24]} />
        </mesh>
      ))}
      <mesh position={[0, 1.2, -0.35]} castShadow receiveShadow material={mat("#BDB3A3", 3)}>
        <boxGeometry args={[3.9, 2.0, 1.3]} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-1.82 + i * 0.28, 1.02, 0.42]} castShadow material={mat("#E2DACB", 1)}>
          <cylinderGeometry args={[0.07, 0.08, 1.6, 14]} />
        </mesh>
      ))}
      <mesh position={[0, 1.95, 0.18]} castShadow material={mat(granite, 2)}>
        <boxGeometry args={[4.0, 0.3, 0.9]} />
      </mesh>
      <mesh position={[0, 2.28, -0.3]} castShadow material={mat("#A99F90", 2)}>
        <boxGeometry args={[3.2, 0.36, 1.1]} />
      </mesh>
    </group>
  );
};
