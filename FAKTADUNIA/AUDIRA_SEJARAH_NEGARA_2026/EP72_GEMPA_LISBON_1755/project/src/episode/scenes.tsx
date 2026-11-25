// EP72 Gempa Lisbon 1755 — scenes S1–S11 (MOSAICFORGE). Positions match the camera keys in timeline.ts.
// t = film seconds, f = 60 fps clock. Azulejo floors: tile local (x, y) -> world (x, -y); tile dz = world up.
import React, { useMemo } from "react";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import {
  C,
  mixC,
  Azulejo,
  type TileInfo,
  type TileFx,
  paintHouse,
  paintWave,
  paintFlame,
  paintFloor,
  paintIberia,
  paintPortugal,
  ibXZ,
  ptXZ,
  LISBON,
  EPICENTER,
  PARISHES,
  Plaque,
  Figure,
  Flame,
  Smoke,
  Candle,
  Haze,
  Ground,
  Beam,
  woodMat,
  stoneMat,
  plainMat,
  BOX,
  CYL,
  SPH,
  clamp01,
  smooth,
  dropCurve,
  mulberry32,
} from "./parts.tsx";
import type { SceneId, V3 } from "./timeline.ts";

type SP = { t: number; f: number };
const gauss = (x: number, w: number) => Math.exp(-(x * x) / (w * w));

// ======================================================== S1 hook: three azulejo panels crack
const P1 = paintHouse(24, 40);
const P2 = paintWave(24, 40);
const P3 = paintFlame(24, 40);
const zig = (v: number, seed: number) => 0.5 + 0.13 * Math.sin(v * 17 + seed) + 0.06 * Math.sin(v * 41 + seed * 3);
const crackFx = (tc: number, seed: number) => (tl: TileInfo, t: number): TileFx => {
  if (t < tc) {
    // foreshock from 1.0 s: the panel rattles, a few loose tiles drop before the crack
    if (t < 1.0) return null;
    const rattle = Math.sin(t * 47 + tl.seed * 40) * 0.01 * clamp01((t - 1.0) / 0.5);
    if (tl.seed < 0.06) {
      const k = t - (1.2 + tl.seed * 30) * (tc / 4.3);
      if (k > 0) return k * k * 5 > 2.6 ? { s: 0 } : { dy: -k * k * 5, dz: 0.1 + k * 0.5, rx: k * 3 };
    }
    return { rx: rattle, rz: rattle * 0.5 };
  }
  const d = Math.abs(tl.u - zig(tl.v, seed));
  const front = (t - tc) * 3.2; // crack runs top -> bottom
  if (1 - tl.v > front) return null;
  if (d < 0.05) {
    const k = t - tc - (1 - tl.v) / 3.2 - tl.seed * 0.15;
    if (k <= 0) return { rx: 0.25, dz: 0.02 };
    const fall = k * k * 5;
    return fall > 2.6 ? { s: 0 } : { dy: -fall, dz: 0.15 + k * 0.6, rx: 0.4 + k * 3, rz: (tl.seed - 0.5) * k * 4 };
  }
  if (d < 0.11) return { rx: 0.12 * (0.11 - d) * 20, ry: (tl.seed - 0.5) * 0.2, dz: 0.012 };
  return null;
};
const S1_CITY: { id: string; p: V3; r: number }[] = [
  { id: "two-story-house-40f6dc", p: [-1.7, 0, 0.95], r: 0.5 },
  { id: "brick-tenement-7d2014", p: [-0.65, 0, 0.75], r: 0.35 },
  { id: "corner-tenement-92fb62", p: [0.4, 0, 0.95], r: 0.6 },
];
const FX1 = crackFx(4.3, 1);
const FX2 = crackFx(5.4, 2);
const FX3 = crackFx(6.3, 3);

