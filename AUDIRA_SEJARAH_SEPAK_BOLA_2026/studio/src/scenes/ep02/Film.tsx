// EP02 film (TIMEFORGE, own studio look, no <Finish>): one continuous camera walk through the
// cover's era corridor. Hook = the approved cover frame; the 1950 Maracanã wound rises at the
// corridor mouth; then pedestal by pedestal (1958 → 2002) each star ignites; the Jules Rimet cup
// vanishes (stolen 1983); payoff on the empty sixth star (2014 1–7, 2026 out vs Norway).
// Every cut, card and caption is keyed to the locked VO (timeline.json). No audio here.
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig, FX_LAYER, Post, type Shot } from "../../core/render/Post.tsx";
import { Studio, type StudioLook } from "../../core/studio/Studio.tsx";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, SKIN_TONES } from "../../core/polish/Person.tsx";
import { INK, INK_SOFT, MANROPE, manropeReady } from "../../core/type/fonts.ts";
import { YearCounter } from "../../kits/timeforge/type/YearCounter.tsx";
import { Outro } from "../_shared/Outro.tsx";
import {
  Ball, BLUE, CAM_POS, CAM_TARGET, Cup, ERAS, FOV, GhostStar, GREEN, LOOK, Overlay, Pedestal, pedestal, PitchRunner, PITCH,
  Player, Star, StarArc, starPos, YELLOW,
} from "./Cover.tsx";
import { glowTexture, plaqueTexture } from "./coverTextures.ts";
import tl from "./timeline.json";

type V3 = [number, number, number];
type Clip = { id: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
const CLIPS = tl.clips as Clip[];
const S = tl.sections as unknown as Record<string, [number, number]>;
const TOTAL = tl.total;

// ---------- time helpers ----------
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
const bump = (t: number, a: number, len = 0.45) => {
  const x = (t - a) / len;
  return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x);
};
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- key moments (VO seconds) ----------
const T = {
  stolenHook: W("hook", 8),
  absen: W("konteks", 1),
  dua3: W("konteks", 10),
  luka: W("konteks", 17),
  y1950: W("konteks", 24),
  maracana: W("konteks", 26),
  cukup: W("konteks", 28),
  kalah: W("konteks", 33),
  swedia: W("pengembangan", 4),
  pele: W("pengembangan", 10),
  duaGol: W("pengembangan", 12),
  brasil58: W("pengembangan", 16),
  biru: W("pengembangan", 20),
  star1: W("pengembangan", 22),
  y1962: W("pengembangan", 25),
  peleCedera: W("pengembangan", 26),
  garrincha: W("pengembangan", 28),
  star2: W("pengembangan", 31),
  y1970: W("pengembangan", 34),
  menang6: W("pengembangan", 36),
  italia70: W("pengembangan", 43),
  star3: W("pengembangan", 45),
  trofi: W("pengembangan", 48),
  jules: W("pengembangan", 49),
  dicuri: W("pengembangan", 56),
  kemarau: W("penjelasan", 0),
  dua4: W("penjelasan", 2),
  y1994: W("penjelasan", 7),
  final94: W("penjelasan", 8),
  adu: W("penjelasan", 12),
  pertama: W("penjelasan", 15),
  star4: W("penjelasan", 18),
  y2002: W("penjelasan", 21),
  ronaldo: W("penjelasan", 22),
  duaGol02: W("penjelasan", 24),
  star5: W("penjelasan", 29),
  sejak: W("payoff", 0),
  kosong: W("payoff", 2),
  y2014: W("payoff", 4),
  kalah14: W("payoff", 5),
  juli: W("payoff", 13),
  tersingkir: W("payoff", 16),
  norwegia: W("payoff", 22),
  satu: W("payoff", 23),
  audira: W("outro", 1),
  sejarah: W("outro", 2),
  episode: W("outro", 5),
};
const STAR_AT = [T.star1, T.star2, T.star3, T.star4, T.star5];
const OUTRO_START = S.OUTRO[1] + 0.2;

