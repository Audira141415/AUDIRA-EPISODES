// EP06 film: "Bikin Lagu Sendiri Pakai Gemini, Lengkap dengan Lirik" (RETROWAVE).
// One continuous synthwave stage (World.tsx + camera.ts) under 2D CRT layers: neon step badges,
// a generic retro chat terminal with a pixel cursor, typed prompt, options panel, result card,
// warning cards and karaoke captions. Every beat is keyed to timeline.json (Audio Master Clock).
import React, { useEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import { loadFont as loadVT } from "@remotion/google-fonts/VT323";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RETROWAVE_PALETTE as P } from "../../kits/retrowave/lib/palette.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { BG } from "./Cover.tsx";
import { WorldScene } from "./World.tsx";
import { Captions } from "./Captions.tsx";
import { Btn, Cursor, DISPLAY, Headline, Hl, INK, PANEL, PIX, StepHeader, WarnCard, Win, glow, hotAt, outBack, ramp, sm, typed, win } from "./ui.tsx";

const kanit = loadKanit("italic", { weights: ["800", "900"], subsets: ["latin"] });
const vt = loadVT("normal", { weights: ["400"], subsets: ["latin"] });

const OUTRO_AT = TL.sections.outro[1] + 0.2;
const CLIP = (id: string) => (TL.clips as { id: string; words: { w: string; s: number; e: number }[] }[]).find((c) => c.id === id)!;

// ---------------------------------------------------------------- terminal panel geometry
const PX = 70, PY = 560, PW = 940, PH = 760;
const CY = PY + 66; // content origin (below title bar)
type Tap = { t: number; x: number; y: number; press?: boolean };
// panel-local targets; tap times locked to the spoken words
const TAPS: Tap[] = [
  { t: 18.7, x: 520, y: 60 }, // URL bar while it types
  { t: 22.2, x: 470, y: 450 }, // "kotak teks"
  { t: 23.6, x: 215, y: 537, press: true }, // "Upload & tools"
  { t: 25.49, x: 270, y: 262, press: true }, // "Create music"
  { t: 27.02, x: 110, y: 355, press: true }, // + foto / video
  { t: 31.04, x: 470, y: 445, press: true }, // focus the prompt ("tulis")
  { t: 36.9, x: 620, y: 650 }, // rest bottom right while typing
  { t: 46.36, x: 845, y: 537, press: true }, // send
  // options panel (penjelasan)
  { t: 47.62, x: 640, y: 62, press: true }, // "menu" dropdown
  { t: 50.19, x: 560, y: 150, press: false }, // pendek
  { t: 51.7, x: 560, y: 222, press: true }, // penuh
  { t: 54.62, x: 410, y: 300, press: true }, // vokal ya
  { t: 55.29, x: 600, y: 300 }, // tidak (hover)
  { t: 55.85, x: 400, y: 400, press: true }, // genre lo-fi
  { t: 57.56, x: 600, y: 505, press: true }, // "ganti" model dropdown
  { t: 58.74, x: 520, y: 600, press: true }, // "Pro"
];

const cursorAt = (t: number) => {
  let i = 0;
  while (i < TAPS.length - 1 && t >= TAPS[i + 1].t) i++;
  const a = TAPS[i], b = TAPS[Math.min(i + 1, TAPS.length - 1)];
  const kk = b === a ? 0 : sm(ramp(t, b.t - 0.5, b.t - 0.05));
  const x = a.x + (b.x - a.x) * kk + Math.sin(t * 2.1) * 3;
  const y = a.y + (b.y - a.y) * kk + Math.cos(t * 1.7) * 3;
  let press = 0, ripple = 0;
  TAPS.forEach((tp) => {
    if (!tp.press) return;
    const d = t - tp.t;
    if (d > -0.12 && d < 0.18) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.15);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  });
  return { x, y, press: Math.max(0, press), ripple };
};

// prompt typed in sync with the spoken example (l10, from "buat")
const PROMPT_WORDS = CLIP("l10").words.slice(1).map((w, i, arr) => ({ ...w, w: i === arr.length - 1 ? w.w.replace(/\.$/, "") : w.w }));
const wordColor = (w: string, t: number) => {
  const mood = ramp(t, 44.6, 44.9);
  if (w === "buat") return P.neonMagenta;
  if (w === "lo-fi") return P.sunsetAmber;
  if (w === "piano") return P.synthCyan;
  if ((w === "santai" || w === "kampung" || w === "halaman") && mood > 0) return "#B98CFF";
  return "#F4F1FF";
};

