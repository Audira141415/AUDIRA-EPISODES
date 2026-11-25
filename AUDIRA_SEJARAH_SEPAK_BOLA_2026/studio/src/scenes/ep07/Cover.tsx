// EP07 — Piala Dunia pertama, Uruguay 1930. PAPERWORLD topic cover (frame 0 of the film).
// A cut-paper diorama of Montevideo: the folded-card Estadio Centenario with its tower is the hero,
// two different paper footballs sit on the centre spot (the final used two balls: Argentina's in the
// first half, Uruguay's in the second), and a paper steamship arrives on a paper sea behind the city
// (the European teams came by ship). Facts on screen: HIGH rows of research/RESEARCH_REPORT.md only.

import React, { useLayoutEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { BoxGeometry, Path, PCFShadowMap, SphereGeometry, TorusGeometry } from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, type Light, type Shot } from "../../kits/paperworld/render/Stage.tsx";
import { Cut, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { Ground, GroundPrint, PaperBush, PaperCloud, PaperHill, PaperLamp, PaperTree } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { PaperCharacter, restPose } from "../../kits/paperworld/components/PaperCharacter.tsx";
import { PaperBuilding } from "../../kits/paperworld/components/PaperBuilding.tsx";
import { S, type ShapeSpec } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { hash01 } from "../../kits/paperworld/motion/easing.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { SceneText } from "../../core/polish/Drei.tsx";

// ---------- palette (kit palette + Río de la Plata colours, no crests) ----------
export const C = {
  celeste: "#86c6ea",
  celesteDeep: "#4f97c8",
  celesteInk: "#2c6797",
  white: "#f7f1e4",
  pitch: "#5aa863",
  pitchDeep: "#468f51",
  line: "#fbf6ea",
  sea: "#5b86b8",
  seaDeep: "#3f6799",
  seaLight: "#a3c0de",
  sand: "#e8d6b4",
  ink: "#33251d",
  green: "#1f9a52",
  ballArg: "#a9703f",
  ballUru: "#d8a868",
  coral: "coral",
  gold: "gold",
} as const;

export const AFTERNOON: Light = {
  dir: [-0.5, 0.78, 0.45],
  key: "#fff0d8",
  keyI: 2.6,
  fill: "#e6edf7",
  fillI: 0.55,
  sky: "#fbf3e4",
  ground: "#c9ad8a",
  hemiI: 1.15,
  bg: "#efe4cf",
  exposure: 1.0,
  shadowSize: 70,
  shadowSoft: 4,
};

// ---------- small shape helpers ----------
const ellipseRing = (ax: number, bz: number, w: number): ShapeSpec =>
  S.path(`ering-${ax}-${bz}-${w}`, (s) => {
    s.absellipse(0, 0, ax + w, bz + w, 0, Math.PI * 2, false, 0);
    const h = new Path();
    h.absellipse(0, 0, ax, bz, 0, Math.PI * 2, true, 0);
    s.holes.push(h);
  });

/** A cut lying flat on the ground (shape's +y maps to world -z). */
const Flat: React.FC<{ shape: ShapeSpec; color: string; y: number; depth?: number; position?: [number, number]; cast?: boolean }> = ({
  shape,
  color,
  y,
  depth = 0.05,
  position = [0, 0],
  cast = false,
}) => <Cut shape={shape} color={color} depth={depth} position={[position[0], y + depth / 2, position[1]]} rotation={[-Math.PI / 2, 0, 0]} cast={cast} />;

// ---------- the stadium ----------
const PITCH_W = 9.2; // x
const PITCH_L = 14; // z
const IN_AX = 6.6;
const IN_BZ = 9.4;
const TIERS = 5;
const TIER_W = 1.0;
const TIER_H = 0.62;
export const OUT_AX = IN_AX + TIERS * TIER_W;
export const OUT_BZ = IN_BZ + TIERS * TIER_W;
const WALL_H = TIERS * TIER_H + 1.1;

const Pitch: React.FC = () => {
  const stripes = 7;
  const sl = PITCH_L / stripes;
  const lw = 0.14;
  return (
    <group>
      <Flat shape={S.ellipse(IN_AX + 0.05, IN_BZ + 0.05)} color={C.pitchDeep} y={0} depth={0.06} />
      {Array.from({ length: stripes }, (_, i) => (
        <Flat key={i} shape={S.rectC(PITCH_W, sl)} color={i % 2 ? C.pitch : "#63b26c"} y={0.06} depth={0.03} position={[0, -PITCH_L / 2 + sl * (i + 0.5)]} />
      ))}
      {/* white line cut-outs */}
      <Flat shape={S.rectC(PITCH_W, lw)} color={C.line} y={0.09} depth={0.02} position={[0, -PITCH_L / 2]} />
      <Flat shape={S.rectC(PITCH_W, lw)} color={C.line} y={0.09} depth={0.02} position={[0, PITCH_L / 2]} />
      <Flat shape={S.rectC(lw, PITCH_L)} color={C.line} y={0.09} depth={0.02} position={[-PITCH_W / 2, 0]} />
      <Flat shape={S.rectC(lw, PITCH_L)} color={C.line} y={0.09} depth={0.02} position={[PITCH_W / 2, 0]} />
      <Flat shape={S.rectC(PITCH_W, lw)} color={C.line} y={0.09} depth={0.02} />
      <Flat shape={S.ring(1.75, 1.75 + lw)} color={C.line} y={0.09} depth={0.02} />
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Flat shape={S.rectC(4.4, lw)} color={C.line} y={0.09} depth={0.02} position={[0, sd * (PITCH_L / 2 - 2.2)]} />
          <Flat shape={S.rectC(lw, 2.2)} color={C.line} y={0.09} depth={0.02} position={[-2.2, sd * (PITCH_L / 2 - 1.1)]} />
          <Flat shape={S.rectC(lw, 2.2)} color={C.line} y={0.09} depth={0.02} position={[2.2, sd * (PITCH_L / 2 - 1.1)]} />
          {/* little card goal */}
          <group position={[0, 0.1, sd * (PITCH_L / 2 + 0.25)]} rotation={[0, sd > 0 ? Math.PI : 0, 0]}>
            <Cut shape={S.frame("rect", 2.6, 1.1, "rect", 2.3, 0.95, 0)} color={C.line} depth={0.12} />
          </group>
        </group>
      ))}
    </group>
  );
};

