// EP74 Darvaza scenes A–I. 1 unit = 1 m (B: 1 unit ≈ 2.6 km). t = film seconds, f = 60 fps clock.
// The desert + crater fire are mounted by DarvazaFilm for the desert scenes; each scene adds its own props.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { FX_LAYER } from "../core/render/Post.tsx";
import { clamp01, mulberry32 } from "../kits/feltcraft/core/motion";
import { C, mat, pop, st, Fire, type Flame, Smoke, SignBoard, Label, Boulders, Tent, Truck, Drums, Worker, Tourist, Explorer, MapTerrain, textTexture } from "./parts.tsx";
import { ASHGABAT, DARVAZA, DEPTH, FLOOR_R, R, bowl, height, mapHeight } from "./world.ts";
import { explorerAt, type V3 } from "./timeline.ts";

type SP = { t: number; f: number };
const H = (x: number, z: number): V3 => [x, height(x, z), z];
const headingTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);

// ---------- shared desert dressing ----------
/** Night camp on the south rim: tents, the AUDIRA board, (optional) tourists. */
const Camp: React.FC<SP & { tourists?: boolean; glow?: number }> = ({ f, tourists, glow = 1 }) => (
  <group>
    <Tent position={[-18, 0, 46]} rotation={0.4} size={5} glow={glow} />
    <Tent position={[-28, 0, 40]} rotation={0.9} size={4.6} glow={glow * 0.8} />
    <SignBoard text="AUDIRA" position={H(-6, 40)} rotation={0.15} s={3} lit={0.25 * glow} />
    {tourists ? (
      <>
        <Tourist f={f} seed={3} position={[4, 0, 38]} heading={headingTo([4, 0, 38], [0, 0, 0])} pose="point" />
        <Tourist f={f} seed={8} position={[6, 0, 38.5]} heading={headingTo([6, 0, 38.5], [0, 0, 0])} />
      </>
    ) : null}
    <Boulders />
  </group>
);

/** The 1971 rig, crushed on the crater floor (seen once the fire burns). */
const RigWreck: React.FC = () => (
  <group position={[7, -DEPTH + 0.4, 5]} rotation={[0.45, 0.6, 0.25]}>
    <AssetModel id="core-drill-rig-3b355e" assetType="prop" size={14} ground tint="#3E322A" roughness={0.9} />
  </group>
);

// ---------------- A: night, flying down to the burning crater ----------------
export const SceneA: React.FC<SP> = (p) => (
  <group>
    <Camp {...p} tourists />
    <RigWreck />
  </group>
);

