// AE-046 film: "Kabel Internet Bawah Laut Bisa Menghubungkan Antarnegara?" (ABYSSFORGE).
// Built on the approved cover world (Cover.tsx). Every cut, beat and caption reads its time from
// timeline.json (Audio Master Clock). Deterministic: everything derives from frame / fps.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import tl from "./timeline.json";
import { CameraRig } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { ABYSS_PALETTE } from "../../kits/abyssforge/lib/palette.ts";
import { makeGodRayTexture } from "../../kits/abyssforge/lib/materials.ts";
import { mulberry32 } from "../../kits/abyssforge/core/motion.ts";
import { Outro } from "../_shared/Outro.tsx";
import {
  Backdrop,
  CableSection,
  INSET_POS,
  LUMEN,
  Particles,
  Repeater,
  Station,
  Surface,
  Terrain,
  fx,
  groundH,
  makeGlowTexture,
  makeTextTexture,
  mono,
  repeaterU,
  sstep,
} from "./Cover.tsx";

// ---------------------------------------------------------------- timeline
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = tl.clips as Clip[];
const C: Record<string, Clip> = Object.fromEntries(CLIPS.map((c) => [c.id, c]));
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** Start (or end) of the first word in clip `id` that begins with `key`. */
const W = (id: string, key: string, end = false) => {
  const w = C[id].words.find((x) => norm(x.w).startsWith(key));
  if (!w) throw new Error(`word ${key} not in ${id}`);
  return end ? w.e : w.s;
};
export const FILM_TOTAL = tl.total;
const OUTRO_AT = tl.sections.OUTRO[1] + 0.2;

const T = {
  s1: 0,
  s3: C.l03.start,
  s4: C.l04.start,
  s5: C.l05.start,
  s6: W("l05", "setipis") - 0.12,
  s7: C.l06.start,
  s8: C.l07.start,
  s9: C.l08.start,
  s10: C.l09.start,
  s11: C.l10.start,
  s12: W("l10", "tapi") - 0.05,
  s13: C.l11.start,
  s14: C.l12.start,
  s15: C.l13.start,
  end: tl.total,
};
const SHOT_STARTS = [T.s1, T.s3, T.s4, T.s5, T.s6, T.s7, T.s8, T.s9, T.s10, T.s11, T.s12, T.s13, T.s14, T.s15];
export const SHOT_TIMES = SHOT_STARTS;

// ---------------------------------------------------------------- math helpers
type V3 = [number, number, number];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const ease = (k: number) => k * k * (3 - 2 * k);
type Key = { t: number; pos: V3; target: V3; fov?: number };
type Cam = { pos: V3; target: V3; fov: number };
/** Piecewise eased camera path through absolute-time keys; a gentle drift keeps it alive. */
const camPath = (keys: Key[], t: number, fov = 52): Cam => {
  if (t <= keys[0].t) return { pos: keys[0].pos, target: keys[0].target, fov: keys[0].fov ?? fov };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) {
      const k = ease((t - a.t) / (b.t - a.t));
      return { pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov ?? fov, b.fov ?? fov, k) };
    }
  }
  const l = keys[keys.length - 1];
  return { pos: l.pos, target: l.target, fov: l.fov ?? fov };
};
const win = (t: number, a: number, b: number, fade = 0.25) => sstep(a, a + fade, t) * (1 - sstep(b - fade, b, t));

// ---------------------------------------------------------------- the film cable (cover route + far coast)
const ROUTE: [number, number][] = [
  [-2.4, -17.7], [-2.15, -16.95], [-2.1, -16.2], [-1.75, -15.4], [-1.25, -14.2], [-0.6, -12.4], [-0.05, -10.6], [0.45, -9.2],
  [1.05, -8.9], [1.55, -10.2], [1.95, -13.5], [2.35, -19], [2.75, -27], [3.05, -38], [3.3, -52], [3.45, -66], [3.55, -76], [3.65, -82], [3.7, -86.2],
];
const makeRoute = () => {
  const base = new THREE.CatmullRomCurve3(ROUTE.map(([x, z]) => new THREE.Vector3(x, groundH(x, z, true) + 0.07, z)), false, "centripetal");
  const pts = base.getSpacedPoints(700).map((p) => new THREE.Vector3(p.x, Math.max(p.y, groundH(p.x, p.z, true) + 0.06), p.z));
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
};

const glowSprite = (glow: THREE.Texture, col: string, boost: number) =>
  new THREE.SpriteMaterial({ map: glow, color: new THREE.Color(col).multiplyScalar(boost), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });

const CableMesh: React.FC<{ curve: THREE.Curve<THREE.Vector3>; r?: number; core?: number; seg?: number }> = ({ curve, r = 0.055, core = 2.6, seg = 900 }) => {
  const body = useMemo(() => new THREE.TubeGeometry(curve, seg, r, 10, false), [curve, r, seg]);
  const coreG = useMemo(() => new THREE.TubeGeometry(curve, seg, r * 0.55, 8, false), [curve, r, seg]);
  const halo = useMemo(() => new THREE.TubeGeometry(curve, seg, r * 2.9, 8, false), [curve, r, seg]);
  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({ color: LUMEN.clone().multiplyScalar(core), fog: false }), [core]);
  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color="#0B141A" roughness={0.45} metalness={0.1} envMapIntensity={0.4} />
      </mesh>
      {core > 0 && <mesh geometry={coreG} material={coreMat} />}
      {core > 0 && (
        <mesh geometry={halo} ref={fx}>
          <meshBasicMaterial color={LUMEN} transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

/** Data pulses: short streaks of three sprites along a curve. */
const Pulses: React.FC<{ curve: THREE.Curve<THREE.Vector3>; t: number; n?: number; speed?: number; size?: number; mat: THREE.SpriteMaterial; from?: number; to?: number; dir?: 1 | -1 }> = ({
  curve, t, n = 22, speed = 0.035, size = 0.6, mat, from = 0, to = 1, dir = 1,
}) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const f = (i / n + t * speed) % 1;
      const u0 = from + (to - from) * (dir === 1 ? f : 1 - f);
      return [0, 0.004, 0.008].map((du, j) => {
        const u = Math.min(1, Math.max(0, u0 - du * dir));
        const q = curve.getPointAt(u);
        const sz = (size - j * size * 0.27) * Math.max(0.4, 1 - u * 1.2);
        return <sprite key={`${i}-${j}`} ref={fx} position={[q.x, q.y + 0.04, q.z]} scale={[sz, sz, 1]} material={mat} />;
      });
    })}
  </group>
);

const CableLights: React.FC<{ curve: THREE.Curve<THREE.Vector3>; us: number[]; col?: string; i?: number }> = ({ curve, us, col = ABYSS_PALETTE.lumenCyan, i = 6 }) => (
  <group>
    {us.map((u, k) => {
      const q = curve.getPointAt(u);
      return <pointLight key={k} position={[q.x, q.y + 0.6, q.z]} color={col} intensity={i} distance={5} decay={1.6} />;
    })}
  </group>
);

// ---------------------------------------------------------------- environment control
const Env: React.FC<{ bg: string; fog: string; density: number }> = ({ bg, fog, density }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    if (!(scene.fog instanceof THREE.FogExp2)) scene.fog = new THREE.FogExp2(fog, density);
    const f = scene.fog as THREE.FogExp2;
    f.color.set(fog);
    f.density = density;
  }, [scene, bg, fog, density]);
  return null;
};

