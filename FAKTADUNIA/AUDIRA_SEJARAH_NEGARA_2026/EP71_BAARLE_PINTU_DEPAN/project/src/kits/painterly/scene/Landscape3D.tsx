// The whole painted world: sky, clouds, sea, islands, the cliff village and lighthouse, the hill
// with its grass, tree, sign and the traveller, under one low golden sun with cool sky fill.

import React from "react";
import { HAZE, PAINT, SUN_DIR } from "../lib/palette.ts";
import { PaintedSea, PaintedSky } from "./SkySea.tsx";
import { Clouds3D } from "./Clouds3D.tsx";
import { Hill3D } from "./Hill3D.tsx";
import { Tree3D } from "./Tree3D.tsx";
import { Village3D } from "./Village3D.tsx";
import { Sign3D } from "./Sign3D.tsx";
import { Traveller3D } from "./Traveller3D.tsx";

export const PainterlyLights: React.FC = () => {
  const d = 30;
  return (
    <>
      <hemisphereLight args={["#B9C8E8", "#6B5A48", 0.55]} />
      <directionalLight
        position={[SUN_DIR[0] * d, SUN_DIR[1] * d, SUN_DIR[2] * d]}
        intensity={2.2}
        color="#FFE0B5"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
    </>
  );
};

export const Landscape3D: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <fog attach="fog" args={[HAZE.color, HAZE.near, HAZE.far]} />
    <color attach="background" args={[PAINT.bg]} />
    <PainterlyLights />
    <PaintedSky t={t} />
    <Clouds3D t={t} />
    <PaintedSea t={t} />
    <Village3D t={t} />
    <Hill3D t={t} />
    <Tree3D t={t} />
    <Sign3D />
    <Traveller3D t={t} />
  </group>
);
