// EP01 film stations: every beat is built from bricks on the same desk as the cover.
// All timings come from word times (timing.ts). Seeded prng only.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { Brick, C, TOWER } from "./Hook.tsx";
import { signTexture, type SignLine } from "./textures.ts";
import { pop, ramp, w, line, clamp01 } from "./timing.ts";

type V3 = [number, number, number];

/** Station anchors (world). The camera keys in Film.tsx frame these. */
export const ST = {
  build: [-11, 0, 15] as V3,
  nz: [-20, 0, 5] as V3,
  g9000: [-30.5, 0, 3] as V3,
  pie: [-44, 0, 4] as V3,
  bill500: [-13, 0, -11] as V3,
  bill70: [17, 0, -11] as V3,
  bars: [15, 0, 10] as V3,
  grid100: [30, 0, 0] as V3,
  podium: [30, 0, -18] as V3,
  meleset: [44, 0, -4] as V3,
  original: [60, 0, -30] as V3,
  unique: [60, 0, -10] as V3,
};

// ---------- printed brick sign ----------
export const Sign: React.FC<{
  id: string;
  p: V3;
  rotY?: number;
  w: number;
  h: number;
  bg: string;
  lines: SignLine[];
  legs?: number;
  frame?: string;
  appear?: number;
}> = ({ id, p, rotY = 0, w: W, h: H, bg, lines, legs = 2.4, frame = C.white, appear = 1 }) => {
  const tex = signTexture(id, Math.round(256 * W), Math.round(256 * H), bg, lines);
  if (appear <= 0.001) return null;
  const legBricks = Math.max(1, Math.round(legs / 1.2));
  return (
    <group position={[p[0], p[1] + (1 - Math.min(1, appear)) * 3, p[2]]} rotation={[0, rotY, 0]} scale={Math.max(0.001, appear)}>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (W / 2 - 0.5), 0, 0]}>
          {Array.from({ length: legBricks }, (_, k) => (
            <Brick key={k} w={1} l={1} color={k % 2 ? frame : C.dgrey} p={[0, k * 1.2, 0]} studs={false} />
          ))}
        </group>
      ))}
      <group position={[0, legBricks * 1.2, 0]}>
        <mesh castShadow receiveShadow position={[0, H / 2 + 0.2, 0]}>
          <RoundedBoxGeo args={[W + 0.4, H + 0.4, 0.8]} radius={0.12} segments={3} />
          <meshPhysicalMaterial {...POLISH.brickABS} color={frame} />
        </mesh>
        <mesh position={[0, H / 2 + 0.2, 0.41]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.28} roughness={0.35} />
        </mesh>
        <Brick w={Math.round(W + 0.4)} l={1} h={1} color={frame} p={[0, H + 0.4, 0]} />
      </group>
    </group>
  );
};

// ---------- mini game map (6x6 plate) ----------
type Piece = { w: number; l: number; h: number; color: string; p: V3; trans?: boolean; glow?: boolean };
const MAP_COLS = [C.red, C.blue, C.yellow, C.green, C.orange, C.white, C.lime, C.purple];
export function mapPieces(seed: number, n = 7, base?: string): { plate: string; pieces: Piece[] } {
  const r = prng(seed);
  const plate = base ?? [C.green, C.tan, C.lgrey, C.lime][Math.floor(r() * 4)];
  const hm = new Array(36).fill(0.4);
  const sizes: [number, number, number][] = [
    [2, 2, 3],
    [1, 2, 3],
    [2, 4, 1],
    [1, 1, 3],
    [2, 3, 3],
    [1, 4, 1],
  ];
  const pieces: Piece[] = [];
  for (let i = 0; i < n; i++) {
    const [sw, sl, sh] = sizes[Math.floor(r() * sizes.length)];
    const gx = Math.floor(r() * (7 - sw));
    const gz = Math.floor(r() * (7 - sl));
    let top = 0;
    for (let x = gx; x < gx + sw; x++) for (let z = gz; z < gz + sl; z++) top = Math.max(top, hm[z * 6 + x]);
    const H = sh * 0.4;
    for (let x = gx; x < gx + sw; x++) for (let z = gz; z < gz + sl; z++) hm[z * 6 + x] = top + H;
    pieces.push({
      w: sw,
      l: sl,
      h: sh,
      color: MAP_COLS[Math.floor(r() * MAP_COLS.length)],
      p: [gx + sw / 2 - 3, top, gz + sl / 2 - 3],
      trans: r() < 0.12,
      glow: r() < 0.1,
    });
  }
  return { plate, pieces };
}

