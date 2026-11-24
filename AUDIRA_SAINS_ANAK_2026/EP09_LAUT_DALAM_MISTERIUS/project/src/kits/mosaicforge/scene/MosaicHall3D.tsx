import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MOSAIC_PALETTE } from "../lib/palette";
import { makeEnvironment, makeFlagstoneTexture, makeGroutTexture } from "../lib/materials";
import { PANEL } from "../lib/image";
import { mulberry32, smooth } from "../core/motion";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../../core/polish/Polish.tsx";

// Seeded stone grain for the surround slabs and the room floor.
const grain = surfaceGrain(60, 256, 0.4, 5);

const DUST = 260;
const tmp = new THREE.Object3D();

/** The bed and the room: lime grout, worn stone surround, warm raking light, environment for the gold, floating dust. */
export const MosaicHall3D: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => makeEnvironment(gl), [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.32;
    scene.background = new THREE.Color(MOSAIC_PALETTE.room);
    scene.fog = new THREE.Fog(MOSAIC_PALETTE.room, 12, 36);
  }, [scene, env]);

  const grout = useMemo(() => {
    const tex = makeGroutTexture();
    tex.repeat.set(6, 9);
    return tex;
  }, []);

  const flags = useMemo(() => {
    const tex = makeFlagstoneTexture();
    tex.repeat.set(10, 10);
    return tex;
  }, []);

  const surround = useMemo(() => {
    const rnd = mulberry32(6003);
    return Array.from({ length: 34 }, (_, i) => {
      const side = i % 4;
      const k = Math.floor(i / 4);
      const along = -5.4 + k * 1.25;
      const pos: [number, number, number] =
        side === 0 ? [-3.75, 0, along] : side === 1 ? [3.75, 0, along] : side === 2 ? [along * 0.6, 0, -5.25] : [along * 0.6, 0, 5.25];
      return { pos, tone: 0.75 + rnd() * 0.3, rot: (rnd() - 0.5) * 0.04, h: 0.05 + rnd() * 0.03 };
    });
  }, []);

  const dust = useMemo(() => {
    const rnd = mulberry32(6004);
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 6, 6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFE0B0").multiplyScalar(1.2), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
      DUST,
    );
    mesh.frustumCulled = false;
    const seeds = Array.from({ length: DUST }, () => ({ x: (rnd() - 0.5) * 7, y: 0.1 + rnd() * 3.5, z: (rnd() - 0.5) * 10, s: 0.004 + rnd() * 0.008, ph: rnd() * 6.28 }));
    return { mesh, seeds };
  }, []);
  useLayoutEffect(() => {
    dust.seeds.forEach((p, i) => {
      tmp.position.set(p.x + Math.sin(t * 0.3 + p.ph) * 0.2, p.y + Math.sin(t * 0.25 + p.ph) * 0.15, p.z + t * 0.04);
      tmp.scale.setScalar(p.s);
      tmp.updateMatrix();
      dust.mesh.setMatrixAt(i, tmp.matrix);
    });
    dust.mesh.instanceMatrix.needsUpdate = true;
  });

  // key light swings from a low rake (sheen across tilted tiles) to a higher overhead as the camera rises
  const rise = smooth(7, 10.5, t);
  const keyAngle = 0.35 + t * 0.03;

  return (
    <group>
      <hemisphereLight args={["#FFE9C8", "#3A2618", 0.5]} />
      <directionalLight
        position={[Math.cos(keyAngle) * -7, 1.6 + rise * 7, Math.sin(keyAngle) * -5]}
        intensity={2.1}
        color="#FFD9A0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[5, 3, 6]} intensity={0.55} color="#9DB4FF" />

      {/* lime grout bed */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
        <planeGeometry args={[PANEL.w + 0.04, PANEL.h + 0.04]} />
        <meshPhysicalMaterial {...POLISH.stone} map={grout} roughness={0.95} />
      </mesh>

      {/* worn stone surround slabs */}
      {surround.map((s, i) => (
        <mesh key={i} castShadow receiveShadow position={[s.pos[0], s.h / 2 - 0.01, s.pos[2]]} rotation={[0, s.rot, 0]}>
          <RoundedBoxGeo args={[i % 4 < 2 ? 1.4 : 1.2, s.h, i % 4 < 2 ? 1.2 : 1.4]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.stone} color={new THREE.Color(MOSAIC_PALETTE.surround).multiplyScalar(s.tone)} bumpMap={grain} bumpScale={0.6} />
        </mesh>
      ))}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial {...POLISH.stone} map={flags} color="#E8D8C0" bumpMap={flags} bumpScale={1.2} />
      </mesh>
      {/* warm pool of light on the stone floor around the panel (keeps the room from going flat black) */}
      <pointLight position={[0, 5.5, -7]} intensity={18} distance={16} decay={1.6} color="#FFCF96" />

      <primitive object={dust.mesh} />
    </group>
  );
};
