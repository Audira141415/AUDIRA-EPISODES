// EP05 film: "Belajar Pakai AI Tanpa Nyontek: Mode Guided Learning" (SKETCHFORGE).
// One continuous 3D study desk (World.tsx, camera.ts) under 2D sketch layers: step headers,
// a hand-drawn chat UI with a pencil cursor, chat bubbles, warning/info cards, karaoke captions.
// Every beat is keyed to timeline.json seconds (Audio Master Clock).
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { WorldScene, BULB_WORLD, bulbLit, stepWorld } from "./World.tsx";
import { project } from "./camera.ts";
import { Captions } from "./Captions.tsx";
import { Accent, Card, HAND, MONO, NoteCard, PencilCursor, StepHeader, T, outBack, ramp, sm, typed, win } from "./ui.tsx";

const OUTRO_AT = TL.sections.outro[1] + 0.2;

// ---------------------------------------------------------------- tutorial UI sheet (LANGKAH 1-4)
const PX = 90, PY = 470, PW = 900, PH = 840;
type Tap = { t: number; x: number; y: number };
// cursor path: panel-local targets, tap times locked to the spoken words
const TAPS: Tap[] = [
  { t: 23.0, x: 560, y: 52 }, // rests at the URL while it types
  { t: 25.45, x: 800, y: 150 }, // "masuk"
  { t: 27.8, x: 150, y: 772 }, // "Add files"
  { t: 28.95, x: 210, y: 500 }, // "More tools"
  { t: 30.4, x: 560, y: 500 }, // "Guided Learning"
  { t: 31.75, x: 330, y: 600 }, // focus the text box ("Tulis")
  { t: 37.45, x: 150, y: 772 }, // "Add files" again (upload)
  { t: 38.3, x: 210, y: 432 }, // "Upload file"
  { t: 40.0, x: 330, y: 650 }, // back to the text box
  { t: 42.0, x: 812, y: 772 }, // send
];
const TAP_PRESS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

const cursorAt = (t: number) => {
  let i = 0;
  while (i < TAPS.length - 1 && t >= TAPS[i + 1].t) i++;
  const a = TAPS[i], b = TAPS[Math.min(i + 1, TAPS.length - 1)];
  // travel during the 0.55 s before the next tap, otherwise hover with a small wobble
  const k = b === a ? 0 : sm(ramp(t, b.t - 0.55, b.t - 0.05));
  const x = a.x + (b.x - a.x) * k + Math.sin(t * 2.1) * 3;
  const y = a.y + (b.y - a.y) * k + Math.cos(t * 1.7) * 3;
  let press = 0, ripple = 0;
  TAPS.forEach((tp, j) => {
    if (!TAP_PRESS.has(j)) return;
    const d = t - tp.t;
    if (d > -0.12 && d < 0.18) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.15);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  });
  return { x, y, press: Math.max(0, press), ripple };
};

