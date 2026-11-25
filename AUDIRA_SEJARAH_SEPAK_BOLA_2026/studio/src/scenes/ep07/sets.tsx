// EP07 film sets (PAPERWORLD): every set is a cut-paper diorama in its own corner of the world.
// Only the active set is mounted (see Film.tsx); cuts between sets hide under a paper-sheet wipe.
import React, { useLayoutEffect, useMemo } from "react";
import { BoxGeometry, Color, InstancedMesh, MeshStandardMaterial, Object3D, CylinderGeometry } from "three";
import { Cut, Hinge, PopUp, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { Ground, GroundPrint, PaperBush, PaperCloud, PaperTree } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { PaperCharacter, restPose } from "../../kits/paperworld/components/PaperCharacter.tsx";
import { S, type ShapeSpec } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { hash01 } from "../../kits/paperworld/motion/easing.ts";
import { SceneText } from "../../core/polish/Drei.tsx";
import { C, PaperBall, Ship } from "./Cover.tsx";
import { T, CUTS, seg, pop, clamp01 } from "./timing.ts";

// ---------- set origins (world space) ----------
export const ORIGIN: Record<"map" | "cal" | "sea" | "pocitos", V3> = {
  map: [1000, 0, 0],
  cal: [2000, 0, 0],
  sea: [3000, 0, 0],
  pocitos: [4000, 0, 0],
};
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const Flat: React.FC<{ shape: ShapeSpec; color: string; y?: number; depth?: number; position?: [number, number]; cast?: boolean }> = ({
  shape,
  color,
  y = 0,
  depth = 0.05,
  position = [0, 0],
  cast = false,
}) => <Cut shape={shape} color={color} depth={depth} position={[position[0], y + depth / 2, position[1]]} rotation={[-Math.PI / 2, 0, 0]} cast={cast} />;

/** Flat text printed on the ground / a table, readable from above (+z toward camera). */
const GroundText: React.FC<{ p: V3; size: number; color?: string; children: string; font?: string; yaw?: number; spacing?: number }> = ({
  p,
  size,
  color = C.ink,
  children,
  font = "display",
  yaw = 0,
  spacing = 0.04,
}) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <SceneText rotation={[-Math.PI / 2, 0, 0]} fontSize={size} color={color} anchorX="center" anchorY="middle" font={font} letterSpacing={spacing}>
      {children}
    </SceneText>
  </group>
);

// ---------- flags (simple shapes, no crests) ----------
export type FlagSpec = { dir: "v" | "h"; cols: string[]; extra?: "sunCanton" | "sun" | "diamond" | "canton" | "usa" };
const RED = "#d6453b";
const BLUE = "#2f4f9a";
const YEL = "#f2c94c";
const GRN = "#2f8f4e";
export const FLAGS: Record<string, FlagSpec> = {
  FRA: { dir: "v", cols: [BLUE, C.white, RED] },
  BEL: { dir: "v", cols: ["#2b2622", YEL, RED] },
  ROU: { dir: "v", cols: [BLUE, YEL, RED] },
  YUG: { dir: "h", cols: [BLUE, C.white, RED] },
  ARG: { dir: "h", cols: [C.celeste, C.white, C.celeste], extra: "sun" },
  URU: { dir: "h", cols: [C.white, C.celesteDeep, C.white, C.celesteDeep, C.white, C.celesteDeep, C.white, C.celesteDeep, C.white], extra: "sunCanton" },
  BOL: { dir: "h", cols: [RED, YEL, GRN] },
  BRA: { dir: "h", cols: [GRN], extra: "diamond" },
  CHI: { dir: "h", cols: [C.white, RED], extra: "canton" },
  MEX: { dir: "v", cols: [GRN, C.white, RED] },
  PAR: { dir: "h", cols: [RED, C.white, BLUE] },
  PER: { dir: "v", cols: [RED, C.white, RED] },
  USA: { dir: "h", cols: [RED, C.white, RED, C.white, RED, C.white, RED], extra: "usa" },
};

/** Paper flag on a pole. Flag plane = local x/y, facing +z. `t` = pop-up (0 flat, 1 standing). */
export const Flag: React.FC<{ code: string; w?: number; h?: number; pole?: number; position?: V3; yaw?: number; t?: number; wave?: number }> = ({
  code,
  w = 2,
  h = 1.3,
  pole = 3,
  position,
  yaw = 0,
  t = 1,
  wave = 0,
}) => {
  const f = FLAGS[code];
  const n = f.cols.length;
  const d = 0.04;
  return (
    <group position={position} rotation={[0, yaw, 0]} scale={[1, Math.max(0.001, t), 1]}>
      <Cut shape={S.rect(0.1, pole + 0.2)} color={C.ink} depth={0.1} />
      <group position={[0.05, pole - h, 0]} rotation={[0, wave, 0]}>
        {f.cols.map((c, i) =>
          f.dir === "v" ? (
            <Cut key={i} shape={S.rect(w / n, h)} color={c} depth={d} position={[(w / n) * (i + 0.5), 0, 0]} />
          ) : (
            <Cut key={i} shape={S.rect(w, h / n)} color={c} depth={d} position={[w / 2, h - (h / n) * (i + 1), 0]} />
          ),
        )}
        {f.extra === "sun" && <Cut shape={S.circle(h * 0.11)} color={YEL} depth={d + 0.02} position={[w / 2, h / 2, 0]} />}
        {f.extra === "sunCanton" && (
          <>
            <Cut shape={S.rect(w * 0.36, h * (5 / 9))} color={C.white} depth={d + 0.01} position={[w * 0.18, h * (4 / 9), 0]} />
            <Cut shape={S.circle(h * 0.15)} color={YEL} depth={d + 0.03} position={[w * 0.18, h * (13 / 18), 0]} />
          </>
        )}
        {f.extra === "diamond" && (
          <>
            <Cut shape={S.poly("ep07-diamond", [[-0.4, 0], [0, -0.28], [0.4, 0], [0, 0.28]])} color={YEL} depth={d + 0.01} position={[w / 2, h / 2, 0]} scale={[w / 1.0, h / 0.75, 1]} />
            <Cut shape={S.circle(h * 0.17)} color={BLUE} depth={d + 0.03} position={[w / 2, h / 2, 0]} />
          </>
        )}
        {f.extra === "canton" && <Cut shape={S.rect(w * 0.33, h / 2)} color={BLUE} depth={d + 0.01} position={[w * 0.165, h / 2, 0]} />}
        {f.extra === "usa" && <Cut shape={S.rect(w * 0.42, h * (4 / 7))} color={BLUE} depth={d + 0.01} position={[w * 0.21, h * (3 / 7), 0]} />}
      </group>
    </group>
  );
};

