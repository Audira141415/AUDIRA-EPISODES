// EP08 film: "Ngobrol Pakai Kamera: Gemini Live Lihat Apa yang Kamu Lihat" (TOONFORGE).
// One continuous cel-shaded garden (World.tsx) under 2D manga layers: headlines, comic voice
// bubbles, a generic phone UI with a pointing finger and big step numbers, a viewfinder HUD for
// the video-streaming beat, warning panels and karaoke captions. Every beat is keyed to
// timeline.json seconds (Audio Master Clock).
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { World, type Cam, type V3, COVER_CAM, HAND, LENS, PLANT_TARGET } from "./World.tsx";
import { Phone2D, G, T_APP, T_DIALOG, T_END, T_LIVE, T_SHARE, T_VIDEO, typedByWords, type ScreenState } from "./Phone.tsx";
import {
  BANG,
  CYAN,
  Captions,
  CamIcon,
  Finger,
  Headline,
  INK,
  MicIcon,
  NUN,
  PINK,
  RED,
  ScreenIcon,
  SpeedLines,
  StepTag,
  VoiceBubble,
  WarnIcon,
  YEL,
  bangers,
  clamp01,
  dela,
  nunito,
  outBack,
  ramp,
  sm,
  stroke,
  win,
} from "./ui.tsx";

const OUTRO_AT = TL.sections.outro[1] + 0.2;
const W = (id: string) => (TL.clips as { id: string; words: { w: string; s: number; e: number }[] }[]).find((c) => c.id === id)!.words;
const at = (id: string, i: number) => W(id)[i].s;

// key word times
const T_GEMINI_TAP = at("l06", 2); // "Gemini"
const T_LIVE_TAP = at("l07", 2); // "Live,"
const T_BICARA = at("l07", 4); // "mulai"
const T_VIDEO_TAP = at("l08", 4); // "Turn"
const T_DAUN = at("l09", 1); // "daun"
const T_KENAPA = at("l10", 2); // "kenapa"
const T_ANSWER = at("l11", 0);
const T_BINGUNG = at("l12", 0);
const T_SHARE_TAP = at("l13", 1); // "Turn"
const T_IKUTI = at("l13", 6); // "ikuti"
const T_MELIHAT = at("l14", 0);
const T_KEMBALI = at("l15", 2); // "kembali"
const T_OFF_TAP = at("l15", 8); // "Turn"
const T_SELESAI = at("l16", 0);
const T_END_TAP = at("l17", 1); // "End."
const S = TL.sections;

// ---------------------------------------------------------------- camera path
const v = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const V = (x: THREE.Vector3): V3 => [x.x, x.y, x.z];
const toPlant = PLANT_TARGET.clone().sub(HAND).normalize();
const PHONE_BACK = V(HAND.clone().addScaledVector(toPlant, -0.34).add(new THREE.Vector3(0, 0.1, 0)));
const PHONE_FACE: V3 = [HAND.x, HAND.y + 0.07, HAND.z];
const PLANT_AIM: V3 = [PLANT_TARGET.x, PLANT_TARGET.y + 0.1, PLANT_TARGET.z];
// phone-camera view: on the lens->plant line, `d` metres from the plant (lens is ~1.4 m away)
const povAt = (d: number, side = 0): V3 => {
  const p = PLANT_TARGET.clone().addScaledVector(toPlant, -d);
  return [p.x + side, p.y + 0.34, p.z];
};

