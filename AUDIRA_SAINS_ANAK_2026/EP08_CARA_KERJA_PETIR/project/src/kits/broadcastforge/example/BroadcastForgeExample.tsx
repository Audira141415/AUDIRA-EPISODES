import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ToyPerson } from "../../../core/polish/Person.tsx";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { VirtualNewsStudio3D } from "../scene/VirtualNewsStudio3D";
import { BroadcastCurvedScreen3D } from "../scene/BroadcastCurvedScreen3D";
import { LowerThirdTicker3D } from "../scene/LowerThirdTicker3D";
import { getBroadcastForgeCamera, getMultiCamBroadcastCamera } from "../camera/rig";
import { BroadcastForgeOverlay } from "../camera/Overlay";
import { BROADCASTFORGE_PALETTE as C } from "../lib/palette";

export const BROADCASTFORGE_EXAMPLE_SECONDS = 12;

const ANCHOR_LOOK = { top: "#1f2a3d", bottom: "#161b24", hair: "#1b1411", hairStyle: 1 } as const;

export interface BroadcastForgeExampleProps {
  useMultiCam?: boolean;
}

/** Procedural stand-in for the desk monitor GLB (used only if the model cannot load). */
const MonitorBlock: React.FC = () => (
  <group>
    <mesh position={[0, 0.2, 0]} castShadow>
      <RoundedBoxGeo args={[0.5, 0.32, 0.04]} radius={0.015} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#11161f" />
    </mesh>
    <mesh position={[0, 0.02, 0]}>
      <RoundedBoxGeo args={[0.16, 0.04, 0.12]} radius={0.01} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2a3140" />
    </mesh>
  </group>
);

export const BroadcastForgeExample: React.FC<BroadcastForgeExampleProps> = ({ useMultiCam = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;

  // Continuous hydraulic jib (default) or the multi-cam director.
  const cam = useMultiCam ? getMultiCamBroadcastCamera(f) : getBroadcastForgeCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={C.studioVoid}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      envIntensity={0.45}
      near={0.05}
      far={80}
      overlay={() => <BroadcastForgeOverlay f={f} showPipCorrespondent />}
    >
      {/* Studio lighting: warm key, cool fill, cyan rim behind the anchor */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3.5, 6.0, 5.0]}
        intensity={2.2}
        color="#FFF2E2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4.0, 3.5, 3.0]} intensity={0.9} color="#90CAF9" />
      <pointLight position={[0, 2.4, -0.9]} intensity={1.4} color={C.cyanAccent} distance={4} />

      <VirtualNewsStudio3D f={f} />
      <BroadcastCurvedScreen3D f={f} />
      {/* Glass name bar + spinning news orb across the desk front */}
      <LowerThirdTicker3D f={f} position={[0, 0.42, 0.97]} />

      {/* Anchor behind the desk (desk back edge at z 0.1, riser top at y 0.1) */}
      <ToyPerson f={f} seed={21} outfit="formal" pose="stand" expression="neutral" look={ANCHOR_LOOK} position={[0, 0.1, -0.15]} scale={1.65} />

      {/* Desk monitors on the wings, turned toward the anchor */}
      {([-0.95, 0.95] as const).map((x) => (
        <AssetModel
          key={x}
          id="desk-monitor-32cfce"
          size={0.5}
          ground
          polish="toyPlastic"
          position={[x, 0.86, 0.55]}
          rotation={[0, x < 0 ? 0.55 : -0.55, 0]}
          fallback={<MonitorBlock />}
        />
      ))}
    </FilmScene>
  );
};
