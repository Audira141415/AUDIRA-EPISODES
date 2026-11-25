// The cast: two glazed clay pots that act (face inlays, tilt, brows, mouth from word times) and
// the water carrier as a matte bisque figurine with IK arms and legs. KINTSUGI: the crack is a
// hairline tube on the pot surface that turns to emissive liquid gold.
import React, { useMemo } from "react";
import * as THREE from "three";
import { lathe } from "../../core/geometry/lathe";
import { KINTSUGI_PALETTE } from "../../kits/kintsugi/lib/palette";
import { clamp, hash, lerp, type V3 } from "./layout";

/* ---------- shared palette ---------- */
export const PAL = {
  ...KINTSUGI_PALETTE,
  terracotta: "#B4552E",
  terracottaOld: "#C77A4B",
  ochre: "#C98B4E",
  ochreLight: "#E2BC86",
  indigo: "#2E3C78",
  saffron: "#E58A24",
  skin: "#94603C",
  cream: "#F1E6D0",
  bamboo: "#C9A466",
  water: "#4F86A8",
};

/* ---------- pot profile ---------- */
const OUTER: [number, number][] = [
  [0, 0], [0.16, 0], [0.26, 0.03], [0.34, 0.1], [0.39, 0.2], [0.405, 0.3], [0.39, 0.4], [0.34, 0.5], [0.25, 0.58],
  [0.16, 0.63], [0.135, 0.66], [0.14, 0.69], [0.175, 0.72], [0.18, 0.74], [0.15, 0.748],
];
const INNER: [number, number][] = [[0.12, 0.712], [0.115, 0.66], [0.2, 0.6], [0.31, 0.5], [0.36, 0.4], [0.37, 0.3], [0.35, 0.2], [0.3, 0.1], [0.2, 0.055], [0, 0.05]];
const POT_H = 0.748;
const ROPE = 0.42;
/** Body offset below the attach point (yoke end). */
export const POT_DROP = ROPE + POT_H;
export const potR = (h: number) => {
  for (let i = 1; i < OUTER.length; i++) {
    const [r0, y0] = OUTER[i - 1], [r1, y1] = OUTER[i];
    if (h >= y0 && h <= y1) return lerp(r0, r1, (h - y0) / Math.max(1e-6, y1 - y0));
  }
  return 0.15;
};
const innerR = (h: number) => {
  const pts = INNER.slice().reverse();
  for (let i = 1; i < pts.length; i++) {
    const [r0, y0] = pts[i - 1], [r1, y1] = pts[i];
    if (h >= y0 && h <= y1) return lerp(r0, r1, (h - y0) / Math.max(1e-6, y1 - y0));
  }
  return 0.1;
};
/** water surface height inside the pot for a fill level 0..1 */
export const waterH = (level: number) => lerp(0.06, 0.665, level);

const surf = (a: number, h: number, out = 0.004): V3 => {
  const r = potR(h) + out;
  return [r * Math.sin(a), h, r * Math.cos(a)];
};

/** Organic crack: a wandering polyline on the pot wall, plus short branches. */
const crackPaths = (seed: number, a0: number, h0: number, h1: number, n = 16) => {
  const main: V3[] = [];
  let a = a0;
  for (let i = 0; i <= n; i++) {
    const h = lerp(h0, h1, i / n);
    a += (hash(seed + i * 3.1) - 0.5) * 0.16;
    main.push(surf(a + Math.sin(i * 1.7 + seed) * 0.02, h));
  }
  const branches: V3[][] = [];
  for (const [k0, dir, len] of [[5, 1, 4], [10, -1, 3], [13, 1, 3]] as [number, number, number][]) {
    const k = Math.min(k0, n - 1);
    const b: V3[] = [main[k]];
    const p = main[k];
    let ba = Math.atan2(p[0], p[2]);
    let h = p[1];
    for (let j = 1; j <= len; j++) {
      ba += dir * (0.06 + hash(seed + k * 7 + j) * 0.05);
      h += 0.018 + hash(seed + j * 5 + k) * 0.012;
      b.push(surf(ba, h));
    }
    branches.push(b);
  }
  return { main, branches };
};
const tube = (pts: V3[], r: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.2), pts.length * 6, r, 5, false);

