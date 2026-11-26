// EP19 HUD (1080x1920 layout px): one data card at a time under the top safe zone, map labels
// pinned to world points, the sword counter, and karaoke captions from vo-words.json.
import React from "react";
import { FONT } from "../../core/type/fonts.ts";
import WORDS from "../../../public/audio/vo-words.json";
import { CUE } from "./cues.ts";
import { MADINAH, MUTAH, SYRIA, geo } from "./geo.ts";
import { project, type Pose } from "./rig.ts";
import { clamp01, easeOutBack } from "./timing.ts";
import { SHEET_Y, hAt, routeAt } from "./World.tsx";
import { columnU } from "./Mutah.tsx";
const within = (t: number, a: number, b: number) => clamp01((t - a) / 0.35) * clamp01((b - t) / 0.35);

const GOLD = "#E8B84A";
const IVORY = "#F4EBD6";
const PLATE = "rgba(20,24,32,0.9)";

type Card = { a: number; b?: number; title: string; sub?: string; big?: boolean; warn?: boolean };
const CARDS: Card[] = [
  { a: 0.05, b: 2.6, title: "3 KOMANDAN GUGUR", big: true },
  { a: CUE.panji0, title: "PANJI KE KHALID BIN WALID" },
  { a: CUE.keputusan, title: "MUNDUR", big: true },
  { a: CUE.tahun629, title: "629 M", sub: "MU'TAH · TIMUR SUNGAI YORDAN", big: true },
  { a: CUE.pasukan, title: "±3.000", sub: "PASUKAN MUSLIM", big: true },
  { a: CUE.lawan, b: 16.9, title: "BIZANTIUM + SEKUTU ARAB" },
  { a: CUE.zaid, title: "ZAID BIN HARITSAH", sub: "KOMANDAN 1" },
  { a: CUE.jafar, title: "JA'FAR BIN ABI THALIB", sub: "KOMANDAN 2" },
  { a: CUE.abdullah, title: "ABDULLAH BIN RAWAHAH", sub: "KOMANDAN 3" },
  { a: CUE.ketiganya, title: "KETIGANYA GUGUR" },
  { a: 25.2, b: 30.6, title: "SAHIH BUKHARI 4261 · 4262", sub: "KABAR DENGAN AIR MATA" },
  { a: CUE.satu, title: "1 PEDANG YAMAN", big: true },
  { a: 37.0, title: "BUKHARI 4265 · SAHIH" },
  { a: CUE.pengambilPanji, b: 41.6, title: "SALAH SATU PEDANG ALLAH" },
  { a: CUE.menarik, title: "KHALID MENARIK PASUKAN" },
  { a: 44.9, title: "SUMBER AWAL BERSELISIH" },
  { a: CUE.kekalahan, title: "KALAH?", big: true },
  { a: CUE.kemenangan, title: "MENANG?", big: true },
  { a: CUE.jelas, title: "SEBAGIAN BESAR SELAMAT" },
  { a: CUE.kabarnya, b: 57.4, title: "KABAR: DICEMOOH “PELARI”" },
  { a: 57.5, b: 61.6, title: "RIWAYAT BELAKANGAN, LEMAH", sub: "DICATAT SEBAGAI KABAR SAJA", warn: true },
  { a: 61.9, title: "±638 M", big: true },
  { a: CUE.umar, title: "UMAR MENCOPOT KHALID", sub: "KOMANDO TERTINGGI DI SYRIA" },
  { a: CUE.alasan, title: "ALASAN DIPERDEBATKAN" },
  { a: CUE.harta, title: "HARTA RAMPASAN?" },
  { a: 71.3, title: "TERLALU BERGANTUNG?" },
  { a: 73.2, title: "PIDATO PERPISAHAN" },
  { a: 74.9, title: "TETAP BERJUANG" },
  { a: CUE.abuUbaidah, title: "DI BAWAH ABU UBAIDAH" },
  { a: CUE.duaKali, title: "2× MELEPAS", big: true },
  { a: CUE.medan, title: "MEDAN PERANG", sub: "1 · MU'TAH 629" },
  { a: CUE.jabatan, title: "JABATAN", sub: "2 · SYRIA ±638" },
  { a: 81.7, b: 84.1, title: "PERISTIWA TERCATAT", sub: "MAKNA, TAFSIR KITA" },
  { a: 84.3, b: 87.9, title: "MANA YANG LEBIH BERAT?" },
];
const cardEnd = (i: number) => CARDS[i].b ?? (CARDS[i + 1] ? CARDS[i + 1].a - 0.05 : CARDS[i].a + 2);

