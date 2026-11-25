// EP15 cover (FILM16): "Juventus La Vecchia Signora"
// A 16mm documentary frame: a black-and-white striped jersey form under warm tungsten light,
// two gold scudetto discs on the table in front. FilmGate adds grain, dust, gate weave, flicker.
// AUDIRA brand stenciled on the wood table surface.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmGate } from "../../kits/film16/camera/FilmGate.tsx";
import { FILM16_GRADE, FILM16_PALETTE as P } from "../../kits/film16/lib/palette.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";

type V3 = [number, number, number];
const BLACK = "#0A0A0C";
const WHITE = "#F0EDE4";
const GOLD = "#C8A227";
const CAM_POS: V3 = [0.3, 1.5, 3.1];
const CAM_FOV = 36;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...CAM_POS);
    c.lookAt(0.1, 0.3, 0);
    c.fov = CAM_FOV;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const makeStripeTex = () => {
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 512;
  const g = cv.getContext("2d")!;
  for (let i = 0; i < 4; i++) {
    g.fillStyle = i % 2 ? WHITE : BLACK;
    g.fillRect(i * 32, 0, 32, 512);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  return t;
};

const makeBrandTex = () => {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = "rgba(240,237,228,0.3)";
  g.font = "bold 86px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("AUDIRA", 256, 64);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const JerseyForm: React.FC<{ tex: THREE.Texture }> = ({ tex }) => (
  <group position={[0, 0.1, 0]} rotation={[0.1, 0.2, 0]}>
    {/* torso */}
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={[0.9, 1.3, 0.28]} radius={0.05} segments={3} />
      <meshPhysicalMaterial {...POLISH.brickABS} map={tex} />
    </mesh>
    {/* left sleeve */}
    <mesh position={[-0.58, 0.28, 0]} rotation={[0, 0, 0.5]} castShadow>
      <RoundedBoxGeo args={[0.38, 0.24, 0.24]} radius={0.04} segments={2} />
      <meshPhysicalMaterial {...POLISH.brickABS} map={tex} />
    </mesh>
    {/* right sleeve */}
    <mesh position={[0.58, 0.28, 0]} rotation={[0, 0, -0.5]} castShadow>
      <RoundedBoxGeo args={[0.38, 0.24, 0.24]} radius={0.04} segments={2} />
      <meshPhysicalMaterial {...POLISH.brickABS} map={tex} />
    </mesh>
  </group>
);

const Scudetto: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <mesh castShadow>
      <cylinderGeometry args={[0.21, 0.21, 0.04, 32]} />
      <meshPhysicalMaterial roughness={0.18} metalness={0.9} color={GOLD} envMapIntensity={1.2} />
    </mesh>
    <mesh position={[0, 0.025, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.01, 32]} />
      <meshPhysicalMaterial roughness={0.5} color={BLACK} />
    </mesh>
  </group>
);

const Scene: React.FC = () => {
  const stripeTex = useMemo(makeStripeTex, []);
  const brandTex = useMemo(makeBrandTex, []);
  return (
    <>
      <CameraRig />
      <color attach="background" args={[P.bg]} />
      <ambientLight intensity={0.15} color="#C0A07A" />
      <directionalLight position={[-2, 4, 3]} intensity={2.9} color={P.sun} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-bias={-0.0003} />
      <pointLight position={[1.2, 1.2, 1.5]} intensity={0.55} color="#FFE0A0" distance={4} />
      {/* wood table */}
      <mesh receiveShadow position={[0, -0.65, 0]}>
        <boxGeometry args={[7, 0.08, 7]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#6B4B2C" />
      </mesh>
      <JerseyForm tex={stripeTex} />
      <Scudetto pos={[0.52, -0.58, 0.55]} />
      <Scudetto pos={[-0.42, -0.58, 0.62]} />
      {/* AUDIRA brand stencil on table */}
      <mesh position={[0.08, -0.6, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.45]} />
        <meshBasicMaterial map={brandTex} transparent depthWrite={false} />
      </mesh>
      <Finish
        frame={0}
        profile={FILM16_GRADE}
        exposure={0.9}
        hdri="warmStudio"
        envIntensity={0.25}
        focus={2.5}
        aperture={0.004}
        maxBlur={0.009}
      />
    </>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg,rgba(8,6,4,.88) 0%,rgba(8,6,4,.65) 20%,rgba(8,6,4,0) 44%,rgba(8,6,4,0) 78%,rgba(8,6,4,.58) 100%)",
    }} />
    {/* top badge */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", fontFamily: "'Courier New',monospace", fontWeight: 700, fontSize: 25, letterSpacing: 2 }}>
        <div style={{ background: BLACK, color: WHITE, padding: "7px 14px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: GOLD, color: BLACK, padding: "7px 14px" }}>#15</div>
      </div>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 23, letterSpacing: 2, color: WHITE, border: `2px solid ${GOLD}`, borderRadius: 6, padding: "5px 10px" }}>
        JUVENTUS · AUDIRA
      </div>
    </div>
    {/* title block */}
    <div style={{ position: "absolute", left: 56, top: 268 }}>
      <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 118, color: WHITE, lineHeight: 0.88, fontStyle: "italic", textShadow: "0 6px 24px rgba(0,0,0,.72)" }}>LA</div>
      <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 95, color: WHITE, lineHeight: 0.88, fontStyle: "italic", textShadow: "0 6px 24px rgba(0,0,0,.72)" }}>VECCHIA</div>
      <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 118, color: GOLD, lineHeight: 0.88, fontStyle: "italic", textShadow: "0 6px 24px rgba(0,0,0,.72)" }}>SIGNORA</div>
      <div style={{ marginTop: 24, display: "inline-block", fontFamily: "'Courier New',monospace", fontSize: 34, color: BLACK, background: WHITE, padding: "2px 16px 4px", transform: "rotate(-1.2deg)" }}>
        36 Scudetto · Torino 1897
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <FilmGate t={t} roll="JUVE · ROL 15" caption="Torino · 1897">
        <ThreeCanvas
          width={width}
          height={height}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.05, far: 30 }}
        >
          <Scene />
        </ThreeCanvas>
      </FilmGate>
      <Overlay />
    </AbsoluteFill>
  );
};
