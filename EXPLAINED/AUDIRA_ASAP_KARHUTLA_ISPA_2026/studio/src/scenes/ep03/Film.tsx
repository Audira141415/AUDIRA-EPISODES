// EP03 film (VISUALINVESTIGATION): one long forensic desk, one camera that never stops gliding.
// Stations from top of the desk to the bottom: CELIOS dossier -> viral chart -> formula column
// (coins = people) -> Kalteng clipping + province tags -> map of Tanah Papua with towers ->
// El Nino / NASA cards -> outro note. Every beat is keyed to word times in timeline.json
// (Audio Master Clock). Audio is muxed separately by the lead.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { Outro } from "../_shared/Outro.tsx";
import { deskTexture, mapUV, smokeTexture, tentTexture, MAP_W, MAP_H } from "./coverTextures.ts";
import {
  chartTexture,
  stampPasien,
  stampKali,
  dossierTexture,
  tagTexture,
  cardPenduduk,
  cardPrev,
  cardKali,
  cardHasil,
  kaltengTexture,
  fireTexture,
  filmMap,
  labelTexture,
  elninoTexture,
  nasaTexture,
  NASA_BARS_U,
  needTexture,
  highlightTexture,
} from "./filmTextures.ts";
import TL from "./timeline.json";

// ------------------------------------------------------------------ clock (timeline.json)
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; words: Word[] };
const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
const backOut = (x: number) => {
  const k = clamp01(x) - 1;
  return 1 + 2.2 * k * k * k + 1.2 * k * k;
};

const T = {
  hJuta: W("hook", 1),
  hPapua: W("hook", 7),
  hBukan: W("hook", 15),
  kStart: SEC.KONTEKS[0],
  kCelios: W("konteks", 6),
  kNov: W("konteks", 7),
  kBukan: W("konteks", 10),
  kKemenkes: W("konteks", 12),
  kBnpb: W("konteks", 14),
  kPembuat: W("konteks", 15),
  kEstimasi: W("konteks", 20),
  pStart: SEC.PENGEMBANGAN[0],
  pPenduduk: W("pengembangan", 3),
  p14: W("pengembangan", 7),
  pDikali: W("pengembangan", 9),
  p19: W("pengembangan", 14),
  pCelios: W("pengembangan", 17),
  pTertinggi: W("pengembangan", 22),
  pDikali2: W("pengembangan", 26),
  p178: W("pengembangan", 28),
  pHasil: W("pengembangan", 29),
  p463: W("pengembangan", 30),
  pPengali: W("pengembangan", 34),
  pKalteng: W("pengembangan", 42),
  pDipakai: W("pengembangan", 45),
  pSemua: W("pengembangan", 49),
  jStart: SEC.PENJELASAN[0],
  jPeringkat: W("penjelasan", 1),
  jLama: W("penjelasan", 6),
  jSelatan: W("penjelasan", 13),
  j37: W("penjelasan", 21),
  jKalau: W("penjelasan", 23),
  jNasional: W("penjelasan", 28),
  j54: W("penjelasan", 31),
  jItu: W("penjelasan", 34),
  yStart: SEC.PAYOFF[0],
  yElnino: W("payoff", 3),
  yKering: W("payoff", 12),
  yNasa: W("payoff", 13),
  yKetiga: W("payoff", 21),
  yAsap: W("payoff", 26),
  yTimika: W("payoff", 31),
  yWamena: W("payoff", 33),
  yNabire: W("payoff", 35),
  y3: W("payoff", 40),
  oStart: SEC.OUTRO[0],
  oBaca: W("outro", 7),
  outroCard: SEC.OUTRO[1] + 0.2,
};

type V3 = [number, number, number];
const BG = "#0B0C0E";
const RED = "#D8311C";

// ------------------------------------------------------------------ camera path
// Keys: time, look target (x,z), height, back ratio (camera z = target z + h*b), side offset.
type Key = [number, number, number, number, number, number];
const KEYS: Key[] = [
  [0, 0, -9.35, 6.9, 0.42, 0.15],
  [T.hBukan + 0.7, 0, -9.45, 6.5, 0.42, 0.05],
  [T.kCelios - 1.4, 0, -12.35, 7.3, 0.4, -0.1],
  [T.kBukan, 0, -12.25, 7.2, 0.42, 0.05],
  [T.kBnpb + 0.3, 0, -12.0, 7.4, 0.42, 0.1],
  [T.kPembuat + 0.8, 0.02, -7.95, 5.7, 0.4, 0.1],
  [SEC.KONTEKS[1] - 0.2, 0.02, -7.9, 5.2, 0.4, -0.05],
  [T.pPenduduk - 0.6, 0, -5.25, 6.8, 0.42, 0],
  [T.pDikali - 0.3, 0, -4.55, 7.2, 0.42, 0.1],
  [T.p19 + 0.4, 0, -3.65, 7.4, 0.42, -0.05],
  [T.pDikali2 - 0.3, 0, -3.25, 7.6, 0.42, 0.05],
  [T.p463, 0, -1.85, 8.2, 0.42, 0],
  [T.pPengali, 0, -1.1, 7.8, 0.42, 0.1],
  [T.pKalteng - 1.0, 0.1, 0.25, 6.8, 0.42, 0],
  [T.pDipakai, 0, 1.2, 8.0, 0.42, -0.1],
  [SEC.PENGEMBANGAN[1], 0, 1.45, 8.0, 0.45, 0],
  [T.jPeringkat + 0.4, 0, 4.85, 7.4, 0.95, 0.3],
  [T.jSelatan - 0.3, 0.3, 5.1, 6.8, 0.95, 0.5],
  [T.j37 + 0.4, 0.4, 5.0, 6.9, 0.9, -0.2],
  [T.jNasional + 0.4, 0.1, 5.05, 6.6, 0.95, 0.4],
  [SEC.PENJELASAN[1] - 0.4, 0.1, 5.0, 7.2, 0.85, 0.2],
  [T.yElnino - 0.2, 0.6, 5.0, 9.2, 0.55, 0],
  [T.yKering - 1.2, 3.3, 4.35, 6.0, 0.45, 0],
  [T.yNasa - 0.1, 3.3, 4.6, 5.9, 0.45, 0.05],
  [T.yKetiga - 1.4, 3.3, 5.8, 6.2, 0.48, 0],
  [T.yAsap - 0.4, 3.3, 5.9, 6.0, 0.48, -0.05],
  [T.yTimika + 0.3, 0.2, 5.0, 7.8, 0.7, 0],
  [T.y3, -0.75, 4.55, 6.8, 0.65, 0.1],
  [T.oStart + 0.2, 0, 5.2, 7.6, 0.6, 0],
  [T.oBaca + 0.2, 0, 5.95, 10.6, 0.5, 0],
  [TOTAL, 0, 6.05, 11.4, 0.5, 0],
];

