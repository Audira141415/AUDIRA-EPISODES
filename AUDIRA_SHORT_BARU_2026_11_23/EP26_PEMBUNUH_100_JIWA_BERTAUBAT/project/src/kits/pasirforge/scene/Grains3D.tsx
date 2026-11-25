// Instanced sand grains: thousands of tiny faceted stones in sand tones (with a few dark mineral and
// pale shell grains), placed every frame from the closed-form motion in core/grains.ts.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FX_LAYER } from "../../../core/render/Post.tsx";
import { SAND } from "../lib/palette.ts";
import { fallAt, makePour, makeTrickle, makeVeil, pourAt, veilAt } from "../core/grains.ts";
import type { V3 } from "../lib/noise.ts";

const TONES = [SAND.dryLight, SAND.dry, SAND.packed, SAND.dryDark, SAND.dry, SAND.dryLight];
const toneOf = (c: number) => (c < 0.05 ? SAND.mineral : c > 0.97 ? SAND.shell : TONES[Math.floor(c * 997) % TONES.length]);

function useInstances<T>(
  items: T[],
  t: number,
  at: (g: T, t: number) => { p: V3; s: number },
  tint: boolean,
) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m || !tint) return;
    const col = new THREE.Color();
    items.forEach((g, i) => m.setColorAt(i, col.set(toneOf((g as { c?: number }).c ?? 0.5))));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items, tint]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (const g of items) {
      const s = at(g, t);
      if (s.s <= 0) {
        o.position.set(0, -50, 0);
        o.scale.setScalar(1e-5);
      } else {
        o.position.set(...s.p);
        // Each grain keeps its own orientation (seeded from its index) and tumbles while airborne.
        o.rotation.set(i * 1.7 + t * 3, i * 2.3, i * 0.9 + t * 2);
        o.scale.set(s.s, s.s * 0.8, s.s * 0.9);
      }
      o.updateMatrix();
      m.setMatrixAt(i++, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items, t, at]);
  return ref;
}

export const Grains3D: React.FC<{ t: number }> = ({ t }) => {
  const pour = useMemo(() => makePour(), []);
  const trickle = useMemo(() => makeTrickle(), []);
  const veil = useMemo(() => makeVeil(), []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8, metalness: 0, flatShading: true }), []);
  const veilGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const veilMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#FFE2BC", transparent: true, opacity: 0.38, depthWrite: false }), []);
  const pourRef = useInstances(pour, t, pourAt, true);
  const fallRef = useInstances(trickle, t, fallAt, true);
  const veilRef = useInstances(veil, t, veilAt, false);
  return (
    <group>
      <instancedMesh ref={pourRef} args={[geo, mat, pour.length]} castShadow frustumCulled={false} />
      <instancedMesh ref={fallRef} args={[geo, mat, trickle.length]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={veilRef} args={[veilGeo, veilMat, veil.length]} layers={FX_LAYER} frustumCulled={false} />
    </group>
  );
};
