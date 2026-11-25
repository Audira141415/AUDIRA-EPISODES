// EP24 — Nabi Sulaiman AS wafat bersandar pada tongkat (AUDIRA QISSAH). Style: PAPERWORLD, Remotion 2D (SVG/CSS, tanpa R3F).
// Adab: Nabi Sulaiman tidak digambarkan dalam bentuk apa pun (tanpa tubuh/siluet/tangan/bayangan/jubah).
// Kehadiran = tongkat yang berdiri bersandar di samping singgasana kosong + cahaya. Tidak ada malaikat.
// Jin = siluet kertas gelap tanpa wajah. Semua nilai fungsi murni dari t: seek-safe, tanpa Math.random.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { AudiraSignature } from "../brand/AudiraSignature";
import { AudiraOutro } from "../brand/AudiraOutro";
import WORDS from "../../public/audio/vo-words.json";

const { fontFamily: PLAYFAIR } = loadPlayfair("normal", { weights: ["700", "800"], subsets: ["latin"] });
const { fontFamily: INTER } = loadInter("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const { fontFamily: AMIRI } = loadAmiri("normal", { weights: ["700"], subsets: ["arabic"] });

export const FILM_SECONDS = 83.5;
const OUTRO_AT = 80.5;

// ---------- palet (docs/ART_DIRECTION.md) ----------
const C = {
  cream: "#F3E6CC", sand: "#E8C99A", ochre: "#D9A24E", terra: "#C2643C", brown: "#5B3A29",
  nightA: "#22304F", nightB: "#4A5C86", lamp: "#FFD27A", gold: "#E9B949",
  jinn: "#3B3550", jinnD: "#2C2740", wood: "#7A4F37", woodL: "#9C6A45", mint: "#7FC8A9", red: "#A3261A",
  wall: "#E3C79C", wallD: "#C9A577", stone: "#B9A48C",
};

// ---------- waktu adegan (detik VO, HANDOFF.md UPDATE 2) ----------
const T = { s1: 0, s2a: 7.6, s2b: 18.8, s3: 30.0, s4: 36.3, s5: 45.6, s6: 53.3, s7a: 57.8, s7b: 63.9, s8: 70.2, s9: 77.8 };

// ---------- helper ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.2, 1) });
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const pop = (t: number, at: number) => { const k = lin(t, at, at + 0.35); return k <= 0 ? 0 : 1 + Math.sin(k * Math.PI) * 0.06 - (1 - k) * 0.1; };
const mulberry = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };

const ridge = (y: number, amp: number, seed: number, waves = 3, bottom = 2400, x0 = -300, x1 = 1380) => {
  const r = mulberry(seed);
  const ph = r() * 6.28;
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 30) d += ` L${x},${(y + Math.sin((x / (x1 - x0)) * Math.PI * waves + ph) * amp + (r() - 0.5) * 7).toFixed(1)}`;
  return d + ` L${x1},${bottom} Z`;
};
const torn = (x: number, y: number, w: number, h: number, seed: number, j = 5) => {
  const r = mulberry(seed);
  const pts: string[] = [];
  const n = Math.max(4, Math.round(w / 40)), m = Math.max(4, Math.round(h / 40));
  for (let i = 0; i <= n; i++) pts.push(`${x + (w * i) / n},${y + (r() - 0.5) * j}`);
  for (let i = 0; i <= m; i++) pts.push(`${x + w + (r() - 0.5) * j},${y + (h * i) / m}`);
  for (let i = n; i >= 0; i--) pts.push(`${x + (w * i) / n},${y + h + (r() - 0.5) * j}`);
  for (let i = m; i >= 0; i--) pts.push(`${x + (r() - 0.5) * j},${y + (h * i) / m}`);
  return `M${pts.join(" L")} Z`;
};

type Cam = { z: number; x: number; y: number };
const L = (c: Cam, d: number) => {
  const s = 1 + (c.z - 1) * d;
  return `translate(540 960) scale(${s.toFixed(4)}) translate(${(-540 + c.x * d).toFixed(2)} ${(-960 + c.y * d).toFixed(2)})`;
};

// ---------- defs: bayangan jatuh panjang searah (key light kiri-atas) + rim ----------
const Defs: React.FC = () => (
  <defs>
    <filter id="pp" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="2" dy="3" stdDeviation="0.5" floodColor="#1e120a" floodOpacity="0.6" result="edge" />
      <feDropShadow in="edge" dx="34" dy="42" stdDeviation="7" floodColor="#24140b" floodOpacity="0.62" />
    </filter>
    <filter id="ppS" x="-15%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="18" dy="24" stdDeviation="4" floodColor="#24140b" floodOpacity="0.55" />
    </filter>
    <filter id="blur30"><feGaussianBlur stdDeviation="30" /></filter>
    <radialGradient id="lampGlow"><stop offset="0" stopColor={C.lamp} stopOpacity="0.95" /><stop offset="0.45" stopColor={C.lamp} stopOpacity="0.35" /><stop offset="1" stopColor={C.lamp} stopOpacity="0" /></radialGradient>
    <radialGradient id="moonGlow"><stop offset="0" stopColor="#CFE0FF" stopOpacity="0.9" /><stop offset="0.5" stopColor="#9FB6E0" stopOpacity="0.3" /><stop offset="1" stopColor="#9FB6E0" stopOpacity="0" /></radialGradient>
    <radialGradient id="sunGlow"><stop offset="0" stopColor="#FFF1C9" /><stop offset="0.35" stopColor="#FFD27A" stopOpacity="0.8" /><stop offset="1" stopColor="#F2B880" stopOpacity="0" /></radialGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stopColor="#FFF0C4" stopOpacity="0.75" /><stop offset="1" stopColor="#FFE0A0" stopOpacity="0" /></linearGradient>
    <linearGradient id="rayN" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stopColor="#D8E6FF" stopOpacity="0.55" /><stop offset="1" stopColor="#B8CBEE" stopOpacity="0" /></linearGradient>
    <linearGradient id="woodG" x1="0" x2="1"><stop offset="0" stopColor="#5E3B28" /><stop offset="0.35" stopColor={C.woodL} /><stop offset="0.7" stopColor={C.wood} /><stop offset="1" stopColor="#4A2E1F" /></linearGradient>
  </defs>
);

const Grain: React.FC = () => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }}>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.9 0" /></filter>
    <rect width="1080" height="1920" filter="url(#grain)" />
    <filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="21" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 1.4 -0.35" /></filter>
    <rect width="1080" height="1920" filter="url(#mottle)" opacity="0.9" />
    <filter id="fiber"><feTurbulence type="turbulence" baseFrequency="0.02 0.6" numOctaves="2" seed="5" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.7 -0.1" /></filter>
    <rect width="1080" height="1920" filter="url(#fiber)" opacity="0.6" />
  </svg>
);

const KeyLight: React.FC<{ night?: boolean }> = ({ night }) => (
  <>
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "soft-light", background: night ? "linear-gradient(140deg, rgba(200,220,255,0.7) 0%, rgba(150,170,220,0.2) 38%, rgba(10,10,30,0) 60%, rgba(10,10,30,0.6) 100%)" : "linear-gradient(140deg, rgba(255,226,160,0.85) 0%, rgba(255,210,130,0.25) 38%, rgba(40,20,10,0) 60%, rgba(40,20,10,0.55) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", background: night ? "radial-gradient(ellipse 60% 38% at 30% 22%, rgba(170,200,255,0.32) 0%, rgba(120,150,220,0.1) 45%, rgba(0,0,0,0) 75%)" : "radial-gradient(ellipse 60% 38% at 30% 22%, rgba(255,214,140,0.42) 0%, rgba(255,190,110,0.14) 45%, rgba(0,0,0,0) 75%)" }} />
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "multiply", background: "radial-gradient(ellipse 80% 66% at 42% 42%, rgba(0,0,0,0) 48%, rgba(40,22,12,0.72) 100%)" }} />
  </>
);

