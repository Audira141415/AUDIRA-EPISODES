// The whole PASIRFORGE set at film time t: beach, sea and sky, the sand sculpture, and the grains.

import React from "react";
import { Beach3D } from "./Beach3D.tsx";
import { Sculpture3D } from "./Sculpture3D.tsx";
import { Grains3D } from "./Grains3D.tsx";
import { sunDir } from "../lib/palette.ts";
import { ceilingAt, erodeAt, heapAt, pileAt, seaLevel, swashFront, wetFront } from "../core/motion.ts";

export const SandMonument3D: React.FC<{ t: number }> = ({ t }) => {
  const sun = sunDir(t);
  return (
    <group>
      <Beach3D t={t} sun={sun} heap={heapAt(t)} pile={pileAt(t)} seaY={seaLevel(t)} swash={swashFront(t)} wetFront={wetFront(t)} />
      <Sculpture3D ceil={ceilingAt(t)} erode={erodeAt(t)} />
      <Grains3D t={t} />
    </group>
  );
};
