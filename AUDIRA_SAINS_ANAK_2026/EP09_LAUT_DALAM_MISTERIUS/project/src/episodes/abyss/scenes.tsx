// EP09 Laut Dalam — one world + camera pose + light per scene (multi-scene director, see AbyssFilm.tsx).
// Every pose moves through its scene (push, orbit, truck, crane, descent); nothing is parked.
import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { FilmShot } from "../../core/scene/FilmScene.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { POLISH } from "../../core/polish/Polish.tsx";
import { ABYSS_PALETTE as P } from "../../kits/abyssforge/lib/palette";
import { mulberry32 } from "../../kits/abyssforge/core/motion";
import { ANGLER_POS, Lanternmaw3D } from "../../kits/abyssforge/scene/Lanternmaw3D";
import { Arrow, Earth, LabelPlate, Moon, StarSphere } from "./bodies.tsx";
import { GodRays, Glow, MarineSnow, Seabed, WaterFog, waterAt } from "./ocean.tsx";
import { depthAt, lerp, M2U, ramp, SCENES, type SceneId } from "./timeline.ts";

type V3 = [number, number, number];
export type SceneOut = { node: React.ReactNode; shot: FilmShot; bg: string };

const span = (id: SceneId) => SCENES.find((s) => s.id === id)!;
const prog = (t: number, id: SceneId) => {
  const s = span(id);
  return Math.min(1, Math.max(0, (t - s.start) / (s.end - s.start)));
};
const pop = (t: number, at: number, d = 0.45) => {
  const k = ramp(t, at, at + d);
  return k <= 0 ? 0.0001 : k + Math.sin(k * Math.PI) * 0.12;
};
const hex = (c: THREE.Color) => `#${c.getHexString()}`;
const swim = (t: number, ph: number, amp = 0.15) => Math.sin(t * 1.3 + ph) * amp;

/** Hull name plate so AUDIRA lives inside the world (anti-crop). */
const BrandPlate: React.FC<{ position: V3; rotation?: V3; width?: number }> = ({ position, rotation = [0, 0, 0], width = 1.6 }) => (
  <LabelPlate text="AUDIRA" sub="RISET LAUT" width={width} position={position} rotation={rotation} accent={P.hudCyan} />
);

/** Catalogue model centred on its own middle (ground centres x/z, then drop by half height). */
const Creature: React.FC<{ id: string; size: number; emissive?: string; emissiveIntensity?: number; polish?: "toyPlastic"; tint?: string; roughness?: number; metalness?: number }> = ({ size, ...p }) => (
  <group position={[0, -size * 0.45, 0]}>
    <AssetModel size={size} ground {...p} />
  </group>
);

// ── 1 hook: astronaut on the Moon, Earth in the black sky; camera rises to the blue planet ─────
const hook = (t: number): SceneOut => {
  const k1 = ramp(t, 0, 4.6);
  const k2 = ramp(t, 4.4, 10.8);
  const pos: V3 = [lerp(2.6, 1.2, k1) + lerp(0, -1.0, k2), lerp(1.3, 1.6, k1) + lerp(0, 1.6, k2), lerp(5.2, 4.2, k1) + lerp(0, 1.5, k2)];
  const target: V3 = [lerp(0.2, 0, k1) + lerp(0, -1.4, k2), lerp(1.0, 1.1, k1) + lerp(0, 6.6, k2), lerp(0, -4, k2)];
  return {
    node: (
      <group>
        <StarSphere radius={500} />
        <Moon radius={40} position={[0, -40, 0]} rotY={0.4} />
        <AssetModel id="astronaut-explorer-323482" size={1.8} ground position={[0, 0.02, 0]} rotation={[0, 1.15 + Math.sin(t * 0.8) * 0.08, 0]} />
        <AssetModel id="exploration-rover-7afd91" size={2.4} ground position={[-1.3, 0, -3.4]} rotation={[0, 0.6, 0]} />
        <Earth radius={3.0} position={[-3.2, 14.5, -24]} spin={t * 0.05} glow={0} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[8, 6, 4]} intensity={3.2} color="#FFF4E6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
        <directionalLight position={[-6, 2, -6]} intensity={0.35} color="#7EA6FF" />
      </group>
    ),
    shot: { pos, target, fov: 38 },
    bg: "#04060C",
  };
};