// ---------- generic winged trophy (paper silhouette, not a replica) ----------
const trophyShape = S.poly("ep07-trophy", [
  [-0.35, 1.2], [0.35, 1.2], [0.3, 2.4], [0.55, 2.6], [1.55, 4.7], [1.2, 4.8], [0.5, 3.4], [0.35, 3.6], [0.8, 4.15], [0.8, 4.6], [-0.8, 4.6],
  [-0.8, 4.15], [-0.35, 3.6], [-0.5, 3.4], [-1.2, 4.8], [-1.55, 4.7], [-0.55, 2.6], [-0.3, 2.4],
]);
const trophyBase = S.poly("ep07-trophy-base", [[-0.95, 0], [0.95, 0], [0.62, 1.25], [-0.62, 1.25]]);
export const Trophy: React.FC<{ position?: V3; scale?: number; yaw?: number; glow?: number }> = ({ position, scale = 1, yaw = 0, glow = 0.12 }) => (
  <group position={position} scale={scale} rotation={[0, yaw, 0]}>
    <Cut shape={trophyBase} color={C.celesteInk} depth={0.9} />
    <Cut shape={S.rect(1.7, 0.18)} color={C.gold} depth={0.95} position={[0, 0.45, 0]} />
    <Cut shape={trophyShape} color={C.gold} depth={0.42} opts={{ roughness: 0.55, emissive: "goldLight", emissiveIntensity: glow }} />
    <Cut shape={S.rect(1.3, 0.2)} color="#c38f2b" depth={0.5} position={[0, 4.35, 0]} />
  </group>
);

