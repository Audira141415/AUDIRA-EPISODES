// EP037 film world: a long toy-diorama table (walnut planks + footlights) carrying a cardboard
// intercity road at dusk, hill flats, clay trees, street lamps and a generic terminal/SPBU stop.
// Only items near the camera are mounted; the light COUNT stays fixed (no shader recompiles).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Cyl, P, RBox, V3, useCanvasTexture } from "./parts.tsx";

const X_MIN = -100;
const X_MAX = 40;
const near = (x: number, camX: number, r = 14) => Math.abs(x - camX) < r;

const seeded = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const Sky: React.FC<{ camX: number; camZ: number }> = ({ camX }) => {
  const tex = useCanvasTexture(512, 1024, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, "#0B1328");
    g.addColorStop(0.3, "#1E2450");
    g.addColorStop(0.5, "#5B3A6B");
    g.addColorStop(0.62, "#C9643F");
    g.addColorStop(0.72, "#F2A35A");
    g.addColorStop(1, "#F7C27A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 1024);
    const rnd = seeded(21);
    for (let i = 0; i < 140; i++) {
      const y = rnd() * 520;
      ctx.fillStyle = `rgba(255,240,210,${0.25 + rnd() * 0.6})`;
      const r = 0.8 + rnd() * 1.8;
      ctx.beginPath();
      ctx.arc(rnd() * 512, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return (
    <mesh position={[camX, 4.2, -7.5]}>
      <planeGeometry args={[30, 16]} />
      <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
    </mesh>
  );
};

const HillFlat: React.FC<{ z: number; color: string; seed: number; amp: number; h: number }> = ({ z, color, seed, amp, h }) => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    const x0 = X_MIN - 20;
    const x1 = X_MAX + 20;
    sh.moveTo(x0, 0);
    const n = 260;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      sh.lineTo(x, h + Math.sin(i * 0.55 + seed) * amp + Math.sin(i * 1.3 + seed * 2) * amp * 0.35);
    }
    sh.lineTo(x1, 0);
    sh.lineTo(x0, 0);
    return new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 });
  }, [seed, amp, h]);
  return (
    <mesh geometry={geo} position={[0, 0, z]} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.88} metalness={0.02} />
    </mesh>
  );
};

const Tree: React.FC<{ pos: V3; s: number; c: string }> = ({ pos, s, c }) => (
  <group position={pos} scale={s}>
    <Cyl r={0.04} h={0.3} color="#5A3B26" position={[0, 0.15, 0]} rough={0.85} seg={10} />
    <mesh position={[0, 0.55, 0]} castShadow>
      <coneGeometry args={[0.26, 0.6, 7]} />
      <meshStandardMaterial color={c} roughness={0.85} flatShading />
    </mesh>
    <mesh position={[0, 0.8, 0]} castShadow>
      <coneGeometry args={[0.19, 0.42, 7]} />
      <meshStandardMaterial color={c} roughness={0.85} flatShading />
    </mesh>
  </group>
);

const Lamp: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0, -1.45]}>
    <Cyl r={0.035} h={1.9} color="#3B4148" position={[0, 0.95, 0]} rough={0.7} seg={12} />
    <RBox size={[0.06, 0.05, 0.42]} r={0.02} color="#3B4148" position={[0, 1.88, 0.18]} />
    <RBox size={[0.12, 0.06, 0.16]} r={0.025} color="#FFE3A6" position={[0, 1.84, 0.36]} emissive="#FFC46B" emissiveIntensity={2.4} />
  </group>
);

/** Board sign on a dowel (paper face, Lilita text). */
const Sign: React.FC<{ pos: V3; text: string; color: string; w?: number; h?: number; rotY?: number }> = ({ pos, text, color, w = 1.1, h = 0.4, rotY = 0 }) => {
  const tex = useCanvasTexture(
    512,
    Math.round((512 * h) / w),
    (ctx) => {
      const H = Math.round((512 * h) / w);
      ctx.fillStyle = "#FAF6EE";
      ctx.fillRect(0, 0, 512, H);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 512, 16);
      ctx.fillRect(0, H - 16, 512, 16);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.font = `${Math.round(H * 0.55)}px 'Lilita One', sans-serif`;
      ctx.fillText(text, 256, H * 0.7);
    },
    [text, color],
  );
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Cyl r={0.03} h={pos[1]} color={P.dowel} position={[0, -pos[1] / 2, -0.03]} seg={8} />
      <RBox size={[w + 0.04, h + 0.04, 0.04]} r={0.015} color="#E9DFC8" />
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  );
};

