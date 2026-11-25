// EP68 FOODFORGE food props: Parmigiano wheel (lathe, glazed rind), instanced racks, wedge, copper vat, stamps.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "../kits/feltcraft/core/motion";
import { C, mat } from "./parts.tsx";
import type { V3 } from "./timeline.ts";

export const WHEEL_R = 0.22;
export const WHEEL_H = 0.24;

/** Convex-sided wheel with rounded edges (not a plain cylinder). Radius 1 unit-ish, scaled by WHEEL_R/H. */
const wheelProfile = (segs: number) => {
  const pts: THREE.Vector2[] = [];
  const h = WHEEL_H / 2;
  const R = WHEEL_R;
  pts.push(new THREE.Vector2(0, -h));
  pts.push(new THREE.Vector2(R * 0.82, -h));
  // rounded bottom edge
  for (let i = 0; i <= 4; i++) {
    const a = -Math.PI / 2 + (i / 4) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R * 0.88 + Math.cos(a) * R * 0.08, -h + 0.03 + Math.sin(a) * 0.03));
  }
  // convex side
  for (let i = 1; i < segs; i++) {
    const v = i / segs;
    const y = -h + 0.03 + v * (WHEEL_H - 0.06);
    pts.push(new THREE.Vector2(R * 0.96 + Math.sin(v * Math.PI) * R * 0.04, y));
  }
  for (let i = 0; i <= 4; i++) {
    const a = (i / 4) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R * 0.88 + Math.cos(a) * R * 0.08, h - 0.03 + Math.sin(a) * 0.03));
  }
  pts.push(new THREE.Vector2(R * 0.82, h));
  pts.push(new THREE.Vector2(0, h + 0.004));
  return pts;
};
let GEO_HI: THREE.LatheGeometry | null = null;
let GEO_LO: THREE.LatheGeometry | null = null;
export const wheelGeo = (lo = false) => {
  if (lo) return (GEO_LO ??= new THREE.LatheGeometry(wheelProfile(5), 20));
  return (GEO_HI ??= new THREE.LatheGeometry(wheelProfile(14), 64));
};

