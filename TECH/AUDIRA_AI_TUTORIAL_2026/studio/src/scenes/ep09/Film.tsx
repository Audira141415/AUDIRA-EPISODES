// EP09 film: "Riset 5 Menit Jadi Laporan Lengkap: Deep Research Gemini" (LIDARFORGE).
// One continuous LIDAR survey field (World.tsx, camera.ts): a tunnel of open tabs collapses into one
// glowing report; sources light up as they are named; a generic survey-glass UI walks the steps;
// the camera dollies into the report to "open" it. Every beat is keyed to timeline.json seconds.
import React, { useEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { BG, grot, mono } from "./Cover.tsx";
import { WorldScene } from "./World.tsx";
import { Captions } from "./Captions.tsx";
import { AMBER, Am, Blur, Brackets, Btn, CYAN, Cursor, Cy, GLASS, GROT, Headline, INK, MONO, Panel, StepHeader, T, WarnCard, outBack, ramp, sm, typed, win } from "./ui.tsx";

const OUTRO_AT = TL.sections.outro[1] + 0.2;

// ---------------------------------------------------------------- cursor helper
type Tap = { t: number; x: number; y: number; press?: boolean };
const cursorAt = (taps: Tap[], t: number) => {
  let i = 0;
  while (i < taps.length - 1 && t >= taps[i + 1].t) i++;
  const a = taps[i], b = taps[Math.min(i + 1, taps.length - 1)];
  const k = b === a ? 0 : sm(ramp(t, b.t - 0.55, b.t - 0.05));
  const x = a.x + (b.x - a.x) * k + Math.sin(t * 2.1) * 3;
  const y = a.y + (b.y - a.y) * k + Math.cos(t * 1.7) * 3;
  let press = 0, ripple = 0;
  taps.forEach((tp) => {
    if (!tp.press) return;
    const d = t - tp.t;
    if (d > -0.12 && d < 0.18) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.15);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  });
  return { x, y, press: Math.max(0, press), ripple };
};
const hotAt = (t: number, tt: number) => (t >= tt - 0.1 ? Math.max(0, 1 - Math.max(0, t - tt - 0.6) / 0.4) : 0);

// ---------------------------------------------------------------- LANGKAH 1-4: generic research chat UI
const PX = 60, PY = 470, PW = 960, PH = 860;
const TAPS: Tap[] = [
  { t: 24.9, x: 700, y: 46 },
  { t: 29.08, x: 270, y: 572, press: true }, // "Deep Research"
  { t: 31.0, x: 420, y: 330, press: true }, // focus the prompt box
  { t: 37.0, x: 820, y: 740 },
  { t: 40.56, x: 540, y: 572, press: true }, // sources
  { t: 41.95, x: 880, y: 572, press: true }, // send
  { t: 44.38, x: 170, y: 770, press: true }, // "Edit plan"
  { t: 46.74, x: 470, y: 770, press: true }, // "Start research"
];
const PROMPT = "bandingkan tiga cara menabung untuk mahasiswa, beserta kelebihan dan risikonya";
const SRC_ROWS: [string, string, number][] = [
  ["Google Search", "bawaan", 0],
  ["Gmail", "", 40.83],
  ["Drive", "", 41.0],
  ["File", "", 41.22],
  ["NotebookLM", "notebook", 41.4],
];

