/**
 * Scene components built on core/film/craft.ts.
 *
 *   <PagePeel k={...} />   a sheet of paper that unrolls over the frame and peels off: a motivated
 *                          transition for paper, manuscript and comic films. Cut the shot while
 *                          peelCover(k) === 1 (around k = 0.5).
 *   <BoilGroup t i>        wraps a cut-paper / drawn layer so it hops on twelves (paperJitter).
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, DoubleSide, type Mesh, PlaneGeometry, type PerspectiveCamera, Vector3 } from "three";
import { paperJitter, peel } from "./craft";

const forward = new Vector3();

/**
 * A page that covers the whole view at `distance` in front of the camera, curling with peel(k).
 * k 0..0.5 unrolls in from the right, 0.5 lies flat (cut here), 0.5..1 peels off to the left.
 */
export const PagePeel: React.FC<{
  k: number;
  color?: string;
  distance?: number;
  rad?: number;
  angle?: number;
  segments?: number;
}> = ({ k, color = "#efe6d2", distance = 0.5, rad = 0.08, angle = 0.35, segments = 48 }) => {
  const mesh = useRef<Mesh>(null);
  const geo = useMemo(() => new PlaneGeometry(1, 1, segments, segments), [segments]);
  const uv = useMemo(() => (geo.getAttribute("uv") as BufferAttribute).array.slice(), [geo]);

  useFrame(({ camera }) => {
    const m = mesh.current;
    if (!m) return;
    const visible = k > 0 && k < 1;
    m.visible = visible;
    if (!visible) return;
    const cam = camera as PerspectiveCamera;
    const h = 2 * distance * Math.tan(((cam.fov ?? 35) * Math.PI) / 360) * 1.04;
    const w = h * (cam.aspect || 9 / 16);
    const pos = geo.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const [x, y, z] = peel(k, uv[i * 2], uv[i * 2 + 1], { rad, angle });
      // page units are widths: x, z scale by w; y keeps the frame's aspect
      pos.setXYZ(i, (x - 0.5) * w, (y - 0.5) * h, z * w);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    camera.getWorldDirection(forward);
    m.position.copy(camera.position).addScaledVector(forward, distance);
    m.quaternion.copy(camera.quaternion);
  });

  // the curl's shading (normals recomputed each frame) is what reads as paper turning over.
  // transparent (at opacity 1) puts the page in the transparent pass, drawn last by renderOrder: an opaque
  // page would be drawn before transparent things such as SDF text, and the text would show through it
  return (
    <mesh ref={mesh} geometry={geo} renderOrder={9999} frustumCulled={false}>
      <meshStandardMaterial color={color} roughness={0.9} side={DoubleSide} depthTest={false} depthWrite={false} transparent opacity={1} />
    </mesh>
  );
};

/**
 * A layer that "boils" like hand-placed cut paper: offsets in world units (px * unit) and a small
 * rotation, constant inside each boil step. `i` gives each layer its own jitter.
 */
export const BoilGroup: React.FC<{
  t: number;
  i?: number;
  unit?: number;
  px?: number;
  deg?: number;
  boilFps?: number;
  position?: [number, number, number];
  children: React.ReactNode;
}> = ({ t, i = 0, unit = 0.004, px = 1.5, deg = 0.25, boilFps = 12, position = [0, 0, 0], children }) => {
  const [dx, dy, rot] = paperJitter(t, i, { boilFps, px, deg });
  return (
    <group position={[position[0] + dx * unit, position[1] + dy * unit, position[2]]} rotation={[0, 0, (rot * Math.PI) / 180]}>
      {children}
    </group>
  );
};
