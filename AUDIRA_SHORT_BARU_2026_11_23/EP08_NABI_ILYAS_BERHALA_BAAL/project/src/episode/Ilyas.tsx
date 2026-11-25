// EP08 — Nabi Ilyas AS dan Berhala Ba'l (AUDIRA QISSAH). Style: MANUSCRIPT (iluminasi naskah di meja walnut berlilin), Remotion 2D (SVG/CSS, tanpa R3F).
// Adab: Nabi Ilyas tidak digambarkan dalam bentuk apa pun (tanpa tubuh/siluet/tangan/bayangan).
// Kehadiran = cahaya lentera, jejak kaki, tongkat bersandar, teks seruan. Kaum = siluet kecil tanpa wajah.
// Semua nilai fungsi murni dari t (frame / fps): seek-safe, tanpa Math.random.
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

export const ILYAS_SECONDS = 87.5;
const OUTRO_AT = 84.5;

// ---------- palet (docs/ART_DIRECTION.md) ----------
const C = {
  cream: "#F3E6C6", sand: "#D9B98A", ochre: "#D9A441", terra: "#B5552E", brown: "#3A2212",
  duskA: "#E9B36A", duskB: "#8A4A2A", nightA: "#21140B", nightB: "#3E2716",
  lamp: "#FFD07A", gold: "#D9A441", goldHi: "#FFD07A", bronze: "#7A5A32", bronzeD: "#3E2A16", shade: "#2A1A12",
  ink: "#2A170C", rubric: "#8A2A14", oxblood: "#5A1E12", walnut: "#2A170C", vellum: "#EBD9B0", olive: "#6E6A3A", neutral: "#6A5A48",
};

// ---------- waktu adegan (detik VO, lihat SHOTLIST.md) ----------
const T = { s1: 0, s1b: 7.4, s2: 11.8, s2b: 19.4, s3: 23.7, s3b: 26.4, s4: 31.4, s5: 39.6, s5b: 43.0, s5c: 49.8, s6: 53.0, s7: 61.5, s8: 66.6, s8b: 72.1, s8c: 78.1, s9: 81.2 };

// ---------- helper ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.2, 1) });
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const pop = (t: number, at: number) => { const k = lin(t, at, at + 0.35); return k <= 0 ? 0 : 1 + Math.sin(k * Math.PI) * 0.06 - (1 - k) * 0.1; };
const mulberry = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };

/** Garis punggung bukit/bukit pasir bertepi kertas potong, diisi sampai bawah frame. */
const ridge = (y: number, amp: number, seed: number, waves = 3, bottom = 2400, x0 = -300, x1 = 1380) => {
  const r = mulberry(seed);
  const ph = r() * 6.28;
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 30) {
    const yy = y + Math.sin((x / (x1 - x0)) * Math.PI * waves + ph) * amp + (r() - 0.5) * 7;
    d += ` L${x},${yy.toFixed(1)}`;
  }
  return d + ` L${x1},${bottom} Z`;
};

/** Persegi bertepi sobek. */
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
/** Transformasi lapisan parallax: d = 0.2 (BG) / 0.5 (MG) / 1 (FG). */
const L = (c: Cam, d: number) => {
  const s = 1 + (c.z - 1) * d;
  return `translate(540 960) scale(${s.toFixed(4)}) translate(${(-540 + c.x * d).toFixed(2)} ${(-960 + c.y * d).toFixed(2)})`;
};

// ---------- defs bersama (bayangan kertas, serat, glow) ----------
const Defs: React.FC = () => (
  <defs>
    {/* MANUSCRIPT: garis tepi tinta gelap (miniatur iluminasi) + bayangan lembut cahaya lilin */}
    <filter id="pp" x="-15%" y="-15%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="d" />
      <feFlood floodColor="#2A170C" floodOpacity="0.92" />
      <feComposite in2="d" operator="in" result="ink" />
      <feGaussianBlur in="d" stdDeviation="6" result="sb" />
      <feOffset in="sb" dx="8" dy="12" result="so" />
      <feFlood floodColor="#1a0d06" floodOpacity="0.38" />
      <feComposite in2="so" operator="in" result="sh" />
      <feMerge><feMergeNode in="sh" /><feMergeNode in="ink" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="ppS" x="-10%" y="-10%" width="130%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d" />
      <feFlood floodColor="#2A170C" floodOpacity="0.9" />
      <feComposite in2="d" operator="in" result="ink" />
      <feMerge><feMergeNode in="ink" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    {/* langit daun emas: lembar-lembar persegi bertepi samar */}
    <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2C766" /><stop offset="0.5" stopColor="#D9A441" /><stop offset="1" stopColor="#B07A2A" /></linearGradient>
    <pattern id="goldLeaf" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#goldG)" />
      <rect x="0.5" y="0.5" width="119" height="119" fill="none" stroke="#8A5A1A" strokeWidth="1.2" opacity="0.35" />
      <path d="M0,60 L120,60 M60,0 L60,120" stroke="#FFE3A0" strokeWidth="1" opacity="0.18" />
    </pattern>
    <filter id="blur18"><feGaussianBlur stdDeviation="18" /></filter>
    <filter id="dof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5" /></filter>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6DDA8" stopOpacity="0" /><stop offset="0.55" stopColor="#F6DDA8" stopOpacity="0.55" /><stop offset="1" stopColor="#F6DDA8" stopOpacity="0.15" /></linearGradient>
    <linearGradient id="hazeN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6A4A2E" stopOpacity="0" /><stop offset="0.6" stopColor="#8A6440" stopOpacity="0.45" /><stop offset="1" stopColor="#6A4A2E" stopOpacity="0.1" /></linearGradient>
    <linearGradient id="bronzeHi" x1="0" x2="1"><stop offset="0" stopColor="#3E2A16" /><stop offset="0.3" stopColor="#C8954A" /><stop offset="0.5" stopColor="#8A6232" /><stop offset="1" stopColor="#24160A" /></linearGradient>
    <filter id="blur40"><feGaussianBlur stdDeviation="40" /></filter>
    <radialGradient id="lampGlow"><stop offset="0" stopColor={C.lamp} stopOpacity="0.95" /><stop offset="0.45" stopColor={C.lamp} stopOpacity="0.35" /><stop offset="1" stopColor={C.lamp} stopOpacity="0" /></radialGradient>
    <radialGradient id="sunGlow"><stop offset="0" stopColor="#FFF1C9" /><stop offset="0.35" stopColor="#FFD27A" stopOpacity="0.8" /><stop offset="1" stopColor="#E9B36A" stopOpacity="0" /></radialGradient>
    <linearGradient id="bronze" x1="0" x2="1"><stop offset="0" stopColor={C.bronzeD} /><stop offset="0.45" stopColor={C.bronze} /><stop offset="1" stopColor="#2A1A0E" /></linearGradient>
  </defs>
);

/** Serat kertas statis di atas seluruh frame. */
const Grain: React.FC = () => (
  <>
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen", opacity: 0.22, pointerEvents: "none" }}>
    <filter id="pulpL"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="29" /><feColorMatrix values="0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 1.5 -0.6" /></filter>
    <rect width="1080" height="1920" filter="url(#pulpL)" />
  </svg>
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.3, pointerEvents: "none" }}>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.9 0" /></filter>
    <rect width="1080" height="1920" filter="url(#grain)" />
    <filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="21" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 1.4 -0.35" /></filter>
    <rect width="1080" height="1920" filter="url(#mottle)" opacity="0.9" />
    <filter id="fiber"><feTurbulence type="turbulence" baseFrequency="0.02 0.6" numOctaves="2" seed="5" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.7 -0.1" /></filter>
    <rect width="1080" height="1920" filter="url(#fiber)" opacity="0.6" />
    <filter id="pulp"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="13" /><feColorMatrix values="0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 1.6 -0.55" /></filter>
    <rect width="1080" height="1920" filter="url(#pulp)" />
  </svg>
  </>
);

// ---------- MANUSCRIPT: meja walnut, lilin, folio vellum, perkakas penulis ----------
// BLOK SIAP SISIP: ganti bagian dari "/** Key light hangat dari kiri-atas" sampai sebelum "// ---------- objek kertas ----------" di Ilyas.tsx.
/** Jendela miniatur di dalam folio (koordinat frame 1080×1920). */
const WIN = { x: 92, y: 238, w: 896, h: 1062 };
const PAGE = { x: 40, y: 188, w: 1000, h: 1392 };
/** Konfigurasi meja per babak: sisi lilin, redup, perkakas depan (tidak berulang berurutan). */
const DESK: { side: -1 | 1; dim: number; fg: string }[] = [
  { side: -1, dim: 1, fg: "quill" }, { side: 1, dim: 1, fg: "ribbon" }, { side: -1, dim: 1, fg: "lens" }, { side: 1, dim: 0.9, fg: "seal" },
  { side: -1, dim: 1, fg: "knife" }, { side: 1, dim: 0.9, fg: "dividers" }, { side: -1, dim: 0.62, fg: "pounce" }, { side: 1, dim: 0.95, fg: "ruler" },
  { side: -1, dim: 1.12, fg: "sealquill" }, { side: 1, dim: 1, fg: "book" },
];

