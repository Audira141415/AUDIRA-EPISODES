// Plush toys sewn from stuffed panels: a honey bear (Beruang Madu) and a lilac bunny (Kelinci Lila),
// both original designs. Every round part is a seamSphere (panels bulge, seams pinch in) wearing a
// plush pile texture with the same seams stitched in thread. Button eyes with a cross of thread,
// embroidered backstitch mouths, felt pads, a felt heart patch on the bear whose last seam the
// needle sews shut.

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { POLISH } from "../../../core/polish/Polish.tsx";
import { FELT, PLUSH_PALETTE as P, type PlushName } from "../lib/palette.ts";
import { feltFinish, feltMaps, plushFinish, plushMaps } from "../lib/fabric.ts";
import { faceAlong, frontPanel, frontSeam, heartGeometry, heartPoint, onSphere, seamSphere } from "../lib/seams.ts";
import { GAP, STITCH, needleAt, stitchGrow, type ToyState } from "../core/motion.ts";

type V3 = [number, number, number];

// --- Materials ----------------------------------------------------------------------------------
export const PlushMat: React.FC<{ fabric: PlushName; seed?: number; gores?: number; phase?: number; equator?: boolean; stitches?: boolean; repeat?: number }> = ({
  fabric, seed = 3, gores = 0, phase = 0, equator = false, stitches = true, repeat,
}) => {
  const { map, bump } = plushMaps({ fabric, seed, gores, phase, equator, stitches });
  const [m, b] = useMemo(() => {
    if (!repeat) return [map, bump];
    const a = map.clone(), c = bump.clone();
    a.repeat.set(repeat, repeat);
    c.repeat.set(repeat, repeat);
    a.needsUpdate = c.needsUpdate = true;
    return [a, c];
  }, [map, bump, repeat]);
  return <meshPhysicalMaterial map={m} bumpMap={b} bumpScale={1.6} {...plushFinish(fabric)} />;
};

export const FeltMat: React.FC<{ color: string; seed?: number }> = ({ color, seed = 5 }) => {
  const { map, bump } = feltMaps(color, seed);
  return <meshPhysicalMaterial map={map} bumpMap={bump} bumpScale={0.8} {...feltFinish} sheenColor={color} />;
};

/** A stuffed, sewn ball: the building block of every plush part. */
export const PlushBall: React.FC<{
  r: number; fabric: PlushName; gores?: number; phase?: number; equator?: boolean; seed?: number;
  position?: V3; rotation?: V3; scale?: V3; shadow?: boolean;
}> = ({ r, fabric, gores = 6, phase = 0, equator = false, seed = 3, position, rotation, scale, shadow = true }) => {
  const geo = seamSphere(r, gores, phase, equator);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} scale={scale} castShadow={shadow} receiveShadow>
      <PlushMat fabric={fabric} seed={seed} gores={gores} phase={phase} equator={equator} />
    </mesh>
  );
};

/** A felt piece (pad, nose, cheek): a flattened sphere. */
export const Felt: React.FC<{ r: number; color: string; position?: V3; rotation?: V3; scale?: V3; quaternion?: THREE.Quaternion }> = ({ r, color, position, rotation, scale, quaternion }) => (
  <mesh position={position} rotation={rotation} scale={scale} quaternion={quaternion} castShadow>
    <sphereGeometry args={[r, 28, 18]} />
    <FeltMat color={color} />
  </mesh>
);

// --- Face parts -----------------------------------------------------------------------------------
/** Sewn-on button eye: glossy domed disc, rim, two holes and a cross of thread. */
export const ButtonEye: React.FC<{ position: V3; normal: V3; r?: number; color?: string; thread?: string }> = ({ position, normal, r = 0.021, color = P.buttonDark, thread = P.threadCream }) => {
  const q = useMemo(() => faceAlong(normal), [normal[0], normal[1], normal[2]]);
  return (
    <group position={position} quaternion={q}>
      <mesh position={[0, 0, -r * 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]} castShadow>
        <sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} {...POLISH.glossyEye} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * r * 0.28, 0, r * 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r * 0.09, r * 0.09, r * 0.04, 10]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0, r * 0.53]}>
        <boxGeometry args={[r * 0.62, r * 0.08, r * 0.06]} />
        <meshPhysicalMaterial color={thread} roughness={0.8} />
      </mesh>
    </group>
  );
};

