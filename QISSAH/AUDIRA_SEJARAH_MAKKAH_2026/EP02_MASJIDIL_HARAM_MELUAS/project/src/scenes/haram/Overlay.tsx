// 2D layers of the EP02 film: chapter cards, data callouts, captions, payoff panel, end screen, outro.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";
import { useFormat } from "../../core/film/format.ts";
import { A } from "./state.ts";
import { CH, clamp01, smooth, type Word } from "./tl.ts";
import { ERA_COL } from "./parts.tsx";

let fontsReady = false;
if (typeof document !== "undefined" && !fontsReady) {
  fontsReady = true;
  const h = delayRender("haram film fonts");
  Promise.all([
    new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`).load(),
    new FontFace("Space Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }).load(),
  ]).then(
    (faces) => {
      faces.forEach((f) => (document.fonts as unknown as { add(x: FontFace): void }).add(f));
      continueRender(h);
    },
    () => continueRender(h),
  );
}

export const MONO = "'Space Grotesk', sans-serif";
export const DISPLAY = "Anton, sans-serif";
const INK = "#f4efe2";

/** Lays children out in layout pixels (1920x1080 or 1080x1920) scaled to the render size. */
export const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { layout, scale } = useFormat();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: layout.width, height: layout.height, transform: `scale(${scale})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

const env = (t: number, a: number, d: number, fi = 0.45, fo = 0.5) => clamp01((t - a) / fi) * clamp01((a + d - t) / fo);

// ---------- chapter title cards ----------
const CARDS = [
  { id: "c02_halaman", n: 1, title: "HALAMAN TANPA TEMBOK", year: "17 H · ±638 M" },
  { id: "c03_khalifah", n: 2, title: "PARA KHALIFAH MEMBANGUN", year: "91 – 167 H" },
  { id: "c04_kubah", n: 3, title: "KUBAH DARI ISTANBUL", year: "±1400 – ±1576" },
  { id: "c05_beton", n: 4, title: "ABAD BETON & SA'I MASUK MASJID", year: "1928 – ±1979" },
  { id: "c06_fahd", n: 5, title: "SAYAP RAJA FAHD", year: "1983 – ±1994" },
  { id: "c07_terbesar", n: 6, title: "PROYEK TERBESAR", year: "2008 – 2023" },
  { id: "c08_tersisa", n: 7, title: "YANG HILANG, YANG TETAP", year: "RIWAQ ABBASI & UTSMANI" },
];

export const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  const { isWide, safe, layout } = useFormat();
  const c = CARDS.find((x) => t >= CH[x.id].start - 0.6 && t < CH[x.id].start + 3.6);
  if (!c) return null;
  const a = env(t, CH[c.id].start - 0.6, 4.0, 0.6, 0.7);
  const slide = (1 - smooth(clamp01((t - CH[c.id].start + 0.6) / 0.9))) * 40;
  return (
    <div style={{ position: "absolute", left: isWide ? safe.left + 10 : 70, top: isWide ? layout.height * 0.3 : 300, opacity: a, transform: `translateX(${-slide}px)` }}>
      <div style={{ position: "absolute", inset: "-40px -60px -40px -60px", background: "radial-gradient(ellipse at 30% 50%, rgba(8,8,10,0.72), rgba(8,8,10,0) 70%)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: isWide ? 30 : 34, letterSpacing: 8, color: "#ffd166" }}>BAB {c.n} / 7</div>
        <div style={{ width: 120 * smooth(a), height: 4, background: ERA_COL[Math.min(5, c.n - 1)], margin: "16px 0 18px", boxShadow: `0 0 18px ${ERA_COL[Math.min(5, c.n - 1)]}` }} />
        <div style={{ fontFamily: DISPLAY, fontSize: isWide ? 112 : 104, lineHeight: 1.0, color: INK, maxWidth: isWide ? 1100 : 940, textShadow: "0 6px 30px rgba(0,0,0,0.55)" }}>{c.title}</div>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: isWide ? 34 : 38, color: "#9ff3e6", marginTop: 16, letterSpacing: 2 }}>{c.year}</div>
      </div>
    </div>
  );
};

// ---------- data callouts (text only from the script and the source register) ----------
type Call = { t: number; d?: number; big: string; small?: string; col?: string; quiet?: boolean };
export const CALLS: Call[] = [
  { t: A.hJuta - 0.2, big: ">1 JUTA m²", small: "dari halaman tanpa tembok", col: ERA_COL[5] },
  { t: A.seribu, big: "±1.500 m²", small: "luas awal · menurut Fawaz Al-Dahas", col: ERA_COL[0] },
  { t: A.y17, big: "17 H · ±638 M", small: "banjir Sail Umm Nahsyal", col: "#5fe3f0" },
  { t: A.tembok, big: "TEMBOK RENDAH", small: "Umar bin Khattab · lampu di atasnya", col: ERA_COL[0] },
  { t: A.utsman, big: "±10 TAHUN KEMUDIAN", small: "Utsman bin Affan · serambi beratap pertama", col: ERA_COL[1] },
  { t: A.zubair, big: "±7.500 m²", small: "Abdullah bin Zubair · mataf diubin", col: ERA_COL[1] },
  { t: A.walid, big: "UMAYYAH · AL-WALID", small: "tiang marmer dari Mesir dan Syam", col: ERA_COL[1] },
  { t: A.y137, big: "137 H · AL-MANSUR", small: "sisi utara dan barat · menara pertama", col: ERA_COL[1] },
  { t: A.masalah, big: "KA'BAH TIDAK DI TENGAH", small: "setelah perluasan al-Mahdi", col: "#ffb347" },
  { t: A.qubais, big: "JABAL ABU QUBAIS", small: "haji 164 H · melihat dari atas", col: "#ffd166" },
  { t: A.dipindahkan, big: "ALIRAN BANJIR DIPINDAH", small: "masjid melebar ke selatan", col: "#5fe3f0" },
  { t: A.y167, big: "167 H · ±28.000 m²", small: "dirampungkan Musa al-Hadi · 3 menara baru", col: ERA_COL[1] },
  { t: A.delapanRatus - 0.4, big: "±800 TAHUN", small: "luas nyaris tidak berubah", col: ERA_COL[2] },
  { t: A.y1400, big: "±1400 · KEBAKARAN", small: "±⅓ masjid · 130 tiang · dibangun ulang Faraj bin Barquq", col: "#ff8a5c" },
  { t: A.y1570, big: "AWAL 1570-AN", small: "serambi timur miring ke arah Ka'bah", col: "#ffb347" },
  { t: A.kubah, big: "ATAP KAYU → KUBAH", small: "perintah Sultan Selim II", col: ERA_COL[2] },
  { t: A.y1576, big: "±1576", small: "dirampungkan Sultan Murad III · ±4 tahun", col: ERA_COL[2] },
  { t: A.sinan, big: "DIKAITKAN DENGAN MIMAR SINAN", small: "perannya tidak tercatat kuat di sumber", col: ERA_COL[2] },
  { t: A.mesir, big: "ISTANBUL → KAIRO → MAKKAH", small: "dana, bahan, insinyur, tukang dari Mesir", col: ERA_COL[2] },
  { t: A.bertambah, big: "±28.000 m²", small: "luas tetap · wajahnya berubah", col: ERA_COL[2] },
  { t: A.y1928, big: "1928 · ±1.000 LAMPU", small: "listrik di masa Raja Abdulaziz", col: "#ffd166" },
  { t: A.y1955, big: "21 OKTOBER 1955", small: "pidato Raja Saud · perluasan dimulai", col: ERA_COL[3] },
  { t: A.lantai3, big: "3 LANTAI · 64 PINTU", small: "7 menara · 89 m", col: ERA_COL[3] },
  { t: A.seratus, big: "±160.000 m²", small: ">300.000 jemaah", col: ERA_COL[3] },
  { t: A.bersai, big: "JALUR SA'I = JALAN PASAR", small: "biji-bijian, daging, kurma", col: "#ffd166" },
  { t: A.digabungkan - 1.5, big: "1955–1956", small: "Safa, Marwah, jalur sa'i masuk masjid", col: ERA_COL[3] },
  { t: A.jalurnya, big: "≈400 m × 20 m", small: "2 lantai · pembatas pergi dan pulang", col: ERA_COL[3] },
  { t: A.menolak, big: "BANGUNAN UTSMANI DIPERTAHANKAN", small: "keputusan Raja Faisal", col: ERA_COL[2] },
  { t: A.thassos, big: "MARMER THASSOS", small: "dari Yunani · tetap sejuk", col: "#ffffff" },
  { t: A.y1983, big: "1983 · PASAR KECIL", small: "30.000 m² dibebaskan · salat sementara", col: ERA_COL[4] },
  { t: A.y1986, big: "1986 · ATAP JADI SAF", small: "61.000 m² · 90.000 jemaah", col: ERA_COL[4] },
  { t: A.y1988, big: "14 SEPTEMBER 1988", small: "batu pertama Raja Fahd", col: ERA_COL[4] },
  { t: A.ajyad, big: "PENDINGIN DARI AJYAD", small: "sayap barat 3 lantai", col: "#7fe9ff" },
  { t: A.pintu, big: "+14 PINTU = 112", small: "gedung eskalator ke atap", col: ERA_COL[4] },
  { t: A.duaMenara, big: "9 MENARA", small: "2 menara baru", col: ERA_COL[4] },
  { t: A.luas356 - 1.2, big: "±356.000 m²", small: "±770.000 jemaah · >1 juta saat musim haji", col: ERA_COL[4] },
  { t: A.y2008, big: "2008 · DIUMUMKAN", small: "batu pertama 19 Agustus 2011", col: ERA_COL[5] },
  { t: A.properti - 1.5, big: "5.882 PROPERTI", small: "dibongkar · pemilik diberi ganti rugi", col: "#ffb347" },
  { t: A.beton, big: "3 JUTA m³ BETON", small: "800.000 ton baja", col: ERA_COL[5] },
  { t: A.crane - 0.6, d: 7, big: "11 SEPTEMBER 2015", small: "crane runtuh · sedikitnya 111 orang meninggal", col: "#c9c4b8", quiet: true },
  { t: A.kaliLipat, big: "SA'I: 44.000 → 118.000 / JAM", small: "lebar dua kali · 4 lantai", col: ERA_COL[5] },
  { t: A.jembatan, big: "JEMBATAN TAWAF SEMENTARA", small: "dibongkar 2016 · ±6 minggu", col: ERA_COL[4] },
  { t: A.tiang84 - 0.6, big: "84 TIANG · 416 BALOK", small: "diangkat", col: ERA_COL[4] },
  { t: A.sembilanBelas, big: "19.000 → 30.000 / JAM", small: "kapasitas lantai mataf", col: ERA_COL[5] },
  { t: A.riwaqSaudi - 1, big: "MEI 2023 · RIWAQ SAUDI", small: "4 lantai", col: ERA_COL[5] },
  { t: A.seratusTujuh - 0.6, big: "±107.000 TAWAF / JAM", small: "bersama lantai mataf", col: ERA_COL[5] },
  { t: A.tiang95, big: "±95 TIANG BERSEJARAH", small: "yang tertua dari 167 H", col: ERA_COL[1] },
  { t: A.dibongkar8, big: "SEBAGIAN DIBONGKAR", small: "elemennya dinyatakan akan dipasang kembali", col: "#c9c4b8" },
  { t: A.isra - 0.4, big: "TIANG AWAL ISRA'", small: "menurut tradisi · dicopot awal 2015", col: "#ffb347" },
  { t: A.independent - 1, big: "THE INDEPENDENT · 2013", small: "memuat foto pembongkaran bagian Utsmani & Abbasi", col: "#c9c4b8", quiet: true },
  { t: A.alawi - 0.2, big: "DR IRFAN AL-ALAWI", small: "pegiat warisan: catatan sejarah \"dihapus\"", col: "#c9c4b8", quiet: true },
  { t: A.resmi - 0.4, big: "POSISI RESMI SAUDI", small: "keselamatan & kenyamanan jutaan jemaah", col: "#c9c4b8", quiet: true },
  { t: A.asli - 0.6, big: "ASLI ATAU DIPASANG ULANG?", small: "belum bisa dipastikan dari sumber terbuka", col: "#c9c4b8", quiet: true },
  { t: A.komentar - 1, big: "TULIS DI KOMENTAR", small: "kubah Utsmani atau jalur sa'i?", col: "#ffd166" },
  { t: A.zamzam - 0.8, d: 3.4, big: "EPISODE BERIKUTNYA", small: "Sumur Zamzam", col: "#5fe3f0" },
];

export const Callout: React.FC<{ t: number }> = ({ t }) => {
  const { isWide, safe, layout } = useFormat();
  const idx = CALLS.findIndex((c, i) => t >= c.t && t < c.t + (c.d ?? Math.min(5.2, (CALLS[i + 1]?.t ?? 1e9) - c.t - 0.2)));
  if (idx < 0) return null;
  const c = CALLS[idx];
  const d = c.d ?? Math.min(5.2, (CALLS[idx + 1]?.t ?? 1e9) - c.t - 0.2);
  const a = env(t, c.t, d, 0.4, 0.45);
  const x = (1 - smooth(clamp01((t - c.t) / 0.5))) * 30;
  const w = isWide ? 720 : 900;
  const style: React.CSSProperties = isWide
    ? { position: "absolute", right: safe.right, top: safe.top + 20, width: w }
    : { position: "absolute", left: (layout.width - w) / 2, top: safe.top + 30, width: w };
  return (
    <div style={{ ...style, opacity: a, transform: `translateX(${x}px)` }}>
      <div style={{ background: c.quiet ? "rgba(10,10,12,0.82)" : "rgba(10,10,12,0.74)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 14, padding: isWide ? "18px 26px" : "22px 30px", display: "flex", gap: 20, alignItems: "stretch" }}>
        <div style={{ width: 6, borderRadius: 3, background: c.col ?? "#ffd166", boxShadow: c.quiet ? "none" : `0 0 14px ${c.col}` }} />
        <div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: isWide ? (c.big.length > 22 ? 38 : 46) : c.big.length > 22 ? 44 : 54, color: c.quiet ? "#e9e4d8" : INK, letterSpacing: 1 }}>{c.big}</div>
          {c.small && <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: isWide ? 26 : 30, color: "rgba(240,236,226,0.78)", marginTop: 6 }}>{c.small}</div>}
        </div>
      </div>
    </div>
  );
};

