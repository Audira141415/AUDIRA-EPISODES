// The room around the panel: lime grout bed, worn stone surround, a plaster arcade wall with
// horseshoe arches and a green glazed-tile eave behind the far edge (background depth), warm raking
// key light through the arches, and floating dust. Environment/tone mapping come from <Finish>.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { makeGroutTexture } from "../../kits/mosaicforge/lib/materials.ts";
import { mulberry32 } from "../../kits/mosaicforge/core/motion.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { PANEL, P } from "./picture.ts";

const DUST = 220;
const tmp = new THREE.Object3D();
export const WALL_Z = -6.8;

/** Plaster wall with horseshoe-arch openings (extruded shape with holes). */
const useArcadeGeometry = () =>
  useMemo(() => {
    const W = 16, H = 7.5;
    const s = new THREE.Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(W / 2, 0);
    s.lineTo(W / 2, H);
    s.lineTo(-W / 2, H);
    s.lineTo(-W / 2, 0);
    const R = 1.05, jamb = 0.88;
    for (const cx of [-4.6, -2.3, 0, 2.3, 4.6]) {
      const cy = 3.2;
      const hole = new THREE.Path();
      const a0 = Math.asin(-Math.sqrt(R * R - jamb * jamb) / R); // where the circle meets the jambs
      hole.moveTo(cx - jamb, 0.4);
      hole.lineTo(cx + jamb, 0.4);
      hole.lineTo(cx + jamb, cy + a0 * 0 - Math.sqrt(R * R - jamb * jamb));
      hole.absarc(cx, cy, R, a0, Math.PI - a0, false);
      hole.lineTo(cx - jamb, 0.4);
      s.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 32 });
    return g;
  }, []);

export const Hall: React.FC<{ t: number; spot?: number; fill?: number }> = ({ t, spot = 1, fill = 0 }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog(P.room, 12, 36);
  }, [scene]);

  const grout = useMemo(() => {
    const tex = makeGroutTexture();
    tex.repeat.set(6, 9);
    return tex;
  }, []);
  const plasterGrain = useSurfaceGrain(1349, 0.3, 4);
  const arcade = useArcadeGeometry();

  const surround = useMemo(() => {
    const rnd = mulberry32(8590);
    const out: { pos: [number, number, number]; size: [number, number, number]; tone: number; rot: number }[] = [];
    // long sides
    for (let k = 0; k < 8; k++) {
      const z = -5.0 + k * 1.3 + (rnd() - 0.5) * 0.05;
      for (const x of [-3.72, 3.72]) out.push({ pos: [x, 0, z], size: [1.3, 0.06 + rnd() * 0.03, 1.24], tone: 0.78 + rnd() * 0.28, rot: (rnd() - 0.5) * 0.03 });
    }
    // near and far ends
    for (let k = 0; k < 6; k++) {
      const x = -3.6 + k * 1.44;
      for (const z of [-5.22, 5.22]) out.push({ pos: [x, 0, z], size: [1.38, 0.06 + rnd() * 0.03, 1.3], tone: 0.78 + rnd() * 0.28, rot: (rnd() - 0.5) * 0.03 });
    }
    return out;
  }, []);

  const dust = useMemo(() => {
    const rnd = mulberry32(8591);
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 6, 6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFE0B0").multiplyScalar(1.1), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
      DUST,
    );
    mesh.frustumCulled = false;
    mesh.layers.set(1); // FX_LAYER: keep additive dust out of AO
    const seeds = Array.from({ length: DUST }, () => ({ x: (rnd() - 0.5) * 8, y: 0.2 + rnd() * 4, z: (rnd() - 0.5) * 11, s: 0.005 + rnd() * 0.009, ph: rnd() * 6.28 }));
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

  const keyLight = useMemo(() => {
    const l = new THREE.DirectionalLight("#FFD39A", 0.75);
    l.position.set(-6.5, 5.2, -4.5);
    l.castShadow = false;
    return l;
  }, []);

  return (
    <group>
      <hemisphereLight args={["#FFE9C8", "#3A2618", 0.14]} />
      <primitive object={keyLight} />
      <directionalLight position={[5, 4, 7]} intensity={0.25} color="#9DB4FF" />
      {/* wide-shot fill on the arcade and minaret (1963 crane), off elsewhere */}
      {fill > 0.001 ? <directionalLight position={[3, 9, 6]} intensity={1.1 * fill} color="#FFE2B8" /> : null}
      {/* warm pool of light on the door and keys: separates the subject from the darker room */}
      <spotLight position={[0.6, 6.5, 3.2]} target-position={[0, 0, -0.8]} angle={0.3} penumbra={0.85} intensity={600 * spot} distance={0} decay={1.6} color="#FFD7A0" />

      {/* lime grout bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[PANEL.w + 0.04, PANEL.h + 0.04]} />
        <meshStandardMaterial map={grout} roughness={0.95} />
      </mesh>

      {/* worn stone surround */}
      {surround.map((s, i) => (
        <mesh key={i} position={[s.pos[0], s.size[1] / 2 - 0.012, s.pos[2]]} rotation={[0, s.rot, 0]}>
          <RoundedBoxGeo args={s.size} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color={new THREE.Color(P.surround).multiplyScalar(s.tone)} roughnessMap={plasterGrain} />
        </mesh>
      ))}
      {/* floor beyond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#3A2C20" roughness={0.9} />
      </mesh>

      {/* background arcade: cream plaster, horseshoe openings, terracotta dado */}
      <mesh geometry={arcade} position={[0, -0.02, WALL_Z - 0.5]}>
        <meshPhysicalMaterial {...POLISH.stone} color="#9A8668" roughnessMap={plasterGrain} />
      </mesh>
      {/* dark interior seen through the arches, with a faint warm bounce */}
      <mesh position={[0, 3.5, WALL_Z - 2.2]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#3A2818" roughness={1} />
      </mesh>
      {/* green glazed-tile eave on top of the wall */}
      {Array.from({ length: 34 }, (_, i) => (
        <mesh key={i} position={[-8 + i * 0.485, 7.6, WALL_Z + 0.1]} rotation={[Math.PI / 2 - 0.5, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 1.1, 14, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial color={i % 3 === 0 ? P.zelligeGreenDeep : P.zelligeGreen} roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* zellige dado band along the wall base */}
      <mesh position={[0, 0.25, WALL_Z + 0.06]}>
        <boxGeometry args={[16, 0.5, 0.04]} />
        <meshPhysicalMaterial color={P.zelligeGreen} roughness={0.3} clearcoat={0.7} />
      </mesh>

      <primitive object={dust.mesh} />
    </group>
  );
};
