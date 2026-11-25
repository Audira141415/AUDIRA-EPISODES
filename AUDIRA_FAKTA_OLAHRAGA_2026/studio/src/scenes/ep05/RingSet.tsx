// EP05 — Rumble in the Jungle 1974. CHRONICLE look: the ring in Stade du 20 Mai, Kinshasa, before dawn.
// Floodlights behind the ring cut the boxers out as black silhouettes; Ali = amber contour (hero), Foreman =
// crimson (opponent). Stylised figures only: no faces, no real logos. AUDIRA lives on the ring apron banner.
import React, { useLayoutEffect, useMemo } from "react";
import { CanvasTexture, Color, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";
import type { Look } from "./chronicle/Stage.tsx";
import { Figure, POSES, type Costume, type Pose } from "./chronicle/Figure.tsx";
import { INK } from "./chronicle/looks.ts";
import { Palm } from "./chronicle/props.tsx";
import { Shafts } from "./chronicle/fxextra.tsx";
import { F_STAMP } from "./chronicle/fonts.ts";

export const FLOOR = 1.2; // canvas height above the ground (m)
const HALF = 3.3; // ring half-width
const POST = 1.45; // post height above the canvas

/** Before dawn over Kinshasa: deep blue sky, faint teal-amber line low, floodlights as the key from behind. */
export const PREDAWN: Look = {
  key: { pos: [4, 20, -22], color: "#ffe3b8", intensity: 2.4, shadow: { box: 14, at: [0, FLOOR, 0], far: 120, bias: -0.0005 } },
  hemi: { sky: "#4a5a8a", ground: "#120e10", intensity: 0.55 },
  fill: { pos: [6, 6, 26], color: "#6a76a8", intensity: 0.3 },
  fog: { color: "#26304e", density: 0.011 },
  sky: { zenith: "#060a1a", horizon: "#3c5070", ground: "#0c0d16", sunDir: [0.2, 0.05, -1], sunColor: "#ffc890", sunSize: 0.0, glow: 0.55, stars: 0.75 },
  exposure: 1.05,
  bloom: { strength: 0.34, radius: 0.5, threshold: 0.78 },
  grade: { shadow: "#101b3a", high: "#ffc98a", amount: 0.16, contrast: 0.22, vignette: 0.44, grain: 0.024 },
  outline: { width: 1, halo: 0.3, gain: 1.6 },
};

const A = (fwd = 0, out = 0.08, elbow = 0.12, twist = 0) => ({ fwd, out, elbow, twist });
const BOXER: Costume = { itemL: "glove", itemR: "glove", scale: 1.12, build: 1.08 };

export const BOX = {
  guard: (): Pose => ({ ...POSES.stand(), armL: A(1.25, 0.22, 2.05, -0.3), armR: A(1.05, 0.25, 2.25, 0.3), legL: { fwd: 0.22, out: 0.1, knee: 0.18 }, legR: { fwd: -0.22, out: 0.1, knee: 0.22 }, lean: 0.08, head: [-0.12, 0] }),
  /** right hand held cocked after the combination (Ali did not throw the last punch) */
  heldPunch: (): Pose => ({ ...POSES.stand(), armL: A(1.0, 0.3, 1.9, -0.2), armR: A(1.55, 0.05, 1.6, 0.2), legL: { fwd: 0.35, out: 0.12, knee: 0.25 }, legR: { fwd: -0.3, out: 0.1, knee: 0.1 }, lean: 0.12, twist: -0.25, head: [0.05, 0] }),
  /** knocked out: knees gone, arms loose (the whole body is toppled by the caller) */
  fall: (): Pose => ({ hipY: 0.86, lean: -0.2, spine: -0.15, armL: A(-0.4, 0.9, 0.3), armR: A(0.6, 0.7, 0.4), legL: { fwd: 0.5, out: 0.12, knee: 0.7 }, legR: { fwd: -0.1, out: 0.1, knee: 0.35 }, head: [0.45, 0.2] }),
  /** rope-a-dope: leaning back on the ropes, gloves high around the head */
  ropes: (): Pose => ({ ...POSES.stand(), lean: -0.42, spine: -0.1, armL: A(1.6, 0.2, 2.45, -0.4), armR: A(1.5, 0.24, 2.5, 0.4), legL: { fwd: 0.3, out: 0.16, knee: 0.3 }, legR: { fwd: 0.18, out: 0.16, knee: 0.22 }, head: [-0.25, 0] }),
  hook: (): Pose => ({ ...POSES.stand(), armL: A(1.0, 0.3, 2.0, -0.2), armR: A(1.45, 0.75, 1.1, 0.6), twist: 0.45, legL: { fwd: 0.3, out: 0.14, knee: 0.25 }, legR: { fwd: -0.3, out: 0.12, knee: 0.15 }, lean: 0.18 }),
};

/** Banner texture for the ring apron (drawn once fonts are ready). */
const useBanner = (text: string) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#16100e"; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#b8322a"; g.fillRect(0, 18, c.width, 10); g.fillRect(0, c.height - 28, c.width, 10);
    g.font = `150px "${F_STAMP}"`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#f4ead8"; g.fillText(text, c.width / 2, c.height / 2 + 6);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, [text]);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return tex;
};

