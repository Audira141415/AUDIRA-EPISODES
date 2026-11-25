// EP10 — Wilt Chamberlain 100 Poin, Hershey 2 Maret 1962 (VINTAGEFORGE). Multi-scene director, every cut on the locked VO:
//   A   HOOK      old arena, hand-flipped scoreboard "100" above a toy Wilt holding the ball
//   B1  KONTEKS   Hershey: chocolate-factory town in thin March snow, people walking to the arena
//   B2  KONTEKS   arena interior, two toy teams warming up, courtside radio table (only radio, no TV)
//   C1  PENGEMB.  Wilt + scoreboard flipping 23 → 41 → 69
//   C2  PENGEMB.  the stands chanting "GIVE IT TO WILT!"
//   D1  PENJELAS. free-throw line, shot after shot: career 51% vs 28 / 32 that night
//   D2  PENJELAS. top view: Knicks foul the other Warriors, Warriors foul back
//   E1  PAYOFF    0:46 left, pass from Joe Ruklick, the ball drops through: 100 (shot type not claimed)
//   E2  PAYOFF    locker room: the "100" sheet spins into Wilt's hands
//   E3  PAYOFF    archive: radio, box score, framed photo (Library of Congress)
//   OUT OUTRO     MUSEUM AUDIRA vitrine: 100 · 83 · 81 (AUDIRA outro card from Root)
// Facts on screen only from research/SOURCE_REGISTER.md. Figures are stylised toys (no real faces, no logos).
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { runPose } from "../ep02/RoadSet.tsx";
import { Cam, camAt, LampLights, mixPose, Sign, SunLights, type Key, type Shot, type V3 } from "../ep02/sets.tsx";
import { Captions, Card, DustHaze, DustWipe, Flash, Frame, NameCard, Stamp, type CapWord } from "../ep02/hud.tsx";
import {
  ArchiveSet, ArenaLights, ArenaSet, Ball, cream, dark, FT_X, grabPose, holdPose, LockerRoom, MuseumSet, paintSheet100, RadioTable, rimAt,
  shootPose, sitHoldPose, stumblePose, SUIT, TownSet, ToyPerson, WILT_LOOK, writePose,
} from "./sets.tsx";
import { GameClock, HookTitle, Tally } from "./hud.tsx";
import { CLIPS, CUT, CUTS, IMPACT, OUTRO_AT, T, clamp, lerp, sceneAt, seg } from "./timing.ts";

const K = (t: number, pos: V3, target: V3, fov: number): Key => ({ t, pos, target, fov });
const v3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Real light pool on the shot target: the subject is lit, the surroundings fall off (depth by light, not by 2D overlay). */
const PoolLight: React.FC<{ target: V3 }> = ({ target }) => {
  const ref = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.target.position.set(...target);
    l.target.updateMatrixWorld();
  });
  return <spotLight ref={ref} position={[target[0] + 1.2, target[1] + 5.5, target[2] + 2.4]} angle={0.21} penumbra={0.6} intensity={240} distance={18} decay={1.6} color="#ffe6b8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} />;
};

