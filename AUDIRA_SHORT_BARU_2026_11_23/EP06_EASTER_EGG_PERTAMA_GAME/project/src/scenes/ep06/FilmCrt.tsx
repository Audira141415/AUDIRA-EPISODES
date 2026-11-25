// EP06 film — ARCADECRT (Remotion + R3F). One dark arcade, one hero CRT per beat; the camera dives through the
// glass into the voxel game for the "how to find it" beats and comes back out for the real-world story.
// Real people = generic faceless voxel figures + name cards (HUD). Game = our own "KASTIL PIKSEL", no real game art.
// Cuts sit on VO words (timing.ts). HUD chips/captions are the episode's existing HUD (Film.tsx / hud.tsx).
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { SCREEN } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import type { V3 } from "../../kits/arcadecrt/core/motion";
import { Room } from "./crt/Room";
import { Cab, screenAt } from "./crt/Cab";
import { draw1980, drawAttract, drawBox, drawDev, drawEgg, drawHook, drawLander, drawSecret } from "./crt/rasters";
import { BoxStack, Chip3D, Coins, Corridor, Dot, Egg, Hero, Letter, Person, SecretRoom } from "./crt/voxels";
import { Captions, Disclaimer } from "./hud.tsx";
import { HookHud, WarehouseHud, DeskHud, MapHud, RoomRevealHud, TeenHud, OfficeHud, MuseumHud, OutHud } from "./Film.tsx";
import { BREAK, CUT, T, clamp, lerp, sceneAt, seg, smooth, win } from "./timing.ts";

// ------------------------------------------------------------------ camera
type Cam = { pos: V3; target: V3; fov: number; roll?: number };
type Key = Cam & { t: number };
const l3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/** Smooth interpolation through keys + a slow handheld drift so the frame never holds still. */
const camAt = (t: number, keys: Key[], drift = 0.04): Cam => {
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b.t === a.t ? 1 : smooth((t - a.t) / (b.t - a.t));
  const pos = l3(a.pos, b.pos, k);
  const d: V3 = [Math.sin(t * 0.7) * drift, Math.sin(t * 0.53 + 1) * drift * 0.6, Math.cos(t * 0.61) * drift * 0.5];
  return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]], target: l3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k), roll: lerp(a.roll ?? 0, b.roll ?? 0, k) };
};
/** Point at distance `dist` in front of a screen (along its normal, slightly raised). */
const before = (s: V3, dist: number, side = 0, up = 0): V3 => [s[0] + side * dist, s[1] + up * dist + 0.02, s[2] + dist];

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    const r = ((cam.roll ?? 0) * Math.PI) / 180;
    c.up.set(Math.sin(r), Math.cos(r), 0);
    c.lookAt(...cam.target);
    c.fov = cam.fov;
    c.near = 0.02;
    c.far = 250;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }, [camera, cam]);
  return null;
};

// ------------------------------------------------------------------ lighting sets
const Outside: React.FC<{ t: number; sign?: string; key?: number }> = ({ t, sign }) => (
  <>
    <color attach="background" args={["#07060F"]} />
    <fog attach="fog" args={["#07060F", 7, 16]} />
    <ambientLight intensity={0.18} color="#8A7CFF" />
    <spotLight position={[0, 5.5, 3]} angle={0.5} penumbra={0.8} intensity={14} color="#C9B8FF" distance={12} decay={2} castShadow />
    <Room t={t} sign={sign} />
  </>
);
const Inside: React.FC = () => (
  <>
    <color attach="background" args={["#06041A"]} />
    <fog attach="fog" args={["#06041A", 10, 34]} />
    <ambientLight intensity={0.55} color="#B9A8FF" />
    <directionalLight position={[8, 14, 10]} intensity={1.6} color="#FFF1E0" castShadow />
  </>
);

const S0 = screenAt();
const HOOK_DRAW = drawHook(T.nama);
const BOX_DRAWS = ["#7A2DFF", "#FF2E88", "#2EF2FF"].map((hue, i) =>
  drawBox((t) => clamp((t - T.menghapus - 0.1 - i * 0.25) / (T.kotaknya - T.menghapus - 0.6)), (t) => t >= T.kotaknya, hue),
);
const DEV_DRAW = drawDev(T.ruang, T.game);
const EGG_DRAWS = [0, 2, 4].map(drawEgg);

