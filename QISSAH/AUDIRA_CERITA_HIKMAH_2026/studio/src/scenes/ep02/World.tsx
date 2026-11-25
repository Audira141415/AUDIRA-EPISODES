// The hill as a ceramic diorama: glazed-clay terrain, the spring basin, the path, the master's
// house, ceramic trees, the flowers on the cracked pot's side and the bare dry side, drops,
// golden seeds and the kintsugi seam along the path edge. Pure functions of the film time.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lathe } from "../../core/geometry/lathe";
import { PAL, goldMat } from "./Characters";
import { HOUSE, PATH, POOL_R, POOL_Y, SPRING, TABLE, clamp, groundY, hash, lerp, noise2, pathDx, pathX, pathY, pathZ, ramp, T, E, type V3 } from "./layout";
import { bloomAt, dropsAt, goldLineAt, isTimelapse, seedsAt, sproutAt, timelapseFlicker, uAt } from "./story";

/* ---------- sky dome (also feeds the environment map) ---------- */
const skyMaterial = () =>
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uSun: { value: new THREE.Vector3(0.5, 0.4, 0.6) }, uDim: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uSun; uniform float uDim; varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y, -0.2, 1.0);
        vec3 horizon = vec3(0.98, 0.80, 0.58);
        vec3 mid = vec3(0.93, 0.78, 0.66);
        vec3 zenith = vec3(0.47, 0.55, 0.74);
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
        c = mix(c, zenith, smoothstep(0.15, 0.85, h));
        c = mix(c, vec3(0.86, 0.66, 0.48), smoothstep(0.0, -0.2, h));
        float s = max(dot(normalize(vDir), normalize(uSun)), 0.0);
        c += vec3(1.0, 0.78, 0.45) * (pow(s, 12.0) * 0.35 + pow(s, 600.0) * 3.0);
        c *= 1.0 - uDim * 0.45;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });

export const Sky: React.FC<{ sun: THREE.Vector3; dim: number }> = ({ sun, dim }) => {
  const mat = useMemo(skyMaterial, []);
  mat.uniforms.uSun.value.copy(sun);
  mat.uniforms.uDim.value = dim;
  return (
    <mesh material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[420, 48, 24]} />
    </mesh>
  );
};

/** PMREM environment from the sky so glazes get a soft warm reflection. */
export const SkyEnvironment: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const s = new THREE.Scene();
    const m = skyMaterial();
    m.uniforms.uSun.value.set(0.6, 0.35, 0.7);
    s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), m));
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(s, 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

/* ---------- terrain ---------- */
const C_PATH = new THREE.Color("#E3BF8A");
const C_EARTH = new THREE.Color("#C88A52");
const C_EARTH2 = new THREE.Color("#B8703F");
const C_DRY = new THREE.Color("#BC7F4A");
const C_FAR = new THREE.Color("#D59A5E");
const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(70, 100, 230, 330);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -32);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const y = groundY(x, z);
      pos.setY(i, y);
      const dx = pathDx(x, z);
      const onPath = z < PATH.z0 + 0.6 && z > PATH.z0 - PATH.len - 1.5 ? 1 - THREE.MathUtils.smoothstep(Math.abs(dx), PATH.half - 0.1, PATH.half + 0.15) : 0;
      const n = noise2(x * 3, z * 3);
      c.copy(C_EARTH).lerp(C_EARTH2, n * 0.8);
      if (dx > 0) c.lerp(C_DRY, THREE.MathUtils.smoothstep(dx, 0.9, 2.5) * 0.5);
      c.lerp(C_FAR, THREE.MathUtils.smoothstep(Math.abs(dx), 6, 18) * 0.6);
      c.lerp(C_PATH, onPath);
      // tiny glaze speckle
      const sp = hash(i * 1.37) > 0.985 ? 0.08 : 0;
      col[i * 3] = c.r - sp;
      col[i * 3 + 1] = c.g - sp;
      col[i * 3 + 2] = c.b - sp;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.82, clearcoat: 0.12, clearcoatRoughness: 0.6, sheen: 0.2, sheenColor: new THREE.Color("#ffd9a8") }), []);
  return <mesh geometry={geo} material={mat} receiveShadow />;
};

