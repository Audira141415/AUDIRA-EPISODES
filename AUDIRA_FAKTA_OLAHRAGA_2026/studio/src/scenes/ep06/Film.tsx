// EP06 film "Usain Bolt 9,58 Detik" (TOYDIORAMA). Six sets on the walnut toy stage, every cut on a VO section:
//   S1 hook          toy stadium, the whole final in real time, timer 0,00 → 9,58
//   S2 konteks       same stadium before the gun: wide → board "OWENS · 1936" → Bolt in the blocks
//   S3 pengembangan  the race again in slow motion, mapped on the VO: reaction, 20 m, 30 m, 60 m, 80 m, line
//   S4 penjelasan    measuring table: ±41 yellow vs ±45 navy footprints, 2,47 m stride on a ruler, speed dial 44,72
//   S5 payoff        podium + scoreboard: 9,58 vs 9,71, 9,69 → 9,58, trophy cabinet 19,19, "masih rekor dunia"
//   S6 outro         empty track and tape, "KAPAN PECAH?" (the AUDIRA card comes from Root)
// Facts only from research/SOURCE_REGISTER.md ("JANGAN diklaim": 44,72 = average 60–80 m, not a peak; "sekitar 41";
// reaction "termasuk paling lambat"). Toy figures, no realistic faces, no logos.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { BOLT_R, Board, COL, FINISH_X, RUNNERS, START_X, ToyPerson, distAt, finishPose, laneZ, sprintPose, xAt } from "./Set.tsx";
import { Model } from "./Model.tsx";
import { COVER_CAMS, CoverText, Lights, Stadium } from "./Cover.tsx";
import tl from "./timeline.json";

type V3 = [number, number, number];
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
const CLIPS = tl.clips as Clip[];
export const TOTAL = tl.total as number;
const SEC = (id: string) => CLIPS.find((c) => c.id === id)!;

const CUT = {
  s2: SEC("konteks").start - 0.3,
  s3: SEC("pengembangan").start - 0.3,
  s4: SEC("penjelasan").start - 0.3,
  s5: SEC("payoff").start - 0.3,
  s6: SEC("outro").start - 0.3,
};

// ---------------------------------------------------------------- math
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
type Cam = { pos: V3; target: V3; fov: number };
type Key = { t: number } & Cam;
const camAt = (t: number, ks: Key[]): Cam => {
  if (t <= ks[0].t) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t <= b.t) {
      const k = ease(seg(t, a.t, b.t));
      return { pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) };
    }
  }
  return ks[ks.length - 1];
};
const mix = (a: Cam, b: Cam, k: number): Cam => ({ pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) });
const fmt = (x: number, d = 2) => x.toFixed(d).replace(".", ",");
const pop = (t: number, a: number, b = 1e9) => ease(seg(t, a, a + 0.25)) * (1 - seg(t, b - 0.2, b));

// ---------------------------------------------------------------- race clocks
/** S1: the final in (almost) real time; the gun fires at t = 1,0 and the clock stops at 9,58 (t ≈ 10,04). */
const raceS1 = (t: number) => Math.max(0, (t - 1.0) * 1.06);
/** S3: slow motion pinned to the VO words (film time → race time). */
const S3_MAP: [number, number][] = [[25.4, 0], [26.5, 0.146], [30.1, 2.89], [33.8, 3.78], [37.0, 6.31], [40.3, 7.92], [43.6, 9.58], [44.83, 10.2]];
const raceS3 = (t: number) => {
  if (t <= S3_MAP[0][0]) return 0;
  for (let i = 0; i < S3_MAP.length - 1; i++) {
    const [t0, r0] = S3_MAP[i], [t1, r1] = S3_MAP[i + 1];
    if (t <= t1) return lerp(r0, r1, (t - t0) / (t1 - t0));
  }
  return S3_MAP[S3_MAP.length - 1][1];
};
const S3_MARKERS = [20, 30, 60, 80];
const boltX = (rt: number) => xAt(distAt(BOLT_R, rt));

