// PERSAUDARAAN: the paper village. Terraced sawah, the raised path between two rice barns on stilts
// (saddle roofs with gonjong horns), the brothers' houses, palms, layered hills and a theatre wheel
// behind the hills that carries the paper sun and the paper moon (turning it is day and night).

import React from "react";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { Cut, ShearPop, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { Ground, GroundPrint, PaperCloud, PaperHill, PaperTree, Thread } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { hash01, popEase, clamp, remap } from "../../kits/paperworld/motion/easing.ts";
import { BARN_A, BARN_B, BENCH_A, HOUSE_A, HOUSE_B, PATH_X, PATH_Y, STACK_A, STACK_B } from "./layout.ts";
import { Lantern, Sack } from "./Puppet.tsx";

const q = (v: number, steps = 12) => Math.round(clamp(v) * steps) / steps;
const hex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
};

/* ---------- rice ---------- */

const riceRow = (len: number, h: number, seed: number) =>
  S.path(`ep4-rice-${len}-${h}-${seed}`, (s) => {
    const n = Math.max(2, Math.round(len / 0.42));
    const step = len / n;
    s.moveTo(-len / 2, 0);
    s.lineTo(len / 2, 0);
    for (let i = n; i > 0; i--) {
      const x0 = -len / 2 + i * step;
      const tip = h * (0.78 + 0.32 * hash01(seed * 997 + i));
      s.lineTo(x0 - step * 0.15, h * 0.55);
      s.quadraticCurveTo(x0 - step * 0.35, tip * 1.02, x0 - step * 0.62 + (hash01(i + seed) - 0.5) * 0.12, tip);
      s.lineTo(x0 - step * 0.85, h * 0.55);
    }
    s.lineTo(-len / 2, h * 0.5);
    s.closePath();
  });

type Row = { x: number; y: number; z: number; len: number; seed: number };
const ROWS: Row[] = (() => {
  const out: Row[] = [];
  let seed = 1;
  // front field, below the path, between the two yards
  for (let i = 0; i < 9; i++) out.push({ x: 0, y: 0, z: 2.3 + i * 1.55, len: 33 - (i % 2) * 0.6, seed: seed++ });
  // back field at ground level
  for (let i = 0; i < 7; i++) out.push({ x: 0, y: 0, z: -2.6 - i * 1.7, len: 33, seed: seed++ });
  // terraces climbing away from the path
  for (let k = 1; k <= 4; k++) for (let j = 0; j < 4; j++) out.push({ x: 0, y: k * 1.3, z: -16.3 - (k - 1) * 8 - j * 1.8, len: 86, seed: seed++ });
  return out;
})();

/** Rice rows: `grow` 0..1 height, `ripe` 0 green .. 1 gold. */
export const Rice: React.FC<{ grow: number; ripe: number }> = ({ grow, ripe }) => {
  const g = Math.max(0.12, q(grow, 10));
  const c1 = hex("#7fb35c", "#dcb24a", q(ripe, 8));
  const c2 = hex("#6a9e4f", "#c99a35", q(ripe, 8));
  return (
    <>
      {ROWS.map((r, i) => (
        <group key={i} position={[r.x, r.y, r.z]} scale={[1, g, 1]}>
          <Cut shape={riceRow(r.len, 1.25, r.seed)} color={i % 2 ? c1 : c2} depth={0.06} />
          <Cut shape={riceRow(r.len - 0.4, 0.95, r.seed + 50)} color={i % 2 ? c2 : c1} depth={0.05} position={[0.2, 0, -0.35]} />
        </group>
      ))}
    </>
  );
};

/* ---------- terraces, path, yards ---------- */

