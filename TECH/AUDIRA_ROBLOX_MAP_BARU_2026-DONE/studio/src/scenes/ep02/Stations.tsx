// EP02 film stations: the gallery grows to the right of the cover sculpture.
//   C (x=16)  race plinth: old aluminium bars, a new orange bar overtakes them (l03)
//   D (x=30)  two acrylic columns fill with blocky "players" to 20 juta (l04)
//   E (x=44)  DevEx console + brass coin stacks 1,7 and 5 miliar dolar (l05-l06)
//   tray      a small map the avatar builds in front of the main plinth (l12)
//   plaque42  "> 42.000 KREATOR DEVEX" next to the median coin (l09)
// All values come in as 0..1 progress from Film.tsx (anchored to word times).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { DATAPHYSICAL_PALETTE as P } from "../../kits/dataphysical/lib/palette.ts";
import { BlockAvatar } from "../_shared/BlockAvatar.tsx";
import { Alu, Bar, Brass, Tag, PLINTH_TOP, COIN } from "./Hook.tsx";
import { plaque, walnutTexture, wallTexture } from "./textures.ts";

type V3 = [number, number, number];
const BRASS_BASE = "#C9A66C";
const INK = "#2A1B10";

export const STATION = { C: 16, D: 30, E: 44 } as const;

const ease = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return x * x * (3 - 2 * x);
};

/** Spot with its own target (kept in the scene so its matrix updates). */
const Spot: React.FC<{ pos: V3; at: V3; intensity?: number }> = ({ pos, at, intensity = 1400 }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={target} position={at} />
      <spotLight
        position={pos}
        target={target}
        intensity={intensity}
        angle={0.42}
        penumbra={0.75}
        decay={2}
        color="#FFF0D8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0003}
        shadow-radius={5}
      />
    </>
  );
};

const Plinth: React.FC<{ x: number; w: number; d?: number; z?: number }> = ({ x, w, d = 4.4, z = -1 }) => {
  const wood = useMemo(() => {
    const t = walnutTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(w / 10, 0.6);
    t.needsUpdate = true;
    return t;
  }, [w]);
  const grain = useSurfaceGrain(31, 0.2, 4);
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, PLINTH_TOP / 2, 0]}>
        <RoundedBoxGeo args={[w, PLINTH_TOP, d]} radius={0.08} segments={3} />
        <meshPhysicalMaterial map={wood} roughness={0.5} roughnessMap={grain} clearcoat={0.55} clearcoatRoughness={0.28} />
      </mesh>
      <mesh castShadow position={[0, PLINTH_TOP - 0.06, d / 2 + 0.02]}>
        <RoundedBoxGeo args={[w - 0.4, 0.1, 0.06]} radius={0.02} />
        <Brass grain={grain} />
      </mesh>
    </group>
  );
};

/** Tag that scales in (0..1). */
const PopTag: React.FC<{ k: number; pos: V3; size: [number, number]; tex: THREE.Texture; tilt?: number; acrylic?: boolean }> = ({ k, pos, size, tex, tilt, acrylic }) =>
  k > 0.001 ? (
    <group position={pos} scale={ease(k)}>
      <Tag pos={[0, 0, 0]} size={size} tex={tex} tilt={tilt} acrylic={acrylic} />
    </group>
  ) : null;

// ---------- gallery extension (wall + floor to the right of the cover set) ----------
export const GalleryExtension: React.FC = () => (
  <>
    <mesh position={[58, 12, -14]} receiveShadow>
      <planeGeometry args={[60, 40]} />
      <meshStandardMaterial map={wallTexture()} roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshPhysicalMaterial color="#1E1F22" roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.4} />
    </mesh>
    {/* warm halos on the wall behind each station */}
    {[STATION.C, STATION.D, STATION.E].map((x) => (
      <pointLight key={x} position={[x + 1.5, 11, -9]} intensity={90} distance={30} decay={2} color="#FFB070" />
    ))}
    {/* dim far plinths between stations for depth */}
    {(
      [
        [23, -9, 2.2, 2.4, 1.8],
        [37, -8.5, 1.6, 2.2, 1.8],
        [51, -9, 2.6, 2.6, 2.0],
      ] as [number, number, number, number, number][]
    ).map(([x, z, h, w, d], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <RoundedBoxGeo args={[w, h, d]} radius={0.05} />
          <meshPhysicalMaterial color="#2A1B14" roughness={0.55} clearcoat={0.4} />
        </mesh>
        <mesh castShadow position={[0, h + 1.1, 0]}>
          <RoundedBoxGeo args={[0.6, 2.2, 0.6]} radius={0.04} />
          <meshPhysicalMaterial color={P.machinedAluminum} metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    ))}
  </>
);

