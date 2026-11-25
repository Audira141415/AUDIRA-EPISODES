// Building blocks of the EP02 maquette (film version). Matte plaster for matter, emissive light for data.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { continueRender, delayRender } from "remotion";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";

export type V3 = [number, number, number];
export type Rect = { x0: number; x1: number; z0: number; z1: number };

export const PLASTER = "#E8E5DE";
export const PLASTER_WARM = "#EEE9DF";
export const ERA_COL = ["#ffb347", "#ffd166", "#f6e7a6", "#9ff3e6", "#5fe3f0", "#36c8ff"];

export const lerpRect = (a: Rect, b: Rect, k: number): Rect => ({
  x0: a.x0 + (b.x0 - a.x0) * k,
  x1: a.x1 + (b.x1 - a.x1) * k,
  z0: a.z0 + (b.z0 - a.z0) * k,
  z1: a.z1 + (b.z1 - a.z1) * k,
});
export const inset = (r: Rect, d: number): Rect => ({ x0: r.x0 + d, x1: r.x1 - d, z0: r.z0 + d, z1: r.z1 - d });
export const inRect = (r: Rect, x: number, z: number, m = 0) => x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m;
/** Signed depth of a point inside a rect (positive inside). */
export const depthIn = (r: Rect, x: number, z: number) => Math.min(x - r.x0, r.x1 - x, z - r.z0, r.z1 - z);

// ---------- materials ----------
export function useMats() {
  const grain = useSurfaceGrain(7, 0.18, 6);
  return useMemo(() => {
    const plaster = new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.88, roughnessMap: grain, bumpMap: grain, bumpScale: 0.004 });
    const warm = new THREE.MeshStandardMaterial({ color: PLASTER_WARM, roughness: 0.86, roughnessMap: grain, bumpMap: grain, bumpScale: 0.004 });
    const clay = new THREE.MeshStandardMaterial({ color: "#d9cdb8", roughness: 0.93, roughnessMap: grain, bumpMap: grain, bumpScale: 0.006 });
    return {
      plaster,
      warm,
      clay,
      marble: new THREE.MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.38 }),
      stone: new THREE.MeshStandardMaterial({ color: "#cdc4b2", roughness: 0.9 }),
      sand: new THREE.MeshStandardMaterial({ color: "#d8d0c0", roughness: 0.95, roughnessMap: grain }),
      core: new THREE.MeshStandardMaterial({ color: "#2b2b2f", roughness: 0.9 }),
      shade: new THREE.MeshStandardMaterial({ color: "#47443e", roughness: 0.95 }),
      plinth: new THREE.MeshStandardMaterial({ color: "#121317", roughness: 0.55, metalness: 0.15 }),
      plaza: new THREE.MeshStandardMaterial({ color: "#cfcbc2", roughness: 0.85 }),
      wood: new THREE.MeshStandardMaterial({ color: "#e2d6c0", roughness: 0.8 }),
      gold: new THREE.MeshStandardMaterial({ color: "#d9b25a", metalness: 0.85, roughness: 0.3, emissive: new THREE.Color("#3a2606"), emissiveIntensity: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#e9f2f2", roughness: 0.08, transmission: 0.6, thickness: 0.02, transparent: true, opacity: 0.75 }),
    };
  }, [grain]);
}

export const glowMat = (color: string, k = 2.2) =>
  new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: k, roughness: 0.4, toneMapped: false });

/** Projected light outline around a rectangle at height y. */
export const Outline: React.FC<Rect & { y: number; color: string; w?: number; k?: number; visible?: boolean }> = ({ x0, x1, z0, z1, y, color, w = 0.05, k = 2.4, visible = true }) => {
  const m = useMemo(() => glowMat(color, 1), [color]);
  m.emissiveIntensity = k;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lx = x1 - x0, lz = z1 - z0;
  if (!visible || k <= 0.01) return null;
  return (
    <group position={[0, y, 0]}>
      <mesh material={m} position={[cx, 0, z0]}><boxGeometry args={[lx + w, 0.012, w]} /></mesh>
      <mesh material={m} position={[cx, 0, z1]}><boxGeometry args={[lx + w, 0.012, w]} /></mesh>
      <mesh material={m} position={[x0, 0, cz]}><boxGeometry args={[w, 0.012, lz]} /></mesh>
      <mesh material={m} position={[x1, 0, cz]}><boxGeometry args={[w, 0.012, lz]} /></mesh>
    </group>
  );
};

