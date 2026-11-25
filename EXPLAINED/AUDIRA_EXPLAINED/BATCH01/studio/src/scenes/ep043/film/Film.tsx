// EP043 film: shot table keyed to the VO timeline, watercolour "bleed" transitions between worlds.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Defs } from "../Cover.tsx";
import { Outro } from "../../_shared/Outro.tsx";
import { Captions } from "./ui.tsx";
import { Kitchen } from "./Kitchen.tsx";
import { Konteks, Intake, Surge, Valve } from "./Outdoor.tsx";
import { Plant } from "./Plant.tsx";
import { CrossSection, Underground } from "./Pipe.tsx";
import { Payoff } from "./Payoff.tsx";
import { SEC, TL, cs, ramp, wt } from "./util.ts";

type Shot = { start: number; focus: [number, number]; render: (t: number) => React.ReactNode };

const SHOTS: Shot[] = [
  { start: 0, focus: [540, 960], render: (t) => <Kitchen t={t} mode="hook" /> },
  { start: SEC.KONTEKS[0] - 0.1, focus: [700, 760], render: (t) => <Konteks t={t} /> },
  { start: SEC.MEKANISME[0] - 0.05, focus: [540, 1100], render: (t) => <Intake t={t} /> },
  { start: cs("l06") - 0.1, focus: [700, 1000], render: (t) => <Plant t={t} /> },
  { start: cs("l07") - 0.1, focus: [540, 500], render: (t) => <Surge t={t} /> },
  { start: cs("l08") - 0.1, focus: [560, 760], render: (t) => <Valve t={t} /> },
  { start: SEC.REVEAL[0] - 0.05, focus: [540, 700], render: (t) => <Underground t={t} mode="a" /> },
  { start: wt("tapi", 1) - 0.15, focus: [540, 960], render: (t) => <CrossSection t={t} /> },
  { start: cs("l11") - 0.1, focus: [540, 960], render: (t) => <Underground t={t} mode="c" /> },
  { start: wt("keranmu") - 0.05, focus: [540, 700], render: (t) => <Kitchen t={t} mode="arrive" /> },
  { start: SEC.PAYOFF[0] - 0.05, focus: [300, 900], render: (t) => <Payoff t={t} /> },
  { start: SEC.OUTRO[0] - 0.05, focus: [420, 960], render: (t) => <Kitchen t={t} mode="outro" /> },
];

const BLEED = 0.35;

export const Ep043Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const outroAt = SEC.OUTRO[1] + 0.2;

  const live: React.ReactNode[] = [];
  SHOTS.forEach((s, i) => {
    const end = i < SHOTS.length - 1 ? SHOTS[i + 1].start + 0.05 : TL.total + 1;
    const from = i === 0 ? -1 : s.start - BLEED;
    if (t < from || t >= end) return;
    const grow = i === 0 ? 1 : ramp(t, s.start - BLEED + 0.05, s.start + 0.05);
    const body = <g key={`b${i}`}>{s.render(t)}</g>;
    if (grow >= 1) {
      live.push(body);
      return;
    }
    // opaque watercolour sweep: a slanted, ragged-edged wash wipes left to right (no translucent phase)
    const e = -500 + grow * 2200;
    const band = (d0: number, d1: number) => `M${e + d0 + 260},-300 L${e + d1 + 260},-300 L${e + d1 - 260},2220 L${e + d0 - 260},2220 Z`;
    live.push(
      <g key={`m${i}`}>
        <mask id={`sweep${i}`} maskUnits="userSpaceOnUse" x={-400} y={-400} width={1880} height={2720}>
          <path d={`M-900,-300 L${e + 260},-300 L${e - 260},2220 L-900,2220 Z`} fill="#FFFFFF" filter="url(#sweepWarp)" />
        </mask>
        <g mask={`url(#sweep${i})`}>
          <rect x={-200} y={-200} width={1480} height={2320} fill="#F7F0E3" />
          {s.render(t)}
        </g>
        {/* the brush stroke itself, riding the leading edge */}
        <path d={band(-40, 70)} fill="#C9A47A" filter="url(#sweepWarp)" />
        <path d={band(-40, 18)} fill="#8A5A34" filter="url(#sweepWarp)" />
        <path d={band(70, 110)} fill="#E8D3B0" filter="url(#sweepWarp)" />
      </g>,
    );
  });

  return (
    <AbsoluteFill style={{ background: "#F7F0E3", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <Defs region={[-1400, -1400, 5200, 6400]} />
          <defs>
            <filter id="sweepWarp" filterUnits="userSpaceOnUse" x={-1000} y={-600} width={3200} height={3200}>
              <feTurbulence type="fractalNoise" baseFrequency={0.018} numOctaves={3} seed={19} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={46} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <rect x={0} y={0} width={1080} height={1920} fill="#F7F0E3" />
          {live}
          <rect x={0} y={0} width={1080} height={1920} filter="url(#cockle)" style={{ mixBlendMode: "multiply" }} />
          <rect x={0} y={0} width={1080} height={1920} filter="url(#grain)" style={{ mixBlendMode: "multiply" }} opacity={0.5} />
          <rect x={0} y={0} width={1080} height={1920} fill="url(#vig)" />
        </svg>
        <Captions t={t} hideAfter={outroAt} />
      </div>
      <Outro start={outroAt} />
    </AbsoluteFill>
  );
};
