// EP09 Laut Dalam — shared ocean pieces: water fog, marine snow, plankton sparks, god-rays, seabed, glow lure.
// Everything is a pure function of t (seeded, no Math.random) so render tabs agree frame by frame.
import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ABYSS_PALETTE as P } from "../../kits/abyssforge/lib/palette";
import { makeGodRayTexture, makeLumenMaterial } from "../../kits/abyssforge/lib/materials";
import { mulberry32 } from "../../kits/abyssforge/core/motion";
import { POLISH } from "../../core/polish/Polish.tsx";

type V3 = [number, number, number];

/** Water colour for depth in metres (0 → 11 000). */
export const waterAt = (m: number) => {
  const stops: [number, string][] = [
    [0, "#1B6C8E"],
    [200, P.surfaceTeal],
    [1000, P.twilightBlue],
    [4000, P.midnightInk],
    [11000, P.abyssBlack],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (m <= stops[i][0]) {
      const k = (m - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return new THREE.Color(stops[i - 1][1]).lerp(new THREE.Color(stops[i][1]), Math.max(0, k));
    }
  }
  return new THREE.Color(P.abyssBlack);
};

/** Fog that follows the water colour. */
export const WaterFog: React.FC<{ color: THREE.Color | string; density?: number }> = ({ color, density = 0.06 }) => {
  const { scene } = useThree();
  const hex = new THREE.Color(color).getHex();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(hex, density);
    return () => {
      scene.fog = null;
    };
  }, [scene, hex, density]);
  return null;
};

/** Marine snow drifting around a centre (camera-relative box), plus optional glowing plankton. */
export const MarineSnow: React.FC<{ t: number; center: V3; count?: number; plankton?: number; size?: number; spread?: number }> = ({
  t,
  center,
  count = 900,
  plankton = 0,
  size = 1,
  spread = 10,
}) => {
  const snow = useMemo(() => {
    const rnd = mulberry32(9101);
    const mesh = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: P.marineSnow, transparent: true, opacity: 0.7 }),
      count,
    );
    mesh.frustumCulled = false;
    const seeds = Array.from({ length: count }, () => ({
      x: rnd() - 0.5,
      y: rnd(),
      z: rnd() - 0.5,
      s: 0.008 + Math.pow(rnd(), 4) * 0.02,
      ph: rnd() * 6.28,
      v: 0.03 + rnd() * 0.06,
    }));
    return { mesh, seeds };
  }, [count]);
  const glow = useMemo(() => {
    if (!plankton) return null;
    const rnd = mulberry32(9102);
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 6), new THREE.MeshBasicMaterial(), plankton);
    mesh.frustumCulled = false;
    const pal = [P.lumenCyan, P.lumenMagenta, P.lumenViolet];
    const seeds = Array.from({ length: plankton }, (_, i) => {
      mesh.setColorAt(i, new THREE.Color(pal[i % 3]).multiplyScalar(2.6));
      return { x: rnd() - 0.5, y: rnd() - 0.5, z: rnd() - 0.5, s: 0.014 + rnd() * 0.022, ph: rnd() * 6.28, f: 0.8 + rnd() * 2.2 };
    });
    return { mesh, seeds };
  }, [plankton]);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const S = spread;
    snow.seeds.forEach((p, i) => {
      // wrap vertically inside the box so the field never runs out
      const y = ((((p.y - t * p.v * 0.12) % 1) + 1) % 1) - 0.5;
      tmp.position.set(center[0] + p.x * S + Math.sin(t * 0.4 + p.ph) * 0.12, center[1] + y * S, center[2] + p.z * S);
      tmp.rotation.set(p.ph, t * 0.5 + p.ph, 0);
      tmp.scale.setScalar(p.s * size);
      tmp.updateMatrix();
      snow.mesh.setMatrixAt(i, tmp.matrix);
    });
    snow.mesh.instanceMatrix.needsUpdate = true;
    if (glow) {
      glow.seeds.forEach((p, i) => {
        const tw = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * p.f + p.ph), 3);
        tmp.position.set(center[0] + p.x * S, center[1] + p.y * S + Math.sin(t * 0.5 + p.ph) * 0.2, center[2] + p.z * S);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.setScalar(p.s * tw * size);
        tmp.updateMatrix();
        glow.mesh.setMatrixAt(i, tmp.matrix);
      });
      glow.mesh.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <primitive object={snow.mesh} />
      {glow && <primitive object={glow.mesh} />}
    </group>
  );
};

