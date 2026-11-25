// EP02 data chips: the key number of each beat, big enough to read on a phone with the sound off.
// Each chip repeats the in-scene brass plaque it belongs to (same text, from the script/FACTS),
// pops in on the word that says it and holds until the next chip.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TL, W } from "./timing.ts";
import { DISPLAY, TEXT } from "./fonts.ts";

type Chip = { at: number; big: string; small: string; accent?: boolean };

const CHIPS: Chip[] = [
  { at: W("28%"), big: "28 / 100", small: "GAME TERATAS · RILIS DALAM 90 HARI" },
  { at: W("Ninety"), big: "99 NIGHTS IN THE FOREST", small: "GAME BREAKOUT · MAP BARU MENYALIP" },
  { at: W("20"), big: "> 20 JUTA", small: "ORANG SEKALIGUS · GROW A GARDEN, STEAL A BRAINROT" },
  { at: W("1,7"), big: "±1,7 MILIAR DOLAR", small: "LEWAT DEVEX · 12 BULAN S.D. JUNI 2026" },
  { at: W("5"), big: "> 5 MILIAR DOLAR", small: "TOTAL DEVEX SEJAK 2013" },
  { at: W("65,7"), big: "US$65,7 JUTA", small: "RATA-RATA 10 KREATOR TERATAS", accent: true },
  { at: W("10,8"), big: "US$10,8 JUTA", small: "RATA-RATA 100 TERATAS" },
  { at: W("1,4"), big: "US$1,4 JUTA", small: "RATA-RATA 1.000 TERATAS" },
  { at: W("1.500"), big: "±US$1.500/TAHUN", small: "MEDIAN DARI > 42.000 KREATOR DEVEX", accent: true },
  { at: W("timpang"), big: "TERBUKA, TAPI TIMPANG", small: "PELUANG KREATOR ROBLOX", accent: true },
  { at: W("83%"), big: "83%", small: "KREATOR AS (SURVEI): PERORANGAN, BUKAN STUDIO" },
  { at: W("supaya"), big: "SUPAYA PEMAIN BETAH", small: "BUKAN MODAL, TAPI CARA MAP DIRANCANG" },
  { at: W("Kita"), big: "ALGORITMA ROBLOX", small: "EPISODE BERIKUTNYA" },
];

export const DataChips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const u = height / 1920;
  const i = CHIPS.findIndex((c, k) => t >= c.at && t < (CHIPS[k + 1]?.at ?? TL.voEnd + 0.4));
  if (i < 0) return null;
  const c = CHIPS[i];
  const end = Math.min(CHIPS[i + 1]?.at ?? TL.voEnd + 0.4, c.at + 7.5);
  if (t >= end) return null;
  const inK = Math.min(1, (t - c.at) / 0.22);
  const outK = Math.min(1, (end - t) / 0.2);
  const k = Math.min(inK, outK);
  const e = 1 - Math.pow(1 - k, 3);
  const long = c.big.length > 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 64 * u,
          top: 200 * u,
          maxWidth: 760 * u,
          padding: `${18 * u}px ${30 * u}px ${20 * u}px`,
          background: "rgba(16,17,20,0.74)",
          backdropFilter: `blur(${12 * u}px)`,
          borderLeft: `${8 * u}px solid ${c.accent ? "#FF6A26" : "#D2B07A"}`,
          borderRadius: 14 * u,
          boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.35)`,
          opacity: e,
          transform: `translateX(${(1 - e) * -40 * u}px)`,
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontSize: (long ? 70 : 128) * u, lineHeight: 1.0, color: c.accent ? "#FF7A3D" : "#F4F1EA", letterSpacing: 1 * u }}>{c.big}</div>
        <div style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 32 * u, letterSpacing: 2 * u, color: "#D2B07A", marginTop: 8 * u }}>{c.small}</div>
      </div>
    </AbsoluteFill>
  );
};
