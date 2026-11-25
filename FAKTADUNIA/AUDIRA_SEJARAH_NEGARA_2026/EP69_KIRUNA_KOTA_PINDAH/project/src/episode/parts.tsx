// Shared props for EP69 Kiruna (HD2D: diorama + pixel sprites + tilt-shift). GLB from public/models/polyfork.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { continueRender, delayRender, staticFile } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { hd2dTexture } from "../kits/hd2d/lib/textures.ts";
import { clamp01, easeOutBack, mulberry32 } from "../kits/feltcraft/core/motion";
import type { V3 } from "./timeline.ts";

export const C = {
  falu: "#8E2B22",
  roof: "#2B2522",
  asphalt: "#5B5E66",
  apron: "#B8AE98",
  grass: "#8FA35C",
  snow: "#EEF1F5",
  snowShade: "#C9D2E2",
  rock: "#5A5450",
  ore: "#3A4250",
  spruce: "#3B5A48",
  birch: "#9DB05A",
  trailer: "#E2A93B",
  warm: "#FFC071",
  sweBlue: "#1F5AA6",
  sweYellow: "#F2C230",
  gold: "#E8B14A",
};

export const st = (t: number, fps = 8) => Math.floor(t * fps) / fps;
/** Stepped pop-in (stop-motion feel): 0 before `at`, overshoots to 1 over `dur`. */
export const pop = (t: number, at: number, dur = 0.45) => {
  const x = clamp01((st(t, 12) - at) / dur);
  return x <= 0 ? 0 : easeOutBack(x, 1.6);
};

// ---------- materials ----------
const matCache = new Map<string, THREE.MeshStandardMaterial>();
type TexKind = "cobble" | "ashlar" | "plank" | "shingle";
/** Textured surface: the HD2D canvas map as colour (multiplied by `color`) and as bump 0.5. */
export const texMat = (color: string, kind: TexKind, repeat: [number, number] = [4, 4], rough = 0.88) => {
  const key = `${color}|${kind}|${repeat.join("x")}`;
  let m = matCache.get(key);
  if (!m) {
    const tex = hd2dTexture(kind, repeat);
    m = new THREE.MeshStandardMaterial({ color, map: tex, bumpMap: tex, bumpScale: 0.5, roughness: rough });
    matCache.set(key, m);
  }
  return m;
};
export const flatMat = (color: string, rough = 0.85, metal = 0) => {
  const key = `flat|${color}|${rough}|${metal}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    matCache.set(key, m);
  }
  return m;
};

// ---------- canvas text ----------
const texCache = new Map<string, THREE.CanvasTexture>();
export const textTexture = (text: string, o: { w?: number; h?: number; font?: string; fg?: string; bg?: string; border?: string } = {}) => {
  const { w = 512, h = 160, font = "900 96px 'Segoe UI', Arial, sans-serif", fg = "#FFF6E4", bg = "#2A1A12", border = "#E8B14A" } = o;
  const key = `${text}|${w}|${h}|${font}|${fg}|${bg}|${border}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border) {
    g.strokeStyle = border;
    g.lineWidth = Math.max(6, h * 0.06);
    g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
  }
  g.fillStyle = fg;
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
};

/** Wooden sign board on two posts (AUDIRA board, 1912 plaque, pins). */
export const SignBoard: React.FC<{ text: string; position: V3; rotation?: number; w?: number; h?: number; posts?: number; bg?: string; fg?: string; border?: string }> = ({ text, position, rotation = 0, w = 1.0, h = 0.32, posts = 0.5, bg, fg, border }) => {
  const tex = textTexture(text, { w: 512, h: Math.round((512 * h) / w), bg, fg, border, font: `900 ${Math.round(((512 * h) / w) * 0.55)}px 'Segoe UI', Arial, sans-serif` });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, posts + h / 2, 0]} castShadow material={texMat("#7A5236", "plank", [1, 1])}>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
      </mesh>
      <mesh position={[0, posts + h / 2, 0.027]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
      {posts > 0
        ? [-w * 0.38, w * 0.38].map((x) => (
            <mesh key={x} position={[x, posts / 2, -0.01]} castShadow material={texMat("#5E3F28", "plank", [1, 2])}>
              <boxGeometry args={[0.05, posts, 0.05]} />
            </mesh>
          ))
        : null}
    </group>
  );
};

