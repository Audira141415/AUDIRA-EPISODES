// Shared props for EP74 Darvaza (WORLDFORGE, 1 unit = 1 m). GLB models from public/models/polyfork/<type>/<id>.glb.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { FX_LAYER } from "../core/render/Post.tsx";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { ToyPerson, type PoseName } from "../core/polish/Person.tsx";
import { clamp01, easeOutBack, mulberry32 } from "../kits/feltcraft/core/motion";
import { gridGeometry } from "../kits/worldforge/terrainMesh.ts";
import { makeTerrainMaterial } from "../kits/worldforge/surface.ts";
import { inside } from "../kits/worldforge/heightfield.ts";
import { real, rockGeometry, type Kind } from "./materials.ts";
import { DEPTH, FLOOR_R, R, getDesert, getMap, height } from "./world.ts";
import type { V3 } from "./timeline.ts";

export const C = {
  sand: "#CDAE7E",
  sandDark: "#9A7A52",
  clay: "#B99A70",
  canvas: "#A89A78",
  steel: "#7C8C9C",
  rust: "#8A4B2A",
  fire: "#FF7A2A",
  glow: "#FFB25A",
  hud: "#5FE3FF",
  ink: "#2A170B",
  paper: "#EFE4CC",
  stamp: "#C0261C",
};

export const mat = (color: string, repeat = 2, kind?: Kind) => real(color, repeat, kind);
export const SPHERE = new THREE.SphereGeometry(1, 32, 20);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 20);
export const ROCK = [rockGeometry(3), rockGeometry(7), rockGeometry(11)];
export const Shape: React.FC<{ geometry: THREE.BufferGeometry; color: string; position?: V3; scale?: number | V3; rotation?: V3; kind?: Kind; repeat?: number }> = ({ geometry, color, position, scale, rotation, kind, repeat = 1 }) => (
  <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} material={mat(color, repeat, kind)} castShadow receiveShadow />
);

export const st = (t: number) => Math.floor(t * 12) / 12;
/** Stepped pop-in: 0 before `at`, overshoots to 1 over `dur`. */
export const pop = (t: number, at: number, dur = 0.45) => {
  const x = clamp01((st(t) - at) / dur);
  return x <= 0 ? 0 : easeOutBack(x, 1.6);
};
export const groundY = (x: number, z: number) => height(x, z);

// ---------- terrain ----------
let TERRAIN_MAT: THREE.MeshStandardMaterial | null = null;
const terrainMat = () => (TERRAIN_MAT ??= makeTerrainMaterial().material);

export const DesertTerrain: React.FC = React.memo(() => {
  const meshes = useMemo(() => {
    const t = getDesert();
    const near = new THREE.Mesh(gridGeometry(t.near), terrainMat());
    const ng = t.near.grid;
    const far = new THREE.Mesh(gridGeometry({ ...t.far, skip: (x0, z0, x1, z1) => inside(ng, x0, z0, 2) && inside(ng, x1, z1, 2) }), terrainMat());
    for (const m of [near, far]) m.receiveShadow = true;
    return [near, far];
  }, []);
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
});

export const MapTerrain: React.FC = React.memo(() => {
  const mesh = useMemo(() => {
    const mt = terrainMat().clone();
    mt.color = new THREE.Color("#8C7858");
    const m = new THREE.Mesh(gridGeometry(getMap()), mt);
    m.receiveShadow = true;
    return m;
  }, []);
  return <primitive object={mesh} />;
});

// ---------- fire: instanced cylindrical billboards, additive shader ----------
export type Flame = { p: V3; w: number; h: number; seed: number; rank: number };

const FIRE_VERT = /* glsl */ `
attribute vec3 aOffset; attribute vec3 aSize; attribute float aRank;
uniform float uTime; uniform float uFire;
varying vec2 vUv; varying float vSeed;
void main(){
  vUv = uv; vSeed = aSize.z;
  float alive = step(aRank, uFire);
  float fl = 0.78 + 0.22 * sin(uTime * 9.0 + aSize.z * 17.0) + 0.1 * sin(uTime * 23.0 + aSize.z * 5.0);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 c0 = (modelMatrix * vec4(aOffset, 1.0)).xyz;
  vec3 p = c0 + right * position.x * aSize.x * alive + vec3(0.0, 1.0, 0.0) * position.y * aSize.y * fl * alive;
  p += right * sin(uTime * 5.0 + aSize.z * 9.0) * 0.18 * aSize.x * position.y;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const FIRE_FRAG = /* glsl */ `