/** Tiang + tirai kertas depan, blur, parallax lebih cepat (FG). */
const ForeFrame: React.FC<{ lt: number; i: number; dark?: boolean }> = ({ lt, i, dark }) => {
  const px = Math.sin(lt * 0.45 + i) * 70;
  const col = dark ? "#151827" : "#3a2418";
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", filter: "blur(8px)" }}>
      <g transform={`translate(${px.toFixed(1)} 0)`} opacity="0.9">
        <rect x="-150" y="-50" width="150" height="2100" fill={col} />
        <path d="M0,-50 Q90,500 30,1100 Q-10,1500 40,2050 L0,2050 Z" fill={dark ? "#2a2440" : "#8a3a24"} />
        <rect x="1030" y="-50" width="190" height="2100" fill={col} />
        <path d="M0,1780 Q540,1700 1080,1790 L1080,2000 L0,2000 Z" fill={col} />
      </g>
    </svg>
  );
};

// ---------- objek kertas ----------
const Stars: React.FC<{ t: number; n?: number; seed?: number; h?: number }> = ({ t, n = 50, seed = 3, h = 1000 }) => {
  const r = mulberry(seed);
  return <g>{Array.from({ length: n }, (_, i) => { const x = r() * 1200 - 60, y = r() * h, s = 2 + r() * 4, ph = r() * 6.28; return <circle key={i} cx={x} cy={y} r={s} fill="#FFF3D6" opacity={0.45 + 0.45 * Math.sin(t * 2.2 + ph) ** 2} />; })}</g>;
};

/** Ruang singgasana: dinding, lengkung, jendela mihrab, lantai. night = cahaya bulan. */
const Hall: React.FC<{ c: Cam; night?: number; t: number; dawn?: boolean }> = ({ c, night = 0, t, dawn }) => {
  const wall = night > 0.5 ? "#4C5878" : C.wall;
  const wallD = night > 0.5 ? "#36405E" : C.wallD;
  return (
    <>
      <g transform={L(c, 0.15)}>
        <rect x="-300" y="-300" width="1680" height="2600" fill={wallD} />
        {[90, 540, 990].map((x, i) => (
          <g key={i} filter="url(#pp)">
            <path d={`M${x - 190},1300 L${x - 190},520 Q${x},250 ${x + 190},520 L${x + 190},1300 Z`} fill={wall} />
            <path d={`M${x - 150},1300 L${x - 150},560 Q${x},330 ${x + 150},560 L${x + 150},1300 Z`} fill={i === 1 ? (night > 0.5 ? "#1D2540" : dawn ? "#F7C98A" : "#F4D9A6") : wallD} />
          </g>
        ))}
        {/* jendela mihrab tengah: langit di baliknya */}
        <g>
          {night > 0.5 ? <><Stars t={t} n={24} seed={7} h={900} /><circle cx="590" cy="560" r="44" fill="#EEF3FF" /><circle cx="608" cy="548" r="40" fill="#1D2540" /></> : <circle cx="540" cy="620" r="90" fill="url(#sunGlow)" />}
        </g>
        {/* pita ornamen */}
        <rect x="-300" y="380" width="1680" height="26" fill={night > 0.5 ? "#6A7AA4" : C.ochre} opacity="0.75" />
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${-300 + i * 80},393 l20,-13 l20,13 l-20,13 Z`} fill={night > 0.5 ? "#9AAAD0" : C.terra} opacity="0.8" />)}
      </g>
      {/* sinar jendela diagonal jatuh ke singgasana */}
      <g transform={L(c, 0.35)} opacity={0.85}>
        <path d="M460,520 L640,520 L900,1330 L360,1330 Z" fill={night > 0.5 ? "url(#rayN)" : "url(#ray)"} filter="url(#blur30)" />
      </g>
      <g transform={L(c, 0.6)}>
        <path d="M-300,1260 L1380,1260 L1380,2400 L-300,2400 Z" fill={night > 0.5 ? "#3A4566" : "#D7B484"} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-300 + i * 220},1260 L${-900 + i * 420},2400`} stroke={night > 0.5 ? "#2E3858" : "#C29E70"} strokeWidth="5" />)}
        {[1330, 1440, 1600].map((y) => <rect key={y} x="-300" y={y} width="1680" height="4" fill={night > 0.5 ? "#2E3858" : "#C29E70"} />)}
      </g>
    </>
  );
};

/** Singgasana kosong bertingkat (tanpa sosok, tanpa jubah). */
const Throne: React.FC<{ x: number; y: number; s?: number; glow?: number; night?: boolean }> = ({ x, y, s = 1, glow = 1, night }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="0" cy="-260" r="330" fill="url(#lampGlow)" opacity={0.55 * glow} />
    <g filter="url(#pp)">
      <rect x="-300" y="-40" width="600" height="44" fill={night ? "#6B5A6E" : "#B07D56"} />
      <rect x="-240" y="-82" width="480" height="44" fill={night ? "#7C6A7C" : "#C28E62"} />
      <rect x="-180" y="-124" width="360" height="44" fill={night ? "#8C7A8A" : "#D3A070"} />
      {/* sandaran berbentuk lengkung mihrab */}
      <path d="M-130,-124 L-130,-420 Q0,-560 130,-420 L130,-124 Z" fill={night ? "#7A3E3A" : C.terra} />
      <path d="M-100,-150 L-100,-400 Q0,-510 100,-400 L100,-150 Z" fill={night ? "#5E2E2C" : "#A64E2E"} />
      <path d="M-100,-400 Q0,-510 100,-400" stroke={C.gold} strokeWidth="8" fill="none" />
      <circle cx="0" cy="-430" r="18" fill={C.gold} />
      <rect x="-160" y="-210" width="320" height="40" rx="8" fill={night ? "#8C6A4A" : C.ochre} />
      <rect x="-170" y="-260" width="34" height="140" rx="8" fill={C.gold} />
      <rect x="136" y="-260" width="34" height="140" rx="8" fill={C.gold} />
    </g>
    {/* rim highlight tepi atas (ketebalan karton) */}
    <path d="M-300,-40 L300,-40 M-240,-82 L240,-82 M-180,-124 L180,-124" stroke="#FFE9C0" strokeWidth="3" opacity="0.7" />
  </g>
);

