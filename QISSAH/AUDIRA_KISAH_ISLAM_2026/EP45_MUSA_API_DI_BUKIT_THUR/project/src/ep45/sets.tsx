// EP45 eight paper sets, each a function of VO seconds that returns its camera shot, light and contents.
// Multi-scene director: pickSet(s) switches the set at the cuts in timing.ts.

import React from "react";
import type { Light, Shot } from "../kits/paperworld/render/Stage.tsx";
import { Cut, Print, PopUp, ShearPop, type V3 } from "../kits/paperworld/components/Paper.tsx";
import { Ground, GroundPrint, PaperHill } from "../kits/paperworld/components/MiniatureEnvironment.tsx";
import { PaperBuilding } from "../kits/paperworld/components/PaperBuilding.tsx";
import { S } from "../kits/paperworld/geometry/shapes.ts";
import { clamp, ease, mix, popEase, remap } from "../kits/paperworld/motion/easing.ts";
import { Solid } from "../core/qa/scene-qa.tsx";
import {
  Beam, FAMILY_A, FAMILY_B, Flame, Flecks, Glow, GlowTree, HARUN, MUSA, NIGHT_SKY, NightMobile, PaperGlb, Robed, Sandal, SkyCard, StaffSnake, TextBoard,
} from "./parts.tsx";
import { A, T } from "./timing.ts";

export type SetFrame = { id: string; shot: Shot; light: Light; center: V3; node: React.ReactNode };

const lerp3 = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const shot = (pos: V3, target: V3, fov: number, focusAt?: V3, aperture = 0.0007, maxBlur = 0.005, roll = 0): Shot => ({
  pos,
  target,
  fov,
  roll,
  focus: dist(pos, focusAt ?? target),
  aperture,
  maxBlur,
});
const pop = (s: number, a: number, b: number) => popEase(remap(s, a, b));

const NIGHT: Light = {
  dir: [0.25, 0.55, -1],
  key: "#ffb46a",
  keyI: 2.2,
  fill: "#5b6fa8",
  fillI: 0.55,
  sky: "#3a4a80",
  ground: "#2a2230",
  hemiI: 0.55,
  bg: "#141b30",
  exposure: 0.95,
  shadowSize: 50,
  shadowSoft: 4,
  fog: { color: "#161d36", near: 70, far: 240 },
};
const SAND = "#8a7262";
const ROCK = "#4d4458";

// FG depth plane: a blurred bush in a lower corner of every set.
const FgBush: React.FC<{ at: V3; size?: number }> = ({ at, size = 4 }) => (
  <PaperGlb model="prop/creosote-bush-5b17d5" size={size} tint="#4c5634" position={at} cast={false} />
);

// ── S1 hook: dark night, fire lights on the slope of Thur ─────────────────────

const THUR_FIRE: V3 = [6.3, 35, -74.4];
const s1 = (s: number): SetFrame => {
  const u = s - T.s1;
  const lit = ease.out(remap(s, A.apiNyala, A.apiNyala + 0.9));
  const k = ease.inOut(remap(u, 0, 8.2));
  const pos = lerp3([1.5, 3.4, 26], [0.8, 4.8, 13], k);
  const target = lerp3([0, 11, -40], [5.2, 39, -72], ease.inOut(remap(u, 2.5, 8.2)));
  const light: Light = { ...NIGHT, dir: lit < 0.5 ? [-0.5, 0.8, 0.3] : [0.15, 0.5, -1], key: lit < 0.5 ? "#b8c8f0" : "#ffb46a", keyI: lit < 0.5 ? 2.0 : 1.7, fillI: 0.9, hemiI: 1.0 };
  return {
    id: "S1",
    shot: shot(pos, target, 42, [0.5, 4, -6], 0.0006, 0.004),
    light,
    center: [0, 0, -20],
    node: (
      <>
        <SkyCard stops={NIGHT_SKY} />
        <NightMobile s={s} />
        <Ground color={SAND} />
        <ShearPop t={1} position={[0, 0, -75]}>
          <Cut shape={S.hill(64, 40, 0.4, 0)} color="#3b3b66" depth={0.6} />
        </ShearPop>
        <PaperHill w={80} h={16} color="#2a3157" position={[-24, 0, -52]} skew={6} t={pop(u, 0, 0.6)} />
        <PaperHill w={70} h={11} color="#46477a" position={[26, 0, -40]} skew={-5} t={pop(u, 0.1, 0.7)} />
        <PaperHill w={60} h={6} color="#5b5482" position={[-12, 0, -26]} t={pop(u, 0.2, 0.8)} />
        <Flame position={THUR_FIRE} s={s} lit={lit} scale={2.4} light={900} range={70} />
        <PaperGlb model="prop/canvas-ridge-tent-f0df0d" size={5} tint="#cdb894" position={[-7, 0, -14]} rotation={[0, 0.5, 0]} />
        <Robed position={[-3.2, 0, -11]} scale={0.78} c={FAMILY_A} />
        <Robed position={[-4.6, 0, -11.6]} scale={0.6} c={FAMILY_B} />
        {[[2.4, -12], [4.2, -13.5], [5.6, -11.8]].map(([x, z], i) => (
          <PaperGlb key={i} model="animal/sheep-base" size={1.9} tint="#d6c19a" position={[x, 0, z]} rotation={[0, 2.6 + i, 0]} />
        ))}
        <Solid id="musa" kind="body">
          <Robed position={[-1.1, 0, 3]} staff raise={ease.inOut(remap(s, A.apiNyala + 0.6, A.apiNyala + 1.6)) * 0.55} />
        </Solid>
        <FgBush at={[-4.8, 0, 12]} size={4.5} />
      </>
    ),
  };
};

