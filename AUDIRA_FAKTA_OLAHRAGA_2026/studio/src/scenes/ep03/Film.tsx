// EP03 film "Tenis 11 Jam: Isner vs Mahut" (BROADCASTFORGE). Multi-scene director, every cut on the locked VO:
//   S1  HOOK      cover A frame: Isner's serve toss from behind, clock rolls to 8:11, pan to the frozen scoreboard, AUDIRA wall
//   S2  KONTEKS   virtual studio (kit recipe): jib down, AR pedestals ISNER / MAHUT, LED wall "SET 5 TANPA TIE-BREAK"
//   S3  PENGEMB.  broadcast wide: day 1 dusk falls to dark, day 2 afternoon, the fifth set ticks up
//   S4a PENGEMB.  courtside scoreboard close-up: 45, 46, 47–47, red glitch, dead screen
//   S4b PENGEMB.  wide night: 59–59, stopped a second time (crane up)
//   S5a PENJELAS. spot-lit server in profile, cyan ball trails, ace counters 113 / 103
//   S5b PENJELAS. top-down court at night: points 502 vs 478, "TETAP KALAH", game not points
//   S6  PAYOFF    day 3 sun: backhand passing shot, IMPACT 70–68, 11:05, 183 games
//   S7  PAYOFF    cold court: Isner on a bench, hand on his neck: round 2 lost in 74 min, 0 aces; Oct 2018 tie-break at 12–12
//   S8  OUTRO     golden hour, empty court, commemorative plaque + AUDIRA wall, EP04 teaser (AUDIRA card from Root)
// Facts on screen only from research/SOURCE_REGISTER.md. Players are stylised ToyPerson figures (no faces, no logos).
import React from "react";
import { Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { LEG_LENGTH, type Pose } from "../../core/polish/Person.tsx";
import { Glb } from "../_shared/Glb.tsx";
import { Ball, CourtSet, DuskLights, HALF_L, HALF_W, ISNER_LOOK, MAHUT_LOOK, Player, Racket, readyPose, servePose, type SkyColors } from "./court.tsx";
import { SHOT_A } from "./Cover.tsx";
import { StudioSet, type WallMode } from "./studio.tsx";
import { DurationClock, Headline, LiveBug, ScoreBug, Ticker } from "./hud.tsx";
import { Callout, Captions, Chip, Counter, Flash, SplitBar, Stamp, Stinger, Teaser, type CapWord } from "./overlays.tsx";
import { useDisplayFont } from "./fonts.ts";
import { B } from "./palette.ts";
import { CLIPS, CUT, CUTS, IMPACT, T, TOTAL, clamp, lerp, sceneAt, seg, type SceneId } from "./timing.ts";

export { TOTAL };
type V3 = [number, number, number];
const PS = 1.95;
const ISNER_POS: V3 = [1.5, 0, HALF_L + 0.35];
const lens = { focus: 10, aperture: 0, maxBlur: 0, exposure: 1.05 };

// ---------------------------------------------------------------- camera keys
type Key = { t: number; pos: V3; target: V3; fov: number };
const K = (t: number, pos: V3, target: V3, fov: number): Key => ({ t, pos, target, fov });
const sm = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
const l3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/**
 * Keyframed camera. Between keys the move is linear in the middle and eased only at the scene's
 * first and last key, so the camera never parks inside a scene; plus a slow deterministic drift.
 */
const camAt = (keys: Key[], t: number, drift = 0.03, seed = 1, exposure = 1.05): Shot => {
  const t0 = keys[0].t, t1 = keys[keys.length - 1].t;
  // global eased clock over the whole scene, then piecewise-linear through the keys
  const u = clamp((t - t0) / (t1 - t0));
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * u) * 0.35 + (u - 0.5) * 0.65; // gentle ease, never flat
  const tt = t0 + eased * (t1 - t0);
  let s = { pos: keys[0].pos, target: keys[0].target, fov: keys[0].fov };
  if (tt >= t1) s = keys[keys.length - 1];
  else
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (tt >= a.t && tt < b.t) {
        const k = sm((tt - a.t) / (b.t - a.t)) * 0.5 + ((tt - a.t) / (b.t - a.t)) * 0.5;
        s = { pos: l3(a.pos, b.pos, k), target: l3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) };
        break;
      }
    }
  const d = (f: number, p: number) => Math.sin(t * f + seed * p) * drift;
  return { ...lens, exposure, pos: [s.pos[0] + d(0.7, 1.3), s.pos[1] + d(0.9, 2.1) * 0.6, s.pos[2] + d(0.5, 0.7)], target: s.target, fov: s.fov };
};

/** Bokeh focused on the subject (world units), so the background falls off and the subject separates. */
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const dof = (shot: Shot, subject: V3, aperture = 0.0022, maxBlur = 0.009) => ({ focus: dist(shot.pos, subject), aperture, maxBlur });

// ---------------------------------------------------------------- skies + lights
const NIGHT: SkyColors = { top: "#02040b", mid: "#070d1e", low: "#10172c", horizon: "#1a2138" };
const DAY: SkyColors = { top: "#3f78c2", mid: "#86b4e2", low: "#cfe2f0", horizon: "#eef4f6" };
const COLD: SkyColors = { top: "#5d6f86", mid: "#9aa9ba", low: "#c3ccd5", horizon: "#d6dce2" };
const GOLD: SkyColors = { top: "#2b4f8a", mid: "#e59a5c", low: "#f6b86a", horizon: "#ffd690" };

const Lights: React.FC<{ hemi: [string, string, number]; sun: { pos: V3; color: string; i: number }; key2?: number; fill?: number }> = ({ hemi, sun, key2 = 1, fill = 0.6 }) => (
  <>
    <hemisphereLight args={hemi} />
    <directionalLight position={sun.pos} intensity={sun.i} color={sun.color} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-0.0004} />
    <directionalLight position={[8, 10, 24]} intensity={key2} color="#ffe2c4" />
    <directionalLight position={[-12, 5, 10]} intensity={fill} color="#90caf9" />
  </>
);