const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const rnd = mulberry32(4611);
    const N = 700;
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = rnd() * Math.PI * 2, el = 0.05 + rnd() * 1.4, r = 140;
      p[i * 3] = Math.cos(a) * Math.cos(el) * r;
      p[i * 3 + 1] = Math.sin(el) * r;
      p[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r - 30;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} ref={fx}>
      <pointsMaterial color="#CFE6FF" size={1.6} sizeAttenuation={false} fog={false} transparent opacity={0.8} />
    </points>
  );
};

// ---------------------------------------------------------------- props
const Satellite: React.FC<{ pos: V3; t: number; s?: number }> = ({ pos, t, s = 1 }) => (
  <group position={pos} rotation={[0.3, t * 0.12, 0.2]} scale={s}>
    <mesh>
      <boxGeometry args={[0.8, 0.8, 1.1]} />
      <meshStandardMaterial color="#C9A24A" metalness={1} roughness={0.35} fog={false} />
    </mesh>
    {[-1, 1].map((d) => (
      <group key={d} position={[d * 1.75, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 0.05, 0.95]} />
          <meshStandardMaterial color="#1D3A7A" metalness={0.6} roughness={0.3} emissive="#0B2A66" emissiveIntensity={0.5} fog={false} />
        </mesh>
        <mesh position={[-d * 0.85, 0, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.06]} />
          <meshStandardMaterial color="#9AA4AA" metalness={1} roughness={0.3} fog={false} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
      <meshStandardMaterial color="#E8ECEF" metalness={0.4} roughness={0.35} side={THREE.DoubleSide} fog={false} />
    </mesh>
  </group>
);

const DashedBeam: React.FC<{ a: V3; b: V3; color: string; opacity: number; t: number }> = ({ a, b, color, opacity, t }) => {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    const m = new THREE.LineDashedMaterial({ color, dashSize: 0.6, gapSize: 0.4, transparent: true, fog: false });
    const l = new THREE.Line(g, m);
    l.computeLineDistances();
    l.layers.set(1);
    return l;
  }, [a, b, color]);
  (line.material as THREE.LineDashedMaterial).opacity = opacity;
  void t;
  return <primitive object={line} />;
};

const Island: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <mesh scale={[3.2, 0.9, 2.4]} position={[0, -0.35, 0]}>
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial color="#6E6450" roughness={0.95} />
    </mesh>
    <mesh scale={[2.2, 0.75, 1.6]} position={[-0.3, -0.18, 0]}>
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial color="#2F4A33" roughness={0.95} />
    </mesh>
    <group position={[0.4, 0.5, 0.3]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.55]} />
        <meshStandardMaterial color="#8C7A5C" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.66, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.6, 0.38, 4]} />
        <meshStandardMaterial color="#5A3E2A" roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.22, 0.28]}>
        <planeGeometry args={[0.16, 0.16]} />
        <meshBasicMaterial color={new THREE.Color("#FFC46B").multiplyScalar(2.6)} />
      </mesh>
      {/* small dish aimed at the satellite */}
      <mesh position={[-0.5, 0.35, 0]} rotation={[-0.7, 0.4, 0.5]}>
        <sphereGeometry args={[0.22, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
        <meshStandardMaterial color="#DDE3E6" metalness={0.3} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0.2, 0.5, 0.8]} color="#FFC46B" intensity={3} distance={4} decay={1.5} />
    </group>
  </group>
);

const Shark: React.FC<{ pos: V3; yaw: number; t: number }> = ({ pos, yaw, t }) => {
  const body = useMemo(() => {
    const prof = [[0.001, -1.05], [0.08, -0.9], [0.17, -0.5], [0.22, -0.05], [0.2, 0.35], [0.13, 0.75], [0.05, 1.0], [0.001, 1.08]].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(prof, 32);
    g.rotateZ(-Math.PI / 2);
    g.scale(1, 0.85, 1);
    return g;
  }, []);
  const fin = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.42, 0);
    s.lineTo(-0.05, 0.45);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false });
  }, []);
  const mat = <meshStandardMaterial color="#4A5A66" roughness={0.55} metalness={0.05} />;
  const sway = Math.sin(t * 7) * 0.12;
  return (
    <group position={pos} rotation={[0, yaw + sway * 0.4, 0]} scale={1.15}>
      <mesh geometry={body}>{mat}</mesh>
      <mesh geometry={fin} position={[0.0, 0.14, -0.015]}>{mat}</mesh>
      <group position={[-1.0, 0, 0]} rotation={[0, sway, 0]}>
        <mesh geometry={fin} position={[-0.32, 0, -0.015]} rotation={[0, 0, 0.5]} scale={[1, 1.25, 1]}>{mat}</mesh>
        <mesh geometry={fin} position={[-0.32, 0, -0.015]} rotation={[0, 0, Math.PI - 0.6]} scale={[0.8, 0.8, 1]}>{mat}</mesh>
      </group>
      {[-1, 1].map((d) => (
        <mesh key={d} geometry={fin} position={[0.25, -0.12, d * 0.12]} rotation={[d * 1.2, 0, -0.5]} scale={0.8}>{mat}</mesh>
      ))}
    </group>
  );
};

const Anchor: React.FC<{ pos: V3; rot: V3; s?: number }> = ({ pos, rot, s = 1 }) => {
  const iron = <meshStandardMaterial color="#3A332D" metalness={0.75} roughness={0.6} />;
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 1.6, 16]} />
        {iron}
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <torusGeometry args={[0.13, 0.035, 10, 24]} />
        {iron}
      </mesh>
      <mesh position={[0, 1.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 10]} />
        {iron}
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.55, 0.07, 12, 32, Math.PI]} />
        {iron}
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} position={[d * 0.55, 0.62, 0]} rotation={[0, 0, d * -0.4]}>
          <coneGeometry args={[0.16, 0.42, 4]} />
          {iron}
        </mesh>
      ))}
    </group>
  );
};

const Rope: React.FC<{ a: V3; b: V3; r?: number; color?: string; sag?: number }> = ({ a, b, r = 0.025, color = "#2A2F33", sag = 0 }) => {
  const geo = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const M = A.clone().lerp(B, 0.5);
    M.y -= sag;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, M, B), 40, r, 6, false);
  }, [a, b, r, sag]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
    </mesh>
  );
};

