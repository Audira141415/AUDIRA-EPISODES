// EP21 interior sets: the glass floor over water (hook), the Saba council hall at night (majelis),
// Sulaiman's marble hall where the throne lands and is disguised (samar), and the long glass corridor
// (kaca). The glass is a MeshPhysicalMaterial transmission slab over a moving water plane with fish,
// so it reads as "water" in the hook (G22). Each set sits at the origin; the film mounts one per segment.
// DRAFT s4 — not yet typechecked.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite, type SpriteMap } from "./pixel.tsx";
import { U, Ground, Fire, OilLamp, Backer, Spot, Walker, textTexture, grain, grainFine } from "./world.tsx";
import { BILQIS_BACK, BILQIS_LIFT, BILQIS_SEAT, BILQIS_WALK_A, BILQIS_WALK_B, NOBLE_FRONT, FISH_ORANGE, FISH_SILVER } from "./sprites.ts";
import { W, WL, ramp } from "./time.ts";

type V3 = [number, number, number];

/** Seeded ashlar floor: pale slabs with dark joints (map + bump). Used by SetsOut too. */
export function ashlarTex(seed: number, base: string, joint: string, rep = 6) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = joint;
  g.fillRect(0, 0, 512, 512);
  const r = prng(seed);
  const base3 = new THREE.Color(base);
  for (let y = 0; y < 8; y++) {
    const off = (y % 2) * 32;
    for (let x = -1; x < 8; x++) {
      const k = 0.86 + r() * 0.22;
      g.fillStyle = `rgb(${Math.round(base3.r * 255 * k)},${Math.round(base3.g * 255 * k)},${Math.round(base3.b * 255 * k)})`;
      g.fillRect(x * 64 + off + 2, y * 64 + 2, 60, 60);
      for (let n = 0; n < 14; n++) {
        g.fillStyle = `rgba(60,40,20,${0.05 + r() * 0.08})`;
        g.fillRect(x * 64 + off + r() * 60, y * 64 + r() * 60, 2 + r() * 5, 2 + r() * 5);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy = 8;
  return t;
}

const marbleFloor = ashlarTex(301, "#E8E0D2", "#9A8E7A", 8);
const councilFloor = ashlarTex(302, "#8A6A4A", "#3A2A1C", 9);

/** Tileable water normal map: integer-frequency sine waves, gradients written as RGB normals. */
function waterNormalTex(seed: number) {
  if (typeof document === "undefined") return null;
  const N = 256;
  const r = prng(seed);
  const waves = Array.from({ length: 7 }, () => ({ kx: Math.floor(r() * 6) - 3 || 1, ky: Math.floor(r() * 6) + 1, a: 0.4 + r(), p: r() * 6.28 }));
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const img = g.createImageData(N, N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let dx = 0, dy = 0;
      for (const w of waves) {
        const cs = Math.cos((2 * Math.PI * (w.kx * x + w.ky * y)) / N + w.p) * w.a;
        dx += cs * w.kx;
        dy += cs * w.ky;
      }
      const nx = -dx * 0.08, ny = -dy * 0.08;
      const l = Math.hypot(nx, ny, 1);
      const i = (y * N + x) * 4;
      img.data[i] = ((nx / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((ny / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const waterA = waterNormalTex(311);

const Wall: React.FC<{ pos: V3; size: V3; color?: string; rotY?: number }> = ({ pos, size, color = U.plaster, rotY = 0 }) => (
  <mesh position={[pos[0], pos[1] + size[1] / 2, pos[2]]} rotation={[0, rotY, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={0.02} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.8} />
  </mesh>
);

const Block: React.FC<{ pos: V3; size: V3; color: string }> = ({ pos, size, color }) => (
  <mesh position={[pos[0], pos[1] + size[1] / 2, pos[2]]} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={0.015} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.5} />
  </mesh>
);

/** Standing brazier (GLB) with a live flame and its warm light. */
const Brazier: React.FC<{ f: number; pos: V3; power?: number }> = ({ f, pos, power = 1 }) => (
  <group position={pos}>
    <AssetModel id="standing-brazier-c9e4ee" size={0.62} ground position={[0, 0, 0]} />
    <Fire f={f} pos={[0, 0.6, 0]} scale={0.8} power={power} />
  </group>
);

/** Marble column with a gilded base and capital. */
const MarbleColumn: React.FC<{ pos: V3; h?: number }> = ({ pos, h = 2.0 }) => (
  <group position={pos}>
    <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.36, 0.14, 0.36]} radius={0.02} />
      <meshPhysicalMaterial color="#D9A63A" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.12, 0.14, h, 24]} />
      <meshPhysicalMaterial color="#EFE9DE" roughness={0.25} clearcoat={0.6} bumpMap={grainFine} bumpScale={0.2} />
    </mesh>
    <mesh position={[0, h + 0.08, 0]} castShadow>
      <cylinderGeometry args={[0.24, 0.13, 0.16, 24]} />
      <meshPhysicalMaterial color="#D9A63A" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

/** Fish lying flat just above the water surface, swimming along x and wrapping inside [x0, x1]. */
const Fish: React.FC<{ t: number; seed: number; n: number; x: [number, number]; z: [number, number]; y: number }> = ({ t, seed, n, x, z, y }) => {
  const fish = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: n }, () => ({ x0: r(), z: z[0] + r() * (z[1] - z[0]), v: 0.05 + r() * 0.08, dir: r() > 0.5 ? 1 : -1, m: r() > 0.4 ? FISH_ORANGE : FISH_SILVER, ph: r() * 6 }));
  }, [seed, n, z[0], z[1]]);
  const w = x[1] - x[0];
  return (
    <group>
      {fish.map((fi, i) => {
        const k = (((fi.x0 * w + fi.dir * fi.v * t) % w) + w) % w;
        return (
          <group key={i} position={[x[0] + k, y, fi.z + 0.04 * Math.sin(t * 1.3 + fi.ph)]} rotation={[-Math.PI / 2, 0, 0]} scale={[fi.dir, 1, 1]}>
            <PixelSprite map={fi.m} px={0.018} />
          </group>
        );
      })}
    </group>
  );
};

/** Glass floor over water: opaque moving water at y -0.1, fish, a transmission glass slab at y 0 and
 *  thin gold seams. `lit` (0..1) lights the cross seams pane by pane along -z (corridor). */
export const GlassFloor: React.FC<{ t: number; f: number; w: number; z: [number, number]; lit?: number; seed?: number }> = ({ t, f, w, z, lit = 0, seed = 7 }) => {
  const d = z[0] - z[1];
  const cz = (z[0] + z[1]) / 2;
  if (waterA) {
    waterA.repeat.set(w * 1.2, d * 1.2);
    waterA.offset.set(f * 0.0011, f * 0.0017);
  }
  const pane = 0.8;
  const rows = Math.floor(d / pane);
  return (
    <group>
      <mesh position={[0, -0.2, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#0A2A36" roughness={1} />
      </mesh>
      <mesh position={[0, -0.1, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshPhysicalMaterial color="#2A9AB2" roughness={0.06} metalness={0.05} normalMap={waterA ?? undefined} normalScale={new THREE.Vector2(0.7, 0.7)} clearcoat={1} clearcoatRoughness={0.04} emissive="#0E5A70" emissiveIntensity={0.6} />
      </mesh>
      <Fish t={t} seed={seed} n={Math.round(w * d * 2.2)} x={[-w / 2 + 0.05, w / 2 - 0.05]} z={[z[1] + 0.1, z[0] - 0.1]} y={-0.085} />
      <mesh position={[0, -0.012, cz]}>
        <boxGeometry args={[w, 0.022, d]} />
        <meshPhysicalMaterial color="#EAF8FC" transmission={0.9} roughness={0.04} ior={1.5} thickness={0.05} clearcoat={1} clearcoatRoughness={0.02} metalness={0} />
      </mesh>
      {[-w / 2, 0, w / 2].map((x) => (
        <mesh key={x} position={[x, 0.002, cz]}>
          <boxGeometry args={[0.018, 0.006, d]} />
          <meshPhysicalMaterial color="#E0B04A" metalness={0.9} roughness={0.25} emissive="#FFB040" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => {
        const on = ramp(lit * (rows + 1), i, i + 1);
        return (
          <mesh key={i} position={[0, 0.002, z[0] - i * pane]}>
            <boxGeometry args={[w, 0.006, 0.018]} />
            <meshPhysicalMaterial color="#E0B04A" metalness={0.9} roughness={0.25} emissive="#FFC860" emissiveIntensity={0.15 + 2.2 * on} />
          </mesh>
        );
      })}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 + 0.8), -0.1, cz]} receiveShadow castShadow>
          <boxGeometry args={[1.6, 0.2, d]} />
          <meshPhysicalMaterial color="#E6DED0" map={marbleFloor ?? undefined} roughness={0.3} clearcoat={0.5} />
        </mesh>
      ))}
      <pointLight position={[0, 0.05, cz]} color="#6FD2E8" intensity={1.4} distance={Math.max(3, d * 0.6)} decay={1.3} />
    </group>
  );
};

