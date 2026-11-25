// EP38 Cover (URBANFORGE): "Napoli — Penebusan Selatan & Maradona"
// Visual: dark architectural gallery — city of Naples as an urban model,
// projected data (cyan/amber) marking Maradona's titles 1987 & 1990,
// southern Italy identity vs wealthy north.
// Pure 2D (no ThreeCanvas). URBANFORGE palette.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700", "800"] });

// URBANFORGE palette
const DARK_GALLERY = "#0a0a0c";
const OBSIDIAN = "#141519";
const MODEL_WHITE = "#f5f5f2";
const MODEL_SHADOW = "#181a20";
const PROJECTED_CYAN = "#00f0ff";
const PROJECTED_AMBER = "#ffb703";
const PROJECTED_EMERALD = "#00f59b";
// Napoli blue (episode accent)
const NAPOLI_BLUE = "#0D5EAF";

const W = 1080;
const H = 1920;

// City silhouette: simplified skyline blocks (representing Naples cityscape)
const BUILDINGS = [
  { x: 0, w: 90, h: 220 }, { x: 95, w: 60, h: 160 }, { x: 160, w: 110, h: 300 },
  { x: 275, w: 70, h: 180 }, { x: 350, w: 130, h: 380 }, { x: 485, w: 80, h: 240 },
  { x: 570, w: 100, h: 320 }, { x: 675, w: 60, h: 190 }, { x: 740, w: 140, h: 280 },
  { x: 885, w: 80, h: 200 }, { x: 970, w: 110, h: 260 },
];

