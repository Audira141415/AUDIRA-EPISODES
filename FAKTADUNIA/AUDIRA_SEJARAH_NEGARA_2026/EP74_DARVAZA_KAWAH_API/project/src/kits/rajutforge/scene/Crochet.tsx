// Crochet building blocks.
//
// <Crocheted geometry color sts rounds grow? fuzz?>: any mesh covered in single-crochet stitches.
//   The stitch tile is a colour map + normal map + height displacement, so stitches read in light
//   and in silhouette. `grow` (rounds, float) clips the piece to a spiral: stitch by stitch,
//   round by round, from uv.y = 0 upward — the piece "grows" as it is crocheted. The inside of an
//   open piece is darker (wrong side). `stripe` colours every Nth round (colour-change rows).
//   Fuzz: a couple of alpha-tested shells of short curly fibres that share the growth clip.
// <YarnTube points radius color drawn?>: a strand of plied yarn along a Catmull-Rom curve; `drawn`
//   (0..1) reveals it from the start (a strand unrolling or a cord being couched).
// <YarnBall r color spin>: a wound ball: wrapped core plus great-circle strands.

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { fibreAlpha, mulberry32, plyTexture, stitchTextures } from "../lib/stitch.ts";

type V3 = [number, number, number];

type GrowUniforms = {
  uGrow: { value: number };
  uRounds: { value: number };
  uSts: { value: number };
  uOn: { value: number };
  uStripe: { value: THREE.Color };
  uStripeOn: { value: number };
  uStripeEvery: { value: number };
};

