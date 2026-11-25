// EP049 film — "Mengapa Kapal Raksasa dari Baja Tidak Tenggelam?" (CLAYWORLD).
// One plasticine tabletop with three sets the camera travels between:
//   TANK (x = 0)   the cut-open water tank from the cover: nail vs ship, overflow jugs, leak, crush payoff
//   LAB  (x = -14) a clay seesaw: steel cube vs 8 water cubes, cube -> hull, hull+air vs its volume of water
//   SEA  (x = +14) a whole ship seen from the side with a load-line mark, loaded until the mark meets the water
// Every beat is keyed to word times in timeline.json (Audio Master Clock). Puppets move on 15 fps steps,
// the camera glides. Deterministic: only useCurrentFrame + seeded hashes.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CLAY_PALETTE as P } from "../../kits/clayworld/lib/palette";
import { stepFrame } from "../../kits/clayworld/core/motion";
import { MANROPE } from "../../core/type/fonts.ts";
import { keys, sample } from "../../core/motion/track.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import {
  ANTON, Arrow, BEAM, C, Coil, HULL_OUT, SHIP_X0, SpareNail, TANK_D, TANK_X, Tank, WATER_Y, clay, ext, hullShape,
  project, rnd, useAnton, usePrintTex, wave, type Cam,
} from "./Cover.tsx";

export const FILM_SECONDS = TL.total;
const S = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
const WORDS = TL.clips.flatMap((c) => c.words);
/** start time of the n-th word that begins with `w` (exact screen text, case-sensitive) */
const ws = (w: string, n = 0) => {
  const hits = WORDS.filter((x) => x.w.startsWith(w));
  if (!hits[n]) throw new Error(`word not in timeline: ${w} #${n}`);
  return hits[n].s;
};
const we = (w: string, n = 0) => WORDS.filter((x) => x.w.startsWith(w))[n].e;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lin = (a: number, b: number, t: number) => clamp01((t - a) / (b - a));
const sm = (a: number, b: number, t: number) => {
  const c = lin(a, b, t);
  return c * c * (3 - 2 * c);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const win = (a: number, b: number, t: number, fade = 0.25) => sm(a, a + fade, t) * (1 - sm(b - fade, b, t));
/** damped bob after an impact at time t0 (stop-motion settle) */
const bob = (t: number, t0: number, amp: number, k = 2.4, w = 6) => (t < t0 ? 0 : -amp * Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0)));

// ---------- set positions ----------
const LAB_X = -14;
const SEA_X = 14;
const CX = SHIP_X0 + 1.95; // ship pivot (centroid-ish) used for crush/expand
const CY = 2.2;

// ---------- beats (all from word times) ----------
const B = {
  drop: 0.0,
  hitNail: 0.5,
  hitShip: 0.62,
  ribuan: ws("ribuan"),
  kok: ws("Kok"),
  baja8: ws("Baja"),
  delapan: ws("delapan"),
  bukan: ws("bukan"),
  bentuk: ws("bentuknya."),
  archi: ws("Archimedes"),
  didorong: ws("didorong"),
  seberat: ws("seberat", 1),
  pindahkan: we("pindahkan."),
  paku2: ws("Paku", 1),
  memindahkan1: ws("memindahkan"),
  kalah: ws("kalah."),
  lambung: ws("Lambung"),
  cangkang: ws("cangkang"),
  mengurung: ws("mengurung"),
  memindahkan2: ws("memindahkan", 1),
  rata: ws("rata-rata,"),
  bajaUdara: ws("baja", 3),
  ringan: ws("ringan"),
  airVol: ws("sebanyak"),
  itulah: ws("Itulah"),
  muatan: ws("muatan"),
  garis: ws("garis"),
  supaya: ws("supaya"),
  dalamnya: ws("dalamnya"),
  sekat: ws("sekat"),
  bocor: ws("bocor"),
  ruang: we("ruang."),
  oKapal: ws("kapal", 3),
  oRingan: ws("ringan,"),
  oTapi: ws("tapi", 1),
  perahu: ws("perahu"),
};

// ---------- camera track (seconds, [px,py,pz, tx,ty,tz, fov]) ----------
// each shot = target + distance; height = 0.22·d (same tabletop elevation as the cover), small yaw for parallax.
// 9:16 framing: visible half-width ≈ 0.172·d at fov 34, so d is chosen from the width each shot must hold.
const S_OUTRO_END = TL.sections.OUTRO[1];
const shot = (t: number, tx: number, ty: number, tz: number, d: number, yaw = 0, fov = 34) =>
  [t, tx + Math.sin(yaw) * d, ty + 0.22 * d, tz + Math.cos(yaw) * d, tx, ty, tz, fov];
const MARK_X = SEA_X - (SHIP_X0 + 1.95) + SHIP_X0 + 1.9;
const CAM = keys(
  shot(0.0, 0.3, 2.3, -1, 26),
  shot(2.3, 0.4, 2.3, -1, 24.5, 0.02),
  shot(3.6, 0.9, 2.4, -0.6, 15.5, 0.05),
  shot(6.2, 0.95, 2.5, -0.5, 14, 0.07),
  shot(6.95, 0.95, 2.5, -0.5, 14.5, 0.06),
  shot(7.45, LAB_X, 1.4, 0, 21, -0.03),
  shot(10.5, LAB_X, 1.4, 0, 19.5, 0.02),
  shot(12.4, LAB_X - 2.0, 1.4, 0, 11, 0.08),
  shot(14.2, LAB_X - 2.0, 1.4, 0, 10.2, 0.1),
  shot(14.85, 0.6, 2.1, -0.8, 25),
  shot(18.0, 2.0, 2.0, -0.8, 25, 0.03),
  shot(20.0, 2.3, 1.8, -1, 25, 0.04),
  shot(20.85, -3.3, 1.2, -0.8, 15, -0.05),
  shot(23.7, -3.3, 1.2, -0.8, 14.2, -0.08),
  shot(24.6, 0.9, 2.2, -0.4, 15),
  shot(27.4, 0.9, 2.2, -0.4, 14, 0.05),
  shot(29.8, 0.9, 2.3, 0.2, 18, 0.12),
  shot(30.4, LAB_X, 1.5, 0, 21),
  shot(35.8, LAB_X, 1.5, 0, 21, -0.02),
  shot(36.3, 0.3, 2.2, -1, 27),
  shot(38.1, 0.3, 2.2, -1, 26, 0.02),
  shot(38.7, SEA_X, 1.9, 0, 17),
  shot(42.0, SEA_X, 1.9, 0, 15.5, -0.05),
  shot(44.4, MARK_X + 0.2, 2.5, 0, 10, -0.02),
  shot(44.95, 1.4, 1.35, -0.3, 10.5),
  shot(48.0, 1.55, 1.3, -0.3, 9.4, 0.04),
  shot(48.7, 0.3, 2.0, -1, 26),
  shot(53.6, 0.0, 2.0, -1, 25, -0.02),
  shot(56.2, 0.3, 2.2, -1, 28),
  shot(S_OUTRO_END + 0.6, 0.35, 2.25, -1, 29.5),
);
const camAt = (t: number): Cam => {
  const v = sample(CAM, t);
  return { pos: [v[0], v[1], v[2]], target: [v[3], v[4], v[5]], fov: v[6] };
};