const Stands: React.FC = () => (
  <group>
    {Array.from({ length: TIERS }, (_, i) => {
      const h = TIER_H * (i + 1);
      return (
        <Cut
          key={i}
          shape={ellipseRing(IN_AX + i * TIER_W, IN_BZ + i * TIER_W, TIER_W + 0.02)}
          color={i % 2 ? C.white : C.celeste}
          depth={h}
          position={[0, h / 2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          segments={64}
        />
      );
    })}
    {/* low parapet rim round the pitch */}
    <Cut shape={ellipseRing(IN_AX - 0.12, IN_BZ - 0.12, 0.12)} color={C.celesteDeep} depth={0.5} position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} segments={64} />
  </group>
);

/** Outer facade: card panels with arched openings, set round the ellipse. */
const Facade: React.FC<{ build?: number }> = ({ build = 1 }) => {
  const N = 40;
  const A = OUT_AX + 0.12;
  const B = OUT_BZ + 0.12;
  const pts = Array.from({ length: N }, (_, i) => {
    const t = (i / N) * Math.PI * 2;
    return [A * Math.cos(t), B * Math.sin(t)] as const;
  });
  return (
    <group>
      {pts.map((p, i) => {
        const q = pts[(i + 1) % N];
        const mx = (p[0] + q[0]) / 2;
        const mz = (p[1] + q[1]) / 2;
        const w = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.04;
        const t = ((i + 0.5) / N) * Math.PI * 2;
        const nx = Math.cos(t) / A;
        const nz = Math.sin(t) / B;
        const yaw = Math.atan2(nx, nz);
        const wr = Math.round(w * 20) / 20;
        if (build < 1 && hash01(i * 7 + 3) > build) return null;
        return (
          <group key={i} position={[mx, 0, mz]} rotation={[0, yaw, 0]}>
            <Cut shape={S.rect(wr, WALL_H, 0, [{ kind: "arch", x: 0, y: 0.35, w: wr * 0.42, h: 1.5 }])} color={i % 2 ? C.white : "#efe6d2"} depth={0.16} />
            <Cut shape={S.rect(wr, 0.32)} color={C.celesteDeep} depth={0.2} position={[0, WALL_H - 0.32, 0.02]} />
          </group>
        );
      })}
    </group>
  );
};

/** Torre de los Homenajes: a slender stepped card tower with horizontal fins (cross-slot build). */
const TOWER_H = 19;
const towerShape = S.path("ep07-tower", (s) => {
  const pts: [number, number][] = [
    [-1.9, 0], [1.9, 0], [1.9, 5], [1.45, 5], [1.45, 13], [1.1, 13], [1.1, 16.6], [0.75, 16.6], [0.75, TOWER_H], [-0.75, TOWER_H],
    [-0.75, 16.6], [-1.1, 16.6], [-1.1, 13], [-1.45, 13], [-1.45, 5], [-1.9, 5],
  ];
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  for (let i = 0; i < 6; i++) {
    const h = new Path();
    const y0 = 6 + i * 1.15;
    h.moveTo(-0.32, y0);
    h.lineTo(-0.32, y0 + 0.7);
    h.lineTo(0.32, y0 + 0.7);
    h.lineTo(0.32, y0);
    h.closePath();
    s.holes.push(h);
  }
});

const Tower: React.FC<{ position: V3; rise?: number }> = ({ position, rise = 1 }) => (
  <group position={position} scale={[1, rise, 1]}>
    {[0, Math.PI / 2].map((a) => (
      <group key={a} rotation={[0, a, 0]}>
        <Cut shape={towerShape} color={C.white} depth={0.5} />
      </group>
    ))}
    {/* fins: flat plates at the set-backs and along the shaft */}
    {[5, 8.2, 11, 13, 14.8, 16.6].map((y, i) => {
      const w = y <= 5 ? 4.4 : y < 13 ? 3.4 : y < 16.6 ? 2.7 : 2.0;
      return <Cut key={i} shape={S.rectC(w, w)} color={i % 2 ? C.celeste : "#ece2cd"} depth={0.16} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} />;
    })}
    {/* mast + celeste/white pennant */}
    <Cut shape={S.rect(0.12, 3.2)} color={C.ink} depth={0.12} position={[0, TOWER_H, 0]} />
    <group position={[0.06, TOWER_H + 2.1, 0]}>
      {[0, 1, 2, 3, 4].map((k) => (
        <Cut key={k} shape={S.rect(2.2, 0.22)} color={k % 2 ? C.celeste : C.white} depth={0.04} position={[1.1, k * 0.22, 0]} />
      ))}
    </group>
  </group>
);

