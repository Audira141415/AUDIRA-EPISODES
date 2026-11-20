// EP67 Borobudur — Kinetic HUD Overlay (Rule 09, Rule 19 & Anti-Monolithic Law)
// Displays animated metric callouts and act badges synchronized with the VO clock.

import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";

interface MetricCard {
  start: number;
  end: number;
  value: string;
  label: string;
  sublabel?: string;
}

const METRICS: MetricCard[] = [
  { start: 0.5,  end: 7.0,  value: "2.000.000",       label: "BLOK BATU ANDESIT",         sublabel: "TANPA SEMEN / PEREKAT" },
  { start: 7.5,  end: 15.5, value: "750 MASEHI",      label: "DINASTI SAILENDRA",         sublabel: "LEMBAH KEDU, JAWA TENGAH" },
  { start: 16.0, end: 25.5, value: "10 TINGKAT",      label: "STRUKTUR KOSMOLOGI",        sublabel: "6 PERSEGI · 3 LINGKAR · 1 INDUK" },
  { start: 26.0, end: 31.5, value: "2.672 RELIEF",    label: "PANEL UKIRAN BATU",         sublabel: "RENTANG 5,5 KILOMETER" },
  { start: 32.0, end: 42.5, value: "504 ARCA BUDDHA", label: "PENJURU MATA ANGIN",        sublabel: "KAMADHATU ➔ ARUPADHATU" },
  { start: 43.0, end: 50.5, value: "GUNUNG MERAPI",   label: "LETUSAN ABAD KE-10",        sublabel: "EKSODUS KE JAWA TIMUR" },
  { start: 51.0, end: 57.5, value: "700 TAHUN",       label: "TERKUBUR DI RIMBA",         sublabel: "HILANG DITELAN VEGETASI" },
  { start: 58.0, end: 70.0, value: "1814",            label: "THOMAS RAFFLES",            sublabel: "PENEMUAN DI HUTAN TROPIS" },
  { start: 70.5, end: 79.5, value: "UNESCO 1983",     label: "RESTORASI AKBAR 10 TAHUN",  sublabel: "PEMUGARAN TOTAL SEJARAH" },
  { start: 80.0, end: 92.0, value: "WARISAN DUNIA",   label: "SURAT PERADABAN ABADI",     sublabel: "DIBACA DUA BELAS ABAD KEMUDIAN" },
];

function getActBadge(t: number): { act: string; title: string; color: string } {
  if (t < 16) return { act: "BABAK 1/5", title: "PENDIRIAN 750 M", color: "#60A5FA" };
  if (t < 43) return { act: "BABAK 2/5", title: "MANDALA KOSMOLOGI", color: "#FBBF24" };
  if (t < 58) return { act: "BABAK 3/5", title: "LETUSAN & BENCANA", color: "#F87171" };
  if (t < 80) return { act: "BABAK 4/5", title: "PENEMUAN & RESTORASI", color: "#34D399" };
  return { act: "BABAK 5/5", title: "SURAT PERADABAN", color: "#F59E0B" };
}

export const BorobudurOverlay: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();

  const badge = getActBadge(t);
  const activeMetric = METRICS.find((m) => t >= m.start && t < m.end);

  // Card spring animation for appearance
  const cardRelativeFrame = activeMetric
    ? Math.max(0, Math.floor((t - activeMetric.start) * fps))
    : 0;

  const cardEntrance = spring({
    frame: cardRelativeFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const cardExitProgress = activeMetric
    ? interpolate(t, [activeMetric.end - 0.4, activeMetric.end], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const cardOpacity = cardEntrance * cardExitProgress;
  const cardTranslateY = interpolate(cardEntrance, [0, 1], [25, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* 1. TOP-LEFT ACT BADGE (Safe area: top 240px, left 48px) */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 48,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(15, 23, 42, 0.72)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 10,
          padding: "8px 16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: badge.color,
            textTransform: "uppercase",
          }}
        >
          {badge.act}
        </span>
        <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>·</span>
        <span
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#E2E8F0",
            textTransform: "uppercase",
          }}
        >
          {badge.title}
        </span>
      </div>

      {/* 2. TOP-RIGHT KINETIC METRIC CARD (Safe area: top 240px, right 48px) */}
      {activeMetric && (
        <div
          style={{
            position: "absolute",
            top: 240,
            right: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            opacity: cardOpacity,
            transform: `translateY(${cardTranslateY}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.78)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: 14,
              padding: "12px 20px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 32,
                fontWeight: 900,
                color: "#F8FAFC",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {activeMetric.value}
            </span>
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.14em",
                color: badge.color,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {activeMetric.label}
            </span>
            {activeMetric.sublabel && (
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                {activeMetric.sublabel}
              </span>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
