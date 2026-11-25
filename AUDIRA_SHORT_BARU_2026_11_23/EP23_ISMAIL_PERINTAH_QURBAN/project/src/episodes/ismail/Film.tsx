// EP23 — Ibrahim, Ismail, dan Perintah dalam Mimpi (AUDIRA QISSAH). Style: ISLAMICDOCUMENTARY, Remotion 2D (SVG/CSS, tanpa R3F).
// Adab: Nabi Ibrahim & Ismail TIDAK digambarkan (tanpa tubuh/siluet/tangan/bayangan). Ayah = lentera besar, anak = lentera kecil,
// jejak kaki, bintang, cahaya. Tanpa pisau/darah/penyembelihan. Allah & malaikat tidak digambarkan: panggilan = riak cahaya + teks.
// Semua nilai fungsi murni dari t (frame / fps): seek-safe, tanpa Math.random. Waktu = detik film (VO + 0.3).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { AudiraOutro } from "../../brand/AudiraOutro";
import WORDS from "../../../public/audio/vo-words.json";

const { fontFamily: PLAYFAIR } = loadPlayfair("normal", { weights: ["700", "800"], subsets: ["latin"] });
const { fontFamily: INTER } = loadInter("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const { fontFamily: AMIRI } = loadAmiri("normal", { weights: ["700"], subsets: ["arabic"] });

export const ISMAIL_SECONDS = 86.0;
const OUTRO_AT = 83.0;
const VO_OFFSET = 0.3;

// ---------- palet (docs/ART_DIRECTION.md) ----------
const C = {
  night: "#0f1e3a", nightHi: "#1a2f5a", deep: "#08122a", gold: "#d4af37", goldHi: "#f2d27a", cream: "#efe4c8",
  green: "#0f4c3a", dawnA: "#f3a65a", dawnB: "#f7d79a", sand: "#d8b27a", sandD: "#c99a5e", ink: "#0a1428", lamp: "#ffd58a",
};

// ---------- helper ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.2, 1) });
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const pop = (t: number, at: number) => { const k = lin(t, at, at + 0.35); return k <= 0 ? 0 : 1 + Math.sin(k * Math.PI) * 0.06 - (1 - k) * 0.1; };
const mulberry = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };

/** Punggung bukit pasir, diisi sampai bawah frame. */
const ridge = (y: number, amp: number, seed: number, waves = 3, bottom = 2400, x0 = -300, x1 = 1380) => {
  const r = mulberry(seed);
  const ph = r() * 6.28;
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 30) {
    const yy = y + Math.sin((x / (x1 - x0)) * Math.PI * waves + ph) * amp + (r() - 0.5) * 4;
    d += ` L${x},${yy.toFixed(1)}`;
  }
  return d + ` L${x1},${bottom} Z`;
};

/** Bintang girih 8 sudut. */
const star8 = (r: number, ri = r * 0.6, cx = 0, cy = 0) => {
  const p: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? ri : r;
    p.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${p.join(" L")} Z`;
};

type Cam = { z: number; x: number; y: number };
/** Transformasi lapisan parallax: d = 0.15 (BG) / 0.5 (MG) / 1 (FG). */
const L = (c: Cam, d: number) => {
  const s = 1 + (c.z - 1) * d;
  return `translate(540 960) scale(${s.toFixed(4)}) translate(${(-540 + c.x * d).toFixed(2)} ${(-960 + c.y * d).toFixed(2)})`;
};

// ---------- defs bersama ----------
const Defs: React.FC = () => (
  <defs>
    {/* garis tepi tinta navy + bayangan lembut */}
    <filter id="pp" x="-15%" y="-15%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="d" />
      <feFlood floodColor="#0a1428" floodOpacity="0.85" />
      <feComposite in2="d" operator="in" result="ink" />
      <feGaussianBlur in="d" stdDeviation="7" result="sb" />
      <feOffset in="sb" dx="6" dy="12" result="so" />
      <feFlood floodColor="#040914" floodOpacity="0.45" />
      <feComposite in2="so" operator="in" result="sh" />
      <feMerge><feMergeNode in="sh" /><feMergeNode in="ink" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    {/* emas logam 3 stop */}
    <linearGradient id="goldM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8a6a1c" /><stop offset="0.45" stopColor="#f2d27a" /><stop offset="0.6" stopColor="#d4af37" /><stop offset="1" stopColor="#6e5214" /></linearGradient>
    <linearGradient id="brass" x1="0" x2="1"><stop offset="0" stopColor="#5a4212" /><stop offset="0.35" stopColor="#e8c463" /><stop offset="0.55" stopColor="#b8902e" /><stop offset="1" stopColor="#3e2c0a" /></linearGradient>
    <radialGradient id="lampGlow"><stop offset="0" stopColor={C.lamp} stopOpacity="0.95" /><stop offset="0.4" stopColor={C.lamp} stopOpacity="0.35" /><stop offset="1" stopColor={C.lamp} stopOpacity="0" /></radialGradient>
    <radialGradient id="moonGlow"><stop offset="0" stopColor="#fff4d0" stopOpacity="0.7" /><stop offset="0.5" stopColor="#c8d4ff" stopOpacity="0.15" /><stop offset="1" stopColor="#c8d4ff" stopOpacity="0" /></radialGradient>
    <radialGradient id="sunGlow"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.3" stopColor="#ffd98a" stopOpacity="0.85" /><stop offset="1" stopColor="#f3a65a" stopOpacity="0" /></radialGradient>
    <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={C.lamp} stopOpacity="0.7" /><stop offset="1" stopColor={C.lamp} stopOpacity="0" /></linearGradient>
    {([["night", "#4a6aa8"], ["day", "#fff0d0"], ["dawn", "#f7c9a0"], ["gold", "#ffe2a8"]] as const).map(([m, col]) => (
      <linearGradient key={m} id={`mist-${m}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity="0" /><stop offset="0.5" stopColor={col} stopOpacity="0.55" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient>
    ))}
    <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur20"><feGaussianBlur stdDeviation="20" /></filter>
    <filter id="sandTex" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="3" seed="17" />
      <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 1.2 -0.35" />
    </filter>
    <pattern id="girih" width="140" height="140" patternUnits="userSpaceOnUse">
      <path d={star8(46, 28, 70, 70)} fill="none" stroke="#d4af37" strokeWidth="2.2" />
      <path d={star8(46, 28, 0, 0)} fill="none" stroke="#d4af37" strokeWidth="2.2" />
      <path d={star8(46, 28, 140, 0)} fill="none" stroke="#d4af37" strokeWidth="2.2" />
      <path d={star8(46, 28, 0, 140)} fill="none" stroke="#d4af37" strokeWidth="2.2" />
      <path d={star8(46, 28, 140, 140)} fill="none" stroke="#d4af37" strokeWidth="2.2" />
      <path d="M24,70 L0,70 M116,70 L140,70 M70,24 L70,0 M70,116 L70,140" stroke="#d4af37" strokeWidth="2.2" />
    </pattern>
  </defs>
);

