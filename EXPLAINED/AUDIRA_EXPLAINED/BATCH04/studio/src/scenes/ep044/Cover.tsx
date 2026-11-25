// AE-044 cover (PRECISION): "Bagaimana eSIM menggantikan kartu SIM fisik?"
// A generic phone (no real brand) with its back glass lifted off, revealing the mainboard. A tiny
// eUICC chip (black epoxy package, about 6x5 mm MFF2, soldered next to the modem shield) glows teal.
// A floating nano-SIM (gold contact plate) breaks up cell by cell into data fragments that stream
// into the chip. Dark graphite studio, HDRI studio reflections, Finish chain.
// Deterministic: fixed geometry from seeded PRNG, motion only from useCurrentFrame().

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import type { ColorGradeProfile } from "../../core/render/FinishingPresets.ts";
import { Slab } from "../../core/geometry/slab.ts";
import { circuitBoard, prng } from "../../core/materials/textures.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { fontReady, FONT } from "../../core/type/fonts.ts";

export const { fontFamily: INTER } = loadInter("normal", { weights: ["500", "800"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

const W = 1080;
const H = 1920;
export const TEAL = "#4ff0d8";
export const BG = "#0a0b0e";

export const GRADE: ColorGradeProfile = {
  name: "EP044 graphite studio",
  vignette: 0.16,
  grain: 0.006,
  chromaticAberration: 0.0,
  contrastCurve: 0.18,
  highlightTint: [0.0, 0.004, 0.006],
  shadowTint: [0.0, 0.004, 0.008],
};

// ---------- camera (shared with the overlay projection) ----------
const CAM = { pos: new THREE.Vector3(0.35, 0.95, 11.0), target: new THREE.Vector3(0.05, -0.2, 0), fov: 32 };
const makeCamera = () => {
  const c = new THREE.PerspectiveCamera(CAM.fov, W / H, 0.1, 100);
  c.position.copy(CAM.pos);
  c.lookAt(CAM.target);
  c.updateMatrixWorld(true);
  c.updateProjectionMatrix();
  return c;
};
const toScreen = (p: THREE.Vector3) => {
  const v = p.clone().project(makeCamera());
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
};

// ---------- phone layout (local units: 1 mm ~ 0.02) ----------
export const PH = { hw: 0.72, hh: 1.52, d: 0.12 };
const PHONE_POS = new THREE.Vector3(0.36, 0.42, 0);
const PHONE_ROT = new THREE.Euler(0.16, 0.5, 0.06);
const PHONE_M = new THREE.Matrix4().compose(PHONE_POS, new THREE.Quaternion().setFromEuler(PHONE_ROT), new THREE.Vector3(1, 1, 1));
export const TOP = PH.d / 2; // midplate face (components sit on +z)
export const PCB = { pos: [0.02, 0.74, TOP + 0.016] as const, size: [1.24, 1.12, 0.03] as const };
export const PCB_TOP = TOP + 0.032;
export const CHIP = { pos: [-0.2, 0.42, PCB_TOP + 0.009] as const, size: [0.12, 0.1, 0.018] as const };
const CHIP_WORLD = new THREE.Vector3(...CHIP.pos).applyMatrix4(PHONE_M);

// ---------- SIM card ----------
export const SIM_SCALE = 1.55;
export const SIM = { w: 0.246 * SIM_SCALE, h: 0.176 * SIM_SCALE, d: 0.016 * SIM_SCALE, chamfer: 0.04 * SIM_SCALE };
// placed by screen position (px) at a fixed distance from the camera
const fromScreen = (x: number, y: number, dist: number) => {
  const c = makeCamera();
  const v = new THREE.Vector3((x / W) * 2 - 1, -((y / H) * 2 - 1), 0.5).unproject(c).sub(c.position).normalize();
  return c.position.clone().add(v.multiplyScalar(dist));
};
const SIM_POS = fromScreen(225, 540, 5.4);
const SIM_ROT = new THREE.Euler(0.12, 0.28, -0.22);
const SIM_M = new THREE.Matrix4().compose(SIM_POS, new THREE.Quaternion().setFromEuler(SIM_ROT), new THREE.Vector3(1, 1, 1));
export const NX = 22;
export const NY = 16;
export const CW = SIM.w / NX;
export const CH = SIM.h / NY;
// contact plate (gold) region inside the card, in card-local coords
export const GOLD = { x0: -SIM.w / 2 + 0.018 * SIM_SCALE, x1: SIM.w / 2 - 0.018 * SIM_SCALE, y0: -SIM.h / 2 + 0.016 * SIM_SCALE, y1: SIM.h / 2 - 0.016 * SIM_SCALE };
export const inGold = (x: number, y: number) => x > GOLD.x0 && x < GOLD.x1 && y > GOLD.y0 && y < GOLD.y1;
// ragged dissolve front: intact columns per row
export const BOUNDARY = (() => {
  const r = prng(4471);
  return Array.from({ length: NY }, (_, j) => Math.round(NX * 0.56 + Math.sin(j * 0.9) * 1.6 + (r() - 0.5) * 3.2));
})();

// ---------- canvas textures ----------
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const simTextures = () => {
  const S = 1024;
  const sx = (x: number) => ((x + SIM.w / 2) / SIM.w) * S;
  const sy = (y: number) => ((SIM.h / 2 - y) / SIM.h) * S;
  const plate = (g: CanvasRenderingContext2D, gold: string, plastic: string, line: string) => {
    g.fillStyle = plastic;
    g.fillRect(0, 0, S, S);
    const x0 = sx(GOLD.x0), x1 = sx(GOLD.x1), y0 = sy(GOLD.y1), y1 = sy(GOLD.y0);
    g.fillStyle = gold;
    g.beginPath();
    g.roundRect(x0, y0, x1 - x0, y1 - y0, 40);
    g.fill();
    // ISO 7816-style pad split: two columns of three pads around a central pad
    g.strokeStyle = line;
    g.lineWidth = 9;
    const mx = (x0 + x1) / 2, cw = (x1 - x0) * 0.2;
    g.beginPath();
    g.moveTo(mx - cw, y0);
    g.lineTo(mx - cw, y1);
    g.moveTo(mx + cw, y0);
    g.lineTo(mx + cw, y1);
    for (const k of [1 / 3, 2 / 3]) {
      const y = y0 + (y1 - y0) * k;
      g.moveTo(x0, y);
      g.lineTo(mx - cw, y);
      g.moveTo(mx + cw, y);
      g.lineTo(x1, y);
    }
    g.moveTo(mx - cw, (y0 + y1) / 2 + 30);
    g.bezierCurveTo(mx - cw * 0.3, (y0 + y1) / 2 + 30, mx - cw * 0.3, (y0 + y1) / 2 - 30, mx + cw, (y0 + y1) / 2 - 30);
    g.stroke();
  };
  const map = canvasTex(S, S, (g) => plate(g, "#d9b45f", "#eceae4", "#8a6a2a"));
  const metal = canvasTex(S, S, (g) => plate(g, "#ffffff", "#000000", "#202020"), false);
  const rough = canvasTex(S, S, (g) => plate(g, "#4a4a4a", "#7a7a7a", "#b0b0b0"), false);
  for (const t of [map, metal, rough]) {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(1 / SIM.w, 1 / SIM.h);
    t.offset.set(0.5, 0.5);
  }
  return { map, metal, rough };
};

export const radialTex = (inner: string, outer: string) =>
  canvasTex(256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, inner);
    gr.addColorStop(1, outer);
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  });

// ---------- geometry helpers ----------
export const simShape = () => {
  const s = new THREE.Shape();
  const x0 = -SIM.w / 2, y0 = -SIM.h / 2;
  const bx = (j: number) => x0 + BOUNDARY[j] * CW;
  s.moveTo(x0, y0);
  s.lineTo(bx(0), y0);
  for (let j = 0; j < NY; j++) {
    s.lineTo(bx(j), y0 + (j + 1) * CH);
    if (j < NY - 1) s.lineTo(bx(j + 1), y0 + (j + 1) * CH);
  }
  s.lineTo(x0 + SIM.chamfer, SIM.h / 2);
  s.lineTo(x0, SIM.h / 2 - SIM.chamfer);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: SIM.d, bevelEnabled: false });
  g.translate(0, 0, -SIM.d / 2);
  return g;
};

