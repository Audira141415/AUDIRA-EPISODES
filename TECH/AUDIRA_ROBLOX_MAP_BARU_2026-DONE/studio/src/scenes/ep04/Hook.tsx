// EP04 hook world (ARCADECRT): a midnight wall of CRT screens, each running an invented game
// thumbnail fighting for a click. Most are grey and sinking into black water ("ROBUX!" clickbait,
// grey default thumbnail). One bright custom-thumbnail screen stands in front, and its blocky
// avatar leaps out through the glass in a burst of pixel shards.
// Driven only by `f` (60 fps clock). No Math.random, no Date.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { MeshReflectorMaterial } from "@react-three/drei";
import { makeCrtMaterial, makeGlowTexture } from "../../kits/arcadecrt/lib/materials";
import { ARCADE_PALETTE as P } from "../../kits/arcadecrt/lib/palette";
import { rng } from "../../kits/arcadecrt/core/motion";
import { BlockAvatar } from "../_shared/BlockAvatar.tsx";
import { badgeTexture, tagTexture, thumbTexture, ThumbKind } from "./thumbTextures.ts";

type V3 = [number, number, number];

export const BG = P.room;
export const WATER_Y = -3.3;

/** Camera start pose (cover framing = first frame of the film hook). */
export const COVER_CAMERA = {
  position: [-1.4, 2.4, 28.5] as V3,
  target: [0.4, 0.5, 0] as V3,
  fov: 46,
};

/** Hook camera: from the cover pose, a slow push-in with a slight orbit. */
export const hookCamera = (t: number) => {
  const p = COVER_CAMERA.position;
  return {
    position: [p[0] + t * 0.12, p[1] + t * 0.02, p[2] - t * 0.55] as V3,
    target: COVER_CAMERA.target,
    fov: COVER_CAMERA.fov,
  };
};

const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = hookCamera(f / 60);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.position);
    cam.fov = c.fov;
    cam.lookAt(...c.target);
    cam.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------------------------------------------------------------------------------------------
// CRT monitor: rounded cabinet + curved CRT-shader screen showing one thumbnail.
type MonitorProps = {
  pos: V3;
  rot?: V3;
  sw: number; // screen width (16:9)
  kind: ThumbKind;
  seed: number;
  grey?: number;
  dark?: number;
  boost?: number;
  halo?: string;
  haloOpacity?: number;
  body?: string;
  tag?: { text: string; color: string };
  badge?: boolean;
  f: number;
  /** Optional texture instead of the static thumbnail (e.g. a per-frame canvas). */
  tex?: THREE.Texture;
  /** Screen height / width (default 9/16). */
  aspect?: number;
  /** Optional extra content in the monitor group (labels, stamps). */
  children?: React.ReactNode;
};

export const glowTex = (() => {
  let g: THREE.Texture | null = null;
  return () => (g ??= makeGlowTexture());
})();