// ---------------------------------------------------------------- S4 measuring table
const LANE_LEN = 6; // 100 m on the table
const Footprints: React.FC<{ x: number; n: number; shown: number; color: string }> = ({ x, n, shown, color }) => (
  <group>
    {Array.from({ length: Math.min(n, Math.floor(shown)) }, (_, i) => (
      <mesh key={i} position={[x + (i % 2 ? 0.11 : -0.11), 0.045, LANE_LEN / 2 - ((i + 0.5) * LANE_LEN) / n]} castShadow>
        <RoundedBoxGeo args={[0.1, 0.03, 0.11]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
      </mesh>
    ))}
  </group>
);

const FlatText: React.FC<{ position: V3; size: number; color?: string; children: string }> = ({ position, size, color = "#181a1b", children }) => (
  <SceneText position={position} rotation={[-Math.PI / 2, 0, 0]} fontSize={size} color={color} anchorX="center" anchorY="middle">
    {children}
  </SceneText>
);

/** Dial 0–50 km/h over a 240° arc, needle at v. */
const SpeedDial: React.FC<{ v: number }> = ({ v }) => {
  const ang = (kmh: number) => ((210 - (kmh / 50) * 240) * Math.PI) / 180;
  return (
    <group position={[0, 1.15, -5]}>
      <mesh position={[0, -0.6, -0.08]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
        <meshStandardMaterial color={TP.stageDowel} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.1, 48]} />
        <meshPhysicalMaterial {...POLISH.paper} color={TP.paperCard} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <torusGeometry args={[0.95, 0.06, 12, 64]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={COL.navy} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => {
        const a = ang(i * 5);
        const big = i % 2 === 0;
        return (
          <group key={i}>
            <mesh position={[Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0.06]} rotation={[0, 0, a]}>
              <boxGeometry args={[big ? 0.16 : 0.09, 0.025, 0.01]} />
              <meshStandardMaterial color="#181a1b" />
            </mesh>
            {big && (
              <SceneText position={[Math.cos(a) * 0.56, Math.sin(a) * 0.56, 0.06]} fontSize={0.13} color="#181a1b" anchorX="center" anchorY="middle">
                {String(i * 5)}
              </SceneText>
            )}
          </group>
        );
      })}
      {/* red band 40–50 */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = ang(40 + i + 0.5);
        return (
          <mesh key={i} position={[Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0.06]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.07, 0.05, 0.01]} />
            <meshStandardMaterial color={COL.red} />
          </mesh>
        );
      })}
      <group position={[0, 0, 0.09]} rotation={[0, 0, ang(v) - Math.PI / 2]}>
        <mesh position={[0, 0.33, 0]} castShadow>
          <boxGeometry args={[0.05, 0.7, 0.03]} />
          <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.25} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 20]} />
        <meshStandardMaterial color="#181a1b" />
      </mesh>
      <SceneText position={[0, -0.42, 0.06]} fontSize={0.14} color="#181a1b" anchorX="center" anchorY="middle">
        KM/JAM
      </SceneText>
    </group>
  );
};