// ---------- camera ----------
type Pose = { pos: V3; target: V3; fov: number };
const COVER: Pose = { pos: CAM_POS, target: CAM_TARGET, fov: FOV };
const orbit = (target: V3, az: number, el: number, d: number, fov: number): Pose => ({
  target,
  fov,
  pos: [target[0] + d * Math.sin(az) * Math.cos(el), target[1] + d * Math.sin(el), target[2] + d * Math.cos(az) * Math.cos(el)],
});
const pedShot = (i: number, d: number, drift: number): Pose => {
  const { x, z, h } = pedestal(i);
  const side = Math.sign(x);
  return orbit([x, h + 1.05, z], -side * 0.33 + drift, 0.3, d, 30);
};
const CUP: V3 = [0, 0, -10.6];
const cupShot = (d: number, drift: number): Pose => orbit([0, 1.75, CUP[2]], drift, 0.3, d, 30);
const P1950: V3 = [0, 0, 8.6];
const H1950 = 1.0;
const shot1950 = (d: number, drift: number): Pose => orbit([0, H1950 + 1.05, P1950[2]], -0.3 + drift, 0.28, d, 30);
const ARC_C: V3 = (() => {
  const a = [0, 1, 2, 3, 4, 5].map(starPos);
  return [a.reduce((s, p) => s + p[0], 0) / 6, a.reduce((s, p) => s + p[1], 0) / 6, a.reduce((s, p) => s + p[2], 0) / 6];
})();
const GHOST = starPos(5);
// 2026 shot target: a little toward the arc and below the ghost, so the ghost sits upper-middle with the gold arc above-left
const GHOST_T: V3 = (() => {
  const p = lerp3(GHOST, ARC_C, 0.2);
  return [p[0], p[1] - 0.45, p[2]];
})();

const SHOTS: { a: number; b: number; from: Pose; to: Pose }[] = [
  { a: 0, b: 2.3, from: COVER, to: { ...COVER, pos: lerp3(CAM_POS, CAM_TARGET, 0.07) } },
  { a: 2.9, b: S.HOOK[1], from: cupShot(12, -0.18), to: cupShot(9.6, 0.1) },
  { a: S.KONTEKS[0] + 0.3, b: T.luka - 0.2, from: { pos: [0, 12.5, 25], target: [0, 0.6, -2.5], fov: 30 }, to: { pos: [1.6, 9.6, 19.5], target: [0, 1.0, -3], fov: 30 } },
  { a: T.luka + 0.5, b: S.KONTEKS[1], from: shot1950(14, -0.2), to: shot1950(11.6, 0.14) },
  { a: S.PENGEMBANGAN[0] + 0.35, b: T.y1962 - 0.4, from: pedShot(0, 14, -0.14), to: pedShot(0, 12.2, 0.1) },
  { a: T.y1962, b: T.y1970 - 0.35, from: pedShot(1, 13.6, 0.12), to: pedShot(1, 12.2, -0.08) },
  { a: T.y1970, b: T.trofi - 0.3, from: pedShot(2, 13.6, -0.12), to: pedShot(2, 12.0, 0.1) },
  { a: T.trofi + 0.1, b: S.PENGEMBANGAN[1], from: cupShot(11.5, 0.16), to: cupShot(9.6, -0.06) },
  { a: T.kemarau + 0.05, b: T.y1994 - 0.1, from: { pos: [1.1, 3.6, 9], target: [0, 1.5, -6], fov: 36 }, to: { pos: [-0.7, 3.3, 0.5], target: [0, 1.6, -10], fov: 36 } },
  { a: T.y1994 + 0.15, b: T.y2002 - 0.4, from: pedShot(3, 13.6, 0.12), to: pedShot(3, 12.0, -0.1) },
  { a: T.y2002 - 0.05, b: S.PENJELASAN[1], from: pedShot(4, 13.6, -0.12), to: pedShot(4, 12.0, 0.1) },
  { a: S.PAYOFF[0] + 0.2, b: T.juli - 0.3, from: orbit(ARC_C, -0.12, 0.1, 21, 32), to: orbit(ARC_C, 0.06, 0.08, 18.5, 32) },
  { a: T.juli, b: S.PAYOFF[1], from: orbit(GHOST_T, 0.34, -0.38, 10.6, 34), to: orbit(GHOST_T, 0.24, -0.36, 9.2, 34) },
  { a: S.OUTRO[0] + 0.3, b: OUTRO_START, from: orbit(ARC_C, 0.1, 0.25, 22, 26), to: { ...COVER, pos: lerp3(CAM_POS, CAM_TARGET, -0.04) } },
];

const lerpPose = (a: Pose, b: Pose, k: number): Pose => ({ pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: a.fov + (b.fov - a.fov) * k });
const camAt = (t: number): Pose => {
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    if (t <= s.b) {
      if (t >= s.a) return lerpPose(s.from, s.to, seg(t, s.a, s.b) * 0.6 + ((t - s.a) / (s.b - s.a)) * 0.4);
      // glide between the previous shot's end and this shot's start (cubic in-out)
      const prev = SHOTS[i - 1];
      return lerpPose(prev.to, s.from, smooth((t - prev.b) / (s.a - prev.b)));
    }
  }
  return SHOTS[SHOTS.length - 1].to;
};
const shotAt = (t: number): Shot => {
  const p = camAt(t);
  const d = Math.hypot(p.pos[0] - p.target[0], p.pos[1] - p.target[1], p.pos[2] - p.target[2]);
  // cover-matched lens in the hook, then a shallower one so background pedestals soften behind the hero
  const k = seg(t, 2.3, 3.0);
  return { pos: p.pos, target: p.target, fov: p.fov, focus: d, aperture: 0.0012 + 0.0022 * k, maxBlur: 0.006 + 0.006 * k, exposure: 1.0 };
};