// ---------- hero church: clapboard-church GLB, recoloured Falu red, clapboard map + bump ----------
let CLAP: THREE.CanvasTexture | null = null;
const clapTexture = () => {
  if (CLAP) return CLAP;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(69);
  const rows = 16;
  const h = S / rows;
  for (let r = 0; r < rows; r++) {
    const v = 222 + Math.floor(rnd() * 26);
    g.fillStyle = `rgb(${v},${v - 4},${v - 8})`;
    g.fillRect(0, r * h, S, h);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = `rgba(90,60,40,${0.05 + rnd() * 0.07})`;
      g.fillRect(rnd() * S, r * h + rnd() * h, 30 + rnd() * 80, 1);
    }
    g.fillStyle = "rgba(40,20,10,0.55)";
    g.fillRect(0, r * h + h - 2, S, 2);
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(0, r * h, S, 1);
  }
  CLAP = new THREE.CanvasTexture(c);
  CLAP.colorSpace = THREE.SRGBColorSpace;
  CLAP.wrapS = CLAP.wrapT = THREE.RepeatWrapping;
  CLAP.anisotropy = 8;
  return CLAP;
};

/** Planar UVs from the dominant face normal (the GLB has no UVs). `unit` = model units per texture tile. */
const boxUV = (geo: THREE.BufferGeometry, unit: number) => {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.computeVertexNormals();
  const p = g.attributes.position;
  const n = g.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u: number, v: number;
    if (ay >= ax && ay >= az) [u, v] = [p.getX(i), p.getZ(i)];
    else if (ax >= az) [u, v] = [p.getZ(i), p.getY(i)];
    else [u, v] = [p.getX(i), p.getY(i)];
    uv[i * 2] = u / unit;
    uv[i * 2 + 1] = v / unit;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};

const FALU = new THREE.Color(C.falu);
const ROOF = new THREE.Color(C.roof);
const TRIM = new THREE.Color("#F1EADC");

let churchPromise: Promise<THREE.Group> | null = null;
const loadChurch = () => {
  if (!churchPromise) churchPromise = new Promise((res, rej) => new GLTFLoader().load(staticFile("models/polyfork/clapboard-church-03a6f5.glb"), (g) => res(g.scene), undefined, rej));
  return churchPromise;
};

/**
 * The Kiruna church — the SAME model in every scene (G17). Base sits on y = 0, length along z.
 * size = height in world units. ghost 0..1 fades the walls for the organ cutaway.
 */
export const Church: React.FC<{ position?: V3; rotation?: number; size?: number; ghost?: number }> = ({ position = [0, 0, 0], rotation = 0, size = 3.2, ghost = 0 }) => {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const hold = useRef<number | null>(null);
  useLayoutEffect(() => {
    let alive = true;
    hold.current = delayRender("church glb", { timeoutInMilliseconds: 60000 });
    loadChurch().then(
      (s) => {
        if (alive) setScene(s);
        if (hold.current !== null) continueRender(hold.current);
        hold.current = null;
      },
      () => {
        if (hold.current !== null) continueRender(hold.current);
        hold.current = null;
      },
    );
    return () => {
      alive = false;
      if (hold.current !== null) continueRender(hold.current);
    };
  }, []);
  const built = useMemo(() => {
    if (!scene) return null;
    const root = scene.clone(true);
    root.updateMatrixWorld(true);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: clapTexture(), bumpMap: clapTexture(), bumpScale: 0.5, roughness: 0.82, transparent: true, opacity: 1 });
    const out = new THREE.Group();
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const geo = boxUV((o.geometry as THREE.BufferGeometry).clone().applyMatrix4(o.matrixWorld), 2.6);
      const col = geo.attributes.color;
      if (col) {
        const c = new THREE.Color();
        for (let i = 0; i < col.count; i++) {
          c.setRGB(col.getX(i), col.getY(i), col.getZ(i));
          const lum = (c.r + c.g + c.b) / 3;
          const y = geo.attributes.position.getY(i);
          if (lum > 0.55) {
            // white clapboard walls → Falu red; keep a thin white trim at the eaves band
            const shade = 0.88 + (lum - 0.8) * 1.2;
            c.copy(y > 4.6 && y < 4.9 ? TRIM : FALU).multiplyScalar(shade);
          } else if (lum < 0.09 && y > 3) c.copy(ROOF);
          col.setXYZ(i, c.r, c.g, c.b);
        }
        col.needsUpdate = true;
      }
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      out.add(m);
    });
    return { out, mat };
  }, [scene]);
  if (!built) return null;
  built.mat.opacity = 1 - 0.72 * ghost;
  built.mat.depthWrite = ghost < 0.05;
  const k = size / 10.78;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive object={built.out} scale={k} />
    </group>
  );
};

