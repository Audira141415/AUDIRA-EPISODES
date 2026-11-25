// Kinetic typography for the 2D motion layer (AbsoluteFill, not R3F).
//
// Seven deterministic text animation effects for TEXTVOYAGE, RETROWAVE, and text-heavy kits.
// Every effect is frame-based — no Date, no Math.random.
//
//   <KineticText text="Breaking News" frame={frame} fps={fps} effect="typewriter" fontSize={72} />
//   <KineticText text="Hello World" frame={frame} fps={fps} effect="wave" startSec={2} durSec={1.5} />

import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, smootherstep } from "../motion/easing.ts";

export type KineticEffect =
  | "typewriter"
  | "fadeWords"
  | "scaleUp"
  | "glitch"
  | "wave"
  | "splitReveal"
  | "bounceIn";

export type KineticTextProps = {
  text: string;
  frame: number;
  fps: number;
  effect?: KineticEffect;
  startSec?: number;
  durSec?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
  /** Seed for glitch RNG. */
  seed?: number;
};

function seededRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

function spring(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const freq = 3.5;
  const decay = 6;
  return 1 - Math.exp(-decay * t) * Math.cos(freq * Math.PI * t);
}

const baseStyle = (
  fontSize: number,
  fontFamily: string,
  color: string,
  align: React.CSSProperties["textAlign"],
): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
  fontFamily,
  fontSize,
  color,
  fontWeight: 600,
  textAlign: align,
  padding: "0 48px",
  lineHeight: 1.2,
  overflow: "hidden",
});

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  frame,
  fps,
  effect = "fadeWords",
  startSec = 0,
  durSec = 1.0,
  fontSize = 72,
  fontFamily = "Manrope, sans-serif",
  color = "#ffffff",
  align = "center",
  style,
  seed = 42,
}) => {
  const t = frame / fps;
  const raw = clamp((t - startSec) / durSec);
  const p = smootherstep(raw);

  const base: React.CSSProperties = { ...baseStyle(fontSize, fontFamily, color, align), ...style };

  switch (effect) {
    case "typewriter": {
      const visible = Math.floor(raw * (text.length + 1));
      const shown = text.slice(0, visible);
      const cursor = raw < 1 && Math.floor(frame * 2 / fps) % 2 === 0;
      return (
        <AbsoluteFill style={base}>
          <span>
            {shown}
            {cursor && <span style={{ opacity: 0.9 }}>|</span>}
          </span>
        </AbsoluteFill>
      );
    }

    case "fadeWords": {
      const words = text.split(/\s+/);
      const perWord = 1 / Math.max(words.length, 1);
      return (
        <AbsoluteFill style={{ ...base, flexWrap: "wrap", gap: `0 ${fontSize * 0.3}px` }}>
          {words.map((word, i) => {
            const wordStart = i * perWord;
            const wordP = smootherstep(clamp((raw - wordStart) / perWord));
            return (
              <span
                key={i}
                style={{
                  opacity: wordP,
                  transform: `translateY(${(1 - wordP) * 20}px)`,
                  display: "inline-block",
                }}
              >
                {word}
              </span>
            );
          })}
        </AbsoluteFill>
      );
    }

    case "scaleUp": {
      const s = spring(raw);
      return (
        <AbsoluteFill style={base}>
          <span
            style={{
              transform: `scale(${s})`,
              opacity: clamp(raw * 3),
              transformOrigin: "center",
              display: "inline-block",
            }}
          >
            {text}
          </span>
        </AbsoluteFill>
      );
    }

    case "glitch": {
      const rand = seededRand(seed + frame);
      const isGlitchFrame = rand() > 0.7 && raw > 0 && raw < 0.85;
      const offsetX = isGlitchFrame ? (rand() - 0.5) * fontSize * 0.3 : 0;
      const offsetY = isGlitchFrame ? (rand() - 0.5) * fontSize * 0.15 : 0;
      const skew = isGlitchFrame ? (rand() - 0.5) * 8 : 0;
      const splitR = isGlitchFrame ? (rand() - 0.5) * 4 : 0;
      const splitB = isGlitchFrame ? (rand() - 0.5) * 4 : 0;
      const mainOpacity = raw > 0 ? 1 : 0;

      return (
        <AbsoluteFill style={base}>
          {/* Red channel offset */}
          {isGlitchFrame && (
            <span
              style={{
                position: "absolute",
                color: "#ff0000",
                opacity: 0.5,
                transform: `translate(${splitR}px, ${-splitR}px)`,
                mixBlendMode: "screen",
              }}
            >
              {text}
            </span>
          )}
          {/* Blue channel offset */}
          {isGlitchFrame && (
            <span
              style={{
                position: "absolute",
                color: "#0000ff",
                opacity: 0.5,
                transform: `translate(${splitB}px, ${splitB}px)`,
                mixBlendMode: "screen",
              }}
            >
              {text}
            </span>
          )}
          <span
            style={{
              opacity: mainOpacity,
              transform: `translate(${offsetX}px, ${offsetY}px) skewX(${skew}deg)`,
              display: "inline-block",
            }}
          >
            {text}
          </span>
        </AbsoluteFill>
      );
    }

    case "wave": {
      const chars = text.split("");
      return (
        <AbsoluteFill style={{ ...base, flexWrap: "nowrap" }}>
          {chars.map((ch, i) => {
            const phase = i * 0.3;
            const waveT = t - startSec - phase * 0.05;
            const y = Math.sin(waveT * 4) * fontSize * 0.15 * clamp(raw * 2);
            const charOpacity = smootherstep(clamp((raw - i / (chars.length * 2)) * 2));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `translateY(${y}px)`,
                  opacity: charOpacity,
                  whiteSpace: "pre",
                }}
              >
                {ch}
              </span>
            );
          })}
        </AbsoluteFill>
      );
    }

    case "splitReveal": {
      const halfLen = Math.ceil(text.length / 2);
      const top = text.slice(0, halfLen);
      const bottom = text.slice(halfLen);
      const slide = (1 - p) * 100;
      return (
        <AbsoluteFill style={{ ...base, flexDirection: "column", gap: 0 }}>
          <span
            style={{
              display: "inline-block",
              transform: `translateY(-${slide}%)`,
              opacity: p,
              clipPath: "inset(0 0 0 0)",
            }}
          >
            {top}
          </span>
          <span
            style={{
              display: "inline-block",
              transform: `translateY(${slide}%)`,
              opacity: p,
              clipPath: "inset(0 0 0 0)",
            }}
          >
            {bottom}
          </span>
        </AbsoluteFill>
      );
    }

    case "bounceIn": {
      const chars = text.split("");
      const perChar = 1 / Math.max(chars.length, 1);
      return (
        <AbsoluteFill style={{ ...base, flexWrap: "nowrap" }}>
          {chars.map((ch, i) => {
            const charRaw = clamp((raw - i * perChar * 0.6) / (perChar * 2.5));
            const s = spring(charRaw);
            const y = (1 - s) * fontSize * 1.5;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `translateY(${y}px)`,
                  opacity: clamp(charRaw * 4),
                  whiteSpace: "pre",
                }}
              >
                {ch}
              </span>
            );
          })}
        </AbsoluteFill>
      );
    }

    default:
      return (
        <AbsoluteFill style={{ ...base, opacity: p }}>
          <span>{text}</span>
        </AbsoluteFill>
      );
  }
};
