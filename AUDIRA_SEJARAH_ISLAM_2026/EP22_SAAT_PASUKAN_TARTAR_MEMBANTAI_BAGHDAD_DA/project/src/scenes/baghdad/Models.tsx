// Rigged GLB (horse-base, camel-base): AssetModel clones with Object3D.clone, which breaks skinned
// meshes, so this loader clones with SkeletonUtils.clone and drives the clip with
// AnimationMixer.setTime(time) - the pose is a pure function of the film clock.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skClone } from "three/examples/jsm/utils/SkeletonUtils.js";

const cache = new Map<string, Promise<GLTF>>();
const load = (url: string) => {
  let p = cache.get(url);
  if (!p) {
    p = new Promise<GLTF>((res, rej) => new GLTFLoader().load(url, res, undefined, rej));
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
};

/** Load public/models/polyfork/<file>.glb; holds the frame until the model is in the scene and drawn. */
export const useGLB = (file: string): GLTF | null => {
  const url = staticFile(`models/polyfork/${file}.glb`);
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const hold = useRef<number | null>(null);
  const advance = useThree((s) => s.advance);
  const release = () => {
    if (hold.current === null) return;
    const h = hold.current;
    hold.current = null;
    continueRender(h);
  };
  useLayoutEffect(() => {
    let alive = true;
    hold.current = delayRender(`glb ${file}`, { timeoutInMilliseconds: 60000 });
    load(url).then((g) => alive && setGltf(g), () => { if (alive) release(); });
    return () => { alive = false; release(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  useLayoutEffect(() => {
    if (!gltf) return;
    advance(performance.now()); // det-ok: redraw timestamp only
    requestAnimationFrame(release);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf]);
  return gltf;
};

export const RigModel: React.FC<{
  /** path under public/models/polyfork, e.g. "animal/horse-base" */
  file: string;
  /** largest side in world units */
  size: number;
  clip?: string;
  time: number;
  /** playback speed of the clip */
  rate?: number;
  tint?: string;
  position?: [number, number, number];
  yaw?: number;
}> = ({ file, size, clip = "Walk", time, rate = 1, tint, position, yaw = 0 }) => {
  const gltf = useGLB(file);
  const rig = useMemo(() => {
    if (!gltf) return null;
    const obj = skClone(gltf.scene) as THREE.Object3D;
    obj.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      if (tint) {
        const sw = (mat: THREE.Material) => { const n = (mat as THREE.MeshStandardMaterial).clone(); n.color.set(tint); n.roughness = 0.7; return n; };
        m.material = Array.isArray(m.material) ? m.material.map(sw) : sw(m.material);
      }
    });
    const box = new THREE.Box3().setFromObject(obj);
    const dim = box.getSize(new THREE.Vector3());
    const k = size / Math.max(dim.x, dim.y, dim.z, 1e-6);
    obj.scale.multiplyScalar(k);
    const ctr = box.getCenter(new THREE.Vector3());
    obj.position.set(-ctr.x * k, -box.min.y * k, -ctr.z * k);
    const wrap = new THREE.Group();
    wrap.add(obj);
    const mixer = new THREE.AnimationMixer(obj);
    const c = gltf.animations.find((a) => a.name.toLowerCase().includes(clip.toLowerCase())) ?? gltf.animations[0];
    const dur = c ? c.duration : 1;
    if (c) mixer.clipAction(c).play();
    return { wrap, mixer, dur };
  }, [gltf, size, clip, tint]);

  if (rig) rig.mixer.setTime((time * rate) % rig.dur);

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {rig ? <primitive object={rig.wrap} /> : null}
    </group>
  );
};
