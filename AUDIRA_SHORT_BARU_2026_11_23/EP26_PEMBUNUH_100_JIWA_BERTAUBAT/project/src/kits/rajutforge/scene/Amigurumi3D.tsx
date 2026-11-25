// Original amigurumi characters and the crochet hook.
//
// <OyenCat t grow>: a chubby ginger crocheted cat ("kucing oyen"): striped body, cream belly and
//   socks, a head that is crocheted live (spiral growth from the neck to the crown) with stuffing
//   visible while it is open, then ears, safety eyes, nose, embroidered mouth/whiskers and felt
//   cheeks pop on. After that it breathes, blinks, tilts its head and waves.
// <Turtle t>: a small crocheted turtle with a colour-change dome shell.
// <CrochetHook pose>: an anodised aluminium hook with a thumb rest, a soft grip and the working
//   loops of yarn on the shaft.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { POLISH, lifeMotion } from "../../../core/polish/Polish.tsx";
import { RAJUT_PALETTE as P, YARN } from "../lib/palette.ts";
import { fibreAlpha, plyTexture } from "../lib/stitch.ts";
import { BODY, HEAD, PARTS, catLife, headYaw, pop, type HookPose, type V3 } from "../core/motion.ts";
import { Crocheted, YarnTube } from "./Crochet.tsx";

// Geometry at real size, so displacement and fuzz offsets are in world units.
const G = {
  head: new THREE.SphereGeometry(HEAD.r, 216, 120),
  body: new THREE.SphereGeometry(0.32, 200, 110),
  belly: new THREE.SphereGeometry(0.2, 96, 48),
  muzzle: new THREE.SphereGeometry(0.1, 72, 36),
  arm: new THREE.SphereGeometry(0.075, 64, 32),
  foot: new THREE.SphereGeometry(0.085, 64, 32),
  ear: new THREE.ConeGeometry(0.1, 0.16, 64, 12),
  innerEar: new THREE.ConeGeometry(0.062, 0.1, 32, 1),
  cheek: new THREE.SphereGeometry(0.045, 32, 16),
  eye: new THREE.SphereGeometry(0.042, 32, 16),
  nose: new THREE.SphereGeometry(0.027, 24, 12),
  smile: new THREE.TorusGeometry(0.021, 0.0048, 8, 24, Math.PI),
  fluff: new THREE.SphereGeometry(0.235, 48, 32),
  shell: new THREE.SphereGeometry(0.17, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2),
  shellRim: new THREE.TorusGeometry(0.17, 0.022, 12, 72),
  tHead: new THREE.SphereGeometry(0.07, 64, 32),
  tLeg: new THREE.SphereGeometry(0.05, 48, 24),
  tEye: new THREE.SphereGeometry(0.016, 16, 8),
};

/** A point on the head surface for face-local (x, y) (y relative to the head centre), pushed out by `out`. */
const facePoint = (x: number, y: number, out = 0): V3 => {
  const sx = HEAD.r * HEAD.scale[0], sy = HEAD.r * HEAD.scale[1], sz = HEAD.r * HEAD.scale[2];
  const z = sz * Math.sqrt(Math.max(0, 1 - (x / sx) ** 2 - (y / sy) ** 2));
  const n = new THREE.Vector3(x / (sx * sx), y / (sy * sy), z / (sz * sz)).normalize();
  return [x + n.x * out, y + n.y * out, z + n.z * out];
};
/** Euler that turns +z to the surface normal at a face point (to seat eyes, cheeks, nose). */
const faceRot = (x: number, y: number): V3 => {
  const sx = HEAD.r * HEAD.scale[0], sy = HEAD.r * HEAD.scale[1], sz = HEAD.r * HEAD.scale[2];
  const z = sz * Math.sqrt(Math.max(0, 1 - (x / sx) ** 2 - (y / sy) ** 2));
  const n = new THREE.Vector3(x / (sx * sx), y / (sy * sy), z / (sz * sz)).normalize();
  const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n));
  return [e.x, e.y, e.z];
};

const eyeMat = new THREE.MeshPhysicalMaterial({ color: "#0c0908", ...POLISH.glossyEye });
const embroidery = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.85, sheen: 0.6, sheenRoughness: 0.5 });
const BROWN = embroidery(YARN.brown);

