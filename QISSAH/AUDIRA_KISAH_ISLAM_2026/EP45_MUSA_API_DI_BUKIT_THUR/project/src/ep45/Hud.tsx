// EP45 HUD — paper cut-card callouts on the 1080 × 1920 layout (FilmScene overlay scales it).
// ribbon = quote strip with surah ref (slot y≈250), tag = small card (slot y≈470, slot 2 y≈640),
// title = hook title card, stamp = big impact stamp. Tears = torn-paper wipe across every cut.
import React from "react";
import { DISPLAY } from "../core/type/displayFonts.ts";
import { CUTS } from "./timing.ts";

type Kind = "ribbon" | "tag" | "title" | "stamp";
type Item = { at: number; until: number; kind: Kind; text: string; sub?: string; slot?: 1 | 2 };

const ITEMS: Item[] = [
  { at: 3.0, until: 8.0, kind: "title", text: "API DI BUKIT THUR", sub: "Kisah Nabi Musa" },
  { at: 10.6, until: 15.5, kind: "tag", text: "PULANG DARI MADYAN", sub: "QS AL-QASAS : 29" },
  { at: 20.34, until: 23.0, kind: "tag", text: "TANPA API · TANPA JALAN" },
  { at: 24.6, until: 30.0, kind: "ribbon", text: "“Tunggulah di sini, aku melihat api”", sub: "QS TAHA : 10" },
  { at: 35.4, until: 37.0, kind: "tag", text: "BUKIT THUR" },
  { at: 38.4, until: 41.6, kind: "ribbon", text: "Dipanggil dari arah pohon", sub: "QS AL-QASAS : 30" },
  { at: 41.8, until: 45.9, kind: "ribbon", text: "“Lepaskan kedua terompahmu”", sub: "QS TAHA : 12" },
  { at: 43.59, until: 45.9, kind: "tag", text: "LEMBAH SUCI THUWA", slot: 2 },
  { at: 49.44, until: 54.2, kind: "tag", text: "TANDA 1", sub: "TONGKAT JADI ULAR" },
  { at: 54.27, until: 57.8, kind: "ribbon", text: "“Jangan takut”", sub: "QS TAHA : 21" },
  { at: 60.6, until: 65.4, kind: "tag", text: "TANDA 2", sub: "TANGAN BERCAHAYA" },
  { at: 65.57, until: 67.5, kind: "stamp", text: "9 MUKJIZAT", sub: "QS AN-NAML : 12" },
  { at: 68.44, until: 73.5, kind: "ribbon", text: "“Pergilah kepada Firaun”", sub: "QS TAHA : 24" },
  { at: 73.64, until: 79.5, kind: "ribbon", text: "“Lapangkan dadaku, mudahkan urusanku”", sub: "QS TAHA : 25–26" },
  { at: 79.69, until: 82.7, kind: "tag", text: "HARUN", sub: "PENDAMPING" },
  { at: 83.08, until: 91.5, kind: "tag", text: "NAIK", sub: "MENCARI API" },
  { at: 86.18, until: 91.5, kind: "tag", text: "TURUN", sub: "MEMBAWA RISALAH", slot: 2 },
];

const IVORY = "#f3e6c8";
const INK = "#2e2119";
const GOLD = "#7a4a14";
const EMBER = "#b4421a";

const sat = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = sat(x);
  return t * t * (3 - 2 * t);
};
// pop with one small overshoot, then fold away
const popIn = (s: number, at: number) => {
  const a = sat((s - at) / 0.32);
  return a < 1 ? 1 - Math.pow(1 - a, 3) * Math.cos(a * Math.PI * 1.5) : 1;
};