/** Helical-armour stripe texture for the near-shore cable. */
const makeArmourTexture = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1A1F23";
  g.fillRect(0, 0, 512, 128);
  for (let i = -8; i < 30; i++) {
    const x = i * 22;
    const gr = g.createLinearGradient(x, 0, x + 14, 0);
    gr.addColorStop(0, "#2A3136");
    gr.addColorStop(0.45, "#E4EAEE");
    gr.addColorStop(1, "#2A3136");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x, 128);
    g.lineTo(x + 14, 128);
    g.lineTo(x + 14 + 64, 0);
    g.lineTo(x + 64, 0);
    g.closePath();
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// ---------------------------------------------------------------- shallow near-shore set (z 40..110, looking +z)
const sandH = (x: number, z: number) => -3 + 0.05 * Math.sin(x * 3.1 + z * 0.6) + 0.035 * Math.sin(z * 2.3 - x) + 0.12 * Math.sin(z * 0.21);
const PLOUGH_Z0 = 58;
const ploughZ = (t: number) => PLOUGH_Z0 + 2.6 * sstep(T.s8, T.s9, t) + 0.4 * ((t - T.s8) / (T.s9 - T.s8));
const ShallowSet: React.FC<{ t: number }> = ({ t }) => {
  const sand = useMemo(() => {
    const g = new THREE.PlaneGeometry(40, 80, 160, 320);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 75);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, sandH(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  const armour = useMemo(() => makeArmourTexture(), []);
  const rays = useMemo(() => makeGodRayTexture(), []);
  const ploughBody = useMemo(() => {
    // side profile (z, y): sloped nose, raised back, extruded across x with a rounded bevel
    const sh = new THREE.Shape();
    sh.moveTo(-0.85, 0);
    sh.lineTo(0.7, 0);
    sh.quadraticCurveTo(0.95, 0.05, 0.95, 0.22);
    sh.lineTo(0.55, 0.5);
    sh.lineTo(-0.55, 0.58);
    sh.quadraticCurveTo(-0.85, 0.58, -0.85, 0.35);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 12 });
    g.rotateY(-Math.PI / 2);
    g.translate(0.9, 0, 0);
    return g;
  }, []);
  const zp = ploughZ(t);
  const yFloor = sandH(0, zp);
  // cable comes down from the ship ahead into the plough's front, buried behind it
  const feed = useMemo(() => {
    const A = new THREE.Vector3(0, 1.0, zp + 7.5);
    const B = new THREE.Vector3(0, yFloor + 0.9, zp + 1.1);
    const M = new THREE.Vector3(0, yFloor + 1.2, zp + 3.6);
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const g = new THREE.TubeGeometry(curve, 160, 0.12, 24, false);
    return g;
  }, [zp, yFloor]);
  armour.repeat.set(5, 1);
  const trenchLen = Math.max(0.1, zp - 1.0 - 40);
  return (
    <group>
      <mesh geometry={sand}>
        <meshStandardMaterial color="#B9A27A" roughness={0.95} envMapIntensity={0.2} />
      </mesh>
      {/* buried route: a darker disturbed strip with a low ridge */}
      <mesh position={[0, yFloor + 0.02, 40 + trenchLen / 2]}>
        <boxGeometry args={[0.55, 0.06, trenchLen]} />
        <meshStandardMaterial color="#8C7756" roughness={1} />
      </mesh>
      <mesh geometry={feed}>
        <meshStandardMaterial map={armour} bumpMap={armour} bumpScale={3} metalness={0.8} roughness={0.34} envMapIntensity={1.3} />
      </mesh>
      {/* plough: sled on skids, share cutting into the sand, cable depressor */}
      <group position={[0, yFloor, zp]}>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.6]}>
            <boxGeometry args={[0.16, 0.12, 2.4]} />
            <meshStandardMaterial color="#3E464C" metalness={0.8} roughness={0.5} />
          </mesh>
        ))}
        <mesh geometry={ploughBody} position={[-0.45, 0.3, 0.3]}>
          <meshStandardMaterial color="#E8A33A" metalness={0.45} roughness={0.4} envMapIntensity={1.1} />
        </mesh>
        <mesh position={[0, 0.84, 0.3]}>
          <boxGeometry args={[1.06, 0.06, 1.76]} />
          <meshStandardMaterial color="#2E3438" metalness={0.8} roughness={0.4} />
        </mesh>
        {[-0.56, 0.56].map((x) => (
          <mesh key={x} position={[x, 0.42, 0.3]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 2.0]} />
            <meshStandardMaterial color="#5B6268" metalness={0.9} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 1.12, -0.2]}>
          <torusGeometry args={[0.16, 0.04, 10, 24]} />
          <meshStandardMaterial color="#C8CED2" metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.95, 0.9]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 16]} />
          <meshStandardMaterial color="#C98A2E" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.0, -0.75]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.14, 0.9, 0.7]} />
          <meshStandardMaterial color="#5B6268" metalness={0.8} roughness={0.5} />
        </mesh>
        {/* sand plume behind the share */}
        {Array.from({ length: 14 }, (_, i) => {
          const r = mulberry32(4700 + i)();
          const age = ((t * 0.9 + i / 14) % 1);
          return (
            <mesh key={i} ref={fx} position={[(r - 0.5) * 0.8 * (1 + age), 0.15 + age * 0.7, -0.9 - age * 1.6]} scale={0.18 + age * 0.55}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshBasicMaterial color="#D8C7A0" transparent opacity={0.22 * (1 - age)} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
      {/* tow wires up to the (unseen) ship */}
      <Rope a={[-0.45, yFloor + 0.8, zp + 1.0]} b={[-0.6, 1.0, zp + 9]} r={0.02} />
      <Rope a={[0.45, yFloor + 0.8, zp + 1.0]} b={[0.6, 1.0, zp + 9]} r={0.02} />
      {/* an anchor hanging above the buried route (appears on "jangkar") */}
      {t > W("l07", "supaya") - 0.4 && (
        <group>
          <Anchor pos={[1.6, -1.9 + 0.08 * Math.sin(t * 1.3), 56.5]} rot={[0, 0.6, 0.12]} s={0.7} />
          <Rope a={[1.6, -0.75, 56.5]} b={[1.8, 1, 56]} r={0.03} />
        </group>
      )}
      {/* sunlit shallow water */}
      <directionalLight position={[3, 12, 70]} intensity={2.2} color="#CDEBFF" />
      <hemisphereLight args={["#7FC8F0", "#3A2F20", 0.9]} />
      {Array.from({ length: 9 }, (_, i) => {
        const r = mulberry32(4800 + i);
        return (
          <mesh key={i} ref={fx} position={[(r() - 0.5) * 10, 1, 52 + r() * 16]} rotation={[0, r() * 3, 0.15]}>
            <planeGeometry args={[1 + r() * 2, 9]} />
            <meshBasicMaterial map={rays} color="#BFE6FF" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- fibre macro set
const FIB: V3 = [6, -4.5, -14];
const FibreMacro: React.FC<{ t: number; glow: THREE.Texture }> = ({ t, glow }) => {
  const hair = useMemo(() => {
    const pts = Array.from({ length: 30 }, (_, i) => new THREE.Vector3(-4 + i * 0.3, -0.26 + Math.sin(i * 0.7) * 0.02, Math.sin(i * 0.45) * 0.04));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.07, 12, false);
  }, []);
  const pulse = useMemo(() => glowSprite(glow, "#E6FFFF", 1.6), [glow]);
  // bits: a light "word" travelling along the core, some slots on, some off
  const bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1];
  const head = -4 + ((t - T.s6) * 2.6) % 9;
  return (
    <group position={FIB}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 9, 32, 1, true]} />
        <meshPhysicalMaterial color="#BFEFFF" metalness={0} roughness={0.05} transparent opacity={0.28} envMapIntensity={1.5} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 9, 16]} />
        <meshBasicMaterial color={LUMEN.clone().multiplyScalar(0.8)} />
      </mesh>
      {bits.map((b, i) => {
        const x = head - i * 0.32;
        if (!b || x < -4.4 || x > 4.4) return null;
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.025, 0.16, 4, 8]} />
              <meshBasicMaterial color={new THREE.Color("#E6FFFF").multiplyScalar(4)} />
            </mesh>
            <sprite ref={fx} scale={[0.2, 0.2, 1]} material={pulse} />
          </group>
        );
      })}
      <mesh geometry={hair}>
        <meshStandardMaterial color="#3B2A1E" roughness={0.45} metalness={0.05} />
      </mesh>
      <pointLight position={[0.5, 0.8, 1.2]} color="#DFF6FF" intensity={2.5} distance={5} decay={1.2} />
      <pointLight position={[-1.5, -0.6, 0.8]} color={ABYSS_PALETTE.lumenCyan} intensity={1.6} distance={5} decay={1.2} />
    </group>
  );
};

const heroUAt = (t: number, ur: number) => {
  const boostT = W("l08", "repeater");
  return t < boostT ? lerp(ur + 0.12, ur, sstep(T.s9, boostT, t) * 0.65 + ((t - T.s9) / (boostT - T.s9)) * 0.35) : ur - (t - boostT) * 0.03;
};