export const Monitor: React.FC<MonitorProps> = ({ pos, rot = [0, 0, 0], sw, kind, seed, grey = 0, dark = 1, boost = 1.25, halo, haloOpacity = 0.3, body = P.cabinet, tag, badge, f, tex: texIn, aspect = 9 / 16, children }) => {
  const sh = sw * aspect;
  const bw = sw + 0.9 * (sw / 7);
  const bh = sh + 1.3 * (sw / 7);
  const depth = sw * 0.62;
  const grain = useSurfaceGrain(40 + seed, 0.16, 3);
  const res = useMemo(() => {
    const tex = texIn ?? thumbTexture(kind, seed, grey, dark);
    const crt = makeCrtMaterial(tex);
    crt.uniforms.uLines.value = 90;
    crt.uniforms.uLines.value = aspect > 1 ? 110 : 90;
    const geo = new THREE.PlaneGeometry(sw, sh, 24, 16);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (sw / 2), y = p.getY(i) / (sh / 2);
      p.setZ(i, sw * 0.03 * (1 - x * x) * (1 - y * y));
    }
    geo.computeVertexNormals();
    return { crt, geo };
  }, [kind, seed, grey, dark, sw, sh, texIn, aspect]);
  useLayoutEffect(() => {
    res.crt.uniforms.uTime.value = f / 60 + seed;
    res.crt.uniforms.uBoost.value = boost;
  });
  const u = sw / 7; // detail unit
  const front = depth / 2;
  return (
    <group position={pos} rotation={rot}>
      {/* cabinet shell: back part is a tapered tube */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <RoundedBoxGeo args={[bw, bh, depth]} radius={0.22 * u} segments={4} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={body} roughness={0.38} roughnessMap={grain} />
      </mesh>
      <mesh castShadow position={[0, 0.05 * u, -depth * 0.62]}>
        <RoundedBoxGeo args={[bw * 0.72, bh * 0.74, depth * 0.5]} radius={0.3 * u} segments={4} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={body} roughness={0.45} />
      </mesh>
      {/* recessed black bezel */}
      <mesh position={[0, 0.25 * u, front + 0.005]}>
        <planeGeometry args={[sw + 0.36 * u, sh + 0.34 * u]} />
        <meshStandardMaterial color={P.bezel} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh geometry={res.geo} material={res.crt} position={[0, 0.25 * u, front + 0.012]} />
      {/* glass sliver */}
      <mesh position={[-sw * 0.28, 0.25 * u + sh * 0.18, front + sw * 0.034]} rotation={[0, 0, 0.55]}>
        <planeGeometry args={[sw * 0.035, sh * 0.6]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      {/* control strip: knobs + power LED */}
      {[0.33, 0.43].map((x, i) => (
        <mesh key={x} position={[bw * x, -bh / 2 + 0.38 * u, front + 0.04 * u]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13 * u, 0.13 * u, 0.12 * u, 20]} />
          <meshStandardMaterial color={i ? "#2A2E44" : "#C8C8D0"} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[-bw * 0.4, -bh / 2 + 0.38 * u, front + 0.01 * u]}>
        <circleGeometry args={[0.07 * u, 16]} />
        <meshBasicMaterial color={dark > 0.7 ? P.phosphorGreen : "#5A1010"} toneMapped={false} />
      </mesh>
      {badge && (
        <mesh position={[-bw * 0.08, -bh / 2 + 0.36 * u, front + 0.01]}>
          <planeGeometry args={[2.0 * u, 0.375 * u]} />
          <meshBasicMaterial map={badgeTexture()} toneMapped={false} />
        </mesh>
      )}
      {tag && (
        <mesh position={[-bw * 0.06, -bh / 2 + 0.36 * u, front + 0.01]}>
          <planeGeometry args={[1.6 * u, 0.4 * u]} />
          <meshBasicMaterial map={tagTexture(tag.text, tag.color)} toneMapped={false} />
        </mesh>
      )}
      {halo && (
        <mesh position={[0, 0.25 * u, front + 0.2 * u]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
          <planeGeometry args={[sw * 1.9, sh * 2.3]} />
          <meshBasicMaterial map={glowTex()} color={halo} transparent opacity={haloOpacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {children}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// The wall of competing thumbnails. Lower rows are sinking into the water, tilted and grey.
export type WallItem = { pos: V3; rot: V3; sw: number; kind: ThumbKind; grey: number; dark: number; boost: number; halo?: string; tag?: { text: string; color: string }; sinkRate: number };

export const WALL: WallItem[] = (() => {
  const r = rng(4404);
  const kinds: ThumbKind[] = ["obby", "tycoon", "race", "tower", "pets", "obby", "race", "tycoon", "pets", "tower"];
  const items: WallItem[] = [];
  // back row (far, upper)
  const back: [number, number][] = [[-11, 9.2], [-4, 10.4], [3.4, 9.6], [10.6, 10.8], [-12.5, 2.6], [12.2, 3.4]];
  back.forEach(([x, y], i) => {
    items.push({ pos: [x, y, -16 - r() * 3], rot: [(r() - 0.5) * 0.1, (r() - 0.5) * 0.3, (r() - 0.5) * 0.12], sw: 5.4, kind: kinds[i], grey: 0.35, dark: 0.6, boost: 0.9, halo: [P.magenta, P.cyan, P.orange][i % 3], sinkRate: 0, });
  });
  // middle row: still colourful but dimmer, flanking the hero
  const mid: [number, number, ThumbKind][] = [[-7.6, 4.6, "tower"], [7.8, 5.2, "pets"], [-8.0, -0.6, "race"], [8.2, 0.2, "obby"]];
  mid.forEach(([x, y, k], i) => {
    items.push({ pos: [x, y, -7 - r() * 1.5], rot: [(r() - 0.5) * 0.08, x < 0 ? 0.32 : -0.32, (r() - 0.5) * 0.1], sw: 4.6, kind: k, grey: 0.3, dark: 0.8, boost: 0.95, halo: i % 2 ? P.cyan : P.magenta, sinkRate: 0 });
  });
  // sinking row: half under water, grey, tilted
  items.push({ pos: [-4.1, WATER_Y - 0.3, 4.6], rot: [-0.42, 0.42, 0.3], sw: 4.2, kind: "robux", grey: 0.8, dark: 0.55, boost: 0.6, tag: { text: "ROBUX!?", color: "#FF5A5A" }, sinkRate: 0.25 });
  items.push({ pos: [5.6, WATER_Y - 0.15, 4.0], rot: [-0.36, -0.46, -0.28], sw: 4.2, kind: "default", grey: 1, dark: 0.6, boost: 0.6, tag: { text: "DEFAULT", color: "#9AA0AA" }, sinkRate: 0.2 });
  items.push({ pos: [-12.5, WATER_Y + 0.2, -9.5], rot: [-0.4, 0.3, 0.32], sw: 4.6, kind: "pets", grey: 0.9, dark: 0.4, boost: 0.5, sinkRate: 0.15 });
  items.push({ pos: [13, WATER_Y - 0.2, -10.5], rot: [-0.3, -0.3, -0.36], sw: 4.6, kind: "tycoon", grey: 0.9, dark: 0.4, boost: 0.5, sinkRate: 0.15 });
  items.push({ pos: [0.6, WATER_Y - 0.4, -13], rot: [-0.45, 0.1, 0.18], sw: 5, kind: "race", grey: 0.9, dark: 0.35, boost: 0.45, sinkRate: 0.12 });
  return items;
})();

// Ripple rings around the sinking screens.
export const Ripples: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  const spots: V3[] = [[-4.1, WATER_Y + 0.02, 5.3], [5.6, WATER_Y + 0.02, 4.7], [-12.5, WATER_Y + 0.02, -8.8], [0.6, WATER_Y + 0.02, -12]];
  return (
    <>
      {spots.flatMap((s, i) =>
        [0, 1, 2].map((k) => {
          const ph = ((t * 0.5 + k / 3 + i * 0.21) % 1 + 1) % 1;
          return (
            <mesh key={`${i}-${k}`} position={s} rotation={[-Math.PI / 2, 0, 0]} scale={1 + ph * 3.2} onUpdate={(m) => m.layers.set(FX_LAYER)}>
              <ringGeometry args={[1, 1.06, 64]} />
              <meshBasicMaterial color={P.cyan} transparent opacity={0.35 * (1 - ph)} depthWrite={false} toneMapped={false} />
            </mesh>
          );
        }),
      )}
    </>
  );
};

// Air bubbles escaping from the sinking screens.
const BUBBLES = (() => {
  const r = rng(515);
  const src: V3[] = [[-4.1, WATER_Y, 4.9], [5.6, WATER_Y, 4.3]];
  return Array.from({ length: 22 }, (_, i) => {
    const s0 = src[i % 2];
    return { x: s0[0] + (r() - 0.5) * 3.2, z: s0[2] + (r() - 0.3) * 1.2, ph: r(), s: 0.06 + r() * 0.12, sp: 0.5 + r() * 0.6 };
  });
})();
export const Bubbles: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  return (
    <>
      {BUBBLES.map((b, i) => {
        const k = (b.ph + t * b.sp * 0.4) % 1;
        return (
          <mesh key={i} position={[b.x + Math.sin(t * 3 + i) * 0.08, WATER_Y + 0.05 + k * 1.6, b.z]} scale={b.s * (1 - k * 0.4)}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial color="#BFEFFF" roughness={0.05} clearcoat={1} transparent opacity={0.55 * (1 - k)} emissive="#2EF2FF" emissiveIntensity={0.3} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

// Pixel shards blasting out of the hero screen around the avatar.
const SHARDS = (() => {
  const r = rng(77);
  const cols = [P.cyan, P.magenta, P.yellow, P.phosphorGreen, P.white, "#7FB8FF"];
  return Array.from({ length: 34 }, (_, i) => {
    const a = r() * Math.PI * 2;
    const rad = 0.6 + r() * 3.4;
    return {
      base: [1.1 + Math.cos(a) * rad * 1.1, 0.4 + Math.sin(a) * rad * 0.7, 0.9 + r() * 3.2] as V3,
      dir: [Math.cos(a) * 0.6, Math.sin(a) * 0.4 + 0.1, 0.8 + r() * 0.6] as V3,
      s: 0.12 + r() * 0.26,
      spin: [r() * 6, r() * 6, r() * 6] as V3,
      col: cols[i % cols.length],
    };
  });
})();

export const Shards: React.FC<{ f: number; fade?: number }> = ({ f, fade = 1 }) => {
  const t = f / 60;
  if (fade <= 0.001) return null;
  return (
    <>
      {SHARDS.map((q, i) => (
        <mesh
          key={i}
          position={[q.base[0] + q.dir[0] * t * 0.5, q.base[1] + q.dir[1] * t * 0.5, q.base[2] + q.dir[2] * t * 0.5]}
          rotation={[q.spin[0] + t * 1.3, q.spin[1] + t, q.spin[2]]}
          scale={fade}
          castShadow
        >
          <RoundedBoxGeo args={[q.s, q.s, q.s * 0.35]} radius={q.s * 0.08} segments={2} />
          <meshPhysicalMaterial {...POLISH.glossyEye} color={q.col} emissive={q.col} emissiveIntensity={0.9} />
        </mesh>
      ))}
    </>
  );
};

// Hero: the one bright screen that wins the click. Sits on a dark plinth rising from the water.
export const HERO = { pos: [0, 0.6, 0] as V3, sw: 7.2 };

export const HERO_BOTTOM = HERO.pos[1] - ((HERO.sw * 9) / 16 + 1.3 * (HERO.sw / 7)) / 2;
export const Plinth: React.FC = () => {
  const grain = useSurfaceGrain(91, 0.2, 4);
  const bottom = WATER_Y - 1.5;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, (HERO_BOTTOM + bottom) / 2, -0.2]}>
        <RoundedBoxGeo args={[6.4, HERO_BOTTOM - bottom, 4.4]} radius={0.18} segments={3} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#0E1230" roughness={0.5} roughnessMap={grain} />
      </mesh>
      {/* neon trim on the plinth top edge */}
      <mesh position={[0, HERO_BOTTOM - 0.12, 2.03]}>
        <boxGeometry args={[6.3, 0.08, 0.05]} />
        <meshBasicMaterial color={P.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Avatar leaping out of the hero screen (cover pose). Turned 3/4 so both legs read apart. */
export const HOOK_AVATAR = { pos: [2.1, -0.9, 2.9] as V3, rot: [0.12, -0.95, 0.18] as V3, scale: 0.82, pose: "run" as const, fOffset: 29 };

export const HookWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  return (
    <>
      <CameraRig f={f} />
      <fog attach="fog" args={[BG, 26, 52]} />
      <ambientLight intensity={0.16} color="#B9B4FF" />
      <hemisphereLight args={["#3A2A7A", "#05040A", 0.35]} />
      {/* key on the avatar: front-left, soft white so the yellow skin reads */}
      <spotLight
        position={[-7, 9, 14]}
        intensity={260}
        angle={0.36}
        penumbra={0.8}
        decay={2}
        color="#FFF1DA"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />
      {/* hero screen spill (rim from behind the avatar) */}
      <pointLight position={[0.3, 1.0, 1.6]} color="#7FE8FF" intensity={40} distance={14} decay={2} />
      <pointLight position={[7, 3, 5]} color={P.magenta} intensity={60} distance={20} decay={2} />
      <pointLight position={[-8, -2, 3]} color={P.cyan} intensity={40} distance={18} decay={2} />

      {/* background + sinking wall */}
      {WALL.map((w, i) => (
        <Monitor
          key={i}
          f={f}
          pos={[w.pos[0], w.pos[1] - w.sinkRate * t, w.pos[2]]}
          rot={w.rot}
          sw={w.sw}
          kind={w.kind}
          seed={i + 3}
          grey={w.grey}
          dark={w.dark}
          boost={w.boost}
          halo={w.halo}
          haloOpacity={0.14}
          body={w.grey > 0.7 ? "#1A1C26" : P.cabinet}
          tag={w.tag}
        />
      ))}

      {/* hero screen */}
      <Monitor f={f} pos={HERO.pos} sw={HERO.sw} kind="hero" seed={1} boost={1.35} halo={P.cyan} haloOpacity={0.32} body="#1B2350" badge />
      <Plinth />

      {/* the avatar leaping out of the screen */}
      <BlockAvatar
        f={f + HOOK_AVATAR.fOffset}
        pose={HOOK_AVATAR.pose}
        seed={0}
        position={HOOK_AVATAR.pos}
        rotation={HOOK_AVATAR.rot}
        scale={HOOK_AVATAR.scale}
        torsoEmissive={P.cyan}
      />
      <Shards f={f} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <MeshReflectorMaterial
          color="#07102A"
          mirror={1}
          blur={[120, 40]}
          resolution={1024}
          mixBlur={0.5}
          mixStrength={9}
          roughness={0.35}
          metalness={0.5}
          depthScale={0}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
        />
      </mesh>
      <Ripples f={f} />
      <Bubbles f={f} />

      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao />
    </>
  );
};
