// EP45 building blocks: paper GLB loader, a faceless robed paper figure, paper flame, glow sprites,
// printed text cards, sky gradient card, stars, sandals, a paper snake and a glowing paper tree.
// Adab: figures are hooded and always staged from behind / in silhouette; no face is ever drawn.

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { S } from "../kits/paperworld/geometry/shapes.ts";
import { Cut, Print, type V3 } from "../kits/paperworld/components/Paper.tsx";
import { Thread } from "../kits/paperworld/components/MiniatureEnvironment.tsx";
import { paperFace } from "../kits/paperworld/material/paper.ts";
import { hash01 } from "../kits/paperworld/motion/easing.ts";

// ── Paper GLB ─────────────────────────────────────────────────────────────────

const glbCache = new Map<string, Promise<THREE.Object3D>>();
const loadGlb = (url: string) => {
  let p = glbCache.get(url);
  if (!p) {
    p = new Promise<THREE.Object3D>((res, rej) => new GLTFLoader().load(url, (g) => res(g.scene), undefined, rej));
    p.catch(() => glbCache.delete(url));
    glbCache.set(url, p);
  }
  return p;
};

/** A catalogue GLB re-skinned as dyed cardstock (paperFace grain + flat facets). */
export const PaperGlb: React.FC<{
  model: string;
  size: number;
  tint?: string;
  emissive?: string;
  emissiveIntensity?: number;
  position?: V3;
  rotation?: V3;
  scale?: number;
  cast?: boolean;
}> = ({ model, size, tint, emissive, emissiveIntensity = 1, position, rotation, scale, cast = true }) => {
  const url = staticFile(`models/polyfork/${model}.glb`);
  const [scene, setScene] = useState<THREE.Object3D | null | undefined>(undefined);
  const hold = useRef<number | null>(null);
  const advance = useThree((st) => st.advance);
  const release = () => {
    if (hold.current === null) return;
    const h = hold.current;
    hold.current = null;
    continueRender(h);
  };
  useLayoutEffect(() => {
    let alive = true;
    hold.current = delayRender(`ep45 glb ${model}`, { timeoutInMilliseconds: 60000 });
    loadGlb(url).then(
      (sc) => alive && setScene(sc),
      () => alive && setScene(null),
    );
    return () => {
      alive = false;
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const object = useMemo(() => {
    if (!scene) return null;
    const c = skeletonClone(scene);
    c.traverse((ch) => {
      if (!(ch instanceof THREE.Mesh)) return;
      ch.castShadow = cast;
      ch.receiveShadow = true;
      const hasVC = !!(ch.geometry as THREE.BufferGeometry).getAttribute("color");
      const swap = (orig: THREE.Material) => {
        const o = orig as THREE.MeshStandardMaterial;
        const base = paperFace(tint ?? "#ffffff", emissive ? { emissive, emissiveIntensity } : {});
        const m = base.clone();
        m.onBeforeCompile = base.onBeforeCompile;
        m.customProgramCacheKey = base.customProgramCacheKey;
        if (!tint) {
          if (hasVC) m.vertexColors = true;
          else if (o.color) m.color.copy(o.color);
          if (o.map) m.map = o.map;
        }
        m.flatShading = true;
        return m;
      };
      ch.material = Array.isArray(ch.material) ? ch.material.map(swap) : swap(ch.material);
    });
    const box = new THREE.Box3().setFromObject(c);
    const dim = box.getSize(new THREE.Vector3());
    const k = size / Math.max(dim.x, dim.y, dim.z, 1e-6);
    const centre = box.getCenter(new THREE.Vector3());
    c.scale.multiplyScalar(k);
    c.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
    const wrap = new THREE.Group();
    wrap.add(c);
    return wrap;
  }, [scene, tint, emissive, emissiveIntensity, size, cast]);

  useLayoutEffect(() => {
    if (scene === undefined) return;
    advance(performance.now()); // det-ok: redraw only
    requestAnimationFrame(release);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, object]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {object ? <primitive object={object} /> : null}
    </group>
  );
};

// ── Robed figure (faceless, hooded) ───────────────────────────────────────────

export type RobeColors = { robe: string; inner: string; hood: string; fold: string };
export const MUSA: RobeColors = { robe: "#a8835a", inner: "#dcbc8c", hood: "#7a5a40", fold: "#87654a" };
export const HARUN: RobeColors = { robe: "#5f6f8a", inner: "#9fb0c8", hood: "#3f4a62", fold: "#4a5670" };
export const FAMILY_A: RobeColors = { robe: "#7b5a7a", inner: "#b48fa8", hood: "#563d56", fold: "#634762" };
export const FAMILY_B: RobeColors = { robe: "#a0705a", inner: "#d0a080", hood: "#6e4a3c", fold: "#865b48" };

const robeBody = S.poly("ep45-robe", [[-1.2, 0], [1.2, 0], [0.72, 4.5], [-0.72, 4.5]]);
const robeSide = S.poly("ep45-robe-side", [[-0.8, 0], [0.8, 0], [0.5, 4.5], [-0.5, 4.5]]);
const cape = S.poly("ep45-cape", [[-0.95, 4.55], [0.95, 4.55], [0.62, 2.6], [0, 2.2], [-0.62, 2.6]]);
const hoodShape = S.arch(1.45, 2.0);
const hoodSide = S.arch(1.25, 1.9);
const sleeve = S.rect(0.5, 2.35, 0.18);
const hand = S.circle(0.24);
const staffShape = S.rect(0.16, 6.8, 0.06);

/**
 * Faceless hooded robe figure, ~6.3 tall at scale 1, facing -z (its back faces +z, toward the usual camera).
 * raise: right arm 0 = hanging, 1 = pointing up-forward. pray: both arms lifted open (0..1).
 * walk: phase in steps (bob + sway). staff: holds a staff in the left hand.
 */
export const Robed: React.FC<{
  position: V3;
  yaw?: number;
  scale?: number;
  c?: RobeColors;
  raise?: number;
  pray?: number;
  walk?: number;
  staff?: boolean;
  children?: React.ReactNode;
}> = ({ position, yaw = 0, scale = 1, c = MUSA, raise = 0, pray = 0, walk = 0, staff = false, children }) => {
  const bob = Math.abs(Math.sin(walk * Math.PI)) * 0.12;
  const sway = Math.sin(walk * Math.PI) * 0.035;
  const right = Math.PI + Math.max(raise * 2.55, pray * 2.2);
  const left = Math.PI - pray * 2.2;
  return (
    <group position={position} rotation={[0, yaw, 0]} scale={scale}>
      <group position={[0, bob, 0]} rotation={[0, 0, sway]}>
        {/* robe: two slotted cards so the silhouette holds from the side */}
        <Cut shape={robeBody} color={c.robe} edge={c.inner} depth={0.1} />
        <group rotation={[0, Math.PI / 2, 0]}>
          <Cut shape={robeSide} color={c.robe} edge={c.inner} depth={0.1} />
        </group>
        {/* back folds + sash (back faces +z) */}
        {[-0.55, -0.1, 0.4].map((x, i) => (
          <Print key={i} shape={S.poly(`ep45-fold-${i}`, [[x - 0.05, 0.05], [x + 0.05, 0.05], [x * 0.55 + 0.03, 3.6], [x * 0.55 - 0.03, 3.6]])} color={c.fold} position={[0, 0, 0.056]} />
        ))}
        <Cut shape={S.rectC(1.75, 0.26, 0.05)} color={c.inner} depth={0.04} position={[0, 2.35, 0.08]} />
        {/* inner robe glimpse at the front hem */}
        <Cut shape={S.poly("ep45-inner", [[-0.5, 0], [0.5, 0], [0.3, 2.2], [-0.3, 2.2]])} color={c.inner} depth={0.04} position={[0, 0, -0.08]} />
        <Cut shape={cape} color={c.hood} depth={0.06} position={[0, 0, 0.1]} />
        {/* hood: arch cards, the front opening is a deep shadow (no face) */}
        <Cut shape={hoodShape} color={c.hood} edge={c.inner} depth={0.1} position={[0, 4.15, 0]} />
        <group position={[0, 4.15, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Cut shape={hoodSide} color={c.hood} edge={c.inner} depth={0.1} />
        </group>
        <Print shape={S.ellipse(0.42, 0.6)} color="#120d0b" position={[0, 4.95, -0.07]} rotation={[0, Math.PI, 0]} />
        {/* arms */}
        <group position={[0.82, 4.15, 0.06]} rotation={[0, 0, right]}>
          <Cut shape={sleeve} color={c.robe} depth={0.08} />
          <Cut shape={hand} color="#c9a07c" depth={0.06} position={[0, 2.45, 0]} />
        </group>
        <group position={[-0.82, 4.15, 0.06]} rotation={[0, 0, left]}>
          <Cut shape={sleeve} color={c.robe} depth={0.08} />
          <Cut shape={hand} color="#c9a07c" depth={0.06} position={[0, 2.45, 0]} />
        </group>
        {staff ? <Cut shape={staffShape} color="#523729" depth={0.14} position={[-1.15, 0, 0.12]} rotation={[0, 0, 0.03]} /> : null}
        {children}
      </group>
    </group>
  );
};

// ── Fire, glow, light ─────────────────────────────────────────────────────────

const flameShape = S.path("ep45-flame", (s) => {
  s.moveTo(0, 0);
  s.bezierCurveTo(0.95, 0, 0.85, 1.05, 0, 2.3);
  s.bezierCurveTo(-0.85, 1.05, -0.95, 0, 0, 0);
});

let glowTex: THREE.Texture | null = null;
const radial = () => {
  if (glowTex) return glowTex;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const g = cv.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(255,255,255,0.55)");
  gr.addColorStop(0.6, "rgba(255,255,255,0.12)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(cv);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
};

/** Additive glow sprite (always faces the camera). */
// GTAO and Bokeh re-render the scene with an override material; a sprite would draw there as an opaque quad
// (dark / blurred squares). Collapse it to nothing whenever it is drawn with any material but its own.
const hideFromOverrides = (sp: THREE.Sprite | null) => {
  if (!sp || sp.userData.hidden) return;
  sp.userData.hidden = true;
  const saved = new THREE.Matrix4();
  sp.onBeforeRender = (_r, _s, _c, _g, mat) => {
    if (mat !== sp.material) {
      saved.copy(sp.matrixWorld);
      sp.matrixWorld.makeScale(0, 0, 0);
      sp.userData.collapsed = true;
    }
  };
  sp.onAfterRender = () => {
    if (sp.userData.collapsed) {
      sp.matrixWorld.copy(saved);
      sp.userData.collapsed = false;
    }
  };
};
export const Glow: React.FC<{ position: V3; size: number; color: string; opacity?: number }> = ({ position, size, color, opacity = 1 }) => (
  <sprite ref={hideFromOverrides} position={position} scale={[size, size, 1]} renderOrder={5}>
    <spriteMaterial map={radial()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
  </sprite>
);

/** Paper flame: three cross-slotted tongues that flicker, a glow and a warm point light. lit 0..1. */
export const Flame: React.FC<{ position: V3; s: number; lit?: number; scale?: number; light?: number; range?: number }> = ({
  position,
  s,
  lit = 1,
  scale = 1,
  light = 60,
  range = 40,
}) => {
  if (lit <= 0.001) return null;
  const layers: [string, number, number][] = [
    ["#ff6a2a", 1.0, 2.2],
    ["#ffb23e", 0.7, 3.0],
    ["#fff0c0", 0.42, 4.0],
  ];
  return (
    <group position={position} scale={scale * lit}>
      {layers.map(([col, k, ei], i) => {
        const f = 1 + 0.13 * Math.sin(s * 13 + i * 1.7) + 0.06 * Math.sin(s * 29 + i * 2.3);
        return (
          <group key={i} scale={[k * (1 + 0.05 * Math.sin(s * 17 + i)), k * f, k]} position={[0, 0, i * 0.04]}>
            {[0, Math.PI / 2].map((a) => (
              <group key={a} rotation={[0, a, Math.sin(s * 7 + i) * 0.05]}>
                <Cut shape={flameShape} color={col} depth={0.04} opts={{ emissive: col, emissiveIntensity: ei }} cast={false} />
              </group>
            ))}
          </group>
        );
      })}
      <Glow position={[0, 1.0, 0.3]} size={7} color="#ff9a4a" opacity={0.55 * lit} />
      <pointLight position={[0, 1.6, 0.8]} color="#ff9a52" intensity={light * lit * (1 + 0.08 * Math.sin(s * 11))} distance={range} decay={1.4} />
    </group>
  );
};

// ── Text cards (brand in-world) ───────────────────────────────────────────────

const texCache = new Map<string, THREE.Texture>();
const textTexture = (lines: string[], bg: string, fg: string, w: number, h: number, accent?: string) => {
  const key = [lines.join("|"), bg, fg, w, h, accent].join("#");
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (accent) {
    g.strokeStyle = accent;
    g.lineWidth = h * 0.05;
    g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
  }
  g.fillStyle = fg;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const n = lines.length;
  lines.forEach((t, i) => {
    const size = i === 0 ? h * (n > 1 ? 0.42 : 0.55) : h * 0.2;
    g.font = `bold ${size}px Georgia, 'Times New Roman', serif`;
    const y = n === 1 ? h / 2 : i === 0 ? h * 0.42 : h * 0.76;
    g.fillText(t, w / 2, y);
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

/** A cardstock board with printed lettering on its front (+z). */
export const TextBoard: React.FC<{ lines: string[]; w: number; h: number; bg?: string; fg?: string; accent?: string; position?: V3; rotation?: V3; edge?: string; glow?: number }> = ({
  lines,
  w,
  h,
  bg = "#efe2c6",
  fg = "#3b2a22",
  accent,
  position,
  rotation,
  edge = "#7d5843",
  glow = 0,
}) => {
  const tex = useMemo(() => textTexture(lines, bg, fg, 1024, Math.round((1024 * h) / w), accent), [lines, bg, fg, w, h, accent]);
  return (
    <group position={position} rotation={rotation}>
      <Cut shape={S.rectC(w + 0.18, h + 0.18, 0.05)} color={edge} depth={0.12} />
      <mesh position={[0, 0, 0.065]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.9} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={glow} />
      </mesh>
    </group>
  );
};

// ── Sky card, moon and stars ──────────────────────────────────────────────────

const skyCache = new Map<string, THREE.Texture>();
const skyTexture = (stops: [number, string][]) => {
  const key = JSON.stringify(stops);
  const hit = skyCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 8;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr;
  g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  skyCache.set(key, t);
  return t;
};

/** Painted backdrop card far behind the set (stops top→bottom). */
export const SkyCard: React.FC<{ stops: [number, string][]; position?: V3; w?: number; h?: number }> = ({ stops, position = [0, 40, -200], w = 520, h = 260 }) => (
  <mesh position={position}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={skyTexture(stops)} fog={false} toneMapped={false} />
  </mesh>
);

export const NIGHT_SKY: [number, string][] = [
  [0, "#070b1c"],
  [0.55, "#18204a"],
  [1, "#3a3f70"],
];

/** Paper stars on threads and a crescent moon. */
export const NightMobile: React.FC<{ s: number; z?: number; spread?: number; y0?: number; moon?: V3; count?: number; glow?: number }> = ({
  s,
  z = -150,
  spread = 80,
  y0 = 40,
  moon = [-24, 66, -140],
  count = 26,
  glow = 1.4,
}) => (
  <group>
    {Array.from({ length: count }, (_, i) => {
      const x = (hash01(i * 3.1 + 1) - 0.5) * spread * 2;
      const y = y0 + hash01(i * 7.7 + 2) * 55;
      const r = 0.5 + hash01(i * 1.3 + 5) * 0.8;
      const tw = 0.75 + 0.25 * Math.sin(s * 2.2 + i * 1.9);
      return (
        <group key={i} position={[x, y, z + hash01(i * 5.3) * 10]} rotation={[0, 0, Math.sin(s * 0.7 + i) * 0.12]}>
          <Cut shape={S.star(r)} color="#f6ecd0" depth={0.05} cast={false} opts={{ emissive: "#f6ecd0", emissiveIntensity: glow * tw }} />
          <Thread position={[0, r * 0.9, 0]} length={60} radius={0.035} />
        </group>
      );
    })}
    <group position={moon} rotation={[0, 0, -0.35 + Math.sin(s * 0.4) * 0.03]}>
      <Cut shape={S.crescent(5, 4.3, 2.0)} color="#f6ecd0" depth={0.3} cast={false} opts={{ emissive: "#f3e2b8", emissiveIntensity: 2.4 }} />
      <Thread position={[0.5, 4.6, 0]} length={60} radius={0.06} />
    </group>
    <Glow position={[moon[0] + 0.5, moon[1], moon[2] + 2]} size={26} color="#9fb3e6" opacity={0.35} />
  </group>
);

// ── Sandals ───────────────────────────────────────────────────────────────────

const sole = S.path("ep45-sole", (s) => {
  s.moveTo(0, -1.35);
  s.bezierCurveTo(0.55, -1.35, 0.5, -0.2, 0.62, 0.55);
  s.bezierCurveTo(0.7, 1.3, -0.7, 1.4, -0.6, 0.5);
  s.bezierCurveTo(-0.5, -0.2, -0.55, -1.35, 0, -1.35);
});

/** One paper sandal lying flat (toe toward -z). */
export const Sandal: React.FC<{ position: V3; yaw?: number; mirror?: boolean }> = ({ position, yaw = 0, mirror = false }) => (
  <group position={position} rotation={[0, yaw, 0]} scale={[mirror ? -1 : 1, 1, 1]}>
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Cut shape={sole} color="#6e4a32" depth={0.2} position={[0, 0, 0.1]} />
      <Cut shape={sole} color="#a57a55" depth={0.05} position={[0, 0, 0.23]} scale={0.9} />
      <Cut shape={S.rectC(1.2, 0.2, 0.08)} color="#4a3020" depth={0.1} position={[0, 0.6, 0.32]} rotation={[0, 0, 0.35]} />
      <Cut shape={S.rectC(1.2, 0.2, 0.08)} color="#4a3020" depth={0.1} position={[0, 0.6, 0.32]} rotation={[0, 0, -0.35]} />
      <Cut shape={S.rectC(1.15, 0.18, 0.08)} color="#4a3020" depth={0.1} position={[0, -0.45, 0.32]} />
    </group>
  </group>
);

// ── Paper snake (staff ⇄ snake) ───────────────────────────────────────────────

const SNAKE_TUBE = 72;
const SNAKE_RAD = 7;
const snakeBelly = new THREE.Color("#e8cf86");
const snakeBack = new THREE.Color("#5f7a2e");
const snakeBand = new THREE.Color("#2c3a16");
const snakeMat = (() => {
  const base = paperFace("#ffffff");
  const m = base.clone();
  m.onBeforeCompile = base.onBeforeCompile;
  m.customProgramCacheKey = base.customProgramCacheKey;
  m.vertexColors = true;
  m.flatShading = true;
  return m;
})();
const headShape = S.poly("ep45-snake-head", [[0, -0.55], [0.95, -0.42], [1.55, 0], [0.95, 0.42], [0, 0.55], [-0.15, 0]]);
const tongueShape = S.poly("ep45-snake-tongue", [[0, -0.05], [0.55, -0.05], [0.8, -0.2], [0.62, 0], [0.8, 0.2], [0.55, 0.05], [0, 0.05]]);

/**
 * Staff that becomes a big folded-paper snake. m = 0 straight staff (lying along x), 1 = coiled snake,
 * body a faceted tapered tube (banded print), triangular head raised toward -x with a forked tongue.
 */
export const StaffSnake: React.FC<{ position: V3; s: number; m: number; yaw?: number; size?: number }> = ({ position, s, m, yaw = 0, size = 1 }) => {
  const len = 7.2;
  const body = useMemo(() => {
    if (m < 0.04) return null;
    const N = 16;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const x = -len / 2 + t * len * (1 - 0.25 * m);
      const wave = Math.sin(t * 7.5 - s * 4.2) * 1.5 * m * (0.3 + 0.7 * t);
      const lift = m * Math.max(0, 1 - t * 4) * 1.5;
      pts.push(new THREE.Vector3(x, lift, wave));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, SNAKE_TUBE, 1, SNAKE_RAD, false);
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const p = new THREE.Vector3();
    for (let i = 0; i <= SNAKE_TUBE; i++) {
      const t = i / SNAKE_TUBE;
      const centre = curve.getPointAt(t);
      const r = (0.1 + 0.42 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 1.05)) * (1 - 0.75 * t * t)) * (0.35 + 0.65 * m) + 0.05;
      for (let j = 0; j <= SNAKE_RAD; j++) {
        const k = i * (SNAKE_RAD + 1) + j;
        p.fromBufferAttribute(pos, k).sub(centre).multiplyScalar(r);
        const up = p.y / Math.max(r, 1e-4);
        p.y *= 0.72; // flattened like a folded paper strip
        p.add(centre);
        pos.setXYZ(k, p.x, p.y + r * 0.72, p.z);
        const band = Math.floor(t * 18) % 3 === 0;
        c.copy(up < -0.2 ? snakeBelly : band ? snakeBand : snakeBack);
        cols.set([c.r, c.g, c.b], k * 3);
      }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const head = curve.getPointAt(0);
    const dir = curve.getTangentAt(0).multiplyScalar(-1);
    return { geo, head, yawH: Math.atan2(-dir.z, dir.x), pitch: Math.atan2(dir.y, Math.hypot(dir.x, dir.z)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, s]);
  useEffect(() => () => body?.geo.dispose(), [body]);
  const flick = 0.7 + 0.3 * Math.sin(s * 9);
  return (
    <group position={position} rotation={[0, yaw, 0]} scale={size}>
      {body ? (
        <>
          <mesh geometry={body.geo} material={snakeMat} castShadow receiveShadow />
          <group position={[body.head.x, body.head.y + 0.25, body.head.z]} rotation={[0, body.yawH, 0]}>
            <group rotation={[0, 0, Math.min(0.5, Math.max(0, body.pitch)) * 0.6]} scale={0.45 + 0.55 * m}>
              <group rotation={[Math.PI / 2, 0, 0]}>
                <Cut shape={headShape} color="#4c6522" edge="#e8cf86" depth={0.32} position={[0, 0, -0.16]} />
                <Print shape={S.circle(0.11)} color="#f2d27a" position={[0.9, 0.24, -0.17]} rotation={[Math.PI, 0, 0]} />
                <Print shape={S.circle(0.11)} color="#f2d27a" position={[0.9, -0.24, -0.17]} rotation={[Math.PI, 0, 0]} />
                <Cut shape={tongueShape} color="#b8322a" depth={0.03} position={[1.45, 0, 0]} scale={[flick, 1, 1]} cast={false} />
              </group>
            </group>
          </group>
        </>
      ) : null}
      {/* straight staff body while m ≈ 0 */}
      {m < 0.08 ? (
        <group rotation={[0, 0, Math.PI / 2]} position={[len / 2 + 0.2, 0.12, 0]}>
          <Cut shape={staffShape} color="#523729" depth={0.2} scale={[1.2, len / 6.8 * 1.05, 1]} />
        </group>
      ) : null}
    </group>
  );
};

// ── Glowing paper tree (the call comes from the tree; only light is shown) ────

export const GlowTree: React.FC<{ position: V3; h?: number; glow: number; s: number }> = ({ position, h = 10, glow, s }) => {
  const lobes: [number, number, number][] = [
    [0, h * 0.78, h * 0.3],
    [-h * 0.24, h * 0.62, h * 0.2],
    [h * 0.25, h * 0.66, h * 0.21],
    [-h * 0.1, h * 0.95, h * 0.17],
    [h * 0.14, h * 0.9, h * 0.16],
  ];
  const ei = 0.1 + glow * 0.32 * (1 + 0.05 * Math.sin(s * 3.1));
  return (
    <group position={position}>
      {[0, Math.PI / 2].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <Cut shape={S.rect(0.55, h * 0.55, 0.08)} color="#7d5843" depth={0.12} />
          <Cut shape={S.poly(`ep45-branch-${h}`, [[0, h * 0.4], [-h * 0.22, h * 0.58], [-h * 0.19, h * 0.61], [0.05, h * 0.47]])} color="#7d5843" depth={0.1} />
          {lobes.map(([x, y, r], i) => (
            <group key={i}>
              <Cut shape={S.circle(r * 1.06)} color="#c99a52" depth={0.06} position={[x, y, i * 0.03 - 0.05]} cast={false} />
              <Cut shape={S.circle(r)} color="#d8b06a" depth={0.1} position={[x, y, i * 0.03]} opts={{ emissive: "#ffe6a6", emissiveIntensity: ei }} cast={false} />
            </group>
          ))}
        </group>
      ))}
      <Glow position={[0, h * 0.75, 0.5]} size={h * 2.2} color="#ffd88a" opacity={0.1 * glow} />
      <pointLight position={[0, h * 0.35, 3]} color="#ffe2a8" intensity={60 * glow} distance={h * 6} decay={1.3} />
    </group>
  );
};

/** Long soft beam card from above (additive). */
export const Beam: React.FC<{ position: V3; w: number; h: number; tilt?: number; opacity?: number; color?: string }> = ({ position, w, h, tilt = 0, opacity = 0.2, color = "#ffe2a8" }) => (
  <mesh position={position} rotation={[0, 0, tilt]} renderOrder={4}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>
);

/** Drifting paper flecks (wind/sand), deterministic. */
export const Flecks: React.FC<{ s: number; count?: number; area?: [number, number, number]; center?: V3; color?: string; speed?: number }> = ({
  s,
  count = 36,
  area = [40, 10, 30],
  center = [0, 4, 0],
  color = "#d9c3a0",
  speed = 3,
}) => (
  <group>
    {Array.from({ length: count }, (_, i) => {
      const ph = hash01(i * 2.7 + 0.3);
      const x = (((ph * area[0] + s * speed * (0.6 + hash01(i * 1.1))) % area[0]) + area[0]) % area[0] - area[0] / 2;
      const y = hash01(i * 9.1) * area[1] + Math.sin(s * 2 + i) * 0.4;
      const z = (hash01(i * 4.4) - 0.5) * area[2];
      return (
        <group key={i} position={[center[0] + x, center[1] + y - area[1] / 2, center[2] + z]} rotation={[s * 2 + i, s * 3 + i * 2, 0]}>
          <Cut shape={S.rectC(0.22, 0.14)} color={color} depth={0.01} cast={false} />
        </group>
      );
    })}
  </group>
);
