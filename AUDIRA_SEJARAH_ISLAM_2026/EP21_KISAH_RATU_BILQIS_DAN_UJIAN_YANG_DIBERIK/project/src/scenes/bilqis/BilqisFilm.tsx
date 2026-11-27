// EP21 Kisah Ratu Bilqis dan Ujian yang Diberikan (HD2D). Multi-scene director on the voice clock:
// glass floor over water (hook) -> Saba -> Sulaiman's camp (the birds) -> sun temple at dusk -> council
// hall (the letter) -> desert road (gift refused, the throne) -> marble hall (disguised throne) -> long
// glass corridor -> dawn hill (payoff) -> outro card. One set per segment; cuts sit in VO breaths.

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { GlassHookSet, MajelisSet, HallSet, GlassWideSet } from "./SetsHall.tsx";
import { SabaSet, CampSet, TempleSet, DesertSet, HillSet } from "./SetsOut.tsx";
import { FilmOverlay } from "./Overlay.tsx";
import { rig, camAt, setAt, type SetId } from "./camera.ts";
import { TOTAL, OUTRO_AT } from "./time.ts";

export const BILQIS_COVER_SECONDS = 4;
export const BILQIS_TOTAL = TOTAL;

const FACES: [string, string, FontFaceDescriptors?][] = [
  ["MM Anton", "fonts/Anton-Regular.ttf"],
  ["MM Pixel", "fonts/Silkscreen-Bold.ttf"],
  ["MM Grotesk", "fonts/SpaceGrotesk-Variable.ttf", { weight: "300 700" }],
];
if (typeof document !== "undefined") {
  const h = delayRender("Bilqis fonts");
  Promise.all(
    FACES.map(async ([fam, file, desc]) => {
      const face = new FontFace(fam, `url(${staticFile(file)})`, desc);
      await face.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(face);
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}

// Per-set light: a low warm key (#FFC98A), a cool rim (#8FA6FF) and a dim hemisphere fill.
const LIGHT: Record<SetId, { key: number; rim: number; hemi: number; env: number }> = {
  glassHook: { key: 0.35, rim: 0.9, hemi: 0.3, env: 0.5 },
  saba: { key: 1.3, rim: 0.5, hemi: 0.85, env: 0.6 },
  camp: { key: 1.2, rim: 0.5, hemi: 0.8, env: 0.6 },
  temple: { key: 0.8, rim: 0.8, hemi: 0.5, env: 0.5 },
  majelis: { key: 0.3, rim: 0.9, hemi: 0.25, env: 0.4 },
  desert: { key: 1.3, rim: 0.5, hemi: 0.8, env: 0.6 },
  hall: { key: 1.0, rim: 0.6, hemi: 0.6, env: 0.55 },
  glassWide: { key: 0.45, rim: 0.9, hemi: 0.35, env: 0.5 },
  hill: { key: 1.0, rim: 0.7, hemi: 0.7, env: 0.55 },
};

const SET_COMPONENT: Record<SetId, React.FC<{ t: number; f: number }>> = {
  glassHook: GlassHookSet,
  saba: SabaSet,
  camp: CampSet,
  temple: TempleSet,
  majelis: MajelisSet,
  desert: DesertSet,
  hall: HallSet,
  glassWide: GlassWideSet,
  hill: HillSet,
};

export const BilqisScene: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const keys = useMemo(() => rig(fps), [fps]);
  // the cover is the hook frame: low over the glass floor and the water toward the queen (COVER pose)
  const t = cover ? 0.02 : frame / fps;
  const vframe = Math.round(t * fps);
  const cam = camAt(keys, vframe, fps);
  const f = t * 60;
  const set = setAt(t);
  const L = LIGHT[set];
  const SetC = SET_COMPONENT[set];
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  const lightTarget = useMemo(() => new THREE.Object3D(), []);
  const tilt = 0.016 + 0.01 * Math.max(0, Math.min(1, (3.0 - focus) / 1.6));
  return (
    // brightness 0.975 = highlight ceiling (255 -> 248): sparkles and the outro white stay under clipHi 0 (rule 12 §5)
    <AbsoluteFill style={{ background: "#0A0F24", filter: "brightness(0.975)" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.03, far: 140 }}>
        <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />
        <hemisphereLight args={["#3E4F8C", "#2A1A0E", L.hemi]} />
        <primitive object={lightTarget} position={[cam.target[0], 0, cam.target[2]]} />
        <directionalLight
          position={[cam.target[0] + 3.5, 6, cam.target[2] + 4.5]}
          target={lightTarget}
          intensity={L.key}
          color="#FFC98A"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-3, 5, -7]} intensity={L.rim} color="#8FA6FF" />
        {/* cool moonlight fill from the camera side: the sprites are seen from behind, away from the fire */}
        <pointLight position={[cam.pos[0], cam.pos[1] + 0.6, cam.pos[2]]} color="#AEB8E8" intensity={0.9} distance={8} decay={1.2} />
        <SetC key={set} t={t} f={f} />
        <Finish frame={vframe} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={L.env} hdri="warmStudio" focus={focus} aperture={tilt} maxBlur={0.03} />
      </ThreeCanvas>
      <FilmOverlay t={t} cam={cam} cover={cover} />
      {!cover && <AudiraOutro seconds={TOTAL - OUTRO_AT} code="QISSAH" />}
      {!cover && <Audio src={staticFile("audio/vo.wav")} />}
      {!cover && (
        <AbsoluteFill style={{ opacity: Math.min(1, Math.max(0, (t - 1.7) / 0.5)) }}>
          <AudiraSignature seed="ratu-bilqis-ujian" handle="@AUDIRAQISSAH" outroSeconds={TOTAL - OUTRO_AT + 0.1} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const BilqisFilm: React.FC = () => <BilqisScene />;
export const BilqisCoverFrame: React.FC = () => <BilqisScene cover />;
