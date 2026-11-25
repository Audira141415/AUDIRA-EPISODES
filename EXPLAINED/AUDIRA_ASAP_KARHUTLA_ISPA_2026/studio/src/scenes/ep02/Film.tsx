// EP02 film — PAPUA SELATAN DIKEPUNG API (THERMALFORGE).
// One thermal drone over the cover's Merauke world, three camera segments joined by smoke wipes:
// A (hook→konteks: fronts, Merauke, 10 districts, the swamp that dries), B (Yonas in a village,
// smoke over the sea, ISPA bars at Merauke, the two area squares, the satellite pixel view),
// C (31 Okt helicopter chase, concession zone, +66 %, rain front and flood).
// All beats come from timeline.json (clock.ts). Audio is muxed separately by the lead.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { THERMAL_PALETTE as P } from "../../kits/thermalforge/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { thermalMat } from "./thermal.ts";
import { Outro } from "../_shared/Outro.tsx";
import { T, SEC, OUTRO_AT, CUT1, CUT2, camPose, FOV, seg, win, heliPos, HELI_DIR, HELI_T0, HELI_T1 } from "./clock.ts";
import {
  terrainVert, terrainFrag, plumeVert, plumeFrag, ANCHORS, MERAUKE, VILLAGE, AREA, SQ_SMALL_HALF, SQ_BIG_HALF, groundY,
} from "./world.ts";
import { Hud } from "./Hud.tsx";
import { BARS, BAR_Z, barH, satPos } from "./props.ts";

// ---------------------------------------------------------------- story state per second
export const story = (t: number) => {
  const dry = t < SEC.KONTEKS[0] ? 1 : 1 - seg(t, T.dulu - 0.2, T.dulu + 0.6) + seg(t, T.tahun, T.kering + 0.2);
  const sqA = t > T.s63 - 0.3 && t < T.itu2 ? win(t, T.s63 - 0.3, T.itu2, 0.5, 0.6) : 0;
  const bigHalf = SQ_SMALL_HALF + (SQ_BIG_HALF - SQ_SMALL_HALF) * seg(t, T.s25, T.s25 + 1.6);
  const sqB = t > T.s25 - 0.1 && t < T.itu2 ? win(t, T.s25 - 0.1, T.itu2, 0.3, 0.6) : 0;
  return {
    fire: 1 + 0.38 * seg(t, T.naik - 0.4, T.n66 + 0.6),
    dry: Math.min(1, dry),
    rainX: -40 + 34 * seg(t, T.apiO + 0.4, T.banjir + 0.8) + 9 * seg(t, T.banjir + 0.8, OUTRO_AT),
    flood: seg(t, T.banjir - 0.6, T.ikuti + 0.8),
    conc: seg(t, T.titikApi, T.wilayah + 0.6) * (1 - seg(t, T.apiO, T.musim)),
    concLine: seg(t, T.wilayah - 0.2, T.wilayah + 0.6) * (1 - seg(t, T.lalu6, T.lalu6 + 0.6)),
    pix: t > T.belum && t < CUT2 + 0.1 ? seg(t, T.itu2 - 0.3, T.itu2 + 0.6) : 0,
    pixR: 0.5 + 4.5 * seg(t, T.itu2 - 0.3, T.satelit + 0.4),
    sqA,
    sqB,
    bigHalf,
    haze: 0.5 * win(t, T.asapnya - 0.4, T.ispa, 0.6, 0.8) + 0.4 * win(t, T.asapF - 0.3, T.penyebab, 0.5, 0.8),
    smoke: 1 + 0.5 * win(t, T.asapnya - 0.4, T.ispa, 0.6, 0.8) - 0.6 * seg(t, T.musim, T.banjir + 1.0),
  };
};