// ---------------- B: relief map, Ashgabat → 260 km north → Darvaza ----------------
const ROUTE: [number, number][] = [
  [0, 36],
  [-3, 10],
  [1, -20],
  [-4, -53],
];
const routeCurve = () => new THREE.CatmullRomCurve3(ROUTE.map(([x, z]) => new THREE.Vector3(x, mapHeight(x, z) + 0.35, z)), false, "centripetal");
const mapFlames = (): Flame[] => {
  const rnd = mulberry32(5);
  return Array.from({ length: 40 }, () => {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 1.9;
    const x = DARVAZA[0] + Math.cos(a) * r, z = DARVAZA[2] + Math.sin(a) * r;
    return { p: [x, mapHeight(x, z) - 0.05, z] as V3, w: 0.35 + rnd() * 0.4, h: 0.7 + rnd() * 1.1, seed: rnd() * 10, rank: rnd() * 0.98 };
  });
};
export const SceneB: React.FC<SP> = ({ t }) => {
  const { tube, blocks, flames } = useMemo(() => {
    const curve = routeCurve();
    const tube = new THREE.TubeGeometry(curve, 160, 0.5, 10, false);
    const rnd = mulberry32(38);
    const blocks = Array.from({ length: 44 }, () => {
      const a = rnd() * Math.PI * 2, r = Math.pow(rnd(), 0.7) * 5.5;
      const x = ASHGABAT[0] + Math.cos(a) * r * 1.4, z = ASHGABAT[2] + Math.sin(a) * r * 0.8;
      return { p: [x, mapHeight(x, z), z] as V3, w: 0.7 + rnd() * 0.8, h: 0.6 + rnd() * (r < 2 ? 2.6 : 1.2) };
    });
    return { tube, blocks, flames: mapFlames() };
  }, []);
  // route grows from Ashgabat to Darvaza 8.9 → 11.6
  const u = clamp01((st(t) - 8.9) / 2.7);
  const idx = tube.index!.count;
  tube.setDrawRange(0, Math.floor((idx / 6) * u) * 6);
  const dz: V3 = [DARVAZA[0], mapHeight(DARVAZA[0], DARVAZA[2]), DARVAZA[2]];
  const ring = pop(t, 10.6);
  return (
    <group>
      <MapTerrain />
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.p[0], b.p[1] + b.h / 2, b.p[2]]} material={mat("#F1EEE6", 1, "stone")} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.w]} />
        </mesh>
      ))}
      {u > 0 ? (
        <mesh geometry={tube}>
          <meshStandardMaterial color="#FFC04A" emissive="#FF9A20" emissiveIntensity={1.6} roughness={0.4} />
        </mesh>
      ) : null}
      <group position={dz}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]} scale={Math.max(0.001, ring)}>
          <torusGeometry args={[2.4, 0.16, 12, 48]} />
          <meshStandardMaterial color="#FF7A2A" emissive="#FF5A10" emissiveIntensity={3} />
        </mesh>
        <pointLight position={[0, 2, 0]} intensity={60} decay={2} color="#FF7A2A" />
      </group>
      <Fire flames={flames} t={t} fire={1} gain={1.4} />
      <Label text="ASHGABAT" position={[ASHGABAT[0], 6, ASHGABAT[2]]} w={14} opacity={clamp01(pop(t, 7.0))} />
      <Label text="GURUN KARAKUM" position={[-13, 2.5, -8]} w={13} color="#F2E6CC" opacity={clamp01(pop(t, 9.4)) * 0.85} />
      <Label text="DARVAZA" position={[dz[0], dz[1] + 3.6, dz[2]]} w={11} color="#FFB25A" opacity={clamp01(pop(t, 10.8))} />
    </group>
  );
};

