// EP03 hook world (ISOCRAFT): the "60-second discovery machine".
// An isometric see-through machine with ink outlines. A conveyor feeds blocky players into a glass
// chamber that holds a mini game map; a big 60-second dial ticks on top. The hero avatar sprints toward
// the glowing SERU zone, whose chute lifts players up to the REKOMENDASI sign; a player who quits early
// drops through the trapdoor under the red "KELUAR < 60 DTK" tag. Front plate: AUDIRA nameplate +
// play-days lamps (D1, D2–7, D8–28).
// Driven by the 60 fps film clock `f` (t = f / 60). Cover = t 0.3 s.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { BlockAvatar, type AvatarPose } from "../_shared/BlockAvatar.tsx";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette";
import { bounceTexture, dialTexture, floorTexture, grassTexture, plateTexture, recoTexture, seruTexture } from "./coverTextures.ts";

type V3 = [number, number, number];

/** Camera start pose: the cover framing and the first frame of the film's hook. */
export const COVER_CAMERA = {
  position: [14.0, 15.0, 32.0] as V3,
  target: [0.4, 3.4, 0] as V3,
  fov: 29,
};

export const HOOK_BG = P.paperWarm;
export { Ink, Box, Print, noInk };

// ---------- ink: inverted-hull outline added to every mesh in a subtree ----------
const hullMats = new Map<number, THREE.MeshBasicMaterial>();
function hullMaterial(thick: number) {
  const k = Math.round(thick * 10000);
  const hit = hullMats.get(k);
  if (hit) return hit;
  const m = new THREE.MeshBasicMaterial({ color: P.inkBlack, side: THREE.BackSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uThick = { value: thick };
    s.vertexShader = s.vertexShader
      .replace("void main() {", "uniform float uThick;\nvoid main() {")
      .replace("#include <begin_vertex>", "vec3 transformed = vec3( position ) + normalize( normal ) * uThick;");
  };
  m.customProgramCacheKey = () => `ink-${k}`;
  hullMats.set(k, m);
  return m;
}

/** Wrap a subtree: each mesh gets an ink hull (skip with userData.noInk). Thickness in local units. */
const Ink: React.FC<{ thick?: number; children: React.ReactNode }> = ({ thick = 0.03, children }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    const added: THREE.Mesh[] = [];
    const meshes: THREE.Mesh[] = [];
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !m.userData.noInk && !m.userData.isHull && !m.children.some((c) => c.userData.isHull)) meshes.push(m);
    });
    for (const m of meshes) {
      const h = new THREE.Mesh(undefined, hullMaterial(thick));
      // share the live geometry (R3F may attach the real geometry after this effect runs)
      Object.defineProperty(h, "geometry", { get: () => m.geometry, set: () => {}, configurable: true });
      h.userData.isHull = true;
      h.raycast = () => null;
      m.add(h);
      added.push(h);
    }
    return () => added.forEach((h) => h.parent?.remove(h));
  }, [thick]);
  return <group ref={ref}>{children}</group>;
};

/** Scale a part in/out around a pivot (film mode hides props that are not the beat's subject). */
const Pop: React.FC<{ v?: number; at: V3; children: React.ReactNode }> = ({ v = 1, at, children }) => (
  <group position={at} scale={Math.max(v, 0.0001)} visible={v > 0.001}>
    <group position={[-at[0], -at[1], -at[2]]}>{children}</group>
  </group>
);

const noInk = (o: THREE.Object3D) => {
  o.userData.noInk = true;
};

// ---------- small parts ----------
const Box: React.FC<{ size: V3; pos: V3; color: string; rot?: V3; r?: number; emissive?: string; ei?: number; mat?: keyof typeof POLISH; grain?: THREE.Texture }> = ({
  size, pos, color, rot, r, emissive, ei = 0, mat = "toyPlastic", grain,
}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={r ?? Math.min(...size) * 0.14} segments={3} />
    <meshPhysicalMaterial {...POLISH[mat]} color={color} emissive={emissive ?? "#000"} emissiveIntensity={ei} roughnessMap={grain} />
  </mesh>
);

