// EP75 scenes S1–S11. Positions match the camera keys in timeline.ts. t = film seconds, f = 60 fps clock.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { stoneGrain } from "./materials.ts";
import { mulberry32 } from "../kits/feltcraft/core/motion";
import { C, st, pop, ramp, lerp, sm, Cave, RockWall, Surface, Stalagmites, Boulders, Jungle, Plant, Smoke, Mist, SunShaft, Caver, SignBoard, Crate, MeasureBar, Leaves, caveMat, flowStone, dolineOpening, type Doline } from "./parts.tsx";
import type { SceneId, V3 } from "./timeline.ts";

type SP = { t: number; f: number };

// ---------------- S1: cutaway — jungle on top, a city block inside the cave ----------------
const S1_DOL: Doline = { z: -20, len: 6, gap: 1.2 };
export const S1: React.FC<SP> = ({ t }) => {
  const [hx, hz] = dolineOpening(5, S1_DOL);
  return (
    <group>
      <Cave R={5} z0={2} z1={-46} seed={1} doline={S1_DOL} surfaceY={9.5} />
      <RockWall z={2} w={56} y0={-16} y1={9.5} hole={{ cy: 2.75, r: 4.3, floorY: 0.15 }} strata />
      <Surface y={9.5} x0={-28} x1={28} z0={2} z1={-60} holes={[[0, -20, Math.max(hx, hz)]]} color="#55703A" />
      <Jungle seed={11} n={30} x={[-15, 15]} z={[-14, 1.2]} y={9.5} avoid={(x, z) => x * x + (z + 20) ** 2 < 18} />
      <Jungle seed={13} n={16} x={[-16, 16]} z={[-40, -15]} y={9.5} avoid={(x, z) => x * x + (z + 20) ** 2 < 18} />
      {/* skyscrapers that fit inside the passage */}
      {(
        [
          ["art-deco-setback-tower-b3a788", [-2.4, 0, -7.5], 6.2, 2.6],
          ["office-tower-1538cc", [2.5, 0, -10], 5.4, 2.85],
          ["monolith-office-tower-422420", [-2.6, 0, -13.2], 5.6, 3.1],
        ] as [string, V3, number, number][]
      ).map(([id, p, size, at], i) => (
        <group key={i} position={p} scale={[1, pop(t, at, 0.6), 1]}>
          <AssetModel id={id} assetType="building" size={size} ground tint={["#C9BFAE", "#9FB0BC", "#8C96A0"][i]} roughness={0.6} />
        </group>
      ))}
      <Stalagmites seed={14} n={14} x={[-4, 4]} z={[-3, -40]} ceiling={7.4} avoid={1.4} />
      <Boulders seed={15} n={6} x={[-3.8, 3.8]} z={[-4, -30]} avoid={1.2} />
      <Jungle seed={12} n={9} x={[-3, 3]} z={[-23, -17]} scale={0.75} kinds={[0, 1, 2, 4]} />
      <SunShaft top={[0, 11, -20]} floor={[0, 0, -20.4]} rTop={3} rBottom={3.4} intensity={1400} />
      <pointLight position={[0, 5, -6]} intensity={45} distance={22} decay={1.5} color="#FFD9A8" />
      <pointLight position={[0, 4.5, -14]} intensity={30} distance={18} decay={1.5} color="#FFE3B8" />
    </group>
  );
};