// ---------------------------------------------------------------- GLASS HOOK
export const BILQIS_HOOK: V3 = [0, 0, -0.3];

export const GlassHookSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const map: SpriteMap = t >= W("menyingkap") + 0.05 ? BILQIS_LIFT : BILQIS_BACK;
  return (
    <group>
      <color attach="background" args={["#14202E"]} />
      <fog attach="fog" args={["#1C2A3A", 3.5, 10]} />
      <group position={[0, -0.35, 0]}><Ground color="#2A2A30" r={14} /></group>
      <GlassFloor t={t} f={f} w={1.9} z={[2.4, -4.2]} />
      {[-1.25, 1.25].map((x) => [1.2, -0.2, -1.6, -3.0].map((z) => <MarbleColumn key={`${x}${z}`} pos={[x, 0, z]} />))}
      <Wall pos={[0, 0, -4.4]} size={[4.0, 2.6, 0.25]} color="#E2D8C6" />
      <mesh position={[0, 0.95, -4.26]}>
        <planeGeometry args={[0.9, 1.6]} />
        <meshBasicMaterial color="#FFF1D2" toneMapped={false} />
      </mesh>
      {[[-1, 1.0], [1, 1.0], [-1, -1.2], [1, -1.2]].map(([s, z], i) => (
        <group key={i}>
          <Block pos={[s * 1.05, 0, z]} size={[0.14, 0.32, 0.14]} color="#D8CEBC" />
          <OilLamp f={f + i * 9} pos={[s * 1.05 - 0.07, 0.32, z]} power={0.8} />
        </group>
      ))}
      <PixelSprite map={map} px={0.036} position={BILQIS_HOOK} />
      <Backer pos={BILQIS_HOOK} w={0.36} h={0.56} opacity={0.12} />
      <Spot position={[0, 1.2, -4.1]} target={[0, 0, 0.5]} angle={0.7} penumbra={0.5} intensity={14} distance={10} decay={1.3} color="#FFE8C0" castShadow shadow-mapSize={[2048, 2048]} />
    </group>
  );
};