/** Lapisan FG dekat kamera: batu/bibir bukit gelap blur di sudut bawah, parallax 1.4x kamera adegan. */
const FG_TONE = ["#040914", "#040914", "#3a2410", "#040914", "#0a0704", "#040914", "#2a1a24", "#2a1a24", "#4a2a14", "#0c1430", "#040914", "#2a1a2a"];
const FgDepth: React.FC<{ i: number; lt: number }> = ({ i, lt }) => {
  const px = (Math.sin(lt * 1.1 + i) * 55 + (i % 2 ? -1 : 1) * lt * 9) * 1.4;
  const py = Math.cos(lt * 0.45 + i) * 14 * 1.4;
  const s = 1 + 0.045 * lt * 1.4;
  const tone = FG_TONE[i] ?? "#040914";
  const flip = i % 2 === 1;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <filter id={`fgb${i}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
      <g transform={`translate(${(540 + px).toFixed(2)} ${(1920 + py).toFixed(2)}) scale(${(flip ? -s : s).toFixed(4)} ${s.toFixed(4)}) translate(-540 -1920)`} filter={`url(#fgb${i})`} opacity="0.92">
        <path d="M-120,1920 L-120,1560 C-40,1500 60,1520 130,1590 C200,1650 260,1700 330,1760 L380,1920 Z" fill={tone} />
        <path d="M1200,1920 L1200,1640 C1120,1610 1040,1640 990,1700 C950,1750 900,1800 860,1920 Z" fill={tone} />
        <path d="M-40,1600 C40,1560 110,1580 170,1630" stroke="#fff" strokeOpacity="0.07" strokeWidth="10" fill="none" />
      </g>
    </svg>
  );
};

/** Grain perkamen + vinyet seluruh frame. */
const Grain: React.FC = () => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.35 }}>
    <filter id="grainF"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0.9 0" /></filter>
    <rect width="1080" height="1920" filter="url(#grainF)" />
    <filter id="mottleF"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.016" numOctaves="4" seed="21" /><feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.5  0 0 0 0 0.3  0 0 0 1.3 -0.4" /></filter>
    <rect width="1080" height="1920" filter="url(#mottleF)" />
  </svg>
);

/** Bingkai mihrab: pita girih navy-emas di luar jendela lengkung. */
const ARCH = "M80,1780 L80,600 C80,330 330,250 540,140 C750,250 1000,330 1000,600 L1000,1780 Z";
const MihrabFrame: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => {
  const sh = 0.55 + Math.sin(t * 1.1) * 0.15;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: k }}>
      <Defs />
      <path d={`M0,0 L1080,0 L1080,1920 L0,1920 Z ${ARCH}`} fillRule="evenodd" fill="#0a1630" opacity="0.93" />
      <path d={`M0,0 L1080,0 L1080,1920 L0,1920 Z ${ARCH}`} fillRule="evenodd" fill="url(#girih)" opacity="0.35" />
      <path d={ARCH} fill="none" stroke="url(#goldM)" strokeWidth="12" />
      <path d={ARCH} fill="none" stroke="#0a1428" strokeWidth="3" transform="translate(540 960) scale(1.018) translate(-540 -960)" />
      <path d={ARCH} fill="none" stroke="#f2d27a" strokeWidth="2.5" opacity={sh} transform="translate(540 960) scale(0.985) translate(-540 -960)" />
      <g transform="translate(540 140)"><path d={star8(34, 20)} fill="url(#goldM)" stroke="#0a1428" strokeWidth="3" /><circle r="8" fill={C.green} /></g>
      {[[80, 1780], [1000, 1780]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}><path d={star8(28, 16)} fill="url(#goldM)" stroke="#0a1428" strokeWidth="3" /></g>)}
    </svg>
  );
};

// ---------- objek ----------
const Stars: React.FC<{ t: number; n?: number; seed?: number; h?: number; op?: number }> = ({ t, n = 70, seed = 3, h = 1100, op = 1 }) => {
  const r = mulberry(seed);
  return (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * 1200 - 60, y = r() * h, s = 1.5 + r() * 3.5, ph = r() * 6.28;
        return <circle key={i} cx={x} cy={y} r={s} fill="#fff6dc" opacity={0.4 + 0.5 * Math.sin(t * 2 + ph) ** 2} />;
      })}
    </g>
  );
};

const Moon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r="260" fill="url(#moonGlow)" />
    <path d="M-10,-90 a95,95 0 1,0 60,170 a76,76 0 1,1 -60,-170 Z" fill="#f7ecc8" />
  </g>
);

const SkyGirih: React.FC<{ op?: number }> = ({ op = 0.08 }) => <rect x="-300" y="-300" width="1680" height="1700" fill="url(#girih)" opacity={op} />;

/** Lentera kuningan berkaca warna, kubah + panel girih. size: ayah 1.15, anak 0.72. */
const Lantern: React.FC<{ x: number; y: number; s?: number; t: number; on?: number; tilt?: number; glass?: string }> = ({ x, y, s = 1, t, on = 1, tilt = 0, glass = "#e8a33a" }) => {
  const f = 1 + Math.sin(t * 9) * 0.04 + Math.sin(t * 13.7) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      <circle r={520 * f} cy="-20" fill="url(#lampGlow)" opacity={0.45 * on} filter="url(#blur20)" />
      <circle r={340 * f} cy="-20" fill="url(#lampGlow)" opacity={on} />
      <g filter="url(#pp)">
        <path d="M0,-250 L0,-215" stroke="url(#brass)" strokeWidth="8" />
        <circle cy="-262" r="14" fill="none" stroke="url(#brass)" strokeWidth="7" />
        <path d="M-70,-150 Q-60,-215 0,-222 Q60,-215 70,-150 Z" fill="url(#brass)" />
        <rect x="-82" y="-158" width="164" height="20" rx="5" fill="url(#brass)" />
        <path d="M-74,-138 L-86,90 L86,90 L74,-138 Z" fill="#3a2a0e" />
        <path d="M-64,-128 L-74,80 L74,80 L64,-128 Z" fill={glass} opacity={0.35 + 0.55 * on * f} />
        {[-1, 0, 1].map((k) => <path key={k} d={`M${k * 44},-128 L${k * 50},80`} stroke="url(#brass)" strokeWidth="7" />)}
        <path d={star8(26, 15, 0, -30)} fill="none" stroke="#3a2a0e" strokeWidth="5" opacity="0.9" />
        <ellipse cx="0" cy="-10" rx={18 * f} ry={30 * f} fill="#fff4d6" opacity={on} />
        <rect x="-96" y="88" width="192" height="26" rx="6" fill="url(#brass)" />
        <path d="M-70,114 L-50,144 L50,144 L70,114 Z" fill="url(#brass)" />
      </g>
    </g>
  );
};

const Dunes: React.FC<{ c: Cam; mode: "night" | "day" | "dawn" | "gold" }> = ({ c, mode }) => {
  const P = { night: ["#16264a", "#1d3058", "#2a3c66"], day: ["#c99a5e", "#d8b27a", "#e8c896"], dawn: ["#5a3a4a", "#8a5a4a", "#b88060"], gold: ["#a8743e", "#c99a5e", "#e0b878"] }[mode];
  return (
    <>
      <g transform={L(c, 0.35)} filter="url(#pp)"><path d={ridge(1220, 50, 11, 2.2)} fill={P[0]} /></g>
      {/* kabut atmosfer antara BG dan MG */}
      <g transform={L(c, 0.45)}><rect x="-400" y="1080" width="1880" height="420" fill={`url(#mist-${mode})`} filter="url(#blur20)" /></g>
      <g transform={L(c, 0.6)} filter="url(#pp)"><path d={ridge(1380, 60, 12, 1.6)} fill={P[1]} /></g>
      <g transform={L(c, 0.6)}><path d={ridge(1380, 60, 12, 1.6)} filter="url(#sandTex)" opacity="0.6" /></g>
      <g transform={L(c, 0.8)}><rect x="-400" y="1300" width="1880" height="300" fill={`url(#mist-${mode})`} opacity="0.55" filter="url(#blur20)" /></g>
      <g transform={L(c, 1)} filter="url(#pp)"><path d={ridge(1600, 40, 13, 1.2)} fill={P[2]} /></g>
      <g transform={L(c, 1)}><path d={ridge(1600, 40, 13, 1.2)} filter="url(#sandTex)" opacity="0.55" /></g>
    </>
  );
};

