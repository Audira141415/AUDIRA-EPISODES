// AE-069 paper cutaway diorama: house -> sloped sewer pipe under the street -> IPAL (bar screen,
// aeration tank, round clarifier with scraper bridge) -> river. Three stepped terraces so the
// flow reads top-left to bottom in a 9:16 frame. Built only from PAPERWORLD kit primitives.
// Every moving value comes from `s` (seconds from useCurrentFrame); variation is seeded via hash01.

import React, { useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Cut, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { PaperBuilding } from "../../kits/paperworld/components/PaperBuilding.tsx";
import { PaperCloud, PaperHill, PaperTree, PaperBush } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { hash01 } from "../../kits/paperworld/motion/easing.ts";

// Water gets cleaner along the flow: sewage brown -> aeration brown -> clarifier grey-green -> outlet pale.
export const WATER = {
  sewage: "#6f4f35",
  screen: "#7a5838",
  aeration: "#8c6c47",
  clarifier: "#a3ad93",
  outlet: "#c3d3c6",
  river: "#88a9a0",
};
export const CONCRETE = "#d9d1c2";
export const CONCRETE_DEEP = "#b9b0a0";
export const PIPE = "#8e8a84";
const PIPE_IN = "#4b4642";

/** Paper slab: a rounded box made of cardstock (caps = face colour, sides = pale cut core). */
export const Slab: React.FC<{ w: number; h: number; d: number; color: string; position: V3; rotation?: V3; r?: number }> = ({ w, h, d, color, position, rotation, r = 0.04 }) => (
  <Cut shape={S.rectC(w, h, r)} color={color} depth={d} position={position} rotation={rotation} />
);

/** Flat sheet lying on a horizontal surface (top face at y). */
export const Sheet: React.FC<{ w: number; d: number; color: string; position: V3; r?: number; t?: number }> = ({ w, d, color, position, r = 0.05, t = 0.06 }) => (
  <Cut shape={S.rectC(w, d, r)} color={color} depth={t} position={[position[0], position[1] - t / 2, position[2]]} rotation={[-Math.PI / 2, 0, 0]} cast={false} />
);

/** Cutaway pipe drawn on a section face: grey wall, dark bore, sewage filling the lower part. */
export const CutPipe: React.FC<{ a: [number, number]; b: [number, number]; z: number; water?: string; fill?: number; s: number }> = ({ a, b, z, water = WATER.sewage, fill = 0.5, s }) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z];
  const bore = 0.74;
  const wh = bore * fill;
  const n = Math.max(1, Math.floor(L / 1.6));
  return (
    <group position={mid} rotation={[0, 0, ang]}>
      <Slab w={L + 0.9} h={1.1} d={0.3} color={PIPE} position={[0, 0, 0]} r={0.12} />
      <Slab w={L + 0.9} h={bore} d={0.05} color={PIPE_IN} position={[0, 0, 0.17]} r={0.05} />
      <Slab w={L + 0.9} h={wh} d={0.05} color={water} position={[0, -bore / 2 + wh / 2, 0.21]} r={0.04} />
      {/* little paper chevrons drifting with the flow */}
      {Array.from({ length: n }, (_, i) => {
        const x = -L / 2 + ((((i + 0.5) / n + s * 0.08) % 1) * L);
        return (
          <Cut key={i} shape={S.poly("chev", [[-0.12, -0.1], [0.06, 0], [-0.12, 0.1], [-0.05, 0]])} color="#a07a55" depth={0.03}
            position={[x, -bore / 2 + wh * 0.5, 0.25]} scale={1.1} cast={false} />
        );
      })}
    </group>
  );
};

