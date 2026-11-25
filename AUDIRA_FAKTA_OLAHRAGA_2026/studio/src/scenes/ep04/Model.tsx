// Catalog GLB loader for EP04. Same contract as _shared/Glb.tsx, with two fixes:
// - the delayRender hold is taken in a layout effect, not in a useState initialiser: a render that
//   suspends (drei <Text> in the same canvas) is thrown away, and a hold taken there never clears;
// - the canvas is redrawn once the model is in the scene, before the frame is released.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
}> = ({ id, position = [0, 0, 0], rotation = [0, 0, 0], height, tint }) => {
  const [src, setSrc] = useState<THREE.Group | null>(null);
  const [failed, setFailed] = useState(false);
  const hold = useRef<number | null>(null);
  useLayoutEffect(() => {
    hold.current = delayRender(`model ${id}`, { timeoutInMilliseconds: 60000 });
    return () => {
      if (hold.current !== null) continueRender(hold.current);
      hold.current = null;
    };
  }, [id]);
  useEffect(() => {
    let live = true;
    load(id)
      .then((s) => live && setSrc(s))
      .catch((e) => {
        console.error(e);
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [id]);
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
    o.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(o);
    const k = height / Math.max(1e-6, box.getSize(new THREE.Vector3()).y);
    const c = box.getCenter(new THREE.Vector3());
    o.scale.setScalar(k);
    o.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    const g = new THREE.Group();
    g.add(o);
    return g;
  }, [src, height, tint]);
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!obj && !failed) return;
    advance(performance.now()); // det-ok: redraw timestamp only
    const h = hold.current;
    hold.current = null;
    if (h !== null) requestAnimationFrame(() => continueRender(h));
  }, [obj, failed, advance]);
  return obj ? <primitive object={obj} position={position} rotation={rotation} /> : null;
};
