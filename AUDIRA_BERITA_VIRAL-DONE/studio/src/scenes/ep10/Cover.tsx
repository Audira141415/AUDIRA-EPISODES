// EP10 topic cover (COLLAGE): two sitting vice-presidents who resigned, compared on one kraft board.
// The board is two halves taped together: Indonesia 1956 (red ink) on the left, USA 1973 (blue ink)
// on the right, a "1956 VS 1973" strip over the seam and the ransom-note title WAPRES MUNDUR on top.
// No faces of the real people: an object still life (peci + round spectacles, a gavel) and name tags.
// Facts only from EP10 research/SOURCE_REGISTER.md (rows 1, 4: HIGH).

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SceneText, SCENE_FONTS } from "../../core/polish/Drei.tsx";
import { paperTexture, type PaperSpec } from "../../kits/collage/lib/paper.ts";
import { COLLAGE_PALETTE as P } from "../../kits/collage/lib/palette.ts";
import {
  scrapTexture, newsPrint, tagPrint, stripPrint, tapeBrandPrint,
  colonnadePhoto, capitolPhoto, peciPhoto, gavelPhoto, type ScrapSpec,
} from "./coverTextures.ts";

const LAYER = 0.006;
const BASE = 0.009;
const RED = "#C8362A";
const BLUE = "#2A55A0";

type CoverPiece = { id: string; spec: ScrapSpec; w: number; h: number; x: number; y: number; layer: number; rot: number; curl?: number; opacity?: number };

/** Board layout in world units (board centre y = 3.05, halves 1.94 wide). Exported for the film. */
export const COVER_PIECES: CoverPiece[] = [
  // --- Indonesia 1956 (left, red) ---
  { id: "newsHatta", w: 1.62, h: 1.1, x: -1.1, y: 3.3, layer: 2, rot: -0.04, curl: 0.012,
    spec: { key: "newsHatta", seed: 101, aspect: 1.62 / 1.1, stock: P.newsprint, torn: [true, true, false, true], print: newsPrint("1 DES 1956", ["HATTA", "MUNDUR"], P.ink, RED) } },
  { id: "colonnade", w: 1.6, h: 1.16, x: -1.08, y: 2.12, layer: 1, rot: 0.03, curl: 0.012,
    spec: { key: "colonnade", seed: 102, aspect: 1.6 / 1.16, stock: "#F1E9DA", photo: colonnadePhoto, ink: RED } },
  { id: "peci", w: 0.84, h: 0.76, x: -1.42, y: 1.5, layer: 3, rot: -0.09, curl: 0.008,
    spec: { key: "peci", seed: 103, aspect: 0.84 / 0.76, stock: "#F4D9D2", photo: peciPhoto, ink: P.ink, cell: 9 } },
  { id: "tagHatta", w: 1.62, h: 0.5, x: -1.02, y: 0.84, layer: 4, rot: 0.03, curl: 0.0,
    spec: { key: "tagHatta", seed: 104, aspect: 1.62 / 0.5, stock: P.ochre, torn: [true, false, true, false], print: tagPrint("MOHAMMAD HATTA", "WAPRES RI", P.ink, "#7A1E14") } },
  // --- USA 1973 (right, blue) ---
  { id: "newsAgnew", w: 1.62, h: 1.1, x: 1.1, y: 3.26, layer: 2, rot: 0.035, curl: 0.012,
    spec: { key: "newsAgnew", seed: 201, aspect: 1.62 / 1.1, stock: "#EDE6D3", torn: [true, true, false, true], print: newsPrint("10 OCT 1973", ["AGNEW", "RESIGNS"], P.ink, BLUE) } },
  { id: "capitol", w: 1.6, h: 1.18, x: 1.08, y: 2.1, layer: 1, rot: -0.03, curl: 0.012,
    spec: { key: "capitol", seed: 202, aspect: 1.6 / 1.18, stock: "#ECEEEA", photo: capitolPhoto, ink: BLUE } },
  { id: "gavel", w: 0.82, h: 0.74, x: 1.44, y: 1.52, layer: 3, rot: 0.1, curl: 0.008,
    spec: { key: "gavel", seed: 203, aspect: 0.82 / 0.74, stock: "#D3E0EF", photo: gavelPhoto, ink: P.ink, cell: 9 } },
  { id: "tagAgnew", w: 1.62, h: 0.5, x: 1.04, y: 0.8, layer: 4, rot: -0.03, curl: 0.0,
    spec: { key: "tagAgnew", seed: 204, aspect: 1.62 / 0.5, stock: P.pink, torn: [true, false, true, false], print: tagPrint("SPIRO AGNEW", "WAPRES AS", P.ink, "#173A78") } },
  // --- the seam ---
  { id: "strip", w: 0.62, h: 2.3, x: 0.0, y: 2.55, layer: 6, rot: 0.015, curl: 0.0,
    spec: { key: "strip", seed: 301, aspect: 0.62 / 2.3, stock: "#F5EFE2", torn: [false, true, false, true], print: stripPrint("1956", "1973", RED, BLUE, P.ink) } },
  { id: "tapeBrand", w: 1.0, h: 0.27, x: 0.0, y: 1.4, layer: 8, rot: -0.07, opacity: 0.92,
    spec: { key: "tapeBrand", seed: 302, aspect: 1.0 / 0.27, stock: P.tape, tape: true, torn: [false, true, false, true], print: tapeBrandPrint("#4A3A1E") } },
];