/** Printed face plane (texture) placed just in front of a surface. */
const Print: React.FC<{ tex: THREE.Texture; size: [number, number]; pos: V3; rot?: V3; glow?: number }> = ({ tex, size, pos, rot, glow = 0 }) => (
  <mesh position={pos} rotation={rot} onUpdate={noInk}>
    <planeGeometry args={size} />
    <meshStandardMaterial map={tex} roughness={0.7} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={glow} polygonOffset polygonOffsetFactor={-2} />
  </mesh>
);

// ---------- machine dimensions ----------
const W = 6.2; // chamber width (x)
const D = 4.6; // chamber depth (z)
const H = 3.5; // glass wall height
const BASE_H = 1.1; // base slab height (ground y = -BASE_H)
const X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;
// trapdoor hole (front-left)
const HX0 = -1.75, HX1 = -0.55, HZ0 = 0.75, HZ1 = 1.95;
export const MACHINE = { W, D, H, BASE_H, X0, X1, Z0, Z1, HX0, HX1, HZ0, HZ1 };

const Base: React.FC<{ grain: THREE.Texture }> = ({ grain }) => {
  const y = -BASE_H / 2;
  const c = P.metalSteel;
  return (
    <group>
      <Box size={[HX0 - X0, BASE_H, D]} pos={[(X0 + HX0) / 2, y, 0]} color={c} r={0.08} grain={grain} />
      <Box size={[X1 - HX1, BASE_H, D]} pos={[(HX1 + X1) / 2, y, 0]} color={c} r={0.08} grain={grain} />
      <Box size={[HX1 - HX0, BASE_H, HZ0 - Z0]} pos={[(HX0 + HX1) / 2, y, (Z0 + HZ0) / 2]} color={c} r={0.06} grain={grain} />
      <Box size={[HX1 - HX0, BASE_H, Z1 - HZ1]} pos={[(HX0 + HX1) / 2, y, (HZ1 + Z1) / 2]} color={c} r={0.06} grain={grain} />
      {/* coral trim band */}
      <Box size={[W + 0.12, 0.16, D + 0.12]} pos={[0, -BASE_H + 0.1, 0]} color={P.bodyCoral} r={0.06} />
      {/* front plate: AUDIRA nameplate + play-days lamps */}
      <Print tex={plateTexture()} size={[W - 0.3, (W - 0.3) * (288 / 2048)]} pos={[0.0, -0.5, Z1 + 0.012]} glow={0.08} />
      {/* dark shaft inside the hole */}
      <mesh position={[(HX0 + HX1) / 2, -BASE_H / 2, (HZ0 + HZ1) / 2]} onUpdate={noInk}>
        <boxGeometry args={[HX1 - HX0 - 0.02, BASE_H - 0.02, HZ1 - HZ0 - 0.02]} />
        <meshBasicMaterial color="#14161A" side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

/** Mini game map on the chamber floor. */
const MapFloor: React.FC<{ f: number; grain: THREE.Texture }> = ({ f, grain }) => {
  const grass = grassTexture();
  const t = f / 60;
  const tiles: { x: number; z: number }[] = [];
  // grass tiles in a 6×4 grid minus the hole
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      const x = X0 + 0.1 + (i + 0.5) * ((W - 0.2) / 6);
      const z = Z0 + 0.1 + (j + 0.5) * ((D - 0.2) / 4);
      if (x > HX0 - 0.2 && x < HX1 + 0.2 && z > HZ0 - 0.2 && z < HZ1 + 0.3) continue;
      tiles.push({ x, z });
    }
  }
  const tw = (W - 0.2) / 6 - 0.04, td = (D - 0.2) / 4 - 0.04;
  // trapdoor flap hinged at the back edge, swung down
  const flap = 1.25 + Math.sin(t * 3) * 0.05;
  return (
    <group>
      {tiles.map((p, k) => (
        <group key={k}>
          <mesh position={[p.x, 0.09, p.z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[tw, 0.18, td]} radius={0.05} segments={2} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#7DBB6A" roughnessMap={grain} />
          </mesh>
          <mesh position={[p.x, 0.182, p.z]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={noInk} receiveShadow>
            <planeGeometry args={[tw - 0.06, td - 0.06]} />
            <meshStandardMaterial map={grass} roughness={0.8} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
        </group>
      ))}
      {/* trapdoor rim + flap */}
      <Box size={[HX1 - HX0 + 0.16, 0.12, 0.12]} pos={[(HX0 + HX1) / 2, 0.06, HZ0 - 0.04]} color={P.inkBlack} r={0.03} />
      <group position={[(HX0 + HX1) / 2, 0.05, HZ0]} rotation={[flap, 0, 0]}>
        <Box size={[HX1 - HX0 - 0.06, 0.1, HZ1 - HZ0 - 0.06]} pos={[0, 0, (HZ1 - HZ0) / 2]} color="#D8432E" r={0.03} />
      </group>
      {/* spawn pad (back-left) */}
      <mesh position={[-2.05, 0.24, -1.35]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.68, 0.14, 40]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#4F8FD8" emissive="#4F8FD8" emissiveIntensity={0.15} />
      </mesh>
      {/* stepping path: grey stud blocks from spawn toward the fun zone */}
      {[
        [-1.0, -0.9], [-0.1, -0.55], [0.7, -0.15],
      ].map(([x, z], k) => (
        <Box key={k} size={[0.62, 0.16, 0.62]} pos={[x, 0.26, z]} color="#C9CFD6" r={0.05} grain={grain} />
      ))}
      {/* obstacles / props: coral tower, block tree */}
      <Box size={[0.7, 1.3, 0.7]} pos={[-0.35, 0.83, -1.55]} color={P.bodyCoral} r={0.08} grain={grain} />
      <Box size={[0.7, 0.55, 0.7]} pos={[-0.35, 1.76, -1.55]} color={P.accentYellow} r={0.08} grain={grain} />
      <Box size={[0.26, 0.9, 0.26]} pos={[0.95, 0.63, -1.6]} color="#8A5A3C" r={0.05} />
      <Box size={[1.0, 0.9, 1.0]} pos={[0.95, 1.4, -1.6]} color={P.bodyMint} r={0.14} grain={grain} />
      <Box size={[0.66, 0.5, 0.66]} pos={[0.95, 2.05, -1.6]} color="#7FC3A2" r={0.12} grain={grain} />
    </group>
  );
};

/** Fun zone: glowing yellow pad, treasure chest, SERU pennant; the chute starts here. */
const FunZone: React.FC<{ f: number; grain: THREE.Texture; v?: number }> = ({ f, grain, v }) => {
  const t = f / 60;
  const pulse = 0.55 + 0.25 * Math.sin(t * 6);
  return (
    <group position={[1.85, 0, 0.95]}>
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.12, 0.18, 48]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.accentYellow} emissive={P.accentYellow} emissiveIntensity={pulse} />
      </mesh>
      {/* chest */}
      <Box size={[0.8, 0.5, 0.55]} pos={[0.35, 0.6, -0.35]} color="#B5652E" r={0.06} grain={grain} />
      <Box size={[0.84, 0.22, 0.59]} pos={[0.35, 0.95, -0.35]} color="#D88A3A" r={0.08} />
      <Box size={[0.16, 0.2, 0.06]} pos={[0.35, 0.72, -0.06]} color={P.accentYellow} r={0.03} emissive={P.accentYellow} ei={0.6} />
      {/* pennant SERU! on a pole */}
      <Pop v={v} at={[-0.3, 0.35, -0.8]}>
      <Box size={[0.1, 2.3, 0.1]} pos={[-0.3, 1.5, -0.8]} color={P.inkBlack} r={0.04} />
      <group position={[-0.3 + 0.62, 2.35, -0.8]} rotation={[0, -0.1 + Math.sin(t * 4) * 0.06, 0]}>
        <Box size={[1.25, 0.64, 0.05]} pos={[0, 0, 0]} color={P.accentYellow} r={0.02} />
        <Print tex={seruTexture()} size={[1.2, 0.6]} pos={[0, 0, 0.03]} glow={0.15} />
      </group>
      </Pop>
    </group>
  );
};

