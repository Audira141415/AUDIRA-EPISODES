import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CartographicTerrain3D } from "../scene/CartographicTerrain3D";
import { TacticalPincerArrows3D } from "../scene/TacticalPincerArrows3D";
import { getHistoryMapCamera } from "../camera/rig";
import { HistoryMapOverlay } from "../camera/Overlay";
import { HISTORYMAP_PALETTE as C } from "../lib/palette";

export const HISTORYMAP_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * HISTORYMAP example (Style #42): Trajan's conquest of Dacia (101–106 AD) on a war table.
 * Hook: Roman crimson floods north to the Danube and legion camps drop onto the bank. Development:
 * two pincer arrows cross the river and curve through the Carpathians. Payoff (~8.6–9.8 s): the
 * pincers close on Sarmizegetusa, the fortress pin flares and Dacia turns Roman.
 *
 * Post: FilmScene's Finish chain (warm studio HDRI for the gilt pins, bloom on the arrows and
 * the flare, DOCUMENTARY_WARM grade, grain 0.008). The kit has no composer of its own.
 */
export const HistoryMapExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getHistoryMapCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={C.oceanVoid}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      envIntensity={0.55}
      ao={false}
      near={0.05}
      far={80}
      overlay={() => <HistoryMapOverlay f={f} />}
    >
      {/* Low lamp over the table from the west: long relief shadows from the mountains and camps */}
      <KeyLight extent={4.5} keyPos={[-4, 6, 2.5]} keyColor="#FFE6C2" keyIntensity={2.2} fill={0.38} fillColor="#cfd8e6" rim="#7fa6d8" rimIntensity={0.6} />
      <fog attach="fog" args={[C.oceanVoid, 12, 26]} />
      <CartographicTerrain3D f={f} />
      <TacticalPincerArrows3D f={f} />
    </FilmScene>
  );
};
