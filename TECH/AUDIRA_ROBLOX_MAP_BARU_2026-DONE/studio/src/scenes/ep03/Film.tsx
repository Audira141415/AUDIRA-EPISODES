// EP03 film (ISOCRAFT): "60 DETIK PENENTU MAPMU" — the 60-second discovery machine.
// One continuous world grown from the approved cover (Hook.tsx). Every camera key and timed event is
// anchored to a word of the locked voice (timeline.json); nothing uses absolute seconds except the
// cover pose at t = 0.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Bangers";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { BlockAvatar, type AvatarPose, type AvatarColors } from "../_shared/BlockAvatar.tsx";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette";
import { COVER_CAMERA, HOOK_BG, HookWorld, Ink, Box, Print, noInk, MACHINE as M, type HookFilm } from "./Hook.tsx";
import { HookHeadline } from "./Cover.tsx";
import { boardTexture, boardHeight, docTexture, gameCardTexture, menuTexture, mysteryTexture, thumbTexture, RED, type BoardSpec } from "./filmTextures.ts";
import timeline from "./timeline.json";

export const TOTAL_SECONDS: number = timeline.total;
const { fontFamily: BANGERS } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

type V3 = [number, number, number];
type Word = { w: string; s: number; e: number };
type Line = { id: string; part: string; start: number; end: number; words: Word[] };
const LINES = timeline.lines as Line[];
const VO_END = timeline.voEnd;
const OUTRO_AT = VO_END + 0.6;

// ---------- word anchors ----------
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
const line = (id: string) => {
  const l = LINES.find((x) => x.id === id);
  if (!l) throw new Error(`no line ${id}`);
  return l;
};
/** Start time of `word` (nth occurrence) inside line `id`. */
const W = (id: string, word: string, nth = 1) => {
  const hits = line(id).words.filter((w) => norm(w.w) === norm(word));
  const h = hits[nth - 1];
  if (!h) throw new Error(`no word ${word}#${nth} in ${id}`);
  return h.s;
};
const L = (id: string) => line(id).start;
const LE = (id: string) => line(id).end;

