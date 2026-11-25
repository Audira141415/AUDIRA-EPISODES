// EP12 film: PIXELSTORY 2D, one set and colour world per beat, cuts on VO seconds (timing.ts).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Exposure, Grade, Grain, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { Captions, Wipe } from "./hud.tsx";
import { OUTRO_AT, T, sceneAt, type SceneId } from "./timing.ts";
import * as S1 from "./shotsA.tsx";
import * as S2 from "./shotsB.tsx";

const SHOTS: Record<SceneId, S1.Shot> = { A: S1.A, B: S1.B, C1: S1.C1, C2: S1.C2, D1: S1.D1, D2: S1.D2, E: S1.E, F: S1.F, G: S2.G, H: S2.H, I1: S2.I1, I2: S2.I2, I3: S2.I3, J: S2.J, K: S2.K, L: S2.L };
const SHADOW: Record<SceneId, [string, number]> = {
  A: ["#081a40", 0.75], B: ["#0c0804", 0.9], C1: ["#20040c", 0.85], C2: ["#083430", 0.5], D1: ["#0c0620", 0.8], D2: ["#041428", 0.85], E: ["#3a1020", 0.6], F: ["#0a1a50", 0.55],
  G: ["#1c0c04", 0.8], H: ["#180428", 0.7], I1: ["#063c44", 0.45], I2: ["#380c04", 0.6], I3: ["#2c1c04", 0.5], J: ["#240408", 0.75], K: ["#3c1c34", 0.5], L: ["#04141c", 0.8],
};
const FLASH: [number, string, number][] = [
  [T.lalu + 0.2, "#cfeeff", 0.28], [T.jatuh + 0.28, "#ffffff", 0.14], [T.menembus, "#ffe0d8", 0.35], [T.hantam, "#ffffff", 0.35], [T.patah, "#ff5a50", 0.3],
  [T.senggol, "#fff0c0", 0.5], [T.pembatas, "#ffffff", 0.35], [T.garis, "#fff6c8", 0.35], [T.pertama, "#ffe9a0", 0.35],
];

export const Picture: React.FC<{ t: number; frame: number; scene?: SceneId; hud?: boolean }> = ({ t, frame, scene, hud = true }) => {
  const { width } = useVideoConfig();
  const sc = scene ?? sceneAt(t);
  const shot = SHOTS[sc];
  const [shc, vg] = SHADOW[sc];
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", transform: `scale(${width / 1080})`, transformOrigin: "0 0", background: shc, filter: "brightness(0.96)" }}>
        <shot.scene t={t} />
        <Grade shadows={shc} amount={0.3} />
        <Vignette strength={vg} color={shc} cy="52%" />
        {FLASH.map(([at, c, a]) => (t >= at && t < at + 0.22 ? <Exposure key={at} color={c} amount={a * (1 - (t - at) / 0.22) ** 2} blend="screen" /> : null))}
        {hud ? <shot.hud t={t} /> : null}
        {scene ? null : <Wipe t={t} />}
        {scene ? null : <Captions t={t} />}
        <Grain frame={frame} opacity={0.05} />
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      <Audio src={staticFile("audio/ep12/vo.wav")} />
      <Picture t={Math.min(t, OUTRO_AT + 3.8)} frame={frame} />
    </AbsoluteFill>
  );
};
