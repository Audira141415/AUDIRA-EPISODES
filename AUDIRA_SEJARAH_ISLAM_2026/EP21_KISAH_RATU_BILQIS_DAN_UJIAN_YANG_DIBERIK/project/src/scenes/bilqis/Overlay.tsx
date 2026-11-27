// EP21 2D layers over the 3D world: cover title, world-pinned labels (projected with the film
// camera, only while their set is on screen), HUD cards, quote cards and karaoke captions.
// Layout units 1080 × 1920, scaled to the render size.
// Labels, verses and quotes come only from the script / SOURCE_REGISTER (QS An-Naml 27:20–44,
// Ibnu Abbas and Ibnu Katsir via Tafsir Ibnu Katsir).

import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { useFormat } from "../../core/film/format.ts";
import { U } from "./world.tsx";
import { BILQIS_HOOK, COUNCIL, NOBLE_SLOTS, THRONE_HALL, BILQIS_HALL, BILQIS_HALLWAY, hallState, corridorState } from "./SetsHall.tsx";
import { SABA, CAMP, TEMPLE, DESERT, HILL, caravanAt, throneStreak, hudhudTemple, raised } from "./SetsOut.tsx";
import { TIMELINE, W, WL, LS, OUTRO_AT, ramp, win, type Word } from "./time.ts";
import { veilAt, setAt, CUTS, type Cam, type SetId } from "./camera.ts";

type V3 = [number, number, number];
const LW = 1080, LH = 1920;

/** Project a world point with the film camera into layout pixels (null if behind the camera). */
function project(cam: Cam, p: V3): { x: number; y: number } | null {
  const f = [cam.target[0] - cam.pos[0], cam.target[1] - cam.pos[1], cam.target[2] - cam.pos[2]];
  const fl = Math.hypot(f[0], f[1], f[2]);
  const fw = [f[0] / fl, f[1] / fl, f[2] / fl];
  let r = [-fw[2], 0, fw[0]];
  const rl = Math.hypot(r[0], r[1], r[2]);
  r = [r[0] / rl, r[1] / rl, r[2] / rl];
  const u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]];
  const d = [p[0] - cam.pos[0], p[1] - cam.pos[1], p[2] - cam.pos[2]];
  const zc = d[0] * fw[0] + d[1] * fw[1] + d[2] * fw[2];
  if (zc < 0.15) return null;
  const xc = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
  const yc = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
  const th = Math.tan((cam.fov * Math.PI) / 360);
  const nx = xc / (zc * th * (LW / LH));
  const ny = yc / (zc * th);
  return { x: ((nx + 1) / 2) * LW, y: ((1 - ny) / 2) * LH };
}

const PIX = "MM Pixel";
const DISPLAY = "MM Anton";
const BODY = "MM Grotesk";
const GOLD = U.gold;

type PinDef = { id: string; set: SetId; text: string; sub?: string; at: (t: number) => V3; a: number; b: number; color?: string; up?: number; size?: number; minY?: number };


