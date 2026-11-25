import React, { useMemo } from "react";
import * as THREE from "three";
import { CHALK_PALETTE as C } from "../lib/palette";
import { createChalkDustMaterial } from "../lib/materials";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** A chalk stroke along a curve that draws itself on from `start` over `dur` film frames. */
export const ChalkStroke: React.FC<{
  points: [number, number, number][];
  color: string;
  f: number;
  start?: number;
  dur?: number;
  radius?: number;
}> = ({ points, color, f, start = 0, dur = 40, radius = 0.022 }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 6, false);
  }, [points, radius]);
  const mat = useMemo(() => createChalkDustMaterial(color), [color]);
  const count = geo.index ? geo.index.count : 0;
  const shown = Math.floor(clamp01((f - start) / dur) * count);
  geo.setDrawRange(0, shown - (shown % 3));
  return <mesh geometry={geo} material={mat} />;
};

/** Chalk atom: two electron orbits + nucleus, slowly turning in front of the board. */
export const QuantumDiagram3D: React.FC<{ f: number; position?: [number, number, number]; scale?: number }> = ({ f, position = [0, 0, 0], scale = 1 }) => {
  const rot = f * 0.02;
  const chalkCyan = useMemo(() => createChalkDustMaterial(C.chalkCyan), []);
  const chalkAmber = useMemo(() => createChalkDustMaterial(C.chalkAmber), []);
  const chalkRose = useMemo(() => createChalkDustMaterial(C.chalkRose), []);
  const e1 = rot * 2.2;
  const e2 = -rot * 1.7 + 1.4;
  return (
    <group position={position} scale={scale}>
      <group rotation={[rot * 0.4, rot, 0]}>
        <group rotation={[0.5, 0, 0]}>
          <mesh material={chalkCyan}>
            <torusGeometry args={[1.4, 0.03, 8, 64]} />
          </mesh>
          <mesh material={chalkCyan} position={[Math.cos(e1) * 1.4, Math.sin(e1) * 1.4, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
          </mesh>
        </group>
        <group rotation={[-0.5, 0.8, 0]}>
          <mesh material={chalkAmber}>
            <torusGeometry args={[1.4, 0.03, 8, 64]} />
          </mesh>
          <mesh material={chalkAmber} position={[Math.cos(e2) * 1.4, Math.sin(e2) * 1.4, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
          </mesh>
        </group>
        <mesh material={chalkRose}>
          <sphereGeometry args={[0.3, 20, 20]} />
        </mesh>
      </group>
    </group>
  );
};

// Hand-drawn wave packet and axes on the board (board-local coordinates, z = 0 is the slate).
const wave: [number, number, number][] = Array.from({ length: 28 }, (_, i) => {
  const x = -2.3 + (i / 27) * 2.0;
  return [x, -0.55 + Math.sin(i * 0.9) * 0.28 * Math.exp(-Math.pow((i - 14) / 8, 2)), 0.02];
});
const axisX: [number, number, number][] = [[-2.4, -0.95, 0.02], [-0.25, -0.93, 0.02]];
const axisY: [number, number, number][] = [[-2.38, -1.0, 0.02], [-2.36, 0.15, 0.02]];
const box: [number, number, number][] = [[1.0, -0.4, 0.02], [1.95, -0.38, 0.02], [1.93, -1.0, 0.02], [1.02, -1.02, 0.02], [1.0, -0.4, 0.02]];
const arrow: [number, number, number][] = [[-0.2, -0.5, 0.02], [0.35, -0.75, 0.02], [0.9, -0.68, 0.02]];

/** Procedural teacher's desk, used only if the GLB cannot load. */
const DeskBlock: React.FC = () => (
  <group>
    <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[2.4, 0.08, 1]} radius={0.02} />
      <meshPhysicalMaterial {...POLISH.stone} color="#7a4f2c" />
    </mesh>
    {[-1.05, 1.05].map((x) => (
      <mesh key={x} position={[x * 0.85, 0.53, 0]} castShadow>
        <RoundedBoxGeo args={[0.25, 1.06, 0.9]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.stone} color="#6a4426" />
      </mesh>
    ))}
  </group>
);

/** Classroom stage: slate board with self-drawing chalk, floating chalk atom, teacher's desk + globe. */
export const ChalkClassroom: React.FC<{ f: number }> = ({ f }) => {
  const grain = useSurfaceGrain(11, 0.3, 4);
  return (
    <group>
      {/* Floor + back wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3a2a1f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4, -2.2]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#2c3a35" roughness={0.95} />
      </mesh>

      {/* Chalkboard */}
      <group position={[0, 2.35, -2.05]}>
        <mesh position={[0, 0, -0.06]} castShadow>
          <RoundedBoxGeo args={[5.6, 3.1, 0.1]} radius={0.04} />
          <meshPhysicalMaterial {...POLISH.stone} color="#6b4a2e" />
        </mesh>
        <mesh>
          <planeGeometry args={[5.3, 2.8]} />
          <meshStandardMaterial color={C.slateBlack} roughness={0.95} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} />
        </mesh>
        {/* Ghost of an erased lesson */}
        <mesh position={[0.4, 0.2, 0.005]}>
          <planeGeometry args={[3.6, 1.6]} />
          <meshBasicMaterial color={C.dustGrey} transparent opacity={0.12} />
        </mesh>
        <ChalkStroke points={axisX} color={C.chalkWhite} f={f} start={10} dur={18} />
        <ChalkStroke points={axisY} color={C.chalkWhite} f={f} start={22} dur={18} />
        <ChalkStroke points={wave} color={C.chalkCyan} f={f} start={36} dur={60} />
        <ChalkStroke points={box} color={C.chalkAmber} f={f} start={90} dur={50} />
        <ChalkStroke points={arrow} color={C.chalkRose} f={f} start={150} dur={30} />
        {/* Chalk tray */}
        <mesh position={[0, -1.5, 0.08]} castShadow>
          <RoundedBoxGeo args={[5.4, 0.06, 0.18]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color="#5a3d25" />
        </mesh>
        {[[-1.6, C.chalkWhite], [-1.3, C.chalkCyan], [1.8, C.chalkAmber]].map(([x, col]) => (
          <mesh key={x as number} position={[x as number, -1.44, 0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 10]} />
            <meshPhysicalMaterial {...POLISH.clay} color={col as string} />
          </mesh>
        ))}
      </group>

      <QuantumDiagram3D f={f} position={[0.1, 3.0, -1.2]} scale={0.6} />

      {/* Teacher's desk + globe in the foreground */}
      {/* GLB is 1.40 × 0.78 × 0.70: at size 2.0 the desk top sits at y ≈ 1.11 */}
      <AssetModel id="teacher-s-desk-381eeb" size={2.0} ground polish="toyPlastic" position={[0.3, 0, 1.0]} fallback={<DeskBlock />} />
      <group position={[0.85, 1.11, 1.0]} rotation={[0, f * 0.012, 0]}>
        <AssetModel id="classroom-globe-16a96e" size={0.58} ground polish="toyPlastic" />
      </group>
    </group>
  );
};
