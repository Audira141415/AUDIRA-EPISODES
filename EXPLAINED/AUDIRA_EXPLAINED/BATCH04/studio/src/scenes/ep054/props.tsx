// AE-054 film props: Autobahn diorama tile (driving on the right, fast lane = left), toy vehicles,
// round/square sign faces, map game pieces, oil-crisis set, balance scale, LED gantry, tactical arrows.
// Scale on the road tile: 1 m = 0.05 world units.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { Base, Pole, PAL, signFace282, signFace130 } from "./Cover.tsx";

// ---------- road tile geometry ----------
export const M = 0.05;
export const RZ = 6.2; // road centre line (z)
export const RY = 0.06; // asphalt top
export const LANE = 3.75 * M;
export const MED = 0.1; // half median width
export const SHOULDER = 2.5 * M;
export const ROAD_HALF = MED + 3 * LANE + SHOULDER; // 0.7875
export const RX = 9; // tile spans -RX..RX
/** +x carriageway (z > RZ): lane 0 = left / fast, 2 = right / slow. */
export const laneP = (i: number) => RZ + MED + LANE * (i + 0.5);
/** -x carriageway (z < RZ). */
export const laneN = (i: number) => RZ - MED - LANE * (i + 0.5);

const asphaltTex = () => {
  const W = 4096, H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const rnd = prng(8812);
  ctx.fillStyle = "#3A3B3D";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60000; i++) {
    const v = 40 + rnd() * 40;
    ctx.fillStyle = `rgba(${v},${v},${v + 2},0.5)`;
    ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
  }
  // tyre tracks: slightly darker bands in each lane
  const zToY = (z: number) => ((z - (RZ - ROAD_HALF)) / (2 * ROAD_HALF)) * H;
  for (let i = 0; i < 3; i++) {
    for (const lz of [laneP(i), laneN(i)]) {
      for (const o of [-0.045, 0.045]) {
        ctx.fillStyle = "rgba(20,20,22,0.25)";
        ctx.fillRect(0, zToY(lz + o) - 6, W, 12);
      }
    }
  }
  const pxPerUnit = W / (2 * RX);
  ctx.fillStyle = "#EDEDE6";
  const line = (z: number, dashed: boolean, wpx = 5) => {
    const y = zToY(z);
    if (!dashed) {
      ctx.fillRect(0, y - wpx / 2, W, wpx);
      return;
    }
    const dash = 6 * M * pxPerUnit, gap = 12 * M * pxPerUnit;
    for (let x = 0; x < W; x += dash + gap) ctx.fillRect(x, y - wpx / 2, dash, wpx);
  };
  for (const side of [1, -1]) {
    line(RZ + side * (MED + 0.006), false, 6); // inner edge
    line(RZ + side * (MED + LANE), true);
    line(RZ + side * (MED + 2 * LANE), true);
    line(RZ + side * (MED + 3 * LANE), false, 5); // outer edge (shoulder)
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
};

/** Diorama tile: earth base, asphalt, grass median with steel guardrails, verges with trees. */
export const RoadTile: React.FC = () => {
  const tex = useMemo(asphaltTex, []);
  const grain = useSurfaceGrain(31, 0.3, 8);
  const trees = useMemo(() => {
    const rnd = prng(404);
    const out: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const side = rnd() < 0.5 ? -1 : 1;
      out.push({ x: -RX + rnd() * 2 * RX, z: RZ + side * (ROAD_HALF + 0.12 + rnd() * 0.3), s: 0.7 + rnd() * 0.6 });
    }
    return out;
  }, []);
  const posts = useMemo(() => Array.from({ length: Math.floor((2 * RX) / 0.2) }, (_, i) => -RX + 0.1 + i * 0.2), []);
  const w = 2 * ROAD_HALF;
  return (
    <group>
      {/* earth block of the diorama tile */}
      <mesh position={[0, (RY - 0.02) / 2 - 0.02, RZ]} receiveShadow castShadow>
        <boxGeometry args={[2 * RX, RY + 0.0, w + 1.0]} />
        <meshStandardMaterial color="#6B5236" roughness={0.95} />
      </mesh>
      {/* verges (grass) */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, RY + 0.001, RZ + s * (ROAD_HALF + 0.25)]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2 * RX, 0.5]} />
          <meshStandardMaterial color="#6E7B45" roughness={0.95} bumpMap={grain} bumpScale={0.02} />
        </mesh>
      ))}
      {/* asphalt */}
      <mesh position={[0, RY + 0.002, RZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2 * RX, w]} />
        <meshStandardMaterial map={tex} roughness={0.95} envMapIntensity={0.12} bumpMap={grain} bumpScale={0.01} />
      </mesh>
      {/* grass median */}
      <mesh position={[0, RY + 0.004, RZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2 * RX, 2 * MED - 0.03]} />
        <meshStandardMaterial color="#5F6C3C" roughness={0.95} />
      </mesh>
      {/* guardrails both sides of the median */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, RY + 0.03, RZ + s * (MED - 0.025)]} castShadow>
            <boxGeometry args={[2 * RX, 0.016, 0.004]} />
            <meshStandardMaterial color="#C3C8CB" metalness={0.85} roughness={0.35} />
          </mesh>
          {posts.map((x) => (
            <mesh key={x} position={[x, RY + 0.018, RZ + s * (MED - 0.03)]}>
              <boxGeometry args={[0.006, 0.036, 0.006]} />
              <meshStandardMaterial color="#9CA2A6" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {/* roadside trees (low-poly cones, map-model style) */}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, RY, t.z]} scale={t.s}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.006, 0.008, 0.04, 6]} />
            <meshStandardMaterial color="#4A3524" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.09, 0]} castShadow>
            <coneGeometry args={[0.045, 0.13, 7]} />
            <meshPhysicalMaterial {...POLISH.clay} color={i % 3 ? "#3F5A33" : "#4E6B3A"} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------- vehicles ----------