export const MiniMap: React.FC<{
  seed: number;
  p: V3;
  rotY?: number;
  s?: number;
  built?: number;
  n?: number;
  plate?: string;
  gray?: number;
  appear?: number;
}> = ({ seed, p, rotY = 0, s = 1, built = 1, n = 7, plate, gray = 0, appear = 1 }) => {
  const m = useMemo(() => mapPieces(seed, n, plate), [seed, n, plate]);
  if (appear <= 0.001) return null;
  const tint = (c: string) => (gray > 0 ? "#" + new THREE.Color(c).lerp(new THREE.Color("#6f7378"), gray).getHexString() : c);
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={s * Math.max(0.001, appear)}>
      <Brick w={6} l={6} h={1} color={tint(m.plate)} />
      {m.pieces.map((q, i) => {
        const k = clamp01(built * m.pieces.length - i);
        if (k <= 0) return null;
        return (
          <Brick
            key={i}
            w={q.w}
            l={q.l}
            h={q.h}
            color={tint(q.color)}
            p={[q.p[0], q.p[1] + (1 - k) * 4, q.p[2]]}
            s={0.4 + 0.6 * k}
            trans={q.trans}
            emissive={q.glow && gray < 0.5 ? q.color : undefined}
            ei={q.glow ? 0.5 : 0}
          />
        );
      })}
    </group>
  );
};

// ---------- l02: bricks fly from the tablet and assemble a map ----------
const TABLET_SCREEN: V3 = [-3.5, 6.2, 8.4];
export const BuildSite: React.FC<{ t: number }> = ({ t }) => {
  const t0 = w("tulis").s;
  const t1 = w("merakitnya").e + 0.4;
  const built = ramp(t, t0, t1);
  const m = useMemo(() => mapPieces(42, 9, C.green), []);
  const appear = pop(t, w("Kamu").s);
  if (appear <= 0) return null;
  // bricks in flight from the screen to their slot
  const fly = m.pieces.map((q, i) => {
    const a = t0 + ((t1 - t0) * i) / m.pieces.length - 0.9;
    const x = clamp01((t - a) / 0.9);
    return { q, x, i };
  });
  const [bx, , bz] = ST.build;
  const S = 1.3;
  return (
    <group>
      <MiniMap seed={42} n={9} plate={C.green} p={ST.build} s={S} built={built} appear={appear} />
      {fly
        .filter((f) => f.x > 0 && f.x < 1)
        .map(({ q, x, i }) => {
          const tx = bx + q.p[0] * S, ty = q.p[1] * S + 4 * S, tz = bz + q.p[2] * S;
          const px = THREE.MathUtils.lerp(TABLET_SCREEN[0], tx, x);
          const pz = THREE.MathUtils.lerp(TABLET_SCREEN[2], tz, x);
          const py = THREE.MathUtils.lerp(TABLET_SCREEN[1], ty, x) + Math.sin(x * Math.PI) * 3;
          return <Brick key={i} w={q.w} l={q.l} h={q.h} color={q.color} p={[px, py, pz]} r={[x * 4, x * 3, 0]} s={S * (0.5 + 0.5 * x)} />;
        })}
    </group>
  );
};