// ---------- two paper footballs ----------
/**
 * 1930 leather ball in paper: a smooth paper sphere, panel seams as thin ink-paper strips (three crossing
 * pairs of arcs, like the old 12-panel balls), and a laced slot on top (pale slit + crossed ink stitches).
 */
export const PaperBall: React.FC<{ r: number; color: string; seam: string; position: V3; spin: number }> = ({ r, color, seam, position, spin }) => {
  const geo = useMemo(() => new SphereGeometry(r, 48, 32), [r]);
  const mat = useMemo(() => paperFace(color, { relief: 0.55, roughness: 0.8 }), [color]);
  const ink = useMemo(() => paperFace(seam, { relief: 0.2 }), [seam]);
  const tube = r * 0.027;
  const d = r * 0.2; // half-gap between the two seams of a pair
  const rr = Math.sqrt(r * r - d * d) + tube * 0.4;
  const arc = Math.PI * 0.85;
  // one seam pair per axis; each pair is two parallel arcs at +/- d along the axis
  const axes: { rot: V3; start: number }[] = [
    { rot: [0, 0, 0], start: 0.25 },
    { rot: [0, Math.PI / 2, Math.PI / 2], start: 1.9 },
    { rot: [Math.PI / 2, 0, Math.PI / 2], start: 3.6 },
  ];
  const seamGeo = useMemo(() => new TorusGeometry(rr, tube, 5, 40, arc), [rr, tube, arc]);
  const stitchGeo = useMemo(() => new BoxGeometry(r * 0.2, r * 0.035, r * 0.035), [r]);
  return (
    <group position={[position[0], position[1] + r, position[2]]} rotation={[0.55, spin, 0.15]}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {axes.map((ax, i) => (
        <group key={i} rotation={ax.rot}>
          {[-d, d].map((z) => (
            <mesh key={z} geometry={seamGeo} material={ink} position={[0, 0, z]} rotation={[0, 0, ax.start]} />
          ))}
        </group>
      ))}
      {/* lace slot on top */}
      <group position={[0, r * 0.995, 0]}>
        <mesh material={paperFace("#f1dfbf", { relief: 0.3 })} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[r * 0.16, r * 0.62]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <group key={k} position={[0, r * 0.012, -r * 0.24 + k * r * 0.12]}>
            <mesh geometry={stitchGeo} material={ink} rotation={[0, 0.5, 0]} />
            <mesh geometry={stitchGeo} material={ink} rotation={[0, -0.5, 0]} />
          </group>
        ))}
      </group>
    </group>
  );
};

