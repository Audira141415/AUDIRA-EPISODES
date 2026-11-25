// EP10 — rigged Polyfork cat-base (public/models/ep10/cat.glb) with two looks:
//   "real": original vertex colours + MeshPhysical sheen (fur feel), for the living-room beats;
//   "holo": ANATOMIX hologram (fresnel rim via onBeforeCompile, opacity ~0.3) with glowing inner parts
//           (vertebrae, clavicle, vestibular canals) portalled onto the bones.
// Rest pose has identity bone rotations: +z = head, +y = up, x = lateral. Body roll = rotation about z.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal, useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { ANATOMY_PALETTE as A } from "../../kits/anatomix/lib/palette";

let cache: Promise<GLTF> | null = null;
const loadCat = () => {
  if (!cache) cache = new GLTFLoader().loadAsync(staticFile("models/ep10/cat.glb"));
  return cache;
};

// frameloop "never": once the cat is in the scene graph, draw the frame again, then let Remotion capture it.
const useCatGltf = () => {
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
    hold.current = delayRender("Loading cat.glb", { timeoutInMilliseconds: 60000 });
    loadCat().then(
      (g) => alive && setGltf(g),
      () => release(),
    );
    return () => {
      alive = false;
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (!gltf) return;
    advance(performance.now()); // det-ok: redraw timestamp only
    requestAnimationFrame(release);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf]);
  return gltf;
};

export type CatPose = {
  /** roll of the rear body (hips, hind legs, tail) about the body axis, radians (π = belly up) */
  rear: number;
  /** roll of the front body (chest, head, front legs), radians */
  front: number;
  /** 0..1 front legs tucked to the chest */
  foldFront?: number;
  /** 0..1 hind legs stretched back and out */
  extendHind?: number;
  /** 0..1 back arched (landing) */
  arch?: number;
  /** 0..1 knees bent like a spring (absorbing impact) */
  crouch?: number;
  /** head tilt about body axis, radians */
  headTilt?: number;
  /** extra bend between front and rear around the lateral axis (spine flex demo), radians */
  bend?: number;
};

export const UPRIGHT: CatPose = { rear: 0, front: 0 };

const rimMaterial = (color: string, opacity: number) => {
  const m = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    roughness: 0.25,
    metalness: 0,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.18,
    side: THREE.FrontSide,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = { value: new THREE.Color(color).multiplyScalar(2.2) };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uRim;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\nfloat fr = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.6);\ntotalEmissiveRadiance += uRim * fr;\ndiffuseColor.a = clamp(diffuseColor.a + fr * 0.45, 0.0, 1.0);",
      );
  };
  m.customProgramCacheKey = () => `ep10-rim-${color}`;
  return m;
};

const furMaterial = (tint?: string) =>
  new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    color: tint ?? "#ffffff",
    roughness: 0.78,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color(tint ? "#d8c29a" : "#ffe4c8"),
  });

/** glowing parts portalled onto bones (bone-local units, model is ~0.5 long) */
const Glow: React.FC<{ color: string; r: number; at: [number, number, number]; k: number }> = ({ color, r, at, k }) => (
  <mesh position={at}>
    <sphereGeometry args={[r, 14, 10]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6 * k} transparent opacity={0.25 + 0.75 * k} toneMapped={false} />
  </mesh>
);

const segBeads = (to: THREE.Vector3, n: number) =>
  Array.from({ length: n }, (_, i) => to.clone().multiplyScalar((i + 0.5) / n).toArray() as [number, number, number]);