// ── 2 surface: AUDIRA research boat above, dolphin + turtle below; camera dives through the surface ──
const SurfacePlane: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(80, 80, 120, 120).rotateX(-Math.PI / 2), []);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, Math.sin(x * 0.6 + t * 1.4) * 0.06 + Math.sin(z * 0.8 - t * 1.1) * 0.05);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color="#1E7FA6" roughness={0.08} metalness={0.1} transmission={0} transparent opacity={0.78} side={THREE.DoubleSide} />
    </mesh>
  );
};

const surface = (t: number): SceneOut => {
  const k = prog(t, "surface");
  const dive = ramp(t, 11.3, 13.2);
  const below = dive > 0.5;
  const camY = lerp(2.4, -2.2, dive) - ramp(t, 13.2, 17.85) * 0.8;
  const water = waterAt(lerp(0, 120, ramp(t, 12.5, 17.85)));
  return {
    node: (
      <group>
        <SurfacePlane t={t} />
        <group position={[0.3, 0.05 + Math.sin(t * 1.2) * 0.05, -3]} rotation={[Math.sin(t * 0.9) * 0.03, -0.5, 0]}>
          <AssetModel id="small-fishing-boat-4ac0e3" size={4.2} ground position={[0, -0.6, 0]} />
          <BrandPlate position={[0.2, 0.45, 1.05]} width={1.4} />
        </group>
        <group position={[lerp(-3.5, 3.0, k), -2.4 + swim(t, 0, 0.3), -3.5]} rotation={[0, Math.PI / 2, Math.sin(t * 2) * 0.1]}>
          <Creature id="dolphin-base" size={2.2} />
        </group>
        <group position={[lerp(2.8, 0.6, k), -4.4 + swim(t, 2), -4.2]} rotation={[0.1, -Math.PI / 2.4, 0]}>
          <Creature id="sea-turtle-base" size={1.6} />
        </group>
        <GodRays t={t} y={0} strength={below ? 1 : 0} />
        {below && <MarineSnow t={t} center={[0, camY, 0]} count={500} spread={9} />}
        {below && <WaterFog color={water} density={0.07} />}
        <ambientLight intensity={0.25} />
        <hemisphereLight args={["#9FD9F0", "#0A2A3C", 0.9]} />
        <directionalLight position={[3, 10, 4]} intensity={2.6} color="#E8F7FF" />
      </group>
    ),
    shot: { pos: [lerp(-0.8, 0.8, k), camY, lerp(6.2, 5.4, k)], target: [0.2, lerp(0.2, -2.4, dive), -2.2], fov: 42 },
    bg: below ? hex(water) : "#8FC8E6",
  };
};

// ── 3 zones: continuous descent; creatures placed at their real depth band ──────────────────────
const ZONE_LIFE: { id: string; m: number; x: number; z: number; size: number; ry: number; glow?: string }[] = [
  { id: "reef-shark-base", m: 420, x: 0.8, z: -3.2, size: 3.0, ry: -1.2 },
  { id: "stingray-base", m: 750, x: -1.6, z: -3.6, size: 2.2, ry: 0.6 },
  { id: "moon-jellyfish-0fa43c", m: 1500, x: 1.1, z: -2.4, size: 1.5, ry: 0, glow: P.lumenCyan },
  { id: "jellyfish-base", m: 2400, x: -1.2, z: -2.8, size: 1.4, ry: 0, glow: P.lumenMagenta },
  { id: "moon-jellyfish-0fa43c", m: 3400, x: 1.4, z: -3.4, size: 1.2, ry: 1, glow: P.lumenViolet },
  { id: "octopus-base", m: 5000, x: -1.0, z: -3.0, size: 1.8, ry: 0.6 },
];

