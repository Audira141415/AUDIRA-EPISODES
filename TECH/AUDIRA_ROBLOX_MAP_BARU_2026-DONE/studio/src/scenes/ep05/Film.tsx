// EP05 film (DEVFORGE) "Bikin Map Pakai Prompt" on the locked voice. Opens on the approved cover framing,
// then travels through one continuous world (stations along +x). Every key is anchored to a word time.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline.json";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { DEVFORGE_PALETTE as P } from "../../kits/devforge/lib/palette.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { BG, BackWall, COVER_CAMERA, PANEL_POS, type V3 } from "./Hook.tsx";
import { glowTexture } from "./textures.ts";
import { Headline, useDisplayFont } from "./Cover.tsx";
import { S0Hook, S1Context, S2aEconomy, S2bPercent, S2cTrap, S3Explain, S4Checks, S4bSceneGen, S5Outro, SX } from "./Stations.tsx";
import { Captions } from "./Captions.tsx";
import { clamp01, w } from "./timing.ts";

const easeSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

export const TOTAL_SECONDS: number = timeline.total;
const OUTRO_AT = timeline.voEnd + 0.6;

// ---------- camera ----------
type Pose = { p: V3; q: V3 };
const station = (sx: number, T = -2, dx = 2.6, dz = 47): Pose => ({ p: [sx + dx, T + 3, dz], q: [sx + 0.2, T, 0] });
const KEYS: { at: number; dur: number; pose: Pose }[] = [
  { at: 0, dur: 0, pose: { p: COVER_CAMERA.position, q: COVER_CAMERA.target } },
  { at: w("l01", "tapi"), dur: 1.5, pose: { p: [1.5, 0.5, 44], q: [0.2, -1.8, 0] } },
  { at: w("l02", "ada") - 0.8, dur: 4.0, pose: { p: [SX.s1 - 7.5, 6.5, 40], q: [SX.s1 - 0.6, -1.4, 0] } },
  { at: w("l03", "assistant"), dur: 1.8, pose: { p: [SX.s1 + 9.5, 5.5, 40], q: [SX.s1 + 1.8, -1.4, 0] } },
  { at: w("l04", "di") - 0.8, dur: 4.0, pose: { p: [SX.s2a - 3.0, -6.5, 37], q: [SX.s2a - 0.2, -3.4, 0] } },
  { at: w("l05", "data") - 0.8, dur: 4.0, pose: station(SX.s2b) },
  { at: w("l06", "ada") - 0.8, dur: 4.0, pose: { p: [SX.s2c - 9.0, 7.0, 44], q: [SX.s2c - 0.8, -1.6, 0] } },
  { at: w("l06", "permanen"), dur: 1.5, pose: { p: [SX.s2c - 6.5, 5.0, 38], q: [SX.s2c - 0.2, -1.6, 0] } },
  { at: w("l07", "untuk") - 0.8, dur: 4.0, pose: { p: [SX.s3 + 3.0, 2.7, 49], q: [SX.s3 + 0.3, -0.3, 0] } },
  { at: w("l07", "satu"), dur: 1.4, pose: { p: [SX.s3 + 1.6, 3.6, 42], q: [SX.s3 - 0.2, 2.6, 0] } },
  { at: w("l08", "dua"), dur: 1.4, pose: { p: [SX.s3 + 3.0, 2.7, 49], q: [SX.s3 + 0.3, -0.3, 0] } },
  { at: w("l08", "tiga"), dur: 1.4, pose: { p: [SX.s3 + 1.6, 3.6, 42], q: [SX.s3 - 0.2, 2.6, 0] } },
  { at: w("l09", "contoh"), dur: 1.6, pose: { p: [SX.s3 + 0.2, 0.5, 47], q: [SX.s3 - 1.0, -1.8, 0] } },
  { at: w("l10", "ingat") - 0.8, dur: 4.0, pose: station(SX.s4) },
  { at: w("l11", "roblox") - 0.8, dur: 4.0, pose: station(SX.s4b) },
  { at: w("l12", "alatnya") - 0.8, dur: 4.0, pose: station(SX.s5) },
  { at: w("l12", "ini"), dur: 1.6, pose: { p: [SX.s5 + 1.0, -0.8, 39], q: [SX.s5 + 0.3, -2.6, 0] } },
];