// ── S2 journey home from Madyan, the cold night, no fire ──────────────────────

const s2 = (s: number): SetFrame => {
  const u = s - T.s2;
  const w = ease.inOut(remap(u, 0, 7.7));
  const g: V3 = [mix(2, -1, w), 0, mix(0, -16, w)];
  const walk = remap(u, 0, 7.7) * 7.5;
  const k = ease.inOut(remap(u, 7.7, 13.5));
  const follow = add(g, [8, 5, 15]);
  const pos = lerp3(follow, [3, 4.2, 2], k);
  const target = lerp3(add(g, [-1, 3.2, -8]), [-4, 2.6, -24], k);
  const look = ease.inOut(remap(s, A.tanpaApi - 0.4, A.tanpaApi + 0.6));
  return {
    id: "S2",
    shot: shot(pos, target, 40, add(g, [0, 3, -3]), 0.0006, 0.004),
    light: { ...NIGHT, dir: [-0.4, 0.7, -0.5], key: "#9fb3e6", keyI: 1.1, fillI: 0.6, hemiI: 0.7 },
    center: add(g, [0, 0, -6]),
    node: (
      <>
        <SkyCard stops={NIGHT_SKY} />
        <NightMobile s={s} />
        <Ground color={SAND} />
        <ShearPop t={1} position={[30, 0, -115]}>
          <Cut shape={S.hill(70, 36, 0.4, -4)} color="#2f3360" depth={0.6} />
        </ShearPop>
        <PaperHill w={70} h={9} color="#6a5864" position={[-20, 0, -60]} skew={8} />
        <PaperHill w={60} h={6} color="#7a6460" position={[22, 0, -46]} skew={-6} />
        <Flecks s={s} area={[50, 8, 30]} center={[0, 3, g[2] - 6]} />
        <group position={g}>
          <Solid id="musa" kind="body">
            <Robed position={[0, 0, -3]} staff walk={walk} yaw={look * 0.5} />
          </Solid>
          <Robed position={[-2.2, 0, 0.4]} scale={0.78} c={FAMILY_A} walk={walk + 0.3} />
          <Robed position={[-3.5, 0, 1.6]} scale={0.6} c={FAMILY_B} walk={walk + 0.6} />
          <group position={[2.7, 0, 1.0]}>
            <PaperGlb model="animal/camel-base" size={5.4} tint="#c49a63" rotation={[0, Math.PI, 0]} />
            <TextBoard lines={["AUDIRA"]} w={1.5} h={0.7} bg="#e9d7b0" fg="#5a2f1e" accent="#a8452c" position={[1.0, 3.3, 0.2]} rotation={[0, Math.PI / 2, 0]} />
          </group>
          {[[-1, 4], [1.2, 4.6], [3.6, 5.6], [-2.6, 6]].map(([x, z], i) => (
            <PaperGlb key={i} model="animal/sheep-base" size={1.8} tint="#d6c19a" position={[x, 0.08 * Math.abs(Math.sin(walk * 3 + i)), z]} rotation={[0, Math.PI + 0.2 * Math.sin(i), 0]} />
          ))}
          {[[0.2, 7.2], [2.4, 7.8]].map(([x, z], i) => (
            <PaperGlb key={i} model="animal/goat-base" size={1.7} tint="#7d5c45" position={[x, 0, z]} rotation={[0, Math.PI - 0.2, 0]} />
          ))}
        </group>
        <ShearPop t={pop(u, 7.8, 8.7)} position={[-5, 0, -24]} yaw={0.3}>
          <PaperGlb model="prop/canvas-ridge-tent-f0df0d" size={5.5} tint="#cdb894" />
        </ShearPop>
        <FgBush at={add(g, [6.5, 0, 9])} size={3.6} />
      </>
    ),
  };
};

// ── S3 "wait here, I see a fire" — the climb up Thur ──────────────────────────

