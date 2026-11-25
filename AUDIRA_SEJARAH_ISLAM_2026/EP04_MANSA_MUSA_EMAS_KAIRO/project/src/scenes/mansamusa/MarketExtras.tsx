// Market props that only matter after the hook (all outside the cover frustum or rising in later):
//  - the chronicler's desk (al-Umari wrote from what Cairo officials told him): open book, abstract
//    ink strokes (never real Arabic or Qur'anic text), a hand with a reed pen; no person.
//  - the price slate: 25 → 22 dirhams per mitsqal, then flat for about 12 years.
//  - the payoff: an empty chest by the gate, and the lender's counter with a loan scroll, and a
//    crate stencilled AUDIRA (the one in-world brand mark).

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { MM, Coin, grain } from "./CairoMarket.tsx";
import { PixelSprite, HAND_SIDE } from "./pixel.tsx";
import { W, ramp, smooth } from "./time.ts";

type V3 = [number, number, number];

// ---------- the chronicler's desk ----------
export const DESK = { pos: [1.75, 0, 2.0] as V3, rotY: -0.45 };

const Desk: React.FC<{ t: number }> = ({ t }) => {
  const write = ramp(t, W("al-umari") - 0.2, W("musa", 3) + 0.4);
  const strokes = useMemo(() => {
    const r = prng(51);
    // abstract cursive-like dashes in rows (decorative, not a script)
    return Array.from({ length: 22 }, (_, i) => ({ row: Math.floor(i / 4) % 6, page: i < 12 ? -1 : 1, x: (i % 4) * 0.075 + r() * 0.02, w: 0.04 + r() * 0.04, at: i / 22 }));
  }, []);
  // the pen glides along the stroke being written (no jumps between strokes)
  const fi = Math.min(strokes.length - 0.001, write * strokes.length);
  const cur = strokes[Math.floor(fi)];
  const nxt = strokes[Math.min(strokes.length - 1, Math.floor(fi) + 1)];
  const fr = fi - Math.floor(fi);
  const ax = cur.page * 0.2 - 0.14 + cur.x + cur.w * Math.min(1, fr * 1.25);
  const bx = nxt.page * 0.2 - 0.14 + nxt.x;
  const lift = smooth((fr - 0.8) / 0.2);
  const penX = ax + (bx - ax) * lift;
  const penZ = -0.14 + (cur.row + (nxt.row - cur.row) * lift) * 0.05;
  return (
    <group position={DESK.pos} rotation={[0, DESK.rotY, 0]}>
      <mesh position={[0, 0.27, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.0, 0.54, 0.62]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.5} />
      </mesh>
      {/* open book: two cream pages on a red leather cover */}
      <mesh position={[0, 0.555, 0]} castShadow>
        <boxGeometry args={[0.86, 0.02, 0.46]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={MM.red} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.2, 0.575, 0]} rotation={[0, 0, sd * -0.06]} receiveShadow>
          <boxGeometry args={[0.39, 0.012, 0.42]} />
          <meshPhysicalMaterial {...POLISH.paper} color="#EFE3C4" />
        </mesh>
      ))}
      {strokes.map((s, i) => {
        const k = smooth((write - s.at) * 22);
        if (k <= 0) return null;
        return (
          <mesh key={i} position={[s.page * 0.2 - 0.14 + s.x + (s.w * k) / 2, 0.584, -0.14 + s.row * 0.05]}>
            <boxGeometry args={[s.w * k, 0.002, 0.008]} />
            <meshBasicMaterial color="#2A1A10" />
          </mesh>
        );
      })}
      {/* hand with a reed pen, following the newest stroke */}
      <group position={[penX + 0.05, 0.6, penZ + 0.06]} rotation={[-0.4, 0, 0.3]}>
        <PixelSprite map={HAND_SIDE} px={0.016} position={[0.04, 0, 0]} />
        <mesh position={[-0.03, 0.06, 0]} rotation={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.004, 0.003, 0.2, 6]} />
          <meshStandardMaterial color="#C9A26A" roughness={0.6} />
        </mesh>
      </group>
      {/* inkpot and an oil lamp */}
      <mesh position={[0.4, 0.6, 0.18]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 16]} />
        <meshPhysicalMaterial {...POLISH.glossyEye} color="#1A1430" />
      </mesh>
      <mesh position={[-0.38, 0.6, 0.2]} castShadow>
        <sphereGeometry args={[0.06, 16, 10]} />
        <meshStandardMaterial color={MM.brass} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-0.33, 0.68, 0.2]}>
        <sphereGeometry args={[0.02, 10, 8]} />
        <meshBasicMaterial color={MM.lanternHot} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.3, 0.85, 0.3]} color={MM.lantern} intensity={2.2} distance={2.4} decay={2} />
    </group>
  );
};