// ------------------------------------------------------------------ scenes
const SceneA: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [
    { t: 0, pos: [-1.7, 1.75, 4.9], target: [0, 1.42, 0], fov: 40, roll: -2.3 },
    { t: 1.6, pos: [-1.2, 1.68, 4.2], target: [0, 1.48, 0.1], fov: 39, roll: -1.8 },
    { t: CUT.B, pos: before(S0, 0.95, -0.25, 0.05), target: S0, fov: 35, roll: -0.6 },
  ], 0.02);
  const power = smooth((t - 0.02) / 0.35);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      <Cab t={t} draw={HOOK_DRAW} power={power} />
    </>
  );
};

const B_X = [-1.45, 0, 1.45];
const SceneB: React.FC<{ t: number }> = ({ t }) => {
  const sub2 = t >= T.alasannya;
  const cam = sub2
    ? camAt(t, [
        { t: T.alasannya, pos: [2.6, 3.2, 4.2], target: [0, 1.0, 1.2], fov: 42 },
        { t: CUT.C, pos: [1.2, 2.4, 3.6], target: [-0.2, 0.9, 1.4], fov: 40 },
      ])
    : camAt(t, [
        { t: CUT.B, pos: [-2.6, 1.3, 3.3], target: [-1.2, 1.4, 0], fov: 40, roll: 1.5 },
        { t: T.kotaknya, pos: [-0.6, 1.45, 2.6], target: [0, 1.5, 0], fov: 38 },
        { t: T.alasannya, pos: [1.6, 1.4, 3.0], target: [0.8, 1.45, 0], fov: 39, roll: -1.5 },
      ]);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      {B_X.map((x, i) => (
        <Cab key={x} t={t} draw={BOX_DRAWS[i]} position={[x, 0, -0.1 * Math.abs(i - 1)]} rotY={-0.12 * (i - 1)} title={["GAME 1", "GAME 2", "GAME 3"][i]} />
      ))}
      {sub2 ? (
        <>
          <Person who="dev" t={t} position={[-0.3, 0, 1.5]} rotY={0.5} />
          <Coins t={t} a={T.gajinya} b={T.tanpa - 0.2} position={[0.55, 0, 1.6]} gone={T.tanpa + 0.35} />
        </>
      ) : null}
    </>
  );
};

const SceneC: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [
    { t: CUT.C, pos: [1.8, 2.2, 4.3], target: [-0.35, 1.2, 0.7], fov: 42, roll: -1 },
    { t: T.diamDiam, pos: [1.2, 2.0, 3.6], target: [-0.2, 1.3, 0.5], fov: 40 },
    { t: T.ruang, pos: before(S0, 1.05, 0.35, 0.1), target: S0, fov: 34 },
    { t: T.game, pos: before(S0, 0.95, 0.3, 0.08), target: S0, fov: 34 },
    { t: T.terjual, pos: [-2.4, 2.3, 4.4], target: [-0.6, 1.2, 0.4], fov: 42, roll: 1 },
    { t: CUT.D, pos: [-1.9, 2.1, 4.0], target: [-0.6, 1.25, 0.4], fov: 41 },
  ]);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      <Cab t={t} draw={DEV_DRAW} />
      <Person who="dev" t={t} position={[-0.42, 0, 1.3]} rotY={Math.PI - 0.4} />
      <BoxStack t={t} a={T.terjual - 0.3} b={T.sejuta + 0.3} position={[-1.35, 0, 0.9]} />
    </>
  );
};

