// EP03 film (DATAPHYSICAL): "Pemain Terbaik Sepanjang Masa" — the cover sculpture becomes a set of three scales.
// Frame 0 = approved cover. Then the trophy blocks lift away and the four pedestals are weighed three times:
//   1. Gol resmi: aluminium bars (Ronaldo >980, Messi >930, Pelé 762 + teal Guinness ghost 1.279).
//   2. Piala Dunia: brass blocks drop in (3/1/1/0, engraved years) + 6 small balls for Ronaldo's 6 tournaments.
//   3. Ballon d'Or: orange blocks (8/5/0/0), an acrylic "sampai 1995" panel over Pelé/Maradona,
//      then the 2000 century medallion splits in two (internet -> Maradona, panel ahli -> Pelé).
// Payoff: the ball hops onto each column as its scale crowns it. Outro: question + teaser, then the AUDIRA card.
// Every time comes from timeline.json (Audio Master Clock). Numbers: approved script / HIGH research only.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { GroundShadow, SceneText } from "../../core/polish/Drei.tsx";
import { Outro } from "../_shared/Outro.tsx";
import tl from "./timeline.json";
import {
  PLAYERS,
  COL_X,
  PED_W,
  PED_H,
  BLOCK,
  BLOCK_H,
  STEP,
  BALL_R,
  BALL_POS,
  grainFine,
  CAM_POS,
  CAM_TARGET,
  Alu,
  Brass,
  Anodised,
  Plinth,
  Backdrop,
  Foreground,
  useFonts,
  Overlay as CoverOverlay,
} from "./Cover.tsx";
import { PAL, glowTexture, ballTexture, namePlateTexture, plateTexture, yearTexture } from "./coverTextures.ts";

type V3 = [number, number, number];
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };

// ---------------------------------------------------------------- clock helpers
const CLIPS = tl.clips as Clip[];
const S = tl.sections as unknown as Record<string, [number, number]>;
const TOTAL = tl.total;
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

const T = {
  hookEnd: S.HOOK[1],
  lift: S.KONTEKS[0] + 0.1,
  nPele: W("konteks", 4),
  nMara: W("konteks", 5),
  nMessi: W("konteks", 6),
  nRon: W("konteks", 8),
  kita: W("konteks", 10),
  perNov: W("konteks", 17),
  goals: W("pengembangan", 0),
  gRon: W("pengembangan", 4),
  gHampir: W("pengembangan", 14),
  gMessi: W("pengembangan", 16),
  gPele: W("pengembangan", 23),
  gGuin: W("pengembangan", 30),
  gFriend: W("pengembangan", 38),
  wc: W("pengembangan", 43),
  wcPele: W("pengembangan", 47),
  wcTiga: W("pengembangan", 50),
  wcMara: W("pengembangan", 52),
  wcMessi: W("pengembangan", 54),
  wcRon: W("pengembangan", 57),
  wcSatu: W("pengembangan", 61),
  wcEnam: W("pengembangan", 65),
  bdo: W("penjelasan", 0),
  bMessi: W("penjelasan", 4),
  bDelapan: W("penjelasan", 5),
  bRekor: W("penjelasan", 6),
  bRon: W("penjelasan", 7),
  bPeleMara: W("penjelasan", 9),
  bNol: W("penjelasan", 12),
  bSampai: W("penjelasan", 17),
  bHanya: W("penjelasan", 21),
  bEropa: W("penjelasan", 24),
  cTahun: W("penjelasan", 25),
  cFifa: W("penjelasan", 27),
  cInternet: W("penjelasan", 33),
  cMara: W("penjelasan", 35),
  cPanel: W("penjelasan", 36),
  cPele: W("penjelasan", 39),
  cDua: W("penjelasan", 41),
  pay: S.PAYOFF[0],
  pGanti: W("payoff", 1),
  pGol: W("payoff", 5),
  pBdo: W("payoff", 7),
  pWc: W("payoff", 10),
  pSatu: W("payoff", 13),
  pMara: W("payoff", 17),
  p1986: W("payoff", 18),
  out: S.OUTRO[0],
  oIni: W("outro", 5),
  oEpisode: W("outro", 10),
  card: S.OUTRO[1] + 0.2,
};

// player indices
const PELE = 0, MARA = 1, MESSI = 2, RON = 3;
const WHO = ["PELÉ", "MARADONA", "MESSI", "RONALDO"];

// ---------------------------------------------------------------- trophy blocks
type Block = { col: number; k: number; kind: "wc" | "bdo"; year?: string; land: number };
const BLOCKS: Block[] = (() => {
  const out: Block[] = [];
  const wcLand: Record<number, number[]> = {
    [PELE]: [T.wcPele + 0.12, T.wcPele + 0.55, T.wcTiga + 0.05],
    [MARA]: [T.wcMara + 0.1],
    [MESSI]: [T.wcMessi + 0.05],
    [RON]: [],
  };
  const bdoLand: Record<number, number[]> = {
    [PELE]: [],
    [MARA]: [],
    [MESSI]: Array.from({ length: 8 }, (_, j) => T.bMessi + 0.1 + j * 0.12),
    [RON]: Array.from({ length: 5 }, (_, j) => T.bRon + 0.06 + j * 0.1),
  };
  PLAYERS.forEach((p, col) => {
    let k = 0;
    p.years.forEach((y, j) => out.push({ col, k: k++, kind: "wc", year: y, land: wcLand[col][j] }));
    for (let j = 0; j < p.bdo; j++) out.push({ col, k: k++, kind: "bdo", land: bdoLand[col][j] });
  });
  return out;
})();

