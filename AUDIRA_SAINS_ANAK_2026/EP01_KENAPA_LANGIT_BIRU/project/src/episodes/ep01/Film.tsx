// EP01 — Kenapa Langit Biru (WORLDFORGE · Remotion + R3F, AUDIRA Sains).
// Clock = VO clock (offset 0). Film 91 s; VO ends 87.31 s; outro card 88–91 s. Authored times pass through RETIME.
// 15 sub-scenes cut on VO anchor words (docs/STORYBOARD.md). Skies: WORLDFORGE SkyDome per world.
import React, { useMemo } from "react";
import * as THREE from "three";
import { FilmFromConfig, type FilmConfig, type BeatContent, type BeatProps } from "../../templates";
import { frame as frameTo, type Framing, type Move } from "../../core/camera/moves.ts";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { DISPLAY } from "../../core/type/displayFonts.ts";
import { SunDisc, LightBeam, WaveRibbon, AirMolecule, ScatterBurst } from "../../core/concepts";
import { SkyDome, type SkyColors } from "../../kits/worldforge/Sky.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import WORDS from "../../../public/audio/vo-words.json";

export const EP01_SECONDS = 91;
const OUTRO_SECONDS = 3;
const VO_END = 87.31;

// Retime (s4): scene/camera/card times below are authored on the first VO take (79.64 s).
// The locked VO (87.31 s, 210 words) differs, so every authored time goes through this
// piecewise-linear map: [authored s, locked-VO s], pinned on the same anchor word.
const RETIME: [number, number][] = [
  [0, 0], [0.25, 0.15], [2.35, 2.71], [3.7, 4.99], [4.33, 6.04], [5.42, 7.86], [5.97, 8.79],
  [8.33, 11.35], [10.7, 14.16], [11.86, 15.54], [13.71, 17.71], [15.63, 20.32], [18.31, 23.44],
  [19.43, 24.84], [20.96, 26.44], [21.8, 27.0], [23.07, 28.36], [24.64, 30.37], [25.64, 30.88],
  [26.81, 31.78], [29.69, 34.78], [32.69, 38.14], [33.73, 39.01], [35.06, 40.33], [36.05, 41.25],
  [38.42, 44.13], [40.82, 46.3], [42.14, 48.47], [44.57, 51.38], [45.39, 52.34], [47.54, 54.01],
  [49.2, 56.12], [51.38, 58.51], [53.19, 60.68], [55.76, 64.37], [56.72, 65.33], [57.77, 66.16],
  [60.33, 68.53], [61.95, 69.81], [64.43, 72.08], [65.33, 73.13], [66.75, 74.47], [68.24, 76.04],
  [70.02, 77.48], [71.84, 78.76], [73.86, 80.91], [76.89, 82.51], [77.85, 85.36], [79.64, 87.31],
  [80, 88], [83, 91],
];
const remap = (x: number, from: 0 | 1) => {
  const to = (1 - from) as 0 | 1;
  if (x <= RETIME[0][from]) return x;
  for (let i = 1; i < RETIME.length; i++) {
    const a = RETIME[i - 1];
    const b = RETIME[i];
    if (x <= b[from]) return a[to] + ((x - a[from]) / (b[from] - a[from])) * (b[to] - a[to]);
  }
  const l = RETIME[RETIME.length - 1];
  return l[to] + (x - l[from]);
};
/** authored time -> locked-VO time */
const R = (x: number) => remap(x, 0);
/** locked-VO time -> authored time */
const A = (x: number) => remap(x, 1);

const BEATS: FilmConfig["beats"] = {
  hook: { start: 0, end: R(8.2) },
  context: { start: R(8.2), end: R(21.8) },
  main: { start: R(21.8), end: R(46.9) },
  explanation: { start: R(46.9), end: R(61.6) },
  payoff: { start: R(61.6), end: R(73.7) },
  outro: { start: R(73.7), end: EP01_SECONDS },
};

type V3 = [number, number, number];
const sm = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const norm = (v: V3): V3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- skies ----------
type SkyKind = "earthDay" | "earthDusk" | "marsDay" | "marsDusk";
type SkyDef = { sun: V3; colors: SkyColors; sunColor: string; sunI: number; hemi: [string, string, number]; fog: string };
const SKIES: Record<SkyKind, SkyDef> = {
  earthDay: {
    sun: norm([0.45, 0.72, 0.4]),
    colors: { zenith: "#2a66cc", horizon: "#bcd9f2", glow: "#fff6de", halo: "#ffffff", ground: "#5d6c48", sunDisk: 18 },
    sunColor: "#fff3dc",
    sunI: 3.2,
    hemi: ["#9cc6ff", "#5d6c48", 0.9],
    fog: "#c3dcf2",
  },
  earthDusk: {
    sun: norm([0.18, 0.14, -1]),
    colors: { zenith: "#28386a", horizon: "#f2894a", glow: "#ffae5a", halo: "#fff0c2", ground: "#3a2a26", sunDisk: 22 },
    sunColor: "#ff9a52",
    sunI: 2.6,
    hemi: ["#6e6aa0", "#3a2a26", 0.6],
    fog: "#d88a62",
  },
  marsDay: {
    sun: norm([-0.45, 0.75, 0.3]),
    colors: { zenith: "#a97a52", horizon: "#e4b98c", glow: "#f6dcb4", halo: "#fff2dc", ground: "#7a4a2c", sunDisk: 14 },
    sunColor: "#ffe2c0",
    sunI: 3.2,
    hemi: ["#e0b088", "#6a3c24", 0.6],
    fog: "#d8aa80",
  },
  marsDusk: {
    sun: norm([-0.1, 0.2, -1]),
    colors: { zenith: "#3e3a3c", horizon: "#9a7a62", glow: "#5f97e0", halo: "#d6ecff", ground: "#4a2e22", sunDisk: 20 },
    sunColor: "#cfe2ff",
    sunI: 2.4,
    hemi: ["#7f90a8", "#4a2e22", 0.4],
    fog: "#7e6a5e",
  },
};

