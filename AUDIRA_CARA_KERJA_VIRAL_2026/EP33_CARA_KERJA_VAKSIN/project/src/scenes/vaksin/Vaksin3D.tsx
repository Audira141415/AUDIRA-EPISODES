// EP33 · Cara Kerja Vaksin — NANOFORGE (Remotion + R3F). Audio master clock: every time below comes from
// words.json (Cartesia VO, 84.2 s). The film is rendered silent; VO + SFX are mixed afterwards with ffmpeg.
//
// Multi-scene director (t in seconds):
//  S1 0–5.0      hook: syringe + vial macro, dive into the droplet
//  S2 5.0–14.4   antigen: hero virus, glowing spike tips, a B cell scans it
//  S3 14.4–26.4  first infection: copies multiply, antibodies come slowly, a body cell falls sick
//  S4 26.4–42.6  what is in a vaccine: vial hero, weakened virus / antigen pieces / mRNA, cell builds spikes
//  S5 42.6–57.05 immune army trains: B cells wake, antibody stream, memory cell, two doses
//  S6 57.05–66.35 real virus returns: recognition, antibody swarm coats the virus, virus loses
//  S7–S9 66.35–84.5 herd immunity grid → 154 million pull-back → channel card; AUDIRA outro last 3 s

import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { shotPlan, cameraAt, frame as fr, orbit, framingFrom, type Framing } from "../../core/camera/moves.ts";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { NANO_PALETTE as P } from "../../kits/nanoforge/lib/palette.ts";
import { brownianDrift, membranePulse } from "../../kits/nanoforge/core/motion.ts";
import { hash } from "../../kits/nanoforge/core/noise.ts";
import rawWords from "./words.json";

export const VAKSIN_SECONDS = 87.5;
const END = 84.5;
const FPS = 60;
type V3 = [number, number, number];

const DISPLAY: Record<string, string> = { "em-er-en-a,": "mRNA,", Audira: "AUDIRA" };
const WORDS = (rawWords as { text: string; start: number; end: number }[]).map((w) => ({ ...w, text: DISPLAY[w.text] ?? w.text }));

// ---------------------------------------------------------------- timing helpers
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const sm = (k: number) => k * k * (3 - 2 * k);
const eio = (t: number, a: number, b: number) => sm(lin(t, a, b));
const eout = (t: number, a: number, b: number) => 1 - Math.pow(1 - lin(t, a, b), 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lv = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/** 0 → 1.12 → 1 pop. */
const pop = (t: number, at: number, d = 0.35) => {
  if (t <= at) return 0;
  const k = (t - at) / d;
  if (k >= 1) return 1;
  return k < 0.6 ? (k / 0.6) * 1.12 : 1.12 - ((k - 0.6) / 0.4) * 0.12;
};
/** pop in at a, shrink out at b. */
const popIO = (t: number, a: number, b: number, d = 0.3) => (t >= b ? 1 - lin(t, b, b + 0.22) : pop(t, a, d));

// ---------------------------------------------------------------- geometry helpers
const fib = (n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });
const quatTo = (d: V3) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize());
const SPIKES = fib(20);
const SPIKE_Q = SPIKES.map(quatTo);