const WALLS: { id: string; size: number; pos: V3; ry: number; tint: string }[] = Array.from({ length: 12 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  const y = -19.5 - Math.floor(i / 2) * 3.4;
  return { id: i % 4 < 2 ? "lava-rock-pile-d56d19" : "aquascape-rock-arch-48bf5e", size: 4.2 + (i % 3) * 0.6, pos: [side * (1.9 + (i % 3) * 0.25), y, -4.6 - (i % 2) * 0.5], ry: i * 1.3, tint: i % 2 ? "#7890A6" : "#667E94" };
});

const zones = (t: number): SceneOut => {
  const m = depthAt(t);
  const camY = -m * M2U;
  const water = waterAt(m);
  const sun = 1 - ramp(m, 60, 900) * 1;
  return {
    node: (
      <group>
        <GodRays t={t} y={0} strength={sun} />
        {ZONE_LIFE.map((c, i) => {
          const y = -c.m * M2U;
          const lit = c.glow ? 0.5 + 0.5 * Math.sin(t * 2.1 + i) : 0;
          return (
            <group key={i} position={[c.x + swim(t, i, 0.2), y + swim(t, i + 1, 0.15), c.z]} rotation={[0, c.ry + t * 0.15, 0]}>
              <Creature id={c.id} size={c.size} emissive={c.glow} emissiveIntensity={c.glow ? 1.4 + lit : 0} />
              {c.glow && <Glow color={c.glow} r={0.12} position={[0, 0.2, 0]} intensity={0.6 + lit * 0.4} halo={10} />}
            </group>
          );
        })}
        {/* abyssal + hadal trench walls the camera sinks between */}
        {WALLS.map((w, i) => (
          <AssetModel key={i} id={w.id} size={w.size} ground position={w.pos} rotation={[0, w.ry, 0]} tint={w.tint} />
        ))}
        <Glow color={P.lumenCyan} r={0.06} position={[-1.8, -4250 * M2U, -2.0]} intensity={0.8} halo={8} />
        <MarineSnow t={t} center={[0, camY, -1]} count={1100} plankton={m > 900 ? 160 : 0} spread={8} />
        <WaterFog color={water} density={0.07 + ramp(m, 200, 4000) * 0.05} />
        <ambientLight intensity={0.16 + sun * 0.25} />
        <hemisphereLight args={["#2B6E95", "#020509", 0.3 + sun * 0.5]} />
        <directionalLight position={[2, camY + 12, 3]} intensity={0.1 + sun * 2.2} color={P.godRay} />
        {/* the camera carries a faint dive lamp so the deep stays readable */}
        <pointLight position={[0.4, camY + 0.4, 1.0]} intensity={9 * ramp(m, 600, 1200)} distance={18} color="#BFE8FF" />
      </group>
    ),
    shot: { pos: [Math.sin(t * 0.25) * 0.6, camY + 0.3, 4.6], target: [0, camY - 0.6, -2.6], fov: 44 },
    bg: hex(water),
  };
};