type Seg = { a: number; b: number; A: Cam; B: Cam };
const SEGS: Seg[] = [
  // hook: over the shoulder, phone camera on the plant
  { a: 0, b: 3.05, A: { pos: [1.15, 1.4, 4.4], target: [0.35, 1.3, 0.65], fov: 42 }, B: { pos: [0.8, 1.5, 5.6], target: [0.38, 1.4, 0.55], fov: 40 } },
  { a: 3.05, b: 5.0, A: { pos: [0.8, 1.5, 5.6], target: [0.38, 1.4, 0.55], fov: 40 }, B: COVER_CAM },
  // AUDIRA pot label close-up, then crane up to the voice bubble
  { a: 5.0, b: 7.9, A: COVER_CAM, B: { pos: [1.25, 0.92, 2.9], target: [1.0, 0.72, 1.4], fov: 34 } },
  { a: 7.9, b: 10.9, A: { pos: [1.25, 0.92, 2.9], target: [1.0, 0.72, 1.4], fov: 34 }, B: { pos: [0.7, 1.75, 5.0], target: [0.45, 1.6, 0.6], fov: 38 } },
  // konteks: two-shot orbit, push in during the interruption
  { a: 10.9, b: 17.35, A: { pos: [3.3, 1.7, 3.9], target: [0.0, 1.35, 0.4], fov: 38 }, B: { pos: [2.6, 1.95, 4.7], target: [0.0, 1.4, 0.4], fov: 38 } },
  { a: 17.35, b: 22.25, A: { pos: [2.6, 1.95, 4.7], target: [0.0, 1.4, 0.4], fov: 38 }, B: { pos: [1.9, 1.75, 3.4], target: [-0.1, 1.45, 0.4], fov: 36 } },
  // into the phone
  { a: 22.25, b: 25.3, A: { pos: [-1.75, 2.6, -1.25], target: PHONE_FACE, fov: 36 }, B: { pos: PHONE_BACK, target: PHONE_FACE, fov: 30 } },
  // phone UI over the wide garden
  { a: 25.3, b: 35.45, A: { pos: [0.5, 2.3, 8.2], target: [0.3, 1.4, 0.5], fov: 38 }, B: { pos: [-0.6, 2.0, 7.6], target: [0.3, 1.3, 0.5], fov: 38 } },
  // through the phone camera
  { a: 35.45, b: 38.3, A: { pos: povAt(1.4), target: PLANT_AIM, fov: 58 }, B: { pos: povAt(1.3), target: PLANT_AIM, fov: 56 } },
  { a: 38.3, b: 40.4, A: { pos: povAt(1.3), target: PLANT_AIM, fov: 56 }, B: { pos: povAt(1.15, 0.06), target: [PLANT_AIM[0], PLANT_AIM[1] + 0.08, PLANT_AIM[2]], fov: 52 } },
  { a: 40.4, b: 44.35, A: { pos: povAt(1.15, 0.06), target: [PLANT_AIM[0], PLANT_AIM[1] + 0.08, PLANT_AIM[2]], fov: 52 }, B: { pos: povAt(1.2, 0.12), target: PLANT_AIM, fov: 53 } },
  { a: 44.35, b: 47.65, A: { pos: povAt(1.2, 0.12), target: PLANT_AIM, fov: 53 }, B: { pos: povAt(1.4), target: PLANT_AIM, fov: 57 } },
  // confused face close-up
  { a: 47.65, b: 49.85, A: { pos: [1.15, 1.95, 1.35], target: [-0.4, 1.5, 0.05], fov: 34 }, B: { pos: [0.95, 1.9, 1.45], target: [-0.4, 1.5, 0.05], fov: 32 } },
  // phone UI again
  { a: 49.85, b: 66.75, A: { pos: [-2.4, 2.2, 6.0], target: [0.2, 1.3, 0.6], fov: 38 }, B: { pos: [-1.2, 2.6, 7.4], target: [0.2, 1.3, 0.6], fov: 38 } },
  // payoff orbit
  { a: 66.75, b: 81.2, A: { pos: [3.6, 2.4, 6.6], target: [0.2, 1.15, 0.6], fov: 38 }, B: { pos: [-1.8, 2.1, 7.4], target: [0.2, 1.15, 0.6], fov: 38 } },
  // outro: crane up to the sky
  { a: 81.2, b: 90.3, A: { pos: [0.4, 1.8, 7.4], target: [0.4, 1.6, 0.4], fov: 40 }, B: { pos: [0.4, 4.0, 8.2], target: [0.4, 7.5, -12], fov: 44 } },
];
const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const camAt = (t: number): Cam => {
  let s = SEGS[0];
  for (const g of SEGS) if (t >= g.a) s = g;
  const k = ease(clamp01((t - s.a) / (s.b - s.a)));
  const drift = Math.sin(t * 0.7) * 0.02;
  const p = v(s.A.pos, s.B.pos, k);
  return { pos: [p[0] + drift, p[1] + drift * 0.5, p[2]], target: v(s.A.target, s.B.target, k), fov: s.A.fov + (s.B.fov - s.A.fov) * k };
};