/** One R3F canvas per scene with the VINTAGEFORGE finish (memory best: VINTAGE_SEPIA_FILM, exposure 0.82, env 0.25). */
const Stage: React.FC<{ shot: Shot; frame: number; bg?: string; exposure?: number; lift?: number; pool?: boolean; children: React.ReactNode }> = ({ shot, frame, bg = "#4f3922", exposure = 0.82, lift = 0.09, pool = true, children }) => {
  const { width, height } = useVideoConfig();
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 200 }}>
        <Cam shot={shot} lift={lift} />
        {pool && <PoolLight target={shot.target} />}
        {children}
        <Finish frame={frame} profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM} exposure={exposure} envIntensity={0.45} hdri="warmStudio" focus={focus} aperture={0.006} maxBlur={0.02} />
      </ThreeCanvas>
      {/* museum-vitrine vignette: the subject sits in the warm pool of light, the edges fall off */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 36% 22% at 50% 41%, rgba(255,226,170,0.9) 0%, rgba(255,226,170,0) 100%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 62% at 50% 50%, rgba(36,21,9,0) 55%, rgba(36,21,9,0.42) 100%)" }} />
      {/* film grain + paper fibre (VINTAGEFORGE): a new grain seed every 2 frames */}
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.4 }}>
          <filter id={`g${frame}`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.9 * (width / 1080)} numOctaves={2} seed={Math.floor(frame / 2) % 17} />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 1.6 -0.35" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#g${frame})`} />
        </svg>
      </AbsoluteFill>
      {/* scrims under the HUD (top) and the karaoke band (bottom) */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(36,21,9,0.6) 0%, rgba(36,21,9,0.25) 17%, rgba(36,21,9,0) 26%, rgba(36,21,9,0) 62%, rgba(36,21,9,0.3) 70%, rgba(36,21,9,0) 80%, rgba(36,21,9,0) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Scoreboard card flip around event times: flip pulses 0 → 0.5 (edge-on) → 0 in 0.35 s, the value changes at the midpoint. */
const board = (t: number, base: string, events: [number, string][]): { score: string; flip: number } => {
  let score = base;
  let flip = 0;
  for (const [at, v] of events) {
    const k = clamp((t - at) / 0.35);
    if (k >= 0.5) score = v;
    if (k > 0 && k < 1) flip = 0.5 * Math.sin(Math.PI * k);
  }
  return { score, flip };
};

/** Ball from a hand position over a parabola to the rim, then straight down through the net. u: 0..1 flight, d: 0..1 drop. */
const arc = (from: V3, rim: V3, peak: number, u: number): V3 => {
  const p = v3(from, [rim[0], rim[1] + 0.12, rim[2]], u);
  const h = 4 * u * (1 - u) * (peak - Math.max(from[1], rim[1]));
  return [p[0], p[1] + h, p[2]];
};
const drop = (rim: V3, d: number): V3 => [rim[0], rim[1] + 0.12 - d * (rim[1] + 0.02), rim[2] + d * 0.05];

// ================================================================= A — hook (cover)
const WILT_A: V3 = [0.3, 0, 0.6];
export const hookShot = (t: number): Shot => camAt([K(0, [1.6, 0.9, 3.6], [0.2, 1.3, -1], 40), K(CUT.B1, [0.9, 1.0, 2.6], [0.2, 1.3, -1], 40)], t, 0.02, 3);
export const HookScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  return (
    <Stage shot={hookShot(t)} frame={frame}>
      <ArenaLights />
      <ArenaSet t={t} score="100" crowd={30} cheer={0.3} />
      <ToyPerson f={f} seed={3} look={WILT_LOOK} poseOverride={holdPose(f)} position={WILT_A} heading={0} />
      <Ball position={[WILT_A[0], 0.74, WILT_A[2] + 0.2]} spin={t * 0.4} />
    </Stage>
  );
};
export const HookHud: React.FC<{ t: number; still?: boolean }> = ({ t, still }) => (
  <>
    <HookTitle o={still ? 1 : 1 - seg(t, 2.4, 2.9)} />
    {!still && <Stamp t={t} a={T.rekaman} b={CUT.B1 + 0.05} y={560} text="0 REKAMAN VIDEO" size={78} />}
    {!still && <Card t={t} a={T.audira} b={CUT.B1 + 0.05} y={1120} text="AUDIRA · FAKTA OLAHRAGA" size={42} tone="ink" />}
  </>
);

// ================================================================= B1 — Hershey, the chocolate-factory town
const townShot = (t: number): Shot => camAt([K(CUT.B1, [5, 3.2, 9], [0, 1.4, 0], 42), K(CUT.B2, [1.2, 1.0, 4], [0.6, 1.0, -3], 40)], t, 0.02, 5);
const TownScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <Stage shot={townShot(t)} frame={frame} lift={0.02} pool={false}>
    <SunLights sun={[-6, 9, 5]} keyI={0.4} fogNear={16} fogFar={60} />
    <TownSet t={t} />
  </Stage>
);
const TownHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.tanggal} b={T.penonton - 0.05} y={260} text="2 MARET 1962" sub="HERSHEY, PENNSYLVANIA" size={70} />
    <Card t={t} a={T.penonton} b={CUT.B2 + 0.05} y={260} text="±4.000 PENONTON" size={78} tone="gold" />
    <DustHaze t={t} puffs={[[180, 640, 160, 0.3], [330, 600, 130, 0.25], [860, 560, 150, 0.25]]} vx={20} />
  </>
);

