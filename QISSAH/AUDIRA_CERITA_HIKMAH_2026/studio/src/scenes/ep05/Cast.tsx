// The two animals, drawn as ink: paper-tone wash fills with dry-brush outlines (inverted hull).
// Both models face +x. Every pose value comes from Film.tsx as a pure function of time.
import React, { useMemo } from "react";
import * as THREE from "three";
import { makeFill, makeLine, PAL } from "./ink";

export const GEO = {
  sphere: new THREE.SphereGeometry(1, 28, 18),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
  cone: new THREE.ConeGeometry(1, 1, 14, 1),
};

type V3 = [number, number, number];

/** A body part: wash fill + brush outline. */
export const Ink: React.FC<{
  geo: THREE.BufferGeometry;
  fill: THREE.Material;
  line?: THREE.Material | null;
  position?: V3;
  rotation?: V3;
  scale?: V3;
}> = ({ geo, fill, line, position, rotation, scale }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh geometry={geo} material={fill} />
    {line ? <mesh geometry={geo} material={line} /> : null}
  </group>
);

/* =================== KURA-KURA (turtle) =================== */

export type TurtlePose = {
  pos: V3;
  yaw: number;
  pitch?: number; // nose down (+)
  roll?: number;
  headOut?: number; // 0 tucked .. 1 out
  headPitch?: number; // + looks down
  headYaw?: number;
  jaw?: number; // 0..1
  eyeClose?: number; // 0..1
  paddle?: number; // stroke phase (radians)
  paddleAmt?: number; // 0 tucked on land .. 1 swimming
  limp?: number; // 0..1 poison: limbs hang
};

export const Turtle: React.FC<{ pose: TurtlePose; rider?: React.ReactNode }> = ({ pose, rider }) => {
  const m = useMemo(
    () => ({
      shell: makeFill({ tone: PAL.inkSoft, dark: 0.55, rim: 0.5, plates: 4.2, grain: 0.22 }),
      skin: makeFill({ tone: PAL.moss, dark: 0.5, rim: 0.4, grain: 0.25 }),
      belly: makeFill({ tone: PAL.wash, dark: 0.3, rim: 0.3 }),
      dark: makeFill({ tone: PAL.ink, dark: 1, rim: 0.2, grain: 0.05 }),
      eye: makeFill({ tone: PAL.paper, dark: 0, rim: 0, grain: 0 }),
      line: makeLine(0.011),
      lineThin: makeLine(0.007),
    }),
    [],
  );
  const { pos, yaw, pitch = 0, roll = 0, headOut = 1, headPitch = 0, headYaw = 0, jaw = 0, eyeClose = 0, paddle = 0, paddleAmt = 0, limp = 0 } = pose;
  const flip = (side: 1 | -1, front: boolean) => {
    const ph = paddle + (front ? 0 : Math.PI) + (side > 0 ? 0 : Math.PI * 0.15);
    const sw = Math.sin(ph) * paddleAmt * (1 - limp);
    const hang = limp * 0.9;
    const x = front ? 0.27 : -0.3;
    const z = side * (front ? 0.36 : 0.3);
    return (
      <group key={`${side}${front}`} position={[x, 0.08, z]} rotation={[side * (0.15 + hang * 0.6), side * (front ? -0.5 : -2.4) * (1 - paddleAmt * 0.25) + side * sw * 0.55, -0.15 + sw * 0.3 - hang * 0.4]}>
        <Ink geo={GEO.sphere} fill={m.skin} line={m.lineThin} position={[0, 0, side * (front ? 0.17 : 0.1)]} scale={front ? [0.09, 0.035, 0.2] : [0.07, 0.03, 0.12]} />
      </group>
    );
  };
  const ho = headOut;
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <group rotation={[roll, 0, -pitch]}>
        {/* plastron + shell */}
        <Ink geo={GEO.sphere} fill={m.belly} line={m.line} position={[0, 0.08, 0]} scale={[0.5, 0.08, 0.4]} />
        <Ink geo={GEO.sphere} fill={m.shell} line={m.line} position={[0, 0.11, 0]} scale={[0.48, 0.28, 0.4]} />
        {/* marginal rim */}
        <Ink geo={GEO.sphere} fill={m.dark} position={[0, 0.1, 0]} scale={[0.505, 0.035, 0.42]} />
        {/* tail */}
        <Ink geo={GEO.cone} fill={m.skin} line={m.lineThin} position={[-0.5, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.04, 0.12, 0.04]} />
        {flip(1, true)}
        {flip(-1, true)}
        {flip(1, false)}
        {flip(-1, false)}
        {/* neck + head */}
        <group position={[0.36, 0.1, 0]} rotation={[0, headYaw, -headPitch - limp * 0.25]}>
          <Ink geo={GEO.sphere} fill={m.skin} line={m.lineThin} position={[0.08 + 0.1 * ho, 0.01 * ho, 0]} rotation={[0, 0, 0.2]} scale={[0.07 + 0.09 * ho, 0.065, 0.065]} />
          <group position={[0.1 + 0.2 * ho, 0.035 * ho, 0]}>
            <Ink geo={GEO.sphere} fill={m.skin} line={m.line} position={[0.03, 0.02, 0]} scale={[0.115, 0.075, 0.08]} />
            {/* lower jaw */}
            <group position={[0.0, -0.02, 0]} rotation={[0, 0, -jaw * 0.35]}>
              <Ink geo={GEO.sphere} fill={m.skin} line={m.lineThin} position={[0.05, -0.012, 0]} scale={[0.085, 0.032, 0.062]} />
            </group>
            {/* mouth line */}
            <Ink geo={GEO.sphere} fill={m.dark} position={[0.1, -0.012, 0]} scale={[0.05, 0.004 + jaw * 0.012, 0.05]} />
            {/* eyes: paper white, ink pupil, lid closes */}
            {[1, -1].map((s) => (
              <group key={s} position={[0.07, 0.05, s * 0.055]}>
                <Ink geo={GEO.sphere} fill={m.eye} line={m.lineThin} scale={[0.022, 0.022 * (1 - eyeClose * 0.9), 0.016]} />
                {eyeClose < 0.8 ? <Ink geo={GEO.sphere} fill={m.dark} position={[0.012, -0.002, s * 0.006]} scale={[0.011, 0.012 * (1 - eyeClose), 0.011]} /> : null}
                <Ink geo={GEO.sphere} fill={m.dark} position={[0.0, 0.02 - eyeClose * 0.018, 0]} rotation={[0, 0, -0.1]} scale={[0.028, 0.005, 0.02]} />
              </group>
            ))}
          </group>
        </group>
        {rider ? <group position={[0.06, 0.37, 0]}>{rider}</group> : null}
      </group>
    </group>
  );
};