const Candle: React.FC<{ x: number; y: number; t: number; dim: number }> = ({ x, y, t, dim }) => {
  const f = 1 + Math.sin(t * 8.3) * 0.05 + Math.sin(t * 13.1) * 0.04;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={300 * f} fill="url(#lampGlowD)" opacity={0.75 * dim} />
      <ellipse cx="0" cy="250" rx="120" ry="26" fill="#6E4A22" />
      <rect x="-112" y="232" width="224" height="22" rx="8" fill="#8E6A2E" />
      <path d="M-58,30 Q-62,0 -50,-8 L50,-8 Q60,4 58,30 L58,240 L-58,240 Z" fill="#EBD9B0" />
      <path d="M-58,30 L-58,240 L-30,240 L-30,20 Z" fill="#B89A6E" opacity="0.55" />
      <path d="M20,-8 Q26,30 18,70 Q30,60 34,-6 Z" fill="#F7EBD0" opacity="0.9" />
      <rect x="-3" y="-34" width="6" height="28" fill="#2A170C" />
      <path d={`M0,${-34 - 70 * f} C${-20 * f},-60 -20,-36 0,-30 C20,-36 ${20 * f},-60 0,${-34 - 70 * f} Z`} fill="#FFB848" />
      <path d={`M0,${-34 - 46 * f} C-9,-54 -9,-38 0,-34 C9,-38 9,-54 0,${-34 - 46 * f} Z`} fill="#FFF1C9" />
    </g>
  );
};

const BOOKS: [string, number, number][] = [["#5A1E12", 300, 64], ["#4A3A1E", 340, 58], ["#6E3A1A", 280, 70], ["#3A2212", 320, 52]];
const Books: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#blur3)">
    {BOOKS.map(([c, w, h], i) => {
      const yy = -BOOKS.slice(0, i + 1).reduce((s, v) => s + v[2], 0);
      return (
        <g key={i} transform={`translate(${i % 2 ? 14 : -10} ${yy})`}>
          <rect x={-w / 2} y="0" width={w} height={h} rx="8" fill={c} />
          <rect x={-w / 2} y={h * 0.28} width={w} height="5" fill="#D9A441" opacity="0.8" />
          <rect x={-w / 2} y={h * 0.68} width={w} height="5" fill="#D9A441" opacity="0.8" />
          <rect x={-w / 2 + 6} y="4" width={w - 12} height="6" rx="3" fill="#F3E6C6" opacity="0.18" />
        </g>
      );
    })}
  </g>
);

/** Meja walnut berserat + lilin (key light) + kitab di tepi atas. Di belakang folio. */
const Desk: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const d = DESK[i];
  const cx = d.side < 0 ? 150 : 930;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <filter id="wood" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.09" numOctaves="4" seed={7 + i} />
          <feColorMatrix values="0 0 0 0 0.30  0 0 0 0 0.17  0 0 0 0 0.08  0 0 0 1.6 -0.45" />
        </filter>
        <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
        <radialGradient id="lampGlowD"><stop offset="0" stopColor="#FFD07A" stopOpacity="0.95" /><stop offset="0.45" stopColor="#FFD07A" stopOpacity="0.32" /><stop offset="1" stopColor="#FFD07A" stopOpacity="0" /></radialGradient>
        <linearGradient id="walnutG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E1008" /><stop offset="0.5" stopColor="#3A2010" /><stop offset="1" stopColor="#24120A" /></linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#walnutG)" />
      <rect width="1080" height="1920" filter="url(#wood)" opacity="0.85" />
      {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M-20,${130 + k * 215} C300,${110 + k * 215 + (k % 3) * 18} 700,${150 + k * 215} 1100,${125 + k * 215}`} stroke="#1A0C05" strokeWidth={2 + (k % 3)} fill="none" opacity="0.35" />)}
      <Books x={d.side < 0 ? 860 : 210} y={170} />
      <Candle x={cx} y={-10} t={t} dim={d.dim} />
    </svg>
  );
};

/** Lembar vellum (hero) dengan tepi deckle, serat, dan margin bertulisan tinta pudar. */
const Folio: React.FC<{ i: number }> = ({ i }) => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <filter id="vel" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="4" seed={40 + i} />
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.40  0 0 0 0 0.22  0 0 0 1.2 -0.4" />
      </filter>
      <filter id="pageSh" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="14" dy="22" stdDeviation="16" floodColor="#0c0603" floodOpacity="0.7" /></filter>
      <radialGradient id="velG" cx="0.35" cy="0.25" r="0.9"><stop offset="0" stopColor="#F6E9CB" /><stop offset="0.6" stopColor="#E6D0A2" /><stop offset="1" stopColor="#C9A86E" /></radialGradient>
    </defs>
    <path d={torn(PAGE.x, PAGE.y, PAGE.w, PAGE.h, 300 + i, 9)} fill="url(#velG)" filter="url(#pageSh)" />
    <path d={torn(PAGE.x, PAGE.y, PAGE.w, PAGE.h, 300 + i, 9)} filter="url(#vel)" opacity="0.55" />
    {Array.from({ length: 6 }, (_, k) => <rect key={k} x={110 + (k % 2) * 20} y={1334 + k * 36} width={860 - (k % 3) * 120} height="8" rx="4" fill="#3A2212" opacity="0.16" />)}
    <rect x="102" y="1330" width="56" height="62" rx="4" fill="#8A2A14" opacity="0.55" />
  </svg>
);

/** Bingkai iluminasi di atas miniatur: aturan emas ganda + ornamen sudut. */
const FolioFrame: React.FC<{ t: number }> = ({ t }) => {
  const sh = 0.6 + Math.sin(t * 1.3) * 0.12;
  const corner = (x: number, y: number, r: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0,0 L70,0 Q40,10 30,30 Q10,40 0,70 Z" fill="#D9A441" stroke="#2A170C" strokeWidth="3" />
      <circle cx="22" cy="22" r="9" fill="#8A2A14" stroke="#2A170C" strokeWidth="2" />
      <path d="M8,8 L48,8 M8,8 L8,48" stroke="#FFE3A0" strokeWidth="2" opacity={sh} />
    </g>
  );
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="none" stroke="#2A170C" strokeWidth="5" />
      <rect x={WIN.x - 12} y={WIN.y - 12} width={WIN.w + 24} height={WIN.h + 24} fill="none" stroke="#D9A441" strokeWidth="7" />
      <rect x={WIN.x - 12} y={WIN.y - 12} width={WIN.w + 24} height={WIN.h + 24} fill="none" stroke="#2A170C" strokeWidth="1.5" opacity="0.8" />
      <rect x={WIN.x - 24} y={WIN.y - 24} width={WIN.w + 48} height={WIN.h + 48} fill="none" stroke="#B5552E" strokeWidth="2.5" opacity="0.8" />
      {corner(WIN.x - 26, WIN.y - 26, 0)}{corner(WIN.x + WIN.w + 26, WIN.y - 26, 90)}{corner(WIN.x + WIN.w + 26, WIN.y + WIN.h + 26, 180)}{corner(WIN.x - 26, WIN.y + WIN.h + 26, 270)}
    </svg>
  );
};

/** Perkakas meja di depan folio (FG), berbeda tiap babak, sedikit blur. */
const DeskFG: React.FC<{ lt: number; i: number }> = ({ lt, i }) => {
  const kind = DESK[i].fg;
  const px = Math.sin(lt * 0.4 + i) * 40;
  const quill = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0,0 C80,-60 260,-150 470,-170 C330,-110 170,-40 40,18 Z" fill="#EFE4CC" />
      <path d="M0,0 C110,-70 300,-150 470,-170" stroke="#6A5A48" strokeWidth="4" fill="none" />
      {Array.from({ length: 12 }, (_, k) => <path key={k} d={`M${60 + k * 32},${-34 - k * 10} l-14,${30 + (k % 3) * 4}`} stroke="#B8A584" strokeWidth="2" />)}
      <path d="M0,0 L-60,32" stroke="#2A170C" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
  const seal = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      <path d={Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * Math.PI * 2, rr = 104 + (k % 3) * 7; return `${k ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }).join(" ") + " Z"} fill="#7A1E10" />
      <circle r="78" fill="#962A16" />
      <circle r="66" fill="none" stroke="#5A1208" strokeWidth="5" />
      <circle r="78" fill="none" stroke="#C85A3A" strokeWidth="3" opacity="0.6" />
      {/* monogram A AUDIRA (path, bukan teks) */}<path d="M-34,36 L0,-44 L34,36 M-18,8 L18,8" stroke="#5A1208" strokeWidth="11" fill="none" strokeLinejoin="round" /><path d="M-34,36 L0,-44 L34,36 M-18,8 L18,8" stroke="#C85A3A" strokeWidth="2" fill="none" opacity="0.7" />
    </g>
  );
  const ink = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="120" rx="110" ry="26" fill="#000" opacity="0.4" />
      <path d="M-90,120 L-100,20 Q-60,-14 0,-16 Q60,-14 100,20 L90,120 Z" fill="#160A04" />
      <rect x="-44" y="-50" width="88" height="40" rx="8" fill="#B58A3A" />
      <path d="M-70,10 Q-40,-6 -10,0" stroke="#FFD07A" strokeWidth="6" opacity="0.55" fill="none" />
    </g>
  );
  const pot = (x: number, y: number, c1: string, c2: string, holes: boolean) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-60" y="-40" width="120" height="170" rx="16" fill={c1} />
      <ellipse cx="0" cy="-40" rx="60" ry="16" fill={c2} />
      {holes ? Array.from({ length: 9 }, (_, k) => <circle key={k} cx={-30 + (k % 3) * 30} cy={-44 + (Math.floor(k / 3) - 1) * 6} r="4" fill="#2A170C" />) : null}
    </g>
  );
  let body: React.ReactNode = null;
  if (kind === "quill") body = <>{ink(180, 1700)}{quill(330, 1800, -12)}</>;
  else if (kind === "ribbon") body = <><path d="M760,1520 C790,1640 700,1720 760,1920" stroke="#8A2A14" strokeWidth="46" fill="none" /><path d="M750,1520 C780,1640 690,1720 750,1920" stroke="#B5552E" strokeWidth="8" fill="none" opacity="0.6" />{quill(110, 1860, -18)}</>;
  else if (kind === "lens") body = <g transform="translate(300 1720) rotate(-20)"><rect x="110" y="-18" width="300" height="36" rx="16" fill="#4A2A16" /><circle r="132" fill="rgba(255,226,160,0.16)" stroke="#B58A3A" strokeWidth="24" /><path d="M-70,-70 Q-40,-100 0,-104" stroke="#FFF1C9" strokeWidth="10" fill="none" opacity="0.7" /></g>;
  else if (kind === "seal") body = <>{seal(260, 1730)}{pot(800, 1700, "#8E6A2E", "#B58A3A", true)}</>;
  else if (kind === "knife") body = <>{ink(860, 1700)}<g transform="translate(160 1790) rotate(-14)"><rect x="0" y="-16" width="220" height="32" rx="14" fill="#D8C8A6" /><path d="M220,-14 L420,-2 L220,16 Z" fill="#8A7A66" /><path d="M230,-10 L400,-2" stroke="#E8DCC4" strokeWidth="3" /></g></>;
  else if (kind === "dividers") body = <g transform="translate(540 1600)"><path d="M0,0 L-170,300" stroke="#B58A3A" strokeWidth="18" strokeLinecap="round" /><path d="M0,0 L170,300" stroke="#9A7430" strokeWidth="18" strokeLinecap="round" /><circle r="26" fill="#D9A441" stroke="#2A170C" strokeWidth="3" /></g>;
  else if (kind === "pounce") body = <>{pot(220, 1740, "#6E5228", "#8E6A2E", false)}<path d="M600,1640 C700,1700 820,1700 980,1660" stroke="#3A2212" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.9" /></>;
  else if (kind === "ruler") body = <g transform="translate(120 1700) rotate(-6)"><rect width="860" height="70" rx="6" fill="#A87A44" />{Array.from({ length: 28 }, (_, k) => <rect key={k} x={20 + k * 30} y="0" width="3" height={k % 5 ? 18 : 34} fill="#2A170C" />)}</g>;
  else if (kind === "sealquill") body = <>{seal(830, 1730)}{quill(80, 1840, -16)}</>;
  else if (kind === "book") body = <g transform="translate(540 1760)"><rect x="-300" y="-70" width="600" height="160" rx="14" fill="#5A1E12" /><rect x="-300" y="-70" width="600" height="20" rx="8" fill="#EBD9B0" opacity="0.7" /><rect x="-240" y="-30" width="480" height="8" fill="#D9A441" /><rect x="-240" y="40" width="480" height="8" fill="#D9A441" /></g>;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", filter: "blur(1.6px) drop-shadow(10px 16px 10px rgba(8,4,2,0.6))" }}>
      <g transform={`translate(${px.toFixed(1)} 0)`}>{body}</g>
    </svg>
  );
};

