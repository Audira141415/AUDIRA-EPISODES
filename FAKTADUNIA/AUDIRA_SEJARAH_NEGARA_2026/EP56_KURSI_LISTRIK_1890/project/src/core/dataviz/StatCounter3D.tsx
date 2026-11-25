// Animated 3D stat counter — a number that rolls up from 0 to its target value.
//
// Renders as a Text node in R3F space. Commonly used with Bar3D or standalone for
// hero statistics in DataPhysical, TradingTerminal, SatelliteBriefing kits.
//
//   <StatCounter3D value={1_200_000} label="Users" frame={frame} fps={fps} />

import React from "react";
import { Text } from "@react-three/drei";
import { clamp, smootherstep } from "../motion/easing.ts";
import { FONT } from "../type/fonts.ts";

export type StatCounter3DProps = {
  value: number;
  label?: string;
  frame: number;
  fps: number;
  startSec?: number;
  durSec?: number;
  /** Format: "number" (locale string), "compact" (1.2M), "percent" (0–1 → %). */
  format?: "number" | "compact" | "percent";
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  labelSize?: number;
  color?: string;
  labelColor?: string;
  position?: readonly [number, number, number];
};

function formatValue(v: number, fmt: string, prefix: string, suffix: string): string {
  let str: string;
  if (fmt === "compact") {
    if (v >= 1_000_000_000) str = (v / 1_000_000_000).toFixed(1) + "B";
    else if (v >= 1_000_000) str = (v / 1_000_000).toFixed(1) + "M";
    else if (v >= 1_000) str = (v / 1_000).toFixed(1) + "K";
    else str = Math.round(v).toLocaleString();
  } else if (fmt === "percent") {
    str = (v * 100).toFixed(1) + "%";
  } else {
    str = Math.round(v).toLocaleString();
  }
  return prefix + str + suffix;
}

export const StatCounter3D: React.FC<StatCounter3DProps> = ({
  value,
  label,
  frame,
  fps,
  startSec = 0,
  durSec = 1.0,
  format = "number",
  prefix = "",
  suffix = "",
  fontSize = 1.2,
  labelSize = 0.4,
  color = "#ffffff",
  labelColor = "#aaaaaa",
  position = [0, 0, 0],
}) => {
  const t = frame / fps;
  const progress = smootherstep(clamp((t - startSec) / durSec));
  const current = value * progress;
  const display = formatValue(current, format, prefix, suffix);

  return (
    <group position={[...position]}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={FONT}
      >
        {display}
      </Text>
      {label && (
        <Text
          position={[0, -fontSize * 0.8, 0]}
          fontSize={labelSize}
          color={labelColor}
          anchorX="center"
          anchorY="top"
          font={FONT}
        >
          {label}
        </Text>
      )}
    </group>
  );
};
