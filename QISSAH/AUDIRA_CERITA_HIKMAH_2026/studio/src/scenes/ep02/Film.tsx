// TEMPAYAN RETAK (KINTSUGI): cameras, light, cast, overlays. Every value is a pure function of film time.
import React, { useLayoutEffect, useMemo } from "react";
import { Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";
import { Stage3D } from "../../core/film/Stage3D";
import { CameraRig, Post, type Shot } from "../../core/render/Post";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets";
import { ease } from "../../core/motion/easing";
import { FONT } from "../../core/type/fonts";
import { Carrier, PAL, Pot, YOKE_HALF } from "./Characters";
import { CLIPS, E, FILM_FPS, T, TABLE, TOTAL_SECONDS, clamp, lerp, mix3, pathAt, pathX, pathY, pathZ, pathYaw, ramp, win, type Clip, type V3 } from "./layout";
import { TL_A, TL_B, carrierPose, carrierXZ, crackGoldAt, crackedPose, seamGoldAt, sunDir, uAt, wholePose } from "./story";
import { HERO, SkyEnvironment, Sky, World, dimAt } from "./World";

const { fontFamily: SERIF } = loadFont("normal", { weights: ["500", "600"], subsets: ["latin"] });
loadFont("italic", { weights: ["500"], subsets: ["latin"] });

/* ---------- camera language ---------- */
type Cam = { pos: V3; at: V3; fov: number };
type CamFn = (t: number) => Cam;
type ShotDef = { a: number; b: number; from: CamFn; to: CamFn; curve?: (x: number) => number; wide?: boolean };

/** carrier frame: ground position + heading (the path direction, not his head) */
const frameAt = (t: number) => {
  const u = uAt(t);
  const p = carrierPose(t).pos;
  const xz = carrierXZ(u);
  return { o: [xz[0], p[1], xz[2]] as V3, yaw: pathYaw(clamp(u, 0, 1)) };
};
const toWorld = (t: number, l: V3): V3 => {
  const { o, yaw } = frameAt(t);
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return [o[0] + l[0] * c + l[2] * s, o[1] + l[1], o[2] - l[0] * s + l[2] * c];
};
const L = (pos: V3, at: V3, fov: number): CamFn => (t) => ({ pos: toWorld(t, pos), at: toWorld(t, at), fov: fov * 1.28 });
const W = (pos: V3, at: V3, fov: number): CamFn => () => ({ pos, at, fov });
const c = (id: string) => T[id] - 0.05;

const POT2: V3 = [-YOKE_HALF, 0.62, -0.06];
const potCam = L([-0.55, 1.0, 1.65], [1.0, 0.58, -0.06], 34);
const potCam2 = L([-0.35, 0.95, 1.45], [1.05, 0.56, -0.06], 32);
const carCam = L([1.55, 1.3, 1.9], [0.05, 1.5, 0], 34);
const carCam2 = L([1.35, 1.32, 1.65], [0.05, 1.52, 0], 33);

const house = pathAt(1);
const seedCam = (u0: number, u1: number, a: number, b: number): CamFn => (t) => {
  const u = lerp(u0, u1, ease.inOut(clamp((t - a) / (b - a))));
  const u2 = u - 0.07;
  return { pos: [pathX(u) - 3.6, pathY(u) + 1.7, pathZ(u) - 1.2], at: [pathX(u2) - 1.3, pathY(u2) + 0.1, pathZ(u2)], fov: 40 };
};

const SHOTS: ShotDef[] = [
  { a: 0, b: T.s1b, from: L([2.25, 0.85, 1.6], [1.12, 0.5, 0], 28), to: L([2.4, 0.9, 1.95], [1.1, 0.52, 0], 29), curve: ease.sine },
  { a: T.s1b, b: c("s2a"), from: L([2.4, 0.9, 1.95], [1.1, 0.52, 0], 29), to: L([4.2, 2.0, 5.2], [0.4, 1.0, 0], 38) },
  { a: c("s2a"), b: c("s2b"), from: W([6, 27, 27], [-1, 3, -20], 40), to: W([3.2, 6.2, 11.5], [0, 1.0, -1.2], 40), wide: true },
  { a: c("s2b"), b: c("s2c"), from: L([3.6, 4.2, 3.6], [0.4, 0.4, 0], 40), to: L([3.2, 3.8, 4.1], [0.4, 0.5, 0], 40) },
  { a: c("s2c"), b: c("s2d"), from: L([2.6, 1.5, 5.2], [0.2, 1.1, 0], 40), to: L([-1.4, 1.8, 5.6], [0, 1.2, 0], 40) },
  { a: c("s2d"), b: c("s2e"), from: L([2.4, 3.4, -5.6], [0.2, 0.9, 2.5], 42), to: L([1.9, 3.0, -5.0], [0.2, 0.9, 2.5], 42), wide: true },
  { a: c("s2e"), b: c("s3a"), from: L([3.2, 0.95, 1.4], [1.12, 0.45, -0.1], 34), to: L([3.0, 0.8, 1.8], [1.12, 0.45, -0.1], 34) },
  { a: c("s3a"), b: c("s3b"), from: L([-3.2, 1.2, 2.3], POT2, 36), to: L([-2.9, 1.3, 2.7], POT2, 36) },
  { a: c("s3b"), b: T.s3b + 4.2, from: L([1.6, 2.1, 5.6], [0, 1.0, 0], 40), to: L([1.3, 2.4, 4.6], [0, 0.9, 0], 40) },
  { a: T.s3b + 4.2, b: TL_A, from: L([0.4, 5.6, 2.9], [0, 0.5, 0], 40), to: L([0.3, 5.2, 2.5], [0, 0.5, 0], 40) },
  { a: TL_A, b: TL_B, from: W([5.5, 16, 18], [-1.5, 3.5, -24], 42), to: W([4.5, 14, 15], [-1.5, 3.6, -24], 42), wide: true },
  { a: TL_B, b: c("s3f"), from: L([-0.15, 1.05, 2.5], [-1.0, 0.6, -0.06], 32), to: L([-0.25, 1.0, 2.2], [-1.0, 0.6, -0.06], 31) },
  { a: c("s3f"), b: c("s4a"), from: L([1.7, 0.8, 2.5], [1.12, 0.5, -0.06], 32), to: L([1.6, 0.75, 2.2], [1.12, 0.5, -0.06], 31) },
  { a: c("s4a"), b: c("s4b"), from: L([3.8, 2.1, 5.0], [0.4, 0.9, 0], 40), to: L([3.0, 1.7, 3.9], [0.4, 0.95, 0], 40) },
  { a: c("s4b"), b: c("s4c"), from: potCam, to: potCam2 },
  { a: c("s4c"), b: c("s4d"), from: carCam, to: carCam2 },
  { a: c("s4d"), b: c("s4e"), from: potCam2, to: potCam },
  { a: c("s4e"), b: c("s4f"), from: L([1.35, 0.8, 2.2], [1.12, 0.48, 0], 30), to: L([1.3, 0.72, 1.9], [1.12, 0.46, 0], 30) },
  { a: c("s4f"), b: c("s4g"), from: L([2.4, 1.4, 3.3], [0.55, 1.0, 0], 38), to: L([2.1, 1.35, 3.0], [0.5, 1.05, 0], 38) },
  { a: c("s4g"), b: c("s5a"), from: carCam2, to: carCam },
  { a: c("s5a"), b: c("s5c"), from: L([2.9, 0.55, 2.8], [1.0, 0.55, -0.3], 38), to: L([2.5, 0.95, 2.3], [1.0, 0.6, -0.2], 38) },
  { a: c("s5c"), b: c("s5d"), from: L([0.5, 5.6, 2.9], [0, 0.5, 0], 40), to: L([0.6, 5.0, 2.6], [0, 0.55, 0], 40) },
  { a: c("s5d"), b: c("s6a"), from: potCam, to: potCam2 },
  { a: c("s6a"), b: c("s6c"), from: W([house[0] - 0.6, house[1] + 2.4, house[2] - 3.0], [house[0] + 0.6, house[1] + 0.7, house[2] + 4], 40), to: W([house[0] - 2.6, house[1] + 11, house[2] - 9.5], [0.5, 3.6, -24], 42), wide: true },
  { a: c("s6c"), b: c("s6d"), from: seedCam(0.82, 0.5, c("s6c"), c("s6d")), to: seedCam(0.82, 0.5, c("s6c"), c("s6d")), curve: () => 0 },
  { a: c("s6d"), b: c("s6e"), from: W([HERO[0] - 1.7, HERO[1] + 0.5, HERO[2] + 1.15], [HERO[0], HERO[1] + 0.02, HERO[2]], 30), to: W([HERO[0] - 1.45, HERO[1] + 0.45, HERO[2] + 0.95], [HERO[0], HERO[1] + 0.04, HERO[2]], 28) },
  { a: c("s6e"), b: c("s6f"), from: W([TABLE[0] + 1.6, TABLE[1] + 1.35, TABLE[2] + 2.5], [TABLE[0], TABLE[1] + 0.75, TABLE[2]], 30), to: W([TABLE[0] + 1.0, TABLE[1] + 1.05, TABLE[2] + 1.6], [TABLE[0], TABLE[1] + 0.8, TABLE[2]], 30) },
  { a: c("s6f"), b: c("s7a"), from: L([2.3, 1.35, 2.9], [0.6, 0.95, 0], 36), to: L([2.0, 1.2, 2.4], [0.7, 0.9, 0], 36) },
  { a: c("s7a"), b: c("s7b"), from: L([2.8, 0.75, 0.8], [1.15, 0.5, -0.02], 30), to: L([2.5, 0.68, 0.7], [1.15, 0.5, -0.02], 28) },
  { a: c("s7b"), b: T.s7d, from: L([2.6, 1.6, 2.8], [0.5, 0.9, 0], 38), to: W([house[0] + 7, house[1] + 9, house[2] + 16], [house[0] + 0.5, house[1] - 0.5, house[2] + 6], 42), wide: true },
  { a: T.s7d, b: TOTAL_SECONDS + 1, from: W([house[0] + 7, house[1] + 9, house[2] + 16], [house[0] + 0.5, house[1] - 0.5, house[2] + 6], 42), to: W([12, 30, 16], [-1.5, 3, -24], 44), wide: true },
];

const shotAt = (t: number) => {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= sh.a) s = sh;
  const k = (s.curve ?? ease.inOut)(clamp((t - s.a) / (s.b - s.a)));
  const A = s.from(t), B = s.to(t);
  return { pos: mix3(A.pos, B.pos, k), at: mix3(A.at, B.at, k), fov: lerp(A.fov, B.fov, k), wide: !!s.wide };
};

