import React from "react";
import { computeTradingTerminalState } from "../core/motion";
import { TRADINGTERMINAL_PALETTE } from "../lib/palette";
import { RoundedBoxGeo, surfaceGrain } from "../../../core/polish/Polish.tsx";

// Seeded brushed-metal grain for the bezel (cached, identical in every render tab).
const grain = surfaceGrain(41, 256, 0.25, 6);

const P = TRADINGTERMINAL_PALETTE;

/**
 * The terminal itself: a bevelled dark-metal monitor with a recessed screen, chart grid, and the
 * order-book depth walls in the lower band (bids green left, asks red right). At the breakout the
 * ask wall is absorbed (bars shrink) and the bid wall grows.
 */
export const OrderBookDepthWall3D: React.FC<{ f: number }> = ({ f }) => {
  const s = computeTradingTerminalState(f);
  const absorb = s.breakout;

  return (
    <group>
      {/* Monitor bezel (bevelled dark metal: the studio HDRI glints on its edges) */}
      <mesh position={[0, 0.6, -0.42]} receiveShadow>
        <RoundedBoxGeo args={[4.6, 4.2, 0.18]} radius={0.06} />
        <meshPhysicalMaterial color="#1A2029" metalness={0.85} roughness={0.32} clearcoat={0.4} clearcoatRoughness={0.25} roughnessMap={grain} bumpMap={grain} bumpScale={0.3} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.6, -0.32]} receiveShadow>
        <planeGeometry args={[4.3, 3.9]} />
        <meshStandardMaterial color={P.panelDark} roughness={0.55} metalness={0} />
      </mesh>

      {/* Chart grid (unlit, faint) */}
      {[-0.4, 0.0, 0.4, 0.8, 1.2, 1.6, 2.0].map((y) => (
        <mesh key={`h${y}`} position={[0, y, -0.3]}>
          <planeGeometry args={[4.1, 0.008]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} />
        </mesh>
      ))}
      {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
        <mesh key={`v${x}`} position={[x, 0.6, -0.3]}>
          <planeGeometry args={[0.008, 3.7]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.06} />
        </mesh>
      ))}

      {/* Bid depth wall (green, steps up toward the mid price) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const h = (0.18 + i * 0.1) * s.depthPulse * (1 + absorb * 0.35);
        return (
          <mesh key={`b${i}`} position={[-1.45 + i * 0.3, -0.62 + h / 2, -0.12]} castShadow>
            <RoundedBoxGeo args={[0.26, h, 0.1]} radius={0.015} />
            <meshPhysicalMaterial color={P.bullGreen} emissive={P.bullGreen} emissiveIntensity={0.28} transparent opacity={0.6} roughness={0.2} clearcoat={0.6} />
          </mesh>
        );
      })}
      {/* Ask depth wall (red, steps down toward the mid price): absorbed at the breakout */}
      {[0, 1, 2, 3, 4].map((i) => {
        const h = Math.max(0.02, (0.58 - i * 0.1) * s.depthPulse * (1 - absorb * 0.7));
        return (
          <mesh key={`a${i}`} position={[0.45 + i * 0.3, -0.62 + h / 2, -0.12]} castShadow>
            <RoundedBoxGeo args={[0.26, h, 0.1]} radius={0.015} />
            <meshPhysicalMaterial color={P.bearRed} emissive={P.bearRed} emissiveIntensity={0.28} transparent opacity={0.6} roughness={0.2} clearcoat={0.6} />
          </mesh>
        );
      })}
      {/* Mid-price divider between the walls */}
      <mesh position={[0.15, -0.35, -0.12]}>
        <planeGeometry args={[0.01, 0.6]} />
        <meshBasicMaterial color={P.cyanTelemetry} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
