// Rigged horse GLBs (Walk / Idle / Run) played deterministically: one AnimationMixer per
// instance, mixer.setTime(t) every render (no clock, no delta). AssetModel does not play clips,
// so this file loads the GLBs itself and holds the render until they are in.

import React, { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import { AnimationAction, AnimationMixer, Box3, Color, Matrix4, Mesh, MeshStandardMaterial, Object3D, Vector3, type Group } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

export const MODEL_IDS = {
  horse: "animal/horse-base",
  wild: "animal/wild-horse-047e93",
  saddled: "animal/saddled-horse-da86d3",
  draft: "animal/draft-horse-519160",
  bucket: "prop/wooden-teoke-bucket-e65f35",
  flag: "prop/checkered-flag-81784a",
  sheep: "animal/sheep-base",
} as const;
export type ModelKey = keyof typeof MODEL_IDS;
export type Models = Record<ModelKey, GLTF>;

const loader = new GLTFLoader();
const pending = new Map<string, Promise<GLTF>>();
const load = (id: string) => {
  let p = pending.get(id);
  if (!p) {
    p = loader.loadAsync(staticFile(`models/polyfork/${id}.glb`));
    pending.set(id, p);
  }
  return p;
};

/** Loads every model once; null until all are in (the frame is held meanwhile). */
export const useModels = (): Models | null => {
  const [models, setModels] = useState<Models | null>(null);
  const [handle] = useState(() => delayRender("mongolia models", { timeoutInMilliseconds: 120000 }));
  // the canvas runs frameloop="never": it only draws when the frame changes, so draw once more
  // after the models are committed, or the first captured frame has no horses
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const keys = Object.keys(MODEL_IDS) as ModelKey[];
    Promise.all(keys.map((k) => load(MODEL_IDS[k])))
      .then((list) => {
        const out = {} as Models;
        keys.forEach((k, i) => (out[k] = list[i]));
        setModels(out);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
  // release the frame only after the models are committed and drawn once
  useEffect(() => {
    if (!models) return;
    let a = 0;
    const b = requestAnimationFrame(() => {
      advance(performance.now());
      a = requestAnimationFrame(() => continueRender(handle));
    });
    return () => {
      cancelAnimationFrame(b);
      cancelAnimationFrame(a);
    };
  }, [models, handle, advance]);
  return models;
};

export type Clip = "Walk" | "Idle" | "Run";

/** Coat colours (multiplied over the model's vertex colour). */
export const COATS = {
  bay: "#a8714a",
  chestnut: "#c0703c",
  dun: "#d8b47c",
  grey: "#e8e4dc",
  black: "#4a3f3a",
  white: "#ffffff",
  dusk: "#3a2c28",
} as const;

type Instance = { root: Object3D; mixer: AnimationMixer; actions: Record<string, AnimationAction>; spine: Object3D | null };

const useInstance = (gltf: GLTF, tint: string | undefined, frost: number) =>
  useMemo<Instance>(() => {
    const root = skeletonClone(gltf.scene);
    root.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false;
        const src = m.material as MeshStandardMaterial;
        const mat = src.clone();
        if (tint) mat.color = new Color(tint);
        if (frost > 0) mat.color.lerp(new Color("#f2f5f8"), frost);
        mat.roughness = Math.max(0.55, mat.roughness ?? 0.8);
        m.material = mat;
      }
    });
    const mixer = new AnimationMixer(root);
    const actions: Record<string, AnimationAction> = {};
    for (const c of gltf.animations) actions[c.name] = mixer.clipAction(c);
    return { root, mixer, actions, spine: root.getObjectByName("Spine") ?? null };
  }, [gltf, tint, frost]);

/** Every horse model is scaled to the same height (a Mongolian horse is small: ~1.75 m to the ears). */
export const HORSE_HEIGHT = 1.75;
const fits = new WeakMap<GLTF, number>();
export const fitScale = (gltf: GLTF) => {
  let f = fits.get(gltf);
  if (f === undefined) {
    const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
    f = size.y > 0 ? HORSE_HEIGHT / size.y : 1;
    fits.set(gltf, f);
  }
  return f;
};

const tmpM = new Matrix4();
const tmpV = new Vector3();
/** Position of a bone relative to the model root (after the pose is applied). */
const boneLocal = (bone: Object3D, root: Object3D) => {
  tmpM.identity();
  let o: Object3D | null = bone;
  while (o && o !== root) {
    o.updateMatrix();
    tmpM.premultiply(o.matrix);
    o = o.parent;
  }
  return tmpV.setFromMatrixPosition(tmpM).clone();
};

export type HorseProps = {
  gltf: GLTF;
  clip: Clip;
  /** Film seconds. */
  t: number;
  /** Clip playback rate. */
  rate?: number;
  /** Clip phase offset in seconds (desynchronises a herd). */
  phase?: number;
  position: [number, number, number];
  /** Radians; 0 faces +z. */
  heading?: number;
  scale?: number;
  tint?: string;
  /** 0..1 frost / snow on the coat. */
  frost?: number;
  /** Rendered at the saddle, following the back as it moves (rider, pack). */
  rider?: React.ReactNode;
  /** Extra offset for the rider from the spine bone, in model space. */
  riderOffset?: [number, number, number];
  children?: React.ReactNode;
};

export const RiggedHorse: React.FC<HorseProps> = ({ gltf, clip, t, rate = 1, phase = 0, position, heading = 0, scale = 1, tint, frost = 0, rider, riderOffset = [0, 0.32, 0.05], children }) => {
  const inst = useInstance(gltf, tint, Math.round(frost * 20) / 20);
  for (const [name, a] of Object.entries(inst.actions)) {
    if (name === clip) {
      a.enabled = true;
      a.setEffectiveWeight(1);
      a.play();
    } else a.stop();
  }
  inst.mixer.setTime(Math.max(0, t * rate + phase));
  const fit = fitScale(gltf);
  let seat: Vector3 | null = null;
  if (rider && inst.spine) seat = boneLocal(inst.spine, inst.root).multiplyScalar(fit);
  return (
    <group position={position} rotation={[0, heading, 0]} scale={scale}>
      <primitive object={inst.root} scale={fit} />
      {rider && seat ? <group position={[seat.x + riderOffset[0], seat.y + riderOffset[1], seat.z + riderOffset[2]]}>{rider}</group> : null}
      {children}
    </group>
  );
};

/** A static (non-rigged) GLB, cloned per use. */
export const Prop: React.FC<{ gltf: GLTF; position: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] }> = ({ gltf, position, rotation = [0, 0, 0], scale = 1 }) => {
  const obj = useMemo(() => {
    const o = skeletonClone(gltf.scene) as Group;
    o.traverse((c) => {
      const m = c as Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return o;
  }, [gltf]);
  return <primitive object={obj} position={position} rotation={rotation} scale={scale} />;
};