export const bezier = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, t: number) => {
  const u = 1 - t;
  return a.clone().multiplyScalar(u * u * u)
    .add(b.clone().multiplyScalar(3 * u * u * t))
    .add(c.clone().multiplyScalar(3 * u * t * t))
    .add(d.clone().multiplyScalar(t * t * t));
};

// stream path: from the dissolve front of the card into the chip, entering from above the board
const STREAM_START = new THREE.Vector3(SIM.w * 0.12, 0, 0).applyMatrix4(SIM_M);
const CHIP_NORMAL = new THREE.Vector3(0, 0, 1).applyQuaternion(new THREE.Quaternion().setFromEuler(PHONE_ROT));
const P1 = STREAM_START.clone().add(new THREE.Vector3(0.75, 0.15, -1.2));
const P2 = CHIP_WORLD.clone().add(CHIP_NORMAL.clone().multiplyScalar(1.5)).add(new THREE.Vector3(-0.1, 0.55, 0));
const pathAt = (t: number) => bezier(STREAM_START, P1, P2, CHIP_WORLD, t);

// ---------- components ----------
const CameraSetup: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(CAM.pos);
    c.fov = CAM.fov;
    c.near = 0.1;
    c.far = 100;
    c.lookAt(CAM.target);
    c.layers.enable(FX_LAYER);
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const Backdrop: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex(512, 1024, (g) => {
        g.fillStyle = BG;
        g.fillRect(0, 0, 512, 1024);
        const gr = g.createRadialGradient(270, 380, 10, 270, 400, 520);
        gr.addColorStop(0, "#343a44");
        gr.addColorStop(0.45, "#1a1d23");
        gr.addColorStop(1, BG);
        g.fillStyle = gr;
        g.fillRect(0, 0, 512, 1024);
        const tg = g.createRadialGradient(200, 470, 0, 200, 470, 220);
        tg.addColorStop(0, "rgba(60,200,190,0.16)");
        tg.addColorStop(1, "rgba(60,200,190,0)");
        g.fillStyle = tg;
        g.fillRect(0, 0, 512, 1024);
      }),
    [],
  );
  return (
    <mesh position={[0, 0, -9]}>
      <planeGeometry args={[13, 26]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

export const TextPlate: React.FC<{ text: string; w: number; h: number; color: string; font: string; weight: string; spacing: string; position: [number, number, number]; opacity: number }> = ({ text, w, h, color, font, weight, spacing, position, opacity }) => {
  const tex = useMemo(
    () =>
      canvasTex(1024, Math.round((1024 * h) / w), (g) => {
        const ch = Math.round((1024 * h) / w);
        g.clearRect(0, 0, 1024, ch);
        g.fillStyle = color;
        g.font = `${weight} ${Math.round(ch * 0.62)}px ${font}`;
        (g as unknown as { letterSpacing: string }).letterSpacing = spacing;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(text, 512, ch / 2 + ch * 0.04);
      }),
    [text, w, h, color, font, weight, spacing],
  );
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} transparent opacity={opacity} roughness={0.35} metalness={0.2} depthWrite={false} />
    </mesh>
  );
};