/** Stuffing (fiberfill) seen inside the open head. */
const Fluff: React.FC<{ position: V3 }> = ({ position }) => {
  const shells = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const a = fibreAlpha().clone();
        a.repeat.set(3, 2);
        a.needsUpdate = true;
        return new THREE.MeshStandardMaterial({ color: YARN.white, alphaMap: a, alphaTest: 0.45 + i * 0.12, roughness: 1, side: THREE.DoubleSide });
      }),
    [],
  );
  // lumpy clumps of fiberfill, not one smooth ball
  const clumps: [V3, number][] = [
    [[0, 0, 0], 0.5],
    [[0.09, 0.03, 0.05], 0.38],
    [[-0.08, 0.02, 0.06], 0.4],
    [[0.02, 0.05, -0.09], 0.42],
    [[-0.05, -0.02, -0.06], 0.36],
    [[0.07, -0.01, -0.05], 0.34],
  ];
  return (
    <group position={position}>
      {clumps.map(([p, s], c) => (
        <group key={c} position={p} scale={s * 0.72}>
          <mesh geometry={G.fluff}>
            <meshStandardMaterial color="#e2dbcf" roughness={1} bumpMap={shells[0].alphaMap} bumpScale={4} />
          </mesh>
          {shells.map((m, i) => (
            <mesh key={i} geometry={G.fluff} material={m} scale={1 + (i + 1) * 0.09} />
          ))}
        </group>
      ))}
    </group>
  );
};

const Popped: React.FC<{ t: number; at: number; position?: V3; rotation?: V3; children: React.ReactNode }> = ({ t, at, position, rotation, children }) => {
  const s = pop(t, at);
  if (s <= 0.001) return null;
  return (
    <group position={position} rotation={rotation} scale={s}>
      {children}
    </group>
  );
};

