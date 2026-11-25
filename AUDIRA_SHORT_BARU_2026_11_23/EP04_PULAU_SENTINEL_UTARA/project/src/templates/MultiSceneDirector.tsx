/**
 * AUDIRA Multi-Scene Director Template (Rule 09, Rule 19 & Anti-Monolithic Law)
 * 
 * Mandated pattern for all AUDIRA videos (60–95 seconds):
 * - Divides the video into 4 to 6 distinct visual beats (Scene 1 to Scene 6).
 * - Switches active 3D/2D visual scenes when the narration topic changes.
 * - Displays kinetic HUD callouts for key metrics, numbers, and facts.
 * - Prevents monolithic single-object idle cameras.
 */

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitle } from "../core/hud/Subtitle.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";

export interface SceneBeat {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  title: string;
  metricValue?: string;
  metricLabel?: string;
  content: React.ReactNode;
}

export interface MultiSceneDirectorProps {
  totalSeconds: number;
  scenes: SceneBeat[];
  words?: any[];
  channelHandle?: string;
  signatureSeed?: string;
  outroSeconds?: number;
}

export const MultiSceneDirector: React.FC<MultiSceneDirectorProps> = ({
  totalSeconds,
  scenes,
  words = [],
  channelHandle = "@AUDIRA",
  signatureSeed = "audira-ep",
  outroSeconds = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // 1. Identify active scene beat
  const activeScene = scenes.find((s) => t >= s.start && t < s.end) || scenes[scenes.length - 1];

  // 2. Scene entrance spring
  const sceneRelativeFrame = Math.max(0, Math.floor((t - (activeScene?.start ?? 0)) * fps));
  const entrance = spring({
    frame: sceneRelativeFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const cardY = interpolate(entrance, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 3D / 2D Visual Layer (Switches dynamically per beat) */}
      <AbsoluteFill>
        {activeScene?.content}
      </AbsoluteFill>

      {/* 2D HUD KINETIC CALLOUT (Appears when metricValue exists) */}
      {activeScene?.metricValue && (
        <div
          style={{
            position: "absolute",
            top: 240,
            right: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
            zIndex: 80,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              backdropFilter: "blur(12px)",
              borderRadius: 12,
              padding: "10px 18px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 900,
                color: "#60A5FA",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {activeScene.metricValue}
            </span>
            {activeScene.metricLabel && (
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                {activeScene.metricLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SUBTITLE & AUDIO CLOCK OVERLAY */}
      {words.length > 0 && (
        <Subtitle words={words} frame={frame} fps={fps} offset={0} />
      )}

      {/* SIGNATURE & OUTRO */}
      <AudiraSignature seed={signatureSeed} handle={channelHandle} />
      <AudiraOutro seconds={outroSeconds} />
    </AbsoluteFill>
  );
};
