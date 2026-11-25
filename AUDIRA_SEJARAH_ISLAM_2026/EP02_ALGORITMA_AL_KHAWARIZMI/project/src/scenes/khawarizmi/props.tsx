// EP02 Khawarizmi: the film's props around the cover desk. Each acts out a sentence of the voice:
// the map (Khwarazm -> Baghdad), the al-Jabr book, the equation board (words first, then symbols),
// the scroll / coins / canal (uses), the lost Arabic book, the code slate and the phone (payoff chain).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../core/polish/Polish";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette";
import { drawPseudoLine, makeGlowTexture } from "../../kits/manuscript/lib/materials";
import { mulberry32 } from "../../kits/manuscript/core/motion";
import { FX_LAYER } from "../../core/render/Post";
import { parchment, vine } from "./textures";
import { leatherGrain } from "./surfaces";
import { inkText, RevealPlane, Tag3D, toTex } from "./labels";
import { EV } from "./beats";
import { prog, smooth, easeOut, win } from "./time";

type V3 = [number, number, number];
const fx = (o: THREE.Object3D) => o.layers.set(FX_LAYER);

// ---------------------------------------------------------------- positions (one desk, one world)
export const POS = {
  map: [-1.55, 0.004, 0.62] as V3,
  jabrBook: [1.05, 0, 0.6] as V3,
  board: [0.3, 0, 1.2] as V3,
  scroll: [-0.2, 0, 1.25] as V3,
  coins: [0.95, 0, 1.25] as V3,
  ghost: [-0.86, 0, 1.16] as V3,
  slate: [0.76, 0, 0.2] as V3,
  phone: [0.12, 0.012, 0.42] as V3,
};

// ---------------------------------------------------------------- map
const MAP = { w: 0.8, h: 0.57, lon0: 38, lon1: 66, lat0: 28, lat1: 48 };
export const mapPoint = (lon: number, lat: number): V3 => [
  POS.map[0] + ((lon - MAP.lon0) / (MAP.lon1 - MAP.lon0) - 0.5) * MAP.w,
  POS.map[1] + 0.006,
  POS.map[2] + ((MAP.lat1 - lat) / (MAP.lat1 - MAP.lat0) - 0.5) * MAP.h,
];
export const KHWARAZM: V3 = mapPoint(60.4, 41.4);
export const BAGHDAD: V3 = mapPoint(44.4, 33.3);

const makeMapTexture = () => {
  const W = 1120;
  const H = 800;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  parchment(g, W, H, 44);
  const px = (lon: number, lat: number): [number, number] => [((lon - MAP.lon0) / (MAP.lon1 - MAP.lon0)) * W, ((MAP.lat1 - lat) / (MAP.lat1 - MAP.lat0)) * H];
  const poly = (pts: [number, number][], fill: string, stroke: string) => {
    g.beginPath();
    pts.forEach(([lo, la], i) => (i ? g.lineTo(...px(lo, la)) : g.moveTo(...px(lo, la))));
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.strokeStyle = stroke;
    g.lineWidth = 4;
    g.stroke();
  };
  const water = "rgba(36,65,140,0.32)";
  const shore = "rgba(36,65,140,0.75)";
  poly([[47, 44.5], [49, 46.8], [51.5, 47], [53, 45], [51, 42], [53, 40], [53.9, 37.3], [51, 36.6], [49, 37.6], [49.5, 40.5], [47.8, 42.5]], water, shore);
  poly([[58.5, 46.2], [61.5, 46.5], [61.8, 44.5], [60, 43.6], [58.3, 44.4]], water, shore);
  poly([[47.8, 30.2], [50, 29.8], [52, 28.6], [54, 28], [47.6, 28]], water, shore);
  poly([[38, 36.8], [36.5, 36.8], [36.5, 31], [38, 31]], water, shore);
  const river = (pts: [number, number][]) => {
    g.beginPath();
    pts.forEach(([lo, la], i) => (i ? g.lineTo(...px(lo, la)) : g.moveTo(...px(lo, la))));
    g.strokeStyle = shore;
    g.lineWidth = 5;
    g.stroke();
  };
  river([[42.5, 37.6], [43.2, 35.5], [44.4, 33.3], [46, 31.8], [47.8, 30.4]]);
  river([[38.6, 37.3], [40.4, 35.4], [43.2, 33.4], [46, 31.2], [47.8, 30.4]]);
  river([[66, 37.4], [63.5, 39], [61, 40.8], [59.8, 43.2], [59.6, 43.8]]);
  // mountains: small inked carets
  const rnd = mulberry32(5);
  g.strokeStyle = "rgba(42,26,16,0.55)";
  g.lineWidth = 3;
  for (let i = 0; i < 70; i++) {
    const lo = 44 + rnd() * 20;
    const la = 30 + rnd() * 6.5;
    if (lo > 47 && lo < 54 && la > 36.5) continue;
    const [x, y] = px(lo, la);
    g.beginPath();
    g.moveTo(x - 10, y + 6);
    g.lineTo(x, y - 8);
    g.lineTo(x + 10, y + 6);
    g.stroke();
  }
  // border frame + compass rose
  g.strokeStyle = P.rubricRed;
  g.lineWidth = 8;
  g.strokeRect(18, 18, W - 36, H - 36);
  g.strokeStyle = P.goldDeep;
  g.lineWidth = 3;
  g.strokeRect(34, 34, W - 68, H - 68);
  const [cx, cy] = [W - 120, H - 120];
  g.fillStyle = P.goldLeaf;
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60);
    g.lineTo(cx + Math.cos(a + 0.6) * 14, cy + Math.sin(a + 0.6) * 14);
    g.lineTo(cx + Math.cos(a - 0.6) * 14, cy + Math.sin(a - 0.6) * 14);
    g.fill();
  }
  return toTex(c);
};

