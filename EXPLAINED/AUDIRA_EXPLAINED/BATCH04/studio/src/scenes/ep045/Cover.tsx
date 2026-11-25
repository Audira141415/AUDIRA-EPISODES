// AE-045 cover (POLYVERSE): pastel low-poly valley, giant phone with a blue location dot and dead
// signal/data icons, four low-poly GPS satellites broadcasting thin one-way signal lines down to it.
// Everything is driven by the 60 fps film clock f = frame / fps * 60; no unseeded randomness.

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont as loadTitle } from "@remotion/google-fonts/SpaceGrotesk";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { FONT, fontReady } from "../../core/type/fonts.ts";
import { LowPolyTree } from "../../kits/polyverse/nature/LowPolyTree.tsx";
import { hash, hash2 } from "../../kits/polyverse/core/noise.ts";
import { windSway } from "../../kits/polyverse/core/motion.ts";

const { fontFamily: TITLE_FONT } = loadTitle("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const TITLE = TITLE_FONT;

const FILM_FPS = 60;

export const C = {
  skyTop: "#8fb9f2",
  skyMid: "#f6dbe0",
  skyHorizon: "#ffe1c4",
  fog: "#f3dcd6",
  grassA: "#7cc896",
  grassB: "#63b585",
  grassC: "#9bd8a4",
  grassFar: "#9db8b0",
  road: "#f0d3a2",
  roadEdge: "#d9b47e",
  phoneBody: "#3d4766",
  phoneScreen: "#f6f1e4",
  blue: "#2f7dff",
  sun: "#ffe6bf",
  gold: "#d8a448",
  panel: "#27427e",
  signal: "#bfefff",
  wood: "#8a5a3c",
};

// ---------- terrain ----------
export const PHONE_BASE = { x: 0, z: 0 };
const mound = (x: number, z: number) => 2.5 * Math.exp(-((x - PHONE_BASE.x) ** 2 + (z - PHONE_BASE.z) ** 2) / (2 * 2.4 ** 2));
const farRise = (z: number) => (z < -4 ? Math.min(1, (-4 - z) / 18) : 0);
export const terrainH = (x: number, z: number) => {
  const roll = 0.35 * Math.sin(x * 0.35 + z * 0.22) + 0.28 * Math.sin(z * 0.47 - x * 0.18);
  const far = farRise(z);
  const hills = far * (2.6 + 2.2 * Math.sin(x * 0.21 + 1.3) + 1.4 * Math.sin(x * 0.47 - z * 0.13));
  return roll + mound(x, z) + Math.max(0, hills);
};

export const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(64, 64, 72, 72).toNonIndexed();
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -20);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const j = (hash2(Math.round(x * 10), Math.round(z * 10)) - 0.5) * 0.22;
      pos.setY(i, terrainH(x, z) + j);
    }
    g.computeVertexNormals();
    const col = new Float32Array(pos.count * 3);
    const a = new THREE.Color(C.grassA), b = new THREE.Color(C.grassB), c = new THREE.Color(C.grassC), far = new THREE.Color(C.grassFar);
    const tmp = new THREE.Color();
    for (let t = 0; t < pos.count; t += 3) {
      const cz = (pos.getZ(t) + pos.getZ(t + 1) + pos.getZ(t + 2)) / 3;
      const cy = (pos.getY(t) + pos.getY(t + 1) + pos.getY(t + 2)) / 3;
      const r = hash(t * 0.37);
      tmp.copy(r < 0.33 ? a : r < 0.66 ? b : c);
      tmp.lerp(far, Math.min(0.75, farRise(cz) * 0.9));
      tmp.offsetHSL(0, 0, Math.min(0.06, cy * 0.01));
      for (let k = 0; k < 3; k++) col.set([tmp.r, tmp.g, tmp.b], (t + k) * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.92} metalness={0} />
    </mesh>
  );
};

// ---------- winding road ----------
export const ROAD_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(3.6, 0, 13),
    new THREE.Vector3(-1.9, 0, 8.6),
    new THREE.Vector3(1.9, 0, 4.6),
    new THREE.Vector3(0.9, 0, 2.2),
    new THREE.Vector3(0.0, 0, 1.25),
  ],
  false,
  "catmullrom",
  0.5,
);

