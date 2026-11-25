// AE-057 film sets (CLAYWORLD). All sets live on one long modeller's table (x axis) plus a
// "macro" zone far below (y = MY) for the inside-the-dough shots. Every motion is a pure
// function of the VO clock `t` (seconds) and seeded hashes, so render tabs agree.
// Facts drawn here follow RESEARCH_REPORT "Saran visual akurat": small near-uniform round pores,
// colourless H2 bubbles (no fire), taut steel wire cutting, horizontal steam autoclave, ±2.4x heat.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CLAY_PALETTE as P } from "../../kits/clayworld/lib/palette";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { MANROPE } from "../../core/type/fonts.ts";
import { C, rnd, makePoreFace, AacBlock } from "./Cover.tsx";

export type V3 = [number, number, number];

// ---------- set anchors ----------
export const KX = -56; // kiln (red brick)
export const FX = -44; // AAC factory: mixer + steel moulds
export const CX = -24; // wire cutting + autoclave
export const AX = 12; // payoff: air fraction
export const HX = 28; // payoff: heat + water walls
export const MY = -80; // macro zone (inside the dough)
export const XX = 20; // macro: crystal pore (x inside macro zone)

// ---------- small helpers ----------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, d: number) => clamp01((t - a) / d);
export const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
export const backOut = (x: number) => {
  const u = clamp01(x);
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};
/** stop-motion hold: clay animation steps on 2s at 30 fps */
export const stepT = (t: number) => Math.floor(t * 15) / 15;

export const ClayMat: React.FC<{ color: string; grain: THREE.Texture; bump?: number; rough?: number; emissive?: string; ei?: number }> = ({ color, grain, bump = 3, rough, emissive, ei = 0 }) => (
  <meshPhysicalMaterial {...POLISH.clay} roughness={rough ?? POLISH.clay.roughness} color={color} bumpMap={grain} bumpScale={bump} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
);
const Steel: React.FC<{ grain: THREE.Texture; color?: string }> = ({ grain, color = C.steel }) => (
  <meshPhysicalMaterial color={color} roughness={0.34} metalness={0.62} bumpMap={grain} bumpScale={0.6} clearcoat={0.35} clearcoatRoughness={0.3} />
);

