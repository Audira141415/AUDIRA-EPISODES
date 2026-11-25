// Cover / hook typography: series label, 3-5 word title on solid cobalt cards (style memory: text
// over tile patterns needs a solid backing card), small sourced sub-line. Safe zones: top 180 px,
// bottom 380 px of a 1080 x 1920 frame.
import React from "react";
import { continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { P } from "./picture.ts";

export const COBALT = "#13306F";
export const OCHRE = "#F2C46A";

let fontsReady: Promise<void> | null = null;
const loadFonts = () => {
  if (fontsReady || typeof document === "undefined") return;
  const h = delayRender("EP01 fonts");
  fontsReady = Promise.all(
    [
      ["QAnton", "fonts/Anton-Regular.ttf"],
      ["QSerif", "fonts/InstrumentSerif-Regular.ttf"],
    ].map(async ([name, file]) => {
      const f = new FontFace(name, `url(${staticFile(file)})`);
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(
    () => continueRender(h),
    () => continueRender(h),
  );
};
loadFonts();

export const QarawiyyinCoverText: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const mono = "'Consolas', 'Courier New', monospace";
  const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    display: "inline-block",
    background: COBALT,
    boxShadow: `0 ${8 * s}px ${28 * s}px rgba(0,0,0,0.55)`,
    borderLeft: `${8 * s}px solid ${P.terracotta}`,
    ...extra,
  });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      <div style={{ position: "absolute", top: 206 * s, left: 60 * s, right: 60 * s }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 26 * s,
            letterSpacing: 6 * s,
            color: OCHRE,
            background: "rgba(19,48,111,0.92)",
            border: `${2 * s}px solid ${OCHRE}`,
            padding: `${8 * s}px ${18 * s}px`,
            marginBottom: 18 * s,
          }}
        >
          SEJARAH ISLAM · EP01
        </div>
        <div>
          <div style={card({ padding: `${10 * s}px ${30 * s}px ${6 * s}px` })}>
            <div style={{ fontFamily: "QAnton, Impact, sans-serif", fontSize: 128 * s, lineHeight: 1.0, color: "#FBF1DF", letterSpacing: 1 * s }}>
              EMPAT KUNCI
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10 * s }}>
          <div style={card({ padding: `${8 * s}px ${30 * s}px ${4 * s}px`, borderLeftColor: OCHRE })}>
            <div style={{ fontFamily: "QAnton, Impact, sans-serif", fontSize: 92 * s, lineHeight: 1.02, color: OCHRE, letterSpacing: 1 * s }}>
              KAMPUS TERTUA
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 * s }}>
          <div style={{ display: "inline-block", background: "rgba(20,13,9,0.86)", padding: `${8 * s}px ${20 * s}px`, fontFamily: "QSerif, Georgia, serif", fontSize: 42 * s, lineHeight: 1.12, color: "#FBF1DF" }}>
            Al-Qarawiyyin, Fez, Maroko
            <br />
            <span style={{ color: OCHRE }}>menurut Guinness World Records</span>
          </div>
        </div>
      </div>
    </div>
  );
};
