// EP45 Musa dan Api di Bukit Thur — PAPERWORLD night diorama, 8 sets switched by pickSet() at the VO cuts.
import React from "react";
import { Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { Stage } from "../kits/paperworld/render/Stage.tsx";
import { QaProbe, qaNoOverlay } from "../core/qa/scene-qa.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import rawWords from "../../public/audio/vo-words.json";
import { pickSet } from "./sets.tsx";
import { Caption, Hud, Tears, type CapWord } from "./Hud.tsx";
import { T } from "./timing.ts";

// Display text: spoken spellings for TTS → written spellings on screen.
const WORDS: CapWord[] = (() => {
  const src = rawWords as { text: string; start: number; end: number }[];
  const out: CapWord[] = [];
  for (let i = 0; i < src.length; i++) {
    const w = src[i];
    let text = w.text.replace(/^Tuwa/, "Thuwa").replace(/^Audira/, "AUDIRA");
    if (/^Al$/.test(text) && src[i + 1] && /^Quran/.test(src[i + 1].text)) {
      out.push({ text: "Al-" + src[i + 1].text, start: w.start, end: src[i + 1].end });
      i++;
      continue;
    }
    out.push({ text, start: w.start, end: w.end });
  }
  return out;
})();

export const Ep45: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const f = pickSet(Math.min(s, T.outro - 0.01));
  const showHud = !qaNoOverlay();

  return (
    <>
      <FilmScene
        frame={frame}
        shot={{ pos: f.shot.pos, target: f.shot.target, fov: f.shot.fov }}
        background={f.light.bg}
        post={false}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        exposure={0.95}
        envIntensity={0.25}
        near={0.08}
        far={900}
        overlay={() =>
          showHud ? (
            <>
              {s < T.outro ? <Hud s={s} /> : null}
              {s < T.outro ? <Caption words={WORDS} s={s} /> : null}
              <Tears s={s} />
            </>
          ) : null
        }
      >
        <Stage shot={f.shot} light={f.light} frame={frame} center={f.center}>
          {f.node}
          <QaProbe />
        </Stage>
      </FilmScene>
      <AudiraOutro code="QISSAH" seconds={3} />
      <AudiraSignature seed="kisah-islam-EP45" code="QISSAH" />
      <Audio src={staticFile("audio/vo.wav")} />
    </>
  );
};