// ---------- instanced paper rain / confetti ----------
export const PaperRain: React.FC<{ t: number; amount: number; center: V3; area: [number, number]; top?: number }> = ({ t, amount, center, area, top = 30 }) => {
  const N = 520;
  const mesh = useMemo(() => {
    const m = new InstancedMesh(new BoxGeometry(0.07, 1.3, 0.025), new MeshStandardMaterial({ color: "#e6edf5", roughness: 0.9 }), N);
    m.frustumCulled = false;
    return m;
  }, []);
  useLayoutEffect(() => {
    const o = new Object3D();
    const vis = Math.round(N * clamp01(amount));
    for (let i = 0; i < N; i++) {
      const sp = 22 + hash01(i * 3 + 1) * 6;
      const ph = hash01(i * 5 + 2);
      const y = top - (((t * sp) / top + ph) % 1) * top;
      o.position.set(center[0] + (hash01(i * 7 + 3) - 0.5) * area[0], i < vis ? y : -50, center[2] + (hash01(i * 11 + 4) - 0.5) * area[1]);
      o.rotation.set(0, hash01(i) * 3, 0.18);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, amount, mesh, center, area, top]);
  return <primitive object={mesh} />;
};

export const Confetti: React.FC<{ t: number; t0: number; center: V3; area: number; top?: number }> = ({ t, t0, center, area, top = 18 }) => {
  const N = 360;
  const mesh = useMemo(() => {
    const m = new InstancedMesh(new BoxGeometry(0.42, 0.26, 0.012), new MeshStandardMaterial({ color: "#ffffff", roughness: 0.85 }), N);
    const cols = [C.celeste, C.white, C.gold, C.celesteDeep, "#f0a892", C.white];
    const c = new Color();
    for (let i = 0; i < N; i++) m.setColorAt(i, c.set(cols[i % cols.length]));
    m.frustumCulled = false;
    return m;
  }, []);
  useLayoutEffect(() => {
    const o = new Object3D();
    const age = t - t0;
    for (let i = 0; i < N; i++) {
      const delay = hash01(i * 13 + 5) * 1.6;
      const a = age - delay;
      const sp = 2.2 + hash01(i * 3 + 9) * 1.6;
      const y = a < 0 ? -40 : top + 2 - ((a * sp) % (top + 2));
      const sw = Math.sin(a * 2.4 + i) * 0.8;
      o.position.set(center[0] + (hash01(i * 7 + 1) - 0.5) * area + sw, y, center[2] + (hash01(i * 17 + 2) - 0.5) * area);
      o.rotation.set(a * (1.5 + hash01(i) * 3), a * 2 + i, a * (1 + hash01(i + 9) * 2));
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, t0, mesh, center, area, top]);
  return <primitive object={mesh} />;
};

// =====================================================================================
// SET 1: map table — Uruguay 1930, two Olympic medals, constitution scroll (KONTEKS)
// =====================================================================================
const K = 2.4;
const ll = (lon: number, lat: number): [number, number] => [(lon + 56) * K, (lat + 32.5) * K];
const URU_LL: [number, number][] = [[-58.4, -33.9], [-57.8, -34.4], [-56.2, -34.9], [-54.9, -34.95], [-53.8, -34.4], [-53.4, -33.7], [-53.4, -32.6], [-55, -31], [-56, -30.1], [-57.6, -30.2], [-58.1, -32]];
const ARG_LL: [number, number][] = [[-66, -41], [-62, -39], [-57.6, -38.2], [-56.7, -36.5], [-57.2, -35.4], [-58.5, -34.5], [-58.4, -33.9], [-58.1, -32], [-57.6, -30.2], [-56.5, -27.4], [-66, -26]];
const BRA_LL: [number, number][] = [[-56.5, -27.4], [-57.6, -30.2], [-56, -30.1], [-55, -31], [-53.4, -32.6], [-53.4, -33.7], [-52.2, -32.2], [-50.5, -30.5], [-48.4, -28.5], [-46, -26], [-56.5, -22]];
const uruShape = S.poly("ep07-uru", URU_LL.map(([a, b]) => ll(a, b)));
const argShape = S.poly("ep07-arg", ARG_LL.map(([a, b]) => ll(a, b)));
const braShape = S.poly("ep07-bra", BRA_LL.map(([a, b]) => ll(a, b)));
export const MVD: V3 = [ll(-56.2, -34.9)[0], 0, -ll(-56.2, -34.9)[1]];

const Medal: React.FC<{ year: string; t: number; position: V3; tilt?: number }> = ({ year, t, position, tilt = 0 }) => (
  <PopUp t={t} position={position} yaw={tilt} hideFlat>
    {/* ribbon: two crossing strips (celeste / white) */}
    <Cut shape={S.poly("ep07-rib-a", [[-1.0, 5.6], [-0.3, 5.6], [0.45, 3.0], [-0.15, 3.0]])} color={C.celeste} depth={0.05} position={[0, 0, -0.05]} />
    <Cut shape={S.poly("ep07-rib-b", [[0.3, 5.6], [1.0, 5.6], [0.15, 3.0], [-0.45, 3.0]])} color={C.white} depth={0.05} position={[0, 0, -0.08]} />
    <Cut shape={S.rect(0.2, 3.0)} color={C.ink} depth={0.06} position={[0, 0, -0.2]} />
    <group position={[0, 1.9, 0]}>
      <Cut shape={S.circle(1.55)} color={C.gold} depth={0.24} opts={{ roughness: 0.55, emissive: "goldLight", emissiveIntensity: 0.08 }} />
      <Cut shape={S.ring(1.22, 1.34)} color="#c38f2b" depth={0.3} />
      <SceneText position={[0, 0.25, 0.17]} fontSize={0.78} color={C.ink} anchorX="center" anchorY="middle">
        {year}
      </SceneText>
      <SceneText position={[0, -0.5, 0.17]} fontSize={0.26} color={C.ink} anchorX="center" anchorY="middle" font="sans" letterSpacing={0.12}>
        OLIMPIADE
      </SceneText>
    </group>
  </PopUp>
);

const Scroll: React.FC<{ t: number; position: V3 }> = ({ t, position }) => {
  const roll = useMemo(() => new CylinderGeometry(0.32, 0.32, 5.8, 20), []);
  const mat = paperFace("#e9dcc0", { relief: 0.5 });
  const open = clamp01(t);
  return (
    <PopUp t={Math.min(1, t * 1.6)} position={position} yaw={-0.25}>
      <group position={[0, 0.3, 0]}>
        <mesh geometry={roll} material={mat} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.1]} castShadow />
        <group scale={[1, Math.max(0.01, open), 1]}>
          <Cut shape={S.rect(5.2, 7)} color="#f4ead6" depth={0.05} />
          <SceneText position={[0, 6.1, 0.05]} fontSize={0.62} color={C.ink} anchorX="center" anchorY="middle" letterSpacing={0.06}>
            KONSTITUSI
          </SceneText>
          <SceneText position={[0, 5.1, 0.05]} fontSize={0.95} color={C.celesteInk} anchorX="center" anchorY="middle">
            1830
          </SceneText>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Cut key={i} shape={S.rect(3.8 - (i % 3) * 0.5, 0.12)} color="#bfae8e" depth={0.06} position={[-0.25 * (i % 2), 4.1 - i * 0.48, 0]} cast={false} />
          ))}
          <Cut shape={S.circle(0.6)} color="#c4614f" depth={0.12} position={[1.5, 0.9, 0.02]} />
        </group>
        <mesh geometry={roll} material={mat} rotation={[0, 0, Math.PI / 2]} position={[0, 7 * open, 0.1]} castShadow />
      </group>
    </PopUp>
  );
};

