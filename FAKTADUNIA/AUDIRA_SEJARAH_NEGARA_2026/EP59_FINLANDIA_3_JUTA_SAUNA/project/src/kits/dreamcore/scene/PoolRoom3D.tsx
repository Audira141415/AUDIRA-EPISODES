import React, { useMemo } from "react";
import * as THREE from "three";
import { DREAM_PALETTE } from "../lib/palette";
import { makeTileTexture } from "../lib/materials";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { FloatingDoor3D } from "./FloatingDoor3D";
import { float, hookDoorOpen } from "../core/motion";

export const ROOM = { halfW: 3.5, height: 5.5, near: 10.5, far: -2, archHalf: 1.8, archSpring: 3.0 };

const tileMat = (repeatX: number, repeatY: number) => {
  const tex = makeTileTexture();
  tex.repeat.set(repeatX, repeatY);
  // glazed tile: POLISH.brickABS clearcoat gives the wet glaze highlight
  return new THREE.MeshPhysicalMaterial({ ...POLISH.brickABS, map: tex, roughness: 0.18, envMapIntensity: 0.7 });
};

const BallFallback: React.FC = () => (
  <mesh position={[0, 0.25, 0]}>
    <sphereGeometry args={[0.25, 32, 20]} />
    <meshPhysicalMaterial {...POLISH.toyPlastic} color={DREAM_PALETTE.doorPink} />
  </mesh>
);

/** The pool room: white-tiled walls and ceiling, water instead of a floor, a great arch opening onto the dream outside. */
export const PoolRoom3D: React.FC<{ t: number }> = ({ t }) => {
  const length = ROOM.near - ROOM.far;
  const side = useMemo(() => tileMat(length / 2, ROOM.height / 2), [length]);
  const ceil = useMemo(() => tileMat((ROOM.halfW * 2) / 2, length / 2), [length]);
  const ledge = useMemo(() => tileMat(length / 2, 0.5), [length]);
  const archWall = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-ROOM.halfW, -0.5);
    s.lineTo(ROOM.halfW, -0.5);
    s.lineTo(ROOM.halfW, ROOM.height);
    s.lineTo(-ROOM.halfW, ROOM.height);
    s.closePath();
    const h = new THREE.Path();
    h.moveTo(-ROOM.archHalf, -0.4);
    h.lineTo(ROOM.archHalf, -0.4);
    h.lineTo(ROOM.archHalf, ROOM.archSpring);
    h.absarc(0, ROOM.archSpring, ROOM.archHalf, 0, Math.PI, false);
    h.lineTo(-ROOM.archHalf, -0.4);
    s.holes.push(h);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 48 });
    const tex = makeTileTexture();
    tex.repeat.set(0.5, 0.5);
    return { geo, mat: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.18, envMapIntensity: 0.7 }) };
  }, []);

  // small arched windows in the side walls (bright pastel light slots)
  const windows = [1.5, 5.5];

  return (
    <group>
      {/* side walls */}
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} material={side} position={[sgn * ROOM.halfW, ROOM.height / 2, (ROOM.near + ROOM.far) / 2]} rotation={[0, -sgn * (Math.PI / 2), 0]}>
          <planeGeometry args={[length, ROOM.height]} />
        </mesh>
      ))}
      {windows.map((z) => (
        <mesh key={z} position={[-ROOM.halfW + 0.01, 2.9, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.0, 1.7]} />
          <meshBasicMaterial color={new THREE.Color(DREAM_PALETTE.skyMid).multiplyScalar(1.5)} />
        </mesh>
      ))}
      {/* ceiling */}
      <mesh material={ceil} position={[0, ROOM.height, (ROOM.near + ROOM.far) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.halfW * 2, length]} />
      </mesh>
      {/* far wall with the great arch */}
      <mesh geometry={archWall.geo} material={archWall.mat} position={[0, 0, ROOM.far - 0.5]} />
      {/* back wall behind the camera */}
      <mesh material={side} position={[0, ROOM.height / 2, ROOM.near]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM.halfW * 2, ROOM.height]} />
      </mesh>
      {/* tiled pool ledges with a lip */}
      {[-1, 1].map((sgn) => (
        <mesh key={`l${sgn}`} material={ledge} position={[sgn * (ROOM.halfW - 0.45), 0.08, (ROOM.near + ROOM.far) / 2]}>
          <RoundedBoxGeo args={[0.9, 0.3, length]} radius={0.06} />
        </mesh>
      ))}
      {/* pool ladder rails */}
      {[-0.25, 0.25].map((dz) => (
        <mesh key={dz} position={[ROOM.halfW - 0.95, 0.5, 2.5 + dz]}>
          <torusGeometry args={[0.4, 0.03, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#E9EEF2" metalness={1} roughness={0.15} />
        </mesh>
      ))}

      {/* a forgotten beach ball drifting on the still water (Polyfork GLB, pastel sphere fallback) */}
      <group position={[0.15, 0.06 + float(t, 2.1, 0.025), 5.6 - t * 0.04]} rotation={[0.2, t * 0.12, 0.1]}>
        <AssetModel id="beach-ball-4b2a9b" size={0.5} ground polish="toyPlastic" fallback={<BallFallback />} />
      </group>

      {/* the hook: a door standing in the pool, opening on its own */}
      <FloatingDoor3D position={[1.15, -0.25 + float(t, 1.2, 0.03), 4.6]} rotationY={-0.45} open={hookDoorOpen(t)} glow={0.5 + 0.5 * hookDoorOpen(t)} leaf={DREAM_PALETTE.doorPink} />
    </group>
  );
};
