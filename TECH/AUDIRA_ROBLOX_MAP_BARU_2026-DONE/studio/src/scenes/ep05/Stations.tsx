// EP05 film stations (DEVFORGE). One continuous world: stations sit side by side along +x and the camera
// travels between them. Station 0 is the cover/hook map at the origin. All timings come from timing.ts
// (word times of the locked voice). t = seconds, f = 60 fps film clock.
import React, { useMemo } from "react";
import * as THREE from "three";
import { DEVFORGE_PALETTE as P } from "../../kits/devforge/lib/palette.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { BlockAvatar, type AvatarPose } from "../_shared/BlockAvatar.tsx";
import { Coin, DriftCubes, GRASS, HERO0, MapSet, NPC0, NeonFrame, Platform, hash, type V3 } from "./Hook.tsx";
import { cardTexture, filmPanelTexture, sketchTexture, type CardSpec } from "./textures.ts";
import { clamp01, easeOutBack, lerp, ramp, w, win } from "./timing.ts";

export const SX = { s0: 0, s1: 34, s2a: 66, s2b: 94, s2c: 122, s3: 154, s4: 186, s4b: 214, s5: 244 } as const;

// ---------- generic HUD card ----------
const RED = "#FF4D4F";

export const Card3D: React.FC<{
  spec: CardSpec;
  w: number;
  pos: V3;
  rot?: V3;
  show?: number;
  edge?: string;
  dim?: number;
}> = ({ spec, w: cw, pos, rot = [0, 0, 0], show = 1, edge = P.accentNeon, dim = 0 }) => {
  const tex = cardTexture(spec);
  const h = (cw * spec.h) / spec.w;
  if (show <= 0.01) return null;
  const s = easeOutBack(clamp01(show));
  const c = new THREE.Color(1, 1, 1).multiplyScalar(1 - dim * 0.6);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[cw + 0.3, h + 0.3, 0.25]} radius={0.12} segments={3} />
        <meshPhysicalMaterial color={P.editorHeader} roughness={0.2} metalness={0.3} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.135]}>
        <planeGeometry args={[cw, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} transparent color={c} />
      </mesh>
      <group position={[0, 0, 0.14]}>
        <NeonFrame w={cw + 0.3} h={h + 0.3} color={dim > 0.5 ? "#30363D" : edge} intensity={2.4} />
      </group>
    </group>
  );
};

/** One-line label spec. */
const label = (t: string, color: string = "#FFFFFF", bg: string = P.editorBg, size = 120, wpx = 1024, hpx = 220): CardSpec => ({
  w: wpx,
  h: hpx,
  bg,
  lines: [{ t, size, color, y: hpx / 2 + size * 0.36, font: "display" }],
});

/** Two big lines (no tiny sub-text). */
const stack = (a: string, b: string, ca: string = "#FFFFFF", cb: string = P.accentNeon, bg: string = P.editorBg): CardSpec => ({
  w: 1024,
  h: 380,
  bg,
  lines: [
    { t: a, size: 124, color: ca, y: 160, font: "display" },
    { t: b, size: 112, color: cb, y: 316, font: "display" },
  ],
});

const Floor: React.FC<{ seed: number; x0?: number; x1?: number; top?: number; finish?: number }> = ({ seed, x0 = -16, x1 = 16, top = -8, finish = 1 }) => (
  <Platform x0={x0} x1={x1} top={top} seed={seed} finish={finish} bodyH={6} />
);

/** Dark seam between straight legs so two legs read as two legs (straight, non-lifting poses only). */
export const LegSeam: React.FC = () => (
  <mesh position={[0, 1.0, 0]}>
    <boxGeometry args={[0.07, 1.96, 0.9]} />
    <meshStandardMaterial color="#0B0F18" roughness={0.9} />
  </mesh>
);
const STRAIGHT: AvatarPose[] = ["stand", "type", "point", "think", "wave"];

const Avatar: React.FC<{ f: number; pose: AvatarPose; pos: V3; rot: number; seed?: number; colors?: { torso?: string; legs?: string; skin?: string }; rightHand?: React.ReactNode; seam?: boolean }> = ({ f, pose, pos, rot, seed = 1, colors, rightHand, seam }) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <BlockAvatar f={f} pose={pose} seed={seed} colors={colors} rightHand={rightHand} />
    {seam && STRAIGHT.includes(pose) ? <LegSeam /> : null}
  </group>
);

