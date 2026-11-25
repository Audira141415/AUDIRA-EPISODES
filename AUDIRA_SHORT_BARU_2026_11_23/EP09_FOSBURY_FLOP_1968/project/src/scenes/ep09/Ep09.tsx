// EP09 — Fosbury Flop 1968 (AUDIRA Sport Facts). Style CHRONICLE, 2D (SVG/CSS), design space 1080 × 1920.
// Audio Master Clock: scene cuts follow public/audio/vo.wav (87.84 s). Film 89.0 s, outro card from 86.0 s.
// Composition is muted; VO + SFX are mixed by `npm run render:final -- --vo=... --sfx=...`.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";
import {
  C, FONT_CSS, HEAD, UI, Backdrop, MOODS, Hud, Card, Callout, Chip, Figure, Bar, ChalkPath, POSES, Pose,
  mixPose, ramp, rampIO, pop, win, lerp, clamp01, hash,
} from "./kit";
import { WORDS, CHUNKS } from "./words";
import { Occluder, Finish } from "./set";

export const EP09_SECONDS = 89;
const OUTRO_AT = 86;

// Deeper arch: head and feet hang low, so the centre of mass drops under the bar (F13).
const ARCH: Pose = {
  neck: [56, 44], head: [74, 74], lK: [-46, 36], lF: [-66, 86], rK: [-50, 32], rF: [-72, 80],
  lE: [40, 62], lH: [24, 84], rE: [46, 58], rH: [30, 80],
};

/** Pose sequence for k ∈ [0,1]. */
const seq = (keys: Pose[], k: number): Pose => {
  const n = keys.length - 1;
  const x = clamp01(k) * n;
  const i = Math.min(n - 1, Math.floor(x));
  return mixPose(keys[i], keys[i + 1], x - i);
};
/** Run-up on the ground, then a parabolic flight. Returns hip position. */
const jumpPath = (k: number, x0: number, x1: number, ground: number, peak: number, land: number, runUntil = 0.3) => {
  const x = lerp(x0, x1, clamp01(k));
  if (k < runUntil) return { x, y: ground + Math.sin(k * 60) * 4 };
  const u = (k - runUntil) / (1 - runUntil);
  const base = lerp(ground, land, u);
  return { x, y: base - Math.sin(Math.PI * u) * peak };
};

type Fit = { cy: number; s: number; dy: number };
const Stage: React.FC<{ children: React.ReactNode; fit?: Fit; spot?: [number, number, number] }> = ({ children, fit, spot }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", color: C.chalk }}>
    <defs>
      <radialGradient id="ep09spot"><stop offset="0" stopColor="#ffd58a" stopOpacity={0.30} /><stop offset="0.6" stopColor="#d88a40" stopOpacity={0.12} /><stop offset="1" stopColor="#7a3e1c" stopOpacity={0} /></radialGradient>
    </defs>
    {spot && <ellipse cx={spot[0]} cy={spot[1]} rx={spot[2]} ry={spot[2] * 0.82} fill="url(#ep09spot)" style={{ mixBlendMode: "screen" }} />}
    <g transform={fit ? `translate(0 ${fit.dy}) translate(540 ${fit.cy}) scale(${fit.s}) translate(-540 ${-fit.cy})` : undefined}>{children}</g>
  </svg>
);

