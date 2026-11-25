// EP69 scenes A–H (= S1–S8). Positions match the camera keys in timeline.ts. t = film seconds (VO clock).
import React from "react";
import * as THREE from "three";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { clamp01, mulberry32 } from "../kits/feltcraft/core/motion";
import { C, st, pop, texMat, flatMat, textTexture, SignBoard, Church, Organ, Trailers, Crowd, Lamp, Tree, TreeRow, Ground, Road, MineHill, Haze } from "./parts.tsx";
import type { SceneId, V3 } from "./timeline.ts";

type SP = { t: number };
const ease = (x: number) => x * x * (3 - 2 * x);
const win = (t: number, a: number, b: number) => ease(clamp01((st(t, 12) - a) / (b - a)));

/** Church riding on the two trailers, length along x. */
const ChurchRig: React.FC<{ t: number; x: number; lift?: number; turn?: number; trailerX?: number; ghost?: number; rolling?: boolean }> = ({ t, x, lift = 0, turn = 0, trailerX = 0, ghost = 0, rolling = true }) => (
  <group position={[x, 0, 0]} rotation={[0, Math.PI / 2 + turn, 0]}>
    <group position={[0, 0, trailerX]}>
      <Trailers t={t} rolling={rolling} />
    </group>
    <Church position={[0, 0.26 + lift, 0]} size={3.2} ghost={ghost} />
    {/* organ row faces world +z once the rig has turned 180° (rig yaw 3π/2 + π/2 = 2π) */}
    <group rotation={[0, Math.PI / 2, 0]}>
      <Organ s={ghost * 1.7} position={[0, 0.3 + lift, 0.1]} />
    </group>
  </group>
);

const HOUSES = ["gabled-farmhouse-c7534f", "log-cabin-4fac3b", "a-frame-cabin-6cb550"];
const House: React.FC<{ i: number; position: V3; rotation?: number; size?: number; tint?: string }> = ({ i, position, rotation = 0, size = 1.0, tint }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <AssetModel id={HOUSES[i % 3]} assetType="building" size={size} ground tint={tint} roughness={0.9} />
  </group>
);
/** Row of houses with a warm window light every other house. */
const HouseRow: React.FC<{ n: number; x: [number, number]; z: number; seed: number; size?: number; lights?: boolean }> = ({ n, x, z, seed, size = 1.0, lights }) => {
  const r = mulberry32(seed);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const px = x[0] + (i / Math.max(1, n - 1)) * (x[1] - x[0]);
        const pz = z + (r() - 0.5) * 0.6;
        return (
          <group key={i}>
            <House i={i + seed} position={[px, 0, pz]} rotation={(r() - 0.5) * 0.5} size={size * (0.85 + r() * 0.3)} />
            {lights && i % 2 === 0 ? <pointLight position={[px, size * 0.35, pz + size * 0.6]} intensity={0.8} distance={2.2} color={C.warm} /> : null}
          </group>
        );
      })}
    </>
  );
};

// ---------------- A / S1: the church rolling down the road ----------------
export const SceneA: React.FC<SP> = ({ t }) => {
  const x = -0.4 + st(t, 12) * 0.12;
  return (
    <group>
      <Ground color={C.apron} kind="cobble" />
      <Road x={[-14, 14]} w={3} />
      <ChurchRig t={t} x={x} />
      <Crowd t={t} n={24} x={[-4, 6]} z={[1.8, 2.7]} seed={3} flags={4} />
      <Crowd t={t} n={10} x={[-3, 5]} z={[-2.7, -2.1]} seed={8} />
      {[-3, 0, 3, 6].map((lx) => (
        <Lamp key={lx} position={[lx, 0, 1.65]} size={0.7} />
      ))}
      <Lamp position={[3.2, 0, 3.3]} size={1.0} light={1.2} />
      <Lamp position={[-2.2, 0, 3.4]} size={1.0} light={1.2} />
      <SignBoard text="AUDIRA" position={[-1.6, 0, -2.0]} w={1.2} h={0.36} posts={0.35} />
      <HouseRow n={6} x={[-7, 8]} z={-4.4} seed={2} size={1.2} />
      <TreeRow kind="birch" n={9} x={[-9, 10]} z={[-6.6, -5.6]} seed={5} size={[1.4, 2.0]} />
      <MineHill position={[-3, 0, -15]} scale={1.5} />
      <Haze color="#FFE2BE" position={[0, 1.5, -11]} w={40} h={6} opacity={0.45} />
    </group>
  );
};