/** Generic fuel stop + terminal (no brand colours/logos). */
const StopArea: React.FC<{ xs: number }> = ({ xs }) => (
  <group position={[xs, 0, 0]}>
    {/* canopy */}
    <RBox size={[4.2, 0.16, 1.7]} r={0.05} color="#EDE6DA" position={[-3.0, 2.15, -2.45]} />
    <RBox size={[4.24, 0.08, 1.74]} r={0.03} color={P.busTeal} position={[-3.0, 2.04, -2.45]} />
    {[-4.8, -1.2].map((x) => (
      <Cyl key={x} r={0.06} h={2.0} color="#B9BEC4" position={[x, 1.0, -2.45]} seg={12} />
    ))}
    {[-4.0, -2.0].map((x) => (
      <group key={x} position={[x, 0, -2.4]}>
        <RBox size={[0.3, 0.6, 0.24]} r={0.05} color="#EDE6DA" position={[0, 0.3, 0]} />
        <RBox size={[0.2, 0.14, 0.02]} r={0.02} color="#22324D" position={[0, 0.45, 0.125]} emissive="#7FD0E0" emissiveIntensity={0.6} />
        <RBox size={[0.36, 0.06, 0.3]} r={0.02} color="#9AA3AB" position={[0, 0.03, 0]} />
      </group>
    ))}
    <RBox size={[3.8, 0.04, 0.12]} r={0.02} color="#FFF3D9" position={[-3.0, 2.0, -2.0]} emissive="#FFE6B0" emissiveIntensity={1.6} />
    <Sign pos={[-3.0, 2.75, -1.62]} text="SPBU" color={P.busTeal} w={1.5} h={0.5} rotY={-0.85} />
    {/* small terminal shelter further back */}
    <RBox size={[2.6, 1.2, 0.9]} r={0.05} color="#D9CDB6" position={[0.6, 0.6, -3.3]} />
    <RBox size={[2.9, 0.12, 1.2]} r={0.04} color={P.busCoral} position={[0.6, 1.26, -3.2]} />
    <RBox size={[2.2, 0.5, 0.02]} r={0.02} color="#22324D" position={[0.6, 0.7, -2.84]} emissive="#FFC07A" emissiveIntensity={0.25} />
    <Sign pos={[0.6, 1.66, -2.5]} text="TERMINAL" color={P.busCoral} w={1.9} h={0.44} rotY={-0.85} />
    <pointLight position={[-6.5, 2.4, -0.8]} color="#FFE6B0" intensity={3.0} distance={6} decay={2} />
  </group>
);

