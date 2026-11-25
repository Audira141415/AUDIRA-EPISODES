// EP07 film "Phelps Menang 0,01 Detik" (TOYDIORAMA). Six sets on the walnut toy stage, every cut on a VO section:
//   S1 hook          finish wall, two butterfly swimmers reach the touchpads together, timer 0,01
//   S2 konteks       Water Cube bubble wall + medal shelf: 6 golds, slot 7 tagged "SPITZ 1972"; Čavić walks in
//   S3 pengembangan  the 8-lane pool, overhead tracking: Čavić leads, Phelps 7th at the turn, catches up; slow-mo glide
//   S4 penjelasan    (a) touchpad macro + kg gauge, waves do not stop the clock (b) scoreboard 50,58 / 50,59
//                    (c) overhead camera above the finish line, referee at the replay trolley
//   S5 payoff        golden medal shelf: 7th and 8th golds, Phelps cheers on the podium, tag "PECAH · 2008"
//   S6 outro         two fingertips over a ruler, ≈ 2 CM (estimate); the AUDIRA card comes from Root
// Facts only from research/SOURCE_REGISTER.md. Neutral on who touched first: official result Phelps.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, type Pose } from "../../core/polish/Person.tsx";

/** Blend two poses componentwise (QA: wave → cheer must not snap in one frame). */
const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * k;
  const v = (x: [number, number, number], y: [number, number, number]): [number, number, number] => [m(x[0], y[0]), m(x[1], y[1]), m(x[2], y[2])];
  return {
    body: v(a.body, b.body), lift: m(a.lift, b.lift), spine: v(a.spine, b.spine), head: v(a.head, b.head),
    ls: v(a.ls, b.ls), le: m(a.le, b.le), rs: v(a.rs, b.rs), re: m(a.re, b.re),
    lh: v(a.lh, b.lh), lk: m(a.lk, b.lk), rh: v(a.rh, b.rh), rk: m(a.rk, b.rk),
  };
};
import { SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { Model } from "./Model.tsx";
import {
  Arena,
  BubbleWall,
  CAVIC_LANE,
  Gauge,
  LOOK_CAVIC,
  LOOK_PHELPS,
  MedalShelf,
  PHELPS_LANE,
  POOL,
  Pool,
  REACH,
  Ruler,
  Swimmer,
  ToyHand,
  Touchpad,
  Wake,
  butterfly,
  glide,
  laneX,
} from "./PoolSet.tsx";
import tl from "./timeline.json";

type V3 = [number, number, number];
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
const CLIPS = tl.clips as Clip[];
export const TOTAL = tl.total as number;
const SEC = (id: string) => CLIPS.find((c) => c.id === id)!;
/** Start of the n-th word in a section that starts with `prefix`. */
const W = (id: string, prefix: string, nth = 0) => SEC(id).words.filter((w) => w.w.startsWith(prefix))[nth]?.s ?? SEC(id).start;

const CUT = {
  s2: SEC("konteks").start - 0.3,
  s3: SEC("pengembangan").start - 0.3,
  s4: SEC("penjelasan").start - 0.3,
  s5: SEC("payoff").start - 0.3,
  s6: SEC("outro").start - 0.3,
};
const BEAT = {
  blink: W("hook", "Lebih"),
  hook36: W("hook", "36"),
  date: W("konteks", "16"),
  six: W("konteks", "enam"),
  one: W("konteks", "Satu"),
  spitz: W("konteks", "Spitz"),
  rival: W("konteks", "Lawannya"),
  qual: W("konteks", "tercepat"),
  quote: W("konteks", "Sehari"),
  start: W("pengembangan", "Start"),
  turn: W("pengembangan", "tikungan"),
  seventh: W("pengembangan", "ketujuh"),
  chase: W("pengembangan", "Lalu"),
  wall: W("pengembangan", "Menjelang"),
  glide: W("pengembangan", "Čavić", 2),
  half: W("pengembangan", "Phelps", 1),
  pad: W("penjelasan", "Touchpad"),
  kg: W("penjelasan", "1,5"),
  wave: W("penjelasan", "supaya"),
  board: W("penjelasan", "Papan"),
  p5058: W("penjelasan", "50,58"),
  c5059: W("penjelasan", "50,59"),
  protest: W("penjelasan", "Serbia"),
  ref: W("penjelasan", "Wasit"),
  frame: W("penjelasan", "1/10.000"),
  verdict: W("penjelasan", "Kesimpulannya"),
  accept: W("penjelasan", "Serbia", 1),
  official: W("payoff", "Hasil"),
  gold8: W("payoff", "emas"),
  eight: W("payoff", "Delapan"),
  wr: W("payoff", "tujuh"),
  swims: W("payoff", "tujuh", 1),
  broken: W("payoff", "Rekor"),
  cm: W("outro", "Kira-kira"),
  fair: W("outro", "Menurutmu"),
};
/** S4 sub-sets: touchpad macro → scoreboard → replay camera. */
const SUB = { board: BEAT.board - 0.3, video: BEAT.protest - 0.3 };

// ---------------------------------------------------------------- math
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
type Key = { t: number; pos: V3; target: V3; fov?: number };
const camAt = (t: number, ks: Key[]) => {
  if (t <= ks[0].t) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t <= b.t) {
      const k = ease(seg(t, a.t, b.t));
      return { t, pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov ?? 32, b.fov ?? 32, k) };
    }
  }
  return ks[ks.length - 1];
};