const Wheel: React.FC<{ p: [number, number, number]; r: number }> = ({ p, r }) => (
  <mesh position={p} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[r, r, r * 0.9, 16]} />
    <meshStandardMaterial color="#141414" roughness={0.7} />
  </mesh>
);

/** Toy car, length ~4.5 m, nose toward +x. */
export const Car: React.FC<{ color: string }> = ({ color }) => {
  const L = 4.5 * M, Wd = 1.85 * M, Hb = 0.75 * M;
  return (
    <group>
      <mesh position={[0, 0.012 + Hb / 2, 0]} castShadow>
        <RoundedBoxGeo args={[L, Hb, Wd]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} clearcoat={0.8} />
      </mesh>
      <mesh position={[-0.012, 0.012 + Hb + 0.02, 0]} castShadow>
        <RoundedBoxGeo args={[L * 0.52, 0.042, Wd * 0.86]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.glossyEye} color="#1C232B" />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[L / 2 + 0.001, 0.012 + Hb * 0.6, s * Wd * 0.32]}>
            <boxGeometry args={[0.004, 0.012, 0.022]} />
            <meshStandardMaterial color="#FFF6DD" emissive="#FFF0C8" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[-L / 2 - 0.001, 0.012 + Hb * 0.6, s * Wd * 0.32]}>
            <boxGeometry args={[0.004, 0.01, 0.024]} />
            <meshStandardMaterial color="#B3121A" emissive="#FF1A1A" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}
      {[[L * 0.32, 1], [L * 0.32, -1], [-L * 0.32, 1], [-L * 0.32, -1]].map(([x, s], i) => (
        <Wheel key={i} p={[x, 0.016, s * (Wd / 2 - 0.004)]} r={0.016} />
      ))}
    </group>
  );
};

