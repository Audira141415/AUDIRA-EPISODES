// BATIKFORGE cloth: a kain hung on a wooden gawangan in a dim workshop. One lit standard material,
// with its colour computed from the motif data texture (wax order, dye shade, dye arrival):
// cotton → wax lines appear in order → the indigo climbs from the hem and stops at the wax → the
// border takes soga brown → the wax cracks (remukan) where the dye crept in. A 3D copper canting
// draws the first line as a raised wax bead.

import React, { useMemo } from "react";
import * as THREE from "three";
import { useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { GroundShadow } from "../../../core/polish/Drei.tsx";
import { CLOTH_H, CLOTH_W, batikData, firstStroke } from "../lib/motif.ts";
import { BATIK_PALETTE as P } from "../lib/palette.ts";

export const CLOTH_Y = 1.45; // centre of the cloth
export const CLOTH_Z = 0;

const c3 = (hex: string) => new THREE.Color(hex);

/** The cloth's fold depth at a cloth-local point: soft vertical folds, deeper toward the hem. */
export const foldZ = (x: number, y: number) => {
  const hang = (CLOTH_H / 2 - y) / CLOTH_H;
  return Math.sin(x * 9 + 0.6) * 0.012 * (0.3 + hang) + Math.sin(x * 23) * 0.003;
};

function clothMaterial() {
  const data = batikData();
  const uniforms = {
    uData: { value: data },
    uWax: { value: 0 },
    uDye: { value: 0 },
    uSoga: { value: 0 },
    uCotton: { value: c3(P.cotton) },
    uWaxCol: { value: c3(P.wax) },
    uIndigo: { value: c3(P.indigo) },
    uIndigoDeep: { value: c3(P.indigoDeep) },
    uSky: { value: c3(P.sky) },
    uSogaCol: { value: c3(P.soga) },
  };
  const m = new THREE.MeshStandardMaterial({ roughness: 0.88, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vBUv;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvBUv = uv;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vBUv;
        uniform sampler2D uData; uniform float uWax, uDye, uSoga;
        uniform vec3 uCotton, uWaxCol, uIndigo, uIndigoDeep, uSky, uSogaCol;
        float bh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float bn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(bh(i), bh(i+vec2(1,0)), f.x), mix(bh(i+vec2(0,1)), bh(i+vec2(1,1)), f.x), f.y); }`,
      )
      .replace(
        "#include <map_fragment>",
        `vec4 bd = texture2D(uData, vBUv);
        float waxOn = step(0.008, bd.r) * step(bd.r, uWax + 0.0005);
        float front = uDye - bd.b;
        float dyed = smoothstep(-0.02, 0.01, front);
        float wet = smoothstep(0.0, 0.03, front) * (1.0 - smoothstep(0.03, 0.12, front));
        float cloud = step(0.12, bd.g) * step(bd.g, 0.9);
        float border = step(0.9, bd.g);
        vec3 dye = mix(uIndigo, uSky, cloud * smoothstep(0.15, 0.85, bd.g) * 0.85);
        dye = mix(dye, uIndigoDeep, wet * 0.6);
        dye = mix(dye, uSogaCol, border * uSoga);
        // cotton weave: faint cross threads
        float weave = 0.96 + 0.04 * sin(vBUv.x * 2600.0) * sin(vBUv.y * 4200.0);
        vec3 col = mix(uCotton, dye, dyed) * weave;
        // wax: amber, cracked where the dye crept in (thin dark veins)
        float n = bn(vBUv * vec2(70.0, 113.0)) * 0.6 + bn(vBUv * vec2(190.0, 307.0)) * 0.4;
        float crack = (1.0 - smoothstep(0.0, 0.025, abs(n - 0.5))) * dyed;
        vec3 waxc = mix(uWaxCol, uIndigo * 0.8, crack * 0.75);
        col = mix(col, waxc, waxOn);
        diffuseColor.rgb *= col;`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.45, waxOn);`,
      );
  };
  return { m, uniforms };
}

let CURVE: THREE.CatmullRomCurve3 | null = null;
/** The first wax line as a curve in cloth-local metres (closed loop round the big cloud). */
const strokeCurve = () => {
  if (CURVE) return CURVE;
  // the bead rides on the folds, a hair above the cotton
  const pts = firstStroke().map(([x, y]) => new THREE.Vector3(x, y, foldZ(x, y) + 0.0025));
  pts.push(pts[0].clone());
  return (CURVE = new THREE.CatmullRomCurve3(pts, false));
};
/** World position of the canting tip after drawing fraction k of the first line. */
export const tipAt = (k: number): [number, number, number] => {
  const p = strokeCurve().getPointAt(Math.min(1, Math.max(0, k)));
  return [p.x, p.y + CLOTH_Y, p.z + CLOTH_Z + 0.003];
};