// =====================================================================================
// S0 — hook: the cover map; the prompt gets erased ("asal-asalan") and the map breaks.
// =====================================================================================
export const S0Hook: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const erase = ramp(t, w("l01", "asal-asalan", 1), 0.6);
  const chars = Math.round(lerp(47, 6, erase));
  const chaos = ramp(t, w("l01", "hasilnya"), 0.9);
  const fall = ramp(t, w("l01", "hasilnya") + 0.2, 1.1);
  const hero = { pos: [HERO0[0] - fall * 1.5, HERO0[1] - fall * 3.5, HERO0[2]] as V3, pose: "jump" as AvatarPose, rot: -0.35, tumble: fall * 1.1 };
  const npc = { pos: [NPC0[0], NPC0[1] - chaos * 1.4, NPC0[2]] as V3, pose: (chaos > 0.5 ? "think" : "run") as AvatarPose, rot: -0.9 + chaos * 0.6 };
  return (
    <group position={[SX.s0, 0, 0]}>
      <MapSet f={f} chars={chars} chaos={chaos} hero={hero} npc={npc} range={1 - ramp(t, w("l01", "tapi"), 0.5)} alert={1 - chaos} strips={1 - erase} />
      <Card3D spec={label("ASAL-ASALAN", "#FFFFFF", "#B3261E")} w={6.4} pos={[3.6, 0.4, -4]} rot={[0, -0.12, 0.06]} show={ramp(t, w("l01", "asal-asalan", 1) + 0.3, 0.45)} edge={RED} />
    </group>
  );
};

// =====================================================================================
// S1 — context: two routes. BUILD (2D/2.5D genres) on the left, ASSISTANT (Roblox Studio) on the right.
// =====================================================================================
const GENRES = ["clicker", "arcade", "kumpulkan poin", "side-scroller", "puzzle"];
const GENRE_WORDS: [string, string][] = [["clicker", "l02"], ["arcade", "l02"], ["kumpulkan", "l02"], ["side-scroller", "l02"], ["puzzle", "l02"]];
const GENRE_COL = [P.amberGold, P.metricProfit, P.codeFunc, P.accentNeon, "#FF7B72"];

export const S1Context: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tBuild = w("l02", "build");
  const tAsst = w("l03", "assistant");
  const tLalu = w("l03", "lalu");
  const focusAsst = ramp(t, tAsst, 0.5);
  const heroRot = lerp(-1.1, 1.1, focusAsst);
  const pose: AvatarPose = t < tBuild ? "stand" : "point";
  return (
    <group position={[SX.s1, 0, 0]}>
      <DriftCubes f={f} seed={1} />
      <Floor seed={21} />
      {/* BUILD route */}
      <group position={[-3.7, 0, -3]} rotation={[0, 0.22, 0]}>
        <Card3D spec={stack("BUILD", "2D / 2.5D")} w={6.4} pos={[0, 6.0, 0]} show={win(t, w("l02", "ada"), tLalu - 0.2, 0.4)} />
        {/* one genre at a time, on its word */}
        {GENRES.map((g, i) => {
          const a = w(GENRE_WORDS[i][1], GENRE_WORDS[i][0]) - 0.05;
          const b = i < GENRES.length - 1 ? w(GENRE_WORDS[i + 1][1], GENRE_WORDS[i + 1][0]) - 0.1 : tLalu - 0.2;
          return <Card3D key={g} spec={label(g, "#FFFFFF", P.editorBg, 120, 1024, 220)} w={6.4} pos={[0.1, 2.6, 0.6]} show={win(t, a, b, 0.3)} edge={GENRE_COL[i]} />;
        })}
      </group>
      {/* ASSISTANT route */}
      <group position={[4.4, 0, -3]} rotation={[0, -0.22, 0]}>
        <Card3D spec={stack("ASSISTANT", "Roblox Studio", "#FFFFFF", P.codeFunc)} w={6.6} pos={[0, 6.0, 0]} show={Math.max(win(t, w("l02", "ada"), tBuild - 0.1, 0.35), ramp(t, tLalu, 0.4))} edge={P.codeFunc} />
        <Card3D spec={label("kontrol penuh", P.codeFunc, P.editorBg, 120, 1024, 220)} w={6.0} pos={[0, 2.6, 0.6]} show={ramp(t, w("l03", "kontrol"), 0.4)} edge={P.codeFunc} />
        {/* studio gizmo: a block with move arrows, the "full control" toy */}
        <group position={[0, -0.6, 0.6]} rotation={[0.3, f * 0.004, 0]} scale={easeOutBack(clamp01((t - tAsst) / 0.5)) * 1.0 + 0.0001}>
          <mesh castShadow>
            <RoundedBoxGeo args={[2.2, 2.2, 2.2]} radius={0.18} />
            <meshPhysicalMaterial {...POLISH.brickABS} color={GRASS} />
          </mesh>
          {([[1, 0, 0, "#FF5F56"], [0, 1, 0, "#27C93F"], [0, 0, 1, "#3B82F6"]] as [number, number, number, string][]).map(([x, y, z, c]) => (
            <group key={c} rotation={[z ? Math.PI / 2 : 0, 0, x ? -Math.PI / 2 : 0]}>
              <mesh position={[0, 2.1, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 1.6, 12]} />
                <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.4} toneMapped={false} />
              </mesh>
              <mesh position={[0, 3.05, 0]}>
                <coneGeometry args={[0.26, 0.6, 16]} />
                <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.4} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      {/* the player stands at the fork and points at each route */}
      <Avatar f={f} pose={pose} pos={[0.3, -8, 1.5]} rot={heroRot} seam />
    </group>
  );
};

