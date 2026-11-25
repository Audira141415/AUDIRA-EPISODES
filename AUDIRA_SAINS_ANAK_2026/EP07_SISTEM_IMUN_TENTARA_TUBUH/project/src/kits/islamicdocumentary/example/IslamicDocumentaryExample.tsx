import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ArabesqueGirihPortal3D, STAR_Y, WALL_Z } from "../scene/ArabesqueGirihPortal3D";
import { MosqueSilhouetteSkyline3D } from "../scene/MosqueSilhouetteSkyline3D";
import { getIslamicDocumentaryCamera } from "../camera/rig";
import { IslamicDocumentaryOverlay } from "../camera/Overlay";
import { computeIslamicDocumentaryState } from "../core/motion";
import { ISLAMICDOCUMENTARY_PALETTE as C } from "../lib/palette";

export const ISLAMICDOCUMENTARY_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * ISLAMICDOCUMENTARY example (Style #43): Baitul Hikmah, Baghdad. No figures, no faces (adab visual).
 * Hook: a gilt girih star turns in a lapis niche while the wall inlay lights outward. Development:
 * the gold dome and two minarets rise out of the sandstone court. Payoff (~8.4–9.8 s): dawn — the
 * key light warms and swells, the star, dome and hall windows glow.
 *
 * Post: FilmScene's Finish chain (warm studio HDRI for the gilt, bloom on the glow,
 * DOCUMENTARY_WARM grade, grain 0.008). The kit has no composer of its own.
 */
export const IslamicDocumentaryExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getIslamicDocumentaryCamera(f);
  const { dawn } = computeIslamicDocumentaryState(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={C.nightVoid}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      envIntensity={0.55 + dawn * 0.25}
      ao={false}
      near={0.05}
      far={80}
      overlay={() => <IslamicDocumentaryOverlay f={f} />}
    >
      {/* Moonlit key from the left that becomes the low dawn sun at the payoff; lapis-blue fill */}
      <KeyLight
        extent={3.5}
        keyPos={[-4 + dawn * 7, 4.5 - dawn * 1.6, 5]}
        keyColor={dawn > 0.5 ? "#FFC27A" : "#DCE6FF"}
        keyIntensity={1.4 + dawn * 1.4}
        fill={0.32}
        fillColor="#9fb4e0"
        rim={C.royalGold}
        rimIntensity={0.5 + dawn * 0.6}
      />
      {/* Lamp glow in the niche */}
      <pointLight position={[0, STAR_Y, WALL_Z + 0.9]} color="#ffcf80" intensity={0.8 + dawn * 2.2} distance={3.5} decay={1.6} />
      <fog attach="fog" args={[C.nightVoid, 14, 30]} />
      <ArabesqueGirihPortal3D f={f} />
      <MosqueSilhouetteSkyline3D f={f} />
    </FilmScene>
  );
};
