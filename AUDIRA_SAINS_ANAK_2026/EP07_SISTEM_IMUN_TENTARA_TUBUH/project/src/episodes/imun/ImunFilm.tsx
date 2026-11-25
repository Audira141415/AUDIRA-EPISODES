// EP07 "Sistem Imun: Tentara di Dalam Tubuhmu" — AUDIRA Sains, style NANOFORGE (Remotion + R3F).
// Audio master clock: public/audio/vo.wav (79,18 s) at offset 0; film 82,6 s incl. 3,2 s AUDIRA outro card.
// Multi-scene director: 7 scenes from timeline.ts (hook · patrol · wound · macro · attack · memory · outro).
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { type WordTiming } from "../../core/hud/Subtitle.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { useFormat } from "../../core/film/format.ts";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { NANO_PALETTE as P } from "../../kits/nanoforge/lib/palette";
import { Hud } from "./Hud.tsx";
import { SCENE_FN } from "./scenes.tsx";
import { IMUN_SECONDS, OUTRO_SECONDS, SCENES, ramp, sceneAt } from "./timeline.ts";
import rawWords from "../../../public/audio/vo-words.json";

export { IMUN_SECONDS };

const WORDS: WordTiming[] = (rawWords as WordTiming[]).map((w) => ({ text: w.text, start: w.start, end: w.end }));
const CUTS = SCENES.slice(1).map((s) => s.start);

/** Karaoke: max 4 words/phrase, 0.4em gaps, dark plate at y 1300, unsaid words >= 0.78 alpha. */
const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  const s = useFormat().scale;
  const phrases = useMemo(() => {
    const out: WordTiming[][] = [];
    let cur: WordTiming[] = [];
    WORDS.forEach((w, i) => {
      if (cur.length && (w.start - WORDS[i - 1].end > 0.3 || cur.length >= 4)) {
        out.push(cur);
        cur = [];
      }
      cur.push(w);
    });
    if (cur.length) out.push(cur);
    return out;
  }, []);
  const ph = phrases.find((p) => t >= p[0].start - 0.05 && t < p[p.length - 1].end + 0.35);
  if (!ph) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 70 * s, right: 70 * s, top: 1300 * s, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.4em", rowGap: 0,
            fontFamily: FONT, fontWeight: 800, fontSize: 50 * s, lineHeight: 1.22,
            background: "rgba(4,8,20,0.74)", padding: `${14 * s}px ${26 * s}px`, borderRadius: 16 * s,
          }}
        >
          {ph.map((w, i) => {
            const active = t >= w.start && t < w.end + 0.05;
            const past = t >= w.end + 0.05;
            return (
              <span key={i} style={{ display: "inline-block", color: active ? P.thymineCyan : past ? "#FFFFFF" : "rgba(255,255,255,0.78)", transform: `scale(${active ? 1.04 : 1})` }}>
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ImunFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sc = SCENE_FN[sceneAt(t).id](t);
  const fade = Math.max(0, ...CUTS.map((c) => 1 - Math.abs(t - c) / 0.16));
  // hook: cyan flash as we dive from the room into the bloodstream (3.4 s)
  const dive = t > 3.0 && t < 3.9 ? ramp(t, 3.0, 3.4) * (1 - ramp(t, 3.4, 3.9)) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: sc.bg }}>
      <Voiceover src="audio/vo.wav" offset={0} />
      <FilmScene
        frame={frame}
        shot={sc.shot}
        background={sc.bg}
        profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
        exposure={1}
        envIntensity={0.55}
        ao
        near={0.05}
        far={200}
        fade={fade * 0.85}
        fadeColor="#000000"
      >
        <fog attach="fog" args={sc.fog} />
        {sc.node}
      </FilmScene>
      {dive > 0 && <AbsoluteFill style={{ backgroundColor: "#7ffcec", opacity: dive * 0.9, pointerEvents: "none" }} />}
      <Hud t={t} />
      {t < IMUN_SECONDS - OUTRO_SECONDS && <Karaoke t={t} />}
      <AudiraSignature seed="sains-EP07-sistem-imun" outroSeconds={OUTRO_SECONDS} />
      <AudiraOutro seconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