// ---------------------------------------------------------------- shot rigs
type Shot = { a: number; b: number; cam: (t: number) => Cam; env: (t: number, cam: Cam) => { bg: string; fog: string; density: number } };
const UNDER = { bg: ABYSS_PALETTE.midnightInk, fog: "#03121F", density: 0.042 };

// dive: sky -> through the surface -> along the seabed cable
const DIVE: Key[] = [
  { t: 0, pos: [1.7, 1.5, 7.5], target: [1.4, 8.5, -24] },
  { t: 2.6, pos: [1.5, 1.35, 5.5], target: [0.8, 3.5, -22] },
  { t: 3.5, pos: [1.2, 0.6, 3.0], target: [0.4, -3.5, -16] },
  { t: 4.4, pos: [1.1, -3.0, 0.2], target: [0.6, -8.0, -12] },
  { t: T.s3 + 0.05, pos: [1.9, -7.3, -4.2], target: [1.2, -8.9, -16] },
];
const SURFACE_T = (() => {
  for (let t = 0; t < T.s3; t += 0.005) if (camPath(DIVE, t, 55).pos[1] < 0) return t;
  return 3.6;
})();

const SHOTS: Shot[] = [
  {
    a: T.s1, b: T.s3, cam: (t) => camPath(DIVE, t, 55),
    env: (_t, c) => {
      const k = sstep(0.25, -0.25, c.pos[1]);
      return { bg: k > 0.5 ? UNDER.bg : "#050D1C", fog: k > 0.5 ? UNDER.fog : "#08182C", density: lerp(0.006, 0.042, k) };
    },
  },
  {
    a: T.s3, b: T.s4,
    cam: (t) => camPath([{ t: T.s3, pos: [10.4, -7.0, 5.0], target: [9.6, -9.2, -38] }, { t: T.s4, pos: [10.0, -6.2, -1.0], target: [9.8, -9.0, -44] }], t, 52),
    env: () => UNDER,
  },
  {
    a: T.s4, b: T.s5,
    cam: (t) => camPath([{ t: T.s4, pos: [8.6, 1.3, -12.5], target: [14.5, 4.2, -36] }, { t: T.s5, pos: [9.4, 2.0, -15.5], target: [14.8, 4.6, -37] }], t, 50),
    env: () => ({ bg: "#050D1C", fog: "#08182C", density: 0.008 }),
  },
  {
    a: T.s5, b: T.s6,
    cam: (t) => camPath([{ t: T.s5, pos: [5.0, -4.05, 1.9], target: [5.95, -4.5, -1.8] }, { t: T.s6, pos: [6.72, -4.42, -0.55], target: [6.56, -4.5, -1.62] }], t, 46),
    env: () => UNDER,
  },
  {
    a: T.s6, b: T.s7,
    cam: (t) => camPath([{ t: T.s6, pos: [FIB[0] - 2.0, FIB[1] + 0.25, FIB[2] + 1.9], target: [FIB[0] - 0.4, FIB[1] - 0.12, FIB[2]] }, { t: T.s7, pos: [FIB[0] + 0.2, FIB[1] + 0.1, FIB[2] + 1.35], target: [FIB[0] + 1.4, FIB[1] - 0.12, FIB[2]] }], t, 44),
    env: () => UNDER,
  },
  {
    a: T.s7, b: T.s8,
    cam: (t) => camPath([{ t: T.s7, pos: [8.75, -8.25, -13.6], target: [7.6, -8.95, -21] }, { t: T.s8, pos: [8.5, -8.45, -16.2], target: [7.7, -8.98, -23] }], t, 48),
    env: () => UNDER,
  },
  {
    a: T.s8, b: T.s9,
    cam: (t) =>
      camPath(
        [
          { t: T.s8, pos: [0.85, -1.15, 61.0], target: [0.0, -1.0, 63.5] },
          { t: W("l07", "dan") - 0.2, pos: [1.15, -1.35, 59.8], target: [0.0, -1.6, 63.0] },
          { t: T.s9, pos: [4.6, -0.6, 52.5], target: [0.0, -2.4, 60.5] },
        ],
        t,
        50,
      ),
    env: () => ({ bg: "#0E5675", fog: "#0F5574", density: 0.055 }),
  },
  {
    a: T.s9, b: T.s10, cam: () => ({ pos: [0, 0, 0], target: [0, 0, -1], fov: 50 }), // replaced at runtime (follows the pulse)
    env: () => UNDER,
  },
  {
    a: T.s10, b: T.s11, cam: () => ({ pos: [0, 0, 0], target: [0, 0, -1], fov: 55 }), // replaced at runtime (pull back to the cover frame)
    env: () => UNDER,
  },
  {
    a: T.s11, b: T.s12,
    cam: (t) => camPath([{ t: T.s11, pos: [4.1, -7.6, -12.6], target: [2.6, -8.5, -21] }, { t: T.s12, pos: [3.8, -7.75, -13.4], target: [2.5, -8.55, -21.5] }], t, 50),
    env: () => UNDER,
  },
  {
    a: T.s12, b: T.s13,
    cam: (t) => camPath([{ t: T.s12, pos: [6.6, -6.3, -8.6], target: [2.6, -8.7, -17.8] }, { t: T.s13, pos: [6.2, -6.6, -9.6], target: [2.8, -8.7, -17.8] }], t, 52),
    env: () => UNDER,
  },
  {
    a: T.s13, b: T.s14,
    cam: (t) => camPath([{ t: T.s13, pos: [7.4, -6.8, -5.6], target: [3.2, -2.6, -15.0] }, { t: T.s14, pos: [7.0, -5.4, -6.8], target: [3.2, -1.2, -14.5] }], t, 58),
    env: () => ({ ...UNDER, density: 0.03 }),
  },
  {
    a: T.s14, b: T.s15,
    cam: (t) => camPath([{ t: T.s14, pos: [-3.5, 15, 8], target: [1.8, -6, -34] }, { t: T.s15, pos: [-2.5, 24, 9], target: [2.2, -6, -42] }], t, 58),
    env: () => ({ bg: "#040B18", fog: "#06142A", density: 0.006 }),
  },
  {
    a: T.s15, b: T.end,
    cam: (t) => camPath([{ t: T.s15, pos: [-0.9, 2.2, -12.4], target: [-3.17, 1.6, -17.34] }, { t: T.s15 + 2.4, pos: [-1.75, 1.9, -15.0], target: [-3.17, 1.65, -17.34] }], t, 46),
    env: () => ({ bg: "#050D1C", fog: "#08182C", density: 0.01 }),
  },
];
const shotIndex = (t: number) => {
  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].a) i = k;
  return i;
};