uniform float uTime; uniform float uGain;
varying vec2 vUv; varying float vSeed;
float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
void main(){
  float y = clamp(vUv.y, 0.0, 0.999); float x = (vUv.x - 0.5) * 2.0;
  float t = uTime * 3.0 + vSeed * 10.0;
  float wob = (vn(vec2(vUv.x * 3.0 + vSeed, y * 4.0 - t)) - 0.5) * 0.7 * y;
  float w = pow(1.0 - y, 0.75) * (0.5 + 0.5 * sin(min(y * 4.0, 1.5708)));
  float d = abs(x + wob) / max(w, 0.001);
  float body = (1.0 - smoothstep(0.25, 1.0, d)) * smoothstep(0.0, 0.06, y);
  float tongue = vn(vec2(vUv.x * 5.0 + vSeed * 3.0, y * 6.0 - t * 1.7));
  body *= smoothstep(0.2, 0.65, tongue + (1.0 - y) * 0.75);
  float core = (1.0 - smoothstep(0.0, 0.55, d)) * pow(1.0 - y, 1.5);
  vec3 col = mix(vec3(0.85, 0.12, 0.01), vec3(1.0, 0.5, 0.06), smoothstep(0.0, 0.7, body));
  col = mix(col, vec3(1.0, 0.88, 0.55), core);
  gl_FragColor = vec4(max(col * clamp(body, 0.0, 1.0) * uGain, vec3(0.0)), 1.0);
}`;

export const Fire: React.FC<{ flames: Flame[]; t: number; fire: number; gain?: number }> = ({ flames, t, fire, gain = 1.6 }) => {
  const { geo, material } = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1);
    base.translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute("position", base.getAttribute("position"));
    g.setAttribute("uv", base.getAttribute("uv"));
    const off = new Float32Array(flames.length * 3), size = new Float32Array(flames.length * 3), rank = new Float32Array(flames.length);
    flames.forEach((f, i) => {
      off.set(f.p, i * 3);
      size.set([f.w, f.h, f.seed], i * 3);
      rank[i] = f.rank;
    });
    g.setAttribute("aOffset", new THREE.InstancedBufferAttribute(off, 3));
    g.setAttribute("aSize", new THREE.InstancedBufferAttribute(size, 3));
    g.setAttribute("aRank", new THREE.InstancedBufferAttribute(rank, 1));
    g.instanceCount = flames.length;
    const m = new THREE.ShaderMaterial({
      vertexShader: FIRE_VERT,
      fragmentShader: FIRE_FRAG,
      uniforms: { uTime: { value: 0 }, uFire: { value: 1 }, uGain: { value: gain } },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      fog: false,
    });
    return { geo: g, material: m };
  }, [flames, gain]);
  material.uniforms.uTime.value = st(t * 2) / 2 + 0.0;
  material.uniforms.uFire.value = fire;
  return <mesh geometry={geo} material={material} frustumCulled={false} layers={FX_LAYER} renderOrder={3} />;
};

/** Flames on the crater floor, lower walls and the inner rim; `rank` grows from the torch impact (west). */
export const craterFlames = (avoid: (x: number, z: number) => boolean = () => false): Flame[] => {
  const rnd = mulberry32(74);
  const out: Flame[] = [];
  const add = (n: number, r0: number, r1: number, w: [number, number], h: [number, number]) => {
    let tries = 0;
    while (n > 0 && tries++ < n * 20) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(r0 * r0 + rnd() * (r1 * r1 - r0 * r0));
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (avoid(x, z)) continue;
      const dist = Math.hypot(x + 10, z - 8) / 55;
      out.push({ p: [x, height(x, z) - 0.15, z], w: w[0] + rnd() * (w[1] - w[0]), h: h[0] + rnd() * (h[1] - h[0]), seed: rnd() * 10, rank: Math.min(0.999, 0.55 * dist + 0.45 * rnd()) });
      n--;
    }
  };
  add(230, 0, FLOOR_R - 0.5, [1.2, 2.8], [2, 5.5]);
  add(170, FLOOR_R, FLOOR_R + 7, [0.8, 1.7], [1.2, 3.2]);
  add(110, R * 0.82, R * 0.99, [0.5, 1.1], [0.7, 1.9]);
  return out;
};

/** Soft radial sprite texture. */
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

/** Crater fire: flames + floor glow + the lights that make the walls glow. */
export const CraterFire: React.FC<{ t: number; fire: number; flames: Flame[]; light?: number }> = ({ t, fire, flames, light = 1 }) => {
  if (fire <= 0.001) return null;
  const pulse = 0.9 + 0.1 * Math.sin(st(t) * 7.3);
  const L = fire * light * pulse;
  return (
    <group>
      <Fire flames={flames} t={t} fire={fire} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -DEPTH + 1.2, 0]} layers={FX_LAYER} renderOrder={2}>
        <circleGeometry args={[FLOOR_R + 6, 48]} />
        <meshBasicMaterial map={softTexture()} color="#FF5A12" transparent opacity={0.85 * fire} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = i * 1.5708 + 0.4;
        return <pointLight key={i} position={[Math.cos(a) * 12, -24, Math.sin(a) * 12]} intensity={900 * L} decay={2} color="#FF7426" />;
      })}
      <pointLight position={[0, -16, 0]} intensity={3200 * L} decay={2} color="#FF8A3A" />
      <pointLight position={[0, -2, 0]} intensity={1200 * L} decay={2} color="#FF9A4A" />
    </group>
  );
};

/** Smoke / dust: camera-facing soft sprites, faded in/out over `from`..`to` so no sprite pops. */
export const Smoke: React.FC<{ t: number; origin: V3; color?: string; n?: number; rise?: number; spread?: number; seed?: number; size?: number; opacity?: number; from?: number; to?: number; additive?: boolean }> = ({ t, origin, color = "#EDE7DF", n = 5, rise = 1.4, spread = 0.25, seed = 1, size = 0.16, opacity = 0.5, from = -1e9, to = 1e9, additive }) => {
  const s0 = st(t);
  const puffs = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n * 2 }, () => ({ ph: rnd(), dx: (rnd() - 0.5) * spread, dz: (rnd() - 0.5) * spread, rot: rnd() * 6.28 }));
  }, [n, spread, seed]);
  const win = clamp01((s0 - from) / 0.5) * clamp01((to - s0) / 0.5);
  if (win <= 0) return null;
  return (
    <>
      {puffs.map((p, i) => {
        const life = (s0 * 0.32 + p.ph) % 1;
        const s = size * 2.6 * (0.7 + life * 2.4);
        const a = win * opacity * Math.sin(Math.PI * Math.min(1, life * 1.1)) * (1 - life * 0.5);
        if (a <= 0.01) return null;
        return (
          <Billboard key={i} position={[origin[0] + p.dx * (1 + life * 2), origin[1] + life * rise, origin[2] + p.dz * (1 + life * 2)]}>
            <mesh layers={FX_LAYER} scale={[s, s, s]} rotation={[0, 0, p.rot + life * 0.6]} renderOrder={2}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={softTexture()} color={color} transparent opacity={a} depthWrite={false} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} />
            </mesh>
          </Billboard>
        );
      })}
    </>
  );
};

// ---------- text textures ----------
const texCache = new Map<string, THREE.CanvasTexture>();
export const textTexture = (text: string, opts: { w?: number; h?: number; bg?: string; fg?: string; font?: string; border?: string; grain?: boolean } = {}) => {
  const { w = 512, h = 256, bg = "#C99A62", fg = C.ink, font = "bold 150px Georgia, serif", border = "#6E4426", grain = true } = opts;
  const key = `${text}|${w}|${h}|${bg}|${fg}|${font}|${border}|${grain}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  if (bg !== "transparent") {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  if (grain) {
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
  }
  if (border !== "none") {
    g.strokeStyle = border;
    g.lineWidth = Math.max(4, w / 110);
    g.strokeRect(w * 0.05, h * 0.08, w * 0.9, h * 0.84);
  }
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

/** Wooden sign board on two posts with a burned-in label (scaled with `s`). */
export const SignBoard: React.FC<{ text: string; position: V3; rotation?: number; s?: number; lit?: number }> = ({ text, position, rotation = 0, s = 1, lit = 0 }) => {
  const tex = textTexture(text, { w: 768, h: 256, font: "bold 150px Georgia, serif" });
  const w = 1.3, h = w / 3;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={s}>
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
          <meshStandardMaterial map={tex} roughness={0.8} emissive="#FFFFFF" emissiveMap={tex} emissiveIntensity={lit} />
        </mesh>
      </group>
    </group>
  );
};