// ---------- studio mood ----------
const mixLook = (a: StudioLook, b: StudioLook, k: number): StudioLook => ({
  ...a,
  tint: [a.tint[0] + (b.tint[0] - a.tint[0]) * k, a.tint[1] + (b.tint[1] - a.tint[1]) * k, a.tint[2] + (b.tint[2] - a.tint[2]) * k],
  tintAmount: a.tintAmount + (b.tintAmount - a.tintAmount) * k,
  keyIntensity: a.keyIntensity + (b.keyIntensity - a.keyIntensity) * k,
});
const WARM: StudioLook = { ...LOOK, tint: [1.08, 0.98, 0.84], keyIntensity: 2.6 };
const GREY: StudioLook = { ...LOOK, tint: [0.88, 0.92, 0.97], tintAmount: 0.9, keyIntensity: 1.7 };
const DRY: StudioLook = { ...LOOK, tint: [1.18, 0.95, 0.72], tintAmount: 0.95 };
const lookAt = (t: number): StudioLook => {
  const grey = Math.max(win(t, T.luka, S.KONTEKS[1] + 0.3, 1.0, 0.8), win(t, T.y2014 - 0.4, S.PAYOFF[1], 0.8, 0.8));
  const dry = win(t, T.kemarau - 0.2, T.y1994 + 0.4, 0.5, 0.6);
  // hook = exact cover look; then a warmer, stronger key for separation
  const base = mixLook(LOOK, WARM, seg(t, 2.3, 3.0));
  return mixLook(mixLook(base, GREY, grey), DRY, dry);
};

// ---------- extra 3D for the film ----------
/** 23 discs on the runner: one per World Cup edition, lighting up as the VO counts "23 dari 23". */
const EditionDiscs: React.FC<{ t: number }> = ({ t }) => {
  const vis = win(t, S.KONTEKS[0], T.luka + 0.6, 0.4, 0.6);
  if (vis <= 0.001) return null;
  return (
    <>
      {Array.from({ length: 23 }, (_, i) => {
        const on = seg(t, T.dua3 + i * 0.075, T.dua3 + i * 0.075 + 0.2);
        const z = 11.5 - i * 0.95;
        return (
          <mesh key={i} position={[0, 0.07 + 0.05 * on, z]} scale={[vis, 1, vis]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.08, 40]} />
            <meshPhysicalMaterial color={on > 0.5 ? "#dff7e6" : "#f2f0eb"} emissive={PITCH} emissiveIntensity={1.2 * on} roughness={0.35} clearcoat={0.6} />
          </mesh>
        );
      })}
    </>
  );
};

/** 1950 pedestal: rises at the mouth of the corridor for the Maracanã wound, white shirt (the kit Brazil dropped after 1950). */
const Pedestal1950: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const rise = Math.min(seg(t, T.luka + 0.3, T.y1950 + 0.2), 1 - seg(t, S.KONTEKS[1], S.PENGEMBANGAN[0] + 0.6));
  const grain = useSurfaceGrain(29, 0.12, 3);
  const look = useMemo(() => ({ skin: SKIN_TONES[3], hair: "#1b1411", top: "#f4f2ee", bottom: "#f4f2ee", outfit: "casual" as const, hairStyle: 0 as const, build: 1.04, height: 1 }), []);
  if (rise <= 0.002) return null;
  const h = H1950 * rise;
  return (
    <group position={P1950}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]} scale={[1, Math.max(0.01, rise), 1]}>
        <RoundedBoxGeo args={[1.7, H1950, 1.7]} radius={0.08} segments={4} />
        <meshPhysicalMaterial color="#c9cbc8" roughness={0.5} roughnessMap={grain} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, h * 0.5, 0.853]} scale={[1, Math.max(0.01, rise), 1]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshPhysicalMaterial map={plaqueTexture("1950", "#c0262b", true)} roughness={0.5} />
      </mesh>
      {rise > 0.9 ? (
        <>
          <ToyPerson f={f} seed={41} pose="stand" look={look} position={[0.1, h, -0.1]} heading={-0.25} scale={1.9} />
          <Ball pos={[-0.5, h + 0.26, 0.4]} skin="leather" detail />
        </>
      ) : null}
    </group>
  );
};

/** Era star that pops beside the player when the VO says "Bintang ke-N" (stays lit). */
/** Era players: on stage in the hook (cover), sink into their pedestals after it so the corridor
 * reads one subject at a time, rise again when the walk reaches their era, all present from the payoff. */