// ---------------------------------------------------------------- the 3D world per shot
const Scene: React.FC<{ t: number; i: number; curve: THREE.CatmullRomCurve3; ur: number; glow: THREE.Texture; mats: Record<string, THREE.SpriteMaterial> }> = ({ t, i, curve, ur, glow, mats }) => {
  const worldA = i !== 6; // every shot except the shallow near-shore set
  const plain = useMemo(() => {
    // shot 2: six cables fanning out over the plain
    return Array.from({ length: 6 }, (_, k) => {
      const x0 = 4.5 + k * 2.1;
      const pts = Array.from({ length: 12 }, (_, j) => {
        const z = 6 - j * 9;
        const x = x0 + (k - 2.5) * j * 0.18 + Math.sin(j * 0.9 + k) * 0.35;
        return new THREE.Vector3(x, groundH(x, z, true) + 0.06, z);
      });
      return new THREE.CatmullRomCurve3(pts);
    });
  }, []);
  const deep = useMemo(() => {
    const pts = Array.from({ length: 10 }, (_, j) => {
      const z = -10 - j * 6;
      const x = 7.6 + Math.sin(j * 0.8) * 0.25;
      return new THREE.Vector3(x, groundH(x, z, true) + 0.025, z);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, []);
  const hose = useMemo(() => {
    const pts = Array.from({ length: 160 }, (_, j) => {
      const a = (j / 160) * Math.PI * 2 * 2.6;
      const r = 0.34 + (j / 160) * 0.4;
      return new THREE.Vector3(Math.cos(a) * r, 0.06, Math.sin(a) * r);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 500, 0.06, 14, false);
  }, []);

  // shot 11/12: a straight local cable that the anchor hooks and breaks
  const snapT = W("l10", "pukat", true) - 0.15;
  const hookT = W("l10", "kapal");
  const anchorX = lerp(-1.4, 2.2, sstep(T.s12, hookT, t)) + (t > hookT ? Math.min(1.6, (t - hookT) * 0.75) : 0);
  const pull = Math.max(0, anchorX - 2.2);
  const broken = t >= snapT;
  const localCable = useMemo(() => {
    const zc = -16;
    const mk = (z0: number, z1: number, side: number) => {
      const pts = Array.from({ length: 50 }, (_, j) => {
        const z = lerp(z0, z1, j / 49);
        const d = Math.exp(-(((z - zc) / 2.2) ** 2));
        const end = broken ? Math.exp(-(((z - zc) / 0.8) ** 2)) * 0.6 * side : 0;
        const x = 2.2 + (broken ? pull * 0.45 * d : pull * d);
        return new THREE.Vector3(x, groundH(x, z, true) + 0.07 + (broken ? 0 : pull * 0.12 * d), z + end);
      });
      return new THREE.CatmullRomCurve3(pts);
    };
    return broken ? [mk(-6, zc - 0.25, 1), mk(zc + 0.25, -34, -1)] : [mk(-6, -34, 0)];
  }, [pull, broken]);

  // shot 12: repair (lift + splice)
  const spliceT = W("l11", "menyambungnya");
  const liftK = sstep(T.s13, W("l11", "mengangkat", true) + 0.2, t);
  const bow: V3 = [3.4, 0.25, -12.5];
  const liftCurve = useMemo(() => {
    const A = new THREE.Vector3(2.2, groundH(2.2, -16, true) + 0.07, -16);
    const end = new THREE.Vector3(...bow);
    const top = A.clone().lerp(end, liftK);
    const M = A.clone().lerp(top, 0.5);
    M.x += 1.2 * liftK;
    M.y -= 1.5 * liftK;
    return new THREE.QuadraticBezierCurve3(A, M, top);
  }, [liftK]);
  const hull = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-5, -0.9);
    s.lineTo(3, -0.9);
    s.quadraticCurveTo(4.6, -0.6, 5.2, 0);
    s.quadraticCurveTo(4.6, 0.6, 3, 0.9);
    s.lineTo(-5, 0.9);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  // shot 8: one hero pulse dims over "puluhan kilometer", the repeater re-boosts it
  const boostT = W("l08", "repeater");
  const heroU = heroUAt(t, ur);
  const heroE = t < boostT ? lerp(1, 0.12, sstep(T.s9 + 0.3, boostT - 0.2, t)) : Math.min(1.3, 0.2 + (t - boostT) * 4);
  const flash = Math.exp(-((t - boostT) ** 2) / 0.05);
  const heroP = curve.getPointAt(Math.min(1, Math.max(0, heroU)));

  // shot 9: power from the station (amber), copper inset
  const powerOn = i === 8;
  const copper = powerOn ? sstep(W("l09", "tembaga") - 0.3, W("l09", "tembaga") + 0.3, t) * (1.4 + 0.4 * Math.sin(t * 9)) : 0;

  return (
    <group>
      {worldA && <Terrain far />}
      {worldA && <Backdrop />}
      {worldA && <Surface t={t} />}
      {worldA && <Station />}
      {(i === 12 || i === 0) && <Station x={2.2} z={-89.5} ry={Math.PI - 0.3} far />}
      {(i === 0 || i === 2 || i === 12 || i === 13) && <Stars />}
      <hemisphereLight args={["#2B6E95", "#020509", i === 6 ? 0 : 0.35]} />
      <directionalLight position={[-3, 12, 4]} intensity={0.9} color={ABYSS_PALETTE.godRay} />

      {/* main route cable (station -> sea -> far coast) */}
      {worldA && i !== 10 && i !== 11 && (
        <group>
          <CableMesh curve={curve} />
          {i !== 7 && <Pulses curve={curve} t={t} n={34} mat={mats.cyan} speed={0.03} />}
          <CableLights curve={curve} us={[0.05, 0.14, 0.22, 0.3, 0.42, 0.5, 0.6]} />
          <Repeater curve={curve} ring={powerOn ? new THREE.Color("#FFB45A") : undefined} boost={1 + flash * 1.5} />
        </group>
      )}
      {i === 7 && (
        <group>
          <sprite ref={fx} position={[heroP.x, heroP.y + 0.08, heroP.z]} scale={[1.2 * heroE + 0.1, 1.2 * heroE + 0.1, 1]} material={mats.white} />
          <pointLight position={[heroP.x, heroP.y + 0.5, heroP.z]} color={ABYSS_PALETTE.lumenCyan} intensity={8 * heroE + 20 * flash} distance={6} decay={1.4} />
        </group>
      )}
      {powerOn && <Pulses curve={curve} t={t} n={14} mat={mats.amber} speed={0.12} size={0.5} from={0} to={ur} />}
      {powerOn && <CableSection t={t} glow={glow} copper={copper} pos={INSET_POS} />}

      {/* shot 1: satellite above, a path that is NOT used */}
      {i === 0 && <Satellite pos={[3.2, 13, -28]} t={t} s={1.7} />}
      {i === 0 && <DashedBeam a={[-4.2, 1.9, -17.6]} b={[3.2, 13, -28]} color="#FFC46B" opacity={0.8 * (1 - sstep(W("l01", "tidak"), W("l01", "angkasa"), t))} t={t} />}

      {/* shot 2: many cables */}
      {i === 1 && plain.map((c, k) => (
        <group key={k}>
          <CableMesh curve={c} seg={300} r={0.05} />
          <Pulses curve={c} t={t + k * 0.37} n={14} mat={mats.cyan} speed={0.05} size={0.55} />
        </group>
      ))}
      {i === 1 && <CableLights curve={plain[2]} us={[0.05, 0.12, 0.2]} i={7} />}

      {/* shot 3: island served by satellite as a backup */}
      {i === 2 && <Island pos={[15, 0, -36]} />}
      {i === 2 && <Satellite pos={[17.5, 10.5, -40]} t={t} s={0.8} />}
      {i === 2 && <DashedBeam a={[15.2, 1.1, -36]} b={[17.5, 10.5, -40]} color="#FFC46B" opacity={0.9} t={t} />}
      {i === 2 && plain.map((c, k) => <CableMesh key={k} curve={c} seg={300} r={0.05} />)}

      {/* shot 4: cut-away of the cable */}
      {i === 3 && <CableSection t={t} glow={glow} pos={[6, -4.5, -2]} rot={[0.08, -0.6, 0.04]} scale={0.35} />}
      {i === 3 && <pointLight position={[6.6, -3.6, 0.5]} color="#EAF6FF" intensity={4} distance={6} decay={1.2} />}

      {/* shot 5: single fibre vs a hair */}
      {i === 4 && <FibreMacro t={t} glow={glow} />}

      {/* shot 6: thin deep-sea cable + garden-hose ghost */}
      {i === 5 && (
        <group>
          <CableMesh curve={deep} r={0.06} core={1.2} seg={300} />
          <group position={[8.35, groundH(8.35, -18.5, true), -18.5]}>
            <group scale={0.4 + 0.6 * sstep(W("l06", "seukuran") - 0.3, W("l06", "selang"), t)} visible={t > W("l06", "seukuran") - 0.3}>
              <mesh geometry={hose}>
                <meshStandardMaterial color="#2FA84F" roughness={0.42} metalness={0} emissive="#0E3A1A" emissiveIntensity={0.6} envMapIntensity={0.9} />
              </mesh>
              <mesh position={[-0.6, 0.06, -0.47]} rotation={[Math.PI / 2, 0, -0.95]}>
                <cylinderGeometry args={[0.07, 0.05, 0.22, 16]} />
                <meshStandardMaterial color="#C9A24A" metalness={1} roughness={0.3} />
              </mesh>
            </group>
          </group>
          <pointLight position={[8.4, -7.6, -16]} color="#DFF6FF" intensity={7} distance={7} decay={1.4} />
          <pointLight position={[7.0, -8.3, -20]} color={ABYSS_PALETTE.lumenViolet} intensity={3} distance={5} decay={1.4} />
        </group>
      )}

      {/* shot 7: near-shore armoured cable being buried */}
      {i === 6 && <ShallowSet t={t} />}

      {/* shot 10: not the shark */}
      {i === 9 && <Shark pos={[lerp(3.9, 0.4, (t - T.s11) / (T.s12 - T.s11)), -8.0, -19.5]} yaw={Math.PI + 0.15} t={t} />}

      {/* shot 11: anchor drags, hooks and breaks the cable; trawl behind */}
      {i === 10 && (
        <group>
          {localCable.map((c, k) => (
            <CableMesh key={k} curve={c} seg={120} r={0.045} core={broken ? 0.5 : 2.2} />
          ))}
          <Anchor pos={[anchorX, groundH(anchorX, -16, true) + 0.2, -16]} rot={[-1.2, 0, -0.25]} s={1.5} />
          <pointLight position={[anchorX + 1.2, -7.2, -14.6]} color="#EAF6FF" intensity={6} distance={6} decay={1.3} />
          <Rope a={[anchorX - 0.1, groundH(anchorX, -16, true) + 0.4, -14.6]} b={[anchorX - 6, 2, -10]} r={0.035} sag={-0.5} />
          {/* furrow left in the silt */}
          <mesh position={[(anchorX - 1.4) / 2 - 0.7, groundH(1, -16, true) + 0.02, -16]}>
            <boxGeometry args={[Math.max(0.1, anchorX + 1.4), 0.05, 0.5]} />
            <meshStandardMaterial color="#0D1216" roughness={1} />
          </mesh>
          {broken && <sprite ref={fx} position={[2.2 + pull * 0.45, -8.6, -16]} scale={[2.4 * Math.exp(-(t - snapT) * 3), 2.4 * Math.exp(-(t - snapT) * 3), 1]} material={mats.white} />}
          <group position={[lerp(1.0, 4.5, (t - T.s12) / (T.s13 - T.s12)), -8.3, -24]}>
            <mesh rotation={[0, 0.3, 0.25]}>
              <boxGeometry args={[1.3, 0.8, 0.07]} />
              <meshStandardMaterial color="#8A4B2A" metalness={0.5} roughness={0.6} />
            </mesh>
            <mesh position={[-2.6, 0.2, -0.6]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.9, 4, 16, 6, true]} />
              <meshBasicMaterial color="#9AB0BC" wireframe transparent opacity={0.35} />
            </mesh>
          </group>
          <pointLight position={[2.6, -7.8, -15]} color={ABYSS_PALETTE.lumenCyan} intensity={broken ? 2 : 7} distance={6} decay={1.4} />
          <pointLight position={[4.2, -7.2, -21]} color="#DFF6FF" intensity={3} distance={8} decay={1.4} />
        </group>
      )}

      {/* shot 12: cable ship lifts the end and splices it */}
      {i === 11 && (
        <group>
          <mesh geometry={hull} position={[3, -0.75, -13.3]} rotation={[0, 0.25, 0]}>
            <meshStandardMaterial color="#3A4752" metalness={0.5} roughness={0.5} envMapIntensity={1.2} />
          </mesh>
          <group position={[3, -0.75, -13.3]} rotation={[0, 0.25, 0]}>
            <mesh position={[-0.6, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.55]}>
              <cylinderGeometry args={[0.92, 0.92, 8.6, 40, 1, false, Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#7A2A24" metalness={0.4} roughness={0.55} envMapIntensity={1.1} />
            </mesh>
            <mesh position={[4.9, -0.1, 0]} scale={[1.3, 0.8, 0.8]}>
              <sphereGeometry args={[0.45, 24, 16]} />
              <meshStandardMaterial color="#7A2A24" metalness={0.4} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[10.4, 0.12, 1.95]} />
              <meshStandardMaterial color="#C9D2D8" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[-5.1, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 1.0, 12]} />
              <meshStandardMaterial color="#B98A5E" metalness={1} roughness={0.3} />
            </mesh>
          </group>
          <mesh position={bow} rotation={[0, 0.25, 0]}>
            <torusGeometry args={[0.45, 0.08, 10, 32]} />
            <meshStandardMaterial color="#C8CED2" metalness={1} roughness={0.3} />
          </mesh>
          <CableMesh curve={liftCurve} seg={120} core={t > spliceT ? 2.6 : 0.4} />
          <CableMesh curve={localCable[localCable.length - 1]} seg={120} />
          {t > spliceT && <Pulses curve={liftCurve} t={t} n={6} mat={mats.cyan} speed={0.6} size={0.5} dir={-1} />}
          {t > spliceT - 0.2 && (
            <group position={liftCurve.getPointAt(0.97)}>
              <mesh rotation={[0, 0, 0.6]}>
                <cylinderGeometry args={[0.16, 0.16, 0.7, 24]} />
                <meshStandardMaterial color="#D9DEE2" metalness={1} roughness={0.25} />
              </mesh>
              <sprite ref={fx} scale={[2.2 * Math.exp(-Math.max(0, t - spliceT) * 2.5), 2.2 * Math.exp(-Math.max(0, t - spliceT) * 2.5), 1]} material={mats.white} />
            </group>
          )}
          <mesh ref={fx} position={[3.6, -3.2, -12.5]}>
            <coneGeometry args={[1.6, 6.5, 24, 1, true]} />
            <meshBasicMaterial color="#BFE6FF" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[3.4, -1.5, -12.5]} color="#EAF6FF" intensity={10} distance={10} decay={1.3} />
        </group>
      )}

      {/* particles near wherever the camera is */}
      {i === 1 && <group position={[9, 0, -4]}><Particles t={t} /></group>}
      {(i === 3 || i === 4) && <group position={[6, 2, -6]}><Particles t={t} /></group>}
      {(i === 5 || i === 9 || i === 10 || i === 11) && <group position={[6, 0, -10]}><Particles t={t} /></group>}
      {(i === 0 || i === 7 || i === 8) && <Particles t={t} />}
    </group>
  );
};

// ---------------------------------------------------------------- 2D layer
const project = (p: V3, cam: Cam, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.1, 300);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920, behind: v.z > 1 };
};