/** Tongkat kayu (minsa'ah) berlekuk di atas. eaten = lubang rayap tampak, crack = retak, len px. */
const Staff: React.FC<{ x: number; y: number; rot?: number; s?: number; crack?: number; eaten?: number; len?: number }> = ({ x, y, rot = -6, s = 1, crack = 0, eaten = 0, len = 640 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <g filter="url(#pp)">
      <rect x="-13" y={-len} width="26" height={len} rx="10" fill="url(#woodG)" />
      <path d={`M0,${-len + 6} Q0,${-len - 70} 52,${-len - 70} Q96,${-len - 66} 92,${-len - 22}`} stroke={C.wood} strokeWidth="24" fill="none" strokeLinecap="round" />
      {[0.25, 0.55, 0.8].map((k) => <ellipse key={k} cx="0" cy={-len * k} rx="16" ry="7" fill="#5E3B28" />)}
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-6 + (i % 3) * 5},${-len * (0.1 + i * 0.14)} q2,40 0,80`} stroke="#4A2E1F" strokeWidth="2" opacity="0.5" fill="none" />)}
      {eaten > 0 ? Array.from({ length: 9 }, (_, i) => <circle key={i} cx={(i % 2 ? 4 : -5)} cy={-len * (0.08 + i * 0.09)} r={2 + 4 * eaten} fill="#2a170d" opacity={clamp(eaten * 1.4 - i * 0.08)} />) : null}
      {crack > 0 ? <path d={`M-13,${-len * 0.38} L2,${-len * 0.4} L-6,${-len * 0.43} L13,${-len * 0.45}`} stroke="#1a0d06" strokeWidth={3 + crack * 3} fill="none" opacity={crack} /> : null}
    </g>
    <rect x="-13" y={-len} width="6" height={len} rx="3" fill="#E8C79E" opacity="0.55" />
  </g>
);

/** Jin: siluet kertas gelap berlapis, tanpa wajah, tepi potong + garis lipat. carry = memikul batu. */
const Jinn: React.FC<{ x: number; y: number; s?: number; t: number; carry?: boolean; flip?: boolean; freeze?: number; ph?: number }> = ({ x, y, s = 1, t, carry = true, flip, freeze = 0, ph = 0 }) => {
  const w = (1 - freeze) * Math.sin(t * 5 + ph);
  const bob = Math.abs(w) * 8;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${flip ? -s : s} ${s})`} filter="url(#ppS)">
      <path d={`M-30,0 L${-22 + w * 14},-120 L-4,-120 L${-8 - w * 6},0 Z`} fill={C.jinnD} />
      <path d={`M8,0 L${4 - w * 14},-120 L24,-120 L${32 + w * 6},0 Z`} fill={C.jinnD} />
      <path d="M-48,-110 L-34,-250 L34,-250 L48,-110 Q0,-96 -48,-110 Z" fill={C.jinn} />
      <path d="M0,-250 L-6,-110" stroke="#5A5274" strokeWidth="3" />
      <path d="M-34,-250 L-48,-110" stroke="#6A6290" strokeWidth="2" opacity="0.7" />
      <path d="M-26,-262 L-34,-300 L-14,-330 L14,-330 L34,-300 L26,-262 Z" fill={C.jinn} />
      <path d="M-14,-330 L0,-300 L14,-330" stroke="#5A5274" strokeWidth="3" fill="none" />
      {carry ? (
        <>
          <path d="M-34,-240 L-60,-330 L-40,-348 L-20,-250 Z" fill={C.jinnD} />
          <path d="M34,-240 L60,-330 L40,-348 L20,-250 Z" fill={C.jinnD} />
          <g transform={`translate(0 ${-372 + freeze * 300}) rotate(${freeze * 25})`}>
            <rect x="-80" y="-40" width="160" height="70" fill={C.stone} />
            <rect x="-80" y="-40" width="160" height="10" fill="#D9C8B0" />
            <path d="M-40,-30 l10,50 M30,-30 l-6,50" stroke="#8C7860" strokeWidth="3" />
          </g>
        </>
      ) : (
        <>
          <path d={`M-34,-240 L${-70},${-160 - w * 20} L-56,-150 L-24,-230 Z`} fill={C.jinnD} />
          <path d={`M34,-240 L${70},${-160 + w * 20} L56,-150 L24,-230 Z`} fill={C.jinnD} />
        </>
      )}
    </g>
  );
};

const Tower: React.FC<{ x: number; y: number; h: number; s?: number; scaffold?: boolean; tint?: string }> = ({ x, y, h, s = 1, scaffold = true, tint = "#D8B48A" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#pp)">
      <rect x="-90" y={-h} width="180" height={h} fill={tint} />
      {Array.from({ length: Math.floor(h / 60) }, (_, i) => <rect key={i} x="-90" y={-h + i * 60} width="180" height="4" fill="#A8845E" opacity="0.6" />)}
      <path d={`M-110,${-h} L110,${-h} L0,${-h - 120} Z`} fill={C.terra} />
      <rect x="-24" y={-h + 60} width="48" height="70" rx="24" fill="#5B3A29" opacity="0.75" />
    </g>
    <rect x="-90" y={-h} width="8" height={h} fill="#FFE9C0" opacity="0.5" />
    {scaffold ? <g stroke="#7A4F37" strokeWidth="7">{Array.from({ length: Math.floor(h / 120) + 1 }, (_, i) => <g key={i}><line x1="-120" y1={-i * 120} x2="120" y2={-i * 120} /><line x1="-120" y1={-i * 120} x2="120" y2={-(i + 1) * 120} /></g>)}<line x1="-120" y1="0" x2="-120" y2={-h} /><line x1="120" y1="0" x2="120" y2={-h} /></g> : null}
  </g>
);

const Termite: React.FC<{ x: number; y: number; a: number; s?: number; t: number }> = ({ x, y, a, s = 1, t }) => {
  const w = Math.sin(t * 18) * 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} filter="url(#ppS)">
      {[-14, 0, 14].map((k, i) => <g key={k}><line x1={k} y1="0" x2={k + (i % 2 ? w : -w)} y2="-26" stroke="#6B4A2A" strokeWidth="4" /><line x1={k} y1="0" x2={k + (i % 2 ? -w : w)} y2="26" stroke="#6B4A2A" strokeWidth="4" /></g>)}
      <ellipse cx="-30" cy="0" rx="22" ry="15" fill="#F0DDB0" />
      <ellipse cx="2" cy="0" rx="16" ry="13" fill="#EBD3A0" />
      <ellipse cx="30" cy="0" rx="17" ry="15" fill={C.ochre} />
      <path d="M44,-6 L60,-12 M44,6 L60,12" stroke="#6B4A2A" strokeWidth="4" />
      <path d="M-46,-4 Q-30,-14 -14,-6" stroke="#FFF6DA" strokeWidth="3" fill="none" />
    </g>
  );
};

// ---------- HUD ----------
const Card: React.FC<{ t: number; at: number; out?: number; x?: number; y: number; w?: number; dark?: boolean; children: React.ReactNode; rot?: number }> = ({ t, at, out = 1e9, x = 540, y, w = 880, dark, children, rot = 0 }) => {
  const sIn = pop(t, at);
  const kOut = lin(t, out, out + 0.25);
  if (sIn <= 0 || kOut >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top: y, width: w, transform: `scale(${sIn * (1 - kOut * 0.1)}) rotate(${rot}deg)`, opacity: clamp(lin(t, at, at + 0.18)) * (1 - kOut),
      background: dark ? "rgba(52,40,58,0.95)" : C.cream, color: dark ? C.cream : C.brown, borderRadius: 10, padding: "24px 32px",
      boxShadow: "18px 24px 0 rgba(40,24,14,0.42), inset 0 5px 0 rgba(255,244,220,0.5), inset 0 -8px 0 rgba(60,36,20,0.22)", border: `4px solid ${dark ? C.ochre : C.terra}`, textAlign: "center", boxSizing: "border-box",
    }}>{children}</div>
  );
};
const Kicker: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = "#8A3A1C" }) => <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, letterSpacing: 3, color: c, textTransform: "uppercase" }}>{children}</div>;
const Big: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 66, c }) => <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: size, lineHeight: 1.12, color: c }}>{children}</div>;
const Body: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 36 }) => <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: size, lineHeight: 1.3, marginTop: 8 }}>{children}</div>;
const Arab: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 64, c = C.brown }) => <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: size, direction: "rtl", lineHeight: 1.6, color: c }}>{children}</div>;

type SP = { t: number };
const Svg: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: bg }}><Defs />{children}</svg>
);