// ---------------------------------------------------------------- S3 race model (progress 0..1 over 100 m = two lengths)
const T_TURN = BEAT.turn + 0.4;
const SLOW = BEAT.glide - 0.2;
const leader = (t: number) => {
  if (t < BEAT.start) return 0.02;
  if (t < T_TURN) return lerp(0.02, 0.5, seg(t, BEAT.start, T_TURN));
  if (t < SLOW) return lerp(0.5, 0.93, seg(t, T_TURN, SLOW));
  return lerp(0.93, 0.978, Math.sqrt(seg(t, SLOW, CUT.s4)));
};
// offset at the turn → offset once the chase is done. Phelps is 7th at the turn (six ahead, one behind).
const LANE_OFF: [number, number][] = [
  [-0.02, -0.05], [-0.035, -0.04], [-0.01, -0.03], [0, 0], [-0.06, -0.004], [-0.045, -0.06], [-0.025, -0.035], [-0.07, -0.07],
];
const progress = (lane: number, t: number) => {
  const k = ease(seg(t, T_TURN + 0.8, BEAT.wall));
  const [o, f] = LANE_OFF[lane];
  return clamp(leader(t) + lerp(o, f, k) * seg(t, BEAT.start, BEAT.start + 1.2), 0.02, 0.98);
};
const zOf = (p: number) => (p < 0.5 ? POOL.half - p * 4 * POOL.half : -POOL.half + (p - 0.5) * 4 * POOL.half);
const headingOf = (p: number) => (p < 0.5 ? Math.PI : 0);