const TypedPrompt: React.FC<{ t: number; k: number; size?: number }> = ({ t, k, size = 40 }) => {
  const caret = Math.floor(t * 2.4) % 2 === 0;
  const mood = ramp(t, 44.6, 44.9);
  const last = PROMPT_WORDS[PROMPT_WORDS.length - 1];
  return (
    <div style={{ fontFamily: PIX, fontSize: size * k, lineHeight: 1.12, color: "#F4F1FF", display: "flex", flexWrap: "wrap", columnGap: 14 * k }}>
      {PROMPT_WORDS.map((w, i) => {
        const a = w.s - 0.25, b = Math.max(w.s, w.e - 0.1);
        const txt = typed(w.w, t, a, b);
        if (!txt) return null;
        const c = wordColor(w.w, t);
        const isMood = w.w === "santai" || w.w === "kampung" || w.w === "halaman";
        return (
          <span key={i} style={{ color: c, textShadow: c !== "#F4F1FF" ? glow(c, 10 * k) : "none", borderBottom: isMood && mood > 0 ? `${3 * k}px solid rgba(185,140,255,${mood})` : `${3 * k}px solid transparent` }}>
            {txt}
          </span>
        );
      })}
      {t < last.e + 0.2 && caret && <span style={{ width: 16 * k, background: P.neonMagenta, display: "inline-block" }} />}
    </div>
  );
};

/** Small generic "photo": a village roof under a striped sunset (no real image). */
const Thumb: React.FC<{ k: number; video?: boolean }> = ({ k, video }) => (
  <div style={{ position: "relative", width: 110 * k, height: 78 * k, borderRadius: 10 * k, overflow: "hidden", border: `${3 * k}px solid ${P.synthCyan}`, background: "linear-gradient(180deg, #2a0f5a 0%, #ff2f7a 70%, #ff9e00 100%)" }}>
    <div style={{ position: "absolute", left: 30 * k, top: 18 * k, width: 40 * k, height: 40 * k, borderRadius: "50%", background: "#FFE36B" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26 * k, background: "#1b0838" }} />
    <div style={{ position: "absolute", left: 50 * k, bottom: 14 * k, width: 0, height: 0, borderLeft: `${22 * k}px solid transparent`, borderRight: `${22 * k}px solid transparent`, borderBottom: `${20 * k}px solid #1b0838` }} />
    {video && (
      <div style={{ position: "absolute", left: 40 * k, top: 22 * k, width: 0, height: 0, borderTop: `${15 * k}px solid transparent`, borderBottom: `${15 * k}px solid transparent`, borderLeft: `${24 * k}px solid #FFFFFF` }} />
    )}
  </div>
);

const Chip: React.FC<{ k: number; color: string; children: React.ReactNode; on: number }> = ({ k, color, children, on }) => (
  <div style={{ padding: `${10 * k}px ${22 * k}px`, borderRadius: 14 * k, border: `${3 * k}px solid ${color}`, color: on > 0.5 ? INK : color, background: on > 0.5 ? color : "rgba(12,8,26,0.5)", fontFamily: PIX, fontSize: 44 * k, opacity: 0.35 + 0.65 * on, transform: `scale(${0.9 + 0.1 * outBack(on)})`, boxShadow: on > 0.5 ? glow(color, 20 * k) : "none", whiteSpace: "nowrap" }}>
    {children}
  </div>
);

