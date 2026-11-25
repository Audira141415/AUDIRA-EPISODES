// EP11 — a drinking glass of water and a handful of salt. Used twice: the table glass (scale 1, the
// "small vessel" of the metaphor) and the old man's glass on the porch table inside the hut jar.
// pour 0..1: grains fall in from above; swirl: stirring speed; cloud 0..1: clear water -> cloudy.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeGlassMaterial } from "../../kits/terrarium/lib/materials";
import { POLISH } from "../../core/polish/Polish.tsx";
import { PAL, clamp, prng } from "./world";

const GRAINS = 420;
const HEAP = 260;
const GR = 0.34;
const GH = 0.95;

export const SaltGlass: React.FC<{
  t: number;
  swirl: number;
  cloud: number;
  pour?: number;
  position: [number, number, number];
  scale?: number;
  tilt?: number;
  dish?: [number, number, number] | null;
  dishSalt?: number;
  spoon?: boolean;
}> = ({ t, swirl, cloud, pour = 1, position, scale = 1, tilt = 0, dish = null, dishSalt = 1, spoon = true }) => {
  const glass = useMemo(() => {
    const m = makeGlassMaterial();
    m.thickness = 0.35;
    m.attenuationColor = new THREE.Color("#E3F1EA");
    m.attenuationDistance = 1.2;
    m.depthWrite = false;
    return m;
  }, []);
  const glassGeo = useMemo(() => {
    const outer: [number, number][] = [[0.001, 0], [GR * 0.86, 0], [GR * 0.9, 0.03], [GR, GH], [GR - 0.025, GH + 0.01], [GR - 0.04, GH - 0.02], [GR * 0.83, 0.16], [0.001, 0.15]];
    return new THREE.LatheGeometry(outer.map(([x, y]) => new THREE.Vector2(x, y)), 96);
  }, []);
  const waterH = GH * 0.72;
  const topR = GR * 0.82 + GR * 0.13 * (waterH / GH);
  const grains = useMemo(() => {
    const r = prng(5511);
    return Array.from({ length: GRAINS }, () => ({ a: r() * Math.PI * 2, rad: Math.sqrt(r()) * 0.24, y: 0.17 + r() * (waterH - 0.2), s: 0.006 + r() * 0.01, sp: 0.6 + r() * 1.2, rot: r() * 6, delay: r() * 0.5, fx: (r() - 0.5) * 0.12, fz: (r() - 0.5) * 0.12 }));
  }, [waterH]);
  const heap = useMemo(() => {
    const r = prng(5512);
    return Array.from({ length: HEAP }, () => {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.7) * 0.2;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: (0.2 - d) * 0.55 * (0.7 + r() * 0.3), s: 0.008 + r() * 0.01, rot: r() * 6 };
    });
  }, []);
  const gRef = useRef<THREE.InstancedMesh>(null);
  const hRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const gm = gRef.current!;
    grains.forEach((g, i) => {
      const k = clamp((pour - g.delay) / 0.5); // 0 above the glass .. 1 in the water
      const a = g.a + t * g.sp * (0.3 + swirl);
      const inWater = new THREE.Vector3(Math.cos(a) * g.rad, g.y + Math.sin(t * 0.7 + i) * 0.02, Math.sin(a) * g.rad);
      const above = new THREE.Vector3(g.fx, GH + 0.7 + g.delay * 0.6, g.fz);
      const kk = k * k;
      o.position.copy(above).lerp(inWater, kk);
      o.rotation.set(g.rot + t, g.rot, 0);
      const dissolve = 1 - clamp((cloud - 0.55) / 0.45) * 0.55;
      o.scale.setScalar(k <= 0 ? 0.0001 : g.s * dissolve);
      o.updateMatrix();
      gm.setMatrixAt(i, o.matrix);
    });
    gm.instanceMatrix.needsUpdate = true;
    const hm = hRef.current;
    if (hm) {
      heap.forEach((h, i) => {
        const keep = i / HEAP < dishSalt;
        o.position.set(h.x, 0.05 + h.y * dishSalt, h.z);
        o.rotation.set(h.rot, h.rot * 2, 0);
        o.scale.setScalar(keep ? h.s : 0.0001);
        o.updateMatrix();
        hm.setMatrixAt(i, o.matrix);
      });
      hm.instanceMatrix.needsUpdate = true;
    }
  }, [t, swirl, pour, cloud, dishSalt, grains, heap]);

  const water = new THREE.Color("#CFE3E0").lerp(new THREE.Color(PAL.cloudy), cloud);
  return (
    <group>
      <group position={position} scale={scale} rotation={[0, 0, tilt]}>
        <mesh position={[0, 0.16 + (waterH - 0.16) / 2, 0]}>
          <cylinderGeometry args={[topR, GR * 0.83, waterH - 0.16, 64]} />
          <meshPhysicalMaterial color={water} transmission={0.95 - 0.45 * cloud} thickness={0.6} roughness={0.05 + 0.45 * cloud} ior={1.33} attenuationColor={new THREE.Color("#DCE3DA")} attenuationDistance={2 - 1.6 * cloud} />
        </mesh>
        <mesh position={[0, waterH, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[topR, 64]} />
          <meshPhysicalMaterial color={water} roughness={0.12} clearcoat={1} transmission={0.6 - 0.4 * cloud} />
        </mesh>
        <instancedMesh ref={gRef} args={[undefined, undefined, GRAINS]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={PAL.salt} roughness={0.35} emissive="#FFFFFF" emissiveIntensity={0.25} />
        </instancedMesh>
        {spoon && (
          <group position={[0.06, 0.2, 0.02]} rotation={[0, 0, -0.32 + Math.sin(t * 3) * 0.08 * swirl]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.022, 1.0, 12]} />
              <meshPhysicalMaterial color="#8A6440" {...POLISH.stone} roughness={0.7} />
            </mesh>
          </group>
        )}
        <mesh geometry={glassGeo} material={glass} renderOrder={10} />
      </group>
      {dish && (
        <group position={dish} scale={scale}>
          <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.22, 0.07, 48]} />
            <meshPhysicalMaterial color="#A86A45" {...POLISH.clay} />
          </mesh>
          <instancedMesh ref={hRef} args={[undefined, undefined, HEAP]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={PAL.salt} roughness={0.4} />
          </instancedMesh>
        </group>
      )}
    </group>
  );
};
