// AE-064 world pieces (LIDARFORGE look on real objects): soil cross-sections, runway, Kansai island,
// PVD rig, preload, settlement plate, sand drains, terminal columns + jack. LiDAR scan points are only
// an effect layer on top of these solid models (never the main subject).
// Palette (different from other LIDARFORGE episodes): amber earth, teal water, coral laser.
import React, { useMemo } from "react";
import * as THREE from "three";
import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, ExtrudeGeometry, PlaneGeometry, Shape } from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";

export type V3 = [number, number, number];

export const C = {
  void: "#06090c",
  amber: "#e39a3b",
  fill: "#a2703f",
  crust: "#7c5a36",
  clay: "#4c5d57",
  clayWet: "#3f524e",
  clayDeep: "#33403f",
  stiff: "#6a5843",
  sand: "#d8b578",
  sandDeep: "#9a7a52",
  teal: "#2fd3c4",
  tealDeep: "#0d3a42",
  coral: "#ff6b57",
  asphalt: "#24272c",
  concrete: "#9aa0a3",
  steel: "#b8c2c8",
  white: "#eef2f4",
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
export const ramp = (t: number, a: number, b: number) => sm((t - a) / (b - a));
const hash = (n: number) => {
  const x = Math.sin(n * 157.31 + 41.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- LiDAR scan surface material
/** LIDARFORGE surface: dark base, square return dots (triplanar, world space), faint survey grid,
 * emissive rim on silhouette edges and a bright sweep band. Used on soil, fill and sea so they read
 * as scanned ground instead of plain plastic. */
export type Scan = { dot?: string; dotI?: number; dark?: number; cell?: number; dens?: number; grid?: number; rim?: string; rimI?: number; sweep?: number; dir?: V3 };
const dotFor = (color: string) => (color === C.clay || color === C.clayWet || color === C.clayDeep ? C.teal : color === C.teal || color === C.tealDeep ? "#5ff4ff" : color === C.stiff || color === C.sandDeep ? "#c98a4a" : C.amber);
const SCAN_VERT_HEAD = "varying vec3 vScanW;\nvarying vec3 vScanN;\n";
export const useScanMat = (color: string, rough: number, clear: number, s: Scan, opacity = 1) => {
  const mat = useMemo(() => {
    const u = {
      uDot: { value: new THREE.Color() }, uDotI: { value: 1 }, uDark: { value: 0.6 }, uCell: { value: 0.14 }, uDens: { value: 0.55 },
      uGrid: { value: 0.25 }, uRim: { value: new THREE.Color() }, uRimI: { value: 0.5 }, uDir: { value: new THREE.Vector3(1, 0, 0) }, uSweep: { value: -999 },
    };
    const m = new THREE.MeshPhysicalMaterial({ clearcoatRoughness: 0.3 });
    m.userData.u = u;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = SCAN_VERT_HEAD + sh.vertexShader
        .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\n vScanN = normalize(mat3(modelMatrix) * objectNormal);")
        .replace("#include <project_vertex>", "#include <project_vertex>\n vScanW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader =
        SCAN_VERT_HEAD +
        "uniform vec3 uDot; uniform float uDotI; uniform float uDark; uniform float uCell; uniform float uDens; uniform float uGrid; uniform vec3 uRim; uniform float uRimI; uniform vec3 uDir; uniform float uSweep;\n" +
        sh.fragmentShader.replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
  {
    vec3 an = abs(vScanN);
    vec2 uv = (an.x > an.y && an.x > an.z) ? vScanW.zy : ((an.y > an.z) ? vScanW.xz : vScanW.xy);
    vec2 g = uv / uCell;
    vec2 cell = floor(g);
    vec2 fr = fract(g) - 0.5;
    float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
    float sq = max(abs(fr.x), abs(fr.y));
    float dotm = (1.0 - smoothstep(0.08, 0.13, sq)) * step(1.0 - uDens, h);
    vec2 gl = abs(fract(uv / (uCell * 8.0)) - 0.5);
    float grid = smoothstep(0.475, 0.5, max(gl.x, gl.y));
    float sd = dot(vScanW, uDir) - uSweep;
    float band = exp(-sd * sd * 5.0);
    float lit = 0.45 + 0.55 * step(sd, 0.0) + band * 2.6;
    float rim = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 3.0);
    diffuseColor.rgb *= (1.0 - uDark);
    totalEmissiveRadiance += uDot * dotm * uDotI * (0.5 + 0.5 * h) * lit + uDot * grid * uGrid + uRim * rim * uRimI + uRim * band * 0.25;
  }`,
        );
    };
    m.customProgramCacheKey = () => "ep064-scan-v1";
    return m;
  }, []);
  const u = mat.userData.u;
  mat.color.set(color);
  mat.roughness = rough;
  mat.clearcoat = clear;
  mat.transparent = opacity < 1;
  mat.opacity = opacity;
  u.uDot.value.set(s.dot ?? dotFor(color));
  u.uDotI.value = (s.dotI ?? 1.4) * 1.5;
  u.uDark.value = s.dark ?? 0.62;
  u.uCell.value = s.cell ?? 0.14;
  u.uDens.value = s.dens ?? 0.5;
  u.uGrid.value = s.grid ?? 0.22;
  u.uRim.value.set(s.rim ?? s.dot ?? dotFor(color));
  u.uRimI.value = s.rimI ?? 0.55;
  u.uDir.value.set(...(s.dir ?? [1, 0, 0]));
  u.uSweep.value = s.sweep ?? 999;
  return mat;
};

const ScanSlab: React.FC<{ size: V3; pos: V3; color: string; rough: number; clear: number; scan: Scan; opacity: number }> = ({ size, pos, color, rough, clear, scan, opacity }) => {
  const mat = useScanMat(color, rough, clear, scan, opacity);
  return (
    <mesh position={pos} castShadow receiveShadow material={mat}>
      <RoundedBoxGeo args={size} radius={Math.min(0.04, Math.min(...size) * 0.2)} segments={2} />
    </mesh>
  );
};

// ---------------------------------------------------------------- generic pieces
/** A rounded slab with a wet/earth physical material (or the LiDAR scan surface when `scan` is set). */
export const Slab: React.FC<{ size: V3; pos: V3; color: string; rough?: number; metal?: number; emissive?: string; ei?: number; opacity?: number; grain?: number; clear?: number; scan?: Scan }> = ({ size, pos, color, rough = 0.85, metal = 0, emissive, ei = 0, opacity = 1, grain = 0, clear = 0, scan }) => {
  const tex = useSurfaceGrain(11 + grain, 0.25, 4);
  if (scan) return <ScanSlab size={size} pos={pos} color={color} rough={rough} clear={clear} scan={scan} opacity={opacity} />;
  return (
    <mesh position={pos} castShadow receiveShadow>
      <RoundedBoxGeo args={size} radius={Math.min(0.04, Math.min(...size) * 0.2)} segments={2} />
      <meshPhysicalMaterial color={color} roughness={rough} metalness={metal} roughnessMap={grain ? tex : null} bumpMap={grain ? tex : null} bumpScale={grain ? 0.6 : 0} clearcoat={clear} clearcoatRoughness={0.3} emissive={emissive ?? "#000"} emissiveIntensity={ei} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
};

export type Layer = { h: number; color: string; rough?: number; clear?: number; ei?: number; emissive?: string; scan?: Scan };
/** Stacked strata, top at y=top, cut face toward +z, LiDAR scan surface on every layer (scan=false: plain). */
export const Strata: React.FC<{ w: number; d: number; top: number; layers: Layer[]; x?: number; z?: number; scan?: Scan | false }> = ({ w, d, top, layers, x = 0, z = 0, scan = {} }) => {
  let y = top;
  return (
    <group position={[x, 0, z]}>
      {layers.map((l, i) => {
        const cy = y - l.h / 2;
        y -= l.h;
        return <Slab key={i} size={[w, l.h - 0.015, d]} pos={[0, cy, 0]} color={l.color} rough={l.rough ?? 0.85} clear={l.clear ?? 0} emissive={l.emissive} ei={l.ei ?? 0} grain={i + 1} scan={scan === false ? undefined : { ...scan, ...l.scan }} />;
      })}
    </group>
  );
};

/** Instanced mesh built in useMemo (matrices + colours before first draw), updated each render. */
export const Inst: React.FC<{
  geo: THREE.BufferGeometry;
  count: number;
  color: string;
  emissive?: string;
  ei?: number;
  rough?: number;
  metal?: number;
  opacity?: number;
  place: (i: number, o: THREE.Object3D) => void;
  tint?: (i: number) => string;
  shadow?: boolean;
  water?: boolean;
}> = ({ geo, count, color, emissive, ei = 0, rough = 0.6, metal = 0, opacity = 1, place, tint, shadow = true, water = false }) => {
  const mesh = useMemo(() => {
    const mat = water
      ? new THREE.MeshPhysicalMaterial({ color: "#ffffff", emissive: emissive ?? "#000000", emissiveIntensity: ei, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.33, specularIntensity: 1, envMapIntensity: 2.2, transparent: true, opacity: 0.92 })
      : new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: emissive ?? "#000000", emissiveIntensity: ei, roughness: rough, metalness: metal, transparent: opacity < 1, opacity });
    const m = new THREE.InstancedMesh(geo, mat, count);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      o.position.set(0, -999, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(tint ? tint(i) : color));
    }
    m.castShadow = shadow;
    m.receiveShadow = shadow;
    m.frustumCulled = false;
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, count]);
  const o = useMemo(() => new THREE.Object3D(), []);
  // place before first draw and every frame (deterministic: place reads only props/time)
  for (let i = 0; i < count; i++) {
    o.position.set(0, 0, 0);
    o.rotation.set(0, 0, 0);
    o.scale.set(1, 1, 1);
    place(i, o);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (!water) (mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
  (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = ei;
  return <primitive object={mesh} />;
};

/** LiDAR return dots over a surface: effect layer only. reveal(x,z) 0..1 decides which are lit. */
export const ScanDots: React.FC<{ w: number; d: number; y: (x: number, z: number) => number; nx: number; nz: number; reveal: (x: number, z: number) => number; color?: string; size?: number; x0?: number; z0?: number }> = ({ w, d, y, nx, nz, reveal, color = C.coral, size = 0.07, x0 = 0, z0 = 0 }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(nx * nz * 3), [nx, nz]);
  let n = 0;
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const x = x0 + (i / (nx - 1) - 0.5) * w + (hash(i * 31 + j) - 0.5) * (w / nx) * 0.6;
      const z = z0 + (j / (nz - 1) - 0.5) * d + (hash(j * 17 + i * 3) - 0.5) * (d / nz) * 0.6;
      if (reveal(x, z) < 0.5) continue;
      pos[n * 3] = x;
      pos[n * 3 + 1] = y(x, z) + 0.03;
      pos[n * 3 + 2] = z;
      n++;
    }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setDrawRange(0, n);
  (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  geo.computeBoundingSphere();
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.9} toneMapped={false} />
    </points>
  );
};

/** Vertical laser curtain + bright edge line (coral), sweeping along an axis. */
export const ScanCurtain: React.FC<{ pos: V3; w: number; h: number; rotY?: number; opacity?: number }> = ({ pos, w, h: hIn, rotY = 0, opacity = 1 }) => {
  const h = Math.min(hIn, 0.7); // a low laser fin only: a tall curtain reads as a red wall on screen
  return (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh position={[0, h / 2, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={C.coral} transparent opacity={0.06 * opacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, 0.09]} />
      <meshBasicMaterial color={C.coral} transparent opacity={0.95 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
  );
};

// ---------------------------------------------------------------- runway + airliner + sign
export const Runway: React.FC<{ len: number; w: number; y: number; z?: number }> = ({ len, w, y, z = 0 }) => {
  const dash = useMemo(() => new BoxGeometry(0.18, 0.02, 1.6), []);
  const light = useMemo(() => new SphereGeometry(0.07, 8, 6), []);
  const nd = Math.floor(len / 4);
  const nl = Math.floor(len / 2.5);
  return (
    <group position={[0, y, z]}>
      <Slab size={[w, 0.2, len]} pos={[0, 0.1, 0]} color={C.asphalt} rough={0.7} grain={7} />
      {/* centre line dashes + edge lights */}
      <Inst geo={dash} count={nd} color={C.white} emissive={C.white} ei={0.25} place={(i, o) => o.position.set(0, 0.21, -len / 2 + 2 + i * 4)} />
      <Inst geo={light} count={nl * 2} color={C.amber} emissive={C.amber} ei={2.2} shadow={false} place={(i, o) => o.position.set((i % 2 ? 1 : -1) * (w / 2 + 0.12), 0.25, -len / 2 + Math.floor(i / 2) * 2.5)} />
      {/* threshold piano keys */}
      {[-1, 1].map((e) =>
        [0, 1, 2, 3, 4, 5].map((k) => <Slab key={`${e}${k}`} size={[0.28, 0.02, 1.6]} pos={[(k - 2.5) * 0.5 * (w / 3.6), 0.21, e * (len / 2 - 1.5)]} color={C.white} rough={0.5} />),
      )}
    </group>
  );
};

/** Narrow-body airliner (real GLB). Its nose points to -z after rotY = 0 (checked on stills). */
export const Airliner: React.FC<{ pos: V3; yaw?: number; pitch?: number; size?: number }> = ({ pos, yaw = 0, pitch = 0, size = 9 }) => (
  <group position={pos} rotation={[0, yaw, 0]}>
    <group rotation={[pitch, 0, 0]}>
      <AssetModel id="narrow-body-airliner-619183" assetType="vehicle" size={size} metalness={0.35} roughness={0.35} fallback={<Slab size={[size * 0.12, size * 0.12, size]} pos={[0, 0, 0]} color={C.white} />} />
    </group>
  </group>
);

/** AUDIRA survey board: part of the world (plate + legs), text in 3D. */
export const AudiraBoard: React.FC<{ pos: V3; rotY?: number; scale?: number; sub?: string }> = ({ pos, rotY = 0, scale = 1, sub = "SURVEY · AE-064" }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    {[-0.9, 0.9].map((x) => (
      <Slab key={x} size={[0.08, 1.2, 0.08]} pos={[x, 0.6, 0]} color={C.steel} metal={0.8} rough={0.3} />
    ))}
    <Slab size={[2.4, 0.95, 0.08]} pos={[0, 1.55, 0]} color="#0c1418" rough={0.4} />
    <Slab size={[2.4, 0.06, 0.1]} pos={[0, 1.06, 0.01]} color={C.coral} emissive={C.coral} ei={1.6} />
    <SceneText position={[0, 1.68, 0.05]} fontSize={0.5} color={C.white} anchorX="center" anchorY="middle" letterSpacing={0.08}>
      AUDIRA
    </SceneText>
    <SceneText position={[0, 1.27, 0.05]} fontSize={0.16} color={C.teal} anchorX="center" anchorY="middle" font="sans" letterSpacing={0.1}>
      {sub}
    </SceneText>
  </group>
);

// ---------------------------------------------------------------- soft-mud cut face (hook)
/** A rippling wet-clay cut face in the XY plane (faces +z). amp = "selembek bubur" wobble. */
export const MudFace: React.FC<{ w: number; h: number; pos: V3; t: number; amp: number; rotY?: number }> = ({ w, h, pos, t, amp, rotY = 0 }) => {
  const geo = useMemo(() => new PlaneGeometry(w, h, 60, 14), [w, h]);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const edge = Math.min(1, (h / 2 - Math.abs(y)) / 0.4);
    p.setZ(i, amp * edge * (0.14 * Math.sin(x * 1.7 - t * 3.1) + 0.08 * Math.sin(x * 3.3 + y * 2.1 + t * 2.3)));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  const mat = useScanMat(C.clayWet, 0.28, 0.8, { cell: 0.16, dotI: 1.6 });
  return <mesh geometry={geo} position={pos} rotation={[0, rotY, 0]} receiveShadow material={mat} />;
};

// ---------------------------------------------------------------- Kansai island (hook B / reveal top)
export const KansaiIsland: React.FC<{ sink: number; t: number }> = ({ sink, t }) => {
  const top = 3.2 - sink;
  const seaSweep = -40 + ((t * 9) % 80);
  return (
    <group>
      {/* sea: scanned water surface (teal returns like a bathymetry pass) + glossy layer */}
      <Slab size={[220, 0.2, 220]} pos={[0, -0.1, 0]} color={C.tealDeep} rough={0.15} clear={1} scan={{ cell: 0.7, dens: 0.42, dotI: 1.1, grid: 0.3, dark: 0.35, sweep: seaSweep, dir: [0, 0, 1] }} />
      {/* island fill body: rounded plan via stacked slabs (revetment step) */}
      <Slab size={[9, top + 6, 34]} pos={[0, (top - 6) / 2, 0]} color={C.fill} rough={0.9} scan={{ cell: 0.32, dotI: 1.5, sweep: top - 0.6 - ((t * 0.8) % 1) * 4, dir: [0, 1, 0] }} />
      <Slab size={[10.2, 1.1, 35.2]} pos={[0, 0.25, 0]} color="#5a5f63" rough={0.95} scan={{ cell: 0.25, dot: "#9fb7c4", dotI: 0.9 }} />
      {/* bright waterline ring */}
      {[[0, 17.62, 10.3, 0.12], [0, -17.62, 10.3, 0.12], [5.12, 0, 0.12, 35.3], [-5.12, 0, 0.12, 35.3]].map(([x, z, w, d], i) => (
        <Slab key={`w${i}`} size={[w, 0.05, d]} pos={[x, 0.06, z]} color="#5ff4ff" emissive="#5ff4ff" ei={2.4} />
      ))}
      <Runway len={30} w={2.4} y={top} z={0} />
      {/* parallel taxiway + apron + terminal */}
      <Slab size={[0.9, 0.06, 26]} pos={[-2.1, top + 0.03, 0]} color="#30343a" rough={0.8} />
      <Slab size={[2.6, 0.05, 12]} pos={[-3.2, top + 0.025, 4]} color="#3a3f45" rough={0.8} scan={{ cell: 0.3, dot: "#9fb7c4", dotI: 0.8, dark: 0.3 }} />
      <group position={[-3.2, top, -6]}>
        <AssetModel id="control-tower-c95a65" assetType="building" size={3.2} tint="#cfd6da" roughness={0.5} fallback={<Slab size={[0.6, 3, 0.6]} pos={[0, 1.5, 0]} color={C.concrete} />} />
      </group>
      <Slab size={[1.2, 0.9, 9]} pos={[-3.75, top + 0.45, 4]} color="#8d969b" rough={0.3} metal={0.5} />
      <Slab size={[1.25, 0.12, 9.05]} pos={[-3.75, top + 0.6, 4]} color={C.teal} emissive={C.teal} ei={1.2} />
      {/* parked airliners at the terminal (real GLB) */}
      {[1.2, 6.2].map((z) => (
        <group key={z} position={[-2.7, top + 0.3, z]} rotation={[0, Math.PI / 2, 0]}>
          <AssetModel id="narrow-body-airliner-619183" assetType="vehicle" size={2.4} metalness={0.35} roughness={0.35} fallback={<Slab size={[0.3, 0.3, 2.4]} pos={[0, 0, 0]} color={C.white} />} />
        </group>
      ))}
      {/* datum ring: where the surface started (glowing coral outline) */}
      {[[0, 17.2, 9.4, 0.08], [0, -17.2, 9.4, 0.08], [4.7, 0, 0.08, 34.4], [-4.7, 0, 0.08, 34.4]].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 3.2 + 0.02, z]}>
          <boxGeometry args={[w, 0.06, d]} />
          <meshBasicMaterial color={C.coral} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Vertical gauge next to the island: coral ticks, amber marker at the current drop. */
export const Gauge: React.FC<{ pos: V3; h: number; k: number }> = ({ pos, h, k }) => {
  const tick = useMemo(() => new BoxGeometry(0.5, 0.05, 0.05), []);
  return (
    <group position={pos}>
      <Slab size={[0.14, h, 0.14]} pos={[0, -h / 2, 0]} color={C.steel} metal={0.8} rough={0.25} />
      <Inst geo={tick} count={8} color={C.coral} emissive={C.coral} ei={1.2} shadow={false} place={(i, o) => o.position.set(0.25, -(i / 7) * h, 0)} />
      <mesh position={[0, -k * h, 0]}>
        <sphereGeometry args={[0.32, 20, 14]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- pore water (konteks)
/** Teardrop water drop (lathe), tip up, about r wide. */
export const dropGeo = (r: number) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI; // 0 = bottom, PI = top
    const y = -Math.cos(a) * r;
    const x = Math.sin(a) * r * (1 - 0.55 * Math.max(0, (y / r))); // narrow toward the top
    pts.push(new THREE.Vector2(Math.max(0.0001, x), y));
  }
  pts.push(new THREE.Vector2(0.0001, r * 1.9));
  return new THREE.LatheGeometry(pts, 18);
};
export const WATER = { color: "#8fe6ff", glow: "#1b8fb8" };

/** Water drops in the clay pores; squeeze 0..1 pushes them up and out. Glossy water material. */
export const PoreWater: React.FC<{ w: number; top: number; bot: number; z: number; squeeze: number; n?: number }> = ({ w, top, bot, z, squeeze, n = 60 }) => {
  const geo = useMemo(() => dropGeo(0.1), []);
  return (
    <Inst
      geo={geo}
      count={n}
      color={WATER.color}
      emissive={WATER.glow}
      ei={0.45}
      water
      shadow={false}
      place={(i, o) => {
        const x0 = (hash(i) - 0.5) * (w - 0.4);
        const y0 = bot + 0.2 + hash(i + 50) * (top - bot - 0.4);
        const phase = hash(i + 99);
        const s = clamp01(squeeze * 1.6 - phase * 0.6);
        const y = y0 + s * (top - y0 + 0.4);
        const x = x0 + s * s * Math.sign(x0 || 1) * 0.6;
        o.position.set(x, y, z + 0.03);
        const sc = 1 - clamp01((s - 0.85) / 0.15);
        o.scale.setScalar(Math.max(0.001, sc));
      }}
    />
  );
};

/** Thin rippling water film (squeezed-out pore water) lying on a surface at y. k 0..1 = spread. */
export const WaterSheet: React.FC<{ w: number; d: number; pos: V3; t: number; k: number }> = ({ w, d, pos, t, k }) => {
  const geo = useMemo(() => new PlaneGeometry(1, 1, 40, 24), []);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, 0.012 * Math.sin(x * 40 - t * 4) + 0.008 * Math.sin(y * 31 + x * 13 + t * 3));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  if (k < 0.01) return null;
  return (
    <mesh geometry={geo} position={pos} rotation={[-Math.PI / 2, 0, 0]} scale={[w * k, d * Math.min(1, k * 1.4), 1]}>
      <meshPhysicalMaterial color="#3fb6d8" emissive={WATER.glow} emissiveIntensity={0.35} roughness={0.05} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={2} transparent opacity={0.82} />
    </mesh>
  );
};

/** Trapezoid earth fill (preload mound) along z, base width bw, top width tw, height h. */
export const Mound: React.FC<{ bw: number; tw: number; h: number; d: number; pos: V3; color?: string; scan?: Scan }> = ({ bw, tw, h, d, pos, color = C.fill, scan }) => {
  const geo = useMemo(() => {
    const s = new Shape();
    s.moveTo(-bw / 2, 0);
    s.lineTo(bw / 2, 0);
    s.lineTo(tw / 2, 1);
    s.lineTo(-tw / 2, 1);
    s.closePath();
    const g = new ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
    g.translate(0, 0, -d / 2);
    return g;
  }, [bw, tw, d]);
  const mat = useScanMat(color, 0.95, 0, { cell: 0.15, dotI: 1.5, ...scan });
  return <mesh geometry={geo} position={pos} scale={[1, Math.max(0.001, h), 1]} castShadow receiveShadow material={mat} />;
};

// ---------------------------------------------------------------- PVD rig + drains (mekanisme)
export const PVD_W = 0.16;
/** Crawler rig: real tracked excavator GLB as the base + procedural tall mast and steel mandrel. */
export const PvdRig: React.FC<{ pos: V3; stroke: number; mastH?: number }> = ({ pos, stroke, mastH = 6.5 }) => {
  const rung = useMemo(() => new BoxGeometry(0.5, 0.05, 0.05), []);
  return (
    <group position={pos}>
      <group rotation={[0, Math.PI / 2, 0]}>
        <AssetModel id="tracked-excavator-8ebd3c" assetType="vehicle" size={3.2} ground tint={C.amber} roughness={0.45} fallback={<Slab size={[2, 1.2, 3]} pos={[0, 0.6, 0]} color={C.amber} />} />
      </group>
      {/* mast (lattice) in front of the cab */}
      <group position={[1.75, 0, 0]}>
        {[-0.22, 0.22].map((z) => (
          <Slab key={z} size={[0.09, mastH, 0.09]} pos={[0, mastH / 2, z]} color={C.coral} rough={0.4} metal={0.3} />
        ))}
        <Inst geo={rung} count={14} color={C.coral} rough={0.4} place={(i, o) => { o.position.set(0, 0.3 + i * (mastH / 14), 0); o.rotation.set(0, Math.PI / 2, (i % 2 ? 1 : -1) * 0.5); }} />
        {/* mandrel: steel rod sliding down through the clay */}
        <mesh position={[0, mastH - 2.6 - stroke * 4.4 + 1.3, 0]} castShadow>
          <boxGeometry args={[0.08, 5.2, 0.14]} />
          <meshStandardMaterial color={C.steel} metalness={0.9} roughness={0.2} />
        </mesh>
        <Slab size={[0.4, 0.3, 0.6]} pos={[0, mastH + 0.15, 0]} color="#2a2f33" rough={0.5} />
      </group>
    </group>
  );
};

/** Grid of prefabricated vertical drains (flat ribbons). grow(i) 0..1 = installed depth fraction. */
export const Drains: React.FC<{ cols: number; rows: number; dx: number; dz: number; x0: number; z0: number; top: number; depth: number; grow: (i: number) => number; glow?: number }> = ({ cols, rows, dx, dz, x0, z0, top, depth, grow, glow = 0 }) => {
  const geo = useMemo(() => {
    const g = new BoxGeometry(PVD_W, 1, 0.02);
    g.translate(0, -0.5, 0);
    return g;
  }, []);
  return (
    <Inst
      geo={geo}
      count={cols * rows}
      color="#e4e8e6"
      emissive={C.teal}
      ei={glow}
      rough={0.7}
      place={(i, o) => {
        const c = i % cols, r = Math.floor(i / cols);
        const g = grow(i);
        o.position.set(x0 + c * dx + (r % 2 ? dx / 2 : 0), top + 0.15, z0 + r * dz);
        o.scale.set(1, Math.max(0.001, g * (depth + 0.15)), 1);
      }}
    />
  );
};

/** Water arrows: travel sideways to the nearest drain then up it. phase 0..1 loops. */
export const FlowArrows: React.FC<{ drainsX: number[]; top: number; bot: number; z: number; t: number; on: number; up?: boolean }> = ({ drainsX, top, bot, z, t, on, up = false }) => {
  const geo = useMemo(() => {
    const g = new ConeGeometry(0.09, 0.26, 10);
    return g;
  }, []);
  const n = drainsX.length * 6;
  return (
    <Inst
      geo={geo}
      count={n}
      color={C.teal}
      emissive={C.teal}
      ei={1.8 * on}
      rough={0.2}
      shadow={false}
      place={(i, o) => {
        const d = drainsX[Math.floor(i / 6)];
        const k = i % 6;
        const side = k % 2 ? 1 : -1;
        const yy = bot + 0.5 + (Math.floor(k / 2) / 2) * (top - bot - 1);
        const ph = (t * 0.55 + hash(i) * 0.9) % 1;
        if (on < 0.02) {
          o.scale.setScalar(0.001);
          return;
        }
        if (!up || ph < 0.5) {
          // sideways toward the drain
          const a = up ? ph / 0.5 : ph;
          o.position.set(d + side * (0.55 - a * 0.5), yy, z + 0.06);
          o.rotation.set(0, 0, side > 0 ? Math.PI / 2 : -Math.PI / 2);
        } else {
          const a = (ph - 0.5) / 0.5;
          o.position.set(d + side * 0.12, yy + a * (top - yy + 0.2), z + 0.06);
          o.rotation.set(0, 0, 0);
        }
        o.scale.setScalar(Math.max(0.001, on));
      }}
    />
  );
};

/** Settlement plate: steel plate at the original ground + riser rod through the fill. */
export const SettlementPlate: React.FC<{ pos: V3; rodH: number }> = ({ pos, rodH }) => (
  <group position={pos}>
    <Slab size={[0.7, 0.06, 0.7]} pos={[0, 0.03, 0]} color={C.steel} metal={0.85} rough={0.25} />
    <Slab size={[0.06, rodH, 0.06]} pos={[0, rodH / 2, 0]} color={C.steel} metal={0.85} rough={0.25} />
    <mesh position={[0, rodH + 0.1, 0]}>
      <sphereGeometry args={[0.11, 16, 10]} />
      <meshStandardMaterial color={C.coral} emissive={C.coral} emissiveIntensity={2} toneMapped={false} />
    </mesh>
  </group>
);

// ---------------------------------------------------------------- sand drains (reveal)
export const SandDrains: React.FC<{ cols: number; rows: number; dx: number; dz: number; z0: number; top: number; len: number; glow: number }> = ({ cols, rows, dx, dz, z0, top, len, glow }) => {
  const geo = useMemo(() => new CylinderGeometry(0.11, 0.11, 1, 12), []);
  return (
    <Inst
      geo={geo}
      count={cols * rows}
      color={C.sand}
      emissive={C.coral}
      ei={glow}
      rough={0.9}
      place={(i, o) => {
        const c = i % cols, r = Math.floor(i / cols);
        o.position.set((c - (cols - 1) / 2) * dx, top - len / 2, z0 - r * dz);
        o.scale.set(1, len, 1);
      }}
    />
  );
};

// ---------------------------------------------------------------- terminal columns + jack (payoff)
export const COL_H = 3.2;
export const TerminalHall: React.FC<{ cols: number; rows: number; dx: number; dz: number; scanZ: number; measured: (i: number) => number; heroDrop: number; heroLift: number; shim: number; skip: number }> = ({ cols, rows, dx, dz, scanZ, measured, heroDrop, heroLift, shim, skip }) => {
  const colGeo = useMemo(() => new CylinderGeometry(0.17, 0.2, COL_H, 16), []);
  const padGeo = useMemo(() => new CylinderGeometry(0.42, 0.46, 0.18, 16), []);
  const ledGeo = useMemo(() => new SphereGeometry(0.06, 10, 8), []);
  const n = cols * rows;
  const at = (i: number): [number, number] => [(i % cols - (cols - 1) / 2) * dx, -Math.floor(i / cols) * dz];
  return (
    <group>
      <Slab size={[cols * dx + 3, 0.3, rows * dz + 3]} pos={[0, -0.15, -((rows - 1) * dz) / 2]} color="#3a3f43" rough={0.75} scan={{ cell: 0.22, dot: "#7fe9df", dotI: 0.9, sweep: scanZ, dir: [0, 0, 1] }} />
      <Inst geo={padGeo} count={n} color="#6f777b" rough={0.7} place={(i, o) => { if (i === skip) return o.scale.setScalar(0.001); const [x, z] = at(i); o.position.set(x, 0.09, z); }} />
      <Inst geo={colGeo} count={n} color={C.concrete} rough={0.55} place={(i, o) => { if (i === skip) return o.scale.setScalar(0.001); const [x, z] = at(i); o.position.set(x, 0.18 + COL_H / 2, z); }} />
      <Inst geo={ledGeo} count={n} color={C.amber} emissive={C.coral} ei={2.4} shadow={false} place={(i, o) => { const [x, z] = at(i); const m = measured(i); o.position.set(x + 0.22, 0.45, z + 0.05); o.scale.setScalar(Math.max(0.001, m)); }} />
      {/* wavy roof (one long shell) */}
      <Slab size={[cols * dx + 1.6, 0.28, rows * dz + 1.2]} pos={[0, 0.18 + COL_H + 0.14, -((rows - 1) * dz) / 2]} color="#c9d1d5" rough={0.35} metal={0.35} />
      <Slab size={[cols * dx + 1.7, 0.06, 0.1]} pos={[0, 0.18 + COL_H + 0.02, 0.6 + 0.05]} color={C.teal} emissive={C.teal} ei={0.9} />
      {/* hero column (index `skip`) with footing drop, jack lift and steel shims */}
      <HeroColumn x={at(skip)[0]} z={at(skip)[1]} drop={heroDrop} lift={heroLift} shim={shim} />
      <ScanCurtain pos={[0, 0, scanZ]} w={cols * dx + 2} h={COL_H + 0.6} />
    </group>
  );
};

const HeroColumn: React.FC<{ x: number; z: number; drop: number; lift: number; shim: number }> = ({ x, z, drop, lift, shim }) => {
  const footY = -drop; // the footing settles with the ground
  const colBase = 0.18 + footY + lift; // jack lifts the column back up
  const gap = colBase - (0.18 + footY);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.09 + footY, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.18, 16]} />
        <meshStandardMaterial color="#6f777b" roughness={0.7} />
      </mesh>
      <mesh position={[0, colBase + COL_H / 2 - 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.2, COL_H, 16]} />
        <meshStandardMaterial color={drop > 0.02 && lift < drop * 0.9 ? "#d9a08f" : C.concrete} roughness={0.55} />
      </mesh>
      {/* base collar the jacks push on */}
      <mesh position={[0, colBase + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color={C.steel} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* hydraulic jacks: two cylinders + chrome rams spanning footing → collar */}
      {lift > 0.001 || drop > 0.05
        ? [-0.36, 0.36].map((jx) => (
            <group key={jx} position={[jx, 0.18 + footY, 0.18]}>
              <mesh position={[0, 0.08, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 0.16, 14]} />
                <meshStandardMaterial color="#c2332a" metalness={0.4} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.16 + Math.max(0.001, gap) / 2, 0]}>
                <cylinderGeometry args={[0.045, 0.045, Math.max(0.001, gap + 0.02), 12]} />
                <meshStandardMaterial color="#e6edf1" metalness={1} roughness={0.08} />
              </mesh>
            </group>
          ))
        : null}
      {shim > 0.001 && gap > 0.02 ? <Shims pos={[0, 0.18 + footY, 0]} k={shim} gap={gap} /> : null}
    </group>
  );
};

/** Steel shim plates sliding into the base gap (k 0..1). */
export const Shims: React.FC<{ pos: V3; k: number; gap: number }> = ({ pos, k, gap }) => (
  <group position={pos}>
    {[0, 1, 2].map((i) => {
      const kk = clamp01(k * 1.6 - i * 0.3);
      const th = Math.max(0.01, gap / 3 - 0.005);
      return <Slab key={i} size={[0.5, th, 0.5]} pos={[-1.2 * (1 - kk), th / 2 + i * (gap / 3), -0.02]} color="#8f9aa1" metal={0.9} rough={0.2} />;
    })}
  </group>
);

// ---------------------------------------------------------------- big water arrows (mekanisme close-up)
/** 2–3 large water arrows in the clay between two drains: they travel sideways into the drains. */
export const BigFlow: React.FC<{ gapX: number; drains: [number, number]; ys: number[]; z: number; t: number; on: number }> = ({ gapX, drains, ys, z, t, on }) => {
  if (on < 0.02) return null;
  return (
    <group>
      {ys.map((y, i) => {
        const target = i % 2 ? drains[1] : drains[0];
        const dir = Math.sign(target - gapX);
        const ph = (t * 0.6 + i * 0.37) % 1;
        const x = lerpN(gapX - dir * 0.05, target - dir * 0.3, ph);
        const sc = on * Math.min(1, ph / 0.15, (1 - ph) / 0.2);
        return (
          <group key={i} position={[x, y, z]} rotation={[0, 0, dir > 0 ? -Math.PI / 2 : Math.PI / 2]} scale={Math.max(0.001, sc)}>
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.2, 0.36, 20]} />
              <meshStandardMaterial color={WATER.color} emissive={C.teal} emissiveIntensity={2.2} roughness={0.2} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.34, 14]} />
              <meshStandardMaterial color={WATER.color} emissive={C.teal} emissiveIntensity={1.8} roughness={0.2} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- reveal: with vs without sand drains
/** Two clay columns side by side under the same fill: left without drains (barely settles: decades),
 * right with sand drains (water out, settles within about a year). Gauges + time bars in the world. */
const CW = 2.0, CD = 2.0, CLAY_H = 2.0;
export const CompareRig: React.FC<{ t: number; t0: number; tDone: number; tEnd: number }> = ({ t, t0, tDone, tEnd }) => {
  const kR = sm((t - t0) / (tDone - t0));
  const kL = sm((t - t0) / (tEnd - t0)) * 0.06;
  return (
    <group>
      <CompareColumn x={-1.25} k={kL} drains={false} label="TANPA DRAIN" sub="puluhan tahun" accent={C.coral} t={t} />
      <CompareColumn x={1.25} k={kR} drains label="DRAIN PASIR" sub={kR > 0.98 ? "± 1 tahun · selesai" : "± 1 tahun"} accent={C.teal} t={t} />
      {/* ground strip behind for context */}
      <Slab size={[9, 0.2, 4]} pos={[0, -CLAY_H - 0.6, -1.5]} color={C.stiff} scan={{ cell: 0.18 }} />
    </group>
  );
};

const CompareColumn: React.FC<{ x: number; k: number; drains: boolean; label: string; sub: string; accent: string; t: number }> = ({ x, k, drains, label, sub, accent, t }) => {
  const settle = k * 0.6;
  const top = -settle * 0.75; // clay consolidates, the fill rides down
  const sweep = -CLAY_H + ((t * 1.3) % 1) * (CLAY_H + 0.8);
  return (
    <group position={[x, 0, 0]}>
      <Strata w={CW} d={CD} top={top} layers={[{ h: CLAY_H - settle * 0.25, color: C.clay, rough: 0.3, clear: 0.6 }, { h: 0.5, color: C.stiff }]} scan={{ cell: 0.11, sweep, dir: [0, 1, 0] }} />
      <Slab size={[CW, 0.6, CD]} pos={[0, top + 0.3, 0]} color={C.fill} scan={{ cell: 0.11 }} />
      {/* datum: where the fill top started */}
      <Slab size={[CW + 0.3, 0.035, 0.04]} pos={[0, 0.6, CD / 2 + 0.03]} color={C.coral} emissive={C.coral} ei={2.4} />
      {drains ? (
        <group position={[0, 0, 0]}>
          <SandDrains cols={4} rows={2} dx={0.46} dz={0.6} z0={CD / 2 - 0.05} top={top} len={CLAY_H - settle * 0.25} glow={0.6 + 0.6 * (1 - k)} />
        </group>
      ) : null}
      <PoreWater w={CW} top={top - 0.1} bot={top - CLAY_H + 0.2} z={CD / 2 + 0.02} squeeze={drains ? k : k * 0.3} n={drains ? 26 : 30} />
      {/* settlement gauge on the outer side */}
      <group position={[Math.sign(x) * (CW / 2 + 0.2), 0.6, CD / 2]}>
        <Slab size={[0.05, 0.8, 0.05]} pos={[0, -0.4, 0]} color={C.steel} metal={0.8} rough={0.25} />
        <mesh position={[0, -settle * 0.75, 0]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>
      {/* label plate + time bar */}
      <group position={[0, 1.4, CD / 2]}>
        <Slab size={[CW + 0.2, 0.92, 0.06]} pos={[0, 0, 0]} color="#081014" rough={0.5} />
        <Slab size={[CW + 0.2, 0.05, 0.08]} pos={[0, 0.46, 0.01]} color={accent} emissive={accent} ei={2} />
        <SceneText position={[0, 0.2, 0.05]} fontSize={0.3} color={C.white} anchorX="center" anchorY="middle" letterSpacing={0.04}>
          {label}
        </SceneText>
        <SceneText position={[0, -0.1, 0.05]} fontSize={0.22} color={accent} anchorX="center" anchorY="middle" font="sans">
          {sub}
        </SceneText>
        <Slab size={[CW - 0.1, 0.09, 0.03]} pos={[0, -0.3, 0.04]} color="#1d2a30" />
        <Slab size={[Math.max(0.01, (CW - 0.1) * (drains ? k : k * 2 + 0.04)), 0.09, 0.04]} pos={[-(CW - 0.1) / 2 + Math.max(0.01, (CW - 0.1) * (drains ? k : k * 2 + 0.04)) / 2, -0.3, 0.05]} color={accent} emissive={accent} ei={2.2} />
      </group>
    </group>
  );
};

export { hash };
