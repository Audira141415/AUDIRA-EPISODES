// EP17 night sets: the war map (hook), the camp at the pot (hook, periuk, cooking, payoff),
// Madinah at night (intro) and the black lava road of Harrah (ronda). Each set sits at the origin;
// the film mounts one set at a time (a dusk veil hides each cut).

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite } from "./pixel.tsx";
import { U, Sky, Ground, Scatter, Fire, Pot, Steam, Moon, OilLamp, Walker, grain, grainFine } from "./world.tsx";
import {
  UMAR_STAND, UMAR_WALK_A, UMAR_WALK_B, UMAR_BOWED, UMAR_CROUCH, ASLAM_STAND, ASLAM_WALK_A, ASLAM_WALK_B,
  MOTHER_SEATED, CHILD_SEATED,
} from "./sprites.ts";
import { W, ramp } from "./time.ts";

const NightSky: React.FC = () => (
  <>
    <Sky top={U.night} mid={U.nightMid} hor={U.nightHor} />
    <fog attach="fog" args={["#1A1830", 7, 26]} />
  </>
);

// ---------------------------------------------------------------- MAP (hook)
type P2 = [number, number];
const ROME: P2[] = [[-2.0, -1.3], [-0.7, -1.4], [-0.45, -0.7], [-0.75, -0.1], [-0.55, 0.45], [-1.2, 0.7], [-2.0, 0.5]];
const PERSIA: P2[] = [[0.55, -1.4], [2.0, -1.35], [2.0, 0.6], [1.25, 0.75], [0.75, 0.2], [0.5, -0.5]];
const ARABIA: P2[] = [[-0.5, 0.2], [0.65, 0.15], [1.0, 0.9], [0.7, 1.45], [-0.3, 1.45], [-0.6, 0.8]];
export const MAP_PLACES = {
  rome: [-1.05, -0.45] as P2,
  persia: [1.05, -0.5] as P2,
  madinah: [0.05, 0.75] as P2,
};
export const MAP_TOP = 0.06;

const Region: React.FC<{ pts: P2[]; color: string; h?: number }> = ({ pts, color, h = 0.05 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.02, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [pts, h]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial {...POLISH.paper} color={color} bumpMap={grain} bumpScale={0.6} />
    </mesh>
  );
};

