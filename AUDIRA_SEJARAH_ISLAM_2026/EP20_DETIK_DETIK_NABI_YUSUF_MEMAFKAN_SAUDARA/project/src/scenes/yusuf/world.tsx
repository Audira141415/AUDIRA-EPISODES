// EP17 shared diorama parts: palette, sky domes, filled ground (never an empty floor), the small
// fire with its single warm light, the copper pot, steam, crescent moon, oil lamp and canvas text.

import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, surfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite, type SpriteMap } from "./pixel.tsx";

export const U = {
  night: "#0A0F24",
  nightMid: "#1D2346",
  nightHor: "#3A2E4E",
  fire: "#FF9A3C",
  fireHot: "#FFD08A",
  gold: "#F0B93E",
  sand: "#6A5038",
  basalt: "#26221F",
  mud: "#8A6A4A",
  plaster: "#A88763",
  timber: "#4A2E1A",
  copper: "#B0643A",
  cream: "#EDE3CF",
  red: "#B8322A",
} as const;

export const grain = surfaceGrain(71, 256, 0.4, 5);
export const grainFine = surfaceGrain(72, 256, 0.3, 2);

/** Gradient sky dome (unfogged). */
export const Sky: React.FC<{ top: string; mid: string; hor: string; r?: number }> = ({ top, mid, hor, r = 60 }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(r, 48, 24);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const T = new THREE.Color(top).convertSRGBToLinear();
    const M = new THREE.Color(mid).convertSRGBToLinear();
    const H = new THREE.Color(hor).convertSRGBToLinear();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / r;
      if (y < 0.02) c.copy(H);
      else if (y < 0.18) c.copy(H).lerp(M, (y - 0.02) / 0.16);
      else c.copy(M).lerp(T, Math.min(1, (y - 0.18) / 0.5));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return g;
  }, [top, mid, hor, r]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
};

/** Ground disc with stone grain. */
export const Ground: React.FC<{ color: string; r?: number; map?: THREE.Texture; bump?: number }> = ({ color, r = 40, map, bump = 0.5 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <circleGeometry args={[r, 64]} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} map={map} bumpMap={map ?? grain} bumpScale={bump} />
  </mesh>
);

/** Seeded litter of rocks, pebbles and dry shrubs so no floor reads empty. */
export const Scatter: React.FC<{
  seed: number;
  n: number;
  x: [number, number];
  z: [number, number];
  rock: string;
  shrub?: string;
  keep?: (x: number, z: number) => boolean;
  scale?: number;
}> = ({ seed, n, x, z, rock, shrub = "#6E6A3A", keep, scale = 1 }) => {
  const items = useMemo(() => {
    const r = prng(seed);
    const out: { p: [number, number, number]; s: number; k: number; rot: number }[] = [];
    let guard = 0;
    while (out.length < n && guard++ < n * 6) {
      const px = x[0] + r() * (x[1] - x[0]);
      const pz = z[0] + r() * (z[1] - z[0]);
      if (keep && !keep(px, pz)) continue;
      const k = r();
      out.push({ p: [px, 0, pz], s: (0.03 + r() * r() * 0.12) * scale, k, rot: r() * 6.28 });
    }
    return out;
  }, [seed, n, x, z, keep, scale]);
  return (
    <group>
      {items.map((it, i) =>
        it.k < 0.72 ? (
          <mesh key={i} position={[it.p[0], it.s * 0.35, it.p[2]]} rotation={[it.rot, it.rot * 0.7, 0]} scale={[it.s, it.s * 0.7, it.s * 0.9]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial {...POLISH.stone} color={rock} bumpMap={grainFine} bumpScale={0.6} flatShading />
          </mesh>
        ) : (
          <group key={i} position={it.p} rotation={[0, it.rot, 0]}>
            {[0, 1, 2, 3].map((j) => (
              <mesh key={j} position={[0, it.s * 0.9, 0]} rotation={[0.5 * Math.cos(j * 1.6), j * 1.57, 0.5 * Math.sin(j * 1.6)]} castShadow>
                <coneGeometry args={[it.s * 0.35, it.s * 2.0, 4]} />
                <meshStandardMaterial color={shrub} roughness={0.95} />
              </mesh>
            ))}
          </group>
        ),
      )}
    </group>
  );
};

/** Small cooking fire: logs, flickering flame cones and the one warm point light of the shot. */
export const Fire: React.FC<{ f: number; pos?: [number, number, number]; power?: number; scale?: number }> = ({ f, pos = [0, 0, 0], power = 1, scale = 1 }) => {
  const fl = 0.85 + 0.1 * Math.sin(f * 0.41) + 0.06 * Math.sin(f * 1.13 + 1.7);
  return (
    <group position={pos} scale={scale}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.03, 0]} rotation={[0, (i * Math.PI) / 2 + 0.4, Math.PI / 2 - 0.25]} castShadow>
          <cylinderGeometry args={[0.022, 0.026, 0.3, 8]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#3A2414" />
        </mesh>
      ))}
      {/* ember bed */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 20]} />
        <meshBasicMaterial color="#FF6A1E" toneMapped={false} />
      </mesh>
      {power > 0.05 &&
        [0, 1, 2].map((i) => {
          const h = (0.16 + 0.05 * Math.sin(f * 0.6 + i * 2.1)) * power;
          return (
            <mesh key={i} position={[(i - 1) * 0.035, 0.03 + h / 2, (i % 2) * 0.02]} rotation={[0, 0, 0.12 * Math.sin(f * 0.37 + i)]}>
              <coneGeometry args={[0.045 - i * 0.006, h, 8]} />
              <meshBasicMaterial color={i === 1 ? U.fireHot : U.fire} toneMapped={false} transparent opacity={0.92} />
            </mesh>
          );
        })}
      <pointLight position={[0, 0.25, 0]} color="#FF9A4A" intensity={3.2 * fl * (0.35 + 0.65 * power)} distance={6} decay={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
    </group>
  );
};