const Terraces: React.FC = () => (
  <>
    {/* water in the low fields (a pale sheet just above the ground card) */}
    <GroundPrint shape={S.rectC(34, 15)} color="#a9cdb9" position={[0, 0, 9.2]} />
    <GroundPrint shape={S.rectC(34, 12)} color="#a9cdb9" position={[0, 0, -8.2]} />
    {[1, 2, 3, 4].map((k) => {
      const z0 = -15 - (k - 1) * 8;
      return (
        <group key={k}>
          {/* bund wall (front face of the step) */}
          <Cut shape={S.rect(96, k * 1.3)} color={k % 2 ? "#b48a5c" : "#a77d52"} depth={0.3} position={[0, 0, z0]} />
          {/* flooded top */}
          <Cut shape={S.rectC(96, 8)} color={k % 2 ? "#a3c9b2" : "#9cc2ac"} depth={0.2} position={[0, k * 1.3 - 0.1, z0 - 4]} rotation={[-Math.PI / 2, 0, 0]} cast={false} />
          {/* earth fill so the step reads solid from a high camera */}
          <Cut shape={S.rect(96, k * 1.3 - 0.12)} color="#8f6a46" depth={8} position={[0, 0, z0 - 4.15]} cast={false} />
        </group>
      );
    })}
  </>
);

const PathAndYards: React.FC = () => (
  <>
    {/* the raised earthen pematang between the barns */}
    <Cut shape={S.rectC(2 * PATH_X + 4, 2.6, 0.4)} color="#c9a777" depth={PATH_Y * 2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} />
    {/* worn centre line where feet walk, slightly darker */}
    <GroundPrint shape={S.rectC(2 * PATH_X + 2, 0.9, 0.3)} color="#b8946a" position={[0, PATH_Y, 0]} lift={0.01} />
    {/* yards around each barn and house */}
    {[-1, 1].map((s) => (
      <group key={s}>
        <Cut shape={S.circle(13)} color="#d8bd8e" depth={PATH_Y * 2} rotation={[-Math.PI / 2, 0, 0]} position={[s * 29, -0.01, -4.5]} cast={false} />
        {/* plank the sacks stand on */}
        <Cut shape={S.rectC(6.6, 1.5, 0.1)} color="#8d6443" depth={0.2} rotation={[-Math.PI / 2, 0, 0]} position={[s * 22.6, PATH_Y + 0.1, -2.6]} cast={false} />
      </group>
    ))}
  </>
);

/* ---------- saddle roof ---------- */

const saddle = (w: number, hc: number, ht: number, ex: number) =>
  S.path(`ep4-saddle-${w}-${hc}-${ht}-${ex}`, (s) => {
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2 + ex, ht);
    s.quadraticCurveTo(w / 2 + ex - 0.25, ht + 0.15, w / 2 + ex - 0.5, ht - 0.25);
    s.bezierCurveTo(w * 0.28, hc + 0.3, w * 0.12, hc, 0, hc);
    s.bezierCurveTo(-w * 0.12, hc, -w * 0.28, hc + 0.3, -w / 2 - ex + 0.5, ht - 0.25);
    s.quadraticCurveTo(-w / 2 - ex + 0.25, ht + 0.15, -w / 2 - ex, ht);
    s.closePath();
  });

/** Roof: two leaning saddle panels (gonjong horns at the ends) and end gables. Base at y = 0, ridge along x. */
const SaddleRoof: React.FC<{ w: number; d: number; hc: number; ht: number; ex: number; color: string; inner: string; y: number }> = ({ w, d, hc, ht, ex, color, inner, y }) => {
  const half = d / 2 + 0.35;
  const lean = Math.asin(Math.min(0.98, half / hc));
  const rise = hc * Math.cos(lean);
  return (
    <group position={[0, y, 0]}>
      {[1, -1].map((s) => (
        <group key={s} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <group position={[0, 0, half]} rotation={[-lean, 0, 0]}>
            <Cut shape={saddle(w + 0.7, hc, ht, ex)} color={color} edge={inner} depth={0.22} />
            {/* ijuk thatch layers: printed strips */}
            {[0.25, 0.5, 0.75].map((f) => (
              <Cut key={f} shape={S.rectC(w + 0.4, 0.07)} color={inner} depth={0.02} position={[0, hc * f * 0.9, 0.12]} cast={false} />
            ))}
          </group>
        </group>
      ))}
      {[-1, 1].map((s) => (
        <Cut key={s} shape={S.poly(`ep4-gableend-${d}-${rise}`, [[-half + 0.2, 0], [half - 0.2, 0], [0, rise - 0.1]])} color="#7a5236" depth={0.12} rotation={[0, Math.PI / 2, 0]} position={[s * (w / 2 - 0.1), 0.02, 0]} />
      ))}
    </group>
  );
};