const MeasureTable: React.FC<{ f: number; t: number }> = ({ t }) => {
  const bolt = 41 * seg(t, 46.7, 50.0) + 0.0001;
  const rival = 45 * seg(t, 53.4, 56.3) + 0.0001;
  const v = 44.72 * ease(seg(t, 57.6, 60.3));
  const stride = 0.55 * 2.47 * 1.5; // 2,47 m at the 1,5× figure scale
  return (
    <group>
      <mesh position={[0, 3, -9]}>
        <planeGeometry args={[40, 18]} />
        <meshStandardMaterial color="#1a1f28" roughness={1} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[(i - 6) * 0.62, -0.09, -0.5]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 13]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      {/* two clay lanes, 100 m each, start at +z (bottom of the overhead frame) */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.72, 0.03, LANE_LEN + 0.3]} />
          <meshPhysicalMaterial {...POLISH.clay} color={COL.track} />
        </mesh>
      ))}
      {[LANE_LEN / 2, -LANE_LEN / 2].map((z) => (
        <mesh key={z} position={[0, 0.03, z]}>
          <boxGeometry args={[2.4, 0.006, 0.05]} />
          <meshStandardMaterial color={COL.trackLine} />
        </mesh>
      ))}
      <Footprints x={-0.8} n={41} shown={bolt} color={COL.bolt} />
      <Footprints x={0.8} n={45} shown={rival} color="#5b78c9" />
      <FlatText position={[-0.8, 0.04, LANE_LEN / 2 + 0.42]} size={0.2} color={COL.bolt}>BOLT</FlatText>
      <FlatText position={[0.8, 0.04, LANE_LEN / 2 + 0.42]} size={0.2} color="#9fb1e6">LAWAN</FlatText>
      <FlatText position={[0, 0.04, LANE_LEN / 2 + 0.85]} size={0.16} color={TP.paperCard}>START</FlatText>
      <FlatText position={[0, 0.04, -LANE_LEN / 2 - 0.3]} size={0.16} color={TP.paperCard}>FINIS · 100 M</FlatText>
      {/* frozen stride on a ruler */}
      <group position={[0, 0, 4.6]}>
        <ToyPerson f={0} seed={4} look={BOLT_R.look} poseOverride={sprintPose(Math.PI / 2, 0)} position={[0, 0.02, -0.15]} heading={Math.PI / 2} scale={1.5} />
        {[-stride / 2, stride / 2].map((x) => (
          <mesh key={x} position={[x, 0.03, 0.05]}>
            <RoundedBoxGeo args={[0.16, 0.03, 0.12]} radius={0.015} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={COL.bolt} />
          </mesh>
        ))}
        <mesh position={[0, 0.04, 0.42]} receiveShadow castShadow>
          <boxGeometry args={[stride + 0.2, 0.08, 0.32]} />
          <meshStandardMaterial color={TP.stageDowel} roughness={0.7} />
        </mesh>
        {Array.from({ length: 21 }, (_, i) => (
          <mesh key={i} position={[-stride / 2 + (i * stride) / 20, 0.085, 0.32]}>
            <boxGeometry args={[0.012, 0.004, i % 5 ? 0.06 : 0.12]} />
            <meshStandardMaterial color="#2a1c14" />
          </mesh>
        ))}
        <SceneText position={[0, 0.2, 0.62]} fontSize={0.2} color="#181a1b" anchorX="center" anchorY="middle">
          2,47 M
        </SceneText>
      </group>
      <SpeedDial v={v} />
    </group>
  );
};