/* ---------- light ---------- */
const Sun: React.FC<{ t: number; at: V3; wide: boolean }> = ({ t, at, wide }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight("#ffd8a6", 2.6);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.02;
    return l;
  }, []);
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.add(light);
    scene.add(light.target);
    return () => {
      scene.remove(light);
      scene.remove(light.target);
    };
  }, [scene, light]);
  const d = sunDir(t);
  const dim = dimAt(t);
  const r = wide ? 34 : 7;
  light.position.set(at[0] + d.x * 60, at[1] + d.y * 60, at[2] + d.z * 60);
  light.target.position.set(...at);
  light.target.updateMatrixWorld();
  light.intensity = 2.7 * (1 - dim * 0.6);
  const cam = light.shadow.camera;
  cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r; cam.near = 1; cam.far = 140;
  cam.updateProjectionMatrix();
  return null;
};
const Fog: React.FC<{ density: number }> = ({ density }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2("#efcfa6", density);
  }, [scene, density]);
  return null;
};

/* ---------- the 3D scene ---------- */
const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FILM_FPS;
  const s = shotAt(t);
  const dist = Math.hypot(s.pos[0] - s.at[0], s.pos[1] - s.at[1], s.pos[2] - s.at[2]);
  const shot: Shot = { pos: s.pos, target: s.at, fov: s.fov, focus: dist, aperture: s.wide ? 0.00015 : 0.0011, maxBlur: s.wide ? 0.002 : 0.007, exposure: 1.02 };
  const cp = carrierPose(t);
  const gold = crackGoldAt(t);
  return (
    <>
      <CameraRig shot={shot} near={0.05} far={900} />
      <SkyEnvironment />
      <Sky sun={sunDir(t)} dim={dimAt(t)} />
      <Fog density={s.wide ? 0.0065 : 0.011} />
      <hemisphereLight args={["#ffe6c4", "#8a5636", 0.95 * (1 - dimAt(t) * 0.4)]} />
      <Sun t={t} at={s.wide ? s.at : s.at} wide={s.wide} />
      <World t={t} />
      <Carrier pose={cp}>
        <group position={[YOKE_HALF, cp.pos[1] * 0 + 0, -0.06]}>
          <group position={[0, yokeLocalY(cp), 0]}>
            <Pot pose={crackedPose(t)} cracked crackGold={gold} tint={PAL.terracottaOld} band={PAL.indigo} />
          </group>
        </group>
        <group position={[-YOKE_HALF, 0, -0.06]}>
          <group position={[0, yokeLocalY(cp), 0]}>
            <Pot pose={wholePose(t)} seamGold={seamGoldAt(t)} tint={PAL.terracotta} band={PAL.saffron} />
          </group>
        </group>
      </Carrier>
      {gold > 0.05 ? <pointLight position={toWorld(t, [YOKE_HALF + 0.5, 0.6, 0.3])} color="#ffcf70" intensity={gold * 1.4} distance={2.2} /> : null}
      <Post shot={shot} frame={f} profile={COLOR_PROFILES.DOCUMENTARY_WARM} aoRadius={0.25} />
    </>
  );
};
const yokeLocalY = (cp: ReturnType<typeof carrierPose>) => 1.47 - cp.crouch * 0.42 + cp.stride * Math.abs(Math.cos(cp.phase)) * 0.035;