export const Passives: React.FC = () => {
  const mesh = useMemo(() => {
    const r = prng(9127);
    const keep: [number, number, number, number][] = [
      // x0, x1, y0, y1 of shielded / occupied regions on the board (local)
      [-0.62, -0.12, 0.95, 1.32],
      [-0.02, 0.5, 0.62, 1.06],
      [0.04, 0.44, 0.26, 0.52],
      [-0.3, -0.1, 0.33, 0.51],
    ];
    const n = 150;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.3 });
    const im = new THREE.InstancedMesh(geo, mat, n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const palette = [new THREE.Color("#2b2620"), new THREE.Color("#8d7a5c"), new THREE.Color("#3b3d42"), new THREE.Color("#b9a27a")];
    let i = 0;
    while (i < n) {
      const x = -0.58 + r() * 1.2;
      const y = 0.22 + r() * 1.06;
      if (keep.some(([a, b, c, d]) => x > a && x < b && y > c && y < d)) continue;
      const big = r() > 0.85;
      const sx = big ? 0.05 : 0.018 + r() * 0.012;
      const sy = big ? 0.035 : 0.01;
      const sz = big ? 0.02 : 0.008;
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r() > 0.5 ? 0 : Math.PI / 2);
      m.compose(new THREE.Vector3(x, y, PCB_TOP + sz / 2), q, new THREE.Vector3(sx, sy, sz));
      im.setMatrixAt(i, m);
      im.setColorAt(i, palette[Math.floor(r() * palette.length)]);
      i++;
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return im;
  }, []);
  return <primitive object={mesh} />;
};

