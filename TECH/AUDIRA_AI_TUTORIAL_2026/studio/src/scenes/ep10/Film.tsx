// EP10 film: "Chat AI-mu Disimpan? Cara Hapus Riwayat Gemini" (FILMNOIR).
// One continuous noir detective office (World.tsx, camera.ts) under 2D case-file layers: headlines,
// step numbers, a generic dossier-style activity UI with a pointer, warning slips, karaoke captions.
// Every beat is keyed to timeline.json seconds (Audio Master Clock).
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { BG } from "./Cover.tsx";
import { WorldScene } from "./World.tsx";
import { Captions } from "./Captions.tsx";
import { AMBER, Accent, Btn, CREAM, DIM, Headline, INK, MONO, Panel, Pointer, RED, SERIF, Stamp, StepHeader, T, WarnCard, hotAt, outBack, ramp, sm, typed, win } from "./ui.tsx";

const OUTRO_AT = TL.sections.outro[1] + 0.2;

type Tap = { t: number; x: number; y: number; press?: boolean };
const pointerAt = (taps: Tap[], t: number) => {
  let i = 0;
  while (i < taps.length - 1 && t >= taps[i + 1].t) i++;
  const a = taps[i], b = taps[Math.min(i + 1, taps.length - 1)];
  const k = b === a ? 0 : sm(ramp(t, b.t - 0.55, b.t - 0.05));
  const x = a.x + (b.x - a.x) * k + Math.sin(t * 2.1) * 3;
  const y = a.y + (b.y - a.y) * k + Math.cos(t * 1.7) * 3;
  let press = 0, ripple = 0;
  for (const tp of taps) {
    if (!tp.press) continue;
    const d = t - tp.t;
    if (d > -0.12 && d < 0.18) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.15);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  }
  return { x, y, press: Math.max(0, press), ripple };
};

const panelMotion = (t: number, a: number, b: number, k: number) => {
  const inK = sm(ramp(t, a, a + 0.5));
  const outK = sm(ramp(t, b - 0.4, b));
  return {
    opacity: inK * (1 - outK),
    transform: `translateY(${(1 - inK) * 70 * k - outK * 60 * k}px) perspective(${1800 * k}px) rotateX(${(1 - inK) * 16 + Math.sin(t * 0.3) * 1.0}deg) rotateZ(${Math.sin(t * 0.21) * 0.35}deg) scale(${1 - outK * 0.06})`,
    transformOrigin: "50% 60%",
  } as React.CSSProperties;
};

// ---------------------------------------------------------------- LANGKAH panel (steps 1-3)
const PX = 80, PY = 480, PW = 920, PH = 800;
const TAPS_A: Tap[] = [
  { t: 24.3, x: 520, y: 46 },
  { t: 27.2, x: 190, y: 748, press: true }, // "Settings & help"
  { t: 29.31, x: 170, y: 604, press: true }, // "Activity"
  { t: 31.0, x: 470, y: 330 }, // review the prompts
  { t: 34.34, x: 858, y: 300, press: true }, // "Delete activity item"
  { t: 40.49, x: 858, y: 216, press: true }, // delete one day
  { t: 43.4, x: 800, y: 142, press: true }, // menu "Delete"
  { t: 43.95, x: 760, y: 296 }, // custom range
];

const ROWS_TODAY = ["resep nasi goreng kampung", "ide judul skripsi", "terjemahkan email ini"];
const ROWS_YDAY = ["rencana liburan ke Bandung", "ringkas artikel ini"];