// ---------- shared materials helpers ----------
const waterMat = (color: string) => (
  <meshPhysicalMaterial color={color} roughness={0.42} metalness={0.0} clearcoat={1} clearcoatRoughness={0.12} />
);

// ---------- lights that follow the active set ----------
const LightRig: React.FC<{ tx: number }> = ({ tx }) => {
  const { scene } = useThree();
  const key = useMemo(() => {
    const l = new THREE.DirectionalLight("#ffe9cc", 3.3);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -9; c.right = 9; c.top = 9; c.bottom = -9; c.near = 0.5; c.far = 60;
    l.shadow.bias = -0.0006;
    return l;
  }, []);
  useLayoutEffect(() => {
    scene.add(key);
    scene.add(key.target);
    return () => {
      scene.remove(key);
      scene.remove(key.target);
    };
  }, [scene, key]);
  useLayoutEffect(() => {
    key.position.set(tx - 5, 11, 9);
    key.target.position.set(tx, 0, 0);
    key.target.updateMatrixWorld();
  }, [key, tx]);
  return null;
};

const Tactile: React.FC<{ tex: THREE.Texture }> = ({ tex }) => {
  const { scene, gl } = useThree();
  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || mesh.userData.plain) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m && m.isMeshStandardMaterial && !m.transparent && m.bumpMap !== tex) {
        m.bumpMap = tex;
        m.bumpScale = 8;
        m.needsUpdate = true;
      }
    });
  });
  return null;
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(...cam.pos);
    p.lookAt(...cam.target);
    p.fov = cam.fov;
    p.near = 0.1;
    p.far = 200;
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [cam, camera, gl]);
  return null;
};

// ---------- geometry built once ----------
const underwaterShape = () => {
  // hull outline clipped to below the waterline (displaced-water ghost)
  const pts: THREE.Vector2[] = [];
  const n = HULL_OUT.length;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = HULL_OUT[i];
    const [x1, y1] = HULL_OUT[(i + 1) % n];
    if (y0 <= WATER_Y) pts.push(new THREE.Vector2(x0, y0));
    if ((y0 - WATER_Y) * (y1 - WATER_Y) < 0) {
      const k = (WATER_Y - y0) / (y1 - y0);
      pts.push(new THREE.Vector2(x0 + k * (x1 - x0), WATER_Y));
    }
  }
  return new THREE.Shape(pts);
};

const waterShape = (x0: number, x1: number, level: number, phase = 0) => {
  const s = new THREE.Shape();
  s.moveTo(x0, 0);
  s.lineTo(x1, 0);
  for (let x = x1; x >= x0 - 1e-6; x -= 0.08) s.lineTo(x, level - WATER_Y + wave(x + phase));
  s.closePath();
  return s;
};

const useGeo = () =>
  useMemo(() => {
    const hullRing = ext(hullShape(true), BEAM, 0.03);
    const hullFull = ext(hullShape(false), BEAM * 2, 0.03);
    const inner = new THREE.ShapeGeometry(hullShape(false));
    const innerHole = (() => {
      // the hollow region only (for the depth punch)
      const s = new THREE.Shape(
        [...(hullShape(true).holes[0].getPoints())].map((p) => new THREE.Vector2(p.x, p.y)),
      );
      return new THREE.ShapeGeometry(s);
    })();
    const ghost = ext(underwaterShape(), BEAM, 0.02);
    const ghostFull = ext(hullShape(false), BEAM, 0.02);
    const water = ext(waterShape(-TANK_X, TANK_X, WATER_Y), TANK_D - 0.03, 0.03);
    const sea = ext(waterShape(-4.2, 4.2, WATER_Y, 1.3), 5.0, 0.04);
    const box = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 2, r);
    return { hullRing, hullFull, inner, innerHole, ghost, ghostFull, water, sea, box };
  }, []);
type Geo = ReturnType<typeof useGeo>;