/** Batu datar tempat lentera. */
const Rock: React.FC<{ x: number; y: number; w?: number; tone?: string }> = ({ x, y, w = 520, tone = "#3a4a6a" }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#pp)">
    <path d={`M${-w / 2},40 L${-w / 2 + 30},-10 L${-w / 6},-30 L${w / 5},-24 L${w / 2 - 20},-6 L${w / 2},40 Z`} fill={tone} />
    <path d={`M${-w / 2 + 30},-10 L${-w / 6},-30 L${w / 5},-24 L${w / 2 - 20},-6 L${w / 4},4 L${-w / 4},2 Z`} fill="#fff" opacity="0.12" />
  </g>
);

/** Jejak kaki: pasangan besar (ayah) & kecil (anak), muncul bertahap sepanjang jalur. */
const Footprints: React.FC<{ k: number }> = ({ k }) => {
  const n = 14;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        if (u > k) return null;
        const y = mix(1880, 1330, u), sc = mix(1.25, 0.45, u), x0 = 540 + Math.sin(u * 3) * 80;
        const side = i % 2 ? 1 : -1;
        const op = clamp((k - u) * 8);
        return (
          <g key={i} opacity={op}>
            <ellipse cx={x0 - 90 * sc + side * 18 * sc} cy={y} rx={22 * sc} ry={46 * sc} fill="#8a6230" opacity="0.75" />
            <ellipse cx={x0 + 70 * sc + side * 12 * sc} cy={y + 20 * sc} rx={14 * sc} ry={30 * sc} fill="#8a6230" opacity="0.75" />
          </g>
        );
      })}
    </g>
  );
};

/** Tugu batu bertulis AUDIRA (brand dalam adegan). */
const Marker: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#pp)">
    <path d="M-70,0 L-60,-230 Q0,-270 60,-230 L70,0 Z" fill="#b8956a" />
    <path d="M-60,-230 Q0,-270 60,-230 L40,-220 Q0,-246 -40,-220 Z" fill="#e0c294" />
    <path d={star8(20, 12, 0, -180)} fill="none" stroke="#6e4e2a" strokeWidth="4" />
    <text x="0" y="-100" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize="34" fill="#5a3c1c" letterSpacing="2">AUDIRA</text>
    <rect x="-90" y="-6" width="180" height="20" rx="4" fill="#8a6a44" />
  </g>
);

/** Tenda Badui. */
const Tent: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy="-60" r="260" fill="url(#lampGlow)" opacity={0.55 * glow} />
    <g filter="url(#pp)">
      <path d="M-280,0 L-200,-170 L0,-210 L200,-170 L280,0 Z" fill="#3a2a2a" />
      {[-160, -80, 0, 80, 160].map((k) => <path key={k} d={`M${k},-${200 - Math.abs(k) * 0.2} L${k * 1.3},0`} stroke="#5a4038" strokeWidth="10" />)}
      <path d="M-60,0 L-40,-120 L40,-120 L60,0 Z" fill="#ffcf7a" opacity={0.85 * glow} />
      <path d="M-280,0 L280,0" stroke="#2a1a1a" strokeWidth="10" />
    </g>
  </g>
);

/** Rehal kayu + kitab tafsir terbuka. */
const Rehal: React.FC<{ x: number; y: number; s?: number; open: number; t: number }> = ({ x, y, s = 1, open, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#pp)">
      <path d="M-260,160 L0,-20 L260,160 L230,180 L0,20 L-230,180 Z" fill="#6a3e1e" />
      <path d="M-260,-60 L0,100 L260,-60 L230,-80 L0,60 L-230,-80 Z" fill="#7a4a24" />
      {/* halaman kiri & kanan */}
      <path d={`M0,40 L${-300 * open},${-40 - 60 * open} L${-300 * open},${-300 - 40 * open} L0,-250 Z`} fill="#efe4c8" />
      <path d={`M0,40 L${300 * open},${-40 - 60 * open} L${300 * open},${-300 - 40 * open} L0,-250 Z`} fill="#f5ecd4" />
      <path d="M0,40 L0,-250" stroke="#8a6a44" strokeWidth="4" />
    </g>
    {Array.from({ length: 7 }, (_, i) => (
      <g key={i} opacity={0.75 * open}>
        <path d={`M${-40},${-210 + i * 34} L${-260 * open},${-240 + i * 34 - 10 * open}`} stroke="#3a2a14" strokeWidth="5" strokeLinecap="round" strokeDasharray="22 10 8 10" />
        <path d={`M${40},${-210 + i * 34} L${260 * open},${-240 + i * 34 - 10 * open}`} stroke={i === 2 || i === 4 ? "#b8902e" : "#3a2a14"} strokeWidth="5" strokeLinecap="round" strokeDasharray="30 8 12 8" opacity={i === 2 || i === 4 ? 0.6 + 0.4 * Math.sin(t * 3) : 1} />
      </g>
    ))}
    <path d="M10,-250 L10,-60 L30,-80 L50,-60 L50,-250" fill={C.green} opacity={open} />
  </g>
);

/** Kibas putih bertanduk melingkar, tenang. */
const Ram: React.FC<{ x: number; y: number; s?: number; t: number; walk?: number; flip?: boolean }> = ({ x, y, s = 1, t, walk = 0, flip }) => {
  const r = mulberry(77);
  const leg = Math.sin(t * 4) * 8 * walk;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#pp)">
      {[[-110, leg], [-60, -leg], [70, -leg], [120, leg]].map(([lx, dl], i) => <path key={i} d={`M${lx},40 L${lx + dl},150`} stroke="#4a3a30" strokeWidth="20" strokeLinecap="round" />)}
      <ellipse cx="0" cy="0" rx="190" ry="105" fill="#f2ece0" />
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={-160 + r() * 320} cy={-80 + r() * 150} r={22 + r() * 16} fill={i % 3 ? "#f7f2e8" : "#ddd3c2"} />)}
      <path d="M150,-30 Q230,-70 260,-10 Q270,50 220,60 Q180,50 150,20 Z" fill="#e8ddd0" />
      <ellipse cx="250" cy="20" rx="26" ry="18" fill="#cbbfb0" />
      <path d="M195,-50 C150,-110 250,-130 250,-70 C250,-30 200,-30 210,-60" stroke="#a88a5a" strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d="M195,-50 C150,-110 250,-130 250,-70" stroke="#d8c08a" strokeWidth="6" fill="none" opacity="0.7" />
      <circle cx="232" cy="-14" r="6" fill="#2a1a10" />
      <path d="M-185,-10 Q-215,30 -200,70" stroke="#e8ddd0" strokeWidth="22" fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Masjid berkubah + menara + lampu. */
const Mosque: React.FC<{ x: number; y: number; s?: number; lamps: number; t: number }> = ({ x, y, s = 1, lamps, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy="-200" r="420" fill="url(#lampGlow)" opacity={0.35 * lamps} />
    <g filter="url(#pp)">
      <rect x="-300" y="-180" width="600" height="180" fill="#1a2a40" />
      <path d="M-170,-180 Q-170,-400 0,-430 Q170,-400 170,-180 Z" fill="#20334e" />
      <path d="M-170,-180 Q-170,-400 0,-430 Q170,-400 170,-180 Z" fill="url(#goldM)" opacity="0.25" />
      <path d="M0,-430 L0,-490" stroke="url(#goldM)" strokeWidth="8" />
      <path d="M-14,-500 a16,16 0 1,0 22,-6" stroke="url(#goldM)" strokeWidth="7" fill="none" />
      {[-380, 380].map((mx) => (
        <g key={mx}>
          <rect x={mx - 30} y="-520" width="60" height="520" fill="#1a2a40" />
          <path d={`M${mx - 40},-520 L${mx},-600 L${mx + 40},-520 Z`} fill="#20334e" />
          <rect x={mx - 40} y="-380" width="80" height="16" fill="url(#goldM)" />
          <rect x={mx - 12} y="-480" width="24" height="60" rx="12" fill={C.lamp} opacity={lamps * (0.7 + 0.3 * Math.sin(t * 5))} />
        </g>
      ))}
      {[-200, -100, 0, 100, 200].map((wx, i) => <path key={wx} d={`M${wx - 30},-20 L${wx - 30},-110 Q${wx},-150 ${wx + 30},-110 L${wx + 30},-20 Z`} fill={C.lamp} opacity={clamp(lamps * 1.6 - i * 0.12)} />)}
    </g>
  </g>
);

/** Umat: siluet kecil tanpa wajah di kejauhan. */
const Folk: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-18,0 Q-20,-55 0,-64 Q20,-55 18,0 Z" fill="#0a1428" />
    <circle cy="-76" r="13" fill="#0a1428" />
  </g>
);