// hero path inside the game (corridor units)
const heroX = (t: number) => {
  if (t < T.ambil) return lerp(0.2, 2.6, seg(t, CUT.D, T.ambil));
  if (t < T.bawa) return 2.6;
  if (t < T.ditembus) return lerp(2.6, 20.6, seg(t, T.bawa, T.ditembus - 0.1));
  return lerp(20.6, 23.5, seg(t, BREAK + 0.2, CUT.D2));
};
const SceneD: React.FC<{ t: number }> = ({ t }) => {
  const hx = heroX(t);
  const carry = t >= T.ambil;
  const dot: V3 = carry ? [hx + 0.55, 1.0 + Math.sin(t * 4) * 0.05, 0.4] : [3, 0.15, 0];
  const macro = win(t, T.ukurannya, T.bawa, 0.5, 0.6);
  const follow: Cam = { pos: [hx - 2.2, 4.2, 6.8], target: [hx + 1.4, 0.8, 0], fov: 44 };
  const close: Cam = { pos: [dot[0] - 0.4, dot[1] + 0.35, dot[2] + 1.3], target: dot, fov: 36 };
  const intro = 1 - seg(t, CUT.D, CUT.D + 1.4);
  const k = macro;
  let cam: Cam = { pos: l3(follow.pos, close.pos, k), target: l3(follow.target, close.target, k), fov: lerp(follow.fov, close.fov, k) };
  cam = { ...cam, pos: [cam.pos[0] - intro * 1.5, cam.pos[1] + intro * 3, cam.pos[2] + intro * 2], roll: Math.sin(t * 0.5) * 1.2 };
  return (
    <>
      <Rig cam={cam} />
      <Inside />
      <Corridor t={t} breakAt={BREAK} />
      <Hero position={[hx, 0, 0.1]} t={t} walking={(t > CUT.D && t < T.ambil) || (t > T.bawa && t < T.ditembus)} rotY={Math.PI / 2} />
      <Dot position={dot} t={t} />
    </>
  );
};

const SceneD2: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [
    { t: CUT.D2, pos: [0.3, 2.2, 6.2], target: [0, 3.0, -7.5], fov: 50 },
    { t: T.dibuat, pos: [-0.4, 2.3, 5.0], target: [0, 3.2, -7.5], fov: 48, roll: 1.0 },
    { t: CUT.E1, pos: [-0.6, 2.35, 4.6], target: [0, 3.25, -7.5], fov: 47, roll: 1.4 },
  ]);
  return (
    <>
      <Rig cam={cam} />
      <Inside />
      <SecretRoom t={t} />
      <Hero position={[0.6, 0, 1.4]} t={t} rotY={Math.PI - 0.3} />
      <Dot position={[1.0, 1.0, 1.6]} t={t} />
    </>
  );
};

const SceneE1: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [
    { t: CUT.E1, pos: [-2.4, 1.7, 4.4], target: [0, 1.25, 0.5], fov: 40, roll: 1.5 },
    { t: T.menyurati, pos: [-1.8, 1.9, 4.6], target: [0, 1.55, 0], fov: 42 },
    { t: T.menghapusnya, pos: [1.4, 2.0, 4.2], target: [0, 2.1, -1.5], fov: 44, roll: -1 },
    { t: CUT.E2, pos: [1.8, 2.2, 4.0], target: [0, 2.1, -1.5], fov: 43 },
  ]);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      <Cab t={t} draw={drawSecret} glow="#FF2E88" />
      <Person who="teen" t={t} position={[0.1, 0, 1.5]} rotY={Math.PI - 0.3} scale={0.85} />
      <Letter t={t} a={T.menyurati} b={T.menyurati + 1.8} from={[0.1, 1.2, 1.6]} to={[0, 3.6, -5.0]} />
      <Chip3D t={t} position={[0.95, 2.4, 0.9]} at={T.menghapusnya} />
    </>
  );
};

const SceneE2: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [
    { t: CUT.E2, pos: [-2.0, 0.9, 5.2], target: [0, 1.2, 0.5], fov: 42, roll: 2 },
    { t: T.easter, pos: [-0.6, 0.95, 5.0], target: [0.1, 1.1, 0.7], fov: 42 },
    { t: CUT.F, pos: [1.7, 1.1, 5.0], target: [0, 1.15, 0.5], fov: 42, roll: -2 },
  ]);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      {B_X.map((x, i) => (
        <Cab key={x} t={t} draw={EGG_DRAWS[i]} position={[x, 0, -0.6 - 0.15 * Math.abs(i - 1)]} rotY={-0.12 * (i - 1)} title="BONUS" />
      ))}
      <Person who="dir" t={t} position={[0.15, 0, 1.0]} rotY={0.15} />
      {[-0.75, 0.95, 1.6].map((x, i) => (
        <Egg key={x} position={[x, 0, 1.7 - i * 0.35]} t={t} at={T.easter + i * 0.18} seed={i * 2} scale={i === 1 ? 1.1 : 0.85} />
      ))}
    </>
  );
};

