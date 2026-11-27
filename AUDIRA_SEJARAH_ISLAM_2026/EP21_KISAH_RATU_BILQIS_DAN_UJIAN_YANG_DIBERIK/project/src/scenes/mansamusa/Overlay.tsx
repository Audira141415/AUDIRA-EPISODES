// 2D layers over the 3D world: the cover title (fades after the hook), world-pinned labels that
// follow their 3D anchors (projected with the same camera), HUD cards, karaoke captions and the
// AUDIRA outro card. Laid out in 1080 × 1920 units and scaled to the render size.
// Labels and numbers come only from the script / SOURCE_REGISTER.

import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFormat } from "../../core/film/format.ts";
import { MM, panWorld, balanceState } from "./CairoMarket.tsx";
import { DESK, slatePoint, CHART, CHEST, LOAN } from "./MarketExtras.tsx";
import { GIZA } from "./GizaZone.tsx";
import { routeAt, caravanU, TOP } from "./MapTable.tsx";
import { mapX, mapZ, PLACES } from "./layout.ts";
import { TIMELINE, W, OUTRO_AT, ramp, win, type Word } from "./time.ts";
import { veilAt, type Cam } from "./camera.ts";

type V3 = [number, number, number];
const LW = 1080, LH = 1920;

/** Project a world point with the film camera into layout pixels (null if behind the camera). */
function project(cam: Cam, p: V3): { x: number; y: number } | null {
  const f = [cam.target[0] - cam.pos[0], cam.target[1] - cam.pos[1], cam.target[2] - cam.pos[2]];
  const fl = Math.hypot(f[0], f[1], f[2]);
  const fw = [f[0] / fl, f[1] / fl, f[2] / fl];
  // right = forward × up(0,1,0)
  let r = [fw[1] * 0 - fw[2] * 1, fw[2] * 0 - fw[0] * 0, fw[0] * 1 - fw[1] * 0];
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

type PinDef = { id: string; text: string; sub?: string; at: (t: number) => V3; a: number; b: number; color?: string; up?: number; size?: number; minY?: number };

const SURF = TOP + 0.17;
const onMap = (p: [number, number], y = SURF): V3 => [mapX(p[0]), y, mapZ(p[1])];

const PINS: PinDef[] = [
  // context (map)
  { id: "mali", text: "KEKAISARAN MALI", sub: "AFRIKA BARAT", at: () => onMap(PLACES.mali), a: W("mali") - 0.15, b: W("negerinya") + 0.3 },
  { id: "salt", text: "GARAM", at: () => onMap(PLACES.salt, SURF + 0.08), a: W("garam") - 0.1, b: W("ia") - 0.2, color: "#F4F1EA", size: 46 },
  { id: "bambuk", text: "BAMBUK", at: () => onMap(PLACES.bambuk, SURF + 0.08), a: W("garam") - 0.1, b: W("ia") - 0.2, up: 170, size: 44 },
  { id: "bure", text: "BURE", at: () => onMap(PLACES.bure, SURF + 0.08), a: W("garam") - 0.1, b: W("ia") - 0.2, up: 60, size: 44 },
  { id: "cairo", text: "KAIRO", at: () => onMap(PLACES.cairo, SURF + 0.36), a: W("menempuh"), b: W("orang") + 0.4 },
  { id: "makkah", text: "MAKKAH", at: () => onMap(PLACES.makkah, SURF + 0.36), a: W("kilometer") - 0.2, b: W("bersama"), color: "#F6E7B0" },
  { id: "konon", text: "KONON: PULUHAN RIBU ORANG", at: (t) => { const p = routeAt(caravanU(t)); return [p[0], p[1] + 0.1, p[2]]; }, a: W("konon") - 0.2, b: W("orang") + 0.5 },
  // main (Giza, Nile, palace)
  { id: "hari", text: "BERKEMAH 3 HARI", at: () => [GIZA.camp[0], 0.85, GIZA.camp[2]], a: W("tiga", 2) - 0.1, b: W("piramida") - 0.1 },
  { id: "giza", text: "PIRAMIDA GIZA", at: () => [8.4, 2.95, -6.9], a: W("piramida") - 0.1, b: W("menyeberangi") },
  { id: "nil", text: "SUNGAI NIL", at: () => [13.15, 0.3, GIZA.boatZ - 1.4], a: W("menyeberangi") - 0.1, b: W("musa", 2) - 0.2 },
  { id: "kairo2", text: "KAIRO", at: () => [GIZA.palace[0], 2.0, GIZA.palace[2]], a: W("kairo", 2) - 0.1, b: W("ia", 2) + 0.6 },
  { id: "kas", text: "KAS SULTAN", at: () => [GIZA.chestAt[0], 0.75, GIZA.chestAt[2]], a: W("kas") - 0.15, b: W("setiap") - 0.1 },
  { id: "pejabat", text: "PEJABAT DAPAT EMAS", at: () => [GIZA.palace[0], 1.75, GIZA.palace[2]], a: W("setiap") - 0.1, b: W("rombongannya") + 0.3, up: 50, minY: 440 },
  { id: "pasar", text: "BELANJA DI PASAR", at: () => [-1.75, 1.6, -0.3], a: W("pasar") - 0.3, b: W("sejarawan") + 0.8 },
  // explanation (market)
  { id: "umari", text: "CATATAN AL-UMARI", at: () => [DESK.pos[0], 0.85, DESK.pos[2]], a: W("al-umari") - 0.1, b: W("sebelum") - 0.2 },
  { id: "emas", text: "EMAS", at: (t) => { const p = panWorld(balanceState(t).tilt).gold; return [p[0], p[1] + 0.32, p[2]]; }, a: W("mitsqal") - 0.1, b: W("sederhananya") - 0.2 },
  { id: "perak", text: "PERAK", at: (t) => { const p = panWorld(balanceState(t).tilt).silver; return [p[0], p[1] + 0.5, p[2]]; }, a: W("dirham") - 0.1, b: W("sederhananya") - 0.2, color: "#ECE6DC", size: 46 },
  { id: "s25", text: "25", at: () => slatePoint(CHART.x0 + 0.08, CHART.y25 + 0.02), a: W("catatan") - 0.2, b: W("tapi") - 0.3, up: 60, color: "#ECE6DC" },
  { id: "s22", text: "22", at: () => slatePoint(CHART.xDrop + 0.1, CHART.y22), a: W("al-umari", 2) + 0.2, b: W("tapi") - 0.3, up: 60, color: "#E2553F" },
  { id: "s12", text: "± 12 TAHUN", at: () => slatePoint((CHART.xDrop + CHART.x1) / 2, CHART.base - 0.04), a: W("dua", 4) - 0.2, b: W("tapi") - 0.3, up: -80 },
  // payoff
  { id: "bekal", text: "BEKAL HABIS", at: () => [CHEST.pos[0], 0.55, CHEST.pos[2]], a: W("kehabisan") - 0.1, b: W("raja") - 0.1, color: "#E2553F" },
  { id: "utang", text: "BERUTANG", sub: "PADA PEDAGANG KAIRO", at: () => [LOAN.scroll[0], LOAN.scroll[1] + 0.1, LOAN.scroll[2] + 0.4], a: W("berutang") - 0.15, b: W("namanya", 2) + 0.2, color: "#E2553F" },
  { id: "eropa", text: "SAMPAI EROPA", at: () => onMap(PLACES.majorca, SURF + 0.36), a: W("eropa") - 0.2, b: W("menggambarnya") - 0.4, color: "#E2553F" },
  { id: "raja", text: "RAJA PALING KAYA", sub: "DI SELURUH NEGERI ITU", at: () => onMap(PLACES.mali, SURF + 0.62), a: W("raja", 2) - 0.1, b: W("menurutmu") + 0.2 },
];

const Chip: React.FC<{ text: string; sub?: string; color?: string; s: number; alpha: number; size?: number }> = ({ text, sub, color = MM.gold, s, alpha, size = 40 }) => (
  <div
    style={{
      opacity: alpha,
      transform: `translateY(${(1 - alpha) * 10 * s}px)`,
      background: "#0E0A18",
      border: `${3 * s}px solid ${color}`,
      boxShadow: `${5 * s}px ${5 * s}px 0 rgba(0,0,0,0.55)`,
      padding: `${8 * s}px ${14 * s}px`,
      whiteSpace: "normal",
      maxWidth: 900 * s,
      textAlign: "center",
    }}
  >
    <div style={{ fontFamily: PIX, fontSize: size * s, letterSpacing: 1.5 * s, color, lineHeight: 1.15 }}>{text}</div>
    {sub && <div style={{ fontFamily: PIX, fontSize: 40 * s, letterSpacing: 1 * s, color: "#EDE3CF", marginTop: 4 * s }}>{sub}</div>}
  </div>
);

const Pins: React.FC<{ t: number; cam: Cam; s: number }> = ({ t, cam, s }) => (
  <>
    {PINS.map((p) => {
      const alpha = win(t, p.a, p.b, 0.3, 0.3);
      if (alpha <= 0.001) return null;
      const q = project(cam, p.at(t));
      if (!q) return null;
      const up = p.up ?? 110;
      const color = p.color ?? MM.gold;
      // keep the whole chip inside x 60..1020: estimate its width (Silkscreen ≈ 0.9 em per glyph),
      // long labels wrap inside the 900 px max width
      const longest = Math.max(p.text.length, p.sub?.length ?? 0);
      const halfW = Math.min(900, longest * (p.size ?? 40) * 0.92 + 40) / 2;
      const cx = Math.max(60 + halfW, Math.min(1020 - halfW, q.x));
      const cy = Math.max(p.minY ?? 620, Math.min(1220, q.y - up));
      const dotIn = q.y > 190 && q.y < 1500 && q.x > 20 && q.x < LW - 20;
      if (!dotIn) return null; // never a floating label for an anchor that is off screen
      return (
        <React.Fragment key={p.id}>
          {dotIn && (
            <>
              <svg style={{ position: "absolute", left: 0, top: 0, opacity: alpha }} width={LW * s} height={LH * s}>
                <line x1={q.x * s} y1={q.y * s} x2={cx * s} y2={(cy + (up < 0 ? -10 : 30)) * s} stroke={color} strokeWidth={3 * s} />
              </svg>
              <div style={{ position: "absolute", left: (q.x - 9) * s, top: (q.y - 9) * s, width: 18 * s, height: 18 * s, background: color, border: `${3 * s}px solid #120C08`, opacity: alpha }} />
            </>
          )}
          <div style={{ position: "absolute", left: (cx - halfW) * s, width: halfW * 2 * s, top: cy * s, transform: "translateY(-100%)", display: "flex", justifyContent: "center" }}>
            <Chip text={p.text} sub={p.sub} color={color} s={s} alpha={alpha} size={p.size} />
          </div>
        </React.Fragment>
      );
    })}
  </>
);

/** Top HUD cards (inside the top safe line). */
const Hud: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const top = 300; // below the signature's top anchors (≈ 220 px)
  const card = (key: string, alpha: number, children: React.ReactNode) =>
    alpha > 0.001 && (
      <div
        key={key}
        style={{
          position: "absolute",
          left: 70 * s,
          top: top * s,
          opacity: alpha,
          transform: `translateX(${(1 - alpha) * -30 * s}px)`,
          background: "rgba(14,10,24,0.84)",
          borderLeft: `${10 * s}px solid ${MM.gold}`,
          boxShadow: `${6 * s}px ${6 * s}px 0 rgba(0,0,0,0.5)`,
          padding: `${14 * s}px ${24 * s}px`,
        }}
      >
        {children}
      </div>
    );
  const kicker = (txt: string) => <div style={{ fontFamily: PIX, fontSize: 40 * s, color: MM.gold, letterSpacing: 1.5 * s }}>{txt}</div>;
  const big = (txt: string, color = "#FFF6E4") => <div style={{ fontFamily: DISPLAY, fontSize: 92 * s, color, lineHeight: 1.05, letterSpacing: 1 * s }}>{txt}</div>;
  // explanation counter: 1 mitsqal = 25 → 22 dirham
  const n = Math.round(25 - 3 * ramp(t, W("turun") - 0.1, W("dirham", 2) + 0.2));
  const down = ramp(t, W("turun") - 0.1, W("turun") + 0.3);
  return (
    <>
      {card("km", win(t, W("sekitar") - 0.2, W("bersama") + 0.2), <>{kicker("PERJALANAN HAJI")}{big("± 4.300 KM")}</>)}
      {card("juli", win(t, W("juli") - 0.15, W("giza") + 0.5), <>{kicker("TIBA DI DEKAT KAIRO")}{big("JULI 1324")}</>)}
      {card("bulan", win(t, W("tiga", 3) - 0.2, W("ia", 2) + 1.4), <>{kicker("DI KAIRO")}{big("± 3 BULAN")}</>)}
      {card(
        "rate",
        win(t, W("mitsqal") - 0.2, W("sederhananya") + 0.1),
        <>
          {kicker("1 MITSQAL EMAS =")}
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 * s }}>
            {big(t < W("dua") - 0.2 ? "?" : String(n), down > 0.5 ? "#FF7A5C" : "#ECE6DC")}
            <div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#ECE6DC" }}>DIRHAM PERAK</div>
          </div>
          {down > 0.01 && <div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#FF7A5C", opacity: down }}>TURUN DARI 25</div>}
        </>,
      )}
      {card("flood", win(t, W("emas", 6) - 0.2, W("menurut") - 0.3), <>{kicker("EMAS MELIMPAH")}{big("NILAI TURUN", "#FF7A5C")}</>)}
      {card("atlas", win(t, W("atlas") - 0.2, W("menggambarnya") + 0.6), <>{kicker("ATLAS KATALAN")}{big("± 1375")}</>)}
      {card(
        "q",
        win(t, W("menurutmu") - 0.15, OUTRO_AT + 0.2),
        <>
          {kicker("MENURUTMU?")}
          {big("BOROS ATAU")}
          {big("JENIUS?", MM.gold)}
          <div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#EDE3CF", marginTop: 6 * s, opacity: ramp(t, W("tulis") - 0.2, W("tulis") + 0.2) }}>TULIS DI KOMENTAR</div>
        </>,
      )}
    </>
  );
};