// ---------- l03: Selandia Baru brick map ----------
export const NZStation: React.FC<{ t: number }> = ({ t }) => {
  const a = pop(t, w("Uji").s);
  const b = pop(t, w("Juli").s, 0.5);
  const c = pop(t, w("Selandia").s, 0.5);
  if (a <= 0) return null;
  // North + South island as brick mosaics on a water plate
  const north: [number, number][] = [[1, -2], [2, -2], [1, -1], [2, -1], [3, -1], [2, 0], [3, 0], [3, 1], [4, -2]];
  const south: [number, number][] = [[0, 1], [-1, 1], [-1, 2], [-2, 2], [-2, 3], [-3, 3], [0, 2], [-1, 3]];
  return (
    <group position={ST.nz}>
      <group scale={Math.max(0.001, a)}>
        <Brick w={10} l={8} h={1} color={C.water} trans emissive="#0a5aa0" ei={0.25} />
        {north.map(([x, z], i) => (
          <Brick key={`n${i}`} w={1} l={1} h={i % 3 ? 3 : 1} color={i % 4 ? C.green : C.lime} p={[x + 0.5, 0.4, z + 0.5]} />
        ))}
        {south.map(([x, z], i) => (
          <Brick key={`s${i}`} w={1} l={1} h={i % 3 ? 3 : 1} color={i % 3 ? C.green : C.white} p={[x + 0.5, 0.4, z + 0.5]} />
        ))}
        {/* pin on the map */}
        <group position={[2.5, 1.6, -0.5]} scale={Math.max(0.001, c)}>
          <Brick w={1} l={1} h={6} color={C.white} studs={false} />
          <mesh position={[0, 3.0, 0]} castShadow>
            <sphereGeometry args={[0.6, 24, 16]} />
            <meshPhysicalMaterial {...POLISH.brickABS} color={C.red} />
          </mesh>
        </group>
      </group>
      <Sign
        id="nz"
        p={[0, 0, -5.5]}
        w={8}
        h={4.2}
        bg="#0b5ed7"
        appear={b}
        lines={[
          { text: "UJI COBA", size: 190, color: "#BFE6FF" },
          { text: "JULI 2026", size: 250 },
          { text: "SELANDIA BARU", size: 170, color: "#FFCA2C" },
        ]}
      />
    </group>
  );
};

// ---------- l04: ~9.000 games published (tiles pop in) ----------
export const Grid9000: React.FC<{ t: number }> = ({ t }) => {
  const t0 = w("sekitar").s;
  const t1 = w("terbit").e;
  const tiles = useMemo(() => {
    const r = prng(9000);
    return Array.from({ length: 40 }, (_, i) => ({ i, order: r(), col: MAP_COLS[Math.floor(r() * MAP_COLS.length)], col2: MAP_COLS[Math.floor(r() * MAP_COLS.length)], tall: r() < 0.5 }));
  }, []);
  const sorted = useMemo(() => [...tiles].sort((a, b) => a.order - b.order).map((x) => x.i), [tiles]);
  const out = 1 - ramp(t, w("71%").s - 0.6, w("71%").s);
  if (t < t0 - 0.2 || out <= 0.001) return null;
  return (
    <group position={ST.g9000}>
      {tiles.map((tile) => {
        const rank = sorted.indexOf(tile.i);
        const a = pop(t, t0 + ((t1 - t0) * rank) / 40, 0.35) * out;
        if (a <= 0) return null;
        const gx = (tile.i % 6) - 2.5, gz = Math.floor(tile.i / 6) - 3;
        return (
          <group key={tile.i} position={[gx * 2.3, 0, gz * 2.3 + 1]} scale={a}>
            <Brick w={2} l={2} h={1} color={C.lgrey} />
            <Brick w={1} l={2} h={tile.tall ? 3 : 1} color={tile.col} p={[-0.5, 0.4, 0]} />
            <Brick w={1} l={1} h={3} color={tile.col2} p={[0.5, 0.4, 0.5]} />
          </group>
        );
      })}
      <Sign
        id="g9000"
        p={[0, 0, -8]}
        w={10}
        h={4.4}
        bg="#198754"
        appear={pop(t, w("9.000").s, 0.5) * out}
        lines={[
          { text: "SEKITAR 9.000 GAME", size: 230 },
          { text: "SAMPAI AWAL SEPTEMBER", size: 180, color: "#D8FFE6" },
        ]}
      />
    </group>
  );
};

