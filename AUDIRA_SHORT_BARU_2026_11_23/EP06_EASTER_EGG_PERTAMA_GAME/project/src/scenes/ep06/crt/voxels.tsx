// EP06 voxel pieces: generic faceless people (real people = generic figure + name card), props,
// the in-game corridor (catacomb → gold castle → breakable wall) and the secret room.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ARCADE_PALETTE as P } from "../../../kits/arcadecrt/lib/palette";
import { SPRITE, SPRITE_COLORS } from "../../../kits/arcadecrt/core/game";
import { rng, type V3 } from "../../../kits/arcadecrt/core/motion";
import { canvasTex, makeGlowTexture } from "../../../kits/arcadecrt/lib/materials";
import { RAINBOW, rainbow } from "./rasters";

type Vox = { p: V3; c: string; e?: number };

const Instanced: React.FC<{ vox: Vox[]; size: number; roughness?: number; emissive?: number; anim?: (i: number, v: Vox, m: THREE.Matrix4) => void }> = ({ vox, size, roughness = 0.5, emissive = 0.08, anim }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    vox.forEach((v, i) => {
      m.makeTranslation(v.p[0], v.p[1], v.p[2]);
      if (anim) anim(i, v, m);
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, c.set(v.c));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, vox.length]} castShadow receiveShadow>
      <boxGeometry args={[size * 0.96, size * 0.96, size * 0.96]} />
      <meshStandardMaterial roughness={roughness} metalness={0.05} emissive="#FFFFFF" emissiveIntensity={emissive} vertexColors={false} />
    </instancedMesh>
  );
};

// ------------------------------------------------------------------ people (faceless, 10 × 18 px)
const PEOPLE: Record<string, { rows: string[]; pal: Record<string, string> }> = {
  // Warren Robinett as a generic late-70s programmer: shaggy hair, teal shirt, jeans
  dev: {
    rows: ["..hhhhhh..", ".hhhhhhhh.", ".hhssssh h", ".hhsssshh.", "..hssssh..", "....ss....", "..rrwwrr..", ".rrrrrrrr.", ".rrrrrrrr.", "srrrrrrrrs", "s.rrrrrr.s", "s.rrrrrr.s", "..pppppp..", "..pppppp..", "..pp..pp..", "..pp..pp..", "..pp..pp..", ".kkk..kkk."],
    pal: { h: "#5A3A22", s: "#D9A27A", r: "#2E9C8C", w: "#F4F1FF", p: "#2B4C8C", k: "#1A1A24" },
  },
  // the 15-year-old finder: red cap, yellow tee
  teen: {
    rows: ["..cccccc..", ".ccccccccc", "..hssssh..", "..sssssss.", "..sssss...", "....ss....", "..yyyyyy..", ".yyyyyyyy.", ".yyyyyyyy.", "syyyyyyyys", "s.yyyyyy.s", "..yyyyyy..", "..pppppp..", "..pp..pp..", "..pp..pp..", "..pp..pp..", "..ww..ww..", ".www..www."],
    pal: { c: "#E0303A", h: "#3A2416", s: "#C98E66", y: "#FFD23F", p: "#2B3A6C", w: "#F4F1FF" },
  },
  // Steve Wright as a generic manager: gray hair, white shirt, red tie, dark trousers
  dir: {
    rows: ["...gggg...", "..gggggg..", "..gssssg..", "..ssssss..", "...ssss...", "....ss....", "..wwttww..", ".wwwttwww.", ".wwwttwww.", "swwwttwwws", "s.wwttww.s", "s.wwwwww.s", "..dddddd..", "..dddddd..", "..dd..dd..", "..dd..dd..", "..dd..dd..", ".kkk..kkk."],
    pal: { g: "#B8B8C4", s: "#D3A07C", w: "#F2F2F7", t: "#D0263A", d: "#22243A", k: "#0E0E16" },
  },
};
const figureVox = (who: keyof typeof PEOPLE, v: number): Vox[] => {
  const { rows, pal } = PEOPLE[who];
  const out: Vox[] = [];
  const H = rows.length;
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (!pal[ch]) continue;
      const depth = ch === "s" && j > 5 ? [0] : [-1, 0, 1];
      for (const d of depth) out.push({ p: [(i - 4.5) * v, (H - 1 - j) * v + v / 2, d * v], c: pal[ch] });
    }
  });
  return out;
};
/** A generic faceless voxel person, ~1.7 units tall, standing on y = 0, facing +z. */
export const Person: React.FC<{ who: keyof typeof PEOPLE; t: number; position: V3; rotY?: number; scale?: number }> = ({ who, t, position, rotY = 0, scale = 1 }) => {
  const v = 0.095;
  const vox = useMemo(() => figureVox(who, v), [who]);
  const bob = Math.abs(Math.sin(t * 2.2)) * 0.02;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotY + Math.sin(t * 0.9) * 0.05, 0]} scale={scale}>
      <Instanced vox={vox} size={v} roughness={0.55} emissive={0.04} />
    </group>
  );
};

