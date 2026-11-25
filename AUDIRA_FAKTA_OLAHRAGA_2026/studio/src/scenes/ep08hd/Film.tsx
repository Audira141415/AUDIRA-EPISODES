// EP08 film "Owi/Butet, Kado Emas 17 Agustus" (HD2D). Same VO, cuts, HUD and captions as the PIXELSTORY cut (../ep08),
// but every beat is a lit 3D diorama with pixel-sprite slabs (sets.tsx). Camera 60 fps, sprites step at 8 fps.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Exposure } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { CeremonyHud, HookHud, MatchHud, NetHud, NightHud, PodiumHud, RoomHud, SideHud } from "../ep08/Film.tsx";
import { Captions, Wipe } from "../ep08/hud.tsx";
import { MATCH_POINT, SMASH, sceneAt, win, type SceneId } from "../ep08/timing.ts";
import { fireworks, SCENES } from "./sets.tsx";

const HUD: Record<SceneId, React.FC<{ t: number }>> = { A: HookHud, B: RoomHud, C: SideHud, C2: CeremonyHud, D: NetHud, E1: MatchHud, E2: PodiumHud, OUT: NightHud };

/** The 3D picture only (Cover reuses it). */
export const Stage: React.FC<{ t: number }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sc = sceneAt(t);
  const S = SCENES[sc];
  const cam = S.cam(t);
  const focus = Math.hypot(cam.p[0] - cam.tg[0], cam.p[1] - cam.tg[1], cam.p[2] - cam.tg[2]);
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.p, fov: 34, near: 0.1, far: 80 }}>
      <PoseCamera position={cam.p} target={cam.tg} fov={34} />
      <fog attach="fog" args={[S.bg, S.fog[0], S.fog[1]]} />
      <S.Set t={t} cam={cam} />
      <Finish frame={frame} background={S.bg} profile={{ ...COLOR_PROFILES.DOCUMENTARY_WARM, vignette: 0.55 }} hdri="studio" exposure={1} envIntensity={0.55} ao focus={focus} aperture={0.006} maxBlur={0.03} />
    </ThreeCanvas>
  );
};

export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const sc = sceneAt(t);
  const Hud = HUD[sc];
  const flash = 0.25 * win(t, SMASH, SMASH + 0.2, 0.02, 0.15) + 0.3 * win(t, MATCH_POINT, MATCH_POINT + 0.24, 0.02, 0.2) + (sc === "OUT" ? 0.04 * fireworks(t) : 0);
  return (
    <AbsoluteFill style={{ background: "#0A0D14", overflow: "hidden" }}>
      <Stage t={t} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <Exposure color="#FFF4DC" amount={flash} blend="screen" />
        <Hud t={t} />
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
