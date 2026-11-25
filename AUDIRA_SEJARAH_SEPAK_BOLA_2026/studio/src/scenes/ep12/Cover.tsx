// EP12 cover (INKSTORY): "FC Barcelona — Tiki-Taka (1974–2010)".
// Aged xuan paper backdrop with ink-wash mountains; Blaugrana (blue/garnet) ink strokes
// trace the passing triangle. Cruyff → Guardiola → Messi lineage painted in bold sumi.

import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { INK_PALETTE } from "../../kits/inkstory/lib/palette";
import { InkMountainDiorama } from "../../kits/inkstory/world/InkMountainDiorama";
import { InkAtmosphere } from "../../kits/inkstory/world/Atmosphere";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const BARCA_BLUE = "#004D98";
const BARCA_GARNET = "#A50044";
const GOLD = INK_PALETTE.ancientGold;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(-1.8, -0.4, 4.4);
    cam.lookAt(-0.8, 0, 0);
    cam.fov = 36;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// Three ink-brush circles forming a passing triangle — the core of tiki-taka
const PassingTriangle: React.FC = () => {
  const positions: [number, number, number][] = [
    [-0.7, 0.1, -0.5],
    [0.7, 0.1, -0.5],
    [0, 0.6, -0.5],
  ];
  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 32]} />
          <meshStandardMaterial
            color={i === 2 ? BARCA_GARNET : BARCA_BLUE}
            roughness={0.8}
            metalness={0.05}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
      {/* connecting lines between nodes */}
      {([[0, 1], [1, 2], [2, 0]] as [number, number][]).map(([a, b], i) => {
        const pa = new THREE.Vector3(...positions[a]);
        const pb = new THREE.Vector3(...positions[b]);
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const dir = pb.clone().sub(pa);
        const len = dir.length();
        const angle = Math.atan2(dir.x, dir.z);
        return (
          <mesh key={i} position={[mid.x, mid.y, mid.z]} rotation={[0, angle, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, len, 8]} />
            <meshStandardMaterial color={GOLD} roughness={0.6} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig />
    <InkAtmosphere />
    <InkMountainDiorama f={f} />
    <PassingTriangle />
    <Finish
      frame={Math.round(f)}
      background={INK_PALETTE.agedXuanPaper}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.82}
      envIntensity={0.25}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* gradient vignette: dark top and bottom, bright centre */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(20,19,18,0.88) 0%, rgba(20,19,18,0.5) 18%, rgba(20,19,18,0) 36%, rgba(20,19,18,0) 76%, rgba(20,19,18,0.65) 100%)",
      }}
    />

    {/* episode badge */}
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 196,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: 10,
          overflow: "hidden",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        <div style={{ background: BARCA_BLUE, color: "#FFFFFF", padding: "8px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div style={{ background: "rgba(8,8,10,0.92)", color: GOLD, padding: "8px 14px" }}>
          #12
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: "#FFF5EE",
          border: `2px solid ${BARCA_GARNET}`,
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        BARCELONA · AUDIRA
      </div>
    </div>

    {/* main title block */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 282,
        fontFamily: ANTON,
        lineHeight: 0.93,
        textShadow: "0 6px 24px rgba(0,0,0,0.7)",
      }}
    >
      <div style={{ fontSize: 112, color: BARCA_BLUE, letterSpacing: 1 }}>FC</div>
      <div style={{ fontSize: 112, color: "#F8F4EC", letterSpacing: 1 }}>BARCELONA</div>
      <div
        style={{
          marginTop: 12,
          display: "inline-block",
          fontFamily: MARKER,
          fontSize: 54,
          color: INK_PALETTE.pineSootBlack,
          background: GOLD,
          padding: "2px 20px 6px",
          transform: "rotate(-1.8deg)",
        }}
      >
        TIKI-TAKA
      </div>
    </div>

    {/* lineage pill */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 580,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 30,
        color: "#F5EFDF",
        background: "rgba(0,0,0,0.6)",
        borderLeft: `5px solid ${BARCA_GARNET}`,
        padding: "14px 20px",
        lineHeight: 1.5,
      }}
    >
      <div>CRUYFF → GUARDIOLA</div>
      <div>→ MESSI</div>
    </div>

    {/* year band */}
    <div
      style={{
        position: "absolute",
        left: 56,
        bottom: 440,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: 4,
        color: GOLD,
        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
      }}
    >
      1974 – 2010
    </div>

    {/* trophy note */}
    <div
      style={{
        position: "absolute",
        left: 56,
        bottom: 390,
        fontFamily: MARKER,
        fontSize: 32,
        color: "#EDE8DB",
        opacity: 0.85,
      }}
    >
      6 Trofi di Musim 2008–09
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: INK_PALETTE.agedXuanPaper }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 36, near: 0.1, far: 500, position: [-1.8, -0.4, 4.4] }}
      >
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
