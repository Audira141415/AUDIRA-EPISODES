// COLLAGE technical example (12 s): a poster is built from torn, halftone-printed paper on kraft
// board, piece by piece on twelves, and the title arrives as ransom-note letters: AUDIRA.
// Runs on FilmScene with the kit's own craft lighting (soft upper-left key for paper shadows)
// and depth of field that follows the camera rig.
//
// 0.0–1.6   sky photo, then the sun dot, pressed onto the board (hook: the first piece slaps in)
// 1.6–4.6   city strip, headline, crowd, two strips of paper tape; the camera drifts down with the build
// 5.0       the ochre subtitle strip
// 6.6–9.2   ransom letters A-U-D-I-R-A, one hand placement each
// 9.4–12    pull back to the whole poster

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { Collage3D, LETTERS_T0 } from "../scene/Collage3D.tsx";
import { getCollageCamera, COLLAGE_SECONDS, REVEAL_AT } from "../camera/rig.ts";
import { CollageOverlay, type CollageBeat } from "../camera/Overlay.tsx";
import { COLLAGE_PALETTE as P } from "../lib/palette.ts";

export const COLLAGE_EXAMPLE_SECONDS = COLLAGE_SECONDS;

const BEATS: CollageBeat[] = [
  { at: 0, label: "LANGIT" },
  { at: 1.6, label: "KOTA" },
  { at: 2.5, label: "KABAR" },
  { at: 3.3, label: "ORANG-ORANG" },
  { at: LETTERS_T0, label: "JUDUL" },
  { at: REVEAL_AT, label: "UTUH" },
];

export const CollageExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getCollageCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      envIntensity={0.25}
      ao
      near={0.05}
      far={60}
      focus={shot.focus}
      aperture={0.0018}
      maxBlur={0.004}
      overlay={() => <CollageOverlay t={t} beats={BEATS} />}
    >
      <hemisphereLight args={["#FFF1DE", "#2B2118", 0.55]} />
      {/* key from the upper left: every piece throws a short, soft paper shadow onto the one below */}
      <directionalLight
        position={[-2.2, 6.4, 3.4]}
        intensity={2.3}
        color={P.lamp}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={6.6}
        shadow-camera-bottom={-0.6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.01}
        shadow-radius={4}
      />
      <directionalLight position={[2.6, 2.0, 2.2]} intensity={0.45} color={P.rim} />
      <Collage3D t={t} />
    </FilmScene>
  );
};