// ---------------------------------------------------------------- poses
const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const m3 = (x: V3, y: V3): V3 => [lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)];
  return { body: m3(a.body, b.body), lift: lerp(a.lift, b.lift, k), spine: m3(a.spine, b.spine), head: m3(a.head, b.head), ls: m3(a.ls, b.ls), le: lerp(a.le, b.le, k), rs: m3(a.rs, b.rs), re: lerp(a.re, b.re, k), lh: m3(a.lh, b.lh), lk: lerp(a.lk, b.lk, k), rh: m3(a.rh, b.rh), rk: lerp(a.rk, b.rk, k) };
};
/** Contact at the top of the serve: racket arm straight up, toss arm pulled down, body stretched. */
const hitPose = (): Pose => ({ body: [0, 0, 0], lift: LEG_LENGTH + 0.02, spine: [0.15, -0.2, -0.05], head: [-0.35, 0, 0], ls: [-0.4, 0, 0.3], le: -0.6, rs: [-3.0, 0, -0.15], re: -0.05, lh: [0.1, 0, 0.05], lk: 0.05, rh: [0.35, 0, -0.05], rk: 0.3 });
/** Two-handed-ish backhand: shoulders turned, arms across the body. k 0 = load, 1 = finish. */
const backhandPose = (k: number): Pose => ({
  body: [0, lerp(0.9, -0.7, k), 0],
  lift: LEG_LENGTH - 0.12,
  spine: [0.25, lerp(0.5, -0.4, k), 0],
  head: [-0.1, lerp(-0.7, 0.4, k), 0],
  ls: [lerp(-0.2, -1.6, k), 0, lerp(-0.6, 0.6, k)],
  le: -0.5,
  rs: [lerp(-0.3, -1.5, k), 0, lerp(-0.9, 0.3, k)],
  re: -0.6,
  lh: [-0.55, 0, 0.25],
  lk: 0.7,
  rh: [0.3, 0, -0.2],
  rk: 0.4,
});
/** Volleying at the net, lunging to his right (the passing ball goes by). */
const lungePose = (k: number): Pose => ({ ...readyPose(), body: [0, 0, -0.35 * k], ls: [-0.5, 0, 0.5 + 0.6 * k], rs: [-0.9, 0, -0.9 * k], rh: [-0.6 * k, 0, -0.5 * k], rk: 0.9 });
/** Seated on the bench, right hand on the back of the neck, head down. */
const neckPose = (): Pose => ({ body: [0, 0, 0], lift: 0.04, spine: [0.3, 0, 0], head: [0.5, 0, 0], ls: [-0.6, 0, 0.18], le: -1.1, rs: [-0.35, 0, -2.35], re: -1.85, lh: [-1.45, 0, 0.1], lk: 1.45, rh: [-1.45, 0, -0.1], rk: 1.45 });

// ---------------------------------------------------------------- bits
const Trail: React.FC<{ from: V3; to: V3; k: number; n?: number; r?: number }> = ({ from, to, k, n = 10, r = 0.05 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const kk = k - i * 0.035;
      if (kk < 0 || kk > 1) return null;
      const p = l3(from, to, kk);
      const arc = Math.sin(Math.PI * kk) * 0.35;
      return (
        <mesh key={i} position={[p[0], p[1] + arc, p[2]]}>
          <sphereGeometry args={[r * (1 - i / (n + 2)), 12, 8]} />
          <meshBasicMaterial color={i === 0 ? "#e8ff6a" : B.cyan} transparent opacity={i === 0 ? 1 : 0.75 * (1 - i / n)} toneMapped={false} />
        </mesh>
      );
    })}
  </>
);

const plaqueTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, "#8a6a34");
    grad.addColorStop(0.5, "#c9a45c");
    grad.addColorStop(1, "#7a5a2a");
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = "#3d2c12";
    g.lineWidth = 14;
    g.strokeRect(22, 22, 980, 468);
    g.fillStyle = "#2a1d0a";
    g.textAlign = "center";
    g.font = "800 64px EP03Barlow, Manrope, sans-serif";
    g.fillText("LAPANGAN 18", 512, 110);
    g.font = "800 92px EP03Barlow, Manrope, sans-serif";
    g.fillText("ISNER – MAHUT", 512, 220);
    g.font = "600 54px EP03Barlow, Manrope, sans-serif";
    g.fillText("6–4  3–6  6–7  7–6  70–68", 512, 310);
    g.fillText("22–24 JUNI 2010 · 11 JAM 5 MENIT", 512, 400);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
})();
const Plaque: React.FC = () => (
  <mesh position={[0, 1.3, -17.96]}>
    <planeGeometry args={[2.2, 1.1]} />
    <meshStandardMaterial map={plaqueTex()} roughness={0.35} metalness={0.75} />
  </mesh>
);

