// Wooden toys: gasing (spinning top), a pull-along car, a stacking-ring tower, letter blocks with a
// carved raised letter on the front, and the carver's chisel and mallet. Painted parts keep the wood
// grain in the bump; bare parts show the grain in colour.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { UKIR_PALETTE as P, type Species } from "../lib/palette.ts";
import { letterRelief } from "../lib/relief.ts";
import { paintFinish, woodFinish, woodTexture } from "../lib/wood.ts";
import { ReliefPanel3D } from "./ReliefPanel3D.tsx";

type V3 = [number, number, number];

const Wood: React.FC<{ species?: Species; seed?: number; oiled?: boolean; repeat?: [number, number] }> = ({ species = "jati", seed = 1, oiled = true, repeat }) => {
  const { map, bump } = woodTexture(species, seed);
  const m = useMemo(() => {
    if (!repeat) return map;
    const c = map.clone();
    c.repeat.set(...repeat);
    c.needsUpdate = true;
    return c;
  }, [map, repeat?.[0], repeat?.[1]]);
  return <meshPhysicalMaterial map={m} bumpMap={bump} bumpScale={0.6} {...woodFinish(oiled)} />;
};
const Paint: React.FC<{ color: string; seed?: number }> = ({ color, seed = 2 }) => {
  const { bump } = woodTexture("pinus", seed);
  return <meshPhysicalMaterial color={color} bumpMap={bump} bumpScale={0.35} {...paintFinish} />;
};

// --- Gasing -------------------------------------------------------------------------------------
/** Spinning top profile (radius, height) from the iron tip up to the knob. */
const TOP_PROFILE: [number, number][] = [
  [0.0, 0.0], [0.006, 0.004], [0.02, 0.018], [0.05, 0.045], [0.078, 0.07], [0.088, 0.085], [0.084, 0.1],
  [0.06, 0.112], [0.03, 0.118], [0.022, 0.13], [0.024, 0.15], [0.016, 0.165], [0.0, 0.168],
];
const BANDS = [P.paintRed, P.paintCream, P.paintGreen, P.paintYellow, P.paintRed, P.paintCream];

export const Gasing: React.FC<{ position: V3; spin: number; tilt: number; prec: number }> = ({ position, spin, tilt, prec }) => {
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(TOP_PROFILE.map(([r, h]) => new THREE.Vector2(r, h)), 48);
    const col = new Float32Array(g.attributes.position.count * 3);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const a = Math.atan2(pos.getZ(i), pos.getX(i));
      // Horizontal bands with a painted zig-zag between two of them (reads as spin).
      const zig = Math.abs(((a / (Math.PI * 2)) * 12) % 1 - 0.5) * 0.012;
      const band = y < 0.012 ? -1 : Math.min(BANDS.length - 1, Math.floor(((y - 0.012 + zig) / 0.156) * BANDS.length));
      const c = new THREE.Color(band < 0 ? "#3a3f45" : BANDS[band]);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  const { bump } = woodTexture("sawo", 4);
  return (
    <group position={position} rotation={[0, prec, 0]}>
      <group rotation={[tilt, 0, 0]}>
        <mesh geometry={geo} rotation={[0, spin, 0]} castShadow>
          <meshPhysicalMaterial vertexColors bumpMap={bump} bumpScale={0.3} {...paintFinish} />
        </mesh>
      </group>
    </group>
  );
};