/** Paper tag on a pin: striped header (team colours) + team name. */
export const BallTag: React.FC<{ position: V3; name: string; stripes: string[]; yaw?: number }> = ({ position, name, stripes, yaw = 0 }) => {
  const w = 6.0;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <Cut shape={S.rect(0.12, 2.7)} color={C.ink} depth={0.1} position={[0, 0, -0.05]} />
      <group position={[0, 2.6, 0]}>
        <Cut shape={S.rectC(w, 1.75, 0.12)} color={C.white} depth={0.08} />
        {stripes.map((c, i) => (
          <Cut key={i} shape={S.rectC(w - 0.3, 0.12)} color={c} depth={0.09} position={[0, 0.6 - i * 0.12, 0.01]} />
        ))}
        <SceneText position={[0, -0.16, 0.07]} fontSize={1.0} color={C.ink} anchorX="center" anchorY="middle" letterSpacing={0.02}>
          {name}
        </SceneText>
      </group>
    </group>
  );
};

// ---------- the paper steamship ----------
const hull = S.poly("ep07-hull", [[-7.2, 0], [6.2, 0], [8.4, 2.6], [-7.6, 2.4]]);
export const Ship: React.FC<{ position: V3; s: number }> = ({ position, s }) => {
  const bob = Math.sin(s * 1.4) * 0.08;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, 0, Math.sin(s * 1.1) * 0.01]}>
      <Cut shape={S.poly("ep07-keel", [[-7.0, -0.6], [6.0, -0.6], [6.6, 0.4], [-7.1, 0.4]])} color="#b9473b" depth={1.2} />
      <Cut shape={hull} color="#2e3550" depth={1.4} position={[0, 0.3, 0]} />
      <Cut shape={S.rect(15.4, 0.22)} color={C.white} depth={1.46} position={[0.4, 2.3, 0]} />
      {/* decks */}
      <Cut shape={S.rect(10, 1.5, 0, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ kind: "circle" as const, x: -4.2 + k * 1.2, y: 0.75, r: 0.22 })))} color={C.white} depth={1.0} position={[-0.6, 2.6, 0]} />
      <Cut shape={S.rect(7, 1.2, 0, [0, 1, 2, 3, 4].map((k) => ({ kind: "rect" as const, x: -2.6 + k * 1.3, y: 0.35, w: 0.6, h: 0.5 })))} color="#efe6d2" depth={0.8} position={[-0.4, 4.1, 0]} />
      {/* funnels */}
      {[-2.2, 1.0].map((x, i) => (
        <group key={i} position={[x, 5.2, 0]}>
          <Cut shape={S.poly(`ep07-funnel`, [[-0.65, 0], [0.65, 0], [0.8, 2.6], [-0.5, 2.6]])} color={C.gold} depth={0.9} />
          <Cut shape={S.rect(1.32, 0.55)} color={C.ink} depth={0.94} position={[0.15, 2.1, 0]} />
        </group>
      ))}
      {/* smoke puffs drifting back */}
      {[0, 1, 2].map((k) => (
        <Cut key={k} shape={S.cloud(2.4 + k * 0.7, 1.4 + k * 0.4, 3)} color={k ? "#ddd3c2" : "#e9e1d2"} depth={0.2}
          position={[-2.6 - k * 2.2 + Math.sin(s + k) * 0.1, 8.2 + k * 0.7, -0.2]} />
      ))}
      {/* masts and bunting */}
      <Cut shape={S.rect(0.14, 6.5)} color={C.ink} depth={0.14} position={[-6.3, 2.4, 0]} />
      <Cut shape={S.rect(0.14, 6.2)} color={C.ink} depth={0.14} position={[6.2, 2.4, 0]} />
      {Array.from({ length: 9 }, (_, k) => {
        const x = -6.0 + k * 1.5;
        const y = 8.4 - Math.sin((k / 8) * Math.PI) * 1.4;
        const cols = [C.coral, C.celeste, C.gold, C.white];
        return <Cut key={k} shape={S.poly("ep07-pennant", [[-0.3, 0], [0.3, 0], [0, -0.6]])} color={cols[k % 4]} depth={0.04} position={[x, y, 0.1]} />;
      })}
    </group>
  );
};

