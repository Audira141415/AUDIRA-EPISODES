// AE-060 world (BEDAH look: clear tropical day, hard sun, the ground cut open at the front).
// Units are metres. The sea surface is y = 0; the cut face (section) is the plane z = 0, the world lies at z < 0.
// The jetty runs along +x from the shore (x ≈ -38) out to the head (x 260..320). Piles stand on the rows z = 0
// (half in front of the cut, so they read as sectioned) and z = -8 / the head grid.
// Facts used (research/RESEARCH_REPORT.md): open-pile jetty, steel pipe piles with a dark coating band at the
// tide zone, girders + precast slabs on the pile heads, trestle from shore, working barge + crane + guide frame,
// vibro then hammer, pile stops in hard ground; floating pontoon held by piles.

import React, { useLayoutEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { grain, soil, waves } from "./tex.ts";

export type V3 = [number, number, number];

// ------------------------------------------------------------------ ground profile
/** Seabed / ground top along x: land +2.5 → beach → slope → flat -17 m (Kijing berth depth, research [4]). */
export const seabedY = (x: number) => {
  if (x < -40) return 2.5;
  if (x < -30) return 2.5 - 3.5 * ((x + 40) / 10);
  const k = Math.min(1, (x + 30) / 100);
  return -1 - 16 * (k * k * (3 - 2 * k));
};
export const MUD = 6; // soft mud thickness below the seabed
export const HARD = 11; // seabed → top of hard ground
export const hardY = (x: number) => seabedY(x) - HARD;
export const DECK_Y = 6; // top of the deck slab
export const PILE_TOP = 4.5; // pile heads (girders sit on them)
export const PILE_R = 0.65; // Ø1.3 m (Patimban, research [8])
export const HEAD_X0 = 260;
export const HEAD_X1 = 320;
const X0 = -420, X1 = 760, ZBACK = -170;

// ------------------------------------------------------------------ materials (cached)
const matCache = new Map<string, THREE.Material>();
const M = <T extends THREE.Material>(key: string, make: () => T): T => {
  let m = matCache.get(key) as T | undefined;
  if (!m) matCache.set(key, (m = make()));
  return m;
};
const rep = (t: THREE.Texture, r: number) => {
  const c = t.clone();
  c.repeat.set(r, r);
  c.needsUpdate = true;
  return c;
};
export const mats = {
  steel: () => M("steel", () => { const g = grain(5, 0.8); return new THREE.MeshStandardMaterial({ color: "#9a958d", metalness: 0.3, roughness: 0.5, map: rep(g.map, 0.6), normalMap: rep(g.normalMap, 0.6) }); }),
  coat: () => M("coat", () => new THREE.MeshStandardMaterial({ color: "#2d2a27", metalness: 0.2, roughness: 0.55 })),
  concrete: () => M("concrete", () => { const g = grain(21, 1); return new THREE.MeshStandardMaterial({ color: "#c9c5bc", roughness: 0.88, map: rep(g.map, 0.12), normalMap: rep(g.normalMap, 0.12) }); }),
  girder: () => M("girder", () => { const g = grain(22, 1); return new THREE.MeshStandardMaterial({ color: "#b3aea4", roughness: 0.85, map: rep(g.map, 0.15), normalMap: rep(g.normalMap, 0.15) }); }),
  asphalt: () => M("asphalt", () => { const g = grain(9, 1.2); return new THREE.MeshStandardMaterial({ color: "#5c5d60", roughness: 0.92, map: rep(g.map, 0.1), normalMap: rep(g.normalMap, 0.1) }); }),
  mud: () => M("mud", () => { const g = soil(31, 0); return new THREE.MeshStandardMaterial({ color: "#6a5a49", roughness: 0.95, map: rep(g.map, 1 / 14), normalMap: rep(g.normalMap, 1 / 14) }); }),
  clay: () => M("clay", () => { const g = soil(37, 0.2); return new THREE.MeshStandardMaterial({ color: "#a8814f", roughness: 0.95, map: rep(g.map, 1 / 16), normalMap: rep(g.normalMap, 1 / 16) }); }),
  hard: () => M("hard", () => { const g = soil(43, 0.35); return new THREE.MeshStandardMaterial({ color: "#9a948a", roughness: 0.9, map: rep(g.map, 1 / 18), normalMap: rep(g.normalMap, 1 / 18) }); }),
  sand: () => M("sand", () => { const g = soil(47, 0); return new THREE.MeshStandardMaterial({ color: "#a8977a", roughness: 0.95, map: rep(g.map, 1 / 10), normalMap: rep(g.normalMap, 1 / 10) }); }),
  grass: () => M("grass", () => { const g = soil(53, 0); return new THREE.MeshStandardMaterial({ color: "#6f9a45", roughness: 0.95, map: rep(g.map, 1 / 12), normalMap: rep(g.normalMap, 1 / 12) }); }),
  barge: () => M("barge", () => { const g = grain(61, 1.3); return new THREE.MeshStandardMaterial({ color: "#5d666e", metalness: 0.35, roughness: 0.6, map: rep(g.map, 0.12), normalMap: rep(g.normalMap, 0.12) }); }),
  rust: () => M("rust", () => new THREE.MeshStandardMaterial({ color: "#8a4b2a", roughness: 0.8 })),
  yellow: () => M("yellow", () => new THREE.MeshStandardMaterial({ color: "#f2b705", metalness: 0.3, roughness: 0.45 })),
  orange: () => M("orange", () => new THREE.MeshStandardMaterial({ color: "#e8692c", metalness: 0.3, roughness: 0.45 })),
  dark: () => M("dark", () => new THREE.MeshStandardMaterial({ color: "#26292d", metalness: 0.6, roughness: 0.4 })),
  white: () => M("white", () => new THREE.MeshStandardMaterial({ color: "#f2f2ee", roughness: 0.5 })),
  cable: () => M("cable", () => new THREE.MeshStandardMaterial({ color: "#1c1c1c", metalness: 0.6, roughness: 0.4 })),
  hdpe: () => M("hdpe", () => new THREE.MeshPhysicalMaterial({ color: "#e4e7e6", roughness: 0.55, clearcoat: 0.3 })),
};

const farGrass = () => M("grassFar", () => { const g = soil(53, 0); return new THREE.MeshStandardMaterial({ color: "#5f8a3c", roughness: 0.95, map: rep(g.map, 120), normalMap: rep(g.normalMap, 120) }); });

// ------------------------------------------------------------------ sky dome (copied from the BEDAH kit Stage.tsx)
const SKY_VS = `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const SKY_FS = `
precision highp float;
uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSunDir; uniform float uCover; uniform vec3 uCloud; uniform vec3 uShade; uniform float uTime;
varying vec3 vDir;
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float dens(vec2 p){
  float base = 0.58 * vn(p * vec2(0.5, 0.62)) + 0.30 * vn(p * 1.05 + 7.3) + 0.12 * vn(p * 2.3 + 3.1);
  float bil = 0.0, a = 0.5; vec2 q = p * 2.6;
  for (int i = 0; i < 4; i++){ bil += a * abs(2.0 * vn(q) - 1.0); q = q * 2.07 + vec2(3.7, 1.3); a *= 0.5; }
  return base - bil * 0.24 + 0.07;
}
void main(){
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  vec3 c = mix(uHorizon, uZenith, 1.0 - exp(-h * 4.2));
  c = mix(c, uHorizon * 1.08 + vec3(0.04, 0.03, 0.0), exp(-h * 14.0) * 0.7);
  vec3 s = normalize(uSunDir);
  float cs = max(dot(d, s), 0.0);
  c += vec3(1.0, 0.96, 0.88) * (0.10 * pow(cs, 8.0) + 0.5 * pow(cs, 200.0));
  if (d.y > 0.0) {
    vec2 p = d.xz / (d.y + 0.34) * 2.5 + vec2(uTime * 0.012, uTime * 0.004);
    float n = dens(p);
    float cov = 1.0 - uCover;
    float a = smoothstep(cov, cov + 0.09, n);
    if (a > 0.0) {
      vec2 toSun = normalize(s.xz + vec2(1e-4)) * 0.3;
      float lit = n - dens(p + toSun);
      float light = clamp(0.7 + lit * 3.2, 0.0, 1.0);
      float core = smoothstep(cov + 0.1, cov + 0.3, n);
      vec3 cc = mix(uShade, uCloud, light) * mix(1.0, 0.8, core);
      a *= smoothstep(0.015, 0.16, d.y);
      c = mix(c, cc, a * 0.97);
    }
  } else {
    c = mix(uHorizon, vec3(0.16, 0.36, 0.5), smoothstep(0.0, 0.25, -d.y));
  }
  gl_FragColor = vec4(c, 1.0);
}`;
export const Sky: React.FC<{ t: number; sun: V3 }> = ({ t, sun }) => {
  const { camera } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VS,
        fragmentShader: SKY_FS,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uZenith: { value: new THREE.Color("#0a3a96") }, uHorizon: { value: new THREE.Color("#8cc0ee") }, uSunDir: { value: new THREE.Vector3() },
          uCover: { value: 0.4 }, uCloud: { value: new THREE.Color("#ffffff") }, uShade: { value: new THREE.Color("#a3b4d0") }, uTime: { value: 0 },
        },
      }),
    [],
  );
  mat.uniforms.uTime.value = t;
  mat.uniforms.uSunDir.value.set(...sun);
  return (
    <mesh position={camera.position.toArray() as V3} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1500, 32, 16]} />
    </mesh>
  );
};

/** Sun + sky bounce; the shadow box follows the shot target. */
export const Lights: React.FC<{ sun: V3; target: V3; box?: number; warm?: number }> = ({ sun, target, box = 70, warm = 0 }) => {
  const light = useMemo(() => new THREE.DirectionalLight("#fff2dc", 3.0), []);
  const color = new THREE.Color("#fff2dc").lerp(new THREE.Color("#ffb36b"), warm);
  light.color.copy(color);
  light.intensity = 3.6 - warm * 0.9;
  light.position.set(target[0] + sun[0] * 200, target[1] + sun[1] * 200, target[2] + sun[2] * 200);
  light.target.position.set(...target);
  light.target.updateMatrixWorld();
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  const c = light.shadow.camera;
  c.left = -box; c.right = box; c.top = box; c.bottom = -box; c.near = 1; c.far = 500;
  c.updateProjectionMatrix();
  light.shadow.bias = -0.0005;
  light.shadow.normalBias = 0.04;
  return (
    <>
      {/* low sky fill so the warm key throws readable shadows on piles and slabs */}
      <hemisphereLight args={["#d6e2f4", "#7d6c56", 0.85]} />
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

// ------------------------------------------------------------------ ground section (extruded layers, cap at z = 0)
const layerGeo = (top: (x: number) => number, bot: (x: number) => number, depth = -ZBACK) => {
  const s = new THREE.Shape();
  const xs: number[] = [];
  for (let x = X0; x <= X1; x += 4) xs.push(x);
  s.moveTo(xs[0], top(xs[0]));
  xs.forEach((x) => s.lineTo(x, top(x)));
  for (let i = xs.length - 1; i >= 0; i--) s.lineTo(xs[i], bot(xs[i]));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, steps: 1 });
  g.translate(0, 0, -depth);
  return g;
};
export const Ground: React.FC<{ cut?: boolean }> = ({ cut = true }) => {
  const geos = useMemo(
    () => ({
      top: layerGeo((x) => seabedY(x), (x) => seabedY(x) - 0.8),
      mud: layerGeo((x) => seabedY(x) - 0.8, (x) => seabedY(x) - MUD),
      clay: layerGeo((x) => seabedY(x) - MUD, hardY),
      hard: layerGeo(hardY, () => -260),
    }),
    [],
  );
  return (
    <group>
      <mesh geometry={geos.top} material={mats.sand()} receiveShadow />
      <mesh geometry={geos.mud} material={mats.mud()} receiveShadow />
      <mesh geometry={geos.clay} material={mats.clay()} receiveShadow />
      <mesh geometry={geos.hard} material={mats.hard()} receiveShadow />
      {/* grass on land behind the beach */}
      <mesh position={[(X0 - 44) / 2, 2.52, (ZBACK + (cut ? 0 : 600)) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={farGrass()} receiveShadow>
        <planeGeometry args={[-44 - X0, (cut ? 0 : 600) - ZBACK]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ sea
const waterFaceGeo = (level: number) => {
  const s = new THREE.Shape();
  const xs: number[] = [];
  for (let x = -40; x <= X1; x += 4) xs.push(x);
  s.moveTo(xs[0], level);
  s.lineTo(X1, level);
  for (let i = xs.length - 1; i >= 0; i--) s.lineTo(xs[i], Math.min(level, seabedY(xs[i])));
  s.closePath();
  return new THREE.ShapeGeometry(s);
};
/** Sea surface material: glossy ripples + fresnel sky reflection (fake env, so it does not depend on the scene
 *  environment intensity) + optional per-vertex depth tint (shallow turquoise → deep blue). */
export const waterMat = (repeat: number, vertexColors: boolean, color = "#ffffff") => {
  const n = waves().normalMap.clone();
  n.repeat.set(repeat, repeat);
  n.needsUpdate = true;
  const m = new THREE.MeshPhysicalMaterial({
    color, vertexColors, roughness: 0.06, metalness: 0.0, ior: 1.33, specularIntensity: 1, normalMap: n,
    normalScale: new THREE.Vector2(0.85, 0.85), transparent: true, opacity: 0.95, clearcoat: 0.8, clearcoatRoughness: 0.08,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSkyRefl = { value: new THREE.Color("#a9cdee") };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uSkyRefl;")
      .replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
        float wFr = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.0);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uSkyRefl, clamp(wFr * 0.8, 0.0, 0.8));`,
      );
  };
  return m;
};
const SHALLOW = new THREE.Color("#3aa9a4"), DEEP = new THREE.Color("#0a4762");
/** Plane in world XZ (y = 0 at origin) with a depth tint from seabedY along x. */
const seaGeo = (cx: number, w: number, d: number) => {
  const g = new THREE.PlaneGeometry(w, d, 240, 1);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const depth = Math.max(0, -seabedY(pos.getX(i) + cx));
    c.copy(SHALLOW).lerp(DEEP, Math.min(1, Math.pow(depth / 17, 0.6)));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
};
export const Sea: React.FC<{ t: number; cut: boolean; level?: number }> = ({ t, cut, level = 0 }) => {
  const surf = useMemo(() => waterMat(30, true), []);
  const farSea = useMemo(() => waterMat(240, false, "#0a4762"), []);
  (farSea.normalMap as THREE.Texture).offset.set(t * 0.004, t * 0.0025);
  (surf.normalMap as THREE.Texture).offset.set(t * 0.004, t * 0.0025);
  surf.opacity = cut ? 0.86 : 0.97;
  const zMax0 = cut ? 0 : 600;
  const geo = useMemo(() => seaGeo((X1 - 40) / 2, X1 + 40, zMax0 - ZBACK), [zMax0]);
  const face = useMemo(() => waterFaceGeo(0), []);
  const faceMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#2f8fbf", transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }), []);
  const backMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0f4561", side: THREE.DoubleSide }), []);
  const zMax = cut ? 0 : 600;
  return (
    <group>
      <mesh position={[(X1 - 40) / 2, level, (ZBACK + zMax) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={surf} geometry={geo} receiveShadow />
      {!cut && (
        <>
          {/* far field to the horizon (aerial shots): open sea + hinterland, both fade into the fog */}
          <mesh position={[1200, level - 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} material={farSea}>
            <planeGeometry args={[6000, 6000]} />
          </mesh>
          <mesh position={[-1544, 2.3, 0]} rotation={[-Math.PI / 2, 0, 0]} material={farGrass()} receiveShadow>
            <planeGeometry args={[3000, 6000]} />
          </mesh>
        </>
      )}
      {cut && (
        <>
          <mesh geometry={face} material={faceMat} position={[0, 0, 0.02]} renderOrder={5} />
          <mesh geometry={face} material={backMat} position={[0, 0, ZBACK + 0.5]} />
        </>
      )}
    </group>
  );
};

// ------------------------------------------------------------------ piles (instanced; matrices built before first draw)
export type PileSpec = { x: number; z: number; bot: number; top: number };
const pileGeo = new THREE.CylinderGeometry(PILE_R, PILE_R, 1, 20, 1).translate(0, 0.5, 0);
const bandGeo = new THREE.CylinderGeometry(PILE_R * 1.06, PILE_R * 1.06, 1, 20, 1).translate(0, 0.5, 0);
export const Piles: React.FC<{ list: PileSpec[] }> = ({ list }) => {
  const key = JSON.stringify(list.map((p) => [p.x, p.z, p.bot, p.top]));
  const [main, band] = useMemo(() => {
    const a = new THREE.InstancedMesh(pileGeo, mats.steel(), Math.max(1, list.length));
    const b = new THREE.InstancedMesh(bandGeo, mats.coat(), Math.max(1, list.length));
    const m = new THREE.Matrix4();
    list.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.bot, p.z), new THREE.Quaternion(), new THREE.Vector3(1, p.top - p.bot, 1));
      a.setMatrixAt(i, m);
      // dark coating band around the tide zone (research [26])
      m.compose(new THREE.Vector3(p.x, -3, p.z), new THREE.Quaternion(), new THREE.Vector3(1, Math.min(5.5, p.top + 3), 1));
      b.setMatrixAt(i, m);
    });
    a.count = b.count = list.length;
    a.castShadow = b.castShadow = true;
    a.receiveShadow = b.receiveShadow = true;
    a.instanceMatrix.needsUpdate = b.instanceMatrix.needsUpdate = true;
    return [a, b];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <>
      <primitive object={main} />
      <primitive object={band} />
    </>
  );
};