const Banner: React.FC<{ x: number; z: number; f: number; s?: number }> = ({ x, z, f, s = 1 }) => (
  <group position={[x, MAP_TOP, z]} scale={s}>
    <mesh position={[0, 0.22, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.008, 0.44, 6]} />
      <meshStandardMaterial color="#2A1A0E" />
    </mesh>
    <mesh position={[0.09, 0.36, 0]} rotation={[0, 0.25 * Math.sin(f * 0.08 + x * 3), 0]} castShadow>
      <planeGeometry args={[0.18, 0.13]} />
      <meshPhysicalMaterial {...POLISH.fabric} color={U.red} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

const Crack: React.FC<{ x: number; z: number; len: number; rot: number; k: number }> = ({ x, z, len, rot, k }) =>
  k > 0.01 ? (
    <mesh position={[x, MAP_TOP + 0.075, z]} rotation={[0, rot, 0]} scale={[k, 1, 1]}>
      <boxGeometry args={[len, 0.01, 0.02]} />
      <meshBasicMaterial color="#120A06" />
    </mesh>
  ) : null;

export const MapSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = ramp(t, W("gentar") - 0.3, W("gentar") + 0.5);
  const borders = useMemo(
    () =>
      [ROME, PERSIA].map((pts) => {
        const g = new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => new THREE.Vector3(x, MAP_TOP + 0.075, z)));
        return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: "#E2553F" }));
      }),
    [],
  );
  return (
    <group>
      <color attach="background" args={["#2E2026"]} />
      <fog attach="fog" args={["#2E2026", 6, 18]} />
      {/* table + parchment */}
      <mesh position={[0, -0.09, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[7.0, 0.16, 9.0]} radius={0.04} />
        <meshPhysicalMaterial {...POLISH.stone} color={U.timber} bumpMap={grainFine} bumpScale={0.6} />
      </mesh>
      <mesh position={[0, 0.0, 0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.5, 3.3]} />
        <meshPhysicalMaterial {...POLISH.paper} color="#3E5A6E" bumpMap={grain} bumpScale={0.4} />
      </mesh>
      <Region pts={ROME} color="#B48A5E" />
      <Region pts={PERSIA} color="#B48A5E" />
      <Region pts={ARABIA} color="#D8B888" h={0.035} />
      {/* empire borders glow red */}
      {borders.map((o, i) => <primitive key={i} object={o} />)}
      {[[-1.6, -0.9], [-1.0, -0.2], [-1.5, 0.25], [-0.9, -1.0]].map(([x, z], i) => <Banner key={`r${i}`} x={x} z={z} f={f + i * 20} />)}
      {[[1.0, -1.0], [1.6, -0.5], [1.2, 0.3], [1.75, -1.1]].map(([x, z], i) => <Banner key={`p${i}`} x={x} z={z} f={f + i * 17} />)}
      <Crack x={-1.2} z={-0.5} len={0.9} rot={0.5} k={k} />
      <Crack x={-1.4} z={0.1} len={0.6} rot={-0.7} k={k} />
      <Crack x={1.3} z={-0.6} len={0.9} rot={-0.4} k={k} />
      <Crack x={1.5} z={0.05} len={0.5} rot={0.9} k={k} />
      {/* Madinah: a small mud-brick marker with a lit point */}
      <mesh position={[MAP_PLACES.madinah[0], MAP_TOP + 0.06, MAP_PLACES.madinah[1]]} castShadow>
        <RoundedBoxGeo args={[0.12, 0.1, 0.12]} radius={0.015} />
        <meshPhysicalMaterial {...POLISH.stone} color={U.plaster} />
      </mesh>
      <OilLamp f={f} pos={[0.2, MAP_TOP, 1.35]} power={1.2} />
      {/* table clutter: ink pot, reed pens, a scroll (fills the near edge) */}
      <mesh position={[-0.9, MAP_TOP + 0.05, 1.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
        <meshPhysicalMaterial {...POLISH.paper} color="#E2CFA6" />
      </mesh>
      <mesh position={[1.0, MAP_TOP + 0.05, 1.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 16]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#2A2230" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- CAMP (pot)
export const CAMP = {
  pot: [0, 0, 0] as [number, number, number],
  mother: [-0.27, 0, 0.3] as [number, number, number],
  kids: [-0.62, 0, -0.18] as [number, number, number],
  umar: [0.92, 0, 0.5] as [number, number, number],
  aslam: [1.22, 0, 0.72] as [number, number, number],
  tent: [-0.95, 0, -1.15] as [number, number, number],
  potTop: 0.29,
};

const Blanket: React.FC<{ pos: [number, number, number]; kids: number; folded?: boolean }> = ({ pos, kids, folded }) => (
  <group position={pos}>
    <mesh position={[0, folded ? 0.03 : 0.06, 0]} rotation={[0, 0.3, 0]} scale={folded ? [0.5, 0.5, 0.6] : [1, 1, 1]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.56, 0.1, 0.34]} radius={0.045} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#6A4E7A" bumpMap={grainFine} bumpScale={0.5} />
    </mesh>
    {Array.from({ length: kids }, (_, i) => (
      <PixelSprite key={i} map={CHILD_SEATED} px={0.026} position={[-0.16 + i * 0.15, 0.02, -0.08 - (i % 2) * 0.04]} rotationY={0.3} />
    ))}
  </group>
);

export const CampSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const cooking = t > W("memasak") - 0.4 && t < W("saat") - 0.2; // 50.7–53.2
  const payoff = t > W("itu", 4) + 0.3;
  const fill = cooking ? ramp(t, W("memasak"), W("kenyang")) : payoff ? 1 : 0;
  const weep = t > W("umar", 4) - 0.6 && t < W("ia", 2) - 0.3;
  const tearT = t - (W("menangis", 2) + 0.15);
  const stir = 0.06 * Math.sin(f * 0.09);
  const keep = useMemo(() => (x: number, z: number) => Math.hypot(x, z) > 1.0, []);
  return (
    <group>
      <NightSky />
      <Moon pos={[-8, 12, -30]} size={3.2} />
      <Ground color="#4A3828" />
      <Scatter seed={11} n={160} x={[-5, 5]} z={[-5, 3]} rock="#3A3430" keep={keep} />
      <Scatter seed={12} n={40} x={[-1.4, 1.6]} z={[-0.9, 1.3]} rock="#5A4A3A" scale={0.5} keep={(x, z) => Math.hypot(x, z) > 0.42 && Math.hypot(x - CAMP.mother[0], z - CAMP.mother[2]) > 0.25} />
      <AssetModel id="canvas-ridge-tent-f0df0d" size={1.5} ground position={CAMP.tent} rotation={[0, 0.5, 0]} polish="fabric" />
      <AssetModel id="clay-storage-pot-626452" size={0.3} ground position={[0.52, 0, -0.55]} polish="clay" />
      <Fire f={f} pos={CAMP.pot} power={payoff ? 0.55 : 1} scale={0.85} />
      <Pot fill={fill} pos={CAMP.pot} />
      <Steam f={f} pos={[0, CAMP.potTop, 0]} amount={payoff ? 0.6 : 1} />
      {/* mother stirring with a stick */}
      <PixelSprite map={MOTHER_SEATED} px={0.034} position={CAMP.mother} rotationY={-0.5} />
      <mesh position={[-0.13 + stir, 0.26, 0.16]} rotation={[0.9, 0, -0.9 + stir * 2]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.34, 6]} />
        <meshStandardMaterial color="#5A3A22" roughness={0.9} />
      </mesh>
      {cooking ? (
        <>
          <Blanket pos={CAMP.kids} kids={0} folded />
          <PixelSprite map={CHILD_SEATED} px={0.03} position={[-0.5, 0, -0.05]} rotationY={-0.9} />
          <PixelSprite map={CHILD_SEATED} px={0.028} position={[-0.32, 0, -0.3]} rotationY={-0.6} />
          <AssetModel id="grain-sack-401d96" size={0.32} ground position={[0.55, 0, 0.05]} polish="fabric" />
          <PixelSprite map={UMAR_CROUCH} px={0.035} position={[0.24, 0, 0.36]} rotationY={0.4} />
        </>
      ) : (
        <Blanket pos={CAMP.kids} kids={3} />
      )}
      {!cooking && (
        <>
          <PixelSprite map={weep ? UMAR_BOWED : UMAR_STAND} px={0.036} position={CAMP.umar} rotationY={0.6} />
          {!payoff && <PixelSprite map={ASLAM_STAND} px={0.034} position={CAMP.aslam} rotationY={0.6} />}
        </>
      )}
      {/* the tear: falls from the bowed head and makes a small ring in the sand */}
      {tearT > 0 && tearT < 1.6 && (
        <>
          {tearT < 0.45 && (
            <mesh position={[CAMP.umar[0] - 0.02, 0.4 - 0.4 * (tearT / 0.45) ** 2, CAMP.umar[2] + 0.04]}>
              <sphereGeometry args={[0.014, 12, 8]} />
              <meshBasicMaterial color="#CFE6FF" toneMapped={false} />
            </mesh>
          )}
          {tearT >= 0.45 && (
            <mesh position={[CAMP.umar[0] - 0.02, 0.006, CAMP.umar[2] + 0.04]} rotation={[-Math.PI / 2, 0, 0]} scale={0.6 + (tearT - 0.45) * 1.6}>
              <ringGeometry args={[0.03, 0.04, 24]} />
              <meshBasicMaterial color="#CFE6FF" transparent opacity={Math.max(0, 1 - (tearT - 0.45) / 1.1)} toneMapped={false} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- MADINAH (intro)
const House: React.FC<{ x: number; z: number; w: number; h: number; d: number; lit?: boolean; seed: number }> = ({ x, z, w, h, d, lit, seed }) => {
  const r = prng(seed);
  const tone = ["#8A6A4A", "#93724F", "#7E5F42"][Math.floor(r() * 3)];
  const face = x < 0 ? 1 : -1;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color={tone} bumpMap={grain} bumpScale={0.7} />
      </mesh>
      {/* parapet */}
      <mesh position={[0, h + 0.03, 0]} castShadow>
        <boxGeometry args={[w + 0.03, 0.06, d + 0.03]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#6E523A" />
      </mesh>
      {/* palm-beam ends */}
      {[-0.3, 0, 0.3].map((o, i) => (
        <mesh key={i} position={[(face * w) / 2, h - 0.1, o * d]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.08, 6]} />
          <meshStandardMaterial color="#3A2414" />
        </mesh>
      ))}
      <mesh position={[(face * (w / 2 + 0.002)), 0.17, 0]} rotation={[0, face * Math.PI / 2, 0]}>
        <planeGeometry args={[0.18, 0.34]} />
        <meshStandardMaterial color="#1A120C" />
      </mesh>
      {lit && (
        <mesh position={[(face * (w / 2 + 0.003)), h * 0.62, d * 0.25]} rotation={[0, face * Math.PI / 2, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#FFB860" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

export const Palm: React.FC<{ x: number; z: number; h: number }> = ({ x, z, h }) => (
  <group position={[x, 0, z]}>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[0.02 * Math.sin(i), (h / 6) * (i + 0.5), 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, h / 6, 8]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#5A4230" bumpMap={grainFine} bumpScale={0.8} />
      </mesh>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[0, h, 0]} rotation={[0.9, (i / 8) * Math.PI * 2, 0]} castShadow>
        <coneGeometry args={[0.07, 0.75, 3]} />
        <meshStandardMaterial color="#2F4A2A" roughness={0.9} flatShading />
      </mesh>
    ))}
  </group>
);

export const MADINAH = { from: [0.0, 0, 0.9] as [number, number, number], to: [0.02, 0, -2.5] as [number, number, number] };

export const MadinahSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const houses = useMemo(() => {
    const r = prng(5);
    const out: { x: number; z: number; w: number; h: number; d: number; lit: boolean; seed: number }[] = [];
    for (const side of [-1, 1]) {
      let z = 1.6;
      while (z > -6) {
        const d = 0.7 + r() * 0.5;
        out.push({ x: side * (0.62 + r() * 0.12 + 0.35), z: z - d / 2, w: 0.7, h: 0.55 + r() * 0.5, d, lit: r() < 0.4, seed: Math.floor(r() * 999) });
        z -= d + 0.06;
      }
    }
    return out;
  }, []);
  return (
    <group>
      <NightSky />
      <Moon pos={[6, 14, -32]} size={3.4} />
      <Ground color="#5A4532" />
      <mesh position={[0, 0.003, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.9, 9]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#7A6046" bumpMap={grain} bumpScale={0.6} />
      </mesh>
      {houses.map((h, i) => <House key={i} {...h} />)}
      {[[-2.2, -1], [2.1, -2.8], [-2.4, -4.2], [2.6, 0.3], [-1.8, 1.2]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.4 + (i % 3) * 0.3} />)}
      <Scatter seed={21} n={90} x={[-0.45, 0.45]} z={[-6, 1.8]} rock="#4E3E30" scale={0.45} />
      <Scatter seed={22} n={120} x={[-4, 4]} z={[-7, 3]} rock="#4A3A2C" keep={(x) => Math.abs(x) > 1.4} />
      {/* brazier at the lane: the warm source */}
      <group position={[0.32, 0, -1.6]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.06, 0.24, 12]} />
          <meshPhysicalMaterial color="#4A3A30" metalness={0.6} roughness={0.5} />
        </mesh>
        <Fire f={f} pos={[0, 0.24, 0]} scale={0.6} />
      </group>
      <Walker t={t} a={MADINAH.from} b={MADINAH.to} t0={W("umar") - 0.3} t1={W("masehi") + 0.5} maps={[UMAR_WALK_A, UMAR_WALK_B]} stand={UMAR_STAND} px={0.036} />
    </group>
  );
};

// ---------------------------------------------------------------- HARRAH (ronda)
export const HARRAH = {
  umarA: [-0.14, 0, 0.8] as [number, number, number],
  umarB: [-0.12, 0, -2.0] as [number, number, number],
  aslamA: [0.36, 0, 1.3] as [number, number, number],
  aslamB: [0.36, 0, -1.5] as [number, number, number],
  fire: [0.7, 0, -9] as [number, number, number],
};

export const HarrahSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const t0 = W("pelayannya") - 0.4;
  const t1 = W("kecil") + 0.6;
  return (
    <group>
      <NightSky />
      <Moon pos={[-5, 10, -28]} size={3.6} />
      <Ground color="#4A423A" />
      <mesh position={[0, 0.003, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.62, 14]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#4A3E34" bumpMap={grain} bumpScale={0.7} />
      </mesh>
      <Scatter seed={31} n={420} x={[-5, 5]} z={[-12, 3]} rock="#2E2824" keep={(x) => Math.abs(x) > 0.36} scale={1.3} shrub="#4E4A2C" />
      <Scatter seed={32} n={60} x={[-0.3, 0.3]} z={[-8, 2]} rock="#3A322C" scale={0.35} />
      {/* footprints behind the walkers */}
      {Array.from({ length: 14 }, (_, i) => {
        const z = 1.4 - i * 0.22;
        const walked = HARRAH.umarA[2] + (HARRAH.umarB[2] - HARRAH.umarA[2]) * Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
        if (z < walked + 0.1) return null;
        return (
          <mesh key={i} position={[(i % 2 ? 0.03 : -0.03) - 0.08, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.022, 10]} />
            <meshBasicMaterial color="#17120F" />
          </mesh>
        );
      })}
      <Fire f={f} pos={HARRAH.fire} scale={1.6} />
      <Walker t={t} a={HARRAH.umarA} b={HARRAH.umarB} t0={t0} t1={t1} maps={[UMAR_WALK_A, UMAR_WALK_B]} stand={UMAR_STAND} px={0.036} />
      <Walker t={t + 0.11} a={HARRAH.aslamA} b={HARRAH.aslamB} t0={t0} t1={t1} maps={[ASLAM_WALK_A, ASLAM_WALK_B]} stand={ASLAM_STAND} px={0.034} />
      {/* cool moon light so the basalt reads */}
      <pointLight position={[-1.5, 2.6, 1.8]} color="#8FA6FF" intensity={4.5} distance={12} decay={1.1} />
    </group>
  );
};
