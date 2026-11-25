// 3D bar chart for data-driven kits (DataPhysical, TradingTerminal, SatelliteBriefing, etc.)
//
// Each bar grows from 0 to its value over time, with optional labels and value text.
// Uses R3F geometry — no external library needed.
//
//   const data = [{ label: "Q1", value: 42, color: "#4488ff" }, ...];
//   <Bar3D data={data} frame={frame} fps={fps} maxHeight={8} />

import React, { useMemo } from "react";
import { Text } from "@react-three/drei";
import { clamp, smootherstep } from "../motion/easing.ts";
import { FONT } from "../type/fonts.ts";

export type BarDatum = {
  label: string;
  value: number;
  color?: string;
};

export type Bar3DProps = {
  data: readonly BarDatum[];
  frame: number;
  fps: number;
  /** Maximum bar height in world units. */
  maxHeight?: number;
  /** Bar width. */
  barWidth?: number;
  /** Gap between bars. */
  gap?: number;
  /** Stagger delay per bar in seconds. */
  stagger?: number;
  /** Growth animation duration per bar in seconds. */
  growDur?: number;
  /** Animation start time in seconds. */
  startSec?: number;
  /** Default bar colour. */
  baseColor?: string;
  /** Show value labels on top. */
  showValues?: boolean;
  /** Show category labels below. */
  showLabels?: boolean;
  position?: readonly [number, number, number];
};

export const Bar3D: React.FC<Bar3DProps> = ({
  data,
  frame,
  fps,
  maxHeight = 8,
  barWidth = 0.8,
  gap = 0.3,
  stagger = 0.1,
  growDur = 0.6,
  startSec = 0,
  baseColor = "#4488ff",
  showValues = true,
  showLabels = true,
  position = [0, 0, 0],
}) => {
  const t = frame / fps;
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const totalWidth = data.length * (barWidth + gap) - gap;
  const offsetX = -totalWidth / 2 + barWidth / 2;

  return (
    <group position={[...position]}>
      {data.map((d, i) => {
        const targetH = (d.value / maxVal) * maxHeight;
        const barStart = startSec + i * stagger;
        const progress = smootherstep(clamp((t - barStart) / growDur));
        const h = Math.max(0.01, targetH * progress);
        const x = offsetX + i * (barWidth + gap);
        const color = d.color ?? baseColor;

        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <boxGeometry args={[barWidth, h, barWidth * 0.6]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
            {showValues && progress > 0.1 && (
              <Text
                position={[0, h + 0.3, 0]}
                fontSize={0.35}
                color="#ffffff"
                anchorX="center"
                anchorY="bottom"
                font={FONT}
              >
                {Math.round(d.value * progress).toLocaleString()}
              </Text>
            )}
            {showLabels && (
              <Text
                position={[0, -0.4, 0]}
                fontSize={0.28}
                color="#aaaaaa"
                anchorX="center"
                anchorY="top"
                font={FONT}
                maxWidth={barWidth + gap * 0.5}
              >
                {d.label}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};