const ERA_IN = () => [S.PENGEMBANGAN[0] + 0.1, T.y1962 - 0.3, T.y1970 - 0.3, T.y1994 - 0.15, T.y2002 - 0.35];
const presence = (i: number, t: number) => {
  const out = 1 - seg(t, S.KONTEKS[0] - 0.3, S.KONTEKS[0] + 0.5);
  const back = seg(t, ERA_IN()[i], ERA_IN()[i] + 0.7);
  return Math.max(out, back);
};

const LocalStar: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  // lit beside its player for its own shot, then again from the payoff on (never as stray foreground)
  const k = seg(t, STAR_AT[i], STAR_AT[i] + 0.35) * Math.max(1 - seg(t, STAR_AT[i] + 2.6, STAR_AT[i] + 3.0), seg(t, S.PAYOFF[0], S.PAYOFF[0] + 0.5));
  if (k <= 0.001) return null;
  const { x, z, h } = pedestal(i);
  const side = Math.sign(x);
  return <Star pos={[x - side * 0.85, h + 1.85, z + 0.2]} tilt={0.1 * side} halo={i % 2 ? "#3D7BFF" : PITCH} lit={k} scale={0.75 + 0.35 * bump(t, STAR_AT[i], 0.5)} />;
};

/**
 * Separation for pale figures on a pale studio: a cool rim light from behind the subject (relative
 * to the camera) and a grey value falloff (fog) so the far corridor sits darker than the hero.
 * Both fade in after the hook, so frame 0 stays the approved cover.
 */
const RimAndFog: React.FC<{ shot: Shot; t: number }> = ({ shot, t }) => {
  const { scene } = useThree();
  const k = seg(t, 2.3, 3.0);
  const tgt = useMemo(() => new THREE.Object3D(), []);
  const fog = useMemo(() => new THREE.Fog("#aaa59c", 1000, 3000), []);
  const d = new THREE.Vector3(...shot.target).sub(new THREE.Vector3(...shot.pos));
  const dist = d.length();
  d.normalize();
  const lp: V3 = [shot.target[0] + d.x * 16 + 3, shot.target[1] + 9, shot.target[2] + d.z * 16];
  tgt.position.set(...shot.target);
  tgt.updateMatrixWorld();
  useLayoutEffect(() => {
    fog.near = dist + 1 + (1 - k) * 2000;
    fog.far = dist + 24 + (1 - k) * 4000;
    scene.fog = fog;
  });
  return (
    <>
      <primitive object={tgt} />
      <directionalLight position={lp} target={tgt} intensity={3.2 * k} color="#a9c8ff" />
    </>
  );
};

/** The empty sixth star as a subject: warm lit outline, soft glow, and a Norway-red ring under it. */
const GhostHalo: React.FC<{ t: number; face: V3 }> = ({ t, face }) => {
  const k = win(t, S.PAYOFF[0], S.OUTRO[0] + 0.5, 0.6, 0.6);
  const red = win(t, T.tersingkir - 0.2, S.PAYOFF[1] + 0.3, 0.4, 0.4);
  const outline = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? 0.18 : 0.42;
      pts.push(new THREE.Vector3(rr * Math.cos(a), rr * Math.sin(a), 0.07));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0), 120, 0.018, 6, true);
  }, []);
  if (k <= 0.001) return null;
  const o = new THREE.Object3D();
  o.position.set(...GHOST);
  o.lookAt(...face);
  o.rotateZ(0.08);
  const sc = 1 + 0.25 * Math.max(bump(t, T.kosong - 0.1, 0.9), bump(t, T.tersingkir, 1.0), 0.35 * win(t, T.juli, S.PAYOFF[1], 0.4, 0.4));
  return (
    <group position={GHOST} quaternion={o.quaternion} scale={sc}>
      <mesh geometry={outline} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <meshBasicMaterial color={new THREE.Color("#FFE6A8").lerp(new THREE.Color("#ff6a5a"), red).multiplyScalar(1.6)} toneMapped={false} transparent opacity={k} />
      </mesh>
      <mesh position={[0, 0, -0.2]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[2.0, 2.0]} />
        <meshBasicMaterial map={glowTexture()} color={new THREE.Color("#FFE07A").lerp(new THREE.Color("#C8202F"), red)} transparent opacity={0.45 * k} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.62, 0]} rotation={[Math.PI / 2 - 0.25, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <torusGeometry args={[0.42, 0.016, 8, 96]} />
        <meshBasicMaterial color={new THREE.Color("#ff4a4a").multiplyScalar(1.5)} toneMapped={false} transparent opacity={red} />
      </mesh>
    </group>
  );
};