const INC = 0.38;
const onSlope = (x: number, d: number): V3 => [x, Math.max(0, d) * Math.sin(INC), -6 - Math.max(0, d) * Math.cos(INC)];
const PATH: [number, number][] = [[0, 0], [3.5, 7], [-2.5, 15], [2.5, 25], [-1.5, 38], [1.5, 58]];
const pathAt = (t: number): [number, number] => {
  const f = clamp(t) * (PATH.length - 1);
  const i = Math.min(PATH.length - 2, Math.floor(f));
  const r = f - i;
  return [mix(PATH[i][0], PATH[i + 1][0], r), mix(PATH[i][1], PATH[i + 1][1], r)];
};
const s3 = (s: number): SetFrame => {
  const u = s - T.s3;
  const step = ease.inOut(remap(s, A.mendaki - 2.4, T.s4)) * 0.2;
  const [px, pd] = pathAt(step);
  const base: V3 = [0.4, 0, 1.5];
  const climbing = s > A.mendaki - 2.4;
  const musa: V3 = climbing ? onSlope(px, pd - 0.0) : base;
  const musaPos: V3 = climbing ? lerp3(base, musa, clamp(remap(s, A.mendaki - 2.4, A.mendaki - 1.4))) : base;
  const raise = ease.inOut(remap(s, A.tunggulah - 0.4, A.tunggulah + 0.4)) * (1 - ease.inOut(remap(s, A.sesuluh - 1.2, A.sesuluh - 0.4)));
  const lantern = ease.out(remap(s, A.sesuluh, A.sesuluh + 0.6));
  const k = ease.inOut(remap(u, 0, 14));
  const pos = add(musaPos, lerp3([1.8, 3.2, 14], [2.2, 5.6, 15], k));
  const target = add(musaPos, [0, 6.5, -20]);
  const fireAt = onSlope(1.5, 58);
  return {
    id: "S3",
    shot: shot(pos, target, 44, add(musaPos, [0, 4, 0]), 0.0007, 0.005),
    light: { ...NIGHT, dir: [0.05, 0.6, -1], keyI: 1.6, hemiI: 0.6 },
    center: add(musaPos, [0, 0, -8]),
    node: (
      <>
        <SkyCard stops={NIGHT_SKY} />
        <NightMobile s={s} y0={36} />
        <Ground color={SAND} />
        {/* the slope of Thur and its zig-zag path */}
        <group position={[0, 0, -6]} rotation={[-Math.PI / 2 + INC, 0, 0]}>
          <Cut shape={S.rect(70, 130)} color={ROCK} depth={0.3} position={[0, 0, -0.16]} />
          {PATH.slice(0, -1).map(([x, d], i) => {
            const [x2, d2] = PATH[i + 1];
            const len = Math.hypot(x2 - x, d2 - d);
            return <Print key={i} shape={S.rect(1.3, len, 0.3)} color="#9b8268" position={[x, d, 0.01]} rotation={[0, 0, -Math.atan2(x2 - x, d2 - d)]} />;
          })}
        </group>
        <ShearPop t={1} position={[-24, 0, -40]}>
          <Cut shape={S.hill(40, 30, 0.4, 6)} color="#2f3360" depth={0.4} />
        </ShearPop>
        <ShearPop t={1} position={[26, 0, -44]}>
          <Cut shape={S.hill(40, 26, 0.4, -6)} color="#383a6a" depth={0.4} />
        </ShearPop>
        {[[-5.5, 5, 3.6], [5.5, 12, 3.2], [-6, 20, 4.2], [6, 30, 3.8], [-4, 44, 4]].map(([x, d, sz], i) => (
          <PaperGlb key={i} model="prop/basalt-boulder-a1929c" size={sz} tint="#4a4650" position={onSlope(x, d)} rotation={[0, i * 1.3, 0]} />
        ))}
        {[[4.5, 3], [-3.5, 26]].map(([x, d], i) => (
          <PaperGlb key={i} model="prop/bare-thorn-bush-91a238" size={3} tint="#5e4d3c" position={onSlope(x, d)} />
        ))}
        <Flame position={add(fireAt, [0, 0, 0.6])} s={s} scale={2.2} light={800} range={70} />
        {/* the camp left below */}
        <PaperGlb model="prop/canvas-ridge-tent-f0df0d" size={5} tint="#cdb894" position={[-6.5, 0, 4]} rotation={[0, 0.4, 0]} />
        <Robed position={[-3, 0, 4.5]} scale={0.78} c={FAMILY_A} yaw={Math.PI * 0.15} />
        <Robed position={[-4.4, 0, 5.2]} scale={0.6} c={FAMILY_B} />
        <PaperGlb model="animal/camel-base" size={5} tint="#c49a63" position={[5.5, 0, 6]} rotation={[0, -0.6, 0]} />
        <Solid id="musa" kind="body">
          <Robed position={musaPos} staff raise={raise} walk={climbing ? remap(s, A.mendaki - 2.4, T.s4) * 9 : 0}>
            {lantern > 0 ? (
              <group position={[1.6, 2.1, 0.3]}>
                <PaperGlb model="attachment/hand-lantern-cdbe1a" size={0.9} emissive="#ffb050" emissiveIntensity={lantern * 1.4} />
                <Glow position={[0, 0.45, 0.2]} size={3.2} color="#ffaa55" opacity={0.6 * lantern} />
                <pointLight position={[0, 0.5, 0.6]} color="#ffa95a" intensity={40 * lantern} distance={18} decay={1.4} />
              </group>
            ) : null}
          </Robed>
        </Solid>
        <FgBush at={add(musaPos, [5.2, 0, 8.5])} size={3.4} />
      </>
    ),
  };
};

// ── S4a the call from the tree (light only) ───────────────────────────────────