// ================================================================= S1 — hook (cover A)
const s1Shot = (t: number): Shot => {
  const a = SHOT_A;
  // push-in + tilt up with the toss, then pan to the frozen board, settle on the AUDIRA wall
  const k1 = seg(t, 0, T.papan);
  const k2 = seg(t, T.papan - 0.3, T.menyerah + 0.3);
  const k3 = seg(t, T.ini - 0.2, CUT.S2);
  const pos: V3 = [lerp(a.pos[0], 1.5, k1) + lerp(0, -0.6, k2) + lerp(0, -0.2, k3), lerp(a.pos[1], 1.9, k1), lerp(a.pos[2], HALF_L + 7.3, k1) - k3 * 0.6];
  const tgt1: V3 = [lerp(1.0, 0.4, k1), lerp(a.target[1], 1.6, k1), a.target[2]];
  const tgt2: V3 = [-7.4, 1.7, -16.4];
  const tgt3: V3 = [-3.2, 1.4, -18];
  const target = k3 > 0 ? l3(tgt2, tgt3, k3) : l3(tgt1, tgt2, k2);
  const fov = lerp(a.fov, 34, k1) - 6 * k2 + 2 * k3;
  return { ...a, pos, target, fov };
};
const S1: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k47 = t >= T.papan + 0.2 ? 1 : 0;
  const glitch = k47 && Math.floor(t * 9) % 2 === 0 ? 1 : 0;
  return (
    <>
      <DuskLights />
      <CourtSet f={f} glitch={glitch} />
      <Player f={f} seed={23} look={ISNER_LOOK} pose={servePose(1)} position={ISNER_POS} heading={Math.PI} scale={PS} />
      <Racket position={[ISNER_POS[0] + 0.74, 1.39, ISNER_POS[2] + 0.14]} rotation={[0.3, 0, 0.25]} />
      <Ball position={[ISNER_POS[0] - 0.25, 2.95 + 0.25 * Math.sin(Math.PI * clamp(t / 3.4)), ISNER_POS[2] - 0.35]} r={0.05} />
      <Player f={f} seed={41} look={MAHUT_LOOK} pose={readyPose()} position={[-0.5, 0, -HALF_L - 0.9]} heading={0} scale={PS} />
      <CameraRig shot={s1Shot(t)} near={0.1} far={400} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.4} exposure={1.05} aoRadius={0.4} />
    </>
  );
};
const clockRoll = (t: number) => {
  if (t < 1.45) return { v: "11:05", label: "DURASI" };
  const k = seg(t, 1.45, T.menit + 0.25);
  const m = Math.round(k * (8 * 60 + 11));
  return { v: `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`, label: "SET 5" };
};
const S1Hud: React.FC<{ t: number }> = ({ t }) => {
  const c = clockRoll(t);
  const head = 1 - seg(t, 1.1, 1.45);
  const bug = 1 - seg(t, 0.05, 0.35);
  return (
    <>
      {head > 0 ? (
        <div style={{ opacity: head }}>
          <Headline top={350} align="left" kicker="WIMBLEDON 2010" hero="11 JAM" heroSize={230} />
        </div>
      ) : null}
      {bug > 0 ? (
        <div style={{ opacity: bug }}>
          <ScoreBug rows={[{ name: "ISNER", sets: [6, 3, 6, 7, 70], serving: true, winner: true }, { name: "MAHUT", sets: [4, 6, 7, 6, 68] }]} top={1300} />
        </div>
      ) : null}
      <DurationClock value={c.v} label={c.label} />
      <Callout t={t} a={T.delapan} b={T.papan - 0.05} top={360} align="left" kicker="SATU SET (SET KELIMA)" value="8 JAM 11 MENIT" size={104} tone="cyan" />
      <Callout t={t} a={T.papan + 0.2} b={T.ini - 0.05} top={360} align="right" kicker="PAPAN SKOR LAPANGAN" value="47–47" sub="MACET" size={130} tone="red" />
      <Chip t={t} a={T.ini} b={CUT.S2 + 0.1} top={380} left={60} text="AUDIRA · FAKTA OLAHRAGA" tone="red" />
    </>
  );
};

// ================================================================= S2 — virtual studio
const s2Keys: Key[] = [
  K(CUT.S2, [0, 3.4, 8.6], [0, 1.4, -1.2], 40),
  K(T.john - 0.6, [0, 1.7, 6.3], [0, 1.45, -1.2], 37),
  K(T.unggulan, [-1.0, 1.6, 4.9], [-2.4, 1.25, 1.1], 35),
  K(T.melawan - 0.2, [-1.5, 1.5, 4.3], [-2.4, 1.2, 1.1], 33),
  K(T.mahut + 0.2, [1.0, 1.6, 4.9], [2.4, 1.25, 1.1], 35),
  K(T.saat - 0.3, [1.5, 1.5, 4.3], [2.4, 1.2, 1.1], 33),
  K(T.tiebreak - 0.6, [0.2, 1.7, 5.4], [0, 1.45, -2.2], 40),
  K(CUT.S3, [-0.2, 1.65, 4.4], [0, 1.4, -2.2], 38),
];
const S2: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const mode: WallMode = t >= T.saat - 0.2 ? "rule" : t >= T.john - 0.3 ? "players" : "title";
  const shot = camAt(s2Keys, t, 0.02, 3, 1.0);
  return (
    <>
      <StudioSet f={f} mode={mode} isner={seg(t, T.john - 0.1, T.john + 0.6)} mahut={seg(t, T.melawan, T.melawan + 0.7)} isnerLook={ISNER_LOOK} mahutLook={MAHUT_LOOK} />
      <ToyAnchor f={f} />
      <CameraRig shot={shot} near={0.1} far={120} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CYBER_NEON_VOID} hdri="studio" envIntensity={0.45} exposure={1.0} aoRadius={0.4} {...dof(shot, shot.target, 0.0018)} />
    </>
  );
};
const ToyAnchor: React.FC<{ f: number }> = ({ f }) => (
  <Player f={f} seed={7} look={{ outfit: "casual", top: "#1b2433", bottom: "#141a24", skin: "#c99572", hair: "#1b1411", hairStyle: 2 }} pose={readyPoseStand()} position={[0, 0.1, -0.35]} heading={0} scale={1.0} />
);
const readyPoseStand = (): Pose => ({ ...readyPose(), lift: LEG_LENGTH, spine: [0.05, 0, 0], ls: [-0.6, 0, 0.2], le: -1.3, rs: [-0.6, 0, -0.2], re: -1.3, lh: [0, 0, 0.03], lk: 0, rh: [0, 0, -0.03], rk: 0 });
const S2Hud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Chip t={t} a={T.wimbledon} b={T.john - 0.1} top={340} left={60} text="WIMBLEDON 2010 · LAPANGAN 18" tone="navy" />
    <Callout t={t} a={T.john} b={T.melawan - 0.1} top={360} align="right" kicker="AMERIKA SERIKAT" value="JOHN ISNER" sub="UNGGULAN 23" size={96} tone="cyan" />
    <Callout t={t} a={T.melawan + 0.1} b={T.saat - 0.25} top={360} align="left" kicker="PRANCIS" value="NICOLAS MAHUT" sub="PEMAIN KUALIFIKASI" size={92} tone="amber" />
    <Chip t={t} a={T.pemenang} b={CUT.S3 + 0.1} top={340} left={60} text="UNGGUL 2 GAME = MENANG" tone="red" />
  </>
);