/** Procedural woven-canvas / dirt texture: weave lines, mottling, sweat and resin stains (deterministic). */
export const grainTex = (kind: "canvas" | "dirt", size = 1024, rep = 3) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  let seed = kind === "canvas" ? 7 : 19;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.fillStyle = kind === "canvas" ? "#c4b498" : "#2a1f17"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = rnd() * size, y = rnd() * size, r = kind === "canvas" ? 3 + rnd() * 22 : 6 + rnd() * 90;
    const d = rnd() < 0.55;
    g.fillStyle = kind === "canvas" ? (d ? `rgba(90,70,48,${0.05 + rnd() * 0.08})` : `rgba(255,246,226,${0.04 + rnd() * 0.05})`) : (d ? `rgba(10,6,4,${0.08 + rnd() * 0.15})` : `rgba(120,92,64,${0.05 + rnd() * 0.1})`);
    g.beginPath(); g.ellipse(x, y, r, r * (0.5 + rnd() * 0.6), rnd() * 3, 0, 7); g.fill();
  }
  if (kind === "canvas") {
    for (let y = 0; y < size; y += 4) { g.fillStyle = `rgba(60,44,30,${0.08 + rnd() * 0.06})`; g.fillRect(0, y, size, 1.4); }
    for (let x = 0; x < size; x += 4) { g.fillStyle = `rgba(255,248,232,${0.03 + rnd() * 0.04})`; g.fillRect(x, 0, 1.4, size); }
    for (let i = 0; i < 14; i++) { // big sweat / resin stains
      const x = rnd() * size, y = rnd() * size, r = 60 + rnd() * 130;
      const sg = g.createRadialGradient(x, y, 0, x, y, r); sg.addColorStop(0, `rgba(80,58,36,${0.12 + rnd() * 0.1})`); sg.addColorStop(1, "rgba(80,58,36,0)");
      g.fillStyle = sg; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 26; i++) { // scuffs from feet
      g.strokeStyle = `rgba(70,52,36,${0.1 + rnd() * 0.12})`; g.lineWidth = 2 + rnd() * 6;
      const x = rnd() * size, y = rnd() * size; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + rnd() * 80 - 40, y + rnd() * 80 - 40, x + rnd() * 140 - 70, y + rnd() * 140 - 70); g.stroke();
    }
  } else {
    for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "160,128,92" : "8,5,3"},${0.12 + rnd() * 0.2})`; g.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 3, 1 + rnd() * 3); }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(rep, rep);
  return t;
};
let canvasMap: CanvasTexture | null = null;
const CANVAS = new MeshStandardMaterial({ color: new Color("#ffffff"), roughness: 0.95 });
const canvasMat = () => { if (!canvasMap) { canvasMap = grainTex("canvas", 1024, 2); CANVAS.map = canvasMap; CANVAS.bumpMap = canvasMap; CANVAS.bumpScale = 1.2; CANVAS.needsUpdate = true; } return CANVAS; };
let dirtMat: MeshStandardMaterial | null = null;
export const DIRT = () => { if (!dirtMat) { const m = grainTex("dirt", 1024, 40); dirtMat = new MeshStandardMaterial({ map: m, bumpMap: m, bumpScale: 1.2, roughness: 1, color: new Color("#a89080") }); } return dirtMat; };
const DARK = new MeshStandardMaterial({ color: new Color("#1a1414"), roughness: 0.8 });
const ROPE = new MeshStandardMaterial({ color: new Color("#d9d2c4"), roughness: 0.6, emissive: new Color("#3a2e26"), emissiveIntensity: 0.4 });
const STAND = new MeshStandardMaterial({ color: new Color("#2a2228"), roughness: 1 });
const LAMP = new MeshBasicMaterial({ color: new Color("#fff2d6").multiplyScalar(5), toneMapped: false, fog: false });

export const Ring: React.FC = () => {
  const banner = useBanner("AUDIRA  ·  KINSHASA 1974");
  const corners: [number, number][] = [[-HALF, -HALF], [HALF, -HALF], [HALF, HALF], [-HALF, HALF]];
  const ropes = [0.42, 0.82, 1.22];
  return (
    <group>
      <mesh position={[0, FLOOR - 0.05, 0]} material={canvasMat()} receiveShadow castShadow>
        <boxGeometry args={[HALF * 2 + 0.6, 0.1, HALF * 2 + 0.6]} />
      </mesh>
      <mesh position={[0, (FLOOR - 0.1) / 2, 0]} material={DARK}>
        <boxGeometry args={[HALF * 2 + 0.5, FLOOR - 0.1, HALF * 2 + 0.5]} />
      </mesh>
      {/* apron banner facing the camera */}
      <mesh position={[0, (FLOOR - 0.1) / 2, HALF + 0.26]}>
        <planeGeometry args={[HALF * 2 + 0.4, (FLOOR - 0.1) * 0.62]} />
        <meshStandardMaterial map={banner} roughness={0.8} emissive={new Color("#ffffff")} emissiveMap={banner} emissiveIntensity={0.35} />
      </mesh>
      {corners.map(([x, z], i) => (
        <mesh key={i} position={[x, FLOOR + POST / 2, z]} material={DARK} castShadow>
          <cylinderGeometry args={[0.07, 0.08, POST, 10]} />
        </mesh>
      ))}
      {corners.map(([x0, z0], i) => {
        const [x1, z1] = corners[(i + 1) % 4];
        const len = Math.hypot(x1 - x0, z1 - z0);
        const ry = Math.atan2(x1 - x0, z1 - z0);
        return ropes.map((h, j) => (
          <mesh key={`${i}-${j}`} position={[(x0 + x1) / 2, FLOOR + h, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, -ry]} material={ROPE} castShadow>
            <cylinderGeometry args={[0.028, 0.028, len, 8]} />
          </mesh>
        ));
      })}
    </group>
  );
};

/** Crowd on stepped stands around the back of the ring, plus light towers and palms beyond the stadium. */
export const Stadium: React.FC<{ t: number; cheer?: number }> = ({ t, cheer = 0.5 }) => {
  const crowd = useMemo(() => {
    const out: { x: number; y: number; z: number; ry: number; pose: number; s: number }[] = [];
    let k = 0;
    for (let row = 0; row < 4; row++) {
      const z = -9 - row * 2.4, y = row * 1.1;
      const n = 13 + row * 2;
      for (let i = 0; i < n; i++) {
        k++;
        const x = (i / (n - 1) - 0.5) * (22 + row * 5) + Math.sin(k * 12.9) * 0.4;
        out.push({ x, y, z, ry: -x * 0.03 + Math.sin(k * 3.1) * 0.2, pose: Math.abs(Math.floor(Math.sin(k * 7.7) * 10)) % 4, s: 0.95 + 0.08 * Math.sin(k * 5.3) });
      }
    }
    return out;
  }, []);
  return (
    <group>
      {[0, 1, 2, 3].map((r) => (
        <mesh key={r} position={[0, r * 1.1 - 0.55, -9 - r * 2.4]} material={STAND} receiveShadow>
          <boxGeometry args={[60, 1.1, 2.4]} />
        </mesh>
      ))}
      {crowd.map((c, i) => {
        const up = c.pose === 0 || (c.pose === 1 && cheer > 0.5);
        const pose = up ? POSES.raiseFist() : c.pose === 2 ? POSES.lookUp() : POSES.stand();
        return <Figure key={i} id={100 + i} pos={[c.x, c.y, c.z]} rotY={c.ry} pose={pose} look={{ scale: c.s }} t={t} />;
      })}
      {[-15, 15].map((x) => (
        <group key={x} position={[x, 0, -24]}>
          <mesh position={[0, 12, 0]} material={DARK}><cylinderGeometry args={[0.25, 0.4, 24, 8]} /></mesh>
          <mesh position={[0, 24.6, 0.3]} material={LAMP}><boxGeometry args={[4.2, 1.6, 0.2]} /></mesh>
          <Shafts from={[0, 24.6, 0.6]} yaw={x > 0 ? 0.5 : -0.5} tilt={-0.95} len={34} width={4} count={4} color="#ffe2b0" opacity={0.08} t={t} />
        </group>
      ))}
      {[-26, -19, -11, 9, 17, 25].map((x, i) => (
        <Palm key={x} pos={[x, 0, -36 - (i % 3) * 4]} h={13 + (i % 3) * 2} lean={[i % 2 ? 1.4 : -1.2, 0.3]} t={t} seed={i + 2} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <primitive object={DIRT()} attach="material" />
      </mesh>
    </group>
  );
};

export type Boxer = { pose: Pose; pos: [number, number, number]; rotY: number; topple?: number };

/** Ali (amber contour) and Foreman (crimson) on the ring, in the stadium. */
export const RingSet: React.FC<{ t: number; ali: Boxer; foreman: Boxer; cheer?: number }> = ({ t, ali, foreman, cheer }) => (
  <group>
    <Stadium t={t} cheer={cheer} />
    <Ring />
    <Figure id={1} outline={INK.hero} pos={[ali.pos[0], FLOOR + ali.pos[1], ali.pos[2]]} rotY={ali.rotY} pose={ali.pose} look={BOXER} t={t} />
    <group position={[foreman.pos[0], FLOOR + foreman.pos[1], foreman.pos[2]]} rotation={[0, foreman.rotY, 0]}>
      <group rotation={[foreman.topple ?? 0, 0, (foreman.topple ?? 0) * 0.35]}>
        <Figure id={2} outline={INK.foe} pos={[0, 0, 0]} pose={foreman.pose} look={{ ...BOXER, scale: 1.16 }} t={t} />
      </group>
    </group>
  </group>
);
