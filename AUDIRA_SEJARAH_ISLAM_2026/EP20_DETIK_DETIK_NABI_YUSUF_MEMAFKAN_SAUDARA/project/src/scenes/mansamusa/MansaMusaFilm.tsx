// EP04 Mansa Musa: Emas di Kairo (HD2D). One continuous diorama world driven by the voice clock:
// hook at the Cairo market balance (the approved cover) → the West Africa map table (context) →
// Giza camp, the Nile and the Cairo palace (main) → back to the balance, the chronicler's desk and
// the price slate (explanation) → the empty chest, the lender's counter and the Catalan Atlas
// vellum (payoff) → rise off the map into the AUDIRA outro card.

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { CairoMarket, MM } from "./CairoMarket.tsx";
import { GizaZone } from "./GizaZone.tsx";
import { MapTable } from "./MapTable.tsx";
import { FilmOverlay } from "./Overlay.tsx";
import { rig, camAt } from "./camera.ts";
import { COVER } from "./framing.ts";
import { TOTAL, W } from "./time.ts";

export const MANSAMUSA_COVER_SECONDS = 4;
export const MANSAMUSA_TOTAL = TOTAL;

// Display + pixel + caption faces (bundled TTFs, see public/fonts/licenses).
const FACES: [string, string, FontFaceDescriptors?][] = [
  ["MM Anton", "fonts/Anton-Regular.ttf"],
  ["MM Pixel", "fonts/Silkscreen-Bold.ttf"],
  ["MM Grotesk", "fonts/SpaceGrotesk-Variable.ttf", { weight: "300 700" }],
];
if (typeof document !== "undefined") {
  const h = delayRender("MansaMusa fonts");
  Promise.all(
    FACES.map(async ([fam, file, desc]) => {
      const face = new FontFace(fam, `url(${staticFile(file)})`, desc);
      await face.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(face);
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}

/** Hook framing = the approved cover (style/cover.json). */
export const COVER_FRAMING = COVER;


export const MansaMusaScene: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const keys = useMemo(() => rig(fps), [fps]);
  const cam = camAt(keys, frame, fps);
  const t = frame / fps;
  const f = t * 60;
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  // after the cover frame: stronger warm key, less flat env fill (chiaroscuro), eased in so nothing pops
  const lightK = Math.max(0, Math.min(1, (t - 1) / 1.5));
  const lightTarget = useMemo(() => new THREE.Object3D(), []);
  // the empty-chest beat keeps the lane sharp (FG, chest and gate read as separate planes)
  const payoffChest = t > W("tapi") && t < W("raja");
  // shadow frustum follows the subject; at t=0 it sits exactly where the cover had it (origin)
  const lt: [number, number, number] = t < 3.5 ? [0, 0, 0] : [cam.target[0], 0, cam.target[2]];
  return (
    <AbsoluteFill style={{ background: MM.skyTop }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.05, far: 160 }}>
        <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />
        <hemisphereLight args={["#3E4F8C", "#2A1A0E", 0.2]} />
        <primitive object={lightTarget} position={lt} />
        <directionalLight
          position={[lt[0] + 3.5, 6, lt[2] + 4.5]}
          target={lightTarget}
          intensity={0.55 + 0.35 * lightK}
          color="#FFC98A"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-3, 5, -7]} intensity={1.3} color="#8FA6FF" />
        <CairoMarket f={f} />
        <MapTable t={t} f={f} cam={cam.pos} />
        <GizaZone t={t} f={f} />
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55 - 0.13 * lightK} hdri="warmStudio" focus={focus} aperture={t < 1 ? 0.011 : payoffChest ? 0.004 : 0.011 + 0.012 * Math.max(0, Math.min(1, (3.6 - focus) / 1.4))} maxBlur={t < 1 ? 0.012 : payoffChest ? 0.006 : 0.016} />
      </ThreeCanvas>
      <FilmOverlay t={t} cam={cam} cover={cover} />
      {!cover && <Audio src={staticFile("audio/vo.wav")} />}
      {!cover && (
        // kept clear of the cover title: appears once the hook title has cleared
        <AbsoluteFill style={{ opacity: Math.min(1, Math.max(0, (t - 1.7) / 0.5)) }}>
          <AudiraSignature seed="sejarah-islam-ep04" handle="@AUDIRAQISSAH" outroSeconds={3.4} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Preview / Final: the full film on the voice. */
export const MansaMusaFilm: React.FC = () => <MansaMusaScene />;
/** Cover: the first frame of the film with the thumbnail title held. */
export const MansaMusaCoverFrame: React.FC = () => <MansaMusaScene cover />;
