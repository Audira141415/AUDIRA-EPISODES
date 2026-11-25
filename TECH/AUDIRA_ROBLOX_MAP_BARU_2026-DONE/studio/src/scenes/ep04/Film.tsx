// EP04 film (ARCADECRT): "Thumbnail anti tenggelam".
// One continuous midnight arcade over black water, grown from the cover (Hook.tsx). Every camera key
// and timed event is anchored to a word of the locked voice (timeline.json), never to absolute seconds.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import { loadFont as loadVT } from "@remotion/google-fonts/VT323";
import timeline from "./timeline.json";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ARCADE_PALETTE as P } from "../../kits/arcadecrt/lib/palette";
import { BlockAvatar, AvatarPose } from "../_shared/BlockAvatar.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { BG, Bubbles, COVER_CAMERA, HERO, HOOK_AVATAR, Monitor, Plinth, Ripples, Shards, WALL, WATER_Y, glowTex, hookCamera } from "./Hook.tsx";
import { HeroMode, PHONE, drawHero, drawPhone, labelTexture, liveCanvas, stampTexture, versionTexture } from "./filmTextures.ts";
import { THUMB, drawThumb } from "./thumbTextures.ts";

export const TOTAL_SECONDS: number = timeline.total;

const { fontFamily: BUNGEE } = loadBungee("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: VT } = loadVT("normal", { weights: ["400"], subsets: ["latin"] });

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------
// Word anchors
type Line = (typeof timeline.lines)[number];
const LINES: Record<string, Line> = Object.fromEntries(timeline.lines.map((l) => [l.id, l]));
const norm = (s: string) => s.toLowerCase().replace(/[.,:;!?"]/g, "");
/** Start time (s) of `word` in line `id` (nth occurrence). Throws if missing so a typo can't desync. */
const W = (id: string, word: string, nth = 0): number => {
  const hits = LINES[id].words.filter((w) => norm(w.w) === norm(word));
  if (!hits[nth]) throw new Error(`EP04 anchor missing: ${id} "${word}" #${nth}`);
  return hits[nth].s;
};

const A = {
  roblox1: W("l01", "Roblox"),
  gambar: W("l02", "Gambar"),
  menurut: W("l03", "Menurut"),
  wajib: W("l03", "wajib"),
  bawaan: W("l03", "Thumbnail"),
  bawaanTidak: W("l03", "tidak"),
  format: W("l04", "Formatnya"),
  ratio: W("l04", "16:9"),
  px: W("l04", "1920×1080"),
  mb: W("l04", "3"),
  personal: W("l05", "personalisasi"),
  two: W("l05", "2"),
  five: W("l05", "5"),
  robloxPick: W("l05", "Roblox"),
  memilih: W("l05", "memilih"),
  dalam: W("l06", "Dalam"),
  naik1: W("l06", "naik", 0),
  p85: W("l06", "8,5%"),
  p50: W("l06", "50%"),
  mau: W("l07", "Mau"),
  video: W("l07", "video?"),
  asli: W("l07", "gameplay"),
  tanpa: W("l07", "tanpa"),
  maks: W("l07", "maksimal"),
  hati: W("l08", "Hati-hati"),
  robux: W("l08", "Robux"),
  tidakPrio: W("l08", "tidak"),
  judul9: W("l09", "Judul"),
  sesuai: W("l09", "sesuai"),
  makin: W("l09", "makin"),
  satu: W("l10", "Satu"),
  moments: W("l10", "Moments"),
  diklik: W("l10", "diklik"),
  penuh: W("l10", "penuh"),
  jadi: W("l11", "Jadi"),
  sentuhan: W("l11", "sentuhanmu"),
  tunjukkan: W("l12", "Tunjukkan"),
  buat: W("l12", "buat"),
  beberapa: W("l12", "beberapa"),
  versi: W("l12", "versi"),
  data: W("l12", "data"),
  pemenang: W("l12", "pemenangnya"),
  episode: W("l13", "Episode"),
};
const OUTRO_AT = timeline.voEnd + 0.6;

// ---------------------------------------------------------------------------------------------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const k = clamp01(x);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const win = (t: number, a: number, d: number) => clamp01((t - a) / d);
/** 0 → 1 rising from `tIn`, back to 0 sinking from `tOut`. */
const riseSink = (t: number, tIn: number, tOut = Infinity, dIn = 0.9, dOut = 1.2) => easeOut(win(t, tIn, dIn)) * (1 - ease(win(t, tOut, dOut)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------------------------------------------------------------------------------------
// Camera: keys anchored to words; each key blends in over `dur`, then the pose keeps a slow drift
// (push toward the target + gentle sway) so the frame never parks.
type CamKey = { at: number; dur: number; p: V3; t: V3; fov?: number };
const CAM: CamKey[] = [
  { at: A.gambar - 0.4, dur: 1.8, p: [0, 2.8, 24.5], t: [0, 1.7, 0] },
  { at: A.bawaan - 0.2, dur: 1.5, p: [2.6, 0.6, 16.5], t: [5.0, -2.4, 4] },
  { at: A.format - 0.2, dur: 1.6, p: [-0.4, 2.4, 22.5], t: [0, 1.0, 0.5] },
  { at: A.personal - 0.3, dur: 2.0, p: [0, 9.5, 26.5], t: [0, -0.3, 4.5] },
  { at: A.dalam - 0.3, dur: 2.6, p: [11, 4.0, 22.5], t: [3.4, 1.8, 2.5] },
  { at: A.mau - 0.2, dur: 2.3, p: [0.3, 2.4, 22.5], t: [0, 1.2, 1] },
  { at: A.hati - 0.1, dur: 1.6, p: [-3.4, 2.8, 25.5], t: [-2.4, -0.1, 5] },
  { at: A.judul9 - 0.1, dur: 1.5, p: [-0.4, 3.0, 24.5], t: [-0.4, 0.4, 3] },
  { at: A.satu + 0.3, dur: 1.6, p: [0.5, 2.4, 25.5], t: [0.5, 0.3, 5.5] },
  { at: A.jadi - 0.1, dur: 1.5, p: [0.6, 2.2, 21.5], t: [0, 1.0, 0] },
  { at: A.buat - 0.3, dur: 2.0, p: [0, 5.5, 28], t: [0, 0.6, 3.5] },
  { at: A.episode, dur: 4.5, p: [-1.2, 7, 32.5], t: [0, 1.8, 0], fov: 44 },
];

type Pose = { p: V3; t: V3; fov: number };
const drifted = (k: CamKey, tt: number): Pose => {
  const h = Math.max(0, tt - k.at);
  const push = Math.min(1.6, h * 0.11);
  const d: V3 = [k.t[0] - k.p[0], k.t[1] - k.p[1], k.t[2] - k.p[2]];
  const len = Math.hypot(...d) || 1;
  const sway = Math.sin(tt * 0.31 + k.at) * 0.35;
  return { p: [k.p[0] + (d[0] / len) * push + sway, k.p[1] + (d[1] / len) * push + Math.sin(tt * 0.23) * 0.12, k.p[2] + (d[2] / len) * push], t: k.t, fov: k.fov ?? COVER_CAMERA.fov };
};
const cameraAt = (tt: number): Pose => {
  const h = hookCamera(tt);
  let cur: Pose = { p: h.position, t: h.target, fov: h.fov };
  for (const k of CAM) {
    if (tt < k.at) break;
    const nxt = drifted(k, tt);
    const e = ease((tt - k.at) / k.dur);
    cur = { p: lerp3(cur.p, nxt.p, e), t: lerp3(cur.t, nxt.t, e), fov: lerp(cur.fov, nxt.fov, e) };
  }
  return cur;
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = cameraAt(t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.p);
    cam.fov = c.fov;
    cam.lookAt(...c.t);
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ---------------------------------------------------------------------------------------------
// Avatar: keyed stations; moves between them in a jump arc (pose "jump" while airborne).
const TV_TOP = HERO.pos[1] + ((HERO.sw * 9) / 16 + 1.3 * (HERO.sw / 7)) / 2;
const PAD_Y = WATER_Y + 0.5;
type AvKey = { at: number; dur: number; p: V3; ry: number; pose: AvatarPose; arc?: number };
const AV: AvKey[] = [
  { at: A.roblox1 + 0.25, dur: 1.2, p: [2.3, TV_TOP, 0.3], ry: -0.35, pose: "point", arc: 2.6 },
  { at: A.bawaan - 0.5, dur: 0.8, p: [2.3, TV_TOP, 0.3], ry: -1.0, pose: "point" },
  { at: A.format, dur: 1.0, p: [-2.3, TV_TOP, 0.3], ry: 0.55, pose: "point", arc: 1.6 },
  { at: A.two - 0.4, dur: 0.6, p: [-2.3, TV_TOP, 0.3], ry: 0.2, pose: "wave" },
  { at: A.naik1 - 0.3, dur: 0.6, p: [-1.6, TV_TOP, 0.3], ry: 0.75, pose: "cheer" },
  { at: A.mau, dur: 0.9, p: [2.5, TV_TOP, 0.3], ry: -0.55, pose: "type", arc: 1.4 },
  { at: A.hati - 0.3, dur: 1.3, p: [-0.6, PAD_Y, 6.3], ry: -1.05, pose: "point", arc: 3 },
  { at: A.judul9 - 0.2, dur: 1.1, p: [0, TV_TOP, 0.3], ry: 0, pose: "think", arc: 3 },
  { at: A.moments - 0.4, dur: 1.1, p: [2.0, PAD_Y, 6.4], ry: -1.0, pose: "point", arc: 2.5 },
  { at: A.penuh - 0.3, dur: 0.6, p: [2.0, PAD_Y, 6.4], ry: -0.4, pose: "think" },
  { at: A.jadi, dur: 1.4, p: [2.5, TV_TOP, 0.3], ry: -0.6, pose: "type", arc: 3.6 },
  { at: A.tunjukkan, dur: 0.6, p: [2.5, TV_TOP, 0.3], ry: -0.4, pose: "point" },
  { at: A.pemenang - 0.3, dur: 0.5, p: [2.5, TV_TOP, 0.3], ry: -0.3, pose: "cheer" },
  { at: A.episode + 0.6, dur: 1.2, p: [0.2, TV_TOP, 0.3], ry: 0, pose: "wave", arc: 1.2 },
];
const avatarAt = (tt: number) => {
  let p: V3 = HOOK_AVATAR.pos;
  let rot: V3 = HOOK_AVATAR.rot;
  let pose: AvatarPose = HOOK_AVATAR.pose;
  let fOff = HOOK_AVATAR.fOffset;
  for (const k of AV) {
    if (tt < k.at) break;
    const e = ease((tt - k.at) / k.dur);
    const airborne = (k.arc ?? 0) > 0 && e < 1;
    const np = lerp3(p, k.p, e);
    np[1] += Math.sin(Math.PI * e) * (k.arc ?? 0);
    p = np;
    rot = [lerp(rot[0], 0, e), lerp(rot[1], k.ry, e), lerp(rot[2], 0, e)];
    pose = airborne ? "jump" : e > 0.5 || !(k.arc ?? 0) ? k.pose : pose;
    fOff = 0;
  }
  return { p, rot, pose, fOff };
};

// ---------------------------------------------------------------------------------------------
// 3D label: dark slab with a neon face; rises out of the water / pops in.
const Tag3D: React.FC<{ pos: V3; size: [number, number]; r: number; lines: [string, number, string][]; border?: string; rotY?: number; tex?: [number, number] }> = ({ pos, size, r, lines, border = P.magenta, rotY = 0, tex = [512, 256] }) => {
  if (r <= 0.01) return null;
  const map = labelTexture(lines, tex[0], tex[1], border);
  const s = 0.6 + 0.4 * r;
  return (
    <group position={[pos[0], pos[1] - (1 - r) * 1.2, pos[2]]} rotation={[0, rotY, 0]} scale={s}>
      <mesh castShadow>
        <RoundedBoxGeo args={[size[0] + 0.12, size[1] + 0.12, 0.2]} radius={0.06} segments={3} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#121030" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={map} toneMapped={false} transparent opacity={r} />
      </mesh>
      <mesh position={[0, 0, 0.2]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[size[0] * 1.8, size[1] * 2.2]} />
        <meshBasicMaterial map={glowTex()} color={border} transparent opacity={0.16 * r} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Red stamp plane popping onto a screen. */
const Stamp: React.FC<{ text: string; k: number; pos: V3; w: number }> = ({ text, k, pos, w }) => {
  if (k <= 0.01) return null;
  const s = lerp(1.6, 1, easeOut(k));
  return (
    <mesh position={pos} rotation={[0, 0, -0.12]} scale={s}>
      <planeGeometry args={[w, w / 4]} />
      <meshBasicMaterial map={stampTexture(text)} transparent opacity={Math.min(1, k * 1.5)} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** Neon bar (statistic) rising from the water. */
const Bar: React.FC<{ pos: V3; h: number; k: number; color: string }> = ({ pos, h, k, color }) => {
  if (k <= 0.01) return null;
  const hh = Math.max(0.05, h * k);
  const base = WATER_Y - 0.4;
  return (
    <group position={[pos[0], 0, pos[2]]}>
      <mesh position={[0, base + (hh + 0.4) / 2, 0]} castShadow>
        <RoundedBoxGeo args={[1.5, hh + 0.4, 1.5]} radius={0.12} segments={3} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.55} clearcoat={0.1} color={color} emissive={color} emissiveIntensity={color === "#E09A00" ? 0.12 : 0.45} />
      </mesh>
      <pointLight position={[0, base + hh, 1.4]} color={color} intensity={5 * k} distance={6} decay={2} />
    </group>
  );
};

/** Floating neon pad (where the avatar stands on the water). */
const Pad: React.FC<{ pos: V3; size: [number, number]; r: number }> = ({ pos, size, r }) => {
  if (r <= 0.01) return null;
  const y = pos[1] - (1 - r) * 1.5;
  return (
    <group position={[pos[0], y, pos[2]]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[size[0], 0.5, size[1]]} radius={0.14} segments={3} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1B1F48" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.0, size[1] / 2 + 0.01]}>
        <planeGeometry args={[size[0] - 0.2, 0.08]} />
        <meshBasicMaterial color={P.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Gold star crown above the winning thumbnail. */
const starGeo = (() => {
  let g: THREE.ExtrudeGeometry | null = null;
  return () => {
    if (g) return g;
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 ? 0.42 : 1;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 3 });
    g.center();
    return g;
  };
})();

// ---------------------------------------------------------------------------------------------
// Beat props, all positioned relative to the hero screen at the origin.
const VERS_X = [-5.6, -2.8, 0, 2.8, 5.6];
const versionPos = (i: number): V3 => {
  const sw = 2.6;
  const bh = (sw * 9) / 16 + 1.3 * (sw / 7);
  return [VERS_X[i], WATER_Y + bh / 2 + 0.15, 6.2 - Math.abs(VERS_X[i]) * 0.12];
};
const PLAYERS: { x: number; to: number; col: { torso: string; legs: string } }[] = [
  { x: -3.8, to: 1, col: { torso: P.magenta, legs: "#2E2E4A" } },
  { x: 0.3, to: 4, col: { torso: P.orange, legs: "#1B4DFF" } },
  { x: 4.2, to: 2, col: { torso: P.phosphorGreen, legs: "#3A2A7A" } },
];
const PLAYER_Z = 9.6;

const Beam: React.FC<{ a: V3; b: V3; k: number; color: string }> = ({ a, b, k, color }) => {
  if (k <= 0.01) return null;
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const end = va.clone().lerp(vb, k);
  const mid = va.clone().add(end).multiplyScalar(0.5);
  const len = va.distanceTo(end);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.05, 0.05, len, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
    </mesh>
  );
};

const FilmWorld: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const hero = useMemo(() => liveCanvas(THUMB.w, THUMB.h), []);
  const phone = useMemo(() => liveCanvas(PHONE.w, PHONE.h), []);
  const mismatchTex = useMemo(() => {
    const a = liveCanvas(THUMB.w, THUMB.h);
    drawThumb(a.ctx, "race", 31);
    const b = liveCanvas(THUMB.w, THUMB.h);
    drawThumb(b.ctx, "obby", 32);
    return [a.tex, b.tex];
  }, []);
  const keyTarget = useMemo(() => new THREE.Object3D(), []);

  // hero screen content by beat
  let mode: HeroMode = "thumb";
  let k = 0;
  if (t >= A.menurut && t < A.format) {
    mode = "feed";
    k = win(t, A.wajib, 0.6);
  } else if (t >= A.format && t < A.personal) {
    mode = "spec";
    k = win(t, A.ratio, 0.6);
  } else if (t >= A.video && t < A.hati) {
    mode = "video";
    k = win(t, A.video, A.hati - A.video);
  } else if (t >= A.jadi && t < A.tunjukkan) {
    mode = "trend";
    k = win(t, A.sentuhan - 0.2, 0.8);
  } else if (t >= A.tunjukkan) {
    mode = "moment";
    k = win(t, A.pemenang, 0.6);
  }
  const press = Math.max(0, 1 - Math.abs(t - (A.diklik + 0.15)) / 0.3);
  useLayoutEffect(() => {
    drawHero(hero.ctx, mode, t, k);
    hero.tex.needsUpdate = true;
    drawPhone(phone.ctx, t, press);
    phone.tex.needsUpdate = true;
  });

  const av = avatarAt(t);
  keyTarget.position.set(av.p[0], av.p[1] + 2, av.p[2]);
  keyTarget.updateMatrixWorld();

  // wall items: the two foreground losers get their own story
  const wallY = (i: number) => {
    const w = WALL[i];
    const base = w.pos[1];
    if (i === 10) {
      // ROBUX clickbait: sinks after the hook, comes back for l08, then is pushed under
      const hookY = base - w.sinkRate * Math.min(t, 4.4);
      const gone = ease(win(t, A.gambar, 3));
      const back = ease(win(t, A.hati - 0.6, 1.4));
      const under = ease(win(t, A.tidakPrio + 0.4, 1.8));
      return lerp(lerp(hookY, base - 6, gone), base + 0.9, back) - under * 6.5;
    }
    if (i === 11) {
      const hookY = base - w.sinkRate * Math.min(t, 4.4);
      const up = ease(win(t, A.bawaan - 0.6, 1.0));
      const under = ease(win(t, A.format - 0.3, 1.8));
      return lerp(hookY, base + 0.7, up) - under * 6.5;
    }
    let y = base - w.sinkRate * Math.min(t, 4.4);
    if (i >= 6 && i <= 9) y -= ease(win(t, A.pemenang + 0.5, 2.2)) * 8;
    return y;
  };

  const robuxStamp = win(t, A.tidakPrio, 0.35);
  const defaultStamp = win(t, A.bawaanTidak, 0.35);

  // personalisation versions + players
  const versR = (i: number) => riseSink(t, (i < 2 ? A.two : A.five) - 0.15 + (i % 3) * 0.12, A.dalam + 0.2, 0.8, 1.3);
  const playersR = riseSink(t, A.robloxPick - 0.3, A.dalam + 0.2, 0.7, 1.2);
  const beamK = win(t, A.memilih, 0.8) * (1 - win(t, A.dalam, 0.4));

  // stats bars
  const bar1 = riseSink(t, A.p85 - 0.35, A.mau + 0.4, 1.0, 1.4);
  const bar2 = riseSink(t, A.p50 - 0.35, A.mau + 0.4, 1.1, 1.4);

  // video rules tags
  const tagR = [A.asli - 0.25, A.tanpa - 0.25, A.maks - 0.25].map((a) => riseSink(t, a, A.hati + 0.3, 0.6, 1.0));

  // mismatch pair
  const mmR = riseSink(t, A.judul9 - 0.3, A.satu + 0.3, 0.9, 1.3);
  const mmDim = win(t, A.makin, 1.0);
  const neq = riseSink(t, A.sesuai - 0.1, A.satu + 0.3, 0.4, 1.0);

  // Moments phone
  const phR = riseSink(t, A.moments - 0.5, A.jadi + 0.2, 0.9, 1.3);
  const usR = riseSink(t, A.penuh - 0.35, A.jadi + 0.2, 0.6, 1.0);
  const padR = riseSink(t, A.hati - 0.9, A.jadi + 0.6, 0.8, 1.2);

  // payoff versions
  const pv = [A.buat, A.beberapa, A.versi].map((a) => riseSink(t, a - 0.2, Infinity, 0.8));
  const loserSink = ease(win(t, A.pemenang + 0.5, 1.6));
  const meter = win(t, A.data - 0.1, 1.1);
  const crown = easeOut(win(t, A.pemenang - 0.1, 0.9));
  const PV_X = [-5.2, 0, 5.2];
  const PV_H = [0.9, 2.4, 1.3];

  const shardFade = 1 - win(t, A.roblox1, 0.8);

  return (
    <>
      <CameraRig t={t} />
      <fog attach="fog" args={[BG, 26, 56]} />
      <ambientLight intensity={0.16} color="#B9B4FF" />
      <hemisphereLight args={["#3A2A7A", "#05040A", 0.35]} />
      <primitive object={keyTarget} />
      <spotLight
        position={[av.p[0] - 9, av.p[1] + 10, av.p[2] + 12]}
        target={keyTarget}
        intensity={300}
        angle={0.32}
        penumbra={0.8}
        decay={2}
        color="#FFF1DA"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0.3, 1.0, 1.6]} color="#7FE8FF" intensity={40} distance={14} decay={2} />
      <pointLight position={[7, 3, 5]} color={P.magenta} intensity={60 * (1 - 0.9 * Math.max(bar1, bar2))} distance={20} decay={2} />
      <pointLight position={[-8, -2, 3]} color={P.cyan} intensity={40} distance={18} decay={2} />
      <pointLight position={[0, 1, 9]} color="#9EC9FF" intensity={22} distance={12} decay={2} />

      {WALL.map((w, i) => {
        const y = wallY(i);
        if (y < WATER_Y - 6) return null;
        const isRobux = i === 10, isDefault = i === 11;
        return (
          <Monitor key={i} f={f} pos={[w.pos[0], y, w.pos[2]]} rot={w.rot} sw={w.sw} kind={w.kind} seed={i + 3} grey={w.grey} dark={w.dark} boost={w.boost} halo={w.halo} haloOpacity={0.14} body={w.grey > 0.7 ? "#1A1C26" : P.cabinet} tag={w.tag}>
            {isRobux && <Stamp text="TIDAK DIPRIORITASKAN" k={robuxStamp} pos={[0, (w.sw * 9) / 32 + 0.9, w.sw * 0.36]} w={w.sw * 1.15} />}
            {isDefault && <Stamp text="TIDAK MEMENUHI SYARAT" k={defaultStamp} pos={[0, 0.3, w.sw * 0.36]} w={w.sw * 1.05} />}
          </Monitor>
        );
      })}

      {/* hero screen (live content) */}
      <Monitor f={f} pos={HERO.pos} sw={HERO.sw} kind="hero" seed={1} boost={1.35} halo={mode === "moment" && k > 0 ? P.yellow : P.cyan} haloOpacity={0.32 + 0.15 * k * (mode === "moment" ? 1 : 0)} body="#1B2350" badge tex={hero.tex} />
      <Plinth />

      {/* l04: format callouts around the hero screen */}
      <Tag3D pos={[-2.4, 1.4, 3.2]} size={[2.1, 1.05]} r={riseSink(t, A.ratio - 0.2, A.personal, 0.5, 0.8)} lines={[["16:9", 120, P.yellow]]} border={P.yellow} />
      <Tag3D pos={[0, -1.1, 3.4]} size={[3.6, 0.9]} r={riseSink(t, A.px - 0.2, A.personal, 0.5, 0.8)} lines={[["1920×1080 PIKSEL", 70, P.white]]} border={P.cyan} tex={[1024, 256]} />
      <Tag3D pos={[2.5, 0.4, 3.3]} size={[2.4, 1.0]} r={riseSink(t, A.mb - 0.2, A.personal, 0.5, 0.8)} lines={[["MAKS 3 MB", 84, P.magenta]]} border={P.magenta} />

      {/* l05: personalisation, 5 versions + players picked by Roblox */}
      {VERS_X.map((_, i) => {
        const r = versR(i);
        if (r <= 0.01) return null;
        const p = versionPos(i);
        return <Monitor key={`v${i}`} f={f} pos={[p[0], p[1] - (1 - r) * 3, p[2]]} rot={[-0.08, -p[0] * 0.03, 0]} sw={2.6} kind="hero" seed={60 + i} boost={1.2} halo={[P.cyan, P.magenta, P.orange, P.phosphorGreen, P.yellow][i]} haloOpacity={0.22} tex={versionTexture(i)} />;
      })}
      {playersR > 0.01 &&
        PLAYERS.map((pl, i) => {
          const y = WATER_Y + 0.35 - (1 - playersR) * 2;
          const vp = versionPos(pl.to);
          const col = [P.cyan, P.magenta, P.orange, P.phosphorGreen, P.yellow][pl.to];
          return (
            <group key={`p${i}`}>
              <Pad pos={[pl.x, WATER_Y + 0.0, PLAYER_Z]} size={[1.3, 1.3]} r={playersR} />
              <BlockAvatar f={f + i * 13} pose="stand" seed={i + 2} position={[pl.x, y, PLAYER_Z]} rotation={[0, (vp[0] - pl.x) * -0.05, 0]} scale={0.42} colors={pl.col} />
              <Beam a={[pl.x, y + 1.8, PLAYER_Z]} b={[vp[0], vp[1] + 0.2, vp[2] + 0.6]} k={beamK * playersR} color={col} />
            </group>
          );
        })}

      {/* l06: uplift bars */}
      <Bar pos={[3.9, 0, 5.4]} h={1.6} k={bar1} color={P.cyan} />
      <Bar pos={[7.0, 0, 6.4]} h={9.4} k={bar2} color="#E09A00" />
      <Tag3D pos={[3.9, WATER_Y + 1.6 * bar1 + 1.3, 5.7]} rotY={-0.35} size={[2.6, 1.3]} r={bar1} lines={[["+8,5%", 110, P.cyan], ["RATA-RATA", 48, P.white]]} border={P.cyan} />
      <Tag3D pos={[7.0, WATER_Y + 9.4 * bar2 + 1.3, 6.7]} rotY={-0.35} size={[2.6, 1.3]} r={bar2} lines={[["NAIK SAMPAI", 48, P.white], ["50%", 120, P.yellow]]} border={P.yellow} />

      {/* l07: video rules */}
      <Tag3D pos={[-2.2, TV_TOP + 3.5, 1.6]} size={[3.4, 0.95]} r={tagR[0]} lines={[["GAMEPLAY ASLI", 62, P.phosphorGreen]]} border={P.phosphorGreen} tex={[768, 256]} />
      <Tag3D pos={[-2.2, TV_TOP + 2.2, 1.6]} size={[3.4, 0.95]} r={tagR[1]} lines={[["TANPA NARASI", 62, P.phosphorGreen]]} border={P.phosphorGreen} tex={[768, 256]} />
      <Tag3D pos={[-2.2, TV_TOP + 0.9, 1.6]} size={[3.4, 0.95]} r={tagR[2]} lines={[["MAKS 3× / BULAN", 58, P.yellow]]} border={P.yellow} tex={[768, 256]} />

      {/* l08 – l10: floating pad for the avatar */}
      <Pad pos={[1.4, WATER_Y + 0.25, 6.4]} size={[6.4, 2.0]} r={padR} />

      {/* l09: thumbnail vs real game */}
      {mmR > 0.01 && (
        <>
          <Monitor f={f} pos={[-2.6, WATER_Y + 1.5 - (1 - mmR) * 3.5, 5.0]} rot={[0, 0.16, 0]} sw={3.0} kind="race" seed={31} boost={lerp(1.25, 0.45, mmDim)} halo={P.orange} haloOpacity={0.2 * (1 - mmDim)} tex={mismatchTex[0]} />
          <Monitor f={f} pos={[1.0, WATER_Y + 1.5 - (1 - mmR) * 3.5, 5.0]} rot={[0, -0.16, 0]} sw={3.0} kind="obby" seed={32} boost={lerp(1.25, 0.45, mmDim)} halo={P.magenta} haloOpacity={0.2 * (1 - mmDim)} tex={mismatchTex[1]} />
          <Tag3D pos={[-2.6, WATER_Y + 3.5, 5.4]} rotY={0.18} size={[2.4, 0.6]} r={mmR} lines={[["THUMBNAIL", 80, P.white]]} border={P.orange} tex={[768, 192]} />
          <Tag3D pos={[1.0, WATER_Y + 3.5, 5.4]} rotY={-0.18} size={[2.4, 0.6]} r={mmR} lines={[["ISI GAME", 80, P.white]]} border={P.magenta} tex={[768, 192]} />
          {neq > 0.01 && (
            <group position={[-0.8, WATER_Y + 3.5, 5.7]} scale={0.55 * (0.6 + 0.4 * neq)}>
              {[0.28, -0.28].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                  <RoundedBoxGeo args={[1.2, 0.26, 0.2]} radius={0.06} segments={2} />
                  <meshPhysicalMaterial {...POLISH.glossyEye} color="#FF3B3B" emissive="#FF3B3B" emissiveIntensity={0.8} />
                </mesh>
              ))}
              <mesh rotation={[0, 0, -0.95]}>
                <RoundedBoxGeo args={[1.6, 0.2, 0.22]} radius={0.06} segments={2} />
                <meshPhysicalMaterial {...POLISH.glossyEye} color="#FF3B3B" emissive="#FF3B3B" emissiveIntensity={0.8} />
              </mesh>
            </group>
          )}
        </>
      )}

      {/* l10: the Moments tab (portrait screen) */}
      {phR > 0.01 && (
        <Monitor f={f} pos={[-1.6, WATER_Y + 3.0 - (1 - phR) * 5.5, 5.6]} rot={[0, 0.22, 0]} sw={2.6} aspect={16 / 9} kind="obby" seed={40} boost={1.3} halo={press > 0 ? P.yellow : P.cyan} haloOpacity={0.24 + press * 0.3} tex={phone.tex} />
      )}
      <Tag3D pos={[1.5, 2.6, 5.6]} rotY={-0.15} size={[3.0, 1.1]} r={usR} lines={[["BARU PENUH", 70, P.white], ["DI AMERIKA", 70, P.yellow]]} border={P.yellow} tex={[768, 288]} />

      {/* l12: three versions, data picks the winner */}
      {PV_X.map((x, i) => {
        const r = pv[i];
        if (r <= 0.01) return null;
        const win_ = i === 1;
        const y = WATER_Y + 1.35 - (1 - r) * 3.5 - (win_ ? 0 : loserSink * 5);
        const vIdx = [2, 0, 3][i];
        const mh = PV_H[i] * meter;
        return (
          <group key={`pv${i}`}>
            <Monitor f={f} pos={[x, y, 6.6]} rot={[-0.05, -x * 0.03, 0]} sw={3.0} kind="hero" seed={70 + i} boost={win_ ? 1.3 + crown * 0.2 : 1.1} halo={win_ ? P.yellow : P.cyan} haloOpacity={win_ ? 0.22 + crown * 0.25 : 0.16} tex={versionTexture(vIdx)} />
            {mh > 0.02 && (
              <mesh position={[x + 1.35, y + 1.2 + mh / 2, 7.3]}>
                <RoundedBoxGeo args={[0.32, mh, 0.32]} radius={0.06} segments={2} />
                <meshPhysicalMaterial {...POLISH.glossyEye} color={win_ ? P.yellow : P.cyan} emissive={win_ ? P.yellow : P.cyan} emissiveIntensity={0.7} />
              </mesh>
            )}
            {win_ && crown > 0.01 && (
              <mesh geometry={starGeo()} position={[x, y + 1.6 + crown * 1.4, 7.0]} rotation={[0, t * 1.2, 0]} scale={0.8 * crown}>
                <meshPhysicalMaterial color={P.yellow} metalness={0.9} roughness={0.2} emissive={P.orange} emissiveIntensity={0.4} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* the avatar */}
      <BlockAvatar f={f + av.fOff} pose={av.pose} seed={0} position={av.p} rotation={av.rot} scale={HOOK_AVATAR.scale} torsoEmissive={P.cyan} />
      <Shards f={f} fade={shardFade} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <MeshReflectorMaterial color="#07102A" mirror={1} blur={[120, 40]} resolution={1024} mixBlur={0.5} mixStrength={9} roughness={0.35} metalness={0.5} depthScale={0} minDepthThreshold={0.4} maxDepthThreshold={1.4} />
      </mesh>
      <Ripples f={f} />
      <Bubbles f={f} />

      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Captions: karaoke per word; phrases of ≤5 words, broken at punctuation.
type Phrase = { words: { w: string; s: number; e: number }[]; from: number; to: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const line of timeline.lines) {
    const groups: { w: string; s: number; e: number }[][] = [];
    let cur: { w: string; s: number; e: number }[] = [];
    line.words.forEach((w, i) => {
      cur.push(w);
      const left = line.words.length - i - 1;
      const punct = /[,.:?!]$/.test(w.w);
      if ((punct && cur.length >= 2) || (cur.length >= 5 && left !== 1) || cur.length >= 6) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) {
      if (cur.length === 1 && groups.length) groups[groups.length - 1].push(...cur);
      else groups.push(cur);
    }
    groups.forEach((g, i) => {
      const next = groups[i + 1];
      out.push({ words: g, from: g[0].s - 0.12, to: next ? next[0].s - 0.12 : line.end + 0.3 });
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ph = PHRASES.find((p) => t >= p.from && t < p.to);
  if (!ph || t > timeline.voEnd + 0.4) return null;
  const inK = clamp01((t - ph.from) / 0.12);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.42em",
          rowGap: 4,
          maxWidth: 940,
          padding: "16px 30px 12px",
          borderRadius: 18,
          background: "rgba(7,6,15,0.72)",
          backdropFilter: "blur(10px)",
          border: `2px solid rgba(46,242,255,0.45)`,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          fontFamily: BUNGEE,
          fontSize: 54,
          lineHeight: 1.18,
          opacity: inK,
          transform: `translateY(${(1 - inK) * 10}px)`,
        }}
      >
        {ph.words.map((w, i) => {
          const active = t >= w.s && t < w.e + 0.05;
          const done = t >= w.e + 0.05;
          return (
            <span key={i} style={{ color: active ? P.yellow : done ? P.white : "rgba(244,241,255,0.55)", transform: `scale(${active ? 1.04 : 1})`, display: "inline-block", textShadow: active ? `0 0 16px rgba(255,210,63,0.7)` : "none" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Cover headline + chip (same as the approved cover), fading away as the hook ends. */
const HookOverlay: React.FC<{ t: number }> = ({ t }) => {
  const head = 1 - win(t, A.roblox1 - 0.2, 0.8);
  const chip = 1 - win(t, timeline.lines[0].words[0].s - 0.35, 0.3);
  const scrim = 1 - win(t, A.roblox1, 1.2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, opacity: scrim, background: "linear-gradient(180deg, rgba(7,6,15,0.94) 0%, rgba(7,6,15,0.82) 22%, rgba(7,6,15,0) 36%, rgba(7,6,15,0) 80%, rgba(7,6,15,0.6) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
      {/* light top scrim after the hook so the signature stays readable */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - scrim, background: "linear-gradient(180deg, rgba(7,6,15,0.55) 0%, rgba(7,6,15,0) 16%, rgba(7,6,15,0) 70%, rgba(7,6,15,0.5) 100%)" }} />
      {head > 0.01 && (
        <div style={{ opacity: head, transform: `translateY(${(1 - head) * -30}px)` }}>
          <div style={{ position: "absolute", left: 64, top: 268, fontFamily: VT, fontSize: 44, letterSpacing: 4, color: P.cyan, textShadow: `0 0 12px ${P.cyan}` }}>▶ MAP BARU ROBLOX · TIPS #4</div>
          <div style={{ position: "absolute", left: 58, top: 320, fontFamily: BUNGEE, lineHeight: 1.0 }}>
            <div style={{ fontSize: 132, color: P.yellow, letterSpacing: -2, textShadow: `6px 6px 0 ${P.magenta}, 0 0 28px rgba(255,210,63,0.55)` }}>THUMBNAIL</div>
            <div style={{ fontSize: 86, color: P.white, marginTop: 14, letterSpacing: 0, textShadow: `5px 5px 0 #1B4DFF, 0 0 22px rgba(46,242,255,0.5)` }}>ANTI TENGGELAM</div>
          </div>
        </div>
      )}
      {chip > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, margin: "0 auto", width: "fit-content", top: 1452, opacity: chip, display: "flex", alignItems: "center", gap: 18, fontFamily: VT, fontSize: 42, color: P.white, background: "rgba(7,6,15,0.78)", border: `3px solid ${P.magenta}`, boxShadow: `0 0 18px rgba(255,46,136,0.55)`, padding: "8px 22px 6px", letterSpacing: 2 }}>
          <span>2–5 THUMBNAIL DIUJI</span>
          <span style={{ fontFamily: BUNGEE, fontSize: 46, color: P.yellow }}>+8,5%</span>
          <span style={{ color: P.cyan }}>RATA-RATA</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = height / 1920;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 140 }}>
        <FilmWorld t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "0 0", width: 1080, height: 1920 }}>
        <HookOverlay t={t} />
        <Captions t={t} />
      </AbsoluteFill>
      <AudiraOutro seconds={TOTAL_SECONDS - OUTRO_AT} />
      <AudiraSignature seed="roblox-map-baru-ep04" outroSeconds={TOTAL_SECONDS - OUTRO_AT} />
    </AbsoluteFill>
  );
};