/** Parchment map on the desk: Khwarazm lights, a gold route runs to Baghdad. */
export const DeskMap: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(makeMapTexture, []);
  const glow = useMemo(makeGlowTexture, []);
  const route = useMemo(() => {
    const a = new THREE.Vector3(...KHWARAZM);
    const b = new THREE.Vector3(...BAGHDAD);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.06;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 64, 0.004, 6, false);
  }, []);
  const kR = easeOut(prog(t, EV.bekerja, EV.bekerja + 1.1));
  route.setDrawRange(0, Math.floor(kR * 64) * 6 * 6);
  const kK = easeOut(prog(t, EV.khwarazm - 0.15, EV.khwarazm + 0.4));
  const kB = easeOut(prog(t, EV.bekerja + 0.9, EV.bekerja + 1.3));
  const pulse = (k: number, ph: number) => k * (0.75 + 0.25 * Math.sin(t * 4 + ph));
  return (
    <group>
      <mesh position={[POS.map[0], POS.map[1] + 0.004, POS.map[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP.w, MAP.h, 24, 1]} />
        <meshPhysicalMaterial map={tex} roughness={0.9} sheen={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* rolled ends */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[POS.map[0] + s * (MAP.w / 2 + 0.012), 0.022, POS.map[2]]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, MAP.h + 0.02, 20]} />
          <meshStandardMaterial color="#D8BF8E" roughness={0.85} />
        </mesh>
      ))}
      <mesh geometry={route}>
        <meshStandardMaterial color={P.goldLeaf} metalness={1} roughness={0.25} emissive="#7A4A10" emissiveIntensity={0.8} />
      </mesh>
      {[
        { p: KHWARAZM, k: kK, ph: 0 },
        { p: BAGHDAD, k: kB, ph: 1.7 },
      ].map((d, i) =>
        d.k > 0.01 ? (
          <group key={i} position={d.p}>
            <mesh>
              <cylinderGeometry args={[0.014, 0.014, 0.006, 24]} />
              <meshStandardMaterial color={P.goldLeaf} metalness={1} roughness={0.2} emissive="#A06A10" emissiveIntensity={0.6 * d.k} />
            </mesh>
            <sprite scale={[0.12 * pulse(d.k, d.ph), 0.12 * pulse(d.k, d.ph), 1]} position={[0, 0.01, 0]} onUpdate={fx}>
              <spriteMaterial map={glow} color="#FFC060" transparent opacity={0.8 * d.k} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          </group>
        ) : null,
      )}
      <Tag3D anchor={KHWARAZM} lift={0.1} h={0.07} text="Khwarazm" vis={win(t, EV.khwarazm - 0.1, EV.baitul + 1.2)} />
      <Tag3D anchor={mapPoint(62.5, 37.6)} lift={0.02} h={0.05} text="Asia Tengah" style="ink" thread={false} vis={win(t, EV.asia - 0.1, EV.baitul + 1.2)} />
      <Tag3D anchor={BAGHDAD} lift={0.1} h={0.07} text="Baghdad" vis={win(t, EV.bekerja + 1.0, EV.baitul + 1.2)} />
      <Tag3D anchor={mapPoint(52, 31.5)} lift={0.02} h={0.05} text="abad ke-9" style="ink" thread={false} vis={win(t, EV.kesembilan - 0.1, EV.baitul + 1.2)} />
    </group>
  );
};