// =====================================================================================
// S2a — main: 1 message = 1 prompt, free daily allowance drains, credits bought with Robux.
// =====================================================================================
export const S2aEconomy: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tSatu = w("l04", "satu", 1);
  const tJatah = w("l04", "jatah");
  const tHabis = w("l04", "habis");
  const tKredit = w("l04", "kreditnya");
  const tJadi = w("l04", "jadi");
  const drain = ramp(t, tHabis, 0.8);
  const refill = ramp(t, tKredit + 0.4, 1.2);
  const heroPose: AvatarPose = t > tJadi ? "think" : "type";
  // one prompt bubble flies from the terminal into the counter card
  const fly = clamp01((t - (tSatu + 0.2)) / 1.4);
  const bubblePos: V3 = [lerp(-3.4, 1.5, fly), lerp(-3.2, 7.2, fly) + Math.sin(fly * Math.PI) * 1.2, lerp(1.2, -1.6, fly)];
  return (
    <group position={[SX.s2a, 0, 0]}>
      <DriftCubes f={f} seed={2} />
      <Floor seed={22} />
      <Card3D spec={label("1 pesan = 1 prompt", P.accentNeon, P.editorBg, 112)} w={8.4} pos={[0.6, 5.2, -2]} show={win(t, tSatu, tJatah - 0.1, 0.4)} />
      {fly > 0 && fly < 0.98 ? (
        <Card3D spec={label("prompt", P.editorBg, P.accentNeon, 130, 512, 200)} w={2.6} pos={bubblePos} rot={[0, 0, -0.1]} show={1} />
      ) : null}
      {/* terminal the player types at */}
      <group position={[-2.2, -4.6, 1.6]} rotation={[-0.5, -0.5, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[3.2, 2.0, 0.2]} radius={0.08} />
          <meshPhysicalMaterial color={P.editorHeader} roughness={0.2} metalness={0.3} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[3.0, 1.8]} />
          <meshBasicMaterial map={filmPanelTexture("prompt", -1, Math.floor(t * 2.2) % 2 === 0)} toneMapped={false} />
        </mesh>
      </group>
      <Avatar f={f} pose={heroPose} pos={[-4.6, -8, 0.4]} rot={0.75} seam />
      {/* daily free allowance meter */}
      <Card3D spec={stack("jatah gratis", "harian", "#FFFFFF", P.metricProfit)} w={7} pos={[0.6, 4.8, -2]} show={win(t, tJatah, tKredit, 0.4)} edge={P.metricProfit} />
      <group position={[3.7, -7.2, 0]} scale={easeOutBack(clamp01((t - tJatah) / 0.5)) + 0.0001}>
        <mesh position={[0, 4.1, 0]}>
          <RoundedBoxGeo args={[2.6, 8.6, 2.0]} radius={0.3} />
          <meshPhysicalMaterial color="#0D1117" roughness={0.1} metalness={0.2} transmission={0.2} transparent opacity={0.55} clearcoat={1} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          // drains from the top segment down, then refills gold (credits)
          const gone = clamp01(drain * 5 - (4 - i));
          const back = clamp01(refill * 5 - i);
          const on = 1 - gone + back * gone;
          const col = back > 0.5 ? P.amberGold : gone > 0.5 ? "#3A1F24" : P.metricProfit;
          return (
            <mesh key={i} position={[0, 0.9 + i * 1.6, 0]} scale={[1, 0.25 + on * 0.75, 1]} castShadow>
              <RoundedBoxGeo args={[2.0, 1.3, 1.5]} radius={0.15} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={gone > 0.5 && back < 0.5 ? 0.1 : 1.3} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      <Card3D spec={label("habis", "#FFFFFF", "#B3261E", 120, 640, 220)} w={3.2} pos={[3.7, 3.0, 1.4]} show={win(t, tHabis, tKredit + 0.2, 0.35)} edge={RED} />
      {/* credits bought with Robux: coins drop into the meter */}
      {[0, 1, 2].map((i) => {
        const k = clamp01((t - tKredit - i * 0.25) / 0.9);
        if (k <= 0 || k >= 1) return null;
        return <Coin key={i} pos={[3.7 + (i - 1) * 0.5, lerp(7, -1, k * k), 1.4]} f={f} seed={i + 4} scale={1.4} />;
      })}
      <Card3D spec={stack("kredit", "= Robux", "#FFFFFF", P.amberGold)} w={6.4} pos={[0.6, 4.8, -2]} show={win(t, tKredit + 0.1, w("l04", "jangan") - 0.1, 0.4)} edge={P.amberGold} />
      <Card3D spec={label("jangan boros", "#FFFFFF", "#B3261E", 120)} w={7} pos={[0.6, 5.2, -2]} show={ramp(t, w("l04", "jangan"), 0.45)} edge={RED} />
    </group>
  );
};