// ---------------------------------------------------------------- MAJELIS (council, night)
export const COUNCIL = { table: [0, 0, 0.3] as V3, top: 0.4, throne: [0, 0.18, -1.55] as V3, queen: [0, 0.4, -1.42] as V3 };
export const NOBLE_SLOTS: V3[] = [[-0.72, 0, -0.9], [-0.6, 0, -0.35], [-0.66, 0, 0.1], [0.72, 0, -0.9], [0.6, 0, -0.35], [0.66, 0, 0.1]];
export const letterOpen = (t: number) => ramp(t, W("dibuka") - 0.2, W("dibuka") + 0.5);

export const MajelisSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const open = letterOpen(t);
  const plaque = useMemo(() => textTexture("AUDIRA", { color: "#F2C35A", bg: "#2A1A10", border: "#C99A2E", font: "bold 128px 'MM Anton', Impact, sans-serif" }), []);
  const glow = ramp(t, WL("l11", "bilqis") - 0.3, WL("l11", "bilqis") + 0.4);
  return (
    <group>
      <color attach="background" args={["#0C0A14"]} />
      <fog attach="fog" args={["#1A1420", 3.2, 10]} />
      <Ground color="#7A5E44" map={councilFloor ?? undefined} bump={0.8} r={12} />
      <Wall pos={[0, 0, -2.3]} size={[4.4, 2.4, 0.25]} color="#8A6A4E" />
      <Wall pos={[-2.0, 0, -0.6]} size={[0.25, 2.4, 3.6]} color="#7A5C42" />
      <Wall pos={[2.0, 0, -0.6]} size={[0.25, 2.4, 3.6]} color="#7A5C42" />
      <mesh position={[0, 1.85, -2.16]}>
        <planeGeometry args={[0.8, 0.38]} />
        <meshStandardMaterial map={plaque ?? undefined} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* plain gold sun disc of Saba behind the throne (no script) */}
      <mesh position={[0, 1.35, -2.16]}>
        <circleGeometry args={[0.28, 40]} />
        <meshPhysicalMaterial color="#D9A63A" metalness={0.85} roughness={0.3} emissive="#7A4A10" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.006, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.0, 3.2]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#6E1A2A" bumpMap={grainFine} bumpScale={0.5} />
      </mesh>
      <Block pos={[0, 0, -1.55]} size={[1.1, 0.18, 0.75]} color="#B89A72" />
      {/* the queen's throne = the same gilded throne carried to Sulaiman later */}
      <AssetModel id="looted-gilded-throne-008fc3" size={0.72} ground position={COUNCIL.throne} />
      <PixelSprite map={BILQIS_SEAT} px={0.034} position={COUNCIL.queen} />
      <Spot position={[0, 2.6, -0.6]} target={[0, 0.3, -1.5]} angle={0.32} penumbra={0.6} intensity={18 + 14 * glow} distance={6} decay={1.3} color="#FFE2B0" castShadow shadow-mapSize={[2048, 2048]} />
      {NOBLE_SLOTS.map((p, i) => <PixelSprite key={i} map={NOBLE_FRONT[i % 4]} px={0.034} position={p} />)}
      {/* table with the sealed letter: plain wax seal, no script on any object */}
      <Block pos={COUNCIL.table} size={[0.9, COUNCIL.top, 0.5]} color="#5A3A22" />
      <group position={[0, COUNCIL.top + 0.012, COUNCIL.table[2]]}>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.12 + 0.88 * open, 1, 1]}>
          <planeGeometry args={[0.5, 0.3]} />
          <meshPhysicalMaterial {...POLISH.paper} color="#EADBB8" side={THREE.DoubleSide} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (0.03 + 0.22 * open), 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.32, 16]} />
            <meshPhysicalMaterial {...POLISH.paper} color="#D9C79E" />
          </mesh>
        ))}
        <mesh position={[0.02 + 0.2 * open, 0.03 - 0.02 * open, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.035, 20]} />
          <meshPhysicalMaterial color="#9A1E1A" roughness={0.4} clearcoat={0.6} />
        </mesh>
      </group>
      <Brazier f={f} pos={[-1.3, 0, -1.7]} power={0.9} />
      <Brazier f={f + 13} pos={[1.3, 0, -1.7]} power={0.9} />
      <Brazier f={f + 29} pos={[-1.35, 0, 0.75]} power={0.8} />
      <Brazier f={f + 41} pos={[1.35, 0, 0.75]} power={0.8} />
      <OilLamp f={f} pos={[0.35, COUNCIL.top, 0.42]} power={0.7} />
    </group>
  );
};

