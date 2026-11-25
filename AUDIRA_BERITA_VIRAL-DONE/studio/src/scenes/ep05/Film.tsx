// EP05 film (CIRCUITFORGE): "212 GB untuk satu game" — GTA 6 pre-load.
// One continuous macro world inside an SSD board (the approved cover). Set pieces rise out of the
// board in front of the hero NAND stack: calendar chips, the Series S usable-space column, the
// network funnel, the pre-order towers, a price tag, an opened game case, an empty PC footprint.
// Every beat is anchored to word times in timeline.json (Audio Master Clock). No audio here.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import tl from "./timeline.json";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { AMBER, BEBAS, BG, BLOCKS, Board, CYAN, MONO, PASSIVES, PINK, Passive, Sky, Stack } from "./Cover.tsx";
import {
  AUDIRA_SILK_POS,
  AudiraSilk,
  BoardApron,
  CHIP_H,
  Calendar,
  Column,
  COL_FILL,
  FilmHero,
  Footprint,
  Funnel,
  GameCase,
  PriceTag,
  RoutePackets,
  STAGE,
  TOWER_L,
  TOWER_R,
  Towers,
  colLayerY,
  dayPos,
  seg,
  towerTopY,
  win,
  type V3,
} from "./filmWorld.tsx";

// ------------------------------------------------------------------ clock
type Word = { w: string; s: number; e: number };
const CLIPS = tl.clips as { words: Word[] }[];
const SEC = tl.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
const TOTAL = tl.total;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;
/** Start time of the first word in clip `ci` that begins with `text`. */
const A = (ci: number, text: string) => {
  const w = CLIPS[ci].words.find((x) => x.w.startsWith(text));
  if (!w) throw new Error(`EP05 anchor missing: ${ci}:${text}`);
  return w.s;
};
const T = {
  itu: A(0, "Itu"),
  d10: A(0, "10"),
  gta: A(1, "GTA"),
  d19: A(1, "19"),
  ps5: A(1, "PS5"),
  xbox: A(1, "Xbox"),
  preload: A(1, "pre-load"),
  awal: A(1, "awal"),
  file: A(1, "File"),
  tapi: A(1, "tapi"),
  dimainkan: A(1, "dimainkan"),
  tiba: A(1, "tiba"),
  kenapa: A(2, "Kenapa"),
  g212: A(2, "212"),
  separuh: A(2, "separuh"),
  seriesS: A(2, "Xbox"),
  kalau: A(2, "Kalau"),
  jutaan: A(2, "jutaan"),
  jaringan: A(2, "jaringan"),
  preload2: A(2, "Pre-load"),
  antu: A(3, "Antusiasmenya"),
  sensor: A(3, "Sensor"),
  n771: A(3, "7,71"),
  usd: A(3, "US$751"),
  lebih: A(3, "lebih"),
  tujuh: A(3, "Tujuh"),
  ingat: A(3, "Ingat"),
  take: A(3, "Take-Two"),
  pesanan: A(3, "pesanan"),
  store: A(4, "PlayStation"),
  harga: A(4, "Rp1,19"),
  versi: A(4, "Versi"),
  kode: A(4, "kode"),
  pc: A(4, "PC"),
  kamu: A(5, "Kamu"),
  tulis: A(5, "Tulis"),
};

