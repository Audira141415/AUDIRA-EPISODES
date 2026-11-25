// EP02 hook world (DATAPHYSICAL): a museum data sculpture of Roblox creator earnings (DevEx).
// Bars on a walnut plinth at true scale: rata-rata top 10 US$65,7 juta (burnt-orange tower),
// top 100 US$10,8 juta, top 1.000 US$1,4 juta, median ±US$1.500/tahun (a flat brass coin).
// The blocky avatar stands on the coin and reaches up at the tower. Behind it, an acrylic
// pegboard of 100 cells: 28 lit orange = 28 of the top 100 games launched within 90 days (Agu 2026).
// Driven by frame f (60 fps base). Film hook starts from COVER_CAMERA.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { continueRender, delayRender } from "remotion";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { prng } from "../../core/materials/textures.ts";
import { DATAPHYSICAL_PALETTE as P } from "../../kits/dataphysical/lib/palette.ts";
import { BlockAvatar, type AvatarPose } from "../_shared/BlockAvatar.tsx";
import { ep02FontsReady } from "./fonts.ts";
import { plaque, walnutTexture, wallTexture } from "./textures.ts";

type V3 = [number, number, number];

export const BG = "#141518";

/** Camera start pose of the film hook = the cover framing. */
export const COVER_CAMERA = {
  position: [-1.5, 3.9, 29.5] as V3,
  target: [-0.2, 7.4, 0] as V3,
  fov: 44,
};

/** Focus distance for the cover DOF: the avatar on the median coin. */
export const COVER_FOCUS = 27.5;

/** Hook camera: starts on the cover pose, slow push-in and rise along the tower. */
export const hookCamera = (f: number) => {
  const t = f / 60;
  const k = 1 - Math.exp(-t * 0.35);
  const c = COVER_CAMERA;
  return {
    position: [c.position[0] + k * 0.9, c.position[1] + k * 0.8, c.position[2] - k * 3.0] as V3,
    target: [c.target[0], c.target[1] + k * 0.6, c.target[2]] as V3,
    fov: c.fov,
  };
};

/** Holds the frame until bundled fonts are in, so canvas plaques draw with the right faces. */
export const useEp02Ready = () => {
  const [handle] = useState(() => delayRender("EP02 world"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    ep02FontsReady().then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

// ---------- data (FACTS.md, S6) ----------
const JT = 0.1826; // world units per US$1 juta: top 10 (65,7) = 12.0 units
const PLINTH_TOP = 1.4;

// ---------- materials ----------
export const Alu: React.FC<{ grain: THREE.Texture; color?: string }> = ({ grain, color = P.machinedAluminum }) => (
  <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.26} roughnessMap={grain} clearcoat={0.2} clearcoatRoughness={0.3} />
);
export const Brass: React.FC<{ map?: THREE.Texture; grain?: THREE.Texture }> = ({ map, grain }) => (
  <meshPhysicalMaterial color={map ? "#ffffff" : P.brassGold} map={map} metalness={0.85} roughness={0.28} roughnessMap={grain} clearcoat={0.3} clearcoatRoughness={0.25} />
);

// ---------- pieces ----------
const Plinth: React.FC = () => {
  const wood = useMemo(() => {
    const t = walnutTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.2, 0.6);
    t.needsUpdate = true;
    return t;
  }, []);
  const grain = useSurfaceGrain(12, 0.2, 4);
  const sign = plaque("ep02-audira", 1024, 256, "#C9A66C", "#2A1B10", [
    { text: "AUDIRA", size: 92, font: "display", track: 18 },
    { text: "PENDAPATAN KREATOR · DEVEX", size: 40, weight: 600, track: 6 },
  ], 9);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, PLINTH_TOP / 2, 0]}>
        <RoundedBoxGeo args={[10, PLINTH_TOP, 7]} radius={0.08} segments={3} />
        <meshPhysicalMaterial map={wood} roughness={0.5} roughnessMap={grain} clearcoat={0.55} clearcoatRoughness={0.28} />
      </mesh>
      {/* brass scale rail along the front bevel */}
      <mesh castShadow position={[0, PLINTH_TOP - 0.06, 3.52]}>
        <RoundedBoxGeo args={[9.6, 0.1, 0.06]} radius={0.02} />
        <Brass grain={grain} />
      </mesh>
      {/* engraved brass plaque on the plinth front */}
      <mesh position={[1.7, PLINTH_TOP * 0.52, 3.51]}>
        <RoundedBoxGeo args={[3.2, 0.8, 0.04]} radius={0.015} />
        <Brass grain={grain} />
      </mesh>
      <mesh position={[1.7, PLINTH_TOP * 0.52, 3.535]}>
        <planeGeometry args={[3.1, 0.775]} />
        <Brass map={sign} grain={grain} />
      </mesh>
    </group>
  );
};

