// EP05 cover (CIRCUITFORGE): macro shot inside a console NVMe SSD. NAND packages stand like dark
// city blocks, data packets race along copper routes into a hero NAND stack that is filling up
// ("212 GB"), and a generic sunset/neon-pink glow rises from the far edge of the board.
// No game assets: no logo, no characters, no trademark fonts.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { CIRCUIT_PALETTE } from "../../kits/circuitforge/lib/palette.ts";
import { BOARD, ROUTES, boardTexture, heroLabelTexture, nandTopTexture, skyTexture, type P2 } from "./coverTextures.ts";

export const { fontFamily: BEBAS } = loadBebas("normal", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const BG = "#120a24";
export const AMBER = CIRCUIT_PALETTE.electronAmber;
export const CYAN = CIRCUIT_PALETTE.clockCyan;
export const PINK = "#ff4f9a";

type V3 = [number, number, number];
export const hdr = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k);
export const fx = (m: THREE.Object3D) => m.layers.set(FX_LAYER);

// ---------- camera ----------
const CAM_POS: V3 = [0.15, 2.05, 6.4];
const CAM_TARGET: V3 = [0.0, 1.25, -2.6];
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    camera.layers.enable(FX_LAYER);
    camera.position.set(CAM_POS[0] - t * 0.03, CAM_POS[1], CAM_POS[2] - t * 0.05);
    camera.lookAt(...CAM_TARGET);
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- materials ----------
export const EPOXY = { color: "#1a1d24", roughness: 0.42, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.35 } as const;

// ---------- board ----------
export const Board: React.FC = () => {
  const tex = boardTexture();
  const grain = useSurfaceGrain(31, 0.25, 10);
  return (
    <group position={[0, 0, (BOARD.z0 + BOARD.z1) / 2]}>
      <mesh receiveShadow position={[0, -0.07, 0]}>
        <boxGeometry args={[BOARD.w, 0.14, BOARD.d]} />
        <meshStandardMaterial color="#071a10" roughness={0.6} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[BOARD.w, BOARD.d]} />
        <meshPhysicalMaterial map={tex} roughness={0.58} roughnessMap={grain} metalness={0.12} clearcoat={0.25} clearcoatRoughness={0.45} />
      </mesh>
    </group>
  );
};

// ---------- NAND stack: epoxy dies separated by lit (filled) or dark (empty) seams ----------
export const LAYER_H = 0.07;
export const SEAM_H = 0.016;
export const Stack: React.FC<{
  pos: V3;
  w: number;
  d: number;
  layers: number;
  filled: number;
  glow: string;
  seed: number;
  rotY?: number;
}> = ({ pos, w, d, layers, filled, glow, seed, rotY = 0 }) => {
  const top = nandTopTexture(seed);
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: hdr(glow, 2.6), toneMapped: false }),
    [glow],
  );
  const baseH = 0.07;
  const h = baseH + layers * (LAYER_H + SEAM_H);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow position={[0, baseH / 2, 0]}>
        <RoundedBoxGeo args={[w + 0.12, baseH, d + 0.12]} radius={0.015} segments={2} />
        <meshStandardMaterial color="#2a3a30" roughness={0.5} metalness={0.3} />
      </mesh>
      {Array.from({ length: layers }, (_, i) => {
        const y0 = baseH + i * (LAYER_H + SEAM_H);
        const lit = i < filled;
        return (
          <group key={i}>
            <mesh position={[0, y0 + SEAM_H / 2, 0]} material={lit ? glowMat : undefined} onUpdate={lit ? fx : undefined}>
              <boxGeometry args={[w - 0.012, SEAM_H, d - 0.012]} />
              {!lit && <meshStandardMaterial color="#2c313a" roughness={0.6} metalness={0.4} />}
            </mesh>
            <mesh castShadow receiveShadow position={[0, y0 + SEAM_H + LAYER_H / 2, 0]}>
              <RoundedBoxGeo args={[w, LAYER_H, d]} radius={0.012} segments={2} />
              <meshPhysicalMaterial {...EPOXY} />
            </mesh>
          </group>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, h + 0.002, 0]}>
        <planeGeometry args={[w - 0.03, d - 0.03]} />
        <meshPhysicalMaterial map={top} roughness={0.38} clearcoat={0.4} clearcoatRoughness={0.3} />
      </mesh>
    </group>
  );
};