// ---------------------------------------------------------------- terrain
const Terrain: React.FC<{ time: number; t: number }> = ({ time, t }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 70, 360, 420);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -20);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: terrainVert,
        fragmentShader: terrainFrag,
        uniforms: {
          uTime: { value: 0 }, uFire: { value: 1 }, uDry: { value: 1 }, uRainX: { value: -40 }, uFlood: { value: 0 },
          uConc: { value: 0 }, uClear: { value: new THREE.Vector3(VILLAGE.x, VILLAGE.z, VILLAGE.r) },
          uPix: { value: 0 }, uPixC: { value: new THREE.Vector3(2.6, -9.2, 1) },
          uSqA: { value: new THREE.Vector4(AREA.x, AREA.z, SQ_SMALL_HALF, 0) },
          uSqB: { value: new THREE.Vector4(AREA.x, AREA.z, SQ_SMALL_HALF, 0) },
          uConcLine: { value: 0 }, uHaze: { value: 0 },
        },
      }),
    [],
  );
  const s = story(t);
  const u = mat.uniforms;
  u.uTime.value = time;
  u.uFire.value = s.fire;
  u.uDry.value = s.dry;
  u.uRainX.value = s.rainX;
  u.uFlood.value = s.flood;
  u.uConc.value = s.conc;
  u.uConcLine.value = s.concLine;
  u.uPix.value = s.pix;
  (u.uPixC.value as THREE.Vector3).set(2.6, -9.2, s.pixR);
  (u.uSqA.value as THREE.Vector4).set(AREA.x, AREA.z, SQ_SMALL_HALF, s.sqA);
  (u.uSqB.value as THREE.Vector4).set(AREA.x, AREA.z, s.bigHalf, s.sqB);
  u.uHaze.value = s.haze;
  return <mesh geometry={geo} material={mat} />;
};

// ---------------------------------------------------------------- smoke plumes (from the cover)
const PUFFS_PER = 7;
const Plumes: React.FC<{ time: number; camPos: THREE.Vector3; camQuat: THREE.Quaternion; amount: number }> = ({ time, camPos, camQuat, amount }) => {
  const puffs = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const list: { pos: THREE.Vector3; size: number; mat: THREE.ShaderMaterial; a0: number }[] = [];
    ANCHORS.forEach((a) => {
      for (let j = 0; j < PUFFS_PER; j++) {
        const k = j / (PUFFS_PER - 1);
        const pos = new THREE.Vector3(a.x - k * k * a.h * 0.6, 0.25 + k * a.h, a.z - k * a.h * 0.15);
        const size = 0.55 + k * 2.3 + (a.h - 3.2) * 0.15;
        const a0 = 0.55 - k * 0.3;
        const mat = new THREE.ShaderMaterial({
          vertexShader: plumeVert, fragmentShader: plumeFrag, transparent: true, depthWrite: false,
          uniforms: { uTime: { value: 0 }, uSeed: { value: a.seed + j * 0.73 }, uWarm: { value: 0.7 - k * 0.3 }, uAlpha: { value: a0 } },
        });
        list.push({ pos, size, mat, a0 });
      }
    });
    return { geo, list };
  }, []);
  const ordered = [...puffs.list].sort((a, b) => b.pos.distanceTo(camPos) - a.pos.distanceTo(camPos));
  return (
    <group>
      {ordered.map((pf, i) => {
        pf.mat.uniforms.uTime.value = time;
        // fade puffs that sit right in front of the lens (avoids a flat smear filling the frame)
        const near = THREE.MathUtils.smoothstep(pf.pos.distanceTo(camPos), 1.6, 4.0);
        pf.mat.uniforms.uAlpha.value = Math.min(0.95, pf.a0 * amount) * near;
        return (
          <mesh key={i} geometry={puffs.geo} material={pf.mat} position={pf.pos.toArray()} quaternion={camQuat}
            scale={[pf.size, pf.size * 1.15, 1]} renderOrder={10 + i} onUpdate={(m) => m.layers.set(FX_LAYER)} />
        );
      })}
    </group>
  );
};