const pile = (x: number, z: number, top = PILE_TOP): PileSpec => ({ x, z, bot: hardY(x) - 1.2, top });
/** Trestle pile pairs every 10 m from x0 to x1, plus the head grid when `head`. */
export const jettyPiles = (x1: number, head: boolean, extra: PileSpec[] = []) => {
  const out: PileSpec[] = [];
  for (let x = -30; x <= x1; x += 10) out.push(pile(x, 0), pile(x, -8));
  if (head) for (let x = HEAD_X0 + 2; x <= HEAD_X1 - 2; x += 7) for (let z = 0; z >= -30; z -= 7.5) out.push(pile(x, z));
  return out.concat(extra);
};

// ------------------------------------------------------------------ deck
const Box: React.FC<{ size: V3; pos: V3; mat: THREE.Material; r?: number; rot?: V3 }> = ({ size, pos, mat, r, rot }) => (
  <mesh position={pos} rotation={rot} material={mat} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={r ?? Math.min(...size) * 0.08} segments={2} />
  </mesh>
);
/** Girders on both pile rows + a precast slab with an asphalt lane and kerbs, from xa to xb. */
export const TrestleDeck: React.FC<{ xa: number; xb: number }> = ({ xa, xb }) => {
  const L = xb - xa, cx = (xa + xb) / 2;
  return (
    <group>
      <Box size={[L, 1.0, 1.2]} pos={[cx, PILE_TOP + 0.5, 0]} mat={mats.girder()} />
      <Box size={[L, 1.0, 1.2]} pos={[cx, PILE_TOP + 0.5, -8]} mat={mats.girder()} />
      <Box size={[L, 0.5, 9.4]} pos={[cx, DECK_Y - 0.25, -4]} mat={mats.concrete()} r={0.05} />
      <Box size={[L, 0.06, 6.4]} pos={[cx, DECK_Y + 0.02, -4]} mat={mats.asphalt()} r={0.02} />
      <Box size={[L, 0.35, 0.4]} pos={[cx, DECK_Y + 0.17, 0.4]} mat={mats.concrete()} />
      <Box size={[L, 0.35, 0.4]} pos={[cx, DECK_Y + 0.17, -8.4]} mat={mats.concrete()} />
    </group>
  );
};
export const HeadDeck: React.FC = () => {
  const L = HEAD_X1 - HEAD_X0, cx = (HEAD_X0 + HEAD_X1) / 2;
  return (
    <group>
      {[0, -7.5, -15, -22.5, -30].map((z) => (
        <Box key={z} size={[L, 1.0, 1.2]} pos={[cx, PILE_TOP + 0.5, z]} mat={mats.girder()} />
      ))}
      <Box size={[L, 0.5, 31.4]} pos={[cx, DECK_Y - 0.25, -15]} mat={mats.concrete()} r={0.05} />
      {[HEAD_X0 + 8, HEAD_X0 + 22, HEAD_X0 + 36, HEAD_X0 + 50].map((x) => (
        <AssetModel key={x} id="mooring-bollard-2d4bc9" size={1.2} ground position={[x, DECK_Y, -29.6]} />
      ))}
      <AssetModel id="lifebuoy-on-a-post-57421b" size={1.8} ground position={[HEAD_X0 + 4, DECK_Y, -1]} />
    </group>
  );
};