// ---------------- B / S2: map of Scandinavia, then the snowy town ----------------
// lon 4..32 E, lat 54..71 N → canvas 0..1
const P = (lon: number, lat: number): [number, number] => [(lon - 4) / 28, (71 - lat) / 17];
const LAND: [number, number][] = [
  [5, 58.5], [5, 60], [5, 62], [7, 63], [10, 64], [12, 66], [14, 68], [16, 69], [19, 70], [23, 70.8], [28, 71], [31, 70.3], [30, 69.5], [29, 68], [30, 66], [29.5, 64], [31, 63], [29, 61.5], [27, 60.5], [24, 60], [22.5, 60.2], [21.5, 61.5], [21.5, 63], [23, 64], [25, 65], [24, 65.8], [22, 65.6], [21, 64.5], [19, 63.5], [17.5, 62.5], [17.2, 61], [18.5, 60], [19, 59.5], [18, 59], [16.5, 57], [16, 56], [14, 55.4], [12.8, 55.6], [12.6, 56.5], [11.8, 58], [11, 59], [10.5, 59.2], [9.5, 59], [8, 58.1], [6.5, 58],
];
const BORDERS: [number, number][][] = [
  [[11.4, 59.0], [12, 59.8], [12.2, 61], [12.2, 63.5], [14.3, 65.2], [16, 67.5], [18.5, 68.5], [20.5, 69.05]],
  [[20.5, 69.05], [23.5, 67.8], [24, 65.8]],
];
let MAP: THREE.CanvasTexture | null = null;
const mapTexture = () => {
  if (MAP) return MAP;
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5C86A8";
  g.fillRect(0, 0, S, S);
  // sea grid
  g.strokeStyle = "rgba(255,255,255,0.08)";
  g.lineWidth = 2;
  for (let i = 0; i < S; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke();
  }
  g.beginPath();
  LAND.forEach(([lo, la], i) => {
    const [x, y] = P(lo, la);
    i ? g.lineTo(x * S, y * S) : g.moveTo(x * S, y * S);
  });
  g.closePath();
  g.fillStyle = "#E9E1CC";
  g.fill();
  g.strokeStyle = "#7A6A50";
  g.lineWidth = 5;
  g.stroke();
  // Denmark
  g.beginPath();
  [[8.1, 57.1], [10.6, 57.7], [10.9, 56.3], [12.5, 55.7], [10.5, 54.8], [8.6, 54.9]].forEach(([lo, la], i) => {
    const [x, y] = P(lo, la);
    i ? g.lineTo(x * S, y * S) : g.moveTo(x * S, y * S);
  });
  g.closePath();
  g.fillStyle = "#DCD3BD";
  g.fill();
  g.stroke();
  g.setLineDash([14, 10]);
  g.strokeStyle = "#9A7A5A";
  g.lineWidth = 4;
  for (const b of BORDERS) {
    g.beginPath();
    b.forEach(([lo, la], i) => {
      const [x, y] = P(lo, la);
      i ? g.lineTo(x * S, y * S) : g.moveTo(x * S, y * S);
    });
    g.stroke();
  }
  // Arctic Circle 66.56 N
  const ay = P(0, 66.56)[1] * S;
  g.setLineDash([26, 16]);
  g.strokeStyle = "#E8B14A";
  g.lineWidth = 9;
  g.beginPath(); g.moveTo(0, ay); g.lineTo(S, ay); g.stroke();
  g.setLineDash([]);
  g.fillStyle = "#3A2A1C";
  g.font = "800 40px 'Segoe UI', Arial";
  g.textAlign = "center";
  const lab = (txt: string, lo: number, la: number) => {
    const [x, y] = P(lo, la);
    g.fillText(txt, x * S, y * S);
  };
  lab("NORWEGIA", 9.5, 61.5);
  lab("SWEDIA", 15.2, 62.6);
  lab("FINLANDIA", 26.6, 62.8);
  g.fillStyle = "#B8862E";
  g.font = "800 34px 'Segoe UI', Arial";
  g.fillText("LINGKAR ARKTIK", S * 0.27, ay - 16);
  MAP = new THREE.CanvasTexture(c);
  MAP.colorSpace = THREE.SRGBColorSpace;
  MAP.anisotropy = 8;
  return MAP;
};
const MAP_W = 4.2;
const MAP_Z = -0.4;
const mapPos = (lon: number, lat: number): V3 => {
  const [u, v] = P(lon, lat);
  return [(u - 0.5) * MAP_W, 0.06, (v - 0.5) * MAP_W + MAP_Z];
};

