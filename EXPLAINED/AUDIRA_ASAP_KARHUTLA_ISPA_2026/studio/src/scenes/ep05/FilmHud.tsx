// EP05 film — 2D layer (laid out at 1080×1920, Stage3D scales it). Map-documentary HUD: kicker +
// two-line headline per beat (top, y ≥ 262), data panels under it, name cards above the captions,
// karaoke captions on a paper strip (top ≈ 1300, nothing in the bottom 380 px).
import React from "react";
import { FONT } from "../../core/type/fonts.ts";
import { CLIPS, OUTRO_CARD, SEC, T, TOTAL, Word, backOut, seg, win } from "./time.ts";

const C = {
  cream: "#f4ead2",
  ink: "#2c241d",
  orange: "#f08a4b",
  red: "#9b2226",
  green: "#2f6b4f",
  shade: "rgba(14,11,9,0.9)",
};
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ---------------------------------------------------------------- headlines
type Head = { a: number; b: number; kicker: string; l1: string | ((t: number) => string); l2?: string | ((t: number) => string); big?: boolean; l2At?: number };
const HEADS: Head[] = [
  { a: -1, b: T.padahal - 0.05, kicker: "PEKANBARU · RIAU", l1: "56 HARI", l2: "TERTUTUP ASAP", big: true },
  { a: T.padahal - 0.05, b: T.bmkg - 0.1, kicker: "PADAHAL", l1: "SUMBER APINYA", l2: "BUKAN DI RIAU" },
  { a: T.bmkg - 0.1, b: T.terbawa - 0.05, kicker: "BMKG · ASAP KIRIMAN", l1: "DARI SUMSEL,", l2: "JAMBI, BENGKULU" },
  { a: T.terbawa - 0.05, b: T.pada18 - 0.05, kicker: "ARAH ANGIN", l1: "TERBAWA KE", l2: "BARAT LAUT" },
  { a: T.pada18 - 0.05, b: T.tapi - 0.05, kicker: "18 OKTOBER · PAGI", l1: "RIAU", l2: "0 TITIK PANAS", l2At: T.nol - 0.1 },
  { a: T.tapi - 0.05, b: T.dinkes - 0.1, kicker: "18 OKTOBER · PAGI", l1: "PEKANBARU", l2: "TETAP BERASAP" },
  {
    a: T.dinkes - 0.1, b: T.bergerak - 0.05, kicker: "DINKES PEKANBARU · 24 AGU–18 OKT", big: true,
    l1: (t) => fmt(13850 * seg(t, T.dinkes + 0.3, T.n14 + 0.3)), l2: "WARGA KENA ISPA",
  },
  { a: T.bergerak - 0.05, b: T.batam - 0.05, kicker: "LINTAS PROVINSI", l1: "ASAPNYA", l2: "TERUS BERGERAK" },
  {
    a: T.batam - 0.05, b: T.lalu - 0.05, kicker: "BATAM · KEPULAUAN RIAU", big: true,
    l1: (t) => `ISPU ${Math.round(240 * seg(t, T.ispu, T.n240 + 0.35))}`, l2: "SANGAT TIDAK SEHAT", l2At: T.sangat - 0.1,
  },
  { a: T.lalu - 0.05, b: T.sekolah - 0.05, kicker: "DARI SUMATRA & KALIMANTAN", l1: "MENYEBERANG", l2: "KE MALAYSIA", l2At: T.menyeberang },
  { a: T.sekolah - 0.05, b: T.kasus - 0.05, kicker: "JOHOR · MALAYSIA", l1: "SEKOLAH", l2: "DITUTUP", l2At: T.johor },
  { a: T.kasus - 0.05, b: T.kepada - 0.05, kicker: "KASUS ISPA DI MALAYSIA", l1: "+10%", l2: "DALAM SEPEKAN", big: true },
  { a: T.kepada - 0.05, b: SEC.PENGEMBANGAN[1], kicker: "KEPADA BBC", l1: "TETAP SULIT", l2: "BERNAPAS" },
  { a: SEC.PENJELASAN[0], b: T.myBawa - 0.05, kicker: "PERJANJIAN ASEAN", l1: "ASAP LINTAS", l2: "BATAS", l2At: T.perjanjian + 0.6 },
  { a: T.myBawa - 0.05, b: T.kemlu - 0.05, kicker: "MALAYSIA", l1: "BAWA KE MENLU", l2: "ASEAN", l2At: T.menteri },
  { a: T.kemlu - 0.05, b: T.diTengah - 0.05, kicker: "KEMLU RI", l1: "INDONESIA", l2: "BERKOMITMEN", l2At: T.komit - 0.4 },
  { a: T.diTengah - 0.05, b: T.sindiran - 0.15, kicker: "PERNYATAAN PEJABAT", l1: "“MENGIRIM", l2: "OKSIGEN”", l2At: T.oksigen - 0.2 },
  { a: T.sindiran - 0.15, b: SEC.PENJELASAN[1], kicker: "REAKSI", l1: "SINDIRAN WARGANET", l2: "MALAYSIA" },
  { a: SEC.PAYOFF[0], b: T.empat - 0.05, kicker: "DI DALAM NEGERI · BARESKRIM", big: true, l1: (t) => (t < T.n20 - 0.1 ? "—" : "20"), l2: "KORPORASI TERSANGKA" },
  { a: T.empat - 0.05, b: T.nama - 0.05, kicker: "DARI 20 TERSANGKA", big: true, l1: "4", l2: "BERMODAL ASING" },
  { a: T.nama - 0.05, b: T.walhi - 0.05, kicker: "IDENTITAS", l1: "NAMA LENGKAP", l2: "BELUM DIBUKA" },
  { a: T.walhi - 0.05, b: SEC.PAYOFF[1] + 0.1, kicker: "WALHI MENGINGATKAN", l1: "ISU ASING JANGAN", l2: "JADI ALASAN", l2At: T.isu + 0.3 },
  { a: SEC.OUTRO[0], b: OUTRO_CARD, kicker: "AUDIRA · ASAP & ISPA", l1: "ASAP TIDAK KENAL", l2: "BATAS NEGARA", l2At: T.batasO - 0.3 },
];