// ── 4 pressure: one-person submarine squeezed by arrows from every side ─────────────────────────
const pressure = (t: number): SceneOut => {
  const k = prog(t, "pressure");
  const a = lerp(-0.3, 0.3, k);
  const d = lerp(10.5, 9.0, k);
  const squeeze = ramp(t, 35.9, 38.8);
  const arrows = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  const water = waterAt(5000);
  return {
    node: (
      <group>
        <group position={[0, Math.sin(t * 0.8) * 0.08, 0]} rotation={[0, -0.6, 0]}>
          <Creature id="one-person-submarine-0b9d14" size={3.0} roughness={0.28} metalness={0.55} />
          <BrandPlate position={[0, 1.25, 0.2]} width={1.1} />
          <Glow color="#FFE9B0" r={0.1} position={[1.6, 0.1, 0]} intensity={1} halo={8} />
        </group>
        {arrows.map((ang, i) => {
          const r = lerp(4.0, 2.6, squeeze) + Math.sin(t * 3 + i) * 0.06;
          const len = lerp(0.6, 1.3, squeeze);
          const y = ((i % 3) - 1) * 0.9;
          return (
            <group key={i} position={[Math.cos(ang) * r, Math.sin(ang) * r * 1.25 + y * 0, 0.6]} rotation={[0, 0, ang + Math.PI]} scale={pop(t, 35.0 + i * 0.12)}>
              <Arrow length={len} color={P.hudAmber} thickness={0.09} />
            </group>
          );
        })}
        <MarineSnow t={t} center={[0, 0, 0]} count={700} plankton={60} spread={10} />
        <WaterFog color={water} density={0.08} />
        <ambientLight intensity={0.25} />
        <hemisphereLight args={["#2B5E85", "#020509", 0.6]} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} color="#A8D8FF" />
        <pointLight position={[-3, 2, 3]} intensity={6} distance={12} color={P.lumenCyan} />
      </group>
    ),
    shot: { pos: [Math.sin(a) * d, 1.0 + k * 0.5, Math.cos(a) * d], target: [0, 0, 0], fov: 40 },
    bg: hex(water),
  };
};

// ── 5 trench: cross-section of the Mariana Trench, Everest lowered inside ───────────────────────
const TRENCH_DEPTH = 10.935; // world units = km
const EVEREST = 8.849;
const trenchShape = () => {
  const rnd = mulberry32(9301);
  const pts: [number, number][] = [];
  const prof: [number, number][] = [
    [-18, -4.2],
    [-11, -5.0],
    [-6.5, -6.4],
    [-4.2, -8.6],
    [-2.4, -10.3],
    [-1.0, -TRENCH_DEPTH],
    [1.0, -TRENCH_DEPTH],
    [2.6, -9.8],
    [4.8, -7.4],
    [8, -5.6],
    [12, -3.6],
    [18, -4.0],
  ];
  for (let i = 0; i < prof.length - 1; i++) {
    const [x0, y0] = prof[i];
    const [x1, y1] = prof[i + 1];
    for (let s = 0; s < 6; s++) {
      const k = s / 6;
      const jag = s === 0 || (y0 === -TRENCH_DEPTH && y1 === -TRENCH_DEPTH) ? 0 : (rnd() - 0.5) * 0.35;
      pts.push([lerp(x0, x1, k), lerp(y0, y1, k) + jag]);
    }
  }
  pts.push(prof[prof.length - 1]);
  const shape = new THREE.Shape();
  shape.moveTo(-18, -16);
  pts.forEach(([x, y]) => shape.lineTo(x, y));
  shape.lineTo(18, -16);
  shape.lineTo(-18, -16);
  return new THREE.ExtrudeGeometry(shape, { depth: 6, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.15, bevelSegments: 2 });
};