const FilmScene: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const shot = shotAt(t);
  // arc stars: all lit in the hook (cover), dim when the story starts at the wound, then ignite one by one
  const arcLit = (i: number) => (t < T.luka + 0.2 ? 1 - seg(t, T.luka - 0.4, T.luka + 0.2) : seg(t, STAR_AT[i], STAR_AT[i] + 0.4));
  const cupK = Math.min(1 - seg(t, T.stolenHook, T.stolenHook + 0.6), 1) + (t > T.trofi ? seg(t, T.trofi, T.trofi + 0.5) * (1 - seg(t, T.dicuri, T.dicuri + 0.6)) : 0);
  const pulse = Math.max(bump(t, T.kosong - 0.1, 0.9), bump(t, T.tersingkir, 1.0), 0.35 * win(t, T.juli, S.PAYOFF[1], 0.4, 0.4));
  return (
    <>
      <Studio look={lookAt(t)} plinth={{ top: 0, r: 90, h: 1, ring: false }} shadow={{ left: -18, right: 18, top: 22, bottom: -22, near: 4, far: 80 }} />
      <PitchRunner />
      <EditionDiscs t={t} />
      <Pedestal1950 t={t} f={f} />
      {ERAS.map((_, i) => (
        <React.Fragment key={i}>
          <Pedestal i={i} satin={t > 2.4} />
          <group position={[0, -2.4 * (1 - presence(i, t)), 0]} visible={presence(i, t) > 0.01}>
            <Player i={i} f={f} detail={t > 2.4} />
          </group>
          <Star pos={starPos(i)} tilt={(i % 2 ? -1 : 1) * 0.12} halo={i % 2 ? "#3D7BFF" : PITCH} lit={arcLit(i)} scale={1 + 0.3 * bump(t, STAR_AT[i], 0.5)} face={shot.pos} />
          <LocalStar i={i} t={t} />
        </React.Fragment>
      ))}
      <GhostStar pos={starPos(5)} pulse={pulse} face={shot.pos} />
      <GhostHalo t={t} face={shot.pos} />
      <Cup pos={CUP} cupK={clamp01(cupK)} />
      <StarArc dotColor={t > 2.4 ? "#E9B400" : "#8b9295"} />
      <RimAndFog shot={shot} t={t} />
      <CameraRig shot={shot} />
      <Post shot={shot} frame={Math.round(f)} aoRadius={0.45} />
    </>
  );
};

// ---------- HTML layer (laid out at 1080×1920, scaled) ----------
const RED = "#C0262B";
type FlagId = "BRA" | "SWE" | "URU" | "ITA" | "GER" | "NOR";
const Flag: React.FC<{ id: FlagId }> = ({ id }) => {
  const box: React.CSSProperties = { width: 54, height: 36, borderRadius: 4, overflow: "hidden", position: "relative", boxShadow: "0 0 0 1px rgba(31,36,38,0.18)", flex: "none" };
  if (id === "BRA")
    return (
      <div style={{ ...box, background: "#1E9A4C" }}>
        <div style={{ position: "absolute", left: 13, top: 4, width: 28, height: 28, background: YELLOW, transform: "scaleX(1.25) rotate(45deg)" }} />
        <div style={{ position: "absolute", left: 18, top: 9, width: 18, height: 18, borderRadius: 9, background: "#1F4FB5" }} />
      </div>
    );
  if (id === "SWE")
    return (
      <div style={{ ...box, background: "#2A64B0" }}>
        <div style={{ position: "absolute", left: 15, top: 0, width: 8, height: 36, background: "#F4C430" }} />
        <div style={{ position: "absolute", left: 0, top: 14, width: 54, height: 8, background: "#F4C430" }} />
      </div>
    );
  if (id === "URU")
    return (
      <div style={{ ...box, background: "repeating-linear-gradient(180deg, #fff 0 4px, #3B78C8 4px 8px)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 22, height: 18, background: "#fff" }} />
        <div style={{ position: "absolute", left: 5, top: 3, width: 12, height: 12, borderRadius: 6, background: "#F4C430" }} />
      </div>
    );
  if (id === "ITA") return <div style={{ ...box, background: "linear-gradient(90deg, #1E9A4C 0 33.3%, #fff 33.3% 66.6%, #C0262B 66.6%)" }} />;
  if (id === "GER") return <div style={{ ...box, background: "linear-gradient(180deg, #1b1d20 0 33.3%, #D0202A 33.3% 66.6%, #F4C430 66.6%)" }} />;
  return (
    <div style={{ ...box, background: "#C8202F" }}>
      <div style={{ position: "absolute", left: 13, top: 0, width: 12, height: 36, background: "#fff" }} />
      <div style={{ position: "absolute", left: 0, top: 12, width: 54, height: 12, background: "#fff" }} />
      <div style={{ position: "absolute", left: 16, top: 0, width: 6, height: 36, background: "#1F3F8F" }} />
      <div style={{ position: "absolute", left: 0, top: 15, width: 54, height: 6, background: "#1F3F8F" }} />
    </div>
  );
};

const cardStyle = (accent: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "16px 30px 18px",
  background: "rgba(250,249,246,0.92)",
  borderLeft: `6px solid ${accent}`,
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(31,36,38,0.12)",
  textAlign: "left",
});
const Card: React.FC<{ title: React.ReactNode; sub?: React.ReactNode; accent?: string }> = ({ title, sub, accent = PITCH }) => (
  <div style={cardStyle(accent)}>
    <div style={{ fontSize: 50, fontWeight: 600, letterSpacing: "0.04em", color: INK, lineHeight: 1.08 }}>{title}</div>
    {sub ? <div style={{ fontSize: 32, fontWeight: 500, color: INK_SOFT, marginTop: 6, lineHeight: 1.2 }}>{sub}</div> : null}
  </div>
);
const Score: React.FC<{ a: FlagId; an: string; sc: string; b: FlagId; bn: string; sub?: React.ReactNode; accent?: string }> = ({ a, an, sc, b, bn, sub, accent = PITCH }) => (
  <div style={cardStyle(accent)}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 44, fontWeight: 600, color: INK }}>
      <Flag id={a} />
      <span>{an}</span>
      <span style={{ fontWeight: 300, fontSize: 60, letterSpacing: "0.02em", margin: "0 6px" }}>{sc}</span>
      <span>{bn}</span>
      <Flag id={b} />
    </div>
    {sub ? <div style={{ fontSize: 30, fontWeight: 500, color: INK_SOFT, marginTop: 8 }}>{sub}</div> : null}
  </div>
);
const Dots: React.FC<{ n: number; on: number; color: string }> = ({ n, on, color }) => (
  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: i < on ? color : "transparent", border: `3px solid ${color}`, boxSizing: "border-box" }} />
    ))}
  </div>
);
const StarCard: React.FC<{ n: number }> = ({ n }) => (
  <div style={cardStyle("#E9B400")}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 50, fontWeight: 600, color: INK, letterSpacing: "0.08em" }}>
      BINTANG {n}
      <span style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ fontSize: 38, color: i < n ? "#E9B400" : "#c8ccce" }}>★</span>
        ))}
      </span>
    </div>
  </div>
);

