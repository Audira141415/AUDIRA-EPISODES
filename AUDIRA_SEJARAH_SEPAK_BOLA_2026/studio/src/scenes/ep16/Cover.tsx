// EP16 cover (BRUTALFORGE): "Bayern Munich Hegemoni Bavaria"
// Neo-brutalist composition: Bayern-red block with hard inkBlack shadow, white accent strips,
// a flat trophy silhouette, and a neoYellow AUDIRA stamp sticker.
// Flat toon shading — no PBR, no gradients — full BRUTALFORGE contract.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BRUTAL_PALETTE as P } from "../../kits/brutalforge/lib/palette.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

type V3 = [number, number, number];
const BAYERN_RED = "#DC052D";
const CAM_POS: V3 = [0, 1.8, 5.2];
const CAM_FOV = 34;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...CAM_POS);
    c.lookAt(0, 0.2, 0);
    c.fov = CAM_FOV;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const BayernCard: React.FC = () => (
  <group rotation={[0.04, 0.08, 0]}>
    {/* 1. Hard offset drop shadow */}
    <mesh position={[0.24, -0.2, -0.15]}>
      <boxGeometry args={[2.6, 3.0, 0.16]} />
      <meshToonMaterial color={P.inkBlack} />
    </mesh>
    {/* 2. Main Bayern red block */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[2.6, 3.0, 0.16]} />
      <meshToonMaterial color={BAYERN_RED} />
    </mesh>
    {/* 3. White accent stripe top */}
    <mesh position={[0, 1.14, 0.1]}>
      <boxGeometry args={[2.6, 0.24, 0.04]} />
      <meshToonMaterial color={P.pureWhite} />
    </mesh>
    {/* 4. White accent stripe bottom */}
    <mesh position={[0, -1.14, 0.1]}>
      <boxGeometry args={[2.6, 0.24, 0.04]} />
      <meshToonMaterial color={P.pureWhite} />
    </mesh>
    {/* 5. neoYellow floating sticker (AUDIRA) — upper right */}
    <mesh position={[0.72, 0.84, 0.22]} rotation={[0, 0, -0.14]}>
      <boxGeometry args={[1.02, 0.4, 0.08]} />
      <meshToonMaterial color={P.neoYellow} />
    </mesh>
    {/* 6. Trophy — cup */}
    <mesh position={[0, 0.74, 0.22]}>
      <cylinderGeometry args={[0.36, 0.26, 0.68, 16]} />
      <meshToonMaterial color={P.pureWhite} />
    </mesh>
    {/* 7. Trophy — stem */}
    <mesh position={[0, 0.16, 0.22]}>
      <cylinderGeometry args={[0.08, 0.08, 0.52, 10]} />
      <meshToonMaterial color={P.pureWhite} />
    </mesh>
    {/* 8. Trophy — base */}
    <mesh position={[0, -0.12, 0.22]}>
      <cylinderGeometry args={[0.3, 0.36, 0.26, 16]} />
      <meshToonMaterial color={P.pureWhite} />
    </mesh>
    {/* 9. Trophy — left handle ring */}
    <mesh position={[-0.42, 0.78, 0.22]} rotation={[0, 0, Math.PI / 6]}>
      <torusGeometry args={[0.13, 0.038, 8, 14]} />
      <meshToonMaterial color={P.neoYellow} />
    </mesh>
    {/* 10. Trophy — right handle ring */}
    <mesh position={[0.42, 0.78, 0.22]} rotation={[0, 0, -Math.PI / 6]}>
      <torusGeometry args={[0.13, 0.038, 8, 14]} />
      <meshToonMaterial color={P.neoYellow} />
    </mesh>
  </group>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* episode badge row */}
    <div style={{ position: "absolute", left: 48, top: 196, display: "flex", alignItems: "stretch", gap: 0 }}>
      <div style={{
        background: P.inkBlack, color: P.pureWhite, padding: "8px 16px",
        fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: 2,
      }}>SEJARAH SEPAK BOLA</div>
      <div style={{
        background: P.neoYellow, color: P.inkBlack, padding: "8px 14px",
        fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: 2,
      }}>#16</div>
    </div>
    {/* AUDIRA label — right side */}
    <div style={{
      position: "absolute", right: 48, top: 196,
      background: P.pureWhite, border: `4px solid ${P.inkBlack}`, boxShadow: `5px 5px 0 ${P.inkBlack}`,
      padding: "5px 14px",
      fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 24, letterSpacing: 3, color: P.inkBlack,
    }}>AUDIRA</div>
    {/* title block */}
    <div style={{ position: "absolute", left: 48, top: 266 }}>
      <div style={{
        display: "inline-block", background: P.pureWhite,
        border: `5px solid ${P.inkBlack}`, boxShadow: `9px 9px 0 ${P.inkBlack}`,
        padding: "0 22px 4px", marginBottom: 12,
      }}>
        <div style={{ fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 136, lineHeight: 1.0, color: P.inkBlack, letterSpacing: -2 }}>HEGE</div>
        <div style={{ fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 136, lineHeight: 1.0, color: P.inkBlack, letterSpacing: -2 }}>MONI</div>
      </div>
      <div style={{
        background: BAYERN_RED, border: `5px solid ${P.inkBlack}`, boxShadow: `9px 9px 0 ${P.inkBlack}`,
        padding: "2px 22px 6px", display: "inline-block", marginBottom: 14,
      }}>
        <div style={{ fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 112, lineHeight: 1.0, color: P.pureWhite, letterSpacing: -1 }}>BAVARIA</div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{
          background: P.neoYellow, border: `4px solid ${P.inkBlack}`, boxShadow: `5px 5px 0 ${P.inkBlack}`,
          padding: "4px 14px 6px",
          fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 32, color: P.inkBlack,
        }}>33× BUNDESLIGA</div>
        <div style={{
          background: P.inkBlack, padding: "4px 14px 6px",
          fontFamily: "Impact,'Arial Narrow',Arial,sans-serif", fontWeight: 900, fontSize: 32, color: P.pureWhite,
        }}>MÜNCHEN</div>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BAYERN_RED }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 30 }}
      >
        <CameraRig />
        <color attach="background" args={[BAYERN_RED]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.6} />
        <BayernCard />
        <Finish
          frame={0}
          background={BAYERN_RED}
          profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
          ao={false}
          envIntensity={0}
        />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
