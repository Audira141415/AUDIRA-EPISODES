// EP26 — Lelaki yang membunuh 100 jiwa lalu bertaubat (AUDIRA QISSAH). Style: PAPERLANTERN (Paper-cut Lightbox),
// Remotion 2D (SVG/CSS, tanpa R3F). Sumber: HR Bukhari 3470, HR Muslim 2766, QS Az-Zumar 39:53.
// Adab: tanpa kekerasan/darah/senjata/jenazah. Malaikat hanya cahaya. Semua tokoh siluet kertas tanpa wajah.
// Semua nilai fungsi murni dari t (frame / fps): seek-safe, tanpa Math.random.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { AudiraSignature } from "../brand/AudiraSignature";
import { AudiraOutro } from "../brand/AudiraOutro";
import WORDS from "../../public/audio/vo-words.json";

const { fontFamily: SERIF } = loadCormorant("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: SANS } = loadManrope("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const { fontFamily: AMIRI } = loadAmiri("normal", { weights: ["700"], subsets: ["arabic"] });

export const TAUBAT_SECONDS = 86.5;
const OUTRO_AT = 83.3;

// ---------- palet (docs/ART_DIRECTION.md) ----------
const C = {
  cream: "#f6ead2", ink: "#1c1208", gold: "#ffd27a", blue: "#7fb4ff", ember: "#ffb862", seal: "#b8322a",
};

// ---------- waktu adegan (detik VO, SHOTLIST.md) ----------
const T = { s1: 0, s2: 5.0, s3: 11.0, s4: 18.6, s5: 29.5, s6: 39.6, s7: 47.3, s8: 53.9, s9: 66.4, s10: 76.7 };

// ---------- helper ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
const soft = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.55, 1) });
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const pop = (t: number, at: number) => { const k = lin(t, at, at + 0.35); return k <= 0 ? 0 : 1 + Math.sin(k * Math.PI) * 0.06 - (1 - k) * 0.1; };
const flick = (t: number, ph = 0) => 1 + 0.06 * Math.sin(7.3 * t + ph) * Math.sin(3.1 * t + ph * 0.7);
const mulberry = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };

/** Punggung bukit kertas potong, diisi sampai bawah. */
const ridge = (y: number, amp: number, seed: number, waves = 3, x0 = -400, x1 = 1480, bottom = 2500) => {
  const r = mulberry(seed);
  const ph = r() * 6.28;
  let d = `M${x0},${bottom} L${x0},${y}`;
  for (let x = x0; x <= x1; x += 28) {
    const yy = y + Math.sin(((x - x0) / (x1 - x0)) * Math.PI * waves + ph) * amp + Math.sin(x * 0.05 + ph) * amp * 0.12 + (r() - 0.5) * 5;
    d += ` L${x},${yy.toFixed(1)}`;
  }
  return d + ` L${x1},${bottom} Z`;
};

/** Deretan rumah kertas (atap datar / kubah) di garis y. */
const town = (y: number, seed: number, x0: number, x1: number, hMin = 90, hMax = 230) => {
  const r = mulberry(seed);
  let d = `M${x0},2500 L${x0},${y}`;
  let x = x0;
  const wins: [number, number][] = [];
  while (x < x1) {
    const w = 70 + r() * 80, h = hMin + r() * (hMax - hMin), dome = r() > 0.72;
    d += ` L${x},${y - h}`;
    if (dome) d += ` Q${x + w / 2},${y - h - w * 0.75} ${x + w},${y - h}`;
    else d += ` L${x + w},${y - h}`;
    d += ` L${x + w},${y}`;
    wins.push([x + w / 2, y - h * 0.55]);
    x += w + 6 + r() * 20;
    d += ` L${x},${y}`;
  }
  return { d: d + ` L${x},2500 Z`, wins };
};

type Cam = { z: number; x: number; y: number };
/** Transformasi parallax lapisan: d kecil = jauh, d = 1 = depan. */
const L = (c: Cam, d: number) => {
  const s = 1 + (c.z - 1) * d;
  return `translate(540 960) scale(${s.toFixed(4)}) translate(${(-540 + c.x * d).toFixed(2)} ${(-960 + c.y * d).toFixed(2)})`;
};

// ---------- lembar kertas ----------
/** Satu lembar kertas: rim cahaya hangat di tepi atas, warna datar, cahaya tembus (trans), bayangan ke lapisan belakang. */
const Sheet: React.FC<{ d: string; fill: string; glow?: string; trans?: number; rim?: string; rimOp?: number; shadow?: boolean }> = ({ d, fill, glow, trans = 0, rim = "#ffcf8a", rimOp = 0.75, shadow = true }) => (
  <g filter={shadow ? "url(#lay)" : undefined}>
    <path d={d} fill={rim} opacity={rimOp} transform="translate(0 -4)" />
    <path d={d} fill={fill} />
    {glow && trans > 0 ? <path d={d} fill={`url(#${glow})`} opacity={trans} style={{ mixBlendMode: "screen" }} /> : null}
  </g>
);

const Defs: React.FC = () => (
  <defs>
    {/* bayangan lembut dari tiap lapisan ke lapisan di belakangnya (lampu atas-belakang) */}
    <filter id="lay" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="-7" stdDeviation="11" floodColor="#000" floodOpacity="0.55" />
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#000" floodOpacity="0.5" /></filter>
    <filter id="b6"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="b24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
    <filter id="b60" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="60" /></filter>
    <radialGradient id="dot"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.35" stopColor={C.ember} stopOpacity="0.9" /><stop offset="1" stopColor={C.ember} stopOpacity="0" /></radialGradient>
    <radialGradient id="goldG"><stop offset="0" stopColor="#fffbe8" /><stop offset="0.3" stopColor={C.gold} stopOpacity="0.85" /><stop offset="1" stopColor={C.gold} stopOpacity="0" /></radialGradient>
    <radialGradient id="blueG"><stop offset="0" stopColor="#f2f8ff" /><stop offset="0.3" stopColor={C.blue} stopOpacity="0.85" /><stop offset="1" stopColor={C.blue} stopOpacity="0" /></radialGradient>
    <radialGradient id="whiteG"><stop offset="0" stopColor="#ffffff" /><stop offset="0.35" stopColor="#ffffff" stopOpacity="0.7" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
  </defs>
);

/** Gradien cahaya tembus kertas per adegan (pusat cahaya di belakang tumpukan). */
const Glow: React.FC<{ id: string; cx: number; cy: number; r: number; color: string }> = ({ id, cx, cy, r, color }) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
    <stop offset="0" stopColor={color} stopOpacity="1" />
    <stop offset="0.5" stopColor={color} stopOpacity="0.35" />
    <stop offset="1" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

const Svg: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: bg }}>
    <Defs />
    {children}
  </svg>
);

/** Serat kertas + pulp mottle statis di atas frame. */
const Grain: React.FC = () => (
  <>
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen", opacity: 0.13, pointerEvents: "none" }}>
      <filter id="pulpL"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="4" seed="31" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 0.86  0 0 0 0 0.62  0 0 0 1.6 -0.5" /></filter>
      <rect width="1080" height="1920" filter="url(#pulpL)" />
    </svg>
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.32, pointerEvents: "none" }}>
      <filter id="fiber"><feTurbulence type="turbulence" baseFrequency="0.015 0.5" numOctaves="2" seed="7" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0.8 -0.1" /></filter>
      <rect width="1080" height="1920" filter="url(#fiber)" opacity="0.6" />
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0.8 0" /></filter>
      <rect width="1080" height="1920" filter="url(#grain)" />
    </svg>
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 90% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
  </>
);

