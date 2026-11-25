// The beach at golden hour: a sky dome (gradient, sun glow), the sea (sky reflection, sun glitter,
// shore foam, transparent shallows over wet sand), the beach (near patch is real geometry carrying
// the heap the sculpture is made from and the apron of eroded sand; far beach is flat with ripple
// bump), the final swash that runs up to the plinth, and the sculptor's bucket, trowel and shells.

import React, { useMemo } from "react";
import * as THREE from "three";
import { GLSL_NOISE, GLSL_SKY, SEA_Y, beachSlope, heapHeight, pileHeight, rippleHeight, rng } from "../lib/noise.ts";
import { beachMaterial, beachShared } from "../lib/sandMaterial.ts";
import { PASIR_PALETTE as P, SAND } from "../lib/palette.ts";

type V3 = [number, number, number];

/** Surface height of the beach (heap + apron + ripples + slope into the sea). */
export const beachHeight = (x: number, z: number, heap: number, pile: number) =>
  heapHeight(x, z, heap) + pileHeight(x, z, pile) + rippleHeight(x, z) + beachSlope(z);

const skyUniforms = (sun: V3) => ({
  uSun: { value: new THREE.Vector3(...sun) },
  uSkyTop: { value: new THREE.Color(P.skyTop) },
  uSkyMid: { value: new THREE.Color(P.skyMid) },
  uHorizon: { value: new THREE.Color(P.horizon) },
  uSunGlow: { value: new THREE.Color(P.sunGlow) },
  uSunCol: { value: new THREE.Color(P.sun) },
});

const SkyDome: React.FC<{ sun: V3 }> = ({ sun }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: skyUniforms(sun),
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: `varying vec3 vWp; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `${GLSL_SKY}\nvarying vec3 vWp; void main(){ vec3 d = normalize(vWp - cameraPosition); gl_FragColor = vec4(pfSky(d), 1.0); }`,
      }),
    [],
  );
  (mat.uniforms.uSun.value as THREE.Vector3).set(...sun);
  return (
    <mesh material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[340, 48, 24]} />
    </mesh>
  );
};

const Sea: React.FC<{ t: number; sun: V3; level: number }> = ({ t, sun, level }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          ...skyUniforms(sun),
          uTime: { value: 0 },
          uLevel: { value: SEA_Y },
          uDeep: { value: new THREE.Color(P.seaDeep) },
          uNear: { value: new THREE.Color(P.seaNear) },
          uFoam: { value: new THREE.Color(P.foam) },
        },
        transparent: true,
        vertexShader: `varying vec3 vWp; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `${GLSL_SKY}\n${GLSL_NOISE}
          uniform float uTime, uLevel; uniform vec3 uDeep, uNear, uFoam; varying vec3 vWp;
          void main(){
            vec3 toP = vWp - cameraPosition; float dist = length(toP); vec3 V = toP / dist;
            vec2 p = vWp.xz; float tt = uTime;
            float fadeHi = 1.0 - smoothstep(20.0, 90.0, dist);
            vec2 grad = vec2(
              0.018 * cos(p.x * 0.8 + p.y * 0.3 + tt * 0.9) + (pfNoise3(vec3(p * 1.3, tt * 0.4)) - 0.5) * 0.09 + (pfNoise3(vec3(p * 4.0, tt * 0.7)) - 0.5) * 0.07 * fadeHi,
              0.025 * cos(p.y * 1.1 + tt * 1.25) + (pfNoise3(vec3(p * 1.3 + 7.0, tt * 0.4)) - 0.5) * 0.09 + (pfNoise3(vec3(p * 4.0 + 3.0, tt * 0.7)) - 0.5) * 0.07 * fadeHi);
            vec3 n = normalize(vec3(-grad.x, 1.0, -grad.y));
            vec3 R = reflect(V, n); R.y = abs(R.y) + 0.02;
            vec3 refl = pfSky(normalize(R));
            float fres = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
            float groundY = -0.035 * max(0.0, -vWp.z - 2.0);
            float depth = uLevel - groundY;
            if (depth < 0.0) discard;
            vec3 body = mix(uNear, uDeep, smoothstep(0.0, 0.5, depth));
            vec3 col = mix(body, refl * vec3(1.0, 0.94, 0.86), clamp(fres * 0.95, 0.0, 1.0));
            col += uSunCol * pow(max(dot(normalize(R), uSun), 0.0), 350.0) * 5.0;
            // Shore foam: a lacy edge and incoming crest lines in the shallows.
            float lace = pfNoise3(vec3(p * 5.0, tt * 0.8));
            float edgeFoam = (1.0 - smoothstep(0.0, 0.022 + lace * 0.02, depth));
            float crest = smoothstep(0.86, 1.0, sin(vWp.z * 3.4 + tt * 2.3 + lace * 2.0)) * (1.0 - smoothstep(0.03, 0.16, depth));
            float foam = clamp(edgeFoam * 0.9 + crest * 0.75 * smoothstep(0.35, 0.7, lace), 0.0, 1.0);
            col = mix(col, uFoam * (0.85 + 0.25 * max(uSun.y, 0.0)), foam);
            col = mix(col, uHorizon * 1.05, smoothstep(60.0, 300.0, dist) * 0.8);
            float alpha = mix(smoothstep(0.0, 0.03, depth) * 0.85, 1.0, foam);
            alpha = max(alpha, smoothstep(0.03, 0.2, depth));
            gl_FragColor = vec4(col, alpha);
          }`,
      }),
    [],
  );
  mat.uniforms.uTime.value = t;
  mat.uniforms.uLevel.value = level;
  (mat.uniforms.uSun.value as THREE.Vector3).set(...sun);
  return (
    <mesh material={mat} position={[0, level, -151.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[700, 300]} />
    </mesh>
  );
};

