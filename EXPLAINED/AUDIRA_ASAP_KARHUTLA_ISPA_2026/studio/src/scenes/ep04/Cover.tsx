// EP04 cover — "425 RIBU KASUS ISPA": hologram toddler lungs (ANATOMIX) with PM2.5 smoke particles
// drawn in through the airway and lodged in the bronchioles. No child's face or body.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HoloSuite3D } from "../../kits/anatomix/scene/HoloSuite3D";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Lungs3D } from "./Lungs3D";
import { CALLOUT_LEAF, coverCamera, project, toWorld } from "./lungModel";

const AMBER = "#FF9A4D";

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const pose = coverCamera(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.position);
    cam.lookAt(...pose.target);
    cam.fov = pose.fov;
    cam.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

const Overlay: React.FC<{ t: number; width: number; height: number }> = ({ t, width, height }) => {
  const s = width / 1080;
  const sans = "'Segoe UI', 'Inter', Arial, sans-serif";
  const mono = "Consolas, 'JetBrains Mono', monospace";
  const card = { background: "rgba(3,20,26,0.8)", border: `${1.5 * s}px solid rgba(63,224,208,0.35)`, borderRadius: 12 * s };

  const lungAnchor = project(t, toWorld({ x: -1.06, y: 0.2, z: 0.12 }), width, height);
  const leaf = project(t, toWorld(CALLOUT_LEAF.p), width, height);
  const lungCard = { x: 56 * s, y: 700 * s };
  const pmCard = { x: width - 56 * s, y: 1225 * s };

  return (
    <div style={{ position: "absolute", inset: 0, color: P.hud, fontFamily: sans }}>
      {/* top row: series line + in-HUD tag */}
      <div style={{ position: "absolute", top: 192 * s, left: 56 * s, right: 56 * s, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 26 * s, letterSpacing: 4 * s, color: P.holo, fontWeight: 700 }}>● AUDIRA · ASAP &amp; ISPA</div>
        <div style={{ ...card, border: `${2 * s}px solid ${P.holo}`, padding: `${6 * s}px ${16 * s}px`, fontFamily: mono, fontSize: 24 * s, fontWeight: 700, letterSpacing: 3 * s }}>AUDIRA MED</div>
      </div>

      {/* headline */}
      <div style={{ position: "absolute", top: 262 * s, left: 52 * s, right: 52 * s, textShadow: "0 6px 26px rgba(0,0,0,0.75)" }}>
        <div style={{ fontSize: 176 * s, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3 * s }}>
          425 <span style={{ color: AMBER }}>RIBU</span>
        </div>
        <div style={{ fontSize: 112 * s, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1 * s, marginTop: 4 * s }}>KASUS ISPA</div>
        <div style={{ display: "inline-block", marginTop: 18 * s, fontSize: 44 * s, fontWeight: 700, color: "#FFE2C9", background: "rgba(3,20,26,0.72)", borderLeft: `${7 * s}px solid ${AMBER}`, padding: `${6 * s}px ${18 * s}px` }}>
          95 ribu di antaranya balita
        </div>
      </div>

      {/* leader lines */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${lungAnchor.x},${lungAnchor.y} ${lungAnchor.x},${lungCard.y + 92 * s} ${lungCard.x + 330 * s},${lungCard.y + 92 * s}`} fill="none" stroke={P.holoSoft} strokeWidth={2.5 * s} />
        <circle cx={lungAnchor.x} cy={lungAnchor.y} r={8 * s} fill={P.holo} stroke="#fff" strokeWidth={2.5 * s} />
        <polyline points={`${leaf.x},${leaf.y} ${leaf.x + 40 * s},${pmCard.y + 40 * s} ${pmCard.x - 400 * s},${pmCard.y + 40 * s}`} fill="none" stroke={AMBER} strokeWidth={2.5 * s} />
        <circle cx={leaf.x} cy={leaf.y} r={30 * s} fill="none" stroke={AMBER} strokeWidth={2.5 * s} strokeDasharray={`${6 * s} ${5 * s}`} />
        <circle cx={leaf.x} cy={leaf.y} r={6 * s} fill={AMBER} stroke="#fff" strokeWidth={2 * s} />
      </svg>

      {/* PARU BALITA label */}
      <div style={{ position: "absolute", top: lungCard.y, left: lungCard.x, width: 330 * s, ...card, borderLeft: `${6 * s}px solid ${P.holo}`, padding: `${10 * s}px ${16 * s}px` }}>
        <div style={{ fontSize: 34 * s, fontWeight: 900, letterSpacing: 1 * s }}>PARU BALITA</div>
        <div style={{ fontFamily: mono, fontSize: 19 * s, color: "rgba(230,251,248,0.7)", marginTop: 2 * s }}>model hologram</div>
      </div>

      {/* PM2.5 callout */}
      <div style={{ position: "absolute", top: pmCard.y, right: width - pmCard.x, width: 400 * s, ...card, borderRight: `${6 * s}px solid ${AMBER}`, padding: `${12 * s}px ${18 * s}px`, textAlign: "right" }}>
        <div style={{ fontSize: 40 * s, fontWeight: 900, color: AMBER }}>PM2.5</div>
        <div style={{ fontSize: 25 * s, fontWeight: 600, lineHeight: 1.25 }}>lebih kecil dari 2,5 mikron</div>
      </div>

      {/* data panel */}
      <div style={{ position: "absolute", top: 1378 * s, left: 56 * s, right: 56 * s, ...card, borderLeft: `${6 * s}px solid ${P.holo}`, padding: `${14 * s}px ${22 * s}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 19 * s, letterSpacing: 2 * s, color: P.holo, fontWeight: 700 }}>
          <span>DATA · KASUS KUMULATIF</span>
          <span style={{ color: "rgba(230,251,248,0.55)" }}>MODEL ILUSTRATIF</span>
        </div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, marginTop: 6 * s }}>Kemenkes, 5 Nov 2026 · 7 provinsi</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * s, marginTop: 10 * s }}>
          <div style={{ flex: 1, height: 14 * s, borderRadius: 7 * s, background: "rgba(159,245,236,0.18)", overflow: "hidden" }}>
            <div style={{ width: "22.5%", height: "100%", background: AMBER, boxShadow: `0 0 ${14 * s}px ${AMBER}` }} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 21 * s, color: "#FFE2C9", whiteSpace: "nowrap" }}>balita ≈ 1 dari 5 kasus</div>
        </div>
      </div>
    </div>
  );
};

export const Ep04Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: P.void }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 34, near: 0.1, far: 80, position: [0, 0.75, 7.1] }}>
        <Rig t={t} />
        <color attach="background" args={[P.void]} />
        <ambientLight intensity={0.35} color="#CFF7F2" />
        <directionalLight position={[3, 5, 5]} intensity={1.6} color="#FFF3EE" />
        <directionalLight position={[-4, 2, -3]} intensity={1.2} color={P.holo} />
        <pointLight position={[0, 2.2, 0.8]} intensity={2.5} distance={4} color="#FF8A3D" />
        <HoloSuite3D t={t} />
        <Lungs3D t={t} />
        <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
      </ThreeCanvas>
      <Overlay t={t} width={width} height={height} />
    </AbsoluteFill>
  );
};