// ------------------------------------------------------------------ AUDIRA lettering (canvas texture, world prop)
const textTex = (text: string, w: number, h: number, bg: string, fg: string, font: string) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  if (bg !== "none") {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.fillStyle = fg;
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + h * 0.04);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const Signboard: React.FC<{ pos: V3; w?: number; rotY?: number }> = ({ pos, w = 9, rotY = 0 }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: textTex("AUDIRA", 1024, 256, "#0B3D2E", "#ffffff", "900 170px 'Arial Black', Arial, sans-serif"), roughness: 0.6 }), []);
  const h = w / 4;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box size={[0.25, 3.2, 0.25]} pos={[-w * 0.38, 1.6, -0.15]} mat={mats.dark()} />
      <Box size={[0.25, 3.2, 0.25]} pos={[w * 0.38, 1.6, -0.15]} mat={mats.dark()} />
      <mesh position={[0, 3.2 + h / 2 - 0.4, 0]} material={mat} castShadow>
        <boxGeometry args={[w, h, 0.12]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ shore
export const Shore: React.FC = () => (
  <group>
    <AssetModel id="old-lighthouse-48ca6c" size={16} ground position={[-62, 2.5, -14]} />
    <AssetModel id="dock-warehouse-bf0967" size={34} ground position={[-90, 2.5, -40]} />
    <AssetModel id="dock-warehouse-bf0967" size={30} ground position={[-92, 2.5, -85]} rotation={[0, Math.PI / 2, 0]} />
    {[[-50, -4], [-56, -30], [-48, -52], [-70, 4], [-110, -10], [-120, -60]].map(([x, z], i) => (
      <AssetModel key={i} id="palm-tree-a307da" size={9 + (i % 3)} ground position={[x, 2.5, z]} rotation={[0, i * 1.3, 0]} />
    ))}
  </group>
);

// ------------------------------------------------------------------ cargo ship (procedural hull, research: "kapal besar")
const CONT = ["#b23a2e", "#2f6f9f", "#e0a526", "#3c7d4a", "#d9d4c7", "#7c3f8c"];
export const Ship: React.FC<{ pos: V3 }> = ({ pos }) => {
  const hullMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#20344f", roughness: 0.55, metalness: 0.2 }), []);
  const redMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a3302a", roughness: 0.6 }), []);
  const cont = useMemo(() => {
    const g = new THREE.BoxGeometry(5.8, 2.5, 2.35);
    const im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.2 }), 140);
    const m = new THREE.Matrix4();
    let i = 0;
    for (let bx = 0; bx < 10; bx++)
      for (let row = 0; row < 5; row++)
        for (let tier = 0; tier < 3; tier++) {
          if ((bx * 7 + row * 3 + tier * 5) % 11 === 0 && tier === 2) continue;
          if (i >= 140) break;
          m.makeTranslation(-30 + bx * 6.1, 8.6 + tier * 2.55, -5.2 + row * 2.6);
          im.setMatrixAt(i, m);
          im.setColorAt(i, new THREE.Color(CONT[(bx * 5 + row * 3 + tier) % CONT.length]));
          i++;
        }
    im.count = i;
    im.castShadow = true;
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return im;
  }, []);
  return (
    <group position={pos}>
      <Box size={[84, 6, 15]} pos={[0, 4, 0]} mat={hullMat} r={1.2} />
      <Box size={[84, 3.2, 14.8]} pos={[0, -0.4, 0]} mat={redMat} r={0.8} />
      {/* bow */}
      <mesh position={[42, 2.6, 0]} rotation={[0, 0, 0]} material={hullMat} castShadow>
        <cylinderGeometry args={[7.5, 5.5, 8.6, 24, 1, false, 0, Math.PI]} />
      </mesh>
      {/* bridge at the stern */}
      <Box size={[8, 9, 13]} pos={[-36, 11.5, 0]} mat={mats.white()} />
      <Box size={[8.2, 1.2, 13.2]} pos={[-36, 14.2, 0]} mat={mats.dark()} />
      <primitive object={cont} />
    </group>
  );
};