export const CRACK_A = 1.15; // radians around the pot from its face toward its left (+x)
const CRACK = crackPaths(4.2, CRACK_A, 0.11, 0.56);
/** Leak point (bottom end of the crack) in pot-body space. */
export const CRACK_LEAK: V3 = CRACK.main[0];

const SEAMS = [crackPaths(9.7, -0.7, 0.18, 0.5, 12), crackPaths(17.3, 2.6, 0.08, 0.36, 10)];

export type PotPose = {
  /** fill 0..1 */
  level: number;
  /** face yaw relative to the yoke frame */
  yaw: number;
  /** + droops (face down), - proud (chin up) */
  pitch: number;
  roll: number;
  mouth: number;
  /** -1 frown .. 1 smile */
  smile: number;
  /** 0 neutral, 1 sad inner-up brows, -1 proud raised */
  brow: number;
  /** eye openness 0..1 */
  eye: number;
  /** gaze down offset */
  gaze: number;
};

const ceramic = (color: string, rough = 0.55, cc = 0.55) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.32, side: THREE.DoubleSide });

export const goldMat = () =>
  new THREE.MeshStandardMaterial({ color: PAL.pureGoldLeaf, emissive: PAL.goldEmissive, emissiveIntensity: 0, roughness: 0.22, metalness: 0.9 });