/** Projected light wash (a thin tinted plane): colour is light, never paint. */
export const Wash: React.FC<{ pos: V3; size: [number, number]; color: string; opacity?: number }> = ({ pos, size, color, opacity = 0.2 }) => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }), [color]);
  m.opacity = opacity;
  if (opacity <= 0.003) return null;
  return (
    <mesh material={m} position={pos} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} renderOrder={2}>
      <planeGeometry args={size} />
    </mesh>
  );
};

/** Stacked floor slabs over a dark core; `rise` 0..1 grows it out of the plinth. */
export const Storeys: React.FC<{ pos: V3; size: [number, number]; floors: number; floorH?: number; rise?: number; mat: THREE.Material; core: THREE.Material; wash?: string; washK?: number }> = ({
  pos, size, floors, floorH = 0.17, rise = 1, mat, core, wash, washK = 0.2,
}) => {
  if (rise <= 0.002) return null;
  const gap = 0.028;
  const [sx, sz] = size;
  const H = floors * floorH;
  return (
    <group position={pos} scale={[1, Math.max(0.002, rise), 1]}>
      <mesh material={core} position={[0, (H - 0.04) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx - 0.05, H - 0.04, sz - 0.05]} />
      </mesh>
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={i} material={mat} position={[0, i * floorH + (floorH - gap) / 2 + gap, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[sx, floorH - gap, sz]} radius={0.012} segments={2} />
        </mesh>
      ))}
      {wash && <Wash pos={[0, H + 0.004, 0]} size={[sx - 0.03, sz - 0.03]} color={wash} opacity={washK * rise} />}
    </group>
  );
};

/** Saudi-era minaret: square base, octagonal shaft, two balconies with rails, lantern, cone, gold finial. */
export const Minaret: React.FC<{ pos: [number, number]; base: number; h?: number; rise?: number; mats: ReturnType<typeof useMats>; glow?: number }> = ({ pos, base, h = 1.9, rise = 1, mats, glow = 0 }) => {
  const gm = useMemo(() => glowMat("#ffd166", 0), []);
  gm.emissiveIntensity = glow * 3;
  if (rise <= 0.002) return null;
  const m = mats.plaster;
  const y0 = 0.36;
  return (
    <group position={[pos[0], base, pos[1]]} scale={[1, Math.max(0.002, rise), 1]}>
      <mesh material={m} position={[0, 0.18, 0]} castShadow receiveShadow><RoundedBoxGeo args={[0.2, 0.36, 0.2]} radius={0.01} segments={2} /></mesh>
      <mesh material={mats.shade} position={[0, 0.2, 0.101]}><boxGeometry args={[0.07, 0.14, 0.004]} /></mesh>
      <mesh material={m} position={[0, y0 + h * 0.4, 0]} castShadow><cylinderGeometry args={[0.055, 0.07, h * 0.8, 8]} /></mesh>
      {[0.45, 0.72].map((k, i) => (
        <group key={i} position={[0, y0 + h * k, 0]}>
          <mesh material={m} castShadow><cylinderGeometry args={[0.1 - i * 0.01, 0.075, 0.035, 16]} /></mesh>
          <mesh material={m} position={[0, 0.035, 0]}><torusGeometry args={[0.095 - i * 0.01, 0.004, 4, 24]} /></mesh>
        </group>
      ))}
      <mesh material={m} position={[0, y0 + h * 0.86, 0]} castShadow><cylinderGeometry args={[0.04, 0.055, h * 0.12, 8]} /></mesh>
      <mesh material={m} position={[0, y0 + h * 0.98, 0]} castShadow><coneGeometry args={[0.05, h * 0.14, 8]} /></mesh>
      <mesh material={mats.gold} position={[0, y0 + h * 1.07, 0]}><cylinderGeometry args={[0.004, 0.004, 0.06, 6]} /></mesh>
      <mesh material={glow > 0.01 ? gm : mats.gold} position={[0, y0 + h * 1.1, 0]}><sphereGeometry args={[0.014, 10, 8]} /></mesh>
    </group>
  );
};

/** Older, slimmer minaret (Abbasid/Ottoman era) standing on the arcade roof. */
export const OldMinaret: React.FC<{ pos: [number, number]; base: number; rise: number; mats: ReturnType<typeof useMats> }> = ({ pos, base, rise, mats }) => {
  if (rise <= 0.002) return null;
  return (
    <group position={[pos[0], base, pos[1]]} scale={[1, Math.max(0.002, rise), 1]}>
      <mesh material={mats.warm} position={[0, 0.06, 0]} castShadow><boxGeometry args={[0.12, 0.12, 0.12]} /></mesh>
      <mesh material={mats.warm} position={[0, 0.42, 0]} castShadow><cylinderGeometry args={[0.035, 0.045, 0.62, 10]} /></mesh>
      <mesh material={mats.warm} position={[0, 0.62, 0]}><cylinderGeometry args={[0.06, 0.05, 0.02, 12]} /></mesh>
      <mesh material={mats.warm} position={[0, 0.8, 0]} castShadow><coneGeometry args={[0.035, 0.14, 10]} /></mesh>
    </group>
  );
};