// ------------------------------------------------------------------ working barge + crane (GLB) + guide frame
export const BARGE = { x0: 172, x1: 226, z0: -36, z1: -3, deck: 1.4 };
export const GUIDE: V3 = [180, 2.4, 0];
const BargeText: React.FC = () => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: textTex("AUDIRA", 1024, 256, "none", "#ffffff", "900 190px 'Arial Black', Arial, sans-serif"), transparent: true, toneMapped: false }), []);
  return (
    <mesh position={[208, -0.1, BARGE.z1 + 0.03]} material={mat}>
      <planeGeometry args={[10, 2.5]} />
    </mesh>
  );
};
export const Barge: React.FC = () => {
  const { x0, x1, z0, z1, deck } = BARGE;
  return (
    <group>
      <Box size={[x1 - x0, 3.4, z1 - z0]} pos={[(x0 + x1) / 2, deck - 1.7, (z0 + z1) / 2]} mat={mats.barge()} r={0.4} />
      <Box size={[x1 - x0 + 0.1, 0.5, z1 - z0 + 0.1]} pos={[(x0 + x1) / 2, -0.35, (z0 + z1) / 2]} mat={mats.rust()} r={0.2} />
      <BargeText />
      {/* stacked piles waiting on deck */}
      {[[-14.6, 0], [-13.2, 0], [-13.9, 1.2]].map(([z, y], i) => (
        <mesh key={i} position={[206, deck + PILE_R + y, z]} rotation={[0, 0, Math.PI / 2]} material={mats.steel()} castShadow receiveShadow>
          <cylinderGeometry args={[PILE_R, PILE_R, 34, 20]} />
        </mesh>
      ))}
      {/* guide frame (template) on the barge side: square collar the pile passes through (research [16]) */}
      <group>
        <Box size={[0.5, 0.6, z1 - 0 + 2.2 + 0.0]} pos={[GUIDE[0] - 1.5, GUIDE[1], (z1 + 1.3) / 2 - 0.2]} mat={mats.yellow()} />
        <Box size={[0.5, 0.6, z1 - 0 + 2.2 + 0.0]} pos={[GUIDE[0] + 1.5, GUIDE[1], (z1 + 1.3) / 2 - 0.2]} mat={mats.yellow()} />
        <Box size={[3.5, 0.6, 0.5]} pos={[GUIDE[0], GUIDE[1], 1.3]} mat={mats.yellow()} />
        <Box size={[3.5, 0.6, 0.5]} pos={[GUIDE[0], GUIDE[1], -1.3]} mat={mats.yellow()} />
        <Box size={[0.4, 1.8, 0.4]} pos={[GUIDE[0] - 1.5, deck + 0.0, z1 + 0.2]} mat={mats.yellow()} />
        <Box size={[0.4, 1.8, 0.4]} pos={[GUIDE[0] + 1.5, deck + 0.0, z1 + 0.2]} mat={mats.yellow()} />
      </group>
    </group>
  );
};

