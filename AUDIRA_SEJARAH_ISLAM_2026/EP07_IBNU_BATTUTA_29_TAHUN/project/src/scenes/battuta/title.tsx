// EP07 hook title card (cover + first 3 s of the film).
import React from "react";
import { FONT } from "../../core/type/fonts.ts";
import { PAL } from "./world.tsx";

export const TitleCard: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT, opacity }}>
    <div
      style={{
        position: "absolute", left: 60, right: 60, top: 196, padding: "34px 44px 38px",
        background: "rgba(46,32,25,0.94)", borderRadius: 10, boxShadow: "0 18px 40px rgba(60,35,15,0.35)",
        border: "3px solid #c9a35a",
      }}
    >
      <div style={{ color: "#e6b860", fontSize: 40, fontWeight: 600, letterSpacing: 6 }}>SEJARAH ISLAM · EP07</div>
      <div style={{ color: PAL.plateText, fontSize: 124, fontWeight: 600, lineHeight: 1.02, marginTop: 18, letterSpacing: 1 }}>
        ASAL NAMA
        <br />
        SUMATRA
      </div>
      <div style={{ color: "#e9dcc2", fontSize: 40, fontWeight: 500, lineHeight: 1.3, marginTop: 20 }}>
        Ibnu Battuta singgah di Samudera, ± 1345
      </div>
    </div>
  </div>
);

