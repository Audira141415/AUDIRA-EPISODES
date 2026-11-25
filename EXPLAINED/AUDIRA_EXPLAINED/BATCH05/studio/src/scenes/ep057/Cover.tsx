// AE-057 cover — "Kenapa Bata Ringan Lebih Ringan?" (CLAYWORLD).
// Plasticine tabletop: a clay balance scale tips toward a solid red brick; on the high pan sits a
// grey-white AAC block of the SAME size, its cut face full of small round air pores. Behind, a steel
// mould holds grey dough rising like bread with bubbles. In front, an AAC block split in two shows
// its pores. Facts on screen come only from RESEARCH_REPORT (air 60–85 % of volume; density
// ~575 vs ~1.564 kg/m³ from one test). Deterministic: frame clock + seeded hash only.

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CLAY_PALETTE as P } from "../../kits/clayworld/lib/palette";
import { stepFrame } from "../../kits/clayworld/core/motion";
import { MANROPE } from "../../core/type/fonts.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";

// ---------- palette ----------
export const C = {
  bg: "#5F9C97",
  sweep: "#6BA6A0",
  table: "#DDC8AB",
  aac: "#DCD8D0",
  aacShade: "#C9C4BA",
  brick: "#C2502E",
  brickDark: "#9E3C22",
  steel: "#7A8792",
  dough: "#CFCBC2",
  scale: P.mustard,
  ink: P.charcoal,
  cream: P.clayCream,
  title: "#FFF3DF",
  yellow: "#FFD86A",
};

// ---------- fonts ----------
export const ANTON = "EP057 Anton";
let antonLoading: Promise<void> | null = null;
export const useAnton = () => {
  const [handle] = useState(() => delayRender("EP057 Anton"));
  useEffect(() => {
    antonLoading ??= new FontFace(ANTON, `url(${staticFile("fonts/ep057/Anton-Regular.ttf")})`)
      .load()
      .then((f) => {
        (document.fonts as unknown as { add(face: FontFace): void }).add(f);
      });
    antonLoading.then(
      () => continueRender(handle),
      () => continueRender(handle),
    );
  }, [handle]);
};

// ---------- seeded helpers ----------
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Cut-face texture of aerated concrete: many small, nearly uniform round pores (not Swiss cheese).
 * Returns colour map + bump map. `w`/`h` = face aspect in pixels, `r` = mean pore radius in px.
 */
