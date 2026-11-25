// QA demo for <SafeLabel>: every label below is given a bad size or position on purpose, and
// SafeLabel corrects it. `npm run stills -- out/safelabel 50% SafeLabelDemoPreview` then
// `npm run audit:layout -- out/safelabel` must report 0 issues.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";

export const SAFE_LABEL_DEMO_SECONDS = 2;

export const SafeLabelDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #e9e2d0 0%, #6b7a8f 55%, #1b1f2a 100%)" }}>
    {/* too small (18 px) and inside the top UI band (y 40) */}
    <SafeLabel x={40} y={40} size={18}>SEJARAH ISLAM · EP02</SafeLabel>
    {/* long text anchored near the right edge: wraps instead of running off */}
    <SafeLabel x={760} y={420} role="title">EKSPEDISI EMAS TERBESAR ABAD PERTENGAHAN</SafeLabel>
    {/* bare text on a light background: stroke + shadow instead of a plate */}
    <SafeLabel x={540} y={760} align="center" plate={false} color="#ffffff" size={52}>12 TON EMAS</SafeLabel>
    {/* inside the bottom UI band (y 1700): pushed up above it */}
    <SafeLabel x={540} y={1700} align="center" role="caption">rombongan itu berkemah tiga hari</SafeLabel>
  </AbsoluteFill>
);