const Row: React.FC<{ k: number; y: number; text: string; o: number; hot: number; strike: number; xHot: number }> = ({ k, y, text, o, hot, strike, xHot }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 30 * k, top: y * k, width: 860 * k, height: 76 * k, opacity: o, borderRadius: 10 * k, background: hot > 0 ? `rgba(255,227,160,${0.08 * hot})` : "rgba(255,255,255,0.03)", border: `${2 * k}px solid ${hot > 0.4 ? "rgba(255,227,160,0.6)" : "rgba(242,235,221,0.12)"}` }}>
      <div style={{ position: "absolute", left: 20 * k, top: 22 * k, width: 30 * k, height: 30 * k, borderRadius: 6 * k, border: `${3 * k}px solid ${AMBER}` }} />
      <div style={{ position: "absolute", left: 72 * k, top: 18 * k, fontFamily: MONO, fontSize: 30 * k, color: CREAM, whiteSpace: "nowrap" }}>
        {text}
        <span style={{ position: "absolute", left: 0, top: "52%", height: 4 * k, width: `${strike * 100}%`, background: RED }} />
      </div>
      <div style={{ position: "absolute", left: 800 * k, top: 14 * k, width: 46 * k, height: 46 * k, borderRadius: "50%", border: `${3 * k}px solid ${xHot > 0.3 ? RED : "rgba(242,235,221,0.45)"}`, color: xHot > 0.3 ? RED : CREAM, fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, display: "flex", alignItems: "center", justifyContent: "center", background: xHot > 0 ? `rgba(224,49,63,${0.25 * xHot})` : undefined }}>✕</div>
    </div>
  );