// ================================================================= B2 — arena interior, the radio table
const RADIO_AT: V3 = [-1.2, 0, 4.6];
const arenaShot = (t: number): Shot => camAt([K(CUT.B2, [0, 2.4, 9], [0, 0.9, 0], 42), K(T.radio - 0.3, [-0.3, 1.6, 2.6], [-0.9, 0.7, 4.6], 42), K(CUT.C1, [-0.55, 0.95, 3.2], [-1.2, 0.6, 4.8], 38)], t, 0.02, 7);
const ArenaScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  return (
    <Stage shot={arenaShot(t)} frame={frame}>
      <ArenaLights fogNear={9} fogFar={30} />
      <ArenaSet t={t} score="0" crowd={15} cheer={0.15} />
      {Array.from({ length: 10 }, (_, i) => {
        const side = i < 5 ? -1 : 1;
        const th = t * 0.9 + (i % 5) * ((Math.PI * 2) / 5);
        const cx = side * 3.6;
        const x = cx + Math.cos(th) * 1.6 * -side;
        const z = Math.sin(th) * 1.1;
        const heading = Math.atan2(Math.sin(th) * 1.6 * side, Math.cos(th) * 1.1);
        return <ToyPerson key={i} f={f + i * 17} seed={30 + i} look={i < 5 ? cream(i) : dark(i)} poseOverride={runPose(f * 0.7 + i * 17, 30 + i, 0.2)} position={[x, 0, z]} heading={heading} />;
      })}
      <RadioTable position={RADIO_AT} rotation={Math.PI} />
      <ToyPerson f={f} seed={41} look={SUIT} pose="sit" position={[RADIO_AT[0], 0.22, RADIO_AT[2] + 0.42]} heading={Math.PI} />
    </Stage>
  );
};
const ArenaHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={CUT.B2} b={T.tv - 0.05} y={260} text="WARRIORS vs KNICKS" size={72} />
    <Stamp t={t} a={T.tv} b={T.wartawan - 0.05} y={280} text="TV: TIDAK ADA" size={84} />
    <Stamp t={t} a={T.wartawan} b={T.radio - 0.05} y={280} text="WARTAWAN NY: 0" size={78} />
    <Card t={t} a={T.radio} b={CUT.C1 + 0.05} y={260} text="HANYA SIARAN RADIO" size={70} tone="ink" />
  </>
);

// ================================================================= C1 — Wilt + the scoreboard 23 → 41 → 69
const SCORES: [number, string][] = [[T.q1, "23"], [T.ht, "41"], [T.q3, "69"]];
const scoreShot = (t: number): Shot => camAt([K(CUT.C1, [0.9, 1.0, 2.4], [0, 1.08, -0.2], 38), K(T.kuarter - 0.2, [0.7, 1.05, 2.2], [0, 1.15, -0.4], 37), K(T.q1, [0.4, 1.4, 1.8], [0, 2.6, -5.6], 34), K(CUT.C2, [0.2, 1.45, 1.6], [0, 2.6, -5.6], 33)], t, 0.015, 9);
const ScoreScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const b = board(t, "0", SCORES);
  return (
    <Stage shot={scoreShot(t)} frame={frame}>
      <ArenaLights />
      <ArenaSet t={t} score={b.score} flip={b.flip} crowd={30} cheer={0.4} />
      <ToyPerson f={f} seed={3} look={WILT_LOOK} poseOverride={holdPose(f)} position={[0, 0, 0]} heading={0.15} />
      <Ball position={[0.05, 0.74, 0.2]} spin={t * 0.3} />
    </Stage>
  );
};
const ScoreHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <NameCard t={t} a={CUT.C1} b={T.kuarter - 0.05} y={260} name="WILT CHAMBERLAIN" role="TINGGI 2,16 M · WARRIORS" />
    <Card t={t} a={T.kuarter} b={T.minum - 0.05} y={260} text="KUARTER 1" sub="23 POIN" size={74} />
    <Card t={t} a={T.minum} b={T.setelah - 0.05} y={260} text="TURUN MINUM" sub="41 POIN" size={74} />
    <Card t={t} a={T.setelah} b={CUT.C2 + 0.05} y={260} text="SETELAH 3 KUARTER" sub="69 POIN" size={66} tone="gold" />
  </>
);

