// EP17 cover (DRAFTFORGE): "Ajax Amsterdam Kiblat Total Football"
// Blueprint top-down view: a CAD-drafted football pitch with Ajax 4-3-3 formation dots,
// dimension callouts, and a TitleBlock stamp. AUDIRA brand as a revision stamp.
// Camera: near-orthographic top-down per DRAFTFORGE rig frame 0 — position [0.5, 8.5, 1.5].
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DRAFT_PALETTE as P } from "../../kits/draftforge/lib/palette.ts";
import { DraftingTable } from "../../kits/draftforge/world/DraftingTable.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

type V3 = [number, number, number];
const CAM_POS: V3 = [0.5, 8.5, 1.5];
const CAM_FOV = 38;
const Y = -1.94; // just above DraftingTable surface at y=-2.0

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...CAM_POS);
    c.lookAt(0, 0, 0);
    c.fov = CAM_FOV;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// thin horizontal line segment on the pitch plane (Y constant)
const HLine: React.FC<{ x1: number; x2: number; z: number; color: string; h?: number }> = ({
  x1, x2, z, color, h = 0.014,
}) => {
  const len = Math.abs(x2 - x1);
  return (
    <mesh position={[(x1 + x2) / 2, Y, z]}>
      <boxGeometry args={[len, h, h]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// thin vertical line segment on the pitch plane (Z axis)
const VLine: React.FC<{ x: number; z1: number; z2: number; color: string; h?: number }> = ({
  x, z1, z2, color, h = 0.014,
}) => {
  const len = Math.abs(z2 - z1);
  return (
    <mesh position={[x, Y, (z1 + z2) / 2]}>
      <boxGeometry args={[h, h, len]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// player circle marker — a thin disc
const Player: React.FC<{ x: number; z: number; color?: string; r?: number; star?: boolean }> = ({
  x, z, color = P.cadCyan, r = 0.14, star = false,
}) => (
  <group position={[x, Y + 0.015, z]}>
    {/* fill disc */}
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r * 0.6, 20]} />
      <meshBasicMaterial color={color} opacity={0.22} transparent />
    </mesh>
    {/* ring */}
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 0.6, r, 20]} />
      <meshBasicMaterial color={color} />
    </mesh>
    {star && (
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 6]} />
        <meshBasicMaterial color={P.dimensionGold} />
      </mesh>
    )}
  </group>
);

// approximate circle with line segments
const CircleLine: React.FC<{ x: number; z: number; r: number; color: string; segs?: number }> = ({
  x, z, r, color, segs = 24,
}) => {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      pts.push(
        x + Math.cos(a0) * r, Y + 0.016, z + Math.sin(a0) * r,
        x + Math.cos(a1) * r, Y + 0.016, z + Math.sin(a1) * r,
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [x, z, r, segs]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
};

// arrow head (small triangle) for formation arrow direction
const Arrow: React.FC<{ x: number; z: number; dx: number; dz: number; color: string }> = ({
  x, z, dx, dz, color,
}) => {
  const ang = Math.atan2(dx, dz);
  return (
    <mesh position={[x + dx, Y + 0.018, z + dz]} rotation={[Math.PI / 2, ang, 0]}>
      <coneGeometry args={[0.07, 0.18, 4]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// connection line between two players
const Connect: React.FC<{ x1: number; z1: number; x2: number; z2: number; color: string }> = ({
  x1, z1, x2, z2, color,
}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([x1, Y + 0.016, z1, x2, Y + 0.016, z2], 3));
    return g;
  }, [x1, z1, x2, z2]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} opacity={0.4} transparent />
    </lineSegments>
  );
};

// Ajax 4-3-3 Total Football positions (top-down, attack direction: -Z)
// Scaled pitch: ±1.5 wide, GK at z=+2.5, ST at z=-2.5
const FORMATION = {
  gk:  { x: 0.0, z:  2.5 },
  rb:  { x: 1.4, z:  1.5 },
  cbr: { x: 0.5, z:  2.0 },
  cbl: { x: -0.5, z: 2.0 },
  lb:  { x: -1.4, z: 1.5 },
  cmr: { x: 1.0, z:  0.4 },
  cmc: { x: 0.0, z:  0.1 },
  cml: { x: -1.0, z: 0.4 },
  rw:  { x: 1.5, z: -1.2 },
  st:  { x: 0.0, z: -2.4, star: true },
  lw:  { x: -1.5, z: -1.2 },
};