type Cue = { a: number; b: number; row: 0 | 1; top?: number; node: (t: number) => React.ReactNode };
const CUES: Cue[] = [
  { a: 2.9, b: S.HOOK[1], row: 0, node: () => <Card title="TROFI ASLI" sub="dicuri · tak pernah kembali" accent={RED} /> },
  {
    a: T.absen - 0.2, b: T.luka - 0.1, row: 0,
    node: (t) => (
      <div style={cardStyle(PITCH)}>
        <div style={{ fontSize: 84, fontWeight: 200, color: INK, lineHeight: 1 }}>
          {Math.max(0, Math.min(23, Math.floor(23 * seg(t, T.dua3, T.dua3 + 1.8))))}
          <span style={{ color: INK_SOFT }}> / 23</span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 500, color: INK_SOFT, marginTop: 6 }}>Piala Dunia · tak pernah absen</div>
      </div>
    ),
  },
  { a: T.luka, b: T.maracana - 0.1, row: 0, node: () => <Card title="DIMULAI DARI LUKA" accent={RED} /> },
  { a: T.maracana, b: S.KONTEKS[1], row: 0, node: () => <Card title="MARACANÃ, RIO" sub="Brasil tuan rumah" accent={RED} /> },
  { a: T.cukup, b: T.kalah - 0.05, row: 1, node: () => <Card title="cukup SERI = juara" accent="#b9bec0" /> },
  { a: T.kalah, b: S.KONTEKS[1], row: 1, node: () => <Score a="BRA" an="BRASIL" sc="1–2" b="URU" bn="URUGUAY" accent={RED} /> },
  { a: T.swedia, b: T.pele - 0.1, row: 0, node: () => <Card title="SWEDIA" sub="Piala Dunia 1958" /> },
  { a: T.pele, b: T.star1 - 0.1, row: 0, node: () => <Card title="PELÉ" sub="Brasil · umur 17 tahun" accent={BLUE} /> },
  { a: T.duaGol, b: T.brasil58 - 0.05, row: 1, node: () => <Card title="2 GOL di final" /> },
  { a: T.brasil58, b: T.star1 - 0.1, row: 1, node: (t) => <Score a="BRA" an="BRASIL" sc="5–2" b="SWE" bn="SWEDIA" sub={<span style={{ opacity: seg(t, T.biru, T.biru + 0.3) }}>final · Brasil memakai <b style={{ color: BLUE }}>baju biru</b></span>} /> },
  { a: T.star1, b: T.y1962 + 0.2, row: 0, node: () => <StarCard n={1} /> },
  { a: T.peleCedera, b: T.garrincha - 0.05, row: 0, node: () => <Card title="PELÉ cedera" sub="1962 · di laga ke-2" accent={RED} /> },
  { a: T.garrincha, b: T.star2 - 0.1, row: 0, node: () => <Card title="GARRINCHA" sub="Brasil · ambil alih" /> },
  { a: T.star2, b: T.y1970 + 0.2, row: 0, node: () => <StarCard n={2} /> },
  { a: T.menang6, b: T.italia70 - 0.05, row: 0, node: (t) => <div style={cardStyle(PITCH)}><div style={{ fontSize: 50, fontWeight: 600, color: INK }}>6 dari 6 MENANG</div><Dots n={6} on={Math.floor(6 * seg(t, T.menang6, T.menang6 + 1.2) + 0.001)} color={GREEN} /></div> },
  { a: T.italia70, b: T.star3 - 0.1, row: 0, node: () => <Score a="BRA" an="BRASIL" sc="4–1" b="ITA" bn="ITALIA" sub="final 1970" /> },
  { a: T.star3, b: T.trofi + 0.1, row: 0, node: () => <StarCard n={3} /> },
  { a: T.jules, b: T.dicuri - 0.05, row: 0, node: () => <Card title="JULES RIMET" sub="trofi jadi milik Brasil selamanya" accent="#E9B400" /> },
  { a: T.dicuri, b: S.PENGEMBANGAN[1], row: 0, node: () => <Card title="DICURI · 1983" sub="tak pernah ditemukan" accent={RED} /> },
  { a: T.dua4 - 0.1, b: T.y1994 - 0.05, row: 0, node: () => <Card title="24 TAHUN" sub="tanpa gelar" accent="#D98A2B" /> },
  { a: T.y1994 + 0.3, b: T.final94 - 0.05, row: 0, node: () => <Card title="ROMÁRIO" sub="Brasil · Piala Dunia 1994" /> },
  { a: T.final94, b: T.star4 - 0.1, row: 0, node: () => <Score a="BRA" an="BRASIL" sc="0–0" b="ITA" bn="ITALIA" sub="final 1994" /> },
  { a: T.adu, b: T.star4 - 0.1, row: 1, node: (t) => <Card title="adu penalti 3–2" sub={<span style={{ opacity: seg(t, T.pertama, T.pertama + 0.3) }}>final pertama lewat adu penalti</span>} /> },
  { a: T.star4, b: T.y2002 + 0.2, row: 0, node: () => <StarCard n={4} /> },
  { a: T.ronaldo, b: T.star5 - 0.1, row: 0, node: () => <Card title="RONALDO" sub="Brasil · 2 gol di final" /> },
  { a: T.duaGol02, b: T.star5 - 0.1, row: 1, node: () => <Score a="BRA" an="BRASIL" sc="2–0" b="GER" bn="JERMAN" sub="final 2002" /> },
  { a: T.star5, b: S.PENJELASAN[1] + 0.2, row: 0, node: () => <StarCard n={5} /> },
  { a: T.kosong, b: T.y2014 + 0.1, row: 0, node: () => <Card title="BINTANG 6: KOSONG" accent="#9aa0a2" /> },
  { a: T.kalah14, b: T.juli - 0.1, row: 0, node: () => <Score a="BRA" an="BRASIL" sc="1–7" b="GER" bn="JERMAN" sub="semifinal 2014 · di kandang sendiri" accent={RED} /> },
  { a: T.tersingkir, b: T.satu - 0.05, row: 0, top: 1170, node: () => <Score a="BRA" an="BRASIL" sc="1–2" b="NOR" bn="NORWEGIA" sub="Juli 2026 · tersingkir di 16 besar" accent={RED} /> },
  { a: T.satu, b: S.PAYOFF[1] + 0.1, row: 0, top: 1170, node: () => <Card title="vs NORWEGIA" sub="Brasil belum pernah menang" accent={RED} /> },
  { a: T.sejarah - 0.1, b: T.episode - 0.05, row: 0, node: () => <Card title="SEJARAH SEPAK BOLA" sub="AUDIRA · seri #02" /> },
  { a: T.episode, b: OUTRO_START + 0.4, row: 0, node: () => <Card title="BERIKUTNYA" sub="Siapa pemain terbaik sepanjang masa?" accent="#E9B400" /> },
];