export const MapSet: React.FC<{ t: number }> = ({ t }) => {
  const mUp = (a: number) => seg(t, a, a + 0.55);
  return (
    <group position={ORIGIN.map}>
      <Ground color={C.sea} size={260} />
      {/* wave strips across the paper sea */}
      {Array.from({ length: 16 }, (_, r) => (
        <Flat key={r} shape={S.rectC(24 + hash01(r) * 18, 0.22, 0.1)} color={r % 2 ? C.seaLight : "#7ea0c9"} y={0.01} depth={0.03}
          position={[14 + (hash01(r + 5) - 0.5) * 30, 4 - r * 3.2 + Math.sin(t * 0.7 + r) * 0.15]} />
      ))}
      <Flat shape={argShape} color={C.sand} depth={0.35} cast />
      <Flat shape={braShape} color="#e2cfa8" depth={0.35} cast />
      <Flat shape={uruShape} color={C.celeste} depth={0.7} y={0} cast />
      {/* Río de la Plata label + neighbours */}
      <GroundText p={[1.3, 0.72, 2.2]} size={1.0} color={C.celesteInk}>URUGUAY</GroundText>
      <GroundText p={[-11, 0.37, 2.5]} size={1.0} color="#8a6a45">ARGENTINA</GroundText>
      <GroundText p={[3.5, 0.37, -9.5]} size={1.0} color="#8a6a45">BRASIL</GroundText>
      <GroundText p={[9.5, 0.04, 9]} size={0.6} color="#e4eef8" font="sans" spacing={0.2}>SAMUDRA ATLANTIK</GroundText>
      {/* Montevideo pin with a 1930 pennant */}
      <group position={[MVD[0], 0.7, MVD[2]]} scale={0.8 * pop(t, T.uruguay - 0.2, 0.45)}>
        <Cut shape={S.rect(0.12, 3.2)} color={C.ink} depth={0.12} />
        <Cut shape={S.poly("ep07-pen", [[0, 0], [2.6, 0.5], [0, 1.0]])} color={C.green} depth={0.06} position={[0.06, 2.2, 0]} />
        <SceneText position={[0.95, 2.7, 0.05]} fontSize={0.42} color={C.white} anchorX="center" anchorY="middle">1930</SceneText>
        <Cut shape={S.circle(0.28)} color="#c4614f" depth={0.3} position={[0, 3.25, 0]} />
        <SceneText position={[-2.1, 0.1, 0.3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color={C.ink} anchorX="center" anchorY="middle" font="sans">
          MONTEVIDEO
        </SceneText>
      </group>
      {/* little paper town at Montevideo, trees on the map, boats in the estuary, compass rose */}
      {[[-1.6, 5.0, 0.9, "#f7f1e4"], [-0.9, 4.7, 1.2, "#e3806a"], [0.4, 5.1, 0.8, "#f3ead9"], [1.1, 4.9, 1.0, "#9eb2da"]].map(([x, z, h, c], i) => (
        <group key={i} position={[x as number, 0.7, z as number]}>
          <Cut shape={S.gable(0.7, h as number, 0.4)} color={c as string} depth={0.6} />
        </group>
      ))}
      {[[-3.5, -3.6], [4.2, -2.6], [3.0, 1.0], [-2.8, 2.6], [5.0, 3.6], [-4.4, -0.6]].map(([x, z], i) => (
        <PaperTree key={i} kind={i % 2 ? "cone" : "round"} h={1.5 + hash01(i + 2) * 0.6} color={i % 2 ? "mintDeep" : "mint"} position={[x, 0.7, z]} />
      ))}
      {[[-4.6, 8.4, 0.3], [-1.6, 9.6, -0.2], [2.6, 8.8, 0.5]].map(([x, z, yw], i) => (
        <group key={i} position={[x + Math.sin(t * 0.5 + i) * 0.2, 0.05, z]} rotation={[0, yw, 0]}>
          <Cut shape={S.poly("ep07-boat", [[-1.0, 0], [1.0, 0], [1.3, 0.45], [-1.3, 0.45]])} color={i === 1 ? "#c4614f" : "#f7f1e4"} depth={0.5} />
          <Cut shape={S.poly("ep07-sail", [[0, 0.45], [0.9, 0.45], [0, 1.9]])} color="#faf4e8" depth={0.04} />
        </group>
      ))}
      <group position={[6.2, 0.04, 9.6]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <Cut shape={S.star(1.3, 0.3)} color="#f7f1e4" depth={0.04} cast={false} />
        <Cut shape={S.ring(0.95, 1.05)} color="#e7b54a" depth={0.05} cast={false} />
      </group>
      <Medal year="1924" t={mUp(T.juara - 0.1)} position={[-2.3, 0.7, -1.2]} tilt={0.12} />
      <Medal year="1928" t={mUp(T.y1928 - 0.5)} position={[2.3, 0.7, -1.2]} tilt={-0.12} />
      <Scroll t={seg(t, T.dan2 - 0.1, T.dan2 + 1.0)} position={[9.2, 0.03, 2.2]} />
      <PaperCloud w={8} color="ivoryLight" position={[-12, 14, -14]} threadTo={30} />
      <PaperCloud w={6} color="ivoryLight" position={[14, 16, -12]} threadTo={30} />
    </group>
  );
};

// =====================================================================================
// SET 2: desk calendar + empty European entry board (PENGEMBANGAN, first beat)
// =====================================================================================
const MONTHS = ["JULI", "JUNI", "MEI"];
const CalPage: React.FC<{ month: string; mark?: number }> = ({ month, mark }) => (
  <group>
    <Cut shape={S.rect(6.6, 8.4, 0.12)} color="#faf4e8" depth={0.04} />
    <Cut shape={S.rect(6.6, 2.0, 0)} color="#c4614f" depth={0.05} position={[0, 6.4, 0]} />
    <SceneText position={[0, 7.45, 0.04]} fontSize={1.15} color={C.white} anchorX="center" anchorY="middle">{month}</SceneText>
    <SceneText position={[0, 6.72, 0.04]} fontSize={0.42} color="#fde7dc" anchorX="center" anchorY="middle" font="sans" letterSpacing={0.3}>1930</SceneText>
    {Array.from({ length: 35 }, (_, i) => {
      const cx = -2.7 + (i % 7) * 0.9;
      const cy = 5.3 - Math.floor(i / 7) * 1.0;
      return <Cut key={i} shape={S.rect(0.72, 0.78, 0.06)} color={mark === i ? C.green : "#ece2cd"} depth={0.05} position={[cx, cy - 0.78, 0.01]} cast={false} />;
    })}
  </group>
);

export const CalSet: React.FC<{ t: number }> = ({ t }) => {
  // two pages flip up and over: JULI -> JUNI -> MEI ("2 bulan sebelum")
  const flip = (a: number) => seg(t, a, a + 0.42) * Math.PI * 0.94;
  const f1 = flip(T.masalah + 0.55);
  const f2 = flip(T.masalah + 1.05);
  return (
    <group position={ORIGIN.cal}>
      <Ground color={C.sand} size={200} />
      <GroundPrint shape={S.rectC(34, 16, 0.6)} color="#d9c49c" position={[5, 0, 0]} />
      {/* calendar on an easel */}
      <group position={[0, 0.2, 0]} rotation={[-0.08, 0.12, 0]}>
        <Cut shape={S.rect(7.4, 9.6, 0.2)} color="#7d5843" depth={0.2} position={[0, 0, -0.2]} />
        <group position={[0, 0.45, 0]}>
          <CalPage month={MONTHS[2]} mark={12} />
          <group position={[0, 0, 0.06]}>
            <Hinge at={[0, 8.4, 0]} axis="x" angle={-f2}>
              <CalPage month={MONTHS[1]} />
            </Hinge>
          </group>
          <group position={[0, 0, 0.12]}>
            <Hinge at={[0, 8.4, 0]} axis="x" angle={-f1}>
              <CalPage month={MONTHS[0]} mark={16} />
            </Hinge>
          </group>
        </group>
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <Cut key={x} shape={S.ring(0.16, 0.28)} color={C.ink} depth={0.1} position={[x, 8.85, 0.3]} />
        ))}
      </group>
      {/* entry board: four empty slots */}
      <group position={[10.5, 0.2, -1]} rotation={[-0.06, -0.14, 0]}>
        <Cut shape={S.rect(0.25, 2.5)} color="#523729" depth={0.25} position={[-3.6, 0, -0.2]} />
        <Cut shape={S.rect(0.25, 2.5)} color="#523729" depth={0.25} position={[3.6, 0, -0.2]} />
        <Cut shape={S.rect(8.6, 8.2, 0.2)} color={C.green} depth={0.18} position={[0, 2.2, 0]} />
        <SceneText position={[0, 9.35, 0.12]} fontSize={0.85} color={C.white} anchorX="center" anchorY="middle">PENDAFTARAN</SceneText>
        <SceneText position={[0, 8.45, 0.12]} fontSize={0.5} color="#dff5e7" anchorX="center" anchorY="middle" font="sans" letterSpacing={0.25}>TIM EROPA</SceneText>
        {[0, 1, 2, 3].map((i) => {
          const x = i % 2 ? 1.95 : -1.95;
          const y = i < 2 ? 5.55 : 3.15;
          const shake = Math.sin(t * 9 + i) * 0.02 * seg(t, T.belum, T.belum + 0.3);
          return (
            <group key={i} position={[x, y, 0.12]} rotation={[0, 0, shake]}>
              <Cut shape={S.frame("rect", 3.5, 1.9, "rect", 3.1, 1.5, 0.2)} color="#f7f1e4" depth={0.06} />
              <SceneText position={[0, 0.95, 0.04]} fontSize={0.7} color="#9fd2b0" anchorX="center" anchorY="middle">?</SceneText>
            </group>
          );
        })}
      </group>
      <PaperTree kind="round" h={6} color="mintDeep" position={[-7, 0, -6]} />
      <PaperTree kind="cone" h={7} color="mint" position={[18, 0, -7]} />
      {Array.from({ length: 7 }, (_, i) => (
        <PaperBush key={i} w={2.4 + hash01(i + 3)} color={i % 2 ? "mintDeep" : "mint"} position={[-8 + i * 4.4, 0, 9 + hash01(i) * 1.2]} />
      ))}
    </group>
  );
};

