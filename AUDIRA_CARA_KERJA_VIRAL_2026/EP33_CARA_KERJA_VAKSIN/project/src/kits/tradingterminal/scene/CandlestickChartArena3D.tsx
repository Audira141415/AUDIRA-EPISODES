import React from "react";
import { CANDLES, LIVE_OPEN, RESISTANCE_Y, candleX, computeTradingTerminalState } from "../core/motion";
import { TRADINGTERMINAL_PALETTE } from "../lib/palette";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";

const P = TRADINGTERMINAL_PALETTE;
const BODY_W = 0.24;
const BODY_D = 0.12;

/** Glossy acrylic candle body: emissive so bloom catches it, clearcoat so the studio HDRI glints on it. */
const CandleBody: React.FC<{ x: number; from: number; to: number; color: string; glow: number }> = ({ x, from, to, color, glow }) => {
  const h = Math.max(0.02, Math.abs(to - from));
  return (
    <mesh position={[x, (from + to) / 2, 0]} castShadow>
      <RoundedBoxGeo args={[BODY_W, h, BODY_D]} radius={0.02} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.25} clearcoat={0.8} clearcoatRoughness={0.1} metalness={0} />
    </mesh>
  );
};

const Wick: React.FC<{ x: number; lo: number; hi: number; color: string }> = ({ x, lo, hi, color }) => (
  <mesh position={[x, (lo + hi) / 2, 0]}>
    <cylinderGeometry args={[0.011, 0.011, Math.max(0.001, hi - lo), 8]} />
    <meshBasicMaterial color={color} toneMapped={false} />
  </mesh>
);

/** Candle history (prints one by one), the live breakout candle, the resistance and price lines. */
export const CandlestickChartArena3D: React.FC<{ f: number }> = ({ f }) => {
  const s = computeTradingTerminalState(f);
  const liveX = candleX(CANDLES.length);

  return (
    <group>
      {CANDLES.map((c, i) => {
        const p = s.print[i];
        if (p <= 0.001) return null;
        const bull = c.c >= c.o;
        const col = bull ? P.bullGreen : P.bearRed;
        const close = c.o + (c.c - c.o) * p;
        return (
          <group key={i}>
            <Wick x={candleX(i)} lo={c.o + (c.lo - c.o) * p} hi={c.o + (c.hi - c.o) * p} color={col} />
            <CandleBody x={candleX(i)} from={c.o} to={close} color={col} glow={0.45} />
          </group>
        );
      })}

      {s.liveIn > 0.001 ? (
        <group>
          <Wick x={liveX} lo={LIVE_OPEN - 0.05} hi={s.liveHigh} color={P.bullGreen} />
          <CandleBody x={liveX} from={LIVE_OPEN} to={s.liveClose} color={P.bullGreen} glow={0.6 + s.breakout * 0.9} />
        </group>
      ) : null}

      {/* Amber resistance line: dashed, flashes when the price crosses it */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-1.8 + i * 0.22, RESISTANCE_Y, 0.02]}>
          <planeGeometry args={[0.13, 0.016 + s.crossFlash * 0.02]} />
          <meshBasicMaterial color={P.neutralAmber} toneMapped={false} transparent opacity={0.75 + s.crossFlash * 0.25} />
        </mesh>
      ))}

      {/* Cyan laser price line tracks the live close */}
      <mesh position={[0.2, s.liveClose, 0.03]} visible={s.liveIn > 0.01}>
        <planeGeometry args={[4.0, 0.014]} />
        <meshBasicMaterial color={P.cyanTelemetry} toneMapped={false} transparent opacity={0.85 * s.liveIn} />
      </mesh>
    </group>
  );
};