const DROP = 0.42;
/** Vertical offset of a block above its resting place (0 = resting). Large = out of view. */
const blockOffset = (b: Block, t: number) => {
  const ex = T.lift + b.col * 0.06 + b.k * 0.035;
  if (t < ex) return 0; // cover state
  if (t < b.land - DROP) {
    const u = clamp01((t - ex) / 0.9);
    return u * u * 9; // lifted away (accelerating up)
  }
  const u = clamp01((t - (b.land - DROP)) / DROP);
  if (u < 1) return 4 * (1 - u * u); // falls with gravity
  const d = t - b.land;
  return Math.abs(Math.sin(d * 18)) * 0.05 * Math.exp(-d * 9); // small settle bounce
};
const blockBaseY = (b: Block) => PED_H + 0.006 + b.k * STEP + BLOCK_H / 2;

// ---------------------------------------------------------------- goal bars (scale 1)
const GPU = 0.0019; // world units per goal
const BAR: Record<number, { goals: number; at: number } | null> = {
  [PELE]: { goals: 762, at: T.gPele },
  [MARA]: null,
  [MESSI]: { goals: 930, at: T.gMessi },
  [RON]: { goals: 980, at: T.gRon },
};
const barH = (col: number, t: number) => {
  const b = BAR[col];
  if (!b) return 0;
  return b.goals * GPU * easeOut((t - b.at) / 1.0) * (1 - seg(t, T.wc - 0.15, T.wc + 0.6));
};
const ghostH = (t: number) => (1279 - 762) * GPU * easeOut((t - T.gGuin) / 0.9) * (1 - seg(t, T.wc - 0.15, T.wc + 0.6));

// ---------------------------------------------------------------- column top (for caps, tags, ball)
const colTop = (col: number, t: number) => {
  let top = PED_H + barH(col, t) + (col === PELE ? ghostH(t) : 0);
  for (const b of BLOCKS) {
    if (b.col !== col) continue;
    const off = blockOffset(b, t);
    if (off < 0.6) top = Math.max(top, blockBaseY(b) + BLOCK_H / 2 + Math.min(off, 0.6));
  }
  return top;
};
/** Resting top at the payoff (all blocks landed). */
const restTop = (col: number) => {
  const n = BLOCKS.filter((b) => b.col === col).length;
  return PED_H + 0.006 + n * STEP + 0.037;
};

// ---------------------------------------------------------------- camera (Catmull-Rom through anchored keys)
type Key = { t: number; p: V3; q: V3 };
// Wide data shots: plinth top sits at ~y 1280 px (the caption band covers only the walnut base) and every
// column + label stays inside a 60 px side margin. Close shots (names, World Cup blocks) keep the plates above 1290 px.
const KEYS: Key[] = [
  { t: 0, p: CAM_POS, q: CAM_TARGET },
  { t: T.hookEnd, p: [-0.2, 2.6, 15.6], q: [0.05, 1.4, 0.0] },
  { t: T.nPele - 0.2, p: [-0.6, 2.2, 20.2], q: [0.0, 1.55, 0] },
  { t: T.nRon + 0.3, p: [0.6, 1.9, 19.6], q: [0.0, 1.55, 0] },
  { t: T.perNov - 0.2, p: [0.3, 0.5, 8.6], q: [0.0, 0.1, 0.6] },
  { t: T.goals + 0.6, p: [1.8, 3.2, 21.4], q: [0.1, 1.7, 0.0] },
  { t: T.gPele + 0.3, p: [-1.2, 2.8, 19.6], q: [0.05, 1.7, 0.0] },
  { t: T.gGuin + 0.6, p: [0.9, 3.1, 20.8], q: [0.0, 1.7, 0.0] },
  { t: T.wc + 0.6, p: [-1.0, 2.6, 16.0], q: [-0.4, 1.2, 0.0] },
  { t: T.wcTiga + 0.2, p: [-2.6, 2.0, 9.8], q: [-1.2, 0.65, 0.0] },
  { t: T.wcRon + 0.3, p: [2.8, 2.0, 9.6], q: [1.4, 0.7, 0.0] },
  { t: T.wcEnam + 0.5, p: [3.2, 2.3, 10.4], q: [1.6, 0.85, 0.0] },
  { t: T.bDelapan + 0.4, p: [0.8, 3.1, 20.3], q: [0.1, 1.7, 0.0] },
  { t: T.bNol + 0.3, p: [-0.6, 3.0, 20.7], q: [-0.05, 1.7, 0.0] },
  { t: T.bEropa, p: [-0.9, 3.0, 20.1], q: [-0.1, 1.7, 0.0] },
  { t: T.cFifa + 0.3, p: [-0.3, 3.0, 20.5], q: [0.0, 1.7, 0.0] },
  { t: T.cPele + 0.3, p: [-0.8, 3.1, 19.9], q: [-0.1, 1.7, 0.0] },
  { t: T.pGanti + 0.6, p: [0.0, 3.1, 20.9], q: [0.0, 1.75, 0.0] },
  { t: T.p1986, p: [0.4, 3.0, 20.1], q: [0.05, 1.75, 0.0] },
  { t: T.out + 3.0, p: [0.0, 3.6, 22.4], q: [0.0, 1.9, 0.0] },
  { t: TOTAL, p: [0.2, 3.8, 23.0], q: [0.0, 1.9, 0.0] },
];
const POS_CURVE = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.p)), false, "centripetal");
const TGT_CURVE = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.q)), false, "centripetal");
const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i].t, b = KEYS[i + 1].t;
  // ease in/out only inside each segment's middle, so the camera never parks on a key
  const u = clamp01((t - a) / (b - a));
  const eased = u * 0.7 + smooth(u) * 0.3;
  const g = (i + eased) / (KEYS.length - 1);
  const p = POS_CURVE.getPoint(g);
  const q = TGT_CURVE.getPoint(g);
  // wide data shots: a slow seeded-free sine orbit/crane so the camera never parks
  const wide = smooth((p.z - 15) / 3);
  p.x += Math.sin(t * 0.55) * 0.55 * wide;
  p.y += Math.sin(t * 0.4 + 1) * 0.22 * wide;
  return { p, q };
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { p, q } = camAt(t);
    camera.position.copy(p);
    camera.lookAt(q);
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ---------------------------------------------------------------- scene parts
const Tag: React.FC<{ text: string; pos: V3; size: number; o: number; color?: string }> = ({ text, pos, size, o, color = "#F4F1EA" }) => (
  <group position={pos} visible={o > 0.01}>
    <SceneText fontSize={size} color={color} anchorX="center" anchorY="bottom" fillOpacity={o} outlineWidth={size * 0.06} outlineColor="#0E0F11" outlineOpacity={o * 0.8}>
      {text}
    </SceneText>
  </group>
);

