// EP77 Katakombe Paris — CHRONICLE, Remotion + R3F. Film clock = VO clock (offset 0).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotCanvas } from "../kits/chronicle/ShotCanvas.tsx";
import { chronicleFontsReady, F_CITE, F_LABEL, F_STAMP } from "../kits/chronicle/fonts.ts";
import { Subtitle, type WordTiming } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import { FILM_SECONDS, OUTRO_SECONDS, CARDS, cameraAt, shotAt, type Card } from "./timeline.ts";
import { LOOKS, SCENES } from "./scenes.tsx";
import { clamp01 } from "./parts.tsx";
import { PaperSkin } from "./paper.tsx";
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

// Display spelling for the subtitles (the TTS text is phonetic).
const DISPLAY: Record<string, string> = { Ru: "Rue", Danfer: "d'Enfer", Lui: "Louis", Erikar: "Héricart", Turi: "Thury", Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (() => {
  const src = words as WordTiming[];
  const out: WordTiming[] = [];
  for (let i = 0; i < src.length; i++) {
    const w = src[i];
    if (w.text === "San" && src[i + 1]?.text.startsWith("Inosan")) {
      out.push({ ...w, text: "Saints-Innocents" + src[i + 1].text.slice(6), end: src[i + 1].end });
      i++;
      continue;
    }
    const m = w.text.match(/^([^.,!?:]+)([.,!?:]*)$/);
    out.push(m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w);
  }
  return out;
})();

// ---------- HUD card: dark ink plate, contour-colour top rule, Anton numbers (layout px 1080 × 1920)
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
const backOut = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
// PAPERWORLD cards: ivory cardstock, ink type, coloured paper strip per tone.
const TONE = { hero: "#e7b54a", grief: "#5f7cb6", foe: "#c4614f", neutral: "#6eaa93" } as const;
const CARD_BG = "#f3ead9", CARD_INK = "#3b2a22";

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const inA = clamp01((t - c.from) / 0.28);
  const out = clamp01((c.to - t) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = 0.86 + 0.14 * backOut(inA);
  const accent = TONE[c.tone ?? "neutral"];
  const n = c.count ? c.count.to * clamp01((t - c.from) / 0.6) : 0;
  if (c.quote) {
    return (
      <div style={{ position: "absolute", top: 250, left: 70, right: 70, opacity: out, transform: `translateX(${(1 - backOut(inA)) * -40}px)` }}>
        <div style={{ background: CARD_BG, borderLeft: `14px solid ${accent}`, borderRadius: 6, padding: "26px 36px", boxShadow: "6px 10px 0 rgba(59,42,34,0.35)", transform: "rotate(-1deg)" }}>
          <div style={{ fontFamily: F_CITE, fontStyle: "italic", fontSize: 62, lineHeight: 1.15, color: CARD_INK }}>{c.title}</div>
          {c.sub ? <div style={{ fontFamily: F_LABEL, fontWeight: 700, fontSize: 40, letterSpacing: 2, color: "rgba(59,42,34,0.9)", marginTop: 14 }}>{c.sub}</div> : null}
        </div>
      </div>
    );
  }
  const long = c.title.length > 14;
  return (
    <div style={{ position: "absolute", top: Math.max(250, c.y ?? 250), left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          opacity: Math.min(out, clamp01(inA * 2.5)),
          background: CARD_BG,
          color: CARD_INK,
          borderRadius: 6,
          borderTop: `14px solid ${accent}`,
          boxShadow: "8px 12px 0 rgba(59,42,34,0.35)",
          padding: "20px 46px 24px",
          textAlign: "center",
          maxWidth: 940,
        }}
      >
        {c.count ? (
          <>
            <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 42, letterSpacing: 6, color: CARD_INK, opacity: 0.85 }}>{c.title}</div>
            <div style={{ fontFamily: F_STAMP, fontSize: c.count.to >= 1e6 ? 110 : 128, lineHeight: 1.05, letterSpacing: 1 }}>
              {c.count.prefix ?? ""}
              {idNum(n, c.count.decimals)}
              <span style={{ fontSize: 58, marginLeft: 6 }}>{c.count.suffix}</span>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: F_STAMP, fontSize: long ? 78 : 112, lineHeight: 1.05, letterSpacing: 2 }}>{c.title}</div>
        )}
        {c.sub ? <div style={{ fontFamily: F_LABEL, fontWeight: 600, fontSize: 42, letterSpacing: 2, marginTop: 6, color: "rgba(59,42,34,0.9)" }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number; width: number }> = ({ t, width }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", pointerEvents: "none" }}>
    {CARDS.map((c, i) => (
      <HudCard key={i} c={c} t={t} />
    ))}
  </div>
);

export const KatakombeFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const [h] = useState(() => delayRender("chronicle fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    chronicleFontsReady().then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  const cam = cameraAt(t);
  const id = shotAt(t).scene;
  const Scene = SCENES[id];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ShotCanvas key={id} shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }} look={LOOKS[id]} frame={frame}>
        <Scene t={t} />
        <PaperSkin />
      </ShotCanvas>
      {ok ? <Hud t={t} width={width} /> : null}
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(59,42,34,0.88)" activeColor="#f2d58e" baseColor="#faf4e8" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="katakombe-paris-ep77" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
