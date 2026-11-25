// Drop-in <mesh> replacement that auto-assigns FX_LAYER so GTAO and depth of field skip it.
// Use for any additive / volumetric / glow geometry instead of bare <mesh>.

import { forwardRef, useLayoutEffect, useRef, useImperativeHandle } from "react";
import type { Mesh } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { FX_LAYER } from "../render/Post.tsx";

/** Set FX_LAYER + depthWrite false on an imperative mesh ref. */
export function makeAdditive(mesh: Mesh): void {
  mesh.layers.set(FX_LAYER);
  if (mesh.material && !Array.isArray(mesh.material)) {
    mesh.material.depthWrite = false;
  }
}

/**
 * <FxMesh> — identical API to <mesh>, but the underlying Mesh is placed on FX_LAYER
 * so the finishing chain's GTAO and depth-of-field passes ignore it.
 *
 * Without this, additive/volumetric geometry on the default layer corrupts
 * ground-truth AO and can silently blank the entire frame.
 */
export const FxMesh = forwardRef<Mesh, ThreeElements["mesh"]>((props, ref) => {
  const meshRef = useRef<Mesh>(null);
  useImperativeHandle(ref, () => meshRef.current!);
  useLayoutEffect(() => {
    if (meshRef.current) makeAdditive(meshRef.current);
  }, []);
  return <mesh ref={meshRef} {...props} />;
});

FxMesh.displayName = "FxMesh";