const plimsollTex = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 512, 512);
  g.strokeStyle = g.fillStyle = "#F6EFE3";
  g.lineWidth = 14;
  g.lineCap = "round";
  // deck line
  g.beginPath(); g.moveTo(70, 70); g.lineTo(270, 70); g.stroke();
  // ring with the summer line through its centre
  g.beginPath(); g.arc(170, 300, 80, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(60, 300); g.lineTo(280, 300); g.stroke();
  // ladder: TF F T S W WNA from the top
  g.beginPath(); g.moveTo(330, 200); g.lineTo(330, 410); g.stroke();
  const rows: [string, number][] = [["TF", 210], ["F", 245], ["T", 265], ["S", 300], ["W", 335], ["WNA", 370]];
  g.font = "bold 30px sans-serif";
  for (const [lab, y] of rows) {
    g.beginPath(); g.moveTo(330, y); g.lineTo(390, y); g.stroke();
    g.fillText(lab, 400, y + 10);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// ---------- tank ship (cut on its centreline) ----------
type ShipState = { y: number; tilt: number; crush: number; leak: number; shell: number; air: number; bulk: number; arrows: number };

const CONT = [P.coral, P.mustard, P.dustyTeal, P.olive, P.clayCream, P.terracotta];

const Containers: React.FC<{ geo: Geo; z: number; depth: number; extraTiers?: number; extraK?: number }> = ({ geo, z, depth, extraTiers = 0, extraK = 1 }) => {
  const g = useMemo(() => geo.box(0.52, 0.44, depth, 0.05), [geo, depth]);
  const out: React.ReactNode[] = [];
  for (let col = 0; col < 5; col++) {
    const base = 2 + (col % 2 === 0 ? 1 : 0);
    for (let tier = 0; tier < base + extraTiers; tier++) {
      const extra = tier >= base;
      // extra tiers drop in one by one (stepped)
      const k = extra ? clamp01(extraK * (5 * extraTiers) - (col + (tier - base) * 5)) : 1;
      if (k <= 0) continue;
      const drop = (1 - k) * 1.2;
      out.push(
        <mesh key={`${col}-${tier}`} geometry={g} position={[SHIP_X0 + 1.1 + col * 0.56, 3.2 + 0.24 + tier * 0.46 + drop, z]}>
          {clay(CONT[(col * 3 + tier * 2) % CONT.length])}
        </mesh>,
      );
    }
  }
  return <>{out}</>;
};

const Bridge: React.FC<{ geo: Geo; z: number }> = ({ geo, z }) => (
  <group position={[SHIP_X0 + 0.45, 3.2, z]}>
    <mesh position={[0, 0.6, 0]} geometry={useMemo(() => geo.box(0.7, 1.2, 0.95, 0.07), [geo])}>{clay(C.cream)}</mesh>
    <mesh position={[0, 1.27, 0]} geometry={useMemo(() => geo.box(0.95, 0.22, 1.05, 0.06), [geo])}>{clay(C.cream)}</mesh>
    <mesh position={[0.02, 0.98, 0.48]}><boxGeometry args={[0.6, 0.13, 0.04]} />{clay(P.charcoal, 0.4)}</mesh>
    <mesh position={[0.02, 0.62, 0.48]}><boxGeometry args={[0.6, 0.09, 0.04]} />{clay(P.charcoal, 0.4)}</mesh>
    <mesh position={[-0.12, 1.62, -0.15]}><cylinderGeometry args={[0.15, 0.19, 0.5, 18]} />{clay(P.terracotta)}</mesh>
    <mesh position={[-0.12, 1.89, -0.15]}><cylinderGeometry args={[0.155, 0.155, 0.08, 18]} />{clay(P.charcoal)}</mesh>
  </group>
);

const BULKHEADS = [1.15, 2.15, 3.0];

const TankShip: React.FC<{ geo: Geo; s: ShipState; t: number }> = ({ geo, s, t }) => {
  const scale = 1 - 0.97 * s.crush;
  const wl = WATER_Y + 0.02; // boot-top in hull space
  const planes = useMemo(() => {
    // clipping planes are world-space: follow the hull's own waterline
    const yW = (h: number) => CY + s.y + (h - CY) * scale;
    return {
      below: [new THREE.Plane(new THREE.Vector3(0, -1, 0), yW(wl))],
      stripe: [new THREE.Plane(new THREE.Vector3(0, 1, 0), -yW(wl)), new THREE.Plane(new THREE.Vector3(0, -1, 0), yW(wl + 0.12))],
      above: [new THREE.Plane(new THREE.Vector3(0, 1, 0), -yW(wl + 0.12))],
    };
  }, [s.y, scale, wl]);
  if (scale < 0.04) return null;
  const glow = s.shell;
  const leakH = 1.75 * s.leak;
  return (
    <group position={[CX, CY + s.y, 0]} rotation={[0, 0, s.tilt]} scale={scale}>
      <group position={[-CX, -CY, 0]}>
        <mesh geometry={geo.hullRing} position={[0, 0, -BEAM]}>
          <meshStandardMaterial color={C.hullBottom} roughness={0.8} metalness={0.05} clippingPlanes={planes.below} emissive={P.mustard} emissiveIntensity={glow * 0.55} />
        </mesh>
        <mesh geometry={geo.hullRing} position={[0, 0, -BEAM]}>
          <meshStandardMaterial color={C.cream} roughness={0.8} metalness={0.02} clippingPlanes={planes.stripe} emissive={P.mustard} emissiveIntensity={glow * 0.3} />
        </mesh>
        <mesh geometry={geo.hullRing} position={[0, 0, -BEAM]}>
          <meshStandardMaterial color={C.hullTop} roughness={0.78} metalness={0.06} clippingPlanes={planes.above} emissive={P.mustard} emissiveIntensity={glow * 0.55} />
        </mesh>
        {/* interior: drawn before the punch so it stays visible through the water */}
        <mesh geometry={geo.inner} position={[0, 0, -BEAM + 0.04]} renderOrder={1}>
          <meshStandardMaterial color={C.air} roughness={0.9} emissive="#FFF4D8" emissiveIntensity={s.air * 0.35} />
        </mesh>
        {BULKHEADS.map((x, i) => (
          <mesh key={i} position={[SHIP_X0 + x, 2.1, -BEAM / 2]} renderOrder={1}>
            <boxGeometry args={[0.08, 1.85, BEAM - 0.05]} />
            <meshStandardMaterial color={C.steel} roughness={0.7} emissive={P.mustard} emissiveIntensity={s.bulk * 0.7} />
          </mesh>
        ))}
        {s.leak > 0.001 && (
          <mesh position={[SHIP_X0 + 2.575, 1.17 + leakH / 2, -BEAM / 2 + 0.01]} renderOrder={1}>
            <boxGeometry args={[0.8, leakH, BEAM - 0.08]} />
            <meshPhysicalMaterial color="#38C8FF" emissive="#1FA6E8" emissiveIntensity={0.45} roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
        )}
        {/* depth punch: keeps the tank water out of the hollow hull */}
        <mesh geometry={geo.innerHole} position={[0, 0, 0.02]} renderOrder={2} userData={{ plain: true }}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
        <Containers geo={geo} z={-0.48} depth={0.92} />
        <Bridge geo={geo} z={-0.5} />
        {/* leak crack + spray */}
        {s.leak > 0.001 && (
          <group position={[SHIP_X0 + 2.6, 1.05, 0.06]}>
            <mesh rotation={[0, 0, 0.5]} userData={{ plain: true }}><boxGeometry args={[0.32, 0.05, 0.04]} /><meshBasicMaterial color={P.charcoal} /></mesh>
            {[0, 1, 2, 3, 4].map((k) => {
              const ph = (stepFrame(t * 60, 4) / 60 * 3 + k / 5) % 1;
              return (
                <mesh key={k} position={[0.04 * (k - 2), 0.12 + ph * 0.7 * s.leak, -0.1]}>
                  <sphereGeometry args={[0.07 * (1 - ph * 0.5), 10, 8]} />
                  <meshStandardMaterial color="#9BE3FF" emissive="#38C8FF" emissiveIntensity={0.5} roughness={0.3} />
                </mesh>
              );
            })}
            {/* coral arrow: water coming in through the crack */}
            <group position={[0.0, -0.95, 0.12]}>
              <Arrow x={0} y0={0} y1={0.8} z={0} color={P.coral} r={0.07} />
            </group>
          </group>
        )}
      </group>
    </group>
  );
};

// ---------- nail, jugs, splashes ----------
const NAIL_X = -2.35;
const BigNail: React.FC<{ y: number; rot: number }> = ({ y, rot }) => (
  <group position={[NAIL_X, y, 0]} rotation={[0, 0, rot]}>
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh><cylinderGeometry args={[0.075, 0.075, 1.3, 18]} /><meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} /></mesh>
      <mesh position={[0, -0.78, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.075, 0.26, 18]} /><meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} /></mesh>
      <mesh position={[0, 0.68, 0]}><cylinderGeometry args={[0.2, 0.2, 0.07, 22]} /><meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} /></mesh>
    </group>
  </group>
);

