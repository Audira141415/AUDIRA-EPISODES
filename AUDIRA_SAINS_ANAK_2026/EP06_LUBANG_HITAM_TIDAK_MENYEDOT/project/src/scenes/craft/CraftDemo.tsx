// Reference scene for the film-craft helpers (core/film/craft.ts, core/film/Craft.tsx) and the
// Remotion-safe drei wrappers (core/polish/Drei.tsx). Check a change here before using it in a kit:
//   npm run stills -- out/craft 1s,2.5s,4s,5.5s,6.6s,7.5s CraftDemoPreview
//
// 0.0–2.0  a clay ball drops on 2s (stepTime) and lands with a volume-kept squash (impactSquash)
// 1.0–4.0  focus held on the glass orb (Glass) in front; cut-paper hills boil on twelves (BoilGroup)
// 3.6–5.0  rack focus to the AUDIRA lettering behind (SceneText + rackFocus into <Finish focus>)
// all      contact shadows (GroundShadow) on a wet floor (WetFloor); toon torus with an ink line (InkOutline)
// 6.0–8.0  a page peels over the frame (PagePeel); the shot changes colour under it at k = 0.5

import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { PerspectiveCamera } from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH } from "../../core/polish/Polish.tsx";
import { Glass, GroundShadow, InkOutline, SceneText, WetFloor } from "../../core/polish/Drei.tsx";
import { BoilGroup, PagePeel } from "../../core/film/Craft.tsx";
import { impactSquash, rackFocus, squash, stepTime } from "../../core/film/craft.ts";
import { getHandheldDrift } from "../../core/camera/handheld.ts";

export const CRAFT_DEMO_SECONDS = 8;

const LAND = 1.25; // seconds: the clay ball touches the floor
const DROP_FROM = 2.4;

/** Ball height while falling (free fall from DROP_FROM, landing at LAND). */
const fallY = (t: number) => {
  if (t >= LAND) return 0;
  const k = Math.max(0, t / LAND);
  return DROP_FROM * (1 - k * k);
};

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    // getHandheldDrift counts frames; t * 30 keeps the drift speed the same at 30 and 60 fps
    const drift = getHandheldDrift(t * 30, { posIntensity: 0.02, rotIntensity: 0.004, seed: 3 });
    // slow dolly in and a little rise: the camera keeps moving, the boil and stop motion carry the craft
    // 9:16 at a 44° vertical fov sees only ~26° across: about 10 units back fits the 4.5-unit set
    camera.position.set(0.3 + drift.posOffset[0], 2.3 + t * 0.03 + drift.posOffset[1], 10.4 - t * 0.22);
    camera.lookAt(0.3, 1.7, -0.6);
    camera.rotation.z += drift.rotOffset[2];
    camera.fov = 44;
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

const PaperHills: React.FC<{ t: number }> = ({ t }) => (
  <group position={[0, 0, -3.2]}>
    {[
      { c: "#d77a4f", x: -1.6, y: 0.55, s: 2.4, z: 0 },
      { c: "#e3a35b", x: 1.4, y: 0.42, s: 2.0, z: 0.15 },
      { c: "#7b8f6a", x: -0.3, y: 0.28, s: 2.8, z: 0.3 },
    ].map((h, i) => (
      <BoilGroup key={i} t={t} i={i} unit={0.006} position={[h.x, h.y, h.z]}>
        <mesh scale={[h.s, h.s * 0.45, 1]}>
          <circleGeometry args={[1, 48, 0, Math.PI]} />
          <meshStandardMaterial color={h.c} roughness={0.95} />
        </mesh>
      </BoilGroup>
    ))}
  </group>
);

export const CraftDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // stop motion: the clay animates on 2s at any film fps; the camera stays smooth
  const ts = stepTime(t, 12);
  const [sxz, sy] = squash(impactSquash(ts, LAND, 0.32, 2.6));
  const ballY = fallY(ts) + 0.45 * sy;

  // focus: on the orb (about 8.4 units away), then pulled to the lettering (about 12.6)
  const focus = rackFocus(t, 8.4, 12.6, 3.6, 5.0);

  // page peel from 6.0 s; the world under it changes at the cut (k = 0.5)
  const k = Math.max(0, Math.min(1, (t - 6.0) / 1.8));
  const night = k >= 0.5;

  return (
    <div style={{ width, height, background: night ? "#1b2233" : "#2a2330" }}>
      <ThreeCanvas width={width} height={height} shadows>
        <Rig t={t} />
        <hemisphereLight args={["#ffe9d6", "#2b2333", 0.6]} />
        <directionalLight position={[3, 6, 4]} intensity={2.2} color="#ffe2c4" />
        <pointLight position={[-2.5, 1.6, 1.5]} intensity={8} color="#7fb6ff" distance={8} />

        <WetFloor color={night ? "#141a26" : "#1c1720"} mirror={0.55} />
        <GroundShadow scale={8} opacity={0.65} blur={2.2} far={2.2} />

        {/* clay ball, stop motion with squash on landing */}
        <mesh position={[-0.9, ballY, 0.6]} scale={[0.45 * sxz, 0.45 * sy, 0.45 * sxz]} castShadow>
          <sphereGeometry args={[1, 48, 32]} />
          <meshPhysicalMaterial {...POLISH.clay} color="#e0644f" />
        </mesh>

        {/* glass orb in front of coloured blocks: refraction needs something behind it */}
        <mesh position={[0.75, 0.62, 1.5]}>
          <sphereGeometry args={[0.6, 64, 48]} />
          <Glass preset="clear" />
        </mesh>
        {["#f2c14e", "#3fa7d6", "#e85d75"].map((c, i) => (
          <mesh key={c} position={[0.25 + i * 0.5, 0.3, 0.55]} castShadow>
            <boxGeometry args={[0.36, 0.6, 0.36]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}

        {/* toon torus with an ink outline */}
        <mesh position={[1.75, 0.55, -0.4]} rotation={[0.9, t * 0.6, 0]} castShadow>
          <torusGeometry args={[0.4, 0.16, 24, 64]} />
          <meshToonMaterial color="#8bd17c" />
          <InkOutline thickness={0.035} />
        </mesh>

        <PaperHills t={t} />

        {/* brand in the world, behind: the rack focus lands on it */}
        <SceneText position={[0, 1.9, -3.0]} fontSize={0.9} color="#f6ead8" anchorX="center" anchorY="middle" letterSpacing={0.06}>
          AUDIRA
        </SceneText>
        <SceneText font="sans" position={[0, 2.62, -3.0]} fontSize={0.16} color="#d8c7b0" anchorX="center" anchorY="middle" letterSpacing={0.3}>
          FILM CRAFT · DREI
        </SceneText>

        <PagePeel k={k} color="#efe4cc" />

        <Finish
          frame={frame}
          background={night ? "#1b2233" : "#2a2330"}
          profile={COLOR_PROFILES.DOCUMENTARY_WARM}
          hdri="studio"
          envIntensity={0.7}
          focus={focus}
          aperture={0.0025}
          maxBlur={0.006}
        />
      </ThreeCanvas>
    </div>
  );
};