// ---------- easing ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const u = clamp(x);
  return u * u * u * (u * (u * 6 - 15) + 10);
};
const backOut = (x: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** Pop-in at a, pop-out at b (scale 0..~1.05..1). */
const pop = (t: number, a: number, b: number) => {
  if (t < a || t > b) return 0;
  return backOut(clamp((t - a) / 0.34)) * smooth((b - t) / 0.28);
};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// ---------- camera (orbit params around a target, anchored keys) ----------
type Cam = { tg: V3; d: number; yaw: number; pitch: number };
type CamKey = Cam & { at: number; cut?: boolean; dur?: number };
const COVER_CAM: Cam = (() => {
  const [px, py, pz] = COVER_CAMERA.position;
  const [tx, ty, tz] = COVER_CAMERA.target;
  const dx = px - tx, dy = py - ty, dz = pz - tz;
  const d = Math.hypot(dx, dy, dz);
  return { tg: COVER_CAMERA.target, d, yaw: Math.atan2(dx, dz), pitch: Math.asin(dy / d) };
})();

const CAM: CamKey[] = [
  { at: 0, ...COVER_CAM },
  { at: W("l01", "kabur"), tg: [-0.9, 0.7, 1.2], d: 26, yaw: 0.3, pitch: 0.4, dur: 2.0 },
  { at: L("l02"), tg: [-3.0, 1.8, 0.4], d: 26, yaw: 0.3, pitch: 0.22, dur: 2.0 },
  { at: W("l03", "ada"), tg: [0.4, 3.0, 0], d: 40, yaw: 0.5, pitch: 0.28, dur: 2.2 },
  { at: W("l03", "rekomendasi"), tg: [2.3, 6.0, -1.2], d: 20, yaw: 0.42, pitch: 0.12, dur: 1.6 },
  { at: L("l04"), tg: [-6.0, 1.0, 0.8], d: 22, yaw: 0.22, pitch: 0.25, cut: true },
  { at: W("l04", "benar-benar"), tg: [-4.6, 0.8, -0.4], d: 19, yaw: 0.4, pitch: 0.3, dur: 2.0 },
  { at: L("l05"), tg: [-0.2, 1.6, 1.4], d: 24, yaw: 0.25, pitch: 0.45, cut: true },
  { at: W("l05", "ini"), tg: [-0.5, 1.4, 1.6], d: 21.5, yaw: 0.15, pitch: 0.5, dur: 1.4 },
  { at: L("l06"), tg: [-0.2, 0.8, 2.8], d: 20.5, yaw: 0.1, pitch: 0.15, dur: 1.8 },
  { at: W("l06", "kedua"), tg: [0.0, 0.7, 2.8], d: 19.5, yaw: -0.05, pitch: 0.12, dur: 2.0 },
  { at: L("l07"), tg: [0.0, 2.2, 0.6], d: 22, yaw: 0.55, pitch: 0.3, dur: 1.8 },
  { at: W("l07", "dihitung"), tg: [0.0, 2.2, 0.6], d: 20.5, yaw: 0.68, pitch: 0.3, dur: 1.8 },
  { at: L("l08"), tg: [1.9, 2.4, 1.0], d: 21, yaw: 0.75, pitch: 0.25, dur: 1.8 },
  { at: W("l08", "belanja"), tg: [2.0, 2.3, 1.0], d: 19, yaw: 0.9, pitch: 0.25, dur: 1.2 },
  { at: L("l09"), tg: [-6.0, 1.0, 0.5], d: 36, yaw: 0.2, pitch: 0.3, cut: true },
  { at: W("l09", "gelombang"), tg: [-8.5, 1.0, 0.8], d: 30, yaw: 0.12, pitch: 0.3, dur: 1.8 },
  { at: L("l10"), tg: [-1, 0.5, 0], d: 50, yaw: 0.35, pitch: 0.55, dur: 2.6 },
  { at: L("l11"), tg: [-1.6, 0.8, 4.2], d: 27, yaw: 0.25, pitch: 0.45, dur: 2.4 },
  { at: W("l11", "28"), tg: [1.6, 0.8, 4.2], d: 27, yaw: 0.08, pitch: 0.3, dur: 2.2 },
  { at: L("l12"), tg: [8.3, 1.4, 2.0], d: 26, yaw: 0.3, pitch: 0.18, cut: true },
  { at: W("l12", "pemain", 2), tg: [8.7, 1.8, 2.0], d: 23, yaw: 0.38, pitch: 0.18, dur: 1.2 },
  { at: L("l13"), tg: [-0.2, 2.0, 0.3], d: 25, yaw: 0.5, pitch: 0.35, cut: true },
  { at: W("l13", "langsung"), tg: [1.0, 2.0, 0.6], d: 23, yaw: 0.6, pitch: 0.3, dur: 1.4 },
  { at: L("l14"), tg: [0.3, 2.6, 0.8], d: 22, yaw: 0.45, pitch: 0.22, dur: 1.2 },
  { at: W("l14", "penasaran"), tg: [0.8, 3.2, 0.6], d: 23, yaw: 0.4, pitch: 0.15, dur: 1.0 },
  { at: L("l15"), tg: [0.8, 2.4, 1.8], d: 40, yaw: 0.38, pitch: 0.3, dur: 1.6 },
  { at: W("l15", "thumbnail-mu"), tg: [1.3, -0.8, 11.0], d: 24, yaw: 0.3, pitch: 0.5, dur: 1.4 },
];

function camAt(t: number, i = -1): Cam {
  if (i < 0) {
    i = 0;
    for (let k = 0; k < CAM.length; k++) if (CAM[k].at <= t) i = k;
  }
  const k = CAM[i];
  const el = Math.max(0, t - Math.max(k.at, i === 0 ? 0.3 : k.at));
  let base: Cam = k;
  if (i > 0 && !k.cut) {
    const from = camAt(k.at - 1e-4, i - 1);
    const gap = (CAM[i + 1]?.at ?? k.at + 5) - k.at;
    const u = smooth((t - k.at) / Math.min(k.dur ?? 1.8, gap - 0.1));
    base = { tg: lerp3(from.tg, k.tg, u), d: lerp(from.d, k.d, u), yaw: lerp(from.yaw, k.yaw, u), pitch: lerp(from.pitch, k.pitch, u) };
  }
  // slow push while a key holds (continuous: 0 at the key time)
  return { ...base, d: base.d * (1 - 0.01 * Math.min(el, 6)) };
}

const FilmCamera: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camAt(t);
    const yaw = c.yaw + 0.018 * Math.sin(Math.max(0, t - 0.3) * 0.31);
    const cp = Math.cos(c.pitch);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(c.tg[0] + c.d * cp * Math.sin(yaw), c.tg[1] + c.d * Math.sin(c.pitch), c.tg[2] + c.d * cp * Math.cos(yaw));
    cam.fov = COVER_CAMERA.fov;
    cam.lookAt(...c.tg);
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ---------- hero track ----------
type HeroKey = { at: number; pos: V3; rot: number; pose: AvatarPose; scale?: number; cut?: boolean; dur?: number; movePose?: AvatarPose };
const HOOK_STOP = W("l01", "kabur");
const HERO: HeroKey[] = [
  { at: HOOK_STOP, pos: [0.15 + 0.35 * HOOK_STOP, 0.35, 0.35], rot: 0.5, pose: "cheer", scale: 0.5, cut: true },
  { at: L("l02"), pos: [-1.4, 0.18, -0.2], rot: -1.25, pose: "point", dur: 1.6 },
  { at: W("l03", "rekomendasi"), pos: [-1.4, 0.18, -0.2], rot: 0.5, pose: "cheer" },
  { at: L("l04"), pos: [-5.5, -1.1, 2.4], rot: -2.2, pose: "think", cut: true },
  { at: W("l04", "masuk"), pos: [-4.6, 0.22, -1.35], rot: Math.PI / 2, pose: "run", dur: 0.9 },
  { at: L("l05"), pos: [1.1, 0.18, 0.2], rot: -1.12, pose: "point", cut: true },
  { at: L("l06"), pos: [-1.0, -1.1, 2.9], rot: 1.3, pose: "point", dur: 1.2 },
  { at: L("l07"), pos: [1.2, 0.18, -0.4], rot: 0.6, pose: "jump", dur: 1.2 },
  { at: L("l08"), pos: [1.55, 0.35, 1.05], rot: 0.5, pose: "cheer", dur: 1.0 },
  { at: L("l09"), pos: [-5.4, -1.1, 1.8], rot: -1.2, pose: "wave", cut: true },
  { at: L("l10"), pos: [-5.4, -1.1, 1.8], rot: 0.3, pose: "cheer" },
  { at: L("l11"), pos: [-4.4, -1.1, 3.7], rot: Math.PI / 2, pose: "run", cut: true },
  { at: L("l11") + 0.1, pos: [4.6, -1.1, 3.7], rot: 0.3, pose: "cheer", dur: W("l11", "pertama") - L("l11") },
  { at: L("l12"), pos: [9.4, -1.1, 2.4], rot: -0.3, pose: "think", scale: 0.56, cut: true },
  { at: L("l13"), pos: [-2.05, 0.31, -1.35], rot: 1.0, pose: "point", cut: true },
  { at: W("l13", "langsung"), pos: [1.55, 0.35, 0.95], rot: 0.5, pose: "cheer", dur: 1.1 },
  { at: L("l14"), pos: [-1.2, 0.18, 0.9], rot: Math.PI / 2, pose: "stand", dur: 0.5 },
  { at: W("l14", "level"), pos: [-0.6, 0.48, 0.9], rot: Math.PI / 2, pose: "jump", dur: 0.35, movePose: "jump" },
  { at: W("l14", "gampang"), pos: [0.0, 0.78, 0.9], rot: Math.PI / 2, pose: "jump", dur: 0.3, movePose: "jump" },
  { at: W("l14", "naik"), pos: [0.6, 1.08, 0.9], rot: 0.9, pose: "cheer", dur: 0.3, movePose: "jump" },
  { at: W("l14", "penasaran"), pos: [0.6, 1.08, 0.9], rot: 1.0, pose: "point" },
  { at: L("l15"), pos: [0.6, 0.18, 1.8], rot: 0.3, pose: "wave", dur: 1.0 },
  { at: W("l15", "thumbnail-mu"), pos: [-0.2, -1.1, 11.0], rot: 1.2, pose: "point", cut: true },
  { at: W("l15", "tenggelam"), pos: [-0.2, -1.1, 11.0], rot: 0.6, pose: "wave" },
];

function heroAt(t: number): HookFilm["hero"] {
  if (t < HERO[0].at) {
    const x = 0.15 + 0.35 * t;
    return { pos: [x, x > 0.8 ? 0.35 : 0.18, 0.35], rot: 1.05, pose: "run", scale: 0.5 };
  }
  let i = 0;
  for (let k = 0; k < HERO.length; k++) if (HERO[k].at <= t) i = k;
  const k = HERO[i];
  const scale = k.scale ?? 0.6;
  if (i === 0 || k.cut) return { pos: k.pos, rot: k.rot, pose: k.pose, scale };
  const prev = heroAt(k.at - 1e-4);
  const from = prev.pos;
  const dur = k.dur ?? 1.0;
  const u = (t - k.at) / dur;
  if (u >= 1) return { pos: k.pos, rot: k.rot, pose: k.pose, scale };
  const sc = lerp(prev.scale, scale, smooth(u));
  const dx = k.pos[0] - from[0], dz = k.pos[2] - from[2];
  const moving = Math.hypot(dx, dz) > 0.2;
  const e = k.movePose === "jump" ? clamp(u) : smooth(u);
  const pos = lerp3(from, k.pos, e);
  if (k.movePose === "jump") pos[1] += Math.sin(clamp(u) * Math.PI) * 0.35;
  return { pos, rot: moving ? Math.atan2(dx, dz) : k.rot, pose: moving ? k.movePose ?? "run" : k.pose, scale: sc };
}

// ---------- props ----------
const Board: React.FC<{ spec: BoardSpec; w: number; pos: V3; rotY?: number; t: number; a: number; b: number }> = ({ spec, w, pos, rotY = 0.4, t, a, b }) => {
  const s = pop(t, a, b);
  const h = (w * boardHeight(spec)) / 1024;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={Math.max(s, 0.0001)} visible={s > 0.001}>
      <Box size={[w + 0.14, h + 0.14, 0.16]} pos={[0, 0, -0.1]} color={P.inkBlack} r={0.06} />
      <Print tex={boardTexture(spec)} size={[w, h]} pos={[0, 0, 0]} glow={0.12} />
    </group>
  );
};