const PINS: PinDef[] = [
  { id: "lantai", set: "glassHook", text: "LANTAI ISTANA", at: () => [0.45, 0.02, BILQIS_HOOK[2] - 0.6], a: W("lantai") - 0.1, b: W("menyingkap") - 0.1, up: 120, minY: 760 },
  { id: "bilqis", set: "saba", text: "BILQIS", sub: "RATU NEGERI SABA", at: () => [SABA.queen[0], SABA.queen[1] + 0.62, SABA.queen[2]], a: W("bilqis") - 0.2, b: LS("l05") - 0.1, up: 120 },
  { id: "sulaiman", set: "camp", text: "NABI SULAIMAN", at: () => [CAMP.sulaiman[0], 0.5, CAMP.sulaiman[2]], a: W("sulaiman") - 0.1, b: W("hud-hud") - 0.1, up: 110 },
  { id: "celah", set: "camp", text: "HUD-HUD?", color: "#FF8A2A", at: () => [CAMP.gapX, CAMP.perchY + 0.14, CAMP.perchZ], a: W("hud-hud") - 0.1, b: CUTS[2], up: 130 },
  { id: "hudhud", set: "temple", text: "HUD-HUD", sub: "MEMBAWA KABAR", color: "#FF8A2A", at: (t) => hudhudTemple(t).p, a: WL("l09", "membawa") - 0.2, b: WL("l09", "seorang") - 0.1, up: 110 },
  { id: "kaum", set: "temple", text: "RATU & KAUMNYA", at: () => [TEMPLE.queen[0], 0.6, TEMPLE.queen[2]], a: WL("l09", "seorang") - 0.1, b: CUTS[3], up: 110, minY: 760 },
  { id: "surat", set: "majelis", text: "SURAT SULAIMAN", at: () => [COUNCIL.table[0], COUNCIL.top + 0.04, COUNCIL.table[2]], a: W("surat") - 0.2, b: LS("l12") - 0.1, up: 150 },
  { id: "pembesar", set: "majelis", text: "PARA PEMBESAR", at: () => [NOBLE_SLOTS[1][0], 0.62, NOBLE_SLOTS[1][2]], a: W("pembesar") - 0.2, b: W("tetapi") - 0.1, up: 110 },
  { id: "ratu", set: "majelis", text: "BILQIS", at: () => [COUNCIL.queen[0], COUNCIL.queen[1] + 0.55, COUNCIL.queen[2]], a: W("tetapi") - 0.1, b: CUTS[4], up: 100 },
  { id: "hadiah", set: "desert", text: "HADIAH BILQIS", at: (t) => { const c = caravanAt(t); return [c.x - (c.back ? -1 : 1) * 2.4, 0.4, -0.55]; }, a: CUTS[4] + 0.2, b: LS("l16") - 0.1, up: 120 },
  { id: "istana", set: "desert", text: "ISTANA SULAIMAN", at: () => [DESERT.palace[0], 2.4, DESERT.palace[2]], a: LS("l16") - 0.1, b: W("sebelum", 2) - 0.1, up: 90, minY: 640 },
  { id: "singgasana", set: "hall", text: "SINGGASANA BILQIS", at: () => [THRONE_HALL[0], THRONE_HALL[1] + 0.85, THRONE_HALL[2]], a: W("tiba", 2) + 0.4, b: W("ditanya") - 0.1, up: 110 },
  { id: "bilqisHall", set: "hall", text: "BILQIS", at: () => [BILQIS_HALL[0], 0.62, BILQIS_HALL[2]], a: W("ditanya") - 0.1, b: W("seakan-akan") - 0.2, up: 100 },
  { id: "lorong", set: "glassWide", text: "BILQIS", sub: "MASUK ISTANA", at: () => [BILQIS_HALLWAY.a[0], 0.62, BILQIS_HALLWAY.a[2]], a: LS("l23") - 0.1, b: LS("l24") - 0.4, up: 110 },
  { id: "pasrah", set: "hill", text: "BILQIS", sub: "BERSERAH DIRI", at: () => [HILL.queen[0], 0.62, HILL.queen[2]], a: W("berserah") - 0.1, b: LS("l28") - 0.1, up: 110 },
  { id: "sulaimanHill", set: "hill", text: "NABI SULAIMAN", at: () => [HILL.sulaiman[0], 0.48, HILL.sulaiman[2]], a: WL("l27", "sulaiman") - 0.2, b: LS("l28") - 0.1, up: 90 },
];

const Chip: React.FC<{ text: string; sub?: string; color?: string; s: number; alpha: number; size?: number }> = ({ text, sub, color = GOLD, s, alpha, size = 44 }) => (
  <div
    style={{
      opacity: alpha,
      transform: `translateY(${(1 - alpha) * 10 * s}px)`,
      background: "#0E0A18",
      border: `${3 * s}px solid ${color}`,
      boxShadow: `${5 * s}px ${5 * s}px 0 rgba(0,0,0,0.55)`,
      padding: `${8 * s}px ${14 * s}px`,
      maxWidth: 880 * s,
      textAlign: "center",
    }}
  >
    <div style={{ fontFamily: PIX, fontSize: size * s, letterSpacing: 1.5 * s, color, lineHeight: 1.15 }}>{text}</div>
    {sub && <div style={{ fontFamily: PIX, fontSize: 36 * s, letterSpacing: 1 * s, color: "#EDE3CF", marginTop: 4 * s }}>{sub}</div>}
  </div>
);