// =====================================================================================
// S2b — ~14% of prompt sessions end in a published game (Roblox data): 10×10 wall, 14 cubes light.
// =====================================================================================
const LIT = (() => {
  const idx = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => hash(a * 3.1) - hash(b * 3.1));
  return new Set(idx.slice(0, 14));
})();

export const S2bPercent: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tData = w("l05", "data");
  const t14 = w("l05", "14%");
  const tPub = w("l05", "diterbitkan");
  const wall = ramp(t, tData - 0.4, 0.8);
  return (
    <group position={[SX.s2b, 0, 0]}>
      <DriftCubes f={f} seed={3} />
      <Floor seed={23} />
      <Card3D
        spec={{ w: 1024, h: 360, bg: P.editorBg, lines: [{ t: "14%", size: 260, color: P.metricProfit, y: 270, font: "display" }] }}
        w={5.6}
        pos={[-3.6, 7.6, 0.5]}
        rot={[0, 0.15, 0]}
        show={ramp(t, t14, 0.45)}
        edge={P.metricProfit}
      />
      <Card3D spec={stack("sesi", "prompt", "#FFFFFF", P.accentNeon)} w={5.4} pos={[3.4, 7.6, -1.5]} rot={[0, -0.12, 0]} show={win(t, w("l05", "sesi"), tPub - 0.1, 0.35)} />
      <Card3D spec={stack("game", "diterbitkan", "#FFFFFF", P.amberGold)} w={5.4} pos={[3.4, 7.6, -1.5]} rot={[0, -0.12, 0]} show={ramp(t, tPub, 0.4)} edge={P.amberGold} />
      <group position={[2.0, 0, -3]}>
        {Array.from({ length: 100 }, (_, i) => {
          const c = i % 10, r = Math.floor(i / 10);
          const appear = clamp01(wall * 1.6 - (c + r) / 30);
          if (appear <= 0) return null;
          const lit = LIT.has(i);
          const k = lit ? ramp(t, t14 + (i % 7) * 0.08, 0.4) : 0;
          const pub = lit ? ramp(t, tPub, 0.5) : 0;
          const col = lit && k > 0.5 ? (pub > 0.5 ? P.amberGold : P.metricProfit) : "#1C2433";
          return (
            <mesh key={i} position={[(c - 4.5) * 1.0, -7.3 + r * 1.0, k * 1.4]} scale={appear * (0.82 + k * 0.1)} castShadow>
              <RoundedBoxGeo args={[1, 1, 1]} radius={0.12} segments={2} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={k > 0.5 ? 1.6 : 0.05} roughness={0.35} toneMapped={!(k > 0.5)} />
            </mesh>
          );
        })}
      </group>
      <Avatar f={f} pose={t > t14 ? "point" : "stand"} pos={[-5.4, -8, 1.6]} rot={0.85} seam />
    </group>
  );
};