const S1: React.FC<SP> = ({ t }) => (
  <group>
    <mesh position={[0, 2.0, -0.04]} material={stoneMat(C.cream, 3)} receiveShadow>
      <planeGeometry args={[9, 5]} />
    </mesh>
    <Azulejo cols={24} rows={40} pitch={0.075} paint={P1} t={t} fx={FX1} seed={1} position={[-2.1, 0.3, 0]} />
    <Azulejo cols={24} rows={40} pitch={0.075} paint={P2} t={t} fx={FX2} seed={2} position={[0, 0.3, 0]} />
    <Azulejo cols={24} rows={40} pitch={0.075} paint={P3} t={t} fx={FX3} seed={3} position={[2.1, 0.3, 0]} />
    <Plaque text="AUDIRA" w={0.5} h={0.16} position={[-1.55, 0.2, 0.08]} />
    {/* miniature Lisbon in front of the murals, rattling from the 1.0 s foreshock */}
    {S1_CITY.map((h, i) => {
      const q = t > 1.0 ? Math.sin(t * 41 + i * 2.1) * 0.03 * clamp01((t - 1.0) / 0.4) : 0;
      return (
        <group key={i} position={h.p} rotation={[q * 0.5, h.r, q]}>
          <AssetModel id={h.id} assetType="building" size={1.0} ground roughness={0.9} />
        </group>
      );
    })}
    <Azulejo cols={30} rows={12} pitch={0.3} paint={paintFloor} t={t} floor seed={4} position={[0, 0, 1.8]} />
  </group>
);

// ======================================================== S2 feast day: church, candles, worshippers
const S2_WALKERS = Array.from({ length: 8 }, (_, i) => {
  const r = mulberry32(200 + i);
  return { x: (r() - 0.5) * 1.8, z0: 4.2 + r() * 1.6, at: 7 + i * 0.55, v: 0.55 + r() * 0.2, seed: 20 + i };
});
const S2: React.FC<SP> = ({ t, f }) => {
  const quake = t > 16.5 ? Math.sin(t * 38) * 0.06 * clamp01((t - 16.5) / 0.3) : 0;
  return (
    <group>
      <Ground color={C.stone} size={40} />
      <Azulejo cols={26} rows={40} pitch={0.3} paint={paintFloor} t={t} floor seed={5} position={[0, 0.005, 0.5]} />
      <AssetModel id="brick-church-322885" assetType="building" size={4.5} ground position={[0, 0, -4]} roughness={0.9} />
      {[-1.3, 1.3].flatMap((x) =>
        [0, 1.5, 3].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]} rotation={[0, 0, quake * (x > 0 ? 1 : -1)]}>
            <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={0.45} ground />
            <Flame t={t} position={[0, 0.3, 0]} size={0.07} seed={x * 3 + z} />
          </group>
        )),
      )}
      {/* foreground candle stand (close-up at 12.4) */}
      <group position={[-1.0, 0, 2.6]} rotation={[0, 0, quake]}>
        <mesh geometry={BOX} material={woodMat(C.woodDark)} position={[0, 0.2, 0]} scale={[0.6, 0.4, 0.4]} castShadow receiveShadow />
        {[-0.2, -0.08, 0.04, 0.16, -0.14, 0.1].map((x, i) => (
          <Candle key={i} t={t} position={[x, 0.4, i < 4 ? 0.05 : -0.1]} h={0.12 + (i % 3) * 0.06} r={0.025} seed={i + 2} />
        ))}
      </group>
      {S2_WALKERS.map((w, i) => {
        const z = Math.max(-1.5, w.z0 - Math.max(0, t - w.at) * w.v);
        const walking = t > w.at && z > -1.5;
        return <Figure key={i} f={f} seed={w.seed} pose={walking ? "walk" : "stand"} position={[w.x + (t > 16.5 ? Math.sin(t * 31 + i) * 0.02 : 0), 0, z]} heading={Math.PI} scale={0.62} />;
      })}
      <Haze color="#E9D2B0" z={-8} opacity={0.35} />
    </group>
  );
};

