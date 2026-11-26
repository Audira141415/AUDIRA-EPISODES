// Procedural war banner: wooden pole, gold finial, cloth with deterministic waves from t.
// fall 0..1 lays the banner down around its base (a fallen commander); lower 0..1 slides the cloth
// down the pole; glow lights the cloth from inside (a name being spoken). No writing on the cloth.
import React, { useMemo } from "react";
import * as THREE from "three";

export type BannerProps = {
  t: number;
  color: string;
  position?: [number, number, number];
  /** yaw of the whole banner (cloth flies toward local +x) */
  yaw?: number;
  /** pole height */
  h?: number;
  w?: number;
  ch?: number;
  fall?: number;
  /** direction of the fall in local space (radians around y) */
  fallYaw?: number;
  lower?: number;
  glow?: number;
  seed?: number;
  wind?: number;
  scale?: number;
};

const SX = 16, SY = 9;

export const Banner: React.FC<BannerProps> = ({
  t, color, position = [0, 0, 0], yaw = 0, h = 1.1, w = 0.5, ch = 0.34, fall = 0, fallYaw = 0, lower = 0, glow = 0, seed = 0, wind = 1, scale = 1,
}) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, ch, SX, SY);
    g.translate(w / 2, -ch / 2, 0);
    g.userData.base = (g.attributes.position.array as Float32Array).slice();
    return g;
  }, [w, ch]);
  // cloth waves (calmer when lowered or fallen)
  const base = geom.userData.base as Float32Array;
  const p = geom.attributes.position as THREE.BufferAttribute;
  const amp = 0.055 * wind * (1 - 0.7 * lower) * (1 - 0.85 * fall);
  for (let n = 0; n < p.count; n++) {
    const x = base[n * 3], y = base[n * 3 + 1];
    const u = x / w;
    const z = Math.sin(x * 10 - t * 4.2 * wind + seed * 1.7 + y * 3) * amp * u + Math.sin(x * 21 - t * 7 + seed) * amp * 0.25 * u;
    const droop = (u * u * 0.05 + lower * u * 0.12) * (1 - fall * 0.5);
    p.setXYZ(n, x * (1 - 0.06 * Math.abs(Math.sin(t * 2 + seed)) * u), y - droop, z);
  }
  p.needsUpdate = true;
  geom.computeVertexNormals();
  const clothY = h - 0.05 - lower * Math.max(0, h - ch - 0.12);
  const tilt = fall * 1.42;
  const c = new THREE.Color(color);
  return (
    <group position={position} scale={scale}>
      <group rotation={[0, fallYaw, 0]}>
        <group rotation={[tilt, 0, 0]}>
          <group rotation={[0, yaw - fallYaw, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.016, 0.02, h, 10]} />
              <meshStandardMaterial color="#5b3d22" roughness={0.6} />
            </mesh>
            <mesh position={[0, h + 0.035, 0]} castShadow>
              <coneGeometry args={[0.03, 0.08, 12]} />
              <meshStandardMaterial color="#d8b25a" metalness={0.9} roughness={0.25} emissive="#d8b25a" emissiveIntensity={glow * 0.6} />
            </mesh>
            <mesh position={[0, 0.012, 0]} receiveShadow castShadow>
              <cylinderGeometry args={[0.07, 0.085, 0.024, 20]} />
              <meshStandardMaterial color="#2b1e14" roughness={0.5} metalness={0.2} />
            </mesh>
            <group position={[0.012, clothY, 0]}>
              <mesh geometry={geom} castShadow>
                <meshPhysicalMaterial color={c} side={THREE.DoubleSide} roughness={0.82} sheen={0.7} sheenRoughness={0.45} sheenColor="#ffffff"
                  emissive={c} emissiveIntensity={0.08 + glow * 0.9} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