/** Organ: rows of gold pipes inside the church (shown during the cutaway). */
export const Organ: React.FC<{ s: number; position: V3 }> = ({ s, position }) =>
  s <= 0.01 ? null : (
    <group position={position} scale={s}>
      {Array.from({ length: 15 }, (_, i) => {
        const x = (i - 7) * 0.07;
        const h = 0.55 - Math.abs(i - 7) * 0.045;
        return (
          <mesh key={i} position={[x, h / 2 + 0.12, 0]} material={flatMat(C.gold, 0.3, 0.9)}>
            <cylinderGeometry args={[0.024, 0.024, h, 12]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.06, -0.04]} material={texMat("#6A4228", "plank", [1, 1])}>
        <boxGeometry args={[1.15, 0.14, 0.18]} />
      </mesh>
      <pointLight position={[0, 0.4, 0.3]} intensity={1.4} distance={2.2} color={C.warm} />
    </group>
  );

/** Two self-propelled trailers side by side (rows of wheels), deck top at y = h. */
export const Trailers: React.FC<{ position?: V3; length?: number; h?: number; t: number; rolling?: boolean }> = ({ position = [0, 0, 0], length = 3.3, h = 0.26, t, rolling = true }) => {
  const spin = rolling ? st(t, 12) * 2.2 : 0;
  return (
    <group position={position}>
      {[-0.42, 0.42].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, h - 0.06, 0]} castShadow receiveShadow material={texMat(C.trailer, "plank", [1, 3], 0.6)}>
            <boxGeometry args={[0.62, 0.12, length]} />
          </mesh>
          <mesh position={[0, h - 0.14, 0]} material={flatMat("#2E2C2A", 0.7, 0.3)}>
            <boxGeometry args={[0.5, 0.06, length - 0.1]} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) =>
            [-0.22, 0.22].map((wx) => (
              <mesh key={`${i}${wx}`} position={[wx, 0.075, -length / 2 + 0.22 + (i * (length - 0.44)) / 7]} rotation={[spin, 0, Math.PI / 2]} castShadow material={flatMat("#1C1C1E", 0.8)}>
                <cylinderGeometry args={[0.075, 0.075, 0.1, 10]} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  );
};

// ---------- pixel townsfolk (HD2D sprite slabs, 8 fps step, pale rim backer) ----------
const COATS = ["#2F4E7A", "#B5473A", "#3E7A5B", "#D19A3A", "#6B4E8A", "#2B2F3A", "#C7663A"];
export const Folk: React.FC<{ position: V3; seed: number; t: number; walk?: boolean; scale?: number; lookUp?: boolean; flag?: boolean }> = ({ position, seed, t, walk = false, scale = 0.24, lookUp = false, flag = false }) => {
  const rnd = mulberry32(seed);
  const coat = COATS[Math.floor(rnd() * COATS.length)];
  const hat = rnd() > 0.5;
  const ph = Math.floor(st(t, 8) * 8 + seed) % 2;
  const stride = walk ? (ph ? 0.05 : -0.05) : 0;
  const bob = walk ? (ph ? 0.015 : 0) : Math.floor(st(t, 4) * 4 + seed) % 3 === 0 ? 0.01 : 0;
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#1A1410" transparent opacity={0.45} />
      </mesh>
      <Billboard lockY>
        <group position={[0, bob, 0]}>
          <mesh position={[0, 0.55, -0.05]}>
            <planeGeometry args={[0.58, 1.18]} />
            <meshBasicMaterial color="#F4EBDA" transparent opacity={0.9} toneMapped={false} />
          </mesh>
          <mesh position={[-0.1, 0.13 + stride, 0]} material={flatMat("#2A1E16")}>
            <boxGeometry args={[0.14, 0.26, 0.06]} />
          </mesh>
          <mesh position={[0.1, 0.13 - stride, 0]} material={flatMat("#2A1E16")}>
            <boxGeometry args={[0.14, 0.26, 0.06]} />
          </mesh>
          <mesh position={[0, 0.5, 0]} material={flatMat(coat, 0.9)}>
            <boxGeometry args={[0.44, 0.5, 0.07]} />
          </mesh>
          <mesh position={[0, 0.88 + (lookUp ? 0.03 : 0), 0]} material={flatMat("#F1C7A2", 0.8)}>
            <boxGeometry args={[0.3, 0.28, 0.07]} />
          </mesh>
          {hat ? (
            <mesh position={[0, 1.05, 0.01]} material={flatMat(COATS[(seed + 3) % COATS.length], 0.9)}>
              <boxGeometry args={[0.36, 0.12, 0.08]} />
            </mesh>
          ) : (
            <mesh position={[0, 1.04, 0.01]} material={flatMat("#C98A45", 0.9)}>
              <boxGeometry args={[0.34, 0.1, 0.08]} />
            </mesh>
          )}
          {flag ? (
            <group position={[0.3, 0.9, 0.02]}>
              <mesh position={[0, 0.2, 0]} material={flatMat("#3A2A1E")}>
                <boxGeometry args={[0.03, 0.8, 0.03]} />
              </mesh>
              <mesh position={[0.17, 0.48, 0]} material={flatMat(C.sweBlue, 0.8)}>
                <boxGeometry args={[0.32, 0.22, 0.02]} />
              </mesh>
              <mesh position={[0.17, 0.48, 0.012]} material={flatMat(C.sweYellow, 0.8)}>
                <boxGeometry args={[0.32, 0.05, 0.01]} />
              </mesh>
              <mesh position={[0.1, 0.48, 0.014]} material={flatMat(C.sweYellow, 0.8)}>
                <boxGeometry args={[0.05, 0.22, 0.01]} />
              </mesh>
            </group>
          ) : null}
        </group>
      </Billboard>
    </group>
  );
};

/** A crowd scattered in a strip [x0..x1] × [z0..z1]. */
export const Crowd: React.FC<{ t: number; n: number; x: [number, number]; z: [number, number]; seed?: number; walk?: boolean; dx?: number; lookUp?: boolean; flags?: number }> = ({ t, n, x, z, seed = 1, walk, dx = 0, lookUp, flags = 0 }) => {
  const items = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: n }, (_, i) => ({ p: [x[0] + r() * (x[1] - x[0]), 0, z[0] + r() * (z[1] - z[0])] as V3, s: seed * 31 + i, sc: 0.22 + r() * 0.05 }));
  }, [n, x, z, seed]);
  return (
    <>
      {items.map((m, i) => (
        <Folk key={i} position={[m.p[0] + dx, 0, m.p[2]]} seed={m.s} t={t} walk={walk} scale={m.sc} lookUp={lookUp} flag={i < flags} />
      ))}
    </>
  );
};

