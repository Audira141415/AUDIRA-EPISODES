// EP01 film (BRICKCRAFT): "70.000 game dari AI". One continuous brick world grown from the cover:
// prompt tablet + brick stream + tower of mini maps, then stations on the same desk for each beat.
// Master clock = locked VO (timeline.json). Every camera key / event is anchored to a word time.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { BlockAvatar, type AvatarPose } from "../_shared/BlockAvatar.tsx";
import timeline from "./timeline.json";
import { BG, COVER_CAMERA, HookWorld, boardPose } from "./Hook.tsx";
import { CoverOverlay } from "./Cover.tsx";
import { blankScreenTexture, outroScreenTexture } from "./textures.ts";
import { LINES, VO_END, TOTAL, w, line, ramp, smooth, type Line } from "./timing.ts";
import {
  BuildSite,
  NZStation,
  Grid9000,
  Pie71,
  Burst,
  Risers,
  Billboards,
  Bars3x,
  Grid100,
  Podium,
  Meleset,
  CloneField,
  UniqueMap,
  LetterBoard,
} from "./Stations.tsx";
import { Brick, C } from "./Hook.tsx";

export const TOTAL_SECONDS: number = timeline.total;

const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["700"], subsets: ["latin"] });

type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

// ---------- camera: keys on word times ----------
type Key = { at: number; pos: V3; tgt: V3; fov: number };
const hookPose = (t: number): Key => ({
  at: t,
  pos: [COVER_CAMERA.position[0] + t * 0.12, COVER_CAMERA.position[1] - t * 0.05, COVER_CAMERA.position[2] - t * 0.5],
  tgt: [COVER_CAMERA.target[0], COVER_CAMERA.target[1] + t * 0.03, COVER_CAMERA.target[2]],
  fov: COVER_CAMERA.fov,
});
const TABLET_POS: V3 = [-0.4, 11.5, 42];
const TABLET_TGT: V3 = [-2.0, 5, 9.5];
const HOOK_END = w("dan").s;

const KEYS: Key[] = [
  hookPose(HOOK_END),
  { at: w("kalimat").s, pos: TABLET_POS, tgt: TABLET_TGT, fov: 40 },
  { at: w("Namanya").s, pos: [-0.6, 11, 40.5], tgt: [-2.1, 5, 9.5], fov: 40 },
  { at: w("merakitnya").s, pos: [-6, 16, 56], tgt: [-7.5, 4, 12], fov: 38 },
  { at: w("Juli").s, pos: [-15, 14, 42], tgt: [-18.3, 4, 5], fov: 38 },
  { at: w("9.000").s, pos: [-28, 18, 46], tgt: [-30, 3, 4], fov: 38 },
  { at: w("71%").s, pos: [-41, 13, 42], tgt: [-41.5, 3.5, 5], fov: 38 },
  { at: w("Roblox", 3).s, pos: [-41.5, 12.5, 40], tgt: [-41.5, 3.5, 5], fov: 38 },
  { at: w("Menurut").s, pos: [-20, 22, 60], tgt: [-3, 11, -4], fov: 38 },
  { at: w("500.000").e, pos: [-3, 16, 38], tgt: [-10.5, 8, -9], fov: 38 },
  { at: w("Unggahan").s, pos: [6, 16, 38], tgt: [14.5, 8, -9], fov: 38 },
  { at: w("tiga").s, pos: [13, 12, 40], tgt: [15, 4, 8], fov: 38 },
  { at: w("ledakan").s, pos: [8, 24, 56], tgt: [6, 10, -4], fov: 38 },
  { at: w("80%").s, pos: [30, 30, 42], tgt: [30, 1, 2.5], fov: 40 },
  { at: w("AI", 3).s, pos: [31, 27, 39], tgt: [30, 1, 2], fov: 40 },
  { at: w("Break").s, pos: [30, 15, 30], tgt: [30, 8, -17], fov: 38 },
  { at: w("20").s, pos: [30, 15, 28], tgt: [30, 9, -18], fov: 38 },
  { at: w("18%").s, pos: [46.5, 14, 34], tgt: [45.2, 3, -3], fov: 38 },
  { at: w("gelapnya").s, pos: [55, 20, 22], tgt: [58, 3, -19], fov: 38 },
  { at: w("menjiplak").s, pos: [60, 18, 8], tgt: [59, 2, -28], fov: 40 },
  { at: w("rilis").s, pos: [60, 24, 14], tgt: [58, 2, -24], fov: 42 },
  { at: w("beda").s, pos: [61.5, 11, 22], tgt: [60, 3.5, -8], fov: 38 },
  { at: w("bongkar").s, pos: [25, 58, 105], tgt: [15, 6, -8], fov: 40 },
  { at: w("90").s, pos: TABLET_POS, tgt: TABLET_TGT, fov: 40 },
  { at: TOTAL, pos: [-0.6, 11, 40.5], tgt: TABLET_TGT, fov: 40 },
];