// ---------- tokoh siluet (tanpa wajah) ----------
/** Lelaki siluet kertas bersendi: kaki & lengan berputar di sendi. Kaki di (x,y). */
const Man: React.FC<{ x: number; y: number; s?: number; walk?: number; fill: string; lean?: number; lamp?: number; t: number; lampDrop?: number; flip?: boolean }> = ({ x, y, s = 1, walk = 0, fill, lean = 0, lamp = 0, t, lampDrop = 0, flip }) => {
  const a = Math.sin(walk) * 24;
  const arm = -20 + Math.sin(walk + Math.PI) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${lean})`}>
      <rect x={-8} y={-96} width={16} height={96} rx={7} fill={fill} transform={`rotate(${a} 0 -92)`} />
      <rect x={-8} y={-96} width={16} height={96} rx={7} fill={fill} transform={`rotate(${-a} 0 -92)`} />
      <path d="M-34,-70 L-25,-162 Q-22,-182 0,-183 Q22,-182 25,-162 L34,-70 Z" fill={fill} />
      <circle cx={0} cy={-204} r={21} fill={fill} />
      <path d="M-22,-210 Q0,-238 22,-210 Q24,-198 18,-196 L-18,-196 Q-24,-198 -22,-210 Z" fill={fill} />
      <g transform={`rotate(${arm} 12 -168)`}>
        <rect x={6} y={-170} width={13} height={82} rx={6} fill={fill} />
        {lamp > 0 && lampDrop < 1 ? (
          <g transform={`translate(13 -84) rotate(${lampDrop * 80}) translate(0 ${lampDrop * 60})`}>
            <circle cx={0} cy={22} r={70} fill="url(#dot)" opacity={lamp * 0.85 * flick(t, 1)} />
            <line x1={0} y1={0} x2={0} y2={10} stroke={fill} strokeWidth={3} />
            <rect x={-10} y={10} width={20} height={26} rx={4} fill={fill} />
            <rect x={-6} y={14} width={12} height={18} rx={3} fill="#ffd9a0" opacity={lamp * flick(t, 2)} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Sosok duduk (rahib / orang alim) siluet tanpa wajah. */
const Seated: React.FC<{ x: number; y: number; s?: number; fill: string; book?: boolean }> = ({ x, y, s = 1, fill, book }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-70,0 Q-72,-40 -40,-60 L-32,-140 Q-28,-165 0,-166 Q28,-165 32,-140 L40,-60 Q72,-40 70,0 Z" fill={fill} />
    <circle cx={0} cy={-188} r={22} fill={fill} />
    <path d="M-24,-192 Q0,-224 24,-192 L26,-160 L-26,-160 Z" fill={fill} />
    {book ? <path d="M-46,-70 L0,-58 L46,-70 L46,-40 L0,-28 L-46,-40 Z" fill={fill} stroke="#f0c070" strokeWidth={2} strokeOpacity={0.5} /> : null}
  </g>
);

/** Lentera kertas berdiri. on 0..1. */
const Lantern: React.FC<{ x: number; y: number; s?: number; on: number; t: number; dark: string; ph?: number }> = ({ x, y, s = 1, on, t, dark, ph = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-40} r={150} fill="url(#dot)" opacity={on * 0.75 * flick(t, ph)} />
    <rect x={-26} y={-84} width={52} height={78} rx={10} fill="#ffe1a8" opacity={0.15 + on * 0.85} />
    <rect x={-26} y={-84} width={52} height={78} rx={10} fill="none" stroke={dark} strokeWidth={6} />
    <line x1={0} y1={-84} x2={0} y2={-6} stroke={dark} strokeWidth={4} />
    <path d="M-34,-84 L34,-84 L22,-104 L-22,-104 Z" fill={dark} />
    <rect x={-30} y={-8} width={60} height={10} fill={dark} />
  </g>
);

const Stars: React.FC<{ t: number; n?: number; seed?: number; h?: number; op?: number }> = ({ t, n = 50, seed = 3, h = 1000, op = 1 }) => {
  const r = mulberry(seed);
  return (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * 1300 - 110, y = r() * h, s = 1.5 + r() * 3.5, ph = r() * 6.28;
        return <circle key={i} cx={x} cy={y} r={s} fill="#fff1d0" opacity={0.35 + 0.35 * Math.sin(t * 1.6 + ph)} />;
      })}
    </g>
  );
};

// ---------- teks kertas (HTML overlay) ----------
/** Strip kertas yang tumbuh dari tepi kiri pada katanya. */
const Strip: React.FC<{ t: number; at: number; out?: number; x?: number; y: number; w?: number; dark?: boolean; rot?: number; children: React.ReactNode; accent?: string }> = ({ t, at, out = 1e9, x = 540, y, w = 880, dark, rot = 0, children, accent }) => {
  const g = ease(t, at, at + 0.45);
  const ko = lin(t, out, out + 0.3);
  if (g <= 0 || ko >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `rotate(${rot}deg) translateY(${ko * -20}px)`, opacity: 1 - ko }}>
      <div style={{ transformOrigin: "0 50%", transform: `scaleX(${g})`, background: dark ? "#16100c" : C.cream, color: dark ? C.cream : C.ink, padding: "20px 34px", borderRadius: 6, textAlign: "center", boxShadow: "0 -3px 0 rgba(255,207,138,0.75), 0 14px 26px rgba(0,0,0,0.5)", borderLeft: accent ? `10px solid ${accent}` : undefined }}>
        <div style={{ opacity: lin(t, at + 0.15, at + 0.4) }}>{children}</div>
      </div>
    </div>
  );
};
const Big: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 72, c }) => <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: c }}>{children}</div>;
const Kick: React.FC<{ children: React.ReactNode; c?: string; size?: number }> = ({ children, c = "#8a3a1c", size = 36 }) => <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 3, color: c, textTransform: "uppercase" }}>{children}</div>;
const Arab: React.FC<{ children: React.ReactNode; size?: number; c?: string }> = ({ children, size = 72, c = C.ink }) => <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: size, direction: "rtl", lineHeight: 1.7, color: c }}>{children}</div>;

/** Angka callout besar (HUD data) yang menghantam di katanya. */
const Num: React.FC<{ t: number; at: number; out?: number; y: number; n: string; sub?: string; c?: string; x?: number }> = ({ t, at, out = 1e9, y, n, sub, c = C.gold, x = 540 }) => {
  const s = pop(t, at);
  const ko = lin(t, out, out + 0.3);
  if (s <= 0 || ko >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x - 450, width: 900, top: y, textAlign: "center", transform: `scale(${s})`, opacity: 1 - ko }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 210, lineHeight: 0.95, color: c, textShadow: `0 0 40px ${c}88, 0 10px 0 rgba(0,0,0,0.45)` }}>{n}</div>
      {sub ? <div style={{ display: "inline-block", marginTop: 10, background: "#16100c", color: C.cream, fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 4, padding: "8px 22px", borderRadius: 6, boxShadow: "0 -3px 0 rgba(255,207,138,0.7)" }}>{sub}</div> : null}
    </div>
  );
};

type SP = { t: number };

// ================= S1 Hook (0–5.0): 100 manik cahaya padam, pintu taubat =================
const S1: React.FC<SP> = ({ t }) => {
  const door = soft(t, 2.6, 4.6);
  const c: Cam = { z: mix(1.0, 1.12, soft(t, 0, 2.6)) + door * 0.55, x: door * -40, y: mix(0, -40, soft(t, 0, 2.6)) + door * -160 };
  const r = mulberry(100);
  const beads = Array.from({ length: 100 }, (_, i) => ({ x: 70 + (i % 10) * 104 + (r() - 0.5) * 60, y: 230 + Math.floor(i / 10) * 72 + (r() - 0.5) * 40, ph: r() * 6 }));
  const doorOpen = ease(t, 3.36, 4.4);
  return (
    <Svg bg="#0a0d24">
      <defs><Glow id="g1" cx={600} cy={1250} r={700} color="#ffb862" /></defs>
      <g transform={L(c, 0.15)}>
        {beads.map((b, i) => {
          const off = lin(t, 0.45 + i * 0.019, 0.75 + i * 0.019);
          const rad = mix(15, 6, off);
          return (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r={rad * 3.2} fill="url(#dot)" opacity={mix(0.9, 0.25, off) * flick(t, b.ph)} />
              <circle cx={b.x} cy={b.y} r={rad * 0.55} fill={off > 0.5 ? "#ff6a3a" : "#fff3d6"} opacity={mix(1, 0.55, off)} />
            </g>
          );
        })}
      </g>
      <g transform={L(c, 0.35)}><Sheet d={ridge(1120, 70, 11, 2)} fill="#3b3f6e" glow="g1" trans={0.55} /></g>
      <g transform={L(c, 0.6)}>
        <Sheet d={ridge(1300, 50, 12, 3)} fill="#1a1c3c" glow="g1" trans={0.25} />
        {/* pintu kertas di bukit tengah: celah cahaya melebar */}
        <g transform="translate(600 1235)">
          <circle cx={0} cy={-60} r={140 + doorOpen * 160} fill="url(#dot)" opacity={0.25 + doorOpen * 0.7} />
          <path d="M-50,0 L-50,-110 Q0,-160 50,-110 L50,0 Z" fill="#05060f" />
          <path d={`M-50,0 L-50,-110 Q${-50 + 50 * doorOpen},${-160 + 30 * (1 - doorOpen)} ${-50 + 100 * doorOpen * 0.6},-112 L${-50 + 100 * doorOpen * 0.6},0 Z`} fill="#ffe2a0" opacity={0.25 + doorOpen * 0.75} />
        </g>
      </g>
      <g transform={L(c, 1)}><Sheet d={ridge(1560, 40, 13, 5)} fill="#05060f" rimOp={0.5} /></g>
    </Svg>
  );
};
const S1Text: React.FC<SP> = ({ t }) => (
  <>
    <Num t={t} at={0.55} out={2.5} y={860} n="100" sub="NYAWA TERENGGUT" c={C.ember} />
    <Strip t={t} at={2.7} y={330} w={760} dark><Big size={76} c={C.cream}>Masihkah ada</Big><Big size={92} c={C.gold}>pintu taubat?</Big></Strip>
  </>
);

// ================= S2 Konteks (5.0–11.0): gulungan sumber hadits =================
const S2: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1.15, 1.0, soft(t, 5, 11)), x: Math.sin(t * 0.5) * 12, y: 0 };
  const open = ease(t, 5.6, 6.8);
  const bookL = ease(t, 8.5, 9.0), bookR = ease(t, 9.0, 9.5);
  const sway = Math.sin(t * 1.3) * 3;
  // kitab tertutup bersampul kulit, berdiri di meja (sampul menghadap kamera)
  const Book: React.FC<{ x: number; k: number; fill: string }> = ({ x, k, fill }) => (
    <g transform={`translate(${x} ${1250 + (1 - k) * 60})`} opacity={k} filter="url(#soft)">
      <rect x={-130} y={-340} width={260} height={340} rx={10} fill={fill} />
      <rect x={-130} y={-340} width={24} height={340} rx={8} fill="#000" opacity={0.3} />
      <rect x={-110} y={-320} width={220} height={298} rx={6} fill="none" stroke="#e8c37a" strokeWidth={4} opacity={0.85} />
      <path d={`M-60,-310 Q0,-280 60,-310 M-60,-30 Q0,-60 60,-30`} fill="none" stroke="#e8c37a" strokeWidth={4} opacity={0.7} />
      <rect x={-130} y={-6} width={260} height={10} fill="#efdcb5" opacity={0.8} />
    </g>
  );
  return (
    <Svg bg="#1b1426">
      <defs><Glow id="g2" cx={540} cy={640} r={900} color="#ffc070" /></defs>
      <g transform={L(c, 0.2)}><Stars t={t} n={40} seed={21} h={700} /></g>
      <g transform={L(c, 0.35)}><Sheet d={ridge(1050, 60, 21, 2)} fill="#5d4a6e" glow="g2" trans={0.6} /></g>
      <g transform={L(c, 0.6)}>
        {/* lentera kertas menggantung, menerangi meja */}
        <g transform={`translate(540 0) rotate(${sway} 0 0)`}>
          <line x1={0} y1={0} x2={0} y2={560} stroke="#2a1a10" strokeWidth={5} />
          <circle cx={0} cy={640} r={330} fill="url(#goldG)" opacity={0.45 * flick(t)} />
          <rect x={-46} y={548} width={92} height={18} rx={6} fill="#2a1a10" />
          <ellipse cx={0} cy={640} rx={78} ry={92} fill="#ffcf7a" />
          <ellipse cx={0} cy={640} rx={78} ry={92} fill="url(#dot)" opacity={0.9 * flick(t, 1)} />
          {[-40, 0, 40].map((dx) => <path key={dx} d={`M${dx},552 Q${dx * 1.9},640 ${dx},728`} fill="none" stroke="#b5782a" strokeWidth={3} opacity={0.7} />)}
          <rect x={-40} y={724} width={80} height={16} rx={6} fill="#2a1a10" />
        </g>
      </g>
      <g transform={L(c, 1)}>
        {/* meja kayu kertas */}
        <Sheet d="M-200,1250 L1280,1250 L1280,2100 L-200,2100 Z" fill="#3a2414" rimOp={0.6} />
        <rect x={-200} y={1250} width={1480} height={16} fill="#6a4426" />
        <Book x={265} k={bookL} fill="#6b2a1c" />
        <Book x={815} k={bookR} fill="#1f3a5a" />
        {/* rehal (penyangga kitab silang) + kitab terbuka */}
        <g transform="translate(540 1250)" filter="url(#soft)">
          <path d="M-120,0 L90,-150 M120,0 L-90,-150" stroke="#5a3418" strokeWidth={22} strokeLinecap="round" />
          <path d={`M0,-150 Q${-90 * open},${-200 - 30 * open} ${-140 * open},${-170 - 40 * open} L${-140 * open},${-140 - 40 * open} Q${-90 * open},${-170} 0,-120 Z`} fill="#f3e2bf" />
          <path d={`M0,-150 Q${90 * open},${-200 - 30 * open} ${140 * open},${-170 - 40 * open} L${140 * open},${-140 - 40 * open} Q${90 * open},${-170} 0,-120 Z`} fill="#efdcb5" />
          {open > 0.6 ? [0, 1, 2].map((i) => <g key={i} opacity={(open - 0.6) / 0.4}><path d={`M${-150 + i * 4},${-186 + i * 14} Q-80,${-205 + i * 14} -20,${-170 + i * 14}`} fill="none" stroke="#7a5a3a" strokeWidth={3} /><path d={`M${150 - i * 4},${-186 + i * 14} Q80,${-205 + i * 14} 20,${-170 + i * 14}`} fill="none" stroke="#7a5a3a" strokeWidth={3} /></g>) : null}
        </g>
      </g>
    </Svg>
  );
};
const S2Text: React.FC<SP> = ({ t }) => (
  <>
    <Strip t={t} at={5.4} y={250} w={700} dark><Kick c={C.gold}>Sabda Nabi Muhammad ﷺ</Kick></Strip>
    <div style={{ position: "absolute", left: 170, width: 740, top: 360, textAlign: "center", opacity: ease(t, 7.6, 8.1), background: "#f3e2bf", borderRadius: 6, padding: "8px 0", boxShadow: "0 8px 18px rgba(0,0,0,0.45)" }}>
      <Kick c="#7a3a1c" size={30}>diriwayatkan</Kick>
      <Big size={70} c={C.ink}>Abu Sa'id Al-Khudri</Big>
    </div>
    <div style={{ position: "absolute", left: 125, width: 240, top: 1000, textAlign: "center", transform: `scale(${pop(t, 8.8)})`, background: "#f3e2bf", borderRadius: 6, padding: "6px 0" }}>
      <Kick c="#7a3a1c" size={28}>Bukhari</Kick>
      <Big size={64} c={C.seal}>3470</Big>
    </div>
    <div style={{ position: "absolute", left: 715, width: 240, top: 1000, textAlign: "center", transform: `scale(${pop(t, 9.3)})`, background: "#f3e2bf", borderRadius: 6, padding: "6px 0" }}>
      <Kick c="#7a3a1c" size={28}>Muslim</Kick>
      <Big size={64} c={C.seal}>2766</Big>
    </div>
  </>
);

// ================= S3 Negeri asal (11.0–18.6): 99, gelisah, mencari =================
const S3: React.FC<SP> = ({ t }) => {
  const lt = t - 11;
  const c: Cam = { z: 1.05 + lt * 0.008, x: -lt * 14, y: 0 };
  const tw = town(1180, 31, -300, 1500, 120, 300);
  const stop = soft(t, 14.9, 15.4) * (1 - soft(t, 16.4, 16.9));
  const walkSpeed = 1 - stop;
  const walk = lt * 7 * (1 - 0.8 * stop);
  const mx = 300 + lt * 34 * walkSpeed - stop * 0;
  return (
    <Svg bg="#2a0f12">
      <defs><Glow id="g3" cx={760} cy={950} r={800} color="#ff9a4a" /></defs>
      <g transform={L(c, 0.15)}><Stars t={t} n={30} seed={31} h={600} op={0.6} /></g>
      <g transform={L(c, 0.3)}><Sheet d={ridge(980, 90, 32, 2)} fill="#7a3a2e" glow="g3" trans={0.6} /></g>
      <g transform={L(c, 0.6)}>
        <Sheet d={tw.d} fill="#4a1c18" glow="g3" trans={0.2} />
        {tw.wins.map(([x, y], i) => <rect key={i} x={x - 11} y={y - 15} width={22} height={30} rx={10} fill="#ff9a4a" opacity={(0.55 + 0.45 * ((i * 37) % 7) / 7) * flick(t, i)} />)}
      </g>
      <g transform={L(c, 1)}>
        <Sheet d={ridge(1500, 25, 33, 4)} fill="#120607" rimOp={0.6} />
        <Man x={mx + lt * 14} y={1480} s={1.25} walk={walk} fill="#120607" t={t} lamp={1} />
        {/* jalan menuju cahaya jauh: tanda arah */}
        <g opacity={ease(t, 16.6, 17.4)} transform={`translate(${900 + lt * 14} 1500)`}>
          <rect x={-6} y={-220} width={12} height={220} fill="#120607" />
          <path d="M0,-210 L130,-210 L160,-185 L130,-160 L0,-160 Z" fill="#120607" />
        </g>
      </g>
    </Svg>
  );
};
const S3Text: React.FC<SP> = ({ t }) => (
  <>
    <Strip t={t} at={11.3} out={13.0} y={260} w={600} dark><Kick c={C.gold}>umat terdahulu</Kick></Strip>
    <Num t={t} at={13.2} y={230} n="99" sub="JIWA" c="#ff8a5a" />
    <Strip t={t} at={15.0} out={16.4} y={640} w={500}><Big size={64}>hati gelisah</Big></Strip>
    <Strip t={t} at={16.6} y={640} w={700}><Big size={58}>mencari orang paling alim</Big></Strip>
  </>
);

// ================= S4 Rahib (18.6–29.5): "TIDAK", lentera padam, genap 100 =================
const S4: React.FC<SP> = ({ t }) => {
  const k = soft(t, 18.6, 24.6);
  const c: Cam = { z: mix(1.0, 1.18, k) + soft(t, 24.6, 29.5) * 0.1, x: mix(30, -20, k), y: mix(40, -40, k) };
  const out = 1 - soft(t, 25.7, 27.6); // lentera rahib padam perlahan (tanpa visual kekerasan)
  const dim = mix(0.35, 1, out);
  return (
    <Svg bg="#1b1426">
      <defs><Glow id="g4" cx={700} cy={1080} r={760} color="#ffc070" /></defs>
      <g opacity={dim}>
        <g transform={L(c, 0.15)}><Stars t={t} n={45} seed={41} h={800} /></g>
        <g transform={L(c, 0.35)}><Sheet d={ridge(1000, 80, 42, 2)} fill="#5d4a6e" glow="g4" trans={0.55 * out + 0.1} /></g>
      </g>
      <g transform={L(c, 0.65)}>
        <Sheet d={ridge(1330, 30, 43, 2)} fill="#2f2440" glow="g4" trans={0.3 * out} />
        {/* pondok rahib */}
        <g transform="translate(700 1300)">
          <path d="M-210,0 L-210,-220 L0,-380 L210,-220 L210,0 Z" fill="#241a33" filter="url(#lay)" />
          <path d="M-210,-220 L0,-380 L210,-220" fill="none" stroke="#ffcf8a" strokeOpacity={0.6} strokeWidth={4} />
          <rect x={-70} y={-200} width={140} height={150} rx={70} fill="#ffc070" opacity={0.08 + 0.92 * out * flick(t, 3)} />
          <Seated x={0} y={-50} s={0.62} fill="#0b0812" />
          <circle cx={0} cy={-130} r={260} fill="url(#dot)" opacity={0.55 * out * flick(t, 4)} />
        </g>
      </g>
      <g transform={L(c, 1)}>
        <Sheet d={ridge(1560, 30, 44, 5)} fill="#0b0812" rimOp={0.45} />
        <path d="M-40,2500 L-40,700 Q10,600 70,640 L110,2500 Z" fill="#0b0812" />
        <Man x={300} y={1545} s={1.3} walk={0} fill="#0b0812" t={t} />
      </g>
    </Svg>
  );
};
const S4Text: React.FC<SP> = ({ t }) => {
  const st = ease(t, 24.62, 24.85);
  return (
    <>
      <Strip t={t} at={19.6} out={21.7} y={250} w={620} dark><Kick c={C.gold}>seorang rahib</Kick><Big size={52} c={C.cream}>ahli ibadah</Big></Strip>
      <Strip t={t} at={21.9} out={25.6} y={250} w={820}><Big size={74}>“Adakah taubat untukku?”</Big></Strip>
      {st > 0 && t < 25.8 ? (
        <div style={{ position: "absolute", left: 290, top: 470, width: 500, textAlign: "center", transform: `rotate(-8deg) scale(${mix(1.8, 1, st)})`, opacity: st * (1 - lin(t, 25.5, 25.8)) }}>
          <div style={{ display: "inline-block", border: `10px solid ${C.seal}`, color: C.seal, fontFamily: SERIF, fontWeight: 700, fontSize: 150, padding: "0 40px", borderRadius: 14, background: "rgba(246,234,210,0.92)", lineHeight: 1.1 }}>TIDAK</div>
        </div>
      ) : null}
      <Strip t={t} at={25.65} out={28.1} y={300} w={560} dark><Big size={60} c={C.cream}>putus asa…</Big></Strip>
      <Num t={t} at={28.27} y={240} n="100" sub="GENAP SERATUS" c="#ff8a5a" />
    </>
  );
};

// ================= S5 Orang alim (29.5–39.6): lampu menyala, "YA." =================
const S5: React.FC<SP> = ({ t }) => {
  const k = soft(t, 29.5, 36.4);
  const ya = ease(t, 36.44, 37.0);
  const c: Cam = { z: mix(1.0, 1.14, k) + ya * 0.06, x: Math.sin(t * 0.4) * 10, y: mix(30, -30, k) };
  const src = ease(t, 29.7, 30.4);
  const layer = (i: number) => ease(t, 30.0 + i * 0.4, 30.6 + i * 0.4);
  const burst = ya * (1 - lin(t, 37.0, 39.6) * 0.5);
  const r = mulberry(51);
  const books = Array.from({ length: 30 }, (_, i) => ({ x: 120 + (i % 10) * 85 + r() * 10, row: Math.floor(i / 10), h: 70 + r() * 40, w: 26 + r() * 30 }));
  return (
    <Svg bg="#2a1c0e">
      <defs><Glow id="g5" cx={540} cy={640} r={mix(300, 1000, src)} color="#ffd38a" /></defs>
      {/* dinding belakang */}
      <rect x={-200} y={-200} width={1480} height={2400} fill="#a8743a" opacity={0.25 + 0.75 * layer(0)} />
      <rect x={-200} y={-200} width={1480} height={2400} fill="url(#g5)" opacity={0.9 * src} style={{ mixBlendMode: "screen" }} />
      <g transform={L(c, 0.4)} opacity={0.3 + 0.7 * layer(1)}>
        {/* rak kitab siluet */}
        {[0, 1, 2].map((row) => <rect key={row} x={90} y={950 + row * 150} width={900} height={14} fill="#5e3c1c" />)}
        {books.map((b, i) => <rect key={i} x={b.x} y={950 + b.row * 150 - b.h} width={b.w} height={b.h} fill="#5e3c1c" />)}
        {/* papan kertas AUDIRA di rak (brand dalam adegan) */}
        <g transform="translate(790 1222) rotate(-3)">
          <rect x={-110} y={-40} width={220} height={70} rx={4} fill="#120a04" stroke="#ffcf8a" strokeOpacity={0.6} strokeWidth={3} filter="url(#soft)" />
          <text x={0} y={8} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={46} fill="#ffe3a8" style={{ color: "#ffe3a8" }} letterSpacing={5}>AUDIRA</text>
        </g>
      </g>
      <g transform={L(c, 0.7)}>
        {/* lampu gantung besar */}
        <line x1={540} y1={-200} x2={540} y2={560} stroke="#170d05" strokeWidth={5} />
        <circle cx={540} cy={640} r={240 + burst * 260} fill="url(#goldG)" opacity={src * (0.7 + 0.3 * flick(t, 5)) * (0.75 + burst * 0.25)} />
        <path d="M490,560 L590,560 L620,690 L460,690 Z" fill="#170d05" />
        <path d="M500,575 L580,575 L600,675 L480,675 Z" fill="#ffe3a8" opacity={0.15 + 0.85 * src} />
        <Seated x={760} y={1620} s={1.15} fill="#170d05" book />
        <Man x={300} y={1640} s={1.3} fill="#170d05" t={t} />
      </g>
      <g transform={L(c, 1)} opacity={0.4 + 0.6 * layer(2)}>
        {/* bingkai lengkung depan */}
        <path d="M-200,2500 L-200,-200 L1280,-200 L1280,2500 L1010,2500 L1010,520 Q1010,180 540,160 Q70,180 70,520 L70,2500 Z" fill="#170d05" />
        <path d="M1010,520 Q1010,180 540,160 Q70,180 70,520" fill="none" stroke="#ffcf8a" strokeOpacity={0.55} strokeWidth={5} />
        <Sheet d={ridge(1700, 10, 52, 2)} fill="#170d05" rimOp={0.5} />
      </g>
    </Svg>
  );
};
const S5Text: React.FC<SP> = ({ t }) => (
  <>
    <Strip t={t} at={32.0} out={34.2} y={260} w={600} dark><Kick c={C.gold}>terus bertanya</Kick></Strip>
    <Strip t={t} at={34.37} out={36.3} y={260} w={640} dark><Kick c={C.gold}>seorang alim</Kick><Big size={58} c={C.cream}>orang berilmu</Big></Strip>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 230, textAlign: "center", transform: `scale(${pop(t, 36.44)})`, opacity: 1 - lin(t, 39.4, 39.7) }}>
      {t >= 36.44 ? <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 220, color: "#fff4d6", textShadow: `0 0 60px ${C.gold}, 0 10px 0 rgba(0,0,0,0.4)` }}>YA.</div> : null}
    </div>
    <Strip t={t} at={37.12} out={39.5} y={540} w={900}><Big size={56}>Siapa yang bisa menghalangi</Big></Strip>
    <Strip t={t} at={38.17} out={39.5} y={660} w={820}><Big size={56}>antara dirimu dan taubat?</Big></Strip>
  </>
);

// ================= S6 Peta (39.6–47.3): dua negeri, jalan, jangan kembali =================
const S6: React.FC<SP> = ({ t }) => {
  const c: Cam = { z: mix(1.25, 1.0, soft(t, 39.6, 41.5)) + soft(t, 43.8, 47.3) * 0.08, x: soft(t, 43.8, 46.5) * 60, y: soft(t, 43.8, 46.5) * -40 };
  const path = ease(t, 39.8, 41.8);
  const cross = ease(t, 44.6, 45.4);
  const winOn = (i: number) => ease(t, 40.3 + i * 0.12, 40.7 + i * 0.12);
  const A = { x: 300, y: 1100 }, B = { x: 770, y: 560 };
  const pathD = `M${A.x},${A.y} C${A.x + 260},${A.y - 80} ${B.x - 320},${B.y + 260} ${B.x},${B.y}`;
  return (
    <Svg bg="#2a1c0e">
      <defs><Glow id="g6" cx={540} cy={900} r={900} color="#ffd38a" /></defs>
      <g transform={L(c, 0.6)}>
        {/* lembar peta krem */}
        <path d="M110,330 L980,300 L1000,1560 L90,1590 Z" fill="#e6d0a4" filter="url(#soft)" />
        <path d="M110,330 L980,300 L1000,1560 L90,1590 Z" fill="url(#g6)" opacity={0.35} style={{ mixBlendMode: "screen" }} />
        {/* bukit kecil peta */}
        {[[540, 980], [650, 1180], [420, 820], [860, 1000]].map(([x, y], i) => <path key={i} d={`M${x - 60},${y} Q${x},${y - 70} ${x + 60},${y} Z`} fill="#c4a774" />)}
        {/* negeri asal (merah) */}
        <g transform={`translate(${A.x} ${A.y})`}>
          <circle r={130} fill="#7a3a2e" opacity={0.85} />
          {[-50, 0, 50].map((dx, i) => <rect key={i} x={dx - 22} y={-40 - (i % 2) * 20} width={44} height={70 + (i % 2) * 20} fill="#4a1c18" />)}
          <path d={`M-110,-110 L${-110 + 220 * cross},${-110 + 220 * cross}`} stroke={C.seal} strokeWidth={18} strokeLinecap="round" opacity={cross > 0 ? 1 : 0} />
          <path d={`M110,-110 L${110 - 220 * clamp(cross * 2 - 1)},${-110 + 220 * clamp(cross * 2 - 1)}`} stroke={C.seal} strokeWidth={18} strokeLinecap="round" opacity={cross > 0.5 ? 1 : 0} />
        </g>
        {/* negeri orang saleh (teal + jendela emas) */}
        <g transform={`translate(${B.x} ${B.y})`}>
          <circle r={150} fill="#2c5260" />
          <circle r={260} fill="url(#goldG)" opacity={0.35 * path} />
          {[-70, -20, 30, 80].map((dx, i) => (
            <g key={i}>
              <rect x={dx - 22} y={-50 - (i % 2) * 24} width={44} height={90 + (i % 2) * 24} fill="#071a20" />
              <rect x={dx - 8} y={-30 - (i % 2) * 24} width={16} height={22} rx={8} fill={C.gold} opacity={winOn(i)} />
            </g>
          ))}
          <path d="M-20,-110 Q0,-150 20,-110 Z" fill="#071a20" />
        </g>
        {/* jalan bertitik menggambar diri */}
        <path d={pathD} fill="none" stroke="#3a2414" strokeWidth={10} strokeDasharray="4 26" strokeLinecap="round" pathLength={1000} style={{ strokeDashoffset: 0 }} opacity={0.9} />
        <path d={pathD} fill="none" stroke="#e6d0a4" strokeWidth={16} pathLength={1000} strokeDasharray={`${(1 - path) * 1000} 1000`} strokeDashoffset={-path * 1000} />
        {path > 0.98 ? <path d={`M${B.x - 120},${B.y + 150} l40,-50 l-60,6`} fill="none" stroke="#3a2414" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </g>
      <g transform={L(c, 1)}>
        <path d="M-300,2500 L-300,-300 L1380,-300 L1380,2500 Z M60,1700 L1020,1700 L1020,200 L60,200 Z" fill="#170d05" fillRule="evenodd" />
      </g>
    </Svg>
  );
};
const S6Text: React.FC<SP> = ({ t }) => (
  <>
    <Strip t={t} at={40.16} out={43.6} y={230} w={760} dark accent={C.gold}><Kick c={C.gold}>pergilah ke</Kick><Big size={62} c={C.cream}>negeri orang-orang saleh</Big></Strip>
    <Strip t={t} at={41.6} out={43.6} y={420} w={640}><Big size={50}>beribadahlah bersama mereka</Big></Strip>
    <Strip t={t} at={44.6} y={230} w={760} dark accent={C.seal}><Kick c="#ff8a6a">jangan kembali</Kick><Big size={62} c={C.cream}>negeri yang buruk</Big></Strip>
  </>
);

// ================= S7 Perjalanan (47.3–53.9): jalan malam, lentera padam, condong ke tujuan =================
const S7: React.FC<SP> = ({ t }) => {
  const stopK = soft(t, 50.4, 51.4);
  // jarak tempuh: bergerak sampai 50.5 lalu berhenti
  const travel = (Math.min(t, 50.9) - 47.3) * 1 - stopK * 0.3;
  const c: Cam = { z: 1.0 + soft(t, 51.0, 53.9) * 0.12, x: 0, y: soft(t, 51.0, 53.9) * -50 };
  const drop = ease(t, 50.55, 51.6);
  const lean = soft(t, 50.9, 52.4);
  const lamp = 1 - soft(t, 51.0, 52.0);
  const scroll = (sp: number) => -(travel * sp) % 1400;
  return (
    <Svg bg="#060b22">
      <defs><Glow id="g7" cx={800} cy={1100} r={800} color="#a0b8ff" /></defs>
      <g transform={L(c, 0.1)}><Stars t={t} n={70} seed={71} h={1100} /></g>
      <g transform={L(c, 0.1)}><circle cx={820} cy={430} r={70} fill="#fff1d0" opacity={0.9} /><circle cx={820} cy={430} r={200} fill="url(#whiteG)" opacity={0.25} /></g>
      <g transform={L(c, 0.3)}>
        <g transform={`translate(${scroll(40)} 0)`}><Sheet d={ridge(1150, 80, 72, 3, -400, 3000)} fill="#6a86c2" glow="g7" trans={0.5} /></g>
      </g>
      <g transform={L(c, 0.6)}>
        <g transform={`translate(${scroll(110)} 0)`}>
          <Sheet d={ridge(1380, 40, 73, 6, -400, 3000)} fill="#3f5a92" glow="g7" trans={0.2} />
          {Array.from({ length: 9 }, (_, i) => { const x = -200 + i * 360; return <path key={i} d={`M${x},1400 L${x},1250 M${x - 60},1300 Q${x},1110 ${x + 60},1300 Z`} fill="#3f5a92" stroke="#3f5a92" strokeWidth={14} />; })}
        </g>
      </g>
      <g transform={L(c, 1)}>
        <g transform="translate(0 -250)">
        <Sheet d={ridge(1560, 18, 74, 3)} fill="#0e1532" rimOp={0.55} />
        {/* tiang papan "negeri orang saleh" lewat */}
        <g transform={`translate(${1150 - travel * 230} 1565)`}>
          <rect x={-7} y={-430} width={14} height={430} fill="#0e1532" />
          <rect x={-140} y={-425} width={280} height={80} rx={4} fill="#03050f" stroke="#ffcf8a" strokeOpacity={0.6} strokeWidth={3} filter="url(#soft)" />
          <text x={0} y={-375} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={38} fill="#ffe3a8" style={{ color: "#ffe3a8" }}>NEGERI SALEH →</text>
        </g>
        <g opacity={1 - lean * 0.25}>
          <Man x={470} y={1560} s={1.25} walk={travel * 8} fill="#0e1532" t={t} lamp={lamp} lampDrop={drop} lean={lean * 62} />
        </g>
        {/* semak depan lewat cepat */}
        <g transform={`translate(${scroll(260)} 0)`}>
          {Array.from({ length: 8 }, (_, i) => { const x = -100 + i * 380; return <path key={i} d={`M${x - 120},2000 Q${x - 90},1660 ${x},1640 Q${x + 100},1660 ${x + 130},2000 Z`} fill="#050816" />; })}
        </g>
      </g>
      </g>
    </Svg>
  );
};
const S7Text: React.FC<SP> = ({ t }) => {
  const ar = ease(t, 52.2, 52.8);
  return (
    <>
      <Strip t={t} at={47.6} out={50.3} y={260} w={540} dark><Kick c={C.gold}>ia pun berangkat</Kick></Strip>
      <Strip t={t} at={50.53} out={52.0} y={260} w={700}><Big size={56}>maut menjemput di jalan</Big></Strip>
      <Strip t={t} at={52.15} y={260} w={760} dark accent={C.gold}><Big size={56} c={C.cream}>dadanya condong ke tujuan</Big></Strip>
      {ar > 0 ? (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d={`M560,1000 L${560 + 360 * ar},1000`} stroke={C.gold} strokeWidth={14} strokeLinecap="round" />
          <path d={`M${520 + 360 * ar},960 L${570 + 360 * ar},1000 L${520 + 360 * ar},1040`} fill="none" stroke={C.gold} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={ar} />
        </svg>
      ) : null}
    </>
  );
};

// ================= S8 Dua cahaya + penengah (53.9–66.4) =================
const S8: React.FC<SP> = ({ t }) => {
  const k = soft(t, 53.9, 62.6);
  const mid = ease(t, 63.3, 64.8);
  const c: Cam = { z: mix(1.08, 1.0, k), x: 0, y: mix(-30, 20, k) + soft(t, 62.6, 66.4) * 40 };
  const gIn = ease(t, 54.3, 55.0), bIn = ease(t, 55.2, 55.9);
  const gSpeak = 1 + 0.25 * soft(t, 56.4, 56.9) * (1 - soft(t, 59.0, 59.6));
  const bSpeak = 1 + 0.25 * soft(t, 59.9, 60.4) * (1 - soft(t, 62.0, 62.6));
  const pulse = (ph: number) => 1 + 0.06 * Math.sin(t * 2.2 + ph);
  const ruler = ease(t, 64.9, 65.9);
  return (
    <Svg bg="#05071a">
      <defs><Glow id="g8a" cx={250} cy={760} r={700} color={C.gold} /><Glow id="g8b" cx={830} cy={760} r={700} color={C.blue} /></defs>
      <g transform={L(c, 0.15)}><Stars t={t} n={50} seed={81} h={1000} op={0.6} /></g>
      {/* cahaya rahmat (emas) dan azab (biru): hanya cahaya, tanpa wujud */}
      <g transform={L(c, 0.25)}>
        <circle cx={250} cy={760} r={330 * gIn * pulse(0) * gSpeak} fill="url(#goldG)" opacity={0.95 * gIn} />
        <circle cx={250} cy={760} r={60 * gIn} fill="#fffbe8" opacity={gIn} filter="url(#b6)" />
        <circle cx={830} cy={760} r={330 * bIn * pulse(2) * bSpeak} fill="url(#blueG)" opacity={0.95 * bIn} />
        <circle cx={830} cy={760} r={60 * bIn} fill="#f2f8ff" opacity={bIn} filter="url(#b6)" />
        {/* titik putih penengah turun */}
        <circle cx={540} cy={mix(-100, 560, mid)} r={160 * mid} fill="url(#whiteG)" opacity={mid} />
        <circle cx={540} cy={mix(-100, 560, mid)} r={26} fill="#ffffff" opacity={mid} />
      </g>
      <g transform={L(c, 0.45)}>
        <Sheet d={ridge(1250, 60, 82, 2)} fill="#1c2240" glow="g8a" trans={0.35} rim="#ffe0a0" />
        <path d={ridge(1250, 60, 82, 2)} fill="url(#g8b)" opacity={0.35} style={{ mixBlendMode: "screen" }} />
      </g>
      <g transform={L(c, 0.75)}>
        <Sheet d={ridge(1440, 30, 83, 3)} fill="#0d1028" rimOp={0.5} />
        {/* lentera yang jatuh di tengah jalan (bukan jasad) */}
        <g transform="translate(540 1440) rotate(80)"><rect x={-12} y={-30} width={24} height={30} rx={4} fill="#05060f" /></g>
        {/* garis ukur cahaya */}
        <line x1={540 - 420 * ruler} y1={1470} x2={540 + 420 * ruler} y2={1470} stroke="#ffffff" strokeWidth={5} opacity={ruler * 0.9} />
        {[-420, -210, 210, 420].map((dx, i) => <line key={i} x1={540 + dx * ruler} y1={1450} x2={540 + dx * ruler} y2={1490} stroke="#ffffff" strokeWidth={5} opacity={ruler} />)}
      </g>
      <g transform={L(c, 1)}><Sheet d={ridge(1640, 20, 84, 5)} fill="#04050f" rimOp={0.4} /></g>
    </Svg>
  );
};
const S8Text: React.FC<SP> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: 60, width: 380, top: 990, textAlign: "center", opacity: ease(t, 54.5, 55.0) * (1 - lin(t, 62.4, 62.8)) }}><Kick c={C.gold} size={36}>rahmat</Kick></div>
    <div style={{ position: "absolute", left: 640, width: 380, top: 990, textAlign: "center", opacity: ease(t, 55.3, 55.8) * (1 - lin(t, 62.4, 62.8)) }}><Kick c={C.blue} size={36}>azab</Kick></div>
    <Strip t={t} at={56.41} out={59.7} x={480} y={250} w={820} dark accent={C.gold} rot={-1.5}><Big size={56} c={C.cream}>“Ia datang dengan hati bertaubat.”</Big></Strip>
    <Strip t={t} at={59.89} out={62.5} x={600} y={250} w={820} dark accent={C.blue} rot={1.5}><Big size={56} c={C.cream}>“Ia belum pernah berbuat baik.”</Big></Strip>
    <Strip t={t} at={63.6} out={64.8} y={250} w={620} dark><Kick c="#ffffff">satu penengah</Kick></Strip>
    <Strip t={t} at={64.88} y={250} w={820}><Big size={66}>“Ukurlah jarak kedua negeri.”</Big></Strip>
  </>
);

// ================= S9 Payoff (66.4–76.7): negeri bergeser, sejengkal, diampuni =================
const S9: React.FC<SP> = ({ t }) => {
  const near = ease(t, 67.3, 69.0); // negeri tujuan mendekat
  const far = ease(t, 69.3, 71.0); // negeri asal menjauh
  const dawn = soft(t, 75.3, 76.7);
  const allOn = ease(t, 75.48, 76.3);
  const c: Cam = { z: mix(1.0, 1.0, 0) + soft(t, 71.3, 76.7) * 0.12, x: soft(t, 74, 76.7) * -40, y: soft(t, 71.3, 76.7) * -30 };
  const rul = ease(t, 71.4, 72.6);
  const ax = mix(170, -40, far), bx = mix(1020, 800, near);
  const mx = 520; // posisi lentera jatuh
  const winR = mulberry(91);
  const wins = Array.from({ length: 14 }, () => ({ x: (winR() - 0.5) * 230, y: -40 - winR() * 170 }));
  return (
    <Svg bg={`linear-gradient(${dawn > 0 ? `rgba(43,29,78,1), rgba(242,184,106,${dawn})` : "#05071a, #0a1030"})`}>
      <defs><Glow id="g9" cx={bx} cy={1000} r={800} color={C.gold} /></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="#05071a" opacity={1 - dawn} />
      <rect x={0} y={0} width={1080} height={1920} fill="url(#g9)" opacity={0.25 + 0.5 * allOn} />
      <g transform={L(c, 0.15)}><Stars t={t} n={50} seed={91} h={900} op={1 - dawn} /></g>
      <g transform={L(c, 0.35)}><Sheet d={ridge(1150, 50, 92, 2)} fill={dawn > 0.5 ? "#c58a6a" : "#3b3f6e"} glow="g9" trans={0.4 + allOn * 0.3} /></g>
      <g transform={L(c, 0.7)}>
        <Sheet d={ridge(1220, 15, 93, 2)} fill="#1a1c3c" glow="g9" trans={0.2 + allOn * 0.2} />
        {/* negeri asal (kiri, merah redup) */}
        <g transform={`translate(${ax} 1220) scale(1.3)`} opacity={1 - far * 0.45}>
          <path d="M-160,0 L-160,-120 L-100,-120 L-100,-190 L-30,-190 L-30,-140 L40,-140 L40,-230 L110,-230 L110,-100 L160,-100 L160,0 Z" fill="#4a1c18" filter="url(#lay)" />
          {[[-130, -80], [-65, -150], [75, -190], [5, -100]].map(([x, y], i) => <rect key={i} x={x} y={y} width={16} height={22} rx={8} fill="#ff9a4a" opacity={0.5 * (1 - far)} />)}
        </g>
        {/* negeri orang saleh (kanan, teal + jendela emas) */}
        <g transform={`translate(${bx} 1220) scale(1.3)`}>
          <circle cx={0} cy={-120} r={220 + allOn * 160} fill="url(#goldG)" opacity={0.3 + allOn * 0.6} />
          <path d="M-150,0 L-150,-110 L-90,-110 Q-60,-200 -30,-110 L20,-110 L20,-210 L80,-210 L80,-130 L150,-130 L150,0 Z" fill="#2c5260" filter="url(#lay)" />
          <path d="M45,-210 L50,-270 L55,-210 Z" fill="#2c5260" />
          {wins.map((w, i) => <rect key={i} x={clamp(w.x, -130, 130)} y={Math.max(w.y, -100)} width={14} height={20} rx={7} fill={C.gold} opacity={(i < 4 ? 0.9 : allOn) * flick(t, i)} />)}
        </g>
        {/* lentera jatuh di tengah */}
        <g transform={`translate(${mx} 1225) rotate(80)`}><rect x={-10} y={-24} width={20} height={24} rx={4} fill="#05060f" /></g>
        {/* penggaris cahaya: dua ruas, kanan lebih pendek sejengkal */}
        <g opacity={rul}>
          <line x1={mx} y1={1275} x2={mix(mx, ax + 208, rul)} y2={1275} stroke="#ffffff" strokeWidth={6} />
          <line x1={mx} y1={1275} x2={mix(mx, bx - 195, rul)} y2={1275} stroke={C.gold} strokeWidth={9} />
          {[mx, ax + 208, bx - 195].map((x, i) => <line key={i} x1={x} y1={1250} x2={x} y2={1300} stroke={i === 2 ? C.gold : "#ffffff"} strokeWidth={6} />)}
        </g>
      </g>
      <g transform={L(c, 1)}><Sheet d={ridge(1600, 20, 94, 4)} fill="#140c1e" rimOp={0.55} /></g>
    </Svg>
  );
};
const S9Text: React.FC<SP> = ({ t }) => {
  const s = pop(t, 73.2);
  return (
    <>
      <Strip t={t} at={66.6} out={71.2} y={240} w={720} dark><Kick c={C.gold}>Allah memerintahkan</Kick></Strip>
      <div style={{ position: "absolute", left: 600, width: 420, top: 880, textAlign: "center", opacity: ease(t, 67.5, 68) * (1 - lin(t, 71, 71.3)) }}><Kick c={C.gold} size={36}>← mendekat</Kick></div>
      <div style={{ position: "absolute", left: 40, width: 420, top: 880, textAlign: "center", opacity: ease(t, 69.5, 70) * (1 - lin(t, 71, 71.3)) }}><Kick c="#ff8a6a" size={36}>menjauh ←</Kick></div>
      {s > 0 ? (
        <div style={{ position: "absolute", left: 60, width: 960, top: 300, textAlign: "center", transform: `scale(${s})`, opacity: 1 - lin(t, 75.2, 75.5) }}>
          <div style={{ background: C.cream, borderRadius: 8, padding: "18px 30px 26px", boxShadow: "0 -4px 0 rgba(255,207,138,0.85), 0 18px 34px rgba(0,0,0,0.5)" }}>
            <Kick c="#7a3a1c">lebih dekat</Kick>
            <Big size={128} c={C.ink}>SEJENGKAL</Big>
            <Arab size={78} c="#7a3a1c">بِشِبْرٍ</Arab>
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 380, textAlign: "center", transform: `scale(${pop(t, 75.48)})` }}>
        {t >= 75.48 ? <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: "#fff4d6", textShadow: `0 0 50px ${C.gold}, 0 8px 0 rgba(0,0,0,0.4)` }}>DIAMPUNI</div> : null}
      </div>
    </>
  );
};

// ================= S10 Penutup (76.7–83.3): fajar, QS 39:53 =================
const S10: React.FC<SP> = ({ t }) => {
  const k = soft(t, 76.7, 83.3);
  const c: Cam = { z: mix(1.15, 1.0, k), x: 0, y: mix(-40, 20, k) };
  const sun = soft(t, 76.7, 80);
  return (
    <Svg bg="linear-gradient(#2b1d4e, #8a5a7a 45%, #f2b86a)">
      <defs><Glow id="g10" cx={540} cy={1180} r={900} color="#ffe2a0" /></defs>
      <g transform={L(c, 0.15)}>
        <circle cx={540} cy={mix(1350, 1150, sun)} r={170} fill="#ffe2a0" />
        <circle cx={540} cy={mix(1350, 1150, sun)} r={520} fill="url(#goldG)" opacity={0.6} />
      </g>
      <g transform={L(c, 0.35)}><Sheet d={ridge(1260, 60, 101, 2)} fill="#c58a6a" glow="g10" trans={0.55} rim="#ffe8b8" /></g>
      <g transform={L(c, 0.65)}><Sheet d={ridge(1430, 40, 102, 3)} fill="#5a3a5e" glow="g10" trans={0.25} rim="#ffe8b8" /></g>
      <g transform={L(c, 1)}>
        <Sheet d={ridge(1600, 20, 103, 4)} fill="#140c1e" rimOp={0.6} />
        <Lantern x={540} y={1610} s={1.1} on={1} t={t} dark="#140c1e" />
      </g>
    </Svg>
  );
};
const S10Text: React.FC<SP> = ({ t }) => (
  <>
    <Strip t={t} at={76.92} out={78.7} y={300} w={640} dark><Big size={64} c={C.cream}>Seberat apa pun dosamu…</Big></Strip>
    <div style={{ position: "absolute", left: 70, width: 940, top: 250, opacity: ease(t, 78.8, 79.5) }}>
      <div style={{ background: "rgba(246,234,210,0.95)", borderRadius: 8, padding: "16px 34px 26px", textAlign: "center", boxShadow: "0 -4px 0 rgba(255,207,138,0.85), 0 18px 34px rgba(0,0,0,0.45)" }}>
        <Arab size={76} c="#3a2414">لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ</Arab>
        <Big size={50} c={C.ink}>“Janganlah kamu berputus asa dari rahmat Allah.”</Big>
        <div style={{ marginTop: 10 }}><Kick c="#7a3a1c" size={36}>QS Az-Zumar 39:53</Kick></div>
      </div>
    </div>
    <Strip t={t} at={81.3} y={760} w={620} dark><Kick c={C.gold}>kisah dari hadits</Kick><Big size={58} c={C.cream}>bersama AUDIRA</Big></Strip>
  </>
);

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
      <div style={{ background: "rgba(14,10,8,0.82)", borderRadius: 14, padding: "16px 30px", maxWidth: 980, textAlign: "center", boxShadow: "0 -3px 0 rgba(255,207,138,0.45), 0 10px 24px rgba(0,0,0,0.4)" }}>
        {ch.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const s = active ? 1 + 0.04 * Math.sin(clamp((t - w.start) / 0.18) * Math.PI / 2) : 1;
          return <span key={i} style={{ display: "inline-block", fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.25, color: active ? C.gold : C.cream, marginRight: i < ch.length - 1 ? "0.4em" : 0, transform: `scale(${s})` }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- director ----------
const SCENES: [number, number, React.FC<SP>, React.FC<SP>][] = [
  [T.s1, T.s2, S1, S1Text], [T.s2, T.s3, S2, S2Text], [T.s3, T.s4, S3, S3Text], [T.s4, T.s5, S4, S4Text], [T.s5, T.s6, S5, S5Text],
  [T.s6, T.s7, S6, S6Text], [T.s7, T.s8, S7, S7Text], [T.s8, T.s9, S8, S8Text], [T.s9, T.s10, S9, S9Text], [T.s10, OUTRO_AT + 0.4, S10, S10Text],
];
const XF = 0.4;

export const Taubat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const u = width / 1080;
  return (
    <AbsoluteFill style={{ background: "#05060f", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${u})`, transformOrigin: "0 0" }}>
        {SCENES.map(([a, b, S, Tx], i) => {
          if (t < a || t >= b + XF) return null;
          const fadeIn = i === 0 ? 1 : clamp((t - a) / XF);
          const lt = t - a;
          // dolly-in kontinu + orbit pan lembut (G13: medianSpeed >= 0.04; margin zoom 1.12 > radius pan)
          const dz = 1.12 + 0.014 * lt;
          const ang = lt * 0.45 + i * 1.3;
          const dx = Math.sin(ang) * 55;
          const dy = Math.cos(ang) * 55;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 900px", transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${dz.toFixed(4)})` }}>
                <S t={t} />
                <Grain />
              </div>
              <Tx t={t} />
            </div>
          );
        })}
        {t < OUTRO_AT ? (
          <div style={{ position: "absolute", left: 60, top: 180, padding: "4px 14px", borderRadius: 6, background: "rgba(10,8,6,0.72)", color: C.cream, fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: 1 }}>ILUSTRASI · MALAIKAT SEBAGAI CAHAYA</div>
        ) : null}
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT - 0.2 ? <AudiraOutro seconds={TAUBAT_SECONDS - OUTRO_AT} /> : null}
      <AudiraSignature seed="ep26-pembunuh-100-jiwa" />
    </AbsoluteFill>
  );
};
