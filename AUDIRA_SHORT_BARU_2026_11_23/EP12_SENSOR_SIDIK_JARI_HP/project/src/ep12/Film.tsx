// EP12 Sensor Sidik Jari HP — BONGKAR 2D film (Remotion SVG/DOM, no R3F).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, delayRender, continueRender } from "remotion";
import { displayFontsReady } from "../core/type/displayFonts";
import { AudiraOutro } from "../brand/AudiraOutro";
import { AudiraSignature } from "../brand/AudiraSignature";
import { SCENES, CALLOUTS, XFADE, OUTRO_SECONDS, FILM_SECONDS, type Callout } from "./timing";
import { SCENE_MAP } from "./scenes";
import { C, FONT, ease, ramp } from "./pieces";
import words from "../../public/audio/vo-words.json";

displayFontsReady();

// Plus Jakarta Sans (BONGKAR kit face, SIL OFL) — hold the render until loaded.
let jakarta: Promise<void> | null = null;
const jakartaReady = () => {
  if (jakarta || typeof document === "undefined") return;
  const h = delayRender("Plus Jakarta Sans");
  jakarta = Promise.all(
    [["500", "Medium"], ["700", "Bold"], ["800", "ExtraBold"]].map(async ([w, n]) => {
      const f = new FontFace(FONT, `url(${staticFile(`fonts/PlusJakartaSans_${w}${n}.ttf`)}) format("truetype")`, { weight: w });
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(() => continueRender(h), () => continueRender(h));
};
jakartaReady();

export const EP12_SECONDS = FILM_SECONDS;

const Grain: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.16, pointerEvents: "none" }}>
    <filter id="grain12" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={12} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.4  0 0 0 0 0.4  0 0 0 0.8 -0.2" />
    </filter>
    <rect width={1080} height={1920} filter="url(#grain12)" />
  </svg>
);

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const pop = spring({ frame: (t - c.t) * fps, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const out = 1 - ramp(t, c.until - 0.25, c.until);
  const x = c.x ?? 540;
  const base: React.CSSProperties = { position: "absolute", left: x, top: c.y, whiteSpace: "nowrap", fontFamily: FONT, opacity: out * Math.min(1, pop * 1.6) };
  if (c.kind === "stamp") {
    const s = 1.5 - 0.5 * pop;
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) rotate(${c.rot ?? -6}deg) scale(${s})`, padding: "10px 34px", fontSize: 78, fontWeight: 800, color: C.red, border: `8px solid ${C.red}`, borderRadius: 14, background: "rgba(255,255,255,.92)", letterSpacing: 2 }}>
        {c.text}
      </div>
    );
  }
  if (c.kind === "big") {
    return (
      <div style={{ ...base, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * pop})`, padding: "10px 46px 16px", background: "rgba(255,255,255,.9)", borderRadius: 22, boxShadow: "0 18px 40px rgba(30,25,20,.18)", display: "flex", alignItems: "baseline", gap: 18 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: C.red, alignSelf: "center" }} />
        <span style={{ fontSize: c.text.length > 6 ? 112 : 132, fontWeight: 800, color: C.ink, letterSpacing: -2 }}>{c.text}</span>
        {c.sub ? <span style={{ fontSize: 46, fontWeight: 500, color: C.grey }}>{c.sub}</span> : null}
      </div>
    );
  }
  return (
    <div style={{ ...base, transform: `translate(-50%,-50%) translateY(${(1 - pop) * 40}px)`, padding: "14px 36px", fontSize: 60, fontWeight: 800, color: C.white, background: C.chip, borderRadius: 14, boxShadow: "0 14px 30px rgba(0,0,0,.22)", display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ width: 18, height: 18, borderRadius: 9, background: C.red }} />
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
  const chars = ch.map((w) => w.text).join(" ").length;
  const fs = chars > 30 ? 46 : chars > 24 ? 52 : 58;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1418, height: 112, borderRadius: 22, background: "rgba(27,27,28,.9)", boxShadow: "0 14px 30px rgba(0,0,0,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: fs }}>
      {ch.map((w) => {
        const active = t >= w.start && t < w.end + 0.05;
        const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
        return (
          <span key={w.id} style={{ margin: "0 0.2em", color: active ? C.orange : "#ffffff", transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>
        );
      })}
    </div>
  );
};

export const Ep12Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
  <>
    {SCENES.map((sc, i) => {
      if (t < sc.start || t > sc.end + XFADE) return null;
      const op = i === 0 ? 1 : ease((t - sc.start) / XFADE);
      const Comp = SCENE_MAP[sc.id];
      // Continuous camera: slow push-in + vertical drift + slight roll, alternating per scene.
      const p = Math.min(1, Math.max(0, (t - sc.start) / (sc.end + XFADE - sc.start)));
      const dir = i % 2 === 0 ? 1 : -1;
      // G13 (medianSpeed >= 0.04): lateral sine sway + stronger drift/roll keep the frame moving mid-scene.
      const sway = Math.sin(p * Math.PI * 2) * 34;
      const cam = sc.id === "S10" ? "none" : `translate(${dir * sway}px, ${dir * (p - 0.5) * 70}px) rotate(${dir * (p - 0.5) * 1.6}deg) scale(${0.975 + 0.06 * p})`;
      return (
        <div key={sc.id} style={{ position: "absolute", inset: 0, opacity: op, transform: cam, transformOrigin: "540px 900px" }}>
          <Comp t={t} lt={t - sc.start} />
        </div>
      );
    })}
    <Grain />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,38,34,0.18) 100%)" }} />
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep12Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.bgTop, overflow: "hidden" }}>
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep12Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="sensor-sidik-jari-hp-ep12" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: exploded phone + finger + title. */
export const Ep12Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.bgTop, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep12Stage t={37.0} withText={false} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, height: 300, background: C.bgTop }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", fontFamily: FONT }}>
          <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.red }}>BONGKAR · AUDIRA EXPLAINED</div>
          <div style={{ fontWeight: 800, fontSize: 104, color: C.ink, lineHeight: 1.05, marginTop: 14 }}>Sensor Sidik Jari</div>
          <div style={{ fontWeight: 500, fontSize: 50, color: C.grey, marginTop: 8 }}>yang dicocokkan bukan foto</div>
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 1400, padding: "26px 30px", background: C.chip, borderRadius: 22, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: C.white }}>
          <span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 11, background: C.red, marginRight: 18 }} />
          3 cara HP membaca jarimu
        </div>
      </div>
    </AbsoluteFill>
  );
};