const Splash: React.FC<{ x: number; z: number; t: number; t0: number; size?: number }> = ({ x, z, t, t0, size = 1 }) => {
  const u = t - t0;
  if (u < 0 || u > 0.9) return null;
  const k = u / 0.9;
  return (
    <group position={[x, WATER_Y + 0.04, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={0.3 + k * 1.6 * size}>
        <torusGeometry args={[0.4, 0.05 * (1 - k) + 0.01, 8, 32]} />
        {clay(C.waterTop, 0.5)}
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + rnd(i) * 0.5;
        const v = 1.1 + rnd(i + 9) * 0.8;
        return (
          <mesh key={i} position={[Math.cos(a) * u * v * size, (u * 3.2 - 5 * u * u) * size, Math.sin(a) * u * v * 0.6]}>
            <sphereGeometry args={[0.07 * size * (1 - k * 0.6), 10, 8]} />
            {clay("#CDEBFA", 0.45)}
          </mesh>
        );
      })}
    </group>
  );
};

const Jug: React.FC<{ x: number; fill: number; stream: number; side: 1 | -1 }> = ({ x, fill, stream, side }) => {
  const r = 0.55, h = 2.0, base = -0.33;
  const wallX = side * (TANK_X + 0.32);
  const spoutEnd = side * (TANK_X + 0.85);
  const top = base + 0.08 + Math.max(0.02, fill);
  return (
    <group>
      {/* spout through the tank wall */}
      <mesh position={[(wallX + spoutEnd) / 2, 2.42, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, Math.abs(spoutEnd - wallX), 14]} />
        {clay(P.mustard)}
      </mesh>
      {/* glass cylinder with tick marks */}
      <group position={[x, 0, -1.5]}>
        <mesh position={[0, base + 0.05, 0]}><cylinderGeometry args={[r + 0.12, r + 0.16, 0.1, 28]} />{clay(C.cream)}</mesh>
        <mesh position={[0, base + h / 2 + 0.1, 0]} userData={{ plain: true }}>
          <cylinderGeometry args={[r, r, h, 32, 1, true]} />
          <meshPhysicalMaterial color="#EAF6FF" transparent opacity={0.28} roughness={0.1} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {[0.4, 0.8, 1.2, 1.6].map((y) => (
          <mesh key={y} position={[0, base + 0.1 + y, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ plain: true }}>
            <torusGeometry args={[r + 0.005, 0.012, 6, 32, Math.PI * 0.6]} />
            <meshBasicMaterial color="#F6EFE3" />
          </mesh>
        ))}
        {fill > 0.005 && (
          <mesh position={[0, base + 0.1 + fill / 2, 0]}>
            <cylinderGeometry args={[r - 0.04, r - 0.04, fill, 28]} />
            {waterMat(C.water)}
          </mesh>
        )}
      </group>
      {stream > 0.01 && (
        <mesh position={[mix(spoutEnd, x, 0.35), (2.42 + top) / 2, -1.5]} rotation={[0, 0, side * 0.18]}>
          <capsuleGeometry args={[0.06 * stream, Math.max(0.1, 2.42 - top), 4, 10]} />
          {waterMat(C.waterTop)}
        </mesh>
      )}
    </group>
  );
};

// glints on the water surface (water kilau)
const Glints: React.FC<{ x0: number; x1: number; z0: number; z1: number; t: number; seed: number; level?: number }> = ({ x0, x1, z0, z1, t, seed, level = WATER_Y }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const ph = (t * (0.08 + rnd(i + seed) * 0.06) + rnd(i + seed + 20)) % 1;
      const x = mix(x0, x1, (rnd(i + seed + 40) + ph * 0.25) % 1);
      const z = mix(z0, z1, rnd(i + seed + 60));
      const a = Math.sin(ph * Math.PI);
      return (
        <mesh key={i} position={[x, level + wave(x) - WATER_Y + 0.045, z]} rotation={[-Math.PI / 2, 0, 0.2]} scale={[1, 0.25, 1]} userData={{ plain: true }}>
          <circleGeometry args={[0.16 * a + 0.02, 12]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.75 * a} depthWrite={false} />
        </mesh>
      );
    })}
  </>
);

// ---------- LAB set: seesaw ----------
const LabSet: React.FC<{ geo: Geo; t: number }> = ({ geo, t }) => {
  // stepped puppet time
  const st = stepFrame(t * 60, 4) / 60;
  const cubeIn = sm(B.baja8 - 0.1, B.baja8 + 0.2, st);
  const nCubes = Math.min(8, Math.floor(lin(B.delapan - 0.3, B.delapan + 1.4, st) * 8 + 1e-6) + (st > B.delapan + 1.4 ? 8 : 0));
  const cubesGone = sm(B.rata - 0.3, B.rata, st); // right pan cleared for the reveal
  const morph = sm(B.bentuk - 0.5, B.bentuk + 0.3, st); // cube -> hull
  const ghostIn = sm(B.airVol - 0.3, B.airVol + 0.2, st);
  // beam angle: + = right side down
  let ang = 0;
  if (st < B.rata - 0.3) ang = -0.2 * cubeIn * (1 - Math.min(8, nCubes) / 8);
  else ang = mix(-0.2, 0.2, ghostIn) * cubesGone + 0 * (1 - cubesGone);
  ang += bob(st, B.airVol + 0.2, 0.05, 3, 9);
  const L = 2.2;
  const cube = 0.8;
  const cubeGeo = useMemo(() => geo.box(cube, cube, cube, 0.06), [geo]);
  return (
    <group position={[LAB_X, -0.33, 0]}>
      {/* fulcrum */}
      <mesh position={[0, 0.65, 0]}><coneGeometry args={[0.55, 1.3, 4]} />{clay(P.terracotta)}</mesh>
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.9, 1.0, 0.12, 28]} />{clay(P.earthBrown)}</mesh>
      <group position={[0, 1.38, 0]} rotation={[0, 0, -ang]}>
        <mesh geometry={useMemo(() => geo.box(5.4, 0.16, 0.6, 0.07), [geo])}>{clay(P.mustard)}</mesh>
        {[-1, 1].map((sx) => (
          <group key={sx} position={[sx * L, 0.12, 0]} rotation={[0, 0, ang]}>
            <mesh><cylinderGeometry args={[1.15, 1.05, 0.1, 28]} />{clay(P.dustyTeal)}</mesh>
          </group>
        ))}
        {/* left pan: steel cube, then the mini cut hull */}
        <group position={[-L, 0.17, 0]} rotation={[0, 0, ang]}>
          {cubeIn > 0 && morph < 1 && (
            <mesh position={[0, cube / 2 + (1 - cubeIn) * 2.5, 0]} scale={1 - morph}>
              <boxGeometry args={[cube, cube, cube]} />
              <meshStandardMaterial color={C.steel} roughness={0.45} metalness={0.3} />
            </mesh>
          )}
          {morph > 0 && (
            <group scale={0.5 * morph} position={[-0.42, -0.5, 0.26]}>
              <mesh geometry={geo.hullRing} position={[0, 0, -BEAM]}>{clay(C.hullTop, 0.78)}</mesh>
              <mesh geometry={geo.inner} position={[0, 0, -BEAM + 0.04]}>
                <meshStandardMaterial color={C.air} roughness={0.9} emissive="#FFF4D8" emissiveIntensity={win(B.bajaUdara, B.itulah, t) * 0.4} />
              </mesh>
            </group>
          )}
        </group>
        {/* right pan: 8 water cubes, later the hull-sized block of water */}
        <group position={[L, 0.17, 0]} rotation={[0, 0, ang]}>
          {Array.from({ length: 8 }, (_, i) => {
            if (i >= nCubes || cubesGone >= 1) return null;
            const gx = (i % 2) - 0.5, gz = (Math.floor(i / 2) % 2) - 0.5, gy = Math.floor(i / 4);
            return (
              <mesh key={i} geometry={cubeGeo} position={[gx * cube * 1.04, cube / 2 + gy * cube * 1.04, gz * cube * 1.04]} scale={1 - cubesGone}>
                {waterMat(C.water)}
              </mesh>
            );
          })}
          {ghostIn > 0 && (
            <group scale={0.5} position={[-0.42, -0.5 + (1 - ghostIn) * 3, 0.26]}>
              <mesh geometry={geo.ghostFull} position={[0, 0, -BEAM]}>{waterMat(C.water)}</mesh>
            </group>
          )}
        </group>
      </group>
      {/* table dressing */}
      <Coil p={[-3.6, 0.11, -1.6]} r={0.3} color={P.coral} rot={0.4} />
      <Coil p={[3.5, 0.11, -1.4]} r={0.26} color={P.olive} rot={2.0} />
      <SpareNail p={[1.0, 0.08, -1.8]} ry={0.5} />
    </group>
  );
};

