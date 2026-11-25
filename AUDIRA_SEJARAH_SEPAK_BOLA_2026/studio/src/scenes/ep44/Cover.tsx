// EP44 cover (MARBLEMUSEUM): "AS Roma & Francesco Totti". Classical gallery with marble bust,
// skylight beam landing on the face. Totti: 307 gol / 786 partite, Golden Shoe 2006-07,
// l'Ottavo Re di Roma — 25 anni di fedeltà. Roma burgundy + museum gilt palette.
// AUDIRA brand: museum object label card.

import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { MARBLE_PALETTE as P } from "../../kits/marblemuseum/lib/palette";
import { Gallery3D } from "../../kits/marblemuseum/scene/Gallery3D";
import { MarbleBust3D } from "../../kits/marblemuseum/scene/MarbleBust3D";
import { MarbleCameraRig, MarblePost } from "../../kits/marblemuseum/lib/post";
import { getMarbleCamera } from "../../kits/marblemuseum/camera/rig";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const W = 1080;
const H = 1920;

// Roma accent: deep burgundy, brighter than the gallery oxblood
const ROMA_RED = "#8B1A1A";
const ROMA_GOLD = "#C8A84B";

const Overlay: React.FC = () => {
  const serif = "'Georgia', 'Times New Roman', serif";
  const sans = "'Helvetica Neue', 'Segoe UI', sans-serif";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", color: "#F7F1E6", fontFamily: serif }}>
      {/* dark gradient top + bottom so text reads over the gallery */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(18,8,7,0.92) 0%, rgba(18,8,7,0.6) 22%, rgba(18,8,7,0) 40%, rgba(18,8,7,0) 72%, rgba(18,8,7,0.75) 100%)",
      }} />
      {/* kicker bar */}
      <div style={{ position: "absolute", left: 60, top: 196, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "stretch", overflow: "hidden" }}>
          <div style={{ background: ROMA_RED, color: "#FFF", fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 2, padding: "6px 14px" }}>
            SEJARAH SEPAK BOLA
          </div>
          <div style={{ background: "rgba(200,168,75,0.18)", border: `1px solid ${ROMA_GOLD}`, color: ROMA_GOLD, fontFamily: MONO, fontWeight: 800, fontSize: 24, padding: "6px 12px" }}>
            #44
          </div>
        </div>
        <div style={{ border: `1.5px solid ${P.hudGilt}`, padding: "5px 14px", fontFamily: sans, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: P.hudGilt }}>
          MARBLEMUSEUM
        </div>
      </div>
      {/* main title block */}
      <div style={{ position: "absolute", left: 56, top: 280, right: 56 }}>
        {/* gold rule */}
        <div style={{ width: 80, height: 3, background: ROMA_GOLD, marginBottom: 20 }} />
        {/* AS ROMA label small */}
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: ROMA_GOLD, marginBottom: 10 }}>AS ROMA · 1992–2017</div>
        {/* TOTTI big */}
        <div style={{
          fontFamily: ANTON,
          fontSize: 190,
          lineHeight: 0.86,
          letterSpacing: 2,
          color: "#F7F1E6",
          textShadow: `0 6px 32px rgba(0,0,0,0.75), 0 0 60px ${ROMA_RED}44`,
        }}>
          TOTTI
        </div>
        {/* subtitle italic serif */}
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 44, lineHeight: 1.15, color: ROMA_GOLD, marginTop: 14, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
          L'Ottavo Re di Roma
        </div>
        {/* gold line */}
        <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, ${ROMA_GOLD}, transparent)`, margin: "20px 0 16px" }} />
        {/* one-club man quote */}
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 30, color: "rgba(247,241,230,0.80)", maxWidth: 760 }}>
          "Avrei potuto vincere di più, ma non avrei mai potuto amare di più."
        </div>
      </div>
      {/* museum label card at bottom */}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 420 }}>
        <div style={{
          background: P.card,
          color: P.cardInk,
          padding: "20px 26px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          fontFamily: sans,
        }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: "#7A6A55", marginBottom: 8 }}>OBJECT 044 // HALL OF ONE-CLUB LEGENDS</div>
          <div style={{ fontFamily: serif, fontSize: 32, lineHeight: 1.1, marginBottom: 6 }}>Francesco Totti — La Roma</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["307", "GOL"], ["786", "PARTITE"], ["250", "SERIE A GOALS"], ["GOLDEN SHOE", "2006-07"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: ROMA_RED, lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: sans, fontSize: 14, color: "#7A6A55", letterSpacing: 1, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* AUDIRA credit */}
        <div style={{ fontFamily: sans, fontSize: 17, color: "rgba(247,241,230,0.7)", textAlign: "right", marginTop: 10, letterSpacing: 1 }}>
          AUDIRA · Creator: Agus Dwi R.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Cover: React.FC = () => {
  useCurrentFrame();
  const { width, height } = useVideoConfig();
  // t=0: camera opens close to bust's eye (position [0.649, 2.63, 1.625], fov 30)
  const shot = getMarbleCamera(0);
  return (
    <AbsoluteFill style={{ background: "#120807" }}>
      <ThreeCanvas width={width} height={height} dpr={1} camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 60 }}>
        <MarbleCameraRig shot={shot} near={0.05} far={60} />
        <Gallery3D t={0} />
        <MarbleBust3D t={0} />
        <MarblePost frame={0} strength={0.15} radius={0.5} threshold={0.95} vignette={0.45} grain={0.02} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
