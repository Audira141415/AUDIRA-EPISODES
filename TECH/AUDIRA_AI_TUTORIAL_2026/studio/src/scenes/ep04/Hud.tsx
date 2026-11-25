// EP04 HUD layers (HTML over the 3D desk): section headlines (top-left, y >= 262), giant step
// numbers, payoff warning cards and karaoke captions. Sizes are authored at 1080 px and scaled.
import React from "react";
import { VISUALINVESTIGATION_PALETTE as P } from "../../kits/visualinvestigation/lib/palette.ts";
import { C, SEC, TIMELINE, W, Word, clamp01, easeOut, pop, ramp, win } from "./tl.ts";

const AMBER = "#FFBE55";
const MINT = "#6effd6";
const INK = "#F3EFE6";
const ANTON = "'Anton'";
const MONO = "'IBM Plex Mono'";

// ---------- headlines ----------
type Head = { a: number; b: number; kicker: string; kColor?: string; lines: (string | [string, string])[]; size?: number; chips?: [string, number][]; step?: string };
const H: Head[] = [
  { a: C("l01").start - 0.3, b: C("l02").start - 0.05, kicker: "VIRAL DI GRUP KELUARGA", kColor: P.evidenceRed, lines: ["DITERUSKAN", ["BERKALI-KALI", AMBER]], size: 120 },
  { a: C("l02").start, b: C("l03").start - 0.05, kicker: "BARANG BUKTI A / B", lines: ["ASLI ATAU", ["AI?", P.evidenceRed]], size: 200 },
  { a: C("l03").start, b: SEC.hook[1] + 0.3, kicker: "AUDIRA AI TUTORIAL", lines: ["CEK LANGSUNG", ["PAKAI GEMINI", AMBER]], size: 118 },
  {
    a: C("l04").start,
    b: C("l05").start - 0.05,
    kicker: "TANDA AIR TAK TERLIHAT",
    kColor: MINT,
    lines: [["SYNTHID", MINT]],
    size: 170,
    chips: [["GAMBAR", W("l04", "gambar").s], ["VIDEO", W("l04", "video").s], ["AUDIO", W("l04", "audio").s]],
  },
  { a: C("l05").start, b: W("l05", "gemini").s - 0.05, kicker: "MATA MANUSIA", lines: ["TIDAK", ["TERLIHAT", P.evidenceRed]], size: 140 },
  { a: W("l05", "gemini").s, b: SEC.konteks[1] + 0.25, kicker: "GEMINI", kColor: MINT, lines: ["BISA", ["MEMBACANYA", MINT]], size: 140 },
  { a: C("l06").start, b: C("l07").start - 0.05, step: "1", kicker: "LANGKAH", lines: ["BUKA GEMINI", ["MASUK AKUN", AMBER]], size: 92 },
  { a: C("l07").start, b: C("l08").start - 0.05, step: "2", kicker: "LANGKAH", lines: ["UNGGAH FOTO,", ["VIDEO / AUDIO", AMBER]], size: 92 },
  { a: C("l08").start, b: C("l09").start - 0.05, step: "3", kicker: "LANGKAH", lines: ["TANYA", ["LANGSUNG", AMBER]], size: 92 },
  { a: C("l09").start, b: W("l11", "kedua").s + 0.4, kicker: "GEMINI MEMERIKSA", kColor: MINT, lines: ["2 HAL", ["SEKALIGUS", MINT]], size: 120 },
  { a: W("l11", "kedua").s + 0.5, b: SEC.langkah[1] + 0.25, kicker: "PEMERIKSAAN 2", lines: ["CONTENT", ["CREDENTIALS", AMBER]], size: 120 },
  { a: C("l12").start, b: C("l12").end + 0.2, kicker: "HASIL · SYNTHID DITEMUKAN", kColor: P.evidenceRed, lines: ["DIBUAT/DIEDIT", ["AI GOOGLE", P.evidenceRed]], size: 118 },
  { a: C("l13").start, b: C("l13").end + 0.2, kicker: "HASIL · VIDEO", lines: ["BAGIAN MANA", ["TERDETEKSI", AMBER]], size: 112 },
  { a: C("l14").start, b: C("l14").end + 0.2, kicker: "HASIL · CONTENT CREDENTIALS", lines: ["ISI · RIWAYAT", ["ALAT AI", AMBER]], size: 112 },
  { a: C("l15").start, b: SEC.penjelasan[1] + 0.25, kicker: "HASIL · METADATA FOTO", lines: ["MODEL KAMERA", ["& TANGGAL", AMBER]], size: 104 },
  { a: C("l16").start, b: C("l17").start - 0.05, kicker: "HATI-HATI", kColor: P.evidenceRed, lines: ["SYNTHID", ["TIDAK DITEMUKAN", P.evidenceRed]], size: 104 },
  { a: C("l21").start, b: C("l22").start - 0.05, kicker: "TOLONG BAGIKAN", lines: ["VIDEONYA,", ["BUKAN HOAKSNYA", P.evidenceRed]], size: 118 },
  { a: C("l23").start - 0.3, b: SEC.outro[1] + 0.25, kicker: "AUDIRA AI TUTORIAL", lines: ["INI", ["AUDIRA", AMBER]], size: 150 },
];

