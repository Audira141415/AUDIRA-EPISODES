import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Tree } from "../morph/lerpTree.ts";
import { remap } from "../../../core/motion/easing.ts";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { MANROPE, manropeReady } from "../../../core/type/fonts.ts";
import { stateAt } from "./choreography.ts";
import type { Cut } from "./cut.ts";
import { Overlay } from "./Overlay.tsx";
import type { Subject } from "./subject.ts";
import { World } from "./World.tsx";

/**
 * One TIMEFORGE film: a subject played through a cut. Compositions wrap this with a small
 * component that maps a serialisable prop (the cut id) to the subject and cut objects.
 */
export const TimeforgeFilm = <P extends Tree, Fx extends Record<string, number>>({ subject, cut }: { subject: Subject<P, Fx>; cut: Cut<P, Fx> }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Manrope"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const s = useMemo(() => stateAt(subject, cut, frame, fps), [subject, cut, frame, fps]);
  const fade = cut.fadeOut ? remap(cut.clock(frame, fps), ...cut.fadeOut) : 0;
  if (!ready) return <AbsoluteFill style={{ backgroundColor: "#e9e6e0" }} />;
  return (
    <>
      <FilmScene
        frame={frame}
        shot={{ pos: s.shot.pos, target: s.shot.target, fov: s.shot.fov, roll: s.shot.roll }}
        background="#e9e6e0"
        post={false}
        near={1}
        far={900}
        fade={fade}
        fadeColor="#ece9e3"
        overlay={() => <Overlay subject={subject} cut={cut} frame={frame} fps={fps} width={width} font={MANROPE} />}
      >
        <World subject={subject} s={s} frame={frame} font={MANROPE} />
      </FilmScene>
      {cut.vo ? (
        <Sequence from={Math.round(cut.vo.offset * fps)} layout="none">
          <Html5Audio src={staticFile(cut.vo.src)} />
        </Sequence>
      ) : null}
    </>
  );
};
