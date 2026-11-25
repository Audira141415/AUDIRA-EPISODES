// The sand sculpture: every part is real, CPU-shaped geometry (so shadows and ambient occlusion see
// the true form), shaded by the carved-sand material. `ceil` sweeps up to form it and sinks with a
// ragged front to crumble it; `erode` rounds and sags the carved edges.
//
//   <Sculpture3D ceil={ceilingAt(t)} erode={erodeAt(t)} />

import React, { useMemo } from "react";
import * as THREE from "three";
import { PARTS, buildPart, shapePart } from "../lib/sculpture.ts";
import { sculptMaterial, sculptShared } from "../lib/sandMaterial.ts";

export const Sculpture3D: React.FC<{ ceil: { y: number; amp: number }; erode: number }> = ({ ceil, erode }) => {
  const parts = useMemo(
    () =>
      PARTS.map((p) => {
        const pm = buildPart(p);
        pm.geo.setAttribute("aOrig", new THREE.BufferAttribute(pm.orig.slice(), 3));
        pm.geo.setAttribute("aCeilN", new THREE.BufferAttribute(pm.ceilN, 1));
        return pm;
      }),
    [],
  );
  const shared = useMemo(() => sculptShared(), []);
  const mats = useMemo(() => parts.map((pm) => sculptMaterial(pm.part, shared)), [parts, shared]);
  shared.uCeil.value = ceil.y;
  shared.uCeilAmp.value = ceil.amp;
  shared.uErode.value = erode;
  // Shape this frame (pure function of ceil/erode; geometry is rewritten in place).
  const visible = useMemo(() => parts.map((pm) => shapePart(pm, ceil, erode)), [parts, ceil.y, ceil.amp, erode]);
  return (
    <group>
      {parts.map((pm, i) => (
        <mesh key={pm.part.name} geometry={pm.geo} material={mats[i]} visible={visible[i]} castShadow receiveShadow />
      ))}
    </group>
  );
};