// ---------- Adegan ----------
/** S1 Hook: singgasana kosong, tongkat bersandar dalam sinar; jin lewat memikul batu; rayap kecil. */
const S1: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1.0, 1.28, ease(t, 0, 7.6)), x: mix(0, -90, ease(t, 0, 7.6)), y: mix(0, 40, ease(t, 0, 7.6)) };
  const termite = ease(t, 6.0, 6.5);
  return (
    <AbsoluteFill>
      <Svg bg={C.wallD}>
        <Hall c={c} t={t} />
        <g transform={L(c, 0.6)}>
          <Jinn x={mix(150, 330, lin(t, 0, 7.6))} y={1270} s={0.8} t={t} ph={1} />
          <Jinn x={mix(960, 880, lin(t, 0, 7.6))} y={1270} s={0.76} t={t} flip ph={2.3} />
        </g>
        <g transform={L(c, 0.8)}>
          <Throne x={540} y={1300} s={1.0} />
          <Staff x={740} y={1300} rot={-7} />
          <g opacity={termite} transform={`translate(744 ${1290 - termite * 30})`}>
            <circle r="70" fill="none" stroke={C.mint} strokeWidth="6" strokeDasharray="12 10" transform={`rotate(${t * 40})`} />
            <Termite x={0} y={0} a={-90} s={0.8} t={t} />
          </g>
        </g>
        <g transform={L(c, 1.1)}>
          <Jinn x={mix(1300, -200, lin(t, 1.0, 7.6))} y={1700} s={1.15} t={t} ph={0.5} />
        </g>
      </Svg>
      <Card t={t} at={0.3} out={3.4} y={250} w={820} dark><Big size={84} c={C.cream}>Ia sudah wafat…</Big></Card>
      <Card t={t} at={3.5} y={250} w={900} dark><Kicker c={C.ochre}>tapi</Kicker><Big size={70} c={C.cream}>tak satu jin pun tahu</Big><div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.mint, marginTop: 10, opacity: termite }}>…kecuali seekor rayap</div></Card>
    </AbsoluteFill>
  );
};

/** S2a Kerajaan: angin tunduk, jin membangun menara dan menyelam; prasasti AUDIRA. */
const S2a: React.FC<SP> = ({ t }) => {
  const k = ease(t, 7.6, 18.8);
  const c: Cam = { z: mix(1.15, 1.0, k), x: mix(120, -120, k), y: mix(-40, 30, k) };
  const wind = ease(t, 13.2, 13.8);
  const r = mulberry(5);
  return (
    <AbsoluteFill>
      <Svg bg="linear-gradient(#9FC7D8, #F2DDB0 70%)">
        <g transform={L(c, 0.12)}>
          <circle cx="820" cy="420" r="160" fill="url(#sunGlow)" />
          {Array.from({ length: 5 }, (_, i) => {
            const cx = ((r() * 1400 + (t - 7.6) * (40 + wind * 260)) % 1500) - 200, cy = 260 + r() * 500;
            return <g key={i} filter="url(#ppS)"><path d={`M${cx},${cy} a50,50 0 0,1 90,-25 a60,60 0 0,1 110,10 a40,40 0 0,1 40,50 Z`} fill="#FFF6E2" /></g>;
          })}
          {Array.from({ length: 7 }, (_, i) => { const yy = 320 + i * 90; const off = ((t - 13.2) * 700 + i * 260) % 1700 - 300; return <path key={i} d={`M${off},${yy} q120,-40 240,0 t240,0`} stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round" opacity={wind * 0.8} />; })}
        </g>
        <g transform={L(c, 0.3)} filter="url(#pp)"><path d={ridge(1080, 50, 21, 2)} fill="#C9A27A" /></g>
        <g transform={L(c, 0.5)}>
          <Tower x={260} y={1220} h={mix(320, 520, ease(t, 8, 18))} s={0.9} />
          <Tower x={800} y={1220} h={mix(260, 460, ease(t, 9, 18))} s={0.85} tint="#E2C08F" />
          {/* kubah istana */}
          <g filter="url(#pp)"><rect x="430" y="900" width="220" height="320" fill="#E8C99A" /><path d="M420,905 Q540,700 660,905 Z" fill={C.gold} /><rect x="535" y="660" width="10" height="70" fill={C.brown} /></g>
        </g>
        <g transform={L(c, 0.75)}>
          <path d={ridge(1260, 18, 23, 1.2)} fill="#D9B07A" filter="url(#pp)" />
          {/* kolam penyelam */}
          <g filter="url(#pp)"><ellipse cx="820" cy="1330" rx="230" ry="60" fill="#5FA3B8" /></g>
          <ellipse cx="820" cy="1322" rx="200" ry="40" fill={C.mint} opacity="0.55" />
          {[0, 1].map((i) => { const dv = (Math.sin(t * 1.8 + i * 3) + 1) / 2; return <g key={i} opacity={ease(t, 15.0, 15.6)}><Jinn x={760 + i * 120} y={1340 + dv * 40} s={0.45} t={t} carry={false} ph={i} /><circle cx={760 + i * 120} cy={1300 - dv * 60} r="10" fill="#FFF8E8" /></g>; })}
          <Jinn x={mix(80, 380, lin(t, 7.6, 18.8))} y={1300} s={0.7} t={t} />
          <Jinn x={mix(420, 160, lin(t, 7.6, 18.8))} y={1320} s={0.66} t={t} flip ph={1.7} />
        </g>
        <g transform={L(c, 1)}>
          {/* prasasti batu AUDIRA (brand dalam adegan) */}
          <g transform="translate(560 1190)" filter="url(#pp)">
            <path d={torn(-200, -140, 400, 170, 41, 8)} fill="#A99583" />
            <path d="M-200,-140 L200,-140" stroke="#D8C6AE" strokeWidth="5" />
            <text x="0" y="-50" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize="64" fill="#4a3a2e" letterSpacing="10">AUDIRA</text>
          </g>
        </g>
      </Svg>
      <Card t={t} at={7.9} out={13.1} y={250} w={920}><Kicker>Putra Nabi Dawud</Kicker><Big size={70}>Nabi Sulaiman</Big><Body>kerajaan yang tak dimiliki siapa pun sesudahnya · QS 38:35</Body></Card>
      <Card t={t} at={13.3} out={15.1} y={250} w={760} dark><Kicker c={C.ochre}>QS Shad 38:36</Kicker><Big size={68} c={C.cream}>Angin tunduk</Big></Card>
      <Card t={t} at={15.2} y={250} w={900} dark><Kicker c={C.ochre}>QS Saba 34:12 · QS Shad 38:37</Kicker><Big size={56} c={C.cream}>Jin bekerja · dengan izin Tuhannya</Big><Body>ahli bangunan dan penyelam</Body></Card>
    </AbsoluteFill>
  );
};

/** S2b Karya jin: 4 kartu objek (gedung, patung, piring sebesar kolam, periuk) + ayat syukur. */
const S2b: React.FC<SP> = ({ t }) => {
  const k = ease(t, 18.8, 30.0);
  const c: Cam = { z: mix(1.0, 1.12, k), x: Math.sin(t * 0.4) * 30, y: mix(40, -60, k) };
  const items: [string, number][] = [["gedung tinggi", 19.9], ["patung", 21.4], ["piring sebesar kolam", 22.3], ["periuk di atas tungku", 23.9]];
  const ayah = ease(t, 25.4, 26.2);
  const icon = (i: number) => {
    if (i === 0) return <g><rect x="-50" y="-120" width="100" height="160" fill="#E2C08F" /><path d="M-62,-120 L62,-120 L0,-180 Z" fill={C.terra} /><rect x="-16" y="-60" width="32" height="60" rx="16" fill={C.brown} /></g>;
    if (i === 1) return <g><rect x="-60" y="10" width="120" height="30" fill="#8C7A6A" /><path d="M-36,10 L-28,-110 L28,-110 L36,10 Z" fill="#B9A48C" /><circle cx="0" cy="-140" r="32" fill="#B9A48C" /><path d="M-28,-110 L-60,-60 M28,-110 L60,-60" stroke="#9C8870" strokeWidth="14" /></g>;
    if (i === 2) return <g><ellipse cx="0" cy="0" rx="110" ry="34" fill="#C28E62" /><ellipse cx="0" cy="-10" rx="96" ry="24" fill="#5FA3B8" /><path d="M-110,0 Q0,70 110,0" fill="#A06F4A" /></g>;
    return <g><path d="M-70,-90 Q-90,0 -50,30 L50,30 Q90,0 70,-90 Z" fill="#6E5A4A" /><rect x="-80" y="-104" width="160" height="20" rx="8" fill="#5B4636" /><rect x="-70" y="34" width="140" height="22" fill="#4A3628" />{[-40, 0, 40].map((x) => <path key={x} d={`M${x},60 q-10,20 0,40 q10,20 0,30`} stroke={C.terra} strokeWidth="10" fill="none" />)}</g>;
  };
  return (
    <AbsoluteFill>
      <Svg bg="linear-gradient(#EED8AE, #DDBE8E)">
        <g transform={L(c, 0.2)}>
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={torn(-100 + (i % 3) * 430, 80 + Math.floor(i / 3) * 560, 400, 500, 60 + i, 8)} fill={i % 2 ? "#E6CFA4" : "#EFDDB9"} />)}
        </g>
        <g transform={L(c, 0.4)}>
          <Tower x={140} y={1250} h={520} s={0.8} scaffold={false} />
          <Tower x={950} y={1250} h={600} s={0.8} scaffold={false} tint="#E2C08F" />
        </g>
        <g transform={L(c, 0.75)}>
          <rect x="-300" y="1240" width="1680" height="900" fill="#C9A27A" filter="url(#pp)" />
          {items.map(([lab, at], i) => {
            const a = ease(t, at - 0.2, at + 0.4);
            const x = 210 + (i % 2) * 660 * 0 + i * 220;
            const y = 1180 - (i % 2) * 40;
            return (
              <g key={lab} transform={`translate(${x} ${y + (1 - a) * 200}) scale(${0.6 + a * 0.4})`} opacity={a}>
                <g filter="url(#pp)">
                  <path d={torn(-100, -260, 200, 300, 80 + i, 6)} fill={C.cream} />
                  <path d={torn(-86, -246, 172, 272, 90 + i, 3)} fill="none" stroke={i === 2 ? C.mint : C.ochre} strokeWidth="5" />
                </g>
                <g transform="translate(0 -100) scale(0.75)">{icon(i)}</g>
              </g>
            );
          })}
          {[0, 1, 2].map((i) => <Jinn key={i} x={mix(-100 + i * 80, 1180, lin(t, 18.8 + i * 1.5, 30))} y={1420 + i * 30} s={0.7} t={t} ph={i * 2} />)}
        </g>
      </Svg>
      <Card t={t} at={19.0} out={25.2} y={250} w={920}>
        <Kicker>QS Saba 34:13 · karya para jin</Kicker>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 10 }}>
          {items.map(([lab, at]) => <span key={lab} style={{ fontFamily: INTER, fontWeight: 800, fontSize: 44, padding: "6px 14px", borderRadius: 8, background: t >= at ? C.terra : "#E8D6B6", color: t >= at ? C.cream : C.brown }}>{lab}</span>)}
        </div>
      </Card>
      <div style={{ position: "absolute", left: 60, right: 60, top: 250, textAlign: "center", opacity: ayah, transform: `scale(${0.92 + ayah * 0.08})`, background: "rgba(52,40,58,0.95)", borderRadius: 12, padding: "22px 20px", border: `4px solid ${C.gold}`, boxShadow: "16px 20px 0 rgba(40,24,14,0.35)" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, color: C.ochre, letterSpacing: 3 }}>QS SABA 34:13</div>
        <Arab size={84} c="#FFE7A8">ٱعْمَلُوٓا۟ ءَالَ دَاوُۥدَ شُكْرًا</Arab>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: 50, color: C.cream }}>"Bekerjalah, wahai keluarga Dawud, untuk bersyukur"</div>
      </div>
    </AbsoluteFill>
  );
};