// ---------- the price slate ----------
export const SLATE = { pos: [-2.45, 0, 1.0] as V3, rotY: 0.34, cy: 1.25, w: 0.92, h: 1.3 };
/** Board-local (x, y around the centre) → world. */
export function slatePoint(lx: number, ly: number): V3 {
  const c = Math.cos(SLATE.rotY), s = Math.sin(SLATE.rotY);
  return [SLATE.pos[0] + lx * c + 0.03 * s, SLATE.cy + ly, SLATE.pos[2] - lx * s + 0.03 * c];
}
export const CHART = { x0: -0.36, xDrop: -0.14, x1: 0.36, y25: 0.32, y22: -0.06, base: -0.46 };

const Slate: React.FC<{ t: number }> = ({ t }) => {
  const rise = ramp(t, W("menurut") - 1.6, W("menurut") - 0.2);
  const d25 = ramp(t, W("menurut") - 0.3, W("catatan"));
  const dDrop = ramp(t, W("catatan"), W("al-umari", 2) + 0.2);
  const dFlat = ramp(t, W("keadaan"), W("tahun") + 0.1);
  const y = (1 - rise) * -1.4;
  const seg = (x0: number, y0: number, x1: number, y1: number, k: number, key: string, col: string = MM.gold) => {
    if (k <= 0.001) return null;
    const ex = x0 + (x1 - x0) * k, ey = y0 + (y1 - y0) * k;
    const len = Math.hypot(ex - x0, ey - y0);
    return (
      <mesh key={key} position={[(x0 + ex) / 2, (y0 + ey) / 2, 0.035]} rotation={[0, 0, Math.atan2(ey - y0, ex - x0)]}>
        <boxGeometry args={[len + 0.04, 0.045, 0.025]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.1} metalness={0.5} roughness={0.3} />
      </mesh>
    );
  };
  const { x0, xDrop, x1, y25, y22 } = CHART;
  const ticks = 12;
  return (
    <group position={[SLATE.pos[0], y, SLATE.pos[2]]} rotation={[0, SLATE.rotY, 0]}>
      {[-0.36, 0.36].map((lx) => (
        <mesh key={lx} position={[lx, 0.35, -0.05]} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} />
        </mesh>
      ))}
      <group position={[0, SLATE.cy, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[SLATE.w + 0.1, SLATE.h + 0.1, 0.05]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[SLATE.w, SLATE.h]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#1F2A26" />
        </mesh>
        {/* axis */}
        <mesh position={[x0 - 0.04, 0, 0.03]}>
          <boxGeometry args={[0.01, SLATE.h * 0.8, 0.005]} />
          <meshBasicMaterial color="#C9C2B0" />
        </mesh>
        <mesh position={[0, CHART.base, 0.03]}>
          <boxGeometry args={[SLATE.w * 0.86, 0.012, 0.005]} />
          <meshBasicMaterial color="#C9C2B0" />
        </mesh>
        {seg(x0, y25, xDrop, y25, d25, "a")}
        {seg(xDrop, y25, xDrop, y22, dDrop, "b", "#E2553F")}
        {seg(xDrop, y22, x1, y22, dFlat, "c")}
        {/* 12 year ticks under the flat line */}
        {Array.from({ length: ticks }, (_, i) => {
          const u = (i + 1) / ticks;
          const k = smooth((dFlat - u + 0.08) * 8);
          if (k <= 0) return null;
          return (
            <mesh key={i} position={[xDrop + (x1 - xDrop) * u, CHART.base, 0.035]} scale={[1, k, 1]}>
              <boxGeometry args={[0.016, 0.08, 0.01]} />
              <meshBasicMaterial color="#F2E6C8" />
            </mesh>
          );
        })}
      </group>
      <pointLight position={[0.2, SLATE.cy + 0.4, 0.9]} color={MM.lanternHot} intensity={2.6} distance={2.6} decay={2} />
    </group>
  );
};

// ---------- payoff: the empty chest ----------
export const CHEST = { pos: [-0.3, 0, -1.9] as V3 };

const EmptyChest: React.FC<{ t: number }> = ({ t }) => {
  const up = ramp(t, W("tapi") - 1.2, W("tapi") + 0.2);
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  if (up <= 0.001) return null;
  const lid = ramp(t, W("dalam") - 0.6, W("dalam") + 0.5);
  return (
    <group position={[CHEST.pos[0], (1 - up) * -0.7, CHEST.pos[2]]} rotation={[0, 0.25, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.62, 0.4, 0.4]} radius={0.025} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.6} />
      </mesh>
      {/* dark empty interior */}
      <mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.54, 0.32]} />
        <meshStandardMaterial color="#120A06" roughness={1} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.04, 0.41, 0.41]} />
          <meshStandardMaterial color={MM.brass} metalness={0.9} roughness={0.35} />
        </mesh>
      ))}
      {/* lid swings open */}
      <group position={[0, 0.4, -0.2]} rotation={[-0.25 - lid * 1.6, 0, 0]}>
        <mesh position={[0, 0.03, 0.2]} castShadow>
          <RoundedBoxGeo args={[0.64, 0.07, 0.42]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} />
        </mesh>
      </group>
      {/* a warm top light isolates the chest from the lane (subject separation for the payoff beat) */}
      <primitive object={spotTarget} position={[0, 0.2, 0]} />
      <spotLight target={spotTarget} position={[0.35, 2.3, 1.2]} angle={0.45} penumbra={0.85} intensity={10 * up} color="#FFC07A" distance={5} decay={2} />
      {/* two slack empty sacks */}
      {[-0.5, 0.48].map((x, i) => (
        <mesh key={x} position={[x, 0.07, 0.12 * i]} scale={[1, 0.45, 1]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#B9A47E" />
        </mesh>
      ))}
    </group>
  );
};