const s4a = (s: number): SetFrame => {
  const u = s - T.s4;
  const k = ease.inOut(remap(u, 0, 4.6));
  const glow = 0.45 + 0.55 * ease.inOut(remap(s, A.dipanggil - 0.6, A.dipanggil + 0.6));
  return {
    id: "S4a",
    shot: shot(lerp3([1.6, 3.6, 15], [1.2, 8.5, 11], k), lerp3([0, 3, -10], [0, 7.5, -20], k), 40, [0, 6, -20], 0.0008, 0.006),
    light: { ...NIGHT, dir: [0, 0.45, -1], key: "#ffe2a8", keyI: 2.6, hemiI: 0.5, fog: { color: "#1b1f38", near: 50, far: 200 } },
    center: [0, 0, -12],
    node: (
      <>
        <SkyCard stops={NIGHT_SKY} />
        <NightMobile s={s} y0={34} glow={0.9} />
        <Ground color={SAND} />
        <ShearPop t={1} position={[0, 0, -70]}>
          <Cut shape={S.hill(90, 30, 0.4, 10)} color="#2f3360" depth={0.4} />
        </ShearPop>
        <GlowTree position={[0, 0, -20]} h={11} glow={glow} s={s} />
        {[-3, 0, 3.4].map((x, i) => (
          <Beam key={i} position={[x, 22, -21 + i * 0.3]} w={2.2 + i * 0.6} h={36} tilt={0.1 - i * 0.08} opacity={0.07 * glow} />
        ))}
        {[[-7, -17, 3.5], [7.5, -18, 4], [-4, -12, 2.5]].map(([x, z, sz], i) => (
          <PaperGlb key={i} model="prop/basalt-boulder-a1929c" size={sz} tint="#4a4650" position={[x, 0, z]} rotation={[0, i * 2, 0]} />
        ))}
        <Solid id="musa" kind="body">
          <Robed position={[2.2, 0, -8]} staff raise={0.25} />
        </Solid>
        {/* reveal: we rise past this boulder (kept low-left so the opening frame is never all rock) */}
        <PaperGlb model="prop/basalt-boulder-a1929c" size={4.5} tint="#3f3b48" position={[-2.4, 0, 8]} rotation={[0, 0.6, 0]} />
        <FgBush at={[4.2, 0, 9]} size={3} />
      </>
    ),
  };
};

// ── S4b "take off your sandals" — top-down macro ──────────────────────────────

const s4b = (s: number): SetFrame => {
  const u = s - A.terompah;
  const k = ease.inOut(remap(u, 0, 4.3));
  const drop = 1 - ease.out(remap(u, 0.1, 0.9));
  const drop2 = 1 - ease.out(remap(u, 0.5, 1.3));
  return {
    id: "S4b",
    shot: shot(lerp3([0.2, 11, 1.4], [0.1, 6.6, 0.7], k), [0, 0, 0], 40, [0, 0.2, 0], 0.0009, 0.006, mix(0.12, -0.06, k)),
    light: { ...NIGHT, dir: [0.35, 0.8, -0.5], key: "#ffe6b0", keyI: 1.25, fillI: 0.45, hemiI: 0.55, fog: undefined },
    center: [0, 0, 0],
    node: (
      <>
        <Ground color="#8f7354" />
        {Array.from({ length: 9 }, (_, i) => (
          <GroundPrint key={i} shape={S.rectC(16, 0.08)} color="#b08f68" position={[0, 0, -4 + i * 1.05]} yaw={0.12 * Math.sin(i)} />
        ))}
        {[[-2.6, 1.8, 0.18], [2.4, -1.6, 0.14], [3.1, 2.4, 0.22], [-3.2, -2.2, 0.16], [1.6, 3.3, 0.12]].map(([x, z, r], i) => (
          <GroundPrint key={`p${i}`} shape={S.circle(r)} color="#6d5a4a" position={[x, 0, z]} lift={0.03} />
        ))}
        {/* robe hem resting at the top of frame */}
        <GroundPrint shape={S.poly("ep45-hem", [[-5, 0], [5, 0], [5, 1.6], [2, 2.2], [-1, 1.7], [-5, 2.1]])} color="#8a6a4a" position={[0, 0.05, -3.2]} lift={0.08} />
        <Sandal position={[-0.75, drop * 1.6 + 0.02, 0.1]} yaw={0.12} />
        <Sandal position={[0.75, drop2 * 1.6 + 0.02, 0.25]} yaw={-0.1} mirror />
        <Glow position={[0, 0.4, 0]} size={5} color="#ffd88a" opacity={0.18} />
        <pointLight position={[0, 6, 0.5]} color="#ffe0a0" intensity={60} distance={20} decay={1.3} />
      </>
    ),
  };
};

// ── S5 the staff becomes a snake ──────────────────────────────────────────────

