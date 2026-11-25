// The crochet table: a lace doily under the amigurumi cat being made, the ginger yarn ball feeding
// the hook, a little turtle, a cream crocheted label where AUDIRA is couched in teal cord, the teal
// ball, and a striped crocheted throw and yarn stash behind (soft, out of focus).

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { RAJUT_PALETTE as P, YARN } from "../lib/palette.ts";
import { laceAlpha } from "../lib/stitch.ts";
import {
  CROWN, GROW, LABEL, LETTERS, PIECES, hookLoop, hookPose, labelToWorld, letterLocal, oyenBall, pieceK, rounds, seg, tealBall, type V3,
} from "../core/motion.ts";
import { CordTube, Crocheted, YarnBall, YarnTube } from "./Crochet.tsx";
import { CrochetHook, OyenCat, Turtle } from "./Amigurumi3D.tsx";

/** A sagging strand between two points (a few control points, never through the table). */
const strand = (a: V3, b: V3, sag: number): V3[] =>
  [0, 0.25, 0.5, 0.75, 1].map((k) => {
    const y = a[1] + (b[1] - a[1]) * k - Math.sin(k * Math.PI) * sag;
    return [a[0] + (b[0] - a[0]) * k, Math.max(0.014, y), a[2] + (b[2] - a[2]) * k] as V3;
  });

const Table: React.FC = () => {
  const grain = useSurfaceGrain(31, 0.3, 6);
  const lace = laceAlpha();
  return (
    <group>
      <mesh position={[0, -0.05, -0.2]} receiveShadow>
        <boxGeometry args={[7, 0.1, 4.4]} />
        <meshPhysicalMaterial color={P.table} roughness={0.62} bumpMap={grain} bumpScale={0.6} clearcoat={0.25} clearcoatRoughness={0.45} />
      </mesh>
      <mesh position={[0, 0.003, 0.02]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow>
        <circleGeometry args={[0.82, 128]} />
        <meshPhysicalMaterial color={YARN.white} alphaMap={lace} alphaTest={0.5} roughness={0.95} sheen={0.8} sheenRoughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Backdrop: React.FC<{ t: number }> = () => {
  const plane = useMemo(() => new THREE.PlaneGeometry(6, 2.6, 120, 52), []);
  return (
    <group>
      {/* A striped crocheted throw hanging behind the table */}
      <Crocheted geometry={plane} color="#a8823c" sts={200} rounds={84} stripe={{ color: "#8d5b8a", every: 6 }} relief={0.012} fuzz={0} position={[0, 1.15, -2.3]} castShadow={false} />
      <YarnBall r={0.2} color={YARN.mustard} position={[-1.05, 0.2, -1.25]} spin={0.4} seed={11} />
      <YarnBall r={0.17} color={YARN.rose} position={[-0.6, 0.17, -1.45]} spin={1.2} seed={12} />
      <YarnBall r={0.18} color={YARN.sage} position={[0.55, 0.18, -1.35]} spin={2.1} seed={13} />
      <YarnBall r={0.15} color={YARN.plum} position={[1.35, 0.15, -1.15]} spin={0.9} seed={14} />
      <YarnBall r={0.13} color={YARN.cream} position={[0.95, 0.13, -1.55]} spin={2.6} seed={15} />
    </group>
  );
};

const Label: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(LABEL.w, LABEL.h, LABEL.d, 4, 0.02), []);
  const border = useMemo(() => {
    const w = LABEL.w / 2 - 0.035, h = LABEL.h / 2 - 0.035, z = LABEL.d / 2 + 0.006;
    const pts: V3[] = [];
    const corners: [number, number][] = [[w, h], [-w, h], [-w, -h], [w, -h]];
    corners.forEach(([x, y], i) => {
      const [nx, ny] = corners[(i + 1) % 4];
      for (let k = 0; k < 8; k++) pts.push([x + ((nx - x) * k) / 8, y + ((ny - y) * k) / 8, z]);
    });
    pts.push(pts[0]);
    return pts.map(labelToWorld);
  }, []);
  return (
    <group>
      <group position={LABEL.pos} rotation={[0, LABEL.yaw, 0]}>
        <Crocheted geometry={geo} color={YARN.cream} sts={48} rounds={16} relief={0.005} size={0.2} fuzz={1} />
      </group>
      <CordTube points={border} radius={0.011} color={YARN.oyen} drawn={1} />
      {PIECES.map((p, i) => {
        const k = pieceK(p, t);
        if (k <= 0) return null;
        const pts = p.s.map(([u, v]) => labelToWorld(letterLocal(p.letter, u, v)));
        return <CordTube key={i} points={pts} radius={LABEL.cord} color={YARN.teal} drawn={k} />;
      })}
    </group>
  );
};

export const CraftTable3D: React.FC<{ t: number }> = ({ t }) => {
  const P = rounds(t);
  const hook = hookPose(t);
  const loop = hookLoop(hook);
  const ob = oyenBall(t);
  const tb = tealBall(t);
  const obTop: V3 = [ob.pos[0] + ob.r * 0.35, ob.pos[1] + ob.r * 0.85, ob.pos[2] - ob.r * 0.2];
  const tbTop: V3 = [tb.pos[0] - tb.r * 0.4, tb.pos[1] + tb.r * 0.8, tb.pos[2] + tb.r * 0.2];
  // Ginger strand: hook → ball while crocheting; then the tail is pulled into the crown.
  const oyenEnd = t < GROW.end ? loop : CROWN;
  const oyenDrawn = 1 - seg(t, GROW.end, GROW.end + 0.5);
  const tealDrawn = seg(t, 6.55, LETTERS.start);
  return (
    <group>
      <Table />
      <Backdrop t={t} />
      <OyenCat t={t} grow={P} />
      <Turtle t={t} position={[-1.08, 0, -0.42]} yaw={0.7} />
      <YarnBall r={ob.r} color={YARN.oyen} position={ob.pos} spin={ob.spin} seed={3} />
      <YarnBall r={tb.r} color={YARN.teal} position={tb.pos} spin={tb.spin} seed={5} />
      <YarnTube points={strand(oyenEnd, obTop, 0.16)} color={YARN.oyen} radius={0.011} drawn={oyenDrawn} />
      {tealDrawn > 0 && <YarnTube points={strand(tbTop, loop, 0.12)} color={YARN.teal} radius={0.011} drawn={tealDrawn} />}
      <Label t={t} />
      <CrochetHook pose={hook} />
    </group>
  );
};