/** Everest stand-in: jagged ridged cone with rock and snow vertex colours (height h, base at y = 0). */
let mountGeo: THREE.BufferGeometry | null = null;
const mountainGeo = (h: number) => {
  if (mountGeo) return mountGeo;
  const g = new THREE.ConeGeometry(h * 0.62, h, 64, 40);
  g.translate(0, h / 2, 0);
  const rnd = mulberry32(9311);
  const ridges = Array.from({ length: 7 }, () => ({ a: rnd() * Math.PI * 2, w: 0.25 + rnd() * 0.35, d: 0.08 + rnd() * 0.12 }));
  const pos = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const rock = new THREE.Color("#5E5A57");
  const dark = new THREE.Color("#3A3836");
  const snow = new THREE.Color("#F2F6FA");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const a = Math.atan2(z, x);
    const k = y / h;
    let f = 1;
    for (const rd of ridges) f += Math.exp(-((((a - rd.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI) ** 2) / (rd.w * rd.w)) * rd.d;
    f += Math.sin(a * 9 + y * 2.3) * 0.04 + Math.sin(y * 5.1 + a * 3) * 0.03;
    const sc = r > 1e-4 ? f : 1;
    pos.setXYZ(i, x * sc, y + (k > 0.98 ? 0 : Math.sin(a * 5) * 0.08 * (1 - k)), z * sc);
    const snowK = Math.min(1, Math.max(0, (k - 0.62 + Math.sin(a * 6) * 0.05) / 0.08));
    const c = rock.clone().lerp(dark, Math.max(0, Math.sin(a * 11 + y)) * 0.5).lerp(snow, snowK);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return (mountGeo = g);
};

let trenchGeo: THREE.ExtrudeGeometry | null = null;
const trench = (t: number): SceneOut => {
  const k = prog(t, "trench");
  const geo = (trenchGeo ??= trenchShape());
  const drop = ramp(t, 44.9, 47.6);
  const baseY = lerp(1.5, -TRENCH_DEPTH, drop);
  const gap = ramp(t, 47.6, 48.4);
  return {
    node: (
      <group>
        <mesh geometry={geo} position={[0, 0, -4]} receiveShadow castShadow>
          <meshPhysicalMaterial {...POLISH.stone} color="#56606B" roughness={0.9} />
        </mesh>
        {/* sea surface line */}
        <mesh position={[0, 0, -1]}>
          <boxGeometry args={[40, 0.06, 6.5]} />
          <meshBasicMaterial color="#7FE3FF" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.02, -1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 6.5]} />
          <meshBasicMaterial color="#2FA8D0" transparent opacity={0.25} />
        </mesh>
        <LabelPlate text="PERMUKAAN" width={2.4} position={[-6.2, 0.9, 0]} accent={P.hudCyan} />
        {/* Everest lowered in */}
        {drop > 0.001 && (
          <group position={[0, baseY, -1]}>
            <mesh geometry={mountainGeo(EVEREST)} castShadow receiveShadow>
              <meshPhysicalMaterial vertexColors roughness={0.85} flatShading />
            </mesh>
          </group>
        )}
        {/* gap marker between peak top and surface */}
        <group scale={gap > 0.01 ? 1 : 0.0001}>
          <Arrow length={(TRENCH_DEPTH - EVEREST) * gap} position={[2.2, -TRENCH_DEPTH + EVEREST, 0.5]} rotation={[0, 0, Math.PI / 2]} color={P.hudAmber} thickness={0.06} />
        </group>
        {/* tiny submarine at the bottom, for scale of light */}
        <group position={[-0.4, -TRENCH_DEPTH + 0.35, 0.6]} scale={0.6}>
          <Creature id="one-person-submarine-0b9d14" size={1} />
          <Glow color="#FFE9B0" r={0.05} position={[0.5, 0, 0]} intensity={1} halo={8} />
        </group>
        <MarineSnow t={t} center={[0, -5, 2]} count={500} spread={14} size={1.6} />
        <ambientLight intensity={0.25} />
        <hemisphereLight args={["#7CC4E8", "#0B2030", 1.3]} />
        <directionalLight position={[6, 12, 10]} intensity={2.0} color="#CFEFFF" castShadow />
      </group>
    ),
    shot: { pos: [lerp(-1.5, 1.5, k), lerp(-4.0, -5.2, k), lerp(20, 23, k)], target: [0, lerp(-4.8, -5.4, k), -1], fov: 34 },
    bg: "#082236",
  };
};

// ── 6 mapping: satellite light stops at the surface; ship sonar paints the seabed map ───────────
const Mapped: React.FC<{ reveal: number }> = ({ reveal }) => {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  plane.constant = reveal;
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(P.hudCyan).multiplyScalar(1.4), wireframe: true, transparent: true, opacity: 0.55, clippingPlanes: [plane] }),
    [plane],
  );
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(24, 8, 48, 16);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return <mesh geometry={geo} material={mat} position={[0, -6.75, -1.5]} />;
};