// =====================================================================================
// SET 3: the Atlantic — Conte Verde from Europe (far, top of frame) to Montevideo (near)
// =====================================================================================
const SHIP_Z0 = -40;
const SHIP_Z1 = 17;
const easeIO = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export const routeX = (z: number) => Math.sin((z + 40) * 0.055) * 3.2;
/** Ship position (sea-set local). */
export const shipAt = (t: number): V3 => {
  const u = clamp01((t - CUTS.toSea) / (T.totalnya + 0.4 - CUTS.toSea));
  const z = SHIP_Z0 + (SHIP_Z1 - SHIP_Z0) * (0.15 * u + 0.85 * easeIO(u));
  return [routeX(z), 0, z];
};
const QUAY = ["ARG", "BEL", "BOL", "BRA", "CHI", "FRA", "MEX", "PAR", "PER", "ROU", "USA", "URU", "YUG"];
export const quayFlagTime = (i: number) => T.totalnya + 0.15 + i * 0.13;

export const SeaSet: React.FC<{ t: number }> = ({ t }) => {
  const sp = shipAt(t);
  const dz = shipAt(t + 0.05)[2] - sp[2];
  const yaw = -Math.PI / 2 + Math.atan2(routeX(sp[2] + 0.5) - routeX(sp[2]), 0.5) * (dz >= 0 ? 1 : 1);
  const boards = [T.prancis, T.belgia, T.rumania];
  const ship = SHIP_SCALE;
  return (
    <group position={ORIGIN.sea}>
      <Ground color={C.sea} size={300} />
      {Array.from({ length: 30 }, (_, r) => (
        <Flat key={r} shape={S.rectC(10 + hash01(r) * 14, 0.25, 0.1)} color={r % 2 ? C.seaLight : "#7ea0c9"} y={0.01} depth={0.03}
          position={[(hash01(r + 9) - 0.5) * 50 + Math.sin(t * 0.6 + r) * 0.3, -52 + r * 2.6]} />
      ))}
      {/* dotted route */}
      {Array.from({ length: 30 }, (_, i) => {
        const z = SHIP_Z0 + 1 + i * 2;
        const shown = z < sp[2] - 2 || t > T.totalnya;
        return <Flat key={i} shape={S.rectC(0.26, 0.9, 0.12)} color={shown ? "#f7f1e4" : "#93b0d3"} y={0.02} depth={0.03} position={[routeX(z), z]} />;
      })}
      {/* Europe coast (far) */}
      <Flat shape={S.path("ep07-eu", (s) => {
        s.moveTo(-60, 0); s.lineTo(60, 0); s.lineTo(60, 30); s.lineTo(-60, 30); s.closePath();
      })} color={C.sand} depth={0.4} position={[0, -44]} cast />
      {Array.from({ length: 12 }, (_, i) => (
        <Flat key={i} shape={S.ellipse(3 + hash01(i) * 3, 1.5 + hash01(i + 2))} color={C.sand} depth={0.4} position={[-50 + i * 9, -44 + 1.2 + hash01(i + 4)]} />
      ))}
      <GroundText p={[-9, 0.42, -50]} size={2.6} color="#8a6a45">EROPA</GroundText>
      <PaperTree kind="cone" h={5} color="mintDeep" position={[9, 0.4, -50]} />
      <PaperTree kind="round" h={4.5} color="mint" position={[14, 0.4, -52]} />
      {/* South America coast (near) with the quay */}
      <Flat shape={S.path("ep07-sa", (s) => {
        s.moveTo(-60, -40); s.lineTo(60, -40); s.lineTo(60, -1); s.quadraticCurveTo(10, 2, 0, -1.5); s.quadraticCurveTo(-20, -3, -60, 0); s.closePath();
      })} color={C.sand} depth={0.4} position={[0, 22]} cast />
      <Flat shape={S.rectC(3.2, 6)} color="#a77d55" depth={0.5} y={0} position={[routeX(SHIP_Z1), 21.2]} cast />
      <GroundText p={[11, 0.42, 30.5]} size={1.4} color={C.celesteInk}>MONTEVIDEO</GroundText>
      {QUAY.map((c, i) => {
        const row = i < 7 ? 0 : 1;
        const k = row ? i - 7 : i;
        const x = row ? -5 + k * 2.1 : -6.3 + k * 2.1;
        return (
          <Flag key={c} code={c} w={1.6} h={1.05} pole={2.6} position={[x, 0.4, 25 + row * 2.6]}
            t={pop(t, quayFlagTime(i), 0.32)} wave={Math.sin(t * 2.2 + i) * 0.12} />
        );
      })}
      <PaperCloud w={9} color="ivoryLight" position={[-16, 18, -24]} threadTo={30} />
      <PaperCloud w={7} color="ivoryLight" position={[15, 20, -8]} threadTo={30} />
      <PaperCloud w={6} color="ivoryLight" position={[-12, 15, 6]} threadTo={30} />
      {/* the ship */}
      <group position={sp} rotation={[0, yaw, 0]} scale={ship}>
        <Ship position={[0, 0, 0]} s={t} />
        {/* three team flags on the upper deck (France, Belgium, Romania) */}
        {(["FRA", "BEL", "ROU"] as const).map((c, i) => (
          <Flag key={c} code={c} w={2.5} h={1.7} pole={4.0} position={[-3.4 + i * 3.0, 5.3, 0.62]} t={pop(t, boards[i], 0.35)} wave={Math.sin(t * 3 + i) * 0.1} />
        ))}
        {/* Rimet + the trophy trunk on the lower deck at the stern */}
        <group position={[-4.9, 4.1, 0.2]}>
          <PaperCharacter pose={restPose({ time: t, armOut: [0, 0.5 * seg(t, T.trofi, T.trofi + 0.4)] })} scale={0.62 * pop(t, T.bersama - 0.1, 0.4)} yaw={-Math.PI / 2 + 0.6}
            colors={{ coat: "#2c2c36", coatDeep: "#1e1e26", collar: "ivoryLight", legs: "#2c2c36", shoes: "ink", hair: "#d8d0c4" }} scarf={false} curl={false} />
        </group>
        <group position={[-6.5, 2.75, 0.2]} scale={pop(t, T.jules + 0.3, 0.4)}>
          <Cut shape={S.rect(1.6, 1.0, 0.1)} color="#7d5843" depth={1.0} />
          <Hinge at={[0, 1.0, -0.5]} axis="x" angle={-seg(t, T.trofi - 0.2, T.trofi + 0.3) * 1.9}>
            <Cut shape={S.rect(1.6, 0.12)} color="#523729" depth={1.0} position={[0, 1.0, 0]} />
          </Hinge>
          <Trophy position={[0, 0.6 + seg(t, T.trofi - 0.1, T.trofi + 0.5) * 0.9, 0]} scale={0.42} glow={0.25} />
        </group>
      </group>
    </group>
  );
};
export const SHIP_SCALE = 0.45;