const useLabelTexture = (lines: { text: string; color: string; size: number }[], bg = "#ffffff", w = 512, h = 256) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const total = lines.reduce((s, l) => s + l.size * 1.15, 0);
    let y = (h - total) / 2;
    for (const l of lines) {
      g.fillStyle = l.color;
      g.font = `800 ${l.size}px ${FONT}, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "top";
      g.fillText(l.text, w / 2, y);
      y += l.size * 1.15;
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lines), bg, w, h]);

// ---------------------------------------------------------------- props
const RUBY = P.guanineRuby;
const GREY = "#6b7280";

/** Virus particle: glossy capsid + 20 spike proteins whose tips are the antigen. */
const Virus: React.FC<{ f: number; pos: V3; r?: number; glow?: number; dead?: number; spin?: number; q?: number; color?: string; seed?: number; ghost?: number }> = ({
  f, pos, r = 1, glow = 0, dead = 0, spin = 1, q = 1, color = RUBY, seed = 0, ghost = 0,
}) => {
  if (q <= 0.01) return null;
  const body = new THREE.Color(color).lerp(new THREE.Color(GREY), dead);
  const tip = new THREE.Color(P.adenineGold).lerp(new THREE.Color("#9ca3af"), dead);
  const op = ghost > 0 ? 1 - ghost * 0.6 : 1;
  const drift: V3 = [brownianDrift(f, 0.03, 0.12, seed), brownianDrift(f, 0.025, 0.14, seed + 2), brownianDrift(f, 0.02, 0.1, seed + 4)];
  return (
    <group position={[pos[0] + drift[0], pos[1] + drift[1], pos[2] + drift[2]]} rotation={[f * 0.002 * spin + seed, f * 0.004 * spin + seed, 0]} scale={q * r}>
      <mesh castShadow>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial color={body} roughness={0.32} metalness={0.1} clearcoat={0.9} clearcoatRoughness={0.2} emissive={body} emissiveIntensity={0.12} transparent={ghost > 0} opacity={op} />
      </mesh>
      {SPIKES.map((d, i) => {
        const len = 0.42 * (1 - dead * 0.4);
        return (
          <group key={i} quaternion={SPIKE_Q[i]}>
            <mesh position={[0, 1 + len / 2, 0]}>
              <cylinderGeometry args={[0.045, 0.07, len, 10]} />
              <meshStandardMaterial color={body} roughness={0.4} transparent={ghost > 0} opacity={op} />
            </mesh>
            <mesh position={[0, 1 + len + 0.08, 0]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={tip} emissive={tip} emissiveIntensity={0.35 + glow * 1.8 * (0.8 + 0.2 * Math.sin(f * 0.15 + i))} roughness={0.25} metalness={0.2} transparent={ghost > 0} opacity={op} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Y-shaped antibody: glossy gold heavy chains, cyan binding tips. Origin = centre of the Y. */
const Antibody: React.FC<{ pos: V3; s?: number; rot?: V3; q?: number; quat?: THREE.Quaternion }> = ({ pos, s = 0.4, rot = [0, 0, 0], q = 1, quat }) => {
  if (q <= 0.01) return null;
  const mat = <meshPhysicalMaterial color={P.lipidAmber} roughness={0.22} metalness={0.35} clearcoat={1} emissive={P.adenineGold} emissiveIntensity={0.25} />;
  const tipMat = <meshStandardMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={1.1} />;
  const arm = (side: 1 | -1) => (
    <group rotation={[0, 0, side * -0.62]}>
      <mesh position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.11, 0.6, 6, 12]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        {tipMat}
      </mesh>
    </group>
  );
  return (
    <group position={pos} rotation={quat ? undefined : rot} quaternion={quat} scale={s * q}>
      <mesh position={[0, -0.42, 0]}>
        <capsuleGeometry args={[0.12, 0.62, 6, 12]} />
        {mat}
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 14, 14]} />
        {mat}
      </mesh>
      {arm(1)}
      {arm(-1)}
    </group>
  );
};

/** White blood cell (B cell): translucent membrane, violet nucleus, small receptor Ys. wake 0..1, memory 0..1 adds a gold ring. */
const BCell: React.FC<{ f: number; pos: V3; r?: number; wake?: number; memory?: number; q?: number; seed?: number; squash?: number }> = ({
  f, pos, r = 1, wake = 1, memory = 0, q = 1, seed = 0, squash = 0,
}) => {
  if (q <= 0.01) return null;
  const pulse = membranePulse(f + seed * 40, 0.05, 0.03);
  const drift: V3 = [brownianDrift(f, 0.02, 0.1, seed), brownianDrift(f, 0.03, 0.12, seed + 1), 0];
  const recs = useMemo(() => fib(12), []);
  return (
    <group position={[pos[0] + drift[0], pos[1] + drift[1], pos[2]]} scale={[q * r * pulse * (1 + squash * 0.12), q * r * pulse * (1 - squash * 0.12), q * r * pulse]}>
      <mesh castShadow>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial color="#e0f2fe" roughness={0.2} metalness={0} transmission={0.6} thickness={1.2} ior={1.34} transparent opacity={0.88} clearcoat={1} emissive={P.membraneGlow} emissiveIntensity={0.08 + wake * 0.25} />
      </mesh>
      <mesh rotation={[f * 0.003, f * 0.004, 0]}>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color={P.cytosineViolet} emissive={P.cytosineViolet} emissiveIntensity={0.15 + wake * 0.9} roughness={0.3} />
      </mesh>
      {recs.map((d, i) => (
        <Antibody key={i} pos={[d[0] * 1.08, d[1] * 1.08, d[2] * 1.08]} s={0.22} quat={quatTo(d)} />
      ))}
      {memory > 0.01 && (
        <group rotation={[1.2 + Math.sin(f * 0.01) * 0.1, f * 0.01, 0.2]} scale={0.6 + memory * 0.55}>
          <mesh>
            <torusGeometry args={[1.45, 0.07, 16, 96]} />
            <meshStandardMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={1.6 * memory} metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/** Body cell (amber vesicle) that can sprout antigen spikes (k) or fall sick (sick tints it red). */
const BodyCell: React.FC<{ f: number; pos: V3; r?: number; spikes?: number; sick?: number; q?: number; seed?: number }> = ({ f, pos, r = 1, spikes = 0, sick = 0, q = 1, seed = 3 }) => {
  if (q <= 0.01) return null;
  const col = new THREE.Color("#fbbf24").lerp(new THREE.Color("#ef4444"), sick);
  const pulse = membranePulse(f + seed * 30, 0.045, 0.04);
  return (
    <group position={[pos[0] + brownianDrift(f, 0.02, 0.1, seed), pos[1] + brownianDrift(f, 0.025, 0.1, seed + 1), pos[2]]} scale={q * r * pulse}>
      <mesh castShadow>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial color={col} roughness={0.25} transmission={0.55} thickness={1} ior={1.34} transparent opacity={0.85} clearcoat={0.9} emissive={col} emissiveIntensity={0.12 + sick * 0.3} />
      </mesh>
      <mesh>
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      {SPIKES.slice(0, 12).map((d, i) => {
        const k = clamp01(spikes * 12 - i);
        if (k <= 0.01) return null;
        return (
          <group key={i} quaternion={SPIKE_Q[i]} scale={k}>
            <mesh position={[0, 1.15, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 0.3, 10]} />
              <meshStandardMaterial color={RUBY} roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.36, 0]}>
              <sphereGeometry args={[0.13, 14, 14]} />
              <meshStandardMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={1.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** mRNA blueprint: one glowing ribbon strand with coloured base rungs. Origin = centre. */
const MRNA: React.FC<{ f: number; pos: V3; s?: number; q?: number }> = ({ f, pos, s = 1, q = 1 }) => {
  const { geo, rungs } = useMemo(() => {
    const pts = Array.from({ length: 40 }, (_, i) => {
      const x = (i / 39 - 0.5) * 3.2;
      return new THREE.Vector3(x, Math.sin(i * 0.45) * 0.35, Math.cos(i * 0.45) * 0.35);
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    const rungs = Array.from({ length: 16 }, (_, i) => {
      const u = (i + 0.5) / 16;
      return { p: curve.getPointAt(u), c: [P.adenineGold, P.thymineCyan, P.cytosineViolet, P.guanineRuby][i % 4] };
    });
    return { geo: new THREE.TubeGeometry(curve, 160, 0.09, 12, false), rungs };
  }, []);
  if (q <= 0.01) return null;
  return (
    <group position={pos} rotation={[f * 0.006, 0, Math.sin(f * 0.01) * 0.15]} scale={s * q}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={P.membraneGlow} emissive={P.membraneGlow} emissiveIntensity={0.5} roughness={0.25} clearcoat={1} />
      </mesh>
      {rungs.map((r, i) => (
        <mesh key={i} position={[r.p.x, r.p.y - 0.22, r.p.z]}>
          <boxGeometry args={[0.1, 0.42, 0.1]} />
          <meshStandardMaterial color={r.c} emissive={r.c} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

/** Glass vaccine vial with liquid and an AUDIRA label. Origin = bottom centre. */
const Vial: React.FC<{ pos: V3; s?: number; q?: number; text?: string; cap?: string; glow?: number; rot?: number }> = ({ pos, s = 1, q = 1, text = "VAKSIN", cap = RUBY, glow = 0, rot = 0 }) => {
  const tex = useLabelTexture([{ text: "AUDIRA", color: "#e11d48", size: 70 }, { text, color: "#0f172a", size: 64 }]);
  if (q <= 0.01) return null;
  return (
    <group position={pos} scale={s * q} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.6, 48]} />
        <meshPhysicalMaterial color="#e0f2fe" roughness={0.04} transmission={0} transparent opacity={0.28} clearcoat={1} emissive="#7dd3fc" emissiveIntensity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.95, 48]} />
        <meshStandardMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={0.7 + glow * 1.0} roughness={0.2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.24, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.26, 32]} />
        <meshPhysicalMaterial color={cap} roughness={0.3} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.85, 0.505]}>
        <planeGeometry args={[0.82, 0.41]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
    </group>
  );
};

/** Syringe pointing down-left along its local -x; origin = needle tip. push 0..1 moves the plunger. */
const Syringe: React.FC<{ pos: V3; rotZ?: number; push?: number; q?: number; s?: number; drop?: number }> = ({ pos, rotZ = 0.55, push = 0, q = 1, s = 1, drop = 0 }) => {
  if (q <= 0.01) return null;
  const B0 = 1.3, BL = 2.2;
  return (
    <group position={pos} rotation={[0, 0, rotZ]} scale={s * q}>
      <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 1.3, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[B0 - 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.2, 0.2, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[B0 + BL / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, BL, 40]} />
        <meshPhysicalMaterial color="#f0f9ff" roughness={0.05} transmission={0} transparent opacity={0.3} clearcoat={1} emissive="#bae6fd" emissiveIntensity={0.15} depthWrite={false} />
      </mesh>
      <mesh position={[B0 + (BL * (1 - push)) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, Math.max(0.01, BL * (1 - push)), 32]} />
        <meshStandardMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={0.45} transparent opacity={0.85} />
      </mesh>
      <mesh position={[B0 + BL * (1 - push) + 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.27, 0.27, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[B0 + BL * (1 - push) + 0.04 + 1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[B0 + BL * (1 - push) + 2.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[B0 + BL + 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.06, 32]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      {drop > 0.01 && (
        <mesh position={[-0.02, -0.04, 0]} scale={drop}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
};

/** Brownian solutes + far vesicles: the wet cytoplasm every scene floats in. */
const Medium: React.FC<{ f: number; alarm?: number; spread?: number }> = ({ f, alarm = 0, spread = 1 }) => {
  const parts = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (hash(i * 3 + 1) - 0.5) * 22,
        y: (hash(i * 3 + 2) - 0.5) * 22,
        z: -6 + (hash(i * 3 + 3) - 0.5) * 14,
        s: 0.04 + hash(i) * 0.09,
        v: 0.004 + hash(i + 50) * 0.01,
        c: [P.thymineCyan, P.membraneGlow, P.cytosineViolet][i % 3],
      })),
    [],
  );
  const ves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        p: [(hash(i * 7 + 1) - 0.5) * 16, (hash(i * 7 + 2) - 0.5) * 16, -8 - hash(i * 7 + 3) * 8] as V3,
        r: 0.8 + hash(i * 5) * 1.4,
        c: [P.membraneGlow, P.thymineCyan, P.cytosineViolet, RUBY][i % 4],
      })),
    [],
  );
  return (
    <group scale={spread}>
      {parts.map((p, i) => (
        <mesh key={i} position={[p.x + Math.sin(f * 0.02 + i) * 0.25, ((p.y + f * p.v + 11) % 22) - 11, p.z]}>
          <sphereGeometry args={[p.s, 10, 10]} />
          <meshStandardMaterial color={alarm > 0.5 && i % 4 === 0 ? RUBY : p.c} emissive={alarm > 0.5 && i % 4 === 0 ? RUBY : p.c} emissiveIntensity={0.9} transparent opacity={0.7} />
        </mesh>
      ))}
      {ves.map((v, i) => (
        <mesh key={`v${i}`} position={[v.p[0] + brownianDrift(f, 0.01, 0.4, i), v.p[1] + brownianDrift(f, 0.012, 0.4, i + 3), v.p[2]]} scale={membranePulse(f + i * 50, 0.03, 0.05)}>
          <sphereGeometry args={[v.r, 32, 32]} />
          <meshStandardMaterial color={v.c} emissive={v.c} emissiveIntensity={0.25} transparent opacity={0.35} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Lights: React.FC<{ alarm?: number; rimAt?: V3 }> = ({ alarm = 0, rimAt = [0, 0, 0] }) => (
  <>
    <ambientLight color={P.fluidAmbient} intensity={1.4} />
    <directionalLight position={[4, 10, 6]} color="#c7d2fe" intensity={2.4} castShadow />
    <pointLight position={[rimAt[0] - 5, rimAt[1] + 3, rimAt[2] - 3]} color={P.thymineCyan} intensity={3.0 * (1 - alarm * 0.6)} distance={18} />
    <pointLight position={[rimAt[0] + 5, rimAt[1] - 2, rimAt[2] + 2]} color={P.guanineRuby} intensity={2.8 + alarm * 3} distance={18} />
    <pointLight position={[rimAt[0], rimAt[1], rimAt[2] - 2]} color={P.adenineGold} intensity={1.5} distance={12} />
    {alarm > 0.01 && <pointLight position={[rimAt[0], rimAt[1] + 4, rimAt[2] + 3]} color="#ff2d2d" intensity={4 * alarm} distance={16} />}
    <fog attach="fog" args={[P.microscopyVoid, 9, 34]} />
  </>
);

// ---------------------------------------------------------------- cameras (scene-local seconds)
const ALIVE = { deg: 3, breath: 0.03 };
const at = (target: V3, az: number, el: number, dist: number, fov = 35): Framing => ({ target, az, el, dist, fov, roll: 0 });
type Rig = ReturnType<typeof shotPlan>;
const RIGS: { t0: number; rig: Rig }[] = [
  { t0: 0, rig: shotPlan(FPS, at([0.4, -0.2, 0], 18, 8, 11), [
    { at: 1.4, move: fr(at([0.2, 0.1, 0], 8, 6, 7.5)) },
    { at: 3.0, move: fr(at([-0.2, 0.9, 0], -6, 4, 8.5)) },
    { at: 4.1, move: fr(at([0.02, -0.06, 0], 0, 2, 2.2)) },
    { at: 5.0, move: fr(at([0.02, -0.06, 0], 0, 0, 0.35)) },
  ]) },
  { t0: 5.0, rig: shotPlan(FPS, at([0, 0.2, 0], -14, 6, 12.5), [
    { at: 2.3, move: fr(at([0, 0.1, 0], 14, 8, 10)) },
    { at: 4.6, move: fr(at([0.7, 0.8, 0.5], 24, 14, 5.2)) },
    { at: 6.2, move: fr(at([0.5, -0.7, 0], -6, 10, 12.5)) },
    { at: 9.4, move: orbit(10) },
  ]) },
  { t0: 14.4, rig: shotPlan(FPS, at([0, 0.4, 0], 20, 6, 11.5), [
    { at: 3.9, move: fr(at([0.9, -1.4, 0], 4, 8, 7.5)) },
    { at: 7.2, move: fr(at([0, 0.3, 0], -10, 12, 15)) },
    { at: 10.2, move: fr(at([-1.0, -1.4, 0], -18, 8, 8)) },
    { at: 12.0, move: orbit(-6) },
  ]) },
  { t0: 26.4, rig: shotPlan(FPS, at([0, 0.2, 0], -8, 6, 10), [
    { at: 2.9, move: fr(at([0, -0.4, 0], 8, 8, 8.5)) },
    { at: 5.6, move: fr(at([-3.0, 0.1, 0], -6, 6, 7)) },
    { at: 8.5, move: fr(at([0, 0.6, 0], 6, 8, 7)) },
    { at: 10.3, move: fr(at([3.1, 0.1, 0], 14, 6, 7)) },
    { at: 13.8, move: fr(at([3.4, -0.9, 0], 4, 10, 7.5)) },
    { at: 16.2, move: orbit(-8) },
  ]) },
  { t0: 42.6, rig: shotPlan(FPS, at([0, -0.4, 0], -12, 6, 11.5), [
    { at: 2.5, move: fr(at([0, -0.6, 0], 10, 8, 10)) },
    { at: 5.0, move: fr(at([0, 0.8, 0], -4, 4, 12.5)) },
    { at: 7.1, move: fr(at([0, -0.4, 0.6], 14, 10, 5.8)) },
    { at: 9.6, move: fr(at([0, 0.2, 0], -6, 8, 9)) },
    { at: 11.8, move: fr(at([0, -0.6, 0], 8, 10, 10)) },
    { at: 14.45, move: orbit(-8) },
  ]) },
  { t0: 57.05, rig: shotPlan(FPS, at([0.4, 0.3, 0], 16, 6, 12), [
    { at: 2.5, move: fr(at([-0.8, -0.6, 0.3], -18, 8, 7.5)) },
    { at: 4.9, move: fr(at([0.6, 0.4, 0], 8, 8, 11)) },
    { at: 7.2, move: fr(at([0.8, 0.0, 0], -6, 16, 9)) },
    { at: 9.3, move: orbit(8) },
  ]) },
  { t0: 66.35, rig: shotPlan(FPS, at([0, 0, -0.6], -10, 34, 12.5), [
    { at: 2.4, move: fr(at([0, 0, -0.4], 8, 36, 11.5)) },
    { at: 5.7, move: fr(at([0, 0, -1.0], -6, 46, 13)) },
    { at: 7.2, move: fr(at([0, 0, -3.2], 4, 58, 17)) },
    { at: 12.0, move: fr(at([0, 0, -3.6], 22, 64, 21)) },
    { at: 15.0, move: fr(at([0, 0, -3.4], 30, 62, 20)) },
    { at: 18.2, move: orbit(6) },
  ]) },
];
const camAt = (t: number) => {
  let r = RIGS[0];
  for (const x of RIGS) if (t >= x.t0) r = x;
  const s = cameraAt(r.rig, (t - r.t0) * FPS, FPS, { lens: { aperture: 0, maxBlur: 0, exposure: 1 }, alive: ALIVE });
  return { pos: s.pos, target: s.target, fov: s.fov };
};
void framingFrom;

// ---------------------------------------------------------------- scenes
const Hook: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const tipIn = eout(t, 0.3, 1.3);
  const tip = lv([2.2, 1.2, 0.2], [0.02, -0.06, 0], tipIn);
  return (
    <>
      <Lights />
      <Medium f={f} />
      <Vial pos={[-1.0, -2.2, -0.6]} s={0.95} q={pop(t, 0.15)} glow={eio(t, 1.5, 2.6)} rot={0.2} />
      <Syringe pos={tip} rotZ={0.62} push={eio(t, 1.5, 2.7)} drop={eout(t, 2.6, 3.0)} />
      <BodyCell f={f} pos={[-0.3, -0.6, -1.8]} r={0.9} q={pop(t, 0.6)} />
      <Virus f={f} pos={[-0.7, 2.6, -1.2]} r={0.75} q={pop(t, 3.0, 0.5)} ghost={1} glow={0.4} seed={2} />
    </>
  );
};

const Antigen: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const b = lv([4.5, -2.6, 0.4], [1.6, -2.3, 0.6], eout(t, 11.0, 12.2));
  return (
    <>
      <Lights />
      <Medium f={f} />
      <Virus f={f} pos={[0, 0.3, 0]} r={1.15} q={pop(t, 5.0, 0.5)} glow={popIO(t, 9.6, 14.0, 0.5)} seed={1} />
      <BCell f={f} pos={b} r={0.95} wake={0.6} seed={4} q={t > 10.9 ? 1 : 0} />
      <BodyCell f={f} pos={[-2.2, -2.6, -2.2]} r={0.8} />
    </>
  );
};

const SPOTS: V3[] = Array.from({ length: 14 }, (_, i) => [(hash(i * 4.4 + 1) - 0.5) * 4.6, -0.6 + hash(i * 2.2 + 3) * 3.6, -2.6 + hash(i * 9.1) * 2.6]);
const Infection: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const alarm = eio(t, 22.5, 25.0);
  const n = t < 21.9 ? 1 : Math.min(14, Math.pow(2, Math.floor((t - 21.9) / 0.55) + 1));
  const prog = eio(t, 18.3, 26.4);
  return (
    <>
      <Lights alarm={alarm} />
      <Medium f={f} alarm={alarm} />
      {SPOTS.map((s, i) => {
        if (i >= n) return null;
        const born = i === 0 ? 0 : 21.9 + Math.floor(Math.log2(i + 1) - 1e-6) * 0.55;
        const p: V3 = i === 0 ? [0, 0.6, 0] : s;
        return <Virus key={i} f={f} pos={p} r={i === 0 ? 1.0 : 0.55} q={i === 0 ? 1 : pop(t, born, 0.35)} seed={i * 1.7} glow={0.15} />;
      })}
      <BCell f={f} pos={[1.4, -2.3, 0.8]} r={0.85} wake={0.3} seed={6} />
      {[0, 1, 2].map((i) => (
        <Antibody key={i} pos={[0.5 + i * 0.35, -1.0 + i * 0.12, 1.2]} s={0.32} rot={[0, 0, 0.3 * i]} q={prog > 0.25 + i * 0.25 ? pop(t, 18.3 + 2.2 * (i + 1), 0.4) : 0} />
      ))}
      <BodyCell f={f} pos={[-1.2, -2.2, 0.2]} r={0.95} sick={eio(t, 24.4, 25.6)} seed={9} />
    </>
  );
};

const ISI: V3[] = [[-3.1, 0.4, 0], [0, 1.0, 0.2], [3.1, -0.5, 0]];
const VIAL_TOP: V3 = [0, 0.4, 0];
const Training: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const vy = lerp(7, -2.0, eout(t, 26.9, 27.45));
  const fly = (a: number) => lv(VIAL_TOP, ISI[0], 0);
  void fly;
  const out = (i: number, a: number) => lv(VIAL_TOP, ISI[i], eout(t, a, a + 0.9));
  const mrnaIn = eio(t, 40.2, 41.0);
  const mrnaPos = lv(lv(out(2, 36.7), [3.55, -0.5, 0], eout(t, 36.7, 37.6)), [3.4, -0.9, 0.4], mrnaIn);
  return (
    <>
      <Lights rimAt={[0, 0, 0]} />
      <Medium f={f} />
      <Vial pos={[0, vy, 0]} s={1.35} glow={eio(t, 29.3, 30.4)} rot={Math.sin(f * 0.01) * 0.15} />
      {/* ISI 1: weakened / killed virus */}
      <Virus f={f} pos={out(0, 32.0)} r={0.75} q={pop(t, 32.0, 0.4)} dead={0.75} seed={5} spin={0.4} />
      {/* ISI 2: loose antigen pieces */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = out(1, 34.85 + i * 0.06);
        const a = (i / 5) * Math.PI * 2 + f * 0.01;
        return (
          <group key={i} position={[p[0] + Math.cos(a) * 0.7, p[1] + Math.sin(a) * 0.45, p[2] + Math.sin(a) * 0.3]} scale={pop(t, 34.85 + i * 0.06)} rotation={[a, a * 0.7, 0]}>
            <mesh position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 0.42, 12]} />
              <meshStandardMaterial color={RUBY} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={1.2} />
            </mesh>
          </group>
        );
      })}
      {/* ISI 3: mRNA blueprint, later read by a body cell */}
      <MRNA f={f} pos={mrnaPos} s={lerp(0.62, 0.45, mrnaIn)} q={pop(t, 36.7, 0.4) * (1 - lin(t, 41.0, 41.3))} />
      <BodyCell f={f} pos={[3.4, -0.9, 0]} r={1.15} q={pop(t, 39.9, 0.4)} spikes={eio(t, 41.1, 42.4)} seed={11} />
    </>
  );
};

const BC: V3[] = [[-2.2, -1.3, 0], [0, -1.6, 0.6], [2.2, -1.3, 0]];
const Army: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const memory = eout(t, 49.7, 50.4);
  const side = eio(t, 51.0, 52.2);
  const shots = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({ b: 47.7 + i * 0.1, src: i % 3, dx: (hash(i * 3.7) - 0.5) * 5.4, dz: (hash(i * 1.9) - 0.5) * 2, rz: (hash(i * 5.1) - 0.5) * 2 })),
    [],
  );
  return (
    <>
      <Lights />
      <Medium f={f} />
      {BC.map((p, i) => {
        const isMem = i === 1;
        const w = eout(t, 45.2 + i * 0.25, 45.6 + i * 0.25);
        const sq = Math.max(0, 1 - Math.abs(t - (45.3 + i * 0.25)) / 0.25);
        const pos: V3 = isMem ? lv(p, [0, -0.2, 0.6], side) : lv(p, [p[0] * 2.6, p[1] - 0.6, -1.5], side);
        return <BCell key={i} f={f} pos={pos} r={isMem ? lerp(0.95, 1.15, memory) : 0.85} wake={0.15 + w * 0.85} memory={isMem ? memory : 0} q={1 - (isMem ? 0 : side * 0.6)} seed={i * 3} squash={sq} />;
      })}
      {shots.map((s, i) => {
        const k = (t - s.b) / 1.7;
        if (k <= 0 || k > 1 || t > 51.0) return null;
        const p = BC[s.src];
        return <Antibody key={i} pos={[p[0] + s.dx * k, p[1] + 0.9 + k * 4.0, p[2] + s.dz * k]} s={0.42} rot={[f * 0.02, 0, s.rz + f * 0.01]} q={pop(t, s.b, 0.25)} />;
      })}
      <Vial pos={[-1.15, -2.9, 0.8]} s={0.8} q={pop(t, 54.4)} text="DOSIS 1" cap={P.cytosineViolet} rot={0.25} />
      <Vial pos={[1.15, -2.9, 0.8]} s={0.8} q={pop(t, 55.1)} text="DOSIS 2" cap={P.cytosineViolet} rot={-0.25} />
    </>
  );
};

const ENEMY: V3[] = [[1.0, 1.3, 0], [2.1, -0.1, -0.6], [0.5, -0.5, 0.9], [1.9, 2.3, -1.2], [1.3, 0.5, -1.8]];
const MEM: V3 = [-1.7, -1.9, 0.6];
const Battle: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const inQ = eout(t, 57.5, 59.0);
  const lose = eio(t, 64.2, 65.6);
  const shots = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ v: i % 5, d: SPIKES[(i * 7) % 20], b: 62.0 + (i % 10) * 0.1 })), []);
  return (
    <>
      <Lights />
      <Medium f={f} />
      {ENEMY.map((p, i) => {
        const pos: V3 = [lerp(p[0] + 6, p[0], inQ), p[1] - lose * (1.2 + i * 0.3), p[2]];
        return <Virus key={i} f={f} pos={pos} r={(i === 0 ? 0.8 : 0.58) * (1 - lose * 0.35)} dead={lose} glow={popIO(t, 59.6, 62.2)} seed={i * 2.3} spin={1 - lose} />;
      })}
      <BCell f={f} pos={MEM} r={1.05} wake={1} memory={1} seed={8} />
      {/* recognition beams */}
      {t > 59.6 && t < 62.3 && ENEMY.map((p, i) => {
        const a = new THREE.Vector3(...MEM), b = new THREE.Vector3(p[0], p[1], p[2]);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b) * eout(t, 59.6 + i * 0.08, 60.2 + i * 0.08);
        const q = quatTo([b.x - a.x, b.y - a.y, b.z - a.z]);
        const start = a.clone().add(b.clone().sub(a).normalize().multiplyScalar(len / 2));
        void mid;
        return (
          <mesh key={i} position={start} quaternion={q}>
            <cylinderGeometry args={[0.018, 0.018, len, 6]} />
            <meshStandardMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={2} transparent opacity={0.8} />
          </mesh>
        );
      })}
      {/* antibody swarm: fly from the memory cell and lock onto spike tips */}
      {shots.map((s, i) => {
        const k = eout(t, s.b, s.b + 0.8);
        if (k <= 0) return null;
        const e = ENEMY[s.v];
        const er = (s.v === 0 ? 0.8 : 0.58) * (1 - lose * 0.35);
        const dst: V3 = [e[0] + s.d[0] * er * 1.75, e[1] - lose * (1.2 + s.v * 0.3) + s.d[1] * er * 1.75, e[2] + s.d[2] * er * 1.75];
        const pos = lv([MEM[0] + 0.8, MEM[1] + 0.6, MEM[2]], dst, k);
        return <Antibody key={i} pos={pos} s={0.3} quat={quatTo([-s.d[0], -s.d[1], -s.d[2]])} />;
      })}
    </>
  );
};

const COLS = 4, ROWS = 5, GAP = 1.35;
const BABY = 9;
const GRID: V3[] = Array.from({ length: COLS * ROWS }, (_, i) => [(i % COLS - (COLS - 1) / 2) * GAP, 0, (Math.floor(i / COLS) - (ROWS - 1) / 2) * GAP]);
const Herd: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const path: V3[] = [[5, 1.6, -3], GRID[2], GRID[5], GRID[14], GRID[11], [-5, 2.0, 2]];
  const gk = clamp01((t - 68.2) / 4.0) * 0.9999 * (path.length - 1);
  const gi = Math.floor(gk), gq = sm(gk - gi);
  const gp = lv(path[gi], path[gi + 1], gq);
  gp[1] += 0.9 + Math.sin(gq * Math.PI) * 1.2;
  const link = eio(t, 72.0, 73.0);
  // S8: every protected cell becomes a person = the lives saved
  const human = eout(t, 73.6, 74.6);
  return (
    <>
      <Lights />
      <Medium f={f} spread={1.6} />
      {GRID.map((p, i) => {
        const baby = i === BABY;
        const q = pop(t, 66.8 + (i % COLS) * 0.06 + Math.floor(i / COLS) * 0.05);
        return (
          <group key={i}>
            <BodyCell f={f} pos={p} r={baby ? 0.3 : 0.4} q={q * (1 - human)} seed={i} />
            {human > 0.01 && (
              <ToyPerson f={f} seed={i + 5} pose={baby ? "wave" : i % 3 === 0 ? "cheer" : "stand"} expression="happy" outfit="casual"
                position={[p[0], -0.5, p[2]]} heading={Math.PI * 0.15} scale={(baby ? 0.75 : 1.1) * human} shadows={false} />
            )}
            {!baby && (
              <mesh position={p} scale={0.62 * pop(t, 67.0 + i * 0.05) * (1 - 0.35 * human)}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhysicalMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={0.35} roughness={0.15} transmission={0.6} thickness={0.5} transparent opacity={0.45 * (1 - 0.75 * human)} depthWrite={human < 0.5} clearcoat={1} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* the unvaccinated one gets a guard ring */}
      <mesh position={[GRID[BABY][0], 0.02, GRID[BABY][2]]} rotation={[-Math.PI / 2, 0, f * 0.01]} scale={eout(t, 69.8, 70.5)}>
        <torusGeometry args={[0.65, 0.04, 12, 64]} />
        <meshStandardMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={1.8} />
      </mesh>
      {/* herd links between neighbouring shields */}
      {link > 0.01 && GRID.flatMap((p, i) => {
        const out: React.ReactNode[] = [];
        const nb = [i % COLS < COLS - 1 ? i + 1 : -1, i + COLS < GRID.length ? i + COLS : -1];
        for (const j of nb) {
          if (j < 0) continue;
          const q = GRID[j];
          const len = GAP * link;
          const horiz = q[0] !== p[0];
          out.push(
            <mesh key={`${i}-${j}`} position={[horiz ? p[0] + len / 2 : p[0], 0, horiz ? p[2] : p[2] + len / 2]} rotation={horiz ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, len, 6]} />
              <meshStandardMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={1.6} />
            </mesh>,
          );
        }
        return out;
      })}
      {t > 68.0 && t < 72.4 && <Virus f={f} pos={gp} r={0.32} glow={0.5} seed={3} />}
    </>
  );
};

const sceneAt = (f: number, t: number) => {
  if (t < 5.0) return <Hook f={f} t={t} />;
  if (t < 14.4) return <Antigen f={f} t={t} />;
  if (t < 26.4) return <Infection f={f} t={t} />;
  if (t < 42.6) return <Training f={f} t={t} />;
  if (t < 57.05) return <Army f={f} t={t} />;
  if (t < 66.35) return <Battle f={f} t={t} />;
  return <Herd f={f} t={t} />;
};
const CUTS = [14.4, 26.4, 42.6, 57.05, 66.35];
const fadeAt = (t: number) => {
  if (t > 4.75 && t < 5.0) return lin(t, 4.75, 5.0);
  if (t >= 5.0 && t < 5.35) return 1 - lin(t, 5.0, 5.35);
  for (const c of CUTS) {
    if (t > c - 0.18 && t < c) return lin(t, c - 0.18, c) * 0.85;
    if (t >= c && t < c + 0.22) return (1 - lin(t, c, c + 0.22)) * 0.85;
  }
  return 0;
};

// ---------------------------------------------------------------- HUD (layout px, 1080 × 1920)
const MONO = "'SF Mono', Consolas, Monaco, 'Courier New', monospace";
const Card: React.FC<{ s: number; y: number; q: number; kicker?: string; big: string; color?: string; sub?: string; bigSize?: number; w?: number }> = ({
  s, y, q, kicker, big, color = P.thymineCyan, sub, bigSize = 64, w = 920,
}) =>
  q <= 0.01 ? null : (
    <div
      style={{
        position: "absolute", left: ((1080 - w) / 2) * s, top: y * s, width: w * s, padding: `${26 * s}px ${36 * s}px`,
        background: "rgba(4, 13, 33, 0.86)", borderLeft: `${14 * s}px solid ${color}`, borderRadius: 26 * s,
        boxShadow: `0 0 ${40 * s}px ${color}55`, transform: `scale(${q})`, opacity: Math.min(1, q), transformOrigin: "center",
        boxSizing: "border-box",
      }}
    >
      {kicker && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36 * s, letterSpacing: 3 * s, color }}>{kicker}</div>}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: bigSize * s, color: "#f8fafc", lineHeight: 1.12 }}>{big}</div>
      {sub && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40 * s, color: "#cbd5e1", marginTop: 6 * s }}>{sub}</div>}
    </div>
  );
const Tag: React.FC<{ s: number; y: number; q: number; text: string; color?: string; size?: number; rot?: number }> = ({ s, y, q, text, color = P.adenineGold, size = 76, rot = -2 }) =>
  q <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, width: 1080 * s, top: y * s, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT, fontWeight: 800, fontSize: size * s, color: "#02050f", background: color, padding: `${8 * s}px ${30 * s}px`,
          borderRadius: 18 * s, transform: `rotate(${rot}deg) scale(${q})`, opacity: Math.min(1, q), boxShadow: `0 0 ${36 * s}px ${color}88`, letterSpacing: 1 * s,
        }}
      >
        {text}
      </div>
    </div>
  );
const Bar: React.FC<{ s: number; y: number; q: number; label: string; tag: string; v: number; color: string }> = ({ s, y, q, label, tag, v, color }) =>
  q <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 80 * s, width: 920 * s, top: y * s, padding: `${22 * s}px ${34 * s}px`, background: "rgba(4,13,33,0.86)", borderRadius: 24 * s, transform: `scale(${q})`, opacity: Math.min(1, q), boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 800, fontSize: 44 * s, color: "#f8fafc" }}>
        <span>{label}</span>
        <span style={{ color }}>{tag}</span>
      </div>
      <div style={{ marginTop: 14 * s, height: 34 * s, borderRadius: 17 * s, background: "rgba(148,163,184,0.25)" }}>
        <div style={{ width: `${Math.max(0, Math.min(1, v)) * 100}%`, height: "100%", borderRadius: 17 * s, background: color, boxShadow: `0 0 ${20 * s}px ${color}` }} />
      </div>
    </div>
  );

const Hud: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const n154 = Math.round(lerp(0, 154, eout(t, 74.9, 76.6)));
  const weeks = Math.round(lerp(1, 4, eio(t, 52.5, 54.0)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* S1 */}
      <Tag s={s} y={230} q={popIO(t, 0.15, 2.7)} text="CARA KERJA VAKSIN" size={84} />
      <Tag s={s} y={230} q={popIO(t, 2.9, 4.8)} text="MUSUH TAK DIKENAL?" color={P.guanineRuby} size={72} />
      {/* S2 */}
      <Tag s={s} y={230} q={popIO(t, 5.75, 7.4)} text="AUDIRA EXPLAINED" color={P.thymineCyan} size={76} />
      <Card s={s} y={230} q={popIO(t, 9.55, 14.2)} kicker="ANTIGEN" big="Tanda pengenal kuman" color={P.adenineGold} />
      <Tag s={s} y={500} q={popIO(t, 12.9, 14.2)} text="MUSUH!" color={P.guanineRuby} size={80} rot={-6} />
      {/* S3 */}
      <Tag s={s} y={230} q={popIO(t, 14.6, 18.2)} text="KUMAN BARU" color={P.guanineRuby} size={80} />
      <Bar s={s} y={230} q={popIO(t, 18.3, 26.2)} label="Membuat antibodi" tag="LAMBAT" v={0.05 + 0.3 * eio(t, 18.3, 26.4)} color={P.adenineGold} />
      <Tag s={s} y={480} q={popIO(t, 22.0, 24.6)} text="BERKEMBANG BIAK!" color={P.guanineRuby} size={66} rot={-3} />
      <Tag s={s} y={480} q={popIO(t, 25.0, 26.3)} text="SAKIT!" color="#ef4444" size={86} rot={4} />
      {/* S4 */}
      <Tag s={s} y={230} q={popIO(t, 27.1, 29.2)} text="VAKSIN" color={P.thymineCyan} size={90} />
      <Tag s={s} y={230} q={popIO(t, 29.35, 31.9)} text="LATIHAN DULU!" size={78} />
      <Card s={s} y={230} q={popIO(t, 32.05, 34.75)} kicker="ISI 1" big="Kuman dilemahkan / mati" color="#9ca3af" />
      <Card s={s} y={230} q={popIO(t, 34.85, 36.6)} kicker="ISI 2" big="Potongan antigen" color={P.adenineGold} />
      <Card s={s} y={230} q={popIO(t, 36.7, 40.1)} kicker="ISI 3" big="Cetak biru mRNA" color={P.membraneGlow} />
      <Card s={s} y={230} q={popIO(t, 40.3, 42.5)} kicker="SEL TUBUH" big="Membuat antigen sendiri" color="#fbbf24" />
      {/* S5 */}
      <Card s={s} y={230} q={popIO(t, 43.0, 45.0)} kicker="AMAN" big="Tidak bikin sakit" color={P.thymineCyan} />
      <Tag s={s} y={230} q={popIO(t, 45.1, 47.5)} text="BANGUN!" color={P.cytosineViolet} size={90} />
      <Tag s={s} y={230} q={popIO(t, 47.7, 49.6)} text="ANTIBODI" size={88} />
      <Tag s={s} y={230} q={popIO(t, 49.8, 52.1)} text="SEL MEMORI" size={84} />
      <Tag s={s} y={360} q={popIO(t, 50.6, 52.1)} text="TERUS BERJAGA" color={P.thymineCyan} size={56} />
      <Card s={s} y={230} q={popIO(t, 52.3, 54.2)} kicker="BUTUH WAKTU" big={`Minggu ke-${weeks}`} color={P.adenineGold} sub="Latihan beberapa minggu" />
      <Tag s={s} y={230} q={popIO(t, 54.4, 56.9)} text="LEBIH DARI 1 DOSIS" color={P.cytosineViolet} size={70} />
      {/* S6 */}
      <Tag s={s} y={230} q={popIO(t, 57.7, 59.5)} text="KUMAN ASLI" color={P.guanineRuby} size={84} />
      <Tag s={s} y={230} q={popIO(t, 59.65, 61.9)} text="AKU KENAL KAMU!" size={72} rot={-4} />
      <Bar s={s} y={230} q={popIO(t, 62.0, 64.1)} label="Infeksi pertama" tag="LAMBAT" v={0.3} color="#94a3b8" />
      <Bar s={s} y={410} q={popIO(t, 62.3, 64.1)} label="Sudah divaksin" tag="CEPAT" v={eout(t, 62.4, 63.2)} color={P.adenineGold} />
      <Tag s={s} y={300} q={popIO(t, 64.2, 66.2)} text="KALAH!" color={P.thymineCyan} size={96} rot={-6} />
      {/* S7 */}
      <Tag s={s} y={230} q={popIO(t, 66.9, 69.7)} text="DIVAKSIN = TERLINDUNG" color={P.thymineCyan} size={64} />
      <Tag s={s} y={230} q={popIO(t, 69.8, 72.0)} text="TIDAK BISA DIVAKSIN?" color={P.adenineGold} size={64} />
      <Tag s={s} y={230} q={popIO(t, 72.05, 73.6)} text="KEKEBALAN KELOMPOK" size={70} />
      {/* S8 */}
      {(() => {
        const q = popIO(t, 73.6, 81.0);
        if (q <= 0.01) return null;
        return (
          <div style={{ position: "absolute", left: 60 * s, width: 960 * s, top: 230 * s, padding: `${28 * s}px 0`, background: "rgba(4,13,33,0.88)", borderRadius: 30 * s, borderTop: `${10 * s}px solid ${P.thymineCyan}`, textAlign: "center", transform: `scale(${q})`, opacity: Math.min(1, q), boxShadow: `0 0 ${50 * s}px ${P.thymineCyan}44` }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36 * s, letterSpacing: 3 * s, color: P.thymineCyan }}>WHO · THE LANCET 2024</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 170 * s, color: P.adenineGold, lineHeight: 1.05, textShadow: `0 0 ${30 * s}px ${P.adenineGold}88` }}>{n154} JUTA</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50 * s, color: "#f8fafc" }}>nyawa selamat · 50 tahun</div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42 * s, color: "#cbd5e1", marginTop: 6 * s }}>berkat imunisasi</div>
          </div>
        );
      })()}
      {/* S9 */}
      <Card s={s} y={300} q={popIO(t, 81.25, END)} kicker="IKUTI KANAL" big="@AudiraExplained" bigSize={74} color={P.guanineRuby} sub="Cara kerja hal di sekitarmu" />
    </AbsoluteFill>
  );
};

export const Vaksin3D: React.FC = () => {
  const frameNo = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tRaw = frameNo / fps;
  const t = Math.min(tRaw, END);
  const f = t * FPS;
  const shot = camAt(t);
  return (
    <AbsoluteFill style={{ background: P.microscopyVoid }}>
      <FilmScene
        frame={frameNo}
        shot={shot}
        background={P.microscopyVoid}
        profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
        hdri="studio"
        exposure={1}
        envIntensity={0.55}
        ao
        near={0.05}
        far={200}
        fade={fadeAt(t)}
        fadeColor={t < 5.4 ? "#c9fbf3" : P.microscopyVoid}
        // The overlay box is already scaled by fmt.scale, so the HUD draws in layout px (s = 1).
        overlay={() => <Hud t={t} s={1} />}
      >
        {sceneAt(f, t)}
      </FilmScene>
      {/* Subtitle scales itself (useFormat), so it lives outside the pre-scaled overlay box. */}
      {tRaw < END && <Subtitle words={WORDS} frame={frameNo} fps={fps} maxWords={4} size={60} position={1290} baseColor="#e2e8f0" activeColor={P.adenineGold} />}
      <AudiraOutro seconds={VAKSIN_SECONDS - END} />
      <AudiraSignature seed="cara-kerja-vaksin-ep33" />
    </AbsoluteFill>
  );
};
