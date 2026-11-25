import React from "react";
import { useVideoConfig } from "remotion";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette.ts";
import { ramp, smooth, computeState } from "./motion.ts";

interface LabelDef {
  text: string;
  sub?: string;
  start: number;
  end: number;
}

const LABELS: LabelDef[] = [
  { text: "TINTA DI TIGRIS", sub: "HOOK", start: 0, end: 4.5 },
  { text: "BAGHDAD, 762 M", sub: "KOTA BUNDAR AL-MANSUR", start: 5, end: 14 },
  { text: "90+ SARJANA", sub: "GERAKAN PENERJEMAHAN", start: 15, end: 22 },
  { text: "YUNANI → ARAB → DUNIA", sub: "WARISAN ILMU", start: 22, end: 29 },
  { text: "AL-KHAWARIZMI", sub: "BAPAK ALJABAR", start: 30, end: 36 },
  { text: "BANU MUSA", sub: "MESIN OTOMATIS ABAD KE-9", start: 37, end: 41 },
  { text: "1258 M — MONGOL", sub: "TINTA MENGALIR DI TIGRIS", start: 42, end: 51 },
  { text: "ALJABAR = BAITUL HIKMAH", sub: "WARISAN ABADI", start: 52, end: 62 },
];

const YEARS: { text: string; start: number; end: number }[] = [
  { text: "762 M", start: 5, end: 14 },
  { text: "786 M", start: 8, end: 12 },
  { text: "813 M", start: 12, end: 18 },
  { text: "830 M", start: 30, end: 36 },
  { text: "850 M", start: 37, end: 41 },
  { text: "1258 M", start: 42, end: 51 },
];

export const BaitulHikmahOverlay: React.FC<{ f: number }> = ({ f }) => {
  const { height } = useVideoConfig();
  const sc = height / 1920;
  const s = computeState(f);
  const t = s.t;

  const activeLabel = LABELS.find((l) => t >= l.start && t < l.end);
  const activeYear = YEARS.find((y) => t >= y.start && t < y.end);

  const labelOpacity = activeLabel
    ? smooth(ramp(t, activeLabel.start, activeLabel.start + 0.6)) *
      smooth(ramp(activeLabel.end - t, 0, 0.5))
    : 0;

  const yearOpacity = activeYear
    ? smooth(ramp(t, activeYear.start, activeYear.start + 0.4)) *
      smooth(ramp(activeYear.end - t, 0, 0.4))
    : 0;

  // Destruction red tint
  const destructionTint = s.beat === "destruction" ? smooth(ramp(t, 43, 48)) * 0.25 : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "'Georgia', serif",
        color: "#F3E4C4",
      }}
    >
      {/* Radial vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(12,7,4,0.62) 100%)",
        }}
      />

      {/* Destruction red overlay */}
      {destructionTint > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(120,20,10,${destructionTint})`,
          }}
        />
      )}

      {/* Top badge — series tag */}
      <div
        style={{
          position: "absolute",
          top: 196 * sc,
          right: 64 * sc,
          opacity: smooth(ramp(t, 0.3, 1.0)),
          background: "rgba(36,65,140,0.85)",
          border: `${2 * sc}px solid ${P.goldLeaf}`,
          padding: `${10 * sc}px ${18 * sc}px`,
          fontFamily: "monospace",
          fontSize: 20 * sc,
          fontWeight: 700,
          letterSpacing: 2 * sc,
          whiteSpace: "nowrap",
        }}
      >
        MANUSCRIPT // EP01
      </div>

      {/* Main caption label — bottom safe zone */}
      {activeLabel && labelOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            bottom: 396 * sc,
            left: 64 * sc,
            right: 64 * sc,
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              background: "rgba(20,12,8,0.8)",
              borderLeft: `${5 * sc}px solid ${P.goldLeaf}`,
              padding: `${18 * sc}px ${24 * sc}px`,
              maxWidth: 700 * sc,
            }}
          >
            <div
              style={{
                fontSize: 42 * sc,
                fontWeight: 700,
                lineHeight: 1.1,
                textShadow: `0 ${3 * sc}px ${16 * sc}px rgba(0,0,0,0.85)`,
                marginBottom: 8 * sc,
              }}
            >
              {activeLabel.text}
            </div>
            {activeLabel.sub && (
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 18 * sc,
                  letterSpacing: 3 * sc,
                  color: P.goldLeaf,
                }}
              >
                {activeLabel.sub}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Year chip — top-left below safe zone */}
      {activeYear && yearOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 196 * sc,
            left: 64 * sc,
            opacity: yearOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 24 * sc,
              letterSpacing: 4 * sc,
              color: P.goldLeaf,
              textShadow: `0 ${2 * sc}px ${10 * sc}px rgba(0,0,0,0.9)`,
            }}
          >
            ✠ {activeYear.text}
          </div>
        </div>
      )}

      {/* Creator watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 396 * sc,
          right: 64 * sc,
          fontFamily: "monospace",
          fontSize: 18 * sc,
          color: "rgba(243,228,196,0.5)",
          whiteSpace: "nowrap",
          opacity: smooth(ramp(t, 1, 2)),
        }}
      >
        Creator: AUDIRA
      </div>
    </div>
  );
};
