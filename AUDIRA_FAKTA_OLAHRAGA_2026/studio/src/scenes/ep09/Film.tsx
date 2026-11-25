// EP09 film "Tim Bobsled Jamaika, Calgary 1988" (CINESTORY). Seven locations, motivated film light, cuts on VO beats:
//   S1 hook          ice track at night: the sled runs into the KREISEL bank and tips over (±130 km/jam)
//   S2 konteks       Kingston beach 1987: pushcart derby down a sloped street, army truck + recruits
//   S3 pengembangan  Calgary snow stage: two-man run (ke-30 dari 41), injured pusher, Chris Stokes walks in
//   S4 penjelasan    28 Feb 1988: start push, tracking run, crash in the KREISEL curve, helmets on the ice
//   S5 kontras       the four WALK beside their sled past the FINISH arch (no carrying, no pushing), TV crowd
//   S6 payoff        Lillehammer 1994: scoreboard 14 JAMAIKA 3:29,96 / 15 USA 1 3:29,97, 0,01 detik
//   S7 outro         sled at rest, team standing; "kembali 2022 · 2026"; teaser (AUDIRA card comes from Root)
// Facts only from research/SOURCE_REGISTER.md. Generic stylized people (no likeness of the real athletes), no film material.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Object3D } from "three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { CinePerson as ToyPerson } from "./cine/CinePerson.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { CINE } from "./cine/look.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { Athlete, Beach, Bobsled, CrashTrack, IceTrack, JAM, SnowStage, Spray, sledRun } from "./Set.tsx";
import { Model } from "./Model.tsx";
import { CoverText, NIGHT } from "./Cover.tsx";
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
  s2: W("hook", "negara") - 0.3,
  s3: SEC("pengembangan").start - 0.3,
  s4: SEC("penjelasan").start - 0.3,
  s5: SEC("kontras").start - 0.3,
  s6: SEC("payoff").start - 0.3,
  s7: SEC("outro").start - 0.3,
};
const BEAT = {
  speed: W("hook", "130"),
  crash1: W("hook", "terguling"),
  kingston: W("konteks", "Kingston"),
  americans: W("konteks", "Dua"),
  derby: W("konteks", "balap"),
  ad: W("konteks", "Iklan"),
  army: W("konteks", "tentara"),
  debut: W("pengembangan", "Debut"),
  twoMan: W("pengembangan", "Di"),
  rank30: W("pengembangan", "ke-30"),
  injured: W("pengembangan", "pendorong"),
  stokes: W("pengembangan", "Penggantinya"),
  never: W("pengembangan", "belum"),
  lastDay: W("penjelasan", "hari"),
  run3: W("penjelasan", "Run"),
  start: W("penjelasan", "Start"),
  seventh: W("penjelasan", "ketujuh"),
  kreisel: W("penjelasan", "Kreisel"),
  crash2: W("penjelasan", "terguling"),
  helmet: W("penjelasan", "Helm"),
  noInjury: W("kontras", "cedera"),
  out: W("kontras", "Keempatnya"),
  walk: W("kontras", "berjalan"),
  millions: W("kontras", "Jutaan"),
  result: W("kontras", "Hasil"),
  lille: W("payoff", "Lillehammer"),
  rank14: W("payoff", "ke-14"),
  usa: W("payoff", "Amerika"),
  gap: W("payoff", "0,01"),
  medal: W("outro", "Mereka"),
  back: W("outro", "2022"),
};

// ---------------------------------------------------------------- math
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
type Cam = { pos: V3; target: V3; fov?: number };
type Key = Cam & { t: number };
const camAt = (t: number, ks: Key[]): Cam => {
  if (t <= ks[0].t) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t <= b.t) {
      const k = ease(seg(t, a.t, b.t));
      return { pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov ?? 38, b.fov ?? 38, k) };
    }
  }
  return ks[ks.length - 1];
};
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov ?? 38, b.fov ?? 38, k) });