/** Cubic Hermite through time-keyed values (Catmull-Rom tangents): velocity never drops to zero. */
function hermite(t: number, j: number): number {
  const n = KEYS.length;
  if (t <= KEYS[0][0]) return KEYS[0][j];
  if (t >= KEYS[n - 1][0]) return KEYS[n - 1][j];
  let i = 0;
  while (i < n - 2 && t > KEYS[i + 1][0]) i++;
  const k0 = KEYS[i], k1 = KEYS[i + 1];
  const kp = KEYS[Math.max(0, i - 1)], kn = KEYS[Math.min(n - 1, i + 2)];
  const dt = k1[0] - k0[0];
  const m0 = ((k1[j] - kp[j]) / Math.max(0.001, k1[0] - kp[0])) * dt;
  const m1 = ((kn[j] - k0[j]) / Math.max(0.001, kn[0] - k0[0])) * dt;
  const s = (t - k0[0]) / dt;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * k0[j] + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * k1[j] + (s3 - s2) * m1;
}

function camPose(t: number) {
  const tx = hermite(t, 1), tz = hermite(t, 2), h = hermite(t, 3), b = hermite(t, 4), sx = hermite(t, 5);
  // slow handheld-free drift so even "holds" keep moving
  const dx = Math.sin(t * 0.21) * 0.06, dz = Math.cos(t * 0.17) * 0.05;
  const pos = new THREE.Vector3(tx + sx + dx, h, tz + h * b + dz);
  const look = new THREE.Vector3(tx + dx * 0.3, 0, tz + dz * 0.3);
  return { pos, look };
}
const camQuat = (t: number) => {
  const { pos, look } = camPose(t);
  const m = new THREE.Matrix4().lookAt(pos, look, new THREE.Vector3(0, 1, 0));
  return { pos, look, q: new THREE.Quaternion().setFromRotationMatrix(m) };
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const spot = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => {
    const { pos, look } = camPose(t);
    camera.position.copy(pos);
    camera.lookAt(look);
    camera.updateProjectionMatrix();
    if (spot.current) {
      spot.current.position.set(look.x - 3.2, 6.5, look.z - 1.75);
      spot.current.target.position.copy(look);
      spot.current.target.updateMatrixWorld();
    }
  }, [camera, t]);
  return (
    <spotLight
      ref={spot}
      intensity={150}
      angle={0.68}
      penumbra={0.75}
      decay={2}
      color="#FFE2B0"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0004}
      shadow-radius={6}
    />
  );
};

// ------------------------------------------------------------------ desk props
/** Placement progress k (0..1): the sheet glides down onto the desk from above-left. */
const Sheet: React.FC<{
  size: [number, number];
  pos: V3;
  rotY?: number;
  tex: THREE.Texture;
  thick?: number;
  edge?: string;
  k?: number;
  from?: V3;
}> = ({ size, pos, rotY = 0, tex, thick = 0.012, edge = "#E4DDCB", k = 1, from = [-0.6, 1.1, -0.5] }) => {
  const grain = useSurfaceGrain(19, 0.18, 4);
  if (k <= 0) return null;
  const e = 1 - smooth(k);
  const p: V3 = [pos[0] + from[0] * e, pos[1] + from[1] * e, pos[2] + from[2] * e];
  return (
    <group position={p} rotation={[e * 0.25, rotY + e * 0.35, 0]}>
      <mesh castShadow receiveShadow position={[0, thick / 2, 0]}>
        <RoundedBoxGeo args={[size[0], thick, size[1]]} radius={thick * 0.45} segments={2} />
        <meshPhysicalMaterial {...POLISH.paper} color={edge} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, thick + 0.0015, 0]}>
        <planeGeometry args={size} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} />
      </mesh>
    </group>
  );
};

/** Flat decal (stamp, tape, highlighter) lying on a sheet. */
const Decal: React.FC<{ tex?: THREE.Texture; size: [number, number]; pos: V3; rot?: number; opacity?: number; scale?: number; color?: string }> = ({
  tex,
  size,
  pos,
  rot = 0,
  opacity = 1,
  scale = 1,
  color,
}) => {
  if (opacity <= 0.001 || scale <= 0.001) return null;
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, rot]} scale={[scale, scale, 1]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={tex ?? null} color={color ?? "#ffffff"} transparent opacity={opacity} depthWrite={false} roughness={0.8} polygonOffset polygonOffsetFactor={-3} />
    </mesh>
  );
};

/** Rubber stamp that slams down at time t0. */
const Stamp: React.FC<{ t: number; t0: number; tex: THREE.Texture; size: [number, number]; pos: V3; rot?: number }> = ({ t, t0, tex, size, pos, rot = 0 }) => {
  const k = clamp01((t - t0) / 0.22);
  if (k <= 0) return null;
  const s = 1 + (1 - k) * 0.55;
  return <Decal tex={tex} size={size} pos={pos} rot={rot} opacity={Math.min(1, k * 1.6)} scale={s} />;
};

const Pin: React.FC<{ pos: V3; color?: string; k?: number }> = ({ pos, color = RED, k = 1 }) => {
  if (k <= 0) return null;
  const y = (1 - smooth(k)) * 0.5;
  return (
    <group position={[pos[0], pos[1] + y, pos[2]]}>
      <mesh castShadow position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.055, 24, 16]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} clearcoat={0.9} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.04, 20]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** Red string from a to b, drawn on over progress p (0..1). */
const Thread: React.FC<{ a: V3; b: V3; sag?: number; p?: number; lift?: number; radius?: number; color?: string }> = ({
  a,
  b,
  sag = 0.02,
  p = 1,
  lift = 0.06,
  radius = 0.008,
  color = "#C21A10",
}) => {
  const geo = useMemo(() => {
    const pa = new THREE.Vector3(a[0], a[1] + lift, a[2]);
    const pb = new THREE.Vector3(b[0], b[1] + lift, b[2]);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const s = i / 20;
      const q = pa.clone().lerp(pb, s);
      q.y += Math.sin(s * Math.PI) * sag;
      pts.push(q);
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, radius, 8, false);
  }, [a, b, sag, lift, radius]);
  useLayoutEffect(() => {
    const n = geo.index ? geo.index.count : 0;
    geo.setDrawRange(0, Math.floor((n * clamp01(p)) / 6) * 6);
  }, [geo, p]);
  if (p <= 0) return null;
  return (
    <mesh geometry={geo} castShadow frustumCulled={false}>
      <meshPhysicalMaterial {...POLISH.fabric} color={color} />
    </mesh>
  );
};

