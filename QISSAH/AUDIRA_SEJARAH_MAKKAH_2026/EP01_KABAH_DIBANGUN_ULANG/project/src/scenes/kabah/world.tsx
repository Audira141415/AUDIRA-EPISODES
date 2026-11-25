// The one continuous world: the mataf stage with today's Ka'bah at the origin, the era ring of
// small vignettes from the cover, and eight era stations on a wide circle around it. The camera
// travels between them; fog fades the endless floor into the backdrop (no set edge in 16:9).

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { Box, C, HijrWall, KabahModel, Plaque, TEX, type V3, mix, ramp } from "./core.tsx";

// ---------------------------------------------------------------- stations
export const STATION_R = 36;
const STATION_DEG = { ibrahim: 200, quraisy: 244, zubair: 288, hajjaj: 332, kufah: 16, rebuild: 64, ghost: 110, lineup: 155 } as const;
export type Station = keyof typeof STATION_DEG | "main";

const frame = (s: Station) => {
  if (s === "main") return { x: 0, z: 0, rot: 0 };
  const a = (STATION_DEG[s] * Math.PI) / 180;
  return { x: Math.sin(a) * STATION_R, z: Math.cos(a) * STATION_R, rot: a + Math.PI };
};
/** Station-local point to world. Local +z faces the main stage. */
export const L = (s: Station, v: V3): V3 => {
  const f = frame(s);
  const c = Math.cos(f.rot), sn = Math.sin(f.rot);
  return [f.x + v[0] * c + v[2] * sn, v[1], f.z - v[0] * sn + v[2] * c];
};
export const At: React.FC<{ s: Station; children: React.ReactNode }> = ({ s, children }) => {
  const f = frame(s);
  return (
    <group position={[f.x, 0, f.z]} rotation={[0, f.rot, 0]}>
      {children}
    </group>
  );
};

// ---------------------------------------------------------------- backdrop, floor, lights
export const Backdrop: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uFog: { value: new THREE.Color(C.fog) }, uTop: { value: new THREE.Color("#f3eee5") } },
        vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uFog; uniform vec3 uTop; varying vec3 vD; void main(){
          vec3 c = mix(uFog, uTop, smoothstep(0.02, 0.55, vD.y));
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      }),
    [],
  );
  const { camera } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    ref.current!.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} material={mat} renderOrder={-1}>
      <sphereGeometry args={[900, 48, 24]} />
    </mesh>
  );
};

/** Key light that follows the camera target so every station gets crisp contact shadows. */
export const Lights: React.FC<{ target: V3; night?: number; haze?: number }> = ({ target, night = 0, haze = 0 }) => {
  const key = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  useLayoutEffect(() => {
    const l = key.current!;
    l.position.set(target[0] - 13, 22, target[2] + 14);
    l.target.position.set(target[0], 0, target[2]);
    l.target.updateMatrixWorld();
    if (!l.target.parent) scene.add(l.target);
  });
  const keyCol = new THREE.Color("#fff0da").lerp(new THREE.Color("#9fb4d8"), night).lerp(new THREE.Color("#ffc58a"), haze);
  return (
    <>
      <hemisphereLight args={[new THREE.Color("#fff6e8").lerp(new THREE.Color("#7d8fb3"), night), new THREE.Color("#cbb99c").lerp(new THREE.Color("#4b4f62"), night), mix(0.95, 0.5, night)]} />
      <directionalLight
        ref={key}
        intensity={mix(2.3, 0.7, night)}
        color={keyCol}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      <directionalLight position={[target[0] + 14, 9, target[2] - 16]} intensity={0.9} color="#e3f1ff" />
    </>
  );
};

export const Floor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
    <circleGeometry args={[1400, 96]} />
    <meshStandardMaterial color={C.floor} roughness={0.95} />
  </mesh>
);

/** Faint brass paths on the floor from the mataf to every station: the "time roads" the camera follows. */
export const Paths: React.FC = () => (
  <group>
    {Object.keys(STATION_DEG).map((k) => {
      const a = (STATION_DEG[k as keyof typeof STATION_DEG] * Math.PI) / 180;
      const len = STATION_R - 13.4 - 7;
      const mid = 13.4 + len / 2;
      return (
        <mesh key={k} position={[Math.sin(a) * mid, -0.615, Math.cos(a) * mid]} rotation={[-Math.PI / 2, 0, -a]}>
          <planeGeometry args={[0.06, len]} />
          <meshBasicMaterial color={C.brass} transparent opacity={0.6} />
        </mesh>
      );
    })}
  </group>
);

// ---------------------------------------------------------------- main stage (cover scene)
const RING_R = 10.9;