// ======================================================== S3 shaking: Iberia azulejo map + rings
const EPI = ibXZ(EPICENTER);
const LIS = ibXZ(LISBON);
const ringFx = (tl: TileInfo, t: number): TileFx => {
  if (t < 17.7) return null;
  const x = tl.x;
  const z = -tl.y;
  const d = Math.hypot(x - EPI[0], z - EPI[1]);
  let h = 0;
  for (let k = 0; k < 4; k++) {
    const r = (t - 17.7 - k * 0.9) * 1.25;
    if (r > 0) h += gauss(d - r, 0.12) * Math.max(0, 1 - r / 6);
  }
  const jitter = t < 21.4 ? Math.sin(t * 40 + tl.seed * 30) * 0.008 : 0;
  return h + jitter === 0 ? null : { dz: h * 0.09 + jitter, rx: h * 0.25 * Math.sin(tl.seed * 6), white: h * 0.55 };
};
const S3: React.FC<SP> = ({ t }) => {
  const pulse = 1 + 0.25 * Math.sin(t * 6);
  return (
    <group>
      <Ground color={C.stoneDark} size={40} y={-0.01} />
      <Azulejo cols={50} rows={48} pitch={0.1} paint={paintIberia} t={t} fx={ringFx} dynamicColor floor seed={6} position={[0, 0, 0]} />
      {/* epicentre marker */}
      <group position={[EPI[0], 0.06, EPI[1]]}>
        <mesh geometry={CYL} material={plainMat(C.terra, 0.5)} scale={[0.09 * pulse, 0.05, 0.09 * pulse]} castShadow />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <torusGeometry args={[0.18 * pulse, 0.015, 8, 40]} />
          <meshStandardMaterial color={C.terra} roughness={0.5} />
        </mesh>
      </group>
      {/* Lisbon pin + plaque */}
      <group position={[LIS[0], 0, LIS[1]]}>
        <mesh geometry={CYL} material={plainMat(C.cobaltDeep, 0.5)} position={[0, 0.18, 0]} scale={[0.012, 0.36, 0.012]} castShadow />
        <mesh geometry={SPH} material={plainMat(C.terra, 0.45)} position={[0, 0.38, 0]} scale={0.05} castShadow />
        <Plaque text="LISBON" w={0.62} h={0.2} position={[0.05, 0.62, 0]} rotation={[-0.55, 0, 0]} />
      </group>
    </group>
  );
};

// ======================================================== S4 + S5 harbour: sea withdraws, tsunami returns
const paintSea = (u: number, v: number, i: number, j: number) => {
  const band = Math.floor(v * 40 + Math.sin(u * 9) * 1.5) % 4;
  return band === 0 ? C.cobaltLight : band === 2 ? C.cobaltDeep : (i + j) % 5 === 0 ? C.sky : C.cobalt;
};
const SEA_Z = -6; // sea floor-grid centre (12 × 12, z 0 .. -12)
const seaFx = (tl: TileInfo, t: number): TileFx => {
  const z = SEA_Z - tl.y; // world z of the tile
  const calm = 0.025 * Math.sin(t * 2.2 + tl.x * 1.3 + z * 0.9);
  if (t < 28.2) return { dz: calm };
  // withdrawal 28.2 -> 31.6: water line runs from the quay out to sea
  const front = -((t - 28.2) / 3.4) * 10.5;
  if (t < 31.6) {
    if (z > front) {
      const k = clamp01((z - front) / 1.2);
      return k >= 1 ? { s: 0 } : { dz: -0.7 * k, s: 1 - k * 0.5 };
    }
    return { dz: calm - 0.15 * gauss(z - front, 0.8) };
  }
  // tsunami: wave 1 crest arrives at the quay (z 0) at 35.0, wave 2 at 36.5
  const zc1 = -14 + ((t - 31.6) / 3.4) * 14;
  const zc2 = t > 35.4 ? -12 + ((t - 35.4) / 1.1) * 12 : -99;
  const ahead = z > zc1 + 0.5;
  if (ahead && zc1 < 0) return { s: 0 }; // still dry ahead of the first wave
  const h1 = 2.1 * gauss(z - zc1, 1.0) * (zc1 > 0.6 ? 0.4 : 1);
  const h2 = 1.0 * gauss(z - zc2, 0.8);
  const h = h1 + h2;
  const body = 0.25 + calm;
  return { dz: body + h, rx: -0.6 * h * Math.sign(z - zc1), white: clamp01(h * 0.8 - 0.2), dark: 0 };
};

