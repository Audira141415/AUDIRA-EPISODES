// EP05 Sisi Bulan — one component + camera pose + sun per scene (multi-scene director, see MoonFilm.tsx).
// Every pose moves through its scene (push, orbit, truck, crane, tilt); nothing is parked.
import React from "react";
import * as THREE from "three";
import type { FilmShot } from "../../core/scene/FilmScene.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { Arrow, Earth, LabelPlate, Moon, Sun, glowTex } from "./bodies.tsx";
import { lerp, lerp3, ramp, SCENES, type SceneId } from "./timeline.ts";

type V3 = [number, number, number];
export type SceneOut = {
  node: React.ReactNode;
  shot: FilmShot;
  sunPos: V3;
  sunI: number;
  sunColor: string;
  fill: number;
};

const span = (id: SceneId) => SCENES.find((s) => s.id === id)!;
/** 0→1 progress through a scene. */
const prog = (t: number, id: SceneId) => {
  const s = span(id);
  return Math.min(1, Math.max(0, (t - s.start) / (s.end - s.start)));
};
const pop = (t: number, at: number, d = 0.45) => {
  const k = ramp(t, at, at + d);
  return k <= 0 ? 0.0001 : k + Math.sin(k * Math.PI) * 0.12;
};

// ── 1 hook: Moon close-up, rim light from the left, push-in + 15° orbit ────
const hook = (t: number): SceneOut => {
  const k = prog(t, "hook");
  const a = lerp(-0.12, 0.14, k);
  const d = lerp(9.0, 7.2, k);
  const q = ramp(t, 1.8, 2.6);
  return {
    node: (
      <group>
        <Moon radius={2} rotY={0.25 + t * 0.03} />
        <group position={[2.0, 1.9, -1.6]} scale={pop(t, 1.8)}>
          <LabelPlate text="?" sub="SISI BELAKANG" width={2.2} opacity={q} />
        </group>
      </group>
    ),
    shot: { pos: [Math.sin(a) * d, 0.25, Math.cos(a) * d], target: [0.15, 0.1, 0], fov: 38 },
    sunPos: [-12, 1, -3],
    sunI: 3.4,
    sunColor: "#FFF4E6",
    fill: 0.05,
  };
};

// ── 2 nights: five identical faces in a row, truck along x ────────────────
const nights = (t: number): SceneOut => {
  const k = prog(t, "nights");
  const x = lerp(-3.2, 3.2, k);
  return {
    node: (
      <group>
        {[0, 1, 2, 3, 4].map((i) => {
          const at = 4.7 + i * 0.55;
          return (
            <group key={i} position={[-4 + i * 2, 0.3, 0]} scale={pop(t, at)}>
              <Moon radius={0.8} rotY={0} />
              <LabelPlate text={`Malam ${i + 1}`} width={1.5} position={[0, -1.1, 0]} />
            </group>
          );
        })}
      </group>
    ),
    shot: { pos: [x, 0.3, 6.4], target: [x * 0.92, -0.3, 0], fov: 36 },
    sunPos: [-3, 3, 12],
    sunI: 2.8,
    sunColor: "#FFF6EA",
    fill: 0.2,
  };
};

// ── 3 orbit: top view, Moon keeps its marked face to Earth over one lap ───
const ORBIT_R = 5;
const orbit = (t: number): SceneOut => {
  const a = Math.PI * 2 * ramp(t, 13.2, 24.0) - 0.0;
  const mp: V3 = [Math.sin(a) * ORBIT_R, 0, Math.cos(a) * ORBIT_R];
  const sat = t * 0.9;
  const c = ramp(t, 12.5, 26.1);
  const el = lerp(1.45, 0.9, c); // elevation, radians (top → ~50°)
  const az = lerp(0.0, 0.5, c);
  const dist = lerp(15.5, 14, c);
  return {
    node: (
      <group>
        <Earth radius={1.2} spin={t * 0.6} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ORBIT_R, 0.025, 8, 160]} />
          <meshBasicMaterial color="#3AA8FF" transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <Moon radius={0.75} position={mp} rotY={a + Math.PI} marker />
        <group position={[Math.cos(sat) * 2.4, 0.4, -Math.sin(sat) * 2.4]} rotation={[0, sat, 0]}>
          <AssetModel id="comm-satellite-fdc2cd" size={0.7} metalness={0.6} roughness={0.35} />
        </group>
        <LabelPlate text="AUDIRA LAB" sub="ORBIT 1:1" width={3.2} position={[-3.2, -0.02, 6.8]} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
    ),
    shot: {
      pos: [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist + 0.01],
      target: [0, 0, 0.6],
      fov: 42,
    },
    sunPos: [-14, 9, 6],
    sunI: 3.0,
    sunColor: "#FFF6EA",
    fill: 0.32,
  };
};

