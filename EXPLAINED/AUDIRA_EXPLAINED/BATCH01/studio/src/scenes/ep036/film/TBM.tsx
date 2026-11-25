// EP036 film: half-section of an EPB tunnel boring machine. Rotating cutterhead in front, pressure
// bulkhead, inclined screw conveyor, shield, segment erector, and the concrete lining rings erected
// right behind the shield, then the long train of backup gantries. Built along local +z
// (front = +z) and turned so the machine advances toward world +x; the half nearest the
// camera is cut away.

import React, { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { annularSector, pipe } from "../World.tsx";
import { P } from "../layout.ts";
import { Rings } from "./common.tsx";

export const TB = { R: 2.8, r: 2.42, shieldR: 3.05, len: 1.5, ringsBack: 26, shieldLen: 9, groundY: 7.5 };
/** keep the back half (local x > 0, world z < 0) plus a little of the floor */
const ARC: [number, number] = [Math.PI * 1.5 - 0.35, Math.PI * 2.5 + 0.02];

export type TbmState = { t: number; built: number; spin: number; glow: number };

const halfSoil = (withBore: boolean) => {
  const s = new Shape();
  const top = TB.groundY, bot = -9, w = 7;
  s.moveTo(0, top);
  s.lineTo(w, top);
  s.lineTo(w, bot);
  s.lineTo(0, bot);
  if (withBore) {
    s.lineTo(0, -TB.shieldR - 0.02);
    s.absarc(0, 0, TB.shieldR + 0.02, -Math.PI / 2, Math.PI / 2, false);
  }
  s.closePath();
  return s;
};

export const TbmSet: React.FC<{ s: TbmState }> = ({ s }) => {
  const ringZ0 = -60; // back end of the lining (local z)
  const front = ringZ0 + s.built * TB.len + TB.shieldLen + 0.6; // cutterhead face z
  const geo = useMemo(() => {
    const bore = new ExtrudeGeometry(halfSoil(true), { depth: 120, bevelEnabled: false, curveSegments: 48 });
    bore.translate(0, 0, -120);
    const solid = new ExtrudeGeometry(halfSoil(false), { depth: 40, bevelEnabled: false });
    const shield = new ExtrudeGeometry(annularSector(TB.shieldR, TB.shieldR - 0.18, ARC[0], ARC[1]), { depth: TB.shieldLen, bevelEnabled: false, curveSegments: 48 });
    const screw = pipe([[0.2, -2.1, -1.1], [0.4, -1.4, -3.5], [0.5, -0.4, -6.4]], 0.32);
    return { bore, solid, shield, screw };
  }, []);
  const spokes = 6;
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <hemisphereLight args={["#eef3f7", "#b9a68f", 0.8]} />
      <directionalLight position={[-20, 25, 10]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-far={120} shadow-bias={-0.0004} />
      <directionalLight position={[-10, 4, -20]} intensity={0.6} color="#dfe9f2" />
      {/* soil (half section) */}
      <mesh geometry={geo.bore} position={[0, 0, front + 0.3]} receiveShadow>
        <meshStandardMaterial color="#c4a073" roughness={0.95} />
      </mesh>
      <mesh geometry={geo.solid} position={[0, 0, front + 0.3]} receiveShadow>
        <meshStandardMaterial color="#c4a073" roughness={0.95} />
      </mesh>
      {/* strata bands on the cut plane */}
      {[
        [TB.groundY - 0.35, 0.7, "#6b6660"],
        [4.6, 0.5, "#bf9468"],
        [-6.5, 0.6, "#9a785c"],
      ].map(([y, h, c], i) => (
        <mesh key={i} position={[-0.01, y as number, -20]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[200, h as number]} />
          <meshStandardMaterial color={c as string} roughness={0.95} />
        </mesh>
      ))}
      {/* street on top */}
      <mesh position={[3.5, TB.groundY + 0.03, -20]} receiveShadow>
        <boxGeometry args={[7, 0.06, 200]} />
        <meshStandardMaterial color={P.asphalt} roughness={0.6} />
      </mesh>
      {/* lining built behind the shield; ring 0 is the oldest (back) */}
      <group position={[0, 0, ringZ0]} scale={[1, 1, -1]}>
        <Rings R={TB.R} r={TB.r} len={TB.len} n={Math.ceil(s.built)} z0={0} arc={ARC} glow={s.glow} built={s.built} />
      </group>
      {/* invert slab inside the finished lining */}
      <mesh position={[0, -2.1, (ringZ0 + front - TB.shieldLen) / 2]}>
        <boxGeometry args={[3.0, 0.3, front - TB.shieldLen - ringZ0]} />
        <meshStandardMaterial color="#bdb7ad" roughness={0.9} />
      </mesh>
      {/* the machine */}
      <group position={[0, 0, front]}>
        {/* cutterhead */}
        <group rotation={[0, 0, s.spin]}>
          <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[TB.shieldR + 0.05, TB.shieldR + 0.05, 0.35, 64]} />
            <meshStandardMaterial color="#5ea7dc" roughness={0.45} metalness={0.5} />
          </mesh>
          {Array.from({ length: spokes }, (_, i) => (
            <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / spokes) * 1.5, Math.sin((i * 2 * Math.PI) / spokes) * 1.5, 0.05]} rotation={[0, 0, (i * 2 * Math.PI) / spokes]} castShadow>
              <boxGeometry args={[3.0, 0.42, 0.25]} />
              <meshStandardMaterial color="#2f6f9f" roughness={0.4} metalness={0.6} />
            </mesh>
          ))}
          {Array.from({ length: 18 }, (_, i) => {
            const a = i * 2.4, r = 0.6 + (i % 6) * 0.42;
            return (
              <mesh key={`c${i}`} position={[Math.cos(a) * r, Math.sin(a) * r, 0.22]} rotation={[Math.PI / 2, 0, a]}>
                <cylinderGeometry args={[0.13, 0.13, 0.12, 16]} />
                <meshStandardMaterial color="#d9dadc" metalness={1} roughness={0.2} />
              </mesh>
            );
          })}
          <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.35, 0.5, 24]} />
            <meshStandardMaterial color="#d9dadc" metalness={1} roughness={0.2} />
          </mesh>
        </group>
        {/* shield + bulkhead */}
        <mesh geometry={geo.shield} position={[0, 0, -TB.shieldLen - 0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#c9ccd0" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[TB.shieldR - 0.1, TB.shieldR - 0.1, 0.12, 48, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#7f878e" roughness={0.5} metalness={0.6} side={2} />
        </mesh>
        <mesh geometry={geo.screw} castShadow>
          <meshStandardMaterial color={P.amber} roughness={0.4} metalness={0.4} />
        </mesh>
        {/* erector ring + arm */}
        <group position={[0, 0, -TB.shieldLen + 0.3]} rotation={[0, 0, s.t * 0.9]}>
          <mesh>
            <torusGeometry args={[0.8, 0.07, 10, 36]} />
            <meshStandardMaterial color={P.gasket} roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[1.25, 0, 0]}>
            <boxGeometry args={[0.7, 0.16, 0.3]} />
            <meshStandardMaterial color={P.gasket} roughness={0.4} />
          </mesh>
        </group>
        {/* backup gantries */}
        {Array.from({ length: 4 }, (_, i) => {
          const z = -TB.shieldLen - 8 - i * 5.2;
          return (
            <group key={i} position={[0, -0.6, z]}>
              {[-1, 1].map((sx) => (
                <mesh key={sx} position={[sx * 1.35, 0, 0]} castShadow>
                  <boxGeometry args={[0.14, 2.6, 4.4]} />
                  <meshStandardMaterial color="#e8e4dc" roughness={0.6} />
                </mesh>
              ))}
              <mesh position={[0, 1.25, 0]} castShadow>
                <boxGeometry args={[2.84, 0.14, 4.4]} />
                <meshStandardMaterial color="#e8e4dc" roughness={0.6} />
              </mesh>
              <mesh position={[0.4, 0.3, 0]} castShadow>
                <boxGeometry args={[1.2, 0.9, 2.6]} />
                <meshStandardMaterial color={i % 2 ? P.mint : P.amber} roughness={0.5} />
              </mesh>
            </group>
          );
        })}
        <pointLight position={[-1.0, 0.8, -4]} intensity={10} distance={12} decay={2} color="#fff0d2" />
      </group>
    </group>
  );
};