// =====================================================================================
// SET 4: the small Pocitos ground — first World Cup goal (PENJELASAN, first beat)
// =====================================================================================
const PW = 9.2;
const PL = 14;
const SmallPitch: React.FC = () => {
  const lw = 0.13;
  const n = 7;
  const sl = PL / n;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <Flat key={i} shape={S.rectC(PW, sl)} color={i % 2 ? C.pitch : "#63b26c"} y={0.0} depth={0.04} position={[0, -PL / 2 + sl * (i + 0.5)]} />
      ))}
      {[-PL / 2, 0, PL / 2].map((z) => (
        <Flat key={z} shape={S.rectC(PW, lw)} color={C.line} y={0.04} depth={0.02} position={[0, z]} />
      ))}
      {[-PW / 2, PW / 2].map((x) => (
        <Flat key={x} shape={S.rectC(lw, PL)} color={C.line} y={0.04} depth={0.02} position={[x, 0]} />
      ))}
      <Flat shape={S.ring(1.6, 1.6 + lw)} color={C.line} y={0.04} depth={0.02} />
      <Flat shape={S.rectC(4.6, lw)} color={C.line} y={0.04} depth={0.02} position={[0, -PL / 2 + 2.3]} />
      <Flat shape={S.rectC(lw, 2.3)} color={C.line} y={0.04} depth={0.02} position={[-2.3, -PL / 2 + 1.15]} />
      <Flat shape={S.rectC(lw, 2.3)} color={C.line} y={0.04} depth={0.02} position={[2.3, -PL / 2 + 1.15]} />
    </group>
  );
};