// ------------------------------------------------------------------ game hero (kit sprite, 1 px = 1/8 unit)
export const Hero: React.FC<{ position: V3; t: number; walking?: boolean; rotY?: number }> = ({ position, t, walking = false, rotY = 0 }) => {
  const v = 1 / 8;
  const vox = useMemo(() => {
    const out: Vox[] = [];
    SPRITE.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ".") continue;
        for (const d of [-1, 0, 1]) out.push({ p: [(i - 5.5) * v, (SPRITE.length - 1 - j) * v + v / 2, d * v], c: SPRITE_COLORS[ch] });
      }
    });
    return out;
  }, []);
  const hop = walking ? Math.abs(Math.sin(t * 9)) * 0.08 : 0;
  return (
    <group position={[position[0], position[1] + hop, position[2]]} rotation={[0, rotY, 0]}>
      <Instanced vox={vox} size={v} roughness={0.35} emissive={0.08} />
    </group>
  );
};

/** The gray 1-pixel dot as a glowing cube. */
export const Dot: React.FC<{ position: V3; t: number; size?: number }> = ({ position, t, size = 0.18 }) => {
  const glow = useMemo(() => makeGlowTexture(), []);
  return (
    <group position={position}>
      <mesh rotation={[t * 0.7, t * 1.1, 0]} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#C4CAD4" emissive="#C4CAD4" emissiveIntensity={0.6} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh>
        <planeGeometry args={[size * 8, size * 8]} />
        <meshBasicMaterial map={glow} color={P.yellow} transparent opacity={0.35 + 0.15 * Math.sin(t * 6)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight color="#FFF1C0" intensity={1.2} distance={3} decay={2} />
    </group>
  );
};

// ------------------------------------------------------------------ props
/** Voxel easter egg (striped), drops at `at` and bounces. */
export const Egg: React.FC<{ position: V3; t: number; at: number; seed: number; scale?: number }> = ({ position, t, at, seed, scale = 1 }) => {
  const v = 0.06;
  const vox = useMemo(() => {
    const out: Vox[] = [];
    for (let y = -8; y <= 8; y++) {
      const r = 6 * Math.sqrt(Math.max(0, 1 - (y / 8.5) ** 2)) * (y > 0 ? 0.86 : 1);
      for (let x = -6; x <= 6; x++)
        for (let z = -6; z <= 6; z++) {
          const d = Math.hypot(x, z);
          if (d <= r && d > r - 1.6) out.push({ p: [x * v, (y + 8.5) * v, z * v], c: RAINBOW[(Math.floor((y + 8) / 3) + seed) % RAINBOW.length] });
        }
    }
    return out;
  }, [seed]);
  const k = t - at;
  if (k < 0) return null;
  // fall 0.45 s from 3 units, then two damped bounces
  const fall = Math.min(1, k / 0.45);
  let y = 3 * (1 - fall * fall);
  if (k > 0.45) {
    const b = k - 0.45;
    y = Math.max(0, Math.sin(Math.min(b, 0.9) * (Math.PI / 0.45)) * 0.35 * Math.exp(-b * 3));
  }
  return (
    <group position={[position[0], position[1] + y, position[2]]} rotation={[0, t * 0.6 + seed, 0]} scale={scale}>
      <Instanced vox={vox} size={v} roughness={0.35} emissive={0.18} />
    </group>
  );
};

/** Envelope that lifts off and flies along a bezier arc between `from` and `to` during [a, b]. */
export const Letter: React.FC<{ t: number; a: number; b: number; from: V3; to: V3 }> = ({ t, a, b, from, to }) => {
  const tex = useMemo(
    () =>
      canvasTex(256, 160, (ctx) => {
        ctx.fillStyle = "#F4F1FF";
        ctx.fillRect(0, 0, 256, 160);
        ctx.strokeStyle = "#9A93C0";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(128, 90);
        ctx.lineTo(252, 4);
        ctx.stroke();
        ctx.fillStyle = "#E0303A";
        ctx.fillRect(196, 18, 44, 52);
        ctx.fillStyle = "#3E1592";
        ctx.font = "bold 22px 'Courier New', monospace";
        ctx.fillText("ATARI INC.", 40, 140);
      }),
    [],
  );
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  const e = k * k * (3 - 2 * k);
  const mid: V3 = [(from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 1.6, (from[2] + to[2]) / 2];
  const l = (p: number, q: number, s: number) => p + (q - p) * s;
  const p1 = [l(from[0], mid[0], e), l(from[1], mid[1], e), l(from[2], mid[2], e)];
  const p2 = [l(mid[0], to[0], e), l(mid[1], to[1], e), l(mid[2], to[2], e)];
  const p = [l(p1[0], p2[0], e), l(p1[1], p2[1], e), l(p1[2], p2[2], e)] as V3;
  const s = 1 - 0.6 * e;
  return (
    <mesh position={p} rotation={[-0.3 + Math.sin(t * 5) * 0.15, t * 2, Math.sin(t * 3) * 0.2]} scale={[s, s, s]} castShadow>
      <boxGeometry args={[0.42, 0.26, 0.02]} />
      <meshStandardMaterial map={tex} roughness={0.7} emissive="#FFFFFF" emissiveMap={tex} emissiveIntensity={0.25} />
    </mesh>
  );
};

/** Gold coins falling into a stack (salary), count grows over [a, b]. */
export const Coins: React.FC<{ t: number; a: number; b: number; position: V3; max?: number; gone?: number }> = ({ t, a, b, position, max = 14, gone = 1e9 }) => {
  const n = Math.round(max * Math.min(1, Math.max(0, (t - a) / (b - a))));
  if (t < a) return null;
  const fade = t > gone ? Math.max(0, 1 - (t - gone) / 0.6) : 1;
  return (
    <group position={position} scale={[1, fade, 1]}>
      {Array.from({ length: n }, (_, i) => {
        const land = a + ((b - a) * i) / max;
        const dy = Math.max(0, 1.2 - (t - land) * 6);
        return (
          <mesh key={i} position={[Math.sin(i * 2.4) * 0.02, 0.03 + i * 0.05 + dy, Math.cos(i * 1.7) * 0.02]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.045, 20]} />
            <meshStandardMaterial color={P.yellow} emissive={P.yellow} emissiveIntensity={0.35} metalness={0.7} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Cartridge boxes stacking up (sales), count grows over [a, b]. */
export const BoxStack: React.FC<{ t: number; a: number; b: number; position: V3; cols?: number; rows?: number }> = ({ t, a, b, position, cols = 4, rows = 5 }) => {
  const total = cols * rows;
  const n = Math.round(total * Math.min(1, Math.max(0, (t - a) / (b - a))));
  if (t < a) return null;
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => {
        const cx = i % cols;
        const cy = Math.floor(i / cols);
        const land = a + ((b - a) * i) / total;
        const dy = Math.max(0, 0.8 - (t - land) * 5);
        return (
          <mesh key={i} position={[(cx - (cols - 1) / 2) * 0.34, 0.2 + cy * 0.4 + dy, (cy % 2) * 0.04]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.38, 0.08]} />
            <meshStandardMaterial color={RAINBOW[(i * 5) % RAINBOW.length]} emissive={RAINBOW[(i * 5) % RAINBOW.length]} emissiveIntensity={0.15} roughness={0.45} />
          </mesh>
        );
      })}
    </group>
  );
};

/** ROM chip: black package with silver legs. */
export const Chip3D: React.FC<{ t: number; position: V3; at: number }> = ({ t, position, at }) => {
  const k = Math.min(1, Math.max(0, (t - at) / 0.35));
  if (k <= 0) return null;
  const s = k < 0.7 ? (k / 0.7) * 1.1 : 1.1 - (k - 0.7) / 0.3 * 0.1;
  return (
    <group position={position} rotation={[0.5, t * 0.8, 0]} scale={s}>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.08, 0.32]} />
        <meshStandardMaterial color="#14141C" roughness={0.35} metalness={0.3} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-0.3 + (i % 6) * 0.12, -0.05, i < 6 ? 0.18 : -0.18]}>
          <boxGeometry args={[0.04, 0.08, 0.06]} />
          <meshStandardMaterial color="#D8D8E0" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ in-game corridor (units: 1 cell)
export const CORRIDOR = { len: 22, wallX: 22, half: 2 };
const corridorVox = (): Vox[] => {
  const out: Vox[] = [];
  const r = rng(606);
  for (let x = -4; x < 30; x++) {
    for (let z = -CORRIDOR.half; z <= CORRIDOR.half; z++) out.push({ p: [x, -0.5, z], c: (x + z) % 2 ? "#1A1240" : "#22185A" });
    const gold = x >= 13;
    for (const z of [-CORRIDOR.half - 1, CORRIDOR.half + 1])
      for (let y = 0; y < 3; y++) {
        if (z > 0 && y > 0) continue; // near wall low so the camera sees in
        const base = gold ? (r() > 0.5 ? "#E0A82E" : "#C88A1E") : r() > 0.5 ? P.brick : P.brickShade;
        out.push({ p: [x, y + 0.5, z], c: y === 2 ? (gold ? P.yellow : P.cyan) : base });
      }
  }
  return out;
};
const wallVox = (): Vox[] => {
  const out: Vox[] = [];
  for (let z = -CORRIDOR.half; z <= CORRIDOR.half; z++) for (let y = 0; y < 3; y++) out.push({ p: [CORRIDOR.wallX, y + 0.5, z], c: y === 2 ? P.yellow : (y + z) % 2 ? "#E0A82E" : "#B0781A" });
  return out;
};
export const Corridor: React.FC<{ t: number; breakAt: number }> = ({ t, breakAt }) => {
  const vox = useMemo(corridorVox, []);
  const wall = useMemo(wallVox, []);
  const vel = useMemo(() => {
    const r = rng(77);
    return wall.map(() => [2 + r() * 5, 1 + r() * 4, (r() - 0.5) * 6, r() * 6] as const);
  }, [wall]);
  const k = Math.max(0, t - breakAt);
  return (
    <group>
      <Instanced vox={vox} size={1} roughness={0.55} emissive={0.06} />
      <Instanced
        vox={wall}
        size={1}
        roughness={0.4}
        emissive={0.12}
        anim={(i, v, m) => {
          if (k <= 0) return;
          const [vx, vy, vz, spin] = vel[i];
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(spin * k, spin * k * 0.7, 0));
          m.compose(new THREE.Vector3(v.p[0] + vx * k, Math.max(0.5, v.p[1] + vy * k - 4.9 * k * k), v.p[2] + vz * k), q, new THREE.Vector3(1, 1, 1));
        }}
      />
    </group>
  );
};

