// EP11 world (TACTICBOARD): the red-black 4-4-2 block on the pitch board, Sacchi's 25 m compression
// shown live, and the seven European crowns that rise one by one on the centre line. Reuses the cover's
// pucks, ball and brand (Cover.tsx) so the film opens on the approved cover.
import React, { useMemo } from "react";
import * as THREE from "three";
import { PitchBoard3D } from "../../kits/tacticboard/scene/PitchBoard3D";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { MILAN, OPP, CARRIER, MilanPuck, OppPuck, Ball, TurfBrand, AdBoard, RED, BLACK } from "./Cover.tsx";
import { T, TROPHY_AT, seg, lerp } from "./timing.ts";

export type V3 = [number, number, number];
export const CHALK = "#FFE27A";
export const GOLD = P.goalGold;
export { RED, BLACK };

// 1 unit = 10 m. Cover block: defence line 1.3, midfield 0.15, forwards -1.2 (= 25 m).
const DEF_Z = 1.3;
const MID_Z = 0.15;
const FWD_Z = -1.2;

/** How open the block is: 1 = compact 25 m (cover), 0 = loose ~46 m. Opens on "jarak…", snaps shut on "…meter". */
const openness = (t: number) => {
  const expand = seg(t, T.jarak - 0.3, T.jarak + 0.8);
  const snap = seg(t, T.m25 - 0.2, T.m25end + 0.12);
  return 1 - expand * (1 - snap); // 1 compact, dips toward 0 (loose), back to 1
};
/** The whole block steps forward (toward the carrier, -z) to win the ball on "Sepuluh pemain… merebut bola". */
const fwdStep = (t: number) => seg(t, T.blok, T.blok + 1.1) * (1 - seg(t, T.rebut + 0.7, 38.05));

const LOOSE = 1.85; // loose spread factor around the midfield line
/** Animated z of a puck whose cover z is bz. */
export const puckZ = (bz: number, t: number) => {
  const o = openness(t);
  const loose = MID_Z + (bz - MID_Z) * LOOSE;
  return lerp(loose, bz, o) - fwdStep(t) * 0.55;
};
export const defZ = (t: number) => puckZ(DEF_Z + 0.35, t);
export const fwdZ = (t: number) => puckZ(FWD_Z - 0.35, t);

// Seven crowns on the centre line, far half of the board.
const TR_Z = -2.45;
const TR_XS = [-1.95, -1.3, -0.65, 0, 0.65, 1.3, 1.95];
export const TROPHY_POS: V3[] = TR_XS.map((x) => [x, 0.42, TR_Z]);

const Trophy: React.FC<{ x: number; t: number; at: number; hero: boolean }> = ({ x, t, at, hero }) => {
  const rise = seg(t, at, at + 0.55);
  if (rise <= 0.001) return null;
  const pop = 1 + 0.14 * Math.max(0, 1 - Math.abs(t - at - 0.5) / 0.3);
  const y = (1 - rise) * -0.55;
  const gold = useMemo(() => ({ color: "#FFCF52", metalness: 0.92, roughness: 0.2, emissive: new THREE.Color("#5A3B00") }), []);
  const glow = hero ? 0.22 + 0.1 * Math.max(0, Math.sin((t - at) * 2.0)) : 0.04;
  return (
    <group position={[x, y, TR_Z]} scale={[rise, rise * pop, rise]}>
      {/* plinth */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.3, 0.06, 0.3]} radius={0.015} segments={2} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={hero ? "#1C1410" : "#15171B"} />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.14, 0.05, 32]} />
        <meshStandardMaterial {...gold} emissiveIntensity={glow} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.034, 0.1, 20]} />
        <meshStandardMaterial {...gold} emissiveIntensity={glow} />
      </mesh>
      {/* cup */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.055, 0.17, 32]} />
        <meshStandardMaterial {...gold} emissiveIntensity={glow} />
      </mesh>
      {/* handles */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.15, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.055, 0.016, 10, 20, Math.PI]} />
          <meshStandardMaterial {...gold} emissiveIntensity={glow} />
        </mesh>
      ))}
      {hero && (
        <pointLight position={[0, 0.6, 0.35]} intensity={1.4} distance={2.0} color="#FFC661" />
      )}
    </group>
  );
};

// Two glowing chalk lines of the block (defence + forward), at their animated z.
const BlockLine: React.FC<{ z: number; o: number }> = ({ z, o }) => {
  const segs = useMemo(() => {
    const out: number[] = [];
    for (let x = -1.85; x < 1.85; x += 0.24) out.push(x);
    return out;
  }, []);
  if (o <= 0.01) return null;
  return (
    <group position={[0, 0.016, z]}>
      {segs.map((x) => (
        <mesh key={x} position={[x + 0.07, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 0.035]} />
          <meshBasicMaterial color={CHALK} toneMapped={false} transparent opacity={0.9 * o} />
        </mesh>
      ))}
    </group>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const step = fwdStep(t);
  const lineO = seg(t, T.sacchi, T.sacchi + 0.6) * (1 - seg(t, 37.6, 38.1));
  return (
    <>
      <PitchBoard3D t={t} />
      <BlockLine z={defZ(t)} o={lineO} />
      <BlockLine z={fwdZ(t)} o={lineO} />
      {MILAN.map((m, i) => (
        <MilanPuck key={m.n} x={m.p[0]} z={puckZ(m.p[1], t)} n={m.n} seed={31 + i * 7} />
      ))}
      {OPP.map((o, i) => (
        <OppPuck key={i} x={o[0]} z={o[1] - step * 0.1} />
      ))}
      <Ball pos={[CARRIER[0] - 0.1, 0.12, CARRIER[1] + 0.36 - step * 0.3]} />
      <TurfBrand />
      <AdBoard />
      {TR_XS.map((x, i) => (
        <Trophy key={i} x={x} t={t} at={TROPHY_AT[i]} hero={i === 6} />
      ))}
    </>
  );
};