// ---------- contact shadow blob (tightens contact under objects) ----------
let blobTex: THREE.CanvasTexture | null = null;
const getBlob = () => {
  if (blobTex) return blobTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 6, 64, 64, 64);
  gr.addColorStop(0, "rgba(40,28,20,0.85)");
  gr.addColorStop(0.55, "rgba(40,28,20,0.45)");
  gr.addColorStop(1, "rgba(40,28,20,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
};
export const Blob: React.FC<{ p: V3; w: number; d: number; o?: number }> = ({ p, w, d, o = 0.55 }) => (
  <mesh position={[p[0], p[1] + 0.006, p[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={getBlob()} transparent opacity={o} depthWrite={false} toneMapped={false} />
  </mesh>
);

// ---------- canvas text plate ----------
export const useTextPlate = (text: string, w = 512, h = 128, bg: string = C.cream, ink = "#3a5f5c", size = 74, spacing = 18) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.font = `700 ${size}px ${MANROPE}, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    (g as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.fillText(text, w / 2 + 3, h / 2 + 4);
    g.fillStyle = ink;
    g.fillText(text, w / 2, h / 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, w, h, bg, ink, size, spacing]);

// =====================================================================================
// KILN: clamp kiln of red bricks with embers and clay flames underneath (fired, not steamed)
// =====================================================================================
const BRICK_COLS = ["#C2502E", "#B5462A", "#CC5E36", "#A84125", "#D2683F", "#B9532F"];
export const Kiln: React.FC<{ t: number; grain: THREE.Texture }> = ({ t, grain }) => {
  const mesh = useMemo(() => {
    const L = 0.66, H = 0.22, D = 0.32;
    const list: { p: V3; ry: number; c: string }[] = [];
    // three piers with two fire tunnels between them
    [-1.55, 0, 1.55].forEach((px, pi) => {
      for (let ly = 0; ly < 3; ly++) {
        for (let z = -1.0; z <= 1.01; z += 0.5) {
          const k = pi * 31 + ly * 7 + Math.round(z * 10);
          list.push({ p: [px + (rnd(k) - 0.5) * 0.04, H / 2 + ly * (H + 0.012), z], ry: Math.PI / 2 + (rnd(k + 3) - 0.5) * 0.06, c: BRICK_COLS[Math.floor(rnd(k + 9) * 6)] });
        }
      }
    });
    // stepped lattice stack above the tunnels
    for (let ly = 0; ly < 7; ly++) {
      const inset = Math.floor(ly / 2) * 0.26;
      const W = 3.7 - inset * 2, Dd = 2.5 - inset * 2;
      const y = 3 * (H + 0.012) + H / 2 + ly * (H + 0.012);
      const alongX = ly % 2 === 0;
      const cols = alongX ? Math.floor(W / (L + 0.07)) : Math.floor(W / (D + 0.1));
      const rows = alongX ? Math.floor(Dd / (D + 0.1)) : Math.floor(Dd / (L + 0.07));
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const k = ly * 401 + i * 17 + j * 5;
          const sx = alongX ? L + 0.07 : D + 0.1;
          const sz = alongX ? D + 0.1 : L + 0.07;
          list.push({
            p: [(i - (cols - 1) / 2) * sx + (rnd(k) - 0.5) * 0.05, y, (j - (rows - 1) / 2) * sz + (rnd(k + 1) - 0.5) * 0.05],
            ry: (alongX ? 0 : Math.PI / 2) + (rnd(k + 2) - 0.5) * 0.08,
            c: BRICK_COLS[Math.floor(rnd(k + 4) * 6)],
          });
        }
      }
    }
    const geo = new RoundedBoxGeometry(L, H, D, 2, 0.035);
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color: "#ffffff", bumpMap: grain, bumpScale: 4 });
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
    list.forEach((b, i) => {
      q.setFromEuler(new THREE.Euler(0, b.ry, 0));
      m.compose(new THREE.Vector3(...b.p), q, s);
      im.setMatrixAt(i, m);
      col.set(b.c);
      // soot near the fire: lower bricks darker
      if (b.p[1] < 1.0) col.multiplyScalar(0.82);
      im.setColorAt(i, col);
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = im.receiveShadow = true;
    return im;
  }, [grain]);
  const st = stepT(t);
  return (
    <group position={[KX, 0, 0]}>
      <primitive object={mesh} />
      <Blob p={[0, 0, 0]} w={4.8} d={3.4} o={0.6} />
      {/* fire tunnels: dark floor, embers, flames licking out of the front */}
      {[-0.78, 0.78].map((x, ti) => (
        <group key={ti} position={[x, 0, 0]}>
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.0, 2.4]} />
            <meshBasicMaterial color="#2a1a14" />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => {
            const fl = 0.6 + 0.4 * Math.sin(st * 9 + i * 2.1 + ti);
            return (
              <mesh key={i} position={[(rnd(i + ti * 20) - 0.5) * 0.7, 0.08, -1.0 + (i / 8) * 2.1]} scale={[1, 0.6, 1]}>
                <dodecahedronGeometry args={[0.1 + rnd(i + 5) * 0.06, 0]} />
                <meshStandardMaterial color="#ff7a2a" emissive="#ff5a10" emissiveIntensity={1.4 + fl * 1.6} roughness={0.8} />
              </mesh>
            );
          })}
          {[0, 1, 2].map((i) => {
            const fl = Math.sin(st * 11 + i * 1.7 + ti * 2.3);
            const h = 0.42 + 0.14 * fl;
            return (
              <mesh key={i} position={[(i - 1) * 0.24, h / 2 + 0.04, 1.18 + (i % 2) * 0.05]} scale={[1, 1 + fl * 0.12, 1]}>
                <coneGeometry args={[0.13 - i * 0.015, h, 10]} />
                <meshStandardMaterial color={i === 1 ? "#ffd36a" : "#ff8a2c"} emissive={i === 1 ? "#ffb62e" : "#ff5d16"} emissiveIntensity={2.2} roughness={0.7} />
              </mesh>
            );
          })}
          <pointLight position={[0, 0.35, 1.3]} intensity={6 + 2.5 * Math.sin(st * 13 + ti)} distance={4.5} color="#ff8a3a" />
        </group>
      ))}
      {/* clay smoke puffs from the top */}
      {Array.from({ length: 7 }, (_, i) => {
        const ph = (st * 0.32 + i / 7) % 1;
        const r = 0.18 + ph * 0.35;
        return (
          <mesh key={i} position={[(rnd(i + 3) - 0.5) * 1.6 + ph * 0.5, 2.55 + ph * 2.6, (rnd(i + 7) - 0.5) * 0.8]} scale={r}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial {...POLISH.clay} color="#9a948d" transparent opacity={0.85 * (1 - ph)} bumpMap={grain} bumpScale={2} />
          </mesh>
        );
      })}
    </group>
  );
};

// =====================================================================================
// FACTORY: mixer + steel moulds on a rail
// =====================================================================================
export const MOULD = { W: 3.4, D: 1.7, H: 1.2, T: 0.12 };
export const HERO_MOULD: V3 = [FX + 0.6, 0, 0.4];
export const MIXER: V3 = [FX - 3.1, 0, -1.0];
export const MIXER_TOP = 3.05;

/** Steel mould with grey dough. fill: 0..1 = level inside, >1 = dome rising above the rim. */
export const SteelMould: React.FC<{ fill: number; grain: THREE.Texture; doughTex: THREE.Texture; bubbles?: number; t?: number }> = ({ fill, grain, doughTex, bubbles = 0, t = 0 }) => {
  const { W, D, H, T } = MOULD;
  const lvl = Math.min(1, fill) * (H - 0.06);
  const dome = Math.max(0, fill - 1) * 1.0;
  return (
    <group>
      {/* base plate + wheels on the rail */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[W + 0.16, 0.12, D + 0.16]} radius={0.04} />
        <Steel grain={grain} color="#5f6a73" />
      </mesh>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.35), 0.1, sz * (D / 2 - 0.05)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <Steel grain={grain} color="#3f474e" />
        </mesh>
      )))}
      <group position={[0, 0.22, 0]}>
        {[
          [0, H / 2, D / 2, W, H, T],
          [0, H / 2, -D / 2, W, H, T],
          [-W / 2, H / 2, 0, T, H, D],
          [W / 2, H / 2, 0, T, H, D],
        ].map(([x, y, z, a, b, c], i) => (
          <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[a, b, c]} radius={0.04} />
            <Steel grain={grain} />
          </mesh>
        ))}
        {/* rolled rim + ribs + rivets: reads as a steel tin, not clay */}
        {[D / 2 + T / 2 + 0.02, -D / 2 - T / 2 - 0.02].map((z, i) => (
          <mesh key={i} position={[0, H, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, W + 0.1, 12]} />
            <Steel grain={grain} color="#909ba5" />
          </mesh>
        ))}
        {[-1.1, 0, 1.1].map((x) => (
          <mesh key={x} position={[x, H / 2, D / 2 + T / 2 + 0.03]} castShadow>
            <boxGeometry args={[0.07, H - 0.1, 0.05]} />
            <Steel grain={grain} color="#6b7781" />
          </mesh>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-W / 2 + 0.3 + i * ((W - 0.6) / 9), 0.14, D / 2 + T / 2 + 0.01]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshPhysicalMaterial color="#a7b1ba" roughness={0.25} metalness={0.8} />
          </mesh>
        ))}
        {/* handles */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (W / 2 + 0.14), H * 0.62, 0]} rotation={[0, s * Math.PI / 2, 0]}>
            <torusGeometry args={[0.18, 0.04, 8, 20, Math.PI]} />
            <Steel grain={grain} color="#4c565e" />
          </mesh>
        ))}
        {/* dough */}
        {lvl > 0.01 ? (
          <mesh position={[0, lvl / 2 + 0.02, 0]}>
            <boxGeometry args={[W - T, lvl, D - T]} />
            <meshPhysicalMaterial {...POLISH.clay} color={C.dough} roughness={0.7} />
          </mesh>
        ) : null}
        <mesh position={[0, lvl + 0.02, 0]} scale={[W / 2 - 0.02, 0.04 + dome, D / 2 - 0.02]}>
          <sphereGeometry args={[1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial {...POLISH.clay} roughness={fill > 1 ? 0.85 : 0.55} color="#ffffff" map={doughTex} bumpMap={grain} bumpScale={2.5} />
        </mesh>
        {/* bubbles breaking the surface (colourless gas) */}
        {Array.from({ length: bubbles }, (_, i) => {
          const per = 0.9 + rnd(i + 300) * 0.7;
          const ph = ((t + rnd(i + 200) * per) % per) / per;
          const x = (rnd(i + 210) - 0.5) * (W - 0.8);
          const z = (rnd(i + 220) - 0.5) * (D - 0.5);
          const nx = x / (W / 2), nz = z / (D / 2);
          const y = lvl + 0.02 + (0.04 + dome) * Math.sqrt(Math.max(0, 1 - nx * nx - nz * nz));
          const r = (0.05 + rnd(i + 230) * 0.07) * Math.sin(ph * Math.PI);
          return (
            <mesh key={i} position={[x, y, z]} scale={Math.max(0.001, r)}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshPhysicalMaterial color="#f4fbff" roughness={0.05} clearcoat={1} transparent opacity={0.6} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

/** Swirl texture for the slurry in the mixer bowl. */
const useSwirl = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#bdb9b0";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9; i++) {
      g.strokeStyle = i % 2 ? "rgba(255,255,255,0.35)" : "rgba(90,85,78,0.25)";
      g.lineWidth = 7;
      g.beginPath();
      for (let a = 0; a < 5.5; a += 0.05) {
        const r = 12 + a * 18 + i * 3;
        const x = 128 + Math.cos(a + i * 0.7) * r, y = 128 + Math.sin(a + i * 0.7) * r;
        if (a === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

export type Ingredient = { key: string; t0: number; color: string; n: number; r: number; kind: "grain" | "lump" | "water" | "metal"; from: [number, number] };

export const Factory: React.FC<{ t: number; grain: THREE.Texture; doughTex: THREE.Texture; mouldFill: number; bubbles: number; ingredients: Ingredient[]; spoonAt: number }> = ({ t, grain, doughTex, mouldFill, bubbles, ingredients, spoonAt }) => {
  const swirl = useSwirl();
  const st = stepT(t);
  const [mx, , mz] = MIXER;
  return (
    <group>
      {/* rails */}
      {[-0.55, 0.55].map((dz) => (
        <mesh key={dz} position={[FX + 6, 0.03, 0.4 + dz]} receiveShadow castShadow>
          <boxGeometry args={[22, 0.06, 0.08]} />
          <Steel grain={grain} color="#566069" />
        </mesh>
      ))}
      <group position={HERO_MOULD}>
        <SteelMould fill={mouldFill} grain={grain} doughTex={doughTex} bubbles={bubbles} t={t} />
      </group>
      <Blob p={HERO_MOULD} w={4.4} d={2.6} o={0.55} />
      {[4.3, 8.0].map((dx, i) => (
        <group key={i} position={[FX + 0.6 + dx, 0, 0.4]}>
          <SteelMould fill={0.55 + i * 0.3} grain={grain} doughTex={doughTex} />
          <Blob p={[0, 0, 0]} w={4.4} d={2.6} o={0.5} />
        </group>
      ))}
      {/* mixer on legs */}
      <group position={[mx, 0, mz]}>
        {[0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.85, 1.0, Math.sin(a) * 0.85]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 2.0, 12]} />
              <ClayMat color={P.dustyTeal} grain={grain} />
            </mesh>
          );
        })}
        <mesh position={[0, 2.03, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 0.8, 0.12, 40]} />
          <Steel grain={grain} color="#5f6a73" />
        </mesh>
        <mesh position={[0, 2.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.15, 0.92, 1.0, 48, 1, true]} />
          <meshPhysicalMaterial color={C.steel} roughness={0.34} metalness={0.62} side={THREE.DoubleSide} bumpMap={grain} bumpScale={0.6} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, MIXER_TOP + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.15, 0.055, 10, 48]} />
          <Steel grain={grain} color="#9aa5ae" />
        </mesh>
        {/* slurry swirling */}
        <mesh position={[0, MIXER_TOP - 0.3, 0]} rotation={[-Math.PI / 2, 0, -st * 2.2]}>
          <circleGeometry args={[1.08, 48]} />
          <meshPhysicalMaterial {...POLISH.clay} roughness={0.45} color="#ffffff" map={swirl} bumpMap={grain} bumpScale={1.5} />
        </mesh>
        {/* paddle */}
        <group position={[0, MIXER_TOP - 0.2, 0]} rotation={[0, st * 2.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.08, 0.16]} />
            <ClayMat color={P.mustard} grain={grain} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1.4, 10]} />
            <ClayMat color={P.mustard} grain={grain} />
          </mesh>
        </group>
        {/* chute towards the hero mould */}
        <mesh position={[1.55, 1.75, 0.55]} rotation={[0.0, -0.32, -0.62]} castShadow>
          <boxGeometry args={[1.7, 0.08, 0.42]} />
          <Steel grain={grain} color="#7d8892" />
        </mesh>
        <Blob p={[0, 0, 0]} w={2.6} d={2.6} o={0.45} />
        {/* ingredients dropping in */}
        {ingredients.map((ing, k) =>
          Array.from({ length: ing.n }, (_, i) => {
            const t0 = ing.t0 + rnd(k * 97 + i) * (ing.kind === "water" ? 0.9 : 0.55);
            const dt = t - t0;
            if (dt < 0) return null;
            const y0 = ing.kind === "metal" ? 4.4 : 6.4 + rnd(k * 31 + i) * 0.4;
            const y = y0 - 4.9 * dt * dt;
            if (y < MIXER_TOP - 0.3) return null;
            const x = ing.from[0] + (rnd(k * 13 + i) - 0.5) * (ing.kind === "metal" ? 0.12 : 0.5);
            const z = ing.from[1] + (rnd(k * 17 + i) - 0.5) * (ing.kind === "metal" ? 0.12 : 0.5);
            const r = ing.r * (0.7 + rnd(k * 19 + i) * 0.6);
            return (
              <mesh key={`${k}-${i}`} position={[x, y, z]} rotation={[rnd(i) * 3, rnd(i + 1) * 3 + dt * 4, 0]} scale={ing.kind === "water" ? [r, r * 1.5, r] : ing.kind === "metal" ? [r * 1.6, r * 0.25, r] : [r, r, r]} castShadow>
                {ing.kind === "lump" ? <dodecahedronGeometry args={[1, 0]} /> : ing.kind === "metal" ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[1, 10, 8]} />}
                {ing.kind === "water" ? (
                  <meshPhysicalMaterial color={ing.color} roughness={0.05} clearcoat={1} transparent opacity={0.75} />
                ) : ing.kind === "metal" ? (
                  <meshPhysicalMaterial color={ing.color} roughness={0.2} metalness={1} emissive="#ffffff" emissiveIntensity={0.25} />
                ) : (
                  <meshPhysicalMaterial {...POLISH.clay} color={ing.color} />
                )}
              </mesh>
            );
          }),
        )}
        {/* small clay spoon tipping the aluminium pinch */}
        {t > spoonAt - 1.0 && t < spoonAt + 1.4 ? (
          <group position={[0.25, 4.5, 0.1]} rotation={[0, 0.4, -0.15 - 0.8 * smooth(ramp(t, spoonAt - 0.5, 0.5))]}>
            <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.035, 0.045, 0.8, 10]} />
              <ClayMat color={P.coral} grain={grain} />
            </mesh>
            <mesh scale={[1, 0.45, 1]} castShadow>
              <sphereGeometry args={[0.16, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <meshPhysicalMaterial color="#c7ced4" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ) : null}
      </group>
    </group>
  );
};

// =====================================================================================
// MACRO (inside the dough): Al flakes -> colourless H2 bubbles -> gas leaves -> air-filled pores
// =====================================================================================
const FLAKES = Array.from({ length: 13 }, (_, i) => ({
  x: (rnd(i + 500) - 0.5) * 2.6,
  y: MY - 1.9 + rnd(i + 520) * 3.4,
  rz: rnd(i + 540) * 3,
}));
export const BUBBLES = FLAKES.flatMap((fl, i) =>
  [0, 1, 2].map((j) => {
    const k = i * 3 + j;
    const a = rnd(k + 600) * Math.PI * 2;
    return { x: fl.x + Math.cos(a) * 0.22, y: fl.y + Math.sin(a) * 0.22, r: 0.08 + rnd(k + 620) * 0.12, born: rnd(k + 640), leave: rnd(k + 660) };
  }),
);
let poreTex: THREE.CanvasTexture | null = null;
const getPoreTex = () => {
  if (poreTex) return poreTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 56, 8, 64, 64, 62);
  gr.addColorStop(0, "#6f6a64");
  gr.addColorStop(0.75, "#8f8980");
  gr.addColorStop(0.95, "#b3ada3");
  gr.addColorStop(1, "rgba(179,173,163,0)");
  g.fillStyle = gr;
  g.beginPath();
  g.arc(64, 64, 62, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.7)";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(64, 64, 54, Math.PI * 0.15, Math.PI * 0.85);
  g.stroke();
  poreTex = new THREE.CanvasTexture(c);
  poreTex.colorSpace = THREE.SRGBColorSpace;
  return poreTex;
};

/** bubble state: grow during [g0,g1], leave (rise) during [l0,l1] */
export const bubbleState = (b: (typeof BUBBLES)[number], t: number, g0: number, g1: number, l0: number, l1: number) => {
  const born = g0 + b.born * (g1 - g0 - 1.2);
  const grow = smooth((t - born) / 1.2);
  const leaveAt = l0 + b.leave * (l1 - l0 - 1.0);
  const dt = Math.max(0, t - leaveAt);
  const rise = dt * dt * 2.6 + dt * 0.6;
  return { r: b.r * grow, y: b.y + rise, left: dt > 0, gone: b.y + rise > MY + 2.6, leaveAt };
};

export const Macro: React.FC<{ t: number; grain: THREE.Texture; g0: number; g1: number; l0: number; l1: number }> = ({ t, grain, g0, g1, l0, l1 }) => {
  const pore = getPoreTex();
  const slab = useMemo(() => makePoreFace(77, 1024, 1024, 5, "#BDB8AF", 0.25).map, []);
  return (
    <group>
      {/* dough block: front face is the "cut" we look at; top is the surface where gas escapes */}
      <mesh position={[0, MY - 2.2, -1.6]} receiveShadow castShadow>
        <boxGeometry args={[9, 9.6, 3.2]} />
        <meshPhysicalMaterial {...POLISH.clay} roughness={0.6} color="#ffffff" map={slab} bumpMap={grain} bumpScale={2.5} />
      </mesh>
      {FLAKES.map((fl, i) => (
        <mesh key={i} position={[fl.x, fl.y, 0.02]} rotation={[0, 0, fl.rz]}>
          <boxGeometry args={[0.16, 0.09, 0.02]} />
          <meshPhysicalMaterial color="#d6dde4" metalness={1} roughness={0.22} emissive="#ffffff" emissiveIntensity={0.12} />
        </mesh>
      ))}
      {BUBBLES.map((b, i) => {
        const s = bubbleState(b, t, g0, g1, l0, l1);
        return (
          <group key={i}>
            {s.left ? (
              <group>
                {/* the empty cavity stays behind; air seeps in (pale blue tint) */}
                <mesh position={[b.x, b.y, 0.012]}>
                  <circleGeometry args={[b.r * 1.08, 28]} />
                  <meshBasicMaterial map={pore} transparent toneMapped={false} color="#ffffff" />
                </mesh>
                <mesh position={[b.x, b.y, 0.014]}>
                  <circleGeometry args={[b.r * 0.8, 24]} />
                  <meshBasicMaterial color="#9fd3f0" transparent opacity={0.55 * smooth((t - s.leaveAt - 0.4) / 0.8)} toneMapped={false} />
                </mesh>
              </group>
            ) : null}
            {!s.gone && s.r > 0.004 ? (
              <mesh position={[b.x + (s.left ? Math.sin((t - s.leaveAt) * 6 + i) * 0.04 : 0), s.y, s.left ? 0.25 : 0]} scale={s.r}>
                <sphereGeometry args={[1, 22, 16]} />
                <meshPhysicalMaterial color="#dff1ff" roughness={0.04} clearcoat={1} transparent opacity={0.36} envMapIntensity={1.8} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

// =====================================================================================
// CUT + AUTOCLAVE: the cake is cut by taut steel wires, then rolls into the steam tube
// =====================================================================================
export const CAKE = { cols: 4, rows: 2, bw: 0.8, bh: 0.65, bd: 1.4 };
export const TUBE = { r: 1.9, len: 9, zFront: -4.7, y: 2.0 };

const useBlockMats = (grain: THREE.Texture) =>
  useMemo(() => {
    const { bw, bh, bd } = CAKE;
    const dims: [number, number][] = [[bd, bh], [bd, bh], [bw, bd], [bw, bd], [bw, bh], [bw, bh]];
    return dims.map(([a, b], i) => {
      const cut = i < 4;
      const f = makePoreFace(900 + i, 512, Math.max(64, Math.round((512 * b) / a)), cut ? 13 : 4, cut ? C.aac : "#E2DED6", cut ? 1 : 0.3);
      return new THREE.MeshPhysicalMaterial({ ...POLISH.clay, roughness: 0.95, sheen: 0.12, color: "#ffffff", map: f.map, bumpMap: cut ? f.bump : grain, bumpScale: cut ? 5 : 2 });
    });
  }, [grain]);

export const Cake: React.FC<{ gx: number; gy: number; grain: THREE.Texture }> = ({ gx, gy, grain }) => {
  const mats = useBlockMats(grain);
  const geo = useMemo(() => new RoundedBoxGeometry(CAKE.bw, CAKE.bh, CAKE.bd, 2, 0.02), []);
  const { cols, rows, bw, bh } = CAKE;
  return (
    <group>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        return <mesh key={i} geometry={geo} material={mats} position={[(c - (cols - 1) / 2) * (bw + gx), bh / 2 + r * (bh + gy), 0]} castShadow receiveShadow />;
      })}
    </group>
  );
};

export const CutAutoclave: React.FC<{ t: number; grain: THREE.Texture; vCut: [number, number]; hCut: [number, number]; roll: [number, number]; door: [number, number]; steam0: number }> = ({ t, grain, vCut, hCut, roll, door, steam0 }) => {
  const { cols, bw, bh, bd } = CAKE;
  const W = cols * bw;
  const zv = 1.2 - 2.4 * smooth(ramp(t, vCut[0], vCut[1] - vCut[0]));
  const zh = 1.2 - 2.4 * smooth(ramp(t, hCut[0], hCut[1] - hCut[0]));
  const gx = 0.05 * smooth(ramp(t, vCut[1], 0.4));
  const gy = 0.03 * smooth(ramp(t, hCut[1], 0.4));
  const rz = -9.6 * smooth(ramp(t, roll[0], roll[1] - roll[0]));
  const doorA = -1.7 * (1 - smooth(ramp(t, door[0], door[1] - door[0])));
  const plate = useTextPlate("AUDIRA", 512, 128, C.cream, "#3a5f5c", 74, 18);
  const st = stepT(t);
  const vActive = t > vCut[0] - 0.4 && t < vCut[1] + 0.3;
  const hActive = t > hCut[0] - 0.4 && t < hCut[1] + 0.3;
  return (
    <group position={[CX, 0, 0]}>
      {/* rails into the tube */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.03, -5.8]} receiveShadow castShadow>
          <boxGeometry args={[0.08, 0.06, 15]} />
          <Steel grain={grain} color="#566069" />
        </mesh>
      ))}
      {/* trolley + cake */}
      <group position={[0, 0, rz]}>
        <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[W + 0.4, 0.12, bd + 0.3]} radius={0.04} />
          <Steel grain={grain} color="#5f6a73" />
        </mesh>
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.7, 0.08, sz * 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.08, 14]} />
            <Steel grain={grain} color="#3f474e" />
          </mesh>
        )))}
        <group position={[0, 0.19, 0]}>
          <Cake gx={gx} gy={gy} grain={grain} />
        </group>
        <Blob p={[0, 0, 0]} w={W + 1.2} d={bd + 1.0} o={0.5} />
      </group>
      {/* vertical wire harp sweeping front -> back (column cuts) */}
      {vActive ? (
        <group position={[0, 0, zv]}>
          <mesh position={[0, 2.0, 0]} castShadow>
            <RoundedBoxGeo args={[W + 1.0, 0.16, 0.16]} radius={0.05} />
            <ClayMat color={P.mustard} grain={grain} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (W / 2 + 0.45), 1.05, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 2.0, 12]} />
              <ClayMat color={P.mustard} grain={grain} />
            </mesh>
          ))}
          {[-1, 0, 1].map((c) => (
            <mesh key={c} position={[c * bw, 1.1, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.8, 6]} />
              <meshPhysicalMaterial color="#e6ecf0" metalness={1} roughness={0.12} emissive="#ffffff" emissiveIntensity={0.35} />
            </mesh>
          ))}
        </group>
      ) : null}
      {/* horizontal wire (row cut) between two posts */}
      {hActive ? (
        <group position={[0, 0, zh]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (W / 2 + 0.45), 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 1.8, 12]} />
              <ClayMat color={P.dustyTeal} grain={grain} />
            </mesh>
          ))}
          <mesh position={[0, 0.19 + bh + 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, W + 0.9, 6]} />
            <meshPhysicalMaterial color="#e6ecf0" metalness={1} roughness={0.12} emissive="#ffffff" emissiveIntensity={0.35} />
          </mesh>
        </group>
      ) : null}
      {/* groove marks that the wires have already passed (top face) */}
      {[-1, 0, 1].map((c) => {
        const L = Math.min(bd, Math.max(0, bd / 2 - zv));
        if (L <= 0.01 || rz < -0.05) return null;
        return (
          <mesh key={c} position={[c * bw, 0.19 + 2 * bh + 0.004, bd / 2 - L / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.025, L]} />
            <meshBasicMaterial color="#6d675f" />
          </mesh>
        );
      })}
      {/* autoclave: long horizontal steel tube with round bolted door */}
      <group position={[0, TUBE.y, TUBE.zFront - TUBE.len / 2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[TUBE.r, TUBE.r, TUBE.len, 56, 1, true]} />
          <meshPhysicalMaterial color="#8d99a3" roughness={0.3} metalness={0.7} side={THREE.DoubleSide} bumpMap={grain} bumpScale={0.5} clearcoat={0.4} clearcoatRoughness={0.25} />
        </mesh>
        {[-3.4, -1.1, 1.2, 3.5].map((z) => (
          <mesh key={z} position={[0, 0, z]} castShadow>
            <torusGeometry args={[TUBE.r + 0.03, 0.08, 10, 56]} />
            <Steel grain={grain} color="#6b7781" />
          </mesh>
        ))}
        <mesh position={[0, 0, -TUBE.len / 2]}>
          <circleGeometry args={[TUBE.r, 48]} />
          <meshStandardMaterial color="#2c2b2a" />
        </mesh>
        {/* saddles */}
        {[-3, 0, 3].map((z) => (
          <mesh key={z} position={[0, -TUBE.y + 0.35, z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[3.0, 0.7, 0.5]} radius={0.08} />
            <ClayMat color={P.dustyTeal} grain={grain} />
          </mesh>
        ))}
        {/* pressure gauge + AUDIRA plate on top */}
        <group position={[0, TUBE.r + 0.15, TUBE.len / 2 - 0.9]}>
          {[-0.75, 0.75].map((x) => (
            <mesh key={x} position={[x, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <Steel grain={grain} color="#5f6a73" />
            </mesh>
          ))}
          <mesh position={[0, 0.62, 0]} castShadow>
            <RoundedBoxGeo args={[1.9, 0.5, 0.08]} radius={0.03} />
            <ClayMat color={C.cream} grain={grain} />
          </mesh>
          <mesh position={[0, 0.62, 0.045]}>
            <planeGeometry args={[1.8, 0.44]} />
            <meshPhysicalMaterial {...POLISH.clay} map={plate} color="#ffffff" bumpMap={grain} bumpScale={1.2} />
          </mesh>
          <mesh position={[1.25, 0.25, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 24]} />
            <ClayMat color={C.cream} grain={grain} />
          </mesh>
          <mesh position={[1.25, 0.25, 0.36]} rotation={[0, 0, -0.6 - 1.6 * smooth(ramp(t, steam0, 1.2))]}>
            <boxGeometry args={[0.03, 0.17, 0.02]} />
            <meshBasicMaterial color={P.coral} />
          </mesh>
        </group>
      </group>
      {/* door, hinged on the left */}
      <group position={[-TUBE.r - 0.05, TUBE.y, TUBE.zFront + 0.12]} rotation={[0, doorA, 0]}>
        <group position={[TUBE.r + 0.05, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[TUBE.r + 0.12, TUBE.r + 0.12, 0.24, 56]} />
            <Steel grain={grain} color="#7f8b95" />
          </mesh>
          <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[TUBE.r * 0.55, TUBE.r * 0.6, 0.06, 40]} />
            <Steel grain={grain} color="#9aa5ae" />
          </mesh>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * (TUBE.r - 0.05), Math.sin(a) * (TUBE.r - 0.05), 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.1, 6]} />
                <meshPhysicalMaterial color="#b3bcc4" metalness={0.85} roughness={0.25} />
              </mesh>
            );
          })}
        </group>
      </group>
      {/* steam: white clay puffs from the door seal and the top valve (no fire) */}
      {Array.from({ length: 16 }, (_, i) => {
        const per = 1.4 + rnd(i + 800) * 0.6;
        const local = t - steam0 - rnd(i + 810) * 0.8;
        if (local < 0) return null;
        const ph = (local % per) / per;
        const top = i % 3 === 0;
        const a = rnd(i + 820) * Math.PI * 2;
        const base: V3 = top ? [0.4, TUBE.y + TUBE.r + 0.3, TUBE.zFront - 1.2] : [Math.cos(a) * (TUBE.r + 0.1), TUBE.y + Math.sin(a) * (TUBE.r + 0.1), TUBE.zFront + 0.25];
        const r = 0.22 + ph * 0.55;
        return (
          <mesh key={i} position={[base[0] + (top ? 0 : Math.cos(a) * ph * 0.8), base[1] + ph * (top ? 2.4 : 1.2), base[2] + (top ? 0 : ph * 0.9)]} scale={r}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial {...POLISH.clay} color="#fbfbf8" transparent opacity={0.9 * Math.sin(Math.min(1, ph * 1.4) * Math.PI) * smooth(local / 0.4)} bumpMap={grain} bumpScale={1.5} depthWrite={false} />
          </mesh>
        );
      })}
      <Blob p={[0, 0, TUBE.zFront - TUBE.len / 2]} w={4.6} d={TUBE.len + 0.6} o={0.45} />
      {void st}
    </group>
  );
};

// =====================================================================================
// CRYSTAL PORE (macro): needle crystals grow on the pore wall (sand + lime -> strength)
// =====================================================================================
const NEEDLES = Array.from({ length: 90 }, (_, i) => {
  // direction on the back hemisphere (z < 0)
  const u = rnd(i + 1000), v = rnd(i + 1010);
  const th = u * Math.PI * 2, ph = Math.acos(1 - v * 0.95);
  const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), -Math.cos(ph));
  return { dir, len: 0.35 + rnd(i + 1020) * 0.45, w: 0.025 + rnd(i + 1030) * 0.03, d: rnd(i + 1040), tilt: (rnd(i + 1050) - 0.5) * 0.6 };
});
const RIM_NEEDLES = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2 + rnd(i + 1100) * 0.2;
  return { a, r: 2.45 + rnd(i + 1110) * 0.5, len: 0.25 + rnd(i + 1120) * 0.3, d: rnd(i + 1130) };
});
export const Crystal: React.FC<{ t: number; grain: THREE.Texture; g0: number; g1: number }> = ({ t, grain, g0, g1 }) => {
  const R = 2.4;
  const wall = useMemo(() => makePoreFace(131, 1024, 1024, 9, "#D6D1C7", 0.5).map, []);
  const up = new THREE.Vector3(0, 1, 0);
  return (
    <group position={[XX, MY, 0]}>
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[R, 16, 64, 1]} />
        <meshPhysicalMaterial {...POLISH.clay} roughness={0.92} color="#ffffff" map={wall} bumpMap={grain} bumpScale={3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <sphereGeometry args={[R, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...POLISH.clay} roughness={0.92} color="#CFC9BE" side={THREE.DoubleSide} bumpMap={grain} bumpScale={4} />
      </mesh>
      {NEEDLES.map((n, i) => {
        const g = smooth((t - (g0 + n.d * (g1 - g0 - 1.0))) / 1.0);
        if (g <= 0.01) return null;
        const L = n.len * g;
        const inward = n.dir.clone().multiplyScalar(-1);
        inward.x += n.tilt * 0.4;
        inward.normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(up, inward);
        const p = n.dir.clone().multiplyScalar(R - 0.02).add(inward.clone().multiplyScalar(L / 2));
        return (
          <mesh key={i} position={p} quaternion={q} castShadow>
            <cylinderGeometry args={[n.w * 0.45, n.w, L, 6]} />
            <meshPhysicalMaterial {...POLISH.clay} roughness={0.5} sheen={0.4} color={i % 4 === 0 ? "#FFF6E4" : "#F2EEE6"} clearcoat={0.3} />
          </mesh>
        );
      })}
      {RIM_NEEDLES.map((n, i) => {
        const g = smooth((t - (g0 + n.d * (g1 - g0 - 1.0))) / 1.0);
        if (g <= 0.01) return null;
        const L = n.len * g;
        return (
          <mesh key={i} position={[Math.cos(n.a) * n.r, Math.sin(n.a) * n.r, L / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.03, L, 6]} />
            <meshPhysicalMaterial {...POLISH.clay} roughness={0.5} sheen={0.4} color="#F6F1E8" clearcoat={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// =====================================================================================
// PAYOFF A: AAC block on a turntable + volume gauge (air > half)
// =====================================================================================
export const AirGauge: React.FC<{ t: number; grain: THREE.Texture; fineGrain: THREE.Texture; air: number }> = ({ t, grain, fineGrain, air }) => {
  const H = 2.4, r = 0.4;
  const solid = H * (1 - air);
  return (
    <group position={[AX, 0, 2]}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.45, 1.5, 0.16, 48]} />
        <ClayMat color={P.coral} grain={grain} />
      </mesh>
      <group position={[0, 0.16 + 0.55, 0]} rotation={[0, -0.35 + Math.sin(stepT(t) * 0.5) * 0.25, 0]}>
        <AacBlock size={[2.0, 1.1, 1.1]} cutFaces={[4, 0]} seed={7} poreR={22} grain={fineGrain} />
      </group>
      <Blob p={[0, 0.16, 0]} w={2.8} d={1.9} o={0.5} />
      <group position={[2.05, 0, 0.2]}>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r + 0.16, r + 0.2, 0.12, 32]} />
          <ClayMat color={C.cream} grain={grain} />
        </mesh>
        {solid > 0.01 ? (
          <mesh position={[0, 0.12 + solid / 2, 0]} castShadow>
            <cylinderGeometry args={[r - 0.03, r - 0.03, solid, 32]} />
            <ClayMat color={C.aacShade} grain={fineGrain} />
          </mesh>
        ) : null}
        {air > 0.01 ? (
          <mesh position={[0, 0.12 + solid + (H * air) / 2, 0]}>
            <cylinderGeometry args={[r - 0.03, r - 0.03, H * air, 32]} />
            <meshPhysicalMaterial color="#9fd3f0" roughness={0.3} transparent opacity={0.75} clearcoat={0.6} />
          </mesh>
        ) : null}
        <mesh position={[0, 0.12 + H / 2, 0]}>
          <cylinderGeometry args={[r, r, H, 32, 1, true]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.08} transparent opacity={0.22} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.12 + H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r + 0.03, 0.03, 8, 32]} />
          <ClayMat color={C.ink} grain={grain} />
        </mesh>
        <Blob p={[0, 0, 0]} w={1.3} d={1.3} o={0.5} />
      </group>
    </group>
  );
};

// =====================================================================================
// PAYOFF B: two 10 cm walls, heater behind; heat arrows pass the red brick more easily (±2.4x)
// =====================================================================================
const useWallTex = (kind: "brick" | "aac") =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 768;
    const g = c.getContext("2d")!;
    if (kind === "brick") {
      g.fillStyle = "#d9cbb4";
      g.fillRect(0, 0, 512, 768);
      const rows = 14, bh = 768 / rows;
      for (let r = 0; r < rows; r++) {
        const off = r % 2 ? 0 : 64;
        for (let x = -off; x < 512; x += 128) {
          g.fillStyle = BRICK_COLS[Math.floor(rnd(r * 13 + x) * 6)];
          g.fillRect(x + 4, r * bh + 4, 120, bh - 8);
        }
      }
    } else {
      g.fillStyle = "#ddd9d1";
      g.fillRect(0, 0, 512, 768);
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = rnd(i) > 0.5 ? "rgba(255,255,255,0.25)" : "rgba(100,92,84,0.16)";
        g.fillRect(rnd(i + 0.3) * 512, rnd(i + 0.7) * 768, 2, 2);
      }
      g.fillStyle = "rgba(150,142,132,0.8)";
      for (let r = 1; r < 4; r++) g.fillRect(0, r * 192 - 2, 512, 4);
      for (let r = 0; r < 4; r++) g.fillRect(r % 2 ? 160 : 352, r * 192, 4, 192);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [kind]);

export const WALL = { w: 1.6, h: 2.4, d: 0.45, gap: 1.05 };
export const HeatWater: React.FC<{ t: number; grain: THREE.Texture; heat0: number; heat1: number; wet0: number; plaster0: number }> = ({ t, grain, heat0, heat1, wet0, plaster0 }) => {
  const brickTex = useWallTex("brick");
  const aacTex = useWallTex("aac");
  const st = stepT(t);
  const glowRed = 0.75 * smooth(ramp(t, heat0 + 0.6, 1.6));
  const glowAac = 0.55 * smooth(ramp(t, heat0 + 0.6, 1.6)) / 2.4;
  const lanes = [
    { x: -WALL.gap, slow: 1, keep: 1 },
    { x: WALL.gap, slow: 2.4, keep: 1 / 2.4 },
  ];
  const wetFace = WALL.d / 2 + 0.004;
  // water drops thrown at the AAC face, soaking in (no splash)
  const drops = Array.from({ length: 9 }, (_, i) => ({ x: (rnd(i + 1300) - 0.5) * 1.1, y: 0.5 + rnd(i + 1310) * 1.5, hit: wet0 + i * 0.14 + rnd(i + 1320) * 0.1 }));
  const trowelY = WALL.h - (WALL.h - 0.12) * smooth(ramp(t, plaster0, 1.3));
  const plasterOn = t > plaster0;
  return (
    <group position={[HX, 0, 0]}>
      {/* heater behind the walls */}
      <group position={[0, 0, -2.7]}>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[4.2, 1.7, 0.5]} radius={0.12} />
          <ClayMat color={P.terracotta} grain={grain} />
        </mesh>
        {[-1.5, -0.75, 0, 0.75, 1.5].map((x, i) => (
          <mesh key={x} position={[x, 0.95, 0.27]} castShadow>
            <RoundedBoxGeo args={[0.42, 1.3, 0.08]} radius={0.04} />
            <meshStandardMaterial color="#ff8a3a" emissive="#ff5a14" emissiveIntensity={1.4 + 0.5 * Math.sin(st * 5 + i)} roughness={0.7} />
          </mesh>
        ))}
        <pointLight position={[0, 1.0, 0.9]} intensity={7} distance={5} color="#ff9a50" />
        <Blob p={[0, 0, 0]} w={5} d={1.4} o={0.5} />
      </group>
      {/* walls */}
      {(["brick", "aac"] as const).map((kind, i) => {
        const x = (i ? 1 : -1) * WALL.gap;
        return (
          <group key={kind} position={[x, 0, 0]}>
            <mesh position={[0, WALL.h / 2, 0]} castShadow receiveShadow>
              <RoundedBoxGeo args={[WALL.w, WALL.h, WALL.d]} radius={0.03} />
              <meshPhysicalMaterial {...POLISH.clay} color="#ffffff" map={kind === "brick" ? brickTex : aacTex} bumpMap={grain} bumpScale={3} />
            </mesh>
            {/* exit-face heat glow */}
            <mesh position={[0, WALL.h / 2, wetFace]}>
              <planeGeometry args={[WALL.w - 0.06, WALL.h - 0.06]} />
              <meshBasicMaterial color="#ff7a2e" transparent opacity={i ? glowAac : glowRed} toneMapped={false} depthWrite={false} />
            </mesh>
            <Blob p={[0, 0, 0]} w={WALL.w + 0.6} d={1.0} o={0.6} />
          </group>
        );
      })}
      {/* heat arrows */}
      {t > heat0 - 0.2 && t < heat1 + 0.6
        ? lanes.flatMap((ln, li) =>
            Array.from({ length: 18 }, (_, i) => {
              const spawn = heat0 - 0.6 + i * 0.2;
              const age = t - spawn;
              if (age < 0) return null;
              const v = 2.0;
              const z0 = -2.3, wz0 = -WALL.d / 2, wz1 = WALL.d / 2;
              // piecewise path: before wall at v, inside wall at v/slow, after at v
              const tA = (wz0 - z0) / v;
              const tIn = (wz1 - wz0) / (v / ln.slow);
              let z: number;
              if (age < tA) z = z0 + age * v;
              else if (age < tA + tIn) z = wz0 + (age - tA) * (v / ln.slow);
              else z = wz1 + (age - tA - tIn) * v;
              if (z > 3.2) return null;
              const passes = rnd(i * 7 + li * 131) < ln.keep;
              let s = 1;
              if (!passes && z > wz0) s = Math.max(0, 1 - (age - tA) / tIn) * 0.9;
              if (s < 0.05) return null;
              const y = [0.55, 1.2, 1.85][i % 3];
              const xo = ((i % 3) - 1) * 0.42 + (rnd(i + li * 50) - 0.5) * 0.12;
              const hot = z > wz1 ? 1 : 0.8;
              return (
                <group key={`${li}-${i}`} position={[ln.x + xo, y, z]} rotation={[Math.PI / 2, 0, 0]} scale={s * 1.7}>
                  <mesh position={[0, -0.12, 0]}>
                    <cylinderGeometry args={[0.045, 0.045, 0.3, 10]} />
                    <meshStandardMaterial color="#ff8a3a" emissive="#ff5a14" emissiveIntensity={1.2 * hot} roughness={0.7} />
                  </mesh>
                  <mesh position={[0, 0.1, 0]}>
                    <coneGeometry args={[0.11, 0.2, 14]} />
                    <meshStandardMaterial color="#ffb05a" emissive="#ff6a1a" emissiveIntensity={1.3 * hot} roughness={0.7} />
                  </mesh>
                </group>
              );
            }),
          )
        : null}
      {/* water drops + soaked patches on the AAC face */}
      <group position={[WALL.gap, 0, 0]}>
        {drops.map((d, i) => {
          const dt = t - d.hit;
          if (dt < -0.5) return null;
          if (dt < 0) {
            const u = 1 + dt / 0.5;
            return (
              <mesh key={i} position={[d.x, d.y + (1 - u) * 0.6, wetFace + (1 - u) * 2.2]} scale={[0.07, 0.1, 0.07]}>
                <sphereGeometry args={[1, 14, 10]} />
                <meshPhysicalMaterial color="#7fc4e8" roughness={0.05} clearcoat={1} transparent opacity={0.85} />
              </mesh>
            );
          }
          const r = 0.06 + 0.2 * smooth(dt / 1.4);
          return (
            <mesh key={i} position={[d.x, d.y - 0.05 * smooth(dt / 1.4), wetFace + 0.001 + i * 0.0003]} scale={[r, r * 1.25, 1]}>
              <circleGeometry args={[1, 28]} />
              <meshBasicMaterial color="#6f6a63" transparent opacity={0.5} toneMapped={false} depthWrite={false} />
            </mesh>
          );
        })}
        {/* plaster coat slides down behind the trowel */}
        {plasterOn ? (
          <mesh position={[0, (WALL.h + trowelY) / 2, WALL.d / 2 + 0.03]} castShadow>
            <boxGeometry args={[WALL.w + 0.02, Math.max(0.01, WALL.h - trowelY), 0.05]} />
            <meshPhysicalMaterial {...POLISH.clay} color="#CDBB9C" bumpMap={grain} bumpScale={4} />
          </mesh>
        ) : null}
        {t > plaster0 - 0.6 && t < plaster0 + 2.2 ? (
          <group position={[0.1, trowelY, WALL.d / 2 + 0.1]} rotation={[0, 0, 0.08]}>
            <mesh castShadow>
              <RoundedBoxGeo args={[1.0, 0.36, 0.04]} radius={0.015} />
              <meshPhysicalMaterial color="#c7ced4" metalness={0.85} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.34, 8]} />
              <Steel grain={grain} />
            </mesh>
            <mesh position={[0, 0, 0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.07, 0.4, 6, 12]} />
              <ClayMat color={P.mustard} grain={grain} />
            </mesh>
          </group>
        ) : null}
      </group>
    </group>
  );
};