// ---------------- S2/S3: cliff, dark mouth, Ho Khanh ----------------
const MOUTH_LANE = (x: number, z: number) => (Math.abs(x) < 2.8 && z < 6) || (x > 1.2 && z > 4.2) || (x < -1.4 && x > -4.4 && z > 1.8);
const MouthSet: React.FC<SP & { mode: "S2" | "S3" }> = ({ t, f, mode }) => {
  // Ho Khanh: S2 walks in, points, steps back from the wind. S3 leaves, is gone, returns with two cavers.
  let hk: { p: V3; h: number; pose: "walk" | "point" | "stand" } | null = null;
  let followers = 0;
  if (mode === "S2") {
    if (t < 13) hk = { p: [0.3, 0, lerp(3.5, -1.6, ramp(t, 9.3, 12.9))], h: Math.PI, pose: "walk" };
    else if (t < 15.3) hk = { p: [0.3, 0, -1.6], h: Math.PI, pose: "point" };
    else hk = { p: [0.3, 0, lerp(-1.6, 0.9, ramp(t, 15.3, 17.4))], h: Math.PI, pose: "walk" };
  } else {
    if (t < 19.6) hk = { p: [0.3, 0, lerp(-1.2, 6, ramp(t, 17.6, 19.6))], h: 0, pose: "walk" };
    else if (t >= 21.6) {
      hk = { p: [0.3, 0, lerp(6.5, 0.4, ramp(t, 21.6, 23.7))], h: Math.PI, pose: "walk" };
      followers = 1;
    }
  }
  const grow = mode === "S3" ? lerp(0.25, 1.25, sm(ramp(t, 18.6, 20.6))) : 0;
  const gust = mode === "S2" ? (t < 15.0 ? 0.25 : 1) : 0.15;
  return (
    <group>
      <Surface y={0} x0={-24} x1={24} z0={20} z1={-4} color="#56663A" />
      <RockWall z={-4} w={34} y0={-0.5} y1={14} hole={{ cy: 0.99, r: 1.55, floorY: 0.08 }} color="#A9A190" />
      <Cave R={1.8} z0={-3.9} z1={-14} seed={2} color="#8E8676" />
      <mesh position={[0, 1.2, -6.8]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial color="#050505" fog={false} />
      </mesh>
      {/* moss + ferns hanging on the cliff face */}
      <Jungle seed={24} n={10} x={[-12, 12]} z={[-3.9, -3.6]} y={0} scale={0.8} kinds={[4, 2]} avoid={(x) => Math.abs(x) < 2.3} />
      <Jungle seed={21} n={34} x={[-12, 12]} z={[-3.4, 9]} avoid={MOUTH_LANE} />
      <Boulders seed={22} n={7} x={[-8, 8]} z={[-3.6, -2.4]} size={[0.6, 1.4]} avoid={2.0} />
      <AssetModel id="rock-cave-ledge-2a9532" assetType="terrain" size={2.2} ground position={[-2.9, 0, -3.3]} tint="#9C9483" grain="stone" grainTiles={3} />
      <SignBoard text="AUDIRA · FAKTA DUNIA" position={[2.5, 0, -1.6]} rotation={-0.5} w={1.6} />
      {/* S3: the jungle swallows the mouth */}
      {mode === "S3"
        ? (
            [
              [4, [-1.2, 0, -3.3], 1.4],
              [3, [0.9, 0, -3.5], 2.6],
              [4, [0.2, 0, -3.0], 1.3],
              [2, [-0.6, 0, -3.6], 1.8],
              [4, [1.5, 0, -2.9], 1.1],
              [1, [-1.8, 0, -3.2], 2.4],
            ] as [number, V3, number][]
          ).map(([k, p, s], i) => <Plant key={i} kind={k} position={p} size={s} rot={i * 1.3} s={grow * (0.85 + (i % 3) * 0.1)} />)
        : null}
      <Mist t={t} origin={[0, 0.9, -4.3]} dir={[0, 0.06, 1]} dist={4.5} n={12} size={1.1} spread={[1.6, 0.8, 0.4]} opacity={0.45} strength={gust} speed={0.45} seed={5} />
      {mode === "S2" ? <Leaves t={t} origin={[0, 0.4, -3.8]} dir={[0, 0.12, 1]} strength={ramp(t, 15.2, 15.6)} /> : null}
      {hk ? <Caver f={f} seed={7} pose={hk.pose} position={hk.p} heading={hk.h} scale={0.95} outfit="casual" pack="#6E5A3C" helmet={false} /> : null}
      {followers
        ? [1.2, 2.3].map((dz, i) => <Caver key={i} f={f + 30 * i} seed={40 + i} pose="walk" position={[0.3 + (i ? -0.5 : 0.5), 0, lerp(6.5, 0.4, ramp(t, 21.6, 23.7)) + dz]} heading={Math.PI} scale={0.6} />)
        : null}
    </group>
  );
};
export const S2: React.FC<SP> = (p) => <MouthSet {...p} mode="S2" />;
export const S3: React.FC<SP> = (p) => <MouthSet {...p} mode="S3" />;

// ---------------- S4: dark passage, the 2009 expedition ----------------
export const S4: React.FC<SP> = ({ t, f }) => {
  const walk = (i: number) => lerp(3.2 + i * 0.9, -2.2 + i * 0.9, ramp(t, 23.7, 33.4));
  const rapY = lerp(4.6, 1.75, sm(ramp(t, 23.9, 27.6)));
  return (
    <group>
      <Cave R={4} z0={9} z1={-42} seed={4} color="#8A8272" />
      <Stalagmites seed={41} n={22} x={[-3.2, 3.2]} z={[-2, -34]} ceiling={6.1} avoid={1.0} />
      <Boulders seed={42} n={7} x={[-3.3, 3.3]} z={[-3, -24]} avoid={1.3} />
      <AssetModel id="basalt-boulder-a1929c" assetType="prop" size={2.6} ground position={[-1.7, 0, -5.6]} tint="#8E8676" grain="stone" grainTiles={3} />
      <AssetModel id="ruined-lair-wall-176561" assetType="terrain" size={4} ground position={[2.4, 0, -11]} rotation={[0, -1.2, 0]} tint="#7E7668" grain="stone" grainTiles={3} />
      {/* rope from the roof, a caver descending */}
      <mesh position={[-1.25, 4.0, -5.1]}>
        <cylinderGeometry args={[0.018, 0.018, 4.4, 8]} />
        <meshStandardMaterial color="#D84A2A" roughness={0.7} />
      </mesh>
      <Caver f={f} seed={30} pose="lean" position={[-1.25, rapY, -4.95]} heading={0.2} scale={0.55} light={3} />
      {[0, 1, 2, 3].map((i) => (
        <Caver key={i} f={f + i * 23} seed={31 + i} pose={i === 0 && t > 29.3 ? "point" : "walk"} position={[i % 2 ? -0.55 : 0.55, 0, i === 0 && t > 29.3 ? walk(0) : walk(i)]} heading={Math.PI} scale={0.58} light={i < 2 ? 3.5 : 0} pack={["#B5452B", "#2F5E8C", "#C98A2B", "#4E7A3A"][i]} />
      ))}
      <Crate text="AUDIRA EXPEDITION" position={[1.5, 0, 1.2]} rotation={-0.5} size={0.75} />
      <AssetModel id="haul-rope-span-6ad505" assetType="prop" size={1.2} ground position={[1.3, 0.45, 1.3]} rotation={[0, 0.4, 0]} tint="#C8452B" />
      {/* survey laser down the passage */}
      <MeasureBar a={[0.75, 0.95, walk(0) - 0.2]} b={[0.2, 1.5, -34]} u={sm(ramp(t, 29.4, 30.8))} color="#FF4A3A" r={0.018} />
      <pointLight position={[0, 3, -20]} intensity={30} distance={26} decay={1.5} color="#7FA0C8" />
      <pointLight position={[0.4, 3.2, 2.5]} intensity={22} distance={14} decay={1.5} color="#FFD9A0" />
    </group>
  );
};

// ---------------- S5: the giant passage ----------------
const S5_DOL: Doline = { z: -62, len: 14, gap: 1.4 };
export const S5: React.FC<SP> = ({ t, f }) => {
  const plane = ramp(t, 39.6, 43.0);
  return (
    <group>
      <Cave R={9} z0={16} z1={-100} seed={5} doline={S5_DOL} surfaceY={16} color="#A29A88" repeat={10} />
      <SunShaft top={[0, 17, -62]} floor={[0, 0, -63]} rTop={5} rBottom={6} intensity={5000} />
      <Jungle seed={51} n={14} x={[-6, 6]} z={[-70, -55]} scale={1.3} />
      <group scale={[1, pop(t, 33.6, 0.6), 1]}>
        <AssetModel id="art-deco-setback-tower-b3a788" assetType="building" size={10} ground position={[-4.6, 0, -20]} tint="#C9BFAE" roughness={0.6} />
        <AssetModel id="office-tower-1538cc" assetType="building" size={9} ground position={[5.0, 0, -30]} tint="#9FB0BC" roughness={0.6} />
      </group>
      <Stalagmites seed={52} n={22} x={[-7, 7]} z={[2, -50]} h={[0.8, 3]} ceiling={13} avoid={2.2} />
      <Boulders seed={53} n={10} x={[-7, 7]} z={[0, -45]} size={[1, 2.6]} avoid={2.4} />
      <Caver f={f} seed={55} pose="point" position={[0.9, 0, 4.2]} heading={Math.PI} scale={0.32} light={1.5} />
      <Caver f={f + 20} seed={56} pose="stand" position={[1.5, 0, 3.8]} heading={Math.PI - 0.3} scale={0.32} light={0} pack="#2F5E8C" />
      {/* kinetic survey lines: length, height, width */}
      <MeasureBar a={[0, 0.12, 9]} b={[0, 0.12, -80]} u={sm(ramp(t, 34.5, 35.7))} r={0.06} />
      <MeasureBar a={[-1.2, 0.1, -14]} b={[-1.2, 13.4, -14]} u={sm(ramp(t, 36.4, 37.3))} color="#FF7A45" r={0.08} />
      <MeasureBar a={[-8.6, 5, -14]} b={[8.6, 5, -14]} u={sm(ramp(t, 37.9, 38.8))} color="#6FA8FF" r={0.08} />
      {plane > 0 && plane < 1 ? (
        <group position={[0.6, 7.0 - plane * 0.8, lerp(-62, 22, plane)]} rotation={[0, 0, 0.08]}>
          <AssetModel id="widebody-airliner-ae0a5a" assetType="vehicle" size={11} tint="#EDEFF2" roughness={0.35} metalness={0.3} />
        </group>
      ) : null}
      <pointLight position={[0, 6, -6]} intensity={60} distance={40} decay={1.4} color="#FFE6C4" />
    </group>
  );
};

// ---------------- S6/S7: doline, forest underground, clouds ----------------
const S6_DOL: Doline = { z: -16, len: 11, gap: 1.5 };
const DolineSet: React.FC<SP & { mode: "S6" | "S7" | "S10" }> = ({ t, f, mode }) => {
  const [hx, hz] = dolineOpening(8, S6_DOL);
  const hr = Math.max(hx, hz);
  return (
    <group>
      <Cave R={8} z0={14} z1={-58} seed={mode === "S10" ? 10 : 6} doline={S6_DOL} surfaceY={15} color="#A0988A" repeat={10} />
      <Surface y={15} x0={-30} x1={30} z0={14} z1={-58} holes={[[0, -16, hr]]} color="#4F6A33" />
      <Jungle seed={61} n={18} x={[-13, 13]} z={[-27, -5]} y={15} scale={1.2} avoid={(x, z) => x * x + (z + 16) ** 2 < (hr + 0.3) ** 2} />
      <Jungle seed={62} n={mode === "S10" ? 16 : 30} x={[-6.5, 6.5]} z={[-25, -11]} scale={1.25} avoid={(x, z) => mode === "S10" && z > -13 && Math.abs(x) < 3} />
      <Boulders seed={63} n={10} x={[-6.5, 6.5]} z={[-24, -11]} size={[0.8, 2.2]} />
      <Stalagmites seed={64} n={16} x={[-6.5, 6.5]} z={[10, -50]} h={[0.6, 2.4]} ceiling={12} avoid={3.5} />
      <SunShaft top={[0, 17, -16]} floor={[0.8, 0, -17]} rTop={5.6} rBottom={6.2} intensity={2800} />
      <Mist t={t} origin={[-6, 5, -16]} dir={[1, 0.12, 0]} dist={12} n={mode === "S7" ? 16 : 8} size={mode === "S7" ? 5.5 : 4} spread={[2, 3, 6]} opacity={mode === "S7" ? 0.38 : 0.22} speed={0.12} seed={66} />
      {mode === "S6" && t > 46.8 ? <Caver f={f} seed={67} pose="walk" position={[lerp(-1.6, 0.2, ramp(t, 46.8, 50.9)), 0, -11.6]} heading={Math.PI * 0.75} scale={0.6} /> : null}
      {mode === "S7" ? (
        <>
          <Caver f={f} seed={68} pose="stand" position={[-3.2, 0, -27]} heading={Math.PI} scale={0.55} light={2} />
          <Caver f={f + 30} seed={69} pose="point" position={[-2.5, 0, -27.6]} heading={Math.PI - 0.4} scale={0.55} light={0} pack="#2F5E8C" />
        </>
      ) : null}
      {mode === "S10" ? <Camp t={t} f={f} /> : null}
      <pointLight position={[0, 5, 2]} intensity={25} distance={26} decay={1.5} color="#FFE3B8" />
    </group>
  );
};
export const S6: React.FC<SP> = (p) => <DolineSet {...p} mode="S6" />;
export const S7: React.FC<SP> = (p) => <DolineSet {...p} mode="S7" />;

// ---------------- S8: Great Wall of Vietnam + cave pearls ----------------
const tierGeo = (i: number) => {
  const r = 8.6 - i * 0.12;
  const g = new THREE.CylinderGeometry(r, r * 1.03, 1.3, 96, 6, false, -Math.PI / 2, Math.PI);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k), y = p.getY(k), z = p.getZ(k);
    const th = Math.atan2(x, z);
    const d = 1 + 0.025 * Math.sin(th * 38 + i * 1.7) + 0.012 * Math.sin(th * 91 + y * 4) + (y < -0.4 ? 0.02 : 0);
    p.setXYZ(k, x * d, y, z * d * 0.34);
  }
  g.computeVertexNormals();
  return g;
};
const TIERS = Array.from({ length: 9 }, (_, i) => tierGeo(i));
const pearlTex = () => stoneGrain();
const flowMat = () => flowStone("#B49670", 6, 1);
let BALL: THREE.CanvasTexture | null = null;
const baseballTexture = () => {
  if (BALL) return BALL;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#F4F0E6";
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = "#C8322A";
  g.lineWidth = 5;
  for (const off of [0, 256]) {
    g.beginPath();
    for (let x = 0; x <= 256; x += 4) g.lineTo(off + x, 128 + Math.sin((x / 256) * Math.PI * 2) * 70);
    g.stroke();
    for (let x = 6; x < 256; x += 14) {
      const y = 128 + Math.sin((x / 256) * Math.PI * 2) * 70;
      g.beginPath();
      g.moveTo(off + x - 6, y - 8);
      g.lineTo(off + x + 6, y + 8);
      g.stroke();
    }
  }
  BALL = new THREE.CanvasTexture(c);
  BALL.colorSpace = THREE.SRGBColorSpace;
  return BALL;
};
export const S8: React.FC<SP> = ({ t, f }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  const pearls = useMemo(() => {
    const rnd = mulberry32(81);
    return Array.from({ length: 11 }, () => {
      const a = rnd() * 6.28, r = rnd() * 0.3;
      return { p: [-2.5 + Math.cos(a) * r, 0.05, 2 + Math.sin(a) * r] as V3, s: 0.035 + rnd() * 0.04 };
    });
  }, []);
  const climb = lerp(2.2, 5.6, sm(ramp(t, 56.8, 61.7)));
  return (
    <group>
      <Cave R={9} z0={14} z1={-13} seed={8} color="#958C7C" repeat={10} />
      {TIERS.map((g, i) => (
        <mesh key={i} geometry={g} material={flowMat()} position={[0, 0.65 + i * 1.22, -9.6 - i * 0.28]} castShadow receiveShadow />
      ))}
      <mesh position={[1.9, 6, -6.4]}>
        <cylinderGeometry args={[0.02, 0.02, 12, 8]} />
        <meshStandardMaterial color="#2F7FD8" roughness={0.7} />
      </mesh>
      <Caver f={f} seed={82} pose="lean" position={[1.9, climb, -6.15]} heading={Math.PI} scale={0.5} light={3} />
      <Caver f={f + 15} seed={83} pose="point" position={[-0.6, 0, -2.2]} heading={Math.PI + 0.2} scale={0.55} light={2.5} pack="#2F5E8C" />
      <Stalagmites seed={84} n={14} x={[-7, 7]} z={[6, -5]} h={[0.5, 2]} ceiling={13} avoid={3.5} />
      {/* cave-pearl pool */}
      <mesh position={[-2.5, 0.03, 2]} scale={[1, 0.55, 1]} material={caveMat("#D8CBB0", 1)} castShadow receiveShadow>
        <torusGeometry args={[0.45, 0.07, 12, 48]} />
      </mesh>
      <mesh position={[-2.5, 0.012, 2]} rotation={[-Math.PI / 2, 0, 0]} material={caveMat("#CDBF9F", 1)}>
        <circleGeometry args={[0.46, 40]} />
      </mesh>
      {pearls.map((p, i) => (
        <mesh key={i} position={[p.p[0], p.s, p.p[2]]} scale={p.s} castShadow>
          <sphereGeometry args={[1, 32, 20]} />
          <meshPhysicalMaterial color="#F3ECDD" map={pearlTex()} bumpMap={pearlTex()} bumpScale={0.6} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.3} sheen={0.5} sheenColor="#FFF6E0" />
        </mesh>
      ))}
      <mesh position={[-2.5, 0.055, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.43, 40]} />
        <meshPhysicalMaterial color="#9CC9C8" transparent opacity={0.35} roughness={0.04} clearcoat={1} depthWrite={false} />
      </mesh>
      <mesh position={[-2.62, 0.075, 2.42]} rotation={[0.4, 0.8, 0.2]} scale={0.075} castShadow>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial map={baseballTexture()} roughness={0.7} />
      </mesh>
      <AssetModel id="camping-lantern-21d14b" assetType="prop" size={0.22} ground position={[-1.7, 0, 2.6]} emissive="#FFB24A" emissiveIntensity={1.5} />
      <pointLight position={[-2.0, 0.55, 2.7]} intensity={3} distance={4} decay={1.5} color="#FFD6A0" />
      <primitive object={target} position={[0, 5, -8]} />
      <spotLight position={[0, 9, 7]} target={target} angle={0.7} penumbra={0.8} intensity={520} distance={40} decay={1.4} color="#FFE2B8" />
      <pointLight position={[0, 3, 2]} intensity={14} distance={16} decay={1.5} color="#FFE3B8" />
    </group>
  );
};