// ---------------------------------------------------------------- closed books (al-Jabr, lost Arabic original)
const makeCoverTexture = (seed: number, base: string) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 640);
  leatherGrain(g, 512, 640, seed);
  // tooled gold frame and an 8-point star medallion (geometric, no script)
  g.strokeStyle = "#C9973A";
  g.lineWidth = 6;
  g.strokeRect(36, 36, 440, 568);
  g.lineWidth = 2;
  g.strokeRect(52, 52, 408, 536);
  g.save();
  g.translate(256, 320);
  g.fillStyle = "rgba(201,151,58,0.9)";
  for (let k = 0; k < 2; k++) {
    g.rotate(Math.PI / 4);
    g.fillRect(-80, -80, 160, 160);
  }
  g.fillStyle = base;
  g.beginPath();
  g.arc(0, 0, 58, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#C9973A";
  g.lineWidth = 5;
  g.stroke();
  g.restore();
  for (const [x, y] of [[90, 90], [422, 90], [90, 550], [422, 550]]) {
    g.fillStyle = "#C9973A";
    g.beginPath();
    g.arc(x, y, 16, 0, Math.PI * 2);
    g.fill();
  }
  const t = toTex(c);
  return t;
};

const ClosedBook: React.FC<{ pos: V3; rotY: number; base: string; seed: number; opacity?: number; sink?: number }> = ({ pos, rotY, base, seed, opacity = 1, sink = 0 }) => {
  const cover = useMemo(() => makeCoverTexture(seed, base), [seed, base]);
  const transparent = opacity < 0.999;
  return (
    <group position={[pos[0], pos[1] - sink, pos[2]]} rotation={[0, rotY, 0]} scale={[1, 1 - 0.5 * sink * 10, 1]}>
      <mesh position={[0, 0.035, 0]} castShadow={!transparent} receiveShadow>
        <RoundedBoxGeo args={[0.24, 0.07, 0.32]} radius={0.008} />
        <meshStandardMaterial color="#E2CFA2" roughness={0.9} transparent={transparent} opacity={opacity} />
      </mesh>
      {[0.072, -0.002].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow={!transparent}>
          <RoundedBoxGeo args={[0.255, 0.008, 0.335]} radius={0.003} />
          <meshPhysicalMaterial color={base} roughness={0.55} sheen={0.4} sheenColor="#A0503A" transparent={transparent} opacity={opacity} />
        </mesh>
      ))}
      <mesh position={[0, 0.0765, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.24, 0.31]} />
        <meshStandardMaterial map={cover} roughness={0.5} metalness={0.2} transparent={transparent} opacity={opacity} />
      </mesh>
    </group>
  );
};

/** The al-Jabr book (c. 820): tags "± 820", "al-jabr / melengkapi", then "aljabar". */
export const AlJabrBook: React.FC<{ t: number }> = ({ t }) => {
  const a = POS.jabrBook;
  const lift = smooth(prog(t, EV.menulis - 0.3, EV.menulis + 0.6)) * (1 - smooth(prog(t, EV.timbangan, EV.timbangan + 0.8)));
  return (
    <group>
      <group position={[0, lift * 0.03, 0]} rotation={[0, 0, 0]}>
        <ClosedBook pos={a} rotY={0.25} base="#24315A" seed={12} />
      </group>
      <Tag3D anchor={[a[0] - 0.16, 0.08, a[2] - 0.05]} lift={0.16} h={0.075} text="± 820" sub="Baghdad" vis={win(t, EV.tahun - 0.1, EV.suku)} />
      <Tag3D anchor={[a[0] + 0.03, 0.08, a[2]]} lift={0.36} h={0.085} text="al-jabr" sub="melengkapi" style="gold" vis={win(t, EV.aljabrWord - 0.1, EV.suku)} />
      <Tag3D anchor={[a[0] + 0.03, 0.08, a[2]]} lift={0.6} h={0.085} text="aljabar" style="ink" thread={false} vis={win(t, EV.aljabarWord - 0.1, EV.suku)} />
    </group>
  );
};