/* ---------- carved band (ukiran) ---------- */
const Carving: React.FC<{ w: number; y: number; z: number }> = ({ w, y, z }) => {
  const n = Math.floor(w / 0.42);
  return (
    <group position={[0, y, z]}>
      <Cut shape={S.rectC(w, 0.5)} color="#8e3b2a" depth={0.03} />
      {Array.from({ length: n }, (_, i) => (
        <Cut key={i} shape={S.poly("ep4-tri", [[-0.17, -0.18], [0.17, -0.18], [0, 0.18]])} color={i % 2 ? "#e7b54a" : "#f2d58e"} depth={0.02} position={[-w / 2 + 0.21 + i * 0.42, 0, 0.03]} rotation={[0, 0, i % 2 ? Math.PI : 0]} cast={false} />
      ))}
    </group>
  );
};

/* ---------- tally card ---------- */
const stroke = S.rectC(0.05, 0.42, 0.02);
export const Tally: React.FC<{ n: number; position: V3; scale?: number }> = ({ n, position, scale = 1 }) => {
  const marks: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5), k = i % 5;
    const gx = -0.42 + g * 0.72;
    if (k < 4) marks.push(<Cut key={i} shape={stroke} color="#3b2a22" depth={0.02} position={[gx + k * 0.12 - 0.18, 0, 0.05]} cast={false} />);
    else marks.push(<Cut key={i} shape={stroke} color="#a3542f" depth={0.02} position={[gx, 0, 0.065]} rotation={[0, 0, 1.15]} scale={[1, 1.35, 1]} cast={false} />);
  }
  return (
    <group position={position} scale={scale}>
      <Cut shape={S.rectC(1.7, 0.78, 0.08)} color="#f3ead9" depth={0.06} />
      {marks}
      <Thread position={[0, 0.38, -0.02]} length={0.4} radius={0.015} />
    </group>
  );
};

/* ---------- barn ---------- */
const plank = S.rectC(3.7, 0.05);
export const Barn: React.FC<{ at: [number, number]; flip?: boolean; glow: number; count: number }> = ({ at, glow, count }) => {
  const W = 3.8, H = 3.0, D = 3.2, Y = 2.75;
  return (
    <group position={[at[0], 0, at[1]]}>
      {/* stilts with round rat-guards */}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <group key={`${sx}${sz}`} position={[sx * 1.5, 0, sz * 1.25]}>
          <Cut shape={S.rect(0.32, Y, 0.06)} color="#6e4a32" depth={0.32} />
          <Cut shape={S.circle(0.55)} color="#9a7350" depth={0.08} position={[0, Y - 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
      )))}
      <Cut shape={S.rectC(W + 0.6, D + 0.6, 0.06)} color="#7d5843" depth={0.22} rotation={[-Math.PI / 2, 0, 0]} position={[0, Y - 0.1, 0]} />
      {/* walls */}
      <Cut shape={S.rect(W, H, 0, [{ kind: "rect", x: 0, y: 0.35, w: 1.0, h: 1.55, r: 0.05 }])} color="#b07a4a" edge="#d9b48a" depth={0.14} position={[0, Y, D / 2]} />
      <Cut shape={S.rect(1.1, 1.65)} color="#3b2a22" depth={0.05} position={[0, Y + 0.3, D / 2 - 0.12]} />
      {/* half-open door leaf */}
      <group position={[0.5, Y + 0.35, D / 2 + 0.05]} rotation={[0, 0.9, 0]}>
        <Cut shape={S.rect(1.0, 1.55)} color="#8a5a35" depth={0.06} position={[-0.5, 0, 0]} />
      </group>
      {[0.95, 1.95, 2.55].map((y) => (
        <Cut key={y} shape={plank} color="#8e6040" depth={0.02} position={[0, Y + y, D / 2 + 0.08]} cast={false} />
      ))}
      <Carving w={W} y={Y + H - 0.3} z={D / 2 + 0.1} />
      <Cut shape={S.rect(W, H)} color="#9c6a40" depth={0.14} position={[0, Y, -D / 2]} />
      {[-1, 1].map((s) => (
        <Cut key={s} shape={S.rect(D, H)} color="#a06d43" depth={0.14} rotation={[0, Math.PI / 2, 0]} position={[s * W / 2, Y, 0]} />
      ))}
      {/* warm glow inside the doorway at night (a lamp left on in the barn) */}
      {glow > 0.02 ? <Cut shape={S.rect(0.9, 1.45)} color="#ffcf7a" depth={0.02} position={[0, Y + 0.38, D / 2 - 0.08]} opts={{ emissive: "#ffb24a", emissiveIntensity: q(glow, 8) * 1.6 }} cast={false} /> : null}
      <SaddleRoof w={W} d={D} hc={3.3} ht={5.0} ex={0.9} color="#4f3d32" inner="#6b5444" y={Y + H} />
      {/* ladder */}
      <group position={[-1.1, 0, D / 2 + 0.9]} rotation={[-0.32, 0, 0]}>
        {[-0.38, 0.38].map((x) => <Cut key={x} shape={S.rect(0.14, 3.2)} color="#6e4a32" depth={0.12} position={[x, 0, 0]} />)}
        {[0.5, 1.15, 1.8, 2.45].map((y) => <Cut key={y} shape={S.rectC(0.9, 0.12)} color="#7d5843" depth={0.1} position={[0, y, 0]} />)}
      </group>
      <Tally n={count} position={[1.35, Y + 1.4, D / 2 + 0.16]} scale={0.95} />
    </group>
  );
};