/** Text label floating in the world (always faces the camera). */
export const Label: React.FC<{ text: string; position: V3; w: number; color?: string; bg?: string; opacity?: number }> = ({ text, position, w, color = "#FFFFFF", bg = "rgba(20,14,12,0.85)", opacity = 1 }) => {
  const tex = textTexture(text, { w: 768, h: 192, bg, fg: color, font: "900 120px 'Segoe UI', Arial, sans-serif", border: "none", grain: false });
  if (opacity <= 0.01) return null;
  return (
    <Billboard position={position}>
      <mesh layers={FX_LAYER} renderOrder={5}>
        <planeGeometry args={[w, w / 4]} />
        <meshBasicMaterial map={tex} transparent opacity={opacity} depthTest={false} depthWrite={false} fog={false} toneMapped={false} />
      </mesh>
    </Billboard>
  );
};

// ---------- props ----------
export const Boulders: React.FC<{ seed?: number; n?: number; r0?: number; r1?: number }> = ({ seed = 9, n = 14, r0 = 39, r1 = 60 }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: n }, () => {
      const a = rnd() * Math.PI * 2;
      const r = r0 + rnd() * (r1 - r0);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const s = 0.7 + Math.pow(rnd(), 2) * 1.6;
      return { p: [x, height(x, z) - 0.3 * s, z] as V3, s, rot: rnd() * 6.28 };
    });
  }, [seed, n, r0, r1]);
  return (
    <>
      {items.map((b, i) => (
        <group key={i} position={b.p} rotation={[0, b.rot, 0]}>
          <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={b.s} ground tint="#9C8466" roughness={0.95} />
        </group>
      ))}
    </>
  );
};