/** Cahaya lilin DI DALAM miniatur: hotspot hangat dari sisi lilin, kolam bayangan di sisi jauh & bawah, tekstur cat/vellum. */
const MiniLight: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const d = DESK[i];
  const fl = 1 + Math.sin(t * 7.1) * 0.04 + Math.sin(t * 11.3) * 0.02;
  const hx = d.side < 0 ? "18%" : "82%";
  return (
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", background: `radial-gradient(ellipse 120% 85% at ${hx} 8%, rgba(255,255,255,1) 0%, rgba(235,205,160,0.95) 38%, rgba(120,70,30,0.9) 78%, rgba(40,18,6,0.95) 100%), linear-gradient(to ${d.side < 0 ? "right" : "left"}, rgba(255,255,255,0) 55%, rgba(60,30,10,0.35) 100%)`, opacity: Math.min(1, 0.8 * (2 - d.dim)) }} />
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.55 * d.dim * fl, background: `radial-gradient(ellipse 55% 40% at ${hx} 10%, rgba(255,214,140,0.85) 0%, rgba(255,190,100,0.25) 55%, rgba(0,0,0,0) 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(30,14,4,0.5) 0%, rgba(30,14,4,0) 28%)`, mixBlendMode: "multiply" }} />
      <svg viewBox="0 0 896 1062" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.5 }}>
        <filter id={`paint${i}`}><feTurbulence type="fractalNoise" baseFrequency="0.018 0.035" numOctaves="4" seed={70 + i} /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.25  0 0 0 1.1 -0.25" /></filter>
        <rect width="896" height="1062" filter={`url(#paint${i})`} />
        <filter id={`brush${i}`}><feTurbulence type="turbulence" baseFrequency="0.004 0.12" numOctaves="2" seed={90 + i} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.8 -0.2" /></filter>
        <rect width="896" height="1062" filter={`url(#brush${i})`} opacity="0.6" />
      </svg>
      {/* tepi dalam daun emas (iluminasi) */}
      <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 10px rgba(217,164,65,0.9), inset 0 0 0 13px #2A170C, inset 0 0 50px 18px rgba(30,14,4,${(0.45 + (1 - d.dim) * 0.4).toFixed(2)})` }} />
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 10, background: `linear-gradient(90deg, rgba(255,230,160,0) ${d.side < 0 ? 0 : 40}%, rgba(255,236,170,${(0.9 * fl).toFixed(2)}) ${d.side < 0 ? 18 : 82}%, rgba(255,230,160,0) ${d.side < 0 ? 60 : 100}%)` }} />
    </div>
  );
};

/** Cahaya lilin sebagai key light: soft-light hangat dari sisi lilin + vinyet gelap. */
const CandleKey: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const d = DESK[i];
  const fl = 1 + Math.sin(t * 7.1) * 0.03;
  const at = d.side < 0 ? "12% 2%" : "88% 2%";
  return (
    <>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "soft-light", opacity: Math.min(1, 0.85 * d.dim * fl), background: `radial-gradient(ellipse 95% 75% at ${at}, rgba(255,208,122,0.95) 0%, rgba(232,160,64,0.4) 45%, rgba(20,10,4,0.55) 100%)` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "multiply", background: `radial-gradient(ellipse 80% 70% at ${d.side < 0 ? "40%" : "60%"} 42%, rgba(0,0,0,0) 52%, rgba(26,12,4,${(0.55 + (1 - d.dim) * 0.6).toFixed(2)}) 100%)` }} />
    </>
  );
};

// ---------- objek kertas ----------
const Stars: React.FC<{ t: number; n?: number; seed?: number; h?: number }> = ({ t, n = 60, seed = 3, h = 1100 }) => {
  const r = mulberry(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * 1200 - 60, y = r() * h, s = 2 + r() * 4, ph = r() * 6.28;
        return <circle key={i} cx={x} cy={y} r={s} fill="#FFF3D6" opacity={0.45 + 0.45 * Math.sin(t * 2.2 + ph) ** 2} />;
      })}
    </g>
  );
};

const Lantern: React.FC<{ x: number; y: number; s?: number; t: number; on?: number }> = ({ x, y, s = 1, t, on = 1 }) => {
  const f = 1 + Math.sin(t * 9) * 0.04 + Math.sin(t * 13.7) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={260 * f} fill="url(#lampGlow)" opacity={0.9 * on} />
      <g filter="url(#pp)">
        <path d="M-40,-150 Q0,-210 40,-150" stroke={C.brown} strokeWidth="9" fill="none" />
        <rect x="-62" y="-150" width="124" height="26" rx="6" fill={C.brown} />
        <path d="M-70,-124 Q-96,0 -70,110 L70,110 Q96,0 70,-124 Z" fill={C.cream} />
        <path d="M-70,-124 Q-96,0 -70,110 L70,110 Q96,0 70,-124 Z" fill={C.lamp} opacity={0.55 * on * f} />
        {[-40, 0, 40].map((k) => <path key={k} d={`M${k},-124 Q${k * 1.35},0 ${k},110`} stroke={C.terra} strokeWidth="5" fill="none" opacity="0.7" />)}
        <ellipse cx="0" cy="10" rx={22 * f} ry={34 * f} fill="#FFF1C9" opacity={on} />
        <rect x="-66" y="110" width="132" height="24" rx="6" fill={C.brown} />
      </g>
    </g>
  );
};