/** Ground-layer strata on a section face, from y0 (top) down to y1. */
export const Strata: React.FC<{ x0: number; x1: number; y0: number; y1: number; z: number; seed: number }> = ({ x0, x1, y0, y1, z, seed }) => {
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const h = y0 - y1;
  const bands = [
    { c: "#c79c74", top: 0.0, bot: 0.38 },
    { c: "#a97b58", top: 0.38, bot: 0.72 },
    { c: "#8a5f44", top: 0.72, bot: 1.0 },
  ];
  return (
    <group>
      <Slab w={w} h={0.45} d={0.08} color="mintDeep" position={[cx, y0 - 0.22, z + 0.02]} r={0.02} />
      {bands.map((b, i) => (
        <Slab key={i} w={w} h={h * (b.bot - b.top) - 0.02} d={0.06} color={b.c} position={[cx, y0 - h * (b.top + b.bot) / 2 - 0.2, z - 0.02 * i]} r={0.02} />
      ))}
      {/* pebbles cut into the soil */}
      {Array.from({ length: 16 }, (_, i) => {
        const px = x0 + 0.6 + hash01(seed + i * 3.1) * (w - 1.2);
        const py = y1 + 0.4 + hash01(seed + i * 7.7) * (h - 1.4);
        const r = 0.09 + hash01(seed + i * 1.3) * 0.16;
        return <Cut key={i} shape={S.ellipse(r * 1.4, r)} color="#e2cfb3" depth={0.04} position={[px, py, z + 0.06]} cast={false} />;
      })}
    </group>
  );
};

