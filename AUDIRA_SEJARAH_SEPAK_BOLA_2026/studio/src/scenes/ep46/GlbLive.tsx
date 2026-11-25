// Catalog GLB for EP46, like ../_shared/Glb.tsx but it re-renders the R3F frame once the model is
// in the scene. While rendering, <ThreeCanvas> uses frameloop "never" and only advances on a
// Remotion frame change, so a model that arrives after the first advance never reaches the still.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";

type V3 = [number, number, number];
const cache = new Map<string, Promise<THREE.Group>>();
const load = (id: string) => {
  if (!cache.has(id)) cache.set(id, new GLTFLoader().loadAsync(staticFile(`glb/${id}.glb`)).then((g) => g.scene));
  return cache.get(id)!;
};

export const GlbLive: React.FC<{ id: string; position?: V3; rotation?: V3; height: number }> = ({ id, position = [0, 0, 0], rotation = [0, 0, 0], height }) => {
  const { advance } = useThree();
  const [handle] = useState(() => delayRender(`glb ${id}`));
  const [src, setSrc] = useState<THREE.Group | null>(null);
  useEffect(() => {
    load(id)
      .then(setSrc)
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [id, handle]);
  const obj = useMemo(() => {
    if (!src) return null;
    const o = src.clone(true);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) m.castShadow = m.receiveShadow = true;
    });
    const box = new THREE.Box3().setFromObject(o);
    const k = height / Math.max(1e-6, box.getSize(new THREE.Vector3()).y);
    o.scale.setScalar(k);
    const c = box.getCenter(new THREE.Vector3());
    o.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    const g = new THREE.Group();
    g.add(o);
    return g;
  }, [src, height]);
  useEffect(() => {
    if (!obj) return;
    advance(performance.now());
    continueRender(handle);
  }, [obj, advance, handle]);
  return obj ? <primitive object={obj} position={position} rotation={rotation} /> : null;
};