/* ---------- house ---------- */
export const House: React.FC<{ at: [number, number]; w: number; windows: number; glow: number; wall: string; yaw?: number }> = ({ at, w, windows, glow, wall, yaw = 0 }) => {
  const H = 3.6, D = 5.2, Y = 1.7;
  const wx = Array.from({ length: windows }, (_, i) => (windows === 1 ? -w * 0.22 : -w / 2 + ((i + 0.5) * w) / windows));
  const doorX = windows === 1 ? w * 0.18 : 0;
  const holes = wx.filter((x) => Math.abs(x - doorX) > 1).map((x) => ({ kind: "rect" as const, x, y: 1.25, w: 1.2, h: 1.3, r: 0.04 }));
  const lit = q(glow, 8);
  return (
    <group position={[at[0], 0, at[1]]} rotation={[0, yaw, 0]}>
      {[-1, 0, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <Cut key={`${sx}${sz}`} shape={S.rect(0.36, Y, 0.06)} color="#6e4a32" depth={0.36} position={[sx * (w / 2 - 0.4), 0, sz * (D / 2 - 0.3)]} />
      )))}
      <Cut shape={S.rectC(w + 1.4, D + 1.2, 0.06)} color="#7d5843" depth={0.24} rotation={[-Math.PI / 2, 0, 0]} position={[0, Y - 0.1, 0.3]} />
      <Cut shape={S.rect(w, H, 0, [...holes, { kind: "rect", x: doorX, y: 0, w: 1.3, h: 2.4, r: 0.05 }])} color={wall} edge="#e9d3b0" depth={0.16} position={[0, Y, D / 2]} />
      {/* backing behind openings: dark by day, lamplight by night */}
      <Cut shape={S.rect(w - 0.4, H - 0.2)} color={lit > 0 ? "#ffcf7a" : "#3b2a22"} depth={0.05} position={[0, Y + 0.1, D / 2 - 0.25]} opts={lit > 0 ? { emissive: "#ffae48", emissiveIntensity: lit * 1.3 } : {}} cast={false} />
      {holes.map((h, i) => (
        <group key={i} position={[h.x, Y + 1.25, D / 2 + 0.1]}>
          <Cut shape={S.frame("rect", 1.45, 1.55, "rect", 1.2, 1.3, 0.12)} color="#7a4a2c" depth={0.06} position={[0, -0.12, 0]} />
          <Cut shape={S.rectC(0.08, 1.3)} color="#7a4a2c" depth={0.05} position={[0, 0.65, 0.02]} />
        </group>
      ))}
      <Carving w={w} y={Y + H - 0.32} z={D / 2 + 0.1} />
      <Cut shape={S.rect(w, H)} color={wall} depth={0.16} position={[0, Y, -D / 2]} />
      {[-1, 1].map((s) => (
        <Cut key={s} shape={S.rect(D, H)} color={wall} depth={0.16} rotation={[0, Math.PI / 2, 0]} position={[s * w / 2, Y, 0]} />
      ))}
      {/* steps */}
      {[0, 1, 2].map((i) => (
        <Cut key={i} shape={S.rectC(1.6, 0.18)} color="#8d6443" depth={0.55} position={[doorX, Y - 0.45 - i * 0.5, D / 2 + 0.75 + i * 0.5]} />
      ))}
      {[-1, 1].map((s) => (
        <Cut key={s} shape={S.rect(0.12, 2.3)} color="#6e4a32" depth={0.12} position={[doorX + s * 0.75, 0, D / 2 + 1.7]} rotation={[-0.58, 0, 0]} />
      ))}
      <SaddleRoof w={w} d={D} hc={4.2} ht={6.4} ex={1.3} color="#4a3a30" inner="#66503f" y={Y + H} />
    </group>
  );
};

