// EP04 film — imaging suite (adapted copy of kits/anatomix/scene/HoloSuite3D): backdrop dome, projector
// floor, clinical rings, motes, plus film controls: `on` (projector hardware visible), `dim` (memorial
// darkening) and hologram rebuild sweeps (a bright ring rising from the projector at every swap).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { makeBackdropTexture, makeGlow, makeProjectorTexture } from "../../kits/anatomix/lib/materials";
import { prng } from "../../kits/anatomix/core/motion";
import { clamp } from "./clock";

const MOTES = 120;

export const Suite: React.FC<{ t: number; on: number; dim: number; sweeps: number[]; warn?: number }> = ({ t, on, dim, sweeps, warn = 0 }) => {
  const back = useMemo(() => makeBackdropTexture(), []);
  const proj = useMemo(() => makeProjectorTexture(), []);
  const glow = useMemo(() => makeGlow(), []);
  const moteRef = useRef<THREE.InstancedMesh>(null);
  const motes = useMemo(() => {
    const r = prng(5656);
    return Array.from({ length: MOTES }, () => {
      const a = r() * Math.PI * 2;
      const rad = 2.2 + r() * 3.5;
      return { a, rad, y: -2 + r() * 4.5, ph: r() * 6.28, s: 0.5 + r() };
    });
  }, []);
  useLayoutEffect(() => {
    const m = moteRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    motes.forEach((d, i) => {
      const a = d.a + t * 0.04;
      o.position.set(Math.cos(a) * d.rad, d.y + Math.sin(t * 0.5 + d.ph) * 0.08, Math.sin(a) * d.rad);
      o.scale.setScalar(0.012 * d.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, motes]);

  const lit = on * (1 - 0.8 * dim);
  const pulseR = (t * 0.9) % 1;
  // the most recent sweep drives the rebuild ring (0..1 over 0.7 s)
  let sweep = -1;
  for (const s of sweeps) if (t >= s && t < s + 0.75) sweep = (t - s) / 0.75;
  const col = warn > 0 ? new THREE.Color(P.holo).lerp(new THREE.Color("#FF9A4D"), warn) : new THREE.Color(P.holo);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[30, 48, 24]} />
        <meshBasicMaterial map={back} side={THREE.BackSide} fog={false} color={new THREE.Color(1, 1, 1).multiplyScalar(1 - 0.55 * dim)} />
      </mesh>
      {lit > 0.01 && (
        <group>
          <mesh position={[0, -1.95, 0]} rotation={[-Math.PI / 2, 0, t * 0.1]}>
            <planeGeometry args={[4.4, 4.4]} />
            <meshBasicMaterial map={proj} transparent opacity={0.45 * lit} blending={THREE.AdditiveBlending} depthWrite={false} color={col} />
          </mesh>
          <mesh position={[0, -1.25, 0]}>
            <cylinderGeometry args={[1.5, 1.95, 1.4, 64, 1, true]} />
            <meshBasicMaterial color={col} transparent opacity={0.06 * lit} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh position={[0, -1.94, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.6 + pulseR * 1.3}>
            <ringGeometry args={[0.95, 1, 96]} />
            <meshBasicMaterial color={P.holoSoft} transparent opacity={(1 - pulseR) * 0.4 * lit} toneMapped={false} depthWrite={false} />
          </mesh>
          {[
            { r: 1.75, tilt: [1.35, 0, 0.2], sp: 0.25 },
            { r: 1.95, tilt: [1.1, 0.4, -0.3], sp: -0.18 },
            { r: 2.15, tilt: [1.6, -0.5, 0.1], sp: 0.12 },
          ].map((ring, i) => (
            <group key={i} rotation={ring.tilt as [number, number, number]}>
              <mesh rotation={[0, 0, t * ring.sp]}>
                <torusGeometry args={[ring.r, 0.007, 8, 180, Math.PI * (1.4 + 0.2 * i)]} />
                <meshBasicMaterial color={col} transparent opacity={0.75 * lit} toneMapped={false} />
              </mesh>
            </group>
          ))}
          <sprite position={[0, 0.2, -1.2]} scale={[6, 6, 1]}>
            <spriteMaterial map={glow} color={col} transparent opacity={0.22 * lit} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      )}
      {/* projector base stays (dim) even in the memorial */}
      {on > 0.01 && (
        <mesh position={[0, -2.02, 0]}>
          <cylinderGeometry args={[2.25, 2.4, 0.12, 96]} />
          <meshStandardMaterial color="#0B2228" metalness={0.3} roughness={0.75} />
        </mesh>
      )}
      {sweep >= 0 && on > 0.01 && (
        <group position={[0, -1.9 + 3.6 * sweep, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.55, 1.62, 128]} />
            <meshBasicMaterial color={P.holoSoft} transparent opacity={clamp(1 - sweep) * 0.9} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.55, 96]} />
            <meshBasicMaterial color={P.holo} transparent opacity={clamp(1 - sweep) * 0.12} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      )}
      <instancedMesh ref={moteRef} args={[undefined, undefined, MOTES]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={P.holoSoft} transparent opacity={0.4 * (1 - 0.5 * dim)} depthWrite={false} />
      </instancedMesh>
    </group>
  );
};