// ---------- payoff panel: the growth list, built row by row ----------
const ROWS = [
  { t: A.p1, a: "±1.500 m²", b: "masa awal", c: ERA_COL[0] },
  { t: A.p2, a: "±28.000 m²", b: "Abbasiyah – Utsmani", c: ERA_COL[2] },
  { t: A.p3, a: "±160.000 m²", b: "perluasan Saudi I", c: ERA_COL[3] },
  { t: A.p4, a: "±356.000 m²", b: "setelah Raja Fahd", c: ERA_COL[4] },
  { t: A.p5, a: ">1 juta m²", b: "kini · 13 menara", c: ERA_COL[5] },
];
export const PayoffPanel: React.FC<{ t: number }> = ({ t }) => {
  const { isWide, safe, layout } = useFormat();
  const a = env(t, A.p1 - 0.6, A.lingkaran + 1.5 - (A.p1 - 0.6), 0.6, 0.8);
  if (a <= 0) return null;
  const cap = clamp01((t - (A.p5 + 2.2)) / 0.5);
  return (
    <div style={{ position: "absolute", opacity: a, ...(isWide ? { left: safe.left, top: safe.top + 60, width: 760 } : { left: 70, top: safe.top + 30, width: layout.width - 140 }) }}>
      <div style={{ background: "rgba(10,10,12,0.76)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 16, padding: "22px 28px" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: "#ffd166", marginBottom: 12 }}>CINCIN DEMI CINCIN</div>
        {ROWS.map((r) => {
          const k = clamp01((t - r.t + 0.2) / 0.4);
          return (
            <div key={r.a} style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0.25 + 0.75 * k, marginTop: 8 }}>
              <div style={{ width: 34, height: 6, background: r.c, boxShadow: k > 0.5 ? `0 0 12px ${r.c}` : "none", borderRadius: 3 }} />
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: isWide ? 38 : 44, color: INK, width: isWide ? 290 : 330, whiteSpace: "nowrap" }}>{r.a}</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: isWide ? 25 : 30, color: "rgba(240,236,226,0.75)", whiteSpace: "nowrap" }}>{r.b}</div>
            </div>
          );
        })}
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: isWide ? 24 : 28, color: "#9ff3e6", marginTop: 16, opacity: cap }}>±2 juta jemaah · menurut sebagian sumber resmi hingga ±3 juta di puncak musim</div>
      </div>
    </div>
  );
};