const mix3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export function cameraAt(t: number): Pose {
  let cur = KEYS[0].pose;
  let arc = 0;
  for (let i = 1; i < KEYS.length; i++) {
    const k = KEYS[i];
    if (t < k.at) break;
    const lin = clamp01((t - k.at) / k.dur);
    const m = easeSine(lin);
    cur = { p: mix3(cur.p, k.pose.p, m), q: mix3(cur.q, k.pose.q, m) };
    // station travels pull back on the way (lower on-screen speed), then land on the next station
    arc = k.dur >= 3 ? Math.sin(Math.PI * lin) * 12 : 0;
  }
  cur = { p: [cur.p[0], cur.p[1] + arc * 0.25, cur.p[2] + arc], q: cur.q };
  // continuous drift (≈ the cover rig's push-in at t = 0.3 s)
  // cover-rig push-in, plus a slow orbit that fades in after the opening frame (so 0.3 s = cover)
  const o = clamp01((t - 0.6) / 2.5);
  const drift: V3 = [
    -Math.sin(t * 0.05) + o * Math.sin(t * 0.23) * 1.3,
    Math.sin(t * 0.17) * 0.4 + o * Math.sin(t * 0.19 + 1) * 0.5,
    -Math.sin(t * 0.12) - o * (1 - Math.cos(t * 0.31)) * 1.4,
  ];
  return { p: [cur.p[0] + drift[0], cur.p[1] + drift[1], cur.p[2] + drift[2]], q: cur.q };
}

const CameraRig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.p);
    cam.lookAt(...pose.q);
    cam.fov = COVER_CAMERA.fov;
    cam.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

/** Lights + background that travel with the camera (identical to the cover rig at x offset 0). */
const FollowRig: React.FC<{ ox: number; k: number }> = ({ ox, k }) => {
  const keyTarget = useMemo(() => new THREE.Object3D(), []);
  const rimTarget = useMemo(() => new THREE.Object3D(), []);
  return (
    <group position={[ox, 0, 0]}>
      <primitive object={keyTarget} />
      <primitive object={rimTarget} />
      <directionalLight
        position={[14, 22, 20]}
        target={keyTarget}
        intensity={2.6}
        color="#FFF2DE"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-radius={4}
      />
      <ambientLight intensity={0.35 - 0.2 * k} color="#CFE6FF" />
      <hemisphereLight args={["#BFE9FF", "#0A0F18", 0.45 - 0.22 * k]} />
      {/* station rims from behind-side: magenta left, cyan right */}
      <directionalLight position={[-14, 9, -16]} target={keyTarget} intensity={3.4 * k} color="#FF3DCB" />
      <directionalLight position={[15, 7, -15]} target={keyTarget} intensity={3.0 * k} color="#00E5FF" />
      {k > 0.01 ? (
        <>
          <mesh position={[-11, 7, -22]}>
            <planeGeometry args={[34, 34]} />
            <meshBasicMaterial map={glowTexture("rgba(150,30,120,0.8)")} transparent opacity={0.7 * k} depthWrite={false} />
          </mesh>
          <mesh position={[12, -3, -22]}>
            <planeGeometry args={[34, 34]} />
            <meshBasicMaterial map={glowTexture("rgba(0,110,140,0.8)")} transparent opacity={0.7 * k} depthWrite={false} />
          </mesh>
        </>
      ) : null}
      <directionalLight position={[-16, 6, -4]} target={rimTarget} intensity={1.4} color={P.accentNeon} />
      <pointLight position={[0, -3, 6]} intensity={60} distance={30} decay={2} color={P.metricProfit} />
      <pointLight position={[PANEL_POS[0], PANEL_POS[1] - 3, PANEL_POS[2] + 5]} intensity={70} distance={26} decay={2} color={P.accentNeon} />
      <BackWall />
    </group>
  );
};

const STATIONS: { x: number; C: React.FC<{ t: number; f: number }> }[] = [
  { x: SX.s0, C: S0Hook },
  { x: SX.s1, C: S1Context },
  { x: SX.s2a, C: S2aEconomy },
  { x: SX.s2b, C: S2bPercent },
  { x: SX.s2c, C: S2cTrap },
  { x: SX.s3, C: S3Explain },
  { x: SX.s4, C: S4Checks },
  { x: SX.s4b, C: S4bSceneGen },
  { x: SX.s5, C: S5Outro },
];

const World: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const pose = cameraAt(t);
  const ox = pose.q[0] - COVER_CAMERA.target[0];
  return (
    <>
      <CameraRig pose={pose} />
      <fog attach="fog" args={[BG, 62, 110]} />
      <FollowRig ox={ox} k={clamp01((t - (w("l02", "ada") - 0.8)) / 2)} />
      {STATIONS.filter((s) => Math.abs(s.x - pose.q[0]) < 30).map(({ x, C }) => (
        <C key={x} t={t} f={f} />
      ))}
      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} ao />
    </>
  );
};

export const Film: React.FC = () => {
  useDisplayFont();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const headline = 1 - clamp01((t - w("l01", "tapi")) / 0.5);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.5, far: 200 }}
      >
        <World t={t} />
      </ThreeCanvas>
      {/* 1080-wide overlay space, scaled to the render size */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        {headline > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: headline }}>
            <Headline />
          </div>
        ) : null}
        <Captions t={t} />
      </div>
      <AudiraOutro seconds={timeline.total - OUTRO_AT} />
      <AudiraSignature seed="roblox-map-baru-ep05" outroSeconds={timeline.total - OUTRO_AT} />
    </AbsoluteFill>
  );
};