/* ---------- bench ---------- */
export const Bench: React.FC<{ position: V3; yaw?: number }> = ({ position, yaw = 0 }) => (
  <group position={position} rotation={[0, yaw, 0]}>
    <Cut shape={S.rectC(3.2, 1.3, 0.08)} color="#a07a52" depth={0.16} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.0, 0]} />
    {[-1.4, 1.4].flatMap((x) => [-0.5, 0.5].map((z) => <Cut key={`${x}${z}`} shape={S.rect(0.16, 1.0)} color="#6e4a32" depth={0.16} position={[x, 0, z]} />))}
  </group>
);

/* ---------- palms ---------- */
const frond = S.path("ep4-frond", (s) => {
  s.moveTo(0, -0.12);
  s.bezierCurveTo(1.4, 0.35, 2.8, 0.2, 3.6, -0.9);
  s.bezierCurveTo(2.6, -0.35, 1.3, -0.35, 0, 0.12);
  s.closePath();
});
export const Palm: React.FC<{ position: V3; h?: number; seed?: number }> = ({ position, h = 9, seed = 1 }) => {
  const bend = (hash01(seed) - 0.5) * 0.25;
  return (
    <group position={position} rotation={[0, hash01(seed + 3) * Math.PI, bend]}>
      {[0, Math.PI / 2].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <Cut shape={S.poly(`ep4-trunk-${h}`, [[-0.3, 0], [0.3, 0], [0.16, h], [-0.16, h]])} color="#8a6a4a" depth={0.1} />
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[0, h, 0]} rotation={[0, (i / 7) * Math.PI * 2 + seed, 0]}>
          <Cut shape={frond} color={i % 2 ? "#5f9a68" : "#4f8a5c"} depth={0.06} rotation={[Math.PI / 2 - 0.15, 0, 0]} />
        </group>
      ))}
    </group>
  );
};

/* ---------- sky wheel ---------- */
const moonCrater = S.circle(1);
export const SkyWheel: React.FC<{ angle: number; night: number }> = ({ angle, night }) => {
  const R = 46;
  return (
    <group position={[0, -22, -96]} rotation={[0, 0, angle]}>
      <Cut shape={S.circle(2.4)} color="#6e4a32" depth={0.6} />
      {/* sun on the upper arm */}
      <Cut shape={S.rect(0.7, R - 6.5)} color="#7d5843" depth={0.3} position={[0, 0, -0.5]} />
      <group position={[0, R, 0]}>
        <Cut shape={S.star(10.5, 0.62)} color="#f0b84a" depth={0.3} position={[0, 0, -0.3]} opts={{ emissive: "#f3a93a", emissiveIntensity: 0.35 }} />
        <Cut shape={S.circle(6.6)} color="#f6cf6a" depth={0.4} opts={{ emissive: "#f7c35a", emissiveIntensity: 0.6 }} />
      </group>
      {/* moon on the opposite arm (it is up when the wheel has turned half way) */}
      <group rotation={[0, 0, Math.PI]}>
        <Cut shape={S.rect(0.7, R - 9)} color="#7d5843" depth={0.3} position={[0, 0, -0.5]} />
        <group position={[0, R, 0]}>
          <Cut shape={S.circle(10)} color="#f6eed4" depth={0.4} opts={{ emissive: "#fff3d0", emissiveIntensity: 0.25 + 0.9 * q(night, 6) }} />
          {[[-3.2, 2.5, 1.6], [2.8, -1.8, 2.2], [3.6, 4.2, 1.0], [-2.2, -4.6, 1.3], [-5.6, -0.6, 0.8]].map(([x, y, r], i) => (
            <Cut key={i} shape={moonCrater} color="#e4d9b8" depth={0.06} position={[x, y, 0.24]} scale={[r, r, 1]} cast={false} />
          ))}
        </group>
      </group>
    </group>
  );
};