/** Scene wrapper: cross-fade + slow push-in + drift (continuous camera). */
const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; zoom?: number; mood: keyof typeof MOODS; sunX?: number; occ?: "left" | "right" }> = ({ t, a, b, children, zoom = 0.08, mood, sunX = 820, occ }) => {
  const o = win(t, a, b, 0.28);
  if (o <= 0) return null;
  const p = clamp01((t - a) / (b - a));
  const s = 1 + zoom * p;
  const dx = Math.sin((t - a) * 0.55) * 18;
  const dy = Math.sin((t - a) * 0.4 + 1) * 8;
  // G13: the camera move lives in the backdrop (it fills the frame, so it carries the measured motion):
  // linear push-in + wide lateral drift that never parks. Cards/subject keep the gentle drift above
  // (parallax), so nothing is pushed out of the safe zones at the end of long scenes.
  const bx = Math.sin((t - a) * 0.7) * 95;
  const by = Math.sin((t - a) * 0.5 + 1) * 18;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", inset: -120, transform: `translate(${bx}px,${by}px) scale(${1 + zoom * 0.22 * (t - a)})`, transformOrigin: "50% 48%" }}>
        <Backdrop t={t} mood={mood} sunX={sunX} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px,${dy}px) scale(${s})`, transformOrigin: "50% 48%" }}>
        {children}
      </div>
      {occ && <div style={{ position: "absolute", inset: 0, transform: `translateX(${(occ === "left" ? -1 : 1) * p * 90 - dx * 2.2}px)` }}><Occluder side={occ} flagY={1560} /></div>}
    </div>
  );
};

const Floor: React.FC<{ y: number; x1?: number; x2?: number }> = ({ y, x1 = 70, x2 = 1010 }) => (
  <path d={`M${x1} ${y} H${x2}`} stroke="rgba(246,233,207,0.55)" strokeWidth={5} />
);

const FoamMat: React.FC<{ x: number; y: number; w: number; h: number; k?: number; label?: boolean }> = ({ x, y, w, h, k = 1, label = false }) => (
  <g opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
    <rect x={x} y={y + 10} width={w} height={h} rx={16} fill="rgba(0,0,0,0.35)" />
    <rect x={x} y={y} width={w} height={h} rx={16} fill={C.foam} stroke={C.ink} strokeWidth={5} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h * 0.28} rx={10} fill="rgba(255,255,255,0.18)" />
    {label && <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fontFamily={UI} fontWeight={700} fontSize={40} fill="#fff" stroke={C.ink} strokeWidth={7} paintOrder="stroke" style={{ color: "#fff" }}>BUSA</text>}
  </g>
);

const Medal: React.FC<{ x: number; y: number; k: number; color?: string; label?: string; r?: number }> = ({ x, y, k, color = C.gold, label = "EMAS", r = 92 }) => k <= 0.001 ? null : (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d={`M${-r * 0.6} ${-r * 2.1} L${-r * 0.15} ${-r * 0.7} L${r * 0.15} ${-r * 0.7} L${r * 0.6} ${-r * 2.1}`} fill={C.blue} stroke={C.ink} strokeWidth={5} />
    <circle r={r + 8} fill="rgba(0,0,0,0.35)" cy={10} />
    <circle r={r} fill={color} stroke={C.ink} strokeWidth={6} />
    <circle r={r * 0.72} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={5} />
    <text y={18} textAnchor="middle" fontFamily={HEAD} fontSize={r * 0.55} fill={C.ink} stroke="#fff3c4" strokeWidth={5} paintOrder="stroke" style={{ color: C.ink }}>{label}</text>
  </g>
);

// ---------------- S1 HOOK 0–9.9 ----------------
const S1: React.FC<{ t: number }> = ({ t }) => {
  const shrink = rampIO(t, 3.2, 4.2);
  const hl = ramp(t, 1.3, 2.9);
  const k = clamp01((t - 3.4) / 4.6);
  const floor = 1300, s = 1.25;
  const pose = seq([POSES.run, POSES.run, POSES.take, POSES.flop, POSES.clear, POSES.land], k);
  const pos = jumpPath(k, 150, 820, floor - 84 * s, 330, floor - 150, 0.32);
  const barK = ramp(t, 0, 0.6);
  const lazyK = 1 - ramp(t, 2.9, 3.4);
  return (
    <>
      <Stage fit={{ cy: 1300, s: 1.15, dy: -60 }} spot={[570, 1000, 470]}>
        <Floor y={floor} />
        <g opacity={barK}>
          <FoamMat x={640} y={floor - 110} w={330} h={110} />
          <Bar x1={470} x2={690} y={1010} floor={floor} />
        </g>
        {t > 3.4 && <ChalkPath d="M150 1196 C 330 1196, 420 1196, 470 1150 S 560 860, 620 900 S 760 1080, 820 1150" k={k * 1.1} color={C.yellow} w={6} dash />}
        {lazyK > 0 && <g opacity={lazyK}><Figure pose={POSES.land} x={805 + Math.sin(t * 1.6) * 3} y={floor - 150} s={s} rot={-4} /></g>}
        {t > 3.3 && <Figure pose={pose} x={pos.x} y={pos.y} s={s} />}
        <Medal x={880} y={900} k={pop(t, 9.1, 0.4)} />
      </Stage>
      <Card x={lerp(90, 70, shrink)} y={lerp(440, 380, shrink)} w={lerp(900, 560, shrink)} k={ramp(t, 0, 0.5)} rot={lerp(-2, -3, shrink)} bg="#efe6cf"
        style={{ padding: lerp(34, 22, shrink), transformOrigin: "0 0" }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: lerp(30, 20, shrink), color: "#5b4a33", letterSpacing: 3, borderBottom: "3px solid #5b4a33", paddingBottom: 8 }}>KLIPING KORAN · 1960-AN</div>
        <div style={{ position: "relative", marginTop: 26, fontFamily: HEAD, fontSize: lerp(96, 54, shrink), lineHeight: 1.12, color: C.ink }}>
          <div style={{ position: "absolute", left: -8, top: "8%", height: "84%", width: `${hl * 104}%`, background: "rgba(244,200,74,0.75)", zIndex: 0, borderRadius: 6 }} />
          <span style={{ position: "relative" }}>"WORLD'S LAZIEST HIGH JUMPER"</span>
        </div>
        <div style={{ marginTop: 12, fontFamily: UI, fontWeight: 700, fontSize: lerp(36, 24, shrink), color: "#3a3024" }}>pelompat tinggi paling malas sedunia</div>
      </Card>
      <Chip x={540} y={760} k={pop(t, 6.0)} text="OLIMPIADE MEXICO CITY 1968" bg={C.yellow} fg={C.ink} size={42} />
    </>
  );
};

// ---------------- S2a 9.9–20.2 ----------------
const S2a: React.FC<{ t: number }> = ({ t }) => {
  const floor = 1330, s = 1.2, ground = floor - 84 * s;
  const ks = clamp01((t - 12.0) / 4.0);
  const kd = clamp01((t - 16.2) / 3.6);
  const scis = seq([POSES.run, POSES.run, POSES.scissors, POSES.scissors, POSES.run], ks);
  const strd = seq([POSES.run, POSES.take, POSES.straddle, POSES.straddle, POSES.land], kd);
  const ps = jumpPath(ks, 170, 900, ground, 170, ground, 0.35);
  const pd = jumpPath(kd, 170, 860, ground, 230, floor - 160, 0.3);
  const xk = pop(t, 18.1, 0.35);
  return (
    <>
      <Card x={90} y={350} w={900} k={ramp(t, 10.0, 10.6)} bg={C.chalk} style={{ padding: "26px 34px", display: "flex", alignItems: "center", gap: 26 }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: C.red, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontSize: 62, color: "#fff" }}>DF</div>
        <div>
          <div style={{ fontFamily: HEAD, fontSize: 92, lineHeight: 1, color: C.ink }}>DICK FOSBURY</div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, color: "#3b3b3b", marginTop: 6 }}>pelompat tinggi · Amerika Serikat</div>
        </div>
      </Card>
      <Stage fit={{ cy: 1330, s: 1.15, dy: -70 }} spot={[560, 1040, 450]}>
        <Floor y={floor} />
        <FoamMat x={660} y={floor - 90} w={320} h={90} k={0.9} />
        <Bar x1={480} x2={680} y={1100} floor={floor} />
        {t >= 12.0 && t < 16.2 && <Figure pose={scis} x={ps.x} y={ps.y} s={s} />}
        {t >= 16.2 && <Figure pose={POSES.scissors} x={330} y={ground - 30} s={0.9} ghost />}
        {t >= 16.2 && <Figure pose={strd} x={pd.x} y={pd.y} s={s} jersey={C.blue} />}
        {xk > 0 && (
          <g transform={`translate(${pd.x} ${pd.y - 20}) scale(${xk})`}>
            <path d="M-90 -90 L90 90 M90 -90 L-90 90" stroke={C.red} strokeWidth={26} strokeLinecap="round" />
          </g>
        )}
      </Stage>
      <Chip x={540} y={650} k={t < 16.2 ? pop(t, 12.6) : 1 - ramp(t, 16.2, 16.5)} text="GAYA GUNTING" bg={C.yellow} fg={C.ink} size={46} />
      <Chip x={540} y={650} k={pop(t, 16.4) * (1 - ramp(t, 17.8, 18.1))} text="GULING PERUT · STRADDLE" bg={C.blue} fg={C.ink} size={46} />
      <Chip x={540} y={650} k={pop(t, 18.1)} text="FOSBURY KESULITAN" bg={C.red} fg="#fff" size={40} />
    </>
  );
};

// ---------------- S2b 20.2–29.6 ----------------
const S2b: React.FC<{ t: number }> = ({ t }) => {
  const floor = 1240;
  const km = rampIO(t, 23.5, 26.6);
  const frames = [0, 0.25, 0.5, 0.75, 1];
  const hero = mixPose(POSES.scissors, POSES.flop, km);
  const hx = lerp(200, 880, km);
  return (
    <>
      <Card x={110} y={350} w={860} k={ramp(t, 20.4, 21.0)} bg={C.ink} style={{ padding: "24px 30px", border: `4px solid ${C.chalk}` }}>
        <div style={{ fontFamily: HEAD, fontSize: 88, color: C.yellow, lineHeight: 1 }}>UMUR 16</div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.chalk, marginTop: 8 }}>SMA Medford, Oregon</div>
      </Card>
      <Stage spot={[540, 1000, 440]}>
        <Floor y={floor} />
        <path d="M120 1060 H960" stroke="rgba(243,239,228,0.25)" strokeWidth={4} strokeDasharray="10 12" />
        {frames.map((f, i) => (km >= f - 0.001 && i < 4) ? (
          <Figure key={i} pose={mixPose(POSES.scissors, POSES.flop, f)} x={lerp(200, 880, f)} y={1000} s={0.95} ghost />
        ) : null)}
        {t > 23.3 && <ChalkPath d="M180 1180 Q540 1240 900 1180" k={km} color={C.yellow} w={6} />}
        {t > 23.3 && <path d={`M${lerp(180, 900, km) - 18} 1170 l26 12 -24 16`} fill="none" stroke={C.yellow} strokeWidth={6} opacity={km > 0.05 ? 1 : 0} />}
        <Figure pose={hero} x={hx} y={1000} s={1.25} />
        {t > 27.2 && <ChalkPath d="M820 820 Q 860 900 880 960" k={ramp(t, 27.4, 27.8)} color={C.chalk} w={6} />}
        {t > 28.3 && <ChalkPath d="M980 1180 Q 1000 1100 990 1060" k={ramp(t, 28.5, 28.9)} color={C.chalk} w={6} />}
      </Stage>
      <Chip x={540} y={640} k={pop(t, 23.6) * (1 - ramp(t, 27.0, 27.3))} text="GUNTING → TERBALIK" bg={C.yellow} fg={C.ink} size={44} />
      <Chip x={740} y={790} k={pop(t, 27.4)} text="PUNGGUNG DULU" bg={C.red} fg="#fff" size={42} />
      <Chip x={760} y={1250} k={pop(t, 28.5)} text="KEPALA DULU" bg={C.blue} fg={C.ink} size={42} />
    </>
  );
};

// ---------------- S3a 29.6–37.2 ----------------
const Fish: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const w = Math.sin(t * 14) * 14;
  const hop = Math.abs(Math.sin(t * 5)) * 40;
  return (
    <g transform={`translate(${x} ${y - hop}) rotate(${w}) scale(${s})`}>
      <path d="M-120 0 C -60 -70, 60 -70, 110 0 C 60 70, -60 70, -120 0 Z" fill={C.silver} stroke={C.ink} strokeWidth={7} />
      <path d={`M-118 0 L-190 ${-50 + w} L-180 0 L-190 ${50 - w} Z`} fill={C.silver} stroke={C.ink} strokeWidth={7} />
      <circle cx={62} cy={-12} r={10} fill={C.ink} />
      <path d="M-20 -40 Q 0 0 -20 40" stroke={C.ink} strokeWidth={5} fill="none" />
    </g>
  );
};
const S3a: React.FC<{ t: number }> = ({ t }) => {
  const foam = pop(t, 34.0, 0.45);
  return (
    <>
      <Card x={90} y={350} w={900} k={ramp(t, 29.7, 30.3)} rot={2} bg="#efe6cf" style={{ padding: "30px 36px" }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: "#5b4a33", letterSpacing: 3, borderBottom: "3px solid #5b4a33", paddingBottom: 8 }}>KORAN LOKAL · 1964</div>
        <div style={{ fontFamily: HEAD, fontSize: 80, lineHeight: 1.05, color: C.ink, marginTop: 14 }}>"Seperti ikan menggelepar di perahu"</div>
      </Card>
      <Stage fit={{ cy: 1290, s: 1.15, dy: -70 }} spot={[540, 1060, 460]}>
        {/* boat */}
        <g opacity={1 - ramp(t, 33.6, 34.0) * 0.6}>
          <path d="M150 1150 L930 1150 L820 1290 L260 1290 Z" fill="#7a5233" stroke={C.ink} strokeWidth={7} />
          <path d="M150 1150 L930 1150" stroke="#a87444" strokeWidth={14} />
          <path d="M80 1320 q 60 -30 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0" stroke="rgba(120,190,255,0.5)" strokeWidth={6} fill="none" transform={`translate(${Math.sin(t * 2) * 20} 0)`} />
          <Fish x={540} y={1080} t={t} s={1.2} />
        </g>
        <FoamMat x={160} y={1150} w={760} h={150} k={foam} label />
        {foam > 0.01 && <Figure pose={POSES.land} x={540} y={1100} s={1.2 * clamp01(foam)} />}
      </Stage>
      <Chip x={540} y={800} k={pop(t, 34.2)} text="AMAN KARENA BANTALAN BUSA" bg={C.foam} fg="#fff" size={42} />
    </>
  );
};

// ---------------- S3b 37.2–44.8 ----------------
const Pit: React.FC<{ x: number; y: number; k: number; kind: number; label: string; danger?: number }> = ({ x, y, k, kind, label, danger = 0 }) => {
  if (k <= 0.001) return null;
  const col = ["#d9b46c", "#b88a55", "#8a5b36"][kind];
  const bits = Array.from({ length: 34 }).map((_, i) => {
    const bx = 14 + hash(i + kind * 50) * 232, by = 16 + hash(i * 3 + kind * 9) * 118;
    if (kind === 0) return <circle key={i} cx={bx} cy={by} r={3} fill="rgba(80,60,20,0.45)" />;
    if (kind === 1) return <path key={i} d={`M${bx} ${by} l${8 + hash(i) * 8} ${hash(i * 7) * 6 - 3}`} stroke="rgba(70,40,15,0.55)" strokeWidth={3} />;
    return <rect key={i} x={bx} y={by} width={14 + hash(i * 5) * 16} height={7} rx={2} fill="rgba(50,25,10,0.6)" transform={`rotate(${hash(i * 11) * 180} ${bx} ${by})`} />;
  });
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 50})`} opacity={clamp01(k * 1.4)}>
      <rect x={0} y={10} width={260} height={150} rx={14} fill="rgba(0,0,0,0.35)" />
      <rect x={0} y={0} width={260} height={150} rx={14} fill={col} stroke={danger > 0 ? C.red : C.ink} strokeWidth={danger > 0 ? 9 : 6} />
      {bits}
    </g>
  );
};
const S3b: React.FC<{ t: number }> = ({ t }) => {
  const fall = ramp(t, 42.4, 43.0);
  const stamp = pop(t, 43.9, 0.3);
  return (
    <>
      <Card x={110} y={350} w={860} k={ramp(t, 37.3, 37.9)} bg={C.ink} style={{ padding: "22px 30px", border: `4px solid ${C.chalk}` }}>
        <div style={{ fontFamily: HEAD, fontSize: 74, color: C.chalk, lineHeight: 1 }}>SEBELUM ERA BUSA</div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: C.yellow, marginTop: 6 }}>bak pendaratan pelompat tinggi</div>
      </Card>
      <Stage spot={[540, 820, 460]}>
        <g transform="translate(540 800) scale(0.86) translate(-540 -800)">
          <Pit x={70} y={720} k={pop(t, 38.85)} kind={0} label="PASIR" />
          <Pit x={410} y={720} k={pop(t, 39.5)} kind={1} label="SERBUK GERGAJI" danger={fall} />
          <Pit x={750} y={720} k={pop(t, 41.2)} kind={2} label="SERPIHAN KAYU" />
        </g>
        {t > 42.0 && <Figure pose={mixPose(POSES.clear, POSES.land, fall)} x={540} y={lerp(520, 680, fall)} s={1.15} jersey={C.red} />}
        {fall > 0.9 && <g opacity={1 - ramp(t, 43.0, 43.6)}>{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${470 + i * 35} 700 l${(i - 2) * 14} -50`} stroke={C.chalk} strokeWidth={6} strokeLinecap="round" />)}</g>}
        <FoamMat x={300} y={1100} w={480} h={110} k={ramp(t, 44.2, 44.6)} label />
      </Stage>
      <Chip x={248} y={915} k={pop(t, 38.95)} text="PASIR" size={36} />
      <Chip x={540} y={995} k={pop(t, 39.6)} text="SERBUK GERGAJI" size={36} />
      <Chip x={832} y={915} k={pop(t, 41.3)} text="SERPIHAN KAYU" size={36} />
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1090, opacity: 1 - ramp(t, 44.3, 44.6), transform: `translate(-50%,-50%) rotate(-6deg) scale(${stamp})`, border: `10px solid ${C.red}`, color: C.red, fontFamily: HEAD, fontSize: 100, padding: "0 30px", borderRadius: 16, background: "rgba(20,12,8,0.88)" }}>BERBAHAYA</div>
      )}
      <Chip x={540} y={1250} k={pop(t, 44.4)} text="BUSA: PENDARATAN ±0,9 M LEBIH TINGGI" bg={C.foam} fg="#fff" size={36} />
    </>
  );
};

// ---------------- S4 44.8–59.6 ----------------
const S4: React.FC<{ t: number }> = ({ t }) => {
  const barY = 1000, s = 2.2;
  const travel = rampIO(t, 45.6, 57.0);
  const hx = lerp(330, 750, travel);
  const arch = rampIO(t, 50.9, 53.6);
  const pose = mixPose(POSES.flop, ARCH, arch);
  const hy = barY - 46 - Math.sin(Math.PI * travel) * 30 + (1 - Math.sin(Math.PI * travel)) * 60;
  const showCom = t > 46.9;
  const sum = pop(t, 57.6, 0.4);
  return (
    <>
      <Card x={110} y={350} w={860} k={ramp(t, 45.0, 45.6)} bg={C.chalk} style={{ padding: "22px 30px" }}>
        <div style={{ fontFamily: HEAD, fontSize: 80, color: C.ink, lineHeight: 1 }}>KENAPA LEBIH TINGGI?</div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: "#3b3b3b", marginTop: 6 }}>kuncinya: pusat massa tubuh</div>
      </Card>
      <Stage spot={[540, barY, 480]}>
        <path d={`M90 ${barY} H990`} stroke="rgba(243,239,228,0.35)" strokeWidth={4} strokeDasharray="16 14" />
        <text x={96} y={barY - 22} fontFamily={UI} fontWeight={700} fontSize={36} fill={C.chalk}>MISTAR</text>
        <Bar x1={360} x2={720} y={barY} floor={1240} />
        {/* CoM trajectory: passes under the bar */}
        {t > 53.4 && <ChalkPath d={`M300 ${barY - 20} Q 540 ${barY + 110} 780 ${barY - 20}`} k={ramp(t, 53.6, 54.6)} color={C.yellow} w={6} dash />}
        <Figure pose={pose} x={hx} y={hy} s={s} showCom={showCom} />
        {t > 50.7 && t < 57.4 && (
          <g opacity={ramp(t, 50.9, 51.3) * (1 - ramp(t, 57.0, 57.4))}>
            <path d={`M${hx + 160} ${hy + 60} v90 m-18 -22 l18 22 18 -22`} stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d={`M${hx - 150} ${hy + 60} v90 m-18 -22 l18 22 18 -22`} stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        )}
      </Stage>
      <Chip x={540} y={680} k={pop(t, 46.9) * (1 - ramp(t, 50.6, 50.9))} text="● PUSAT MASSA" bg={C.yellow} fg={C.ink} size={46} />
      <Chip x={540} y={680} k={pop(t, 50.9) * (1 - ramp(t, 53.3, 53.6))} text="KEPALA & KAKI TURUN" bg={C.red} fg="#fff" size={44} />
      <Chip x={540} y={680} k={pop(t, 53.6) * (1 - ramp(t, 57.3, 57.6))} text="PUSAT MASSA LEWAT DI BAWAH MISTAR" bg={C.yellow} fg={C.ink} size={36} />
      {sum > 0 && (
        <div style={{ position: "absolute", left: 540, top: 680, transform: `translate(-50%,-50%) scale(${sum})`, textAlign: "center", width: 940 }}>
          <div style={{ display: "inline-block", background: C.ink, border: `5px solid ${C.yellow}`, borderRadius: 18, padding: "14px 28px", fontFamily: HEAD, fontSize: 56, color: C.chalk, lineHeight: 1.1, whiteSpace: "nowrap" }}>
            TENAGA SAMA <span style={{ color: C.yellow }}>→</span> MISTAR LEBIH TINGGI
          </div>
        </div>
      )}
    </>
  );
};

// ---------------- S5 59.6–71.9 ----------------
const S5: React.FC<{ t: number }> = ({ t }) => {
  const cnt = lerp(2.0, 2.24, ramp(t, 64.8, 66.0));
  const val = cnt.toFixed(2).replace(".", ",");
  const ruler = (h: number) => 1200 - (h - 2.0) * 1500; // 2.00 → 1200, 2.24 → 840
  const silver = ramp(t, 69.2, 69.7);
  const rec = pop(t, 67.8, 0.35);
  return (
    <>
      <Card x={90} y={350} w={900} k={ramp(t, 59.7, 60.3)} bg="#140d09" style={{ padding: "24px 30px", border: `5px solid ${C.chalk}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: HEAD, fontSize: 84, color: C.yellow, lineHeight: 1 }}>20 OKT 1968</div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.chalk }}>FINAL · MEXICO CITY</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, opacity: ramp(t, 61.0, 61.5) }}>
          <div style={{ fontFamily: HEAD, fontSize: 60, color: C.chalk }}>FOSBURY</div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, background: C.red, color: "#fff", borderRadius: 10, padding: "4px 14px", opacity: pop(t, 63.6) }}>21 TAHUN</div>
        </div>
      </Card>
      <Stage spot={[600, 980, 440]}>
        {/* ruler on a dark archive strip so the labels read over the warm set */}
        <rect x={120} y={770} width={190} height={460} rx={14} fill="rgba(14,9,6,0.72)" />
        <path d="M150 1200 V800" stroke={C.chalk} strokeWidth={6} />
        {[2.0, 2.05, 2.1, 2.15, 2.2, 2.25].map((h) => (
          <g key={h}>
            <path d={`M150 ${ruler(h)} h32`} stroke={C.chalk} strokeWidth={5} />
            <text x={196} y={ruler(h) + 12} fontFamily={UI} fontWeight={700} fontSize={36} fill={C.chalk} stroke="rgba(14,9,6,0.9)" strokeWidth={8} paintOrder="stroke" style={{ color: C.chalk }}>{h.toFixed(2).replace(".", ",")}</text>
          </g>
        ))}
        <g opacity={silver}>
          <path d={`M300 ${ruler(2.22)} H836`} stroke={C.silver} strokeWidth={8} strokeDasharray="20 14" />
          {/* final r2: tag outside the right post so posts, jumper and stamp never cross it */}
          <rect x={846} y={ruler(2.22) - 58} width={190} height={116} rx={14} fill="rgba(14,9,6,0.85)" stroke={C.silver} strokeWidth={4} />
          <text x={941} y={ruler(2.22) - 10} textAnchor="middle" fontFamily={UI} fontWeight={700} fontSize={36} fill={C.silver}>PERAK</text>
          <text x={941} y={ruler(2.22) + 38} textAnchor="middle" fontFamily={UI} fontWeight={700} fontSize={40} fill={C.chalk}>2,22 M</text>
        </g>
        {t < 65.2 && <Figure pose={POSES.run} x={lerp(250, 400, ramp(t, 60.4, 64.8))} y={1200 - 84 * 1.2 + Math.sin(t * 9) * 5} s={1.2} />}
        <path d="M100 1200 H1000" stroke="rgba(243,239,228,0.45)" strokeWidth={6} strokeDasharray="22 14" />
        <Bar x1={420} x2={820} y={ruler(cnt)} floor={1200} color={t > 66 ? C.gold : C.chalk} />
        {t > 66.0 && <Figure pose={POSES.flop} x={620} y={ruler(2.24) - 50} s={1.15} />}
      </Stage>
      <div style={{ position: "absolute", left: 760, top: 690, transform: "translate(-50%,-50%)", whiteSpace: "nowrap", fontFamily: HEAD, fontSize: 130, color: C.yellow, opacity: ramp(t, 64.6, 64.9), textShadow: "0 8px 0 rgba(0,0,0,0.35)" }}>{val} M</div>
      <div style={{ position: "absolute", left: 540, top: 1286, transform: "translate(-50%,-50%)", display: "flex", gap: 18, opacity: ramp(t, 66.3, 66.6) }}>
        {["X", "X", "O"].map((m, i) => {
          const k = pop(t, 66.5 + i * 0.25, 0.3);
          return <div key={i} style={{ width: 86, height: 86, borderRadius: 14, border: `5px solid ${C.chalk}`, background: m === "O" ? C.gold : C.ink, color: m === "O" ? C.ink : C.red, fontFamily: HEAD, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>{m}</div>;
        })}
        <div style={{ alignSelf: "center", fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.chalk, opacity: ramp(t, 67.1, 67.4) }}>percobaan ke-3</div>
      </div>
      {rec > 0 && (
        <div style={{ position: "absolute", left: 620, top: 1080, transform: `translate(-50%,-50%) rotate(-5deg) scale(${rec})`, border: `8px solid ${C.gold}`, color: C.gold, background: "rgba(20,12,8,0.9)", fontFamily: HEAD, fontSize: 58, padding: "6px 22px", borderRadius: 14 }}>REKOR OLIMPIADE</div>
      )}
    </>
  );
};