const Headline: React.FC<{ h: Head; t: number; k: number }> = ({ h, t, k }) => {
  const a = win(t, h.a, h.b, 0.3, 0.2);
  if (a <= 0) return null;
  const inK = easeOut(ramp(t, h.a, h.a + 0.45));
  const size = (h.size ?? 120) * k;
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 64 * k, top: 262 * k, opacity: a, display: "flex", gap: 26 * k, alignItems: "flex-start" }}>
      {h.step && (
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 210 * k,
            lineHeight: 0.82,
            color: "#1D1D1B",
            background: AMBER,
            padding: `${18 * k}px ${30 * k}px ${8 * k}px`,
            transform: `scale(${pop(ramp(t, h.a, h.a + 0.4))}) rotate(-3deg)`,
            boxShadow: `0 ${14 * k}px ${40 * k}px rgba(0,0,0,0.55)`,
          }}
        >
          {h.step}
        </div>
      )}
      <div style={{ transform: `translateY(${(1 - inK) * 40 * k}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * k, fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, letterSpacing: 6 * k, color: h.kColor ?? AMBER }}>
          <span style={{ width: 16 * k, height: 16 * k, background: h.kColor ?? P.evidenceRed, display: "inline-block" }} />
          {h.kicker}
        </div>
        <div style={{ fontFamily: ANTON, fontSize: size, lineHeight: 0.98, color: INK, marginTop: 12 * k, textShadow: `0 ${6 * k}px ${30 * k}px rgba(0,0,0,0.7)` }}>
          {h.lines.map((l, i) => {
            const li = easeOut(ramp(t, h.a + 0.08 * i, h.a + 0.08 * i + 0.4));
            const [txt, col] = typeof l === "string" ? [l, INK] : l;
            return (
              <div key={i} style={{ color: col, opacity: li, transform: `translateX(${(1 - li) * -30 * k}px)` }}>
                {txt}
              </div>
            );
          })}
        </div>
        {h.chips && (
          <div style={{ display: "flex", gap: 14 * k, marginTop: 22 * k }}>
            {h.chips.map(([c, at]) => {
              const ck = ramp(t, at - 0.05, at + 0.25);
              return (
                <span
                  key={c}
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 36 * k,
                    letterSpacing: 3 * k,
                    color: "#0B0C0E",
                    background: MINT,
                    padding: `${8 * k}px ${18 * k}px`,
                    opacity: ck,
                    transform: `scale(${ck > 0 ? pop(ck) : 0})`,
                  }}
                >
                  {c}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- payoff warning cards ----------
type Card = { a: number; head: string; body: React.ReactNode };
const tick = (t: number, at: number, k: number) => {
  const p = ramp(t, at - 0.05, at + 0.3);
  return (
    <span
      style={{
        display: "inline-flex",
        width: 64 * k,
        height: 64 * k,
        border: `${6 * k}px solid #1D1D1B`,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 22 * k,
        flex: "none",
        background: p > 0 ? "#10B981" : "transparent",
      }}
    >
      <span style={{ fontFamily: ANTON, fontSize: 52 * k, color: "#fff", transform: `scale(${p > 0 ? pop(p) : 0})`, lineHeight: 1 }}>✓</span>
    </span>
  );
};