const S_HARBOR: React.FC<SP> = ({ t, f }) => {
  const run = t > 34.0;
  const crowd = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: -2.2 + i * 0.85 + (i % 2) * 0.2, z: 0.7 + (i % 3) * 0.55, seed: 40 + i })), []);
  return (
    <group>
      {/* quay */}
      <mesh position={[0, 0.0, 1.6]} material={stoneMat(C.stone, 4)} castShadow receiveShadow>
        <boxGeometry args={[14, 0.8, 3.2]} />
      </mesh>
      {[-2.6, 0.4, 3.2].map((x, i) => (
        <AssetModel key={i} id="dock-lantern-post-5e58a4" assetType="prop" size={1.1} ground position={[x, 0.4, 0.25]} />
      ))}
      {crowd.map((c, i) => {
        const zz = run ? c.z + (t - 34.0) * 1.1 : c.z;
        return <Figure key={i} f={f} seed={c.seed} pose={run ? "run" : t > 28.2 ? "point" : "stand"} position={[c.x, 0.4, zz]} heading={run ? 0 : Math.PI} scale={0.6} />;
      })}
      {/* harbour bed revealed when the sea withdraws */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, -6]} material={stoneMat(mixC(C.mud, C.stone, 0.45), 5)} receiveShadow>
        <planeGeometry args={[16, 14]} />
      </mesh>
      <AssetModel id="ship-s-longboat-f159fd" assetType="vehicle" size={1.6} ground position={[1.5, -0.4, -4.5]} rotation={[0.08, 0.6, 0.18]} />
      <AssetModel id="ship-anchor-c2b4f1" assetType="prop" size={0.5} ground position={[0.2, -0.4, -3]} rotation={[0, 0.4, 1.2]} />
      {[[-1.6, -2.4], [2.6, -2.0], [-0.6, -5.4], [3.4, -6.4]].map(([x, z], i) => (
        <mesh key={i} geometry={SPH} material={stoneMat(C.stoneDark, 1)} position={[x, -0.36, z]} scale={[0.25, 0.1, 0.2]} castShadow />
      ))}
      {/* the sea: one azulejo floor of loose tiles */}
      <Azulejo cols={40} rows={40} pitch={0.3} paint={paintSea} t={t} fx={seaFx} dynamicColor floor grout={false} seed={7} position={[0, 0.3, SEA_Z]} />
      <Haze color="#C8D6E6" z={-14} opacity={0.4} />
    </group>
  );
};

// ======================================================== S6 + S7 city: fire, then ruins
const HOUSES: { id: string; p: V3; r: number }[] = [-2.4, 0, 2.4].flatMap((x, a) =>
  [-2.4, 0, 2.4].map((z, b) => ({
    id: ["two-story-house-40f6dc", "brick-tenement-7d2014", "corner-tenement-92fb62"][(a + b) % 3],
    p: [x, 0, z] as V3,
    r: ((a * 3 + b) % 4) * (Math.PI / 2),
  })),
);
const LANTERN: V3 = [0.7, 0, 3.6];
const FIRE_ORDER = HOUSES.map((h, i) => ({ i, d: Math.hypot(h.p[0] - LANTERN[0], h.p[2] - LANTERN[2]) })).sort((a, b) => a.d - b.d);
const fireAt = (i: number) => 39.3 + FIRE_ORDER.findIndex((o) => o.i === i) * 0.12;
const SINK = HOUSES.map((_, i) => {
  const r = mulberry32(300 + i);
  return { keep: i === 4, dy: 0.5 + r() * 0.5, rz: (r() - 0.5) * 0.5, rx: (r() - 0.5) * 0.4, at: 45.2 + r() * 1.5 };
});