/** Besek anyaman bambu berisi daging (tertutup). */
const Besek: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#pp)">
    <path d="M-200,0 L-180,-150 L180,-150 L200,0 Z" fill="#c89a58" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-190 + i * 34},0 L${-170 + i * 30},-150`} stroke="#9a7038" strokeWidth="6" />)}
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M-195,${-20 - i * 28} L195,${-20 - i * 28}`} stroke="#e0b878" strokeWidth="5" opacity="0.7" />)}
    <path d="M-215,-150 L-195,-200 L195,-200 L215,-150 Z" fill="#d8aa66" />
    {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${-200 + i * 32},-150 L${-185 + i * 30},-200`} stroke="#a87a40" strokeWidth="5" />)}
    <path d="M-60,-200 Q0,-240 60,-200" stroke="#0f4c3a" strokeWidth="12" fill="none" />
  </g>
);

const Heart: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle r="160" fill="url(#lampGlow)" />
    <path d="M0,50 C-90,-10 -70,-90 -20,-80 C0,-76 0,-60 0,-50 C0,-60 0,-76 20,-80 C70,-90 90,-10 0,50 Z" fill="#fff1c2" />
  </g>
);

const Ripples: React.FC<{ t: number; x: number; y: number; k: number }> = ({ t, x, y, k }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    {Array.from({ length: 6 }, (_, i) => {
      const ph = ((t * 0.45 + i / 6) % 1);
      return <circle key={i} r={60 + ph * 620} fill="none" stroke={C.goldHi} strokeWidth={10 * (1 - ph) + 1} opacity={(1 - ph) * 0.8} />;
    })}
    <path d={star8(70 + Math.sin(t * 2) * 6, 40)} fill="url(#goldM)" opacity="0.9" />
    <circle r="160" fill="url(#lampGlow)" />
  </g>
);

const Sun: React.FC<{ x: number; y: number; s?: number; t: number; rays?: number }> = ({ x, y, s = 1, t, rays = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {rays > 0 ? Array.from({ length: 16 }, (_, i) => <path key={i} d="M-26,-200 L0,-900 L26,-200 Z" fill="#fff0c4" opacity={0.16 * rays} transform={`rotate(${i * 22.5 + t * 3})`} />) : null}
    <circle r="520" fill="url(#sunGlow)" />
    <circle r="150" fill="#fff3d0" />
  </g>
);

// ---------- HUD ----------
/** Lapisan: adegan dirender dua kali; hud=false hanya visual (di bawah bingkai), hud=true hanya kartu (di atas bingkai). */
const HudCtx = React.createContext(false);
const Card: React.FC<{ t: number; at: number; out?: number; x?: number; y: number; w?: number; light?: boolean; children: React.ReactNode; rot?: number }> = ({ t, at, out = 1e9, x = 540, y, w = 900, light, children, rot = 0 }) => {
  const hud = React.useContext(HudCtx);
  const sIn = pop(t, at);
  if (!hud) return null;
  const kOut = lin(t, out, out + 0.25);
  if (sIn <= 0 || kOut >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top: y, width: w, transform: `scale(${sIn * (1 - kOut * 0.1)}) rotate(${rot}deg)`, opacity: clamp(lin(t, at, at + 0.18)) * (1 - kOut),
      background: light ? "radial-gradient(ellipse at 30% 20%, #f7eed8, #e6d4a8)" : "linear-gradient(160deg, rgba(15,30,58,0.97), rgba(8,18,42,0.98))",
      color: light ? C.ink : C.cream, borderRadius: 14, padding: "26px 34px", textAlign: "center", boxSizing: "border-box",
      border: "5px solid #d4af37", boxShadow: "0 0 0 3px #0a1428, inset 0 0 0 8px rgba(242,210,122,0.35), 10px 16px 30px rgba(4,9,20,0.6)",
      textShadow: light ? "none" : "0 2px 0 #08122a, 0 0 10px rgba(8,18,42,0.8)",
    }}>{children}</div>
  );
};
const Kicker: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.goldHi }) => <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 38, letterSpacing: 3, color: c, textTransform: "uppercase" }}>{children}</div>;
const Big: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 72, c }) => <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: size, lineHeight: 1.1, color: c }}>{children}</div>;
const Body: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 42, c }) => <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: size, lineHeight: 1.28, marginTop: 8, color: c }}>{children}</div>;
const Arab: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 66, c = C.goldHi }) => <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: size, direction: "rtl", lineHeight: 1.65, color: c }}>{children}</div>;
const Src: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => <div style={{ display: "inline-block", marginTop: 12, padding: "4px 18px", borderRadius: 999, background: light ? C.green : "rgba(212,175,55,0.2)", color: light ? C.cream : C.goldHi, fontFamily: INTER, fontWeight: 800, fontSize: 38, letterSpacing: 1 }}>{children}</div>;

// ---------- adegan ----------
type SP = { t: number };
const Stage: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => {
  const hud = React.useContext(HudCtx);
  if (hud) return null;
  return <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: bg }}><Defs />{children}</svg>;
};

/** S1 Hook 0–7.4: gurun malam, dua lentera menyala di bukit, riak mimpi di langit. */
const S1: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1, 1.2, ease(t, 0, 7.6)), x: Math.sin(t * 0.4) * 16, y: mix(40, -70, ease(t, 0, 7.6)) };
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(${C.deep}, ${C.nightHi} 70%, #2a3c66)`}>
        <g transform={L(c, 0.15)}><SkyGirih /><Stars t={t} /><Moon x={820} y={430} /></g>
        <g transform={L(c, 0.3)}><Ripples t={t} x={540} y={720} k={ease(t, 0.9, 2.2) * 0.8} /></g>
        <Dunes c={c} mode="night" />
        <g transform={L(c, 1)}>
          <Rock x={540} y={1440} w={600} />
          <Lantern x={450} y={1300} s={1.0} t={t} on={ease(t, 0.1, 0.9)} />
          <Lantern x={660} y={1350} s={0.64} t={t + 1.3} on={ease(t, 3.8, 4.6)} glass="#7fb8a0" />
        </g>
      </Stage>
      <Card t={t} at={0.3} out={3.75} y={300} w={860}>
        <Kicker>Kisah dalam Al-Qur'an</Kicker>
        <Big size={96} c={C.goldHi}>SEORANG AYAH</Big>
        <div style={{ opacity: ease(t, 1.05, 1.4) }}><Big size={80} c={C.cream}>· SEBUAH MIMPI ·</Big></div>
      </Card>
      <Card t={t} at={3.95} out={7.3} y={300} w={900}>
        <Big size={78} c={C.cream}>& jawaban <span style={{ color: C.goldHi }}>sang anak</span></Big>
        <Body c={C.cream}>diabadikan Al-Qur'an sampai hari ini</Body>
        <Src>QS Ash-Shaffat 37:100–111</Src>
      </Card>
    </AbsoluteFill>
  );
};