// ---------------- S6 71.9–81.6 ----------------
const Magnet: React.FC<{ x: number; y: number; lit: boolean; k: number; medal?: string }> = ({ x, y, lit, k, medal }) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.5)}>
    <circle r={40} cy={6} fill="rgba(0,0,0,0.35)" />
    <circle r={40} fill={lit ? (medal ?? C.yellow) : "rgba(243,239,228,0.14)"} stroke={lit ? C.ink : "rgba(243,239,228,0.3)"} strokeWidth={5} />
    {lit && <path d="M-22 10 Q 0 -26 22 10" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />}
  </g>
);
const S6: React.FC<{ t: number }> = ({ t }) => {
  const phase2 = t >= 76.9;
  const a = ramp(t, 72.0, 72.8);
  const lit1 = Math.floor(28 * ramp(t, 72.8, 75.2));
  const b = ramp(t, 76.9, 77.5);
  const lit2 = Math.floor(34 * ramp(t, 77.5, 80.0));
  const medals = [C.gold, C.silver, "#c98b4f"];
  return (
    <>
      <Card x={110} y={350} w={860} k={ramp(t, 72.0, 72.6)} bg={C.chalk} style={{ padding: "20px 30px" }}>
        <div style={{ fontFamily: HEAD, fontSize: 80, color: C.ink, lineHeight: 1 }}>{phase2 ? "1972 – 2000" : "MUNICH 1972"}</div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: "#3b3b3b", marginTop: 6 }}>{phase2 ? "peraih medali Olimpiade lompat tinggi" : "peserta lompat tinggi putra"}</div>
      </Card>
      <Stage spot={[540, 850, 520]}>
        {!phase2 && Array.from({ length: 40 }).map((_, i) => {
          const c = i % 8, r = Math.floor(i / 8);
          return <Magnet key={i} x={155 + c * 110} y={630 + r * 106} lit={i < lit1} k={clamp01(a * 2 - (i / 40))} />;
        })}
        {phase2 && Array.from({ length: 36 }).map((_, i) => {
          const c = i % 6, r = Math.floor(i / 6);
          return <Magnet key={i} x={265 + c * 110} y={600 + r * 92} lit={i < lit2} k={clamp01(b * 2 - (i / 36))} medal={medals[i % 3]} />;
        })}
      </Stage>
      {!phase2 && <Callout x={540} y={1190} t={t} at={73.4} big="28 / 40" label="SUDAH PAKAI FLOP" size={120} out={76.6} />}
      {phase2 && <Callout x={540} y={1190} t={t} at={77.6} big="34 / 36" label="MEDALI PAKAI FLOP" size={120} />}
    </>
  );
};