const City: React.FC<SP & { ruin: boolean }> = ({ t, ruin }) => {
  const lanternFall = smooth(38.2, 38.8, t);
  return (
    <group>
      <Ground color={ruin ? "#7A6C5E" : C.stone} size={40} />
      {HOUSES.map((h, i) => {
        const s = SINK[i];
        const k = ruin && !s.keep ? smooth(s.at, s.at + 0.9, t) : 0;
        return (
          <group key={i} position={[h.p[0], -s.dy * k, h.p[2]]} rotation={[s.rx * k, h.r, s.rz * k]}>
            <AssetModel id={h.id} assetType="building" size={1.7} ground tint={ruin ? "#3A302A" : undefined} roughness={0.9} />
            {!ruin ? <Flame t={t} position={[0, 1.15, 0]} size={1.05} seed={i} s={smooth(fireAt(i), fireAt(i) + 0.5, t)} /> : null}
            {!ruin && t > fireAt(i) ? <Smoke t={t} origin={[0, 1.4, 0]} seed={i} size={0.32} rise={2.6} from={fireAt(i)} /> : null}
            {ruin ? <Smoke t={t} origin={[0, 0.6, 0]} seed={i + 9} size={0.22} rise={1.6} from={44} color="#4A423C" /> : null}
          </group>
        );
      })}
      {/* palace + library */}
      <group position={[0, ruin ? -0.6 * smooth(45.6, 46.8, t) : 0, -5]} rotation={[0, 0, ruin ? 0.06 * smooth(45.6, 46.8, t) : 0]}>
        <AssetModel id="classical-bank-04954e" assetType="building" size={4} ground tint={ruin ? "#3A302A" : "#E6D6B8"} roughness={0.85} />
        {!ruin
          ? [-1.2, 0, 1.2].map((x, i) => <Flame key={i} t={t} position={[x, 1.9, 0.3]} size={0.9} seed={20 + i} s={smooth(42.7 + i * 0.2, 43.2 + i * 0.2, t)} />)
          : null}
        {!ruin && t > 42.7 ? <Smoke t={t} origin={[0, 2.2, 0]} seed={31} size={0.5} rise={3.2} from={42.7} /> : null}
      </group>
      {/* the 70,000 volumes: pages lifting off the palace */}
      {!ruin && t > 42.7
        ? Array.from({ length: 16 }, (_, i) => {
            const r = mulberry32(500 + i);
            const k = ((t - 42.7 - i * 0.12) * 0.45 + r() * 0.3) % 1.4;
            if (k < 0) return null;
            return (
              <mesh key={i} position={[(r() - 0.5) * 3 + k * 0.6, 2.2 + k * 2.4, -5 + (r() - 0.5) * 1.4 + k * 1.2]} rotation={[k * 5 + i, k * 3, i]} material={plainMat("#F0E4C8", 0.8)}>
                <planeGeometry args={[0.16, 0.22]} />
              </mesh>
            );
          })
        : null}
      {/* the toppled feast lantern that starts the fire */}
      {!ruin ? (
        <group position={LANTERN}>
          <group rotation={[0, 0, (Math.PI / 2) * lanternFall]} position={[0.18 * lanternFall, 0, 0]}>
            <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={0.5} ground />
          </group>
          <Flame t={t} position={[0.35, 0, 0]} size={0.12 + 0.35 * smooth(38.8, 39.9, t)} seed={77} s={smooth(38.5, 38.9, t)} />
        </group>
      ) : null}
      {ruin
        ? Array.from({ length: 13 }, (_, i) => <Candle key={i} t={t} position={[-1.5 + i * 0.25, 0, 4.2 + (i % 2) * 0.12]} h={0.1 + (i % 3) * 0.04} r={0.03} seed={60 + i} />)
        : null}
      <Haze color={ruin ? "#8E8478" : "#E29A5E"} z={-9} opacity={0.4} />
    </group>
  );
};
const S6: React.FC<SP> = (p) => <City {...p} ruin={false} />;
const S7: React.FC<SP> = (p) => <City {...p} ruin />;