/** Light shafts from the surface. */
export const GodRays: React.FC<{ t: number; y?: number; strength?: number; count?: number }> = ({ t, y = 0, strength = 1, count = 7 }) => {
  const tex = useMemo(() => makeGodRayTexture(), []);
  const rays = useMemo(() => {
    const rnd = mulberry32(9103);
    return Array.from({ length: count }, () => ({ x: (rnd() - 0.5) * 9, z: -1 - rnd() * 7, w: 1.2 + rnd() * 2.4, ry: (rnd() - 0.5) * 1.2, rz: (rnd() - 0.5) * 0.3, ph: rnd() * 6 }));
  }, [count]);
  if (strength <= 0.001) return null;
  return (
    <group position={[0, y, 0]}>
      {rays.map((r, i) => (
        <mesh key={i} position={[r.x, -10, r.z]} rotation={[0, r.ry, r.rz]}>
          <planeGeometry args={[r.w, 24]} />
          <meshBasicMaterial
            map={tex}
            color={P.godRay}
            transparent
            opacity={(0.2 + 0.07 * Math.sin(t * 0.7 + r.ph)) * strength}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Rolling silt seabed. */
export const Seabed: React.FC<{ y?: number; size?: number; color?: string; seed?: number }> = ({ y = 0, size = 40, color = P.seabedSilt, seed = 9104 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 140, 140);
    g.rotateX(-Math.PI / 2);
    const rnd = mulberry32(seed);
    const bumps = Array.from({ length: 18 }, () => ({ x: (rnd() - 0.5) * size * 0.5, z: (rnd() - 0.5) * size * 0.5, r: 0.6 + rnd() * 2.2, h: 0.2 + rnd() * 1.2 }));
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let h = Math.sin(x * 0.7) * 0.12 + Math.sin(z * 1.1 + x * 0.3) * 0.1;
      for (const b of bumps) h += b.h * Math.exp(-((x - b.x) ** 2 + (z - b.z) ** 2) / (b.r * b.r));
      pos.setY(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, [size, seed]);
  return (
    <mesh geometry={geo} position={[0, y, 0]} receiveShadow>
      <meshPhysicalMaterial {...POLISH.stone} color={color} roughness={0.95} />
    </mesh>
  );
};

/** A glowing orb (lure, photophore, lamp) with a soft additive halo. */
export const Glow: React.FC<{ color: string; r?: number; position?: V3; intensity?: number; halo?: number }> = ({
  color,
  r = 0.08,
  position = [0, 0, 0],
  intensity = 1,
  halo = 6,
}) => {
  const core = useMemo(() => makeLumenMaterial(color, 2.4), [color]);
  const soft = useMemo(() => makeLumenMaterial(color, 1, 0.18), [color]);
  core.fog = false;
  soft.fog = false;
  core.color.set(color).multiplyScalar(0.2 + 2.4 * intensity);
  soft.opacity = 0.16 * intensity;
  return (
    <group position={position}>
      <mesh material={core}>
        <sphereGeometry args={[r, 20, 16]} />
      </mesh>
      <mesh material={soft}>
        <sphereGeometry args={[r * halo * 0.5, 20, 16]} />
      </mesh>
      {intensity > 0.02 && <pointLight color={color} intensity={6 * intensity} distance={r * 60} decay={2} />}
    </group>
  );
};