// ---------------- S9: cutaway — strata, underground river carves the void ----------------
let RIVER: THREE.CanvasTexture | null = null;
const riverTexture = () => {
  if (RIVER) return RIVER;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2F6E7C";
  g.fillRect(0, 0, 128, 256);
  const rnd = mulberry32(9);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = `rgba(210,240,245,${0.15 + rnd() * 0.3})`;
    g.fillRect(rnd() * 128, rnd() * 256, 2 + rnd() * 14, 1 + rnd() * 2);
  }
  RIVER = new THREE.CanvasTexture(c);
  RIVER.colorSpace = THREE.SRGBColorSpace;
  RIVER.wrapS = RIVER.wrapT = THREE.RepeatWrapping;
  RIVER.repeat.set(1, 8);
  return RIVER;
};
export const S9: React.FC<SP> = ({ t }) => {
  const s = Math.round(lerp(0.32, 1, sm(ramp(t, 65.2, 69.2))) * 40) / 40;
  const tex = riverTexture();
  tex.offset.y = -st(t) * 0.6;
  return (
    <group>
      <RockWall z={0} w={44} y0={-14} y1={12} hole={{ cy: 1.65 * s, r: 2.75 * s, floorY: 0.06 }} strata />
      <Surface y={-0.05} x0={-24} x1={24} z0={20} z1={0.05} color="#6A6052" />
      <group scale={[s, s, 1]}>
        <Cave R={3} z0={0.3} z1={-30} seed={9} color="#8A8272" />
        <mesh position={[0, 0.07, -15]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 30]} />
          <meshPhysicalMaterial map={tex} roughness={0.12} clearcoat={1} emissive="#1E5260" emissiveIntensity={0.35} />
        </mesh>
        <pointLight position={[0, 2.2, -4]} intensity={12} distance={14} decay={1.5} color="#BFE3F0" />
      </group>
      <Mist t={t} origin={[0, 0.4, 0.5]} dir={[0, 0.05, 1]} dist={3} n={6} size={1.2 * s} spread={[2 * s, 0.4, 0.4]} opacity={0.25} seed={91} />
      <Jungle seed={92} n={6} x={[-10, 10]} z={[1, 6]} scale={0.9} avoid={(x) => Math.abs(x) < 4} />
    </group>
  );
};