export const makePoreFace = (seed: number, w: number, h: number, r: number, base = C.aac, keep = 1) => {
  const col = document.createElement("canvas");
  const bmp = document.createElement("canvas");
  col.width = bmp.width = w;
  col.height = bmp.height = h;
  const g = col.getContext("2d")!;
  const b = bmp.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  b.fillStyle = "#c8c8c8";
  b.fillRect(0, 0, w, h);
  // fine speckle (sand / matrix)
  for (let i = 0; i < (w * h) / 60; i++) {
    const x = rnd(seed * 7 + i) * w, y = rnd(seed * 13 + i + 0.5) * h;
    g.fillStyle = rnd(i + seed) > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(90,80,70,0.10)";
    g.fillRect(x, y, 2, 2);
  }
  // jittered grid of pores
  const step = r * 2.15;
  let k = 0;
  for (let y = r * 0.6; y < h + r; y += step * 0.87) {
    const row = Math.round(y / step);
    for (let x = (row % 2) * step * 0.5; x < w + r; x += step) {
      k++;
      const jx = (rnd(seed + k * 3.1) - 0.5) * step * 0.55;
      const jy = (rnd(seed + k * 5.7) - 0.5) * step * 0.55;
      const rr = r * (0.55 + rnd(seed + k * 9.3) * 0.75);
      if (rnd(seed + k * 2.3) > keep) continue;
      const px = x + jx, py = y + jy;
      // pore: shadowed bowl, lit lower lip
      const gr = g.createRadialGradient(px, py - rr * 0.25, rr * 0.1, px, py, rr);
      gr.addColorStop(0, "#77706a");
      gr.addColorStop(0.7, "#9c958c");
      gr.addColorStop(1, "#b7b1a7");
      g.fillStyle = gr;
      g.beginPath();
      g.arc(px, py, rr, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.55)";
      g.lineWidth = Math.max(1.2, rr * 0.16);
      g.beginPath();
      g.arc(px, py, rr * 0.9, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
      const bg = b.createRadialGradient(px, py, 0, px, py, rr);
      bg.addColorStop(0, "#000");
      bg.addColorStop(0.75, "#444");
      bg.addColorStop(1, "#c8c8c8");
      b.fillStyle = bg;
      b.beginPath();
      b.arc(px, py, rr, 0, Math.PI * 2);
      b.fill();
    }
  }
  const map = new THREE.CanvasTexture(col);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  const bump = new THREE.CanvasTexture(bmp);
  return { map, bump };
};

// ---------- materials ----------
const ClayMat: React.FC<{ color: string; grain: THREE.Texture; bump?: number; rough?: number }> = ({ color, grain, bump = 3, rough }) => (
  <meshPhysicalMaterial {...POLISH.clay} roughness={rough ?? POLISH.clay.roughness} color={color} bumpMap={grain} bumpScale={bump} />
);

// ---------- AAC block with porous faces ----------
// faces order of BoxGeometry groups: +x, -x, +y, -y, +z, -z
export const AacBlock: React.FC<{
  size: [number, number, number];
  cutFaces: number[];
  seed: number;
  poreR?: number;
  grain: THREE.Texture;
}> = ({ size, cutFaces, seed, poreR = 26, grain }) => {
  const [w, h, d] = size;
  const faces = useMemo(() => {
    const dims: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    return dims.map(([a, bb], i) => {
      const px = 1024;
      const cut = cutFaces.includes(i);
      return makePoreFace(seed * 10 + i, px, Math.max(64, Math.round((px * bb) / a)), cut ? poreR : 6, cut ? C.aac : "#E2DED6", cut ? 1 : 0.22);
    });
  }, [w, h, d, cutFaces, seed, poreR]);
  return (
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={size} radius={0.035} segments={3} />
      {faces.map((f, i) => (
        <meshPhysicalMaterial
          key={i}
          attach={`material-${i}`}
          {...POLISH.clay}
          roughness={0.95}
          sheen={0.12}
          color="#ffffff"
          map={f.map}
          bumpMap={cutFaces.includes(i) ? f.bump : grain}
          bumpScale={cutFaces.includes(i) ? 6 : 2}
        />
      ))}
    </mesh>
  );
};

export const RedBrick: React.FC<{ size: [number, number, number]; grain: THREE.Texture }> = ({ size, grain }) => (
  <group>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={size} radius={0.06} segments={4} />
      <ClayMat color={C.brick} grain={grain} bump={4} />
    </mesh>
  </group>
);

// ---------- balance scale ----------
const BEAM_Y = 3.35;
const ARM = 2.35;
const HANG = 1.55;
export const TILT = 0.16; // left side (red brick) down
export const BLOCK: [number, number, number] = [1.3, 0.68, 0.85];

const Strings: React.FC<{ top: THREE.Vector3; panY: number; grain: THREE.Texture }> = ({ top, panY, grain }) => (
  <group>
    {[0, Math.PI, -Math.PI / 2].map((a, k) => {
      const bot = new THREE.Vector3(top.x + Math.cos(a) * 0.9, panY + 0.1, top.z + Math.sin(a) * 0.56);
      const mid = top.clone().add(bot).multiplyScalar(0.5);
      const len = top.distanceTo(bot);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), bot.clone().sub(top).normalize());
      return (
        <mesh key={k} position={mid} quaternion={q} castShadow>
          <cylinderGeometry args={[0.028, 0.028, len, 8]} />
          <ClayMat color={C.ink} grain={grain} bump={1} />
        </mesh>
      );
    })}
  </group>
);

const Pan: React.FC<{ y: number; x: number; grain: THREE.Texture }> = ({ x, y, grain }) => (
  <group position={[x, y, 0]}>
    <mesh scale={[1, 1, 0.64]} castShadow receiveShadow>
      <cylinderGeometry args={[0.98, 0.8, 0.16, 40]} />
      <ClayMat color={C.cream} grain={grain} />
    </mesh>
    <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.64, 1]} castShadow>
      <torusGeometry args={[0.98, 0.07, 10, 48]} />
      <ClayMat color={P.coral} grain={grain} />
    </mesh>
  </group>
);