/** Board with "AUDIRA" printed on it (canvas texture, drawn once, deterministic). */
const AudiraSign: React.FC<{ position: V3; w?: number }> = ({ position, w = 3.2 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#faf4e8";
    g.fillRect(0, 0, 512, 128);
    g.strokeStyle = "#435e95";
    g.lineWidth = 10;
    g.strokeRect(10, 10, 492, 108);
    g.fillStyle = "#3b2a22";
    g.font = "900 84px 'Arial Black', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 68);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  const h = w / 4;
  return (
    <group position={position}>
      <Slab w={w + 0.16} h={h + 0.16} d={0.12} color="cobaltDeep" position={[0, 0, 0]} />
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
};

export const Arrow: React.FC<{ position: V3; rot: number; color?: string; size?: number; flat?: boolean }> = ({ position, rot, color = "coral", size = 1, flat = false }) => (
  <group position={position} rotation={flat ? [-Math.PI / 2, 0, rot] : [0, 0, rot]} scale={size}>
    <Cut shape={S.poly("arrow", [[-0.5, -0.14], [0.12, -0.14], [0.12, -0.32], [0.55, 0], [0.12, 0.32], [0.12, 0.14], [-0.5, 0.14]])} color={color} depth={0.08} />
  </group>
);

// ── Terrace 1: street with house, sewer main in the cut face ─────────────────────────────────
export const T1_FACE = -2;
export const T2_TOP = -8;
export const T2_FACE = 8;
export const T3_TOP = -11.5;

const PIPE_A: [number, number] = [-6.0, -2.3];
const PIPE_B: [number, number] = [8.4, -4.3];
const pipeY = (x: number) => PIPE_A[1] + ((x - PIPE_A[0]) / (PIPE_B[0] - PIPE_A[0])) * (PIPE_B[1] - PIPE_A[1]);

/** Film-only switches. Undefined = the approved cover, unchanged. */
export type FilmFlags = { sewer: number; lite: boolean };

const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const Street: React.FC<{ s: number; f?: FilmFlags }> = ({ s, f }) => {
  const sw = f ? f.sewer : 1;
  const main = Math.min(1, sw / 0.75);
  const drop = Math.max(0, (sw - 0.75) / 0.25);
  return (
  <group>
    {/* terrace block */}
    <Slab w={21} h={8} d={14} color="#a97b58" position={[0, -4, T1_FACE - 7]} r={0.02} />
    <Sheet w={21} d={14} color="mintLight" position={[0, 0.02, T1_FACE - 7]} />
    <Strata x0={-10.5} x1={10.5} y0={0} y1={-8} z={T1_FACE + 0.06} seed={11} />
    {/* road + kerb + manhole */}
    <Sheet w={13.5} d={3.6} color="#9c968c" position={[3.6, 0.1, T1_FACE - 2.2]} />
    <Sheet w={13.5} d={0.5} color={CONCRETE} position={[3.6, 0.16, T1_FACE - 4.25]} />
    {Array.from({ length: 5 }, (_, i) => (
      <Sheet key={i} w={1.1} d={0.16} color="ivoryLight" position={[-1.6 + i * 2.6, 0.14, T1_FACE - 2.2]} />
    ))}
    <group position={[3, 0.13, T1_FACE - 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
      <Cut shape={S.circle(0.62)} color="#5e5a55" depth={0.06} cast={false} />
      <Cut shape={S.ring(0.4, 0.5)} color="#77726b" depth={0.08} cast={false} />
    </group>
    {/* manhole shaft cut open down to the main */}
    <group scale={[1, Math.max(0.001, Math.min(1, main * 1.6)), 1]} visible={main > 0.01}>
    <Slab w={1.4} h={-pipeY(3) - 0.2} d={0.06} color="#5c5049" position={[3, (pipeY(3) + 0.2) / 2, T1_FACE + 0.14]} r={0.02} />
    {[-1, 1].map((k) => (
      <Slab key={k} w={0.18} h={-pipeY(3) - 0.2} d={0.1} color={CONCRETE_DEEP} position={[3 + k * 0.78, (pipeY(3) + 0.2) / 2, T1_FACE + 0.16]} r={0.02} />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <Slab key={i} w={0.7} h={0.07} d={0.08} color="#d4c7b2" position={[3, -0.6 - i * 0.62, T1_FACE + 0.2]} r={0.02} />
    ))}
    </group>
    {/* house: bathroom + toilet branches join one house connection */}
    <PaperBuilding b={{ w: 5.2, d: 4, h: 4.0, roof: "gable", rh: 1.9, wall: "coralLight", roofColor: "coralDeep", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 1, door: "mint", seed: 3 }}
      position={[-6.2, 0, T1_FACE - 4.6]} yaw={0.18} />
    <PaperTree kind="round" h={4.2} color="mint" position={[-9.3, 0, T1_FACE - 6.5]} />
    <PaperBush w={1.8} color="mintDeep" position={[-2.6, 0, T1_FACE - 3.6]} />
    <CutPipe a={[-7.6, -0.2]} b={[-7.6, -1.6]} z={T1_FACE + 0.2} water={WATER.screen} fill={0.35} s={s} />
    <CutPipe a={[-4.6, -0.2]} b={[-4.6, -1.6]} z={T1_FACE + 0.2} water={WATER.sewage} fill={0.35} s={s} />
    <CutPipe a={[-7.6, -1.9]} b={[-4.6, -1.9]} z={T1_FACE + 0.22} fill={0.4} s={s} />
    <CutPipe a={[-6.0, -1.9]} b={[-6.0, -2.3]} z={T1_FACE + 0.24} fill={0.4} s={s} />
    {main > 0.01 ? <CutPipe a={PIPE_A} b={lerp2(PIPE_A, PIPE_B, main)} z={T1_FACE + 0.26} fill={0.5} s={s} /> : null}
    {drop > 0.01 ? <CutPipe a={[PIPE_B[0], PIPE_B[1]]} b={lerp2(PIPE_B, [PIPE_B[0], T2_TOP + 0.5], drop)} z={T1_FACE + 0.28} fill={0.5} s={s} /> : null}
    {sw >= 0.999 ? <Arrow position={[1.2, pipeY(1.2) + 1.05, T1_FACE + 0.3]} rot={Math.atan2(PIPE_B[1] - PIPE_A[1], PIPE_B[0] - PIPE_A[0])} size={f ? 2.0 : 1.6} /> : null}
  </group>
  );
};

// ── Terrace 2: the treatment plant ───────────────────────────────────────────────────────────
export const SCREEN_X = 7.6;
export const AER = { x0: -1.4, x1: 5.4, z0: 0.4, z1: 6.6, h: 2.3 };
export const CLAR = { x: -5.6, z: 3.4, r: 3.0, h: 1.4 };

export const TankWall: React.FC<{ a: [number, number]; b: [number, number]; h: number; y0: number; t?: number }> = ({ a, b, h, y0, t = 0.28 }) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const yaw = -Math.atan2(b[1] - a[1], b[0] - a[0]);
  return <Slab w={L + t} h={h} d={t} color={CONCRETE} position={[(a[0] + b[0]) / 2, y0 + h / 2, (a[1] + b[1]) / 2]} rotation={[0, yaw, 0]} r={0.03} />;
};

const Plant: React.FC<{ s: number; f?: FilmFlags }> = ({ s, f }) => {
  const lite = !!f?.lite;
  const y0 = T2_TOP;
  const wl = y0 + AER.h - 0.35; // aeration water level
  const aw = AER.x1 - AER.x0;
  const ad = AER.z1 - AER.z0;
  const acx = (AER.x0 + AER.x1) / 2;
  const acz = (AER.z0 + AER.z1) / 2;
  return (
    <group>
      <Slab w={21} h={y0 - T3_TOP} d={10} color="#a97b58" position={[0, (y0 + T3_TOP) / 2, T2_FACE - 5]} r={0.02} />
      <Sheet w={21} d={10} color={CONCRETE_DEEP} position={[0, y0 + 0.02, T2_FACE - 5]} />
      <Sheet w={21} d={1.4} color="mintLight" position={[0, y0 + 0.05, T2_FACE - 0.7]} />
      <Strata x0={-10.5} x1={10.5} y0={y0} y1={T3_TOP} z={T2_FACE + 0.06} seed={29} />

      {/* inlet: pipe from the street drops into the bar-screen channel */}
      <mesh position={[PIPE_B[0], y0 + 0.75, -1.0]} rotation={[Math.PI / 2, 0, 0]} material={paperFace(PIPE)} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 2.2, 20]} />
      </mesh>
      {/* bar screen channel */}
      {[SCREEN_X - 1.3, SCREEN_X + 1.3].map((x) => (
        <TankWall key={x} a={[x, -1.4]} b={[x, 5.6]} h={1.5} y0={y0} t={0.24} />
      ))}
      <TankWall a={[SCREEN_X - 1.3, 5.6]} b={[SCREEN_X + 1.3, 5.6]} h={0.7} y0={y0} t={0.24} />
      <Sheet w={2.4} d={7} color={WATER.sewage} position={[SCREEN_X, y0 + 1.05, 2.1]} />
      {/* inclined steel bars with caught rags */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[SCREEN_X - 1.0 + i * 0.25, y0 + 1.15, 2.4]} rotation={[-0.55, 0, 0]} material={paperFace("#4e4b48", { relief: 0.3 })} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 2.0, 8]} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Cut key={i} shape={S.ellipse(0.22 + hash01(i * 4.3) * 0.14, 0.1)} color={["ivoryLight", "cobaltLight", "coralLight", "goldLight"][i]} depth={0.05}
          position={[SCREEN_X - 0.8 + i * 0.5, y0 + 1.2 + hash01(i * 2.9) * 0.4, 2.1 + hash01(i) * 0.4]} rotation={[-0.55, 0, hash01(i * 9.1) * 2]} />
      ))}
      {/* screenings bin */}
      <Slab w={1.5} h={1.0} d={1.2} color="gold" position={[SCREEN_X + 2.1, y0 + 0.5, 0.2]} r={0.08} />
      {/* flume to the aeration tank */}
      {!lite ? <Sheet w={1.2} d={1.0} color={WATER.screen} position={[AER.x1 + 0.6, y0 + 1.2, 4.9]} /> : null}
      {!lite ? <Arrow position={[AER.x1 + 0.7, y0 + 1.3, 4.9]} rot={Math.PI} flat size={0.8} /> : null}

      {/* aeration tank: front wall cut away to show the bubble curtain */}
      <TankWall a={[AER.x0, AER.z0]} b={[AER.x1, AER.z0]} h={AER.h} y0={y0} />
      <TankWall a={[AER.x0, AER.z0]} b={[AER.x0, AER.z1]} h={AER.h} y0={y0} />
      <TankWall a={[AER.x1, AER.z0]} b={[AER.x1, AER.z1]} h={AER.h} y0={y0} />
      <TankWall a={[AER.x0, AER.z1]} b={[AER.x1, AER.z1]} h={0.45} y0={y0} />
      <Slab w={aw - 0.3} h={wl - y0 - 0.45} d={ad - 0.3} color={WATER.aeration} position={[acx, (wl + y0 + 0.45) / 2, acz]} r={0.03} />
      {/* diffuser discs along the floor, seen through the cut */}
      {Array.from({ length: 6 }, (_, i) => (
        <Slab key={i} w={0.55} h={0.12} d={0.1} color="#3f3b38" position={[AER.x0 + 0.8 + i * 1.03, y0 + 0.62, AER.z1 - 0.1]} r={0.05} />
      ))}
      {/* rising bubbles on the cut face (seeded, loop with time) */}
      {Array.from({ length: 72 }, (_, i) => {
        const col = i % 6;
        const ph = (hash01(i * 3.7 + 1) + s * (0.35 + hash01(i * 1.9) * 0.2)) % 1;
        const x = AER.x0 + 0.8 + col * 1.03 + (hash01(i * 5.3) - 0.5) * 0.7 + Math.sin(ph * 6 + i) * 0.08;
        const y = y0 + 0.8 + ph * (wl - y0 - 1.0);
        const r = 0.04 + hash01(i * 8.1) * 0.06;
        return <Cut key={i} shape={S.circle(r)} color="ivoryLight" depth={0.04} position={[x, y, AER.z1 - 0.12]} cast={false} />;
      })}
      {/* foam on the surface */}
      {Array.from({ length: lite ? 4 : 9 }, (_, i) => {
        const x = AER.x0 + 0.8 + hash01(i * 2.2 + 7) * (aw - 1.6);
        const z = AER.z0 + 0.8 + hash01(i * 6.6 + 3) * (ad - 1.6);
        const w = (0.9 + hash01(i * 4.4) * 0.9) * (lite ? 0.55 : 1);
        return (
          <Cut key={i} shape={S.cloud(w, w * 0.55, 3)} color="ivoryLight" depth={0.1} position={[x, wl + 0.06, z]} rotation={[-Math.PI / 2, 0, hash01(i * 9.9) * 6.28]} cast={false} />
        );
      })}
      {Array.from({ length: lite ? 10 : 22 }, (_, i) => {
        const x = AER.x0 + 0.5 + hash01(i * 3.3 + 2) * (aw - 1.0);
        const z = AER.z0 + 0.5 + hash01(i * 7.1 + 5) * (ad - 1.0);
        const pulse = 0.75 + 0.25 * Math.sin(s * 3 + i * 1.7);
        return (
          <mesh key={i} position={[x, wl + 0.08, z]} scale={pulse * (lite ? 0.7 : 1)} material={paperFace("ivoryLight", { relief: 0.2 })}>
            <sphereGeometry args={[0.13 + hash01(i * 2.7) * 0.1, 12, 8]} />
          </mesh>
        );
      })}

      {/* blower house (with the AUDIRA board) feeding air pipes to the tank */}
      <PaperBuilding b={{ w: 5.4, d: 1.8, h: 2.9, roof: "flat", wall: "cobaltLight", roofColor: "cobaltDeep", trim: "ivoryLight", window: "cobaltDeep", cols: 3, rows: 1, seed: 21 }}
        position={[2.0, y0, -1.0]} />
      <AudiraSign position={[2.0, y0 + 3.75, -0.2]} w={3.4} />
      {[0.6, 3.4].map((x) => (
        <group key={x}>
          <mesh position={[x, y0 + 2.6, -0.05]} rotation={[Math.PI / 2, 0, 0]} material={paperFace("#7c7872")} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 1.0, 12]} />
          </mesh>
          <mesh position={[x, y0 + 1.6, 0.45]} material={paperFace("#7c7872")} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 2.1, 12]} />
          </mesh>
        </group>
      ))}

      {/* flume aeration -> clarifier */}
      <Sheet w={1.6} d={0.9} color={WATER.aeration} position={[AER.x0 - 0.7, y0 + 1.3, 3.4]} />

      {/* round clarifier with rotating scraper bridge */}
      <group position={[CLAR.x, y0, CLAR.z]}>
        <mesh position={[0, CLAR.h / 2, 0]} material={paperFace(CONCRETE, { doubleSide: true })} castShadow receiveShadow>
          <cylinderGeometry args={[CLAR.r, CLAR.r, CLAR.h, 64, 1, true]} />
        </mesh>
        <Cut shape={S.ring(CLAR.r - 0.12, CLAR.r + 0.12)} color={CONCRETE_DEEP} depth={0.12} position={[0, CLAR.h, 0]} rotation={[-Math.PI / 2, 0, 0]} segments={64} />
        <Cut shape={S.circle(CLAR.r - 0.05)} color={WATER.clarifier} depth={0.08} position={[0, CLAR.h - 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} segments={64} cast={false} />
        {/* weir channel ring (cleaner water at the edge) */}
        <Cut shape={S.ring(CLAR.r - 0.55, CLAR.r - 0.12)} color={WATER.outlet} depth={0.06} position={[0, CLAR.h - 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]} segments={64} cast={false} />
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const rr = CLAR.r - 0.55;
          return <Slab key={i} w={0.16} h={0.14} d={0.04} color={CONCRETE} position={[Math.cos(a) * rr, CLAR.h - 0.05, Math.sin(a) * rr]} rotation={[0, -a + Math.PI / 2, 0]} r={0.01} />;
        })}
        <mesh position={[0, CLAR.h * 0.6, 0]} material={paperFace(CONCRETE_DEEP)} castShadow>
          <cylinderGeometry args={[0.45, 0.5, CLAR.h * 1.2, 24]} />
        </mesh>
        <group rotation={[0, 0.9 + s * 0.12, 0]} position={[0, CLAR.h + 0.35, 0]}>
          <Slab w={CLAR.r + 0.2} h={0.18} d={0.5} color="goldDeep" position={[(CLAR.r + 0.2) / 2, 0, 0]} />
          <Slab w={CLAR.r + 0.2} h={0.4} d={0.05} color="gold" position={[(CLAR.r + 0.2) / 2, 0.3, 0.24]} r={0.02} />
          <Slab w={0.5} h={0.6} d={0.7} color="goldDeep" position={[CLAR.r + 0.1, -0.1, 0]} />
        </group>
      </group>

      {/* outlet: clarifier -> pipe down the cut face -> river */}
      <mesh position={[-8.4, y0 + 0.8, 5.6]} rotation={[Math.PI / 2, 0, 0]} material={paperFace(PIPE)} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 4.8, 20]} />
      </mesh>
      <CutPipe a={[-8.4, y0 + 0.6]} b={[-8.4, T3_TOP + 1.3]} z={T2_FACE + 0.2} water={WATER.outlet} fill={0.55} s={s} />
      <Arrow position={[-7.2, y0 - 1.4, T2_FACE + 0.3]} rot={-Math.PI / 2} size={0.8} color="mintDeep" />
    </group>
  );
};