// ---------- captions ----------
type Group = { words: Word[]; start: number; end: number };
export function groupWords(words: Word[], maxChars: number): Group[] {
  const out: Group[] = [];
  let cur: Word[] = [];
  let len = 0;
  const push = () => {
    if (cur.length) out.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
    cur = [];
    len = 0;
  };
  for (const w of words) {
    if (len + w.w.length + 1 > maxChars && cur.length) push();
    cur.push(w);
    len += w.w.length + 1;
    if (/[.?!]$/.test(w.w) && len > maxChars * 0.45) push();
  }
  push();
  return out;
}

/** 16:9 captions: calm bottom-centre band, 1-2 lines, active word highlighted. */
export const CaptionsWide: React.FC<{ t: number; groups: Group[] }> = ({ t, groups }) => {
  const { safe, layout } = useFormat();
  const g = groups.find((x, i) => t >= x.start - 0.15 && t < (groups[i + 1] ? Math.min(groups[i + 1].start - 0.15, x.end + 1.2) : x.end + 1.2));
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: layout.width, bottom: safe.bottom + 14, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 1320, padding: "12px 26px", background: "rgba(8,8,10,0.62)", borderRadius: 12, textAlign: "center", lineHeight: 1.3 }}>
        {g.words.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.08;
          const past = t >= w.e + 0.08;
          return (
            <span key={i} style={{ fontFamily: MONO, fontWeight: on ? 700 : 500, fontSize: 40, color: on ? "#ffd166" : past ? INK : "rgba(244,239,226,0.62)", marginRight: "0.32em" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 9:16 karaoke: per-word highlight, bounce <= 1.04, word gap >= 0.4 em, above the bottom 380 px. */
export const CaptionsShort: React.FC<{ t: number; groups: Group[] }> = ({ t, groups }) => {
  const { safe, layout } = useFormat();
  const g = groups.find((x, i) => t >= x.start - 0.1 && t < (groups[i + 1] ? Math.min(groups[i + 1].start - 0.1, x.end + 0.8) : x.end + 0.8));
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 60, width: layout.width - 120, bottom: safe.bottom + 40, display: "flex", justifyContent: "center", flexWrap: "wrap", rowGap: 10 }}>
      {g.words.map((w, i) => {
        const on = t >= w.s && t < w.e + 0.06;
        const k = on ? Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 0;
        return (
          <span key={i} style={{ display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 66, lineHeight: 1.12, color: on ? "#ffd166" : t > w.e ? INK : "rgba(244,239,226,0.7)", transform: `scale(${1 + 0.04 * k})`, marginRight: "0.42em", textShadow: "0 4px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- end screen + outro ----------
export const EndFrames: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  const { layout } = useFormat();
  const a = clamp01((t - from - 0.4) / 0.8);
  if (a <= 0) return null;
  const w = layout.width * 0.3, h = w * 9 / 16, top = layout.height * 0.3;
  const box = (left: number, label: string) => (
    <div style={{ position: "absolute", left, top, width: w, height: h, border: "2px solid rgba(244,239,226,0.28)", borderRadius: 14, background: "rgba(8,8,10,0.25)" }}>
      <div style={{ position: "absolute", left: 18, bottom: -44, fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: "rgba(244,239,226,0.55)" }}>{label}</div>
    </div>
  );
  return (
    <div style={{ opacity: a }}>
      {box(layout.width * 0.06, "TONTON BERIKUTNYA")}
      {box(layout.width * 0.64, "SEJARAH MAKKAH")}
    </div>
  );
};

export const Outro: React.FC<{ t: number; total: number }> = ({ t, total }) => {
  const { layout, isWide } = useFormat();
  const start = total - 3;
  const a = clamp01((t - start) / 0.4);
  if (a <= 0) return null;
  const side = Math.min(layout.width, layout.height);
  return (
    <AbsoluteFill style={{ background: "#0B3D2E", opacity: a, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: isWide ? 26 : 40 }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: side * 0.42, height: "auto" }} />
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: side * 0.03, color: "rgba(244,239,226,0.86)", letterSpacing: 2 }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};

/** Short end card during the outro line. */
export const ShortEndCard: React.FC<{ t: number; from: number; to: number }> = ({ t, from, to }) => {
  const { layout, safe } = useFormat();
  const a = env(t, from, to - from + 0.6, 0.5, 0.5);
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 70, width: layout.width - 140, top: safe.top + 120, opacity: a, textAlign: "center" }}>
      <div style={{ background: "rgba(10,10,12,0.8)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "34px 30px" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "#ffd166" }}>SEJARAH MAKKAH · EP02</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 92, lineHeight: 1.05, color: INK, marginTop: 14 }}>TONTON VIDEO PANJANGNYA</div>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 40, color: "#9ff3e6", marginTop: 14 }}>di YouTube Audira</div>
      </div>
    </div>
  );
};
