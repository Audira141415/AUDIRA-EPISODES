// EP08 cover + hook key image: "200+ ALAT BEDAH" (PRECISION). Product-shot of one polished scalpel
// (steel blade, brass ferrules, ebony grip) hovering above its own ink drawing in Kitab al-Tasrif,
// part 30, on a graphite studio table; ink flecks rise from the page and turn into metal.
// Strictly non-graphic: no patient, no body, no wound, no blood; no faces; the page script is abstract.
import React from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Book, Motes, Scalpel, Softboxes, Table } from "./parts.tsx";
import { COVER, type Framing } from "./framing.ts";
import { HERO, PAL } from "./world.ts";

export { COVER };

/** Camera from a framing (orbit around target); `f` = 60 fps film frames for a slow push. */
export const CameraRig: React.FC<{ fr: Framing; f: number; push?: number }> = ({ fr, f, push = 0.0025 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const d = fr.d - f * push;
  const yaw = fr.yaw + f * 0.00035;
  const t = new THREE.Vector3(...fr.target);
  cam.fov = fr.fov;
  cam.near = 0.05;
  cam.far = 120;
  cam.position.set(t.x + d * Math.cos(fr.pitch) * Math.sin(yaw), t.y + d * Math.sin(fr.pitch), t.z + d * Math.cos(fr.pitch) * Math.cos(yaw));
  cam.lookAt(t);
  cam.updateProjectionMatrix();
  return null;
};

export const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.12} color="#fff4e6" />
    {/* key softbox: white, from the front-right above (style memory: key (4,6,6) 1.6) */}
    <spotLight
      position={[4, 9, 6]}
      angle={0.55}
      penumbra={0.9}
      intensity={260}
      decay={2}
      color="#fff6ea"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0003}
      shadow-normalBias={0.02}
    />
    {/* warm fill over the parchment */}
    <directionalLight position={[-6, 5, 3]} intensity={0.55} color="#ffd9a8" />
    {/* cool rim from behind (style memory: (-5,3,-4) 1.4) for the blade edge and brass rings */}
    <directionalLight position={[-5, 3, -4]} intensity={1.4} color="#cfe0ff" />
    <directionalLight position={[5, 2.5, -5]} intensity={0.8} color="#dfe8ff" />
  </>
);

export const HeroScalpel: React.FC<{ f: number; lift?: number }> = ({ f, lift = 1 }) => {
  const bob = Math.sin(f * 0.02) * 0.03;
  return (
    <group position={[HERO.pos[0], 0.35 + (HERO.pos[1] - 0.35) * lift + bob, HERO.pos[2]]} rotation={[0, HERO.yaw + f * 0.0004, 0]}>
      <group rotation={[HERO.tilt, 0, HERO.roll]} scale={HERO.scale}>
        <Scalpel />
      </group>
    </group>
  );
};

export const ZahrawiWorld: React.FC<{ f: number; motes?: boolean }> = ({ f, motes = false }) => (
  <>
    <Lights />
    <Softboxes />
    <Table />
    <Book />
    <HeroScalpel f={f} />
    {motes ? <Motes from={[-1.95, 0.42, -0.5]} to={[HERO.pos[0], HERO.pos[1] - 0.15, HERO.pos[2]]} f={f} /> : null}
  </>
);

export const Overlay: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT, opacity: k }}>
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 820,
        background: "linear-gradient(180deg, rgba(12,11,10,0.9) 0%, rgba(12,11,10,0.78) 55%, rgba(12,11,10,0) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute", left: 72, top: 246, padding: "10px 22px", background: "rgba(14,13,12,0.92)",
        border: "2px solid rgba(224,164,99,0.55)", borderRadius: 10,
        color: PAL.copper, fontSize: 38, fontWeight: 700, letterSpacing: 6,
      }}
    >
      SEJARAH ISLAM · EP08
    </div>
    <div style={{ position: "absolute", left: 66, top: 330, color: PAL.ivory, fontSize: 158, fontWeight: 800, lineHeight: 0.98, letterSpacing: 1, textShadow: "0 6px 26px rgba(0,0,0,0.65)" }}>
      <span style={{ color: PAL.copper }}>200+</span> ALAT
      <br />
      BEDAH
    </div>
    <div style={{ position: "absolute", left: 72, top: 664, width: 930, color: "#e2d6bf", fontSize: 44, fontWeight: 600, lineHeight: 1.25, textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>
      digambar dengan tinta, ± 1000 M
    </div>
  </div>
);

export const ZahrawiCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <Stage3D background={PAL.bg} overlay={() => <Overlay />}>
      <CameraRig fr={COVER} f={f} />
      <ZahrawiWorld f={f} />
      <Finish
        frame={frame}
        background={PAL.bg}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={1.08}
        envIntensity={0.5}
        hdri="studio"
        envRotation={0.8}
        aoRadius={0.08}
        focus={COVER.d}
        aperture={0.0035}
        maxBlur={0.006}
      />
    </Stage3D>
  );
};