/** The Arabic original of the arithmetic book: it fades into gold dust at "hilang". */
export const LostBook: React.FC<{ t: number }> = ({ t }) => {
  const glow = useMemo(makeGlowTexture, []);
  const k = smooth(prog(t, EV.teks + 0.2, EV.hilang + 0.9));
  const dust = useMemo(() => {
    const rnd = mulberry32(61);
    return Array.from({ length: 60 }, () => ({ x: (rnd() - 0.5) * 0.26, z: (rnd() - 0.5) * 0.3, v: 0.15 + rnd() * 0.35, ph: rnd() * 6 }));
  }, []);
  const p = POS.ghost;
  const dt = t - (EV.teks + 0.2);
  return (
    <group>
      {k < 0.999 ? <ClosedBook pos={p} rotY={-0.35} base="#5A1A12" seed={33} opacity={1 - k} sink={k * 0.02} /> : null}
      {dt > 0 && dt < 4
        ? dust.map((d, i) => (
            <sprite
              key={i}
              position={[p[0] + d.x + Math.sin(dt * 2 + d.ph) * 0.02, 0.06 + dt * d.v, p[2] + d.z]}
              scale={[0.014, 0.014, 1]}
              onUpdate={fx}
            >
              <spriteMaterial map={glow} color="#FFD58A" transparent opacity={Math.max(0, 0.9 * (1 - dt / 4)) * Math.min(1, dt * 3)} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          ))
        : null}
      <Tag3D anchor={[p[0], 0.09, p[2]]} lift={0.22} h={0.07} text="teks Arab asli" sub="hilang" style="ink" vis={win(t, EV.teks - 0.1, EV.selamat + 0.4)} />
    </group>
  );
};

// ---------------------------------------------------------------- equation board
const BOARD = { w: 0.64, h: 0.42, tilt: -1.05 };
/** Board-local (x, y on the sheet) -> parented inside the tilted group. */
const makeBoardTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1280;
  c.height = 840;
  const g = c.getContext("2d")!;
  parchment(g, 1280, 840, 71);
  // working sheet: vine margins, a rubric header and faint ruling (the reading lines stay clear)
  // denser laid-paper fibres and chain lines, so the sheet reads as handmade paper up close
  const rf = mulberry32(72);
  for (let i = 0; i < 5000; i++) {
    g.strokeStyle = `rgba(110,75,40,${0.04 + rf() * 0.1})`;
    g.lineWidth = 0.8 + rf() * 1.2;
    const x = rf() * 1280;
    const y = rf() * 840;
    const an = rf() * Math.PI;
    const l = 4 + rf() * 18;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l);
    g.stroke();
  }
  for (let y = 0; y < 840; y += 6) {
    g.fillStyle = `rgba(120,85,45,${0.03 + rf() * 0.03})`;
    g.fillRect(0, y, 1280, 1);
  }
  vine(g, 26, 840, 12);
  vine(g, 1220, 840, 13);
  drawPseudoLine(g, 90, 62, 1080, 30, 77, P.rubricRed);
  g.fillStyle = "rgba(42,26,16,0.05)";
  for (let x = 80; x < 1200; x += 40) g.fillRect(x, 90, 1, 720);
  g.strokeStyle = "rgba(176,48,30,0.5)";
  g.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(70, 180 + i * 180);
    g.lineTo(1210, 180 + i * 180);
    g.stroke();
  }
  return toTex(c);
};
const pseudoTex = (seed: number) => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const g = c.getContext("2d")!;
  drawPseudoLine(g, 10, 80, 1000, 54, seed, P.ironGallInk);
  return toTex(c);
};

const SYMBOL = "700 92px Georgia, 'Times New Roman', serif";