// ---------------- S10: camp under the skylight; cable car crossed out ----------------
const Camp: React.FC<SP> = ({ t, f }) => {
  const flick = 0.85 + 0.15 * Math.sin(Math.floor(t * 12) * 1.3);
  const chairX = lerp(-6, 1.5, ramp(t, 75.8, 77.9));
  const cross = pop(t, 76.6, 0.35);
  return (
    <group>
      <AssetModel id="canvas-ridge-tent-f0df0d" assetType="prop" size={1.7} ground position={[-2.4, 0, -3]} rotation={[0, 0.5, 0]} tint="#D9A441" />
      <AssetModel id="canvas-wall-tent-de8a04" assetType="prop" size={2.0} ground position={[2.6, 0, -4]} rotation={[0, -0.6, 0]} tint="#C9B48A" />
      <AssetModel id="canvas-ridge-tent-f0df0d" assetType="prop" size={1.5} ground position={[-0.6, 0, -6.4]} rotation={[0, 0.1, 0]} tint="#3F7FB5" />
      <AssetModel id="campfire-4390aa" assetType="prop" size={0.7} ground position={[0.3, 0, -1.6]} />
      <Smoke t={t} origin={[0.3, 0.35, -1.6]} seed={3} size={0.12} rise={1.6} />
      <pointLight position={[0.3, 0.6, -1.6]} intensity={6 * flick} distance={7} decay={1.5} color="#FF9A4A" />
      {(
        [
          [-1.2, -2.1],
          [1.6, -2.6],
          [-3.4, -4.6],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <AssetModel key={i} id="camping-lantern-21d14b" assetType="prop" size={0.3} ground position={[x, 0, z]} emissive="#FFB24A" emissiveIntensity={1.8} />
      ))}
      <pointLight position={[-2.2, 0.8, -3.6]} intensity={4} distance={6} decay={1.5} color="#FFD6A0" />
      {(
        [
          [-1.1, -0.9, 0.6, "stand"],
          [1.4, -0.7, -0.5, "stand"],
          [-0.6, -0.2, 0.1, "think"],
          [1.0, -2.3, -2.6, "walk"],
          [2.0, -1.4, -1.2, "stand"],
        ] as [number, number, number, "stand" | "walk" | "think"][]
      ).map(([x, z, h, pose], i) => (
        <Caver key={i} f={f + i * 17} seed={100 + i} pose={pose} position={[x, 0, z]} heading={h + Math.PI} scale={0.55} pack={["#B5452B", "#2F5E8C", "#C98A2B", "#4E7A3A", "#8C3F6E"][i]} />
      ))}
      <Caver f={f} seed={110} pose="point" position={[-0.4, 0, -3.2]} heading={0.3} scale={0.6} outfit="uniform" pack="#2F3820" />
      {/* the cable-car plan, crossed out */}
      {t > 75.8 ? (
        <group>
          <mesh position={[0, 8.6, -8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 20, 8]} />
            <meshStandardMaterial color="#2B2B2B" metalness={0.7} roughness={0.4} />
          </mesh>
          <group position={[chairX, 8.6, -8]}>
            <AssetModel id="chairlift-chair-2beb2b" assetType="vehicle" size={1.6} position={[0, -0.9, 0]} tint="#D8402A" />
          </group>
          <MeasureBar a={[chairX - 1.3, 6.6, -7.2]} b={[chairX + 1.3, 9.2, -7.2]} u={cross} color={C.red} r={0.09} />
          <MeasureBar a={[chairX - 1.3, 9.2, -7.2]} b={[chairX + 1.3, 6.6, -7.2]} u={cross} color={C.red} r={0.09} />
        </group>
      ) : null}
    </group>
  );
};
export const S10: React.FC<SP> = (p) => <DolineSet {...p} mode="S10" />;