// ---------- street furniture ----------
/** Lamp post GLB + warm bulb + point light (practical: gives bokeh in the tilt-shift). */
export const Lamp: React.FC<{ position: V3; size?: number; rotation?: number; light?: number }> = ({ position, size = 0.6, rotation = 0, light = 0.9 }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <AssetModel id="lamp-post-c9e409" assetType="prop" size={size} ground tint="#2E2A28" roughness={0.6} />
    <mesh position={[0, size * 0.93, size * 0.1]}>
      <sphereGeometry args={[size * 0.05, 12, 8]} />
      <meshBasicMaterial color={[3.2, 2.2, 1.1]} toneMapped={false} />
    </mesh>
    {light > 0 ? <pointLight position={[0, size * 0.9, size * 0.12]} intensity={light} distance={size * 4} color={C.warm} /> : null}
  </group>
);

export const Tree: React.FC<{ kind: "birch" | "spruce" | "pine"; position: V3; size?: number; tint?: string }> = ({ kind, position, size = 1.2, tint }) => {
  const id = kind === "birch" ? "birch-tree-181b33" : kind === "spruce" ? "snow-laden-spruce-36716e" : "pine-tree-3ea075";
  return (
    <group position={position}>
      <AssetModel id={id} assetType="prop" size={size} ground tint={tint} roughness={0.9} />
    </group>
  );
};