/** S2 Doa 7.4–18.6: cahaya doa naik, bintang mekar, lentera kecil menyala. */
const S2: React.FC<SP> = ({ t }) => {
  const lt = t - 7.4;
  const c: Cam = { z: mix(1.05, 1.25, ease(t, 7.4, 18.6)), x: -20 + lt * 3, y: mix(60, -120, ease(t, 7.4, 13)) };
  const bloom = ease(t, 12.6, 13.6);
  const kid = ease(t, 16.2, 17.0);
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(${C.deep}, ${C.night} 55%, #24365e)`}>
        <g transform={L(c, 0.15)}>
          <SkyGirih op={0.07} /><Stars t={t} seed={9} />
          <g transform="translate(540 520)">
            <circle r={120 + bloom * 360} fill="url(#lampGlow)" opacity={0.3 + bloom * 0.6} />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-10,-60 L0,${-60 - bloom * 420} L10,-60 Z`} fill="#fff0c4" opacity={0.7 * bloom * (1 - lin(t, 15, 18.6) * 0.6)} transform={`rotate(${i * 30 + lt * 4})`} />)}
            <path d={star8(54 + bloom * 30, 30 + bloom * 16)} fill="url(#goldM)" stroke="#0a1428" strokeWidth="3" />
          </g>
        </g>
        <g transform={L(c, 0.5)}>
          {Array.from({ length: 10 }, (_, i) => {
            const ph = ((lt * 0.35 + i / 10) % 1);
            return <circle key={i} cx={420 + Math.sin(i * 2.1 + lt) * 40} cy={mix(1220, 560, ph)} r={10 * (1 - ph) + 3} fill="#ffe7a8" opacity={(1 - ph) * ease(t, 7.6, 8.6)} />;
          })}
          <path d="M380,1230 L470,1230 L560,520 L520,520 Z" fill="url(#beam)" opacity={0.45 * ease(t, 8.5, 9.8)} />
        </g>
        <Dunes c={c} mode="night" />
        <g transform={L(c, 1)}>
          <Rock x={520} y={1450} w={640} />
          <Lantern x={430} y={1310} s={1.05} t={t} />
          {kid > 0 ? <Lantern x={650} y={1360} s={0.64 * (0.6 + 0.4 * kid)} t={t + 1.3} on={kid} glass="#7fb8a0" /> : null}
        </g>
      </Stage>
      <Card t={t} at={7.6} out={12.4} y={270} w={920}>
        <Kicker>Doa Nabi Ibrahim</Kicker>
        <Arab size={84}>رَبِّ هَبْ لِى مِنَ ٱلصَّـٰلِحِينَ</Arab>
        <div style={{ opacity: ease(t, 9.3, 9.7) }}><Body c={C.cream}>"Ya Tuhanku, anugerahkanlah kepadaku anak yang saleh"</Body></div>
        <Src>QS 37:100</Src>
      </Card>
      <Card t={t} at={12.65} out={16.25} y={270} w={900}>
        <Kicker>Kabar gembira</Kicker>
        <Arab size={92}>فَبَشَّرْنَـٰهُ بِغُلَـٰمٍ حَلِيمٍ</Arab>
        <Body c={C.cream}>seorang anak yang <span style={{ color: C.goldHi }}>sangat sabar</span></Body>
        <Src>QS 37:101</Src>
      </Card>
      <Card t={t} at={16.4} out={18.5} y={300} w={760} light>
        <Kicker c={C.green}>Dialah</Kicker>
        <Big size={120} c={C.ink}>ISMAIL</Big>
        <Body>anak yang lama dinantikan</Body>
      </Card>
    </AbsoluteFill>
  );
};

/** S3 Tumbuh + mimpi 18.6–27.3: jejak kaki siang, tugu AUDIRA, lalu tenda malam. */
const S3: React.FC<SP> = ({ t }) => {
  const lt = t - 18.6;
  const nk = ease(t, 22.9, 24.0);
  const c: Cam = { z: mix(1.0, 1.15, ease(t, 18.6, 27.3)), x: mix(-60, 60, ease(t, 18.6, 23.4)), y: mix(0, -40, nk) };
  const steps = ease(t, 18.8, 22.6);
  return (
    <AbsoluteFill>
      <Stage bg="linear-gradient(#f5d9a0, #f0c27a 60%, #e0a860)">
        <g opacity={1 - nk}>
          <g transform={L(c, 0.15)}><Sun x={260} y={470} s={0.7} t={t} /></g>
          <Dunes c={c} mode="day" />
          <g transform={L(c, 1)}>
            <Footprints k={steps} />
            <Marker x={860} y={1560} s={1.05} />
          </g>
        </g>
        <g opacity={nk}>
          <rect width="1080" height="1920" fill={C.deep} />
          <g transform={L(c, 0.15)}><SkyGirih /><Stars t={t} seed={14} /><Moon x={300} y={460} s={1.1} /></g>
          <g transform={L(c, 0.3)}><Ripples t={t} x={680} y={640} k={ease(t, 24.4, 25.4) * 0.7} /></g>
          <Dunes c={c} mode="night" />
          {/* wahyu: berkas cahaya turun dari riak mimpi ke tenda */}
          <g transform={L(c, 0.6)} opacity={ease(t, 24.6, 25.5)}>
            <path d="M640,640 L720,640 L640,1330 L440,1330 Z" fill="url(#beam)" transform="rotate(180 580 985)" opacity="0.75" />
            {Array.from({ length: 10 }, (_, i) => { const ph = (lt * 0.35 + i / 10) % 1; return <circle key={i} cx={mix(680, 560, ph)} cy={mix(660, 1300, ph)} r="7" fill="#fff0c4" opacity={1 - ph} />; })}
          </g>
          <g transform={L(c, 1)}>
            <Tent x={430} y={1380} s={1.0} glow={0.8 + 0.2 * Math.sin(lt * 4)} />
            <Lantern x={690} y={1250} s={0.7} t={t} on={0.9} />
          </g>
        </g>
      </Stage>
      <Card t={t} at={18.9} out={23.0} y={280} w={900} light>
        <Kicker c={C.green}>Ismail tumbuh besar</Kicker>
        <Big size={66} c={C.ink}>berjalan & bekerja bersama ayahnya</Big>
        <Src light>QS 37:102</Src>
      </Card>
      <Card t={t} at={23.35} out={27.2} y={290} w={900}>
        <Kicker>Datanglah sebuah mimpi</Kicker>
        <div style={{ opacity: ease(t, 25.1, 25.4) }}>
          <Big size={74} c={C.cream}>Mimpi para nabi <span style={{ color: C.goldHi }}>= wahyu</span></Big>
          <Src>Ubaid bin Umair · Tafsir Ibnu Katsir</Src>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/** S4 Bertanya 27.3–35.6: dua lentera berhadapan di batu, jembatan cahaya. */
const S4: React.FC<SP> = ({ t }) => {
  const lt = t - 27.3;
  const c: Cam = { z: mix(1.05, 1.28, ease(t, 27.3, 35.6)), x: mix(80, -80, ease(t, 27.3, 35.6)), y: -30 };
  const lean = ease(t, 29.5, 31.0);
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(${C.deep}, ${C.night} 60%, #22345a)`}>
        <g transform={L(c, 0.15)}><SkyGirih /><Stars t={t} seed={21} n={90} /><Moon x={540} y={420} s={0.8} /></g>
        <Dunes c={c} mode="night" />
        <g transform={L(c, 1)}>
          <Rock x={540} y={1460} w={700} tone="#34466a" />
          {Array.from({ length: 12 }, (_, i) => {
            const u = i / 11;
            const ph = (lt * 0.6 + u) % 1;
            return <circle key={i} cx={mix(400, 700, u)} cy={1150 - Math.sin(u * Math.PI) * 110} r={6 + 4 * Math.sin(ph * Math.PI)} fill="#ffe7a8" opacity={0.85 * lean} />;
          })}
          <Lantern x={380} y={1320} s={1.05} t={t} tilt={6 * lean} />
          <Lantern x={720} y={1370} s={0.66} t={t + 1.3} glass="#7fb8a0" tilt={-3 * lean} />
        </g>
      </Stage>
      <Card t={t} at={27.6} out={30.9} y={300} w={820} light>
        <Big size={78} c={C.ink}>Ibrahim tidak memaksa</Big>
        <div style={{ opacity: ease(t, 29.6, 30.0) }}><Body c={C.green}>Ia justru bertanya…</Body></div>
      </Card>
      <Card t={t} at={31.1} out={35.5} y={250} w={960}>
        <Kicker>Wahai anakku</Kicker>
        <Arab size={52}>يَـٰبُنَىَّ إِنِّىٓ أَرَىٰ فِى ٱلْمَنَامِ أَنِّىٓ أَذْبَحُكَ فَٱنظُرْ مَاذَا تَرَىٰ</Arab>
        <div style={{ transform: `scale(${t < 34.0 ? 1 : pop(t, 34.0)})` }}><Big size={70} c={t < 34.0 ? C.cream : C.goldHi}>"Bagaimana pendapatmu?"</Big></div>
        <Src>QS 37:102</Src>
      </Card>
    </AbsoluteFill>
  );
};

