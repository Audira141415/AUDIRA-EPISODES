// The potter's studio: wheel in front, terracotta rack behind it, the brick kiln behind-left (its
// mouth sits straight behind the piece from the final three-quarter view, so the glow rims the
// vase), plaster wall, clay-dusted floor, embers rising from the kiln while it fires.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { CLAY, GERABAH_PALETTE as P } from "../lib/palette.ts";
import { outerRadius, pieceHeight } from "../lib/profile.ts";
import { plasterTexture } from "../lib/textures.ts";
import {
  dripAt, dryAt, firedAt, glazeAt, heatAt, jugAt, openK, paintAt, ribState, throwK, wheelAngle, wobble,
} from "../core/motion.ts";
import { Vessel3D } from "./Vessel3D.tsx";
import { GlazeJug, Kiln, Rack, Rib, StampPlaque, Terracotta, Wheel, WHEEL_Y } from "./Pottery3D.tsx";

type V3 = [number, number, number];
export const KILN_POS: V3 = [-1.25, 0, -2.0];
export const RACK_POS: V3 = [0.12, 0, -1.0];
/** Camera azimuth (degrees) of the final reveal; the lettering is centred on it. */
export const LETTER_AZ = 30;
const RIB_AZ = -58; // world azimuth of the rib (degrees), to the left of the opening shots
const JUG_AZ = -40;

const Room: React.FC = () => {
  const plaster = plasterTexture();
  const wallMap = useMemo(() => {
    const m = plaster.clone();
    m.repeat.set(3, 1.6);
    m.needsUpdate = true;
    return m;
  }, [plaster]);
  const floorMap = useMemo(() => {
    const m = plaster.clone();
    m.repeat.set(4, 4);
    m.needsUpdate = true;
    return m;
  }, [plaster]);
  const grain = useSurfaceGrain(23, 0.3, 6);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial map={floorMap} color={P.floor} bumpMap={grain} bumpScale={0.6} roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.75, -2.7]} receiveShadow>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial map={wallMap} color={P.wall} roughness={0.95} />
      </mesh>
      {/* Side wall on the right so the reveal has a corner */}
      <mesh position={[1.55, 1.75, -0.6]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[4, 3.5]} />
        <meshStandardMaterial map={wallMap} color="#3e2a1f" roughness={0.95} />
      </mesh>
      {/* Clay dust and slip spatter on the floor round the wheel */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.75, 48]} />
        <meshStandardMaterial color="#6d4a35" roughness={0.95} transparent opacity={0.45} />
      </mesh>
    </group>
  );
};

/** Embers drifting up from the kiln mouth (more while it fires). */
const Embers: React.FC<{ t: number; heat: number }> = ({ t, heat }) => {
  const N = 90;
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => [0, 1, 2].map((k) => Math.abs((Math.sin(i * (12.9898 + k * 7.1)) * 43758.5453) % 1))), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(0.006, 6, 4), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(P.ember).multiplyScalar(2.2), toneMapped: false, transparent: true, depthWrite: false }), []);
  mat.opacity = 0.35 + 0.65 * heat;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    seeds.forEach(([a, b, c], i) => {
      const life = 2.4 + c * 1.6;
      const age = (t + a * life) % life; // looping, deterministic
      const k = age / life;
      const active = i < N * (0.3 + 0.7 * heat);
      o.position.set(KILN_POS[0] + (b - 0.5) * 0.3 + Math.sin(t * 2 + i) * 0.04 * k, 0.25 + k * 1.3, KILN_POS[2] + 0.62 + (c - 0.5) * 0.15 + k * 0.25);
      o.scale.setScalar(active ? (1 - k) * (0.6 + c) : 0.0001);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [seeds, t, heat]);
  return <instancedMesh ref={ref} args={[geo, mat, N]} />;
};