// ---------------------------------------------------------------- LANGKAH 1-4: retro chat terminal
const ChatPanel: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const url = typed("gemini.google.com", t, 18.95, 20.4);
  const menuOpen = t >= 23.65 && t < 25.65;
  const music = t >= 25.55;
  const musicPop = outBack(ramp(t, 25.55, 25.9));
  const tray = t >= 26.4;
  const foto = sm(ramp(t, 27.2, 27.6));
  const video = sm(ramp(t, 28.2, 28.6));
  const formula = win(t, 32.3, 37.45, 0.3, 0.3);
  const greet = 1 - sm(ramp(t, 31.9, 32.3)) + sm(ramp(t, 37.45, 37.8)) * 0;
  const meter = ramp(t, 43.7, 46.2);
  const sent = ramp(t, 46.4, 46.75);
  return (
    <>
      {/* URL bar */}
      <div style={{ position: "absolute", left: 30 * k, top: 22 * k, width: 880 * k, height: 72 * k, borderRadius: 36 * k, border: `${3 * k}px solid ${P.synthCyan}`, background: "rgba(0,246,255,0.06)", display: "flex", alignItems: "center", paddingLeft: 30 * k, fontFamily: PIX, fontSize: 46 * k, color: "#F4F1FF", boxSizing: "border-box" }}>
        <span style={{ color: P.phosphorGreen, marginRight: 16 * k }}>&gt;</span>
        {url}
        {t < 20.6 && Math.floor(t * 2.4) % 2 === 0 && <span style={{ color: P.neonMagenta }}>_</span>}
      </div>
      {/* greeting (generic) */}
      {!menuOpen && greet > 0 && t < 32.3 && (
        <div style={{ position: "absolute", left: 40 * k, top: 140 * k, opacity: sm(ramp(t, 20.3, 20.8)) * greet, fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 800, fontSize: 56 * k, color: "#FFFFFF", textShadow: glow("rgba(255,0,127,0.7)", 18 * k) }}>
          Mau bikin apa <Hl>hari ini?</Hl>
        </div>
      )}
      {/* formula chips: buat/tulis + genre + alat musik */}
      {formula > 0 && (
        <div style={{ position: "absolute", left: 30 * k, top: 120 * k, width: 880 * k, opacity: formula }}>
          <div style={{ fontFamily: PIX, fontSize: 38 * k, color: P.synthCyan, letterSpacing: 3 * k, marginBottom: 12 * k }}>RUMUS PERINTAH</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
            <Chip k={k} color={P.neonMagenta} on={ramp(t, 33.45, 33.65)}>buat / tulis</Chip>
            <span style={{ fontFamily: PIX, fontSize: 50 * k, color: "#F4F1FF" }}>+</span>
            <Chip k={k} color={P.sunsetAmber} on={ramp(t, 34.95, 35.15)}>genre</Chip>
            <span style={{ fontFamily: PIX, fontSize: 50 * k, color: "#F4F1FF" }}>+</span>
            <Chip k={k} color={P.synthCyan} on={ramp(t, 36.55, 36.75)}>alat musik</Chip>
          </div>
        </div>
      )}
      {/* example prompt, large, while the VO reads it */}
      {t >= 37.5 && (
        <div style={{ position: "absolute", left: 30 * k, top: 112 * k, width: 880 * k, opacity: sm(ramp(t, 37.5, 37.8)) }}>
          <div style={{ fontFamily: PIX, fontSize: 38 * k, color: P.synthCyan, letterSpacing: 3 * k, marginBottom: 6 * k }}>CONTOH PERINTAH</div>
          <TypedPrompt t={t} k={k} size={54} />
        </div>
      )}
      {/* composer */}
      <div style={{ position: "absolute", left: 30 * k, top: 300 * k, width: 880 * k, height: 285 * k, borderRadius: 24 * k, border: `${3 * k}px solid ${t >= 21.85 && t < 23.6 ? P.neonMagenta : "rgba(0,246,255,0.7)"}`, background: "rgba(0,246,255,0.05)", boxShadow: t >= 21.85 && t < 23.6 ? glow(P.neonMagenta, 24 * k) : "none" }}>
        {tray && (
          <div style={{ position: "absolute", left: 22 * k, top: 14 * k, display: "flex", gap: 16 * k, alignItems: "center" }}>
            <div style={{ width: 110 * k, height: 78 * k, borderRadius: 10 * k, border: `${3 * k}px dashed ${P.sunsetAmber}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PIX, fontSize: 56 * k, color: P.sunsetAmber, background: hotAt(t, 27.02) > 0 ? "rgba(255,158,0,0.2)" : "transparent" }}>+</div>
            {foto > 0 && <div style={{ opacity: foto, transform: `translateY(${(1 - foto) * -30 * k}px)` }}><Thumb k={k} /></div>}
            {video > 0 && <div style={{ opacity: video, transform: `translateY(${(1 - video) * -30 * k}px)` }}><Thumb k={k} video /></div>}
            <div style={{ fontFamily: PIX, fontSize: 36 * k, color: P.sunsetAmber, opacity: ramp(t, 27.0, 27.4) }}>foto / video · opsional</div>
          </div>
        )}
        <div style={{ position: "absolute", left: 24 * k, top: (tray ? 104 : 30) * k, right: 24 * k }}>
          {t < 37.9 ? (
            <div style={{ fontFamily: PIX, fontSize: 40 * k, color: "rgba(244,241,255,0.45)" }}>
              {t >= 31.04 && t < 37.9 ? (Math.floor(t * 2.4) % 2 === 0 ? "|" : " ") : "Tulis di sini..."}
            </div>
          ) : (
            <TypedPrompt t={t} k={k} />
          )}
        </div>
      </div>
      <Btn x={50} y={505} w={330} h={64} k={k} label="Upload & tools" hot={hotAt(t, 23.6, 1.8)} size={40} />
      {music && (
        <div style={{ position: "absolute", left: 400 * k, top: 505 * k, transform: `scale(${musicPop})`, transformOrigin: "0 50%" }}>
          <div style={{ height: 64 * k, padding: `0 ${22 * k}px`, borderRadius: 16 * k, background: P.neonMagenta, color: "#FFFFFF", fontFamily: PIX, fontSize: 40 * k, display: "flex", alignItems: "center", boxShadow: glow(P.neonMagenta, 18 * k), whiteSpace: "nowrap" }}>♪ Create music</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 800 * k, top: 500 * k, width: 92 * k, height: 74 * k, borderRadius: 18 * k, background: sent > 0 ? P.phosphorGreen : P.neonMagenta, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + hotAt(t, 46.36, 0.3) * 0.12})`, boxShadow: glow(sent > 0 ? P.phosphorGreen : P.neonMagenta, 16 * k) }}>
        <div style={{ width: 0, height: 0, borderTop: `${16 * k}px solid transparent`, borderBottom: `${16 * k}px solid transparent`, borderLeft: `${28 * k}px solid ${INK}` }} />
      </div>
      {/* Upload & tools menu (opens upward) */}
      {menuOpen && (
        <div style={{ position: "absolute", left: 50 * k, top: 150 * k, width: 440 * k, height: 210 * k, borderRadius: 18 * k, background: "#140a2e", border: `${3 * k}px solid ${P.synthCyan}`, boxShadow: glow("rgba(0,246,255,0.6)", 24 * k), transform: `scaleY(${outBack(ramp(t, 23.65, 23.95), 1.2)})`, transformOrigin: "50% 100%" }}>
          {[0, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 30 * k, top: (34 + i * 60) * k, width: (230 - i * 30) * k, height: 16 * k, borderRadius: 8 * k, background: "rgba(244,241,255,0.18)" }} />
          ))}
          <div style={{ position: "absolute", left: 14 * k, top: 82 * k, width: 410 * k, height: 62 * k, borderRadius: 12 * k, background: hotAt(t, 25.49) > 0 ? "rgba(255,0,127,0.35)" : "rgba(255,0,127,0.08)", border: `${3 * k}px solid ${P.neonMagenta}`, fontFamily: PIX, fontSize: 42 * k, color: "#FFFFFF", display: "flex", alignItems: "center", paddingLeft: 18 * k, boxSizing: "border-box" }}>
            ♪ Create music
          </div>
        </div>
      )}
      {/* clarity meter */}
      {t >= 43.6 && (
        <div style={{ position: "absolute", left: 30 * k, top: 612 * k, display: "flex", alignItems: "center", gap: 16 * k, opacity: sm(ramp(t, 43.6, 43.9)) }}>
          <div style={{ fontFamily: PIX, fontSize: 40 * k, color: "#B98CFF" }}>SUASANA JELAS</div>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ width: 36 * k, height: 34 * k, background: i < meter * 10 ? (i < 6 ? P.synthCyan : P.phosphorGreen) : "rgba(244,241,255,0.12)", boxShadow: i < meter * 10 ? glow(P.synthCyan, 8 * k) : "none" }} />
          ))}
          <div style={{ fontFamily: PIX, fontSize: 40 * k, color: P.phosphorGreen, opacity: ramp(t, 45.9, 46.1) }}>TERARAH</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- PENJELASAN: options panel