// ---------------------------------------------------------------- finger taps (global 1080-space)
type Tap = { t: number; x: number; y: number; press?: boolean };
const g = (p: { x: number; y: number }, dx = 0, dy = 0) => ({ x: G(p.x, p.y).x + dx, y: G(p.x, p.y).y + dy });
const TAPS_A: Tap[] = [
  { t: 25.3, ...g({ x: 330, y: 760 }) },
  { t: T_GEMINI_TAP, ...g(T_APP), press: true },
  { t: T_LIVE_TAP, ...g(T_LIVE), press: true },
  { t: T_BICARA, ...g({ x: 420, y: 560 }) },
  { t: T_VIDEO_TAP, ...g(T_VIDEO, 60), press: true },
];
const TAPS_B: Tap[] = [
  { t: 49.9, ...g({ x: 380, y: 560 }) },
  { t: T_SHARE_TAP + 0.2, ...g(T_SHARE, 60), press: true },
  { t: T_IKUTI + 0.45, ...g(T_DIALOG), press: true },
  { t: 55.6, ...g({ x: 330, y: 420 }) },
  { t: 57.4, ...g({ x: 300, y: 600 }) },
  { t: T_KEMBALI + 0.3, ...g({ x: 400, y: 500 }) },
  { t: T_OFF_TAP + 0.1, ...g(T_SHARE, 60), press: true },
  { t: T_END_TAP, ...g(T_END, 60), press: true },
];
const fingerAt = (t: number, taps: Tap[]) => {
  let i = 0;
  while (i < taps.length - 1 && t >= taps[i + 1].t) i++;
  const a = taps[i], b = taps[Math.min(i + 1, taps.length - 1)];
  const k = b === a ? 0 : sm(ramp(t, b.t - 0.5, b.t - 0.05));
  const x = a.x + (b.x - a.x) * k + Math.sin(t * 2.3) * 4;
  const y = a.y + (b.y - a.y) * k + Math.cos(t * 1.9) * 4;
  let press = 0, ripple = 0;
  for (const tp of taps) {
    if (!tp.press) continue;
    const d = t - tp.t;
    if (d > -0.12 && d < 0.2) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.16);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  }
  return { x, y, press: Math.max(0, press), ripple };
};
/** highlight that rises just before a tap and lingers after it */
const hotAt = (t: number, tap: number) => Math.max(0, Math.min(sm(ramp(t, tap - 0.35, tap)), 1 - sm(ramp(t, tap + 0.35, tap + 0.7))));

// ---------------------------------------------------------------- phone screen schedule
type Slot = { from: number; s: (t: number) => ScreenState };
const SLOTS_A: Slot[] = [
  { from: 24.9, s: (t) => ({ name: "home", t, hot: "app", hotK: hotAt(t, T_GEMINI_TAP) }) },
  { from: T_GEMINI_TAP + 0.25, s: (t) => ({ name: "app", t, hot: "live", hotK: hotAt(t, T_LIVE_TAP) }) },
  { from: T_LIVE_TAP + 0.25, s: (t) => ({ name: "live", t, level: t > T_BICARA ? 0.9 : 0.3, hot: "video", hotK: hotAt(t, T_VIDEO_TAP) }) },
];
const SLOTS_B: Slot[] = [
  { from: 49.6, s: (t) => ({ name: "live", t, level: 0.4, hot: "share", hotK: hotAt(t, T_SHARE_TAP + 0.2) }) },
  { from: T_SHARE_TAP + 0.55, s: (t) => ({ name: "dialog", t, hot: "dialog", hotK: hotAt(t, T_IKUTI + 0.45) }) },
  { from: T_MELIHAT - 0.15, s: (t) => ({ name: "settings", t }) },
  { from: T_KEMBALI + 0.1, s: (t) => ({ name: "live", t, level: 0.4, shareOn: t < T_OFF_TAP + 0.35, hot: t < T_OFF_TAP + 0.8 ? "share" : "end", hotK: t < T_OFF_TAP + 0.8 ? hotAt(t, T_OFF_TAP + 0.1) : hotAt(t, T_END_TAP) }) },
  { from: T_END_TAP + 0.2, s: () => ({ name: "ended", t: 0 }) },
];
const screenAt = (t: number, slots: Slot[]) => {
  let i = 0;
  while (i < slots.length - 1 && t >= slots[i + 1].from) i++;
  const p = ramp(t, slots[i].from, slots[i].from + 0.3);
  return { cur: slots[i].s(t), prev: i > 0 && p < 1 ? slots[i - 1].s(t) : undefined, p };
};

// ---------------------------------------------------------------- warning panels
const CARDS = [
  { at: S.payoff[0], title: "CEK LAGI JAWABANNYA", body: ["Apalagi soal", "kesehatan atau uang."], icons: "health" },
  { at: at("l19", 0), title: "GANTI SUARA", body: ["Lewat menu profil.", "Tidak tersedia di semua bahasa."], icons: "voice" },
  { at: at("l20", 0), title: "TIAP HP BISA BEDA", body: ["Tampilan & bahasa bisa beda.", "Cek langsung di aplikasimu."], icons: "phones" },
] as const;