const Phone: React.FC<{ f: number }> = ({ f }) => {
  const slab = useMemo(() => {
    const s = new Slab();
    s.update({ hw: PH.hw, hh: PH.hh, d: PH.d, rc: 0.2, reF: 0.035, reB: 0.05, seamZ: 0.0, seamDepth: 0.006, seamWidth: 0.02 });
    return s;
  }, []);
  const grain = useSurfaceGrain(31, 0.12, 4);
  const mats = useMemo(() => {
    const midplate = new THREE.MeshPhysicalMaterial({ color: "#2a2d33", metalness: 0.7, roughness: 0.48, roughnessMap: grain });
    const frame = new THREE.MeshPhysicalMaterial({ color: "#8e939b", metalness: 1, roughness: 0.26, clearcoat: 0.3 });
    const glassBack = new THREE.MeshPhysicalMaterial({ color: "#07080a", metalness: 0.1, roughness: 0.08, clearcoat: 1 });
    return { body: [midplate, frame, glassBack], frame };
  }, [grain]);
  const pcbTex = useMemo(() => {
    const t = circuitBoard(1024, 23);
    t.repeat.set(1.1, 1);
    return t;
  }, []);
  const halo = useMemo(() => radialTex("rgba(90,255,230,1)", "rgba(90,255,230,0)"), []);
  const pulse = (f / 60) % 1;
  const sway = Math.sin((f / 60) * 0.6) * 0.01;
  const shield = { color: "#c3c6cc", metalness: 1, roughness: 0.3 };
  const glowCol = new THREE.Color(TEAL).multiplyScalar(4);
  const [cx, cy, cz] = CHIP.pos;
  const [w, h, d] = CHIP.size;
  return (
    <group position={PHONE_POS} rotation={[PHONE_ROT.x, PHONE_ROT.y + sway, PHONE_ROT.z]}>
      <mesh geometry={slab.geometry} material={mats.body} />
      {/* mainboard */}
      <mesh position={[...PCB.pos]}>
        <RoundedBoxGeo args={[...PCB.size]} radius={0.012} segments={2} />
        <meshPhysicalMaterial map={pcbTex} color="#5f6b66" roughness={0.42} metalness={0.25} clearcoat={0.35} clearcoatRoughness={0.3} />
      </mesh>
      {/* SoC + modem shield cans */}
      <mesh position={[0.24, 0.84, PCB_TOP + 0.02]}>
        <RoundedBoxGeo args={[0.5, 0.42, 0.04]} radius={0.01} segments={2} />
        <meshPhysicalMaterial {...shield} />
      </mesh>
      <mesh position={[0.24, 0.39, PCB_TOP + 0.017]}>
        <RoundedBoxGeo args={[0.38, 0.24, 0.034]} radius={0.01} segments={2} />
        <meshPhysicalMaterial {...shield} roughness={0.36} />
      </mesh>
      <Passives />
      {/* eUICC chip: black epoxy package with end pads */}
      <mesh position={[cx, cy, cz]}>
        <RoundedBoxGeo args={[w, h, d]} radius={0.004} segments={2} />
        <meshPhysicalMaterial color="#1b1d21" roughness={0.34} clearcoat={0.6} clearcoatRoughness={0.25} metalness={0} />
      </mesh>
      {[-1, 1].map((sgn) =>
        [-0.032, -0.011, 0.011, 0.032].map((py) => (
          <mesh key={`${sgn}${py}`} position={[cx + sgn * (w / 2 + 0.006), cy + py, PCB_TOP + 0.002]}>
            <boxGeometry args={[0.014, 0.012, 0.004]} />
            <meshStandardMaterial color="#d6d8dc" metalness={1} roughness={0.25} />
          </mesh>
        )),
      )}
      <mesh position={[cx - w * 0.33, cy + h * 0.3, cz + d / 2 + 0.0005]}>
        <circleGeometry args={[0.007, 16]} />
        <meshBasicMaterial color="#5a5d63" />
      </mesh>
      {/* glow: edge light + halo + pulse rings (FX layer) */}
      {[
        [0, h / 2 + 0.004, w + 0.016, 0.004],
        [0, -h / 2 - 0.004, w + 0.016, 0.004],
        [w / 2 + 0.004, 0, 0.004, h + 0.016],
        [-w / 2 - 0.004, 0, 0.004, h + 0.016],
      ].map(([ox, oy, sx, sy], i) => (
        <mesh key={i} position={[cx + ox, cy + oy, cz + d / 2 - 0.002]}>
          <boxGeometry args={[sx, sy, 0.006]} />
          <meshBasicMaterial color={glowCol} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[cx, cy, PCB_TOP + 0.03]} layers={FX_LAYER}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial map={halo} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {[0, 0.5].map((o) => {
        const p = (pulse + o) % 1;
        return (
          <mesh key={o} position={[cx, cy, PCB_TOP + 0.004]} layers={FX_LAYER}>
            <ringGeometry args={[0.09 + p * 0.3, 0.096 + p * 0.3, 64]} />
            <meshBasicMaterial color={TEAL} transparent opacity={(1 - p) * 0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
      <pointLight position={[cx, cy, cz + 0.25]} color={TEAL} intensity={1.6} distance={1.4} decay={2} />
      {/* camera module */}
      <mesh position={[-0.37, 1.13, TOP + 0.06]}>
        <RoundedBoxGeo args={[0.46, 0.4, 0.12]} radius={0.04} segments={3} />
        <meshPhysicalMaterial color="#3a3e45" metalness={1} roughness={0.3} />
      </mesh>
      {[
        [-0.47, 1.22],
        [-0.27, 1.04],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, TOP + 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.072, 0.078, 0.03, 48]} />
            <meshPhysicalMaterial color="#9aa0a8" metalness={1} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.016, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.004, 48]} />
            <meshPhysicalMaterial color="#05070c" metalness={0.2} roughness={0.04} clearcoat={1} />
          </mesh>
        </group>
      ))}
      {/* battery with AUDIRA label */}
      <mesh position={[0.02, -0.64, TOP + 0.036]}>
        <RoundedBoxGeo args={[1.22, 1.58, 0.07]} radius={0.03} segments={3} />
        <meshPhysicalMaterial color="#1c1f24" roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.35} roughnessMap={grain} />
      </mesh>
      <TextPlate text="AUDIRA" w={0.7} h={0.12} color="#9aa1aa" font={FONT} weight="500" spacing="18px" position={[0.02, -0.5, TOP + 0.0725]} opacity={0.75} />
      {/* flex cables board -> battery */}
      {[-0.3, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.17, TOP + 0.076]}>
          <boxGeometry args={[0.1, 0.16, 0.006]} />
          <meshStandardMaterial color="#6e4419" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

const SimCard: React.FC<{ f: number }> = ({ f }) => {
  const tex = useMemo(() => simTextures(), []);
  const geo = useMemo(() => simShape(), []);
  const drift = Math.sin((f / 60) * 0.8) * 0.02;
  // cells beyond the dissolve front: physical fragments near the card
  const frags = useMemo(() => {
    const r = prng(771);
    const list: { local: THREE.Vector3; k: number; rot: THREE.Euler; gold: boolean }[] = [];
    for (let j = 0; j < NY; j++)
      for (let i = BOUNDARY[j]; i < NX; i++) {
        const x = -SIM.w / 2 + (i + 0.5) * CW, y = -SIM.h / 2 + (j + 0.5) * CH;
        if (r() < 0.18) continue;
        list.push({ local: new THREE.Vector3(x, y, 0), k: i - BOUNDARY[j] + r() * 0.8, rot: new THREE.Euler(r() * 3, r() * 3, r() * 3), gold: inGold(x, y) });
      }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(CW * 0.92, CH * 0.92, SIM.d), new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.5 }), list.length);
    const gold = new THREE.Color("#d9b45f"), plastic = new THREE.Color("#e8e6e0");
    list.forEach((p, i) => im.setColorAt(i, p.gold ? gold : plastic));
    return { list, im };
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const simQ = new THREE.Quaternion().setFromEuler(SIM_ROT);
    frags.list.forEach((p, i) => {
      const k = p.k;
      const base = p.local.clone().applyMatrix4(SIM_M);
      const t = Math.min(0.16, k * 0.012);
      const along = pathAt(t).sub(STREAM_START);
      const pos = base.add(along.multiplyScalar(Math.min(1, k * 0.35))).add(new THREE.Vector3(0, drift, 0));
      const spin = new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rot.x * k * 0.12, p.rot.y * k * 0.12, p.rot.z * k * 0.12));
      q.copy(simQ).multiply(spin);
      const s = Math.max(0.35, 1 - k * 0.07);
      m.compose(pos, q, new THREE.Vector3(s, s, s));
      frags.im.setMatrixAt(i, m);
    });
    frags.im.instanceMatrix.needsUpdate = true;
    if (frags.im.instanceColor) frags.im.instanceColor.needsUpdate = true;
  }, [frags, drift]);
  return (
    <>
      <group position={[SIM_POS.x, SIM_POS.y + drift, SIM_POS.z]} rotation={SIM_ROT}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial map={tex.map} metalnessMap={tex.metal} roughnessMap={tex.rough} metalness={1} roughness={1} clearcoat={0.4} clearcoatRoughness={0.2} />
        </mesh>
      </group>
      <primitive object={frags.im} />
    </>
  );
};