const ResearchUi: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 24.75, b = 47.55;
  if (t < a || t > b) return null;
  const inK = sm(ramp(t, a, a + 0.55));
  // exit: the panel collapses into a scan line (zoom-through to the running survey)
  const outK = sm(ramp(t, b - 0.6, b));
  const url = typed("gemini.google.com", t, 25.07, 26.6);
  const loaded = t >= 26.8;
  const drOn = t >= 29.08;
  const drPop = outBack(ramp(t, 29.08, 29.4));
  const prompt = typed(PROMPT, t, 32.39, 35.9);
  const typing = t >= 31.0 && t < 36.1;
  const caret = Math.floor(t * 2.4) % 2 === 0 ? "▌" : " ";
  const plan = t >= 42.05;
  const srcOpen = t >= 40.56 && t < 42.0;
  const meter = win(t, 36.26, 40.4, 0.3, 0.3);
  const editing = t >= 44.38;
  const started = t >= 46.74;
  const c = cursorAt(TAPS, t);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inK, transform: `translateY(${(1 - inK) * 70 * k}px) perspective(${1800 * k}px) rotateX(${(1 - inK) * 16 + Math.sin(t * 0.3) * 1.0}deg) rotateY(${Math.sin(t * 0.17) * 1.4}deg) scaleY(${1 - outK * 0.985}) scaleX(${1 + outK * 0.08})`, transformOrigin: "50% 55%" }}>
      <Panel x={PX} y={PY} w={PW} h={PH} k={k} t={t}>
        {/* browser bar */}
        <div style={{ position: "absolute", left: 0, top: 0, width: PW * k, height: 92 * k, background: "rgba(0,240,255,0.06)", borderBottom: `${2 * k}px solid rgba(0,240,255,0.3)` }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: (28 + i * 32) * k, top: 36 * k, width: 18 * k, height: 18 * k, borderRadius: "50%", border: `${3 * k}px solid ${i === 0 ? AMBER : "rgba(241,245,249,0.5)"}` }} />
        ))}
        <div style={{ position: "absolute", left: 140 * k, top: 18 * k, width: 790 * k, height: 56 * k, borderRadius: 28 * k, border: `${2 * k}px solid rgba(0,240,255,0.5)`, background: "rgba(4,7,10,0.7)" }} />
        <T x={170} y={27} k={k} size={32} font={MONO} weight={600}>
          {url}
          {t < 26.8 ? caret : ""}
        </T>
        {!loaded && <div style={{ position: "absolute", left: 140 * k, top: 80 * k, width: 790 * k * sm(ramp(t, 26.0, 26.8)), height: 4 * k, background: CYAN }} />}

        {!plan ? (
          <>
            <T x={44} y={128} k={k} size={54} color={loaded ? INK : "rgba(241,245,249,0.25)"}>
              {loaded ? "Mau riset apa hari ini?" : "memuat…"}
            </T>
            {/* prompt box */}
            <div style={{ position: "absolute", left: 40 * k, top: 236 * k, width: 880 * k, height: 290 * k, borderRadius: 26 * k, border: `${3 * k}px solid ${typing ? CYAN : "rgba(241,245,249,0.35)"}`, background: "rgba(241,245,249,0.04)", boxShadow: typing ? `0 0 ${26 * k}px rgba(0,240,255,0.25)` : undefined }} />
            {!prompt && (
              <T x={76} y={268} k={k} size={34} weight={500} color="rgba(241,245,249,0.45)" font={MONO}>
                {drOn ? "Tulis topik riset…" : "Tanya apa saja…"}
                {typing ? caret : ""}
              </T>
            )}
            {prompt && (
              <T x={76} y={262} k={k} size={40} w={800} lh={1.24}>
                {prompt}
                {typing ? caret : ""}
              </T>
            )}
            {/* tool row */}
            <Btn x={40} y={544} w={60} h={60} k={k} label="+" size={34} />
            {drOn ? (
              <div style={{ position: "absolute", left: 120 * k, top: 544 * k, transform: `scale(${drPop})`, transformOrigin: "0 50%" }}>
                <Btn x={0} y={0} w={310} h={60} k={k} label={<>◎ Deep Research ✕</>} on size={27} />
              </div>
            ) : (
              <Btn x={120} y={544} w={300} h={60} k={k} label="◎ Deep Research" hot={hotAt(t, 29.08)} size={27} />
            )}
            <Btn x={448} y={544} w={210} h={60} k={k} label="Sumber ▾" hot={hotAt(t, 40.56)} size={27} />
            <div style={{ position: "absolute", left: 850 * k, top: 544 * k, width: 60 * k, height: 60 * k, borderRadius: "50%", background: prompt.length > 5 ? CYAN : "rgba(241,245,249,0.2)", color: "#03141a", fontFamily: GROT, fontWeight: 700, fontSize: 34 * k, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + hotAt(t, 41.95) * 0.12})` }}>↑</div>

            {/* "semakin spesifik, semakin tajam": point-cloud preview sharpens */}
            {meter > 0 && (
              <div style={{ position: "absolute", left: 40 * k, top: 640 * k, width: 880 * k, height: 190 * k, opacity: meter }}>
                <div style={{ position: "absolute", left: 0, top: 0, fontFamily: MONO, fontWeight: 600, fontSize: 22 * k, letterSpacing: 3 * k, color: AMBER }}>TOPIK SPESIFIK</div>
                <div style={{ position: "absolute", left: 0, top: 40 * k, width: 400 * k, height: 26 * k, border: `${2 * k}px solid ${AMBER}` }}>
                  <div style={{ width: `${(20 + 78 * sm(ramp(t, 37.0, 38.2))).toFixed(1)}%`, height: "100%", background: AMBER }} />
                </div>
                <div style={{ position: "absolute", left: 0, top: 86 * k, fontFamily: MONO, fontWeight: 600, fontSize: 22 * k, letterSpacing: 3 * k, color: CYAN }}>LAPORAN TAJAM</div>
                <div style={{ position: "absolute", left: 0, top: 126 * k, width: 400 * k, height: 26 * k, border: `${2 * k}px solid ${CYAN}` }}>
                  <div style={{ width: `${(20 + 78 * sm(ramp(t, 38.69, 39.9))).toFixed(1)}%`, height: "100%", background: CYAN }} />
                </div>
                {/* focus target: blur -> sharp */}
                <div style={{ position: "absolute", left: 470 * k, top: 0, width: 400 * k, height: 180 * k, border: `${2 * k}px solid rgba(0,240,255,0.4)`, overflow: "hidden", filter: `blur(${(6 * (1 - sm(ramp(t, 38.69, 39.9)))) * k}px)` }}>
                  {Array.from({ length: 16 * 7 }, (_, i) => {
                    const cx = (i % 16) * 25 + 12, cy = Math.floor(i / 16) * 25 + 14;
                    const on = Math.sin(cx * 0.05) * 40 + 100 > cy;
                    return <div key={i} style={{ position: "absolute", left: cx * k, top: cy * k, width: 7 * k, height: 7 * k, background: on ? "#10b981" : "#1e3a8a" }} />;
                  })}
                  <Brackets k={k} color={AMBER} len={20} w={3} />
                </div>
              </div>
            )}

            {/* sources dropdown */}
            {srcOpen && (
              <div style={{ position: "absolute", left: 448 * k, top: 616 * k, width: 470 * k, height: 230 * k, background: "rgba(4,10,14,0.97)", border: `${2 * k}px solid ${CYAN}`, boxShadow: `0 0 ${30 * k}px rgba(0,240,255,0.3)`, transform: `scaleY(${outBack(ramp(t, 40.56, 40.8))})`, transformOrigin: "50% 0" }}>
                {SRC_ROWS.map(([name, tag, at], i) => {
                  const on = i === 0 || t >= at;
                  return (
                    <div key={name} style={{ position: "absolute", left: 18 * k, top: (12 + i * 42) * k, width: 434 * k, height: 38 * k, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: MONO, fontWeight: 600, fontSize: 25 * k, color: INK }}>
                      <span>
                        {name} {tag && <span style={{ color: AMBER, fontSize: 19 * k }}>· {tag}</span>}
                      </span>
                      <span style={{ width: 54 * k, height: 28 * k, borderRadius: 14 * k, background: on ? CYAN : "rgba(241,245,249,0.2)", position: "relative" }}>
                        <span style={{ position: "absolute", top: 3 * k, left: (on ? 29 : 3) * k, width: 22 * k, height: 22 * k, borderRadius: "50%", background: "#04070a" }} />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* sent prompt bubble */}
            <div style={{ position: "absolute", left: 300 * k, top: 116 * k, width: 620 * k, padding: `${12 * k}px ${20 * k}px`, borderRadius: 20 * k, background: "rgba(0,240,255,0.14)", border: `${2 * k}px solid rgba(0,240,255,0.5)`, fontFamily: GROT, fontWeight: 700, fontSize: 28 * k, lineHeight: 1.2, color: INK, opacity: sm(ramp(t, 42.05, 42.35)) }}>{PROMPT}</div>
            {/* research plan */}
            <div style={{ position: "absolute", left: 40 * k, top: 250 * k, width: 880 * k, height: 450 * k, border: `${3 * k}px solid ${editing && !started ? AMBER : "rgba(0,240,255,0.45)"}`, background: "rgba(0,240,255,0.04)", opacity: sm(ramp(t, 42.3, 42.7)), transform: `translateY(${(1 - sm(ramp(t, 42.3, 42.7))) * 30 * k}px)` }}>
              <T x={26} y={20} k={k} size={24} font={MONO} weight={600} color={AMBER} spacing={4}>
                RENCANA RISET
              </T>
              {[0, 1, 2, 3].map((i) => {
                const show = sm(ramp(t, 42.5 + i * 0.25, 42.8 + i * 0.25));
                const ed = editing && !started && i === 1;
                return (
                  <div key={i} style={{ position: "absolute", left: 26 * k, top: (80 + i * 88) * k, width: 828 * k, height: 70 * k, opacity: show, border: ed ? `${2 * k}px dashed ${AMBER}` : `${2 * k}px solid transparent` }}>
                    <div style={{ position: "absolute", left: 10 * k, top: 14 * k, width: 40 * k, height: 40 * k, border: `${2 * k}px solid ${CYAN}`, color: CYAN, fontFamily: MONO, fontWeight: 800, fontSize: 24 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                    <Blur x={70} y={18} w={[620, 520, 680, 450][i]} k={k} />
                    <Blur x={70} y={44} w={[380, 450, 300, 360][i]} k={k} color="rgba(241,245,249,0.25)" h={10} />
                    {ed && <div style={{ position: "absolute", left: (80 + 520) * k, top: 10 * k, width: 4 * k, height: 44 * k, background: AMBER, opacity: Math.floor(t * 2.4) % 2 }} />}
                  </div>
                );
              })}
            </div>
            <Btn x={40} y={740} w={250} h={64} k={k} label="✎ Edit plan" hot={hotAt(t, 44.38)} size={27} color={AMBER} />
            <Btn x={310} y={740} w={330} h={64} k={k} label="▶ Start research" on={started} hot={started ? 0 : 0.2} size={27} />
            {started && (
              <div style={{ position: "absolute", left: 660 * k, top: 752 * k, fontFamily: MONO, fontWeight: 600, fontSize: 24 * k, color: CYAN }}>
                memindai sumber{".".repeat(1 + (Math.floor(t * 4) % 3))}
              </div>
            )}
          </>
        )}
        <Cursor x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} o={1 - outK} />
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------- KONTEKS: source chips
const SourceChips: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 18.43, 24.3, 0.3, 0.35);
  if (o <= 0) return null;
  const chips: [string, number][] = [
    ["Gmail", 19.91],
    ["Drive", 20.51],
    ["File unggahan", 20.9],
    ["Notebook NotebookLM", 23.1],
  ];
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, width: 984 * k, opacity: o }}>
      <div style={{ background: GLASS, borderLeft: `${7 * k}px solid ${AMBER}`, padding: `${16 * k}px ${26 * k}px ${20 * k}px` }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24 * k, letterSpacing: 5 * k, color: AMBER }}>BISA DITAMBAH (OPSIONAL)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 * k, marginTop: 14 * k }}>
          <div style={{ padding: `${8 * k}px ${18 * k}px`, border: `${2 * k}px solid ${CYAN}`, fontFamily: GROT, fontWeight: 700, fontSize: 40 * k, color: CYAN }}>✓ Google Search</div>
          {chips.map(([name, at]) => {
            const p = outBack(ramp(t, at, at + 0.35));
            return (
              <div key={name} style={{ padding: `${8 * k}px ${18 * k}px`, border: `${2 * k}px solid ${AMBER}`, background: "rgba(255,183,3,0.12)", fontFamily: GROT, fontWeight: 700, fontSize: 40 * k, color: INK, transform: `scale(${p})`, opacity: p > 0.01 ? 1 : 0 }}>
                + {name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- PENJELASAN: timer ring + notification
const TimerRing: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 48.6, 55.2, 0.4, 0.35);
  if (o <= 0) return null;
  const cx = 540, cy = 800, R = 220;
  const C = 2 * Math.PI * R;
  const run = sm(ramp(t, 48.8, 54.8));
  const extra = sm(ramp(t, 53.6, 54.6));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1080 * k} height={1920 * k} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={cx} cy={cy} r={R + 26} fill="rgba(4,10,14,0.72)" />
        <circle cx={cx} cy={cy} r={R} stroke="rgba(0,240,255,0.2)" strokeWidth={14} fill="none" />
        <circle cx={cx} cy={cy} r={R} stroke={CYAN} strokeWidth={14} fill="none" strokeDasharray={`${C * 0.78 * run} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }} />
        {extra > 0 && <circle cx={cx} cy={cy} r={R} stroke={AMBER} strokeWidth={14} fill="none" strokeDasharray={`10 12`} strokeDashoffset={0} pathLength={C} transform={`rotate(${-90 + 360 * 0.78} ${cx} ${cy})`} opacity={extra} style={{ clipPath: "none" }} />}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const r1 = R + 26, r2 = R + (i % 5 === 0 ? 46 : 36);
          return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke="rgba(0,240,255,0.5)" strokeWidth={i % 5 === 0 ? 3 : 1.5} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: (cx - 220) * k, width: 440 * k, top: (cy - 140) * k, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 26 * k, letterSpacing: 5 * k, color: AMBER }}>BIASANYA</div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 132 * k, lineHeight: 1, color: INK, textShadow: `0 0 ${24 * k}px rgba(0,240,255,0.6)` }}>
          {t >= 49.35 ? "5" : ""}
          {t >= 50.07 ? "–" : ""}
          {t >= 50.43 ? "10" : ""}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40 * k, letterSpacing: 8 * k, color: CYAN }}>{t >= 50.77 ? "MENIT" : ""}</div>
      </div>
      {t >= 51.07 && (
        <div style={{ position: "absolute", left: 140 * k, width: 800 * k, top: (cy + R + 64) * k, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 28 * k, color: "#cfe8ef", opacity: sm(ramp(t, 51.07, 51.4)) }}>
          <span style={{ background: GLASS, border: `${2 * k}px solid rgba(0,240,255,0.5)`, padding: `${6 * k}px ${16 * k}px` }}>menganalisis banyak sumber</span>
        </div>
      )}
    </div>
  );
};