// Data projection bars: trophy & stat lines in the architectural overlay
const STAT_BARS = [
  { year: "1984", label: "MARADONA TIBA", w: 0.4, color: PROJECTED_AMBER },
  { year: "1987", label: "SCUDETTO I", w: 0.85, color: PROJECTED_CYAN },
  { year: "1989", label: "UEFA CUP", w: 0.6, color: PROJECTED_EMERALD },
  { year: "1990", label: "SCUDETTO II", w: 0.85, color: PROJECTED_CYAN },
];

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ width: W, height: H, background: DARK_GALLERY, overflow: "hidden" }}>

    {/* Fine architectural grid */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
      {Array.from({ length: 36 }, (_, i) => (
        <line key={`v${i}`} x1={i * 30} y1={0} x2={i * 30} y2={H} stroke={MODEL_SHADOW} strokeWidth={1} />
      ))}
      {Array.from({ length: 65 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 30} x2={W} y2={i * 30} stroke={MODEL_SHADOW} strokeWidth={1} />
      ))}
    </svg>

    {/* Top bar: classification header */}
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 100,
      background: OBSIDIAN, borderBottom: `1px solid rgba(0,240,255,0.3)`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingLeft: 56, paddingRight: 56, fontFamily: MONO,
    }}>
      <div style={{ fontWeight: 700, fontSize: 20, color: PROJECTED_CYAN, letterSpacing: 5, opacity: 0.8 }}>
        SEJARAH SEPAK BOLA
      </div>
      <div style={{ fontWeight: 800, fontSize: 22, color: PROJECTED_AMBER, letterSpacing: 3 }}>
        EP. 38
      </div>
    </div>

    {/* Napoli label */}
    <div style={{ position: "absolute", top: 120, left: 56, fontFamily: MONO }}>
      <div style={{
        display: "inline-block",
        background: NAPOLI_BLUE,
        fontWeight: 800, fontSize: 22, letterSpacing: 6,
        color: "#FFFFFF", padding: "6px 20px",
      }}>
        S.S.C. NAPOLI
      </div>
    </div>

    {/* Hero title */}
    <div style={{ position: "absolute", top: 180, left: 56, right: 56, fontFamily: ANTON }}>
      <div style={{
        fontSize: 160,
        lineHeight: 0.86,
        color: MODEL_WHITE,
        letterSpacing: -4,
        textShadow: `0 0 80px rgba(0,240,255,0.15)`,
      }}>
        PENEBUSAN
      </div>
      <div style={{
        fontSize: 92,
        lineHeight: 0.9,
        color: PROJECTED_CYAN,
        letterSpacing: -2,
        marginTop: 8,
        textShadow: `0 0 40px rgba(0,240,255,0.5)`,
      }}>
        SELATAN
      </div>
      <div style={{
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 32,
        color: "rgba(245,245,242,0.45)",
        letterSpacing: 4,
        marginTop: 20,
      }}>
        NAPOLI · MARADONA · 1984–1991
      </div>
    </div>

    {/* City silhouette — architectural model aesthetic */}
    <div style={{ position: "absolute", top: 530, left: 0, right: 0 }}>
      <svg width={W} height={420} viewBox={`0 0 ${W} 420`}>
        {/* Ground plane */}
        <rect x={0} y={390} width={W} height={30} fill={OBSIDIAN} />
        {/* Buildings (white model masses) */}
        {BUILDINGS.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x} y={390 - b.h} width={b.w} height={b.h}
              fill={i % 3 === 0 ? MODEL_WHITE : i % 3 === 1 ? "#ddddd8" : "#c8c8c4"}
              opacity={0.88}
            />
            {/* Projected cyan outline on taller buildings */}
            {b.h > 250 && (
              <rect
                x={b.x} y={390 - b.h} width={b.w} height={b.h}
                fill="none" stroke={PROJECTED_CYAN} strokeWidth={1} opacity={0.5}
              />
            )}
          </g>
        ))}
        {/* Vesuvio silhouette (triangle) */}
        <polygon
          points={`${W - 10},390 ${W * 0.72},50 ${W * 0.56},390`}
          fill={MODEL_SHADOW}
          opacity={0.7}
        />
        <polygon
          points={`${W - 10},390 ${W * 0.72},50 ${W * 0.56},390`}
          fill="none" stroke="rgba(255,183,3,0.3)" strokeWidth={1}
        />
        {/* Projection beam from Vesuvio peak */}
        <line
          x1={W * 0.72} y1={50}
          x2={W * 0.72} y2={420}
          stroke={PROJECTED_AMBER} strokeWidth={1} strokeDasharray="6,4" opacity={0.5}
        />
      </svg>
    </div>

    {/* DATA PROJECTION PANEL */}
    <div style={{
      position: "absolute",
      top: 968,
      left: 56,
      right: 56,
      background: "rgba(10,10,12,0.9)",
      border: `1px solid rgba(0,240,255,0.25)`,
      padding: "28px 36px 28px",
      fontFamily: MONO,
    }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: PROJECTED_CYAN, letterSpacing: 5, marginBottom: 24, opacity: 0.7 }}>
        TIMELINE PROYEKSI · EROPA SELATAN
      </div>
      {STAT_BARS.map((s, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: PROJECTED_AMBER, letterSpacing: 3 }}>{s.year}</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: MODEL_WHITE, letterSpacing: 2, opacity: 0.8 }}>{s.label}</div>
          </div>
          <div style={{ position: "relative", height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${s.w * 100}%`,
              background: s.color,
              opacity: 0.85,
              boxShadow: `0 0 12px ${s.color}`,
              borderRadius: 2,
            }} />
          </div>
        </div>
      ))}
    </div>

    {/* MaGiCa trio badge */}
    <div style={{
      position: "absolute",
      top: 1360,
      left: 56,
      right: 56,
      background: NAPOLI_BLUE,
      padding: "20px 36px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: MONO,
    }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#FFFFFF", letterSpacing: 4, marginBottom: 4 }}>
          MAGICA TRIO
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.7)", letterSpacing: 2 }}>
          MARADONA · GIORDANO · CARECA
        </div>
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 56, color: PROJECTED_AMBER, lineHeight: 1 }}>
        1987
      </div>
    </div>

    {/* City identity text */}
    <div style={{
      position: "absolute",
      top: 1510,
      left: 56,
      right: 56,
      fontFamily: MONO,
    }}>
      <div style={{
        fontWeight: 700, fontSize: 22, letterSpacing: 3,
        color: "rgba(245,245,242,0.35)",
        borderTop: `1px solid rgba(0,240,255,0.2)`,
        paddingTop: 20,
      }}>
        NAPOLI BUKAN HANYA KOTA — NAPOLI ADALAH IDENTITAS.
      </div>
      <div style={{
        fontWeight: 700, fontSize: 20, letterSpacing: 2,
        color: "rgba(245,245,242,0.25)",
        marginTop: 10,
      }}>
        SELATAN ITALIA MELAWAN KEMAPANAN UTARA.
      </div>
    </div>

    {/* Bottom AUDIRA brand */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 96,
      background: OBSIDIAN, borderTop: `1px solid rgba(0,240,255,0.2)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 20, fontFamily: MONO,
    }}>
      <div style={{ fontWeight: 800, fontSize: 32, color: MODEL_WHITE, letterSpacing: 8 }}>AUDIRA</div>
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
      <div style={{ fontWeight: 700, fontSize: 20, color: PROJECTED_CYAN, letterSpacing: 3, opacity: 0.6 }}>
        URBANFORGE
      </div>
    </div>
  </AbsoluteFill>
);