const Row: React.FC<{ y: number; k: number; label: string; children: React.ReactNode; on: number }> = ({ y, k, label, children, on }) => (
  <div style={{ position: "absolute", left: 30 * k, top: y * k, width: 880 * k, display: "flex", alignItems: "center", gap: 20 * k, opacity: 0.35 + 0.65 * on }}>
    <div style={{ width: 250 * k, fontFamily: PIX, fontSize: 44 * k, color: P.synthCyan }}>{label}</div>
    {children}
  </div>
);

const Drop: React.FC<{ k: number; text: string; hot: number; w?: number }> = ({ k, text, hot, w = 560 }) => (
  <div style={{ width: w * k, height: 76 * k, borderRadius: 16 * k, border: `${3 * k}px solid ${hot > 0.3 ? P.neonMagenta : "rgba(0,246,255,0.7)"}`, background: "rgba(12,8,26,0.6)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${22 * k}px`, boxSizing: "border-box", fontFamily: PIX, fontSize: 44 * k, color: "#FFFFFF", boxShadow: hot > 0.3 ? glow(P.neonMagenta, 18 * k) : "none" }}>
    <span>{text}</span>
    <span style={{ color: P.neonMagenta }}>▾</span>
  </div>
);

const Toggle: React.FC<{ k: number; label: string; on: number; hover?: number }> = ({ k, label, on, hover = 0 }) => (
  <div style={{ padding: `${10 * k}px ${28 * k}px`, borderRadius: 14 * k, border: `${3 * k}px solid ${P.sunsetAmber}`, background: on > 0.5 ? P.sunsetAmber : hover > 0 ? "rgba(255,158,0,0.2)" : "rgba(12,8,26,0.5)", color: on > 0.5 ? INK : P.sunsetAmber, fontFamily: PIX, fontSize: 44 * k, boxShadow: on > 0.5 ? glow(P.sunsetAmber, 16 * k) : "none", transform: `scale(${1 + hover * 0.05})` }}>
    {label}
  </div>
);

const OptionsPanel: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const lenOpen = t >= 47.7 && t < 52.2;
  const lenText = t >= 51.75 ? "Penuh · ±2–3 menit" : "Panjang lagu";
  const vok = t >= 54.62;
  const genre = t >= 55.85;
  const modOpen = t >= 57.6 && t < 59.0;
  const pro = t >= 58.74;
  return (
    <>
      <Row y={24} k={k} label="DURASI" on={1 - 0.6 * ramp(t, 53.6, 53.8)}>
        <Drop k={k} text={lenText} hot={hotAt(t, 47.62, 4.4)} />
      </Row>
      {lenOpen && (
        <div style={{ position: "absolute", left: 300 * k, top: 108 * k, width: 560 * k, borderRadius: 16 * k, background: "#140a2e", border: `${3 * k}px solid ${P.synthCyan}`, boxShadow: glow("rgba(0,246,255,0.6)", 24 * k), padding: 8 * k, transform: `scaleY(${outBack(ramp(t, 47.7, 48.0), 1.2)})`, transformOrigin: "50% 0%", zIndex: 2 }}>
          {[
            { at: 50.19, l: "Pendek", d: "±1 menit" },
            { at: 51.7, l: "Penuh", d: "±2–3 menit" },
          ].map((o, i) => {
            const h = t >= o.at - 0.1 ? 1 : 0;
            return (
              <div key={i} style={{ height: 64 * k, marginTop: i ? 8 * k : 0, borderRadius: 12 * k, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${18 * k}px`, fontFamily: PIX, fontSize: 44 * k, color: "#FFFFFF", background: h && (i === 1 || t < 51.6) ? "rgba(255,0,127,0.35)" : "transparent", border: `${3 * k}px solid ${h && (i === 1 || t < 51.6) ? P.neonMagenta : "transparent"}` }}>
                <span>{o.l}</span>
                <span style={{ color: P.sunsetAmber }}>{o.d}</span>
              </div>
            );
          })}
        </div>
      )}
      <Row y={270} k={k} label="VOKAL" on={ramp(t, 53.7, 53.9) * (1 - 0.6 * ramp(t, 56.6, 56.8))}>
        <Toggle k={k} label="Ya" on={vok ? 1 : 0} hover={hotAt(t, 54.62, 0.4)} />
        <Toggle k={k} label="Tidak" on={0} hover={hotAt(t, 55.29, 0.3)} />
      </Row>
      <Row y={370} k={k} label="GENRE" on={ramp(t, 55.7, 55.9) * (1 - 0.6 * ramp(t, 56.6, 56.8))}>
        <Toggle k={k} label="lo-fi" on={genre ? 1 : 0} hover={hotAt(t, 55.85, 0.4)} />
        <Toggle k={k} label="pop" on={0} />
        <Toggle k={k} label="rock" on={0} />
      </Row>
      <Row y={470} k={k} label="MODEL" on={ramp(t, 56.7, 56.9)}>
        <Drop k={k} text={pro ? "Pro ✓" : "Model"} hot={hotAt(t, 57.56, 1.6)} w={360} />
        {t >= 57.0 && <div style={{ fontFamily: PIX, fontSize: 36 * k, color: P.phosphorGreen, opacity: ramp(t, 57.0, 57.3) }}>wajib untuk<br />lagu penuh</div>}
      </Row>
      {modOpen && (
        <div style={{ position: "absolute", left: 300 * k, top: 552 * k, width: 360 * k, borderRadius: 16 * k, background: "#140a2e", border: `${3 * k}px solid ${P.synthCyan}`, padding: 8 * k, transform: `scaleY(${outBack(ramp(t, 57.6, 57.9), 1.2)})`, transformOrigin: "50% 0%" }}>
          <div style={{ height: 16 * k, width: 200 * k, margin: `${14 * k}px ${14 * k}px`, borderRadius: 8 * k, background: "rgba(244,241,255,0.18)" }} />
          <div style={{ height: 60 * k, borderRadius: 12 * k, display: "flex", alignItems: "center", paddingLeft: 18 * k, fontFamily: PIX, fontSize: 46 * k, color: "#FFFFFF", background: t >= 58.64 ? "rgba(255,0,127,0.4)" : "transparent", border: `${3 * k}px solid ${P.neonMagenta}` }}>Pro</div>
        </div>
      )}
    </>
  );
};

/** The terminal: zoom-through entry out of the 3D prompt window, glitch swap, collapse into the cassette. */
const Terminal: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 18.35, b = 59.2;
  if (t < a || t > b) return null;
  const inK = sm(ramp(t, a, a + 0.45));
  const out = sm(ramp(t, 58.95, 59.2));
  const swap = t >= 46.85 && t < 47.15 ? Math.sin(ramp(t, 46.85, 47.15) * Math.PI) : 0;
  const options = t >= 47.0;
  const c = cursorAt(t);
  const drift = Math.sin(t * 0.35) * 0.8;
  const s = (1.35 - 0.35 * inK) * (1 - out * 0.85);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inK * (1 - out), transform: `translate(${swap * 18 * k}px, ${out * 520 * k}px) scale(${s}) perspective(${1800 * k}px) rotateX(${2 + drift}deg) rotateY(${Math.sin(t * 0.22) * 1.5}deg)`, transformOrigin: "50% 50%" }}>
      <Win x={PX} y={PY} w={PW} h={PH} k={k} title={options ? "CREATE MUSIC // OPSI" : t >= 25.55 ? "CHAT // CREATE MUSIC" : "CHAT // BARU"}>
        {options ? <OptionsPanel t={t} k={k} /> : <ChatPanel t={t} k={k} />}
        {swap > 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(0deg, transparent 40%, rgba(0,246,255,${0.5 * swap}) 50%, transparent 60%)`, mixBlendMode: "screen" }} />}
      </Win>
      <Cursor x={PX + c.x} y={CY + c.y} k={k} press={c.press} ripple={c.ripple} o={sm(ramp(t, 18.6, 18.9))} />
    </div>
  );
};

// ---------------------------------------------------------------- KONTEKS: Lyria flow strip
const LyriaFlow: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 14.85, 18.1, 0.3, 0.3);
  if (o <= 0) return null;
  const node = (label: string, color: string, at: number) => {
    const on = ramp(t, at, at + 0.2);
    return (
      <div style={{ padding: `${14 * k}px ${22 * k}px`, borderRadius: 16 * k, border: `${3 * k}px solid ${color}`, background: on > 0.5 ? color : PANEL, color: on > 0.5 ? INK : color, fontFamily: PIX, fontSize: 46 * k, boxShadow: on > 0.5 ? glow(color, 22 * k) : "none", transform: `scale(${0.92 + 0.08 * outBack(on)})`, whiteSpace: "nowrap" }}>
        {label}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, top: 1150 * k, opacity: o, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 * k }}>
      {node("✎ deskripsi", "#B98CFF", 16.85)}
      <span style={{ fontFamily: PIX, fontSize: 60 * k, color: "#F4F1FF" }}>→</span>
      {node("♪ musik", P.synthCyan, 15.55)}
      <span style={{ fontFamily: PIX, fontSize: 50 * k, color: "#F4F1FF" }}>+</span>
      {node("≡ lirik", P.sunsetAmber, 16.28)}
    </div>
  );
};

// ---------------------------------------------------------------- PENJELASAN: result + retry
const ResultCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 59.3, 63.7, 0.35, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, 59.3, 59.75), 1.2);
  const cover = sm(ramp(t, 61.0, 61.4));
  return (
    <div style={{ position: "absolute", left: 110 * k, top: 500 * k, width: 860 * k, opacity: o, transform: `scale(${0.8 + 0.2 * pop})`, transformOrigin: "50% 100%" }}>
      <div style={{ borderRadius: 24 * k, background: PANEL, border: `${3 * k}px solid ${P.synthCyan}`, boxShadow: glow("rgba(0,246,255,0.6)", 30 * k), padding: 24 * k, display: "flex", gap: 26 * k, alignItems: "center" }}>
        {/* video file with cover image */}
        <div style={{ position: "relative", width: 300 * k, height: 300 * k, flex: "none", borderRadius: 16 * k, overflow: "hidden", border: `${3 * k}px solid ${P.neonMagenta}` }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1b0838 0%, #7A2BFF 45%, #ff2f7a 75%, #ff9e00 100%)", opacity: cover }} />
          <div style={{ position: "absolute", left: 80 * k, top: 70 * k, width: 140 * k, height: 140 * k, borderRadius: "50%", background: "repeating-linear-gradient(180deg, #FFE36B 0 14px, transparent 14px 20px)", opacity: cover }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70 * k, background: "repeating-linear-gradient(90deg, #ff2fd0 0 2px, transparent 2px 30px), #12052a", opacity: cover }} />
          <div style={{ position: "absolute", left: 115 * k, top: 105 * k, width: 0, height: 0, borderTop: `${42 * k}px solid transparent`, borderBottom: `${42 * k}px solid transparent`, borderLeft: `${70 * k}px solid rgba(255,255,255,0.92)` }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: PIX, fontSize: 40 * k, color: P.synthCyan, letterSpacing: 3 * k }}>HASIL</div>
          <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 800, fontSize: 54 * k, lineHeight: 1.05, color: "#FFFFFF" }}>
            File <Hl c={P.synthCyan}>video</Hl>
            <br />+ <Hl c={P.sunsetAmber}>gambar sampul</Hl>
          </div>
          <div style={{ display: "flex", gap: 14 * k, marginTop: 22 * k }}>
            <div style={{ position: "relative", width: 230 * k, height: 70 * k }}>
              <Btn x={0} y={0} w={230} h={70} k={k} label="⤓ Unduh" hot={hotAt(t, 62.46, 0.4)} color={P.phosphorGreen} size={42} />
            </div>
            <div style={{ position: "relative", width: 250 * k, height: 70 * k }}>
              <Btn x={0} y={0} w={250} h={70} k={k} label="⤴ Bagikan" hot={hotAt(t, 63.01, 0.4)} color={P.neonMagenta} size={42} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RetryCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 64.5, 67.35, 0.3, 0.25);
  if (o <= 0) return null;
  const strike = ramp(t, 64.85, 65.2);
  const ceria = typed("ceria", t, 65.3, 65.8);
  return (
    <div style={{ position: "absolute", left: 90 * k, top: 760 * k, width: 900 * k, opacity: o }}>
      <div style={{ borderRadius: 22 * k, background: PANEL, border: `${3 * k}px solid ${P.neonMagenta}`, boxShadow: glow("rgba(255,0,127,0.6)", 26 * k), padding: `${24 * k}px ${28 * k}px` }}>
        <div style={{ fontFamily: PIX, fontSize: 40 * k, color: P.synthCyan, letterSpacing: 3 * k }}>UBAH PERINTAH</div>
        <div style={{ fontFamily: PIX, fontSize: 44 * k, color: "#F4F1FF", lineHeight: 1.15 }}>
          buat lagu lo-fi{" "}
          <span style={{ position: "relative", color: strike > 0 ? "rgba(244,241,255,0.45)" : "#F4F1FF" }}>
            santai
            <span style={{ position: "absolute", left: 0, top: "52%", height: 4 * k, width: `${strike * 100}%`, background: P.neonMagenta }} />
          </span>{" "}
          <span style={{ color: P.sunsetAmber, textShadow: glow(P.sunsetAmber, 10 * k) }}>{ceria}</span>
          {t < 66.0 && Math.floor(t * 2.4) % 2 === 0 ? <span style={{ color: P.neonMagenta }}>|</span> : null} dengan melodi piano...
        </div>
        <div style={{ position: "relative", height: 84 * k, marginTop: 18 * k }}>
          <Btn x={0} y={8} w={360} h={72} k={k} label="↻ Buat lagi" hot={hotAt(t, 66.37, 0.6)} color={P.phosphorGreen} size={44} solid={t >= 66.37} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- PAYOFF
const Checklist: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 68.4, 74.1, 0.3, 0.25);
  if (o <= 0) return null;
  const rows = [
    { at: 69.19, big: "18+", txt: "usia 18 tahun ke atas" },
    { at: 71.17, big: "G", txt: "masuk ke akun Google" },
    { at: 72.42, big: "ON", txt: "Keep Activity aktif" },
  ];
  return (
    <div style={{ position: "absolute", left: 80 * k, top: 640 * k, width: 920 * k, opacity: o }}>
      {rows.map((r, i) => {
        const on = ramp(t, r.at, r.at + 0.25);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 * k, marginTop: i ? 22 * k : 0, padding: `${16 * k}px ${22 * k}px`, borderRadius: 20 * k, background: PANEL, border: `${3 * k}px solid ${on > 0.5 ? P.phosphorGreen : "rgba(244,241,255,0.25)"}`, boxShadow: on > 0.5 ? glow("rgba(57,255,20,0.55)", 22 * k) : "none", opacity: 0.4 + 0.6 * on, transform: `translateX(${(1 - sm(on)) * 30 * k}px)` }}>
            <div style={{ width: 110 * k, height: 90 * k, flex: "none", borderRadius: 14 * k, background: on > 0.5 ? P.sunsetAmber : "rgba(255,158,0,0.2)", color: INK, fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 900, fontSize: 52 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.big}</div>
            <div style={{ flex: 1, fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 800, fontSize: 50 * k, color: "#FFFFFF" }}>{r.txt}</div>
            <div style={{ width: 64 * k, height: 64 * k, borderRadius: 12 * k, border: `${4 * k}px solid ${P.phosphorGreen}`, color: P.phosphorGreen, fontFamily: DISPLAY, fontWeight: 900, fontSize: 50 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{on > 0.5 ? "✓" : ""}</div>
          </div>
        );
      })}
    </div>
  );
};

const HonestCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 79.4, 81.5, 0.3, 0.25);
  if (o <= 0) return null;
  const tick = ramp(t, 80.4, 80.6);
  return (
    <div style={{ position: "absolute", left: 160 * k, top: 1170 * k, width: 760 * k, opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 * k, padding: `${18 * k}px ${26 * k}px`, borderRadius: 18 * k, background: PANEL, border: `${3 * k}px solid ${P.synthCyan}`, boxShadow: glow("rgba(0,246,255,0.5)", 20 * k) }}>
        <div style={{ width: 64 * k, height: 64 * k, borderRadius: 12 * k, border: `${4 * k}px solid ${P.phosphorGreen}`, background: tick > 0.5 ? P.phosphorGreen : "transparent", color: INK, fontFamily: DISPLAY, fontWeight: 900, fontSize: 50 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{tick > 0.5 ? "✓" : ""}</div>
        <div style={{ fontFamily: PIX, fontSize: 48 * k, color: "#FFFFFF" }}>saat unggah: tandai <Hl c={P.phosphorGreen}>dibuat dengan AI</Hl></div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- film
export const Ep06Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP06 film fonts"));
  useEffect(() => {
    Promise.all([kanit.waitUntilDone(), vt.waitUntilDone(), document.fonts.load("italic 900 40px 'Kanit'"), document.fonts.load("40px 'VTThreeTwoThree'")])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  // dim the stage behind the terminal so UI text reads
  const dim = Math.max(sm(ramp(t, 18.4, 18.9)) * (1 - sm(ramp(t, 58.95, 59.25))), win(t, 68.3, 74.1, 0.4, 0.3), 0.7 * win(t, 64.4, 67.4, 0.3, 0.3));
  const flash = Math.max(0, 1 - Math.abs(t - 18.45) / 0.18);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 1.25, 8], fov: 42, near: 0.1, far: 120 }}>
          <WorldScene t={t} f={f} />
          <Finish frame={frame} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} hdri="studio" />
        </ThreeCanvas>
      )}
      {/* legibility gradient behind headlines */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,8,26,0.85) 0%, rgba(12,8,26,0.5) 22%, rgba(12,8,26,0) 34%)" }} />
      {dim > 0 && <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 52%, rgba(12,8,26,0.72) 0%, rgba(12,8,26,0.45) 70%, rgba(12,8,26,0.2) 100%)", opacity: dim }} />}

      {/* HOOK */}
      <Headline kicker="PUNYA LAGU SENDIRI?" k={k} t={t} a={0.0} b={5.3} size={124}>
        <span style={{ opacity: ramp(t, 1.6, 1.85) }}>LAGU SENDIRI</span>
        <br />
        <span style={{ opacity: ramp(t, 3.25, 3.5), color: P.neonMagenta }}>+ LIRIK</span>
        <div style={{ opacity: ramp(t, 3.8, 4.05), fontFamily: PIX, fontStyle: "normal", fontWeight: 400, fontSize: 58 * k, color: P.sunsetAmber, textShadow: glow("rgba(255,158,0,0.8)", 14 * k), marginTop: 10 * k }}>tanpa bisa main musik</div>
      </Headline>
      <Headline kicker="AUDIRA AI TUTORIAL · EP 06" k={k} t={t} a={5.35} b={9.5} size={104}>
        Bikin lagu
        <br />
        pakai <Hl c={P.synthCyan}>Gemini</Hl>
      </Headline>

      {/* KONTEKS */}
      <Headline kicker="FITUR DI GEMINI" k={k} t={t} a={9.6} b={12.45} size={96}>
        Sekarang bisa
        <br />
        bikin musik
        <div style={{ position: "relative", height: 100 * k, marginTop: 24 * k }}>
          <Btn x={0} y={0} w={420} h={88} k={k} label="♪ Create music" hot={hotAt(t, 11.67, 1.2)} color={P.neonMagenta} size={52} />
        </div>
      </Headline>
      <Headline kicker="MESIN MUSIKNYA" k={k} t={t} a={12.5} b={18.15} size={150}>
        <span style={{ color: P.synthCyan, opacity: 0.25 + 0.75 * ramp(t, 14.0, 14.3) }}>LYRIA</span>
        <div style={{ fontFamily: PIX, fontStyle: "normal", fontWeight: 400, fontSize: 52 * k, color: "#F4F1FF", marginTop: 6 * k, opacity: ramp(t, 15.2, 15.5) }}>musik + lirik sekaligus</div>
      </Headline>
      <LyriaFlow t={t} k={k} />

      {/* LANGKAH */}
      <StepHeader n={1} title="Buka gemini.google.com" k={k} t={t} a={18.6} b={21.05} />
      <StepHeader n={2} title={<>Upload &amp; tools</>} sub="lalu pilih Create music" k={k} t={t} a={21.05} b={26.25} />
      <StepHeader n={3} title="Unggah foto / video" sub="opsional · bahan cerita" k={k} t={t} a={26.25} b={30.25} />
      <StepHeader n={4} title="Tulis perintahmu" sub={t < 37.5 ? "buat/tulis + genre + alat musik" : t < 43.55 ? "contoh perintah" : "makin jelas suasananya, makin terarah"} k={k} t={t} a={30.25} b={46.85} />
      {flash > 0 && <AbsoluteFill style={{ background: "#FF7AD9", opacity: flash * 0.55, mixBlendMode: "screen" }} />}

      {/* PENJELASAN */}
      <StepHeader n={5} title="Atur panjang lagu" sub="pendek ±1 mnt · penuh ±2–3 mnt" k={k} t={t} a={47.25} b={53.65} />
      <StepHeader n={6} title="Vokal & genre" sub="pakai vokal atau tidak" k={k} t={t} a={53.65} b={56.65} />
      <StepHeader n={7} title="Lagu penuh? Model Pro" sub="ganti modelnya dulu" k={k} t={t} a={56.65} b={59.1} />
      <Terminal t={t} k={k} />
      <Headline kicker="SELESAI" k={k} t={t} a={59.25} b={63.7} size={96}>
        Siap <Hl c={P.phosphorGreen}>diunduh</Hl>
        <br />
        atau <Hl>dibagikan</Hl>
      </Headline>
      <ResultCard t={t} k={k} />
      <Headline kicker="KURANG PAS?" k={k} t={t} a={63.75} b={67.35} size={96}>
        Ubah perintah,
        <br />
        <Hl c={P.phosphorGreen}>buat lagi</Hl>
      </Headline>
      <RetryCard t={t} k={k} />

      {/* PAYOFF */}
      <Headline kicker="SEBELUM MULAI" k={k} t={t} a={67.45} b={74.1} size={104}>
        Ada <Hl c={P.sunsetAmber}>syaratnya</Hl>
      </Headline>
      <Checklist t={t} k={k} />
      <WarnCard x={60} y={262} w={960} k={k} t={t} a={74.15} b={78.95} kicker="TANDA AIR DIGITAL" icon="AI" color={P.phosphorGreen}>
        Tiap lagu ditandai,
        <br />
        <span style={{ opacity: 0.3 + 0.7 * ramp(t, 77.4, 77.7) }}>
          dikenali sebagai <Hl c={P.phosphorGreen}>buatan AI</Hl>
        </span>
      </WarnCard>
      <Headline kicker="JADI..." k={k} t={t} a={79.0} b={81.55} size={110}>
        <Hl c={P.synthCyan}>Jujurlah</Hl>
        <br />
        saat unggah
      </Headline>
      <HonestCard t={t} k={k} />

      {/* OUTRO */}
      <Headline kicker="EPISODE DEPAN" k={k} t={t} a={81.6} b={85.0} size={100}>
        Bikin aplikasi
        <br />
        <Hl c={P.synthCyan}>tanpa coding</Hl>
      </Headline>
      <Headline kicker="AUDIRA AI TUTORIAL" k={k} t={t} a={85.0} b={90.3} size={110}>
        Ini <Hl>AUDIRA</Hl>
      </Headline>

      {/* CRT scanlines over everything */}
      <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) ${2 * k}px, transparent ${2 * k}px, transparent ${5 * k}px)`, mixBlendMode: "multiply", pointerEvents: "none" }} />
      <Captions t={t} k={k} hideAfter={OUTRO_AT} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};