const Race: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const slow = t >= SLOW;
  // slow motion: swimmers' stroke clock runs at 30 %
  const fs = slow ? SLOW * 60 + (t - SLOW) * 60 * 0.3 : f;
  return (
    <group>
      {Array.from({ length: POOL.lanes }, (_, lane) => {
        const p = progress(lane, t);
        const z = zOf(p);
        const h = headingOf(p);
        const isP = lane === PHELPS_LANE, isC = lane === CAVIC_LANE;
        const pose = slow && isC ? glide(ease(seg(t, SLOW, SLOW + 0.8))) : butterfly(fs, lane + 3);
        return (
          <group key={lane}>
            <Swimmer f={fs} lane={lane} z={z} heading={h} pose={pose} seed={lane + 3} look={isP ? LOOK_PHELPS : isC ? LOOK_CAVIC : { outfit: "trunks", hairStyle: 2 }} />
            {t > BEAT.start && <Wake x={laneX(lane)} z={z} f={fs} dir={h === 0 ? 1 : -1} />}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- S1 hook: the touch
/** Both swimmers glide in and touch at T_TOUCH (kept visually simultaneous: the film never shows who was first). */
const T_TOUCH = 2.9;
const HookTouch: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const zEnd = POOL.half - REACH - 0.03;
  const k = ease(seg(t, 0, T_TOUCH));
  const z = lerp(zEnd - 0.9, zEnd, k);
  const fs = t < T_TOUCH ? f * 0.5 : T_TOUCH * 30;
  const gl = seg(t, T_TOUCH - 0.9, T_TOUCH - 0.1);
  return (
    <group>
      <Swimmer f={fs} lane={PHELPS_LANE} z={z} heading={0} pose={gl < 1 ? butterfly(fs, 7) : glide(1)} seed={7} look={LOOK_PHELPS} />
      <Swimmer f={fs} lane={CAVIC_LANE} z={z} heading={0} pose={glide(gl)} seed={6} look={LOOK_CAVIC} />
      {[PHELPS_LANE, CAVIC_LANE].map((lane) => {
        const r = seg(t, T_TOUCH, T_TOUCH + 2.2);
        return r > 0 && r < 1 ? (
          <mesh key={lane} position={[laneX(lane), POOL.waterY + 0.008, POOL.half - 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05 + r * 0.4, 0.075 + r * 0.42, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7 * (1 - r)} depthWrite={false} />
          </mesh>
        ) : null;
      })}
      {/* swimmers further back, still racing */}
      {[0, 1, 2, 5, 6, 7].map((lane, i) => (
        <Swimmer key={lane} f={f * 0.5} lane={lane} z={lerp(zEnd - 1.6 - i * 0.12, zEnd - 0.7 - i * 0.12, k)} heading={0} seed={lane + 3} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- S2 / S5 medal room
const MedalRoom: React.FC<{ f: number; t: number; payoff: boolean }> = ({ f, t, payoff }) => {
  const count = payoff ? 6 + ease(seg(t, BEAT.official + 1.0, BEAT.official + 1.5)) + ease(seg(t, BEAT.gold8, BEAT.gold8 + 0.5)) : 6 * seg(t, BEAT.date, BEAT.six + 0.4);
  const broken = payoff && t > BEAT.broken + 0.6;
  // Čavić walks in from stage right in the context scene
  const walkK = ease(seg(t, BEAT.rival - 0.2, BEAT.rival + 1.4));
  const cx = lerp(3.6, 1.45, walkK);
  return (
    <group>
      {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 7]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      <BubbleWall z={-2.6} />
      <Model id="trophy-cabinet-e963ac" position={[-2.35, 0, -1.6]} rotation={[0, 0.35, 0]} height={1.8} />
      <group position={[0, 0, -0.7]}>
        <MedalShelf count={count} tag={broken ? "PECAH · 2008" : "SPITZ 1972 · 7 EMAS"} tagColor={broken ? "#b8860b" : "#c22a1e"} ghostFrom={payoff ? 99 : 6} />
      </group>
      {payoff ? (
        <group position={[0, 0, 0.9]}>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.9, 0.34, 0.7]} radius={0.04} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4f1ea" />
          </mesh>
          <SceneText position={[0, 0.17, 0.36]} fontSize={0.2} color="#b8860b" anchorX="center" anchorY="middle">
            1
          </SceneText>
          <ToyPerson f={f} seed={7} poseOverride={mixPose(poseAt("wave", f, 7), poseAt("cheer", f, 7), ease(seg(t, BEAT.eight - 0.15, BEAT.eight + 0.25)))} look={{ ...LOOK_PHELPS, outfit: "trunks" }} position={[0, 0.34, 0]} heading={0} />
        </group>
      ) : (
        <>
          <ToyPerson f={f} seed={7} pose="stand" look={{ ...LOOK_PHELPS, outfit: "trunks" }} position={[-1.45, 0, 0.6]} heading={0.35} />
          <ToyPerson f={f} seed={6} pose={walkK > 0 && walkK < 1 ? "walk" : "stand"} look={{ ...LOOK_CAVIC, outfit: "trunks" }} position={[cx, 0, 0.6]} heading={walkK < 1 ? -Math.PI / 2 : -0.35} />
        </>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- S4a touchpad macro
const PadMacro: React.FC<{ t: number }> = ({ t }) => {
  const press = ease(seg(t, BEAT.pad + 0.2, BEAT.pad + 0.7)) * (1 - ease(seg(t, BEAT.wave - 0.4, BEAT.wave)));
  const waves = seg(t, BEAT.wave, SUB.board);
  const kg = press * 2.0 + (waves > 0 ? 0.35 + 0.25 * Math.sin(t * 7) : 0) * (1 - press);
  return (
    <group>
      {/* tiled wall, big touchpad (scaled ×4), water line */}
      <mesh position={[0, 0.2, -0.15]} receiveShadow>
        <boxGeometry args={[6, 3, 0.2]} />
        <meshStandardMaterial roughness={0.75} color="#4f93a8" />
      </mesh>
      <group scale={4} position={[0, 0.1, POOL.half * -4 + 0.04]}>
        <group position={[0, 0, POOL.half]}>
          <Touchpad x={0} lit={press > 0.6 ? 0.35 : 0} z={0} />
        </group>
      </group>
      <mesh position={[0, -0.6, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshPhysicalMaterial color="#2c9ec8" transparent opacity={0.7} roughness={0.06} clearcoat={1} depthWrite={false} />
      </mesh>
      {/* waves rolling into the pad */}
      {waves > 0 &&
        [0, 1, 2].map((i) => {
          const k = ((t - BEAT.wave) * 0.7 + i / 3) % 1;
          return (
            <mesh key={i} position={[0, -0.6, lerp(2.4, 0.15, k)]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1 - k * 0.6, 1]}>
              <cylinderGeometry args={[0.12, 0.12, 2.4, 20, 1, false, 0, Math.PI]} />
              <meshPhysicalMaterial color="#7fd0e6" transparent opacity={0.75} roughness={0.05} clearcoat={1} />
            </mesh>
          );
        })}
      <ToyHand position={[0.15, lerp(-0.05, 0.1, press), lerp(4.6, 0.42, press)]} rotation={[0, 0, 0]} scale={1.3} />
      <Gauge position={[1.95, 0.55, 0.05]} kg={kg} />
      <Gauge position={[-1.95, 0.55, 0.05]} kg={kg} />
    </group>
  );
};

// ---------------------------------------------------------------- S4b scoreboard
const Board: React.FC = () => (
  <group>
    {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.15, 6]} />
        <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
      </mesh>
    ))}
    <Model id="match-scoreboard-58f51e" position={[0, 0, -1.2]} height={2.6} />
    {/* our own digits over the model's blank "00 00" face */}
    <group position={[0, 1.92, -0.85]}>
      <mesh>
        <RoundedBoxGeo args={[1.55, 0.46, 0.04]} radius={0.03} />
        <meshStandardMaterial color="#0e141d" roughness={0.6} />
      </mesh>
      <SceneText position={[-0.4, 0, 0.03]} fontSize={0.22} color="#f2c230" anchorX="center" anchorY="middle">
        50,58
      </SceneText>
      <SceneText position={[0.4, 0, 0.03]} fontSize={0.22} color="#f4f1ea" anchorX="center" anchorY="middle">
        50,59
      </SceneText>
    </group>
    <group position={[0, 2.85, -1.0]}>
      <mesh>
        <RoundedBoxGeo args={[2.6, 0.34, 0.06]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.paper} color="#0f2a4a" />
      </mesh>
      <SceneText position={[0, 0, 0.04]} fontSize={0.16} color="#f2c230" anchorX="center" anchorY="middle">
        AUDIRA · 100 M KUPU-KUPU
      </SceneText>
    </group>
  </group>
);

// ---------------------------------------------------------------- S4c replay: overhead camera + referee
const Replay: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const zEnd = POOL.half - REACH - 0.03;
  return (
    <group>
      <Pool lit={{ [PHELPS_LANE]: 1, [CAVIC_LANE]: 1 }} />
      <Swimmer f={T_TOUCH * 30} lane={PHELPS_LANE} z={zEnd} heading={0} pose={glide(1)} seed={7} look={LOOK_PHELPS} />
      <Swimmer f={T_TOUCH * 30} lane={CAVIC_LANE} z={zEnd} heading={0} pose={glide(1)} seed={6} look={LOOK_CAVIC} />
      {/* camera rig straight above the finish line */}
      <mesh position={[2.55, 0.9, POOL.half + 0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.7, 8]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.3, 1.74, POOL.half + 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 2.5, 8]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[2.4, 1.55, POOL.half + 0.15]}>
        <Model id="eye-in-the-sky-23fe89" height={0.22} />
      </group>
      <Model id="class-tv-trolley-2f9fa2" position={[2.75, POOL.deckY, POOL.half + 1.05]} rotation={[0, -0.6, 0]} height={0.9} />
      <ToyPerson f={f} seed={51} pose="stand" look={{ top: "#f4f1ea", bottom: "#262b33", outfit: "casual", hairStyle: 0 }} position={[2.05, POOL.deckY, POOL.half + 1.35]} heading={2.2} scale={0.9} />
      {t > BEAT.accept - 0.3 && (
        <ToyPerson f={f} seed={52} pose="stand" look={{ top: "#8e1f2a", bottom: "#262b33", outfit: "casual", hairStyle: 0 }} position={[2.4, POOL.deckY, POOL.half + 1.8]} heading={2.6} scale={0.9 * Math.max(0.01, ease(seg(t, BEAT.accept - 0.3, BEAT.accept + 0.2)))} />
      )}
    </group>
  );
};

// ---------------------------------------------------------------- S6 ruler between two fingertips
const RulerShot: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(seg(t, CUT.s6 + 0.2, BEAT.cm + 0.3));
  return (
    <group>
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      <Ruler position={[0, 0.03, 0.4]} length={2.4} />
      {/* fingertips 0,2 units = 2 cm on the ruler (estimate) */}
      <ToyHand position={[lerp(-2.4, -0.1 - 0.46, k), 0.16, 0.25]} rotation={[0, Math.PI / 2, 0]} skin={LOOK_CAVIC.skin} scale={0.9} />
      <ToyHand position={[lerp(2.4, 0.1 + 0.46, k), 0.16, 0.25]} rotation={[0, -Math.PI / 2, 0]} skin={LOOK_PHELPS.skin} scale={0.9} />
      <group position={[0, 0.8, -0.9]}>
        <Touchpad x={-0.6} lit={1} z={0} />
        <Touchpad x={0.6} lit={1} z={0} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- HUD
const Timer: React.FC<{ value: string; label?: string; color?: string; k: number; top?: number; size?: number; panel?: boolean }> = ({ value, label, color = "#fff", k, top = 260, size = 190, panel = false }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", opacity: k, transform: `scale(${0.9 + 0.1 * k})`, ...(panel ? { left: 70, right: 70, padding: "18px 10px 22px", background: "rgba(14,20,29,.94)", borderRadius: 18, boxShadow: "0 10px 30px rgba(0,0,0,.5)" } : {}) }}>
    <div style={{ fontFamily: FONT.display, fontSize: size, lineHeight: 1, color, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>{value}</div>
    {label ? <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.8)", marginTop: 6 }}>{label}</div> : null}
  </div>
);

const Chip: React.FC<{ text: string; k: number; top?: number; bg?: string; color?: string; rot?: number; size?: number }> = ({ text, k, top = 260, bg = TP.paperCard, color = "#181a1b", rot = -2, size = 40 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, display: "flex", justifyContent: "center", opacity: k }}>
    <div style={{ background: bg, color, fontFamily: FONT.sans, fontWeight: 700, fontSize: size, letterSpacing: 2, padding: "10px 24px", textAlign: "center", transform: `rotate(${rot}deg) translateY(${(1 - k) * 20}px)`, boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}>{text}</div>
  </div>
);

const pop = (t: number, a: number, b = 1e9) => ease(seg(t, a, a + 0.25)) * (1 - seg(t, b - 0.2, b));

const ScoreRows: React.FC<{ t: number }> = ({ t }) => {
  const row = (name: string, time: string, a: number, gold: boolean) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px", background: gold ? "rgba(242,194,48,.95)" : "rgba(14,20,29,.9)", color: gold ? "#181a1b" : "#fff", opacity: pop(t, a), transform: `translateX(${(1 - pop(t, a)) * -40}px)`, marginTop: 14, borderRadius: 10 }}>
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 52 }}>{name}</span>
      <span style={{ fontFamily: FONT.display, fontSize: 96, lineHeight: 1 }}>{time}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 250 }}>
      {row("1 · PHELPS", "50,58", BEAT.p5058, true)}
      {row("2 · ČAVIĆ", "50,59", BEAT.c5059, false)}
    </div>
  );
};

const Filmstrip: React.FC<{ t: number }> = ({ t }) => {
  const k = pop(t, BEAT.frame, BEAT.verdict);
  const n = Math.floor(Math.max(0, t - BEAT.frame) * 24);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 600, opacity: k, display: "flex", gap: 12, justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ width: 176, height: 140, background: "#0e141d", border: "7px solid #f4f1ea", boxShadow: "0 8px 22px rgba(0,0,0,.55)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: i === 2 ? "#f2c230" : "#9aa3ad", fontFamily: FONT.sans, fontWeight: 700, fontSize: 44 }}>
          #{n + i}
        </div>
      ))}
    </div>
  );
};

export const CoverText: React.FC = () => (
  <div style={{ position: "absolute", left: 64, right: 64, top: 250, color: "#fff" }}>
    <div style={{ display: "inline-block", background: TP.paperCard, color: "#181a1b", fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, letterSpacing: 2, padding: "8px 18px", transform: "rotate(-2deg)", boxShadow: "0 6px 18px rgba(0,0,0,.35)" }}>
      BEIJING 2008 · 100 M KUPU-KUPU
    </div>
    <div style={{ fontFamily: FONT.display, fontSize: 210, lineHeight: 0.95, marginTop: 18, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
      0,01<span style={{ fontSize: 104, marginLeft: 14, color: "#f2c230" }}>DETIK</span>
    </div>
    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, marginTop: 6, textShadow: "0 3px 12px rgba(0,0,0,.7)" }}>Phelps 50,58 · Čavić 50,59. Emas ke-7.</div>
  </div>
);

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const els: React.ReactNode[] = [];
  if (t < CUT.s2) {
    const cover = 1 - seg(t, 1.5, 1.9);
    if (cover > 0) els.push(<div key="cov" style={{ opacity: cover }}><CoverText /></div>);
    els.push(<Timer key="tm" value="0,01" label="DETIK · LEBIH SINGKAT DARI KEDIPAN" color="#f2c230" k={pop(t, BEAT.blink)} />);
    els.push(<Chip key="36" text="PERBURUAN REKOR 36 TAHUN" k={pop(t, BEAT.hook36)} top={560} />);
  } else if (t < CUT.s3) {
    els.push(<Chip key="d" text="BEIJING · SABTU, 16 AGU 2008" k={pop(t, BEAT.date, BEAT.one)} />);
    els.push(<Timer key="6" value="6 EMAS" label="SEBELUM FINAL 100 M KUPU-KUPU" k={pop(t, BEAT.six, BEAT.spitz)} top={360} size={150} />);
    els.push(<Chip key="s" text="+1 = SAMAI SPITZ (7 EMAS, 1972)" k={pop(t, BEAT.spitz, BEAT.rival)} top={360} bg="#c22a1e" color="#fff" />);
    els.push(<Chip key="c" text="ČAVIĆ · SERBIA · TERCEPAT DI KUALIFIKASI" k={pop(t, BEAT.qual, BEAT.quote)} size={36} />);
    els.push(<Chip key="q" text="ČAVIĆ: PHELPS KALAH = BAIK UNTUK OLAHRAGA" k={pop(t, BEAT.quote)} bg="#0f2a4a" color="#f2c230" size={36} rot={1.5} />);
  } else if (t < CUT.s4) {
    els.push(<Chip key="st" text="START · 100 M KUPU-KUPU" k={pop(t, BEAT.start, BEAT.turn)} />);
    els.push(<Timer key="50" value="50 M" label="PHELPS URUTAN KE-7" color="#f2c230" k={pop(t, BEAT.seventh - 0.6, BEAT.chase + 0.6)} top={260} size={160} />);
    els.push(<Chip key="ch" text="SATU PER SATU TERLEWATI" k={pop(t, BEAT.chase + 0.6, BEAT.wall)} />);
    els.push(<Chip key="w" text="TINGGAL ČAVIĆ DI DEPAN" k={pop(t, BEAT.wall, BEAT.glide)} bg="#c22a1e" color="#fff" />);
    els.push(<Chip key="g" text="ČAVIĆ: MELUNCUR, LENGAN LURUS" k={pop(t, BEAT.glide)} top={260} bg="#e4e6ea" />);
    els.push(<Chip key="h" text="PHELPS: +½ KAYUHAN" k={pop(t, BEAT.half)} top={360} bg="#f2c230" rot={1.5} />);
  } else if (t < CUT.s5) {
    els.push(<Chip key="tp" text="DINDING FINIS = TOUCHPAD" k={pop(t, CUT.s4 + 0.3, BEAT.kg)} bg="#0e141d" color="#f2c230" size={46} />);
    els.push(<Timer key="kg" value="1,5–2,5 KG" label="TEKANAN UNTUK MENGHENTIKAN JAM" color="#f2c230" k={pop(t, BEAT.kg, SUB.board)} size={140} panel />);
    els.push(<Chip key="wv" text="OMBAK ≠ SENTUHAN" k={pop(t, BEAT.wave + 0.3, SUB.board)} top={500} bg="#0f2a4a" color="#fff" />);
    if (t >= SUB.board && t < SUB.video) els.push(<ScoreRows key="sb" t={t} />);
    els.push(<Chip key="pr" text="SERBIA PROTES" k={pop(t, BEAT.protest, BEAT.frame)} bg="#c22a1e" color="#fff" />);
    els.push(<Timer key="fr" value="1/10.000" label="DETIK PER FRAME VIDEO" color="#f2c230" k={pop(t, BEAT.frame, BEAT.verdict)} size={170} panel />);
    if (t >= SUB.video) els.push(<Filmstrip key="fs" t={t} />);
    els.push(<Chip key="v" text="SATU MENGAYUH, SATU MELUNCUR" k={pop(t, BEAT.verdict, BEAT.accept)} bg="#f2c230" size={44} />);
    els.push(<Chip key="ac" text="SERBIA MENONTON, LALU MENERIMA" k={pop(t, BEAT.accept)} />);
  } else if (t < CUT.s6) {
    els.push(<Chip key="of" text="HASIL RESMI: PHELPS" k={pop(t, BEAT.official, BEAT.eight)} bg="#f2c230" />);
    els.push(<Chip key="g8" text="EMAS KE-8 · 17 AGU 2008" k={pop(t, BEAT.gold8 - 0.2, BEAT.eight)} top={360} />);
    const stack = (key: string, text: string, a: number, top: number) => <Chip key={key} text={text} k={pop(t, a, BEAT.broken)} top={top} size={46} rot={0} />;
    els.push(stack("e8", "8 EMAS", BEAT.eight, 260));
    els.push(stack("wr", "7 REKOR DUNIA", BEAT.wr, 350));
    els.push(stack("sw", "17 RENANG · 9 HARI", BEAT.swims, 440));
    els.push(<Timer key="36" value="36 TAHUN" label="REKOR SPITZ 1972 PECAH" color="#f2c230" k={pop(t, BEAT.broken)} size={160} />);
  } else {
    els.push(<Timer key="cm" value="≈ 2 CM" label="SELISIH EMASNYA (PERKIRAAN)" color="#f2c230" k={pop(t, BEAT.cm)} size={170} />);
    els.push(<Chip key="ad" text="ADIL? TULIS DI KOMENTAR" k={pop(t, BEAT.fair)} top={560} />);
  }
  return <>{els}</>;
};