// =====================================================================================
// S2c — trap: a Build game edited in Studio becomes a normal Studio game, permanently.
// =====================================================================================
export const S2cTrap: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tJeb = w("l06", "jebakan");
  const tEdit = w("l06", "edit");
  const tStat = w("l06", "statusnya");
  const tPerm = w("l06", "permanen");
  const move = ramp(t, tEdit, 1.3);
  const swapped = t > tStat;
  const lock = clamp01((t - tPerm) / 0.35);
  const cardX = lerp(-3.4, 1.4, move);
  return (
    <group position={[SX.s2c, 0, 0]}>
      <DriftCubes f={f} seed={4} />
      <Floor seed={24} />
      <Card3D spec={stack("1 jebakan", "penting", "#1B1B1F", "#1B1B1F", P.amberGold)} w={6.6} pos={[-1.0, 6.4, -2]} show={win(t, tJeb, tEdit, 0.4)} edge={P.amberGold} />
      {/* pedestal */}
      {/* the game card */}
      <Card3D
        spec={swapped ? stack("GAME", "STUDIO", "#FFFFFF", P.codeFunc) : stack("GAME", "BUILD", "#FFFFFF", P.metricProfit)}
        w={3.9}
        pos={[cardX, -3.4, 1.2]}
        rot={[0, -0.1 * move, 0]}
        show={ramp(t, w("l06", "ada") - 0.2, 0.45)}
        edge={swapped ? P.codeFunc : P.metricProfit}
      />
      {/* Studio gate */}
      <group position={[1.4, 0, -0.5]}>
        <NeonFrame w={4.6} h={9.0} color={P.codeFunc} intensity={2.8} />
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[4.4, 8.8]} />
          <meshBasicMaterial color="#1A1033" transparent opacity={0.55} />
        </mesh>
      </group>
      {/* padlock slams on */}
      {lock > 0 ? (
        <group position={[cardX, lerp(5, -1.3, easeOutBack(lock)), 2.2]} scale={1.1}>
          <mesh castShadow>
            <RoundedBoxGeo args={[1.8, 1.5, 0.8]} radius={0.18} />
            <meshStandardMaterial color={P.amberGold} metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <torusGeometry args={[0.6, 0.15, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#C8CCD2" metalness={1} roughness={0.2} />
          </mesh>
        </group>
      ) : null}
      <Card3D spec={label("PERMANEN", "#FFFFFF", "#B3261E", 130)} w={6.0} pos={[-1.2, 6.2, 2.2]} rot={[0, 0, -0.05]} show={ramp(t, tPerm + 0.2, 0.4)} edge={RED} />
      <Avatar f={f} pose={t > tPerm ? "think" : "point"} pos={[-5.4, -8, 2.6]} rot={0.7} seam />
    </group>
  );
};

// =====================================================================================
// S3 — explain: the three keys of Assistant on the cover map, then the official NPC example acted out.
// =====================================================================================
const KEYS = [
  { t: "1 · SPESIFIK", c: P.accentNeon },
  { t: "2 · PILIH OBJEK", c: P.metricProfit },
  { t: "3 · LANGKAH", c: P.codeFunc },
];