/** Backstitch embroidery along a path: short thread dashes with tiny gaps, slightly raised. */
export const Embroider: React.FC<{ points: V3[]; radius?: number; color?: string; dashes?: number }> = ({ points, radius = 0.0026, color = FELT.cocoa, dashes }) => {
  const geos = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const n = dashes ?? Math.max(3, Math.round(curve.getLength() / 0.009));
    const out: THREE.BufferGeometry[] = [];
    for (let i = 0; i < n; i++) {
      const a = curve.getPoint((i + 0.06) / n), b = curve.getPoint((i + 0.94) / n);
      out.push(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, radius, 6, false));
    }
    return out;
  }, [JSON.stringify(points), radius, dashes]);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshPhysicalMaterial color={color} roughness={0.75} sheen={0.6} sheenRoughness={0.5} sheenColor="#ffffff" />
        </mesh>
      ))}
    </group>
  );
};

/** Points on a sphere of radius r from [yaw, pitch] pairs (radians). */
const path = (r: number, pts: [number, number][]): V3[] => pts.map(([y, p]) => onSphere(r, y, p));

// --- Heart patch, its stitches and the needle ----------------------------------------------------
const HEART = { size: 0.105, bend: 0.15 };
const STITCH_INSET = 0.008;

const dashGeo = (s0: number, s1: number) => {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 6; k++) pts.push(new THREE.Vector3(...heartPoint(s0 + ((s1 - s0) * k) / 6, HEART.size, STITCH_INSET, HEART.bend, 0.0075)));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.0021, 6, false);
};

const threadMat = <meshPhysicalMaterial color={P.threadCream} roughness={0.7} sheen={0.7} sheenRoughness={0.4} sheenColor="#ffffff" />;

/** Felt heart with running stitches all round except the gap the needle closes (6 stitches). */
export const HeartPatch: React.FC<{ t: number }> = ({ t }) => {
  const geo = heartGeometry(HEART.size, HEART.bend);
  const done = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    const end = GAP.s0 + Math.PI * 2;
    for (let s = GAP.s0 + STITCH.n * GAP.ds; s + GAP.dash <= end + 1e-6; s += GAP.ds) out.push(dashGeo(s, s + GAP.dash));
    return out;
  }, []);
  const grows = Array.from({ length: STITCH.n }, (_, i) => Math.round(stitchGrow(i, t) * 12) / 12);
  const gap = useMemo(() => grows.map((g, i) => (g > 0 ? dashGeo(GAP.s0 + i * GAP.ds, GAP.s0 + i * GAP.ds + GAP.dash * g) : null)), [grows.join(",")]);
  useEffect(() => () => gap.forEach((g) => g?.dispose()), [gap]);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <FeltMat color={FELT.heart} seed={9} />
      </mesh>
      {done.map((g, i) => (
        <mesh key={i} geometry={g}>{threadMat}</mesh>
      ))}
      {gap.map((g, i) => (g ? <mesh key={`g${i}`} geometry={g}>{threadMat}</mesh> : null))}
    </group>
  );
};

const NEEDLE_DIR = new THREE.Vector3(0.5, 0.42, 0.76).normalize();
const NEEDLE_LEN = 0.095;