const BowName: React.FC = () => {
  const tex = useWordTex("AUDIRA", "#F6EFE3", null, 768, 192);
  return (
    <mesh position={[SHIP_X0 + 3.0, 3.0, BEAM + 0.04]} rotation={[0, 0, 0.12]} userData={{ plain: true }}>
      <planeGeometry args={[0.95, 0.24]} />
      <meshBasicMaterial map={tex} transparent />
    </mesh>
  );
};

// ---------- SEA set: whole ship with a load line ----------
const SeaSet: React.FC<{ geo: Geo; t: number; tex: THREE.Texture }> = ({ geo, t, tex }) => {
  const st = stepFrame(t * 60, 4) / 60;
  const load = lin(B.muatan - 0.2, B.garis, st); // containers dropping in
  const sink = -0.35 * sm(B.muatan, B.supaya, st) + bob(st, B.supaya, 0.03, 3, 7);
  const ox = SEA_X - CX;
  const yW = (h: number) => h + sink;
  const below = [new THREE.Plane(new THREE.Vector3(0, -1, 0), yW(WATER_Y + 0.32))];
  const above = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -yW(WATER_Y + 0.32))];
  const markGlow = win(B.garis, B.dalamnya, t, 0.3);
  return (
    <group>
      <mesh geometry={geo.sea} position={[SEA_X, 0, -2.5]}>{waterMat(C.water)}</mesh>
      <mesh position={[SEA_X, -0.18, 0]}><boxGeometry args={[8.9, 0.3, 5.6]} />{clay(C.tank)}</mesh>
      <Glints x0={SEA_X - 4} x1={SEA_X + 4} z0={-2.3} z1={2.3} t={t} seed={70} />
      <group position={[ox, sink, 0]}>
        <mesh geometry={geo.hullFull} position={[0, 0, -BEAM]}>
          <meshStandardMaterial color={C.hullBottom} roughness={0.8} metalness={0.05} clippingPlanes={below} />
        </mesh>
        <mesh geometry={geo.hullFull} position={[0, 0, -BEAM]}>
          <meshStandardMaterial color={C.hullTop} roughness={0.78} metalness={0.06} clippingPlanes={above} />
        </mesh>
        <Containers geo={geo} z={0} depth={1.9} extraTiers={1} extraK={load} />
        <group position={[SHIP_X0 + 0.45, 3.2, 0]}>
          <mesh position={[0, 0.6, 0]} geometry={useMemo(() => geo.box(0.7, 1.2, 1.9, 0.07), [geo])}>{clay(C.cream)}</mesh>
          <mesh position={[0, 1.27, 0]} geometry={useMemo(() => geo.box(0.95, 0.22, 2.0, 0.06), [geo])}>{clay(C.cream)}</mesh>
          <mesh position={[0.36, 0.98, 0]}><boxGeometry args={[0.04, 0.13, 1.6]} />{clay(P.charcoal, 0.4)}</mesh>
          <mesh position={[-0.12, 1.62, 0]}><cylinderGeometry args={[0.17, 0.21, 0.5, 18]} />{clay(P.terracotta)}</mesh>
        </group>
        <BowName />
        {/* load-line mark amidships; ring centre = loaded waterline (sink 0.35) */}
        <mesh position={[SHIP_X0 + 1.9, WATER_Y + 0.43, BEAM + 0.035]} userData={{ plain: true }}>
          <planeGeometry args={[0.95, 0.95]} />
          <meshBasicMaterial map={tex} transparent color={new THREE.Color(1, 1, 1).lerp(new THREE.Color("#FFE07A"), markGlow)} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- in-world AUDIRA lettering (canvas texture, redrawn once the display font is ready) ----------
const useWordTex = (text: string, fg: string, bg: string | null, w = 1024, h = 256) => {
  const ready = typeof document !== "undefined" && document.fonts.check(`100px '${ANTON}'`);
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d")!;
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `${Math.round(h * 0.62)}px '${ANTON}', sans-serif`;
    g.fillText(text, w / 2, h / 2 + h * 0.03);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, fg, bg, w, h, ready]);
};

/** clay plaque standing in front of the tank: "AUDIRA EXPLAINED" pressed into terracotta */
const Plaque: React.FC = () => {
  const tex = useWordTex("AUDIRA EXPLAINED", "#F6EFE3", null, 1400, 200);
  const g = useMemo(() => new RoundedBoxGeometry(3.3, 0.58, 0.14, 3, 0.06), []);
  return (
    <group position={[0, -0.02, 0.75]} rotation={[-0.32, 0, 0]}>
      <mesh geometry={g}>{clay(P.terracotta)}</mesh>
      <mesh position={[0, 0, 0.075]} userData={{ plain: true }}>
        <planeGeometry args={[3.0, 0.43]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </group>
  );
};

// ---------- paper boat ----------
const PaperBoat: React.FC<{ x: number; y: number; z: number; s: number; rot: number }> = ({ x, y, z, s, rot }) => {
  const g = useMemo(() => {
    const sh = new THREE.Shape([new THREE.Vector2(-0.6, 0.25), new THREE.Vector2(0.6, 0.25), new THREE.Vector2(0.38, 0), new THREE.Vector2(-0.38, 0)]);
    return ext(sh, 0.34, 0.01);
  }, []);
  if (s <= 0.01) return null;
  return (
    <group position={[x, y, z]} scale={s} rotation={[0, 0.5, rot]}>
      <mesh geometry={g} position={[0, 0, -0.17]}>{clay("#FBF7EE", 0.9)}</mesh>
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.28, 0.5, 4]} />
        {clay("#FBF7EE", 0.9)}
      </mesh>
    </group>
  );
};

