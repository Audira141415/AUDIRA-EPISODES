// The pour and the mould: a graphite crucible in a steel shank tips a molten stream into the sprue
// cup of a two-part sand flask; sparks spit from the cup, the parting line glows as the mould fills,
// then the halves split and fall away. Particles (sparks, embers, sand crumbs) are closed-form.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FX_LAYER } from "../../../core/render/Post.tsx";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { BRONZE_PALETTE as P } from "../lib/palette.ts";
import { moltenMaterial, streamGeometry } from "../lib/molten.ts";
import { sand } from "../lib/textures.ts";
import {
  LIP, MOULD, SPRUE, TOP_Y, crucibleLift, crucibleTilt, fillAt, heatAt, makeCrumbs, makeEmbers, makeSparks, mouldHalf,
  particleAt, streamCut, streamWidth, type Particle,
} from "../core/motion.ts";

type V3 = [number, number, number];

// --- Crucible -----------------------------------------------------------------------------------
const CRUCIBLE = { r: 0.15, h: 0.3 };

const Crucible: React.FC<{ t: number }> = ({ t }) => {
  const lathe = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // Outer wall up, lip roll, inner wall down (thick graphite pot).
    const prof: [number, number][] = [[0, 0], [0.1, 0], [0.13, 0.03], [0.15, 0.16], [0.155, 0.28], [0.15, 0.3], [0.13, 0.3], [0.128, 0.16], [0.105, 0.05], [0, 0.05]];
    for (const [x, y] of prof) pts.push(new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  const pool = useMemo(() => moltenMaterial("pool"), []);
  pool.uniforms.uTime.value = t;
  pool.uniforms.uGlow.value = 1 - 0.6 * Math.min(1, Math.max(0, (t - 2.5) / 0.6));
  const tilt = crucibleTilt(t);
  const lift = crucibleLift(t);
  return (
    <group position={[LIP[0] - lift * 0.4, LIP[1] + lift, LIP[2]]} rotation={[0, 0, -tilt]}>
      <group position={[-CRUCIBLE.r, -CRUCIBLE.h, 0]}>
        <mesh geometry={lathe} castShadow>
          <meshPhysicalMaterial color={P.crucible} roughness={0.7} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Molten surface just inside the lip */}
        <mesh position={[0, CRUCIBLE.h - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pool}>
          <circleGeometry args={[0.128, 40]} />
        </mesh>
        {/* Steel shank ring + handle running out of frame */}
        <mesh position={[0, CRUCIBLE.h * 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.162, 0.012, 10, 48]} />
          <meshStandardMaterial color="#3a3836" metalness={0.9} roughness={0.45} />
        </mesh>
        <mesh position={[-0.75, CRUCIBLE.h * 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.2, 12]} />
          <meshStandardMaterial color="#3a3836" metalness={0.9} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
};

// --- Stream -------------------------------------------------------------------------------------
const Stream: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const dx = SPRUE[0] - LIP[0], dy = LIP[1] - SPRUE[1];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      // Leaves the lip moving sideways, then gravity bends it straight down into the cup.
      const k = 1 - Math.pow(1 - u, 2.2);
      pts.push(new THREE.Vector3(LIP[0] + dx * k, LIP[1] - dy * u * u * 0.35 - dy * u * 0.65, LIP[2] + (SPRUE[2] - LIP[2]) * u));
    }
    return streamGeometry(pts, 0.026, 0.015);
  }, []);
  const core = useMemo(() => moltenMaterial("core"), []);
  const halo = useMemo(() => moltenMaterial("halo"), []);
  const cut = streamCut(t);
  if (cut >= 0.999) return null;
  for (const m of [core, halo]) {
    m.uniforms.uTime.value = t;
    m.uniforms.uCut.value = cut;
    m.uniforms.uWidth.value = streamWidth(t);
  }
  return (
    <group>
      <mesh geometry={geo} material={core} layers={FX_LAYER} />
      <mesh geometry={geo} material={halo} layers={FX_LAYER} />
    </group>
  );
};