// rolling year: [time, year]; rolls in 0.6 s windows
const YEARS: [number, number][] = [
  [T.y1950, 1950], [S.PENGEMBANGAN[0] + 0.3, 1958], [T.y1962, 1962], [T.y1970, 1970], [T.dua4, 1994], [T.y2002, 2002], [T.y2014, 2014], [T.juli, 2026],
];
const yearAt = (t: number) => {
  let y = YEARS[0][1];
  for (let i = 1; i < YEARS.length; i++) {
    const [ta, ya] = YEARS[i];
    const len = ya - YEARS[i - 1][1] > 10 ? 1.4 : 0.6;
    if (t >= ta) y = ya;
    else if (t > ta - len) y = YEARS[i - 1][1] + (ya - YEARS[i - 1][1]) * smooth((t - (ta - len)) / len);
  }
  return y;
};

// ---------- karaoke captions ----------
type Group = { words: Clip["words"]; a: number; b: number };
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const c of CLIPS) {
    const gs: Clip["words"][] = [];
    let cur: Clip["words"] = [];
    for (const w of c.words) {
      cur.push(w);
      if ((/[.,:;?!]$/.test(w.w) && cur.length >= 2) || cur.length >= 6) {
        gs.push(cur);
        cur = [];
      }
    }
    if (cur.length) gs.push(cur);
    // never leave one word alone
    for (let i = 0; i < gs.length; i++) {
      if (gs[i].length === 1) {
        if (i > 0 && gs[i - 1].length < 8) {
          gs[i - 1].push(...gs[i]);
          gs.splice(i, 1);
          i--;
        } else if (i + 1 < gs.length) {
          gs[i + 1].unshift(...gs[i]);
          gs.splice(i, 1);
          i--;
        }
      }
    }
    gs.forEach((g, i) => out.push({ words: g, a: g[0].s - 0.08, b: i + 1 < gs.length ? gs[i + 1][0].s - 0.08 : c.end + 0.15 }));
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const g = GROUPS.find((x) => t >= x.a && t < x.b);
  if (!g || t >= OUTRO_START) return null;
  const n = g.words.length;
  const lines = n > 4 ? [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))] : [g.words];
  const k = seg(t, g.a, g.a + 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1336, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ padding: "12px 18px 14px", borderRadius: 18, background: "rgba(248,247,243,0.82)", boxShadow: "0 8px 26px rgba(31,36,38,0.10)", maxWidth: 1000 }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "nowrap", marginTop: li ? 6 : 0 }}>
          {ln.map((w, wi) => {
            const active = t >= w.s && t < Math.max(w.e, w.s + 0.12);
            const said = t >= w.s;
            const pop = 1 + 0.04 * bump(t, w.s, 0.22);
            return (
              <span
                key={wi}
                style={{
                  margin: "0 12px",
                  fontSize: 50,
                  fontWeight: 600,
                  color: active ? GREEN : said ? INK : "#5a5a5a",
                  transform: `scale(${pop})`,
                  display: "inline-block",
                  textShadow: "0 2px 14px rgba(250,249,246,0.95), 0 0 4px rgba(250,249,246,0.9)",
                  borderBottom: active ? `5px solid ${PITCH}` : "5px solid transparent",
                  paddingBottom: 2,
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

const HtmlLayer: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const yearK = win(t, T.y1950 - 0.2, S.PAYOFF[1], 0.4, 0.4);
  const y = yearAt(t);
  const yPrev = yearAt(t - 1 / 30);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0", fontFamily: MANROPE }}>
      {/* soft paper band behind the top type so it reads over any shot */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(243,241,236,0.85) 0%, rgba(243,241,236,0.55) 20%, rgba(243,241,236,0) 34%)", opacity: 1 - win(t, 0, 2.6, 0.01, 0.5) }} />
      {yearK > 0.01 ? (
        <div style={{ position: "absolute", top: 210, left: 0, right: 0, opacity: yearK }}>
          <YearCounter year={Math.round(y * 1000) / 1000} prev={yPrev} size={128} font={MANROPE} color={INK} weight={200} />
        </div>
      ) : null}
      {CUES.map((c, i) => {
        const o = win(t, c.a, c.b, 0.22, 0.2);
        if (o <= 0.001) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: c.top ?? (c.row === 0 ? 372 : 560), textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
            {c.node(t)}
          </div>
        );
      })}
      <Captions t={t} />
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const [handle] = useState(() => delayRender("Manrope for EP02 film"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const headK = 1 - seg(t, 2.0, 2.6);
  const tagK = 1 - seg(t, 0.3, 0.7);
  return (
    <AbsoluteFill style={{ background: "#e9e6e0" }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: FOV, near: 1, far: 900, position: CAM_POS }}
          >
            <FilmScene t={t} />
          </ThreeCanvas>
          {headK > 0.001 ? (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
              <Overlay headK={headK} tagK={tagK} />
            </div>
          ) : null}
          {/* light pool on the hero: soft value falloff toward the frame edges (after the hook) */}
          <AbsoluteFill
            style={{
              background: "radial-gradient(62% 38% at 50% 50%, rgba(46,40,32,0) 0%, rgba(46,40,32,0) 50%, rgba(46,40,32,0.42) 100%)",
              opacity: seg(t, 2.3, 3.0) * (1 - seg(t, OUTRO_START - 0.2, OUTRO_START)),
            }}
          />
          <HtmlLayer t={t} k={k} />
          <Outro start={OUTRO_START} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const FILM_SECONDS = TOTAL;