const mapping = (t: number): SceneOut => {
  const k = prog(t, "mapping");
  const boatX = lerp(-6, 4, ramp(t, 59.5, 67.9));
  const beam = ramp(t, 55.2, 56.2) * (1 - ramp(t, 59.6, 60.4));
  const sonar = ramp(t, 60.6, 61.2);
  const ping = ((t * 1.4) % 1 + 1) % 1;
  const tilt = ramp(t, 59.3, 61.5);
  const water = waterAt(400);
  return {
    node: (
      <group>
        {/* satellite above, beam dies at the surface */}
        <group position={[-2.5, 7.2, -2]} rotation={[0.2, t * 0.1, 0.1]}>
          <Creature id="comm-satellite-fdc2cd" size={2.2} roughness={0.28} metalness={0.55} />
        </group>
        <mesh position={[-2.5, 3.6, -2]}>
          <cylinderGeometry args={[0.12, 0.9, 7.2, 24, 1, true]} />
          <meshBasicMaterial color="#FFE27A" transparent opacity={0.35 * beam} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-2.5, 0.03, -2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 32]} />
          <meshBasicMaterial color="#FFE27A" transparent opacity={0.5 * beam} />
        </mesh>
        {/* surface */}
        <mesh position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 12]} />
          <meshPhysicalMaterial color="#1E7FA6" roughness={0.1} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        {/* survey ship + sonar fan */}
        <group position={[boatX, 0.05 + Math.sin(t * 1.2) * 0.04, -1.5]} rotation={[0, Math.PI / 2, 0]}>
          <AssetModel id="small-fishing-boat-4ac0e3" size={3.2} ground position={[0, -0.5, 0]} />
          <BrandPlate position={[0.9, 0.35, 0]} rotation={[0, Math.PI / 2, 0]} width={1.2} />
        </group>
        <group position={[boatX, -0.4, -1.5]} scale={[1, sonar, 1]}>
          <mesh position={[0, -3.1, 0]}>
            <coneGeometry args={[3.2, 6.2, 40, 1, true]} />
            <meshBasicMaterial color={P.lumenCyan} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -ping * 6.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[ping * 3.1, ping * 3.1 + 0.08, 48]} />
            <meshBasicMaterial color={P.lumenCyan} transparent opacity={0.8 * (1 - ping)} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <Seabed y={-7.2} size={30} seed={9401} color="#26313B" />
        {sonar > 0 && <Mapped reveal={boatX} />}
        <MarineSnow t={t} center={[0, -3, 0]} count={450} spread={12} />
        <WaterFog color={water} density={0.035} />
        <ambientLight intensity={0.3} />
        <hemisphereLight args={["#7FC8F0", "#04101A", 0.8]} />
        <directionalLight position={[3, 10, 6]} intensity={1.8} color="#DDF3FF" />
      </group>
    ),
    shot: {
      pos: [lerp(-1.2, boatX + 1.5, tilt), lerp(3.6, -2.2, tilt), lerp(14, 12, tilt)],
      target: [lerp(-1.5, boatX, tilt), lerp(2.4, -3.8, tilt), -1.5],
      fov: 40 + k * 0,
    },
    bg: "#081C2C",
  };
};

// ── 7 glow: anglerfish lure ignites, the dark fills with living light ───────────────────────────
const GLOW_LIFE: { id: string; pos: V3; size: number; c: string; at: number }[] = [
  { id: "moon-jellyfish-0fa43c", pos: [-2.6, -0.8, -2.5], size: 1.3, c: P.lumenMagenta, at: 70.6 },
  { id: "jellyfish-base", pos: [2.1, 2.0, -3.2], size: 1.2, c: P.lumenCyan, at: 71.2 },
  { id: "moon-jellyfish-0fa43c", pos: [1.8, -1.6, -2.2], size: 0.9, c: P.lumenViolet, at: 71.8 },
  { id: "octopus-base", pos: [-2.2, -1.8, -3.6], size: 1.6, c: P.lumenCyan, at: 72.4 },
];

