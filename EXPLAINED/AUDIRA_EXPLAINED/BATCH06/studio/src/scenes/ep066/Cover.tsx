// AE-066 topic cover (GLASSCRAFT): tower cab at blue hour, frosted strip-board HUD, holding taxiway.
import React, { useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT, fontReady } from "../../core/type/fonts.ts";
import { AtcWorld } from "./World.tsx";

export const SHOT = { pos: [6, 14, 46] as [number, number, number], target: [1, 6.5, -6] as [number, number, number], fov: 32 };

const Rig: React.FC<{ pos: [number, number, number]; target: [number, number, number]; fov: number }> = ({ pos, target, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pos);
    cam.lookAt(...target);
    cam.fov = fov;
    cam.near = 0.3;
    cam.far = 900;
    cam.updateProjectionMatrix();
  }, [camera, pos, target, fov]);
  return null;
};

/** Canvas textures need the bundled font before they are drawn. */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("ep066 fonts"));
  useLayoutEffect(() => {
    let alive = true;
    fontReady()
      .then(() => Promise.all([document.fonts.load(`600 40px ${FONT}`), document.fonts.load(`500 40px ${FONT}`)]))
      .finally(() => {
        if (alive) setReady(true);
        continueRender(handle);
      });
    return () => {
      alive = false;
    };
  }, [handle]);
  return ready;
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame * 2; // 60 fps film clock
  const ready = useFontsReady();
  const camPos = useMemo(() => new THREE.Vector3(...SHOT.pos), []);
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: "#060b18" }}>
      {ready && (
        <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true }} camera={{ fov: SHOT.fov, position: SHOT.pos }}>
          <Rig {...SHOT} />
          <AtcWorld f={f} camPos={camPos} />
          <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} hdri="studio" ao />
        </ThreeCanvas>
      )}
      {/* soft top scrim so the title reads over the blue-hour sky */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760 * s, background: "linear-gradient(180deg, rgba(4,8,22,0.55) 0%, rgba(4,8,22,0.25) 60%, rgba(4,8,22,0) 100%)" }} />
      <div style={{ position: "absolute", left: 64 * s, top: 268 * s, fontFamily: FONT, color: "#ffffff" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14 * s,
            padding: `${12 * s}px ${26 * s}px`,
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(18px)",
            fontSize: 28 * s,
            fontWeight: 600,
            letterSpacing: "0.16em",
          }}
        >
          <span style={{ width: 13 * s, height: 13 * s, borderRadius: 99, background: "#43e97b", boxShadow: "0 0 14px #43e97b" }} />
          AUDIRA EXPLAINED
        </div>
        <div style={{ marginTop: 26 * s, fontSize: 116 * s, fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.03em", textShadow: "0 6px 40px rgba(0,0,20,0.55)" }}>
          Siapa Atur
          <br />
          Ratusan
          <br />
          <span style={{ background: "linear-gradient(90deg, #7ee8ff, #c9a7ff 60%, #f093fb)", WebkitBackgroundClip: "text", color: "transparent" }}>Pesawat?</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
