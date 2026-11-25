import React from "react";
import { Composition, Still } from "remotion";
import { Ep11Film, Ep11Cover, EP11_SECONDS } from "./ep11/Film.tsx";

// EP11 only (minimal Root keeps the bundle light). Preview 540 × 960 @ 30, final 1080 × 1920 @ 60.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep11Preview" component={Ep11Film} durationInFrames={Math.round(EP11_SECONDS * 30)} fps={30} width={540} height={960} />
    <Composition id="Ep11Final" component={Ep11Film} durationInFrames={Math.round(EP11_SECONDS * 60)} fps={60} width={1080} height={1920} />
    <Still id="Ep11Cover" component={Ep11Cover} width={1080} height={1920} />
  </>
);
