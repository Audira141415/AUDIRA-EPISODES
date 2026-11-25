// UKIRFORGE technical example (12 s): Jepara-style wood carving and wooden toys.
//
// 0.3–4.4   hook + carving: the mallet strikes, chips fly, a floral relief rises out of a teak panel
// 4.5–5.1   the tools lift away; a painted gasing (spinning top) drops and spins
// 5.35–6.9  a wooden car rolls in beside it
// 7.1–9.0   six letter blocks drop and settle in a row: AUDIRA
// 9.4–12    the panel is oiled (darker, satin) under a high three-quarter reveal

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { Workshop3D } from "../scene/Workshop3D.tsx";
import { getUkirforgeCamera, UKIRFORGE_SECONDS } from "../camera/rig.ts";
import { UkirforgeOverlay } from "../camera/Overlay.tsx";
import { UKIR_GRADE, UKIR_PALETTE as P } from "../lib/palette.ts";
import { carveReveal, impact, oilAt } from "../core/motion.ts";

export const UKIRFORGE_EXAMPLE_SECONDS = UKIRFORGE_SECONDS;

export const UkirforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const base = getUkirforgeCamera(t);
  // A tiny jolt on each strike while the camera is close to the chisel.
  const jolt = impact(t) * (t < 4.5 ? 0.004 : 0);
  const shot = { ...base, pos: [base.pos[0], base.pos[1] - jolt, base.pos[2]] as [number, number, number] };
  return (
    <FilmScene
      frame={frame}
      shot={shot}
      background={P.bg}
      profile={UKIR_GRADE}
      hdri="warmStudio"
      envIntensity={0.55}
      focus={shot.focus}
      aperture={0.0018}
      maxBlur={0.005}
      near={0.02}
      far={40}
      overlay={() => <UkirforgeOverlay t={t} carve={carveReveal(t)} oil={oilAt(t)} />}
    >
      <KeyLight extent={3} keyPos={[-3.2, 2.6, 1.4]} keyColor={P.key} keyIntensity={3.4} fill={0.1} rim="#FFD8A8" rimIntensity={1.1} />
      <hemisphereLight args={["#FFE2BD", "#2A1A10", 0.38]} />
      <directionalLight position={[3, 2, 2.5]} intensity={0.35} color={P.fill} />
      <Workshop3D t={t} />
    </FilmScene>
  );
};