// ── 4 bulge: Earth top, Moon bottom, stretched, bulge pulled back = brake ─
const bulge = (t: number): SceneOut => {
  const st = lerp(1, 1.35, ramp(t, 28.2, 30.0));
  const decay = 1 - ramp(t, 30.6, 38.1);
  const bulgeAng = 0.4 * Math.sin((t - 30.6) * 2.6) * decay * ramp(t, 30.4, 31.2);
  const w = 1 - ramp(t, 28.5, 38.1);
  const rotY = -Math.PI / 2 + 5 * w * w; // spins, slows, locks with the near side to Earth (-X)
  const arrows = ramp(t, 28.2, 28.9);
  const k = prog(t, "bulge");
  return {
    node: (
      <group rotation={[0, 0, -Math.PI / 2]}>
        <Earth radius={1.6} position={[-5, 0, 0]} spin={t * 0.5} />
        <Moon radius={1.4} position={[2.5, 0, 0]} rotY={rotY} stretch={st} stretchAxisY={bulgeAng} />
        <group scale={[arrows, arrows, arrows]} position={[0.6, 0, 0]}>
          <Arrow length={1.9} rotation={[0, Math.PI, 0]} />
          <Arrow length={1.4} position={[0.4, 0.75, 0]} rotation={[0, Math.PI, 0]} thickness={0.05} />
          <Arrow length={1.4} position={[0.4, -0.75, 0]} rotation={[0, Math.PI, 0]} thickness={0.05} />
        </group>
        <group position={[3.6, 3.2, 2.2]} rotation={[t * 0.2, t * 0.15, 0]}>
          <AssetModel id="large-asteroid-391721" size={1.3} tint="#8A8178" roughness={0.95} />
        </group>
      </group>
    ),
    shot: { pos: lerp3([0.6, 1.0, 15.5], [-0.6, 0.4, 13.8], k), target: [0, 0.9, 0], fov: 40 },
    sunPos: [10, 6, 10],
    sunI: 3.0,
    sunColor: "#FFF6EA",
    fill: 0.25,
  };
};

// ── 5 wobble: libration close-up ─────────────────────────────────────────
const wobble = (t: number): SceneOut => {
  const k = prog(t, "wobble");
  const on = ramp(t, 39.4, 40.4);
  return {
    node: (
      <Moon
        radius={2}
        rotY={0.105 * Math.sin(((t - 39.3) * Math.PI * 2) / 3.2) * on}
        rotX={0.105 * Math.sin(((t - 39.3) * Math.PI * 2) / 4.1) * on}
      />
    ),
    shot: { pos: lerp3([-1.4, 0.0, 8.6], [1.3, 0.35, 8.3], k), target: [0, 0, 0], fov: 38 },
    sunPos: [-9, 2, 3],
    sunI: 3.2,
    sunColor: "#FFF6EA",
    fill: 0.05,
  };
};

// ── 6 farside: sunlight on the far side, camera orbits behind ────────────
const farside = (t: number): SceneOut => {
  const k = ramp(t, 46.1, 51.7);
  const phi = lerp(0.35, Math.PI - 0.45, k);
  const d = 8.6;
  return {
    node: (
      <group>
        <Moon radius={2} rotY={0} />
        <Sun radius={3.4} position={[-16, 5, -60]} />
      </group>
    ),
    shot: { pos: [Math.sin(phi) * d, lerp(0.6, 1.2, k), Math.cos(phi) * d], target: [0, 0, 0], fov: 40 },
    sunPos: [-16, 5, -60],
    sunI: 3.8,
    sunColor: "#FFF2DC",
    fill: 0.05,
  };
};