const rear80 = () => {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F4F4EE";
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#C8102E";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#111";
  ctx.font = "700 112px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("80", s / 2, s / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Toy articulated truck (cab + box trailer), ~16.5 m, nose +x, rear "80" disc. */
export const Truck: React.FC<{ color?: string }> = ({ color = "#2F5D8A" }) => {
  const r80 = useMemo(rear80, []);
  const Wd = 2.5 * M;
  const TL = 13.6 * M, TH = 2.9 * M;
  return (
    <group>
      {/* trailer */}
      <mesh position={[-0.1, 0.03 + TH / 2, 0]} castShadow>
        <RoundedBoxGeo args={[TL, TH, Wd]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#E7E3D8" />
      </mesh>
      <mesh position={[-0.1 - TL / 2 - 0.0012, 0.03 + TH * 0.42, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.022, 32]} />
        <meshStandardMaterial map={r80} roughness={0.4} />
      </mesh>
      {/* cab */}
      <mesh position={[-0.1 + TL / 2 + 0.06, 0.03 + 0.07, 0]} castShadow>
        <RoundedBoxGeo args={[0.1, 0.14, Wd * 0.98]} radius={0.014} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
      </mesh>
      <mesh position={[-0.1 + TL / 2 + 0.111, 0.03 + 0.1, 0]}>
        <boxGeometry args={[0.002, 0.05, Wd * 0.8]} />
        <meshPhysicalMaterial {...POLISH.glossyEye} color="#1C232B" />
      </mesh>
      {[-0.1 - TL / 2 + 0.06, -0.1 - TL / 2 + 0.12, -0.1 - TL / 2 + 0.18, -0.1 + TL / 2 + 0.03, -0.1 + TL / 2 + 0.09].map((x, i) =>
        [1, -1].map((s) => <Wheel key={`${i}${s}`} p={[x, 0.024, s * (Wd / 2 - 0.006)]} r={0.024} />),
      )}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-0.1 - TL / 2 - 0.001, 0.035, s * Wd * 0.38]}>
          <boxGeometry args={[0.003, 0.01, 0.02]} />
          <meshStandardMaterial color="#B3121A" emissive="#FF1A1A" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- sign faces ----------
const canvasTex = (draw: (ctx: CanvasRenderingContext2D, s: number) => void, s = 512) => {
  const c = document.createElement("canvas");
  c.width = c.height = s;
  draw(c.getContext("2d")!, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
/** Speed limit: white disc, red ring, black number. */
export const faceLimit = (n: number) =>
  canvasTex((ctx, s) => {
    ctx.fillStyle = "#F7F7F2";
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#C8102E";
    ctx.lineWidth = s * 0.11;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2 - s * 0.075, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.font = `700 ${n >= 100 ? s * 0.36 : s * 0.44}px 'Arial Narrow', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), s / 2, s / 2 + s * 0.02);
  });
/** LED panel of a gantry: black square, glowing red ring + white number. */
export const faceLed = (n: number) =>
  canvasTex((ctx, s) => {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "#FF2A2A";
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 ${s * 0.3}px 'Arial Narrow', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), s / 2, s / 2 + s * 0.02);
  });

/** Round sign on a post (road scale, no base). Face toward -x (oncoming +x traffic) by default. */
export const RoadSign: React.FC<{ tex: THREE.Texture; R?: number; h?: number; glow?: number }> = ({ tex, R = 0.055, h = 0.14, glow = 0 }) => (
  <group>
    <mesh position={[0, h / 2, 0]} castShadow>
      <cylinderGeometry args={[0.004, 0.004, h, 12]} />
      <meshStandardMaterial color="#B9BEC2" metalness={0.85} roughness={0.38} />
    </mesh>
    <group position={[-0.006, h, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[R, R, 0.004, 64]} />
        <meshStandardMaterial color="#A9AEB2" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.0025]}>
        <circleGeometry args={[R * 0.99, 64]} />
        <meshStandardMaterial map={tex} roughness={0.35} emissive="#FFFFFF" emissiveMap={tex} emissiveIntensity={0.08 + glow * 0.5} />
      </mesh>
    </group>
  </group>
);

/** Map game piece: round sign on a pole on a wood/brass base (like the cover pieces). */
export const RoundPiece: React.FC<{ tex: THREE.Texture; R?: number; poleH?: number }> = ({ tex, R = 0.5, poleH = 0.85 }) => (
  <group>
    <Base r={0.3} />
    <group position={[0, 0.1, 0]}>
      <Pole h={poleH + 0.2} />
      <group position={[0, poleH, 0.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[R, R, 0.03, 96]} />
          <meshStandardMaterial color="#A9AEB2" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh>
          <torusGeometry args={[R, 0.016, 12, 96]} />
          <meshStandardMaterial color="#C9CDD0" metalness={0.9} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0, 0.017]}>
          <circleGeometry args={[R - 0.004, 96]} />
          <meshPhysicalMaterial map={tex} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
        </mesh>
      </group>
    </group>
  </group>
);

export const useFaces = () =>
  useMemo(() => ({ s282: signFace282(), s130: signFace130(), l100: faceLimit(100), l120: faceLimit(120), led120: faceLed(120) }), []);

/** Toy car as a map piece (bigger, on a small base). */
export const CarPiece: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[0.2, 0.22, 0.04, 40]} />
      <meshStandardMaterial color={PAL.brass} metalness={0.9} roughness={0.32} />
    </mesh>
    <group position={[0, 0.04, 0]} scale={1.3}>
      <Car color={color} />
    </group>
  </group>
);

// ---------- 1973 oil crisis set ----------
const drumLabel = (color: string) =>
  canvasTex((ctx, s) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, s, s);
    const rnd = prng(color.length * 97 + color.charCodeAt(2));
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,0.18)" : "rgba(255,230,190,0.08)";
      ctx.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 6, 1 + rnd() * 3);
    }
    // stencil panel
    ctx.fillStyle = "rgba(236,222,186,0.9)";
    ctx.fillRect(s * 0.06, s * 0.36, s * 0.3, s * 0.28);
    ctx.fillStyle = "#1A1A1A";
    ctx.font = `700 ${s * 0.085}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText("200 L", s * 0.21, s * 0.48);
    ctx.font = `700 ${s * 0.06}px 'Courier New', monospace`;
    ctx.fillText("MINYAK", s * 0.21, s * 0.58);
    // drips from the lid
    ctx.fillStyle = "rgba(10,8,6,0.55)";
    for (let i = 0; i < 6; i++) ctx.fillRect(rnd() * s, 0, 3 + rnd() * 4, s * (0.05 + rnd() * 0.2));
  }, 512);

export const Barrel: React.FC<{ color: string }> = ({ color }) => {
  const tex = useMemo(() => drumLabel(color), [color]);
  const metal = { metalness: 0.55, roughness: 0.48 } as const;
  return (
    <group>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.34, 48]} />
        <meshStandardMaterial map={tex} {...metal} />
      </mesh>
      {/* rolling hoops and rolled rims */}
      {[0.005, 0.115, 0.225, 0.335].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i === 0 || i === 3 ? 0.11 : 0.1135, i === 0 || i === 3 ? 0.008 : 0.006, 10, 48]} />
          <meshStandardMaterial color={color} {...metal} />
        </mesh>
      ))}
      <mesh position={[0, 0.337, 0]}>
        <cylinderGeometry args={[0.104, 0.104, 0.004, 48]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {[[0.05, 0.02], [-0.055, -0.03]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.343, z]}>
          <cylinderGeometry args={[i ? 0.01 : 0.016, i ? 0.01 : 0.016, 0.01, 16]} />
          <meshStandardMaterial color="#5A5A55" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

/** Retro fuel pump (generic, no brand): meter window with litre counter, hose and nozzle in its holster. */
export const FuelPump: React.FC = () => {
  const dial = useMemo(
    () =>
      canvasTex((ctx, s) => {
        ctx.fillStyle = "#EFE6CF";
        ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = "#2A2A2A";
        ctx.lineWidth = 8;
        ctx.strokeRect(14, 14, s - 28, s - 28);
        const row = (y: number, digits: string, unit: string) => {
          ctx.fillStyle = "#1E1E1E";
          ctx.fillRect(40, y, s - 150, 92);
          ctx.fillStyle = "#F4EEDC";
          ctx.font = "700 74px 'Courier New', monospace";
          ctx.textAlign = "center";
          ctx.fillText(digits, 40 + (s - 150) / 2, y + 70);
          ctx.fillStyle = "#2A2A2A";
          ctx.font = "700 30px 'Courier New', monospace";
          ctx.textAlign = "left";
          ctx.fillText(unit, s - 102, y + 60);
        };
        row(60, "0037,5", "L");
        row(200, "0000", "x");
        ctx.fillStyle = "#2A2A2A";
        ctx.font = "700 34px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("LITER", s / 2, s - 60);
      }, 512),
    [],
  );
  const grain = useSurfaceGrain(73, 0.3, 2);
  const hose = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.112, 0.46, 0.0),
        new THREE.Vector3(0.2, 0.36, 0.03),
        new THREE.Vector3(0.22, 0.12, 0.06),
        new THREE.Vector3(0.17, 0.04, 0.1),
        new THREE.Vector3(0.12, 0.08, 0.1),
        new THREE.Vector3(0.118, 0.3, 0.06),
      ]),
    [],
  );
  const chrome = { color: "#D9DCDD", metalness: 0.95, roughness: 0.2 } as const;
  return (
    <group>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.34, 0.06, 0.28]} radius={0.012} />
        <meshStandardMaterial color="#8A857A" roughness={0.85} bumpMap={grain} bumpScale={0.02} />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <RoundedBoxGeo args={[0.22, 0.54, 0.16]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#B2382B" bumpMap={grain} bumpScale={0.01} />
      </mesh>
      {[0.12, 0.56].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <RoundedBoxGeo args={[0.228, 0.014, 0.168]} radius={0.006} />
          <meshStandardMaterial {...chrome} />
        </mesh>
      ))}
      <mesh position={[0, 0.41, 0.0805]}>
        <RoundedBoxGeo args={[0.17, 0.17, 0.006]} radius={0.004} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0, 0.41, 0.0845]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshStandardMaterial map={dial} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.03, 24]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0, 0.69, 0]}>
        <sphereGeometry args={[0.075, 32, 20]} />
        <meshStandardMaterial color="#F6EFE0" emissive="#FFE9B8" emissiveIntensity={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[0.118, 0.3, 0.04]}>
        <boxGeometry args={[0.016, 0.06, 0.05]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.5} roughness={0.5} />
      </mesh>
      <group position={[0.13, 0.32, 0.06]} rotation={[0, 0, -0.5]}>
        <mesh>
          <RoundedBoxGeo args={[0.03, 0.07, 0.03]} radius={0.008} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh position={[0.02, -0.045, 0]} rotation={[0, 0, 1.1]}>
          <cylinderGeometry args={[0.006, 0.007, 0.06, 12]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
      </group>
      <mesh>
        <tubeGeometry args={[hose, 40, 0.008, 10, false]} />
        <meshStandardMaterial color="#141414" roughness={0.55} />
      </mesh>
    </group>
  );
};