const Desk: React.FC = () => {
  const tex = useMemo(() => {
    const t = deskTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 3.6);
    t.needsUpdate = true;
    return t;
  }, []);
  const grain = useSurfaceGrain(3, 0.3, 6);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3.5]}>
      <planeGeometry args={[18, 36]} />
      <meshPhysicalMaterial map={tex} roughness={0.62} roughnessMap={grain} clearcoat={0.25} clearcoatRoughness={0.5} />
    </mesh>
  );
};

const Tent: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => {
  const tex = tentTexture();
  const w = 0.64, h = 0.28, tilt = 0.5;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {[1, -1].map((s) => (
        <group key={s} rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
          <mesh castShadow receiveShadow position={[0, (h / 2) * Math.cos(tilt), (h / 2) * Math.sin(tilt)]} rotation={[-tilt, 0, 0]}>
            <RoundedBoxGeo args={[w, h, 0.008]} radius={0.003} segments={2} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#F2C230" />
          </mesh>
          {s === 1 && (
            <mesh position={[0, (h / 2) * Math.cos(tilt) + 0.004 * Math.sin(tilt), (h / 2) * Math.sin(tilt) + 0.0045]} rotation={[-tilt, 0, 0]}>
              <planeGeometry args={[w * 0.98, h * 0.96]} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} map={tex} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

const MagnifierBody: React.FC = () => (
  <>
    <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.44, 0.03, 20, 72]} />
      <meshStandardMaterial color="#B9BEC6" metalness={1} roughness={0.18} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.43, 64]} />
      <meshPhysicalMaterial color="#DDE8F0" roughness={0.02} metalness={0} transparent opacity={0.1} clearcoat={1} depthWrite={false} />
    </mesh>
    <mesh castShadow position={[0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.065, 0.62, 24]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2A1A12" roughness={0.35} />
    </mesh>
  </>
);

/** Desk magnifier: rests by the dossier, glides over the chart footnote, then lifts out of shot. */
const DeskMagnifier: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.kStart - 0.2 || t > SEC.KONTEKS[1] + 1.4) return null;
  const rest = new THREE.Vector3(0.95, 0.3, -11.55);
  const foot = new THREE.Vector3(-0.22, 0.34, -7.98);
  const out = new THREE.Vector3(1.6, 2.6, -6.4);
  const p = rest.clone();
  const a = seg(t, T.kStart - 0.2, T.kStart + 0.7);
  p.y += (1 - a) * 1.5;
  p.lerp(foot, seg(t, T.kPembuat - 0.3, T.kPembuat + 0.9));
  p.lerp(out, seg(t, SEC.KONTEKS[1] + 0.1, SEC.KONTEKS[1] + 1.3));
  return (
    <group position={p} rotation={[0, 0.62 - seg(t, T.kPembuat - 0.3, T.kPembuat + 0.9) * 0.4, 0]}>
      <MagnifierBody />
    </group>
  );
};

/** Lens wipe close to the camera: crosses the frame top->bottom during [a,b]. */
const LensSweep: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  if (t < a || t > b) return null;
  const s = (t - a) / (b - a);
  const { pos, q } = camQuat(t);
  const local = new THREE.Vector3(0.15 - s * 0.3, 1.25 - s * 2.5, -3.2);
  const p = local.applyQuaternion(q).add(pos);
  return (
    <group position={p} quaternion={q}>
      <group rotation={[Math.PI / 2, 0, -0.5]}>
        <MagnifierBody />
      </group>
    </group>
  );
};