function cameraAt(t: number): Key {
  if (t <= HOOK_END) return hookPose(t);
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].at) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = smooth((t - a.at) / (b.at - a.at));
  const k: Key = { at: t, pos: lerp3(a.pos, b.pos, u), tgt: lerp3(a.tgt, b.tgt, u), fov: a.fov + (b.fov - a.fov) * u };
  // slow seeded drift so held keys still breathe (parallax), faded in after the hook
  const d = ramp(t, HOOK_END, HOOK_END + 2);
  k.pos = [k.pos[0] + Math.sin(t * 0.37) * 0.35 * d, k.pos[1] + Math.sin(t * 0.29 + 1.3) * 0.22 * d, k.pos[2] + Math.cos(t * 0.31) * 0.3 * d];
  // short shake on "meledak"
  const s = t - w("meledak").s;
  if (s > 0 && s < 1.2) {
    const amp = 0.18 * (1 - s / 1.2);
    k.pos = [k.pos[0] + Math.sin(s * 47) * amp, k.pos[1] + Math.sin(s * 53 + 1) * amp, k.pos[2]];
  }
  return k;
}

const FilmCamera: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const k = cameraAt(t);
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...k.pos);
    c.fov = k.fov;
    c.lookAt(...k.tgt);
    c.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ---------- avatar: stays + travels, all on word times ----------
type PoseKey = { from: number; pose: AvatarPose; yaw: number };
type Stay = { pos: V3; arrive: number; leave: number; via: "run" | "jump"; h?: number; poses: PoseKey[] };
const TOWER_TOP: V3 = [2.69, 14.6, -1.77];
const BOARD_LEAVE = w("semuanya").s;
const STAYS: Stay[] = [
  { pos: [0.6, 0, 11], arrive: w("berawal").s, leave: w("merakitnya").e, via: "jump", h: 5, poses: [{ from: 0, pose: "type", yaw: -0.75 }, { from: w("AI", 2).s, pose: "point", yaw: -0.95 }] },
  { pos: [-13.8, 0, 7.5], arrive: w("Juli").s - 0.1, leave: w("Sampai").s, via: "run", poses: [{ from: 0, pose: "wave", yaw: 0.35 }] },
  { pos: [-23.5, 0, 10], arrive: w("sekitar").s + 0.2, leave: w("71%").s - 0.6, via: "run", poses: [{ from: 0, pose: "cheer", yaw: 0.3 }] },
  { pos: [-37.5, 0, 10.5], arrive: w("71%").e, leave: w("Lalu").s, via: "run", poses: [{ from: 0, pose: "think", yaw: 0.25 }] },
  {
    pos: TOWER_TOP,
    arrive: w("Lalu").s + 2.1,
    leave: line("l08").start,
    via: "jump",
    h: 16,
    poses: [{ from: 0, pose: "cheer", yaw: 0.3 }, { from: w("500.000").s, pose: "wave", yaw: -0.2 }, { from: w("naik").s, pose: "cheer", yaw: 0.3 }],
  },
  { pos: [30, 0, 10.5], arrive: w("Lebih", 4).s, leave: w("Dua").s, via: "jump", h: 14, poses: [{ from: 0, pose: "point", yaw: 0.0 }, { from: w("AI", 3).s, pose: "cheer", yaw: 0 }] },
  { pos: [30, 0, -17.5], arrive: w("Break").s - 1, leave: w("Hasil").s, via: "run", poses: [{ from: 0, pose: "wave", yaw: 0.1 }, { from: w("tembus").s, pose: "cheer", yaw: 0.1 }] },
  { pos: [50.5, 0.4, 1.5], arrive: w("turun").s - 0.6, leave: w("Tapi").s, via: "run", poses: [{ from: 0, pose: "think", yaw: -0.45 }, { from: w("3%").s, pose: "cheer", yaw: -0.45 }] },
  { pos: [56, 2.4, -17.5], arrive: w("Makin").s, leave: w("Bikin", 3).s, via: "jump", h: 5, poses: [{ from: 0, pose: "think", yaw: 0.35 }] },
  { pos: [60, 0, -4.2], arrive: w("Bikin", 3).s + 0.9, leave: w("berikutnya").e, via: "jump", h: 4, poses: [{ from: 0, pose: "cheer", yaw: 0.05 }] },
  { pos: [1.3, 0, 11.8], arrive: w("90").s - 0.3, leave: TOTAL + 1, via: "jump", h: 24, poses: [{ from: 0, pose: "wave", yaw: 0.05 }] },
];

