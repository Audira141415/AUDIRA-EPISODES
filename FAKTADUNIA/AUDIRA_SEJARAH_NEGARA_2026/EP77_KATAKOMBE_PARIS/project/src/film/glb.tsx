// GLB models from the AUDIRA catalog (public/glb/). Loaded once per url, held by delayRender until ready.
// Each model is normalised: centred on x/z, base on y = 0, scaled to the requested height.
import React, { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import { Box3, Group, Material, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skinnedClone } from "three/examples/jsm/utils/SkeletonUtils.js";
type V3 = [number, number, number];

const cache = new Map<string, Promise<Object3D>>();
const load = (name: string) => {
  let p = cache.get(name);
  if (!p) {
    p = new GLTFLoader().loadAsync(staticFile(`glb/${name}.glb`)).then((g) => g.scene);
    cache.set(name, p);
  }
  return p;
};

export const GOLD = () => new MeshStandardMaterial({ color: "#d4a537", metalness: 1, roughness: 0.22, envMapIntensity: 1.4, emissive: "#7a4c10", emissiveIntensity: 0.55 });

export const Glb: React.FC<{ name: string; pos: V3; h: number; rotY?: number; material?: Material; tint?: string; shadow?: boolean; sil?: { id: number; color: string | null; gain?: number } }> = ({ name, pos, h, rotY = 0, material, tint, shadow = true, sil }) => {
  const [src, setSrc] = useState<Object3D | null>(null);
  const [handle] = useState(() => delayRender(`glb ${name}`));
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    load(name).then(setSrc).catch((e) => { console.error(e); continueRender(handle); });
  }, [name, handle]);
  const obj = useMemo(() => {
    if (!src) return null;
    const g = new Group();
    // SkeletonUtils.clone: rigged models (camel, cow) keep their skeleton bound to the copy, not the cached original
    const c = skinnedClone(src);
    c.updateMatrixWorld(true);
    c.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = shadow; m.receiveShadow = true;
      if (sil) m.userData.sil = sil;
      if (material) m.material = material;
      else if (tint) m.material = new MeshStandardMaterial({ color: tint, roughness: 0.95 });
    });
    const box = new Box3().setFromObject(c);
    const size = box.getSize(new Vector3());
    const k = h / Math.max(1e-3, size.y);
    c.scale.setScalar(k);
    const ctr = box.getCenter(new Vector3());
    c.position.set(-ctr.x * k, -box.min.y * k, -ctr.z * k);
    g.add(c);
    return g;
  }, [src, h, material, tint, shadow, sil?.id, sil?.color]);
  // frameloop is "never": redraw once the model is in the graph, then release the frame
  useEffect(() => {
    if (!obj) return;
    const id = requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); });
    return () => cancelAnimationFrame(id);
  }, [obj, advance, handle]);
  if (!obj) return null;
  return <primitive object={obj} position={pos} rotation={[0, rotY, 0]} />;
};