/** Vertical label that always faces the camera. */
const Billboard: React.FC<{ t: number; tex: THREE.Texture; size: [number, number]; pos: V3; k: number }> = ({ t, tex, size, pos, k }) => {
  if (k <= 0.001) return null;
  const { q } = camQuat(t);
  const s = 0.6 + 0.4 * backOut(k);
  return (
    <group position={[pos[0], pos[1] + (1 - k) * -0.2, pos[2]]} quaternion={q} scale={[s, s, s]}>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={Math.min(1, k * 1.5)} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ coin tray (1 coin = 10 ribu orang)
const COLS = 14, ROWS = 10, SP = 0.125;
const TRAY_Z = -4.15;
const cellPos = (i: number): V3 => {
  const c = i % COLS, r = Math.floor(i / COLS);
  return [(c - (COLS - 1) / 2) * SP, 0, TRAY_Z + (r - (ROWS - 1) / 2) * SP];
};
const TRAY = (() => {
  const r = prng(303);
  const idx = Array.from({ length: COLS * ROWS }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const red = idx.slice(0, 26).sort((a, b) => a - b);
  const redSet = new Set(red);
  const gray = idx.filter((i) => !redSet.has(i)).sort((a, b) => a - b);
  const stack = red.slice(0, 20);
  return { red, gray, stack };
})();
const COIN_H = 0.022;

const CoinSet: React.FC<{ t: number; cells: number[]; color: THREE.Color; layer: number; t0: number; stagger: number; drop: number }> = ({
  t,
  cells,
  color,
  layer,
  t0,
  stagger,
  drop,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, COIN_H, 28), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    cells.forEach((cell, n) => {
      const [x, , z] = cellPos(cell);
      const k = clamp01((t - t0 - n * stagger) / 0.35);
      const e = backOut(k);
      dummy.position.set(x, COIN_H / 2 + layer * COIN_H + (1 - smooth(k)) * drop, z);
      const s = k <= 0 ? 0.0001 : Math.max(0.0001, 0.3 + 0.7 * e);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(0, n * 0.7, 0);
      dummy.updateMatrix();
      m.setMatrixAt(n, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    (m.material as THREE.MeshPhysicalMaterial).color.copy(color);
  }, [t, cells, color, layer, t0, stagger, drop, dummy]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, cells.length]} castShadow receiveShadow frustumCulled={false}>
      <meshPhysicalMaterial roughness={0.35} metalness={0.15} clearcoat={0.6} clearcoatRoughness={0.25} />
    </instancedMesh>
  );
};

const CoinTray: React.FC<{ t: number }> = ({ t }) => {
  const gray0 = new THREE.Color("#CDBF9E");
  const grayDim = new THREE.Color("#5E574A");
  const red = new THREE.Color("#D8311C");
  const kRed = seg(t, T.p19, T.p19 + 0.6);
  const grayC = gray0.clone().lerp(grayDim, kRed);
  const redC = gray0.clone().lerp(red, kRed);
  if (t < T.p14 - 0.1) return null;
  return (
    <group>
      {/* felt tray */}
      <mesh receiveShadow position={[0, 0.004, TRAY_Z]}>
        <RoundedBoxGeo args={[COLS * SP + 0.14, 0.008, ROWS * SP + 0.14]} radius={0.004} segments={2} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#1F3A2E" />
      </mesh>
      <CoinSet t={t} cells={TRAY.gray} color={grayC} layer={0} t0={T.p14} stagger={0.007} drop={0.35} />
      <CoinSet t={t} cells={TRAY.red} color={redC} layer={0} t0={T.p14} stagger={0.03} drop={0.35} />
      <CoinSet t={t} cells={TRAY.stack} color={red} layer={1} t0={T.p178} stagger={0.045} drop={0.6} />
    </group>
  );
};

// ------------------------------------------------------------------ map (penjelasan + payoff)
const MAP_SIZE: [number, number] = [2.96, (2.96 * MAP_H) / MAP_W];
const MAP_POS: V3 = [0, 0, 5.0];
const MAP_ROT = -0.03;
const onMap = (lon: number, lat: number, y = 0.02): V3 => {
  const [u, v] = mapUV(lon, lat);
  const lx = (u - 0.5) * MAP_SIZE[0];
  const lz = (v - 0.5) * MAP_SIZE[1];
  const c = Math.cos(MAP_ROT), s = Math.sin(MAP_ROT);
  return [MAP_POS[0] + lx * c + lz * s, y, MAP_POS[2] - lx * s + lz * c];
};
const P_TENGAH = onMap(136.4, -3.95, 0.014);
const P_SELATAN = onMap(139.4, -7.15, 0.014);
const TIMIKA = onMap(136.88, -4.75, 0.014);
const WAMENA = onMap(138.95, -4.1, 0.014);
const NABIRE = onMap(135.5, -3.37, 0.014);
const UNIT = 1.0 / 463; // tower height per ribu

const Tower: React.FC<{ pos: V3; h: number; color: string; ghost?: boolean; w?: number }> = ({ pos, h, color, ghost, w = 0.24 }) => {
  if (h <= 0.002) return null;
  return (
    <mesh castShadow={!ghost} receiveShadow position={[pos[0], pos[1] + h / 2, pos[2]]}>
      <RoundedBoxGeo args={[w, h, w]} radius={0.018} segments={3} />
      {ghost ? (
        <meshStandardMaterial color={color} transparent opacity={0.22} depthWrite={false} roughness={0.5} />
      ) : (
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
      )}
    </mesh>
  );
};

const PUFFS: { p: V3; s: number; o: number; seed: number; rot: number; v: number }[] = [
  { p: [0.9, 0.35, 5.9], s: 2.4, o: 0.55, seed: 3, rot: 0.3, v: 1.0 },
  { p: [0.2, 0.5, 5.3], s: 2.2, o: 0.45, seed: 9, rot: 1.2, v: 0.8 },
  { p: [-0.5, 0.6, 4.6], s: 2.4, o: 0.38, seed: 14, rot: 2.1, v: 1.2 },
  { p: [0.6, 0.75, 4.4], s: 2.0, o: 0.32, seed: 21, rot: 0.8, v: 0.9 },
  { p: [-0.9, 0.9, 5.4], s: 2.2, o: 0.3, seed: 27, rot: 2.6, v: 1.1 },
  { p: [0.0, 1.25, 5.0], s: 3.0, o: 0.2, seed: 33, rot: 1.7, v: 0.7 },
];
const Smoke: React.FC<{ t: number; amount: number }> = ({ t, amount }) => {
  if (amount <= 0.01) return null;
  return (
    <>
      {PUFFS.map((q, i) => {
        const drift = (t - T.yStart) * 0.06 * q.v;
        return (
          <mesh
            key={i}
            position={[q.p[0] - drift * 0.9, q.p[1] + amount * 0.15, q.p[2] - drift]}
            rotation={[-Math.PI / 2, 0, q.rot + t * 0.04 * (i % 2 ? 1 : -1)]}
            onUpdate={(m) => m.layers.set(FX_LAYER)}
          >
            <planeGeometry args={[q.s * 1.4, q.s]} />
            <meshBasicMaterial map={smokeTexture(q.seed)} color="#E3D6C0" transparent opacity={Math.min(0.85, q.o * 2.2 * amount)} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

/** Arrow head (cone) lying at the end of a thread. */
const ArrowHead: React.FC<{ a: V3; b: V3; k: number }> = ({ a, b, k }) => {
  if (k <= 0) return null;
  const dir = new THREE.Vector3(b[0] - a[0], 0, b[2] - a[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <mesh position={[b[0], b[1] + 0.06, b[2]]} quaternion={q} scale={[k, k, k]} castShadow>
      <coneGeometry args={[0.05, 0.13, 16]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#C21A10" />
    </mesh>
  );
};

// ------------------------------------------------------------------ scene
/** Soft fill from the west for the map stations so the left half of the map is not darker than the cover. */
const MapFill: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.SpotLight>(null);
  const k = seg(t, SEC.PENJELASAN[0] - 0.6, SEC.PENJELASAN[0] + 0.6);
  useLayoutEffect(() => {
    const { look } = camPose(t);
    if (!ref.current) return;
    ref.current.position.set(look.x - 4.2, 4.2, look.z + 1.2);
    ref.current.target.position.copy(look);
    ref.current.target.updateMatrixWorld();
  }, [t]);
  return <spotLight ref={ref} intensity={60 * k} angle={0.75} penumbra={1} decay={2} color="#FFEBD0" />;
};
const PROVS = ["PAPUA TENGAH", "JAWA TIMUR", "LAMPUNG", "NTB", "PAPUA PEGUNUNGAN", "PAPUA SELATAN", "KALTENG", "+25 LAINNYA"];
const tagPos = (i: number): V3 => [(i % 4 - 1.5) * 0.56, 0, 1.42 + Math.floor(i / 4) * 0.42];

const Scene: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const place = (t0: number, d = 0.55) => clamp01((t - t0) / d);
  // label textures
  const lbl463 = labelTexture("ep03f-l463", [{ t: "463 RIBU", size: 92 }, { t: "berpotensi", size: 44, weight: 700 }, { t: "ISPA lama 18,8%", size: 40, mono: true, color: "#9E1C0E" }], 560, 330, "#F6F3EA", RED);
  const lbl37 = labelTexture("ep03f-l37", [{ t: "37 RIBU", size: 92 }, { t: "berpotensi", size: 44, weight: 700 }, { t: "ISPA lama 3,6%", size: 40, mono: true, color: "#B4470A" }], 560, 330, "#F6F3EA", "#B4470A");
  const lbl54 = labelTexture("ep03f-l54", [{ t: "≈54 RIBU", size: 92 }, { t: "ILUSTRASI AUDIRA", size: 46 }, { t: "pakai rata-rata nasional 2,2%", size: 30, mono: true }], 600, 330, "#F2C230", INK_);
  const lblNabire = labelTexture("ep03f-lnab", [{ t: "NABIRE", size: 74 }, { t: ">3.000 KASUS ISPA", size: 60, color: "#9E1C0E" }, { t: "tercatat · Jan–10 Okt 2026", size: 32, mono: true }], 620, 300, "#F6F3EA", RED);

  const tTengah = seg(t, T.jPeringkat, T.jPeringkat + 1.2);
  const tSelatan = seg(t, T.j37 - 0.2, T.j37 + 0.6);
  const t54 = seg(t, T.j54 - 0.4, T.j54 + 0.6);
  const ghostK = seg(t, T.jKalau + 0.3, T.jKalau + 1.0);
  const mapShow = t > T.pSemua;
  const fireK = seg(t, T.jSelatan - 0.2, T.jSelatan + 0.5);
  const smokeAmt = Math.max(win(t, T.yStart - 0.2, T.yElnino + 1.6, 0.8, 1.0) * 0.9, win(t, T.yAsap - 0.6, T.oStart + 1.0, 0.8, 1.2));

  const cp = camPose(t);
  const focusD = cp.pos.distanceTo(cp.look);
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={0.24} color="#FFF4E0" />
      <hemisphereLight args={["#FFE9C8", "#120C08", 0.38]} />
      <directionalLight position={[3.5, 4, -3]} intensity={0.45} color="#9FC2E8" />
      <MapFill t={t} />
      <Desk />

      {/* ---------- station A: viral chart ---------- */}
      <Sheet size={[2.0, 2.8]} pos={[0, 0, -9.0]} rotY={0.03} tex={chartTexture()} />
      <Stamp t={t} t0={T.hBukan} tex={stampPasien()} size={[1.75, 0.54]} pos={[0.05, 0.03, -8.75]} rot={0.1} />
      <Decal tex={highlightTexture()} size={[1.3, 0.12]} pos={[-0.18, 0.03, -7.92]} rot={0.03} opacity={seg(t, T.kEstimasi - 0.1, T.kEstimasi + 0.5) * 0.9} scale={1} />
      {/* ---------- station B: CELIOS dossier ---------- */}
      <group position={[-0.05, 0, -12.6]} rotation={[0, -0.04, 0]}>
        <mesh castShadow receiveShadow position={[0.08, 0.007, 0.05]}>
          <RoundedBoxGeo args={[2.1, 0.014, 2.6]} radius={0.006} segments={2} />
          <meshPhysicalMaterial {...POLISH.paper} color="#B8925A" />
        </mesh>
      </group>
      <Sheet size={[1.9, 2.42]} pos={[-0.05, 0.015, -12.65]} rotY={0.02} tex={dossierTexture()} k={place(T.kStart - 0.4, 0.8)} from={[0.4, 1.4, -0.6]} />
      <Pin pos={[0.72, 0.03, -13.7]} k={place(T.kCelios, 0.35)} />
      {/* not-from tags + red tape strike */}
      <Sheet size={[0.86, 0.32]} pos={[-0.5, 0.03, -11.05]} rotY={0.05} tex={tagTexture("ep03f-tag-kem", "KEMENKES")} thick={0.006} edge="#D9C49A" k={place(T.kBukan - 0.2, 0.4)} from={[-0.4, 0.8, 0.2]} />
      <Sheet size={[0.86, 0.32]} pos={[0.52, 0.03, -11.0]} rotY={-0.06} tex={tagTexture("ep03f-tag-bnpb", "BNPB")} thick={0.006} edge="#D9C49A" k={place(T.kBukan, 0.4)} from={[0.4, 0.8, 0.2]} />
      <Decal size={[1.0, 0.07]} pos={[-0.5, 0.045, -11.05]} rot={0.42} color="#C21A10" opacity={seg(t, T.kKemenkes, T.kKemenkes + 0.15)} scale={0.2 + 0.8 * seg(t, T.kKemenkes, T.kKemenkes + 0.25)} />
      <Decal size={[1.0, 0.07]} pos={[0.52, 0.045, -11.0]} rot={-0.38} color="#C21A10" opacity={seg(t, T.kBnpb, T.kBnpb + 0.15)} scale={0.2 + 0.8 * seg(t, T.kBnpb, T.kBnpb + 0.25)} />
      <DeskMagnifier t={t} />

      {/* ---------- station C: formula column ---------- */}
      <Sheet size={[2.0, 0.7]} pos={[0, 0.01, -5.6]} rotY={-0.02} tex={cardPenduduk()} thick={0.01} edge="#EEEADF" k={place(T.pPenduduk - 0.4)} />
      <CoinTray t={t} />
      <Sheet size={[2.0, 0.78]} pos={[0, 0.01, -2.95]} rotY={0.02} tex={cardPrev()} thick={0.01} edge="#EEEADF" k={place(T.pDikali - 0.2)} from={[0.6, 1.1, -0.4]} />
      <Sheet size={[2.0, 0.7]} pos={[0, 0.01, -2.05]} rotY={-0.015} tex={cardKali()} thick={0.01} edge="#EEEADF" k={place(T.pDikali2 - 0.1)} />
      <Sheet size={[2.0, 0.78]} pos={[0, 0.012, -1.12]} rotY={0.01} tex={cardHasil()} thick={0.012} edge="#EADBCB" k={place(T.pHasil - 0.1)} from={[0.6, 1.1, -0.4]} />
      <Sheet size={[1.8, 0.96]} pos={[0.1, 0.01, 0.3]} rotY={-0.04} tex={kaltengTexture()} thick={0.006} edge="#E2DAC4" k={place(T.pPengali - 0.2)} from={[0.8, 1.2, 0.3]} />
      <Pin pos={[0.78, 0.02, -2.05]} k={place(T.pPengali, 0.3)} />
      <Pin pos={[0.92, 0.02, -0.02]} k={place(T.pKalteng - 0.4, 0.3)} />
      <Thread a={[0.78, 0.02, -2.05]} b={[0.92, 0.02, -0.02]} sag={0.05} p={seg(t, T.pKalteng - 0.3, T.pKalteng + 0.7)} />
      {PROVS.map((name, i) => {
        const p = tagPos(i);
        return (
          <React.Fragment key={name}>
            <Sheet size={[0.52, 0.2]} pos={p} rotY={((i * 37) % 7 - 3) * 0.012} tex={tagTexture(`ep03f-prov-${i}`, name)} thick={0.005} edge="#D9C49A" k={place(T.pPengali + 1.2 + i * 0.12, 0.45)} from={[0, 0.8, -0.3]} />
            <Stamp t={t} t0={T.pDipakai + i * 0.17} tex={stampKali()} size={[0.34, 0.16]} pos={[p[0] + 0.1, 0.03, p[2] + 0.03]} rot={0.12 - (i % 3) * 0.08} />
          </React.Fragment>
        );
      })}

      {/* ---------- station D: map ---------- */}
      <Sheet size={MAP_SIZE} pos={MAP_POS} rotY={MAP_ROT} tex={filmMap()} />
      <mesh position={[MAP_POS[0], 0.0145, MAP_POS[2]]} rotation={[-Math.PI / 2, 0, MAP_ROT]}>
        <planeGeometry args={MAP_SIZE} />
        <meshStandardMaterial map={fireTexture()} transparent opacity={fireK} depthWrite={false} roughness={0.85} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <Tent pos={[-1.35, 0.0, 3.55]} rotY={0.22} />
      {mapShow && (
        <>
          <Tower pos={P_TENGAH} h={463 * UNIT * tTengah * (1 - seg(t, T.yStart - 0.4, T.yStart + 0.6))} color={RED} ghost={ghostK > 0.5 && t < T.yStart} />
          <Tower pos={[P_TENGAH[0] - 0.34, P_TENGAH[1], P_TENGAH[2] + 0.1]} h={54 * UNIT * t54 * (1 - seg(t, T.yStart - 0.6, T.yStart + 0.2))} color="#F2C230" />
          <Tower pos={P_SELATAN} h={37 * UNIT * tSelatan} color="#E07A1F" />
          <Billboard t={t} tex={lbl463} size={[0.82, 0.48]} pos={[P_TENGAH[0] - 0.05, 463 * UNIT + 0.34, P_TENGAH[2]]} k={seg(t, T.jPeringkat + 0.9, T.jPeringkat + 1.4) * (1 - seg(t, T.yStart - 0.6, T.yStart))} />
          <Billboard t={t} tex={lbl37} size={[0.7, 0.41]} pos={[P_SELATAN[0], 37 * UNIT + 0.3, P_SELATAN[2]]} k={seg(t, T.j37, T.j37 + 0.5) * (1 - seg(t, T.yStart - 0.6, T.yStart))} />
          <Billboard t={t} tex={lbl54} size={[0.66, 0.36]} pos={[P_TENGAH[0] - 0.62, 54 * UNIT + 0.36, P_TENGAH[2] + 0.12]} k={seg(t, T.j54, T.j54 + 0.5) * (1 - seg(t, T.yStart - 0.6, T.yStart))} />
          {/* payoff: smoke paths from the south to Timika and Wamena, Nabire tag */}
          <Thread a={P_SELATAN} b={TIMIKA} sag={0.12} p={seg(t, T.yAsap, T.yTimika + 0.2)} radius={0.012} lift={0.03} />
          <ArrowHead a={P_SELATAN} b={TIMIKA} k={seg(t, T.yTimika - 0.1, T.yTimika + 0.2)} />
          <Thread a={P_SELATAN} b={WAMENA} sag={0.12} p={seg(t, T.yAsap + 0.3, T.yWamena + 0.2)} radius={0.012} lift={0.03} />
          <ArrowHead a={P_SELATAN} b={WAMENA} k={seg(t, T.yWamena - 0.1, T.yWamena + 0.2)} />
          <Pin pos={NABIRE} k={place(T.yNabire - 0.2, 0.3)} />
          <Billboard t={t} tex={lblNabire} size={[0.74, 0.36]} pos={[NABIRE[0] - 0.42, 0.4, NABIRE[2] - 0.42]} k={seg(t, T.yNabire, T.yNabire + 0.5) * (1 - seg(t, T.oBaca, T.oBaca + 0.5))} />
        </>
      )}
      {/* ---------- station E: El Nino + NASA ---------- */}
      <Sheet size={[1.6, 1.1]} pos={[3.3, 0.01, 4.3]} rotY={-0.05} tex={elninoTexture()} k={place(T.yElnino - 0.3, 0.7)} from={[0.9, 1.3, -0.4]} />
      <Sheet size={[1.6, 1.31]} pos={[3.3, 0.01, 5.8]} rotY={0.03} tex={nasaTexture()} k={place(T.yNasa - 0.6, 0.7)} from={[0.9, 1.3, 0.4]} />
      {NASA_BARS_U.map((u, i) => {
        const hFull = i < 2 ? 0.62 : 0.44;
        const h = hFull * seg(t, T.yNasa + 0.3 + i * 0.35, T.yNasa + 1.1 + i * 0.35);
        const x = 3.3 + (u - 0.5) * 1.6;
        const z = 5.8 + ((700 / 900) - 0.5) * 1.31 - 0.08;
        if (h <= 0.002) return null;
        return (
          <group key={i} position={[x, 0.022, z]} rotation={[0, 0.03, 0]}>
            <mesh castShadow position={[0, 0.04, -h / 2]}>
              <RoundedBoxGeo args={[0.2, 0.08, h]} radius={0.01} segments={2} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color={i === 2 ? RED : "#4B4A47"} />
            </mesh>
            {i < 2 && (
              <mesh position={[0, 0.085, -h + 0.08]} rotation={[-Math.PI / 2, 0, 0.3]}>
                <planeGeometry args={[0.26, 0.025]} />
                <meshBasicMaterial color="#F4F1E8" />
              </mesh>
            )}
          </group>
        );
      })}
      <Smoke t={t} amount={smokeAmt} />
      {/* ---------- outro note ---------- */}
      <Sheet size={[1.9, 0.66]} pos={[0.1, 0.02, 6.5]} rotY={-0.03} tex={needTexture()} thick={0.006} edge="#EADFAE" k={place(T.oStart, 0.7)} from={[-0.7, 1.4, 0.5]} />

      <LensSweep t={t} a={SEC.HOOK[1] - 0.15} b={SEC.HOOK[1] + 0.85} />
      <LensSweep t={t} a={SEC.PENGEMBANGAN[1] - 0.2} b={SEC.PENGEMBANGAN[1] + 0.8} />
      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao focus={focusD} aperture={0.0012} maxBlur={0.006} />
    </>
  );
};
const INK_ = "#1D1D1B";

// ------------------------------------------------------------------ HTML overlay (HUD)
const MONO = "'Courier New', monospace";
const HEAVY = "'Arial Black', 'Segoe UI', Arial, sans-serif";

const Kicker: React.FC<{ k: number; text: string; s: number }> = ({ k, text, s }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 66 * s, top: 262 * s, opacity: k, fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, letterSpacing: 5 * s, color: "#FF5A3C", transform: `translateX(${(1 - k) * -20 * s}px)` }}>
      ● {text}
    </div>
  );

const Line: React.FC<{ k: number; s: number; top: number; children: React.ReactNode; size?: number; color?: string; font?: string; bg?: string }> = ({
  k,
  s,
  top,
  children,
  size = 64,
  color = "#F4F1EA",
  font = HEAVY,
  bg,
}) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 66 * s, right: 60 * s, top: top * s, opacity: k, transform: `translateY(${(1 - k) * 18 * s}px)` }}>
      <span
        style={{
          fontFamily: font,
          fontWeight: 900,
          fontSize: size * s,
          lineHeight: 1.08,
          color,
          background: bg,
          padding: bg ? `${4 * s}px ${14 * s}px ${6 * s}px` : undefined,
          textShadow: bg ? undefined : "0 4px 18px rgba(0,0,0,0.7)",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {children}
      </span>
    </div>
  );

const Chip: React.FC<{ k: number; s: number; text: string }> = ({ k, s, text }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", right: 60 * s, top: 262 * s, opacity: k, fontFamily: MONO, fontWeight: 700, fontSize: 24 * s, letterSpacing: 3 * s, color: "#1D1D1B", background: "#F2C230", padding: `${6 * s}px ${14 * s}px` }}>
      {text}
    </div>
  );

const Overlay: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const hook = 1 - seg(t, SEC.HOOK[1] - 0.3, SEC.HOOK[1] + 0.2);
  const kon = win(t, SEC.KONTEKS[0], SEC.KONTEKS[1] + 0.2, 0.4, 0.4);
  const pen = win(t, SEC.PENGEMBANGAN[0], SEC.PENGEMBANGAN[1] + 0.2, 0.4, 0.4);
  const jel = win(t, SEC.PENJELASAN[0], SEC.PENJELASAN[1] + 0.2, 0.4, 0.4);
  const pay = win(t, SEC.PAYOFF[0], SEC.PAYOFF[1] + 0.2, 0.4, 0.4);
  const out = win(t, SEC.OUTRO[0], T.outroCard + 0.4, 0.4, 0.3);
  const eqTerm = (a: number) => seg(t, a - 0.1, a + 0.3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,12,14,0.94) 0%, rgba(11,12,14,0.86) 24%, rgba(11,12,14,0.0) 36%, rgba(11,12,14,0) 62%, rgba(11,12,14,0.6) 80%, rgba(11,12,14,0.75) 100%)",
        }}
      />
      {/* HOOK: frame 0 is the thumbnail */}
      {hook > 0.01 && (
        <div style={{ position: "absolute", left: 66 * s, top: 262 * s, opacity: hook, fontFamily: HEAVY, fontWeight: 900, color: "#F4F1EA", lineHeight: 0.98, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ fontFamily: MONO, fontSize: 30 * s, letterSpacing: 5 * s, color: "#FF5A3C", marginBottom: 14 * s }}>● CEK ANGKA VIRAL</div>
          <div style={{ fontSize: 140 * s, letterSpacing: -3 * s }}>3,58 JUTA</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 * s, marginTop: 10 * s }}>
            <span style={{ fontSize: 80 * s, background: RED, padding: `0 ${18 * s}px ${4 * s}px`, letterSpacing: -1 * s }}>BERPOTENSI</span>
            <span style={{ fontSize: 80 * s, letterSpacing: -1 * s }}>ISPA?</span>
          </div>
          <div style={{ marginTop: 22 * s, fontSize: 50 * s, opacity: seg(t, T.hPapua - 0.1, T.hPapua + 0.3), color: "#FFD9CF" }}>Papua Tengah tertinggi?</div>
        </div>
      )}
      {/* KONTEKS */}
      <Kicker k={kon} s={s} text="SUMBER ANGKA" />
      <Line k={kon * seg(t, T.kCelios - 0.1, T.kCelios + 0.3) * (1 - seg(t, T.kPembuat - 0.4, T.kPembuat))} s={s} top={318} size={70}>
        Laporan CELIOS, 2 Nov
      </Line>
      <Line k={kon * seg(t, T.kBukan - 0.1, T.kBukan + 0.3) * (1 - seg(t, T.kPembuat - 0.4, T.kPembuat))} s={s} top={410} size={48} color="#FFD9CF">
        bukan dari Kemenkes / BNPB
      </Line>
      <Line k={kon * seg(t, T.kPembuat, T.kPembuat + 0.4)} s={s} top={318} size={40} font={MONO} color="#FFB9A8">
        CATATAN PEMBUAT GRAFIK:
      </Line>
      <Line k={kon * seg(t, T.kEstimasi - 0.2, T.kEstimasi + 0.2)} s={s} top={372} size={62}>
        “Estimasi, bukan kasus terkonfirmasi.”
      </Line>
      {/* PENGEMBANGAN: running equation */}
      <Kicker k={pen} s={s} text="BEDAH RUMUS" />
      {pen > 0.01 && t < T.pPengali - 0.2 && (
        <div style={{ position: "absolute", left: 66 * s, top: 318 * s, opacity: pen * (1 - seg(t, T.pPengali - 0.6, T.pPengali - 0.2)), fontFamily: HEAVY, fontWeight: 900, fontSize: 60 * s, color: "#F4F1EA", textShadow: "0 4px 18px rgba(0,0,0,0.7)", display: "flex", flexWrap: "wrap", gap: `${6 * s}px ${18 * s}px`, width: 950 * s }}>
          <span style={{ opacity: eqTerm(T.p14) }}>≈1,4 jt</span>
          <span style={{ opacity: eqTerm(T.p19), color: "#AFC6FF" }}>× ≈19%</span>
          <span style={{ opacity: eqTerm(T.p178), color: "#FF8A70" }}>× 1,78</span>
          <span style={{ opacity: eqTerm(T.p463), background: RED, padding: `0 ${12 * s}px` }}>= ≈463 rb berpotensi</span>
        </div>
      )}
      <Line k={pen * eqTerm(T.p14) * (1 - seg(t, T.p463 - 0.3, T.p463))} s={s} top={480} size={30} font={MONO} color="#E8DCC6">
        1 koin = 10 ribu orang
      </Line>
      <Line k={pen * seg(t, T.pPengali - 0.2, T.pPengali + 0.2) * (1 - seg(t, T.pDipakai - 0.4, T.pDipakai))} s={s} top={318} size={58}>
        Pengali 1,78 = lonjakan sepekan di Kalteng
      </Line>
      <Line k={pen * seg(t, T.pDipakai - 0.1, T.pDipakai + 0.3)} s={s} top={318} size={46} color="#FF8A70">
        ×1,78 sama rata ke semua provinsi
      </Line>
      {/* PENJELASAN */}
      <Kicker k={jel} s={s} text="KENAPA PAPUA TENGAH?" />
      <Line k={jel * seg(t, T.jPeringkat - 0.1, T.jPeringkat + 0.3) * (1 - seg(t, T.jKalau - 0.4, T.jKalau))} s={s} top={318} size={58}>
        Peringkat = angka ISPA lama,
      </Line>
      <Line k={jel * seg(t, T.jPeringkat + 1.2, T.jPeringkat + 1.6) * (1 - seg(t, T.jKalau - 0.4, T.jKalau))} s={s} top={392} size={58} color="#FFB37A">
        bukan luas api
      </Line>
      <Line k={jel * seg(t, T.jKalau, T.jKalau + 0.4)} s={s} top={318} size={52}>
        Kalau pakai rata-rata nasional:
      </Line>
      <Line k={jel * seg(t, T.j54 - 0.2, T.j54 + 0.2)} s={s} top={390} size={34} font={MONO} color="#1D1D1B" bg="#F2C230">
        HITUNGAN ILUSTRASI AUDIRA · BUKAN ANGKA CELIOS
      </Line>
      {/* PAYOFF */}
      <Kicker k={pay} s={s} text="TAPI ASAPNYA NYATA" />
      <Chip k={Math.max(win(t, T.yStart, T.yElnino + 1.4), win(t, T.yAsap - 0.4, SEC.PAYOFF[1] + 0.2))} s={s} text="ILUSTRASI ASAP" />
      <Line k={pay * seg(t, T.yAsap - 0.1, T.yAsap + 0.3) * (1 - seg(t, T.yNabire - 0.3, T.yNabire))} s={s} top={318} size={56}>
        Asap dari selatan → Timika & Wamena
      </Line>
      <Line k={pay * seg(t, T.yNabire, T.yNabire + 0.3)} s={s} top={318} size={56}>
        Nabire: lebih dari 3 ribu kasus ISPA tercatat
      </Line>
      {/* OUTRO */}
      <Kicker k={out} s={s} text="AUDIRA FORENSIK" />
      <Line k={out * seg(t, T.oBaca - 0.1, T.oBaca + 0.3)} s={s} top={318} size={78}>
        Baca angkanya,
      </Line>
      <Line k={out * seg(t, T.oBaca + 0.8, T.oBaca + 1.1)} s={s} top={410} size={78} color="#FF8A70">
        bukan cuma judulnya.
      </Line>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ karaoke captions (label-tape style)
