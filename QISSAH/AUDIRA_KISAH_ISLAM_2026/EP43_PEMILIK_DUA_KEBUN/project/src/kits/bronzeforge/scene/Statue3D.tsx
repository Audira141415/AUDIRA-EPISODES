// The cast statue (lib/sculpture.ts) with the life-cycle bronze shader (lib/bronze.ts).
//
//   <Statue3D heat={h} front={y} patina={p} band={b} position={[0, TOP_Y, 0]} />

import React, { useMemo } from "react";
import { birdGeometry } from "../lib/sculpture.ts";
import { makeBronzeMaterial } from "../lib/bronze.ts";

export const Statue3D: React.FC<{
  heat: number;
  /** Polishing front (local y): polished above, as-cast below. Use a large value for raw, negative for polished. */
  front: number;
  patina: number;
  band?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ heat, front, patina, band = 0, position, rotation, scale = 1 }) => {
  const geo = useMemo(() => birdGeometry(), []);
  const { material, uniforms } = useMemo(() => makeBronzeMaterial({ key: "bird" }), []);
  uniforms.uHeat.value = heat;
  uniforms.uFront.value = front;
  uniforms.uPatina.value = patina;
  uniforms.uBand.value = band;
  return <mesh geometry={geo} material={material} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />;
};