// ---------- l04: 71% never opened Roblox Studio (brick pie) ----------
export const Pie71: React.FC<{ t: number }> = ({ t }) => {
  const a = pop(t, w("71%").s - 0.2);
  if (a <= 0) return null;
  const grow = ramp(t, w("71%").s, w("71%").s + 0.9);
  const th = Math.PI * 2 * 0.71 * grow;
  return (
    <group position={ST.pie}>
      <group scale={Math.max(0.001, a)} position={[0, 0, 1.5]}>
        <mesh castShadow receiveShadow position={[0, 0.6, 0]} rotation={[0, Math.PI / 2 + th, 0]}>
          <cylinderGeometry args={[4, 4, 1.2, 64, 1, false, 0, Math.PI * 2 - th + 0.0001]} />
          <meshPhysicalMaterial {...POLISH.brickABS} color={C.lgrey} />
        </mesh>
        {th > 0.01 && (
          <mesh castShadow receiveShadow position={[0, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[4.1, 4.1, 2.4, 64, 1, false, 0, th]} />
            <meshPhysicalMaterial {...POLISH.brickABS} color={C.yellow} />
          </mesh>
        )}
      </group>
      <Sign
        id="pie71"
        p={[0, 0, -5]}
        w={10}
        h={5}
        bg="#d11a2a"
        appear={pop(t, w("pembuatnya").s, 0.5)}
        lines={[
          { text: "71%", size: 380, color: "#FFCA2C" },
          { text: "BELUM PERNAH MEMBUKA", size: 185 },
          { text: "ROBLOX STUDIO", size: 185 },
        ]}
      />
    </group>
  );
};

// ---------- l05: "meledak" — bricks burst off the tower top and land on the desk ----------
const TOP: V3 = [TOWER.x, 16, TOWER.z];
const BURST = (() => {
  const r = prng(555);
  return Array.from({ length: 46 }, () => {
    const a = r() * Math.PI * 2;
    const sp = 2.5 + r() * 5;
    return {
      v: [Math.cos(a) * sp, 9 + r() * 12, Math.sin(a) * sp * 0.8] as V3,
      col: MAP_COLS[Math.floor(r() * MAP_COLS.length)],
      size: [[2, 4, 3], [2, 2, 3], [1, 4, 3], [2, 3, 1]][Math.floor(r() * 4)] as [number, number, number],
      spin: [r() * 8 - 4, r() * 8 - 4, r() * 8 - 4] as V3,
      d: r() * 0.25,
    };
  });
})();
export const Burst: React.FC<{ t: number }> = ({ t }) => {
  const t0 = w("meledak").s;
  if (t < t0) return null;
  const G = 30;
  return (
    <group>
      {BURST.map((b, i) => {
        const x = Math.max(0, t - t0 - b.d);
        if (x <= 0) return null;
        // time of landing (y back to 0): solve TOP.y + vy x - G x^2/2 = 0.6
        const land = (b.v[1] + Math.sqrt(b.v[1] * b.v[1] + 2 * G * (TOP[1] - 0.6))) / G;
        const tx = Math.min(x, land);
        const y = Math.max(0.6, TOP[1] + b.v[1] * tx - (G * tx * tx) / 2);
        const pos: V3 = [TOP[0] + b.v[0] * tx, y - 0.6, TOP[2] + b.v[2] * tx];
        const rot: V3 = x < land ? [b.spin[0] * x, b.spin[1] * x, b.spin[2] * x] : [0, b.spin[1] * land, 0];
        return <Brick key={i} w={b.size[0]} l={b.size[1]} h={b.size[2]} color={b.col} p={pos} r={rot} s={0.8} />;
      })}
    </group>
  );
};

// ---------- l06: the city of mini-map towers grows ----------
const RISERS = (() => {
  const r = prng(606);
  const spots: V3[] = [
    [-34, 0, -14], [-44, 0, -22], [-30, 0, -28], [-42, 0, -38], [-24, 0, -46], [-8, 0, -50],
    [6, 0, -56], [22, 0, -52], [32, 0, -62], [-54, 0, -30], [-16, 0, -60], [44, 0, -70],
  ];
  return spots.map((p, i) => ({ p, levels: 2 + Math.floor(r() * 3), seed: 700 + i * 13, rot: r() * 1.4, d: r() }));
})();
export const Risers: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => {
  const t0 = w("Menurut").s;
  const t1 = w("70.000", 2).e;
  if (t < t0 || k < 0.01) return null;
  return (
    <group>
      {RISERS.map((rz, i) => (
        <group key={i} position={rz.p} rotation={[0, rz.rot, 0]} scale={[1, k, 1]}>
          {Array.from({ length: rz.levels }, (_, k) => {
            const a = pop(t, t0 + (t1 - t0) * (rz.d * 0.6 + (k / rz.levels) * 0.4), 0.4);
            if (a <= 0) return null;
            return (
              <group key={k} position={[0, k * 3.6, 0]}>
                <MiniMap seed={rz.seed + k} p={[0, 0, 0]} n={4} appear={a} />
                {k < rz.levels - 1 &&
                  [[-2.5, -2.5], [2.5, 2.5], [2.5, -2.5], [-2.5, 2.5]].map(([x, z], j) => (
                    <Brick key={j} w={1} l={1} h={8} color={C.lgrey} p={[x, 0.4, z]} studs={false} s={a} />
                  ))}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
};

export const Billboards: React.FC<{ t: number }> = ({ t }) => {
  const out = 1 - ramp(t, w("Dan", 4).s, w("Dan", 4).s + 0.8);
  return (
  <>
    <Sign
      id="b500"
      p={ST.bill500}
      rotY={0.15}
      w={12}
      h={5.6}
      legs={4.8}
      bg="#0b5ed7"
      appear={pop(t, w("500.000").s - 0.3, 0.55) * out}
      lines={[
        { text: "500.000+", size: 420, color: "#FFCA2C" },
        { text: "ORANG MEMAKAI BUILD", size: 190 },
      ]}
    />
    <Sign
      id="b70"
      p={ST.bill70}
      rotY={-0.15}
      w={12}
      h={5.6}
      legs={4.8}
      bg="#d11a2a"
      appear={pop(t, w("70.000", 2).s - 0.3, 0.55) * out}
      lines={[
        { text: "70.000+", size: 440, color: "#FFCA2C" },
        { text: "GAME TERBIT", size: 220 },
      ]}
    />
  </>
  );
};

// ---------- l07: daily asset uploads x3 ----------
export const Bars3x: React.FC<{ t: number }> = ({ t }) => {
  const a = pop(t, w("Unggahan").s) * (1 - ramp(t, w("Dan", 4).s, w("Dan", 4).s + 0.8));
  if (a <= 0.001) return null;
  const g0 = w("naik").s, g1 = w("lipat").e;
  const nB = 2 + Math.floor(4 * clamp01((t - g0) / (g1 - g0)) + 0.0001);
  return (
    <group position={ST.bars}>
      <group scale={Math.max(0.001, a)}>
        <Brick w={10} l={4} h={1} color={C.dgrey} />
        {[0, 1].map((k) => (
          <Brick key={k} w={2} l={2} color={C.lgrey} p={[-2.5, 0.4 + k * 1.2, 0]} />
        ))}
        {Array.from({ length: Math.min(6, nB) }, (_, k) => {
          const born = k < 2 ? 1 : pop(t, g0 + ((g1 - g0) * (k - 2)) / 4, 0.3);
          return <Brick key={k} w={2} l={2} color={C.orange} p={[2.5, 0.4 + k * 1.2 + (1 - born) * 2, 0]} s={Math.max(0.001, born)} emissive="#ff7a00" ei={0.15} />;
        })}
      </group>
      <Sign
        id="x3"
        p={[0, 0, -3.5]}
        w={8}
        h={4.2}
        legs={2.4}
        bg="#fd7e14"
        appear={pop(t, w("tiga").s - 0.2, 0.5) * (1 - ramp(t, w("Dan", 4).s, w("Dan", 4).s + 0.8))}
        lines={[
          { text: "3×", size: 420, color: "#FFFFFF" },
          { text: "UNGGAHAN ASET HARIAN", size: 185, color: "#2a1400" },
        ]}
      />
    </group>
  );
};

// ---------- l08: 80%+ of the top 100 use AI tools ----------
export const Grid100: React.FC<{ t: number }> = ({ t }) => {
  const appear = ramp(t, line("l08").start - 0.6, line("l08").words[4].s);
  const lit0 = w("80%").s;
  const order = useMemo(() => {
    const r = prng(100);
    const idx = Array.from({ length: 100 }, (_, i) => ({ i, k: r() }));
    idx.sort((a, b) => a.k - b.k);
    const rank = new Array(100).fill(0);
    idx.forEach((x, j) => (rank[x.i] = j));
    return rank;
  }, []);
  if (appear <= 0) return null;
  return (
    <group position={ST.grid100}>
      {Array.from({ length: 100 }, (_, i) => {
        const gx = (i % 10) - 4.5, gz = Math.floor(i / 10) - 4.5;
        const SP = 1.55;
        const a = pop(t, line("l08").start - 0.6 + (Math.floor(i / 10) + (i % 10)) * 0.04, 0.35);
        if (a <= 0) return null;
        const lit = order[i] < 80 ? ramp(t, lit0 + order[i] * 0.012, lit0 + order[i] * 0.012 + 0.25) : 0;
        return (
          <group key={i} position={[gx * SP, 0, gz * SP]} scale={a}>
            <Brick w={1.4} l={1.4} h={1} color={C.dgrey} studs={false} />
            <Brick w={1} l={1} h={2} color={lit > 0.5 ? "#36d6ff" : C.lgrey} p={[0, 0.4, 0]} emissive={lit > 0 ? "#22b8ff" : undefined} ei={lit * 1.6} />
          </group>
        );
      })}
      <Sign
        id="g100"
        p={[0, 0, -10.5]}
        w={12.5}
        h={5.8}
        legs={1.2}
        bg="#0e2a3a"
        appear={pop(t, w("80%").s - 0.2, 0.5)}
        lines={[
          { text: "80%+", size: 400, color: "#36d6ff" },
          { text: "DARI 100 GAME TERATAS", size: 230 },
          { text: "PAKAI ALAT AI", size: 230, color: "#FFCA2C" },
        ]}
      />
    </group>
  );
};

// ---------- l09: two AI-made games in the top 20 ----------
const Egg: React.FC = () => (
  <group>
    <Brick w={6} l={6} h={1} color={C.tan} />
    {[[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].map(([x, z], i) => (
      <Brick key={i} w={1} l={1} h={6} color={C.brown} p={[x, 0.4, z]} studs={false} />
    ))}
    <Brick w={4} l={4} h={1} color={C.yellow} p={[0, 0.4, 0]} />
    <mesh castShadow position={[0, 2.6, 0]} scale={[1.4, 1.85, 1.4]}>
      <sphereGeometry args={[1, 40, 28]} />
      <meshPhysicalMaterial {...POLISH.brickABS} color="#f6efe0" />
    </mesh>
  </group>
);
const Valley: React.FC = () => (
  <group>
    <Brick w={6} l={6} h={1} color={C.green} />
    <Brick w={6} l={3} h={3} color={C.lime} p={[0, 0.4, -1.5]} />
    <Brick w={4} l={2} h={3} color={C.green} p={[-1, 1.6, -2]} />
    <Brick w={2} l={2} h={3} color={C.lime} p={[-2, 2.8, -2]} />
    <Brick w={2} l={2} color={C.white} p={[1.5, 0.4, 1.5]} />
    <mesh castShadow position={[1.5, 2.15, 1.5]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[1.5, 1.1, 4]} />
      <meshPhysicalMaterial {...POLISH.brickABS} color={C.red} />
    </mesh>
    <Brick w={1} l={2} h={1} color={C.water} p={[-2, 0.4, 2]} trans />
  </group>
);
export const Podium: React.FC<{ t: number }> = ({ t }) => {
  const a = pop(t, w("Dua").s);
  if (a <= 0) return null;
  const e = pop(t, w("Break").s - 0.2);
  const v = pop(t, w("Huss").s - 0.2);
  const top = pop(t, w("tembus").s - 0.2, 0.5);
  const ped = (x: number, gold: number) => (
    <group position={[x, 0, 0]}>
      {[0, 1, 2].map((k) => (
        <Brick key={k} w={6} l={6} color={k === 2 ? "#e8b923" : C.white} p={[0, k * 1.2, 0]} studs={false} emissive={k === 2 ? "#c58a00" : undefined} ei={k === 2 ? 0.25 * gold : 0} />
      ))}
    </group>
  );
  return (
    <group position={ST.podium} scale={Math.max(0.001, a)}>
      {ped(-4.5, top)}
      {ped(4.5, top)}
      <group position={[-4.5, 3.6, 0]} scale={Math.max(0.001, e)}>
        <Egg />
      </group>
      <group position={[4.5, 3.6, 0]} scale={Math.max(0.001, v)}>
        <Valley />
      </group>
      <Sign id="egg" p={[-4.6, 0, -3.4]} w={7} h={2.6} legs={8.4} bg="#25282c" appear={e} lines={[{ text: "Break and Steal", size: 230, weight: 800 }, { text: "an Egg", size: 230, weight: 800, color: "#FFCA2C" }]} />
      <Sign id="huss" p={[4.6, 0, -3.4]} w={7} h={2.6} legs={8.4} bg="#25282c" appear={v} lines={[{ text: "Huss", size: 230, weight: 800 }, { text: "Valley", size: 230, weight: 800, color: "#FFCA2C" }]} />
      <Sign id="top20" p={[0, 0, -6]} w={8} h={3.4} legs={12} bg="#e8b923" appear={top} lines={[{ text: "20 BESAR", size: 330, color: "#2a1a00" }]} />
    </group>
  );
};

// ---------- l10: failed output 18% -> 3% ----------
const CROOKED = (() => {
  const r = prng(1803);
  return Array.from({ length: 18 }, (_, i) => ({
    gx: (i % 6) - 2.5,
    gz: Math.floor(i / 6) - 1,
    tilt: [(r() - 0.5) * 0.9, r() * 1.2, (r() - 0.5) * 0.9] as V3,
    keep: i === 4 || i === 9 || i === 14,
    d: r(),
  }));
})();
export const Meleset: React.FC<{ t: number }> = ({ t }) => {
  const a = pop(t, w("Hasil").s);
  if (a <= 0) return null;
  const g0 = w("turun").s, g1 = w("3%").s;
  return (
    <group position={ST.meleset}>
      <group scale={Math.max(0.001, a)}>
        <Brick w={14} l={8} h={1} color={C.tan} />
        {CROOKED.map((b, i) => {
          const k = b.keep ? 0 : ramp(t, g0 + (g1 - g0) * b.d * 0.7, g0 + (g1 - g0) * (b.d * 0.7 + 0.3));
          if (k >= 0.999) return null;
          const fix = b.keep ? ramp(t, g1, g1 + 0.6) : 0;
          return (
            <Brick
              key={i}
              w={2}
              l={1}
              color={b.keep ? (fix > 0.5 ? C.green : C.red) : C.red}
              p={[b.gx * 2.2, 0.4 + k * 6, b.gz * 2.3]}
              r={[b.tilt[0] * (1 - fix) + k * 3, b.tilt[1] * (1 - fix), b.tilt[2] * (1 - fix)]}
              s={Math.max(0.001, 1 - k)}
            />
          );
        })}
      </group>
      <Sign
        id="m18"
        p={[0, 0, -5.5]}
        w={9}
        h={4}
        bg="#25282c"
        appear={pop(t, w("meleset").s - 0.2, 0.5)}
        lines={[
          { text: "HASIL MELESET", size: 200, color: "#ff8a80" },
          { text: "18% → 3%", size: 330, color: "#FFFFFF" },
        ]}
      />
    </group>
  );
};

// ---------- payoff: clones of a viral game, the original not even released ----------
const CLONE_SPOTS: V3[] = [
  [50, 0, -38], [70, 0, -38], [42, 0, -30], [78, 0, -30], [50, 0, -22], [70, 0, -22],
  [42, 0, -46], [60, 0, -46], [78, 0, -46], [34, 0, -38], [86, 0, -38], [34, 0, -22], [86, 0, -22],
];
export const CloneField: React.FC<{ t: number }> = ({ t }) => {
  const a0 = pop(t, w("gelapnya").s - 0.3, 0.6);
  if (a0 <= 0) return null;
  const first = w("menjiplak").s;
  const b0 = w("bermunculan").s, b1 = w("rilis").s;
  const tag = signTexture("klon", 256, 96, "#d11a2a", [{ text: "KLON", size: 74 }]);
  return (
    <group>
      {/* the original: scaffolding, half built */}
      <group position={ST.original}>
        <MiniMap seed={501} n={8} p={[0, 0, 0]} s={1.4} built={0.45} appear={a0} />
        {[[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]} scale={Math.max(0.001, a0)}>
            {[0, 1, 2, 3].map((k) => (
              <Brick key={k} w={1} l={1} color={k % 2 ? C.black : C.yellow} p={[0, k * 1.2, 0]} studs={false} />
            ))}
          </group>
        ))}
        <Sign id="asli" p={[0, 0, -5.5]} w={8} h={2.8} legs={4.8} bg="#ffca2c" appear={pop(t, w("aslinya").s - 0.4, 0.5)} lines={[{ text: "ASLI: BELUM RILIS", size: 210, color: "#2a1a00" }]} />
      </group>
      {CLONE_SPOTS.map((p, i) => {
        const ta = i === 0 ? first : b0 + ((b1 - b0) * (i - 1)) / (CLONE_SPOTS.length - 1);
        const a = pop(t, ta, 0.4);
        if (a <= 0) return null;
        return (
          <group key={i}>
            <MiniMap seed={501} n={8} p={p} s={1.25} appear={a} gray={0.15} />
            <mesh position={[p[0], 0.6, p[2] + 3.95]} scale={a}>
              <planeGeometry args={[2.4, 0.9]} />
              <meshStandardMaterial map={tag} emissiveMap={tag} emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** The one different map (l13), lit by its own spotlight. */
export const UniqueMap: React.FC<{ t: number }> = ({ t }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  const a = pop(t, w("Sekarang").s, 0.5);
  if (a <= 0) return null;
  const built = ramp(t, w("Sekarang").s, w("beda").s);
  const glow = ramp(t, w("beda").s - 0.3, w("beda").e + 0.3);
  return (
    <group>
      <group position={ST.unique}>
        <MiniMap seed={777} n={11} plate={C.purple} p={[0, 0, 0]} s={1.25} built={built} appear={a} />
        <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={a}>
          <ringGeometry args={[5.2, 5.8, 64]} />
          <meshBasicMaterial color={new THREE.Color(2.4, 2.0, 0.6)} transparent opacity={glow} toneMapped={false} />
        </mesh>
        <Sign id="beda" p={[-3.6, 0, 4.4]} w={3.6} h={1.6} legs={1.2} bg="#ffca2c" appear={pop(t, w("beda").s, 0.5)} lines={[{ text: "BEDA", size: 260, color: "#2a1a00" }]} />
      </group>
      <primitive object={target} position={ST.unique} />
      <spotLight position={[ST.unique[0] + 4, 22, ST.unique[2] + 8]} target={target} angle={0.35} penumbra={0.6} intensity={900 * glow} distance={60} decay={2} color="#ffe2a8" castShadow={false} />
    </group>
  );
};

// ---------- l06: "surat investor Roblox kuartal ketiga" ----------
export const LetterBoard: React.FC<{ t: number }> = ({ t }) => {
  const a = pop(t, w("surat").s - 0.2, 0.5) * (1 - ramp(t, w("lebih", 2).s - 0.2, w("lebih", 2).s + 0.3));
  return (
    <Sign
      id="letter"
      p={[-5.5, 0, 11]}
      rotY={0.28}
      w={11}
      h={5.2}
      legs={8.4}
      bg="#f2f2ee"
      frame={C.blue}
      appear={a}
      lines={[
        { text: "✉ SURAT INVESTOR", size: 300, color: "#0b5ed7" },
        { text: "ROBLOX", size: 300, color: "#25282c" },
        { text: "KUARTAL KETIGA", size: 230, color: "#d11a2a" },
      ]}
    />
  );
};
