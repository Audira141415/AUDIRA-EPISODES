// AE-058 cover (BRUTALFORGE): wide 3/4 view of a tower being dismantled top-down in a tight block.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { World, CameraRig } from "./World.tsx";
import { PAL } from "./parts.tsx";

export const DISPLAY = "AntonEp058";
let fontPromise: Promise<void> | null = null;
export const loadDisplay = () => {
  if (fontPromise) return fontPromise;
  const face = new FontFace(DISPLAY, `url(${staticFile("fonts/ep058/Anton-Regular.ttf")}) format("truetype")`);
  // canvas labels ask for "Anton": register both names
  const face2 = new FontFace("Anton", `url(${staticFile("fonts/ep058/Anton-Regular.ttf")}) format("truetype")`);
  fontPromise = Promise.all([face.load(), face2.load()]).then(([a, b]) => {
    const fonts = document.fonts as unknown as { add(f: FontFace): void };
    fonts.add(a);
    fonts.add(b);
  });
  return fontPromise;
};

const Chip: React.FC<{ x: number; y: number; bg: string; color?: string; size: number; rot?: number; children: React.ReactNode; pad?: string }> = ({
  x, y, bg, color = PAL.ink, size, rot = 0, children, pad = "6px 22px",
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(${rot}deg)`,
      background: bg,
      border: "6px solid #0B0C10",
      boxShadow: "10px 10px 0 #0B0C10",
      padding: pad,
      fontFamily: `${DISPLAY}, "Arial Black", sans-serif`,
      fontSize: size,
      lineHeight: 1.05,
      color,
      letterSpacing: 1,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Chip x={64} y={266} bg={PAL.white} size={40} pad="4px 18px">
      AUDIRA EXPLAINED
    </Chip>
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 352,
        fontFamily: `${DISPLAY}, "Arial Black", sans-serif`,
        fontSize: 150,
        lineHeight: 0.98,
        color: PAL.white,
        WebkitTextStroke: "7px #0B0C10",
        paintOrder: "stroke fill",
        textShadow: "12px 12px 0 #0B0C10",
        letterSpacing: 1,
      }}
    >
      BONGKAR GEDUNG
      <br />
      DARI ATAS
    </div>
    <Chip x={640} y={520} bg={PAL.pink} color={PAL.white} size={58} rot={-5}>
      TANPA LEDAKAN!
    </Chip>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [handle] = useState(() => delayRender("ep058 font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadDisplay().then(
      () => {
        setReady(true);
        continueRender(handle);
      },
      () => {
        setReady(true);
        continueRender(handle);
      },
    );
  }, [handle]);
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.yellow }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            dpr={1}
            shadows={{ type: PCFShadowMap }}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: 32, near: 1, far: 400, position: [12, 32, 70] }}
          >
            <CameraRig f={f} pos={[16, 48, 66]} target={[0.5, 14.6, 2]} fov={36} />
            <World f={f} />
            <Finish frame={frame} background={PAL.yellow} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao />
          </ThreeCanvas>
          <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
            <Overlay />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
