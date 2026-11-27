// EP20 outdoor and study sets: the city gate by the Nile (intro), the Kanaan rooftop under the
// dream sky (mimpi), the desert road where the shirt is carried (maaf tail), the tafsir desk with
// the hourglass (tunggu) and the dawn hill above the city (payoff). Each set sits at the origin.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite } from "./pixel.tsx";
import { U, Sky, Ground, Scatter, Moon, OilLamp, Walker, Backer, Spot, textTexture, grain, grainFine } from "./world.tsx";
import { ashlarTex } from "./SetsHall.tsx";
import {
  BRO_WALK_A, BRO_WALK_B, BRO_BACK, YAQUB_STAND, CHILD_STAND, RUNNER_A, RUNNER_B, CAMEL_GRAIN, YUSUF_STAND,
} from "./sprites.ts";
import { W, ramp, OUTRO_AT } from "./time.ts";

type V3 = [number, number, number];

const Block: React.FC<{ pos: V3; size: V3; color: string; bump?: number }> = ({ pos, size, color, bump = 0.8 }) => (
  <mesh position={[pos[0], pos[1] + size[1] / 2, pos[2]]} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={0.02} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={bump} />
  </mesh>
);

/** Mud-brick house with a parapet and an optional lit window (faces +z, toward the camera). */
const House: React.FC<{ x: number; y?: number; z: number; w: number; h: number; d: number; lit?: boolean; seed: number }> = ({ x, y = 0, z, w, h, d, lit, seed }) => {
  const r = prng(seed);
  const tone = ["#8A6A4A", "#93724F", "#7E5F42"][Math.floor(r() * 3)];
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color={tone} bumpMap={grain} bumpScale={0.7} />
      </mesh>
      <mesh position={[0, h + 0.03, 0]} castShadow>
        <boxGeometry args={[w + 0.03, 0.06, d + 0.03]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#6E523A" />
      </mesh>
      <mesh position={[0, 0.17, d / 2 + 0.002]}>
        <planeGeometry args={[0.18, 0.34]} />
        <meshStandardMaterial color="#1A120C" />
      </mesh>
      {lit && (
        <mesh position={[w * 0.25, h * 0.62, d / 2 + 0.003]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#FFB860" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const Palm: React.FC<{ x: number; y?: number; z: number; h: number }> = ({ x, y = 0, z, h }) => (
  <group position={[x, y, z]}>
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

/** Glowing disc on a billboard (sun), unfogged. */
const SunDisc: React.FC<{ pos: V3; size: number; color?: string; opacity?: number }> = ({ pos, size, color = "#FFD9A0", opacity = 1 }) => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,250,235,1)");
    gr.addColorStop(0.28, "rgba(255,226,170,1)");
    gr.addColorStop(0.36, "rgba(255,190,120,0.55)");
    gr.addColorStop(1, "rgba(255,150,90,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={pos}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex ?? undefined} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- GATE (konteks)
export const GATE = { z: -1.6, board: [0, 1.62, -1.28] as V3 };

const gateWalkers = (c0: number, c1: number) =>
  Array.from({ length: 8 }, (_, i) => {
    const row = Math.floor(i / 2);
    const x = (i % 2 ? 0.2 : -0.2) + (row % 2 ? 0.05 : -0.05);
    return { i, a: [x, 0, 2.3 + row * 0.45] as V3, b: [x * 0.8, 0, -2.4 + row * 0.45] as V3, t0: c0 - 1.2 + row * 0.25, t1: c1 + 2.5 + row * 0.25 };
  });

export const GateSet: React.FC<{ t: number; f: number; c0: number; c1: number }> = ({ t, c0, c1 }) => {
  const board = useMemo(() => textTexture("AUDIRA", { color: "#F2C35A", bg: "#3A2416", border: "#C99A2E", font: "bold 128px 'MM Anton', Impact, sans-serif" }), []);
  const walkers = useMemo(() => gateWalkers(c0, c1), [c0, c1]);
  return (
    <group>
      <Sky top="#35507E" mid="#C98E5E" hor="#F2C27A" />
      <fog attach="fog" args={["#D8A878", 6, 24]} />
      <Ground color="#B8915E" r={40} bump={0.6} />
      {/* sandy road into the gate */}
      <mesh position={[0, 0.004, 1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.2, 6]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#D2AE7A" bumpMap={grainFine} bumpScale={0.6} />
      </mesh>
      {/* towers, lintel, crenellations, city walls */}
      <Block pos={[-0.85, 0, GATE.z]} size={[0.6, 1.75, 0.62]} color="#A07A50" />
      <Block pos={[0.85, 0, GATE.z]} size={[0.6, 1.75, 0.62]} color="#A07A50" />
      <Block pos={[0, 1.2, GATE.z]} size={[1.12, 0.36, 0.56]} color="#94704A" />
      {[-1.05, -0.85, -0.65, 0.65, 0.85, 1.05].map((x) => (
        <Block key={x} pos={[x, 1.75, GATE.z + 0.2]} size={[0.12, 0.14, 0.12]} color="#8A6844" />
      ))}
      <Block pos={[-2.3, 0, GATE.z]} size={[2.3, 1.2, 0.4]} color="#9A7650" />
      <Block pos={[2.3, 0, GATE.z]} size={[2.3, 1.2, 0.4]} color="#9A7650" />
      <mesh position={GATE.board}>
        <planeGeometry args={[0.82, 0.34]} />
        <meshStandardMaterial map={board ?? undefined} roughness={0.6} metalness={0.15} />
      </mesh>
      {/* the city beyond the gate */}
      {[[-1.4, -3.2], [-0.6, -3.6], [0.4, -3.4], [1.3, -3.1], [-1.0, -4.6], [1.0, -4.8], [0.0, -5.4]].map(([x, z], i) => (
        <House key={i} x={x} z={z} w={0.7} h={0.8 + (i % 3) * 0.25} d={0.6} seed={300 + i} lit={i % 2 === 0} />
      ))}
      {/* the Nile on the right, papyrus reeds on its bank */}
      <mesh position={[3.4, 0.012, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 12]} />
        <meshPhysicalMaterial color="#3E6E86" roughness={0.12} metalness={0.2} clearcoat={1} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[1.82 + (i % 3) * 0.06, 0.18, -0.9 + i * 0.32]} rotation={[0, 0, 0.12 * Math.sin(i)]} castShadow>
          <coneGeometry args={[0.03, 0.38, 4]} />
          <meshStandardMaterial color="#4E6A30" roughness={0.9} />
        </mesh>
      ))}
      {[[-1.7, -0.6], [-2.4, 0.6], [2.0, -1.0], [-1.6, 1.8], [2.4, 2.4]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.2 + (i % 3) * 0.3} />)}
      <Scatter seed={31} n={90} x={[-4, 1.6]} z={[-1.2, 4]} rock="#8A6A48" keep={(x) => Math.abs(x) > 0.75} />
      {/* camels with grain cross in front of the gate (profile, heading -x) */}
      {[0, 1].map((k) => (
        <Walker key={`c${k}`} t={t} a={[0.9 + k * 0.6, 0, -0.75]} b={[-0.9 + k * 0.6, 0, -0.75]} t0={c0 - 0.5} t1={c1 + 0.5} maps={[CAMEL_GRAIN, CAMEL_GRAIN]} stand={CAMEL_GRAIN} px={0.03} />
      ))}
      {walkers.map((w) => (
        <Walker key={w.i} t={t} a={w.a} b={w.b} t0={w.t0} t1={w.t1} maps={[BRO_WALK_A[w.i % 5], BRO_WALK_B[w.i % 5]]} stand={BRO_BACK[w.i % 5]} px={0.034} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- ROOF (mimpi)
export const ROOF = { yaqub: [-0.13, 0, -0.25] as V3, child: [0.14, 0, -0.2] as V3 };

const STARS: V3[] = [
  [-1.6, 2.2, -5.2], [-1.05, 2.9, -5.6], [-0.5, 2.45, -5.0], [0.05, 3.15, -5.8], [0.55, 2.55, -5.1], [1.1, 3.0, -5.6],
  [1.6, 2.25, -5.2], [-1.3, 3.5, -6.0], [-0.25, 3.7, -6.2], [0.8, 3.65, -6.1], [1.85, 3.3, -6.0],
];
/** Stars lit one by one from "sebelas" to just after "matahari"; returns how many are on. */
export function starsLit(t: number) {
  const a = W("sebelas") - 0.4;
  const b = W("matahari") + 0.3;
  return Math.max(0, Math.min(11, Math.floor(((t - a) / (b - a)) * 11 + 1)));
}
export function dreamState(t: number) {
  return {
    sun: ramp(t, W("matahari") - 0.1, W("matahari") + 0.5),
    moon: ramp(t, W("bulan") - 0.1, W("bulan") + 0.5),
    bow: ramp(t, W("bersujud") - 0.1, W("bersujud") + 0.9),
  };
}

const PixelStar: React.FC<{ pos: V3; on: number; s?: number }> = ({ pos, on, s = 0.07 }) =>
  on <= 0.001 ? null : (
    <group position={pos} scale={0.5 + 0.5 * on}>
      {[[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([x, y], i) => (
        <mesh key={i} position={[x * s, y * s, 0]}>
          <planeGeometry args={[s, s]} />
          <meshBasicMaterial color={i === 0 ? "#FFF6D8" : "#F2C35A"} transparent opacity={on} fog={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );

export const RoofSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = dreamState(t);
  const lit = starsLit(t);
  const roofTex = useMemo(() => ashlarTex(231, "#8E7050", "#4A3626", 4), []);
  const dust = useMemo(() => {
    const r = prng(232);
    return Array.from({ length: 70 }, () => [(r() - 0.5) * 9, 1.0 + r() * 4, -7 - r() * 3, 0.012 + r() * 0.02] as [number, number, number, number]);
  }, []);
  const bowP = (p: V3): V3 => [p[0] * (1 - 0.18 * s.bow), p[1] - 0.45 * s.bow, p[2]];
  return (
    <group>
      <Sky top="#070B1E" mid="#14204A" hor="#2E2A52" />
      <fog attach="fog" args={["#141A36", 5, 22]} />
      {/* the roof: a mud slab with a parapet, the lower town around it */}
      <mesh position={[0, -0.8, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[3.0, 1.6, 3.0]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color="#7E6044" map={roofTex ?? undefined} bumpMap={roofTex ?? grain} bumpScale={0.6} />
      </mesh>
      {[[0, -1.47, 3.0, 0.06], [-1.47, 0, 0.06, 3.0], [1.47, 0, 0.06, 3.0]].map(([x, z, w, d], i) => (
        <Block key={i} pos={[x, 0, z]} size={[w, 0.22, d]} color="#6E523A" bump={0.6} />
      ))}
      <group position={[0, -1.6, 0]}>
        <Ground color="#2A2430" r={40} bump={0.4} />
        {[[-2.6, -3.0], [-1.3, -4.2], [0.2, -3.6], [1.6, -4.4], [2.8, -3.0], [-3.2, -5.6], [0.9, -6.2], [-0.8, -6.8], [2.6, -6.0]].map(([x, z], i) => (
          <House key={i} x={x} z={z} w={0.9} h={1.0 + (i % 3) * 0.35} d={0.8} seed={330 + i} lit={i % 3 !== 1} />
        ))}
        <Palm x={-2.2} z={-1.8} h={2.2} />
        <Palm x={2.4} z={-2.0} h={1.9} />
      </group>
      {/* faint sky dust + the eleven stars, the sun and the moon of the dream */}
      {dust.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <planeGeometry args={[r, r]} />
          <meshBasicMaterial color="#AFC0FF" transparent opacity={0.5} fog={false} toneMapped={false} />
        </mesh>
      ))}
      {STARS.map((p, i) => (
        <PixelStar key={i} pos={bowP(p)} on={i < lit ? Math.min(1, 0.6 + 0.4 * Math.sin(f * 0.07 + i)) : 0} />
      ))}
      {s.sun > 0.001 && <SunDisc pos={bowP([-2.0, 3.3, -6.4])} size={1.5 * (1 - 0.15 * s.bow)} opacity={s.sun * 0.95} />}
      {s.moon > 0.001 && <Moon pos={bowP([2.1, 3.3, -6.4])} size={1.5 * (1 - 0.15 * s.bow) * s.moon} />}
      {/* father and the young Yusuf from behind; the warm lamp vs the blue night */}
      <PixelSprite map={YAQUB_STAND} px={0.036} position={ROOF.yaqub} />
      <PixelSprite map={CHILD_STAND} px={0.026} position={ROOF.child} />
      <Backer pos={ROOF.yaqub} w={0.6} h={0.55} opacity={0.16} />
      <OilLamp f={f} pos={[-0.62, 0, 0.25]} power={0.9} />
      <AssetModel id="clay-storage-pot-626452" size={0.3} ground position={[0.75, 0, 0.35]} polish="clay" />
      <mesh position={[0.55, 0.05, -0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 12]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#8C3A2A" bumpMap={grainFine} />
      </mesh>
      <Spot position={[1.8, 4.0, -3.5]} target={[0, 0, 0]} angle={0.6} penumbra={0.6} intensity={30} distance={12} decay={1.3} color="#7F9CFF" castShadow />
    </group>
  );
};

// ---------------------------------------------------------------- ROAD (baju dibawa pulang)
export function runnerAt(t: number, c0: number, c1: number): V3 {
  const k = Math.max(0, Math.min(1, (t - (c0 - 0.3)) / (c1 + 0.3 - (c0 - 0.3))));
  return [-1.5 + 2.4 * k, 0, 0.1];
}

export const RoadSet: React.FC<{ t: number; f: number; c0: number; c1: number }> = ({ t, c0, c1 }) => {
  const p = runnerAt(t, c0, c1);
  const ph = Math.floor(t / 0.16) % 2;
  return (
    <group>
      <Sky top="#24264E" mid="#B8583A" hor="#F2A05A" />
      <fog attach="fog" args={["#C77A52", 5, 22]} />
      <SunDisc pos={[2.5, 1.2, -24]} size={6} />
      <Ground color="#B07A4A" r={40} bump={0.7} />
      <mesh position={[0, 0.004, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 0.7]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#C9945E" bumpMap={grainFine} bumpScale={0.7} />
      </mesh>
      {[[-2.5, -3.5, 2.4], [1.0, -4.5, 3.0], [4.0, -3.0, 2.2], [-4.5, -5.5, 3.2]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -r * 0.82, z]} castShadow receiveShadow>
          <sphereGeometry args={[r, 32, 16]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#A86E42" bumpMap={grain} bumpScale={0.4} />
        </mesh>
      ))}
      <Scatter seed={41} n={110} x={[-4, 4]} z={[-2.5, 2.5]} rock="#7A5032" keep={(x, z) => Math.abs(z - 0.1) > 0.4 || Math.abs(x) > 4} />
      {/* the caravan waiting at the end of the road */}
      <PixelSprite map={CAMEL_GRAIN} px={0.03} position={[1.55, 0, -0.35]} />
      <PixelSprite map={CAMEL_GRAIN} px={0.03} position={[2.25, 0, -0.55]} />
      <PixelSprite map={BRO_BACK[2]} px={0.034} position={[1.2, 0, -0.05]} />
      <PixelSprite map={BRO_BACK[3]} px={0.034} position={[1.95, 0, -0.1]} />
      {/* the runner carrying the folded shirt */}
      <PixelSprite map={ph ? RUNNER_B : RUNNER_A} px={0.034} position={p} bob={ph ? 0.012 : 0} />
      <Backer pos={p} w={0.42} h={0.5} opacity={0.1} />
    </group>
  );
};

// ---------------------------------------------------------------- BOOK (tunggu)
export const BOOK = { book: [0, 0.53, 0.05] as V3, glass: [0.5, 0.52, -0.12] as V3, top: 0.52 };

function pageTex(seed: number) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const g = c.getContext("2d")!;
  g.fillStyle = "#EDE0C0";
  g.fillRect(0, 0, 256, 320);
  const r = prng(seed);
  g.fillStyle = "#7A2A1E";
  g.fillRect(30, 26, 196, 6);
  for (let y = 50; y < 296; y += 16) {
    let x = 226;
    while (x > 34) {
      const w = 10 + r() * 34;
      g.fillStyle = `rgba(40,26,16,${0.55 + r() * 0.3})`;
      g.fillRect(x - w, y, w, 4 + (r() > 0.7 ? 2 : 0));
      x -= w + 6;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function glassFlip(t: number) {
  return ramp(t, W("menunggu") - 0.1, W("menunggu") + 0.8) + ramp(t, W("sekitar") - 0.2, W("sekitar") + 0.7);
}

export const BookSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const pages = useMemo(() => [pageTex(241), pageTex(242)], []);
  const floor = useMemo(() => ashlarTex(243, "#6E5640", "#34261A", 8), []);
  const flip = glassFlip(t);
  const leaf = ramp(t, W("ibnu") - 0.3, W("ibnu") + 0.6);
  return (
    <group>
      <color attach="background" args={["#0C0A10"]} />
      <fog attach="fog" args={["#16121A", 3, 10]} />
      <Ground color="#5E4A38" map={floor ?? undefined} bump={0.7} r={12} />
      {/* back wall with a moonlit window and shelves of scrolls */}
      <Block pos={[0, 0, -1.1]} size={[4, 2.4, 0.25]} color="#5E4834" />
      <mesh position={[1.05, 1.45, -0.97]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshBasicMaterial color="#3E5498" toneMapped={false} />
      </mesh>
      {[0.9, 1.35].map((y) => (
        <group key={y}>
          <Block pos={[-0.75, y, -0.88]} size={[1.3, 0.04, 0.26]} color={U.timber} bump={0.4} />
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[-1.3 + i * 0.18, y + 0.08, -0.86]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.16 + (i % 3) * 0.04, 12]} />
              <meshPhysicalMaterial {...POLISH.fabric} color={i % 2 ? "#D8C6A0" : "#C2A878"} />
            </mesh>
          ))}
        </group>
      ))}
      {/* the desk */}
      <Block pos={[0, 0.44, 0]} size={[1.7, 0.08, 0.95]} color="#5A3A22" bump={0.5} />
      {[[-0.75, -0.38], [0.75, -0.38], [-0.75, 0.38], [0.75, 0.38]].map(([x, z], i) => (
        <Block key={i} pos={[x, 0, z]} size={[0.08, 0.44, 0.08]} color="#4A2E1A" bump={0.4} />
      ))}
      {/* the open tafsir: leather boards + two pages; a leaf turns at "Ibnu Katsir" */}
      <group position={BOOK.book}>
        <mesh position={[0, -0.005, 0]} castShadow>
          <RoundedBoxGeo args={[0.62, 0.02, 0.42]} radius={0.008} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#6E2418" />
        </mesh>
        {[-1, 1].map((sd, i) => (
          <mesh key={i} position={[sd * 0.145, 0.02, 0]} rotation={[-Math.PI / 2, sd * 0.1, 0]}>
            <planeGeometry args={[0.28, 0.38]} />
            <meshStandardMaterial map={pages[i] ?? undefined} roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0, 0.03, 0]} rotation={[0, 0, -Math.PI * leaf]}>
          <mesh position={[0.14, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.28, 0.38]} />
            <meshStandardMaterial color="#E6D6B2" roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
        </mesh>
      </group>
      {/* the hourglass turns over at "menunggu" and again at "sekitar empat puluh tahun" */}
      <group position={[BOOK.glass[0], BOOK.glass[1] + 0.16, BOOK.glass[2]]} rotation={[0, 0.3, Math.PI * flip]}>
        <AssetModel id="an-hourglass-with-sand-ec9f11" size={0.32} ground position={[0, -0.16, 0]} />
      </group>
      <OilLamp f={f} pos={[-0.42, BOOK.top, 0.18]} power={0.9} />
      <AssetModel id="chained-book-lectern-381597" size={0.95} ground position={[-1.25, 0, -0.45]} rotation={[0, 0.5, 0]} />
      <Spot position={[1.05, 1.6, -0.9]} target={[0.2, 0.5, 0.2]} angle={0.55} penumbra={0.6} intensity={14} distance={6} decay={1.4} color="#7F9CFF" />
    </group>
  );
};

// ---------------------------------------------------------------- HILL (payoff, fajar)
export const HillSet: React.FC<{ t: number; f: number; c0: number }> = ({ t, c0 }) => {
  const walkers: { map: [typeof YUSUF_STAND, typeof YUSUF_STAND]; stand: typeof YUSUF_STAND; x: number; dz: number; px: number }[] = [
    { map: [YUSUF_STAND, YUSUF_STAND], stand: YUSUF_STAND, x: -0.05, dz: 0, px: 0.036 },
    { map: [YAQUB_STAND, YAQUB_STAND], stand: YAQUB_STAND, x: 0.25, dz: 0.05, px: 0.036 },
    ...[0, 1, 2, 3, 4, 0].map((k, i) => ({ map: [BRO_WALK_A[k], BRO_WALK_B[k]] as [typeof YUSUF_STAND, typeof YUSUF_STAND], stand: BRO_BACK[k], x: -0.55 + (i % 3) * 0.55 + (i > 2 ? 0.2 : 0), dz: 0.4 + (i > 2 ? 0.4 : 0), px: 0.034 })),
  ];
  const city = useMemo(() => {
    const r = prng(251);
    return Array.from({ length: 20 }, (_, i) => ({ x: (r() - 0.5) * 9, z: -5.5 - r() * 6, w: 0.6 + r() * 0.6, h: 0.5 + r() * 0.9, d: 0.6 + r() * 0.4, seed: 260 + i, lit: r() > 0.6 }));
  }, []);
  return (
    <group>
      <Sky top="#3A4E86" mid="#E89A7A" hor="#FFD49A" />
      <fog attach="fog" args={["#E8A684", 7, 32]} />
      <SunDisc pos={[0.4, 0.6, -30]} size={9} />
      {/* hilltop (flat crest) dropping to the plain where the city lies */}
      <mesh position={[0, -0.8, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 5.2, 1.6, 48]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#A6845A" bumpMap={grain} bumpScale={0.6} />
      </mesh>
      <Scatter seed={51} n={120} x={[-2.6, 2.6]} z={[-3, 2.2]} rock="#7E6244" shrub="#6E7A3A" keep={(x, z) => Math.hypot(x, z + 0.5) < 2.9 && Math.abs(x) > 0.7} />
      <group position={[0, -1.6, 0]}>
        <Ground color="#9A7A5A" r={60} bump={0.5} />
        {city.map((h, i) => <House key={i} {...h} />)}
        {[[-4.5, -7.5], [3.8, -8], [-2.0, -10.5], [4.8, -11]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.3} />)}
        <mesh position={[0, 0.01, -8.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 1.4]} />
          <meshPhysicalMaterial color="#7A9AAA" roughness={0.1} metalness={0.3} clearcoat={1} />
        </mesh>
        {[[-6, -18, 3.2], [-2.2, -20, 4.4], [3.6, -19, 3.0]].map(([x, z, s], i) => (
          <mesh key={i} position={[x, s * 0.5, z]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[s * 0.75, s, 4]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#D2A86E" bumpMap={grain} bumpScale={0.4} flatShading />
          </mesh>
        ))}
      </group>
      {/* the family walks together toward the sunrise */}
      {walkers.map((w, i) => (
        <Walker key={i} t={t} a={[w.x, 0, 0.6 + w.dz]} b={[w.x * 0.9, 0, -1.5 + w.dz]} t0={c0 - 0.5} t1={OUTRO_AT + 1} maps={w.map} stand={w.stand} px={w.px} />
      ))}
    </group>
  );
};
