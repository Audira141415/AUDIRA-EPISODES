// Cover / hook typography for EP09. Authored at 1080x1920 and scaled by height/1920.
// Safe zones: nothing above 180 px, nothing important in the bottom 380 px. Every line >= 38 px,
// every label on an opaque dark plate inside x 60-1020. Title card starts >= 240 px from the top.
import React from "react";
import { continueRender, delayRender, staticFile, useVideoConfig } from "remotion";

export const CREAM = "#FFF1DC";
export const AMBER = "#F0A04B";
export const PLATE = "#1B0E07";

let fontsReady: Promise<void> | null = null;
const loadFonts = () => {
  if (fontsReady || typeof document === "undefined") return;
  const h = delayRender("EP09 fonts");
  fontsReady = Promise.all(
    [
      ["QhAnton", "fonts/Anton-Regular.ttf"],
      ["QhSerif", "fonts/InstrumentSerif-Italic.ttf"],
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

export const QahwaCoverText: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const plate: React.CSSProperties = {
    display: "inline-block",
    background: PLATE,
    boxShadow: `0 ${8 * s}px ${30 * s}px rgba(0,0,0,0.6)`,
  };
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {/* soft vignette (FOODFORGE shallow-focus feel) */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 48% at 50% 52%, rgba(0,0,0,0) 45%, rgba(8,4,2,0.3) 80%, rgba(6,3,1,0.55) 100%)" }} />
      <div style={{ position: "absolute", top: 196 * s, left: 60 * s, right: 60 * s }}>
        <div style={{ ...plate, padding: `${8 * s}px ${20 * s}px`, borderLeft: `${6 * s}px solid ${AMBER}` }}>
          <span style={{ fontFamily: "QhAnton, Impact, sans-serif", fontSize: 40 * s, letterSpacing: 4 * s, color: AMBER }}>SEJARAH ISLAM · EP09</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 268 * s, left: 60 * s, right: 60 * s }}>
        <div style={{ ...plate, padding: `${14 * s}px ${30 * s}px ${18 * s}px`, borderLeft: `${10 * s}px solid #A2432A` }}>
          <div style={{ fontFamily: "QhAnton, Impact, sans-serif", fontSize: 132 * s, lineHeight: 1.0, color: CREAM, letterSpacing: 1 * s }}>KOPI PERNAH</div>
          <div style={{ fontFamily: "QhAnton, Impact, sans-serif", fontSize: 132 * s, lineHeight: 1.0, color: AMBER, letterSpacing: 1 * s }}>DIADILI</div>
        </div>
        <div style={{ marginTop: 18 * s }}>
          <div style={{ ...plate, padding: `${8 * s}px ${22 * s}px`, border: `${2 * s}px solid ${AMBER}` }}>
            <span style={{ fontFamily: "QhSerif, Georgia, serif", fontSize: 50 * s, color: CREAM }}>Makkah · 1511</span>
          </div>
        </div>
      </div>
    </div>
  );
};
