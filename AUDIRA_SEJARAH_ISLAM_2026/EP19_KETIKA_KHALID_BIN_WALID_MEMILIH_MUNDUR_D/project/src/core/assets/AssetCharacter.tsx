/**
 * Animated Polyfork character for Remotion + R3F.
 *
 *   <AssetCharacter id="astronaut-explorer-323482" clip="Wave" size={1.8} ground position={[0, 0, 0]} />
 *
 * Loads public/models/polyfork/character-anim/<id>.glb (260 rigged characters, clips:
 * Idle, Walk, Run, Wave, Point, Cheer), then character/<id>.glb (Idle, Walk, Run only), then the CDN.
 * The clip is driven by the Remotion frame (mixer.setTime), never the R3F clock, so every render
 * of a frame is identical. Skinned meshes are cloned with SkeletonUtils so instances do not share
 * a skeleton. If no URL loads, `fallback` renders instead.
 */

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { POLISH } from "../polish/Polish.tsx";
import { LOCAL_MODEL_DIR } from "./AssetModel.tsx";

export type CharacterClip = "Idle" | "Walk" | "Run" | "Wave" | "Point" | "Cheer" | (string & {});

export interface AssetCharacterProps {
  /** Polyfork character ID (type "character"). */
  id: string;
  /** Clip name; falls back to Idle, then the first clip, if the GLB lacks it. */
  clip?: CharacterClip;
  /** Playback speed multiplier. */
  speed?: number;
  /** Seconds added to the clip time, to desync a crowd of the same clip. */
  offset?: number;
  /** Scale so the tallest side is this many world units. */
  size?: number;
  /** Centre on x/z and rest the feet on y = 0. */
  ground?: boolean;
  /** Replace materials with a POLISH.* physical recipe (keeps vertex colours). */
  polish?: keyof typeof POLISH;
  fallback?: React.ReactNode;
  castShadow?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const POLYFORK_CDN = "https://polyfork.dev/cdn/";
const cache = new Map<string, Promise<{ scene: THREE.Group; clips: THREE.AnimationClip[] }>>();
const loadOne = (url: string) => {
  let p = cache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) =>
      new GLTFLoader().load(url, (g) => resolve({ scene: g.scene, clips: g.animations }), undefined, reject),
    );
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
};
const loadFirst = async (urls: string[]) => {
  let last: unknown = new Error("no url");
  for (const u of urls) {
    try {
      return await loadOne(u);
    } catch (e) {
      last = e;
    }
  }
  throw last;
};

export const AssetCharacter: React.FC<AssetCharacterProps> = ({
  id,
  clip = "Idle",
  speed = 1,
  offset = 0,
  size,
  ground = false,
  polish,
  fallback = null,
  castShadow = true,
  position,
  rotation,
  scale,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const urls = useMemo(
    () => [
      staticFile(`${LOCAL_MODEL_DIR}/character-anim/${id}.glb`),
      staticFile(`${LOCAL_MODEL_DIR}/character/${id}.glb`),
      `${POLYFORK_CDN}${id}.glb`,
    ],
    [id],
  );
  const [loaded, setLoaded] = useState<{ id: string; data: { scene: THREE.Group; clips: THREE.AnimationClip[] } | null } | null>(null);
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
    hold.current = delayRender(`Loading character ${id}`, { timeoutInMilliseconds: 60000 });
    loadFirst(urls).then(
      (data) => alive && setLoaded({ id, data }),
      () => alive && setLoaded({ id, data: null }),
    );
    return () => {
      alive = false;
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ready = loaded?.id === id ? loaded : null;

  const rig = useMemo(() => {
    if (!ready?.data) return null;
    const c = SkeletonUtils.clone(ready.data.scene) as THREE.Group;
    c.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = castShadow;
      child.receiveShadow = true;
      child.frustumCulled = false; // skinned bounds do not follow the pose
      if (polish) {
        const swap = (m: THREE.Material) => {
          const o = m as THREE.MeshStandardMaterial;
          return new THREE.MeshPhysicalMaterial({
            ...POLISH[polish],
            color: o.color?.clone() ?? new THREE.Color("#ffffff"),
            map: o.map ?? null,
            vertexColors: o.vertexColors,
          });
        };
        child.material = Array.isArray(child.material) ? child.material.map(swap) : swap(child.material);
      }
    });
    const clips = ready.data.clips;
    const pick = clips.find((a) => a.name === clip) ?? clips.find((a) => a.name === "Idle") ?? clips[0];
    const mixer = new THREE.AnimationMixer(c);
    if (pick) mixer.clipAction(pick).play();
    let root: THREE.Object3D = c;
    if (size !== undefined || ground) {
      const box = new THREE.Box3().setFromObject(c);
      const dim = box.getSize(new THREE.Vector3());
      const k = size !== undefined ? size / Math.max(dim.x, dim.y, dim.z, 1e-6) : 1;
      c.scale.multiplyScalar(k);
      if (ground) {
        const centre = box.getCenter(new THREE.Vector3());
        c.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
      }
      root = new THREE.Group();
      root.add(c);
    }
    return { root, mixer };
  }, [ready, clip, size, ground, polish, castShadow]);

  // Pose from the Remotion frame, applied before every draw.
  const t = (frame / fps) * speed + offset;
  useFrame(() => {
    rig?.mixer.setTime(t);
  });

  useLayoutEffect(() => {
    if (!ready) return;
    rig?.mixer.setTime(t);
    advance(performance.now()); // det-ok: redraw only; the pose comes from the Remotion frame
    requestAnimationFrame(release);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, rig]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {rig ? <primitive object={rig.root} /> : ready ? fallback : null}
    </group>
  );
};