export const SceneB: React.FC<SP> = ({ t }) => {
  const kir = mapPos(20.2, 67.85);
  const arc = mapPos(20.2, 66.56);
  const pinS = pop(t, 8.1);
  const gauge = win(t, 9.8, 11.2);
  return (
    <group>
      {/* map table */}
      <mesh position={[0, -0.16, MAP_Z]} receiveShadow castShadow material={texMat("#7A5236", "plank", [3, 2])}>
        <boxGeometry args={[6.6, 0.3, 5.4]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, MAP_Z]} receiveShadow>
        <planeGeometry args={[MAP_W, MAP_W]} />
        <meshStandardMaterial map={mapTexture()} roughness={0.85} />
      </mesh>
      {/* Kiruna pin */}
      <group position={kir} scale={pinS}>
        <mesh position={[0, 0.22, 0]} castShadow material={flatMat("#3A2A1C")}>
          <cylinderGeometry args={[0.012, 0.012, 0.44, 8]} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#D23A2A" emissive="#D23A2A" emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0.36, 0.62, 0]} rotation={[-0.6, 0, 0]}>
          <planeGeometry args={[0.6, 0.18]} />
          <meshBasicMaterial map={textTexture("KIRUNA", { w: 512, h: 154 })} toneMapped={false} />
        </mesh>
      </group>
      {/* 145 km gauge from the Arctic Circle up to Kiruna */}
      {gauge > 0 ? (
        <mesh position={[arc[0] - 0.12, 0.03, arc[2] + ((kir[2] - arc[2]) * gauge) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, Math.abs(kir[2] - arc[2]) * gauge]} />
          <meshBasicMaterial color={[2.4, 1.7, 0.6]} toneMapped={false} />
        </mesh>
      ) : null}
      {/* little houses + spruces dotted around the table edge (diorama) */}
      <TreeRow kind="spruce" n={6} x={[-3, 3]} z={[1.6, 2.0]} seed={9} size={[0.5, 0.7]} />
      {/* ---- snowy Kiruna at x = 30 ---- */}
      <group position={[30, 0, 0]}>
        <Ground color={C.snow} kind="cobble" size={[30, 30]} repeat={[30, 30]} />
        <Road x={[-8, 8]} z={1.6} w={1.4} />
        <HouseRow n={5} x={[-3.4, 3.4]} z={-0.4} seed={4} size={1.1} lights />
        <HouseRow n={6} x={[-5, 5]} z={-2.6} seed={7} size={1.2} lights />
        <TreeRow kind="spruce" n={10} x={[-7, 7]} z={[-4.6, -3.6]} seed={6} size={[0.9, 1.5]} />
        <Tree kind="spruce" position={[1.6, 0, 2.8]} size={1.1} />
        <Lamp position={[-0.8, 0, 2.5]} size={0.8} light={1.4} />
        <Lamp position={[1.9, 0, 2.4]} size={0.8} light={1.4} />
        <Crowd t={t} n={6} x={[-1.5, 1.5]} z={[1.3, 1.9]} seed={12} walk />
        <MineHill position={[-2, 0, -11]} scale={1.3} snow />
        <Haze color="#F6C4A6" position={[0, 1.2, -8]} w={30} h={5} opacity={0.55} />
      </group>
    </group>
  );
};