const Page: React.FC<{ x: number; y: number; w: number; h: number; seed: number; tag?: string; rot?: number; open?: number }> = ({ x, y, w, h, seed, tag, rot = 0, open = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${open} 1)`} filter="url(#pp)">
    <path d={torn(-w / 2, -h / 2, w, h, seed, 6)} fill={C.cream} />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-w / 2 + 28} y={-h / 2 + 70 + i * 34} width={w - 56 - (i % 3) * 30} height="9" rx="4" fill={C.brown} opacity="0.28" />)}
    <path d={torn(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, seed + 1, 3)} fill="none" stroke={C.ochre} strokeWidth="4" opacity="0.8" />
    {tag ? (
      <g transform={`translate(0 ${-h / 2 - 6})`}>
        <rect x={-w / 2 + 10} y="-44" width={w - 20} height="52" rx="8" fill={C.terra} />
        <text x="0" y="-8" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize="30" fill={C.cream}>{tag}</text>
      </g>
    ) : null}
  </g>
);

const Dunes: React.FC<{ c: Cam; tint?: number; night?: boolean }> = ({ c, night }) => (
  <>
    <g transform={L(c, 0.35)} filter="url(#pp)"><path d={ridge(1180, 50, 11, 2.2)} fill={night ? "#5A3E26" : "#D9A86A"} /></g>
    <g transform={L(c, 0.6)} filter="url(#pp)"><path d={ridge(1330, 60, 12, 1.6)} fill={night ? "#6A4A2E" : C.sand} /></g>
    <g transform={L(c, 1)} filter="url(#pp)"><path d={ridge(1560, 46, 13, 1.2)} fill={night ? "#8A6A48" : "#F0D6A8"} /></g>
  </>
);

/** Siluet kaum kecil tanpa wajah (tinggi ±90 px). pose 0 = berdiri, 1 = bersujud. */
const Folk: React.FC<{ x: number; y: number; s?: number; pose?: number; fill?: string; flip?: boolean }> = ({ x, y, s = 1, pose = 0, fill = C.shade, flip }) => {
  const k = clamp(pose);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#ppS)">
      <path d={`M-20,0 Q-22,${-60 + k * 30} ${-4 + k * 26},${-70 + k * 40} Q${18 + k * 20},${-70 + k * 44} 20,0 Z`} fill={fill} />
      <circle cx={mix(0, 38, k)} cy={mix(-84, -24, k)} r="15" fill={fill} />
    </g>
  );
};

const Idol: React.FC<{ x: number; y: number; s?: number; crack?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#pp)">
    {/* alas bertingkat */}
    <rect x="-210" y="-60" width="420" height="60" fill="#6d5a4a" />
    <rect x="-160" y="-110" width="320" height="52" fill="#7d6a58" />
    <rect x="-210" y="-60" width="420" height="10" fill="#A8927A" />
    <rect x="-160" y="-110" width="320" height="8" fill="#A8927A" />
    {[-150, -60, 30, 120].map((k) => <rect key={k} x={k} y="-48" width="40" height="36" fill="none" stroke="#4A3A2E" strokeWidth="3" opacity="0.6" />)}
    {/* patung berdiri perunggu, wajah polos tanpa fitur (bukan makhluk bernyawa yang digambar rinci) */}
    {/* kaki melangkah */}
    <path d="M-60,-110 L-48,-250 L-14,-250 L-22,-110 Z" fill="url(#bronzeHi)" />
    <path d="M22,-110 L18,-250 L56,-250 L70,-110 Z" fill="url(#bronzeHi)" />
    {/* rok bergaris */}
    <path d="M-88,-240 L-70,-380 L70,-380 L92,-240 Z" fill="url(#bronzeHi)" />
    {[-0.6, -0.2, 0.2, 0.6].map((k) => <path key={k} d={`M${k * 70},-380 L${k * 92},-240`} stroke="#2A1A0E" strokeWidth="4" opacity="0.6" />)}
    <rect x="-76" y="-392" width="152" height="20" rx="4" fill="#D9A441" />
    {/* badan + bahu */}
    <path d="M-70,-380 L-92,-520 Q-60,-548 0,-550 Q60,-548 92,-520 L70,-380 Z" fill="url(#bronzeHi)" />
    {/* lengan kiri ke depan */}
    <path d="M-88,-515 L-150,-430 L-128,-412 L-70,-480 Z" fill="url(#bronzeHi)" />
    {/* lengan kanan terangkat memegang gada */}
    <path d="M86,-515 L150,-600 L176,-584 L104,-480 Z" fill="url(#bronzeHi)" />
    <rect x="150" y="-760" width="20" height="200" rx="8" fill="#3E2A16" transform="rotate(14 160 -640)" />
    <ellipse cx="186" cy="-760" rx="26" ry="34" fill="#5A4022" transform="rotate(14 160 -640)" />
    {/* kepala polos + helm kerucut bertanduk */}
    <rect x="-34" y="-610" width="68" height="64" rx="22" fill="url(#bronzeHi)" />
    <path d="M-40,-604 L0,-720 L40,-604 Z" fill="#5A4022" />
    <path d="M-40,-618 Q-96,-640 -100,-700" stroke="#C8954A" strokeWidth="12" fill="none" strokeLinecap="round" />
    <path d="M40,-618 Q96,-640 100,-700" stroke="#C8954A" strokeWidth="12" fill="none" strokeLinecap="round" />
    {/* sorotan lilin di tepi kiri + cetakan */}
    <path d="M-88,-240 L-70,-380 L-60,-380 L-76,-240 Z" fill="#F2C766" opacity="0.55" />
    <path d="M-90,-520 L-70,-380 L-62,-382 L-80,-520 Z" fill="#F2C766" opacity="0.5" />
    <path d="M-34,-600 L-34,-560 L-26,-560 L-26,-600 Z" fill="#F2C766" opacity="0.55" />
  </g>
);

const Gate: React.FC<{ x: number; y: number; s?: number; close?: number }> = ({ x, y, s = 1, close = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#pp)">
    <rect x="-330" y="-430" width="160" height="430" fill="#C9A27A" />
    <rect x="170" y="-430" width="160" height="430" fill="#C9A27A" />
    {[-330, -290, -250, -210, 170, 210, 250, 290].map((k) => <rect key={k} x={k + 4} y="-462" width="30" height="34" fill="#C9A27A" />)}
    <path d="M-170,-430 L170,-430 L170,0 L130,0 L130,-250 Q0,-360 -130,-250 L-130,0 L-170,0 Z" fill="#B88F66" />
    <rect x="-130" y="-300" width="260" height="300" fill="#1E120A" />
    <rect x={-130 - 130 * (1 - close)} y="-290" width="130" height="290" fill={C.brown} />
    <rect x={130 * (1 - close)} y="-290" width="130" height="290" fill="#6b4532" />
    {[-90, -50, 40, 80].map((k) => <rect key={k} x={k - 130 * (1 - close) * Math.sign(k)} y="-280" width="8" height="270" fill="#3a2418" opacity="0.5" />)}
  </g>
);

// ---------- HUD ----------
const Card: React.FC<{ t: number; at: number; out?: number; x?: number; y: number; w?: number; dark?: boolean; children: React.ReactNode; rot?: number }> = ({ t, at, out = 1e9, x = 540, y, w = 880, dark, children, rot = 0 }) => {
  const sIn = pop(t, at);
  const kOut = lin(t, out, out + 0.25);
  if (sIn <= 0 || kOut >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top: y, width: w, transform: `scale(${sIn * (1 - kOut * 0.1)}) rotate(${rot}deg)`, opacity: clamp(lin(t, at, at + 0.18)) * (1 - kOut),
      background: dark ? "linear-gradient(160deg, rgba(90,30,18,0.96), rgba(58,20,10,0.97))" : "linear-gradient(160deg, #F3E6C6, #E6D2A6)", color: dark ? C.goldHi : C.ink, borderRadius: 8, padding: "26px 34px",
      textShadow: dark ? "0 2px 0 #2A170C, 0 0 2px #2A170C, 0 0 10px rgba(42,23,12,0.8)" : "none",
      boxShadow: "0 0 0 3px #2A170C, inset 0 0 0 7px rgba(217,164,65,0.55), 10px 14px 24px rgba(20,10,4,0.55)", border: `4px solid ${C.ochre}`, textAlign: "center", boxSizing: "border-box",
    }}>{children}</div>
  );
};
const Kicker: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = "#8A2A14" }) => <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, letterSpacing: 3, color: c, textTransform: "uppercase" }}>{children}</div>;
const Big: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 66, c }) => <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: size, lineHeight: 1.12, color: c }}>{children}</div>;
const Body: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 36 }) => <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: size, lineHeight: 1.3, marginTop: 8 }}>{children}</div>;
const Arab: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 64, c = C.brown }) => <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: size, direction: "rtl", lineHeight: 1.6, color: c }}>{children}</div>;

// ---------- Adegan ----------
type SP = { t: number };
const Svg: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
  <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: "hidden", background: bg }}>
    <svg viewBox="0 520 1080 1272" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "sepia(0.16) saturate(0.96) contrast(1.05)" }}><Defs />{children}</svg>
    <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(42,23,12,0.55)", pointerEvents: "none" }} />
  </div>
);

/** S1 Hook: gurun malam, lentera, dua lembar surah, salam; lalu judul. */
const S1: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1, 1.22, ease(t, 0, 11.8)), x: Math.sin(t * 0.4) * 14, y: mix(0, -60, ease(t, 0, 11.8)) };
  const open = ease(t, 0.4, 1.4);
  const sal = ease(t, 3.4, 4.4);
  const titleK = ease(t, 7.4, 8.1);
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(${C.nightA}, ${C.nightB})`}>
        <g transform={L(c, 0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#none)" />
          <Stars t={t} />
          <g filter="url(#pp)"><path d="M860,260 a90,90 0 1,0 40,170 a70,70 0 1,1 -40,-170 Z" fill="#F6E7B8" /></g>
        </g>
        <Dunes c={c} night />
        <g transform={L(c, 1)}>
          <Page x={300} y={1290} w={260} h={330} seed={21} tag="Al-An'am" rot={-8} open={open} />
          <Page x={780} y={1290} w={260} h={330} seed={22} tag="Ash-Shaffat" rot={8} open={open} />
          <Lantern x={540} y={1250} s={1.15} t={t} on={ease(t, 0, 0.8)} />
          <g opacity={sal} transform={`translate(540 ${840 - sal * 30})`}>
            <circle r="230" fill="url(#lampGlow)" opacity="0.6" />
          </g>
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640 - sal * 30, textAlign: "center", opacity: sal * (1 - titleK), transform: `scale(${0.9 + sal * 0.1})` }}>
        <Arab size={200} c="#FFE7A8">سَلَـٰمٌ</Arab>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, color: C.cream, letterSpacing: 4 }}>SALAM YANG DIABADIKAN</div>
      </div>
      <Card t={t} at={0.25} out={7.2} y={250} w={620}><Kicker>Namanya hanya disebut di</Kicker><Big size={92}><span style={{ display: "inline-block", transform: `scale(${t < 2.2 ? 1 : pop(t, 2.2)})`, color: t < 2.2 ? "#8A2A14" : undefined }}>{t < 2.2 ? "?" : "2"}</span> SURAH</Big><Body>Al-An'am · Ash-Shaffat</Body></Card>
      <Card t={t} at={7.5} y={300} w={900} dark rot={-1}>
        <Kicker c={C.ochre}>Kisah dalam Al-Qur'an</Kicker>
        <Big size={96} c={C.goldHi}>NABI ILYAS</Big>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 52, color: "#D9B07A", marginTop: 6, opacity: ease(t, 9.9, 10.5) }}>& berhala bernama <span style={{ color: C.ochre }}>Ba'al</span></div>
      </Card>
    </AbsoluteFill>
  );
};