const DataStream: React.FC<{ f: number }> = ({ f }) => {
  const N = 420;
  const data = useMemo(() => {
    const r = prng(3301);
    const items = Array.from({ length: N }, () => ({
      s: Math.pow(r(), 0.85),
      j: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5),
      size: 0.6 + r() * 0.8,
      speed: 0.6 + r() * 0.6,
    }));
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), N);
    const c = new THREE.Color();
    items.forEach((it, i) => im.setColorAt(i, c.set(TEAL).multiplyScalar(1)));
    im.layers.set(FX_LAYER);
    return { items, im };
  }, []);
  const tube = useMemo(() => {
    const pts = Array.from({ length: 64 }, (_, i) => pathAt(0.1 + (i / 63) * 0.9));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.012, 8, false);
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    const gold = new THREE.Color("#e8c27a");
    const teal = new THREE.Color(TEAL);
    data.items.forEach((it, i) => {
      const s = (it.s + (f / 60) * 0.05 * it.speed) % 1;
      const t = 0.12 + s * 0.88;
      const spread = 0.16 * Math.sin(Math.PI * Math.min(1, s * 1.15)) * (1 - s * 0.7);
      const p = pathAt(t).add(it.j.clone().multiplyScalar(spread));
      const size = (0.034 - s * 0.026) * it.size;
      q.setFromEuler(new THREE.Euler(it.j.x * 6 + s * 4, it.j.y * 6, it.j.z * 6));
      m.compose(p, q, new THREE.Vector3(size, size, size));
      data.im.setMatrixAt(i, m);
      const glow = 0.8 + s * 3.2;
      c.copy(gold).lerp(teal, Math.min(1, s * 4)).multiplyScalar(glow);
      data.im.setColorAt(i, c);
    });
    data.im.instanceMatrix.needsUpdate = true;
    if (data.im.instanceColor) data.im.instanceColor.needsUpdate = true;
  }, [data, f]);
  return (
    <>
      <primitive object={data.im} />
      <mesh geometry={tube} layers={FX_LAYER}>
        <meshBasicMaterial color={TEAL} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
};

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.12} color="#cfd8e6" />
    <directionalLight position={[4, 6, 6]} intensity={1.6} color="#ffffff" />
    <directionalLight position={[-5, 3, -4]} intensity={1.4} color="#9fc6ff" />
    <directionalLight position={[2, -4, 3]} intensity={0.35} color="#ffe9d0" />
  </>
);