// ---------------- S7 81.6–89 ----------------
const S7: React.FC<{ t: number }> = ({ t }) => {
  const k = clamp01((t - 81.6) / 4.2);
  const pose = seq([POSES.take, POSES.flop, POSES.flop, POSES.clear], k);
  const pos = jumpPath(k, 260, 820, 1150, 220, 1080, 0.05);
  const strike = ramp(t, 82.6, 83.0);
  const plate = pop(t, 85.2, 0.4);
  return (
    <>
      <Stage fit={{ cy: 1000, s: 1, dy: -80 }} spot={[540, 920, 480]}>
        <circle cx={540} cy={1000} r={lerp(200, 330, k)} fill="rgba(233,185,73,0.12)" />
        <Bar x1={400} x2={680} y={1010} floor={1300} color={C.gold} />
        <FoamMat x={640} y={1190} w={330} h={110} />
        <ChalkPath d="M260 1150 Q 540 640 820 1080" k={k} color={C.yellow} w={6} dash />
        <Figure pose={pose} x={pos.x} y={pos.y} s={1.35} />
      </Stage>
      <div style={{ position: "absolute", left: 120, right: 120, top: 370, textAlign: "center", background: "rgba(14,9,6,0.74)", borderRadius: 26, padding: "18px 0 26px", opacity: ramp(t, 81.7, 82.1) }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: HEAD, fontSize: 110, color: C.chalk, opacity: ramp(t, 81.8, 82.2) }}>
          DIEJEK
          <div style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `${strike * 110}%`, background: C.red, borderRadius: 6 }} />
        </div>
        <div style={{ fontFamily: HEAD, fontSize: 170, color: C.yellow, lineHeight: 1, transform: `scale(${pop(t, 83.5, 0.4)})`, textShadow: "0 10px 0 rgba(0,0,0,0.4)" }}>STANDAR</div>
      </div>
      {plate > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1250, transform: `translate(-50%,-50%) scale(${plate})`, display: "flex", gap: 0, borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 30px rgba(0,0,0,0.45)" }}>
          <div style={{ background: C.red, color: "#fff", fontFamily: HEAD, fontSize: 64, padding: "10px 26px" }}>AUDIRA</div>
          <div style={{ background: C.yellow, color: C.ink, fontFamily: HEAD, fontSize: 64, padding: "10px 26px" }}>SPORT FACTS</div>
        </div>
      )}
    </>
  );
};

