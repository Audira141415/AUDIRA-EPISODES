// Stepped granite plinth with a cast bronze plaque on its front: AUDIRA in raised letters inside a
// beaded border. The plaque ages with the statue (patina gathers around the letters, their faces
// stay rubbed bright).
//
//   <Plinth3D patina={p} />   // stands on y = 0, top at TOP_Y

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { PLINTH } from "../core/motion.ts";
import { makeBronzeMaterial } from "../lib/bronze.ts";
import { granite, plaqueRelief } from "../lib/textures.ts";

export const PLAQUE = { w: 0.64, h: 0.24, depth: 0.012 };

export const Plinth3D: React.FC<{ patina: number }> = ({ patina }) => {
  const g = granite();
  const relief = plaqueRelief();
  const plaque = useMemo(
    () => makeBronzeMaterial({ relief: relief.tex, size: [PLAQUE.w, PLAQUE.h], depth: PLAQUE.depth, texel: [1 / relief.w, 1 / relief.h], key: "plaque" }),
    [relief],
  );
  const plate = useMemo(() => makeBronzeMaterial({ key: "plate" }), []);
  const plane = useMemo(() => new THREE.PlaneGeometry(PLAQUE.w, PLAQUE.h, 512, 192), []);
  const plateGeo = useMemo(() => {
    const b = new THREE.BoxGeometry(PLAQUE.w + 0.02, PLAQUE.h + 0.02, 0.012);
    const n = b.getAttribute("position").count;
    b.setAttribute("aCav", new THREE.BufferAttribute(new Float32Array(n).fill(0.1), 1));
    b.setAttribute("aConv", new THREE.BufferAttribute(new Float32Array(n).fill(0.6), 1));
    b.setAttribute("aThick", new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
    return b;
  }, []);
  for (const m of [plaque, plate]) {
    m.uniforms.uPatina.value = patina * 0.9;
    m.uniforms.uFront.value = -10;
  }
  const { w, d, h, base, cap } = PLINTH;
  const stone = { map: g.map, roughnessMap: g.rough, roughness: 0.75, metalness: 0, color: "#c9c3bd" };
  return (
    <group>
      <mesh position={[0, base / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w + 0.14, base, d + 0.14]} radius={0.012} />
        <meshPhysicalMaterial {...stone} />
      </mesh>
      <mesh position={[0, base + h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.01} />
        <meshPhysicalMaterial {...stone} />
      </mesh>
      <mesh position={[0, base + h + cap / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w + 0.06, cap, d + 0.06]} radius={0.01} />
        <meshPhysicalMaterial {...stone} clearcoat={0.3} clearcoatRoughness={0.3} />
      </mesh>
      <group position={[0, base + h * 0.6, d / 2 + 0.007]}>
        <mesh geometry={plateGeo} material={plate.material} castShadow receiveShadow />
        <mesh geometry={plane} material={plaque.material} position={[0, 0, 0.0065]} receiveShadow />
      </group>
    </group>
  );
};
