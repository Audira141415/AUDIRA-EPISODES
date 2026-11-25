// The carver's bench: a teak panel being carved (floral relief, chisel and mallet, chips flying),
// then toys come out (gasing, car, ring tower), the AUDIRA letter blocks drop, and the panel is oiled.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { UKIR_PALETTE as P, WOOD } from "../lib/palette.ts";
import { floralPanel } from "../lib/relief.ts";
import { woodFinish, woodTexture } from "../lib/wood.ts";
import {
  WORD, BLOCK, blockState, blockX, carState, carveReveal, chipAt, chiselUv, makeChips, malletLift, oilAt, topState,
} from "../core/motion.ts";
import { ReliefPanel3D } from "./ReliefPanel3D.tsx";
import { Chisel, Gasing, LetterBlock, Mallet, RingTower, WoodCar } from "./Toys3D.tsx";

type V3 = [number, number, number];

export const PANEL = { w: 1.6, h: 1.0, thick: 0.06, z: -0.12 };
const SURF = PANEL.thick;

/** World position of a point on the panel face from its uv. */
export const panelPoint = (u: number, v: number): V3 => [(u - 0.5) * PANEL.w, SURF, PANEL.z - (v - 0.5) * PANEL.h];
export const chiselTip = (t: number): V3 => {
  const [u, v] = chiselUv(t);
  return panelPoint(u, v);
};
const restY = (x: number, z: number) => (Math.abs(x) < PANEL.w / 2 && Math.abs(z - PANEL.z) < PANEL.h / 2 ? SURF : 0);

const BLOCK_COLORS = [P.paintRed, P.paintYellow, P.paintGreen, P.paintBlue, P.paintRed, P.paintYellow];

const Chips: React.FC<{ t: number }> = ({ t }) => {
  const chips = useMemo(() => makeChips(chiselTip, restY, 5), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.TorusGeometry(0.011, 0.0028, 4, 10, Math.PI * 1.35), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: WOOD.jati.fresh, roughness: 0.8, sheen: 0.4, side: THREE.DoubleSide }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    chips.forEach((c, i) => {
      const s = chipAt(c, t);
      if (!s) {
        o.position.set(0, -10, 0);
        o.scale.setScalar(0.0001);
      } else {
        o.position.set(...s.p);
        o.rotation.set(...s.r);
        o.scale.setScalar(c.s);
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [chips, t]);
  return <instancedMesh ref={ref} args={[geo, mat, chips.length]} castShadow />;
};

/** Sawdust motes drifting in the window light. */
const Motes: React.FC<{ t: number }> = ({ t }) => {
  const N = 260;
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 43758.5453 % 1, Math.sin(i * 39.425) * 43758.5453 % 1].map((v) => Math.abs(v))), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(0.0035, 6, 4), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd9a0", transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    seeds.forEach(([a, b, c], i) => {
      const x = -1.3 + a * 2.6 + Math.sin(t * 0.3 + i) * 0.05;
      const y = 0.15 + ((b * 1.6 + t * 0.03 * (0.5 + c)) % 1.6);
      const z = -1.0 + c * 1.9 + Math.cos(t * 0.25 + i * 1.7) * 0.05;
      o.position.set(x, y, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [seeds, t]);
  return <instancedMesh ref={ref} args={[geo, mat, N]} />;
};

const Bench: React.FC = () => {
  const top = useMemo(() => {
    const m = woodTexture("sonokeling", 17).map.clone();
    m.repeat.set(2.2, 1);
    m.needsUpdate = true;
    return m;
  }, []);
  const wall = useMemo(() => {
    const m = woodTexture("sonokeling", 31).map.clone();
    m.repeat.set(1, 5);
    m.rotation = Math.PI / 2;
    m.needsUpdate = true;
    return m;
  }, []);
  const bump = woodTexture("jati", 17).bump;
  return (
    <group>
      <mesh position={[0, -0.07, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.14, 2.6]} />
        <meshPhysicalMaterial map={top} bumpMap={bump} bumpScale={0.4} {...woodFinish(true)} roughness={0.6} color="#d9c2ad" />
      </mesh>
      <mesh position={[0, 1.2, -1.45]} receiveShadow>
        <planeGeometry args={[7, 3.2]} />
        <meshStandardMaterial map={wall} color="#5e4c40" roughness={0.9} />
      </mesh>
      {/* Tool rack on the wall: a row of chisels */}
      <mesh position={[0, 0.78, -1.42]}>
        <boxGeometry args={[2.2, 0.06, 0.06]} />
        <meshPhysicalMaterial map={top} {...woodFinish(true)} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <Chisel key={i} position={[-1.0 + i * 0.2, 0.84 - (i % 3) * 0.02, -1.38]} rotation={[0, 0, Math.PI]} scale={1 + (i % 4) * 0.12} />
      ))}
    </group>
  );
};

export const Workshop3D: React.FC<{ t: number }> = ({ t }) => {
  const relief = floralPanel(3);
  const reveal = carveReveal(t);
  const oil = oilAt(t);
  const tip = chiselTip(t);
  const lift = malletLift(t);
  const toolsAway = Math.min(1, Math.max(0, (t - 4.5) / 0.6));
  const top = topState(t);
  const car = carState(t);
  // Chisel leans back against the carve direction; the mallet strikes its handle end.
  const lean = 0.38;
  const chiselTop: V3 = [tip[0] - Math.sin(lean) * 0.27, tip[1] + Math.cos(lean) * 0.27, tip[2]];
  const away = toolsAway * toolsAway;
  return (
    <group>
      <Bench />
      <ReliefPanel3D relief={relief} size={[PANEL.w, PANEL.h]} position={[0, SURF, PANEL.z]} rotation={[-Math.PI / 2, 0, 0]} reveal={reveal} oil={oil} depth={0.034} thickness={PANEL.thick} species="jati" detail={560} />
      {/* Tools lift off and move aside once the carving is done */}
      <group position={[away * -0.2, away * 0.9, away * -0.6]}>
        <Chisel position={tip} rotation={[0, 0, lean]} />
        <Mallet position={[chiselTop[0], chiselTop[1] + 0.07, chiselTop[2] - 0.3]} rotation={[-lift * 0.85, 0, 0]} />
      </group>
      <Chips t={t} />
      <Gasing position={top.pos} spin={top.spin} tilt={top.tilt} prec={top.prec} />
      <WoodCar position={[car.x, 0, 0.05]} roll={car.roll} />
      <RingTower position={[-1.28, 0, -0.55]} />
      {WORD.split("").map((ch, i) => {
        const s = blockState(i, t);
        if (!s.visible) return null;
        return <LetterBlock key={i} ch={ch} size={BLOCK.size} position={[blockX(i), s.y, BLOCK.z]} rotation={[s.rx, 0, s.rz]} color={BLOCK_COLORS[i]} oil={0.6} />;
      })}
      <Motes t={t} />
    </group>
  );
};