/** S2 Konteks: empat plakat nama + stempel "para rasul". */
const S2: React.FC<SP> = ({ t }) => {
  const zIn = ease(t, 19.4, 20.4);
  const c: Cam = { z: mix(1, 1.6, zIn), x: mix(Math.sin(t * 0.5) * 20 - (t - 11.8) * 4, -371, zIn), y: mix(0, -40, zIn) };
  const names: [string, number][] = [["Zakaria", 14.8], ["Yahya", 15.7], ["Isa", 16.66], ["Ilyas", 13.95]];
  const stamp = ease(t, 22.85, 23.1);
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(#EAD8B6, #DCC39A)`}>
        <g transform={L(c, 0.2)}>
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={torn(-100 + (i % 3) * 420, 100 + Math.floor(i / 3) * 520, 380, 470, 40 + i, 8)} fill={i % 2 ? "#E4CFA8" : "#EEDDBC"} opacity="0.9" />)}
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={60 + (i % 4) * 320} cy={180 + Math.floor(i / 4) * 520} r="60" fill="none" stroke={C.ochre} strokeWidth="5" opacity="0.35" />)}
        </g>
        <g transform={L(c, 1)}><g transform="translate(0 250)">
          {/* lemari rak walnut berpanel daun emas di bawah plakat */}
          <g filter="url(#pp)">
            <rect x="60" y="1200" width="960" height="560" fill="#8A5A30" /><rect x="60" y="1200" width="960" height="16" fill="#C8954A" />
            {[0, 1, 2].map((k) => <g key={k}><rect x={100 + k * 310} y="1250" width="260" height="440" rx="10" fill="#3A2010" /><rect x={120 + k * 310} y="1270" width="220" height="400" rx="8" fill="url(#goldLeaf)" /><rect x={120 + k * 310} y="1270" width="220" height="400" rx="8" fill="none" stroke="#2A170C" strokeWidth="4" /><circle cx={230 + k * 310} cy="1470" r="46" fill="#8A2A14" stroke="#2A170C" strokeWidth="4" /><path d={`M${230 + k * 310},1438 l12,32 l-12,32 l-12,-32 Z`} fill="#F2C766" /></g>)}
          </g>
          <rect x="60" y="1180" width="960" height="40" fill="#7a4f37" filter="url(#pp)" />
          {/* mushaf kertas terbuka "Al-An'am" berdiri di rak sebelum plakat naik */}
          {(() => {
            const bk = ease(t, 11.9, 12.6) * (1 - ease(t, 13.7, 14.3));
            if (bk <= 0) return null;
            return (
              <g opacity={bk} transform={`translate(0 ${(1 - bk) * 40})`}>
                <circle cx="540" cy="960" r="300" fill="url(#lampGlow)" opacity="0.45" />
                <Page x={430} y={1010} w={220} h={300} seed={51} rot={-6} />
                <Page x={650} y={1010} w={220} h={300} seed={52} rot={6} />
                <path d="M300,1165 L780,1165 L760,1180 L320,1180 Z" fill="#5e3c29" filter="url(#ppS)" />
              </g>
            );
          })()}
          {names.map(([n], i) => <path key={`g${n}`} d={torn(170 + i * 247 - 105, 1180 - 300, 210, 300, 160 + i, 6)} fill="none" stroke={C.brown} strokeWidth="4" strokeDasharray="14 10" opacity={0.35} />)}
          {names.map(([n, at], i) => {
            const k = ease(t, at - 0.2, at + 0.4);
            const ilyas = n === "Ilyas";
            const x = 170 + i * 247;
            return (
              <g key={n} transform={`translate(${x} ${1180 - k * 20 + (1 - k) * 260})`} opacity={k}>
                <g filter="url(#pp)">
                  <path d={torn(-105, -300, 210, 300, 60 + i, 6)} fill={ilyas ? C.terra : C.cream} />
                  <path d={torn(-88, -282, 176, 264, 70 + i, 3)} fill="none" stroke={ilyas ? C.cream : C.ochre} strokeWidth="4" />
                </g>
                {ilyas ? <circle cx="0" cy="-160" r={120 + Math.sin(t * 3) * 6} fill="url(#lampGlow)" opacity={0.55} /> : null}
                <text x="0" y="-140" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize={ilyas ? 44 : 40} fill={ilyas ? C.cream : C.brown}>{n}</text>
                <rect x="-40" y="-100" width="80" height="6" fill={ilyas ? C.cream : C.ochre} />
                {ilyas ? (
                  <g transform={`translate(0 ${-210}) scale(${mix(2.2, 1, stamp)}) rotate(-12)`} opacity={stamp}>
                    <rect x="-118" y="-36" width="236" height="72" rx="8" fill="none" stroke="#9c2f1f" strokeWidth="7" />
                    <text x="0" y="12" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="42" fill="#9c2f1f">RASUL</text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </g></g>
      </Svg>
      <Card t={t} at={12.0} out={19.3} y={300} w={920}>
        <Kicker>QS Al-An'am 6:85</Kicker>
        <Arab size={54}>كُلٌّ مِّنَ ٱلصَّـٰلِحِينَ</Arab>
        <Body>"Semuanya termasuk orang-orang yang saleh"</Body>
      </Card>
      <Card t={t} at={19.5} y={260} w={920} dark>
        <Kicker c={C.ochre}>QS Ash-Shaffat 37:123</Kicker>
        <Arab size={56} c="#FFE7A8">وَإِنَّ إِلْيَاسَ لَمِنَ ٱلْمُرْسَلِينَ</Arab>
        <Body>Ilyas termasuk <span style={{ color: C.ochre }}>para rasul</span></Body>
      </Card>
    </AbsoluteFill>
  );
};

/** S3 Kota kuno (kaum penyembah Ba'al, tugu AUDIRA) lalu peta: Ba'labak, barat Damaskus. */
const S3: React.FC<SP> = ({ t }) => {
  const toMap = ease(t, 26.3, 27.0);
  const c: Cam = { z: mix(1.05, 1.2, ease(t, 23.7, 26.6)), x: -(t - 23.7) * 10, y: 0 };
  const cm: Cam = { z: mix(1.25, 1.0, ease(t, 26.4, 31.4)), x: mix(40, 0, ease(t, 26.4, 31.4)), y: mix(-40, 0, ease(t, 26.4, 31.4)) };
  const pin = ease(t, 29.2, 29.6);
  const r = mulberry(91);
  const houses = Array.from({ length: 11 }, (_, i) => ({ x: -40 + i * 110 + r() * 30, w: 90 + r() * 60, h: 120 + r() * 160 }));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - toMap }}>
        <Svg bg={`linear-gradient(${C.duskA}, #E9A77A 55%, ${C.duskB})`}>
          <g transform={L(c, 0.15)}><rect x="-200" y="300" width="1480" height="760" fill="url(#goldLeaf)" /><rect x="-200" y="860" width="1480" height="200" fill="#E9A77A" opacity="0.55" /></g>
          <g transform={L(c, 0.3)}><g filter="url(#dof)"><g filter="url(#pp)"><path d={ridge(980, 70, 31, 2)} fill="#B08A5E" /></g></g></g>
          <rect x="-200" y="800" width="1480" height="600" fill="url(#haze)" />
          <g transform={L(c, 0.55)}>
            {houses.map((h, i) => (
              <g key={i} filter="url(#pp)">
                <rect x={h.x} y={1240 - h.h} width={h.w} height={h.h + 200} fill={i % 2 ? "#D8B48A" : "#CFA57A"} />
                <rect x={h.x + h.w * 0.35} y={1240 - h.h + 30} width="22" height="30" fill="#5b3a29" opacity="0.7" />
              </g>
            ))}
            {/* menara pemujaan generik, bukan kuil Romawi */}
            <g filter="url(#pp)">
              <rect x="430" y="880" width="220" height="380" fill="#B07D56" />
              <rect x="460" y="800" width="160" height="90" fill="#A06F4A" />
              <rect x="495" y="740" width="90" height="70" fill="#8C6A3F" />
            </g>
          </g>
          <g transform={L(c, 1)}>
            <path d={ridge(1300, 30, 33, 1.4)} fill="#E7C08E" filter="url(#pp)" />
            {[200, 280, 360, 720, 800, 880].map((x, i) => <Folk key={i} x={x - (t - 23.7) * 6 * (i % 2 ? 1 : -1)} y={1310} s={0.95} fill="#3A2414" />)}
            {/* tugu batu AUDIRA (brand dalam adegan) */}
            <g transform="translate(240 1330)" filter="url(#pp)">
              <path d="M-70,0 L-55,-300 L55,-300 L70,0 Z" fill="#9d8a78" />
              <path d="M-55,-300 L0,-350 L55,-300 Z" fill="#8a7867" />
              <text x="0" y="-150" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize="40" fill="#4a3a2e" transform="rotate(-90 0 -150)" letterSpacing="6">AUDIRA</text>
            </g>
          </g>
        </Svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toMap }}>
        <Svg bg="#E9D7B4">
          <g transform={L(cm, 1)}>
            <path d={torn(60, 240, 960, 1100, 101, 10)} fill="#F1E2C2" filter="url(#pp)" />
            {/* laut tengah */}
            <path d="M60,240 L330,240 Q300,460 340,620 Q300,820 360,1000 Q320,1180 360,1340 L60,1340 Z" fill="#B9A57C" filter="url(#ppS)" />
            <text x="190" y="1060" fontFamily={INTER} fontWeight={800} fontSize="42" fill="#4A3A22" transform="rotate(-90 190 1060)">LAUT TENGAH</text>
            {/* pegunungan */}
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${420 + (i % 4) * 70},${560 + Math.floor(i / 4) * 160 + i * 18} l40,-80 l40,80 Z`} fill="#C79E6C" filter="url(#ppS)" />)}
            {/* Damaskus */}
            <circle cx="760" cy="980" r="18" fill={C.brown} />
            <text x="790" y="990" fontFamily={PLAYFAIR} fontWeight={800} fontSize="44" fill={C.brown}>Damaskus</text>
            {/* panah barat */}
            <path d={`M745,980 Q620,880 ${mix(745, 560, ease(t, 30.3, 31.0))},${mix(980, 760, ease(t, 30.3, 31.0))}`} stroke={C.terra} strokeWidth="8" strokeDasharray="18 14" fill="none" opacity={ease(t, 30.2, 30.5)} />
            {/* pin Ba'labak */}
            <g transform={`translate(560 ${740 - (1 - pin) * 260})`} opacity={pin}>
              <ellipse cx="0" cy="22" rx={30 * pin} ry="9" fill="#000" opacity="0.25" />
              <path d="M0,20 C-50,-40 -40,-110 0,-110 C40,-110 50,-40 0,20 Z" fill={C.terra} filter="url(#ppS)" />
              <circle cx="0" cy="-68" r="16" fill={C.cream} />
            </g>
            <text x="560" y="830" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={800} fontSize="46" fill={C.brown} opacity={pin}>Ba'labak</text>
            <g transform="translate(880 720)" filter="url(#ppS)"><circle r="70" fill={C.cream} stroke={C.brown} strokeWidth="4" /><path d="M0,-55 L14,0 L0,55 L-14,0 Z" fill={C.terra} /><text y="-76" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="42" fill={C.brown}>U</text></g>
          </g>
        </Svg>
      </AbsoluteFill>
      <Card t={t} at={23.9} out={26.2} y={250} w={860} dark><Kicker c={C.ochre}>Diutus kepada kaumnya</Kicker><Big size={58} c={C.goldHi}>Kaum penyembah Ba'al</Big></Card>
      <Card t={t} at={26.5} y={1010} w={900}><Kicker>Menurut sebagian mufassir</Kicker><Big size={58}>Ba'labak · barat Damaskus</Big><Body>Riwayat dalam Tafsir Ibnu Katsir</Body></Card>
    </AbsoluteFill>
  );
};

/** S4 Berhala Ba'l menjulang, kaum bersujud, doa/harapan/takut melayang ke patung. */
const S4: React.FC<SP> = ({ t }) => {
  const k = ease(t, 31.4, 39.6);
  const c: Cam = { z: mix(1.2, 1.02, k), x: Math.sin(t * 0.6) * 12, y: mix(120, 40, k) };
  const bow = 0.5 + 0.5 * Math.sin(t * 1.6);
  const icons: [string, number, number][] = [["doa", 37.85, 0], ["harapan", 38.15, 1], ["takut", 39.0, 2]];
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(#B98A5A, #C9945E 60%, #A87A4E)`}>
        <g transform={L(c, 0.15)}><rect x="-200" y="500" width="1480" height="700" fill="url(#goldLeaf)" opacity="0.85" /><circle cx="300" cy="800" r="260" fill="url(#sunGlow)" opacity="0.6" /></g>
        <g transform={L(c, 0.3)}><g filter="url(#dof)"><g filter="url(#pp)"><path d={ridge(1180, 60, 41, 2)} fill="#8A6A48" /></g></g></g>
        <rect x="-200" y="900" width="1480" height="700" fill="url(#haze)" />
        <g transform={L(c, 0.6)}>
          <Idol x={540} y={1430} s={0.86} />
          {icons.map(([lab, at, i]) => {
            const f = ease(t, at - 0.3, at + 1.2);
            if (t < at - 0.3) return null;
            const sx = [200, 540, 880][i], sy = 1380;
            const x = mix(sx, 540 + (i - 1) * 230, f), y = mix(sy, 1050 + (i % 2) * 60, f);
            return (
              <g key={lab} transform={`translate(${x} ${y}) scale(${1.25 - f * 0.15})`} opacity={1 - f * 0.25} filter="url(#ppS)">
                <circle r="54" fill={C.cream} stroke={C.terra} strokeWidth="5" />
                {i === 0 ? <path d="M-24,-14 h48 v26 h-30 l-14,12 v-12 h-4 Z" fill={C.terra} /> : i === 1 ? <path d="M0,-30 L8,-8 L30,-8 L12,6 L18,28 L0,15 L-18,28 L-12,6 L-30,-8 L-8,-8 Z" fill={C.ochre} /> : <path d="M-6,-30 L14,-30 L2,-4 L18,-4 L-10,30 L-2,4 L-18,4 Z" fill="#5A1E12" />}
                <text y="112" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="56" fill={C.goldHi} stroke="#2A170C" strokeWidth="10" paintOrder="stroke">{lab}</text>
              </g>
            );
          })}
        </g>
        <g transform={L(c, 1)}>
          <path d={ridge(1450, 24, 43, 1.2)} fill="#C9A27A" filter="url(#pp)" />
          {[120, 220, 320, 760, 860, 960].map((x, i) => <Folk key={i} x={x} y={1480 + (i % 2) * 24} s={1.05} pose={0.65 + bow * 0.35 * ((i % 2) ? 1 : 0.8)} fill="#2E1C10" flip={i > 2} />)}
        </g>
      </Svg>
      <Card t={t} at={32.6} out={34.8} y={250} w={860}><Kicker>Ibnu Abbas menjelaskan</Kicker><Big size={78}>Ba'l = "tuan"</Big></Card>
      <Card t={t} at={35.0} y={250} w={860} dark><Kicker c={C.ochre}>Patung buatan tangan</Kicker><Big size={52} c={C.goldHi}>mereka sendiri</Big></Card>
    </AbsoluteFill>
  );
};