/** S4b Ibnu Katsir 35.6–41.6: kitab tafsir di rehal, cahaya lentera. */
const S4b: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1.0, 1.22, ease(t, 35.6, 41.6)), x: Math.sin(t * 0.5) * 20, y: mix(0, -60, ease(t, 35.6, 41.6)) };
  return (
    <AbsoluteFill>
      <Stage bg="radial-gradient(ellipse at 30% 35%, #3a2c1a, #160f08 70%)">
        <g transform={L(c, 0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#girih)" opacity="0.08" />
          <Lantern x={180} y={760} s={0.9} t={t} />
        </g>
        <g transform={L(c, 1)}>
          <rect x="-200" y="1500" width="1480" height="900" fill="#3a2414" />
          <rect x="-200" y="1500" width="1480" height="900" filter="url(#sandTex)" opacity="0.5" />
          <Rehal x={560} y={1330} s={1.25} open={ease(t, 35.7, 36.8)} t={t} />
        </g>
      </Stage>
      <Card t={t} at={35.85} y={250} w={900}>
        <Kicker>Menurut Ibnu Katsir</Kicker>
        <Big size={70} c={C.cream}>Mengapa bertanya?</Big>
        <div style={{ textAlign: "left", marginTop: 16 }}>
          <div style={{ opacity: ease(t, 38.1, 38.5), transform: `translateX(${(1 - ease(t, 38.1, 38.5)) * -40}px)` }}><Body c={C.goldHi} size={46}>① agar terasa lebih ringan</Body></div>
          <div style={{ opacity: ease(t, 39.8, 40.2), transform: `translateX(${(1 - ease(t, 39.8, 40.2)) * -40}px)` }}><Body c={C.goldHi} size={46}>② menguji kesabaran sang anak</Body></div>
        </div>
        <Src>Tafsir Ibnu Katsir, QS 37:102</Src>
      </Card>
    </AbsoluteFill>
  );
};

/** S5 Jawaban 41.6–50.7: lentera kecil makin terang di bukit bintang, crane-up. */
const S5: React.FC<SP> = ({ t }) => {
  const g = ease(t, 42.9, 46.0);
  const c: Cam = { z: mix(1.3, 1.05, ease(t, 41.6, 50.7)), x: 0, y: mix(80, -140, ease(t, 41.6, 50.7)) };
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(${C.deep}, ${C.night} 60%, #22345a)`}>
        <g transform={L(c, 0.15)}><SkyGirih op={0.06 + g * 0.06} /><Stars t={t} seed={31} n={110} op={0.7 + g * 0.3} /></g>
        <Dunes c={c} mode="night" />
        <g transform={L(c, 1)}>
          <circle cx="600" cy="1280" r={200 + g * 420} fill="url(#lampGlow)" opacity={0.35 + g * 0.4} />
          <Rock x={560} y={1450} w={620} />
          <Lantern x={360} y={1340} s={0.95} t={t} on={0.75} />
          <Lantern x={640} y={1350} s={0.66 + g * 0.16} t={t + 1.3} glass="#7fb8a0" on={1} />
        </g>
      </Stage>
      <Card t={t} at={41.9} out={46.45} y={250} w={940}>
        <Kicker>Ismail menjawab</Kicker>
        <div style={{ opacity: ease(t, 43.0, 43.3) }}>
          <Arab size={92}>يَـٰٓأَبَتِ ٱفْعَلْ مَا تُؤْمَرُ</Arab>
          <Body c={C.cream} size={46}>"Wahai ayahku, <span style={{ color: C.goldHi }}>lakukanlah</span> apa yang diperintahkan kepadamu"</Body>
        </div>
        <Src>QS 37:102</Src>
      </Card>
      <Card t={t} at={46.75} out={50.6} y={270} w={940}>
        <Arab size={68}>سَتَجِدُنِىٓ إِن شَآءَ ٱللَّهُ مِنَ ٱلصَّـٰبِرِينَ</Arab>
        <Body c={C.cream} size={46}>Insya Allah, aku termasuk <span style={{ color: C.goldHi }}>orang yang sabar</span></Body>
        <Src>QS 37:102</Src>
      </Card>
    </AbsoluteFill>
  );
};

/** S6a Berserah 50.7–56.5: fajar, dua lentera berdampingan, dua jalur cahaya naik. */
const S6a: React.FC<SP> = ({ t }) => {
  const lt = t - 50.7;
  const c: Cam = { z: mix(1.25, 1.02, ease(t, 50.7, 56.5)), x: 0, y: mix(-40, 30, ease(t, 50.7, 56.5)) };
  const p1 = ease(t, 52.5, 53.6), p2 = ease(t, 54.3, 55.4);
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(#2a2e5a, #8a5a6a 45%, ${C.dawnA} 75%, ${C.dawnB})`}>
        <g transform={L(c, 0.15)}><Stars t={t} seed={41} n={40} h={600} op={0.5} /><Sun x={540} y={1260} s={0.8} t={t} /></g>
        <Dunes c={c} mode="dawn" />
        <g transform={L(c, 1)}>
          <path d="M420,1290 L470,1290 L520,300 L500,300 Z" fill="url(#beam)" opacity={0.6 * p1} />
          <path d="M630,1330 L670,1330 L560,300 L540,300 Z" fill="url(#beam)" opacity={0.6 * p2} />
          {Array.from({ length: 8 }, (_, i) => { const ph = (lt * 0.4 + i / 8) % 1; return <circle key={i} cx={mix(445, 515, ph)} cy={mix(1280, 340, ph)} r="7" fill="#fff0c4" opacity={p1 * (1 - ph)} />; })}
          {Array.from({ length: 8 }, (_, i) => { const ph = (lt * 0.4 + i / 8 + 0.05) % 1; return <circle key={i} cx={mix(650, 555, ph)} cy={mix(1320, 340, ph)} r="6" fill="#fff0c4" opacity={p2 * (1 - ph)} />; })}
          <Rock x={540} y={1460} w={560} tone="#5a3a40" />
          <Lantern x={440} y={1330} s={0.95} t={t} on={0.8} />
          <Lantern x={650} y={1370} s={0.7} t={t + 1.3} glass="#7fb8a0" on={0.85} />
        </g>
      </Stage>
      <Card t={t} at={50.9} out={56.35} y={250} w={900}>
        <Kicker>QS 37:103</Kicker>
        <Big size={76} c={C.cream}>Keduanya berserah diri</Big>
        {p1 > 0 ? <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
          <div style={{ flex: 1, opacity: p1, transform: `scale(${pop(t, 52.5) || 0.001})`, border: "3px solid #d4af37", borderRadius: 12, padding: "12px 10px", background: "rgba(212,175,55,0.15)" }}>
            <Big size={64} c={C.goldHi}>TAAT</Big><Body c={C.cream} size={38}>Ayah → perintah Allah</Body>
          </div>
          <div style={{ flex: 1, opacity: p2, transform: `scale(${pop(t, 54.3) || 0.001})`, border: "3px solid #d4af37", borderRadius: 12, padding: "12px 10px", background: "rgba(212,175,55,0.15)" }}>
            <Big size={64} c={C.goldHi}>TAAT</Big><Body c={C.cream} size={38}>Anak → Allah & ayahnya</Body>
          </div>
        </div> : null}
      </Card>
    </AbsoluteFill>
  );
};

/** S6b Panggilan 56.5–63.7: riak cahaya konsentris di langit fajar (tanpa sosok). */
const S6b: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1.0, 1.3, ease(t, 56.5, 63.7)), x: 0, y: mix(0, 80, ease(t, 56.5, 63.7)) };
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(#3a3a6a, #b0706a 50%, ${C.dawnB})`}>
        <g transform={L(c, 0.15)}><SkyGirih op={0.1} /></g>
        <g transform={L(c, 0.35)}><Ripples t={t} x={540} y={760} k={ease(t, 56.6, 57.6)} /></g>
        <Dunes c={c} mode="dawn" />
        <g transform={L(c, 1)}>
          <Rock x={540} y={1470} w={540} tone="#5a3a40" />
          <Lantern x={450} y={1350} s={0.85} t={t} on={0.7} />
          <Lantern x={640} y={1385} s={0.6} t={t + 1.3} glass="#7fb8a0" on={0.75} />
        </g>
      </Stage>
      <Card t={t} at={56.7} out={60.6} y={250} w={940}>
        <Kicker>Lalu Allah memanggil</Kicker>
        <div style={{ opacity: ease(t, 58.0, 58.4) }}>
          <Arab size={96}>قَدْ صَدَّقْتَ ٱلرُّءْيَآ</Arab>
          <Body c={C.cream} size={46}>"Wahai Ibrahim, engkau telah membenarkan mimpi itu"</Body>
        </div>
        <Src>QS 37:104–105</Src>
      </Card>
      <Card t={t} at={60.85} out={63.6} y={300} w={900} light>
        <Arab size={72} c={C.green}>إِنَّ هَـٰذَا لَهُوَ ٱلْبَلَـٰٓؤُا۟ ٱلْمُبِينُ</Arab>
        <Big size={78} c={C.ink}>Ujian yang nyata</Big>
        <Src light>QS 37:106</Src>
      </Card>
    </AbsoluteFill>
  );
};

