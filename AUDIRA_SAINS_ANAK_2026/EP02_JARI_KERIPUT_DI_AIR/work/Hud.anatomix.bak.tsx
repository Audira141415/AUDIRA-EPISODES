// EP02 Jari Keriput — kinetic HUD callouts (layout px 1080 × 1920). Every number, year and name in the VO
// gets a card in the top/centre band; captions stay at y ≈ 1300; the bottom 380 px stay clear.
import React from "react";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { FONT } from "../../core/type/fonts";
import { clamp, seg } from "./timing";

type Card = {
  at: number;
  until: number;
  kicker?: string;
  text: string;
  sub?: string;
  color?: string;
  y: number;
  big?: boolean;
  stamp?: boolean;
  x?: "left" | "right" | "center";
};

const RED = "#FF5A5F";
const AMBER = "#FFB23F";

export const CARDS: Card[] = [
  // S1 hook
  { at: 0.5, until: 3.35, kicker: "KENAPA?", text: "JARI KERIPUT", sub: "setelah lama berendam", y: 250, big: true },
  { at: 3.42, until: 6.0, kicker: "BUKAN KARENA", text: "AIR MASUK ✕", color: RED, y: 300, big: true },
  { at: 6.0, until: 9.2, kicker: "TAPI", text: "PERINTAH SARAF ⚡", color: AMBER, y: 300, big: true },
  // S2 myth
  { at: 9.4, until: 13.9, kicker: "ANGGAPAN LAMA", text: "KULIT = SPONS?", sub: "menyerap air lalu mengembang", y: 260 },
  { at: 13.95, until: 16.4, text: "MITOS", color: RED, y: 420, big: true, stamp: true },
  // S3 1935
  { at: 16.6, until: 31.2, kicker: "TAHUN", text: "1935", sub: "Lewis & Pickering", y: 250, big: true, x: "left" },
  { at: 17.9, until: 19.45, kicker: "SARAF UTUH", text: "KERIPUT", color: AMBER, y: 1000, x: "left" },
  { at: 18.1, until: 19.45, kicker: "SARAF PUTUS", text: "MULUS", color: RED, y: 1000, x: "right" },
  { at: 22.65, until: 28.4, kicker: "SARAF RUSAK", text: "TIDAK KERIPUT", color: RED, y: 560, x: "right" },
  { at: 28.45, until: 31.3, kicker: "ARTINYA", text: "KERIPUT = KERJA SARAF", color: AMBER, y: 560 },
  // S4 mechanism
  { at: 31.4, until: 42.1, kicker: "LANGKAH 1", text: "Saraf simpatik memberi sinyal", color: AMBER, y: 250 },
  { at: 34.0, until: 42.1, kicker: "LANGKAH 2", text: "Pembuluh darah menyempit", color: RED, y: 400 },
  { at: 37.9, until: 42.1, kicker: "LANGKAH 3", text: "Bantalan jari mengempis", color: "#F2C878", y: 550 },
  { at: 40.0, until: 42.1, kicker: "LANGKAH 4", text: "Kulit tertarik & melipat", color: P.holo, y: 700 },
  // S5 time & place
  { at: 42.4, until: 54.9, kicker: "AIR HANGAT", text: "± 3–5 MENIT", y: 250, big: true },
  { at: 46.36, until: 54.9, kicker: "AIR ASIN", text: "LEBIH LAMBAT", color: AMBER, y: 470, x: "left" },
  { at: 49.0, until: 54.9, kicker: "HANYA KULIT TANPA RAMBUT", text: "jari · telapak tangan · telapak kaki", color: P.holo, y: 620 },
  // S6 function
  { at: 55.0, until: 57.0, kicker: "LALU", text: "UNTUK APA?", y: 280, big: true },
  { at: 57.0, until: 62.0, kicker: "DIDUGA", text: "seperti alur ban saat hujan", sub: "membuang air → pegangan tidak licin", color: AMBER, y: 260 },
  { at: 62.1, until: 70.8, kicker: "UJI 2013 · kelereng basah", text: "+12% LEBIH CEPAT", color: P.holo, y: 250, x: "left" },
  { at: 66.35, until: 70.8, kicker: "STUDI 2014", text: "EFEK TIDAK DITEMUKAN", color: RED, y: 440, x: "right" },
  { at: 69.44, until: 70.8, text: "MASIH DIPERDEBATKAN", color: AMBER, y: 640, stamp: true },
  // S7 pattern + doctors
  { at: 71.0, until: 77.8, kicker: "BINGHAMTON · 2025", text: "POLA SAMA, TEMPAT SAMA", sub: "setiap kali jari keriput", y: 250 },
  { at: 77.85, until: 79.4, kicker: "DOKTER", text: "TES KERIPUT = CEK SARAF", color: AMBER, y: 470 },
  // S8 outro
  { at: 79.6, until: 85.0, kicker: "JADI", text: "KERIPUT = SARAFMU BEKERJA", color: P.holo, y: 260, big: true },
  { at: 82.2, until: 85.0, text: "Coba sendiri di air hangat", color: AMBER, y: 520 },
];