// ---------- hero: tall stack filling up, etched "212 GB" cap ----------
const HERO = { pos: [0, 0, -2.75] as V3, w: 1.36, d: 1.1, layers: 13, filled: 10 };
const Hero: React.FC<{ f: number }> = ({ f }) => {
  const label = heroLabelTexture();
  const baseH = 0.07;
  const stackH = baseH + HERO.layers * (LAYER_H + SEAM_H);
  const capH = 0.42;
  const pulse = 0.85 + 0.15 * Math.sin((f / 60) * 5);
  const frontMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: hdr("#fff1cc", 3.4), toneMapped: false }),
    [],
  );
  return (
    <group position={HERO.pos}>
      <Stack pos={[0, 0, 0]} w={HERO.w} d={HERO.d} layers={HERO.layers} filled={HERO.filled} glow={AMBER} seed={5} />
      {/* fill front: the seam being written right now burns brighter */}
      <mesh position={[0, baseH + HERO.filled * (LAYER_H + SEAM_H) + SEAM_H / 2, 0]} scale={[1, 1.4 * pulse, 1]} material={frontMat} onUpdate={fx}>
        <boxGeometry args={[HERO.w + 0.006, SEAM_H, HERO.d + 0.006]} />
      </mesh>
      {/* etched cap */}
      <mesh castShadow receiveShadow position={[0, stackH + capH / 2, 0]}>
        <RoundedBoxGeo args={[HERO.w + 0.04, capH, HERO.d + 0.04]} radius={0.03} segments={3} />
        <meshPhysicalMaterial {...EPOXY} color="#14161b" />
      </mesh>
      <mesh position={[0, stackH + capH / 2, HERO.d / 2 + 0.0215]}>
        <planeGeometry args={[HERO.w - 0.02, capH * 0.9]} />
        <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      {/* nickel lid on top */}
      <mesh castShadow position={[0, stackH + capH + 0.02, 0]}>
        <RoundedBoxGeo args={[HERO.w - 0.1, 0.04, HERO.d - 0.1]} radius={0.012} segments={2} />
        <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.22} />
      </mesh>
      {/* warm light spilling from the lit seams onto the board */}
      <pointLight position={[0, 0.5, HERO.d / 2 + 0.5]} color={AMBER} intensity={1.6} distance={2.6} decay={2} />
    </group>
  );
};

// ---------- city of NAND blocks (seeded) ----------
type Block = { x: number; z: number; w: number; d: number; layers: number; filled: number; glow: string; seed: number };
export const BLOCKS: Block[] = (() => {
  const r = prng(2026);
  const out: Block[] = [];
  let seed = 10;
  for (let z = -1.2; z > -10.5; z -= 1.45) {
    for (let x = -4.0; x <= 4.01; x += 1.2) {
      const jx = x + (r() - 0.5) * 0.3, jz = z + (r() - 0.5) * 0.3;
      // keep the avenue in front of and around the hero clear
      if (Math.abs(jx) < 1.05 && jz > -4.0) continue;
      if (Math.abs(jx) < 0.55 && jz > -7.5) continue;
      if (r() < 0.12) continue;
      const depth = Math.min(1, (-jz - 1) / 8);
      const layers = 2 + Math.floor(r() * 6 + depth * 8);
      const glowPick = r();
      out.push({
        x: jx,
        z: jz,
        w: 0.72 + r() * 0.28,
        d: 0.62 + r() * 0.3,
        layers,
        filled: Math.floor(layers * (0.3 + r() * 0.7)),
        glow: glowPick < 0.55 ? CYAN : glowPick < 0.85 ? AMBER : PINK,
        seed: seed++,
      });
    }
  }
  return out;
})();

// ---------- SMD passives along the routes ----------
export const PASSIVES: { p: V3; rot: number; s: number }[] = (() => {
  const r = prng(77);
  const out: { p: V3; rot: number; s: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const z = 1.8 - r() * 5.0;
    const x = (r() - 0.5) * 3.8;
    if (Math.abs(x) < 0.85 && z < -1.9 && z > -3.5) continue;
    out.push({ p: [x, 0, z], rot: r() < 0.5 ? 0 : Math.PI / 2, s: 0.8 + r() * 0.5 });
  }
  return out;
})();
export const Passive: React.FC<{ p: V3; rot: number; s: number }> = ({ p, rot, s }) => (
  <group position={p} rotation={[0, rot, 0]} scale={s}>
    <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
      <RoundedBoxGeo args={[0.12, 0.06, 0.07]} radius={0.01} segments={2} />
      <meshStandardMaterial color="#8a6a48" roughness={0.6} />
    </mesh>
    {[-1, 1].map((k) => (
      <mesh key={k} castShadow position={[k * 0.07, 0.032, 0]}>
        <RoundedBoxGeo args={[0.03, 0.064, 0.074]} radius={0.008} segments={2} />
        <meshStandardMaterial color="#c3cad3" metalness={0.9} roughness={0.25} />
      </mesh>
    ))}
  </group>
);

// ---------- data packets riding the copper routes ----------
export function routeSampler(route: P2[]) {
  const seg = route.slice(1).map((b, i) => {
    const a = route[i];
    return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  });
  const total = seg.reduce((s, q) => s + q.len, 0);
  const at = (s: number): [number, number, number] => {
    let d = Math.max(0, Math.min(total, s));
    for (const q of seg) {
      if (d <= q.len) {
        const t = d / q.len;
        return [q.a[0] + (q.b[0] - q.a[0]) * t, q.a[1] + (q.b[1] - q.a[1]) * t, Math.atan2(q.b[0] - q.a[0], q.b[1] - q.a[1])];
      }
      d -= q.len;
    }
    const l = seg[seg.length - 1];
    return [l.b[0], l.b[1], 0];
  };
  return { total, at };
}

