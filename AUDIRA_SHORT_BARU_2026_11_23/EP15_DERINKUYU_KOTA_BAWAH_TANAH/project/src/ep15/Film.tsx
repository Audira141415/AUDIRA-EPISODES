// EP15 Derinkuyu — INNERWORKS 2D film (Remotion SVG/DOM, no R3F).
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

export const EP15_SECONDS = FILM_SECONDS;

const Grain: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.22, pointerEvents: "none" }}>
    <filter id="fgrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={5} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0.8 -0.3" />
    </filter>
    <rect width={1080} height={1920} filter="url(#fgrain)" />
  </svg>
);

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const pop = spring({ frame: (t - c.t) * fps, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.25, c.until);
  const x = c.x ?? 540;
  const base: React.CSSProperties = {
    position: "absolute", left: x, top: c.y, whiteSpace: "nowrap", color: C.ink, textAlign: "center",
    background: "rgba(244,247,246,.95)", borderRadius: 18, opacity: out * Math.min(1, pop * 1.6),
    boxShadow: "0 18px 34px rgba(20,40,50,.26)", border: `3px solid ${C.cyan}`,
  };
  if (c.kind === "stamp") {
    const s = 1.5 - 0.5 * pop;
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) rotate(${c.rot ?? -6}deg) scale(${s})`, padding: "14px 34px", fontFamily: "Anton", fontSize: 80, color: C.red, border: `8px solid ${C.red}`, letterSpacing: 2 }}>
        {c.text}
      </div>
    );
  }
  if (c.kind === "big") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * pop})`, padding: "10px 48px 18px" }}>
        <div style={{ fontFamily: "Anton", fontSize: c.size ?? 136, lineHeight: 1.05, letterSpacing: 2 }}>
          <span style={{ backgroundImage: `linear-gradient(transparent 70%, ${C.orange} 70%, ${C.orange} 90%, transparent 90%)` }}>{c.text}</span>
        </div>
        {c.sub ? <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 38, color: "#2f6f80", letterSpacing: 3, marginTop: 2 }}>{c.sub}</div> : null}
      </div>
    );
  }
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateY(${(1 - pop) * 40}px)`, padding: "18px 44px 18px 58px", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: c.size ?? 64, letterSpacing: 1.5 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: C.cyan, borderRadius: "14px 0 0 14px" }} />
      {c.text}
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
    if (!next || /[.,:!?]$/.test(w.text) || cur.length >= 4 || len > 17 || next.start - w.end > 0.35) { out.push(cur); cur = []; }
  });
  return out;
})();

const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  if (t > FILM_SECONDS - OUTRO_SECONDS) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.08 && (i === CHUNKS.length - 1 ? t <= ch[ch.length - 1].end + 0.6 : t < CHUNKS[i + 1][0].start - 0.08));
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1428, height: 112, borderRadius: 26, background: "rgba(29,43,51,.88)", boxShadow: "0 14px 28px rgba(20,40,50,.3)", borderTop: `4px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 60 }}>
      {ch.map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return (
          <span key={w.id} style={{ margin: "0 0.2em", color: active ? "#ffb35c" : "#F4F7F6", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>
        );
      })}
    </div>
  );
};

export const Ep15Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
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
    <Grain />
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep15Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.studio, overflow: "hidden" }}>
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep15Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="derinkuyu-ep15" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: city cutaway + title. */
export const Ep15Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.studio, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep15Stage t={64.2} withText={false} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 200, padding: "22px 30px 26px", background: "rgba(29,43,51,.92)", borderRadius: 22, borderTop: `6px solid ${C.cyan}`, textAlign: "center", boxShadow: "0 18px 34px rgba(20,40,50,.3)" }}>
          <div style={{ fontFamily: "Anton", fontSize: 128, color: "#F4F7F6", lineHeight: 1.0, letterSpacing: 2 }}>KOTA <span style={{ color: C.orange }}>85 M</span> DI BAWAH TANAH</div>
          <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 46, color: "#8fe6f3", marginTop: 12, letterSpacing: 3 }}>DERINKUYU · 20.000 ORANG</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
