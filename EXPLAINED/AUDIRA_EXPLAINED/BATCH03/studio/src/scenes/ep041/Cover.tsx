// EP041 cover (ISOCRAFT): an isometric apartment tower with its front face cut away. The top floors
// (LT 50/49/48) and the ground floor + basement are drawn; the 46 floors in between are a comic "torn"
// break that the pipes cross. Each floor has a sink (with U-trap) and a toilet draining into one big
// soil stack, cut open to show the brown water ring on its wall and the air core in the middle; a
// parallel vent pipe (one Y cross-connection in the break) exits the roof. At the base the stack bends
// into the STP; a sump pit + pump sits in the basement. Clean water: lower tank + transfer pump on
// LT 1 -> up-pipe -> roof tank -> gravity riser to the floors.
// Ink lines: inverted-hull outlines (back-face shells) + edge lines for inner creases.
// Deterministic: fixed geometry, motion only from useCurrentFrame().

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { loadFont as loadTitle } from "@remotion/google-fonts/Oswald";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

export const { fontFamily: TITLE } = loadTitle("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const PAL = {
  paper: "#F5F2EB",
  ink: "#1C1E21",
  shadow: "#7A9BB8",
  coral: "#E06D53",
  coralDark: "#B9533D",
  mint: "#5FA084",
  steel: "#D1D8E0",
  yellow: "#F4C430",
  wall: "#F1E9DA",
  wallBack: "#E2D6BF",
  floor: "#EBDDBF",
  slab: "#B9AE9A",
  soil: "#C08A55",
  soilDark: "#8E6236",
  blue: "#2F7DCC",
  blueLight: "#8EC5EE",
  waste: "#7B4F1E",
  grey: "#8C949C",
};

// ---------- layout ----------
export const FLOOR_H = 1.25;
export const GAP = 1.05; // torn break standing in for LT 2..LT 47
export const W = 5.4;
export const D = 2.6;
export const X0 = -W / 2;
export const Z0 = -D / 2;
export const GAP_Y0 = FLOOR_H; // top of LT 1
export const GAP_Y1 = FLOOR_H + GAP; // floor of LT 48
export const LEVELS = [
  { y: 0, label: "LT 1", lobby: true },
  { y: GAP_Y1, label: "LT 48", lobby: false },
  { y: GAP_Y1 + FLOOR_H, label: "LT 49", lobby: false },
  { y: GAP_Y1 + 2 * FLOOR_H, label: "LT 50", lobby: false },
];
export const ROOF_Y = GAP_Y1 + 3 * FLOOR_H;
export const BASE_Y = -2.0;
export const STACK_X = 0.75;
export const STACK_Z = -0.8;
export const STACK_R = 0.26;
export const VENT_X = 1.35;
export const VENT_Z = -1.0;
export const UP_X = -1.95;
export const RISER_X = -2.35;
export const HULL = 0.024; // ink outline thickness (world units)

// ---------- ink primitives ----------
export const edgeMat = new THREE.LineBasicMaterial({ color: PAL.ink });
export const hullMat = new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide });
export const inkMat = new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.DoubleSide });

export const InkBox: React.FC<{
  size: [number, number, number];
  pos: [number, number, number];
  color: string;
  opacity?: number;
  rot?: [number, number, number];
  edges?: boolean;
}> = ({ size, pos, color, opacity = 1, rot = [0, 0, 0], edges = true }) => {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]);
  const eg = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const solid = opacity >= 1;
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo}>
        <meshToonMaterial color={color} transparent={!solid} opacity={opacity} depthWrite={solid} />
      </mesh>
      {solid && edges && (
        <mesh geometry={geo} material={hullMat} scale={[(size[0] + 2 * HULL) / size[0], (size[1] + 2 * HULL) / size[1], (size[2] + 2 * HULL) / size[2]]} />
      )}
      {edges && <lineSegments geometry={eg} material={edgeMat} />}
    </group>
  );
};

export const InkCyl: React.FC<{
  r: number;
  h: number;
  pos: [number, number, number];
  color: string;
  opacity?: number;
  rot?: [number, number, number];
  seg?: number;
}> = ({ r, h, pos, color, opacity = 1, rot = [0, 0, 0], seg = 24 }) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, h, seg), [r, h, seg]);
  const hull = useMemo(() => new THREE.CylinderGeometry(r + HULL, r + HULL, h + 2 * HULL, seg), [r, h, seg]);
  const eg = useMemo(() => new THREE.EdgesGeometry(geo, 30), [geo]);
  const solid = opacity >= 1;
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo}>
        <meshToonMaterial color={color} transparent={!solid} opacity={opacity} depthWrite={solid} />
      </mesh>
      {solid && <mesh geometry={hull} material={hullMat} />}
      <lineSegments geometry={eg} material={edgeMat} />
    </group>
  );
};