// ---------- 2D overlay pieces ----------
const Chip: React.FC<{ text: string; k: number; y?: number; accent?: boolean; size?: number }> = ({ text, k, y = 236, accent = false, size = 46 }) => {
  if (k <= 0.001) return null;
  const pop = 0.85 + 0.15 * k + Math.sin(k * Math.PI) * 0.06;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.5) }}>
      <div
        style={{
          transform: `scale(${pop})`,
          fontFamily: MANROPE,
          fontWeight: 600,
          fontSize: size,
          color: accent ? "#3A1E0E" : C.cream,
          background: accent ? "#FFD25E" : P.terracotta,
          padding: "14px 34px 18px",
          borderRadius: 999,
          boxShadow: `0 8px 0 ${accent ? "#C98F1F" : "#8E3520"}, 0 16px 26px rgba(70,30,10,0.28)`,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Tag: React.FC<{ at: { x: number; y: number }; text: string; k: number; dy?: number; dx?: number; color?: string }> = ({ at, text, k, dy = 0, dx = 0, color = C.cream }) => {
  if (k <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: Math.min(860, Math.max(220, at.x + dx)),
        top: at.y + dy,
        transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * k})`,
        opacity: k,
        fontFamily: MANROPE,
        fontWeight: 600,
        fontSize: 40,
        color,
        whiteSpace: "nowrap",
        textShadow: "0 3px 0 rgba(43,39,37,0.6), 0 6px 14px rgba(43,39,37,0.35)",
      }}
    >
      {text}
    </div>
  );
};

// label pinned to a 3D point with a leader line
const Callout: React.FC<{ at: { x: number; y: number }; text: string; k: number; dx: number; dy: number }> = ({ at, text, k, dx, dy }) => {
  if (k <= 0.001) return null;
  const lx = at.x + dx, ly = at.y + dy;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible", opacity: k }} width={1080} height={1920}>
        <line x1={lx} y1={ly} x2={mix(lx, at.x, k)} y2={mix(ly, at.y, k)} stroke="#FFE07A" strokeWidth={7} strokeLinecap="round" />
        <circle cx={at.x} cy={at.y} r={14 * k} fill="none" stroke="#FFE07A" strokeWidth={6} />
      </svg>
      <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * k})`, opacity: k, fontFamily: MANROPE, fontWeight: 600, fontSize: 44, color: "#3A1E0E", background: "#FFD25E", padding: "8px 26px 12px", borderRadius: 999, boxShadow: "0 6px 0 #C98F1F", whiteSpace: "nowrap" }}>
        {text}
      </div>
    </>
  );
};

// whip-pan smear: rolled-clay streaks sliding across the frame
const Smear: React.FC<{ k: number; dir: number; t: number }> = ({ k, dir, t }) => {
  if (k <= 0.02) return null;
  const cols = [P.mustard, P.coral, C.cream, P.dustyTeal, C.water, P.terracotta];
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: 11 }, (_, i) => {
        const y = 140 + rnd(i + 5) * 1500;
        const w = 300 + rnd(i + 31) * 700;
        const h = 14 + rnd(i + 17) * 34;
        const x = ((rnd(i + 3) * 1600 + dir * t * 4200) % 2200 + 2200) % 2200 - 600;
        return (
          <div key={i} style={{ position: "absolute", left: `${(x / 1080) * 100}%`, top: `${(y / 1920) * 100}%`, width: `${(w / 1080) * 100}%`, height: `${(h / 1920) * 100}%`, borderRadius: 999, background: cols[i % cols.length], opacity: 0.55 * k, boxShadow: "0 4px 0 rgba(0,0,0,0.12)" }} />
        );
      })}
    </AbsoluteFill>
  );
};