/** A machined bar on the plinth: aluminium (or anodised orange) body, brass cap, optional rings. */
export const Bar: React.FC<{
  x: number;
  z: number;
  w: number;
  h: number;
  hero?: boolean;
  rings?: number[];
  grain: THREE.Texture;
  /** Extra vertical offset (film: sink into the plinth). */
  y?: number;
}> = ({ x, z, w, h, hero, rings = [], grain, y = 0 }) => (
  <group position={[x, PLINTH_TOP + y, z]}>
    <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
      <RoundedBoxGeo args={[w, h, w]} radius={Math.min(0.06, h / 3)} segments={3} />
      {hero ? (
        <meshPhysicalMaterial color={P.focalOrange} metalness={0.22} roughness={0.34} roughnessMap={grain} clearcoat={0.3} clearcoatRoughness={0.22} />
      ) : (
        <Alu grain={grain} />
      )}
    </mesh>
    <mesh castShadow position={[0, h + 0.04, 0]}>
      <RoundedBoxGeo args={[w + 0.02, 0.08, w + 0.02]} radius={0.025} />
      <Brass grain={grain} />
    </mesh>
    {rings.map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <RoundedBoxGeo args={[w + 0.05, 0.045, w + 0.05]} radius={0.015} />
        <Brass grain={grain} />
      </mesh>
    ))}
  </group>
);

/** Plaque mounted on a bar face (z+), or lying on the plinth when flat. */
export const Tag: React.FC<{ pos: V3; size: [number, number]; tex: THREE.Texture; rotY?: number; tilt?: number; acrylic?: boolean }> = ({
  pos,
  size,
  tex,
  rotY = 0,
  tilt = 0,
  acrylic,
}) => (
  <group position={pos} rotation={[tilt, rotY, 0]}>
    <mesh castShadow>
      <RoundedBoxGeo args={[size[0], size[1], 0.05]} radius={0.02} />
      {acrylic ? (
        <meshPhysicalMaterial color="#1D1E21" roughness={0.2} metalness={0.1} clearcoat={1} />
      ) : (
        <Brass />
      )}
    </mesh>
    <mesh position={[0, 0, 0.027]}>
      <planeGeometry args={[size[0] * 0.97, size[1] * 0.94]} />
      {acrylic ? (
        <meshStandardMaterial map={tex} roughness={0.35} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.18} />
      ) : (
        <Brass map={tex} />
      )}
    </mesh>
  </group>
);

/** 10×10 acrylic pegboard, 28 cells lit (seeded pick) = the 28 new games in the top 100. */
export type BoardState = {
  /** How many of the 28 "new" cells are lit (0..28), in seeded order. */
  lit: number;
  /** 0..1: lit cells push out of the board. */
  push: number;
  /** 0..1: wave flip to the 83% (perorangan) view. */
  flip: number;
};
export const BOARD_COVER: BoardState = { lit: 28, push: 0, flip: 0 };