// torn edge polygon (deterministic) for the paper cards
const torn = (seed: number, n = 14, amp = 1.6) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${amp * (0.5 + 0.5 * Math.sin(seed * 7.1 + i * 2.7))}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - amp * (0.5 + 0.5 * Math.sin(seed * 3.3 + i * 1.9))}%`);
  return `polygon(${pts.join(",")})`;
};

const shadow = "drop-shadow(0 10px 14px rgba(0,0,0,0.45))";

const Card: React.FC<{ item: Item; s: number; i: number }> = ({ item, s, i }) => {
  const inP = popIn(s, item.at);
  const out = smooth((s - (item.until - 0.3)) / 0.3);
  const vis = inP * (1 - out);
  if (vis <= 0.001) return null;
  const tilt = (i % 2 ? 1 : -1) * (1.2 + (i % 3) * 0.4);

  if (item.kind === "title") {
    return (
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: sat(vis * 1.4), transform: `translateY(${(1 - inP) * 60}px) rotate(${-1.5 * (1 - inP)}deg)`, filter: shadow }}>
        <div style={{ background: IVORY, clipPath: torn(i + 1, 18, 2.5), padding: "34px 46px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 112, lineHeight: 1, color: INK, letterSpacing: 2 }}>{item.text}</div>
          <div style={{ height: 8, background: EMBER, margin: "18px auto 14px", width: `${70 * smooth((s - item.at - 0.3) / 0.5)}%` }} />
          <div style={{ fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 54, color: "#6b4a2e" }}>{item.sub}</div>
        </div>
      </div>
    );
  }

  if (item.kind === "stamp") {
    const k = sat((s - item.at) / 0.22);
    const scale = k < 1 ? 2.2 - 1.2 * (1 - Math.pow(1 - k, 3)) : 1;
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", opacity: sat(k * 2) * (1 - out) }}>
        <div style={{ transform: `scale(${scale}) rotate(-6deg)`, border: `10px solid ${EMBER}`, borderRadius: 18, padding: "18px 40px 14px", background: "rgba(243,230,200,0.92)", textAlign: "center", filter: shadow }}>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 150, lineHeight: 1.15, color: EMBER }}>{item.text}</div>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 48, color: INK, letterSpacing: 3, marginTop: 16 }}>{item.sub}</div>
        </div>
      </div>
    );
  }

  if (item.kind === "ribbon") {
    return (
      <div style={{ position: "absolute", left: 60, right: 60, top: 236, display: "flex", justifyContent: "center", opacity: sat(vis * 1.5), transform: `translateX(${(1 - inP) * -90}px) rotate(${tilt * 0.5}deg)`, filter: shadow }}>
        <div style={{ background: IVORY, clipPath: torn(i + 3, 16, 3), padding: "26px 40px 22px", maxWidth: 960, textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 62, lineHeight: 1.12, color: INK }}>{item.text}</div>
          {item.sub ? <div style={{ fontFamily: DISPLAY.condensed, fontSize: 40, letterSpacing: 4, color: GOLD, marginTop: 10 }}>{item.sub}</div> : null}
        </div>
      </div>
    );
  }

  // tag
  const top = item.slot === 2 ? 640 : 470;
  const left = item.slot === 2 ? 200 : 80;
  return (
    <div style={{ position: "absolute", left, top, opacity: sat(vis * 1.5), transform: `translateY(${(1 - inP) * 40}px) rotate(${tilt}deg)`, transformOrigin: "0 0", filter: shadow }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ width: 22, background: EMBER }} />
        <div style={{ background: IVORY, clipPath: torn(i + 5, 10, 4), padding: "16px 30px 14px 24px" }}>
          <div style={{ fontFamily: DISPLAY.condensed, fontSize: 66, lineHeight: 1, color: INK, letterSpacing: 1 }}>{item.text}</div>
          {item.sub ? <div style={{ fontFamily: DISPLAY.condensed, fontSize: 42, color: "#8a5a24", letterSpacing: 2, marginTop: 6 }}>{item.sub}</div> : null}
        </div>
      </div>
    </div>
  );
};

export const Hud: React.FC<{ s: number }> = ({ s }) => (
  <>
    {ITEMS.map((it, i) => (s >= it.at - 0.05 && s <= it.until + 0.05 ? <Card key={i} item={it} s={s} i={i} /> : null))}
  </>
);

/** Torn-paper wipe: an ivory sheet with ragged edges sweeps up over each cut (0.36 s, centred on the cut). */
export const Tears: React.FC<{ s: number }> = ({ s }) => {
  const D = 0.36;
  const c = CUTS.find((t) => Math.abs(s - t) <= D / 2);
  if (c === undefined) return null;
  const p = (s - (c - D / 2)) / D; // 0 → 1
  const y = 1920 - p * (1920 + 2400);
  const edge = (seed: number) => {
    const pts: string[] = [];
    const n = 22;
    for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${2.2 * (0.5 + 0.5 * Math.sin(seed + i * 2.3) * Math.cos(i * 0.7))}%`);
    for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - 2.2 * (0.5 + 0.5 * Math.sin(seed * 1.7 + i * 1.9))}%`);
    return `polygon(${pts.join(",")})`;
  };
  const seed = c * 3.1;
  return (
    <div style={{ position: "absolute", left: -40, width: 1160, top: y, height: 2400, background: IVORY, clipPath: edge(seed), transform: `rotate(${Math.sin(seed) * 2}deg)`, filter: "drop-shadow(0 -12px 18px rgba(0,0,0,0.5))" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(8deg, rgba(120,90,50,0.07) 0 3px, transparent 3px 11px)" }} />
    </div>
  );
};

/** Karaoke caption on the layout canvas: phrases split on pauses / sentence ends, word gap 0.4 em, active word gold. */
export type CapWord = { text: string; start: number; end: number };
const phrasesOf = (words: CapWord[], maxWords = 5) => {
  const out: CapWord[][] = [];
  let cur: CapWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (!next || cur.length >= maxWords || /[.,!?:;”]$/.test(w.text) || next.start - w.end > 0.3) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
};
export const Caption: React.FC<{ words: CapWord[]; s: number; y?: number; size?: number }> = ({ words, s, y = 1300, size = 56 }) => {
  const phrases = React.useMemo(() => phrasesOf(words), [words]);
  const p = phrases.find((ph, i) => s >= ph[0].start - 0.05 && s < (phrases[i + 1]?.[0].start ?? ph[ph.length - 1].end + 0.4));
  if (!p) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.4em", rowGap: 4, background: "rgba(20,14,12,0.78)", borderRadius: 14, padding: "14px 26px", fontFamily: DISPLAY.body, fontWeight: 800, fontSize: size, lineHeight: 1.2 }}>
        {p.map((w, i) => {
          const active = s >= w.start && s < w.end;
          const past = s >= w.end;
          return (
            <span key={i} style={{ display: "inline-block", color: active || past ? "#FFC861" : "#f3e6c8", transform: active ? "scale(1.04)" : undefined }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
