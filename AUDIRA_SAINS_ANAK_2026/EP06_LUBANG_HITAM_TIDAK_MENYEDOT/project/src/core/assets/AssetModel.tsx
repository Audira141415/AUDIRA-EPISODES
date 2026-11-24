/**
 * Remotion-safe GLB loader for Polyfork and local models.
 *
 *   <AssetModel id="wedge-coupe-80s-9f8b5e" size={3.2} ground polish="toyPlastic" fallback={<CarBlock />} />
 *
 * Resolution order for `id`: public/models/polyfork/<id>.glb (staticFile, bundled with the project and
 * served offline) → the Polyfork CDN. A direct `src` is tried alone. If every URL fails, `fallback`
 * renders instead, so a missing asset never breaks a render.
 *
 * Loads imperatively (no Suspense): the frame is held with delayRender until the model, or the
 * fallback, is mounted and drawn. Parsed scenes are cached per URL and cloned per instance.
 *
 * `size` scales the model so its largest side is `size` world units; `ground` centres it on x/z and
 * puts its lowest point at y = 0, so a kit can place any catalogue model without knowing its units.
 * `polish` swaps every material for a POLISH.* physical recipe, keeping the model's own colours.
 */

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { POLISH } from "../polish/Polish.tsx";

const POLYFORK_CDN = "https://polyfork.dev/cdn/";
/** Project-local copies (public/models/polyfork/<id>.glb), loaded with staticFile. */
export const LOCAL_MODEL_DIR = "models/polyfork";