/** S5 Seruan: jejak kaki menuju gerbang (tanpa sosok), ayat 37:124–126. */
const S5: React.FC<SP> = ({ t }) => {
  const k = ease(t, 39.6, 49.8);
  const c: Cam = { z: mix(1.0, 1.35, k), x: Math.sin(t * 0.5) * 10, y: mix(60, -40, k) };
  const steps = 14;
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(${C.duskA}, #EFA47A 50%, #C9864A)`}>
        <g transform={L(c, 0.15)}><circle cx="540" cy="760" r="300" fill="url(#sunGlow)" opacity="0.75" /></g>
        <g transform={L(c, 0.3)}><g filter="url(#dof)"><g filter="url(#pp)"><path d={ridge(1040, 50, 51, 2)} fill="#B07A4A" /></g></g></g>
        <rect x="-200" y="850" width="1480" height="600" fill="url(#haze)" />
        <g transform={L(c, 0.55)}><Gate x={540} y={1180} s={0.8} /></g>
        <g transform={L(c, 1)}>
          <path d={ridge(1240, 20, 53, 1)} fill={C.sand} filter="url(#pp)" />
          <path d="M540,1190 Q560,1450 470,1920 L830,1920 Q600,1450 560,1190 Z" fill="#F0D6A8" opacity="0.7" />
          {Array.from({ length: steps }, (_, i) => {
            const at = 39.8 + i * 0.45;
            const a = ease(t, at, at + 0.25);
            const p = 1 - i / steps;
            const y = 1200 + p * p * 700, x = 550 + (i % 2 ? 16 : -16) * (0.4 + p) + (1 - p) * 0;
            return <ellipse key={i} cx={x} cy={y} rx={10 + p * 22} ry={5 + p * 10} fill="#B78A5E" opacity={a * 0.85} transform={`rotate(${i % 2 ? 8 : -8} ${x} ${y})`} />;
          })}
          {/* cahaya lentera di ujung jejak, tanpa sosok */}
          <circle cx="552" cy={mix(1820, 1215, ease(t, 39.8, 46))} r="130" fill="url(#lampGlow)" opacity="0.8" />
        </g>
      </Svg>
      <Card t={t} at={40.0} out={42.9} y={280} w={880} dark><Kicker c={C.ochre}>Lalu Ilyas berseru · QS 37:124</Kicker><Big size={64} c={C.goldHi}>"Mengapa kamu tidak bertakwa?"</Big></Card>
      <Card t={t} at={43.0} out={46.4} y={250} w={940}>
        <Kicker>QS Ash-Shaffat 37:125</Kicker>
        <Arab size={52}>أَتَدْعُونَ بَعْلًا وَتَذَرُونَ أَحْسَنَ ٱلْخَـٰلِقِينَ</Arab>
        <Body>"Patutkah kamu menyembah Ba'l dan meninggalkan sebaik-baik Pencipta?"</Body>
      </Card>
      <Card t={t} at={46.5} y={250} w={940}>
        <Kicker>QS Ash-Shaffat 37:126</Kicker>
        <Arab size={52}>ٱللَّهَ رَبَّكُمْ وَرَبَّ ءَابَآئِكُمُ ٱلْأَوَّلِينَ</Arab>
        <Body>"Allah, Tuhanmu dan Tuhan nenek moyangmu yang terdahulu"</Body>
      </Card>
    </AbsoluteFill>
  );
};