export const Tent: React.FC<{ position: V3; rotation?: number; size?: number; glow?: number }> = ({ position, rotation = 0, size = 5, glow = 0 }) => (
  <group position={[position[0], height(position[0], position[2]), position[2]]} rotation={[0, rotation, 0]}>
    <AssetModel id="canvas-wall-tent-de8a04" assetType="prop" size={size} ground tint={C.canvas} roughness={0.95} />
    {glow > 0 ? <pointLight position={[0, size * 0.25, size * 0.3]} intensity={30 * glow} decay={2} color="#FFB060" /> : null}
  </group>
);

export const Truck: React.FC<{ position: V3; rotation?: number; size?: number }> = ({ position, rotation = 0, size = 8 }) => (
  <group position={[position[0], height(position[0], position[2]), position[2]]} rotation={[0, rotation, 0]}>
    <AssetModel id="military-cargo-truck-652f66" assetType="vehicle" size={size} ground tint="#5E6A4E" roughness={0.75} />
  </group>
);

export const Drums: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    {[[0, 0], [1.0, 0.2], [0.4, 0.95], [-0.6, 0.7]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]} rotation={[0, i * 0.7, 0]}>
        <AssetModel id="oil-drum-386c30" assetType="prop" size={0.95} ground tint={i % 2 ? C.rust : "#3E5A6E"} metalness={0.5} roughness={0.55} />
      </group>
    ))}
  </group>
);

const HardHat: React.FC<{ color?: string }> = ({ color = "#E8B02A" }) => (
  <group position={[0, 0.06, 0]}>
    <mesh scale={[0.135, 0.11, 0.14]} material={mat(color, 1, "paint")}>
      <sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </mesh>
    <mesh position={[0, 0, 0.02]} rotation={[-Math.PI / 2, 0, 0]} material={mat(color, 1, "paint")}>
      <ringGeometry args={[0.12, 0.17, 24]} />
    </mesh>
  </group>
);

export const Worker: React.FC<{ f: number; seed: number; position: V3; heading?: number; pose?: PoseName; scale?: number; rightHand?: React.ReactNode }> = ({ f, seed, position, heading = 0, pose = "stand", scale = 1.75, rightHand }) => (
  <ToyPerson f={Math.floor(f / 5) * 5} seed={seed} pose={pose} outfit="uniform" look={{ top: ["#5C6B4A", "#6E5A3E", "#4E5C66"][seed % 3], bottom: "#3B3A34" }} position={position} heading={heading} scale={scale} headwear={<HardHat />} rightHand={rightHand} />
);

export const Tourist: React.FC<{ f: number; seed: number; position: V3; heading?: number; pose?: PoseName }> = ({ f, seed, position, heading = 0, pose = "stand" }) => (
  <ToyPerson f={Math.floor(f / 5) * 5} seed={seed} pose={pose} outfit="winter" position={[position[0], height(position[0], position[2]), position[2]]} heading={heading} scale={1.7} />
);

/** Explorer in a silver heat suit with a glass-visor helmet. */
export const Explorer: React.FC<{ f: number; position: V3; heading?: number; pose?: PoseName; sample?: number }> = ({ f, position, heading = 0, pose = "stand", sample = 0 }) => (
  <ToyPerson
    f={Math.floor(f / 5) * 5}
    seed={13}
    pose={pose}
    outfit="uniform"
    look={{ top: "#C9CDD3", bottom: "#B8BCC2", skin: "#d09a6c" }}
    position={position}
    heading={heading}
    scale={1.75}
    headwear={
      <mesh scale={0.19}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color="#AEB3BA" metalness={0.75} roughness={0.38} clearcoat={0.4} envMapIntensity={0.5} />
      </mesh>
    }
    rightHand={
      sample > 0 ? (
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 12]} />
          <meshStandardMaterial color="#9CFFD2" emissive="#4CFFB0" emissiveIntensity={1.2 * sample} />
        </mesh>
      ) : null
    }
  />
);