export interface AssetModelProps {
  /** Polyfork asset ID: public/models/polyfork/<id>.glb first, CDN fallback. Mutually exclusive with `src`. */
  id?: string;
  /** Kept for catalogue compatibility; local copies live flat in public/models/polyfork. */
  assetType?: string;
  /** Direct GLB/GLTF URL (e.g. staticFile("models/x.glb")). Mutually exclusive with `id`. */
  src?: string;
  /** Rendered when the model cannot be loaded from any URL. */
  fallback?: React.ReactNode;
  /** Scale so the largest side of the model is this many world units. */
  size?: number;
  /** Centre on x/z and rest the lowest point on y = 0 (applied before position/rotation/scale). */
  ground?: boolean;
  /** Replace materials with a POLISH.* physical recipe (keeps colour, vertex colours and maps). */
  polish?: keyof typeof POLISH;
  /** Override all materials with this color (useful for silhouette / style match). */
  tint?: string;
  /** Override roughness on all materials. */
  roughness?: number;
  /** Override metalness on all materials. */
  metalness?: number;
  /** Self-illumination, e.g. a thermal glow. */
  emissive?: string;
  emissiveIntensity?: number;
  /** Cast shadow (default true). */
  castShadow?: boolean;
  /** Receive shadow (default true). */
  receiveShadow?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const cache = new Map<string, Promise<THREE.Group>>();
const loadOne = (url: string): Promise<THREE.Group> => {
  let p = cache.get(url);
  if (!p) {
    p = new Promise<THREE.Group>((resolve, reject) => new GLTFLoader().load(url, (g) => resolve(g.scene), undefined, reject));
    // a failed URL may succeed later (dev server still starting): do not cache the failure
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
};
const loadFirst = async (urls: string[]): Promise<THREE.Group> => {
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

const SUB_TYPES = ["vehicle", "prop", "building", "character", "animal", "terrain", "attachment", "hand", "ultra"] as const;

function candidates(id: string | undefined, assetType: string | undefined, src: string | undefined): string[] {
  if (src) return [src];
  if (!id) return [];
  const list: string[] = [];

  // 1. If explicit assetType provided, check that subfolder first
  if (assetType) {
    list.push(staticFile(`${LOCAL_MODEL_DIR}/${assetType}/${id}.glb`));
  }

  // 2. Project-local flat folder (e.g. models/polyfork/<id>.glb)
  list.push(staticFile(`${LOCAL_MODEL_DIR}/${id}.glb`));

  // 3. Search category subfolders linked from local store (E:\ASET\ASSET-AUDIRA\downloads\glb)
  for (const t of SUB_TYPES) {
    if (t !== assetType) {
      list.push(staticFile(`${LOCAL_MODEL_DIR}/${t}/${id}.glb`));
    }
  }

  // 4. Remote CDN fallback
  list.push(`${POLYFORK_CDN}${id}.glb`);
  return list;
}

export const AssetModel: React.FC<AssetModelProps> = ({
  id,
  assetType,
  src,
  fallback = null,
  size,
  ground = false,
  polish,
  tint,
  roughness,
  metalness,
  emissive,
  emissiveIntensity,
  castShadow = true,
  receiveShadow = true,
  position,
  rotation,
  scale,
}) => {
  const urls = useMemo(() => candidates(id, assetType, src), [id, assetType, src]);
  const key = urls.join("|");
  const [loaded, setLoaded] = useState<{ key: string; scene: THREE.Group | null } | null>(null);
  const hold = useRef<number | null>(null);
  const advance = useThree((s) => s.advance);

  const release = () => {
    if (hold.current === null) return;
    const h = hold.current;
    hold.current = null;
    continueRender(h);
  };

  useLayoutEffect(() => {
    if (!urls.length) return;
    let alive = true;
    hold.current = delayRender(`Loading model ${id ?? src}`, { timeoutInMilliseconds: 60000 });
    loadFirst(urls).then(
      (scene) => alive && setLoaded({ key, scene }),
      () => alive && setLoaded({ key, scene: null }),
    );
    return () => {
      alive = false;
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const ready = loaded?.key === key ? loaded : null;

  const object = useMemo(() => {
    if (!ready?.scene) return null;
    const c = skeletonClone(ready.scene) as THREE.Object3D; // SkinnedMesh-safe: Object3D.clone leaves bones bound to the cached scene
    c.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
      const swap = (m: THREE.Material) => {
        const orig = m as THREE.MeshStandardMaterial;
        let mat: THREE.MeshStandardMaterial;
        if (polish) {
          mat = new THREE.MeshPhysicalMaterial({
            ...POLISH[polish],
            color: orig.color?.clone() ?? new THREE.Color("#ffffff"),
            map: orig.map ?? null,
            vertexColors: orig.vertexColors,
            transparent: orig.transparent,
            opacity: orig.opacity,
          });
        } else if (tint || roughness !== undefined || metalness !== undefined || emissive) {
          mat = orig.clone();
        } else {
          return m;
        }
        if (tint) mat.color.set(tint);
        if (roughness !== undefined) mat.roughness = roughness;
        if (metalness !== undefined) mat.metalness = metalness;
        if (emissive) {
          mat.emissive = new THREE.Color(emissive);
          mat.emissiveIntensity = emissiveIntensity ?? 1;
        }
        return mat;
      };
      child.material = Array.isArray(child.material) ? child.material.map(swap) : swap(child.material);
    });
    if (size !== undefined || ground) {
      const box = new THREE.Box3().setFromObject(c);
      const dim = box.getSize(new THREE.Vector3());
      const k = size !== undefined ? size / Math.max(dim.x, dim.y, dim.z, 1e-6) : 1;
      const wrap = new THREE.Group();
      c.scale.multiplyScalar(k);
      if (ground) {
        const centre = box.getCenter(new THREE.Vector3());
        c.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
      }
      wrap.add(c);
      return wrap;
    }
    return c;
  }, [ready, castShadow, receiveShadow, polish, tint, roughness, metalness, emissive, emissiveIntensity, size, ground]);

  // Once the model (or the fallback) is in the scene graph: draw this frame again (frameloop "never"),
  // then let Remotion capture it.
  useLayoutEffect(() => {
    if (!ready) return;
    advance(performance.now()); // det-ok: redraw timestamp only; nothing animates from the R3F clock
    requestAnimationFrame(release);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, object]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {object ? <primitive object={object} /> : ready ? fallback : null}
    </group>
  );
};