const CardView: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const inK = seg(t, c.at, c.at + 0.28);
  const outK = seg(t, c.until - 0.22, c.until);
  const vis = inK * (1 - outK);
  if (vis <= 0.001) return null;
  const pop = c.stamp ? 1.6 - 0.6 * inK : 0.86 + 0.14 * inK + 0.03 * Math.sin(clamp((t - c.at) / 0.4) * Math.PI);
  const color = c.color ?? P.holo;
  const align = c.x ?? "center";
  const left = align === "left" ? 60 : align === "right" ? undefined : 60;
  const right = align === "right" ? 60 : align === "left" ? undefined : 60;
  const slide = (1 - inK) * (align === "right" ? 80 : align === "left" ? -80 : 0);
  return (
    <div
      style={{
        position: "absolute",
        top: c.y + 60,
        left,
        right,
        display: "flex",
        justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        opacity: vis,
        transform: `translateX(${slide}px) scale(${pop}) rotate(${c.stamp ? -6 : 0}deg)`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          background: c.stamp ? "rgba(20,4,6,0.55)" : "rgba(3,20,26,0.78)",
          border: `${c.stamp ? 8 : 3}px solid ${color}`,
          borderRadius: c.stamp ? 14 : 22,
          padding: c.big ? "18px 34px 22px" : "14px 28px 18px",
          boxShadow: `0 0 36px ${color}55, 0 12px 30px rgba(0,0,0,0.5)`,
          maxWidth: 960,
          textAlign: align === "right" ? "right" : align === "left" ? "left" : "center",
        }}
      >
        {c.kicker ? <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 800, letterSpacing: 4, color, opacity: 0.95 }}>{c.kicker}</div> : null}
        <div
          style={{
            fontFamily: FONT,
            fontSize: c.stamp ? 104 : c.big ? 84 : 58,
            fontWeight: 900,
            lineHeight: 1.05,
            color: c.stamp ? color : "#F2FFFD",
            letterSpacing: c.stamp ? 8 : 0,
            textShadow: "0 4px 18px rgba(0,0,0,0.55)",
          }}
        >
          {c.text}
        </div>
        {c.sub ? <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 600, color: "rgba(230,251,248,0.82)", marginTop: 6 }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

/** Running timer for "3–5 menit" (S5): counts 0 → 5 min over the beat. */
const Timer: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, 42.6, 45.6);
  const out = seg(t, 54.6, 54.9);
  if (k <= 0 || out >= 1) return null;
  const min = 5 * k;
  const ang = k * 360;
  return (
    <div style={{ position: "absolute", top: 470, right: 70, width: 220, height: 220, opacity: (1 - out) * seg(t, 42.6, 42.9) }}>
      <svg width={220} height={220} viewBox="0 0 220 220">
        <circle cx={110} cy={110} r={96} stroke="rgba(63,224,208,0.25)" strokeWidth={14} fill="rgba(3,20,26,0.75)" />
        <circle
          cx={110}
          cy={110}
          r={96}
          stroke={P.holo}
          strokeWidth={14}
          fill="none"
          strokeDasharray={`${(ang / 360) * 603} 603`}
          transform="rotate(-90 110 110)"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#F2FFFD" }}>
        <div style={{ fontSize: 64, fontWeight: 900 }}>{min.toFixed(1)}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: P.holo }}>MENIT</div>
      </div>
    </div>
  );
};

export const Hud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {CARDS.map((c, i) => (
      <CardView key={i} c={c} t={t} />
    ))}
    <Timer t={t} />
  </div>
);