/** Concrete forecourt slab under the oil set, with expansion joints and oil stains. */
export const OilSlab: React.FC = () => {
  const grain = useSurfaceGrain(91, 0.35, 4);
  const stain = useMemo(
    () =>
      canvasTex((ctx, s) => {
        ctx.fillStyle = "#9A958A";
        ctx.fillRect(0, 0, s, s);
        const rnd = prng(515);
        for (let i = 0; i < 4000; i++) {
          const v = 120 + rnd() * 60;
          ctx.fillStyle = `rgba(${v},${v - 4},${v - 12},0.35)`;
          ctx.fillRect(rnd() * s, rnd() * s, 2, 2);
        }
        ctx.strokeStyle = "rgba(40,36,30,0.6)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(s / 2, 0);
        ctx.lineTo(s / 2, s);
        ctx.moveTo(0, s / 2);
        ctx.lineTo(s, s / 2);
        ctx.stroke();
        for (let k = 0; k < 3; k++) {
          const x = s * (0.55 + rnd() * 0.2), y = s * (0.45 + rnd() * 0.2), r = s * (0.06 + rnd() * 0.08);
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, "rgba(15,12,8,0.75)");
          g.addColorStop(1, "rgba(15,12,8,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
        }
      }, 512),
    [],
  );
  return (
    <mesh position={[0, 0.012, 0]} receiveShadow castShadow>
      <RoundedBoxGeo args={[1.7, 0.024, 1.25]} radius={0.008} />
      <meshStandardMaterial map={stain} roughness={0.9} bumpMap={grain} bumpScale={0.02} />
    </mesh>
  );
};

