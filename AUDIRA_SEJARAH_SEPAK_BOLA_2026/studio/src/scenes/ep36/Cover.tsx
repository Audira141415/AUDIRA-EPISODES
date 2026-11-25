// EP36 Cover (BRUTALFORGE): "Borussia Dortmund — Tembok Kuning & Gegenpressing"
// Visual: neobrutalist poster — BVB yellow wall, offset hard shadows, Klopp gegenpressing energy.
// Pure 2D (no ThreeCanvas). BRUTALFORGE palette: neoYellow + inkBlack + hotPink.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

// BRUTALFORGE palette
const NEO_YELLOW = "#FFE600";
const INK_BLACK = "#0B0C10";
const HOT_PINK = "#FF3864";
const PURE_WHITE = "#FFFFFF";

const W = 1080;
const H = 1920;

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ width: W, height: H, background: NEO_YELLOW, overflow: "hidden", fontFamily: ANTON }}>

    {/* Brutal background grid of thin black lines */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
      {Array.from({ length: 24 }, (_, i) => (
        <line key={`v${i}`} x1={i * 46} y1={0} x2={i * 46} y2={H} stroke={INK_BLACK} strokeWidth={1} />
      ))}
      {Array.from({ length: 42 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 46} x2={W} y2={i * 46} stroke={INK_BLACK} strokeWidth={1} />
      ))}
    </svg>

    {/* Top bar: episode badge */}
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 110,
      background: INK_BLACK,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 56,
      paddingRight: 56,
    }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: NEO_YELLOW, letterSpacing: 4 }}>
        SEJARAH SEPAK BOLA
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: HOT_PINK, letterSpacing: 2 }}>
        #36
      </div>
    </div>

    {/* Hard drop shadow block — the defining brutalforge move */}
    {/* Shadow of main card */}
    <div style={{
      position: "absolute",
      top: 196 + 12,
      left: 56 + 12,
      right: 56 - 12,
      height: 760,
      background: INK_BLACK,
    }} />

    {/* Main yellow card */}
    <div style={{
      position: "absolute",
      top: 196,
      left: 56,
      right: 56,
      height: 760,
      background: NEO_YELLOW,
      border: `6px solid ${INK_BLACK}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingLeft: 44,
      paddingRight: 44,
      overflow: "hidden",
    }}>
      {/* Club label */}
      <div style={{
        fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 6,
        color: INK_BLACK, background: HOT_PINK, padding: "4px 16px", marginBottom: 20,
      }}>
        BORUSSIA DORTMUND
      </div>

      {/* Hero text: TEMBOK */}
      <div style={{ fontSize: 198, lineHeight: 0.88, color: INK_BLACK, letterSpacing: -4 }}>
        TEMBOK
      </div>
      {/* KUNING on yellow = needs outline or color shift */}
      <div style={{ fontSize: 198, lineHeight: 0.88, color: INK_BLACK, letterSpacing: -4, WebkitTextStroke: `4px ${INK_BLACK}` }}>
        KUNING
      </div>

      {/* Sticker: 25.000 */}
      <div style={{
        marginTop: 32,
        display: "inline-block",
        background: INK_BLACK,
        color: NEO_YELLOW,
        fontFamily: MONO, fontWeight: 800,
        fontSize: 48,
        padding: "8px 24px",
        transform: "rotate(-2deg)",
        letterSpacing: 2,
      }}>
        SÜDTRIBÜNE · 25.000
      </div>
    </div>

    {/* GEGENPRESSING block — hot pink card below */}
    {/* Shadow */}
    <div style={{
      position: "absolute",
      top: 1000 + 10,
      left: 56 + 10,
      right: 56 - 10,
      height: 180,
      background: INK_BLACK,
    }} />
    {/* Card */}
    <div style={{
      position: "absolute",
      top: 1000,
      left: 56,
      right: 56,
      height: 180,
      background: HOT_PINK,
      border: `6px solid ${INK_BLACK}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingLeft: 44,
    }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: INK_BLACK, letterSpacing: 6, marginBottom: 6 }}>
        FILOSOFI KLOPP
      </div>
      <div style={{ fontSize: 112, color: INK_BLACK, lineHeight: 0.9, letterSpacing: -2 }}>
        GEGENPRESS
      </div>
    </div>

    {/* Stats row */}
    <div style={{
      position: "absolute",
      top: 1226,
      left: 56,
      right: 56,
      display: "flex",
      gap: 16,
    }}>
      {[
        { n: "2×", label: "BUNDESLIGA\n2011–12" },
        { n: "CL", label: "FINAL\n2013" },
        { n: "11", label: "KLOPP\nTAHUN" },
      ].map((s, i) => (
        <div key={i} style={{
          flex: 1,
          background: INK_BLACK,
          border: `4px solid ${INK_BLACK}`,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div style={{ fontSize: 72, color: NEO_YELLOW, lineHeight: 1 }}>{s.n}</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: PURE_WHITE, textAlign: "center", letterSpacing: 2, marginTop: 6, whiteSpace: "pre-line" }}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* Bundesliga years accent */}
    <div style={{
      position: "absolute",
      top: 1500,
      left: 56,
      right: 56,
      border: `6px solid ${INK_BLACK}`,
      background: PURE_WHITE,
      padding: "24px 44px",
    }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: INK_BLACK, letterSpacing: 4, marginBottom: 8 }}>
        WARISAN GEGENPRESSING
      </div>
      <div style={{ fontSize: 54, color: INK_BLACK, lineHeight: 1 }}>
        RANGNICK → KLOPP → DUNIA
      </div>
    </div>

    {/* Bottom AUDIRA brand */}
    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      background: INK_BLACK,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: NEO_YELLOW, letterSpacing: 8 }}>
        AUDIRA
      </div>
    </div>
  </AbsoluteFill>
);