const Headline: React.FC<{ t: number }> = ({ t }) => {
  const h = HEADS.find((x) => t >= x.a && t < x.b);
  if (!h) return null;
  const inn = seg(t, h.a, h.a + 0.28);
  const out = 1 - seg(t, h.b - 0.18, h.b);
  const o = Math.min(inn, out);
  const l1 = typeof h.l1 === "function" ? h.l1(t) : h.l1;
  const l2 = h.l2 ? (typeof h.l2 === "function" ? h.l2(t) : h.l2) : "";
  const l2o = h.l2At !== undefined ? seg(t, h.l2At, h.l2At + 0.25) : inn;
  const size1 = h.big ? 150 : 96;
  return (
    <div style={{ position: "absolute", left: 66, top: 262, width: 950, opacity: o }}>
      <div style={{ color: C.orange, fontSize: 30, fontWeight: 700, letterSpacing: 6, transform: `translateX(${(1 - inn) * -30}px)` }}>{h.kicker}</div>
      <div
        style={{
          marginTop: 8, color: h.big ? C.orange : C.cream, fontSize: size1, fontWeight: 700, lineHeight: 1.0, letterSpacing: 1,
          textShadow: "0 6px 26px rgba(0,0,0,0.65)", transform: `translateX(${(1 - inn) * -50}px)`, fontVariantNumeric: "tabular-nums",
        }}
      >
        {l1}
      </div>
      {l2 ? (
        <div
          style={{
            marginTop: h.big ? 4 : 6, color: C.cream, fontSize: h.big ? 64 : 96, fontWeight: 700, lineHeight: 1.0, letterSpacing: 1,
            textShadow: "0 6px 26px rgba(0,0,0,0.65)", opacity: l2o, transform: `translateY(${(1 - l2o) * 18}px)`,
          }}
        >
          {l2}
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- data panels
const Panel: React.FC<{ o: number; top: number; children: React.ReactNode; width?: number }> = ({ o, top, children, width = 760 }) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute", left: 66, top, width, padding: "20px 26px", background: "rgba(244,234,210,0.95)", borderRadius: 14,
        borderLeft: `10px solid ${C.red}`, boxShadow: "0 14px 40px rgba(0,0,0,0.45)", color: C.ink, opacity: o,
        transform: `translateY(${(1 - o) * 24}px)`, fontFamily: FONT,
      }}
    >
      {children}
    </div>
  );

const ISPU_BANDS = [
  { to: 50, w: 50, c: "#2e7d32", n: "BAIK" },
  { to: 100, w: 50, c: "#1565c0", n: "SEDANG" },
  { to: 200, w: 100, c: "#f2b705", n: "TIDAK SEHAT" },
  { to: 300, w: 100, c: "#c62828", n: "SANGAT TIDAK SEHAT" },
  { to: 350, w: 50, c: "#1d1d1d", n: "BERBAHAYA" },
];
const IspuMeter: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.ispu - 0.2, T.lalu - 0.05, 0.3, 0.2);
  const v = 240 * seg(t, T.ispu, T.n240 + 0.35);
  const W = 860;
  const x = (v / 350) * W;
  const lab = seg(t, T.sangat - 0.1, T.sangat + 0.2);
  return (
    <Panel o={o} top={1070} width={912}>
      <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>INDEKS STANDAR PENCEMAR UDARA (ISPU)</div>
      <div style={{ position: "relative", height: 46, display: "flex", borderRadius: 8, overflow: "hidden" }}>
        {ISPU_BANDS.map((b) => (
          <div key={b.n} style={{ width: (b.w / 350) * W, background: b.c, opacity: v >= b.to - b.w ? 1 : 0.35 }} />
        ))}
      </div>
      <div style={{ position: "relative", height: 30 }}>
        <div style={{ position: "absolute", left: x - 14, top: -4, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: `22px solid ${C.ink}` }} />
      </div>
      <div style={{ position: "relative", height: 36, fontSize: 27, fontWeight: 700, color: C.red, opacity: lab }}>
        <div style={{ position: "absolute", left: (200 / 350) * W, width: (100 / 350) * W + 120, marginLeft: -60, textAlign: "center" }}>SANGAT TIDAK SEHAT</div>
      </div>
    </Panel>
  );
};

