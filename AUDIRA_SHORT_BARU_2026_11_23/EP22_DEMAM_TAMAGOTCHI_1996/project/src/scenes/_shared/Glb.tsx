// Catalog GLB (E:/ASET/ASSET-AUDIRA/downloads/glb, copied to public/glb/<id>.glb), held by delayRender until parsed.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { continueRender, delayRender, staticFile } from "remotion";

type V3 = [number, number, number];
const cache = new Map<string, Promise<THREE.Group>>();

const load = (id: string) => {
  if (!cache.has(id)) {
    cache.set(id, new GLTFLoader().loadAsync(staticFile(`glb/${id}.glb`)).then((g) => g.scene));
  }
  return cache.get(id)!;
};

export const Glb: React.FC<{
  id: string;
  position?: V3;
  rotation?: V3;
  /** Uniform scale, or the target height in world units when `height` is set. */
  scale?: number;
  height?: number;
  /** Optional material override (e.g. a tinted stone for a stand-in building). */
  tint?: (m: THREE.MeshStandardMaterial) => void;
}> = ({ id, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, height, tint }) => {
  const [handle] = useState(() => delayRender(`glb ${id}`));
  const [src, setSrc] = useState<THREE.Group | null>(null);
  useEffect(() => {
    load(id)
      .then((s) => {
        setSrc(s);
        continueRender(handle);
      })
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
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      if (tint) {
        m.material = (m.material as THREE.MeshStandardMaterial).clone();
        tint(m.material as THREE.MeshStandardMaterial);
      }
    });
    const box = new THREE.Box3().setFromObject(o);
    const size = box.getSize(new THREE.Vector3());
    const k = height ? height / Math.max(1e-6, size.y) : scale;
    o.scale.setScalar(k);
    // feet on the origin, centred on x/z
    const c = box.getCenter(new THREE.Vector3());
    o.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    const g = new THREE.Group();
    g.add(o);
    return g;
  }, [src, scale, height, tint]);
  return obj ? <primitive object={obj} position={position} rotation={rotation} /> : null;
};