// ================================================================= S3 — day 1 → day 2 (broadcast wide)
const s3Keys: Key[] = [K(CUT.S3, [3.2, 6.2, HALF_L + 20], [0.2, 0.3, 1.5], 27), K(T.hari2, [0.4, 6.4, HALF_L + 20.5], [0, 0.3, 1.0], 26), K(CUT.S4a, [-3.4, 5.8, HALF_L + 19], [-0.2, 0.4, 0.5], 25)];
const rally = (t: number) => {
  const u = t * 0.62;
  const leg = Math.floor(u);
  const k = u - leg;
  const toFar = leg % 2 === 0;
  const near: V3 = [lerp(1.2, -1.6, (Math.sin(leg * 1.7) + 1) / 2), 1.0, HALF_L - 0.4];
  const far: V3 = [lerp(-1.4, 1.6, (Math.sin(leg * 2.3 + 1) + 1) / 2), 1.0, -HALF_L + 0.4];
  const [a, b] = toFar ? [near, far] : [far, near];
  const p = l3(a, b, k);
  return { ball: [p[0], p[1] + Math.sin(Math.PI * k) * 1.6 - 0.3 * k, p[2]] as V3, nearX: near[0] + 0.4, farX: far[0] - 0.4 };
};
const S3: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const day2 = t >= T.hari2 - 0.25;
  const dark = day2 ? 1 - seg(t, T.hari2 - 0.25, T.hari2 + 0.6) : seg(t, T.gelap1 - 0.2, T.hari2 - 0.4);
  const r = rally(t);
  const lv = 1 - dark * 0.85;
  return (
    <>
      {day2 ? (
        <Lights hemi={["#a9c4e8", "#2d4a22", 0.75 * lv]} sun={{ pos: [12, 16, -10], color: "#fff1d8", i: 2.6 * lv }} key2={0.9 * lv} fill={0.5 * lv} />
      ) : (
        <Lights hemi={["#7d86b8", "#1d2a18", 0.55 * lv]} sun={{ pos: [-14, 6, -30], color: "#ffb070", i: 2.4 * lv }} key2={1.1 * lv} fill={0.6 * lv} />
      )}
      <CourtSet f={f} wear={day2 ? 0.7 : 0.4} sky={day2 ? DAY : t > T.gelap1 + 0.5 ? NIGHT : undefined} fog={day2 ? "#9fb6cc" : "#2a2440"} fogNear={30} fogFar={90} scoreTop={day2 ? String(Math.min(46, Math.floor(seg(t, T.hari2, CUT.S4a) * 46))) : "0"} scoreBottom={day2 ? String(Math.min(46, Math.floor(seg(t, T.hari2, CUT.S4a) * 46))) : "0"}>
        <Glb id="scaffold-camera-platform-b6702c" position={[10.6, 0, 9]} rotation={[0, -Math.PI / 2, 0]} height={4} />
      </CourtSet>
      <Player f={f} seed={23} look={ISNER_LOOK} pose={readyPose()} position={[r.nearX, 0, HALF_L + 0.6]} heading={Math.PI} scale={PS} />
      <Player f={f} seed={41} look={MAHUT_LOOK} pose={readyPose()} position={[r.farX, 0, -HALF_L - 0.6]} heading={0} scale={PS} />
      {dark < 0.9 ? <Ball position={r.ball} r={0.09} /> : null}
      <CameraRig shot={camAt(s3Keys, t, 0.04, 5, lerp(1.05, 0.7, dark))} near={0.5} far={400} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.4 * lv} exposure={1.05} aoRadius={0.4} />
    </>
  );
};
const S3Hud: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.min(46, Math.floor(seg(t, T.hari2, CUT.S4a) * 46));
  return (
    <>
      <Callout t={t} a={T.gelap1} b={T.hari2 - 0.2} top={360} align="center" kicker="HARI 1 · SELASA 22 JUNI" value="GELAP" sub="LAGA DIHENTIKAN · SKOR 2–2 SET" size={130} tone="amber" />
      {t >= T.hari2 ? <ScoreBug title="HARI 2 · SET KELIMA" rows={[{ name: "ISNER", sets: [6, 3, 6, 7, n], serving: true }, { name: "MAHUT", sets: [4, 6, 7, 6, n] }]} top={360} /> : null}
      <Chip t={t} a={T.tak} b={CUT.S4a + 0.1} top={640} left={60} text="SERVIS TAK TERPATAHKAN" tone="cyan" />
    </>
  );
};