// ---------- overlay ----------
const Overlay: React.FC = () => {
  const chip = toScreen(CHIP_WORLD);
  const sim = toScreen(SIM_POS);
  const pad = 72;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* kicker */}
      <div style={{ position: "absolute", top: 196, left: pad, right: pad, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 26, letterSpacing: "0.28em", color: "rgba(226,232,240,0.78)" }}>
        <span>AUDIRA EXPLAINED</span>
        <span style={{ color: TEAL }}>AE-044</span>
      </div>
      <div style={{ position: "absolute", top: 240, left: pad, width: 120, height: 2, background: "rgba(226,232,240,0.35)" }} />
      {/* callouts */}
      <Callout x={chip.x} y={chip.y} dx={-chip.x + 96} dy={190} label="chip eUICC" sub={["disolder di papan", "sekitar 6×5 mm"]} />
      <Callout x={sim.x} y={sim.y} dx={-sim.x + 96} dy={-200} label="kartu SIM fisik" sub={["nano-SIM"]} />
      {/* title block */}
      <div style={{ position: "absolute", left: pad, right: pad, bottom: 384, fontFamily: INTER, color: "#f3f5f8" }}>
        <div style={{ fontSize: 168, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, color: TEAL, textShadow: "0 0 40px rgba(79,240,216,0.35)" }}>eSIM</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, marginTop: 6 }}>SIM TANPA KARTU</div>
        <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: "0.005em", color: "rgba(226,232,240,0.78)", marginTop: 18 }}>Chip-nya sudah tertanam di dalam ponsel</div>
      </div>
    </AbsoluteFill>
  );
};