// ---------------------------------------------------------------- smoke drifting over the sea (to Maluku)
const SEA_N = 24;
const SeaSmoke: React.FC<{ t: number; camQuat: THREE.Quaternion }> = ({ t, camQuat }) => {
  const puffs = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    return {
      geo,
      list: Array.from({ length: SEA_N }, (_, i) => {
        const k = i / (SEA_N - 1);
        const pos = new THREE.Vector3(-2.4 - k * 9.5 + Math.sin(i * 1.7) * 0.5, 0.9 + k * 1.6, -5.2 - k * 7.0 + Math.cos(i * 2.3) * 0.5);
        const mat = new THREE.ShaderMaterial({
          vertexShader: plumeVert, fragmentShader: plumeFrag, transparent: true, depthWrite: false,
          uniforms: { uTime: { value: 0 }, uSeed: { value: 40 + i * 1.37 }, uWarm: { value: 0.64 - k * 0.14 }, uAlpha: { value: 0 } },
        });
        return { pos, size: 2.0 + k * 2.8, mat, k };
      }),
    };
  }, []);
  const vis = win(t, T.asapnya - 0.2, T.empat + 0.6, 0.4, 0.8);
  if (vis <= 0.001) return null;
  return (
    <group>
      {puffs.list.map((pf, i) => {
        const on = seg(t, T.asapnya + pf.k * 1.6, T.asapnya + pf.k * 1.6 + 0.6) * vis;
        pf.mat.uniforms.uTime.value = t;
        pf.mat.uniforms.uAlpha.value = 1.0 * on;
        const drift = (t - T.asapnya) * 0.25;
        return (
          <mesh key={i} geometry={puffs.geo} material={pf.mat} position={[pf.pos.x - drift, pf.pos.y, pf.pos.z - drift * 0.6]} quaternion={camQuat}
            scale={[pf.size, pf.size * 0.8, 1]} renderOrder={200 - i} onUpdate={(m) => m.layers.set(FX_LAYER)} />
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- ground rings (town, 10 districts)
export const DISTRICTS: [number, number][] = [
  [0.2, -3.2], [2.6, -4.6], [4.8, -3.0], [-0.6, -7.4], [1.9, -8.6], [4.6, -7.8], [0.6, -11.6], [3.4, -12.4], [5.6, -10.6], [2.0, -15.4],
];
const Ring: React.FC<{ x: number; z: number; r: number; color: string; opacity: number; w?: number }> = ({ x, z, r, color, opacity, w = 0.08 }) =>
  opacity <= 0.001 ? null : (
    <mesh position={[x, groundY(x, z) + 0.06, z]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)} renderOrder={30}>
      <ringGeometry args={[r - w, r, 72]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} toneMapped={false} />
    </mesh>
  );

// ---------------------------------------------------------------- ISPA bars at Merauke (Puskesmas Mopah Baru)
const Bars: React.FC<{ t: number }> = ({ t }) => {
  const show = win(t, T.di1, T.lalu + 0.9, 0.3, 0.7);
  if (show <= 0.001) return null;
  return (
    <group>
      {BARS.map((b) => {
        const g = seg(t, b.at(), b.at() + 0.9) * show;
        const h = Math.max(0.02, barH(b.v) * g);
        const y0 = groundY(b.x, BAR_Z);
        return (
          <mesh key={b.label} position={[b.x, y0 + h / 2, BAR_Z]}>
            <RoundedBoxGeo args={[0.34, h, 0.34]} radius={0.01} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={b.color} emissive={b.color} emissiveIntensity={0.55} transparent opacity={0.92} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- village + generic resident (ILUSTRASI)
// Thermal silhouette, not a toy: body heat in ironbow (head white-hot, legs cooler), edges cooler.
const HUTS: [number, number, number][] = [
  [-1.75, 1.35, 0.3], [-0.55, 1.4, -0.4], [-1.95, 2.35, 0.9], [-0.45, 2.45, 0.2], [-1.25, 1.05, 0.0],
];
const Part: React.FC<{ geo: React.ReactNode; t: number; p: [number, number, number]; r?: [number, number, number]; grad?: number; lo?: number; hi?: number }> = ({ geo, t, p, r = [0, 0, 0], grad = 0, lo = 0, hi = 1 }) => (
  <mesh position={p} rotation={r} material={thermalMat({ t, grad, lo, hi, edge: 0.3 })}>{geo}</mesh>
);
const ThermalPerson: React.FC<{ f: number; x: number; y: number; z: number; heading: number; s: number }> = ({ f, x, y, z, heading, s }) => {
  const sway = Math.sin(f * 0.035) * 0.04;
  const breathe = 1 + Math.sin(f * 0.05) * 0.012;
  return (
    <group position={[x, y, z]} rotation={[0, heading, 0]} scale={s}>
      <Part geo={<capsuleGeometry args={[0.055, 0.36, 6, 12]} />} t={0.66} p={[-0.07, 0.24, 0]} r={[0, 0, 0.03]} grad={0.12} lo={-0.24} hi={0.24} />
      <Part geo={<capsuleGeometry args={[0.055, 0.36, 6, 12]} />} t={0.66} p={[0.07, 0.24, 0]} r={[0, 0, -0.03]} grad={0.12} lo={-0.24} hi={0.24} />
      <group scale={[1, breathe, 1]}>
        <Part geo={<capsuleGeometry args={[0.12, 0.26, 8, 16]} />} t={0.8} p={[0, 0.66, 0]} grad={0.1} lo={-0.25} hi={0.25} />
      </group>
      <Part geo={<capsuleGeometry args={[0.04, 0.34, 6, 10]} />} t={0.74} p={[-0.175, 0.62, 0.01]} r={[sway, 0, 0.12]} grad={0.1} lo={-0.2} hi={0.2} />
      <Part geo={<capsuleGeometry args={[0.04, 0.34, 6, 10]} />} t={0.74} p={[0.175, 0.62, 0.01]} r={[-sway, 0, -0.12]} grad={0.1} lo={-0.2} hi={0.2} />
      <Part geo={<cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />} t={0.9} p={[0, 0.88, 0]} />
      <Part geo={<sphereGeometry args={[0.1, 20, 16]} />} t={0.97} p={[0, 0.99, 0]} />
    </group>
  );
};
const Village: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  if (t < CUT1 - 0.5 || t > T.maluku + 1) return null;
  const gy = groundY(VILLAGE.x, VILLAGE.z + 0.1);
  return (
    <group>
      {HUTS.map(([x, z, r], i) => {
        const y = groundY(x, z);
        return (
          <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
            <mesh position={[0, 0.05, 0]} material={thermalMat({ t: 0.3, grad: 0.08, lo: -0.05, hi: 0.05 })}>
              <RoundedBoxGeo args={[0.2, 0.1, 0.16]} radius={0.012} />
            </mesh>
            <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 4, 0]} material={thermalMat({ t: 0.5, edge: 0.15 })}>
              <coneGeometry args={[0.15, 0.1, 4]} />
            </mesh>
          </group>
        );
      })}
      <ThermalPerson f={f} x={VILLAGE.x} y={gy} z={VILLAGE.z + 0.1} heading={0.25} s={0.27} />
    </group>
  );
};

// ---------------------------------------------------------------- helicopter (ILUSTRASI, 31 Okt)
// Thermal silhouette: cool airframe, white-hot engines and exhaust, spinning main + tail rotor.
const Heli: React.FC<{ t: number }> = ({ t }) => {
  if (t < HELI_T0 || t > HELI_T1 + 1.5) return null;
  const h = heliPos(t);
  const yaw = Math.atan2(HELI_DIR.x, HELI_DIR.z);
  const rotor = t * 31;
  const body = thermalMat({ t: 0.42, grad: 0.1, lo: -0.15, hi: 0.15, edge: 0.25 });
  const cool = thermalMat({ t: 0.32, edge: 0.2 });
  const hot = thermalMat({ t: 0.97, edge: 0.1 });
  const warm = thermalMat({ t: 0.78, edge: 0.1 });
  const blade = thermalMat({ t: 0.26, edge: 0 });
  const disc = thermalMat({ t: 0.36, edge: 0, opacity: 0.12 });
  return (
    <group position={h.toArray()} rotation={[0.1, yaw, Math.sin(t * 0.8) * 0.04]} scale={1.0}>
      <mesh material={body} scale={[0.17, 0.16, 0.36]}><sphereGeometry args={[1, 28, 20]} /></mesh>
      <mesh material={body} position={[0, 0.0, -0.22]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.15, 0.3, 20]} /></mesh>
      <mesh material={thermalMat({ t: 0.16, edge: 0.05 })} position={[0, 0.04, 0.24]} scale={[0.13, 0.1, 0.14]}><sphereGeometry args={[1, 20, 14]} /></mesh>
      <mesh material={body} position={[0, 0.05, -0.7]} rotation={[Math.PI / 2 - 0.06, 0, 0]}><cylinderGeometry args={[0.03, 0.065, 0.72, 14]} /></mesh>
      <mesh material={cool} position={[0, 0.16, -1.04]} rotation={[-0.35, 0, 0]}><boxGeometry args={[0.025, 0.22, 0.13]} /></mesh>
      <mesh material={cool} position={[0, 0.06, -0.94]}><boxGeometry args={[0.3, 0.018, 0.08]} /></mesh>
      <mesh material={hot} position={[0.07, 0.16, -0.08]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.045, 0.16, 6, 12]} /></mesh>
      <mesh material={hot} position={[-0.07, 0.16, -0.08]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.045, 0.16, 6, 12]} /></mesh>
      <mesh material={warm} position={[0, 0.14, -0.3]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.07, 0.18, 12]} /></mesh>
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh material={cool} position={[0.15 * sd, -0.22, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.6, 8]} /></mesh>
          <mesh material={cool} position={[0.13 * sd, -0.17, 0.14]} rotation={[0, 0, 0.3 * sd]}><cylinderGeometry args={[0.01, 0.01, 0.1, 6]} /></mesh>
          <mesh material={cool} position={[0.13 * sd, -0.17, -0.1]} rotation={[0, 0, 0.3 * sd]}><cylinderGeometry args={[0.01, 0.01, 0.1, 6]} /></mesh>
        </group>
      ))}
      <mesh material={warm} position={[0, 0.24, 0]}><cylinderGeometry args={[0.025, 0.03, 0.1, 12]} /></mesh>
      <group position={[0, 0.29, 0]} rotation={[0, rotor, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={blade} rotation={[0, (i * Math.PI) / 2, 0]}>
            <boxGeometry args={[0.04, 0.008, 1.7]} />
          </mesh>
        ))}
      </group>
      <mesh material={disc} position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <circleGeometry args={[0.85, 48]} />
      </mesh>
      <group position={[0.035, 0.17, -1.08]} rotation={[rotor * 1.7, 0, 0]}>
        <mesh material={blade}><boxGeometry args={[0.008, 0.3, 0.03]} /></mesh>
        <mesh material={blade} rotation={[Math.PI / 2, 0, 0]}><boxGeometry args={[0.008, 0.3, 0.03]} /></mesh>
      </group>
      <mesh material={disc} position={[0.04, 0.17, -1.08]} rotation={[0, Math.PI / 2, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <circleGeometry args={[0.15, 24]} />
      </mesh>
      <mesh position={[0, 0.16, -0.62]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)} material={thermalMat({ t: 0.7, edge: 0, opacity: 0.3 })}>
        <planeGeometry args={[0.14, 0.6]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- satellite + scan beam
const Satellite: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.dan - 0.6 || t > CUT2) return null;
  const s = satPos(t);
  const beam = win(t, T.itu2 - 0.3, CUT2, 0.4, 0.2);
  const panel = thermalMat({ t: 0.2, edge: 0, grid: 0.9 });
  return (
    <group>
      <group position={s.toArray()} rotation={[0.25, 0.25, 0.05]} scale={1.7}>
        <mesh material={thermalMat({ t: 0.62, grad: 0.15, lo: -0.3, hi: 0.3, edge: 0.25 })}><RoundedBoxGeo args={[0.42, 0.42, 0.6]} radius={0.04} /></mesh>
        <mesh material={thermalMat({ t: 0.8, edge: 0.1 })} position={[0, 0, 0.33]}><boxGeometry args={[0.3, 0.3, 0.04]} /></mesh>
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <mesh material={thermalMat({ t: 0.5 })} position={[0.33 * sd, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015, 0.015, 0.2, 8]} /></mesh>
            <mesh material={panel} position={[1.15 * sd, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.6, 0.56]} /></mesh>
          </group>
        ))}
        <mesh material={thermalMat({ t: 0.9, edge: 0.1 })} position={[0, -0.3, 0]}><cylinderGeometry args={[0.1, 0.16, 0.16, 16]} /></mesh>
        <mesh material={thermalMat({ t: 0.45 })} position={[0, 0.34, -0.1]} rotation={[0.5, 0, 0]}><coneGeometry args={[0.16, 0.12, 20, 1, true]} /></mesh>
      </group>
      {beam > 0.01 && (
        <mesh position={[(s.x + 2.6) / 2, s.y / 2, (s.z - 9.2) / 2]}
          onUpdate={(m) => {
            m.layers.set(FX_LAYER);
            m.lookAt(new THREE.Vector3(2.6, 0, -9.2));
            m.rotateX(Math.PI / 2);
          }}>
          <cylinderGeometry args={[1.6, 0.05, s.distanceTo(new THREE.Vector3(2.6, 0, -9.2)), 32, 1, true]} />
          <meshBasicMaterial color={P.hudCyan} transparent opacity={0.07 * beam} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- camera
const CamSetup: React.FC<{ pos: THREE.Vector3; target: THREE.Vector3 }> = ({ pos, target }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(pos);
    cam.lookAt(target);
    cam.fov = FOV;
    cam.near = 0.05;
    cam.far = 300;
    cam.updateProjectionMatrix();
    cam.layers.enable(FX_LAYER);
    scene.environmentIntensity = 0.55;
  }, [camera, scene, pos, target]);
  return null;
};