// ------------------------------------------------------------------ secret room
export const SecretRoom: React.FC<{ t: number }> = ({ t }) => {
  const S = 7;
  const vox = useMemo(() => {
    const out: Vox[] = [];
    for (let x = -S; x <= S; x++) for (let z = -S; z <= 2; z++) out.push({ p: [x, -0.5, z], c: (x + z) % 2 ? "#140C34" : "#1C1248" });
    for (let y = 0; y < 7; y++) {
      for (let x = -S; x <= S; x++) out.push({ p: [x, y + 0.5, -S - 1], c: "#000" });
      for (let z = -S; z <= 2; z++) {
        out.push({ p: [-S - 1, y + 0.5, z], c: "#000" });
        out.push({ p: [S + 1, y + 0.5, z], c: "#000" });
      }
    }
    return out;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    vox.forEach((v, i) => {
      if (v.c !== "#000") return;
      const band = Math.floor(v.p[1]);
      ref.current!.setColorAt(i, c.set(rainbow(t, band + Math.floor((v.p[0] + v.p[2]) / 3 + 40))));
    });
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  });
  const sign = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas, tex };
  }, []);
  useLayoutEffect(() => {
    const ctx = sign.canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 512);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "160px 'PS Anton', 'Arial Black', Impact, sans-serif";
    ctx.lineWidth = 18;
    ctx.strokeStyle = "#07060F";
    ctx.strokeText("CREATED BY", 512, 140);
    ctx.fillStyle = rainbow(t, 0);
    ctx.fillText("CREATED BY", 512, 140);
    ctx.font = "150px 'PS Anton', 'Arial Black', Impact, sans-serif";
    ctx.strokeText("WARREN ROBINETT", 512, 360);
    ctx.fillStyle = rainbow(t, 3);
    ctx.fillText("WARREN ROBINETT", 512, 360);
    sign.tex.needsUpdate = true;
  });
  return (
    <group>
      <ColorInstanced ref={ref} vox={vox} />
      <mesh position={[0, 3.3, -S - 0.45]}>
        <planeGeometry args={[5.6, 2.8]} />
        <meshBasicMaterial map={sign.tex} transparent toneMapped={false} />
      </mesh>
      <pointLight position={[0, 4, -3]} color={rainbow(t, 2)} intensity={6} distance={14} decay={2} />
    </group>
  );
};
const ColorInstanced = React.forwardRef<THREE.InstancedMesh, { vox: Vox[] }>(({ vox }, ref) => {
  const inner = useRef<THREE.InstancedMesh>(null);
  React.useImperativeHandle(ref, () => inner.current!);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    vox.forEach((v, i) => {
      m.makeTranslation(v.p[0], v.p[1], v.p[2]);
      inner.current!.setMatrixAt(i, m);
      if (v.c !== "#000") inner.current!.setColorAt(i, c.set(v.c));
      else inner.current!.setColorAt(i, c.set("#7A2DFF"));
    });
    inner.current!.instanceMatrix.needsUpdate = true;
  }, [vox]);
  return (
    <instancedMesh ref={inner} args={[undefined, undefined, vox.length]} receiveShadow>
      <boxGeometry args={[0.96, 0.96, 0.96]} />
      <meshStandardMaterial roughness={0.4} emissive="#FFFFFF" emissiveIntensity={0.16} />
    </instancedMesh>
  );
});