export const Pot: React.FC<{ pose: PotPose; cracked?: boolean; crackGold?: number; seamGold?: number; tint: string; band: string }> = ({
  pose, cracked = false, crackGold = 0, seamGold = 0, tint, band,
}) => {
  const geo = useMemo(() => lathe([...OUTER, ...INNER], 72), []);
  const mats = useMemo(
    () => ({
      body: ceramic(tint),
      band: ceramic(band, 0.6, 0.3),
      cream: ceramic(PAL.cream, 0.6, 0.3),
      ink: new THREE.MeshPhysicalMaterial({ color: "#1d1512", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
      lip: new THREE.MeshStandardMaterial({ color: "#3a1d14", roughness: 0.8 }),
      crack: goldMat(),
      seam: goldMat(),
      water: new THREE.MeshPhysicalMaterial({ color: PAL.water, roughness: 0.08, metalness: 0.1, clearcoat: 1, transmission: 0, emissive: "#163648", emissiveIntensity: 0.4 }),
      rope: new THREE.MeshStandardMaterial({ color: "#8b6a43", roughness: 0.95 }),
      wet: new THREE.MeshPhysicalMaterial({ color: "#5a2a16", roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 }),
    }),
    [tint, band],
  );
  const crackGeos = useMemo(() => [tube(CRACK.main, 0.0075), ...CRACK.branches.map((b) => tube(b, 0.005))], []);
  const seamGeos = useMemo(() => SEAMS.flatMap((s) => [tube(s.main, 0.0055), ...s.branches.slice(0, 2).map((b) => tube(b, 0.004))]), []);
  const streakGeo = useMemo(() => {
    const a = Math.atan2(CRACK_LEAK[0], CRACK_LEAK[2]);
    const pts: V3[] = [];
    for (let i = 0; i <= 8; i++) pts.push(surf(a + Math.sin(i) * 0.02, lerp(CRACK_LEAK[1], 0.02, i / 8), 0.006));
    return tube(pts, 0.012);
  }, []);
  const bandGeo = useMemo(() => new THREE.TorusGeometry(1, 0.012, 6, 72), []);

  // crack material: dark hairline -> glowing liquid gold
  const cm = mats.crack;
  cm.color.set(crackGold > 0.02 ? PAL.pureGoldLeaf : "#2a1810").lerp(new THREE.Color("#2a1810"), 1 - clamp(crackGold * 1.4));
  cm.metalness = lerp(0.1, 0.9, crackGold);
  cm.roughness = lerp(0.8, 0.22, crackGold);
  cm.emissiveIntensity = crackGold * 3.2;
  mats.seam.emissiveIntensity = seamGold * 2.8;
  // deeper water reads darker through the neck: full = bright at the lip, half = dim far down
  const fullK = clamp((pose.level - 0.6) / 0.35);
  mats.water.color.set(PAL.water).multiplyScalar(lerp(0.12, 1.25, fullK));
  mats.water.emissive.set(fullK > 0.5 ? "#4fb8e0" : "#0a1c26");
  mats.water.emissiveIntensity = lerp(0.0, 0.9, fullK);
  // wet streak running down from the leak while the pot still holds more than half
  const wet = cracked && pose.level > 0.5 && pose.level < 0.985;

  const wh = waterH(pose.level);
  const eyeH = 0.43, mouthH = 0.31, browH = 0.5;
  const feat = (a: number, h: number, out = 0.0): V3 => surf(a, h, out);
  const eyeA = 0.2;
  const sm = Math.abs(pose.smile) < 0.15 ? (pose.smile < 0 ? -0.15 : 0.15) : pose.smile;
  return (
    <group>
      {/* ropes from the yoke end to the neck ring */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        const bot = new THREE.Vector3(0.15 * Math.sin(a), -ROPE, 0.15 * Math.cos(a));
        const len = bot.length();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), bot.clone().normalize());
        return (
          <mesh key={k} position={bot.clone().multiplyScalar(0.5).toArray()} quaternion={q} material={mats.rope} castShadow>
            <cylinderGeometry args={[0.008, 0.008, len, 5]} />
          </mesh>
        );
      })}
      <group position={[0, -POT_DROP, 0]}>
        {/* emotional tilt pivots around the belly */}
        <group position={[0, 0.32, 0]} rotation={[pose.pitch, pose.yaw, pose.roll]}>
          <group position={[0, -0.32, 0]}>
            <mesh geometry={geo} material={mats.body} castShadow receiveShadow />
            <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.145, 0.145, 1.4]} geometry={bandGeo} material={mats.rope} />
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[potR(0.2) + 0.002, potR(0.2) + 0.002, 1]} geometry={bandGeo} material={mats.band} />
            <mesh position={[0, 0.23, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[potR(0.23) + 0.002, potR(0.23) + 0.002, 0.6]} geometry={bandGeo} material={mats.cream} />
            <mesh position={[0, 0.555, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[potR(0.555) + 0.002, potR(0.555) + 0.002, 0.6]} geometry={bandGeo} material={mats.cream} />
            {/* water */}
            {pose.level > 0.01 ? (
              <mesh position={[0, wh, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.water}>
                <circleGeometry args={[innerR(wh) - 0.004, 40]} />
              </mesh>
            ) : null}
            {/* face: glazed inlay eyes, brows, mouth */}
            {[-1, 1].map((sd) => {
              const a = sd * eyeA;
              const p = feat(a, eyeH - pose.gaze * 0.0, -0.006);
              return (
                <group key={sd} position={p} rotation={[0, a, 0]}>
                  <mesh material={mats.ink} position={[0, -pose.gaze * 0.012, 0]} scale={[0.034, 0.042 * clamp(pose.eye, 0.08, 1), 0.02]}>
                    <sphereGeometry args={[1, 16, 12]} />
                  </mesh>
                  {/* highlight dot */}
                  <mesh position={[sd * -0.008 + 0.006, 0.012 - pose.gaze * 0.012, 0.018]} scale={[0.007, 0.007 * clamp(pose.eye * 1.2, 0, 1), 0.004]} material={mats.cream}>
                    <sphereGeometry args={[1, 8, 6]} />
                  </mesh>
                </group>
              );
            })}
            {[-1, 1].map((sd) => {
              const a = sd * (eyeA + 0.01);
              const p = feat(a, browH + Math.max(0, -pose.brow) * 0.025 + Math.max(0, pose.brow) * 0.01, 0.0);
              // sad: inner ends up; proud: arched/level, raised
              const tiltZ = sd * (pose.brow > 0 ? -0.42 * pose.brow : 0.18 * pose.brow);
              return (
                <group key={sd} position={p} rotation={[0, a, 0]}>
                  <mesh rotation={[0, 0, tiltZ]} material={mats.lip}>
                    <capsuleGeometry args={[0.008, 0.05, 3, 6]} />
                  </mesh>
                </group>
              );
            }).map((m, i) => React.cloneElement(m, { key: i }))}
            <group position={feat(0, mouthH, -0.002)}>
              <group scale={[1, sm, 1]}>
                <mesh position={[0, 0.05, 0]} rotation={[0, 0, -Math.PI / 2 - 0.95]} material={mats.lip}>
                  <torusGeometry args={[0.06, 0.008, 5, 16, 1.9]} />
                </mesh>
              </group>
              {pose.mouth > 0.02 ? (
                <mesh scale={[0.034, 0.03 * pose.mouth, 0.012]} material={mats.lip}>
                  <sphereGeometry args={[1, 14, 10]} />
                </mesh>
              ) : null}
            </group>
            {cracked ? crackGeos.map((g, i) => <mesh key={i} geometry={g} material={cm} />) : null}
            {wet ? <mesh geometry={streakGeo} material={mats.wet} /> : null}
            {/* brimming water: a bright meniscus ring at the lip */}
            {fullK > 0.6 ? (
              <mesh position={[0, wh + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[innerR(wh) - 0.03, innerR(wh) - 0.004, 40]} />
                <meshBasicMaterial color="#e8fbff" transparent opacity={0.75 * fullK} />
              </mesh>
            ) : null}
            {seamGold > 0.01 ? seamGeos.map((g, i) => <mesh key={i} geometry={g} material={mats.seam} />) : null}
          </group>
        </group>
      </group>
    </group>
  );
};

/* ---------- limbs ---------- */
const Y = new THREE.Vector3(0, 1, 0);
export const Limb: React.FC<{ a: V3; b: V3; r: number; mat: THREE.Material }> = ({ a, b, r, mat }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A);
  const len = Math.max(0.001, d.length());
  const q = new THREE.Quaternion().setFromUnitVectors(Y, d.normalize());
  return (
    <mesh position={A.clone().add(B).multiplyScalar(0.5).toArray()} quaternion={q} material={mat} castShadow>
      <capsuleGeometry args={[r, len, 4, 10]} />
    </mesh>
  );
};
/** two-bone IK: returns the elbow/knee given root, end, lengths and a pole direction. */
export const ik = (root: V3, end: V3, l1: number, l2: number, pole: V3): V3 => {
  const R = new THREE.Vector3(...root), Eend = new THREE.Vector3(...end);
  const d = Eend.clone().sub(R);
  const dist = clamp(d.length(), 0.01, l1 + l2 - 0.001);
  const dir = d.clone().normalize();
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const P = new THREE.Vector3(...pole);
  const side = P.sub(dir.clone().multiplyScalar(P.dot(dir))).normalize();
  return R.add(dir.multiplyScalar(a)).add(side.multiplyScalar(h)).toArray() as V3;
};

export type CarrierPose = {
  pos: V3;
  yaw: number;
  /** walk phase (radians) and stride amount 0..1 */
  phase: number;
  stride: number;
  crouch: number;
  headYaw: number;
  headPitch: number;
  mouth: number;
  smile: number;
  brow: number;
  /** right hand gesture 0..1 (leaves the yoke) */
  gesture: number;
  gestureOsc: number;
  blink: number;
};

/** Carrier-local yoke ends (cracked pot at +x = his left). */
export const YOKE_HALF = 1.12;
export const yokeY = (crouch: number, bob: number) => 1.47 - crouch * 0.42 + bob;

export const Carrier: React.FC<{ pose: CarrierPose; children?: React.ReactNode }> = ({ pose, children }) => {
  const m = useMemo(
    () => ({
      skin: new THREE.MeshPhysicalMaterial({ color: PAL.skin, roughness: 0.7, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
      kurta: new THREE.MeshPhysicalMaterial({ color: PAL.indigo, roughness: 0.78, sheen: 0.4, sheenColor: new THREE.Color("#6d7fc4") }),
      dhoti: new THREE.MeshPhysicalMaterial({ color: PAL.cream, roughness: 0.85, sheen: 0.3 }),
      turban: new THREE.MeshPhysicalMaterial({ color: PAL.saffron, roughness: 0.7, clearcoat: 0.2 }),
      ink: new THREE.MeshPhysicalMaterial({ color: "#1c1411", roughness: 0.3, clearcoat: 1 }),
      hair: new THREE.MeshStandardMaterial({ color: "#2a1d17", roughness: 0.8 }),
      bamboo: new THREE.MeshPhysicalMaterial({ color: PAL.bamboo, roughness: 0.55, clearcoat: 0.4 }),
      sash: new THREE.MeshPhysicalMaterial({ color: PAL.saffron, roughness: 0.75 }),
      lip: new THREE.MeshStandardMaterial({ color: "#4a2219", roughness: 0.8 }),
    }),
    [],
  );
  const kurtaGeo = useMemo(() => lathe([[0, 0.86], [0.19, 0.86], [0.205, 1.0], [0.22, 1.2], [0.225, 1.33], [0.19, 1.43], [0.07, 1.49], [0, 1.5]], 40), []);
  const dhotiGeo = useMemo(() => lathe([[0, 0.97], [0.2, 0.97], [0.23, 0.8], [0.25, 0.58], [0.22, 0.5], [0, 0.5]], 36), []);
  const turbanGeo = useMemo(() => lathe([[0, 1.69], [0.135, 1.68], [0.16, 1.73], [0.155, 1.8], [0.12, 1.84], [0.05, 1.86], [0, 1.86]], 32), []);

  const bob = pose.stride * Math.abs(Math.cos(pose.phase)) * 0.035;
  const c = pose.crouch;
  const hipY = 0.92 - c * 0.42 + bob;
  const lift = hipY - 0.92;
  // legs
  const legs = [1, -1].map((sd) => {
    const sw = Math.sin(pose.phase + (sd > 0 ? 0 : Math.PI)) * pose.stride;
    const footZ = sw * 0.26 + c * 0.12;
    const footY = Math.max(0, Math.cos(pose.phase + (sd > 0 ? 0 : Math.PI))) * 0.09 * pose.stride + 0.05;
    const hip: V3 = [sd * 0.1, hipY, 0];
    const foot: V3 = [sd * 0.12, footY, footZ];
    const knee = ik(hip, foot, 0.44, 0.43, [0, 0, 1]);
    return { hip, knee, foot, sd };
  });
  // arms: hands on the yoke; the right hand (−x) can gesture
  const yY = yokeY(c, bob);
  const arms = [1, -1].map((sd) => {
    const sh: V3 = [sd * 0.22, 1.4 + lift, 0];
    let hand: V3 = [sd * 0.5, yY + 0.02, -0.06];
    if (sd < 0 && pose.gesture > 0) {
      const g: V3 = [-0.26, 1.12 + lift + pose.gestureOsc * 0.05, 0.36];
      hand = [lerp(hand[0], g[0], pose.gesture), lerp(hand[1], g[1], pose.gesture), lerp(hand[2], g[2], pose.gesture)];
    }
    const el = ik(sh, hand, 0.29, 0.28, [sd * 1, -0.6, -0.2]);
    return { sh, el, hand, sd };
  });
  const sm = Math.abs(pose.smile) < 0.15 ? 0.15 * Math.sign(pose.smile || 1) : pose.smile;
  return (
    <group position={pose.pos} rotation={[0, pose.yaw, 0]}>
      {legs.map((l) => (
        <group key={l.sd}>
          <Limb a={l.hip} b={l.knee} r={0.075} mat={m.dhoti} />
          <Limb a={l.knee} b={l.foot} r={0.055} mat={m.skin} />
          <mesh position={[l.foot[0], l.foot[1] - 0.03, l.foot[2] + 0.06]} scale={[0.07, 0.035, 0.13]} material={m.skin} castShadow>
            <sphereGeometry args={[1, 12, 8]} />
          </mesh>
        </group>
      ))}
      <group position={[0, lift, 0]}>
        <mesh geometry={dhotiGeo} material={m.dhoti} castShadow />
        <mesh geometry={kurtaGeo} material={m.kurta} castShadow receiveShadow />
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.sash}>
          <torusGeometry args={[0.2, 0.03, 8, 32]} />
        </mesh>
        {/* neck + head */}
        <mesh position={[0, 1.52, 0]} material={m.skin}>
          <cylinderGeometry args={[0.055, 0.065, 0.1, 12]} />
        </mesh>
        <group position={[0, 1.57, 0]} rotation={[pose.headPitch, pose.headYaw, 0]}>
          <mesh position={[0, 0.07, 0]} scale={[1, 1.12, 1]} material={m.skin} castShadow>
            <sphereGeometry args={[0.125, 24, 18]} />
          </mesh>
          <mesh geometry={turbanGeo} position={[0, -1.57, 0]} material={m.turban} castShadow />
          {/* nose */}
          <mesh position={[0, 0.06, 0.122]} scale={[0.025, 0.04, 0.03]} material={m.skin}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
          {[-1, 1].map((sd) => (
            <group key={sd}>
              <mesh position={[sd * 0.045, 0.1, 0.108]} scale={[0.016, 0.02 * (1 - pose.blink * 0.9), 0.01]} material={m.ink}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
              <mesh position={[sd * 0.048, 0.135 + Math.max(0, pose.brow) * 0.008, 0.106]} rotation={[0, 0, sd * (pose.brow > 0 ? -0.35 * pose.brow : 0.12)]} material={m.hair}>
                <capsuleGeometry args={[0.007, 0.03, 3, 6]} />
              </mesh>
              {/* moustache */}
              <mesh position={[sd * 0.03, 0.025, 0.118]} rotation={[0, 0, sd * 1.25]} material={m.hair}>
                <capsuleGeometry args={[0.009, 0.035, 3, 6]} />
              </mesh>
            </group>
          ))}
          <group position={[0, -0.01, 0.112]}>
            <group scale={[1, sm, 1]}>
              <mesh position={[0, 0.03, 0]} rotation={[0, 0, -Math.PI / 2 - 0.8]} material={m.lip}>
                <torusGeometry args={[0.032, 0.005, 4, 12, 1.6]} />
              </mesh>
            </group>
            {pose.mouth > 0.02 ? (
              <mesh scale={[0.018, 0.016 * pose.mouth, 0.008]} material={m.lip}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
            ) : null}
          </group>
        </group>
      </group>
      {arms.map((a) => (
        <group key={a.sd}>
          <Limb a={a.sh} b={a.el} r={0.058} mat={m.kurta} />
          <Limb a={a.el} b={a.hand} r={0.045} mat={m.skin} />
          <mesh position={a.hand} scale={[0.05, 0.05, 0.05]} material={m.skin}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        </group>
      ))}
      {/* yoke (pikulan) across the shoulders, behind the neck */}
      <mesh position={[0, yY, -0.06]} rotation={[0, 0, Math.PI / 2]} material={m.bamboo} castShadow>
        <cylinderGeometry args={[0.035, 0.035, YOKE_HALF * 2 + 0.12, 10]} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * (YOKE_HALF + 0.06), yY, -0.06]} rotation={[0, 0, Math.PI / 2]} material={m.bamboo}>
          <torusGeometry args={[0.04, 0.012, 6, 12]} />
        </mesh>
      ))}
      {children}
    </group>
  );
};

/** Fixed pseudo-random helper re-exported for the world. */
export const rnd = (i: number, k = 0) => hash(i * 13.37 + k * 7.71);
