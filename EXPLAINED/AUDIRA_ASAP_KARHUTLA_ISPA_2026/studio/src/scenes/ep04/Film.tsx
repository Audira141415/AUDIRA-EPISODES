// EP04 film — "425 Ribu Kasus ISPA, 95 Ribu Balita" (ANATOMIX). One hologram imaging suite: the
// cover's toddler lungs, then the projector rebuilds the hologram for each beat (map → columns →
// daily bar → memorial → hair macro → bronchiole dive → adult vs balita lungs → masks → clean room
// → lungs). Every beat is keyed to timeline.json; audio is muxed separately by the lead.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { CUT, OUTRO_AT, T, seg, win } from "./clock";
import { camAt } from "./camera";
import { Suite } from "./Suite";
import { LungsF } from "./LungsF";
import { ChartHolo, MapHolo, Memorial } from "./Holos";
import { HairMacro } from "./Macro";
import { Masks, Room } from "./Protect";
import { Hud } from "./Hud";

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const pose = camAt(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(...pose.tgt);
    cam.fov = pose.fov;
    cam.near = 0.03;
    cam.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

const SWEEPS = [CUT.map, CUT.balita, CUT.chart, CUT.daily, CUT.stack, CUT.why, CUT.compare, CUT.mask, CUT.room, CUT.outro];

export const Ep04Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const X = 0.45; // crossfade
  const inHair = t >= CUT.hairIn && t < CUT.hairOut;

  const lungs = Math.max(win(t, -1, CUT.map + 0.3, X, X), win(t, CUT.balita - 0.2, CUT.chart + 0.25, X, X), win(t, CUT.why - 0.2, CUT.hairIn, X, 0.01), win(t, CUT.hairOut, CUT.compare + 0.25, 0.01, X), win(t, CUT.outro - 0.2, 999, X, X));
  const mapF = win(t, CUT.map - 0.1, CUT.balita + 0.2, X, X);
  const cum = Math.max(win(t, CUT.chart - 0.1, CUT.daily + 0.25, X, X), win(t, CUT.stack - 0.1, CUT.memorial + 0.25, X, X));
  const daily = win(t, CUT.daily - 0.1, CUT.stack + 0.25, X, X);
  const mem = win(t, CUT.memorial - 0.1, CUT.why + 0.3, 0.7, 0.6);
  const dim = win(t, CUT.memorial - 0.2, CUT.why + 0.3, 0.8, 0.7);
  const cmp = win(t, CUT.compare - 0.1, CUT.mask + 0.25, X, X);
  const maskF = win(t, CUT.mask - 0.1, CUT.room + 0.25, X, X);
  const maskDim = seg(t, T.balitaY - 0.2, T.balitaY + 0.4);
  const roomF = win(t, CUT.room - 0.1, CUT.outro + 0.25, X, X);
  const warn = seg(t, T.bila - 0.2, T.bila + 0.8) * (1 - seg(t, CUT.outro - 0.2, CUT.outro + 0.3));
  // dive: PM2.5 floods in; the lungs breathe slowly everywhere except the balita model
  const light = 1 - 0.75 * dim;

  return (
    <AbsoluteFill style={{ background: P.void }}>
      {t < OUTRO_AT + 0.7 && (
        <ThreeCanvas width={width} height={height} camera={{ fov: 34, near: 0.03, far: 80, position: [0, 0.75, 7.1] }}>
          <Rig t={t} />
          <color attach="background" args={[P.void]} />
          <ambientLight intensity={0.35 * light} color="#CFF7F2" />
          <directionalLight position={[3, 5, 5]} intensity={1.6 * light} color="#FFF3EE" />
          <directionalLight position={[-4, 2, -3]} intensity={1.2 * light} color={P.holo} />
          <pointLight position={[0, 2.2, 0.8]} intensity={2.5 * light} distance={4} color="#FF8A3D" />
          {inHair && <directionalLight position={[-2, 3, 4]} intensity={1.4} color="#FFE9D6" />}
          <Suite t={t} on={inHair ? 0 : 1} dim={dim} sweeps={SWEEPS} warn={warn} />
          {!inHair && (
            <>
              <LungsF t={t} fade={lungs} flowMul={t > CUT.hairOut && t < CUT.compare + 0.3 ? 2.2 : 1} />
              <MapHolo t={t} fade={mapF} />
              <ChartHolo t={t} cum={cum} daily={daily} />
              <Memorial t={t} fade={mem} />
              {cmp > 0.005 && (
                <>
                  <group position={[-0.62, -0.352, 0]} scale={0.85}>
                    <LungsF t={t} fade={cmp} breathHz={0.26} breathAmp={0.035} flowMul={0.7} band={false} haze={false} bokeh={false} dust={0.35} />
                  </group>
                  <group position={[0.92, -0.619, 0]} scale={0.5}>
                    <LungsF t={t} fade={cmp} breathHz={0.6} breathAmp={0.05} flowMul={2.2} band={false} haze={false} bokeh={false} dust={1} />
                  </group>
                </>
              )}
              <Masks t={t} fade={maskF} dim={maskDim} />
              <Room t={t} fade={roomF} warn={warn} />
            </>
          )}
          {inHair && <HairMacro t={t} fade={1} />}
          <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
        </ThreeCanvas>
      )}
      <Hud t={t} width={width} height={height} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
