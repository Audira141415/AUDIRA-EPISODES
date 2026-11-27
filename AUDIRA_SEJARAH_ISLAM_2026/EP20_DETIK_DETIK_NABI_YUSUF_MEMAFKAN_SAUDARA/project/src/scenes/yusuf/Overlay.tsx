// EP20 2D layers over the 3D world: cover title, world-pinned labels (projected with the film
// camera, only while their set is on screen), HUD cards, quote cards, karaoke captions and the
// AUDIRA outro card. Layout units 1080 × 1920, scaled to the render size.
// Labels, numbers and quotes come only from the script / SOURCE_REGISTER.

import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { useFormat } from "../../core/film/format.ts";
import { U } from "./world.tsx";
import { HALL, STORE, storeState, YUSUF_HOOK } from "./SetsHall.tsx";
import { GATE, ROOF, BOOK, starsLit } from "./SetsOut.tsx";
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
  { id: "yusuf", set: "hallNight", text: "YUSUF", sub: "PENGUASA MESIR", at: () => [YUSUF_HOOK[0], 0.95, YUSUF_HOOK[2]], a: W("berkuasa") - 0.3, b: W("saudara-saudara") - 0.1, up: 120 },
  { id: "bros", set: "hallNight", text: "SAUDARA-SAUDARANYA", at: () => [0, 0.6, HALL.broZ], a: W("saudara-saudara") - 0.1, b: W("ia") - 0.1, up: 120 },
  { id: "gerbang", set: "gate", text: "GERBANG MESIR", at: () => [0.6, 0.8, GATE.z + 0.32], a: CUTS[0] + 0.4, b: W("ini") - 0.1, up: 60, minY: 780 },
  { id: "yaqub", set: "roof", text: "YAQUB", sub: "& YUSUF KECIL", at: () => [(ROOF.yaqub[0] + ROOF.child[0]) / 2, 0.75, ROOF.yaqub[2]], a: W("ayahnya") - 0.2, b: W("melarang") - 0.3, up: 130 },
  { id: "piala", set: "store", text: "PIALA RAJA", sub: "DI KARUNG ADIKNYA", at: (t) => [STORE.small[0], 0.4 + 0.25 * storeState(t).cup, STORE.small[2]], a: W("dituduh") + 0.2, b: WL("l11", "al-quran") - 0.1, color: "#FFA58C", up: 140 },
  { id: "benyamin", set: "hallDay", text: "BENYAMIN", sub: "SAUDARANYA", at: () => [0.42, 0.75, 0.5], a: W("saudaraku") - 0.2, b: CUTS[4], up: 120 },
  { id: "tafsir", set: "book", text: "TAFSIR IBNU KATSIR", at: () => [BOOK.book[0], BOOK.top + 0.05, BOOK.book[2]], a: W("ibnu") - 0.2, b: LS("l22") - 0.1, up: 150 },
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
  const stars = starsLit(t);
  return (
    <>
      {card("kenal", win(t, W("ia") - 0.15, W("tapi") - 0.05), <>{kicker("YUSUF")}{big("IA MENGENAL MEREKA", GOLD, 84)}</>)}
      {card("diam", win(t, W("tapi") - 0.05, CUTS[0]), <>{kicker("TAPI")}{big("IA DIAM", "#FFF6E4", 110)}</>)}
      {quote("q58", win(t, W("menurut") - 0.2, LS("l06") - 0.1), "QS YUSUF 12:58", ["“MEREKA TIDAK", "MENGENALNYA”"])}
      {card("audira", win(t, W("ini") - 0.15, CUTS[1]), <>{kicker("KISAH DI AUDIRA")}{big("MAAF YANG DATANG", "#FFF6E4", 74)}{big("PELAN-PELAN", GOLD, 74)}</>)}
      {card("mimpi", win(t, W("sebelas") - 0.3, W("ayahnya") - 0.15), <>{kicker("MIMPI YUSUF")}<div style={{ display: "flex", alignItems: "baseline", gap: 16 * s }}>{big(String(Math.max(1, stars)), GOLD, 120)}<div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#EDE3CF" }}>BINTANG</div></div>{t > W("matahari") - 0.2 && <div style={{ fontFamily: PIX, fontSize: 40 * s, color: "#FFD08A", opacity: ramp(t, W("matahari") - 0.2, W("matahari") + 0.2) }}>+ MATAHARI & BULAN</div>}</>)}
      {quote("yaqub", win(t, W("melarang") - 0.2, CUTS[2]), "PESAN AYAHNYA, YAQUB", ["“JANGAN CERITAKAN", "KEPADA SAUDARAMU”"])}
      {card("puluhan", win(t, CUTS[2] + 0.2, WL("l10", "yusuf") - 0.1), <>{kicker("PULUHAN TAHUN KEMUDIAN")}{big("MINTA BAHAN MAKANAN", "#FFF6E4", 70)}</>)}
      {card("dituduh", win(t, W("dituduh") - 0.2, WL("l11", "al-quran") - 0.1), <>{kicker("ADIKNYA")}{big("DITUDUH MENCURI", "#FF7A5C", 80)}</>)}
      {quote("q77", win(t, WL("l11", "al-quran") - 0.2, CUTS[3]), "QS YUSUF 12:77", ["DISEMBUNYIKAN", "DALAM HATI"])}
      {quote("q89", win(t, W("bertanya") - 0.2, W("terkejut") - 0.1), "QS YUSUF 12:89", ["“TAHUKAH KALIAN", "APA YANG TELAH", "KALIAN PERBUAT?”"])}
      {card("benarkah", win(t, W("terkejut") - 0.1, LS("l15") - 0.05), <>{kicker("MEREKA TERKEJUT")}{big("BENARKAH ENGKAU YUSUF?", "#FFF6E4", 66)}</>)}
      {(() => {
        const a = win(t, WL("l15", "aku") - 0.15, CUTS[4], 0.2, 0.3);
        if (a <= 0.001) return null;
        const ben = ramp(t, W("saudaraku") - 0.3, W("saudaraku") + 0.2);
        return (
          <div style={{ position: "absolute", left: 0, right: 0, top: 330 * s, opacity: a, textAlign: "center", transform: `scale(${0.9 + 0.1 * a})` }}>
            <div style={{ display: "inline-block", fontFamily: PIX, fontSize: 38 * s, color: GOLD, letterSpacing: 2 * s, background: "rgba(20,10,4,0.82)", padding: `${6 * s}px ${16 * s}px`, marginBottom: 10 * s }}>QS YUSUF 12:90</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 190 * s, color: "#FFF6E4", lineHeight: 1.0, textShadow: `0 ${8 * s}px 0 #3A1F0A, 0 0 ${50 * s}px rgba(255,190,90,0.5)` }}>
              AKU <span style={{ color: GOLD }}>·</span> YUSUF
            </div>
            {ben > 0.001 && <div style={{ fontFamily: DISPLAY, fontSize: 76 * s, color: GOLD, opacity: ben, marginTop: 8 * s }}>& INI SAUDARAKU</div>}
          </div>
        );
      })()}
      {card("amarah", win(t, CUTS[4] + 0.1, W("ayat", 2) - 0.1), <>{kicker("JAWABAN YUSUF")}{big("TIDAK ADA AMARAH", GOLD, 84)}</>)}
      {quote("q92", win(t, W("ayat", 2) - 0.2, CUTS[5]), "QS YUSUF 12:92", ["“TIDAK ADA CERCAAN", "TERHADAP KALIAN”"], "#FFF6E4")}
      {card("baju", win(t, W("menitipkan") - 0.2, CUTS[6]), <>{kicker("DITITIPKAN")}{big("BAJU YUSUF", "#FFF6E4", 92)}{big("AGAR AYAHNYA MELIHAT", GOLD, 54)}</>)}
      {card("alasan", win(t, WL("l20", "al-quran") - 0.2, LS("l22") - 0.1), <>{kicker("AL-QURAN")}{big("TIDAK MENYEBUT ALASAN", "#FFF6E4", 64)}</>)}
      {card("katsir", win(t, W("ibnu") - 0.2, LS("l22") - 0.1), <>{kicker("IBNU KATSIR")}{big("ATAS PERINTAH ALLAH", GOLD, 66)}{t > W("lebih") - 0.3 && <div style={{ fontFamily: PIX, fontSize: 38 * s, color: "#EDE3CF", opacity: ramp(t, W("lebih") - 0.3, W("lebih") + 0.1) }}>ALLAH LEBIH TAHU</div>}</>, 560)}
      {card("empat", win(t, W("sebagian") - 0.2, CUTS[7]), <>{kicker("WAKTU MENUNGGU")}{big("±40 TAHUN", GOLD, 120)}{t > W("bukan") - 0.3 && <div style={{ fontFamily: PIX, fontSize: 38 * s, color: "#1A0806", background: "#FF7A5C", padding: `${4 * s}px ${10 * s}px`, display: "inline-block", opacity: ramp(t, W("bukan") - 0.3, W("bukan") + 0.1) }}>RIWAYAT TAFSIR · BUKAN HADIS SHAHIH</div>}</>)}
      {card("bukhari", win(t, WL("l23", "shahih") - 0.15, W("sabar") - 0.1), <>{kicker("SUMBER")}{big("SHAHIH AL-BUKHARI", "#FFF6E4", 70)}<div style={{ fontFamily: PIX, fontSize: 40 * s, color: GOLD }}>NO. 3374</div>{t > W("mulia") - 0.4 && <div style={{ fontFamily: PIX, fontSize: 38 * s, color: "#EDE3CF", opacity: ramp(t, W("mulia") - 0.4, W("mulia")) }}>YUSUF: ORANG PALING MULIA</div>}</>)}
      {(() => {
        const a = win(t, W("sabar") - 0.15, LS("l25") - 0.05, 0.2, 0.3);
        if (a <= 0.001) return null;
        const items: [string, number][] = [["SABAR", W("sabar")], ["TAKWA", W("takwa")], ["MAAF", WL("l24", "maaf")]];
        return (
          <div style={{ position: "absolute", left: 0, right: 0, top: 340 * s, opacity: a, display: "flex", justifyContent: "center", gap: 28 * s }}>
            {items.map(([w, at], i) => {
              const k = ramp(t, at - 0.15, at + 0.15);
              return (
                <div key={w} style={{ opacity: k, transform: `translateY(${(1 - k) * 30 * s}px)`, fontFamily: DISPLAY, fontSize: 104 * s, color: i === 2 ? GOLD : "#FFF6E4", textShadow: `0 ${6 * s}px 0 #3A1F0A` }}>
                  {w}
                </div>
              );
            })}
          </div>
        );
      })()}
      {card("next", win(t, LS("l25") - 0.1, OUTRO_AT + 0.2), <>{kicker("KISAH PARA NABI")}{big("DI AUDIRA", GOLD, 84)}</>)}
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
          SEJARAH ISLAM · EP20
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 148 * s, lineHeight: 1.0, color: "#FFF6E4", marginTop: 18 * s, textShadow: `0 ${6 * s}px 0 #3A1F0A, 0 0 ${40 * s}px rgba(255,170,70,0.35)`, letterSpacing: 1 * s }}>
          YUSUF
          <br />
          <span style={{ color: GOLD }}>MEMAAFKAN</span>
        </div>
        <div style={{ marginTop: 22 * s, display: "inline-block", fontFamily: PIX, fontSize: 38 * s, color: "#1A1006", background: GOLD, padding: `${8 * s}px ${16 * s}px`, boxShadow: `${5 * s}px ${5 * s}px 0 #3A1F0A` }}>
          IA MENGENAL MEREKA
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
      <AbsoluteFill style={{ opacity: (1 - outro) * (["gate", "hallDay", "road", "hill"].includes(setAt(t)) ? 0.5 : 1), background: "radial-gradient(ellipse 62% 40% at 50% 46%, rgba(8,6,14,0) 52%, rgba(8,6,14,0.55) 82%, rgba(6,4,10,0.84) 100%)" }} />
      {/* matte black lift (film toe) so night shadows never crush to pure black (rule 12 §5) */}
      {(setAt(t) === "roof" || setAt(t) === "book" || setAt(t) === "hallNight") && <AbsoluteFill style={{ opacity: 1 - outro, background: "#100D13", mixBlendMode: "screen" }} />}
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