// Canvas-texture tag (comic label plate) — system font, drawn once.
const useTagTexture = (text: string, bg: string, fg: string, w: number, h: number) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = PAL.ink;
    g.lineWidth = 14;
    g.strokeRect(7, 7, w - 14, h - 14);
    g.fillStyle = fg;
    g.font = "bold 104px Impact, 'Arial Black', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 4);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [text, bg, fg, w, h]);

export const Tag: React.FC<{ text: string; pos: [number, number, number]; w: number; h: number; bg?: string; fg?: string; rot?: [number, number, number] }> = ({
  text, pos, w, h, bg = PAL.yellow, fg = PAL.ink, rot = [0, 0, 0],
}) => {
  const tex = useTagTexture(text, bg, fg, Math.round(160 * (w / h)), 160);
  return (
    <group position={pos} rotation={rot}>
      {/* drop shadow plate, comic offset */}
      <mesh position={[0.05, -0.05, -0.005]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={PAL.ink} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  );
};

// torn-paper zigzag ink ribbon along x (front cut) of length len
export const ZigZag: React.FC<{ len: number; pos: [number, number, number]; rot?: [number, number, number] }> = ({ len, pos, rot = [0, 0, 0] }) => {
  const geo = useMemo(() => {
    const n = Math.round(len / 0.22);
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= n; i++) pts.push(new THREE.Vector2(-len / 2 + (i * len) / n, i % 2 ? 0.07 : -0.07));
    const shape = new THREE.Shape();
    shape.moveTo(pts[0].x, pts[0].y + 0.035);
    pts.forEach((p) => shape.lineTo(p.x, p.y + 0.035));
    for (let i = pts.length - 1; i >= 0; i--) shape.lineTo(pts[i].x, pts[i].y - 0.035);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [len]);
  return <mesh geometry={geo} material={inkMat} position={pos} rotation={rot} />;
};

// ---------- fixtures ----------
export const Sink: React.FC<{ y: number; x: number }> = ({ x, y }) => (
  <group>
    <InkBox size={[0.6, 0.44, 0.44]} pos={[x, y + 0.22, Z0 + 0.32]} color={PAL.wall} />
    <InkBox size={[0.66, 0.08, 0.5]} pos={[x, y + 0.48, Z0 + 0.32]} color={PAL.steel} />
    <InkCyl r={0.03} h={0.2} pos={[x, y + 0.6, Z0 + 0.14]} color={PAL.steel} seg={8} />
    <InkBox size={[0.05, 0.04, 0.16]} pos={[x, y + 0.69, Z0 + 0.21]} color={PAL.steel} edges={false} />
  </group>
);

export const Toilet: React.FC<{ y: number; x: number }> = ({ x, y }) => (
  <group>
    <InkBox size={[0.46, 0.55, 0.18]} pos={[x, y + 0.5, Z0 + 0.12]} color="#FFFFFF" />
    <InkCyl r={0.19} h={0.34} pos={[x, y + 0.17, Z0 + 0.45]} color="#FFFFFF" seg={18} />
    <InkCyl r={0.22} h={0.05} pos={[x, y + 0.365, Z0 + 0.45]} color={PAL.steel} seg={18} />
  </group>
);

export const Floor: React.FC<{ y: number; label: string; lobby: boolean; top: boolean; f: number; k: number }> = ({ y, label, lobby, top, f, k }) => {
  const sinkX = -1.25;
  const toiletX = -0.25;
  const ph = ((f * 0.02 + k * 0.37) % 1 + 1) % 1;
  const wallH = FLOOR_H - 0.1;
  return (
    <group>
      <InkBox size={[W, 0.1, D]} pos={[0, y - 0.05, 0]} color={PAL.floor} />
      <InkBox size={[W, wallH, 0.08]} pos={[0, y + wallH / 2, Z0 - 0.04]} color={lobby ? PAL.wallBack : PAL.wall} />
      <InkBox size={[0.08, wallH, D]} pos={[X0 - 0.04, y + wallH / 2, 0]} color={PAL.wallBack} />
      <InkBox size={[4.1, 0.42, 0.02]} pos={[-0.65, y + 0.21, Z0 + 0.01]} color={PAL.blueLight} />
      {lobby && (
        <>
          {/* ceiling slab of LT 1 (bottom edge of the torn break) */}
          <InkBox size={[W, 0.1, D]} pos={[0, FLOOR_H - 0.05, 0]} color={PAL.slab} />
          {/* lower clean-water tank + transfer pump */}
          <InkBox size={[1.0, 0.62, 0.85]} pos={[-1.05, y + 0.31, -0.75]} color={PAL.blue} />
          <InkBox size={[1.02, 0.05, 0.87]} pos={[-1.05, y + 0.645, -0.75]} color={PAL.blueLight} />
          <InkBox size={[0.38, 0.28, 0.32]} pos={[UP_X, y + 0.14, -0.85]} color={PAL.blue} />
          <InkCyl r={0.12} h={0.3} pos={[UP_X, y + 0.43, -0.85]} color={PAL.steel} seg={12} />
          <Tag text="POMPA" pos={[-1.5, y + 0.95, 0.2]} w={0.95} h={0.3} bg="#FFFFFF" fg={PAL.blue} />
        </>
      )}
      {!lobby && (
        <>
          <InkBox size={[0.06, wallH, 1.3]} pos={[1.75, y + wallH / 2, Z0 + 0.65]} color={PAL.wall} />
          <InkBox size={[0.85, 0.22, 1.5]} pos={[2.25, y + 0.11, Z0 + 0.85]} color={PAL.wall} />
          <InkBox size={[0.85, 0.08, 1.15]} pos={[2.25, y + 0.26, Z0 + 1.02]} color={PAL.coral} />
          <InkBox size={[0.85, 0.4, 0.1]} pos={[2.25, y + 0.2, Z0 + 0.06]} color={PAL.coralDark} />
          <Sink x={sinkX} y={y} />
          <Toilet x={toiletX} y={y} />
          {/* branch pipe: sink -> toilet -> stack, sloped */}
          <InkCyl r={0.05} h={STACK_X - sinkX - STACK_R} pos={[(STACK_X - STACK_R + sinkX) / 2, y + 0.09, Z0 + 0.32]} rot={[0, 0, Math.PI / 2 - 0.04]} color={PAL.grey} seg={10} />
          {/* U-trap (water seal) under the sink */}
          <InkCyl r={0.05} h={0.12} pos={[sinkX, y + 0.37, Z0 + 0.52]} color={PAL.grey} seg={10} />
          <mesh position={[sinkX, y + 0.28, Z0 + 0.42]} rotation={[0, Math.PI / 2, Math.PI]}>
            <torusGeometry args={[0.1, 0.05, 8, 16, Math.PI]} />
            <meshToonMaterial color={PAL.grey} />
          </mesh>
          <InkCyl r={0.05} h={0.2} pos={[sinkX, y + 0.19, Z0 + 0.32]} color={PAL.grey} seg={10} />
          {/* clean-water tap line from the riser */}
          <InkCyl r={0.035} h={sinkX - RISER_X} pos={[(sinkX + RISER_X) / 2, y + 0.74, -0.95]} rot={[0, 0, Math.PI / 2]} color={PAL.blue} seg={8} />
          <mesh position={[sinkX, y + 0.44 - ph * 0.25, Z0 + 0.32]} scale={[1, 1.6, 1]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshToonMaterial color={PAL.blue} />
          </mesh>
        </>
      )}
      <Tag text={label} pos={[X0 + 0.62, y + 0.72, D / 2 + 0.06]} w={1.05} h={0.38} bg={top ? PAL.coral : PAL.yellow} fg={top ? "#FFFFFF" : PAL.ink} />
    </group>
  );
};

// right facade (+x): lower piece (LT 1) and upper piece (LT 48..50), torn at the break
export const Facade: React.FC = () => {
  const wins: React.ReactElement[] = [];
  LEVELS.forEach((lv, i) => {
    for (let k = 0; k < 2; k++) {
      wins.push(<InkBox key={`${i}-${k}`} size={[0.03, 0.64, 0.8]} pos={[W / 2 + 0.115, lv.y + 0.6, Z0 + 0.7 + k * 1.2]} color={PAL.blueLight} />);
    }
  });
  const upH = ROOF_Y - GAP_Y1 + 0.1;
  return (
    <group>
      <InkBox size={[0.1, FLOOR_H, D]} pos={[W / 2 + 0.05, FLOOR_H / 2, 0]} color={PAL.coral} />
      <InkBox size={[0.1, upH, D]} pos={[W / 2 + 0.05, GAP_Y1 - 0.1 + upH / 2, 0]} color={PAL.coral} />
      {wins}
    </group>
  );
};

// the break: torn edges + dashed pipes + "46 lantai" tag + one vent cross-connection
export const Break: React.FC = () => {
  const dash = (x: number, z: number, r: number, color: string, key: string) =>
    Array.from({ length: 4 }, (_, i) => (
      <InkCyl key={`${key}${i}`} r={r} h={0.13} pos={[x, GAP_Y0 + 0.14 + i * 0.25, z]} color={color} seg={14} />
    ));
  return (
    <group>
      <ZigZag len={W + 0.1} pos={[0, GAP_Y0 + 0.02, D / 2 + 0.02]} />
      <ZigZag len={W + 0.1} pos={[0, GAP_Y1 - 0.12, D / 2 + 0.02]} />
      <ZigZag len={D} pos={[W / 2 + 0.11, GAP_Y0 + 0.02, 0]} rot={[0, Math.PI / 2, 0]} />
      <ZigZag len={D} pos={[W / 2 + 0.11, GAP_Y1 - 0.12, 0]} rot={[0, Math.PI / 2, 0]} />
      {dash(VENT_X, VENT_Z, 0.1, PAL.yellow, "v")}
      {dash(UP_X, -1.15, 0.06, PAL.blue, "u")}
      {dash(RISER_X, -0.95, 0.07, PAL.blue, "r")}
      <Tag text="··· 46 LANTAI ···" pos={[-0.65, GAP_Y0 + GAP / 2 - 0.02, 0.6]} w={2.3} h={0.42} bg="#FFFFFF" fg={PAL.ink} />
    </group>
  );
};

// soil stack, cut open: grey wall, brown water ring on the inner wall, empty air core
export const StackPiece: React.FC<{ y0: number; y1: number; f: number; seed: number; cap?: boolean }> = ({ y0, y1, f, seed, cap }) => {
  const len = y1 - y0;
  const wall = useMemo(() => new THREE.CylinderGeometry(STACK_R, STACK_R, len, 36, 1, true, Math.PI / 2, Math.PI), [len]);
  const film = useMemo(() => new THREE.CylinderGeometry(STACK_R - 0.025, STACK_R - 0.025, len, 36, 1, true, Math.PI / 2, Math.PI), [len]);
  const drops: React.ReactElement[] = [];
  const n = Math.round(len * 9);
  for (let k = 0; k < n; k++) {
    const p = (((f * 0.012 + k / n + seed) % 1) + 1) % 1;
    const a = Math.PI / 2 + 0.25 + ((k * 0.618 + p * 0.6) % 1) * (Math.PI - 0.5); // back half only
    drops.push(
      <mesh key={k} position={[STACK_X + Math.sin(a) * (STACK_R - 0.05), y1 - p * len, STACK_Z + Math.cos(a) * (STACK_R - 0.05)]} scale={[1, 3.2, 1]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshToonMaterial color={PAL.waste} />
      </mesh>,
    );
  }
  return (
    <group>
      <group position={[STACK_X, (y0 + y1) / 2, STACK_Z]}>
        <mesh geometry={wall}>
          <meshToonMaterial color={PAL.grey} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={film}>
          <meshToonMaterial color={PAL.waste} side={THREE.DoubleSide} />
        </mesh>
        {/* cut edges: ink */}
        <InkBox size={[0.03, len, 0.03]} pos={[STACK_R, 0, 0]} color={PAL.ink} edges={false} />
        <InkBox size={[0.03, len, 0.03]} pos={[-STACK_R, 0, 0]} color={PAL.ink} edges={false} />
      </group>
      {drops}
      {cap && (
        // cross-section at the torn end: grey wall ring, brown water ring, empty air core
        <group position={[STACK_X, y1 + 0.003, STACK_Z]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[STACK_R - 0.03, STACK_R + 0.02, 40]} />
            <meshBasicMaterial color={PAL.ink} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <ringGeometry args={[STACK_R - 0.12, STACK_R - 0.03, 40]} />
            <meshBasicMaterial color={PAL.waste} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[STACK_R - 0.12, 40]} />
            <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {/* slab collars */}
      {LEVELS.filter((lv) => lv.y > y0 && lv.y < y1).map((lv) => (
        <InkCyl key={lv.y} r={STACK_R + 0.05} h={0.08} pos={[STACK_X, lv.y + 0.02, STACK_Z]} color={PAL.grey} seg={28} />
      ))}
    </group>
  );
};

export const Pipes: React.FC<{ f: number }> = ({ f }) => {
  const bottom = BASE_Y + 1.45;
  return (
    <group>
      <StackPiece y0={bottom} y1={GAP_Y0 + 0.02} f={f} seed={0.3} cap />
      <StackPiece y0={GAP_Y1 - 0.1} y1={ROOF_Y} f={f} seed={0} />
      {/* base bend into the STP inlet chamber */}
      <mesh position={[STACK_X, bottom, STACK_Z]}>
        <sphereGeometry args={[STACK_R, 18, 12]} />
        <meshToonMaterial color={PAL.grey} />
      </mesh>
      <InkCyl r={STACK_R} h={STACK_X + 0.1} pos={[(STACK_X - 0.1) / 2, bottom, STACK_Z]} rot={[0, 0, Math.PI / 2]} color={PAL.grey} seg={20} />
      <InkCyl r={0.18} h={0.42} pos={[-0.1, bottom - 0.21, STACK_Z]} color={PAL.grey} seg={16} />
      {/* vent pipe: lower and upper pieces, up through the roof */}
      <InkCyl r={0.1} h={GAP_Y0 - 0.45} pos={[VENT_X, 0.45 + (GAP_Y0 - 0.45) / 2, VENT_Z]} color={PAL.yellow} seg={14} />
      <InkCyl r={0.1} h={ROOF_Y + 1.0 - (GAP_Y1 - 0.1)} pos={[VENT_X, (GAP_Y1 - 0.1 + ROOF_Y + 1.0) / 2, VENT_Z]} color={PAL.yellow} seg={14} />
      <InkCyl r={0.17} h={0.12} pos={[VENT_X, ROOF_Y + 1.05, VENT_Z]} color={PAL.yellow} seg={14} />
      {/* vent cross-connection (Y branch) to the stack, one every 10 floors in real towers */}
      <InkCyl r={0.065} h={0.62} pos={[(STACK_X + VENT_X) / 2 + 0.05, GAP_Y1 + 0.75, (STACK_Z + VENT_Z) / 2]} rot={[0, 0, Math.PI / 2 + 0.8]} color={PAL.yellow} seg={10} />
      <Tag text="PIPA TEGAK" pos={[STACK_X + 0.05, ROOF_Y - 0.6, -0.25]} w={1.4} h={0.36} bg="#FFFFFF" fg={PAL.waste} />
      <Tag text="VEN" pos={[VENT_X + 0.5, ROOF_Y + 0.72, VENT_Z + 0.25]} w={0.62} h={0.32} bg={PAL.yellow} fg={PAL.ink} />
      {/* clean water up: transfer pump (LT 1) -> up-pipe -> roof tank */}
      <InkCyl r={0.06} h={GAP_Y0 - 0.58} pos={[UP_X, 0.58 + (GAP_Y0 - 0.58) / 2, -1.15]} color={PAL.blue} seg={10} />
      <InkCyl r={0.06} h={ROOF_Y + 0.5 - (GAP_Y1 - 0.1)} pos={[UP_X, (GAP_Y1 - 0.1 + ROOF_Y + 0.5) / 2, -1.15]} color={PAL.blue} seg={10} />
      <InkCyl r={0.06} h={3.0} pos={[UP_X + 1.5, ROOF_Y + 0.5, -1.15]} rot={[0, 0, Math.PI / 2]} color={PAL.blue} seg={10} />
      {/* clean water down by gravity: roof tank -> riser -> floors */}
      <InkCyl r={0.07} h={GAP_Y0 - 0.75} pos={[RISER_X, 0.75 + (GAP_Y0 - 0.75) / 2, -0.95]} color={PAL.blue} seg={12} />
      <InkCyl r={0.07} h={ROOF_Y + 0.3 - (GAP_Y1 - 0.1)} pos={[RISER_X, (GAP_Y1 - 0.1 + ROOF_Y + 0.3) / 2, -0.95]} color={PAL.blue} seg={12} />
    </group>
  );
};

export const Basement: React.FC<{ f: number }> = ({ f }) => {
  const bubbles: React.ReactElement[] = [];
  for (let k = 0; k < 10; k++) {
    const p = (((f * 0.01 + k * 0.137) % 1) + 1) % 1;
    bubbles.push(
      <mesh key={k} position={[-1.25 + (k % 5) * 0.16, BASE_Y + 0.12 + p * 0.62, -0.5 + (k % 2) * 0.4]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>,
    );
  }
  return (
    <group>
      <InkBox size={[W + 1.6, 0.45, D + 1.2]} pos={[0, BASE_Y - 0.33, -0.6]} color={PAL.soilDark} />
      <InkBox size={[0.7, -BASE_Y, D + 1.2]} pos={[X0 - 0.35 - 0.08, BASE_Y / 2, -0.6]} color={PAL.soil} />
      <InkBox size={[0.7, -BASE_Y, D + 1.2]} pos={[W / 2 + 0.35 + 0.1, BASE_Y / 2, -0.6]} color={PAL.soil} />
      <InkBox size={[W + 0.2, -BASE_Y, 1.2]} pos={[0, BASE_Y / 2, Z0 - 0.6 - 0.08]} color={PAL.soil} />
      <InkBox size={[W, 0.12, D]} pos={[0, BASE_Y - 0.06, 0]} color={PAL.slab} />
      {/* STP: inlet (right, under the stack bend) -> treatment -> clear water (left) */}
      <InkBox size={[2.6, 1.15, 1.5]} pos={[-0.9, BASE_Y + 0.575, -0.35]} color={PAL.mint} opacity={0.45} />
      <InkBox size={[0.04, 1.1, 1.48]} pos={[-1.35, BASE_Y + 0.56, -0.35]} color={PAL.mint} />
      <InkBox size={[0.04, 1.1, 1.48]} pos={[-0.45, BASE_Y + 0.56, -0.35]} color={PAL.mint} />
      <InkBox size={[0.82, 0.78, 1.4]} pos={[-1.78, BASE_Y + 0.41, -0.35]} color={PAL.blueLight} opacity={0.92} edges={false} />
      <InkBox size={[0.86, 0.78, 1.4]} pos={[-0.9, BASE_Y + 0.41, -0.35]} color="#8C9A4A" opacity={0.9} edges={false} />
      <InkBox size={[0.8, 0.78, 1.4]} pos={[-0.02, BASE_Y + 0.41, -0.35]} color={PAL.waste} opacity={0.9} edges={false} />
      {bubbles}
      <Tag text="STP" pos={[-0.9, BASE_Y + 0.85, 0.5]} w={1.1} h={0.4} bg={PAL.mint} fg="#FFFFFF" />
      {/* sump pit + pump */}
      <InkBox size={[0.8, 0.14, 0.8]} pos={[1.8, BASE_Y + 0.02, 0.35]} color={PAL.ink} />
      <InkBox size={[0.5, 0.4, 0.5]} pos={[1.8, BASE_Y + 0.29, 0.35]} color={PAL.shadow} />
      <InkCyl r={0.16} h={0.4} pos={[1.8, BASE_Y + 0.65, 0.35]} color={PAL.steel} seg={14} />
      <InkCyl r={0.04} h={0.6} pos={[1.8, BASE_Y + 1.15, 0.35]} color={PAL.grey} seg={8} />
    </group>
  );
};

export const Roof: React.FC<{ sign?: boolean }> = ({ sign = true }) => (
  <group>
    <InkBox size={[W + 0.16, 0.16, D]} pos={[0.08, ROOF_Y + 0.03, 0]} color={PAL.slab} />
    <InkBox size={[W + 0.16, 0.25, 0.08]} pos={[0.08, ROOF_Y + 0.2, Z0]} color={PAL.coralDark} />
    <InkBox size={[0.08, 0.25, D]} pos={[X0, ROOF_Y + 0.2, 0]} color={PAL.coralDark} />
    {[[1.1, -1.1], [2.1, -1.1], [1.1, -0.1], [2.1, -0.1]].map(([x, z], k) => (
      <InkBox key={k} size={[0.09, 0.5, 0.09]} pos={[x, ROOF_Y + 0.36, z]} color={PAL.grey} />
    ))}
    <InkBox size={[1.25, 0.06, 1.25]} pos={[1.6, ROOF_Y + 0.63, -0.6]} color={PAL.grey} />
    <InkCyl r={0.62} h={1.0} pos={[1.6, ROOF_Y + 1.16, -0.6]} color={PAL.blue} seg={36} />
    <InkCyl r={0.64} h={0.06} pos={[1.6, ROOF_Y + 1.69, -0.6]} color={PAL.blueLight} seg={36} />
    <Tag text="AIR BERSIH" pos={[1.6, ROOF_Y + 1.2, 0.08]} w={1.35} h={0.34} bg="#FFFFFF" fg={PAL.blue} />
    {/* gravity header roof tank -> riser */}
    <InkCyl r={0.07} h={1.6 - RISER_X} pos={[(1.6 + RISER_X) / 2, ROOF_Y + 0.27, -0.95]} rot={[0, 0, Math.PI / 2]} color={PAL.blue} seg={10} />
    {/* AUDIRA fascia board on the roof edge (part of the building) */}
    {sign && <Tag text="AUDIRA" pos={[0.35, ROOF_Y + 0.02, D / 2 + 0.06]} w={1.9} h={0.46} bg={PAL.ink} fg={PAL.yellow} />}
  </group>
);

export const Ground: React.FC = () => (
  <group>
    <InkBox size={[0.7, 0.12, D + 1.2]} pos={[X0 - 0.35 - 0.08, -0.06, -0.6]} color="#E8DFC9" />
    <InkBox size={[0.7, 0.12, D + 1.2]} pos={[W / 2 + 0.35 + 0.1, -0.06, -0.6]} color="#E8DFC9" />
    <mesh position={[W / 2 + 0.45, 0.006, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.6, D]} />
      <meshBasicMaterial color={PAL.shadow} transparent opacity={0.55} />
    </mesh>
  </group>
);

const Cam: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const drift = Math.sin(f * 0.01) * 0.6;
    // 9:16 framing: visible height = 2·d·tan(10°) ≈ 0.353·d; width = that · 9/16
    const target = new THREE.Vector3(0.05, 3.6, 0);
    const dir = new THREE.Vector3(0.48 + drift * 0.03, 0.18, 1).normalize();
    cam.position.copy(target.clone().add(dir.multiplyScalar(64)));
    cam.fov = 20;
    cam.near = 1;
    cam.far = 200;
    cam.lookAt(target);
    cam.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.paper }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: true }} camera={{ fov: 20, position: [30, 30, 30] }}>
        <Cam f={f} />
        {/* lit faces stay under the Neutral tone-map shoulder, so colours keep their saturation */}
        <ambientLight intensity={1.45} />
        <directionalLight position={[4, 9, 7]} intensity={1.35} />
        <group>
          <Ground />
          {LEVELS.map((lv, k) => (
            <Floor key={k} k={k} y={lv.y} label={lv.label} lobby={lv.lobby} top={k === LEVELS.length - 1} f={f} />
          ))}
          <Facade />
          <Break />
          <Pipes f={f} />
          <Roof />
          <Basement f={f} />
        </group>
        <Finish frame={frame} background={PAL.paper} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} ao={false} exposure={1.0} envIntensity={0.25} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${PAL.ink}22 1.6px, transparent 1.8px)`,
          backgroundSize: "14px 14px",
          mixBlendMode: "multiply",
        }}
      />
      <div style={{ position: "absolute", left: 64, top: 190, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "stretch", border: `5px solid ${PAL.ink}`, boxShadow: `9px 9px 0 ${PAL.ink}`, background: "#fff" }}>
          <div style={{ background: PAL.coral, color: "#fff", fontFamily: TITLE, fontWeight: 700, fontSize: 60, padding: "2px 20px", borderRight: `5px solid ${PAL.ink}`, display: "flex", alignItems: "center" }}>
            50
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: PAL.ink, padding: "0 20px", display: "flex", alignItems: "center" }}>
            AUDIRA EXPLAINED
          </div>
        </div>
        <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 124, lineHeight: 1, color: PAL.ink, textTransform: "uppercase", letterSpacing: -0.5 }}>
          Lantai 50,
        </div>
        <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 96, lineHeight: 1.0, color: PAL.ink, textTransform: "uppercase", background: PAL.yellow, padding: "6px 22px 12px", border: `5px solid ${PAL.ink}`, boxShadow: `9px 9px 0 ${PAL.ink}`, marginTop: -4 }}>
          Larinya
          <br />
          ke mana?
        </div>
      </div>
    </AbsoluteFill>
  );
};