const Tag: React.FC<{ x: number; y: number; text: string; o: number; dx?: number; dy?: number; color?: string; big?: boolean }> = ({ x, y, text, o, dx = 60, dy = -70, color = ABYSS_PALETTE.hudCyan, big }) => {
  if (o <= 0.01) return null;
  const lx = Math.min(1010, Math.max(70, x + dx));
  const ly = Math.min(1500, Math.max(200, y + dy));
  const right = lx < x;
  return (
    <g opacity={o}>
      <line x1={x} y1={y} x2={lx} y2={ly} stroke="#E6FBFF" strokeOpacity={0.7} strokeWidth={2} />
      <circle cx={x} cy={y} r={6} fill={color} />
      <text
        x={lx + (right ? -8 : 8)}
        y={ly - 10}
        textAnchor={right ? "end" : "start"}
        fill={big ? color : "#EFFFFF"}
        fontFamily={mono}
        fontWeight={700}
        fontSize={big ? 40 : 30}
        letterSpacing={3}
        style={{ paintOrder: "stroke", stroke: "rgba(1,8,16,0.9)", strokeWidth: 8 }}
      >
        {text}
      </text>
    </g>
  );
};

const Chip: React.FC<{ text: string; sub?: string; o: number; y?: number; color?: string }> = ({ text, sub, o, y = 214, color = ABYSS_PALETTE.hudCyan }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 60, top: y, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
      <div style={{ display: "inline-block", fontFamily: mono, fontWeight: 700, fontSize: 40, letterSpacing: 4, color, background: ABYSS_PALETTE.hudInk, borderLeft: `6px solid ${color}`, padding: "10px 18px" }}>{text}</div>
      {sub && <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: 2, color: "rgba(230,251,255,0.75)", marginTop: 8, marginLeft: 4 }}>{sub}</div>}
    </div>
  );