export const OyenCat: React.FC<{ t: number; grow: number }> = ({ t, grow }) => {
  const life = catLife(t);
  const closed = grow >= HEAD.rounds - 0.001;
  const blink = t > PARTS.eyeR + 0.6 ? lifeMotion(t * 60, 3).blink : 1;
  const stripe = { color: "#dca08a", every: 4 };
  const yaw = headYaw(t);
  const ear = (side: 1 | -1, at: number) => (
    <Popped t={t} at={at} position={[side * 0.165, 0.215, -0.01]} rotation={[-0.12, 0, -side * 0.36]}>
      <Crocheted geometry={G.ear} color={YARN.oyen} sts={20} rounds={8} relief={0.006} size={0.09} />
      <mesh geometry={G.innerEar} position={[0, -0.012, 0.052]} rotation={[-0.32, 0, 0]} scale={[1, 1, 0.32]}>
        <meshPhysicalMaterial color={YARN.rose} {...POLISH.fabric} />
      </mesh>
    </Popped>
  );
  const whiskers = [-1, 1].flatMap((side) =>
    [-0.018, 0.004, 0.026].map((dy, i) => {
      const a = facePoint(side * 0.13, -0.06 + dy, 0.004);
      const b = facePoint(side * 0.215, -0.06 + dy * 1.6 - 0.008 + i * 0.004, 0.004);
      const m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 + 0.004];
      return { key: `${side}${i}`, pts: [a, m, b] as V3[] };
    }),
  );
  const marks = [-0.05, 0, 0.05].map((x, i) => {
    const y0 = i === 1 ? 0.2 : 0.185;
    return [facePoint(x, y0, 0.004), facePoint(x * 1.05, y0 - 0.06, 0.004)];
  });
  return (
    <group>
      {/* Body: colour-change stripes every 4 rounds, cream belly and socks */}
      <group position={BODY.center} scale={[(BODY.radii[0] / 0.32) * life.breathe, BODY.radii[1] / 0.32, BODY.radii[2] / 0.32]}>
        <Crocheted geometry={G.body} color={YARN.oyen} sts={BODY.sts} rounds={BODY.rounds} stripe={stripe} relief={0.009} size={0.32} />
      </group>
      <Crocheted geometry={G.belly} color={YARN.cream} sts={24} rounds={12} relief={0.007} size={0.2} position={[0, 0.27, 0.215]} scale={[1, 0.95, 0.55]} rotation={[0.15, 0, 0]} />
      {[-1, 1].map((s) => (
        <Crocheted key={s} geometry={G.foot} color={YARN.cream} sts={16} rounds={8} relief={0.006} size={0.085} position={[s * 0.15, 0.055, 0.25]} scale={[1, 0.68, 1.35]} />
      ))}
      {/* Arms (the right one waves in the finale) */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.285, 0.44, 0.08]} rotation={[0.25, 0, s * (0.22 + (s > 0 ? life.wave : 0))]}>
          <Crocheted geometry={G.arm} color={YARN.oyen} sts={16} rounds={12} stripe={stripe} relief={0.006} size={0.075} position={[0, -0.11, 0]} scale={[1, 1.75, 1]} />
          <Crocheted geometry={G.arm} color={YARN.cream} sts={16} rounds={8} relief={0.005} size={0.06} position={[0, -0.225, 0.008]} scale={[0.82, 0.6, 0.82]} />
        </group>
      ))}
      {/* Tail */}
      <group position={[0.02, 0.12, -0.27]} rotation={[0, life.tail, 0]}>
        <Tail />
      </group>
      {/* Head: shell crocheted live; features in the head's own frame */}
      <group position={HEAD.center} rotation={[0, 0, life.tilt]}>
        <group scale={HEAD.scale}>
          <group rotation={[0, yaw, 0]}>
            <Crocheted geometry={G.head} color={YARN.oyen} sts={HEAD.sts} rounds={HEAD.rounds} grow={closed ? undefined : grow} relief={0.009} size={HEAD.r} />
          </group>
        </group>
        {!closed && <Fluff position={[0, Math.min(-0.06, Math.cos((1 - grow / HEAD.rounds) * Math.PI) * HEAD.r * HEAD.scale[1] - 0.16), 0]} />}
        {ear(-1, PARTS.earL)}
        {ear(1, PARTS.earR)}
        <Popped t={t} at={PARTS.muzzle} position={facePoint(0, -0.07, -0.045)}>
          <Crocheted geometry={G.muzzle} color={YARN.cream} sts={20} rounds={8} relief={0.005} size={0.1} scale={[1.3, 0.72, 0.62]} />
        </Popped>
        {[-1, 1].map((s) => (
          <Popped key={s} t={t} at={s < 0 ? PARTS.eyeL : PARTS.eyeR} position={facePoint(s * 0.112, 0.012, -0.012)} rotation={faceRot(s * 0.112, 0.012)}>
            <mesh geometry={G.eye} material={eyeMat} scale={[1, blink, 0.62]} />
          </Popped>
        ))}
        <Popped t={t} at={PARTS.nose} position={[0, -0.04, facePoint(0, -0.07, 0)[2] + 0.034]}>
          <mesh geometry={G.nose} scale={[1.25, 0.78, 0.6]}>
            <meshPhysicalMaterial color="#D86A7A" {...POLISH.fabric} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.smile} material={BROWN} position={[s * 0.021, -0.036, -0.004]} rotation={[0.25, 0, Math.PI]} />
          ))}
        </Popped>
        <Popped t={t} at={PARTS.cheeks}>
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.cheek} position={facePoint(s * 0.19, -0.065, -0.008)} rotation={faceRot(s * 0.19, -0.065)} scale={[1.15, 0.85, 0.3]}>
              <meshPhysicalMaterial color={YARN.rose} {...POLISH.fabric} />
            </mesh>
          ))}
          {whiskers.map((w) => (
            <YarnTube key={w.key} points={w.pts} radius={0.0045} color={YARN.brown} segments={12} />
          ))}
          {marks.map((m, i) => (
            <YarnTube key={i} points={m} radius={0.009} color={YARN.oyenDark} segments={10} />
          ))}
        </Popped>
      </group>
    </group>
  );
};

const Tail: React.FC = () => {
  const geo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 0.03, -0.12),
      new THREE.Vector3(0.2, 0.18, -0.17),
      new THREE.Vector3(0.18, 0.36, -0.12),
      new THREE.Vector3(0.1, 0.44, -0.06),
    ]);
    return new THREE.TubeGeometry(c, 96, 0.045, 24, false);
  }, []);
  return (
    <>
      <Crocheted geometry={geo} color={YARN.oyen} sts={20} rounds={8} relief={0.005} size={0.045} />
      <Crocheted geometry={G.arm} color={YARN.cream} sts={12} rounds={8} relief={0.004} size={0.045} position={[0.1, 0.44, -0.06]} scale={0.62} />
    </>
  );
};