const Pedestal: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const p = PLAYERS[i];
  const x = COL_X[i];
  const swap = seg(t, T.lift, T.lift + 0.6);
  const nameT = [T.nPele, T.nMara, T.nMessi, T.nRon][i];
  const glow = 0.15 + 0.85 * win(t, nameT - 0.1, nameT + 1.6, 0.15, 0.6);
  const dimGoals = i === MARA ? win(t, T.goals, T.wc, 0.4, 0.4) * 0.6 : 0;
  const plateSize = PED_W * 0.9;
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, PED_H / 2, 0]}>
        <RoundedBoxGeo args={[PED_W, PED_H, PED_W]} radius={0.035} segments={4} />
        <Alu />
      </mesh>
      {/* cover plate (stats) cross-fades to the film name plate */}
      <mesh position={[0, PED_H / 2, PED_W / 2 + 0.003]} visible={swap < 0.999}>
        <planeGeometry args={[plateSize, plateSize]} />
        <meshPhysicalMaterial map={plateTexture(p.name, p.nat, p.num, p.wc, p.bdo)} roughness={0.38} metalness={0.25} clearcoat={0.5} clearcoatRoughness={0.2} transparent opacity={1 - swap} />
      </mesh>
      <mesh position={[0, PED_H / 2, PED_W / 2 + 0.004]} visible={swap > 0.001}>
        <planeGeometry args={[plateSize, plateSize]} />
        <meshPhysicalMaterial map={namePlateTexture(p.name, "", p.num)} roughness={0.38} metalness={0.25} clearcoat={0.5} clearcoatRoughness={0.2} transparent opacity={swap} />
      </mesh>
      {/* dim veil (Maradona is not weighed on the goal scale) */}
      <mesh position={[0, PED_H / 2, PED_W / 2 + 0.006]} visible={dimGoals > 0.01}>
        <planeGeometry args={[plateSize, plateSize]} />
        <meshBasicMaterial color="#0B0C0E" transparent opacity={dimGoals} depthWrite={false} />
      </mesh>
      {/* pitch-green underglow strip: lights when the name is spoken */}
      <mesh position={[0, 0.03, PED_W / 2 + 0.012]}>
        <boxGeometry args={[PED_W * 0.92, 0.035, 0.012]} />
        <meshBasicMaterial color={PAL.pitch} toneMapped={false} transparent opacity={glow} />
      </mesh>
    </group>
  );
};

/** World Cup blocks: polished brass (lower roughness, clearcoat, full env reflection). */
const FilmBrass: React.FC = () => (
  <meshPhysicalMaterial color="#E6C48A" metalness={1} roughness={0.12} clearcoat={0.7} clearcoatRoughness={0.08} />
);

/** Ballon d'Or blocks in the film: satin anodised metal (bevel catches a highlight). */
const SatinOrange: React.FC = () => (
  <meshPhysicalMaterial color={PAL.orange} metalness={0.6} roughness={0.35} clearcoat={0.55} clearcoatRoughness={0.14} />
);

const Blocks: React.FC<{ t: number }> = ({ t }) => (
  <>
    {BLOCKS.map((b, n) => {
      const off = blockOffset(b, t);
      if (off > 8) return null;
      const y = blockBaseY(b) + off;
      return (
        <group key={n} position={[COL_X[b.col], y, 0]}>
          <mesh castShadow receiveShadow>
            <RoundedBoxGeo args={[BLOCK, BLOCK_H, BLOCK]} radius={t < T.lift ? 0.022 : 0.032} segments={3} />
            {b.kind === "wc" ? <FilmBrass /> : t < T.lift ? <Anodised /> : <SatinOrange />}
          </mesh>
          {b.year && t < T.lift && (
            <mesh position={[0, 0, BLOCK / 2 + 0.002]}>
              <planeGeometry args={[BLOCK * 0.86, BLOCK * 0.86 * 0.25]} />
              <meshBasicMaterial map={yearTexture(b.year)} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
          )}
        </group>
      );
    })}
  </>
);

const Caps: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PLAYERS.map((_, i) => (
      <mesh key={i} castShadow receiveShadow position={[COL_X[i], colTop(i, t) + 0.02, 0]}>
        <RoundedBoxGeo args={[BLOCK + 0.04, 0.035, BLOCK + 0.04]} radius={0.012} segments={2} />
        <Alu color="#DADDE1" />
      </mesh>
    ))}
  </>
);

const GoalBars: React.FC<{ t: number }> = ({ t }) => {
  const gh = ghostH(t);
  return (
    <>
      {PLAYERS.map((_, i) => {
        const h = barH(i, t);
        if (h < 0.004) return null;
        return (
          <mesh key={i} castShadow receiveShadow position={[COL_X[i], PED_H + h / 2, 0]}>
            <RoundedBoxGeo args={[BLOCK - 0.04, h, BLOCK - 0.04]} radius={Math.min(0.02, h / 2.2)} segments={3} />
            <Alu color={i === RON || i === MESSI || i === PELE ? "#CDD1D6" : PAL.alu} />
          </mesh>
        );
      })}
      {gh > 0.004 && (
        <mesh position={[COL_X[PELE], PED_H + barH(PELE, t) + gh / 2, 0]}>
          <boxGeometry args={[BLOCK - 0.04, gh, BLOCK - 0.04]} />
          <meshPhysicalMaterial color={PAL.teal} transparent opacity={0.32} roughness={0.08} clearcoat={1} depthWrite={false} />
        </mesh>
      )}
    </>
  );
};