/** Mobile crane GLB on the barge. Loaded directly (not AssetModel) to hide the catalogue's slung planks and
 *  read the sheave (boom tip) position for the hoist rope. */
export const CRANE_POS: V3 = [180, BARGE.deck, -19];
const CRANE_SCALE = 2.6;
const craneCache: { scene: THREE.Group | null; tip: THREE.Vector3 | null } = { scene: null, tip: null };
// The GLB boom points to local +z; with rotY 0 and scale 2.6 its tip ("fall" node, local 0, 9.03, 7.36) lands
// above the guide frame at (180, 24.9, 0.1).
const craneXform = () => ({ scale: CRANE_SCALE, rotY: 0, tip: craneCache.tip ?? new THREE.Vector3(0, 9.03, 7.36) });
export const Crane: React.FC = () => {
  const [scene, setScene] = useState<THREE.Group | null>(craneCache.scene);
  useLayoutEffect(() => {
    if (craneCache.scene) return;
    const h = delayRender("ep060 crane glb");
    new GLTFLoader().load(
      staticFile("models/polyfork/mobile-crane-671d3f.glb"),
      (g) => {
        g.scene.traverse((o) => {
          if (o.name === "load" || o.name === "fall") o.visible = false;
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            // worn site paint instead of the catalogue's glossy toy finish
            const ms = (o as THREE.Mesh).material as THREE.Material | THREE.Material[];
            (Array.isArray(ms) ? ms : [ms]).forEach((m) => {
              const s = m as THREE.MeshStandardMaterial;
              if (!s.isMeshStandardMaterial) return;
              s.roughness = Math.max(s.roughness, 0.72);
              s.metalness = Math.min(s.metalness, 0.25);
              s.color.multiplyScalar(0.86);
              if (!s.map) {
                const g = grain(71, 1.4);
                s.roughnessMap = g.map;
                s.normalMap = g.normalMap;
                s.normalScale = new THREE.Vector2(0.6, 0.6);
              }
              s.needsUpdate = true;
            });
          }
        });
        g.scene.updateMatrixWorld(true);
        const sheave = g.scene.getObjectByName("fall");
        craneCache.tip = sheave ? sheave.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 9.03, 7.36);
        craneCache.scene = g.scene;
        setScene(g.scene);
        continueRender(h);
      },
      undefined,
      () => continueRender(h),
    );
  }, []);
  if (!scene) return null;
  const { scale, rotY } = craneXform();
  return (
    <group position={CRANE_POS} rotation={[0, rotY, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};
/** World position of the crane's boom tip (sheave), from the loaded GLB. */
export const craneTip = (): V3 => {
  const { scale, rotY, tip } = craneXform();
  const v = tip.clone().multiplyScalar(scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  return [v.x + CRANE_POS[0], v.y + CRANE_POS[1], v.z + CRANE_POS[2]];
};

/** Thin cylinder between two points (hoist rope). */
export const Rope: React.FC<{ a: V3; b: V3; r?: number }> = ({ a, b, r = 0.07 }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <mesh position={mid.toArray() as V3} quaternion={q} material={mats.cable()}>
      <cylinderGeometry args={[r, r, Math.max(0.01, len), 6]} />
    </mesh>
  );
};

// ------------------------------------------------------------------ the pile being driven
export const PILE_LEN = 34;
/** A single steel pile with white 1 m marker rings near the head (the "every blow is measured" scale). */
export const DrivenPile: React.FC<{ bottom: V3; rotZ: number; marks?: boolean; len?: number }> = ({ bottom, rotZ, marks, len = PILE_LEN }) => (
  <group position={bottom} rotation={[0, 0, rotZ]}>
    <mesh position={[0, len / 2, 0]} material={mats.steel()} castShadow receiveShadow>
      <cylinderGeometry args={[PILE_R, PILE_R, len, 24]} />
    </mesh>
    {marks &&
      Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, len - 1 - i, 0]} material={i % 5 === 0 ? mats.orange() : mats.white()}>
          <cylinderGeometry args={[PILE_R * 1.02, PILE_R * 1.02, i % 5 === 0 ? 0.16 : 0.08, 24]} />
        </mesh>
      ))}
  </group>
);

