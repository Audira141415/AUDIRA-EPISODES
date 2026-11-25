// HUD layer for the QRIS film: big spoken-label tags, numbers, stamp, karaoke caption. Layout px at 1080 × 1920.
import React from "react";
import { COL, lerp, pop, mix } from "./iso";
import WORDS from "../../../public/audio/vo-words.json";

type W = { text: string; start: number; end: number };

const chip = (c: string) => (
  <svg width={34} height={34} viewBox="-17 -17 34 34" style={{ flexShrink: 0 }}>
    <polygon points="0,-15 13,-7.5 0,0 -13,-7.5" fill={mix(c, "#FFF8EC", 0.22)} />
    <polygon points="-13,-7.5 0,0 0,15 -13,7.5" fill={c} />
    <polygon points="13,-7.5 0,0 0,15 13,7.5" fill={mix(c, "#231A2C", 0.24)} />
  </svg>
);

/** Big HUD tag: card with ink border + iso chip. Visible in [at, until]. */
export const Tag: React.FC<{
  t: number; at: number; until: number; x: number; y: number; text: string; sub?: string; c?: string;
  size?: number; align?: "left" | "center" | "right"; dark?: boolean;
}> = ({ t, at, until, x, y, text, sub, c = COL.ink, size = 72, align = "center", dark }) => {
  if (t < at - 0.01 || t > until + 0.3) return null;
  const p = pop(t, at, 0.38);
  const out = lerp(t, until, until + 0.25, 1, 0);
  const tx = align === "center" ? "-50%" : align === "right" ? "-100%" : "0";
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, transform: `translate(${tx},0) scale(${0.6 + 0.4 * p})`, transformOrigin: align === "center" ? "50% 50%" : align === "right" ? "100% 50%" : "0 50%",
        opacity: Math.min(1, p * 1.6) * out, display: "flex", alignItems: "center", gap: 18,
        background: dark ? COL.ink : COL.white, border: `5px solid ${COL.ink}`, borderRadius: 18, padding: `14px 28px 14px 22px`,
        boxShadow: `8px 10px 0 ${mix(COL.ink, COL.ground, 0.75)}`, whiteSpace: "nowrap",
      }}
    >
      {chip(c)}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: size, letterSpacing: "0.02em", color: dark ? COL.white : COL.ink }}>{text}</span>
        {sub ? <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: Math.max(36, size * 0.42), color: dark ? mix(COL.white, c, 0.3) : mix(COL.ink, c, 0.45), marginTop: 8, letterSpacing: "0.03em" }}>{sub}</span> : null}
      </div>
    </div>
  );
};

/** Count-up number in Anton with a unit and label. */
export const BigNumber: React.FC<{ t: number; at: number; dur: number; until: number; x: number; y: number; value: number; decimals?: number; unit: string; label: string; c: string; chipText?: string }> = ({
  t, at, dur, until, x, y, value, decimals = 2, unit, label, c, chipText,
}) => {
  if (t < at - 0.01 || t > until + 0.3) return null;
  const p = pop(t, at, 0.35);
  const v = lerp(t, at, at + dur, 0, value);
  const out = lerp(t, until, until + 0.25, 1, 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: "0 50%", opacity: Math.min(1, p * 1.6) * out, display: "flex", alignItems: "flex-end", gap: 22, background: "rgba(255,253,248,0.94)", border: `5px solid ${COL.ink}`, borderRadius: 22, padding: "14px 30px 18px 26px", boxShadow: "0 12px 40px rgba(0,0,0,0.45)" }}>
      <span style={{ fontFamily: "Anton", fontSize: 190, lineHeight: 0.9, color: c, WebkitTextStroke: `4px ${COL.ink}`, paintOrder: "stroke fill" }}>
        {v.toFixed(decimals).replace(".", ",")}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 10 }}>
        <span style={{ fontFamily: "Anton", fontSize: 96, lineHeight: 0.9, color: COL.ink }}>{unit}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 44, color: COL.ink, letterSpacing: "0.04em" }}>{label}</span>
        {chipText ? <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 38, color: COL.white, background: COL.ink, borderRadius: 10, padding: "4px 12px", alignSelf: "flex-start" }}>{chipText}</span> : null}
      </div>
    </div>
  );
};

/** Round rubber stamp that slams in. */
export const Stamp: React.FC<{ t: number; at: number; until: number; x: number; y: number; big: string; small: string; c?: string; size?: number }> = ({ t, at, until, x, y, big, small, c = COL.success, size = 330 }) => {
  if (t < at - 0.01 || t > until + 0.3) return null;
  const k = lerp(t, at, at + 0.16, 2.2, 1);
  const o = lerp(t, at, at + 0.08, 0, 1) * lerp(t, until, until + 0.25, 1, 0);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${k}) rotate(-6deg)`, opacity: o }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `12px solid ${c}`, background: "rgba(255,253,248,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 6px ${COL.ink}` }}>
        <span style={{ fontFamily: "Anton", fontSize: size * 0.34, color: mix(c, COL.ink, 0.4), lineHeight: 1 }}>{big}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: size * 0.12, color: COL.ink, letterSpacing: "0.06em", lineHeight: 1, marginTop: 30 }}>{small}</span>
      </div>
    </div>
  );
};

// ── karaoke caption ────────────────────────────────────────────────────────
const phrases: { words: W[]; start: number; end: number }[] = (() => {
  const out: { words: W[]; start: number; end: number }[] = [];
  let cur: W[] = [];
  const ws = WORDS as W[];
  ws.forEach((w, i) => {
    cur.push(w);
    const next = ws[i + 1];
    const endPunct = /[.?!:]$/.test(w.text) || (/,$/.test(w.text) && cur.length >= 3);
    if (!next || endPunct || cur.length >= 4 || next.start - w.end > 0.3) {
      out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  });
  return out;
})();

export const Caption: React.FC<{ t: number; offset: number; hideAfter: number }> = ({ t, offset, hideAfter }) => {
  if (t > hideAfter) return null;
  const vt = t - offset;
  let i = -1;
  for (let k = 0; k < phrases.length; k++) if (vt >= phrases[k].start - 0.05) i = k;
  const ph = phrases[i];
  return (
    <>
      {/* dark plate across the caption band, whole film (readability over the lit PCB) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1282, height: 156, background: `linear-gradient(180deg, rgba(4,14,9,0) 0%, rgba(4,14,9,0.72) 30%, rgba(4,14,9,0.72) 70%, rgba(4,14,9,0) 100%)` }} />
      {ph && vt <= ph.end + 0.6 ? (
        <div style={{ position: "absolute", left: 540, top: 1300, transform: "translateX(-50%)", maxWidth: 1000, background: "rgba(31,26,44,0.9)", borderRadius: 16, padding: "16px 30px", display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.45em", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 52, lineHeight: 1.25, whiteSpace: "nowrap" }}>
          {ph.words.map((w, k) => {
            const active = vt >= w.start && vt < w.end + 0.04;
            const past = vt >= w.end;
            return (
              <span key={k} style={{ display: "inline-block", color: active ? "#5BE39B" : past ? COL.white : "rgba(255,253,248,0.5)", transform: `scale(${active ? 1.04 : 1})` }}>
                {w.text}
              </span>
            );
          })}
        </div>
      ) : null}
    </>
  );
};