/** S5c Kontras: patung DIBUAT (pahat) vs langit MENCIPTA. */
const S5c: React.FC<SP> = ({ t }) => {
  const split = ease(t, 49.8, 50.3);
  const hit = Math.max(0, Math.sin(t * 9)) ** 6;
  const sky = ease(t, 51.4, 52.6);
  const c: Cam = { z: 1 + (t - 49.8) * 0.03, x: 0, y: 0 };
  return (
    <AbsoluteFill>
      <Svg bg="#21140B">
        <rect x="0" y="0" width={540 * split} height="1920" fill="#D9BE96" />
        <g transform={L(c, 0.6)}>
          <g transform="translate(270 1420)" opacity={split}>
            <Idol x={0} y={0} s={0.68} />
            <g transform={`translate(${120 + hit * 14} ${-250 - hit * 10}) rotate(-35)`} filter="url(#ppS)">
              <rect x="-8" y="-120" width="16" height="140" fill="#6A5A48" />
              <path d="M-8,20 L8,20 L0,48 Z" fill="#8A7A66" />
            </g>
            {[0, 1, 2].map((i) => <circle key={i} cx={95 + i * 14} cy={-230 + i * 9} r={4 * hit} fill={C.lamp} />)}
          </g>
        </g>
        <g opacity={split}>
          <rect x="540" y="0" width="540" height="1920" fill={`url(#none)`} />
          <g transform="translate(540 0)"><rect width="540" height="1920" fill="#21140B" /><g opacity={0.75 + sky * 0.25}><Stars t={t} n={70} seed={77} h={1500} /></g>
            <g filter="url(#pp)" opacity={0.85}><path d="M120,1180 a60,60 0 0,1 110,-30 a70,70 0 0,1 130,10 a50,50 0 0,1 60,60 Z" fill="#3E2716" /><path d={ridge(1500, 50, 79, 1.5, 2400, 0, 600)} fill="#2A1A0E" /></g>
            <circle cx="270" cy="820" r={120 + sky * 160} fill="url(#sunGlow)" opacity={sky} />
          </g>
          <rect x="534" y="0" width="12" height="1920" fill={C.cream} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 40, width: 460, top: 330, textAlign: "center", transform: `scale(${pop(t, 50.4) || 0})`, background: C.cream, borderRadius: 10, padding: "18px 10px", border: `4px solid ${C.terra}`, boxShadow: "8px 10px 0 rgba(58,36,22,0.35)", boxSizing: "border-box" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.brown }}>Patung itu</div>
        <Big size={78} c={C.terra}>DIBUAT</Big>
      </div>
      <div style={{ position: "absolute", left: 580, width: 460, top: 330, textAlign: "center", transform: `scale(${pop(t, 51.5) || 0})`, background: "rgba(58,22,12,0.94)", borderRadius: 10, padding: "18px 10px", border: `4px solid ${C.gold}`, boxShadow: "8px 10px 0 rgba(20,10,4,0.45)", boxSizing: "border-box" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.cream }}>Allah yang</div>
        <Big size={56} c={C.gold}>MENCIPTA</Big>
      </div>
    </AbsoluteFill>
  );
};

/** S6 Penolakan: gerbang menutup, kaum berpaling; titik cahaya hamba yang ikhlas tetap. */
const S6: React.FC<SP> = ({ t }) => {
  const k = ease(t, 53.0, 61.5);
  const c: Cam = { z: mix(1.3, 1.0, k), x: Math.sin(t * 0.4) * 10, y: mix(-60, 20, k) };
  const close = ease(t, 53.4, 55.4);
  const dark = ease(t, 53.0, 56.5);
  const lights = ease(t, 59.6, 60.4);
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(${C.nightA}, ${dark > 0.5 ? "#2A1A0E" : "#5A3A22"})`}>
        <rect width="1080" height="1920" fill="#C9864A" opacity={1 - dark} />
        <g transform={L(c, 0.15)}><Stars t={t} n={30} seed={61} h={900} /></g>
        <g transform={L(c, 0.3)}><g filter="url(#dof)"><g filter="url(#pp)"><path d={ridge(1050, 50, 63, 2)} fill="#4A3220" /></g></g></g>
        <rect x="-200" y="850" width="1480" height="600" fill="url(#hazeN)" />
        <g transform={L(c, 0.6)}><Gate x={540} y={1260} s={1.0} close={close} /></g>
        <g transform={L(c, 1)}>
          <path d={ridge(1300, 22, 65, 1)} fill="#6A4A2E" filter="url(#pp)" />
          {[330, 420, 500, 610, 700, 760].map((x, i) => {
            const go = ease(t, 53.2 + i * 0.2, 55.2 + i * 0.2);
            return <g key={i} opacity={1 - go}><Folk x={mix(x, 540, go)} y={mix(1330, 1240, go)} s={mix(1, 0.6, go)} fill="#1E120A" flip={x > 540} /></g>;
          })}
          {[180, 260, 860, 930].map((x, i) => (
            <g key={i} opacity={lights}>
              <circle cx={x} cy={1500 + (i % 2) * 40} r={70 + Math.sin(t * 3 + i) * 6} fill="url(#lampGlow)" />
              <circle cx={x} cy={1500 + (i % 2) * 40} r="10" fill="#FFF1C9" />
            </g>
          ))}
        </g>
      </Svg>
      <Card t={t} at={53.3} out={59.4} y={250} w={920} dark>
        <Kicker c={C.ochre}>QS Ash-Shaffat 37:127</Kicker>
        <Arab size={54} c="#FFE7A8">فَكَذَّبُوهُ فَإِنَّهُمْ لَمُحْضَرُونَ</Arab>
        <Body>Mereka mendustakannya, <span style={{ color: C.ochre, opacity: ease(t, 56.2, 56.6) }}>dan pasti akan dihadirkan untuk menerima balasan</span></Body>
      </Card>
      <Card t={t} at={59.6} y={250} w={920}>
        <Kicker>QS Ash-Shaffat 37:128</Kicker>
        <Arab size={56}>إِلَّا عِبَادَ ٱللَّهِ ٱلْمُخْلَصِينَ</Arab>
        <Body>Kecuali hamba-hamba Allah yang ikhlas</Body>
      </Card>
    </AbsoluteFill>
  );
};

/** S7 Cek riwayat: ikon kereta kosong dicap RIWAYAT ISRAILIYAT. */
const S7: React.FC<SP> = ({ t }) => {
  const zoom = ease(t, 61.5, 62.1);
  const c: Cam = { z: mix(1.6, 1.0, zoom) + (t - 61.5) * 0.02, x: 0, y: 0 };
  const stamp = ease(t, 64.3, 64.55);
  const fly = Math.sin(t * 2) * 10;
  return (
    <AbsoluteFill>
      <Svg bg="#E2CDA6">
        <g transform={L(c, 0.3)}>
          <path d={torn(80, 300, 920, 1200, 121, 14)} fill="#EBDAB8" filter="url(#pp)" />
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={140} y={380 + i * 80} width={800 - (i % 4) * 90} height="10" rx="5" fill={C.brown} opacity="0.13" />)}
        </g>
        <g transform={`${L(c, 0.8)} translate(0 ${fly})`} opacity={1 - stamp * 0.45}>
          <g transform="translate(540 930)" filter="url(#pp)">
            {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-230 - i * 40},${-40 + i * 22} Q${-330 - i * 50},${-90 + i * 30} ${-420 - i * 40},${-20 + i * 26} Q${-320 - i * 40},${10 + i * 20} ${-230 - i * 40},${10 + i * 22} Z`} fill={i % 2 ? C.ochre : C.terra} opacity="0.9" />)}
            <path d="M-210,-90 L150,-90 L190,60 L-180,60 Z" fill="none" stroke={C.brown} strokeWidth="12" strokeDasharray="22 14" />
            <g transform={`translate(0 110) rotate(${t * 60})`}>
              <circle r="110" fill="none" stroke={C.brown} strokeWidth="14" />
              {[0, 45, 90, 135].map((a) => <rect key={a} x="-6" y="-110" width="12" height="220" fill={C.brown} transform={`rotate(${a})`} />)}
              <circle r="20" fill={C.brown} />
            </g>
          </g>
        </g>
        <g transform={`translate(540 980) scale(${mix(2.4, 1, stamp)}) rotate(-4)`} opacity={stamp}>
          <rect x="-420" y="-110" width="840" height="250" rx="14" fill="rgba(243,230,198,0.9)" stroke="#A3261A" strokeWidth="12" />
          <text x="0" y="-16" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="64" fill="#A3261A" letterSpacing="3">RIWAYAT ISRAILIYAT</text>
          <text x="0" y="96" textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize="54" fill="#7A1E10" opacity={ease(t, 65.3, 65.6)}>tidak ada dalam Al-Qur'an</text>
        </g>
      </Svg>
      <Card t={t} at={61.7} out={64.2} y={260} w={860}><Kicker>Kisah populer</Kicker><Big size={56}>"Kereta api ke langit"?</Big></Card>
    </AbsoluteFill>
  );
};