const MainPlinth: React.FC<{ ringGlow: number; ticksLit: number }> = ({ ringGlow, ticksLit }) => {
  const mataf = TEX.mataf();
  const grain = useSurfaceGrain(9, 0.2, 6);
  const ringGeo = useMemo(() => {
    const pts = [new THREE.Vector2(8.7, -0.62), new THREE.Vector2(13.4, -0.62), new THREE.Vector2(13.4, -0.24), new THREE.Vector2(8.7, -0.24), new THREE.Vector2(8.7, -0.62)];
    return new THREE.LatheGeometry(pts, 160);
  }, []);
  const ticks = useMemo(() => Array.from({ length: 72 }, (_, i) => (i / 72) * Math.PI * 2), []);
  // eight chapter markers on the ring, pointing to the stations
  const marks = useMemo(() => Object.values(STATION_DEG).map((d) => (d * Math.PI) / 180), []);
  return (
    <group>
      <mesh position={[0, -0.31, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8.3, 8.4, 0.62, 160]} />
        <meshPhysicalMaterial color={C.marble} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <circleGeometry args={[8.3, 160]} />
        <meshPhysicalMaterial map={mataf} color="#ffffff" roughness={0.3} clearcoat={0.35} clearcoatRoughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} castShadow>
        <torusGeometry args={[8.18, 0.07, 16, 220]} />
        <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[7.55, 7.62, 200]} />
        <meshBasicMaterial color={C.warmGlow} toneMapped={false} transparent opacity={0.5 + 0.5 * ringGlow} />
      </mesh>
      <mesh geometry={ringGeo} castShadow receiveShadow>
        <meshPhysicalMaterial color={C.travertine} roughness={0.82} roughnessMap={grain} side={THREE.DoubleSide} />
      </mesh>
      {ticks.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 13.0, -0.235, Math.cos(a) * 13.0]} rotation={[0, a, 0]} receiveShadow>
          <boxGeometry args={[0.035, 0.012, i % 6 === 0 ? 0.6 : 0.28]} />
          <meshStandardMaterial color={i % 6 === 0 ? C.brass : "#a89273"} metalness={i % 6 === 0 ? 0.8 : 0} roughness={0.5} />
        </mesh>
      ))}
      {marks.map((a, i) => (
        <mesh key={`m${i}`} position={[Math.sin(a) * 13.0, -0.228, Math.cos(a) * 13.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 24]} />
          <meshBasicMaterial color={C.warmGlow} toneMapped={false} transparent opacity={0.25 + 0.75 * ramp(ticksLit, i, i + 1)} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.24, 0]}>
        <torusGeometry args={[13.38, 0.05, 12, 220]} />
        <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** Tawaf crowd as points only: cream dots in a band, turning counter-clockwise. */
export const Crowd: React.FC<{ t: number; density?: number; dim?: number }> = ({ t, density = 1, dim = 0 }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 900;
  const pts = useMemo(() => {
    const rnd = prng(73);
    return Array.from({ length: N }, () => {
      const r = 2.75 + Math.pow(rnd(), 1.6) * 2.6;
      return { r, a: rnd() * Math.PI * 2, k: 0.038 + rnd() * 0.012, sp: 0.1 + rnd() * 0.05, c: rnd() < 0.85 ? "#fbf8f2" : "#e2d6c2", cut: rnd() };
    });
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    pts.forEach((p, i) => {
      const a = p.a + t * p.sp;
      const x = Math.sin(a) * p.r * 1.08, z = Math.cos(a) * p.r;
      const hidden = p.cut > density || (x > 1.75 && x < 4.6 && Math.abs(z) < 2.0);
      if (hidden) m.makeScale(0, 0, 0);
      else m.makeScale(p.k, p.k * 1.25, p.k).setPosition(x, p.k * 1.2, z);
      ref.current!.setMatrixAt(i, m);
      col.set(p.c).multiplyScalar(1 - dim * 0.45);
      ref.current!.setColorAt(i, col);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, N]} castShadow>
      <meshPhysicalMaterial roughness={0.6} />
    </instancedMesh>
  );
};

// ---- era ring vignettes (from the cover) ----
const Pedestal: React.FC = () => (
  <>
    <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.3, 1.36, 0.22, 64]} />
      <meshPhysicalMaterial color={C.pearl} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.3} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.222, 0]}>
      <torusGeometry args={[1.22, 0.012, 8, 96]} />
      <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.3} />
    </mesh>
    <Box s={[0.9, 0.05, 0.3]} p={[0, 0.2, 1.42]} r={[-0.5, 0, 0]} c={C.brass} metal={1} rough={0.3} radius={0.015} />
  </>
);
const S = 0.35; // miniature scale of the parametric model on the ring pedestals
const Mini: React.FC<{ children: React.ReactNode }> = ({ children }) => <group position={[0, 0.22, 0]} scale={S}>{children}</group>;

