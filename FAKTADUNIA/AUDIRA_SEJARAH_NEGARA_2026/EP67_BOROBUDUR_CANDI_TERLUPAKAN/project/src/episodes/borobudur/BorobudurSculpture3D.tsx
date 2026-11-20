// Borobudur sand sculpture — variant of Sculpture3D using BPARTS + BNAME_RECT.

import React, { useMemo } from "react";
import * as THREE from "three";
import { buildPart, shapePart } from "../../kits/pasirforge/lib/sculpture.ts";
import { sculptMaterial, sculptShared } from "../../kits/pasirforge/lib/sandMaterial.ts";
import { BPARTS } from "./BorobudurParts.ts";

export const BorobudurSculpture3D: React.FC<{
  ceil: { y: number; amp: number };
  erode: number;
}> = ({ ceil, erode }) => {
  const parts = useMemo(
    () =>
      BPARTS.map((p) => {
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

  const visible = useMemo(() => parts.map((pm) => shapePart(pm, ceil, erode)), [parts, ceil.y, ceil.amp, erode]);

  return (
    <group>
      {parts.map((pm, i) => (
        <mesh key={pm.part.name} geometry={pm.geo} material={mats[i]} visible={visible[i]} castShadow receiveShadow />
      ))}
    </group>
  );
};
