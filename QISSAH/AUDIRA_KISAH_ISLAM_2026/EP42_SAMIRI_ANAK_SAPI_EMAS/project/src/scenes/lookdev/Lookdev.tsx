import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotCanvas } from "../../kits/chronicle/ShotCanvas.tsx";
import { GOLDEN, INK } from "../../kits/chronicle/looks.ts";
import { Figure, POSES, gait, type Costume, type Pose } from "../../kits/chronicle/Figure.tsx";
import { chronicleFontsReady } from "../../kits/chronicle/fonts.ts";

const CAST: { look: Costume; pose: (t: number) => Pose; outline: string | null; x: number; z: number; ry?: number }[] = [
  { look: { hat: "shako", wear: "coat", itemR: "musket" }, pose: () => POSES.shoulderArms(), outline: null, x: -2.6, z: 0, ry: 0.4 },
  { look: { hat: "bicorne", wear: "coat" }, pose: () => POSES.telescope(), outline: INK.foe, x: -1.5, z: -0.5, ry: 0.9 },
  { look: { hat: "destar", wear: "sarong", keris: true }, pose: () => POSES.akimbo(), outline: INK.hero, x: -0.3, z: 0.4, ry: 0.15 },
  { look: { hat: "peci", wear: "sarong" }, pose: (t) => gait(t * 6, 0), outline: INK.ally, x: 0.8, z: -0.3, ry: 1.4 },
  { look: { body: "f", hat: "bun", wear: "kain", load: "head" }, pose: () => POSES.carryHead(), outline: null, x: 1.8, z: 0.2, ry: -0.5 },
  { look: { hat: "caping", wear: "sarong", load: "back" }, pose: (t) => gait(t * 9, 1), outline: INK.foe, x: 2.9, z: -0.2, ry: -1.3 },
  { look: { hat: "turban", wear: "robe", itemR: "torch" }, pose: () => POSES.point("R", 0.1), outline: INK.grief, x: 0.2, z: -2.2, ry: 0.0 },
  { look: { hat: "peci", wear: "sarong" }, pose: () => POSES.kneel(0.7), outline: null, x: -1.2, z: 1.6, ry: 0.3 },
];

export const Lookdev: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [h] = useState(() => delayRender("fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => { chronicleFontsReady().then(() => { setOk(true); continueRender(h); }); }, [h]);
  const shot = { pos: [0.4 + Math.sin(t * 0.3) * 0.3, 1.3, 7.5] as [number, number, number], target: [0, 1.0, 0] as [number, number, number], fov: 38 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {ok && (
        <ShotCanvas shot={shot} look={GOLDEN} frame={frame}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[400, 400]} />
            <meshStandardMaterial color="#4a3426" roughness={1} />
          </mesh>
          <mesh position={[4, 0.6, -6]} castShadow receiveShadow>
            <boxGeometry args={[3, 1.2, 1.5]} />
            <meshStandardMaterial color="#6b5040" roughness={0.9} />
          </mesh>
          {CAST.map((c, i) => (
            <group key={i}>
              <Figure id={i + 1} pos={[c.x, 0, c.z]} rotY={c.ry} look={c.look} pose={c.pose(t)} outline={c.outline} t={t} />
            </group>
          ))}
        </ShotCanvas>
      )}
    </AbsoluteFill>
  );
};
