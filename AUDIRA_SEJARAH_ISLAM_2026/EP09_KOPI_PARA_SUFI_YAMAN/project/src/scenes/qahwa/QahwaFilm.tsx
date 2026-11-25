// EP09 Qahwa (sejarah-islam-EP09, FOODFORGE): coffee of the Yemeni Sufis. One walnut tabletop world on
// the locked voice (timeline.json). The cover is frame 0.3 s of this film, so the thumbnail and the
// opening are the same picture. Brand: AUDIRA crate in the Java beat, <AudiraOutro>, <AudiraSignature>.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import type { Shot } from "../../core/render/Post.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { QahwaSet, QP } from "./QahwaSet.tsx";
import { CouncilStation, JavaStation, MapStation, StationLights, TubrukGlass, WordStation, ZawiyahStation } from "./Stations.tsx";
import { QahwaCoverText } from "./Overlay.tsx";
import { QahwaHud } from "./Hud.tsx";
import { shotAt } from "./camera.ts";
import { OUTRO_AT, TOTAL, ramp } from "./time.ts";

export const QAHWA_COVER_SECONDS = 3;
export const QAHWA_TOTAL = TOTAL;
const OUTRO_SECONDS = TOTAL - OUTRO_AT;

const CameraRig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...shot.pos);
    c.fov = shot.fov;
    c.near = 0.03;
    c.far = 30;
    c.lookAt(...shot.target);
    c.rotateZ(shot.roll ?? 0);
    c.updateProjectionMatrix();
  });
  return null;
};

const World: React.FC<{ withBrand?: boolean }> = ({ withBrand = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot = shotAt(t);
  const titleOpacity = 1 - ramp(t, 3.9, 4.5);
  const showWorld = t < OUTRO_AT + 0.7;
  return (
    <AbsoluteFill style={{ background: QP.backdrop }}>
      {showWorld ? (
        <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ position: shot.pos, fov: shot.fov, near: 0.03, far: 30 }}>
          <CameraRig shot={shot} />
          <QahwaSet t={t} />
          <StationLights t={t} />
          <MapStation t={t} />
          <ZawiyahStation t={t} />
          <CouncilStation t={t} />
          <WordStation t={t} />
          <JavaStation t={t} />
          <TubrukGlass t={t} />
          <Finish frame={frame} background={QP.backdrop} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.9} envIntensity={0.45} hdri="warmStudio" ao aoRadius={0.08} />
        </ThreeCanvas>
      ) : null}
      {titleOpacity > 0.001 ? <QahwaCoverText opacity={titleOpacity} /> : null}
      <QahwaHud />
      {withBrand ? (
        <>
          <AudiraOutro seconds={OUTRO_SECONDS} />
          {/* starts after the cover title so it never sits on the kicker/title */}
          <Sequence from={Math.round(4.5 * fps)} layout="none">
            <AudiraSignature seed="sejarah-islam-ep09" outroSeconds={OUTRO_SECONDS} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const QahwaCoverFrame: React.FC = () => <World />;
export const QahwaFilm: React.FC = () => <World withBrand />;