const SkyLights: React.FC<{ kind: SkyKind; fog?: [number, number] }> = ({ kind, fog = [40, 260] }) => {
  const s = SKIES[kind];
  return (
    <>
      <SkyDome key={kind} sun={s.sun} colors={s.colors} />
      <fog attach="fog" args={[s.fog, fog[0], fog[1]]} />
      <hemisphereLight args={[s.hemi[0], s.hemi[1], s.hemi[2]]} />
      <directionalLight
        position={[s.sun[0] * 60, s.sun[1] * 60 + 6, s.sun[2] * 60]}
        color={s.sunColor}
        intensity={s.sunI}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
      />
    </>
  );
};

// ---------- terrain ----------
type Planet = "earth" | "mars";
export const groundH = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  const far = sm((r - 12) / 40);
  const near = sm((r - 3) / 8);
  return (
    far * (5 * Math.sin(x * 0.04) * Math.cos(z * 0.05 + 0.6) + 2.6 * Math.sin(x * 0.11 + z * 0.07) + 9 * Math.max(0, Math.sin(-z * 0.018 - 0.5))) +
    near * 0.3 * Math.sin(x * 0.7) * Math.sin(z * 0.6)
  );
};
const terrainCache: Partial<Record<Planet, THREE.Mesh>> = {};
const makeTerrain = (p: Planet) => {
  if (terrainCache[p]) return terrainCache[p]!;
  const g = new THREE.PlaneGeometry(520, 520, 200, 200);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const a = new THREE.Color(p === "earth" ? "#4f7a34" : "#9a5530");
  const b = new THREE.Color(p === "earth" ? "#8aa84a" : "#c98250");
  const c = new THREE.Color(p === "earth" ? "#6b6a4a" : "#5e3420");
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = groundH(x, z);
    pos.setY(i, y);
    const n = 0.5 + 0.5 * Math.sin(x * 0.31 + Math.sin(z * 0.23) * 2) * Math.cos(z * 0.27);
    tmp.copy(a).lerp(b, n);
    tmp.lerp(c, Math.min(1, Math.max(0, (y - 4) / 10)) * 0.7);
    col[i * 3] = tmp.r;
    col[i * 3 + 1] = tmp.g;
    col[i * 3 + 2] = tmp.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 }));
  m.receiveShadow = true;
  terrainCache[p] = m;
  return m;
};
const Terrain: React.FC<{ planet: Planet }> = ({ planet }) => {
  const m = useMemo(() => makeTerrain(planet), [planet]);
  return <primitive object={m} />;
};
const on = (x: number, z: number): V3 => [x, groundH(x, z), z];

// ---------- 3D text board ----------
const useLabel = (lines: string[], w: number, h: number, bg: string, fg: string, border?: string) =>
  useMemo(() => {
    const W = 1024;
    const H = Math.max(64, Math.round((W * h) / w));
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const g = cv.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = Math.max(8, H * 0.05);
      g.strokeRect(g.lineWidth, g.lineWidth, W - 2 * g.lineWidth, H - 2 * g.lineWidth);
    }
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    lines.forEach((line, i) => {
      let size = (H / lines.length) * 0.6;
      g.font = `800 ${size}px "Manrope", "Arial Black", sans-serif`;
      const m = g.measureText(line).width;
      if (m > W * 0.86) size *= (W * 0.86) / m;
      g.font = `800 ${size}px "Manrope", "Arial Black", sans-serif`;
      g.fillText(line, W / 2, (H / lines.length) * (i + 0.5));
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.join("|"), w, h, bg, fg, border]);

const Board: React.FC<{ lines: string[]; w: number; h: number; bg?: string; fg?: string; border?: string; position?: V3; rotation?: V3; glow?: number }> = ({
  lines, w, h, bg = "#14202e", fg = "#ffffff", border = "#7cc4ff", position, rotation, glow = 0.35,
}) => {
  const tex = useLabel(lines, w, h, bg, fg, border);
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={glow} roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------- worlds ----------
const Signpost: React.FC<{ position: V3; rotation?: V3 }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    {[-1.3, 1.3].map((x) => (
      <mesh key={x} position={[x, 1.2, -0.05]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 2.4, 10]} />
        <meshStandardMaterial color="#5b3b22" roughness={0.85} />
      </mesh>
    ))}
    <mesh position={[0, 2.25, -0.08]} castShadow>
      <RoundedBoxGeo args={[3.4, 1.15, 0.12]} radius={0.04} />
      <meshStandardMaterial color="#6e4a2a" roughness={0.8} />
    </mesh>
    <Board lines={["AUDIRA SAINS"]} w={3.1} h={0.9} position={[0, 2.25, 0]} glow={0.5} />
  </group>
);