// ---------- sea, shore, city ----------
const waveShape = (w: number) =>
  S.path(`ep07-wave-${w}`, (s) => {
    const n = Math.round(w / 1.4);
    const step = w / n;
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    for (let i = n; i > 0; i--) {
      const x1 = -w / 2 + i * step;
      const x0 = x1 - step;
      s.quadraticCurveTo((x0 + x1) / 2 + step * 0.2, 0.75, x0, 0.18);
    }
    s.closePath();
  });

const shoreShape = S.path("ep07-shore", (s) => {
  s.moveTo(-90, 0);
  s.lineTo(90, 0);
  s.lineTo(90, 4);
  for (let i = 18; i >= 0; i--) {
    const x = -90 + i * 10;
    s.quadraticCurveTo(x + 5, 4 + (hash01(i + 3) - 0.5) * 3, x, 4 + (hash01(i + 11) - 0.5) * 2);
  }
  s.closePath();
});

const SEA_Z = -24;

const FANS = [
  { p: [-1.2, 0, 13] as V3, yaw: Math.PI + 0.1, coat: C.celeste, scarf: "ivoryLight", hair: "#7a5238", ph: 0, wave: false },
  { p: [1.3, 0, 15.5] as V3, yaw: Math.PI - 0.15, coat: C.white, scarf: C.celeste, hair: "#5a3b2a", ph: 0.4, wave: true },
  { p: [-0.6, 0, 19] as V3, yaw: Math.PI + 0.05, coat: C.celeste, scarf: "ivoryLight", hair: "#8a6047", ph: 0.7, wave: false },
  { p: [1.0, 0, 22.5] as V3, yaw: Math.PI - 0.1, coat: C.celeste, scarf: "ivoryLight", hair: "#4a3326", ph: 0.2, wave: false },
];

const Sea: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Flat shape={S.rectC(240, 140)} color={C.seaDeep} y={0} depth={0.06} position={[0, SEA_Z - 70]} />
    <Flat shape={S.rectC(240, 18)} color={C.sea} y={0.06} depth={0.04} position={[0, SEA_Z - 9]} />
    {/* sandy shore edge cut over the sea */}
    <Flat shape={shoreShape} color={C.sand} y={0.1} depth={0.08} position={[0, SEA_Z + 2]} />
    {Array.from({ length: 9 }, (_, r) => {
      const z = SEA_Z - 3 - r * 4.2;
      const xs = r % 2 ? -3 : 3;
      return (
        <group key={r} position={[xs + Math.sin(s * 0.8 + r) * 0.2, 0.06, z]}>
          <Cut shape={waveShape(60)} color={r % 2 ? C.seaLight : "#7ea0c9"} depth={0.06} />
        </group>
      );
    })}
  </group>
);