export const Vibro: React.FC<{ top: V3; shake: number }> = ({ top, shake }) => (
  <group position={[top[0] + shake, top[1], top[2]]}>
    <Box size={[2.6, 2.2, 2.6]} pos={[0, 1.1, 0]} mat={mats.orange()} />
    <Box size={[1.6, 0.8, 1.6]} pos={[0, 2.6, 0]} mat={mats.dark()} />
  </group>
);
/** Impact hammer on the pile head: housing + ram; `lift` 0..1 raises the ram inside the housing. */
export const Hammer: React.FC<{ top: V3; lift: number }> = ({ top, lift }) => (
  <group position={top}>
    <mesh position={[0, 0.5, 0]} material={mats.dark()} castShadow>
      <cylinderGeometry args={[1.0, 1.0, 1.0, 24]} />
    </mesh>
    <mesh position={[0, 1.2 + lift * 1.4 + 2.4, 0]} material={mats.yellow()} castShadow>
      <cylinderGeometry args={[0.95, 0.95, 4.8, 24]} />
    </mesh>
    {/* open frame (leader) around the ram */}
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * Math.PI / 2 + 0.78) * 1.15, 4.4, Math.sin(i * Math.PI / 2 + 0.78) * 1.15]} material={mats.dark()} castShadow>
        <boxGeometry args={[0.22, 7.8, 0.22]} />
      </mesh>
    ))}
    <mesh position={[0, 8.4, 0]} material={mats.dark()}>
      <cylinderGeometry args={[1.35, 1.35, 0.4, 24]} />
    </mesh>
  </group>
);
/** Expanding ring at the pile head or the waterline on each blow. */
export const Ring: React.FC<{ pos: V3; k: number; size?: number }> = ({ pos, k, size = 3 }) =>
  k <= 0 || k >= 1 ? null : (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[PILE_R + k * size, PILE_R + k * size + 0.18, 40]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={(1 - k) * 0.8} depthWrite={false} />
    </mesh>
  );