// ---------------- C / S3: cross-section — the town on top of the mine ----------------
const X0 = -2.3, X1 = 2.3, SHAFT: [number, number] = [1.15, 1.55];
const GAPS: [number, number][] = [[-1.65, -1.15], [-3.4, -2.85], [-5.3, -4.65]];
const SLABS: [number, number][] = [[-1.15, 0], [-2.85, -1.65], [-4.65, -3.4], [-6.6, -5.3]];
export const SceneC: React.FC<SP> = ({ t }) => {
  const meter = win(t, 22.6, 25.6);
  const markY = -0.1 + (GAPS[2][0] + 0.1) * meter;
  const crack = win(t, 26.5, 28.5);
  const shove = win(t, 30.4, 33.0) * 0.5;
  const cage = -0.4 - (Math.sin(st(t, 12) * 0.9) * 0.5 + 0.5) * 4.6;
  return (
    <group>
      {/* back block: rock above, dark ore below */}
      <mesh position={[0, -3.3, -1.7]} receiveShadow material={texMat("#4F4944", "ashlar", [4, 6])}>
        <boxGeometry args={[X1 - X0, 6.6, 1.6]} />
      </mesh>
      <mesh position={[0.4, -4.2, -0.88]} rotation={[0, 0, -0.35]} material={texMat(C.ore, "ashlar", [3, 2], 0.45)}>
        <planeGeometry args={[3.0, 2.4]} />
      </mesh>
      {/* front slabs with tunnel gaps and the shaft */}
      {SLABS.map(([y0, y1], i) =>
        [[X0, SHAFT[0]], [SHAFT[1], X1]].map(([a, b], j) => (
          <mesh key={`${i}${j}`} position={[(a + b) / 2, (y0 + y1) / 2, -0.45]} castShadow receiveShadow material={texMat(i === 0 ? "#7D6650" : "#6B625A", i === 0 ? "plank" : "ashlar", [2, 2])}>
            <boxGeometry args={[b - a, y1 - y0, 0.9]} />
          </mesh>
        )),
      )}
      {/* shaft back wall + cage */}
      <mesh position={[(SHAFT[0] + SHAFT[1]) / 2, -2.65, -0.85]} material={flatMat("#2C2826")}>
        <boxGeometry args={[SHAFT[1] - SHAFT[0], 5.3, 0.1]} />
      </mesh>
      <mesh position={[(SHAFT[0] + SHAFT[1]) / 2, cage, -0.4]} castShadow material={texMat(C.trailer, "plank", [1, 1], 0.6)}>
        <boxGeometry args={[0.34, 0.36, 0.4]} />
      </mesh>
      {/* tunnel contents */}
      {GAPS.map(([y0, y1], i) => (
        <group key={i} position={[0, y0, -0.4]}>
          <pointLight position={[-0.6, (y1 - y0) * 0.8, 0.3]} intensity={1.2} distance={2.6} color={C.warm} />
          <pointLight position={[0.6 - i * 0.5, (y1 - y0) * 0.8, 0.3]} intensity={0.9} distance={2.2} color={C.warm} />
          {[-1.7, -0.9, -0.1].map((rx) => (
            <group key={rx} position={[rx, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <AssetModel id="mine-rail-track-9532dd" assetType="prop" size={0.8} ground />
            </group>
          ))}
          {i < 2 ? (
            <group position={[-1.3 + ((st(t, 12) * 0.25 + i * 0.6) % 1.6), 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
              <AssetModel id="mine-cart-21d7f0" assetType="vehicle" size={0.38} ground />
            </group>
          ) : (
            <>
              <group position={[-1.2, 0, -0.1]} rotation={[0, Math.PI / 2, 0]}>
                <AssetModel id="articulated-dump-truck-ee50f3" assetType="vehicle" size={0.85} ground />
              </group>
              <group position={[-0.1, 0, 0]}>
                <AssetModel id="core-drill-rig-3b355e" assetType="prop" size={0.5} ground />
              </group>
            </>
          )}
          <group position={[0.65, 0, -0.15]}>
            <AssetModel id="iron-ore-deposit-577b67" assetType="prop" size={0.5} ground />
          </group>
        </group>
      ))}
      {/* depth gauge on the left edge */}
      <mesh position={[X0 - 0.12, -2.6, 0.02]} material={flatMat("#E9DFC8")}>
        <boxGeometry args={[0.08, 5.4, 0.04]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[X0 - 0.06, -i * 0.46, 0.05]} material={flatMat("#2A2420")}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
        </mesh>
      ))}
      <mesh position={[X0 - 0.12, markY, 0.08]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.2, 3]} />
        <meshBasicMaterial color={[2.6, 0.7, 0.4]} toneMapped={false} />
      </mesh>
      {/* the town on top */}
      <mesh position={[0, 0.005, -0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={texMat(C.snow, "cobble", [3, 2])}>
        <planeGeometry args={[X1 - X0, 1.8]} />
      </mesh>
      <group position={[shove, 0, 0]}>
        {[-1.8, -0.9, 0.0].map((hx, i) => (
          <House key={hx} i={i} position={[hx, 0, -0.5 - (i % 2) * 0.5]} size={0.62} />
        ))}
        <Tree kind="spruce" position={[0.7, 0, -1.4]} size={0.6} />
        <Tree kind="spruce" position={[-2.1, 0, -1.5]} size={0.5} />
      </group>
      <group position={[(SHAFT[0] + SHAFT[1]) / 2, 0, -0.5]}>
        <AssetModel id="mine-headframe-735cf4" assetType="building" size={1.4} ground tint="#3E3A3A" />
      </group>
      {/* surface cracks under the town */}
      {crack > 0
        ? [-1.6, -0.7, 0.3].map((cx, i) => (
            <mesh key={cx} position={[cx, 0.012, -0.12 - i * 0.05]} rotation={[-Math.PI / 2, 0, 0.4 - i * 0.5]}>
              <planeGeometry args={[0.7 * crack, 0.03]} />
              <meshBasicMaterial color="#1A1210" />
            </mesh>
          ))
        : null}
      <Lamp position={[-1.0, 0, -0.1]} size={0.5} light={0.8} />
    </group>
  );
};

// ---------------- D / S4: the town centre shifts ±3 km east ----------------
export const SceneD: React.FC<SP> = ({ t }) => {
  const grow = win(t, 36.0, 37.6);
  const lift = win(t, 33.6, 35.4);
  const ride = win(t, 35.6, 39.8);
  return (
    <group>
      <Ground color={C.snow} kind="cobble" size={[40, 40]} repeat={[44, 44]} />
      <Road x={[-9, 9]} z={1.9} w={1.0} />
      {/* old centre (west) */}
      <HouseRow n={4} x={[-4.4, -2.0]} z={-0.2} seed={11} size={0.9} />
      <HouseRow n={3} x={[-4.0, -2.4]} z={-1.6} seed={13} size={0.9} />
      <SignBoard text="PUSAT LAMA" position={[-3.2, 0, 0.9]} w={1.5} h={0.38} posts={0.4} bg="#3A2A22" border="#B8A890" />
      {/* new centre (east) */}
      <group scale={0.6 + 0.4 * win(t, 37.8, 39.0)}>
        <HouseRow n={4} x={[3.4, 6.6]} z={-0.4} seed={21} size={1.0} lights />
        <HouseRow n={3} x={[3.8, 6.0]} z={-1.8} seed={23} size={1.0} lights />
      </group>
      <SignBoard text="PUSAT BARU" position={[3.4, 0, 0.9]} w={1.5} h={0.38} posts={0.4} bg="#1F3A5A" />
      {/* golden arrow west → east */}
      {grow > 0 ? (
        <group position={[-2.0, 0.08, 0.9]}>
          <mesh position={[(4.4 * grow) / 2, 0, 0]}>
            <boxGeometry args={[4.4 * grow, 0.06, 0.22]} />
            <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[4.4 * grow + 0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.28, 0.4, 3]} />
            <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ) : null}
      {/* crane lifts a house; the house rides a trailer east */}
      <group position={[-4.6, 0, -2.8]} rotation={[0, Math.PI / 2, 0]}>
        <AssetModel id="mobile-crane-671d3f" assetType="vehicle" size={2.2} ground />
      </group>
      <group position={[-1.6 + ride * 4.4, 0, 2.6]}>
        <group rotation={[0, Math.PI / 2, 0]} scale={0.45}>
          <Trailers t={t} length={2.4} />
        </group>
        <House i={0} position={[0, 0.12 + (1 - ride > 0.98 ? lift * 0.6 : 0), 0]} size={0.8} />
      </group>
      <TreeRow kind="spruce" n={10} x={[-9, 9]} z={[-4.6, -3.6]} seed={14} size={[0.9, 1.4]} />
      <MineHill position={[-9, 0, -4]} scale={1.0} snow />
    </group>
  );
};

// ---------------- E / S5: the 1912 church at its old site ----------------
export const SceneE: React.FC<SP> = ({ t }) => (
  <group>
    <Ground color={C.grass} kind="cobble" repeat={[30, 30]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 2.4]} receiveShadow material={texMat(C.apron, "cobble", [3, 2])}>
      <planeGeometry args={[3.4, 2.4]} />
    </mesh>
    <ChurchRig t={t} x={0} turn={-Math.PI / 2} rolling={false} />
    <SignBoard text="1912" position={[1.6, 0, 2.2]} rotation={-0.35} w={0.8} h={0.32} posts={0.32} />
    <Crowd t={t} n={10} x={[-1.6, 1.0]} z={[2.2, 3.2]} seed={21} lookUp />
    <Lamp position={[-1.9, 0, 2.6]} size={0.8} light={1.0} />
    <Lamp position={[2.6, 0, 3.2]} size={1.0} light={1.2} />
    <TreeRow kind="birch" n={7} x={[-5, 5]} z={[-3.6, -2.8]} seed={31} size={[1.5, 2.2]} />
    <Tree kind="birch" position={[-2.8, 0, 0.6]} size={1.8} />
    <Tree kind="birch" position={[3.0, 0, 0.2]} size={1.6} />
    <HouseRow n={5} x={[-7, 7]} z={-6} seed={33} size={1.2} />
    <MineHill position={[4, 0, -16]} scale={1.4} />
    <Haze color="#FFC89A" position={[0, 1.4, -10]} w={40} h={6} opacity={0.5} />
  </group>
);