/** S8 Payoff: fajar di bukit kertas, lentera + tongkat bersandar di batu, salam QS 37:130–132. */
const S8: React.FC<SP> = ({ t }) => {
  const k1 = ease(t, 66.6, 72.1), k2 = ease(t, 72.1, 78.1), k3 = ease(t, 78.1, 81.4);
  const c: Cam = { z: mix(1.0, 1.08, k1) + k2 * 0.12 - k3 * 0.06, x: Math.sin(t * 0.35) * 12 + k2 * -40, y: mix(-180, 0, k1) - k2 * 120 };
  const sun = ease(t, 66.6, 71);
  const ring = (t - 78.2) % 1.2;
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(${sun > 0.5 ? "#F6C98E" : "#6A4A2E"}, #F7DDB2 70%)`}>
        <rect x="0" y="400" width="1080" height="900" fill="url(#goldLeaf)" opacity={sun} />
        <rect width="1080" height="1920" fill="#3E2716" opacity={1 - sun} />
        <g transform={L(c, 0.12)}>
          <circle cx="540" cy={mix(1350, 1040, sun)} r="420" fill="url(#sunGlow)" />
          <circle cx="540" cy={mix(1350, 1040, sun)} r="120" fill="#FFE7A8" filter="url(#pp)" /><circle cx="510" cy={mix(1320, 1010, sun)} r="70" fill="#FFF8E4" opacity="0.8" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x="536" y={mix(1350, 1040, sun) - 520} width="8" height="300" fill="#FFE7A8" opacity={0.25 * sun} transform={`rotate(${i * 30 + t * 4} 540 ${mix(1350, 1040, sun)})`} />)}
        </g>
        <g transform={L(c, 0.3)}><g filter="url(#dof)"><g filter="url(#pp)"><path d={ridge(1180, 60, 81, 2.2)} fill="#D7A27C" /></g></g></g>
        <rect x="-200" y="1000" width="1480" height="500" fill="url(#haze)" />
        <g transform={L(c, 0.55)} filter="url(#pp)"><path d={ridge(1320, 70, 82, 1.6)} fill="#E8B98A" /></g>
        <g transform={L(c, 1)}>
          <path d={ridge(1460, 40, 83, 1.2)} fill="#F2D1A0" filter="url(#pp)" />
          <g transform="translate(760 1430)" filter="url(#pp)">
            <path d="M-200,40 Q-210,-80 -100,-110 Q30,-150 150,-90 Q220,-40 200,40 Z" fill="#A99583" />
            <path d="M-150,-70 Q-60,-120 60,-110" stroke="#8d7a69" strokeWidth="8" fill="none" />
            <path d="M-200,40 Q-210,-80 -100,-110 L-80,-100 Q-180,-60 -170,40 Z" fill="#E9CFA6" opacity="0.6" />
            <path d="M60,-110 Q160,-80 200,40 L150,40 Q140,-50 60,-100 Z" fill="#5A4636" opacity="0.5" />
            {/* lampu minyak tanah liat di atas batu (cahaya, tanpa sosok) */}
            <g transform="translate(-40 -128)">
              <path d="M-70,0 Q-60,34 0,36 Q60,34 76,0 Q40,-14 0,-14 Q-40,-14 -70,0 Z" fill="#9A5A2E" />
              <path d="M70,-4 L110,-16 L104,4 Z" fill="#9A5A2E" />
              <path d="M-60,4 Q0,18 66,4" stroke="#D9A441" strokeWidth="5" fill="none" />
            </g>
          </g>
          <g transform="translate(830 1276)">
            <circle r={110 + Math.sin(t * 9) * 6} fill="url(#lampGlow)" opacity="0.9" />
            <path d={`M0,${-46 - Math.sin(t * 8.3) * 6} C-14,-24 -12,-6 0,0 C12,-6 14,-24 0,${-46 - Math.sin(t * 8.3) * 6} Z`} fill="#FFB848" />
            <path d="M0,-28 C-6,-16 -5,-4 0,0 C5,-4 6,-16 0,-28 Z" fill="#FFF1C9" />
          </g>
          {/* tongkat bersandar, tanpa sosok */}
          <g filter="url(#pp)"><rect x="868" y="960" width="20" height="470" rx="8" fill="#7a4f37" transform="rotate(14 878 1430)" /></g>
          <circle cx="760" cy="1330" r={150 + Math.sin(t * 3) * 6} fill="url(#lampGlow)" opacity="0.55" />
          {t > 78.2 ? [0, 1, 2].map((i) => { const rr = ((t - 78.2 + i * 0.4) % 1.2) / 1.2; return <circle key={i} cx="760" cy="1330" r={80 + rr * 420} fill="none" stroke={C.gold} strokeWidth={6 * (1 - rr)} opacity={(1 - rr) * 0.8} />; }) : null}
          {ring > 99 ? null : null}
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: 290, textAlign: "center", opacity: ease(t, 68.4, 69.0) * (1 - ease(t, 71.9, 72.2)), transform: `scale(${0.92 + ease(t, 68.4, 69.4) * 0.08})`, background: "rgba(243,230,204,0.95)", borderRadius: 12, padding: "24px 20px", border: `4px solid ${C.terra}`, boxShadow: "9px 12px 0 rgba(58,36,22,0.35)" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, color: "#8A2A14", letterSpacing: 3 }}>QS ASH-SHAFFAT 37:130</div>
        <Arab size={118} c="#7a4a1c">سَلَـٰمٌ عَلَىٰٓ إِلْ يَاسِينَ</Arab>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 800, fontSize: 60, color: C.terra, opacity: ease(t, 70.2, 70.7) }}>"Selamat sejahtera bagi Ilyas"</div>
      </div>
      <Card t={t} at={72.2} out={75.0} y={270} w={940}>
        <Kicker>QS Ash-Shaffat 37:131</Kicker>
        <Arab size={52}>إِنَّا كَذَٰلِكَ نَجْزِى ٱلْمُحْسِنِينَ</Arab>
        <Body>Demikianlah Allah membalas orang-orang yang berbuat baik</Body>
      </Card>
      <Card t={t} at={75.1} out={78.0} y={270} w={940}>
        <Kicker>QS Ash-Shaffat 37:132</Kicker>
        <Arab size={52}>إِنَّهُۥ مِنْ عِبَادِنَا ٱلْمُؤْمِنِينَ</Arab>
        <Body>Sungguh, ia termasuk hamba-hamba-Nya yang beriman</Body>
      </Card>
      <Card t={t} at={78.2} y={300} w={900} dark><Kicker c={C.ochre}>Hingga hari ini</Kicker><Big size={56} c={C.goldHi}>Salam itu terus dibaca</Big></Card>
    </AbsoluteFill>
  );
};

/** S9 Penutup: lembar mushaf kertas menutup, lentera tetap menyala. */
const S9: React.FC<SP> = ({ t }) => {
  const shut = ease(t, 81.4, 83.6);
  const c: Cam = { z: mix(1.15, 1.0, ease(t, 81.2, 84.5)), x: 0, y: 0 };
  return (
    <AbsoluteFill>
      <Svg bg={`linear-gradient(${C.nightB}, ${C.nightA})`}>
        <g transform={L(c, 0.2)}><Stars t={t} n={40} seed={95} /></g>
        <Dunes c={c} night />
        <g transform={L(c, 1)}>
          <Page x={540 - 150 * (1 - shut)} y={1180} w={300} h={400} seed={31} rot={-6 * (1 - shut)} open={mix(1, 0.15, shut) * (1 - shut * 0) } />
          <Page x={540 + 150 * (1 - shut)} y={1180} w={300} h={400} seed={32} rot={6 * (1 - shut)} open={mix(1, 1, shut)} />
          <circle cx="540" cy="1420" r={180 + Math.sin(t * 3) * 6} fill="url(#lampGlow)" opacity="0.5" />
        </g>
      </Svg>
      <Card t={t} at={81.4} y={330} w={860} dark>
        <Big size={64} c={C.goldHi}>Kisah dalam Al-Qur'an</Big>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.ochre, marginTop: 10, opacity: ease(t, 83.2, 83.6) }}>bersama AUDIRA</div>
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
    const punct = /[.,?!]$/.test(w.text);
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
    <div style={{ position: "absolute", left: 50, right: 50, top: 1330, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(36,20,10,0.88)", borderRadius: 18, padding: "18px 30px", maxWidth: 980, textAlign: "center", border: "2px solid #D9A441", boxShadow: "0 0 0 2px #2A170C, 6px 8px 14px rgba(20,10,4,0.45)" }}>
        {ch.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const s = active ? 1 + 0.04 * Math.sin(clamp((t - w.start) / 0.18) * Math.PI / 2) : 1;
          return <span key={i} style={{ display: "inline-block", fontFamily: INTER, fontWeight: 800, fontSize: 58, lineHeight: 1.25, color: active ? "#FFD07A" : C.cream, marginRight: i < ch.length - 1 ? "0.4em" : 0, transform: `scale(${s})` }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- director ----------
const SCENES: [number, number, React.FC<SP>][] = [
  [T.s1, T.s2, S1], [T.s2, T.s3, S2], [T.s3, T.s4, S3], [T.s4, T.s5, S4], [T.s5, T.s5c, S5], [T.s5c, T.s6, S5c],
  [T.s6, T.s7, S6], [T.s7, T.s8, S7], [T.s8, T.s9, S8], [T.s9, OUTRO_AT + 0.4, S9],
];
const XF = 0.35;

export const Ilyas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const u = width / 1080;
  return (
    <AbsoluteFill style={{ background: C.nightA, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${u})`, transformOrigin: "0 0" }}>
        {SCENES.map(([a, b, S], i) => {
          if (t < a || t >= b + XF) return null;
          const fadeIn = i === 0 ? 1 : clamp((t - a) / XF);
          // dolly kontinu per adegan (kamera tidak pernah parkir): zoom pelan + drift lateral
          const lt = t - a;
          const dz = 1 + 0.02 * lt;
          const dx = Math.sin(lt * 0.6 + i) * 40;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: fadeIn, transformOrigin: "540px 260px", transform: `translate(${dx.toFixed(2)}px, ${((1 - fadeIn) * 24).toFixed(2)}px) scale(${dz.toFixed(4)})` }}>
              <Desk t={t} i={i} />
              <Folio i={i} />
              <S t={t} />
              <MiniLight i={i} t={t} />
              <FolioFrame t={t} />
              <DeskFG lt={lt} i={i} />
              <CandleKey i={i} t={t} />
              <Grain />
            </div>
          );
        })}
        {t < OUTRO_AT ? (
          <div style={{ position: "absolute", left: 60, top: 196, padding: "6px 16px", borderRadius: 8, background: "rgba(58,22,12,0.88)", color: C.cream, fontFamily: INTER, fontWeight: 700, fontSize: 36, letterSpacing: 1 }}>SOSOK NABI TIDAK DIGAMBARKAN</div>
        ) : null}
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT - 0.2 ? <AudiraOutro seconds={ILYAS_SECONDS - OUTRO_AT} /> : null}
      <AudiraSignature seed="ep08-nabi-ilyas" />
    </AbsoluteFill>
  );
};
