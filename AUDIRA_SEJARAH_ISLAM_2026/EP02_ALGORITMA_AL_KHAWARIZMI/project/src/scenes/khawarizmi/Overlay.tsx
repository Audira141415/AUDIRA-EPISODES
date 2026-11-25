import React from "react";
import { continueRender, delayRender, Img, staticFile, useVideoConfig } from "remotion";
import { EV } from "./beats";
import { prog, smooth, easeOut, win } from "./time";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette";
import { FONT } from "../../core/type/fonts";

// Instrument Serif (OFL, bundled in public/fonts) for the manuscript title.
const SERIF = "InstrumentSerifEP02";
let loaded: Promise<void> | null = null;
const loadSerif = () => {
  if (loaded || typeof document === "undefined") return;
  const h = delayRender("Loading Instrument Serif");
  loaded = Promise.all(
    [
      ["InstrumentSerif-Regular.ttf", "normal"],
      ["InstrumentSerif-Italic.ttf", "italic"],
    ].map(async ([file, style]) => {
      const face = new FontFace(SERIF, `url(${staticFile(`fonts/${file}`)})`, { style });
      await face.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(face);
    }),
  ).then(
    () => continueRender(h),
    () => continueRender(h),
  );
};
loadSerif();

/** Cover / hook title (fades after "Itu nama orang"), the name card (context, HUD plane), the outro card.
 * Safe zones on 1080x1920: top 180 px, bottom 380 px stay clear. */
export const KhawarizmiOverlay: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const shadow = `0 ${3 * s}px ${22 * s}px rgba(0,0,0,0.9), 0 0 ${4 * s}px rgba(0,0,0,0.7)`;
  const title = 1 - smooth(prog(t, EV.hookEnd - 0.1, EV.hookEnd + 0.5));
  const shade = Math.max(title, 0.2);
  const name = win(t, EV.nama - 0.15, EV.kesembilan - 0.2, 0.35);
  const nameIn = easeOut(prog(t, EV.nama - 0.15, EV.nama + 0.45));
  const outro = smooth(prog(t, EV.outroCard, EV.outroCard + 0.45));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.45 + 0.55 * title, background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(10,6,3,0.45) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760 * s, opacity: shade, background: "linear-gradient(180deg, rgba(10,6,3,0.72) 0%, rgba(10,6,3,0.45) 60%, rgba(10,6,3,0) 100%)" }} />
      {title > 0.001 ? (
        <div style={{ position: "absolute", top: 205 * s, left: 72 * s, right: 72 * s, color: "#F3E4C4", opacity: title, transform: `translateY(${(1 - title) * -30 * s}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 * s, fontFamily: FONT, fontWeight: 600, fontSize: 26 * s, letterSpacing: 7 * s, color: P.goldLeaf, textShadow: shadow }}>
            <span style={{ display: "inline-block", width: 44 * s, height: 2 * s, background: P.goldLeaf }} />
            SEJARAH ISLAM · EP02
          </div>
          <div style={{ fontFamily: `${SERIF}, Georgia, serif`, fontSize: 132 * s, lineHeight: 0.98, marginTop: 22 * s, textShadow: shadow }}>
            Algoritma
            <br />
            <span style={{ fontStyle: "italic", color: "#F0C766" }}>adalah nama</span>
            <br />
            orang.
          </div>
        </div>
      ) : null}
      {name > 0.001 ? (
        <div
          style={{
            position: "absolute",
            top: 215 * s,
            left: 72 * s,
            opacity: name,
            transform: `translateX(${(1 - nameIn) * -40 * s}px)`,
            padding: `${18 * s}px ${30 * s}px ${22 * s}px`,
            borderRadius: 18 * s,
            background: "rgba(20,12,7,0.72)",
            border: `${2 * s}px solid rgba(230,185,76,0.55)`,
            boxShadow: `0 ${10 * s}px ${34 * s}px rgba(0,0,0,0.5)`,
          }}
        >
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26 * s, letterSpacing: 6 * s, color: P.goldLeaf }}>MUHAMMAD IBN MUSA</div>
          <div style={{ fontFamily: `${SERIF}, Georgia, serif`, fontStyle: "italic", fontSize: 92 * s, lineHeight: 1.0, color: "#F3E4C4", marginTop: 6 * s }}>al-Khawarizmi</div>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40 * s, color: "rgba(243,228,196,0.92)", marginTop: 10 * s }}>orang dari Khwarazm, Asia Tengah</div>
        </div>
      ) : null}
      {outro > 0.001 ? (
        /* Monolit AMD logo (kit SVG, never retyped) on Hijau Hutan + the creator credit */
        <div style={{ position: "absolute", inset: 0, opacity: outro, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 520 * s, height: "auto", transform: `scale(${0.96 + 0.04 * outro})` }} />
          <div style={{ marginTop: 28 * s, fontFamily: FONT, fontWeight: 500, fontSize: 40 * s, letterSpacing: 2 * s, color: "#e9f1ec" }}>Created by Agus Dwi R.</div>
        </div>
      ) : null}
    </div>
  );
};