// ---------------- F / S6: road prep — trailers under, lift, posts and bridge removed ----------------
export const SceneF: React.FC<SP> = ({ t }) => {
  const slide = win(t, 49.7, 50.9);
  const lift = win(t, 51.0, 52.6) * 0.16;
  const tape = win(t, 53.9, 54.8);
  const pull = (a: number) => win(t, a, a + 1.6);
  const pl = pull(55.9), tl = pull(56.9), br = pull(57.9);
  return (
    <group>
      <Ground color={C.apron} kind="cobble" />
      <Road x={[-8, 16]} w={3} />
      {/* widened lanes (fresh gravel) */}
      {[-2.0, 2.0].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.003, z]} receiveShadow material={texMat("#8E8A82", "cobble", [12, 1])}>
          <planeGeometry args={[24, 1.0]} />
        </mesh>
      ))}
      <ChurchRig t={t} x={0} lift={lift} trailerX={-(1 - slide) * 3} rolling={slide < 1} />
      {/* cribbing under the church before the lift */}
      {lift < 0.15
        ? [-1.1, 1.1].map((cx) => (
            <mesh key={cx} position={[cx, 0.13, 0]} castShadow material={texMat("#7A5A3A", "plank", [1, 1])}>
              <boxGeometry args={[0.3, 0.26, 1.6]} />
            </mesh>
          ))
        : null}
      {/* 24 m tape across the road */}
      {tape > 0 ? (
        <group position={[2.2, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1, tape, 1]}>
            <planeGeometry args={[0.08, 5.0]} />
            <meshBasicMaterial color={[2.4, 1.9, 0.4]} toneMapped={false} />
          </mesh>
          {[-2.5, 2.5].map((z) => (
            <mesh key={z} position={[0, 0.2, z * tape]} material={flatMat("#E03A2A")}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
            </mesh>
          ))}
        </group>
      ) : null}
      {/* crane removing a lamp post, a traffic light and the bridge span */}
      <group position={[7.2, 0, -2.9]} rotation={[0, -Math.PI / 2, 0]}>
        <AssetModel id="mobile-crane-671d3f" assetType="vehicle" size={2.6} ground />
      </group>
      <group position={[5.4 + pl * 1.2, pl * 1.6, 1.75 - pl * 2.6]} visible={pl < 0.98}>
        <Lamp position={[0, 0, 0]} size={0.7} light={0} />
      </group>
      <group position={[6.6 + tl * 0.6, tl * 1.6, 1.8 - tl * 2.6]} visible={tl < 0.98}>
        <AssetModel id="traffic-light-5e5ae6" assetType="prop" size={0.8} ground />
      </group>
      <group position={[9.2, br * 1.3, 0]} rotation={[0, Math.PI / 2, br * 0.2]}>
        <AssetModel id="bailey-bridge-section-d5c408" assetType="building" size={2.4} ground />
      </group>
      {[3.6, 4.4, 5.2, 8.0, 8.6].map((cx, i) => (
        <group key={cx} position={[cx, 0, i % 2 ? -1.55 : 1.55]}>
          <AssetModel id="traffic-cone-247748" assetType="prop" size={0.16} ground />
        </group>
      ))}
      <Lamp position={[2.0, 0, 3.4]} size={1.0} light={1.2} />
      <Lamp position={[-2.0, 0, 1.75]} size={0.7} />
      <Crowd t={t} n={8} x={[-3, 1]} z={[2.2, 3.0]} seed={41} />
      <HouseRow n={6} x={[-6, 14]} z={-4.6} seed={43} size={1.2} />
      <TreeRow kind="birch" n={8} x={[-8, 16]} z={[-6.4, -5.6]} seed={45} size={[1.3, 1.9]} />
      <MineHill position={[2, 0, -16]} scale={1.5} />
      <Haze color="#FFE0BC" position={[4, 1.5, -11]} w={40} h={6} opacity={0.45} />
    </group>
  );
};