// ---------- karaoke captions ----------
type Chunk = { words: Word[]; a: number; b: number };

// Caption phrases per line (word counts), cut at punctuation and noun-phrase ends so no phrase is
// split ("harga emas", "dua puluh lima dirham") and no chunk is a one-word orphan.
const CUTS: Record<string, number[]> = {
  l01: [3, 6],
  l02: [3, 3, 3, 5, 6],
  l03: [5, 7, 4, 4],
  l04: [2, 5, 4, 4, 2, 5],
  l05: [5, 3, 6, 5],
  l06: [3, 6],
  l07: [3, 3, 4, 5],
  l08: [4, 6, 4, 3],
  l09: [3, 3, 4],
  l10: [4, 3, 3],
  l11: [7, 3, 3, 5],
  l12: [2, 3, 4, 3, 4],
  l13: [5, 3, 4],
};

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const line of TIMELINE.lines) {
    const cuts = CUTS[line.id];
    const ok = cuts && cuts.reduce((a, b) => a + b, 0) === line.words.length;
    const sizes = ok ? cuts : Array.from({ length: Math.ceil(line.words.length / 5) }, () => 5);
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
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, bottom: (380 + 34) * s, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "#0C0916", // fully opaque at every moment
          border: `${2 * s}px solid rgba(240,185,62,0.55)`,
          borderRadius: 14 * s,
          padding: `${14 * s}px ${26 * s}px ${16 * s}px`,
          maxWidth: 940 * s,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {c.words.map((w, i) => {
          // exactly one active word: the latest word that has started (until the chunk ends)
          let cur = -1;
          c.words.forEach((x, j) => { if (t >= x.s - 0.04) cur = j; });
          const active = i === cur && t < w.e + 0.25;
          const said = i < cur || (i === cur && !active);
          const pop = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.12) * Math.PI * 0.5) : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 58 * s,
                lineHeight: 1.18,
                marginRight: i < c.words.length - 1 ? `0.4em` : 0,
                color: active ? MM.gold : said ? "#FFF6E4" : "rgba(255,246,228,0.8)",
                transform: `scale(${pop})`,
                display: "inline-block",
                textShadow: active ? `0 0 ${18 * s}px rgba(240,185,62,0.45)` : "none",
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

/** The approved cover title; holds through the first second, then clears for the film. */
const CoverTitle: React.FC<{ t: number; s: number; safeTop: number }> = ({ t, s, safeTop }) => {
  const a = 1 - ramp(t, 1.0, 1.7);
  if (a <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,24,0.78) 0%, rgba(8,10,24,0.35) 22%, rgba(8,10,24,0) 34%)" }} />
      <div style={{ position: "absolute", left: 72 * s, right: 72 * s, top: (safeTop + 60) * s, transform: `translateY(${(1 - a) * -24 * s}px)` }}>
        <div style={{ fontFamily: PIX, fontSize: 30 * s, letterSpacing: 2 * s, color: MM.lantern, display: "flex", alignItems: "center", gap: 14 * s }}>
          <span style={{ width: 14 * s, height: 14 * s, background: MM.lantern, display: "inline-block" }} />
          SEJARAH ISLAM · EP04
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 150 * s, lineHeight: 1.0, color: "#FFF6E4", marginTop: 18 * s, textShadow: `0 ${6 * s}px 0 #3A1F0A, 0 0 ${40 * s}px rgba(255,170,70,0.35)`, letterSpacing: 1 * s }}>
          HARGA <span style={{ color: MM.gold }}>EMAS</span>
          <br />
          KAIRO JATUH
        </div>
        <div style={{ marginTop: 22 * s, display: "inline-block", fontFamily: PIX, fontSize: 30 * s, color: "#1A1006", background: MM.gold, padding: `${8 * s}px ${16 * s}px`, boxShadow: `${5 * s}px ${5 * s}px 0 #3A1F0A` }}>
          KAIRO · 1324
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FilmOverlay: React.FC<{ t: number; cam: Cam; cover?: boolean }> = ({ t, cam, cover }) => {
  const { scale: s, safe } = useFormat();
  const outro = ramp(t, OUTRO_AT, OUTRO_AT + 0.45);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <CoverTitle t={cover ? 0 : t} s={s} safeTop={safe.top} />
      {!cover && veilAt(t) > 0.001 && (
        // zone fade = a lantern iris: a warm 2400K pool in the middle, night at the edges (keeps tonal range)
        <AbsoluteFill style={{ opacity: veilAt(t), background: "radial-gradient(ellipse 62% 40% at 50% 50%, #FFD08A 0%, #E5A93C 14%, #8A3E1E 34%, #2A1630 62%, #0B0E14 100%)" }} />
      )}
      {!cover && (
        // HD-2D miniature vignette: darkens the frame edges so the lit subject separates (off on the cover frame and outro)
        <AbsoluteFill style={{ opacity: ramp(t, 1.0, 1.8) * (1 - outro), background: "radial-gradient(ellipse 78% 62% at 50% 48%, rgba(8,6,14,0) 46%, rgba(8,6,14,0.46) 78%, rgba(6,4,10,0.74) 100%)" }} />
      )}
      {!cover && (
        <>
          <Pins t={t} cam={cam} s={s} />
          <Hud t={t} s={s} />
          <Captions t={t} s={s} />
          {outro > 0.001 && (
            <AbsoluteFill style={{ opacity: outro, background: "radial-gradient(ellipse at 50% 46%, #2C8062 0%, #0B3D2E 45%, #03150F 100%)", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 900 * s, height: "auto", transform: `scale(${0.96 + 0.04 * outro})` }} />
              <div style={{ marginTop: 10 * s, fontFamily: BODY, fontWeight: 600, fontSize: 44 * s, color: "#F2C46A", letterSpacing: 2 * s }}>Created by Agus Dwi R.</div>
            </AbsoluteFill>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

