// EP11 Cara mesin ATM & setor tunai mendeteksi uang palsu — INNERWORKS 2D film (Remotion SVG/DOM, no R3F).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { displayFontsReady } from "../core/type/displayFonts";
import { manropeReady } from "../core/type/fonts";
import { AudiraOutro } from "../brand/AudiraOutro";
import { AudiraSignature } from "../brand/AudiraSignature";
import { SCENES, CALLOUTS, XFADE, OUTRO_SECONDS, FILM_SECONDS, type Callout } from "./timing";
import { SCENE_MAP } from "./scenes";
import { K, ease, ramp } from "./pieces";
import words from "../../public/audio/vo-words.json";

displayFontsReady();
manropeReady();

export const EP11_SECONDS = FILM_SECONDS;

const Grain: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "multiply", pointerEvents: "none" }}>
    <filter id="g11" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={5} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.25  0 0 0 0 0.27  0 0 0 0.6 -0.25" />
    </filter>
    <rect width={1080} height={1920} filter="url(#g11)" />
  </svg>
);

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const p = spring({ frame: (t - c.t) * fps, fps, config: { damping: 14, stiffness: 200, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.22, c.until);
  const x = c.x ?? 540;
  const base: React.CSSProperties = {
    position: "absolute", left: x, top: c.y, whiteSpace: "nowrap", fontFamily: "Anton", color: c.color ?? K.ink,
    background: K.chip, borderRadius: 18, opacity: out * Math.min(1, p * 1.6),
    boxShadow: "0 14px 30px rgba(29,43,51,.25)",
  };
  if (c.kind === "plate") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) translateY(${(1 - p) * -40}px)`, background: K.ink, color: "#fff", padding: "18px 40px", fontSize: 66, letterSpacing: 1.5, borderBottom: `8px solid ${K.orange}` }}>
        {c.text}
      </div>
    );
  }
  if (c.kind === "stamp") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) rotate(${c.rot ?? -6}deg) scale(${1.5 - 0.5 * p})`, padding: "12px 38px", fontSize: 92, color: K.bad, border: `9px solid ${K.bad}`, letterSpacing: 3 }}>
        {c.text}
      </div>
    );
  }
  if (c.kind === "big") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * p})`, padding: "8px 44px 16px", fontSize: 104, letterSpacing: 2, borderLeft: `14px solid ${K.cyan}` }}>
        <span style={{ backgroundImage: `linear-gradient(transparent 62%, rgba(255,122,61,.45) 62%, rgba(255,122,61,.45) 90%, transparent 90%)` }}>{c.text}</span>
      </div>
    );
  }
  const chip = c.kind === "chip";
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateY(${(1 - p) * 40}px)`, padding: chip ? "10px 28px" : "14px 40px", fontSize: chip ? 46 : 70, letterSpacing: 1.2, borderLeft: `12px solid ${c.color ?? K.cyan}`, fontFamily: chip ? "Space Grotesk" : "Anton", fontWeight: chip ? 700 : 400 }}>
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
    <div style={{ position: "absolute", left: 40, right: 40, top: 1400, height: 112, borderRadius: 26, background: "rgba(29,43,51,.88)", boxShadow: "0 14px 30px rgba(29,43,51,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 60 }}>
      {ch.map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return (
          <span key={w.id} style={{ margin: "0 0.2em", color: active ? "#ffb070" : "#f4f7f6", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>
        );
      })}
    </div>
  );
};

export const Ep11Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
  <>
    {SCENES.map((sc, i) => {
      if (t < sc.start || t > sc.end + XFADE || t > FILM_SECONDS - OUTRO_SECONDS + 0.6) return null; // hidden under the outro card
      const op = i === 0 ? 1 : ease((t - sc.start) / XFADE);
      const Comp = SCENE_MAP[sc.id];
      return (
        <div key={sc.id} style={{ position: "absolute", inset: 0, opacity: op }}>
          <Comp t={t} lt={t - sc.start} />
        </div>
      );
    })}
    <Grain />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(29,43,51,0.18) 100%)" }} />
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep11Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: K.paper, overflow: "hidden" }}>
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep11Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="atm-uang-palsu-ep11" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: hook frame + title. */
export const Ep11Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: K.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep11Stage t={6.6} withText={false} />
        <div style={{ position: "absolute", left: 540, top: 300, transform: "translate(-50%,-50%)", whiteSpace: "nowrap", fontFamily: "Anton", fontSize: 70, color: "#fff", background: K.ink, padding: "18px 40px", borderRadius: 18, borderBottom: `8px solid ${K.orange}` }}>
          MATA MESIN vs UANG PALSU
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 1360, padding: "26px 30px 30px", background: K.chip, borderRadius: 24, boxShadow: "0 14px 30px rgba(29,43,51,.25)", borderLeft: `16px solid ${K.cyan}`, textAlign: "center" }}>
          <div style={{ fontFamily: "Anton", fontSize: 104, color: K.ink, lineHeight: 1.05 }}>CARA ATM DETEKSI UANG PALSU</div>
          <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 46, color: K.cyanTx, marginTop: 10 }}>Rahasia di balik slot setor tunai</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