// ---------- Ka'bah (rotated 45 deg: corners face N/E/S/W, door on the north-east face) ----------
function kiswahTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0c0c0e";
  g.fillRect(0, 0, 512, 512);
  // faint woven diamond lattice (geometric only, no script)
  g.strokeStyle = "rgba(255,255,255,0.035)";
  g.lineWidth = 2;
  for (let i = -512; i < 1024; i += 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 512, 512);
    g.stroke();
    g.beginPath();
    g.moveTo(i + 512, 0);
    g.lineTo(i, 512);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function bandTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c79b45";
  g.fillRect(0, 0, 1024, 64);
  g.fillStyle = "#e9c878";
  for (let x = 8; x < 1024; x += 48) {
    g.beginPath();
    g.moveTo(x, 32);
    g.lineTo(x + 16, 12);
    g.lineTo(x + 32, 32);
    g.lineTo(x + 16, 52);
    g.closePath();
    g.fill();
  }
  g.fillStyle = "#8d6a2a";
  g.fillRect(0, 0, 1024, 5);
  g.fillRect(0, 59, 1024, 5);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const Kabah: React.FC<{ mats: ReturnType<typeof useMats>; maqam?: number; hatim?: number }> = ({ mats, maqam = 1, hatim = 1 }) => {
  const cloth = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: kiswahTexture(), roughness: 0.66, sheen: 0.55, sheenRoughness: 0.5, sheenColor: new THREE.Color("#3a3a40") }), []);
  const band = useMemo(() => new THREE.MeshStandardMaterial({ map: bandTexture(), metalness: 0.7, roughness: 0.35, emissive: new THREE.Color("#4a3208"), emissiveIntensity: 0.35 }), []);
  const X = 0.29, Z = 0.32, H = 0.4;
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* shadharwan marble skirt */}
      <mesh material={mats.marble} position={[0, 0.012, 0]} receiveShadow castShadow><boxGeometry args={[X + 0.03, 0.024, Z + 0.03]} /></mesh>
      <mesh material={cloth} position={[0, H / 2 + 0.02, 0]} castShadow receiveShadow><boxGeometry args={[X, H, Z]} /></mesh>
      {/* gold band of the kiswah */}
      <mesh material={band} position={[0, 0.02 + H * 0.74, 0]}><boxGeometry args={[X + 0.004, 0.03, Z + 0.004]} /></mesh>
      {/* door on the north-east face (local +x), towards the east corner */}
      <mesh material={mats.gold} position={[X / 2 + 0.003, 0.02 + H * 0.36, Z * 0.18]}><boxGeometry args={[0.006, 0.13, 0.065]} /></mesh>
      {/* Hajar Aswad corner: silver frame at the east corner (local +x,+z) */}
      <mesh material={mats.marble} position={[X / 2, 0.11, Z / 2]}><cylinderGeometry args={[0.014, 0.014, 0.03, 12]} /></mesh>
      {/* Hijr Ismail (Hatim): semicircular low wall on the north-west face (local -z) */}
      {hatim > 0 && (
        <mesh material={mats.marble} position={[0, 0.03, -Z / 2 - 0.02]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.06, 32, 1, true, -Math.PI / 2, Math.PI]} />
        </mesh>
      )}
      {/* Maqam Ibrahim (glass + gold enclosure since 1967), facing the door */}
      {maqam > 0 && (
        <group position={[X / 2 + 0.2, 0, Z * 0.18]} scale={maqam}>
          <mesh material={mats.marble} position={[0, 0.012, 0]}><cylinderGeometry args={[0.035, 0.04, 0.024, 16]} /></mesh>
          <mesh material={mats.gold} position={[0, 0.05, 0]}><cylinderGeometry args={[0.026, 0.026, 0.05, 12]} /></mesh>
          <mesh material={mats.gold} position={[0, 0.085, 0]}><sphereGeometry args={[0.027, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
        </group>
      )}
    </group>
  );
};