// ---------------- C: 1971 Soviet drilling camp, the ground gives way ----------------
const LID_R = R + 1.5;
const LID_T = 3;
const COLLAPSE = 23.75;
const crackTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(71);
  g.strokeStyle = "rgba(40,26,16,0.95)";
  g.lineCap = "round";
  for (let k = 0; k < 26; k++) {
    let a = rnd() * Math.PI * 2, r = 40 + rnd() * 140;
    g.lineWidth = 2 + rnd() * 6;
    g.beginPath();
    g.moveTo(512 + Math.cos(a) * r, 512 + Math.sin(a) * r);
    for (let s = 0; s < 14; s++) {
      a += (rnd() - 0.5) * 0.35;
      r += 18 + rnd() * 22;
      g.lineTo(512 + Math.cos(a) * r, 512 + Math.sin(a) * r);
    }
    g.stroke();
  }
  // ring crack along the hidden cavity edge
  g.lineWidth = 7;
  g.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2, r = 460 + (rnd() - 0.5) * 22;
    i ? g.lineTo(512 + Math.cos(a) * r, 512 + Math.sin(a) * r) : g.moveTo(512 + Math.cos(a) * r, 512 + Math.sin(a) * r);
  }
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
const LidSlice: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(LID_R, LID_R, LID_T, 16, 1, false, -Math.PI / 8, Math.PI / 4), []);
  const dt = Math.max(0, st(t) - (COLLAPSE + 0.08 * i));
  const drop = Math.min(DEPTH + 1, 0.5 * 26 * dt * dt);
  const tilt = -Math.min(0.55, dt * 0.7) * (0.7 + 0.3 * ((i * 37) % 5) / 4);
  return (
    <group rotation={[0, (i * Math.PI) / 4, 0]} position={[0, -drop, 0]}>
      <group position={[0, 0, LID_R]} rotation={[tilt, 0, 0]}>
        <mesh geometry={geo} position={[0, 0.15 - LID_T / 2, -LID_R]} material={mat(C.clay, 6, "stone")} castShadow receiveShadow />
      </group>
    </group>
  );
};
const C_WORKERS: { p: V3; seed: number; pose: "point" | "carry" | "stand" }[] = [
  { p: [4, 0.15, 6], seed: 1, pose: "point" },
  { p: [-5, 0.15, 4], seed: 2, pose: "carry" },
  { p: [3, 0.15, -6], seed: 4, pose: "stand" },
];
export const SceneC: React.FC<SP> = ({ t, f }) => {
  const crack = useMemo(crackTexture, []);
  const s = st(t);
  const collapsed = s >= COLLAPSE;
  const dt = Math.max(0, s - COLLAPSE);
  const drop = Math.min(DEPTH - 1, 0.5 * 26 * dt * dt);
  const crackA = clamp01((s - 20.5) / 3.2) * (collapsed ? 0 : 1);
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <LidSlice key={i} i={i} t={t} />
      ))}
      {crackA > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0]}>
          <circleGeometry args={[LID_R, 64]} />
          <meshStandardMaterial map={crack} transparent opacity={crackA} depthWrite={false} roughness={1} />
        </mesh>
      ) : null}
      {/* centre: the rig and its stores ride the ground down */}
      <group position={[0, 0.15 - drop, 0]} rotation={[Math.min(0.5, dt * 0.6), 0, -Math.min(0.3, dt * 0.35)]}>
        <AssetModel id="core-drill-rig-3b355e" assetType="prop" size={12} ground tint="#9C8A70" roughness={0.8} />
        <Drums position={[-8, 0, 7]} />
        <group position={[6, 0, 9]}>
          <AssetModel id="spoil-heap-9aaa11" assetType="prop" size={5} ground tint={C.sandDark} roughness={1} />
        </group>
      </group>
      {C_WORKERS.map((w, i) => {
        const out = clamp01((s - 21.0 - i * 0.15) / 2.5);
        const a = Math.atan2(w.p[0], w.p[2]);
        const r0 = Math.hypot(w.p[0], w.p[2]);
        const r = r0 + (42 - r0) * out;
        const pos: V3 = [Math.sin(a) * r, out > 0.85 ? height(Math.sin(a) * r, Math.cos(a) * r) : 0.15, Math.cos(a) * r];
        const running = out > 0 && out < 1;
        return <Worker key={i} f={f} seed={w.seed} position={pos} heading={running ? a : out >= 1 ? a + Math.PI : a + 2.4} pose={running ? "run" : out >= 1 ? "point" : w.pose} />;
      })}
      <Truck position={[-30, 0, 32]} rotation={0.7} />
      <Tent position={[30, 0, 26]} rotation={-0.6} />
      <Tent position={[36, 0, 12]} rotation={-1.2} size={4.4} />
      <Boulders />
      <Smoke t={t} origin={[0, -6, 0]} color="#C8AE88" n={16} rise={26} spread={44} size={4.2} opacity={0.75} from={23.7} to={28.2} seed={7} />
    </group>
  );
};

