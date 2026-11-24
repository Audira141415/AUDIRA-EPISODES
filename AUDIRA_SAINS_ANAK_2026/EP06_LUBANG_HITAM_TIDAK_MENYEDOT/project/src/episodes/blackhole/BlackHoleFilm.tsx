// EP06 "Lubang Hitam Tidak Menyedot — Ini yang Sebenarnya Terjadi" — AUDIRA Sains, style SCALEFORGE (Remotion + R3F).
// Audio master clock: public/audio/vo.wav (85,50 s) at offset 0; film 89,0 s incl. 3,2 s AUDIRA outro card.
// Multi-scene director: 7 scenes from timeline.ts (hook · squeeze · sunswap · horizon · disk · sgra · outro).
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
import { SCALE_PALETTE as P } from "../../kits/scaleforge/lib/palette";
import { StarSphere } from "./bodies.tsx";
import { Hud } from "./Hud.tsx";
import { SCENE_FN } from "./scenes.tsx";
import { BLACKHOLE_SECONDS, OUTRO_SECONDS, SCENES, sceneAt } from "./timeline.ts";
import rawWords from "../../../public/audio/vo-words.json";

export { BLACKHOLE_SECONDS };

const WORDS: WordTiming[] = (rawWords as WordTiming[]).map((w) => ({
  text: w.text.replace(/^Es$/, "S"),
  start: w.start,
  end: w.end,
}));
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
            background: "rgba(8,12,20,0.72)", padding: `${14 * s}px ${26 * s}px`, borderRadius: 16 * s,
          }}
        >
          {ph.map((w, i) => {
            const active = t >= w.start && t < w.end + 0.05;
            const past = t >= w.end + 0.05;
            return (
              <span key={i} style={{ display: "inline-block", color: active ? P.accent : past ? "#FFFFFF" : "rgba(255,255,255,0.78)", transform: `scale(${active ? 1.04 : 1})` }}>
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BlackHoleFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sc = SCENE_FN[sceneAt(t).id](t);
  const fade = Math.max(0, ...CUTS.map((c) => 1 - Math.abs(t - c) / 0.16));

  return (
    <AbsoluteFill style={{ backgroundColor: "#070B18" }}>
      <Voiceover src="audio/vo.wav" offset={0} />
      <FilmScene
        frame={frame}
        shot={sc.shot}
        background="#070B18"
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={1}
        envIntensity={0.55}
        ao={false}
        near={0.05}
        far={2000}
        fade={fade * 0.85}
        fadeColor="#000000"
      >
        <StarSphere radius={600} dense={!!sc.dense} />
        <ambientLight intensity={sc.fill} />
        <hemisphereLight args={["#BFD4FF", "#1A1410", sc.fill * 0.6]} />
        <directionalLight
          position={sc.sunPos}
          intensity={sc.sunI}
          color={sc.sunColor}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-6, -2, 6]} intensity={0.18} color="#7EA6FF" />
        {sc.node}
      </FilmScene>
      <Hud t={t} />
      {t < BLACKHOLE_SECONDS - OUTRO_SECONDS && <Karaoke t={t} />}
      <AudiraSignature seed="sains-EP06-lubang-hitam" outroSeconds={OUTRO_SECONDS} />
      <AudiraOutro seconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