/* ---------- captions, title, hikmah, outro ---------- */
const COLOR: Record<string, string> = { narator: "#FFD27A", tukang: "#A9BCFF", retak: "#FF9F7E", utuh: "#9FE6D2" };
const LABEL: Record<string, string> = { narator: "NARATOR", tukang: "TUKANG AIR", retak: "TEMPAYAN RETAK", utuh: "TEMPAYAN UTUH" };
const BIG = new Set(["s7a", "s7e"]);

type Phrase = { who: string; words: Clip["words"]; start: number; end: number };
const PHRASES: Phrase[] = CLIPS.filter((cl) => !BIG.has(cl.id)).flatMap((cl) => {
  const out: Phrase[] = [];
  let cur: Clip["words"] = [];
  cl.words.forEach((w, i) => {
    cur.push(w);
    const stop = /[.,?!…]$/.test(w.w) && cur.length >= 3;
    if (stop || cur.length >= 7 || i === cl.words.length - 1) {
      out.push({ who: cl.who, words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
});

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PHRASES.findIndex((p, n) => t >= p.start - 0.05 && t < Math.min(p.end + 0.4, PHRASES[n + 1]?.start ?? 1e9));
  if (i < 0) return null;
  const p = PHRASES[i];
  const col = COLOR[p.who];
  const pop = ramp(t, p.start - 0.05, p.start + 0.15);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1262, fontFamily: FONT, textAlign: "center", opacity: pop, transform: `translateY(${(1 - pop) * 10}px)` }}>
      <div style={{ display: "inline-block", fontSize: 24, letterSpacing: 6, fontWeight: 600, color: col, marginBottom: 14, padding: "6px 16px", borderTop: `2px solid ${col}`, textShadow: "0 2px 10px rgba(30,15,5,.95)" }}>{LABEL[p.who]}</div>
      <div style={{ fontSize: 52, lineHeight: 1.26, fontWeight: 600, color: "#fff8ec", textShadow: "0 3px 6px rgba(30,14,4,.95), 0 0 28px rgba(30,14,4,.8)" }}>
        {p.words.map((w, k) => {
          const on = t >= w.s && t < w.e + 0.04;
          return (
            <span key={k} style={{ color: on ? col : "#fff8ec" }}>
              {w.w}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** hand-drawn kintsugi hairline under titles */
const GoldLine: React.FC<{ w: number; k: number }> = ({ w, k }) => (
  <svg width={w} height={24} viewBox={`0 0 ${w} 24`} style={{ display: "block", margin: "0 auto" }}>
    <path
      d={`M4 14 L${w * 0.18} 9 L${w * 0.3} 15 L${w * 0.46} 8 L${w * 0.55} 13 L${w * 0.7} 10 L${w * 0.82} 16 L${w - 4} 11`}
      fill="none" stroke="#F2B84B" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={w * 1.2} strokeDashoffset={w * 1.2 * (1 - k)} style={{ filter: "drop-shadow(0 0 6px rgba(255,200,90,.9))" }}
    />
  </svg>
);

const BigLine: React.FC<{ t: number; id: string; lines: string[]; top: number }> = ({ t, id, lines, top }) => {
  const a = T[id], b = E[id];
  const o = win(t, a - 0.3, a + 0.4, b + 1.4, b + 2.2);
  if (o <= 0) return null;
  const words = CLIPS.find((cl) => cl.id === id)!.words;
  let wi = 0;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", opacity: o }}>
      <div style={{ position: "absolute", inset: "-90px -60px", background: "radial-gradient(ellipse at center, rgba(34,16,6,.82) 0%, rgba(34,16,6,.5) 45%, rgba(34,16,6,0) 72%)" }} />
      {lines.map((ln, li) => (
        <div key={li} style={{ position: "relative", fontFamily: SERIF, fontWeight: 600, fontSize: li === 0 ? 84 : 66, lineHeight: 1.12, color: "#FFF4E2", textShadow: "0 3px 18px rgba(40,18,4,.9)" }}>
          {ln.split(" ").map((w, k) => {
            const ww = words[wi++];
            const lit = ww ? ramp(t, ww.s - 0.05, ww.s + 0.2) : 1;
            return (
              <span key={k} style={{ color: lit > 0.5 ? "#FFD27A" : "#FFF4E2", opacity: 0.6 + 0.4 * lit }}>
                {w}{" "}
              </span>
            );
          })}
        </div>
      ))}
      <div style={{ position: "relative", marginTop: 18 }}>
        <GoldLine w={520} k={ramp(t, a, b)} />
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const title = win(t, 0.6, 1.8, T.s2a - 0.8, T.s2a + 0.2);
  const outroStart = TOTAL_SECONDS - 3.4;
  const outro = ramp(t, outroStart, outroStart + 0.8);
  const big = BIG.has(CLIPS.find((cl) => t >= cl.start - 0.3 && t <= cl.end + 0.4)?.id ?? "");
  return (
    <>
      {!big && t < outroStart ? <Captions t={t} /> : null}
      {title > 0 ? (
        <div style={{ position: "absolute", top: 230, left: 60, right: 60, textAlign: "center", opacity: title }}>
          <div style={{ fontFamily: FONT, fontSize: 26, letterSpacing: 12, fontWeight: 600, color: "#FFD27A", textShadow: "0 2px 12px rgba(30,14,4,.9)" }}>CERITA HIKMAH</div>
          <div style={{ fontFamily: SERIF, fontSize: 118, fontWeight: 600, lineHeight: 1.0, marginTop: 14, color: "#FFF4E2", textShadow: "0 4px 26px rgba(30,14,4,.85)" }}>Tempayan Retak</div>
          <div style={{ marginTop: 16 }}>
            <GoldLine w={560} k={ramp(t, 1.0, 3.0)} />
          </div>
        </div>
      ) : null}
      <BigLine t={t} id="s7a" lines={["Kita semua adalah", "tempayan retak."]} top={300} />
      <BigLine t={t} id="s7e" lines={["Jangan takut pada retakanmu.", "Mungkin, dari sanalah bunga-bunga tumbuh."]} top={330} />
      {outro > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: outro, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 430 }} />
          <div style={{ marginTop: 44, fontFamily: FONT, color: "#e8f2ec", fontSize: 32, letterSpacing: 3, fontWeight: 500 }}>Created by Agus Dwi R.</div>
        </div>
      ) : null}
    </>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const t = f / FILM_FPS;
  return (
    <>
      <Stage3D background="#2a1a10" fadeColor="#1d120a" fade={1 - ramp(t, 0.05, 1.2)} overlay={() => <Overlay t={t} />}>
        <Scene f={f} />
      </Stage3D>
      <Html5Audio src={staticFile("audio/ep02/mix.wav")} />
    </>
  );
};