// ---------------- G / S7: the journey, 19–20 Aug 2025 ----------------
export const churchXG = (t: number) => (st(t, 12) - 59.9) * 0.3;
export const SceneG: React.FC<SP> = ({ t }) => {
  const x = churchXG(t);
  return (
    <group>
      <Ground color={C.apron} kind="cobble" />
      <Road x={[-12, 30]} w={3} />
      <ChurchRig t={t} x={x} />
      <Crowd t={t} n={18} x={[-2.4, 1.6]} z={[1.9, 2.8]} seed={51} walk dx={x} flags={5} />
      <Crowd t={t} n={14} x={[-4, 9]} z={[-2.8, -2.1]} seed={53} flags={3} />
      {[-6, -3, 0, 3, 6, 9].map((lx) => (
        <Lamp key={lx} position={[lx, 0, 1.65]} size={0.7} />
      ))}
      <Lamp position={[4.6, 0, 3.3]} size={1.0} light={1.2} />
      {/* TV camera on a tripod, red tally light */}
      <group position={[3.6, 0, 2.3]}>
        {[0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.06, 0.16, Math.sin(a) * 0.06]} rotation={[Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25]} material={flatMat("#222")}>
            <cylinderGeometry args={[0.01, 0.01, 0.34, 6]} />
          </mesh>
        ))}
        <mesh position={[0, 0.36, 0]} rotation={[0, 0.5, 0]} material={flatMat("#2A2E36", 0.5, 0.3)}>
          <boxGeometry args={[0.18, 0.11, 0.1]} />
        </mesh>
        <mesh position={[-0.02, 0.44, 0]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshBasicMaterial color={[3, 0.3, 0.2]} toneMapped={false} />
        </mesh>
      </group>
      <HouseRow n={8} x={[-8, 14]} z={-4.6} seed={55} size={1.2} />
      <TreeRow kind="birch" n={10} x={[-10, 16]} z={[-6.4, -5.6]} seed={57} size={[1.3, 2.0]} />
      <MineHill position={[-4, 0, -16]} scale={1.5} />
      <Haze color="#FFD8B0" position={[2, 1.5, -11]} w={44} h={6} opacity={0.45} />
    </group>
  );
};