// ================================================================= S4a — the scoreboard freezes
const BOARD: V3 = [-7.4, 1.7, -16.4];
const BN: V3 = [Math.sin(0.3), 0, Math.cos(0.3)];
const s4aShot = (t: number): Shot => {
  const k = seg(t, CUT.S4a, CUT.S4b);
  const d = lerp(9.2, 6.8, k);
  const side = lerp(-1.4, 1.1, k);
  const pos: V3 = [BOARD[0] + BN[0] * d + BN[2] * side, lerp(1.3, 1.6, k), BOARD[2] + BN[2] * d - BN[0] * side];
  const s = camAt([K(CUT.S4a, pos, BOARD, 34), K(CUT.S4b, pos, BOARD, 34)], t, 0.025, 7, 1.0);
  return { ...s, pos, fov: lerp(42, 38, k) };
};
const boardScore = (t: number) => (t < CUT.S4a + 0.35 ? "45" : t < T.sama47 - 0.05 ? "46" : "47");
const S4a: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const glitch = t >= T.macet && t < T.mati ? (Math.floor(t * 14) % 3 === 0 ? 0 : 1) : 0;
  const off = t >= T.mati + 0.15 ? 1 : t >= T.mati ? (Math.floor(t * 30) % 2) : 0;
  const shot = s4aShot(t);
  return (
    <>
      <Lights hemi={["#5a6290", "#14200f", 0.3]} sun={{ pos: [-14, 6, -30], color: "#ff9a5a", i: 1.0 }} key2={0.35} fill={0.35} />
      <CourtSet f={f} wear={0.75} scoreTop={boardScore(t)} scoreBottom={boardScore(t)} glitch={glitch} boardOff={off} sky={NIGHT} fog="#070b16" fogNear={6} fogFar={26} />
      <pointLight position={[BOARD[0] + BN[0] * 1.5, 2.4, BOARD[2] + BN[2] * 1.5]} intensity={off ? 0.6 : 4} distance={6} color={glitch ? "#ff5a3c" : "#ffcf4a"} />
      <CameraRig shot={shot} near={0.1} far={300} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.25} exposure={0.95} aoRadius={0.4} {...dof(shot, BOARD, 0.003, 0.012)} />
    </>
  );
};
const S4aHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Callout t={t} a={T.sama47} b={CUT.S4b + 0.1} top={340} align="left" kicker="HARI 2 · SET KELIMA" value="47–47" size={150} tone="red" />
    <Stamp t={t} a={T.mati} b={CUT.S4b + 0.1} top={1110} right={70} text="PAPAN SKOR MATI" rot={-5} size={70} />
    <Chip t={t} a={T.program} b={CUT.S4b + 0.1} top={1010} left={60} text="PROGRAMNYA HANYA SAMPAI 47" tone="navy" />
  </>
);

// ================================================================= S4b — 59–59, dark again
const s4bKeys: Key[] = [K(CUT.S4b, [0.5, 2.0, HALF_L + 6.5], [0, 1.0, 2], 40), K(T.dihentikan, [0.2, 6.5, HALF_L + 10], [0, 0.4, -1], 36), K(CUT.S5a, [0, 10, HALF_L + 12], [0, 0, -3], 34)];
const S4b: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const dim = seg(t, T.gelap2 - 0.3, T.gelap2 + 0.8);
  return (
    <>
      <Lights hemi={["#3b4470", "#0b120a", 0.5 - 0.25 * dim]} sun={{ pos: [-14, 5, -30], color: "#6d7cc4", i: 1.2 - 0.7 * dim }} key2={0.6 - 0.3 * dim} fill={0.5} />
      <CourtSet f={f} wear={0.85} sky={NIGHT} fog="#0b1124" fogNear={14} fogFar={55} scoreTop="47" scoreBottom="47" boardOff={1} />
      <Player f={f} seed={23} look={ISNER_LOOK} pose={readyPoseStand()} position={[1.2, 0, 1.4]} heading={Math.PI + 0.3} scale={PS} />
      <Player f={f} seed={41} look={MAHUT_LOOK} pose={readyPoseStand()} position={[-1.0, 0, -1.4]} heading={0.3} scale={PS} />
      <CameraRig shot={camAt(s4bKeys, t, 0.03, 9, 1.0)} near={0.3} far={300} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.15} exposure={1.0} aoRadius={0.4} />
    </>
  );
};
const S4bHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Callout t={t} a={T.sama59 - 0.1} b={CUT.S5a + 0.1} top={340} align="center" kicker="HARI 2 · GELAP LAGI" value="59–59" sub="DIHENTIKAN" size={160} tone="amber" />
    <Chip t={t} a={T.kedua} b={CUT.S5a + 0.1} top={1110} left={60} text="DIHENTIKAN 2 KALI" tone="red" />
  </>
);