const Cards: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t < C("l17").start - 0.2 || t > SEC.payoff[1] + 0.4) return null;
  const big = (s: string, col = "#1D1D1B", fs = 92) => <div style={{ fontFamily: ANTON, fontSize: fs * k, lineHeight: 1.02, color: col }}>{s}</div>;
  const row = (at: number, s: string) => (
    <div style={{ display: "flex", alignItems: "center", marginTop: 26 * k, fontFamily: ANTON, fontSize: 62 * k, lineHeight: 1.05, color: "#1D1D1B" }}>
      {tick(t, at, k)}
      {s}
    </div>
  );
  const cards: Card[] = [
    {
      a: C("l17").start,
      head: "PERINGATAN 1 · BATASAN",
      body: (
        <>
          {big("GEMINI HANYA MENGENALI")}
          {big("KONTEN BUATAN AI GOOGLE", P.evidenceRed)}
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 32 * k, marginTop: 18 * k, color: "#3a3a36" }}>untuk saat ini</div>
        </>
      ),
    },
    {
      a: C("l18").start,
      head: "PERINGATAN 2 · JANGAN SALAH SIMPUL",
      body: (
        <>
          {big("TIDAK ADA SYNTHID", "#1D1D1B", 104)}
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 * k }}>
            {big("≠", P.evidenceRed, 190)}
            {big("ASLI", P.evidenceRed, 190)}
          </div>
        </>
      ),
    },
    {
      a: C("l19").start,
      head: "PERINGATAN 3 · BISA SAJA",
      body: (
        <>
          {big("DIBUAT AI LAIN", "#1D1D1B", 96)}
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40 * k, margin: `${10 * k}px 0`, color: P.evidenceRed }}>ATAU</div>
          {big("EDITANNYA TERLALU KECIL", "#1D1D1B", 80)}
          {big("UNTUK TERDETEKSI", "#1D1D1B", 80)}
        </>
      ),
    },
    {
      a: C("l20").start,
      head: "SEBELUM MEMBAGIKAN",
      body: (
        <>
          {row(W("l20", "cek").s, "CEK SUMBERNYA")}
          {row(W("l20", "cari").s, "CARI MEDIA TERPERCAYA")}
          {row(W("l20", "jangan").s, "JANGAN BURU-BURU BAGIKAN")}
        </>
      ),
    },
  ];
  const dim = 1 - ramp(t, SEC.payoff[1] + 0.1, SEC.payoff[1] + 0.4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: dim }}>
      {cards.map((c, i) => {
        if (t < c.a - 0.05) return null;
        const next = cards[i + 1];
        const inK = ramp(t, c.a - 0.05, c.a + 0.3);
        const out = next ? ramp(t, next.a - 0.05, next.a + 0.3) : 0;
        if (out >= 1) return null;
        const slam = pop(inK);
        const rot = [-2.2, 1.6, -1.2, 0.8][i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 60 * k,
              right: 60 * k,
              top: 560 * k,
              background: P.archivalPaper,
              borderTop: `${70 * k}px solid ${i === 1 ? P.evidenceRed : "#1D1D1B"}`,
              boxShadow: `0 ${30 * k}px ${80 * k}px rgba(0,0,0,0.7)`,
              padding: `${36 * k}px ${44 * k}px ${44 * k}px`,
              transform: `translateY(${(1 - easeOut(inK)) * 120 * k - out * 260 * k}px) scale(${(2 - slam) * (1 - out * 0.12)}) rotate(${rot + out * -6}deg)`,
              opacity: clamp01(inK * 3) * (1 - out),
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -56 * k,
                left: 44 * k,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 30 * k,
                letterSpacing: 4 * k,
                color: i === 1 ? "#FFF6EE" : AMBER,
              }}
            >
              ⚠ {c.head}
            </div>
            {c.body}
          </div>
        );
      })}
    </div>
  );
};

