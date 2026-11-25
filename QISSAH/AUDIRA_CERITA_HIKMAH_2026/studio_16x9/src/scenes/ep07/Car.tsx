// Jack's car: a rounded 1950s-style sedan in black lacquer with chrome trim. Local frame: forward
// = +x, up = +y, wheels on y = 0. Headlights cast real spot light forward.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Glow, NOIR } from "./World";

const L = 4.7, W = 1.86;

const chrome = { color: "#d9dde3", metalness: 1, roughness: 0.16 } as const;

let ghGeo: THREE.BufferGeometry | null = null;
const greenhouse = () => {
  if (ghGeo) return ghGeo;
  const sh = new THREE.Shape();
  sh.moveTo(0.95, 0.95);
  sh.lineTo(0.25, 1.47);
  sh.lineTo(-0.95, 1.47);
  sh.lineTo(-1.55, 0.95);
  sh.closePath();
  const depth = W - 0.42;
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 6 });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  ghGeo = g;
  return g;
};

/** Dashboard, steering wheel and seat for the shots inside the car (right-hand drive). */
const Interior: React.FC = () => (
  <group>
    <mesh position={[0.82, 1.0, 0]}>
      <RoundedBoxGeo args={[0.3, 0.16, W - 0.3]} radius={0.05} />
      <meshStandardMaterial color="#121214" roughness={0.6} />
    </mesh>
    <group position={[0.5, 1.05, 0.4]} rotation={[0, 0, 0.45]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.19, 0.018, 10, 32]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.4} />
      </mesh>
    </group>
    <mesh position={[0.92, 1.09, -0.2]}>
      <boxGeometry args={[0.04, 0.05, 0.35]} />
      <meshStandardMaterial color="#d8c9a0" emissive="#ffd9a0" emissiveIntensity={0.6} />
    </mesh>
    {/* bench seat */}
    <mesh position={[-0.3, 0.62, 0]}>
      <RoundedBoxGeo args={[0.6, 0.2, W - 0.4]} radius={0.06} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#2a2724" />
    </mesh>
    <mesh position={[-0.6, 0.92, 0]} rotation={[0, 0, 0.12]}>
      <RoundedBoxGeo args={[0.16, 0.6, W - 0.4]} radius={0.06} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#2a2724" />
    </mesh>
  </group>
);