// ================================================================= C2 — the stands: GIVE IT TO WILT!
const standShot = (t: number): Shot => camAt([K(CUT.C2, [-2.2, 1.0, -0.6], [-1.6, 1.2, -5.5], 48), K(CUT.D1, [1.8, 1.0, -0.6], [1.4, 1.2, -5.5], 48)], t, 0.03, 11);
const StandScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <Stage shot={standShot(t)} frame={frame}>
    <ArenaLights fogNear={6} fogFar={22} />
    <ArenaSet t={t} score="69" cheer={1} crowd={80} />
  </Stage>
);
const StandHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={CUT.C2} b={T.give - 0.05} y={260} text="PENONTON BERTERIAK" size={66} />
    <Stamp t={t} a={T.give} b={CUT.D1 + 0.05} y={280} text="GIVE IT TO WILT!" size={80} />
  </>
);

// ================================================================= D1 — free throws: 51% career, 28 / 32 that night
const FT_CYCLE = 1.7;
const ftShot = (t: number): Shot => camAt([K(CUT.D1, [5.4, 1.3, 5.4], [5.95, 1.8, 0], 50), K(CUT.D2, [5.6, 1.25, 4.9], [6.0, 1.75, 0], 50)], t, 0.015, 13);
const FtScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const p = (((t - CUT.D1) % FT_CYCLE) + FT_CYCLE) % FT_CYCLE / FT_CYCLE;
  const k = seg(p, 0.05, 0.35) * (1 - seg(p, 0.6, 0.95));
  const chest: V3 = [FT_X + 0.16, 0.74, 0];
  const hand: V3 = [FT_X + 0.1, 1.45, 0];
  const rim = rimAt(1);
  let ball: V3;
  if (p < 0.35) ball = v3(chest, hand, seg(p, 0.05, 0.35));
  else if (p < 0.8) ball = arc(hand, rim, 2.1, (p - 0.35) / 0.45);
  else ball = drop(rim, (p - 0.8) / 0.2);
  return (
    <Stage shot={ftShot(t)} frame={frame}>
      <ArenaLights />
      <ArenaSet t={t} score="69" crowd={30} cheer={0.5} />
      <ToyPerson f={f} seed={3} look={WILT_LOOK} poseOverride={shootPose(f, k)} position={[FT_X, 0, 0]} heading={Math.PI / 2} />
      <Ball position={ball} spin={t * 6} />
    </Stage>
  );
};
const FtHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.karier} b={T.ft28 - 0.05} y={260} text="KARIER: 51%" sub="LEMPARAN BEBAS MASUK" size={80} tone="ink" />
    <Card t={t} a={T.ft28} b={CUT.D2 + 0.05} y={260} text="MALAM ITU: 28 / 32" size={74} tone="gold" />
    <Tally t={t} a={T.ft28} b={CUT.D2 + 0.05} y={470} made={Math.round(28 * seg(t, T.ft28, T.ft32 + 0.8))} />
  </>
);