// ── Terrace 3: river ────────────────────────────────────────────────────────────────────────
const River: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Sheet w={40} d={30} color="#a97b58" position={[0, T3_TOP - 0.4, T2_FACE + 15]} />
    <Sheet w={40} d={5.5} color={WATER.river} position={[0, T3_TOP + 0.02, T2_FACE + 3.2]} />
    <Sheet w={40} d={22} color="mintLight" position={[0, T3_TOP + 0.08, T2_FACE + 17]} />
    {/* falling outlet stream + ripples */}
    <Slab w={0.5} h={1.4} d={0.12} color={WATER.outlet} position={[-8.4, T3_TOP + 0.7, T2_FACE + 0.55]} r={0.2} />
    {[0, 1, 2].map((i) => {
      const ph = (s * 0.4 + i / 3) % 1;
      const r = 0.4 + ph * 1.6;
      return <Cut key={i} shape={S.ring(r - 0.06, r)} color="#d6e3dc" depth={0.03} position={[-8.4, T3_TOP + 0.08, T2_FACE + 1.1]} rotation={[-Math.PI / 2, 0, 0]} cast={false} />;
    })}
    {Array.from({ length: 7 }, (_, i) => {
      const x = -14 + ((i * 4.3 + s * 0.6) % 28);
      return <Sheet key={i} w={1.6} d={0.1} color="#b5ccc4" position={[x, T3_TOP + 0.07, T2_FACE + 1.8 + hash01(i * 3.3) * 3]} />;
    })}
    {/* reeds on the near bank */}
    {Array.from({ length: 12 }, (_, i) => (
      <Cut key={i} shape={S.poly("reed", [[-0.08, 0], [0.08, 0], [0.02, 1.4], [-0.02, 1.4]])} color={i % 2 ? "mintDeep" : "mint"} depth={0.04}
        position={[-6 + i * 1.3 + hash01(i * 2.1), T3_TOP, T2_FACE + 6.2 + hash01(i * 4.4) * 0.6]} rotation={[0, 0, (hash01(i * 7.7) - 0.5) * 0.4]} scale={0.7 + hash01(i) * 0.6} />
    ))}
  </group>
);