/** Paper stars hung on threads, shown only at night. */
const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: (hash01(i * 7 + 1) - 0.5) * 210,
  y: 26 + hash01(i * 13 + 2) * 60,
  z: -112 - hash01(i * 3) * 20,
  r: 0.7 + hash01(i * 5 + 9) * 1.1,
  a: hash01(i * 11) * 1.2,
}));
export const Stars: React.FC<{ night: number }> = ({ night }) =>
  night > 0.55 ? (
    <>
      {STARS.map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]} rotation={[0, 0, s.a]}>
          <Cut shape={S.star(s.r, 0.45)} color="#fff4c8" depth={0.1} opts={{ emissive: "#fff0b8", emissiveIntensity: 0.9 }} cast={false} />
        </group>
      ))}
    </>
  ) : null;

/* ---------- sack stacks ---------- */
const SLOTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  [4, 3, 2, 1].forEach((n, row) => {
    for (let i = 0; i < n; i++) out.push([(i - (n - 1) / 2) * 1.1, row * 0.72]);
  });
  // extras beyond ten stand in front, on the ground
  out.push([-1.8, -9], [1.8, -9]);
  return out;
})();

/** `count` sacks (may be fractional while one is landing: the last sack pops in). */
export const Stack: React.FC<{ at: V3; count: number }> = ({ at, count }) => {
  const n = Math.ceil(count - 1e-3);
  const frac = count - Math.floor(count);
  return (
    <group position={at}>
      {SLOTS.slice(0, Math.min(n, SLOTS.length)).map(([x, y], i) => {
        const extra = y < 0;
        const k = i === n - 1 && frac > 0.001 ? popEase(frac) : 1;
        return (
          <ShearPop key={i} t={k} position={extra ? [x, 0, 1.2] : [x, 0.08 + y, 0]}>
            <Sack scale={0.66} tone={i % 3 === 1 ? 1 : 0} />
          </ShearPop>
        );
      })}
    </group>
  );
};

/* ---------- harvest pile at the middle of the path ---------- */
const PILE: [number, number][] = (() => {
  const out: [number, number][] = [];
  [6, 5, 4, 3, 2].forEach((n, row) => {
    for (let i = 0; i < n; i++) out.push([(i - (n - 1) / 2) * 1.08, row * 0.7]);
  });
  return out;
})();
const HALF: [number, number][] = SLOTS.slice(0, 10).map(([x, y]) => [x, y]);

/** Twenty sacks heaped in the middle; `split` 0..1 slides them into two equal stacks of ten. */
export const HarvestPile: React.FC<{ split: number; appear: number }> = ({ split, appear }) => (
  <group position={[0, PATH_Y, -0.2]}>
    {PILE.map(([px, py], i) => {
      const side = i % 2 ? 1 : -1;
      const j = Math.floor(i / 2);
      const [hx, hy] = HALF[j];
      const k = clamp(remap(split, j * 0.06, j * 0.06 + 0.46));
      const e = k * k * (3 - 2 * k);
      const x = px + (side * 2.75 + hx - px) * e;
      const y = py + (hy - py) * e + Math.sin(e * Math.PI) * 0.8;
      const pop = popEase(clamp(remap(appear, i * 0.035, i * 0.035 + 0.3)));
      return (
        <ShearPop key={i} t={pop} position={[x, y + 0.05, 0]} visible={appear > 0}>
          <Sack scale={0.66} tone={i % 3 === 1 ? 1 : 0} />
        </ShearPop>
      );
    })}
  </group>
);

/* ---------- the world ---------- */

export type WorldState = {
  night: number;
  wheel: number;
  grow: number;
  ripe: number;
  countA: number;
  countB: number;
  pileSplit: number;
  pileAppear: number;
  glowA: number;
  glowB: number;
  houseGlowA: number;
  houseGlowB: number;
  groundSacks: number;
  groundLanterns: number;
  t: number;
};

