// Dynamic karaoke subtitle: highlights words one by one in sync with the voiceover.
//
// Reads Cartesia word timestamps: [{ text, start, end }] (from voiceover.json or vo-words.json).
// Stays inside the safe area, uses minimum legible text size, and draws a plate behind the text
// so readability scores don't suffer. The current phrase auto-advances; past words dim, the active
// word highlights, future words wait at base opacity.
//
//   import words from "../../../public/audio/vo-words.json";
//   <Subtitle words={words} frame={frame} fps={fps} offset={voOffset} />

import React from "react";
import { AbsoluteFill } from "remotion";
import { useFormat } from "../film/format.ts";
import { FONT } from "../type/fonts.ts";
import { MIN_TEXT } from "./SafeLabel.tsx";

export type WordTiming = { text: string; start: number; end: number };

export type SubtitleProps = {
  words: readonly WordTiming[];
  /** Current frame number. */
  frame: number;
  /** Frames per second. */
  fps: number;
  /** VO offset in seconds (same value passed to <Voiceover>). */
  offset?: number;
  /** Max words per visible phrase line. */
  maxWords?: number;
  /** Font size in layout px (raised to format minimum if smaller). */
  size?: number;
  /** Active word colour. */
  activeColor?: string;
  /** Inactive word colour. */
  baseColor?: string;
  /** Plate background. false = stroke+shadow on bare frame. */
  plate?: boolean | string;
  /** Vertical position: "bottom" (default, above bottom safe), "top", or layout px from top. */
  position?: "bottom" | "top" | number;
};

export const Subtitle: React.FC<SubtitleProps> = ({
  words,
  frame,
  fps,
  offset = 0,
  maxWords = 8,
  size = 48,
  activeColor = "#ffffff",
  baseColor = "rgba(255,255,255,0.45)",
  plate = true,
  position = "bottom",
}) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const { safe, layout } = fmt;
  const font = Math.max(MIN_TEXT[fmt.kind], size);
  const pad = plate ? Math.round(font * 0.4) : 0;

  const currentTime = frame / fps;

  // Group words into phrases (split on pauses > 300ms or maxWords).
  const phrases = groupPhrases(words, maxWords, 0.3);

  // Find the active phrase: the one containing the current time.
  const activePhrase = phrases.find(
    (p) => currentTime >= p.start + offset && currentTime < p.end + offset + 0.3
  );
  if (!activePhrase) return null;

  // Position
  const y =
    position === "bottom"
      ? layout.height - safe.bottom - font * 1.4 - pad * 2
      : position === "top"
        ? safe.top + pad
        : position;
  const maxW = layout.width - safe.left - safe.right - pad * 2;

  const plateColor = typeof plate === "string" ? plate : "rgba(10, 12, 18, 0.78)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: (layout.width / 2) * s,
          top: y * s,
          transform: "translateX(-50%)",
          maxWidth: maxW * s,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `0 ${font * 0.4 * s}px`,
          fontFamily: FONT,
          fontSize: font * s,
          fontWeight: 700,
          lineHeight: 1.3,
          textAlign: "center",
          ...(plate
            ? {
                background: plateColor,
                padding: `${pad * s}px ${pad * 1.4 * s}px`,
                borderRadius: pad * 0.6 * s,
              }
            : {}),
        }}
      >
        {activePhrase.words.map((w, i) => {
          const wStart = w.start + offset;
          const wEnd = w.end + offset;
          const isActive = currentTime >= wStart && currentTime < wEnd;
          const isPast = currentTime >= wEnd;

          return (
            <span
              key={`${activePhrase.start}-${i}`}
              style={{
                color: isActive ? activeColor : isPast ? activeColor : baseColor,
                opacity: isActive ? 1 : isPast ? 0.92 : 0.8,
                transition: "none",
                ...(isActive
                  ? {
                      textShadow: `0 0 ${12 * s}px rgba(255,255,255,0.3)`,
                      transform: `scale(1.04)`,
                      display: "inline-block",
                    }
                  : {}),
                ...(!plate && !isActive
                  ? {
                      WebkitTextStroke: `${Math.max(1, font * 0.05) * s}px rgba(0,0,0,0.8)`,
                      paintOrder: "stroke fill" as const,
                      textShadow: `0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.7)`,
                    }
                  : {}),
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type Phrase = { words: WordTiming[]; start: number; end: number };

function groupPhrases(words: readonly WordTiming[], maxWords: number, pauseGap: number): Phrase[] {
  if (!words.length) return [];
  const result: Phrase[] = [];
  let current: WordTiming[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap >= pauseGap || current.length >= maxWords) {
      result.push({ words: current, start: current[0].start, end: current[current.length - 1].end });
      current = [words[i]];
    } else {
      current.push(words[i]);
    }
  }
  if (current.length) {
    result.push({ words: current, start: current[0].start, end: current[current.length - 1].end });
  }
  return result;
}