const Btn: React.FC<{ x: number; y: number; w: number; h: number; k: number; label: string; hot?: number; dark?: boolean; size?: number }> = ({ x, y, w, h, k, label, hot = 0, dark = false, size = 30 }) => (
  <div
    style={{
      position: "absolute",
      left: x * k,
      top: y * k,
      width: w * k,
      height: h * k,
      borderRadius: h * 0.5 * k,
      border: `${3 * k}px solid ${hot > 0.5 ? P.accent : P.graphite}`,
      background: dark ? P.graphite : hot > 0 ? `rgba(240,83,45,${0.14 * hot})` : "rgba(255,255,255,0.4)",
      color: dark ? P.paperWhite : P.graphite,
      fontFamily: HAND,
      fontWeight: 700,
      fontSize: size * k,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${1 + hot * 0.04})`,
      boxShadow: hot > 0.5 ? `0 0 0 ${6 * k}px rgba(240,83,45,0.18)` : undefined,
    }}
  >
    {label}
  </div>
);

const MenuItem: React.FC<{ y: number; k: number; label: string; hot?: number; w: number }> = ({ y, k, label, hot = 0, w }) => (
  <div style={{ position: "absolute", left: 14 * k, top: y * k, width: (w - 28) * k, height: 58 * k, borderRadius: 8 * k, background: hot > 0 ? `rgba(240,83,45,${0.2 * hot})` : "transparent", border: hot > 0.5 ? `${3 * k}px solid ${P.accent}` : `${3 * k}px solid transparent`, fontFamily: HAND, fontWeight: 700, fontSize: 30 * k, color: P.graphite, display: "flex", alignItems: "center", paddingLeft: 16 * k, boxSizing: "border-box" }}>
    {label}
  </div>
);

const Scribble: React.FC<{ y: number; k: number; w: number }> = ({ y, k, w }) => (
  <div style={{ position: "absolute", left: 30 * k, top: y * k, width: w * k, height: 10 * k, borderRadius: 5 * k, background: "rgba(90,91,97,0.25)" }} />
);

/** Small "photo of a worksheet": generic lines, no maths claim. */
const SoalThumb: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", inset: 0, background: P.paper, border: `${3 * k}px solid ${P.graphite}`, boxShadow: `0 ${4 * k}px ${10 * k}px rgba(0,0,0,0.3)` }}>
    <div style={{ position: "absolute", left: 10 * k, top: 8 * k, fontFamily: HAND, fontWeight: 700, fontSize: 20 * k, color: P.graphite }}>Soal 1-5</div>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: "absolute", left: 10 * k, top: (44 + i * 18) * k, width: (90 - (i % 2) * 24) * k, height: 5 * k, background: "rgba(47,48,52,0.4)" }} />
    ))}
  </div>
);

const UiSheet: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 22.85, b = 42.75;
  if (t < a || t > b) return null;
  const inK = sm(ramp(t, a, a + 0.55));
  const outK = sm(ramp(t, b - 0.4, b));
  const url = typed("gemini.google.com", t, 23.25, 24.85);
  const loggedIn = t >= 25.45;
  const menu1 = (t >= 27.8 && t < 30.4) || (t >= 37.45 && t < 38.3);
  const menu2 = t >= 28.95 && t < 30.4;
  const chip = t >= 30.4;
  const chipPop = outBack(ramp(t, 30.4, 30.75));
  const topic = typed("aku belum paham persamaan kuadrat", t, 33.85, 35.1);
  const ask = typed("bimbing aku memahaminya, bukan dijawabkan", t, 40.1, 41.85);
  const thumbK = sm(ramp(t, 38.35, 38.95));
  const sent = ramp(t, 42.05, 42.4);
  const caret = Math.floor(t * 2.4) % 2 === 0 ? "|" : " ";
  const typingTopic = t >= 31.75 && t < 35.4;
  const typingAsk = t >= 40.0 && t < 42.05;
  const c = cursorAt(t);
  const hot = (tt: number) => (t >= tt - 0.1 ? Math.max(0, 1 - Math.max(0, t - tt - 0.6) / 0.4) : 0);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inK * (1 - outK), transform: `translateY(${(1 - inK) * 60 * k - outK * 80 * k}px) perspective(${1600 * k}px) rotateX(${(1 - inK) * 18 + Math.sin(t * 0.3) * 1.2}deg) rotateZ(${-0.8 + Math.sin(t * 0.21) * 0.4}deg)`, transformOrigin: "50% 60%" }}>
      <Card x={PX} y={PY} w={PW} h={PH} k={k} seed={7}>
        {/* browser bar */}
        <div style={{ position: "absolute", left: 0, top: 0, width: PW * k, height: 96 * k, background: "rgba(226,214,194,0.7)", borderBottom: `${3 * k}px solid ${P.graphite}` }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: (28 + i * 34) * k, top: 36 * k, width: 22 * k, height: 22 * k, borderRadius: "50%", border: `${3 * k}px solid ${P.graphite}`, background: i === 0 ? P.accent : "transparent" }} />
        ))}
        <div style={{ position: "absolute", left: 140 * k, top: 20 * k, width: 720 * k, height: 58 * k, borderRadius: 29 * k, border: `${3 * k}px solid ${P.graphite}`, background: P.paperWhite }} />
        <T x={170} y={27} k={k} size={34} font={MONO}>
          {url}
          {t < 25 ? caret : ""}
        </T>
        {/* account */}
        {!loggedIn ? (
          <Btn x={720} y={122} w={150} h={58} k={k} label="Masuk" hot={hot(25.45)} />
        ) : (
          <div style={{ position: "absolute", left: 760 * k, top: 116 * k, display: "flex", alignItems: "center", gap: 10 * k, transform: `scale(${outBack(ramp(t, 25.45, 25.8))})` }}>
            <div style={{ fontFamily: HAND, fontSize: 26 * k, color: P.graphiteMid }}>akunmu</div>
            <div style={{ width: 64 * k, height: 64 * k, borderRadius: "50%", background: P.accent, color: P.paperWhite, fontFamily: HAND, fontWeight: 700, fontSize: 36 * k, display: "flex", alignItems: "center", justifyContent: "center", border: `${3 * k}px solid ${P.graphite}` }}>A</div>
          </div>
        )}
        {/* page greeting */}
        <T x={60} y={230} k={k} size={60} color={P.graphite}>
          {t < 25.45 ? "Masuk dulu ke akunmu" : "Halo, mau belajar apa?"}
        </T>
        <div style={{ position: "absolute", left: 60 * k, top: 318 * k, width: (t < 25.45 ? 520 : 560) * k, height: 6 * k, background: P.accent, borderRadius: 3 * k, transform: `scaleX(${sm(ramp(t, 23.3, 24.2))})`, transformOrigin: "0 50%" }} />
        {/* chat box */}
        <div style={{ position: "absolute", left: 40 * k, top: 540 * k, width: 820 * k, height: 280 * k, borderRadius: 28 * k, border: `${4 * k}px solid ${typingTopic || typingAsk ? P.accent : P.graphite}`, background: "rgba(255,255,255,0.55)" }} />
        {!topic && !typingTopic && (
          <T x={80} y={575} k={k} size={34} color={P.graphiteSoft} weight={400}>
            Tanya apa saja…
          </T>
        )}
        {(topic || typingTopic) && (
          <T x={80} y={570} k={k} size={36} w={thumbK > 0 ? 560 : 720} lh={1.25}>
            {topic}
            {typingTopic && t > 33 ? caret : ""}
          </T>
        )}
        {(ask || typingAsk) && (
          <T x={80} y={660} k={k} size={32} w={560} lh={1.2} color={P.accentDeep}>
            {ask}
            {typingAsk ? caret : ""}
          </T>
        )}
        {thumbK > 0 && (
          <div style={{ position: "absolute", left: (690 + (1 - thumbK) * 120) * k, top: (560 - (1 - thumbK) * 260) * k, width: 140 * k, height: 130 * k, transform: `rotate(${(1 - thumbK) * 14 - 3}deg) scale(${0.8 + 0.2 * thumbK})` }}>
            <SoalThumb k={k} />
          </div>
        )}
        <Btn x={60} y={744} w={190} h={56} k={k} label="+ Add files" hot={Math.max(hot(27.8), hot(37.45))} size={28} />
        {chip && (
          <div style={{ position: "absolute", left: 270 * k, top: 744 * k, height: 56 * k, padding: `0 ${18 * k}px`, borderRadius: 28 * k, background: P.accent, color: P.paperWhite, fontFamily: HAND, fontWeight: 700, fontSize: 28 * k, display: "flex", alignItems: "center", gap: 8 * k, transform: `scale(${chipPop})`, transformOrigin: "0 50%" }}>
            ✎ Guided Learning
          </div>
        )}
        <div style={{ position: "absolute", left: 784 * k, top: 744 * k, width: 58 * k, height: 58 * k, borderRadius: "50%", background: sent > 0 && sent < 1 ? P.accent : P.graphite, color: P.paperWhite, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 * k, fontFamily: HAND, fontWeight: 700 }}>↑</div>
        {/* menus */}
        {menu1 && (
          <div style={{ position: "absolute", left: 50 * k, top: 388 * k, width: 330 * k, height: 150 * k, background: P.paperWhite, border: `${3 * k}px solid ${P.graphite}`, borderRadius: 14 * k, boxShadow: `0 ${8 * k}px ${18 * k}px rgba(0,0,0,0.3)`, transform: `scale(${outBack(ramp(t, t < 33 ? 27.8 : 37.45, (t < 33 ? 27.8 : 37.45) + 0.25))})`, transformOrigin: "10% 100%" }}>
            <MenuItem y={14} k={k} w={330} label="⇪  Upload file" hot={hot(38.3)} />
            <MenuItem y={80} k={k} w={330} label="☰  More tools  ›" hot={t < 33 ? hot(28.95) : 0} />
          </div>
        )}
        {menu2 && (
          <div style={{ position: "absolute", left: 392 * k, top: 330 * k, width: 380 * k, height: 208 * k, background: P.paperWhite, border: `${3 * k}px solid ${P.graphite}`, borderRadius: 14 * k, boxShadow: `0 ${8 * k}px ${18 * k}px rgba(0,0,0,0.3)`, transform: `scale(${outBack(ramp(t, 28.95, 29.2))})`, transformOrigin: "0% 80%" }}>
            <Scribble y={34} k={k} w={220} />
            <Scribble y={84} k={k} w={180} />
            <MenuItem y={136} k={k} w={380} label="✎  Guided Learning" hot={hot(30.4)} />
          </div>
        )}
        {/* "send" flourish */}
        {sent > 0 && sent < 1 && <div style={{ position: "absolute", left: 790 * k, top: (700 - sent * 200) * k, fontFamily: HAND, fontSize: 46 * k, color: P.accent, opacity: 1 - sent }}>✓</div>}
        {/* cursor (panel-local) */}
        <PencilCursor x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} />
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------- 3D-pinned labels
const Pin: React.FC<{ t: number; k: number; width: number; height: number; at: [number, number, number]; o: number; label: string; n: string; dx?: number; dy?: number }> = ({ t, k, width, height, at, o, label, n, dx = 0, dy = -150 }) => {
  if (o <= 0.001) return null;
  const p = project(t, at, width, height);
  if (p.behind) return null;
  const x = p.x / k, y = p.y / k;
  const lx = x + dx, ly = y + dy;
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
        <line x1={x * k} y1={y * k} x2={lx * k} y2={(ly + 40) * k} stroke={P.paperWhite} strokeWidth={3 * k} strokeDasharray={`${8 * k} ${6 * k}`} />
        <circle cx={x * k} cy={y * k} r={8 * k} fill={P.accent} stroke={P.paperWhite} strokeWidth={3 * k} />
      </svg>
      <div style={{ position: "absolute", left: (lx - 150) * k, top: (ly - 30) * k, width: 300 * k, opacity: o, transform: `scale(${0.85 + 0.15 * o})`, display: "flex", justifyContent: "center" }}>
        <div style={{ background: P.paperWhite, border: `${3 * k}px solid ${P.graphite}`, padding: `${6 * k}px ${14 * k}px`, boxShadow: `0 ${6 * k}px ${14 * k}px rgba(0,0,0,0.4)`, fontFamily: HAND, fontWeight: 700, fontSize: 32 * k, color: P.graphite, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10 * k }}>
          <span style={{ color: P.paperWhite, background: P.accent, borderRadius: "50%", width: 40 * k, height: 40 * k, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26 * k }}>{n}</span>
          {label}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- chat bubbles (PENJELASAN)
const Bubble: React.FC<{ k: number; t: number; a: number; b: number; x: number; y: number; w: number; who: string; me?: boolean; children: React.ReactNode }> = ({ k, t, a, b, x, y, w, who, me = false, children }) => {
  const o = win(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.4));
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, width: w * k, opacity: o, transform: `scale(${0.7 + 0.3 * pop})`, transformOrigin: me ? "90% 100%" : "10% 100%" }}>
      <div style={{ position: "relative", background: me ? P.graphite : P.paperWhite, color: me ? P.paperWhite : P.graphite, border: `${3 * k}px solid ${P.graphite}`, borderRadius: 26 * k, padding: `${16 * k}px ${24 * k}px`, boxShadow: `0 ${8 * k}px ${20 * k}px rgba(0,0,0,0.45)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22 * k, letterSpacing: 3 * k, color: me ? P.accentGlow : P.accentDeep }}>{who}</div>
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 40 * k, lineHeight: 1.22 }}>{children}</div>
      </div>
    </div>
  );
};