const Packets: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  const mats = useMemo(() => {
    const m = new Map<string, THREE.MeshBasicMaterial[]>();
    for (const c of [CYAN, AMBER, PINK]) {
      m.set(
        c,
        Array.from({ length: 10 }, (_, i) => {
          const k = 1 - i / 10;
          return new THREE.MeshBasicMaterial({
            color: hdr(i === 0 ? "#ffffff" : c, i === 0 ? 4 : 1.2 + 2.4 * k),
            transparent: true,
            opacity: 0.15 + 0.85 * k * k,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          });
        }),
      );
    }
    return m;
  }, []);
  const items: React.ReactNode[] = [];
  ROUTES.forEach((route, ri) => {
    const { total, at } = routeSampler(route);
    const color = ri % 3 === 1 ? AMBER : ri % 5 === 4 ? PINK : CYAN;
    const count = total > 4 ? 3 : 2;
    for (let k = 0; k < count; k++) {
      const head = ((ri * 0.37 + k / count) * total + t * 1.6) % total;
      for (let i = 0; i < 10; i++) {
        const s = head - i * 0.07;
        if (s < 0) break;
        const [x, z, yaw] = at(s);
        const sc = i === 0 ? 1.4 : 1 - i * 0.06;
        items.push(
          <mesh key={`${ri}-${k}-${i}`} position={[x, 0.012, z]} rotation={[0, yaw, 0]} scale={[sc, sc, 1]} material={mats.get(color)![i]} onUpdate={fx}>
            <boxGeometry args={[0.045, 0.02, 0.085]} />
          </mesh>,
        );
      }
    }
  });
  return <>{items}</>;
};

// ---------- sunset sky (far) ----------
export const Sky: React.FC = () => {
  const tex = skyTexture();
  return (
    <mesh position={[0, 4.6, -26]} onUpdate={fx}>
      <planeGeometry args={[64, 32]} />
      <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
    </mesh>
  );
};

// ---------- scene ----------
const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig f={f} />
    <fog attach="fog" args={["#4a1a48", 9, 30]} />
    <ambientLight intensity={0.55} color="#5a6a80" />
    <hemisphereLight args={["#ff9a8a", "#0a1a14", 0.7]} />
    <directionalLight
      position={[4, 8, 8]}
      intensity={2.4}
      color="#fff4e6"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.0004}
    />
    {/* sunset rim from the far edge */}
    <directionalLight position={[2.5, 15, -15]} intensity={2.0} color="#ff8a5a" />
    <pointLight position={[-3.2, 1.6, -7]} color={PINK} intensity={9} distance={11} decay={2} />
    <pointLight position={[3.4, 1.6, -7]} color="#ff7a45" intensity={4} distance={9} decay={2} />
    <pointLight position={[0, 1.2, 0.8]} color={CYAN} intensity={1.6} distance={5} decay={2} />

    <Board />
    <Hero f={f} />
    {BLOCKS.map((b) => (
      <Stack key={b.seed} pos={[b.x, 0, b.z]} w={b.w} d={b.d} layers={b.layers} filled={b.filled} glow={b.glow} seed={b.seed} />
    ))}
    {PASSIVES.map((p, i) => (
      <Passive key={i} {...p} />
    ))}
    <Packets f={f} />
    <Sky />
    <Finish
      frame={Math.round(f)}
      background={BG}
      profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
      exposure={1}
      envIntensity={0.55}
      ao
      focus={9}
      aperture={0.0011}
      maxBlur={0.006}
    />
  </>
);

// ---------- HTML overlay ----------
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(10,6,22,0.94) 0%, rgba(10,6,22,0.82) 22%, rgba(10,6,22,0.35) 34%, rgba(10,6,22,0) 42%, rgba(10,6,22,0) 78%, rgba(10,6,22,0.6) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 196, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: AMBER }}>
      ● AUDIRA · BERITA GAME
    </div>
    <div style={{ position: "absolute", left: 66, top: 250, fontFamily: BEBAS, color: "#F6F1E7", lineHeight: 0.86, textShadow: "0 8px 30px rgba(0,0,0,0.65)" }}>
      <div style={{ fontSize: 290, letterSpacing: 2 }}>
        212 <span style={{ color: AMBER }}>GB</span>
      </div>
      <div style={{ fontSize: 132, letterSpacing: 3, marginTop: 6 }}>UNTUK SATU GAME</div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 660,
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 33,
        color: "#EDE7F2",
        letterSpacing: 0.5,
        textShadow: "0 3px 12px rgba(0,0,0,0.8)",
      }}
    >
      GTA 6 · pre-load 10 Nov · rilis 19 Nov 2026
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 40, near: 0.1, far: 80 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