// ---------- fonts for the HTML layer ----------
const useFonts = () => {
  const [handle] = useState(() => delayRender("EP07 cover fonts"));
  useLayoutEffect(() => {
    const faces = [
      new FontFace("EP07Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("EP07Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load()))
      .then((loaded) => loaded.forEach((ff) => (document.fonts as unknown as Set<FontFace>).add(ff)))
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

// ---------- camera ----------
export const COVER_SHOT: Shot = {
  pos: [0, 46, 64],
  target: [0, 3.2, -16],
  fov: 36,
  focus: 48,
  aperture: 0.0006,
  maxBlur: 0.003,
};

export type WorldOpts = { build?: number; towerRise?: number; balls?: React.ReactNode; extra?: React.ReactNode };
export const World: React.FC<{ s: number } & WorldOpts> = ({ s, build = 1, towerRise = 1, balls, extra }) => (
  <>
    <Ground color={C.sand} />
    <Sea s={s} />
    {/* far hill across the bay (Cerro) and hung clouds */}
    <PaperHill w={44} h={7} color="mintDeep" position={[-30, 0, -92]} skew={4} />
    <PaperHill w={30} h={4} color="mint" position={[30, 0, -98]} skew={-3} />
    <PaperCloud w={9} color="ivoryLight" position={[-14, 26, -60]} threadTo={40} />
    <PaperCloud w={7} color="ivoryLight" position={[16, 30, -70]} threadTo={40} />
    <group scale={1.05}><Ship position={[-6.4, 0, -20.6]} s={s} /></group>

    {/* city blocks flanking the stadium */}
    <PaperBuilding b={{ w: 5, d: 4, h: 5.5, roof: "gable", wall: "mintLight", roofColor: "cobalt", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 1, seed: 8 }} position={[13, 0, -21]} yaw={-0.35} />

    {/* stadium */}
    <group position={[0, 0, -6]}>
      <Pitch />
      <Stands />
      <Facade build={build} />
      <Tower position={[OUT_AX * 0.62, 0, -OUT_BZ * 0.86]} rise={towerRise} />
      {/* two balls on the centre spot + tags */}
      {balls ?? (
        <>
          <PaperBall r={1.15} color={C.ballArg} seam="#5a3a20" position={[-1.6, 0.1, 0.3]} spin={0.4} />
          <PaperBall r={1.45} color={C.ballUru} seam="#6b4a26" position={[1.75, 0.1, 0.0]} spin={1.3} />
          <BallTag position={[-4.5, 0.1, -1.6]} name="ARGENTINA" stripes={[C.celeste, C.white, C.celeste]} yaw={0.12} />
          <BallTag position={[4.6, 0.1, -1.8]} name="URUGUAY" stripes={[C.white, C.celeste, C.white]} yaw={-0.12} />
        </>
      )}
      {extra}
    </group>

    {/* plaza sign with the in-world AUDIRA plate */}
    <group position={[-12.4, 0, -16.5]} rotation={[0, 0.42, 0]}>
      <Cut shape={S.rect(0.18, 2.4)} color={C.ink} depth={0.18} position={[-2.6, 0, -0.2]} />
      <Cut shape={S.rect(0.18, 2.4)} color={C.ink} depth={0.18} position={[2.6, 0, -0.2]} />
      <Cut shape={S.rectC(6.6, 2.9, 0.15)} color={C.green} depth={0.14} position={[0, 3.6, 0]} />
      <SceneText position={[0, 4.05, 0.1]} fontSize={1.05} color={C.white} anchorX="center" anchorY="middle">MONTEVIDEO</SceneText>
      <SceneText position={[0, 2.95, 0.1]} fontSize={0.62} color="#e4f7ea" anchorX="center" anchorY="middle" letterSpacing={0.06} font="sans">AUDIRA · 1930</SceneText>
    </group>

    {/* foreground: a paper avenue to the stadium gate, lamps, fans in celeste walking in, trees (FG layer) */}
    <GroundPrint shape={S.rectC(5.2, 30)} color="#d9c49c" position={[0, 0, 22]} />
    <GroundPrint shape={S.rectC(0.25, 30)} color="#c4ab80" position={[-2.7, 0, 22]} lift={0.04} />
    <GroundPrint shape={S.rectC(0.25, 30)} color="#c4ab80" position={[2.7, 0, 22]} lift={0.04} />
    <GroundPrint shape={S.ellipse(9, 5)} color="mintLight" position={[-12, 0, 18]} />
    <GroundPrint shape={S.ellipse(8, 5.5)} color="mintLight" position={[12, 0, 17]} />
    <GroundPrint shape={S.ellipse(6, 3.5)} color="mintLight" position={[-15, 0, -8]} />
    {[10, 16, 22, 28].map((z, i) => (
      <group key={z}>
        <PaperLamp h={3.6} position={[-3.6, 0, z]} glow={0.2} />
        <PaperLamp h={3.6} position={[3.6, 0, z]} glow={0.2} />
        <PaperTree kind={i % 2 ? "cone" : "round"} h={4.6 + hash01(i + 21) * 1.2} color={i % 2 ? "mintDeep" : "mint"} position={[-6.4 - hash01(i) * 1.5, 0, z + 1.5]} />
        {<PaperTree kind={i % 2 ? "round" : "cone"} h={4.6 + hash01(i + 31) * 1.2} color={i % 2 ? "mint" : "mintDeep"} position={[6.6 + hash01(i + 5) * 1.5, 0, z + 0.5]} />}
      </group>
    ))}
    {FANS.map((f, i) => (
      <PaperCharacter key={i}
        pose={restPose({ time: s, walk: s * 1.4 + f.ph, stride: 0.8, look: [0, 0.1], armOut: f.wave ? [0, 2.4] : [0, 0] })}
        position={f.p} yaw={f.yaw} scale={0.42}
        colors={{ coat: f.coat, coatDeep: f.coat === C.celeste ? C.celesteDeep : "ivoryShade", collar: "ivoryLight", legs: "brownDeep", shoes: "ink", scarf: f.scarf, hair: f.hair }}
        scarf curl={false} />
    ))}
    <PaperTree kind="round" h={7} color="mintDeep" position={[-15, 0, 6]} />
    <PaperTree kind="cone" h={7.5} color="mintDeep" position={[15.5, 0, -3]} />
    <PaperTree kind="cone" h={5.5} color="mint" position={[-13, 0, -2]} />
    {Array.from({ length: 11 }, (_, i) => (
      <PaperBush key={i} w={2.6 + hash01(i + 40) * 1.4} color={i % 2 ? "mintDeep" : "mint"} position={[-17 + i * 3.4, 0, 31 + hash01(i + 7) * 1.5]} yaw={hash01(i) * 0.6} />
    ))}
  </>
);

export const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(239,228,207,0.92) 0%, rgba(239,228,207,0.75) 24%, rgba(239,228,207,0) 38%)" }} />
    <div
      style={{
        position: "absolute", left: 72, top: 188, padding: "8px 20px", borderRadius: 8, background: C.green, color: "#f7f1e4",
        fontFamily: "EP07Grotesk, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: 5,
      }}
    >
      SEJARAH SEPAK BOLA #07
    </div>
    <div style={{ position: "absolute", left: 66, top: 262, fontFamily: "EP07Anton, Impact, sans-serif", color: C.ink, lineHeight: 0.95 }}>
      <div style={{ fontSize: 168 }}>PIALA DUNIA</div>
      <div style={{ fontSize: 168, color: C.celesteInk }}>PERTAMA</div>
    </div>
    <div style={{ position: "absolute", left: 60, top: 604, padding: "6px 16px", borderRadius: 8, background: "rgba(250,244,232,0.92)", boxShadow: "0 4px 14px rgba(60,40,20,0.18)", fontFamily: "EP07Grotesk, 'Segoe UI', sans-serif", fontWeight: 600, fontSize: 44, color: C.ink }}>
      1930 · 13 tim · <span style={{ color: C.green, fontWeight: 700 }}>final dengan dua bola</span>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: AFTERNOON.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 36, position: COVER_SHOT.pos }}>
        <Stage shot={COVER_SHOT} light={AFTERNOON} frame={frame} center={[0, 0, -8]}>
          <World s={s} />
        </Stage>
        <Finish frame={frame} background={AFTERNOON.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