const Wheel: React.FC<{ x: number; z: number; spin: number }> = ({ x, z, spin }) => (
  <group position={[x, 0.36, z]} rotation={[Math.PI / 2, 0, 0]}>
    <group rotation={[0, spin, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.26, 28]} />
        <meshStandardMaterial color="#09090a" roughness={0.82} />
      </mesh>
      <mesh position={[0, Math.sign(z) * 0.135, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.02, 24]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      {/* whitewall ring */}
      <mesh position={[0, Math.sign(z) * 0.131, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.23, 0.3, 28]} />
        <meshStandardMaterial color="#c9c6be" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  </group>
);

export const Car: React.FC<{
  /** distance travelled (m), drives wheel spin */
  dist?: number;
  headlights?: number;
  brake?: number;
  /** driver silhouette visible through the glass */
  driver?: boolean;
  /** see-through glass for shots inside the car */
  interior?: boolean;
}> = ({ dist = 0, headlights = 1, brake = 0, driver = true, interior = false }) => {
  const paint = useMemo(() => ({ ...POLISH.brickABS, color: "#16171a", metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 }), []);
  const target = useMemo(() => new THREE.Object3D(), []);
  const spin = -dist / 0.36;
  return (
    <group>
      {/* lower body */}
      <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[L, 0.62, W]} radius={0.24} segments={5} />
        <meshPhysicalMaterial {...paint} />
      </mesh>
      {/* fenders bulge */}
      {[1.45, -1.35].map((x) =>
        [1, -1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.62, s * (W / 2 - 0.08)]} scale={[1, 0.62, 0.32]} castShadow>
            <sphereGeometry args={[0.62, 24, 16]} />
            <meshPhysicalMaterial {...paint} />
          </mesh>
        )),
      )}
      {/* cabin: sloped greenhouse (raked windshield, fastback rear glass) + roof + pillars */}
      <mesh geometry={greenhouse()} castShadow={!interior}>
        <meshPhysicalMaterial color="#1a1f27" roughness={0.03} metalness={0.5} clearcoat={1} transparent={interior} opacity={interior ? 0.1 : 1} depthWrite={!interior} />
      </mesh>
      <mesh position={[-0.35, 1.5, 0]} castShadow={!interior}>
        <RoundedBoxGeo args={[1.22, 0.07, W - 0.26]} radius={0.03} />
        <meshPhysicalMaterial {...paint} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0.6, 1.21, s * (W / 2 - 0.15)]} rotation={[0, 0, 0.93]}>
            <boxGeometry args={[0.07, 0.88, 0.06]} />
            <meshPhysicalMaterial {...paint} />
          </mesh>
          <mesh position={[-1.25, 1.21, s * (W / 2 - 0.15)]} rotation={[0, 0, -0.86]}>
            <boxGeometry args={[0.14, 0.8, 0.06]} />
            <meshPhysicalMaterial {...paint} />
          </mesh>
          <mesh position={[-0.38, 1.21, s * (W / 2 - 0.15)]}>
            <boxGeometry args={[0.07, 0.54, 0.05]} />
            <meshPhysicalMaterial {...paint} />
          </mesh>
          {/* chrome sill */}
          <mesh position={[-0.3, 0.97, s * (W / 2 - 0.14)]}>
            <boxGeometry args={[2.5, 0.03, 0.03]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
        </group>
      ))}
      {/* driver silhouette (right-hand drive: facing +x, the right side is +z) */}
      {driver && !interior && (
        <group position={[-0.1, 1.08, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.15, 18, 14]} />
            <meshStandardMaterial color="#1e1a17" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.2, 0.2, 6, 12]} />
            <meshStandardMaterial color="#121316" roughness={0.9} />
          </mesh>
        </group>
      )}
      {interior && <Interior />}
      {/* driver's side mirror */}
      <group position={[0.78, 1.04, W / 2 + 0.06]}>
        <mesh position={[0, -0.05, -0.03]}>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2 + 0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 20]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
      </group>
      {/* chrome bumpers + side strip + grille */}
      <mesh position={[L / 2 + 0.04, 0.46, 0]}>
        <RoundedBoxGeo args={[0.16, 0.18, W + 0.06]} radius={0.07} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[-L / 2 - 0.04, 0.46, 0]}>
        <RoundedBoxGeo args={[0.16, 0.18, W + 0.06]} radius={0.07} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0.78, s * (W / 2 + 0.005)]}>
          <boxGeometry args={[L - 0.6, 0.035, 0.02]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
      ))}
      <mesh position={[L / 2 + 0.005, 0.68, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.9]} />
        <meshStandardMaterial {...chrome} roughness={0.3} />
      </mesh>
      {/* headlights */}
      {[1, -1].map((s) => (
        <group key={s} position={[L / 2 + 0.01, 0.74, s * 0.66]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.06, 20]} />
            <meshStandardMaterial color="#fff6e6" emissive="#fff3dc" emissiveIntensity={10 * headlights} />
          </mesh>
          <Glow pos={[0.12, 0, 0]} color="#fff1d8" size={1.4} opacity={0.75 * headlights} />
        </group>
      ))}
      <primitive object={target} position={[14, 0, 0]} />
      <spotLight
        position={[L / 2, 0.75, 0]}
        target={target}
        color="#fff1d8"
        intensity={120 * headlights}
        distance={30}
        angle={0.42}
        penumbra={0.6}
        decay={2}
      />
      {/* tail lights (deep red: they glow harder on the brake) */}
      {[1, -1].map((s) => (
        <group key={s} position={[-L / 2 - 0.01, 0.74, s * 0.7]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#5a0b10" emissive={NOIR.red} emissiveIntensity={2 + brake * 10} />
          </mesh>
          <Glow pos={[-0.1, 0, 0]} color={NOIR.red} size={0.5 + brake * 0.9} opacity={0.6} />
        </group>
      ))}
      {[1.45, -1.35].map((x) => [1, -1].map((s) => <Wheel key={`${x}${s}`} x={x} z={s * (W / 2 - 0.12)} spin={spin} />))}
      {/* contact shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[L + 0.4, W + 0.3]} />
        <meshBasicMaterial color="#000" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </group>
  );
};