// ---------------- D: dusk, methane, the torch ----------------
const THROWER: V3 = [-27, 0, 26];
const D_CREW: V3[] = [THROWER, [-29, 0, 23], [-24.5, 0, 29]];
const TORCH_FLAMES: Flame[] = [
  { p: [0, 0, 0], w: 0.45, h: 1.1, seed: 1, rank: 0 },
  { p: [0.08, 0, 0.05], w: 0.3, h: 0.8, seed: 4, rank: 0 },
  { p: [-0.07, 0, -0.04], w: 0.32, h: 0.9, seed: 7, rank: 0 },
];
const torchAt = (t: number): V3 => {
  const u = clamp01((t - 32.4) / 1.0);
  const a: V3 = [-26.4, height(-27, 26) + 2.1, 25.4], b: V3 = [-8, -DEPTH + 1, 8];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 9 * Math.sin(Math.PI * u), a[2] + (b[2] - a[2]) * u];
};
export const SceneD: React.FC<SP> = ({ t, f }) => {
  const s = st(t);
  const flying = s >= 32.4 && s < 33.4;
  const flash = s >= 33.4 ? Math.exp(-(s - 33.4) * 3.2) : 0;
  const heading = headingTo(THROWER, [0, 0, 0]);
  return (
    <group>
      {D_CREW.map((p, i) => {
        const pos = H(p[0], p[2]);
        const throwing = i === 0 && s >= 32.0 && s < 32.6;
        return (
          <Worker
            key={i}
            f={f}
            seed={i + 1}
            position={pos}
            heading={headingTo(pos, [0, 0, 0])}
            pose={throwing ? "throw" : i === 0 ? "stand" : s > 33.4 ? "point" : "stand"}
            rightHand={i === 0 && s < 32.4 ? <Fire flames={TORCH_FLAMES} t={t} fire={1} gain={1.8} /> : undefined}
          />
        );
      })}
      {i0Light(s, heading)}
      {flying ? (
        <group position={torchAt(s)}>
          <Fire flames={TORCH_FLAMES} t={t} fire={1} gain={2} />
          <pointLight intensity={40} decay={2} color="#FFA040" />
        </group>
      ) : null}
      {flash > 0.01 ? <pointLight position={[-8, -18, 8]} intensity={9000 * flash} decay={2} color="#FFC070" /> : null}
      <Truck position={[-38, 0, 30]} rotation={1.1} />
      <Tent position={[-46, 0, 18]} rotation={1.3} size={4.6} glow={0.6} />
      <Boulders />
      <RigWreck />
      <Smoke t={t} origin={[0, -14, 0]} color="#B8E0B0" n={12} rise={22} spread={34} size={2.4} opacity={0.07} from={28} to={33.6} seed={3} />
    </group>
  );
};
/** Warm torch light in the thrower's hand before the throw. */
const i0Light = (s: number, heading: number) =>
  s < 32.4 ? <pointLight position={[THROWER[0] + Math.sin(heading) * 0.6, height(THROWER[0], THROWER[2]) + 2.6, THROWER[2] + Math.cos(heading) * 0.6]} intensity={35} decay={2} color="#FFA040" /> : null;

