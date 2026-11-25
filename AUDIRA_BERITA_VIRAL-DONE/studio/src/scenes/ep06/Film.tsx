// EP06 film (TIMEFORGE): "Kalau Wapres Mundur?" The Vice President's chair on the plinth.
// 0-53 s: the 2026 chair holds (camera orbits) while fact cards explain Pasal 8 ayat 2 and the
// impeachment route. 53-56 s: time rewinds to 1945; then the chair travels forward on the voice:
// 1956 vacant (Hatta), 1973 refilled, 1998 vacant (Habibie), 2001 (MPR elects Hamzah Haz),
// back to 2026 for the outro. Every beat is anchored to word times in timeline.json (VO locked
// 2026-11-11). Audio is muxed separately. Opening frame = the approved cover framing.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import tl from "./timeline.json";
import { TimeforgeFilm } from "../../kits/timeforge/film/TimeforgeFilm.tsx";
import type { Cut } from "../../kits/timeforge/film/cut.ts";
import { keys } from "../../core/motion/track.ts";
import { Outro } from "../_shared/Outro.tsx";
import { CHAIR } from "./chair/subject.ts";
import { makeEvolution } from "./chair/evolution.ts";
import type { Chair, ChairFx } from "./chair/params.ts";
const ON = (a: number, b: number, rise = 0.6, fall = 0.5) => keys([0, 0], [a, 0], [a + rise, 1], [b - fall, 1], [b, 0]);
import { COVER_RIG } from "./cuts.ts";
import { Headline } from "./Cover.tsx";

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const BODY = "Manrope, sans-serif";
const INK = "#1f2426";
const RED = "#b8321f";
const NAVY = "#1c2a48";

// ------------------------------------------------------------------ clock
type Word = { w: string; s: number; e: number };
const CLIPS = tl.clips as { id: string; words: Word[] }[];
const TOTAL = tl.total;
const OUTRO_AT = (tl.sections as Record<string, number[]>).OUTRO[1] + 0.2;
const A = (id: string, text: string, n = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  const hits = c.words.filter((x) => x.w.startsWith(text));
  if (!hits[n]) throw new Error(`EP06 anchor missing: ${id}:${text}#${n}`);
  return hits[n].s;
};
const T = {
  selasa: A("konteks", "Selasa"),
  status: A("konteks", "Statusnya"),
  tidak: A("pengembangan", "Tidak"),
  pasal: A("pengembangan", "Pasal"),
  presiden: A("pengembangan", "Presiden"),
  mpr: A("pengembangan", "MPR"),
  enamPuluh: A("pengembangan", "60"),
  wapres: A("pengembangan", "Wapres"),
  ini: A("penjelasan", "Ini"),
  dpr: A("penjelasan", "DPR"),
  mk: A("penjelasan", "Mahkamah"),
  mpr2: A("penjelasan", "MPR"),
  dan: A("penjelasan", "Dan"),
  sejarah: A("payoff", "Sejarah"),
  mohammad: A("payoff", "Mohammad"),
  menyurati: A("payoff", "menyurati"),
  berhenti: A("payoff", "berhenti"),
  kursinya: A("payoff", "Kursinya"),
  sri: A("payoff", "Sri"),
  hb: A("payoff", "Hamengkubuwono"),
  tahun98: A("payoff", "Tahun"),
  habibie: A("payoff", "Habibie"),
  baru: A("payoff", "Baru"),
  y2001: A("payoff", "2001"),
  hamzah: A("payoff", "Hamzah"),
  bedanya: A("outro", "Bedanya"),
  tapi: A("outro", "Tapi"),
  menurutmu: A("outro", "Menurutmu"),
};

