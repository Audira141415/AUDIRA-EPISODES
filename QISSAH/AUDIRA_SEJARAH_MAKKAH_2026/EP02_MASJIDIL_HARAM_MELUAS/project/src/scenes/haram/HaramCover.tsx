// EP02 topic cover, also the first key image of the film: the white maquette of Masjidil Haram at
// a low warm sun, each era's footprint traced in projected light around the small dark Ka'bah.
// Authored for 9:16; 16:9 adapts through useFormat / FormatFov (via Finish) and a wider set.

import React, { useLayoutEffect } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { HaramModel, ERA } from "./HaramModel.tsx";

export const HARAM_COVER_SECONDS = 3;
const BG = "#0a0a0c";

// Fonts (OFL, bundled in public/fonts): Anton for the thumbnail title, Space Grotesk for data.
let fontsReady: Promise<void> | null = null;
const loadFonts = () => {
  if (fontsReady || typeof document === "undefined") return;
  const h = delayRender("haram fonts");
  fontsReady = Promise.all([
    new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`).load(),
    new FontFace("Space Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }).load(),
  ]).then(
    (faces) => {
      faces.forEach((f) => (document.fonts as unknown as { add(x: FontFace): void }).add(f));
      continueRender(h);
    },
    () => continueRender(h),
  );
};
loadFonts();

/** Camera for the cover; `wide` shifts the model right so the title owns the left third. */
export const haramCoverShot = (t: number, wide: boolean) => {
  const drift = t * 0.25;
  return wide
    ? { pos: [-5.6 + drift, 22, 17.5] as const, target: [-4.4 + drift, 0, -3.1] as const, fov: 34 }
    : { pos: [0.8 + drift * 0.6, 34, 22.5] as const, target: [0.2 + drift * 0.6, 0, 4.3] as const, fov: 34 };
};

const Rig: React.FC<{ t: number; wide: boolean }> = ({ t, wide }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const s = haramCoverShot(t, wide);
    c.position.set(s.pos[0], s.pos[1], s.pos[2]);
    c.fov = s.fov;
    c.near = 0.1;
    c.far = 200;
    c.lookAt(s.target[0], s.target[1], s.target[2]);
    c.updateProjectionMatrix();
  }, [camera, t, wide]);
  return null;
};

/** Low warm sun from the south-west (~19 deg), long minaret shadows across the city. */
export const HaramLights: React.FC = () => (
  <>
    <hemisphereLight args={["#cfd6e6", "#1a1714", 0.26]} />
    <directionalLight
      position={[-15, 7.6, 9]}
      intensity={3.6}
      color="#ffd6a0"
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-camera-near={0.5}
      shadow-camera-far={70}
      shadow-camera-left={-24}
      shadow-camera-right={24}
      shadow-camera-top={24}
      shadow-camera-bottom={-24}
      shadow-bias={-0.0008}
      shadow-normalBias={0.045}
    />
    {/* cool fill from the opposite side so shadow sides keep plaster detail */}
    <directionalLight position={[10, 8, -6]} intensity={0.32} color="#9fb4d8" />
  </>
);

const mono = "'Space Grotesk', sans-serif";

const Legend: React.FC<{ fs: number; columns: boolean }> = ({ fs, columns }) => (
  <div style={{ display: "grid", gridTemplateColumns: columns ? "1fr 1fr" : "1fr 1fr 1fr", gap: `${fs * 0.55}px ${fs * 1.4}px` }}>
    {ERA.map((e) => (
      <div key={e.key} style={{ display: "flex", alignItems: "center", gap: fs * 0.55 }}>
        <div style={{ width: fs * 1.5, height: fs * 0.26, background: e.color, boxShadow: `0 0 ${fs * 0.6}px ${e.color}`, borderRadius: 2 }} />
        <div style={{ fontFamily: mono, lineHeight: 1.15 }}>
          <div style={{ color: e.color, fontSize: fs * 0.82, fontWeight: 700, letterSpacing: 1 }}>{e.label}</div>
          <div style={{ color: "rgba(240,236,226,0.82)", fontSize: fs * 0.74, fontWeight: 500, letterSpacing: 0.6 }}>{e.name}</div>
        </div>
      </div>
    ))}
  </div>
);

const Overlay: React.FC = () => {
  const fmt = useFormat();
  const { layout, safe, scale, isWide } = fmt;
  const W = layout.width, H = layout.height;
  const label = (
    <div style={{ fontFamily: mono, fontSize: isWide ? 26 : 30, fontWeight: 700, letterSpacing: 6, color: "#ffd166" }}>
      SEJARAH MAKKAH · EP02
    </div>
  );
  const title = (size: number) => (
    <div style={{ fontFamily: "Anton, sans-serif", fontSize: size, lineHeight: 0.98, color: "#f6f2e8", textShadow: "0 6px 30px rgba(0,0,0,0.6)", letterSpacing: 1 }}>
      DULU TAK
      <br />
      <span style={{ color: "#ffd166" }}>BERTEMBOK</span>
    </div>
  );
  const data = (size: number) => (
    <div style={{ fontFamily: mono, fontSize: size, fontWeight: 600, color: "#9ff3e6", letterSpacing: 1.5 }}>
      ±1.500 m² <span style={{ color: "rgba(240,236,226,0.6)" }}>→</span> &gt;1 JUTA m²
    </div>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {isWide ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.7) 30%, rgba(8,8,10,0) 52%)" }} />
            <div style={{ position: "absolute", left: safe.left, top: safe.top + 70, width: 760, display: "flex", flexDirection: "column", gap: 26 }}>
              {label}
              {title(190)}
              {data(40)}
            </div>
            <div style={{ position: "absolute", left: safe.left, bottom: safe.bottom + 10, width: 640 }}>
              <Legend fs={27} columns />
            </div>
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: 1080, background: "linear-gradient(0deg, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.86) 50%, rgba(8,8,10,0.55) 72%, rgba(8,8,10,0) 100%)" }} />
            <div style={{ position: "absolute", left: 50, right: 50, top: safe.top + 14, padding: "22px 28px", background: "rgba(10,10,12,0.78)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }}>
              <Legend fs={27} columns={false} />
            </div>
            <div style={{ position: "absolute", left: 0, bottom: safe.bottom + 20, width: W, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
              {label}
              {title(205)}
              {data(42)}
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const HaramCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fmt = useFormat();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0, 13, 12], fov: 36 }}>
        <Rig t={t} wide={fmt.isWide} />
        <fog attach="fog" args={[BG, 38, 80]} />
        <HaramLights />
        <HaramModel />
        <Finish frame={frame} background={BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.84} envIntensity={0.3} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