const IspaBars: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.kasus, T.kepada - 0.05, 0.3, 0.2);
  const g = seg(t, T.naik - 0.2, T.sepuluh + 0.3);
  // relative bars only (VO: "naik sekitar sepuluh persen dalam sepekan"); no weekly counts on screen
  const rows = [
    { n: "Pekan sebelumnya", v: 1 },
    { n: "Sepekan kemudian", v: 1.1 },
  ];
  return (
    <Panel o={o} top={1070} width={912}>
      <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>KASUS ISPA DI MALAYSIA</div>
      {rows.map((r, i) => {
        const k = i === 0 ? seg(t, T.kasus + 0.1, T.kasus + 0.7) : g;
        return (
          <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
            <div style={{ width: 260, fontSize: 28, fontWeight: 600 }}>{r.n}</div>
            <div style={{ height: 38, width: (r.v / 1.1) * 440 * k, background: i ? C.red : "#8a7d6c", borderRadius: 6 }} />
            {i ? <div style={{ fontSize: 32, fontWeight: 700, opacity: k, color: C.red }}>+10%</div> : null}
          </div>
        );
      })}
      <div style={{ fontSize: 26, color: "rgba(44,36,29,0.75)", marginTop: 4 }}>Kemenkes Malaysia, dikutip BBC</div>
    </Panel>
  );
};