export const Turtle: React.FC<{ t: number; position: V3; yaw: number }> = ({ t, position, yaw }) => {
  const bob = Math.sin(t * 2.1) * 0.012;
  const look = Math.sin(t * 0.8) * 0.25;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group position={[0, 0.045, 0]} scale={[1, 0.78, 1]}>
        <Crocheted geometry={G.shell} color={YARN.turtle} sts={32} rounds={24} stripe={{ color: "#c9e39a", every: 3 }} relief={0.007} size={0.17} />
      </group>
      <Crocheted geometry={G.shellRim} color={YARN.turtleLight} sts={40} rounds={8} relief={0.004} size={0.022} position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <group position={[0, 0.085 + bob, 0.2]} rotation={[0, look, 0]}>
        <Crocheted geometry={G.tHead} color={YARN.turtleLight} sts={20} rounds={12} relief={0.005} size={0.07} />
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={G.tEye} material={eyeMat} position={[s * 0.034, 0.018, 0.056]} scale={[1, 1, 0.6]} />
        ))}
      </group>
      {[
        [0.13, 0.12],
        [-0.13, 0.12],
        [0.13, -0.12],
        [-0.13, -0.12],
      ].map(([x, z], i) => (
        <Crocheted key={i} geometry={G.tLeg} color={YARN.turtleLight} sts={16} rounds={8} relief={0.004} size={0.05} position={[x, 0.03, z]} scale={[1, 0.6, 1.3]} />
      ))}
    </group>
  );
};

// --- Hook ---------------------------------------------------------------------------------------------
const metal = new THREE.MeshPhysicalMaterial({ color: P.hookMetal, metalness: 0.8, roughness: 0.26, clearcoat: 0.4, clearcoatRoughness: 0.2 });
const grip = new THREE.MeshPhysicalMaterial({ color: P.hookGrip, roughness: 0.62, sheen: 0.3, sheenRoughness: 0.6 });
const HG = {
  tip: new THREE.SphereGeometry(0.019, 24, 16),
  throat: new THREE.CylinderGeometry(0.015, 0.019, 0.035, 24),
  barb: new THREE.ConeGeometry(0.011, 0.034, 16),
  shaft: new THREE.CylinderGeometry(0.021, 0.021, 0.36, 24),
  neck: new THREE.CylinderGeometry(0.02, 0.026, 0.16, 24),
  thumb: new RoundedBoxGeometry(0.06, 0.15, 0.022, 3, 0.009),
  grip: new THREE.CapsuleGeometry(0.042, 0.72, 8, 24),
  loop: new THREE.TorusGeometry(0.03, 0.011, 10, 32),
};

export const CrochetHook: React.FC<{ pose: HookPose }> = ({ pose }) => {
  const q = useMemo(() => {
    const a = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...pose.dir));
    const tw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pose.twist + 0.6);
    return a.multiply(tw);
  }, [pose.dir[0], pose.dir[1], pose.dir[2], pose.twist]);
  const yarn = pose.yarn === "oyen" ? YARN.oyen : YARN.teal;
  const loopMat = useMemo(() => {
    const ply = plyTexture();
    const m = ply.map.clone();
    m.repeat.set(5, 1);
    m.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({ color: yarn, map: m, roughness: 0.9, sheen: 0.9, sheenRoughness: 0.5 });
  }, [yarn]);
  return (
    <group position={pose.tip} quaternion={q}>
      <mesh geometry={HG.tip} material={metal} position={[0, 0.016, 0]} scale={[1, 1.3, 1]} castShadow />
      <mesh geometry={HG.throat} material={metal} position={[0, 0.045, 0]} castShadow />
      <mesh geometry={HG.barb} material={metal} position={[-0.016, 0.028, 0]} rotation={[0, 0, 2.55]} castShadow />
      <mesh geometry={HG.shaft} material={metal} position={[0, 0.24, 0]} castShadow />
      <mesh geometry={HG.neck} material={metal} position={[0, 0.5, 0]} castShadow />
      <mesh geometry={HG.thumb} material={metal} position={[0, 0.5, 0]} castShadow />
      <mesh geometry={HG.grip} material={grip} position={[0, 0.98, 0]} castShadow />
      {[0.09, 0.135].map((y, i) => (
        <mesh key={i} geometry={HG.loop} material={loopMat} position={[0, y, 0]} rotation={[Math.PI / 2 + (i ? 0.25 : -0.2), 0, 0]} castShadow />
      ))}
    </group>
  );
};
