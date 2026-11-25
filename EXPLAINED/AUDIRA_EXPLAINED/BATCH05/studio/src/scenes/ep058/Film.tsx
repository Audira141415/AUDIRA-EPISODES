// AE-058 film: "Bagaimana Gedung Lama Dirobohkan dengan Aman di Tengah Kota?" (BRUTALFORGE, 65 s).
// Every cut and beat comes from timeline.json via timing.ts. No audio here (lead muxes VO/music/SFX).
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { PCFShadowMap } from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { DISPLAY, loadDisplay } from "./Cover.tsx";
import { PAL, type V3 } from "./parts.tsx";
import { CUT_COLS, ENV_TARGETS, FilmWorld, utilMid } from "./FilmWorld.tsx";
import { A_FLOORS, B, FLASH_T, FLOOR, TIMELINE, backOut, clamp01, floorsA, floorsB, project, ramp, shotAt, smooth, win } from "./timing.ts";

const FONT = `${DISPLAY}, "Arial Black", sans-serif`;

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const pose = shotAt(t);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.fov = pose.fov;
    c.near = 1;
    c.far = 600;
    c.up.set(0, 1, 0);
    c.lookAt(...pose.target);
    c.updateProjectionMatrix();
  });
  return null;
};

// ---------- HUD primitives (1080-space, scaled by k) ----------
const Chip: React.FC<{ x: number; y: number; k: number; o: number; bg: string; color?: string; size?: number; rot?: number; anchor?: "l" | "r" | "c"; children: React.ReactNode }> = ({
  x, y, k, o, bg, color = PAL.ink, size = 54, rot = 0, anchor = "l", children,
}) => {
  if (o <= 0.01) return null;
  const pop = backOut(clamp01(o));
  const tx = anchor === "l" ? "0" : anchor === "r" ? "-100%" : "-50%";
  return (
    <div
      style={{
        position: "absolute",
        left: x * k,
        top: y * k,
        opacity: clamp01(o * 1.6),
        transform: `translateX(${tx}) rotate(${rot}deg) scale(${0.6 + 0.4 * pop})`,
        transformOrigin: anchor === "r" ? "100% 50%" : anchor === "c" ? "50% 50%" : "0 50%",
        background: bg,
        border: `${6 * k}px solid ${PAL.ink}`,
        boxShadow: `${9 * k}px ${9 * k}px 0 ${PAL.ink}`,
        padding: `${4 * k}px ${20 * k}px`,
        fontFamily: FONT,
        fontSize: size * k,
        lineHeight: 1.08,
        color,
        letterSpacing: 1 * k,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const Leader: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; o: number; k: number; color?: string }> = ({ a, b, o, k, color = PAL.ink }) => {
  const { width, height } = useVideoConfig();
  if (o <= 0.01) return null;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: o }}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={6 * k} strokeLinecap="round" />
      <circle cx={a.x} cy={a.y} r={11 * k} fill={PAL.white} stroke={color} strokeWidth={5 * k} />
    </svg>
  );
};

/** Hard-edged down arrow (neo-brutal). */
const Arrow: React.FC<{ x: number; y: number; len: number; k: number; o: number; color: string }> = ({ x, y, len, k, o, color }) =>
  o <= 0.01 ? null : (
    <svg style={{ position: "absolute", left: (x - 60) * k, top: y * k, opacity: o, overflow: "visible" }} width={120 * k} height={(len + 80) * k}>
      <g transform={`translate(${12 * k},${12 * k})`}>
        <path d={`M ${38 * k} 0 H ${82 * k} V ${len * k} H ${116 * k} L ${60 * k} ${(len + 64) * k} L ${4 * k} ${len * k} H ${38 * k} Z`} fill={PAL.ink} />
      </g>
      <path d={`M ${38 * k} 0 H ${82 * k} V ${len * k} H ${116 * k} L ${60 * k} ${(len + 64) * k} L ${4 * k} ${len * k} H ${38 * k} Z`} fill={color} stroke={PAL.ink} strokeWidth={6 * k} strokeLinejoin="round" />
    </svg>
  );

