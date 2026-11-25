// One continuous world: a long embroidered runner of black kiswah silk with eight stations on it,
// linked by a couched gold carrier thread. Stations far from the camera are hidden (not unmounted,
// so nothing is rebuilt while the camera travels).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { silkTextures } from "./KiswahCover.tsx";
import { cameraAt, type Cam } from "./camera.ts";
import { PAL, ThreadPath } from "./kit.tsx";
import { SX } from "./tl.ts";
import { Station0 } from "./ch00.tsx";
import { Station1 } from "./ch02.tsx";
import { Station2 } from "./ch03.tsx";
import { Station3 } from "./ch04.tsx";
import { Station4 } from "./ch05.tsx";
import { Station5 } from "./ch06.tsx";
import { Station6 } from "./ch07.tsx";
import { Station7 } from "./ch08.tsx";

const STATIONS = [Station0, Station1, Station2, Station3, Station4, Station5, Station6, Station7];

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, scene } = useThree();
  const key = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.fov = cam.fov;
    c.near = 0.05;
    c.far = 140;
    c.lookAt(...cam.look);
    c.updateProjectionMatrix();
    const f = scene.fog as THREE.Fog | null;
    if (f) {
      f.near = cam.D * 1.4 + 2;
      f.far = cam.D * 2.6 + 9;
    }
    const k = key.current;
    if (k) {
      k.position.set(cam.look[0] - 3.4, 4.2, cam.look[2] + 2.6);
      k.target.position.set(cam.look[0], 0, cam.look[2]);
      k.target.updateMatrixWorld();
      const s = Math.min(14, Math.max(4.5, cam.D * 0.9));
      const sc = k.shadow.camera;
      sc.left = -s;
      sc.right = s;
      sc.top = s;
      sc.bottom = -s;
      sc.updateProjectionMatrix();
    }
  });
  return (
    <directionalLight
      ref={key}
      intensity={2.7}
      color="#FFD7A0"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0003}
      shadow-normalBias={0.002}
      shadow-camera-near={0.1}
      shadow-camera-far={20}
    />
  );
};

const Ground: React.FC = () => {
  const silk = useMemo(() => {
    const s = silkTextures();
    s.map.repeat.set(160 / 0.98, 40 / 0.98);
    s.bump.repeat.set(160 / 0.98, 40 / 0.98);
    return s;
  }, []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.22 }), []);
  const couch = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2A2024", roughness: 0.8 }), []);
  const pts = useMemo(() => Array.from({ length: 41 }, (_, i) => [-8 + i * 2.6, 0.012, 2.35 + Math.sin(i * 0.9) * 0.12] as [number, number, number]), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 40, 1, 1]} />
        <meshPhysicalMaterial map={silk.map} bumpMap={silk.bump} bumpScale={0.9} roughness={0.52} sheen={1} sheenRoughness={0.32} sheenColor="#5A4E5C" />
      </mesh>
      {/* the gold carrier thread that links every station, couched every 0.3 */}
      <ThreadPath pts={pts} r={0.012} material={gold} />
      {Array.from({ length: 330 }, (_, i) => {
        const x = -8 + i * 0.32;
        const z = 2.35 + Math.sin(((x + 8) / 2.6) * 0.9) * 0.12;
        return (
          <mesh key={i} position={[x, 0.014, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.06, 0.006, 0.006]} />
            <primitive object={couch} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
};

export const World: React.FC<{ t: number; frame: number; cam?: Cam; pull?: number; exposure?: number; aperture?: number; pool?: number }> = ({ t, frame, cam: camIn, pull = 1, exposure = 0.92, aperture = 0.0006, pool = 1.6 }) => {
  const cam = camIn ?? cameraAt(t, pull);
  const reach = 10 + cam.D * 0.8;
  return (
    <>
      <Rig cam={cam} />
      <fog attach="fog" args={[PAL.bg, 8, 26]} />
      <hemisphereLight args={["#FFE7C8", "#140A0C", 0.38]} />
      <directionalLight position={[cam.look[0] + 2.5, 1.6, cam.look[2] - 4]} intensity={0.9} color="#B8C2FF" />
      <pointLight position={[cam.look[0] + 0.3, 1.4, cam.look[2] + 1.0]} intensity={pool} distance={5} decay={1.6} color="#FFE2B0" />
      <Ground />
      {STATIONS.map((St, i) => (
        <group key={i} visible={Math.abs(SX(i) - cam.look[0]) < reach}>
          <St t={t} />
        </group>
      ))}
      <Finish frame={frame} background={PAL.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={exposure} hdri="studio" envIntensity={1.05} ao aoRadius={0.08} focus={cam.D} aperture={aperture} maxBlur={0.005} />
    </>
  );
};