/** Words first (as spoken), then the modern symbols; at "menjadi" -4x² crosses the = sign. */
export const EquationBoard: React.FC<{ t: number }> = ({ t }) => {
  const paper = useMemo(makeBoardTexture, []);
  // words in three short rows so each reads at phone size
  const WF = "italic 700 86px Georgia, 'Times New Roman', serif";
  const words = useMemo(
    () => ["x kuadrat sama dengan", "empat puluh x dikurangi", "empat x kuadrat"].map((s) => inkText(s, { font: WF, w: 1300, h: 150 })),
    [],
  );
  const s1a = useMemo(() => inkText("x² = 40x", { font: SYMBOL, color: P.lapis, w: 640, h: 140 }), []);
  const s1b = useMemo(() => inkText("− 4x²", { font: SYMBOL, color: P.rubricRed, w: 400, h: 140 }), []);
  const s2 = useMemo(() => inkText("5x² = 40x", { font: SYMBOL, color: "#8A5A10", w: 640, h: 140 }), []);
  const pseudo = useMemo(() => [pseudoTex(501), pseudoTex(502), pseudoTex(503)], []);
  const p = POS.board;
  const W = BOARD.w;
  // words reveal follows the spoken words
  const kW = [prog(t, EV.eqX - 0.05, EV.eqEmpat - 0.05), prog(t, EV.eqEmpat - 0.05, EV.eqEmpatX - 0.05), prog(t, EV.eqEmpatX - 0.05, EV.eqWordsEnd)];
  const wordsFade = 1 - smooth(prog(t, EV.semua - 0.3, EV.semua + 0.3));
  const symIn = easeOut(prog(t, EV.eqWordsEnd + 0.05, EV.menjadi - 0.05));
  // -4x² jumps over the = sign to the left
  const jump = smooth(prog(t, EV.menjadi, EV.lima + 0.35));
  const s1Fade = 1 - smooth(prog(t, EV.lima + 0.2, EV.lima + 0.6));
  const s2In = easeOut(prog(t, EV.lima + 0.15, EV.lima + 0.7));
  const symOut = 1 - smooth(prog(t, EV.semua - 0.2, EV.semua + 0.4));
  const pseudoK = (i: number) => prog(t, EV.semua + 0.1 + i * 0.5, EV.semua + 0.75 + i * 0.5);
  // payoff glyph tiles: x, +, = rise and are struck out at their words
  const glyphs = [
    { g: "x", at: EV.noX },
    { g: "+", at: EV.noTambah },
    { g: "=", at: EV.noSama },
  ];
  const raise = -Math.PI / 2 + 0.02 + (BOARD.tilt + Math.PI / 2 - 0.02) * smooth(prog(t, EV.simbol - 0.6, EV.eqX - 0.15));
  const rowY = (i: number) => BOARD.h / 2 - 0.058 - i * 0.074;
  const lh = 0.075;
  return (
    <group position={p}>
      {/* hinged writing board: lies flat on the desk, swings up on "Dalam simbol modern" */}
      <group position={[0, 0.035, 0.182]} rotation={[raise, 0, 0]}>
      <group position={[0, BOARD.h / 2 + 0.03, 0]}>
        <mesh position={[0, 0, -0.012]} castShadow receiveShadow>
          <RoundedBoxGeo args={[W + 0.06, BOARD.h + 0.06, 0.02]} radius={0.006} />
          <meshStandardMaterial color="#4A2C18" roughness={0.6} />
        </mesh>
        <mesh receiveShadow>
          <planeGeometry args={[W, BOARD.h]} />
          <meshPhysicalMaterial map={paper} roughness={0.9} sheen={0.15} />
        </mesh>
        {words.map((tx, i) => (
          <group key={i} position={[-W / 2 + 0.035, rowY(i), 0.001]}>
            <RevealPlane tex={tx} w={0.58} h={0.067} k={kW[i]} opacity={wordsFade} />
          </group>
        ))}
        {/* modern symbols, row 3 (x² = 40x − 4x²) and row 4 (5x² = 40x) */}
        <group position={[-W / 2 + 0.05, rowY(3), 0.002]}>
          <RevealPlane tex={s1a} w={0.3} h={lh * 0.85} k={symIn} opacity={s1Fade * symOut} />
          <group position={[0.2 - jump * 0.2, 0, 0.001]}>
            <group position={[0, Math.sin(jump * Math.PI) * 0.05, 0]}>
              <RevealPlane tex={s1b} w={0.19} h={lh * 0.9} k={symIn} opacity={(1 - smooth(prog(t, EV.lima, EV.lima + 0.4))) * symOut} />
            </group>
          </group>
        </group>
        <group position={[-W / 2 + 0.05, rowY(4), 0.002]}>
          <RevealPlane tex={s2} w={0.3} h={lh * 0.95} k={s2In} opacity={symOut} />
        </group>
        {/* payoff: the same board rewritten in words only (pseudo-script) */}
        {pseudo.map((tx, i) => (
          <group key={i} position={[-W / 2 + 0.035, rowY(i + 0.5), 0.003]}>
            <RevealPlane tex={tx} w={0.58} h={0.07} k={pseudoK(i)} />
          </group>
        ))}
        {glyphs.map((gl, i) => {
          const up = easeOut(prog(t, EV.diBuku + i * 0.25, EV.diBuku + 0.6 + i * 0.25));
          const strike = smooth(prog(t, gl.at, gl.at + 0.35));
          const gone = smooth(prog(t, EV.semua - 0.1, EV.semua + 0.4));
          const vis = up * (1 - gone);
          if (vis <= 0.01) return null;
          return <GlyphTile key={i} glyph={gl.g} x={W / 2 + 0.1} y={0.13 - i * 0.13} vis={vis} strike={strike} />;
        })}
      </group>
      </group>
    </group>
  );
};