// ── Background: town and hills behind the street ───────────────────────────────────────────
const Backdrop: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <PaperHill w={46} h={6.5} color="mintLight" position={[-4, 0, -26]} skew={3} />
    <PaperHill w={36} h={6.5} color="mint" position={[10, 0, -22]} skew={-2} />
    <PaperBuilding b={{ w: 3.4, d: 3, h: 4.4, roof: "flat", wall: "goldLight", roofColor: "goldDeep", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 2, facadeOnly: true, seed: 5 }} position={[1.5, 0, -17]} />
    <PaperBuilding b={{ w: 4, d: 3, h: 3.4, roof: "gable", wall: "ivoryLight", roofColor: "cobalt", trim: "ivoryShade", window: "cobaltDeep", cols: 2, rows: 2, facadeOnly: true, seed: 8 }} position={[6.5, 0, -16]} />
    <PaperBuilding b={{ w: 3.2, d: 3, h: 3.6, roof: "gable", wall: "mint", roofColor: "coralDeep", trim: "ivoryLight", window: "brownDeep", cols: 1, rows: 1, facadeOnly: true, seed: 12 }} position={[-2.6, 0, -15]} />
    <PaperTree kind="cone" h={5} color="mintDeep" position={[9.5, 0, -12]} />
    <PaperTree kind="round" h={3.6} color="mint" position={[-1, 0, -11]} />
    <PaperCloud w={4.2} color="ivoryLight" position={[-6.5, 14 + Math.sin(s * 1.2) * 0.12, -20]} threadTo={20} />
    <PaperCloud w={3.4} color="ivoryLight" position={[7.5, 15.5 + Math.sin(s * 1.0 + 1) * 0.12, -22]} threadTo={20} />
  </group>
);

export const Diorama: React.FC<{ s: number; film?: FilmFlags }> = ({ s, film }) => (
  <group>
    <Backdrop s={s} />
    <Street s={s} f={film} />
    <Plant s={s} f={film} />
    <River s={s} />
  </group>
);
