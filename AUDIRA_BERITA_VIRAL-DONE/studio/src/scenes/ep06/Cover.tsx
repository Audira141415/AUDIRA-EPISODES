// EP06 cover (TIMEFORGE): "KALAU WAPRES MUNDUR?"
// The Vice President's chair on the TIMEFORGE plinth at its 2026 state, with an amber "KOSONG"
// tape half rolled out (an intention to resign, not a resignation). Year odometer 2026, time rail
// 1945·1956·1973·1998·2001·2026 (the six moments of the film), brass plate "WAKIL PRESIDEN",
// AUDIRA maker's tag on the seat. Facts: research/RISET_JIKA_WAPRES_MUNDUR_2026-11-11.md.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { TimeforgeFilm } from "../../kits/timeforge/film/TimeforgeFilm.tsx";
import { CHAIR } from "./chair/subject.ts";
import { COVER_CUT } from "./cuts.ts";

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });

export const Headline: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 368, textAlign: "center", fontFamily: ANTON, color: "#1f2426", opacity, lineHeight: 0.98 }}>
    <div style={{ fontSize: 118, letterSpacing: "0.01em" }}>KALAU WAPRES</div>
    <div style={{ fontSize: 150, letterSpacing: "0.01em", color: "#b8321f" }}>MUNDUR?</div>
  </div>
);

export const Cover: React.FC = () => (
  <AbsoluteFill>
    <TimeforgeFilm subject={CHAIR} cut={COVER_CUT} />
    <Headline />
  </AbsoluteFill>
);