const Callout: React.FC<{ x: number; y: number; dx: number; dy: number; label: string; sub: string[] }> = ({ x, y, dx, dy, label, sub }) => {
  const ex = x + dx, ey = y + dy;
  const left = dx < 0;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={x} cy={y} r={7} fill="none" stroke="rgba(230,240,245,0.85)" strokeWidth={2} />
        <polyline points={`${x},${y} ${x + dx * 0.35},${ey} ${ex},${ey}`} fill="none" stroke="rgba(230,240,245,0.6)" strokeWidth={1.6} />
      </svg>
      <div style={{ position: "absolute", top: ey + 10, left: left ? ex - 8 : undefined, right: left ? undefined : W - ex - 8, transform: left ? "translateX(0)" : undefined, textAlign: left ? "left" : "right", fontFamily: MONO, whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 26, color: "#eef3f6", letterSpacing: "0.04em" }}>{label}</div>
        {sub.map((t) => (
          <div key={t} style={{ fontSize: 21, color: "rgba(200,212,220,0.72)", letterSpacing: "0.05em", marginTop: 4 }}>{t}</div>
        ))}
      </div>
    </>
  );
};

export const Ep044Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const f = (frame / 30) * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP044 fonts for canvas text"));
  useEffect(() => {
    fontReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready ? (
        <ThreeCanvas width={W} height={H} dpr={1} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: CAM.fov, near: 0.1, far: 100, position: CAM.pos.toArray() as [number, number, number] }}>
          <CameraSetup />
          <Backdrop />
          <Lights />
          <Phone f={f} />
          <SimCard f={f} />
          <DataStream f={f} />
          <Finish frame={frame} background={BG} profile={GRADE} exposure={1.08} envIntensity={0.5} hdri="studio" envRotation={0.8} aoRadius={0.08} />
        </ThreeCanvas>
      ) : null}
      <Overlay />
    </AbsoluteFill>
  );
};
