// COLLAGE board: a kraft cardboard sheet on a wall with torn, halftone-printed pieces placed by hand on
// twelves, paper tape, and ransom-note letters that spell the title. Pieces sit a few millimetres apart
// in depth, so the key light throws real paper shadows and the camera gets parallax between layers.

import React, { useMemo } from "react";
import * as THREE from "three";
import { SceneText, SCENE_FONTS } from "../../../core/polish/Drei.tsx";
import { useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { paperTexture, type PaperSpec } from "../lib/paper.ts";
import { place } from "../core/motion.ts";
import { COLLAGE_PALETTE as P } from "../lib/palette.ts";

export type Piece = {
  id: string;
  spec: PaperSpec;
  /** width in world units; height follows the aspect */
  w: number;
  x: number;
  y: number;
  /** layer: 0 = on the board, each step is 6 mm closer */
  layer: number;
  rot: number;
  /** seconds: the hand starts placing it */
  t0: number;
  from?: [number, number];
  /** bend of the sheet (paper never lies perfectly flat) */
  curl?: number;
  opacity?: number;
};

const LAYER = 0.006;
/** z of layer 0: just in front of the board face (box front at 0.006), so a curled sheet never dips into it */
const BASE = 0.009;

/** Default poster: sky, city, crowd, a headline, the sun, tape, and a strip for the subtitle. */
export const LAYOUT: Piece[] = [
  { id: "sky", spec: { kind: "sky", seed: 3, aspect: 3.3 / 2.3, ink: P.blue, stock: "#EEF0EA" }, w: 3.3, x: 0, y: 4.95, layer: 1, rot: -0.02, t0: 0.15, from: [0, 0.8], curl: 0.04 },
  { id: "sun", spec: { kind: "sun", seed: 9, aspect: 1, ink: P.red, torn: [true, true, true, true] }, w: 1.0, x: 0.95, y: 5.35, layer: 2, rot: 0.1, t0: 0.95, from: [0.8, 0.5] },
  { id: "city", spec: { kind: "city", seed: 5, aspect: 3.4 / 1.25, ink: P.ink, stock: "#E9E3D4", torn: [true, false, true, false] }, w: 3.4, x: -0.05, y: 3.75, layer: 3, rot: 0.025, t0: 1.6, from: [-0.9, 0.1], curl: 0.03 },
  { id: "news", spec: { kind: "news", seed: 12, aspect: 1.5 / 1.6, ink: P.ink, stock: P.newsprint, headline: "SATU KABAR MENGUBAH SEGALANYA" }, w: 1.5, x: -0.84, y: 2.35, layer: 4, rot: -0.06, t0: 2.5, from: [-0.8, -0.3], curl: 0.05 },
  { id: "crowd", spec: { kind: "crowd", seed: 21, aspect: 1.75 / 1.35, ink: P.teal, stock: "#EDE9DD" }, w: 1.75, x: 0.82, y: 2.45, layer: 5, rot: 0.05, t0: 3.3, from: [0.9, -0.2], curl: 0.04 },
  { id: "tape1", spec: { kind: "tape", seed: 41, aspect: 0.62 / 0.17, ink: P.tape, torn: [false, true, false, true] }, w: 0.62, x: -0.3, y: 3.12, layer: 6, rot: -0.55, t0: 4.1, from: [0.3, 0.6], opacity: 0.88 },
  { id: "tape2", spec: { kind: "tape", seed: 43, aspect: 0.58 / 0.17, ink: P.tape, torn: [false, true, false, true] }, w: 0.58, x: 1.45, y: 3.1, layer: 6, rot: 0.6, t0: 4.35, from: [0.6, 0.4], opacity: 0.88 },
  { id: "strip", spec: { kind: "plain", seed: 51, aspect: 2.9 / 0.36, ink: P.ochre, torn: [true, false, true, false] }, w: 2.9, x: 0.05, y: 1.3, layer: 2, rot: -0.03, t0: 5.0, from: [-1, 0], curl: 0 },
];

/** Ransom letters: each on its own scrap, a different face and ink. */
export const LETTERS = [
  { ch: "A", font: "display", ink: P.ink, paper: P.paper, w: 0.6, rot: -0.12 },
  { ch: "U", font: "serif", ink: P.red, paper: "#F7E9C8", w: 0.58, rot: 0.08 },
  { ch: "D", font: "sans", ink: P.paper, paper: P.blue, w: 0.6, rot: -0.05 },
  { ch: "I", font: "display", ink: P.ink, paper: P.pink, w: 0.43, rot: 0.14 },
  { ch: "R", font: "serifItalic", ink: P.ink, paper: P.newsprint, w: 0.6, rot: -0.09 },
  { ch: "A", font: "sans", ink: P.paper, paper: P.red, w: 0.6, rot: 0.1 },
] as const;
export const LETTERS_Y = 0.72;
export const LETTERS_T0 = 6.6;
export const LETTER_STEP = 0.42;

const sheetGeo = (w: number, h: number, curl: number) => {
  const g = new THREE.PlaneGeometry(w, h, 18, 6);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / (w / 2);
    p.setZ(i, curl * u * u);
  }
  g.computeVertexNormals();
  return g;
};