/** Six small balls in an arc over Ronaldo's pedestal: one World Cup with a goal each (2006–2026). */
const SixBalls: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.wcSatu, T.bdo + 0.2, 0.3, 0.4);
  if (o < 0.01) return null;
  return (
    <group position={[COL_X[RON], PED_H + 0.75, 0.15]}>
      {Array.from({ length: 6 }, (_, j) => {
        const a = Math.PI * (0.85 - (j / 5) * 0.7);
        const pop = easeOut((t - (T.wcSatu + 0.25 + j * 0.22)) / 0.3) * o;
        return (
          <mesh key={j} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.45, 0]} scale={Math.max(0.001, pop)} rotation={[j, j * 0.7, 0]}>
            <sphereGeometry args={[0.085, 32, 24]} />
            <meshPhysicalMaterial map={ballTexture()} roughness={0.4} clearcoat={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

/** 2000 century medallion: one brass disc above Pelé + Maradona that splits in place (one focal point);
 * the HTML MedalCard under it names each half. */
const MEDAL: V3 = [-1.2, 3.0, 0.45];
const MEDAL_R = 0.4;
const Medallion: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.cTahun, T.pGanti, 0.4, 0.5);
  if (o < 0.01) return null;
  const rise = easeOut((t - T.cTahun) / 0.8);
  const y = MEDAL[1] - (1 - rise) * 0.9;
  const sep = easeOut((t - (T.cInternet - 0.1)) / 0.6) * 0.3;
  return (
    <group position={[MEDAL[0], y, MEDAL[2]]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * sep, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          {/* half disc facing the camera; thetaStart picks the left or right half */}
          <cylinderGeometry args={[MEDAL_R, MEDAL_R, 0.06, 48, 1, false, side < 0 ? Math.PI : 0, Math.PI]} />
          <meshPhysicalMaterial color="#EBCB92" metalness={0.85} roughness={0.28} clearcoat={0.5} transparent opacity={o} />
        </mesh>
      ))}
      {/* engraving on the whole disc before the split (on the object, not a floating label) */}
      <Tag text="2000" pos={[0, -0.1, 0.06]} size={0.2} o={o * (1 - seg(t, T.cInternet - 0.2, T.cInternet + 0.1))} color="#3A2408" />
    </group>
  );
};

/** Ball: rests centre front, then hops onto each column the payoff crowns, then back to the centre. */
const HOPS: { at: number; col: number | null }[] = [
  { at: T.pGol + 0.15, col: RON },
  { at: T.pBdo + 0.15, col: MESSI },
  { at: T.pWc + 0.15, col: PELE },
  { at: T.pMara + 0.1, col: MARA },
  { at: T.out + 0.9, col: null },
];
const restPos = (col: number | null): V3 => (col === null ? BALL_POS : [COL_X[col], restTop(col) + BALL_R, 0]);
const ballPos = (t: number): V3 => {
  let from: V3 = BALL_POS;
  for (const h of HOPS) {
    const to = restPos(h.col);
    const a = h.at - 0.5;
    if (t < a) return from;
    if (t < h.at) {
      const u = (t - a) / 0.5;
      const e = smooth(u);
      const arc = Math.sin(Math.PI * u) * (0.7 + Math.abs(to[1] - from[1]) * 0.3);
      return [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * u + arc, from[2] + (to[2] - from[2]) * e];
    }
    from = to;
  }
  return from;
};
const FilmBall: React.FC<{ t: number }> = ({ t }) => {
  const p = ballPos(t);
  const spin = t * 1.6;
  return (
    <group position={p}>
      <mesh castShadow rotation={[0.35 + spin, 0.6, 0.2]}>
        <sphereGeometry args={[BALL_R, 96, 64]} />
        <meshPhysicalMaterial map={ballTexture()} roughness={0.38} roughnessMap={grainFine()} clearcoat={0.55} clearcoatRoughness={0.25} metalness={0} />
      </mesh>
    </group>
  );
};

/** Payoff crowns: pitch-green ring above the column that scale crowns (names live in the HTML labels). */
const CROWNS = [
  { col: RON, at: T.pGol, label: "GOL", who: "RONALDO" },
  { col: MESSI, at: T.pBdo, label: "BALLON D'OR", who: "MESSI" },
  { col: PELE, at: T.pWc, label: "PIALA DUNIA", who: "PELÉ" },
  { col: MARA, at: T.p1986, label: "1986", who: "MARADONA" },
];

const ringY = (col: number) => restTop(col) + BALL_R * 2 + 0.12;
const Crowns: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CROWNS.map((c, j) => {
      const o = seg(t, c.at - 0.1, c.at + 0.3) * (1 - seg(t, T.card - 0.6, T.card));
      if (o < 0.01) return null;
      return (
        <mesh key={j} position={[COL_X[c.col], ringY(c.col), 0]} rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={0.6 + 0.4 * easeOut((t - c.at) / 0.35)}>
          <torusGeometry args={[0.3, 0.025, 16, 64]} />
          <meshBasicMaterial color={PAL.pitch} toneMapped={false} transparent opacity={o} />
        </mesh>
      );
    })}
  </>
);

