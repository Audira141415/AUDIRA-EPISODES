/**
 * 2D Motion Graphics Explainer Scene (Pure Remotion 2D without Three.js / WebGL)
 * 
 * Standard template for non-physical topics:
 * - News card / Viral facts
 * - Kinetic typography & quote cards
 * - Data visualizations & step-by-step infographics
 * - Financial / macroeconomic metric breakdowns
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface Explainer2DProps {
  title?: string;
  tagline?: string;
  metricLabel?: string;
  metricValue?: string;
  highlightText?: string;
  sourceText?: string;
}

export const Explainer2D: React.FC<Explainer2DProps> = ({
  title = "FAKTA UTAMA",
  tagline = "PERUBAHAN STRATEGIS TAHUN INI",
  metricLabel = "TOTAL PERTUMBUHAN",
  metricValue = "+148.5%",
  highlightText = "Lonjakan aktivitas transaksi dan adopsi terjadi serentak di 12 negara.",
  sourceText = "AUDIRA INTELLIGENCE DATA / 2026",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entrance Spring Transitions
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const cardY = interpolate(entranceSpring, [0, 1], [60, 0]);
  const cardOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // 2. Pulse / Telemetry Loop
  const pulse = Math.sin(frame * 0.08) * 0.04 + 1;
  const gridOffset = (frame * 0.8) % 40;

  // 3. Counter Progression
  const metricProgress = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0E14",
        color: "#F3F4F6",
        fontFamily: "'Space Grotesk', 'Manrope', sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 36px",
      }}
    >
      {/* LAYER 1: Background Ambient Glow & Kinetic Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 25%, rgba(45, 108, 223, 0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: `0px ${gridOffset}px`,
          opacity: 0.7,
        }}
      />

      {/* LAYER 2: Header HUD */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 12px #22C55E",
              transform: `scale(${pulse})`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              fontWeight: 600,
            }}
          >
            {title}
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.15em",
            color: "#6B7280",
            fontFamily: "monospace",
          }}
        >
          {sourceText}
        </span>
      </div>

      {/* LAYER 3: Main 2D Hero Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 10,
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#60A5FA",
            marginBottom: 12,
          }}
        >
          {tagline}
        </div>

        {/* Big Metric Display */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            background: "linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          {metricValue}
        </div>

        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.15em",
            color: "#94A3B8",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          {metricLabel}
        </div>

        {/* Highlight Quote Box */}
        <div
          style={{
            maxWidth: 480,
            backgroundColor: "rgba(30, 41, 59, 0.65)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: "#E2E8F0",
              margin: 0,
              fontWeight: 400,
            }}
          >
            {highlightText}
          </p>
        </div>
      </div>

      {/* LAYER 4: Bottom Telemetry Progress Bar */}
      <div
        style={{
          width: "100%",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#64748B",
            marginBottom: 8,
            fontFamily: "monospace",
          }}
        >
          <span>METRIC SYNC</span>
          <span>{Math.round(metricProgress * 100)}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${metricProgress * 100}%`,
              height: "100%",
              backgroundColor: "#3B82F6",
              boxShadow: "0 0 10px #3B82F6",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
