// Config-driven film: pass beat timings, camera start, and scene content functions.
// Wires FilmScene + BeatSwitch + shotPlan so episodes skip the boilerplate.
//
//   import { FilmFromConfig, quickBeats, framingFrom } from "../templates";
//   import { orbit, pushIn } from "../templates";  // re-exported camera moves
//
//   const BEATS = quickBeats(95.2);  // from VO duration
//
//   const config: FilmConfig = {
//     beats: BEATS,
//     startFraming: framingFrom([15, 8, 30], [0, 1, 0], 32),
//     scenes: { hook: HookScene, context: CtxScene, main: MainScene, ... },
//     background: "#1a1a2e",
//     hdri: "studio",
//   };
//
//   export const Film: React.FC = () => <FilmFromConfig config={config} />;

import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { BeatSwitch } from "../core/scene/BeatSwitch.tsx";
import { shotPlan, cameraAt, type Beat } from "../core/camera/moves.ts";
import { clamp } from "../core/motion/easing.ts";
import { DEFAULT_MOVES, DEFAULT_LENS } from "./defaults.ts";
import { BEAT_NAMES, type FilmConfig, type BeatName, type BeatProps } from "./types.ts";

function beatAt(t: number, beats: FilmConfig["beats"]): [number, BeatName] {
  for (let i = BEAT_NAMES.length - 1; i >= 0; i--) {
    if (t >= beats[BEAT_NAMES[i]].start) return [i, BEAT_NAMES[i]];
  }
  return [0, "hook"];
}

function toBeatProps(
  t: number,
  timing: { start: number; end: number },
  frame: number,
  fps: number,
): BeatProps {
  const duration = timing.end - timing.start;
  return {
    progress: clamp((t - timing.start) / duration),
    elapsed: Math.max(0, t - timing.start),
    duration,
    t,
    frame,
    fps,
  };
}

export const FilmFromConfig: React.FC<{ config: FilmConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const rig = useMemo(() => {
    const all: Beat[] = [];
    for (const name of BEAT_NAMES) {
      const timing = config.beats[name];
      const custom = config.shots?.[name];
      if (custom) {
        for (const s of custom) all.push({ at: s.at ?? timing.start, move: s.move });
      } else {
        all.push({ at: timing.start, move: DEFAULT_MOVES[name] });
      }
    }
    return shotPlan(fps, config.startFraming, all);
  }, [config.beats, config.shots, config.startFraming, fps]);

  const lens = { ...DEFAULT_LENS, ...config.lens };
  const shot = cameraAt(rig, frame, fps, { lens, alive: config.alive ?? true });
  const [idx, name] = beatAt(t, config.beats);
  const bp = toBeatProps(t, config.beats[name], frame, fps);

  let fade = 0;
  if (config.fade) {
    const end = config.beats.outro.end;
    if (config.fade.in && t < config.fade.in) fade = 1 - t / config.fade.in;
    if (config.fade.out && t > end - config.fade.out)
      fade = (t - (end - config.fade.out)) / config.fade.out;
  }

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={config.background}
      hdri={config.hdri}
      exposure={config.exposure ?? lens.exposure}
      envIntensity={config.envIntensity}
      profile={config.profile}
      ao={config.ao ?? true}
      overlay={
        config.overlay ? (scale) => config.overlay!(scale, name, bp) : undefined
      }
      fade={fade}
      fadeColor={config.fade?.color}
    >
      <BeatSwitch active={idx}>
        {BEAT_NAMES.map((n) => {
          const Scene = config.scenes[n];
          const p = toBeatProps(t, config.beats[n], frame, fps);
          return (
            <group key={n}>
              <Scene {...p} />
            </group>
          );
        })}
      </BeatSwitch>
    </FilmScene>
  );
};