export const RING_ERAS = [
  { id: "ibrahim", deg: 284, year: "MASA IBRAHIM", desc: "fondasi tanpa atap", el: <Mini><KabahModel dress="stone" h={1.3} ext={0.9} roof={false} door="ground" hijr={false} hajar="none" seed={11} /></Mini> },
  { id: "quraisy", deg: 201, year: "± 605 M", desc: "atap kayu kapal", el: <Mini><KabahModel dress="stone" h={2.6} roof door="raised" hijr hajar="stone" seed={12} /></Mini> },
  { id: "zubair", deg: 159, year: "683 M", desc: "dua pintu rata tanah", el: <Mini><KabahModel dress="stone" h={4} ext={0.9} roof door="ground" west={1} hijr={false} hajar="frame" doorGlow={0.8} seed={13} /></Mini> },
  { id: "hajjaj", deg: 106, year: "693 M", desc: "pintu barat ditutup", el: <Mini><KabahModel dress="stone" h={4} roof door="raised" west={1} walled={1} hijr hajar="frame" seed={14} /></Mini> },
  { id: "banjir", deg: 17, year: "1630 M", desc: "garis banjir", el: <FloodMini /> },
  { id: "renovasi", deg: -17, year: "1996 M", desc: "renovasi atap", el: <ScaffoldMini /> },
] as const;
export const ringEraPos = (deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  return [Math.sin(a) * RING_R, -0.24, Math.cos(a) * RING_R];
};

function FloodMini() {
  return (
    <group>
      <Mini>
        <KabahModel dress="stone" h={4} roof door="raised" hijr={false} hajar="none" seed={15} />
      </Mini>
      <mesh position={[0, 0.22 + 0.4, 0]}>
        <boxGeometry args={[1.9, 0.8, 1.6]} />
        <meshPhysicalMaterial color="#8c7553" roughness={0.12} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.22 + 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.66, 0.7, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color={C.accent} toneMapped={false} />
      </mesh>
    </group>
  );
}
function ScaffoldMini() {
  const poles: V3[] = [];
  for (const x of [-0.75, 0, 0.75]) for (const z of [-0.65, 0.65]) poles.push([x, 0.22 + 0.85, z]);
  return (
    <group rotation={[0, 0.35, 0]}>
      <Mini>
        <KabahModel dress="kiswah" seed={16} hijr={false} />
      </Mini>
      {poles.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 1.7, 10]} />
          <meshPhysicalMaterial color={C.steel} metalness={1} roughness={0.3} />
        </mesh>
      ))}
      {[0.5, 0.95, 1.4].map((y) =>
        [-0.65, 0.65].map((z) => (
          <mesh key={`${y}${z}`} position={[0, 0.22 + y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 1.55, 8]} />
            <meshPhysicalMaterial color={C.steel} metalness={1} roughness={0.32} />
          </mesh>
        )),
      )}
      {[0.95, 1.4].map((y) => (
        <Box key={y} s={[1.5, 0.025, 0.22]} p={[0, 0.22 + y + 0.02, 0.72]} c="#a5784a" rough={0.75} radius={0.006} />
      ))}
    </group>
  );
}

export type MainState = {
  t: number;
  /** today's Ka'bah corner state for the Qaramithah chapter */
  hajar?: "frame" | "empty" | "stone";
  crowd?: number;
  crowdDim?: number;
  ringGlow?: number;
  ticksLit?: number;
  hijrGlow?: number;
  plaque?: boolean;
};

export const MainStage: React.FC<{ m: MainState; children?: React.ReactNode }> = ({ m, children }) => (
  <group>
    <MainPlinth ringGlow={m.ringGlow ?? 0} ticksLit={m.ticksLit ?? 8} />
    <KabahModel dress="kiswah" seed={3} hajar={m.hajar ?? "frame"} hijr={false} />
    <HijrMain glow={m.hijrGlow ?? 0} />
    <Crowd t={m.t} density={m.crowd ?? 1} dim={m.crowdDim ?? 0} />
    {RING_ERAS.map((e) => {
      const p = ringEraPos(e.deg);
      const face = Math.atan2(-p[0], 40 - p[2]);
      return (
        <group key={e.id} position={p} rotation={[0, face, 0]}>
          <Pedestal />
          {e.el}
        </group>
      );
    })}
    {/* the brand, once, as a museum plaque on the era ring */}
    <Plaque lines={["AUDIRA", "SEJARAH MAKKAH · EP01"]} p={[-4.6, -0.24, 11.9]} ry={0.38} w={1.9} />
    {children}
  </group>
);

const HijrMain: React.FC<{ glow: number }> = ({ glow }) => <HijrWall p={[3.6 / 2 + 0.05, 0, 0]} glow={glow} />;