export const World: React.FC<{ w: WorldState }> = ({ w }) => (
  <>
    <Ground color="#b9d3a9" />
    <Terraces />
    <PathAndYards />
    <Rice grow={w.grow} ripe={w.ripe} />

    <Barn at={BARN_A} glow={w.glowA} count={Math.round(w.countA)} />
    <Barn at={BARN_B} glow={w.glowB} count={Math.round(w.countB)} />
    <Stack at={STACK_A} count={w.countA} />
    <Stack at={STACK_B} count={w.countB} />
    <House at={HOUSE_A} w={6.6} windows={1} glow={w.houseGlowA} wall="#c99a68" yaw={0.12} />
    <House at={HOUSE_B} w={10} windows={3} glow={w.houseGlowB} wall="#d0a874" yaw={-0.12} />
    <Bench position={BENCH_A} yaw={0.35} />
    {w.pileAppear > 0 ? <HarvestPile split={w.pileSplit} appear={w.pileAppear} /> : null}
    {w.groundSacks > 0.01 ? (
      <>
        <Sack position={[-2.35, PATH_Y, -0.55]} rotation={[0, 0.3, 0.05]} scale={0.7 * w.groundSacks} />
        <Sack position={[2.35, PATH_Y, -0.5]} rotation={[0, -0.25, -0.05]} scale={0.7 * w.groundSacks} tone={1} />
      </>
    ) : null}
    {w.groundLanterns > 0.01 ? (
      <>
        <Lantern glow={w.groundLanterns} position={[-3.2, PATH_Y + 1.25, 0.75]} />
        <Lantern glow={w.groundLanterns} position={[3.2, PATH_Y + 1.25, 0.75]} />
      </>
    ) : null}

    {/* trees and palms around the yards and along the terraces */}
    <Palm position={[-39.5, 0, -4]} h={10.5} seed={1} />
    <Palm position={[-20.5, 0, -12]} h={8.5} seed={2} />
    <Palm position={[40.5, 0, -3]} h={11} seed={3} />
    <Palm position={[20.5, 0, -12.5]} h={9} seed={4} />
    <Palm position={[-8, 2.6, -25]} h={9.5} seed={5} />
    <Palm position={[11, 3.9, -34]} h={10} seed={6} />
    <Palm position={[-27, 5.2, -41]} h={10} seed={7} />
    <PaperTree kind="round" h={7} color="#6eaa93" position={[-42, 0, -9]} />
    <PaperTree kind="cone" h={8} color="#5c9a80" position={[43, 0, -9]} />
    <PaperTree kind="round" h={6.5} color="#7fb79c" position={[27, 3.9, -35]} />
    <PaperTree kind="cloud" h={7} color="#6eaa93" position={[-16, 3.9, -34]} />
    <PaperTree kind="round" h={6} color="#5c9a80" position={[-44, 0, 6]} />
    <PaperTree kind="cone" h={7.5} color="#6eaa93" position={[45, 0, 5]} />

    {/* hills and the far mountain (lowered so the moon clears them) */}
    <PaperHill w={110} h={10} color="#86b59a" position={[-20, 5.2, -54]} skew={8} />
    <PaperHill w={120} h={12} color="#9cc4ad" position={[30, 5.2, -60]} skew={-12} />
    <PaperHill w={170} h={13} color="#b4d1bf" position={[0, 0, -78]} skew={20} />
    <Cut shape={S.poly("ep4-mountain", [[-80, 0], [80, 0], [12, 26], [4, 28.5], [-4, 28], [-12, 25]])} color="#c9dccf" depth={0.4} position={[38, 0, -108]} />

    <SkyWheel angle={w.wheel} night={w.night} />
    <Stars night={w.night} />
    {w.night < 0.6 ? (
      <>
        <PaperCloud w={10} position={[-24, 30 + Math.sin(w.t * 0.4) * 0.3, -70]} threadTo={40} />
        <PaperCloud w={8} position={[26, 34 + Math.sin(w.t * 0.35 + 1) * 0.3, -74]} threadTo={40} />
      </>
    ) : null}
  </>
);
