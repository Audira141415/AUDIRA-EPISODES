// Reference scene for ToyPerson / SwimCrowd (core/polish/Person.tsx): a public pool with lane
// swimmers, floaters and people on the deck. Use it to check a figure change before using it in
// an episode: `npx remotion still src/index.ts PeopleDemoPreview out/people.png --frame=120`.

import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SwimCrowd, ToyPerson } from "../../core/polish/Person.tsx";

export const PEOPLE_DEMO_SECONDS = 10;

const POOL = { x: [-3, 3] as [number, number], z: [-5.2, 1] as [number, number], depth: 1.3 };
const W = POOL.x[1] - POOL.x[0];
const D = POOL.z[1] - POOL.z[0];
const CX = (POOL.x[0] + POOL.x[1]) / 2;
const CZ = (POOL.z[0] + POOL.z[1]) / 2;
const ROPES = [-3.6, -2.1, -0.6];

const LaneRope: React.FC<{ z: number }> = ({ z }) => {
  const n = Math.floor(W / 0.14);
  return (
    <group position={[POOL.x[0], 0.02, z]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[0.07 + i * 0.14, 0, 0]} scale={[1.2, 0.8, 0.8]}>
          <sphereGeometry args={[0.055, 12, 8]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={Math.floor(i / 4) % 2 ? "#f4f1ea" : i < 8 || i > n - 9 ? "#e8423f" : "#2f6fde"} />
        </mesh>
      ))}
    </group>
  );
};

const Pool: React.FC<{ t: number }> = ({ t }) => {
  // Seeded grain as a bump map gives the surface moving glints; offset drifts with the clock.
  const ripple = useSurfaceGrain(17, 0.5, 5);
  ripple.offset.set(t * 0.03, t * 0.05);
  return (
  <group>
    {/* Basin: tiled floor and walls */}
    <mesh position={[CX, -POOL.depth, CZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[W, D]} />
      <meshStandardMaterial color="#4cbfe0" roughness={0.6} />
    </mesh>
    {/* Lane lines on the floor */}
    {[-3.6, -2.1, -0.6].map((z) => (
      <mesh key={z} position={[CX, -POOL.depth + 0.005, z + 0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.8, 0.12]} />
        <meshStandardMaterial color="#1e5fa8" roughness={0.6} />
      </mesh>
    ))}
    {[
      { p: [CX, -POOL.depth / 2, POOL.z[0]] as const, s: [W, POOL.depth, 0.02] as const },
      { p: [POOL.x[0], -POOL.depth / 2, CZ] as const, s: [0.02, POOL.depth, D] as const },
      { p: [POOL.x[1], -POOL.depth / 2, CZ] as const, s: [0.02, POOL.depth, D] as const },
      { p: [CX, -POOL.depth / 2, POOL.z[1]] as const, s: [W, POOL.depth, 0.02] as const },
    ].map((w, i) => (
      <mesh key={i} position={[...w.p]}>
        <boxGeometry args={[...w.s]} />
        <meshStandardMaterial color="#5ccbe8" roughness={0.55} />
      </mesh>
    ))}
    {/* Water surface: transparent so the submerged half of each swimmer is tinted */}
    <mesh position={[CX, 0, CZ]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[W, D]} />
      <meshPhysicalMaterial color="#1396cf" transparent opacity={0.72} roughness={0.08} clearcoat={1} clearcoatRoughness={0.05} bumpMap={ripple} bumpScale={0.6} depthWrite={false} />
    </mesh>
    {/* Coping and deck */}
    {[
      { p: [CX, -0.04, POOL.z[0] - 0.15] as const, s: [W + 0.6, 0.12, 0.3] as const },
      { p: [CX, -0.04, POOL.z[1] + 0.15] as const, s: [W + 0.6, 0.12, 0.3] as const },
      { p: [POOL.x[0] - 0.15, -0.04, CZ] as const, s: [0.3, 0.12, D] as const },
      { p: [POOL.x[1] + 0.15, -0.04, CZ] as const, s: [0.3, 0.12, D] as const },
    ].map((c, i) => (
      <mesh key={i} position={[...c.p]} receiveShadow castShadow>
        <RoundedBoxGeo args={[...c.s]} radius={0.05} />
        <meshPhysicalMaterial {...POLISH.stone} color="#f6f3ec" />
      </mesh>
    ))}
    <mesh position={[CX, -0.11, CZ - 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[W + 9, D + 10]} />
      <meshStandardMaterial color="#e9dfcf" roughness={0.85} />
    </mesh>
    {/* Back wall with the AUDIRA board area */}
    <mesh position={[CX, 1.2, POOL.z[0] - 3.2]} receiveShadow>
      <boxGeometry args={[W + 9, 2.6, 0.2]} />
      <meshStandardMaterial color="#f2f5f7" roughness={0.8} />
    </mesh>
    {ROPES.map((z) => (
      <LaneRope key={z} z={z} />
    ))}
  </group>
  );
};

export const PeopleDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const t = f / 60;
  const camX = Math.sin(t * 0.25) * 0.8;

  return (
    <div style={{ width: "100%", height: "100%", background: "#bfe6f7" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ position: [camX, 3.9, 5.2 - t * 0.12], fov: 40, near: 0.1, far: 60 }}
        onCreated={({ camera }) => camera.lookAt(0, -0.5, -1.8)}
      >
        <hemisphereLight args={["#e9f6ff", "#d7c4a4", 0.9]} />
        <directionalLight
          position={[4, 8, 3]}
          intensity={2.4}
          color="#fff3df"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0004}
        />
        <Pool t={t} />
        <SwimCrowd f={f} seed={5} count={16} area={{ x: [POOL.x[0] + 0.5, POOL.x[1] - 0.5], z: [POOL.z[0] + 0.5, POOL.z[1] - 0.4] }} waterY={0} gap={0.95} avoidZ={ROPES} />
        {/* Deck: people walking, waving, cheering, and two sitting on the near edge */}
        <ToyPerson f={f} seed={21} pose="walk" outfit="casual" position={[-4.2 + t * 0.25, -0.1, -6]} heading={Math.PI / 2} />
        <ToyPerson f={f} seed={34} pose="wave" position={[1.4, -0.1, -6.2]} />
        <ToyPerson f={f} seed={8} pose="cheer" position={[2.3, -0.1, -6.0]} />
        <ToyPerson f={f} seed={55} pose="stand" outfit="casual" position={[3.9, -0.1, -2.2]} heading={-Math.PI / 2} />
        <ToyPerson f={f} seed={13} pose="sit" position={[-1.3, 0.02, POOL.z[1] + 0.12]} heading={Math.PI} />
        <ToyPerson f={f} seed={77} pose="sit" position={[-0.7, 0.02, POOL.z[1] + 0.12]} heading={Math.PI} />
        <Finish frame={frame} background="#bfe6f7" hdri="sky" profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.95} envIntensity={0.6} />
      </ThreeCanvas>
    </div>
  );
};