/** dry crackle on the bare side: dark hairlines pressed into the clay */
const DryCracks: React.FC = () => {
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 140; i++) {
      const u = 0.03 + (i / 140) * 0.95 + (hash(i * 3.1) - 0.5) * 0.006;
      const z0 = pathZ(u);
      const x0 = pathX(u) + 1.0 + hash(i * 5.7) * 1.9;
      const pts: THREE.Vector3[] = [];
      let x = x0, z = z0, a = hash(i * 2.3) * Math.PI * 2;
      for (let j = 0; j < 5; j++) {
        pts.push(new THREE.Vector3(x, groundY(x, z) + 0.012, z));
        a += (hash(i * 11 + j) - 0.5) * 1.4;
        x += Math.cos(a) * 0.18;
        z += Math.sin(a) * 0.18;
      }
      parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.008, 3, false));
    }
    return mergeGeometries(parts);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#6a3a22" roughness={0.9} />
    </mesh>
  );
};

/* ---------- path edge stones and dry pebbles ---------- */
const Stones: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 260;
  const geo = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const u = 0.02 + (i / N) * 0.97;
      const right = i % 3 !== 0; // more pebbles on the dry side
      const dx = right ? 0.9 + hash(i * 3.3) * 2.6 : -(2.3 + hash(i * 4.1) * 1.4);
      const x = pathX(u) + dx, z = pathZ(u) + (hash(i * 7.7) - 0.5) * 0.8;
      const s = 0.05 + hash(i * 9.1) * 0.13;
      e.set(hash(i) * 3, hash(i * 2) * 3, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, groundY(x, z) + s * 0.3, z), q, new THREE.Vector3(s, s * 0.6, s * 1.1));
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, c.set(hash(i * 1.9) > 0.5 ? "#a98b6c" : "#cfb595"));
    }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, N]} castShadow receiveShadow>
      <meshPhysicalMaterial roughness={0.7} clearcoat={0.2} />
    </instancedMesh>
  );
};

/* ---------- flowers on the cracked pot's side ---------- */
type Fl = { u: number; x: number; z: number; y: number; h: number; col: string; s: number; rot: number };
const FLOWER_COLS = ["#F08A1C", "#F5A623", "#E9671E", "#FBF3E4", "#F5F0E6", "#D9467A", "#E05A8A", "#F2C230", "#5E5BB8"];
export const FLOWERS: Fl[] = Array.from({ length: 520 }, (_, i) => {
  const u = 0.015 + (i / 520) * 0.975 + (hash(i * 2.9) - 0.5) * 0.004;
  const dx = -(0.92 + Math.pow(hash(i * 6.1), 1.6) * 1.6);
  const z = pathZ(u) + (hash(i * 8.3) - 0.5) * 0.5;
  const x = pathX(u) + dx;
  return { u, x, z, y: groundY(x, z), h: 0.22 + hash(i * 3.7) * 0.32, col: FLOWER_COLS[Math.floor(hash(i * 5.3) * FLOWER_COLS.length)], s: 0.75 + hash(i * 4.4) * 0.6, rot: hash(i * 9.9) * 6.28 };
});
const blossomGeo = () => {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 7; k++) {
    const p = new THREE.SphereGeometry(1, 8, 6);
    p.scale(0.055, 0.014, 0.026);
    p.translate(0.048, 0, 0);
    p.rotateZ(0.32);
    p.rotateY((k / 7) * Math.PI * 2);
    parts.push(p);
  }
  return mergeGeometries(parts);
};
export const Flowers: React.FC<{ t: number }> = ({ t }) => {
  const stems = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const hearts = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const N = FLOWERS.length;
  const g = useMemo(() => ({ stem: new THREE.CylinderGeometry(0.008, 0.011, 1, 5).translate(0, 0.5, 0), head: blossomGeo(), heart: new THREE.SphereGeometry(0.022, 8, 6), leaf: new THREE.SphereGeometry(1, 6, 4).scale(0.05, 0.008, 0.02).translate(0.045, 0, 0) }), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < N; i++) {
      const f = FLOWERS[i];
      const sp = sproutAt(t, f.u);
      const bl = bloomAt(t, f.u);
      if (sp <= 0.001 || heroClear(t, f.x, f.z)) {
        for (const r of [stems, heads, hearts, leaves]) r.current!.setMatrixAt(i, zero);
        continue;
      }
      const h = f.h * sp;
      const wind = Math.sin(t * 1.3 + f.u * 40) * 0.05;
      e.set(wind, 0, wind * 0.6);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(f.x, f.y, f.z), q, new THREE.Vector3(1, h, 1));
      stems.current!.setMatrixAt(i, m);
      const top = new THREE.Vector3(f.x + wind * h * 0.6, f.y + h * Math.cos(wind), f.z - wind * h);
      const open = lerp(0.32, 1, bl) * f.s * clamp(sp * 1.3);
      e.set(-0.25 + wind, f.rot, 0.15);
      q.setFromEuler(e);
      // bud: petals folded up (narrow & tall); bloom: wide & flat
      m.compose(top, q, new THREE.Vector3(open, lerp(2.6, 1, bl) * f.s * clamp(sp * 1.3) * 0.6, open));
      heads.current!.setMatrixAt(i, m);
      m.compose(top.clone().add(new THREE.Vector3(0, 0.006, 0)), q, new THREE.Vector3(1, 1, 1).multiplyScalar(f.s * bl + 0.001));
      hearts.current!.setMatrixAt(i, m);
      e.set(0, f.rot + 1.3, 0.4);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(f.x, f.y + h * 0.35, f.z), q, new THREE.Vector3(1.4, 1.4, 1.4).multiplyScalar(sp));
      leaves.current!.setMatrixAt(i, m);
      // buds read as green-tinted until they open
      heads.current!.setColorAt(i, c.set(f.col).lerp(new THREE.Color("#7f9a4a"), (1 - bl) * 0.75));
    }
    for (const r of [stems, heads, hearts, leaves]) r.current!.instanceMatrix.needsUpdate = true;
    if (heads.current!.instanceColor) heads.current!.instanceColor.needsUpdate = true;
  }, [t, N]);
  return (
    <>
      <instancedMesh ref={stems} args={[g.stem, undefined, N]} frustumCulled={false} castShadow>
        <meshStandardMaterial color="#5f7d3a" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[g.leaf, undefined, N]} frustumCulled={false}>
        <meshPhysicalMaterial color="#6f8f3f" roughness={0.6} clearcoat={0.4} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[g.head, undefined, N]} frustumCulled={false} castShadow>
        <meshPhysicalMaterial roughness={0.45} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.3} />
      </instancedMesh>
      <instancedMesh ref={hearts} args={[g.heart, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial color={PAL.pureGoldLeaf} emissive={PAL.goldEmissive} emissiveIntensity={0.35} metalness={0.8} roughness={0.3} />
      </instancedMesh>
    </>
  );
};

