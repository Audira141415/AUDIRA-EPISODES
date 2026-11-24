import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { OrderBookDepthWall3D } from "../scene/OrderBookDepthWall3D";
import { CandlestickChartArena3D } from "../scene/CandlestickChartArena3D";
import { getTradingTerminalCamera } from "../camera/rig";
import { TradingTerminalOverlay } from "../camera/Overlay";
import { TRADINGTERMINAL_PALETTE } from "../lib/palette";
import { computeTradingTerminalState } from "../core/motion";

export const TRADINGTERMINAL_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * TRADINGTERMINAL example (Style #41): a bevelled trading monitor in the dark. Hook: the candle
 * history prints one candle at a time. Development (5–8 s): the live candle tests the amber
 * resistance and is rejected twice. Payoff (8–10 s): breakout, the ask wall is absorbed, the
 * camera pushes onto the live candle.
 *
 * Post: FilmScene's Finish chain (CYBER_NEON_VOID per motion memory, ao off, grain 0.008).
 */
export const TradingTerminalExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getTradingTerminalCamera(f);
  const s = computeTradingTerminalState(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={TRADINGTERMINAL_PALETTE.canvasVoid}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      exposure={1}
      envIntensity={0.55}
      ao={false}
      near={0.1}
      far={60}
      overlay={() => <TradingTerminalOverlay f={f} />}
    >
      <KeyLight extent={3} keyPos={[3, 5, 6]} keyColor="#fff4e6" keyIntensity={1.2} fill={0.3} fillColor="#cfe3ff" rim={TRADINGTERMINAL_PALETTE.cyanTelemetry} rimIntensity={0.6} />
      {/* the screen lights the room: green spill grows with the breakout */}
      <pointLight position={[1.2, 1.6, 1.2]} intensity={1.5 + s.breakout * 4} color={TRADINGTERMINAL_PALETTE.bullGreen} distance={5} />
      <OrderBookDepthWall3D f={f} />
      <CandlestickChartArena3D f={f} />
    </FilmScene>
  );
};