// ------------------------------------------------------------------ the cut (VO seconds)
const R = (t: number, ty: number, az: number, el: number, dist: number) => [t, 0, ty, 0, az, el, dist, 24];
const rw = 0.42; // one era per 0.42 s during the rewind
const s0 = T.sejarah + 0.1;
export const FILM_CUT: Cut<Chair, ChairFx> = {
  seconds: TOTAL,
  clock: (frame, fps) => frame / fps,
  evolution: makeEvolution([
    { id: "m5", t0: s0, t1: s0 + rw, reverse: true },
    { id: "m4", t0: s0 + rw, t1: s0 + 2 * rw, reverse: true },
    { id: "m3", t0: s0 + 2 * rw, t1: s0 + 3 * rw, reverse: true },
    { id: "m2", t0: s0 + 3 * rw, t1: s0 + 4 * rw, reverse: true },
    { id: "m1", t0: s0 + 4 * rw, t1: s0 + 5 * rw, reverse: true },
    { id: "m1", t0: T.berhenti, t1: T.berhenti + 1.6 },
    { id: "m2", t0: T.hb - 0.3, t1: T.hb + 1.7 },
    { id: "m3", t0: T.tahun98, t1: T.tahun98 + 1.5 },
    { id: "m4", t0: T.baru, t1: T.baru + 1.7 },
    { id: "m5", t0: T.bedanya, t1: T.bedanya + 1.7 },
  ]),
  yaw: keys([0, -26], [9, -6], [15, -40], [24, 18], [33, 46], [41, -10], [47, -30], [53, -20], [62, -32], [72, -14], [79, -28], [TOTAL, -22]),
  tilt: keys([0, 0, 0]),
  rig: keys(
    [...COVER_RIG],
    R(1.8, 0.6, 6, 9, 138),
    R(6.6, 0.4, -8, 6, 132),
    R(9.2, 6.2, -16, 8, 84), // close on the plate: "Wapres Gibran menyampaikan niat"
    R(13.6, 5.4, -6, 10, 92),
    R(15.4, 0.8, 18, 10, 136), // pull out: MK and MA
    R(18.8, 2.4, -4, -2, 118), // low angle: "Statusnya masih niat"
    R(21.8, 1.0, 10, 8, 134),
    R(24.6, -1.0, 0, 34, 150), // high and wide: "tidak ada pemilu ulang"
    R(29.8, 0.4, 58, 10, 132), // profile: "Presiden mengusulkan"
    R(36.8, -3.0, 20, 40, 146), // top-down: "60 hari"
    R(40, 0.6, -10, 10, 136),
    R(41.6, 3.0, -8, 14, 150), // wide: the DPR / MK / MPR pillars rise behind the chair
    R(47.9, 2.6, -14, 0, 120), // low: "pemerintahan tetap jalan"
    R(53, 0.6, 6, 9, 136),
    R(56, 0.4, -18, 8, 132),
    R(66, 0.4, 0, 9, 130),
    R(72, 0.4, 14, 8, 130),
    R(79, 0.6, -6, 9, 134),
    R(84, 0.6, 4, 9, 138),
    R(TOTAL, 0.6, 6, 9, 140),
  ),
  labels: keys([0, 1]),
  fx: {
    env: ON(T.selasa + 0.4, T.tidak, 0.8, 0.6),
    cards: ON(T.presiden - 0.2, T.wapres + 0.8, 1.0, 0.6),
    ring: keys([0, 0], [T.enamPuluh - 0.1, 0], [T.enamPuluh + 2.2, 1], [T.ini - 0.4, 1], [T.ini, 0]),
    dpr: ON(T.dpr - 0.2, T.dan + 1.2, 0.9, 0.7),
    mk: ON(T.mk - 0.2, T.dan + 1.2, 0.9, 0.7),
    mpr: ON(T.mpr2 - 0.2, T.dan + 1.2, 0.9, 0.7),
  },
  title: { in: [-2, -1], out: [5.6, 6.4] },
};

// ------------------------------------------------------------------ HUD
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.3) => Math.min(smooth((t - a) / fi), smooth((b - t) / fo));