/** Raised wax bead along the first line, grown to `k` (0..1). */
const WaxBead: React.FC<{ k: number }> = ({ k }) => {
  const { geo, perSeg } = useMemo(() => {
    const curve = strokeCurve();
    const segs = 400, radial = 6;
    return { geo: new THREE.TubeGeometry(curve, segs, 0.0035, radial, false), perSeg: radial * 6, segs };
  }, []);
  geo.setDrawRange(0, Math.floor(k * 400) * perSeg);
  if (k <= 0) return null;
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color={P.wax} roughness={0.35} clearcoat={0.6} />
    </mesh>
  );
};

/** Copper canting: a tiny bowl with a spout and a bamboo handle; the spout tip sits at the origin. */
export const Canting: React.FC<{ position: [number, number, number]; tilt?: number }> = ({ position, tilt = 0 }) => {
  const bowl = useMemo(() => {
    const p = [[0, 0], [0.012, 0.002], [0.02, 0.012], [0.021, 0.024], [0.019, 0.026], [0.0, 0.026]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(p, 32);
  }, []);
  return (
    <group position={position} rotation={[0.55 + tilt, -0.5, -0.55]} scale={0.8}>
      {/* spout: from the tip back up to the bowl */}
      <mesh position={[0, 0.022, 0]} castShadow>
        <cylinderGeometry args={[0.0022, 0.0012, 0.045, 12]} />
        <meshStandardMaterial color={P.copper} metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh geometry={bowl} position={[0, 0.042, 0]} castShadow>
        <meshStandardMaterial color={P.copper} metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.067, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.02, 24]} />
        <meshPhysicalMaterial color="#C99A4A" roughness={0.2} clearcoat={1} />
      </mesh>
      {/* bamboo handle */}
      <mesh position={[0, 0.06, -0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.0065, 0.17, 16]} />
        <meshStandardMaterial color={P.bamboo} roughness={0.55} />
      </mesh>
    </group>
  );
};

/** Workshop: plank wall, floor, the gawangan and the hung kain. */
export const Cloth3D: React.FC<{ wax: number; dye: number; soga: number; bead: number }> = ({ wax, dye, soga, bead }) => {
  const { m, uniforms } = useMemo(clothMaterial, []);
  uniforms.uWax.value = wax;
  uniforms.uDye.value = dye;
  uniforms.uSoga.value = soga;
  const grain = useSurfaceGrain(29, 0.4, 4);
  const clothGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(CLOTH_W, CLOTH_H, 48, 80);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      p.setZ(i, foldZ(p.getX(i), p.getY(i)));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const top = CLOTH_Y + CLOTH_H / 2;
  return (
    <group>
      <mesh position={[0, 2.2, -1.4]} receiveShadow>
        <boxGeometry args={[8, 4.4, 0.1]} />
        <meshStandardMaterial color={P.wall} roughness={0.9} roughnessMap={grain} bumpMap={grain} bumpScale={0.8} />
      </mesh>
      {/* plank seams */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[-3.75 + i * 0.5, 2.2, -1.345]}>
          <boxGeometry args={[0.012, 4.4, 0.01]} />
          <meshStandardMaterial color="#2C1F16" roughness={1} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color={P.floor} roughness={0.95} />
      </mesh>
      <GroundShadow scale={3} opacity={0.55} blur={2.5} far={2.5} />

      {/* gawangan: two posts on feet and a top bar */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <mesh position={[sx * (CLOTH_W / 2 + 0.12), (top + 0.08) / 2, -0.04]} castShadow>
            <boxGeometry args={[0.07, top + 0.08, 0.07]} />
            <meshStandardMaterial color={P.wood} roughness={0.6} roughnessMap={grain} />
          </mesh>
          <mesh position={[sx * (CLOTH_W / 2 + 0.12), 0.03, -0.04]} castShadow>
            <boxGeometry args={[0.1, 0.06, 0.55]} />
            <meshStandardMaterial color={P.wood} roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, top + 0.02, -0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, CLOTH_W + 0.4, 20]} />
        <meshStandardMaterial color={P.wood} roughness={0.5} />
      </mesh>
      <mesh geometry={clothGeo} material={m} position={[0, CLOTH_Y, CLOTH_Z]} castShadow receiveShadow />
      <group position={[0, CLOTH_Y, CLOTH_Z]}>
        <WaxBead k={bead} />
      </group>
    </group>
  );
};