const shuffled = (seed: number) => {
  const r = prng(seed);
  const idx = Array.from({ length: 100 }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
};

const NewGameBoard: React.FC<{ f: number; grain: THREE.Texture; state?: BoardState }> = ({ f, grain, state = BOARD_COVER }) => {
  const order = useMemo(() => {
    const idx = shuffled(28028);
    const rank = new Map<number, number>();
    idx.slice(0, 28).forEach((c, k) => rank.set(c, k));
    return rank;
  }, []);
  const solo = useMemo(() => new Set(shuffled(8383).slice(0, 83)), []);
  const label83 = plaque("ep02-board83", 1024, 260, "#C9A66C", "#2A1B10", [
    { text: "83% KREATOR AS (SURVEI)", size: 88, font: "display", track: 4 },
    { text: "PERORANGAN, BUKAN STUDIO", size: 56, weight: 700, track: 3 },
  ], 14);
  const label = plaque("ep02-board", 1024, 260, "#C9A66C", "#2A1B10", [
    { text: "28 / 100 GAME TERATAS", size: 88, font: "display", track: 4 },
    { text: "RILIS DALAM 90 HARI · AGU 2026", size: 56, weight: 700, track: 3 },
  ], 13);
  const t = f / 60;
  const step = 0.4;
  return (
    <group position={[-2.4, PLINTH_TOP + 2.2, -2.6]} rotation={[0, 0.3, 0]}>
      {/* acrylic slab */}
      <mesh castShadow position={[0, 2.5, -0.08]}>
        <RoundedBoxGeo args={[4.5, 4.7, 0.16]} radius={0.06} />
        <meshPhysicalMaterial color={P.acrylicTeal} roughness={0.1} metalness={0} transmission={0} transparent opacity={0.32} clearcoat={1} />
      </mesh>
      {/* aluminium feet */}
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} castShadow position={[x, 0.08, 0]}>
          <RoundedBoxGeo args={[0.5, 0.16, 0.7]} radius={0.03} />
          <Alu grain={grain} />
        </mesh>
      ))}
      {Array.from({ length: 100 }, (_, i) => {
        const cx = (i % 10) - 4.5;
        const cy = Math.floor(i / 10);
        // wave flip, left to right, top to bottom
        const fl = Math.min(1, Math.max(0, state.flip * 16 - ((i % 10) + cy * 0.5)));
        const flipped = fl > 0.5;
        const rank = order.get(i);
        const newOn = rank !== undefined && rank < state.lit;
        const on = flipped ? solo.has(i) : newOn;
        const pulse = on ? 0.7 + Math.sin(t * 2 + i) * 0.12 : 0;
        const pz = !flipped && newOn ? state.push * 0.18 : 0;
        return (
          <mesh key={i} castShadow position={[cx * step, 0.7 + (9 - cy) * step, 0.06 + pz]} rotation={[0, fl * Math.PI, 0]}>
            <RoundedBoxGeo args={[0.31, 0.31, on ? 0.2 : 0.1]} radius={0.04} />
            {on && flipped ? (
              <meshPhysicalMaterial color="#7FE0DC" emissive="#2FC8C0" emissiveIntensity={pulse * 0.8} roughness={0.3} clearcoat={0.8} />
            ) : on ? (
              <meshPhysicalMaterial color="#FF6A1A" emissive="#FF5410" emissiveIntensity={pulse} roughness={0.3} clearcoat={0.8} />
            ) : (
              <Alu grain={grain} color="#9AA0A6" />
            )}
          </mesh>
        );
      })}
      {(() => {
        const lf = Math.min(1, Math.max(0, (state.flip - 0.35) / 0.3));
        return (
          <group position={[0, 5.4, 0]} rotation={[lf * Math.PI, 0, 0]}>
            {lf < 0.5 ? (
              <Tag pos={[0, 0, 0]} size={[4.5, 1.14]} tex={label} />
            ) : (
              <group rotation={[Math.PI, 0, 0]}>
                <Tag pos={[0, 0, 0]} size={[4.5, 1.14]} tex={label83} />
              </group>
            )}
          </group>
        );
      })()}
    </group>
  );
};

const Wall: React.FC = () => (
  <>
    <mesh position={[0, 12, -14]} receiveShadow>
      <planeGeometry args={[60, 40]} />
      <meshStandardMaterial map={wallTexture()} roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 60]} />
      <meshPhysicalMaterial color="#1E1F22" roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.4} />
    </mesh>
    {/* dim background plinths for depth */}
    {(
      [
        [-9.5, -8, 1.8, 3.0, 2.2],
        [9.0, -9, 2.6, 2.6, 2.0],
        [13.5, -4, 1.4, 2.2, 1.6],
      ] as [number, number, number, number, number][]
    ).map(([x, z, h, w, d], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <RoundedBoxGeo args={[w, h, d]} radius={0.05} />
          <meshPhysicalMaterial color="#2A1B14" roughness={0.55} clearcoat={0.4} />
        </mesh>
        <mesh castShadow position={[0, h + 0.9, 0]}>
          <RoundedBoxGeo args={[0.5, 1.8, 0.5]} radius={0.04} />
          <meshPhysicalMaterial color={P.machinedAluminum} metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    ))}
  </>
);