const CardIcons: React.FC<{ k: number; kind: string }> = ({ k, kind }) => {
  const box = (child: React.ReactNode, bg: string, key: number) => (
    <div key={key} style={{ width: 120 * k, height: 120 * k, borderRadius: 28 * k, background: bg, border: `${6 * k}px solid ${INK}`, boxShadow: `${6 * k}px ${6 * k}px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {child}
    </div>
  );
  if (kind === "health")
    return (
      <>
        {box(
          <svg width={74 * k} height={74 * k} viewBox="0 0 74 74">
            <path d="M37 64 C 6 42, 4 18, 22 12 C 30 10, 35 15, 37 20 C 39 15, 44 10, 52 12 C 70 18, 68 42, 37 64 Z" fill="#fff" stroke={INK} strokeWidth={5} />
            <path d="M37 26 v22 M26 37 h22" stroke={RED} strokeWidth={7} strokeLinecap="round" />
          </svg>,
          PINK,
          0,
        )}
        {box(
          <svg width={74 * k} height={74 * k} viewBox="0 0 74 74">
            <circle cx={37} cy={37} r={27} fill={YEL} stroke={INK} strokeWidth={5} />
            <circle cx={37} cy={37} r={18} fill="none" stroke={INK} strokeWidth={3} />
            <text x={37} y={47} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={28} fill={INK}>Rp</text>
          </svg>,
          "#7fd25b",
          1,
        )}
      </>
    );
  if (kind === "voice")
    return (
      <>
        {box(
          <svg width={74 * k} height={74 * k} viewBox="0 0 74 74">
            <circle cx={37} cy={26} r={14} fill="#fff" stroke={INK} strokeWidth={5} />
            <path d="M12 66 C 14 46, 60 46, 62 66 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </svg>,
          CYAN,
          0,
        )}
        {box(
          <svg width={80 * k} height={60 * k} viewBox="0 0 80 60">
            {[10, 22, 34, 46, 58, 70].map((x, i) => (
              <rect key={i} x={x - 4} y={30 - [8, 18, 26, 14, 22, 9][i]} width={8} height={[8, 18, 26, 14, 22, 9][i] * 2} rx={4} fill="#fff" stroke={INK} strokeWidth={3} />
            ))}
          </svg>,
          "#9b8cff",
          1,
        )}
      </>
    );
  return (
    <>
      {[0, 1].map((i) =>
        box(
          <div style={{ width: 46 * k, height: 78 * k, borderRadius: 10 * k, border: `${5 * k}px solid ${INK}`, background: i ? "#e9f3ff" : "#fff1d6", display: "flex", flexDirection: "column", gap: 6 * k, padding: 6 * k, transform: `rotate(${i ? 8 : -8}deg)` }}>
            <div style={{ height: 8 * k, borderRadius: 4 * k, background: i ? CYAN : PINK }} />
            <div style={{ height: 8 * k, borderRadius: 4 * k, background: "#c7cbd8", width: i ? "60%" : "90%" }} />
          </div>,
          i ? "#45b6fe" : YEL,
          i,
        ),
      )}
    </>
  );
};

const WarningStack: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t < S.payoff[0] - 0.2 || t > S.outro[0] - 0.1) return null;
  const out = 1 - sm(ramp(t, S.outro[0] - 0.6, S.outro[0] - 0.1));
  return (
    <>
      {CARDS.map((c, i) => {
        const p = ramp(t, c.at - 0.15, c.at + 0.4);
        if (p <= 0) return null;
        const next = CARDS[i + 1];
        const back = next ? sm(ramp(t, next.at - 0.15, next.at + 0.35)) : 0;
        const back2 = CARDS[i + 2] ? sm(ramp(t, CARDS[i + 2].at - 0.15, CARDS[i + 2].at + 0.35)) : 0;
        const depth = back + back2;
        const pop = outBack(p);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 70 * k,
              top: (330 - depth * 46) * k,
              width: 940 * k,
              opacity: out * clamp01(p * 2) * (1 - depth * 0.12),
              transform: `translateX(${(1 - pop) * 700 * k}px) rotate(${(1 - pop) * 8 + (i % 2 ? 1.5 : -1.5) - depth * 1.2}deg) scale(${1 - depth * 0.07})`,
              transformOrigin: "50% 0%",
              filter: depth > 0 ? `brightness(${1 - depth * 0.18})` : undefined,
              zIndex: 10 + i,
            }}
          >
            <div style={{ background: "#fff", border: `${8 * k}px solid ${INK}`, boxShadow: `${14 * k}px ${14 * k}px 0 ${INK}`, borderRadius: 18 * k, overflow: "hidden" }}>
              <div style={{ height: 42 * k, background: `repeating-linear-gradient(-45deg, ${YEL} 0 ${28 * k}px, ${INK} ${28 * k}px ${56 * k}px)`, borderBottom: `${6 * k}px solid ${INK}` }} />
              <div style={{ padding: `${26 * k}px ${34 * k}px ${30 * k}px`, display: "flex", flexDirection: "column", gap: 14 * k }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 * k }}>
                  <WarnIcon s={96 * k} />
                  <div style={{ fontFamily: BANG, fontSize: (c.title.length > 15 ? 84 : 100) * k, lineHeight: 0.95, color: RED, ...stroke(5 * k), letterSpacing: 1 * k }}>{c.title}</div>
                </div>
                {c.body.map((l, j) => (
                  <div key={j} style={{ fontFamily: NUN, fontWeight: 900, fontSize: 44 * k, color: INK, lineHeight: 1.15 }}>
                    {l}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 22 * k, marginTop: 8 * k }}>
                  <CardIcons k={k} kind={c.icons} />
                  <div style={{ flex: 1 }} />
                  <div style={{ alignSelf: "flex-end", fontFamily: BANG, fontSize: 70 * k, color: YEL, ...stroke(8 * k) }}>{i + 1}/3</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the film
export const Ep08Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP08 film fonts"));
  useEffect(() => {
    Promise.all([bangers.waitUntilDone(), dela.waitUntilDone(), nunito.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  // ---- world state
  const cam = camAt(t);
  const povMode = t >= 35.45 && t < 47.65;
  const frustum = povMode || (t >= 47.65 && t < 49.85) ? 0 : Math.max(sm(ramp(t, 0.35, 0.8)), t > 3 ? 1 : 0);
  const frameO = povMode ? 0 : t < 11 ? sm(ramp(t, 1.0, 1.4)) * (1 - sm(ramp(t, 10.5, 10.9))) : 0;
  const frameScale = povMode ? 0.95 : 1 + (1 - outBack(clamp01(ramp(t, 1.0, 1.45)))) * 0.6;
  const bubble = win(t, 7.9, 10.85, 0.3, 0.2);
  const yellow = sm(ramp(t, T_DAUN - 0.2, T_DAUN + 1.3));
  const confused = win(t, 47.6, 49.9, 0.3, 0.2);
  const talk = t >= 11 && t < 22.2 ? (Math.sin(t * 2.1) > 0 ? 1 : 0) : 0;
  const phoneGlow = win(t, 22.3, 25.3, 0.6, 0.1);

  // ---- phone UI segments
  const segA = t >= 24.9 && t < 35.7;
  const segB = t >= 49.6 && t < 66.95;
  const enterA = sm(ramp(t, 24.9, 25.45));
  const zoomThrough = ramp(t, T_VIDEO_TAP + 0.45, 35.6);
  const enterB = sm(ramp(t, 49.6, 50.05));
  const exitB = sm(ramp(t, T_END_TAP + 0.35, 66.95));
  const dim = Math.max(segA ? enterA * (1 - zoomThrough) : 0, segB ? enterB * (1 - exitB) : 0, t >= 66.7 && t < S.outro[0] ? 0.55 * win(t, 66.7, S.outro[0], 0.4, 0.4) : 0);
  const sharing = segB ? win(t, T_IKUTI + 0.6, T_OFF_TAP + 0.35, 0.3, 0.2) * (0.75 + 0.25 * Math.sin(t * 6)) : 0;

  // ---- speed-line bursts
  const tapTimes = [T_GEMINI_TAP, T_LIVE_TAP, T_VIDEO_TAP, T_SHARE_TAP + 0.2, T_OFF_TAP + 0.1, T_END_TAP];
  let lines = t < 2.6 ? 1 - sm(ramp(t, 2.0, 2.6)) : 0;
  lines = Math.max(lines, win(t, 18.85, 19.9, 0.08, 0.4));
  for (const c of CARDS) lines = Math.max(lines, win(t, c.at - 0.1, c.at + 0.6, 0.08, 0.35));
  for (const tt of tapTimes) lines = Math.max(lines, 0.55 * win(t, tt - 0.02, tt + 0.35, 0.05, 0.25));
  lines = Math.max(lines, 0.8 * win(t, 34.85, 35.8, 0.15, 0.3));

  // ---- konteks voice levels
  const youA = (t >= 13.1 && t < 14.6) || (t >= 16.0 && t < 17.3);
  const aiA = (t >= 11.4 && t < 13.0) || (t >= 14.7 && t < 15.95) || (t >= 17.4 && t < 18.9) || (t >= 20.3 && t < 22.0);
  const interrupt = t >= 18.9 && t < 20.3;

  const fA = fingerAt(t, TAPS_A);
  const fB = fingerAt(t, TAPS_B);
  const scrA = screenAt(t, SLOTS_A);
  const scrB = screenAt(t, SLOTS_B);

  const question = W("l10").slice(2);
  const typed = typedByWords(t, question);

  return (
    <AbsoluteFill style={{ background: "#4fa3ff", overflow: "hidden" }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows camera={{ position: COVER_CAM.pos, fov: 38, near: 0.03, far: 200 }}>
          <World f={f} font={bangers.fontFamily} cam={cam} frustum={frustum} frame={frameO} frameScale={frameScale} bubble={bubble} bubbleScale={0.6 + 0.4 * outBack(clamp01(ramp(t, 7.9, 8.3)))} yellow={yellow} confused={confused} talk={talk} phoneGlow={phoneGlow} />
          <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.95} envIntensity={0.3} ao={false} />
        </ThreeCanvas>
      )}
      {ready && (
        <>
          {/* ---- dim plate behind UI */}
          {dim > 0.01 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 55% 45%, rgba(20,26,70,${0.35 * dim}) 0%, rgba(10,10,30,${0.62 * dim}) 100%)` }} />}

          <SpeedLines f={f} o={lines} cx={povMode ? 560 : t < 3 ? 640 : 540} cy={900} inner={t < 3 ? 470 : 560} />

          {/* ---- hook + konteks headlines */}
          <Headline k={k} o={win(t, 0, 4.6, 0.01, 0.25)} lines={["ARAHKAN KAMERA", "LALU TANYA!"]} color={YEL} />
          <Headline k={k} o={win(t, 4.8, 10.75, 0.3, 0.25)} kicker="AUDIRA AI TUTORIAL" lines={["GEMINI LIVE"]} sub="lihat apa yang kamu lihat" color={CYAN} />
          <Headline k={k} o={win(t, 11.0, 17.3, 0.3, 0.2)} lines={["NGOBROL", "PAKAI SUARA"]} sub="senatural menelepon teman" color={YEL} />
          <Headline k={k} o={win(t, 17.4, 22.2, 0.25, 0.2)} lines={["BISA", "DIPOTONG!"]} sub="kapan saja" color={PINK} />
          <Headline k={k} o={win(t, 22.3, 25.2, 0.3, 0.25)} lines={["ADA DI", "APLIKASI HP"]} color={CYAN} />
          <Headline k={k} o={win(t, T_BINGUNG - 0.1, 49.85, 0.2, 0.2)} lines={["BINGUNG", "DI LAYAR?"]} color={YEL} />

          {/* ---- konteks conversation bubbles */}
          <VoiceBubble k={k} x={520} y={700} w={500} o={win(t, 11.2, 22.3, 0.3, 0.3)} t={t} who="ai" level={interrupt ? 0 : aiA ? 1 : 0.12} tail="right" label={interrupt ? "DIPOTONG" : "AI"} />
          <VoiceBubble k={k} x={60} y={interrupt ? 1060 : 1100} w={interrupt ? 560 : 500} o={win(t, 12.9, 22.3, 0.3, 0.3)} t={t} who="you" level={interrupt || youA || (t >= 20.3 && t < 21.0) ? 1 : 0.12} tail="left" jagged={interrupt} label={interrupt ? "POTONG!" : t >= 20.2 ? "TAMBAH / UBAH" : "KAMU"} />

          {/* ---- phone segment A (langkah 1-3) */}
          {segA && (
            <>
              <StepTag k={k} n={1} lines={["BUKA", "APLIKASI"]} o={win(t, 25.2, T_GEMINI_TAP + 0.6, 0.3, 0.2)} />
              <StepTag k={k} n={2} lines={["KETUK", "LIVE"]} o={win(t, T_GEMINI_TAP + 0.65, at("l08", 0) - 0.1, 0.3, 0.2)} />
              <StepTag k={k} n={3} lines={["VIDEO", "STREAMING"]} o={win(t, at("l08", 0), 35.3, 0.3, 0.2)} />
              <Phone2D k={k} cur={scrA.cur} prev={scrA.prev} p={scrA.p} zoom={(2.3 - 1.3 * enterA) * (1 + 2.4 * sm(zoomThrough))} glass={(1 - sm(ramp(zoomThrough, 0.4, 1)))} bezel={enterA * (1 - sm(ramp(zoomThrough, 0.55, 1)))} />
              <VoiceBubble k={k} x={30} y={1110} w={430} o={win(t, T_BICARA - 0.1, at("l08", 0), 0.25, 0.2)} t={t} who="you" level={1} tail="left" label="MULAI BICARA" />
              <Finger k={k} {...fA} o={sm(ramp(t, 25.3, 25.7)) * (1 - sm(ramp(t, T_VIDEO_TAP + 0.35, T_VIDEO_TAP + 0.6)))} />
            </>
          )}

          {/* ---- viewfinder HUD (video streaming) */}
          {povMode && <StreamHud t={t} k={k} f={f} typed={typed} />}

          {/* ---- phone segment B (langkah 4) */}
          {segB && (
            <>
              <StepTag k={k} n={4} lines={["BAGI", "LAYAR"]} o={win(t, 49.7, T_SELESAI - 0.1, 0.3, 0.2)} />
              <StepTag k={k} n={4} lines={["SELESAI?", "KETUK END"]} o={win(t, T_SELESAI, 66.9, 0.25, 0.2)} />
              <Phone2D
                k={k}
                cur={scrB.cur}
                prev={scrB.prev}
                p={scrB.p}
                zoom={0.7 + 0.3 * enterB - 0.25 * exitB}
                dy={(1 - enterB) * 500 + exitB * 900}
                rot={(1 - enterB) * 10 + exitB * -14}
                glass={1}
                bezel={1}
                sharing={sharing}
              />
              {/* settings annotations */}
              <SeeChip k={k} o={win(t, T_MELIHAT, T_KEMBALI, 0.3, 0.25)} t={t} />
              <Huh k={k} o={win(t, at("l14", 7) - 0.2, T_KEMBALI + 0.2, 0.2, 0.2)} t={t} />
              <Annot k={k} o={win(t, T_IKUTI - 0.1, T_MELIHAT - 0.2, 0.2, 0.2)} text="IKUTI PETUNJUKNYA" y={1150} />
              <Annot k={k} o={win(t, T_KEMBALI, T_OFF_TAP - 0.1, 0.2, 0.2)} text="KEMBALI KE APLIKASI" y={1150} />
              <Finger k={k} {...fB} o={sm(ramp(t, 49.9, 50.3)) * (1 - sm(ramp(t, T_END_TAP + 0.3, T_END_TAP + 0.5)))} />
            </>
          )}

          {/* ---- confused marks on the face shot */}
          {t >= 47.6 && t < 49.9 && <Huh k={k} o={confused} t={t} x={560} y={560} />}

          <WarningStack t={t} k={k} />

          {/* ---- outro teaser */}
          <Headline k={k} o={win(t, S.outro[0] - 0.05, at("l22", 0) - 0.05, 0.3, 0.2)} kicker="EPISODE DEPAN" lines={["RISET", "5 MENIT"]} sub="jadi laporan lengkap" color={YEL} />
          <AudiraPop k={k} t={t} at={at("l22", 0) - 0.1} until={OUTRO_AT + 0.4} />

          <Captions t={t} k={k} hideAfter={OUTRO_AT} />
          <Outro start={OUTRO_AT} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- HUD pieces
const StreamHud: React.FC<{ t: number; k: number; f: number; typed: string }> = ({ t, k, typed }) => {
  const o = win(t, 35.4, 47.65, 0.35, 0.2);
  const q = win(t, T_KENAPA - 0.2, T_ANSWER + 0.2, 0.25, 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {/* viewfinder frame */}
      <div style={{ position: "absolute", left: 26 * k, top: 26 * k, right: 26 * k, bottom: 26 * k, borderRadius: 70 * k, border: `${10 * k}px solid #fff`, boxShadow: `0 0 0 ${5 * k}px ${INK}, inset 0 0 0 ${5 * k}px ${INK}` }} />
      {/* live chip top-right */}
      <div style={{ position: "absolute", right: 60 * k, top: 262 * k, display: "flex", alignItems: "center", gap: 12 * k, background: INK, color: "#fff", padding: `${8 * k}px ${20 * k}px`, borderRadius: 14 * k, fontFamily: NUN, fontWeight: 900, fontSize: 34 * k, borderBottom: `${5 * k}px solid ${CYAN}` }}>
        <span style={{ width: 18 * k, height: 18 * k, borderRadius: 9 * k, background: RED, display: "inline-block", opacity: 0.6 + 0.4 * Math.sin(t * 8) }} />
        Live
        <CamIcon s={36 * k} c={CYAN} />
      </div>
      <StepTag k={k} n={3} lines={["ARAHKAN", "KAMERA"]} o={win(t, 35.5, T_DAUN - 0.1, 0.3, 0.25)} size={0.62} />
      {/* yellow leaf callout */}
      {(() => {
        const c = win(t, T_DAUN - 0.1, at("l10", 0) + 0.2, 0.25, 0.25);
        if (c <= 0.01) return null;
        const s = outBack(clamp01(ramp(t, T_DAUN - 0.1, T_DAUN + 0.35)));
        return (
          <div style={{ position: "absolute", left: 200 * k, top: 520 * k, opacity: c }}>
            <div style={{ position: "absolute", left: -110 * k, top: -110 * k, width: 220 * k, height: 220 * k, borderRadius: "50%", border: `${10 * k}px solid ${YEL}`, boxShadow: `0 0 0 ${5 * k}px ${INK}, inset 0 0 0 ${5 * k}px ${INK}`, transform: `scale(${s})` }} />
            <div style={{ position: "absolute", left: -110 * k, top: 130 * k, whiteSpace: "nowrap", fontFamily: BANG, fontSize: 84 * k, color: YEL, ...stroke(10 * k), textShadow: `${6 * k}px ${6 * k}px 0 ${INK}`, transform: `rotate(-4deg) scale(${s})` }}>DAUN MENGUNING</div>
          </div>
        );
      })()}
      {/* spoken question, typed as it is said */}
      {q > 0.01 && (
        <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: 420 * k, opacity: q, transform: `translateY(${(1 - q) * -30 * k}px)` }}>
          <div style={{ background: "#fff", border: `${6 * k}px solid ${INK}`, boxShadow: `${9 * k}px ${9 * k}px 0 ${ORANGE_SH}`, borderRadius: 40 * k, padding: `${22 * k}px ${30 * k}px`, display: "flex", gap: 22 * k, alignItems: "center" }}>
            <div style={{ width: 96 * k, height: 96 * k, borderRadius: 48 * k, background: "#ff9f1c", border: `${5 * k}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MicIcon k={k} />
            </div>
            <div style={{ fontFamily: NUN, fontWeight: 900, fontSize: 46 * k, color: INK, lineHeight: 1.18, minHeight: 2 * 1.18 * 46 * k }}>
              {typed}
              <span style={{ opacity: Math.sin(t * 12) > 0 ? 1 : 0, color: "#ff9f1c" }}>|</span>
            </div>
          </div>
        </div>
      )}
      {/* spoken answer (no answer text on screen: voice only) */}
      <VoiceBubble k={k} x={330} y={930} w={680} o={win(t, T_ANSWER - 0.1, 47.6, 0.25, 0.2)} t={t} who="ai" level={1} tail="right" label="MENJAWAB DENGAN SUARA" />
      {/* bottom controls */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170 * k, display: "flex", justifyContent: "center", gap: 70 * k }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 124 * k, height: 124 * k, borderRadius: 62 * k, background: i === 0 ? CYAN : i === 2 ? RED : "#fff", border: `${6 * k}px solid ${INK}`, boxShadow: `${6 * k}px ${6 * k}px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {i === 0 ? <CamIcon s={64 * k} /> : i === 1 ? <ScreenIcon s={64 * k} /> : <svg width={50 * k} height={50 * k} viewBox="0 0 34 34"><path d="M8 8 L26 26 M26 8 L8 26" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></svg>}
          </div>
        ))}
      </div>
    </div>
  );
};
const ORANGE_SH = "#ff9f1c";