// ---------- next-episode tag ----------
const NextTag: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = win(t, C("l22").start, C("l22").end + 0.3, 0.3, 0.3);
  if (a <= 0) return null;
  const s = pop(ramp(t, C("l22").start, C("l22").start + 0.45));
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 64 * k, top: 300 * k, opacity: a, transform: `scale(${s}) rotate(-1.5deg)`, transformOrigin: "left top" }}>
      <div style={{ background: "#1D1D1B", color: AMBER, fontFamily: MONO, fontWeight: 700, fontSize: 32 * k, letterSpacing: 5 * k, padding: `${14 * k}px ${28 * k}px`, display: "inline-block" }}>
        EPISODE TERAKHIR · EP05
      </div>
      <div style={{ background: P.archivalPaper, padding: `${28 * k}px ${32 * k}px`, boxShadow: `0 ${24 * k}px ${60 * k}px rgba(0,0,0,0.6)` }}>
        <div style={{ fontFamily: ANTON, fontSize: 104 * k, lineHeight: 1, color: "#1D1D1B" }}>BELAJAR PAKAI AI</div>
        <div style={{ fontFamily: ANTON, fontSize: 104 * k, lineHeight: 1, color: P.evidenceRed }}>TANPA NYONTEK</div>
      </div>
    </div>
  );
};

// ---------- karaoke captions ----------
type Phrase = { words: Word[]; lines: number[]; s: number; e: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const clip of TIMELINE.clips) {
    const ws = clip.words;
    const n = ws.length;
    const p = Math.ceil(n / 7);
    const base = Math.floor(n / p), extra = n % p;
    let i = 0;
    for (let j = 0; j < p; j++) {
      const size = base + (j < extra ? 1 : 0);
      const words = ws.slice(i, i + size);
      i += size;
      const lines = size <= 4 ? [size] : [Math.ceil(size / 2), Math.floor(size / 2)];
      out.push({ words, lines, s: words[0].s, e: words[words.length - 1].e });
    }
  }
  for (let i = 0; i < out.length; i++) out[i].e = Math.min(out[i].e + 0.35, out[i + 1] ? out[i + 1].s : Infinity);
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const ph = PHRASES.find((p) => t >= p.s - 0.08 && t < p.e);
  if (!ph) return null;
  const lines: Word[][] = [];
  let i = 0;
  for (const n of ph.lines) {
    lines.push(ph.words.slice(i, i + n));
    i += n;
  }
  const maxChars = Math.max(...lines.map((l) => l.map((w) => w.w).join(" ").length));
  const fs = Math.min(58, (58 * 24) / Math.max(24, maxChars)) * k;
  const inK = easeOut(ramp(t, ph.s - 0.08, ph.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, bottom: 400 * k, display: "flex", justifyContent: "center", opacity: inK, transform: `translateY(${(1 - inK) * 16 * k}px)` }}>
      <div
        style={{
          background: "rgba(14,15,18,0.86)",
          borderLeft: `${10 * k}px solid ${P.evidenceRed}`,
          padding: `${14 * k}px ${28 * k}px ${16 * k}px`,
          boxShadow: `0 ${12 * k}px ${40 * k}px rgba(0,0,0,0.5)`,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: fs, lineHeight: 1.32, whiteSpace: "nowrap" }}>
            {ln.map((w, wi) => {
              const active = t >= w.s - 0.03 && t < w.e + 0.05;
              const said = t >= w.s - 0.03;
              const b = active ? Math.sin(clamp01((t - w.s + 0.03) / 0.18) * Math.PI) : 0;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    marginRight: wi < ln.length - 1 ? fs * 0.55 : 0,
                    color: active ? "#0B0C0E" : said ? INK : "rgba(243,239,230,0.55)",
                    background: active ? AMBER : "transparent",
                    padding: `0 ${6 * k}px`,
                    transform: `translateY(${-b * 7 * k}px) scale(${1 + b * 0.06})`,
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Hud: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  // dark scrims for legibility: top behind headlines, stronger during the payoff cards
  const cardDim = win(t, C("l17").start - 0.2, SEC.payoff[1] + 0.4, 0.4, 0.4);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,12,14,0.86) 0%, rgba(11,12,14,0.55) 22%, rgba(11,12,14,0) 36%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(11,12,14,0.6) 0%, rgba(11,12,14,0) 32%)" }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(8,9,11,${0.55 * cardDim})` }} />
      {H.map((h, i) => (
        <Headline key={i} h={h} t={t} k={k} />
      ))}
      <Cards t={t} k={k} />
      <NextTag t={t} k={k} />
      <Captions t={t} k={k} />
    </>
  );
};