// --- Car ----------------------------------------------------------------------------------------
export const WoodCar: React.FC<{ position: V3; roll: number; heading?: number }> = ({ position, roll, heading = Math.PI / 2 }) => (
  <group position={position} rotation={[0, heading, 0]}>
    <mesh position={[0, 0.085, 0]} castShadow>
      <RoundedBoxGeo args={[0.17, 0.08, 0.34]} radius={0.025} />
      <Wood species="mahoni" seed={6} />
    </mesh>
    <mesh position={[0, 0.15, -0.03]} castShadow>
      <RoundedBoxGeo args={[0.14, 0.07, 0.15]} radius={0.025} />
      <Paint color={P.paintYellow} />
    </mesh>
    {/* Windows: shallow dark insets */}
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.0705, 0.155, -0.03]} rotation={[0, (s * Math.PI) / 2, 0]}>
        <planeGeometry args={[0.1, 0.04]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.7} />
      </mesh>
    ))}
    {[[-1, 0.1], [1, 0.1], [-1, -0.1], [1, -0.1]].map(([s, z], i) => (
      <group key={i} position={[s * 0.095, 0.05, z]} rotation={[roll, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 28]} />
          <Wood species="sonokeling" seed={8 + i} />
        </mesh>
        <mesh position={[s * 0.016, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.004, 12]} />
          <Paint color={P.paintRed} />
        </mesh>
      </group>
    ))}
    {/* Pull string ring */}
    <mesh position={[0, 0.07, 0.18]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.014, 0.004, 8, 16]} />
      <meshStandardMaterial color="#2a1a10" roughness={0.6} />
    </mesh>
  </group>
);

// --- Stacking rings -----------------------------------------------------------------------------
export const RingTower: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
      <Wood species="jati" seed={11} />
    </mesh>
    <mesh position={[0, 0.17, 0]} castShadow>
      <cylinderGeometry args={[0.013, 0.013, 0.3, 12]} />
      <Wood species="pinus" seed={12} />
    </mesh>
    {[P.paintRed, P.paintYellow, P.paintGreen, P.paintBlue].map((c, i) => (
      <mesh key={i} position={[0, 0.055 + i * 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.085 - i * 0.015, 0.024, 14, 36]} />
        <Paint color={c} seed={i} />
      </mesh>
    ))}
    <mesh position={[0, 0.33, 0]} castShadow>
      <sphereGeometry args={[0.028, 20, 14]} />
      <Paint color={P.paintRed} />
    </mesh>
  </group>
);

// --- Letter block -------------------------------------------------------------------------------
export const LetterBlock: React.FC<{ ch: string; size: number; position: V3; rotation?: V3; color: string; oil?: number }> = ({ ch, size, position, rotation, color, oil = 1 }) => {
  const relief = letterRelief(ch);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[size, size, size]} radius={size * 0.08} />
        <Wood species="pinus" seed={ch.charCodeAt(0)} />
      </mesh>
      {/* Front: the background is cut down to the block face and painted; the letter stays bare wood */}
      <ReliefPanel3D relief={relief} size={[size * 0.86, size * 0.86]} position={[0, 0, size / 2 + size * 0.06]} depth={size * 0.06} reveal={1} oil={oil} species="pinus" seed={ch.charCodeAt(0)} detail={160} slab={false} paint={color} />
    </group>
  );
};

// --- Tools --------------------------------------------------------------------------------------
/** Chisel (pahat): tip at the origin, handle up along +y. */
export const Chisel: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({ position, rotation, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.06, 0]} castShadow>
      <boxGeometry args={[0.022, 0.12, 0.006]} />
      <meshPhysicalMaterial color={P.steel} metalness={0.95} roughness={0.28} clearcoat={0.3} />
    </mesh>
    <mesh position={[0, 0.003, 0]} rotation={[0.4, 0, 0]}>
      <boxGeometry args={[0.022, 0.012, 0.004]} />
      <meshPhysicalMaterial color="#e8ecef" metalness={1} roughness={0.12} />
    </mesh>
    <mesh position={[0, 0.125, 0]} castShadow>
      <cylinderGeometry args={[0.012, 0.012, 0.016, 16]} />
      <meshPhysicalMaterial color="#c9a26a" metalness={0.9} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.017, 0.014, 0.14, 20]} />
      <Wood species="sonokeling" seed={21} />
    </mesh>
  </group>
);

/** Wooden mallet (palu kayu): pivot at the end of the handle; head swings around it. */
export const Mallet: React.FC<{ position?: V3; rotation?: V3 }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.013, 0.015, 0.28, 16]} />
      <Wood species="sawo" seed={22} />
    </mesh>
    <mesh position={[0, 0, 0.3]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.13, 28]} />
      <Wood species="sonokeling" seed={23} />
    </mesh>
  </group>
);