const EarthSet: React.FC<{ child?: boolean; sign?: boolean }> = ({ child = false, sign = false }) => (
  <group>
    <Terrain planet="earth" />
    <AssetModel id="gabled-farmhouse-c7534f" assetType="building" size={9} ground position={on(-8, -15)} rotation={[0, 0.5, 0]} />
    <AssetModel id="tall-pine-tree-ab4108" assetType="prop" size={9} ground position={on(7, -13)} />
    <AssetModel id="tall-pine-tree-ab4108" assetType="prop" size={11} ground position={on(11, -21)} rotation={[0, 1, 0]} />
    <AssetModel id="tall-pine-tree-ab4108" assetType="prop" size={10} ground position={on(-16, -22)} rotation={[0, 2, 0]} />
    <AssetModel id="tall-pine-tree-ab4108" assetType="prop" size={8} ground position={on(-3, -24)} rotation={[0, 0.4, 0]} />
    <AssetModel id="large-coastal-boulder-a2cab1" assetType="prop" size={2.2} ground position={on(4.2, 0.5)} rotation={[0, 0.7, 0]} />
    <AssetModel id="large-coastal-boulder-a2cab1" assetType="prop" size={1.3} ground position={on(-4.5, 2.5)} rotation={[0, 2.1, 0]} />
    {child && <AssetModel id="child-with-a-painted-b8a19f" assetType="character" size={1.7} ground position={on(1.3, 2.4)} rotation={[0, Math.PI * 0.92, 0]} />}
    {sign && <Signpost position={on(-2.4, -1)} rotation={[0, 0.2, 0]} />}
  </group>
);

