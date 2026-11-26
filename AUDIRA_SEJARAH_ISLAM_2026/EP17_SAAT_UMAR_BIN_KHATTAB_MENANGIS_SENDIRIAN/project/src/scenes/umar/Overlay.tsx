// EP17 2D layers over the 3D world: cover title, world-pinned labels (projected with the film
// camera, only while their set is on screen), HUD cards, quote cards, karaoke captions and the
// AUDIRA outro card. Layout units 1080 × 1920, scaled to the render size.
// Labels, numbers and quotes come only from the script / SOURCE_REGISTER.

import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { useFormat } from "../../core/film/format.ts";
import { U } from "./world.tsx";
import { CAMP, HARRAH, MAP_PLACES, MAP_TOP } from "./SetsNight.tsx";
import { STORE, RAMADAH, roomState, goldPan } from "./SetsDay.tsx";
import { TIMELINE, W, OUTRO_AT, ramp, win, type Word } from "./time.ts";
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

const walkAt = (t: number, a: V3, b: V3, t0: number, t1: number): V3 => {
  const k = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};

const PINS: PinDef[] = [
  { id: "rome", set: "map", text: "ROMAWI", at: () => [MAP_PLACES.rome[0], MAP_TOP + 0.1, MAP_PLACES.rome[1]], a: W("romawi") - 0.5, b: CUTS[0], color: "#FFA58C", up: 90 },
  { id: "persia", set: "map", text: "PERSIA", at: () => [MAP_PLACES.persia[0], MAP_TOP + 0.1, MAP_PLACES.persia[1]], a: W("persia") - 0.15, b: CUTS[0], color: "#FFA58C", up: 90 },
  { id: "madinah0", set: "map", text: "MADINAH", at: () => [MAP_PLACES.madinah[0], MAP_TOP + 0.12, MAP_PLACES.madinah[1]], a: W("persia") - 0.15, b: CUTS[0], up: 100 },
  { id: "air", set: "camp", text: "ISINYA: AIR", at: () => [0.0, CAMP.potTop, 0.0], a: W("isinya") - 0.15, b: CUTS[1], color: "#9FD0FF", size: 56, up: 160 },
  { id: "aslam", set: "harrah", text: "ASLAM", sub: "PELAYAN UMAR", at: (t) => { const p = walkAt(t + 0.11, HARRAH.aslamA, HARRAH.aslamB, W("pelayannya") - 0.4, W("kecil") + 0.6); return [p[0], 0.5, p[2]]; }, a: W("aslam") - 0.1, b: W("mereka") + 0.2 },
  { id: "harrah", set: "harrah", text: "HARRAH", sub: "PINGGIRAN MADINAH", at: () => [0.0, 0.02, -1.6], a: W("pinggiran") - 0.2, b: W("dari") + 0.2, up: 140 },
  { id: "fire", set: "harrah", text: "NYALA API KECIL", at: () => [HARRAH.fire[0], 0.5, HARRAH.fire[2]], a: W("nyala") - 0.2, b: CUTS[3], up: 140 },
  { id: "ibu", set: "camp", text: "SEORANG IBU", at: () => [CAMP.mother[0], 0.36, CAMP.mother[2]], a: W("ibu") - 0.15, b: W("anak-anak") + 0.3 },
  { id: "anak", set: "camp", text: "ANAK-ANAK KELAPARAN", at: () => [CAMP.kids[0], 0.16, CAMP.kids[2]], a: W("anak-anak") + 0.2, b: W("di", 3) - 0.1, color: "#FF7A5C" },
  { id: "periuk", set: "camp", text: "PERIUK BERISI AIR", sub: "DIMASAK AGAR ANAK TERTIDUR", at: () => [0, CAMP.potTop, 0], a: W("periuk", 2) - 0.15, b: W("ibu", 2) - 0.2, up: 170 },
  { id: "umar", set: "camp", text: "UMAR", sub: "BERDIRI DI DEPANNYA", at: () => [CAMP.umar[0], 0.5, CAMP.umar[2]], a: W("berdiri") - 0.2, b: CUTS[4], up: 120 },
  { id: "gudang", set: "store", text: "GUDANG TEPUNG", sub: "BAITUL MAL", at: () => [STORE.hero[0], 0.5, STORE.hero[2]], a: W("gudang") - 0.1, b: W("aslam", 2) - 0.2 },
  { id: "masak", set: "camp", text: "DIMASAK SENDIRI", at: () => [0, CAMP.potTop, 0], a: W("memasak") - 0.1, b: CUTS[6], up: 170 },
  { id: "roti", set: "ramadah", text: "ROTI + MINYAK", sub: "MAKANAN UMAR", at: () => [RAMADAH.table[0], 0.3, RAMADAH.table[2]], a: W("roti") - 0.15, b: W("katanya") - 0.1, up: 150 },
  { id: "emas", set: "room", text: "EMAS SEPENUH BUMI", at: (t) => { const g = goldPan(roomState(t).tilt); return [g[0], g[1] + 0.3, g[2]]; }, a: W("emas") - 0.1, b: W("azab") + 0.5, up: 140 },
  { id: "wafat", set: "room", text: "MENJELANG WAFAT", at: () => [-0.6, 0.3, -0.95], a: W("menjelang") - 0.15, b: W("seandainya") - 0.1, up: 120 },
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
  const months = Math.max(1, Math.min(9, Math.round(1 + 8 * ramp(t, W("sembilan") - 0.2, W("sembilan") + 0.5))));
  return (
    <>
      {card("adidaya", win(t, W("persia") - 0.2, CUTS[0]), <>{kicker("DUA ADIDAYA GENTAR")}{big("PERSIA & ROMAWI", "#FF7A5C", 80)}</>)}
      {card("nama", win(t, W("umar") - 0.15, W("memimpin") - 0.1), <>{kicker("KHALIFAH KEDUA")}{big("UMAR BIN KHATTAB", "#FFF6E4", 78)}{t > W("amirul") - 0.2 && <div style={{ fontFamily: PIX, fontSize: 40 * s, color: GOLD, opacity: ramp(t, W("amirul") - 0.2, W("amirul") + 0.2) }}>AMIRUL MUKMININ PERTAMA</div>}</>)}
      {card("tahun", win(t, W("memimpin") - 0.1, CUTS[2]), <>{kicker("MEMIMPIN")}{big(t < W("sampai") ? "634 M" : "634–644 M", GOLD)}</>)}
      {quote("ibu", win(t, W("allah") - 0.2, W("ia") - 0.1), "KATA SANG IBU", ["“ALLAH YANG MENGADILI", "ANTARA KAMI DAN UMAR”"])}
      {quote("dosa", win(t, W("kamu") - 0.2, CUTS[5]), "JAWAB UMAR", ["“KAMU MAU MEMIKUL", "DOSAKU DI HARI KIAMAT?”"])}
      {card("ramadah", win(t, W("18") - 0.25, W("roti") - 0.1), <>{kicker("TAHUN RAMADAH")}{big("18 H · 639 M", GOLD)}{t > W("sembilan") - 0.2 && <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s }}>{big(String(months), "#FF7A5C", 120)}<div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#EDE3CF" }}>BULAN PACEKLIK</div></div>}</>)}
      {quote("pemimpin", win(t, W("katanya") - 0.2, CUTS[7]), "KATA UMAR", ["SEBURUK-BURUK PEMIMPIN:", "AKU KENYANG,", "RAKYAT LAPAR"])}
      {card("hisab", win(t, W("hisab") - 0.15, W("sahih") - 0.1), <>{kicker("YANG IA TAKUTKAN")}{big("HISAB", GOLD, 130)}</>)}
      {card("sumber", win(t, W("sahih") - 0.15, W("emas") - 0.2), <>{kicker("SUMBER")}{big("SAHIH AL-BUKHARI", "#FFF6E4", 70)}<div style={{ fontFamily: PIX, fontSize: 40 * s, color: GOLD }}>NO. 3693</div></>)}
      {card("shaf", win(t, W("terdengar") - 0.2, CUTS[9]), <>{kicker("ISAK TANGISNYA")}{big("TERDENGAR SAMPAI", "#FFF6E4", 70)}{big("SHAF TERAKHIR", GOLD, 70)}</>)}
      {quote("takut", win(t, W("ditanya") - 0.3, W("kisah") - 0.1), "YANG IA TAKUTKAN CUMA SATU", ["DITANYA ALLAH", "TENTANG RAKYATNYA"], "#FFF6E4")}
      {card("next", win(t, W("kisah") - 0.1, OUTRO_AT + 0.2), <>{kicker("KISAH BERIKUTNYA")}{big("DI AUDIRA", GOLD, 84)}</>)}
    </>
  );
};

// ---------- karaoke captions ----------
type Chunk = { words: Word[]; a: number; b: number };

const CAP: Record<string, number[]> = {
  l01: [3, 5], l02: [3, 5, 4], l03: [4], l04: [4, 2, 3, 3], l05: [3], l06: [4, 3], l07: [3, 3],
  l08: [5, 2, 3], l09: [3, 3, 3, 3], l10: [3, 4, 4], l11: [3, 4], l12: [2], l13: [5, 4, 4], l14: [3],
  l15: [2, 4, 3], l16: [3, 4], l17: [5, 4], l18: [6, 3], l19: [5, 3, 3], l20: [5], l21: [1],
  l22: [3, 4, 6, 3, 3, 3], l23: [4, 4], l24: [3, 6, 4], l25: [4],
};

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
          SEJARAH ISLAM · EP17
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 148 * s, lineHeight: 1.0, color: "#FFF6E4", marginTop: 18 * s, textShadow: `0 ${6 * s}px 0 #3A1F0A, 0 0 ${40 * s}px rgba(255,170,70,0.35)`, letterSpacing: 1 * s }}>
          UMAR <span style={{ color: GOLD }}>MENANGIS</span>
          <br />
          DI DEPAN PERIUK
        </div>
        <div style={{ marginTop: 22 * s, display: "inline-block", fontFamily: PIX, fontSize: 38 * s, color: "#1A1006", background: GOLD, padding: `${8 * s}px ${16 * s}px`, boxShadow: `${5 * s}px ${5 * s}px 0 #3A1F0A` }}>
          ISINYA CUMA AIR
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
      <AbsoluteFill style={{ opacity: (1 - outro) * (setAt(t) === "ramadah" ? 0.45 : setAt(t) === "map" ? 0.6 : 1), background: "radial-gradient(ellipse 62% 40% at 50% 46%, rgba(8,6,14,0) 52%, rgba(8,6,14,0.55) 82%, rgba(6,4,10,0.84) 100%)" }} />
      {/* matte black lift (film toe) so night shadows never crush to pure black (rule 12 §5) */}
      {(setAt(t) === "harrah" || setAt(t) === "mosque") && <AbsoluteFill style={{ opacity: 1 - outro, background: "#100D13", mixBlendMode: "screen" }} />}
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