// ---------------- Karaoke captions ----------------
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= 85.15) return null;
  let ci = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (WORDS[CHUNKS[i][0]].s <= t + 0.05) ci = i;
  if (ci < 0) return null;
  const ch = CHUNKS[ci];
  const end = WORDS[ch[ch.length - 1]].e;
  const next = CHUNKS[ci + 1] ? WORDS[CHUNKS[ci + 1][0]].s : 1e9;
  if (t > end + 0.7 && t < next) return null;
  const k = ramp(t, WORDS[ch[0]].s - 0.05, WORDS[ch[0]].s + 0.12);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(14,9,6,0.80)", border: "3px solid rgba(245,181,74,0.35)", borderRadius: 18, padding: "14px 26px", display: "flex", flexWrap: "wrap", justifyContent: "center",
        transform: `translateY(${(1 - k) * 16}px)`, opacity: clamp01(k * 1.5), maxWidth: 960 }}>
        {ch.map((wi) => {
          const w = WORDS[wi];
          const on = t >= w.s && t < w.e + 0.08;
          const done = t >= w.e + 0.08;
          return (
            <span key={wi} style={{ fontFamily: HEAD, fontSize: 66, lineHeight: 1.15, marginRight: "0.4em", color: on ? C.yellow : done ? C.chalk : "rgba(243,239,228,0.55)",
              display: "inline-block", transform: `scale(${on ? 1.04 : 1})` }}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};

const HUD_TAGS: [number, string][] = [
  [0, "HOOK · MEXICO CITY 1968"], [9.9, "PROFIL ATLET"], [20.2, "EVOLUSI GAYA"], [29.6, "REAKSI MEDIA"],
  [37.2, "BAK PENDARATAN"], [44.8, "ANALISIS FISIKA"], [59.6, "FINAL OLIMPIADE"], [71.9, "WARISAN"], [81.6, "PENUTUP"],
];

const FgBokeh: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {[[120, 1180, 46, 0.3], [930, 760, 34, 0.27], [880, 1230, 26, 0.22], [180, 620, 22, 0.25]].map(([x, y, r, w], i) => (
      <div key={i} style={{ position: "absolute", left: x + Math.sin(t * w + i) * 16 - r, top: y + Math.cos(t * w * 0.8 + i) * 22 - r, width: r * 2, height: r * 2,
        borderRadius: r, background: "rgba(255,213,138,0.7)", opacity: 0.22, filter: "blur(9px)" }} />
    ))}
  </div>
);

export const Ep09Film: React.FC<{ t: number }> = ({ t }) => {
  const tag = [...HUD_TAGS].reverse().find(([a]) => t >= a)![1];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" }}>
      <style>{FONT_CSS}</style>
      <Scene t={t} a={0} b={9.9} mood="dusk" sunX={860} occ="right"><S1 t={t} /></Scene>
      <Scene t={t} a={9.9} b={20.2} mood="noon" sunX={220} occ="left"><S2a t={t} /></Scene>
      <Scene t={t} a={20.2} b={29.6} mood="gold" sunX={880}><S2b t={t} /></Scene>
      <Scene t={t} a={29.6} b={37.2} mood="amber" sunX={240} occ="left"><S3a t={t} /></Scene>
      <Scene t={t} a={37.2} b={44.8} mood="steel" sunX={840} occ="right"><S3b t={t} /></Scene>
      <Scene t={t} a={44.8} b={59.6} zoom={0.07} mood="night" sunX={820} occ="right"><S4 t={t} /></Scene>
      <Scene t={t} a={59.6} b={71.9} mood="dusk" sunX={250} occ="left"><S5 t={t} /></Scene>
      <Scene t={t} a={71.9} b={81.6} mood="amber" sunX={840}><S6 t={t} /></Scene>
      <Scene t={t} a={81.6} b={EP09_SECONDS + 1} mood="gold" sunX={800} occ="right"><S7 t={t} /></Scene>
      <FgBokeh t={t} />
      <Finish vignette={0.55} grain={0.09} />
      <Hud t={t} tag={tag} code="EP09" />
      <Captions t={t} />
    </div>
  );
};

/** Scales the 1080 design space to the composition size. */
const Fit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  return <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>{children}</div>;
};