const Avatar: React.FC<{ f: number; pose: AvatarPose; pos: V3; rot: number; scale: number; seed: number; colors?: Partial<AvatarColors>; on: boolean; grain: THREE.Texture }> = ({ f, pose, pos, rot, scale, seed, colors, on, grain }) => (
  <group visible={on}>
    <Ink thick={0.05 / scale}>
      <BlockAvatar f={f + seed * 13} pose={pose} seed={seed} position={pos} rotation={[0, rot, 0]} scale={scale} grain={grain} colors={colors} />
    </Ink>
  </group>
);

const TINTS: Partial<AvatarColors>[] = [
  { torso: "#8E6BD8", legs: "#2E3A55" },
  { torso: "#E8873A", legs: "#2E3A55", skin: "#E0B48A" },
  { torso: "#3FA7A0", legs: "#4A4A52" },
  { torso: "#D85A8A", legs: "#2E3A55", skin: "#C98B5E" },
  { torso: "#5B8DEF", legs: "#3B4A2E" },
  { torso: "#F2C14E", legs: "#4A4A52", skin: "#B57A4F" },
];

/** Foreground cluster: crates, a grass block, a stud lamp (pops in after the hook). */
const FGCluster: React.FC<{ pos: V3; rot: number; s: number; grain: THREE.Texture }> = ({ pos, rot, s, grain }) => (
  <group position={pos} rotation={[0, rot, 0]} scale={Math.max(s, 0.0001)} visible={s > 0.001}>
    <Box size={[1.3, 1.3, 1.3]} pos={[0, 0.65, 0]} color="#C98A4B" r={0.1} grain={grain} />
    <Box size={[1.36, 0.14, 1.36]} pos={[0, 1.0, 0]} color="#8A5A3C" r={0.04} />
    <Box size={[0.9, 0.9, 0.9]} pos={[0.2, 1.75, -0.1]} rot={[0, 0.5, 0]} color={P.bodyCoral} r={0.1} grain={grain} />
    <Box size={[1.6, 0.6, 1.6]} pos={[1.55, 0.3, 0.3]} color="#7DBB6A" r={0.12} grain={grain} />
    <Box size={[0.7, 0.7, 0.7]} pos={[1.45, 0.95, 0.5]} color={P.bodyMint} r={0.18} grain={grain} />
    <Box size={[0.16, 2.6, 0.16]} pos={[-1.2, 1.3, 0.4]} color={P.inkBlack} r={0.05} />
    <Box size={[0.5, 0.36, 0.5]} pos={[-1.2, 2.7, 0.4]} color={P.accentYellow} r={0.1} emissive={P.accentYellow} ei={0.5} />
  </group>
);