/** Rind texture: speckled straw, darker caramel near the edges, generic dotted lettering band (no real mark). */
let RIND: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
const rindTextures = () => {
  if (RIND) return RIND;
  const W = 1024, H = 256;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#8E5520");
  grad.addColorStop(0.16, "#C98E3A");
  grad.addColorStop(0.5, "#E0AE52");
  grad.addColorStop(0.84, "#C98E3A");
  grad.addColorStop(1, "#8E5520");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  const rnd = mulberry32(68);
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(${rnd() > 0.5 ? "120,70,20" : "255,230,170"},${0.05 + rnd() * 0.12})`;
    g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 3, 1 + rnd() * 3);
  }
  // dotted lettering band (generic name only)
  const word = "PARMIGIANO REGGIANO · ";
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = 60;
  const tg = tmp.getContext("2d")!;
  tg.font = "bold 44px Arial Black, Arial, sans-serif";
  tg.fillStyle = "#000";
  let x = 0;
  while (x < W) {
    tg.fillText(word, x, 46);
    x += tg.measureText(word).width;
  }
  const data = tg.getImageData(0, 0, W, 60).data;
  g.fillStyle = "rgba(110,60,18,0.85)";
  for (let yy = 0; yy < 60; yy += 4) for (let xx = 0; xx < W; xx += 4) if (data[(yy * W + xx) * 4 + 3] > 120) {
    g.beginPath();
    g.arc(xx + 2, H * 0.5 - 30 + yy + 2, 1.5, 0, Math.PI * 2);
    g.fill();
  }
  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(cv);
  RIND = { map, bump };
  return RIND;
};
const matCache = new Map<string, THREE.Material>();
/** Glazed rind: clearcoat 0.9 (FOODFORGE memory), warm sheen. */
export const rindMat = (tint = "#FFFFFF") => {
  const hit = matCache.get(tint);
  if (hit) return hit;
  const { map, bump } = rindTextures();
  const m = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(tint), map, bumpMap: bump, bumpScale: 1.2, roughness: 0.42, clearcoat: 0.9, clearcoatRoughness: 0.25, sheen: 0.3, sheenColor: new THREE.Color("#FFD89A") });
  matCache.set(tint, m);
  return m;
};
export const pasteMat = () => {
  const hit = matCache.get("paste");
  if (hit) return hit;
  const m = new THREE.MeshPhysicalMaterial({ color: C.paste, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color("#FFF1C8") });
  matCache.set("paste", m);
  return m;
};

/** One hero wheel standing flat (axis up) or on its edge (`edge`). */
export const Wheel: React.FC<{ position?: V3; rotation?: V3; scale?: number; tint?: string; edge?: boolean; lo?: boolean }> = ({ position, rotation, scale = 1, tint, edge, lo }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh geometry={wheelGeo(lo)} material={rindMat(tint)} rotation={edge ? [Math.PI / 2, 0, 0] : [0, 0, 0]} position={[0, edge ? WHEEL_R : WHEEL_H / 2, 0]} castShadow receiveShadow />
  </group>
);

/** Thousands of wheels on shelves: InstancedMesh with ±6 % colour variation. */
export const WheelInstances: React.FC<{ items: { p: V3; s?: number; r?: number }[]; lo?: boolean; seed?: number; shadows?: boolean }> = ({ items, lo = true, seed = 1, shadows = false }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const rnd = mulberry32(seed);
    const col = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(it.p[0], it.p[1] + WHEEL_H / 2 * (it.s ?? 1), it.p[2]);
      o.rotation.set(0, it.r ?? rnd() * 6.28, 0);
      o.scale.setScalar(it.s ?? 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      const v = 0.94 + rnd() * 0.12;
      col.setRGB(v, v * (0.96 + rnd() * 0.06), v * (0.9 + rnd() * 0.1));
      m.setColorAt(i, col);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items, seed]);
  return <instancedMesh ref={ref} args={[wheelGeo(lo), rindMat(), items.length]} castShadow={shadows} receiveShadow frustumCulled={false} />;
};

/** Spruce maturing rack: posts + planks, wheels on each plank. Runs along x from 0 to `len`. */
export const Rack: React.FC<{ position?: V3; rotation?: number; len?: number; tiers?: number; gap?: number; depth?: number; seed?: number; fill?: number }> = ({ position, rotation = 0, len = 3, tiers = 4, gap = 0.36, depth = 0.5, seed = 1, fill = 1 }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: { p: V3; s?: number }[] = [];
    const n = Math.floor(len / (WHEEL_R * 2.15));
    for (let tI = 0; tI < tiers; tI++) for (let i = 0; i < n; i++) if (rnd() < fill) out.push({ p: [WHEEL_R * 1.1 + i * WHEEL_R * 2.15, 0.2 + tI * gap + 0.025, 0], s: 0.97 + rnd() * 0.06 });
    return out;
  }, [len, tiers, gap, seed, fill]);
  const plankMat = mat(C.woodHoney, 3, "wood");
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: tiers }, (_, i) => (
        <mesh key={i} position={[len / 2, 0.2 + i * gap, 0]} material={plankMat} receiveShadow castShadow>
          <boxGeometry args={[len, 0.05, depth]} />
        </mesh>
      ))}
      {Array.from({ length: Math.ceil(len / 1.2) + 1 }, (_, i) => (
        <mesh key={i} position={[Math.min(len, i * 1.2), (0.2 + tiers * gap) / 2, -depth / 2]} material={mat("#6B635C", 1, "metal")}>
          <boxGeometry args={[0.05, 0.2 + tiers * gap, 0.05]} />
        </mesh>
      ))}
      <WheelInstances items={items} seed={seed} shadows />
    </group>
  );
};

/** Open wedge (cut face pale paste with crystals), rind on the curved back. */
export const Wedge: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({ position, rotation, scale = 1 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(WHEEL_R, 0);
    s.absarc(0, 0, WHEEL_R, 0, 0.75, false);
    s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: WHEEL_H * 0.9, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 16 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const crystals = useMemo(() => {
    const rnd = mulberry32(9);
    return Array.from({ length: 26 }, () => {
      const a = rnd() * 0.7, r = rnd() * WHEEL_R * 0.85;
      return [Math.cos(a) * r, 0.02 + rnd() * WHEEL_H * 0.8, -Math.sin(a) * r] as V3;
    });
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} material={pasteMat()} castShadow receiveShadow />
      {crystals.map((p, i) => (
        <mesh key={i} position={p} scale={0.006}>
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color="#FFF6DA" roughness={0.1} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
};

/** Copper cauldron (lathe bell, metalness 1). */
export const CopperVat: React.FC<{ position?: V3; scale?: number }> = ({ position, scale = 1 }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const v = i / 16;
      pts.push(new THREE.Vector2(0.05 + Math.sin(v * Math.PI * 0.62) * 0.55, v * 0.75));
    }
    pts.push(new THREE.Vector2(0.53, 0.78));
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={C.copper} metalness={1} roughness={0.28} side={THREE.DoubleSide} />
      </mesh>
      {/* whey surface */}
      <mesh position={[0, 0.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.49, 40]} />
        <meshPhysicalMaterial color="#EFE6C8" roughness={0.25} clearcoat={0.6} />
      </mesh>
      {/* brick base */}
      <mesh position={[0, -0.12, 0]} material={mat(C.brick, 2, "stone")} receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.26, 24]} />
      </mesh>
    </group>
  );
};

// ---------- stamps / decals ----------
const decalCache = new Map<string, THREE.CanvasTexture>();
export const stampTexture = (text: string, color = "#B3261E", oval = false) => {
  const key = `${text}|${color}|${oval}`;
  const hit = decalCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 14;
  if (oval) {
    g.beginPath();
    g.ellipse(256, 128, 236, 112, 0, 0, Math.PI * 2);
    g.stroke();
  } else g.strokeRect(14, 30, 484, 196);
  let px = 110;
  g.font = `900 ${px}px Arial Black, Arial, sans-serif`;
  while (g.measureText(text).width > 430 && px > 30) {
    px -= 6;
    g.font = `900 ${px}px Arial Black, Arial, sans-serif`;
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 132);
  // worn ink: knock holes out
  const rnd = mulberry32(text.length * 7);
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 260; i++) g.fillRect(rnd() * 512, rnd() * 256, 2 + rnd() * 5, 2 + rnd() * 3);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  decalCache.set(key, tex);
  return tex;
};
/** Flat stamp plane that slams in (scale 1.6 → 1) at `at`. */
export const Stamp: React.FC<{ text: string; t: number; at: number; position: V3; rotation?: V3; w?: number; color?: string; oval?: boolean; glow?: number }> = ({ text, t, at, position, rotation, w = 0.5, color, oval, glow = 0 }) => {
  const st = Math.floor(t * 12) / 12;
  const x = Math.min(1, Math.max(0, (st - at) / 0.18));
  if (x <= 0) return null;
  const s = 1.6 - 0.6 * x;
  return (
    <mesh position={position} rotation={rotation} scale={[w * s, w * 0.5 * s, 1]} renderOrder={3}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={stampTexture(text, color, oval)} transparent opacity={x} depthWrite={false} polygonOffset polygonOffsetFactor={-4} emissive={glow > 0 ? "#FF7A2A" : "#000000"} emissiveMap={glow > 0 ? stampTexture(text, color, oval) : null} emissiveIntensity={glow} />
    </mesh>
  );
};

/** Cured ham leg (lathe teardrop, marbled pink + fat rim) and olive-oil bottle (green glass). */
export const Prosciutto: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({ position, rotation, scale = 1 }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const v = i / 20;
      const r = v < 0.7 ? Math.sin((v / 0.7) * Math.PI * 0.5) * 0.17 : 0.17 * (1 - (v - 0.7) / 0.3) * 0.75 + 0.03;
      pts.push(new THREE.Vector2(Math.max(0.005, r), v * 0.7));
    }
    return new THREE.LatheGeometry(pts, 36);
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color="#B9574D" roughness={0.45} clearcoat={0.5} sheen={0.5} sheenColor={new THREE.Color("#FFD3C4")} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 12]} />
        <meshStandardMaterial color="#EDE3D2" roughness={0.5} />
      </mesh>
    </group>
  );
};
export const OilBottle: React.FC<{ position?: V3; scale?: number }> = ({ position, scale = 1 }) => {
  const geo = useMemo(() => {
    const pts = [[0, 0], [0.08, 0], [0.085, 0.02], [0.085, 0.3], [0.06, 0.36], [0.03, 0.42], [0.03, 0.5], [0.0, 0.5]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 32);
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color="#5C7A1E" roughness={0.08} transmission={0.6} thickness={0.2} clearcoat={1} ior={1.5} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.087, 0.087, 0.11, 32, 1, true]} />
        <meshStandardMaterial color="#F3E6CC" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.05, 16]} />
        <meshStandardMaterial color="#C9A04A" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};