const CountryChips: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.sg - 0.6, T.nama - 0.05, 0.3, 0.2);
  if (o <= 0.01) return null;
  const items: [string, number][] = [["SINGAPURA", T.sg], ["MALAYSIA", T.my], ["KOREA SELATAN", T.kor]];
  return (
    <div style={{ position: "absolute", left: 66, top: 590, opacity: o }}>
      <div style={{ color: C.cream, fontSize: 26, fontWeight: 600, letterSpacing: 3, marginBottom: 14 }}>ASAL MODAL</div>
      <div style={{ display: "flex", gap: 18 }}>
        {items.map(([n, a]) => {
          const s = backOut(seg(t, a - 0.1, a + 0.25));
          return (
            <div
              key={n}
              style={{
                padding: "12px 22px", background: C.cream, color: C.ink, borderRadius: 10, fontSize: 32, fontWeight: 700, letterSpacing: 2,
                borderBottom: `6px solid ${C.red}`, transform: `scale(${Math.max(0.01, s)})`, opacity: Math.min(1, s * 2),
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Chip: React.FC<{ o: number; top: number; text: string; color?: string; left?: number }> = ({ o, top, text, color = C.red, left = 66 }) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute", left, top, padding: "12px 22px", background: color, color: "#fff6e6", borderRadius: 10, fontSize: 30, fontWeight: 700,
        letterSpacing: 2, opacity: o, transform: `scale(${0.9 + 0.1 * backOut(o)})`, transformOrigin: "0 50%", boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
      }}
    >
      {text}
    </div>
  );

// ---------------------------------------------------------------- people (generic figures)
const Figure: React.FC<{ mic?: boolean; size?: number }> = ({ mic = false, size = 118 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="58" fill="#3a2f26" />
    <circle cx="60" cy="46" r="20" fill="#c9b48e" />
    <path d="M22 108 C26 80 42 70 60 70 C78 70 94 80 98 108 Z" fill="#c9b48e" />
    {mic ? (
      <g>
        <rect x="80" y="58" width="12" height="22" rx="6" fill="#f08a4b" />
        <rect x="84" y="80" width="4" height="16" fill="#f08a4b" />
      </g>
    ) : null}
  </svg>
);

type Person = { a: number; b: number; name: string; role: string; mic?: boolean };
const PEOPLE: Person[] = [
  { a: T.dinkes - 0.1, b: SEC.KONTEKS[1] + 0.1, name: "Hazli Fendriyanto", role: "Kepala Dinas Kesehatan Pekanbaru", mic: true },
  { a: T.nor - 0.15, b: SEC.PENGEMBANGAN[1], name: "Nor Amira", role: "Warga Malaysia, pengidap asma (ilustrasi)" },
  { a: T.pejabat - 0.4, b: T.sindiran - 0.15, name: "Syahganda Nainggolan", role: "Kepala Bakom (pernyataan “mengirim oksigen”)", mic: true },
  { a: T.bareskrim - 0.1, b: T.nama - 0.05, name: "Komjen Asep Safrudin", role: "Kepala Bareskrim Polri", mic: true },
  { a: T.walhi - 0.1, b: SEC.PAYOFF[1] + 0.1, name: "Uli Artha Siagian", role: "Walhi", mic: true },
];
const NameCard: React.FC<{ t: number }> = ({ t }) => {
  const p = PEOPLE.find((x) => t >= x.a && t < x.b);
  if (!p) return null;
  const o = win(t, p.a, p.b, 0.3, 0.25);
  return (
    <div
      style={{
        position: "absolute", left: 66, top: 1096, display: "flex", alignItems: "center", gap: 22, padding: "16px 30px 16px 16px",
        background: "rgba(20,16,12,0.9)", borderRadius: 18, borderLeft: `8px solid ${C.orange}`, boxShadow: "0 14px 36px rgba(0,0,0,0.5)",
        opacity: o, transform: `translateX(${(1 - o) * -60}px)`, maxWidth: 950,
      }}
    >
      <Figure mic={p.mic} />
      <div>
        <div style={{ color: C.cream, fontSize: 44, fontWeight: 700, letterSpacing: 0.5 }}>{p.name}</div>
        <div style={{ color: "#d9cdb4", fontSize: 27, fontWeight: 500, marginTop: 4 }}>{p.role}</div>
      </div>
    </div>
  );
};

// paraphrase cards (no quotation marks: the script reports them indirectly)
const Para: React.FC<{ o: number; label: string; text: string }> = ({ o, label, text }) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute", left: 66, top: 880, width: 900, padding: "22px 30px", background: "rgba(244,234,210,0.96)", borderRadius: 16,
        borderTop: `8px solid ${C.red}`, color: C.ink, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, color: C.red }}>{label}</div>
      <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.25, marginTop: 8 }}>{text}</div>
    </div>
  );

const Ilustrasi: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.sekolah - 0.3, SEC.PENGEMBANGAN[1], 0.3, 0.3);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", right: 60, top: 262, padding: "8px 16px", border: `3px solid ${C.cream}`, borderRadius: 8, color: C.cream, fontSize: 26, fontWeight: 700, letterSpacing: 4, opacity: o * 0.9, background: "rgba(14,11,9,0.55)" }}>
      ILUSTRASI
    </div>
  );
};