const PanelSteps: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 24.3, b = 44.45;
  if (t < a || t > b) return null;
  const url = typed("gemini.google.com", t, 24.8, 26.0);
  const caret = Math.floor(t * 2.4) % 2 === 0 ? "|" : " ";
  const activity = t >= 29.55;
  const menu = t >= 27.2 && t < 29.55;
  const c = pointerAt(TAPS_A, t);
  // deletions
  const row1 = 1 - sm(ramp(t, 35.15, 35.6));
  const day = 1 - sm(ramp(t, 40.9, 41.35));
  const shift = sm(ramp(t, 35.5, 35.9)) * 90 + sm(ramp(t, 41.3, 41.7)) * 190;
  const dmenu = t >= 43.4;
  const review = (i: number) => (t >= 30.86 && t < 32.3 ? hotAt(t, 30.86 + i * 0.25) : 0);
  return (
    <div style={{ position: "absolute", inset: 0, ...panelMotion(t, a, b, k) }}>
      <Panel x={PX} y={PY} w={PW} h={PH} k={k}>
        {/* browser bar */}
        <div style={{ position: "absolute", left: 0, top: 0, width: PW * k, height: 92 * k, background: "rgba(255,255,255,0.05)", borderBottom: `${2 * k}px solid rgba(242,235,221,0.2)` }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: (26 + i * 30) * k, top: 36 * k, width: 18 * k, height: 18 * k, borderRadius: "50%", background: i === 0 ? RED : "rgba(242,235,221,0.3)" }} />
        ))}
        <div style={{ position: "absolute", left: 130 * k, top: 18 * k, width: 760 * k, height: 56 * k, borderRadius: 28 * k, border: `${2 * k}px solid ${t < 26.2 ? AMBER : "rgba(242,235,221,0.35)"}`, background: "rgba(0,0,0,0.4)" }} />
        <T x={160} y={26} k={k} size={32} font={MONO} weight={700}>
          {url}
          {t < 26.2 ? caret : ""}
        </T>
        {!activity ? (
          <>
            <T x={60} y={200} k={k} size={66} font={SERIF} weight={900}>
              Halo.
            </T>
            <T x={60} y={280} k={k} size={40} font={SERIF} weight={400} color={DIM}>
              Ada yang bisa dibantu?
            </T>
            <div style={{ position: "absolute", left: 40 * k, top: 400 * k, width: 840 * k, height: 120 * k, borderRadius: 24 * k, border: `${2 * k}px solid rgba(242,235,221,0.35)`, background: "rgba(0,0,0,0.3)" }} />
            <T x={76} y={440} k={k} size={30} font={MONO} weight={400} color={DIM}>
              Tanya apa saja…
            </T>
            <Btn x={30} y={720} w={330} h={58} k={k} label="⚙ Settings & help" hot={hotAt(t, 27.2)} size={28} />
            {menu && (
              <div style={{ position: "absolute", left: 30 * k, top: 560 * k, width: 360 * k, height: 150 * k, borderRadius: 12 * k, background: "#16191E", border: `${2 * k}px solid rgba(242,235,221,0.35)`, boxShadow: `0 ${10 * k}px ${24 * k}px rgba(0,0,0,0.6)`, transform: `scale(${outBack(ramp(t, 27.2, 27.45))})`, transformOrigin: "10% 100%" }}>
                <div style={{ position: "absolute", left: 14 * k, top: 16 * k, width: 330 * k, height: 56 * k, borderRadius: 8 * k, border: `${2 * k}px solid ${hotAt(t, 29.31) > 0.3 ? AMBER : "transparent"}`, background: hotAt(t, 29.31) > 0 ? "rgba(255,227,160,0.15)" : undefined, display: "flex", alignItems: "center", paddingLeft: 16 * k, fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, color: hotAt(t, 29.31) > 0.3 ? AMBER : CREAM, boxSizing: "border-box" }}>
                  ◷ Activity
                </div>
                <div style={{ position: "absolute", left: 30 * k, top: 96 * k, width: 200 * k, height: 10 * k, borderRadius: 5 * k, background: "rgba(242,235,221,0.2)" }} />
                <div style={{ position: "absolute", left: 30 * k, top: 120 * k, width: 150 * k, height: 10 * k, borderRadius: 5 * k, background: "rgba(242,235,221,0.2)" }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, opacity: sm(ramp(t, 29.55, 29.9)) }}>
            <T x={34} y={118} k={k} size={44} font={SERIF} weight={900}>
              Gemini Apps Activity
            </T>
            <Btn x={690} y={112} w={200} h={58} k={k} label="Delete ▾" hot={Math.max(hotAt(t, 43.4), 0)} danger size={28} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${-shift * k}px)` }}>
              <div style={{ opacity: day }}>
                <T x={34} y={198} k={k} size={26} font={MONO} color={AMBER} ls={4}>
                  HARI INI
                </T>
                <div style={{ position: "absolute", left: 830 * k, top: 194 * k, width: 46 * k, height: 46 * k, borderRadius: "50%", border: `${3 * k}px solid ${hotAt(t, 40.49) > 0.3 ? RED : "rgba(242,235,221,0.45)"}`, color: hotAt(t, 40.49) > 0.3 ? RED : CREAM, fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</div>
                {ROWS_TODAY.map((txt, i) => {
                  const y = 250 + i * 90 - (i > 0 ? sm(ramp(t, 35.5, 35.9)) * 0 : 0);
                  return <Row key={i} k={k} y={y} text={txt} o={i === 0 ? row1 : 1} hot={review(i)} strike={i === 0 ? sm(ramp(t, 34.45, 35.0)) : sm(ramp(t, 40.55, 40.9))} xHot={i === 0 ? hotAt(t, 34.34) : 0} />;
                })}
              </div>
              <T x={34} y={528} k={k} size={26} font={MONO} color={AMBER} ls={4}>
                KEMARIN
              </T>
              {ROWS_YDAY.map((txt, i) => (
                <Row key={i} k={k} y={580 + i * 90} text={txt} o={1} hot={review(i + 3)} strike={0} xHot={0} />
              ))}
            </div>
            {/* tooltip on the row's delete button */}
            {t >= 33.7 && t < 35.4 && (
              <div style={{ position: "absolute", left: 460 * k, top: 192 * k, padding: `${6 * k}px ${14 * k}px`, background: CREAM, color: INK, fontFamily: MONO, fontWeight: 700, fontSize: 26 * k, borderRadius: 6 * k, opacity: sm(ramp(t, 33.7, 33.9)), whiteSpace: "nowrap" }}>Delete activity item</div>
            )}
            {dmenu && (
              <div style={{ position: "absolute", left: 470 * k, top: 182 * k, width: 420 * k, height: 160 * k, borderRadius: 12 * k, background: "#16191E", border: `${2 * k}px solid rgba(242,235,221,0.35)`, boxShadow: `0 ${10 * k}px ${24 * k}px rgba(0,0,0,0.6)`, transform: `scale(${outBack(ramp(t, 43.4, 43.65))})`, transformOrigin: "90% 0%" }}>
                <div style={{ position: "absolute", left: 16 * k, top: 16 * k, fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, color: CREAM, padding: `${8 * k}px ${12 * k}px` }}>Satu hari</div>
                <div style={{ position: "absolute", left: 14 * k, top: 84 * k, width: 390 * k, height: 58 * k, borderRadius: 8 * k, border: `${2 * k}px solid ${t > 43.9 ? AMBER : "transparent"}`, background: t > 43.9 ? "rgba(255,227,160,0.15)" : undefined, display: "flex", alignItems: "center", paddingLeft: 14 * k, boxSizing: "border-box", fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, color: t > 43.9 ? AMBER : CREAM }}>Rentang waktu sendiri</div>
              </div>
            )}
          </div>
        )}
        <Pointer x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} />
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------- PENJELASAN panel (step 4)
const TAPS_B: Tap[] = [
  { t: 44.8, x: 520, y: 720 },
  { t: 46.47, x: 150, y: 330, press: true }, // "tiga bulan"
  { t: 48.07, x: 190, y: 462, press: true }, // open Turn off menu
  { t: 50.79, x: 200, y: 552 }, // "Turn off"
  { t: 51.7, x: 380, y: 634 }, // "Turn off and delete activity"
  { t: 52.8, x: 380, y: 634, press: true },
];

const PanelKeep: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 44.75, b = 53.75;
  if (t < a || t > b) return null;
  const c = pointerAt(TAPS_B, t);
  const three = t >= 46.47;
  const off = sm(ramp(t, 52.95, 53.25));
  const menu = t >= 48.07;
  const chip = (x: number, w: number, label: string, on: boolean, hot: number) => (
    <div style={{ position: "absolute", left: x * k, top: 300 * k, width: w * k, height: 66 * k, borderRadius: 33 * k, border: `${3 * k}px solid ${on ? AMBER : "rgba(242,235,221,0.35)"}`, background: on ? `rgba(255,227,160,${0.16 + 0.1 * hot})` : "transparent", color: on ? AMBER : CREAM, fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.06 * hot})` }}>
      {label}
    </div>
  );
  const item = (y: number, label: string, hot: number, danger = false) => (
    <div style={{ position: "absolute", left: 14 * k, top: y * k, width: 752 * k, height: 66 * k, borderRadius: 8 * k, border: `${2 * k}px solid ${hot > 0.3 ? (danger ? RED : AMBER) : "transparent"}`, background: hot > 0 ? (danger ? `rgba(224,49,63,${0.6 * hot})` : `rgba(255,227,160,${0.14 * hot})`) : undefined, display: "flex", alignItems: "center", paddingLeft: 18 * k, boxSizing: "border-box", fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, color: hot > 0.3 ? (danger ? CREAM : AMBER) : CREAM }}>
      {label}
    </div>
  );
  const hot1 = t >= 50.6 && t < 51.5 ? 1 : 0;
  const hot2 = t >= 51.5 ? 1 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, ...panelMotion(t, a, b, k) }}>
      <Panel x={PX} y={PY} w={PW} h={PH} k={k}>
        <T x={34} y={40} k={k} size={26} font={MONO} color={AMBER} ls={4}>
          GEMINI APPS ACTIVITY
        </T>
        <T x={34} y={90} k={k} size={56} font={SERIF} weight={900}>
          Keep Activity
        </T>
        {/* toggle */}
        <div style={{ position: "absolute", left: 740 * k, top: 96 * k, width: 140 * k, height: 70 * k, borderRadius: 35 * k, background: off > 0.5 ? "rgba(242,235,221,0.15)" : "rgba(255,227,160,0.85)", border: `${3 * k}px solid ${off > 0.5 ? "rgba(242,235,221,0.4)" : AMBER}` }}>
          <div style={{ position: "absolute", top: 7 * k, left: (76 - off * 66) * k, width: 50 * k, height: 50 * k, borderRadius: "50%", background: off > 0.5 ? CREAM : INK }} />
        </div>
        <T x={740} y={176} k={k} size={24} font={MONO} color={off > 0.5 ? RED : AMBER} ls={3}>
          {off > 0.5 ? "OFF" : "ON"}
        </T>
        <T x={34} y={240} k={k} size={28} font={MONO} color={DIM} ls={2}>
          Hapus otomatis aktivitas lebih tua dari:
        </T>
        {chip(30, 220, "3 bulan", three, hotAt(t, 46.47))}
        {chip(270, 330, "18 bulan · bawaan", !three, 0)}
        {chip(620, 240, "36 bulan", false, 0)}
        <Btn x={30} y={430} w={300} h={66} k={k} label="Turn off ▾" hot={hotAt(t, 48.07)} danger size={30} />
        {menu && (
          <div style={{ position: "absolute", left: 30 * k, top: 516 * k, width: 780 * k, height: 172 * k, borderRadius: 12 * k, background: "#16191E", border: `${2 * k}px solid rgba(242,235,221,0.35)`, boxShadow: `0 ${10 * k}px ${24 * k}px rgba(0,0,0,0.6)`, transform: `scale(${outBack(ramp(t, 48.07, 48.32))})`, transformOrigin: "10% 0%" }}>
            {item(14, "Turn off", hot1)}
            {item(92, "Turn off and delete activity", hot2, true)}
          </div>
        )}
        {off > 0 && (
          <div style={{ position: "absolute", left: 30 * k, top: 712 * k, fontFamily: SERIF, fontStyle: "italic", fontSize: 34 * k, color: RED, opacity: off }}>Keep Activity dimatikan · riwayat lama dihapus</div>
        )}
        <Pointer x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} />
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------- KONTEKS: retention dial
const RetentionCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 13.65, b = 21.0;
  const o = win(t, a, b);
  if (o <= 0) return null;
  const big = outBack(ramp(t, 15.68, 16.1));
  const opts = sm(ramp(t, 17.6, 18.0));
  const hot3 = hotAt(t, 19.19), hot36 = hotAt(t, 20.3);
  const pill = (label: string, on: number, main = false) => (
    <div style={{ padding: `${10 * k}px ${26 * k}px`, borderRadius: 40 * k, border: `${3 * k}px solid ${on > 0.3 || main ? AMBER : "rgba(242,235,221,0.4)"}`, background: on > 0 ? `rgba(255,227,160,${0.2 * on})` : main ? "rgba(255,227,160,0.12)" : "transparent", color: on > 0.3 || main ? AMBER : CREAM, fontFamily: MONO, fontWeight: 700, fontSize: 34 * k, transform: `scale(${1 + 0.1 * on})` }}>{label}</div>
  );
  return (
    <div style={{ position: "absolute", left: 60 * k, top: 268 * k, width: 960 * k, opacity: o }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 5 * k, color: AMBER }}>{typed("HAPUS OTOMATIS · BAWAAN", t, a, a + 0.6)}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150 * k, lineHeight: 1, color: CREAM, transform: `scale(${big})`, transformOrigin: "0 60%", textShadow: `0 ${4 * k}px ${24 * k}px rgba(0,0,0,0.95)` }}>
        18 <span style={{ fontSize: 80 * k }}>bulan</span>
      </div>
      <div style={{ display: "flex", gap: 18 * k, marginTop: 18 * k, opacity: opts, transform: `translateY(${(1 - opts) * 20 * k}px)`, alignItems: "center" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36 * k, color: DIM }}>bisa diubah:</div>
        {pill("3", hot3)}
        {pill("18", 0, true)}
        {pill("36 bulan", hot36)}
      </div>
    </div>
  );
};