/** Screen-space labels (HTML): one per column, anchored to the bar top and projected every frame. */
type Lab = { col: number; anchor: V3; value: string; name: string; color: string; o: number };
const NAT = ["BRASIL", "ARGENTINA", "ARGENTINA", "PORTUGAL"];
const GOLD = "#E8C68C", ORANGE = "#FF7A45";
const labelsAt = (t: number): Lab[] => {
  const out: Lab[] = [];
  const add = (col: number, value: string, name: string, color: string, o: number, anchorY?: number) => {
    if (o > 0.01) out.push({ col, value, name, color, o, anchor: [COL_X[col], anchorY ?? colTop(col, t) + 0.04, 0] });
  };
  // konteks: name cards as each name is spoken
  // one name card at a time (single row, no stacking): each holds until the next name is spoken
  const nameAt = [T.nPele, T.nMara, T.nMessi, T.nRon];
  nameAt.forEach((at, col) => add(col, WHO[col], NAT[col], "#F3F1EC", win(t, at - 0.02, (nameAt[col + 1] ?? T.kita) - 0.1, 0.15, 0.12), PED_H + 0.04));
  // scale 1: goals
  add(RON, ">980", "RONALDO", "#F3F1EC", win(t, T.gRon + 0.6, T.wc + 0.1, 0.25, 0.3));
  add(MESSI, ">930", "MESSI", "#F3F1EC", win(t, T.gMessi + 0.5, T.wc + 0.1, 0.25, 0.3));
  const guin = seg(t, T.gGuin + 0.3, T.gGuin + 0.6);
  add(PELE, guin > 0.5 ? "1.279" : "762", guin > 0.5 ? "PELÉ · GUINNESS" : "PELÉ", guin > 0.5 ? PAL.teal : "#F3F1EC", win(t, T.gPele + 0.6, T.wc + 0.1, 0.25, 0.3));
  // scale 2: World Cups
  add(PELE, "3", "PELÉ", GOLD, win(t, T.wcTiga + 0.1, T.bdo + 0.2, 0.25, 0.3));
  add(MARA, "1", "MARADONA", GOLD, win(t, T.wcMara + 0.3, T.bdo + 0.2, 0.25, 0.3));
  add(MESSI, "1", "MESSI", GOLD, win(t, T.wcMessi + 0.3, T.bdo + 0.2, 0.25, 0.3));
  add(RON, "0", "RONALDO", GOLD, win(t, T.wcRon + 0.3, T.wcSatu, 0.25, 0.3));
  // scale 3: Ballon d'Or
  add(MESSI, "8", t >= T.bRekor ? "MESSI · REKOR" : "MESSI", ORANGE, win(t, T.bDelapan + 0.2, T.cTahun, 0.25, 0.3));
  add(RON, "5", "RONALDO", ORANGE, win(t, T.bRon + 0.6, T.cTahun, 0.25, 0.3));
  add(PELE, "0", "PELÉ", ORANGE, win(t, T.bNol, T.bSampai - 0.2, 0.25, 0.3));
  add(MARA, "0", "MARADONA", ORANGE, win(t, T.bNol, T.bSampai - 0.2, 0.25, 0.3));
  // payoff crowns: player (big) + the scale that crowns them
  // only the newest crown carries a label (earlier crowns keep their ring), so payoff labels never stack
  CROWNS.forEach((c, j) => {
    const next = CROWNS[j + 1]?.at ?? T.out;
    add(c.col, c.who, c.label, PAL.pitch, win(t, c.at - 0.1, next + 0.05, 0.3, 0.25) * (1 - seg(t, T.out - 0.2, T.out + 0.2)), ringY(c.col) + 0.06);
  });
  // one label per column: keep the most visible one
  const best = new Map<number, Lab>();
  for (const l of out) if (!best.has(l.col) || best.get(l.col)!.o < l.o) best.set(l.col, l);
  return [...best.values()];
};

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const { p, q } = camAt(t);
  const focus = p.distanceTo(q);
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={0.25} color="#FFFFFF" />
      <hemisphereLight args={["#FFF4E2", "#0E0F12", 0.3]} />
      <spotLight
        position={[-4.5, 7.5, 5.5]}
        intensity={260}
        angle={0.55}
        penumbra={0.8}
        decay={2}
        color="#FFF3DC"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[4.5, 4.5, -4]} intensity={1.1} color="#90CAF9" />
      <directionalLight position={[3.5, 2.5, 6]} intensity={0.35} color="#FFE9CF" />
      <Backdrop />
      {/* film-only separation: warm light pool on the back wall right behind the columns */}
      <mesh position={[0, 1.9, -4.4]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[7.5, 6.5]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0.7} depthWrite={false} toneMapped={false} color="#FFD6A0" />
      </mesh>
      <mesh position={[0, 1.2, -4.38]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[4.2, 3.2]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0.34} depthWrite={false} toneMapped={false} color="#FFE6C2" />
      </mesh>
      {/* cool rim lights from behind: bright edges on the aluminium columns */}
      <directionalLight position={[-4, 5, -6]} intensity={3.0} color="#A9D3FF" />
      <directionalLight position={[4.5, 4, -6]} intensity={2.6} color="#BFDFFF" />
      <Plinth />
      {PLAYERS.map((_, i) => (
        <Pedestal key={i} i={i} t={t} />
      ))}
      <GoalBars t={t} />
      <Blocks t={t} />
      <Caps t={t} />
      <SixBalls t={t} />
      <Medallion t={t} />
      <Crowns t={t} />
      <FilmBall t={t} />
      {/* ball cradle ring stays on the felt */}
      <mesh position={[0, 0.034, BALL_POS[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.012, 12, 48]} />
        <Brass />
      </mesh>
      {(t > 2.5 && t < T.lift + 4.6) || t > T.goals - 0.3 ? (
        <mesh position={[0, -0.24, 1.9 / 2 + 0.009]}>
          <planeGeometry args={[2.02, 0.27]} />
          <meshPhysicalMaterial color="#C9A66C" metalness={0.75} roughness={0.32} clearcoat={0.4} />
        </mesh>
      ) : null}
      <GroundShadow y={0.004} scale={5} opacity={0.5} blur={2} far={2.4} />
      {/* soft warm floor light spilling forward from the plinth (lifts the murky lower third) */}
      <mesh position={[0, -0.415, 1.6]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[8, 4.2]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0.3} depthWrite={false} toneMapped={false} color="#E9C38E" />
      </mesh>
      {p.z > 11 && <Foreground />}
      {/* second out-of-focus foreground ruler, lower left */}
      {p.z > 11 && t > 2.5 && (
        <mesh castShadow position={[-2.3, -0.28, 7.4]} rotation={[0, 0.42, -0.04]}>
          <RoundedBoxGeo args={[2.2, 0.06, 0.3]} radius={0.015} segments={2} />
          <Brass />
        </mesh>
      )}
      <Finish frame={Math.round(t * 60)} background={PAL.bg} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao focus={focus} aperture={0.0019} maxBlur={0.009} />
    </>
  );
};

