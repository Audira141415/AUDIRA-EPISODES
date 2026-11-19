// UKIRFORGE technical example (12 s): Jepara-style wood carving and wooden toys.
//
// 0.3–4.4   hook + carving: the mallet strikes, chips fly, a floral relief rises out of a teak panel
// 4.5–5.1   the tools lift away; a painted gasing (spinning top) drops and spins
// 5.35–6.9  a wooden car rolls in beside it
// 7.1–9.0   six letter blocks drop and settle in a row: AUDIRA
// 9.4–12    the panel is oiled (darker, satin) under a high three-quarter reveal

import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../../core/render/Finish.tsx";
import { CameraRig } from "../../../core/render/Post.tsx";
import { Workshop3D } from "../scene/Workshop3D.tsx";
import { getUkirforgeCamera, UKIRFORGE_SECONDS } from "../camera/rig.ts";
import { UkirforgeOverlay } from "../camera/Overlay.tsx";
import { UKIR_GRADE, UKIR_PALETTE as P } from "../lib/palette.ts";
import { carveReveal, impact, oilAt } from "../core/motion.ts";

export const UKIRFORGE_EXAMPLE_SECONDS = UKIRFORGE_SECONDS;

export const UkirforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const base = getUkirforgeCamera(t);
  // A tiny jolt on each strike while the camera is close to the chisel.
  const jolt = impact(t) * (t < 4.5 ? 0.004 : 0);
  const shot = { ...base, pos: [base.pos[0], base.pos[1] - jolt, base.pos[2]] as [number, number, number] };
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: P.bg }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 1, 3], fov: 34, near: 0.02, far: 40 }}>
        <CameraRig shot={shot} near={0.02} far={40} />
        <hemisphereLight args={["#FFE2BD", "#2A1A10", 0.38]} />
        {/* Late-afternoon window light from the left: long raking shadows across the relief */}
        <directionalLight
          position={[-3.2, 2.6, 1.4]}
          intensity={3.4}
          color={P.key}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-2.2}
          shadow-camera-right={2.2}
          shadow-camera-top={2}
          shadow-camera-bottom={-2}
          shadow-bias={-0.0004}
          shadow-normalBias={0.015}
        />
        <directionalLight position={[3, 2, 2.5]} intensity={0.35} color={P.fill} />
        <directionalLight position={[0.5, 3, -4]} intensity={1.1} color="#FFD8A8" />
        <Workshop3D t={t} />
        <Finish frame={frame} background={P.bg} profile={UKIR_GRADE} hdri="warmStudio" envIntensity={0.55} focus={shot.focus} aperture={0.0018} maxBlur={0.005} />
      </ThreeCanvas>
      <UkirforgeOverlay t={t} carve={carveReveal(t)} oil={oilAt(t)} />
    </div>
  );
};