/** The swash: a thin sheet of water running up the near beach with a foam lip. */
const swashMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { uFront: { value: -99 }, uTime: { value: 0 }, uFoam: { value: new THREE.Color(P.foam) }, uWater: { value: new THREE.Color("#8FB2B0") }, uHorizon: { value: new THREE.Color(P.horizon) } },
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    vertexShader: `varying vec3 vWp; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); w.y += 0.006; vWp = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `${GLSL_NOISE}
      uniform float uFront, uTime; uniform vec3 uFoam, uWater, uHorizon; varying vec3 vWp;
      void main(){
        float lace = pfNoise3(vec3(vWp.x * 4.0, vWp.z * 4.0, uTime * 0.7));
        float front = uFront + 0.22 * sin(vWp.x * 1.3 + 0.7) + 0.12 * sin(vWp.x * 3.1) + (lace - 0.5) * 0.12;
        float d = front - vWp.z;
        if (d < 0.0) discard;
        float lip = 1.0 - smoothstep(0.0, 0.06 + lace * 0.08, d);
        float bubbles = smoothstep(0.55, 0.8, pfNoise3(vec3(vWp.x * 22.0, vWp.z * 22.0, uTime))) * (1.0 - smoothstep(0.05, 0.6, d));
        vec3 V = normalize(vWp - cameraPosition);
        float fres = pow(1.0 - abs(V.y), 4.0);
        vec3 col = mix(uWater, uHorizon, 0.35 + 0.5 * fres);
        col = mix(col, uFoam, clamp(lip + bubbles * 0.6, 0.0, 1.0));
        float alpha = clamp(0.3 + 0.4 * fres + lip * 0.6 + bubbles * 0.4, 0.0, 0.95) * smoothstep(0.0, 0.015, d);
        gl_FragColor = vec4(col, alpha);
      }`,
  });

const NEAR = { size: 8.4, seg: 240 };

export const Beach3D: React.FC<{ t: number; sun: V3; heap: number; pile: number; seaY: number; swash: number; wetFront: number }> = ({ t, sun, heap, pile, seaY, swash, wetFront }) => {
  const shared = useMemo(() => beachShared(), []);
  const nearMat = useMemo(() => beachMaterial(shared, false), [shared]);
  const farMat = useMemo(() => beachMaterial(shared, true), [shared]);
  const swashMat = useMemo(() => swashMaterial(), []);
  shared.uWetFront.value = wetFront;
  swashMat.uniforms.uFront.value = swash;
  swashMat.uniforms.uTime.value = t;

  const near = useMemo(() => {
    const g = new THREE.PlaneGeometry(NEAR.size, NEAR.size, NEAR.seg, NEAR.seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const base = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      // Ripples fade to zero at the patch edge so it meets the flat far beach without a step.
      const edge = Math.max(Math.abs(x), Math.abs(z)) / (NEAR.size / 2);
      base[i] = rippleHeight(x, z) * (1 - Math.max(0, (edge - 0.8) / 0.2)) + beachSlope(z);
    }
    g.setAttribute("aFresh", new THREE.BufferAttribute(new Float32Array(pos.count), 1));
    return { g, base };
  }, []);
  useMemo(() => {
    const pos = near.g.attributes.position as THREE.BufferAttribute;
    const fresh = near.g.attributes.aFresh as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const p = pileHeight(x, z, pile);
      pos.setY(i, near.base[i] + heapHeight(x, z, heap) + p);
      fresh.setX(i, Math.min(1, p * 30 + heapHeight(x, z, heap) * 6));
    }
    pos.needsUpdate = true;
    fresh.needsUpdate = true;
    near.g.computeVertexNormals();
    near.g.computeBoundingSphere();
  }, [near, heap, pile]);

  const far = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 160, 160);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, beachSlope(pos.getZ(i)) - 0.004);
    g.setAttribute("aFresh", new THREE.BufferAttribute(new Float32Array(pos.count), 1));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      <SkyDome sun={sun} />
      <Sea t={t} sun={sun} level={seaY} />
      <mesh geometry={far} material={farMat} receiveShadow />
      <mesh geometry={near.g} material={nearMat} receiveShadow castShadow />
      {swash > -50 && <mesh geometry={near.g} material={swashMat} renderOrder={2} />}
      <Props />
    </group>
  );
};

/** The sculptor's kit left on the sand: a bucket, a trowel stuck upright, and a few shells. */
const Props: React.FC = () => {
  const shells = useMemo(() => {
    const r = rng(404);
    const out: { p: V3; s: number; ry: number }[] = [];
    while (out.length < 14) {
      const x = (r() - 0.5) * 7.4, z = -2.2 + r() * 5.4;
      if (Math.abs(x) < 1.9 && z > -1.7 && z < 1.7) continue;
      out.push({ p: [x, rippleHeight(x, z) + beachSlope(z) + 0.006, z], s: 0.025 + r() * 0.03, ry: r() * Math.PI * 2 });
    }
    return out;
  }, []);
  return (
    <group>
      {/* Bucket of wet sand and the water the sculptor packs with */}
      <group position={[2.15, 0, 1.55]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.17, 0.135, 0.3, 40, 1, true]} />
          <meshPhysicalMaterial color="#E0612F" roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.135, 40]} />
          <meshStandardMaterial color="#C4552A" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.162, 40]} />
          <meshStandardMaterial color={SAND.wet} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.17, 0.012, 10, 48]} />
          <meshPhysicalMaterial color="#E86A35" roughness={0.4} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.32, 0]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.17, 0.006, 8, 48, Math.PI]} />
          <meshStandardMaterial color="#3A3A3A" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>
      {/* Trowel stuck in the sand */}
      <group position={[-2.05, 0, 1.45]} rotation={[0.25, 0.6, -0.18]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.11, 0.17, 0.006]} />
          <meshStandardMaterial color="#B9BEC4" roughness={0.32} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
          <meshStandardMaterial color="#8E9399" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.016, 0.13, 16]} />
          <meshStandardMaterial color="#7A4A26" roughness={0.6} />
        </mesh>
      </group>
      {shells.map((s, i) => (
        <mesh key={i} position={s.p} rotation={[-Math.PI / 2 + 0.15, 0, s.ry]} scale={[s.s, s.s * 0.85, s.s * 0.35]} castShadow>
          <sphereGeometry args={[1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={i % 3 ? SAND.shell : "#E9B9A0"} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
};