/** Archive paper: typed sheet with a photo block (no real headline quoted). */
export const ArchiveSheet: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex((ctx, s) => {
        ctx.fillStyle = "#E6D8B6";
        ctx.fillRect(0, 0, s, s);
        const rnd = prng(1973);
        for (let i = 0; i < 3000; i++) {
          ctx.fillStyle = "rgba(120,80,30,0.08)";
          ctx.fillRect(rnd() * s, rnd() * s, 3, 3);
        }
        ctx.fillStyle = "#2A2118";
        ctx.font = `700 ${s * 0.09}px Georgia, serif`;
        ctx.fillText("ARSIP 1973", s * 0.08, s * 0.14);
        ctx.fillRect(s * 0.08, s * 0.17, s * 0.84, 4);
        ctx.fillStyle = "#4A3E30";
        ctx.fillRect(s * 0.08, s * 0.22, s * 0.4, s * 0.3);
        ctx.fillStyle = "rgba(230,216,182,0.25)";
        ctx.fillRect(s * 0.12, s * 0.38, s * 0.32, s * 0.08);
        for (let r = 0; r < 14; r++) {
          const y = s * (0.24 + r * 0.05);
          const x0 = r < 6 ? s * 0.52 : s * 0.08;
          ctx.fillStyle = "rgba(42,33,24,0.55)";
          ctx.fillRect(x0, y, (s * 0.92 - x0) * (0.7 + rnd() * 0.3), s * 0.014);
        }
      }, 512),
    [],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0, 0.026, 0]} receiveShadow>
      <planeGeometry args={[0.62, 0.62]} />
      <meshStandardMaterial map={tex} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------- balance scale ----------