// ---------------- E: cross-section diagram, ±70 m × 30 m ----------------
const strataTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(12);
  const cols = ["#C9A877", "#B48E5C", "#9C7B58", "#8C7A66", "#76604C", "#5E4A3C", "#4A3B31"];
  let y = 0;
  while (y < 512) {
    const h = 14 + rnd() * 46;
    g.fillStyle = cols[Math.min(cols.length - 1, Math.floor((y / 512) * cols.length + rnd() * 1.2))];
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x / 90 + y) * 4);
    for (let x = 1024; x >= 0; x -= 32) g.lineTo(x, y + h + Math.sin(x / 80 + y) * 4);
    g.fill();
    y += h;
  }
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = `rgba(${rnd() < 0.5 ? "40,28,18" : "235,220,190"},${0.08 + rnd() * 0.12})`;
    g.fillRect(rnd() * 1024, rnd() * 512, 2 + rnd() * 5, 1 + rnd() * 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1 / 92, 1 / 45);
  tex.offset.set(0.5, 1);
  return tex;
};
const BLOCK_X = 46, BLOCK_Y = 45, BLOCK_Z = 50;
const crossSection = () => {
  const s = new THREE.Shape();
  s.moveTo(-BLOCK_X, -BLOCK_Y);
  s.lineTo(BLOCK_X, -BLOCK_Y);
  s.lineTo(BLOCK_X, 0);
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = R * 1.03 - (i / steps) * R * 2.06;
    s.lineTo(x, -DEPTH + (DEPTH - 0) * bowl(Math.abs(x)));
  }
  s.lineTo(-BLOCK_X, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: BLOCK_Z, bevelEnabled: false, curveSegments: 2 });
};
const sectionFlames = (): Flame[] => {
  const rnd = mulberry32(41);
  return Array.from({ length: 120 }, () => {
    const x = (rnd() * 2 - 1) * (FLOOR_R + 3);
    const z = -rnd() * (BLOCK_Z - 2) - 1;
    return { p: [x, -DEPTH + DEPTH * bowl(Math.abs(x)) - 0.1, z] as V3, w: 1 + rnd() * 2, h: 2 + rnd() * 4.5, seed: rnd() * 10, rank: rnd() * 0.98 };
  });
};
const DimBar: React.FC<{ from: V3; to: V3; s: number }> = ({ from, to, s }) => {
  if (s <= 0.001) return null;
  const mid: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]) * Math.min(1, s);
  const vertical = Math.abs(to[1] - from[1]) > Math.abs(to[0] - from[0]);
  const cap = (p: V3, k: number) => (
    <mesh key={k} position={p} scale={vertical ? [2.4, 0.35, 0.35] : [0.35, 2.4, 0.35]} layers={FX_LAYER}>
      <boxGeometry />
      <meshBasicMaterial color={C.hud} toneMapped={false} fog={false} />
    </mesh>
  );
  return (
    <group>
      <mesh position={mid} scale={vertical ? [0.3, len, 0.3] : [len, 0.3, 0.3]} layers={FX_LAYER}>
        <boxGeometry />
        <meshBasicMaterial color={C.hud} toneMapped={false} fog={false} />
      </mesh>
      {s >= 1 ? [cap(from, 0), cap(to, 1)] : null}
    </group>
  );
};
export const SceneE: React.FC<SP> = ({ t }) => {
  const { geo, mats, flames } = useMemo(() => {
    const cap = new THREE.MeshStandardMaterial({ map: strataTexture(), roughness: 0.95 });
    const side = mat("#6B5644", 4, "stone");
    return { geo: crossSection(), mats: [cap, side], flames: sectionFlames() };
  }, []);
  const w = pop(t, 40.3, 0.6), d = pop(t, 41.6, 0.6);
  return (
    <group>
      <mesh geometry={geo} material={mats} position={[0, 0, -BLOCK_Z]} castShadow receiveShadow />
      {/* sand skin on the top surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(BLOCK_X + R * 1.03) / 2, 0.05, -BLOCK_Z / 2]}>
        <planeGeometry args={[BLOCK_X - R * 1.03, BLOCK_Z]} />
        <meshStandardMaterial color={C.sand} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(BLOCK_X + R * 1.03) / 2, 0.05, -BLOCK_Z / 2]}>
        <planeGeometry args={[BLOCK_X - R * 1.03, BLOCK_Z]} />
        <meshStandardMaterial color={C.sand} roughness={1} />
      </mesh>
      <Fire flames={flames} t={t} fire={1} gain={1.5} />
      <pointLight position={[0, -22, -20]} intensity={6000} decay={2} color="#FF7A2A" />
      <pointLight position={[0, -24, 2]} intensity={2500} decay={2} color="#FF8A3A" />
      <group position={[40, 0, -12]} rotation={[0, -0.5, 0]}>
        <AssetModel id="military-cargo-truck-652f66" assetType="vehicle" size={8} ground tint="#5E6A4E" roughness={0.75} />
      </group>
      <DimBar from={[-R, 5, 1]} to={[R, 5, 1]} s={w} />
      <DimBar from={[0, 0, 1.5]} to={[0, -DEPTH, 1.5]} s={d} />
      <Label text="±70 M" position={[0, 10, 1]} w={20} color={C.hud} opacity={clamp01(w)} />
      <Label text="±30 M" position={[9, -15, 2]} w={18} color={C.hud} opacity={clamp01(d)} />
    </group>
  );
};

// ---------------- F: the sealed archive at night ----------------
const CRATE: V3 = [6, 0, 42];
export const SceneF: React.FC<SP> = ({ t, f }) => {
  const y = height(CRATE[0], CRATE[2]);
  const folder = textTexture("ARSIP · DARVAZA · 1971", { w: 768, h: 556, bg: C.paper, fg: C.ink, font: "bold 70px 'Courier New', monospace", border: "#8A6A44" });
  const stamp = textTexture("TERTUTUP", { w: 512, h: 160, bg: "transparent", fg: C.stamp, font: "900 110px Arial, sans-serif", border: C.stamp, grain: false });
  const n60 = textTexture("1960-AN?", { w: 512, h: 256, bg: "#F6EFC8", fg: "#1E3A8A", font: "bold 120px 'Segoe Print', 'Comic Sans MS', cursive", border: "none" });
  const n80 = textTexture("1980-AN?", { w: 512, h: 256, bg: "#F6EFC8", fg: "#A8361A", font: "bold 120px 'Segoe Print', 'Comic Sans MS', cursive", border: "none" });
  const sp = pop(t, 46.0, 0.35), a = pop(t, 50.5), b = pop(t, 52.8);
  const top = y + 0.5;
  return (
    <group>
      <Camp t={t} f={f} glow={1} />
      <RigWreck />
      <group position={[CRATE[0], y, CRATE[2]]} rotation={[0, 0.12, 0]}>
        <mesh position={[0, 0.25, 0]} material={mat("#7A5434", 2, "wood")} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.5, 0.8]} />
        </mesh>
        <mesh position={[0, 0.503, 0]} rotation={[-Math.PI / 2, 0, 0.05]} castShadow>
          <planeGeometry args={[0.9, 0.65]} />
          <meshStandardMaterial map={folder} roughness={0.9} />
        </mesh>
        {sp > 0 ? (
          <mesh position={[0.05, 0.507, 0.12]} rotation={[-Math.PI / 2, 0, -0.22]} scale={sp}>
            <planeGeometry args={[0.6, 0.19]} />
            <meshStandardMaterial map={stamp} transparent roughness={0.9} emissive="#FF3020" emissiveMap={stamp} emissiveIntensity={0.25} />
          </mesh>
        ) : null}
        {a > 0 ? (
          <mesh position={[-0.42, 0.51, -0.2]} rotation={[-Math.PI / 2, 0, 0.3]} scale={a}>
            <planeGeometry args={[0.36, 0.18]} />
            <meshStandardMaterial map={n60} roughness={0.9} />
          </mesh>
        ) : null}
        {b > 0 ? (
          <mesh position={[0.43, 0.512, -0.22]} rotation={[-Math.PI / 2, 0, -0.25]} scale={b}>
            <planeGeometry args={[0.36, 0.18]} />
            <meshStandardMaterial map={n80} roughness={0.9} />
          </mesh>
        ) : null}
      </group>
      {/* oil lamp */}
      <group position={[CRATE[0] + 0.85, y, CRATE[2] + 0.15]}>
        <mesh position={[0, 0.18, 0]} material={mat("#6E5A3A", 1, "metal")} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.36, 14]} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshBasicMaterial color="#FFD080" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.6, 0]} intensity={3.2} decay={2} color="#FFB060" />
      </group>
      <pointLight position={[CRATE[0] - 0.6, top + 1.2, CRATE[2] + 1.4]} intensity={2.4} decay={2} color="#FFC890" />
    </group>
  );
};

