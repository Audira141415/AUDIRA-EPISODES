// A real Remotion composition. Its render is embedded in the HyperFrames film, so the line "this panel is rendered by Remotion" is true.
import React from "react";
import { AbsoluteFill, Composition, interpolate, registerRoot, spring, useCurrentFrame, useVideoConfig } from "remotion";

const INK = "#111111", PAPER = "#FFFFFF", RED = "#E6331F";

const Panel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  const sweep = interpolate(frame, [0, durationInFrames - 1], [0, 100]);
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, color: INK, fontFamily: "Arial Black, Arial, sans-serif", padding: 30 }}>
      <div style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 31, color: RED }}>const frame = useCurrentFrame();</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 8 }}>
        <span style={{ fontSize: 44 }}>frame</span>
        <span style={{ fontSize: 158, lineHeight: 1.02, transform: `scale(${pop})`, transformOrigin: "0 70%", fontVariantNumeric: "tabular-nums" }}>{String(frame).padStart(3, "0")}</span>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 66, height: 130, display: "flex", alignItems: "flex-end", gap: 7 }}>
        {new Array(36).fill(0).map((_, i) => {
          const h = interpolate(Math.sin(frame / 7 + i * 0.48), [-1, 1], [12, 126]);
          const on = (i / 36) * 100 < sweep;
          return <div key={i} style={{ flex: 1, height: h * pop, backgroundColor: on ? RED : INK }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 28, height: 12, backgroundColor: "#DDDDDD" }}>
        <div style={{ width: `${sweep}%`, height: "100%", backgroundColor: RED }} />
      </div>
    </AbsoluteFill>
  );
};

registerRoot(() => <Composition id="Panel" component={Panel} width={914} height={500} fps={30} durationInFrames={540} />);
