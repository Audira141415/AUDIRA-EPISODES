// EP32 cover (VISUALINVESTIGATION): "Gol Hantu Wembley 1966"
// 1966 World Cup final, Hurst's disputed goal — ball crossed / didn't cross the line.
// Referee Dienst consulted Azerbaijani linesman Bakhramov; England won 4-2.
// Dark investigation desk + goal-line evidence diagram + red disputed zone.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { VISUALINVESTIGATION_PALETTE as P } from "../../kits/visualinvestigation/lib/palette";
import { ForensicDesk3D } from "../../kits/visualinvestigation/scene/ForensicDesk3D";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

// Top-down goal-line diagram rendered onto a canvas texture
const GoalLineDiagram: React.FC = () => {
  const diagramTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 600;
    const g = c.getContext("2d")!;
    // paper
    g.fillStyle = "#E4E0D4";
    g.fillRect(0, 0, 800, 600);
    // title
    g.fillStyle = "#1D1D1B";
    g.font = "bold 32px Arial, sans-serif";
    g.textAlign = "center";
    g.fillText("GOAL-LINE ANALYSIS — WEMBLEY 1966", 400, 46);
    g.font = "22px Arial, sans-serif";
    g.fillStyle = "#444";
    g.fillText("ENG 2–2 WGE (extra time, 101st min)", 400, 78);
    // goal line
    g.strokeStyle = "#1D1D1B";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(80, 320);
    g.lineTo(720, 320);
    g.stroke();
    // posts
    g.fillStyle = "#888";
    g.beginPath(); g.arc(80, 320, 20, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(720, 320, 20, 0, Math.PI * 2); g.fill();
    // "GOAL LINE" label
    g.fillStyle = "#1D1D1B";
    g.font = "bold 18px Arial";
    g.textAlign = "center";
    g.fillText("GOAL LINE", 400, 345);
    // ball — slightly above the line
    g.fillStyle = "#F5F5F0";
    g.strokeStyle = "#333";
    g.lineWidth = 3;
    g.beginPath(); g.arc(400, 290, 30, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#1D1D1B";
    g.font = "24px Arial";
    g.textAlign = "center";
    g.fillText("⚽", 396, 299);
    // disputed zone — red highlight
    g.fillStyle = "rgba(255,74,46,0.30)";
    g.fillRect(300, 260, 200, 68);
    g.strokeStyle = "#FF4A2E";
    g.lineWidth = 3;
    g.strokeRect(300, 260, 200, 68);
    g.fillStyle = "#FF4A2E";
    g.font = "bold 19px Arial";
    g.textAlign = "center";
    g.fillText("▲ DISPUTED ZONE", 400, 252);
    // evidence rows
    g.fillStyle = "#1D1D1B";
    g.font = "21px Arial";
    g.textAlign = "left";
    const rows = [
      "• Hurst cross-shot: crossbar → ground → out",
      "• Dienst (SUI) consulted Bakhramov (AZE)",
      "• Verdict: GOAL — no photo proof of full cross",
    ];
    rows.forEach((row, i) => g.fillText(row, 90, 395 + i * 36));
    g.fillStyle = "#FF4A2E";
    g.font = "bold 24px Arial";
    g.textAlign = "center";
    g.fillText("MASIH JADI KONTROVERSI 60 TAHUN", 400, 530);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

  return (
    <mesh position={[0.15, 0.6, -0.1]} rotation={[-0.08, 0.04, 0]}>
      <planeGeometry args={[2.7, 2.1]} />
      <meshStandardMaterial map={diagramTex} roughness={0.9} />
    </mesh>
  );
};

// AUDIRA evidence label card on the desk
const AudiraCard: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#FF4A2E";
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "#FFFFFF";
    g.font = "bold 72px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[-1.5, -0.1, 0.8]} rotation={[-Math.PI / 2, 0, 0.3]}>
      <planeGeometry args={[0.75, 0.19]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
};

const Scene32: React.FC<{ f: number }> = ({ f }) => (
  <>
    <color attach="background" args={[P.deskVoid]} />
    <fog attach="fog" args={[P.deskVoid, 10, 28]} />
    <ambientLight intensity={0.42} color="#FFFFFF" />
    <directionalLight position={[4, 7.5, 5]} intensity={1.6} color="#FFF8E7" castShadow shadow-mapSize={[2048, 2048]} />
    <directionalLight position={[-4, 4, -3]} intensity={0.72} color="#90CAF9" />
    {/* Red investigation spotlight on the evidence */}
    <spotLight position={[0.2, 4.5, 2]} intensity={2.5} color="#FF4A2E" angle={0.32} penumbra={0.55} />
    <ForensicDesk3D f={f} />
    <GoalLineDiagram />
    <AudiraCard />
    <Finish
      frame={Math.round(f)}
      background={P.deskVoid}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.95}
      envIntensity={0.28}
    />
  </>
);

const Overlay32: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(11,12,14,0.94) 0%, rgba(11,12,14,0.78) 20%, rgba(11,12,14,0) 38%, rgba(11,12,14,0) 78%, rgba(11,12,14,0.6) 100%)",
    }} />
    {/* Episode badge */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
        <div style={{ background: P.evidenceRed, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(8,8,10,0.94)", color: P.archivalPaper, padding: "8px 16px" }}>#32</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#F0EDE4", border: `2px solid ${P.evidenceRed}`, borderRadius: 8, padding: "6px 12px" }}>
        WEMBLEY · AUDIRA
      </div>
    </div>
    {/* Main title */}
    <div style={{ position: "absolute", left: 56, top: 290, fontFamily: ANTON, color: "#F0EDE4", lineHeight: 0.92, textShadow: "0 8px 28px rgba(0,0,0,0.75)" }}>
      <div style={{ fontSize: 148, letterSpacing: 1 }}>GOL</div>
      <div style={{ fontSize: 148, letterSpacing: 1, color: P.evidenceRed }}>HANTU</div>
      <div style={{ fontSize: 90, letterSpacing: 1 }}>WEMBLEY</div>
      <div style={{ marginTop: 12, display: "inline-block", fontFamily: MARKER, fontSize: 54, color: "#0B0C0E", background: P.archivalPaper, padding: "2px 20px 6px", transform: "rotate(-1.5deg)" }}>
        1966 · England 4–2 WGE
      </div>
    </div>
    {/* Investigation tags */}
    <div style={{ position: "absolute", left: 56, top: 700, display: "flex", gap: 12, flexWrap: "wrap" }}>
      {["BOLA MASUK?", "BAKHRAMOV", "KONTROVERSI"].map((tag) => (
        <div key={tag} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: P.evidenceRed, border: `1px solid ${P.evidenceRed}`, borderRadius: 6, padding: "4px 12px", letterSpacing: 1 }}>
          {tag}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: P.deskVoid }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 2.5, 5.5], fov: 42, near: 0.1, far: 60 }}
      >
        <Scene32 f={f} />
      </ThreeCanvas>
      <Overlay32 />
    </AbsoluteFill>
  );
};