/** angle > 0: left pan (−x) lower. `addKamu` 0..1 drops a weight into the right pan. */
export const Balance: React.FC<{ angle: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ angle, left, right }) => {
  const L = 0.62, hang = 0.42, postH = 1.05;
  const brass = { color: PAL.brass, metalness: 0.9, roughness: 0.28 } as const;
  const ends = [-1, 1].map((s) => [s * L * Math.cos(angle), postH + s * L * Math.sin(angle)] as const);
  return (
    <group>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.08, 48]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2B1F16" roughness={0.5} />
      </mesh>
      <mesh position={[0, postH / 2 + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, postH, 24]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      <mesh position={[0, postH + 0.07, 0]}>
        <sphereGeometry args={[0.045, 24, 16]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      <group position={[0, postH, 0]} rotation={[0, 0, angle]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[2 * L + 0.06, 0.035, 0.035]} radius={0.012} />
          <meshStandardMaterial {...brass} />
        </mesh>
      </group>
      {ends.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          {[0, 1, 2].map((k) => {
            const a = (k / 3) * Math.PI * 2;
            const dx = Math.cos(a) * 0.16, dz = Math.sin(a) * 0.16;
            const len = Math.hypot(dx, hang, dz);
            return (
              <mesh key={k} position={[dx / 2, -hang / 2, dz / 2]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-dx, hang, -dz).normalize())}>
                <cylinderGeometry args={[0.003, 0.003, len, 6]} />
                <meshStandardMaterial color="#8F7440" metalness={0.9} roughness={0.35} />
              </mesh>
            );
          })}
          <mesh position={[0, -hang, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.16, 0.03, 48]} />
            <meshStandardMaterial {...brass} />
          </mesh>
          <group position={[0, -hang + 0.015, 0]}>{i === 0 ? left : right}</group>
        </group>
      ))}
    </group>
  );
};

/** Brass weight block (cylinder with knob). */
export const Weight: React.FC = () => (
  <group>
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.07, 0.1, 32]} />
      <meshStandardMaterial color="#6E6A62" metalness={0.85} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.115, 0]}>
      <sphereGeometry args={[0.025, 16, 12]} />
      <meshStandardMaterial color="#6E6A62" metalness={0.85} roughness={0.35} />
    </mesh>
  </group>
);

// ---------- gantry (VBA) over the +x carriageway ----------
export const Gantry: React.FC<{ led: THREE.Texture; on: number }> = ({ led, on }) => {
  const z0 = RZ + MED - 0.02, z1 = RZ + ROAD_HALF + 0.03;
  const h = 0.3;
  const steel = { color: "#B5BABE", metalness: 0.85, roughness: 0.38 } as const;
  return (
    <group>
      {[z0, z1].map((z) => (
        <mesh key={z} position={[0, RY + h / 2, z]} castShadow>
          <boxGeometry args={[0.02, h, 0.02]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {[h - 0.01, h - 0.05].map((y) => (
        <mesh key={y} position={[0, RY + y, (z0 + z1) / 2]} castShadow>
          <boxGeometry args={[0.016, 0.014, z1 - z0 + 0.03]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-0.014, RY + h - 0.03, laneP(i)]}>
          <mesh>
            <boxGeometry args={[0.012, 0.09, 0.09]} />
            <meshStandardMaterial color="#111" roughness={0.6} />
          </mesh>
          <mesh position={[-0.0065, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.082, 0.082]} />
            <meshStandardMaterial color="#000" emissive="#FFFFFF" emissiveMap={led} emissiveIntensity={on * 2.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Flat tactical arrow lying on the ground (HISTORYMAP pincer arrow), drawn from tail to `p` (0..1). */
export const FlatArrow: React.FC<{ length: number; width: number; color: string; p: number; opacity?: number }> = ({ length, width, color, p, opacity = 1 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const head = width * 2.4, hl = width * 2.6;
    s.moveTo(0, -width / 2);
    s.lineTo(length - hl, -width / 2);
    s.lineTo(length - hl, -head / 2);
    s.lineTo(length, 0);
    s.lineTo(length - hl, head / 2);
    s.lineTo(length - hl, width / 2);
    s.lineTo(0, width / 2);
    s.closePath();
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [length, width]);
  if (p <= 0) return null;
  return (
    <mesh geometry={geo} scale={[Math.max(0.001, p), 1, 1]}>
      <meshBasicMaterial color={color} transparent opacity={0.92 * opacity} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};