/** S3 Wafat: mihrab malam, singgasana kosong, tongkat berdiri, lampu meredup. */
const S3: React.FC<SP> = ({ t }) => {
  const k = ease(t, 30.0, 36.3);
  const c: Cam = { z: mix(1.05, 1.45, k), x: mix(0, -180, k), y: mix(0, 80, k) };
  const dim = ease(t, 30.6, 33.0);
  return (
    <AbsoluteFill>
      <Svg bg={C.nightA}>
        <Hall c={c} t={t} night={1} />
        <g transform={L(c, 0.8)}>
          <Throne x={540} y={1300} night glow={1 - dim * 0.75} />
          <Staff x={740} y={1300} rot={-7} />
          {/* lampu minyak di anak tangga */}
          <g transform="translate(330 1258)" filter="url(#ppS)">
            <circle cx="0" cy="-60" r={140 * (1 - dim * 0.6)} fill="url(#lampGlow)" opacity={1 - dim * 0.7} />
            <path d="M-50,0 Q-60,-30 -20,-36 L40,-36 Q70,-30 60,-10 L30,0 Z" fill={C.gold} />
            <ellipse cx="50" cy="-50" rx={8 * (1 - dim * 0.7)} ry={18 * (1 - dim * 0.7)} fill="#FFF1C9" />
          </g>
        </g>
      </Svg>
      <Card t={t} at={30.2} out={32.3} y={250} w={920} dark>
        <Kicker c={C.ochre}>QS Saba 34:14</Kicker>
        <Arab size={74} c="#FFE7A8">فَلَمَّا قَضَيْنَا عَلَيْهِ ٱلْمَوْتَ</Arab>
        <Body>"Ketika Kami menetapkan kematiannya…"</Body>
      </Card>
      <Card t={t} at={32.5} y={250} w={880}><Kicker>Para mufassir · Ibnu Katsir</Kicker><Big size={64}>Wafat bersandar pada tongkatnya</Big></Card>
    </AbsoluteFill>
  );
};