/** S7a Tebusan 63.7–66.8: kibas putih di bukit emas pagi. */
const S7a: React.FC<SP> = ({ t }) => {
  const lt = t - 63.7;
  const c: Cam = { z: mix(1.0, 1.22, ease(t, 63.7, 66.8)), x: mix(40, -40, ease(t, 63.7, 66.8)), y: -20 };
  const sweep = lin(t, 63.8, 66.5);
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(#f7d79a, #f3b56a 55%, #d88a4a)`}>
        <g transform={L(c, 0.15)}><Sun x={820} y={520} s={0.8} t={t} rays={1} /></g>
        <Dunes c={c} mode="gold" />
        <g transform={L(c, 1)}>
          <Ram x={mix(470, 560, ease(t, 63.7, 66.0))} y={1190} s={1.2} t={t} walk={1 - ease(t, 65.5, 66.2)} />
          <rect x={-400 + sweep * 1700} y="700" width="160" height="1000" fill="#fff6dc" opacity="0.22" transform={`skewX(-18)`} filter="url(#blur20)" />
        </g>
        <g opacity={0.5 + 0.5 * Math.sin(lt * 2)}><circle cx="560" cy="1220" r="300" fill="url(#lampGlow)" opacity="0.35" /></g>
      </Stage>
      <Card t={t} at={63.9} out={66.7} y={260} w={920}>
        <Kicker>Ismail ditebus</Kicker>
        <Arab size={92}>وَفَدَيْنَـٰهُ بِذِبْحٍ عَظِيمٍ</Arab>
        <Body c={C.cream} size={46}>dengan sembelihan yang besar · <span style={{ color: C.goldHi }}>seekor kibas</span></Body>
        <Src>QS 37:107</Src>
      </Card>
    </AbsoluteFill>
  );
};

/** S7b Idul Adha 66.8–71.0: masjid, lampu menyala, umat & kibas di kejauhan. */
const S7b: React.FC<SP> = ({ t }) => {
  const lt = t - 66.8;
  const c: Cam = { z: mix(1.08, 1.0, ease(t, 66.8, 71)), x: mix(-90, 90, ease(t, 66.8, 71)), y: 0 };
  const lamps = ease(t, 67.0, 68.6);
  return (
    <AbsoluteFill>
      <Stage bg="linear-gradient(#1a2f5a, #4a5a8a 50%, #e0a870)">
        <g transform={L(c, 0.15)}><Stars t={t} seed={61} n={30} h={500} op={0.6} /><Moon x={200} y={380} s={0.6} /></g>
        <g transform={L(c, 0.5)}><Mosque x={540} y={1260} s={1.05} lamps={lamps} t={t} /></g>
        <g transform={L(c, 0.8)} filter="url(#pp)"><path d={ridge(1440, 20, 51, 1.2)} fill="#2a3450" /></g>
        <g transform={L(c, 1)}>
          {Array.from({ length: 9 }, (_, i) => <Folk key={i} x={((i * 150 + lt * 40) % 1400) - 160} y={1470 + (i % 3) * 22} s={0.85 + (i % 3) * 0.1} />)}
          <Ram x={240} y={1560} s={0.38} t={t} walk={0.6} />
          <Ram x={860} y={1580} s={0.34} t={t + 0.7} walk={0.6} flip />
        </g>
      </Stage>
      <Card t={t} at={66.95} out={70.9} y={280} w={860}>
        <Kicker>Sejak peristiwa ini</Kicker>
        <Big size={110} c={C.goldHi}>IDUL ADHA</Big>
        <Body c={C.cream} size={46}>10 Zulhijah · umat Islam berkurban</Body>
      </Card>
    </AbsoluteFill>
  );
};

