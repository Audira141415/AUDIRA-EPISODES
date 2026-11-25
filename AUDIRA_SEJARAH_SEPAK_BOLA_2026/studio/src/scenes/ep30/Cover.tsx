// EP30 cover (WATERCOLOR): "Tragedi Chapecoense 2016"
// LaMia 2933, 28 Nov 2016, 71 korban, 6 selamat. Copa Sudamericana final.
// Respectful memorial tone — no crash imagery. Soft watercolor washes over cold-press paper.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { WATERCOLOR_PALETTE as P } from "../../kits/watercolor/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

// Soft paper texture plane
const PaperBackdrop: React.FC = () => (
  <mesh position={[0, 0, -4]}>
    <planeGeometry args={[14, 26]} />
    <meshStandardMaterial color={P.paperCanvas} roughness={0.97} />
  </mesh>
);

// Cobalt sky wash layer
const SkyWash: React.FC = () => (
  <mesh position={[0, 5.5, -3.5]}>
    <planeGeometry args={[14, 12]} />
    <meshStandardMaterial color={P.washCobaltBlue} transparent opacity={0.19} roughness={0.95} />
  </mesh>
);

// Rolling hills — sage and umber for somber field tone
const Hills: React.FC = () => (
  <>
    <mesh position={[-3.6, -2.2, -3.1]}>
      <sphereGeometry args={[2.6, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshStandardMaterial color={P.washSageGreen} transparent opacity={0.36} roughness={0.95} />
    </mesh>
    <mesh position={[3.4, -2.6, -3.5]}>
      <sphereGeometry args={[2.1, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshStandardMaterial color={P.washEarthUmber} transparent opacity={0.26} roughness={0.95} />
    </mesh>
    <mesh position={[0.4, -3.0, -2.8]}>
      <sphereGeometry args={[1.6, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshStandardMaterial color={P.washPineGreen} transparent opacity={0.22} roughness={0.95} />
    </mesh>
  </>
);

// 6 candle-glow spheres — warm ochre, referencing 6 survivors
const MemorialLights: React.FC = () => {
  const positions: [number, number, number][] = [
    [-1.5, 2.1, -1.5], [-0.4, 2.5, -1.2], [0.8, 2.2, -1.6],
    [1.6, 2.6, -1.3], [-0.9, 3.0, -1.1], [0.3, 3.3, -0.9],
  ];
  return (
    <>
      {positions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color={P.washOchreGold} />
          </mesh>
          {/* soft halo */}
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color={P.washOchreGold} transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// AUDIRA brand painted as faint turf text
const TurfBrand: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 1024, 256);
    g.font = "bold 180px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = `rgba(78,123,156,0.28)`;
    g.fillText("AUDIRA", 512, 136);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, -4.5, -2.6]} rotation={[-Math.PI / 2 + 0.4, 0, 0]}>
      <planeGeometry args={[2.6, 0.65]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const Scene: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <color attach="background" args={[P.paperCanvas]} />
    <ambientLight intensity={0.95} color={P.ambientSoft} />
    <directionalLight position={[2, 6, 4]} intensity={1.1} color={P.sunlightMorning} castShadow />
    <PaperBackdrop />
    <SkyWash />
    <Hills />
    <MemorialLights />
    <TurfBrand />
    <Finish
      frame={frame}
      background={P.paperCanvas}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.70}
      envIntensity={0.10}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Paper vignette */}
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 42%, rgba(250,246,239,0) 36%, rgba(60,55,51,0.44) 100%)",
    }} />
    {/* Warm bottom glow */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 540,
      background: "linear-gradient(0deg, rgba(232,171,72,0.13) 0%, transparent 100%)",
    }} />

    {/* Episode badge */}
    <div style={{
      position: "absolute", left: 60, right: 60, top: 196,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
        <div style={{ background: P.washCobaltBlue, color: "#FAF6EF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(60,55,51,0.90)", color: P.washOchreGold, padding: "8px 16px" }}>#30</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: P.pencilGraphite, border: `2px solid ${P.washCobaltBlue}`, borderRadius: 8, padding: "6px 12px", opacity: 0.82 }}>
        AUDIRA
      </div>
    </div>

    {/* Main title */}
    <div style={{
      position: "absolute", left: 56, top: 296,
      fontFamily: ANTON, lineHeight: 0.92,
      textShadow: "0 6px 20px rgba(60,55,51,0.20)",
    }}>
      <div style={{ fontSize: 148, letterSpacing: 2, color: P.pencilGraphite }}>TRAGEDI</div>
      <div style={{ fontSize: 108, letterSpacing: 1, color: P.washCobaltBlue }}>CHAPECO</div>
      <div style={{ fontSize: 108, letterSpacing: 1, color: P.washCobaltBlue }}>ENSE</div>
    </div>

    {/* Year badge */}
    <div style={{
      position: "absolute", left: 56, top: 668,
      display: "inline-block", fontFamily: MARKER, fontSize: 60,
      color: P.pencilGraphite, background: P.washOchreGold,
      padding: "2px 20px 6px", transform: "rotate(-1.2deg)",
    }}>
      2016
    </div>

    {/* Subtitle facts */}
    <div style={{
      position: "absolute", left: 56, top: 762,
      fontFamily: MONO, fontSize: 30, fontWeight: 700,
      color: P.washEarthUmber, letterSpacing: 1, lineHeight: 1.65,
    }}>
      LaMia 2933 · 71 Korban, 6 Selamat<br />
      28 Nov · Copa Sudamericana Final
    </div>

    {/* Memorial epitaph */}
    <div style={{
      position: "absolute", left: 56, right: 56, bottom: 420,
      fontFamily: MARKER, fontSize: 48,
      color: P.washCobaltBlue, lineHeight: 1.5, opacity: 0.80,
    }}>
      Mimpi yang tak<br />sempat mendarat
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.paperCanvas }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 1.5, 7], fov: 36, near: 0.1, far: 60 }}
      >
        <Scene frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