const glyphTex = new Map<string, THREE.Texture>();
const GlyphTile: React.FC<{ glyph: string; x: number; y: number; vis: number; strike: number }> = ({ glyph, x, y, vis, strike }) => {
  const tex = useMemo(() => {
    const hit = glyphTex.get(glyph);
    if (hit) return hit;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#EFE0BC";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = P.goldDeep;
    g.lineWidth = 14;
    g.strokeRect(10, 10, 236, 236);
    g.fillStyle = P.lapis;
    g.font = "700 190px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(glyph, 128, glyph === "x" ? 112 : 132);
    const t = toTex(c);
    glyphTex.set(glyph, t);
    return t;
  }, [glyph]);
  return (
    <group position={[x, y, 0.03 + 0.04 * vis]} scale={[0.6 + 0.4 * vis, 0.6 + 0.4 * vis, 1]}>
      <mesh castShadow>
        <RoundedBoxGeo args={[0.13, 0.13, 0.02]} radius={0.01} />
        <meshStandardMaterial color="#C9A45C" metalness={0.6} roughness={0.35} transparent opacity={vis} />
      </mesh>
      <mesh position={[0, 0, 0.0105]}>
        <planeGeometry args={[0.115, 0.115]} />
        <meshStandardMaterial map={tex} roughness={0.8} transparent opacity={vis} />
      </mesh>
      {strike > 0.01 ? (
        <mesh position={[-0.065 + 0.065 * strike, 0, 0.013]} rotation={[0, 0, -0.75]}>
          <planeGeometry args={[0.17 * strike, 0.016]} />
          <meshBasicMaterial color={P.rubricRed} transparent opacity={vis} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- uses: inheritance scroll, trade coins
export const Uses: React.FC<{ t: number }> = ({ t }) => {
  const paper = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    parchment(c.getContext("2d")!, 256, 256, 90);
    return toTex(c);
  }, []);
  const s = POS.scroll;
  const c = POS.coins;
  const coins = useMemo(() => {
    const rnd = mulberry32(8);
    return Array.from({ length: 14 }, (_, i) => ({ x: i < 8 ? 0 : (rnd() - 0.5) * 0.16, z: i < 8 ? 0 : (rnd() - 0.5) * 0.12, y: i < 8 ? i * 0.0062 : 0, s: i < 8 ? 0 : 1, r: rnd() * 6 }));
  }, []);
  const hiW = win(t, EV.warisan - 0.1, EV.mana);
  const hiD = win(t, EV.dagang - 0.1, EV.mana);
  return (
    <group>
      {/* sealed inheritance scroll */}
      <group position={s} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.032, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.3, 24]} />
          <meshStandardMaterial map={paper} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.032, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0335, 0.0335, 0.02, 24]} />
          <meshStandardMaterial color={P.rubricRed} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.032, 0.036]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.024, 0.026, 0.01, 20]} />
          <meshPhysicalMaterial color="#8A1A10" roughness={0.3} clearcoat={0.7} emissive="#3A0804" emissiveIntensity={hiW} />
        </mesh>
      </group>
      {/* trade coins */}
      <group position={c}>
        {coins.map((k, i) => (
          <mesh key={i} position={[k.x, 0.004 + k.y, k.z]} rotation={[k.s ? 0.1 * Math.sin(k.r) : 0, k.r, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.0055, 28]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#C0C2C4" : "#D9A436"} metalness={1} roughness={0.28} emissive="#5A3A08" emissiveIntensity={0.4 * hiD} />
          </mesh>
        ))}
      </group>
      <Tag3D anchor={[s[0], 0.07, s[2]]} lift={0.16} h={0.08} text="warisan" vis={hiW} />
      <Tag3D anchor={[c[0], 0.06, c[2]]} lift={0.16} h={0.08} text="dagang" vis={hiD} />
    </group>
  );
};