const SeeChip: React.FC<{ k: number; o: number; t: number }> = ({ k, o, t }) => {
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 40 * k, top: 840 * k, opacity: o, transform: `scale(${0.7 + 0.3 * outBack(clamp01(o))}) rotate(-5deg)`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 12 * k, background: CYAN, border: `${6 * k}px solid ${INK}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${INK}`, borderRadius: 24 * k, padding: `${10 * k}px ${20 * k}px` }}>
      <svg width={62 * k} height={44 * k} viewBox="0 0 62 44">
        <path d="M3 22 C 16 2, 46 2, 59 22 C 46 42, 16 42, 3 22 Z" fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx={31 + Math.sin(t * 2) * 5} cy={22} r={10} fill={INK} />
      </svg>
      <div style={{ fontFamily: BANG, fontSize: 52 * k, lineHeight: 0.95, color: INK }}>
        GEMINI
        <br />
        IKUT MELIHAT
      </div>
    </div>
  );
};

const Huh: React.FC<{ k: number; o: number; t: number; x?: number; y?: number }> = ({ k, o, t, x = 760, y = 300 }) => {
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, opacity: o, display: "flex", gap: 6 * k }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ fontFamily: BANG, fontSize: (110 + i * 24) * k, color: i === 1 ? YEL : "#fff", ...stroke(10 * k), transform: `translateY(${Math.sin(t * 5 + i * 1.7) * 14 * k}px) rotate(${(i - 1) * 12}deg) scale(${outBack(clamp01(o))})` }}>
          ?
        </div>
      ))}
    </div>
  );
};

