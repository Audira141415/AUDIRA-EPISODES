// AE-039 cover: "Pipa Minyak di Dasar Laut" — INNERWORKS stepped cutaway of a subsea pipeline.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { World } from "./World.tsx";
import { COVER_SHOT, P, R, X, project, ringPt } from "./layout.ts";

type Label = { text: string; anchor: [number, number, number]; side: "left" | "right"; dy?: number; color: string };

const deg = (d: number) => (d * Math.PI) / 180;

const LABELS: Label[] = [
  { text: "Beton pemberat", anchor: ringPt(X.conc + 0.02, (R.insOut + R.concOut) / 2, deg(110)), side: "left", dy: -120, color: P.concreteCut },
  { text: "Insulasi", anchor: ringPt(X.ins + 0.02, (R.coatOut + R.insOut) / 2, deg(118)), side: "left", dy: -40, color: P.insulation },
  { text: "Endapan lilin", anchor: ringPt(2.2, R.steelIn - 0.08, deg(105)), side: "right", dy: -90, color: P.wax },
  { text: "Pig pembersih", anchor: [X.pigBack + 0.3, 0.55, 0.3], side: "right", dy: 150, color: P.pigCup },
  { text: "Anoda korban", anchor: ringPt(5.7, R.concOut + 0.03, deg(70)), side: "right", dy: -40, color: P.anode },
];

const LabelTag: React.FC<{ l: Label }> = ({ l }) => {
  const [ax, ay] = project(l.anchor);
  const ty = ay + (l.dy ?? 0);
  const tx = l.side === "left" ? 64 : 1016;
  const elbowX = l.side === "left" ? Math.min(ax - 40, 330) : Math.max(ax + 40, 760);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${ax},${ay} ${elbowX},${ty} ${l.side === "left" ? tx + 10 : tx - 10},${ty}`} fill="none" stroke="#e8f6fa" strokeWidth={2.5} strokeOpacity={0.75} />
        <circle cx={ax} cy={ay} r={8} fill="#08202b" stroke="#e8f6fa" strokeWidth={3} />
        <circle cx={ax} cy={ay} r={3.5} fill={l.color} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: ty - 30,
          ...(l.side === "left" ? { left: tx } : { right: 1080 - tx }),
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 30,
          color: "#0c1a20",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(244,247,248,0.92)",
          padding: "6px 16px",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 7, background: l.color, border: "1.5px solid rgba(0,0,0,0.25)", display: "inline-block" }} />
        {l.text}
      </div>
    </>
  );
};

const Overlay: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: P.ink }}>
    <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.32em", color: P.cyan }}>AUDIRA EXPLAINED</div>
      <div style={{ fontSize: 112, fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.025em", marginTop: 22, textShadow: "0 6px 30px rgba(0,0,0,0.45)" }}>
        Pipa Minyak
        <br />
        di <span style={{ color: P.amber }}>Dasar Laut</span>
      </div>
    </div>
    {LABELS.map((l) => (
      <LabelTag key={l.text} l={l} />
    ))}
  </div>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <Stage3D background={P.bgBottom} overlay={() => <Overlay />}>
      <CameraRig shot={COVER_SHOT} near={0.3} far={600} />
      <World f={f} />
      <Finish frame={frame} hdri="studio" profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} ao />
    </Stage3D>
  );
};