// ======================================================== S8 Pombal: plan of the new Baixa laid tile by tile
const paintRubble = (u: number, v: number, i: number, j: number) => {
  const r = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
  const k = r - Math.floor(r);
  return k < 0.35 ? C.stone : k < 0.6 ? C.stoneDark : k < 0.8 ? mixC(C.terra, C.stoneDark, 0.5) : C.cream;
};
const paintBaixa = (u: number, v: number, i: number, j: number) => {
  const street = i % 7 === 3 || j % 5 === 2;
  if (street) return C.glaze;
  if (i < 2 || i > 37 || j < 2 || j > 37) return C.cobaltDeep;
  return (i + j) % 2 ? C.cobalt : C.cobaltLight;
};
const baixaFx = (tl: TileInfo, t: number): TileFx => {
  const delay = 56.8 + (tl.j / 40) * 1.7 + (tl.i / 40) * 0.5 + tl.seed * 0.2;
  const k = (t - delay) / 0.6;
  if (k <= 0) return { s: 0 };
  return k >= 1 ? null : { dz: dropCurve(k) * 2.2 };
};
const S8: React.FC<SP> = ({ t, f }) => {
  const rubble = useMemo(() => {
    const r = mulberry32(88);
    return Array.from({ length: 26 }, () => ({ p: [(r() - 0.5) * 4.4, 0.05, (r() - 0.5) * 4.4] as V3, s: [0.12 + r() * 0.2, 0.06 + r() * 0.12, 0.1 + r() * 0.2] as V3, ry: r() * 3 }));
  }, []);
  const clear = smooth(56.6, 57.4, t);
  return (
    <group>
      <Ground color={C.stoneDark} size={40} y={-0.01} />
      <Azulejo cols={40} rows={40} pitch={0.12} paint={paintRubble} t={t} floor seed={8} />
      <Azulejo cols={40} rows={40} pitch={0.12} paint={paintBaixa} t={t} fx={baixaFx} floor grout={false} seed={9} position={[0, 0.035, 0]} />
      {rubble.map((b, i) => (
        <mesh key={i} geometry={BOX} material={stoneMat(i % 3 ? C.stone : C.terraDark, 1)} position={[b.p[0], b.p[1] - clear * 0.4, b.p[2]]} scale={b.s} rotation={[0.3, b.ry, 0.2]} castShadow />
      ))}
      {/* Pombal on the rubble mound, holding the plan */}
      <mesh geometry={SPH} material={stoneMat(C.stone, 1)} position={[-0.8, 0.0, 1.2]} scale={[0.6, 0.28, 0.5]} castShadow receiveShadow />
      <Figure
        f={f}
        seed={81}
        pose={t > 57.7 ? "point" : "stand"}
        position={[-0.8, 0.26, 1.2]}
        heading={-0.5}
        scale={0.75}
        robe="#3E4A6A"
        cloth="#E8DCC6"
        rightHand={<mesh geometry={CYL} material={plainMat("#EADCC0", 0.7)} rotation={[0, 0, Math.PI / 2]} scale={[0.03, 0.2, 0.03]} />}
      />
      <AssetModel id="village-well-f8e361" assetType="prop" size={0.7} ground position={[1.3, 0, 1.6]} />
      {[[0.6, 0.9], [-1.6, -0.2], [1.8, -0.6]].map(([x, z], i) => (
        <Figure key={i} f={f} seed={90 + i} pose={i === 0 ? "carry" : "crouch"} position={[x, 0, z]} heading={i * 2} scale={0.6} />
      ))}
      <Haze color="#CFC2AE" z={-6} opacity={0.35} />
    </group>
  );
};