// ------------------------------------------------------------------ camera (shot list)
type Key = { t: number; p: V3; g: V3 };
const COVER: Key = { t: 0, p: [0.15, 2.05, 6.4], g: [0, 1.25, -2.6] };
const KEYS: Key[] = [
  COVER,
  { t: T.d10, p: [0.1, 1.85, 5.5], g: [0, 1.12, -2.6] }, // hook: slow push on the filling stack
  { t: SEC.HOOK[1] - 0.2, p: [0.05, 1.7, 4.9], g: [0, 1.0, -2.6] },
  { t: T.gta + 0.6, p: [0.0, 5.6, 6.0], g: [0, 0.1, 1.05] }, // crane up + tilt down onto the calendar
  { t: T.preload, p: [0.2, 5.3, 5.7], g: [0.05, 0.1, 1.05] },
  { t: T.tapi, p: [0.2, 4.8, 5.3], g: [0.2, 0.1, 1.1] },
  { t: SEC.KONTEKS[1], p: [0.55, 2.7, 3.85], g: [0.6, 0.15, 1.3] }, // close on day 19 + padlock
  { t: T.g212, p: [0.7, 1.75, 5.1], g: [0, 1.1, 1.1] }, // dolly back: usable-space column
  { t: T.kalau - 0.3, p: [-0.45, 1.65, 4.7], g: [0, 1.05, 1.1] },
  { t: T.jutaan + 0.5, p: [0.0, 3.9, 4.55], g: [0, 0, 0.95] }, // crane up over the funnel
  { t: SEC.PENGEMBANGAN[1], p: [0.25, 3.45, 4.15], g: [0, 0, 1.05] },
  { t: T.n771, p: [0.9, 2.0, 5.4], g: [0.05, 1.35, 1.1] }, // towers
  { t: T.tujuh, p: [0.2, 1.95, 5.25], g: [0.06, 1.02, 1.1] },
  { t: T.take, p: [-0.55, 2.05, 5.15], g: [0.06, 0.98, 1.1] },
  { t: SEC.PENJELASAN[1], p: [-0.85, 2.2, 5.0], g: [0.06, 0.95, 1.1] },
  { t: T.harga + 0.3, p: [0.1, 1.05, 4.55], g: [0, 0.78, 1.3] }, // price tag eye level
  { t: T.versi + 0.2, p: [-0.15, 1.1, 4.45], g: [0, 0.75, 1.3] },
  { t: T.kode + 0.3, p: [0.1, 1.1, 4.5], g: [0.0, 0.5, 1.35] }, // opened case
  { t: T.pc + 0.4, p: [0.0, 2.95, 3.25], g: [0, 0, 1.25] }, // tilt down to the empty footprint
  { t: SEC.PAYOFF[1] + 0.2, p: [0.05, 2.85, 3.1], g: [0, 0, 1.2] },
  { t: T.kamu + 1.6, p: [0.0, 3.5, 3.1], g: [0, 0.45, -2.0] }, // rise back to the hero + AUDIRA silkscreen
  { t: OUTRO_AT, p: [0.05, 3.35, 2.75], g: [0, 0.45, -2.05] },
  { t: TOTAL + 1, p: [0.05, 3.3, 2.65], g: [0, 0.45, -2.05] },
];
const ease = (u: number) => {
  const sm = u * u * (3 - 2 * u);
  return 0.6 * sm + 0.4 * u; // keep some speed through each key: no parked camera
};
export const camAt = (t: number): { p: V3; g: V3 } => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = ease(Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))));
  const L = (x: V3, y: V3): V3 => [x[0] + (y[0] - x[0]) * u, x[1] + (y[1] - x[1]) * u, x[2] + (y[2] - x[2]) * u];
  return { p: L(a.p, b.p), g: L(a.g, b.g) };
};
const FOV = 40;

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camAt(t);
    camera.layers.enable(FX_LAYER);
    camera.position.set(...c.p);
    camera.lookAt(...c.g);
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// screen projection for HTML labels that follow 3D objects
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80);
const project = (t: number, p: V3, w: number, h: number) => {
  const c = camAt(t);
  projCam.aspect = w / h;
  projCam.position.set(...c.p);
  projCam.lookAt(...c.g);
  projCam.updateProjectionMatrix();
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
};

// ------------------------------------------------------------------ 3D scene
const FILM_PASSIVES = PASSIVES.filter((q) => !(Math.abs(q.p[0]) < 2.3 && q.p[2] > -1.25));