const Sheet: React.FC<{ piece: Piece; t: number; index: number }> = ({ piece, t, index }) => {
  const h = piece.w / piece.spec.aspect;
  const tex = useMemo(() => paperTexture(piece.spec), [piece.spec]);
  const geo = useMemo(() => sheetGeo(piece.w, h, piece.curl ?? 0.02), [piece.w, h, piece.curl]);
  const s = place(t, piece.t0, index, piece.from);
  if (!s.shown) return null;
  return (
    <mesh
      geometry={geo}
      position={[piece.x + s.dx, piece.y + s.dy, BASE + piece.layer * LAYER + s.lift]}
      rotation={[0, 0, piece.rot + s.rot]}
      scale={[s.press, s.press, 1]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        map={tex}
        alphaTest={0.5}
        transparent={piece.opacity !== undefined}
        opacity={piece.opacity ?? 1}
        roughness={0.92}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Letter: React.FC<{ i: number; t: number; x: number }> = ({ i, t, x }) => {
  const L = LETTERS[i];
  const h = L.w * 1.22;
  const spec = useMemo<PaperSpec>(() => ({ kind: "plain", seed: 70 + i, aspect: L.w / h, ink: L.paper }), [i, L.w, h, L.paper]);
  const tex = useMemo(() => paperTexture(spec), [spec]);
  const t0 = LETTERS_T0 + i * LETTER_STEP;
  const s = place(t, t0, 20 + i, [i % 2 ? 0.5 : -0.5, 0.7]);
  if (!s.shown) return null;
  return (
    <group position={[x + s.dx, LETTERS_Y + s.dy, BASE + 8 * LAYER + s.lift + i * 0.001]} rotation={[0, 0, L.rot + s.rot]} scale={[s.press, s.press, 1]}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[L.w, h]} />
        <meshStandardMaterial map={tex} alphaTest={0.5} roughness={0.9} />
      </mesh>
      <SceneText font={L.font as keyof typeof SCENE_FONTS} position={[0, -0.01, 0.002]} fontSize={h * 0.74} color={L.ink} anchorX="center" anchorY="middle">
        {L.ch}
      </SceneText>
    </group>
  );
};

/** x of each letter, packed edge to edge with a small overlap like cut scraps. */
export const letterXs = () => {
  const total = LETTERS.reduce((a, l) => a + l.w * 0.94, 0);
  let x = -total / 2;
  return LETTERS.map((l) => {
    const c = x + (l.w * 0.94) / 2;
    x += l.w * 0.94;
    return c;
  });
};

/** Kraft board on a dark wall. */
export const Board: React.FC = () => {
  const grain = useSurfaceGrain(17, 0.35, 6);
  return (
    <group>
      <mesh position={[0, 3.0, -0.02]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={P.bg} roughness={1} />
      </mesh>
      <mesh position={[0, 3.05, 0]} receiveShadow>
        <boxGeometry args={[3.9, 6.3, 0.012]} />
        <meshStandardMaterial color={P.kraft} roughness={0.95} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} />
      </mesh>
      {/* corrugated edge of the cardboard */}
      <mesh position={[0, 3.05, -0.004]}>
        <boxGeometry args={[3.95, 6.35, 0.008]} />
        <meshStandardMaterial color={P.kraftDark} roughness={1} />
      </mesh>
    </group>
  );
};

export const Collage3D: React.FC<{ t: number; subtitle?: string }> = ({ t, subtitle = "CERITA DARI POTONGAN" }) => {
  const xs = letterXs();
  const strip = LAYOUT.find((p) => p.id === "strip")!;
  const stripOn = place(t, strip.t0, 99, strip.from);
  return (
    <group>
      <Board />
      {LAYOUT.map((p, i) => (
        <Sheet key={p.id} piece={p} t={t} index={i} />
      ))}
      {stripOn.shown && t > strip.t0 + 0.45 && (
        <SceneText font="sans" position={[strip.x, strip.y, BASE + strip.layer * LAYER + 0.006]} rotation={[0, 0, strip.rot]} fontSize={0.12} letterSpacing={0.12} maxWidth={strip.w * 0.86} textAlign="center" color={P.ink} anchorX="center" anchorY="middle">
          {subtitle}
        </SceneText>
      )}
      {LETTERS.map((_, i) => (
        <Letter key={i} i={i} t={t} x={xs[i]} />
      ))}
    </group>
  );
};