// ---------------- S11: karst landscape from above ----------------
const peakGeo = (seed: number) => {
  const g = new THREE.CylinderGeometry(0.35, 1, 1, 28, 12, false);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const th = Math.atan2(x, z);
    const u = y + 0.5;
    const round = y > 0.49 ? 0.6 : 1;
    const k = (1 + 0.14 * Math.sin(th * 5 + seed + u * 4) + 0.08 * Math.sin(th * 11 - u * 7 + seed)) * (1 - 0.25 * u * u) * round;
    p.setXYZ(i, x * k, y + (y > 0.49 ? 0.12 : 0), z * k);
  }
  g.translate(0, 0.5, 0);
  g.computeVertexNormals();
  return g;
};
const PEAKS = [peakGeo(1), peakGeo(4), peakGeo(9)];
export const S11: React.FC<SP> = ({ t }) => {
  const holes: [number, number, number][] = [
    [-5.5, -9, 2.4],
    [7, -20, 3],
  ];
  const peaks = useMemo(() => {
    const rnd = mulberry32(111);
    const out: { p: V3; r: number; h: number; g: number }[] = [];
    let guard = 0;
    while (out.length < 26 && guard++ < 600) {
      const x = -34 + rnd() * 68, z = 6 - rnd() * 80;
      if (Math.abs(x) < 3.2 && z > -14) continue;
      if (holes.some(([hx, hz, hr]) => (x - hx) ** 2 + (z - hz) ** 2 < (hr + 4) ** 2)) continue;
      out.push({ p: [x, -0.2, z], r: 2.2 + rnd() * 2.6, h: 4 + rnd() * 7, g: Math.floor(rnd() * 3) });
    }
    return out;
  }, []);
  const pm = caveMat("#5E7444", 2);
  return (
    <group>
      <Surface y={0} x0={-80} x1={80} z0={40} z1={-110} holes={holes} color="#4F6A33" />
      {holes.map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, -2.5, 0]} material={caveMat("#7E7668", 2)}>
            <cylinderGeometry args={[r, r * 0.9, 5, 40, 1, true]} />
          </mesh>
          <mesh position={[0, -4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[r, 40]} />
            <meshBasicMaterial color="#0A0C08" fog={false} />
          </mesh>
          <Jungle seed={120 + i} n={10} x={[-r - 2.5, r + 2.5]} z={[-r - 2.5, r + 2.5]} scale={1.3} avoid={(px, pz) => px * px + pz * pz < (r + 0.4) ** 2} />
        </group>
      ))}
      {peaks.map((k, i) => (
        <mesh key={i} geometry={PEAKS[k.g]} material={pm} position={k.p} scale={[k.r, k.h, k.r * 0.9]} castShadow receiveShadow />
      ))}
      <Jungle seed={113} n={36} x={[-16, 16]} z={[-30, 8]} scale={1.4} avoid={(x, z) => (Math.abs(x) < 2.5 && z > -6) || holes.some(([hx, hz, hr]) => (x - hx) ** 2 + (z - hz) ** 2 < (hr + 0.6) ** 2)} />
      <Mist t={t} origin={[-20, 3, -18]} dir={[1, 0, 0]} dist={40} n={14} size={9} spread={[6, 2, 30]} opacity={0.3} speed={0.05} seed={114} />
      <Mist t={t} origin={[7, 1, -20]} dir={[0, 1, 0]} dist={6} n={6} size={2.5} spread={[2, 0.5, 2]} opacity={0.35} speed={0.2} seed={115} />
    </group>
  );
};

export const SCENES: Record<SceneId, React.FC<SP>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 };