/** Glowing chute from the fun zone up to the REKOMENDASI sign, with a rider going up. */
const Chute: React.FC<{ f: number; grain: THREE.Texture; v?: number }> = ({ f, grain, v }) => {
  const t = f / 60;
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.3, 0.4, 0.75),
        new THREE.Vector3(3.3, 0.9, 0.55),
        new THREE.Vector3(3.95, 2.6, 0.2),
        new THREE.Vector3(3.9, 4.7, -0.4),
        new THREE.Vector3(3.35, 5.9, -1.1),
      ]),
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.5, 28, false), [curve]);
  const core = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.12, 12, false), [curve]);
  const ribs = useMemo(() => [0.18, 0.36, 0.54, 0.72, 0.9].map((u) => ({ p: curve.getPointAt(u), tg: curve.getTangentAt(u) })), [curve]);
  const u = 0.52 + ((t * 0.12) % 0.3);
  const rp = curve.getPointAt(u);
  return (
    <group>
      {/* glass tube */}
      <mesh geometry={tube} onUpdate={noInk}>
        <meshPhysicalMaterial color="#BFF5DD" transparent opacity={0.3} roughness={0.08} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* glowing core line */}
      <mesh geometry={core} onUpdate={noInk}>
        <meshBasicMaterial color="#9CFFD0" toneMapped={false} transparent opacity={0.85} />
      </mesh>
      {/* ink ribs */}
      {ribs.map((r, k) => (
        <mesh key={k} position={r.p} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), r.tg)} castShadow>
          <torusGeometry args={[0.52, 0.06, 10, 40]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.bodyMint} />
        </mesh>
      ))}
      {/* rider: a player lifted to the recommendation (cheer) */}
      <Ink thick={0.2941}><BlockAvatar f={f} pose="cheer" seed={4} position={[rp.x, rp.y - 0.5, rp.z]} rotation={[0, 0.6, 0]} scale={0.17} grain={grain} colors={{ torso: P.bodyCoral, legs: "#3C4A6B" }} /></Ink>
      {/* REKOMENDASI sign at the top */}
      <Pop v={v} at={[3.35, 5.9, -1.1]}>
      <group position={[2.35, 6.75, -1.3]} rotation={[0, 0.42, 0]}>
        <Box size={[3.25, 1.3, 0.22]} pos={[0, 0, 0]} color={P.bodyMint} r={0.08} />
        <Print tex={recoTexture()} size={[3.1, 3.1 * (384 / 1024)]} pos={[0, 0, 0.115]} glow={0.22} />
        {/* support arm to the tube end */}
        <Box size={[0.14, 1.2, 0.14]} pos={[1.15, -1.1, 0]} color={P.inkBlack} r={0.04} />
      </group>
      {/* sparkles around the sign (deterministic) */}
      {[[0.6, 8.1, -0.9], [3.9, 7.9, -0.6], [4.4, 6.0, -0.3]].map((p, k) => {
        const s = 0.16 + 0.06 * Math.sin(t * 5 + k * 1.7);
        return (
          <mesh key={k} position={p as V3} rotation={[0, 0.42, Math.PI / 4 + t * 0.6 * (k % 2 ? 1 : -1)]} scale={[s, s, s]} onUpdate={noInk}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={P.accentYellow} toneMapped={false} />
          </mesh>
        );
      })}
      </Pop>
    </group>
  );
};