const MarsSet: React.FC<{ t: number; dust?: boolean }> = ({ t, dust = false }) => (
  <group>
    <Terrain planet="mars" />
    <AssetModel id="exploration-rover-7afd91" assetType="vehicle" size={3.6} ground position={on(2.2, -1.5)} rotation={[0, -0.7, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={2.4} ground position={on(-3.6, 1.6)} rotation={[0, 0.8, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={1.2} ground position={on(5.2, 2.2)} rotation={[0, 2.4, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={0.8} ground position={on(-0.6, 3.4)} rotation={[0, 1.1, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={0.6} ground position={on(4.4, 4.6)} rotation={[0, 0.3, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={1.6} ground position={on(-1.8, -5)} rotation={[0, 2.9, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={4.5} ground position={on(-9, -12)} rotation={[0, 1.3, 0]} />
    <AssetModel id="regolith-boulder-1f1f14" assetType="prop" size={3.2} ground position={on(10, -16)} />
    {dust &&
      Array.from({ length: 60 }, (_, i) => {
        const x = ((rnd(i) * 30 + t * (1.2 + rnd(i + 9))) % 30) - 15;
        return (
          <mesh key={i} position={[x, 0.3 + rnd(i + 3) * 5, -8 + rnd(i + 5) * 12]}>
            <sphereGeometry args={[0.035 + rnd(i + 7) * 0.05, 6, 4]} />
            <meshBasicMaterial color="#f0c28c" transparent opacity={0.55} />
          </mesh>
        );
      })}
  </group>
);

// ---------- sub-scenes ----------
type SP = { t: number; f: number };

const MarsDusk: React.FC<SP> = ({ t }) => (
  <group>
    <SkyLights kind="marsDusk" fog={[30, 200]} />
    <MarsSet t={t} />
    <pointLight position={[2, 3, 3]} intensity={6} distance={14} color="#9ec4ff" />
  </group>
);
const MarsDay: React.FC<SP> = ({ t }) => (
  <group>
    <SkyLights kind="marsDay" fog={[20, 150]} />
    <MarsSet t={t} dust />
  </group>
);
const EarthDay: React.FC<SP & { child?: boolean }> = ({ child = false }) => (
  <group>
    <SkyLights kind="earthDay" />
    <EarthSet child={child} />
  </group>
);
const EarthDusk: React.FC<SP> = () => (
  <group>
    <SkyLights kind="earthDusk" fog={[30, 220]} />
    <EarthSet sign child={false} />
  </group>
);

/** Concept scenes float in the open sky: day dome behind, soft key light, no ground. */
const AirSpace: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <group>
    <SkyDome key="air" sun={SKIES.earthDay.sun} colors={SKIES.earthDay.colors} />
    <hemisphereLight args={["#cfe6ff", "#7a8aa0", 1.1]} />
    <directionalLight position={[8, 14, 10]} intensity={2.4} color="#fff3dc" />
    {children}
  </group>
);

const SPEC = ["#ff3b30", "#ff8a1f", "#ffd60a", "#34c759", "#2f7bff", "#4b3bd6", "#a03bff"];

const SunWhite: React.FC<SP> = ({ t, f }) => {
  const mix = sm((t - 11.86) / 1.0);
  const sun: V3 = [-3.6, 6.2, -1];
  const end: V3 = [3.4, 1.0, 1.2];
  return (
    <AirSpace>
      <SunDisc f={f} position={sun} scale={2.6} />
      <LightBeam f={f} from={[-2.2, 5.2, -0.6]} to={lerp3([-2.2, 5.2, -0.6], end, sm((t - 8.33) / 1.2))} width={0.5} photons={7} color="#fff8e8" />
      {SPEC.map((c, i) => {
        const off = (i - 3) * 0.32 * mix;
        const a: V3 = [0.6, 2.6 + off * 0.3, 0.4];
        const b: V3 = [3.6 + mix * 0.6, 0.6 + off, 1.4 + off * 0.2];
        return mix > 0.02 ? <LightBeam key={c} f={f + i * 5} from={a} to={b} width={0.13} photons={2} color={c} /> : null;
      })}
    </AirSpace>
  );
};

const Prism: React.FC<{ position: V3 }> = ({ position }) => (
  <mesh position={position} rotation={[0, Math.PI / 6, 0]} castShadow>
    <cylinderGeometry args={[0.75, 0.75, 1.3, 3]} />
    <meshPhysicalMaterial color="#e8f6ff" roughness={0.04} metalness={0} transmission={0.92} thickness={0.8} ior={1.5} clearcoat={1} transparent opacity={0.9} />
  </mesh>
);

const NewtonRoom: React.FC<SP> = ({ t, f }) => {
  const hole: V3 = [-8, 4.6, 0];
  const prism: V3 = [0, 2.95, 0];
  const beamIn = sm((t - 18.2) / 1.1);
  const fan = sm((t - 19.5) / 1.4);
  const dim = 0.35 + 0.65 * (1 - beamIn);
  return (
    <group>
      <color attach="background" args={["#0c0907"]} />
      <ambientLight intensity={0.25 * dim + 0.06} color="#ffd7a8" />
      <spotLight position={[3, 11, 8]} angle={0.6} penumbra={0.9} intensity={60 * dim + 10} distance={40} decay={1.5} color="#ffd9a3" castShadow />
      {/* floor + walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial color="#3a2616" roughness={0.85} />
      </mesh>
      <mesh position={[0, 5, -6]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#2c1e14" roughness={0.9} />
      </mesh>
      <mesh position={[-8.2, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#33231a" roughness={0.9} />
      </mesh>
      {/* the hole in the shutter */}
      <mesh position={[-8.15, 4.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color="#fffbe8" toneMapped={false} />
      </mesh>
      {/* screen wall on the right */}
      <mesh position={[7.9, 3.4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 5.6]} />
        <meshStandardMaterial color="#e9dcc2" roughness={0.9} />
      </mesh>
      {/* table */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[3, 0.16, 2]} radius={0.04} />
        <meshStandardMaterial color="#6b4527" roughness={0.75} />
      </mesh>
      {[[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.1, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.2, 10]} />
          <meshStandardMaterial color="#5a391f" roughness={0.8} />
        </mesh>
      ))}
      <Prism position={prism} />
      <AssetModel id="wooden-crate-e46521" assetType="prop" size={2.2} ground position={[-3.4, 0, 2.2]} rotation={[0, 0.5, 0]} />
      <AssetModel id="wooden-crate-e46521" assetType="prop" size={1.6} ground position={[-4.6, 0, 0.6]} rotation={[0, 1.2, 0]} />
      <group position={[2.4, 0, 2.6]}>
        <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={1.4} ground />
        <pointLight position={[0, 1, 0]} intensity={5} distance={9} color="#ffb35c" />
      </group>
      <Board lines={["NEWTON · 1666"]} w={3.2} h={0.7} bg="#e9dcc2" fg="#2c1e14" border="#6b4527" position={[0.5, 7.4, -5.95]} glow={0.15} />
      {beamIn > 0.01 && <LightBeam f={f} from={hole} to={lerp3(hole, [-0.55, 2.95, 0], beamIn)} width={0.34} photons={6} color="#fff6dd" />}
      {fan > 0.01 &&
        SPEC.map((c, i) => {
          const end: V3 = [7.8, 4.9 - i * 0.48, -0.9 + i * 0.3];
          return (
            <group key={c}>
              <LightBeam f={f + i * 4} from={[0.45, 2.95, 0]} to={lerp3([0.45, 2.95, 0], end, fan)} width={0.14} photons={2} color={c} />
              <mesh position={[7.85, end[1], end[2]]} rotation={[0, -Math.PI / 2, 0]} scale={fan}>
                <planeGeometry args={[0.9, 0.5]} />
                <meshBasicMaterial color={c} toneMapped={false} transparent opacity={0.85} />
              </mesh>
            </group>
          );
        })}
      {fan > 0.01 && <pointLight position={[6.5, 3.2, 0]} intensity={18 * fan} distance={10} color="#ffffff" />}
    </group>
  );
};

const MOLS = Array.from({ length: 9 }, (_, i) => ({
  p: [-2.2 + rnd(i) * 4.4, 3.0 + rnd(i + 20) * 3.6, -4.5 + rnd(i + 40) * 4] as V3,
  gas: (i % 4 === 3 ? "O2" : "N2") as "N2" | "O2",
  s: 0.6 + rnd(i + 60) * 0.25,
}));

const Molecules: React.FC<SP> = ({ t, f }) => {
  const wave = sm((t - 26.6) / 1.0);
  return (
    <AirSpace>
      {MOLS.map((m, i) => (
        <AirMolecule key={i} f={f} gas={m.gas} seed={i} position={[m.p[0] + Math.sin(t * 0.5 + i) * 0.3, m.p[1] + Math.cos(t * 0.6 + i) * 0.2, m.p[2]]} scale={m.s} />
      ))}
      <LightBeam f={f} from={[-9, 9, -3]} to={[-1.2, 4.6, -0.5]} width={0.42} photons={6} color="#fff8e6" />
      {wave > 0.01 && <WaveRibbon f={f} wavelength={4.2} length={13 * wave + 0.5} amplitude={1.3} thickness={0.13} color="#4f8dff" position={[0, 4, 0.8]} ruler />}
    </AirSpace>
  );
};

const WaveCompare: React.FC<SP> = ({ t, f }) => {
  const strong = sm((t - 32.7) / 0.8);
  return (
    <AirSpace>
      <WaveRibbon f={f} wavelength="short" length={8} amplitude={0.34 + 0.12 * strong} thickness={0.08 + 0.05 * strong} position={[0, 5.0, 0]} scale={1.25} />
      <WaveRibbon f={f} wavelength="long" length={8} thickness={0.08} position={[0, 2.0, 0]} scale={1.25} />
      <Board lines={["BIRU · 450 nm"]} w={2.6} h={0.6} bg="#0f2347" position={[-0.6, 4.05, -0.3]} />
      <Board lines={["MERAH · 700 nm"]} w={2.8} h={0.6} bg="#3d1210" border="#ff6b5a" position={[-0.4, 3.12, -0.3]} />
    </AirSpace>
  );
};

const Scatter: React.FC<SP> = ({ t, f }) => (
  <AirSpace>
    <ScatterBurst f={f} gas="N2" directions={8} position={[0, 3.6, 0]} scale={2.3} />
    {MOLS.slice(0, 6).map((m, i) => (
      <AirMolecule key={i} f={f} gas={m.gas} seed={i} position={[m.p[0] * 1.4, m.p[1] + 0.5, -6 + m.p[2]]} scale={0.6} />
    ))}
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + t * 0.2;
      const r = 5.5 + ((t * 2 + i) % 3);
      return <WaveRibbon key={i} f={f + i * 9} wavelength={0.4} amplitude={0.14} thickness={0.05} length={1.6} ruler={false} color="#4f8dff" position={[Math.cos(a) * r, 3.6 + Math.sin(a) * r, -2]} rotation={[0, 0, a]} />;
    })}
  </AirSpace>
);

const Eye: React.FC<{ position: V3; t: number }> = ({ position, t }) => (
  <group position={position} rotation={[0, 0.85 + 0.15 * Math.sin(t * 0.7), 0.06 * Math.sin(t * 0.9)]}>
    <mesh castShadow>
      <sphereGeometry args={[1.9, 48, 32]} />
      <meshPhysicalMaterial color="#f6f2ec" roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
    <mesh position={[-1.86, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <circleGeometry args={[0.9, 40]} />
      <meshStandardMaterial color="#3f74b8" roughness={0.5} />
    </mesh>
    <mesh position={[-1.875, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <circleGeometry args={[0.4, 32]} />
      <meshStandardMaterial color="#0a0a0c" roughness={0.3} />
    </mesh>
    <mesh position={[-1.25, 0, 0]}>
      <sphereGeometry args={[0.95, 32, 24]} />
      <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.02} transparent opacity={0.25} />
    </mesh>
  </group>
);

const VioletEye: React.FC<SP> = ({ t, f }) => {
  const weak = sm((t - 49.2) / 0.8);
  return (
    <AirSpace>
      <SunDisc f={f} position={[-5.4, 6.4, -1.5]} scale={1.5} />
      <Eye position={[2.4, 3.6, 0]} t={t} />
      <WaveRibbon f={f} wavelength={0.32} length={5.6} amplitude={0.22 - 0.12 * weak} thickness={0.07 - 0.04 * weak} color="#a03bff" ruler={false} position={[-1.2, 5.0, 0]} rotation={[0, 0, -0.22]} />
      <WaveRibbon f={f + 20} wavelength="short" length={5.6} thickness={0.08} ruler={false} position={[-1.3, 3.6, 0]} />
      <WaveRibbon f={f + 40} wavelength={0.62} length={5.6} amplitude={0.26} thickness={0.08} color="#34c759" ruler={false} position={[-1.2, 2.2, 0]} rotation={[0, 0, 0.22]} />
      <Board lines={["UNGU"]} w={1.8} h={0.62} bg="#2a0f47" border="#a03bff" position={[-0.3, 5.75, 0.4]} />
    </AirSpace>
  );
};

const PathDiagram: React.FC<SP> = ({ t, f }) => {
  const dusk = sm((t - 53.3) / 1.4);
  const lose = sm((t - 57.6) / 1.0);
  const obs: V3 = [0, 4.62, 0];
  const segs: [V3, V3, string][] = [
    [[-5.3, 4.62, 0], [-3.9, 4.62, 0], "#fff6dd"],
    [[-3.9, 4.62, 0], [-2.6, 4.62, 0], "#ffe08a"],
    [[-2.6, 4.62, 0], [-1.3, 4.62, 0], "#ffa648"],
    [[-1.3, 4.62, 0], [-0.25, 4.62, 0], "#ff5a2c"],
  ];
  return (
    <group>
      <color attach="background" args={["#0d1630"]} />
      <hemisphereLight args={["#bcd6ff", "#1a2030", 1.0]} />
      <directionalLight position={[-10, 10, 12]} intensity={2.6} color="#fff3dc" />
      <mesh>
        <sphereGeometry args={[4.5, 64, 48]} />
        <meshStandardMaterial color="#2a68b6" roughness={0.55} />
      </mesh>
      {[[0.9, 0.35, 0.2], [-0.4, -0.5, 0.75], [0.1, 0.9, 0.42], [-0.85, 0.3, 0.42]].map((d, i) => {
        const n = norm(d as V3);
        return (
          <mesh key={i} position={[n[0] * 4.3, n[1] * 4.3, n[2] * 4.3]} scale={[1.8, 0.5, 1.4]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n))}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#4f9a46" roughness={0.8} />
          </mesh>
        );
      })}
      <mesh>
        <sphereGeometry args={[7, 64, 48]} />
        <meshPhysicalMaterial color="#7fc0ff" transparent opacity={0.16} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* observer pin */}
      <group position={obs}>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.22, 0.6, 16]} />
          <meshStandardMaterial color="#ffc93c" emissive="#ffc93c" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshStandardMaterial color="#ffc93c" emissive="#ffc93c" emissiveIntensity={0.4} />
        </mesh>
      </group>
      {/* noon: short path straight down */}
      <SunDisc f={f} position={[0, 11.5, 0]} scale={0.9} />
      <LightBeam f={f} from={[0, 10.4, 0]} to={[0, 5.4, 0]} width={0.3} photons={4} color="#fff6dd" />
      <Board lines={["SIANG: JALUR PENDEK"]} w={3.6} h={0.55} position={[-2.2, 7.6, 0.2]} />
      {/* dusk: long path along the horizon */}
      <SunDisc f={f} position={[-13, 4.62, 0]} scale={0.9} palette={{ primary: "#ff9a3c", glow: "#ffd1a0" }} />
      <LightBeam f={f} from={[-12, 4.62, 0]} to={lerp3([-12, 4.62, 0], [-5.3, 4.62, 0], dusk)} width={0.3} photons={4} color="#fff6dd" />
      {segs.map(([a, b, c], i) => {
        const k = sm((dusk - i * 0.12 - 0.3) / 0.2);
        return k > 0.01 ? <LightBeam key={i} f={f + i * 6} from={a} to={lerp3(a, b, k)} width={0.3} photons={2} color={c} /> : null;
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const x0 = -5 + (i / 13) * 4.6;
        const k = ((t * 0.7 + rnd(i)) % 1) * Math.max(dusk, lose);
        return (
          <mesh key={i} position={[x0 + k * 0.5, 4.62 + k * (1.2 + rnd(i + 5) * 2.2), (rnd(i + 9) - 0.5) * 2 * k]}>
            <sphereGeometry args={[0.12, 12, 8]} />
            <meshBasicMaterial color="#4f8dff" toneMapped={false} transparent opacity={(1 - k) * dusk} />
          </mesh>
        );
      })}
      <Board lines={["SENJA: JALUR PANJANG"]} w={3.8} h={0.55} bg="#3d1a0c" border="#ffa648" position={[-4.6, 6.4, 0.2]} />
    </group>
  );
};

// ---------- director: which world is on screen ----------
const Director: BeatContent = ({ t: tv, frame, fps }) => {
  const f = (frame / fps) * 60;
  const t = A(tv);
  const p = { t, f };
  if (t < 2.1) return <MarsDusk {...p} />;
  if (t < 4.3) return <EarthDay {...p} />;
  if (t < 8.2) return <EarthDusk {...p} />;
  if (t < 13.6) return <SunWhite {...p} />;
  if (t < 21.8) return <NewtonRoom {...p} />;
  if (t < 29.6) return <Molecules {...p} />;
  if (t < 36.0) return <WaveCompare {...p} />;
  if (t < 40.5) return <Scatter {...p} />;
  if (t < 46.9) return <EarthDay {...p} />;
  if (t < 53.0) return <VioletEye {...p} />;
  if (t < 59.6) return <PathDiagram {...p} />;
  if (t < 61.6) return <EarthDusk {...p} />;
  if (t < 66.3) return <MarsDay {...p} />;
  if (t < 73.7) return <MarsDusk {...p} />;
  return <EarthDay {...p} />;
};

// ---------- camera ----------
const F = (target: V3, az: number, el: number, dist: number, fov = 34): Framing => ({ target, az, el, dist, fov });
const START = F([1.4, 3.4, -4], 10, 0, 17, 46);
const KEYS: [number, Framing][] = [
  [0, START],
  [2.0, F([1.6, 3.4, -4], 3, -1, 14.5, 46)],
  [2.2, F([0, 6, -6], 16, -14, 13.5)],
  [4.2, F([0, 7, -6], 6, -18, 12)],
  [4.4, F([-1.2, 2.6, -4], -12, 3, 13)],
  [8.1, F([-1.6, 2.6, -4], 4, 4, 10.5)],
  [8.3, F([0, 3.8, 0], 12, -6, 17)],
  [13.5, F([0.6, 3.4, 0], -8, -4, 14)],
  [13.7, F([0, 3.4, 0], 22, 8, 18)],
  [18.2, F([-2, 3.6, 0], 12, 6, 14)],
  [19.4, F([0.8, 3.1, 0], 18, 8, 15)],
  [21.7, F([3.2, 3.2, 0], 6, 6, 13.5)],
  [21.9, F([0, 4.2, -1], 10, -6, 16)],
  [26.7, F([0, 4.2, -1], -4, -4, 15)],
  [29.5, F([0, 4.2, 0], -10, -6, 15)],
  [29.7, F([0, 4.0, 0], 0, 0, 14.5)],
  [35.9, F([0, 4.0, 0], 6, 2, 12.5)],
  [36.1, F([0, 3.6, 0], -6, 0, 11)],
  [40.4, F([0, 3.6, 0], 6, 0, 16)],
  [40.6, F([-2, 6, -18], -6, 4, 56)],
  [46.8, F([-1, 9, -18], 4, -2, 50)],
  [47.0, F([1.4, 3.9, 0], 10, 4, 21)],
  [52.9, F([1.6, 3.7, 0], 6, 2, 18.5)],
  [53.1, F([-2.5, 3.6, 0], 0, 6, 27)],
  [59.5, F([-3, 4.4, 0], 8, 6, 19)],
  [59.7, F([-2.6, 2.7, -3], 8, 3, 16)],
  [61.5, F([-2.6, 2.7, -3], 0, 3, 15)],
  [61.7, F([1.6, 1.8, -1.5], 32, 6, 13)],
  [66.2, F([1.6, 1.8, -1.5], 14, 5, 11.5)],
  [66.4, F([1.2, 3.6, -5], -6, 0, 16, 46)],
  [73.6, F([1.6, 3.6, -4], 0, -2, 14, 46)],
  [73.8, F([0, 4, -6], 12, -6, 19)],
  [80, F([0, 8, -6], 0, -20, 15)],
  [83, F([0, 8.5, -6], -2, -22, 14.5)],
];
const ALL_SHOTS: { at: number; move: Move }[] = KEYS.map(([at, f]) => ({ at: R(at), move: frameTo(f) }));

// ---------- HUD cards ----------
type Card = { a: number; b: number; title: string; sub?: string; count?: { from: number; to: number; pre?: string; post?: string } };
const CARDS: Card[] = [
  { a: 0.25, b: 2.08, title: "DI MARS", sub: "senjanya biru" },
  { a: 2.35, b: 4.28, title: "DI BUMI", sub: "siangnya biru" },
  { a: 4.33, b: 5.38, title: "SENJA JINGGA" },
  { a: 5.42, b: 8.15, title: "KENAPA?" },
  { a: 8.33, b: 11.8, title: "CAHAYA MATAHARI", sub: "kelihatannya putih" },
  { a: 11.86, b: 13.55, title: "PUTIH = SEMUA WARNA" },
  { a: 13.71, b: 18.25, title: "1666", sub: "Isaac Newton", count: { from: 1600, to: 1666 } },
  { a: 19.43, b: 21.75, title: "PRISMA KACA", sub: "cahaya pecah jadi pelangi" },
  { a: 21.5, b: 29.4, title: "NITROGEN & OKSIGEN", sub: "molekul udara" },
  { a: 26.81, b: 29.55, title: "", sub: "lebih kecil dari gelombangnya", count: { from: 1, to: 1200, pre: "±", post: "×" } },
  { a: 29.69, b: 32.6, title: "GELOMBANG PENDEK", sub: "makin kuat dihamburkan · I ∝ 1/λ⁴" },
  { a: 32.69, b: 35.95, title: "", sub: "biru vs merah · 450 vs 700 nm", count: { from: 1, to: 6, pre: "≈ ", post: "×" } },
  { a: 36.05, b: 40.4, title: "BIRU TERPENTAL", sub: "ke seluruh langit" },
  { a: 40.82, b: 44.5, title: "JOHN TYNDALL", sub: "melihat efeknya · 1869" },
  { a: 44.57, b: 46.85, title: "LORD RAYLEIGH", sub: "menghitungnya · 1871" },
  { a: 47.54, b: 51.3, title: "UNGU?", sub: "terhambur lebih kuat lagi" },
  { a: 51.38, b: 52.95, title: "MATA KURANG PEKA", sub: "dan Matahari sedikit ungu" },
  { a: 53.19, b: 55.65, title: "SAAT SENJA", sub: "Matahari rendah" },
  { a: 55.76, b: 59.5, title: "", sub: "udara yang ditembus lebih tebal", count: { from: 1, to: 38, pre: "±", post: "×" } },
  { a: 59.65, b: 61.55, title: "BIRU HABIS", sub: "tinggal merah & jingga" },
  { a: 61.95, b: 66.2, title: "MARS", sub: "udara tipis · debu halus" },
  { a: 66.75, b: 69.95, title: "SENJA MARS: BIRU", sub: "debu meloloskan biru" },
  { a: 70.02, b: 73.6, title: "CURIOSITY", sub: "15 April 2015 · sol 956" },
  { a: 73.86, b: 76.8, title: "LANGIT TIDAK BERWARNA" },
  { a: 76.89, b: 79.6, title: "CAHAYA YANG TERSESAT", sub: "ikuti AUDIRA Sains" },
];

const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");

const CardView: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const k = Math.min(sm((t - c.a) / 0.3), 1 - sm((t - (c.b - 0.25)) / 0.25));
  if (k <= 0.001) return null;
  const title = c.count ? `${c.count.pre ?? ""}${fmt(c.count.from + (c.count.to - c.count.from) * sm((t - c.a) / 1.3))}${c.count.post ?? ""}` : c.title;
  const big = !!c.count || title.length <= 8;
  const pop = 1 + 0.06 * Math.max(0, 1 - (t - c.a) / 0.25) * (t > c.a ? 1 : 0);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 262, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * -30}px) scale(${(0.94 + 0.06 * k) * pop})` }}>
      <div style={{ background: "rgba(20,14,12,0.82)", border: "4px solid #7cc4ff", borderRadius: 22, padding: "24px 46px 28px", textAlign: "center", boxShadow: "0 18px 44px rgba(0,0,0,0.45)", maxWidth: 960 }}>
        <div style={{ fontFamily: DISPLAY.condensed, fontSize: big ? 150 : 96, lineHeight: 1.02, color: "#ffffff", letterSpacing: 1 }}>{title}</div>
        {c.sub && <div style={{ marginTop: 10, fontFamily: DISPLAY.body, fontWeight: 700, fontSize: 46, lineHeight: 1.18, color: "#cfe6ff" }}>{c.sub}</div>}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ p: BeatProps; scale: number }> = ({ p, scale }) => {
  const { t: tv, frame, fps } = p;
  const t = A(tv);
  return (
    <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      {CARDS.map((c, i) => (t > c.a - 0.1 && t < c.b + 0.1 ? <CardView key={i} c={c} t={t} /> : null))}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080 * scale, height: 1920 * scale, transform: `scale(${1 / scale})`, transformOrigin: "0 0" }}>
        {tv < VO_END + 0.3 && (
          <Subtitle words={WORDS} frame={frame} fps={fps} offset={0} maxWords={5} size={58} activeColor="#7cc4ff" baseColor="rgba(255,255,255,0.9)" plate="rgba(12,16,24,0.62)" position={1300} />
        )}
        <AudiraSignature seed="sains-anak-ep01-langit-biru" outroSeconds={OUTRO_SECONDS} />
        <AudiraOutro seconds={OUTRO_SECONDS} />
      </div>
    </div>
  );
};

const config: FilmConfig = {
  beats: BEATS,
  startFraming: START,
  shots: { hook: ALL_SHOTS, context: [], main: [], explanation: [], payoff: [], outro: [] },
  scenes: { hook: Director, context: Director, main: Director, explanation: Director, payoff: Director, outro: Director },
  background: "#bcd9f2",
  hdri: "sky",
  envIntensity: 0.55,
  exposure: 1,
  profile: COLOR_PROFILES.DOCUMENTARY_WARM,
  ao: true,
  overlay: (scale, _beat, props) => <Overlay p={props} scale={scale} />,
  fade: { in: 0.25, out: 0.4, color: "#000000" },
  alive: { deg: 1.2, breath: 0.01, seed: 1 },
  lens: { aperture: 2.8, maxBlur: 0.002 },
};

export const LangitBiruFilm: React.FC = () => <FilmFromConfig config={config} />;