const LeaveChat: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 55.13, 61.25, 0.35, 0.4);
  if (o <= 0) return null;
  const mini = sm(ramp(t, 55.6, 56.3));
  const note = outBack(ramp(t, 57.55, 57.95));
  const tap = t >= 60.49;
  const zoom = sm(ramp(t, 60.65, 61.25));
  const taps: Tap[] = [
    { t: 57.9, x: 860, y: 1080 },
    { t: 60.49, x: 840, y: 712, press: true },
  ];
  const c = cursorAt(taps, t);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o * (1 - zoom * 0.9), transform: `scale(${1 + zoom * 0.5})`, transformOrigin: "50% 40%" }}>
      {/* the chat window shrinks into a tab chip: research keeps running */}
      <div style={{ position: "absolute", left: (90 + mini * 520) * k, top: (500 + mini * 560) * k, width: (900 - mini * 560) * k, height: (420 - mini * 330) * k, background: GLASS, border: `${2 * k}px solid rgba(0,240,255,0.5)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 20 * k, top: 18 * k, fontFamily: MONO, fontWeight: 600, fontSize: 24 * k, color: CYAN, whiteSpace: "nowrap" }}>◎ Deep Research · riset berjalan</div>
        <div style={{ position: "absolute", left: 20 * k, right: 20 * k, top: 60 * k, height: 8 * k, background: "rgba(0,240,255,0.15)" }}>
          <div style={{ width: `${(40 + 55 * sm(ramp(t, 55.2, 59.0))).toFixed(1)}%`, height: "100%", background: CYAN }} />
        </div>
      </div>
      {mini > 0.9 && (
        <div style={{ position: "absolute", left: 90 * k, top: 1080 * k, fontFamily: MONO, fontWeight: 600, fontSize: 26 * k, color: "#9fb8c4" }}>boleh ditinggal ✓</div>
      )}
      {/* notification */}
      {t >= 57.55 && (
        <div style={{ position: "absolute", left: 60 * k, top: 560 * k, width: 960 * k, height: 200 * k, transform: `translateY(${(1 - note) * -120 * k}px)`, opacity: Math.min(1, note) }}>
          <Panel x={0} y={0} w={960} h={200} k={k} t={t}>
            <div style={{ position: "absolute", left: 28 * k, top: 30 * k, width: 76 * k, height: 76 * k, border: `${3 * k}px solid ${AMBER}`, color: AMBER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 700, fontSize: 46 * k }}>✦</div>
            <T x={128} y={26} k={k} size={22} font={MONO} weight={600} color={AMBER} spacing={4}>
              NOTIFIKASI
            </T>
            <T x={128} y={60} k={k} size={42}>
              Laporan riset sudah siap
            </T>
            <Blur x={128} y={130} w={330} k={k} color="rgba(241,245,249,0.3)" />
            <Btn x={720} y={110} w={200} h={64} k={k} label="Open" on={tap} hot={hotAt(t, 60.49)} size={30} />
          </Panel>
        </div>
      )}
      <Cursor x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} />
    </div>
  );
};

// ---------------------------------------------------------------- PAYOFF: opened report
const RX = 60, RY = 560, RW = 960, RH = 770;
const ReportUi: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 61.6, b = 74.0;
  const o = win(t, a, b, 0.6, 0.4);
  if (o <= 0) return null;
  const inK = sm(ramp(t, a, a + 0.8));
  const audio = t >= 64.07;
  const player = sm(ramp(t, 64.15, 64.5)) * (1 - sm(ramp(t, 66.9, 67.3)));
  const verify = sm(ramp(t, 68.6, 69.0)) * (1 - sm(ramp(t, 70.7, 71.0)));
  const scanY = t >= 67.03 && t < 68.4 ? ramp(t, 67.03, 68.3) : -1;
  const taps: Tap[] = [
    { t: 62.4, x: 720, y: 360 },
    { t: 64.07, x: 760, y: 52, press: true },
    { t: 64.9, x: 880, y: 330 },
    { t: 66.8, x: 900, y: 600 },
  ];
  const c = cursorAt(taps, t);
  const cites = [0, 1, 2];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, transform: `scale(${1.25 - 0.25 * inK}) perspective(${1800 * k}px) rotateY(${Math.sin(t * 0.2) * 1.5}deg)`, transformOrigin: "50% 50%" }}>
      <Panel x={RX} y={RY} w={RW} h={RH} k={k} t={t}>
        <T x={30} y={24} k={k} size={22} font={MONO} weight={600} color={AMBER} spacing={4}>
          LAPORAN · DEEP RESEARCH
        </T>
        <Btn x={600} y={20} w={330} h={64} k={k} label="♪ Audio Overview" on={audio} hot={hotAt(t, 64.07)} size={26} />
        <T x={30} y={100} k={k} size={40} w={760}>
          3 cara menabung untuk mahasiswa
        </T>
        {/* sections of blurred placeholder text with citation chips */}
        {[0, 1, 2].map((s) => {
          const y0 = 190 + s * 170;
          return (
            <div key={s}>
              <Blur x={30} y={y0} w={[360, 300, 420][s]} k={k} h={22} color="rgba(0,240,255,0.5)" />
              {[0, 1, 2].map((l) => (
                <Blur key={l} x={30} y={y0 + 46 + l * 32} w={[820, 760, 610][l] - s * 30} k={k} />
              ))}
              {/* number token, outlined when "cek ulang angkanya" */}
              <div style={{ position: "absolute", left: 660 * k, top: (y0 + 72) * k, width: 120 * k, height: 34 * k, border: `${3 * k}px solid ${verify > 0 ? AMBER : "transparent"}`, opacity: 0.4 + 0.6 * verify, boxShadow: verify > 0 ? `0 0 ${16 * k}px ${AMBER}` : undefined }}>
                <Blur x={10} y={10} w={92} k={k} color="rgba(255,183,3,0.65)" />
                {verify > 0.5 && <div style={{ position: "absolute", right: -34 * k, top: -6 * k, fontFamily: MONO, fontWeight: 800, fontSize: 28 * k, color: AMBER }}>?</div>}
              </div>
              <div style={{ position: "absolute", left: (840 - s * 30) * k, top: (y0 + 106) * k, padding: `${2 * k}px ${10 * k}px`, border: `${2 * k}px solid ${CYAN}`, background: verify > 0 ? CYAN : "transparent", color: verify > 0 ? "#03141a" : CYAN, fontFamily: MONO, fontWeight: 800, fontSize: 22 * k, transform: `scale(${1 + verify * 0.25 * Math.abs(Math.sin(t * 6 + s))})` }}>
                [{cites[s] + 1}]
              </div>
            </div>
          );
        })}
        {/* audio player */}
        {player > 0 && (
          <div style={{ position: "absolute", left: 30 * k, top: 650 * k, width: 900 * k, height: 90 * k, opacity: player, background: "rgba(0,240,255,0.1)", border: `${2 * k}px solid ${CYAN}`, display: "flex", alignItems: "center", gap: 6 * k, paddingLeft: 24 * k, boxSizing: "border-box" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 40 * k, color: CYAN, marginRight: 18 * k }}>▶</div>
            {Array.from({ length: 52 }, (_, i) => {
              const h = 10 + Math.abs(Math.sin(i * 0.9 + t * 7) * Math.cos(i * 0.31 - t * 3)) * 56;
              const played = i / 52 < ramp(t, 64.5, 66.8);
              return <div key={i} style={{ width: 9 * k, height: h * k, background: played ? CYAN : "rgba(241,245,249,0.35)", borderRadius: 3 * k }} />;
            })}
          </div>
        )}
        {verify > 0 && (
          <div style={{ position: "absolute", left: 30 * k, top: 660 * k, opacity: verify, fontFamily: MONO, fontWeight: 600, fontSize: 26 * k, color: AMBER }}>
            SUMBER DIKUTIP: [1] [2] [3] → buka &amp; cek angkanya
          </div>
        )}
        {/* verification laser over the page ("jangan langsung percaya") */}
        {scanY >= 0 && <div style={{ position: "absolute", left: 0, right: 0, top: `${(scanY * 100).toFixed(1)}%`, height: 4 * k, background: AMBER, boxShadow: `0 0 ${24 * k}px ${AMBER}` }} />}
        <Cursor x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} o={1 - sm(ramp(t, 66.8, 67.2))} />
      </Panel>
    </div>
  );
};

/** Info card: 18+ and "grafik hanya paket Ultra". */
const InfoCards: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, 74.13, 80.5, 0.3, 0.35);
  if (o <= 0) return null;
  const r1 = outBack(ramp(t, 74.81, 75.2));
  const r2 = outBack(ramp(t, 77.84, 78.2));
  const row = (p: number, badge: string, kicker: string, text: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 * k, marginTop: 18 * k, transform: `scale(${p})`, transformOrigin: "0 50%", opacity: p > 0.01 ? 1 : 0 }}>
      <div style={{ flex: "none", width: 150 * k, height: 110 * k, border: `${4 * k}px solid ${AMBER}`, color: AMBER, fontFamily: GROT, fontWeight: 700, fontSize: 64 * k, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${22 * k}px rgba(255,183,3,0.4)` }}>{badge}</div>
      <div>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22 * k, letterSpacing: 4 * k, color: AMBER }}>{kicker}</div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 46 * k, lineHeight: 1.1, color: INK }}>{text}</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, width: 984 * k, opacity: o, background: GLASS, border: `${2 * k}px solid rgba(255,183,3,0.5)`, padding: `${18 * k}px ${26 * k}px ${26 * k}px`, boxSizing: "border-box" }}>
      <Brackets k={k} color={AMBER} />
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24 * k, letterSpacing: 5 * k, color: CYAN }}>CATATAN PENTING</div>
      {row(r1, "18+", "USIA", <>Untuk usia 18 tahun ke atas</>)}
      {row(r2, "▥", "GRAFIK DI LAPORAN", <>Hanya di paket <Am>Ultra</Am></>)}
    </div>
  );
};