/** S4 Waktu berlalu: siang-malam berputar, jin terus memikul batu, kalender terbang, ± SETAHUN. */
const S4: React.FC<SP> = ({ t }) => {
  const lt = t - T.s4;
  const c: Cam = { z: 1.08, x: mix(160, -160, ease(t, 36.3, 45.6)), y: 0 };
  const spin = ease(t, 39.3, 45.6) * 4 * Math.PI * 2 + Math.PI * 0.15;
  const day = (Math.cos(spin) + 1) / 2;
  const sky = `rgb(${Math.round(mix(40, 236, day))},${Math.round(mix(52, 206, day))},${Math.round(mix(90, 160, day))})`;
  const cal = ease(t, 39.5, 45.4);
  return (
    <AbsoluteFill>
      <Svg bg={sky}>
        <g transform={L(c, 0.1)}>
          <g opacity={1 - day}><Stars t={t} n={50} seed={41} h={1000} /></g>
          <g transform={`rotate(${(spin * 180) / Math.PI} 540 1200)`}>
            <circle cx="540" cy="420" r="200" fill="url(#sunGlow)" />
            <circle cx="540" cy="420" r="80" fill="#FFF1C9" filter="url(#ppS)" />
            <circle cx="540" cy="1980" r="70" fill="#EEF3FF" filter="url(#ppS)" />
            <circle cx="566" cy="1966" r="62" fill={sky} />
          </g>
        </g>
        <g transform={L(c, 0.3)} filter="url(#pp)"><path d={ridge(1060, 50, 51, 2)} fill={day > 0.5 ? "#C9A27A" : "#4E4A6A"} /></g>
        <g transform={L(c, 0.5)}>
          <Tower x={300} y={1230} h={mix(360, 640, ease(t, 36.3, 45.6))} s={0.85} tint={day > 0.5 ? "#D8B48A" : "#7A7090"} />
          <Tower x={780} y={1230} h={mix(300, 560, ease(t, 37, 45.6))} s={0.8} tint={day > 0.5 ? "#E2C08F" : "#8A80A0"} />
        </g>
        <g transform={L(c, 0.8)}>
          <path d={ridge(1260, 16, 53, 1)} fill={day > 0.5 ? "#D9B07A" : "#5E5A7A"} filter="url(#pp)" />
          {[0, 1, 2, 3].map((i) => <Jinn key={i} x={((lt * 90 + i * 320) % 1400) - 160} y={1300 + (i % 2) * 40} s={0.72} t={t} flip={i % 2 === 1} ph={i * 1.3} />)}
        </g>
        <g transform={L(c, 1)}>
          {/* tongkat tetap berdiri di tepi frame: objek pembawa */}
          <g opacity="0.95"><Staff x={1000} y={1720} rot={-4} s={1.1} /></g>
          <circle cx="980" cy="1080" r="120" fill="url(#lampGlow)" opacity="0.35" />
        </g>
        {/* lembar kalender beterbangan */}
        {cal > 0 ? Array.from({ length: 9 }, (_, i) => {
          const f = clamp(cal * 9 - i);
          if (f <= 0) return null;
          const x = mix(540, 120 + ((i * 197) % 840), f), y = mix(820, 720 + ((i * 113) % 360), f);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(i % 2 ? 1 : -1) * f * 60})`} opacity={1 - f * 0.2} filter="url(#ppS)">
              <rect x="-60" y="-70" width="120" height="140" fill="#4A3426" />
              <rect x="-60" y="-70" width="120" height="34" fill={C.red} />
              <text x="0" y="40" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize="56" fill={C.cream} style={{ color: C.cream }}>{(i * 37) % 30 + 1}</text>
            </g>
          );
        }) : null}
      </Svg>
      <Card t={t} at={36.5} out={39.2} y={250} w={860} dark><Kicker c={C.ochre}>Para jin</Kicker><Big size={64} c={C.cream}>tidak menyadarinya</Big></Card>
      <Card t={t} at={39.4} out={41.9} y={250} w={760}><Big size={64}>Siang · malam · bulan</Big></Card>
      <Card t={t} at={42.1} y={240} w={880} dark><Kicker c={C.ochre}>Menurut para mufassir</Kicker><Big size={120} c={C.gold}>± SETAHUN</Big></Card>
    </AbsoluteFill>
  );
};

/** S5 Rayap: penampang tongkat raksasa, lorong-lorong terbuka, rayap menggerogoti dari dalam. */
const S5: React.FC<SP> = ({ t }) => {
  const zin = ease(t, 45.6, 46.4);
  const c: Cam = { z: mix(1.7, 1.0, zin) + (t - 45.6) * 0.012, x: 0, y: mix(0, -120, ease(t, 47, 53.3)) };
  const eat = ease(t, 46.2, 53.0);
  const r = mulberry(77);
  const tunnels = Array.from({ length: 7 }, (_, i) => {
    const x0 = 380 + r() * 320, y0 = 520 + i * 150;
    return `M${x0},${y0} q${(r() - 0.5) * 160},60 ${(r() - 0.5) * 80},130 t${(r() - 0.5) * 120},120`;
  });
  return (
    <AbsoluteFill>
      <Svg bg="#E9D6B0">
        <g transform={L(c, 0.2)}>
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-200 + i * 50},0 q${30 + (i % 4) * 10},960 0,1920`} stroke="#D2B88E" strokeWidth={6 + (i % 3) * 3} fill="none" opacity="0.6" />)}
        </g>
        <g transform={L(c, 0.7)}>
          {/* batang tongkat raksasa, sisi kiri dipotong menampakkan bagian dalam */}
          <g filter="url(#pp)">
            <rect x="300" y="300" width="480" height="1700" rx="60" fill="url(#woodG)" />
            <rect x="350" y="300" width="380" height="1700" fill="#D9AE7C" />
          </g>
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${370 + i * 30},300 q${(i % 2 ? 14 : -14)},850 0,1700`} stroke="#B98A5A" strokeWidth="4" fill="none" opacity="0.7" />)}
          {tunnels.map((d, i) => <path key={i} d={d} stroke="#3A2214" strokeWidth={34} strokeLinecap="round" fill="none" strokeDasharray="420" strokeDashoffset={420 * (1 - clamp(eat * 1.6 - i * 0.09))} />)}
          {tunnels.map((d, i) => <path key={`h${i}`} d={d} stroke="#6E4A2C" strokeWidth={10} strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="420" strokeDashoffset={420 * (1 - clamp(eat * 1.6 - i * 0.09))} transform="translate(-6 -6)" />)}
          {[0, 1, 2, 3, 4].map((i) => {
            const p = clamp(eat * 1.5 - i * 0.1);
            const x = 420 + ((i * 83) % 260) + Math.sin(t * 2 + i) * 30, y = 560 + i * 200 + p * 120;
            return <Termite key={i} x={x} y={y} a={90 + Math.sin(t * 3 + i) * 30} s={1.2} t={t + i} />;
          })}
          {/* serpih kayu jatuh */}
          {Array.from({ length: 10 }, (_, i) => { const yy = ((t - 45.6) * 220 + i * 190) % 1400 + 500; return <rect key={i} x={340 + ((i * 47) % 400)} y={yy} width="14" height="8" fill="#C79A66" transform={`rotate(${i * 37 + t * 90} ${340 + ((i * 47) % 400)} ${yy})`} opacity={eat} />; })}
        </g>
        <g transform={L(c, 1)}>
          <g transform="translate(850 980)" filter="url(#ppS)" opacity={ease(t, 47.0, 47.4)}>
            <rect x="-170" y="-62" width="340" height="132" rx="12" fill={C.cream} stroke={C.mint} strokeWidth="6" />
            <text x="0" y="-2" textAnchor="middle" fontFamily={AMIRI} fontWeight={700} fontSize="46" fill={C.brown}>مِنسَأَة</text>
            <text x="0" y="38" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="40" fill={C.brown}>= tongkat</text>
          </g>
          <g transform="translate(220 1180)" filter="url(#ppS)" opacity={ease(t, 49.3, 49.7)}>
            <rect x="-170" y="-62" width="340" height="132" rx="12" fill={C.cream} stroke={C.red} strokeWidth="6" />
            <text x="0" y="-2" textAnchor="middle" fontFamily={AMIRI} fontWeight={700} fontSize="40" fill={C.brown}>دَآبَّةُ ٱلْأَرْضِ</text>
            <text x="0" y="38" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="40" fill={C.brown}>= rayap</text>
          </g>
        </g>
      </Svg>
      <Card t={t} at={45.8} out={51.0} y={240} w={940}>
        <Kicker>QS Saba 34:14</Kicker>
        <Arab size={56}>إِلَّا دَآبَّةُ ٱلْأَرْضِ تَأْكُلُ مِنسَأَتَهُۥ</Arab>
        <Body>"…kecuali rayap yang memakan tongkatnya"</Body>
      </Card>
      <Card t={t} at={51.2} y={260} w={760} dark><Big size={68} c={C.cream}>Sedikit demi sedikit, <span style={{ color: C.mint }}>dari dalam</span></Big></Card>
    </AbsoluteFill>
  );
};

/** S6 Tersungkur: tongkat retak, patah, jatuh (tanpa tubuh); debu, cahaya padam, jin berhenti. */
const S6: React.FC<SP> = ({ t }) => {
  const crack = ease(t, 53.6, 55.4);
  const fall = ease(t, 55.6, 57.0);
  const hit = lin(t, 56.9, 57.6);
  const shake = t > 56.9 && t < 57.5 ? Math.sin(t * 90) * 10 * (1 - hit) : 0;
  const c: Cam = { z: mix(1.35, 1.15, ease(t, 53.3, 57.8)), x: -120 + shake, y: 60 };
  return (
    <AbsoluteFill>
      <Svg bg={C.nightA}>
        <Hall c={c} t={t} night={1} />
        <g transform={L(c, 0.65)}>
          <Jinn x={200} y={1290} s={0.66} t={t} freeze={hit} ph={1} />
          <Jinn x={930} y={1290} s={0.62} t={t} flip freeze={hit} ph={2} />
        </g>
        <g transform={L(c, 0.8)}>
          <Throne x={540} y={1300} night glow={0.25 * (1 - fall)} />
          {/* bagian bawah tongkat tetap sebentar, bagian atas jatuh */}
          <g opacity={1 - hit}><Staff x={740} y={1300} rot={-7 + fall * 4} len={250} eaten={1} /></g>
          <g transform={`translate(${740 - 30} ${1300 - 250}) rotate(${mix(0, 72, fall * fall)} 0 0)`}>
            <Staff x={0} y={0} rot={-7} len={390} crack={crack} eaten={1} />
          </g>
          {/* debu kertas */}
          {hit > 0 ? Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI; const d = hit * (120 + (i % 4) * 50); return <circle key={i} cx={980 + Math.cos(a) * d * 1.6} cy={1290 - Math.sin(a) * d * 0.6} r={10 + (i % 3) * 6} fill="#CFC2B0" opacity={(1 - hit) * 0.9} />; }) : null}
        </g>
      </Svg>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 0.25 * hit * (1 - lin(t, 57.4, 57.8)) }} />
    </AbsoluteFill>
  );
};

/** S7a Jin sadar: mihrab subuh, jin membeku, ayat 34:14 bagian akhir. */
const S7a: React.FC<SP> = ({ t }) => {
  const k = ease(t, 57.8, 63.9);
  const c: Cam = { z: mix(1.25, 1.0, k), x: mix(-60, 40, k), y: mix(40, 0, k) };
  return (
    <AbsoluteFill>
      <Svg bg="#8E7FA0">
        <Hall c={c} t={t} night={0} dawn />
        <g transform={L(c, 0.7)}>
          {[180, 330, 760, 910].map((x, i) => <Jinn key={i} x={x} y={1290 + (i % 2) * 20} s={0.7} t={t} freeze={1} flip={x > 540} />)}
          <Throne x={540} y={1300} glow={0.4} />
        </g>
        <g transform={L(c, 1)}>
          <Staff x={600} y={1430} rot={-84} len={250} eaten={1} />
          <Staff x={880} y={1460} rot={78} len={360} eaten={1} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: 240, textAlign: "center", opacity: ease(t, 58.0, 58.6), background: "rgba(52,40,58,0.95)", borderRadius: 12, padding: "22px 22px", border: `4px solid ${C.gold}`, boxShadow: "16px 20px 0 rgba(40,24,14,0.35)" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, color: C.ochre, letterSpacing: 3 }}>QS SABA 34:14</div>
        <Arab size={54} c="#FFE7A8">أَن لَّوْ كَانُوا۟ يَعْلَمُونَ ٱلْغَيْبَ مَا لَبِثُوا۟ فِى ٱلْعَذَابِ ٱلْمُهِينِ</Arab>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: C.cream, lineHeight: 1.3, opacity: ease(t, 59.6, 60.2) }}>"Sekiranya mereka mengetahui yang gaib, tentu mereka tidak tetap dalam siksa yang menghinakan"</div>
      </div>
    </AbsoluteFill>
  );
};

/** S7b Cek riwayat: lembar kitab kuno, dicap RIWAYAT ISRAILIYAT. */
const S7b: React.FC<SP> = ({ t }) => {
  const zoom = ease(t, 63.9, 64.5);
  const c: Cam = { z: mix(1.5, 1.0, zoom) + (t - 63.9) * 0.02, x: 0, y: 0 };
  const stamp = ease(t, 66.8, 67.05);
  return (
    <AbsoluteFill>
      <Svg bg="#DCC59C">
        <g transform={L(c, 0.3)}>
          <path d={torn(80, 320, 920, 1180, 121, 14)} fill="#EBDAB8" filter="url(#pp)" />
          {Array.from({ length: 13 }, (_, i) => <rect key={i} x={150} y={420 + i * 80} width={780 - (i % 4) * 90} height="10" rx="5" fill={C.brown} opacity="0.14" />)}
        </g>
        <g transform={L(c, 0.8)} opacity={1 - stamp * 0.4}>
          {/* ikon pohon kecil + jendela (tanpa sosok) sebagai tanda "kisah tambahan" */}
          <g transform="translate(540 950)" filter="url(#pp)">
            <rect x="-14" y="-40" width="28" height="200" fill={C.wood} />
            {[0, 1, 2].map((i) => <circle key={i} cx={(i - 1) * 70} cy={-80 - (i % 2) * 40} r="80" fill={i % 2 ? "#8FB07A" : "#7A9E66"} />)}
            <path d="M200,-160 L320,-160 L320,40 L200,40 Z" fill="#C9A27A" /><path d="M215,-145 L305,-145 L305,25 L215,25 Z" fill="#3A3050" />
            <text x="0" y="230" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="40" fill={C.brown}>kisah tambahan</text>
          </g>
          {/* gulungan riwayat bertumpuk + tongkat tergeletak: subjek kisah tetap di layar */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${330 + i * 70} ${1270 - i * 22}) rotate(${-8 + i * 6})`} filter="url(#pp)">
              <rect x="-110" y="-34" width="220" height="68" rx="34" fill={i % 2 ? "#E2C08F" : "#EFD9AE"} />
              <ellipse cx="-110" cy="0" rx="18" ry="34" fill="#C9A27A" /><ellipse cx="110" cy="0" rx="18" ry="34" fill="#B88F66" />
            </g>
          ))}
          <Staff x={560} y={1300} rot={84} s={0.7} eaten={1} crack={1} len={520} />
        </g>
        <g transform={L(c, 1.05)}>
          <Jinn x={110} y={1350} s={0.8} t={t} carry={false} freeze={1} />
          <Jinn x={970} y={1350} s={0.8} t={t} carry={false} freeze={1} flip />
        </g>
        <g transform={`translate(540 1000) scale(${mix(2.4, 1, stamp)}) rotate(-4)`} opacity={stamp}>
          <rect x="-400" y="-100" width="800" height="220" rx="14" fill="rgba(240,220,200,0.6)" stroke={C.red} strokeWidth="12" />
          <text x="0" y="-16" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="64" fill={C.red} letterSpacing="3">RIWAYAT ISRAILIYAT</text>
          <text x="0" y="86" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="40" fill={C.red} opacity={ease(t, 67.6, 67.9)}>tidak dipastikan kebenarannya</text>
        </g>
      </Svg>
      <Card t={t} at={64.1} out={66.6} y={260} w={860}><Kicker>Ada pula</Kicker><Big size={58}>kisah-kisah tambahan?</Big></Card>
    </AbsoluteFill>
  );
};