export const Cat: React.FC<{
  mode: "real" | "holo";
  pose?: CatPose;
  /** play a baked clip instead of the pose: Idle / Walk / Run at this time (s) */
  anim?: { name: "Idle" | "Walk" | "Run"; time: number };
  tint?: string;
  holoColor?: string;
  holoOpacity?: number;
  /** 0..1 glow of the inner parts (holo only) */
  spine?: number;
  clavicle?: number;
  ear?: number;
  /** -1..1 fluid offset inside the canals */
  fluid?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ mode, pose = UPRIGHT, anim, tint, holoColor = A.holo, holoOpacity = 0.16, spine = 0, clavicle = 0, ear = 0, fluid = 0, position, rotation, scale = 1 }) => {
  const gltf = useCatGltf();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  const rig = useMemo(() => {
    if (!gltf) return null;
    const root = skeletonClone(gltf.scene) as THREE.Group;
    const mat = mode === "holo" ? rimMaterial(holoColor, holoOpacity) : furMaterial(tint);
    root.traverse((o) => {
      const m = o as THREE.SkinnedMesh;
      if (m.isMesh) {
        m.material = mat;
        m.castShadow = mode === "real";
        m.receiveShadow = mode === "real";
        m.frustumCulled = false;
        if (mode === "holo") m.renderOrder = 2;
      }
    });
    const b = (n: string) => root.getObjectByName(n) as THREE.Bone;
    const bones = {
      hips: b("Hips"), spine: b("Spine"), chest: b("Chest"), neck: b("Neck"), head: b("Head"), tail: b("Tail"),
      lfu: b("LeftFrontUpLeg"), rfu: b("RightFrontUpLeg"), lfe: b("LeftFrontElbow"), rfe: b("RightFrontElbow"),
      lhu: b("LeftHindUpLeg"), rhu: b("RightHindUpLeg"), lhl: b("LeftHindLeg"), rhl: b("RightHindLeg"),
      lhh: b("LeftHindHock"), rhh: b("RightHindHock"),
    };
    mixerRef.current = new THREE.AnimationMixer(root);
    return { root, bones };
  }, [gltf, mode, tint, holoColor, holoOpacity]);

  if (!rig) return null;
  const { root, bones: B } = rig;

  if (anim && gltf) {
    const mixer = mixerRef.current!;
    const clip = gltf.animations.find((c) => c.name === anim.name);
    if (clip) {
      mixer.stopAllAction();
      mixer.clipAction(clip).play();
      mixer.setTime(anim.time % clip.duration);
    }
  } else {
    mixerRef.current?.stopAllAction();
    Object.values(B).forEach((bone) => bone && bone.rotation.set(0, 0, 0));
    const f = pose.foldFront ?? 0;
    const e = pose.extendHind ?? 0;
    const ar = pose.arch ?? 0;
    const cr = pose.crouch ?? 0;
    const tw = pose.front - pose.rear;
    B.hips.rotation.z = pose.rear;
    B.spine.rotation.set(ar * 0.22 + (pose.bend ?? 0) * 0.5, 0, tw * 0.5);
    B.chest.rotation.set(ar * 0.18 + (pose.bend ?? 0) * 0.5, 0, tw * 0.5);
    B.head.rotation.z = pose.headTilt ?? 0;
    B.neck.rotation.x = -ar * 0.25;
    // front legs: tuck under the chest
    B.lfu.rotation.set(-1.25 * f - 0.15 * cr, 0, 0.12 * f);
    B.rfu.rotation.set(-1.25 * f - 0.15 * cr, 0, -0.12 * f);
    B.lfe.rotation.x = 2.0 * f + 0.55 * cr;
    B.rfe.rotation.x = 2.0 * f + 0.55 * cr;
    // hind legs: stretch back and out, or bend like a spring
    B.lhu.rotation.set(0.95 * e - 0.45 * cr, 0, 0.45 * e);
    B.rhu.rotation.set(0.95 * e - 0.45 * cr, 0, -0.45 * e);
    B.lhl.rotation.x = 0.75 * cr;
    B.rhl.rotation.x = 0.75 * cr;
    B.lhh.rotation.x = -0.6 * cr;
    B.rhh.rotation.x = -0.6 * cr;
    B.tail.rotation.x = -0.5 * e + 0.25;
  }
  root.updateMatrixWorld(true);

  const holo = mode === "holo";
  const vt = (o: THREE.Object3D | undefined) => (o ? o.position.clone() : new THREE.Vector3());
  const neckTo = vt(B.head);
  const chestTo = vt(B.neck);
  const spineTo = vt(B.chest);
  const tailTo = vt(B.tail.children[0]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={root} />
      {holo && spine > 0 && (
        <>
          {createPortal(<>{segBeads(spineTo, 4).map((p, i) => <Glow key={i} color={A.holoSoft} r={0.0105} at={p} k={spine} />)}</>, B.spine)}
          {createPortal(<>{segBeads(chestTo, 3).map((p, i) => <Glow key={i} color={A.holoSoft} r={0.0105} at={p} k={spine} />)}</>, B.chest)}
          {createPortal(<>{segBeads(neckTo, 3).map((p, i) => <Glow key={i} color={A.holoSoft} r={0.009} at={p} k={spine} />)}</>, B.neck)}
          {createPortal(<>{segBeads(vt(B.spine), 2).map((p, i) => <Glow key={i} color={A.holoSoft} r={0.0105} at={p} k={spine} />)}</>, B.hips)}
          {createPortal(<>{segBeads(tailTo, 6).map((p, i) => <Glow key={i} color={A.holoSoft} r={0.0075 - i * 0.0006} at={p} k={spine} />)}</>, B.tail)}
        </>
      )}
      {holo && clavicle > 0 &&
        createPortal(
          <>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[0.026 * s, -0.012, 0.01]} rotation={[0, 0, s * 1.1]}>
                <capsuleGeometry args={[0.0042, 0.022, 4, 8]} />
                <meshStandardMaterial color="#FFB547" emissive="#FFB547" emissiveIntensity={2.2 * clavicle} toneMapped={false} transparent opacity={0.3 + 0.7 * clavicle} />
              </mesh>
            ))}
          </>,
          B.chest,
        )}
      {holo && ear > 0 &&
        createPortal(
          <>
            {[-1, 1].map((s) => (
              <group key={s} position={[0.034 * s, 0.036, -0.004]} scale={1}>
                {[
                  [0, 0, 0],
                  [Math.PI / 2, 0, 0],
                  [0, Math.PI / 2, 0],
                ].map((r, i) => (
                  <mesh key={i} rotation={r as [number, number, number]} position={[0.004 * i * s, 0.003 * i, 0]}>
                    <torusGeometry args={[0.0085, 0.0013, 8, 40]} />
                    <meshStandardMaterial color="#FFB547" emissive="#FFB547" emissiveIntensity={2.4 * ear} toneMapped={false} transparent opacity={ear} />
                  </mesh>
                ))}
                <mesh position={[Math.sin(fluid * 1.2) * 0.0085, Math.cos(fluid * 1.2) * 0.0085, 0]}>
                  <sphereGeometry args={[0.0032, 12, 10]} />
                  <meshStandardMaterial color="#5CC8FF" emissive="#5CC8FF" emissiveIntensity={3 * ear} toneMapped={false} transparent opacity={ear} />
                </mesh>
              </group>
            ))}
          </>,
          B.head,
        )}
    </group>
  );
};