export const Ep09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.board1 }}>
      {t < OUTRO_AT + 0.6 && <Fit><Ep09Film t={t} /></Fit>}
      <AudiraOutro seconds={EP09_SECONDS - OUTRO_AT} />
      <AudiraSignature seed="fosbury-flop-1968" outroSeconds={EP09_SECONDS - OUTRO_AT} />
    </AbsoluteFill>
  );
};

/** Topic cover (still, 1080 × 1920): thumbnail + style/cover-topic.png. */
export const Ep09Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.board1 }}>
    <Fit>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" }}>
        <style>{FONT_CSS}</style>
        <Backdrop t={4} mood="dusk" sunX={850} rays={0.5} />
        <Hud t={5} tag="SPORT FACTS · OLIMPIADE 1968" code="EP09" />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={540} cy={1060} r={340} fill="rgba(233,185,73,0.12)" />
          <path d="M120 1230 Q 540 600 960 1160" fill="none" stroke={C.yellow} strokeWidth={7} strokeDasharray="20 16" />
          <Bar x1={360} x2={720} y={1080} floor={1400} color={C.gold} />
          <FoamMat x={680} y={1290} w={330} h={110} />
          <path d="M90 1400 H990" stroke="rgba(243,239,228,0.45)" strokeWidth={6} strokeDasharray="22 14" />
          <Figure pose={ARCH} x={520} y={1030} s={2.0} showCom />
          <path d="M640 1150 h120" stroke={C.yellow} strokeWidth={5} />
        </svg>
        <div style={{ position: "absolute", left: 770, top: 1150, transform: "translateY(-50%)", background: C.yellow, color: C.ink, fontFamily: UI, fontWeight: 700, fontSize: 34, padding: "8px 16px", borderRadius: 10 }}>PUSAT MASSA</div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 330, textAlign: "left" }}>
          <div style={{ fontFamily: HEAD, fontSize: 168, lineHeight: 0.95, color: C.chalk, textShadow: "0 10px 0 rgba(0,0,0,0.4)" }}>LOMPAT</div>
          <div style={{ fontFamily: HEAD, fontSize: 168, lineHeight: 0.95, color: C.yellow, textShadow: "0 10px 0 rgba(0,0,0,0.4)" }}>TERBALIK</div>
          <div style={{ marginTop: 22, display: "inline-block", background: C.red, color: "#fff", fontFamily: HEAD, fontSize: 64, padding: "8px 24px", borderRadius: 14 }}>FOSBURY FLOP · 1968</div>
        </div>
        <div style={{ position: "absolute", left: 70, top: 1470, fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.chalk, width: 940 }}>
          Diejek "pelompat paling malas", pulang bawa <span style={{ color: C.gold }}>EMAS</span>.
        </div>
        <Finish vignette={0.55} grain={0.09} />
      </div>
    </Fit>
  </AbsoluteFill>
);