const Annot: React.FC<{ k: number; o: number; text: string; y: number }> = ({ k, o, text, y }) => {
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 40 * k, top: y * k, opacity: o, transform: `rotate(-4deg) scale(${0.7 + 0.3 * outBack(clamp01(o))})`, transformOrigin: "left top", background: YEL, border: `${6 * k}px solid ${INK}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${INK}`, padding: `${8 * k}px ${18 * k}px`, fontFamily: BANG, fontSize: 50 * k, color: INK, maxWidth: 330 * k, lineHeight: 1 }}>
      {text}
    </div>
  );
};

const AudiraPop: React.FC<{ k: number; t: number; at: number; until: number }> = ({ k, t, at: a, until }) => {
  const o = win(t, a, until, 0.2, 0.3);
  if (o <= 0.01) return null;
  const s = outBack(clamp01(ramp(t, a, a + 0.4)));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 700 * k, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `rotate(-6deg) scale(${s})`, background: PINK, border: `${10 * k}px solid ${INK}`, borderRadius: 60 * k, boxShadow: `${16 * k}px ${16 * k}px 0 ${INK}`, padding: `${10 * k}px ${60 * k}px` }}>
        <div style={{ fontFamily: BANG, fontSize: 210 * k, color: "#fff", ...stroke(16 * k), letterSpacing: 4 * k }}>AUDIRA</div>
      </div>
    </div>
  );
};