// ---------------- G: 2013, the explorer descends and samples the floor ----------------
const TRIPOD: V3 = [0, 0, -37];
const Tripod: React.FC<{ top: V3 }> = ({ top }) => {
  const legs = [0, 2.1, 4.2].map((a) => [TRIPOD[0] + Math.sin(a) * 2.2, 0, TRIPOD[2] - 1 + Math.cos(a) * 2.2] as V3);
  return (
    <group>
      {legs.map((l, i) => {
        const base = H(l[0], l[2]);
        return <Beam key={i} a={base} b={top} r={0.09} color="#8C8F94" kind="metal" />;
      })}
    </group>
  );
};
const Beam: React.FC<{ a: V3; b: V3; r: number; color: string; kind?: "metal" | "stone" | "paint" }> = ({ a, b, r, color, kind }) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q} scale={[r, len, r]} material={mat(color, 1, kind)} castShadow>
      <cylinderGeometry args={[1, 1, 1, 10]} />
    </mesh>
  );
};
export const SceneG: React.FC<SP> = ({ t, f }) => {
  const e = explorerAt(t);
  const pos: V3 = [e[0], Math.max(e[1], height(e[0], e[2])), e[2]];
  const top: V3 = [TRIPOD[0], height(TRIPOD[0], TRIPOD[2]) + 4.2, TRIPOD[2] - 1];
  const kneel = t >= 59.0 && t < 61.2;
  const sample = clamp01((st(t) - 59.4) / 0.4);
  const landed = t >= 58.5;
  return (
    <group>
      <Tripod top={top} />
      <Beam a={top} b={[pos[0], pos[1] + 1.5, pos[2]]} r={0.035} color="#D8C29A" />
      <group position={H(1.8, -39.5)}>
        <AssetModel id="rope-coil-and-harness-5b51d5" assetType="prop" size={1.2} ground tint="#C8A060" roughness={0.9} />
      </group>
      <Worker f={f} seed={5} position={H(-3, -40)} heading={0} pose="point" />
      <Explorer f={f} position={pos} heading={landed ? 0.4 : Math.PI} pose={kneel ? "kneel" : "stand"} sample={sample} />
      {sample > 0 ? <pointLight position={[pos[0] + 0.3, pos[1] + 0.9, pos[2] + 0.4]} intensity={6 * sample} decay={2} color="#6CFFC0" /> : null}
      <RigWreck />
      <Boulders />
    </group>
  );
};

