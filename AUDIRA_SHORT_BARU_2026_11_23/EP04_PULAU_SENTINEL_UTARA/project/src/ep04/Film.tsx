// EP04 Pulau Sentinel Utara — PAINTERLY 2D film (Remotion SVG/DOM, no R3F): oil/gouache paint pass, warm key + violet shadows.
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

export const EP04_SECONDS = FILM_SECONDS;

/** PAINTERLY paint pass (seeded, static): wobbly painted edges + brush-stroke value variation. Applied once to the whole scene layer. */
const PaintDefs: React.FC<{ t: number }> = ({ t }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="paint" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.016 0.03" numOctaves={3} seed={7} result="wob" />
      <feDisplacementMap in="SourceGraphic" in2="wob" scale={14} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

/** Canvas grain (seeded, static; weave pattern removed: static fine pattern parked audit:camera). */
const Canvas: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.14, pointerEvents: "none" }}>
    <filter id="canvas" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55 0.5" numOctaves={2} seed={11} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#canvas)" />
  </svg>
);

const TXT_SHADOW = "0 4px 18px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.6)";

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const pop = spring({ frame: (t - c.t) * fps, fps, config: { damping: 14, stiffness: 170, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.25, c.until);
  const x = c.x ?? 540;
  const base: React.CSSProperties = {
    position: "absolute", left: x, top: c.y, whiteSpace: "nowrap", fontFamily: "Anton", color: "#FFFFFF",
    opacity: out * Math.min(1, pop * 1.6), textShadow: TXT_SHADOW, textAlign: "center",
  };
  const bar = (w: number) => <div style={{ width: w * pop, height: 7, background: C.rimGold, margin: "10px auto 0", borderRadius: 4, boxShadow: "0 0 18px rgba(246,185,59,.6)" }} />;
  if (c.kind === "stamp") {
    const s = 1.35 - 0.35 * pop;
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) scale(${s})`, padding: "12px 34px", fontSize: 74, color: "#FF6B5E", border: "5px solid #FF6B5E", letterSpacing: 3, background: "rgba(12,10,9,.55)", borderRadius: 6 }}>
        {c.text}
      </div>
    );
  }
  if (c.kind === "big") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) scale(${0.75 + 0.25 * pop})`, fontSize: 132, letterSpacing: 1, lineHeight: 1 }}>
        {c.text}
        {bar(220)}
      </div>
    );
  }
  const chip = c.kind === "chip";
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateY(${(1 - pop) * 30}px)`, fontSize: chip ? 60 : 78, letterSpacing: 1.5, lineHeight: 1 }}>
      {c.text}
      {chip ? null : bar(140)}
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
    <div style={{ position: "absolute", left: 40, right: 40, top: 1396, height: 112, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope", fontWeight: 800, fontSize: 60, textShadow: TXT_SHADOW }}>
      {ch.map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return (
          <span key={w.id} style={{ margin: "0 0.2em", color: active ? C.rimGold : "#FFFFFF", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>
        );
      })}
    </div>
  );
};

export const Ep04Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
  <>
    <PaintDefs t={t} />
    <div style={{ position: "absolute", inset: 0, filter: "url(#paint) saturate(1.32) contrast(1.06)" }}>
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
    </div>
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", background: "radial-gradient(ellipse 80% 55% at 22% 14%, rgba(255,200,120,0.85) 0%, rgba(255,200,120,0) 70%), linear-gradient(150deg, rgba(0,0,0,0) 40%, rgba(70,40,110,0.55) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(30,16,40,0.45) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(20,10,30,.32) 45%, rgba(20,10,30,.48) 100%)" }} />
    <Canvas />
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep04Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#0C0A09", overflow: "hidden" }}>
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep04Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="sentinel-utara-ep04" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: hook frame + title. */
export const Ep04Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#0C0A09", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep04Stage t={5.2} withText={false} />
        <div style={{ position: "absolute", left: 540, top: 430, transform: "translate(-50%,-50%) scale(1.1)", whiteSpace: "nowrap", fontFamily: "Anton", fontSize: 74, color: "#FF6B5E", border: "5px solid #FF6B5E", padding: "12px 34px", background: "rgba(12,10,9,.55)", borderRadius: 6, letterSpacing: 3, textShadow: TXT_SHADOW }}>
          DILARANG MENDEKAT
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 1110, textAlign: "center", textShadow: TXT_SHADOW }}>
          <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 40, color: C.rimGold, letterSpacing: 8 }}>TELUK BENGGALA · ANDAMAN</div>
          <div style={{ fontFamily: "Anton", fontSize: 128, color: "#FFFFFF", lineHeight: 1.02, marginTop: 8 }}>PULAU SENTINEL UTARA</div>
          <div style={{ width: 260, height: 7, background: C.rimGold, margin: "16px auto 14px", borderRadius: 4 }} />
          <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 48, color: "#F2E6D4" }}>Suku yang menolak dunia luar</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
