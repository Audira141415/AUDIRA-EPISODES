import React from "react";
import { useVideoConfig } from "remotion";
import { M } from "./palette";
import { B } from "./beats";

// Source / time chips (only from the script or SOURCE_REGISTER), one at a time, below the top 180 px.
const CHIPS = [
  { text: "MENURUT AL-MAQRIZI", a: B.maqrizi, b: B.berjanji },
  { text: "MULAI 1284", a: B.dimulai, b: B.bangsal },
  { text: "WAKAF", a: B.wakaf, b: B.hasilnya },
  { text: "CATATAN ABAD KE-14", a: B.catatan, b: B.konon - 0.1 },
  { text: "KONON · CATATAN ABAD KE-19", a: B.konon + 0.1, b: B.limaAbad },
  { text: "LEBIH DARI 5 ABAD", a: B.limaAbad + 0.2, b: B.sejak },
];

// Hook title card (stitched felt label) + location chip on an opaque dark plate.
// Authored at 1080x1920 and scaled by height/1920. Title card top >= 240 px; every line >= 38 px;
// everything inside x 60-1020 and above the bottom 380 px band.
export const MansuriOverlay: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  // the title holds through the hook (the cover frame is t = 0.3 s), then lifts away
  const out = Math.min(1, Math.max(0, (t - 3.4) / 0.6));
  const opacity = 1 - out;
  const lift = -40 * out;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Georgia', 'Palatino Linotype', serif", color: M.ink }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 38%, rgba(30,18,8,0.64) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 250 * s,
          left: 70 * s,
          right: 70 * s,
          opacity,
          transform: `translateY(${lift * s}px)`,
          background: "rgba(46,29,19,0.95)",
          color: M.paper,
          borderRadius: 22 * s,
          outline: `${4 * s}px dashed ${M.gold}`,
          outlineOffset: -13 * s,
          boxShadow: `0 ${10 * s}px ${26 * s}px rgba(60,35,20,0.32)`,
          padding: `${30 * s}px ${44 * s}px ${30 * s}px`,
        }}
      >
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 38 * s, letterSpacing: 1 * s, color: M.gold, fontWeight: 700, marginBottom: 8 * s }}>SEJARAH ISLAM · EP10 · KAIRO 1285</div>
        <div style={{ fontSize: 76 * s, fontWeight: 700, fontStyle: "italic", lineHeight: 1.0, letterSpacing: -1 * s }}>
          Rumah Sakit Gratis
          <br />
          untuk Semua
        </div>
        <div style={{ fontSize: 42 * s, fontStyle: "italic", marginTop: 12 * s, color: "#F2D9B0" }}>dari raja sampai budak</div>
      </div>
      {CHIPS.map((c) => {
        const o = Math.min(1, Math.max(0, (t - c.a) / 0.3), Math.max(0, (c.b - t) / 0.3));
        if (o <= 0) return null;
        return (
          <div
            key={c.text}
            style={{
              position: "absolute",
              top: 250 * s,
              left: 70 * s,
              maxWidth: 940 * s,
              opacity: o,
              transform: `translateY(${(1 - o) * -16 * s}px)`,
              background: M.plate,
              color: M.paper,
              borderRadius: 16 * s,
              outline: `${3 * s}px dashed ${M.gold}`,
              outlineOffset: -9 * s,
              padding: `${16 * s}px ${30 * s}px`,
              fontFamily: "'Courier New', monospace",
              fontWeight: 800,
              fontSize: 52 * s,
              letterSpacing: 2 * s,
              boxShadow: `0 ${8 * s}px ${20 * s}px rgba(30,15,5,0.4)`,
            }}
          >
            {c.text}
          </div>
        );
      })}
    </div>
  );
};
