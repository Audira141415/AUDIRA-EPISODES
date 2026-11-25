// AE-062 cover: TACTICBOARD stadium plan, exit flow arrows, the narrowest point marked red.
// Facts on screen come from research/RESEARCH_REPORT.md: 8 min (Green Guide, stand -> free-flowing
// exit route), capacity counted at the narrowest point (SGSA), 66 people/m/min on stairs.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { StadiumBoard, heroAnchors } from "./StadiumBoard";
import { FONT } from "../../core/type/fonts.ts";

// 9:16 framing: fov 32 -> visible width = 2*d*tan(16deg)*9/16 = 0.3225*d. d ~ 21 at ~40 deg elevation
// -> ~6.8 units wide at the target: raked tiers read in 3D, far-left stands crop off the edge.
const CAM = { pos: [-1.3, 13.5, 14.0] as const, target: [0.9, 0, -2.0] as const, fov: 32 };
const camPos = (t: number): [number, number, number] => [CAM.pos[0] + Math.sin(t * 0.4) * 0.15, CAM.pos[1], CAM.pos[2]];

/** Same camera as the canvas, used to pin HTML labels to world points. */
const project = (p: THREE.Vector3, t: number, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(CAM.fov, w / h, 0.5, 160);
  cam.position.set(...camPos(t));
  cam.lookAt(CAM.target[0], CAM.target[1], CAM.target[2]);
  cam.updateMatrixWorld();
  const v = p.clone().project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...camPos(t));
    cam.lookAt(CAM.target[0], CAM.target[1], CAM.target[2]);
    cam.fov = CAM.fov;
    cam.near = 0.5;
    cam.far = 160;
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

const HERO = { side: "+x" as const, v: 0 };
// focus on the red vomitory; far stands and foreground tokens fall off softly
const FOCUS = new THREE.Vector3(...camPos(0.5)).distanceTo(heroAnchors(HERO).vom);

const Labels: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const s = h / 1920;
  const a = heroAnchors(HERO);
  const vom = project(a.vomTop, t, w, h);
  const gate = project(a.gate, t, w, h);
  const sans = FONT;
  const mono = FONT;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: sans }}>
      <div
        style={{
          position: "absolute",
          left: vom.x,
          top: vom.y,
          transform: "translate(-82%, -100%)",
          background: "rgba(150,26,14,0.95)",
          border: `${3 * s}px solid #FF8A6A`,
          borderRadius: 12 * s,
          padding: `${10 * s}px ${20 * s}px`,
          textAlign: "center",
          boxShadow: `0 ${10 * s}px ${28 * s}px rgba(0,0,0,0.55)`,
        }}
      >
        <div style={{ fontSize: 40 * s, fontWeight: 600, color: "#fff", letterSpacing: 0.5 * s, whiteSpace: "nowrap" }}>TITIK TERSEMPIT</div>
        <div style={{ fontFamily: mono, fontSize: 19 * s, fontWeight: 600, color: "#FFD1C7", letterSpacing: 1.5 * s, whiteSpace: "nowrap" }}>LEBAR LORONG INI YANG DIHITUNG</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: gate.x,
          top: gate.y,
          transform: "translate(-96%, -135%)",
          background: "#40E08C",
          color: "#0A1A10",
          borderRadius: 8 * s,
          padding: `${6 * s}px ${14 * s}px`,
          fontSize: 24 * s,
          fontWeight: 600,
          whiteSpace: "nowrap",
          boxShadow: `0 ${6 * s}px ${18 * s}px rgba(0,0,0,0.5)`,
        }}
      >
        GERBANG KELUAR
      </div>
    </div>
  );
};

const Overlay: React.FC<{ s: number }> = ({ s }) => {
  const mono = FONT;
  const sans = FONT;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: P.hud, fontFamily: sans }}>
      <div style={{ position: "absolute", top: 262 * s, left: 60 * s, right: 60 * s }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * s, fontFamily: mono, fontSize: 26 * s, letterSpacing: 4 * s, fontWeight: 600, color: P.lane, textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>
          <span style={{ width: 14 * s, height: 14 * s, borderRadius: 7 * s, background: "#FF5A3C", display: "inline-block" }} />
          AUDIRA EXPLAINED · AE-062
        </div>
        <div style={{ marginTop: 14 * s, fontSize: 96 * s, fontWeight: 600, lineHeight: 0.98, letterSpacing: -1.5 * s, color: "#FFFFFF", textShadow: `0 ${5 * s}px ${22 * s}px rgba(0,0,0,0.8)` }}>
          STADION AMAN?
          <br />
          <span style={{ color: P.lane }}>CEK TITIK</span> <span style={{ color: "#FF6A4C" }}>TERSEMPIT</span>
        </div>
        <div style={{ display: "flex", gap: 14 * s, marginTop: 24 * s, alignItems: "stretch" }}>
          <div style={{ display: "flex", borderRadius: 10 * s, overflow: "hidden", boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.5)` }}>
            <div style={{ background: "rgba(8,12,18,0.92)", color: P.lane, fontFamily: mono, fontWeight: 600, fontSize: 44 * s, padding: `${6 * s}px ${18 * s}px` }}>8:00</div>
            <div style={{ background: P.lane, color: "#14110A", fontWeight: 600, fontSize: 22 * s, lineHeight: 1.15, padding: `${8 * s}px ${16 * s}px`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span>MAKS. KELUAR TRIBUN</span>
              <span style={{ fontFamily: mono, fontSize: 17 * s, fontWeight: 600, opacity: 0.8 }}>GREEN GUIDE (INGGRIS)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 404 * s, left: 60 * s, right: 60 * s }}>
        <div style={{ background: "rgba(7,11,16,0.88)", borderLeft: `${6 * s}px solid #FF5A3C`, borderRadius: 8 * s, padding: `${16 * s}px ${22 * s}px` }}>
          <div style={{ fontFamily: mono, fontSize: 19 * s, letterSpacing: 3 * s, color: "#FF8A6A", fontWeight: 600 }}>KAPASITAS KELUAR</div>
          <div style={{ fontSize: 34 * s, lineHeight: 1.25, marginTop: 6 * s, color: "#F4F7FA", fontWeight: 600 }}>
            Dihitung di lorong tersempit,
            <br />
            bukan di gerbang terbesar.
          </div>
        </div>
      </div>
    </div>
  );
};

export const Ep062Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: P.void }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: CAM.fov, near: 0.5, far: 160, position: [...CAM.pos] }}>
        <CameraRig t={t} />
        <color attach="background" args={[P.void]} />
        <fog attach="fog" args={[P.void, 34, 62]} />
        <ambientLight intensity={0.3} color="#DDE6F0" />
        <hemisphereLight args={["#CFE0FF", "#1A2A10", 0.5]} />
        <directionalLight
          position={[-6, 14, 7]}
          intensity={2.5}
          color={P.flood}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-camera-near={1}
          shadow-camera-far={45}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[8, 6, -10]} intensity={0.85} color="#9CC3FF" />
        <StadiumBoard t={t} hero={HERO} />
        <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} focus={FOCUS} aperture={0.0045} maxBlur={0.007} />
      </ThreeCanvas>
      <Labels t={t} w={width} h={height} />
      <Overlay s={height / 1920} />
    </AbsoluteFill>
  );
};