const Tile: React.FC<{ k: number; t: number; at: number; x: number; label: string; icon: React.ReactNode }> = ({ k, t, at, x, label, icon }) => {
  const p = outBack(ramp(t, at, at + 0.35));
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x * k, top: 238 * k, width: 270 * k, height: 210 * k, transform: `scale(${p}) rotate(${(x % 3) - 1}deg)`, background: P.paper, border: `${3 * k}px solid ${P.graphite}`, boxShadow: `0 ${6 * k}px ${14 * k}px rgba(0,0,0,0.3)` }}>
      <svg width={270 * k} height={150 * k} viewBox="0 0 270 150">
        {icon}
      </svg>
      <div style={{ position: "absolute", bottom: 8 * k, width: "100%", textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 32 * k, color: P.graphite }}>{label}</div>
    </div>
  );
};

const ExplainCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 52.25, b = 57.3;
  const o = win(t, a, b, 0.35, 0.3);
  if (o <= 0) return null;
  const ink = "#2F3034";
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, width: 984 * k, height: 470 * k, opacity: o, transform: `translateY(${(1 - sm(ramp(t, a, a + 0.5))) * -30 * k}px)` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(38,38,42,0.88)", borderLeft: `${7 * k}px solid ${P.accent}`, boxShadow: `0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.4)` }} />
      <div style={{ position: "absolute", left: 30 * k, top: 18 * k, fontFamily: MONO, fontWeight: 700, fontSize: 22 * k, letterSpacing: 4 * k, color: P.accentGlow }}>③ PENJELASAN DISESUAIKAN</div>
      <div style={{ position: "absolute", left: 30 * k, top: 58 * k, fontFamily: HAND, fontWeight: 700, fontSize: 40 * k, color: P.paperWhite }}>Bentuk umum persamaan kuadrat:</div>
      <div style={{ position: "absolute", left: 30 * k, top: 118 * k, fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: "italic", fontSize: 64 * k, color: P.accentGlow, letterSpacing: 2 * k }}>
        {typed("ax² + bx + c = 0", t, 53.0, 54.3)}
      </div>
      <Tile k={k} t={t} at={55.1} x={30} label="gambar" icon={<path d="M 40 30 Q 135 230 230 30" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />} />
      <Tile
        k={k}
        t={t}
        at={55.77}
        x={327}
        label="diagram"
        icon={
          <g stroke={ink} strokeWidth={4} fill="none">
            <rect x={20} y={50} width={60} height={44} />
            <rect x={105} y={50} width={60} height={44} />
            <rect x={190} y={50} width={60} height={44} fill={P.accent} />
            <path d="M 80 72 L 105 72 M 165 72 L 190 72" />
          </g>
        }
      />
      <Tile
        k={k}
        t={t}
        at={56.79}
        x={624}
        label="video"
        icon={
          <g>
            <rect x={45} y={25} width={180} height={110} rx={12} stroke={ink} strokeWidth={4} fill="none" />
            <polygon points="118,55 118,105 160,80" fill={P.accent} />
          </g>
        }
      />
    </div>
  );
};