function avatarAt(t: number, f: number): { onBoard: boolean; pos: V3; yaw: number; pose: AvatarPose } {
  if (t < BOARD_LEAVE) return { onBoard: true, pos: [0, 0, 0], yaw: 0, pose: "cheer" };
  let prevPos: V3 = boardPose(BOARD_LEAVE * 60).pos;
  let prevLeave = BOARD_LEAVE;
  for (const s of STAYS) {
    if (t < s.arrive) {
      const u = Math.max(0, Math.min(1, (t - prevLeave) / (s.arrive - prevLeave)));
      const dx = s.pos[0] - prevPos[0], dz = s.pos[2] - prevPos[2];
      const yaw = Math.atan2(dx, dz);
      if (s.via === "run") {
        const e = smooth(u);
        return { onBoard: false, pos: lerp3(prevPos, s.pos, e), yaw, pose: "run" };
      }
      const p = lerp3(prevPos, s.pos, u);
      p[1] += (s.h ?? 6) * 4 * u * (1 - u);
      return { onBoard: false, pos: p, yaw, pose: "jump" };
    }
    if (t < s.leave) {
      let pk = s.poses[0];
      for (const q of s.poses) if (t >= q.from) pk = q;
      return { onBoard: false, pos: s.pos, yaw: pk.yaw, pose: pk.pose };
    }
    prevPos = s.pos;
    prevLeave = s.leave;
  }
  void f;
  const last = STAYS[STAYS.length - 1];
  return { onBoard: false, pos: last.pos, yaw: 0, pose: "wave" };
}

// ---------- declutter: background city + stream only where the beat needs them ----------
const cityAt = (t: number) =>
  Math.max(
    1 - ramp(t, w("berawal").s, w("berawal").s + 1.2),
    ramp(t, w("Menurut").s - 0.6, w("Menurut").s + 0.8) * (1 - ramp(t, w("Dan", 4).s, w("Dan", 4).s + 1.2)),
    ramp(t, w("bongkar").s - 1.2, w("bongkar").s),
  );
const streamAt = (t: number) =>
  Math.max(
    1 - 0.8 * ramp(t, w("berawal").s, w("berawal").s + 1.2) - 0.2 * ramp(t, w("Namanya").s, w("Juli").s),
    (0.5 * ramp(t, w("meledak").s, w("meledak").s + 0.8) + 0.5 * ramp(t, w("naik").s, w("ledakan").s)) * (1 - ramp(t, w("Dan", 4).s, w("Dan", 4).s + 1.2)),
    ramp(t, w("bongkar").s - 1.2, w("bongkar").s),
  );

// ---------- world ----------
const AV_TARGET = new THREE.Object3D();
const lightAt = (t: number) =>
  1 - 0.85 * ramp(t, w("Tapi").s, w("gelapnya").e) + 0.3 * ramp(t, w("beda").s - 0.4, w("beda").e + 0.8) + 0.32 * ramp(t, w("Episode").s, w("bongkar").s);

