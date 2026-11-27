// EP20 Detik-detik Nabi Yusuf Memaafkan Saudara (HD2D). Multi-scene director on the voice clock:
// the palace hall at night (hook) -> the gate of Egypt -> the Kanaan rooftop (the dream) -> the grain
// store -> the hall at midday (the reveal) -> the low floor (forgiveness) -> the desert road (the
// shirt) -> the tafsir desk (why he waited) -> the dawn hill (payoff) -> outro card.
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
import { HallNightSet, HallDaySet, HallLowSet, StoreSet } from "./SetsHall.tsx";
import { GateSet, RoofSet, RoadSet, BookSet, HillSet } from "./SetsOut.tsx";
import { FilmOverlay } from "./Overlay.tsx";
import { rig, camAt, setAt, CUTS, type SetId } from "./camera.ts";
import { TOTAL, OUTRO_AT } from "./time.ts";

export const YUSUF_COVER_SECONDS = 4;
export const YUSUF_TOTAL = TOTAL;

const FACES: [string, string, FontFaceDescriptors?][] = [
  ["MM Anton", "fonts/Anton-Regular.ttf"],
  ["MM Pixel", "fonts/Silkscreen-Bold.ttf"],
  ["MM Grotesk", "fonts/SpaceGrotesk-Variable.ttf", { weight: "300 700" }],
];
if (typeof document !== "undefined") {
  const h = delayRender("Yusuf fonts");
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
  hallNight: { key: 0.3, rim: 0.9, hemi: 0.2, env: 0.4 },
  gate: { key: 1.3, rim: 0.5, hemi: 0.8, env: 0.6 },
  roof: { key: 0.15, rim: 1.1, hemi: 0.3, env: 0.35 },
  store: { key: 0.6, rim: 0.6, hemi: 0.3, env: 0.5 },
  hallDay: { key: 1.1, rim: 0.5, hemi: 0.7, env: 0.55 },
  hallLow: { key: 0.35, rim: 0.7, hemi: 0.25, env: 0.4 },
  road: { key: 1.2, rim: 0.6, hemi: 0.6, env: 0.5 },
  book: { key: 0.2, rim: 0.5, hemi: 0.15, env: 0.4 },
  hill: { key: 1.0, rim: 0.7, hemi: 0.7, env: 0.55 },
};

const [C1, C2, , , , C6, C7, C8] = CUTS;
const SET_COMPONENT: Record<SetId, React.FC<{ t: number; f: number }>> = {
  hallNight: HallNightSet,
  gate: (p) => <GateSet {...p} c0={C1} c1={C2} />,
  roof: RoofSet,
  store: StoreSet,
  hallDay: HallDaySet,
  hallLow: HallLowSet,
  road: (p) => <RoadSet {...p} c0={C6} c1={C7} />,
  book: BookSet,
  hill: (p) => <HillSet {...p} c0={C8} />,
};

export const YusufScene: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const keys = useMemo(() => rig(fps), [fps]);
  // the cover is the hook frame: behind the throne, over Yusuf's shoulder to the eleven (COVER pose)
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
          <AudiraSignature seed="sejarah-islam-ep20" handle="@AUDIRAQISSAH" outroSeconds={TOTAL - OUTRO_AT + 0.1} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const YusufFilm: React.FC = () => <YusufScene />;
export const YusufCoverFrame: React.FC = () => <YusufScene cover />;