export const S3Explain: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tTiga = w("l07", "tiga");
  const k1 = w("l07", "satu");
  const k2 = w("l08", "dua");
  const k3 = w("l08", "tiga");
  const tContoh = w("l09", "contoh");
  const tBuat = w("l09", "buat");
  const tKejar = w("l09", "mengejar");
  const t10 = w("l09", "10");
  const keyT = [k1, k2, k3];

  // film panel: prompt lines (spesifik), then the steps (pilih objek, beberapa langkah), then the prompt again
  let film: { mode: "prompt" | "steps"; hl: number } = { mode: "prompt", hl: -1 };
  if (t > k1) film = { mode: "prompt", hl: -1 };
  if (t > k2) film = { mode: "steps", hl: 0 };
  if (t > k3) film = { mode: "steps", hl: Math.min(2, Math.floor((t - k3) / 0.7)) };
  if (t > tContoh) film = { mode: "prompt", hl: 0 };
  if (t > w("l09", "mengejar")) film = { mode: "prompt", hl: 1 };
  if (t > w("l09", "dalam")) film = { mode: "prompt", hl: 2 };

  // NPC: stands, patrols on platform B, then chases toward the player
  let npcX = NPC0[0];
  let npcRot = -0.4;
  let npcPose: AvatarPose = "stand";
  if (t > tBuat) {
    const p = (t - tBuat) * 1.7;
    npcX = NPC0[0] + Math.sin(p) * 1.3;
    npcRot = Math.cos(p) > 0 ? 1.0 : -1.0;
    npcPose = "run";
  }
  if (t > tKejar) {
    const k = ramp(t, tKejar, 1.6);
    const from = NPC0[0] + Math.sin((tKejar - tBuat) * 1.7) * 1.3;
    npcX = lerp(from, -0.6, k);
    npcRot = -0.95;
    npcPose = "run";
  }
  const flee = ramp(t, tKejar + 0.2, 2.2);
  const heroPose: AvatarPose = t > tKejar ? "run" : t > k2 ? "point" : "stand";
  const heroRot = t > tKejar ? -0.95 : 0.9;
  const hero = { pos: [lerp(HERO0[0], -4.6, flee), HERO0[1], HERO0[2]] as V3, pose: heroPose, rot: heroRot };
  const npc = { pos: [npcX, NPC0[1], NPC0[2]] as V3, pose: npcPose, rot: npcRot };
  const select = win(t, w("l08", "pilih"), tContoh, 0.4);

  return (
    <group position={[SX.s3, 0, 0]}>
      <MapSet f={f} film={film} hero={hero} npc={npc} range={ramp(t, t10, 0.45)} alert={ramp(t, tKejar, 0.35)} strips={0} cubes={false}>
        {/* selection box around platform B ("pilih dulu objeknya") */}
        {select > 0.01 ? (
          <group position={[0.5, -7.5, 0.5]} scale={[1, select, 1]}>
            <mesh>
              <boxGeometry args={[5.4, 1.6, 3.4]} />
              <meshBasicMaterial color={P.accentNeon} wireframe transparent opacity={0.9} toneMapped={false} />
            </mesh>
            <Card3D spec={label("dipilih", P.editorBg, P.accentNeon, 130, 640, 200)} w={3.6} pos={[4.6, 2.6, 1.8]} show={select} />
          </group>
        ) : null}
      </MapSet>
      {/* the three keys, a row above the panel */}
      {/* one key at a time, above the panel */}
      <Card3D spec={label("3 kunci", "#FFFFFF", P.editorBg, 130, 1024, 220)} w={5.6} pos={[0.4, 10.2, 2]} show={win(t, tTiga, k1 - 0.1, 0.35)} />
      {KEYS.map((k, i) => (
        <Card3D
          key={k.t}
          spec={label(k.t, k.c, P.editorBg, 130, 1024, 220)}
          w={7.0}
          pos={[0.4, 10.2, 2]}
          show={i < 2 ? win(t, keyT[i], keyT[i + 1] - 0.1, 0.35) : win(t, keyT[i], tContoh, 0.35)}
          edge={k.c}
        />
      ))}
      {/* who / what / when tags */}
      {/* who / what / when: one tag at a time */}
      {[
        { a: "SIAPA", b: "NPC", at: w("l09", "siapa"), c: RED },
        { a: "APA", b: "patroli + kejar", at: w("l09", "apa"), c: P.amberGold },
        { a: "KAPAN", b: "dalam 10 stud", at: w("l09", "kapan"), c: P.accentNeon },
      ].map((g, i, all) => (
        <Card3D
          key={g.a}
          spec={stack(g.a, g.b, g.c, "#FFFFFF")}
          w={6.8}
          pos={[2.6, 4.4, 3]}
          rot={[0, -0.08, 0]}
          show={i < all.length - 1 ? win(t, g.at - 0.1, all[i + 1].at - 0.15, 0.3) : ramp(t, g.at - 0.1, 0.35)}
          edge={g.c}
        />
      ))}
    </group>
  );
};

// =====================================================================================
// S4 — payoff: four checks, prototype → finished map, player cheers.
// =====================================================================================
const CHECKS = ["SPESIFIKASI", "KUALITAS STATIS", "UJI MAIN", "VISUAL"];