const SNAKE_YAW = -1.05;
const SNAKE_SIZE = 1.35;
const s5 = (s: number): SetFrame => {
  const u = s - T.s5;
  const thrown = ease.inOut(remap(s, A.lempar, A.lempar + 0.8));
  // arm: rise before the throw, hold through it, lower after (no sharp reversal at the peak)
  const lift = 0.35 * ease.inOut(remap(s, A.lempar - 0.7, A.lempar)) * (1 - ease.inOut(remap(s, A.lempar + 0.9, A.lempar + 1.8)));
  const m = ease.inOut(remap(s, A.ular, A.ular + 1.0)) * (1 - ease.inOut(remap(s, A.kembali, A.kembali + 0.9)));
  const back = ease.inOut(remap(s, A.mundur, A.mundur + 1.0));
  // Musa stands left of the snake, turned toward it (hooded, faceless), and steps back when it moves
  const musa: V3 = lerp3([-3.4, 0, -9], [-4.2, 0, -10.5], back);
  const a = ease.inOut(remap(u, 2.6, 4.2));
  const b = ease.inOut(remap(s, A.mundur, A.mundur + 1.6));
  const c = ease.inOut(remap(s, A.kembali, T.s6));
  let pos = lerp3([1.8, 8, 14], [1.4, 6.2, 8.5], a);
  pos = lerp3(pos, [1.2, 6.6, 10], b);
  pos = lerp3(pos, [0.8, 5, 7.5], c);
  let target = lerp3([-1, 2.6, -6], [-0.6, 1.9, -4.5], a);
  target = lerp3(target, [-1, 1.6, -5.5], b);
  target = lerp3(target, [0, 0.6, -3], c);
  // staff flight, in the snake's local frame (yaw SNAKE_YAW, scale SNAKE_SIZE) so it lands exactly on
  // StaffSnake's straight-staff pose (centre [0.03, 0.12, 0], along x, 7.55 long)
  const land: V3 = [0.3, 0, -2.5];
  const held = add(musa, [-0.5, 3.4, -1.04]); // centre of the staff in Musa's hand (yawed robe)
  const dx = held[0] - land[0];
  const dz = held[2] - land[2];
  const ci = Math.cos(-SNAKE_YAW);
  const si = Math.sin(-SNAKE_YAW);
  const handL: V3 = [(dx * ci + dz * si) / SNAKE_SIZE, held[1] / SNAKE_SIZE, (-dx * si + dz * ci) / SNAKE_SIZE];
  const fly = lerp3(handL, [0.03, 0.12, 0], thrown);
  fly[1] += Math.sin(thrown * Math.PI) * 1.0;
  const k0 = 1 / SNAKE_SIZE;
  return {
    id: "S5",
    shot: shot(pos, target, 44, [-0.4, 1.0, -4], 0.0006, 0.004),
    light: { ...NIGHT, dir: [0.1, 0.45, -1], key: "#ffd9a0", keyI: 2.2, hemiI: 0.6, fog: { color: "#1b1f38", near: 40, far: 180 } },
    center: [0, 0, -1],
    node: (
      <>
        <SkyCard stops={NIGHT_SKY} />
        <Ground color={SAND} />
        <GroundPrint shape={S.ring(5.6, 6.1)} color="#a68a6c" position={[0, 0, -4]} />
        <GlowTree position={[2, 0, -42]} h={12} glow={0.35} s={s} />
        <ShearPop t={1} position={[0, 0, -75]}>
          <Cut shape={S.hill(90, 26, 0.4, -8)} color="#2f3360" depth={0.4} />
        </ShearPop>
        {[[-7.5, -11, 3], [6.5, -10, 3.6]].map(([x, z, sz], i) => (
          <PaperGlb key={i} model="prop/basalt-boulder-a1929c" size={sz} tint="#4a4650" position={[x, 0, z]} rotation={[0, i, 0]} />
        ))}
        <Solid id="musa" kind="body">
          <Robed position={musa} yaw={-Math.PI / 2 + 0.35} staff={thrown <= 0.001} raise={lift} />
        </Solid>
        <Solid id="tongkat" kind="prop">
          {thrown > 0.001 && thrown < 1 ? (
            <group position={land} rotation={[0, SNAKE_YAW, 0]} scale={SNAKE_SIZE}>
              <group position={fly} rotation={[0, 0, thrown * Math.PI * 0.5]} scale={[mix(k0, 1.2, thrown), mix(k0, 1.112, thrown), mix(k0 * 0.7, 1, thrown)]}>
                <Cut shape={S.rect(0.16, 6.8, 0.06)} color="#523729" depth={0.2} position={[0, -3.4, 0]} />
              </group>
            </group>
          ) : null}
          {thrown >= 1 ? <StaffSnake position={land} s={s} m={m} yaw={SNAKE_YAW} size={SNAKE_SIZE} /> : null}
        </Solid>
        <FgBush at={[3.4, 0, 6.5]} size={2.4} />
      </>
    ),
  };
};

// ── S6 the hand comes out shining ─────────────────────────────────────────────