// ------------------------------------------------------------------ floating pontoon set (separate small harbour)
/** Pontoon (HDPE boxes) whose collars ride two steel piles; `level` = water level (tide). Local coords. */
export const PontoonSet: React.FC<{ t: number; level: number }> = ({ t, level }) => {
  const bed = -9;
  const piles: PileSpec[] = [-7, 7].map((x) => ({ x, z: -8.2, bot: bed - 9, top: 6.5 }));
  const surf = useMemo(() => {
    const m = waterMat(12, false, "#1a6f8c");
    m.opacity = 0.88;
    return m;
  }, []);
  (surf.normalMap as THREE.Texture).offset.set(t * 0.006, t * 0.003);
  const faceMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#3a9cc4", transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }), []);
  const deckY = level + 0.55;
  const quayTop = 4.2;
  const gx0 = -15, gx1 = -9;
  const ang = Math.atan2(deckY - quayTop, gx1 - gx0);
  const glen = Math.hypot(gx1 - gx0, deckY - quayTop);
  return (
    <group>
      {/* seabed slab + quay wall on the left */}
      <Box size={[90, 30, 60]} pos={[0, bed - 15, -30]} mat={mats.mud()} r={0.1} />
      <Box size={[90, 20, 60]} pos={[0, bed - 30 + 0.1, -30.1]} mat={mats.hard()} r={0.1} />
      <Box size={[30, quayTop - bed + 30, 60]} pos={[-30, (quayTop + bed - 30) / 2, -30]} mat={mats.concrete()} r={0.2} />
      <mesh position={[15, level, -30]} rotation={[-Math.PI / 2, 0, 0]} material={surf}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <mesh position={[15, (level + bed) / 2, 0.03]} material={faceMat} renderOrder={5}>
        <planeGeometry args={[60, level - bed]} />
      </mesh>
      <Piles list={piles} />
      {/* pontoon: two HDPE floats with a deck, collars around the piles */}
      <group position={[0, level, 0]}>
        <Box size={[22, 1.4, 7.6]} pos={[0, -0.25, -4]} mat={mats.hdpe()} r={0.3} />
        <Box size={[22.2, 0.2, 7.8]} pos={[0, 0.5, -4]} mat={mats.girder()} r={0.05} />
        {[-7, 7].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.3, -8.2]} rotation={[Math.PI / 2, 0, 0]} material={mats.yellow()} castShadow>
              <torusGeometry args={[PILE_R + 0.25, 0.18, 10, 28]} />
            </mesh>
            <Box size={[1.8, 0.35, 0.4]} pos={[x, 0.3, -7.2]} mat={mats.yellow()} />
          </group>
        ))}
        <AssetModel id="mooring-bollard-2d4bc9" size={0.8} ground position={[4, 0.6, -1]} />
      </group>
      {/* gangway: hinged at the quay, resting on the pontoon */}
      <group position={[gx0, quayTop, -4]} rotation={[0, 0, ang]}>
        <Box size={[glen, 0.25, 2]} pos={[glen / 2, 0, 0]} mat={mats.steel()} r={0.05} />
        <Box size={[glen, 0.08, 0.08]} pos={[glen / 2, 1, 0.95]} mat={mats.dark()} r={0.02} />
      </group>
      <group position={[2, level, -16]}>
        <AssetModel id="small-fishing-boat-4ac0e3" size={12} ground position={[0, -1.6, 0]} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  );
};

/** Ruler on the cut face: depth from the sea surface to the seabed at x. */
export const DepthRuler: React.FC<{ x: number; k: number }> = ({ x, k }) => {
  const bed = seabedY(x);
  const h = -bed * k;
  return (
    <group position={[x, 0, 1.2]}>
      <Box size={[0.35, Math.max(0.01, h), 0.35]} pos={[0, -h / 2, 0]} mat={mats.white()} r={0.05} />
      <Box size={[2.2, 0.3, 0.35]} pos={[0, 0, 0]} mat={mats.white()} r={0.05} />
      {k > 0.98 && <Box size={[2.2, 0.3, 0.35]} pos={[0, bed, 0]} mat={mats.white()} r={0.05} />}
    </group>
  );
};