// ---------- C: race (l03) ----------
export const RaceStation: React.FC<{ rise: number; lamaTag: number; newTag: number; nameTag: number; breakoutTag: number }> = ({
  rise,
  lamaTag,
  newTag,
  nameTag,
  breakoutTag,
}) => {
  const grain = useSurfaceGrain(41, 0.22, 3);
  const x0 = STATION.C;
  const old = [4.0, 4.6, 5.2, 5.8];
  const hNew = 0.5 + (6.6 - 0.5) * rise;
  const lama = plaque("ep02-lama", 768, 160, BRASS_BASE, INK, [{ text: "GAME LAMA", size: 104, font: "display", track: 10 }], 21);
  const baru = plaque("ep02-mapbaru", 512, 160, "#1D1E21", "#FF7A3D", [{ text: "MAP BARU", size: 100, font: "display", track: 6 }], 22, false);
  const name = plaque("ep02-99n", 768, 300, BRASS_BASE, INK, [
    { text: "99 NIGHTS", size: 120, font: "display", track: 2 },
    { text: "IN THE FOREST", size: 80, font: "display", track: 4 },
  ], 23);
  const breakout = plaque("ep02-breakout", 768, 150, "#1D1E21", "#FFFFFF", [{ text: "GAME BREAKOUT", size: 96, font: "display", track: 6 }], 24, false);
  return (
    <group>
      <Spot pos={[x0 + 8, 22, 14]} at={[x0, 3, -1]} />
      <Plinth x={x0} w={8} />
      {old.map((h, i) => (
        <Bar key={i} x={x0 - 3.0 + i * 1.45} z={-1.2} w={1.2} h={h} grain={grain} />
      ))}
      <Bar x={x0 + 2.9} z={-0.9} w={1.7} h={hNew} hero grain={grain} />
      <PopTag k={lamaTag} pos={[x0 - 0.9, PLINTH_TOP * 0.5, 1.25]} size={[4.2, 0.88]} tex={lama} />
      <PopTag k={newTag} pos={[x0 + 2.7, PLINTH_TOP * 0.5, 1.25]} size={[2.5, 0.8]} tex={baru} acrylic />
      <PopTag k={nameTag} pos={[x0 + 2.9, PLINTH_TOP + hNew - 1.1, -0.9 + 0.88]} size={[1.6, 0.62]} tex={name} />
      <PopTag k={breakoutTag} pos={[x0 + 2.9, PLINTH_TOP + hNew - 1.85, -0.9 + 0.88]} size={[1.6, 0.31]} tex={breakout} acrylic />
    </group>
  );
};
export const raceTop = (rise: number): V3 => [STATION.C + 2.9, PLINTH_TOP + 0.5 + (6.6 - 0.5) * rise + 0.08, -0.9];