const CardView: React.FC<{ c: Card; t: number; end: number }> = ({ c, t, end }) => {
  const kin = clamp01((t - c.a) / 0.28);
  const kout = clamp01((end - t) / 0.2);
  const k = Math.min(kin, kout);
  const pop = easeOutBack(kin);
  const accent = c.warn ? "#E0663C" : GOLD;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 250, display: "flex", justifyContent: "center", fontFamily: FONT, opacity: k }}>
      <div style={{
        background: PLATE, borderLeft: `12px solid ${accent}`, borderRadius: 14, padding: c.big ? "22px 44px 24px" : "20px 38px 22px",
        maxWidth: 940, boxShadow: "0 16px 40px rgba(0,0,0,0.45)", transform: `translateY(${(1 - pop) * -20}px) scale(${0.94 + 0.06 * pop})`,
        textAlign: "left",
      }}>
        {c.warn ? <div style={{ color: accent, fontSize: 38, fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>⚠ CATATAN SUMBER</div> : null}
        <div style={{ color: IVORY, fontSize: c.big ? 104 : 62, fontWeight: 800, letterSpacing: c.big ? 2 : 1.5, lineHeight: 1.04 }}>{c.title}</div>
        {c.sub ? <div style={{ color: accent, fontSize: 36, fontWeight: 700, letterSpacing: 3, marginTop: 10 }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Counter: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUE.sembilan || t >= CUE.satu - 0.05) return null;
  const n = Math.min(9, 1 + Math.floor((t - CUE.sembilan) / 0.19));
  const k = clamp01((t - CUE.sembilan) / 0.25) * clamp01((CUE.satu - 0.05 - t) / 0.2);
  const tick = clamp01(((t - CUE.sembilan) % 0.19) / 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center", fontFamily: FONT, opacity: k }}>
      <div style={{ background: PLATE, borderRadius: 18, padding: "10px 46px 18px", textAlign: "center", borderBottom: `8px solid ${GOLD}` }}>
        <div style={{ color: GOLD, fontSize: 180, fontWeight: 800, lineHeight: 1, transform: `scale(${1.08 - 0.08 * tick})` }}>{n}</div>
        <div style={{ color: IVORY, fontSize: 40, fontWeight: 700, letterSpacing: 5 }}>PEDANG PATAH</div>
      </div>
    </div>
  );
};

// ---- map labels -------------------------------------------------------------------------------
type Label = { text: string; at: [number, number]; lift?: number; late?: number; spans: [number, number][] };
const YORDAN = geo(35.55, 32.25);
const LABELS: Label[] = [
  { text: "MADINAH", at: MADINAH, lift: 0.5, spans: [[8.3, 17], [CUE.madinah, 61]] },
  { text: "MU'TAH", at: MUTAH, lift: 0.9, late: 2.3, spans: [[CUE.mutah, 17], [42, 47], [CUE.medan, 88]] },
  { text: "S. YORDAN", at: YORDAN, lift: 0.1, spans: [[CUE.yordan, 17]] },
  { text: "SYRIA", at: SYRIA, lift: 1.0, late: 2.3, spans: [[CUE.syria, 72], [CUE.jabatan, 88]] },
];
type Placed = { text: string; x: number; y: number; k: number; up: boolean; down: boolean };
// s7: top-down shots put Mu'tah high and Madinah below the frame; pin off-screen labels to the
// safe edge (below the HUD cards, above the karaoke) with a direction arrow, then push apart
// labels that would overlap (Mu'tah/S. Yordan at 13s, Mu'tah/Syria at 82-86s).
const placeLabels = (t: number, pose: Pose): Placed[] => {
  const out: Placed[] = [];
  for (const l of LABELS) {
    let k = 0;
    for (const [a, b] of l.spans) k = Math.max(k, clamp01((t - a) / 0.35) * clamp01((b - t) / 0.35));
    if (k <= 0.01) continue;
    const wy = SHEET_Y + hAt(l.at[0], l.at[1]) + (t >= CUE.medan && l.late ? l.late : (l.lift ?? 0.3));
    const p = project(pose, [l.at[0], wy, l.at[1]]);
    if (!p) continue;
    const up = p.y < 560 - 40, down = p.y > 1210 + 40;
    if ((up || down) && l.text === "S. YORDAN") continue; // river hint only when on screen
    out.push({ text: l.text, x: Math.min(880, Math.max(200, p.x)), y: Math.min(1210, Math.max(560, p.y)), k, up, down });
  }
  // s7: the withdrawal column is small in the 46-56 s crane; tag its head
  const cu = within(t, 46.3, 55.8);
  if (cu > 0.01) {
    const c = routeAt(columnU(t));
    const q = project(pose, [c.x, c.y + 0.9, c.z]);
    if (q && q.x > 120 && q.x < 960 && q.y > 560 && q.y < 1210) out.push({ text: "PASUKAN MUNDUR", x: Math.min(860, Math.max(220, q.x)), y: q.y, k: cu, up: false, down: false });
  }
  const W = (s: string) => s.length * 34 + 70;
  for (const L of out) L.x = Math.min(1040 - W(L.text) / 2, Math.max(40 + W(L.text) / 2, L.x)); // never cut by the frame edge
  for (let i = 1; i < out.length; i++) {
    for (let j = 0; j < i; j++) {
      const A = out[j], B = out[i];
      if (Math.abs(A.x - B.x) < (W(A.text) + W(B.text)) / 2 + 12 && Math.abs(A.y - B.y) < 96) {
        B.y = B.y <= 700 ? A.y + 104 : A.y - 104; // stack inside the safe band
      }
    }
  }
  return out;
};
const MapLabel: React.FC<{ l: Placed }> = ({ l }) => (
  <div style={{ position: "absolute", left: l.x, top: l.y, transform: "translate(-50%, -100%)", fontFamily: FONT, opacity: l.k, textAlign: "center" }}>
    <div style={{ background: "rgba(244,235,214,0.94)", color: "#2a1d12", fontSize: 46, fontWeight: 800, letterSpacing: 4, padding: "8px 22px", borderRadius: 10, border: `3px solid ${GOLD}`, whiteSpace: "nowrap", boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>
      {l.up ? "▲ " : ""}{l.text}{l.down ? " ▼" : ""}
    </div>
    {!l.down && !l.up && <div style={{ width: 4, height: 34, background: GOLD, margin: "0 auto" }} />}
  </div>
);

// ---- karaoke ---------------------------------------------------------------------------------
type Wd = { w: string; s: number; e: number };
const RAW = (WORDS as { text: string; start: number; end: number }[]).map((x) => ({ w: x.text, s: x.start, e: x.end }));
const MERGE: [string[], string][] = [
  [["enam", "ratus", "dua", "puluh", "sembilan"], "629"],
  [["enam", "ratus", "tiga", "puluh", "delapan,"], "638,"],
  [["tiga", "ribu"], "3.000"],
  [["Audira", "Qissah."], "AUDIRA QISSAH."],
];
const WORDS_D: Wd[] = (() => {
  const out: Wd[] = [];
  for (let i = 0; i < RAW.length; i++) {
    const m = MERGE.find(([seq]) => seq.every((s, j) => RAW[i + j] && RAW[i + j].w.toLowerCase() === s.toLowerCase()));
    if (m) {
      out.push({ w: m[1], s: RAW[i].s, e: RAW[i + m[0].length - 1].e });
      i += m[0].length - 1;
    } else out.push(RAW[i]);
  }
  return out;
})();
const chars = (g: Wd[]) => g.map((x) => x.w).join(" ").length;
const JOIN = new Set(["dan", "yang", "ke", "di", "dari", "dengan", "sebagai", "lalu", "atau", "tapi", "jadi", "bersama"]);
const splitLong = (g: Wd[]): Wd[][] => {
  if (g.length <= 6 && chars(g) <= 34) return [g];
  let best = Math.ceil(g.length / 2), bs = Infinity;
  for (let i = 2; i <= g.length - 2; i++) {
    const sc = Math.abs(chars(g.slice(0, i)) - chars(g.slice(i))) - (JOIN.has(g[i].w.toLowerCase()) ? 6 : 0);
    if (sc < bs) { bs = sc; best = i; }
  }
  return [...splitLong(g.slice(0, best)), ...splitLong(g.slice(best))];
};
type Chunk = { words: Wd[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const phrases: Wd[][] = [];
  let cur: Wd[] = [];
  for (const w of WORDS_D) {
    cur.push(w);
    if (/[.,?!:]$/.test(w.w)) { phrases.push(cur); cur = []; }
  }
  if (cur.length) phrases.push(cur);
  // no orphan: a one-word phrase joins its neighbour when the result still fits
  for (let i = 0; i < phrases.length; i++) {
    if (phrases[i].length !== 1) continue;
    const nx = phrases[i + 1], pv = phrases[i - 1];
    if (nx && chars([...phrases[i], ...nx]) <= 34 && nx.length < 6) { phrases[i + 1] = [...phrases[i], ...nx]; phrases.splice(i, 1); i = -1; }
    else if (pv && chars([...pv, ...phrases[i]]) <= 34 && pv.length < 6) { phrases[i - 1] = [...pv, ...phrases[i]]; phrases.splice(i, 1); i = -1; }
  }
  const groups = phrases.flatMap(splitLong);
  return groups.map((g, i) => {
    const nx = groups[i + 1];
    const last = g[g.length - 1].e;
    return { words: g, a: g[0].s - 0.1, b: nx ? Math.min(nx[0].s - 0.1, last + 0.9) : last + 0.5 };
  });
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = clamp01((t - c.a) / 0.1);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1270, display: "flex", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ background: "rgba(18,22,30,0.88)", borderRadius: 18, padding: "14px 30px", maxWidth: 940, textAlign: "center", textWrap: "balance", boxShadow: "0 12px 30px rgba(0,0,0,0.4)", transform: `translateY(${(1 - k) * 6}px)` }}>
        {c.words.map((w, i) => {
          const active = t >= w.s - 0.04 && t < w.e + 0.06;
          const said = t >= w.e;
          const bounce = active ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span key={i} style={{ display: "inline-block", fontSize: 56, fontWeight: 700, lineHeight: 1.22, margin: "0 0.21em", color: active ? GOLD : said ? IVORY : "rgba(244,235,214,0.66)", transform: `scale(${bounce})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Hud: React.FC<{ t: number; pose: Pose; cover?: boolean }> = ({ t, pose, cover }) => {
  if (cover) {
    return (
      <div style={{ position: "absolute", left: 70, right: 70, top: 260, fontFamily: FONT }}>
        <div style={{ color: GOLD, fontSize: 44, fontWeight: 800, letterSpacing: 8 }}>MU'TAH · 629 M</div>
        <div style={{ color: IVORY, fontSize: 118, fontWeight: 800, lineHeight: 1.0, marginTop: 12, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>KETIKA KHALID MEMILIH MUNDUR</div>
      </div>
    );
  }
  if (t >= CUE.outro) return null;
  const i = CARDS.findIndex((c, j) => t >= c.a && t < cardEnd(j));
  return (
    <>
      {placeLabels(t, pose).map((l) => <MapLabel key={l.text} l={l} />)}
      {i >= 0 && !(t >= CUE.sembilan && t < CUE.satu) ? <CardView c={CARDS[i]} t={t} end={cardEnd(i)} /> : null}
      <Counter t={t} />
      <Captions t={t} />
    </>
  );
};