// ---------------- H: pre-dawn, wells drilled around the crater; the fire shrinks ----------------
const WELL_ANGLES = [0.6, 2.7, 4.6];
export const SceneH: React.FC<SP> = ({ t, f }) => {
  const s = pop(t, 67.2, 0.6);
  return (
    <group>
      <Camp t={t} f={f} glow={0.7} />
      <RigWreck />
      {WELL_ANGLES.map((a, i) => {
        const si = pop(t, 67.2 + i * 0.25, 0.6);
        if (si <= 0.001) return null;
        const x = Math.sin(a) * 70, z = Math.cos(a) * 70;
        const p = H(x, z);
        const pipeA = H(Math.sin(a) * 39, Math.cos(a) * 39), pipeB = H(Math.sin(a) * 66, Math.cos(a) * 66);
        return (
          <group key={i}>
            <group position={p} rotation={[0, a + Math.PI, 0]} scale={si}>
              <AssetModel id="core-drill-rig-3b355e" assetType="prop" size={16} ground tint={C.steel} roughness={0.6} metalness={0.3} />
              <pointLight position={[3, 9, 3]} intensity={260} decay={2} color="#EAF2FF" />
            </group>
            {s > 0.5 ? <Beam a={[pipeA[0], pipeA[1] + 0.5, pipeA[2]]} b={[pipeB[0], pipeB[1] + 0.5, pipeB[2]]} r={0.45} color="#8E9AA6" kind="metal" /> : null}
          </group>
        );
      })}
    </group>
  );
};

// ---------------- I: dawn, the fire dims; pull out ----------------
export const SceneI: React.FC<SP> = (p) => (
  <group>
    <Camp {...p} tourists glow={0.3} />
    <RigWreck />
    {WELL_ANGLES.map((a, i) => (
      <group key={i} position={H(Math.sin(a) * 70, Math.cos(a) * 70)} rotation={[0, a + Math.PI, 0]}>
        <AssetModel id="core-drill-rig-3b355e" assetType="prop" size={16} ground tint={C.steel} roughness={0.6} metalness={0.3} />
      </group>
    ))}
    <Smoke t={p.t} origin={[0, -18, 0]} color="#8A7E78" n={10} rise={30} spread={30} size={3.6} opacity={0.35} seed={11} />
  </group>
);

export const SCENES = { A: SceneA, B: SceneB, C: SceneC, D: SceneD, E: SceneE, F: SceneF, G: SceneG, H: SceneH, I: SceneI } as const;
