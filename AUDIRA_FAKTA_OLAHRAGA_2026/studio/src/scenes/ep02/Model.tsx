// Catalog GLB loader for EP02. Same contract as _shared/Glb.tsx, but the render is only released
// after the model is committed to the scene (a frame grabbed right after parsing showed nothing).
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

export const Model: React.FC<{
  id: string;
  position?: V3;
  rotation?: V3;
  /** Target height in world units. */
  height: number;
  tint?: (m: THREE.MeshStandardMaterial) => void;
  /** Node names to hide (e.g. a horse shaft on a wagon turned into a motor car). */
  hide?: string[];
}> = ({ id, position = [0, 0, 0], rotation = [0, 0, 0], height, tint, hide }) => {
  const [handle] = useState(() => delayRender(`model ${id}`));
  const [src, setSrc] = useState<THREE.Group | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    load(id).then(setSrc).catch((e) => {
      console.error(e);
      setFailed(true);
    });
  }, [id]);
  const obj = useMemo(() => {
    if (!src) return null;
    const o = src.clone(true);
    o.traverse((c) => {
      if (hide?.includes(c.name)) c.visible = false;
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      if (tint) {
        m.material = (m.material as THREE.MeshStandardMaterial).clone();
        tint(m.material as THREE.MeshStandardMaterial);
      }
    });
    const box = new THREE.Box3();
    o.updateMatrixWorld(true);
    o.traverseVisible((c) => {
      if ((c as THREE.Mesh).isMesh) box.expandByObject(c, false);
    });
    const k = height / Math.max(1e-6, box.getSize(new THREE.Vector3()).y);
    const c = box.getCenter(new THREE.Vector3());
    o.scale.setScalar(k);
    o.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    const g = new THREE.Group();
    g.add(o);
    return g;
  }, [src, height, tint, hide]);
  // While rendering, ThreeCanvas runs frameloop "never" and only draws on frame change, so a model
  // that arrives later must trigger a draw itself before the render is released.
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!obj && !failed) return;
    advance(performance.now());
    continueRender(handle);
  }, [obj, failed, handle, advance]);
  return obj ? <primitive object={obj} position={position} rotation={rotation} /> : null;
};