/** Steel needle with an eye and a cream thread trailing back to the last stitch (heart-local space). */
export const Needle: React.FC<{ t: number }> = ({ t }) => {
  const n = needleAt(t);
  const tipBase = heartPoint(n.s, HEART.size, STITCH_INSET, HEART.bend, 0);
  const away = 1 - n.present;
  const tip = new THREE.Vector3(tipBase[0] + away * 0.16, tipBase[1] + away * 0.22, tipBase[2] + n.h + away * 0.12);
  const eye = tip.clone().addScaledVector(NEEDLE_DIR, NEEDLE_LEN - 0.006);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), NEEDLE_DIR), []);
  // Thread: from the end of the newest stitch (or the gap start) up to the eye, sagging softly.
  const lastS = GAP.s0 + Math.max(0, Math.min(STITCH.n, n.k + (n.ph > 0.5 ? 1 : 0))) * GAP.ds;
  const anchor = new THREE.Vector3(...heartPoint(lastS - (n.k === 0 && n.ph <= 0.5 ? 0 : GAP.ds - GAP.dash), HEART.size, STITCH_INSET, HEART.bend, 0.006));
  const mid = anchor.clone().lerp(eye, 0.5).add(new THREE.Vector3(0.012, -0.025 * (1 - Math.min(1, eye.distanceTo(anchor) / 0.2)), 0.01));
  const key = [tip.x, tip.y, tip.z].map((v) => v.toFixed(4)).join(",");
  const thread = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([anchor, mid, eye]), 24, 0.0012, 5, false), [key]);
  useEffect(() => () => thread.dispose(), [thread]);
  if (n.present < 0.01) return null;
  return (
    <group>
      <group position={tip} quaternion={q}>
        <mesh position={[0, NEEDLE_LEN / 2 + 0.006, 0]} castShadow>
          <cylinderGeometry args={[0.0019, 0.0016, NEEDLE_LEN - 0.012, 12]} />
          <meshPhysicalMaterial color={P.steel} metalness={1} roughness={0.16} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.003, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.0016, 0.012, 12]} />
          <meshPhysicalMaterial color={P.steel} metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, NEEDLE_LEN - 0.006, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.0028, 0.0009, 8, 16]} />
          <meshPhysicalMaterial color={P.steel} metalness={1} roughness={0.16} />
        </mesh>
      </group>
      <mesh geometry={thread}>{threadMat}</mesh>
    </group>
  );
};

// --- Characters ---------------------------------------------------------------------------------
const LimbArm: React.FC<{ fabric: PlushName; r: number; len: number; pad: string; rot: [number, number]; position: V3; seed: number }> = ({ fabric, r, len, pad, rot, position, seed }) => (
  <group position={position} rotation={[rot[0], 0, rot[1]]}>
    <PlushBall r={r} fabric={fabric} gores={4} phase={0.125} seed={seed} position={[0, -len / 2, 0]} scale={[1, len / (2 * r), 1]} />
    <Felt r={r * 0.62} color={pad} position={[0, -len + r * 0.55, r * 0.55]} scale={[1, 1, 0.28]} rotation={[0.6, 0, 0]} />
  </group>
);

const Leg: React.FC<{ fabric: PlushName; r: number; len: number; pad: string; position: V3; splay: number; seed: number }> = ({ fabric, r, len, pad, position, splay, seed }) => (
  <group position={position} rotation={[0, splay, 0]}>
    <PlushBall r={r} fabric={fabric} gores={4} phase={0} seed={seed} position={[0, 0, len / 2]} scale={[1, 0.92, len / (2 * r)]} />
    <Felt r={r * 0.78} color={pad} position={[0, r * 0.05, len - r * 0.08]} scale={[1, 1.05, 0.22]} />
  </group>
);