/* =================== KALAJENGKING (scorpion) =================== */

export type ScorpionPose = {
  pos: V3;
  yaw: number;
  pitch?: number; // + nose down
  roll?: number;
  curl?: number; // per-segment tail curl (rest ~0.42)
  strike?: number; // 0..1 extra curl + reach
  red?: number; // 0..1 stinger catches cinnabar
  claw?: number; // 0..1 open
  clawRaise?: number; // -1..1
  walk?: number; // leg phase
  walkAmt?: number;
  laugh?: number; // 0..1 body bounce
  droop?: number; // 0..1 sadness: tail and claws sag
  scale?: number;
};

const TAIL_N = 6;

export const Scorpion: React.FC<{ pose: ScorpionPose }> = ({ pose }) => {
  const m = useMemo(
    () => ({
      body: makeFill({ tone: PAL.ink, dark: 0.95, rim: 0.1, grain: 0.12 }),
      sting: makeFill({ tone: PAL.ink, dark: 1, rim: 0.1, grain: 0.05 }),
      leg: makeFill({ tone: PAL.ink, dark: 1, rim: 0.0, grain: 0.05 }),
      eye: makeFill({ tone: PAL.paper, dark: 0, rim: 0, grain: 0 }),
      line: makeLine(0.005),
      thin: makeLine(0.0035),
    }),
    [],
  );
  const { pos, yaw, pitch = 0, roll = 0, curl = 0.42, strike = 0, red = 0, claw = 0.2, clawRaise = 0, walk = 0, walkAmt = 0, laugh = 0, droop = 0, scale = 1 } = pose;
  (m.sting.uniforms.uTintAmt as { value: number }).value = red;

  // tail chain: starts pointing back-up, each segment turns toward +x over the body
  const c = curl + strike * 0.2 - droop * 0.22;
  const base = Math.PI - 0.55 + strike * 0.15 + droop * 0.5;
  const segLen = (i: number) => 0.075 - i * 0.004 + strike * 0.012;
  const tail = (i: number): React.ReactNode => {
    if (i >= TAIL_N) {
      return (
        <group rotation={[0, 0, -0.3 - strike * 0.5]}>
          <Ink geo={GEO.sphere} fill={m.body} line={m.line} position={[0.035, 0, 0]} scale={[0.045, 0.03, 0.03]} />
          <Ink geo={GEO.cone} fill={m.sting} line={m.thin} position={[0.09, -0.012, 0]} rotation={[0, 0, -Math.PI / 2 - 0.5]} scale={[0.014, 0.07, 0.014]} />
        </group>
      );
    }
    const L = segLen(i);
    return (
      <group rotation={[0, 0, i === 0 ? 0 : -c]}>
        <Ink geo={GEO.sphere} fill={m.body} line={m.line} position={[L / 2, 0, 0]} scale={[L * 0.62, 0.028 - i * 0.0015, 0.03 - i * 0.0015]} />
        <group position={[L, 0, 0]}>{tail(i + 1)}</group>
      </group>
    );
  };

  const legs = [0, 1, 2, 3].flatMap((k) =>
    ([1, -1] as const).map((s) => {
      const ph = walk + k * 1.3 + (s > 0 ? 0 : Math.PI);
      const lift = Math.max(0, Math.sin(ph)) * walkAmt * 0.35;
      const swing = Math.cos(ph) * walkAmt * 0.3;
      const x = 0.07 - k * 0.055;
      return (
        <group key={`${k}${s}`} position={[x, 0.0, s * 0.045]} rotation={[0, s * (-0.25 + k * 0.28) + swing, 0]}>
          <group rotation={[s * (1.3 + lift), 0, 0]}>
            <Ink geo={GEO.cyl} fill={m.leg} position={[0, 0.055, 0]} scale={[0.009, 0.11, 0.009]} />
            <group position={[0, 0.11, 0]} rotation={[s * 1.25, 0, 0]}>
              <Ink geo={GEO.cyl} fill={m.leg} position={[0, 0.055, 0]} scale={[0.007, 0.11, 0.007]} />
            </group>
          </group>
        </group>
      );
    }),
  );

  const clawArm = (s: 1 | -1) => {
    const open = claw * 0.55;
    const raise = clawRaise * 0.35 - droop * 0.25;
    return (
      <group key={s} position={[0.12, 0.01, s * 0.04]} rotation={[0, s * -0.55, raise]}>
        <Ink geo={GEO.sphere} fill={m.body} line={m.line} position={[0.05, 0, 0]} scale={[0.055, 0.014, 0.014]} />
        <group position={[0.1, 0, 0]} rotation={[0, s * 1.15, 0]}>
          <Ink geo={GEO.sphere} fill={m.body} line={m.line} position={[0.045, 0, 0]} scale={[0.05, 0.013, 0.013]} />
          <group position={[0.09, 0, 0]} rotation={[0, s * -0.55, 0]}>
            <Ink geo={GEO.sphere} fill={m.body} line={m.line} position={[0.04, 0, 0]} scale={[0.05, 0.026, 0.032]} />
            <group position={[0.075, 0, 0]}>
              <group rotation={[0, s * -open, 0]}>
                <Ink geo={GEO.cone} fill={m.body} line={m.thin} position={[0.035, 0, s * 0.008]} rotation={[0, 0, -Math.PI / 2]} scale={[0.012, 0.07, 0.012]} />
              </group>
              <group rotation={[0, s * open * 0.4, 0]}>
                <Ink geo={GEO.cone} fill={m.body} line={m.thin} position={[0.03, 0, -s * 0.01]} rotation={[0, 0, -Math.PI / 2]} scale={[0.01, 0.06, 0.01]} />
              </group>
            </group>
          </group>
        </group>
      </group>
    );
  };

  const bounce = laugh * 0.012;
  return (
    <group position={pos} rotation={[0, yaw, 0]} scale={[scale, scale, scale]}>
      <group position={[0, 0.045 + bounce, 0]} rotation={[roll, 0, -pitch]}>
        {/* cephalothorax + abdomen plates */}
        <Ink geo={GEO.sphere} fill={m.body} line={m.line} position={[0.07, 0, 0]} scale={[0.075, 0.032, 0.058]} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Ink key={i} geo={GEO.sphere} fill={m.body} line={m.line} position={[0.0 - i * 0.04, 0.004, 0]} scale={[0.032, 0.03 - i * 0.001, 0.06 - i * 0.004]} />
        ))}
        {/* sly eyes: two paper glints */}
        {[1, -1].map((s) => (
          <Ink key={s} geo={GEO.sphere} fill={m.eye} position={[0.12, 0.025, s * 0.016]} scale={[0.009, 0.006, 0.007]} />
        ))}
        {legs}
        {clawArm(1)}
        {clawArm(-1)}
        <group position={[-0.17, 0.01, 0]} rotation={[0, 0, base]}>{tail(0)}</group>
      </group>
    </group>
  );
};