// ---------------------------------------------------------------- PAYOFF cards
const QuizSheet: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 59.6, b = 64.4;
  const o = win(t, a, b, 0.35, 0.3);
  if (o <= 0) return null;
  const prompt = typed("buatkan kuis & flashcard dari materi ini", t, 59.75, 61.3);
  const quiz = outBack(ramp(t, 60.41, 60.75));
  const flash = outBack(ramp(t, 60.93, 61.27));
  const share = t >= 63.15;
  const fly = sm(ramp(t, 63.3, 63.95));
  const tapP = t > 63.03 && t < 63.33 ? 1 - Math.abs(t - 63.18) / 0.15 : 0;
  const rip = t >= 63.15 && t < 63.65 ? (t - 63.15) / 0.5 : 0;
  const cx = 300 + sm(ramp(t, 62.3, 63.1)) * 360, cy = 380 + sm(ramp(t, 62.3, 63.1)) * 300;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, transform: `translateY(${(1 - sm(ramp(t, a, a + 0.5))) * 60 * k}px) rotate(-0.8deg)` }}>
      <Card x={90} y={470} w={900} h={820} k={k} seed={9}>
        <div style={{ position: "absolute", left: 40 * k, top: 30 * k, width: 820 * k, height: 110 * k, borderRadius: 26 * k, border: `${4 * k}px solid ${P.accent}`, background: "rgba(255,255,255,0.6)" }} />
        <T x={70} y={58} k={k} size={36}>
          {prompt}
        </T>
        {/* quiz card */}
        <div style={{ position: "absolute", left: 60 * k, top: 190 * k, width: 380 * k, height: 380 * k, transform: `scale(${quiz}) rotate(-4deg)`, background: P.paper, border: `${4 * k}px solid ${P.graphite}`, boxShadow: `0 ${8 * k}px ${16 * k}px rgba(0,0,0,0.35)` }}>
          <T x={24} y={20} k={k} size={26} font={MONO} color={P.accentDeep}>
            KUIS · 1/5
          </T>
          {["A", "B", "C", "D"].map((L, i) => (
            <div key={L} style={{ position: "absolute", left: 24 * k, top: (90 + i * 66) * k, width: 320 * k, height: 50 * k, border: `${3 * k}px solid ${P.graphite}`, borderRadius: 25 * k, display: "flex", alignItems: "center", paddingLeft: 16 * k, fontFamily: HAND, fontWeight: 700, fontSize: 26 * k, color: P.graphite, boxSizing: "border-box", gap: 14 * k }}>
              {L}
              <span style={{ display: "inline-block", width: (150 - i * 18) * k, height: 6 * k, background: "rgba(47,48,52,0.3)" }} />
            </div>
          ))}
        </div>
        {/* flashcards stack */}
        <div style={{ position: "absolute", left: 470 * k, top: 200 * k, width: 370 * k, height: 360 * k, transform: `scale(${flash}) rotate(5deg)` }}>
          {[2, 1, 0].map((i) => (
            <div key={i} style={{ position: "absolute", left: i * 14 * k, top: i * -14 * k, width: 340 * k, height: 330 * k, background: i === 0 ? P.paperWhite : P.paperShade, border: `${4 * k}px solid ${P.graphite}`, boxShadow: `0 ${6 * k}px ${12 * k}px rgba(0,0,0,0.3)` }} />
          ))}
          <T x={30} y={40} k={k} size={26} font={MONO} color={P.accentDeep}>
            FLASHCARD
          </T>
          <T x={30} y={110} k={k} size={40} w={290}>
            Bentuk umum?
          </T>
          <T x={30} y={230} k={k} size={26} color={P.graphiteMid} weight={400}>
            balik kartu ↻
          </T>
        </div>
        {/* share */}
        <div style={{ position: "absolute", left: 560 * k, top: 640 * k }}>
          <Btn x={0} y={0} w={240} h={70} k={k} label="⇪ Bagikan" hot={share ? Math.max(0, 1 - (t - 63.75) / 0.4) : 0} dark={share} size={32} />
        </div>
        {[0, 1].map((i) => {
          const fx = 120 + i * 170;
          const fp = sm(ramp(t, 63.4 + i * 0.15, 63.9 + i * 0.15));
          return (
            <div key={i} style={{ position: "absolute", left: fx * k, top: 615 * k, opacity: 0.35 + 0.65 * fp, textAlign: "center" }}>
              <div style={{ width: 100 * k, height: 100 * k, borderRadius: "50%", border: `${4 * k}px solid ${fp > 0.5 ? P.accent : P.graphite}`, background: P.paper, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 32 * k, top: 18 * k, width: 36 * k, height: 36 * k, borderRadius: "50%", background: P.graphiteMid }} />
                <div style={{ position: "absolute", left: 16 * k, top: 60 * k, width: 68 * k, height: 60 * k, borderRadius: "50%", background: P.graphiteMid }} />
              </div>
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 26 * k, color: P.graphite }}>teman</div>
            </div>
          );
        })}
        {fly > 0 && fly < 1 && (
          <svg width={900 * k} height={820 * k} style={{ position: "absolute", left: 0, top: 0 }}>
            <path d={`M ${560 * k} ${675 * k} Q ${420 * k} ${560 * k} ${(380 - fly * 160) * k} ${640 * k}`} stroke={P.accent} strokeWidth={5 * k} fill="none" strokeDasharray={`${12 * k} ${8 * k}`} />
          </svg>
        )}
        <PencilCursor x={cx} y={cy} k={k} press={Math.max(0, tapP)} ripple={rip} />
      </Card>
    </div>
  );
};

const ScoreCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 64.45, b = 66.6;
  const o = win(t, a, b, 0.25, 0.25);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.35));
  const loop = sm(ramp(t, 65.5, 66.3));
  const R = 120;
  const arc = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: 560 * k, top: 470 * k, width: 440 * k, height: 440 * k, opacity: o, transform: `scale(${pop}) rotate(3deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: P.paperWhite, border: `${4 * k}px solid ${P.graphite}`, boxShadow: `0 ${10 * k}px ${24 * k}px rgba(0,0,0,0.45)` }} />
      <T x={30} y={24} k={k} size={24} font={MONO} color={P.accentDeep}>
        SKOR KUIS
      </T>
      <T x={30} y={60} k={k} size={110} color={P.accent}>
        2/5
      </T>
      <svg width={440 * k} height={440 * k} viewBox="0 0 440 440" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={300} cy={300} r={R / 1.6} stroke={P.graphite} strokeWidth={6} fill="none" strokeDasharray={`${(arc / 1.6) * loop} ${arc}`} transform="rotate(-90 300 300)" strokeLinecap="round" />
        {loop > 0.95 && <polygon points="296,210 330,226 296,242" fill={P.graphite} />}
      </svg>
      <T x={30} y={330} k={k} size={36} w={230}>
        ulangi langkah tadi
      </T>
    </div>
  );
};

const WarnCard: React.FC<{ t: number; k: number; a: number; b: number; kicker: string; children: React.ReactNode; top?: number; icon?: string }> = ({ t, k, a, b, kicker, children, top = 268, icon = "!" }) => {
  const o = win(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, a, a + 0.4));
  return (
    <div style={{ position: "absolute", left: 48 * k, top: top * k, width: 984 * k, opacity: o, transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: "0 0", display: "flex", gap: 20 * k, alignItems: "stretch", background: P.paperWhite, border: `${5 * k}px solid ${P.accent}`, boxShadow: `0 ${10 * k}px ${26 * k}px rgba(0,0,0,0.45)`, padding: `${18 * k}px ${22 * k}px`, boxSizing: "border-box" }}>
      <div style={{ flex: "none", width: 96 * k, height: 96 * k, borderRadius: "50%", background: P.accent, color: P.paperWhite, fontFamily: HAND, fontWeight: 700, fontSize: 66 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: 4 * k, color: P.accentDeep }}>{kicker}</div>
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 44 * k, lineHeight: 1.2, color: P.graphite }}>{children}</div>
      </div>
    </div>
  );
};

const CompareCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 13.3, b = 17.45;
  const o = win(t, a, b);
  if (o <= 0) return null;
  const strike = sm(ramp(t, 15.85, 16.9));
  const yes = outBack(ramp(t, 14.8, 15.15));
  const no = outBack(ramp(t, 15.8, 16.15));
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, width: 984 * k, opacity: o }}>
      <div style={{ background: "rgba(38,38,42,0.88)", borderLeft: `${7 * k}px solid ${P.accent}`, padding: `${14 * k}px ${26 * k}px ${22 * k}px`, boxShadow: `0 ${8 * k}px ${24 * k}px rgba(0,0,0,0.35)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * k, letterSpacing: 5 * k, color: P.paper }}>MENURUT GOOGLE, TUJUANNYA:</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * k, marginTop: 10 * k, transform: `scale(${yes})`, transformOrigin: "0 50%" }}>
          <span style={{ color: P.paperWhite, background: P.accent, borderRadius: "50%", width: 56 * k, height: 56 * k, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 38 * k, fontFamily: HAND, fontWeight: 700 }}>✓</span>
          <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: 54 * k, color: P.paperWhite }}>membangun pemahaman</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * k, marginTop: 8 * k, transform: `scale(${no})`, transformOrigin: "0 50%", opacity: 0.85 }}>
          <span style={{ color: P.graphite, background: P.paper, borderRadius: "50%", width: 56 * k, height: 56 * k, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 38 * k, fontFamily: HAND, fontWeight: 700 }}>✗</span>
          <span style={{ position: "relative", fontFamily: HAND, fontWeight: 700, fontSize: 46 * k, color: P.paper }}>
            sekadar jawaban cepat
            <span style={{ position: "absolute", left: 0, top: "52%", height: 6 * k, width: `${strike * 100}%`, background: P.accent, borderRadius: 3 * k }} />
          </span>
        </div>
      </div>
    </div>
  );
};

