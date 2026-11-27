// EP22 HUD (1080x1920 layout px): one data card at a time under the top safe zone, map labels
// pinned to world points, the four-landmark ruin strip, the Abbasid era bar, karaoke captions.
import React from "react";
import { BookOpen, Crown, Landmark, Stethoscope, type LucideIcon } from "../../core/icons/index.ts";
import { FONT } from "../../core/type/fonts.ts";
import WORDS from "../../../public/audio/vo-words.json";
import { CITY } from "./City.tsx";
import { CUE } from "./cues.ts";
import { HAMADAN, geo } from "./geo.ts";
import { project, type Pose } from "./rig.ts";
import { clamp01, easeOutBack, ss } from "./timing.ts";
import { SHEET_Y, hAt } from "./World.tsx";
const within = (t: number, a: number, b: number) => clamp01((t - a) / 0.35) * clamp01((b - t) / 0.35);

const GOLD = "#E8B84A";
const IVORY = "#F4EBD6";
const RED = "#D8443A";
const PLATE = "rgba(20,24,32,0.9)";

type Card = { a: number; b?: number; title: string; sub?: string; big?: boolean; warn?: boolean };
const CARDS: Card[] = [
  { a: 0.05, b: 6.4, title: "1258", sub: "BAGDAD · IBU KOTA DUNIA ISLAM", big: true },
  { a: CUE.jatuh, b: 8.95, title: "JATUH DALAM HITUNGAN HARI" },
  { a: CUE.khalifah0, b: 11.0, title: "KHALIFAH TERAKHIR", sub: "TIDAK SELAMAT" },
  { a: CUE.audira, b: 14.4, title: "AUDIRA QISSAH" },
  { a: CUE.abbasiyah, title: "ABBASIYAH · IBU KOTA" },
  { a: CUE.mustasim, title: "AL-MUSTA'SIM", sub: "KHALIFAH KE-37" },
  { a: CUE.timur, b: 23.8, title: "MONGOL · HULAGU", sub: "DATANG DARI TIMUR" },
  { a: CUE.pesan, title: "PESAN HULAGU" },
  { a: CUE.tunduk, title: "TUNDUK ATAU HANCUR", big: true },
  { a: CUE.menolak, title: "KHALIFAH MENOLAK" },
  { a: CUE.takDatang, b: 34.5, title: "BANTUAN TAK PERNAH DATANG" },
  { a: CUE.januari, title: "AKHIR JANUARI 1258" },
  { a: CUE.mengepung, title: "DIKEPUNG DARI 2 TEPI TIGRIS" },
  { a: CUE.tanggul, title: "TANGGUL DIJEBOL", sub: "PASUKAN BAGDAD TERJEBAK BANJIR" },
  { a: CUE.feb10, title: "10 FEBRUARI 1258", big: true },
  { a: CUE.tigaRibu, b: 45.8, title: "±3.000 TOKOH KOTA", sub: "MENYERAH BERSAMA KHALIFAH" },
  { a: CUE.masuk, title: "13 FEB · MONGOL MASUK" },
  { a: CUE.sepekan, b: CUE.masjid - 0.05, title: "SEPEKAN DIJARAH" },
  // CUE.masjid .. korban: RuinStrip
  { a: CUE.korban, b: 59.9, title: "RATUSAN RIBU – 2 JUTA JIWA", sub: "PERKIRAAN · ANGKA PASTI TAK DIKETAHUI" },
  { a: CUE.feb20, title: "20 FEBRUARI 1258", big: true },
  { a: CUE.dieksekusi, title: "KHALIFAH DIEKSEKUSI" },
  { a: CUE.karpet, b: 66.2, title: "DIGULUNG DALAM KARPET", sub: "MONGOL PANTANG MENUMPAHKAN DARAH RAJA" },
  // CUE.limaAbad .. 68.7: EraBar
  { a: CUE.konon, title: "KONON: TIGRIS MENGHITAM", sub: "OLEH TINTA BUKU" },
  { a: CUE.biran, title: "GAMBARAN SASTRA", sub: "SEJARAWAN MICHAL BIRAN" },
  { a: CUE.dibuka, title: "DIBUKA LAGI DALAM 2 TAHUN", sub: "PERPUSTAKAAN BESAR BAGDAD" },
  { a: CUE.kotaHancur, b: 78.7, title: "KOTA HANCUR" },
  { a: 78.75, b: 81.6, title: "ILMU TIDAK PADAM", big: true },
  { a: CUE.aliImran, b: 87.2, title: "QS ALI IMRAN 3:140", sub: "“…MASA (KEJAYAAN DAN KEHANCURAN) ITU KAMI PERGILIRKAN DI ANTARA MANUSIA”" },
  { a: CUE.kejayaan, b: 91.8, title: "KEJAYAAN BISA RUNTUH", sub: "SAAT UMAT LENGAH DAN TERPECAH" },
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

// ---- s5 ruin strip: four landmarks, each struck through on its VO word --------------------------
const RUINS: { icon: LucideIcon; name: string; at: number }[] = [
  { icon: Landmark, name: "MASJID", at: CUE.masjid },
  { icon: Crown, name: "ISTANA", at: CUE.istana },
  { icon: BookOpen, name: "PERPUSTAKAAN", at: CUE.perpus },
  { icon: Stethoscope, name: "RUMAH SAKIT", at: CUE.rs },
];
const RuinStrip: React.FC<{ t: number }> = ({ t }) => {
  const k = within(t, CUE.masjid - 0.1, CUE.korban - 0.05);
  if (k <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 250, display: "flex", justifyContent: "center", fontFamily: FONT, opacity: k }}>
      <div style={{ background: PLATE, borderRadius: 16, padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", width: 940, borderBottom: `8px solid ${RED}`,boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
        {RUINS.map((r, i) => {
          const pop = easeOutBack(clamp01((t - r.at + 0.25) / 0.3));
          const strike = clamp01((t - r.at - 0.1) / 0.35);
          const Icon = r.icon;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", opacity: Math.max(0.3, clamp01((t - r.at + 0.25) / 0.2)), transform: `scale(${0.85 + 0.15 * pop})` }}>
              <Icon size={84} strokeWidth={2} color={strike > 0.5 ? "rgba(244,235,214,0.85)" : GOLD} />
              <div style={{ color: IVORY, fontSize: 46, fontWeight: 800, letterSpacing: 0, whiteSpace: "nowrap" }}>{r.name}</div>
              <div style={{ position: "absolute", left: 0, top: 40, height: 8, width: `${strike * 100}%`,background: RED, borderRadius: 4 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- s6 era bar: 750 -> 1258, cracks and goes dark on "berakhir" ---------------------------------
const EraBar: React.FC<{ t: number }> = ({ t }) => {
  const k = within(t, CUE.limaAbad - 0.1, 68.7);
  if (k <= 0.01) return null;
  const fill = ss(CUE.limaAbad, CUE.limaAbad + 1.0, t);
  const off = ss(CUE.berakhir, CUE.berakhir + 0.5, t);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 250, fontFamily: FONT, opacity: k }}>
      <div style={{ background: PLATE, borderRadius: 16, padding: "24px 40px 26px", borderLeft: `12px solid ${GOLD}`, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: IVORY, fontSize: 64, fontWeight: 800 }}>
          <span>750</span>
          <span style={{ color: off > 0.5 ? RED : IVORY }}>1258</span>
        </div>
        <div style={{ position: "relative", height: 34, marginTop: 12, background: "rgba(244,235,214,0.12)", borderRadius: 17, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: GOLD, opacity: 1 - 0.8 * off, boxShadow: `0 0 ${24 * (1 - off)}px ${GOLD}` }} />
          {off > 0.01 ? <div style={{ position: "absolute", left: "62%", top: -4, width: 8, height: 42, background: PLATE, transform: `rotate(${18 * off}deg)` }} /> : null}
        </div>
        <div style={{ color: GOLD, fontSize: 38, fontWeight: 700, letterSpacing: 3, marginTop: 14 }}>{off > 0.5 ? "KEKHALIFAHAN ABBASIYAH BERAKHIR" : "LIMA ABAD ABBASIYAH"}</div>
      </div>
    </div>
  );
};

// ---- map labels -------------------------------------------------------------------------------
type Label = { text: string; at: [number, number]; lift?: number; spans: [number, number][] };
const TIGRIS_N = geo(44.0, 34.0);
const LABELS: Label[] = [
  { text: "BAGDAD", at: CITY, lift: 0.5, spans: [[11.7, 23.6], [36.3, 45.3], [82.5, 91.8]] },
  { text: "S. TIGRIS", at: TIGRIS_N, lift: 0.1, spans: [[CUE.bagdad1, 20.5], [CUE.tigris - 0.2, 40.5]] },
  { text: "HAMADAN · PERSIA", at: HAMADAN, lift: 0.5, spans: [[CUE.timur - 0.4, 24.4]] },
];
type Placed = { text: string; x: number; y: number; k: number; up: boolean; down: boolean };
// off-screen labels pin to the safe band (below the cards, above the karaoke) with an arrow,
// then labels that would overlap stack inside the band.
const placeLabels = (t: number, pose: Pose): Placed[] => {
  const out: Placed[] = [];
  for (const l of LABELS) {
    let k = 0;
    for (const [a, b] of l.spans) k = Math.max(k, within(t, a, b));
    if (k <= 0.01) continue;
    const wy = SHEET_Y + hAt(l.at[0], l.at[1]) + (l.lift ?? 0.3);
    const p = project(pose, [l.at[0], wy, l.at[1]]);
    if (!p) continue;
    const up = p.y < 560 - 40, down = p.y > 1210 + 40;
    if ((up || down) && l.text === "S. TIGRIS") continue; // river hint only when on screen
    out.push({ text: l.text, x: Math.min(880, Math.max(200, p.x)), y: Math.min(1210, Math.max(560, p.y)), k, up, down });
  }
  const W = (s: string) => s.length * 34 + 70;
  for (const L of out) L.x = Math.min(1040 - W(L.text) / 2, Math.max(40 + W(L.text) / 2, L.x)); // never cut by the frame edge
  for (let i = 1; i < out.length; i++) {
    for (let j = 0; j < i; j++) {
      const A = out[j], B = out[i];
      if (Math.abs(A.x - B.x) < (W(A.text) + W(B.text)) / 2 + 12 && Math.abs(A.y - B.y) < 96) {
        B.y = B.y <= 700 ? A.y + 104 : A.y - 104;
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
  [["seribu", "dua", "ratus", "lima", "puluh", "delapan."], "1258."],
  [["ke", "tiga", "puluh", "tujuh."], "ke-37."],
  [["tiga", "ribu"], "3.000"],
  [["seratus", "empat", "puluh:"], "140:"],
  [["Sepuluh"], "10"],
  [["Dua", "puluh"], "20"],
  [["dua", "juta"], "2 juta"],
  [["Audira,"], "AUDIRA,"],
  [["Audira"], "AUDIRA"],
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
        <div style={{ color: GOLD, fontSize: 44, fontWeight: 800, letterSpacing: 8 }}>BAGDAD · 1258 M</div>
        <div style={{ color: IVORY, fontSize: 112, fontWeight: 800, lineHeight: 1.0, marginTop: 12, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>SAAT MONGOL MENGHANCURKAN BAGDAD</div>
      </div>
    );
  }
  if (t >= CUE.outro) return null;
  const i = CARDS.findIndex((c, j) => t >= c.a && t < cardEnd(j));
  return (
    <>
      {placeLabels(t, pose).map((l) => <MapLabel key={l.text} l={l} />)}
      {i >= 0 ? <CardView c={CARDS[i]} t={t} end={cardEnd(i)} /> : null}
      <RuinStrip t={t} />
      <EraBar t={t} />
      <Captions t={t} />
    </>
  );
};