const CRATERS: [number, number, number][] = [
  [-0.6, -3.4, 1.1], [3.8, -6.0, 2.4], [-5.4, -1.4, 0.55], [-3.4, -9.0, 3.2],
];
let _reg: THREE.CanvasTexture | null = null;
/** Grey regolith speckle (tiled) so the ground does not read as flat plastic. */
const regolithTex = () => {
  if (_reg) return _reg;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#B4B1AA";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const v = 120 + r() * 110;
    g.fillStyle = `rgba(${v},${v - 2},${v - 6},${0.25 + r() * 0.35})`;
    const s = 1 + r() * (r() < 0.06 ? 9 : 3);
    g.beginPath();
    g.arc(r() * 256, r() * 256, s, 0, Math.PI * 2);
    g.fill();
  }
  _reg = new THREE.CanvasTexture(c);
  _reg.wrapS = _reg.wrapT = THREE.RepeatWrapping;
  _reg.repeat.set(36, 36);
  _reg.colorSpace = THREE.SRGBColorSpace;
  return _reg;
};
const ROCKS: [number, number, number][] = [[-4.4, 1.0, 0.35], [3.6, 0.9, 0.22], [-5.5, -4, 0.6], [5.2, -3.2, 0.45]];
// ── shared lunar ground ─────────────────────────────────────────────────
const Ground: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[80, 64]} />
      <meshStandardMaterial color="#77746F" map={regolithTex()} bumpMap={regolithTex()} bumpScale={0.6} roughness={1} />
    </mesh>
    {CRATERS.map(([x, z, r], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
          <circleGeometry args={[r, 40]} />
          <meshStandardMaterial color="#6E6B66" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.45]} castShadow receiveShadow>
          <torusGeometry args={[r, r * 0.16, 12, 48]} />
          <meshStandardMaterial color="#9A9790" roughness={1} />
        </mesh>
      </group>
    ))}
    {ROCKS.map(([x, z, r], i) => (
      <mesh key={i} position={[x, r * 0.55, z]} rotation={[i, i * 1.7, 0]} scale={[1, 0.7, 1.1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[r, 0]} />
        <meshStandardMaterial color="#86837D" roughness={1} flatShading />
      </mesh>
    ))}
  </group>
);

// ── 7 missions: far-side surface, rover, Luna 3 fly-by, Chang'e 6 ascent ─
const missions = (t: number): SceneOut => {
  const k = prog(t, "missions");
  const rx = lerp(-6, 1.0, ramp(t, 55.8, 63.5));
  const cx = lerp(-2.4, 1.0, ramp(t, 52.5, 63.5));
  const lift = ramp(t, 61.0, 64.2);
  const capY = 0.25 + 6 * lift * lift;
  const sat = ramp(t, 51.7, 56.4);
  const up = ramp(t, 61.2, 64.2);
  return {
    node: (
      <group>
        <Ground />
        <group position={[rx, 0, 0.2]}>
          <AssetModel id="exploration-rover-7afd91" size={1.3} ground rotation={[0, Math.PI / 2, 0]} />
        </group>
        <group position={[lerp(-4.2, -0.2, sat), lerp(0.93, 1.05, sat), -1.9]} rotation={[0.3, t * 0.4, 0]}>
          <AssetModel id="comm-satellite-fdc2cd" size={1.6} metalness={0.6} roughness={0.35} />
        </group>
        <group position={[2.4, capY, -1.6]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.28, 0.5, 20]} />
            <meshStandardMaterial color="#D9B25A" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow>
            <coneGeometry args={[0.22, 0.3, 20]} />
            <meshStandardMaterial color="#E8E6E1" roughness={0.5} />
          </mesh>
          <sprite position={[0, -0.15, 0]} scale={[0.9 * lift + 0.001, 1.3 * lift + 0.001, 1]}>
            <spriteMaterial map={glowTex()} color="#FFB347" transparent opacity={lift > 0 ? 0.95 : 0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        </group>
      </group>
    ),
    shot: {
      pos: lerp3([cx - 0.8, 2.5, 6.0], [2.4, 3.0, 5.8], up),
      target: [lerp(cx, 1.8, up), 0.4 + 1.6 * up, lerp(0, -1.2, k)],
      fov: 42,
    },
    sunPos: [-12, 5, 3],
    sunI: 3.2,
    sunColor: "#FFF4E6",
    fill: 0.2,
  };
};