// ---------------------------------------------------------------- payoff: code slate and phone
const makeCodeTexture = () => {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 440;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0E1412";
  g.fillRect(0, 0, 640, 440);
  const lines: [string, string][] = [
    ["#7FB7A4", "# algoritma"],
    ["#E6B94C", "for step in algorithm:"],
    ["#F3E4C4", "    run(step)"],
    ["#7FB7A4", ""],
    ["#E6B94C", "def balance(a, b):"],
    ["#F3E4C4", "    return a == b"],
  ];
  g.font = "600 34px Consolas, 'Courier New', monospace";
  lines.forEach(([col, s], i) => {
    g.fillStyle = "rgba(243,228,196,0.35)";
    g.fillText(String(i + 1).padStart(2, " "), 20, 70 + i * 58);
    g.fillStyle = col;
    g.fillText(s, 90, 70 + i * 58);
  });
  g.fillStyle = "#E6B94C";
  g.fillRect(90, 70 + 6 * 58 - 28, 18, 34);
  return toTex(c);
};
const makeFeedTexture = () => {
  // a feed whose posts echo the film: a manuscript page and a star-tile pattern (no brands, no real text)
  const c = document.createElement("canvas");
  c.width = 360;
  c.height = 720;
  const g = c.getContext("2d")!;
  g.fillStyle = "#F4EFE6";
  g.fillRect(0, 0, 360, 720);
  g.fillStyle = "#1C120B";
  g.fillRect(0, 0, 360, 56);
  g.fillStyle = "#E6B94C";
  g.fillRect(20, 20, 80, 16);
  for (let k = 0; k < 4; k++) {
    g.fillStyle = "#C9BFAF";
    g.beginPath();
    g.arc(250 + k * 26, 28, 9, 0, Math.PI * 2);
    g.fill();
  }
  const post = (y: number, kind: number) => {
    g.fillStyle = "#ffffff";
    g.fillRect(12, y, 336, 316);
    g.fillStyle = "#3E7F6A";
    g.beginPath();
    g.arc(32, y + 22, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#9A8F80";
    g.fillRect(52, y + 14, 110, 8);
    g.fillRect(52, y + 28, 70, 6);
    if (kind === 0) {
      g.save();
      g.translate(24, y + 44);
      parchment(g, 312, 196, 401);
      drawPseudoLine(g, 70, 40, 220, 18, 402, P.rubricRed);
      for (let i = 0; i < 6; i++) drawPseudoLine(g, 20, 70 + i * 22, 270, 14, 410 + i, P.ironGallInk);
      g.fillStyle = P.lapis;
      g.fillRect(16, 18, 44, 44);
      g.fillStyle = P.goldLeaf;
      g.font = "700 40px Georgia, serif";
      g.fillText("D", 24, 56);
      g.restore();
    } else {
      g.fillStyle = "#24315A";
      g.fillRect(24, y + 44, 312, 196);
      for (let x = 0; x < 6; x++)
        for (let r = 0; r < 4; r++) {
          g.save();
          g.translate(24 + 26 + x * 52, y + 44 + 24 + r * 50);
          g.fillStyle = r % 2 ? "rgba(201,151,58,0.9)" : "rgba(230,185,76,0.75)";
          for (let k = 0; k < 2; k++) {
            g.rotate(Math.PI / 4);
            g.fillRect(-13, -13, 26, 26);
          }
          g.restore();
        }
    }
    g.fillStyle = "#C9BFAF";
    g.fillRect(24, y + 252, 260, 10);
    g.fillRect(24, y + 270, 200, 10);
    g.fillRect(24, y + 288, 230, 10);
    g.fillStyle = "#B0301E";
    g.beginPath();
    g.arc(320, y + 270, 10, 0, Math.PI * 2);
    g.fill();
  };
  post(64, 0);
  post(392, 1);
  return toTex(c);
};


export const CodeSlate: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(makeCodeTexture, []);
  const on = smooth(prog(t, EV.kode - 0.25, EV.kode + 0.25));
  const arrive = smooth(prog(t, EV.noSama + 0.4, EV.naskah - 0.3));
  if (t < EV.noSama + 0.4) return null;
  const p: V3 = [POS.slate[0] + (1 - arrive) * 0.9, POS.slate[1], POS.slate[2]];
  return (
    <group position={p} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.16, 0]} rotation={[-0.25, 0, 0]} castShadow>
        <RoundedBoxGeo args={[0.36, 0.25, 0.014]} radius={0.01} />
        <meshPhysicalMaterial color="#141414" roughness={0.25} clearcoat={0.8} />
      </mesh>
      <group position={[0, 0.16, 0]} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, 0, 0.0075]}>
          <planeGeometry args={[0.33, 0.22]} />
          <meshBasicMaterial map={tex} color={new THREE.Color().setScalar(0.08 + 0.92 * on)} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0, 0.15]} intensity={0.5 * on} distance={1.0} color="#9FD8C4" />
      </group>
      <mesh position={[0, 0.03, -0.04]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.012]} />
        <meshStandardMaterial color="#202020" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* one large label while it is the hero, gone before the phone */}
      <Tag3D anchor={[0, 0.3, 0]} lift={0.025} h={0.03} text="kode program" thread={false} parentYaw={0.35} vis={win(t, EV.kode - 0.05, EV.feed - 0.15, 0.2)} />
    </group>
  );
};