// ---------- payoff: the lender's counter, the loan scroll, the AUDIRA crate ----------
export const LOAN = { table: [2.95, 0, -0.45] as V3, scroll: [2.85, 0.575, -0.72] as V3 };

function stencilTexture(text: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7A5230";
  g.fillRect(0, 0, 512, 512);
  // planks
  for (let i = 0; i < 4; i++) {
    g.fillStyle = i % 2 ? "#704A2A" : "#80583A";
    g.fillRect(0, i * 128 + 4, 512, 120);
  }
  const r = prng(17);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(40,24,12,${0.08 + r() * 0.12})`;
    g.fillRect(r() * 512, r() * 512, 20 + r() * 60, 2);
  }
  g.strokeStyle = "#2A170B";
  g.lineWidth = 10;
  g.strokeRect(36, 150, 440, 212);
  g.fillStyle = "#1E1009";
  g.font = "bold 112px Anton, 'MM Anton', Impact, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 262);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const LenderCounter: React.FC<{ t: number }> = ({ t }) => {
  const unroll = ramp(t, W("berutang") - 0.5, W("berutang") + 0.9);
  const slide = ramp(t, W("pada") - 0.1, W("kairo", 5) + 0.3);
  const tex = useMemo(() => stencilTexture("AUDIRA"), []);
  const len = 0.08 + 0.62 * unroll;
  return (
    <group>
      {/* the lender's low table */}
      <mesh position={[LOAN.table[0], 0.27, LOAN.table[2]]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.8, 0.54, 0.95]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.5} />
      </mesh>
      <mesh position={[LOAN.table[0], 0.545, LOAN.table[2]]} receiveShadow>
        <boxGeometry args={[0.7, 0.01, 0.85]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={MM.indigo} />
      </mesh>
      {/* loan scroll unrolling along the table */}
      <group position={LOAN.scroll}>
        <mesh position={[0, 0.006, len / 2]} receiveShadow>
          <boxGeometry args={[0.34, 0.006, len]} />
          <meshPhysicalMaterial {...POLISH.paper} color="#EFE3C4" />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const z = 0.1 + i * 0.075;
          if (z > len - 0.04) return null;
          return (
            <mesh key={i} position={[-0.02 + (i % 2) * 0.02, 0.011, z]}>
              <boxGeometry args={[0.2 - (i % 3) * 0.04, 0.002, 0.012]} />
              <meshBasicMaterial color="#3A2416" />
            </mesh>
          );
        })}
        <mesh position={[0, 0.03, len]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.36, 16]} />
          <meshPhysicalMaterial {...POLISH.paper} color="#E2D2AE" />
        </mesh>
        {/* red wax seal */}
        {unroll > 0.8 && (
          <mesh position={[0.1, 0.014, len - 0.1]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 20]} />
            <meshPhysicalMaterial {...POLISH.glossyEye} color="#9C1E1A" />
          </mesh>
        )}
        {/* coins lent across the counter */}
        {Array.from({ length: 6 }, (_, i) => (
          <Coin key={i} pos={[0.22 - slide * 0.08, 0.012 + i * 0.012, 0.42 - slide * 0.55]} r={0.045} />
        ))}
      </group>
      {/* crate stencilled AUDIRA beside the lender's table */}
      {/* plain base crate, the stencilled crate stacked on it so it clears the table */}
      <mesh position={[2.8, 0.25, -1.35]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.56, 0.5, 0.5]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.stone} color="#6A4428" bumpMap={grain} bumpScale={0.5} />
      </mesh>
      <group position={[2.8, 0.5, -1.33]} rotation={[0, 0.2, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.5, 0.48, 0.46]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color="#7A5230" bumpMap={grain} bumpScale={0.5} />
        </mesh>
        {tex && (
          <mesh position={[0, 0.24, 0.232]}>
            <planeGeometry args={[0.46, 0.44]} />
            <meshPhysicalMaterial {...POLISH.stone} map={tex} />
          </mesh>
        )}
      </group>
      <pointLight position={[3.2, 1.4, 0.3]} color={MM.lanternHot} intensity={2.2} distance={2.8} decay={2} />
    </group>
  );
};

export const MarketExtras: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <Desk t={t} />
    <Slate t={t} />
    <EmptyChest t={t} />
    <LenderCounter t={t} />
  </group>
);