export const S4Checks: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tEmpat = w("l10", "empat");
  const tick = [w("l10", "pemeriksaan"), w("l10", "termasuk"), w("l10", "uji"), w("l10", "visual")];
  const tJadi = w("l10", "jadi");
  const fin = ramp(t, tJadi, 1.0);
  const heroPose: AvatarPose = t > tJadi + 0.3 ? "cheer" : "run";
  return (
    <group position={[SX.s4, 0, 0]}>
      <DriftCubes f={f} seed={5} />
      {/* one checklist card: 4 checks ticked on their words */}
      <Card3D
        spec={{
          w: 1024,
          h: 860,
          bg: P.editorBg,
          lines: [
            { t: "4 PEMERIKSAAN", size: 110, color: P.accentNeon, y: 140, font: "display" },
            ...CHECKS.map((c, i) => ({ t: `${t > tick[i] ? "✓ " : "· "}${c}`, size: 120, color: t > tick[i] ? P.metricProfit : "#8B949E", y: 315 + i * 160, font: "display" as const })),
          ],
        }}
        w={8.0}
        pos={[0.6, 5.0, -0.5]}
        show={win(t, tEmpat - 0.1, w("l10", "game") - 0.1, 0.4)}
        edge={P.metricProfit}
      />
      <Platform x0={-13} x1={-3} top={-8} seed={41} finish={fin} />
      <Platform x0={-1} x1={5} top={-6.5} seed={42} finish={fin} />
      <Platform x0={7} x1={13} top={-8} seed={43} finish={fin} />
      {fin > 0.5 ? (
        <>
          <Coin pos={[-2, -3.6, 0.6]} f={f} seed={7} />
          <Coin pos={[6, -4.6, 0.6]} f={f} seed={8} />
        </>
      ) : null}
      <Card3D
        spec={stack("TERASA JADI", "BUKAN PROTOTIPE", "#FFFFFF", P.amberGold)}
        w={7.6}
        pos={[1.4, 5.6, 1]}
        rot={[0, -0.1, 0.03]}
        show={ramp(t, tJadi, 0.45)}
        edge={P.amberGold}
      />
      <Avatar f={f} pose={heroPose} pos={[-3.9, -8, 0.6]} rot={t > tJadi + 0.3 ? -0.2 : 0.9} />
      {/* a grey "prototipe" tag that the finish replaces */}
      <Card3D spec={label("prototipe", "#C9D1D9", "#30363D", 120, 800, 200)} w={4.4} pos={[2.0, -2.4, 1.5]} show={(1 - fin) * ramp(t, w("l10", "game") - 0.2, 0.3)} edge="#8B949E" />
    </group>
  );
};

// =====================================================================================
// S4b — Scene Generator (announced): prompt + reference image → map layout, tidied in Studio.
// =====================================================================================
export const S4bSceneGen: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tSG = w("l11", "scene");
  const tPrompt = w("l11", "prompt");
  const tGambar = w("l11", "gambar");
  const tJadi = w("l11", "jadi");
  const tRapi = w("l11", "rapikan");
  const grow = ramp(t, tJadi, 0.8);
  const tidy = 1 - ramp(t, tRapi, 0.9);
  const sk = useMemo(() => sketchTexture(), []);
  const skShow = easeOutBack(clamp01((t - tGambar) / 0.45));
  return (
    <group position={[SX.s4b, 0, 0]}>
      <DriftCubes f={f} seed={6} />
      <Card3D spec={stack("SCENE GENERATOR", "diumumkan", "#FFFFFF", P.codeFunc)} w={8} pos={[0.4, 8.6, -1]} show={win(t, tSG, tPrompt - 0.1, 0.4)} edge={P.codeFunc} />
      <Card3D spec={label("prompt", P.accentNeon, P.editorBg, 130, 800, 220)} w={4.4} pos={[-4.0, 5.6, 0]} show={win(t, tPrompt, tJadi + 0.6, 0.4)} />
      <Card3D spec={label("+", "#FFFFFF", "rgba(0,0,0,0)", 170, 300, 220)} w={1.4} pos={[-4.0, 4.0, 0]} show={win(t, tGambar - 0.15, tJadi + 0.6, 0.3)} />
      {skShow > 0.01 ? (
        <group position={[-4.0, 0.9, 0]} rotation={[0, 0.15, -0.04]} scale={skShow * 0.85 * (1 - 0.35 * ramp(t, tJadi + 0.6, 0.5))}>
          <mesh castShadow>
            <RoundedBoxGeo args={[5.2, 4.0, 0.12]} radius={0.05} />
            <meshPhysicalMaterial {...POLISH.paper} color="#E9E2CF" />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[5.0, 3.75]} />
            <meshStandardMaterial map={sk} roughness={0.9} />
          </mesh>
        </group>
      ) : null}
      <Card3D spec={stack("gambar", "referensi", "#FFFFFF", P.amberGold)} w={4.8} pos={[-4.0, -2.0, 0.6]} show={win(t, w("l11", "referensi") - 0.1, tJadi + 0.6, 0.4)} edge={P.amberGold} />
      {/* arrow to the layout */}
      {grow > 0.01 ? (
        <group position={[-1.0, 1.6, 0.5]} rotation={[0, 0, -Math.PI / 2 - 0.35]} scale={grow}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 2.2, 12]} />
            <meshStandardMaterial color={P.accentNeon} emissive={P.accentNeon} emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            <coneGeometry args={[0.42, 0.8, 16]} />
            <meshStandardMaterial color={P.accentNeon} emissive={P.accentNeon} emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
      {/* the generated layout (rough), tidied at "rapikan" */}
      <group position={[0, (1 - grow) * -6, 0]} scale={[1, Math.max(0.01, grow), 1]}>
        <Platform x0={-1} x1={2} top={-7} seed={51} chaos={tidy * 0.7} bodyH={6} />
        <Platform x0={3} x1={5} top={-5} seed={52} chaos={tidy * 0.7} bodyH={8} />
        <Platform x0={6} x1={8} top={-3} seed={53} chaos={tidy * 0.7} bodyH={10} />
      </group>
      <Card3D spec={stack("tata letak", "map", "#FFFFFF", P.metricProfit)} w={5.6} pos={[3.4, 5.4, 0.5]} show={win(t, w("l11", "letak"), tRapi - 0.1, 0.35)} edge={P.metricProfit} />
      <Card3D spec={stack("rapikan", "di Studio", P.editorBg, P.editorBg, P.metricProfit)} w={5.6} pos={[3.4, 5.4, 0.5]} show={ramp(t, tRapi, 0.4)} edge={P.metricProfit} />
      {grow > 0.3 ? (
        <Avatar
          f={f}
          pose={t > tRapi ? "point" : "stand"}
          pos={[4.0, -5 - (1 - grow) * 6, 0.8]}
          rot={-0.5}
          rightHand={
            t > tRapi - 0.5 ? (
              <mesh>
                <RoundedBoxGeo args={[0.9, 0.9, 0.9]} radius={0.1} />
                <meshPhysicalMaterial {...POLISH.brickABS} color={GRASS} />
              </mesh>
            ) : undefined
          }
        />
      ) : null}
    </group>
  );
};