export const TreeRow: React.FC<{ kind: "birch" | "spruce" | "pine"; n: number; x: [number, number]; z: [number, number]; seed?: number; size?: [number, number]; tint?: string }> = ({ kind, n, x, z, seed = 4, size = [1.0, 1.6], tint }) => {
  const items = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: n }, (_, i) => ({ p: [x[0] + ((i + r() * 0.7) / n) * (x[1] - x[0]), 0, z[0] + r() * (z[1] - z[0])] as V3, s: size[0] + r() * (size[1] - size[0]) }));
  }, [n, x, z, seed, size]);
  return (
    <>
      {items.map((m, i) => (
        <Tree key={i} kind={kind} position={m.p} size={m.s} tint={tint} />
      ))}
    </>
  );
};

/** Ground slab: a big textured plane. */
export const Ground: React.FC<{ color: string; kind?: TexKind; size?: [number, number]; position?: V3; repeat?: [number, number] }> = ({ color, kind = "cobble", size = [60, 60], position = [0, 0, 0], repeat = [24, 24] }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow material={texMat(color, kind, repeat, 0.95)}>
    <planeGeometry args={size} />
  </mesh>
);

/** Asphalt road strip along x with dashed centre line. */
export const Road: React.FC<{ x: [number, number]; z?: number; w?: number }> = ({ x, z = 0, w = 2.6 }) => {
  const len = x[1] - x[0];
  const cx = (x[0] + x[1]) / 2;
  return (
    <group position={[cx, 0.004, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={texMat(C.asphalt, "ashlar", [len / 2, w / 2], 0.92)}>
        <planeGeometry args={[len, w]} />
      </mesh>
      {Array.from({ length: Math.floor(len / 0.9) }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-len / 2 + 0.45 + i * 0.9, 0.002, 0]}>
          <planeGeometry args={[0.42, 0.05]} />
          <meshStandardMaterial color="#F2EAD2" roughness={0.7} />
        </mesh>
      ))}
      {[-w / 2, w / 2].map((zz) => (
        <mesh key={zz} position={[0, 0.03, zz]} receiveShadow material={texMat("#A9A396", "ashlar", [len, 1])}>
          <boxGeometry args={[len, 0.06, 0.1]} />
        </mesh>
      ))}
    </group>
  );
};

/** Iron-ore mountain with the mine headframe on top (Kiirunavaara stand-in). */
export const MineHill: React.FC<{ position: V3; scale?: number; snow?: boolean }> = ({ position, scale = 1, snow = false }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, -0.6, 0]} scale={[6.5, 2.6, 3]} castShadow receiveShadow material={texMat(snow ? "#9AA2B4" : "#5E5752", "ashlar", [6, 3])}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
    <mesh position={[2.6, -0.4, 0.6]} scale={[3.4, 1.7, 2.2]} castShadow receiveShadow material={texMat(snow ? "#B4BCCB" : "#6E655C", "ashlar", [4, 2])}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
    <group position={[-0.6, 1.9, 0]}>
      <AssetModel id="mine-headframe-735cf4" assetType="building" size={1.9} ground tint="#3E3A3A" roughness={0.7} />
    </group>
  </group>
);

/** Soft sun-haze card behind the diorama (separates layers). */
export const Haze: React.FC<{ color: string; position: V3; w?: number; h?: number; opacity?: number }> = ({ color, position, w = 30, h = 6, opacity = 0.5 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.6, "rgba(255,255,255,0.8)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 128);
    const tx = new THREE.CanvasTexture(c);
    return tx;
  }, []);
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={color} alphaMap={tex} transparent opacity={opacity} depthWrite={false} fog={false} />
    </mesh>
  );
};