// ======================================================== S9 gaiola: timber cage assembled, then the marching test
const GW = 0.8, GH = 2.4;
const GAIOLA: { a: V3; b: V3; w: number }[] = (() => {
  const out: { a: V3; b: V3; w: number }[] = [];
  const cs: [number, number][] = [[-GW, -GW], [GW, -GW], [GW, GW], [-GW, GW]];
  cs.forEach(([x, z]) => out.push({ a: [x, 0, z], b: [x, GH, z], w: 0.09 }));
  [0.05, 0.8, 1.6, GH].forEach((y) => cs.forEach(([x, z], i) => {
    const [x2, z2] = cs[(i + 1) % 4];
    out.push({ a: [x, y, z], b: [x2, y, z2], w: 0.075 });
  }));
  // Saint Andrew's crosses in every face panel
  [[0.05, 0.8], [0.8, 1.6], [1.6, GH]].forEach(([y0, y1]) => cs.forEach(([x, z], i) => {
    const [x2, z2] = cs[(i + 1) % 4];
    out.push({ a: [x, y0, z], b: [x2, y1, z2], w: 0.05 });
    out.push({ a: [x2, y0, z2], b: [x, y1, z], w: 0.05 });
  }));
  return out;
})();
const S9: React.FC<SP> = ({ t, f }) => {
  const sway = t > 63.7 ? 0.018 * Math.sin(t * 9) * clamp01((t - 63.7) / 0.5) : 0;
  const stomp = t > 63.7;
  return (
    <group>
      <Ground color={C.stone} size={40} />
      <AssetModel id="timber-barn-90b3ce" assetType="building" size={3.2} ground position={[0, 0, -6]} roughness={0.9} />
      <group rotation={[0, 0, sway]}>
        {GAIOLA.map((g, i) => (
          <Beam key={i} a={g.a} b={g.b} w={g.w} color={i < 4 ? C.woodDark : C.wood} k={smooth(59.7 + i * 0.075, 60.1 + i * 0.075, t)} />
        ))}
        {/* plaster infill on the back face */}
        <mesh position={[0, 0.8, -GW - 0.02]} material={plainMat(C.cream, 0.95)} scale={[1.6 * smooth(62.4, 63.4, t) + 0.001, 1.6, 1]} receiveShadow>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </group>
      {stomp
        ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + (t - 63.7) * 0.35;
            const x = Math.cos(a) * 2.4;
            const z = Math.sin(a) * 2.4;
            return <Figure key={i} f={f * 1.3} seed={110 + i} pose="walk" outfit="uniform" robe="#2F3D63" cloth="#22283A" position={[x, 0, z]} heading={-a} scale={0.85} />;
          })
        : null}
      {stomp ? [0, 1, 2, 3].map((i) => <Smoke key={i} t={t} origin={[Math.cos(i * 1.6) * 2.4, 0, Math.sin(i * 1.6) * 2.4]} seed={120 + i} size={0.25} rise={0.6} from={63.7} color="#C9B89C" />) : null}
      <Haze color="#E6D6BC" z={-9} opacity={0.35} />
    </group>
  );
};

// ======================================================== S10 questionnaire: letters fly to every parish
const DESK: V3 = [2.6, 0.72, 2.6];
const S10: React.FC<SP> = ({ t }) => (
  <group>
    <Ground color={C.stoneDark} size={40} y={-0.01} />
    <Azulejo cols={32} rows={48} pitch={0.12} paint={paintPortugal} t={t} floor seed={10} />
    {/* desk */}
    <group position={[DESK[0], 0, DESK[2]]}>
      <mesh geometry={BOX} material={woodMat(C.woodDark)} position={[0, 0.7, 0]} scale={[1.2, 0.06, 0.7]} castShadow receiveShadow />
      {[[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].map(([x, z], i) => (
        <Beam key={i} a={[x, 0, z]} b={[x, 0.68, z]} w={0.06} color={C.woodDark} />
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.2 + i * 0.03, 0.735 + i * 0.006, 0.05]} rotation={[-Math.PI / 2, 0, 0.2 * i]} material={plainMat("#F0E4C8", 0.8)}>
          <planeGeometry args={[0.24, 0.17]} />
        </mesh>
      ))}
      <Candle t={t} position={[0.4, 0.73, -0.15]} h={0.14} r={0.03} seed={5} />
    </group>
    {PARISHES.map((p, i) => {
      const [x, z] = ptXZ(p);
      const t0 = 70.5 + i * 0.3;
      const k = clamp01((t - t0) / 1.1);
      const arrived = smooth(t0 + 1.05, t0 + 1.35, t);
      const lx = DESK[0] + (x - DESK[0]) * k;
      const lz = DESK[2] + (z - DESK[2]) * k;
      const ly = DESK[1] + (0.06 - DESK[1]) * k + Math.sin(k * Math.PI) * 1.1;
      return (
        <group key={i}>
          {k > 0 && k < 1 ? (
            <group position={[lx, ly, lz]} rotation={[-0.4, k * 2, 0.3 * Math.sin(k * 6)]}>
              <mesh material={plainMat("#F0E4C8", 0.8)}>
                <planeGeometry args={[0.2, 0.14]} />
              </mesh>
              <mesh geometry={CYL} material={plainMat(C.cobalt, 0.4)} position={[0, 0, 0.006]} rotation={[Math.PI / 2, 0, 0]} scale={[0.025, 0.008, 0.025]} />
            </group>
          ) : null}
          {arrived > 0 ? (
            <group position={[x, 0, z]} scale={arrived}>
              <mesh geometry={CYL} material={plainMat(C.cobaltDeep, 0.5)} position={[0, 0.1, 0]} scale={[0.01, 0.2, 0.01]} />
              <mesh geometry={SPH} material={plainMat(C.terra, 0.45)} position={[0, 0.22, 0]} scale={0.045} castShadow />
            </group>
          ) : null}
        </group>
      );
    })}
  </group>
);