// --- Mould --------------------------------------------------------------------------------------
const MouldHalf: React.FC<{ side: -1 | 1; t: number }> = ({ side, t }) => {
  const s = sand();
  const h = mouldHalf(side, t);
  const pool = useMemo(() => moltenMaterial("pool"), []);
  const fill = fillAt(t);
  const heat = heatAt(t);
  pool.uniforms.uTime.value = t + side;
  pool.uniforms.uGlow.value = side === 1 ? 0.25 + 0.75 * Math.min(1, t < 3 ? 1 : 1 - (t - 3) / 0.4) : Math.max(0, (fill - 0.82) / 0.18);
  if (!h.visible) return null;
  const W = MOULD.w / 2, H = MOULD.h, D = MOULD.d;
  const cx = side * W / 2;
  const sandMat = { map: s.map, bumpMap: s.bump, bumpScale: 1.2, roughness: 0.95, color: "#d8cbbd" };
  const band = (y: number) => (
    <mesh position={[cx + side * 0.006, y, 0]} castShadow>
      <boxGeometry args={[W + 0.012, 0.05, D + 0.024]} />
      <meshStandardMaterial color="#4a4542" metalness={0.55} roughness={0.5} />
    </mesh>
  );
  const cup: V3 = side === 1 ? [SPRUE[0], MOULD.h, SPRUE[2]] : [-0.26, MOULD.h, -0.12];
  return (
    <group position={[h.pos[0], TOP_Y + h.pos[1], h.pos[2]]} rotation={[0, h.rotY, h.rotZ]}>
      <mesh position={[cx, H / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[W, H, D]} radius={0.012} />
        <meshStandardMaterial {...sandMat} />
      </mesh>
      {/* Burnt inner face: glows where the hot metal touched it */}
      <mesh position={[side * 0.002, H / 2, 0]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <planeGeometry args={[D * 0.96, H * 0.96]} />
        <meshStandardMaterial map={s.map} color={P.sandBurnt} roughness={1} emissive={P.heat} emissiveIntensity={1.6 * heat * heat} emissiveMap={s.map} />
      </mesh>
      {band(0.07)}
      {band(H - 0.07)}
      {band(H / 2)}
      {/* Pouring cup (right) or riser (left) */}
      <group position={cup}>
        <mesh>
          <cylinderGeometry args={side === 1 ? [0.085, 0.07, 0.07, 32, 1, true] : [0.04, 0.04, 0.03, 24, 1, true]} />
          <meshStandardMaterial {...sandMat} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, side === 1 ? 0.03 : 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pool}>
          <circleGeometry args={[side === 1 ? 0.075 : 0.036, 32]} />
        </mesh>
      </group>
    </group>
  );
};

/** The parting line glowing as the metal fills the mould (front face and top). */
const Seam: React.FC<{ t: number }> = ({ t }) => {
  const glow = fillAt(t) * (1 - Math.min(1, Math.max(0, (t - 3.25) / 0.2)));
  if (glow <= 0.01) return null;
  const flick = 0.85 + 0.15 * Math.sin(t * 31) * Math.sin(t * 7.3);
  const fillH = MOULD.h * Math.min(1, fillAt(t) * 1.05);
  return (
    <group position={[0, TOP_Y, 0]}>
      <mesh position={[0, fillH / 2, MOULD.d / 2 + 0.002]}>
        <planeGeometry args={[0.008, fillH]} />
        <meshBasicMaterial color={new THREE.Color(4.0, 1.4, 0.3).multiplyScalar(glow * flick)} toneMapped={false} />
      </mesh>
      <mesh position={[0, fillH / 2, MOULD.d / 2 + 0.004]} layers={FX_LAYER}>
        <planeGeometry args={[0.06, fillH]} />
        <meshBasicMaterial color={new THREE.Color(1.2, 0.35, 0.06).multiplyScalar(glow * 0.5)} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Mould3D: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <MouldHalf side={-1} t={t} />
    <MouldHalf side={1} t={t} />
    <Seam t={t} />
  </group>
);

// --- Particles ----------------------------------------------------------------------------------
const Streaks: React.FC<{ t: number; parts: Particle[]; kind: "spark" | "ember" }> = ({ t, parts, kind }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => (kind === "spark" ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(1, 6, 4)), [kind]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    parts.forEach((p, i) => {
      const s = particleAt(p, t);
      if (!s) {
        o.position.set(0, -20, 0);
        o.scale.setScalar(0.0001);
        c.setRGB(0, 0, 0);
      } else {
        o.position.set(...s.p);
        const sp = Math.hypot(...s.v);
        if (kind === "spark") {
          o.lookAt(s.p[0] + s.v[0], s.p[1] + s.v[1], s.p[2] + s.v[2]);
          o.scale.set(0.0035 * p.s, 0.0035 * p.s, 0.012 + sp * 0.022);
        } else {
          o.rotation.set(0, 0, 0);
          o.scale.setScalar(0.004 * p.s * (1 - s.age * 0.5));
        }
        const f = (1 - s.age) * p.heat;
        if (kind === "spark") c.setRGB(6 * f, 3.2 * f * f, 0.8 * f * f * f);
        else c.setRGB(3.2 * f, 0.9 * f, 0.15 * f);
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [parts, t, kind]);
  return <instancedMesh ref={ref} args={[geo, mat, parts.length]} layers={FX_LAYER} frustumCulled={false} />;
};

const Crumbs: React.FC<{ t: number }> = ({ t }) => {
  const parts = useMemo(() => makeCrumbs(), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.DodecahedronGeometry(0.008, 0), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: P.sand, roughness: 1 }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    parts.forEach((p, i) => {
      const s = particleAt(p, t);
      if (!s) {
        o.position.set(0, -20, 0);
        o.scale.setScalar(0.0001);
      } else {
        o.position.set(...s.p);
        o.rotation.set(s.age * 9 * p.s, s.age * 7, 0);
        o.scale.setScalar(p.s);
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [parts, t]);
  return <instancedMesh ref={ref} args={[geo, mat, parts.length]} castShadow frustumCulled={false} />;
};

export const Pour3D: React.FC<{ t: number }> = ({ t }) => {
  const sparks = useMemo(() => makeSparks(), []);
  const embers = useMemo(() => makeEmbers(), []);
  return (
    <group>
      {t < 4 && <Crucible t={t} />}
      <Stream t={t} />
      <Mould3D t={t} />
      <Streaks t={t} parts={sparks} kind="spark" />
      <Streaks t={t} parts={embers} kind="ember" />
      <Crumbs t={t} />
    </group>
  );
};
