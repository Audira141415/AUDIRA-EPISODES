// SEJARAH MAKKAH EP05 cover: one engraved copper plate split "dulu | kini".
// Authored for 9:16; 16:9 adapts through useFormat + FormatFov (inside <Finish>).
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { MakkahWorld } from "./MakkahWorld.tsx";
import { ShipVignette } from "./ShipVignette.tsx";
import { INK } from "./engraving.ts";

export const MAKKAH_COVER_SECONDS = 4;
const FILM_FPS = 60;

// Style memory (VINTAGEFORGE): profile VINTAGE_SEPIA_FILM, exposure 0.82, envIntensity 0.25.
// Chromatic aberration lowered: the stock 0.004 fringes the fine engraved lines red/blue.
const PROFILE = { ...COLOR_PROFILES.VINTAGE_SEPIA_FILM, chromaticAberration: 0.0008 };

type Pose = { pos: [number, number, number]; target: [number, number, number]; fov: number };

const POSES: Record<"short" | "wide", Pose> = {
  short: { pos: [0.1, 5.4, 24], target: [0.1, 3.3, -1.2], fov: 37 },
  wide: { pos: [0.4, 5.0, 19.5], target: [0.4, 3.25, -1.2], fov: 37 },
};

const Rig: React.FC<{ f: number; wide: boolean }> = ({ f, wide }) => {
  const { camera } = useThree();
  const p = POSES[wide ? "wide" : "short"];
  const drift = f / (MAKKAH_COVER_SECONDS * FILM_FPS); // 0..1: slow push-in
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(p.pos[0] - drift * 0.15, p.pos[1] - drift * 0.05, p.pos[2] - drift * 0.5);
    cam.lookAt(new THREE.Vector3(...p.target));
    cam.fov = p.fov;
    cam.near = 0.1;
    cam.far = 200;
    cam.updateProjectionMatrix();
  });
  return null;
};

const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#fff4dc", "#8a6a44", 0.55]} />
    <directionalLight
      position={[-13, 6, 3]}
      intensity={2.6}
      color="#fff1d6"
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-camera-left={-12}
      shadow-camera-right={12}
      shadow-camera-top={12}
      shadow-camera-bottom={-12}
      shadow-camera-near={1}
      shadow-camera-far={50}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
    <directionalLight position={[8, 4, 6]} intensity={0.45} color="#f4d9a8" />
  </>
);

const serif = "Georgia, 'Times New Roman', serif";

const Cartouche: React.FC<{ big: number; small: number; label: number; width: number; tags?: boolean }> = ({ big, small, label, width, tags }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      padding: `${big * 0.14}px ${big * 0.26}px ${big * 0.2}px`,
      background: "rgba(241,230,204,0.94)",
      border: `3px solid ${INK.gold}`,
      outline: `1.5px solid ${INK.sepia}`,
      outlineOffset: 6,
      boxShadow: "0 10px 26px rgba(40,24,8,0.28)",
      textAlign: "center",
      color: INK.iron,
      fontFamily: serif,
    }}
  >
    <div style={{ fontSize: label, fontWeight: 700, letterSpacing: label * 0.28, color: INK.goldDeep }}>
      SEJARAH MAKKAH &nbsp;·&nbsp; EP05
    </div>
    <div style={{ height: 2, background: INK.sepia, opacity: 0.6, margin: `${label * 0.5}px ${big * 0.4}px ${label * 0.3}px` }} />
    <div style={{ fontSize: big, fontWeight: 700, letterSpacing: big * 0.06, lineHeight: 1.0, textShadow: `0 2px 0 ${INK.gold}` }}>MAKKAH</div>
    <div style={{ fontSize: small, fontWeight: 700, letterSpacing: small * 0.05, lineHeight: 1.15, marginTop: small * 0.15 }}>YANG TAK KAMU KENAL</div>
    {tags ? (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: label * 0.7, fontSize: label * 0.95, fontWeight: 700, color: INK.sepia }}>
        <span>&#9664;&nbsp; DULU <i style={{ fontWeight: 400 }}>· Benteng Ajyad</i></span>
        <span style={{ color: INK.goldDeep }}>&#10070;</span>
        <span><i style={{ fontWeight: 400 }}>Menara Jam ·</i> KINI &nbsp;&#9654;</span>
      </div>
    ) : null}
  </div>
);

const Tag: React.FC<{ title: string; sub: string; size: number; align: "left" | "right" }> = ({ title, sub, size, align }) => (
  <div style={{ textAlign: align, fontFamily: serif, color: INK.sepia }}>
    <div style={{ display: "inline-block", padding: `${size * 0.1}px ${size * 0.45}px`, background: INK.sepia, color: INK.paper, fontWeight: 700, fontSize: size, letterSpacing: size * 0.25 }}>{title}</div>
    <div style={{ marginTop: size * 0.25, fontStyle: "italic", fontWeight: 700, fontSize: size * 0.62, textShadow: `0 0 6px ${INK.paper}, 0 0 3px ${INK.paper}` }}>{sub}</div>
  </div>
);

const Overlay: React.FC = () => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const s = fmt.safe;
  const frameInset = fmt.isWide ? 18 : 22;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${fmt.scale})`, transformOrigin: "0 0" }}>
        {/* plate border */}
        <div style={{ position: "absolute", inset: frameInset, border: `3px solid ${INK.sepia}`, outline: `1.5px solid ${INK.gold}`, outlineOffset: -9, opacity: 0.85 }} />
        {fmt.isWide ? (
          <>
            <div style={{ position: "absolute", left: s.left, top: s.top + 8 }}>
              <Cartouche big={118} small={46} label={24} width={760} />
            </div>
            <div style={{ position: "absolute", left: s.left + 10, bottom: s.bottom + 4 }}>
              <ShipVignette width={330} caption="± 5 BULAN DI LAUT" />
            </div>
            <div style={{ position: "absolute", left: 470, top: 470 }}>
              <Tag title="DULU" sub="Benteng Ajyad, abad ke-18" size={28} align="left" />
            </div>
            <div style={{ position: "absolute", left: 1330, top: 250 }}>
              <Tag title="KINI" sub="Menara Jam, 601 meter" size={28} align="left" />
            </div>
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 90, right: 90, top: s.top + 20, display: "flex", justifyContent: "center" }}>
              <Cartouche big={150} small={56} label={28} width={900} tags />
            </div>
            <div style={{ position: "absolute", left: 64, top: H - s.bottom - 330 }}>
              <ShipVignette width={330} caption="± 5 BULAN DI LAUT" />
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const MakkahCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const wide = width > height;
  return (
    <AbsoluteFill style={{ backgroundColor: INK.paper }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows={{ type: THREE.PCFShadowMap }} camera={{ fov: 37, position: [0, 3, 14] }}>
        <Rig f={f} wide={wide} />
        <fog attach="fog" args={[INK.paper, 16, 50]} />
        <Lights />
        <MakkahWorld />
        <Finish frame={frame} background={INK.paper} profile={PROFILE} exposure={0.82} envIntensity={0.25} hdri="warmStudio" aoRadius={0.25} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