// ================================================================= S5a — the server in a spotlight
const SERVE = 1.75;
const SPOT_T = new THREE.Object3D();
const serveCycle = (t: number) => {
  const p = ((t - CUT.S5a + 0.6) % SERVE) / SERVE;
  return { p, n: Math.floor((t - CUT.S5a + 0.6) / SERVE) };
};
const s5aShot = (t: number): Shot => {
  const a = lerp(-0.25, 0.22, seg(t, CUT.S5a, CUT.S5b));
  const r = lerp(8.2, 7.0, seg(t, CUT.S5a, CUT.S5b));
  const c: V3 = [ISNER_POS[0] - 0.9, 1.7, ISNER_POS[2] + 0.1];
  const pos: V3 = [c[0] + Math.cos(a) * r, lerp(1.4, 1.7, seg(t, CUT.S5a, CUT.S5b)), c[2] + Math.sin(a) * r];
  const s = camAt([K(CUT.S5a, pos, c, 36), K(CUT.S5b, pos, c, 36)], t, 0.02, 11, 1.0);
  return { ...s, pos, target: c, fov: 38 };
};
const S5a: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const { p } = serveCycle(t);
  const toss = seg(p, 0, 0.5);
  const hit = seg(p, 0.5, 0.58);
  const pose = p < 0.5 ? mixPose(readyPoseStand(), servePose(1), toss) : mixPose(servePose(1), hitPose(), hit);
  const ballUp: V3 = [ISNER_POS[0] - 0.25, lerp(1.2, 2.95, toss), ISNER_POS[2] - 0.35];
  const contact: V3 = [ISNER_POS[0] - 0.1, 3.05, ISNER_POS[2] - 0.5];
  const land: V3 = [-0.6, 0.05, -2.5];
  const fly = clamp((p - 0.55) / 0.3);
  const shot = s5aShot(t);
  const racketPos: V3 = p < 0.5 ? [ISNER_POS[0] + 0.74, 1.39, ISNER_POS[2] + 0.14] : l3([ISNER_POS[0] + 0.74, 1.39, ISNER_POS[2] + 0.14], [ISNER_POS[0] + 0.22, 1.98, ISNER_POS[2] - 0.08], hit);
  return (
    <>
      <hemisphereLight args={["#1c2440", "#05070a", 0.25]} />
      <primitive object={SPOT_T} position={ISNER_POS} />
      <spotLight target={SPOT_T} position={[ISNER_POS[0] + 1.5, 9, ISNER_POS[2] + 2]} angle={0.32} penumbra={0.6} intensity={260} distance={20} color="#fff3e0" castShadow />
      <directionalLight position={[-6, 4, -10]} intensity={0.9} color={B.cyan} />
      <CourtSet f={f} wear={0.85} sky={NIGHT} fog="#05080f" fogNear={6} fogFar={30} boardOff={1} />
      <Player f={f} seed={23} look={ISNER_LOOK} pose={pose} position={ISNER_POS} heading={Math.PI} scale={PS} />
      <Racket position={racketPos} rotation={[p < 0.5 ? 0.3 : lerp(0.3, -0.2, hit), 0, lerp(0.25, -0.12, hit)]} />
      {p < 0.55 ? <Ball position={ballUp} r={0.05} /> : <Trail from={contact} to={land} k={fly} r={0.06} />}
      <CameraRig shot={shot} near={0.1} far={200} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CYBER_NEON_VOID} hdri="studio" envIntensity={0.2} exposure={1.0} aoRadius={0.4} {...dof(shot, [ISNER_POS[0], 1.6, ISNER_POS[2]], 0.0025)} />
    </>
  );
};
const S5aHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Callout t={t} a={T.servis} b={T.isnerAce - 0.05} top={340} align="center" kicker="KENAPA SELAMA ITU?" value="SERVIS NYARIS TAK TERSENTUH" size={66} tone="cyan" />
    <Counter t={t} a={T.ace113} b={CUT.S5b + 0.1} to={113} top={330} left={60} label="ISNER" />
    <Counter t={t} a={T.mahut103} b={CUT.S5b + 0.1} to={103} top={330} right={60} label="MAHUT" dim />
  </>
);

// ================================================================= S5b — top-down: points vs games
const POOL_T = new THREE.Object3D();
const s5bKeys: Key[] = [K(CUT.S5b, [3, 7, HALF_L + 8], [0, 0.5, 2], 40), K(T.tapi, [0.6, 24, 7], [0, 0, 0.5], 42), K(CUT.S6, [0, 27, 5.5], [0, 0, 0], 42)];
const S5b: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const r = rally(t * 1.3);
  return (
    <>
      <Lights hemi={["#4a5a8a", "#0b120a", 0.25]} sun={{ pos: [6, 20, 8], color: "#e8eeff", i: 0.6 }} key2={0.2} fill={0.2} />
      <primitive object={POOL_T} position={[0, 0, 0]} />
      <spotLight target={POOL_T} position={[0, 30, 2]} angle={0.27} penumbra={0.55} intensity={1400} distance={60} color="#f2f6ff" castShadow />
      <CourtSet f={f} wear={0.9} sky={NIGHT} fog="#05080f" fogNear={30} fogFar={80} boardOff={1} />
      <Player f={f} seed={23} look={ISNER_LOOK} pose={readyPose()} position={[r.nearX, 0, HALF_L + 0.6]} heading={Math.PI} scale={PS} />
      <Player f={f} seed={41} look={MAHUT_LOOK} pose={readyPose()} position={[r.farX, 0, -HALF_L - 0.6]} heading={0} scale={PS} />
      <Ball position={r.ball} r={0.12} />
      <CameraRig shot={camAt(s5bKeys, t, 0.05, 13, 1.0)} near={0.5} far={300} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.2} exposure={1.0} aoRadius={0.4} />
    </>
  );
};
const S5bHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <SplitBar t={t} a={T.poin - 0.3} b={CUT.S6 + 0.1} top={340} rows={[{ name: "MAHUT", value: 502, color: B.liveAmber }, { name: "ISNER", value: 478, color: B.cyan }]} />
    <Stamp t={t} a={T.tapi} b={CUT.S6 + 0.1} top={640} right={70} text="TETAP KALAH" rot={-7} size={78} />
    <Callout t={t} a={T.dihitung} b={CUT.S6 + 0.1} top={1010} align="left" kicker="TENIS DIHITUNG DARI" value="GAME, BUKAN POIN" size={78} tone="red" />
  </>
);