const handShape = S.path("ep45-hand", (p) => {
  p.moveTo(-0.5, 0);
  p.lineTo(0.5, 0);
  p.lineTo(0.55, 1.0);
  p.lineTo(0.55, 1.6);
  p.quadraticCurveTo(0.55, 1.75, 0.435, 1.75);
  p.quadraticCurveTo(0.32, 1.75, 0.32, 1.6);
  p.lineTo(0.31, 1.12);
  p.lineTo(0.3, 1.95);
  p.quadraticCurveTo(0.3, 2.1, 0.19, 2.1);
  p.quadraticCurveTo(0.08, 2.1, 0.08, 1.95);
  p.lineTo(0.07, 1.14);
  p.lineTo(0.06, 2.05);
  p.quadraticCurveTo(0.06, 2.2, -0.05, 2.2);
  p.quadraticCurveTo(-0.16, 2.2, -0.16, 2.05);
  p.lineTo(-0.17, 1.12);
  p.lineTo(-0.18, 1.9);
  p.quadraticCurveTo(-0.18, 2.05, -0.3, 2.05);
  p.quadraticCurveTo(-0.42, 2.05, -0.42, 1.9);
  p.lineTo(-0.45, 0.95);
  p.lineTo(-0.85, 1.25);
  p.quadraticCurveTo(-1.0, 1.3, -0.95, 1.1);
  p.lineTo(-0.55, 0.45);
  p.closePath();
});
const s6 = (s: number): SetFrame => {
  const u = s - T.s6;
  const out = ease.inOut(remap(u, 0.3, 2.4));
  const shine = ease.out(remap(s, A.bercahaya, A.bercahaya + 0.7));
  const k = ease.inOut(remap(u, 0, 9.7));
  const handPos: V3 = [0.15, mix(1.4, 2.4, out), mix(-1.0, 0.35, out)];
  return {
    id: "S6",
    shot: shot(lerp3([0.9, 3.2, 12], [0.4, 3.0, 8.2], k), [0.1, 2.3, 0], 34, handPos, 0.001, 0.007),
    light: { ...NIGHT, dir: [-0.6, 0.5, -0.6], key: "#ffd9a0", keyI: 1.8, hemiI: 0.55 },
    center: [0, 2, 0],
    node: (
      <>
        <SkyCard stops={NIGHT_SKY} />
        <Ground color={SAND} />
        {/* bokeh of the tree far behind */}
        {[[-6, 8, -40], [5, 11, -46], [0, 13, -50], [9, 6, -38]].map((p, i) => (
          <Glow key={i} position={p as V3} size={10 + i * 2} color="#ffd88a" opacity={0.2} />
        ))}
        {/* chest of the robe and its sleeve opening */}
        <Cut shape={S.rectC(9, 7, 0.4)} color="#8a6a4a" depth={0.2} position={[0, 2.4, -1.6]} />
        {[-3, -1.4, 1.6, 3.2].map((x, i) => (
          <Print key={i} shape={S.rectC(0.12, 6.4)} color="#6c5038" position={[x, 2.4, -1.49]} rotation={[0, 0, 0.06 * (i - 1.5)]} />
        ))}
        <Cut shape={S.ellipse(1.45, 1.05)} color="#2a1d16" depth={0.12} position={[0.15, 1.6, -1.35]} />
        <Cut shape={S.ring(1.45, 1.8)} color="#a8865f" depth={0.3} position={[0.15, 1.6, -1.25]} scale={[1, 0.72, 1]} />
        <Solid id="tangan" kind="prop">
          <Cut shape={handShape} color={shine > 0 ? "#f3e2c2" : "#d9b58f"} edge="#b88a5c" depth={0.12} position={handPos} opts={shine > 0 ? { emissive: "#fff0cc", emissiveIntensity: 0.12 + shine * 0.4 } : {}} />
        </Solid>
        <Glow position={add(handPos, [0, 1.0, 0.3])} size={2 + shine * 4.5} color="#fff1c8" opacity={shine * 0.14} />
        <pointLight position={add(handPos, [0, 1, 1.2])} color="#fff0c8" intensity={shine * 9} distance={16} decay={1.3} />
        {shine > 0
          ? Array.from({ length: 6 }, (_, i) => (
              <Beam key={i} position={add(handPos, [0, 1.0, 0.2])} w={0.25} h={9 * shine} tilt={(i / 6) * Math.PI + s * 0.15} opacity={0.05 * shine} color="#fff4d8" />
            ))
          : null}
        {/* the staff, sign one, leans in the background once both signs are named */}
        <ShearPop t={pop(s, A.duaTanda - 0.2, A.duaTanda + 0.5)} position={[-3.4, 0, -3]}>
          <Cut shape={S.rect(0.18, 6.8, 0.06)} color="#523729" depth={0.16} rotation={[0, 0, 0.12]} />
        </ShearPop>
      </>
    ),
  };
};

// ── S7 sent to Pharaoh (palace only), the prayer, Harun ───────────────────────