const Goal: React.FC<{ z: number; ripple: number }> = ({ z, ripple }) => (
  <group position={[0, 0.04, z]}>
    <Cut shape={S.frame("rect", 4.7, 2.0, "rect", 4.3, 1.8, 0)} color={C.line} depth={0.14} />
    {/* paper net: a back panel with cut holes, bulging when the ball hits */}
    <group position={[0, 0, -1.1 - ripple * 0.35]}>
      <Cut shape={S.rect(4.4, 1.85, 0, Array.from({ length: 24 }, (_, i) => ({ kind: "rect" as const, x: -1.85 + (i % 8) * 0.53, y: 0.15 + Math.floor(i / 8) * 0.56, w: 0.36, h: 0.4 })))} color="#efe9dc" depth={0.03} />
    </group>
    {[-2.2, 2.2].map((x) => (
      <Cut key={x} shape={S.poly("ep07-netside", [[0, 0], [1.1, 0], [0, 1.85]])} color="#efe9dc" depth={0.03} position={[x, 0, -0.55]} rotation={[0, Math.PI / 2, 0]} scale={[-1, 1, 1]} />
    ))}
  </group>
);

const FANS_P = [
  { x: 6.7, z: -4, h: 0.5, c: C.celeste }, { x: 6.9, z: -1.5, h: 1.0, c: "#c4614f" }, { x: 6.6, z: 1.5, h: 0.5, c: C.white },
  { x: 7.0, z: 4, h: 1.0, c: "#2f4f9a" }, { x: 6.7, z: -6.5, h: 0.5, c: "#e7b54a" },
];