// ---------------------------------------------------------------- HUD + captions
const GREEN = PAL.pitch;
const FONT = "EP03Grotesk, 'Segoe UI', sans-serif";
const DISPLAY = "EP03Anton, Impact, sans-serif";

const Hud: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const scales = [
    { n: 1, name: "GOL RESMI", a: T.goals, b: T.wc - 0.1, note: [
      { text: "1.279 = versi Guinness, termasuk laga persahabatan", a: T.gFriend - 0.3, b: T.wc - 0.1 },
    ] },
    { n: 2, name: "PIALA DUNIA", a: T.wc, b: T.bdo - 0.1, note: [
      { text: "Ronaldo: satu-satunya pencetak gol di 6 Piala Dunia", a: T.wcSatu, b: T.bdo - 0.1 },
    ] },
    { n: 3, name: "BALLON D'OR", a: T.bdo, b: T.cTahun - 0.1, note: [
      { text: "Sampai 1995: hanya untuk pemain Eropa", a: T.bSampai, b: T.cTahun - 0.1 },
    ] },
  ];
  const box = (o: number, children: React.ReactNode, key: string | number) => (
    <div key={key} style={{ position: "absolute", left: 72 * s, top: 262 * s, opacity: o, transform: `translateY(${(1 - o) * -16 * s}px)` }}>{children}</div>
  );
  const items: React.ReactNode[] = [];
  // konteks: four names + "per November 2026"
  const ko = win(t, T.lift + 0.2, T.goals - 0.1, 0.4, 0.3);
  if (ko > 0.01)
    items.push(
      box(
        ko,
        <>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32 * s, letterSpacing: 5 * s, color: GREEN }}>● EMPAT NAMA, SATU DEBAT</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 92 * s, color: "#F3F1EC", lineHeight: 1.05, marginTop: 8 * s }}>TIMBANGAN DATA</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40 * s, color: "#E3C186", marginTop: 6 * s, opacity: seg(t, T.perNov - 0.2, T.perNov + 0.2) }}>per November 2026</div>
        </>,
        "k",
      ),
    );
  for (const sc of scales) {
    const o = win(t, sc.a, sc.b, 0.35, 0.3);
    if (o < 0.01) continue;
    items.push(
      box(
        o,
        <>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32 * s, letterSpacing: 5 * s, color: GREEN }}>● TIMBANGAN {sc.n}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 104 * s, color: "#F3F1EC", lineHeight: 1.02, marginTop: 6 * s }}>{sc.name}</div>
          {sc.note.map((nt, j) => {
            const no = win(t, nt.a, nt.b, 0.3, 0.3);
            return no > 0.01 ? (
              <div key={j} style={{ marginTop: 14 * s, maxWidth: 940 * s, fontFamily: FONT, fontWeight: 600, fontSize: 34 * s, lineHeight: 1.25, color: "#EDEAE3", opacity: no, borderLeft: `${6 * s}px solid ${GREEN}`, paddingLeft: 16 * s }}>
                {nt.text}
              </div>
            ) : null;
          })}
        </>,
        sc.n,
      ),
    );
  }
  // century
  const co = win(t, T.cTahun, T.pay - 0.05, 0.35, 0.3);
  if (co > 0.01)
    items.push(
      box(
        co,
        <>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32 * s, letterSpacing: 5 * s, color: GREEN }}>● FIFA · TAHUN 2000</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 84 * s, color: "#F3F1EC", lineHeight: 1.04, marginTop: 6 * s }}>PEMAIN TERBAIK ABAD INI</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 84 * s, color: "#E3C186", lineHeight: 1.04, opacity: seg(t, T.cDua - 0.2, T.cDua + 0.2) }}>= DUA PEMENANG</div>
        </>,
        "c",
      ),
    );
  // payoff
  const po = win(t, T.pay + 0.1, T.out - 0.05, 0.35, 0.3);
  if (po > 0.01)
    items.push(
      box(
        po,
        <>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32 * s, letterSpacing: 5 * s, color: GREEN }}>● JADI…</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 88 * s, color: "#F3F1EC", lineHeight: 1.0, marginTop: 6 * s }}>GANTI TIMBANGAN,</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 88 * s, color: "#E3C186", lineHeight: 1.0, opacity: seg(t, T.pGanti + 0.6, T.pGanti + 0.9) }}>GANTI JUARA</div>
        </>,
        "p",
      ),
    );
  // outro: question + teaser
  const oo = win(t, T.out, T.card, 0.35, 0.3);
  if (oo > 0.01)
    items.push(
      box(
        oo,
        <>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32 * s, letterSpacing: 5 * s, color: GREEN }}>● GILIRANMU</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 100 * s, color: "#F3F1EC", lineHeight: 1.0, marginTop: 6 * s }}>KAMU PAKAI</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 100 * s, color: "#E3C186", lineHeight: 1.0 }}>TIMBANGAN YANG MANA?</div>
          <div
            style={{
              marginTop: 30 * s,
              display: "inline-flex",
              alignItems: "center",
              gap: 18 * s,
              padding: `${14 * s}px ${22 * s}px`,
              background: "rgba(16,17,20,0.86)",
              border: `${3 * s}px solid #D2B07A`,
              borderRadius: 10 * s,
              opacity: seg(t, T.oEpisode - 0.2, T.oEpisode + 0.2),
            }}
          >
            <span style={{ width: 26 * s, height: 26 * s, background: "#F4F1EA", borderRadius: 4 * s, boxShadow: `inset 0 0 0 ${5 * s}px #D2B07A` }} />
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32 * s, color: "#EDEAE3" }}>Episode berikutnya:</span>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34 * s, color: "#F3F1EC" }}>REAL MADRID, RAJA EROPA</span>
          </div>
        </>,
        "o",
      ),
    );
  return <>{items}</>;
};

