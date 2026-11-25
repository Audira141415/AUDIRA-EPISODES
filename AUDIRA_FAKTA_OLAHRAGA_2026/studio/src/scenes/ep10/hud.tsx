// EP10 HUD extras (VINTAGEFORGE). Cards, stamps, captions and wipes come from ../ep02/hud.tsx.
// Layout in 1080×1920 px inside <Frame>. Top ≥ 236, karaoke band 1290–1540 kept free, bottom 380 px clear.
import React from "react";
import { ELITE, PLAYFAIR, RYE } from "../ep02/hud.tsx";
import { VP } from "../ep02/RoadSet.tsx";
import { clamp } from "./timing.ts";

const INK = VP.engravingBrown;
const GOLD = VP.agedGold;
const PAPER = VP.parchmentSepia;

/** Cover / hook headline. `o` fades it. */
export const HookTitle: React.FC<{ o: number }> = ({ o }) =>
  o <= 0 ? null : (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(36,21,9,0.86) 0%, rgba(36,21,9,0.6) 22%, rgba(36,21,9,0) 40%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 236, borderTop: `3px solid ${GOLD}`, borderBottom: `1px solid ${GOLD}`, height: 7 }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 262, display: "flex", justifyContent: "space-between", fontFamily: ELITE, fontSize: 36, letterSpacing: 2, color: GOLD }}>
        <span>NBA · HERSHEY, PENNSYLVANIA</span>
        <span style={{ color: PAPER }}>1962</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 322, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: RYE, fontSize: 150, lineHeight: 0.98, color: PAPER }}>100 POIN</div>
        <div style={{ fontFamily: RYE, fontSize: 84, lineHeight: 1.05, color: GOLD }}>SATU LAGA</div>
        <div style={{ marginTop: 10, fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 46, color: PAPER, opacity: 0.92 }}>tanpa satu detik pun rekaman video</div>
      </div>
    </div>
  );

/** Free-throw tally: 32 ball dots, `made` of them filled (28 of 32), shown in a paper card. */
export const Tally: React.FC<{ t: number; a: number; b: number; y: number; made: number }> = ({ t, a, b, y, made }) => {
  if (t < a || t > b) return null;
  const o = Math.min(clamp((t - a) / 0.3), clamp((b - t) / 0.25));
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(243,234,214,0.95)", border: `3px solid ${GOLD}`, padding: "16px 22px", display: "grid", gridTemplateColumns: "repeat(8, 46px)", gap: 10, boxShadow: "0 10px 26px rgba(30,20,10,0.45)" }}>
        {Array.from({ length: 32 }, (_, i) => {
          const on = i < made;
          const miss = i >= 28;
          return <div key={i} style={{ width: 46, height: 46, borderRadius: 23, background: on ? "#a8582c" : "transparent", border: `3px solid ${miss ? "#8e2f1f" : INK}`, opacity: on || miss ? 1 : 0.35 }} />;
        })}
      </div>
    </div>
  );
};

/** Game clock plate: "0:46" ticking down (stylised, accelerated). */
export const GameClock: React.FC<{ t: number; a: number; b: number; y: number; from: number; to: number }> = ({ t, a, b, y, from, to }) => {
  if (t < a || t > b) return null;
  const o = Math.min(clamp((t - a) / 0.3), clamp((b - t) / 0.25));
  const s = Math.max(to, Math.round(from - (from - to) * clamp((t - a) / (b - a - 0.3))));
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(30,22,14,0.93)", border: `3px solid ${GOLD}`, padding: "10px 40px 14px", textAlign: "center" }}>
        <div style={{ fontFamily: ELITE, fontSize: 38, color: GOLD, letterSpacing: 3 }}>SISA WAKTU</div>
        <div style={{ fontFamily: RYE, fontSize: 120, lineHeight: 1, color: PAPER }}>0:{String(s).padStart(2, "0")}</div>
      </div>
    </div>
  );
};