// ---------- world ----------
export type AvatarState = { pos: V3; rot: number; pose: AvatarPose; seed?: number; scale?: number };
export type WorldState = {
  /** Growth 0..1 of each data bar (top 10, top 100, top 1.000) and the median coin. */
  g10: number;
  g100: number;
  g1000: number;
  gCoin: number;
  board: BoardState;
  avatar: AvatarState;
  /** Film only: 0..1 fade of the TOP 1.000 plaque (kept out of the median close-up). Default 1. */
  tag1000?: number;
  /** Film only, 0..1: sink everything on the plinth except the median coin, its plaque and the avatar into the plinth. */
  isolate?: number;
  /** Film only: hide the foreground cubes and brass rule. */
  hideFG?: boolean;
};
/** Cover avatar: on the median coin, reaching up at the tower. */
export const COIN: V3 = [-2.9, PLINTH_TOP, 2.2];
export const WORLD_COVER: WorldState = {
  g10: 1,
  g100: 1,
  g1000: 1,
  gCoin: 1,
  board: BOARD_COVER,
  avatar: { pos: [COIN[0], PLINTH_TOP + 0.06, COIN[2]], rot: 0.32, pose: "wave", seed: 2 },
};
export { PLINTH_TOP, JT };

const pop = (g: number) => Math.min(1, Math.max(0, g));
const tagIn = (g: number) => {
  const k = Math.min(1, Math.max(0, (g - 0.85) / 0.15));
  return k * k * (3 - 2 * k);
};