export const Road: React.FC = () => {
  const { road, dashes } = useMemo(() => {
    const N = 90;
    const pts = ROAD_CURVE.getSpacedPoints(N);
    const verts: number[] = [];
    const dashVerts: number[] = [];
    const side = (i: number, w: number, s: 1 | -1) => {
      const p = pts[i];
      const tan = ROAD_CURVE.getTangentAt(i / N);
      const nx = -tan.z, nz = tan.x;
      const len = Math.hypot(nx, nz) || 1;
      const x = p.x + (s * w * nx) / len;
      const z = p.z + (s * w * nz) / len;
      return [x, terrainH(x, z) + 0.09, z];
    };
    const width = (i: number) => 0.62 - 0.32 * (i / N);
    for (let i = 0; i < N; i++) {
      const a = side(i, width(i), -1), b = side(i, width(i), 1);
      const c = side(i + 1, width(i + 1), -1), d = side(i + 1, width(i + 1), 1);
      verts.push(...a, ...c, ...b, ...b, ...c, ...d);
      if (i % 4 < 2) {
        const dw = 0.045;
        const e = side(i, dw, -1), g = side(i, dw, 1), h = side(i + 1, dw, -1), k = side(i + 1, dw, 1);
        [e, g, h, k].forEach((v) => (v[1] += 0.015));
        dashVerts.push(...e, ...h, ...g, ...g, ...h, ...k);
      }
    }
    const mk = (arr: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
      g.computeVertexNormals();
      return g;
    };
    return { road: mk(verts), dashes: mk(dashVerts) };
  }, []);
  return (
    <group>
      <mesh geometry={road} receiveShadow>
        <meshStandardMaterial color={C.road} flatShading roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={dashes}>
        <meshStandardMaterial color="#fffaf0" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ---------- vegetation, rocks, clouds ----------
export const RoundTree: React.FC<{ p: [number, number, number]; s: number; f: number; seed: number; color: string }> = ({ p, s, f, seed, color }) => {
  const sway = windSway(f, 0.05, seed, 0.04);
  return (
    <group position={p} scale={s} rotation={[sway, seed, sway * 0.6]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.13, 0.7, 5]} />
        <meshStandardMaterial color={C.wood} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0.22, 1.3, 0.05]} castShadow>
        <icosahedronGeometry args={[0.36, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.8} />
      </mesh>
    </group>
  );
};

export const TREES = (() => {
  const out: { x: number; z: number; s: number; kind: number; seed: number }[] = [];
  const nearRoad = (x: number, z: number) => {
    for (let i = 0; i <= 40; i++) {
      const p = ROAD_CURVE.getPointAt(i / 40);
      if (Math.hypot(p.x - x, p.z - z) < 1.1) return true;
    }
    return false;
  };
  for (let i = 0; i < 160 && out.length < 58; i++) {
    const x = (hash(i * 3.1) - 0.5) * 30;
    const z = 9 - hash(i * 7.7 + 2) * 34;
    if (Math.hypot(x, z) < 2.6) continue; // keep the phone hill clear
    if (Math.abs(x) < 2.4 && z > -6 && z < 1) continue; // nothing directly behind the phone
    if (nearRoad(x, z)) continue;
    if (Math.abs(x) < 3.2 && z > 3) continue; // keep road lane in front readable
    out.push({ x, z, s: 0.55 + hash(i * 1.9) * 0.6, kind: hash(i * 5.3) < 0.55 ? 0 : 1, seed: i });
  }
  return out;
})();

export const ROUND_COLORS = ["#8fd3a0", "#f2b8a2", "#b7dc8f", "#7fc7a8"];

export const Rock: React.FC<{ p: [number, number, number]; s: number; r: number }> = ({ p, s, r }) => (
  <mesh position={p} scale={[s, s * 0.7, s]} rotation={[r, r * 2, 0]} castShadow receiveShadow>
    <dodecahedronGeometry args={[0.5, 0]} />
    <meshStandardMaterial color="#b9b3c9" flatShading roughness={0.9} />
  </mesh>
);