const PitchScene: React.FC = () => {
  const lineColor = P.cadCyan;
  const dimColor = P.gridMajor;
  const F = FORMATION;
  return (
    <>
      <DraftingTable size={12} divisions={48} />
      {/* Pitch boundary */}
      <HLine x1={-1.6} x2={1.6} z={2.8} color={lineColor} />
      <HLine x1={-1.6} x2={1.6} z={-2.8} color={lineColor} />
      <VLine x={-1.6} z1={-2.8} z2={2.8} color={lineColor} />
      <VLine x={1.6} z1={-2.8} z2={2.8} color={lineColor} />
      {/* Centre line */}
      <HLine x1={-1.6} x2={1.6} z={0} color={lineColor} h={0.012} />
      {/* Centre circle */}
      <CircleLine x={0} z={0} r={0.55} color={lineColor} />
      {/* Centre spot */}
      <Player x={0} z={0} color={dimColor} r={0.07} />
      {/* Top penalty area */}
      <HLine x1={-0.8} x2={0.8} z={2.8} color={dimColor} />
      <HLine x1={-0.8} x2={0.8} z={2.1} color={dimColor} />
      <VLine x={-0.8} z1={2.1} z2={2.8} color={dimColor} />
      <VLine x={0.8} z1={2.1} z2={2.8} color={dimColor} />
      {/* Bottom penalty area */}
      <HLine x1={-0.8} x2={0.8} z={-2.8} color={dimColor} />
      <HLine x1={-0.8} x2={0.8} z={-2.1} color={dimColor} />
      <VLine x={-0.8} z1={-2.8} z2={-2.1} color={dimColor} />
      <VLine x={0.8} z1={-2.8} z2={-2.1} color={dimColor} />

      {/* Formation connections (muted) */}
      {/* Defence arc */}
      <Connect x1={F.rb.x} z1={F.rb.z} x2={F.cbr.x} z2={F.cbr.z} color={lineColor} />
      <Connect x1={F.cbr.x} z1={F.cbr.z} x2={F.cbl.x} z2={F.cbl.z} color={lineColor} />
      <Connect x1={F.cbl.x} z1={F.cbl.z} x2={F.lb.x} z2={F.lb.z} color={lineColor} />
      {/* Midfield */}
      <Connect x1={F.cmr.x} z1={F.cmr.z} x2={F.cmc.x} z2={F.cmc.z} color={lineColor} />
      <Connect x1={F.cml.x} z1={F.cml.z} x2={F.cmc.x} z2={F.cmc.z} color={lineColor} />
      {/* Attack */}
      <Connect x1={F.rw.x} z1={F.rw.z} x2={F.st.x} z2={F.st.z} color={lineColor} />
      <Connect x1={F.lw.x} z1={F.lw.z} x2={F.st.x} z2={F.st.z} color={lineColor} />
      {/* Vertical links */}
      <Connect x1={F.cbr.x} z1={F.cbr.z} x2={F.cmr.x} z2={F.cmr.z} color={lineColor} />
      <Connect x1={F.cbl.x} z1={F.cbl.z} x2={F.cml.x} z2={F.cml.z} color={lineColor} />
      <Connect x1={F.cmc.x} z1={F.cmc.z} x2={F.st.x} z2={F.st.z} color={lineColor} />

      {/* Players */}
      <Player x={F.gk.x} z={F.gk.z} color={P.dimensionGold} />
      <Player x={F.rb.x} z={F.rb.z} />
      <Player x={F.cbr.x} z={F.cbr.z} />
      <Player x={F.cbl.x} z={F.cbl.z} />
      <Player x={F.lb.x} z={F.lb.z} />
      <Player x={F.cmr.x} z={F.cmr.z} />
      <Player x={F.cmc.x} z={F.cmc.z} />
      <Player x={F.cml.x} z={F.cml.z} />
      <Player x={F.rw.x} z={F.rw.z} />
      <Player x={F.st.x} z={F.st.z} star />
      <Player x={F.lw.x} z={F.lw.z} />

      {/* Attack direction arrow */}
      <Arrow x={0} z={-1.0} dx={0} dz={-0.9} color={P.dimensionGold} />

      <Finish
        frame={0}
        background={P.blueprintNavy}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        ao={false}
        envIntensity={0}
      />
    </>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* double-line border */}
    <div style={{ position: "absolute", inset: 36, border: `2px solid ${P.cadWhite}` }} />
    <div style={{ position: "absolute", inset: 42, border: `1px solid ${P.gridMajor}` }} />

    {/* top header zone */}
    <div style={{ position: "absolute", left: 36, right: 36, top: 36, height: 160, borderBottom: `1px solid ${P.cadWhite}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
      <div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: 3, color: P.textMuted }}>TACTICAL ANALYSIS SHEET</div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 24, letterSpacing: 4, color: P.cadCyan, fontWeight: "bold" }}>TOTAL FOOTBALL</div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: 2, color: P.dimensionGold }}>FORMATION: 4–3–3 · AJAX AMSTERDAM</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: 2, color: P.textMuted }}>EP. 17 / 2026</div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: 2, color: P.textMuted }}>REV. 01</div>
      </div>
    </div>

    {/* main title block — left side of frame */}
    <div style={{ position: "absolute", left: 56, top: 220 }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: 3, color: P.textMuted, marginBottom: 6 }}>PROJECT: SEJARAH SEPAK BOLA</div>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 72, lineHeight: 0.9, fontWeight: "bold", color: P.cadWhite, letterSpacing: -1 }}>KIBLAT</div>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 72, lineHeight: 0.9, fontWeight: "bold", color: P.cadCyan, letterSpacing: -1 }}>TOTAL</div>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 72, lineHeight: 0.9, fontWeight: "bold", color: P.cadWhite, letterSpacing: -1 }}>FOOTBALL</div>
    </div>

    {/* AUDIRA revision stamp — right side, rotated */}
    <div style={{ position: "absolute", right: 60, top: 230, transform: "rotate(90deg)", transformOrigin: "right center" }}>
      <div style={{ border: `2px solid ${P.stampCrimson}`, padding: "4px 14px", fontFamily: "'Courier New',monospace", fontWeight: "bold", fontSize: 18, letterSpacing: 4, color: P.stampCrimson }}>AUDIRA</div>
    </div>

    {/* bottom title block */}
    <div style={{ position: "absolute", left: 36, right: 36, bottom: 36 }}>
      <div style={{ borderTop: `1px solid ${P.cadWhite}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", fontFamily: "'Courier New',monospace", fontSize: 10, color: P.textMuted }}>
        <div style={{ padding: "8px 12px", borderRight: `1px solid ${P.gridMajor}` }}>
          <div>PROJECT</div>
          <div style={{ color: P.cadWhite, fontSize: 11, marginTop: 2 }}>SEJARAH SEPAK BOLA</div>
        </div>
        <div style={{ padding: "8px 12px", borderRight: `1px solid ${P.gridMajor}` }}>
          <div>SHEET</div>
          <div style={{ color: P.cadWhite, fontSize: 11, marginTop: 2 }}>17 / 44</div>
        </div>
        <div style={{ padding: "8px 12px", borderRight: `1px solid ${P.gridMajor}` }}>
          <div>SCALE</div>
          <div style={{ color: P.cadCyan, fontSize: 11, marginTop: 2 }}>1 : 50 [TACTICAL]</div>
        </div>
        <div style={{ padding: "8px 12px" }}>
          <div>DRAFTER</div>
          <div style={{ color: P.dimensionGold, fontSize: 11, marginTop: 2 }}>AUDIRA © 2026</div>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.blueprintNavy }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 40 }}
      >
        <CameraRig />
        <color attach="background" args={[P.blueprintNavy]} />
        <ambientLight intensity={0.6} color={P.cadCyan} />
        <directionalLight position={[2, 10, 2]} intensity={0.4} color="#ffffff" />
        <PitchScene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