/** One fact card in the band between the year block and the chair (y 360-660 @1080). */
const Card: React.FC<{ t: number; a: number; b: number; top?: number; kicker?: string; title: string; sub?: string; color?: string }> = ({ t, a, b, top = 372, kicker, title, sub, color = INK }) => {
  const k = win(t, a, b);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
      {kicker ? <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, letterSpacing: "0.16em", color: RED }}>{kicker}</div> : null}
      <div style={{ fontFamily: ANTON, fontSize: 92, lineHeight: 1.0, color, marginTop: 6 }}>{title}</div>
      {sub ? <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 40, color: "#2b3033", marginTop: 10 }}>{sub}</div> : null}
    </div>
  );
};

/** A row of steps that light up one by one (procedure diagrams). */
const Steps: React.FC<{ t: number; a: number; b: number; items: { label: string; at: number }[]; top?: number }> = ({ t, a, b, items, top = 560 }) => {
  const k = win(t, a, b);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top, display: "flex", flexWrap: "nowrap", justifyContent: "center", alignItems: "center", gap: 14, opacity: k }}>
      {items.map((it, i) => {
        const on = smooth((t - it.at) / 0.3);
        return (
          <React.Fragment key={it.label}>
            {i > 0 ? <div style={{ fontFamily: ANTON, fontSize: 52, color: on > 0.5 ? RED : "#b9b4ab" }}>→</div> : null}
            <div
              style={{
                fontFamily: ANTON, fontSize: 44, padding: "8px 18px", borderRadius: 12,
                background: on > 0.5 ? NAVY : "rgba(255,255,255,0.85)", color: on > 0.5 ? "#f4efe6" : "#4a4f52",
                border: `3px solid ${on > 0.5 ? NAVY : "#cfc9be"}`, transform: `scale(${1 + 0.06 * on * (1 - clamp01((t - it.at - 0.3) / 0.4))})`,
              }}
            >
              {it.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => {
  return (
    <>
      {t < 6.4 ? <Headline opacity={1 - smooth((t - 5.6) / 0.8)} /> : null}
      <Card t={t} a={T.selasa} b={T.status} kicker="SELASA, 10 NOVEMBER 2026" title="GIBRAN: NIAT MUNDUR" sub="disampaikan kepada Presiden Prabowo" />
      <Card t={t} a={T.status} b={T.tidak - 0.6} kicker="STATUS HARI INI" title="NIAT, BELUM SURAT RESMI" color={RED} />
      <Card t={t} a={T.tidak} b={T.pasal} title="TIDAK ADA PEMILU ULANG" />
      <Card t={t} a={T.pasal} b={T.wapres} kicker="PASAL 8 AYAT (2) UUD 1945" title={t >= T.enamPuluh ? "PALING LAMBAT 60 HARI" : "KURSI KOSONG?"} color={t >= T.enamPuluh ? RED : INK} />
      <Steps t={t} a={T.presiden - 0.2} b={T.wapres} items={[{ label: "PRESIDEN: 2 CALON", at: T.presiden }, { label: "MPR MEMILIH", at: T.mpr }]} />
      <Card t={t} a={T.wapres} b={T.ini - 0.3} kicker="WAPRES BARU MENERUSKAN" title="SAMPAI 2029" />
      <Card t={t} a={T.ini} b={T.dan} kicker="BERBEDA DENGAN MUNDUR" title="JALUR PEMAKZULAN" />
      <Steps t={t} a={T.ini + 0.2} b={T.dan} items={[{ label: "DPR", at: T.dpr }, { label: "MK", at: T.mk }, { label: "MPR", at: T.mpr2 }]} />
      <Card t={t} a={T.dan} b={T.sejarah - 0.2} kicker="SELAMA KURSI KOSONG" title="PEMERINTAHAN TETAP JALAN" />
      <Card t={t} a={T.sejarah} b={T.mohammad - 0.2} title="MUNDUR KE 1945" color={NAVY} />
      <Card t={t} a={T.mohammad} b={T.berhenti} kicker="WAPRES PERTAMA, 1945–1956" title="MOHAMMAD HATTA" sub={t >= T.menyurati ? "menyurati DPR, Juli 1956" : undefined} />
      <Card t={t} a={T.berhenti} b={T.kursinya} kicker="RESMI BERHENTI" title="1 DESEMBER 1956" sub="berbeda pandangan dengan Soekarno" color={RED} />
      <Card t={t} a={T.kursinya} b={T.sri} kicker="KURSI WAPRES" title="KOSONG 16+ TAHUN" color={RED} />
      <Card t={t} a={T.sri} b={T.tahun98} kicker="1973" title="SRI SULTAN HB IX" sub="kursi terisi lagi" />
      <Card t={t} a={T.tahun98} b={T.baru} kicker="1998–1999" title="HABIBIE TANPA WAKIL" color={RED} />
      <Card t={t} a={T.baru} b={T.bedanya + 0.5} kicker="26 JULI 2001 · DIPILIH MPR" title={t >= T.hamzah - 0.3 ? "HAMZAH HAZ" : "DI TENGAH MASA JABATAN"} />
      <Card t={t} a={T.bedanya + 0.6} b={T.tapi} kicker="SEKARANG" title="BATAS 60 HARI" color={RED} />
      <Card t={t} a={T.tapi} b={T.menurutmu} kicker="TAPI" title="TUNGGU SURAT RESMI" />
      <Card t={t} a={T.menurutmu} b={OUTRO_AT} title="KOSONG LAGI?" color={NAVY} />
    </>
  );
};

// ------------------------------------------------------------------ captions (karaoke)
const STICKY = /\d|^(enam|belas|puluh|Mahkamah|Sri|Sultan|Hamzah|Mohammad|Undang-Undang|sama|di|masa)$/;
const sticky = (w: string) => STICKY.test(w);
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    const ws = c.words;
    const parts: Word[][] = [];
    let cur: Word[] = [];
    ws.forEach((x, i) => {
      cur.push(x);
      const end = /[.,?:!]$/.test(x.w);
      const left = ws.length - 1 - i;
      const canBreak = !sticky(x.w) && left >= 2;
      if (i === ws.length - 1 || (canBreak && (cur.length >= 5 || (end && cur.length >= 3)))) {
        parts.push(cur);
        cur = [];
      }
    });
    if (cur.length) parts.push(cur);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  if (n > 4) {
    let best = 1e9;
    const chars = ch.words.reduce((m, x) => m + x.w.length + 1, 0);
    for (let i = 2; i <= n - 2; i++) {
      if (sticky(ch.words[i - 1].w)) continue;
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const d = Math.abs(a - (chars - a));
      if (d < best) {
        best = d;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = smooth((t - ch.a) / 0.14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1340, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: "rgba(28,42,72,0.92)", borderRadius: 14, padding: "14px 28px", opacity: appear, transform: `translateY(${(1 - appear) * 12}px)`, maxWidth: 960, boxShadow: "0 10px 28px rgba(0,0,0,0.18)" }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 20, whiteSpace: "nowrap", lineHeight: 1.25 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const nxt = ch.words[idx + 1]?.s ?? ch.b;
              const active = t >= wd.s && t < nxt;
              const done = t >= wd.s;
              const bump = active ? 1 + 0.05 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span key={idx} style={{ display: "inline-block", fontFamily: BODY, fontWeight: 800, fontSize: 46, color: active ? "#f2b632" : done ? "#f4efe6" : "rgba(244,239,230,0.5)", transform: `scale(${bump})` }}>
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

// ------------------------------------------------------------------ film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  return (
    <AbsoluteFill>
      <TimeforgeFilm subject={CHAIR} cut={FILM_CUT} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Hud t={t} />
        <Captions t={t} />
      </div>
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
