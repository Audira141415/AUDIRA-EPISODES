// FILM16 technical example (12 s): a kitchen corner shot on 16mm for a documentary. The radio warms up
// and is tuned (dial reads AUDIRA), the camera drifts to the tea, crash-zooms into the steam, tilts up
// to the window with dust in the sun beam, widens to the whole corner, and the roll runs out.
//
// 0.0–2.4   macro on the dial: valves glow, the needle sweeps to the station (hook)
// 2.6–6.2   typewriter caption; drift to the cup; crash zoom into the steam at 5.0
// 6.2–9.2   tilt up to the window: curtain breathing, mullion shadows, dust, halation round the glass
// 9.2–10.9  wide of the corner
// 10.9–12   end of roll: light leak, flash, black
//
// FilmScene provides the canvas, PoseCamera, and Finish (with DoF). FilmGate wraps the outside for
// gate weave, light leaks, run-out flash, and the typewriter caption.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { Kitchen3D, TABLE_Y, WINDOW } from "../scene/Kitchen3D.tsx";
import { Radio3D, Teacup3D } from "../scene/Radio3D.tsx";
import { FilmGate } from "../camera/FilmGate.tsx";
import { getFilm16Camera, FILM16_SECONDS, RUN_OUT } from "../camera/rig.ts";
import { filmTime, smooth, win } from "../core/film.ts";
import { FILM16_GRADE, FILM16_PALETTE as P } from "../lib/palette.ts";

export const FILM16_EXAMPLE_SECONDS = FILM16_SECONDS;

export const Film16Example: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // the picture changes 24 times a second, like film
  const tf = filmTime(t);
  const shot = getFilm16Camera(t);
  const glow = smooth(win(tf, 0.3, 1.6));
  const tune = 0.15 + 0.47 * smooth(win(tf, 0.7, 2.2));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: P.bg }}>
      <FilmGate t={t} caption="Sore di dapur, 1987" captionAt={2.6} runOutAt={RUN_OUT}>
        <FilmScene
          frame={Math.round(tf * fps)}
          shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
          background={P.bg}
          profile={FILM16_GRADE}
          hdri="warmStudio"
          exposure={1.0}
          envIntensity={0.3}
          focus={shot.focus}
          aperture={0.0035}
          maxBlur={0.008}
          near={0.02}
          far={30}
        >
          <hemisphereLight args={["#FFE7C7", "#3A2A1E", 0.32]} />
          {/* low sun through the window: the mullions draw a cross on the table */}
          <directionalLight
            position={[WINDOW.x + 1.3, 3.1, -4.2]}
            intensity={4.2}
            color={P.sun}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-2.2}
            shadow-camera-right={2.2}
            shadow-camera-top={2.2}
            shadow-camera-bottom={-2.2}
            shadow-camera-near={1}
            shadow-camera-far={9}
            shadow-bias={-0.0003}
            shadow-normalBias={0.02}
          />
          {/* bounce off the table onto the room */}
          <pointLight position={[0.2, TABLE_Y + 0.5, 0.8]} intensity={0.9} distance={3} color="#FFD7A8" />
          <pointLight position={[-0.28, 0.95, 0.06]} intensity={0.12 * glow} distance={0.6} color="#FFB060" />
          <Kitchen3D t={tf} beam={1} halo={1} />
          <Radio3D t={tf} tune={tune} glow={glow} position={[-0.45, TABLE_Y, 0.02]} />
          <Teacup3D t={tf} position={[0.3, TABLE_Y, 0.22]} />
        </FilmScene>
      </FilmGate>
    </div>
  );
};