// ---------------------------------------------------------------- karaoke captions (paper strip)
type Chunk = { words: Word[]; a: number; b: number };
const isNum = (w: string) => /^[0-9]/.test(w);
// no break between i-1 and i when either side is a number, or before a number's unit word
const canBreak = (ws: Word[], i: number) => !(isNum(ws[i - 1]?.w ?? "") || isNum(ws[i]?.w ?? "") || ws[i - 1]?.w === "ISPU");
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    // sentences first, then ≤6-word balanced pieces with at least 2 words each
    const sentences: Word[][] = [];
    let cur: Word[] = [];
    c.words.forEach((w) => {
      cur.push(w);
      if (/[.:]["”]?$/.test(w.w)) {
        sentences.push(cur);
        cur = [];
      }
    });
    if (cur.length) sentences.push(cur);
    const parts: Word[][] = [];
    sentences.forEach((s) => {
      const k = Math.ceil(s.length / 6);
      let prev = 0;
      for (let j = 1; j < k; j++) {
        let cut = Math.round((j * s.length) / k);
        // shift the cut off a number/unit pair ("56 hari", "ISPU 240", "20 korporasi")
        for (const d of [0, 1, -1, 2, -2]) {
          const c = cut + d;
          if (c - prev >= 2 && s.length - c >= 2 && canBreak(s, c)) {
            cut = c;
            break;
          }
        }
        parts.push(s.slice(prev, cut));
        prev = cut;
      }
      parts.push(s.slice(prev));
    });
    // merge a lone word into its neighbour
    for (let j = 0; j < parts.length; j++) {
      if (parts[j].length === 1 && parts.length > 1) {
        if (j > 0) parts[j - 1] = parts[j - 1].concat(parts[j]);
        else parts[j + 1] = parts[j].concat(parts[j + 1]);
        parts.splice(j, 1);
        j--;
      }
    }
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s - 0.04 : Math.min(nextStart - 0.04, p[p.length - 1].e + 0.45);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_CARD) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  if (n > 4) {
    const chars = ch.words.reduce((m, x) => m + x.w.length + 1, 0);
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      if (!canBreak(ch.words, i)) continue;
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
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(244,234,210,0.97)", borderRadius: 10, padding: "14px 30px 16px", borderBottom: `6px solid ${C.red}`,
          boxShadow: "0 12px 34px rgba(0,0,0,0.5)", opacity: appear, transform: `translateY(${(1 - appear) * 12}px) rotate(-0.4deg)`, maxWidth: 980,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22, whiteSpace: "nowrap", lineHeight: 1.18 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const end = ch.words[idx + 1]?.s ?? ch.b;
              const active = t >= wd.s && t < end;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block", fontSize: 54, fontWeight: 700, padding: "0 8px", borderRadius: 8,
                    color: active ? "#fff6e6" : t >= wd.s ? C.ink : "rgba(44,36,29,0.5)",
                    background: active ? C.red : "transparent", transform: `scale(${bump})`, transformOrigin: "50% 60%",
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

// ---------------------------------------------------------------- the layer
export const FilmHud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 760,
        background: "linear-gradient(180deg, rgba(14,11,9,0.9) 0%, rgba(14,11,9,0.72) 48%, rgba(14,11,9,0) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(0deg, rgba(14,11,9,0.7) 0%, rgba(14,11,9,0.35) 55%, rgba(14,11,9,0) 100%)" }} />
    <Headline t={t} />
    <IspuMeter t={t} />
    <IspaBars t={t} />
    <CountryChips t={t} />
    <Chip o={win(t, T.bmkg + 0.2, T.terbawa - 0.05, 0.3, 0.2)} top={560} text="SUMBER: BMKG" color={C.green} />
    <Chip o={win(t, T.y2014 - 0.05, T.myBawa - 0.05, 0.25, 0.2)} top={560} text="DIRATIFIKASI INDONESIA, 2014" />
    <Chip o={win(t, T.pantau - 0.1, OUTRO_CARD, 0.3, 0.2)} top={560} text="PANTAU ISPU · PAKAI MASKER" color={C.green} />
    <Para o={win(t, T.sulit - 0.4, SEC.PENGEMBANGAN[1], 0.35, 0.25)} label="CERITA NOR AMIRA KEPADA BBC" text="Tetap sulit bernapas, meski di kamar berpenyaring udara." />
    <Para o={win(t, T.isu - 0.2, SEC.PAYOFF[1] + 0.1, 0.35, 0.25)} label="WALHI" text="Isu asing jangan jadi alasan pemerintah lepas tangan." />
    <NameCard t={t} />
    <Ilustrasi t={t} />
    <Captions t={t} />
  </div>
);
