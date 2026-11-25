// EP70 scenes A–H (= s1–s8). One table, one jar: each scene changes what lives on it and where the camera looks.
import React from "react";
import { Room, Terrain, Scatter, Reeds, GlassJar, Cork, Plaque, LakeSection, lakeState, PressureGauge, Eruption, GasFlow, Village, Cattle, PipeFountain, MonounJar, PipeSpare, LAKE, C, win } from "./parts.tsx";
import { VILLAGES, type SceneId } from "./timeline.ts";

type SP = { t: number };

/** Everything that sits on the table in every scene. */
const World: React.FC<{ t: number; night: number; labels?: boolean; extras?: React.ReactNode }> = ({ t, night, labels = false, extras }) => {
  const s = lakeState(t);
  return (
    <group>
      <Room night={night} />
      <Terrain />
      <Scatter />
      <Reeds position={[2.6, -0.55, 3.6]} n={5} seed={11} />
      <Reeds position={[-1.6, -0.1, 2.4]} n={3} seed={12} />
      <LakeSection t={t} s={s} />
      <GlassJar />
      <Cork t={t} />
      <Plaque />
      {VILLAGES.map((_, i) => (
        <Village key={i} i={i} t={t} label={labels ? win(t, 58.4 + i * 0.7, 59.0 + i * 0.7) * (1 - win(t, 65.6, 66.3)) : 0} />
      ))}
      <MonounJar t={t} position={[-3.4, 0, -1.4]} />
      {/* magma glow under the crater */}
      <pointLight position={[0, 0.15, 0.6]} intensity={1.2 * s.magma} distance={2.4} color={C.magma} />
      {extras}
    </group>
  );
};

export const SceneA: React.FC<SP> = ({ t }) => <World t={t} night={1} />;
export const SceneB: React.FC<SP> = ({ t }) => <World t={t} night={1} extras={<pointLight position={[0, LAKE.floor + 0.2, 0.9]} intensity={0.6} distance={2} color="#7fd6e6" />} />;
export const SceneC: React.FC<SP> = ({ t }) => <World t={t} night={1} extras={<PressureGauge t={t} />} />;
export const SceneD: React.FC<SP> = ({ t }) => <World t={t} night={1} extras={<><Eruption t={t} /><GasFlow t={t} /></>} />;
export const SceneE: React.FC<SP> = ({ t }) => <World t={t} night={1} extras={<GasFlow t={t} />} />;
export const SceneF: React.FC<SP> = ({ t }) => <World t={t} night={1 - win(t, 67.4, 69.5)} labels extras={<><GasFlow t={t} /><Cattle t={t} /></>} />;
export const SceneG: React.FC<SP> = ({ t }) => <World t={t} night={0} extras={<><PipeFountain t={t} /><PipeSpare /></>} />;
export const SceneH: React.FC<SP> = ({ t }) => <World t={t} night={0} extras={<><PipeFountain t={t} /><PipeSpare /></>} />;

export const SCENES: Record<SceneId, React.FC<SP>> = { A: SceneA, B: SceneB, C: SceneC, D: SceneD, E: SceneE, F: SceneF, G: SceneG, H: SceneH };