// ---------------------------------------------------------------- screen-space labels (HTML)
const projector = new THREE.PerspectiveCamera(28, 9 / 16, 0.1, 80);
/** Project a world point with the film camera at time t to pixels (same pose as CameraRig). */
const project = (t: number, pt: V3, w: number, h: number) => {
  const { p, q } = camAt(t);
  projector.aspect = w / h;
  projector.position.copy(p);
  projector.lookAt(q);
  projector.updateMatrixWorld();
  projector.updateProjectionMatrix();
  const v = new THREE.Vector3(...pt).project(projector);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z };
};

const ScreenLabels: React.FC<{ t: number; s: number; w: number; h: number }> = ({ t, s, w, h }) => {
  const M = 60 * s, GAP = 24 * s, VAL = 64 * s, NAME = 34 * s;
  type Box = { l: Lab; ax: number; ay: number; bw: number; bh: number; left: number; top: number };
  const boxes: Box[] = [];
  for (const l of labelsAt(t)) {
    const a = project(t, l.anchor, w, h);
    if (a.z >= 1 || a.x < -0.02 * w || a.x > 1.02 * w || a.y < 0 || a.y > h) continue; // anchor off screen: no label
    const bw = Math.max(l.value.length * 0.44 * VAL, l.name.length * 0.66 * NAME) + 34 * s;
    const bh = VAL * 1.02 + NAME * 1.18 + 20 * s;
    const left = Math.min(Math.max(a.x - bw / 2, M), w - M - bw);
    boxes.push({ l, ax: a.x, ay: a.y, bw, bh, left, top: Math.max(left < 300 * s ? 420 * s : 190 * s, a.y - GAP - bh) });
  }
  boxes.sort((a, b) => a.ax - b.ax);
  // resolve overlaps: a label that collides with an earlier one stacks above it
  for (let pass = 0; pass < 3; pass++)
    for (let i = 0; i < boxes.length; i++)
      for (let j = 0; j < i; j++) {
        const A = boxes[i], B = boxes[j];
        const ox = A.left < B.left + B.bw + 8 * s && B.left < A.left + A.bw + 8 * s;
        const oy = A.top < B.top + B.bh + 8 * s && B.top < A.top + A.bh + 8 * s;
        if (ox && oy) {
          if (A.top <= B.top) B.top = A.top - B.bh - 10 * s;
          else A.top = B.top - A.bh - 10 * s;
        }
      }
  return (
    <>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {boxes.map((b, k) => (
          <line key={k} x1={Math.min(Math.max(b.ax, b.left + 12 * s), b.left + b.bw - 12 * s)} y1={b.top + b.bh} x2={b.ax} y2={b.ay - 4 * s} stroke={b.l.color} strokeOpacity={0.75 * b.l.o} strokeWidth={3 * s} />
        ))}
      </svg>
      {boxes.map((b, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: b.left,
            top: b.top,
            width: b.bw,
            height: b.bh,
            opacity: b.l.o,
            background: "rgba(14,15,17,0.88)",
            border: `${2 * s}px solid rgba(210,176,122,0.75)`,
            borderRadius: 12 * s,
            boxShadow: `0 ${8 * s}px ${22 * s}px rgba(0,0,0,0.45)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontSize: VAL, lineHeight: 1.02, color: b.l.color, whiteSpace: "nowrap" }}>{b.l.value}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: NAME, lineHeight: 1.18, color: "#EDEAE3", whiteSpace: "nowrap", letterSpacing: 1 * s }}>{b.l.name}</div>
        </div>
      ))}
    </>
  );
};

/** 2000 medallion card: both halves named in one grouped card under the split disc. */
const MedalCard: React.FC<{ t: number; s: number; w: number; h: number }> = ({ t, s, w, h }) => {
  const o = win(t, T.cInternet - 0.2, T.pGanti, 0.3, 0.4);
  if (o < 0.01) return null;
  const a = project(t, [MEDAL[0], MEDAL[1] - MEDAL_R - 0.04, MEDAL[2]], w, h);
  const cw = 540 * s;
  const left = Math.min(Math.max(a.x - cw / 2, 60 * s), w - 60 * s - cw);
  const col = (lab: string, who: string, at: number) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: seg(t, at - 0.2, at + 0.15) }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30 * s, color: PAL.pitch, letterSpacing: 1 * s, whiteSpace: "nowrap" }}>{lab}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 64 * s, lineHeight: 1.05, color: "#F3F1EC" }}>{who}</div>
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: a.y + 14 * s,
        width: cw,
        opacity: o,
        display: "flex",
        gap: 12 * s,
        padding: `${12 * s}px ${14 * s}px`,
        background: "rgba(14,15,17,0.9)",
        border: `${2 * s}px solid rgba(210,176,122,0.8)`,
        borderRadius: 12 * s,
        boxShadow: `0 ${8 * s}px ${22 * s}px rgba(0,0,0,0.45)`,
      }}
    >
      {col("PANEL AHLI", "PELÉ", T.cPanel)}
      <div style={{ width: 2 * s, background: "rgba(210,176,122,0.5)" }} />
      {col("INTERNET", "MARADONA", T.cInternet)}
    </div>
  );
};

/** "Sampai 1995" card (HTML, crisp): above Pelé + Maradona during the Ballon d'Or rule. */
const EuropeCard: React.FC<{ t: number; s: number; w: number; h: number }> = ({ t, s, w, h }) => {
  const o = win(t, T.bSampai - 0.2, T.cTahun + 0.2, 0.3, 0.4);
  if (o < 0.01) return null;
  const a = project(t, [(COL_X[PELE] + COL_X[MARA]) / 2, restTop(PELE) + 0.1, 0], w, h);
  const cw = 470 * s;
  const left = Math.min(Math.max(a.x - cw / 2, 60 * s), w - 60 * s - cw);
  return (
    <div style={{ position: "absolute", left, top: a.y - 24 * s - 150 * s, width: cw, height: 150 * s, opacity: o, transform: `translateY(${(1 - o) * -20 * s}px)`, background: "rgba(14,15,17,0.94)", border: `${3 * s}px solid ${PAL.teal}`, borderRadius: 12 * s, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 70 * s, lineHeight: 1.0, color: "#F3F1EC" }}>SAMPAI 1995</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36 * s, color: PAL.teal, opacity: seg(t, T.bHanya - 0.3, T.bHanya), whiteSpace: "nowrap" }}>HANYA PEMAIN EROPA</div>
    </div>
  );
};

// karaoke chunks: split each clip at sentence ends, then into balanced parts of <= 6 words
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const all: Word[][] = [];
  CLIPS.forEach((c) => {
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const end = /[.?!:]$/.test(w.w) || i === c.words.length - 1;
      if (end) {
        all.push(cur);
        cur = [];
      }
    });
  });
  // merge single-word sentences into the next one
  const sentences: Word[][] = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].length === 1 && i + 1 < all.length) all[i + 1] = [...all[i], ...all[i + 1]];
    else sentences.push(all[i]);
  }
  sentences.forEach((sn) => {
    const k = Math.ceil(sn.length / 6);
    const base = Math.floor(sn.length / k);
    let extra = sn.length % k;
    let i = 0;
    for (let j = 0; j < k; j++) {
      const len = base + (extra-- > 0 ? 1 : 0);
      out.push({ words: sn.slice(i, i + len), a: 0, b: 0 });
      i += len;
    }
  });
  out.forEach((c, i) => {
    c.a = c.words[0].s - 0.08;
    const next = out[i + 1]?.words[0].s ?? TOTAL;
    c.b = Math.min(next - 0.08, c.words[c.words.length - 1].e + 0.6);
  });
  return out;
})();

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t >= T.card) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  if (n > 4) {
    const chars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const d = Math.abs(a - (chars - a));
      if (d < best) {
        best = d;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.08);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400 * s, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "linear-gradient(180deg, rgba(38,40,45,0.93), rgba(20,21,24,0.93))",
          borderTop: `${4 * s}px solid #D2B07A`,
          borderRadius: 8 * s,
          padding: `${14 * s}px ${30 * s}px ${16 * s}px`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 12 * s}px)`,
          maxWidth: 960 * s,
          boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.45)`,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22 * s, whiteSpace: "nowrap", lineHeight: 1.25 }}>
            {ln.map((wd, wi) => {
              const idx = ch.words.indexOf(wd);
              const end = ch.words[idx + 1]?.s ?? ch.b;
              const active = t >= wd.s && t < end;
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    fontFamily: FONT,
                    fontSize: 52 * s,
                    fontWeight: 700,
                    color: active ? GREEN : done ? "#F4F1EA" : "rgba(244,241,234,0.8)",
                    transform: `scale(${bump})`,
                  }}
                >
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const s = width / 1080;
  const coverO = 1 - seg(t, 1.9, 2.5);
  const legendO = 1 - seg(t, 0.0, 0.25);
  const init = useMemo(() => camAt(0), []);
  return (
    <AbsoluteFill style={{ background: PAL.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [init.p.x, init.p.y, init.p.z], fov: 28, near: 0.1, far: 80 }}>
        <Scene t={t} />
      </ThreeCanvas>
      {/* cover overlay (1080 layout scaled), holds the cover headline for the first ~2 s */}
      {coverO > 0.01 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0", opacity: coverO }}>
          <CoverOverlay legend={legendO} />
        </div>
      )}
      {/* keep the top gradient after the cover text leaves, so the HUD stays readable */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - coverO, background: "linear-gradient(180deg, rgba(14,15,17,0.85) 0%, rgba(14,15,17,0.55) 20%, rgba(14,15,17,0) 34%)" }} />
      {/* edge vignette + darker foreground band: keeps the eye on the lit columns */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 - coverO * 0.85, background: "radial-gradient(ellipse 66% 42% at 50% 50%, rgba(8,9,10,0) 50%, rgba(8,9,10,0.5) 80%, rgba(8,9,10,0.85) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 - coverO, background: "linear-gradient(180deg, rgba(8,9,10,0) 79%, rgba(8,9,10,0.55) 90%, rgba(8,9,10,0.75) 100%)" }} />
      <ScreenLabels t={t} s={s} w={width} h={height} />
      <MedalCard t={t} s={s} w={width} h={height} />
      <EuropeCard t={t} s={s} w={width} h={height} />
      <Hud t={t} s={s} />
      <Captions t={t} s={s} />
      <Outro start={T.card} />
    </AbsoluteFill>
  );
};
