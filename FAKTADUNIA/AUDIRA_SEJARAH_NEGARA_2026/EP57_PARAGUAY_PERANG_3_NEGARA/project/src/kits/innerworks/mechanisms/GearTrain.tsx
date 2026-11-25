// INNERWORKS Gear Train — three meshed spur gears with real involute-style teeth (module 0.09),
// locked to their tooth ratios (24 : 15 : 30) and phased so the teeth interleave at every contact.
// Axes run along z, so the gear faces look at the camera.

import React, { useMemo } from "react";
import * as THREE from "three";
import { INNERWORKS_PALETTE as P } from "../lib/palette";
import { useSurfaceGrain } from "../../../core/polish/Polish";
import { driveAngle } from "../core/motion";

const MODULE = 0.09;
const THICK = 0.26;

type GearSpec = { teeth: number; pos: [number, number]; color: string; metal: number; rough: number; spokes: boolean };

/** Pitch radius of a gear with n teeth. */
const pitch = (n: number) => (n * MODULE) / 2;

function gearShape(n: number, spokes: boolean): THREE.Shape {
  const r = pitch(n);
  const ro = r + MODULE;
  const rr = r - 1.25 * MODULE;
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / n;
  for (let k = 0; k < n; k++) {
    const a = k * step;
    // root -> flank up -> tip land -> flank down (tooth centred on angle a)
    const pts: Array<[number, number]> = [
      [rr, a - step * 0.5],
      [rr, a - step * 0.3],
      [ro, a - step * 0.14],
      [ro, a + step * 0.14],
      [rr, a + step * 0.3],
    ];
    pts.forEach(([rad, ang], i) => {
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (k === 0 && i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.13, 0, Math.PI * 2, true);
  s.holes.push(bore);
  if (spokes) {
    const holes = 5;
    for (let i = 0; i < holes; i++) {
      const a = (i / holes) * Math.PI * 2;
      const h = new THREE.Path();
      h.absarc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.2, 0, Math.PI * 2, true);
      s.holes.push(h);
    }
  }
  return s;
}

const Gear: React.FC<{ spec: GearSpec; angle: number; grain: THREE.Texture }> = ({ spec, angle, grain }) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(gearShape(spec.teeth, spec.spokes), {
      depth: THICK,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 18,
    });
    g.translate(0, 0, -THICK / 2);
    return g;
  }, [spec.teeth, spec.spokes]);
  return (
    <group position={[spec.pos[0], spec.pos[1], 0]}>
      <mesh geometry={geo} rotation={[0, 0, angle]} castShadow receiveShadow>
        <meshPhysicalMaterial color={spec.color} metalness={spec.metal} roughness={spec.rough} roughnessMap={grain} clearcoat={0.3} clearcoatRoughness={0.25} />
      </mesh>
      {/* Hub + shaft into the back plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.25]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.9, 24]} />
        <meshPhysicalMaterial color={P.hardenedShaft} metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, THICK / 2 + 0.04]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 24]} />
        <meshPhysicalMaterial color={P.orangeAccent} roughness={0.42} clearcoat={0.45} clearcoatRoughness={0.3} />
      </mesh>
    </group>
  );
};

const A: [number, number] = [-0.83, 0.9];
const polar = (from: [number, number], dist: number, deg: number): [number, number] => [
  from[0] + Math.cos((deg * Math.PI) / 180) * dist,
  from[1] + Math.sin((deg * Math.PI) / 180) * dist,
];
const THETA_B = 35;
const THETA_C = -55;

export const GEARS = {
  drive: { teeth: 24, pos: A, color: P.brassGear, metal: 0.7, rough: 0.28, spokes: true } as GearSpec,
  pinion: { teeth: 15, pos: polar(A, pitch(24) + pitch(15), THETA_B), color: P.hardenedShaft, metal: 0.65, rough: 0.24, spokes: false } as GearSpec,
  output: { teeth: 30, pos: polar(A, pitch(24) + pitch(30), THETA_C), color: P.brassGear, metal: 0.7, rough: 0.284, spokes: true } as GearSpec,
};

/** Angle of a gear meshed with the drive gear at contact direction theta (deg), for drive angle a. */
const meshed = (n: number, thetaDeg: number, a: number) => {
  const th = (thetaDeg * Math.PI) / 180;
  const stepA = (Math.PI * 2) / 24;
  const a0 = ((th % stepA) + stepA) % stepA; // drive angle at which a drive tooth points at theta
  const phase = th + Math.PI - Math.PI / n; // driven gear shows a gap toward the drive gear at a0
  return phase - (a - a0) * (24 / n);
};

export const GearTrain: React.FC<{ f: number }> = ({ f }) => {
  const grain = useSurfaceGrain(11, 0.18, 2);
  const a = driveAngle(f);

  return (
    <group>
      <Gear spec={GEARS.drive} angle={a} grain={grain} />
      <Gear spec={GEARS.pinion} angle={meshed(15, THETA_B, a)} grain={grain} />
      <Gear spec={GEARS.output} angle={meshed(30, THETA_C, a)} grain={grain} />
      {/* Crank pin on the drive gear */}
      <mesh position={[A[0] + Math.cos(a + 0.6) * 0.62, A[1] + Math.sin(a + 0.6) * 0.62, THICK / 2 + 0.06]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 16]} />
        <meshPhysicalMaterial color={P.orangeAccent} roughness={0.42} clearcoat={0.45} />
      </mesh>
    </group>
  );
};