export const Cloud: React.FC<{ p: [number, number, number]; s: number; f: number }> = ({ p, s, f }) => {
  const dx = Math.sin(f * 0.004 + p[2]) * 0.3;
  return (
    <group position={[p[0] + dx, p[1], p[2]]} scale={[s, s * 0.62, s]}>
      {[
        [0, 0, 0, 0.9],
        [-0.85, -0.12, 0.1, 0.62],
        [0.8, -0.08, -0.1, 0.7],
        [0.3, 0.35, 0.15, 0.5],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <dodecahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#fff7f2" flatShading roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

export const Mountains: React.FC = () => (
  <group>
    {[
      [-15, -52, 7, 8],
      [-5, -58, 9, 10],
      [6, -55, 6.5, 8],
      [16, -50, 8, 9],
    ].map(([x, z, h, r], i) => (
      <mesh key={i} position={[x, h / 2 + 1.5, z]}>
        <coneGeometry args={[r, h, 6]} />
        <meshStandardMaterial color="#c3b5e0" flatShading roughness={0.95} />
      </mesh>
    ))}
  </group>
);

export const SkyDome: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(180, 32, 24);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const top = new THREE.Color(C.skyTop), mid = new THREE.Color(C.skyMid), hor = new THREE.Color(C.skyHorizon);
    const t = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 180;
      // the 36-degree lens only sees elevations up to ~0.3, so the whole gradient lives there
      if (y < 0.02) t.copy(hor);
      else if (y < 0.1) t.copy(hor).lerp(mid, (y - 0.02) / 0.08);
      else t.copy(mid).lerp(top, Math.min(1, (y - 0.1) / 0.18));
      col.set([t.r, t.g, t.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// ---------- canvas textures (font-gated) ----------
export const useFontGate = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("ep045 cover fonts"));
  useEffect(() => {
    fontReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};

export const drawScreen = (opt: { crosses?: boolean; pill?: boolean; map?: boolean } = {}): THREE.CanvasTexture => {
  const { crosses = true, pill = true, map = true } = opt;
  const W = 620, H = 1140;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = C.phoneScreen;
  g.fillRect(0, 0, W, H);
  if (!map) {
    // empty offline canvas: faint grid only
    g.strokeStyle = "#e3dccb";
    g.lineWidth = 2;
    for (let x = 0; x <= W; x += 62) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y <= H; y += 62) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  }
  // parks & water blocks
  if (map) {
  g.fillStyle = "#d3ebc9";
  [[40, 190, 210, 170], [380, 640, 200, 220], [60, 820, 180, 140]].forEach(([x, y, w, h]) => {
    g.beginPath();
    g.roundRect(x, y, w, h, 26);
    g.fill();
  });
  g.fillStyle = "#c4e4f2";
  g.beginPath();
  g.moveTo(0, 470);
  g.bezierCurveTo(200, 430, 330, 560, 620, 500);
  g.lineTo(620, 560);
  g.bezierCurveTo(330, 620, 200, 490, 0, 530);
  g.closePath();
  g.fill();
  // roads
  const road = (pts: number[][], w: number) => {
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#dcd3c0";
    g.lineWidth = w + 8;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    g.strokeStyle = "#ffffff";
    g.lineWidth = w;
    g.stroke();
  };
  road([[300, 1140], [280, 900], [330, 700], [300, 420], [340, 120]], 26);
  road([[0, 300], [180, 360], [620, 330]], 18);
  road([[0, 760], [260, 720], [620, 860]], 18);
  road([[470, 1140], [520, 900], [610, 760]], 12);
  road([[120, 1140], [150, 980], [60, 640], [110, 420]], 12);
  }
  // status bar
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.fillRect(0, 0, W, 96);
  // signal bars (dead)
  const bx = 40, by = 72;
  for (let i = 0; i < 4; i++) {
    g.fillStyle = "#b9bfc9";
    g.fillRect(bx + i * 20, by - 14 - i * 10, 14, 14 + i * 10);
  }
  const cross = (cx: number, cy: number, r: number) => {
    g.fillStyle = "#ff5a5f";
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#fff";
    g.lineWidth = 5;
    g.lineCap = "round";
    const d = r * 0.42;
    g.beginPath();
    g.moveTo(cx - d, cy - d);
    g.lineTo(cx + d, cy + d);
    g.moveTo(cx + d, cy - d);
    g.lineTo(cx - d, cy + d);
    g.stroke();
  };
  if (crosses) cross(122, 34, 17);
  // mobile data arrows (dead)
  g.strokeStyle = "#b9bfc9";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(190, 76);
  g.lineTo(190, 30);
  g.moveTo(176, 44);
  g.lineTo(190, 30);
  g.lineTo(204, 44);
  g.moveTo(222, 30);
  g.lineTo(222, 76);
  g.moveTo(208, 62);
  g.lineTo(222, 76);
  g.lineTo(236, 62);
  g.stroke();
  if (crosses) cross(254, 34, 17);
  // battery
  g.strokeStyle = "#5b6275";
  g.lineWidth = 4;
  g.strokeRect(500, 36, 66, 32);
  g.fillStyle = "#5b6275";
  g.fillRect(568, 45, 6, 14);
  g.fillStyle = "#53c27a";
  g.fillRect(506, 42, 40, 20);
  // bottom pill: GPS aktif
  if (pill) {
  g.fillStyle = "#ffffff";
  g.shadowColor = "rgba(40,50,80,0.25)";
  g.shadowBlur = 18;
  g.beginPath();
  g.roundRect(150, 1000, 320, 84, 42);
  g.fill();
  g.shadowBlur = 0;
  g.fillStyle = C.blue;
  g.beginPath();
  g.arc(200, 1042, 14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#26304a";
  g.font = `600 38px ${FONT}`;
  g.textBaseline = "middle";
  g.fillText("GPS aktif", 232, 1044);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const drawSign = (): THREE.CanvasTexture => {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 192;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fbf1df";
  g.fillRect(0, 0, 512, 192);
  g.strokeStyle = "#c79a6a";
  g.lineWidth = 10;
  g.strokeRect(10, 10, 492, 172);
  g.fillStyle = "#2e3a5c";
  g.font = `600 96px ${FONT}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("AUDIRA", 256, 104);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const drawPanel = (): THREE.CanvasTexture => {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = C.panel;
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = "#8fb0e8";
  g.lineWidth = 3;
  for (let x = 0; x <= 256; x += 32) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 128);
    g.stroke();
  }
  for (let y = 0; y <= 128; y += 32) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// ---------- phone ----------
export const PHONE = { w: 3.0, h: 5.4, d: 0.32 };
export const phoneBaseY = terrainH(0, 0) + 0.18;
export const PHONE_POS = new THREE.Vector3(0, phoneBaseY + 0.3 + PHONE.h / 2, 0);
export const PHONE_ROT = new THREE.Euler(-0.05, -0.16, 0);
/** Where the signal lines land: the top edge of the phone (its GNSS antenna). */
export const SIGNAL_TARGET = new THREE.Vector3(0, PHONE.h / 2 + 0.05, 0.05).applyEuler(PHONE_ROT).add(PHONE_POS);

const Phone: React.FC<{ f: number; screen: THREE.Texture | null }> = ({ f, screen }) => {
  const pulse = (f * 0.012) % 1;
  return (
    <group position={PHONE_POS} rotation={PHONE_ROT}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[PHONE.w, PHONE.h, PHONE.d]} radius={0.16} segments={5} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.phoneBody} />
      </mesh>
      <mesh position={[0, 0, PHONE.d / 2 + 0.006]}>
        <planeGeometry args={[PHONE.w - 0.22, PHONE.h - 0.42]} />
        {screen ? (
          <meshStandardMaterial map={screen} emissiveMap={screen} emissive="#ffffff" emissiveIntensity={0.95} roughness={0.4} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={C.phoneScreen} />
        )}
      </mesh>
      {/* camera notch */}
      <mesh position={[0, PHONE.h / 2 - 0.12, PHONE.d / 2 + 0.01]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#1b2033" />
      </mesh>
      {/* blue location dot: halo, white ring, glowing core */}
      <group position={[0.05, -0.15, PHONE.d / 2 + 0.03]}>
        <mesh>
          <circleGeometry args={[0.62 + pulse * 0.25, 40]} />
          <meshBasicMaterial color={C.blue} transparent opacity={0.22 * (1 - pulse * 0.6)} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.24, 40]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.17, 40]} />
          <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {/* heading wedge */}
        <mesh position={[0, 0.42, 0.005]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.36, 24, -0.55 + Math.PI / 2 + Math.PI, 1.1]} />
          <meshBasicMaterial color={C.blue} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
      {/* side buttons */}
      <mesh position={[PHONE.w / 2 + 0.02, 1.4, 0]}>
        <RoundedBoxGeo args={[0.06, 0.7, 0.14]} radius={0.025} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2f3752" />
      </mesh>
    </group>
  );
};

export const PhoneStand: React.FC = () => (
  <group position={[0, phoneBaseY, 0]} rotation={[0, -0.16, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
      <cylinderGeometry args={[1.5, 1.8, 0.45, 7]} />
      <meshStandardMaterial color="#c9bfd9" flatShading roughness={0.85} />
    </mesh>
  </group>
);

// ---------- satellites + one-way signal ----------
const Satellite: React.FC<{ pos: THREE.Vector3; s: number; f: number; panelTex: THREE.Texture | null; seed: number }> = ({ pos, s, f, panelTex, seed }) => {
  const q = useMemo(() => {
    const dir = SIGNAL_TARGET.clone().sub(pos).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  }, [pos]);
  const spin = Math.sin(f * 0.01 + seed) * 0.08;
  return (
    <group position={pos} quaternion={q} scale={s}>
      <group rotation={[0, spin + seed * 0.7, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[0.7, 0.9, 0.7]} radius={0.06} segments={2} />
          <meshPhysicalMaterial color={C.gold} metalness={0.85} roughness={0.32} clearcoat={0.3} flatShading />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.62, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.55, 6]} />
              <meshStandardMaterial color="#d7dbe6" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[side * 1.5, 0.05, 0]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[1.3, 0.04, 0.62]} />
              {panelTex ? (
                <meshStandardMaterial map={panelTex} metalness={0.4} roughness={0.35} />
              ) : (
                <meshStandardMaterial color={C.panel} />
              )}
            </mesh>
          </group>
        ))}
        {/* earth-facing antenna array */}
        {[-0.2, 0, 0.2].flatMap((x) =>
          [-0.2, 0.2].map((z) => (
            <mesh key={`${x}${z}`} position={[x, -0.55, z]}>
              <cylinderGeometry args={[0.05, 0.07, 0.22, 6]} />
              <meshStandardMaterial color="#eef0f6" metalness={0.5} roughness={0.35} flatShading />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.55, 0]}>
          <coneGeometry args={[0.16, 0.25, 6]} />
          <meshStandardMaterial color="#eef0f6" metalness={0.5} roughness={0.35} flatShading />
        </mesh>
      </group>
    </group>
  );
};

const SignalLine: React.FC<{ from: THREE.Vector3; f: number; seed: number }> = ({ from, f, seed }) => {
  const { mid, len, q, dir } = useMemo(() => {
    const d = SIGNAL_TARGET.clone().sub(from);
    const l = d.length();
    return {
      mid: from.clone().add(SIGNAL_TARGET).multiplyScalar(0.5),
      len: l,
      dir: d.clone().normalize(),
      q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()),
    };
  }, [from]);
  const pulses = [0, 1, 2].map((k) => ((f * 0.006 + k / 3 + seed * 0.13) % 1));
  return (
    <group>
      <mesh position={mid} quaternion={q}>
        <cylinderGeometry args={[0.03, 0.03, len, 6]} />
        <meshBasicMaterial color={C.signal} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {pulses.map((t, k) => {
        const p = from.clone().addScaledVector(dir, len * (0.08 + t * 0.86));
        return (
          <mesh key={k} position={p} quaternion={q} scale={[1, 2.6, 1]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color="#fff6c8" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const SATS: { pos: THREE.Vector3; s: number }[] = [
  { pos: new THREE.Vector3(-3.23, 10.55, -8), s: 0.62 },
  { pos: new THREE.Vector3(3.18, 11.15, -10), s: 0.62 },
  { pos: new THREE.Vector3(-4.67, 7.84, -12), s: 0.68 },
  { pos: new THREE.Vector3(4.17, 8.25, -11), s: 0.68 },
];

export const Signpost: React.FC<{ tex: THREE.Texture | null }> = ({ tex }) => {
  const x = 2.45, z = 1.9;
  const y = terrainH(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, -0.3, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.0, 5]} />
        <meshStandardMaterial color={C.wood} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, 0.04]} castShadow>
        <RoundedBoxGeo args={[1.05, 0.42, 0.06]} radius={0.02} segments={2} />
        <meshStandardMaterial color="#c79a6a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.02, 0.09]}>
        <planeGeometry args={[0.96, 0.36]} />
        {tex ? <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.45} roughness={0.8} /> : <meshStandardMaterial color="#fbf1df" />}
      </mesh>
    </group>
  );
};

// ---------- camera ----------
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const drift = Math.sin(f * 0.004) * 0.25;
    cam.position.set(0.4 + drift, 7.4, 21);
    cam.lookAt(0, 4.7, 0);
    cam.fov = 36;
    cam.near = 0.1;
    cam.far = 400;
    cam.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

const World: React.FC<{ f: number; frame: number }> = ({ f, frame }) => {
  const ready = useFontGate();
  const screen = useMemo(() => (ready ? drawScreen() : null), [ready]);
  const sign = useMemo(() => (ready ? drawSign() : null), [ready]);
  const panel = useMemo(() => (typeof document !== "undefined" ? drawPanel() : null), []);
  return (
    <>
      <CameraRig f={f} />
      <fog attach="fog" args={[C.fog, 30, 125]} />
      <SkyDome />
      <hemisphereLight args={["#fde9da", "#6fae86", 1.1]} />
      <directionalLight
        position={[9, 15, 11]}
        color={C.sun}
        intensity={3.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-8, 6, -10]} color="#ffb3a0" intensity={0.9} />
      <Mountains />
      <Terrain />
      <Road />
      <PhoneStand />
      <Phone f={f} screen={screen} />
      <Signpost tex={sign} />
      {/* foreground framing pines (partly cropped) for depth */}
      <RoundTree p={[-2.75, terrainH(-2.75, 5.6), 5.6]} s={0.95} f={f} seed={91} color="#f2b8a2" />
      <LowPolyTree position={[3.15, terrainH(3.15, 5.9), 5.9]} scale={0.8} f={f} seed={92} />
      <RoundTree p={[2.6, terrainH(2.6, 6.6), 6.6]} s={0.7} f={f} seed={93} color="#b7dc8f" />
      {TREES.map((t) => {
        const y = terrainH(t.x, t.z);
        return t.kind === 0 ? (
          <LowPolyTree key={t.seed} position={[t.x, y, t.z]} scale={t.s} f={f} seed={t.seed} />
        ) : (
          <RoundTree key={t.seed} p={[t.x, y, t.z]} s={t.s * 1.1} f={f} seed={t.seed} color={ROUND_COLORS[t.seed % ROUND_COLORS.length]} />
        );
      })}
      {[
        [-2.9, 3.2, 0.5, 0.4],
        [3.1, 1.6, 0.4, 1.1],
        [-4.2, 6.5, 0.6, 2.2],
        [1.7, -1.8, 0.45, 0.7],
      ].map(([x, z, s, r], i) => (
        <Rock key={i} p={[x, terrainH(x, z) + 0.1, z]} s={s} r={r} />
      ))}
      <Cloud p={[-9.5, 6.6, -30]} s={2.6} f={f} />
      <Cloud p={[10, 7.2, -32]} s={3.0} f={f} />
      <Cloud p={[1.5, 9.4, -40]} s={2.4} f={f} />
      <Cloud p={[-2, 15.5, -36]} s={2.0} f={f} />
      {SATS.map((s, i) => (
        <SignalLine key={`l${i}`} from={s.pos} f={f} seed={i} />
      ))}
      {SATS.map((s, i) => (
        <Satellite key={`s${i}`} pos={s.pos} s={s.s} f={f} panelTex={panel} seed={i} />
      ))}
      <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} hdri="sky" ao />
    </>
  );
};

const TitleOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 820,
        background: "linear-gradient(180deg, rgba(36,46,74,0) 0%, rgba(36,46,74,0.28) 45%, rgba(30,38,62,0.62) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 392,
        textAlign: "center",
        fontFamily: TITLE_FONT,
        color: "#ffffff",
      }}
    >
      <div style={{ fontWeight: 500, fontSize: 30, letterSpacing: 9, color: "#ffe9b0", marginBottom: 18 }}>AUDIRA EXPLAINED</div>
      <div style={{ fontWeight: 700, fontSize: 104, lineHeight: 1.0, letterSpacing: -2, textShadow: "0 6px 26px rgba(20,26,48,0.45)" }}>
        KUOTA HABIS,
      </div>
      <div style={{ fontWeight: 700, fontSize: 92, lineHeight: 1.06, letterSpacing: -2, color: "#ffeaa7", textShadow: "0 6px 26px rgba(20,26,48,0.45)" }}>
        GPS TETAP JALAN
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep045Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: C.skyHorizon }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 36, near: 0.1, far: 400, position: [0, 7.4, 21] }}>
        <World f={f} frame={frame} />
      </ThreeCanvas>
      <TitleOverlay />
    </AbsoluteFill>
  );
};