// ---------------------------------------------------------------- HALL (Sulaiman's marble hall, day)
export const THRONE_HALL: V3 = [0, 0.14, -1.0];
export function hallState(t: number) {
  const land = ramp(t, W("tiba", 2) - 0.1, W("tiba", 2) + 0.15);
  const flash = Math.max(0, 1 - Math.abs(t - W("tiba", 2)) / 0.45);
  const disguise = ramp(t, W("disamarkan") - 0.1, W("disamarkan") + 0.6);
  const gems = ramp(t, W("dicopot") - 0.1, W("dicopot") + 1.6);
  return { land, flash, disguise, gems };
}
export const BILQIS_HALL: V3 = [-0.25, 0, 0.15];

export const HallSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = hallState(t);
  const cloth = new THREE.Color("#8A1E34").lerp(new THREE.Color("#1E4A8A"), s.disguise);
  const gemList: { id: string; p: V3; drift: V3 }[] = [
    { id: "cut-ruby-3ded3a", p: [-0.16, 0.62, 0.06], drift: [-0.45, 0.55, 0.3] },
    { id: "cut-emerald-74d180", p: [0.16, 0.62, 0.06], drift: [0.5, 0.5, 0.25] },
    { id: "cut-ruby-3ded3a", p: [0, 0.74, 0.04], drift: [0.05, 0.7, 0.35] },
  ];
  return (
    <group>
      <color attach="background" args={["#1A1C26"]} />
      <fog attach="fog" args={["#2A2A34", 4, 12]} />
      <Ground color="#E2DACB" map={marbleFloor ?? undefined} bump={0.3} r={14} />
      {[-1.5, 1.5].map((x) => [1.0, -0.4, -1.8, -3.2].map((z) => <MarbleColumn key={`${x}${z}`} pos={[x, 0, z]} />))}
      <Wall pos={[0, 0, -3.8]} size={[4.4, 2.6, 0.25]} color="#E6DDCC" />
      <mesh position={[0, 1.0, -3.66]}>
        <planeGeometry args={[1.0, 1.7]} />
        <meshBasicMaterial color="#FFF1D2" toneMapped={false} />
      </mesh>
      <mesh position={[-1.25, 0.9, 0.55]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 1.8]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#7A1E1A" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.006, -0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.9, 3.6]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#2F5A4A" bumpMap={grainFine} bumpScale={0.4} />
      </mesh>
      <Block pos={[0, 0, -1.0]} size={[1.2, 0.14, 0.9]} color="#EDE6DA" />
      {s.land > 0.001 && (
        <group position={THRONE_HALL} scale={0.6 + 0.4 * s.land}>
          <AssetModel id="looted-gilded-throne-008fc3" size={0.72} ground position={[0, 0, 0]} />
          <mesh position={[0, 0.3, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.36, 0.3]} />
            <meshPhysicalMaterial {...POLISH.fabric} color={cloth} side={THREE.DoubleSide} />
          </mesh>
          {gemList.map((g, i) => {
            const k = s.gems;
            return <AssetModel key={i} id={g.id} size={0.09} position={[g.p[0] + g.drift[0] * k, g.p[1] + g.drift[1] * k, g.p[2] + g.drift[2] * k]} rotation={[k * 2 + i, k * 3, 0]} />;
          })}
        </group>
      )}
      {s.flash > 0.001 && (
        <>
          <pointLight position={[0, 0.8, -0.6]} color="#FFE6B0" intensity={4 * s.flash} distance={6} decay={1.2} />
          <mesh position={[0, 0.02, -1.0]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + (1 - s.flash) * 2}>
            <ringGeometry args={[0.45, 0.55, 48]} />
            <meshBasicMaterial color="#FFD890" transparent opacity={0.6 * s.flash} toneMapped={false} depthWrite={false} />
          </mesh>
        </>
      )}
      <Walker t={t} a={[-1.15, 0, 0.45]} b={BILQIS_HALL} t0={W("ditanya") - 0.8} t1={W("serupa") + 0.4} maps={[BILQIS_WALK_A, BILQIS_WALK_B]} stand={BILQIS_BACK} px={0.036} />
      <OilLamp f={f} pos={[-0.85, 0, 0.9]} power={0.7} />
      <OilLamp f={f + 7} pos={[0.85, 0, 0.9]} power={0.7} />
      <Spot position={[0.3, 3.0, 0.2]} target={[0, 0.2, -1.0]} angle={0.4} penumbra={0.6} intensity={26} distance={8} decay={1.3} color="#FFF0D0" castShadow shadow-mapSize={[2048, 2048]} />
    </group>
  );
};