const OutroCards: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const dots = (
    <div style={{ display: "flex", gap: 14 * k, marginTop: 12 * k }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i < 5 || t > 80.0;
        return (
          <div key={i} style={{ width: 54 * k, height: 54 * k, borderRadius: "50%", border: `${4 * k}px solid ${P.paperWhite}`, background: on ? (i === 5 ? P.accent : P.graphiteMid) : "transparent", color: P.paperWhite, fontFamily: HAND, fontWeight: 700, fontSize: 30 * k, display: "flex", alignItems: "center", justifyContent: "center", transform: i === 5 ? `scale(${1 + 0.25 * Math.sin(ramp(t, 80.0, 80.4) * Math.PI)})` : undefined }}>
            {i}
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <NoteCard kicker="KALAU MEMBANTU" k={k} t={t} a={75.3} b={78.2} size={70}>
        <Accent>Simpan</Accent> &amp; <Accent>bagikan</Accent>
      </NoteCard>
      <NoteCard kicker="EPISODE TERAKHIR · SERI AI TUTORIAL" k={k} t={t} a={78.3} b={81.4} size={56}>
        Episode 5 dari 5{dots}
      </NoteCard>
      <Bubble k={k} t={t} a={81.5} b={86.2} x={90} y={290} w={900} who="KOMENTAR">
        Seri berikutnya bahas alat apa?
        <br />
        <span style={{ color: P.accent }}>{typed("tulis di komentar…", t, 84.13, 85.1)}</span>
      </Bubble>
    </>
  );
};

// ---------------------------------------------------------------- film
export const Ep05Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  const lit = bulbLit(t);
  const bulb = project(t, BULB_WORLD, width, height);
  const R0 = (300 + Math.sin(t * 2.4) * 10) * k;
  // step labels pinned to the three treads (KONTEKS: what Guided Learning does; PENJELASAN: the dialogue)
  const pinsA = [
    { at: 18.0, label: "bertanya balik", n: "1" },
    { at: 19.15, label: "langkah demi langkah", n: "2" },
    { at: 20.54, label: "sesuai kebutuhanmu", n: "3" },
  ];
  return (
    <AbsoluteFill style={{ background: P.desk }}>
      <ThreeCanvas flat width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.45, 6.4, 10], fov: 42 }}>
        <WorldScene t={t} f={f} />
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.85} envIntensity={0.25} />
      </ThreeCanvas>
      {/* idea-bulb halo: 2D screen-blend glow at the projected bulb (bloom alone gives no halo here) */}
      {lit > 0.01 && !bulb.behind && (
        <div style={{ position: "absolute", left: bulb.x - R0, top: bulb.y - R0, width: R0 * 2, height: R0 * 2, borderRadius: "50%", mixBlendMode: "screen", opacity: lit, background: "radial-gradient(circle, rgba(255,226,190,0.62) 0%, rgba(255,176,122,0.36) 22%, rgba(240,83,45,0.12) 50%, rgba(240,83,45,0) 72%)" }} />
      )}

      {/* HOOK */}
      <NoteCard kicker="PR BERES DALAM SEDETIK?" k={k} t={t} a={0.0} b={3.45} size={78}>
        Minta AI kerjakan PR?
      </NoteCard>
      <NoteCard kicker="TAPI..." k={k} t={t} a={3.5} b={6.6} size={78}>
        Benar-benar <Accent>paham</Accent>?
      </NoteCard>
      <NoteCard kicker="AUDIRA AI TUTORIAL · EP 5" k={k} t={t} a={6.75} b={9.9} size={76}>
        Mode <Accent>Guided Learning</Accent>
      </NoteCard>

      {/* KONTEKS */}
      <NoteCard kicker="APA ITU?" k={k} t={t} a={10.15} b={13.25} size={64}>
        Guided Learning =<br />
        mode <Accent>belajar</Accent> di Gemini
      </NoteCard>
      <CompareCard t={t} k={k} />
      <NoteCard kicker="CARA DIA MEMBIMBING" k={k} t={t} a={17.6} b={22.35} size={58}>
        Satu anak tangga, satu pertanyaan
      </NoteCard>
      {pinsA.map((p, i) => (
        <Pin key={i} t={t} k={k} width={width} height={height} at={stepWorld(i)} o={win(t, p.at, 22.35, 0.3, 0.3)} label={p.label} n={p.n} dx={i === 2 ? -120 : i === 0 ? 40 : -40} dy={-170 - i * 60} />
      ))}

      {/* LANGKAH */}
      <StepHeader n={1} title="Buka gemini.google.com" sub="lalu masuk ke akunmu" k={k} t={t} a={22.95} b={26.4} />
      <StepHeader n={2} title="Add files → More tools" sub="→ pilih Guided Learning" k={k} t={t} a={26.4} b={31.3} />
      <StepHeader n={3} title="Tulis topik belajarmu" sub="contoh: persamaan kuadrat" k={k} t={t} a={31.3} b={35.4} />
      <StepHeader n={4} title="Unggah materi / foto soal" sub="minta dibimbing, bukan dijawabkan" k={k} t={t} a={35.4} b={42.7} />
      <UiSheet t={t} k={k} />

      {/* PENJELASAN */}
      <WarnCard t={t} k={k} a={42.85} b={45.85} kicker="BAGIAN TERPENTING">
        Jangan buru-buru minta <Accent>kunci jawaban</Accent>
      </WarnCard>
      <Bubble k={k} t={t} a={46.0} b={52.15} x={60} y={280} w={760} who="① GEMINI BERTANYA BALIK">
        {typed("Apa yang sudah kamu ketahui tentang bentuk umumnya?", t, 47.0, 48.95)}
      </Bubble>
      <Bubble k={k} t={t} a={49.55} b={52.15} x={360} y={500} w={660} who="② KAMU JAWAB" me>
        {typed("Hmm… ada x-nya? Belum yakin.", t, 49.8, 50.9)}
        {t > 51.4 && <div style={{ fontSize: 28 * k, color: P.accentGlow, marginTop: 4 * k }}>✓ salah pun tidak apa-apa</div>}
      </Bubble>
      <ExplainCard t={t} k={k} />

      {/* PAYOFF */}
      <NoteCard kicker="SUDAH MERASA PAHAM?" k={k} t={t} a={57.62} b={59.55} size={84}>
        <Accent>Uji</Accent> dirimu.
      </NoteCard>
      <StepHeader n={5} title="Minta kuis / flashcard" sub="lalu bagikan ke teman belajar" k={k} t={t} a={59.6} b={64.4} />
      <QuizSheet t={t} k={k} />
      <StepHeader n={6} title="Skor masih rendah?" sub="ulangi langkah tadi" k={k} t={t} a={64.45} b={66.6} />
      <ScoreCard t={t} k={k} />
      <NoteCard kicker="BEGITULAH" k={k} t={t} a={66.7} b={69.75} size={74}>
        AI jadi <Accent>tutor</Accent>,<br />
        bukan tukang contek
      </NoteCard>
      <WarnCard t={t} k={k} a={69.9} b={74.9} kicker="INFO · APLIKASI HP" icon="i">
        Fitur dirilis bertahap. Belum muncul? Pakai <Accent>versi web</Accent>.
      </WarnCard>

      {/* OUTRO */}
      <OutroCards t={t} k={k} />

      <Captions t={t} k={k} hideAfter={OUTRO_AT} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