/** Share-link slip (PAYOFF): a public link chip that survives the wipe, then gets its own Delete. */
const ShareCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 70.85, b = 76.9;
  const o = win(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const survive = t >= 73.27;
  const gone = sm(ramp(t, 75.35, 75.9));
  const taps: Tap[] = [
    { t: 70.85, x: 600, y: 330 },
    { t: 74.82, x: 925, y: 238, press: true },
  ];
  const c = pointerAt(taps, t);
  return (
    <div style={{ position: "absolute", left: 48 * k, top: 268 * k, width: 984 * k, height: 420 * k, opacity: o, transform: `scale(${0.9 + 0.1 * outBack(ramp(t, a, a + 0.4))}) rotate(0.5deg)`, transformOrigin: "0 0" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,14,0.93)", border: `${2 * k}px solid rgba(242,235,221,0.18)`, borderLeft: `${10 * k}px solid ${AMBER}`, boxShadow: `0 ${12 * k}px ${30 * k}px rgba(0,0,0,0.7)` }} />
      <T x={34} y={22} k={k} size={24} font={MONO} color={AMBER} ls={4}>
        CHAT YANG PERNAH DIBAGIKAN
      </T>
      <T x={34} y={62} k={k} size={46} font={SERIF} weight={700} w={900}>
        Tautan publiknya <Accent red>tidak ikut terhapus</Accent>
      </T>
      {/* link chip */}
      <div style={{ position: "absolute", left: 34 * k, top: 172 * k, width: 700 * k, height: 70 * k, borderRadius: 35 * k, border: `${3 * k}px dashed ${survive ? AMBER : "rgba(242,235,221,0.5)"}`, opacity: 1 - gone * 0.85, display: "flex", alignItems: "center", paddingLeft: 26 * k, boxSizing: "border-box", fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, color: CREAM, transform: `translateX(${gone * -40 * k}px)` }}>
        ⛓ tautan publik chat
        <span style={{ position: "absolute", left: 20 * k, top: "50%", height: 4 * k, width: `${gone * 92}%`, background: RED }} />
      </div>
      <Btn x={752} y={172} w={190} h={70} k={k} label="Delete" hot={hotAt(t, 74.82)} danger size={30} />
      <T x={34} y={280} k={k} size={36} font={SERIF} weight={400} color={DIM}>
        <i>hapus tautan itu secara terpisah</i>
      </T>
      <Pointer x={c.x} y={c.y} k={k} press={c.press} ripple={c.ripple} />
    </div>
  );
};

/** PAYOFF: Keep Activity off = features unavailable. */
const CostCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const lock = outBack(ramp(t, 68.9, 69.3));
  return (
    <WarnCard t={t} k={k} a={64.85} b={70.7} kicker="SAAT KEEP ACTIVITY MATI" icon="⊘">
      Banyak fitur <Accent red>tidak tersedia</Accent>
      <div style={{ display: "flex", gap: 14 * k, marginTop: 14 * k, alignItems: "center", opacity: sm(ramp(t, 68.4, 68.8)) }}>
        <div style={{ padding: `${8 * k}px ${22 * k}px`, borderRadius: 30 * k, border: `${3 * k}px solid ${RED}`, fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, color: CREAM, transform: `scale(${lock})`, transformOrigin: "0 50%", position: "relative" }}>
          Create music
          <span style={{ position: "absolute", left: 10 * k, right: 10 * k, top: "50%", height: 4 * k, background: RED, transform: `scaleX(${sm(ramp(t, 69.3, 69.7))})`, transformOrigin: "0 50%" }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 26 * k, color: DIM, letterSpacing: 2 * k, opacity: sm(ramp(t, 69.79, 70.1)) }}>· EPISODE 6</div>
      </div>
    </WarnCard>
  );
};