const Pins: React.FC<{ t: number; cam: Cam; s: number }> = ({ t, cam, s }) => {
  const set = setAt(t);
  return (
    <>
      {PINS.map((p) => {
        if (p.set !== set) return null;
        const alpha = win(t, p.a, p.b, 0.3, 0.3);
        if (alpha <= 0.001) return null;
        const q = project(cam, p.at(t));
        if (!q) return null;
        const up = p.up ?? 110;
        const color = p.color ?? GOLD;
        const longest = Math.max(p.text.length * ((p.size ?? 44) / 44), (p.sub?.length ?? 0) * (36 / 44));
        const halfW = Math.min(880, longest * 44 * 0.92 + 44) / 2;
        // chips stay >= 64 px from the frame edges and inside the safe band
        const cx = Math.max(64 + halfW, Math.min(1016 - halfW, q.x));
        const cy = Math.max(p.minY ?? 600, Math.min(1240, q.y - up));
        const dotIn = q.y > 240 && q.y < 1500 && q.x > 40 && q.x < LW - 40;
        if (!dotIn) return null;
        return (
          <React.Fragment key={p.id}>
            <svg style={{ position: "absolute", left: 0, top: 0, opacity: alpha }} width={LW * s} height={LH * s}>
              <line x1={q.x * s} y1={q.y * s} x2={cx * s} y2={(cy + 20) * s} stroke={color} strokeWidth={3 * s} />
            </svg>
            <div style={{ position: "absolute", left: (q.x - 9) * s, top: (q.y - 9) * s, width: 18 * s, height: 18 * s, background: color, border: `${3 * s}px solid #120C08`, opacity: alpha }} />
            <div style={{ position: "absolute", left: (cx - halfW) * s, width: halfW * 2 * s, top: cy * s, transform: "translateY(-100%)", display: "flex", justifyContent: "center" }}>
              <Chip text={p.text} sub={p.sub} color={color} s={s} alpha={alpha} size={p.size} />
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Top-left HUD cards and centred quote cards, all below the 236 px top safe line. */
const Hud: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const card = (key: string, alpha: number, children: React.ReactNode, top = 300) =>
    alpha > 0.001 && (
      <div
        key={key}
        style={{
          position: "absolute",
          left: 72 * s,
          top: top * s,
          opacity: alpha,
          transform: `translateX(${(1 - alpha) * -30 * s}px)`,
          background: "rgba(14,10,24,0.88)",
          borderLeft: `${10 * s}px solid ${GOLD}`,
          boxShadow: `${6 * s}px ${6 * s}px 0 rgba(0,0,0,0.5)`,
          padding: `${14 * s}px ${24 * s}px`,
          maxWidth: 900 * s,
        }}
      >
        {children}
      </div>
    );
  const quote = (key: string, alpha: number, kick: string, lines: string[], color = "#FFF6E4") =>
    alpha > 0.001 && (
      <div key={key} style={{ position: "absolute", left: 72 * s, right: 72 * s, top: 300 * s, opacity: alpha, transform: `scale(${0.96 + 0.04 * alpha})`, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "rgba(14,10,24,0.9)", border: `${3 * s}px solid ${GOLD}`, boxShadow: `${8 * s}px ${8 * s}px 0 rgba(0,0,0,0.5)`, padding: `${18 * s}px ${30 * s}px ${22 * s}px`, textAlign: "center" }}>
          <div style={{ fontFamily: PIX, fontSize: 36 * s, color: GOLD, letterSpacing: 1.5 * s }}>{kick}</div>
          {lines.map((l, i) => (
            <div key={i} style={{ fontFamily: DISPLAY, fontSize: 76 * s, color, lineHeight: 1.08, letterSpacing: 0.5 * s }}>{l}</div>
          ))}
        </div>
      </div>
    );
  const kicker = (txt: string) => <div style={{ fontFamily: PIX, fontSize: 38 * s, color: GOLD, letterSpacing: 1.5 * s }}>{txt}</div>;
  const big = (txt: string, color = "#FFF6E4", size = 92) => <div style={{ fontFamily: DISPLAY, fontSize: size * s, color, lineHeight: 1.05, letterSpacing: 1 * s }}>{txt}</div>;
  const center = (key: string, alpha: number, kick: string | null, body: React.ReactNode, top = 330) =>
    alpha > 0.001 && (
      <div key={key} style={{ position: "absolute", left: 0, right: 0, top: top * s, opacity: alpha, textAlign: "center", transform: `scale(${0.9 + 0.1 * alpha})` }}>
        {kick && <div style={{ display: "inline-block", fontFamily: PIX, fontSize: 38 * s, color: GOLD, letterSpacing: 2 * s, background: "rgba(14,10,24,0.85)", padding: `${6 * s}px ${16 * s}px`, marginBottom: 10 * s }}>{kick}</div>}
        {body}
      </div>
    );
  const giant = (txt: React.ReactNode, color = "#FFF6E4", size = 170) => (
    <div style={{ fontFamily: DISPLAY, fontSize: size * s, color, lineHeight: 1.12, textShadow: `0 ${8 * s}px 0 #1A1230, 0 0 ${50 * s}px rgba(120,190,255,0.35)` }}>{txt}</div>
  );
  const hs = hallState(t);
  const cs = corridorState(t);
  const st = throneStreak(t);
  return (
    <>
      {/* glassHook */}
      {center("kolam", win(t, W("kolam") - 0.15, W("salah") - 0.05, 0.2, 0.15), "IA MENGIRA", giant("KOLAM?", "#BFE6FF", 200))}
      {center("salah", win(t, W("salah") - 0.05, CUTS[0], 0.12, 0.3), null, giant(<>SALAH <span style={{ color: "#FF7A5C" }}>ARAH</span></>, "#FFF6E4", 190))}
      {/* saba */}
      {card("nama", win(t, W("nama") - 0.15, LS("l05") - 0.05), <>{kicker("BILQIS")}{big("NAMA DARI RIWAYAT ULAMA", "#FFF6E4", 64)}</>)}
      {quote("q23", win(t, LS("l05") - 0.15, LS("l06") - 0.05), "AL-QURAN · QS AN-NAML 27:23", ["“PEREMPUAN YANG", "MEMERINTAH MEREKA”"])}
      {card("naml", win(t, LS("l06") - 0.15, LS("l07") - 0.05), <>{kicker("SURAH AN-NAML")}{big("QS 27:20–44", GOLD, 104)}</>)}
      {card("audira", win(t, LS("l07") - 0.15, CUTS[1]), <>{kicker("KISAH DI AUDIRA")}{big("UJIAN SANG RATU", "#FFF6E4", 84)}</>)}
      {/* camp */}
      {card("periksa", win(t, LS("l08") - 0.1, W("hud-hud") - 0.05), <>{kicker("NABI SULAIMAN")}{big("MEMERIKSA BURUNG", "#FFF6E4", 76)}</>)}
      {card("absen", win(t, W("hud-hud") - 0.05, CUTS[2]), <>{kicker("HUD-HUD")}{big("TIDAK ADA", "#FF7A5C", 120)}</>)}
      {/* temple */}
      {card("kabar", win(t, CUTS[2] + 0.15, WL("l09", "menyembah") - 0.05), <>{kicker("QS AN-NAML 27:22–24")}{big("KABAR DARI SABA", "#FFF6E4", 80)}{t > WL("l09", "perempuan") - 0.2 && <div style={{ fontFamily: PIX, fontSize: 40 * s, color: GOLD, opacity: ramp(t, WL("l09", "perempuan") - 0.2, WL("l09", "perempuan") + 0.2) }}>SEORANG PEREMPUAN MEMIMPIN</div>}</>)}
      {card("matahari", win(t, WL("l09", "menyembah") - 0.05, CUTS[3]), <>{kicker("KAUMNYA")}{big("MENYEMBAH MATAHARI", "#FFB347", 78)}{t > WL("l09", "bukan") - 0.2 && <div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#1A0806", background: "#FF7A5C", padding: `${4 * s}px ${10 * s}px`, display: "inline-block", opacity: ramp(t, WL("l09", "bukan") - 0.2, WL("l09", "bukan") + 0.15) }}>BUKAN ALLAH</div>}</>)}
      {/* majelis */}
      {card("surat", win(t, W("surat") - 0.15, LS("l11") - 0.05), <>{kicker("QS AN-NAML 27:30")}{big("SURAT SULAIMAN", "#FFF6E4", 84)}<div style={{ fontFamily: PIX, fontSize: 40 * s, color: GOLD }}>DIBUKA DENGAN NAMA ALLAH</div></>)}
      {card("musyawarah", win(t, LS("l11") - 0.1, W("para") - 0.05), <>{kicker("BILQIS TIDAK LANGSUNG MELAWAN")}{big("BERMUSYAWARAH", GOLD, 104)}</>)}
      {(() => {
        const a = win(t, W("para") - 0.1, CUTS[4], 0.25, 0.3);
        if (a <= 0.001) return null;
        const strike = ramp(t, W("hadiah") - 0.2, W("hadiah") + 0.15);
        const gift = ramp(t, W("hadiah") - 0.2, W("hadiah") + 0.2);
        const dec = ramp(t, W("keputusan") - 0.2, W("keputusan") + 0.2);
        const opt = (label: string, k: number, on: string, off: string, struck: number) => (
          <div style={{ position: "relative", fontFamily: DISPLAY, fontSize: 104 * s, color: k > 0.5 ? on : off, padding: `${6 * s}px ${24 * s}px`, border: `${4 * s}px solid ${k > 0.5 ? on : "rgba(255,246,228,0.35)"}`, background: "rgba(14,10,24,0.88)", boxShadow: k > 0.5 ? `0 0 ${40 * s}px rgba(240,185,62,${0.5 * k})` : "none" }}>
            {label}
            {struck > 0.001 && <div style={{ position: "absolute", left: 10 * s, top: "52%", height: 10 * s, width: `calc(${struck * 100}% - ${20 * s}px)`, background: "#FF5A3C" }} />}
          </div>
        );
        return (
          <div style={{ position: "absolute", left: 0, right: 0, top: 300 * s, opacity: a, textAlign: "center" }}>
            <div style={{ display: "inline-block", fontFamily: PIX, fontSize: 38 * s, color: GOLD, letterSpacing: 2 * s, background: "rgba(14,10,24,0.85)", padding: `${6 * s}px ${16 * s}px` }}>QS AN-NAML 27:32–35</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 36 * s, marginTop: 18 * s }}>
              {opt("PERANG", 1 - strike, "#FF7A5C", "rgba(255,246,228,0.55)", strike)}
              {opt("HADIAH", gift, GOLD, "rgba(255,246,228,0.55)", 0)}
            </div>
            {dec > 0.001 && <div style={{ marginTop: 16 * s, display: "inline-block", fontFamily: PIX, fontSize: 40 * s, color: "#EDE3CF", background: "rgba(14,10,24,0.85)", padding: `${6 * s}px ${14 * s}px`, opacity: dec }}>KEPUTUSAN DI TANGAN RATU</div>}
          </div>
        );
      })()}
      {/* desert */}
      {card("ditolak", win(t, W("menolak") - 0.15, LS("l16") - 0.05), <>{kicker("SULAIMAN")}{big("HADIAH DITOLAK", "#FF7A5C", 92)}</>)}
      {quote("q38", win(t, LS("l16") - 0.15, LS("l17") - 0.05), "QS AN-NAML 27:38", ["“SIAPA SANGGUP", "MEMBAWA SINGGASANANYA?”"])}
      {card("ilmu", win(t, LS("l17") - 0.1, W("sebelum", 2) - 0.05), <>{kicker("QS AN-NAML 27:40")}{big("ORANG BERILMU", "#FFF6E4", 84)}{big("DARI KITAB", GOLD, 84)}</>)}
      {center("kedip", win(t, W("sebelum", 2) - 0.1, CUTS[5], 0.15, 0.2), "QS AN-NAML 27:40", <>
        {giant("SEBELUM", "#FFF6E4", 132)}
        {giant("MATAMU", GOLD, 132)}
        {giant(<span style={{ opacity: 0.25 + 0.75 * (1 - st.flash) }}>BERKEDIP</span>, "#FFF6E4", 132)}
      </>, 300)}
      {/* hall */}
      {center("tiba", win(t, W("tiba", 2) - 0.05, LS("l19") - 0.05, 0.1, 0.25), "SINGGASANA ITU", giant("TIBA", GOLD, 210), 320)}
      {card("samar", win(t, W("disamarkan") - 0.1, LS("l20") - 0.05), <>{kicker("LALU")}{big("DISAMARKAN", "#7FB4FF", 104)}{hs.disguise > 0.001 && <div style={{ height: 8 * s, width: `${hs.disguise * 100}%`, background: "linear-gradient(90deg,#8A1E34,#1E4A8A)", marginTop: 6 * s }} />}</>)}
      {card("abbas", win(t, LS("l20") - 0.1, LS("l21") - 0.05), <>{kicker("MENURUT IBNU ABBAS")}{big("SEBAGIAN HIASAN", "#FFF6E4", 80)}{big("DICOPOT", "#FF7A5C", 80)}</>)}
      {quote("q42a", win(t, LS("l21") - 0.1, W("seakan-akan") - 0.1), "QS AN-NAML 27:42", ["“SERUPA INIKAH", "SINGGASANAMU?”"])}
      {quote("q42b", win(t, W("seakan-akan") - 0.1, LS("l22") - 0.05), "JAWABAN BILQIS · QS 27:42", ["“SEAKAN-AKAN", "ITULAH DIA”"], GOLD)}
      {card("cerdas", win(t, LS("l22") - 0.1, CUTS[6]), <>{kicker("IBNU KATSIR")}{big("JAWABAN YANG CERDAS", GOLD, 80)}</>)}
      {/* glassWide */}
      {card("masuk", win(t, CUTS[6] + 0.1, LS("l24") - 0.4), <>{kicker("QS AN-NAML 27:44")}{big("DIMINTA MASUK ISTANA", "#FFF6E4", 74)}</>)}
      {center("kolam2", win(t, LS("l24") - 0.1, LS("l25") - 0.1, 0.2, 0.2), "LANTAINYA SEPERTI", giant("KOLAM", "#BFE6FF", 190))}
      {center("kaca", win(t, LS("l25") - 0.1, CUTS[7], 0.2, 0.3), "SULAIMAN · QS AN-NAML 27:44", <>
        {giant(<>BUKAN <span style={{ color: "#BFE6FF" }}>AIR</span></>, "#FFF6E4", 160)}
        {t > W("kaca") - 0.3 && <div style={{ opacity: ramp(t, W("kaca") - 0.3, W("kaca") + 0.1) }}>{giant("KACA", GOLD, 200 + 20 * cs.lit)}</div>}
      </>)}
      {/* hill */}
      {quote("q44a", win(t, W("ya") - 0.2, LS("l27") - 0.05), "BILQIS · QS AN-NAML 27:44", ["“AKU TELAH", "MENZALIMI DIRIKU”"])}
      {quote("q44b", win(t, LS("l27") - 0.1, LS("l28") - 0.05), "QS AN-NAML 27:44", ["“AKU BERSERAH DIRI", "BERSAMA SULAIMAN", "KEPADA ALLAH,", "TUHAN SELURUH ALAM”"], raised(t) ? GOLD : "#FFF6E4")}
      {card("sujud", win(t, LS("l28") - 0.1, LS("l29") - 0.05), <>{kicker("CATATAN")}{big("AYAT TIDAK MENYEBUT", "#FFF6E4", 70)}{big("IA BERSUJUD DI SANA", GOLD, 70)}</>)}
      {card("pindah", win(t, LS("l29") - 0.1, LS("l30") - 0.05), <>{kicker("IA BERPINDAH")}{big("DARI MENYEMBAH MATAHARI", "#FFB347", 64)}{big("KEPADA ALLAH", GOLD, 92)}</>)}
      {card("next", win(t, LS("l30") - 0.1, OUTRO_AT + 0.2), <>{kicker("KISAH LAIN")}{big("MENUNGGU DI AUDIRA", GOLD, 84)}</>)}
    </>
  );
};

// ---------- karaoke captions ----------
type Chunk = { words: Word[]; a: number; b: number };

const CAP: Record<string, number[]> = {};

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const line of TIMELINE.lines) {
    const cuts = CAP[line.id];
    const ok = cuts && cuts.reduce((a, b) => a + b, 0) === line.words.length;
    const sizes = ok ? cuts : Array.from({ length: Math.ceil(line.words.length / 4) }, () => 4);
    let k = 0;
    for (const n of sizes) {
      const words = line.words.slice(k, k + n);
      if (words.length) chunks.push({ words, a: 0, b: 0 });
      k += n;
    }
  }
  chunks.forEach((c) => (c.a = c.words[0].s - 0.12));
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    const end = c.words[c.words.length - 1].e + 0.35;
    c.b = next && next.a - end < 0.6 ? next.a : end;
  });
  return chunks;
}

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const chunks = useMemo(buildChunks, []);
  const c = chunks.find((k) => t >= k.a && t < k.b);
  if (!c || t >= OUTRO_AT) return null;
  let cur = -1;
  c.words.forEach((x, j) => { if (t >= x.s - 0.04) cur = j; });
  return (
    <div style={{ position: "absolute", left: 64 * s, right: 64 * s, top: 1300 * s, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#0C0916", border: `${2 * s}px solid rgba(240,185,62,0.55)`, borderRadius: 14 * s, padding: `${14 * s}px ${26 * s}px ${16 * s}px`, maxWidth: 940 * s, textAlign: "center", textWrap: "balance" }}>
        {c.words.map((w, i) => {
          const active = i === cur && t < w.e + 0.25;
          const said = i < cur || (i === cur && !active);
          const pop = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.12) * Math.PI * 0.5) : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 60 * s,
                lineHeight: 1.18,
                marginRight: i < c.words.length - 1 ? "0.4em" : 0,
                color: active ? "#FF9A3C" : said ? "#FFF6E4" : "rgba(255,246,228,0.8)",
                transform: `scale(${pop})`,
                display: "inline-block",
                textShadow: active ? `0 0 ${18 * s}px rgba(255,154,60,0.45)` : "none",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Cover title; holds through the first second of the film, always on in the cover comp. */
const CoverTitle: React.FC<{ t: number; s: number; safeTop: number }> = ({ t, s, safeTop }) => {
  const a = 1 - ramp(t, 1.0, 1.7);
  if (a <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,24,0.82) 0%, rgba(8,10,24,0.4) 24%, rgba(8,10,24,0) 38%)" }} />
      <div style={{ position: "absolute", left: 72 * s, right: 72 * s, top: (Math.max(236, safeTop) + 40) * s, transform: `translateY(${(1 - a) * -24 * s}px)` }}>
        <div style={{ fontFamily: PIX, fontSize: 38 * s, letterSpacing: 2 * s, color: "#FFA347", display: "flex", alignItems: "center", gap: 14 * s }}>
          <span style={{ width: 14 * s, height: 14 * s, background: "#FFA347", display: "inline-block" }} />
          SEJARAH ISLAM · EP21
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 148 * s, lineHeight: 1.0, color: "#FFF6E4", marginTop: 18 * s, textShadow: `0 ${6 * s}px 0 #3A1F0A, 0 0 ${40 * s}px rgba(255,170,70,0.35)`, letterSpacing: 1 * s }}>
          RATU BILQIS
          <br />
          <span style={{ color: "#BFE6FF" }}>KOLAM?</span>
        </div>
        <div style={{ marginTop: 22 * s, display: "inline-block", fontFamily: PIX, fontSize: 38 * s, color: "#1A1006", background: GOLD, padding: `${8 * s}px ${16 * s}px`, boxShadow: `${5 * s}px ${5 * s}px 0 #3A1F0A` }}>
          UJIAN DI LANTAI ISTANA
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FilmOverlay: React.FC<{ t: number; cam: Cam; cover?: boolean }> = ({ t, cam, cover }) => {
  const { scale: s, safe } = useFormat();
  const outro = ramp(t, OUTRO_AT, OUTRO_AT + 0.45);
  const veil = cover ? 0 : veilAt(t);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* HD-2D miniature vignette + top/bottom scrims so the HUD and captions read */}
      <AbsoluteFill style={{ opacity: (1 - outro) * (["saba", "camp", "desert", "hill"].includes(setAt(t)) ? 0.5 : 1), background: "radial-gradient(ellipse 62% 40% at 50% 46%, rgba(8,6,14,0) 52%, rgba(8,6,14,0.55) 82%, rgba(6,4,10,0.84) 100%)" }} />
      {/* matte black lift (film toe) so night shadows never crush to pure black (rule 12 §5) */}
      {(["majelis", "glassHook", "glassWide"] as SetId[]).includes(setAt(t)) && <AbsoluteFill style={{ opacity: 1 - outro, background: "#100D13", mixBlendMode: "screen" }} />}
      <CoverTitle t={cover ? 0 : t} s={s} safeTop={safe.top} />
      {veil > 0.001 && (
        <AbsoluteFill style={{ opacity: veil, background: "radial-gradient(ellipse 62% 40% at 50% 50%, #FFD08A 0%, #E5A93C 12%, #8A3E1E 32%, #2A1630 60%, #0B0E14 100%)" }} />
      )}
      {!cover && (
        <>
          <Pins t={t} cam={cam} s={s} />
          <Hud t={t} s={s} />
          <Captions t={t} s={s} />
        </>
      )}
    </AbsoluteFill>
  );
};

