import React, { useMemo } from "react";
import { RoundedBoxGeo, POLISH } from "../../../core/polish/Polish";
import { FX_LAYER } from "../../../core/render/Post";
import { CHUTE, RAMPS, SHELF, SHELF_Y, Seg } from "../core/chain";
import { CHAINREACTION_PALETTE as P } from "../lib/palette";
import { pegboard, woodGrain } from "../lib/materials";

const WALL_Z = -0.36;

/** A plywood track whose top surface lies exactly on the simulated segment, with side rails. */
const Track: React.FC<{ seg: Seg; width?: number; seed: number; endStop?: boolean }> = ({ seg, width = 0.12, seed, endStop }) => {
  const dx = seg.b[0] - seg.a[0], dy = seg.b[1] - seg.a[1], len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  const th = 0.026;
  const grain = woodGrain(seed, [2, 0.3]);
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const sgn = ny < 0 ? -1 : 1;
  const cx = (seg.a[0] + seg.b[0]) / 2 - nx * sgn * (th / 2), cy = (seg.a[1] + seg.b[1]) / 2 - ny * sgn * (th / 2);
  // two dowels into the wall under the track
  const dowels = [0.2, 0.8].map((u) => [seg.a[0] + dx * u, seg.a[1] + dy * u - 0.03] as const);
  return (
    <group>
      <mesh position={[cx, cy, 0]} rotation={[0, 0, ang]} castShadow receiveShadow>
        <RoundedBoxGeo args={[len, th, width]} radius={0.006} />
        <meshPhysicalMaterial color={P.plywood} map={grain} {...POLISH.paper} roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx + nx * sgn * 0.022, cy + ny * sgn * 0.022, (s * width) / 2]} rotation={[0, 0, ang]} castShadow>
          <RoundedBoxGeo args={[len, 0.03, 0.012]} radius={0.004} />
          <meshPhysicalMaterial color={P.plyEdge} map={grain} roughness={0.6} clearcoat={0.3} />
        </mesh>
      ))}
      {endStop && (
        <mesh position={[seg.a[0] + (dx > 0 ? -0.012 : 0.012), seg.a[1] + 0.12, 0]} castShadow>
          <RoundedBoxGeo args={[0.024, 0.26, width + 0.02]} radius={0.006} />
          <meshPhysicalMaterial color={P.plyEdge} map={grain} roughness={0.6} />
        </mesh>
      )}
      {dowels.map(([x, y], i) => (
        <mesh key={i} position={[x, y - 0.01, (WALL_Z - width / 2) / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, -WALL_Z - width / 2 + 0.02, 12]} />
          <meshStandardMaterial color={P.bracket} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

/** Warm practical lights far behind the bench: bokeh balls once DOF is on. */
const Bokeh: React.FC = () => {
  const pts = useMemo(
    () => [
      [-2.6, 3.3, -2.4, 0.09], [-1.4, 3.9, -2.8, 0.07], [0.3, 4.2, -3.1, 0.1], [1.9, 3.6, -2.6, 0.08], [2.9, 2.7, -2.2, 0.06], [-3.1, 1.7, -2.0, 0.07],
    ] as const,
    [],
  );
  return (
    <>
      {pts.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} layers={FX_LAYER}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshBasicMaterial color={P.lamp} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

export const Workshop3D: React.FC = () => {
  const bench = woodGrain(3, [3, 1]);
  const shelfWood = woodGrain(9, [2, 0.4]);
  const peg = pegboard([60, 47]);
  return (
    <group>
      {/* bench top: y = 0 is the working surface */}
      <mesh position={[0.2, -0.045, 0.2]} receiveShadow>
        <RoundedBoxGeo args={[5.2, 0.09, 1.3]} radius={0.02} />
        <meshPhysicalMaterial color={P.bench} map={bench} roughness={0.55} clearcoat={0.35} clearcoatRoughness={0.4} />
      </mesh>
      {/* apron and drawer fronts under the top, so the frame bottom is furniture, not a void */}
      <mesh position={[0.2, -0.36, 0.8]} receiveShadow>
        <RoundedBoxGeo args={[5.1, 0.52, 0.06]} radius={0.015} />
        <meshPhysicalMaterial color="#5E3E25" map={bench} roughness={0.6} clearcoat={0.2} />
      </mesh>
      {[-1.2, 0.2, 1.6].map((x) => (
        <group key={x} position={[x, -0.36, 0.84]}>
          <mesh>
            <RoundedBoxGeo args={[1.2, 0.4, 0.03]} radius={0.01} />
            <meshPhysicalMaterial color="#6E4A2C" map={bench} roughness={0.55} clearcoat={0.25} />
          </mesh>
          <mesh position={[0, 0.06, 0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 10]} />
            <meshStandardMaterial color={P.brass} metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* pegboard wall */}
      <mesh position={[0.2, 2.2, WALL_Z - 0.02]} receiveShadow>
        <planeGeometry args={[6.4, 5]} />
        <meshStandardMaterial color={P.pegboard} map={peg} roughness={0.9} />
      </mesh>
      {/* shelf with two steel brackets */}
      <mesh position={[(SHELF.x0 + SHELF.x1) / 2, SHELF_Y - 0.02, WALL_Z + 0.24]} castShadow receiveShadow>
        <RoundedBoxGeo args={[SHELF.x1 - SHELF.x0, 0.04, 0.48]} radius={0.008} />
        <meshPhysicalMaterial color={P.plywood} map={shelfWood} roughness={0.6} clearcoat={0.2} />
      </mesh>
      {[SHELF.x0 + 0.18, SHELF.x1 - 0.18].map((x) => (
        <mesh key={x} position={[x, SHELF_Y - 0.14, WALL_Z + 0.12]} castShadow>
          <boxGeometry args={[0.02, 0.22, 0.22]} />
          <meshStandardMaterial color={P.bracket} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <Track seg={CHUTE} seed={21} width={0.1} />
      {RAMPS.map((r, i) => (
        <Track key={i} seg={r} seed={31 + i} endStop={!!r.closedStart} />
      ))}
      <Bokeh />
      {/* foreground props for depth: thread spool and a pencil on the bench */}
      <group position={[-0.95, 0, 0.62]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.14, 32]} />
          <meshPhysicalMaterial color="#2A9D8F" {...POLISH.fabric} />
        </mesh>
        {[0, 0.14].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <cylinderGeometry args={[0.095, 0.095, 0.02, 32]} />
            <meshPhysicalMaterial color={P.plywood} map={shelfWood} roughness={0.6} />
          </mesh>
        ))}
      </group>
      <mesh position={[1.9, 0.012, 0.55]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
        <meshPhysicalMaterial color="#F3A712" {...POLISH.toyPlastic} />
      </mesh>
    </group>
  );
};
