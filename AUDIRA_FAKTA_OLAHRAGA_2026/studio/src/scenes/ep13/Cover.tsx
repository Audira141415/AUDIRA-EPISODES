// EP13 cover / thumbnail: the payoff bench frozen with the lamp on.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F_LABEL, F_STAMP, Finish, W } from "./lib.tsx";
import { S13b } from "./sets2.tsx";
import { chronicleFontsReady } from "../ep05/chronicle/fonts.ts";

void chronicleFontsReady();
export const Cover: React.FC = () => {
  const t = W("penjelasan", "tanpa");
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <S13b t={t} />
      <Finish frame={4} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 236, textAlign: "center" }}>
        <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 52, letterSpacing: 7, color: C.bone, textShadow: "0 2px 16px #000" }}>MONTREAL 1976</div>
        <div style={{ fontFamily: F_STAMP, fontSize: 134, whiteSpace: "nowrap", lineHeight: 1.04, color: C.bone, textShadow: "0 8px 34px rgba(0,0,0,0.85)" }}>PEDANG CURANG</div>
      </div>
    </AbsoluteFill>
  );
};