export const HookWorld: React.FC<{
  f: number;
  camera?: { position: V3; target: V3; fov: number };
  state?: WorldState;
  children?: React.ReactNode;
}> = ({ f, camera, state = WORLD_COVER, children }) => {
  const grain = useSurfaceGrain(21, 0.22, 3);
  const cam = camera ?? hookCamera(f);
  const S = state;

  const H10 = 65.7 * JT * pop(S.g10);
  const H100 = 10.8 * JT * pop(S.g100);
  const H1000 = 1.4 * JT * pop(S.g1000);

  const towerTag = plaque("ep02-top10", 768, 512, "#C9A66C", "#2A1B10", [
    { text: "RATA-RATA TOP 10", size: 62, weight: 700, track: 3 },
    { text: "US$65,7", size: 190, font: "display" },
    { text: "JUTA", size: 96, font: "display", track: 10 },
  ], 3);
  const top100Tag = plaque("ep02-top100", 512, 300, "#C9A66C", "#2A1B10", [
    { text: "TOP 100", size: 66, weight: 700, track: 3 },
    { text: "US$10,8 JT", size: 104, font: "display" },
  ], 4);
  const top1000Tag = plaque("ep02-top1000", 640, 220, "#C9A66C", "#2A1B10", [
    { text: "TOP 1.000", size: 60, weight: 700, track: 3 },
    { text: "US$1,4 JT", size: 96, font: "display" },
  ], 6);
  const medianTag = plaque("ep02-median", 768, 300, "#1D1E21", "#FFFFFF", [
    { text: "MEDIAN KREATOR", size: 60, weight: 700, track: 4, color: "#FF7A3D" },
    { text: "±US$1.500/THN", size: 128, font: "display" },
  ], 8, false);

  const coin = COIN;
  const iso = Math.min(1, Math.max(0, S.isolate ?? 0));
  const sinkY = -iso * iso * (3 - 2 * iso) * 16;
  const show = iso < 0.999;
  const t10 = tagIn(S.g10), t100 = tagIn(S.g100), t1000 = tagIn(S.g1000) * (S.tag1000 ?? 1), tCoin = tagIn(S.gCoin);

  return (
    <>
      <PoseCamera position={cam.position} target={cam.target} fov={cam.fov} />
      <ambientLight intensity={0.22} color="#FFF4E6" />
      <hemisphereLight args={["#FFF1DC", "#0E0D0C", 0.35]} />
      {/* key: warm gallery spot from front-right */}
      <spotLight
        position={[9, 22, 14]}
        intensity={1400}
        angle={0.5}
        penumbra={0.7}
        decay={2}
        color="#FFF0D8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
        shadow-radius={5}
      />
      {/* cool rim from back-left to cut the tower and avatar out of the wall */}
      <directionalLight position={[-5, 10, -12]} intensity={1.1} color="#9CC7E8" />
      {/* warm halo on the wall behind the tower */}
      <pointLight position={[3.5, 11, -9]} intensity={90} distance={30} decay={2} color="#FFB070" />
      {/* soft fill from camera side */}
      <directionalLight position={[-6, 4, 14]} intensity={0.55} color="#FFE6CC" />

      <Wall />
      <Plinth />
      <GroundShadow y={0.005} scale={20} opacity={0.75} blur={2.6} far={3} />

      {show && (
        <group position={[0, sinkY, 0]}>
          <NewGameBoard f={f} grain={grain} state={S.board} />
        </group>
      )}

      {/* the data bars (true scale) */}
      {show && S.g10 > 0.004 && <Bar y={sinkY} x={1.9} z={-1.2} w={2.2} h={H10} hero grain={grain} rings={[10, 20, 30, 40, 50, 60].map((v) => v * JT).filter((y) => y < H10 - 0.1)} />}
      {show && S.g100 > 0.01 && <Bar y={sinkY} x={-0.1} z={0.3} w={1.4} h={H100} grain={grain} />}
      {show && S.g1000 > 0.05 && <Bar y={sinkY} x={-1.5} z={1.4} w={1.1} h={H1000} grain={grain} />}
      {/* median: a flat brass coin, the avatar stands on it */}
      {S.gCoin > 0.01 && (
        <mesh castShadow receiveShadow position={[coin[0], PLINTH_TOP + 0.03, coin[2]]} scale={[pop(S.gCoin), 1, pop(S.gCoin)]}>
          <cylinderGeometry args={[0.95, 0.95, 0.06, 64]} />
          <Brass grain={grain} />
        </mesh>
      )}

      {/* labels */}
      {show && t10 > 0 && (
        <group position={[1.9, PLINTH_TOP + H10 - 1.35 + sinkY, -1.2 + 1.14]} scale={t10}>
          <Tag pos={[0, 0, 0]} size={[2.05, 1.37]} tex={towerTag} />
        </group>
      )}
      {show && t100 > 0 && (
        <group position={[-0.1, PLINTH_TOP + H100 * 0.5 + sinkY, 0.3 + 0.73]} scale={t100}>
          <Tag pos={[0, 0, 0]} size={[1.32, 0.78]} tex={top100Tag} />
        </group>
      )}
      {show && t1000 > 0 && (
        <group position={[-0.5, PLINTH_TOP + 0.3 + sinkY, 2.55]} scale={t1000}>
          <Tag pos={[0, 0, 0]} size={[1.95, 0.67]} tex={top1000Tag} tilt={-0.75} />
        </group>
      )}
      {tCoin > 0 && (
        <group position={[-2.75, PLINTH_TOP + 0.3, 3.15]} scale={tCoin}>
          <Tag pos={[0, 0, 0]} size={[2.3, 0.9]} tex={medianTag} tilt={-1.0} acrylic />
        </group>
      )}

      {/* foreground: loose machined cubes + brass rule on the floor near the lens */}
      {!S.hideFG && (
        [
          [-5.4, 0.45, 7.5, 0.9, 0.4],
          [-4.4, 0.3, 8.6, 0.6, -0.3],
          [5.0, 0.4, 8.0, 0.8, 0.7],
        ] as [number, number, number, number, number][]
      ).map(([x, y, z, sz, r], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, y, z]} rotation={[0, r, 0]}>
          <RoundedBoxGeo args={[sz, sz, sz]} radius={0.06} />
          {i === 1 ? <meshPhysicalMaterial color={P.focalOrange} metalness={0.2} roughness={0.35} clearcoat={0.6} /> : <Alu grain={grain} />}
        </mesh>
      ))}
      {!S.hideFG && (
        <mesh castShadow position={[3.4, 0.08, 9.2]} rotation={[0, -0.5, 0]}>
          <RoundedBoxGeo args={[3.4, 0.12, 0.42]} radius={0.03} />
          <Brass grain={grain} />
        </mesh>
      )}

      <BlockAvatar
        f={f}
        pose={S.avatar.pose}
        seed={S.avatar.seed ?? 2}
        position={S.avatar.pos}
        rotation={[0, S.avatar.rot, 0]}
        scale={S.avatar.scale ?? 0.88}
        grain={grain}
      />
      {children}
    </>
  );
};