const Gauge: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.s3 + 0.1, T.s4, 0.3);
  if (o <= 0.01) return null;
  const k = sstep(W("l03", "sembilan"), W("l03", "persen", true), t);
  const R = 120, L = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      <svg width={300} height={300} viewBox="-150 -150 300 300">
        <circle r={R} fill="rgba(2,10,20,0.55)" stroke="rgba(111,243,255,0.2)" strokeWidth={22} />
        <circle r={R} fill="none" stroke={ABYSS_PALETTE.hudCyan} strokeWidth={22} strokeDasharray={`${L * 0.95 * k} ${L}`} transform="rotate(-90)" strokeLinecap="butt" style={{ filter: "drop-shadow(0 0 10px rgba(56,246,255,0.7))" }} />
        <circle r={R} fill="none" stroke={ABYSS_PALETTE.hudAmber} strokeWidth={22} strokeDasharray={`${L * 0.05 * sstep(T.s4 - 0.6, T.s4, t)} ${L}`} transform={`rotate(${-90 + 342})`} />
        <text y={18} textAnchor="middle" fill="#FFFFFF" fontFamily="'Segoe UI', sans-serif" fontWeight={900} fontSize={70}>
          {`>${Math.round(95 * k)}%`}
        </text>
      </svg>
      <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: ABYSS_PALETTE.hudCyan, marginTop: 12, opacity: sstep(W("l03", "komunikasi"), W("l03", "komunikasi") + 0.3, t) }}>KOMUNIKASI INTERNASIONAL</div>
      <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: 3, color: "rgba(230,251,255,0.8)", marginTop: 6, opacity: sstep(W("l03", "kabel"), W("l03", "kabel") + 0.3, t) }}>lewat kabel bawah laut</div>
    </div>
  );
};