// ---------- D: players (l04) ----------
const PLAYER_COLORS = ["#f5cd30", "#0d69ac", "#a4bd47", "#FF6A1A", "#E8E4DA"];
const Column: React.FC<{ x: number; fill: number; seed: number }> = ({ x, fill, seed }) => {
  const H = 8.2;
  const R = 1.05;
  const cells = useMemo(() => {
    const r = prng(seed);
    const pts: { p: V3; c: string; rot: number }[] = [];
    const s = 0.3;
    for (let y = 0; y < H / s; y++) {
      for (let ix = -4; ix <= 4; ix++) {
        for (let iz = -4; iz <= 4; iz++) {
          const px = ix * s + (r() - 0.5) * 0.08;
          const pz = iz * s + (r() - 0.5) * 0.08;
          if (px * px + pz * pz > (R - 0.18) * (R - 0.18)) continue;
          pts.push({ p: [px, 0.15 + y * s, pz], c: PLAYER_COLORS[Math.floor(r() * PLAYER_COLORS.length)], rot: r() * 3 });
        }
      }
    }
    return pts;
  }, [seed]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(0.24, 0.24, 0.24), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    cells.forEach((c, i) => {
      o.position.set(c.p[0], c.p[1], c.p[2]);
      o.rotation.set(0, c.rot, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.set(c.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [cells]);
  const level = fill * H;
  const count = cells.filter((c) => c.p[1] < level).length;
  useLayoutEffect(() => {
    if (ref.current) ref.current.count = count;
  }, [count]);
  return (
    <group position={[x, PLINTH_TOP, -1]}>
      <instancedMesh ref={ref} args={[geo, undefined, cells.length]} castShadow>
        <meshPhysicalMaterial roughness={0.4} clearcoat={0.5} />
      </instancedMesh>
      {/* acrylic tube */}
      <mesh position={[0, H / 2 + 0.1, 0]}>
        <cylinderGeometry args={[R, R, H + 0.2, 64, 1, true]} />
        <meshPhysicalMaterial color={P.acrylicTeal} roughness={0.08} transparent opacity={0.22} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* aluminium base + brass top ring */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[R + 0.12, R + 0.16, 0.12, 64]} />
        <meshPhysicalMaterial color={P.machinedAluminum} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, H + 0.24, 0]}>
        <torusGeometry args={[R + 0.02, 0.06, 16, 64]} />
        <meshPhysicalMaterial color={P.brassGold} metalness={0.85} roughness={0.28} />
      </mesh>
      {/* level marker riding the fill */}
      {fill > 0.01 && (
        <mesh position={[0, level + 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R + 0.04, 0.035, 12, 64]} />
          <meshStandardMaterial color="#FF6A1A" emissive="#FF5410" emissiveIntensity={1.2} />
        </mesh>
      )}
    </group>
  );
};

export const PlayersStation: React.FC<{ fill: number; gagTag: number; sabTag: number; bigTag: number }> = ({ fill, gagTag, sabTag, bigTag }) => {
  const x0 = STATION.D;
  const gag = plaque("ep02-gag", 640, 160, BRASS_BASE, INK, [{ text: "GROW A GARDEN", size: 92, font: "display", track: 4 }], 31);
  const sab = plaque("ep02-sab", 640, 160, BRASS_BASE, INK, [{ text: "STEAL A BRAINROT", size: 86, font: "display", track: 3 }], 32);
  const big = plaque("ep02-20jt", 1024, 300, "#1D1E21", "#FFFFFF", [
    { text: "> 20 JUTA ORANG", size: 140, font: "display", track: 3 },
    { text: "SEKALIGUS", size: 80, font: "display", track: 14, color: "#FF7A3D" },
  ], 33, false);
  return (
    <group>
      <Spot pos={[x0 + 8, 22, 14]} at={[x0, 4, -1]} />
      <Plinth x={x0} w={8} />
      <Column x={x0 - 1.9} fill={fill} seed={301} />
      <Column x={x0 + 1.9} fill={Math.min(1, fill * 1.04)} seed={302} />
      <PopTag k={gagTag} pos={[x0 - 1.9, PLINTH_TOP * 0.5, 1.25]} size={[2.6, 0.65]} tex={gag} />
      <PopTag k={sabTag} pos={[x0 + 1.9, PLINTH_TOP * 0.5, 1.25]} size={[2.6, 0.65]} tex={sab} />
      <PopTag k={bigTag} pos={[x0, PLINTH_TOP + 8.2 + 1.3, -1]} size={[5.2, 1.52]} tex={big} acrylic />
    </group>
  );
};

// ---------- E: DevEx (l05-l06) ----------
const UNIT = 1.6; // world units per US$1 miliar
const DISC = 0.12;
const Stack: React.FC<{ x: number; z: number; h: number; seed: number }> = ({ x, z, h, seed }) => {
  const grain = useSurfaceGrain(seed, 0.25, 2);
  const n = Math.floor(h / DISC);
  const r = useMemo(() => {
    const g = prng(seed);
    return Array.from({ length: 90 }, () => [(g() - 0.5) * 0.06, (g() - 0.5) * 0.06] as [number, number]);
  }, [seed]);
  return (
    <group position={[x, PLINTH_TOP, z]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} castShadow receiveShadow position={[r[i % 90][0], DISC / 2 + i * DISC, r[i % 90][1]]}>
          <cylinderGeometry args={[0.85, 0.85, DISC * 0.9, 48]} />
          <meshPhysicalMaterial color={P.brassGold} metalness={0.88} roughness={0.27} roughnessMap={grain} clearcoat={0.3} />
        </mesh>
      ))}
    </group>
  );
};

