// AE-056 cover: TIMEFORGE warm-white studio, one diorama where the era changes front to back.
import React, { useEffect, useLayoutEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { PCFSoftShadowMap, type PerspectiveCamera } from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MANROPE, manropeReady, INK, INK_SOFT } from "../../core/type/fonts.ts";
import { Diorama } from "./Diorama.tsx";

const BG = "#ebe7e0";

export type Cam = { az: number; el: number; dist: number; fov: number; target: [number, number, number] };
export const COVER_CAM: Cam = { az: -0.22, el: 0.72, dist: 47, fov: 28, target: [0, 3.05, -0.2] };

export const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as PerspectiveCamera;
    const [tx, ty, tz] = cam.target;
    c.position.set(tx + cam.dist * Math.cos(cam.el) * Math.sin(cam.az), ty + cam.dist * Math.sin(cam.el), tz + cam.dist * Math.cos(cam.el) * Math.cos(cam.az));
    c.fov = cam.fov;
    c.near = 1;
    c.far = 400;
    c.lookAt(tx, ty, tz);
    c.updateProjectionMatrix();
  });
  return null;
};

export const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#fff7ec", "#b7ab98", 0.9]} />
    <directionalLight
      position={[-14, 22, 12]}
      intensity={2.6}
      color="#fff1de"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0003}
      shadow-normalBias={0.03}
      shadow-radius={6}
      shadow-camera-left={-11}
      shadow-camera-right={11}
      shadow-camera-top={11}
      shadow-camera-bottom={-11}
      shadow-camera-near={5}
      shadow-camera-far={70}
    />
    <directionalLight position={[16, 8, 6]} intensity={0.55} color="#e6f3ff" />
    <directionalLight position={[2, 10, -18]} intensity={0.7} color="#fff3e2" />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: MANROPE, color: INK, pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 262, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 9, color: INK_SOFT }}>AUDIRA EXPLAINED</div>
      <div style={{ marginTop: 22, fontSize: 104, fontWeight: 300, lineHeight: 1.04, letterSpacing: -2 }}>
        Dari Roda Air
        <br />
        ke Mesin Uap
      </div>
    </div>
    {/* minimal timeline rail on a frosted pill, above the 380 px bottom safe zone */}
    <div style={{ position: "absolute", top: 1452, left: 70, right: 70, height: 88, borderRadius: 47, background: "rgba(240,237,231,0.88)", boxShadow: "0 6px 24px rgba(60,50,40,0.12)" }} />
    <div style={{ position: "absolute", top: 1456, left: 190, right: 190, height: 80 }}>
      <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 2, background: "#aeb8b9" }} />
      {[
        { x: 0, y: "1771", d: "pabrik roda air" },
        { x: 0.5, y: "1781", d: "uap berputar" },
        { x: 1, y: "1830", d: "kereta antarkota" },
      ].map((m) => (
        <div key={m.y} style={{ position: "absolute", left: `${m.x * 100}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap", width: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 22, height: 22, margin: "4px auto 0", borderRadius: 11, background: "#ebe7e0", border: "3px solid #3fb8bd", boxSizing: "border-box" }} />
          <div style={{ marginTop: 2, fontSize: 27, fontWeight: 600, color: INK, lineHeight: 1.1 }}>{m.y}</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: INK_SOFT, letterSpacing: 1, lineHeight: 1.1 }}>{m.d}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Manrope ep056"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const t = frame / fps + 2.0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: PCFSoftShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: COVER_CAM.fov, near: 1, far: 400, position: [0, 20, 50] }}
          >
            <fog attach="fog" args={[BG, 70, 160]} />
            <CamRig cam={COVER_CAM} />
            <Lights />
            <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[120, 64]} />
              <meshStandardMaterial color="#e3ded5" roughness={0.95} />
            </mesh>
            <Diorama t={t} f60={Math.round(t * 60)} font={MANROPE} />
            <Finish frame={frame} background={BG} hdri="warmStudio" envIntensity={0.3} exposure={0.84} profile={COLOR_PROFILES.DOCUMENTARY_WARM} aoRadius={0.35} />
          </ThreeCanvas>
          <Overlay />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
