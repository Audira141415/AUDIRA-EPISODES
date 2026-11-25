// SafeLabel: a 2D label/title/callout that cannot break the readability rules audit:layout checks.
//
//   <SafeLabel x={120} y={260}>JULI 1324</SafeLabel>
//   <SafeLabel x={540} y={1300} align="center" size={56} role="title">EMAS MELIMPAH</SafeLabel>
//   <SafeLabel x={900} y={700} align="right" plate={false} color="#ffd36b">+3 KM</SafeLabel>
//
// Coordinates and sizes are layout pixels (1080 × 1920 for 9:16, 1920 × 1080 for 16:9; useFormat
// scales them to the render size). The label guarantees:
//   - glyph size never below the phone-legible minimum (36 px short / 28 px wide), whatever `size` says;
//   - it stays inside the safe area (9:16: top 180, bottom 380, sides 60): x/y are clamped and the
//     text wraps instead of running off the right edge, so it is never cropped or truncated;
//   - contrast: a dark plate behind the text by default; plate={false} draws a stroke + shadow instead,
//     for text sitting straight on the 3D frame.
// Measured by audit:layout like any other DOM text; nothing here is hidden from it.

import React from "react";
import { AbsoluteFill } from "remotion";
import { useFormat } from "../film/format.ts";
import { FONT } from "../type/fonts.ts";

export const MIN_TEXT = { short: 36, wide: 28 } as const;
const ROLE_SIZE = { caption: 44, label: 40, title: 64 } as const;

export type SafeLabelProps = {
  x: number;
  y: number;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  role?: keyof typeof ROLE_SIZE;
  /** Font size in layout px; raised to the format minimum when smaller. */
  size?: number;
  color?: string;
  weight?: number;
  /** Dark plate behind the text (default). false = stroke + shadow on the bare frame. */
  plate?: boolean | string;
  /** Max width in layout px (further limited by the safe area). */
  maxWidth?: number;
  opacity?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
};

export const SafeLabel: React.FC<SafeLabelProps> = ({
  x, y, children, align = "left", role = "label", size, color = "#ffffff", weight = 700,
  plate = true, maxWidth, opacity = 1, letterSpacing = 0, style,
}) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const { safe, layout } = fmt;
  const font = Math.max(MIN_TEXT[fmt.kind], size ?? ROLE_SIZE[role]);
  const pad = plate ? Math.round(font * 0.35) : 0;
  const lineH = font * 1.2 + pad * 2;
  // safe rectangle in layout px
  const L = safe.left, R = layout.width - safe.right, T = safe.top, B = layout.height - safe.bottom;
  const cx = Math.min(R, Math.max(L, x));
  const cy = Math.min(B - lineH, Math.max(T, y));
  // room to each side of the anchor inside the safe rectangle
  const room = align === "left" ? R - cx : align === "right" ? cx - L : 2 * Math.min(cx - L, R - cx);
  // never squeeze the text into a sliver next to the edge (it would wrap mid-word): keep at least
  // ~9 em of width and slide the box back inside the safe area instead
  const pref = Math.min(R - L, maxWidth ?? (R - L) * 0.85);
  const width = Math.max(Math.min(room, pref), Math.min(pref, font * 9));
  const anchored = align === "left" ? cx : align === "right" ? cx - width : cx - width / 2;
  const left = Math.min(R - width, Math.max(L, anchored));
  const plateColor = typeof plate === "string" ? plate : "rgba(10, 12, 18, 0.82)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: left * s,
          top: cy * s,
          width: width * s,
          display: "flex",
          justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: font * s,
            fontWeight: weight,
            lineHeight: 1.2,
            letterSpacing: letterSpacing * s,
            color,
            textAlign: align,
            whiteSpace: "normal",
            overflowWrap: "break-word",
            maxWidth: width * s,
            boxSizing: "border-box",
            ...(plate
              ? { background: plateColor, padding: `${pad * s}px ${pad * 1.4 * s}px`, borderRadius: pad * 0.6 * s }
              : { WebkitTextStroke: `${Math.max(1, font * 0.06) * s}px rgba(0,0,0,0.85)`, paintOrder: "stroke fill", textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.8)` }),
            ...style,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