// ================================================================= D2 — fouls traded, top view
const foulShot = (t: number): Shot => {
  const a = lerp(-0.25, 0.25, seg(t, CUT.D2, CUT.E1));
  return { pos: [Math.sin(a) * 4.5, 6.5, Math.cos(a) * 4.5], target: [0, 0, 0.2], fov: 44 };
};
const PAIRS: [V3, V3][] = [[[-2.2, 0, -1.2], [-1.85, 0, -1.0]], [[1.8, 0, 1.3], [2.15, 0, 1.5]], [[-0.9, 0, 1.9], [-0.55, 0, 2.1]]];
const FoulScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const back = t >= T.warriors; // the Warriors foul back: roles swap
  return (
    <Stage shot={foulShot(t)} frame={frame}>
      <ArenaLights />
      <ArenaSet t={t} score="69" crowd={30} cheer={0.6} />
      <ToyPerson f={f} seed={3} look={WILT_LOOK} poseOverride={holdPose(f)} position={[0.4, 0, 0]} heading={Math.PI / 2} />
      {PAIRS.map(([g, s], i) => (
        <React.Fragment key={i}>
          <ToyPerson f={f + i * 9} seed={60 + i} look={back ? cream(i) : dark(i)} poseOverride={grabPose(f + i * 9)} position={g} heading={Math.PI / 2 + 0.3} />
          <ToyPerson f={f + i * 9} seed={64 + i} look={back ? dark(i) : cream(i)} poseOverride={stumblePose(f + i * 9)} position={s} heading={Math.PI / 2 + 0.3} />
        </React.Fragment>
      ))}
      <ToyPerson f={f} seed={70} look={SUIT} pose="stand" position={[-1.4, 0, 0.3]} heading={0.8} />
    </Stage>
  );
};
const FoulHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.sengaja} b={T.warriors - 0.05} y={260} text="KNICKS SENGAJA MELANGGAR" sub="PEMAIN LAIN, AGAR BOLA TAK KE WILT" size={58} tone="ink" />
    <Card t={t} a={T.warriors} b={CUT.E1 + 0.05} y={260} text="WARRIORS MEMBALAS" sub="IKUT MELANGGAR, REBUT BOLA" size={62} />
    <Flash t={t} at={T.sengaja} dur={0.2} max={0.35} />
    <Flash t={t} at={T.warriors} dur={0.2} max={0.35} />
  </>
);

// ================================================================= E1 — 0:46 left, the 100th point
const WILT_E: V3 = [6.4, 0, 0.3];
const PASS_FROM: V3 = [3.6, 0.6, 1.2];
const PASS_A = T.joe;
const PASS_B = T.joe + 0.8;
const SHOT_A = IMPACT - 0.55;
const E2E = (t: number): V3 => {
  const rim = rimAt(1);
  const chest: V3 = [WILT_E[0] + 0.16, 0.74, WILT_E[2]];
  const hand: V3 = [WILT_E[0] + 0.2, 1.5, WILT_E[2] - 0.05];
  if (t < PASS_A) return PASS_FROM;
  if (t < PASS_B) {
    const u = (t - PASS_A) / (PASS_B - PASS_A);
    const p = v3(PASS_FROM, chest, u);
    return [p[0], p[1] + 4 * u * (1 - u) * 0.25, p[2]];
  }
  if (t < SHOT_A) return chest;
  if (t < SHOT_A + 0.2) return v3(chest, hand, (t - SHOT_A) / 0.2);
  if (t < IMPACT) return arc(hand, rim, 1.75, (t - SHOT_A - 0.2) / (IMPACT - SHOT_A - 0.2));
  return drop(rim, clamp((t - IMPACT) / 0.4));
};
const lastShot = (t: number): Shot => camAt([K(CUT.E1, [4.6, 1.0, 2.6], [6.0, 1.1, 0], 40), K(PASS_B, [5.0, 0.95, 2.2], [6.4, 1.2, 0], 38), K(IMPACT, [5.8, 0.85, 1.6], [6.9, 1.45, 0], 34), K(CUT.E2, [5.6, 0.9, 1.9], [6.9, 1.6, 0], 36)], t, 0.02 * (1 - seg(t, IMPACT - 0.6, IMPACT)), 15);
const LastScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const b = board(t, "98", [[IMPACT, "100"]]);
  const k = seg(t, SHOT_A, SHOT_A + 0.25) * (1 - seg(t, IMPACT + 0.2, IMPACT + 0.7));
  return (
    <Stage shot={lastShot(t)} frame={frame}>
      <ArenaLights />
      <ArenaSet t={t} score={b.score} flip={b.flip} crowd={30} cheer={t >= IMPACT ? 1 : 0.5} />
      <ToyPerson f={f} seed={3} look={WILT_LOOK} poseOverride={t < SHOT_A ? holdPose(f) : shootPose(f, k)} position={WILT_E} heading={Math.PI / 2} />
      <ToyPerson f={f} seed={44} look={cream(4)} poseOverride={t < PASS_B + 0.3 ? mixPose(holdPose(f), shootPose(f, 0.3), seg(t, PASS_A - 0.2, PASS_A)) : holdPose(f)} position={[PASS_FROM[0] - 0.15, 0, PASS_FROM[2]]} heading={1.9} />
      <ToyPerson f={f} seed={45} look={dark(1)} poseOverride={grabPose(f)} position={[WILT_E[0] - 0.55, 0, WILT_E[2] - 0.45]} heading={1.2} />
      <Ball position={E2E(t)} spin={t * 5} />
    </Stage>
  );
};
const LastHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <GameClock t={t} a={CUT.E1} b={T.joe - 0.05} y={260} from={46} to={46} />
    <NameCard t={t} a={T.joe} b={T.wiltMasuk + 0.6} y={260} name="JOE RUKLICK" role="UMPAN KE WILT" />
    <Flash t={t} at={IMPACT} dur={0.5} max={0.85} />
    <Card t={t} a={IMPACT + 0.05} b={CUT.E2 + 0.05} y={300} text="100" sub="POIN · 1 LAGA" size={150} tone="gold" />
  </>
);