// ---------------------------------------------------------------- S5 podium + scoreboard
const Podium: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const cab = ease(seg(t, 76.4, 77.2));
  const board =
    t < 69.9
      ? [
          { text: "FINAL 100 M", size: 0.4, color: "#8a6a12", y: 0.28 },
          { text: "BERLIN 2009", size: 0.34, color: COL.navy, y: -0.28 },
        ]
      : t < 76.4
        ? [
            { text: "9,69  →  9,58", size: 0.4, y: 0.28 },
            { text: "REKOR DUNIA BARU", size: 0.3, color: COL.red, y: -0.28 },
          ]
        : [
            { text: "100 M  9,58", size: 0.4, y: 0.28 },
            { text: "200 M  19,19", size: 0.4, y: -0.28 },
          ];
  const blocks: { x: number; h: number; n: string }[] = [
    { x: 0, h: 0.9, n: "1" },
    { x: -1.15, h: 0.6, n: "2" },
    { x: 1.15, h: 0.4, n: "3" },
  ];
  return (
    <group>
      <mesh position={[0, 3, -8]}>
        <planeGeometry args={[40, 18]} />
        <meshStandardMaterial color="#20170f" roughness={1} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[(i - 6) * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 10]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      {blocks.map((b) => (
        <group key={b.n} position={[b.x, 0, 0]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[1.05, b.h, 0.9]} radius={0.05} />
            <meshPhysicalMaterial {...POLISH.paper} color={b.n === "1" ? "#f4f1ea" : "#e6dfd0"} />
          </mesh>
          <SceneText position={[0, b.h / 2, 0.46]} fontSize={0.3} color={b.n === "1" ? "#8a6a12" : "#181a1b"} anchorX="center" anchorY="middle">
            {b.n}
          </SceneText>
        </group>
      ))}
      <ToyPerson f={f} seed={4} look={BOLT_R.look} poseOverride={finishPose(f)} position={[0, 0.9, 0]} heading={0} />
      <ToyPerson f={f} seed={5} look={RUNNERS[4].look} pose="stand" position={[-1.15, 0.6, 0]} heading={0.25} />
      <ToyPerson f={f} seed={6} look={RUNNERS[2].look} pose="stand" position={[1.15, 0.4, 0]} heading={-0.25} />
      <Board position={[0, 2.55, -2.3]} w={2.6} h={1.3} lines={board} />
      <group position={[2.7, 0, -1.6]} scale={cab + 0.0001}>
        <Model id="trophy-cabinet-e963ac" height={1.7} rotation={[0, -0.5, 0]} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- HUD
const Timer: React.FC<{ value: string; label?: string; color?: string; k: number; top?: number; size?: number }> = ({ value, label, color = "#fff", k, top = 260, size = 190 }) =>
  k > 0 ? (
    <div style={{ position: "absolute", left: 40, right: 40, top, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${0.9 + 0.1 * k})` }}>
      <div style={{ textAlign: "center", background: "rgba(14,20,29,.72)", borderRadius: 22, padding: "14px 34px 18px" }}>
      <div style={{ fontFamily: FONT.display, fontSize: size, lineHeight: 1, color, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>{value}</div>
      {label ? <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 44, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.8)", marginTop: 6 }}>{label}</div> : null}
      </div>
    </div>
  ) : null;

const Chip: React.FC<{ text: string; k: number; top?: number; bg?: string; color?: string; rot?: number }> = ({ text, k, top = 260, bg = TP.paperCard, color = "#181a1b", rot = -2 }) =>
  k > 0 ? (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ background: bg, color, fontFamily: FONT.sans, fontWeight: 700, fontSize: 42, letterSpacing: 2, padding: "10px 24px", textAlign: "center", transform: `rotate(${rot}deg) translateY(${(1 - k) * 20}px)`, boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}>{text}</div>
    </div>
  ) : null;

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const els: React.ReactNode[] = [];
  const chip = (text: string, a: number, b: number, top = 260, bg?: string, color?: string) => <Chip key={text} text={text} k={pop(t, a, b)} top={top} bg={bg} color={color} />;
  if (t < CUT.s2) {
    const cover = 1 - seg(t, 0.9, 1.25);
    if (cover > 0) els.push(<div key="cov" style={{ opacity: cover }}><CoverText /></div>);
    const rc = Math.min(9.58, raceS1(t));
    const done = rc >= 9.58;
    els.push(<Timer key="tm" value={fmt(rc)} label={done ? "DETIK · REKOR DUNIA" : "DETIK"} color={done ? COL.bolt : "#fff"} k={seg(t, 1.0, 1.25)} />);
    els.push(chip("START LAMBAT…", 2.5, 5.6, 560));
    els.push(chip("REKOR DUNIA 17 TAHUN", 5.6, CUT.s2, 560, COL.bolt));
  } else if (t < CUT.s3) {
    els.push(chip("BERLIN · 16 AGUSTUS 2009", CUT.s2 + 0.3, 15.3));
    els.push(chip("STADION OWENS · OLIMPIADE 1936", 15.3, 19.0));
    els.push(chip("USAIN BOLT · 22 TAHUN", 19.0, CUT.s3, 260, COL.bolt));
    els.push(<Timer key="969" value="9,69" label="REKOR DUNIA · BEIJING 2008" k={pop(t, 23.1, CUT.s3)} top={380} size={160} />);
  } else if (t < CUT.s4) {
    const rc = Math.min(9.58, raceS3(t));
    els.push(<Timer key="rc" value={fmt(rc)} label="SLOW MOTION" color={rc >= 9.58 ? COL.bolt : "#fff"} k={seg(t, 25.4, 25.7)} top={900} size={120} />);
    els.push(chip("REAKSI 0,146 DTK · TERMASUK PALING LAMBAT", 26.5, 30.0));
    els.push(chip("20 M: UNGGUL TIPIS", 30.1, 32.7));
    els.push(chip("±30 M: MEMIMPIN", 32.7, 36.9));
    els.push(chip("60 M · 6,31 DTK", 37.0, 40.2));
    els.push(chip("80 M · 7,92 DTK", 40.3, 41.9));
    els.push(chip("LARI PENUH SAMPAI GARIS", 42.0, CUT.s4, 260, COL.bolt));
  } else if (t < CUT.s5) {
    els.push(chip("RAHASIANYA: LANGKAH", CUT.s4 + 0.3, 46.6));
    els.push(chip("BOLT ±41 LANGKAH / 100 M", 48.9, 50.7, 260, COL.bolt));
    els.push(chip("2,47 M PER LANGKAH", 50.7, 53.4, 260, COL.bolt));
    els.push(chip("LAWAN ±45 LANGKAH", 53.4, 56.9, 260, "#9fb1e6"));
    els.push(<Timer key="spd" value="44,72" label="KM/JAM · RATA-RATA 60–80 M" color={COL.bolt} k={pop(t, 60.2, CUT.s5)} top={260} size={170} />);
    els.push(chip("BUKAN KECEPATAN PUNCAK", 60.8, CUT.s5, 560, COL.red, "#fff"));
  } else if (t < CUT.s6) {
    const a = pop(t, 63.3, 69.9);
    if (a > 0)
      els.push(
        <div key="split" style={{ position: "absolute", left: 50, right: 50, top: 250, display: "flex", justifyContent: "space-around", opacity: a, background: "rgba(14,20,29,.9)", borderRadius: 22, padding: "16px 0 20px" }}>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: COL.bolt }}>9,58</div>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36 }}>BOLT</div>
          </div>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: "#9fb1e6" }}>9,71</div>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36 }}>GAY · JUARA BERTAHAN</div>
          </div>
        </div>,
      );
    els.push(chip("SELISIH −0,13 DETIK", 68.3, 69.9, 520, COL.red, "#fff"));
    els.push(<Timer key="011" value="−0,11" label="TERBESAR SEJAK ERA WAKTU ELEKTRONIK" color={COL.bolt} k={pop(t, 70.5, 76.4)} top={260} size={170} />);
    els.push(<Timer key="1919" value="19,19" label="200 M · 4 HARI KEMUDIAN" color={COL.bolt} k={pop(t, 78.6, CUT.s6)} top={260} size={170} />);
    els.push(chip("DUA-DUANYA MASIH REKOR DUNIA · 2026", 81.2, CUT.s6, 560, COL.bolt));
  } else {
    els.push(
      <div key="q" style={{ position: "absolute", left: 60, right: 60, top: 560, textAlign: "center", opacity: pop(t, CUT.s6 + 0.3) }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 44, color: COL.bolt, letterSpacing: 3 }}>9,58 · SEJAK 2009</div>
        <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>KAPAN PECAH?</div>
      </div>,
    );
    els.push(chip("TULIS DI KOMENTAR", 85.4, 1e9, 860, COL.bolt));
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
            <span key={i} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 54, color: active ? COL.bolt : "#fff", marginRight: "0.4em", display: "inline-block", transform: active ? "scale(1.04)" : "none", textShadow: "0 3px 10px rgba(0,0,0,.7)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- cameras
const A = COVER_CAMS.A;
const Z4 = laneZ(BOLT_R.lane);
const track = (rt: number, side: number, h: number, dz: number, fov = 32): Cam => {
  const bx = boltX(rt);
  return { pos: [bx + side, h, dz], target: [bx + side * 0.5, 0.55, Z4 - 0.4], fov };
};
const CAMS: Record<string, Key[]> = {
  s2: [
    { t: CUT.s2, pos: [-19.0, 4.4, 11.5], target: [-26.6, 0.6, 0.6], fov: 32 },
    { t: 14.6, pos: [-20.6, 3.6, 10.6], target: [-26.9, 0.6, 0.4], fov: 32 },
    { t: 15.6, pos: [-22.0, 2.9, 15.0], target: [-24, 1.2, 4.4], fov: 32 },
    { t: 18.6, pos: [-23.0, 2.6, 14.2], target: [-24.2, 1.15, 4.4], fov: 32 },
    { t: 20.2, pos: [-25.0, 1.5, 6.2], target: [-27.6, 0.4, Z4], fov: 32 },
    { t: CUT.s3, pos: [-26.0, 1.25, 4.6], target: [-27.6, 0.35, Z4], fov: 32 },
  ],
  s4: [
    { t: CUT.s4, pos: [0, 13.5, 3.2], target: [0, 0, 0], fov: 32 },
    { t: 50.3, pos: [0, 12.8, 2.6], target: [0, 0, -0.1], fov: 32 },
    { t: 51.2, pos: [0.4, 2.3, 9.2], target: [0, 0.75, 4.5], fov: 32 },
    { t: 53.0, pos: [-0.4, 2.1, 8.9], target: [0, 0.7, 4.5], fov: 32 },
    { t: 53.9, pos: [0, 13.5, 3.2], target: [0, 0, 0], fov: 32 },
    { t: 56.6, pos: [0, 12.8, 2.4], target: [0, 0, -0.2], fov: 32 },
    { t: 57.6, pos: [0, 2.0, 2.2], target: [0, 1.1, -5], fov: 32 },
    { t: CUT.s5, pos: [0.3, 1.8, 1.6], target: [0, 1.15, -5], fov: 32 },
  ],
  s5: [
    { t: CUT.s5, pos: [0.8, 1.5, 6.6], target: [0, 1.2, 0], fov: 32 },
    { t: 69.6, pos: [-0.4, 2.0, 6.4], target: [0, 1.6, -0.6], fov: 32 },
    { t: 70.6, pos: [-0.6, 2.2, 7.6], target: [0, 1.9, -2.3], fov: 32 },
    { t: 76.2, pos: [0.4, 2.2, 7.3], target: [0, 1.9, -2.3], fov: 32 },
    { t: 77.4, pos: [3.6, 1.9, 3.6], target: [2.6, 1.2, -1.6], fov: 32 },
    { t: 80.6, pos: [3.2, 2.0, 3.2], target: [2.6, 1.3, -1.6], fov: 32 },
    { t: CUT.s6, pos: [0.6, 3.0, 8.6], target: [0.6, 1.3, -0.8], fov: 32 },
  ],
  s6: [
    { t: CUT.s6, pos: [FINISH_X + 4.0, 1.3, 4.6], target: [FINISH_X - 5, 0.5, 0], fov: 32 },
    { t: TOTAL, pos: [FINISH_X + 1.6, 2.4, 2.6], target: [FINISH_X - 9, 0.4, 0], fov: 32 },
  ],
};

const sceneOf = (t: number) => (t < CUT.s2 ? "s1" : t < CUT.s3 ? "s2" : t < CUT.s4 ? "s3" : t < CUT.s5 ? "s4" : t < CUT.s6 ? "s5" : "s6");

const camFor = (sc: string, t: number): Cam => {
  if (sc === "s1") {
    const rc = raceS1(t);
    const follow = track(Math.min(rc, 10.4), 1.2, 1.9, 8.8);
    return mix(A, follow, ease(seg(t, 0.9, 2.6)));
  }
  if (sc === "s3") {
    const rc = raceS3(t);
    const side = track(Math.min(rc, 10.2), 0.6, 1.8, 8.2);
    const bx = boltX(Math.min(rc, 10.2));
    const front: Cam = { pos: [bx + 4.4, 1.5, Z4 + 4.8], target: [bx - 0.2, 0.62, Z4 - 0.2], fov: 32 };
    const follow = mix(side, front, ease(seg(t, 37.6, 39.4)));
    const from: Cam = { pos: [-26.0, 1.25, 4.6], target: [-27.6, 0.35, Z4], fov: 32 };
    return mix(from, follow, ease(seg(t, CUT.s3, 26.6)));
  }
  return camAt(t, CAMS[sc]);
};

// ---------------------------------------------------------------- warm key that follows Bolt (separates him from the pack)
const SubjectSpot: React.FC<{ x: number }> = ({ x }) => {
  const target = React.useMemo(() => new THREE.Object3D(), []);
  target.position.set(x + 0.3, 0.5, Z4);
  target.updateMatrixWorld();
  return (
    <>
      <primitive object={target} />
      <spotLight position={[x + 2.2, 6.5, Z4 + 4.5]} target={target} intensity={70} angle={0.3} penumbra={0.55} color="#ffd59a" distance={16} decay={1.4} />
      <pointLight position={[x - 1.4, 1.4, Z4 - 1.2]} intensity={5} distance={3.5} decay={1.6} color="#ffb867" />
    </>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const sc = sceneOf(t);
  const cam = camFor(sc, t);
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  const stadium = sc === "s1" || sc === "s2" || sc === "s3" || sc === "s6";
  const rc = sc === "s1" ? raceS1(t) : sc === "s3" ? raceS3(t) : 0;
  const passed = S3_MARKERS.filter((m) => distAt(BOLT_R, rc) >= m).pop();
  const cuts = [CUT.s2, CUT.s3, CUT.s4, CUT.s5, CUT.s6];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.12)) * 0.5;
  const light = sc === "s4" ? { amb: 0.2, key: 1.6 } : sc === "s5" ? { amb: 0.22, key: 1.9, keyColor: "#ffc27a" } : sc === "s6" ? { amb: 0.3, key: 2.0, keyColor: "#ffd59a" } : { amb: 0.35, key: 2.4 };
  return (
    <AbsoluteFill style={{ background: TP.stageBackdrop }}>
      <Audio src={staticFile("audio/ep06/vo.wav")} />
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 90 }}>
        <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />
        <Lights amb={light.amb} sun={light.key} keyColor={light.keyColor} />
        <fog attach="fog" args={[TP.stageBackdrop, stadium ? 26 : 12, stadium ? 60 : 26]} />
        {stadium && (
          <Stadium
            f={f}
            rt={rc}
            runners={sc !== "s6"}
            crouch={sc === "s2"}
            markers={sc === "s3" ? S3_MARKERS : []}
            glowMarker={passed}
            tape={(sc === "s1" || sc === "s3") && rc >= 9.58 ? 0 : 1}
          />
        )}
        {(sc === "s1" || sc === "s2" || sc === "s3") && <SubjectSpot x={sc === "s2" ? START_X : boltX(rc)} />}
        {sc === "s2" && <Board position={[-24, 1.35, 4.4]} w={2.9} h={0.9} lines={[{ text: "OWENS · OLIMPIADE 1936", size: 0.19, y: 0.16 }, { text: "BERLIN · STADION YANG SAMA", size: 0.14, color: "#5a4a3a", y: -0.18 }]} />}
        {sc === "s4" && (
          <>
            <MeasureTable f={f} t={t} />
            <spotLight position={[0.6, 6.5, 2.6]} target-position={[0, 0, 0]} intensity={60} angle={0.55} penumbra={0.6} color="#ffe2b8" />
          </>
        )}
        {sc === "s5" && (
          <>
            <Podium f={f} t={t} />
            <spotLight position={[0.6, 5.5, 2.6]} intensity={55} angle={0.42} penumbra={0.55} color="#ffe2b8" />
            <pointLight position={[2.4, 1.9, -0.4]} intensity={6} distance={3} decay={1.6} color="#ffd59a" />
          </>
        )}
        <Finish frame={frame} background={TP.stageBackdrop} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} focus={focus} aperture={0.0025} maxBlur={0.009} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 64% 42% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 44%, rgba(8,10,16,.55) 78%, rgba(8,10,16,.82) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(14,20,29,.7) 0%, rgba(14,20,29,.25) 65%, rgba(14,20,29,0) 100%)" }} />
        <Hud t={t} />
        <Captions t={t} />
      </div>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};

export { START_X };
