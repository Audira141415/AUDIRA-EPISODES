// EP05 "Kenapa Kita Selalu Melihat Sisi Bulan yang Sama" — AUDIRA Sains, style SCALEFORGE (Remotion + R3F).
// Audio master clock: public/audio/vo.wav (79,04 s) at offset 0; film 82 s incl. 3 s AUDIRA outro card.
// Multi-scene director (6 acts) keyed to VO word timestamps (audio/vo-words.json):
//   S1 hook 0–8.3 · S2 konteks 8.3–20.9 · S3 orbit terkunci 20.9–36.0 · S4 rem pasang surut + libration 36.0–55.0
//   S5 payoff (sisi jauh terang · Luna 3 · Chang'e 4 · hari 21,5 jam · 3,8 cm) 55.0–73.5 · S6 outro 73.5–82
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene, type FilmShot } from "../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { useFormat } from "../../core/film/format.ts";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { makeEarthTextures, makeSunTexture, makeGlow } from "../../kits/scaleforge/lib/materials";
import { SCALE_PALETTE as P } from "../../kits/scaleforge/lib/palette";
import { makeMoonTextures, makeStarTexture } from "./moonAssets";
import words from "../../../public/audio/vo-words.json";

export const MOON_SECONDS = 82;
const ACC = P.accent; // measuring orange
const COOL = P.accentCool;