export const DevExStation: React.FC<{ s1: number; s2: number; tag1: number; tag2: number; consoleOn: number }> = ({ s1, s2, tag1, tag2, consoleOn }) => {
  const x0 = STATION.E;
  const grain = useSurfaceGrain(51, 0.22, 3);
  const devex = plaque("ep02-devex", 768, 300, "#1D1E21", "#FFFFFF", [
    { text: "DEVEX", size: 150, font: "display", track: 10, color: "#FF7A3D" },
    { text: "ROBUX KE UANG", size: 76, font: "display", track: 6 },
  ], 41, false);
  const t1 = plaque("ep02-17m", 768, 300, BRASS_BASE, INK, [
    { text: "±1,7 MILIAR DOLAR", size: 104, font: "display", track: 2 },
    { text: "12 BULAN S.D. JUNI 2026", size: 58, weight: 700, track: 3 },
  ], 42);
  const t2 = plaque("ep02-5m", 768, 300, BRASS_BASE, INK, [
    { text: "> 5 MILIAR DOLAR", size: 108, font: "display", track: 2 },
    { text: "SEJAK 2013", size: 64, weight: 700, track: 6 },
  ], 43);
  const h1 = 1.7 * UNIT * s1;
  const h2 = 5 * UNIT * s2;
  return (
    <group>
      <Spot pos={[x0 + 8, 22, 14]} at={[x0, 3, -1]} />
      <Plinth x={x0} w={9} />
      {/* console: aluminium body, slanted acrylic screen */}
      <group position={[x0 - 2.6, PLINTH_TOP, 0.0]} rotation={[0, -0.25, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
          <RoundedBoxGeo args={[1.8, 1.8, 1.2]} radius={0.08} />
          <Alu grain={grain} />
        </mesh>
        <group position={[0, 1.95, 0.1]} rotation={[-0.5, 0, 0]}>
          <Tag pos={[0, 0, 0]} size={[1.7, 0.66]} tex={devex} acrylic />
        </group>
        <mesh position={[0.62, 1.82, 0.62]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#FF6A1A" emissive="#FF5410" emissiveIntensity={0.4 + consoleOn * 2} />
        </mesh>
      </group>
      {s1 > 0.01 && <Stack x={x0 + 0.4} z={-0.8} h={h1} seed={61} />}
      {s2 > 0.01 && <Stack x={x0 + 2.8} z={-1.0} h={h2} seed={62} />}
      <PopTag k={tag1} pos={[x0 + 0.4, PLINTH_TOP * 0.5, 1.25]} size={[2.2, 0.86]} tex={t1} />
      <PopTag k={tag2} pos={[x0 + 2.85, PLINTH_TOP + h2 + 0.75, -1.0]} size={[2.4, 0.94]} tex={t2} />
    </group>
  );
};
export const DEVEX_SPOT: V3 = [STATION.E - 3.9, PLINTH_TOP, 0.75];

// ---------- l09 plaque next to the coin ----------
export const CreatorsPlaque: React.FC<{ k: number }> = ({ k }) => {
  const tex = plaque("ep02-42k", 768, 260, BRASS_BASE, INK, [
    { text: "DARI > 42.000", size: 100, font: "display", track: 3 },
    { text: "KREATOR DEVEX", size: 70, font: "display", track: 6 },
  ], 71);
  return <PopTag k={k} pos={[COIN[0] - 1.55, PLINTH_TOP + 0.32, COIN[2] + 0.6]} size={[1.6, 0.54]} tex={tex} tilt={-0.9} />;
};

// ---------- l12: the small map the avatar builds ----------
export const TRAY: V3 = [1.6, 0, 11.0];
type Piece = { at: number; pos: V3; size: V3; color: string; kind?: "roof" };
const PIECES: Piece[] = [
  ...[0, 1, 2, 3].flatMap((i) =>
    [0, 1].map((j) => ({ at: (i * 2 + j) * 0.04, pos: [-1.35 + i * 0.9, 0.36, -0.45 + j * 0.9] as V3, size: [0.86, 0.12, 0.86] as V3, color: "#6FA544" })),
  ),
  { at: 0.36, pos: [-0.45, 0.44, 0.0], size: [2.6, 0.04, 0.36], color: "#D9C08E" },
  { at: 0.46, pos: [-1.3, 0.75, -0.5], size: [0.16, 0.6, 0.16], color: "#6B4A2E" },
  { at: 0.5, pos: [-1.3, 1.15, -0.5], size: [0.6, 0.5, 0.6], color: "#3E8E3A" },
  { at: 0.56, pos: [1.35, 0.75, 0.45], size: [0.16, 0.6, 0.16], color: "#6B4A2E" },
  { at: 0.6, pos: [1.35, 1.15, 0.45], size: [0.6, 0.5, 0.6], color: "#3E8E3A" },
  { at: 0.68, pos: [0.65, 0.75, -0.45], size: [1.0, 0.66, 0.8], color: "#E8E4DA" },
  { at: 0.76, pos: [0.65, 1.22, -0.45], size: [1.1, 0.3, 0.9], color: "#D4521C", kind: "roof" },
  { at: 0.84, pos: [-0.9, 0.46, 0.5], size: [0.6, 0.06, 0.6], color: "#FF6A1A" },
];
export const MapTray: React.FC<{ f: number; build: number; players: number; tag: number }> = ({ f, build, players, tag }) => {
  const wood = useMemo(() => {
    const t = walnutTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.5, 0.3);
    t.needsUpdate = true;
    return t;
  }, []);
  const label = plaque("ep02-betah", 768, 160, BRASS_BASE, INK, [{ text: "SUPAYA PEMAIN BETAH", size: 88, font: "display", track: 4 }], 81);
  return (
    <group position={TRAY}>
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <RoundedBoxGeo args={[4.0, 0.3, 2.4]} radius={0.05} />
        <meshPhysicalMaterial map={wood} roughness={0.5} clearcoat={0.5} />
      </mesh>
      {PIECES.map((p, i) => {
        const k = Math.min(1, Math.max(0, (build - p.at) / 0.08));
        if (k <= 0) return null;
        const drop = (1 - ease(k)) * 0.8;
        return (
          <mesh key={i} castShadow receiveShadow position={[p.pos[0], p.pos[1] + drop, p.pos[2]]} scale={0.6 + 0.4 * ease(k)} rotation={p.kind === "roof" ? [0, 0, 0] : [0, 0, 0]}>
            <RoundedBoxGeo args={p.size} radius={Math.min(0.04, p.size[1] / 3)} />
            <meshPhysicalMaterial color={p.color} roughness={0.42} clearcoat={0.45} clearcoatRoughness={0.3} />
          </mesh>
        );
      })}
      {/* tiny players arrive on the finished map */}
      {(
        [
          [-0.9, 0.5, 0.5, 0.2, { torso: "#FF6A1A" }],
          [-0.2, 0.42, 0.15, -0.5, { torso: "#0d69ac" }],
          [0.2, 0.42, 0.55, 0.6, { torso: "#E8E4DA", legs: "#3a3f48" }],
        ] as [number, number, number, number, Record<string, string>][]
      ).map(([x, y, z, r, c], i) => {
        const k = Math.min(1, Math.max(0, players * 3 - i));
        if (k <= 0) return null;
        return <BlockAvatar key={i} f={f} pose={i === 0 ? "cheer" : "run"} seed={5 + i} position={[x, y + (1 - ease(k)) * 0.6, z]} rotation={[0, r, 0]} scale={0.13 * ease(k)} colors={c} />;
      })}
      <group position={[1.75, 0.3, -1.0]}>
        <mesh castShadow position={[0, 0.45, -0.04]}>
          <RoundedBoxGeo args={[0.08, 0.9, 0.08]} radius={0.02} />
          <Brass />
        </mesh>
        <PopTag k={tag} pos={[0, 1.05, 0]} size={[1.9, 0.4]} tex={label} />
      </group>
    </group>
  );
};