/** Vibration graph panel: live trace under a dashed 15 mm/s limit. */
const VibeGraph: React.FC<{ t: number; k: number; o: number }> = ({ t, k, o }) => {
  if (o <= 0.01) return null;
  const W = 520, H = 300;
  const pts: string[] = [];
  const t0 = B.getaran;
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const tt = t - (N - i) * 0.03;
    const on = tt > t0 - 0.4 ? 1 : 0.4;
    const v = on * (4.5 + 2.2 * Math.sin(tt * 23.1) + 1.8 * Math.sin(tt * 51.7 + 1.3) + 1.2 * Math.sin(tt * 9.3));
    const x = (i / N) * (W - 70) + 60;
    const y = H - 40 - (v / 20) * (H - 80);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const lim = H - 40 - (15 / 20) * (H - 80);
  return (
    <div style={{ position: "absolute", left: 500 * k, top: 640 * k, width: W * k, height: (H + 70) * k, opacity: o, transform: `scale(${0.8 + 0.2 * backOut(clamp01(o))})`, transformOrigin: "0 0" }}>
      <div style={{ position: "absolute", inset: 0, background: PAL.white, border: `${6 * k}px solid ${PAL.ink}`, boxShadow: `${10 * k}px ${10 * k}px 0 ${PAL.ink}` }} />
      <div style={{ position: "absolute", left: 18 * k, top: 8 * k, fontFamily: FONT, fontSize: 40 * k, color: PAL.ink }}>GETARAN TETANGGA</div>
      <svg width={W * k} height={H * k} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 60 * k }}>
        <line x1={60} y1={lim} x2={W - 10} y2={lim} stroke={PAL.pink} strokeWidth={5} strokeDasharray="14 10" />
        <text x={W - 14} y={lim - 10} textAnchor="end" fontFamily={FONT} fontSize={30} fill={PAL.pink}>
          BATAS 15 mm/s
        </text>
        <line x1={60} y1={20} x2={60} y2={H - 40} stroke={PAL.ink} strokeWidth={4} />
        <line x1={60} y1={H - 40} x2={W - 10} y2={H - 40} stroke={PAL.ink} strokeWidth={4} />
        <polyline points={pts.join(" ")} fill="none" stroke={PAL.ink} strokeWidth={9} strokeLinejoin="round" />
        <polyline points={pts.join(" ")} fill="none" stroke={PAL.green} strokeWidth={4.5} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", right: 14 * k, bottom: 12 * k, background: PAL.green, border: `${4 * k}px solid ${PAL.ink}`, padding: `${0 * k}px ${12 * k}px`, fontFamily: FONT, fontSize: 34 * k, color: PAL.ink }}>
        AMAN
      </div>
    </div>
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  const shot = shotAt(t).name;
  const P = (p: V3) => project(t, p, W, H);
  const els: React.ReactNode[] = [];
  const w = (a: number, b: number, d = 0.25) => win(t, a, b, d);
  // kicker (hook + outro), starts at y >= 262 (signature sits near y 221)
  const kick = shot === "hook" ? 1 - smooth(ramp(t, 2.4, 2.8)) : shot === "outro" ? win(t, B.ini - 0.3, B.outroCard, 0.25) : 0;
  els.push(
    <Chip key="kick" x={64} y={266} k={k} o={kick} bg={PAL.white} size={40}>
      AUDIRA EXPLAINED · AE-058
    </Chip>,
  );
  if (shot === "hook") {
    const o = w(0.35, B.l02);
    const x = smooth(ramp(t, B.jarang - 0.05, B.jarang + 0.2));
    els.push(
      <div key="boom" style={{ position: "absolute", left: 470 * k, top: 380 * k, opacity: clamp01(o * 1.5), transform: `rotate(-8deg) scale(${0.5 + 0.5 * backOut(clamp01(o))})` }}>
        <svg width={560 * k} height={330 * k} viewBox="0 0 560 330" style={{ overflow: "visible" }}>
          <polygon
            points="280,10 330,80 420,30 410,110 540,100 450,170 545,240 420,230 440,320 330,255 280,325 230,255 120,320 140,230 15,240 110,170 20,100 150,110 140,30 230,80"
            fill={PAL.yellow}
            stroke={PAL.ink}
            strokeWidth={12}
            strokeLinejoin="round"
          />
          <text x={280} y={192} textAnchor="middle" fontFamily={FONT} fontSize={86} fill={PAL.ink}>
            LEDAKAN?
          </text>
          {x > 0 ? (
            <g opacity={x}>
              <line x1={90} y1={70} x2={90 + 380 * x} y2={70 + 200 * x} stroke={PAL.pink} strokeWidth={34} strokeLinecap="round" />
              <line x1={470} y1={70} x2={470 - 380 * x} y2={70 + 200 * x} stroke={PAL.pink} strokeWidth={34} strokeLinecap="round" />
            </g>
          ) : null}
        </svg>
      </div>,
    );
    els.push(
      <Chip key="jarang" x={120} y={760} k={k} o={w(B.jarang + 0.1, B.l02)} bg={PAL.pink} color={PAL.white} size={64} rot={-4}>
        JARANG!
      </Chip>,
    );
  }
  if (shot === "hookTop") {
    const top = P([0, A_FLOORS * FLOOR + 2, 4]);
    els.push(<Arrow key="arr" x={top.x + 330 * k > W ? 860 : 860} y={300} len={420 * smooth(ramp(t, B.dari - 0.2, B.atas + 0.2))} k={k} o={w(B.dari - 0.25, B.konteks)} color={PAL.pink} />);
    els.push(
      <Chip key="pel" x={64} y={300} k={k} o={w(B.dibongkar - 0.1, B.konteks)} bg={PAL.white} size={60} rot={-3}>
        PELAN-PELAN
      </Chip>,
    );
    els.push(
      <Chip key="dari" x={64} y={410} k={k} o={w(B.dari - 0.1, B.konteks)} bg={PAL.pink} color={PAL.white} size={76} rot={2}>
        DARI ATAS
      </Chip>,
    );
  }
  if (shot === "docs") {
    els.push(
      <Chip key="ind" x={64} y={280} k={k} o={w(B.konteks + 0.1, B.mekanisme)} bg={PAL.white} size={46}>
        DI INDONESIA
      </Chip>,
    );
    els.push(
      <Chip key="pemda" x={1016} y={360} k={k} o={w(B.persetujuan + 0.1, B.mekanisme)} bg={PAL.pink} color={PAL.white} size={52} anchor="r" rot={3}>
        PERSETUJUAN PEMDA
      </Chip>,
    );
    els.push(
      <Chip key="warga" x={1016} y={1240} k={k} o={w(B.warga, B.mekanisme)} bg={PAL.cyan} size={52} anchor="r" rot={-2}>
        WARGA DIBERI TAHU
      </Chip>,
    );
    void ENV_TARGETS;
  }
  if (shot === "scan") {
    els.push(
      <Chip key="peta" x={64} y={290} k={k} o={w(B.memetakan - 0.1, B.listrik)} bg={PAL.cyan} size={56}>
        PETA STRUKTUR
      </Chip>,
    );
    const a = P([1.4, 6 * FLOOR - 0.3, 2.6]);
    const o = w(B.berbahaya - 0.05, B.listrik);
    els.push(<Leader key="la" a={a} b={{ x: 300 * k, y: 1180 * k }} o={o} k={k} />);
    els.push(
      <Chip key="asb" x={64} y={1150} k={k} o={o} bg={PAL.pink} color={PAL.white} size={64} rot={-3}>
        ⚠ ASBES
      </Chip>,
    );
  }
  if (shot === "utility") {
    const labels = ["LISTRIK", "AIR", "GAS"];
    const times = [B.listrik, B.air, B.gas];
    const cols = [PAL.yellow, PAL.cyan, PAL.orange];
    labels.forEach((l, i) => {
      const m = P(utilMid(i));
      const o = w(times[i] + 0.05, B.isi);
      const y = 300 + i * 120;
      els.push(<Leader key={`ul${i}`} a={m} b={{ x: 360 * k, y: (y + 40) * k }} o={o} k={k} />);
      els.push(
        <Chip key={`u${i}`} x={64} y={y} k={k} o={o} bg={cols[i]} size={56} rot={i % 2 ? 2 : -2}>
          {l} ✕
        </Chip>,
      );
    });
    els.push(
      <Chip key="put" x={1016} y={1240} k={k} o={w(B.diputus, B.isi)} bg={PAL.pink} color={PAL.white} size={58} anchor="r">
        DIPUTUS
      </Chip>,
    );
  }
  if (shot === "empty") {
    els.push(
      <Chip key="isi" x={64} y={290} k={k} o={w(B.isi + 0.05, B.lalu)} bg={PAL.white} size={56}>
        ISI GEDUNG KELUAR
      </Chip>,
    );
  }
  if (shot === "wrap") {
    els.push(
      <Chip key="jar" x={64} y={290} k={k} o={w(B.jaring - 0.05, B.alat)} bg={PAL.green} size={56} rot={-2}>
        JARING
      </Chip>,
    );
    els.push(
      <Chip key="ter" x={64} y={400} k={k} o={w(B.terpal - 0.05, B.alat)} bg={PAL.white} size={56} rot={2}>
        + TERPAL
      </Chip>,
    );
  }
  if (shot === "lift") {
    els.push(
      <Chip key="alat" x={64} y={290} k={k} o={w(B.alat + 0.05, B.meremukkan)} bg={PAL.pink} color={PAL.white} size={56}>
        ALAT BERAT KECIL
      </Chip>,
    );
    els.push(
      <Chip key="ke" x={64} y={400} k={k} o={w(B.teratas - 0.1, B.meremukkan)} bg={PAL.white} size={52} rot={-2}>
        → LANTAI TERATAS
      </Chip>,
    );
  }
  if (shot === "crush") {
    const n = Math.ceil(floorsA(t) - 0.02);
    const bump = backOut(clamp01(((t - B.beton) % 100) / 0.3));
    void bump;
    els.push(
      <Chip key="lt" x={64} y={290} k={k} o={w(B.meremukkan, B.air2)} bg={PAL.white} size={60}>
        LANTAI {n}
      </Chip>,
    );
    els.push(
      <Chip key="ldl" x={1016} y={1240} k={k} o={w(B.demi - 0.6, B.air2)} bg={PAL.pink} color={PAL.white} size={56} anchor="r" rot={-2}>
        LANTAI DEMI LANTAI
      </Chip>,
    );
  }
  if (shot === "spray") {
    els.push(
      <Chip key="air" x={64} y={290} k={k} o={w(B.air2 + 0.05, B.dan7)} bg={PAL.cyan} size={56}>
        SEMPROT AIR
      </Chip>,
    );
    els.push(
      <Chip key="debu" x={64} y={400} k={k} o={w(B.debu, B.dan7)} bg={PAL.white} size={52} rot={-2}>
        DEBU TIDAK TERBANG
      </Chip>,
    );
  }
  if (shot === "vibe") {
    const s = P([-6.4, 7.6, 4.5]);
    const o = w(B.getaran - 0.1, B.reveal);
    els.push(<Leader key="sl" a={s} b={{ x: 500 * k, y: 760 * k }} o={o} k={k} />);
    els.push(<VibeGraph key="g" t={t} k={k} o={o} />);
    els.push(
      <Chip key="sen" x={64} y={290} k={k} o={w(B.dan7 + 0.1, B.reveal)} bg={PAL.green} size={54}>
        SENSOR DI GEDUNG TETANGGA
      </Chip>,
    );
  }
  if (shot === "japan") {
    els.push(
      <Chip key="jp" x={540} y={330} k={k} o={w(B.jepang - 0.05, B.lantai3)} bg={PAL.white} size={110} anchor="c" rot={-3}>
        JEPANG
      </Chip>,
    );
    els.push(
      <Chip key="cl" x={540} y={490} k={k} o={w(B.cara - 0.0, B.lantai3)} bg={PAL.pink} color={PAL.white} size={56} anchor="c" rot={2}>
        CARA LAIN
      </Chip>,
    );
  }
  if (shot === "hat") {
    const n = floorsB(t);
    const hp = P([4.5, n * FLOOR + 2.0, 4.5]);
    const o = w(B.topi - 0.05, B.dariLuar);
    els.push(<Leader key="hl" a={hp} b={{ x: 330 * k, y: 1190 * k }} o={o} k={k} />);
    els.push(
      <Chip key="topi" x={64} y={1150} k={k} o={o} bg={PAL.white} size={62} rot={-2}>
        TOPI TERTUTUP
      </Chip>,
    );
    els.push(
      <Chip key="m1" x={1016} y={300} k={k} o={w(B.diturunkan + 0.3, B.dariLuar)} bg={PAL.pink} color={PAL.white} size={64} anchor="r" rot={3}>
        −1 LANTAI
      </Chip>,
    );
  }
  if (shot === "shrink") {
    const n = floorsB(t);
    const o = w(B.dariLuar, B.payoff);
    els.push(
      <Chip key="lnt" x={64} y={290} k={k} o={o} bg={PAL.white} size={60}>
        {Math.round(n + 1)} LANTAI
      </Chip>,
    );
    els.push(
      <Chip key="sus" x={1016} y={1240} k={k} o={w(B.menyusut - 0.1, B.payoff)} bg={PAL.cyan} size={60} anchor="r" rot={-3}>
        MENYUSUT
      </Chip>,
    );
  }
  if (shot === "lot") {
    els.push(
      <Chip key="ruang" x={64} y={290} k={k} o={w(B.payoff + 0.1, B.muatan)} bg={PAL.white} size={54}>
        ADA RUANG KOSONG
      </Chip>,
    );
    els.push(
      <Chip key="imp" x={540} y={420} k={k} o={w(B.implosi - 0.05, B.muatan)} bg={PAL.pink} color={PAL.white} size={96} anchor="c" rot={-3}>
        IMPLOSI
      </Chip>,
    );
    const r = P([-30, 0.5, 30]);
    const o = w(B.payoff + 0.5, B.muatan);
    els.push(<Leader key="zl" a={r} b={{ x: 200 * k, y: 1230 * k }} o={o} k={k} />);
    els.push(
      <Chip key="zona" x={64} y={1210} k={k} o={o} bg={PAL.yellow} size={52}>
        ZONA AMAN
      </Chip>,
    );
  }
  if (shot === "columns") {
    els.push(
      <Chip key="kt" x={64} y={290} k={k} o={w(B.kolom - 0.1, B.berat2)} bg={PAL.pink} color={PAL.white} size={58}>
        KOLOM TERTENTU
      </Chip>,
    );
    els.push(
      <Chip key="jd" x={1016} y={1240} k={k} o={w(B.jeda - 0.05, B.berat2)} bg={PAL.white} size={52} anchor="r" rot={-2}>
        BERGILIRAN, SEPERSEKIAN DETIK
      </Chip>,
    );
    CUT_COLS.forEach(([x, z], i) => {
      const p = P([x, 2.6, z + 0.4]);
      const o = t >= FLASH_T[i] ? 1 : 0;
      if (o && !p.behind)
        els.push(
          <div key={`n${i}`} style={{ position: "absolute", left: p.x - 26 * k, top: p.y - 120 * k, width: 52 * k, height: 52 * k, borderRadius: 999, background: PAL.yellow, border: `${5 * k}px solid ${PAL.ink}`, fontFamily: FONT, fontSize: 36 * k, color: PAL.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${backOut(clamp01((t - FLASH_T[i]) / 0.2))})` }}>
            {i + 1}
          </div>,
        );
    });
  }
  if (shot === "collapse") {
    els.push(<Arrow key="g" x={900} y={330} len={360 * smooth(ramp(t, B.berat2, B.berat2 + 0.6))} k={k} o={w(B.berat2, B.outro)} color={PAL.yellow} />);
    els.push(
      <Chip key="bs" x={64} y={290} k={k} o={w(B.berat2 + 0.05, B.outro)} bg={PAL.yellow} size={60} rot={-2}>
        BERAT GEDUNG SENDIRI
      </Chip>,
    );
  }
  if (shot === "outro") {
    els.push(
      <Chip key="ken" x={64} y={400} k={k} o={w(B.kendali - 0.1, B.ini - 0.1)} bg={PAL.green} size={78} rot={-3}>
        KENDALI ✓
      </Chip>,
    );
    els.push(
      <Chip key="led" x={64} y={540} k={k} o={w(B.bukan - 0.05, B.ini - 0.1)} bg={PAL.white} size={64} rot={2}>
        <span style={{ textDecoration: "line-through", textDecorationThickness: 8 * k, textDecorationColor: PAL.pink }}>LEDAKAN</span>
      </Chip>,
    );
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{els}</AbsoluteFill>;
};

// ---------- section wipes: a hard-edged panel sweeps across, the cut hides under it ----------
const WIPES: { t: number; bg: string; label: string; color: string }[] = [
  { t: B.konteks, bg: PAL.cyan, label: "IZIN DULU", color: PAL.ink },
  { t: B.reveal, bg: PAL.white, label: "CARA LAIN", color: PAL.ink },
  { t: B.payoff, bg: PAL.pink, label: "IMPLOSI", color: PAL.white },
  { t: B.outro, bg: PAL.green, label: "KENDALI", color: PAL.ink },
];
const Wipes: React.FC<{ t: number }> = ({ t }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  const wp = WIPES.find((x) => Math.abs(t - x.t) < 0.36);
  if (!wp) return null;
  const u = clamp01((t - (wp.t - 0.36)) / 0.72);
  const e = u < 0.5 ? 0.5 * smooth(u * 2) : 0.5 + 0.5 * smooth((u - 0.5) * 2);
  const x = W * (1.15 - 2.6 * e);
  return (
    <div style={{ position: "absolute", left: x - W * 0.2, top: -H * 0.1, width: W * 1.4, height: H * 1.2, transform: "skewX(-12deg)", background: wp.bg, borderLeft: `${16 * k}px solid ${PAL.ink}`, borderRight: `${16 * k}px solid ${PAL.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: "skewX(12deg)", fontFamily: FONT, fontSize: 150 * k, color: wp.color, WebkitTextStroke: wp.color === PAL.white ? `${6 * k}px ${PAL.ink}` : undefined, paintOrder: "stroke fill", textShadow: `${10 * k}px ${10 * k}px 0 ${PAL.ink}` }}>{wp.label}</div>
    </div>
  );
};

// ---------- karaoke captions: phrases of 3-6 words, <=4 one line, else two balanced lines ----------
type W8 = { w: string; s: number; e: number };
type Chunk = { words: W8[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  TIMELINE.clips.forEach((c) => {
    const segs: W8[][] = [];
    let cur: W8[] = [];
    c.words.forEach((w) => {
      cur.push(w);
      if (/[,.]$/.test(w.w)) {
        segs.push(cur);
        cur = [];
      }
    });
    if (cur.length) segs.push(cur);
    // split long segments into balanced pieces of <= 5
    const pieces: W8[][] = [];
    segs.forEach((sg) => {
      const n = Math.ceil(sg.length / 5);
      const size = Math.ceil(sg.length / n);
      for (let i = 0; i < sg.length; i += size) pieces.push(sg.slice(i, i + size));
    });
    // merge short pieces (1-2 words) into a neighbour while total <= 6
    const merged: W8[][] = [];
    pieces.forEach((p) => {
      const prev = merged[merged.length - 1];
      if (prev && (p.length <= 2 || prev.length <= 2) && prev.length + p.length <= 6) prev.push(...p);
      else merged.push([...p]);
    });
    merged.forEach((words) => out.push({ words, a: words[0].s - 0.08, b: 0 }));
  });
  out.forEach((ch, i) => {
    const last = ch.words[ch.words.length - 1].e;
    const next = out[i + 1]?.a ?? Infinity;
    ch.b = Math.min(next, last + 0.6);
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  if (t >= B.outroCard) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const o = smooth(ramp(t, ch.a, ch.a + 0.1)) * (1 - smooth(ramp(t, ch.b - 0.1, ch.b)));
  const n = ch.words.length;
  const lines = n <= 4 ? [ch.words] : [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))];
  const longest = Math.max(...lines.map((l) => l.map((x) => x.w).join(" ").length));
  const size = Math.min(76, 1500 / Math.max(10, longest));
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, bottom: H - 1515 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k, opacity: o }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: 0.1 * size * k, whiteSpace: "nowrap" }}>
          {line.map((w, i) => {
            const active = t >= w.s - 0.03 && t < w.e + 0.05;
            const pop = active ? backOut(clamp01((t - w.s + 0.03) / 0.16)) : 1;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily: FONT,
                  fontSize: size * k,
                  lineHeight: 1.12,
                  padding: `0 ${0.06 * size * k}px`,
                  color: active ? PAL.white : PAL.white,
                  background: active ? PAL.pink : "transparent",
                  border: active ? `${4 * k}px solid ${PAL.ink}` : `${4 * k}px solid transparent`,
                  boxShadow: active ? `${7 * k}px ${7 * k}px 0 ${PAL.ink}` : "none",
                  WebkitTextStroke: `${active ? 0 : 7 * k}px ${PAL.ink}`,
                  paintOrder: "stroke fill",
                  textShadow: active ? "none" : `${6 * k}px ${6 * k}px 0 ${PAL.ink}`,
                  transform: `translateY(${active ? (1 - pop) * 14 * k - 6 * k : 0}px) rotate(${active ? -2 : 0}deg) scale(${active ? 1.06 : 1})`,
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const [handle] = useState(() => delayRender("ep058 film font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    loadDisplay().then(done, done);
  }, [handle]);
  const pose = shotAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.yellow }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            dpr={1}
            shadows={{ type: PCFShadowMap }}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: 40, near: 1, far: 600, position: [20, 20, 60] }}
          >
            <CameraRig t={t} />
            <FilmWorld t={t} f={f} shot={pose.name} site={pose.site} />
            <Finish frame={frame} background={PAL.yellow} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao />
          </ThreeCanvas>
          <HUD t={t} />
          <Captions t={t} />
          <Wipes t={t} />
        </>
      ) : null}
      <Outro start={B.outroCard} />
    </AbsoluteFill>
  );
};