export const World: React.FC<{ camX: number; xs: number }> = ({ camX, xs }) => {
  const trees = useMemo(() => {
    const rnd = seeded(97);
    const out: { x: number; z: number; s: number; c: string }[] = [];
    for (let x = X_MIN; x < X_MAX; x += 1.6) {
      const jitter = (rnd() - 0.5) * 1.2;
      if (Math.abs(x + jitter - xs + 3) < 6) continue; // keep the stop area clear
      out.push({ x: x + jitter, z: -2.0 - rnd() * 1.0, s: 0.8 + rnd() * 0.7, c: rnd() > 0.5 ? "#3C6B50" : "#2F5A44" });
      if (rnd() > 0.55) out.push({ x: x + rnd(), z: 1.7 + rnd() * 0.5, s: 0.6 + rnd() * 0.4, c: "#3C6B50" });
    }
    return out;
  }, [xs]);
  const lamps = useMemo(() => {
    const out: number[] = [];
    for (let x = X_MIN; x < X_MAX; x += 7) out.push(x);
    return out;
  }, []);
  const near2 = [...lamps].sort((a, b) => Math.abs(a - camX) - Math.abs(b - camX)).slice(0, 2);
  const planks = Array.from({ length: 11 }, (_, i) => i);
  const dashStart = Math.floor((camX - 14) / 0.95) * 0.95;
  const footStart = Math.floor((camX - 14) / 1.1) * 1.1;
  return (
    <group>
      {/* walnut table planks (long boards along x) */}
      {planks.map((i) => (
        <RBox key={i} size={[X_MAX - X_MIN + 30, 0.16, 0.6]} r={0.02} color={i % 2 ? P.floor : P.floorLight} position={[(X_MAX + X_MIN) / 2, -0.08, -4.0 + i * 0.62]} rough={0.68} cast={false} />
      ))}
      <RBox size={[X_MAX - X_MIN + 30, 0.7, 0.12]} r={0.03} color={P.trim} position={[(X_MAX + X_MIN) / 2, -0.42, 2.9]} cast={false} />
      {Array.from({ length: 26 }, (_, i) => footStart + i * 1.1).map((x) => (
        <group key={x.toFixed(2)} position={[x, 0.04, 2.7]}>
          <Cyl r={0.08} r2={0.1} h={0.07} color={P.trim} rough={0.6} seg={14} />
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.065, 14, 14]} />
            <meshStandardMaterial color={P.footlight} emissive={P.footlight} emissiveIntensity={1.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* road */}
      <RBox size={[X_MAX - X_MIN, 0.04, 2.0]} r={0.015} color={P.asphalt} position={[(X_MAX + X_MIN) / 2, 0.02, 0]} rough={0.9} cast={false} />
      <RBox size={[X_MAX - X_MIN, 0.045, 0.06]} r={0.01} color="#E9E1CF" position={[(X_MAX + X_MIN) / 2, 0.022, 0.92]} rough={0.8} cast={false} />
      <RBox size={[X_MAX - X_MIN, 0.045, 0.06]} r={0.01} color="#E9E1CF" position={[(X_MAX + X_MIN) / 2, 0.022, -0.92]} rough={0.8} cast={false} />
      {Array.from({ length: 30 }, (_, i) => dashStart + i * 0.95).map((x) => (
        <RBox key={x.toFixed(2)} size={[0.42, 0.046, 0.05]} r={0.01} color="#F2D27A" position={[x, 0.022, -0.02]} rough={0.8} cast={false} />
      ))}
      <RBox size={[X_MAX - X_MIN, 0.06, 0.9]} r={0.02} color={P.grass} position={[(X_MAX + X_MIN) / 2, 0.03, 1.48]} rough={0.9} cast={false} />
      <RBox size={[X_MAX - X_MIN, 0.06, 1.6]} r={0.02} color={P.grassDark} position={[(X_MAX + X_MIN) / 2, 0.03, -1.82]} rough={0.9} cast={false} />
      {/* scenery flats */}
      <HillFlat z={-5.6} color="#3B2F5C" seed={1.3} amp={0.3} h={1.6} />
      <HillFlat z={-4.9} color="#2D3F5E" seed={4.1} amp={0.25} h={1.05} />
      <HillFlat z={-4.2} color="#2B4E4C" seed={2.2} amp={0.18} h={0.6} />
      {trees.filter((tr) => near(tr.x, camX, 16)).map((tr) => (
        <Tree key={`${tr.x.toFixed(2)}_${tr.z.toFixed(2)}`} pos={[tr.x, 0, tr.z]} s={tr.s} c={tr.c} />
      ))}
      {lamps.filter((x) => near(x, camX, 16)).map((x) => (
        <Lamp key={x} x={x} />
      ))}
      {near2.map((x, i) => (
        <pointLight key={i} position={[x, 1.7, -1.1]} color="#FFC46B" intensity={2.4} distance={3.6} decay={2} />
      ))}
      <StopArea xs={xs} />
    </group>
  );
};