export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(makeFeedTexture, []);
  const on = smooth(prog(t, EV.feed - 0.25, EV.feed + 0.2));
  const scroll = Math.max(0, t - EV.feed) * 0.02;
  tex.offset.y = -(scroll % 0.5);
  tex.wrapT = THREE.RepeatWrapping;
  const arrive = smooth(prog(t, EV.noSama + 0.6, EV.naskah - 0.1));
  if (t < EV.noSama + 0.6) return null;
  const p: V3 = [POS.phone[0] + (1 - arrive) * 0.9, POS.phone[1], POS.phone[2] + (1 - arrive) * 0.2];
  return (
    <group position={p} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0.005, 0]} castShadow>
        <RoundedBoxGeo args={[0.085, 0.009, 0.17]} radius={0.004} />
        <meshPhysicalMaterial color="#111111" roughness={0.2} clearcoat={1} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.0098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.076, 0.158]} />
        <meshBasicMaterial map={tex} color={new THREE.Color().setScalar(0.04 + 0.96 * on)} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.12, 0]} intensity={0.45 * on} distance={0.8} color="#FFF2DA" />
      <Tag3D anchor={[0, 0.03, -0.115]} lift={0.004} h={0.012} text="feed" thread={false} parentYaw={0.5} vis={win(t, EV.feed - 0.05, EV.ponselEnd + 0.4, 0.2)} />
    </group>
  );
};

/** Gold thread of the payoff chain: sand board -> Latin codex -> code -> phone. */
export const ChainThread: React.FC<{ t: number; pts: V3[] }> = ({ t, pts }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 160, 0.006, 8, false);
  }, [pts]);
  const k = prog(t, EV.papan, EV.feed + 0.3);
  const fade = 1 - smooth(prog(t, EV.menyebut, EV.menyebut + 0.8));
  geo.setDrawRange(0, Math.floor(k * 160) * 8 * 6);
  if (k <= 0 || fade <= 0) return null;
  return (
    <mesh geometry={geo} onUpdate={fx}>
      <meshBasicMaterial color="#FFC860" transparent opacity={0.95 * fade} toneMapped={false} />
    </mesh>
  );
};