const glow = (t: number): SceneOut => {
  const k = prog(t, "glow");
    return {
    node: (
      <group>
        {/* kit anglerfish ("lanternmaw"); its lure ignites at kit-time 8.6 s = film 69.4 s */}
        <group position={[-ANGLER_POS[0], -ANGLER_POS[1], -ANGLER_POS[2]]}>
          <Lanternmaw3D t={t - 59.7} />
        </group>
        {GLOW_LIFE.map((c, i) => {
          const on = ramp(t, c.at, c.at + 0.5);
          const p = 0.6 + 0.4 * Math.sin(t * 2 + i);
          return (
            <group key={i} position={[c.pos[0] + swim(t, i, 0.2), c.pos[1] + swim(t, i + 2, 0.2), c.pos[2]]} rotation={[0, t * 0.2 + i, 0]}>
              <Creature id={c.id} size={c.size} emissive={c.c} emissiveIntensity={0.1 + on * 1.8 * p} />
              <Glow color={c.c} r={0.1} position={[0, 0.2, 0]} intensity={on * p} halo={10} />
            </group>
          );
        })}
        <MarineSnow t={t} center={[0, 0, -1]} count={600} plankton={ramp(t, 70.6, 72) > 0 ? 260 : 0} spread={9} />
        <WaterFog color="#010409" density={0.09} />
        <ambientLight intensity={0.16} />
        <hemisphereLight args={["#1E5272", "#000000", 0.55]} />
        <pointLight position={[2.5, 2.5, 4]} intensity={5} distance={14} color="#6FB8E0" />
      </group>
    ),
    shot: { pos: [lerp(2.4, 1.4, k), lerp(1.6, 1.4, k), lerp(10.5, 8.2, k)], target: [lerp(-0.2, -0.4, k), lerp(1.0, 1.3, k), 0], fov: 42 },
    bg: "#010409",
  };
};

// ── 8 outro: submarine climbs back toward the light ─────────────────────────────────────────────
const outro = (t: number): SceneOut => {
  const k = ramp(t, 76.8, 84.2);
  const m = lerp(2600, 40, k);
  const water = waterAt(m);
  const subY = lerp(-3.0, 1.0, k);
  return {
    node: (
      <group>
        <GodRays t={t} y={6} strength={ramp(m, 1200, 150) * 1.2} count={9} />
        <group position={[0, subY + Math.sin(t) * 0.05, 0]} rotation={[0.35, -0.4, 0]}>
          <Creature id="one-person-submarine-0b9d14" size={3.0} roughness={0.28} metalness={0.55} />
          <BrandPlate position={[0, 1.15, 0.2]} width={1.0} />
          <Glow color="#FFE9B0" r={0.09} position={[1.4, 0.1, 0]} intensity={1} halo={8} />
        </group>
        <group position={[-2.2, subY - 1.6, -2.6]}>
          <Creature id="moon-jellyfish-0fa43c" size={1.0} emissive={P.lumenCyan} emissiveIntensity={1.4} />
        </group>
        <MarineSnow t={t} center={[0, subY, 0]} count={700} plankton={80} spread={9} />
        <WaterFog color={water} density={0.07} />
        <ambientLight intensity={0.1 + k * 0.3} />
        <hemisphereLight args={["#7FC8F0", "#020509", 0.2 + k * 0.8]} />
        <directionalLight position={[2, 12, 3]} intensity={0.3 + k * 2.2} color={P.godRay} />
      </group>
    ),
    shot: { pos: [lerp(3.6, 2.4, k), subY - 1.2, lerp(6.6, 5.6, k)], target: [0, subY + 0.6, 0], fov: 42 },
    bg: hex(water),
  };
};

export const SCENE_FN: Record<SceneId, (t: number) => SceneOut> = { hook, surface, zones, pressure, trench, mapping, glow, outro };