const Scene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const c = camAt(t);
  const focus = Math.hypot(c.p[0] - c.g[0], c.p[1] - c.g[1], c.p[2] - c.g[2]);
  // HOOK: hero fills 10 -> 13 layers; full afterwards
  const filled = 10 + 3 * seg(t, 0.4, SEC.HOOK[1] - 0.6);
  // KONTEKS calendar
  const calRise = (i: number) => seg(t, SEC.KONTEKS[0] - 0.5 + i * 0.07, SEC.KONTEKS[0] + 0.2 + i * 0.07) * (1 - seg(t, T.kenapa - 0.1 + (9 - i) * 0.03, T.kenapa + 0.45 + (9 - i) * 0.03));
  const calLit = (i: number) => (i === 0 ? seg(t, T.d10 - 0.2, T.d10) : seg(t, T.preload + ((i - 1) / 8) * (T.awal + 0.3 - T.preload), T.preload + ((i - 1) / 8) * (T.awal + 0.3 - T.preload) + 0.15));
  const unduh = seg(t, T.file - 0.1, T.file + 0.35);
  const lock = seg(t, T.tapi - 0.05, T.tapi + 0.35);
  // PENGEMBANGAN column + funnel
  const colRise = seg(t, T.kenapa + 0.3, T.kenapa + 1.1) * (1 - seg(t, T.kalau - 0.25, T.kalau + 0.35));
  const colFill = COL_FILL * seg(t, T.g212 - 0.1, T.separuh + 0.1);
  const half = seg(t, T.separuh - 0.1, T.separuh + 0.4);
  const funnelOn = seg(t, T.kalau, T.kalau + 0.6) * (1 - seg(t, SEC.PENJELASAN[0] - 0.1, SEC.PENJELASAN[0] + 0.5));
  const jam = seg(t, T.jaringan - 0.6, T.jaringan + 0.3);
  const clear = seg(t, T.preload2 - 0.1, T.preload2 + 0.6);
  // PENJELASAN towers
  const towRise = seg(t, SEC.PENJELASAN[0] + 0.3, SEC.PENJELASAN[0] + 0.9) * (1 - seg(t, SEC.PAYOFF[0] - 0.1, SEC.PAYOFF[0] + 0.5));
  const grow = 1 + 5 * seg(t, T.antu, T.antu + 1.6) + 7 * seg(t, T.n771 - 0.3, T.n771 + 0.6) + 4 * seg(t, T.usd - 0.2, T.usd + 0.6) + 3 * seg(t, T.lebih - 0.2, T.lebih + 0.6);
  const split = seg(t, T.tujuh - 0.1, T.tujuh + 1.6);
  const caps = seg(t, T.tujuh + 1.0, T.tujuh + 1.6);
  // PAYOFF
  const tagRise = seg(t, SEC.PAYOFF[0] + 0.2, SEC.PAYOFF[0] + 0.9);
  const tagOut = seg(t, T.versi - 0.2, T.versi + 0.5);
  const caseRise = seg(t, T.versi - 0.1, T.versi + 0.6);
  const caseOpen = seg(t, T.versi + 0.9, T.kode);
  const caseOut = seg(t, T.pc - 0.6, T.pc);
  const foot = seg(t, T.pc - 0.4, T.pc + 0.2);
  // packets on the cover routes: full in hook/outro, dimmed while set pieces stand on the stage
  const routeK = 1 - 0.7 * seg(t, SEC.KONTEKS[0] - 0.3, SEC.KONTEKS[0] + 0.4) + 0.7 * seg(t, SEC.PAYOFF[1] - 0.3, SEC.PAYOFF[1] + 0.5);

  return (
    <>
      <CameraRig t={t} />
      <fog attach="fog" args={["#4a1a48", 9, 30]} />
      <ambientLight intensity={0.55} color="#5a6a80" />
      <hemisphereLight args={["#ff9a8a", "#0a1a14", 0.7]} />
      <directionalLight
        position={[4, 8, 8]}
        intensity={2.4}
        color="#fff4e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[2.5, 15, -15]} intensity={2.0} color="#ff8a5a" />
      <pointLight position={[-3.2, 1.6, -7]} color={PINK} intensity={9} distance={11} decay={2} />
      <pointLight position={[3.4, 1.6, -7]} color="#ff7a45" intensity={4} distance={9} decay={2} />
      <pointLight position={[0, 1.2, 0.8]} color={CYAN} intensity={1.6} distance={5} decay={2} />
      {/* soft key on the stage set pieces */}
      <spotLight position={[-1.8, 3.6, 4.2]} angle={0.6} penumbra={0.8} intensity={7} distance={10} decay={2} color="#fff1dc" />

      <Board />
      <BoardApron />
      <AudiraSilk />
      <FilmHero filled={filled} pulse={0.85 + 0.15 * Math.sin(t * 5)} />
      {BLOCKS.map((b) => (
        <Stack key={b.seed} pos={[b.x, 0, b.z]} w={b.w} d={b.d} layers={b.layers} filled={b.filled} glow={b.glow} seed={b.seed} />
      ))}
      {FILM_PASSIVES.map((p, i) => (
        <Passive key={i} {...p} />
      ))}
      <RoutePackets t={t} k={routeK} />
      <Calendar t={t} rise={calRise} lit={calLit} unduh={unduh * (1 - seg(t, T.kenapa - 0.1, T.kenapa + 0.3))} lock={lock * (1 - seg(t, T.kenapa + 0.2, T.kenapa + 0.6))} />
      <Column rise={colRise} fill={colFill} half={half} />
      <Funnel t={t} on={funnelOn} jam={jam} clear={clear} />
      <Towers rise={towRise} grow={grow} split={split} caps={caps} />
      <PriceTag t={t} rise={tagRise} out={tagOut} />
      <GameCase rise={caseRise} open={caseOpen} out={caseOut} />
      <Footprint on={foot} t={t} />
      <Sky />
      <Finish
        frame={frame}
        background={BG}
        profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
        exposure={1}
        envIntensity={0.55}
        ao
        focus={focus}
        aperture={0.001}
        maxBlur={0.005}
      />
    </>
  );
};