// ── 8 laser: near-side surface, Apollo mirror, beam from Earth, tilt up ──
const EARTH_SKY: V3 = [-4, 9.5, -24];
const MIRROR: V3 = [0.2, 0.55, 0];
const beam = (() => {
  const a = new THREE.Vector3(...MIRROR);
  const b = new THREE.Vector3(...EARTH_SKY);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return { len, quat: q, mid: [mid.x, mid.y, mid.z] as V3 };
})();
const laser = (t: number): SceneOut => {
  const tau = t - 64.2;
  const spin = 3 * tau - 0.12 * tau * tau;
  const beamOn = ramp(t, 64.3, 64.9) * (1 - ramp(t, 69.4, 70.0));
  const tilt = ramp(t, 69.6, 72.2);
  const k = prog(t, "laser");
  const lookMirror: V3 = [0.1, 0.7, 0];
  return {
    node: (
      <group>
        <Ground />
        <AssetModel id="phase-mirror-1a43e9" size={0.9} ground position={[0.2, 0, 0]} rotation={[0, -0.3, 0]} />
        <LabelPlate text="AUDIRA LAB" sub="CERMIN APOLLO" width={0.9} position={[-0.1, 0.42, 0.55]} rotation={[0, 0.45, 0]} opacity={1 - ramp(t, 69.6, 70.3)} />
        <AssetModel id="laser-pointer-ray-a70928" size={0.6} ground position={[1.3, 0, 0.6]} rotation={[0, -1.9, 0]} />
        <mesh position={beam.mid} quaternion={beam.quat}>
          <cylinderGeometry args={[0.035, 0.035, beam.len, 8]} />
          <meshBasicMaterial color="#5CFF7A" transparent opacity={0.85 * beamOn} toneMapped={false} />
        </mesh>
        <Earth radius={3.2} position={EARTH_SKY} spin={spin} />
      </group>
    ),
    shot: {
      pos: lerp3(lerp3([2.8, 1.3, 4.6], [2.0, 1.1, 4.0], ramp(t, 64.2, 69.6)), [1.6, 0.9, 6.0], tilt),
      target: lerp3(lookMirror, [EARTH_SKY[0] * 0.55, EARTH_SKY[1] * 0.55, EARTH_SKY[2] * 0.55], tilt),
      fov: lerp(40, 46, k),
    },
    sunPos: [10, 6, 6],
    sunI: 3.2,
    sunColor: "#FFF4E6",
    fill: 0.22,
  };
};

// ── 9 outro: Earth + Moon turning together, golden key, pull-back ─────────
const outro = (t: number): SceneOut => {
  const k = prog(t, "outro");
  const a = (t - 75.35) * 0.35 - 1.4; // pair orbit angle (Moon front-right at 81 s)
  const R = 3.4;
  const mp: V3 = [Math.sin(a) * R, -1.6, Math.cos(a) * R];
  return {
    node: (
      <group>
        <Earth radius={1.5} position={[0, 0.9, 0]} spin={t * 0.5} />
        <Moon radius={0.75} position={mp} rotY={a + Math.PI} marker />
        <group position={[lerp(-4, -2.2, k), lerp(-4.2, -3.6, k), 2.5]} rotation={[t * 0.2, t * 0.12, 0]}>
          <AssetModel id="large-asteroid-391721" size={1.0} tint="#8A8178" roughness={0.95} />
        </group>
      </group>
    ),
    shot: { pos: lerp3([0.8, 0.6, 7.6], [1.6, 1.4, 11.5], k), target: [0, -0.2, 0], fov: 42 },
    sunPos: [9, 4, 7],
    sunI: 3.0,
    sunColor: "#FFD39A",
    fill: 0.22,
  };
};

export const SCENE_FN: Record<SceneId, (t: number) => SceneOut> = {
  hook,
  nights,
  orbit,
  bulge,
  wobble,
  farside,
  missions,
  laser,
  outro,
};