// karaoke captions: phrases of up to 5 words, active word on a mustard clay chip
const PHRASES = (() => {
  const out: { words: { w: string; s: number; e: number }[]; s: number; e: number }[] = [];
  for (const c of TL.clips) {
    const w = c.words;
    const n = Math.ceil(w.length / 5);
    const size = Math.ceil(w.length / n);
    for (let i = 0; i < w.length; i += size) {
      const g = w.slice(i, i + size);
      out.push({ words: g, s: g[0].s, e: g[g.length - 1].e });
    }
  }
  return out.map((p, i) => ({ ...p, end: Math.min(p.e + 0.35, out[i + 1] ? out[i + 1].s : p.e + 0.6) }));
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const p = PHRASES.find((x) => t >= x.s - 0.08 && t < x.end);
  if (!p) return null;
  const st = stepFrame(t * 60, 4) / 60;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1385, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 14px" }}>
      {p.words.map((w, i) => {
        const active = t >= w.s && t < Math.max(w.e, w.s + 0.12);
        const done = t >= w.e;
        const b = active ? 1 + 0.1 * Math.sin(clamp01((st - w.s) / 0.2) * Math.PI) : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: MANROPE,
              fontWeight: 600,
              fontSize: 54,
              lineHeight: 1.15,
              padding: "4px 16px 8px",
              borderRadius: 22,
              transform: `scale(${b}) translateY(${active ? -4 : 0}px)`,
              color: active ? "#3A1E0E" : done ? C.cream : "rgba(246,239,227,0.82)",
              background: active ? "#FFD25E" : "transparent",
              boxShadow: active ? "0 6px 0 #C98F1F" : "none",
              textShadow: active ? "none" : "0 3px 0 rgba(43,39,37,0.65), 0 6px 14px rgba(43,39,37,0.4)",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- the film ----------
export const Film: React.FC = () => {
  useAnton();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const st = stepFrame(t * 60, 4) / 60; // puppet clock (15 fps steps)
  const cam = useMemo(() => camAt(t), [t]);
  const tex = usePrintTex();
  const geo = useGeo();
  const plim = useMemo(() => plimsollTex(), []);

  // --- nail: falls with the ship, sinks straight to the floor
  const nailY = st < B.hitNail ? mix(5.2, WATER_Y, (st / B.hitNail) ** 2) : mix(WATER_Y, 0.1, sm(B.hitNail, B.hitNail + 1.0, st));
  const nailRot = st < B.hitNail ? 0.5 - st : mix(0.0, 0.08, sm(B.hitNail, B.hitNail + 1.0, st));

  // --- tank ship state
  const s: ShipState = { y: 0, tilt: 0, crush: 0, leak: 0, shell: 0, air: 0, bulk: 0, arrows: 0 };
  if (st < B.hitShip) s.y = mix(3.2, 0, (st / B.hitShip) ** 2);
  else s.y = bob(st, B.hitShip, 0.5, 2.0, 5.5);
  s.shell = win(B.cangkang, B.mengurung + 0.2, t, 0.2);
  s.air = win(B.mengurung, B.memindahkan2 + 0.6, t, 0.2);
  s.bulk = win(B.sekat - 0.1, B.ruang + 0.3, t, 0.2);
  s.leak = sm(B.bocor - 0.3, B.ruang, st) * (1 - sm(S.OUTRO[0], S.OUTRO[0] + 0.5, st));
  s.tilt = 0.03 * s.leak;
  s.y += -0.07 * s.leak;
  // payoff: crush into a steel lump -> sinks; expand again -> floats
  const c0 = B.oKapal, c1 = c0 + 0.9;
  const fall0 = c1 + 0.1, fall1 = fall0 + 0.8;
  const e0 = B.oTapi, e1 = e0 + 0.9, r1 = e1 + 1.0;
  const crush = sm(c0, c1, st) * (1 - sm(e0, e1, st));
  s.crush = crush;
  const LUMP_FLOOR = 0.45 - CY;
  if (st >= c0) {
    if (st < e0) s.y = mix(0, LUMP_FLOOR, sm(fall0, fall1, st) ** 1.6);
    else if (st < e1) s.y = mix(LUMP_FLOOR, -0.95, sm(e0, e1, st));
    else s.y = mix(-0.95, 0, sm(e1, r1, st)) + bob(st, r1, 0.18, 2.4, 6);
  }
  const lumpR = 0.42 * Math.sqrt(crush);

  // buoyancy arrows under the keel
  const arrowsK = Math.max(win(B.didorong, S.REVEAL[0] - 0.4, t, 0.3), win(B.itulah, S.REVEAL[1] + 0.4, t, 0.3));

  // jugs
  const rightFill = 1.3 * sm(B.seberat, B.pindahkan + 0.3, st);
  const rightStream = win(B.seberat, B.pindahkan + 0.3, t, 0.15);
  const leftFill = 0.07 * sm(B.memindahkan1, B.memindahkan1 + 0.8, st);
  const leftStream = win(B.memindahkan1, B.memindahkan1 + 0.8, t, 0.1) * 0.5;

  // displaced-water ghost slides out of the hull
  const ghostK = win(B.memindahkan2 - 0.1, S.MEKANISME[1] + 0.5, t, 0.35);

  // paper boat
  const boatK = sm(B.perahu - 0.3, B.perahu + 0.3, st);
  const boatY = mix(4.0, WATER_Y + 0.02, sm(B.perahu - 0.3, B.perahu + 0.2, st) ** 2) + bob(st, B.perahu + 0.2, 0.08, 3, 8);

  // labels
  const lNail = project(cam, [NAIL_X, Math.max(0.1, nailY), 0.2]);
  const lKeel = project(cam, [CX, 0.55, 0.3]);
  const lJugR = project(cam, [4.6, 2.0, -1.5]);
  const lJugL = project(cam, [-4.6, 1.2, -1.5]);
  const lGhost = project(cam, [CX, 2.0, 1.4]);
  const lLabL = project(cam, [LAB_X - 2.2, 2.5, 0]);
  const lLabR = project(cam, [LAB_X + 2.2, 2.5, 0]);
  const seaSink = -0.35 * sm(B.muatan, B.supaya, st) + bob(st, B.supaya, 0.03, 3, 7);
  const lMark = project(cam, [SEA_X - CX + SHIP_X0 + 1.9 - 0.1, WATER_Y + 0.35 + seaSink, BEAM + 0.05]);
  // whip-pan speed (world units / s of the look-at point) drives the clay smear
  const speed = Math.abs(sample(CAM, t + 0.02)[3] - sample(CAM, t - 0.02)[3]) / 0.04;
  const smear = clamp01((speed - 6) / 22);
  const dir = Math.sign(sample(CAM, t + 0.02)[3] - sample(CAM, t - 0.02)[3]) || 1;
  const lNailArrow = project(cam, [NAIL_X + 0.6, 1.2, 0.2]);

  const outroStart = S.OUTRO[1] + 0.2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="ep049whip" x="-5%" y="0" width="110%" height="100%">
          <feGaussianBlur stdDeviation={`${(smear * 26 * width) / 1080} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: smear > 0.02 ? "url(#ep049whip)" : undefined }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ fov: cam.fov, near: 0.1, far: 200, position: cam.pos }}
      >
        <color attach="background" args={[C.bg]} />
        <CameraRig cam={cam} />
        <hemisphereLight args={["#fff2df", "#7a5a44", 0.95]} />
        <LightRig tx={cam.target[0]} />
        <pointLight position={[cam.target[0] + 6, 4, 5]} intensity={22} color="#ffd2a8" />
        <pointLight position={[cam.target[0] - 2, 6, -7]} intensity={30} color={P.warmRimLight} />
        <mesh position={[0, 0, -12]}><planeGeometry args={[90, 60]} /><meshStandardMaterial color={C.sweep} roughness={0.95} /></mesh>
        <mesh position={[0, -0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[45, 48]} /><meshStandardMaterial color={C.table} roughness={0.9} /></mesh>

        {/* ---- TANK set ---- */}
        <Tank />
        <mesh geometry={geo.water} position={[0, 0, -TANK_D]} renderOrder={3}>{waterMat(C.water)}</mesh>
        <Glints x0={-TANK_X} x1={TANK_X} z0={-2.8} z1={-0.2} t={t} seed={10} />
        <BigNail y={nailY} rot={nailRot} />
        <Splash x={NAIL_X} z={-0.5} t={st} t0={B.hitNail} size={0.6} />
        <Splash x={CX} z={-0.6} t={st} t0={B.hitShip} size={1.4} />
        <Splash x={CX} z={-0.6} t={st} t0={fall0} size={0.8} />
        <TankShip geo={geo} s={s} t={t} />
        {lumpR > 0.01 && (
          <mesh position={[CX, CY + s.y, -0.1]} scale={[1.15, 0.9, 1]}>
            <icosahedronGeometry args={[lumpR, 3]} />
            <meshStandardMaterial color={C.steel} roughness={0.45} metalness={0.3} />
          </mesh>
        )}
        {arrowsK > 0.01 && (
          <group scale={[1, arrowsK, 1]}>
            {[0.75, 1.5, 2.25, 3.0].map((x, i) => <Arrow key={i} x={SHIP_X0 + x} y0={0.18} y1={0.96} />)}
          </group>
        )}
        {/* nail forces: big weight down, tiny buoyancy up */}
        {win(B.paku2, B.lambung, t) > 0.01 && (
          <group>
            <group position={[NAIL_X + 0.35, 1.75, 0.1]} rotation={[0, 0, Math.PI]} scale={win(B.paku2, B.lambung, t)}>
              <Arrow x={0} y0={0} y1={1.35} z={0} color={P.coral} r={0.1} />
            </group>
            <group scale={win(B.memindahkan1, B.lambung, t)} position={[NAIL_X - 0.6, 0.2, 0]}>
              <Arrow x={0} y0={0} y1={0.42} z={0.1} r={0.05} />
            </group>
          </group>
        )}
        {ghostK > 0.01 && (
          <mesh geometry={geo.ghost} position={[0, 0.25 * ghostK, -BEAM + 1.6 * ghostK]} renderOrder={4} userData={{ plain: true }}>
            <meshPhysicalMaterial color="#7CC6F0" transparent opacity={0.6 * ghostK} roughness={0.2} clearcoat={1} depthWrite={false} />
          </mesh>
        )}
        <Jug x={4.6} fill={rightFill} stream={rightStream} side={1} />
        <Jug x={-4.6} fill={leftFill} stream={leftStream} side={-1} />
        <Plaque />
        <PaperBoat x={-2.4} y={boatY} z={-0.7} s={0.75 * boatK} rot={0.06 * Math.sin(st * 3)} />
        <Coil p={[0.6, -0.22, 7.6]} r={0.36} color={P.mustard} rot={0.7} />
        <Coil p={[-2.4, -0.22, 7.0]} r={0.24} color={P.olive} rot={2.2} />
        <group position={[3.3, -0.12, 7.4]} rotation={[-Math.PI / 2 + 0.18, 0, 0.4]}>
          <mesh><torusGeometry args={[0.72, 0.24, 16, 40]} />{clay(P.coral)}</mesh>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} rotation={[0, 0, (k * Math.PI) / 2 + Math.PI / 4]}><torusGeometry args={[0.72, 0.245, 16, 40, 0.38]} />{clay(C.cream)}</mesh>
          ))}
        </group>

        {/* ---- LAB and SEA sets ---- */}
        <LabSet geo={geo} t={t} />
        <SeaSet geo={geo} t={t} tex={plim} />
        <Tactile tex={tex} />
      </ThreeCanvas>
      </AbsoluteFill>
      <Smear k={smear} dir={dir} t={t} />

      <AbsoluteFill style={{ transform: `scale(${width / 1080})`, transformOrigin: "0 0", width: 1080, height: 1920 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 42%, transparent 60%, rgba(60,30,15,0.3) 100%)" }} />

        {/* HOOK */}
        <Tag at={lNail} text="paku baja" k={win(0.5, 2.6, t)} dy={-70} />
        <Chip text="kapal baja · ribuan ton" k={win(B.ribuan - 0.1, B.kok - 0.1, t)} />
        {t >= B.kok - 0.05 && t < S.HOOK[1] + 0.6 && (
          <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", fontFamily: `'${ANTON}'`, fontSize: 170, color: "#FFE07A", textShadow: "0 9px 0 #B5532F, 0 18px 30px rgba(70,30,10,0.35)", transform: `scale(${0.8 + 0.2 * sm(B.kok - 0.05, B.kok + 0.2, stepFrame(t * 60, 4) / 60)})`, opacity: 1 - sm(S.HOOK[1] + 0.3, S.HOOK[1] + 0.6, t) }}>
            KOK BISA?
          </div>
        )}

        {/* KONTEKS */}
        <Chip text="baja ≈ 8× lebih padat dari air laut" k={win(B.delapan - 0.1, B.bukan - 0.5, t)} size={42} />
        <Chip text="bukan bahannya…" k={win(B.bukan - 0.1, B.bentuk - 0.3, t)} />
        <Chip text="…tapi BENTUKNYA" k={win(B.bentuk - 0.3, S.KONTEKS[1] + 0.5, t)} accent />

        {/* MEKANISME */}
        <Chip text="hukum Archimedes" k={win(B.archi - 0.1, B.paku2 - 0.4, t)} />
        <Tag at={lKeel} text="gaya apung ↑" k={win(B.didorong, B.paku2 - 0.4, t)} dy={40} />
        <Tag at={lJugR} text="air yang dipindahkan" k={win(B.seberat, B.paku2 - 0.4, t)} dx={-150} dy={-200} />
        <Tag at={lNailArrow} text="berat" k={win(B.paku2, B.lambung - 0.2, t)} dx={60} color="#FFD7C8" />
        <Tag at={lJugL} text="sedikit air" k={win(B.memindahkan1, B.lambung - 0.2, t)} dx={120} dy={-120} />
        <Chip text="paku kalah" k={win(B.kalah - 0.2, B.lambung - 0.1, t)} accent />
        <Chip text="cangkang baja tipis" k={win(B.cangkang - 0.1, B.mengurung - 0.1, t)} />
        <Chip text="ruang besar berisi udara" k={win(B.mengurung - 0.1, B.memindahkan2 - 0.1, t)} />
        <Tag at={lGhost} text="banyak sekali air!" k={win(B.memindahkan2, S.MEKANISME[1] + 0.4, t)} dy={-40} />

        {/* REVEAL */}
        <Tag at={lLabL} text="baja + udara" k={win(B.bajaUdara - 0.1, S.REVEAL[1] - 1.9, t)} dy={-60} />
        <Tag at={lLabR} text="air sebanyak volume itu" k={win(B.airVol - 0.1, S.REVEAL[1] - 1.9, t)} dy={-60} />
        <Chip text="rata-rata lebih ringan dari air" k={win(B.ringan - 0.1, S.REVEAL[1] - 1.9, t)} accent size={42} />
        <Chip text="kapal mengapung ✓" k={win(B.itulah + 0.2, S.REVEAL[1] + 0.5, t)} accent />

        {/* PAYOFF */}
        <Callout at={lMark} text="garis muat" k={win(B.garis - 0.1, S.PAYOFF[0] + 6.0, t)} dx={-230} dy={150} />
        <Chip text="muatan dibatasi garis muat" k={win(B.garis - 0.1, B.supaya + 0.2, t)} size={42} />
        <Chip text="supaya tidak terlalu dalam" k={win(B.supaya + 0.2, B.dalamnya - 0.2, t)} size={42} />
        <Chip text="sekat kedap air" k={win(B.sekat - 0.1, B.bocor - 0.1, t)} accent />
        <Chip text="bocor tertahan di satu ruang" k={win(B.bocor - 0.1, S.PAYOFF[1] + 0.5, t)} size={42} />

        {/* OUTRO */}
        <Chip text="bukan karena ringan" k={win(B.oKapal, B.oTapi - 0.1, t)} />
        <Chip text="tapi karena BENTUKNYA" k={win(B.oTapi - 0.1, B.perahu - 1.2, t)} accent />
        <Chip text="coba pakai perahu kertas?" k={win(B.perahu - 1.0, ws("Ini") - 0.1, t)} size={42} />

        <Captions t={t} />
      </AbsoluteFill>
      <Outro start={outroStart} />
    </AbsoluteFill>
  );
};