// ================================================================= E2 — locker room: the "100" sheet
const lockerShot = (t: number): Shot => camAt([K(CUT.E2, [0.05, 0.95, 2.0], [0, 0.62, -0.4], 40), K(CUT.E3, [0.25, 0.9, 1.7], [0, 0.66, -0.4], 39)], t, 0.012, 17);
const LockerScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const k = seg(t, T.angka - 0.2, T.angka + 0.7);
  const spin = (1 - k) * Math.PI * 3;
  const flicker = 0.93 + 0.07 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return (
    <Stage shot={lockerShot(t)} frame={frame} bg="#2a1d12" exposure={0.95} lift={0} pool={false}>
      <LampLights lamp={[0.8, 1.6, 0.2]} flicker={flicker} />
      <LockerRoom />
      <ToyPerson f={f} seed={3} look={WILT_LOOK} poseOverride={sitHoldPose(f)} position={[0, 0.29, -0.45]} heading={0} />
      <ToyPerson f={f} seed={46} look={SUIT} poseOverride={writePose(f)} position={[-1.25, 0.29, -0.45]} heading={0.5} />
      <group position={[0, lerp(1.25, 0.86, k), lerp(0.4, -0.12, k)]} rotation={[-0.15, 0, spin]} scale={Math.max(0.02, k)}>
        <Sign w={0.5} h={0.36} position={[0, 0, 0]} dep="sheet100" px={700} draw={paintSheet100} />
      </group>
    </Stage>
  );
};
const LockerHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.humas} b={CUT.E3 + 0.05} y={260} text={'HUMAS TIM MENULIS "100"'} size={60} />
    <Flash t={t} at={CUT.E3 - 0.25} dur={0.3} max={0.8} />
  </>
);

// ================================================================= E3 — the archive
const archiveShot = (t: number): Shot => camAt([K(CUT.E3, [-0.9, 1.0, 1.4], [0, 0.5, -0.1], 38), K(CUT.OUT, [0.6, 0.95, 1.2], [0, 0.5, -0.1], 38)], t, 0.012, 19);
const ArchiveScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <Stage shot={archiveShot(t)} frame={frame} bg="#2a1d12" exposure={0.7} lift={0} pool={false}>
    <LampLights lamp={[0.6, 1.5, 0.6]} flicker={1} />
    <ArchiveSet />
  </Stage>
);
const ArchiveHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.diabadikan} b={T.bukti - 0.05} y={260} text="DIABADIKAN" sub="PERPUSTAKAAN KONGRES AS" size={70} tone="ink" />
    <Card t={t} a={T.bukti} b={CUT.OUT + 0.05} y={260} text="BUKTI: FOTO · RADIO" sub="BOX SCORE" size={64} />
  </>
);