// ---------------------------------------------------------------- GLASS CORRIDOR
export function corridorState(t: number) {
  const lit = ramp(t, W("masuk"), W("kaca") + 0.2);
  const lift = t >= W("menyingkap", 2) + 0.05 && t < W("kaca") + 0.3;
  return { lit, lift };
}
export const BILQIS_HALLWAY = { a: [0, 0, 0.5] as V3, b: [0, 0, -0.55] as V3 };

export const GlassWideSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = corridorState(t);
  const t0 = W("masuk") - 0.4;
  const t1 = W("menyingkap", 2) - 0.1;
  return (
    <group>
      <color attach="background" args={["#14202E"]} />
      <fog attach="fog" args={["#22344A", 4, 13]} />
      <group position={[0, -0.35, 0]}><Ground color="#2A2A30" r={20} /></group>
      <GlassFloor t={t} f={f} w={1.8} z={[2.4, -10]} lit={s.lit} seed={13} />
      {[-1.2, 1.2].map((x) => [1.4, 0, -1.4, -2.8, -4.2, -5.6, -7.0, -8.4].map((z) => <MarbleColumn key={`${x}${z}`} pos={[x, 0, z]} h={2.2} />))}
      <Wall pos={[0, 0, -10.2]} size={[4.0, 2.8, 0.25]} color="#E2D8C6" />
      <mesh position={[0, 1.0, -10.06]}>
        <planeGeometry args={[1.0, 1.8]} />
        <meshBasicMaterial color="#FFF1D2" toneMapped={false} />
      </mesh>
      {[[-1, 1.0], [1, 1.0], [-1, -1.6], [1, -1.6]].map(([sx, z], i) => (
        <group key={i}>
          <Block pos={[sx * 1.0, 0, z]} size={[0.14, 0.32, 0.14]} color="#D8CEBC" />
          <OilLamp f={f + i * 5} pos={[sx * 1.0 - 0.07, 0.32, z]} power={0.8} />
        </group>
      ))}
      {t > t0 && t < t1 ? (
        <Walker t={t} a={BILQIS_HALLWAY.a} b={BILQIS_HALLWAY.b} t0={t0} t1={t1} maps={[BILQIS_WALK_A, BILQIS_WALK_B]} stand={BILQIS_BACK} px={0.036} />
      ) : (
        <PixelSprite map={s.lift ? BILQIS_LIFT : BILQIS_BACK} px={0.036} position={t <= t0 ? BILQIS_HALLWAY.a : BILQIS_HALLWAY.b} />
      )}
      <Spot position={[0, 1.4, -9.8]} target={[0, 0, 0]} angle={0.5} penumbra={0.5} intensity={16} distance={14} decay={1.2} color="#FFE8C0" castShadow shadow-mapSize={[2048, 2048]} />
    </group>
  );
};