// ------------------------------------------------------------------ HUD
const INK = "#F6F1E7";
const Pill: React.FC<{ s: number; color: string; children: React.ReactNode; solid?: boolean; size?: number }> = ({ s, color, children, solid, size = 30 }) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: size * s,
      letterSpacing: 2 * s,
      padding: `${8 * s}px ${16 * s}px`,
      borderRadius: 8 * s,
      border: `${2 * s}px solid ${color}`,
      background: solid ? color : "rgba(10,6,22,0.72)",
      color: solid ? "#0a0616" : color,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const Lock: React.FC<{ s: number; color: string }> = ({ s, color }) => (
  <svg width={26 * s} height={30 * s} viewBox="0 0 26 30" style={{ verticalAlign: "middle", marginRight: 8 * s }}>
    <path d="M6 13 V9 a7 7 0 0 1 14 0 V13" fill="none" stroke={color} strokeWidth="3.5" />
    <rect x="2" y="13" width="22" height="16" rx="3" fill={color} />
  </svg>
);

const fmt = (v: number, d: number) => v.toFixed(d).replace(".", ",");

const Hud: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const s = w / 1080;
  const L = 72 * s;
  const fade = (a: number, b: number, fi = 0.3, fo = 0.3) => win(t, a, b, fi, fo);
  const kickers: [number, number, string][] = [
    [0, SEC.HOOK[1], "● PRE-LOAD DIBUKA · 10 NOV 2026"],
    [SEC.KONTEKS[0], SEC.KONTEKS[1], "● JADWAL RILIS"],
    [SEC.PENGEMBANGAN[0], SEC.PENGEMBANGAN[1], "● KENAPA PRE-LOAD?"],
    [SEC.PENJELASAN[0], SEC.PENJELASAN[1], "● PRE-ORDER · ESTIMASI"],
    [SEC.PAYOFF[0], SEC.PAYOFF[1], "● HARGA & EDISI"],
    [SEC.OUTRO[0], OUTRO_AT, "● AUDIRA · BERITA GAME"],
  ];
  // HOOK headline (frame 0 = thumbnail, same layout as the approved cover)
  const shrink = seg(t, T.itu + 1.1, T.itu + 1.7);
  const hookOut = 1 - seg(t, SEC.HOOK[1] - 0.3, SEC.HOOK[1] + 0.1);
  const lab = (p: V3) => project(t, p, w, h);
  const d10 = lab([dayPos(0)[0], CHIP_H + 0.45, dayPos(0)[2]]);
  const d19 = lab([dayPos(9)[0], CHIP_H + 0.42, dayPos(9)[2]]);
  const colTop = lab([STAGE[0], colLayerY(COL_FILL) + 0.12, STAGE[2] + 0.45]);
  const colHalf = lab([STAGE[0], colLayerY(10), STAGE[2] + 0.5]);
  const psTop = lab([TOWER_L[0], towerTopY(15) + 0.5, TOWER_L[2]]);
  void psTop;
  void TOWER_R;
  const silk = lab([AUDIRA_SILK_POS[0], 0, AUDIRA_SILK_POS[2]]);
  void silk;

  const counter = (a: number, to: number) => to * seg(t, a, a + 0.7);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* top scrim for HUD legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(10,6,22,${0.9 * hookOut + 0.78 * (1 - hookOut)}) 0%, rgba(10,6,22,${0.7 * hookOut + 0.55 * (1 - hookOut)}) 26%, rgba(10,6,22,0) 40%, rgba(10,6,22,0) 72%, rgba(10,6,22,0.55) 100%)`,
        }}
      />
      {kickers.map(([a, b, txt]) => {
        const o = a === 0 ? 1 - seg(t, b - 0.25, b) : fade(a, b, 0.25, 0.25);
        return o > 0.01 ? (
          <div key={txt} style={{ position: "absolute", left: L, top: 262 * s, opacity: o, fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, letterSpacing: 4 * s, color: AMBER }}>
            {txt}
          </div>
        ) : null;
      })}

      {/* HOOK */}
      {hookOut > 0.01 && (
        <div style={{ position: "absolute", left: 66 * s, top: 306 * s, opacity: hookOut, transformOrigin: "0 0", transform: `scale(${1 - 0.42 * shrink})`, fontFamily: BEBAS, color: INK, lineHeight: 0.86, textShadow: "0 8px 30px rgba(0,0,0,0.65)" }}>
          <div style={{ fontSize: 290 * s, letterSpacing: 2 * s }}>
            212 <span style={{ color: AMBER }}>GB</span>
          </div>
          <div style={{ fontSize: 132 * s, letterSpacing: 3 * s, marginTop: 6 * s }}>UNTUK SATU GAME</div>
        </div>
      )}
      {hookOut > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 640 * s - 230 * s * shrink, opacity: hookOut * seg(t, T.d10 - 0.15, T.d10 + 0.2) }}>
          <Pill s={s} color={CYAN} solid>
            PRE-LOAD SEJAK 10 NOV
          </Pill>
        </div>
      )}

      {/* KONTEKS */}
      {fade(T.gta - 0.1, SEC.KONTEKS[1]) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.gta - 0.1, SEC.KONTEKS[1]), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 170 * s, lineHeight: 0.9 }}>GTA 6</div>
          <div style={{ fontSize: 76 * s, lineHeight: 1, opacity: seg(t, T.d19 - 0.15, T.d19 + 0.2), color: PINK }}>RILIS: KAMIS, 19 NOV 2026</div>
          <div style={{ display: "flex", gap: 16 * s, marginTop: 18 * s }}>
            <span style={{ opacity: seg(t, T.ps5 - 0.1, T.ps5 + 0.2) }}>
              <Pill s={s} color={INK}>PS5</Pill>
            </span>
            <span style={{ opacity: seg(t, T.xbox - 0.1, T.xbox + 0.2) }}>
              <Pill s={s} color={INK}>Xbox Series X|S</Pill>
            </span>
          </div>
          <div style={{ marginTop: 16 * s, opacity: seg(t, T.preload - 0.1, T.preload + 0.25) }}>
            <Pill s={s} color={AMBER}>PRE-LOAD · 9 HARI LEBIH AWAL</Pill>
          </div>
        </div>
      )}
      {fade(T.file - 0.1, T.kenapa + 0.2) > 0.01 && (
        <div style={{ position: "absolute", left: d10.x, top: d10.y, transform: "translate(-50%, -100%)", opacity: fade(T.file - 0.1, T.kenapa + 0.2) }}>
          <Pill s={s} color={CYAN} solid size={28}>UNDUH: BISA</Pill>
        </div>
      )}
      {fade(T.tapi, T.kenapa + 0.2) > 0.01 && (
        <div style={{ position: "absolute", left: d19.x, top: d19.y, transform: "translate(-60%, -100%)", opacity: fade(T.tapi, T.kenapa + 0.2) }}>
          <Pill s={s} color={PINK} solid size={28}>
            <Lock s={s} color="#0a0616" />
            MAIN: 19 NOV
          </Pill>
        </div>
      )}

      {/* PENGEMBANGAN */}
      {fade(T.kenapa - 0.1, T.kalau) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.kenapa - 0.1, T.kalau), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 96 * s, lineHeight: 0.95 }}>KENAPA DIUNDUH DULUAN?</div>
          <div style={{ marginTop: 18 * s, opacity: seg(t, T.seriesS - 0.15, T.seriesS + 0.2) }}>
            <Pill s={s} color={INK}>Xbox Series S · ruang yang bisa dipakai</Pill>
          </div>
        </div>
      )}
      {fade(T.g212, T.kalau) > 0.01 && (
        <div style={{ position: "absolute", left: colTop.x, top: colTop.y, transform: "translate(-50%, -100%)", opacity: fade(T.g212, T.kalau), fontFamily: BEBAS, fontSize: 92 * s, color: AMBER, textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>
          212 GB
        </div>
      )}
      {fade(T.separuh - 0.1, T.kalau) > 0.01 && (
        <div style={{ position: "absolute", left: colHalf.x, top: colHalf.y, transform: "translate(-50%, -50%)", opacity: fade(T.separuh - 0.1, T.kalau) }}>
          <Pill s={s} color={PINK} solid size={30}>&gt; SEPARUH</Pill>
        </div>
      )}
      {fade(T.jutaan - 0.2, SEC.PENGEMBANGAN[1] + 0.2) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.jutaan - 0.2, SEC.PENGEMBANGAN[1] + 0.2), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 96 * s, lineHeight: 0.95 }}>KALAU JUTAAN UNDUH</div>
          <div style={{ fontSize: 96 * s, lineHeight: 0.95 }}>DI HARI YANG SAMA</div>
          <div style={{ marginTop: 18 * s, position: "relative", height: 56 * s }}>
            <span style={{ position: "absolute", left: 0, opacity: win(t, T.jaringan - 0.2, T.preload2 + 0.1, 0.25, 0.2) }}>
              <Pill s={s} color="#ff3b30" solid>JARINGAN BISA TERSENDAT</Pill>
            </span>
            <span style={{ position: "absolute", left: 0, opacity: seg(t, T.preload2, T.preload2 + 0.3) }}>
              <Pill s={s} color={CYAN} solid>PRE-LOAD = BEBAN DIBAGI</Pill>
            </span>
          </div>
        </div>
      )}
      {fade(T.jutaan - 0.2, SEC.PENGEMBANGAN[1] + 0.2) > 0.01 && (
        <div style={{ position: "absolute", right: 60 * s, top: 262 * s, opacity: fade(T.jutaan - 0.2, SEC.PENGEMBANGAN[1] + 0.2) }}>
          <Pill s={s} color="#cfd6df" size={24}>ILUSTRASI</Pill>
        </div>
      )}

      {/* PENJELASAN: money */}
      {fade(T.antu - 0.1, T.sensor) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.antu - 0.1, T.sensor, 0.3, 0.2), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 120 * s, lineHeight: 0.92 }}>ANTUSIASME</div>
          <div style={{ fontSize: 120 * s, lineHeight: 0.92, color: AMBER }}>DALAM UANG</div>
        </div>
      )}
      {fade(T.sensor - 0.1, T.tujuh + 0.1) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.sensor - 0.1, T.tujuh + 0.1), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <Pill s={s} color={INK} size={26}>Sensor Tower · firma riset</Pill>
          <div style={{ opacity: seg(t, T.n771 - 0.15, T.n771 + 0.1), marginTop: 14 * s, display: "flex", alignItems: "baseline", gap: 18 * s }}>
            <span style={{ fontSize: 120 * s, lineHeight: 0.95, color: AMBER }}>{fmt(counter(T.n771, 7.71), 2)} JUTA</span>
            <span style={{ fontFamily: MONO, fontSize: 30 * s, fontWeight: 700 }}>pre-order digital</span>
          </div>
          <div style={{ opacity: seg(t, T.usd - 0.15, T.usd + 0.1), fontSize: 84 * s, lineHeight: 1 }}>≈ US${Math.round(counter(T.usd, 751))} JUTA</div>
          <div style={{ opacity: seg(t, T.lebih - 0.15, T.lebih + 0.1), fontSize: 84 * s, lineHeight: 1, color: CYAN }}>&gt; Rp{Math.round(counter(T.lebih, 13))} TRILIUN</div>
        </div>
      )}
      {fade(T.tujuh, SEC.PENJELASAN[1]) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.tujuh, T.ingat - 0.05, 0.3, 0.15), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 150 * s, lineHeight: 0.95 }}>
            <span style={{ color: CYAN }}>74%</span> DI PLAYSTATION
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30 * s }}>sisanya 26% di Xbox</div>
        </div>
      )}
      {fade(T.ingat - 0.05, T.take + 0.2, 0.15, 0.3) > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: 540 * s,
            top: 430 * s,
            transform: `translate(-50%, -50%) rotate(-7deg) scale(${1 + 0.35 * (1 - seg(t, T.ingat - 0.05, T.ingat + 0.15))})`,
            opacity: fade(T.ingat - 0.05, T.take + 0.2, 0.15, 0.3),
            border: `${7 * s}px solid #ff3b30`,
            borderRadius: 14 * s,
            padding: `${10 * s}px ${30 * s}px`,
            color: "#ff3b30",
            fontFamily: BEBAS,
            textAlign: "center",
            background: "rgba(10,6,22,0.55)",
          }}
        >
          <div style={{ fontSize: 130 * s, lineHeight: 0.95, letterSpacing: 6 * s }}>ESTIMASI</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * s }}>Sensor Tower · bukan penjualan resmi</div>
        </div>
      )}
      {fade(T.take - 0.1, SEC.PENJELASAN[1] + 0.1) > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: L,
            top: 312 * s,
            width: 936 * s,
            opacity: fade(T.take - 0.1, SEC.PENJELASAN[1] + 0.1),
            transform: `translateY(${(1 - seg(t, T.take - 0.1, T.take + 0.3)) * 30 * s}px)`,
            background: "rgba(14,58,38,0.92)",
            border: `${2 * s}px solid rgba(240,244,240,0.85)`,
            borderRadius: 12 * s,
            padding: `${22 * s}px ${30 * s}px`,
            fontFamily: MONO,
            color: INK,
          }}
        >
          <div style={{ fontFamily: BEBAS, fontSize: 110 * s, lineHeight: 0.95 }}>TAKE-TWO</div>
          <div style={{ fontSize: 30 * s, fontWeight: 700, color: AMBER, letterSpacing: 2 * s }}>induk Rockstar</div>
          <div style={{ marginTop: 14 * s, fontSize: 34 * s, fontWeight: 500, opacity: seg(t, T.pesanan - 0.1, T.pesanan + 0.3) }}>
            pesanan awal: jauh di atas perkiraan internal
          </div>
        </div>
      )}

      {/* PAYOFF */}
      {fade(SEC.PAYOFF[0], T.versi) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(SEC.PAYOFF[0], T.versi), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 100 * s, lineHeight: 0.95 }}>HARGA DI INDONESIA</div>
          <div style={{ marginTop: 14 * s, opacity: seg(t, T.store - 0.1, T.store + 0.2) }}>
            <Pill s={s} color={INK}>PlayStation Store Indonesia · edisi standar</Pill>
          </div>
        </div>
      )}
      {fade(T.versi - 0.1, T.pc - 0.2) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.versi - 0.1, T.pc - 0.2), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 100 * s, lineHeight: 0.95 }}>VERSI FISIK</div>
          <div style={{ fontSize: 100 * s, lineHeight: 0.95, color: PINK }}>TANPA CAKRAM</div>
          <div style={{ marginTop: 14 * s, opacity: seg(t, T.kode - 0.2, T.kode + 0.1) }}>
            <Pill s={s} color={CYAN}>isinya: kode unduhan</Pill>
          </div>
        </div>
      )}
      {fade(T.pc - 0.2, SEC.PAYOFF[1] + 0.2) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.pc - 0.2, SEC.PAYOFF[1] + 0.2), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 120 * s, lineHeight: 0.95 }}>VERSI PC?</div>
          <div style={{ fontSize: 100 * s, lineHeight: 0.95, color: PINK }}>BELUM DIUMUMKAN</div>
        </div>
      )}

      {/* OUTRO question */}
      {fade(T.kamu - 0.1, OUTRO_AT) > 0.01 && (
        <div style={{ position: "absolute", left: L, top: 312 * s, opacity: fade(T.kamu - 0.1, OUTRO_AT), fontFamily: BEBAS, color: INK, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 120 * s, lineHeight: 0.92 }}>
            RUANG <span style={{ color: AMBER }}>212 GB</span>
          </div>
          <div style={{ fontSize: 120 * s, lineHeight: 0.92 }}>SUDAH SIAP?</div>
          <div style={{ marginTop: 18 * s, opacity: seg(t, T.tulis - 0.1, T.tulis + 0.25) }}>
            <Pill s={s} color={CYAN} solid>TULIS KONSOLMU DI KOMENTAR</Pill>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ captions (karaoke, from timeline.json)
// Never break after a number or inside a fixed name, so "7,71 juta" / "Xbox Series S" stay together.
const STICKY = /\d|^(tiga|belas|Tujuh|puluh|empat|Xbox|Series|Sensor|PlayStation|sembilan|lebih|di|Take-Two,|induk|versi)$/;
const sticky = (w: string) => STICKY.test(w);
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    const ws = c.words;
    const parts: Word[][] = [];
    let cur: Word[] = [];
    ws.forEach((x, i) => {
      cur.push(x);
      const end = /[.,?:!]$/.test(x.w);
      const left = ws.length - 1 - i;
      const canBreak = !sticky(x.w) && left >= 2;
      if (i === ws.length - 1 || (canBreak && (cur.length >= 6 || (end && cur.length >= 3)))) {
        parts.push(cur);
        cur = [];
      }
    });
    if (cur.length) parts.push(cur);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number; w: number }> = ({ t, w }) => {
  const s = w / 1080;
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  if (n > 4) {
    let best = 1e9;
    const chars = ch.words.reduce((m, x) => m + x.w.length + 1, 0);
    for (let i = 2; i <= n - 2; i++) {
      if (sticky(ch.words[i - 1].w)) continue;
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const d = Math.abs(a - (chars - a));
      if (d < best) {
        best = d;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290 * s, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(6,23,15,0.88)",
          border: `${2 * s}px solid rgba(0,240,255,0.55)`,
          borderRadius: 10 * s,
          padding: `${14 * s}px ${26 * s}px`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 12 * s}px)`,
          maxWidth: 980 * s,
          boxShadow: `0 0 ${24 * s}px rgba(0,240,255,0.18)`,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22 * s, whiteSpace: "nowrap", lineHeight: 1.25 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const nxt = ch.words[idx + 1]?.s ?? ch.b;
              const active = t >= wd.s && t < nxt;
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 50 * s,
                    color: active ? AMBER : done ? "#F4F7FA" : "rgba(244,247,250,0.5)",
                    transform: `scale(${bump})`,
                    textShadow: active ? `0 0 ${14 * s}px rgba(255,183,3,0.55)` : "none",
                  }}
                >
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f60 = Math.round(t * 60);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: COVER.p, fov: FOV, near: 0.1, far: 80 }}>
        <Scene t={t} frame={f60} />
      </ThreeCanvas>
      <Hud t={t} w={width} h={height} />
      <Captions t={t} w={width} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