/** S8 Takwa 71.0–78.3: besek kurban di tikar, cahaya hati naik ke bintang (tilt-up). */
const S8: React.FC<SP> = ({ t }) => {
  const rise = ease(t, 75.9, 78.2);
  const c: Cam = { z: mix(1.15, 1.0, ease(t, 71, 78.3)), x: 0, y: mix(-60, 220, rise) };
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(${C.deep}, ${C.night} 55%, #3a2c1e)`}>
        <g transform={L(c, 0.15)}><SkyGirih op={0.07} /><Stars t={t} seed={71} n={90} op={0.6 + rise * 0.4} /></g>
        <g transform={L(c, 1)}>
          <rect x="-300" y="1380" width="1680" height="1000" fill="#5a3a1e" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M-300,${1400 + i * 40} L1380,${1400 + i * 40}`} stroke={i % 2 ? "#7a5228" : "#4a2e14"} strokeWidth="14" />)}
          <path d="M-300,1380 L1380,1380" stroke="#0f4c3a" strokeWidth="22" />
          <Lantern x={170} y={1250} s={0.6} t={t} on={0.8} />
          <Ram x={770} y={1240} s={0.75} t={t} flip />
          <Besek x={430} y={1370} s={0.85} />
          <Besek x={610} y={1360} s={0.7} />
          <Heart x={540} y={1180} s={0.45} op={0.35 * ease(t, 71.4, 72.4) * (1 - ease(t, 75.9, 76.3))} />
          <Heart x={540} y={mix(1220, 520, rise)} s={0.6 + rise * 0.5} op={ease(t, 75.9, 76.5)} />
        </g>
      </Stage>
      <Card t={t} at={71.1} out={75.75} y={250} w={960}>
        <Kicker>Firman Allah · QS Al-Hajj 22:37</Kicker>
        <div style={{ opacity: ease(t, 73.5, 73.9) }}>
          <Arab size={60}>لَن يَنَالَ ٱللَّهَ لُحُومُهَا وَلَا دِمَآؤُهَا</Arab>
          <Body c={C.cream} size={46}>Daging dan darahnya <span style={{ color: C.goldHi }}>tidak akan sampai</span> kepada Allah</Body>
        </div>
      </Card>
      <Card t={t} at={76.05} out={78.2} y={260} w={900} light>
        <Arab size={66} c={C.green}>وَلَـٰكِن يَنَالُهُ ٱلتَّقْوَىٰ مِنكُمْ</Arab>
        <Body>Yang sampai kepada-Nya:</Body>
        <Big size={110} c={C.ink}>TAKWA</Big>
      </Card>
    </AbsoluteFill>
  );
};

/** S9 Payoff 78.3–83.4: matahari terbit, dua lentera di batu, salam emas. */
const S9: React.FC<SP> = ({ t }) => {
  const up = ease(t, 78.3, 81.5);
  const c: Cam = { z: mix(1.2, 1.0, ease(t, 78.3, 83.4)), x: 0, y: mix(-80, 40, up) };
  return (
    <AbsoluteFill>
      <Stage bg={`linear-gradient(#3a4a8a, #d8906a 45%, ${C.dawnB} 70%, #f7e2b0)`}>
        <g transform={L(c, 0.15)}><SkyGirih op={0.08} /><Sun x={540} y={mix(1300, 1050, up)} s={1.0} t={t} rays={up} /></g>
        <Dunes c={c} mode="gold" />
        <g transform={L(c, 1)}>
          <Rock x={540} y={1470} w={600} tone="#6a4a3a" />
          <Lantern x={440} y={1340} s={0.95} t={t} on={0.6} />
          <Lantern x={650} y={1380} s={0.7} t={t + 1.3} glass="#7fb8a0" on={0.65} />
        </g>
      </Stage>
      <Card t={t} at={78.4} out={80.2} y={300} w={900}>
        <Arab size={124}>سَلَـٰمٌ عَلَىٰٓ إِبْرَٰهِيمَ</Arab>
        <Body c={C.cream} size={48}>Salam sejahtera bagi Ibrahim</Body>
        <Src>QS 37:109</Src>
      </Card>
      <Card t={t} at={80.3} y={320} w={860}>
        <Big size={76} c={C.goldHi}>Kisah dalam Al-Qur'an</Big>
        <div style={{ opacity: ease(t, 81.8, 82.2) }}><Body c={C.cream} size={50}>bersama <span style={{ color: C.goldHi, fontWeight: 800 }}>AUDIRA</span></Body></div>
      </Card>
    </AbsoluteFill>
  );
};

// ---------- caption karaoke (waktu VO = t - VO_OFFSET) ----------
type W = { text: string; start: number; end: number };
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  (WORDS as W[]).forEach((w, i, a) => {
    cur.push(w);
    const next = a[i + 1];
    if (!next || cur.length >= 5 || (/[.,?!:]$/.test(w.text) && cur.length >= 2) || /[.?!:]$/.test(w.text) || next.start - w.end > 0.5) { out.push(cur); cur = []; }
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t: tf }) => {
  const t = tf - VO_OFFSET;
  if (tf >= OUTRO_AT - 0.1) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.12 && t < (CHUNKS[i + 1]?.[0].start ?? ch[ch.length - 1].end + 0.6) - 0.12);
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  if (t > ch[ch.length - 1].end + 0.8) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1395, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(8,18,42,0.9)", borderRadius: 18, padding: "18px 30px", maxWidth: 980, textAlign: "center", border: "3px solid #d4af37", boxShadow: "0 0 0 2px #0a1428, 6px 8px 16px rgba(4,9,20,0.5)" }}>
        {ch.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const s = active ? 1 + 0.04 * Math.sin(clamp((t - w.start) / 0.18) * Math.PI / 2) : 1;
          return <span key={i} style={{ display: "inline-block", fontFamily: INTER, fontWeight: 800, fontSize: 58, lineHeight: 1.25, color: active ? C.goldHi : C.cream, marginRight: i < ch.length - 1 ? "0.4em" : 0, transform: `scale(${s})` }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- director ----------
const SCENES: [number, number, React.FC<SP>][] = [
  [0, 7.4, S1], [7.4, 18.6, S2], [18.6, 27.3, S3], [27.3, 35.6, S4], [35.6, 41.6, S4b], [41.6, 50.7, S5],
  [50.7, 56.5, S6a], [56.5, 63.7, S6b], [63.7, 66.8, S7a], [66.8, 71.0, S7b], [71.0, 78.3, S8], [78.3, OUTRO_AT + 0.4, S9],
];
const XF = 0.35;

export const Ismail: React.FC<{ cover?: boolean }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = cover ? 31.6 : frame / fps;
  const u = width / 1080;
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${u})`, transformOrigin: "0 0" }}>
        {SCENES.map(([a, b, S], i) => {
          if (t < a || t >= b + XF) return null;
          const fadeIn = i === 0 ? 1 : clamp((t - a) / XF);
          // dolly kontinu per adegan (kamera tidak pernah parkir)
          const lt = t - a;
          const dz = 1 + 0.045 * lt;
          const dx = Math.sin(lt * 1.1 + i) * 55 + (i % 2 ? -1 : 1) * lt * 9;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 1100px", transform: `translate(${dx.toFixed(2)}px, ${((1 - fadeIn) * 24).toFixed(2)}px) scale(${dz.toFixed(4)})` }}>
                <S t={t} />
              </div>
              <FgDepth i={i} lt={lt} />
            </div>
          );
        })}
        <MihrabFrame t={t} />
        <Grain />
        {!cover ? (
          <HudCtx.Provider value={true}>
            {SCENES.map(([a, b, S], i) => {
              if (t < a || t >= b + XF) return null;
              const fadeIn = i === 0 ? 1 : clamp((t - a) / XF);
              return <div key={i} style={{ position: "absolute", inset: 0, opacity: fadeIn }}><S t={t} /></div>;
            })}
          </HudCtx.Provider>
        ) : null}
        {t < OUTRO_AT && !cover ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center" }}>
            <span style={{ padding: "2px 18px", borderRadius: 8, background: "rgba(8,18,42,0.9)", border: "2px solid #d4af37", color: C.cream, fontFamily: INTER, fontWeight: 800, fontSize: 36, letterSpacing: 1 }}>SOSOK NABI TIDAK DIGAMBARKAN</span>
          </div>
        ) : null}
        {cover ? (
          <div style={{ position: "absolute", left: 90, right: 90, top: 250, textAlign: "center" }}>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: C.goldHi }}>KISAH DALAM AL-QUR'AN</div>
            <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: 112, lineHeight: 1.02, color: C.cream, textShadow: "0 4px 0 #08122a, 0 0 24px rgba(8,18,42,0.9)" }}>Ibrahim, Ismail & Mimpi</div>
            <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 84, color: C.goldHi, direction: "rtl" }}>يَـٰٓأَبَتِ ٱفْعَلْ مَا تُؤْمَرُ</div>
          </div>
        ) : <Captions t={t} />}
      </div>
      {!cover && t >= OUTRO_AT - 0.2 ? <AudiraOutro seconds={ISMAIL_SECONDS - OUTRO_AT} /> : null}
      {!cover ? <AudiraSignature seed="ep23-ismail-qurban" /> : null}
    </AbsoluteFill>
  );
};

export const IsmailCover: React.FC = () => <Ismail cover />;