// ---------------------------------------------------------------- captions (karaoke, y≈1300)
type Chunk = { a: number; b: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ a: cur[0].s, b: cur[cur.length - 1].e + 0.15, words: cur });
      cur = [];
    };
    for (const w of c.words) {
      cur.push(w);
      if (cur.length >= 4 || /[.,:;!?]$/.test(w.w)) flush();
    }
    flush();
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b + 0.3, out[i + 1].a);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1260, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(14,20,29,.55)", borderRadius: 14, padding: "10px 22px", textAlign: "center" }}>
        {ch.words.map((w, i) => {
          const active = t >= w.s && t < (ch.words[i + 1]?.s ?? ch.b);
          return (
            <span key={i} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 54, color: active ? "#f2c230" : "#fff", marginRight: "0.4em", display: "inline-block", transform: active ? "scale(1.04)" : "none", textShadow: "0 3px 10px rgba(0,0,0,.7)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- cameras per scene
export const COVER_CAM: { pos: V3; target: V3; fov: number } = { pos: [1.75, 1.15, 2.1], target: [-0.15, -0.05, 3.7], fov: 34 };
const raceCam = (t: number): Key => {
  const z = zOf(leader(t));
  const side = lerp(1.6, 0.9, seg(t, BEAT.start, BEAT.wall));
  return { t, pos: [side, 3.7, z + 3.9], target: [0, 0, z - 0.7], fov: 34 };
};
const CAMS: Record<string, Key[]> = {
  s1: [
    { t: 0, ...COVER_CAM },
    { t: T_TOUCH, pos: [1.45, 0.95, 2.6], target: [-0.05, -0.05, 3.75], fov: 34 },
    { t: CUT.s2, pos: [-1.6, 1.9, 1.4], target: [0, 0, 3.6], fov: 34 },
  ],
  s2: [
    { t: CUT.s2, pos: [0.4, 2.4, 6.6], target: [0, 1.7, -1.5], fov: 34 },
    { t: BEAT.six + 0.4, pos: [0.2, 1.25, 3.3], target: [0, 0.75, -0.7], fov: 32 },
    { t: BEAT.rival, pos: [0.5, 1.3, 3.5], target: [0.4, 0.7, -0.3], fov: 32 },
    { t: BEAT.qual + 0.5, pos: [2.6, 1.2, 3.4], target: [1.3, 0.65, 0.4], fov: 32 },
    { t: CUT.s3, pos: [0, 1.6, 4.8], target: [0, 0.75, 0], fov: 34 },
  ],
  s4a: [
    { t: CUT.s4, pos: [0.9, 1.6, 4.6], target: [0, 0.2, 0], fov: 34 },
    { t: BEAT.kg, pos: [0.5, 0.9, 3.9], target: [0.4, 0.3, 0.2], fov: 34 },
    { t: SUB.board, pos: [-0.6, 0.5, 3.6], target: [0, 0, 0.6], fov: 34 },
  ],
  s4b: [
    { t: SUB.board, pos: [0, 1.4, 6.2], target: [0, 1.5, -1.2], fov: 34 },
    { t: SUB.video, pos: [0.6, 1.6, 4.6], target: [0, 1.5, -1.2], fov: 34 },
  ],
  s4c: [
    { t: SUB.video, pos: [-1.3, 2.3, POOL.half + 1.6], target: [0, 0.5, POOL.half - 0.3], fov: 34 },
    { t: BEAT.verdict, pos: [-0.7, 1.4, POOL.half + 1.0], target: [0, 0.05, POOL.half - 0.25], fov: 34 },
    { t: BEAT.accept, pos: [4.2, 1.6, POOL.half + 3.4], target: [1.6, 0.4, POOL.half + 0.4], fov: 34 },
    { t: CUT.s5, pos: [4.6, 1.8, POOL.half + 3.0], target: [1.5, 0.4, POOL.half + 0.6], fov: 34 },
  ],
  s5: [
    { t: CUT.s5, pos: [0.4, 1.1, 2.9], target: [0.4, 0.8, -0.7], fov: 32 },
    { t: BEAT.eight, pos: [0, 1.2, 3.6], target: [0, 0.85, -0.4], fov: 32 },
    { t: BEAT.broken, pos: [-1.2, 1.4, 4.0], target: [0, 0.8, -0.3], fov: 34 },
    { t: CUT.s6, pos: [0, 2.6, 5.6], target: [0, 0.9, -0.6], fov: 34 },
  ],
  s6: [
    { t: CUT.s6, pos: [0, 2.6, 2.6], target: [0, 0.1, 0.3], fov: 34 },
    { t: TOTAL, pos: [0, 2.1, 1.8], target: [0, 0.05, 0.35], fov: 32 },
  ],
};

const sceneOf = (t: number) =>
  t < CUT.s2 ? "s1" : t < CUT.s3 ? "s2" : t < CUT.s4 ? "s3" : t < SUB.board ? "s4a" : t < SUB.video ? "s4b" : t < CUT.s5 ? "s4c" : t < CUT.s6 ? "s5" : "s6";

// ---------------------------------------------------------------- film
/** `at` freezes the clock (cover still); `cover` hides captions and keeps the cover headline up. */
export const FilmAt: React.FC<{ at?: number; cover?: boolean }> = ({ at, cover = false }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = at ?? frame / fps;
  const f = t * 60;
  const sc = sceneOf(t);
  let cam: Key = sc === "s3" ? raceCam(t) : camAt(t, CAMS[sc]);
  if (sc === "s3" && t >= SLOW) {
    // slow-mo close-up at the finish wall, from the lane-rope side
    const k = ease(seg(t, SLOW, CUT.s4));
    cam = { t, pos: lerp3([-1.85, 0.75, 2.9], [-1.4, 0.55, 3.25], k), target: [-0.05, -0.04, 3.55], fov: 34 };
  }
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  const pool = sc === "s1" || sc === "s3";
  const light =
    sc === "s2" ? { amb: 0.24, key: 85, keyColor: TP.keyLight } : sc === "s4a" ? { amb: 0.2, key: 55, keyColor: "#fff1dc" } : sc === "s4b" ? { amb: 0.16, key: 80, keyColor: "#ffe2b8" } : sc === "s5" ? { amb: 0.22, key: 100, keyColor: "#ffc27a" } : sc === "s6" ? { amb: 0.3, key: 90, keyColor: TP.keyLight } : { amb: 0.34, key: 95, keyColor: "#f6efe2" };
  const cuts = [CUT.s2, CUT.s3, CUT.s4, SUB.board, SUB.video, CUT.s5, CUT.s6, SLOW];
  const flash = cover ? 0 : Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.12)) * 0.5;
  return (
    <AbsoluteFill style={{ background: TP.stageBackdrop }}>
      {!cover && <Audio src={staticFile("audio/ep07/vo.wav")} />}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov ?? 32, near: 0.05, far: 60 }}>
          <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov ?? 32} />
          <ambientLight intensity={light.amb * 0.7} color="#F5E8D3" />
          <spotLight position={[-2.2, 7.5, 3.5]} intensity={light.key * 1.15} angle={0.45} penumbra={0.6} color={light.keyColor} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
          <directionalLight position={[3.5, 4.5, -5]} intensity={1.6} color={pool ? "#9fd8ff" : TP.rimLight} />
          <fog attach="fog" args={[TP.stageBackdrop, 10, 22]} />
          <pointLight position={[0, 0.4, 4.4]} intensity={3} distance={4} color={TP.footlights} />
          {/* subject pools: tight warm light on the subject so it separates from the darker stage edges */}
          {sc === "s1" && <spotLight position={[0.4, 4.5, 5.2]} intensity={45} angle={0.32} penumbra={0.55} color="#ffe2b8" />}
          {(sc === "s2" || sc === "s5") && <spotLight position={[0.6, 5.0, 2.6]} intensity={55} angle={0.36} penumbra={0.55} color="#ffe2b8" />}
          {sc === "s5" && <pointLight position={[0, 1.6, 0.4]} intensity={7} distance={3} decay={1.6} color="#ffd59a" />}
          {(sc === "s4a" || sc === "s6") && <spotLight position={[0.6, 5.0, 3.0]} intensity={sc === "s4a" ? 20 : 50} angle={0.4} penumbra={0.55} color="#ffe9c8" />}
          {pool && (
            <>
              <Pool lit={sc === "s1" && t >= T_TOUCH ? { [PHELPS_LANE]: 1, [CAVIC_LANE]: 1 } : {}} />
              <Arena />
              {sc === "s1" ? <HookTouch f={f} t={t} /> : <Race f={f} t={t} />}
            </>
          )}
          {(sc === "s2" || sc === "s5") && <MedalRoom f={f} t={t} payoff={sc === "s5"} />}
          {sc === "s4a" && <PadMacro t={t} />}
          {sc === "s4b" && <Board />}
          {sc === "s4c" && (
            <>
              <Replay f={f} t={t} />
              <Arena />
            </>
          )}
          {sc === "s6" && <RulerShot t={t} />}
          <Finish frame={frame} background={TP.stageBackdrop} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} focus={focus} aperture={0.0025} maxBlur={0.009} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* stage vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 64% 42% at 50% 47%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 44%, rgba(8,10,16,.55) 78%, rgba(8,10,16,.82) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 780, background: "linear-gradient(180deg, rgba(14,20,29,.72) 0%, rgba(14,20,29,.28) 65%, rgba(14,20,29,0) 100%)" }} />
        {cover ? <CoverText /> : <Hud t={t} />}
        {!cover && <Captions t={t} />}
      </div>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => <FilmAt />;
