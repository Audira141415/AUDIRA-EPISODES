// EP11 overlays (HTML over the canvas, 16:9): title card in the hook, word-by-word karaoke captions
// with speaker labels inside the bottom caption band, the hikmah typographic moment, and the outro card.
import React from "react";
import { Img, staticFile } from "remotion";
import { CLIPS, E, OUTRO, T, TOTAL } from "./story";
import { clamp } from "./world";

const SPK: Record<string, { name: string; color: string }> = {
  narator: { name: "Narator", color: "#F2D98A" },
  paktua: { name: "Pak Tua", color: "#B6E08A" },
  pemuda: { name: "Pemuda", color: "#8FCBF2" },
};

export const TitleCard: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const a = clamp((t - 0.4) / 0.9);
  const o = a * (1 - clamp((t - (T("s2a") - 1.6)) / 1.0));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 104 * s, top: 250 * s, width: 900 * s, opacity: o, transform: `translateY(${(1 - a) * 14 * s}px)` }}>
      <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 26 * s, letterSpacing: 9 * s, color: "#F4EFE2", textShadow: "0 2px 12px rgba(20,30,18,0.55)" }}>CERITA HIKMAH</div>
      <div style={{ width: 120 * s * a, height: 3 * s, background: "#E4C77E", margin: `${14 * s}px 0 ${18 * s}px` }} />
      <div style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 74 * s, lineHeight: 1.04, color: "#FFFDF6", textShadow: "0 4px 26px rgba(16,26,14,0.6)" }}>
        Kearifan
        <br />
        Segenggam Garam
      </div>
      <div style={{ fontFamily: "Fraunces", fontStyle: "italic", fontSize: 34 * s, marginTop: 20 * s, color: "#F1EAD6", textShadow: "0 2px 14px rgba(16,26,14,0.65)" }}>
        Garamnya sama. Wadahnya yang berbeda.
      </div>
    </div>
  );
};

/** Split a clip into caption pages of at most ~9 words, breaking after punctuation when possible. */
const pagesOf = (words: { w: string }[]) => {
  const pages: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    const punct = /[.,!?…]$/.test(w.w);
    if (cur.length >= 9 || (punct && cur.length >= 4)) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) {
    if (cur.length <= 2 && pages.length) pages[pages.length - 1].push(...cur);
    else pages.push(cur);
  }
  return pages;
};

export const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const clip = CLIPS.find((c) => t >= c.start - 0.15 && t <= c.end + 0.35);
  if (!clip || t > TOTAL - OUTRO) return null;
  const pages = pagesOf(clip.words);
  let pi = pages.findIndex((p) => t < clip.words[p[p.length - 1]].e + 0.05);
  if (pi < 0) pi = pages.length - 1;
  const page = pages[pi];
  const spk = SPK[clip.who];
  const fade = clamp((t - clip.start + 0.15) / 0.2) * (1 - clamp((t - clip.end - 0.15) / 0.2));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 62 * s, display: "flex", flexDirection: "column", alignItems: "center", opacity: fade }}>
      <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 22 * s, letterSpacing: 4 * s, color: spk.color, marginBottom: 10 * s, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
        {spk.name.toUpperCase()}
      </div>
      <div style={{ maxWidth: 1500 * s, padding: `${14 * s}px ${30 * s}px`, borderRadius: 18 * s, background: "rgba(14,20,14,0.5)", textAlign: "center", lineHeight: 1.3 }}>
        {page.map((i) => {
          const w = clip.words[i];
          const active = t >= w.s - 0.03 && t <= w.e + 0.08;
          const said = t > w.e;
          const pop = active ? 1 + 0.06 * Math.sin(clamp((t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 13 * s, fontFamily: "Manrope", fontWeight: 700, fontSize: 46 * s, color: active ? spk.color : said ? "#FFFFFF" : "rgba(255,255,255,0.55)", transform: `scale(${pop})`, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** The hikmah: "Jangan jadikan hatimu seperti gelas. Jadikanlah seperti telaga." */
export const Hikmah: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const a = clamp((t - T("s7j") - 0.2) / 0.7);
  const b = clamp((t - T("s7k") - 0.2) / 0.8);
  const out = 1 - clamp((t - E("s7k") - 1.0) / 0.8);
  if (a <= 0 || out <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 104 * s, top: 250 * s, width: 1100 * s, opacity: out }}>
      <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 22 * s, letterSpacing: 8 * s, color: "#E4C77E", opacity: a }}>HIKMAH</div>
      <div style={{ fontFamily: "Fraunces", fontSize: 58 * s, lineHeight: 1.12, color: "#FFFDF6", marginTop: 12 * s, opacity: a * (1 - 0.45 * b), transform: `translateY(${(1 - a) * 12 * s}px)`, textShadow: "0 4px 22px rgba(10,16,10,0.7)" }}>
        Jangan jadikan hatimu seperti <span style={{ fontStyle: "italic" }}>gelas.</span>
      </div>
      <div style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 76 * s, lineHeight: 1.08, color: "#FFFFFF", marginTop: 10 * s, opacity: b, transform: `translateY(${(1 - b) * 14 * s}px)`, textShadow: "0 4px 26px rgba(10,16,10,0.75)" }}>
        Jadikanlah seperti <span style={{ color: "#9FE3D8", fontStyle: "italic" }}>telaga.</span>
      </div>
    </div>
  );
};

export const Outro: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const k = clamp((t - (TOTAL - OUTRO)) / 0.6);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0B3D2E", opacity: k, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ height: 330 * s, transform: `scale(${0.96 + 0.04 * k})` }} />
      <div style={{ fontFamily: "Manrope", fontWeight: 500, fontSize: 30 * s, letterSpacing: 3 * s, color: "#E9F2EC", marginTop: 34 * s, opacity: clamp((t - (TOTAL - OUTRO) - 0.4) / 0.6) }}>
        Created by Agus Dwi R.
      </div>
    </div>
  );
};