/** Front plaque with "AUDIRA" pressed into a cream clay strip. */
const usePlaque = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = C.cream;
    g.fillRect(0, 0, 512, 128);
    g.font = `700 74px ${MANROPE}, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    (g as unknown as { letterSpacing: string }).letterSpacing = "18px";
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillText("AUDIRA", 265, 70);
    g.fillStyle = "#3a5f5c";
    g.fillText("AUDIRA", 262, 66);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

export const Scale: React.FC<{ tilt: number; grain: THREE.Texture; poreGrain: THREE.Texture }> = ({ tilt, grain, poreGrain }) => {
  const plaque = usePlaque();
  const lTop = new THREE.Vector3(-ARM * Math.cos(tilt), BEAM_Y - ARM * Math.sin(tilt), 0);
  const rTop = new THREE.Vector3(ARM * Math.cos(tilt), BEAM_Y + ARM * Math.sin(tilt), 0);
  const lPan = lTop.y - HANG;
  const rPan = rTop.y - HANG;
  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.3, 0.44, 1.3]} radius={0.16} />
        <ClayMat color={C.scale} grain={grain} />
      </mesh>
      <mesh position={[0, 0.24, 0.656]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshPhysicalMaterial {...POLISH.clay} map={plaque} color="#ffffff" bumpMap={grain} bumpScale={1.5} />
      </mesh>
      {/* post */}
      <mesh position={[0, 0.44 + (BEAM_Y - 0.44) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.19, BEAM_Y - 0.44, 24]} />
        <ClayMat color={C.scale} grain={grain} />
      </mesh>
      {/* beam */}
      <group position={[0, BEAM_Y, 0]} rotation={[0, 0, tilt]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.11, ARM * 2, 8, 18]} />
          <ClayMat color={C.scale} grain={grain} />
        </mesh>
        {/* pointer */}
        <mesh position={[0, 0.55, 0.05]} castShadow>
          <coneGeometry args={[0.09, 1.0, 16]} />
          <ClayMat color={C.ink} grain={grain} bump={1} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * ARM, 0, 0]} castShadow>
            <sphereGeometry args={[0.17, 20, 16]} />
            <ClayMat color={P.coral} grain={grain} />
          </mesh>
        ))}
      </group>
      {/* pivot knob */}
      <mesh position={[0, BEAM_Y, 0.12]} castShadow>
        <sphereGeometry args={[0.2, 22, 16]} />
        <ClayMat color={P.terracotta} grain={grain} />
      </mesh>
      {/* dial arc behind the pointer */}
      <mesh position={[0, BEAM_Y + 0.25, -0.12]}>
        <torusGeometry args={[0.85, 0.05, 8, 40, Math.PI * 0.5]} />
        <ClayMat color={C.cream} grain={grain} />
      </mesh>
      <Strings top={lTop} panY={lPan} grain={grain} />
      <Strings top={rTop} panY={rPan} grain={grain} />
      <Pan x={lTop.x} y={lPan} grain={grain} />
      <Pan x={rTop.x} y={rPan} grain={grain} />
      {/* loads: same size, different weight */}
      <group position={[lTop.x, lPan + 0.08 + BLOCK[1] / 2, 0]} rotation={[0, 0.06, 0]}>
        <RedBrick size={BLOCK} grain={grain} />
      </group>
      <group position={[rTop.x, rPan + 0.08 + BLOCK[1] / 2, 0]} rotation={[0, -0.06, 0]}>
        <AacBlock size={BLOCK} cutFaces={[4]} seed={3} poreR={20} grain={poreGrain} />
      </group>
    </group>
  );
};

// ---------- background mould with rising dough ----------
export const Mould: React.FC<{ grain: THREE.Texture; rise: number }> = ({ grain, rise }) => {
  const doughTex = useMemo(() => makePoreFace(41, 2048, 512, 6, C.dough, 0.5).map, []);
  const W = 6.6, D = 2.4, H = 1.35, T = 0.14;
  return (
    <group position={[0, 0, -5.2]}>
      {/* steel tin walls */}
      {[
        [0, H / 2, D / 2, W, H, T],
        [0, H / 2, -D / 2, W, H, T],
        [-W / 2, H / 2, 0, T, H, D],
        [W / 2, H / 2, 0, T, H, D],
      ].map(([x, y, z, a, b, c], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <RoundedBoxGeo args={[a, b, c]} radius={0.05} />
          <meshPhysicalMaterial color={C.steel} roughness={0.38} metalness={0.55} bumpMap={grain} bumpScale={0.8} clearcoat={0.3} />
        </mesh>
      ))}
      {/* rivets along the rim */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-W / 2 + 0.5 + i * ((W - 1) / 8), H - 0.2, D / 2 + T / 2 + 0.01]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshPhysicalMaterial color="#8d98a2" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* dough: fills the tin and domes above the rim like bread */}
      <mesh position={[0, H * 0.5, 0]}>
        <boxGeometry args={[W - T, H - 0.05, D - T]} />
        <meshPhysicalMaterial {...POLISH.clay} color={C.dough} />
      </mesh>
      <mesh position={[0, H - 0.05, 0]} scale={[W / 2 + 0.12, 1.45 + rise, D / 2 + 0.15]}>
        <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#ffffff" map={doughTex} bumpMap={grain} bumpScale={3} />
      </mesh>
      {/* gas bubbles popping out of the dough (colourless) */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = (rnd(i + 70) - 0.5) * (W - 1.6);
        const y = H + 1.6 + rise + rnd(i + 80) * 1.3;
        const r = 0.09 + rnd(i + 90) * 0.12;
        return (
          <mesh key={i} position={[x, y, (rnd(i + 99) - 0.5) * 1.2]}>
            <sphereGeometry args={[r, 20, 14]} />
            <meshPhysicalMaterial color="#f4fbff" roughness={0.05} transmission={0.6} thickness={0.2} clearcoat={1} transparent opacity={0.55} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- foreground: ONE AAC block snapped in two ----------
// Both halves share one jagged fracture surface f(y, z), so they would fit back together.
const SPLIT: [number, number, number] = [1.35, 1.05, 1.15];
const SPLIT_POS: [number, number, number] = [0.15, 0, 6.2];
const OPEN = 0.6; // each half turned this far (rad) so the fracture faces open toward camera
const HALF_X = 0.93;
const fracture = (y: number, z: number) => {
  const cell = (i: number, j: number) => rnd(i * 31.7 + j * 7.3 + 5) - 0.5;
  const gy = (y + 1) * 4.5, gz = (z + 1) * 4.5;
  const iy = Math.floor(gy), iz = Math.floor(gz), fy = gy - iy, fz = gz - iz;
  const v = (cell(iy, iz) * (1 - fy) + cell(iy + 1, iz) * fy) * (1 - fz) + (cell(iy, iz + 1) * (1 - fy) + cell(iy + 1, iz + 1) * fy) * fz;
  return v * 0.16 + Math.sin(y * 9.1 + 1.3) * Math.cos(z * 7.7) * 0.035;
};

const BrokenHalf: React.FC<{ side: 1 | -1; seed: number; grain: THREE.Texture }> = ({ side, seed, grain }) => {
  const [w, h, d] = SPLIT;
  const cutIdx = side === 1 ? 0 : 1;
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(w, h, d, 1, 18, 18);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      if (Math.abs(x - (side * w) / 2) < 1e-4) pos.setX(i, x + fracture(pos.getY(i), pos.getZ(i)));
    }
    g.computeVertexNormals();
    return g;
  }, [w, h, d, side]);
  const faces = useMemo(() => {
    const dims: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    return dims.map(([a, bb], i) => {
      const cut = i === cutIdx;
      return makePoreFace(seed * 10 + i, 1024, Math.max(64, Math.round((1024 * bb) / a)), cut ? 34 : 6, cut ? C.aac : "#E2DED6", cut ? 1 : 0.22);
    });
  }, [w, h, d, cutIdx, seed]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      {faces.map((f, i) => (
        <meshPhysicalMaterial
          key={i}
          attach={`material-${i}`}
          {...POLISH.clay}
          roughness={0.95}
          sheen={0.12}
          color="#ffffff"
          map={f.map}
          bumpMap={i === cutIdx ? f.bump : grain}
          bumpScale={i === cutIdx ? 6 : 2}
        />
      ))}
    </mesh>
  );
};

/** World points at the middle of each fracture face (for the leader lines). */
export const fracturePoints = (): [number, number, number][] =>
  ([-1, 1] as const).map((s) => {
    const cx = s * HALF_X + (-s) * (SPLIT[0] / 2) * Math.cos(OPEN);
    const cz = (SPLIT[0] / 2) * Math.sin(OPEN);
    return [SPLIT_POS[0] + cx, SPLIT[1] * 0.5, SPLIT_POS[2] + cz] as [number, number, number];
  });

const Crumb: React.FC<{ p: [number, number, number]; r: number; i: number }> = ({ p, r, i }) => (
  <mesh position={p} rotation={[rnd(i) * 3, rnd(i + 1) * 3, rnd(i + 2) * 3]} scale={[1, 0.7 + rnd(i + 3) * 0.4, 1]} castShadow receiveShadow>
    <dodecahedronGeometry args={[r, 0]} />
    <meshPhysicalMaterial {...POLISH.clay} roughness={0.95} color={C.aac} />
  </mesh>
);

export const SplitBlock: React.FC<{ grain: THREE.Texture }> = ({ grain }) => (
  <group position={SPLIT_POS}>
    <group position={[-HALF_X, SPLIT[1] / 2, 0]} rotation={[0, -OPEN, -0.03]}>
      <BrokenHalf side={1} seed={11} grain={grain} />
    </group>
    <group position={[HALF_X, SPLIT[1] / 2 + 0.01, 0.02]} rotation={[0, OPEN, 0.03]}>
      <BrokenHalf side={-1} seed={11} grain={grain} />
    </group>
    {/* chips fallen out of the break: in the gap and spilling forward */}
    {Array.from({ length: 12 }, (_, i) => {
      const t = rnd(i + 40);
      const x = (rnd(i + 5) - 0.5) * (0.25 + t * 0.9);
      const z = -0.2 + t * 1.3;
      const r = 0.04 + rnd(i + 25) * 0.07;
      return <Crumb key={i} i={i} p={[x, r * 0.6, z]} r={r} />;
    })}
  </group>
);

const Props: React.FC<{ grain: THREE.Texture }> = ({ grain }) => (
  <group>
    {/* steel cutting wire on a clay bow, resting on the table (blocks are cut by taut wire) */}
    <group position={[-2.3, 0.1, 8.2]} rotation={[0, 0.35, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.07, 10, 40, Math.PI]} />
        <ClayMat color={P.dustyTeal} grain={grain} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 1.7, 6]} />
        <meshPhysicalMaterial color="#c7ced4" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
    {/* near-camera chips in the lower frame */}
    {[[2.0, 7.9, 0.2], [2.7, 8.4, 0.14], [1.5, 8.7, 0.11], [-0.6, 8.6, 0.09], [3.3, 7.6, 0.1], [0.4, 8.9, 0.08]].map(([x, z, r], i) => (
      <Crumb key={`fg${i}`} i={i + 60} p={[x, r * 0.6, z]} r={r} />
    ))}
    {/* pebbles and rolled snakes on the modeller's table */}
    {[[3.4, 3.2, 0.2, P.terracotta], [-1.9, 2.4, 0.14, P.mustard], [3.7, 1.0, 0.16, P.coral], [-3.9, 1.4, 0.18, P.olive], [2.3, 5.6, 0.13, P.mustard]].map(([x, z, r, c], i) => (
      <mesh key={i} position={[x as number, (r as number) * 0.6, z as number]} scale={[1.2, 0.7, 1]} castShadow>
        <sphereGeometry args={[r as number, 18, 12]} />
        <ClayMat color={c as string} grain={grain} />
      </mesh>
    ))}
    <mesh position={[2.9, 0.1, 2.1]} rotation={[-Math.PI / 2, 0, 0.8]} castShadow>
      <torusGeometry args={[0.3, 0.1, 12, 40, Math.PI * 1.6]} />
      <ClayMat color={P.olive} grain={grain} />
    </mesh>
  </group>
);

// ---------- camera ----------
export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };
export const camAt = (f: number): Cam => {
  const sf = stepFrame(f, 4);
  return { pos: [0.2 + Math.sin(sf * 0.01) * 0.04, 7.0, 22.5], target: [0.1, 2.55, -0.5], fov: 34 };
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(...cam.pos);
    p.lookAt(...cam.target);
    p.fov = cam.fov;
    p.near = 0.1;
    p.far = 200;
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [cam, camera, gl]);
  return null;
};

export const project = (cam: Cam, p: [number, number, number]) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920 };
};

const Tag: React.FC<{ at: { x: number; y: number }; title: string; sub?: string; dx?: number; dy?: number; tone?: "light" | "brick" }> = ({ at, title, sub, dx = 0, dy = 0, tone = "light" }) => (
  <div
    style={{
      position: "absolute",
      left: at.x + dx,
      top: at.y + dy,
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      fontFamily: MANROPE,
      background: tone === "brick" ? "#B9482A" : "rgba(246,239,227,0.95)",
      color: tone === "brick" ? "#FFF1E2" : "#2E4A48",
      padding: "8px 24px 10px",
      borderRadius: 26,
      boxShadow: tone === "brick" ? "0 5px 0 #7A2C17" : "0 5px 0 rgba(48,80,77,0.55)",
      whiteSpace: "nowrap",
    }}
  >
    <div style={{ fontWeight: 600, fontSize: 36, lineHeight: 1.1 }}>{title}</div>
    {sub ? <div style={{ fontWeight: 500, fontSize: 28, lineHeight: 1.15, opacity: 0.9 }}>{sub}</div> : null}
  </div>
);

export const Cover: React.FC = () => {
  useAnton();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const sf = stepFrame(f, 4);
  const tilt = TILT + Math.sin(sf * 0.04) * 0.01;
  const rise = 0.05 + Math.sin(sf * 0.02) * 0.02;
  const cam = useMemo(() => camAt(f), [f]);
  const grain = useSurfaceGrain(17, 0.45, 3);
  const fineGrain = useSurfaceGrain(23, 0.3, 6);

  const lx = -ARM * Math.cos(TILT), rx = ARM * Math.cos(TILT);
  const lBrick = project(cam, [lx, BEAM_Y - ARM * Math.sin(TILT) - HANG - 0.55, 0.6]);
  const lAac = project(cam, [rx, BEAM_Y + ARM * Math.sin(TILT) - HANG - 0.55, 0.6]);
  const lAir = project(cam, [0.15, 1.45, 6.2]);
  const lPores = fracturePoints().map((p) => project(cam, p));

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ fov: cam.fov, near: 0.1, far: 200, position: cam.pos }}
      >
        <color attach="background" args={[C.bg]} />
        <CameraRig cam={cam} />
        <hemisphereLight args={["#fff4e6", "#4f625d", 0.32]} />
        <directionalLight
          position={[-7, 13, 7]}
          intensity={4.4}
          color="#ffe8c8"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={12}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-radius={2}
        />
        <pointLight position={[7, 4, 6]} intensity={8} color="#ffd6b0" />
        {/* cool rim from behind: separates silhouettes from the teal sweep */}
        <directionalLight position={[3, 8, -12]} intensity={2.0} color="#cfe8ff" />
        <directionalLight position={[-5, 5, -10]} intensity={1.0} color="#d8ecff" />
        {/* paper sweep and table */}
        <mesh position={[0, 0, -14]} receiveShadow>
          <planeGeometry args={[90, 60]} />
          <meshStandardMaterial color={C.sweep} roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[40, 64]} />
          <meshPhysicalMaterial {...POLISH.clay} color={C.table} bumpMap={fineGrain} bumpScale={1.5} />
        </mesh>
        <Mould grain={grain} rise={rise} />
        <Scale tilt={tilt} grain={grain} poreGrain={fineGrain} />
        <SplitBlock grain={fineGrain} />
        <Props grain={grain} />
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao />
      </ThreeCanvas>

      <AbsoluteFill style={{ transform: `scale(${width / 1080})`, transformOrigin: "0 0", width: 1080, height: 1920 }}>
        <div style={{ position: "absolute", top: 268, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: MANROPE, fontWeight: 600, fontSize: 32, letterSpacing: "0.42em", paddingLeft: "0.42em", color: "#183836" }}>AUDIRA EXPLAINED</div>
          <div style={{ fontFamily: `'${ANTON}'`, fontSize: 112, lineHeight: 1.0, marginTop: 16, color: C.title, textShadow: "0 6px 0 #2F5F5B, 0 12px 22px rgba(10,40,38,0.35)" }}>
            KENAPA BATA RINGAN
          </div>
          <div style={{ fontFamily: `'${ANTON}'`, fontSize: 160, lineHeight: 1.0, marginTop: 4, color: C.yellow, textShadow: "0 7px 0 #A8431F, 0 14px 24px rgba(70,30,10,0.35)" }}>
            LEBIH RINGAN?
          </div>
        </div>
        <Tag at={lBrick} title="bata merah" sub="±1.564 kg/m³" tone="brick" dy={48} />
        <Tag at={lAac} title="bata ringan" sub="±575 kg/m³" dy={48} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {lPores.map((p, i) => (
            <g key={i}>
              <line x1={lAir.x + (i ? 60 : -60)} y1={lAir.y + 40} x2={p.x} y2={p.y} stroke="#FFF3DF" strokeWidth={10} strokeLinecap="round" />
              <line x1={lAir.x + (i ? 60 : -60)} y1={lAir.y + 40} x2={p.x} y2={p.y} stroke="#2E4A48" strokeWidth={4} strokeLinecap="round" />
              <circle cx={p.x} cy={p.y} r={11} fill="#FFF3DF" stroke="#2E4A48" strokeWidth={4} />
            </g>
          ))}
        </svg>
        <Tag at={lAir} title="udara 60–85% volume" dy={12} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