/** Glass chamber: back + left glass walls, ink frame, opening for the conveyor. */
const Chamber: React.FC = () => {
  const post = (x: number, z: number, k: string) => <Box key={k} size={[0.2, H, 0.2]} pos={[x, H / 2, z]} color={P.inkBlack} r={0.05} />;
  return (
    <group>
      {post(X0, Z0, "a")}
      {post(X1, Z0, "b")}
      {post(X0, 0.2, "c")}
      <Box size={[W, 0.2, 0.2]} pos={[0, H, Z0]} color={P.inkBlack} r={0.05} />
      <Box size={[0.2, 0.2, 0.2 - Z0]} pos={[X0, H, (Z0 + 0.2) / 2]} color={P.inkBlack} r={0.05} />
      {/* glass panes */}
      <mesh position={[0, H / 2, Z0]} onUpdate={noInk}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial color="#D9ECF7" transparent opacity={0.22} roughness={0.05} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[X0, H / 2 + 0.9, (Z0 + 0.2) / 2]} rotation={[0, Math.PI / 2, 0]} onUpdate={noInk}>
        <planeGeometry args={[0.2 - Z0, H - 1.8]} />
        <meshPhysicalMaterial color="#D9ECF7" transparent opacity={0.22} roughness={0.05} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* glass glints */}
      {[[-1.6, 2.6], [1.2, 2.2]].map(([x, y], k) => (
        <mesh key={k} position={[x, y, Z0 + 0.01]} rotation={[0, 0, 0.6]} onUpdate={noInk}>
          <planeGeometry args={[0.14, 1.6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.45} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Big 60-second dial on top of the back wall: elapsed wedge + needle animate. */
const Timer: React.FC<{ f: number; el?: number; v?: number }> = ({ f, el, v }) => {
  const t = f / 60;
  const elapsed = el ?? 0.74 + t * 0.012; // fraction of 60 s already gone (urgency)
  const R = 1.55;
  return (
    <Pop v={v} at={[-1.25, H, Z0]}>
    <group position={[-1.25, H + 1.95, Z0 + 0.1]} rotation={[0, 0.42, 0]}>
      {/* stand */}
      <Box size={[0.36, 0.9, 0.36]} pos={[0, -1.55, -0.05]} color={P.inkBlack} r={0.06} />
      {/* casing */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.12]} castShadow>
        <cylinderGeometry args={[R + 0.22, R + 0.22, 0.34, 64]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.accentYellow} />
      </mesh>
      {/* bell + buttons on top */}
      <Box size={[0.42, 0.3, 0.3]} pos={[0, R + 0.32, -0.12]} color={P.bodyCoral} r={0.08} />
      <Box size={[0.22, 0.2, 0.22]} pos={[-0.95, R - 0.05, -0.12]} rot={[0, 0, 0.6]} color={P.bodyCoral} r={0.05} />
      <Box size={[0.22, 0.2, 0.22]} pos={[0.95, R - 0.05, -0.12]} rot={[0, 0, -0.6]} color={P.bodyCoral} r={0.05} />
      {/* face */}
      <mesh position={[0, 0, 0.06]} onUpdate={noInk}>
        <circleGeometry args={[R, 72]} />
        <meshStandardMaterial map={dialTexture()} roughness={0.6} emissive="#ffffff" emissiveMap={dialTexture()} emissiveIntensity={0.12} />
      </mesh>
      {/* elapsed wedge (coral, translucent so ticks read) */}
      <mesh position={[0, 0, 0.07]} rotation={[0, 0, Math.PI / 2 - elapsed * Math.PI * 2]} onUpdate={noInk}>
        <circleGeometry args={[R * 0.96, 72, 0, elapsed * Math.PI * 2]} />
        <meshBasicMaterial color={P.bodyCoral} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {/* needle */}
      <group position={[0, 0, 0.1]} rotation={[0, 0, -elapsed * Math.PI * 2]}>
        <mesh position={[0, R * 0.42, 0]} onUpdate={noInk}>
          <boxGeometry args={[0.1, R * 0.95, 0.04]} />
          <meshBasicMaterial color={P.inkBlack} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.12]} onUpdate={noInk}>
        <circleGeometry args={[0.14, 24]} />
        <meshBasicMaterial color={P.bodyCoral} />
      </mesh>
    </group>
    </Pop>
  );
};

/** Conveyor feeding new players into the chamber through the left wall. */
const Conveyor: React.FC<{ f: number; grain: THREE.Texture; film?: boolean }> = ({ f, grain, film }) => {
  const t = f / 60;
  const z = -1.35;
  const xa = -5.0, xb = X0 + 0.2;
  const len = xb - xa;
  const off = (t * 0.6) % 0.5;
  return (
    <group>
      <Box size={[len, 0.28, 1.2]} pos={[(xa + xb) / 2, 0.06, z]} color="#3B3F46" r={0.1} />
      {/* belt slats (moving) */}
      {Array.from({ length: 7 }, (_, k) => {
        const x = xa + 0.2 + ((k * 0.5 + off) % (len - 0.3));
        return <Box key={k} size={[0.08, 0.04, 1.1]} pos={[x, 0.22, z]} color={P.accentYellow} r={0.015} />;
      })}
      {/* legs */}
      {[xa + 0.3, xb - 0.6].map((x, k) => (
        <Box key={k} size={[0.22, BASE_H, 0.22]} pos={[x, -BASE_H / 2 - 0.05, z + 0.35]} color={P.inkBlack} r={0.05} />
      ))}
      {/* queued players walking in */}
      {film ? (
        STREAM.map((c, k) => {
          // endless stream: 4 players spaced 0.9 apart, popping in at the belt start, hidden at the wall door
          const x = xa + 0.25 + ((k * 0.9 + t * 0.4) % 3.6);
          return (
            <group key={k} visible={x < X0 - 0.15}>
              <Ink thick={0.1852}><BlockAvatar f={f + k * 11} pose={k % 2 ? "stand" : "run"} seed={2 + k} position={[x, 0.22, z]} rotation={[0, Math.PI / 2, 0]} scale={0.27} grain={grain} colors={c} /></Ink>
            </group>
          );
        })
      ) : (<>
      <Ink thick={0.1852}><BlockAvatar f={f} pose="run" seed={2} position={[-4.35 + t * 0.4, 0.22, z]} rotation={[0, Math.PI / 2, 0]} scale={0.27} grain={grain} colors={{ torso: "#8E6BD8", legs: "#2E3A55" }} /></Ink>
      <Ink thick={0.1852}><BlockAvatar f={f} pose="stand" seed={3} position={[-3.35 + t * 0.4, 0.22, z]} rotation={[0, Math.PI / 2 - 0.2, 0]} scale={0.27} grain={grain} colors={{ torso: "#E8873A", legs: "#2E3A55", skin: "#E0B48A" }} /></Ink>
      </>)}
    </group>
  );
};

/** Early quitter dropping through the trapdoor + the red KELUAR tag. */
const Bounce: React.FC<{ f: number; grain: THREE.Texture; fallY?: number; v?: number }> = ({ f, grain, fallY, v }) => {
  const t = f / 60;
  const cx = (HX0 + HX1) / 2, cz = (HZ0 + HZ1) / 2;
  return (
    <group>
      <Ink thick={0.1852}><BlockAvatar f={f} pose="jump" seed={5} position={[cx + 0.05, fallY ?? -0.85 - t * 0.6, cz + 0.05]} rotation={[0.25, 0.5, 0.35]} scale={0.27} grain={grain} colors={{ torso: "#6FA7C9", legs: "#4A4A52" }} /></Ink>
      {/* red tag on a post */}
      <Pop v={v} at={[X0 - 0.15, 0, HZ1 + 0.35]}>
      <Box size={[0.1, 1.0, 0.1]} pos={[X0 - 0.15, 0.5, HZ1 + 0.35]} color={P.inkBlack} r={0.04} />
      <group position={[X0 + 0.45, 1.0, HZ1 + 0.4]} rotation={[0, 0.42, -0.06]}>
        <Box size={[1.5, 0.86, 0.06]} pos={[0, 0, 0]} color="#D8432E" r={0.03} />
        <Print tex={bounceTexture()} size={[1.44, 0.81]} pos={[0, 0, 0.035]} glow={0.1} />
      </group>
      </Pop>
      {/* down arrow into the hole */}
      <mesh position={[cx, 1.05 + Math.sin(t * 6) * 0.06, cz]} rotation={[Math.PI, 0.42, 0]} castShadow>
        <coneGeometry args={[0.28, 0.45, 4]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#D8432E" />
      </mesh>
    </group>
  );
};

const STREAM = [
  { torso: "#8E6BD8", legs: "#2E3A55" },
  { torso: "#E8873A", legs: "#2E3A55", skin: "#E0B48A" },
  { torso: "#3FA7A0", legs: "#4A4A52" },
  { torso: "#D85A8A", legs: "#2E3A55", skin: "#C98B5E" },
];

// ---------- camera ----------
export const HookCamera: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    const c = camera as THREE.PerspectiveCamera;
    const [px, py, pz] = COVER_CAMERA.position;
    // slow push-in from the cover pose (cover at t = 0.3 s is almost exactly COVER_CAMERA)
    const k = Math.max(0, t - 0.3) * 0.18;
    c.position.set(px - k * 0.9, py - k * 0.5, pz - k * 1.6);
    c.fov = COVER_CAMERA.fov;
    c.lookAt(...COVER_CAMERA.target);
    c.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

/** The hook world (lights included, no Finish, no camera). */
/** Film-mode overrides (the cover renders with none of these). */
export type HookFilm = {
  hero: { pos: V3; rot: number; pose: AvatarPose; scale: number };
  timer: number;
  fallY: number;
  /** 0..1 scale of the side signs (timer, REKOMENDASI sign, KELUAR tag, SERU pennant). */
  vis?: { timer: number; reco: number; keluar: number; seru: number };
};

export const HookWorld: React.FC<{ f: number; film?: HookFilm; children?: React.ReactNode }> = ({ f, film, children }) => {
  const grain = useSurfaceGrain(31, 0.2, 3);
  const t = f / 60;
  return (
    <>
      <ambientLight intensity={0.85} color="#FFF6EA" />
      <hemisphereLight args={["#FFF4E2", "#9CB2C8", 0.7]} />
      <directionalLight
        position={[-7, 14, 10]}
        intensity={2.4}
        color="#FFF1DC"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={12}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[9, 6, -6]} intensity={0.8} color="#BFD8F0" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BASE_H, 0]} receiveShadow onUpdate={noInk}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={floorTexture()} roughness={0.95} />
      </mesh>
      {/* flat iso shadow plate (kit look) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, -BASE_H + 0.004, -0.7]} onUpdate={noInk}>
        <planeGeometry args={[W + 1.6, D + 1.2]} />
        <meshBasicMaterial color={P.shadowBlue} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <GroundShadow y={-BASE_H + 0.006} scale={13} opacity={0.5} blur={2.2} far={3} color="#2A3A4C" />

      <Ink thick={0.065}>
        <Base grain={grain} />
        <MapFloor f={f} grain={grain} />
        <FunZone f={f} grain={grain} v={film?.vis?.seru} />
        <Chamber />
        <Timer f={f} el={film?.timer} v={film?.vis?.timer} />
        <Conveyor f={f} grain={grain} film={!!film} />
        <Chute f={f} grain={grain} v={film?.vis?.reco} />
        <Bounce f={f} grain={grain} fallY={film?.fallY} v={film?.vis?.keluar} />
        {/* hero: sprinting from spawn toward the fun zone */}
        {film ? (
          <Ink thick={0.1}><BlockAvatar f={f + 7} pose={film.hero.pose} seed={1} position={film.hero.pos} rotation={[0, film.hero.rot, 0]} scale={film.hero.scale} grain={grain} /></Ink>
        ) : (
          <Ink thick={0.1}><BlockAvatar f={f + 7} pose="run" seed={1} position={[0.15 + t * 0.35, 0.18, 0.35]} rotation={[0, 1.05, 0]} scale={0.5} grain={grain} /></Ink>
        )}
        {children}
      </Ink>
    </>
  );
};