const Coin: React.FC<{ pos: V3; s: number; spin: number }> = ({ pos, s, spin }) => (
  <mesh position={pos} rotation={[Math.PI / 2, 0, spin]} scale={Math.max(s, 0.0001)} visible={s > 0.001} castShadow>
    <cylinderGeometry args={[0.24, 0.24, 0.08, 28]} />
    <meshPhysicalMaterial color="#F4C430" metalness={0.6} roughness={0.25} emissive="#F4C430" emissiveIntensity={0.25} />
  </mesh>
);

const Lamp: React.FC<{ x: number; on: number }> = ({ x, on }) => (
  <group position={[x, -0.5, M.Z1 + 0.06]} visible={on > 0.001}>
    <mesh scale={0.22 + on * 0.06} onUpdate={noInk}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshBasicMaterial color="#9CFFD0" toneMapped={false} />
    </mesh>
    <mesh position={[0, 0, -0.01]} scale={0.5 * on} onUpdate={noInk}>
      <ringGeometry args={[0.7, 1, 40]} />
      <meshBasicMaterial color="#9CFFD0" transparent opacity={0.6 * on} toneMapped={false} depthWrite={false} />
    </mesh>
  </group>
);

const FilmProps: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const grain = useSurfaceGrain(47, 0.2, 3);
  const fg = smooth((t - L("l02")) / 0.8) * smooth((W("l15", "thumbnail-mu") - t) / 0.5);
  // thin the left FG during the 28-day bar beat so the runner reads whole
  const fgL = fg * (t >= L("l11") - 0.05 && t < L("l12") ? 0 : 1);
  // l04 viewers around the game card
  const viewersOn = t >= L("l04") - 0.1 && t < L("l05");
  // l05 extra quitters through the trapdoor
  const cx = (M.HX0 + M.HX1) / 2, cz = (M.HZ0 + M.HZ1) / 2;
  const quit = (ph: number) => -0.4 - (((t - L("l05") + ph) % 1.8) / 1.8) * 2.4;
  const quitOn = t >= L("l05") && t < L("l06");
  // l07 playtime bar
  const fill = smooth((t - W("l07", "bermain")) / (W("l07", "hari") - W("l07", "bermain")));
  // l09 crowd wave
  const crowdOn = t >= W("l09", "update") && t < L("l11");
  // l10 rings
  const ringT = t - W("l10", "jangkauannya");
  // l11 day bar
  const barS = pop(t, L("l11"), L("l12") - 0.05);
  const allLit = W("l11", "28");
  // l13 menu topples
  const menuS = pop(t, W("l13", "jangan") - 0.25, LE("l13") + 0.4);
  const menuFall = smooth((t - W("l13", "menu")) / 0.5) * 1.35;
  // l14 stairs + mystery box
  const stairS = pop(t, L("l14") - 0.3, L("l15") + 0.6);
  const boxGlow = smooth((t - W("l14", "penasaran")) / 0.4);
  // l15 thumbnail sinks
  const thumbUp = smooth((t - W("l15", "masuk")) / 0.5);
  const thumbSink = smooth((t - W("l15", "tenggelam")) / (OUTRO_AT - W("l15", "tenggelam")));
  const thumbY = -1.6 + thumbUp * 2.6 - thumbSink * 3.2;
  return (
    <>
      {/* foreground layer (pops in after the hook so frame 0.3 s stays the cover) */}
      <FGCluster pos={[-9.6, -1.1, 6.0]} rot={0.4} s={fgL * 0.85} grain={grain} />
      <FGCluster pos={[6.2, -1.1, 6.8]} rot={-0.6} s={fg} grain={grain} />
      <FGCluster pos={[-3.8, -1.1, 8.6]} rot={1.2} s={fgL * 0.8} grain={grain} />
      <FGCluster pos={[13.6, -1.1, 3.4]} rot={-0.2} s={fg} grain={grain} />

      {/* hook: bad sign */}
      <Board spec={{ title: "TANDA BURUK", bg: RED }} w={2.4} pos={[-0.4, 2.7, 1.6]} rotY={0.3} t={t} a={W("l01", "tanda")} b={L("l02") + 0.5} />

      {/* l02: the creator document */}
      {(() => {
        const s = pop(t, W("l02", "menjelaskan"), L("l04"));
        return (
          <group position={[-4.9, 2.9 + Math.sin(t * 1.2) * 0.06, 0.9]} rotation={[0, 0.35, 0.03]} scale={Math.max(s, 0.0001)} visible={s > 0.001}>
            <Box size={[2.36, 2.94, 0.14]} pos={[0, 0, -0.09]} color={P.inkBlack} r={0.06} />
            <Print tex={docTexture()} size={[2.2, 2.75]} pos={[0, 0, 0]} glow={0.1} />
          </group>
        );
      })()}
      {/* l03: halo behind the REKOMENDASI sign */}
      {(() => {
        const s = pop(t, W("l03", "rekomendasi"), L("l04"));
        return (
          <mesh position={[2.35, 6.75, -1.5]} rotation={[0, 0.42, t * 0.8]} scale={Math.max(s * (1 + 0.06 * Math.sin(t * 6)), 0.0001)} visible={s > 0.001} onUpdate={noInk}>
            <ringGeometry args={[1.9, 2.2, 8]} />
            <meshBasicMaterial color={P.accentYellow} toneMapped={false} transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        );
      })()}

      {/* l04: game card + viewers */}
      {(() => {
        const s = pop(t, L("l04") - 0.1, L("l05"));
        return (
          <group position={[-7.4, -1.1, 0.4]} rotation={[0, 0.55, 0]} scale={Math.max(s, 0.0001)} visible={s > 0.001}>
            <Box size={[0.18, 2.4, 0.18]} pos={[0, 1.2, 0]} color={P.inkBlack} r={0.05} />
            <Box size={[2.56, 1.76, 0.14]} pos={[0, 3.2, -0.09]} color={P.inkBlack} r={0.06} />
            <Print tex={gameCardTexture()} size={[2.4, 1.6]} pos={[0, 3.2, 0]} glow={0.1} />
          </group>
        );
      })()}
      {[[-6.5, 1.5, -2.6], [-7.6, 2.0, 3.0], [-8.4, 1.2, 2.3]].map(([x, z, r], k) => (
        <Avatar key={k} f={f} pose="stand" pos={[x, -1.1, z]} rot={r} scale={0.3} seed={20 + k} colors={TINTS[k + 1]} on={viewersOn} grain={grain} />
      ))}
      <Board spec={{ tag: "1", title: "PLAY THROUGH RATE", sub: "MELIHAT → MASUK BERMAIN" }} w={3.4} pos={[-5.2, 4.9, 1.4]} rotY={0.25} t={t} a={W("l04", "play")} b={LE("l04") + 0.2} />

      {/* l05: quitters + bounce board + negative signal */}
      {[0, 0.6, 1.2].map((ph, k) => (
        <Avatar key={k} f={f} pose="jump" pos={[cx + (k - 1) * 0.25, quit(ph), cz + (k % 2) * 0.2]} rot={0.5 + k} scale={0.27} seed={30 + k} colors={TINTS[(k + 3) % 6]} on={quitOn} grain={grain} />
      ))}
      <Board spec={{ tag: "2", title: "FIRST PLAY BOUNCE RATE" }} w={3.6} pos={[-0.5, 4.7, 2.2]} rotY={0.22} t={t} a={W("l05", "first")} b={LE("l05") + 0.2} />
      <Board spec={{ title: "SINYAL NEGATIF", bg: RED }} w={2.2} pos={[-1.2, 1.5, 2.7]} rotY={0.15} t={t} a={W("l05", "ini")} b={LE("l05") + 0.2} />

      {/* l06: play-day lamps */}
      <Lamp x={0.22} on={smooth((t - W("l06", "pertama")) / 0.3) * (t < L("l07") ? 1 : 0)} />
      <Lamp x={1.11} on={smooth((t - W("l06", "ketujuh")) / 0.3) * (t < L("l07") ? 1 : 0)} />
      <Lamp x={2.0} on={smooth((t - W("l06", "delapan")) / 0.3) * (t < L("l07") ? 1 : 0)} />
      <Board spec={{ tag: "3", title: "PEMAIN KEMBALI", sub: "D1 · D2–7 · D8–28" }} w={3.0} pos={[0.45, 3.1, 2.9]} rotY={0.05} t={t} a={W("l06", "berapa")} b={LE("l06") + 0.2} />

      {/* l07: playtime */}
      <Board spec={{ tag: "4", title: "LAMA BERMAIN", sub: "MAKS 60 MENIT / PEMAIN / HARI" }} w={3.4} pos={[-0.9, 4.7, 1.7]} rotY={0.6} t={t} a={W("l07", "keempat")} b={LE("l07") + 0.2} />
      {(() => {
        const s = pop(t, W("l07", "lama"), LE("l07") + 0.2);
        return (
          <group position={[-0.9, 3.65, 1.7]} rotation={[0, 0.6, 0]} scale={Math.max(s, 0.0001)} visible={s > 0.001}>
            <Box size={[3.0, 0.42, 0.2]} pos={[0, 0, -0.05]} color={P.inkBlack} r={0.08} />
            <Box size={[Math.max(0.02, 2.8 * fill), 0.26, 0.22]} pos={[-1.4 + 1.4 * fill, 0, 0.02]} color={P.bodyMint} r={0.06} emissive="#7CF0B0" ei={0.4} />
          </group>
        );
      })()}

      {/* l08: friend co-play + spend */}
      <Avatar f={f} pose="cheer" pos={[2.55, 0.35, 0.55]} rot={-0.2} scale={0.42} seed={41} colors={TINTS[3]} on={t >= L("l08") && t < L("l09")} grain={grain} />
      <Board spec={{ title: "SINYAL TAMBAHAN", sub: "MAIN BARENG TEMAN" }} w={3.4} pos={[1.8, 5.1, 1.7]} rotY={0.8} t={t} a={W("l08", "sinyal")} b={W("l08", "belanja") - 0.05} />
      <Board spec={{ title: "BELANJA DI GAME", bg: P.bodyMint }} w={3.0} pos={[2.0, 5.0, 1.8]} rotY={0.9} t={t} a={W("l08", "belanja")} b={LE("l08") + 0.4} />
      {[0, 1, 2, 3].map((k) => {
        const a = W("l08", "belanja") + k * 0.12;
        const s = pop(t, a, LE("l08") + 0.4);
        return <Coin key={k} pos={[2.2 + (k - 1.5) * 0.35, 1.35 + Math.max(0, t - a) * 0.4 + (k % 2) * 0.2, 0.55]} s={s} spin={t * 4 + k} />;
      })}

      {/* l09: update + wave of new players */}
      <Board spec={{ title: "UPDATE!", bg: P.accentYellow, titleColor: "#FFFFFF" }} w={1.9} pos={[-2.4, 4.6, 0.2]} rotY={0.2} t={t} a={W("l09", "update")} b={W("l09", "gelombang")} />
      {Array.from({ length: 10 }, (_, k) => {
        const row = k % 2, col = Math.floor(k / 2);
        const goal = -6.3 - col * 0.85;
        const x = Math.min(goal, -16 + (t - W("l09", "update")) * 3.2 - col * 0.85);
        const arrived = x >= goal - 0.01;
        return (
          <Avatar key={k} f={f} pose={arrived ? (t > W("l10", "betah") ? "cheer" : "stand") : "run"} pos={[x, -1.1, 0.4 + row * 1.0]} rot={Math.PI / 2} scale={0.3} seed={50 + k} colors={TINTS[k % 6]} on={crowdOn} grain={grain} />
        );
      })}
      <Board spec={{ title: "GELOMBANG PEMAIN BARU" }} w={4.4} pos={[-8.0, 3.6, 2.2]} rotY={0.12} t={t} a={W("l09", "gelombang")} b={LE("l10")} />
      {/* l10: reach expands */}
      {[0, 1, 2].map((k) => {
        const u = ringT - k * 0.35;
        const on = u > 0 && t < L("l11");
        const r = 2 + u * 7;
        return (
          <mesh key={k} position={[-1, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={on} onUpdate={noInk}>
            <ringGeometry args={[r, r + 0.35, 72]} />
            <meshBasicMaterial color={P.bodyMint} transparent opacity={clamp(1 - u / 1.6) * 0.9} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
      <Board spec={{ title: "JANGKAUAN DIPERLUAS", bg: P.bodyMint }} w={6.4} pos={[-1, 6.4, 1.5]} rotY={0.35} t={t} a={W("l10", "jangkauannya")} b={LE("l10") + 0.3} />

      {/* l11: 28-day bar */}
      <group scale={[1, Math.max(barS, 0.0001), 1]} visible={barS > 0.001}>
        {Array.from({ length: 28 }, (_, i) => {
          const lit = i < 7 || t >= allLit + i * 0.03;
          return (
            <Box key={i} size={[0.34, 0.34, 0.6]} pos={[-5.4 + i * 0.4, -0.93, 4.5]} color={i < 7 ? P.accentYellow : lit ? P.bodyMint : "#B9C1C9"} r={0.06} emissive={lit ? (i < 7 ? P.accentYellow : "#7CF0B0") : "#000"} ei={lit ? 0.35 : 0} />
          );
        })}
      </group>
      <Board spec={{ title: "RDC 2026", bg: P.inkBlack, titleColor: P.accentYellow }} w={2.4} pos={[-2.0, 3.4, 4.7]} rotY={0.18} t={t} a={W("l11", "rdc")} b={allLit - 0.05} />
      <Board spec={{ title: "SAMPAI 28 HARI", sub: "BUKAN CUMA MINGGU PERTAMA" }} w={3.6} pos={[0.2, 3.1, 4.7]} rotY={0.08} t={t} a={allLit} b={LE("l11") + 0.3} />

      {/* l12: young vs older players */}
      <Avatar f={f} pose="cheer" pos={[7.2, -1.1, 2.8]} rot={0.3} scale={0.34} seed={61} colors={{ torso: "#F2C14E", legs: "#3B4A2E" }} on={t >= L("l12") && t < L("l13")} grain={grain} />
      {(() => {
        const s = pop(t, L("l12") - 0.05, L("l13"));
        return (
          <group scale={Math.max(s, 0.0001)} visible={s > 0.001}>
            <Box size={[0.8, 0.8, 0.8]} pos={[6.4, -0.7, 2.1]} color={P.bodyCoral} r={0.1} grain={grain} />
            <Box size={[0.6, 0.5, 0.6]} pos={[6.4, -0.05, 2.1]} color={P.accentYellow} r={0.1} grain={grain} />
            {Array.from({ length: 6 }, (_, k) => (
              <Box key={k} size={[1.1 - k * 0.08, 0.8, 1.1 - k * 0.08]} pos={[10.6, -0.7 + k * 0.8, 1.3]} color={k % 2 ? "#5B8DEF" : P.bodyMint} r={0.1} grain={grain} />
            ))}
          </group>
        );
      })()}
      <Board spec={{ title: "PEMAIN MUDA", sub: "GAME PENDEK" }} w={2.6} pos={[7.0, 2.5, 3.0]} rotY={0.3} t={t} a={W("l12", "muda")} b={LE("l12") + 0.3} />
      <Board spec={{ title: "PEMAIN LEBIH TUA", sub: "GAME DALAM" }} w={3.0} pos={[9.3, 4.8, 2.4]} rotY={0.35} t={t} a={W("l12", "tua")} b={LE("l12") + 0.3} />

      {/* l13: teach the core, skip the long menu */}
      <Board spec={{ title: "AJARKAN INTI PERMAINAN" }} w={3.6} pos={[-0.6, 5.1, 0.9]} rotY={0.5} t={t} a={W("l13", "ajarkan")} b={W("l13", "langsung") - 0.05} />
      <Board spec={{ title: "LANGSUNG KE BAGIAN SERU", bg: P.accentYellow }} w={3.6} pos={[0.8, 5.1, 1.1]} rotY={0.6} t={t} a={W("l13", "langsung")} b={LE("l13") + 0.3} />
      <group position={[-2.5, 0.18, 0.5]} rotation={[-menuFall, 0.5, 0]} scale={Math.max(menuS, 0.0001)} visible={menuS > 0.001}>
        <Box size={[1.26, 2.22, 0.12]} pos={[0, 1.11, -0.08]} color={P.inkBlack} r={0.05} />
        <Print tex={menuTexture()} size={[1.15, 2.05]} pos={[0, 1.11, 0]} />
        <group position={[0, 1.11, 0.12]} visible={t > W("l13", "menu")}>
          <Box size={[1.6, 0.22, 0.08]} pos={[0, 0, 0]} rot={[0, 0, 0.8]} color={RED} r={0.04} />
          <Box size={[1.6, 0.22, 0.08]} pos={[0, 0, 0]} rot={[0, 0, -0.8]} color={RED} r={0.04} />
        </group>
      </group>

      {/* l14: easy first levels + curiosity box */}
      <group scale={[1, Math.max(stairS, 0.0001), 1]} visible={stairS > 0.001}>
        {[0, 1, 2].map((k) => (
          <Box key={k} size={[0.6, 0.3 * (k + 1), 0.8]} pos={[-0.6 + k * 0.6, 0.18 + 0.15 * (k + 1), 0.9]} color={[P.bodyMint, P.accentYellow, P.bodyCoral][k]} r={0.06} grain={grain} />
        ))}
      </group>
      <group position={[1.7, 4.3 + Math.sin(t * 2.4) * 0.12, 0.5]} rotation={[0.2, t * 0.7, 0]} scale={Math.max(stairS * 0.95, 0.0001)} visible={stairS > 0.001}>
        <Box size={[0.9, 0.9, 0.9]} pos={[0, 0, 0]} color={P.accentYellow} r={0.1} emissive={P.accentYellow} ei={0.15 + boxGlow * 0.7} />
        {[0, 1, 2, 3].map((k) => (
          <Print key={k} tex={mysteryTexture()} size={[0.8, 0.8]} pos={[Math.sin((k * Math.PI) / 2) * 0.46, 0, Math.cos((k * Math.PI) / 2) * 0.46]} rot={[0, (k * Math.PI) / 2, 0]} glow={0.2 + boxGlow * 0.5} />
        ))}
      </group>
      <Board spec={{ title: "LEVEL AWAL GAMPANG NAIK", bg: P.bodyMint }} w={3.6} pos={[-1.0, 5.5, 1.3]} rotY={0.45} t={t} a={W("l14", "level")} b={W("l14", "penasaran") - 0.05} />
      <Board spec={{ title: "RASA PENASARAN", sub: "SUPAYA KEMBALI BESOK" }} w={3.4} pos={[-0.6, 5.7, 1.3]} rotY={0.4} t={t} a={W("l14", "penasaran")} b={LE("l14") + 0.4} />

      {/* l15: thumbnail sinking (next episode) */}
      <group position={[2.0, thumbY, 11.0]} rotation={[-0.12, 0.3, 0.06 + thumbSink * 0.2]} visible={t > W("l15", "masuk") - 0.1 && thumbY > -2.6}>
        <Box size={[3.36, 1.95, 0.14]} pos={[0, 0, -0.09]} color={P.inkBlack} r={0.05} />
        <Print tex={thumbTexture()} size={[3.2, 1.8]} pos={[0, 0, 0]} glow={0.12} />
      </group>
      {[0, 1].map((k) => {
        const u = t - W("l15", "tenggelam") - k * 0.4;
        const r = 0.8 + u * 1.6;
        return (
          <mesh key={k} position={[2.0, -1.08, 11.0]} rotation={[-Math.PI / 2, 0, 0]} visible={u > 0 && u < 2} onUpdate={noInk}>
            <ringGeometry args={[r, r + 0.12, 56]} />
            <meshBasicMaterial color={P.inkBlack} transparent opacity={clamp(1 - u / 2) * 0.7} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- captions (karaoke) ----------
type Page = { words: Word[]; rows: Word[][]; s: number; e: number };
const PAGES: Page[] = (() => {
  const out: Page[] = [];
  const MAXC = 19;
  for (const l of LINES) {
    const rows: Word[][] = [];
    let cur: Word[] = [];
    let n = 0;
    for (const w of l.words) {
      if (cur.length && n + w.w.length + 1 > MAXC) {
        rows.push(cur);
        cur = [];
        n = 0;
      }
      cur.push(w);
      n += w.w.length + 1;
    }
    if (cur.length) rows.push(cur);
    for (let i = 0; i < rows.length; i += 2) {
      const r = rows.slice(i, i + 2);
      const words = r.flat();
      out.push({ words, rows: r, s: words[0].s, e: words[words.length - 1].e });
    }
  }
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1];
    out[i].e = next ? Math.min(next.s, out[i].e + 0.6) : out[i].e + 0.6;
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const p = PAGES.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!p || t >= OUTRO_AT) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(28,30,33,0.86)", borderRadius: 26, padding: "14px 30px 10px", border: `5px solid ${P.inkBlack}`, boxShadow: "0 10px 0 rgba(28,30,33,0.35)", transform: "skewX(-4deg)" }}>
        {p.rows.map((r, i) => (
          <div key={i} style={{ textAlign: "center", lineHeight: 1.12, whiteSpace: "nowrap" }}>
            {r.map((w, k) => {
              const active = t >= w.s && t < w.e + 0.04;
              const done = t >= w.e;
              const b = active ? 1 + 0.04 * Math.sin(clamp((t - w.s) / Math.max(0.08, w.e - w.s)) * Math.PI) : 1;
              return (
                <span
                  key={k}
                  style={{
                    display: "inline-block",
                    margin: "0 0.2em",
                    fontFamily: BANGERS,
                    fontSize: 74,
                    letterSpacing: 1.5,
                    color: active ? P.accentYellow : done ? "#FFFFFF" : "rgba(255,255,255,0.72)",
                    transform: `scale(${b})`,
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- side signs: each one only in the beats it belongs to (fully in or out of frame) ----------
const on = (t: number, a: number, b: number) => (a <= 0 ? 1 : smooth((t - a) / 0.35)) * smooth((b - t) / 0.35);
const anyOn = (t: number, w: [number, number][]) => Math.min(1, w.reduce((m, [a, b]) => Math.max(m, on(t, a, b)), 0));
function signVis(t: number) {
  const hookEnd = W("l01", "kabur") + 0.5;
  return {
    timer: anyOn(t, [[0, hookEnd], [W("l03", "ada"), W("l03", "rekomendasi")], [L("l10"), L("l11")], [L("l15"), W("l15", "thumbnail-mu")]]),
    reco: anyOn(t, [[0, hookEnd], [W("l03", "ada"), L("l04")], [L("l10"), L("l11")], [L("l15"), W("l15", "thumbnail-mu")]]),
    keluar: anyOn(t, [[0, L("l02")]]),
    seru: anyOn(t, [[0, hookEnd], [L("l08"), L("l09")]]),
  };
}

// ---------- big HUD tags for spoken labels (≥ 34 px at 1080) ----------
const HudTag: React.FC<{ text: string; t: number; a: number; b: number; bg: string; color?: string }> = ({ text, t, a, b, bg, color = "#FFFFFF" }) => {
  const s = pop(t, a, b);
  if (s <= 0.001) return null;
  return (
    <div style={{ display: "inline-block", margin: "0 12px", transform: `scale(${s}) skewX(-6deg)`, fontFamily: BANGERS, fontSize: 76, letterSpacing: 2, color, background: bg, border: `6px solid ${P.inkBlack}`, borderRadius: 18, padding: "6px 26px 0", boxShadow: `0 8px 0 ${P.inkBlack}`, WebkitTextStroke: `3px ${P.inkBlack}`, paintOrder: "stroke fill" }}>
      {text}
    </div>
  );
};
const HudTags: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 40, right: 40, bottom: 640, textAlign: "center" }}>
    <HudTag text="< 60 DETIK" t={t} a={W("l05", "60")} b={W("l05", "ini") - 0.1} bg={RED} />
    <HudTag text="< 3 MENIT" t={t} a={W("l05", "tiga")} b={W("l05", "ini") - 0.1} bg={RED} />
    <HudTag text="D1" t={t} a={W("l06", "pertama")} b={LE("l06") + 0.3} bg={P.bodyMint} />
    <HudTag text="D2–7" t={t} a={W("l06", "ketujuh")} b={LE("l06") + 0.3} bg={P.bodyMint} />
    <HudTag text="D8–28" t={t} a={W("l06", "delapan")} b={LE("l06") + 0.3} bg={P.bodyMint} />
    <HudTag text="EPISODE BERIKUTNYA" t={t} a={W("l15", "episode")} b={OUTRO_AT} bg={P.accentYellow} />
  </div>
);

// ---------- film ----------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const film: HookFilm = {
    hero: heroAt(t),
    timer: (0.74 + t * 0.012) % 1,
    fallY: -0.85 - (t % 2.6) * 0.6,
    vis: signVis(t),
  };
  const headline = 1 - smooth((t - W("l01", "kalau")) / 0.4);
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: HOOK_BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 200 }}>
        <FilmCamera t={t} />
        <HookWorld f={f} film={film}>
          <FilmProps t={t} f={f} />
        </HookWorld>
        <Finish frame={Math.round(f)} background={HOOK_BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.9} envIntensity={0.25} ao={false} />
      </ThreeCanvas>
      <AbsoluteFill style={{ width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {headline > 0.001 && (
          <AbsoluteFill style={{ opacity: headline }}>
            <HookHeadline />
          </AbsoluteFill>
        )}
        <HudTags t={t} />
        <Captions t={t} />
      </AbsoluteFill>
      <AudiraOutro seconds={TOTAL_SECONDS - OUTRO_AT} />
      <AudiraSignature seed="roblox-map-baru-ep03" />
    </AbsoluteFill>
  );
};