/** grass tufts that come with the water on the flower side */
const Grass: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 700;
  const data = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const u = 0.01 + (i / N) * 0.98;
        const dx = -(0.88 + Math.pow(hash(i * 2.2 + 1), 1.3) * 2.0);
        const z = pathZ(u) + (hash(i * 3.3) - 0.5) * 0.4;
        const x = pathX(u) + dx;
        return { u, x, z, y: groundY(x, z), s: 0.035 + hash(i * 5.5) * 0.05, r: hash(i) * 6 };
      }),
    [],
  );
  const geo = useMemo(() => new THREE.ConeGeometry(1, 2.0, 5).translate(0, 1.0, 0), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    data.forEach((d, i) => {
      const sp = heroClear(t, d.x, d.z) ? 0 : sproutAt(t, d.u);
      e.set(Math.sin(t + d.u * 30) * 0.08, d.r, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(d.x, d.y - 0.01, d.z), q, new THREE.Vector3(d.s, d.s * sp + 0.0001, d.s));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [t, data]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, N]} frustumCulled={false} receiveShadow>
      <meshPhysicalMaterial color="#7d9440" roughness={0.6} clearcoat={0.3} />
    </instancedMesh>
  );
};

/* ---------- the spring ---------- */
const Spring: React.FC<{ t: number }> = ({ t }) => {
  const rocks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const back = Math.cos(a) > 0.2; // the +z half is the rock shelf
        const r = POOL_R + 0.15 + hash(i * 3.1) * 0.25;
        const s = back ? 0.45 + hash(i * 1.7) * 0.6 : 0.16 + hash(i * 2.1) * 0.14;
        return { p: [SPRING[0] + Math.sin(a) * r, back ? s * 0.4 : 0.02, SPRING[2] + Math.cos(a) * r + (back ? 0.3 : 0)] as V3, s, rot: hash(i * 5) * 3, back };
      }),
    [],
  );
  const ripples = [0, 1, 2].map((k) => ((t * 0.45 + k / 3) % 1));
  return (
    <group>
      <mesh position={[SPRING[0], POOL_Y, SPRING[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[POOL_R + 0.1, 64]} />
        <meshPhysicalMaterial color="#3f7d97" roughness={0.06} clearcoat={1} clearcoatRoughness={0.04} transparent opacity={0.88} emissive="#173c4c" emissiveIntensity={0.35} />
      </mesh>
      {ripples.map((r, k) => (
        <mesh key={k} position={[SPRING[0] + 0.4, POOL_Y + 0.004, SPRING[2] + 1.7]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.2 + r * 1.6, 0.2 + r * 1.6, 1]}>
          <ringGeometry args={[0.96, 1, 48]} />
          <meshBasicMaterial color="#d9eef2" transparent opacity={(1 - r) * 0.35} depthWrite={false} />
        </mesh>
      ))}
      {rocks.map((r, i) => (
        <mesh key={i} position={r.p} rotation={[r.rot, r.rot * 2, 0]} scale={[r.s * 1.3, r.s, r.s]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color={r.back ? "#9d8b7a" : "#b9a58d"} roughness={0.75} clearcoat={0.25} flatShading />
        </mesh>
      ))}
      {/* the spring trickles from a crack in the rock shelf */}
      <mesh position={[SPRING[0] + 0.4, 0.6, SPRING[2] + 1.75]}>
        <cylinderGeometry args={[0.03, 0.05, 1.1, 8]} />
        <meshPhysicalMaterial color="#cfe7ee" roughness={0.05} transparent opacity={0.7} clearcoat={1} />
      </mesh>
    </group>
  );
};

/* ---------- house, vat and the table with the bouquet ---------- */
const House: React.FC = () => {
  const vat = useMemo(() => lathe([[0, 0], [0.3, 0], [0.5, 0.25], [0.55, 0.5], [0.45, 0.8], [0.32, 0.92], [0.34, 0.98], [0.28, 0.99], [0.26, 0.9], [0, 0.88]], 48), []);
  const [hx, hy, hz] = HOUSE;
  const plaster = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F1E8D8", roughness: 0.85, sheen: 0.2 }), []);
  const roof = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#A9482A", roughness: 0.6, clearcoat: 0.35, flatShading: true }), []);
  const wood = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#7a4a2a", roughness: 0.6, clearcoat: 0.3 }), []);
  return (
    <group>
      <mesh position={[hx, hy + 1.35, hz]} material={plaster} castShadow receiveShadow>
        <boxGeometry args={[5.2, 2.8, 4]} />
      </mesh>
      {/* indigo dado band */}
      <mesh position={[hx, hy + 0.25, hz + 0.01]}>
        <boxGeometry args={[5.24, 0.5, 4.04]} />
        <meshPhysicalMaterial color={PAL.indigo} roughness={0.8} />
      </mesh>
      <mesh position={[hx, hy + 3.4, hz]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.85]} material={roof} castShadow>
        <coneGeometry args={[4.1, 1.5, 4]} />
      </mesh>
      {/* door + windows */}
      <mesh position={[hx + 0.9, hy + 1.0, hz + 2.01]}>
        <boxGeometry args={[0.9, 1.9, 0.05]} />
        <meshStandardMaterial color="#3b2418" roughness={0.9} />
      </mesh>
      {[-1.4].map((dx) => (
        <mesh key={dx} position={[hx + dx, hy + 1.5, hz + 2.01]}>
          <boxGeometry args={[0.8, 0.7, 0.05]} />
          <meshStandardMaterial color="#2a2340" roughness={0.6} />
        </mesh>
      ))}
      {/* veranda slab + posts + awning */}
      <mesh position={[hx, hy + 0.06, hz + 3.0]} material={plaster} receiveShadow castShadow>
        <boxGeometry args={[5.6, 0.18, 2.2]} />
      </mesh>
      {[-2.5, 2.5].map((dx) => (
        <mesh key={dx} position={[hx + dx, hy + 1.3, hz + 3.9]} material={wood} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 2.5, 10]} />
        </mesh>
      ))}
      <mesh position={[hx, hy + 2.6, hz + 3.1]} rotation={[0.18, 0, 0]} material={roof} castShadow>
        <boxGeometry args={[5.8, 0.08, 2.0]} />
      </mesh>
      {/* the big water vat by the door */}
      <mesh geometry={vat} position={[hx + 2.0, hy + 0.15, hz + 2.6]} scale={1.25} castShadow receiveShadow>
        <meshPhysicalMaterial color={PAL.terracotta} roughness={0.55} clearcoat={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* low table with the kintsugi vase and the bouquet */}
      <group position={TABLE}>
        <mesh position={[0, 0.42, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.07, 0.7]} />
        </mesh>
        {[[-0.48, -0.28], [0.48, -0.28], [-0.48, 0.28], [0.48, 0.28]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} material={wood}>
            <boxGeometry args={[0.06, 0.4, 0.06]} />
          </mesh>
        ))}
        <Vase />
      </group>
    </group>
  );
};