// ── scene clock (seconds, from VO) ─────────────────────────────────────────
const S = { s2: 8.3, s3: 20.9, s4: 36.0, s5: 55.0, s5b: 59.0, s5c: 63.4, s5d: 66.5, s5e: 70.7, s6: 73.5, outro: 79.0 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const sm = (k: number) => {
  const x = clamp01(k);
  return x * x * (3 - 2 * x);
};
const seg = (t: number, a: number, b: number) => sm((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: readonly number[], b: readonly number[], k: number) =>
  [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as const;
const MODEL = (p: string) => staticFile(`models/polyfork/${p}.glb`);

// ── shared 3D pieces ───────────────────────────────────────────────────────
const Sky: React.FC = () => {
  const tex = useMemo(() => makeStarTexture(), []);
  return (
    <mesh>
      <sphereGeometry args={[400, 48, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} fog={false} />
    </mesh>
  );
};

/** Moon: local +z = near side (maria). `marker` = orange pin that shows which face points where. */
const Moon: React.FC<{
  r: number;
  position?: readonly [number, number, number];
  yaw?: number;
  stretch?: number; // tidal bulge along local z (exaggerated)
  marker?: boolean;
}> = ({ r, position = [0, 0, 0], yaw = 0, stretch = 1, marker = false }) => {
  const { map, bump } = useMemo(() => makeMoonTextures(), []);
  return (
    <group position={[...position]} rotation={[0, yaw, 0]}>
      <mesh scale={[1, 1, stretch]} castShadow receiveShadow>
        <sphereGeometry args={[r, 128, 64]} />
        <meshStandardMaterial map={map} bumpMap={bump} bumpScale={0.6} roughness={0.96} metalness={0} />
      </mesh>
      {marker ? (
        <group position={[0, 0, r * stretch]}>
          <mesh position={[0, 0, r * 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[r * 0.035, r * 0.035, r * 0.36, 12]} />
            <meshStandardMaterial color={ACC} emissive={ACC} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0, r * 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[r * 0.11, r * 0.2, 16]} />
            <meshStandardMaterial color={ACC} emissive={ACC} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

let earthCache: ReturnType<typeof makeEarthTextures> | null = null;
const Earth: React.FC<{ r: number; position?: readonly [number, number, number]; spin?: number }> = ({ r, position = [0, 0, 0], spin = 0 }) => {
  const tex = useMemo(() => (earthCache ??= makeEarthTextures()), []);
  return (
    <group position={[...position]} rotation={[0.41, spin, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[r, 96, 48]} />
        <meshStandardMaterial map={tex.surface} roughness={0.7} metalness={0.02} />
      </mesh>
      <mesh scale={1.015}>
        <sphereGeometry args={[r, 96, 48]} />
        <meshStandardMaterial map={tex.clouds} transparent depthWrite={false} roughness={1} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[r, 64, 32]} />
        <meshBasicMaterial color={P.atmosphere} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Sun: React.FC<{ r: number; position: readonly [number, number, number] }> = ({ r, position }) => {
  const tex = useMemo(() => makeSunTexture(), []);
  const glow = useMemo(() => makeGlow(), []);
  return (
    <group position={[...position]}>
      <mesh>
        <sphereGeometry args={[r, 64, 32]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <sprite scale={[r * 5, r * 5, 1]}>
        <spriteMaterial map={glow} color={P.sunEdge} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
};

/** Gravity pull arrow (cylinder + cone), pointing along -x. */
const PullArrow: React.FC<{ position: readonly [number, number, number]; len: number; k: number }> = ({ position, len, k }) => (
  <group position={[...position]} rotation={[0, 0, Math.PI / 2]} scale={[1, Math.max(0.01, k), 1]}>
    <mesh position={[0, len / 2, 0]}>
      <cylinderGeometry args={[0.06, 0.06, len, 12]} />
      <meshStandardMaterial color={ACC} emissive={ACC} emissiveIntensity={0.8} />
    </mesh>
    <mesh position={[0, len + 0.18, 0]}>
      <coneGeometry args={[0.18, 0.36, 16]} />
      <meshStandardMaterial color={ACC} emissive={ACC} emissiveIntensity={0.8} />
    </mesh>
  </group>
);

// ── per-act 3D content + camera ─────────────────────────────────────────────
type Act = { shot: FilmShot; node: React.ReactNode; sunPos: readonly [number, number, number]; sunI: number };

const act = (t: number): Act => {
  // S1 HOOK — full Moon close-up, camera arcs toward the unseen back
  if (t < S.s2) {
    const k = seg(t, 0, S.s2);
    const ang = lerp(0, 0.95, seg(t, 3.6, S.s2));
    const d = lerp(8.6, 7.2, k);
    return {
      shot: { pos: [Math.sin(ang) * d, 0.6, Math.cos(ang) * d], target: [0, 0, 0], fov: 32 },
      node: <Moon r={2.2} yaw={t * 0.04} />,
      sunPos: [6, 2, 9],
      sunI: 3.2,
    };
  }
  // S2 CONTEXT — three nights, same face
  if (t < S.s3) {
    const k = seg(t, S.s2, S.s3);
    return {
      shot: { pos: [lerp(-1.2, 1.2, k), 0.3, lerp(12.5, 11.2, k)], target: [0, 0.2, 0], fov: 34 },
      node: (
        <>
          {[-3.2, 0, 3.2].map((x, i) => (
            <Moon key={i} r={1.25} position={[x, i === 1 ? 0.5 : -0.2, 0]} yaw={0} />
          ))}
        </>
      ),
      sunPos: [4, 3, 10],
      sunI: 3,
    };
  }
  // S3 MAIN — top-down orbit; Moon spins once per orbit, marker always faces Earth
  if (t < S.s4) {
    const orbit = seg(t, 21.6, 34.0) * Math.PI * 2;
    const R = 5;
    const mx = Math.sin(orbit) * R;
    const mz = Math.cos(orbit) * R;
    const k = seg(t, S.s3, S.s4);
    return {
      shot: { pos: [lerp(-2, 2, k), lerp(12.5, 11, k), lerp(9.5, 8.5, k)], target: [0, 0, 0.4], fov: 40 },
      node: (
        <>
          <Earth r={1.5} spin={t * 0.5} />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R, 0.025, 8, 160]} />
            <meshBasicMaterial color={COOL} transparent opacity={0.7} toneMapped={false} />
          </mesh>
          {/* yaw = orbit + π: local +z (near side + marker) always points back at Earth */}
          <Moon r={0.62} position={[mx, 0, mz]} yaw={orbit + Math.PI} marker />
        </>
      ),
      sunPos: [10, 6, 4],
      sunI: 3.2,
    };
  }
  // S4 EXPLANATION — Earth's pull stretches the Moon, the bulge brakes the spin, then libration wobble
  if (t < S.s5) {
    const bulge = seg(t, 38.6, 40.4) * (1 - seg(t, 49.6, 50.6));
    // spin: fast at 36 s, decays to locked by 45.7 s; afterwards a small libration wobble
    const tl = clamp01((t - S.s4) / (45.7 - S.s4));
    const spinAngle = 9 * (tl - (tl * tl) / 2) * 2; // integral of a linearly decaying angular speed
    const wobble = seg(t, 50.1, 51) * Math.sin((t - 50.1) * 2.2) * 0.22;
    const yaw = -Math.PI / 2 + (t < 45.7 ? spinAngle - 9 : 0) + wobble; // locks with near side toward Earth (−x)
    const wide = seg(t, 46.6, 47.6) * (1 - seg(t, 49.8, 50.6));
    return {
      shot: {
        pos: [lerp(-1.6, -3.4, wide), lerp(1.2, 2.2, wide), lerp(8.4, 12.5, wide)],
        target: [lerp(-1.3, -2.4, wide), 0, 0],
        fov: 36,
      },
      node: (
        <>
          <Earth r={1.7} position={[-7.2, 0, -1]} spin={t * 0.6} />
          <group scale={[1 + 0.32 * bulge, 1, 1]}><Moon r={1.6} yaw={yaw} marker={t >= 45.7} /></group>
          <PullArrow position={[-1.9 - 0.5 * bulge, 0, 0]} len={1.5} k={bulge} />
          <PullArrow position={[-1.9, 1.15, 0]} len={0.9} k={bulge * 0.8} />
          <PullArrow position={[-1.9, -1.15, 0]} len={0.9} k={bulge * 0.8} />
        </>
      ),
      sunPos: [3, 5, 9],
      sunI: 3,
    };
  }
  // S5a — far side, lit by the Sun
  if (t < S.s5b) {
    const k = seg(t, S.s5, S.s5b);
    return {
      shot: { pos: [lerp(1.5, -0.5, k), 0.8, lerp(-8.6, -7.4, k)], target: [0, 0, 0], fov: 34 },
      node: (
        <>
          <Moon r={2.2} yaw={0} />
          <Sun r={2.2} position={[-30, 6, -40]} />
          <Earth r={0.5} position={[3.2, -2.6, 9]} spin={t} />
        </>
      ),
      sunPos: [-30, 6, -40],
      sunI: 4,
    };
  }
  // S5b — Luna 3 flies behind the Moon (1959)
  if (t < S.s5c) {
    const k = seg(t, S.s5b, S.s5c);
    return {
      shot: { pos: [lerp(-4, -2.2, k), 1.6, lerp(-8.5, -7.6, k)], target: [lerp(-1.4, 0.4, k), 0.4, -2.2], fov: 38 },
      node: (
        <>
          <Moon r={2.2} yaw={0} />
          <group position={[lerp(-3.4, 2.2, k), lerp(1.2, 1.7, k), -3.6]} rotation={[0.2, t * 0.4, 0.1]}>
            <AssetModel src={MODEL("prop/comm-satellite-fdc2cd")} size={1.5} metalness={0.7} roughness={0.35} />
          </group>
        </>
      ),
      sunPos: [-20, 8, -30],
      sunI: 3.6,
    };
  }
  // S5c — Chang'e 4 rover on the far-side crater floor (2019)
  if (t < S.s5d) {
    const k = seg(t, S.s5c, S.s5d);
    return {
      shot: { pos: [lerp(3.6, 2.4, k), lerp(1.5, 1.1, k), lerp(4.8, 3.8, k)], target: [0, 0.4, 0], fov: 40 },
      node: (
        <>
          <AssetModel src={MODEL("prop/crater-terrain-blob-bd6af6")} size={14} ground position={[0, -0.6, 0]} tint="#8F8C86" roughness={0.97} />
          <AssetModel src={MODEL("prop/regolith-boulder-1f1f14")} size={0.9} ground position={[-1.8, -0.1, -0.6]} tint="#7E7B75" />
          <AssetModel src={MODEL("prop/regolith-boulder-1f1f14")} size={0.55} ground position={[1.6, -0.1, -1.4]} tint="#8A8780" />
          <group position={[lerp(-0.4, 0.5, k), 0, lerp(0.6, 0.1, k)]} rotation={[0, -0.7, 0]}>
            <AssetModel src={MODEL("vehicle/exploration-rover-7afd91")} size={1.4} ground />
          </group>
        </>
      ),
      sunPos: [-6, 9, 4],
      sunI: 3.4,
    };
  }
  // S5d — Earth's day used to be ~21.5 h (hourglass foreground)
  if (t < S.s5e) {
    const k = seg(t, S.s5d, S.s5e);
    return {
      shot: { pos: [lerp(0.6, -0.4, k), 0.4, lerp(8.2, 7.4, k)], target: [0, 0, 0], fov: 36 },
      node: (
        <>
          <Earth r={1.8} position={[0.4, 0.7, -1.5]} spin={t * 2.2} />
          <group position={[-1.3, -2.2, 2.2]} rotation={[0, 0.5 + t * 0.15, 0]}>
            <AssetModel src={MODEL("an-hourglass-with-sand-ec9f11")} size={1.6} ground />
          </group>
        </>
      ),
      sunPos: [6, 4, 8],
      sunI: 3.2,
    };
  }
  // S5e — laser ranging: Moon recedes 3.8 cm per year
  if (t < S.s6) {
    const k = seg(t, S.s5e, S.s6);
    const mx = lerp(4.4, 5.0, k);
    return {
      shot: { pos: [0.6, 1.4, 10.5], target: [0.6, 0, 0], fov: 40 },
      node: (
        <>
          <Earth r={1.5} position={[-3.6, 0, 0]} spin={t * 0.6} />
          <Moon r={0.6} position={[mx, 0, 0]} yaw={-Math.PI / 2} />
          <group position={[-2.0, 0.6, 0.4]} rotation={[0, 0, -Math.PI / 2]}>
            <AssetModel src={MODEL("prop/laser-pointer-ray-a70928")} size={0.7} />
          </group>
          <group position={[mx - 0.62, 0.15, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
            <AssetModel src={MODEL("prop/phase-mirror-1a43e9")} size={0.32} metalness={0.7} roughness={0.35} />
          </group>
          <mesh position={[(-2.0 + mx - 0.6) / 2, 0.45, 0.3]} rotation={[0, 0, Math.PI / 2 + 0.05]}>
            <cylinderGeometry args={[0.025, 0.025, mx - 0.6 + 2.0, 8]} />
            <meshBasicMaterial color="#5CFF6B" transparent opacity={0.85 * seg(t, S.s5e + 0.2, S.s5e + 0.6)} toneMapped={false} />
          </mesh>
        </>
      ),
      sunPos: [4, 6, 9],
      sunI: 3,
    };
  }
  // S6 OUTRO — Earth and Moon side by side in warm light, near-side marker facing Earth
  const k = seg(t, S.s6, MOON_SECONDS);
  const orbit = lerp(-0.5, 0.3, k);
  return {
    shot: { pos: [lerp(-1, 1.5, k), lerp(1.2, 0.8, k), lerp(11, 9.8, k)], target: [0.4, 0, 0], fov: 36 },
    node: (
      <>
        <Earth r={1.9} position={[-1.6, 0, 0]} spin={t * 0.4} />
        <Moon r={0.85} position={[-1.6 + Math.cos(orbit) * 4.8, 0.4, Math.sin(orbit) * -2]} yaw={-Math.PI / 2 - orbit * 0.4} marker />
      </>
    ),
    sunPos: [12, 3, 2],
    sunI: 3.6,
  };
};

// ── 2D overlay: callouts per act + karaoke ─────────────────────────────────
const pop = (t: number, a: number) => clamp01((t - a) / 0.25);
const Card: React.FC<{ t: number; at: number; until?: number; x: number; y: number; size?: number; color?: string; children: React.ReactNode; align?: "left" | "center" | "right" }> = ({
  t, at, until = 999, x, y, size = 64, color = "#ffffff", children, align = "center",
}) => {
  if (t < at || t > until) return null;
  const k = pop(t, at) * (1 - clamp01((t - until + 0.25) / 0.25));
  return (
    <SafeLabel x={x} y={y + (1 - k) * 30} align={align} size={size} color={color} opacity={k} plate="rgba(8,12,20,0.84)"
      style={{ transform: `scale(${0.9 + 0.1 * k})`, borderLeft: `${10}px solid ${ACC}` }}>
      {children}
    </SafeLabel>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* S1 */}
    <Card t={t} at={2.0} until={S.s2} x={540} y={300} size={56}>PUNGGUNG BULAN = ?</Card>
    <Card t={t} at={4.6} until={S.s2} x={540} y={430} size={120} color={ACC}>1959</Card>
    {/* S2 */}
    <Card t={t} at={11.0} until={16.2} x={150} y={620} size={40} align="left">MALAM INI</Card>
    <Card t={t} at={11.7} until={16.2} x={540} y={540} size={40}>BULAN DEPAN</Card>
    <Card t={t} at={13.3} until={16.2} x={930} y={620} size={40} align="right">100 TAHUN LAGI</Card>
    <Card t={t} at={14.4} until={16.2} x={540} y={1120} size={52} color={COOL}>WAJAHNYA SELALU SAMA</Card>
    <Card t={t} at={16.6} until={S.s3} x={540} y={330} size={76}>BULAN DIAM?</Card>
    {t >= 19.7 && t < S.s3 ? (
      <SafeLabel x={540} y={470} align="center" size={96} color="#FF4D4D" plate="rgba(30,4,4,0.86)" opacity={pop(t, 19.7)}
        style={{ transform: `rotate(-6deg) scale(${1.25 - 0.25 * pop(t, 19.7)})` }}>× KELIRU</SafeLabel>
    ) : null}
    {/* S3 */}
    <Card t={t} at={21.3} until={S.s4} x={540} y={250} size={44} color={COOL}>AUDIRA SAINS · LAB ORBIT</Card>
    <Card t={t} at={22.9} until={S.s4} x={90} y={360} size={52} align="left">1× BERPUTAR = 27,3 HARI</Card>
    <Card t={t} at={25.6} until={S.s4} x={90} y={470} size={52} align="left">1× MENGORBIT = 27,3 HARI</Card>
    {t >= S.s3 + 0.6 && t < S.s4 ? (
      <SafeLabel x={990} y={1110} align="right" size={44} color={ACC} plate="rgba(8,12,20,0.84)">
        HARI {(seg(t, 21.6, 34.0) * 27.3).toFixed(1).replace(".", ",")} / 27,3
      </SafeLabel>
    ) : null}
    <Card t={t} at={34.1} until={S.s4} x={540} y={1000} size={56} color={ACC}>PENGUNCIAN PASANG SURUT</Card>
    {t >= S.s3 && t < S.s4 ? <SafeLabel x={990} y={1210} align="right" size={36} plate={false} color="#C9D4E2">skala jarak tidak sebanding</SafeLabel> : null}
    {/* S4 */}
    <Card t={t} at={36.2} until={38.4} x={540} y={300} size={60}>DULU: BERPUTAR LEBIH CEPAT</Card>
    <Card t={t} at={38.6} until={46.6} x={540} y={300} size={56} color={ACC}>TARIKAN GRAVITASI BUMI</Card>
    <Card t={t} at={40.4} until={46.6} x={540} y={410} size={40}>tonjolan dibesar-besarkan</Card>
    <Card t={t} at={42.6} until={45.6} x={540} y={1040} size={84} color="#FFB020">DIREM!</Card>
    <Card t={t} at={45.7} until={46.8} x={540} y={1040} size={84} color={ACC}>TERKUNCI</Card>
    <Card t={t} at={47.0} until={50.0} x={540} y={300} size={52}>HAMPIR SEMUA BULAN BESAR TERKUNCI</Card>
    <Card t={t} at={47.6} until={50.0} x={540} y={470} size={44} color={COOL}>Io · Europa · Titan · Charon</Card>
    <Card t={t} at={50.1} until={S.s5} x={540} y={300} size={52}>GOYANGAN ORBIT (LIBRASI)</Card>
    <Card t={t} at={53.3} until={S.s5} x={540} y={420} size={128} color={ACC}>±59%</Card>
    <Card t={t} at={53.8} until={S.s5} x={540} y={600} size={40}>permukaan Bulan bisa terlihat</Card>
    {/* S5 */}
    <Card t={t} at={55.2} until={S.s5b} x={540} y={300} size={60}>SISI JAUH ≠ SISI GELAP</Card>
    <Card t={t} at={56.9} until={S.s5b} x={540} y={420} size={48} color="#FFC24A">disinari Matahari</Card>
    <Card t={t} at={59.4} until={S.s5c} x={90} y={300} size={60} align="left" color={ACC}>LUNA 3 · 1959</Card>
    <Card t={t} at={60.4} until={S.s5c} x={90} y={410} size={40} align="left">foto pertama sisi jauh</Card>
    <Card t={t} at={63.6} until={S.s5d} x={90} y={300} size={60} align="left" color={ACC}>CHANG'E 4 · 2019</Card>
    <Card t={t} at={64.3} until={S.s5d} x={90} y={410} size={40} align="left">pendaratan pertama di sisi jauh</Card>
    <Card t={t} at={66.7} until={S.s5e} x={540} y={300} size={52}>BUMI IKUT DIREM</Card>
    <Card t={t} at={68.2} until={S.s5e} x={540} y={420} size={92} color={ACC}>1 HARI ≈ 21,5 JAM</Card>
    <Card t={t} at={68.8} until={S.s5e} x={540} y={580} size={38}>±620 juta tahun lalu</Card>
    <Card t={t} at={70.9} until={S.s6} x={540} y={300} size={52}>BULAN MENJAUH</Card>
    <Card t={t} at={71.6} until={S.s6} x={540} y={420} size={104} color={ACC}>+3,8 CM/TAHUN</Card>
    <Card t={t} at={72.0} until={S.s6} x={540} y={600} size={38}>diukur laser ke cermin Apollo</Card>
    {/* S6 */}
    <Card t={t} at={74.3} until={S.outro} x={540} y={320} size={64}>BUKAN DIAM,</Card>
    <Card t={t} at={75.2} until={S.outro} x={540} y={440} size={64} color={ACC}>BERPUTAR SEIRAMA</Card>
  </>
);

type W = { text: string; start: number; end: number };
const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const list = words as W[];
  // phrases: split on gaps > 0.3 s or every 5 words
  const phrases = useMemo(() => {
    const out: W[][] = [];
    let cur: W[] = [];
    list.forEach((w, i) => {
      if (cur.length && (w.start - list[i - 1].end > 0.3 || cur.length >= 5)) {
        out.push(cur);
        cur = [];
      }
      cur.push(w);
    });
    if (cur.length) out.push(cur);
    return out;
  }, [list]);
  const ph = phrases.find((p) => t >= p[0].start - 0.05 && t < p[p.length - 1].end + 0.35);
  if (!ph || t > S.outro) return null;
  const size = 54;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 1300 * s, display: "flex", justifyContent: "center" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.4em", rowGap: 0,
          fontFamily: FONT, fontWeight: 800, fontSize: size * s, lineHeight: 1.25,
          background: "rgba(8,12,20,0.72)", padding: `${16 * s}px ${26 * s}px`, borderRadius: 16 * s,
        }}>
          {ph.map((w, i) => {
            const active = t >= w.start && t < w.end + 0.05;
            const past = t >= w.end + 0.05;
            return (
              <span key={i} style={{
                color: active ? ACC : past ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                transform: `scale(${active ? 1.04 : 1})`, display: "inline-block",
              }}>{w.text}</span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── film ───────────────────────────────────────────────────────────────────
const CUTS = [S.s2, S.s3, S.s4, S.s5, S.s5b, S.s5c, S.s5d, S.s5e, S.s6];

export const MoonFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const a = act(t);
  // short dip to black around each cut (0.18 s each side)
  const fade = Math.max(0, ...CUTS.map((c) => 1 - Math.abs(t - c) / 0.18));

  return (
    <AbsoluteFill style={{ backgroundColor: P.space }}>
      <Voiceover src="audio/vo.wav" offset={0} />
      <FilmScene
        frame={frame}
        shot={a.shot}
        background={P.space}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={1}
        envIntensity={0.55}
        ao={false}
        near={0.05}
        far={1200}
        fade={fade}
        fadeColor="#000000"
      >
        <Sky />
        <ambientLight intensity={0.12} />
        <hemisphereLight args={["#BFD4FF", "#1A1410", 0.12]} />
        <directionalLight
          position={[...a.sunPos]}
          intensity={a.sunI}
          color={t >= S.s6 ? "#FFD6A0" : "#FFF6EA"}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-6, -2, 6]} intensity={0.25} color="#7EA6FF" />
        {a.node}
      </FilmScene>
      <Overlay t={t} />
      <Karaoke t={t} />
      <AudiraSignature seed="sains-anak-ep05-sisi-bulan" code="SAINS" />
      <AudiraOutro seconds={MOON_SECONDS - S.outro} code="SAINS" />
    </AbsoluteFill>
  );
};
