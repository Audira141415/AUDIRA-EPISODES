// BATIKFORGE technical example (12 s): batik tulis from blank cotton to a dyed kain whose mega mendung
// clouds lift off into 3D. Runs on FilmScene with the kit's own craft lighting (raking window light
// for wax-line legibility) and depth of field that follows the canting.
//
// 0.0–3.0   macro: the copper canting draws the first wax line round the big cloud (hook)
// 3.0–5.8   pull back; the whole wax pattern spreads (clouds, kawung field, parang border, AUDIRA cap)
// 6.0–8.4   the indigo climbs from the hem and stops at every wax line; the border takes soga brown
// 8.6–12    the three mega mendung clouds lift off as stacked bands; the camera cranes up beside them

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { Canting, Cloth3D, CLOTH_Y, CLOTH_Z, tipAt } from "../scene/Cloth3D.tsx";
import { MegaMendung3D } from "../scene/MegaMendung3D.tsx";
import { getBatikCamera, BATIK_SECONDS, BEAT } from "../camera/rig.ts";
import { BatikOverlay, type BatikStep } from "../camera/Overlay.tsx";
import { BATIK_PALETTE as P } from "../lib/palette.ts";

export const BATIKFORGE_EXAMPLE_SECONDS = BATIK_SECONDS;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

const STEPS: BatikStep[] = [
  { at: 0, label: "NYANTING", note: "malam panas digoreskan dengan canting" },
  { at: BEAT.drawEnd + 0.3, label: "NEMBOK", note: "pola ditutup malam: mega mendung, kawung, parang" },
  { at: BEAT.dyeStart, label: "NYELUP", note: "indigo meresap, malam menahan warna" },
  { at: BEAT.lift, label: "MEGA MENDUNG", note: "awan pembawa hujan, simbol kesabaran" },
];

export const BatikforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getBatikCamera(t);

  // one clock for the bead and the canting tip, so the wax always ends exactly under the spout
  const bead = clamp01(t / BEAT.drawEnd);
  const wax = t < BEAT.drawEnd ? 0 : 0.012 + 0.988 * smooth((t - BEAT.drawEnd - 0.2) / (BEAT.waxEnd - BEAT.drawEnd - 0.2));
  const dye = 1.03 * smooth((t - BEAT.dyeStart) / (BEAT.dyeEnd - BEAT.dyeStart));
  const soga = smooth((t - 7.6) / (BEAT.sogaEnd - 7.6));

  // the canting rides the line, then lifts away to the right
  const tip = tipAt(Math.min(1, t / BEAT.drawEnd));
  const away = smooth((t - BEAT.drawEnd) / 0.6);
  const cantingPos: [number, number, number] = [tip[0] + away * 0.5, tip[1] + away * 0.25, tip[2] + 0.004 + away * 0.35];

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
      background={P.bg}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      envIntensity={0.4}
      ao
      near={0.01}
      far={40}
      focus={shot.focus}
      aperture={0.004 - 0.0025 * smooth((t - 3.0) / 0.8)}
      maxBlur={0.006}
      overlay={() => <BatikOverlay t={t} steps={STEPS} end={BATIK_SECONDS} />}
    >
      <hemisphereLight args={["#FFE9CF", "#2A1C12", 0.45]} />
      {/* window light from the left: warm, raking across the cloth so folds and wax read */}
      <directionalLight
        position={[-2.6, 3.4, 2.4]}
        intensity={2.6}
        color={P.lamp}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3}
        shadow-camera-bottom={-0.5}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[2.4, 2.0, -1.0]} intensity={0.7} color={P.rim} />
      <Cloth3D wax={wax} dye={dye} soga={soga} bead={bead} />
      {away < 1 && <Canting position={cantingPos} tilt={away * 0.4} />}
      <MegaMendung3D t={t} liftAt={BEAT.lift} clothY={CLOTH_Y} clothZ={CLOTH_Z} />
    </FilmScene>
  );
};