const DAWN: [number, string][] = [
  [0, "#1f2452"],
  [0.45, "#5b4478"],
  [0.75, "#c46d6a"],
  [1, "#f3a85c"],
];
const s7 = (s: number): SetFrame => {
  const u = s - T.s7;
  const centre: V3 = [0.8, 3, -4];
  const orbit = ease.inOut(remap(u, 0, 9));
  const rise = ease.inOut(remap(u, 8.5, 15.2));
  const ang = mix(0.55, -0.35, orbit);
  const r = mix(15, 18, rise);
  // "pergilah kepada Firaun ... melampaui batas": over Musa's shoulder down to the palace, until the prayer
  const toPalace = 1 - ease.inOut(remap(s, A.berdoa - 0.6, A.berdoa + 1.6));
  const palacePos: V3 = lerp3([-4, 14, 16], [-3.4, 12.5, 13], ease.inOut(remap(u, 0, 6.2)));
  const PALACE: V3 = [0, -6, -46];
  const pos = lerp3([centre[0] + Math.sin(ang) * r, mix(4.2, 13, rise), centre[2] + Math.cos(ang) * r], palacePos, toPalace);
  const target = lerp3([mix(0, -1, rise), mix(3.8, -2, rise), mix(-16, -30, rise)], PALACE, toPalace);
  const pray = ease.inOut(remap(s, A.berdoa, A.berdoa + 0.9));
  const harun = popEase(remap(s, A.harun, A.harun + 0.7));
  const city = (a: number) => pop(s, A.istana + a, A.istana + a + 0.8);
  const sunY = mix(-22, -10, remap(u, 0, 15));
  return {
    id: "S7",
    shot: shot(pos, target, 42, lerp3(centre, PALACE, toPalace), 0.0006, 0.004),
    light: { ...NIGHT, dir: [0, 0.3, -1], key: "#ffb070", keyI: 2.0, fill: "#7b86c0", fillI: 0.7, sky: "#8a7ab0", hemiI: 0.75, bg: "#2a2c5c", exposure: 1.0, fog: { color: "#6a5a7a", near: 80, far: 320 } },
    center: [0, 0, -10],
    node: (
      <>
        <SkyCard stops={DAWN} position={[0, 20, -220]} w={600} h={240} />
        <group position={[0, sunY, -190]}>
          <Cut shape={S.circle(9)} color="#ffd08a" depth={0.3} cast={false} opts={{ emissive: "#ffc070", emissiveIntensity: 1.6 }} />
        </group>
        <Glow position={[0, sunY + 2, -185]} size={60} color="#ff9a5a" opacity={0.5} />
        {/* ledge plateau + cliff face, plain far below */}
        <Cut shape={S.rectC(60, 34)} color="#5a4c5e" depth={0.6} position={[0, -0.3, 11]} rotation={[-Math.PI / 2, 0, 0]} />
        <Cut shape={S.rect(60, 16)} color="#3f3550" depth={0.5} position={[0, -16, -6]} />
        <Ground color="#8a6a62" position={[0, -16, 0]} />
        <GroundPrint shape={S.path("ep45-nile", (p) => {
          p.moveTo(-3, -200);
          p.bezierCurveTo(10, -120, -14, -60, 4, 0);
          p.lineTo(9, 0);
          p.bezierCurveTo(-8, -60, 16, -120, 3, -200);
          p.closePath();
        })} color="#4f6a9a" position={[16, -16, -40]} yaw={0.4} />
        {/* the palace of Egypt as the subject (Pharaoh himself is never drawn) */}
        <group position={[-3, -16, -50]} scale={2.3}>
          <PaperBuilding b={{ w: 9, d: 4, h: 7, roof: "step", wall: "goldLight", roofColor: "goldDeep", trim: "ivoryLight", window: "brownDeep", cols: 3, rows: 2, facadeOnly: true, seed: 3 }} t={city(0)} />
          <PaperBuilding b={{ w: 5, d: 4, h: 11, roof: "step", wall: "gold", roofColor: "goldDeep", trim: "ivoryLight", window: "brownDeep", cols: 1, rows: 3, facadeOnly: true, seed: 7 }} t={city(0.2)} position={[7, 0, -2]} />
          <PaperBuilding b={{ w: 5, d: 4, h: 11, roof: "step", wall: "gold", roofColor: "goldDeep", trim: "ivoryLight", window: "brownDeep", cols: 1, rows: 3, facadeOnly: true, seed: 9 }} t={city(0.25)} position={[-7, 0, -2]} />
          <PaperBuilding b={{ w: 6, d: 4, h: 6, roof: "flat", wall: "goldLight", roofColor: "goldDeep", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 1, facadeOnly: true, seed: 11 }} t={city(0.35)} position={[-12, 0, 1]} />
          <PaperBuilding b={{ w: 6, d: 4, h: 6, roof: "flat", wall: "goldLight", roofColor: "goldDeep", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 1, facadeOnly: true, seed: 13 }} t={city(0.4)} position={[12, 0, 1]} />
        </group>
        <ShearPop t={city(0.5)} position={[22, -16, -78]}>
          <Cut shape={S.poly("ep45-pyr1", [[-14, 0], [14, 0], [0, 17]])} color="#d8a860" depth={0.3} />
        </ShearPop>
        <ShearPop t={city(0.65)} position={[-26, -16, -90]}>
          <Cut shape={S.poly("ep45-pyr2", [[-10, 0], [10, 0], [0, 12]])} color="#c8955a" depth={0.3} />
        </ShearPop>
        <Solid id="musa" kind="body">
          <Robed position={[0, 0, -4]} staff pray={pray} />
        </Solid>
        {harun > 0.001 ? (
          <PopUp t={harun} position={[2.6, 0, -3.4]}>
            <Robed position={[0, 0, 0]} scale={0.95} c={HARUN} />
          </PopUp>
        ) : null}
        <FgBush at={[-5.5, 0, 9]} size={3.4} />
      </>
    ),
  };
};

// ── S8 up for fire, down with the message — whole diorama ─────────────────────