const F_POS: V3[] = [[-0.8, 0, 0], [0.8, 0, 0]];
const SceneF: React.FC<{ t: number }> = ({ t }) => {
  const sL = screenAt(F_POS[0], 0.18);
  const sR = screenAt(F_POS[1], -0.18);
  const cam = camAt(t, [
    { t: CUT.F, pos: [sL[0] - 0.4, 1.8, 3.6], target: [sL[0], 1.25, 0], fov: 42, roll: 1 },
    { t: T.tapi - 0.2, pos: [sL[0] + 0.1, 1.8, 3.3], target: [sL[0] + 0.1, 1.3, 0], fov: 42 },
    { t: T.tapi + 0.5, pos: [sR[0] + 0.1, 1.85, 3.2], target: [sR[0], 1.3, 0], fov: 41, roll: -1 },
    { t: CUT.OUT, pos: [sR[0] + 0.3, 1.85, 2.9], target: [sR[0], 1.32, 0], fov: 40 },
  ]);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      <Cab t={t} draw={drawLander} position={F_POS[0]} rotY={0.18} title="1973" sub="MOONLANDER" titleColor="#F4F1FF" glow="#F4F1FF" />
      <Cab t={t} draw={draw1980} position={F_POS[1]} rotY={-0.18} title="1980" sub="EASTER EGG" />
    </>
  );
};

const SceneOut: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [
    { t: CUT.OUT, pos: [2.4, 3.6, 3.4], target: [0, 1.5, 0], fov: 40, roll: -2 },
    { t: T.ikuti, pos: [3.4, 4.6, 5.6], target: [0, 1.6, -0.6], fov: 42, roll: -1 },
    { t: CUT.OUT + 12, pos: [4.4, 5.4, 7.6], target: [0, 1.7, -1], fov: 44 },
  ]);
  return (
    <>
      <Rig cam={cam} />
      <Outside t={t} />
      <Cab t={t} draw={drawAttract} title="EASTER EGG" sub="PRESS START" />
    </>
  );
};

const SCENES = { A: SceneA, B: SceneB, C: SceneC, D: SceneD, D2: SceneD2, E1: SceneE1, E2: SceneE2, F: SceneF, OUT: SceneOut } as const;
const HUDS = { A: HookHud, B: WarehouseHud, C: DeskHud, D: MapHud, D2: RoomRevealHud, E1: TeenHud, E2: OfficeHud, F: MuseumHud, OUT: OutHud } as const;

/** Phosphor flash: full strength on the dive into the game (kit rule ≥ 0.9), softer on the other cuts. */
const flashAt = (t: number) =>
  Math.max(
    0.95 * win(t, CUT.D - 0.22, CUT.D + 0.5, 0.22, 0.48),
    0.6 * win(t, CUT.E1 - 0.14, CUT.E1 + 0.3, 0.14, 0.28),
    0.5 * win(t, BREAK, BREAK + 0.3, 0.03, 0.26),
    0.3 * win(t, CUT.D2, CUT.D2 + 0.26, 0.02, 0.22),
    0.3 * win(t, T.easter, T.easter + 0.24, 0.02, 0.2),
    ...[CUT.B, CUT.C, CUT.E2, CUT.F, CUT.OUT].map((c) => 0.28 * win(t, c - 0.06, c + 0.2, 0.06, 0.18)),
  );

export const FilmAt: React.FC<{ t: number; hud?: boolean; captions?: boolean }> = ({ t, hud = true, captions = true }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  void height;
  const sc = sceneAt(t);
  const S = SCENES[sc];
  const H = HUDS[sc];
  const k = width / SCREEN.w;
  const inGame = sc === "D" || sc === "D2";
  return (
    <AbsoluteFill style={{ background: "#07060F", overflow: "hidden" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [-1.7, 1.75, 4.9], fov: 40 }}>
        <S t={t} />
        <Finish frame={frame} background={inGame ? "#06041A" : "#07060F"} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao />
      </ThreeCanvas>
      {inGame ? (
        <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)", mixBlendMode: "multiply" }} />
      ) : null}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 46%, transparent 55%, rgba(4,3,10,0.55) 100%)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", background: "#F4F1FF", opacity: flashAt(t) }} />
      {hud ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
          <H t={t} />
          <Disclaimer t={t} />
          {captions ? <Captions t={t} /> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <FilmAt t={frame / fps} />;
};