/** Beruang Madu: honey plush bear with a cream muzzle, rose felt pads and a red felt heart. */
export const PlushBear: React.FC<{ s: ToyState; t: number; baseY: number }> = ({ s, t, baseY }) => {
  const HR = 0.13;
  const eyeL = onSphere(HR * 1.05, -0.36, 0.13), eyeR = onSphere(HR * 1.05, 0.36, 0.13);
  const muzzleR = 0.058;
  const mouth = path(muzzleR * 1.03, [[-0.55, -0.1], [-0.36, -0.3], [-0.12, -0.33], [0, -0.22], [0.12, -0.33], [0.36, -0.3], [0.55, -0.1]]);
  const philtrum = path(muzzleR * 1.03, [[0, 0.12], [0, -0.06], [0, -0.22]]);
  const headTilt = Math.sin(t * 1.3) * 0.05 + s.wave * 0.16 * Math.sin(t * 2.2);
  return (
    <group position={[s.pos[0], s.pos[1] + baseY, s.pos[2]]} rotation={[0, s.yaw, 0]}>
      <group rotation={[s.tilt[0], 0, s.tilt[1]]}>
        <group scale={[s.squash[0], s.squash[1], s.squash[0]]}>
          {/* Body: six stuffed panels, seams down the sides, heart patch on the front panel */}
          <PlushBall r={0.15} fabric="honey" gores={6} phase={frontPanel(6)} seed={11} position={[0, 0.165, 0]} scale={[1, 1.08, 0.92]} />
          <group position={[0, 0.16, 0.148]}>
            <HeartPatch t={t} />
            <Needle t={t} />
          </group>
          <Leg fabric="honey" r={0.052} len={0.15} pad={FELT.rose} position={[-0.085, 0.055, 0.03]} splay={-0.22} seed={12} />
          <Leg fabric="honey" r={0.052} len={0.15} pad={FELT.rose} position={[0.085, 0.055, 0.03]} splay={0.22} seed={13} />
          <LimbArm fabric="honey" r={0.044} len={0.15} pad={FELT.rose} rot={s.armL} position={[-0.128, 0.255, 0.01]} seed={14} />
          <LimbArm fabric="honey" r={0.044} len={0.15} pad={FELT.rose} rot={s.armR} position={[0.128, 0.255, 0.01]} seed={15} />
          {/* Head lags the body (jiggle spring) */}
          <group position={[0, 0.405 - s.jig * 0.012, 0]} rotation={[s.jig * 0.22 - 0.04, 0, headTilt]}>
            <group scale={[1.06, 0.96, 1]}>
              <PlushBall r={HR} fabric="honey" gores={6} phase={frontPanel(6)} seed={16} />
              <ButtonEye position={eyeL} normal={eyeL} r={0.021} thread="#6A4A35" />
              <ButtonEye position={eyeR} normal={eyeR} r={0.021} thread="#6A4A35" />
            </group>
            {/* Ears: plush backs, rose felt fronts; they flop with the jiggle */}
            {[-1, 1].map((sx) => (
              <group key={sx} position={[sx * 0.098, 0.095, -0.012]} rotation={[0, 0, sx * (-0.35 - s.jig * 0.35)]}>
                <PlushBall r={0.05} fabric="honey" gores={2} phase={0.25} equator={false} seed={17 + sx} scale={[1, 0.95, 0.46]} />
                <Felt r={0.034} color={FELT.rose} position={[0, -0.004, 0.017]} scale={[1, 0.92, 0.2]} />
              </group>
            ))}
            <group position={[0, -0.04, 0.105]} scale={[1.18, 0.84, 0.9]}>
              <PlushBall r={muzzleR} fabric="cream" gores={4} phase={frontSeam()} seed={19} />
              <Felt r={0.021} color={FELT.cocoa} position={[0, 0.02, 0.053]} scale={[1.4, 0.95, 0.75]} />
              <Embroider points={philtrum} />
              <Embroider points={mouth} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/** Kelinci Lila: lilac-white plush bunny with long ears (one folds over), pink felt and a pompom tail. */
export const PlushBunny: React.FC<{ s: ToyState; t: number; baseY: number }> = ({ s, t, baseY }) => {
  const HR = 0.118;
  const eyeL = onSphere(HR * 1.05, -0.4, 0.08), eyeR = onSphere(HR * 1.05, 0.4, 0.08);
  const mouth = path(HR * 1.025, [[-0.2, -0.28], [-0.1, -0.35], [0, -0.27], [0.1, -0.35], [0.2, -0.28]]);
  const flop = s.jig * 0.5 + s.wave * 0.25 * Math.sin(t * 9);
  const headTilt = -Math.sin(t * 1.1 + 1) * 0.06 - s.wave * 0.18 * Math.sin(t * 2.4);
  return (
    <group position={[s.pos[0], s.pos[1] + baseY, s.pos[2]]} rotation={[0, s.yaw, 0]}>
      <group rotation={[s.tilt[0], 0, s.tilt[1]]}>
        <group scale={[s.squash[0], s.squash[1], s.squash[0]]}>
          <PlushBall r={0.13} fabric="lilac" gores={6} phase={frontPanel(6)} seed={21} position={[0, 0.142, 0]} scale={[1, 1.1, 0.95]} />
          {/* Pompom tail */}
          <PlushBall r={0.045} fabric="snow" gores={0} seed={22} position={[0, 0.08, -0.12]} />
          {/* Big oval feet with pink felt soles */}
          {[-1, 1].map((sx) => (
            <group key={sx} position={[sx * 0.072, 0.032, 0.085]} rotation={[0, sx * 0.18, 0]}>
              <PlushBall r={0.045} fabric="lilac" gores={4} phase={0} seed={23 + sx} scale={[0.95, 0.72, 1.8]} />
              <Felt r={0.03} color={FELT.pink} position={[0, 0.002, 0.075]} scale={[0.95, 0.9, 0.24]} />
            </group>
          ))}
          <LimbArm fabric="lilac" r={0.038} len={0.13} pad={FELT.pink} rot={s.armL} position={[-0.112, 0.215, 0.012]} seed={26} />
          <LimbArm fabric="lilac" r={0.038} len={0.13} pad={FELT.pink} rot={s.armR} position={[0.112, 0.215, 0.012]} seed={27} />
          <group position={[0, 0.37 - s.jig * 0.012, 0]} rotation={[s.jig * 0.22 - 0.03, 0, headTilt]}>
            <group scale={[1.05, 0.95, 1]}>
              <PlushBall r={HR} fabric="lilac" gores={6} phase={frontPanel(6)} seed={28} />
              <ButtonEye position={eyeL} normal={eyeL} r={0.019} color="#2A1D2B" thread="#F2A2B2" />
              <ButtonEye position={eyeR} normal={eyeR} r={0.019} color="#2A1D2B" thread="#F2A2B2" />
              {/* Felt cheeks and nose, embroidered mouth */}
              {[-1, 1].map((sx) => {
                const c = onSphere(HR * 0.99, sx * 0.62, -0.18);
                return <Felt key={sx} r={0.022} color={FELT.pink} position={c} quaternion={faceAlong(c)} scale={[1, 0.8, 0.2]} />;
              })}
              <Felt r={0.014} color={FELT.berry} position={onSphere(HR * 0.995, 0, -0.14)} scale={[1.3, 0.9, 0.6]} />
              <Embroider points={mouth} color="#6A3F52" radius={0.0028} />
            </group>
            {/* Ears: base segment and a tip that hinges; the right ear folds over */}
            {[-1, 1].map((sx) => (
              <group key={sx} position={[sx * 0.045, 0.095, -0.01]} rotation={[-0.1 + flop * 0.3, 0, sx * (0.34 + flop * 0.25)]}>
                <PlushBall r={0.042} fabric="lilac" gores={2} phase={0.25} seed={29 + sx} position={[0, 0.07, 0]} scale={[0.78, 1.75, 0.42]} />
                <Felt r={0.028} color={FELT.pink} position={[0, 0.07, 0.014]} scale={[0.62, 1.7, 0.16]} />
                <group position={[0, 0.135, 0]} rotation={[sx > 0 ? 0.75 + flop * 0.5 : 0.12 + flop * 0.4, 0, 0]}>
                  <PlushBall r={0.04} fabric="lilac" gores={2} phase={0.25} seed={31 + sx} position={[0, 0.05, 0]} scale={[0.78, 1.45, 0.42]} />
                  <Felt r={0.026} color={FELT.pink} position={[0, 0.048, 0.013]} scale={[0.6, 1.35, 0.16]} />
                </group>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};
