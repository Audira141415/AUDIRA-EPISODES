// EP02 long-form film (16:9 master) and its two 9:16 shorts, all from the same world and camera track.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { HaramWorld, Sun } from "./World.tsx";
import { cameraAt, type Pose } from "./camera.ts";
import { A } from "./state.ts";
import { TIMELINE, TOTAL, VO_END } from "./tl.ts";
import { Callout, CaptionsShort, CaptionsWide, EndFrames, groupWords, Layer, Outro, PayoffPanel, ShortEndCard, TitleCard } from "./Overlay.tsx";
import S01 from "./short01.json";
import S02 from "./short02.json";

const BG = "#0a0a0c";
export const HARAM_TOTAL = TOTAL;

// 16:9 shows less height than 9:16 showed width (FormatFov), so close shots pull back in wide.
const WIDE_PULL = 1.55;
const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const d = Math.hypot(pose.pos[0] - pose.target[0], pose.pos[1] - pose.target[1], pose.pos[2] - pose.target[2]);
    const k = size.width > size.height ? 1 + (WIDE_PULL - 1) * Math.max(0, Math.min(1, (14 - d) / 8)) : 1;
    c.position.set(pose.target[0] + (pose.pos[0] - pose.target[0]) * k, pose.target[1] + (pose.pos[1] - pose.target[1]) * k, pose.target[2] + (pose.pos[2] - pose.target[2]) * k);
    c.fov = pose.fov;
    c.near = 0.05;
    c.far = 220;
    c.lookAt(pose.target[0], pose.target[1], pose.target[2]);
    c.updateProjectionMatrix();
  });
  return null;
};

const Scene: React.FC<{ t: number; pose: Pose; frame: number }> = ({ t, pose, frame }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 13, 12], fov: 34 }}>
      <Rig pose={pose} />
      <fog attach="fog" args={[BG, 38, 85]} />
      <Sun t={t} />
      <HaramWorld t={t} />
      <Finish frame={frame} background={BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.84} envIntensity={0.3} />
    </ThreeCanvas>
  );
};

const LONG_GROUPS = groupWords(TIMELINE.clips.flatMap((c) => c.words), 64);

export const HaramWide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = cameraAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene t={t} pose={pose} frame={frame} />
      <Layer>
        <TitleCard t={t} />
        <Callout t={t} />
        <PayoffPanel t={t} />
        {t < VO_END + 0.5 && <CaptionsWide t={t} groups={LONG_GROUPS} />}
        <EndFrames t={t} from={VO_END} />
      </Layer>
      <Outro t={t} total={TOTAL} />
      <AudiraSignature seed="sejarah-makkah-ep02" handle="@audira" />
    </AbsoluteFill>
  );
};

// ---------- shorts ----------
type Seg = { kind: "hook" | "vo" | "outro"; srcStart: number; srcEnd: number; start: number; end: number; chapter: string };
type ShortData = { id: string; voEnd: number; total: number; segments: Seg[]; words: { w: string; s: number; e: number }[] };
export const SHORTS: Record<string, ShortData> = { "01": S01 as unknown as ShortData, "02": S02 as unknown as ShortData };

/** Map short time to world time (and whether it is a reused narration span). */
function sourceTime(d: ShortData, n: string, t: number): { src: number; kind: Seg["kind"] } {
  const segs = d.segments;
  let cur = segs[0];
  for (const s of segs) if (t >= s.start) cur = s;
  const dt = t - cur.start;
  if (cur.kind === "hook") return { src: n === "01" ? A.hDulu - 2.6 + dt * 1.6 : A.pasar - 1.0 + dt, kind: "hook" };
  if (cur.kind === "outro") return { src: VO_END + 1.5 + dt * 0.8, kind: "outro" };
  return { src: cur.srcStart + dt, kind: "vo" };
}

export const HaramShort: React.FC<{ n: "01" | "02" }> = ({ n }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = SHORTS[n];
  const t = frame / fps;
  const { src, kind } = sourceTime(d, n, t);
  const pose = cameraAt(src);
  const groups = useMemo(() => groupWords(d.words, 22), [d]);
  const outro = d.segments[d.segments.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene t={src} pose={pose} frame={frame} />
      <Layer>
        {kind === "vo" && <Callout t={src} />}
        {kind === "vo" && <PayoffPanel t={src} />}
        <ShortEndCard t={t} from={outro.start} to={d.voEnd} />
        {t < d.voEnd + 0.3 && <CaptionsShort t={t} groups={groups} />}
      </Layer>
      <Outro t={t} total={d.total} />
      <AudiraSignature seed="sejarah-makkah-ep02" handle="@audira" />
    </AbsoluteFill>
  );
};
export const HaramShort01: React.FC = () => <HaramShort n="01" />;
export const HaramShort02: React.FC = () => <HaramShort n="02" />;