// ================================================================= S6 — day 3: the passing shot, 70–68
const HIT: V3 = [-2.3, 0.95, HALF_L - 0.6];
const LAND: V3 = [-3.6, 0.05, -HALF_L + 1.8];
const s6Shot = (t: number): Shot => {
  const base = camAt([K(CUT.S6, [-0.2, 0.7, HALF_L + 9.5], [-2.4, 1.1, 3], 34), K(T.backhand, [-0.6, 0.75, HALF_L + 8.4], [-2.4, 1.0, 1.5], 32), K(IMPACT, [-0.9, 0.85, HALF_L + 8.0], [-3.2, 0.5, -HALF_L + 4], 28), K(CUT.S7, [-0.4, 1.4, HALF_L + 9.2], [-3.0, 0.6, -HALF_L + 3], 30)], t, 0.03, 15, 1.08);
  // whip: snap the target toward the landing spot right before impact
  const shakeK = t > IMPACT && t < IMPACT + 0.18 ? (1 - (t - IMPACT) / 0.18) * 0.08 : 0;
  return { ...base, pos: [base.pos[0] + Math.sin(t * 90) * shakeK, base.pos[1] + Math.cos(t * 77) * shakeK, base.pos[2]] };
};
const S6: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = seg(t, T.backhand - 0.35, T.backhand + 0.15);
  const fly = clamp((t - (T.backhand + 0.1)) / (IMPACT - T.backhand - 0.1));
  const shot = s6Shot(t);
  return (
    <>
      <Lights hemi={["#bcd4f0", "#355a26", 0.85]} sun={{ pos: [10, 18, 6], color: "#fff4e0", i: 3.0 }} key2={0.7} fill={0.45} />
      <CourtSet f={f} wear={1} sky={DAY} fog="#b9cde0" fogNear={35} fogFar={110} boardOff={1} />
      <Player f={f} seed={23} look={ISNER_LOOK} pose={backhandPose(k)} position={[HIT[0] + 0.55, 0, HIT[2] + 0.35]} heading={Math.PI} scale={PS} />
      <Racket position={[HIT[0] + lerp(0.9, -0.3, k), lerp(1.0, 1.35, k), HIT[2] + lerp(0.4, -0.3, k)]} rotation={[1.2, lerp(-1.2, 1.0, k), 1.5]} />
      <Player f={f} seed={41} look={MAHUT_LOOK} pose={lungePose(seg(t, T.backhand + 0.2, IMPACT))} position={[-1.2, 0, -2.2]} heading={0} scale={PS} />
      {t < T.backhand + 0.1 ? <Ball position={l3([-0.5, 1.2, -1.5], HIT, seg(t, CUT.S6, T.backhand + 0.1))} r={0.06} /> : <Trail from={HIT} to={LAND} k={Math.min(fly, 1)} r={0.07} />}
      {fly >= 1 ? <Ball position={[LAND[0] - (t - IMPACT) * 1.6, 0.08 + Math.abs(Math.sin((t - IMPACT) * 6)) * 0.4 * Math.exp(-(t - IMPACT) * 2), LAND[2] - (t - IMPACT) * 3]} r={0.07} /> : null}
      <CameraRig shot={shot} near={0.1} far={400} />
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.DOCUMENTARY_WARM} hdri="sky" envIntensity={0.55} exposure={1.08} aoRadius={0.4} {...dof(shot, t < IMPACT ? [HIT[0] + 0.55, 1.2, HIT[2]] : [-1.2, 1.0, -2.2], 0.002)} />
    </>
  );
};
const S6Hud: React.FC<{ t: number }> = ({ t }) => {
  const big = seg(t, IMPACT, IMPACT + 0.25);
  return (
    <>
      <Chip t={t} a={T.match} b={IMPACT - 0.05} top={360} left={60} text="MATCH POINT KE-5" tone="red" />
      {t >= IMPACT ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", transform: `scale(${lerp(1.4, 1.15, big)})`, transformOrigin: "50% 0" }}>
          <div style={{ position: "relative", width: 640, height: 220 }}>
            <ScoreBug left={0} top={0} title="SET KELIMA · HARI 3" rows={[{ name: "ISNER", sets: [6, 3, 6, 7, 70], winner: true }, { name: "MAHUT", sets: [4, 6, 7, 6, 68] }]} />
          </div>
        </div>
      ) : null}
      <Callout t={t} a={T.sebelas} b={CUT.S7 + 0.1} top={690} align="right" kicker="TOTAL DURASI" value="11 JAM 5 MENIT" size={92} tone="cyan" />
      <Chip t={t} a={T.g183} b={CUT.S7 + 0.1} top={930} right={60} text="183 GAME" tone="amber" />
      <Flash t={t} at={IMPACT} dur={0.4} max={0.75} />
    </>
  );
};

// ================================================================= S7 — the next round, cold
const BENCH: V3 = [HALF_W + 1.4, 0, 1.6];
const s7Keys: Key[] = [K(CUT.S7, [BENCH[0] - 4.6, 1.5, BENCH[2] + 3.4], [BENCH[0] - 0.6, 1.55, BENCH[2] + 0.4], 36), K(T.delapanTahun, [BENCH[0] - 5.4, 1.7, BENCH[2] + 4.2], [BENCH[0] - 0.7, 1.6, BENCH[2] + 0.4], 37), K(CUT.S8, [BENCH[0] - 6.2, 2.0, BENCH[2] + 5.0], [BENCH[0] - 0.8, 1.6, BENCH[2] + 0.3], 38)];
const S7: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const shot = camAt(s7Keys, t, 0.02, 17, 1.0);
  return (
  <>
    <Lights hemi={["#9fb3cc", "#2a3a30", 0.6]} sun={{ pos: [-10, 12, 8], color: "#dfe8f5", i: 1.6 }} key2={0.4} fill={0.8} />
    <CourtSet f={f} wear={0.25} sky={COLD} fog="#a7b5c4" fogNear={6} fogFar={34} boardOff={1} />
    <directionalLight position={[BENCH[0] + 6, 3, BENCH[2] - 4]} intensity={2.2} color="#bfe4ff" />
    <Glb id="campus-bench-0d6036" position={BENCH} rotation={[0, -Math.PI / 2, 0]} height={0.85} />
    <Player f={f} seed={23} look={ISNER_LOOK} pose={neckPose()} position={[BENCH[0] + 0.05, 0.46, BENCH[2]]} heading={-Math.PI / 2} scale={PS} />
    <Racket position={[BENCH[0] + 0.1, 0.5, BENCH[2] + 0.9]} rotation={[0, 0, 1.45]} />
    <CameraRig shot={shot} near={0.1} far={200} />
    <Finish frame={Math.round(f)} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} hdri="sky" envIntensity={0.35} exposure={1.0} aoRadius={0.4} {...dof(shot, [BENCH[0], 1.0, BENCH[2]], 0.003, 0.011)} />
  </>
  );
};
const S7Hud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Callout t={t} a={T.kalah - 0.1} b={T.delapanTahun - 0.1} top={340} align="left" kicker="BABAK 2 · ISNER KALAH" value="74 MENIT" sub="TANPA SATU ACE PUN" size={130} tone="amber" />
    <Callout t={t} a={T.delapanTahun} b={CUT.S8 + 0.1} top={340} align="left" kicker="OKTOBER 2018 · ATURAN BARU" value="TIE-BREAK DI 12–12" sub="SET PENENTU · BERLAKU 2019" size={92} tone="cyan" />
  </>
);