/** Plain kit tape strips holding corners. */
const TAPES: { x: number; y: number; w: number; rot: number; seed: number }[] = [
  { x: -1.72, y: 2.72, w: 0.5, rot: 0.7, seed: 41 },
  { x: 1.72, y: 2.7, w: 0.5, rot: -0.65, seed: 43 },
  { x: 0.02, y: 3.66, w: 0.62, rot: 0.06, seed: 45 },
  { x: 0.0, y: 5.95, w: 0.7, rot: -0.04, seed: 47 },
];

/** Ransom title: one scrap per letter, mixed faces and inks. */
const TITLE: { row: string; y: number }[] = [
  { row: "WAPRES", y: 4.82 },
  { row: "MUNDUR", y: 4.1 },
];
const FONTS: (keyof typeof SCENE_FONTS)[] = ["display", "serif", "sans", "display", "serifItalic", "sans"];
const PAPERS = [P.paper, "#F7E9C8", BLUE, P.pink, P.newsprint, RED, P.ochre, P.paper, P.ink, "#F7E9C8", P.teal, P.newsprint];
const INKS = [P.ink, RED, P.paper, P.ink, P.ink, P.paper, P.ink, BLUE, P.paper, P.ink, P.paper, RED];

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

const Scrap: React.FC<{ p: CoverPiece; off?: [number, number, number] }> = ({ p, off = [0, 0, 0] }) => {
  const tex = useMemo(() => scrapTexture(p.spec), [p.spec]);
  const geo = useMemo(() => sheetGeo(p.w, p.h, p.curl ?? 0.02), [p.w, p.h, p.curl]);
  return (
    <mesh geometry={geo} position={[p.x + off[0], p.y + off[1], BASE + p.layer * LAYER + off[2]]} rotation={[0, 0, p.rot]} castShadow receiveShadow>
      <meshStandardMaterial map={tex} alphaTest={0.5} transparent={p.opacity !== undefined} opacity={p.opacity ?? 1} roughness={0.92} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Tape: React.FC<{ x: number; y: number; w: number; rot: number; seed: number }> = ({ x, y, w, rot, seed }) => {
  const spec = useMemo<PaperSpec>(() => ({ kind: "tape", seed, aspect: w / 0.17, ink: P.tape, torn: [false, true, false, true] }), [seed, w]);
  const tex = useMemo(() => paperTexture(spec), [spec]);
  return (
    <mesh position={[x, y, BASE + 9 * LAYER]} rotation={[0, 0, rot]} castShadow>
      <planeGeometry args={[w, 0.17]} />
      <meshStandardMaterial map={tex} alphaTest={0.5} transparent opacity={0.86} roughness={0.7} />
    </mesh>
  );
};

const Letter: React.FC<{ ch: string; i: number; x: number; y: number; w: number }> = ({ ch, i, x, y, w }) => {
  const h = 0.7;
  const spec = useMemo<PaperSpec>(() => ({ kind: "plain", seed: 500 + i, aspect: w / h, ink: PAPERS[i % PAPERS.length] }), [i, w]);
  const tex = useMemo(() => paperTexture(spec), [spec]);
  const rot = (((i * 37) % 9) - 4) * 0.032;
  const dy = (((i * 53) % 5) - 2) * 0.025;
  return (
    <group position={[x, y + dy, BASE + 10 * LAYER + i * 0.0012]} rotation={[0, 0, rot]}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} alphaTest={0.5} roughness={0.9} />
      </mesh>
      <SceneText font={FONTS[i % FONTS.length]} position={[0, -0.01, 0.002]} fontSize={h * 0.74} color={INKS[i % INKS.length]} anchorX="center" anchorY="middle">
        {ch}
      </SceneText>
    </group>
  );
};

const RansomTitle: React.FC = () => {
  let idx = 0;
  return (
    <group>
      {TITLE.map(({ row, y }) => {
        const ws = row.split("").map((c) => (c === "W" || c === "M" ? 0.66 : 0.54));
        const total = ws.reduce((a, b) => a + b * 0.95, 0);
        let x = -total / 2;
        return row.split("").map((ch, k) => {
          const cx = x + (ws[k] * 0.95) / 2;
          x += ws[k] * 0.95;
          const i = idx++;
          return <Letter key={`${row}${k}`} ch={ch} i={i} x={cx} y={y} w={ws[k]} />;
        });
      })}
    </group>
  );
};

/** Two kraft halves, butted together at x = 0, on a dark wall. */
const SplitBoard: React.FC = () => {
  const grain = useSurfaceGrain(17, 0.35, 6);
  const grain2 = useSurfaceGrain(23, 0.35, 6);
  return (
    <group>
      <mesh position={[0, 3.0, -0.03]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={P.bg} roughness={1} />
      </mesh>
      {[
        { x: -0.985, rot: 0.004, g: grain, c: P.kraft },
        { x: 0.985, rot: -0.005, g: grain2, c: "#B0855A" },
      ].map((b, i) => (
        <group key={i} position={[b.x, 3.05, 0]} rotation={[0, 0, b.rot]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[1.95, 6.3, 0.012]} />
            <meshStandardMaterial color={b.c} roughness={0.95} roughnessMap={b.g} bumpMap={b.g} bumpScale={0.6} />
          </mesh>
          <mesh position={[0, 0, -0.004]}>
            <boxGeometry args={[1.99, 6.34, 0.008]} />
            <meshStandardMaterial color={P.kraftDark} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Hook framing (the film opens on this): straight on, a hair off-axis for paper-shadow parallax. */
export const COVER_CAMERA = { target: [0, 2.72, 0] as [number, number, number], dist: 12.4, az: -3, el: 2.5, fov: 34 };

export const coverShot = (): Shot => {
  const { target, dist, az, el, fov } = COVER_CAMERA;
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  const pos: [number, number, number] = [target[0] + dist * Math.sin(a) * Math.cos(e), target[1] + dist * Math.sin(e), target[2] + dist * Math.cos(a) * Math.cos(e)];
  return { pos, target, fov, focus: dist, aperture: 0, maxBlur: 0, exposure: 1 };
};

/** The cover board. The film may slide single pieces off (`offset` returns null = removed); the cover passes nothing. */
export const CoverWorld: React.FC<{ offset?: (id: string) => [number, number, number] | null }> = ({ offset }) => (
  <group>
    <SplitBoard />
    {COVER_PIECES.map((p) => {
      const o = offset ? offset(p.id) : [0, 0, 0] as [number, number, number];
      return o === null ? null : <Scrap key={p.id} p={p} off={o} />;
    })}
    {TAPES.map((t) => (
      <Tape key={t.seed} {...t} />
    ))}
    <RansomTitle />
  </group>
);

export const CoverLights: React.FC = () => (
  <>
    <hemisphereLight args={["#FFF1DE", "#2B2118", 0.42]} />
    <directionalLight
      position={[-2.2, 6.4, 3.4]}
      intensity={2.6}
      color={P.lamp}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-2.5}
      shadow-camera-right={2.5}
      shadow-camera-top={6.6}
      shadow-camera-bottom={-0.6}
      shadow-bias={-0.0002}
      shadow-normalBias={0.01}
      shadow-radius={4}
    />
    <directionalLight position={[2.6, 2.0, 2.2]} intensity={0.45} color={P.rim} />
  </>
);

/** Kicker chip, top left from y = 262 px (clear of the signature start band). */
export const CoverOverlay: React.FC = () => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 262 * s, left: 60 * s, transform: "rotate(-1.4deg)", transformOrigin: "left top" }}>
        <div
          style={{
            background: P.chip, color: P.hud, fontFamily: "'Courier New', monospace", fontWeight: 700,
            fontSize: 36 * s, letterSpacing: 4 * s, padding: `${10 * s}px ${22 * s}px`,
            clipPath: "polygon(0 6%, 4% 0, 97% 3%, 100% 40%, 98% 100%, 3% 95%, 0 60%)",
          }}
        >
          <span style={{ color: P.accent }}>SEJARAH </span>DUNIA
        </div>
      </div>
    </div>
  );
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const shot = coverShot();
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 60 }}>
        <CameraRig shot={shot} near={0.05} far={60} />
        <CoverLights />
        <CoverWorld />
        <Finish frame={frame} background={P.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} envIntensity={0.25} exposure={0.95} />
      </ThreeCanvas>
      <CoverOverlay />
    </AbsoluteFill>
  );
};
