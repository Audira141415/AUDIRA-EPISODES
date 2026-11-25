// The one continuous world of EP02: a white maquette of Masjidil Haram whose eras grow, shrink and
// change as a pure function of film time. Chapter set pieces live in ch02..ch08.tsx.
import React from "react";
import * as THREE from "three";
import { DomeRow, ERA_COL, Kabah, Label3D, Minaret, OldMinaret, Outline, Storeys, Wash, useMats } from "./parts.tsx";
import { Arcade, ARC_H } from "./arcade.tsx";
import { City, Hills } from "./city.tsx";
import { Tawaf } from "./people.tsx";
import { ALL, FAHD, OLD_ZONE, PLAQUE, S1, S1_IN, S3, bandAt, rectAt } from "./layout.ts";
import { worldState } from "./state.ts";
import { InitRing, Flood, LowWall } from "./ch02.tsx";
import { CentreMarks, HillMark, Wadi } from "./ch03.tsx";
import { Market, Masa } from "./ch05.tsx";
import { Cooling, Escalators, PrayerLot, RoofWorship, S1_ROOF_Y } from "./ch06.tsx";
import { RingBridge, RiwaqSaudi, S3Zone } from "./ch07.tsx";
import { Heritage, SKIP_E, SKIP_S } from "./ch08.tsx";
import { TOTAL } from "./tl.ts";

/** Low warm sun that slowly sweeps across the film (URBANFORGE "real solar path"). */
export const Sun: React.FC<{ t: number }> = ({ t }) => {
  const th = Math.atan2(9, -15) - 0.35 + 0.7 * (t / TOTAL);
  const pos: [number, number, number] = [Math.cos(th) * 17.5, 7.6, Math.sin(th) * 17.5];
  return (
    <>
      <hemisphereLight args={["#cfd6e6", "#1a1714", 0.26]} />
      <directionalLight
        position={pos}
        intensity={3.6}
        color="#ffd6a0"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0008}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[10, 8, -6]} intensity={0.32} color="#9fb4d8" />
    </>
  );
};

const S1_PIECES = [
  { x0: S1.x0, x1: 4.45, z0: S1.z0, z1: S1_IN.z0 },
  { x0: S1.x0, x1: 4.45, z0: S1_IN.z1, z1: S1.z1 },
  { x0: S1.x0, x1: S1_IN.x0, z0: S1_IN.z0, z1: S1_IN.z1 },
  { x0: S1_IN.x1, x1: 4.45, z0: S1_IN.z0, z1: S1_IN.z1 },
];
const S1_MINARETS: [number, number][] = [[-4.3, -4.7], [4.25, -4.7], [-4.3, 4.4], [4.25, 4.4], [-0.45, 4.4], [0.45, 4.4], [4.25, -1.2]];

