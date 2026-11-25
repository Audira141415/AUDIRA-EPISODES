// Kinetic HUD Data Callout — muncul saat narasi menyebut angka kunci.
// Pakai di setiap scene yang punya data metrik (rule 08: Anti-PPT, HUD Callout Wajib).

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFormat } from "../../core/film/format.ts";

export interface DataCalloutProps {
  value: string;
  label: string;
  sublabel?: string;
  startFrame: number;
  top?: number;
  left?: number;
  accentColor?: string;
}

export const DataCallout: React.FC<DataCalloutProps> = ({
  value,
  label,
  sublabel,
  startFrame,
  top = 480,
  left = 60,
  accentColor = "#0e7a67",
}) => {
  const frame = useCurrentFrame();
  const { scale } = useFormat();

  const elapsed = frame - startFrame;
  const opacity = interpolate(elapsed, [0, 10, 110, 120], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(elapsed, [0, 10], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (elapsed < 0 || elapsed > 120) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: top * scale,
        left: left * scale,
        opacity,
        transform: `translateY(${translateY * scale}px)`,
        background: "rgba(34,41,44,0.88)",
        borderLeft: `${5 * scale}px solid ${accentColor}`,
        borderRadius: 8 * scale,
        padding: `${14 * scale}px ${22 * scale}px`,
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ color: accentColor, fontSize: 13 * scale, fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color: "#f0ede6", fontSize: 38 * scale, fontFamily: "Inter, sans-serif", fontWeight: 900, lineHeight: 1.1, marginTop: 2 * scale }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ color: "rgba(240,237,230,0.6)", fontSize: 11 * scale, fontFamily: "Inter, sans-serif", marginTop: 4 * scale }}>
          {sublabel}
        </div>
      )}
    </div>
  );
};
