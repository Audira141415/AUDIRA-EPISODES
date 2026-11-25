// EP18 Longyearbyen, Svalbard — PAPERWORLD 2D film (Remotion SVG/DOM, no R3F).
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

export const EP18_SECONDS = FILM_SECONDS;

const Fiber: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.42, pointerEvents: "none" }}>
    <filter id="fiber" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85 0.3" numOctaves={3} seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.27  0.9 0 0 0 -0.35" />
    </filter>
    <rect width={1080} height={1920} filter="url(#fiber)" />
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves={2} seed={3} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 1.1 -0.45" />
    </filter>
    <rect width={1080} height={1920} filter="url(#mottle)" opacity={0.5} />
  </svg>
);

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const pop = spring({ frame: (t - c.t) * fps, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.25, c.until);
  const x = c.x ?? 540;
  const base: React.CSSProperties = {
    position: "absolute", left: x, top: c.y, whiteSpace: "nowrap", fontFamily: "Anton", color: C.ink,
    background: "#FFF6E6", borderRadius: 12, opacity: out * Math.min(1, pop * 1.6),
    boxShadow: "10px 14px 18px rgba(40,25,15,.28), 3px 4px 0 #E6D6BC",
  };
  const tape = <div style={{ position: "absolute", left: "50%", top: -20, width: 130, height: 38, marginLeft: -65, background: "rgba(242,183,91,.78)", transform: "rotate(-3deg)" }} />;
  if (c.kind === "stamp") {
    const s = 1.5 - 0.5 * pop;
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) rotate(${c.rot ?? -6}deg) scale(${s})`, padding: "14px 34px", fontSize: 76, color: C.red, border: `8px solid ${C.red}`, letterSpacing: 2, background: "rgba(255,246,230,.94)" }}>
        {c.text}
      </div>
    );
  }
  if (c.kind === "big") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * pop}) rotate(-1.5deg)`, padding: "6px 44px 14px", fontSize: 128, letterSpacing: 2 }}>
        {tape}
        <span style={{ backgroundImage: `linear-gradient(transparent 58%, ${C.gold} 58%, ${C.gold} 92%, transparent 92%)` }}>{c.text}</span>
      </div>
    );
  }
  const chip = c.kind === "chip";
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateY(${(1 - pop) * 40}px) rotate(${chip ? 0 : -1}deg)`, padding: chip ? "10px 28px" : "16px 40px", fontSize: chip ? 58 : 72, letterSpacing: 1.5 }}>
      {chip ? null : tape}
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
    if (!next || /[.,:!?]$/.test(w.text) || cur.length >= 4 || len > 20 || next.start - w.end > 0.35) { out.push(cur); cur = []; }
  });
  return out;
})();

const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  if (t > FILM_SECONDS - OUTRO_SECONDS) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.08 && (i === CHUNKS.length - 1 ? t <= ch[ch.length - 1].end + 0.6 : t < CHUNKS[i + 1][0].start - 0.08));
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1428, height: 112, borderRadius: 26, background: "rgba(42,33,27,.84)", boxShadow: "10px 14px 18px rgba(40,25,15,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 60 }}>
      {ch.map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return (
          <span key={w.id} style={{ margin: "0 0.2em", color: active ? C.gold : "#FFF6E6", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>
        );
      })}
    </div>
  );
};

export const Ep18Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
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
    <Fiber />
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", background: "radial-gradient(ellipse 75% 55% at 24% 16%, rgba(255,236,190,0.75) 0%, rgba(255,236,190,0) 70%), linear-gradient(140deg, rgba(0,0,0,0) 45%, rgba(50,28,14,0.45) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(70,40,22,0.24) 100%)" }} />
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep18Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep18Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="svalbard-ep18" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: hook frame + title. */
export const Ep18Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.ivory, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep18Stage t={4.6} withText={false} />
        <div style={{ position: "absolute", left: 540, top: 470, transform: "translate(-50%,-50%) rotate(-7deg)", whiteSpace: "nowrap", fontFamily: "Anton", fontSize: 84, color: C.red, border: `9px solid ${C.red}`, padding: "14px 36px", background: "rgba(255,246,230,.94)", borderRadius: 12, boxShadow: "10px 14px 18px rgba(40,25,15,.28)" }}>
          DILARANG MATI?
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 1285, padding: "22px 30px 26px", background: "#FFF6E6", borderRadius: 16, boxShadow: "10px 14px 18px rgba(40,25,15,.28), 3px 4px 0 #E6D6BC", textAlign: "center" }}>
          <div style={{ fontFamily: "Anton", fontSize: 112, color: C.ink, lineHeight: 1.05 }}>LONGYEARBYEN</div>
          <div style={{ fontFamily: "Manrope", fontWeight: 600, fontSize: 48, color: "#6A4E3A", marginTop: 10 }}>Kota tempat orang dilarang mati</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