/** PAYOFF close: privacy vs features balance beam. */
const BalanceCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = 77.0, b = 81.2;
  const o = win(t, a, b);
  if (o <= 0) return null;
  const tilt = Math.sin((t - a) * 1.6) * 7 * (1 - sm(ramp(t, 79.3, 80.4)));
  return (
    <div style={{ position: "absolute", left: 60 * k, top: 268 * k, width: 960 * k, opacity: o }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 6 * k, color: AMBER }}>{typed("PUTUSKAN SENDIRI", t, a, a + 0.6)}</div>
      <div style={{ position: "relative", height: 220 * k, marginTop: 20 * k }}>
        <div style={{ position: "absolute", left: 470 * k, top: 60 * k, width: 0, height: 0, borderLeft: `${30 * k}px solid transparent`, borderRight: `${30 * k}px solid transparent`, borderBottom: `${60 * k}px solid ${AMBER}`, transform: `translate(-${10 * k}px, ${44 * k}px)` }} />
        <div style={{ position: "absolute", left: 40 * k, top: 90 * k, width: 880 * k, height: 8 * k, background: CREAM, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
          <div style={{ position: "absolute", left: 0, top: -96 * k, width: 330 * k, textAlign: "center", fontFamily: SERIF, fontWeight: 900, fontSize: 70 * k, color: CREAM, textShadow: `0 ${4 * k}px ${18 * k}px #000` }}>Privasi</div>
          <div style={{ position: "absolute", right: 0, top: -96 * k, width: 330 * k, textAlign: "center", fontFamily: SERIF, fontWeight: 900, fontSize: 70 * k, color: AMBER, textShadow: `0 ${4 * k}px ${18 * k}px #000` }}>Fitur</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- film
export const Ep10Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas flat width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.95, 2.0, 7.7], fov: 34 }}>
        <WorldScene t={t} f={f} />
        <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.72} envIntensity={0.1} hdri="studio" />
      </ThreeCanvas>
      {/* noir vignette + top scrim so headlines read over the lamp glow */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.62) 8%, rgba(0,0,0,0.38) 26%, rgba(0,0,0,0) 42%)", pointerEvents: "none" }} />

      {/* HOOK */}
      <Headline t={t} k={k} a={0.0} b={4.95} kicker="● ARSIP AKUNMU" size={104}>
        Semua chat-mu
        <br />
        <Accent>tersimpan.</Accent>
      </Headline>
      <Headline t={t} k={k} a={5.15} b={9.85} kicker="AUDIRA AI TUTORIAL · EP 10" size={96}>
        Buka arsipnya.
        <br />
        <span style={{ opacity: sm(ramp(t, 8.6, 8.9)) }}>
          <Accent red>Bersihkan.</Accent>
        </span>
      </Headline>

      {/* KONTEKS */}
      <Headline t={t} k={k} a={9.95} b={13.55} kicker="NAMA ARSIPNYA" size={92}>
        {typed("Gemini Apps", t, 11.8, 12.4)}
        <br />
        <Accent>{typed("Activity", t, 12.4, 12.9)}</Accent>
      </Headline>
      <RetentionCard t={t} k={k} />
      <Headline t={t} k={k} a={21.1} b={24.35} kicker="SEBELUM BATAS ITU" size={92}>
        Semuanya
      </Headline>
      <Stamp t={t} k={k} at={22.97} until={24.35} x={540} y={520} text="MASIH TERSIMPAN" size={84} />

      {/* LANGKAH */}
      <StepHeader n={1} title="Buka gemini.google.com" sub="di browser" k={k} t={t} a={24.3} b={26.7} />
      <StepHeader n={2} title="Settings & help → Activity" sub="tinjau semua perintahmu" k={k} t={t} a={26.7} b={32.3} />
      <StepHeader n={3} title="Delete activity item" sub="per chat · per hari · rentang waktu" k={k} t={t} a={32.3} b={44.45} />
      <PanelSteps t={t} k={k} />

      {/* PENJELASAN */}
      <StepHeader n={4} title="3 bulan, atau Turn off" sub="pengaturan Keep Activity" k={k} t={t} a={44.75} b={53.75} />
      <PanelKeep t={t} k={k} />
      <Headline t={t} k={k} a={53.85} b={56.45} kicker="TURN OFF AND DELETE ACTIVITY" size={84}>
        Riwayat lama
        <br />
        <Accent red>ikut dihapus</Accent>
      </Headline>
      <WarnCard t={t} k={k} a={56.55} b={63.2} kicker="WALAU SUDAH DIMATIKAN">
        Chat tetap disimpan sampai <Accent>72 jam</Accent>
        <div style={{ fontStyle: "italic", fontWeight: 400, fontSize: 34 * k, color: DIM, marginTop: 8 * k, opacity: sm(ramp(t, 60.59, 61.0)) }}>untuk menjalankan layanan &amp; memproses masukan</div>
      </WarnCard>

      {/* PAYOFF */}
      <Headline t={t} k={k} a={63.3} b={64.8} kicker="TAPI..." size={120}>
        Ada <Accent>harganya.</Accent>
      </Headline>
      <CostCard t={t} k={k} />
      <ShareCard t={t} k={k} />
      <BalanceCard t={t} k={k} />

      {/* OUTRO */}
      <Headline t={t} k={k} a={81.3} b={OUTRO_AT + 0.4} kicker="AUDIRA AI TUTORIAL · EP 10" size={100}>
        Privasi itu
        <br />
        <Accent>pilihan,</Accent>
        <br />
        <span style={{ opacity: sm(ramp(t, 82.5, 82.8)) }}>bukan rasa takut.</span>
      </Headline>

      <Captions t={t} k={k} hideAfter={OUTRO_AT} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