// karaoke captions: 3–5 word phrases, active word lights up in cyan with a small bounce
type Phrase = { words: Word[]; s: number; e: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    c.words.forEach((w, k) => {
      cur.push(w);
      const punct = /[,.?!]$/.test(w.w);
      const left = c.words.length - k - 1;
      if ((cur.length >= 4 && (punct || left >= 3 || left === 0)) || cur.length >= 5 || (punct && cur.length >= 2) || left === 0) {
        if (!(left > 0 && left < 2 && cur.length < 5 && !punct)) {
          out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
          cur = [];
        }
      }
    });
    if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  let p: Phrase | undefined;
  for (let k = 0; k < PHRASES.length; k++) {
    const next = PHRASES[k + 1];
    if (t >= PHRASES[k].s - 0.08 && t < (next ? Math.min(next.s - 0.08, PHRASES[k].e + 0.6) : PHRASES[k].e + 0.6)) p = PHRASES[k];
  }
  if (!p) return null;
  const pin = sstep(p.s - 0.08, p.s + 0.12, t);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 410, display: "flex", justifyContent: "center", opacity: pin }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 24px", maxWidth: 940, padding: "14px 26px", background: "rgba(2,10,20,0.62)", borderRadius: 14, border: "1.5px solid rgba(111,243,255,0.28)" }}>
        {p.words.map((w, k) => {
          const on = t >= w.s - 0.03 && t < w.e + 0.05;
          const done = t >= w.e + 0.05;
          const b = on ? 1 + 0.12 * Math.sin(Math.min(1, (t - w.s) / 0.16) * Math.PI) : 1;
          return (
            <span
              key={k}
              style={{
                display: "inline-block",
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 800,
                fontSize: 54,
                lineHeight: 1.15,
                color: on ? "#7FF8FF" : done ? "#FFFFFF" : "rgba(230,251,255,0.62)",
                textShadow: on ? "0 0 22px rgba(56,246,255,0.85)" : "0 3px 10px rgba(0,0,0,0.8)",
                transform: `scale(${b}) translateY(${on ? -3 : 0}px)`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number; i: number; cam: Cam; w: number; h: number; ur: number; curve: THREE.CatmullRomCurve3 }> = ({ t, i, cam, w, h, ur, curve }) => {
  const P = (p: V3) => project(p, cam, w, h);
  const s = w / 1080;
  const tags: React.ReactNode[] = [];
  const add = (key: string, p: V3, text: string, o: number, dx?: number, dy?: number, color?: string, big?: boolean) => {
    const q = P(p);
    if (!q.behind) tags.push(<Tag key={key} x={q.x} y={q.y} text={text} o={o} dx={dx} dy={dy} color={color} big={big} />);
  };
  const ShotO = (a: number, b: number) => win(t, a, b, 0.3);
  if (i === 0) add("sat", [3.2, 13, -28], "LEWAT ANGKASA? ✕", sstep(W("l01", "tidak"), W("l01", "tidak") + 0.25, t) * (1 - sstep(SURFACE_T - 0.6, SURFACE_T - 0.2, t)), -60, 150, "#FF5A4E", true);
  if (i === 2) {
    add("isl", [15.4, 1.0, -35.6], "DAERAH TERPENCIL", ShotO(W("l04", "daerah") - 0.2, T.s5), -40, 160);
    add("bk", [17.5, 10.5, -40], "SATELIT = CADANGAN", ShotO(W("l04", "cadangan") - 0.2, T.s5), -80, -60, ABYSS_PALETTE.hudAmber);
  }
  if (i === 3) add("fo", [6 + 0.35 * 1.95 * 0.825, -4.5, -2 + 0.35 * 1.95 * 0.565], "SERAT OPTIK", ShotO(W("l05", "serat") - 0.1, T.s6), -40, -170);
  if (i === 4) {
    add("fb", [FIB[0] + 0.6, FIB[1] + 0.07, FIB[2]], "SERAT KACA", ShotO(T.s6 + 0.1, T.s7), 30, -150);
    add("hr", [FIB[0] + 0.9, FIB[1] - 0.3, FIB[2]], "RAMBUT", ShotO(T.s6 + 0.3, T.s7), 40, 140);
  }
  if (i === 5) add("hs", [8.35 + 0.5, groundH(8.35, -18.5, true) + 0.15, -18.5], "± 2 cm · SELANG TAMAN", ShotO(W("l06", "seukuran"), T.s8), -260, -170, "#6CFF9A");
  if (i === 6) {
    const zp = ploughZ(t);
    add("ar", [0, sandH(0, zp) + 1.25, zp + 2.6], "BERARMOR BAJA", ShotO(W("l07", "dibungkus") - 0.2, W("l07", "dan") + 0.2), -260, -140);
    add("pl", [0, sandH(0, zp) + 0.8, zp], "DIKUBUR (PLOUGH)", ShotO(W("l07", "dikubur") - 0.1, T.s9), -40, -190, ABYSS_PALETTE.hudAmber);
    add("an", [1.6, -1.2, 56.5], "AMAN DARI JANGKAR", ShotO(W("l07", "aman") - 0.1, T.s9), -60, -170);
  }
  if (i === 7) {
    const boostT = W("l08", "repeater");
    const rp = curve.getPointAt(ur);
    add("rp", [rp.x, rp.y + 0.6, rp.z], "REPEATER: DIKUATKAN", ShotO(boostT - 0.15, T.s10), 70, -160);
    tags.push(<Chip key="km" text="CAHAYA MELEMAH" sub="setelah puluhan kilometer" o={ShotO(W("l08", "cahaya") - 0.1, boostT)} />);
  }
  if (i === 8) {
    add("st", [-4.2, 2.2, -17.6], "LISTRIK DARI DARAT", ShotO(W("l09", "stasiun") - 0.2, T.s11), 130, 60, ABYSS_PALETTE.hudAmber);
    add("cu", [INSET_POS[0] + 0.05, INSET_POS[1] - 0.02, INSET_POS[2] + 0.05], "TEMBAGA", ShotO(W("l09", "tembaga") - 0.1, T.s11), 40, 170, ABYSS_PALETTE.hudAmber);
  }
  if (i === 9) tags.push(<Chip key="hiu" text="✕ BUKAN HIU" sub="mitos" o={ShotO(W("l10", "bukan") - 0.1, T.s12)} color="#FF5A4E" />);
  if (i === 10) {
    add("jk", [2.2, -8.5, -16], "JANGKAR KAPAL", ShotO(W("l10", "jangkar") - 0.1, T.s13), 60, 200, "#FF5A4E");
    add("pk", [lerp(1.0, 4.5, (t - T.s12) / (T.s13 - T.s12)) - 1.5, -8.1, -24.6], "JARING PUKAT", ShotO(W("l10", "jaring") - 0.1, T.s13), 30, -150, "#FF5A4E");
  }
  if (i === 11) {
    add("kp", [3.6, -0.4, -13.3], "KAPAL KABEL", ShotO(W("l11", "kapal") - 0.1, T.s14), 80, 120);
    add("sb", [3.25, -0.2, -12.8], "DISAMBUNG", ShotO(W("l11", "menyambungnya") - 0.1, T.s14), 60, 260, "#6CFF9A");
  }
  if (i === 12) {
    add("na", [-4.2, 1.5, -17.6], "NEGARA A", ShotO(T.s14 + 0.6, T.s15), -40, -110);
    add("nb", [2.2, 1.5, -89.5], "NEGARA B", ShotO(T.s14 + 1.2, T.s15), 40, -90);
  }
  // cut flashes (light leak) + the surface break in the dive
  const flashes = SHOT_STARTS.slice(1).map((c) => Math.exp(-((t - c) ** 2) / 0.006));
  const fl = Math.max(0, ...flashes) * 0.55;
  const splash = Math.exp(-((t - SURFACE_T) ** 2) / 0.02);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `scale(${s})`, width: 1080, height: 1920 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {tags.filter((x) => React.isValidElement(x) && x.type === Tag)}
        </svg>
        {tags.filter((x) => React.isValidElement(x) && x.type === Chip)}
        <Gauge t={t} />
        <div style={{ position: "absolute", top: 196, right: 60, fontFamily: mono, fontSize: 22, letterSpacing: 5, color: ABYSS_PALETTE.hudCyan, opacity: t < OUTRO_AT ? 0.85 : 0 }}>
          AUDIRA EXPLAINED · 046
        </div>
        <Captions t={t} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% 45%, rgba(160,250,255,${fl}) 0%, rgba(56,246,255,${fl * 0.5}) 40%, rgba(0,0,0,0) 80%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(190,240,255,${splash * 0.7})` }} />
    </div>
  );
};

// ---------------------------------------------------------------- film root
export const Ep046Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const i = shotIndex(t);
  const curve = useMemo(() => makeRoute(), []);
  const ur = useMemo(() => repeaterU(curve), [curve]);
  const glow = useMemo(() => makeGlowTexture(), []);
  const mats = useMemo(
    () => ({ cyan: glowSprite(glow, "#BFFBFF", 3.2), white: glowSprite(glow, "#E6FFFF", 4), amber: glowSprite(glow, "#FFB45A", 3.4) }),
    [glow],
  );
  void makeTextTexture;

  let cam = SHOTS[i].cam(t);
  if (i === 7) {
    // follow the hero pulse toward the repeater, then settle on the repeater (AUDIRA label)
    const boostT = W("l08", "repeater");
    const rp = curve.getPointAt(ur);
    const hp = curve.getPointAt(Math.min(1, Math.max(0, Math.max(heroUAt(t, ur), ur - 0.004))));
    const k = sstep(boostT - 0.3, boostT + 0.6, t);
    const tgt = new THREE.Vector3().lerpVectors(hp, rp, k);
    cam = { pos: [tgt.x + 2.2 - k * 0.6, tgt.y + 1.1 - k * 0.2, tgt.z + 2.6 - k * 0.6], target: [tgt.x, tgt.y + 0.2, tgt.z], fov: 50 };
  }
  if (i === 8) {
    const rp = curve.getPointAt(ur);
    const k = sstep(T.s10, W("l09", "darat") + 0.2, t);
    const start: Cam = { pos: [rp.x + 1.6, rp.y + 0.9, rp.z + 2.0], target: [rp.x, rp.y + 0.2, rp.z], fov: 50 };
    const end: Cam = { pos: [0.6, -2.2, 9], target: [-0.4, -7.6, -12], fov: 55 };
    cam = { pos: lerp3(start.pos, end.pos, k), target: lerp3(start.target, end.target, k), fov: lerp(start.fov, end.fov, k) };
  }
  const env = SHOTS[i].env(t, cam);
  const shot = useMemo(
    () => ({ pos: cam.pos, target: cam.target, fov: cam.fov, focus: 10, aperture: 0, maxBlur: 0, exposure: 1.15 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cam.pos[0], cam.pos[1], cam.pos[2], cam.target[0], cam.target[1], cam.target[2], cam.fov],
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: ABYSS_PALETTE.midnightInk }}>
      <ThreeCanvas width={width} height={height} dpr={1} camera={{ position: cam.pos, fov: cam.fov, near: 0.05, far: 300 }}>
        <CameraRig shot={shot} near={0.05} far={300} />
        <Env bg={env.bg} fog={env.fog} density={env.density} />
        <Scene t={t} i={i} curve={curve} ur={ur} glow={glow} mats={mats} />
        <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1.15} envIntensity={0.35} ao aoRadius={0.4} />
      </ThreeCanvas>
      <Overlay t={t} i={i} cam={cam} w={width} h={height} ur={ur} curve={curve} />
      <Outro start={OUTRO_AT} />
    </div>
  );
};