export const HaramWorld: React.FC<{ t: number }> = ({ t }) => {
  const mats = useMats();
  const s = worldState(t);
  const R = rectAt(s.fp);
  const bw = bandAt(s.fp);
  const ring = s.ring;
  const pulse = s.hookPulse;
  const marbleMix = new THREE.Color("#cdc4b2").lerp(new THREE.Color("#f6f4ee"), s.matafWhite);
  const matafMat = mats.stone;
  matafMat.color.copy(marbleMix);
  matafMat.roughness = 0.9 - 0.5 * s.matafWhite;
  const oldMin: [number, number][] = [[R.x0 + 0.16, R.z0 + 0.16], [R.x1 - 0.16, R.z0 + 0.16], [R.x0 + 0.16, R.z1 - 0.16], [R.x1 - 0.16, R.z1 - 0.16]];

  return (
    <group>
      {/* plinth, site plate, courtyard floor */}
      <mesh material={mats.plinth} position={[0, -0.5, -6]} receiveShadow><boxGeometry args={[80, 1, 80]} /></mesh>
      <mesh material={mats.sand} position={[(OLD_ZONE.x0 + OLD_ZONE.x1) / 2, 0.006, (OLD_ZONE.z0 + OLD_ZONE.z1) / 2]} receiveShadow>
        <boxGeometry args={[OLD_ZONE.x1 - OLD_ZONE.x0 + 0.6, 0.012, OLD_ZONE.z1 - OLD_ZONE.z0 + 0.6]} />
      </mesh>
      <mesh material={mats.plaza} position={[(R.x0 + R.x1) / 2, 0.014, (R.z0 + R.z1) / 2]} receiveShadow><boxGeometry args={[R.x1 - R.x0, 0.008, R.z1 - R.z0]} /></mesh>
      <Wash pos={[(ALL.x0 + ALL.x1) / 2, 0.02, (ALL.z0 + ALL.z1) / 2]} size={[ALL.x1 - ALL.x0, ALL.z1 - ALL.z0]} color="#ffffff" opacity={0.08 * s.plaza} />

      {/* mataf disc */}
      {s.mataf > 0.02 && (
        <mesh material={matafMat} position={[0, 0.024, 0]} receiveShadow><cylinderGeometry args={[s.mataf, s.mataf, 0.012, 72]} /></mesh>
      )}
      <Kabah mats={mats} />
      <Tawaf t={t} density={s.tawaf} radius={Math.max(0.55, s.mataf * 0.96)} y={0.045} />

      {/* the courtyard eras */}
      <InitRing k={Math.max(s.initRing, ring[0])} />
      <LowWall R={R} vis={s.wall} lamps={s.umarLamps} mats={mats} />
      <Flood flood={s.flood} dam={s.dam} mats={mats} t={t} />
      <Arcade R={R} bw={bw} rise={s.arcade} mats={mats} domes={s.domes} flatLift={s.flatLift} tilt={s.tilt} fire={s.fire} piers={s.piers} marble={s.columnsMarble} lamps={s.elecLamps}
        skipE={s.fp > 5.99 ? SKIP_E : undefined} skipS={s.fp > 5.99 ? SKIP_S : undefined} />
      {s.fp > 5.99 && <Heritage catalogue={s.catalogue} tags={s.tags} oldest={s.oldest} isra={s.israCol} labels={s.riwaqLabels} mats={mats} />}
      <Outline {...R} y={ARC_H * s.arcade + 0.03} color={ERA_COL[s.fp > 5.5 ? 2 : 1]} k={s.fp < 0.5 ? 0 : 1.3 + 3.5 * ring[1] + 3 * s.keepOttoman + 2 * pulse} visible={s.wall > 0.05 || s.arcade > 0.05} />
      {Array.from({ length: s.oldMinaretCount }, (_, i) => (
        <OldMinaret key={i} pos={oldMin[i]} base={ARC_H * s.arcade} rise={s.oldMinarets * 4 > i ? Math.min(1, s.oldMinarets * 4 - i) : 0} mats={mats} />
      ))}
      <Wadi vis={s.wadi} shift={s.wadiShift} t={t} />
      <CentreMarks R={R} vis={s.centreMark} />
      <HillMark vis={s.hillMark} />

      {/* Saudi I: three-storey ring, Mas'a, seven minarets */}
      {S1_PIECES.map((p, i) => (
        <Storeys key={i} pos={[(p.x0 + p.x1) / 2, 0, (p.z0 + p.z1) / 2]} size={[p.x1 - p.x0, p.z1 - p.z0]} floors={3} rise={s.s1} mat={mats.plaster} core={mats.core} wash={ERA_COL[3]} washK={0.16 + 0.25 * ring[2]} />
      ))}
      <Outline {...S1} y={S1_ROOF_Y * s.s1 + 0.012} color={ERA_COL[3]} k={1.3 * s.s1 + 3.5 * ring[2] + 2 * pulse} visible={s.s1 > 0.05} />
      {S1_MINARETS.map((p, i) => (
        <Minaret key={i} pos={p} base={S1_ROOF_Y * s.s1} h={1.7} rise={s.s1Minarets} mats={mats} glow={s.minaretGlow} />
      ))}
      <Market vis={s.market} t={t} mats={mats} />
      <Masa rise={s.masa} wide={s.masaWide} divider={s.masaDivider} t={t} mats={mats} />
      <RoofWorship vis={s.roofPeople * s.s1} marble={s.roofMarble * s.s1} />

      {/* King Fahd west wing */}
      <PrayerLot vis={s.prayerLot} />
      <Storeys pos={[(FAHD.x0 + FAHD.x1) / 2, 0, (FAHD.z0 + FAHD.z1) / 2]} size={[FAHD.x1 - FAHD.x0, FAHD.z1 - FAHD.z0]} floors={3} rise={s.fahd} mat={mats.plaster} core={mats.core} wash={ERA_COL[4]} washK={0.16 + 0.25 * ring[3]} />
      {s.fahd > 0.95 && Array.from({ length: 4 }, (_, i) => (
        <DomeRow key={i} from={[FAHD.x0 + 0.4, FAHD.z0 + 0.6 + i * 1.2]} to={[FAHD.x1 - 0.3, FAHD.z0 + 0.6 + i * 1.2]} y={S1_ROOF_Y} r={0.09} mat={mats.plaster} />
      ))}
      <Outline {...FAHD} y={S1_ROOF_Y * s.fahd + 0.012} color={ERA_COL[4]} k={1.3 * s.fahd + 3.5 * ring[3] + 2 * pulse} visible={s.fahd > 0.05} />
      {([[FAHD.x0 + 0.2, -0.5], [FAHD.x0 + 0.2, 0.5]] as [number, number][]).map((p, i) => (
        <Minaret key={i} pos={p} base={S1_ROOF_Y * s.fahd} h={1.75} rise={s.fahdMinarets} mats={mats} glow={s.minaretGlow} />
      ))}
      <Cooling vis={s.cooling} t={t} mats={mats} />
      <Escalators rise={s.escalators} flow={s.escFlow} t={t} mats={mats} />

      {/* Third Saudi expansion (north) */}
      <S3Zone vis={s.s3Zone} />
      <Storeys pos={[(S3.x0 + S3.x1) / 2, 0, (S3.z0 + S3.z1) / 2 - 0.15]} size={[S3.x1 - S3.x0, S3.z1 - S3.z0 - 0.3]} floors={4} rise={s.s3} mat={mats.plaster} core={mats.core} wash={ERA_COL[5]} washK={0.16 + 0.25 * ring[4]} />
      {s.s3 > 0.3 && Array.from({ length: 5 }, (_, j) => (
        <DomeRow key={j} from={[S3.x0 + 0.5, S3.z0 + 1.0 + j * 1.35]} to={[S3.x1 - 0.5, S3.z0 + 1.0 + j * 1.35]} y={0.68 * s.s3} r={0.1} mat={mats.plaster} drop={(s.s3 - 0.3) / 0.7} seed={j} />
      ))}
      <Outline {...S3} y={0.68 * s.s3 + 0.012} color={ERA_COL[5]} k={1.3 * s.s3 + 3.5 * ring[4] + 2 * pulse} visible={s.s3 > 0.05} />
      <Outline {...ALL} y={0.03} color={ERA_COL[5]} k={3 * ring[4]} visible={ring[4] > 0.01} />
      {([[-0.6, S3.z0 + 0.2], [0.6, S3.z0 + 0.2], [S3.x1 - 0.2, S3.z0 + 0.2], [S3.x0 + 0.2, S3.z0 + 0.2]] as [number, number][]).map((p, i) => (
        <Minaret key={i} pos={p} base={0.68 * s.s3} h={2.1} rise={s.s3Minarets} mats={mats} glow={s.minaretGlow} />
      ))}
      <RingBridge vis={s.bridge} gone={s.bridgeGone} t={t} mats={mats} />
      <RiwaqSaudi rise={s.riwaqSaudi} mats={mats} glow={ring[4]} />

      {/* city, hills, the AUDIRA museum plaque */}
      <City s={s} clay={mats.clay} plaster={mats.plaster} />
      <Hills mat={mats.warm} />
      <group position={PLAQUE} rotation={[-0.62, 0, 0]}>
        <mesh material={mats.plinth} castShadow receiveShadow><boxGeometry args={[1.12, 0.36, 0.04]} /></mesh>
        <Label3D text="MAKET AUDIRA" sub="MASJIDIL HARAM · SKALA ±1:4.300" pos={[0, 0, 0.024]} rot={[0, 0, 0]} w={1.05} />
      </group>
    </group>
  );
};