/** S8 Payoff: fajar di atas istana sunyi, singgasana kosong, tongkat patah di anak tangga; kartu pelajaran. */
const S8: React.FC<SP> = ({ t }) => {
  const k = ease(t, 70.2, 77.8);
  const c: Cam = { z: mix(1.3, 1.0, k), x: Math.sin(t * 0.35) * 14, y: mix(120, -30, k) };
  const sun = ease(t, 70.2, 74);
  const ring = t > 76.2;
  return (
    <AbsoluteFill>
      <Svg bg="linear-gradient(#F6C98E, #F7DDB2 70%)">
        <rect width="1080" height="1920" fill="#7A6A9E" opacity={1 - sun} />
        <g transform={L(c, 0.12)}>
          <circle cx="540" cy={mix(1150, 760, sun)} r="420" fill="url(#sunGlow)" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x="536" y={mix(1150, 760, sun) - 520} width="8" height="300" fill="#FFE7A8" opacity={0.3 * sun} transform={`rotate(${i * 30 + t * 4} 540 ${mix(1150, 760, sun)})`} />)}
        </g>
        <g transform={L(c, 0.3)}>
          <Tower x={170} y={1180} h={560} s={0.75} scaffold={false} />
          <Tower x={910} y={1180} h={620} s={0.75} scaffold={false} tint="#E2C08F" />
          <g filter="url(#pp)"><rect x="400" y="820" width="280" height="380" fill="#E8C99A" /><path d="M385,825 Q540,560 695,825 Z" fill={C.gold} /></g>
        </g>
        <g transform={L(c, 0.6)}>
          <path d="M-300,1200 L1380,1200 L1380,2400 L-300,2400 Z" fill="#E2BE8C" filter="url(#pp)" />
          <Throne x={540} y={1330} s={0.95} glow={0.9} />
          <Staff x={430} y={1310} rot={-86} len={250} eaten={1} />
          <Staff x={700} y={1318} rot={84} len={360} eaten={1} />
          {ring ? [0, 1, 2].map((i) => { const rr = ((t - 76.2 + i * 0.4) % 1.2) / 1.2; return <circle key={i} cx="540" cy="1060" r={80 + rr * 420} fill="none" stroke={C.gold} strokeWidth={6 * (1 - rr)} opacity={(1 - rr) * 0.8} />; }) : null}
        </g>
        <g transform={L(c, 1)}>
          {Array.from({ length: 10 }, (_, i) => { const yy = ((t - 70.2) * 120 + i * 230) % 1700 + 200; const xx = 80 + ((i * 131) % 920) + Math.sin(t + i) * 40; return <path key={i} d={`M${xx},${yy} q14,-18 28,0 q-14,18 -28,0 Z`} fill={i % 2 ? C.terra : C.gold} opacity="0.75" />; })}
        </g>
      </Svg>
      <Card t={t} at={70.4} out={73.9} y={260} w={880} dark><Kicker c={C.ochre}>Kerajaan sebesar itu pun</Kicker><Big size={62} c={C.cream}>tak bisa menahan kematian</Big></Card>
      <Card t={t} at={74.1} y={250} w={920}>
        <Big size={64}>Jin <span style={{ color: C.red }}>TIDAK</span> tahu yang gaib</Big>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: 84, color: C.terra, marginTop: 10, opacity: ease(t, 76.2, 76.6), transform: `scale(${t < 76.2 ? 0.9 : pop(t, 76.2)})` }}>Hanya ALLAH</div>
      </Card>
    </AbsoluteFill>
  );
};