function patch(m: THREE.Material, u: GrowUniforms, key: string, inner: number) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vGUv;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvGUv = uv;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vGUv;
        uniform float uGrow, uRounds, uSts, uOn, uStripeOn, uStripeEvery; uniform vec3 uStripe;`,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float gRow = floor(vGUv.y * uRounds);
        float gSt = floor(fract(vGUv.x) * uSts) / uSts;
        if (uOn > 0.5 && gRow + gSt > uGrow) discard;`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        if (uStripeOn > 0.5 && mod(gRow, uStripeEvery) < 1.0) diffuseColor.rgb *= uStripe;
        // the newest stitches are a touch brighter (fresh, not yet pressed flat)
        if (uOn > 0.5) diffuseColor.rgb *= 1.0 + 0.18 * smoothstep(-1.0 / uSts * 6.0, 0.0, gRow + gSt - uGrow);
        if (!gl_FrontFacing) diffuseColor.rgb *= ${inner.toFixed(3)};`,
      );
  };
  m.customProgramCacheKey = () => key;
}

export const Crocheted: React.FC<{
  geometry: THREE.BufferGeometry;
  color: string;
  /** Stitches per round (u direction) and rounds (v direction); multiples of 4 tile cleanly. */
  sts?: number;
  rounds?: number;
  /** Rounds completed (float). Undefined = finished piece. */
  grow?: number;
  /** Colour-change rounds: multiply colour and period. */
  stripe?: { color: string; every: number };
  /** Displacement depth in world units (stitch relief in the silhouette). */
  relief?: number;
  fuzz?: number;
  fuzzColor?: string;
  /** Approximate radius, to turn fuzz offsets into scale. */
  size?: number;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  castShadow?: boolean;
}> = ({ geometry, color, sts = 36, rounds = 20, grow, stripe, relief = 0.008, fuzz = 2, fuzzColor, size = 0.3, position, rotation, scale, castShadow = true }) => {
  const tex = stitchTextures();
  const u = useMemo<GrowUniforms>(
    () => ({
      uGrow: { value: 0 },
      uRounds: { value: rounds },
      uSts: { value: sts },
      uOn: { value: grow === undefined ? 0 : 1 },
      uStripe: { value: new THREE.Color(stripe?.color ?? "#ffffff") },
      uStripeOn: { value: stripe ? 1 : 0 },
      uStripeEvery: { value: stripe?.every ?? 4 },
    }),
    [rounds, sts, grow === undefined, stripe?.color, stripe?.every],
  );
  u.uGrow.value = grow ?? 1e6;

  const mats = useMemo(() => {
    const rep = (t: THREE.Texture) => {
      const c = t.clone();
      c.repeat.set(sts / 4, rounds / 4);
      c.needsUpdate = true;
      return c;
    };
    const base = new THREE.MeshPhysicalMaterial({
      color,
      map: rep(tex.map),
      normalMap: rep(tex.normal),
      normalScale: new THREE.Vector2(1.35, 1.35),
      displacementMap: rep(tex.height),
      displacementScale: relief,
      displacementBias: -relief * 0.55,
      roughness: 0.93,
      metalness: 0,
      sheen: 0.9,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.55),
      side: grow === undefined ? THREE.FrontSide : THREE.DoubleSide,
    });
    patch(base, u, "rajut-stitch", 0.5);
    const fibre = fibreAlpha();
    const shells = Array.from({ length: fuzz }, (_, i) => {
      const a = fibre.clone();
      a.repeat.set(sts / 9, rounds / 9);
      a.needsUpdate = true;
      const m = new THREE.MeshStandardMaterial({
        color: new THREE.Color(fuzzColor ?? color).lerp(new THREE.Color("#ffffff"), 0.04 + i * 0.05),
        alphaMap: a,
        alphaTest: 0.62 + i * 0.1,
        roughness: 1,
        side: THREE.DoubleSide,
      });
      patch(m, u, "rajut-fuzz", 0.6);
      return m;
    });
    return { base, shells };
  }, [color, sts, rounds, relief, fuzz, fuzzColor, grow === undefined, tex, u]);

  useEffect(() => () => {
    mats.base.dispose();
    mats.shells.forEach((m) => m.dispose());
  }, [mats]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={mats.base} castShadow={castShadow} receiveShadow />
      {mats.shells.map((m, i) => (
        <mesh key={i} geometry={geometry} material={m} scale={1 + (relief * 0.6 + 0.004 + i * 0.006) / size} />
      ))}
    </group>
  );
};

// --- Strands -----------------------------------------------------------------------------------------
export const YarnTube: React.FC<{ points: V3[]; radius?: number; color: string; drawn?: number; segments?: number; twistPerUnit?: number }> = ({
  points,
  radius = 0.012,
  color,
  drawn = 1,
  segments = 96,
  twistPerUnit = 14,
}) => {
  const key = points.map((p) => p.map((v) => v.toFixed(4)).join(",")).join(";");
  const geo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const g = new THREE.TubeGeometry(c, segments, radius, 8, false);
    (g.userData as { len: number }).len = c.getLength();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, radius, segments]);
  useEffect(() => () => geo.dispose(), [geo]);
  geo.setDrawRange(0, Math.round(segments * Math.max(0, Math.min(1, drawn))) * 8 * 6);
  const len = (geo.userData as { len: number }).len;
  const mat = useMemo(() => {
    const ply = plyTexture();
    const map = ply.map.clone(), nor = ply.normal.clone();
    map.needsUpdate = nor.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({ color, map, normalMap: nor, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.9, sheen: 0.9, sheenRoughness: 0.5, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.5) });
  }, [color]);
  mat.map!.repeat.set(Math.max(1, (len * twistPerUnit) / 4), 1);
  mat.normalMap!.repeat.copy(mat.map!.repeat);
  if (drawn <= 0) return null;
  return <mesh geometry={geo} material={mat} castShadow />;
};

/** Yarn cord letters / couched cord: a tube with stitch texture so it reads as crochet cord. */
export const CordTube: React.FC<{ points: V3[]; radius: number; color: string; drawn: number }> = ({ points, radius, color, drawn }) => {
  const key = points.map((p) => p.map((v) => v.toFixed(4)).join(",")).join(";");
  const segs = Math.max(8, points.length * 3);
  const geo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.2);
    const g = new THREE.TubeGeometry(c, segs, radius, 10, false);
    (g.userData as { len: number }).len = c.getLength();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, radius]);
  useEffect(() => () => geo.dispose(), [geo]);
  geo.setDrawRange(0, Math.round(segs * Math.max(0, Math.min(1, drawn))) * 10 * 6);
  const len = (geo.userData as { len: number }).len;
  const tex = stitchTextures();
  const mat = useMemo(() => {
    const m = tex.map.clone(), n = tex.normal.clone();
    m.needsUpdate = n.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({ color, map: m, normalMap: n, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.9, sheen: 0.9, sheenRoughness: 0.5, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.5) });
  }, [color, tex]);
  // the stitch tile is 4 x 4: u (along) = rounds, v (around) = stitches. Stitches ~ 2.2 cord radii.
  mat.map!.repeat.set(Math.max(1, len / (radius * 2.2) / 4), 1);
  mat.map!.rotation = 0;
  mat.normalMap!.repeat.copy(mat.map!.repeat);
  if (drawn <= 0) return null;
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
};

// --- Yarn ball -----------------------------------------------------------------------------------------
const UNIT_SPHERE = new THREE.SphereGeometry(1, 48, 32);
export const YarnBall: React.FC<{ r: number; color: string; position: V3; spin?: number; seed?: number }> = ({ r, color, position, spin = 0, seed = 3 }) => {
  const wraps = useMemo(() => {
    const rnd = mulberry32(seed * 977 + 5);
    return Array.from({ length: 26 }, () => {
      const a = rnd() * Math.PI, b = rnd() * Math.PI * 2;
      return { rot: [a, b, rnd() * Math.PI] as V3, tube: 0.075 + rnd() * 0.02, shade: 0.9 + rnd() * 0.18 };
    });
  }, [seed]);
  const torus = useMemo(() => new THREE.TorusGeometry(1, 0.075, 8, 72), []);
  const ply = plyTexture();
  const mats = useMemo(
    () =>
      [0.9, 1, 1.08].map((s) => {
        const m = ply.map.clone(), n = ply.normal.clone();
        m.repeat.set(18, 1);
        n.repeat.set(18, 1);
        m.needsUpdate = n.needsUpdate = true;
        const c = new THREE.Color(color).multiplyScalar(s);
        return new THREE.MeshPhysicalMaterial({ color: c, map: m, normalMap: n, roughness: 0.92, sheen: 0.9, sheenRoughness: 0.5, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.5) });
      }),
    [color, ply],
  );
  return (
    <group position={position} rotation={[spin * 0.35, spin, 0]}>
      <mesh geometry={UNIT_SPHERE} scale={r * 0.97} castShadow receiveShadow>
        <meshPhysicalMaterial color={new THREE.Color(color).multiplyScalar(0.7)} roughness={0.95} sheen={0.6} />
      </mesh>
      {wraps.map((w, i) => (
        <mesh key={i} geometry={torus} material={mats[i % 3]} rotation={w.rot} scale={r * (0.99 + (i % 4) * 0.004)} castShadow receiveShadow />
      ))}
    </group>
  );
};
