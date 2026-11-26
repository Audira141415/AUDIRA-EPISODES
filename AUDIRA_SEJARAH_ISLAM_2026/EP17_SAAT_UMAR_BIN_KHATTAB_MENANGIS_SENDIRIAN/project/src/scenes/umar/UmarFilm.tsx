// EP17 Saat Umar bin Khattab Menangis di Depan Periuk (HD2D). Multi-scene director on the voice
// clock: war map (hook) → the pot on a small fire → Madinah at night → the Harrah lava road →
// the camp of the hungry family → the flour store → cooking at the camp → the Ramadah famine →
// the last room and the balance of gold → the dawn mosque rows → back to the pot → outro card.
// One set is mounted per segment (camera.ts SETS); every cut sits in a VO breath under a veil.

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { MapSet, CampSet, MadinahSet, HarrahSet } from "./SetsNight.tsx";
import { StoreSet, RamadahSet, RoomSet, MosqueSet } from "./SetsDay.tsx";
import { FilmOverlay } from "./Overlay.tsx";
import { rig, camAt, setAt, CUTS, type SetId } from "./camera.ts";
import { TOTAL, OUTRO_AT } from "./time.ts";

export const UMAR_COVER_SECONDS = 4;
export const UMAR_TOTAL = TOTAL;

const FACES: [string, string, FontFaceDescriptors?][] = [
  ["MM Anton", "fonts/Anton-Regular.ttf"],
  ["MM Pixel", "fonts/Silkscreen-Bold.ttf"],
  ["MM Grotesk", "fonts/SpaceGrotesk-Variable.ttf", { weight: "300 700" }],
];
if (typeof document !== "undefined") {
  const h = delayRender("Umar fonts");
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
  map: { key: 0.55, rim: 0.7, hemi: 0.25, env: 0.45 },
  camp: { key: 0.25, rim: 0.9, hemi: 0.22, env: 0.4 },
  madinah: { key: 0.3, rim: 1.0, hemi: 0.3, env: 0.4 },
  harrah: { key: 0.2, rim: 1.3, hemi: 0.55, env: 0.4 },
  store: { key: 0.45, rim: 0.6, hemi: 0.22, env: 0.45 },
  ramadah: { key: 1.4, rim: 0.6, hemi: 1.1, env: 0.6 },
  room: { key: 0.25, rim: 0.5, hemi: 0.15, env: 0.4 },
  mosque: { key: 0.7, rim: 0.7, hemi: 0.45, env: 0.5 },
};

const SET_COMPONENT: Record<SetId, React.FC<{ t: number; f: number }>> = {
  map: MapSet,
  camp: CampSet,
  madinah: MadinahSet,
  harrah: HarrahSet,
  store: StoreSet,
  ramadah: RamadahSet,
  room: RoomSet,
  mosque: MosqueSet,
};

export const UmarScene: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const keys = useMemo(() => rig(fps), [fps]);
  // the cover is the hook frame of the pot (first key of the camp segment)
  const t = cover ? CUTS[0] + 0.02 : frame / fps;
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
    <AbsoluteFill style={{ background: "#0A0F24" }}>
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
          <AudiraSignature seed="sejarah-islam-ep17" handle="@AUDIRAQISSAH" outroSeconds={TOTAL - OUTRO_AT + 0.1} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const UmarFilm: React.FC = () => <UmarScene />;
export const UmarCoverFrame: React.FC = () => <UmarScene cover />;