/** Water drops flung off the wheel while it spins at speed (closed-form, looping). */
const Spray: React.FC<{ t: number }> = ({ t }) => {
  const N = 40;
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(0.0035, 8, 6), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#7a4a32", roughness: 0.05, clearcoat: 1 }), []);
  const on = t < 4.2 ? 1 : 0;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const life = 0.45;
      const ph = (t + i * 0.137) % life;
      const a = i * 2.39996;
      const r = 0.24 + ph * 0.9;
      o.position.set(Math.sin(a) * r, WHEEL_Y + 0.01 + ph * 0.25 - 4.9 * ph * ph, Math.cos(a) * r);
      o.scale.setScalar(on && o.position.y > 0.38 ? 1 : 0.0001);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [t, on]);
  return <instancedMesh ref={ref} args={[geo, mat, N]} />;
};

export const Studio3D: React.FC<{ t: number }> = ({ t }) => {
  const k = throwK(t);
  const open = openK(t);
  const angle = wheelAngle(t);
  const heat = heatAt(t);
  const H = pieceHeight(k);
  const rib = ribState(t);
  const D = Math.PI / 180;
  // Rib position: on the outer wall at height h, pressing in.
  const rh = Math.min(0.97, rib.h);
  const ribR = outerRadius(k, rh) + 0.006 + (1 - rib.on) * 0.08;
  const slope = (outerRadius(k, Math.min(1, rh + 0.03)) - outerRadius(k, Math.max(0, rh - 0.03))) / (0.06 * H);
  const ribPos: V3 = [Math.sin(RIB_AZ * D) * ribR, WHEEL_Y + rh * H, Math.cos(RIB_AZ * D) * ribR];
  // Jug over the rim on the left, and the glaze stream falling onto the shoulder.
  const jug = jugAt(t);
  const top = WHEEL_Y + H;
  const rRim = outerRadius(k, 1);
  const jugR = rRim + 0.02 + (1 - jug) * 0.25;
  const jugPos: V3 = [Math.sin(JUG_AZ * D) * jugR, top + 0.07 + (1 - jug) * 0.35, Math.cos(JUG_AZ * D) * jugR];
  const pour = Math.max(0, (jug - 0.7) / 0.3);
  const streamLen = jugPos[1] - (top - 0.02);
  const wob = wobble(t);
  return (
    <group>
      <Room />
      <Wheel angle={angle} />
      <group position={[Math.sin(t * 25) * wob, WHEEL_Y, Math.cos(t * 25) * wob]} rotation={[0, angle, 0]}>
        <Vessel3D
          k={k}
          open={open}
          dry={dryAt(t)}
          glaze={glazeAt(t)}
          drip={dripAt(t)}
          paint={paintAt(t)}
          heat={heat}
          fired={firedAt(t)}
          letterU={LETTER_AZ / 360}
        />
      </group>
      <Rib position={ribPos} yaw={RIB_AZ * D} tilt={-Math.atan(slope) * 0.8} visible={rib.on > 0.02 && t < 4.6} />
      {jug > 0.01 && <GlazeJug position={jugPos} yaw={JUG_AZ * D + Math.PI / 2} tip={jug} />}
      {pour > 0.02 && (
        <mesh position={[jugPos[0] * 0.92, jugPos[1] - streamLen / 2, jugPos[2] * 0.92]}>
          <cylinderGeometry args={[0.0045 * pour, 0.0065 * pour, streamLen, 12]} />
          <meshPhysicalMaterial color="#9DBDB2" roughness={0.06} clearcoat={1} clearcoatRoughness={0.04} />
        </mesh>
      )}
      <Spray t={t} />
      <Kiln position={KILN_POS} heat={heat} t={t} />
      <Embers t={t} heat={heat} />
      <Rack position={RACK_POS} rotation={-0.25} />
      <StampPlaque position={[RACK_POS[0] - 0.3, 0.075, RACK_POS[2] + 0.2]} rotation={[-0.2, -0.25, 0]} />
      {/* Foreground: freshly fired pieces on the floor, front right */}
      <Terracotta shape="gentong" position={[0.62, 0, 0.12]} scale={1.3} seed={21} />
      <Terracotta shape="bowl" position={[0.5, 0, 0.38]} seed={23} />
      <Terracotta shape="pot" position={[-0.55, 0, 0.25]} seed={25} base={CLAY.firedDark} />
    </group>
  );
};