const TabCounter: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const n = Math.round(3 + 34 * sm(ramp(t, 0.2, 6.2)));
  const o = t < 6.7 ? 1 - sm(ramp(t, 6.3, 6.7)) : 0;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, maxWidth: 960 * k, opacity: o, background: GLASS, padding: `${16 * k}px ${28 * k}px ${22 * k}px`, borderLeft: `${7 * k}px solid ${AMBER}`, boxShadow: `0 ${8 * k}px ${28 * k}px rgba(0,0,0,0.5)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 26 * k, letterSpacing: 4 * k, color: AMBER }}>TAB TERBUKA: {String(n).padStart(2, "0")}</div>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 92 * k, lineHeight: 1.0, color: INK, marginTop: 8 * k, letterSpacing: -1 * k }}>
        Riset =<br />
        <Am>puluhan tab?</Am>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- film
export const Ep09Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP09 film fonts"));
  useEffect(() => {
    Promise.all([mono.waitUntilDone(), grot.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  // dim the world while the UI panels carry the steps
  const dim = Math.max(win(t, 24.75, 47.6, 0.6, 0.6), win(t, 61.7, 74.0, 0.6, 0.4)) * 0.55;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} camera={{ position: [0, 2.3, 7.8], fov: 50, near: 0.05, far: 60 }}>
          <WorldScene t={t} f={f} />
          <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
        </ThreeCanvas>
      )}
      {/* top grade for headline legibility, like the cover */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,7,10,0.8) 0%, rgba(4,7,10,0.35) 22%, rgba(4,7,10,0) 34%)" }} />
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(4,7,10,${dim.toFixed(3)})` }} />}

      {/* HOOK */}
      <TabCounter t={t} k={k} />
      <Headline kicker="AUDIRA AI TUTORIAL · EP 9" k={k} t={t} a={6.72} b={11.6} size={84}>
        Biar <Cy>Deep Research</Cy>
        <br />
        yang bekerja
      </Headline>

      {/* KONTEKS */}
      <Headline kicker="APA ITU DEEP RESEARCH?" k={k} t={t} a={11.93} b={16.15} size={64}>
        Baca <Cy>banyak sumber</Cy>
        <br />→ jadi <Am>1 laporan</Am>
      </Headline>
      <Headline kicker="SUMBER BAWAAN" k={k} t={t} a={16.32} b={18.4} size={78}>
        Google Search
      </Headline>
      <SourceChips t={t} k={k} />

      {/* LANGKAH */}
      <StepHeader n={1} title="Buka gemini.google.com" sub="→ pilih Deep Research" k={k} t={t} a={24.74} b={29.62} />
      <StepHeader n={2} title="Tulis topik sejelas mungkin" sub="makin spesifik, makin tajam" k={k} t={t} a={29.66} b={40.5} />
      <StepHeader n={3} title="Atur sumber" sub="kalau perlu (opsional)" k={k} t={t} a={40.56} b={42.08} />
      <StepHeader n={4} title="Edit plan → Start research" sub="ubah rencana, lalu mulai" k={k} t={t} a={42.12} b={47.6} />
      <ResearchUi t={t} k={k} />

      {/* PENJELASAN */}
      <StepHeader n={5} title="Tunggu ±5–10 menit" sub="topik rumit bisa lebih lama" k={k} t={t} a={47.96} b={55.1} />
      <TimerRing t={t} k={k} />
      {t >= 53.19 && t < 55.2 && (
        <div style={{ position: "absolute", left: 140 * k, width: 800 * k, top: 1200 * k, textAlign: "center", opacity: win(t, 53.19, 55.2, 0.3, 0.3) }}>
          <span style={{ background: GLASS, border: `${2 * k}px solid ${AMBER}`, padding: `${8 * k}px ${18 * k}px`, fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, color: AMBER }}>topik rumit → bisa lebih lama</span>
        </div>
      )}
      <StepHeader n={5} title="Boleh tinggalkan chat" sub="nanti ada notifikasi" k={k} t={t} a={55.13} b={59.7} />
      <StepHeader n={6} title="Klik Open" sub="untuk membaca laporan" k={k} t={t} a={59.72} b={62.4} />
      <LeaveChat t={t} k={k} />

      {/* PAYOFF */}
      <Headline kicker="MALAS MEMBACA?" k={k} t={t} a={62.5} b={63.62} size={76}>
        Dengarkan saja
      </Headline>
      <StepHeader n={7} title="Audio Overview" sub="laporan versi audio" k={k} t={t} a={63.64} b={66.95} />
      <ReportUi t={t} k={k} />
      <WarnCard t={t} k={k} a={67.03} b={68.5} kicker="AI BISA SALAH">
        Jangan langsung percaya
      </WarnCard>
      <WarnCard t={t} k={k} a={68.55} b={70.75} kicker="CEK ULANG" icon="✓" color={CYAN}>
        Buka sumber yang dikutip, cek <Am>angkanya</Am>
      </WarnCard>
      <WarnCard t={t} k={k} a={70.8} b={74.05} kicker="INGAT">
        Bahan <Cy>awal</Cy>, bukan jawaban akhir
      </WarnCard>
      <InfoCards t={t} k={k} />

      {/* OUTRO */}
      <Headline kicker="EPISODE DEPAN" k={k} t={t} a={80.84} b={85.25} size={64}>
        Chat AI-mu <Am>disimpan</Am>?
        <br />
        Cara menghapusnya
      </Headline>
      <Headline kicker="AUDIRA AI TUTORIAL" k={k} t={t} a={85.3} b={86.4} size={84}>
        Ini <Cy>AUDIRA</Cy>.
      </Headline>

      <Captions t={t} k={k} hideAfter={OUTRO_AT} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