// ---------------------------------------------------------------- backdrop
const Sky: React.FC<{ color: string }> = ({ color }) => (
  <mesh position={[0, 6, -24]}>
    <planeGeometry args={[120, 50]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

/** Paper sign on two dowels (in-world text). */
const Board: React.FC<{ position: V3; text: string; w?: number; size?: number; post?: number; bg?: string; color?: string; rotation?: V3 }> = ({ position, text, w = 1.8, size = 0.2, post = 1.2, bg = CINE.signPaint.color, color = CINE.signText, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <RoundedBoxGeo args={[w, size * 2.1, 0.06]} radius={0.03} />
      <meshPhysicalMaterial {...CINE.signPaint} color={bg} />
    </mesh>
    <SceneText position={[0, 0, 0.04]} fontSize={size} color={color} anchorX="center" anchorY="middle">
      {text}
    </SceneText>
    {post > 0 &&
      [-w * 0.42, w * 0.42].map((x) => (
        <mesh key={x} position={[x, -post / 2, -0.02]}>
          <cylinderGeometry args={[0.03, 0.03, post, 8]} />
          <meshStandardMaterial {...CINE.steel} />
        </mesh>
      ))}
  </group>
);

// ---------------------------------------------------------------- S1 / S4 crash run
const CrashRun: React.FC<{ f: number; t: number; tCrash: number; fromStand?: boolean }> = ({ f, t, tCrash, fromStand = false }) => {
  const s = sledRun(t, tCrash, fromStand);
  // S4 start: four athletes push beside the sled, then jump in (helmets appear)
  const tStart = tCrash - 1.2 - 4.5;
  const boarded = !fromStand || t > tStart + 1.6;
  return (
    <group>
      <CrashTrack />
      {fromStand && <Board position={[-6.6, 1.35, -1.0]} text="START" w={1.2} size={0.16} post={1.35} />}
      <Bobsled position={[s.x, s.y, s.z]} roll={s.roll} riders={boarded ? 4 : 0} />
      <Spray origin={[s.x + 0.3, 0.05, s.z]} k={seg(t, tCrash + 0.3, tCrash + 1.3)} />
      {!boarded &&
        [
          [-1.05, 0.22],
          [-1.05, -0.22],
          [-0.45, 0.42],
          [-0.45, -0.42],
        ].map(([dx, z], i) => (
          <Athlete key={i} f={f} seed={90 + i} position={[s.x + dx, 0, z]} heading={Math.PI / 2} pose={t > tStart ? "walk" : "stand"} />
        ))}
    </group>
  );
};

// ---------------------------------------------------------------- S2 Kingston
const Kingston: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const cartK = ease(seg(t, BEAT.derby, BEAT.derby + 3.2));
  const truckK = ease(seg(t, BEAT.army - 1.0, BEAT.army + 0.6));
  const recruits = seg(t, BEAT.army - 0.2, BEAT.army + 0.4);
  return (
    <group>
      <Beach t={t} cartK={cartK} />
      {/* the four Jamaican sprinters on the beach, in tees, from the first S2 frame until the derby */}
      {t < BEAT.derby - 0.3 &&
        ([[-0.95, 2.05, 0.45, "stand"], [0.0, 1.35, -0.15, "walk"], [0.85, 0.8, -0.5, "wave"], [1.6, 0.2, -0.9, "stand"]] as const).map(([x, z, h, pose], i) => (
          <Athlete key={i} f={f} seed={40 + i} position={[x, 0, z]} heading={h} pose={pose === "wave" && t < BEAT.kingston ? "stand" : pose} look={{ tee: true, cap: undefined, top: i % 2 ? JAM.yellow : JAM.green }} />
        ))}
      {/* two Jamaican sprinters run behind the pushcart in the derby */}
      {t > BEAT.derby - 0.3 && t < BEAT.army - 0.4 &&
        [0.32, -0.32].map((z, i) => (
          <Athlete key={i} f={f} seed={56 + i} position={[-2.8 + cartK * 5.2 - 0.75 - i * 0.35, 0.12, z]} heading={cartK < 1 ? Math.PI / 2 : 0.3} pose={cartK < 1 ? "walk" : "cheer"} />
        ))}
      {/* two Americans watching the derby */}
      {t > BEAT.americans - 0.3 && (
        <>
          <ToyPerson f={f} seed={51} pose="stand" look={{ top: "#e9e2d0", bottom: "#4a5a72", outfit: "casual", hairStyle: 1 }} position={[2.7, 0, 1.75]} heading={-2.6} />
          <ToyPerson f={f} seed={52} pose={t > BEAT.derby + 2 ? "cheer" : "stand"} look={{ top: "#7aa0c8", bottom: "#3a3a3a", outfit: "casual", hairStyle: 3 }} position={[3.3, 0, 1.55]} heading={-2.4} />
        </>
      )}
      {/* sign: Kingston 1987 */}
      <Board position={[-2.3, 1.15, 1.6]} text="KINGSTON 1987" w={1.7} size={0.15} post={1.15} rotation={[0, 0.35, 0]} />
      {/* army truck drives in, three recruits in olive */}
      <Model id="military-cargo-truck-652f66" position={[lerp(-9, -1.6, truckK), 0, -1.15]} height={1.05} rotation={[0, Math.PI / 2, 0]} />
      {recruits > 0 &&
        [-0.4, 0.3, 1.0].map((x, i) => (
          <ToyPerson key={i} f={f} seed={60 + i} pose="stand" look={{ top: "#5d6b3a", bottom: "#4a5230", outfit: "casual", hairStyle: 2, cap: "#4a5230" }} position={[x + 1.2, 0, -0.05 + (1 - recruits) * -0.4]} heading={0.1} />
        ))}
    </group>
  );
};

// ---------------------------------------------------------------- S3 Calgary
const Calgary: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const runK = seg(t, BEAT.twoMan - 0.2, BEAT.injured - 0.6);
  const lineup = t > BEAT.injured - 0.6;
  const sledX = lineup ? 0 : lerp(-7, 7, runK);
  const stokesIn = ease(seg(t, BEAT.stokes, BEAT.stokes + 2.2));
  return (
    <group>
      <SnowStage />
      <IceTrack x0={-8} x1={8} sign="CALGARY 1988" />
      <Model id="snow-capped-log-pile-8719e7" position={[-2.2, 0, 1.5]} height={0.35} />
      <Bobsled position={[sledX, 0, 0]} riders={lineup ? 0 : 2} />
      {lineup && (
        <>
          <Athlete f={f} seed={71} position={[-0.9, 0, 1.15]} />
          <Athlete f={f} seed={72} position={[-0.2, 0, 1.2]} />
          <Athlete f={f} seed={73} position={[0.5, 0, 1.15]} />
          {/* the injured pusher sits on the log pile */}
          <Athlete f={f} seed={74} position={[-2.2, 0.36, 1.5]} pose={t > BEAT.injured ? "sit" : "stand"} heading={0.4} />
          {/* Chris Stokes walks in from the right in a spectator jacket */}
          {t > BEAT.stokes - 0.2 && (
            <ToyPerson f={f} seed={75} pose={stokesIn < 1 ? "walk" : "wave"} look={{ top: "#c84a2c", bottom: "#2b2f36", outfit: "casual", hairStyle: 2 }} position={[lerp(4.2, 1.25, stokesIn), 0, 1.2]} heading={stokesIn < 1 ? -Math.PI / 2 : 0} />
          )}
        </>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- S5 finish
const FinishArch: React.FC = () => (
  <group position={[1.8, 0, 0]}>
    {[1.45, -1.45].map((z) => (
      <mesh key={z} position={[0, 0.95, z]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.9, 10]} />
        <meshStandardMaterial {...CINE.steel} />
      </mesh>
    ))}
    <group position={[0, 1.85, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <RoundedBoxGeo args={[3.1, 0.42, 0.07]} radius={0.03} />
        <meshPhysicalMaterial color="#f1efe8" roughness={0.6} />
      </mesh>
      <SceneText position={[0, 0, 0.045]} fontSize={0.26} color="#c22a1e" anchorX="center" anchorY="middle">
        FINISH
      </SceneText>
      <mesh position={[0, -0.36, 0]}>
        <RoundedBoxGeo args={[1.1, 0.24, 0.05]} radius={0.02} />
        <meshPhysicalMaterial {...CINE.paint} color={JAM.black} />
      </mesh>
      <SceneText position={[0, -0.36, 0.035]} fontSize={0.13} color={JAM.yellow} anchorX="center" anchorY="middle">
        AUDIRA
      </SceneText>
    </group>
  </group>
);

const FinishWalk: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const k = seg(t, BEAT.walk - 0.4, BEAT.millions);
  const sledX = lerp(-2.8, 2.6, k);
  const walking = k > 0 && k < 1;
  const out = t > BEAT.out;
  return (
    <group>
      <SnowStage />
      <IceTrack x0={-8} x1={8} />
      <Model id="grandstand-seating-run-fc9023" position={[-0.4, 0, -2.7]} height={1.2} />
      <Model id="scaffold-camera-platform-b6702c" position={[-4.4, 0, -2.2]} height={1.6} />
      <FinishArch />
      {/* the sled slides on its side; the team walks beside it on the track edge, hands free */}
      <Bobsled position={[sledX, 0.06, -0.1]} roll={2.4} riders={out ? 0 : 4} />
      {out &&
        ([[-1.5, 1.7, "stand"], [-0.55, 1.05, "wave"], [0.35, 1.45, "cheer"], [1.25, 0.95, "stand"]] as const).map(([dx, z, after], i) => (
          <Athlete key={i} f={f} seed={80 + i} position={[sledX + dx, 0, z]} heading={walking ? Math.PI / 2 : 0.5 - i * 0.3} pose={walking ? "walk" : t > BEAT.millions ? after : "stand"} />
        ))}
    </group>
  );
};

// ---------------------------------------------------------------- S6 Lillehammer scoreboard
const Scoreboard: React.FC<{ hi: number }> = ({ hi }) => (
  <group position={[0, 1.15, -2.0]}>
    <mesh castShadow>
      <RoundedBoxGeo args={[3.6, 1.6, 0.1]} radius={0.05} />
      <meshPhysicalMaterial {...CINE.paint} color="#15191f" />
    </mesh>
    <SceneText position={[0, 0.55, 0.06]} fontSize={0.17} color="#f4f1e6" anchorX="center" anchorY="middle">
      LILLEHAMMER 1994 · FOUR-MAN
    </SceneText>
    <mesh position={[0, 0.1, 0.055]}>
      <boxGeometry args={[3.3, 0.36, 0.01]} />
      <meshStandardMaterial color={JAM.yellow} emissive={JAM.yellow} emissiveIntensity={0.25 + hi * 0.5} />
    </mesh>
    <SceneText position={[0, 0.1, 0.07]} fontSize={0.21} color={JAM.black} anchorX="center" anchorY="middle">
      14   JAMAIKA        3:29,96
    </SceneText>
    <SceneText position={[0, -0.35, 0.07]} fontSize={0.21} color="#c9ced4" anchorX="center" anchorY="middle">
      15   USA 1           3:29,97
    </SceneText>
    {[-1.4, 1.4].map((x) => (
      <mesh key={x} position={[x, -1.0, -0.03]}>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
        <meshStandardMaterial color="#5a6270" metalness={0.5} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const s6SledX = (t: number) => lerp(-8.5, 0, easeOut(seg(t, CUT.s6, BEAT.rank14)));
const Lillehammer: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const x = s6SledX(t);
  const team = t > BEAT.rank14 - 0.2;
  return (
    <group>
      <SnowStage pines={[[-5, 0, -2.8], [-3.4, 0, -3.3], [3.4, 0, -3.2], [5.0, 0, -2.7], [6.6, 0, -3.1], [-6.6, 0, -3.0], [2.3, 0, -3.6], [-2.4, 0, -3.7]]} />
      <IceTrack x0={-8} x1={8} />
      <Scoreboard hi={seg(t, BEAT.rank14, BEAT.rank14 + 0.5)} />
      <Model id="floodlight-mast-4482be" position={[-3.6, 0, -3.4]} height={4.2} />
      <Model id="floodlight-mast-4482be" position={[3.8, 0, -3.2]} height={4.2} />
      <Bobsled position={[x, 0, 0.25]} riders={team ? 0 : 4} />
      {team &&
        [-1.3, -0.85, 0.85, 1.3].map((dx, i) => (
          <Athlete key={i} f={f} seed={110 + i} position={[dx, 0, 1.15]} heading={-dx * 0.2} pose={t > BEAT.gap ? "cheer" : "stand"} />
        ))}
    </group>
  );
};

// ---------------------------------------------------------------- S7 outro
const Outro: React.FC<{ f: number; t: number }> = ({ f, t }) => (
  <group>
    <SnowStage />
    <Model id="snow-capped-log-pile-8719e7" position={[2.4, 0, -0.9]} height={0.4} />
    <Model id="piste-marker-pole-7480c3" position={[-1.8, 0, 0.9]} height={0.7} />
    <Model id="piste-marker-pole-7480c3" position={[1.9, 0, 0.9]} height={0.7} />
    <Bobsled position={[0, 0, -0.2]} riders={0} />
    <Athlete f={f} seed={100} position={[-0.45, 0.42, -0.2]} pose="sit" heading={0.2} />
    <Athlete f={f} seed={101} position={[1.25, 0, 0.25]} pose={t > BEAT.back ? "cheer" : "stand"} heading={-0.5} />
    <Athlete f={f} seed={102} position={[0.35, 0, -1.0]} pose={t > BEAT.back ? "cheer" : "wave"} heading={0.1} />
    <Athlete f={f} seed={103} position={[-1.55, 0, 1.35]} pose="stand" heading={0.7} />
    <Board position={[0, 1.3, -1.6]} text="2022 · 2026" w={1.6} size={0.18} post={1.3} />
  </group>
);

// ---------------------------------------------------------------- HUD
const Timer: React.FC<{ value: string; label?: string; color?: string; k: number; top?: number; size?: number }> = ({ value, label, color = "#fff", k, top = 330, size = 190 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: k, transform: `scale(${0.9 + 0.1 * k})` }}>
    <div style={{ fontFamily: FONT.display, fontSize: size, lineHeight: 1, color, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>{value}</div>
    {label ? <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.8)", marginTop: 6 }}>{label}</div> : null}
  </div>
);

const Chip: React.FC<{ text: string; k: number; top?: number; bg?: string; color?: string; rot?: number }> = ({ text, k, top = 330, bg = "#f4f1e6", color = "#181a1b", rot = -2 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, display: "flex", justifyContent: "center", opacity: k }}>
    <div style={{ background: bg, color, fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, letterSpacing: 2, padding: "10px 24px", textAlign: "center", transform: `rotate(${rot}deg) translateY(${(1 - k) * 20}px)`, boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}>{text}</div>
  </div>
);

const pop = (t: number, a: number, b = 1e9) => ease(seg(t, a, a + 0.25)) * (1 - seg(t, b - 0.2, b));
const RED = "#e2442f";

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const els: React.ReactNode[] = [];
  const chip = (text: string, a: number, b = 1e9, o: { top?: number; bg?: string; color?: string; rot?: number } = {}) => <Chip key={text} text={text} k={pop(t, a, b)} {...o} />;
  if (t < CUT.s2) {
    const cover = 1 - seg(t, 0.7, 1.0);
    if (cover > 0) els.push(<div key="cov" style={{ opacity: cover }}><CoverText /></div>);
    els.push(<Timer key="sp" value="±130" label="KM/JAM" color="#f2c230" top={560} size={170} k={pop(t, BEAT.speed, BEAT.crash1)} />);
    els.push(chip("TERGULING DI OLIMPIADE MUSIM DINGIN", BEAT.crash1, CUT.s2, { bg: RED, color: "#fff", rot: 2 }));
  } else if (t < CUT.s3) {
    els.push(chip("JAMAIKA · TROPIS · 0 SALJU", CUT.s2 + 0.3, BEAT.kingston));
    els.push(chip("KINGSTON · 1987", BEAT.kingston, BEAT.americans));
    els.push(chip("2 ORANG AMERIKA MENONTON", BEAT.americans, BEAT.derby));
    els.push(chip("BALAP KERETA DORONG KAYU", BEAT.derby, BEAT.ad));
    els.push(chip("IKLAN SELEKSI: GAGAL", BEAT.ad, BEAT.army, { bg: RED, color: "#fff", rot: 2 }));
    els.push(chip("REKRUT TENTARA · 1 PILOT HELIKOPTER", BEAT.army));
  } else if (t < CUT.s4) {
    els.push(chip("CALGARY · FEBRUARI 1988", CUT.s3 + 0.3, BEAT.debut));
    els.push(chip("DEBUT OLIMPIADE MUSIM DINGIN", BEAT.debut, BEAT.twoMan));
    els.push(chip("NOMOR DUA ORANG", BEAT.twoMan, BEAT.rank30));
    els.push(<Timer key="r30" value="KE-30" label="DARI 41 KERETA" color="#f2c230" k={pop(t, BEAT.rank30, BEAT.injured - 0.3)} size={170} />);
    els.push(chip("1 PENDORONG CEDERA", BEAT.injured, BEAT.stokes, { bg: RED, color: "#fff", rot: 2 }));
    els.push(chip("PENGGANTI: CHRIS STOKES", BEAT.stokes, BEAT.never));
    els.push(chip("BELUM PERNAH NAIK BOBSLED", BEAT.never, 1e9, { bg: JAM.yellow }));
  } else if (t < CUT.s5) {
    els.push(chip("28 FEB 1988 · HARI TERAKHIR", BEAT.lastDay - 1.8, BEAT.run3));
    els.push(chip("RUN KE-3 · EMPAT ORANG", BEAT.run3, BEAT.start + 0.6));
    els.push(<Timer key="r7" value="KE-7" label="START TERCEPAT" color="#f2c230" k={pop(t, BEAT.seventh - 0.3, BEAT.kreisel)} size={170} />);
    els.push(chip("TIKUNGAN KREISEL", BEAT.kreisel, BEAT.crash2));
    els.push(chip("KELUAR TERLALU TINGGI · TERGULING", BEAT.crash2, BEAT.helmet, { bg: RED, color: "#fff", rot: 2 }));
    els.push(chip("HELM TERGESEK DINDING ES", BEAT.helmet));
  } else if (t < CUT.s6) {
    els.push(chip("TAK ADA CEDERA SERIUS", BEAT.noInjury, BEAT.walk));
    els.push(chip("BERJALAN KE GARIS FINIS", BEAT.walk, BEAT.millions));
    els.push(chip("DISIARKAN KE JUTAAN PENONTON", BEAT.millions, BEAT.result));
    els.push(chip("HASIL RESMI: TIDAK FINIS", BEAT.result, 1e9, { bg: RED, color: "#fff", rot: 2 }));
  } else if (t < CUT.s7) {
    els.push(chip("6 TAHUN KEMUDIAN", CUT.s6 + 0.3, BEAT.lille));
    els.push(chip("LILLEHAMMER 1994", BEAT.lille, BEAT.rank14));
    els.push(<Timer key="r14" value="KE-14" label="DARI 30 KERETA" color="#f2c230" k={pop(t, BEAT.rank14, BEAT.usa)} size={170} />);
    els.push(chip("UNGGUL ATAS USA 1", BEAT.usa, BEAT.gap));
    els.push(<Timer key="gap" value="0,01" label="DETIK" color="#f2c230" k={pop(t, BEAT.gap)} size={200} />);
  } else {
    els.push(chip("BELUM ADA MEDALI · TAK PERNAH BERHENTI", BEAT.medal, BEAT.back));
    els.push(chip("TIM EMPAT ORANG KEMBALI: 2022 · 2026", BEAT.back, TOTAL - 4.4, { bg: JAM.yellow }));
    els.push(
      <div key="tz" style={{ position: "absolute", left: 60, right: 60, top: 560, textAlign: "center", opacity: pop(t, TOTAL - 4.3) }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 44, color: "#f2c230", letterSpacing: 3 }}>BERIKUTNYA</div>
        <div style={{ fontFamily: FONT.display, fontSize: 110, lineHeight: 1, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>WILT CHAMBERLAIN 100 POIN</div>
      </div>,
    );
  }
  return <>{els}</>;
};

// ---------------------------------------------------------------- captions (karaoke, y≈1260)
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

// ---------------------------------------------------------------- cameras
/** Rides alongside the sled, 3/4 from behind, then swings to the front as it hits the bank (bank + KREISEL sign in frame). */
/** S1 hook: low, long-lens, head-on from beyond the bank exit: the sled comes at the lens, climbs the wall, tips. */
const hookCam = (t: number, tCrash: number): Cam => {
  const s = sledRun(t, tCrash, false);
  const k = seg(t, 0, tCrash + 1.5);
  return { pos: [lerp(12.5, 10.8, k), 0.75, lerp(1.4, 1.0, k)], target: [lerp(s.x, 3.0, 0.25), 0.5, -0.5], fov: lerp(26, 34, ease(seg(t, tCrash - 1.2, tCrash + 0.6))) };
};

const trackCam = (t: number, tCrash: number, fromStand: boolean): Cam => {
  const s = sledRun(t, tCrash, fromStand);
  const behind: Cam = { pos: [s.x - 4.8, 2.4, 5.6], target: [s.x + 0.8, 0.5, -0.3], fov: 38 };
  // crash seen from a high crane over the track (S1 is low and head-on, so the two crashes never look alike)
  const front: Cam = { pos: [s.x + 0.3, 3.9, 4.6], target: [s.x + 0.05, 0.4, -0.45], fov: 40 };
  return mixCam(behind, front, ease(seg(t, tCrash - 1.6, tCrash + 0.4)));
};

const sceneOf = (t: number) => (t < CUT.s2 ? "s1" : t < CUT.s3 ? "s2" : t < CUT.s4 ? "s3" : t < CUT.s5 ? "s4" : t < CUT.s6 ? "s5" : t < CUT.s7 ? "s6" : "s7");

const camFor = (sc: string, t: number): Cam => {
  if (sc === "s1") return hookCam(t, BEAT.crash1);
  if (sc === "s2") {
    const base = camAt(t, [
      { t: CUT.s2, pos: [0.9, 1.5, 5.6], target: [0.3, 0.75, 1.4], fov: 36 },
      { t: BEAT.americans, pos: [1.6, 1.9, 6.8], target: [1.2, 0.7, 0.9] },
      { t: BEAT.army - 0.4, pos: [0.8, 2.6, 7.8], target: [0.2, 0.6, -0.4] },
      { t: CUT.s3, pos: [-0.6, 2.2, 6.6], target: [-0.4, 0.7, -0.4] },
    ]);
    // follow the pushcart down the sloped street during the derby beat
    const cx = -2.8 + ease(seg(t, BEAT.derby, BEAT.derby + 3.2)) * 5.2;
    const follow: Cam = { pos: [cx + 1.2, 2.5, 7.2], target: [cx + 0.2, 0.45, 0.4], fov: 38 };
    return mixCam(base, follow, ease(seg(t, BEAT.derby - 0.8, BEAT.derby)) * (1 - ease(seg(t, BEAT.army - 1.6, BEAT.army - 0.4))));
  }
  if (sc === "s3") {
    if (t < BEAT.twoMan - 0.2)
      return camAt(t, [
        { t: CUT.s3, pos: [0, 6.0, 9.0], target: [0, 0.8, -1.2] },
        { t: BEAT.twoMan - 0.2, pos: [-2.0, 2.8, 7.2], target: [-1.4, 0.8, -0.8] },
      ]);
    if (t < BEAT.injured - 0.6) {
      const x = lerp(-7, 7, seg(t, BEAT.twoMan - 0.2, BEAT.injured - 0.6));
      return { pos: [x - 4.4, 2.3, 5.6], target: [x + 0.8, 0.45, -0.2], fov: 38 };
    }
    return camAt(t, [
      { t: BEAT.injured - 0.6, pos: [-3.6, 2.4, 7.4], target: [-0.8, 0.6, 0.8] },
      { t: BEAT.stokes + 1.0, pos: [0.2, 2.3, 7.8], target: [0, 0.6, 0.8] },
      { t: CUT.s4, pos: [2.0, 2.4, 7.2], target: [0.4, 0.6, 0.8] },
    ]);
  }
  if (sc === "s4") {
    const stand = camAt(t, [
      { t: CUT.s4, pos: [-10.6, 2.8, 5.6], target: [-6.4, 0.6, -0.2] },
      { t: BEAT.start, pos: [-9.6, 2.2, 5.0], target: [-6.0, 0.5, -0.1] },
    ]);
    return mixCam(stand, trackCam(t, BEAT.crash2, true), ease(seg(t, BEAT.start, BEAT.start + 1.4)));
  }
  if (sc === "s5") {
    const sx = lerp(-2.8, 2.6, seg(t, BEAT.walk - 0.4, BEAT.millions));
    const o = camAt(t, [
      { t: CUT.s5, pos: [-2.2, 2.1, 7.4], target: [0.3, 0.65, 0.4] },
      { t: BEAT.walk, pos: [-1.2, 1.9, 7.4], target: [0.2, 0.7, 0.5] },
      { t: BEAT.millions, pos: [2.0, 2.1, 7.2], target: [-0.1, 0.75, 0.4] },
      { t: CUT.s6, pos: [1.4, 2.6, 7.8], target: [-0.2, 0.85, 0.3] },
    ]);
    return { pos: [o.pos[0] + sx, o.pos[1], o.pos[2]], target: [o.target[0] + sx, o.target[1], o.target[2]], fov: o.fov };
  }
  if (sc === "s6") {
    if (t < BEAT.lille + 1.0) {
      const x = s6SledX(t);
      return { pos: [x - 3.6, 1.6, 5.0], target: [x + 0.6, 0.55, 0.0], fov: 36 };
    }
    // scoreboard (3.6 m wide at z=-2) stays whole: ≥ 8 m away at fov 44
    return camAt(t, [
      { t: BEAT.lille + 1.0, pos: [-1.6, 2.0, 6.4], target: [0.6, 0.8, -1.0], fov: 40 },
      { t: BEAT.rank14, pos: [0, 1.3, 7.0], target: [0, 0.85, -1.4], fov: 50 },
      { t: BEAT.gap, pos: [0, 1.25, 6.8], target: [0, 0.85, -1.4], fov: 50 },
      { t: CUT.s7, pos: [0.4, 1.2, 6.6], target: [0, 0.85, -1.4], fov: 50 },
    ]);
  }
  return camAt(t, [
    { t: CUT.s7, pos: [2.4, 1.9, 7.4], target: [0, 0.6, 0.2] },
    { t: BEAT.back, pos: [-1.4, 2.4, 7.6], target: [0, 0.6, 0.1] },
    { t: TOTAL, pos: [0.6, 9.0, 7.0], target: [0, 0, -0.4] },
  ]);
};

/** Dolly in and drop the lens toward the subject (low angle), aim a little above it so the subject sits lower
 *  in the tall frame instead of floating over half a frame of empty snow. S6 keeps the whole scoreboard. */
const lowCam = (sc: string, c: Cam): Cam => {
  if (sc === "s6") return c;
  // S4 keeps its tracking distance (closer read as too fast in audit:camera); only the aim lifts a little
  if (sc === "s4") return { ...c, target: [c.target[0], c.target[1] + 0.3, c.target[2]] };
  // S4/S5 track the moving sled: a closer lens made the crash read too fast, so they keep more distance
  const k = sc === "s1" || sc === "s2" ? 0.88 : sc === "s4" || sc === "s5" ? 0.92 : 0.72;
  const ky = sc === "s1" ? 0.6 : sc === "s4" || sc === "s5" ? 0.62 : 0.45;
  const pos: V3 = [c.target[0] + (c.pos[0] - c.target[0]) * k, Math.max(0.35, c.target[1] + (c.pos[1] - c.target[1]) * ky), c.target[2] + (c.pos[2] - c.target[2]) * k];
  const dist = Math.hypot(pos[0] - c.target[0], pos[2] - c.target[2]);
  return { pos, target: [c.target[0], c.target[1] + dist * 0.07, c.target[2]], fov: c.fov };
};

// ---------------------------------------------------------------- foreground (lower-third FG)
/** Snow (or sand) drifts and two marker poles ~3.4 m in front of the lens, off-centre and DOF-blurred:
 *  fills the lower third with texture instead of an empty floor, never covers the subject. */
const ForeDrift: React.FC<{ cam: Cam; sand?: boolean }> = ({ cam, sand = false }) => {
  const dx = cam.target[0] - cam.pos[0], dz = cam.target[2] - cam.pos[2];
  const n = Math.hypot(dx, dz) || 1;
  const fx = dx / n, fz = dz / n;
  const d = 2.3;
  const yaw = Math.atan2(-fx, -fz);
  const mat = sand ? CINE.sand : CINE.snow;
  return (
    <group position={[cam.pos[0] + fx * d, 0, cam.pos[2] + fz * d]} rotation={[0, yaw, 0]}>
      {[[-1.25, 0.3, 0.5], [1.3, 0.26, 0.55], [-0.55, 0.12, 0.38], [0.7, 0.1, 0.34]].map(([x, h, r], i) => (
        <mesh key={i} position={[x, 0, i * 0.12]} scale={[r * 1.6, h, r]} receiveShadow>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial {...mat} color={sand ? CINE.sand.color : "#9fadbf"} />
        </mesh>
      ))}
      {!sand && <Model id="piste-marker-pole-7480c3" position={[-1.15, 0, -0.1]} height={0.95} />}
      {!sand && <Model id="snow-fence-run-55a09a" position={[1.1, 0, -0.35]} height={0.42} rotation={[0, 0.25, 0]} />}
      {!sand && <Model id="piste-marker-pole-7480c3" position={[1.25, 0, -0.2]} height={0.85} />}
    </group>
  );
};

/** Floodlight masts' light pools on the track at night: bright ellipses on the ice with dark gaps between (fixed in the world). */
const FloodPools: React.FC<{ xs: number[] }> = ({ xs }) => {
  const tg = React.useMemo(() => xs.map(() => new Object3D()), [xs.length]);
  return (
    <>
      {xs.map((x, i) => (
        <React.Fragment key={i}>
          <primitive object={tg[i]} position={[x, 0, 0.2]} />
          <spotLight target={tg[i]} position={[x - 0.6, 7.5, -2.5]} intensity={70} angle={0.3} penumbra={0.35} color="#fff1d6" />
        </React.Fragment>
      ))}
    </>
  );
};

/** Tight warm spot that pools on the subject (camera target). */
const SubjectSpot: React.FC<{ target: V3 }> = ({ target }) => {
  const tgt = React.useMemo(() => new Object3D(), []);
  return (
    <>
      <primitive object={tgt} position={target} />
      <spotLight target={tgt} position={[target[0] + 0.8, 6.5, target[2] + 3.2]} intensity={40} angle={0.36} penumbra={0.55} color="#ffe6bf" castShadow={false} />
    </>
  );
};

// ---------------------------------------------------------------- film
const SKY: Record<string, string> = { s1: NIGHT, s2: "#e7a46c", s3: "#8aa4bd", s4: NIGHT, s5: "#22324a", s6: "#2b2742", s7: "#2a3c56" };

export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const sc = sceneOf(t);
  const cam = lowCam(sc, camFor(sc, t));
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  const sky = SKY[sc];
  const day = sc === "s2" || sc === "s3";
  const cuts = [CUT.s2, CUT.s3, CUT.s4, CUT.s5, CUT.s6, CUT.s7];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.12)) * 0.5;
  return (
    <AbsoluteFill style={{ background: sky }}>
      <Audio src={staticFile("audio/ep09/vo.wav")} />
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov ?? 38, near: 0.1, far: 60 }}>
        <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov ?? 38} />
        <ambientLight intensity={day ? 0.1 : 0.05} color={sc === "s2" ? "#ffe2c0" : "#9fb4d6"} />
        {/* hard warm key from camera-left (long shadows), cold blue rim from behind the subject */}
        <directionalLight position={sc === "s2" ? [-7, 2.2, 3] : [-5, 5.5, 4]} intensity={sc === "s2" ? 3.4 : day ? 2.6 : 2.2} color={sc === "s2" ? "#ffa857" : "#ffd29a"} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
        <directionalLight position={[3, 3.5, -7]} intensity={sc === "s2" ? 1.2 : 3.2} color={sc === "s2" ? "#9ec4ff" : "#6f9dff"} />
        {(sc === "s1" || sc === "s4" || sc === "s5" || sc === "s6") && <FloodPools xs={sc === "s5" ? [-1.2, 2.4] : sc === "s6" ? [-2.2, 1.6] : [-3.4, 0.6, 4.2]} />}
        <SubjectSpot target={cam.target} />
        {sc !== "s6" && <ForeDrift cam={cam} sand={sc === "s2"} />}
        <fog attach="fog" args={[sky, 8, 25]} />
        <Sky color={sky} />
        {sc === "s1" && <CrashRun f={f} t={t} tCrash={BEAT.crash1} />}
        {sc === "s2" && <Kingston f={f} t={t} />}
        {sc === "s3" && <Calgary f={f} t={t} />}
        {sc === "s4" && <CrashRun f={f} t={t} tCrash={BEAT.crash2} fromStand />}
        {sc === "s5" && <FinishWalk f={f} t={t} />}
        {sc === "s6" && <Lillehammer f={f} t={t} />}
        {sc === "s7" && <Outro f={f} t={t} />}
        <Finish frame={frame} background={sky} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.3} focus={focus} aperture={0.004} maxBlur={0.012} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 64% 42% at 50% 47%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 44%, rgba(8,10,16,.18) 80%, rgba(8,10,16,.4) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(14,20,29,.55) 0%, rgba(14,20,29,.18) 65%, rgba(14,20,29,0) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, height: 540, background: "linear-gradient(180deg, rgba(14,20,29,0) 0%, rgba(14,20,29,.35) 60%, rgba(14,20,29,.55) 100%)" }} />
        <Hud t={t} />
        <Captions t={t} />
      </div>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
