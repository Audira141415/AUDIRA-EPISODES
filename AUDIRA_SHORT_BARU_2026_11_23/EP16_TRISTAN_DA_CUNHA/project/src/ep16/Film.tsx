// EP16 Tristan da Cunha — HISTORYMAP 2D film (Remotion SVG/DOM, no R3F).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { displayFontsReady } from "../core/type/displayFonts";
import { manropeReady } from "../core/type/fonts";
import { AudiraOutro } from "../brand/AudiraOutro";
import { AudiraSignature } from "../brand/AudiraSignature";
import { SCENES, CALLOUTS, XFADE, OUTRO_SECONDS, FILM_SECONDS, type Callout } from "./timing";
import { SCENE_MAP } from "./scenes";
import { C, ease, ramp } from "./pieces";
import words from "../../public/audio/vo-words.json";

displayFontsReady();
manropeReady();

export const EP16_SECONDS = FILM_SECONDS;

const KICKER: Record<string, string> = {
  S1: "ATLANTIK SELATAN // 37°S 12°W", S2: "ATLANTIK SELATAN // 37°S 12°W", S3: "TAHUN 1506 // TRISTÃO DA CUNHA",
  S4: "RUTE TERDEKAT // CAPE TOWN", S5: "QUEEN MARY'S PEAK // GUNUNG API", S6: "PENDUDUK // 2026", S7: "SATU-SATUNYA DESA",
  S8: "EKONOMI PULAU", S9: "AKSES // HANYA LAUT", S10: "ATURAN TANAH", S11: "10 OKTOBER 1961 // LETUSAN",
  S12: "EVAKUASI // 1961", S13: "KEMBALI // 1963", S14: "PELABUHAN // TRISTAN DA CUNHA", S15: "AUDIRA // FAKTA DUNIA",
};

const Grain: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
    <filter id="grain16" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={16} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#grain16)" />
  </svg>
);

/** Printed-chart paper: warm fibre mottle (multiply) so flat fills read as ink on paper. */
const Paper: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.32, pointerEvents: "none" }}>
    <filter id="paper16" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves={4} seed={3} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.5  0 0 0 0 0.36  0 0 0 0.9 -0.1" />
    </filter>
    <rect width={1080} height={1920} filter="url(#paper16)" />
  </svg>
);

const TXT_SHADOW = "0 4px 18px rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.6)";
const PLATE = "rgba(14,18,26,.9)";

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const pop = spring({ frame: (t - c.t) * fps, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.22, c.until);
  const x = c.x ?? 540;
  const base: React.CSSProperties = {
    position: "absolute", left: x, top: c.y, whiteSpace: "nowrap", color: C.cream, opacity: out * Math.min(1, pop * 1.6),
    textAlign: "left", boxShadow: "0 14px 34px rgba(0,0,0,.5)",
  };
  if (c.kind === "stamp") {
    const s = 1.4 - 0.4 * pop;
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) rotate(${c.rot ?? -5}deg) scale(${s})`, padding: "10px 30px", fontFamily: "Anton", fontSize: 76, color: "#FF5A5E", border: "6px solid #FF5A5E", letterSpacing: 3, background: "rgba(14,10,12,.82)" }}>
        {c.text}
      </div>
    );
  }
  const big = c.kind === "big";
  const chip = c.kind === "chip";
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateX(${(1 - pop) * -40}px)`, background: PLATE, borderLeft: `${chip ? 8 : 12}px solid ${C.red}`, padding: chip ? "10px 26px" : big ? "14px 40px 18px" : "16px 36px" }}>
      <div style={{ fontFamily: "Anton", fontSize: big ? 132 : chip ? 52 : 76, lineHeight: 1.02, letterSpacing: 1.5, textShadow: TXT_SHADOW }}>{c.text}</div>
      {c.sub ? <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 36, color: "#FF6A6E", letterSpacing: 2, marginTop: 6 }}>{c.sub}</div> : null}
    </div>
  );
};