export const Ep02Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const { pos, target } = camPose(t);
  const camQuat = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(pos);
    o.lookAt(target);
    o.rotateY(Math.PI);
    return o.quaternion.clone();
  }, [pos.x, pos.y, pos.z, target.x, target.y, target.z]);
  const s = story(t);
  const distr = win(t, T.sepuluh - 0.1, T.rawa + 0.2, 0.3, 0.5);
  const townRing = Math.max(win(t, T.papua, T.okt11 + 1.2, 0.3, 0.6), win(t, T.merauke - 0.3, T.sepuluh, 0.3, 0.5), win(t, T.ikuti - 0.2, OUTRO_AT, 0.4, 0.3));
  const pulse = 1 + 0.06 * Math.sin(f * 0.12);
  return (
    <AbsoluteFill style={{ backgroundColor: P.coldBlack }}>
      <ThreeCanvas width={width} height={height} dpr={1} camera={{ fov: FOV, position: pos.toArray() }}>
        <CamSetup pos={pos} target={target} />
        <color attach="background" args={["#170630"]} />
        <fog attach="fog" args={["#170630", 30, 80]} />
        <hemisphereLight args={["#ffd9a0", "#2a0a4a", 1.4]} />
        <directionalLight position={[-4, 6, 3]} intensity={1.6} color={"#ffe2b0"} />
        <Terrain time={t} t={t} />
        <Plumes time={t} camPos={pos} camQuat={camQuat} amount={s.smoke} />
        <SeaSmoke t={t} camQuat={camQuat} />
        <Ring x={MERAUKE.x} z={MERAUKE.z} r={1.3 * pulse} color={P.hudCyan} opacity={0.9 * townRing} />
        {DISTRICTS.map(([x, z], i) => {
          const pop = seg(t, T.sepuluh + i * 0.07, T.sepuluh + i * 0.07 + 0.25);
          return <Ring key={i} x={x} z={z} r={0.42 * (0.6 + 0.4 * pop) * pulse} color={P.flirYellow} opacity={distr * pop} w={0.07} />;
        })}
        <Bars t={t} />
        <Village f={f} t={t} />
        <Heli t={t} />
        <Satellite t={t} />
        <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
      </ThreeCanvas>
      <Hud t={t} f={f} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