const World: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const cam = cameraAt(t);
  const av = avatarAt(t, f);
  const outroScreen = outroScreenTexture();
  const L = lightAt(t);
  const all = t > w("berikutnya").s;
  const inB = (t > 15 && t < 32) || all;
  return (
    <>
      <FilmCamera t={t} />
      <HookWorld f={f} withCamera={false} showAvatar={av.onBoard} light={L} shadowCenter={[cam.tgt[0], 0, cam.tgt[2]]} screen={t < w("kita").s - 0.5 ? blankScreenTexture() : outroScreen} screenMix={Math.max(ramp(t, w("kita").s, w("bongkar").e), ramp(t, w("meledak").s, w("meledak").e) * (1 - ramp(t, w("Dan", 4).s, w("Dan", 4).s + 0.8)))} city={cityAt(t)} stream={streamAt(t)} />
      {t > 12 && <BuildSite t={t} />}
      {inB && (
        <>
          <NZStation t={t} />
          <Grid9000 t={t} />
          <Pie71 t={t} />
        </>
      )}
      {t > 28 && (
        <>
          <Burst t={t} />
          <Risers t={t} k={cityAt(t)} />
          <LetterBoard t={t} />
          <Billboards t={t} />
        </>
      )}
      {t > 36 && <Bars3x t={t} />}
      {t > 44 && (t < w("Dua").s + 1.2 || all) && <Grid100 t={t} />}
      {t > 44 && (
        <>
          <Podium t={t} />
          <Meleset t={t} />
        </>
      )}
      {t > 66 && (
        <>
          <CloneField t={t} />
          {/* pedestal so the avatar stands above the clone field; warm key light on it in the dark */}
          <Brick w={4} l={4} h={6} color={C.white} p={[56, 0, -17.5]} />
          <primitive object={AV_TARGET} position={[56, 3, -17.5]} />
          <spotLight position={[50, 18, -4]} target={AV_TARGET} angle={0.3} penumbra={0.5} intensity={700 * ramp(t, w("Tapi").s, w("gelapnya").e) * (1 - ramp(t, w("Bikin", 3).s, w("beda").e))} distance={50} decay={2} color="#ffe8c8" />
          <UniqueMap t={t} />
          {/* red mood light over the clone field ("sisi gelap") */}
          <pointLight position={[60, 14, -26]} intensity={160 * ramp(t, w("Tapi").s, w("gelapnya").e) * (1 - ramp(t, w("beda").s, w("Episode").s))} distance={60} decay={2} color="#ff3b30" />
        </>
      )}
      {!av.onBoard && <BlockAvatar f={f} pose={av.pose} seed={3} position={av.pos} rotation={[0, av.yaw, 0]} scale={1.25} />}
      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} hdri="studio" exposure={0.9 * (0.75 + 0.25 * L)} envIntensity={0.6 * (0.15 + 0.85 * Math.min(1, L))} ao />
    </>
  );
};

// ---------- karaoke captions ----------
type Chunk = { words: Line["words"]; start: number; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const l of LINES) {
    let cur: Line["words"] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    };
    for (const wd of l.words) {
      cur.push(wd);
      const chars = cur.map((x) => x.w).join(" ").length;
      if (/[.,:;!?]$/.test(wd.w) && chars > 8) flush();
      else if (cur.length >= 5 || chars > 26) flush();
    }
    flush();
  }
  // each chunk stays up until the next one starts (or 0.4 s after its end)
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1]?.start ?? Infinity;
    out[i].end = Math.min(next - 0.02, out[i].end + 0.45);
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.start - 0.08 && t < x.end);
  if (!c || t > VO_END + 0.3) return null;
  const inA = ramp(t, c.start - 0.08, c.start + 0.08);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 410, display: "flex", justifyContent: "center", opacity: inA }}>
      <div
        style={{
          background: "rgba(14,16,20,0.78)",
          borderRadius: 26,
          padding: "16px 30px 20px",
          border: "3px solid rgba(255,202,44,0.55)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.42em",
          rowGap: 4,
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 62,
          lineHeight: 1.12,
          color: "#FFFFFF",
          maxWidth: 940,
        }}
      >
        {c.words.map((wd, i) => {
          const active = t >= wd.s && t < (c.words[i + 1]?.s ?? c.end);
          const done = t >= wd.s;
          const k = active ? Math.sin(Math.min(1, (t - wd.s) / 0.18) * Math.PI) : 0;
          return (
            <span key={i} style={{ display: "inline-block", color: active ? "#FFCA2C" : done ? "#FFFFFF" : "rgba(255,255,255,0.62)", transform: `scale(${1 + 0.04 * k})` }}>
              {wd.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- film ----------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const scale = width / 1080;
  const headline = 1 - ramp(t, w("Roblox,").e, w("Roblox,").e + 0.5);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.5, far: 260 }}>
        <World t={t} f={f} />
      </ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          {headline > 0.001 && (
            <div style={{ position: "absolute", inset: 0, opacity: headline }}>
              <CoverOverlay />
            </div>
          )}
          <Captions t={t} />
        </div>
      </AbsoluteFill>
      <AudiraOutro />
      <AudiraSignature seed="roblox-map-baru-ep01" />
    </AbsoluteFill>
  );
};
