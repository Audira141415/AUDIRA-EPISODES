// EP05 cover — CHRONICLE. Rumble in the Jungle, Kinshasa 1974, before dawn.
// Variant "ko": round 8, Foreman (crimson) toppling, Ali (amber) holding the last punch.
// Variant "ropes": rope-a-dope, Ali leaning on the ropes under Foreman's hooks.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotCanvas } from "./chronicle/ShotCanvas.tsx";
import { chronicleFontsReady, F_LABEL, F_STAMP } from "./chronicle/fonts.ts";
import { Frame, IVORY, CRIMSON, AMBER } from "./chronicle/Overlay.tsx";
import type { Shot } from "./chronicle/cam.ts";
import { BOX, FLOOR, PREDAWN, RingSet, type Boxer } from "./RingSet.tsx";

export type CoverVariant = "ko" | "ropes";

const SETUPS: Record<CoverVariant, { shot: Shot; ali: Boxer; foreman: Boxer; chip: string; chipColor: string; cheer: number }> = {
  ko: {
    shot: { pos: [0.2, FLOOR + 1.3, 3.2], target: [0.2, FLOOR + 1.45, -2.0], fov: 50 },
    ali: { pose: BOX.heldPunch(), pos: [1.05, 0, -2.0], rotY: -1.3 },
    foreman: { pose: BOX.fall(), pos: [0.1, 0, -2.1], rotY: 1.45, topple: -0.55 },
    chip: "KO · RONDE 8 · 2:58",
    chipColor: AMBER,
    cheer: 1,
  },
  ropes: {
    shot: { pos: [0.5, FLOOR + 1.35, 3.25], target: [-2.1, FLOOR + 1.42, -0.8], fov: 50 },
    ali: { pose: BOX.ropes(), pos: [-2.75, 0, -0.7], rotY: 1.5 },
    foreman: { pose: BOX.hook(), pos: [-1.85, 0, -1.35], rotY: -1.35 },
    chip: "UNDERDOG 4 : 1 (NYT)",
    chipColor: CRIMSON,
    cheer: 0.3,
  },
};

export const Title: React.FC<{ chip: string; chipColor: string }> = ({ chip, chipColor }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center" }}>
      <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 44, letterSpacing: 10, color: IVORY, opacity: 0.9 }}>KINSHASA · 1974</div>
      <div style={{ fontFamily: F_STAMP, fontSize: 132, lineHeight: 0.98, color: IVORY, letterSpacing: 1, textShadow: "0 8px 34px rgba(0,0,0,0.55)", marginTop: 8 }}>
        RUMBLE IN
        <br />
        THE JUNGLE
      </div>
      <div style={{ margin: "18px auto 0", width: 240, height: 8, background: CRIMSON }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: F_LABEL, fontWeight: 800, fontSize: 56, letterSpacing: 5, color: "#120d0b", background: chipColor, padding: "10px 30px 8px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>{chip}</span>
    </div>
  </>
);

export const Cover: React.FC<{ variant: CoverVariant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = 2 + frame / fps;
  const [h] = useState(() => delayRender("ep05 fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => { chronicleFontsReady().then(() => { setOk(true); continueRender(h); }); }, [h]);
  const s = SETUPS[variant];
  return (
    <AbsoluteFill style={{ background: "#060a1a" }}>
      {ok && (
        <>
          <ShotCanvas shot={s.shot} look={PREDAWN} frame={frame}>
            <RingSet t={t} ali={s.ali} foreman={s.foreman} cheer={s.cheer} />
          </ShotCanvas>
          <Frame width={width} height={height}>
            <Title chip={s.chip} chipColor={s.chipColor} />
          </Frame>
        </>
      )}
    </AbsoluteFill>
  );
};

export const CoverKO: React.FC = () => <Cover variant="ko" />;
export const CoverRopes: React.FC = () => <Cover variant="ropes" />;
