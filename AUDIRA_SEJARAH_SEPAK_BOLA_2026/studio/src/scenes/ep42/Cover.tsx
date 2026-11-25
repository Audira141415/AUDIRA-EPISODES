// EP42 cover (RETROWAVE): "Flamengo Era Zico 1981". Synthwave neon grid + retro sunset framing
// the greatest Brazilian club era: Zico, Bola de Ouro (1981+1983), Brasileiro 1980/82/83.
// Palette: voidDark bg, neonMagenta title, synthCyan accent, sunsetAmber year badge.
// AUDIRA brand: LED ad board on the grid horizon + neon text in overlay.

import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { RETROWAVE_PALETTE as P } from "../../kits/retrowave/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const W = 1080;
const H = 1920;

// Camera: static overhead view of neon grid + sun at cover frame 0
const CAM_POS: [number, number, number] = [0, 2.2, 5.0];
const CAM_TARGET: [number, number, number] = [0, 0.4, 0];
const CAM_FOV = 36;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...CAM_POS);
    cam.lookAt(...CAM_TARGET);
    cam.fov = CAM_FOV;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// Neon grid floor scrolling at frame 0: gridZ = 0
const NeonGrid: React.FC = () => (
  <mesh position={[0, -1.2, -3]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[18, 24, 20, 28]} />
    <meshBasicMaterial color={P.synthCyan} wireframe />
  </mesh>
);

// Retrowave horizon sun
const RetroSun: React.FC = () => {
  const tex = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    // sunset gradient: amber core fading to magenta rim
    const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    gr.addColorStop(0, "#FFF3C0");
    gr.addColorStop(0.35, P.sunsetAmber);
    gr.addColorStop(0.72, P.neonMagenta);
    gr.addColorStop(1, "transparent");
    g.fillStyle = gr;
    g.beginPath();
    g.arc(256, 256, 256, 0, Math.PI * 2);
    g.fill();
    // horizontal scan-cut lines (classic retrowave sun slices)
    g.fillStyle = P.voidDark;
    for (let i = 0; i < 7; i++) {
      const y = 256 + i * 28 + 32;
      const half = Math.sqrt(Math.max(0, 256 * 256 - (y - 256) ** 2));
      if (half > 0) g.fillRect(256 - half, y, half * 2, 11 + i * 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.4, -7]}>
      <circleGeometry args={[2.6, 64]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
};

// AUDIRA LED board on the horizon (brand inside world)
const LedBoard: React.FC = () => {
  const tex = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#050211";
    g.fillRect(0, 0, 2048, 128);
    g.fillStyle = `${P.synthCyan}55`;
    g.fillRect(0, 6, 2048, 4);
    g.fillRect(0, 118, 2048, 4);
    for (let x = 0; x < 2048; x += 20) {
      g.fillStyle = `${P.neonMagenta}22`;
      g.fillRect(x, 28, 8, 72);
    }
    g.font = "bold 60px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = P.synthCyan;
    g.shadowBlur = 16;
    g.fillStyle = P.synthCyan;
    g.fillText("AUDIRA", 1024, 65);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group position={[0, 0.08, -6.3]}>
      <mesh>
        <boxGeometry args={[7.0, 0.32, 0.06]} />
        <meshBasicMaterial color="#07031A" />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[6.8, 0.26]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

// Scanline overlay (CRT feel)
const ScanlineLayer: React.FC = () => {
  const W2 = W, H2 = H;
  return (
    <svg width={W2} height={H2} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.07 }}>
      {Array.from({ length: 240 }, (_, i) => (
        <line key={i} x1={0} y1={i * 8} x2={W2} y2={i * 8} stroke="#FFFFFF" strokeWidth={1} />
      ))}
    </svg>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[P.voidDark]} />
    <fog attach="fog" args={[P.voidDark, 10, 30]} />
    <ambientLight intensity={0.15} color={P.synthCyan} />
    <pointLight position={[0, 3, -4]} intensity={6} color={P.neonMagenta} distance={18} />
    <pointLight position={[-3, 1, 2]} intensity={3} color={P.synthCyan} distance={12} />
    <RetroSun />
    <NeonGrid />
    <LedBoard />
    <Finish frame={0} profile={COLOR_PROFILES.CYBER_NEON_VOID} ao={false} exposure={1.0} envIntensity={0} />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* vignette gradient */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(12,8,26,0.88) 0%, rgba(12,8,26,0.5) 22%, rgba(12,8,26,0) 42%, rgba(12,8,26,0) 72%, rgba(12,8,26,0.72) 100%)",
    }} />
    <ScanlineLayer />
    {/* kicker bar */}
    <div style={{ position: "absolute", left: 60, top: 196, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 4, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>
        <div style={{ background: P.neonMagenta, color: P.voidDark, padding: "6px 14px", textShadow: "none" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(0,246,255,0.14)", border: `1px solid ${P.synthCyan}`, color: P.synthCyan, padding: "6px 14px" }}>#42</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: P.phosphorGreen, letterSpacing: 3 }}>RETROWAVE</div>
    </div>
    {/* main title block */}
    <div style={{ position: "absolute", left: 56, top: 280, right: 56 }}>
      {/* neon accent line */}
      <div style={{ width: 80, height: 4, background: P.synthCyan, boxShadow: `0 0 14px ${P.synthCyan}`, marginBottom: 18 }} />
      <div style={{
        fontFamily: ANTON,
        fontSize: 148,
        lineHeight: 0.9,
        letterSpacing: 2,
        color: P.neonMagenta,
        textShadow: `0 0 24px ${P.neonMagenta}, 0 4px 32px rgba(255,0,127,0.6)`,
      }}>
        FLAMENGO
      </div>
      <div style={{
        fontFamily: ANTON,
        fontSize: 148,
        lineHeight: 0.9,
        letterSpacing: 2,
        color: P.chromeSilver,
        textShadow: "0 4px 24px rgba(0,0,0,0.9)",
        marginTop: 8,
      }}>
        ERA ZICO
      </div>
      {/* year badge */}
      <div style={{
        display: "inline-block",
        marginTop: 24,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 56,
        letterSpacing: 8,
        color: P.voidDark,
        background: P.sunsetAmber,
        padding: "4px 20px 8px",
        boxShadow: `0 0 24px ${P.sunsetAmber}88`,
      }}>
        1981
      </div>
      {/* subtitle */}
      <div style={{
        marginTop: 20,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 30,
        color: P.synthCyan,
        letterSpacing: 2,
        textShadow: `0 0 10px ${P.synthCyan}88`,
      }}>
        BOLA DE OURO · PENERUS PELÉ
      </div>
    </div>
    {/* stat chips bottom */}
    <div style={{ position: "absolute", left: 56, right: 56, bottom: 420, display: "flex", gap: 16, flexWrap: "wrap" }}>
      {[["500+", "GOL KARIER"], ["3×", "BRASILEIRO"], ["NYT 1981", "PENERUS PELÉ"]].map(([v, l]) => (
        <div key={l} style={{
          background: "rgba(12,8,26,0.85)",
          border: `1px solid ${P.neonMagenta}66`,
          borderLeft: `3px solid ${P.neonMagenta}`,
          padding: "8px 18px",
          fontFamily: MONO,
        }}>
          <div style={{ fontWeight: 800, fontSize: 32, color: P.neonMagenta, lineHeight: 1 }}>{v}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: P.chromeSilver, letterSpacing: 2, marginTop: 2 }}>{l}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.voidDark }}>
      <ThreeCanvas width={width} height={height} camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 80 }}>
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