// ---------------- H / S8: new home, turned 180°, organ cutaway, pull-back ----------------
export const SceneH: React.FC<SP> = ({ t }) => {
  const turn = win(t, 72.3, 74.6) * Math.PI;
  const ghost = win(t, 74.7, 75.2) * (1 - win(t, 76.2, 76.6));
  return (
    <group>
      <Ground color={C.apron} kind="cobble" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow material={texMat("#9C9384", "ashlar", [4, 4])}>
        <circleGeometry args={[2.4, 48]} />
      </mesh>
      <ChurchRig t={t} x={0} turn={turn} ghost={ghost} rolling={false} />
      <SignBoard text="AUDIRA · KIRUNA 2025" position={[1.7, 0, 2.2]} rotation={-0.4} w={1.4} h={0.3} posts={0.3} />
      <Crowd t={t} n={16} x={[-2.6, 2.2]} z={[2.4, 3.4]} seed={61} flags={4} lookUp />
      <Lamp position={[-2.2, 0, 2.6]} size={0.8} light={1.0} />
      <Lamp position={[2.8, 0, 3.2]} size={1.0} light={1.2} />
      <HouseRow n={6} x={[-7, 7]} z={-4.2} seed={63} size={1.4} lights />
      <TreeRow kind="birch" n={8} x={[-8, 8]} z={[-6.2, -5.4]} seed={65} size={[1.4, 2.0]} />
      <MineHill position={[-3, 0, -16]} scale={1.6} />
      <Haze color="#FFCFA0" position={[0, 1.6, -11]} w={44} h={6} opacity={0.5} />
    </group>
  );
};

export const SCENES: Record<SceneId, React.FC<SP>> = { A: SceneA, B: SceneB, C: SceneC, D: SceneD, E: SceneE, F: SceneF, G: SceneG, H: SceneH };