/** Row of Ottoman domes on drums along a line; `drop` 0..1 lets them descend one by one. */
export const DomeRow: React.FC<{ from: [number, number]; to: [number, number]; y: number; r: number; mat: THREE.Material; finial?: THREE.Material; drop?: number; seed?: number }> = ({
  from, to, y, r, mat, finial, drop = 1, seed = 0,
}) => {
  const n = Math.max(2, Math.round(Math.hypot(to[0] - from[0], to[1] - from[1]) / (r * 2.3)));
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const k = (i + 0.5) / n;
        const order = ((i * 7 + seed * 3) % n) / n; // staggered arrival
        const d = Math.min(1, Math.max(0, (drop - order * 0.75) / 0.25));
        if (d <= 0.001) return null;
        const lift = (1 - d) * 0.9;
        return (
          <group key={i} position={[from[0] + (to[0] - from[0]) * k, y + lift, from[1] + (to[1] - from[1]) * k]} scale={0.6 + 0.4 * d}>
            <mesh material={mat} position={[0, r * 0.14, 0]} castShadow receiveShadow><cylinderGeometry args={[r * 0.92, r * 0.98, r * 0.28, 16]} /></mesh>
            <mesh material={mat} position={[0, r * 0.28, 0]} castShadow receiveShadow><sphereGeometry args={[r * 0.9, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
            {finial && <mesh material={finial} position={[0, r * 1.25, 0]}><cylinderGeometry args={[r * 0.04, r * 0.06, r * 0.22, 6]} /></mesh>}
          </group>
        );
      })}
    </>
  );
};

/** Courtyard-facing arcade wall: a panel with pointed-arch openings (one ExtrudeGeometry). */
export function arcadeWallGeometry(len: number, h: number, nArch: number, depth = 0.02) {
  const s = new THREE.Shape();
  s.moveTo(-len / 2, 0);
  s.lineTo(len / 2, 0);
  s.lineTo(len / 2, h);
  s.lineTo(-len / 2, h);
  s.lineTo(-len / 2, 0);
  const bay = len / nArch;
  const aw = bay * 0.62, ah = h * 0.62, spring = h * 0.42;
  for (let i = 0; i < nArch; i++) {
    const cx = -len / 2 + bay * (i + 0.5);
    const p = new THREE.Path();
    p.moveTo(cx - aw / 2, 0.004);
    p.lineTo(cx - aw / 2, spring);
    p.quadraticCurveTo(cx - aw / 2, spring + (ah - spring) * 0.75, cx, ah);
    p.quadraticCurveTo(cx + aw / 2, spring + (ah - spring) * 0.75, cx + aw / 2, spring);
    p.lineTo(cx + aw / 2, 0.004);
    p.lineTo(cx - aw / 2, 0.004);
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** 3D text label on a plane (canvas texture), drawn after the fonts are ready. */
export const Label3D: React.FC<{ text: string; sub?: string; pos: V3; rot?: V3; w: number; color?: string; bg?: string; opacity?: number; font?: string; billboard?: boolean }> = ({
  text, sub, pos, rot = [-Math.PI / 2, 0, 0], w, color = "#f4efe2", bg = "rgba(12,12,14,0.86)", opacity = 1, font = "Space Grotesk", billboard = false,
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const { camera, advance } = useThree();
  const pending = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (billboard && ref.current) ref.current.quaternion.copy(camera.quaternion);
  });
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const aspect = sub ? 3.2 : 4.6;
  useLayoutEffect(() => {
    const h = delayRender(`label ${text}`);
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive) return continueRender(h);
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = Math.round(1024 / aspect);
      const g = c.getContext("2d")!;
      g.fillStyle = bg;
      g.beginPath();
      g.roundRect(4, 4, c.width - 8, c.height - 8, 26);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.18)";
      g.lineWidth = 3;
      g.stroke();
      g.fillStyle = color;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `700 ${sub ? 96 : 120}px "${font}", sans-serif`;
      g.fillText(text, c.width / 2, sub ? c.height * 0.38 : c.height / 2);
      if (sub) {
        g.fillStyle = "rgba(244,239,226,0.72)";
        g.font = `500 56px "${font}", sans-serif`;
        g.fillText(sub, c.width / 2, c.height * 0.74);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      pending.current = h;
      setTex(t);
    });
    return () => {
      alive = false;
    };
  }, [text, sub, aspect, color, bg, font]);
  const mat = useMemo(() => (tex ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }) : null), [tex]);
  useLayoutEffect(() => {
    // the texture arrives after the frame was drawn (frameloop "never"): redraw, then release the frame
    if (!tex || pending.current === null) return;
    advance(performance.now());
    continueRender(pending.current);
    pending.current = null;
  }, [tex, advance]);
  if (!mat || opacity <= 0.01) return null;
  mat.opacity = opacity;
  return (
    <mesh ref={ref} material={mat} position={pos} rotation={billboard ? undefined : rot} renderOrder={3} layers={FX_LAYER}>
      <planeGeometry args={[w, w / aspect]} />
    </mesh>
  );
};