// =====================================================================================
// S5 — outro: same tool for everyone (three players at three screens); the difference is the prompt.
// =====================================================================================
const PLAYERS: { x: number; colors?: { torso: string; legs: string }; seed: number }[] = [
  { x: -4.4, colors: { torso: "#7C3AED", legs: "#334155" }, seed: 3 },
  { x: 0.3, seed: 1 },
  { x: 5.0, colors: { torso: "#EA580C", legs: "#1E3A8A" }, seed: 5 },
];

export const S5Outro: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tYang = w("l12", "yang");
  const tCara = w("l12", "cara");
  const tIni = w("l12", "ini");
  const focus = ramp(t, tYang, 0.6);
  const cursor = Math.floor(t * 2.2) % 2 === 0;
  return (
    <group position={[SX.s5, 0, 0]}>
      <DriftCubes f={f} seed={7} />
      <Floor seed={25} />
      <Card3D spec={label("alatnya sama", "#FFFFFF", P.editorBg, 120)} w={6.4} pos={[0.4, 10.2, -2]} show={win(t, w("l12", "alatnya"), tYang, 0.4)} />
      <Card3D spec={stack("cara kamu", "menulis", P.editorBg, P.editorBg, P.accentNeon)} w={5.0} pos={[0.4, 8.0, 0.5]} show={ramp(t, tCara, 0.45)} />
      {PLAYERS.map((p, i) => {
        const center = i === 1;
        const dim = center ? 0 : focus;
        const sx = center ? 1 + focus * 0.12 : 1;
        return (
          <group key={i}>
            {/* screen behind the player */}
            {center ? (
            <group position={[p.x, 3.4, -3]} scale={sx * 1.75}>
              <mesh castShadow>
                <RoundedBoxGeo args={[5.8, 3.4, 0.3]} radius={0.15} />
                <meshPhysicalMaterial color={P.editorHeader} roughness={0.2} metalness={0.3} clearcoat={1} />
              </mesh>
              <mesh position={[0, 0, 0.16]}>
                <planeGeometry args={[5.5, 3.13]} />
                <meshBasicMaterial map={filmPanelTexture("prompt", t > tCara ? 0 : -1, cursor)} toneMapped={false} color={new THREE.Color(1, 1, 1).multiplyScalar(1 - dim * 0.65)} />
              </mesh>
              <group position={[0, 0, 0.17]}>
                <NeonFrame w={5.8} h={3.4} color={P.accentNeon} intensity={2.6} />
              </group>
            </group>
            ) : null}
            {/* holo keyboard */}
            <mesh position={[p.x, -4.0, 2.2]} rotation={[-0.9, 0, 0]}>
              <planeGeometry args={[3.0, 1.0]} />
              <meshBasicMaterial color={P.accentNeon} transparent opacity={0.35} toneMapped={false} />
            </mesh>
            <Avatar f={f} pose={center && t > tIni ? "wave" : "type"} pos={[p.x, -8, 0.8]} rot={center ? 0.45 : p.x > 0 ? -0.5 : 0.5} seed={p.seed} colors={p.colors} seam />
          </group>
        );
      })}
    </group>
  );
};