type W = { id: string; text: string; start: number; end: number };
const WORDS = (words as W[]).map((w) => ({ ...w, text: w.text.replace(/^Audira/, "AUDIRA") }));
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const len = cur.map((x) => x.text).join(" ").length;
    if (!next || /[.,:!?]$/.test(w.text) || cur.length >= 4 || len > 20 || next.start - w.end > 0.35) { out.push(cur); cur = []; }
  });
  // merge a 1-word orphan into the previous chunk when it still fits
  return out.reduce<W[][]>((acc, ch) => {
    const prev = acc[acc.length - 1];
    if (prev && ch.length === 1 && !/[.,:!?]$/.test(prev[prev.length - 1].text) && [...prev, ...ch].map((x) => x.text).join(" ").length <= 24) prev.push(...ch);
    else acc.push(ch);
    return acc;
  }, []);
})();

const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  if (t > FILM_SECONDS - OUTRO_SECONDS) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.08 && (i === CHUNKS.length - 1 ? t <= ch[ch.length - 1].end + 0.6 : t < CHUNKS[i + 1][0].start - 0.08));
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1428, height: 112, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 60, textShadow: TXT_SHADOW }}>
      {ch.map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return <span key={w.id} style={{ margin: "0 0.2em", color: active ? C.goldHi : "#FFFFFF", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>;
      })}
    </div>
  );
};

const Kicker: React.FC<{ t: number }> = ({ t }) => {
  if (t > FILM_SECONDS - OUTRO_SECONDS) return null;
  const sc = [...SCENES].reverse().find((s) => t >= s.start) ?? SCENES[0];
  const k = ease(ramp(t, sc.start, sc.start + 0.4));
  return (
    <div style={{ position: "absolute", left: 60, top: 196, fontFamily: "Manrope", fontWeight: 800, fontSize: 42, letterSpacing: 3, color: "#FF6A6E", opacity: k, background: "rgba(14,18,26,.72)", padding: "6px 16px", textShadow: TXT_SHADOW, whiteSpace: "nowrap" }}>
      ● <span style={{ color: C.cream }}>{KICKER[sc.id]}</span>
    </div>
  );
};

export const Ep16Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
  <>
    {SCENES.map((sc, i) => {
      if (t < sc.start || t > sc.end + XFADE) return null;
      const op = i === 0 ? 1 : ease((t - sc.start) / XFADE);
      const Comp = SCENE_MAP[sc.id];
      return (
        <div key={sc.id} style={{ position: "absolute", inset: 0, opacity: op }}>
          <Comp t={t} lt={t - sc.start} />
        </div>
      );
    })}
    {/* warm key-light pool (top-left) + cool shade bottom-right, fades in after the hook */}
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", opacity: 0.5 + 0.5 * ramp(t, 4, 7), background: "radial-gradient(ellipse 75% 50% at 28% 30%, rgba(255,206,140,0.9) 0%, rgba(255,206,140,0) 70%), linear-gradient(150deg, rgba(0,0,0,0) 45%, rgba(4,10,24,0.6) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 50%, rgba(3,5,10,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,.55) 100%)" }} />
    <Paper />
    <Grain />
    {withText ? <Kicker t={t} /> : null}
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep16Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep16Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="tristan-da-cunha-ep16" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: map hook frame + title. */
export const Ep16Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep16Stage t={5.6} withText={false} />
        <div style={{ position: "absolute", left: 60, top: 220, fontFamily: "Manrope", fontWeight: 800, fontSize: 38, letterSpacing: 3, color: "#FF6A6E", background: "rgba(14,18,26,.8)", padding: "6px 16px" }}>● <span style={{ color: C.cream }}>ATLANTIK SELATAN // 37°S 12°W</span></div>
        <div style={{ position: "absolute", left: 540, top: 420, transform: "translate(-50%,-50%)", background: PLATE, borderLeft: `12px solid ${C.red}`, padding: "14px 40px 18px", color: C.cream, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "Anton", fontSize: 132, lineHeight: 1.02 }}>2.437 KM</div>
          <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 36, color: "#FF6A6E", letterSpacing: 2 }}>KE TETANGGA TERDEKAT</div>
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 1060, background: PLATE, borderLeft: `12px solid ${C.red}`, padding: "26px 36px 30px", textShadow: TXT_SHADOW }}>
          <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 34, color: C.goldHi, letterSpacing: 6 }}>PULAU PALING TERPENCIL</div>
          <div style={{ fontFamily: "Anton", fontSize: 120, color: C.cream, lineHeight: 1.02, marginTop: 6 }}>TRISTAN DA CUNHA</div>
          <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 42, color: "#E6DCC6", marginTop: 8 }}>±220 orang · tanpa bandara</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