export const PocitosSet: React.FC<{ t: number }> = ({ t }) => {
  // Laurent's run and shot
  const run = seg(t, T.juli13 + 0.6, T.gol - 0.35);
  const px = 1.8 - run * 1.0;
  const pz = 2.4 - run * 3.3;
  const kick = T.gol - 0.3;
  const fly = clamp01((t - kick) / 0.42);
  const b0: V3 = [0.75, 0, -1.55];
  const b1: V3 = [-1.15, 0.75, -7.4];
  const ball: V3 =
    t < kick
      ? [b0[0] + (px - 1.8 + 1.0) * 0.0, 0, b0[2]]
      : t < kick + 0.42
        ? [b0[0] + (b1[0] - b0[0]) * fly, b0[1] + (b1[1] - b0[1]) * fly + Math.sin(fly * Math.PI) * 0.7, b0[2] + (b1[2] - b0[2]) * fly]
        : [b1[0], Math.max(0, 0.75 - (t - kick - 0.42) * 2.5), b1[2] - 0.2];
  const ripple = Math.max(0, Math.sin(clamp01((t - kick - 0.4) / 0.6) * Math.PI)) * (t > kick + 0.4 ? 1 : 0);
  const cheer = seg(t, T.gol + 0.2, T.gol + 0.6);
  const dive = seg(t, kick + 0.1, kick + 0.45);
  return (
    <group position={ORIGIN.pocitos}>
      <Ground color="#86b878" size={200} />
      <Flat shape={S.rectC(PW + 3, PL + 4)} color="#78ad6c" y={0} depth={0.02} />
      <SmallPitch />
      <Goal z={-PL / 2} ripple={ripple} />
      <Goal z={PL / 2} ripple={0} />
      {/* low wooden stand along one touchline + fans */}
      {[0, 1, 2].map((i) => (
        <Cut key={i} shape={S.rectC(16, 0.9)} color={i % 2 ? "#ae8a70" : "#9a7458"} depth={0.5 + i * 0.5} position={[6.0 + i * 0.85, (0.5 + i * 0.5) / 2, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
      ))}
      {FANS_P.map((f, i) => (
        <PaperCharacter key={i} pose={restPose({ time: t, armOut: [cheer * 2.4, cheer * 2.6], squash: 1 + Math.sin(t * 9 + i) * 0.03 * cheer })}
          position={[f.x, f.h, f.z]} yaw={-Math.PI / 2} scale={0.3}
          colors={{ coat: f.c, coatDeep: f.c, collar: "ivoryLight", legs: "brownDeep", shoes: "ink", hair: "#5a3b2a" }} scarf={false} curl={false} />
      ))}
      {/* wooden fence on the far side */}
      {Array.from({ length: 12 }, (_, i) => (
        <Cut key={i} shape={S.rect(1.3, 0.9, 0.05)} color={i % 2 ? "#c9a983" : "#b8946c"} depth={0.1} position={[-6.2, 0, -7.2 + i * 1.32]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      {[-9, -12].map((x, i) => (
        <PaperTree key={x} kind={i ? "cone" : "round"} h={6 + i} color={i ? "mintDeep" : "mint"} position={[x, 0, -3 + i * 6]} />
      ))}
      <PaperTree kind="round" h={6.5} color="mintDeep" position={[-6, 0, -22]} />
      <PaperTree kind="cone" h={7} color="mint" position={[9, 0, -23]} />
      <PaperTree kind="round" h={5.5} color="mintDeep" position={[13, 0, -12]} />
      {/* Laurent (France: blue shirt, white shorts) */}
      <PaperCharacter
        pose={restPose({ time: t, walk: run * 5.5, stride: t < kick ? 0.9 : 0.2, lean: t < kick ? 0.15 : -0.05, armOut: [cheer * 2.5, cheer * 2.5] })}
        position={[px, 0.04, pz]} yaw={Math.PI + 0.25} scale={0.32}
        colors={{ coat: BLUE, coatDeep: "#243c78", collar: C.white, legs: "#f3eee2", shoes: "ink", hair: "#3b2a22" }} scarf={false} curl={false} />
      {/* goalkeeper (grey jersey), dives the wrong way */}
      <group position={[0.2 + dive * 1.3, 0.04 + dive * 0.4, -PL / 2 + 0.6]} rotation={[0, 0, -dive * 1.1]}>
        <PaperCharacter pose={restPose({ time: t, armOut: [0.9 + dive, 0.9 + dive] })} yaw={0} scale={0.32}
          colors={{ coat: "#8a8f96", coatDeep: "#6d7178", collar: "ivoryLight", legs: "#2c2c36", shoes: "ink", hair: "#2b1f18" }} scarf={false} curl={false} />
      </group>
      <PaperBall r={0.34} color="#a9703f" seam="#5a3a20" position={ball} spin={t * (t < kick ? 0 : 9)} />
    </group>
  );
};

// =====================================================================================
// Stadium extras (inside the cover stadium group: centre spot = local origin)
// =====================================================================================
/** Scaffold lattice round the unfinished tower. */
export const Scaffold: React.FC<{ show: number; at: V3 }> = ({ show, at }) => {
  if (show <= 0.001) return null;
  const poles: [number, number][] = [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]];
  return (
    <group position={at} scale={[1, show, 1]}>
      {poles.map(([x, z], i) => (
        <Cut key={i} shape={S.rect(0.16, 14)} color="#7d5843" depth={0.16} position={[x, 0, z]} />
      ))}
      {Array.from({ length: 6 }, (_, k) => (
        <group key={k} position={[0, 1.5 + k * 2.3, 0]}>
          <Cut shape={S.rectC(5.4, 0.14)} color="#9a7458" depth={0.14} position={[0, 0, 2.6]} />
          <Cut shape={S.rectC(5.4, 0.14)} color="#9a7458" depth={0.14} position={[0, 0, -2.6]} />
          <Cut shape={S.rectC(5.4, 0.14)} color="#9a7458" depth={0.14} position={[2.6, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
          <Cut shape={S.rectC(5.4, 0.14)} color="#9a7458" depth={0.14} position={[-2.6, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        </group>
      ))}
      {/* a crane arm */}
      <Cut shape={S.rect(0.2, 17)} color="#c38f2b" depth={0.2} position={[4.2, 0, 0]} />
      <Cut shape={S.rect(9, 0.3)} color="#c38f2b" depth={0.22} position={[1.0, 16.6, 0]} />
    </group>
  );
};

/** Ball choreography for the final (Argentina's ball first half, Uruguay's second). */
export const FinalBalls: React.FC<{ t: number }> = ({ t }) => {
  const shove = seg(t, T.kedua, T.kedua + 0.4) * (1 - seg(t, T.jalan - 0.2, T.jalan + 0.2));
  const bump = shove * Math.max(0, Math.sin((t - T.kedua) * 7)) * 0.35;
  const h1 = seg(t, T.babak1, T.babak1 + 0.9);
  const h2 = seg(t, T.babak2, T.babak2 + 0.9);
  const tr = seg(t, T.juaraDunia - 0.1, T.juaraDunia + 0.8);
  const ax = -1.6 + shove * 0.45 + bump + h1 * 1.6 + h2 * (-4.4);
  const az = 0.3 - h1 * 0.3 + h2 * 1.4;
  const ux = 1.75 - shove * 0.45 - bump + h1 * 2.6 + h2 * (-4.35) + tr * 1.9;
  const uz = h1 * 1.5 - h2 * 1.5 + tr * 1.6;
  return (
    <>
      <PaperBall r={1.15} color={C.ballArg} seam="#5a3a20" position={[ax, 0.1, az]} spin={0.4 + ax * 0.9} />
      <PaperBall r={1.45} color={C.ballUru} seam="#6b4a26" position={[ux, 0.1, uz]} spin={1.3 - ux * 0.7} />
    </>
  );
};