// ================================================================= S8 — golden hour, empty court
const s8Keys: Key[] = [K(CUT.S8, [0.3, 1.35, -12.2], [0, 1.3, -18], 32), K(T.berikutnya, [0.2, 3.2, -1.0], [0, 1.2, -18], 32), K(TOTAL, [0, 6.5, HALF_L + 12], [0, 1.0, -10], 30)];
const S8: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const shot = camAt(s8Keys, t, 0.025, 19, 1.05);
  return (
  <>
    <Lights hemi={["#f0c898", "#3a3a1e", 0.55]} sun={{ pos: [-16, 4.5, -26], color: "#ffb15e", i: 3.0 }} key2={0.9} fill={0.35} />
    <CourtSet f={f} wear={1} sky={GOLD} fog="#e6a56a" fogNear={30} fogFar={100} boardOff={1}>
      <Plaque />
    </CourtSet>
    <CameraRig shot={shot} near={0.1} far={400} />
    <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.45} exposure={1.05} aoRadius={0.4} {...dof(shot, [0, 1.3, -17.9], 0.0016)} />
  </>
  );
};
const S8Hud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Chip t={t} a={CUT.S8 + 0.3} b={T.berikutnya - 0.1} top={360} left={60} text="PLAKAT PERINGATAN · LAPANGAN 18" tone="amber" />
    <Teaser t={t} a={T.berikutnya} b={TOTAL} top={380} ep="EP04" title="PIT STOP 1,8 DETIK" />
  </>
);

// ================================================================= director
const SCENES: Record<SceneId, { Scene: React.FC<{ t: number; f: number }>; Hud: React.FC<{ t: number }>; day: string | ((t: number) => string); clock?: string }> = {
  S1: { Scene: S1, Hud: S1Hud, day: "HARI KE-2 · LAPANGAN 18" },
  S2: { Scene: S2, Hud: S2Hud, day: "STUDIO · FAKTA OLAHRAGA" },
  S3: { Scene: S3, Hud: S3Hud, day: (t) => (t < T.hari2 ? "HARI 1 · SELASA 22 JUNI" : "HARI 2 · RABU 23 JUNI"), clock: "SET 5" },
  S4a: { Scene: S4a, Hud: S4aHud, day: "HARI 2 · RABU 23 JUNI", clock: "SET 5" },
  S4b: { Scene: S4b, Hud: S4bHud, day: "HARI 2 · RABU 23 JUNI", clock: "SET 5" },
  S5a: { Scene: S5a, Hud: S5aHud, day: "ANALISIS · SERVIS", clock: "" },
  S5b: { Scene: S5b, Hud: S5bHud, day: "ANALISIS · POIN", clock: "" },
  S6: { Scene: S6, Hud: S6Hud, day: "HARI 3 · KAMIS 24 JUNI", clock: "SET 5" },
  S7: { Scene: S7, Hud: S7Hud, day: "BABAK 2 · SEHARI KEMUDIAN" },
  S8: { Scene: S8, Hud: S8Hud, day: "AUDIRA · FAKTA OLAHRAGA" },
};
/** Fifth-set clock shown on the court scenes (rolls with the story: day 2 → 8:11 by the end of day 3). */
const setClock = (t: number) => {
  const m = Math.round(lerp(60, 8 * 60 + 11, seg(t, CUT.S3, T.sebelas)));
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
};

const KEY = /^(isner|mahut|audira|wimbledon|tie-break|ace|game|gelap|macet|mati|delapan|sebelas|seratus|tujuh|lima|empat|dua|tiga|enam|satu|poin|kalah)/i;
const CAP: CapWord[] = CLIPS.flatMap((c) => c.words.map((w) => ({ w: w.w, t: w.s, e: w.e, key: KEY.test(w.w) })));
const CAP_FROM = 0.4;
const TICK = "183 GAME  ·  216 ACE  ·  DIMAINKAN 3 HARI  ·  PAPAN SKOR MACET DI 47–47";
const TICKER = `${TICK}  ·  AUDIRA FAKTA OLAHRAGA  ·  ${TICK}  ·  AUDIRA FAKTA OLAHRAGA  ·  ${TICK}`;

export const Film: React.FC = () => {
  useDisplayFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const sc = sceneAt(t);
  const { Scene, Hud, day, clock } = SCENES[sc];
  const showClock = sc !== "S1" && clock !== undefined && clock !== "";
  return (
    <>
      <Stage3D
        background={B.studioVoid}
        overlay={() => (
          <>
            {/* lens vignette: pulls the eye to the subject in the centre (fades in after the cover frame) */}
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, 0, 0.6), background: "radial-gradient(ellipse 62% 44% at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,6,10,0.62) 100%)" }} />
            <LiveBug day={typeof day === "function" ? day(t) : day} pulse={0.5 + 0.5 * Math.cos(t * 5)} />
            {showClock ? <DurationClock value={setClock(t)} label={clock} /> : null}
            <Hud t={t} />
            {t >= CAP_FROM ? <Captions t={t} words={CAP} end={T.ikuti + 1.0} /> : null}
            <Ticker label="FAKTA" offset={(t * 90) % 1400} text={TICKER} />
            <Stinger t={t} cuts={CUTS} />
          </>
        )}
      >
        <Scene t={t} f={f} />
      </Stage3D>
      <Audio src={staticFile("audio/ep03/vo.wav")} />
    </>
  );
};