const VASE_P: [number, number][] = [[0, 0], [0.09, 0], [0.13, 0.06], [0.14, 0.14], [0.1, 0.24], [0.06, 0.3], [0.065, 0.36], [0.05, 0.36], [0.045, 0.3], [0, 0.3]];
const Vase: React.FC = () => {
  const geo = useMemo(() => lathe(VASE_P, 48), []);
  const seams = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (let s = 0; s < 3; s++) {
      const pts: THREE.Vector3[] = [];
      let a = s * 2.1;
      for (let i = 0; i <= 10; i++) {
        const h = 0.03 + i * 0.024;
        a += (hash(s * 9 + i) - 0.5) * 0.4;
        let r = 0.1;
        for (let k = 1; k < VASE_P.length; k++) if (h >= VASE_P[k - 1][1] && h <= VASE_P[k][1]) r = lerp(VASE_P[k - 1][0], VASE_P[k][0], (h - VASE_P[k - 1][1]) / (VASE_P[k][1] - VASE_P[k - 1][1]));
        pts.push(new THREE.Vector3((r + 0.003) * Math.sin(a), h, (r + 0.003) * Math.cos(a)));
      }
      out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.0035, 4, false));
    }
    return mergeGeometries(out);
  }, []);
  const gold = useMemo(() => {
    const m = goldMat();
    m.emissiveIntensity = 1.2;
    return m;
  }, []);
  const bouquet = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const a = (i / 15) * Math.PI * 2 * 2.3;
        const r = 0.05 + hash(i * 3) * 0.12;
        return { p: [Math.sin(a) * r, 0.52 + hash(i * 7) * 0.2, Math.cos(a) * r] as V3, col: FLOWER_COLS[i % 6], s: 0.7 + hash(i) * 0.35 };
      }),
    [],
  );
  const head = useMemo(blossomGeo, []);
  return (
    <group position={[0, 0.455, 0]}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color={PAL.porcelainMatte} roughness={0.7} clearcoat={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={seams} material={gold} />
      {bouquet.map((b, i) => (
        <group key={i}>
          <mesh position={[b.p[0] * 0.5, 0.33 + (b.p[1] - 0.33) * 0.5, b.p[2] * 0.5]} scale={[1, 1, 1]}>
            <cylinderGeometry args={[0.005, 0.005, Math.max(0.05, b.p[1] - 0.3), 4]} />
            <meshStandardMaterial color="#5f7d3a" />
          </mesh>
          <mesh geometry={head} position={b.p} rotation={[-0.4 + hash(i) * 0.8, i, 0.3]} scale={b.s}>
            <meshPhysicalMaterial color={b.col} roughness={0.45} clearcoat={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ---------- ceramic trees and far hills ---------- */
const TREES: { p: V3; s: number; c: string }[] = [
  [-6.5, -8], [5.5, -12], [-8, -20], [7.5, -27], [-7, -33], [6.5, -40], [-9.5, -46], [2.5, -57], [-9, -56], [9, -50], [-4, 5], [5.5, 4], [-12, -12], [12, -20],
].map(([x, z], i) => ({ p: [x, groundY(x, z) - 0.05, z] as V3, s: 0.8 + hash(i * 3.3) * 0.6, c: ["#6f7d3c", "#58703a", "#7d8a45", "#B9722F"][i % 4] }));
const Trees: React.FC = () => {
  const trunk = useMemo(() => lathe([[0, 0], [0.22, 0], [0.13, 0.4], [0.11, 1.6], [0.16, 2.0], [0, 2.1]], 16), []);
  return (
    <>
      {TREES.map((tr, i) => (
        <group key={i} position={tr.p} scale={tr.s}>
          <mesh geometry={trunk} castShadow>
            <meshPhysicalMaterial color="#6b4a33" roughness={0.7} clearcoat={0.3} />
          </mesh>
          {[[0, 2.5, 0, 1.25], [0.7, 2.2, 0.3, 0.85], [-0.6, 2.3, -0.2, 0.9], [0.1, 3.1, -0.2, 0.8]].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]} scale={[r, r * 0.78, r]} castShadow receiveShadow>
              <icosahedronGeometry args={[1, 2]} />
              <meshPhysicalMaterial color={tr.c} roughness={0.5} clearcoat={0.6} clearcoatRoughness={0.3} flatShading={k % 2 === 1} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
};
const FarHills: React.FC = () => (
  <>
    {[
      [-40, -95, 40, 14, "#c79a78"], [10, -110, 55, 18, "#b98d79"], [55, -80, 40, 12, "#c9a07e"], [-60, -40, 35, 10, "#c39673"], [60, -20, 30, 9, "#cda27a"], [-45, 20, 30, 7, "#c99b70"], [40, 35, 30, 7, "#c99b70"],
    ].map(([x, z, r, h, c], i) => (
      <mesh key={i} position={[x as number, -3, z as number]} scale={[r as number, h as number, (r as number) * 0.7]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color={c as string} roughness={0.95} />
      </mesh>
    ))}
  </>
);

/* ---------- drops, gold seam, seeds, hero flower ---------- */
const Drops: React.FC<{ t: number }> = ({ t }) => {
  const ds = dropsAt(t);
  return (
    <>
      {ds.map((d, i) =>
        d.splash > 0 ? (
          <mesh key={i} position={d.p} rotation={[-Math.PI / 2, 0, 0]} scale={[0.03 + d.splash * 0.12, 0.03 + d.splash * 0.12, 1]}>
            <ringGeometry args={[0.7, 1, 24]} />
            <meshBasicMaterial color="#d6ecf2" transparent opacity={(1 - d.splash) * 0.8} depthWrite={false} />
          </mesh>
        ) : (
          <mesh key={i} position={d.p} scale={[0.022, 0.03 + d.k * 0.012, 0.022]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshPhysicalMaterial color="#bfe3f0" roughness={0.02} clearcoat={1} emissive="#5ea8c6" emissiveIntensity={0.5} />
          </mesh>
        ),
      )}
    </>
  );
};

/** wet spots left behind on the bare soil by today's leak (before the reveal) */
const WET = Array.from({ length: 260 }, (_, i) => {
  const u = i / 260 + hash(i * 3.7) * 0.002;
  const x = pathX(u) - 1.1 + (hash(i * 5.1) - 0.5) * 0.12, z = pathZ(u);
  return { u, x, z, y: groundY(x, z) + 0.008, s: 0.05 + hash(i * 2.3) * 0.05 };
});
const WetTrail: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const u = uAt(t);
    const show = t < T.s6a - 0.5 && u > 0 && !isTimelapse(t) && t > T.s2d;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    WET.forEach((w, i) => {
      const k = show && w.u < u - 0.003 ? 1 : 0;
      m.compose(new THREE.Vector3(w.x, w.y, w.z), q, new THREE.Vector3(w.s * k + 1e-5, w.s * 0.8 * k + 1e-5, 1));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [t]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, WET.length]} frustumCulled={false}>
      <circleGeometry args={[1, 12]} />
      <meshPhysicalMaterial color="#6a3418" roughness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
    </instancedMesh>
  );
};

const EDGE_DX = -0.9;
export const GoldSeam: React.FC<{ t: number }> = ({ t }) => {
  const k = goldLineAt(t);
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 260; i++) {
      // drawn from the house down to the spring: the path of every drop, made visible
      const u = 1 - i / 260;
      const x = pathX(u) + EDGE_DX + Math.sin(i * 0.9) * 0.05 + (hash(i) - 0.5) * 0.05;
      const z = pathZ(u);
      pts.push(new THREE.Vector3(x, groundY(x, z) + 0.02, z));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.022, 5, false);
  }, []);
  const mat = useMemo(() => goldMat(), []);
  mat.emissiveIntensity = 2.4 + Math.sin(t * 2) * 0.3;
  useLayoutEffect(() => {
    const idx = geo.index!.count;
    geo.setDrawRange(0, Math.floor((idx * k) / 30) * 30);
  }, [geo, k]);
  if (k <= 0.001) return null;
  return <mesh geometry={geo} material={mat} />;
};

const SEEDS = Array.from({ length: 70 }, (_, i) => {
  const u = 0.35 + (i / 70) * 0.4;
  const x = pathX(u) - 0.95 - hash(i * 3.2) * 1.4;
  const z = pathZ(u) + (hash(i * 4.4) - 0.5) * 0.5;
  return { x, z, g: groundY(x, z), t0: hash(i * 7.1) * 0.7 + (1 - (u - 0.35) / 0.4) * 3.0 };
});
const Seeds: React.FC<{ t: number }> = ({ t }) => {
  const w = seedsAt(t);
  if (w <= 0) return null;
  const local = t - (T.s6c + 1.2);
  return (
    <>
      {SEEDS.map((s, i) => {
        const a = local - s.t0;
        if (a < 0) return null;
        const y = Math.max(s.g + 0.02, s.g + 2.2 - a * a * 2.4);
        return (
          <mesh key={i} position={[s.x + Math.sin(a * 3 + i) * 0.05, y, s.z]} scale={0.028 * w}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={PAL.pureGoldLeaf} emissive={PAL.goldEmissive} emissiveIntensity={3} />
          </mesh>
        );
      })}
    </>
  );
};

/** keep the macro clear around the hero sprout */
const heroClear = (t: number, x: number, z: number) => t > T.s6d - 0.8 && t < T.s6e && Math.hypot(x - HERO[0], z - HERO[2]) < 0.75;
/** hero flower for the macro: one sprout drinking one drop and opening */
export const HERO_U = 0.5;
export const HERO: V3 = (() => {
  const x = pathX(HERO_U) - 1.0, z = pathZ(HERO_U);
  return [x, groundY(x, z), z];
})();
const HeroFlower: React.FC<{ t: number }> = ({ t }) => {
  const head = useMemo(blossomGeo, []);
  const a = T.s6d, b = E.s6d;
  if (t < a - 0.5 || t > T.s6e + 0.2) return null;
  const grow = ramp(t, a + 0.4, b - 0.3);
  const open = ramp(t, b - 1.6, b + 0.2);
  const dropY = HERO[1] + 1.6 - Math.pow(Math.max(0, t - a), 2) * 4.9;
  const h = 0.04 + grow * 0.26;
  return (
    <group position={HERO}>
      {dropY > HERO[1] + 0.03 ? (
        <mesh position={[0, dropY, 0]} scale={[0.03, 0.042, 0.03]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshPhysicalMaterial color="#cdeaf3" roughness={0} clearcoat={1} emissive="#5ea8c6" emissiveIntensity={0.6} />
        </mesh>
      ) : null}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.016, h, 6]} />
        <meshStandardMaterial color="#5f7d3a" />
      </mesh>
      <mesh position={[0.03, h * 0.4, 0]} rotation={[0, 0.4, 0.5]} scale={[grow * 0.07, grow * 0.012, grow * 0.03]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshPhysicalMaterial color="#6f8f3f" clearcoat={0.5} />
      </mesh>
      <mesh geometry={head} position={[0, h, 0]} rotation={[-0.3, 0, 0.1]} scale={[lerp(0.5, 1.9, open) * grow, lerp(3.5, 1.9, open) * grow * 0.6, lerp(0.5, 1.9, open) * grow]}>
        <meshPhysicalMaterial color={new THREE.Color("#F08A1C").lerp(new THREE.Color("#7f9a4a"), 1 - open)} roughness={0.4} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, h + 0.012, 0]} scale={0.04 * open + 0.001}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color={PAL.pureGoldLeaf} emissive={PAL.goldEmissive} emissiveIntensity={1.5} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Terrain />
    <DryCracks />
    <Stones />
    <Grass t={t} />
    <Flowers t={t} />
    <Spring t={t} />
    <House />
    <Trees />
    <FarHills />
    <Drops t={t} />
    <WetTrail t={t} />
    <GoldSeam t={t} />
    <Seeds t={t} />
    <HeroFlower t={t} />
  </>
);
export const dimAt = (t: number) => timelapseFlicker(t) * 0.6;
export { pathY };