/** S9 Penutup: singgasana kosong dalam cahaya, kartu penutup. */
const S9: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1.15, 1.0, ease(t, 77.8, 80.5)), x: 0, y: 0 };
  return (
    <AbsoluteFill>
      <Svg bg={C.wallD}>
        <Hall c={c} t={t} dawn />
        <g transform={L(c, 0.8)}>
          <Throne x={540} y={1300} />
          <Staff x={430} y={1290} rot={-86} len={250} eaten={1} />
          <Staff x={700} y={1298} rot={84} len={360} eaten={1} />
        </g>
      </Svg>
      <Card t={t} at={77.9} y={300} w={860} dark>
        <Big size={64} c={C.cream}>Kisah dalam Al-Qur'an</Big>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 42, color: C.ochre, marginTop: 10, opacity: ease(t, 79.0, 79.4) }}>bersama AUDIRA</div>
      </Card>
    </AbsoluteFill>
  );
};

// ---------- caption karaoke ----------
type W = { text: string; start: number; end: number };
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  (WORDS as W[]).forEach((w, i, a) => {
    cur.push(w);
    const next = a[i + 1];
    const punct = /[.,?!:]$/.test(w.text);
    if (!next || cur.length >= 5 || (punct && cur.length >= 2) || /[.?!]$/.test(w.text) || next.start - w.end > 0.5) { out.push(cur); cur = []; }
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT - 0.1) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.12 && t < (CHUNKS[i + 1]?.[0].start ?? ch[ch.length - 1].end + 0.6) - 0.12);
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  if (t > ch[ch.length - 1].end + 0.8) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1360, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(44,30,24,0.86)", borderRadius: 18, padding: "18px 30px", width: 980, boxSizing: "border-box", textAlign: "center", boxShadow: "8px 10px 0 rgba(30,18,10,0.3)" }}>
        {ch.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const s = active ? 1 + 0.04 * Math.sin(clamp((t - w.start) / 0.18) * Math.PI / 2) : 1;
          return <span key={i} style={{ display: "inline-block", fontFamily: INTER, fontWeight: 800, fontSize: 58, lineHeight: 1.25, color: active ? "#F7B955" : C.cream, marginRight: i < ch.length - 1 ? "0.4em" : 0, transform: `scale(${s})` }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- director ----------
const SCENES: [number, number, React.FC<SP>, boolean][] = [
  [T.s1, T.s2a, S1, false], [T.s2a, T.s2b, S2a, false], [T.s2b, T.s3, S2b, false], [T.s3, T.s4, S3, true], [T.s4, T.s5, S4, false],
  [T.s5, T.s6, S5, false], [T.s6, T.s7a, S6, true], [T.s7a, T.s7b, S7a, false], [T.s7b, T.s8, S7b, false], [T.s8, T.s9, S8, false], [T.s9, OUTRO_AT + 0.4, S9, false],
];
const XF = 0.35;

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const u = width / 1080;
  return (
    <AbsoluteFill style={{ background: C.nightA, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${u})`, transformOrigin: "0 0" }}>
        {SCENES.map(([a, b, S, night], i) => {
          if (t < a || t >= b + XF) return null;
          const fadeIn = i === 0 ? 1 : clamp((t - a) / XF);
          const lt = t - a;
          const dz = 1 + 0.013 * lt;
          const dx = Math.sin(lt * 0.45 + i) * 26;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: fadeIn, transformOrigin: "540px 260px", transform: `translate(${dx.toFixed(2)}px, ${((1 - fadeIn) * 24).toFixed(2)}px) scale(${dz.toFixed(4)})` }}>
              <S t={t} />
              <KeyLight night={night} />
              <ForeFrame lt={lt} i={i} dark={night} />
              <Grain />
            </div>
          );
        })}
        {t < OUTRO_AT ? (
          <div style={{ position: "absolute", left: 60, top: 180, padding: "6px 16px", borderRadius: 8, background: "rgba(46,42,74,0.82)", color: C.cream, fontFamily: INTER, fontWeight: 700, fontSize: 36, letterSpacing: 1 }}>SOSOK NABI TIDAK DIGAMBARKAN</div>
        ) : null}
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT - 0.2 ? <AudiraOutro seconds={FILM_SECONDS - OUTRO_AT} /> : null}
      <AudiraSignature seed="ep24-sulaiman-tongkat" />
    </AbsoluteFill>
  );
};