type Chunk = { words: Word[]; start: number; end: number };
/** True when a and b must stay on the same line (number + unit, "ribu" + noun). */
const glued = (a?: Word, b?: Word) => {
  if (!a || !b) return false;
  if (/[.,:?!]$/.test(a.w)) return false;
  const nb = b.w.replace(/[.,:?!]+$/, "").toLowerCase();
  if (/^\d[\d.,]*$/.test(a.w) && /^(ribu|juta|persen|hektare|kasus|orang)$/.test(nb)) return true;
  return /^(ribu|juta)$/i.test(a.w) && /^(kasus|orang|hektare)$/.test(nb);
};
const splitAt = (ws: Word[]) => {
  const n = ws.length, h = Math.ceil(n / 2);
  for (let d = 0; d < n; d++) {
    for (const i of [h + d, h - d]) if (i > 1 && i < n - 1 && !glued(ws[i - 1], ws[i])) return i;
  }
  return h;
};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c) => {
    let cur: Word[] = [];
    const flush = () => {
      if (!cur.length) return;
      if (cur.length === 1 && out.length && out[out.length - 1].words.length < 8) {
        out[out.length - 1].words.push(cur[0]);
      } else out.push({ words: cur, start: 0, end: 0 });
      cur = [];
    };
    c.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[.,:?!]$/.test(w.w);
      const left = c.words.length - 1 - i;
      if ((punct && cur.length >= 3) || cur.length >= 7) {
        if (left === 1 || glued(w, c.words[i + 1])) return; // never leave a single word alone
        flush();
      }
    });
    flush();
  });
  out.forEach((ch, i) => {
    ch.start = ch.words[0].s - 0.08;
    const next = out[i + 1];
    const last = ch.words[ch.words.length - 1].e;
    ch.end = next ? Math.min(next.words[0].s - 0.08, last + 0.9) : last + 0.6;
  });
  return out;
})();

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t >= T.outroCard) return null;
  const ch = CHUNKS.find((c) => t >= c.start && t < c.end);
  if (!ch) return null;
  const n = ch.words.length;
  const sp = splitAt(ch.words);
  const lines = n <= 4 ? [ch.words] : [ch.words.slice(0, sp), ch.words.slice(sp)];
  const k = seg(t, ch.start, ch.start + 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290 * s, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * s, opacity: k }}>
      {lines.map((ln, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            gap: 24 * s,
            background: "#F1EBDD",
            padding: `${10 * s}px ${26 * s}px`,
            transform: `rotate(${li ? 0.6 : -0.6}deg)`,
            boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
            borderLeft: `${8 * s}px solid ${RED}`,
          }}
        >
          {ln.map((w, i) => {
            const active = t >= w.s - 0.03 && t < w.e + 0.05;
            const said = t >= w.s;
            const b = active ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 50 * s,
                  lineHeight: 1.15,
                  color: active ? "#FFFFFF" : said ? "#1D1D1B" : "rgba(29,29,27,0.5)",
                  background: active ? RED : "transparent",
                  padding: `0 ${4 * s}px`,
                  transform: `scale(${b})`,
                  transformOrigin: "center",
                  display: "inline-block",
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ film
export const Ep03Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.2, 11, -4], fov: 30, near: 0.1, far: 80 }}>
        <Scene t={t} f={f} />
      </ThreeCanvas>
      <Overlay t={t} s={s} />
      <Captions t={t} s={s} />
      <Outro start={T.outroCard} />
    </AbsoluteFill>
  );
};