/** Copper pot on three stones. fill: 0 = clear water, 1 = porridge. */
export const Pot: React.FC<{ fill?: number; pos?: [number, number, number] }> = ({ fill = 0, pos = [0, 0, 0] }) => {
  const geo = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.1, 0.005], [0.15, 0.04], [0.17, 0.1], [0.165, 0.16], [0.15, 0.2], [0.155, 0.215], [0.165, 0.22],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  const water = new THREE.Color("#7FA8C8").lerp(new THREE.Color("#E4CFA0"), fill);
  return (
    <group position={pos}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2.09) * 0.16, 0.04, Math.cos(i * 2.09) * 0.16]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.06, 0]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#3A3532" bumpMap={grainFine} bumpScale={0.5} flatShading />
        </mesh>
      ))}
      <mesh geometry={geo} position={[0, 0.09, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={U.copper} metalness={0.85} roughness={0.38} side={THREE.DoubleSide} bumpMap={grainFine} bumpScale={0.15} />
      </mesh>
      <mesh position={[0, 0.09 + 0.195, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshPhysicalMaterial color={water} roughness={fill > 0.5 ? 0.7 : 0.08} metalness={0} clearcoat={1 - fill} transmission={0} />
      </mesh>
    </group>
  );
};

/** Rising steam puffs (deterministic in f). */
export const Steam: React.FC<{ f: number; pos: [number, number, number]; amount?: number; color?: string }> = ({ f, pos, amount = 1, color = "#E8E2DA" }) => (
  <group position={pos}>
    {Array.from({ length: 7 }, (_, i) => {
      const life = ((f / 60) * 0.45 + i / 7) % 1;
      const s = 0.06 + life * 0.16;
      return (
        <mesh key={i} position={[0.04 * Math.sin(i * 2.3 + life * 4), life * 0.55, 0.03 * Math.cos(i * 1.7)]} scale={s * 0.5}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color={color} transparent opacity={amount * 0.09 * Math.sin(life * Math.PI)} depthWrite={false} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

/** Crescent moon (canvas texture on a billboard plane), unfogged. */
export const Moon: React.FC<{ pos: [number, number, number]; size?: number }> = ({ pos, size = 2.2 }) => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 40, 128, 128, 128);
    gr.addColorStop(0, "rgba(240,230,200,0.25)");
    gr.addColorStop(1, "rgba(240,230,200,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#F6EBC8";
    g.beginPath();
    g.arc(128, 128, 60, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "destination-out";
    g.beginPath();
    g.arc(154, 112, 56, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <sprite position={pos} scale={[size, size, size]}>
      <spriteMaterial map={tex ?? undefined} transparent fog={false} toneMapped={false} depthWrite={false} />
    </sprite>
  );
};

/** Clay oil lamp with flame + warm point light. */
export const OilLamp: React.FC<{ f: number; pos: [number, number, number]; power?: number }> = ({ f, pos, power = 1 }) => {
  const fl = 0.9 + 0.08 * Math.sin(f * 0.5) + 0.05 * Math.sin(f * 1.31);
  return (
    <group position={pos}>
      <mesh position={[0, 0.03, 0]} scale={[1.4, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.06, 20, 12]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#8A4E2C" />
      </mesh>
      <mesh position={[0.07, 0.08, 0]}>
        <coneGeometry args={[0.018, 0.07 * power * fl, 8]} />
        <meshBasicMaterial color={U.fireHot} toneMapped={false} />
      </mesh>
      <pointLight position={[0.07, 0.16, 0]} color="#FFA24A" intensity={2.6 * power * fl} distance={5} decay={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
    </group>
  );
};

/** Text painted on a canvas, for stamps and boards inside the world. */
export function textTexture(text: string, opts: { w?: number; h?: number; color?: string; bg?: string; font?: string; border?: string } = {}) {
  if (typeof document === "undefined") return null;
  const { w = 512, h = 256, color = "#3A2414", bg = "rgba(0,0,0,0)", font = "bold 120px 'MM Anton', Impact, sans-serif", border } = opts;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border) {
    g.strokeStyle = border;
    g.lineWidth = 14;
    g.strokeRect(18, 18, w - 36, h - 36);
  }
  g.fillStyle = color;
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A walking sprite: alternates two maps every `step` s and travels from a to b over [t0, t1]. */
export const Walker: React.FC<{
  t: number;
  a: [number, number, number];
  b: [number, number, number];
  t0: number;
  t1: number;
  maps: [SpriteMap, SpriteMap];
  stand: SpriteMap;
  px?: number;
  rotY?: number;
}> = ({ t, a, b, t0, t1, maps, stand, px = 0.035, rotY = 0 }) => {
  const k = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  const moving = t > t0 && t < t1;
  const p: [number, number, number] = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const ph = Math.floor(t / 0.22) % 2;
  const map = moving ? maps[ph] : stand;
  return <PixelSprite map={map} px={px} position={p} rotationY={rotY} bob={moving ? 0.006 * ph : 0} />;
};

/** Pale backer outline behind a sprite so the hero separates from a dark set (memory fix). */
export const Backer: React.FC<{ pos: [number, number, number]; w: number; h: number; rotY?: number; opacity?: number }> = ({ pos, w, h, rotY = 0, opacity = 0.18 }) => (
  <mesh position={[pos[0], pos[1] + h / 2, pos[2] - 0.03]} rotation={[0, rotY, 0]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial color="#FFE2B0" transparent opacity={opacity} depthWrite={false} toneMapped={false} />
  </mesh>
);

/** Spot light whose target object is mounted in the scene (so its matrix updates every frame). */
export const Spot: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  angle?: number;
  penumbra?: number;
  intensity?: number;
  distance?: number;
  decay?: number;
  color?: string;
  castShadow?: boolean;
  "shadow-mapSize"?: [number, number];
  "shadow-bias"?: number;
}> = ({ position, target, angle = 0.6, penumbra = 0.5, intensity = 10, distance = 10, decay = 1.4, color = "#FFFFFF", castShadow = false, ...rest }) => {
  const obj = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={obj} position={target} />
      <spotLight
        position={position}
        target={obj}
        angle={angle}
        penumbra={penumbra}
        intensity={intensity}
        distance={distance}
        decay={decay}
        color={color}
        castShadow={castShadow}
        shadow-mapSize={rest["shadow-mapSize"] ?? [1024, 1024]}
        shadow-bias={rest["shadow-bias"] ?? -0.0005}
      />
    </>
  );
};