const PEAK: V3 = [0, 30.4, -49.4];
const S8PATH: [number, number][] = [[-6, 0.5], [5, 7], [-5, 14], [4, 21], [-1, 28]];
const s8path = (t: number): V3 => {
  const f = clamp(t) * (S8PATH.length - 1);
  const i = Math.min(S8PATH.length - 2, Math.floor(f));
  const r = f - i;
  return [mix(S8PATH[i][0], S8PATH[i + 1][0], r), mix(S8PATH[i][1], S8PATH[i + 1][1], r), -48.9];
};
const s8 = (s: number): SetFrame => {
  const u = s - T.s8;
  const k = ease.inOut(remap(u, 0, 8.8));
  const up = ease.inOut(remap(s, A.naik, A.naik + 2.8));
  const down = ease.inOut(remap(s, A.turun, A.turun + 3.0));
  const walker = s8path(s < A.turun ? up : 1 - down);
  const carrying = s >= A.turun;
  return {
    id: "S8",
    shot: shot(lerp3([1.5, 9, 4], [3, 14.5, 40], k), lerp3([0, 15, -45], [0, 12.5, -30], k), 42, [0, 14, -40], 0.0005, 0.004),
    light: { ...NIGHT, dir: [0.2, 0.6, -1], keyI: 1.6, hemiI: 0.7, sky: "#5a5a90", fog: { color: "#1d2242", near: 90, far: 260 } },
    center: [0, 0, -36],
    node: (
      <>
        <SkyCard stops={[[0, "#0b1030"], [0.6, "#2a2f63"], [1, "#6a4f78"]]} />
        <NightMobile s={s} y0={44} />
        <Ground color={SAND} />
        <ShearPop t={1} position={[0, 0, -50]}>
          <Cut shape={S.hill(56, 30, 0.4, 0)} color="#3b3b66" depth={0.6} />
        </ShearPop>
        <group position={[0, 0, -49.6]}>
          {S8PATH.slice(0, -1).map(([x, y], i) => {
            const [x2, y2] = S8PATH[i + 1];
            const len = Math.hypot(x2 - x, y2 - y);
            return <Print key={i} shape={S.rect(0.8, len, 0.2)} color="#8a7aa0" position={[x, y, 0.32]} rotation={[0, 0, -Math.atan2(x2 - x, y2 - y)]} />;
          })}
        </group>
        <Flame position={PEAK} s={s} scale={1.3} light={500} range={50} />
        <ShearPop t={1} position={[-30, 0, -70]}>
          <Cut shape={S.hill(50, 18, 0.4, 6)} color="#2a3157" depth={0.4} />
        </ShearPop>
        <ShearPop t={1} position={[30, 0, -66]}>
          <Cut shape={S.hill(50, 15, 0.4, -6)} color="#2a3157" depth={0.4} />
        </ShearPop>
        <Robed position={walker} scale={0.42} c={MUSA} walk={u * 6}>
          {carrying ? <Glow position={[1.4, 2.6, 0.4]} size={4} color="#fff0c8" opacity={0.9} /> : null}
        </Robed>
        {/* the camp they left */}
        <PaperGlb model="prop/canvas-ridge-tent-f0df0d" size={4.5} tint="#cdb894" position={[-9, 0, -28]} rotation={[0, 0.5, 0]} />
        <PaperGlb model="prop/campfire-4390aa" size={1.8} position={[-5.5, 0, -27]} />
        <Flame position={[-5.5, 0.6, -27]} s={s} scale={0.5} light={carrying ? 60 : 0} range={14} lit={carrying ? 1 : 0} />
        {[[-12, -26], [-11, -30], [-7.5, -31]].map(([x, z], i) => (
          <PaperGlb key={i} model="animal/sheep-base" size={1.8} tint="#d6c19a" position={[x, 0, z]} rotation={[0, i * 1.7, 0]} />
        ))}
        {/* brand sign standing on a little dune */}
        <PaperHill w={16} h={3} color="#6d5a5e" position={[5.5, 0, -14]} />
        <group position={[5.2, 3.2, -13.6]} rotation={[0, -0.15, 0]}>
          <Cut shape={S.rect(0.3, 5)} color="#523729" depth={0.2} position={[-2.6, -1, 0]} />
          <Cut shape={S.rect(0.3, 5)} color="#523729" depth={0.2} position={[2.6, -1, 0]} />
          <TextBoard lines={["AUDIRA", "QISSAH"]} w={6.4} h={2.6} bg="#efe2c6" fg="#3b2a22" accent="#b8862e" position={[0, 3.6, 0.15]} glow={0.08} />
        </group>
        <FgBush at={[-6, 0, 14]} size={4} />
      </>
    ),
  };
};

// ── Director ──────────────────────────────────────────────────────────────────

export const pickSet = (s: number): SetFrame => {
  if (s < T.s2) return s1(s);
  if (s < T.s3) return s2(s);
  if (s < T.s4) return s3(s);
  if (s < A.terompah) return s4a(s);
  if (s < T.s5) return s4b(s);
  if (s < T.s6) return s5(s);
  if (s < T.s7) return s6(s);
  if (s < T.s8) return s7(s);
  return s8(s);
};