// ======================================================== S11 payoff: Pombaline Baixa, tiles settle on gaiola frames
const paintFacade = (u: number, v: number, i: number, j: number) => {
  if (j < 3) return (i + j) % 2 ? C.ochre : C.glazeWarm; // shop arcade band
  if (j === 3 || j === 23) return C.cobalt;
  const wi = i % 5, wj = (j - 4) % 5;
  const frame = (wi === 1 || wi === 3) && wj >= 1 && wj <= 3;
  const glass = wi === 2 && wj >= 1 && wj <= 3;
  if (glass) return C.cobaltDeep;
  if (frame || (wi >= 1 && wi <= 3 && (wj === 0 || wj === 4) && wj !== 4)) return C.cobaltLight;
  return (i * 7 + j * 3) % 11 === 0 ? C.glaze : C.glazeWarm;
};
const FACADES: { side: -1 | 1; z: number; n: number }[] = [-1, 1].flatMap((side) => [3, 0, -3, -6].map((z, n) => ({ side: side as -1 | 1, z, n })));
const facadeFx = (n: number) => (tl: TileInfo, t: number): TileFx => {
  const delay = 76.6 + n * 0.1 + (tl.j / 24) * 0.7 + tl.seed * 0.2;
  const k = (t - delay) / 0.8;
  if (k <= 0) return { s: 0 };
  return k >= 1 ? null : { dy: dropCurve(k) * 2.4 };
};
const FFX = FACADES.map((fc) => facadeFx(fc.n + (fc.side > 0 ? 2 : 0)));
const S11: React.FC<SP> = ({ t, f }) => (
  <group>
    <Ground color={C.stone} size={40} />
    <Azulejo cols={10} rows={44} pitch={0.3} paint={paintFloor} t={t} floor seed={11} position={[0, 0.005, -2]} />
    {FACADES.map((fc, i) => {
      const x = fc.side * 1.5;
      return (
        <group key={i}>
          {/* gaiola frame behind the facade */}
          {[-1.4, -0.7, 0, 0.7, 1.4].map((dz, b) => (
            <Beam key={b} a={[x + fc.side * 0.08, 0, fc.z + dz]} b={[x + fc.side * 0.08, 3.6, fc.z + dz]} w={0.07} color={C.woodDark} />
          ))}
          {[0.9, 1.8, 2.7, 3.6].map((y, b) => (
            <Beam key={`h${b}`} a={[x + fc.side * 0.08, y, fc.z - 1.45]} b={[x + fc.side * 0.08, y, fc.z + 1.45]} w={0.06} color={C.wood} />
          ))}
          <Azulejo cols={20} rows={24} pitch={0.15} paint={paintFacade} t={t} fx={FFX[i]} seed={20 + i} position={[x, 0, fc.z]} rotation={[0, -fc.side * (Math.PI / 2), 0]} />
        </group>
      );
    })}
    <Plaque text="AUDIRA" sub="LISBOA 1758" w={0.9} h={0.36} position={[-1.44, 2.4, 3.0]} rotation={[0, Math.PI / 2, 0]} />
    {t > 79.5
      ? [0, 1, 2, 3].map((i) => (
          <Figure key={i} f={f} seed={140 + i} pose="walk" position={[i % 2 ? 0.45 : -0.45, 0, 2.5 - (t - 79.5) * 0.5 - i * 1.6]} heading={Math.PI} scale={0.62} />
        ))
      : null}
    <Haze color="#F2C690" z={-12} opacity={0.4} />
  </group>
);

export const SCENES: Record<SceneId, React.FC<SP>> = {
  S1,
  S2,
  S3,
  S4: S_HARBOR,
  S5: S_HARBOR,
  S6,
  S7,
  S8,
  S9,
  S10,
  S11,
};