// ================================================================= OUT — MUSEUM AUDIRA
const museumShot = (t: number): Shot =>
  camAt([
    K(CUT.OUT, [0, 1.6, 6.4], [0, 1.05, 0], 44),
    K(T.rekor, [0, 1.5, 5.6], [0, 1.0, 0], 44),
    K(T.r83 - 0.1, [-0.75, 1.35, 4.0], [-1.0, 1.0, 0], 42),
    K(T.angka100 - 0.4, [-0.6, 1.32, 3.9], [-0.9, 1.0, 0], 42),
    K(T.angka100 + 0.5, [0, 1.3, 3.9], [0, 1.0, 0], 44),
    K(OUTRO_AT, [0, 1.3, 3.7], [0, 1.0, 0], 44),
  ], t, 0.012, 21);
const MuseumScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <Stage shot={museumShot(t)} frame={frame} bg="#2a1d12">
    <ArenaLights fogNear={8} fogFar={22} />
    <MuseumSet />
  </Stage>
);
const MuseumHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={CUT.OUT} b={T.rekor - 0.05} y={260} text="64 TAHUN BERLALU" size={74} />
    <Card t={t} a={T.r83} b={T.angka100 - 0.05} y={260} text="REKOR TERDEKAT: 83" sub="BAM ADEBAYO · 2026" size={66} tone="ink" />
    <Card t={t} a={T.angka100} b={OUTRO_AT} y={260} text="100 · BELUM TERSENTUH" size={66} tone="gold" />
  </>
);

// ================================================================= captions + film
const KEY = /^(wilt|100|audira|hershey|radio|23|41|69|51|28|32|46|83|knicks|warriors|ruklick)/i;
const CAP: CapWord[] = CLIPS.flatMap((c) => c.words.map((w) => ({ w: w.w, t: w.s, e: w.e, key: KEY.test(w.w) })));

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const sc = sceneAt(t);
  return (
    <AbsoluteFill style={{ background: "#e9d6ae" }}>
      {sc === "A" && <HookScene t={t} frame={frame} />}
      {sc === "B1" && <TownScene t={t} frame={frame} />}
      {sc === "B2" && <ArenaScene t={t} frame={frame} />}
      {sc === "C1" && <ScoreScene t={t} frame={frame} />}
      {sc === "C2" && <StandScene t={t} frame={frame} />}
      {sc === "D1" && <FtScene t={t} frame={frame} />}
      {sc === "D2" && <FoulScene t={t} frame={frame} />}
      {sc === "E1" && <LastScene t={t} frame={frame} />}
      {sc === "E2" && <LockerScene t={t} frame={frame} />}
      {sc === "E3" && <ArchiveScene t={t} frame={frame} />}
      {sc === "OUT" && <MuseumScene t={t} frame={frame} />}
      <Frame width={width} height={height}>
        {sc === "A" && <HookHud t={t} />}
        {sc === "B1" && <TownHud t={t} />}
        {sc === "B2" && <ArenaHud t={t} />}
        {sc === "C1" && <ScoreHud t={t} />}
        {sc === "C2" && <StandHud t={t} />}
        {sc === "D1" && <FtHud t={t} />}
        {sc === "D2" && <FoulHud t={t} />}
        {sc === "E1" && <LastHud t={t} />}
        {sc === "E2" && <LockerHud t={t} />}
        {sc === "E3" && <ArchiveHud t={t} />}
        {sc === "OUT" && <MuseumHud t={t} />}
        {/* soft dark band under the karaoke so cream words hold on bright floors/paper */}
        {t < T.ikuti + 1.0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1240, height: 300, background: "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(30,18,8,0.62) 0%, rgba(30,18,8,0.35) 60%, rgba(30,18,8,0) 100%)" }} />}
        <Captions t={t} words={CAP} end={T.ikuti + 1.0} />
        <DustWipe t={t} cuts={CUTS} />
      </Frame>
      <Audio src={staticFile("audio/ep10/vo.wav")} />
    </AbsoluteFill>
  );
};
